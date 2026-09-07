// data-colored-border: enables shine border
// data-shine-color: one or many colors, comma-separated
// data-shine-duration: animation duration in seconds (default: 14)
// data-border-width: border width in px (default: 1)
const initColoredBorder = () => {
  if (typeof gsap === 'undefined') return;

  document.querySelectorAll('[data-colored-border]').forEach((wrapper) => {
    wrapper.classList.add('relative', 'overflow-hidden');

    if (wrapper.querySelector('[data-colored-border-layer]')) return;

    const rawShineColor = wrapper.dataset.shineColor || '#000000';
    const shineColors = rawShineColor
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const duration = Number.parseFloat(wrapper.dataset.shineDuration ?? '14') || 14;
    const borderWidth = Number.parseFloat(wrapper.dataset.borderWidth ?? '1') || 1;
    const gradientColors = (shineColors.length ? shineColors : ['#000000']).join(',');

    const layer = document.createElement('span');
    layer.dataset.coloredBorderLayer = '';
    layer.className = 'pointer-events-none absolute inset-0 size-full rounded-[inherit]';
    layer.style.padding = `${borderWidth}px`;
    layer.style.backgroundImage = `radial-gradient(transparent, transparent, ${gradientColors}, transparent, transparent)`;
    layer.style.backgroundSize = '300% 300%';
    layer.style.willChange = 'background-position';

    const mask = 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)';
    layer.style.setProperty('mask', mask);
    layer.style.setProperty('-webkit-mask', mask);
    layer.style.setProperty('mask-composite', 'exclude');
    layer.style.setProperty('-webkit-mask-composite', 'xor');

    wrapper.prepend(layer);

    gsap.to(layer, {
      backgroundPosition: '100% 100%',
      duration,
      ease: 'none',
      repeat: -1,
      yoyo: true,
    });
  });
};

document.addEventListener('DOMContentLoaded', initColoredBorder);
