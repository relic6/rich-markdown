// Theme-side runtime: shared across ALL themes.
// Per PRINCIPLES P6, themes themselves are pure CSS and cannot include JS.
// This runtime is part of the renderer's standard interactive layer and is
// loaded once regardless of which theme is active. It only handles concerns
// the static markup cannot: carousel autoplay, KaTeX lazy load, tab switching.

export const defaultThemeJs = `
function initRichMarkdownTheme() {
  // Initialize Carousel Autoplay
  document.querySelectorAll('.rmd-carousel').forEach(carousel => {
    const track = carousel.querySelector('.rmd-carousel-track');
    const interval = parseInt(carousel.getAttribute('data-interval') || '3000', 10);
    if (!track) return;

    const items = Array.from(track.children || []);
    if (items.length <= 1) return;

    const prev = carousel.querySelector('[data-rmd-carousel="prev"]');
    const next = carousel.querySelector('[data-rmd-carousel="next"]');
    const dots = Array.from(carousel.querySelectorAll('.rmd-carousel-dot'));
    let activeIndex = 0;
    let isHovered = false;

    const normalizeIndex = (index) => (index + items.length) % items.length;
    const updateDots = () => {
      carousel.setAttribute('data-active-index', String(activeIndex));
      dots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    };
    const goTo = (index, behavior = 'smooth') => {
      activeIndex = normalizeIndex(index);
      track.scrollTo({ left: activeIndex * track.clientWidth, behavior });
      updateDots();
    };
    const syncFromScroll = () => {
      if (!track.clientWidth) return;
      activeIndex = normalizeIndex(Math.round(track.scrollLeft / track.clientWidth));
      updateDots();
    };

    prev && prev.addEventListener('click', () => goTo(activeIndex - 1));
    next && next.addEventListener('click', () => goTo(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
    track.addEventListener('scroll', syncFromScroll);
    carousel.addEventListener('mouseenter', () => isHovered = true);
    carousel.addEventListener('mouseleave', () => isHovered = false);

    updateDots();
    if (carousel.getAttribute('data-autoplay') === 'true') {
      setInterval(() => {
        if (!isHovered) goTo(activeIndex + 1);
      }, interval);
    }
  });

  // Initialize Math via KaTeX (Lazy Load)
  const mathBlocks = document.querySelectorAll('.rmd-math-display[data-latex], .rmd-math code.language-latex');
  if (mathBlocks.length > 0) {
    const loadScript = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    const loadStyle = (href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    loadStyle('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');
    loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js').then(() => {
      mathBlocks.forEach(block => {
        try {
          const content = block.getAttribute('data-latex') || block.textContent;
          if (typeof katex === 'undefined') return;

          if (block.classList && block.classList.contains('rmd-math-display')) {
            katex.render(content, block, { displayMode: true, throwOnError: false });
            block.setAttribute('data-rendered', 'katex');
          } else {
            const parent = block.parentElement;
            if (parent) {
              const span = document.createElement('span');
              span.className = 'rmd-math-display';
              span.setAttribute('role', 'math');
              span.setAttribute('data-rendered', 'katex');
              katex.render(content, span, { displayMode: true, throwOnError: false });
              parent.replaceWith(span);
            }
          }
        } catch(e) {
          console.error("KaTeX Error:", e);
        }
      });
    }).catch(e => console.warn("Failed to load KaTeX", e));
  }

  // Initialize Tabs
  document.querySelectorAll('.rmd-tabs').forEach(tabs => {
    const buttons = tabs.querySelectorAll('[role="tab"]');
    const panels = tabs.querySelectorAll('[role="tabpanel"]');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const targetLabel = button.getAttribute('data-label');

        buttons.forEach(btn => {
          btn.setAttribute('aria-selected', btn === button ? 'true' : 'false');
        });

        panels.forEach(panel => {
          if (panel.getAttribute('data-label') === targetLabel) {
            panel.removeAttribute('hidden');
          } else {
            panel.setAttribute('hidden', '');
          }
        });
      });
    });
  });
}

if (typeof document !== 'undefined' && document.readyState !== 'loading') {
  initRichMarkdownTheme();
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initRichMarkdownTheme);
}
`;
