import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { main } from "../packages/cli/src/index.js";

test("CLI parses a file to AST JSON", async () => {
  const output = await runCli(["parse", "examples/v0.2-showcase.rmd"]);
  const ast = JSON.parse(output.stdout);

  assert.equal(output.code, 0);
  assert.equal(ast.type, "root");
  assert.equal(ast.frontmatter.title, "Rich Markdown v0.2 Showcase");
});

test("CLI validates a file", async () => {
  const output = await runCli(["validate", "examples/v0.2-showcase.rmd"]);

  assert.equal(output.code, 0);
  assert.equal(output.stdout, "ok\n");
});

test("CLI builds HTML to stdout", async () => {
  const output = await runCli(["build", "examples/v0.2-showcase.rmd", "--mode", "cdn", "--version", "0.1.0"]);

  assert.equal(output.code, 0);
  assert.match(output.stdout, /rmd-renderer\/0\.1\.0\/rmd\.min\.js/);
  assert.match(output.stdout, /<script type="application\/rmd">/);
});

test("CLI writes build output to --out", async () => {
  const dir = await mkdtemp(join(tmpdir(), "rmd-cli-"));
  const out = join(dir, "nested", "demo.html");

  try {
    const output = await runCli(["build", "examples/v0.2-showcase.rmd", "--out", out]);
    const html = await readFile(out, "utf8");

    assert.equal(output.code, 0);
    assert.equal(output.stdout.trim(), out);
    assert.match(html, /data-rmd-block="chart"/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI init installs Codex, Claude, and Gemini skills", async () => {
  const dir = await mkdtemp(join(tmpdir(), "rmd-init-"));
  const previousCwd = process.cwd();

  try {
    process.chdir(dir);
    const output = await runCli(["init", "--ai", "codex,claude,gemini"]);

    const codexRoot = join(dir, ".codex", "skills", "rich-markdown");
    const claudeRoot = join(dir, ".claude", "skills", "rich-markdown");
    const geminiRoot = join(dir, ".gemini", "skills", "rich-markdown");
    const codexSkill = await readFile(join(codexRoot, "SKILL.md"), "utf8");
    const claudeSkill = await readFile(join(claudeRoot, "SKILL.md"), "utf8");
    const geminiSkill = await readFile(join(geminiRoot, "SKILL.md"), "utf8");

    assert.equal(output.code, 0);
    assert.match(output.stdout, /Codex skill installed:/);
    assert.match(output.stdout, /Claude Code skill installed:/);
    assert.match(output.stdout, /Gemini skill installed:/);
    assert.match(codexSkill, /name: rich-markdown/);
    assert.match(claudeSkill, /name: rich-markdown/);
    assert.match(geminiSkill, /name: rich-markdown/);
    assert.equal(existsSync(join(codexRoot, "references", "blocks.md")), true);
    assert.equal(existsSync(join(claudeRoot, "examples", "decision-report.rmd")), true);
    assert.equal(existsSync(join(geminiRoot, "references", "artifacts.md")), true);
  } finally {
    process.chdir(previousCwd);
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI split build writes local assets next to the HTML", async () => {
  const dir = await mkdtemp(join(tmpdir(), "rmd-cli-split-"));
  const out = join(dir, "nested", "demo.html");

  try {
    const output = await runCli(["build", "examples/v0.2-showcase.rmd", "--mode", "split", "--theme", "default", "--out", out]);
    const html = await readFile(out, "utf8");
    const script = await readFile(join(dir, "nested", "rmd.min.js"), "utf8");
    const css = await readFile(join(dir, "nested", "themes", "default.css"), "utf8");

    assert.equal(output.code, 0);
    assert.match(html, /src="\.\/rmd\.min\.js"/);
    assert.match(script, /globalThis\.RMD/);
    assert.match(css, /--rmd-color-bg/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI reports invalid arguments", async () => {
  const output = await runCli(["build"]);

  assert.equal(output.code, 1);
  assert.match(output.stderr, /build requires a file path/);
});

test("CLI open can start and close a preview URL in no-open mode", async () => {
  const output = await runCli(["open", "examples/v0.2-showcase.rmd", "--no-open", "true"]);

  assert.equal(output.code, 0);
  assert.match(output.stdout, /^http:\/\/127\.0\.0\.1:\d+\/\n$/);
});

async function runCli(args) {
  let stdout = "";
  let stderr = "";
  const code = await main(args, {
    stdout(value) {
      stdout += value;
    },
    stderr(value) {
      stderr += value;
    }
  });

  return { code, stdout, stderr };
}
