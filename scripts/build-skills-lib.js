// Skill assembler.
//
// The canonical skill content lives in skills/shared/. Each AI platform
// (claude / codex / gemini / ...) gets a flat JSON file in skills/platforms/
// that supplies:
//   - the frontmatter `description` (each platform triggers on different prose)
//   - a `display_name` substituted into the `{{display_name}}` placeholders
//     in the shared SKILL.md / artifacts.md
//   - an `install_root` consumed by `rmd init --ai <id>` to know where to copy
//     the assembled tree on the user's machine
//
// `assembleAll()` walks every platforms/*.json and writes the result into
// skills/dist/<id>/. Re-running is idempotent — the dist tree is wiped first.

import { existsSync } from "node:fs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, "..");
const SKILLS_ROOT = join(REPO_ROOT, "skills");
const SHARED_DIR = join(SKILLS_ROOT, "shared");
const PLATFORMS_DIR = join(SKILLS_ROOT, "platforms");
const DIST_DIR = join(SKILLS_ROOT, "dist");

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

// Files in shared/ that get placeholder substitution. Anything else is copied
// verbatim — `.rmd` source must stay byte-identical because it gets parsed at
// render time, not at assembly.
const TEMPLATED_FILES = new Set([
  "SKILL.md",
  "references/artifacts.md"
]);

/**
 * Assemble a single platform. Returns the absolute path of the output directory.
 */
export async function assembleClient(platformId, options = {}) {
  const skillsRoot = options.skillsRoot ?? SKILLS_ROOT;
  const sharedDir = join(skillsRoot, "shared");
  const platformsDir = join(skillsRoot, "platforms");
  const distDir = options.outRoot ?? join(skillsRoot, "dist");

  const configPath = join(platformsDir, `${platformId}.json`);
  if (!existsSync(configPath)) {
    throw new Error(`unknown platform: ${platformId} (expected ${configPath})`);
  }

  const config = JSON.parse(await readFile(configPath, "utf8"));
  if (config.id !== platformId) {
    throw new Error(`${platformId}.json id "${config.id}" does not match filename`);
  }

  const outDir = join(distDir, platformId);
  await cleanDirContents(outDir);
  await mkdir(outDir, { recursive: true });

  const sharedFiles = await listFiles(sharedDir);
  for (const file of sharedFiles) {
    const rel = relative(sharedDir, file);
    const target = join(outDir, rel);
    await mkdir(dirname(target), { recursive: true });

    if (TEMPLATED_FILES.has(rel.split(/[\\/]/).join("/"))) {
      const tpl = await readFile(file, "utf8");
      await writeFile(target, applyTemplate(tpl, config));
    } else {
      await safeCopyFile(file, target);
    }
  }

  return outDir;
}

/**
 * Assemble every platform found under skills/platforms/. Returns
 * { [platformId]: outDir } for the caller to log / verify.
 */
export async function assembleAll(options = {}) {
  const platformsDir = join(options.skillsRoot ?? SKILLS_ROOT, "platforms");
  const entries = await readdir(platformsDir, { withFileTypes: true });
  const results = {};
  for (const entry of entries) {
    if (!entry.isFile() || extname(entry.name) !== ".json") continue;
    const id = basename(entry.name, ".json");
    results[id] = await assembleClient(id, options);
  }
  return results;
}

/**
 * Substitute `{{placeholder}}` tokens with values from the platform config.
 * Throws on an unknown placeholder so we never ship `{{...}}` literals.
 */
export function applyTemplate(source, config) {
  return source.replace(PLACEHOLDER_RE, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(config, name)) {
      return String(config[name]);
    }
    throw new Error(`unknown placeholder ${match} (define "${name}" in ${config.id}.json)`);
  });
}

/**
 * Wipe a directory's contents without removing the directory itself.
 * Some hosts (e.g. macFUSE / network shares) refuse unlink + rmdir from
 * sandboxed processes, so each failure is treated as best-effort and the
 * build proceeds — subsequent writes will overwrite stale files in place.
 *
 * The only correctness cost: if a shared file is removed but the host
 * blocks unlinks, the corresponding stale file persists in dist/ until
 * the user removes it manually. We log a warning then so it's visible.
 */
async function cleanDirContents(dir) {
  if (!existsSync(dir)) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await cleanDirContents(full);
      await safeRemove(full, { recursive: true });
    } else {
      await safeRemove(full);
    }
  }
}

/**
 * `fs.cp` calls `unlink` on the destination first, which fails on hosts
 * that block unlinks. Fall back to read + write (which is allowed in
 * those same environments since the file is opened with O_TRUNC).
 */
async function safeCopyFile(src, dst) {
  try {
    await cp(src, dst);
    return;
  } catch (err) {
    if (err.code !== "EPERM" && err.code !== "EACCES") throw err;
  }
  const buf = await readFile(src);
  await writeFile(dst, buf);
}

async function safeRemove(path, options = {}) {
  try {
    await rm(path, { force: true, ...options });
  } catch (err) {
    if (err.code === "EPERM" || err.code === "ENOTEMPTY" || err.code === "EACCES") {
      if (!safeRemove._warned) {
        safeRemove._warned = true;
        console.warn(`note: cannot unlink ${path} (${err.code}); reusing in place`);
      }
      return;
    }
    throw err;
  }
}

async function listFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }
  return out.sort();
}

export const PATHS = { REPO_ROOT, SKILLS_ROOT, SHARED_DIR, PLATFORMS_DIR, DIST_DIR };
