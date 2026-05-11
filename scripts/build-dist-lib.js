import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { themes } from "../packages/themes-default/src/index.js";

export const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export async function buildDist({ outdir = join(projectRoot, "dist"), themeNames = Object.keys(themes) } = {}) {
  await mkdir(join(outdir, "themes"), { recursive: true });

  await build({
    entryPoints: [join(projectRoot, "packages/renderer/src/browser-global.js")],
    outfile: join(outdir, "rmd.min.js"),
    bundle: true,
    minify: true,
    format: "iife",
    platform: "browser",
    target: ["es2022"],
    logLevel: "silent"
  });

  await build({
    entryPoints: [join(projectRoot, "packages/cli/src/index.js")],
    outfile: join(outdir, "cli.js"),
    bundle: true,
    platform: "node",
    format: "esm",
    target: ["node18"],
    logLevel: "silent"
  });

  for (const name of themeNames) {
    await writeFile(join(outdir, "themes", `${name}.css`), themes[name] ?? themes.default, "utf8");
  }

  return outdir;
}
