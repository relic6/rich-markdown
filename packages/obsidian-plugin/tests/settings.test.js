import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("defaults RMD files to split view", () => {
  const source = readFileSync(new URL("../src/settings.ts", import.meta.url), "utf8");

  assert.match(source, /defaultMode:\s*"split"/);
});
