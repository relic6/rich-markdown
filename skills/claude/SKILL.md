---
name: rich-markdown
description: Generate Rich Markdown (.rmd) source and self-contained interactive HTML artifacts. Use when the user asks for rmd, Rich Markdown, rich interactive Markdown, token-efficient rich docs, shareable AI documents, charts, sliders, copy/export blocks, flow diagrams, timelines, kanban boards, collapsible details, carousels, embeds, math blocks, comparison reports, PR explainers, tunable prototypes, project status reports, or any rich document that should remain readable as Markdown but render as a polished interactive HTML page.
---

# Rich Markdown

Use this skill when the user wants a rich, readable, interactive document
instead of plain Markdown or hand-written HTML. The local renderer
(`packages/cli`) turns `.rmd` source into a self-contained HTML artifact that
renders in Claude's chat / desktop sandbox, in any browser, or as an offline file.

## Why .rmd over plain Markdown or HTML

- Source stays close to Markdown — diff-friendly, AI-friendly, low-token.
- The renderer adds charts, layouts, sliders, exports, flows, timelines, etc.
  without forcing you to write SVG/CSS/JS.
- One source file, one self-contained HTML. No external assets needed for
  Claude-rendered artifacts.

## Output Choice (decide before writing)

| User intent | What to produce |
|---|---|
| Wants source only | `.rmd` file, no HTML build |
| Wants something to view / share / archive | `.rmd` + `--mode self-contained` HTML |
| Wants smallest artifact + has network | `.rmd` + `--mode cdn` HTML |
| Wants inspectable assets they can host themselves | `.rmd` + `--mode split` directory |
| Wants to demo locally during the session | `rmd open` preview server |

When unsure, default to source `.rmd` plus a `self-contained` HTML build.

## Workflow

1. Decide the smallest useful block set from `references/blocks.md`. Use
   plain Markdown for narrative; use `:::` blocks only when they add density,
   structure, or interaction.

2. Write the `.rmd` file. Always include a YAML frontmatter with at least
   `title`. Suggested location: `examples/<short-name>.rmd`.

3. Validate the source with the Bash tool:

   ```bash
   npm run rmd -- validate path/to/doc.rmd
   ```

   If validation fails, fix the source. Do not return a file that fails
   validation.

4. Build the artifact:

   ```bash
   # Default: single self-contained HTML
   npm run rmd -- build path/to/doc.rmd --mode self-contained --out path/to/doc.html

   # CDN-loaded variant (small artifact, requires network at view time)
   npm run rmd -- build path/to/doc.rmd --mode cdn --version 0.1.0 --out path/to/doc.html

   # Split directory (HTML + JS + CSS as separate files)
   npm run rmd -- build path/to/doc.rmd --mode split --out path/to/dist/index.html
   ```

5. (Optional) Local preview during the session:

   ```bash
   npm run rmd -- open path/to/doc.rmd --port 0 --host 127.0.0.1 --no-open true
   ```

   The CLI prints the bound URL. Use `--no-open true` so the agent does not
   try to launch a desktop browser.

6. Return the generated HTML file path to the user. If self-contained, the
   file alone is the deliverable.

## Rules (these are hard constraints)

- **No styling in source.** Never write colors, pixel sizes, fonts, or layout
  CSS into `.rmd`. Use semantic attributes like `emphasis=primary` and let
  the theme decide visuals. (Themes can change; source must not.)

- **Diff-clean edits.** One semantic change should touch only nearby lines.
  Don't reorder unrelated attributes or rewrite a whole file for a small fix.

- **Validate before shipping.** Validation failures are not warnings. Fix
  the source before returning the artifact.

- **Plain Markdown for fragile content.** Use plain Markdown — code blocks,
  tables, blockquotes — for anything you're unsure how to express in `.rmd`.
  Don't invent block names.

- **Self-contained for sandboxes.** If the user will view the artifact inside
  Claude's sandbox, in email, or anywhere external assets can't be fetched,
  use `--mode self-contained`. `split` mode will not load in those contexts.

## Block Selection Cheatsheet

Map the user's intent to the smallest block set that delivers value:

| Intent | Blocks |
|---|---|
| Compare options / approaches | `grid` + `chart` + `callout` |
| PR / code review explainer | `diff` + `tabs` + `callout` |
| Tunable prototype (params + copy back to chat) | `slider` + `export` |
| Release / workflow | `flow` + `callout` + `timeline` |
| Project status report | `chart` + `timeline` + `kanban` |
| Research brief | `chart` + `grid` + `details` |
| Showcase / gallery | `carousel` + `grid layout=masonry` |
| Long doc with collapsible appendix | `details` + `tabs` |
| Math / formal explanation | `math` + `callout` |

The 14 supported blocks (v0.2): `chart`, `grid`, `callout`, `slider`,
`export`, `flow`, `diff`, `tabs`, `timeline`, `kanban`, `details`, `carousel`,
`embed`, `math`. Full reference: `references/blocks.md`.

## Default Recipe

For Claude-visible rich output:

1. Write `examples/<short-name>.rmd` with appropriate blocks.
2. `npm run rmd -- validate examples/<short-name>.rmd`
3. `npm run rmd -- build examples/<short-name>.rmd --mode self-contained --out examples/<short-name>.html`
4. Return `examples/<short-name>.html` as the deliverable.

See `examples/` in this skill for two ready-to-study patterns:
- `examples/decision-report.rmd` — comparison + chart + callout
- `examples/tunable-config.rmd` — slider + export + flow

## References

- `references/blocks.md` — all 14 block types with attributes and examples
- `references/artifacts.md` — build modes, validation, frontmatter tips
