import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse } from "../packages/parser-core/src/index.js";
import { createDocumentState, hydrate, renderTemplate, setSliderValue } from "../packages/runtime/src/index.js";

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

test("sets range slider bounds with clamping, ordering, and step snapping", () => {
  const state = { sliders: { volume_range: [100, 500] }, activeTabs: {} };
  const spec = { min: 10, max: 1000, step: 10, range: true };

  assert.deepEqual(setSliderValue(state, "volume_range", 536, spec, "max"), [100, 540]);
  assert.deepEqual(setSliderValue(state, "volume_range", 900, spec, "min"), [540, 540]);
  assert.deepEqual(setSliderValue(state, "volume_range", 0, spec, "min"), [10, 540]);
  assert.deepEqual(setSliderValue(state, "volume_range", 2000, spec, "max"), [10, 1000]);
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

test("hydrates carousel controls and advances slides", () => {
  const events = new Map();
  const track = {
    clientWidth: 320,
    scrollWidth: 960,
    scrollLeft: 0,
    children: [{}, {}, {}],
    scrollTo({ left }) {
      this.scrollLeft = left;
    },
    scrollBy({ left }) {
      this.scrollLeft += left;
    },
    addEventListener(type, listener) {
      events.set(`track:${type}`, listener);
    }
  };
  const prev = makeControl();
  const next = makeControl();
  const dots = [makeDot(), makeDot(), makeDot()];
  const carousel = {
    attributes: new Map([
      ["data-autoplay", "false"],
      ["data-interval", "1200"]
    ]),
    querySelector(selector) {
      if (selector === ".rmd-carousel-track") return track;
      if (selector === "[data-rmd-carousel=\"prev\"]") return prev;
      if (selector === "[data-rmd-carousel=\"next\"]") return next;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".rmd-carousel-dot") return dots;
      return [];
    },
    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    },
    addEventListener(type, listener) {
      events.set(`carousel:${type}`, listener);
    }
  };
  const root = {
    ownerDocument: {
      defaultView: {
        setInterval() {
          throw new Error("autoplay should stay disabled in this test");
        }
      },
      querySelector() {
        return null;
      },
      createElement() {
        return {};
      }
    },
    querySelectorAll(selector) {
      return selector === "[data-rmd-block=\"carousel\"]" ? [carousel] : [];
    }
  };

  hydrate(root);
  next.listeners.click();

  assert.equal(track.scrollLeft, 320);
  assert.equal(dots[1].attributes.get("aria-current"), "true");

  dots[2].listeners.click();

  assert.equal(track.scrollLeft, 640);
  assert.equal(dots[2].attributes.get("aria-current"), "true");
});

test("hydrates math with KaTeX stylesheet inside shadow roots", () => {
  const appendedToShadow = [];
  const appendedToHead = [];
  const block = {
    attributes: new Map([["data-latex", "E = mc^2"]]),
    textContent: "E = mc^2",
    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }
  };
  const doc = {
    defaultView: {
      katex: {
        render(latex, target, options) {
          target.renderedLatex = latex;
          target.renderOptions = options;
        }
      }
    },
    head: {
      append(node) {
        appendedToHead.push(node);
      }
    },
    querySelector() {
      return null;
    },
    createElement(tag) {
      return makeElement(tag);
    }
  };
  const root = {
    nodeType: 11,
    host: {},
    ownerDocument: doc,
    append(node) {
      appendedToShadow.push(node);
    },
    querySelector(selector) {
      return selector === "link[data-rmd-katex-style]" ? null : null;
    },
    querySelectorAll(selector) {
      return selector === ".rmd-math-display[data-latex]" ? [block] : [];
    }
  };

  hydrate(root);

  assert.equal(block.renderedLatex, "E = mc^2");
  assert.equal(block.renderOptions.output, "mathml");
  assert.equal(block.attributes.get("data-rendered"), "katex");
  assert.equal(appendedToShadow.length, 1);
  assert.equal(appendedToShadow[0].attributes.get("data-rmd-katex-style"), "true");
  assert.equal(appendedToHead.length, 2);
});

function makeControl() {
  return {
    listeners: {},
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    }
  };
}

function makeElement(tagName) {
  return {
    tagName,
    attributes: new Map(),
    textContent: "",
    set rel(value) {
      this.attributes.set("rel", value);
    },
    set href(value) {
      this.attributes.set("href", value);
    },
    set src(value) {
      this.attributes.set("src", value);
    },
    set async(value) {
      this.attributes.set("async", String(value));
    },
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    },
    addEventListener() {}
  };
}

function makeDot() {
  return {
    attributes: new Map(),
    listeners: {},
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    }
  };
}
