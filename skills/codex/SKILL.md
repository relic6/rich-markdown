---
name: rich-markdown
description: Generate Rich Markdown (.rmd) documents and self-contained Rich Markdown HTML artifacts for AI-authored reports, plans, comparisons, PR explanations, prototypes, and research briefs. Use when the user asks for rmd, Rich Markdown, rich interactive Markdown, token-efficient rich docs, shareable AI documents, charts, sliders, export/copy blocks, flow diagrams, or wants a Codex response rendered with the local Rich Markdown renderer.
---

# Rich Markdown

Use this skill when the user wants a rich, readable, interactive document instead of plain Markdown or hand-written HTML.

## Output Choice

- If the user asks for a file or artifact: write a `.rmd` file first, then run the local renderer to validate/build it.
- If the user wants something viewable inside Codex or shareable as one file: build a self-contained HTML artifact from `.rmd`.
- If the user asks for source only: output `.rmd` source, not HTML.

## Workflow

1. Choose the smallest useful block set from `references/blocks.md`.
2. Write normal Markdown for narrative text.
3. Use `:::` blocks only when they add density or interaction.
4. Validate the `.rmd`:

```bash
npm run rmd -- validate <file.rmd>
```

5. For a single viewable file:

```bash
npm run rmd -- build <file.rmd> --mode self-contained --out <file.html>
```

6. For local preview:

```bash
npm run rmd -- open <file.rmd>
```

## Rules

- Do not write colors, pixels, fonts, or layout styling into `.rmd`.
- Prefer `emphasis=primary` over visual attributes.
- Keep source diff clean: one semantic change should touch only nearby lines.
- Unknown or fragile content should fall back to normal Markdown.
- Use `slider` + `export` when the reader should tune values and copy the result back to Codex or code.

## References

- Block syntax: `references/blocks.md`
- Artifact template guidance: `references/artifacts.md`

## Good Default

For Codex-visible rich output, create a file like `examples/my-doc.rmd`, validate it, then build `examples/my-doc.html` in self-contained mode. Return a link to the HTML file.
