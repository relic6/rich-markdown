#!/usr/bin/env node
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "../../packages/parser-core/src/index.js";
import { validate } from "../../packages/validator/src/index.js";

export async function runConformance(options = {}) {
  const casesDir = options.casesDir ?? new URL("./cases", import.meta.url);
  const casesPath = filePath(casesDir);
  const caseNames = (await readdir(casesDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const results = [];

  for (const name of caseNames) {
    const dir = join(casesPath, name);
    const input = await readFile(join(dir, "input.rmd"), "utf8");
    const expected = JSON.parse(await readFile(join(dir, "expected.json"), "utf8"));
    const actual = parse(input);
    const validation = validate(actual);

    assert.equal(validation.ok, true, `${name}: parsed AST must validate: ${JSON.stringify(validation.errors)}`);
    assert.deepEqual(actual, expected, `${name}: AST mismatch`);
    results.push({ name, ok: true });
  }

  return results;
}

function filePath(value) {
  return value instanceof URL ? fileURLToPath(value) : value;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const results = await runConformance();
    for (const result of results) {
      console.log(`ok ${result.name}`);
    }
  } catch (error) {
    console.error(error.stack ?? error.message);
    process.exitCode = 1;
  }
}
