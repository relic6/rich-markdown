import { Notice, Plugin, TFile } from "obsidian";
import { buildHtml } from "@rmd/renderer";
import { rmdLiveExtension } from "./live-preview";
import { createPostProcessor } from "./post-processor";
import { RmdSettingTab, DEFAULT_SETTINGS } from "./settings";
import { getThemeRenderOptions } from "./theme-bridge";
import { nextThemeId } from "./theme-bridge-core.js";
import { resolveObsidianResourceUrl } from "./resource-paths.js";
import type { RenderHostOptions, RmdDisplayMode, RmdSettings, ThemeChoice } from "./types";
import { RmdView, RMD_VIEW_TYPE } from "./view-rmd";

const INSERT_SNIPPETS = {
  chart: `\`\`\`rmd
:::chart bar title="Metric"
A 1
B 2
:::
\`\`\`
`,
  callout: `\`\`\`rmd
:::callout tip title="Note"
Write the callout body here.
:::
\`\`\`
`
};

export default class RichMarkdownPlugin extends Plugin {
  settings: RmdSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerView(RMD_VIEW_TYPE, (leaf) => new RmdView(leaf, this));
    this.registerExtensions(["rmd"], RMD_VIEW_TYPE);

    this.registerMarkdownPostProcessor(
      createPostProcessor(
        (sourcePath) => this.getRenderOptions(sourcePath),
        () => this.settings.enableInMarkdown
      )
    );
    this.registerEditorExtension(
      rmdLiveExtension(
        () => this.getRenderOptions(this.app.workspace.getActiveFile()?.path),
        () => this.settings.enableInMarkdown
      )
    );

    this.addSettingTab(new RmdSettingTab(this.app, this));
    this.addRibbonIcon("file-text", "Rich Markdown", () => {
      new Notice("Rich Markdown plugin is loaded.");
    });

    this.registerCommands();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof RmdView) {
        leaf.view.refreshFromSettings(this.settings);
      }
    });
  }

  getRenderOptions(sourcePath?: string): RenderHostOptions {
    return {
      ...getThemeRenderOptions(this.settings.theme),
      resourceSourcePath: sourcePath,
      resolveResourceUrl: (url) => resolveObsidianResourceUrl(this.app.vault, sourcePath, url)
    };
  }

  private registerCommands() {
    this.addCommand({
      id: "rmd-switch-mode-live",
      name: "Switch to Live mode",
      checkCallback: (checking) => this.switchActiveMode("live", checking)
    });

    this.addCommand({
      id: "rmd-switch-mode-split",
      name: "Switch to Split mode",
      checkCallback: (checking) => this.switchActiveMode("split", checking)
    });

    this.addCommand({
      id: "rmd-switch-mode-preview",
      name: "Switch to Preview mode",
      checkCallback: (checking) => this.switchActiveMode("preview", checking)
    });

    this.addCommand({
      id: "rmd-export-html",
      name: "Export current .rmd as self-contained HTML",
      checkCallback: (checking) => this.exportActiveRmd(checking)
    });

    this.addCommand({
      id: "rmd-toggle-theme",
      name: "Toggle Rich Markdown theme",
      callback: async () => {
        const next = nextThemeId(this.settings.theme) as ThemeChoice;
        this.settings.theme = next;
        await this.saveSettings();
        new Notice(`Rich Markdown theme: ${next}`);
      }
    });

    this.addCommand({
      id: "rmd-insert-block-chart",
      name: "Insert Rich Markdown chart block",
      editorCallback: (editor) => editor.replaceSelection(INSERT_SNIPPETS.chart)
    });

    this.addCommand({
      id: "rmd-insert-block-callout",
      name: "Insert Rich Markdown callout block",
      editorCallback: (editor) => editor.replaceSelection(INSERT_SNIPPETS.callout)
    });
  }

  private switchActiveMode(mode: RmdDisplayMode, checking: boolean) {
    const view = this.app.workspace.getActiveViewOfType(RmdView);
    if (!view) {
      return false;
    }

    if (checking) {
      return true;
    }

    view.setDisplayMode(mode);
    return true;
  }

  private exportActiveRmd(checking: boolean) {
    const view = this.app.workspace.getActiveViewOfType(RmdView);
    const activeFile = this.app.workspace.getActiveFile();
    const file = view?.file ?? activeFile;

    if (!(file instanceof TFile) || file.extension !== "rmd") {
      return false;
    }

    if (checking) {
      return true;
    }

    void this.exportFile(file, view?.getViewData());
    return true;
  }

  private async exportFile(file: TFile, viewData?: string) {
    const source = viewData ?? await this.app.vault.read(file);
    const html = buildHtml(source, {
      mode: "self-contained",
      theme: this.getRenderOptions().themeId
    });
    const outPath = file.path.replace(/\.rmd$/i, ".html");
    const existing = this.app.vault.getAbstractFileByPath(outPath);

    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, html);
    } else {
      await this.app.vault.create(outPath, html);
    }

    new Notice(`Exported Rich Markdown HTML: ${outPath}`);
  }
}
