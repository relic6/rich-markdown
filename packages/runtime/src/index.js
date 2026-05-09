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

export function setSliderValue(state, name, value, spec) {
  if (!spec) {
    state.sliders[name] = Number(value);
    return state.sliders[name];
  }

  const numeric = Number(value);
  const clamped = Math.min(Math.max(numeric, spec.min), spec.max);
  const stepped = snapToStep(clamped, spec.min, spec.step);
  state.sliders[name] = Number(stepped.toFixed(12));
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
  bindSliders(root, state);
  bindExports(root, state);
  bindTabs(root, state);

  return {
    state,
    destroy() {
      root.replaceWith(root.cloneNode(true));
    }
  };
}

function readStateFromDom(root) {
  const state = { sliders: {}, activeTabs: {} };

  for (const slider of root.querySelectorAll("[data-rmd-block=\"slider\"]")) {
    const name = slider.getAttribute("data-name");
    const input = slider.querySelector("input[type=\"range\"]");
    if (name && input && state.sliders[name] === undefined) {
      state.sliders[name] = Number(input.value);
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
    const input = slider.querySelector("input[type=\"range\"]");
    const output = slider.querySelector("output");
    if (!name || !input) {
      continue;
    }

    const spec = {
      min: Number(input.min),
      max: Number(input.max),
      step: Number(input.step || 1)
    };

    input.addEventListener("input", () => {
      const value = setSliderValue(state, name, input.value, spec);
      if (output) {
        output.textContent = String(value);
      }
      dispatchStateChange(root, state);
    });
  }
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
