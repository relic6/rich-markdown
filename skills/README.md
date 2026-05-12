# Rich Markdown Skills

This directory holds the per-AI skill packs (the prompt + reference content an
AI loads when it sees a Rich Markdown task). 95% of that content is identical
across AIs, so we keep one canonical source under `shared/` plus a tiny
per-platform JSON adapter under `platforms/`. The assembled output lives in
`dist/`.

## Layout

```
skills/
├── shared/                       # Canonical source — edit here.
│   ├── SKILL.md                  # Template (uses {{display_name}} / {{description}})
│   ├── references/
│   │   ├── blocks.md             # All 14 .rmd block types
│   │   └── artifacts.md          # Build modes, validation, frontmatter
│   └── examples/
│       ├── decision-report.rmd
│       └── tunable-config.rmd
│
├── platforms/                    # One JSON per supported AI.
│   ├── claude.json
│   ├── codex.json
│   └── gemini.json
│
├── dist/                         # Assembled output — checked in, regenerable.
│   ├── claude/
│   ├── codex/
│   └── gemini/
│
└── README.md                     # You are here.
```

Anything inside `dist/` is overwritten by `npm run build:skills`; do **not**
hand-edit those files.

## Adding a new platform

1. Create `skills/platforms/<id>.json`:

   ```json
   {
     "id": "<id>",
     "display_name": "<Pretty Name>",
     "description": "<one-paragraph trigger prose>",
     "install_root": ".<id>/skills/rich-markdown"
   }
   ```

   - `description` is what the host AI reads to decide whether to invoke the
     skill, so write it in the tone / vocabulary that platform expects.
   - `display_name` is substituted into every `{{display_name}}` placeholder
     in the shared `SKILL.md` / `references/artifacts.md`.
   - `install_root` is where `rmd init --ai <id>` will copy the assembled
     tree on the user's machine.

2. Run `npm run build:skills`. A fresh `skills/dist/<id>/` appears.

3. (Optional) Add an entry to the CLI's `PLATFORM_TARGETS` table in
   `packages/cli/src/index.js` so `rmd init --ai <id>` works.

## Editing the canonical content

- Update `skills/shared/SKILL.md` or `skills/shared/references/*.md`.
- Run `npm run build:skills`. The diff for `skills/dist/` should show the
  same change applied to every platform.
- Templated files (placeholder substitution applied): `SKILL.md`,
  `references/artifacts.md`. Everything else (block reference, `.rmd`
  examples) is copied byte-identically — `.rmd` examples must stay
  byte-accurate because they are parsed at render time.

## Placeholders

The template engine is intentionally tiny. Only `{{name}}` substitution is
supported, where `name` is a key in the platform's JSON file. Unknown
placeholders throw at build time so we never ship `{{...}}` literals.

Currently used placeholders:

| Placeholder | Source field | Where it appears |
|---|---|---|
| `{{description}}` | `<id>.json` → `description` | `SKILL.md` frontmatter |
| `{{display_name}}` | `<id>.json` → `display_name` | `SKILL.md` body, `references/artifacts.md` |

Adding a new placeholder is fine — just declare a default in every
`<id>.json` so platforms that didn't opt in don't blow up the build.

## CLI integration

`rmd init --ai <id>` resolves the source directory by trying these paths in
order (first hit wins):

1. `skills/dist/<id>/` — the assembled output (preferred).
2. `assets/skills/<id>/` — published-package layout.

So a normal checkout works as long as `npm run build:skills` has been run
at least once and `skills/dist/` is checked in.
