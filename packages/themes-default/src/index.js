// Theme registry — the single source of truth for which themes ship in this
// package. Each theme is exported as a complete, self-contained CSS string
// (the build pipeline writes it to themes/{name}.css and the renderer inlines
// it for self-contained mode).
//
// Per ARCHITECTURE TD-004 + PRINCIPLES P6: themes are pure CSS. They cannot
// add or remove DOM nodes and must use the same .rmd-* selectors the renderer
// emits. Each non-default theme is a small CSS override appended to the
// default base layout, so every theme.css remains self-contained.

import { defaultThemeCss } from "./default.js";
import { techDarkOverrides } from "./tech-dark.js";
import { paperOverrides } from "./paper.js";
import { notionLikeOverrides } from "./notion-like.js";
import { defaultThemeJs } from "./runtime.js";

export { defaultThemeCss } from "./default.js";
export { defaultThemeJs } from "./runtime.js";

/**
 * The exported themes registry. Keys must match the theme id used in
 * frontmatter (`theme: tech-dark`) and in CDN URLs
 * (`themes/tech-dark.css`).
 */
export const themes = {
  default: defaultThemeCss,
  "tech-dark": `${defaultThemeCss}\n\n${techDarkOverrides}`,
  paper: `${defaultThemeCss}\n\n${paperOverrides}`,
  "notion-like": `${defaultThemeCss}\n\n${notionLikeOverrides}`
};

/**
 * Lightweight metadata for theme pickers / dev tools. Not consumed by the
 * renderer itself; safe to extend without breaking compatibility.
 */
export const themeMeta = {
  default: {
    id: "default",
    displayName: "Default",
    summary: "Warm cream stock with sage primary; the project's reference look."
  },
  "tech-dark": {
    id: "tech-dark",
    displayName: "Tech Dark",
    summary: "Deep midnight base with neon-mint primary and violet accent."
  },
  paper: {
    id: "paper",
    displayName: "Paper",
    summary: "Scholarly cream stock with serif body and restrained decoration."
  },
  "notion-like": {
    id: "notion-like",
    displayName: "Notion-like",
    summary: "Clean white page with system UI font and pill controls."
  }
};
