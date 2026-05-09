import { codeBlock } from "../../ast/src/index.js";

const IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function parseAttrs(input = "") {
  const positional = [];
  const attrs = {};
  let index = 0;

  while (index < input.length) {
    while (input[index] === " ") {
      index += 1;
    }

    if (index >= input.length) {
      break;
    }

    const keyStart = index;
    while (index < input.length && input[index] !== "=" && input[index] !== " ") {
      index += 1;
    }

    const keyOrValue = input.slice(keyStart, index);

    if (input[index] !== "=") {
      positional.push(keyOrValue);
      continue;
    }

    index += 1;

    let value = "";
    if (input[index] === "\"") {
      index += 1;
      const valueStart = index;
      while (index < input.length && input[index] !== "\"") {
        index += 1;
      }
      value = input.slice(valueStart, index);

      if (input[index] === "\"") {
        index += 1;
      }
    } else {
      const valueStart = index;
      while (index < input.length && input[index] !== " ") {
        index += 1;
      }
      value = input.slice(valueStart, index);
    }

    attrs[keyOrValue] = value;
  }

  return { positional, attrs };
}

export function parseCoreBlock(block, parseChildren) {
  let node;

  switch (block.name) {
    case "chart":
      node = parseChart(block);
      break;
    case "grid":
      node = parseGrid(block, parseChildren);
      break;
    case "callout":
      node = parseCallout(block, parseChildren);
      break;
    case "slider":
      node = parseSlider(block);
      break;
    case "export":
      node = parseExport(block);
      break;
    case "flow":
      node = parseFlow(block);
      break;
    case "diff":
      node = parseDiff(block);
      break;
    case "tabs":
      node = parseTabs(block, parseChildren);
      break;
    case "timeline":
      node = parseTimeline(block, parseChildren);
      break;
    case "kanban":
      node = parseKanban(block, parseChildren);
      break;
    case "details":
      node = parseDetails(block, parseChildren);
      break;
    case "carousel":
      node = parseCarousel(block, parseChildren);
      break;
    case "embed":
      node = parseEmbed(block);
      break;
    case "math":
      node = parseMath(block);
      break;
    default:
      node = unknownBlock(block);
      break;
  }

  if (block.warnings?.length > 0) {
    node.warnings = [...(node.warnings ?? []), ...block.warnings];
  }

  return node;
}

function unknownBlock(block) {
  return codeBlock(block.raw, {
    lang: "rmd",
    raw: block.raw,
    warnings: [`unknown-block: ${block.name}`]
  });
}

function parseChart(block) {
  const { positional, attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["title", "x", "y", "y2", "legend", "tooltip", "emphasis"]);
  const chartType = positional[0];

  const validTypes = ["bar", "line", "pie", "scatter", "radar", "area", "donut", "heatmap"];
  if (!validTypes.includes(chartType)) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: [`chart-invalid-type: ${chartType ?? "missing"}`]
    });
  }

  const data = [];
  const warnings = [];

  for (const line of nonEmptyLines(block.content)) {
    const parts = line.trim().split(/\s+/);
    const values = [];

    while (parts.length > 1 && isNumber(parts[parts.length - 1])) {
      values.unshift(Number(parts.pop()));
    }

    if (parts.length === 0 || values.length === 0) {
      warnings.push(`chart-invalid-row: ${line}`);
      continue;
    }

    data.push({ label: parts.join(" "), values });
  }

  if (data.length === 0) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: ["chart-empty-data"]
    });
  }

  const seriesLength = Math.min(...data.map((point) => point.values.length));
  if (data.some((point) => point.values.length !== seriesLength)) {
    warnings.push("chart-series-mismatch");
    for (const point of data) {
      point.values = point.values.slice(0, seriesLength);
    }
  }

  if (chartType === "pie" && seriesLength !== 1) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: ["chart-pie-requires-single-series"]
    });
  }

  return withOptionalFields(withWarnings({
    type: "chart",
    chartType,
    title: attrs.title ?? null,
    x: attrs.x ?? null,
    y: attrs.y ?? null,
    y2: attrs.y2 ?? null,
    legend: ["top", "bottom", "left", "right", "none"].includes(attrs.legend) ? attrs.legend : "bottom",
    tooltip: attrs.tooltip === "false" ? false : true,
    emphasis: ["primary", "secondary", "none"].includes(attrs.emphasis) ? attrs.emphasis : "none",
    data,
    raw: block.content
  }, warnings), { unknownAttrs });
}

function parseGrid(block, parseChildren) {
  const { positional, attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["gap", "layout"]);
  
  const columnsRaw = positional[0] ?? "1";
  const columnsArr = columnsRaw.split(",").map(Number);
  const columns = columnsArr.length === 1 ? columnsArr[0] : columnsArr;

  const isInvalid = Array.isArray(columns) 
    ? columns.some((c) => !Number.isInteger(c) || c < 1 || c > 12)
    : (!Number.isInteger(columns) || columns < 1 || columns > 12);

  if (isInvalid) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: [`grid-invalid-columns: ${positional[0] ?? "missing"}`]
    });
  }

  const warnings = [];
  let cellSources = splitGridCells(block.content);

  if (cellSources.length > 12) {
    warnings.push("grid-too-many-cells");
    cellSources = cellSources.slice(0, 12);
  }

  if (cellSources.some((cell) => /^:::grid\b/m.test(cell))) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: ["grid-nesting-not-supported"]
    });
  }

  return withOptionalFields(withWarnings({
    type: "grid",
    columns,
    gap: ["sm", "md", "lg"].includes(attrs.gap) ? attrs.gap : "md",
    layout: attrs.layout === "masonry" ? "masonry" : "default",
    cells: cellSources.map((cell) => parseChildren(cell))
  }, warnings), { unknownAttrs });
}

function parseCallout(block, parseChildren) {
  const { positional, attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["title"]);
  const kind = positional[0] ?? "info";

  return withOptionalFields({
    type: "callout",
    kind: ["info", "tip", "warning", "danger", "success"].includes(kind) ? kind : "info",
    title: attrs.title ?? null,
    children: parseChildren(block.content)
  }, { unknownAttrs });
}

function parseSlider(block) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["name", "min", "max", "step", "default", "unit", "label", "scale", "marks"]);
  const name = attrs.name;
  const min = Number(attrs.min);
  const max = Number(attrs.max);
  const step = attrs.step === undefined ? 1 : Number(attrs.step);
  
  let defaultValue = min;
  if (attrs.default !== undefined) {
    const parts = attrs.default.split(",").map(Number);
    defaultValue = parts.length === 1 ? parts[0] : parts;
  }
  const warnings = [];

  if (!IDENTIFIER.test(name ?? "")) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: [`slider-invalid-name: ${name ?? "missing"}`]
    });
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: ["slider-invalid-range"]
    });
  }

  if (!Number.isFinite(step) || step <= 0) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: ["slider-invalid-step"]
    });
  }

  let safeDefault = defaultValue;
  if (Array.isArray(defaultValue)) {
    if (defaultValue.some((v) => !Number.isFinite(v) || v < min || v > max)) {
      warnings.push("slider-default-out-of-range");
      safeDefault = min;
    }
  } else {
    if (!Number.isFinite(defaultValue) || defaultValue < min || defaultValue > max) {
      warnings.push("slider-default-out-of-range");
      safeDefault = min;
    }
  }

  let marks = null;
  if (attrs.marks) {
    marks = attrs.marks.split(",").map(Number).filter(Number.isFinite);
  }

  return withOptionalFields(withWarnings({
    type: "slider",
    name,
    min,
    max,
    step,
    default: safeDefault,
    unit: attrs.unit ?? "",
    label: attrs.label ?? name,
    scale: ["log", "pow"].includes(attrs.scale) ? attrs.scale : "linear",
    marks
  }, warnings), { unknownAttrs });
}

function parseExport(block) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["label", "format"]);
  const format = ["text", "markdown", "json"].includes(attrs.format) ? attrs.format : "text";
  const references = [...new Set([...block.content.matchAll(/{{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*\|[^}]*)?}}/g)].map((match) => match[1]))];

  return withOptionalFields({
    type: "export",
    label: attrs.label ?? "复制",
    format,
    template: block.content.replace(/\n$/, ""),
    references
  }, { unknownAttrs });
}

function parseFlow(block) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["direction"]);
  const edges = [];
  const nodeIds = new Set();

  for (const line of nonEmptyLines(block.content)) {
    const nodes = line.split("->").map((node) => node.trim()).filter(Boolean);
    for (let index = 0; index < nodes.length - 1; index += 1) {
      const from = nodes[index];
      const to = nodes[index + 1];
      nodeIds.add(from);
      nodeIds.add(to);
      edges.push({ from, to });
    }
  }

  if (edges.length === 0) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: ["flow-empty-edges"]
    });
  }

  return withOptionalFields({
    type: "flow",
    direction: attrs.direction === "tb" ? "tb" : "lr",
    nodes: [...nodeIds].map((id) => ({ id })),
    edges
  }, { unknownAttrs });
}

function parseDiff(block) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["lang", "title"]);
  const lines = block.content.split(/\r?\n/).filter((line) => line.length > 0).map((line) => {
    const first = line[0];
    const kind = first === "+" ? "add" : first === "-" ? "remove" : "context";
    const textWithNote = kind === "context" ? line.trimStart() : line.slice(1).trimStart();
    const noteMatch = textWithNote.match(/\s+@注:\s*(.+)$/);

    return {
      kind,
      text: noteMatch ? textWithNote.slice(0, noteMatch.index).trimEnd() : textWithNote,
      note: noteMatch ? noteMatch[1] : null
    };
  });

  return withOptionalFields({
    type: "diff",
    lang: attrs.lang ?? null,
    title: attrs.title ?? null,
    lines
  }, { unknownAttrs });
}

function parseTabs(block, parseChildren) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["default"]);
  const panels = [];
  let current = null;

  for (const line of block.content.split(/\r?\n/)) {
    const label = line.match(/^@(.+?)\s*$/)?.[1];

    if (label) {
      current = { label, source: "" };
      panels.push(current);
      continue;
    }

    if (current) {
      current.source += `${line}\n`;
    }
  }

  if (panels.length === 0) {
    return codeBlock(block.raw, {
      lang: "rmd",
      raw: block.raw,
      warnings: ["tabs-empty-panels"]
    });
  }

  const labels = new Set(panels.map((panel) => panel.label));
  const defaultLabel = labels.has(attrs.default) ? attrs.default : panels[0].label;
  const warnings = attrs.default && !labels.has(attrs.default) ? ["tabs-default-missing"] : [];

  return withOptionalFields(withWarnings({
    type: "tabs",
    default: defaultLabel,
    panels: panels.map((panel) => ({
      label: panel.label,
      children: parseChildren(panel.source.trim())
    }))
  }, warnings), { unknownAttrs });
}

function parseTimeline(block, parseChildren) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["direction"]);
  const items = [];
  let current = null;

  for (const line of block.content.split(/\r?\n/)) {
    const match = line.match(/^@\s+(.*?)(?:\s+\[(.*?)\])?\s*$/);
    
    if (match) {
      if (current) {
        items.push(current);
      }
      
      const time = match[1];
      const attrStr = match[2] ? `[${match[2]}]` : "";
      
      const itemAttrs = {};
      let titleMatch = attrStr.match(/title="([^"]*)"/);
      let statusMatch = attrStr.match(/status="([^"]*)"/);
      
      current = {
        time,
        title: titleMatch ? titleMatch[1] : null,
        status: ["success", "warning", "danger", "pending"].includes(statusMatch?.[1]) ? statusMatch[1] : "default",
        source: ""
      };
      continue;
    }

    if (current) {
      current.source += `${line}\n`;
    }
  }

  if (current) {
    items.push(current);
  }

  return withOptionalFields({
    type: "timeline",
    direction: attrs.direction === "horizontal" ? "horizontal" : "vertical",
    items: items.map((item) => ({
      time: item.time,
      title: item.title,
      status: item.status,
      children: parseChildren(item.source.trim())
    }))
  }, { unknownAttrs });
}

function parseKanban(block, parseChildren) {
  const columns = [];
  let current = null;

  for (const line of block.content.split(/\r?\n/)) {
    const match = line.match(/^@\s+(.*?)\s*$/);
    
    if (match) {
      if (current) {
        columns.push(current);
      }
      current = {
        title: match[1],
        source: ""
      };
      continue;
    }

    if (current) {
      current.source += `${line}\n`;
    }
  }

  if (current) {
    columns.push(current);
  }

  return {
    type: "kanban",
    columns: columns.map((col) => ({
      title: col.title,
      children: parseChildren(col.source.trim())
    }))
  };
}

function parseDetails(block, parseChildren) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["title", "open"]);

  return withOptionalFields({
    type: "details",
    title: attrs.title ?? "",
    open: attrs.open === "true",
    children: parseChildren(block.content)
  }, { unknownAttrs });
}

function parseCarousel(block, parseChildren) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["autoplay", "interval"]);
  const cellSources = splitGridCells(block.content);

  return withOptionalFields({
    type: "carousel",
    autoplay: attrs.autoplay === "true",
    interval: attrs.interval ? Number(attrs.interval) : 3000,
    items: cellSources.map((cell) => parseChildren(cell))
  }, { unknownAttrs });
}

function parseEmbed(block) {
  const { attrs } = parseAttrs(block.attrText);
  const unknownAttrs = pickUnknownAttrs(attrs, ["type", "id", "aspect-ratio"]);

  return withOptionalFields({
    type: "embed",
    embedType: attrs.type ?? "unknown",
    embedId: attrs.id ?? "",
    aspectRatio: attrs["aspect-ratio"] ?? null
  }, { unknownAttrs });
}

function parseMath(block) {
  return {
    type: "math",
    value: block.content.trim()
  };
}

function splitGridCells(content) {
  const cells = [];
  let current = [];

  for (const line of content.split(/\r?\n/)) {
    if (/^---\s*$/.test(line)) {
      cells.push(current.join("\n").trim());
      current = [];
      continue;
    }

    current.push(line);
  }

  cells.push(current.join("\n").trim());
  return cells;
}

function nonEmptyLines(content) {
  return content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function isNumber(value) {
  return value !== "" && Number.isFinite(Number(value));
}

function withWarnings(node, warnings) {
  if (warnings.length > 0) {
    node.warnings = warnings;
  }

  return node;
}

function pickUnknownAttrs(attrs, known) {
  const knownSet = new Set(known);
  const unknownAttrs = {};

  for (const [key, value] of Object.entries(attrs)) {
    if (!knownSet.has(key)) {
      unknownAttrs[key] = value;
    }
  }

  return unknownAttrs;
}

function withOptionalFields(node, fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
      continue;
    }

    node[key] = value;
  }

  return node;
}
