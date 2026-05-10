export function scopeThemeCss(css) {
  return String(css)
    .replaceAll(":root", ":host")
    .replaceAll("body[data-rmd-theme]::before", ":host::before")
    .replaceAll("body[data-rmd-theme]", ":host");
}
