import { RangeSetBuilder, StateField, type EditorState, type Extension } from "@codemirror/state";
import { Decoration, EditorView, WidgetType, type DecorationSet } from "@codemirror/view";
import type { RenderHostOptions } from "./types";
import { createRmdHost } from "./view-renderer";
import { scanFencedBlocksText } from "./scanner.js";
import { buildLivePreviewRanges } from "./source-map.js";

type RmdLiveMode = "fenced" | "document";

type LiveRange = {
  from: number;
  to: number;
  source: string;
  blockKind?: string;
};

class RmdBlockWidget extends WidgetType {
  constructor(
    private readonly range: LiveRange,
    private readonly options: RenderHostOptions
  ) {
    super();
  }

  toDOM() {
    const host = createRmdHost(this.range.source, this.options);
    const kind = this.range.blockKind ?? "block";
    host.classList.add("rmd-live-render-host", `rmd-live-kind-${kind}`);
    host.setAttribute("data-rmd-live-from", String(this.range.from));
    host.setAttribute("data-rmd-live-to", String(this.range.to));
    host.setAttribute("data-rmd-live-kind", kind);

    // Tight CSS so adjacent per-block widgets visually flow as one document.
    // Markdown-class blocks (heading/paragraph/list/quote/code) need
    // basically zero vertical chrome — they live next to source text and
    // must not look like detached cards. ::: blocks keep their own padding
    // because they ARE meant to feel like widgets.
    const style = document.createElement("style");
    style.textContent = isRmdBlockKind(kind) ? richBlockCss : markdownBlockCss;
    host.shadowRoot?.appendChild(style);
    return host;
  }

  eq(other: RmdBlockWidget) {
    return other.range.from === this.range.from
      && other.range.to === this.range.to
      && other.range.source === this.range.source
      && other.range.blockKind === this.range.blockKind
      && other.options.themeCss === this.options.themeCss
      && other.options.themeId === this.options.themeId;
  }

  ignoreEvent() {
    return false;
  }

  get estimatedHeight() {
    // Cheap heuristic so CM6 reserves vertical space and doesn't jitter.
    const lines = Math.max(1, this.range.source.split("\n").length);
    return Math.min(420, 28 + lines * 24);
  }
}

// CSS used inside the Shadow DOM of widgets that wrap a single ::: block.
// Theme styles keep their full padding/border so they look like first-class
// rich widgets, but we strip the outer .rmd-document chrome.
const richBlockCss = `
:host { display: block; background: transparent !important; margin: 6px 0; }
.rmd-document {
  max-width: none;
  margin: 0;
  padding: 0;
  font-size: inherit;
  line-height: inherit;
  background: transparent !important;
}
.rmd-document > :first-child { margin-top: 0; }
.rmd-document > :last-child { margin-bottom: 0; }
.rmd-block { margin: 0; }
`.trim();

// CSS used inside the Shadow DOM of widgets that wrap a single CommonMark
// block (heading / paragraph / list / blockquote / code-block / hr).
// These should look like Obsidian's own rendered markdown — zero outer
// chrome, transparent background, native-looking fonts.
const markdownBlockCss = `
:host { display: block; background: transparent !important; margin: 0; }
.rmd-document {
  max-width: none;
  margin: 0;
  padding: 0;
  background: transparent !important;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.6;
  color: var(--text-normal, inherit);
}
.rmd-document > :first-child { margin-top: 0; }
.rmd-document > :last-child { margin-bottom: 0; }
.rmd-document h1 { font-size: 1.9em; margin: 0.35em 0 0.45em; padding-bottom: 0.4em; }
.rmd-document h2 { font-size: 1.45em; margin: 1em 0 0.4em; }
.rmd-document h3 { font-size: 1.2em; margin: 0.85em 0 0.35em; }
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 { margin: 0.7em 0 0.3em; }
.rmd-document p,
.rmd-document ul,
.rmd-document ol,
.rmd-document blockquote { margin: 0 0 0.6em; }
.rmd-document blockquote {
  border-left: 3px solid var(--background-modifier-border, #d0d0d0);
  padding: 0.1em 0 0.1em 0.9em;
  color: var(--text-muted, inherit);
}
.rmd-document hr {
  border: 0;
  border-top: 1px solid var(--background-modifier-border, #d0d0d0);
  margin: 1.2em 0;
}
.rmd-document pre,
.rmd-document code {
  font-family: var(--font-monospace, ui-monospace, monospace);
}
`.trim();

function isRmdBlockKind(kind: string): boolean {
  // Anything coming from a ::: fenced container is "rich"; everything else
  // is plain markdown. The source-map labels ::: as "block".
  return kind === "block";
}

export function rmdLiveExtension(
  getOptions: () => RenderHostOptions,
  isEnabled: () => boolean = () => true,
  mode: RmdLiveMode = "fenced"
): Extension {
  const field = StateField.define<DecorationSet>({
    create(state) {
      return buildDecorations(state, getOptions(), isEnabled(), mode);
    },
    update(value, tr) {
      if (!tr.docChanged && !tr.selection) {
        return value;
      }
      return buildDecorations(tr.state, getOptions(), isEnabled(), mode);
    },
    provide: (field) => EditorView.decorations.from(field)
  });

  return [
    field,
    EditorView.domEventHandlers({
      mousedown(event, view) {
        if (!isEnabled()) {
          return false;
        }

        const target = event.target instanceof Element ? event.target : null;
        const host = target?.closest(".rmd-live-render-host");
        if (!host) {
          return false;
        }

        const from = Number(host.getAttribute("data-rmd-live-from"));
        if (!Number.isFinite(from)) {
          return false;
        }

        const position = Math.min(Math.max(from, 0), view.state.doc.length);
        event.preventDefault();
        view.dispatch({
          selection: { anchor: position },
          effects: EditorView.scrollIntoView(position, { y: "center" })
        });
        view.focus();
        return true;
      }
    })
  ];
}

function buildDecorations(
  state: EditorState,
  options: RenderHostOptions,
  enabled: boolean,
  mode: RmdLiveMode
): DecorationSet {
  if (!enabled) {
    return Decoration.none;
  }

  const builder = new RangeSetBuilder<Decoration>();
  const source = state.doc.toString();
  const cursor = state.selection.main.head;
  const ranges = getLiveRanges(source, cursor, mode);

  for (const range of ranges) {
    if (!range.source.trim()) {
      continue;
    }

    builder.add(range.from, range.to, Decoration.replace({
      widget: new RmdBlockWidget(range, options),
      block: true
    }));
  }

  return builder.finish();
}

function getLiveRanges(source: string, cursor: number, mode: RmdLiveMode): LiveRange[] {
  if (mode === "document") {
    const ranges: LiveRange[] = [];
    for (const range of buildLivePreviewRanges(source, cursor)) {
      if (!range) {
        continue;
      }
      ranges.push({
        from: Number(range.from),
        to: Number(range.to),
        source: String(range.source),
        blockKind: range.blockKind ? String(range.blockKind) : "block"
      });
    }
    return ranges;
  }

  return scanFencedBlocksText(source, cursor)
    .filter((block) => !block.cursorInside)
    .map((block) => ({
      from: block.from,
      to: block.to,
      source: block.source,
      blockKind: "block"
    }));
}
