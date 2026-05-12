import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "../packages/parser-core/src/index.js";
import { validate } from "../packages/validator/src/index.js";

test("parses the v0.2 showcase example into core AST nodes", () => {
  const source = readFileSync(new URL("../examples/v0.2-showcase.rmd", import.meta.url), "utf8");
  const ast = parse(source);
  const validation = validate(ast);

  assert.equal(validation.ok, true);
  assert.equal(ast.frontmatter.title, "Rich Markdown v0.2 Showcase");
  assert.deepEqual(ast.warnings, []);

  // The showcase exercises every block type at least once.
  const typeSet = new Set(ast.children.map((node) => node.type));
  for (const blockType of [
    "timeline", "kanban", "carousel", "details", "embed", "math",
    "grid", "chart", "slider", "tabs", "flow", "diff", "export"
  ]) {
    assert.ok(typeSet.has(blockType), `missing block type: ${blockType}`);
  }

  // First chart is the "核心包体积对比" bar chart.
  const firstChart = ast.children.find((node) => node.type === "chart");
  assert.equal(firstChart.chartType, "bar");
  assert.equal(firstChart.title, "核心包体积对比（KB gzip）");
  assert.equal(firstChart.data[0].label, "Parser");
  assert.deepEqual(firstChart.data[0].values, [18]);

  // The showcase contains all 8 chart types.
  const chartTypes = ast.children
    .filter((node) => node.type === "chart")
    .map((node) => node.chartType);
  assert.deepEqual(
    chartTypes.sort(),
    ["area", "bar", "donut", "heatmap", "line", "pie", "radar", "scatter"]
  );

  // First grid in the showcase is the 3-column masonry layout.
  const grid = ast.children.find((node) => node.type === "grid");
  assert.equal(grid.columns, 3);
  assert.equal(grid.layout, "masonry");

  // Slider section uses a single range slider.
  const slider = ast.children.find((node) => node.type === "slider");
  assert.equal(slider.name, "volume_range");
  assert.deepEqual(slider.default, [100, 500]);

  // Flow has three sequential edges ending at Browser.
  const flow = ast.children.find((node) => node.type === "flow");
  assert.deepEqual(flow.edges.at(-1), { from: "HTML", to: "Browser" });

  // Diff has one removal followed by two additions.
  const diff = ast.children.find((node) => node.type === "diff");
  assert.deepEqual(diff.lines.map((line) => line.kind), ["remove", "add", "add"]);

  // Export uses JSON format (no template references).
  const exportNode = ast.children.find((node) => node.type === "export");
  assert.equal(exportNode.label, "复制代码片段");
  assert.equal(exportNode.format, "json");
});

test("parses basic CommonMark inline nodes", () => {
  const ast = parse("# 标题含 `code`\n\n正文 **加粗** 和 [链接](https://example.com)。");

  assert.equal(ast.children[0].children[1].type, "inline-code");
  assert.equal(ast.children[1].children[1].type, "strong");
  assert.equal(ast.children[1].children[3].type, "link");
  assert.equal(ast.children[1].children[3].url, "https://example.com");
});

test("parses CommonMark block structures through markdown-it", () => {
  const ast = parse(`> quoted **text**

- one
- two

3. third
4. fourth

---

<aside>raw html</aside>`);

  assert.equal(ast.children[0].type, "blockquote");
  assert.equal(ast.children[0].children[0].children[1].type, "strong");
  assert.equal(ast.children[1].type, "list");
  assert.equal(ast.children[1].ordered, false);
  assert.equal(ast.children[1].children[0].type, "list-item");
  assert.equal(ast.children[2].type, "list");
  assert.equal(ast.children[2].ordered, true);
  assert.equal(ast.children[2].start, 3);
  assert.equal(ast.children[3].type, "thematic-break");
  assert.equal(ast.children[4].type, "html-block");
});

test("does not parse RMD fences inside Markdown code blocks", () => {
  const ast = parse(`\`\`\`rmd
:::callout info title="Example"
This should stay source.
:::
\`\`\`

:::tabs default="RMD源码"
@ RMD源码
\`\`\`rmd
:::callout info title="Hello"
Nested source should stay code.
:::
\`\`\`

@ 渲染目标
Panel text.
:::
`);

  assert.equal(ast.children[0].type, "code-block");
  assert.equal(ast.children[0].lang, "rmd");
  assert.match(ast.children[0].value, /:::callout info/);

  const tabs = ast.children[1];
  assert.equal(tabs.type, "tabs");
  assert.equal(tabs.default, "RMD源码");
  assert.equal(tabs.panels.length, 2);
  assert.equal(tabs.panels[0].children[0].type, "code-block");
  assert.match(tabs.panels[0].children[0].value, /Nested source should stay code/);
});

test("unknown blocks degrade to code-block nodes", () => {
  const ast = parse(":::unknown\nhello\n:::");

  assert.equal(ast.children[0].type, "code-block");
  assert.deepEqual(ast.children[0].warnings, ["unknown-block: unknown"]);
});

test("keeps unknown attrs and carries unclosed block warnings", () => {
  const ast = parse(":::chart bar title=\"Revenue\" palette=warm\nQ1 10");
  const chart = ast.children[0];

  assert.equal(chart.type, "chart");
  assert.deepEqual(chart.unknownAttrs, { palette: "warm" });
  assert.deepEqual(chart.warnings, ["unclosed"]);
});

test("invalid sliders degrade while valid duplicate names are warned", () => {
  const ast = parse(`:::slider name=bad-name min=0 max=10\n:::\n:::slider name=value min=0 max=10\n:::\n:::slider name=value min=0 max=20\n:::`);

  assert.equal(ast.children[0].type, "code-block");
  assert.equal(ast.children[1].type, "slider");
  assert.equal(ast.children[2].type, "slider");
  assert.deepEqual(ast.children[2].warnings, ["slider-duplicate-name"]);
});

test("tabs parse panels and repair a missing default", () => {
  const ast = parse(`:::tabs default=不存在\n@概念\n一些说明\n@代码\n\`\`\`js\nconsole.log("hi")\n\`\`\`\n:::`);
  const tabs = ast.children[0];

  assert.equal(tabs.type, "tabs");
  assert.equal(tabs.default, "概念");
  assert.deepEqual(tabs.warnings, ["tabs-default-missing"]);
  assert.equal(tabs.panels.length, 2);
  assert.equal(tabs.panels[1].children[0].type, "code-block");
});

test("timeline parses every item including multi-bracket attributes", () => {
  const source = `:::timeline
@ 2026-01-01 [title="项目立项"] [status="success"]
项目初步规划完成。

@ 2026-03-15 [title="v0.1 发布"] [status="success"]
完成核心解析器的基础架构。

@ 2026-05-10 [title="v0.2"] [status="pending"]
新增高级互动组件。

@ 2026-12-01 [title="1.0"]
计划在此时间点开放完整源码库。
:::`;
  const timeline = parse(source).children[0];

  assert.equal(timeline.type, "timeline");
  assert.equal(timeline.direction, "vertical");
  assert.equal(timeline.items.length, 4);
  assert.deepEqual(
    timeline.items.map((item) => [item.time, item.title, item.status]),
    [
      ["2026-01-01", "项目立项", "success"],
      ["2026-03-15", "v0.1 发布", "success"],
      ["2026-05-10", "v0.2", "pending"],
      ["2026-12-01", "1.0", "default"]
    ]
  );
  // Every item must carry its prose content.
  for (const item of timeline.items) {
    assert.equal(item.children.length >= 1, true, `item ${item.time} has no children`);
    assert.equal(item.children[0].type, "paragraph");
  }
});

test("timeline tolerates indented @ headers and combined-attribute brackets", () => {
  const source = `:::timeline direction="horizontal"
  @ 阶段一 [status="success"]
  需求分析与设计
  @ 阶段二 [status="warning"]
  高可用架构开发
  @ 阶段三 [title="收尾" status="pending"]
  系统联调与发布
:::`;
  const timeline = parse(source).children[0];

  assert.equal(timeline.direction, "horizontal");
  assert.equal(timeline.items.length, 3);
  assert.deepEqual(
    timeline.items.map((item) => [item.time, item.title, item.status]),
    [
      ["阶段一", null, "success"],
      ["阶段二", null, "warning"],
      ["阶段三", "收尾", "pending"]
    ]
  );
});

test("timeline reports a warning when there are no @ items", () => {
  const source = `:::timeline
just some text without any item header
:::`;
  const timeline = parse(source).children[0];

  assert.equal(timeline.type, "timeline");
  assert.equal(timeline.items.length, 0);
  assert.ok(timeline.warnings?.includes("timeline-empty-items"));
  assert.ok(timeline.warnings?.includes("timeline-content-before-first-item"));
});

test("kanban tolerates indented column headers", () => {
  const source = `:::kanban
  @ Todo
  - task 1
  @ Doing
  - task 2
  @ Done
  - task 3
:::`;
  const kanban = parse(source).children[0];

  assert.equal(kanban.type, "kanban");
  assert.equal(kanban.columns.length, 3);
  assert.deepEqual(kanban.columns.map((col) => col.title), ["Todo", "Doing", "Done"]);
});
