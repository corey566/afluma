const StickyPromptForm = () => {
  const promptForm = document.querySelector("[data-mini-prompt-form]");

  if (!promptForm) return;

  const promptFormWidth = promptForm.offsetWidth;

  // Set initial state
  gsap.set(promptForm, {
    width: `${promptFormWidth / 2}px`,
  });

  gsap.to(promptForm, {
    y: "0%",
    width: `${promptFormWidth}px`,
    visibility: "visible",
    opacity: 1,
    ease: "power3.out",
    duration: 1.2,
    scrollTrigger: {
      trigger: promptForm,
      start: "top 65%",
      toggleActions: "play none none reverse",
    },
  });
};

document.addEventListener("DOMContentLoaded", () => {
  StickyPromptForm();
});
