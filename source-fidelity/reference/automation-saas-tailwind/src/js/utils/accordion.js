function canSplit() {
  return typeof gsap !== 'undefined' && typeof SplitText !== 'undefined';
}

function revertSplit(accordionContent) {
  accordionContent.querySelectorAll('.accordion-content-text').forEach((el) => {
    if (el._split) {
      try {
        el._split.revert();
      } catch {}
      el._split = null;
    }
    if (canSplit()) gsap.set(el, { clearProps: 'all' });
  });
}

function animateSplitIn(accordionContent) {
  if (!canSplit()) return;

  accordionContent.querySelectorAll('.accordion-content-text').forEach((el, i) => {
    if (!el.textContent.trim()) return;

    if (el._split) el._split.revert();
    gsap.killTweensOf(el);

    el._split = new SplitText(el, { type: 'lines' });

    gsap.set(el._split.lines, {
      opacity: 0,
      y: 24,
      rotationX: -90,
    });

    gsap.to(el._split.lines, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.08,
      delay: i * 0.05,
    });
  });
}

function animateSplitOut(accordionContent) {
  if (!canSplit()) return;

  accordionContent.querySelectorAll('.accordion-content-text').forEach((el, i) => {
    if (!el.textContent.trim()) return;

    if (!el._split) el._split = new SplitText(el, { type: 'lines' });

    gsap.to(el._split.lines, {
      opacity: 0,
      y: -16,
      rotationX: 90,
      duration: 0.35,
      ease: 'power2.in',
      stagger: 0.03,
      delay: i * 0.02,
    });
  });
}

function forceReflow(el) {
  return el.offsetHeight;
}

function syncIconState(btn, state) {
  const icon = btn.querySelector('.accordion-icon');
  if (icon) icon.dataset.state = state;
}

function setExpandedState(item, btn, accordionContent, state) {
  const isOpen = state === 'open';
  item.dataset.state = state;
  btn.dataset.state = state;
  syncIconState(btn, state);
  btn.setAttribute('aria-expanded', String(isOpen));
  accordionContent.setAttribute('aria-hidden', String(!isOpen));
}

function openItem(item, btn, accordionContent, animate) {
  setExpandedState(item, btn, accordionContent, 'open');

  if (!animate) {
    accordionContent.style.height = 'auto';
    accordionContent.style.opacity = '1';
    animateSplitIn(accordionContent);
    return;
  }

  revertSplit(accordionContent);

  accordionContent.style.height = '0px';
  accordionContent.style.opacity = '0';
  forceReflow(accordionContent);
  const target = accordionContent.scrollHeight;

  animateSplitIn(accordionContent);

  requestAnimationFrame(() => {
    accordionContent.style.height = `${target}px`;
    accordionContent.style.opacity = '1';
  });

  accordionContent.addEventListener(
    'transitionend',
    (e) => {
      if (e.propertyName === 'height') {
        accordionContent.style.height = 'auto';
      }
    },
    { once: true }
  );
}

function closeItem(item, btn, accordionContent, animate) {
  setExpandedState(item, btn, accordionContent, 'closed');

  if (!animate) {
    accordionContent.style.height = '0px';
    accordionContent.style.opacity = '0';
    revertSplit(accordionContent);
    return;
  }

  animateSplitOut(accordionContent);

  const current = accordionContent.scrollHeight;
  accordionContent.style.height = `${current}px`;
  accordionContent.style.opacity = '1';
  forceReflow(accordionContent);
  setTimeout(() => {
    requestAnimationFrame(() => {
      accordionContent.style.height = '0px';
      accordionContent.style.opacity = '0';
    });
  }, 80);

  accordionContent.addEventListener(
    'transitionend',
    (e) => {
      if (e.propertyName === 'height') {
        revertSplit(accordionContent);
      }
    },
    { once: true }
  );
}

function getAccordionParts(item) {
  return {
    btn: item.querySelector('.accordion-action'),
    accordionContent: item.querySelector('.accordion-content'),
  };
}

function setupItemA11y(accordionAction, accordionContent, qId, aId) {
  accordionAction.id ||= qId;
  accordionContent.id ||= aId;
  accordionAction.setAttribute('aria-controls', accordionContent.id);
  accordionContent.setAttribute('role', 'region');
  accordionContent.setAttribute('aria-labelledby', accordionAction.id);
}

function setupContentAnimationStyle(accordionContent) {
  accordionContent.style.overflow = 'hidden';
  accordionContent.style.transition = 'height 300ms ease-in-out, opacity 300ms ease-in-out';
}

function initializeItem(item, accIndex, itemIndex) {
  const { btn: accordionAction, accordionContent } = getAccordionParts(item);
  if (!accordionAction || !accordionContent) return;

  const qId = `acc-q-${accIndex}-${itemIndex}`;
  const aId = `acc-a-${accIndex}-${itemIndex}`;
  setupItemA11y(accordionAction, accordionContent, qId, aId);
  setupContentAnimationStyle(accordionContent);

  const shouldOpen = item.dataset.defaultOpen === 'true';
  if (shouldOpen) openItem(item, accordionAction, accordionContent, false);
  else closeItem(item, accordionAction, accordionContent, false);
}

function enforceSingleDefaultOpen(items) {
  const openDefaults = items.filter((it) => it.dataset.defaultOpen === 'true');
  openDefaults.slice(1).forEach((it) => {
    const { btn, accordionContent } = getAccordionParts(it);
    if (btn && accordionContent) closeItem(it, btn, accordionContent, false);
    delete it.dataset.defaultOpen;
  });
}

function closeOtherItems(items, activeItem) {
  items.forEach((it) => {
    if (it === activeItem || it.dataset.state !== 'open') return;
    const { btn: siblingBtn, accordionContent: siblingContent } = getAccordionParts(it);
    if (siblingBtn && siblingContent) closeItem(it, siblingBtn, siblingContent, true);
  });
}

function handleAccordionClick(e, accordion, items, allowMultiple) {
  const btn = e.target.closest('.accordion-action');
  if (!btn || !accordion.contains(btn)) return;

  e.preventDefault();

  const item = btn.closest('.accordion-item');
  if (!item) return;

  const accordionContent = item.querySelector('.accordion-content');
  if (!accordionContent) return;

  const isOpen = item.dataset.state === 'open';
  if (isOpen) {
    closeItem(item, btn, accordionContent, true);
    return;
  }

  if (!allowMultiple) closeOtherItems(items, item);
  openItem(item, btn, accordionContent, true);
}

function handleAccordionKeydown(e) {
  const btn = e.target.closest('.accordion-action');
  if (!btn) return;
  if (e.key !== 'Enter' && e.key !== ' ') return;

  e.preventDefault();
  btn.click();
}

function initAccordions({ selector = '.accordion', allowMultiple = false, keyboard = true } = {}) {
  const accordions = document.querySelectorAll(selector);

  accordions.forEach((accordion, accIndex) => {
    const items = Array.from(accordion.querySelectorAll('.accordion-item'));

    if (!accordion.getAttribute('aria-label')) {
      accordion.setAttribute('aria-label', 'Accordion');
    }

    items.forEach((item, i) => initializeItem(item, accIndex, i));
    if (!allowMultiple) enforceSingleDefaultOpen(items);

    accordion.addEventListener('click', (e) =>
      handleAccordionClick(e, accordion, items, allowMultiple)
    );
    if (keyboard) accordion.addEventListener('keydown', handleAccordionKeydown);
  });
}

// usage
document.addEventListener('DOMContentLoaded', () => {
  initAccordions({
    allowMultiple: false,
    keyboard: true,
  });
});
