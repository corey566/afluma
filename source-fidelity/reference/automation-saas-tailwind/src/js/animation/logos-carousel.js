// data-logos-carousel: enables carousel on the wrapper element
// data-logo-item: marks each logo item that will be animated
// data-count: number of items per render/group (default: all items)
// data-stagger: delay (seconds) between logo animations (default: 0.14)
// data-duration: per-logo animation duration in ms (default: 600)
// data-interval: time between group switches in ms (default: 2500)
// data-initial-delay: delay before first switch in ms (default: 500)
// data-group-class (optional): class name for generated group wrappers (default: wrapper classes)
const injectCarouselStyles = () => {
  if (document.getElementById('logos-carousel-styles')) return;
  const style = document.createElement('style');
  style.id = 'logos-carousel-styles';
  style.textContent = `
    @keyframes logos-enter { from { transform: translateY(40px); filter: blur(4px); opacity: 0; } to { transform: translateY(0); filter: blur(0); opacity: 1; } }
    @keyframes logos-exit { from { transform: translateY(0); filter: blur(0); opacity: 1; } to { transform: translateY(-40px); filter: blur(4px); opacity: 0; } }
  `;
  document.head.appendChild(style);
};

const initLogosCarousel = () => {
  injectCarouselStyles();

  document.querySelectorAll('[data-logos-carousel]').forEach((root) => {
    const items = [...root.querySelectorAll('[data-logo-item]')];
    if (!items.length) return;

    const count = Number.parseInt(root.dataset.count ?? `${items.length}`, 10) || items.length;
    const stagger = Number.parseFloat(root.dataset.stagger ?? '0.14') || 0.14;
    const duration = Number.parseFloat(root.dataset.duration ?? '600') || 600;
    const interval = Number.parseFloat(root.dataset.interval ?? '2500') || 2500;
    const initialDelay = Number.parseFloat(root.dataset.initialDelay ?? '500') || 500;

    const groups = [];
    for (let i = 0; i < items.length; i += count) groups.push(items.slice(i, i + count));
    if (groups.length <= 1) return;

    const groupClass = root.dataset.groupClass || root.className;
    root.innerHTML = '';
    root.style.display = 'grid';
    root.style.placeItems = 'center';

    const groupEls = groups.map((group) => {
      const el = document.createElement('div');
      el.className = groupClass;
      el.style.gridArea = '1 / 1';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      group.forEach((item) => {
        item.style.opacity = '0';
        el.appendChild(item);
      });
      root.appendChild(el);
      return el;
    });

    let currentIndex = 0;
    groupEls[0].style.opacity = '1';
    groupEls[0].style.pointerEvents = 'auto';
    groupEls[0].querySelectorAll('[data-logo-item]').forEach((item) => (item.style.opacity = '1'));

    const run = () => {
      const current = groupEls[currentIndex];
      const nextIndex = (currentIndex + 1) % groupEls.length;
      const next = groupEls[nextIndex];

      next.style.opacity = '1';
      next.style.pointerEvents = 'auto';

      current.querySelectorAll('[data-logo-item]').forEach((item, i) => {
        item.style.animation = `logos-exit ${duration}ms ease ${i * stagger}s both`;
      });
      next.querySelectorAll('[data-logo-item]').forEach((item, i) => {
        item.style.animation = `logos-enter ${duration}ms ease ${i * stagger}s both`;
      });

      const wait =
        duration + (Math.max(current.children.length, next.children.length) - 1) * stagger * 1000;
      globalThis.setTimeout(() => {
        current.style.opacity = '0';
        current.style.pointerEvents = 'none';
      }, wait);

      currentIndex = nextIndex;
    };

    globalThis.setTimeout(() => {
      run();
      globalThis.setInterval(run, interval);
    }, initialDelay);
  });
};

document.addEventListener('DOMContentLoaded', initLogosCarousel);
