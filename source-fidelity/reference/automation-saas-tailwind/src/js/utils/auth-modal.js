function createAuthModal(root) {
  const overlay = root.querySelector("[data-auth-modal-overlay]");
  const panel = root.querySelector("[data-auth-modal-panel]");
  const backdrop = root.querySelector("[data-auth-modal-backdrop]");
  const items = root.querySelectorAll("[data-auth-modal-item]");
  const closeBtns = root.querySelectorAll("[data-auth-modal-close]");
  const providerBtns = root.querySelectorAll("[data-auth-provider]");
  const emailForm = root.querySelector("[data-auth-email-form]");

  const openBtns = document.querySelectorAll("[data-auth-modal-open]");

  if (!overlay || !panel || openBtns.length === 0) return null;

  if (overlay.parentElement !== document.body) {
    document.body.appendChild(overlay);
  }

  let isOpen = false;

  const finishClose = () => {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (typeof gsap === "undefined") return;

    gsap.killTweensOf([backdrop, panel, ...items]);
    gsap.set(backdrop, { opacity: 0 });
    gsap.set(panel, { opacity: 0, y: 28, scale: 0.94 });
    gsap.set(items, { opacity: 0, y: 16 });

    gsap
      .timeline()
      .to(backdrop, { opacity: 1, duration: 0.22, ease: "power2.out" })
      .to(
        panel,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.32,
          ease: "power3.out",
        },
        "-=0.08",
      )
      .to(
        items,
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          stagger: 0.045,
          ease: "power2.out",
        },
        "-=0.18",
      );
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;

    if (typeof gsap === "undefined") {
      finishClose();
      return;
    }

    gsap.killTweensOf([backdrop, panel, ...items]);
    gsap
      .timeline({ onComplete: finishClose })
      .to(items, {
        opacity: 0,
        y: 8,
        duration: 0.12,
        stagger: 0.02,
        ease: "power1.in",
      })
      .to(
        panel,
        {
          opacity: 0,
          y: 16,
          scale: 0.96,
          duration: 0.18,
          ease: "power2.in",
        },
        "-=0.06",
      )
      .to(backdrop, { opacity: 0, duration: 0.16, ease: "power2.in" }, "-=0.1");
  };

  openBtns.forEach((btn) => btn.addEventListener("click", open));
  closeBtns.forEach((btn) =>
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      close();
    }),
  );
  backdrop?.addEventListener("click", close);
  panel.addEventListener("click", (event) => event.stopPropagation());

  overlay.addEventListener("click", (event) => {
    const closeBtn = event.target.closest("[data-auth-modal-close]");
    if (!closeBtn) return;
    event.preventDefault();
    event.stopPropagation();
    close();
  });

  providerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.dataset.authProvider;
      globalThis.dispatchEvent(
        new CustomEvent("auth:provider", { detail: { provider } }),
      );
    });
  });

  emailForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = emailForm.querySelector('input[type="email"]');
    const email = emailInput?.value?.trim() || "";
    globalThis.dispatchEvent(
      new CustomEvent("auth:email", { detail: { email } }),
    );
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) close();
  });

  return { open, close };
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-auth-modal-root]");
  if (!root) return;
  const modal = createAuthModal(root);
  globalThis.authModalInstances = modal ? [modal] : [];
});
