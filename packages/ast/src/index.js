export const RMD_AST_VERSION = "0.1.0";

export const CORE_BLOCK_TYPES = new Set([
  // v0.1 core 8 blocks
  "chart",
  "grid",
  "callout",
  "slider",
  "export",
  "flow",
  "diff",
  "tabs",
  // v0.2 extension blocks
  "timeline",
  "kanban",
  "details",
  "carousel",
  "embed",
  "math"
]);

export function createRoot({ frontmatter = {}, warnings = [], children = [] } = {}) {
  return {
    type: "root",
    version: RMD_AST_VERSION,
    frontmatter,
    warnings,
    children
  };
}

export function codeBlock(value, { lang = null, warnings = [], raw = value } = {}) {
  const node = {
    type: "code-block",
    lang,
    value
  };

  if (warnings.length > 0) {
    node.warnings = warnings;
  }

  if (raw !== undefined) {
    node.raw = raw;
  }

  return node;
}

export function text(value) {
  return { type: "text", value };
}

export function paragraph(value) {
  return {
    type: "paragraph",
    children: [text(value)]
  };
}

export function heading(level, value) {
  return {
    type: "heading",
    level,
    children: [text(value)]
  };
}

export function validateAst(ast) {
  const errors = [];

  if (!ast || ast.type !== "root") {
    errors.push({ path: "", message: "AST root must have type \"root\"" });
    return { ok: false, errors };
  }

  if (typeof ast.version !== "string") {
    errors.push({ path: "/version", message: "version must be a string" });
  }

  if (!ast.frontmatter || typeof ast.frontmatter !== "object" || Array.isArray(ast.frontmatter)) {
    errors.push({ path: "/frontmatter", message: "frontmatter must be an object" });
  }

  if (!Array.isArray(ast.warnings)) {
    errors.push({ path: "/warnings", message: "warnings must be an array" });
  }

  if (!Array.isArray(ast.children)) {
    errors.push({ path: "/children", message: "children must be an array" });
  }

  return { ok: errors.length === 0, errors };
}
