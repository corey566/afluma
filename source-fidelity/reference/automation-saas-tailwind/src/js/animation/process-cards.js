const initProcessCardsV2 = () => {
  if (typeof gsap === "undefined") return;

  const root = document.querySelector("[data-process-cards]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll("[data-process-card]"));
  if (cards.length < 2) return;

  const timelines = Array.from(
    root.querySelectorAll("[data-process-timeline]"),
  ).map((timeline) => ({
    steps: Array.from(timeline.querySelectorAll("[data-process-step]")),
    lines: Array.from(timeline.querySelectorAll("[data-process-line-fill]")),
  }));

  const STEP_WAIT = 1.2;
  const LINE_DURATION = 1;
  const CARD_DURATION = 1.2;
  const TEXT_DURATION = 1;
  const TEXT_IN_DELAY = 0.35;
  const TEXT_OFFSET = 120;

  let activeIndex = 0;
  let busy = false;
  let lineTl;
  let loopDelay;
  let isPaused = false;

  const isHorizontal = (el) => el.offsetWidth > el.offsetHeight;

  const setActiveStep = (index) => {
    timelines.forEach(({ steps }) => {
      steps.forEach((step, i) => {
        let state = "inactive";
        if (i === index) state = "active";
        else if (i < index) state = "completed";
        step.dataset.item = state;
      });
    });
  };

  const setLineProgress = (index) => {
    timelines.forEach(({ lines }) => {
      lines.forEach((line, i) => {
        if (isHorizontal(line)) gsap.set(line, { scaleX: i < index ? 1 : 0 });
        else gsap.set(line, { scaleY: i < index ? 1 : 0 });
      });
    });
  };

  timelines.forEach(({ lines }) => {
    lines.forEach((line) => {
      if (isHorizontal(line))
        gsap.set(line, { transformOrigin: "left center", scaleX: 0 });
      else gsap.set(line, { transformOrigin: "top center", scaleY: 0 });
    });
  });

  cards.forEach((card, i) => {
    const image = card.querySelector("[data-process-image]");
    const text = card.querySelector("[data-process-content]");
    gsap.set(card, {
      pointerEvents: i === 0 ? "auto" : "none",
      zIndex: i === 0 ? 2 : 0,
    });
    if (image) gsap.set(image, { yPercent: 0 });
    if (text) gsap.set(text, { yPercent: 0 });
  });

  setActiveStep(0);
  setLineProgress(0);

  const schedule = () => {
    if (isPaused) return;
    if (loopDelay) loopDelay.kill();
    loopDelay = gsap.delayedCall(STEP_WAIT, runLoop);
  };

  const slideTo = (nextIndex, reverse = false) => {
    if (busy || nextIndex === activeIndex) return;
    busy = true;

    const current = cards[activeIndex];
    const next = cards[nextIndex];
    const currentImage = current.querySelector("[data-process-image]");
    const currentText = current.querySelector("[data-process-content]");
    const nextImage = next.querySelector("[data-process-image]");
    const nextText = next.querySelector("[data-process-content]");

    const outImage = reverse ? 100 : -100;
    const inImage = reverse ? -100 : 100;
    const outText = reverse ? -TEXT_OFFSET : TEXT_OFFSET;
    const inText = reverse ? TEXT_OFFSET : -TEXT_OFFSET;

    gsap.killTweensOf([
      current,
      next,
      currentImage,
      currentText,
      nextImage,
      nextText,
    ]);

    const tl = gsap.timeline();
    tl.set(next, { pointerEvents: "auto", zIndex: 2 }, 0);
    tl.set(current, { zIndex: 3, backgroundColor: "transparent" }, 0);

    if (nextImage) tl.set(nextImage, { yPercent: inImage }, 0);
    if (nextText) tl.set(nextText, { yPercent: inText }, 0);

    if (currentImage)
      tl.to(
        currentImage,
        { yPercent: outImage, duration: CARD_DURATION, ease: "power2.inOut" },
        0,
      );
    if (nextImage)
      tl.to(
        nextImage,
        { yPercent: 0, duration: CARD_DURATION, ease: "power1.inOut" },
        0,
      );
    if (currentText)
      tl.to(
        currentText,
        { yPercent: outText, duration: TEXT_DURATION, ease: "sine.inOut" },
        0,
      );
    if (nextText)
      tl.to(
        nextText,
        { yPercent: 0, duration: TEXT_DURATION, ease: "sine.out" },
        TEXT_IN_DELAY,
      );

    tl.set(
      current,
      { pointerEvents: "none", zIndex: 0, backgroundColor: "" },
      CARD_DURATION,
    );
    tl.call(
      () => {
        busy = false;
      },
      [],
      CARD_DURATION,
    );

    activeIndex = nextIndex;
    setActiveStep(activeIndex);
    setLineProgress(activeIndex);
  };

  const runLoop = () => {
    if (isPaused) return;
    if (busy) return schedule();

    const nextIndex = (activeIndex + 1) % cards.length;
    const lineIndex = activeIndex % Math.max(cards.length - 1, 1);

    lineTl = gsap.timeline({
      onComplete: () => {
        slideTo(nextIndex);
        schedule();
      },
    });

    timelines.forEach(({ lines }) => {
      const line = lines[lineIndex];
      if (!line) return;
      if (isHorizontal(line))
        lineTl.to(
          line,
          { scaleX: 1, duration: LINE_DURATION, ease: "sine.inOut" },
          0,
        );
      else
        lineTl.to(
          line,
          { scaleY: 1, duration: LINE_DURATION, ease: "sine.inOut" },
          0,
        );
    });
  };

  timelines.forEach(({ steps }) => {
    steps.forEach((step, i) => {
      if (i >= cards.length) return;
      step.addEventListener("click", () => {
        if (i === activeIndex || busy) return;
        if (lineTl) lineTl.kill();
        if (loopDelay) loopDelay.kill();
        slideTo(i, i < activeIndex);
        schedule();
      });
    });
  });

  root.addEventListener("mouseenter", () => {
    isPaused = true;
    lineTl?.pause();
    loopDelay?.pause();
  });

  root.addEventListener("mouseleave", () => {
    isPaused = false;
    if (lineTl?.isActive()) lineTl.resume();
    else {
      if (loopDelay) loopDelay.kill();
      runLoop();
    }
  });

  schedule();
};

document.addEventListener("DOMContentLoaded", initProcessCardsV2);
