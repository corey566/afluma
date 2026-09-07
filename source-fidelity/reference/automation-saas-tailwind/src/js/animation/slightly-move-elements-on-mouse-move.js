const throttled = (delay, fn) => {
  let lastCall = 0;
  return function throttledHandler(...args) {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    return fn(...args);
  };
};

const movableElementsWrapper = document.querySelector(
  "[data-slightly-move-root]",
);
const movableElements = document.querySelectorAll("[data-slightly-move]");

movableElements.forEach((movableElement) => {
  movableElement._moveAxis = {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
  };
});

const mouseMoveHandler = (e) => {
  movableElements.forEach((movableElement) => {
    const shiftValue = Number(movableElement.dataset.shift || 0);
    const { x: axisX, y: axisY } = movableElement._moveAxis || { x: 1, y: 1 };
    const moveX = ((e.clientX * shiftValue) / 150) * axisX;
    const moveY = ((e.clientY * shiftValue) / 150) * axisY;

    gsap.to(movableElement, { x: moveX, y: moveY, duration: 0.6 });
  });
};

if (movableElementsWrapper && typeof gsap !== "undefined") {
  const tHandler = throttled(200, mouseMoveHandler);
  movableElementsWrapper.onmousemove = tHandler;
}
