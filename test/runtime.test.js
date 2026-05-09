import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "../packages/parser-core/src/index.js";
import { createDocumentState, renderTemplate, setSliderValue } from "../packages/runtime/src/index.js";

test("creates document state from sliders in an AST", () => {
  const source = readFileSync(new URL("../examples/rate-limit-decision.rmd", import.meta.url), "utf8");
  const ast = parse(source);
  const state = createDocumentState(ast);

  assert.deepEqual(state.sliders, {
    capacity: 200,
    refill_rate: 50,
    burst_window: 10
  });
  assert.deepEqual(state.activeTabs, {});
});

test("renders export templates from current slider state", () => {
  const state = {
    sliders: {
      capacity: 250,
      refill_rate: 40
    },
    activeTabs: {}
  };

  const rendered = renderTemplate("capacity={{capacity | int}}\nrefill={{refill_rate}}\nmissing={{burst_window}}", state);

  assert.equal(rendered, "capacity=250\nrefill=40\nmissing=[未定义:burst_window]");
});

test("sets slider values with clamping and step snapping", () => {
  const state = { sliders: {}, activeTabs: {} };
  const spec = { min: 10, max: 100, step: 10 };

  assert.equal(setSliderValue(state, "capacity", 56, spec), 60);
  assert.equal(setSliderValue(state, "capacity", 4, spec), 10);
  assert.equal(setSliderValue(state, "capacity", 104, spec), 100);
});

test("tracks default active tabs by AST path", () => {
  const ast = parse(`:::tabs default=代码
@概念
说明
@代码
\`\`\`js
console.log("hi")
\`\`\`
:::`);
  const state = createDocumentState(ast);

  assert.deepEqual(state.activeTabs, { "0": "代码" });
});
