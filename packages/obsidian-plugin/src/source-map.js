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

export function annotateRenderedSource(root, sourceMap) {
  annotateBySelector(root, "[data-rmd-block]", sourceMap.filter((entry) => entry.kind === "block"));
  annotateBySelector(root, "h1,h2,h3,h4,h5,h6", sourceMap.filter((entry) => entry.kind === "heading"));
  annotateBySelector(root, "p", sourceMap.filter((entry) => entry.kind === "paragraph"));
  annotateBySelector(root, "pre.rmd-code", sourceMap.filter((entry) => entry.kind === "code"));
  annotateBySelector(root, "blockquote", sourceMap.filter((entry) => entry.kind === "blockquote"));
  annotateBySelector(root, "ul,ol", sourceMap.filter((entry) => entry.kind === "list"));
  annotateBySelector(root, "hr", sourceMap.filter((entry) => entry.kind === "thematic-break"));
}

function annotateBySelector(root, selector, entries) {
  const elements = Array.from(root.querySelectorAll(selector));
  elements.forEach((element, index) => {
    const entry = entries[index];
    if (!entry) {
      return;
    }

    element.setAttribute("data-rmd-source-from", String(entry.from));
    element.setAttribute("data-rmd-source-to", String(entry.to));
  });
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
