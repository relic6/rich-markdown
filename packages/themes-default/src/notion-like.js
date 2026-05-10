// notion-like theme overrides — applied AFTER the default base CSS.
// Visual identity: clean white page, Notion neutrals, system UI font,
// soft hover states, pill tabs, card-style callouts with rounded corners.
// Per PRINCIPLES P6 + ARCHITECTURE TD-004: pure CSS, no JS, no DOM changes.

export const notionLikeOverrides = `
/* ========================================================================= */
/* THEME: notion-like — overrides applied on top of the default layout       */
/* ========================================================================= */

:root {
  --rmd-color-page: #ffffff;
  --rmd-color-bg: #ffffff;
  --rmd-color-surface: #ffffff;
  --rmd-color-surface-strong: #f7f6f3;
  --rmd-color-fg: #37352f;
  --rmd-color-muted: #787774;
  --rmd-color-subtle: #9b9a97;
  --rmd-color-line: #ecebe9;
  --rmd-color-line-strong: #d3d1cb;
  --rmd-color-primary: #2383e2;
  --rmd-color-primary-strong: #1a6dc0;
  --rmd-color-accent: #eb5757;
  --rmd-color-success: #0f7b6c;
  --rmd-color-warning: #cb912f;
  --rmd-color-danger: #e03e3e;
  --rmd-color-info: #2383e2;
  --rmd-font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
  --rmd-font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", sans-serif;
  --rmd-font-mono: "SFMono-Regular", "Menlo", "Consolas", "PT Mono", "Liberation Mono", monospace;
  --rmd-radius-sm: 4px;
  --rmd-radius-md: 6px;
  --rmd-radius-lg: 10px;
  --rmd-spacing-sm: 8px;
  --rmd-spacing-md: 14px;
  --rmd-spacing-lg: 24px;
  --rmd-shadow-sm: 0 1px 2px rgb(15 15 15 / 0.04);
  --rmd-shadow-md: 0 4px 12px rgb(15 15 15 / 0.06);
  --rmd-focus-ring: 0 0 0 2px rgb(35 131 226 / 0.45);
}

/* Pure white, no gradient, no decorative tint */
body[data-rmd-theme] {
  background: #ffffff;
  color: var(--rmd-color-fg);
}

.rmd-document {
  max-width: 720px;
  padding: clamp(40px, 8vw, 96px) clamp(20px, 5vw, 48px) clamp(40px, 6vw, 64px);
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: -0.003em;
  color: var(--rmd-color-fg);
}

/* Headings — system font, tighter, no underline on H1 */
.rmd-document h1,
.rmd-document h2,
.rmd-document h3,
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 700;
  letter-spacing: -0.012em;
  line-height: 1.2;
}

.rmd-document h1 {
  margin-top: 0;
  margin-bottom: 0.6em;
  padding-bottom: 0;
  border-bottom: 0;
  font-size: 40px;
  font-weight: 800;
}

.rmd-document h2 {
  margin-top: 1.8em;
  font-size: 24px;
  font-weight: 700;
}

.rmd-document h3 {
  margin-top: 1.4em;
  font-size: 18px;
  font-weight: 600;
}

.rmd-document a {
  color: var(--rmd-color-fg);
  text-decoration: underline;
  text-decoration-color: var(--rmd-color-line-strong);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.rmd-document a:hover {
  color: var(--rmd-color-fg);
  text-decoration-color: var(--rmd-color-fg);
}

.rmd-document strong {
  color: var(--rmd-color-fg);
  font-weight: 700;
}

/* Notion-style inline code — pink-tinged on neutral pill */
.rmd-document code {
  background: #f1f1ef;
  border: 0;
  color: #eb5757;
  font-size: 0.86em;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Notion-style block quote — accent left border, neutral text */
.rmd-document blockquote {
  margin-left: 0;
  margin-right: 0;
  padding: 4px 0 4px 18px;
  border-left: 3px solid var(--rmd-color-fg);
  background: transparent;
  color: var(--rmd-color-fg);
  font-style: normal;
  font-size: 16px;
}

.rmd-document hr {
  height: 1px;
  background: var(--rmd-color-line);
  margin: 2em 0;
}

/* Card-like blocks — flat, soft border, very subtle shadow on hover */
.rmd-grid-cell,
.rmd-callout,
.rmd-export,
.rmd-slider,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

.rmd-grid-cell {
  background: var(--rmd-color-surface-strong);
}

/* Notion-style callout: gray bg, color icon stripe via left border */
.rmd-callout {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  border-left-width: 3px;
  border-radius: var(--rmd-radius-md);
}

.rmd-callout::before {
  width: 3px;
}

.rmd-callout-tip,
.rmd-callout-success { color: var(--rmd-color-success); border-left-color: var(--rmd-color-success); }
.rmd-callout-warning { color: var(--rmd-color-warning); border-left-color: var(--rmd-color-warning); }
.rmd-callout-danger  { color: var(--rmd-color-danger);  border-left-color: var(--rmd-color-danger); }
.rmd-callout-info    { color: var(--rmd-color-info);    border-left-color: var(--rmd-color-info); }

.rmd-callout-title,
.rmd-block-title {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.005em;
}

.rmd-callout-body { color: var(--rmd-color-fg); }

/* Chart — flat fills, soft rounded bars feeling */
.rmd-chart {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

.rmd-chart rect {
  fill: var(--rmd-color-primary);
  filter: none;
  rx: 3;
  ry: 3;
}

.rmd-chart-point:nth-of-type(2n) rect {
  fill: var(--rmd-color-accent);
}

.rmd-chart-point:hover rect {
  fill: var(--rmd-color-primary-strong);
  transform: none;
}

.rmd-chart text {
  fill: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
  font-size: 12px;
}

/* Slider — minimal */
.rmd-slider label { color: var(--rmd-color-fg); font-family: var(--rmd-font-ui); }

.rmd-slider output {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-mono);
  border-radius: 4px;
}

.rmd-slider input[type="range"] {
  accent-color: var(--rmd-color-primary);
}

/* Buttons — pill style for tabs, blue primary for export */
.rmd-export button,
.rmd-tabs [role="tab"] {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: 999px;
  padding: 6px 14px;
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 500;
  font-size: 13px;
}

.rmd-export button:hover,
.rmd-tabs [role="tab"]:hover {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-line-strong);
  color: var(--rmd-color-fg);
  transform: none;
}

.rmd-export button {
  background: var(--rmd-color-primary);
  border-color: var(--rmd-color-primary);
  color: #ffffff;
  border-radius: 6px;
}

.rmd-export button:hover {
  background: var(--rmd-color-primary-strong);
  border-color: var(--rmd-color-primary-strong);
  color: #ffffff;
}

.rmd-tabs [role="tab"][aria-selected="true"] {
  background: var(--rmd-color-fg);
  border-color: var(--rmd-color-fg);
  color: var(--rmd-color-page);
}

/* Code & pre — Notion uses monochrome dark on near-white */
.rmd-code,
.rmd-export pre,
.rmd-diff pre {
  background: #f7f6f3;
  border: 1px solid var(--rmd-color-line);
  color: #37352f;
  border-radius: var(--rmd-radius-sm);
}

.rmd-export pre,
.rmd-diff pre {
  background: #2f2f2f;
  color: #e8e8e8;
  border-color: #2f2f2f;
}

.rmd-code code,
.rmd-export pre code,
.rmd-diff code {
  color: inherit;
}

/* Flow — soft chips */
.rmd-flow li {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: var(--rmd-radius-md);
}

.rmd-flow li span:nth-child(2) {
  color: var(--rmd-color-primary);
  font-weight: 700;
}

/* Diff */
.rmd-diff-add code    { color: #6dd9ad; }
.rmd-diff-remove code { color: #ff8b80; }

.rmd-diff-line mark {
  background: var(--rmd-color-warning);
  color: #fff;
  border-radius: 999px;
}

/* Timeline — Notion style: small dot, neutral rail */
.rmd-timeline-vertical ol::before,
.rmd-timeline-horizontal ol::before {
  background: var(--rmd-color-line);
}

.rmd-timeline-vertical .rmd-timeline-item::before,
.rmd-timeline-horizontal .rmd-timeline-item::before {
  background: var(--rmd-color-page);
  border-color: var(--rmd-color-line-strong);
  box-shadow: none;
}

.rmd-timeline-time {
  color: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
}

.rmd-timeline-content h4 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
}

/* Kanban — soft column tint, card with hover lift */
.rmd-kanban-column {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
}

.rmd-kanban-column h3 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 600;
}

.rmd-kanban-cards > :not(ul):not(ol),
.rmd-kanban-cards li {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: var(--rmd-radius-sm);
  box-shadow: none;
}

.rmd-kanban-cards > :not(ul):not(ol):hover,
.rmd-kanban-cards li:hover {
  border-color: var(--rmd-color-line-strong);
  box-shadow: var(--rmd-shadow-sm);
  transform: none;
}

/* Details — Notion toggle */
.rmd-details {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
}

.rmd-details[open] {
  background: var(--rmd-color-surface);
  box-shadow: none;
}

.rmd-details summary {
  font-family: var(--rmd-font-ui);
  font-weight: 600;
}

.rmd-details summary::before {
  border-left-color: var(--rmd-color-muted);
}

.rmd-details[open] .rmd-details-body {
  border-top-color: var(--rmd-color-line);
}

/* Carousel & embed — soft cards */
.rmd-carousel {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

.rmd-embed {
  background: var(--rmd-color-surface-strong);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

/* Math — soft monospace */
.rmd-math {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: var(--rmd-radius-md);
  font-family: var(--rmd-font-mono);
}
`.trim();
