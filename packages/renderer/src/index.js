import { parse } from "../../parser-core/src/index.js";
import { renderFragmentToString, renderToString as renderAstToString } from "../../renderer-core/src/index.js";
import { hydrate } from "../../runtime/src/index.js";
import { inlineRuntimeScript } from "../../runtime/src/inline-runtime.js";
import { themes } from "../../themes-default/src/index.js";

export { parse } from "../../parser-core/src/index.js";
export { renderFragmentToString, renderNode, renderToString } from "../../renderer-core/src/index.js";
export { hydrate } from "../../runtime/src/index.js";

export function createRenderer(options = {}) {
  const defaultTheme = options.theme ?? "default";

  return {
    parse(source) {
      return parse(source);
    },

    renderToString(input, renderOptions = {}) {
      return renderAstToString(input, {
        theme: renderOptions.theme ?? defaultTheme
      });
    },

    render(renderOptions) {
      return render({
        theme: defaultTheme,
        ...renderOptions
      });
    },

    buildHtml(source, buildOptions = {}) {
      return buildHtml(source, {
        theme: buildOptions.theme ?? defaultTheme,
        ...buildOptions
      });
    }
  };
}

export function render({ source, ast, target, theme, hydrate: shouldHydrate = true } = {}) {
  if (!target) {
    throw new TypeError("render requires a target");
  }

  const parsed = ast ?? parse(source ?? "");
  const html = renderFragmentToString(parsed);
  target.innerHTML = html;

  if (target.dataset) {
    target.dataset.rmdTheme = theme ?? parsed.frontmatter.theme ?? "default";
    target.dataset.rmdVersion = parsed.version;
  } else if (target.setAttribute) {
    target.setAttribute("data-rmd-theme", theme ?? parsed.frontmatter.theme ?? "default");
    target.setAttribute("data-rmd-version", parsed.version);
  }

  const runtime = shouldHydrate && typeof target.querySelectorAll === "function"
    ? hydrate(target)
    : null;

  return {
    ast: parsed,
    html,
    runtime
  };
}

export function buildHtml(source, options = {}) {
  const mode = options.mode ?? "self-contained";
  const ast = parse(source);
  const theme = options.theme ?? ast.frontmatter.theme ?? "default";
  const version = options.version ?? "0.1.0";

  if (mode === "self-contained" || mode === "inline") {
    return buildSelfContained(source, ast, { theme });
  }

  if (mode === "cdn") {
    return buildCdn(source, { theme, version, cdnBase: options.cdnBase });
  }

  if (mode === "split") {
    return buildSplit(source, { theme, scriptPath: options.scriptPath, themePath: options.themePath });
  }

  throw new TypeError(`Unknown build mode: ${mode}`);
}

function buildSelfContained(source, ast, { theme }) {
  const html = renderAstToString(ast, { theme });
  const css = themes[theme] ?? themes.default;
  const sourceTag = `<script type="application/rmd">${escapeScript(source)}</script>`;
  const runtimeTag = `<script data-rmd-runtime-inline>\n${inlineRuntimeScript}\n</script>`;

  return html.replace("</head>", `<style data-rmd-theme-inline="${escapeAttr(theme)}">\n${css}\n</style>\n</head>`)
    .replace("</body>", `${sourceTag}\n${runtimeTag}\n</body>`);
}

function buildCdn(source, { theme, version, cdnBase }) {
  assertSemver(version);
  const base = cdnBase ?? "https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer";
  const root = `${base}/${version}`;

  return [
    "<!doctype html>",
    "<html>",
    "<head>",
    "<meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    `<script src="${escapeAttr(`${root}/rmd.min.js`)}"></script>`,
    `<link rel="stylesheet" href="${escapeAttr(`${root}/themes/${theme}.css`)}">`,
    "</head>",
    "<body>",
    "<div id=\"rmd-root\"></div>",
    `<script type="application/rmd">${escapeScript(source)}</script>`,
    `<script>RMD.render({source:document.querySelector('script[type="application/rmd"]').textContent,target:document.getElementById('rmd-root'),theme:${JSON.stringify(theme)}});</script>`,
    "</body>",
    "</html>"
  ].join("\n");
}

function buildSplit(source, { theme, scriptPath = "./rmd.min.js", themePath }) {
  const cssPath = themePath ?? `./themes/${theme}.css`;

  return [
    "<!doctype html>",
    "<html>",
    "<head>",
    "<meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    `<script src="${escapeAttr(scriptPath)}"></script>`,
    `<link rel="stylesheet" href="${escapeAttr(cssPath)}">`,
    "</head>",
    "<body>",
    "<div id=\"rmd-root\"></div>",
    `<script type="application/rmd">${escapeScript(source)}</script>`,
    `<script>RMD.render({source:document.querySelector('script[type="application/rmd"]').textContent,target:document.getElementById('rmd-root'),theme:${JSON.stringify(theme)}});</script>`,
    "</body>",
    "</html>"
  ].join("\n");
}

function assertSemver(version) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new TypeError("CDN build requires a pinned semver version");
  }
}

function escapeScript(value) {
  return String(value).replaceAll("</script", "<\\/script");
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
