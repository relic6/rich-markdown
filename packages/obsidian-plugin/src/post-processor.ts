import type { MarkdownPostProcessorContext } from "obsidian";
import type { RenderHostOptions } from "./types";
import { createRmdHost } from "./view-renderer";

export function createPostProcessor(getOptions: (sourcePath?: string) => RenderHostOptions, isEnabled: () => boolean) {
  return (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    if (!isEnabled()) {
      return;
    }

    for (const code of findRmdCodeBlocks(el)) {
      const source = code.textContent ?? "";
      const host = createRmdHost(source, getOptions(ctx.sourcePath));
      host.classList.add("rmd-post-processor-host");
      code.parentElement?.replaceWith(host);
    }
  };
}

export function findRmdCodeBlocks(el: ParentNode): HTMLElement[] {
  return Array.from(el.querySelectorAll("pre > code"))
    .filter((code): code is HTMLElement => code instanceof HTMLElement && isRmdCodeElement(code));
}

export function isRmdCodeElement(code: HTMLElement): boolean {
  const language = Array.from(code.classList).find((item) => item.startsWith("language-"));
  if (language === "language-rmd" || language === "language-rich-markdown") {
    return true;
  }

  return (code.textContent ?? "").trimStart().startsWith(":::");
}
