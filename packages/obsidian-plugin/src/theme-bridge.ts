import { themes } from "@rmd/themes-default";
import type { ThemeChoice } from "./types";
import { resolveThemeId } from "./theme-bridge-core.js";

export type { ThemeChoice } from "./types";

export function resolveTheme(choice: ThemeChoice): Exclude<ThemeChoice, "auto"> {
  return resolveThemeId(choice, document.body.classList.contains("theme-dark")) as Exclude<ThemeChoice, "auto">;
}

export function getThemeCss(choice: ThemeChoice): string {
  const id = resolveTheme(choice);
  return themes[id] ?? themes.default;
}

export function getThemeRenderOptions(choice: ThemeChoice) {
  const themeId = resolveTheme(choice);
  return {
    themeId,
    themeCss: themes[themeId] ?? themes.default
  };
}
