import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "../packages/parser-core/src/index.js";
import { validate } from "../packages/validator/src/index.js";

test("validator accepts the v0.2 showcase example AST", () => {
  const source = readFileSync(new URL("../examples/v0.2-showcase.rmd", import.meta.url), "utf8");
  const result = validate(parse(source));

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("validator reports chart series mismatch and pie multi-series", () => {
  const ast = {
    type: "root",
    version: "0.1.0",
    frontmatter: {},
    warnings: [],
    children: [{
      type: "chart",
      chartType: "bar",
      title: null,
      x: null,
      y: null,
      emphasis: "none",
      data: [
        { label: "A", values: [1, 2] },
        { label: "B", values: [3] }
      ],
      raw: "A 1 2\nB 3"
    }, {
      type: "chart",
      chartType: "pie",
      title: null,
      x: null,
      y: null,
      emphasis: "none",
      data: [
        { label: "A", values: [1, 2] }
      ],
      raw: "A 1 2"
    }]
  };
  const result = validate(ast);

  assert.equal(result.ok, false);
  assert.match(messages(result), /all chart series must have the same length/);
  assert.match(messages(result), /pie charts must have exactly one series/);
});

test("validator reports invalid flow edge references", () => {
  const ast = {
    type: "root",
    version: "0.1.0",
    frontmatter: {},
    warnings: [],
    children: [{
      type: "flow",
      direction: "lr",
      nodes: [{ id: "A" }],
      edges: [{ from: "A", to: "B" }]
    }]
  };
  const result = validate(ast);

  assert.equal(result.ok, false);
  assert.match(messages(result), /edge to must reference a declared node/);
});

test("validator reports duplicate slider names when not marked duplicate", () => {
  const ast = {
    type: "root",
    version: "0.1.0",
    frontmatter: {},
    warnings: [],
    children: [
      slider("capacity"),
      slider("capacity")
    ]
  };
  const result = validate(ast);

  assert.equal(result.ok, false);
  assert.match(messages(result), /slider name must be unique/);
});

test("validator permits parser-marked duplicate sliders", () => {
  const ast = parse(`:::slider name=capacity min=1 max=10
:::
:::slider name=capacity min=1 max=10
:::`);
  const result = validate(ast);

  assert.equal(result.ok, true);
});

test("validator accepts range slider defaults", () => {
  const ast = parse(`:::slider name=volume_range min=10 max=1000 step=10 default="100,500"
:::`); 
  const result = validate(ast);

  assert.equal(result.ok, true);
});

test("validator reports nested grid and nested tabs", () => {
  const ast = {
    type: "root",
    version: "0.1.0",
    frontmatter: {},
    warnings: [],
    children: [{
      type: "grid",
      columns: 1,
      gap: "md",
      cells: [[{
        type: "grid",
        columns: 1,
        gap: "md",
        cells: [[]]
      }]]
    }, {
      type: "tabs",
      default: "A",
      panels: [{
        label: "A",
        children: [{
          type: "tabs",
          default: "B",
          panels: [{ label: "B", children: [] }]
        }]
      }]
    }]
  };
  const result = validate(ast);

  assert.equal(result.ok, false);
  assert.match(messages(result), /grid cannot contain nested grid nodes/);
  assert.match(messages(result), /tabs cannot contain nested tabs/);
});

function slider(name) {
  return {
    type: "slider",
    name,
    min: 1,
    max: 10,
    step: 1,
    default: 1,
    unit: "",
    label: name
  };
}

function messages(result) {
  return result.errors.map((error) => error.message).join("\n");
}
