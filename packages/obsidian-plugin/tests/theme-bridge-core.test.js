import assert from "node:assert/strict";
import test from "node:test";
import { nextThemeId, resolveThemeId } from "../src/theme-bridge-core.js";

test("resolves auto theme from Obsidian light/dark state", () => {
  assert.equal(resolveThemeId("auto", false), "default");
  assert.equal(resolveThemeId("auto", true), "tech-dark");
});

test("falls back to default for unknown theme choices", () => {
  assert.equal(resolveThemeId("unknown", false), "default");
});

test("cycles through the four official themes", () => {
  assert.equal(nextThemeId("default"), "tech-dark");
  assert.equal(nextThemeId("tech-dark"), "paper");
  assert.equal(nextThemeId("paper"), "notion-like");
  assert.equal(nextThemeId("notion-like"), "default");
});
