import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "../packages/parser-core/src/index.js";
import { validate } from "../packages/validator/src/index.js";

test("parses the quickstart rate-limit example into core AST nodes", () => {
  const source = readFileSync(new URL("../examples/rate-limit-decision.rmd", import.meta.url), "utf8");
  const ast = parse(source);
  const validation = validate(ast);

  assert.equal(validation.ok, true);
  assert.equal(ast.frontmatter.title, "支付服务限流方案对比");
  assert.equal(ast.frontmatter.theme, "tech-dark");
  assert.deepEqual(ast.warnings, []);

  const types = ast.children.map((node) => node.type);
  assert.deepEqual(types.filter((type) => ["grid", "chart", "callout", "slider", "export", "flow", "diff"].includes(type)), [
    "grid",
    "chart",
    "callout",
    "slider",
    "slider",
    "slider",
    "export",
    "flow",
    "diff"
  ]);

  const chart = ast.children.find((node) => node.type === "chart");
  assert.equal(chart.chartType, "bar");
  assert.equal(chart.title, "1000 RPS 压测下的 P99 延迟（ms，越低越好）");
  assert.equal(chart.data[2].label, "滑动窗口");
  assert.deepEqual(chart.data[2].values, [41]);

  const grid = ast.children.find((node) => node.type === "grid");
  assert.equal(grid.columns, 3);
  assert.equal(grid.cells.length, 3);
  assert.equal(grid.cells[0][0].type, "heading");
  assert.equal(grid.cells[0][1].children.some((node) => node.type === "strong"), true);

  const exportNode = ast.children.find((node) => node.type === "export");
  assert.equal(exportNode.label, "复制为限流配置");
  assert.deepEqual(exportNode.references, ["capacity", "refill_rate", "burst_window"]);

  const flow = ast.children.find((node) => node.type === "flow");
  assert.deepEqual(flow.edges.at(-1), { from: "异常", to: "回滚" });

  const diff = ast.children.find((node) => node.type === "diff");
  assert.deepEqual(diff.lines.map((line) => line.kind), ["remove", "add"]);
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
