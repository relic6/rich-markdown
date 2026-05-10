import esbuild from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.argv.includes("production");
const watch = process.argv.includes("--watch") || process.argv.includes("watch");

const external = [
  "obsidian",
  "electron",
  "@codemirror/state",
  "@codemirror/view",
  "@codemirror/language",
  "@codemirror/commands",
  "@codemirror/search",
  "@codemirror/autocomplete",
  "@codemirror/collab",
  "@codemirror/lint"
];

async function copyStaticFiles() {
  await mkdir(join(__dirname, "dist"), { recursive: true });
  await copyFile(join(__dirname, "manifest.json"), join(__dirname, "dist", "manifest.json"));
  await copyFile(join(__dirname, "styles.css"), join(__dirname, "dist", "styles.css"));
}

const context = await esbuild.context({
  entryPoints: [join(__dirname, "src/main.ts")],
  bundle: true,
  external,
  format: "cjs",
  target: "es2020",
  platform: "browser",
  outfile: join(__dirname, "dist/main.js"),
  sourcemap: !isProd,
  minify: isProd,
  treeShaking: true,
  logLevel: "info"
});

if (watch) {
  await copyStaticFiles();
  await context.watch();
  console.log("Watching Rich Markdown Obsidian plugin...");
} else {
  await context.rebuild();
  await copyStaticFiles();
  await context.dispose();
}
