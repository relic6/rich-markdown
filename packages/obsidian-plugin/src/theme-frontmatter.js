import { isThemeId } from "./theme-bridge-core.js";

export const THEME_CHOICES = ["auto", "default", "tech-dark", "paper", "notion-like"];

export function isThemeChoice(value) {
  return value === "auto" || isThemeId(value);
}

export function readDocumentThemeChoice(source) {
  const frontmatter = readFrontmatter(String(source ?? ""));
  if (!frontmatter) {
    return null;
  }

  const match = frontmatter.raw.match(/^theme:\s*["']?([^"'\n#]+)["']?\s*(?:#.*)?$/m);
  if (!match) {
    return null;
  }

  const theme = match[1].trim();
  return isThemeChoice(theme) ? theme : null;
}

export function writeDocumentThemeChoice(source, theme) {
  const normalizedTheme = isThemeChoice(theme) ? theme : "default";
  const text = String(source ?? "");
  const frontmatter = readFrontmatter(text);
  if (!frontmatter) {
    return `---\ntheme: ${normalizedTheme}\n---\n\n${text}`;
  }

  const themeLine = /^theme:\s*.*$/m;
  const nextRaw = themeLine.test(frontmatter.raw)
    ? frontmatter.raw.replace(themeLine, `theme: ${normalizedTheme}`)
    : appendThemeLine(frontmatter.raw, normalizedTheme);

  return `${text.slice(0, frontmatter.start)}---\n${nextRaw}\n---${text.slice(frontmatter.end)}`;
}

function readFrontmatter(source) {
  const normalized = source.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    return null;
  }

  const closeIndex = normalized.indexOf("\n---", 4);
  if (closeIndex === -1) {
    return null;
  }

  const closeEnd = closeIndex + "\n---".length;
  return {
    start: 0,
    end: closeEnd,
    raw: normalized.slice(4, closeIndex)
  };
}

function appendThemeLine(raw, theme) {
  return raw.endsWith("\n")
    ? `${raw}theme: ${theme}`
    : `${raw}\ntheme: ${theme}`;
}
