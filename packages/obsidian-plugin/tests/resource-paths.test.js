import assert from "node:assert/strict";
import test from "node:test";
import {
  isResolvableResourceUrl,
  resolveObsidianResourceUrl,
  splitUrlReference,
  toVaultResourcePath
} from "../src/resource-paths.js";

test("resolves image paths relative to the current rmd file", () => {
  assert.equal(
    toVaultResourcePath("reports/china-cloud-market-analysis.rmd", "assets/china-cloud-hero.png"),
    "reports/assets/china-cloud-hero.png"
  );
});

test("resolves root-relative image paths from the vault root", () => {
  assert.equal(
    toVaultResourcePath("reports/china-cloud-market-analysis.rmd", "/assets/china-cloud-hero.png"),
    "assets/china-cloud-hero.png"
  );
});

test("normalizes relative path segments", () => {
  assert.equal(
    toVaultResourcePath("reports/2026/analysis.rmd", "../assets/hero.png"),
    "reports/assets/hero.png"
  );
});

test("preserves query and hash suffixes on resolved resource URLs", () => {
  const vault = fakeVault(["reports/assets/hero image.png"]);

  assert.equal(
    resolveObsidianResourceUrl(vault, "reports/analysis.rmd", "assets/hero%20image.png?raw=1#crop"),
    "app://vault/reports/assets/hero image.png?raw=1#crop"
  );
});

test("leaves external and fragment URLs unresolved", () => {
  assert.equal(isResolvableResourceUrl("https://example.com/hero.png"), false);
  assert.equal(isResolvableResourceUrl("data:image/png;base64,abc"), false);
  assert.equal(isResolvableResourceUrl("blob:https://example.com/id"), false);
  assert.equal(isResolvableResourceUrl("//cdn.example.com/hero.png"), false);
  assert.equal(isResolvableResourceUrl("#hero"), false);
});

test("splits path suffix without losing url metadata", () => {
  assert.deepEqual(splitUrlReference("assets/hero.png#v1"), {
    path: "assets/hero.png",
    suffix: "#v1"
  });
  assert.deepEqual(splitUrlReference("assets/hero.png?size=large#v1"), {
    path: "assets/hero.png",
    suffix: "?size=large#v1"
  });
});

function fakeVault(existingPaths) {
  const files = new Map(existingPaths.map((path) => [path, { path }]));
  return {
    getAbstractFileByPath(path) {
      return files.get(path) ?? null;
    },
    getResourcePath(file) {
      return `app://vault/${file.path}`;
    }
  };
}
