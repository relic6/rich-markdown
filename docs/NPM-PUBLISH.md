# Publishing `r-markdown` to npm

This guide explains how to publish the public npm package `r-markdown`.
The installed command remains `rmd`.

Official references:

- npm publish command: <https://docs.npmjs.com/cli/commands/npm-publish>
- npm two-factor authentication: <https://docs.npmjs.com/about-two-factor-authentication>

## Package Shape

The package is published as:

```json
{
  "name": "r-markdown",
  "bin": {
    "rmd": "./packages/cli/src/index.js"
  }
}
```

Users install the package with:

```bash
npm install r-markdown
```

They run the CLI with:

```bash
npx rmd --version
npx rmd init --ai codex
npx rmd init --ai claude
```

## Prerequisites

1. Create or use an npm account.
2. Enable two-factor authentication if npm requires it for publishing.
3. Make sure you can log in from the terminal.
4. Make sure the package version in `package.json` has not already been published.

Check the current npm identity:

```bash
npm whoami
```

If this fails, log in:

```bash
npm login
```

Use the official npm registry for publishing:

```bash
npm config get registry
npm config set registry https://registry.npmjs.org/
```

## Confirm the Package Name

Before first publish, confirm that `r-markdown` is still unclaimed:

```bash
npm view r-markdown name version
```

Expected result for an unclaimed package is an npm `E404 Not Found` response.

If the command returns package metadata, do not publish under this name unless
you control that package.

## Prepublish Checks

Run the test suite:

```bash
npm test
```

Inspect the exact tarball contents without publishing:

```bash
npm pack --dry-run
```

The package should include at least:

- `package.json`
- `packages/cli/src/index.js`
- `packages/cli/assets/skills/codex/SKILL.md`
- `packages/cli/assets/skills/claude/SKILL.md`
- `packages/parser-core/`
- `packages/renderer/`
- `packages/runtime/`
- `packages/themes-default/`
- `packages/validator/`
- `dist/`

## Local Install Simulation

Before publishing, install the generated tarball into a temporary project and
verify the public install experience:

```bash
tmp_pack=$(mktemp -d)
tmp_project=$(mktemp -d)

tarball=$(npm pack --pack-destination "$tmp_pack" --silent)
npm install --prefix "$tmp_project" "$tmp_pack/$tarball"

cd "$tmp_project"
npx rmd --version
npx rmd init --ai codex
npx rmd init --ai claude
```

Confirm the skill files exist:

```bash
test -f "$tmp_project/.codex/skills/rich-markdown/SKILL.md"
test -f "$tmp_project/.claude/skills/rich-markdown/SKILL.md"
```

## Publish

Publish from the repository root:

```bash
cd /Users/relic/workspaces/rich-markdown
npm publish
```

If npm asks for a one-time password:

```bash
npm publish --otp 123456
```

Do not reuse a version number. Once `r-markdown@x.y.z` is published, that exact
version cannot be published again.

## Verify After Publish

Check the published metadata:

```bash
npm view r-markdown name version bin
```

Install from npm in a clean project:

```bash
tmp_project=$(mktemp -d)
npm install --prefix "$tmp_project" r-markdown
cd "$tmp_project"
npx rmd --version
npx rmd init --ai codex
```

Confirm the generated skill path:

```bash
test -f "$tmp_project/.codex/skills/rich-markdown/SKILL.md"
```

## Publishing a New Version

For a bug fix:

```bash
npm version patch
npm publish
```

For a backward-compatible feature:

```bash
npm version minor
npm publish
```

For a breaking change:

```bash
npm version major
npm publish
```

`npm version` updates `package.json` and `package-lock.json` and creates a git
commit/tag by default. If you do not want npm to create a git tag, use:

```bash
npm version patch --no-git-tag-version
```

## Troubleshooting

If `npm publish` says the package already exists, check:

```bash
npm view r-markdown name version maintainers
```

If `npm publish` says the version already exists, bump the version:

```bash
npm version patch
```

If `npx rmd` is not found after install, inspect the package `bin` metadata:

```bash
npm view r-markdown bin
```

If skill files are missing after `rmd init`, inspect the tarball:

```bash
npm pack --dry-run
```

Make sure `packages/cli/assets/skills/` is included.
