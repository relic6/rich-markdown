import assert from "node:assert/strict";
import test from "node:test";
import { annotateRenderedSource, buildLivePreviewRanges, buildSourceMap } from "../src/source-map.js";

test("builds source offsets for headings, paragraphs, blocks, and code", () => {
  const source = [
    "# Title",
    "",
    "Intro paragraph",
    "",
    ":::chart bar",
    "A 1",
    ":::",
    "",
    "```js",
    "console.log('x')",
    "```"
  ].join("\n");

  const entries = buildSourceMap(source);

  assert.equal(entries[0].kind, "heading");
  assert.equal(entries[0].from, source.indexOf("# Title"));
  assert.equal(entries[1].kind, "paragraph");
  assert.equal(entries[1].from, source.indexOf("Intro paragraph"));
  assert.equal(entries[2].kind, "block");
  assert.equal(entries[2].blockType, "chart");
  assert.equal(entries[2].from, source.indexOf(":::chart"));
  assert.equal(entries[3].kind, "code");
  assert.equal(entries[3].from, source.indexOf("```js"));
});

test("skips frontmatter when building live preview source blocks", () => {
  const source = [
    "---",
    "title: Demo",
    "---",
    "",
    "# Title"
  ].join("\n");

  const entries = buildSourceMap(source);

  assert.equal(entries.length, 1);
  assert.equal(entries[0].kind, "heading");
  assert.equal(entries[0].source, "# Title");
});

test("returns one widget per block, skipping the active source block", () => {
  // After the per-block widget refactor (Typora-style live preview), every
  // markdown / ::: block becomes its own widget. The block under the cursor
  // is omitted so CM6 keeps editing the raw source there.
  const source = [
    "---",
    "title: Demo",
    "---",
    "",
    "# Title",
    "",
    "Intro paragraph",
    "",
    ":::callout tip",
    "Body",
    ":::",
    "",
    "Tail paragraph"
  ].join("\n");

  const cursor = source.indexOf("Body");
  const ranges = buildLivePreviewRanges(source, cursor);

  // Three widgets: heading, intro paragraph, tail paragraph. The :::callout
  // block is the active one and is dropped.
  assert.equal(ranges.length, 3);
  assert.equal(ranges[0].source, "# Title");
  assert.equal(ranges[0].blockKind, "heading");
  assert.equal(ranges[1].source, "Intro paragraph");
  assert.equal(ranges[1].blockKind, "paragraph");
  assert.equal(ranges[2].source, "Tail paragraph");
  assert.equal(ranges[2].blockKind, "paragraph");

  for (const range of ranges) {
    assert.equal(source.slice(range.from, range.to), range.source);
  }
});

test("returns every block as a widget when the cursor sits in skipped frontmatter", () => {
  const source = [
    "---",
    "title: Demo",
    "---",
    "",
    "# Title",
    "",
    "Body"
  ].join("\n");

  const cursor = source.indexOf("title");
  const ranges = buildLivePreviewRanges(source, cursor);

  // Cursor is inside the frontmatter, which the source-map already filters
  // out. So no entry contains the cursor — every entry becomes a widget.
  assert.equal(ranges.length, 2);
  assert.equal(ranges[0].source, "# Title");
  assert.equal(ranges[0].blockKind, "heading");
  assert.equal(ranges[1].source, "Body");
  assert.equal(ranges[1].blockKind, "paragraph");
});

test("annotates rendered elements with matching source offsets", () => {
  const source = [
    "# Title",
    "",
    "Intro paragraph",
    "",
    ":::chart bar",
    "A 1",
    ":::"
  ].join("\n");
  const root = documentLikeRoot();
  const entries = buildSourceMap(source);

  annotateRenderedSource(root, entries);

  assert.equal(root.nodes.h1.attributes["data-rmd-source-from"], String(source.indexOf("# Title")));
  assert.equal(root.nodes.p.attributes["data-rmd-source-from"], String(source.indexOf("Intro paragraph")));
  assert.equal(root.nodes.chart.attributes["data-rmd-source-from"], String(source.indexOf(":::chart")));
});

function documentLikeRoot() {
  const nodes = {
    h1: fakeElement("h1"),
    p: fakeElement("p"),
    chart: fakeElement("section")
  };
  nodes.chart.attributes["data-rmd-block"] = "chart";

  return {
    nodes,
    querySelectorAll(selector) {
      if (selector === "[data-rmd-block]") return [nodes.chart];
      if (selector === "h1,h2,h3,h4,h5,h6") return [nodes.h1];
      if (selector === "p") return [nodes.p];
      return [];
    }
  };
}

function fakeElement(tagName) {
  return {
    tagName,
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };
}
