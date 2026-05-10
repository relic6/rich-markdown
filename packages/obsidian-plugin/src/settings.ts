import { App, PluginSettingTab, Setting } from "obsidian";
import type RichMarkdownPlugin from "./main";
import type { RmdDisplayMode, RmdSettings, ThemeChoice } from "./types";

export const DEFAULT_SETTINGS: RmdSettings = {
  theme: "auto",
  defaultMode: "live",
  debounceMs: 150,
  enableInMarkdown: true
};

export class RmdSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: RichMarkdownPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Rich Markdown" });

    new Setting(containerEl)
      .setName("Theme")
      .setDesc("Visual theme for rendered Rich Markdown content.")
      .addDropdown((dropdown) => dropdown
        .addOption("auto", "Auto (follow Obsidian)")
        .addOption("default", "Default")
        .addOption("tech-dark", "Tech Dark")
        .addOption("paper", "Paper")
        .addOption("notion-like", "Notion-like")
        .setValue(this.plugin.settings.theme)
        .onChange(async (value) => {
          this.plugin.settings.theme = value as ThemeChoice;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Default view mode")
      .setDesc("How .rmd files open by default.")
      .addDropdown((dropdown) => dropdown
        .addOption("live", "Live")
        .addOption("split", "Split")
        .addOption("preview", "Preview")
        .setValue(this.plugin.settings.defaultMode)
        .onChange(async (value) => {
          this.plugin.settings.defaultMode = value as RmdDisplayMode;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Re-render debounce")
      .setDesc("Wait this long after editing before refreshing the preview.")
      .addSlider((slider) => slider
        .setLimits(50, 500, 50)
        .setValue(this.plugin.settings.debounceMs)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.debounceMs = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Enable in regular Markdown files")
      .setDesc("Render fenced rmd code blocks in normal .md Reading mode.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.enableInMarkdown)
        .onChange(async (value) => {
          this.plugin.settings.enableInMarkdown = value;
          await this.plugin.saveSettings();
        }));
  }
}
