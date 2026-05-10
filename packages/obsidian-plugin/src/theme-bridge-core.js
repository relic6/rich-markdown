export const THEME_IDS = ["default", "tech-dark", "paper", "notion-like"];

export function isThemeId(value) {
  return THEME_IDS.includes(value);
}

export function resolveThemeId(choice, isDark = false) {
  if (choice === "auto") {
    return isDark ? "tech-dark" : "default";
  }

  return isThemeId(choice) ? choice : "default";
}

export function nextThemeId(current) {
  const id = current === "auto" ? "default" : current;
  const index = Math.max(0, THEME_IDS.indexOf(id));
  return THEME_IDS[(index + 1) % THEME_IDS.length];
}
