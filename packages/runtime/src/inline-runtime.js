export const inlineRuntimeScript = `
(() => {
  const state = { sliders: {}, activeTabs: {} };

  function snapToStep(value, min, step) {
    if (!Number.isFinite(step) || step <= 0) return value;
    return min + Math.round((value - min) / step) * step;
  }

  function setSliderValue(name, value, spec) {
    const numeric = Number(value);
    const clamped = Math.min(Math.max(numeric, spec.min), spec.max);
    const stepped = Number(snapToStep(clamped, spec.min, spec.step).toFixed(12));
    state.sliders[name] = stepped;
    return stepped;
  }

  function formatValue(value, formatter) {
    if (formatter === "int") return String(Math.round(Number(value)));
    return String(value);
  }

  function renderTemplate(template) {
    return String(template).replace(/{{\\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\\s*\\|\\s*([a-zA-Z_][a-zA-Z0-9_]*))?\\s*}}/g, (_match, name, formatter) => {
      if (state.sliders[name] === undefined) return "[未定义:" + name + "]";
      return formatValue(state.sliders[name], formatter);
    });
  }

  function dispatchStateChange(root) {
    root.dispatchEvent(new CustomEvent("rmd:statechange", {
      bubbles: true,
      detail: { state }
    }));
  }

  async function writeClipboard(content) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return false;
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      return false;
    }
  }

  function showManualCopy(block, content) {
    let textarea = block.querySelector("textarea[data-rmd-manual-copy]");
    if (!textarea) {
      textarea = document.createElement("textarea");
      textarea.setAttribute("data-rmd-manual-copy", "true");
      textarea.setAttribute("aria-label", "Manual copy fallback");
      block.append(textarea);
    }
    textarea.value = content;
    textarea.focus();
    textarea.select();
  }

  function bindSliders(root) {
    root.querySelectorAll('[data-rmd-block="slider"]').forEach((slider) => {
      const name = slider.getAttribute("data-name");
      const input = slider.querySelector('input[type="range"]');
      const output = slider.querySelector("output");
      if (!name || !input || state.sliders[name] !== undefined) return;

      const unit = slider.getAttribute("data-unit") || "";
      const spec = {
        min: Number(input.min),
        max: Number(input.max),
        step: Number(input.step || 1)
      };
      state.sliders[name] = Number(input.value);

      input.addEventListener("input", () => {
        const value = setSliderValue(name, input.value, spec);
        if (output) output.textContent = unit ? String(value) + " " + unit : String(value);
        dispatchStateChange(root);
      });
    });
  }

  function bindExports(root) {
    root.querySelectorAll('[data-rmd-block="export"]').forEach((block) => {
      const button = block.querySelector("button");
      const code = block.querySelector("pre code");
      if (!button || !code) return;

      button.addEventListener("click", async () => {
        const content = renderTemplate(code.textContent || "");
        const ok = await writeClipboard(content);
        block.setAttribute("data-rmd-copied", ok ? "true" : "false");
        if (!ok) showManualCopy(block, content);
      });
    });
  }

  function bindTabs(root) {
    root.querySelectorAll('[data-rmd-block="tabs"]').forEach((tabs) => {
      const key = tabs.getAttribute("data-rmd-id") || tabs.getAttribute("data-default") || "tabs";
      state.activeTabs[key] = tabs.getAttribute("data-default") || "";

      tabs.querySelectorAll('[role="tab"]').forEach((button) => {
        button.addEventListener("click", () => {
          const label = button.getAttribute("data-label");
          if (!label) return;
          state.activeTabs[key] = label;

          tabs.querySelectorAll('[role="tab"]').forEach((candidate) => {
            candidate.setAttribute("aria-selected", String(candidate.getAttribute("data-label") === label));
          });
          tabs.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
            panel.hidden = panel.getAttribute("data-label") !== label;
          });
          dispatchStateChange(root);
        });
      });
    });
  }

  function init() {
    const root = document.querySelector(".rmd-document") || document.body;
    bindSliders(root);
    bindExports(root);
    bindTabs(root);
    window.RMD_STATE = state;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
`.trim();
