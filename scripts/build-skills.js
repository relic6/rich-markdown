#!/usr/bin/env node
// CLI entry: `node scripts/build-skills.js` or `npm run build:skills`.
// Optionally accepts client ids: `node scripts/build-skills.js claude codex`.

import { assembleAll, assembleClient, PATHS } from "./build-skills-lib.js";
import { relative } from "node:path";

const argv = process.argv.slice(2);

try {
  let results;
  if (argv.length === 0) {
    results = await assembleAll();
  } else {
    results = {};
    for (const id of argv) {
      results[id] = await assembleClient(id);
    }
  }

  for (const [id, outDir] of Object.entries(results)) {
    console.log(`ok ${id} -> ${relative(PATHS.REPO_ROOT, outDir)}`);
  }
} catch (error) {
  console.error(`skill build failed: ${error.message}`);
  process.exitCode = 1;
}
