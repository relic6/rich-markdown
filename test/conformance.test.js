import assert from "node:assert/strict";
import test from "node:test";
import { runConformance } from "../spec/conformance/runner.js";

test("official conformance fixtures pass", async () => {
  const results = await runConformance();

  assert.deepEqual(results.map((result) => result.name), ["core-blocks", "fallbacks"]);
  assert.equal(results.every((result) => result.ok), true);
});
