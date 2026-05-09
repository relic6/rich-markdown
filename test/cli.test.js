import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { main } from "../packages/cli/src/index.js";

test("CLI parses a file to AST JSON", async () => {
  const output = await runCli(["parse", "examples/rate-limit-decision.rmd"]);
  const ast = JSON.parse(output.stdout);

  assert.equal(output.code, 0);
  assert.equal(ast.type, "root");
  assert.equal(ast.frontmatter.title, "支付服务限流方案对比");
});

test("CLI validates a file", async () => {
  const output = await runCli(["validate", "examples/rate-limit-decision.rmd"]);

  assert.equal(output.code, 0);
  assert.equal(output.stdout, "ok\n");
});

test("CLI builds HTML to stdout", async () => {
  const output = await runCli(["build", "examples/rate-limit-decision.rmd", "--mode", "cdn", "--version", "0.1.0"]);

  assert.equal(output.code, 0);
  assert.match(output.stdout, /rmd-renderer\/0\.1\.0\/rmd\.min\.js/);
  assert.match(output.stdout, /<script type="application\/rmd">/);
});

test("CLI writes build output to --out", async () => {
  const dir = await mkdtemp(join(tmpdir(), "rmd-cli-"));
  const out = join(dir, "nested", "demo.html");

  try {
    const output = await runCli(["build", "examples/rate-limit-decision.rmd", "--out", out]);
    const html = await readFile(out, "utf8");

    assert.equal(output.code, 0);
    assert.equal(output.stdout.trim(), out);
    assert.match(html, /data-rmd-block="chart"/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI split build writes local assets next to the HTML", async () => {
  const dir = await mkdtemp(join(tmpdir(), "rmd-cli-split-"));
  const out = join(dir, "nested", "demo.html");

  try {
    const output = await runCli(["build", "examples/rate-limit-decision.rmd", "--mode", "split", "--theme", "default", "--out", out]);
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
  const output = await runCli(["open", "examples/rate-limit-decision.rmd", "--no-open", "true"]);

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
