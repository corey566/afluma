/* =========================
Typewriter Animation
=========================== */

const typewriterAnimation = {
  init() {
    if (typeof gsap === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const container = document.querySelectorAll('[data-typewriter]');

    if (container.length === 0) return;

    container.forEach((container) => {
      const typewriterElement = container.querySelector('[data-typewriter-text]');

      if (!typewriterElement || !container) {
        return;
      }

      // Get duration from data-duration attribute (default: 3 seconds)
      const duration = Number.parseFloat(container.dataset.duration) || 3;

      // Check if element is an input or textarea with placeholder
      const isFormElementWithPlaceholder =
        (typewriterElement.tagName === 'INPUT' || typewriterElement.tagName === 'TEXTAREA') &&
        typewriterElement.placeholder;

      if (isFormElementWithPlaceholder) {
        // Animate placeholder text
        this.animatePlaceholder(typewriterElement, container, duration);
      } else if (typeof SplitText !== 'undefined') {
        // Animate text content (original behavior)
        this.animateTextContent(typewriterElement, container, duration);
      }
    });
  },

  animatePlaceholder(formElement, container, duration = 3) {
    const originalPlaceholder = formElement.placeholder;
    const placeholderText = originalPlaceholder;

    // Clear placeholder initially
    formElement.placeholder = '';

    // Create timeline with scroll trigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        once: true,
      },
    });

    // Animate placeholder character by character
    const typingDuration = duration;
    const charDelay = typingDuration / placeholderText.length;

    placeholderText.split('').forEach((char, index) => {
      tl.call(
        () => {
          formElement.placeholder += char;
        },
        null,
        index * charDelay
      );
    });
  },

  animateTextContent(typewriterElement, container, duration = 3) {
    // Split text into characters
    const split = new SplitText(typewriterElement, {
      type: 'chars',
      tag: 'span',
    });

    // Hide all characters initially
    gsap.set(split.chars, { opacity: 0 });

    // Create timeline with scroll trigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        once: true,
      },
    });

    // Animate characters one by one
    const typingDuration = duration;
    const charDelay = typingDuration / split.chars.length;

    split.chars.forEach((char, index) => {
      tl.to(char, { opacity: 1, duration: 0.01 }, index * charDelay);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  typewriterAnimation.init();
});
