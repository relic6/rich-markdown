import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { buildDist } from "../scripts/build-dist-lib.js";

test("dist browser bundle parses CommonMark block structures", async () => {
  const dir = await mkdtemp(join(tmpdir(), "rmd-dist-"));

  try {
    await buildDist({ outdir: dir, themeNames: ["default"] });
    const code = await readFile(join(dir, "rmd.min.js"), "utf8");
    const context = {
      console,
      setTimeout,
      clearTimeout
    };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext(code, context);

    assert.equal(typeof context.RMD.parse, "function");

    const ast = context.RMD.parse(`> quoted

- one
- two`);

    assert.equal(ast.children[0].type, "blockquote");
    assert.equal(ast.children[1].type, "list");
    assert.equal(ast.children[1].children.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
