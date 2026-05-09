# Rich Markdown Artifacts

## Source First

Always write `.rmd` source first. It is the canonical artifact and should remain readable in plain Markdown tools.

## Self-contained HTML

Use self-contained HTML when the user wants to view or share the result immediately:

```bash
npm run rmd -- build path/to/doc.rmd --mode self-contained --out path/to/doc.html
```

This embeds the current renderer, theme CSS, source `.rmd`, and interaction runtime. It is the best current mode for Codex Desktop.

## Split HTML

Use split mode when the user wants inspectable local assets:

```bash
npm run rmd -- build path/to/doc.rmd --mode split --out path/to/index.html
```

This writes `index.html`, `rmd.min.js`, and `themes/default.css`.

## Validation

Before presenting an artifact, run:

```bash
npm run rmd -- validate path/to/doc.rmd
```

Then run one of:

```bash
npm run rmd -- build path/to/doc.rmd --mode self-contained --out path/to/doc.html
npm run rmd -- open path/to/doc.rmd --no-open true
```

Report the generated HTML path to the user.
