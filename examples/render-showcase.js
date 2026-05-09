import { readFileSync, writeFileSync } from "node:fs";
import { renderToString } from "../packages/renderer-core/src/index.js";
import { themes, defaultThemeJs } from "../packages/themes-default/src/index.js";

const filename = process.argv[2] || "v0.2-showcase.rmd";
const source = readFileSync(new URL(`./${filename}`, import.meta.url), "utf8");

let html = renderToString(source);

// 往生成的 HTML 中注入默认主题的 CSS 和 JS
html = html.replace("</head>", `  <style>\n${themes.default}\n  </style>\n</head>`);
html = html.replace("</body>", `  <script>\n${defaultThemeJs}\n  </script>\n</body>`);

const outName = filename.replace(".rmd", ".html");
writeFileSync(new URL(`./${outName}`, import.meta.url), html);
console.log(`Rendered to examples/${outName}`);
