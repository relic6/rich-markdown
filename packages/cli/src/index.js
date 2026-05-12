#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "../../parser-core/src/index.js";
import { buildHtml } from "../../renderer/src/index.js";
import { validate } from "../../validator/src/index.js";
import { createPreviewServer } from "./preview-server.js";

const USAGE = `
Rich Markdown (rmd) CLI v0.1.2

Usage:
  rmd <command> [options]

Commands:
  init              Install the Rich Markdown skill for an AI assistant
  parse <file>       Parse an .rmd file and output the AST as JSON
  validate <file>    Validate an .rmd file against the schema
  build <file>       Compile an .rmd file into HTML
  open <file>        Start a local dev server and preview the .rmd file

Options for 'init':
  --ai <ids>        Target AI assistant: codex, claude, gemini, or all
  --force true      Overwrite existing skill files

Options for 'build' and 'open':
  --mode <mode>      'self-contained' (default), 'cdn', or 'split'
  --theme <name>     Theme to use (default: 'default')
  --version <semver> Specify a version for the output
  --out <file>       (build only) Output file path
  --port <number>    (open only) Port to listen on (default: random)
  --host <host>      (open only) Host to listen on (default: 127.0.0.1)
  --no-open true     (open only) Do not automatically open the browser

Global Options:
  --help, -h         Show this help message
  --version, -v      Show the current CLI version

Examples:
  rmd init --ai codex
  rmd init --ai claude
  rmd init --ai gemini
  rmd parse examples/v0.2-showcase.rmd
  rmd build examples/china-pet-market-analysis.rmd --mode self-contained --out dist/demo.html
  rmd open examples/v0.2-showcase.rmd --port 3000
`.trim();

const SKILL_NAME = "rich-markdown";
const PLATFORM_TARGETS = {
  codex: {
    displayName: "Codex",
    root: ".codex"
  },
  claude: {
    displayName: "Claude Code",
    root: ".claude"
  },
  gemini: {
    displayName: "Gemini",
    root: ".gemini"
  }
};

export async function main(argv = process.argv.slice(2), io = defaultIo()) {
  const [command, ...rest] = argv;

  try {
    if (command === "init") {
      await runInit(rest, io);
      return 0;
    }

    if (command === "parse") {
      await runParse(rest, io);
      return 0;
    }

    if (command === "validate") {
      return await runValidate(rest, io);
    }

    if (command === "build") {
      await runBuild(rest, io);
      return 0;
    }

    if (command === "open") {
      await runOpen(rest, io);
      return 0;
    }

    if (command === "--version" || command === "-v") {
      io.stdout(`rmd v0.1.2\n`);
      return 0;
    }

    if (command === "--help" || command === "-h" || command === undefined) {
      io.stdout(`${USAGE}\n`);
      return command === undefined ? 1 : 0;
    }

    io.stderr(`Unknown command: ${command}\n\n${USAGE}\n`);
    return 1;
  } catch (error) {
    io.stderr(`${error.message}\n`);
    return 1;
  }
}

async function runInit(args, io) {
  const flags = parseInitArgs(args);
  rejectUnknownFlags(flags, ["ai", "force"]);

  const platforms = resolveInitPlatforms(flags.ai);
  const force = flags.force === "true" || flags.force === true;

  for (const platform of platforms) {
    await installSkillForPlatform(platform, { force }, io);
  }
}

async function installSkillForPlatform(platform, options, io) {
  const target = PLATFORM_TARGETS[platform];
  if (!target) {
    throw new Error(`Unsupported AI assistant: ${platform}`);
  }

  const sourceDir = resolveSkillSource(platform);
  if (!sourceDir) {
    throw new Error(`Missing bundled skill assets for ${platform}`);
  }

  const targetDir = resolve(process.cwd(), target.root, "skills", SKILL_NAME);
  const existed = existsSync(targetDir);
  await copyDirectory(sourceDir, targetDir, { force: options.force });

  const action = existed && !options.force ? "repaired" : "installed";
  io.stdout(`${target.displayName} skill ${action}: ${targetDir}\n`);
}

function resolveInitPlatforms(rawAi) {
  if (!rawAi) {
    const detected = detectPlatform();
    if (detected) return [detected];
    throw new Error("init requires --ai <codex|claude|gemini|all>");
  }

  const values = String(rawAi)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const platforms = values.includes("all") ? Object.keys(PLATFORM_TARGETS) : values;
  for (const platform of platforms) {
    if (!PLATFORM_TARGETS[platform]) {
      throw new Error(`Unsupported AI assistant: ${platform}`);
    }
  }

  return [...new Set(platforms)];
}

function detectPlatform() {
  if (existsSync(resolve(process.cwd(), ".codex"))) return "codex";
  if (existsSync(resolve(process.cwd(), ".claude"))) return "claude";
  if (existsSync(resolve(process.cwd(), ".gemini"))) return "gemini";
  return null;
}

function parseInitArgs(args) {
  const flags = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = value;
    index += 1;
  }

  return flags;
}

function resolveSkillSource(platform) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // Search order (first hit wins):
  //   1. Pre-assembled per-platform output at `skills/dist/<platform>` —
  //      what `npm run build:skills` produces from `skills/shared/` +
  //      `skills/platforms/<platform>.json`. Prefer this so a normal
  //      checkout uses the up-to-date assembled tree.
  //   2. Published-package layout `assets/skills/<platform>` — used after
  //      `npm publish` flattens dist/ alongside assets/.
  const candidates = [
    resolve(__dirname, "../../../skills/dist", platform),
    resolve(__dirname, "../skills/dist", platform),
    resolve(__dirname, "../assets/skills", platform)
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

async function copyDirectory(sourceDir, targetDir, options) {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === ".DS_Store") {
      continue;
    }

    const source = join(sourceDir, entry.name);
    const target = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(source, target, options);
      continue;
    }

    if (!options.force && existsSync(target)) {
      continue;
    }

    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target);
  }
}

async function runParse(args, io) {
  const { file, flags } = parseArgs(args);
  if (!file) {
    throw new Error("parse requires a file path");
  }

  rejectUnknownFlags(flags, []);

  const source = await readFile(resolve(file), "utf8");
  const ast = parse(source);
  const result = validate(ast);
  if (!result.ok) {
    throw new Error(formatValidationErrors(result.errors));
  }

  io.stdout(`${JSON.stringify(ast, null, 2)}\n`);
}

async function runValidate(args, io) {
  const { file, flags } = parseArgs(args);
  if (!file) {
    throw new Error("validate requires a file path");
  }

  rejectUnknownFlags(flags, []);

  const source = await readFile(resolve(file), "utf8");
  const result = validate(parse(source));

  if (!result.ok) {
    io.stderr(`${formatValidationErrors(result.errors)}\n`);
    return 1;
  }

  io.stdout("ok\n");
  return 0;
}

async function runBuild(args, io) {
  const { file, flags } = parseArgs(args);
  if (!file) {
    throw new Error("build requires a file path");
  }

  rejectUnknownFlags(flags, ["mode", "theme", "version", "out"]);

  const source = await readFile(resolve(file), "utf8");
  const html = buildHtml(source, {
    mode: flags.mode ?? "self-contained",
    theme: flags.theme,
    version: flags.version
  });

  if (flags.out) {
    const outPath = resolve(flags.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    if (flags.mode === "split") {
      await writeSplitAssets(outPath, flags.theme ?? parse(source).frontmatter.theme ?? "default");
    }
    io.stdout(`${outPath}\n`);
    return;
  }

  io.stdout(`${html}\n`);
}

async function runOpen(args, io) {
  const { file, flags } = parseArgs(args);
  if (!file) {
    throw new Error("open requires a file path");
  }

  rejectUnknownFlags(flags, ["mode", "theme", "version", "port", "host", "no-open"]);

  const preview = await createPreviewServer(file, {
    mode: flags.mode ?? "self-contained",
    theme: flags.theme,
    version: flags.version
  });
  const port = flags.port === undefined ? 0 : Number(flags.port);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("--port must be a valid TCP port");
  }

  const url = await preview.listen(port, flags.host ?? "127.0.0.1");
  io.stdout(`${url}\n`);

  if (flags["no-open"] === "true") {
    await preview.close();
    return;
  }

  openBrowser(url);
  await waitUntilInterrupted(preview);
}

function parseArgs(args) {
  const flags = {};
  let file = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      flags[key] = value;
      index += 1;
      continue;
    }

    if (file) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    file = arg;
  }

  return { file, flags };
}

function rejectUnknownFlags(flags, allowed) {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(flags)) {
    if (!allowedSet.has(key)) {
      throw new Error(`Unknown flag: --${key}`);
    }
  }
}

function formatValidationErrors(errors) {
  return errors.map((error) => `${error.path || "/"}: ${error.message}`).join("\n");
}

function defaultIo() {
  return {
    stdout(value) {
      process.stdout.write(value);
    },
    stderr(value) {
      process.stderr.write(value);
    }
  };
}

async function writeSplitAssets(outPath, theme) {
  const { buildDist } = await import("../../../scripts/build-dist-lib.js");
  const outDir = dirname(outPath);
  await buildDist({ outdir: outDir, themeNames: [theme] });
}

function waitUntilInterrupted(preview) {
  return new Promise((resolveWait) => {
    const stop = async () => {
      process.off("SIGINT", stop);
      process.off("SIGTERM", stop);
      await preview.close();
      resolveWait();
    };

    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
  });
}

function openBrowser(url) {
  const platform = process.platform;
  const command = platform === "darwin"
    ? "open"
    : platform === "win32"
      ? "cmd"
      : "xdg-open";
  const args = platform === "win32"
    ? ["/c", "start", "", url]
    : [url];

  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore"
  });
  child.unref();
}

let isEntrypoint = false;
if (process.argv[1]) {
  try {
    isEntrypoint = realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch (e) {
    isEntrypoint = resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isEntrypoint) {
  const code = await main();
  process.exitCode = code;
}
