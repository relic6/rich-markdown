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
  const max = Math.max(...node.data.flatMap((point) => point.values), 1);
  const bars = node.data.map((point, index) => {
    const value = point.values[0] ?? 0;
    const height = Math.max(4, Math.round((value / max) * 120));
    const x = 24 + index * 64;
    const y = 150 - height;

    return [
      `<g class="rmd-chart-point" data-label="${escapeAttr(point.label)}" data-value="${escapeAttr(String(value))}">`,
      `<rect x="${x}" y="${y}" width="36" height="${height}" rx="4"></rect>`,
      `<text x="${x + 18}" y="170" text-anchor="middle">${escapeHtml(point.label)}</text>`,
      `<text x="${x + 18}" y="${y - 8}" text-anchor="middle">${escapeHtml(String(value))}</text>`,
      "</g>"
    ].join("");
  }).join("");

  const y2Attr = node.y2 ? ` data-y2="${escapeAttr(node.y2)}"` : "";
  const legendAttr = ` data-legend="${escapeAttr(node.legend || "bottom")}"`;
  const tooltipAttr = node.tooltip === false ? ` data-tooltip="false"` : "";

  return [
    `<section class="rmd-block rmd-chart rmd-chart-${escapeAttr(node.chartType)}" data-rmd-block="chart"${y2Attr}${legendAttr}${tooltipAttr}>`,
    node.title ? `<h3 class="rmd-block-title">${escapeHtml(node.title)}</h3>` : "",
    `<svg role="img" viewBox="0 0 ${Math.max(240, node.data.length * 64 + 48)} 190" class="rmd-chart-svg">`,
    node.title ? `<title>${escapeHtml(node.title)}</title>` : "<title>Chart</title>",
    `<desc>${escapeHtml(chartDescription(node))}</desc>`,
    bars,
    "</svg>",
    "</section>"
  ].filter(Boolean).join("");
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
  const defaultStr = Array.isArray(node.default) ? node.default.join(",") : String(node.default);
  
  return [
    `<div class="rmd-block rmd-slider" data-rmd-block="slider" data-name="${escapeAttr(node.name)}" data-unit="${escapeAttr(node.unit)}"${scaleAttr}${marksAttr}${warningAttr}>`,
    `<label for="rmd-slider-${escapeAttr(node.name)}">${escapeHtml(node.label)}</label>`,
    `<input id="rmd-slider-${escapeAttr(node.name)}" type="range" min="${escapeAttr(String(node.min))}" max="${escapeAttr(String(node.max))}" step="${escapeAttr(String(node.step))}" value="${escapeAttr(defaultStr)}" aria-label="${escapeAttr(node.label)}">`,
    `<output>${escapeHtml(defaultStr)}${node.unit ? ` ${escapeHtml(node.unit)}` : ""}</output>`,
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
  
  const autoAttr = node.autoplay ? ` data-autoplay="true" data-interval="${escapeAttr(String(node.interval))}"` : "";

  return [
    `<section class="rmd-block rmd-carousel" data-rmd-block="carousel"${autoAttr}>`,
    `<div class="rmd-carousel-track">`,
    items,
    `</div>`,
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
  return [
    `<section class="rmd-block rmd-math" data-rmd-block="math">`,
    `<pre><code class="language-latex">${escapeHtml(node.value)}</code></pre>`,
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
