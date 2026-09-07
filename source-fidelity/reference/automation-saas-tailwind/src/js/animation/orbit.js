/**
 * Integration “orbit” wheel (rotating logo ring). Distinct from logo-circle static markup.
 * Markup: [data-orbit], [data-orbit-center], optional [data-orbit-layout], data-orbit-speed, data-orbit-size.
 */
const ORBIT_SIZE_DEFAULT = 400;
const ORBIT_SIZE_MIN = 200;
const ORBIT_SIZE_MAX = 1290;
const ORBIT_SPEED_DEFAULT = 1;
const ORBIT_SPEED_MIN = 0.01;
const ORBIT_SPEED_MAX = 20;

const clampOrbitSize = (px) => {
  if (!Number.isFinite(px)) return ORBIT_SIZE_DEFAULT;
  return Math.min(ORBIT_SIZE_MAX, Math.max(ORBIT_SIZE_MIN, Math.round(px)));
};

/** Prefer box size from CSS (`size-[…]` etc.); optional `data-orbit-size` fallback. */
const readOrbitSizePx = (el) => {
  const rect = el.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const fromBox = Math.max(w, h);
  if (fromBox >= ORBIT_SIZE_MIN) return clampOrbitSize(fromBox);

  const raw = Number.parseInt(el.dataset.orbitSize ?? "", 10);
  if (Number.isFinite(raw)) return clampOrbitSize(raw);
  return ORBIT_SIZE_DEFAULT;
};

const clampOrbitSpeed = (value) => {
  if (!Number.isFinite(value)) return ORBIT_SPEED_DEFAULT;
  return Math.min(ORBIT_SPEED_MAX, Math.max(ORBIT_SPEED_MIN, value));
};

const buildTimeline = (center, basketsInWheel, speed) => {
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(center, { rotation: 360, duration: 20, ease: "none" });
  tl.to(basketsInWheel, { rotation: "-=360", duration: 20, ease: "none" }, 0);
  tl.timeScale(speed);
  tl.play();
  return tl;
};

const applyOrbitGeometry = (root, center, sizePx) => {
  const sizeStr = `${sizePx}px`;
  root.style.setProperty("--orbit-size", sizeStr);

  const hub = center.offsetWidth || 20;
  const hubOffset = (sizePx - hub) / 2;
  gsap.set(center, { x: hubOffset, y: hubOffset, rotation: 0 });

  const pivotOriginY = sizePx / 2 + 10;
  const pivots = center.querySelectorAll(".orbit-pivot-outer");
  const count = pivots.length;
  if (count === 0) return null;

  const space = 360 / count;
  pivots.forEach((pivot, i) => {
    const basket = pivot.querySelector(".orbit-basket");
    const pivotHalf = pivot.offsetWidth / 2 || 10;
    gsap.set(pivot, {
      rotation: i * space,
      transformOrigin: `${pivotHalf}px ${pivotOriginY}px`,
    });
    if (basket) {
      gsap.set(basket, {
        rotation: -i * space,
        transformOrigin: "center center",
      });
    }
  });

  return center.querySelectorAll(".orbit-basket");
};

const initOrbitWheel = () => {
  if (typeof gsap === "undefined") return;

  const root = document.querySelector("[data-orbit]");
  if (!root) return;
  const center = root.querySelector("[data-orbit-center]");
  if (!center) return;

  const speed = clampOrbitSpeed(
    Number.parseFloat(root.dataset.orbitSpeed ?? ""),
  );

  let tl = null;
  const killTl = () => {
    if (tl) {
      tl.kill();
      tl = null;
    }
  };

  const runLayout = () => {
    const sizePx = readOrbitSizePx(root);
    killTl();
    const basketsInWheel = applyOrbitGeometry(root, center, sizePx);
    if (!basketsInWheel || basketsInWheel.length === 0) return;
    tl = buildTimeline(center, basketsInWheel, speed);
  };

  const scheduleLayout = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(runLayout);
    });
  };

  gsap.from(root, { autoAlpha: 0, duration: 1 });
  scheduleLayout();

  if (typeof ResizeObserver !== "undefined") {
    let t = 0;
    const ro = new ResizeObserver(() => {
      globalThis.clearTimeout(t);
      t = globalThis.setTimeout(scheduleLayout, 80);
    });
    ro.observe(root);
  }
};

document.addEventListener("DOMContentLoaded", initOrbitWheel);
