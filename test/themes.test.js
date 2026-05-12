import assert from "node:assert/strict";
import test from "node:test";
import { themes } from "../packages/themes-default/src/index.js";

test("all official themes include card-specific styling", () => {
  for (const [themeName, css] of Object.entries(themes)) {
    assert.match(css, /\.rmd-card\b/, `${themeName} should style card surfaces`);
    assert.match(css, /\.rmd-card-title\b/, `${themeName} should style card titles`);
    assert.match(css, /\.rmd-card-body\b/, `${themeName} should style card body text`);
  }
});

test("non-default themes override the default card accent treatment", () => {
  assert.match(themes.default, /\.rmd-card::before[\s\S]*linear-gradient/);
  assert.match(themes.paper, /\.rmd-card::before[\s\S]*display: none/);
  assert.match(themes["notion-like"], /\.rmd-card::before[\s\S]*display: none/);
  assert.match(themes["tech-dark"], /\.rmd-card::before[\s\S]*box-shadow/);
});
