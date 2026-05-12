import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "../packages/parser-core/src/index.js";
import { createRenderer, render } from "../packages/renderer/src/index.js";
import { renderFragmentToString, renderNode, renderToString } from "../packages/renderer-core/src/index.js";

test("renders the v0.2 showcase example to stable semantic HTML", () => {
  const source = readFileSync(new URL("../examples/v0.2-showcase.rmd", import.meta.url), "utf8");
  const html = renderToString(source);

  assert.match(html, /<main class="rmd-document" data-rmd-version="0\.1\.0">/);
  assert.match(html, /data-rmd-block="grid"/);
  assert.match(html, /data-rmd-block="chart"/);
  assert.match(html, /<title>核心包体积对比/);
  assert.match(html, /data-rmd-block="slider"/);
  assert.match(html, /data-unit="QPS"/);
  assert.match(html, /data-rmd-block="timeline"/);
  assert.match(html, /data-rmd-block="kanban"/);
  assert.match(html, /data-rmd-block="carousel"/);
  assert.match(html, /data-rmd-block="math"/);
  assert.match(html, /data-rmd-block="flow"/);
  assert.match(html, /rmd-diff-add/);
});

test("renders each chart type with type-specific SVG geometry", () => {
  const cases = [
    ["bar", "A 10\nB 20", /<rect\b/],
    ["line", "A 10\nB 20\nC 15", /<polyline\b/],
    ["pie", "A 40\nB 35\nC 25", /<path\b/],
    ["scatter", "A 1 8\nB 2 5\nC 3 12", /<circle\b/],
    ["radar", "A 80 70\nB 60 90\nC 75 65", /<polygon\b/],
    ["area", "A 10\nB 20\nC 15", /<path\b[^>]*class="rmd-chart-area-fill"/],
    ["donut", "A 40\nB 35\nC 25", /<circle\b[^>]*class="rmd-chart-donut-hole"/],
    ["heatmap", "Mon 1 2\nTue 3 4", /data-series-index="1"/]
  ];

  for (const [type, data, expectedGeometry] of cases) {
    const html = renderFragmentToString(`:::chart ${type} title="${type}"\n${data}\n:::`);

    assert.match(html, new RegExp(`rmd-chart-${type}`));
    assert.match(html, expectedGeometry);
  }
});

test("renders range sliders as paired range inputs", () => {
  const html = renderFragmentToString(`:::slider name=volume_range label="Range" min=10 max=1000 step=10 default="100,500" unit="QPS"
:::`); 

  assert.match(html, /data-range="true"/);
  assert.match(html, /class="rmd-slider-range-control"/);
  assert.match(html, /class="rmd-slider-range-track"/);
  assert.match(html, /--rmd-range-start: 9\.09%/);
  assert.match(html, /--rmd-range-end: 49\.49%/);
  assert.match(html, /data-bound="min"/);
  assert.match(html, /data-bound="max"/);
  assert.match(html, /value="100"/);
  assert.match(html, /value="500"/);
  assert.match(html, />100 - 500 QPS<\/output>/);
});

test("renders math blocks as formula displays instead of code blocks", () => {
  const html = renderFragmentToString(`:::math
E = mc^2
:::`);

  assert.match(html, /data-rmd-block="math"/);
  assert.match(html, /class="rmd-math-display"/);
  assert.match(html, /role="math"/);
  assert.match(html, /data-latex="E = mc\^2"/);
  assert.match(html, />E = mc\^2<\/div>/);
  assert.doesNotMatch(html, /<pre><code class="language-latex">/);
});

test("renders carousel controls and slide indicators", () => {
  const html = renderFragmentToString(`:::carousel autoplay="true" interval="1200"
First
---
Second
:::`); 

  assert.match(html, /data-rmd-block="carousel"/);
  assert.match(html, /data-autoplay="true"/);
  assert.match(html, /data-rmd-carousel="prev"/);
  assert.match(html, /data-rmd-carousel="next"/);
  assert.match(html, /class="rmd-carousel-dot"/);
  assert.match(html, /aria-current="true"/);
  assert.match(html, /aria-label="Go to slide 2"/);
});

test("renders bullet shorthand timelines and loose callout titles", () => {
  const html = renderFragmentToString(`:::timeline
- **寄存器**: 速度最快，容量极小 (CPU 内部)
- **高速缓存 (Cache)**: 缓解 CPU 与内存速度矛盾
:::

:::callout emphasis=secondary title=Cache 考点总结
- **映射方式**: 直接映射
:::`); 

  assert.match(html, /data-rmd-block="timeline"/);
  assert.match(html, /<div class="rmd-timeline-time">寄存器<\/div>/);
  assert.match(html, /缓解 CPU 与内存速度矛盾/);
  assert.match(html, /class="rmd-callout-title">Cache 考点总结<\/h3>/);
  assert.doesNotMatch(html, /timeline-empty-items/);
});

test("renders card blocks as semantic card sections", () => {
  const html = renderFragmentToString(`:::grid cols=2
:::card title=常用协议映射
- **应用层**: HTTP, FTP, DNS, DHCP
- **网络层**: IP, ICMP, ARP, RARP
:::
:::card title=OSI 七层模型
1. 物理层
2. 数据链路层
:::
:::`);

  assert.match(html, /data-rmd-block="grid"/);
  assert.match(html, /data-columns="2"/);
  assert.match(html, /data-rmd-block="card"/);
  assert.match(html, /class="rmd-card-title">常用协议映射<\/h3>/);
  assert.match(html, /<strong>应用层<\/strong>/);
  assert.doesNotMatch(html, /:::card/);
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
