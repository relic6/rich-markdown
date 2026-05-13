export function buildSourceMap(source) {
  const text = String(source);
  const lines = text.split("\n");
  const starts = lineStarts(lines);
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (index === 0 && trimmed === "---") {
      const endIndex = findClosingLine(lines, 1, /^---\s*$/);
      if (endIndex !== -1) {
        index = endIndex;
        continue;
      }
    }

    if (!trimmed) {
      continue;
    }

    const block = line.match(/^:::\s*([a-z][a-z0-9-]*)(?:\s+(.*))?\s*$/i);
    if (block) {
      const endIndex = findClosingLine(lines, index + 1, /^:::\s*$/);
      if (endIndex !== -1) {
        entries.push({
          kind: "block",
          blockType: block[1].toLowerCase(),
          from: starts[index],
          to: starts[endIndex] + lines[endIndex].length,
          source: text.slice(starts[index], starts[endIndex] + lines[endIndex].length)
        });
        index = endIndex;
        continue;
      }
    }

    if (/^```/.test(line)) {
      const endIndex = findClosingLine(lines, index + 1, /^```\s*$/);
      if (endIndex !== -1) {
        entries.push({
          kind: "code",
          from: starts[index],
          to: starts[endIndex] + lines[endIndex].length,
          source: text.slice(starts[index], starts[endIndex] + lines[endIndex].length)
        });
        index = endIndex;
        continue;
      }
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      entries.push({
        kind: "heading",
        level: heading[1].length,
        from: starts[index],
        to: starts[index] + line.length,
        source: line,
        text: normalizeText(heading[2])
      });
      continue;
    }

    if (/^(?:---|\*\*\*|___)\s*$/.test(trimmed)) {
      entries.push({
        kind: "thematic-break",
        from: starts[index],
        to: starts[index] + line.length,
        source: line
      });
      continue;
    }

    if (/^(?:[-*+]\s+|\d+[.)]\s+)/.test(line)) {
      const endIndex = collectUntil(lines, index, (candidate) => {
        const value = candidate.trim();
        return !value || isBlockBoundary(candidate);
      });
      entries.push({
        kind: "list",
        from: starts[index],
        to: starts[endIndex] + lines[endIndex].length,
        source: text.slice(starts[index], starts[endIndex] + lines[endIndex].length)
      });
      index = endIndex;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const endIndex = collectUntil(lines, index, (candidate) => {
        const value = candidate.trim();
        return !value || isBlockBoundary(candidate);
      });
      entries.push({
        kind: "blockquote",
        from: starts[index],
        to: starts[endIndex] + lines[endIndex].length,
        source: text.slice(starts[index], starts[endIndex] + lines[endIndex].length)
      });
      index = endIndex;
      continue;
    }

    const endIndex = collectUntil(lines, index, (candidate) => {
      const value = candidate.trim();
      return !value || isBlockBoundary(candidate);
    });
    entries.push({
      kind: "paragraph",
      from: starts[index],
      to: starts[endIndex] + lines[endIndex].length,
      source: text.slice(starts[index], starts[endIndex] + lines[endIndex].length),
      text: normalizeText(lines.slice(index, endIndex + 1).join(" "))
    });
    index = endIndex;
  }

  return entries;
}

export function buildLivePreviewRanges(source, cursor = -1) {
  const text = String(source);
  const entries = buildSourceMap(text);
  if (entries.length === 0) {
    return [];
  }

  // Per-block widgets (Typora-style): every block becomes its own widget.
  // The block under the cursor is skipped so the user sees raw source there
  // and CM6 keeps its native cursor / selection behavior.
  const ranges = [];
  for (const entry of entries) {
    const cursorInside = cursor >= entry.from && cursor <= entry.to;
    if (cursorInside) {
      continue;
    }

    const sliced = text.slice(entry.from, entry.to);
    if (!sliced.trim()) {
      continue;
    }

    ranges.push({
      kind: "live-range",
      blockKind: entry.kind,
      from: entry.from,
      to: entry.to,
      source: sliced
    });
  }

  return ranges;
}

/**
 * Annotate each top-level rendered block with its source offset so split-view
 * clicks can jump back to the right line.
 *
 * The previous implementation queried `p`, `ul,ol`, `blockquote`, etc. across
 * the whole tree and zipped the results to the source-map entries by array
 * index. That breaks the moment the rendered HTML contains nested instances
 * of those tags — a `<p>` inside a callout, a `<p>` inside a `<blockquote>`,
 * a nested `<ul>` inside an `<li>`, etc. — because the source-map only
 * captures top-level blocks. The result was an off-by-N misalignment between
 * entries and elements, so clicking a paragraph could focus the offset of the
 * paragraph that came after it.
 *
 * We now walk **direct children of `.rmd-document` only**, in document order,
 * and pair each child with the next source-map entry whose kind matches the
 * child's tag. Both lists are produced in document order by their generators,
 * so a simple kind-aware merge is enough.
 */
export function annotateRenderedSource(root, sourceMap) {
  const container = resolveDocumentContainer(root);
  if (!container) {
    return;
  }

  const children = collectDirectChildren(container);
  const entries = Array.isArray(sourceMap) ? sourceMap : [];

  let entryIndex = 0;
  for (const element of children) {
    if (entryIndex >= entries.length) {
      break;
    }

    const kind = elementKind(element);
    if (!kind) {
      continue;
    }

    // Advance through entries until we find one matching this element's kind.
    // This tolerates the rare case where the renderer emits a block the
    // source-map didn't catch (or vice versa) without producing wrong offsets
    // for unrelated blocks.
    while (entryIndex < entries.length && entries[entryIndex].kind !== kind) {
      entryIndex += 1;
    }
    if (entryIndex >= entries.length) {
      break;
    }

    const entry = entries[entryIndex];
    if (typeof element.setAttribute === "function") {
      element.setAttribute("data-rmd-source-from", String(entry.from));
      element.setAttribute("data-rmd-source-to", String(entry.to));
    }
    entryIndex += 1;
  }
}

function resolveDocumentContainer(root) {
  if (!root) {
    return null;
  }
  if (typeof root.querySelector === "function") {
    const doc = root.querySelector(".rmd-document");
    if (doc) {
      return doc;
    }
  }
  // Test doubles may pass a node that already represents the document body.
  if (root.children && typeof root.children.length === "number") {
    return root;
  }
  return null;
}

function collectDirectChildren(container) {
  const list = container.children;
  if (!list) {
    return [];
  }
  if (Array.isArray(list)) {
    return list;
  }
  if (typeof list.length === "number") {
    return Array.from(list);
  }
  return [];
}

function elementKind(element) {
  if (!element || !element.tagName) {
    return null;
  }
  if (elementHasBlockAttribute(element)) {
    return "block";
  }
  const tag = String(element.tagName).toLowerCase();
  if (tag === "p") return "paragraph";
  if (tag === "blockquote") return "blockquote";
  if (tag === "ul" || tag === "ol") return "list";
  if (tag === "hr") return "thematic-break";
  if (/^h[1-6]$/.test(tag)) return "heading";
  if (tag === "pre" && elementHasClass(element, "rmd-code")) return "code";
  return null;
}

function elementHasBlockAttribute(element) {
  if (typeof element.hasAttribute === "function") {
    return element.hasAttribute("data-rmd-block");
  }
  // Test doubles expose attributes as a plain object.
  return Boolean(element.attributes && Object.prototype.hasOwnProperty.call(element.attributes, "data-rmd-block"));
}

function elementHasClass(element, name) {
  if (element.classList && typeof element.classList.contains === "function") {
    return element.classList.contains(name);
  }
  const className = element.className ?? (element.attributes && element.attributes.class);
  if (typeof className === "string") {
    return className.split(/\s+/).includes(name);
  }
  return false;
}

function entriesToRange(source, entries, start, end) {
  if (start > end || !entries[start] || !entries[end]) {
    return null;
  }

  const from = entries[start].from;
  const to = entries[end].to;
  const rangeSource = source.slice(from, to);
  if (!rangeSource.trim()) {
    return null;
  }

  return {
    kind: "live-range",
    from,
    to,
    source: rangeSource
  };
}

function lineStarts(lines) {
  const starts = [];
  let offset = 0;
  for (const line of lines) {
    starts.push(offset);
    offset += line.length + 1;
  }
  return starts;
}

function findClosingLine(lines, start, pattern) {
  for (let index = start; index < lines.length; index += 1) {
    if (pattern.test(lines[index])) {
      return index;
    }
  }
  return -1;
}

function collectUntil(lines, start, stop) {
  let end = start;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (stop(lines[index])) {
      return end;
    }
    end = index;
  }
  return end;
}

function isBlockBoundary(line) {
  return /^:::\s*[a-z]/i.test(line)
    || /^```/.test(line)
    || /^(#{1,6})\s+/.test(line)
    || /^(?:---|\*\*\*|___)\s*$/.test(line.trim());
}

function normalizeText(value) {
  return String(value)
    .replace(/[*_`[\]()#>!-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
