import assert from "node:assert/strict";
import test from "node:test";
import { scopeThemeCss } from "../src/theme-css.js";

test("scopes document-level theme selectors to the shadow host", () => {
  const scoped = scopeThemeCss(`
:root { --rmd-color-fg: #111; }
body[data-rmd-theme] { margin: 0; }
body[data-rmd-theme]::before { content: ""; }
`);

  assert.match(scoped, /:host \{ --rmd-color-fg/);
  assert.match(scoped, /:host \{ margin: 0/);
  assert.match(scoped, /:host::before \{ content/);
  assert.doesNotMatch(scoped, /body\[data-rmd-theme\]/);
  assert.doesNotMatch(scoped, /:root/);
});
