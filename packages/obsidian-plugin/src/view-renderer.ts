import { parse } from "@rmd/parser-core";
import { renderFragmentToString } from "@rmd/renderer-core";
import { hydrate } from "@rmd/runtime";
import type { RenderHostOptions } from "./types";
import { scopeThemeCss } from "./theme-css.js";

const HOST_TAG = "rmd-render";

let hostRegistered = false;

export function registerRmdHostElement() {
  if (hostRegistered || typeof customElements === "undefined" || customElements.get(HOST_TAG)) {
    hostRegistered = true;
    return;
  }

  customElements.define(HOST_TAG, class RmdRenderElement extends HTMLElement {});
  hostRegistered = true;
}

export function createRmdHost(source: string, options: RenderHostOptions): HTMLElement {
  registerRmdHostElement();
  const host = document.createElement(HOST_TAG);
  host.classList.add("rmd-render-host");
  host.attachShadow({ mode: "open" });
  updateRmdHost(host, source, options);
  return host;
}

export function updateRmdHost(host: HTMLElement, source: string, options: RenderHostOptions) {
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });

  try {
    const ast = parse(source);
    const html = renderFragmentToString(ast);
    const frontmatter = ast.frontmatter as { theme?: string };
    const resolvedTheme = frontmatter.theme && frontmatter.theme !== "auto"
      ? String(frontmatter.theme)
      : options.themeId;

    shadow.innerHTML = [
      `<style>${scopeThemeCss(options.themeCss)}</style>`,
      `<main class="rmd-document" data-rmd-theme="${escapeAttr(resolvedTheme)}" data-rmd-version="${escapeAttr(ast.version)}">`,
      html,
      "</main>"
    ].join("\n");

    hydrate(shadow);
    host.removeAttribute("data-rmd-error");
  } catch (error) {
    host.setAttribute("data-rmd-error", "true");
    shadow.innerHTML = [
      `<style>${errorCss}</style>`,
      `<pre class="rmd-preview-error">${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>`
    ].join("\n");
  }
}

export function renderRmdFragment(source: string, options: RenderHostOptions): string {
  const ast = parse(source);
  return [
    `<style>${scopeThemeCss(options.themeCss)}</style>`,
    `<main class="rmd-document" data-rmd-theme="${escapeAttr(options.themeId)}" data-rmd-version="${escapeAttr(ast.version)}">`,
    renderFragmentToString(ast),
    "</main>"
  ].join("\n");
}

const errorCss = `
.rmd-preview-error {
  margin: 0;
  border: 1px solid #b63f35;
  border-radius: 8px;
  padding: 12px;
  color: #b63f35;
  background: #fff5f3;
  white-space: pre-wrap;
}
`.trim();

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
