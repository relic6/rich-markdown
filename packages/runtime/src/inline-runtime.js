export const inlineRuntimeScript = `
(() => {
  const state = { sliders: {}, activeTabs: {} };

  function snapToStep(value, min, step) {
    if (!Number.isFinite(step) || step <= 0) return value;
    return min + Math.round((value - min) / step) * step;
  }

	  function setSliderValue(name, value, spec, bound) {
	    const numeric = Number(value);
	    const clamped = Math.min(Math.max(numeric, spec.min), spec.max);
	    const stepped = Number(snapToStep(clamped, spec.min, spec.step).toFixed(12));
	    if (spec.range) {
	      const previous = Array.isArray(state.sliders[name]) ? state.sliders[name] : [spec.min, spec.max];
	      let next = bound === "max" ? [previous[0], stepped] : [stepped, previous[1]];
	      if (next[0] > next[1]) {
	        next = bound === "max" ? [stepped, stepped] : [next[1], next[1]];
	      }
	      state.sliders[name] = next;
	      return next;
	    }
	    state.sliders[name] = stepped;
	    return stepped;
	  }

	  function formatValue(value, formatter) {
	    if (Array.isArray(value)) return value.map((item) => formatValue(item, formatter)).join(" - ");
	    if (formatter === "int") return String(Math.round(Number(value)));
	    return String(value);
	  }

	  function formatSliderOutput(value, unit) {
	    const text = Array.isArray(value) ? value.join(" - ") : String(value);
	    return unit ? text + " " + unit : text;
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
	      const inputs = Array.from(slider.querySelectorAll('input[type="range"]'));
	      const output = slider.querySelector("output");
	      if (!name || inputs.length === 0 || state.sliders[name] !== undefined) return;

	      const unit = slider.getAttribute("data-unit") || "";
	      const isRange = slider.getAttribute("data-range") === "true";
	      const firstInput = inputs[0];
	      const spec = {
	        min: Number(firstInput.min),
	        max: Number(firstInput.max),
	        step: Number(firstInput.step || 1),
	        range: isRange
	      };
	      state.sliders[name] = isRange ? inputs.map((input) => Number(input.value)) : Number(firstInput.value);

	      inputs.forEach((input) => {
	        input.addEventListener("input", () => {
	          const value = setSliderValue(name, input.value, spec, input.getAttribute("data-bound"));
	          if (isRange) {
	            inputs[0].value = String(value[0]);
	            inputs[1].value = String(value[1]);
	            updateRangeTrack(slider, value, spec);
	          }
	          if (output) output.textContent = formatSliderOutput(value, unit);
	          dispatchStateChange(root);
	        });
	      });
	    });
	  }

	  function updateRangeTrack(slider, value, spec) {
	    const control = slider.querySelector(".rmd-slider-range-control");
	    if (!control || !Array.isArray(value) || spec.max === spec.min) return;
	    control.style.setProperty("--rmd-range-start", String(Math.round(((value[0] - spec.min) / (spec.max - spec.min)) * 10000) / 100) + "%");
	    control.style.setProperty("--rmd-range-end", String(Math.round(((value[1] - spec.min) / (spec.max - spec.min)) * 10000) / 100) + "%");
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

  function bindCarousels(root) {
    root.querySelectorAll('[data-rmd-block="carousel"]').forEach((carousel) => {
      const track = carousel.querySelector(".rmd-carousel-track");
      if (!track) return;

      const items = Array.from(track.children || []);
      if (items.length <= 1) return;

      const prev = carousel.querySelector('[data-rmd-carousel="prev"]');
      const next = carousel.querySelector('[data-rmd-carousel="next"]');
      const dots = Array.from(carousel.querySelectorAll(".rmd-carousel-dot"));
      const interval = Number(carousel.getAttribute("data-interval") || 3000);
      let activeIndex = 0;
      let paused = false;

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
        if (!track.clientWidth) return;
        activeIndex = normalizeIndex(Math.round(track.scrollLeft / track.clientWidth));
        updateDots();
      };

      if (prev) prev.addEventListener("click", () => goTo(activeIndex - 1));
      if (next) next.addEventListener("click", () => goTo(activeIndex + 1));
      dots.forEach((dot, index) => dot.addEventListener("click", () => goTo(index)));
      track.addEventListener("scroll", syncFromScroll);
      carousel.addEventListener("pointerenter", () => { paused = true; });
      carousel.addEventListener("pointerleave", () => { paused = false; });
      carousel.addEventListener("focusin", () => { paused = true; });
      carousel.addEventListener("focusout", () => { paused = false; });

      updateDots();

      if (carousel.getAttribute("data-autoplay") === "true" && Number.isFinite(interval) && interval > 0) {
        window.setInterval(() => {
          if (!paused) goTo(activeIndex + 1);
        }, interval);
      }
    });
  }

  function enhanceMath(root) {
    const blocks = Array.from(root.querySelectorAll(".rmd-math-display[data-latex]"))
      .filter((block) => block.getAttribute("data-rendered") !== "katex");
    if (blocks.length === 0) return;

    const render = () => {
      if (!window.katex) return;
      blocks.forEach((block) => {
        const latex = block.getAttribute("data-latex") || block.textContent || "";
        try {
          window.katex.render(latex, block, { displayMode: true, throwOnError: false });
          block.setAttribute("data-rendered", "katex");
        } catch {
          // Keep the static formula-style fallback visible when KaTeX rejects input.
        }
      });
    };

    if (window.katex) {
      render();
      return;
    }

    if (!document.querySelector('link[data-rmd-katex-style]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      link.setAttribute("data-rmd-katex-style", "true");
      document.head.append(link);
    }

    const existingScript = document.querySelector('script[data-rmd-katex-script]');
    if (existingScript) {
      existingScript.addEventListener("load", render, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
    script.async = true;
    script.setAttribute("data-rmd-katex-script", "true");
    script.addEventListener("load", render, { once: true });
    document.head.append(script);
  }

  function init() {
    const root = document.querySelector(".rmd-document") || document.body;
    bindSliders(root);
    bindExports(root);
    bindTabs(root);
    bindCarousels(root);
    enhanceMath(root);
    window.RMD_STATE = state;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
`.trim();
