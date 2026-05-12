// tech-dark theme overrides — applied AFTER the default base CSS.
// Visual identity: deep midnight base, neon-mint primary, violet accent,
// grid-style flat decorations, mono-leaning UI font.
// Per PRINCIPLES P6 + ARCHITECTURE TD-004: pure CSS, no JS, no DOM changes.

export const techDarkOverrides = `
/* ========================================================================= */
/* THEME: tech-dark — overrides applied on top of the default layout         */
/* ========================================================================= */

:root {
  --rmd-color-page: #07090e;
  --rmd-color-bg: #0c1018;
  --rmd-color-surface: #131826;
  --rmd-color-surface-strong: #1c2336;
  --rmd-color-fg: #d8e3f0;
  --rmd-color-muted: #8c98ad;
  --rmd-color-subtle: #5e6878;
  --rmd-color-line: #1e2738;
  --rmd-color-line-strong: #2e394f;
  --rmd-color-primary: #5cf2d6;
  --rmd-color-primary-strong: #2dd6b9;
  --rmd-color-accent: #c084fc;
  --rmd-color-success: #6ee7b7;
  --rmd-color-warning: #fcd34d;
  --rmd-color-danger: #f87171;
  --rmd-color-info: #60a5fa;
  --rmd-font-body: Inter, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  --rmd-font-ui: Inter, ui-sans-serif, system-ui, sans-serif;
  --rmd-font-mono: "JetBrains Mono", "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  --rmd-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
  --rmd-shadow-md: 0 12px 36px rgb(0 0 0 / 0.5);
  --rmd-focus-ring: 0 0 0 3px rgb(92 242 214 / 0.35);
}

body[data-rmd-theme] {
  background:
    linear-gradient(180deg, #07090e 0%, #0a0d15 60%, #07090e 100%),
    radial-gradient(circle at 18% 12%, rgb(92 242 214 / 0.08), transparent 30rem),
    radial-gradient(circle at 82% 6%, rgb(192 132 252 / 0.10), transparent 32rem);
  color: var(--rmd-color-fg);
}

/* Subtle scanline grid for the page background */
body[data-rmd-theme]::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgb(92 242 214 / 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgb(92 242 214 / 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  z-index: 0;
}

.rmd-document {
  position: relative;
  z-index: 1;
  color: var(--rmd-color-fg);
}

/* Headings — luminous, mono-flavored */
.rmd-document h1,
.rmd-document h2,
.rmd-document h3,
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 {
  color: #f0f6ff;
  font-weight: 700;
}

.rmd-document h1 {
  border-bottom-color: var(--rmd-color-line-strong);
  background: linear-gradient(90deg, #f0f6ff 0%, #5cf2d6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.rmd-document a {
  color: var(--rmd-color-primary);
  text-decoration-color: rgb(92 242 214 / 0.35);
}

.rmd-document a:hover {
  color: var(--rmd-color-primary-strong);
}

.rmd-document strong {
  color: #ffffff;
}

.rmd-document code {
  background: rgb(92 242 214 / 0.1);
  border: 1px solid rgb(92 242 214 / 0.2);
  color: var(--rmd-color-primary);
}

.rmd-document blockquote {
  border-left-color: var(--rmd-color-primary);
  background: rgb(92 242 214 / 0.04);
  color: var(--rmd-color-muted);
}

.rmd-document hr {
  background: linear-gradient(90deg, transparent, var(--rmd-color-line-strong), transparent);
}

/* Card-like blocks: replace the cream surfaces with dark surfaces */
.rmd-grid-cell,
.rmd-callout,
.rmd-export,
.rmd-slider,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  box-shadow: var(--rmd-shadow-sm);
}

.rmd-callout {
  border-left-width: 3px;
}

.rmd-callout-title,
.rmd-block-title {
  color: #f0f6ff;
}

.rmd-callout-tip,
.rmd-callout-success { color: var(--rmd-color-success); border-color: rgb(110 231 183 / 0.35); }
.rmd-callout-warning { color: var(--rmd-color-warning); border-color: rgb(252 211 77 / 0.35); }
.rmd-callout-danger  { color: var(--rmd-color-danger);  border-color: rgb(248 113 113 / 0.35); }
.rmd-callout-info    { color: var(--rmd-color-info);    border-color: rgb(96 165 250 / 0.35); }

.rmd-callout-body { color: var(--rmd-color-fg); }

/* Chart — flat fills, neon outlines, dark surface */
.rmd-chart {
  background: linear-gradient(180deg, var(--rmd-color-surface) 0%, var(--rmd-color-surface-strong) 100%);
  border: 1px solid var(--rmd-color-line);
  box-shadow: 0 0 0 1px rgb(92 242 214 / 0.05) inset;
}

.rmd-chart rect {
  fill: var(--rmd-color-primary);
  filter: drop-shadow(0 0 12px rgb(92 242 214 / 0.4));
}

.rmd-chart-point:nth-of-type(2n) rect {
  fill: var(--rmd-color-accent);
  filter: drop-shadow(0 0 12px rgb(192 132 252 / 0.4));
}

.rmd-chart-point:hover rect {
  fill: var(--rmd-color-primary-strong);
}

.rmd-chart text {
  fill: var(--rmd-color-muted);
}

/* Slider — neon track */
.rmd-slider label { color: var(--rmd-color-fg); }

.rmd-slider output {
  background: rgb(92 242 214 / 0.12);
  border: 1px solid rgb(92 242 214 / 0.35);
  color: var(--rmd-color-primary);
}

.rmd-slider input[type="range"] {
  accent-color: var(--rmd-color-primary);
}

/* Buttons — glowing primary, ghost secondary */
.rmd-export button,
.rmd-tabs [role="tab"] {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-line-strong);
  color: var(--rmd-color-fg);
}

.rmd-export button:hover,
.rmd-tabs [role="tab"]:hover {
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary);
}

.rmd-export button {
  background: linear-gradient(135deg, var(--rmd-color-primary) 0%, var(--rmd-color-primary-strong) 100%);
  border-color: transparent;
  color: #07090e;
  box-shadow: 0 0 24px rgb(92 242 214 / 0.4);
}

.rmd-export button:hover {
  background: linear-gradient(135deg, #7df5e0 0%, #45e3c8 100%);
  color: #07090e;
}

.rmd-tabs [role="tab"][aria-selected="true"] {
  background: rgb(92 242 214 / 0.12);
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary);
}

/* Code & pre — slightly lighter surface than the default's near-black */
.rmd-code,
.rmd-export pre,
.rmd-diff pre {
  background: #060810;
  border-color: var(--rmd-color-line-strong);
  color: #d8e3f0;
}

/* Flow — nodes glow */
.rmd-flow li {
  background: rgb(92 242 214 / 0.05);
  border-color: rgb(92 242 214 / 0.25);
  color: var(--rmd-color-fg);
}

.rmd-flow li span:nth-child(2) {
  color: var(--rmd-color-accent);
}

/* Diff — terminal-style */
.rmd-diff-add code    { color: var(--rmd-color-success); }
.rmd-diff-remove code { color: var(--rmd-color-danger); }

.rmd-diff-line mark {
  background: rgb(192 132 252 / 0.2);
  color: var(--rmd-color-accent);
}

/* Timeline — cyan rail, glowing dots */
.rmd-timeline-vertical ol::before,
.rmd-timeline-horizontal ol::before {
  background: linear-gradient(var(--rmd-color-line) 0%, var(--rmd-color-primary) 50%, var(--rmd-color-line) 100%);
}

.rmd-timeline-vertical .rmd-timeline-item::before,
.rmd-timeline-horizontal .rmd-timeline-item::before {
  background: var(--rmd-color-bg);
  border-color: var(--rmd-color-primary);
  box-shadow: 0 0 8px rgb(92 242 214 / 0.6);
}

.rmd-timeline-time {
  color: var(--rmd-color-primary);
}

.rmd-timeline-content h4 {
  color: #f0f6ff;
}

/* Kanban — dark columns, neon column dots */
.rmd-kanban-column {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-line-strong);
}

.rmd-kanban-column h3 {
  color: var(--rmd-color-fg);
}

.rmd-kanban-cards > :not(ul):not(ol),
.rmd-kanban-cards li {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  color: var(--rmd-color-fg);
  box-shadow: none;
}

.rmd-kanban-cards > :not(ul):not(ol):hover,
.rmd-kanban-cards li:hover {
  border-color: var(--rmd-color-primary);
  box-shadow: 0 0 12px rgb(92 242 214 / 0.2);
}

/* Details — collapsed dark card */
.rmd-details {
  background: rgb(255 255 255 / 0.02);
  border-color: var(--rmd-color-line);
}

.rmd-details[open] {
  background: var(--rmd-color-surface);
}

.rmd-details summary::before {
  border-left-color: var(--rmd-color-primary);
}

.rmd-details[open] .rmd-details-body {
  border-top-color: var(--rmd-color-line-strong);
}

/* Carousel & embed */
.rmd-carousel {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
}

.rmd-carousel-control {
  background: rgb(11 18 25 / 0.9);
  border-color: rgb(92 242 214 / 0.24);
  color: var(--rmd-color-fg);
}

.rmd-carousel-dot {
  background: rgb(223 245 239 / 0.32);
}

.rmd-embed {
  background: #000;
  box-shadow: 0 0 30px rgb(0 0 0 / 0.6);
}

/* Math — terminal-style equations */
.rmd-math {
  background: rgb(92 242 214 / 0.05);
  border-color: rgb(92 242 214 / 0.2);
  color: var(--rmd-color-fg);
}
`.trim();
