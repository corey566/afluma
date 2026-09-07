const initPricingAnimation = () => {
  if (typeof gsap === "undefined") return;

  const pricingRoots = document.querySelectorAll("[data-pricing]");
  if (!pricingRoots.length) return;

  const planData = {
    starter: { monthly: 2500, yearly: 25000, activeCount: 5 },
    pro: { monthly: 4190, yearly: 41900, activeCount: 7 },
    business: { monthly: 8290, yearly: 82900, activeCount: 9 },
  };

  pricingRoots.forEach((root) => {
    const tabs = Array.from(root.querySelectorAll("[data-pricing-tab]"));
    const badgeWrap = root.querySelector("[data-pricing-badge-wrap]");
    const badges = Array.from(root.querySelectorAll("[data-pricing-badge]"));
    const descWrap = root.querySelector("[data-pricing-desc-wrap]");
    const descs = Array.from(root.querySelectorAll("[data-pricing-desc]"));
    const priceFlow = root.querySelector("[data-pricing-price]");
    const periodEl = root.querySelector("[data-pricing-period]");
    const items = Array.from(root.querySelectorAll("[data-pricing-item]"));
    const billingToggle = document.querySelector(
      "[data-pricing-billing-toggle]",
    );

    const syncTabsActive = (selected) => {
      tabs.forEach((tab) => {
        tab.dataset.active =
          tab.dataset.pricingTab === selected ? "true" : "false";
      });
    };

    const syncItemsActive = (selected) => {
      const activeCount = Math.max(
        0,
        Number(planData[selected]?.activeCount ?? 0),
      );
      items.forEach((li, idx) => {
        li.dataset.active = idx < activeCount ? "true" : "false";
      });
    };

    const setPrice = (selected, durationMs) => {
      const plan = planData[selected];
      const key = billingToggle?.checked ? "yearly" : "monthly";
      const value = plan?.[key] ?? 0;

      if (!priceFlow) return;

      if (typeof priceFlow.update === "function") {
        priceFlow.trend = 0;
        priceFlow.format = {
          useGrouping: true,
          minimumIntegerDigits: 2,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        };
        priceFlow.transformTiming = {
          duration: durationMs,
          easing: "ease-out",
        };
        priceFlow.spinTiming = { duration: durationMs, easing: "ease-out" };
        priceFlow.opacityTiming = {
          duration: Math.max(250, durationMs * 0.45),
          easing: "ease-out",
        };
        priceFlow.update(value);
        return;
      }

      priceFlow.textContent = String(value);
    };

    const setPeriodLabel = () => {
      if (!periodEl) return;
      periodEl.textContent = billingToggle?.checked ? "/year" : "/month";
    };

    const measureAndLockBadgeSize = () => {
      if (!badgeWrap || !badges.length) return;

      const prevStyles = badges.map((el) => ({
        el,
        pos: el.style.position,
        opacity: el.style.opacity,
        transform: el.style.transform,
        display: el.style.display,
      }));

      badges.forEach((el) => {
        el.style.position = "static";
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.display = "inline-flex";
      });

      const widths = badges.map((el) => el.offsetWidth);
      const heights = badges.map((el) => el.offsetHeight);
      const maxW = Math.max(...widths, 0);
      const maxH = Math.max(...heights, 0);

      if (maxW) badgeWrap.style.width = `${maxW}px`;
      if (maxH) badgeWrap.style.height = `${maxH}px`;

      prevStyles.forEach(({ el, pos, opacity, transform, display }) => {
        el.style.position = pos;
        el.style.opacity = opacity;
        el.style.transform = transform;
        el.style.display = display;
      });
    };

    const getBadgeEl = (plan) =>
      badges.find((b) => b.dataset.pricingBadge === plan) || null;
    const getDescEl = (plan) =>
      descs.find((d) => d.dataset.pricingDesc === plan) || null;

    const measureAndLockDescSize = () => {
      if (!descWrap || !descs.length) return;

      const prevStyles = descs.map((el) => ({
        el,
        pos: el.style.position,
        opacity: el.style.opacity,
        transform: el.style.transform,
        display: el.style.display,
      }));

      descs.forEach((el) => {
        el.style.position = "static";
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.display = "block";
      });

      const heights = descs.map((el) => el.offsetHeight);
      const maxH = Math.max(...heights, 0);
      if (maxH) descWrap.style.minHeight = `${maxH}px`;

      prevStyles.forEach(({ el, pos, opacity, transform, display }) => {
        el.style.position = pos;
        el.style.opacity = opacity;
        el.style.transform = transform;
        el.style.display = display;
      });
    };

    const setSelected = (next) => {
      const current = root.dataset.selected || "starter";
      if (next === current) return;

      const fromBadge = getBadgeEl(current);
      const toBadge = getBadgeEl(next);
      const fromDesc = getDescEl(current);
      const toDesc = getDescEl(next);

      root.dataset.selected = next;
      syncTabsActive(next);

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      if (fromBadge && toBadge) {
        tl.set(toBadge, { y: 12, opacity: 0 }, 0);
        tl.to(fromBadge, { y: -12, opacity: 0, duration: 0.22 }, 0);
        tl.to(toBadge, { y: 0, opacity: 1, duration: 0.28 }, 0.12);
        tl.set(fromBadge, { y: 0 }, 0.3);
      }

      if (fromDesc && toDesc) {
        tl.set(toDesc, { y: 12, opacity: 0 }, 0);
        tl.to(fromDesc, { y: -12, opacity: 0, duration: 0.22 }, 0);
        tl.to(toDesc, { y: 0, opacity: 1, duration: 0.28 }, 0.12);
        tl.set(fromDesc, { y: 0 }, 0.3);
      }

      tl.add(() => syncItemsActive(next), 0);
      tl.add(() => setPrice(next, 700), 0);
    };

    // initial
    const initial = root.dataset.selected || "starter";
    syncTabsActive(initial);
    syncItemsActive(initial);
    setPeriodLabel();
    setPrice(initial, 0);
    measureAndLockBadgeSize();
    measureAndLockDescSize();

    if (billingToggle) {
      billingToggle.addEventListener("change", () => {
        setPeriodLabel();
        setPrice(root.dataset.selected || "starter", 700);
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setSelected(tab.dataset.pricingTab));
      tab.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelected(tab.dataset.pricingTab);
        }
      });
    });
  });
};

document.addEventListener("DOMContentLoaded", initPricingAnimation);
