import assert from "node:assert/strict";
import test from "node:test";
import { createPreviewServer } from "../packages/cli/src/preview-server.js";

test("preview server serves self-contained rendered HTML", async () => {
  const preview = await createPreviewServer("examples/rate-limit-decision.rmd");

  try {
    const url = await preview.listen();
    const response = await fetch(url);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(html, /data-rmd-block="chart"/);
    assert.match(html, /<style data-rmd-theme-inline=/);
  } finally {
    await preview.close();
  }
});

test("preview server returns 404 for unknown paths", async () => {
  const preview = await createPreviewServer("examples/rate-limit-decision.rmd");

  try {
    const url = await preview.listen();
    const response = await fetch(`${url}missing`);

    assert.equal(response.status, 404);
  } finally {
    await preview.close();
  }
});
