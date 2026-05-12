import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { applyTemplate, assembleAll, assembleClient } from "../scripts/build-skills-lib.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const skillsRoot = join(repoRoot, "skills");

// Each test writes into its own tmp out-dir so we don't race with cli.test.js
// (which reads from skills/dist/ to drive `rmd init`).
async function withTmpOut(fn) {
  const tmp = await mkdtemp(join(tmpdir(), "rmd-build-skills-"));
  try {
    await fn(tmp);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

test("applyTemplate substitutes known placeholders and throws on unknown ones", () => {
  assert.equal(applyTemplate("hello {{name}}", { id: "x", name: "Claude" }), "hello Claude");
  assert.equal(applyTemplate("{{a}} & {{b}}", { id: "x", a: "1", b: "2" }), "1 & 2");
  assert.throws(
    () => applyTemplate("{{missing}}", { id: "x", other: "x" }),
    /unknown placeholder \{\{missing\}\}/
  );
});

test("assembleClient produces a complete SKILL.md + references + examples for claude", async () => {
  await withTmpOut(async (outRoot) => {
    const outDir = await assembleClient("claude", { outRoot });
    assert.equal(outDir, join(outRoot, "claude"));

    const skillBody = await readFile(join(outDir, "SKILL.md"), "utf8");
    assert.ok(skillBody.includes("Generate Rich Markdown (.rmd) source"));
    assert.ok(skillBody.includes("Claude's chat / desktop sandbox"));
    assert.ok(!skillBody.includes("{{"));
    assert.ok(!skillBody.includes("}}"));

    assert.ok(existsSync(join(outDir, "references/blocks.md")));
    assert.ok(existsSync(join(outDir, "references/artifacts.md")));
    assert.ok(existsSync(join(outDir, "examples/decision-report.rmd")));
    assert.ok(existsSync(join(outDir, "examples/tunable-config.rmd")));
  });
});

test("assembleClient fills the display_name placeholder for codex", async () => {
  await withTmpOut(async (outRoot) => {
    const outDir = await assembleClient("codex", { outRoot });
    const skillBody = await readFile(join(outDir, "SKILL.md"), "utf8");
    assert.ok(skillBody.includes("Codex's chat / desktop sandbox"));
    assert.ok(!skillBody.includes("{{"));
  });
});

test("assembleClient fills the display_name placeholder for gemini", async () => {
  await withTmpOut(async (outRoot) => {
    const outDir = await assembleClient("gemini", { outRoot });
    const skillBody = await readFile(join(outDir, "SKILL.md"), "utf8");
    assert.ok(skillBody.includes("Gemini's chat / desktop sandbox"));
    assert.ok(!skillBody.includes("{{"));

    const artifacts = await readFile(join(outDir, "references/artifacts.md"), "utf8");
    assert.ok(artifacts.includes("Gemini desktop / chat sandbox"));
  });
});

test("assembleClient throws on an unknown platform id", async () => {
  await withTmpOut(async (outRoot) => {
    await assert.rejects(
      () => assembleClient("not-a-real-platform", { outRoot }),
      /unknown platform: not-a-real-platform/
    );
  });
});

test("assembleAll walks every platforms/*.json", async () => {
  await withTmpOut(async (outRoot) => {
    const results = await assembleAll({ outRoot });
    const ids = Object.keys(results).sort();
    assert.deepEqual(ids, ["claude", "codex", "gemini"]);
    for (const dir of Object.values(results)) {
      assert.ok(existsSync(join(dir, "SKILL.md")));
      assert.ok(existsSync(join(dir, "references/blocks.md")));
    }
  });
});

test("references/blocks.md and examples are copied byte-identically (not templated)", async () => {
  await withTmpOut(async (outRoot) => {
    await assembleAll({ outRoot });

    const sharedBlocks = await readFile(join(skillsRoot, "shared/references/blocks.md"), "utf8");
    const sharedExample = await readFile(join(skillsRoot, "shared/examples/decision-report.rmd"), "utf8");
    for (const id of ["claude", "codex", "gemini"]) {
      const blocks = await readFile(join(outRoot, id, "references/blocks.md"), "utf8");
      const example = await readFile(join(outRoot, id, "examples/decision-report.rmd"), "utf8");
      assert.equal(blocks, sharedBlocks, `${id}/references/blocks.md must match shared`);
      assert.equal(example, sharedExample, `${id}/examples/decision-report.rmd must match shared`);
    }
  });
});
