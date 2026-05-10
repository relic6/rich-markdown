export function scanFencedBlocksText(source, cursor = -1) {
  const lines = String(source).split("\n");
  const lineStarts = [];
  let offset = 0;

  for (const line of lines) {
    lineStarts.push(offset);
    offset += line.length + 1;
  }

  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^```\s*(?:rmd|rich-markdown)\s*$/i.test(line)) {
      let endIndex = -1;
      for (let scan = index + 1; scan < lines.length; scan += 1) {
        if (/^```\s*$/.test(lines[scan])) {
          endIndex = scan;
          break;
        }
      }

      if (endIndex === -1) {
        continue;
      }

      const from = lineStarts[index];
      const to = lineStarts[endIndex] + lines[endIndex].length;
      const sourceStart = lineStarts[index + 1];
      const sourceEnd = lineStarts[endIndex] - 1;
      blocks.push({
        from,
        to,
        source: source.slice(sourceStart, sourceEnd),
        cursorInside: cursor >= from && cursor <= to
      });
      index = endIndex;
      continue;
    }

    if (!/^:::\s*[a-z][a-z0-9-]*(?:\s+.*)?$/i.test(line)) {
      continue;
    }

    let endIndex = -1;
    for (let scan = index + 1; scan < lines.length; scan += 1) {
      if (/^:::\s*$/.test(lines[scan])) {
        endIndex = scan;
        break;
      }
    }

    if (endIndex === -1) {
      continue;
    }

    const from = lineStarts[index];
    const to = lineStarts[endIndex] + lines[endIndex].length;
    blocks.push({
      from,
      to,
      source: source.slice(from, to),
      cursorInside: cursor >= from && cursor <= to
    });
    index = endIndex;
  }

  return blocks;
}
