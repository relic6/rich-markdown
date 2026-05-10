---
name: rich-markdown
description: Generate Rich Markdown (.rmd) documents and self-contained Rich Markdown HTML artifacts for AI-authored reports, plans, comparisons, PR explanations, prototypes, research briefs, timelines, kanbans, and tunable interactive demos. Use when the user asks for rmd, Rich Markdown, rich interactive Markdown, token-efficient rich docs, shareable AI documents, charts, sliders, export/copy blocks, flow diagrams, timelines, kanban boards, collapsible details, carousels, embeds, math blocks, or wants a Codex response rendered with the local Rich Markdown renderer.
---

# Rich Markdown

Use this skill when the user wants a rich, readable, interactive document
instead of plain Markdown or hand-written HTML. The local renderer
(`packages/cli`) turns `.rmd` source into a self-contained HTML artifact.

## Output Choice

- User wants a file or artifact: write a `.rmd` file first, then build HTML.
- User wants something viewable inside Codex or shareable as one file:
  build a self-contained HTML artifact from the `.rmd`.
- User wants source only: output `.rmd` source, do not build HTML.
- User wants a multi-file site (assets they can inspect or host): use `--mode split`.

## Workflow

1. Choose the smallest useful block set from `references/blocks.md`.
   Plain Markdown for narrative, `:::` blocks only when they add density,
   structure, or interaction.
2. Write the `.rmd` to a sensible path under `examples/` (or wherever the
   user asks). Always include a YAML frontmatter with at least `title`.
3. Validate the source. Fail fast if the parser reports issues:

   ```bash
   npm run rmd -- validate path/to/doc.rmd
   ```

4. Build for the chosen consumption mode:

   ```bash
   # Single self-contained HTML — best default for Codex Desktop / sharing
   npm run rmd -- build path/to/doc.rmd --mode self-contained --out path/to/doc.html

   # CDN-loaded variant — small artifact, requires network at view time
   npm run rmd -- build path/to/doc.rmd --mode cdn --version 0.1.0 --out path/to/doc.html

   # Split mode — index.html + rmd.min.js + themes/<name>.css for inspection / hosting
   npm run rmd -- build path/to/doc.rmd --mode split --out path/to/dist/index.html
   ```

5. For local interactive preview (will start a local HTTP server):

   ```bash
   npm run rmd -- open path/to/doc.rmd --port 0 --no-open true
   ```

6. Report the generated HTML path back to the user.

## Rules

- Never put colors, pixels, fonts, or layout styling into `.rmd`. Use
  `emphasis=primary|secondary|none` and let the theme decide visuals.
- Keep source diff clean: one semantic edit should touch only nearby lines.
  Do not reorder unrelated attributes or rewrite whole files for tiny changes.
- Unknown or fragile content (rare formats, edge cases) must fall back to
  plain Markdown rather than invented block names.
- Use `:::slider` + `:::export` whenever the reader should tune values and
  copy the result back to Codex or to code.
- Validation failures are not warnings: fix the source, do not ship the file.

## Block Selection Cheatsheet

Map the user's intent to the smallest block set that delivers value:

| Intent | Blocks |
|---|---|
| Compare options / approaches | `grid` + `chart` + `callout` |
| PR / code review explainer | `diff` + `tabs` + `callout` |
| Tunable prototype | `slider` + `export` |
| Release / workflow | `flow` + `callout` + `timeline` |
| Project status report | `chart` + `timeline` + `kanban` |
| Research brief | `chart` + `grid` + `details` |
| Showcase / gallery | `carousel` + `grid layout=masonry` |
| Long doc with appendix | `details` + `tabs` |
| Math / formal explanation | `math` + `callout` |

Full block reference: `references/blocks.md`.
Build mode reference: `references/artifacts.md`.

## Default Recipe

For Codex-visible rich output:

1. Write `examples/<short-name>.rmd` with appropriate blocks.
2. `npm run rmd -- validate examples/<short-name>.rmd`
3. `npm run rmd -- build examples/<short-name>.rmd --mode self-contained --out examples/<short-name>.html`
4. Return `examples/<short-name>.html` as the deliverable.
