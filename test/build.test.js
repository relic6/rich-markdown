import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildHtml, createRenderer } from "../packages/renderer/src/index.js";

const source = readFileSync(new URL("../examples/v0.2-showcase.rmd", import.meta.url), "utf8");

test("builds self-contained HTML without external resources", () => {
  const html = buildHtml(source, { mode: "self-contained", theme: "default" });

  assert.match(html, /<style data-rmd-theme-inline="default">/);
  assert.match(html, /<script data-rmd-runtime-inline>/);
  assert.match(html, /window\.RMD_STATE = state/);
  assert.match(html, /<script type="application\/rmd">/);
  assert.match(html, /data-rmd-block="chart"/);
  assert.doesNotMatch(html, /<script src=/);
  assert.doesNotMatch(html, /<link rel="stylesheet"/);
});

test("builds CDN mode with a pinned semver renderer version", () => {
  const html = buildHtml(source, { mode: "cdn", theme: "tech-dark", version: "0.1.0" });

  assert.match(html, /cdnjs\.cloudflare\.com\/ajax\/libs\/rmd-renderer\/0\.1\.0\/rmd\.min\.js/);
  assert.match(html, /themes\/tech-dark\.css/);
  assert.match(html, /RMD\.render\(\{source:document\.querySelector/);
  assert.match(html, /target:document\.getElementById\('rmd-root'\)/);
  assert.doesNotMatch(html, /latest/);
});

test("rejects unpinned CDN versions", () => {
  assert.throws(() => buildHtml(source, { mode: "cdn", version: "latest" }), /pinned semver/);
});

test("builds split mode with local resource references", () => {
  const html = buildHtml(source, {
    mode: "split",
    theme: "paper",
    scriptPath: "./assets/rmd.min.js",
    themePath: "./assets/paper.css"
  });

  assert.match(html, /src="\.\/assets\/rmd\.min\.js"/);
  assert.match(html, /href="\.\/assets\/paper\.css"/);
  assert.match(html, /theme:"paper"/);
});

test("renderer facade exposes buildHtml with default theme", () => {
  const renderer = createRenderer({ theme: "paper" });
  const html = renderer.buildHtml("# Hello", { mode: "split" });

  assert.match(html, /themes\/paper\.css/);
});
