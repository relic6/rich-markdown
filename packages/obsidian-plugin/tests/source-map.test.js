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
  const root = documentLikeRoot([
    fakeElement("h1"),
    fakeElement("p"),
    fakeElement("section", { "data-rmd-block": "chart" })
  ]);
  const entries = buildSourceMap(source);

  annotateRenderedSource(root, entries);

  const [h1, p, chart] = root.documentEl.children;
  assert.equal(h1.attributes["data-rmd-source-from"], String(source.indexOf("# Title")));
  assert.equal(p.attributes["data-rmd-source-from"], String(source.indexOf("Intro paragraph")));
  assert.equal(chart.attributes["data-rmd-source-from"], String(source.indexOf(":::chart")));
});

test("annotates only top-level blocks, ignoring nested paragraphs inside ::: containers", () => {
  // Regression test for the split-view click-sync bug. The renderer wraps
  // ::: blocks around their nested children, producing a <p> *inside* the
  // <aside class="rmd-callout">. The source-map only emits a single "block"
  // entry for the whole callout. The old annotation code matched every <p>
  // in the tree (including the nested one) by index against the
  // paragraph-only filter, which shifted every paragraph offset by one when
  // a callout sat between them. The new code walks direct children of
  // `.rmd-document` so the nested <p> is never even considered.
  const source = [
    "First paragraph",
    "",
    ":::callout note",
    "Nested body",
    ":::",
    "",
    "Second paragraph"
  ].join("\n");
  const entries = buildSourceMap(source);

  const firstP = fakeElement("p");
  const secondP = fakeElement("p");
  // Nested <p> lives *inside* the callout section but must not consume an
  // entry — it's not a direct child of `.rmd-document`.
  const nestedP = fakeElement("p");
  const callout = fakeElement("aside", { "data-rmd-block": "callout" }, [nestedP]);

  const root = documentLikeRoot([firstP, callout, secondP]);

  annotateRenderedSource(root, entries);

  assert.equal(firstP.attributes["data-rmd-source-from"], String(source.indexOf("First paragraph")));
  assert.equal(callout.attributes["data-rmd-source-from"], String(source.indexOf(":::callout")));
  assert.equal(secondP.attributes["data-rmd-source-from"], String(source.indexOf("Second paragraph")));
  assert.equal(nestedP.attributes["data-rmd-source-from"], undefined);
});

test("annotates only top-level lists, ignoring nested <ul> inside list items", () => {
  // A nested list inside an <li> used to consume the next "list" entry,
  // shifting every subsequent block by one.
  const source = [
    "- top item",
    "- another",
    "",
    "## After list",
    "",
    "- second list"
  ].join("\n");
  const entries = buildSourceMap(source);

  const firstList = fakeElement("ul", {}, [
    fakeElement("li", {}, [fakeElement("ul")])
  ]);
  const heading = fakeElement("h2");
  const secondList = fakeElement("ul");

  const root = documentLikeRoot([firstList, heading, secondList]);

  annotateRenderedSource(root, entries);

  assert.equal(firstList.attributes["data-rmd-source-from"], String(source.indexOf("- top item")));
  assert.equal(heading.attributes["data-rmd-source-from"], String(source.indexOf("## After list")));
  assert.equal(secondList.attributes["data-rmd-source-from"], String(source.indexOf("- second list")));
});

function documentLikeRoot(children = []) {
  const documentEl = { tagName: "main", className: "rmd-document", children };
  return {
    documentEl,
    querySelector(selector) {
      if (selector === ".rmd-document") return documentEl;
      return null;
    }
  };
}

function fakeElement(tagName, attributes = {}, children = []) {
  const element = {
    tagName,
    attributes: { ...attributes },
    children,
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name);
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };
  return element;
}
