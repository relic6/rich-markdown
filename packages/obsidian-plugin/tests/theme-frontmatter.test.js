import assert from "node:assert/strict";
import test from "node:test";
import { readDocumentThemeChoice, writeDocumentThemeChoice } from "../src/theme-frontmatter.js";

test("reads theme from RMD frontmatter", () => {
  const source = `---
title: Demo
theme: tech-dark
---

# Demo`;

  assert.equal(readDocumentThemeChoice(source), "tech-dark");
});

test("updates existing frontmatter theme", () => {
  const source = `---
title: Demo
theme: tech-dark
---

# Demo`;

  assert.equal(writeDocumentThemeChoice(source, "paper"), `---
title: Demo
theme: paper
---

# Demo`);
});

test("inserts theme into existing frontmatter", () => {
  const source = `---
title: Demo
---

# Demo`;

  assert.equal(writeDocumentThemeChoice(source, "notion-like"), `---
title: Demo
theme: notion-like
---

# Demo`);
});

test("creates frontmatter when missing", () => {
  assert.equal(writeDocumentThemeChoice("# Demo\n", "default"), `---
theme: default
---

# Demo
`);
});
