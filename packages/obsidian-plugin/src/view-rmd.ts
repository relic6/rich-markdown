import { setIcon, TextFileView, WorkspaceLeaf } from "obsidian";
import { EditorState, type Extension } from "@codemirror/state";
import { drawSelection, EditorView } from "@codemirror/view";
import type RichMarkdownPlugin from "./main";
import type { RmdDisplayMode, RmdSettings, ThemeChoice } from "./types";
import { rmdLiveExtension } from "./live-preview";
import { createRmdHost, updateRmdHost } from "./view-renderer";
import { annotateRenderedSource, buildSourceMap } from "./source-map.js";
import { readDocumentThemeChoice, THEME_CHOICES, writeDocumentThemeChoice } from "./theme-frontmatter.js";

export const RMD_VIEW_TYPE = "rich-markdown-view";

export class RmdView extends TextFileView {
  private editor: EditorView | null = null;
  private renderHost: HTMLElement | null = null;
  private previewPane: HTMLElement | null = null;
  private displayMode: RmdDisplayMode;
  private renderTimer: number | null = null;
  private sourceData = "";
  private syncingScroll = false;
  private modeToggleEl: HTMLElement | null = null;
  private themeSelectEl: HTMLSelectElement | null = null;

  constructor(leaf: WorkspaceLeaf, private readonly plugin: RichMarkdownPlugin) {
    super(leaf);
    this.displayMode = plugin.settings.defaultMode;
    this.addModeToggleAction();
    this.addThemeSelectAction();
  }

  getViewType() {
    return RMD_VIEW_TYPE;
  }

  getDisplayText() {
    return this.file?.basename ?? "Rich Markdown";
  }

  getIcon() {
    return "file-text";
  }

  getViewData(): string {
    return this.editor?.state.doc.toString() ?? this.sourceData;
  }

  setViewData(data: string, clear: boolean): void {
    this.sourceData = data;
    if (clear) {
      this.clear();
    }
    this.mountUi();
    if (this.editor) {
      this.replaceEditorDocument(data);
      // Focus the editor so CM6's drawSelection() cursor becomes visible
      // immediately. Without this the cursor only appears after the user
      // clicks into the editor, which feels broken.
      this.focusEditorSoon();
    }
    this.requestRender();
    this.updateModeToggle();
    this.updateThemeSelect();
  }

  clear(): void {
    if (this.renderTimer !== null) {
      window.clearTimeout(this.renderTimer);
      this.renderTimer = null;
    }

    this.contentEl.empty();
    this.editor?.destroy();
    this.editor = null;
    this.renderHost = null;
    this.previewPane = null;
  }

  setDisplayMode(mode: RmdDisplayMode) {
    if (this.displayMode === mode) {
      return;
    }

    const current = this.getViewData();
    this.displayMode = mode;
    this.clear();
    this.sourceData = current;
    this.mountUi();
    if (this.editor) {
      this.replaceEditorDocument(current);
      this.focusEditorSoon();
    }
    this.requestRender();
  }

  refreshFromSettings(_settings: RmdSettings) {
    if (this.displayMode === "live") {
      const current = this.getViewData();
      this.clear();
      this.sourceData = current;
      this.mountUi();
    }
    this.updateThemeSelect();
    this.requestRender();
  }

  private mountUi() {
    if (this.renderHost || this.editor) {
      return;
    }

    const root = this.contentEl;
    root.empty();
    root.className = "";
    root.addClass("rmd-view", `rmd-mode-${this.displayMode}`);
    this.updateModeToggle();

    if (this.displayMode === "preview") {
      const preview = root.createDiv({ cls: "rmd-pane rmd-pane-preview" });
      this.previewPane = preview;
      this.renderHost = createRmdHost(this.sourceData, this.getRenderOptions());
      preview.appendChild(this.renderHost);
      return;
    }

    if (this.displayMode === "split") {
      const sourcePane = root.createDiv({ cls: "rmd-pane rmd-pane-source" });
      const previewPane = root.createDiv({ cls: "rmd-pane rmd-pane-preview" });
      this.previewPane = previewPane;
      this.editor = this.createSourceEditor(sourcePane);
      this.renderHost = createRmdHost(this.sourceData, this.getRenderOptions());
      previewPane.appendChild(this.renderHost);
      this.annotatePreview();
      this.bindPreviewClick();
      this.bindSplitScrollSync();
      return;
    }

    const sourcePane = root.createDiv({ cls: "rmd-pane rmd-pane-source rmd-live-editor" });
    this.editor = this.createSourceEditor(sourcePane, [
      rmdLiveExtension(
        () => this.getRenderOptions(),
        () => true,
        "document"
      )
    ]);
  }

  private createSourceEditor(parent: HTMLElement, extraExtensions: Extension[] = []) {
    const state = EditorState.create({
      doc: this.sourceData,
      extensions: [
        EditorView.lineWrapping,
        sourceEditorTheme,
        drawSelection(),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) {
            return;
          }

          this.sourceData = update.state.doc.toString();
          this.updateThemeSelect();
          this.requestRender();
          this.requestSave();
        }),
        ...extraExtensions
      ]
    });

    const editor = new EditorView({
      state,
      parent
    });

    editor.dom.classList.add("rmd-source-editor");
    return editor;
  }

  /**
   * Single cycling toggle in the top-right action bar.
   *
   * Mirrors Obsidian's built-in Markdown view toggle (Reading ↔ Source) but
   * cycles through three modes: live → split → preview → live.
   *
   * The icon and tooltip describe the NEXT mode (what clicking will do),
   * matching Obsidian's convention so the user can predict the action.
   */
  private addModeToggleAction() {
    this.modeToggleEl = this.addAction(
      modeNextIcon(this.displayMode),
      modeNextTooltip(this.displayMode),
      () => this.cycleDisplayMode()
    );
    this.modeToggleEl.addClass("rmd-view-action", "rmd-view-mode-toggle");
    this.updateModeToggle();
  }

  private updateModeToggle() {
    if (!this.modeToggleEl) {
      return;
    }
    setActionIcon(this.modeToggleEl, modeNextIcon(this.displayMode));
    this.modeToggleEl.setAttribute("aria-label", modeNextTooltip(this.displayMode));
    this.modeToggleEl.setAttribute("data-rmd-current-mode", this.displayMode);
  }

  private cycleDisplayMode() {
    this.setDisplayMode(MODE_CYCLE[this.displayMode]);
  }

  private addThemeSelectAction() {
    const select = document.createElement("select");
    select.className = "rmd-view-theme-select";
    select.setAttribute("aria-label", "Rich Markdown theme");
    select.title = "Rich Markdown theme";

    for (const choice of THEME_CHOICES) {
      const option = document.createElement("option");
      option.value = choice;
      option.textContent = themeLabel(choice);
      select.append(option);
    }

    select.addEventListener("change", () => {
      void this.setDocumentTheme(select.value as ThemeChoice);
    });

    this.themeSelectEl = select;
    this.modeToggleEl?.parentElement?.insertBefore(select, this.modeToggleEl);
    this.updateThemeSelect();
  }

  private updateThemeSelect() {
    if (!this.themeSelectEl) {
      return;
    }

    this.themeSelectEl.value = this.currentThemeChoice();
  }

  private currentThemeChoice(): ThemeChoice {
    return (readDocumentThemeChoice(this.getViewData()) ?? this.plugin.settings.theme) as ThemeChoice;
  }

  private async setDocumentTheme(theme: ThemeChoice) {
    const current = this.getViewData();
    const next = writeDocumentThemeChoice(current, theme);
    if (next === current) {
      this.updateThemeSelect();
      this.requestRender();
      return;
    }

    this.sourceData = next;
    if (this.editor) {
      this.replaceEditorDocument(next);
    } else {
      this.requestSave();
      this.requestRender();
    }
    this.updateThemeSelect();
  }

  private replaceEditorDocument(data: string) {
    if (!this.editor) {
      return;
    }

    const length = this.editor.state.doc.length;
    this.editor.dispatch({
      changes: { from: 0, to: length, insert: data }
    });
  }

  private focusEditorSoon() {
    // Defer to the next frame so Obsidian finishes its own focus management
    // (it tends to focus the leaf header right after opening a file, which
    // would steal focus back from us if we called focus() synchronously).
    window.requestAnimationFrame(() => {
      this.editor?.focus();
    });
  }

  private requestRender() {
    if (this.renderTimer !== null) {
      window.clearTimeout(this.renderTimer);
    }

    this.renderTimer = window.setTimeout(() => {
      this.renderTimer = null;
      this.doRender();
    }, this.plugin.settings.debounceMs);
  }

  private doRender() {
    this.sourceData = this.getViewData();
    if (!this.renderHost || this.displayMode === "live") {
      return;
    }

    updateRmdHost(this.renderHost, this.sourceData, this.getRenderOptions());
    this.annotatePreview();
  }

  private getRenderOptions() {
    return this.plugin.getRenderOptions(this.file?.path, this.currentThemeChoice());
  }

  private annotatePreview() {
    if (!this.renderHost?.shadowRoot) {
      return;
    }

    annotateRenderedSource(this.renderHost.shadowRoot, buildSourceMap(this.sourceData));
  }

  private bindPreviewClick() {
    if (!this.renderHost || !this.editor) {
      return;
    }

    this.renderHost.addEventListener("click", (event) => {
      const target = findSourceMappedElement(event);
      if (!target) {
        return;
      }

      const from = Number(target.getAttribute("data-rmd-source-from"));
      if (!Number.isFinite(from)) {
        return;
      }

      this.focusSourceAt(from);
    });
  }

  private focusSourceAt(position: number) {
    if (!this.editor) {
      return;
    }

    const pos = Math.min(Math.max(position, 0), this.editor.state.doc.length);
    this.editor.dispatch({
      selection: { anchor: pos },
      effects: EditorView.scrollIntoView(pos, { y: "center" })
    });
    this.editor.focus();
  }

  private bindSplitScrollSync() {
    if (!this.editor || !this.previewPane) {
      return;
    }

    const sourceScroll = this.editor.scrollDOM;
    const previewScroll = this.previewPane;
    sourceScroll.addEventListener("scroll", () => this.syncScroll(sourceScroll, previewScroll));
    previewScroll.addEventListener("scroll", () => this.syncScroll(previewScroll, sourceScroll));
  }

  private syncScroll(from: HTMLElement, to: HTMLElement) {
    if (this.syncingScroll) {
      return;
    }

    const fromMax = from.scrollHeight - from.clientHeight;
    const toMax = to.scrollHeight - to.clientHeight;
    if (fromMax <= 0 || toMax <= 0) {
      return;
    }

    this.syncingScroll = true;
    to.scrollTop = (from.scrollTop / fromMax) * toMax;
    window.requestAnimationFrame(() => {
      this.syncingScroll = false;
    });
  }
}

function themeLabel(choice: string): string {
  switch (choice) {
    case "auto": return "Auto";
    case "default": return "Default";
    case "tech-dark": return "Tech Dark";
    case "paper": return "Paper";
    case "notion-like": return "Notion-like";
    default: return choice;
  }
}

// Minimal theme. We deliberately do NOT override CM6's `.cm-cursor` display
// or the cursor layer beyond the bare necessities — CM6's built-in blink
// animation is keyed on `.cm-focused` and any `display: block` override here
// will fight it and make the cursor effectively invisible.
//
// We only:
//   1. Set the editable surface's caret-color (browser-native fallback caret).
//   2. Tint the drawSelection() cursor to Obsidian's interactive accent so
//      the user can actually see it on dark themes.
const sourceEditorTheme = EditorView.theme({
  "&": {
    height: "100%",
    minHeight: "100%",
    backgroundColor: "var(--background-primary)",
    color: "var(--text-normal)"
  },
  ".cm-scroller": {
    fontFamily: "var(--font-monospace)",
    lineHeight: "1.6"
  },
  ".cm-content": {
    caretColor: "var(--interactive-accent)",
    minHeight: "100%"
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--interactive-accent)",
    borderLeftWidth: "2px"
  }
});

function findSourceMappedElement(event: MouseEvent): HTMLElement | null {
  const path = event.composedPath();
  for (const item of path) {
    if (item instanceof HTMLElement && item.hasAttribute("data-rmd-source-from")) {
      return item;
    }
  }
  return null;
}

/**
 * Mode cycle: clicking the toggle moves us to the next mode in this map.
 * live → split → preview → live → ...
 */
const MODE_CYCLE: Record<RmdDisplayMode, RmdDisplayMode> = {
  live: "split",
  split: "preview",
  preview: "live"
};

/**
 * Icon for the toggle button — shows the icon of the NEXT mode (what the
 * click will do), matching Obsidian's own Reading/Source toggle convention.
 *
 * Icon names map to Lucide icons that ship with Obsidian.
 */
function modeNextIcon(current: RmdDisplayMode): string {
  switch (MODE_CYCLE[current]) {
    case "live":    return "pencil-line";        // pencil with line — editing
    case "split":   return "panel-left-close";   // dual pane glyph
    case "preview": return "book-open";          // open book — reading
    default:        return "eye";
  }
}

function modeNextTooltip(current: RmdDisplayMode): string {
  const next = MODE_CYCLE[current];
  const labelOf = (mode: RmdDisplayMode) => mode === "live"
    ? "Live"
    : mode === "split"
      ? "Split"
      : "Preview";
  return `Switch to ${labelOf(next)} view (currently ${labelOf(current)})`;
}

/**
 * Update the icon of an existing action button without recreating it.
 * Uses Obsidian's setIcon() which replaces the inner SVG; we also stamp a
 * data-icon attribute so our CSS can key off it (and so tests that don't
 * shim setIcon still see the change).
 */
function setActionIcon(el: HTMLElement, iconName: string) {
  el.empty();
  el.setAttribute("data-icon", iconName);
  setIcon(el, iconName);
}
