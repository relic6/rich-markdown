# Rich Markdown for Obsidian

Experimental Obsidian plugin for editing and rendering Rich Markdown (`.rmd`) notes.

## Current Milestone

This package implements the first development slice from `docs/OBSIDIAN-PLUGIN-DESIGN.md`:

- plugin manifest and esbuild bundle
- settings for theme, default view mode, debounce, and `.md` rendering
- `.md` Reading mode rendering for fenced `rmd` code blocks
- Shadow DOM host that injects RMD theme CSS without leaking into Obsidian
- initial `.rmd` split/preview/live view surface
- commands for mode switching, HTML export, theme cycling, and snippet insertion

## Local Build

```bash
npm run obsidian:build
```

Copy `packages/obsidian-plugin/dist/main.js`, `manifest.json`, and `styles.css` into:

```text
<vault>/.obsidian/plugins/rich-markdown/
```

Then enable the plugin from Obsidian Community Plugins.
