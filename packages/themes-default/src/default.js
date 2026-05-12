export const defaultThemeCss = `
:root {
  --rmd-color-page: #f5f7f4;
  --rmd-color-bg: #fbfcf8;
  --rmd-color-surface: #ffffff;
  --rmd-color-surface-strong: #f0f4ef;
  --rmd-color-fg: #20251f;
  --rmd-color-muted: #687064;
  --rmd-color-subtle: #8b9387;
  --rmd-color-line: #d7ddd2;
  --rmd-color-line-strong: #b7c1b0;
  --rmd-color-primary: #176b72;
  --rmd-color-primary-strong: #0e4d55;
  --rmd-color-accent: #c8523e;
  --rmd-color-success: #2f7d4f;
  --rmd-color-warning: #a36a1c;
  --rmd-color-danger: #b63f35;
  --rmd-color-info: #3867a8;
  --rmd-font-body: Charter, "Iowan Old Style", "Palatino Linotype", Palatino, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", serif;
  --rmd-font-ui: "Avenir Next", Avenir, "Gill Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --rmd-font-mono: "SF Mono", "Cascadia Code", "Liberation Mono", Menlo, Consolas, monospace;
  --rmd-radius-sm: 4px;
  --rmd-radius-md: 8px;
  --rmd-radius-lg: 8px;
  --rmd-spacing-sm: 8px;
  --rmd-spacing-md: 16px;
  --rmd-spacing-lg: 28px;
  --rmd-shadow-sm: 0 1px 2px rgb(23 36 29 / 0.05), 0 8px 22px rgb(23 36 29 / 0.05);
  --rmd-shadow-md: 0 16px 38px rgb(23 36 29 / 0.09);
  --rmd-focus-ring: 0 0 0 3px rgb(23 107 114 / 0.2);
}

body[data-rmd-theme] {
  margin: 0;
  background:
    linear-gradient(180deg, rgb(245 247 244 / 0.92), rgb(238 243 241 / 0.92)),
    radial-gradient(circle at 18% 12%, rgb(200 82 62 / 0.12), transparent 28rem),
    radial-gradient(circle at 82% 4%, rgb(23 107 114 / 0.14), transparent 34rem);
  color: var(--rmd-color-fg);
}

.rmd-document {
  box-sizing: border-box;
  max-width: 1040px;
  margin: 0 auto;
  padding: clamp(32px, 6vw, 72px) clamp(18px, 5vw, 56px);
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-body);
  font-size: 17px;
  line-height: 1.72;
  letter-spacing: 0;
}

.rmd-document *,
.rmd-document *::before,
.rmd-document *::after {
  box-sizing: border-box;
}

.rmd-document > :first-child {
  margin-top: 0;
}

.rmd-document > :last-child {
  margin-bottom: 0;
}

.rmd-document h1,
.rmd-document h2,
.rmd-document h3,
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 {
  margin: 2.2em 0 0.65em;
  color: #18201a;
  font-family: var(--rmd-font-ui);
  font-weight: 720;
  letter-spacing: 0;
  line-height: 1.12;
}

.rmd-document h1 {
  max-width: 840px;
  margin-bottom: 0.85em;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--rmd-color-line);
  font-size: 42px;
}

.rmd-document h2 {
  font-size: 28px;
}

.rmd-document h3 {
  font-size: 20px;
}

.rmd-document p,
.rmd-document ul,
.rmd-document ol,
.rmd-document blockquote {
  margin: 0 0 1.05em;
}

.rmd-document a {
  color: var(--rmd-color-primary-strong);
  text-decoration-color: rgb(23 107 114 / 0.28);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.rmd-document a:hover {
  color: var(--rmd-color-accent);
  text-decoration-color: rgb(200 82 62 / 0.42);
}

.rmd-document strong {
  color: #111a14;
  font-weight: 720;
}

.rmd-document code {
  border: 1px solid rgb(23 107 114 / 0.14);
  border-radius: var(--rmd-radius-sm);
  padding: 0.08em 0.32em;
  background: rgb(23 107 114 / 0.07);
  color: #0f4f57;
  font-family: var(--rmd-font-mono);
  font-size: 0.88em;
}

.rmd-document img {
  max-width: 100%;
  border-radius: var(--rmd-radius-md);
}

.rmd-document blockquote {
  margin: 1.45em 0;
  border-left: 4px solid var(--rmd-color-primary);
  padding: 4px 0 4px 18px;
  color: #3f493d;
  font-size: 18px;
}

.rmd-document blockquote > :last-child {
  margin-bottom: 0;
}

.rmd-document hr {
  margin: 38px 0;
  border: 0;
  border-top: 1px solid var(--rmd-color-line);
}

.rmd-block {
  margin: 32px 0;
}

.rmd-grid {
  display: grid;
  grid-template-columns: repeat(var(--rmd-grid-columns, 1), minmax(0, 1fr));
  gap: 14px;
}

.rmd-grid[data-columns="2"] { --rmd-grid-columns: 2; }
.rmd-grid[data-columns="3"] { --rmd-grid-columns: 3; }
.rmd-grid[data-columns="4"] { --rmd-grid-columns: 4; }
.rmd-grid[data-columns="5"] { --rmd-grid-columns: 5; }
.rmd-grid[data-columns="6"] { --rmd-grid-columns: 6; }

.rmd-grid-cell,
.rmd-callout,
.rmd-export,
.rmd-slider,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  background: rgb(255 255 255 / 0.86);
  box-shadow: var(--rmd-shadow-sm);
}

.rmd-grid-cell {
  min-width: 0;
  padding: 18px;
  border-top: 3px solid rgb(23 107 114 / 0.46);
}

.rmd-grid-cell > :first-child {
  margin-top: 0;
}

.rmd-grid-cell > :last-child {
  margin-bottom: 0;
}

.rmd-callout,
.rmd-export,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  padding: 20px;
}

.rmd-callout {
  position: relative;
  overflow: hidden;
  border-left-width: 5px;
}

.rmd-callout::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: currentColor;
  content: "";
}

.rmd-callout-tip,
.rmd-callout-success {
  border-color: rgb(47 125 79 / 0.28);
  color: var(--rmd-color-success);
}

.rmd-callout-warning {
  border-color: rgb(163 106 28 / 0.3);
  color: var(--rmd-color-warning);
}

.rmd-callout-danger {
  border-color: rgb(182 63 53 / 0.3);
  color: var(--rmd-color-danger);
}

.rmd-callout-info {
  border-color: rgb(56 103 168 / 0.28);
  color: var(--rmd-color-info);
}

.rmd-callout-title,
.rmd-block-title {
  margin: 0 0 12px;
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-size: 15px;
  font-weight: 720;
}

.rmd-callout-body {
  color: var(--rmd-color-fg);
}

.rmd-callout-body > :last-child {
  margin-bottom: 0;
}

.rmd-chart {
  padding: 20px;
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.94), rgb(246 249 244 / 0.92));
  box-shadow: var(--rmd-shadow-md);
}

.rmd-chart-svg {
  display: block;
  width: 100%;
  max-width: 100%;
  min-height: 220px;
  padding-top: 6px;
}

.rmd-chart rect {
  fill: var(--rmd-color-primary);
  filter: drop-shadow(0 8px 8px rgb(23 107 114 / 0.16));
  transition: fill 160ms ease, transform 160ms ease;
  transform-origin: bottom;
}

.rmd-chart-point:nth-of-type(2n) rect {
  fill: var(--rmd-color-accent);
}

.rmd-chart-point:hover rect {
  fill: var(--rmd-color-primary-strong);
  transform: scaleY(1.03);
}

.rmd-chart text {
  fill: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
  font-size: 12px;
}

.rmd-slider {
  display: grid;
  grid-template-columns: minmax(150px, 1.1fr) minmax(180px, 3fr) minmax(58px, auto);
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
}

.rmd-slider label,
.rmd-slider output {
  font-family: var(--rmd-font-ui);
  font-size: 14px;
  font-weight: 680;
}

.rmd-slider label {
  color: #293128;
}

.rmd-slider output {
  justify-self: end;
  min-width: 54px;
  border: 1px solid rgb(23 107 114 / 0.18);
  border-radius: 999px;
  padding: 4px 9px;
  background: rgb(23 107 114 / 0.08);
  color: var(--rmd-color-primary-strong);
  text-align: center;
}

.rmd-slider input[type="range"] {
  width: 100%;
  accent-color: var(--rmd-color-primary);
  cursor: pointer;
}

.rmd-slider input[type="range"]:focus-visible,
.rmd-export button:focus-visible,
.rmd-tabs [role="tab"]:focus-visible {
  outline: 0;
  box-shadow: var(--rmd-focus-ring);
}

.rmd-export button,
.rmd-tabs [role="tab"] {
  border: 1px solid var(--rmd-color-line-strong);
  border-radius: var(--rmd-radius-sm);
  padding: 8px 12px;
  background: var(--rmd-color-surface);
  color: #243026;
  font-family: var(--rmd-font-ui);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.rmd-export button:hover,
.rmd-tabs [role="tab"]:hover {
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary-strong);
  transform: translateY(-1px);
}

.rmd-export button {
  background: var(--rmd-color-primary);
  border-color: var(--rmd-color-primary);
  color: #fff;
}

.rmd-export button:hover {
  background: var(--rmd-color-primary-strong);
  color: #fff;
}

.rmd-tabs [role="tablist"] {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.rmd-tabs [role="tab"][aria-selected="true"] {
  border-color: var(--rmd-color-primary);
  background: rgb(23 107 114 / 0.1);
  color: var(--rmd-color-primary-strong);
}

.rmd-tabs [role="tabpanel"] > :last-child {
  margin-bottom: 0;
}

.rmd-code,
.rmd-export pre,
.rmd-diff pre {
  overflow: auto;
  border: 1px solid rgb(32 37 31 / 0.1);
  border-radius: var(--rmd-radius-md);
  background: #15201b;
  color: #e8eee7;
  font-family: var(--rmd-font-mono);
  font-size: 13px;
  line-height: 1.62;
}

.rmd-code {
  padding: 16px;
}

.rmd-code code,
.rmd-export pre code,
.rmd-diff code {
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}

.rmd-export pre,
.rmd-diff pre {
  margin: 14px 0 0;
  padding: 14px;
}

.rmd-flow ol {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rmd-flow li {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  border: 1px solid rgb(23 107 114 / 0.14);
  border-radius: var(--rmd-radius-md);
  padding: 10px 12px;
  background: rgb(23 107 114 / 0.055);
  color: #263229;
  font-family: var(--rmd-font-ui);
  font-size: 14px;
}

.rmd-flow li span:nth-child(2) {
  color: var(--rmd-color-accent);
  font-weight: 800;
}

.rmd-diff-line {
  display: block;
  padding: 2px 0;
}

.rmd-diff-line mark {
  border-radius: 999px;
  padding: 2px 7px;
  background: rgb(200 82 62 / 0.18);
  color: #f0c2b9;
  font-family: var(--rmd-font-ui);
  font-size: 12px;
}

.rmd-diff-add code {
  color: #9fe0b5;
}

.rmd-diff-remove code {
  color: #f1a29a;
}

@media (max-width: 720px) {
  .rmd-grid {
    grid-template-columns: 1fr;
  }

  .rmd-slider {
    grid-template-columns: 1fr;
  }

  .rmd-slider output {
    justify-self: start;
  }

  .rmd-document h1 {
    font-size: 32px;
  }

  .rmd-document h2 {
    font-size: 24px;
  }
}

/* ========================================================================= */
/* EXTENSION BLOCKS v0.2                                                     */
/* ========================================================================= */

/* Grid Masonry Layout */
.rmd-grid[data-layout="masonry"] {
  display: block;
  column-gap: 14px;
  column-count: var(--rmd-grid-columns, 1);
}

.rmd-grid[data-layout="masonry"] > .rmd-grid-cell {
  break-inside: avoid;
  margin-bottom: 14px;
}

/* Timeline */
.rmd-timeline {
  margin: 32px 0;
}

.rmd-timeline ol {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rmd-timeline-vertical ol::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 5px;
  width: 2px;
  background: var(--rmd-color-line);
  content: "";
}

.rmd-timeline-vertical .rmd-timeline-item {
  position: relative;
  padding-left: 28px;
  margin-bottom: 24px;
}

.rmd-timeline-vertical .rmd-timeline-item::before {
  position: absolute;
  top: 6px;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--rmd-color-surface);
  border: 2px solid var(--rmd-color-line-strong);
  content: "";
  z-index: 1;
}

.rmd-timeline-horizontal ol {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 24px;
  padding-bottom: 12px;
  /* Treat the ol as a horizontal scroll viewport with explicit snap so
     each @item lines up nicely when the user scrolls. */
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
}

.rmd-timeline-horizontal .rmd-timeline-item {
  /* Cap each item to a predictable width so a single overflowing item
     can't squeeze siblings out of the visible viewport. Long prose
     wraps inside the box; the user scrolls horizontally to see the
     next item. */
  flex: 0 0 240px;
  width: 240px;
  max-width: 240px;
  position: relative;
  padding-top: 28px;
  scroll-snap-align: start;
  /* Prevent runaway content (long URLs, code, CJK without spaces) from
     widening the flex item beyond its declared basis. */
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.rmd-timeline-horizontal .rmd-timeline-content {
  /* Belt-and-suspenders: cap inner content too, in case authors nest
     wide blocks (chart, table) inside a timeline item. */
  max-width: 100%;
  overflow-wrap: anywhere;
}

.rmd-timeline-horizontal .rmd-timeline-content pre,
.rmd-timeline-horizontal .rmd-timeline-content img,
.rmd-timeline-horizontal .rmd-timeline-content table {
  max-width: 100%;
}

/* The connector line is drawn per-item (::after) so that it scrolls with
   the items inside the overflow:auto container. The previous ol::before
   approach anchored the line to the visible viewport, which made the
   line stay put while items scrolled past — broken for any timeline
   wider than the viewport. */
.rmd-timeline-horizontal .rmd-timeline-item::after {
  position: absolute;
  top: 5px;
  left: 6px;
  /* Extend across the 24px gap to meet the next item's dot. */
  right: calc(-24px + 6px);
  height: 2px;
  background: var(--rmd-color-line);
  content: "";
}

.rmd-timeline-horizontal .rmd-timeline-item:last-child::after {
  display: none;
}

.rmd-timeline-horizontal .rmd-timeline-item::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--rmd-color-surface);
  border: 2px solid var(--rmd-color-line-strong);
  content: "";
  z-index: 1;
}

.rmd-timeline-time {
  font-family: var(--rmd-font-mono);
  font-size: 13px;
  color: var(--rmd-color-subtle);
  margin-bottom: 4px;
}

.rmd-timeline-content h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--rmd-color-fg);
}

.rmd-timeline-status-success::before { border-color: var(--rmd-color-success) !important; background: var(--rmd-color-success) !important; }
.rmd-timeline-status-warning::before { border-color: var(--rmd-color-warning) !important; background: var(--rmd-color-warning) !important; }
.rmd-timeline-status-danger::before { border-color: var(--rmd-color-danger) !important; background: var(--rmd-color-danger) !important; }
.rmd-timeline-status-pending::before { border-color: var(--rmd-color-primary) !important; }

/* Kanban */
.rmd-kanban {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  align-items: flex-start;
  scroll-snap-type: x mandatory;
}

.rmd-kanban-column {
  flex: 0 0 300px;
  scroll-snap-align: start;
  background: rgb(243 246 242 / 0.85);
  border-radius: var(--rmd-radius-md);
  padding: 16px;
  border: 1px solid var(--rmd-color-line);
}

.rmd-kanban-column h3 {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 720;
  color: var(--rmd-color-fg);
  display: flex;
  align-items: center;
  gap: 8px;
}

.rmd-kanban-column h3::before {
  content: "";
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--rmd-color-primary);
  box-shadow: 0 0 0 3px rgb(23 107 114 / 0.15);
}

.rmd-kanban-column:nth-child(2n) h3::before { background: var(--rmd-color-warning); box-shadow: 0 0 0 3px rgb(163 106 28 / 0.15); }
.rmd-kanban-column:nth-child(3n) h3::before { background: var(--rmd-color-success); box-shadow: 0 0 0 3px rgb(47 125 79 / 0.15); }
.rmd-kanban-column:nth-child(4n) h3::before { background: var(--rmd-color-accent); box-shadow: 0 0 0 3px rgb(200 82 62 / 0.15); }

.rmd-kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rmd-kanban-cards ul,
.rmd-kanban-cards ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rmd-kanban-cards > :not(ul):not(ol),
.rmd-kanban-cards li {
  background: var(--rmd-color-surface);
  border-radius: var(--rmd-radius-sm);
  padding: 14px;
  margin: 0;
  box-shadow: 0 2px 5px rgb(23 36 29 / 0.04);
  border: 1px solid var(--rmd-color-line);
  font-size: 15px;
  line-height: 1.5;
  color: #384236;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
  cursor: default;
}

.rmd-kanban-cards > :not(ul):not(ol):hover,
.rmd-kanban-cards li:hover {
  transform: translateY(-2px);
  box-shadow: var(--rmd-shadow-sm);
  border-color: var(--rmd-color-line-strong);
}

.rmd-kanban-cards li input[type="checkbox"] {
  margin-right: 8px;
  accent-color: var(--rmd-color-primary);
}

/* Details */
.rmd-details {
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  background: rgb(255 255 255 / 0.6);
  overflow: hidden;
  transition: background 200ms ease;
}

.rmd-details[open] {
  background: var(--rmd-color-surface);
  box-shadow: var(--rmd-shadow-sm);
}

.rmd-details summary {
  padding: 16px 20px;
  font-family: var(--rmd-font-ui);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rmd-details summary::-webkit-details-marker {
  display: none;
}

.rmd-details summary::before {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid var(--rmd-color-muted);
  transition: transform 200ms ease;
}

.rmd-details[open] summary::before {
  transform: rotate(90deg);
}

.rmd-details-body {
  padding: 0 20px 20px;
  border-top: 1px solid transparent;
}

.rmd-details[open] .rmd-details-body {
  border-top-color: rgb(23 107 114 / 0.08);
  padding-top: 16px;
}

/* Carousel */
.rmd-carousel {
  position: relative;
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  overflow: hidden;
  box-shadow: var(--rmd-shadow-sm);
  background: var(--rmd-color-surface);
}

.rmd-carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.rmd-carousel-track::-webkit-scrollbar {
  display: none;
}

.rmd-carousel-item {
  scroll-snap-align: center;
  flex: 0 0 100%;
  width: 100%;
  padding: 24px;
}

/* Embed */
.rmd-embed {
  position: relative;
  width: 100%;
  border-radius: var(--rmd-radius-md);
  overflow: hidden;
  background: #000;
  box-shadow: var(--rmd-shadow-md);
}

.rmd-embed iframe {
  width: 100%;
  height: 100%;
  border: 0;
  aspect-ratio: var(--rmd-aspect-ratio, 16 / 9);
}

/* Math */
.rmd-math {
  display: block;
  overflow-x: auto;
  padding: 18px 24px;
  background: rgb(23 107 114 / 0.04);
  border-radius: var(--rmd-radius-md);
  border: 1px solid rgb(23 107 114 / 0.12);
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-mono);
  font-size: 15px;
  text-align: center;
}

.rmd-math pre {
  margin: 0;
}
`.trim();
