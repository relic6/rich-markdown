# Rich Markdown Artifacts

## Source First

Always write `.rmd` source first. It is the canonical artifact and must remain
readable in plain Markdown tools. The HTML build is a derived view that can
be regenerated any time.

## Three Build Modes

The CLI supports three output modes via `--mode`. Pick based on where the
artifact will be viewed.

### self-contained (default)

```bash
npm run rmd -- build path/to/doc.rmd --mode self-contained --out path/to/doc.html
```

Single HTML file with the renderer, theme CSS, runtime, and `.rmd` source all
inlined. Zero external dependencies. Best for:

- {{display_name}} desktop / chat sandbox (the artifact has to be self-contained)
- Email attachments
- Offline / archival
- S3 / static-host one-click sharing
- Any place where the consumer cannot install or fetch the renderer

Tradeoff: file size is larger (~50–150 KB) because the renderer is inlined.

### cdn

```bash
npm run rmd -- build path/to/doc.rmd --mode cdn --version 0.1.0 --out path/to/doc.html
```

Small HTML shell containing only the `.rmd` source plus a script tag pointing
at a pinned CDN version of the renderer. Best for:

- Blog posts, Notion, web pages where the renderer can be fetched from CDN
- When the artifact itself must be small (token economy)

Requires `--version` to be a complete semver (e.g. `0.1.0`); `latest` is rejected
because sandboxed viewers must not depend on a moving CDN target.

### split

```bash
npm run rmd -- build path/to/doc.rmd --mode split --out path/to/dist/index.html
```

Writes the HTML alongside `rmd.min.js` and `themes/<theme>.css` as separate
files in the same directory. Best for:

- Local development / hot reload
- Custom hosting where you want to serve the renderer from your own origin
- Inspecting the generated assets

Cannot be opened in sandboxed environments ({{display_name}} artifact,
email) because the relative asset paths will 404.

## Validation

Always validate before building or returning to the user:

```bash
npm run rmd -- validate path/to/doc.rmd
```

Validation prints `ok` on success or a list of `path: message` lines on failure.
If validation fails, fix the source and re-run. Do not ship a file that fails
validation — the renderer may degrade silently to plain code blocks.

## Recommended Default

For most {{display_name}}-driven requests:

```bash
npm run rmd -- validate examples/my-doc.rmd
npm run rmd -- build examples/my-doc.rmd --mode self-contained --out examples/my-doc.html
```

Return the path `examples/my-doc.html`.

## Local Preview During the Session

When the user wants to interact with the artifact while you iterate:

```bash
npm run rmd -- open path/to/doc.rmd --port 0 --host 127.0.0.1 --no-open true
```

The CLI prints the bound URL. Use `--no-open true` so the agent does not try
to launch a desktop browser.

## Frontmatter Tips

Every `.rmd` should start with a frontmatter block. Useful fields:

```yaml
---
title: Quarterly Roadmap        # Required for sharing & metadata
theme: default                  # Theme id; only `default` ships today
share: private                  # private / team / public
description: Short summary...   # Used by share cards / OG
lang: zh-CN                     # BCP 47 — affects type/font defaults
---
```

Unknown fields are kept but ignored. Custom fields should use the `x-` prefix
to mark them as non-core (e.g. `x-team: backend`).

## Iteration Loop

When the user asks for revisions, re-run validate and build only — do not
rewrite unrelated parts of the source. The skill optimizes for clean diffs;
preserve the user's existing block structure unless they explicitly ask
otherwise.
