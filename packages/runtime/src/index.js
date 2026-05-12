export function createDocumentState(ast) {
  const state = {
    sliders: {},
    activeTabs: {}
  };

  visitNodes(ast.children ?? [], (node, path) => {
    if (node.type === "slider" && !node.duplicate && state.sliders[node.name] === undefined) {
      state.sliders[node.name] = node.default;
    }

    if (node.type === "tabs") {
      state.activeTabs[path.join(".")] = node.default;
    }
  });

  return state;
}

export function setSliderValue(state, name, value, spec, bound = null) {
  if (!spec) {
    state.sliders[name] = Number(value);
    return state.sliders[name];
  }

  const numeric = Number(value);
  const clamped = Math.min(Math.max(numeric, spec.min), spec.max);
  const stepped = snapToStep(clamped, spec.min, spec.step);
  const nextValue = Number(stepped.toFixed(12));

  if (spec.range) {
    const previous = Array.isArray(state.sliders[name]) ? state.sliders[name] : [spec.min, spec.max];
    let next = bound === "max" ? [previous[0], nextValue] : [nextValue, previous[1]];
    if (next[0] > next[1]) {
      next = bound === "max" ? [nextValue, nextValue] : [next[1], next[1]];
    }
    state.sliders[name] = next;
    return state.sliders[name];
  }

  state.sliders[name] = nextValue;
  return state.sliders[name];
}

export function renderTemplate(template, state) {
  return String(template).replace(/{{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*\|\s*([a-zA-Z_][a-zA-Z0-9_]*))?\s*}}/g, (_match, name, formatter) => {
    if (state.sliders[name] === undefined) {
      return `[未定义:${name}]`;
    }

    return formatValue(state.sliders[name], formatter);
  });
}

export function hydrate(root, options = {}) {
  const doc = root?.ownerDocument ?? globalThis.document;
  if (!root || !doc) {
    throw new TypeError("hydrate requires a DOM root");
  }

  const state = options.state ?? readStateFromDom(root);
  const cleanups = [];
  bindSliders(root, state);
  bindExports(root, state);
  bindTabs(root, state);
  bindCarousels(root, doc, cleanups);
  enhanceMath(root, doc);

  return {
    state,
    destroy() {
      for (const cleanup of cleanups) {
        cleanup();
      }
      root.replaceWith(root.cloneNode(true));
    }
  };
}

function readStateFromDom(root) {
  const state = { sliders: {}, activeTabs: {} };

  for (const slider of root.querySelectorAll("[data-rmd-block=\"slider\"]")) {
    const name = slider.getAttribute("data-name");
    const inputs = Array.from(slider.querySelectorAll("input[type=\"range\"]"));
    if (name && inputs.length > 0 && state.sliders[name] === undefined) {
      state.sliders[name] = slider.getAttribute("data-range") === "true"
        ? inputs.map((input) => Number(input.value))
        : Number(inputs[0].value);
    }
  }

  for (const tabs of root.querySelectorAll("[data-rmd-block=\"tabs\"]")) {
    const key = tabs.getAttribute("data-rmd-id") ?? tabs.getAttribute("data-default") ?? "tabs";
    state.activeTabs[key] = tabs.getAttribute("data-default") ?? "";
  }

  return state;
}

function bindSliders(root, state) {
  for (const slider of root.querySelectorAll("[data-rmd-block=\"slider\"]")) {
    const name = slider.getAttribute("data-name");
    const inputs = Array.from(slider.querySelectorAll("input[type=\"range\"]"));
    const output = slider.querySelector("output");
    if (!name || inputs.length === 0) {
      continue;
    }

    const isRange = slider.getAttribute("data-range") === "true";
    const firstInput = inputs[0];
    const spec = {
      min: Number(firstInput.min),
      max: Number(firstInput.max),
      step: Number(firstInput.step || 1),
      range: isRange
    };

    for (const input of inputs) {
      input.addEventListener("input", () => {
        const value = setSliderValue(state, name, input.value, spec, input.getAttribute("data-bound"));
        if (isRange) {
          inputs[0].value = String(value[0]);
          inputs[1].value = String(value[1]);
          updateRangeTrack(slider, value, spec);
        }
        if (output) {
          output.textContent = formatSliderOutput(value, slider.getAttribute("data-unit") || "");
        }
        dispatchStateChange(root, state);
      });
    }
  }
}

function formatSliderOutput(value, unit) {
  const text = Array.isArray(value) ? value.join(" - ") : String(value);
  return unit ? `${text} ${unit}` : text;
}

function updateRangeTrack(slider, value, spec) {
  const control = slider.querySelector(".rmd-slider-range-control");
  if (!control || !Array.isArray(value) || spec.max === spec.min) {
    return;
  }

  control.style.setProperty("--rmd-range-start", `${sliderPercent(value[0], spec)}%`);
  control.style.setProperty("--rmd-range-end", `${sliderPercent(value[1], spec)}%`);
}

function sliderPercent(value, spec) {
  return String(Math.round(((value - spec.min) / (spec.max - spec.min)) * 10000) / 100);
}

function bindExports(root, state) {
  for (const block of root.querySelectorAll("[data-rmd-block=\"export\"]")) {
    const button = block.querySelector("button");
    const template = block.querySelector("pre code")?.textContent ?? "";
    if (!button) {
      continue;
    }

    button.addEventListener("click", async () => {
      const content = renderTemplate(template, state);
      const ok = await writeClipboard(content);
      block.setAttribute("data-rmd-copied", ok ? "true" : "false");
      if (!ok) {
        showManualCopy(block, content);
      }
    });
  }
}

function bindTabs(root, state) {
  for (const tabs of root.querySelectorAll("[data-rmd-block=\"tabs\"]")) {
    const key = tabs.getAttribute("data-rmd-id") ?? tabs.getAttribute("data-default") ?? "tabs";

    for (const button of tabs.querySelectorAll("[role=\"tab\"]")) {
      button.addEventListener("click", () => {
        const label = button.getAttribute("data-label");
        if (!label) {
          return;
        }

        state.activeTabs[key] = label;
        for (const candidate of tabs.querySelectorAll("[role=\"tab\"]")) {
          candidate.setAttribute("aria-selected", String(candidate.getAttribute("data-label") === label));
        }
        for (const panel of tabs.querySelectorAll("[role=\"tabpanel\"]")) {
          panel.hidden = panel.getAttribute("data-label") !== label;
        }
        dispatchStateChange(root, state);
      });
    }
  }
}

function bindCarousels(root, doc, cleanups) {
  const win = doc.defaultView ?? globalThis;

  for (const carousel of root.querySelectorAll("[data-rmd-block=\"carousel\"]")) {
    const track = carousel.querySelector(".rmd-carousel-track");
    if (!track) {
      continue;
    }

    const items = Array.from(track.children ?? []);
    if (items.length <= 1) {
      continue;
    }

    const prev = carousel.querySelector("[data-rmd-carousel=\"prev\"]");
    const next = carousel.querySelector("[data-rmd-carousel=\"next\"]");
    const dots = Array.from(carousel.querySelectorAll(".rmd-carousel-dot"));
    const interval = Number(carousel.getAttribute("data-interval") || 3000);
    let activeIndex = 0;
    let paused = false;
    let timer = null;

    const normalizeIndex = (index) => (index + items.length) % items.length;
    const updateDots = () => {
      carousel.setAttribute("data-active-index", String(activeIndex));
      dots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    };
    const goTo = (index, behavior = "smooth") => {
      activeIndex = normalizeIndex(index);
      const left = activeIndex * (track.clientWidth || 0);
      if (typeof track.scrollTo === "function") {
        track.scrollTo({ left, behavior });
      } else {
        track.scrollLeft = left;
      }
      updateDots();
    };
    const syncFromScroll = () => {
      if (!track.clientWidth) {
        return;
      }
      activeIndex = normalizeIndex(Math.round(track.scrollLeft / track.clientWidth));
      updateDots();
    };

    prev?.addEventListener("click", () => goTo(activeIndex - 1));
    next?.addEventListener("click", () => goTo(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => goTo(index)));
    track.addEventListener("scroll", syncFromScroll);
    carousel.addEventListener("pointerenter", () => {
      paused = true;
    });
    carousel.addEventListener("pointerleave", () => {
      paused = false;
    });
    carousel.addEventListener("focusin", () => {
      paused = true;
    });
    carousel.addEventListener("focusout", () => {
      paused = false;
    });

    updateDots();

    if (carousel.getAttribute("data-autoplay") === "true" && Number.isFinite(interval) && interval > 0) {
      timer = win.setInterval(() => {
        if (!paused) {
          goTo(activeIndex + 1);
        }
      }, interval);
      cleanups.push(() => win.clearInterval?.(timer));
    }
  }
}

function enhanceMath(root, doc) {
  const blocks = Array.from(root.querySelectorAll(".rmd-math-display[data-latex]"))
    .filter((block) => block.getAttribute("data-rendered") !== "katex");
  if (blocks.length === 0) {
    return;
  }

  const win = doc.defaultView ?? globalThis;
  const useMathmlOutput = isShadowRoot(root);
  ensureKatexStyles(root, doc);
  const render = () => {
    if (!win.katex) {
      return;
    }

    for (const block of blocks) {
      const latex = block.getAttribute("data-latex") || block.textContent || "";
      try {
        win.katex.render(latex, block, {
          displayMode: true,
          throwOnError: false,
          ...(useMathmlOutput ? { output: "mathml" } : {})
        });
        block.setAttribute("data-rendered", "katex");
      } catch {
        // Keep the static formula-style fallback visible when KaTeX rejects input.
      }
    }
  };

  if (win.katex) {
    render();
    return;
  }

  const existingScript = doc.querySelector("script[data-rmd-katex-script]");
  if (existingScript) {
    existingScript.addEventListener("load", render, { once: true });
    return;
  }

  const script = doc.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
  script.async = true;
  script.setAttribute("data-rmd-katex-script", "true");
  script.addEventListener("load", render, { once: true });
  doc.head?.append(script);
}

function ensureKatexStyles(root, doc) {
  appendKatexGuardStyle(doc.head, doc);
  appendKatexStyle(doc.head, doc);
  if (isShadowRoot(root)) {
    appendKatexStyle(root, doc);
  }
}

function appendKatexGuardStyle(target, doc) {
  if (!target || target.querySelector?.("style[data-rmd-katex-guard]")) {
    return;
  }

  const style = doc.createElement("style");
  style.textContent = katexGuardCss;
  style.setAttribute("data-rmd-katex-guard", "true");
  target.append?.(style);
}

function appendKatexStyle(target, doc) {
  if (!target || target.querySelector?.("link[data-rmd-katex-style]")) {
    return;
  }

  const link = doc.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
  link.setAttribute("data-rmd-katex-style", "true");
  target.append?.(link);
}

function isShadowRoot(root) {
  return root?.nodeType === 11 && "host" in root;
}

const katexGuardCss = `
.katex .katex-mathml {
  position: absolute;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  width: 1px;
  height: 1px;
  white-space: nowrap;
}
`.trim();

async function writeClipboard(content) {
  try {
    if (!globalThis.navigator?.clipboard?.writeText) {
      return false;
    }

    await globalThis.navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}

function showManualCopy(block, content) {
  let textarea = block.querySelector("textarea[data-rmd-manual-copy]");
  if (!textarea) {
    textarea = block.ownerDocument.createElement("textarea");
    textarea.setAttribute("data-rmd-manual-copy", "true");
    block.append(textarea);
  }
  textarea.value = content;
}

function dispatchStateChange(root, state) {
  const event = new CustomEvent("rmd:statechange", {
    bubbles: true,
    detail: { state }
  });
  root.dispatchEvent(event);
}

function visitNodes(nodes, visitor, path = []) {
  nodes.forEach((node, index) => {
    const nextPath = [...path, index];
    visitor(node, nextPath);

    if (Array.isArray(node.children)) {
      visitNodes(node.children, visitor, nextPath);
    }

    if (Array.isArray(node.cells)) {
      node.cells.forEach((cell, cellIndex) => visitNodes(cell, visitor, [...nextPath, "cells", cellIndex]));
    }

    if (Array.isArray(node.panels)) {
      node.panels.forEach((panel, panelIndex) => visitNodes(panel.children, visitor, [...nextPath, "panels", panelIndex]));
    }
  });
}

function snapToStep(value, min, step) {
  if (!Number.isFinite(step) || step <= 0) {
    return value;
  }

  return min + Math.round((value - min) / step) * step;
}

function formatValue(value, formatter) {
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item, formatter)).join(" - ");
  }

  switch (formatter) {
    case "int":
      return String(Math.round(Number(value)));
    case "float":
    case undefined:
      return String(value);
    default:
      return String(value);
  }
}
