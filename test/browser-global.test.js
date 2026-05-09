import assert from "node:assert/strict";
import test from "node:test";

test("browser global entry exposes the RMD surface", async () => {
  const previous = globalThis.RMD;
  const mod = await import("../packages/renderer/src/browser-global.js");

  assert.equal(globalThis.RMD, mod.default);
  assert.equal(typeof globalThis.RMD.render, "function");
  assert.equal(typeof globalThis.RMD.parse, "function");
  assert.equal(typeof globalThis.RMD.buildHtml, "function");

  if (previous === undefined) {
    delete globalThis.RMD;
  } else {
    globalThis.RMD = previous;
  }
});
