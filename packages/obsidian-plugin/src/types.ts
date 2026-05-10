export type RmdDisplayMode = "live" | "split" | "preview";
export type ThemeChoice = "auto" | "default" | "tech-dark" | "paper" | "notion-like";

export interface RmdSettings {
  theme: ThemeChoice;
  defaultMode: RmdDisplayMode;
  debounceMs: number;
  enableInMarkdown: boolean;
}

export interface RenderHostOptions {
  themeCss: string;
  themeId: Exclude<ThemeChoice, "auto">;
}
