# Rich Markdown Blocks (v0.2)

Complete reference for the 14 blocks supported by the current renderer
(`packages/blocks-core`). Use the smallest set that conveys meaning. Prefer
plain Markdown for narrative.

Identifiers are case-sensitive. Attribute order does not matter; positional
arguments come immediately after the block name.

---

## chart

Compact data visualization. Each line is `{label} {value} [{value2} ...]`,
space-separated. Multi-value rows become multi-series.

```rmd
:::chart bar title="P99 latency (ms)" emphasis=primary
TokenBucket 23
LeakyBucket 19
SlidingWindow 41
:::
```

Types (positional, required): `bar`, `line`, `pie`, `scatter`, `radar`, `area`,
`donut`, `heatmap`. `pie` requires single value per row.

| attribute | values | default | notes |
|---|---|---|---|
| `title` | string | empty | chart title |
| `x` / `y` / `y2` | string | null | axis labels (use `y2` for dual axis) |
| `legend` | `top` / `bottom` / `left` / `right` / `none` | `bottom` | legend position |
| `tooltip` | `true` / `false` | `true` | hover tooltip |
| `emphasis` | `primary` / `secondary` / `none` | `none` | theme-controlled accent |

Multi-series + dual axis:

```rmd
:::chart area title="Revenue vs MAU" y="Revenue($M)" y2="MAU(K)" legend=top
Q1_2025 120 40
Q2_2025 150 45
Q3_2025 180 60
Q4_2025 240 85
:::
```

---

## grid

Multi-column layout. Cells separated by `---` on their own line.

```rmd
:::grid 3
### Option A
Fast, simple.
---
### Option B
Flexible, heavier.
---
### Option C
Safe, slower.
:::
```

Positional: column count (1–12) or comma-separated responsive breakpoints
(e.g. `1,2,4` for mobile/tablet/desktop).

| attribute | values | default | notes |
|---|---|---|---|
| `gap` | `sm` / `md` / `lg` | `md` | column spacing |
| `layout` | `default` / `masonry` | `default` | masonry uses CSS columns (no JS) |

`grid` cannot nest inside another `grid`. Maximum 12 cells.

---

## callout

Emphasized note, decision, or warning.

```rmd
:::callout tip title="Recommendation"
Pick token bucket for burst-friendly traffic.
:::
```

Positional kind: `info` / `tip` / `warning` / `danger` / `success`.
Optional `title`.

---

## slider

Reader-adjustable number. Pair with `export` to copy the tuned value back.

```rmd
:::slider name=capacity min=10 max=1000 step=10 default=200 unit=req
:::
```

Range slider (two values):

```rmd
:::slider name=qps_range label="QPS window" min=10 max=1000 step=10 default=100,500 scale=log marks=10,100,500,1000
:::
```

Required: `name` (matches `^[a-zA-Z_][a-zA-Z0-9_]*$`), `min`, `max` (`max > min`).

| attribute | type | default | notes |
|---|---|---|---|
| `step` | number > 0 | `1` | |
| `default` | number or `n,m` | `min` | range slider when comma value |
| `unit` | string | empty | suffix shown after value |
| `label` | string | name | display label |
| `scale` | `linear` / `log` / `pow` | `linear` | |
| `marks` | comma-separated numbers | empty | discrete snap points |

Slider names must be unique per document. Block body must be empty.

---

## export

Copy/export template. References slider values with `{{name}}` and supports
`{{name | int}}` formatting.

```rmd
:::export label="Copy config" format=text
rate_limiter:
  capacity: {{capacity | int}}
  refill_rate: {{refill_rate | int}}
:::
```

| attribute | values | default | notes |
|---|---|---|---|
| `label` | string | `复制` | button text |
| `format` | `text` / `markdown` / `json` | `text` | clipboard MIME |

Unknown variables render as `[未定义:name]` and warn in the console.

---

## flow

Directed flow with linear and branching paths.

```rmd
:::flow direction=lr
Design -> Review -> Canary -> Full rollout
Canary -> Incident -> Rollback
:::
```

Each line: `Node -> Node -> ...`. Same-name nodes merge.
`direction`: `lr` (default) or `tb`.

---

## diff

Unified-diff style. `+` add, `-` remove, leading space context.
`@注: ...` adds an inline note (placed at end of `+`/`-` line).

```rmd
:::diff lang=python title="Limiter change"
- @rate_limit(window=60, max=100)
+ @token_bucket(capacity=200, refill=50) @注: adds burst protection
:::
```

---

## tabs

Multiple views in one area. `@label` on its own line starts a panel.

```rmd
:::tabs default=Summary
@Summary
Plain-language explanation.
@Details
Implementation details.
:::
```

Cannot nest inside another `tabs`.

---

## timeline

Vertical or horizontal sequence of dated events.

```rmd
:::timeline
@ 2026-01-01 [title="Kickoff"] [status="success"]
Initial planning done, team formed.

@ 2026-03-15 [title="v0.1"] [status="success"]
Core parser shipped.

@ 2026-05-10 [title="v0.2"] [status="pending"]
Advanced blocks + masonry grid.
:::
```

Each item begins with `@ {time} [title="..."] [status="..."]` on its own line.
Body is normal Markdown until the next `@`.

`status`: `success` / `warning` / `danger` / `pending` / `default`.
`direction`: `vertical` (default) or `horizontal`.

---

## kanban

Columns of cards. `@ {column title}` on its own line starts a column.

```rmd
:::kanban
@ Todo
- [ ] Write the report
- [ ] Run perf tests

@ In progress
- [x] Update parser
- [x] Refactor theme

@ Done
* All conformance tests pass
* Carousel uses pure CSS
:::
```

Use lists (Markdown task lists or bullets) for cards.

---

## details

Collapsible block. Wraps a native `<details>`.

```rmd
:::details title="Architecture changelog" open=true
1. Parser: custom rule dispatch on top of markdown-it.
2. Validator: 20+ new rules for new tree shapes.
3. Renderer: pure HTML output, no React/Vue dependency.
:::
```

| attribute | values | default |
|---|---|---|
| `title` | string | empty |
| `open` | `true` / `false` | `false` |

---

## carousel

Touch / scroll-snap carousel. Cells separated by `---`.

```rmd
:::carousel autoplay=true interval=4000
### Slide 1
First content
---
### Slide 2
Second content
:::
```

| attribute | values | default |
|---|---|---|
| `autoplay` | `true` / `false` | `false` |
| `interval` | number (ms) | `3000` |

---

## embed

Embed external media (video, map, app). Aspect ratio is theme-controlled.

```rmd
:::embed type=video id="https://www.youtube.com/embed/XXXX" aspect-ratio="16/9"
:::
```

| attribute | values | default |
|---|---|---|
| `type` | `video` / `map` / `iframe` | `unknown` |
| `id` | URL or external id | empty |
| `aspect-ratio` | `16/9` / `4/3` / etc. | null |

Block body is ignored.

---

## math

LaTeX math block. Renderer outputs as math container; the active theme
decides whether to typeset (KaTeX/MathJax) or fall back to monospace.

```rmd
:::math
\mathcal{L} = \sum_{i=1}^{N} \left( y_i \log(\hat{y}_i) + (1-y_i) \log(1-\hat{y}_i) \right)
:::
```

---

## Choosing Blocks

| Goal | Suggested blocks |
|---|---|
| Compare options | `grid` + `chart` + `callout` |
| Explain a PR | `diff` + `tabs` + `callout` |
| Tunable prototype | `slider` + `export` |
| Release / workflow | `flow` + `callout` + `timeline` |
| Status report | `chart` + `timeline` + `kanban` |
| Research brief | `chart` + `grid` + `callout` + `details` |
| Long doc with appendix | `details` + `tabs` |
| Visual gallery | `carousel` + `grid layout=masonry` |
| Math / formal | `math` + `callout` |

## Don't

- Don't add CSS, color, pixel, or font attributes — they belong to the theme.
- Don't nest `grid` in `grid`, or `tabs` in `tabs`.
- Don't put body content inside `:::slider` or `:::embed`.
- Don't invent positional arguments beyond what's listed here.
- Don't use experimental block names that aren't in this file.
