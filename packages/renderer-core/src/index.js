import { parse } from "../../parser-core/src/index.js";

export function renderToString(input, options = {}) {
  const ast = typeof input === "string" ? parse(input) : input;
  const theme = options.theme ?? ast.frontmatter?.theme ?? "default";
  const body = renderFragmentToString(ast);
  const title = ast.frontmatter?.title ? escapeHtml(ast.frontmatter.title) : "";

  return [
    "<!doctype html>",
    `<html lang="${escapeAttr(ast.frontmatter?.lang ?? "zh-CN")}">`,
    "<head>",
    "<meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    title ? `<title>${title}</title>` : "",
    "</head>",
    `<body data-rmd-theme="${escapeAttr(theme)}">`,
    `<main class="rmd-document" data-rmd-version="${escapeAttr(ast.version)}">`,
    body,
    "</main>",
    "</body>",
    "</html>"
  ].filter(Boolean).join("\n");
}

export function renderFragmentToString(input) {
  const ast = typeof input === "string" ? parse(input) : input;
  return renderChildren(ast.children ?? []);
}

export function renderNode(node) {
  switch (node.type) {
    case "heading":
      return renderHeading(node);
    case "paragraph":
      return `<p>${renderInline(node.children)}</p>`;
    case "code-block":
      return renderCodeBlock(node);
    case "blockquote":
      return `<blockquote>${renderChildren(node.children)}</blockquote>`;
    case "list":
      return renderList(node);
    case "list-item":
      return `<li>${renderChildren(node.children)}</li>`;
    case "thematic-break":
      return "<hr>";
    case "html-block":
      return escapeHtml(node.value);
    case "chart":
      return renderChart(node);
    case "grid":
      return renderGrid(node);
    case "card":
      return renderCard(node);
    case "callout":
      return renderCallout(node);
    case "slider":
      return renderSlider(node);
    case "export":
      return renderExport(node);
    case "flow":
      return renderFlow(node);
    case "diff":
      return renderDiff(node);
    case "tabs":
      return renderTabs(node);
    case "timeline":
      return renderTimeline(node);
    case "kanban":
      return renderKanban(node);
    case "details":
      return renderDetails(node);
    case "carousel":
      return renderCarousel(node);
    case "embed":
      return renderEmbed(node);
    case "math":
      return renderMath(node);
    default:
      return renderUnknownNode(node);
  }
}

function renderChildren(children) {
  return children.map((node) => renderNode(node)).join("\n");
}

function renderHeading(node) {
  const level = Math.min(Math.max(node.level, 1), 6);
  return `<h${level}>${renderInline(node.children)}</h${level}>`;
}

function renderInline(children = []) {
  return children.map((node) => {
    switch (node.type) {
      case "text":
        return escapeHtml(node.value);
      case "strong":
        return `<strong>${renderInline(node.children)}</strong>`;
      case "emph":
        return `<em>${renderInline(node.children)}</em>`;
      case "inline-code":
        return `<code>${escapeHtml(node.value)}</code>`;
      case "link":
        return `<a href="${escapeAttr(node.url)}">${renderInline(node.children)}</a>`;
      case "image":
        return `<img src="${escapeAttr(node.url)}" alt="${escapeAttr(node.alt ?? "")}">`;
      case "soft-break":
        return "\n";
      case "hard-break":
        return "<br>";
      case "inline-html":
        return escapeHtml(node.value);
      default:
        return escapeHtml(node.value ?? "");
    }
  }).join("");
}

function renderCodeBlock(node) {
  const langClass = node.lang ? ` class="language-${escapeAttr(node.lang)}"` : "";
  const warningAttr = renderWarningsAttr(node);
  return `<pre class="rmd-code"${warningAttr}><code${langClass}>${escapeHtml(node.value)}</code></pre>`;
}

function renderList(node) {
  const tag = node.ordered ? "ol" : "ul";
  const start = node.ordered && node.start && node.start !== 1 ? ` start="${escapeAttr(String(node.start))}"` : "";
  return `<${tag}${start}>${node.children.map((item) => renderNode(item)).join("")}</${tag}>`;
}

function renderChart(node) {
  const chart = renderChartGeometry(node);

  const y2Attr = node.y2 ? ` data-y2="${escapeAttr(node.y2)}"` : "";
  const legendAttr = ` data-legend="${escapeAttr(node.legend || "bottom")}"`;
  const tooltipAttr = node.tooltip === false ? ` data-tooltip="false"` : "";

  return [
    `<section class="rmd-block rmd-chart rmd-chart-${escapeAttr(node.chartType)}" data-rmd-block="chart"${y2Attr}${legendAttr}${tooltipAttr}>`,
    node.title ? `<h3 class="rmd-block-title">${escapeHtml(node.title)}</h3>` : "",
    `<svg role="img" viewBox="0 0 ${chart.width} ${chart.height}" class="rmd-chart-svg">`,
    node.title ? `<title>${escapeHtml(node.title)}</title>` : "<title>Chart</title>",
    `<desc>${escapeHtml(chartDescription(node))}</desc>`,
    chart.body,
    "</svg>",
    "</section>"
  ].filter(Boolean).join("");
}

function renderChartGeometry(node) {
  switch (node.chartType) {
    case "line":
      return renderLineChart(node);
    case "pie":
      return renderPieChart(node, false);
    case "scatter":
      return renderScatterChart(node);
    case "radar":
      return renderRadarChart(node);
    case "area":
      return renderAreaChart(node);
    case "donut":
      return renderPieChart(node, true);
    case "heatmap":
      return renderHeatmapChart(node);
    case "bar":
    default:
      return renderBarChart(node);
  }
}

function renderBarChart(node) {
  const metrics = chartMetrics(node);
  const slot = metrics.plotWidth / Math.max(node.data.length, 1);
  const barWidth = Math.max(18, Math.min(42, slot * 0.56));
  const body = node.data.map((point, index) => {
    const value = point.values[0] ?? 0;
    const x = Math.round(metrics.left + index * slot + (slot - barWidth) / 2);
    const y = Math.round(scaleY(value, metrics));
    const height = Math.max(4, Math.round(metrics.bottom - y));
    return [
      chartPointOpen(point, value),
      `<rect x="${x}" y="${metrics.bottom - height}" width="${Math.round(barWidth)}" height="${height}" rx="4"></rect>`,
      `<text x="${x + barWidth / 2}" y="${metrics.labelY}" text-anchor="middle">${escapeHtml(point.label)}</text>`,
      `<text x="${x + barWidth / 2}" y="${metrics.bottom - height - 8}" text-anchor="middle">${escapeHtml(formatChartValue(value))}</text>`,
      "</g>"
    ].join("");
  }).join("");
  return { width: metrics.width, height: metrics.height, body };
}

function renderLineChart(node) {
  const metrics = chartMetrics(node, { useAllValues: true });
  const series = seriesValues(node);
  const body = [
    renderAxisLabels(node, metrics),
    ...series.map((values, seriesIndex) => {
      const points = values.map((value, index) => `${scaleX(index, node.data.length, metrics)},${scaleY(value, metrics)}`).join(" ");
      const markers = values.map((value, index) => {
        const point = node.data[index];
        return [
          chartPointOpen(point, value, seriesIndex),
          `<circle cx="${scaleX(index, node.data.length, metrics)}" cy="${scaleY(value, metrics)}" r="4" style="fill: ${chartColor(seriesIndex)}"></circle>`,
          "</g>"
        ].join("");
      }).join("");
      return `<polyline class="rmd-chart-line-path" points="${points}" fill="none" stroke="${chartColor(seriesIndex)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>${markers}`;
    }),
    renderCategoryLabels(node, metrics)
  ].join("");
  return { width: metrics.width, height: metrics.height, body };
}

function renderAreaChart(node) {
  const metrics = chartMetrics(node, { useAllValues: true });
  const series = seriesValues(node);
  const body = [
    renderAxisLabels(node, metrics),
    ...series.map((values, seriesIndex) => {
      const topLine = values.map((value, index) => `${scaleX(index, node.data.length, metrics)},${scaleY(value, metrics)}`).join(" L ");
      const lastX = scaleX(values.length - 1, node.data.length, metrics);
      const firstX = scaleX(0, node.data.length, metrics);
      const d = `M ${topLine} L ${lastX},${metrics.bottom} L ${firstX},${metrics.bottom} Z`;
      const linePoints = values.map((value, index) => `${scaleX(index, node.data.length, metrics)},${scaleY(value, metrics)}`).join(" ");
      return [
        `<path class="rmd-chart-area-fill" d="${d}" style="fill: ${chartColor(seriesIndex)}; opacity: ${seriesIndex === 0 ? "0.22" : "0.14"}"></path>`,
        `<polyline class="rmd-chart-line-path" points="${linePoints}" fill="none" stroke="${chartColor(seriesIndex)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>`
      ].join("");
    }),
    renderCategoryLabels(node, metrics)
  ].join("");
  return { width: metrics.width, height: metrics.height, body };
}

function renderScatterChart(node) {
  const metrics = chartMetrics(node);
  const xValues = node.data.map((point, index) => point.values[0] ?? index);
  const yValues = node.data.map((point) => point.values[1] ?? point.values[0] ?? 0);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const body = [
    renderAxisLabels(node, metrics),
    ...node.data.map((point, index) => {
      const xValue = xValues[index];
      const yValue = yValues[index];
      const cx = scaleLinear(xValue, xMin, xMax, metrics.left, metrics.right);
      const cy = scaleLinear(yValue, yMin, yMax, metrics.bottom, metrics.top);
      return [
        chartPointOpen(point, `${formatChartValue(xValue)},${formatChartValue(yValue)}`),
        `<circle cx="${cx}" cy="${cy}" r="6" style="fill: ${chartColor(index)}; opacity: 0.86"></circle>`,
        `<text x="${cx}" y="${Math.max(metrics.top + 10, cy - 10)}" text-anchor="middle">${escapeHtml(point.label)}</text>`,
        "</g>"
      ].join("");
    })
  ].join("");
  return { width: metrics.width, height: metrics.height, body };
}

function renderPieChart(node, donut) {
  const width = 360;
  const height = 220;
  const cx = 132;
  const cy = 104;
  const radius = 72;
  const values = node.data.map((point) => Math.max(point.values[0] ?? 0, 0));
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  let start = -90;
  const slices = node.data.map((point, index) => {
    const value = values[index];
    const angle = (value / total) * 360;
    const end = start + angle;
    const path = pieSlicePath(cx, cy, radius, start, end);
    const mid = start + angle / 2;
    const label = polarPoint(cx, cy, radius + 24, mid);
    start = end;
    return [
      chartPointOpen(point, value),
      `<path d="${path}" style="fill: ${chartColor(index)}; opacity: 0.88"></path>`,
      `<text x="${label.x}" y="${label.y}" text-anchor="middle">${escapeHtml(point.label)}</text>`,
      "</g>"
    ].join("");
  }).join("");
  const hole = donut ? `<circle class="rmd-chart-donut-hole" cx="${cx}" cy="${cy}" r="34" style="fill: var(--rmd-color-surface, #fff)"></circle>` : "";
  const totalLabel = donut ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle">${escapeHtml(formatChartValue(total))}</text>` : "";
  const legend = renderLegend(node, 240, 50);
  return { width, height, body: `${slices}${hole}${totalLabel}${legend}` };
}

function renderRadarChart(node) {
  const width = 360;
  const height = 260;
  const cx = 180;
  const cy = 120;
  const radius = 72;
  const series = seriesValues(node);
  const max = Math.max(...node.data.flatMap((point) => point.values), 1);
  const axisCount = node.data.length;
  const axes = node.data.map((point, index) => {
    const end = radarPoint(cx, cy, radius, index, axisCount);
    const label = radarPoint(cx, cy, radius + 24, index, axisCount);
    return `<line x1="${cx}" y1="${cy}" x2="${end.x}" y2="${end.y}" stroke="var(--rmd-color-line-strong, #b7c1b0)" stroke-width="1"></line><text x="${label.x}" y="${label.y}" text-anchor="middle">${escapeHtml(point.label)}</text>`;
  }).join("");
  const rings = [0.33, 0.66, 1].map((ratio) => {
    const points = node.data.map((_, index) => {
      const point = radarPoint(cx, cy, radius * ratio, index, axisCount);
      return `${point.x},${point.y}`;
    }).join(" ");
    return `<polygon points="${points}" fill="none" stroke="var(--rmd-color-line, #d7ddd2)" stroke-width="1"></polygon>`;
  }).join("");
  const polygons = series.map((values, seriesIndex) => {
    const points = values.map((value, index) => {
      const point = radarPoint(cx, cy, radius * (value / max), index, axisCount);
      return `${point.x},${point.y}`;
    }).join(" ");
    return `<polygon class="rmd-chart-radar-shape" points="${points}" style="fill: ${chartColor(seriesIndex)}; opacity: ${seriesIndex === 0 ? "0.24" : "0.15"}; stroke: ${chartColor(seriesIndex)}; stroke-width: 2"></polygon>`;
  }).join("");
  return { width, height, body: `${rings}${axes}${polygons}` };
}

function renderHeatmapChart(node) {
  const cell = 34;
  const gap = 6;
  const left = 72;
  const top = 28;
  const seriesCount = Math.max(...node.data.map((point) => point.values.length), 1);
  const width = left + seriesCount * (cell + gap) + 40;
  const height = top + node.data.length * (cell + gap) + 40;
  const values = node.data.flatMap((point) => point.values);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const header = Array.from({ length: seriesCount }, (_, index) => {
    const x = left + index * (cell + gap) + cell / 2;
    return `<text x="${x}" y="20" text-anchor="middle">S${index + 1}</text>`;
  }).join("");
  const rows = node.data.map((point, rowIndex) => {
    const y = top + rowIndex * (cell + gap);
    const label = `<text x="${left - 10}" y="${y + cell / 2 + 4}" text-anchor="end">${escapeHtml(point.label)}</text>`;
    const cells = point.values.map((value, seriesIndex) => {
      const x = left + seriesIndex * (cell + gap);
      const opacity = 0.18 + (scaleUnit(value, min, max) * 0.72);
      return [
        chartPointOpen(point, value, seriesIndex),
        `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="5" data-series-index="${seriesIndex}" style="fill: var(--rmd-color-primary, #176b72); opacity: ${opacity.toFixed(2)}"></rect>`,
        `<text x="${x + cell / 2}" y="${y + cell / 2 + 4}" text-anchor="middle" style="fill: var(--rmd-color-fg, #20251f)">${escapeHtml(formatChartValue(value))}</text>`,
        "</g>"
      ].join("");
    }).join("");
    return `${label}${cells}`;
  }).join("");
  return { width, height, body: `${header}${rows}` };
}

function renderGrid(node) {
  const cells = node.cells.map((cell) => `<div class="rmd-grid-cell">${renderChildren(cell)}</div>`).join("");
  const layoutAttr = node.layout === "masonry" ? ` data-layout="masonry"` : "";
  const colsStr = Array.isArray(node.columns) ? node.columns.join(",") : String(node.columns);

  return [
    `<section class="rmd-block rmd-grid" data-rmd-block="grid" data-columns="${escapeAttr(colsStr)}" data-gap="${escapeAttr(node.gap)}"${layoutAttr}>`,
    cells,
    "</section>"
  ].join("");
}

function renderCard(node) {
  const warningAttr = renderWarningsAttr(node);

  return [
    `<section class="rmd-block rmd-card" data-rmd-block="card"${warningAttr}>`,
    node.title ? `<h3 class="rmd-card-title">${escapeHtml(node.title)}</h3>` : "",
    `<div class="rmd-card-body">${renderChildren(node.children)}</div>`,
    "</section>"
  ].filter(Boolean).join("");
}

function renderCallout(node) {
  return [
    `<aside class="rmd-block rmd-callout rmd-callout-${escapeAttr(node.kind)}" data-rmd-block="callout" data-kind="${escapeAttr(node.kind)}">`,
    node.title ? `<h3 class="rmd-callout-title">${escapeHtml(node.title)}</h3>` : "",
    `<div class="rmd-callout-body">${renderChildren(node.children)}</div>`,
    "</aside>"
  ].filter(Boolean).join("");
}

function renderSlider(node) {
  const warningAttr = renderWarningsAttr(node);
  const scaleAttr = node.scale !== "linear" ? ` data-scale="${escapeAttr(node.scale)}"` : "";
  const marksAttr = node.marks ? ` data-marks="${escapeAttr(node.marks.join(","))}"` : "";
  const isRange = Array.isArray(node.default);
  const defaultValues = isRange ? node.default : [node.default];
  const defaultStr = formatSliderOutput(defaultValues, node.unit);
  const rangeAttr = isRange ? ` data-range="true"` : "";
  const inputAttrs = `type="range" min="${escapeAttr(String(node.min))}" max="${escapeAttr(String(node.max))}" step="${escapeAttr(String(node.step))}" aria-label="${escapeAttr(node.label)}"`;
  const inputHtml = isRange
    ? [
      `<div class="rmd-slider-range-control" style="--rmd-range-start: ${escapeAttr(sliderPercent(defaultValues[0], node))}%; --rmd-range-end: ${escapeAttr(sliderPercent(defaultValues[1], node))}%">`,
      `<span class="rmd-slider-range-track" aria-hidden="true"></span>`,
      `<input id="rmd-slider-${escapeAttr(node.name)}-min" ${inputAttrs} value="${escapeAttr(String(defaultValues[0]))}" data-bound="min">`,
      `<input id="rmd-slider-${escapeAttr(node.name)}-max" ${inputAttrs} value="${escapeAttr(String(defaultValues[1]))}" data-bound="max">`,
      `</div>`
    ].join("")
    : `<input id="rmd-slider-${escapeAttr(node.name)}" ${inputAttrs} value="${escapeAttr(String(defaultValues[0]))}">`;
  
  return [
    `<div class="rmd-block rmd-slider" data-rmd-block="slider" data-name="${escapeAttr(node.name)}" data-unit="${escapeAttr(node.unit)}"${rangeAttr}${scaleAttr}${marksAttr}${warningAttr}>`,
    `<label for="rmd-slider-${escapeAttr(node.name)}${isRange ? "-min" : ""}">${escapeHtml(node.label)}</label>`,
    inputHtml,
    `<output>${escapeHtml(defaultStr)}</output>`,
    "</div>"
  ].join("");
}

function renderExport(node) {
  return [
    `<section class="rmd-block rmd-export" data-rmd-block="export" data-format="${escapeAttr(node.format)}" data-references="${escapeAttr(node.references.join(","))}">`,
    `<button type="button">${escapeHtml(node.label)}</button>`,
    `<pre><code>${escapeHtml(node.template)}</code></pre>`,
    "</section>"
  ].join("");
}

function renderFlow(node) {
  const edges = node.edges.map((edge) => `<li><span>${escapeHtml(edge.from)}</span> <span aria-hidden="true">→</span> <span>${escapeHtml(edge.to)}</span></li>`).join("");

  return [
    `<section class="rmd-block rmd-flow" data-rmd-block="flow" data-direction="${escapeAttr(node.direction)}">`,
    "<ol>",
    edges,
    "</ol>",
    "</section>"
  ].join("");
}

function renderDiff(node) {
  const title = node.title ? `<h3 class="rmd-block-title">${escapeHtml(node.title)}</h3>` : "";
  const lines = node.lines.map((line) => {
    const prefix = line.kind === "add" ? "+" : line.kind === "remove" ? "-" : " ";
    const note = line.note ? ` <mark>${escapeHtml(line.note)}</mark>` : "";
    return `<div class="rmd-diff-line rmd-diff-${line.kind}"><code>${escapeHtml(`${prefix} ${line.text}`)}</code>${note}</div>`;
  }).join("");

  return [
    `<section class="rmd-block rmd-diff" data-rmd-block="diff"${node.lang ? ` data-lang="${escapeAttr(node.lang)}"` : ""}>`,
    title,
    `<pre>${lines}</pre>`,
    "</section>"
  ].join("");
}

function renderTabs(node) {
  const buttons = node.panels.map((panel) => {
    const selected = panel.label === node.default;
    return `<button type="button" role="tab" aria-selected="${selected}" data-label="${escapeAttr(panel.label)}">${escapeHtml(panel.label)}</button>`;
  }).join("");
  const panels = node.panels.map((panel) => {
    const hidden = panel.label === node.default ? "" : " hidden";
    return `<section role="tabpanel"${hidden} data-label="${escapeAttr(panel.label)}">${renderChildren(panel.children)}</section>`;
  }).join("");

  return [
    `<section class="rmd-block rmd-tabs" data-rmd-block="tabs" data-default="${escapeAttr(node.default)}">`,
    `<div role="tablist">${buttons}</div>`,
    panels,
    "</section>"
  ].join("");
}

function renderTimeline(node) {
  const items = node.items.map((item) => {
    const statusClass = item.status !== "default" ? ` rmd-timeline-status-${escapeAttr(item.status)}` : "";
    const titleHtml = item.title ? `<h4>${escapeHtml(item.title)}</h4>` : "";
    return [
      `<li class="rmd-timeline-item${statusClass}">`,
      `<div class="rmd-timeline-time">${escapeHtml(item.time)}</div>`,
      `<div class="rmd-timeline-content">`,
      titleHtml,
      renderChildren(item.children),
      `</div>`,
      `</li>`
    ].join("");
  }).join("");

  return [
    `<section class="rmd-block rmd-timeline rmd-timeline-${escapeAttr(node.direction)}" data-rmd-block="timeline" data-direction="${escapeAttr(node.direction)}">`,
    `<ol>`,
    items,
    `</ol>`,
    `</section>`
  ].join("");
}

function renderKanban(node) {
  const columns = node.columns.map((col) => {
    return [
      `<div class="rmd-kanban-column">`,
      `<h3>${escapeHtml(col.title)}</h3>`,
      `<div class="rmd-kanban-cards">`,
      renderChildren(col.children),
      `</div>`,
      `</div>`
    ].join("");
  }).join("");

  return [
    `<section class="rmd-block rmd-kanban" data-rmd-block="kanban">`,
    columns,
    `</section>`
  ].join("");
}

function renderDetails(node) {
  const openAttr = node.open ? " open" : "";
  return [
    `<details class="rmd-block rmd-details" data-rmd-block="details"${openAttr}>`,
    `<summary>${escapeHtml(node.title)}</summary>`,
    `<div class="rmd-details-body">`,
    renderChildren(node.children),
    `</div>`,
    `</details>`
  ].join("");
}

function renderCarousel(node) {
  const items = node.items.map((item, i) => {
    return `<div class="rmd-carousel-item" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${node.items.length}">${renderChildren(item)}</div>`;
  }).join("");
  const controls = node.items.length > 1
    ? [
      `<button type="button" class="rmd-carousel-control rmd-carousel-prev" data-rmd-carousel="prev" aria-label="Previous slide"><span aria-hidden="true">&lsaquo;</span></button>`,
      `<button type="button" class="rmd-carousel-control rmd-carousel-next" data-rmd-carousel="next" aria-label="Next slide"><span aria-hidden="true">&rsaquo;</span></button>`
    ].join("")
    : "";
  const dots = node.items.length > 1
    ? `<div class="rmd-carousel-dots" aria-label="Carousel slides">${node.items.map((_, i) => `<button type="button" class="rmd-carousel-dot" data-rmd-carousel-index="${i}" aria-label="Go to slide ${i + 1}"${i === 0 ? ` aria-current="true"` : ""}></button>`).join("")}</div>`
    : "";
  
  const autoAttr = node.autoplay ? ` data-autoplay="true" data-interval="${escapeAttr(String(node.interval))}"` : "";

  return [
    `<section class="rmd-block rmd-carousel" data-rmd-block="carousel" data-active-index="0"${autoAttr}>`,
    `<div class="rmd-carousel-track">`,
    items,
    `</div>`,
    controls,
    dots,
    `</section>`
  ].join("");
}

function renderEmbed(node) {
  const ratioAttr = node.aspectRatio ? ` style="--rmd-aspect-ratio: ${escapeAttr(node.aspectRatio)}"` : "";
  return [
    `<section class="rmd-block rmd-embed rmd-embed-${escapeAttr(node.embedType)}" data-rmd-block="embed"${ratioAttr}>`,
    `<iframe title="Embed" src="about:blank" data-src="${escapeAttr(node.embedId)}" allowfullscreen loading="lazy"></iframe>`,
    `</section>`
  ].join("");
}

function renderMath(node) {
  const latex = String(node.value ?? "").trim();
  return [
    `<section class="rmd-block rmd-math" data-rmd-block="math">`,
    `<div class="rmd-math-display" role="math" aria-label="${escapeAttr(latex)}" data-latex="${escapeAttr(latex)}">${escapeHtml(latex)}</div>`,
    `</section>`
  ].join("");
}

function renderUnknownNode(node) {
  return `<pre class="rmd-unknown-node" data-rmd-node="${escapeAttr(node.type)}"><code>${escapeHtml(JSON.stringify(node, null, 2))}</code></pre>`;
}

function renderWarningsAttr(node) {
  return node.warnings?.length ? ` data-rmd-warning="${escapeAttr(node.warnings.join(";"))}"` : "";
}

function chartDescription(node) {
  return node.data.map((point) => `${point.label}: ${point.values.join(", ")}`).join("; ");
}

function chartMetrics(node, options = {}) {
  const width = Math.max(280, node.data.length * 58 + 92);
  const height = 220;
  const left = 36;
  const right = width - 28;
  const top = 26;
  const bottom = 158;
  const values = options.useAllValues ? node.data.flatMap((point) => point.values) : node.data.map((point) => point.values[0] ?? 0);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
  const min = minValue === maxValue ? 0 : minValue;
  const max = minValue === maxValue ? maxValue || 1 : maxValue;
  return {
    width,
    height,
    left,
    right,
    top,
    bottom,
    labelY: 190,
    plotWidth: right - left,
    plotHeight: bottom - top,
    min,
    max
  };
}

function scaleX(index, count, metrics) {
  if (count <= 1) {
    return Math.round((metrics.left + metrics.right) / 2);
  }
  return Math.round(metrics.left + (index / (count - 1)) * metrics.plotWidth);
}

function scaleY(value, metrics) {
  return Math.round(scaleLinear(value, metrics.min, metrics.max, metrics.bottom, metrics.top));
}

function scaleLinear(value, min, max, outputMin, outputMax) {
  return Math.round(outputMin + scaleUnit(value, min, max) * (outputMax - outputMin));
}

function scaleUnit(value, min, max) {
  if (max === min) {
    return 0;
  }
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

function seriesValues(node) {
  const seriesCount = Math.max(...node.data.map((point) => point.values.length), 1);
  return Array.from({ length: seriesCount }, (_, seriesIndex) => node.data.map((point) => point.values[seriesIndex] ?? 0));
}

function renderAxisLabels(node, metrics) {
  const xLabel = node.x ? `<text x="${(metrics.left + metrics.right) / 2}" y="${metrics.height - 8}" text-anchor="middle">${escapeHtml(node.x)}</text>` : "";
  const yLabel = node.y ? `<text x="12" y="${metrics.top + 8}" text-anchor="start">${escapeHtml(node.y)}</text>` : "";
  const y2Label = node.y2 ? `<text x="${metrics.right}" y="${metrics.top + 8}" text-anchor="end">${escapeHtml(node.y2)}</text>` : "";
  const axis = [
    `<line x1="${metrics.left}" y1="${metrics.bottom}" x2="${metrics.right}" y2="${metrics.bottom}" stroke="var(--rmd-color-line-strong, #b7c1b0)" stroke-width="1"></line>`,
    `<line x1="${metrics.left}" y1="${metrics.top}" x2="${metrics.left}" y2="${metrics.bottom}" stroke="var(--rmd-color-line-strong, #b7c1b0)" stroke-width="1"></line>`
  ].join("");
  return `${axis}${xLabel}${yLabel}${y2Label}`;
}

function renderCategoryLabels(node, metrics) {
  return node.data.map((point, index) => `<text x="${scaleX(index, node.data.length, metrics)}" y="${metrics.labelY}" text-anchor="middle">${escapeHtml(point.label)}</text>`).join("");
}

function renderLegend(node, x, y) {
  if (node.legend === "none") {
    return "";
  }
  return node.data.map((point, index) => {
    const itemY = y + index * 20;
    return `<g class="rmd-chart-legend-item"><rect x="${x}" y="${itemY - 10}" width="10" height="10" rx="2" style="fill: ${chartColor(index)}"></rect><text x="${x + 16}" y="${itemY}" text-anchor="start">${escapeHtml(point.label)}</text></g>`;
  }).join("");
}

function chartPointOpen(point, value, seriesIndex = null) {
  const seriesAttr = seriesIndex === null ? "" : ` data-series-index="${escapeAttr(String(seriesIndex))}"`;
  return `<g class="rmd-chart-point" data-label="${escapeAttr(point.label)}" data-value="${escapeAttr(String(value))}"${seriesAttr}>`;
}

function chartColor(index) {
  return [
    "var(--rmd-color-primary, #176b72)",
    "var(--rmd-color-accent, #c8523e)",
    "var(--rmd-color-info, #3867a8)",
    "var(--rmd-color-success, #2f7d4f)",
    "var(--rmd-color-warning, #a36a1c)",
    "var(--rmd-color-danger, #b63f35)"
  ][index % 6];
}

function pieSlicePath(cx, cy, radius, startAngle, endAngle) {
  const start = polarPoint(cx, cy, radius, endAngle);
  const end = polarPoint(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx},${cy} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArc} 0 ${end.x},${end.y} Z`;
}

function polarPoint(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return {
    x: Math.round((cx + radius * Math.cos(radians)) * 100) / 100,
    y: Math.round((cy + radius * Math.sin(radians)) * 100) / 100
  };
}

function radarPoint(cx, cy, radius, index, count) {
  const angle = -90 + (360 / count) * index;
  return polarPoint(cx, cy, radius, angle + 90);
}

function formatChartValue(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

function formatSliderOutput(values, unit = "") {
  const text = values.map((value) => String(value)).join(" - ");
  return unit ? `${text} ${unit}` : text;
}

function sliderPercent(value, node) {
  if (node.max === node.min) {
    return "0";
  }
  const percent = ((value - node.min) / (node.max - node.min)) * 100;
  return (Math.round(percent * 100) / 100).toFixed(2);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
