import assert from "node:assert/strict";
import test from "node:test";
import { scanFencedBlocksText } from "../src/scanner.js";

test("scans top-level RMD fenced blocks", () => {
  const source = [
    "# Note",
    "",
    ":::chart bar",
    "A 1",
    "B 2",
    ":::",
    "",
    "tail"
  ].join("\n");

  const blocks = scanFencedBlocksText(source);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].source, ":::chart bar\nA 1\nB 2\n:::");
  assert.equal(source.slice(blocks[0].from, blocks[0].to), blocks[0].source);
});

test("marks cursor inside a scanned block", () => {
  const source = "before\n:::callout tip\nbody\n:::\nafter";
  const cursor = source.indexOf("body");
  const [block] = scanFencedBlocksText(source, cursor);

  assert.equal(block.cursorInside, true);
});

test("scans fenced rmd code blocks for Markdown live preview", () => {
  const source = [
    "intro",
    "```rmd",
    ":::chart bar",
    "A 1",
    ":::",
    "```",
    "tail"
  ].join("\n");

  const [block] = scanFencedBlocksText(source);

  assert.equal(block.source, ":::chart bar\nA 1\n:::");
  assert.equal(source.slice(block.from, block.to), "```rmd\n:::chart bar\nA 1\n:::\n```");
});

test("ignores unclosed fenced blocks", () => {
  const source = ":::chart bar\nA 1";

  assert.deepEqual(scanFencedBlocksText(source), []);
});
