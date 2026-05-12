// paper theme overrides — applied AFTER the default base CSS.
// Visual identity: warm cream stock, serif everywhere, generous leading,
// understated decorations, scholarly accent (deep navy + warm bronze).
// Per PRINCIPLES P6 + ARCHITECTURE TD-004: pure CSS, no JS, no DOM changes.

export const paperOverrides = `
/* ========================================================================= */
/* THEME: paper — overrides applied on top of the default layout             */
/* ========================================================================= */

:root {
  --rmd-color-page: #f5f0e3;
  --rmd-color-bg: #fbf6e8;
  --rmd-color-surface: #fefaee;
  --rmd-color-surface-strong: #f1ebda;
  --rmd-color-fg: #1d1a14;
  --rmd-color-muted: #6e6555;
  --rmd-color-subtle: #998d77;
  --rmd-color-line: #d8d0bd;
  --rmd-color-line-strong: #b3a98f;
  --rmd-color-primary: #2c3e50;
  --rmd-color-primary-strong: #1a2530;
  --rmd-color-accent: #8b3a2f;
  --rmd-color-success: #4a6b3a;
  --rmd-color-warning: #8b6914;
  --rmd-color-danger: #8b3a2f;
  --rmd-color-info: #2c3e50;
  --rmd-font-body: "Source Serif Pro", "Iowan Old Style", "Palatino Linotype", Palatino, Charter, "STSong", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", serif;
  --rmd-font-ui: "Source Serif Pro", "Iowan Old Style", Georgia, "STSong", "Songti SC", "PingFang SC", serif;
  --rmd-font-mono: "Source Code Pro", "Courier Prime", "Liberation Mono", Menlo, Consolas, monospace;
  --rmd-radius-sm: 2px;
  --rmd-radius-md: 3px;
  --rmd-radius-lg: 3px;
  --rmd-spacing-sm: 8px;
  --rmd-spacing-md: 16px;
  --rmd-spacing-lg: 28px;
  --rmd-shadow-sm: none;
  --rmd-shadow-md: none;
  --rmd-focus-ring: 0 0 0 2px rgb(44 62 80 / 0.4);
}

/* Flat, paper-textured background — no gradients, no glow */
body[data-rmd-theme] {
  background:
    linear-gradient(180deg, #f5f0e3 0%, #f5f0e3 100%);
  color: var(--rmd-color-fg);
}

.rmd-document {
  max-width: 760px;
  padding: clamp(40px, 6vw, 80px) clamp(24px, 5vw, 64px);
  font-size: 18px;
  line-height: 1.85;
  letter-spacing: 0.005em;
  color: var(--rmd-color-fg);
}

/* Headings — restrained, all serif, no bold gradient tricks */
.rmd-document h1,
.rmd-document h2,
.rmd-document h3,
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 700;
  font-style: normal;
  letter-spacing: -0.005em;
  line-height: 1.25;
}

.rmd-document h1 {
  margin-top: 0;
  margin-bottom: 1.2em;
  padding-bottom: 18px;
  border-bottom: 2px solid var(--rmd-color-fg);
  font-size: 38px;
  font-weight: 800;
  text-align: left;
}

.rmd-document h2 {
  margin-top: 2.6em;
  font-size: 26px;
  font-weight: 700;
}

.rmd-document h3 {
  margin-top: 2em;
  font-size: 21px;
  font-weight: 600;
  font-style: italic;
}

/* Body paragraphs — first-line indent, justified */
.rmd-document p {
  text-align: justify;
  hyphens: auto;
}

.rmd-document p + p {
  margin-top: 0;
  text-indent: 1.6em;
}

.rmd-document a {
  color: var(--rmd-color-primary);
  text-decoration-color: var(--rmd-color-line-strong);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.rmd-document a:hover {
  color: var(--rmd-color-accent);
}

.rmd-document strong {
  color: var(--rmd-color-fg);
  font-weight: 700;
}

.rmd-document code {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-accent);
  font-size: 0.92em;
  padding: 1px 5px;
}

.rmd-document blockquote {
  margin-left: 1.5em;
  margin-right: 1.5em;
  padding: 0 1em;
  border-left: 3px solid var(--rmd-color-line-strong);
  background: transparent;
  color: var(--rmd-color-muted);
  font-style: italic;
  font-size: 17px;
}

.rmd-document hr {
  height: 1px;
  background: var(--rmd-color-line-strong);
  margin: 2.4em auto;
  width: 60%;
}

/* Card-like blocks — flat, single thin border, no shadow */
.rmd-grid-cell,
.rmd-callout,
.rmd-export,
.rmd-slider,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  box-shadow: none;
}

.rmd-callout {
  border-left-width: 3px;
  background: var(--rmd-color-surface-strong);
}

.rmd-callout::before {
  width: 3px;
}

.rmd-callout-tip,
.rmd-callout-success { color: var(--rmd-color-success); border-color: var(--rmd-color-success); }
.rmd-callout-warning { color: var(--rmd-color-warning); border-color: var(--rmd-color-warning); }
.rmd-callout-danger  { color: var(--rmd-color-danger);  border-color: var(--rmd-color-danger); }
.rmd-callout-info    { color: var(--rmd-color-info);    border-color: var(--rmd-color-info); }

.rmd-callout-title,
.rmd-block-title {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0;
}

.rmd-callout-body { color: var(--rmd-color-fg); }

/* Chart — flat, scholarly, no shadow drop */
.rmd-chart {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line-strong);
  box-shadow: none;
}

.rmd-chart rect {
  fill: var(--rmd-color-primary);
  filter: none;
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
}

/* Slider — restrained */
.rmd-slider label { color: var(--rmd-color-fg); font-family: var(--rmd-font-ui); }

.rmd-slider output {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line-strong);
  border-radius: 2px;
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-mono);
}

.rmd-slider input[type="range"] {
  accent-color: var(--rmd-color-primary);
}

/* Buttons — book-cover style */
.rmd-export button,
.rmd-tabs [role="tab"] {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line-strong);
  color: var(--rmd-color-primary);
  font-family: var(--rmd-font-ui);
  font-weight: 600;
  border-radius: 2px;
  letter-spacing: 0.02em;
}

.rmd-export button:hover,
.rmd-tabs [role="tab"]:hover {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary-strong);
  transform: none;
}

.rmd-export button {
  background: var(--rmd-color-primary);
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-page);
}

.rmd-export button:hover {
  background: var(--rmd-color-primary-strong);
  color: var(--rmd-color-page);
}

.rmd-tabs [role="tab"][aria-selected="true"] {
  background: var(--rmd-color-fg);
  border-color: var(--rmd-color-fg);
  color: var(--rmd-color-page);
}

/* Code & pre */
.rmd-code,
.rmd-export pre,
.rmd-diff pre {
  background: #2a2620;
  border-color: #2a2620;
  color: #f0e8d8;
  border-radius: 2px;
}

/* Flow — structured, no glow */
.rmd-flow li {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: 2px;
}

.rmd-flow li span:nth-child(2) {
  color: var(--rmd-color-accent);
}

/* Diff */
.rmd-diff-add code    { color: #6ee7b7; }
.rmd-diff-remove code { color: #fca5a5; }

.rmd-diff-line mark {
  background: var(--rmd-color-warning);
  color: #fff;
  border-radius: 2px;
}

/* Timeline — paper-style ticks */
.rmd-timeline-vertical ol::before,
.rmd-timeline-horizontal ol::before {
  background: var(--rmd-color-line-strong);
}

.rmd-timeline-vertical .rmd-timeline-item::before,
.rmd-timeline-horizontal .rmd-timeline-item::before {
  background: var(--rmd-color-bg);
  border-color: var(--rmd-color-fg);
  box-shadow: none;
}

.rmd-timeline-time {
  color: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
  font-style: italic;
}

.rmd-timeline-content h4 {
  color: var(--rmd-color-fg);
}

/* Kanban — index card columns */
.rmd-kanban-column {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  border-radius: 2px;
}

.rmd-kanban-column h3 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
}

.rmd-kanban-cards > :not(ul):not(ol),
.rmd-kanban-cards li {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  box-shadow: none;
  border-radius: 2px;
}

.rmd-kanban-cards > :not(ul):not(ol):hover,
.rmd-kanban-cards li:hover {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-line-strong);
  transform: none;
  box-shadow: none;
}

/* Details — typeset accordion */
.rmd-details {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  border-radius: 2px;
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
  border-left-color: var(--rmd-color-fg);
}

/* Carousel & embed — flat */
.rmd-carousel {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  box-shadow: none;
  border-radius: 2px;
}

.rmd-embed {
  background: var(--rmd-color-surface-strong);
  box-shadow: none;
  border-radius: 2px;
}

/* Math — display equation */
.rmd-math {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: 2px;
}
`.trim();
