import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "../packages/parser-core/src/index.js";
import { createRenderer, render } from "../packages/renderer/src/index.js";
import { renderFragmentToString, renderNode, renderToString } from "../packages/renderer-core/src/index.js";

test("renders the quickstart example to stable semantic HTML", () => {
  const source = readFileSync(new URL("../examples/rate-limit-decision.rmd", import.meta.url), "utf8");
  const html = renderToString(source);

  assert.match(html, /<main class="rmd-document" data-rmd-version="0\.1\.0">/);
  assert.match(html, /data-rmd-block="grid"/);
  assert.match(html, /data-rmd-block="chart"/);
  assert.match(html, /<title>1000 RPS 压测下的 P99 延迟/);
  assert.match(html, /data-rmd-block="slider"/);
  assert.match(html, /data-unit=""/);
  assert.match(html, /data-references="capacity,refill_rate,burst_window"/);
  assert.match(html, /data-rmd-block="flow"/);
  assert.match(html, /rmd-diff-add/);
});

test("escapes user-controlled content in rendered HTML", () => {
  const ast = parse(`# <script>alert(1)</script>

:::export label="<copy>"
<danger>{{x}}</danger>
:::`);
  const html = renderToString(ast);

  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&lt;copy&gt;/);
  assert.match(html, /&lt;danger&gt;{{x}}&lt;\/danger&gt;/);
});

test("renders fallback code blocks with warnings", () => {
  const html = renderNode({
    type: "code-block",
    lang: "rmd",
    value: ":::unknown\nx\n:::",
    warnings: ["unknown-block: unknown"]
  });

  assert.match(html, /data-rmd-warning="unknown-block: unknown"/);
  assert.match(html, /language-rmd/);
});

test("creates a renderer facade with default theme", () => {
  const renderer = createRenderer({ theme: "paper" });
  const html = renderer.renderToString("# Hello");

  assert.match(html, /data-rmd-theme="paper"/);
  assert.match(html, /<h1>Hello<\/h1>/);
});

test("renders a fragment for DOM injection", () => {
  const fragment = renderFragmentToString("# Hello\n\n:::callout tip\nDone\n:::");

  assert.doesNotMatch(fragment, /<!doctype html>/);
  assert.match(fragment, /<h1>Hello<\/h1>/);
  assert.match(fragment, /data-rmd-block="callout"/);
});

test("injects rendered HTML into a target without requiring hydration", () => {
  const target = { innerHTML: "", dataset: {} };
  const result = render({
    source: "# Hello",
    target,
    theme: "paper",
    hydrate: false
  });

  assert.match(target.innerHTML, /<h1>Hello<\/h1>/);
  assert.equal(target.dataset.rmdTheme, "paper");
  assert.equal(target.dataset.rmdVersion, "0.1.0");
  assert.equal(result.runtime, null);
});
