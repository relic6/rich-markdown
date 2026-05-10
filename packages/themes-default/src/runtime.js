// Theme-side runtime: shared across ALL themes.
// Per PRINCIPLES P6, themes themselves are pure CSS and cannot include JS.
// This runtime is part of the renderer's standard interactive layer and is
// loaded once regardless of which theme is active. It only handles concerns
// the static markup cannot: carousel autoplay, KaTeX lazy load, tab switching.

export const defaultThemeJs = `
function initRichMarkdownTheme() {
  // Initialize Carousel Autoplay
  document.querySelectorAll('.rmd-carousel[data-autoplay="true"]').forEach(carousel => {
    const track = carousel.querySelector('.rmd-carousel-track');
    const interval = parseInt(carousel.getAttribute('data-interval') || '3000', 10);
    if (!track) return;

    let timer = null;
    let isHovered = false;

    const play = () => {
      timer = setInterval(() => {
        if (isHovered) return;
        const currentScroll = track.scrollLeft;
        const maxScroll = track.scrollWidth - track.clientWidth;

        if (currentScroll >= maxScroll - 1) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
        }
      }, interval);
    };

    carousel.addEventListener('mouseenter', () => isHovered = true);
    carousel.addEventListener('mouseleave', () => isHovered = false);

    play();
  });

  // Initialize Math via KaTeX (Lazy Load)
  const mathBlocks = document.querySelectorAll('.rmd-math code.language-latex');
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
          const content = block.textContent;
          const parent = block.parentElement;
          if (parent && typeof katex !== 'undefined') {
            const span = document.createElement('span');
            katex.render(content, span, { displayMode: true, throwOnError: false });
            parent.replaceWith(span);
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
