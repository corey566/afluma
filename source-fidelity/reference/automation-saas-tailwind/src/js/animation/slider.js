document.addEventListener("DOMContentLoaded", () => {
  const roots = Array.from(document.querySelectorAll("[data-slider]"));
  if (!roots.length || typeof Swiper === "undefined") return;

  roots.forEach((root) => {
    const sliderTrack = root.querySelector("[data-slider-track]");
    const nextButtons = root.querySelectorAll("[data-slider-next]");
    const prevButtons = root.querySelectorAll("[data-slider-prev]");
    const currentEls = root.querySelectorAll("[data-slider-current]");
    if (!sliderTrack) return;

    const formatNumber = (index) => String(index + 1);

    const setCurrentLabels = (index) => {
      const text = formatNumber(index);
      currentEls.forEach((el) => {
        el.textContent = text;
      });
    };

    const prepareSlide = (slide) => {
      const image = slide.querySelector("[data-slice-image]");
      const tiles = Array.from(slide.querySelectorAll("[data-slice-tile]"));
      if (!image || !tiles.length) return;

      image.style.opacity = "0";

      const total = tiles.length;
      tiles.forEach((tile, i) => {
        tile.style.backgroundImage = `url("${image.getAttribute("src")}")`;
        tile.style.backgroundRepeat = "no-repeat";
        tile.style.backgroundSize = `${total * 100}% 100%`;
        tile.style.backgroundPosition = `${(i / (total - 1)) * 100}% 50%`;
        tile.style.opacity = "0";
        tile.style.transform = "translate3d(26px, 0, 0)";
        tile.style.willChange = "transform, opacity";
        tile.style.backfaceVisibility = "hidden";
      });
    };

    const showSlideVisual = (slide, instant = false) => {
      if (!slide) return;
      prepareSlide(slide);

      const tiles = Array.from(slide.querySelectorAll("[data-slice-tile]"));
      const content = slide.querySelector("[data-slide-content]");

      tiles.forEach((tile, i) => {
        const delay = instant ? 0 : (tiles.length - 1 - i) * 0.08;
        tile.style.transition = "none";
        tile.style.opacity = "0";
        tile.style.transform = "translate3d(26px, 0, 0)";
        tile.getBoundingClientRect();
        requestAnimationFrame(() => {
          tile.style.transition =
            `transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, ` +
            `opacity 0.6s ease ${delay}s`;
          tile.style.opacity = "1";
          tile.style.transform = "translate3d(0, 0, 0)";
        });
      });

      if (content) {
        content.style.transition = "none";
        content.style.opacity = instant ? "1" : "0";
        content.style.transform = instant
          ? "translate3d(0, 0, 0)"
          : "translate3d(16px, 0, 0)";
        content.getBoundingClientRect();
        requestAnimationFrame(() => {
          content.style.transition =
            "opacity 0.55s ease 0.15s, transform 0.55s ease 0.15s";
          content.style.opacity = "1";
          content.style.transform = "translate3d(0, 0, 0)";
        });
      }
    };

    const swiper = new Swiper(sliderTrack, {
      slidesPerView: 1,
      speed: 650,
      direction: "horizontal",
      loop: true,
      autoplay: { delay: 4800, disableOnInteraction: false },
      observer: true,
      observeParents: true,
      on: {
        init(sw) {
          sw.slides.forEach((slide) => prepareSlide(slide));
          showSlideVisual(sw.slides[sw.activeIndex], true);
          setCurrentLabels(sw.realIndex);
          sw.update();
          requestAnimationFrame(() => sw.update());
        },
        slideChangeTransitionStart(sw) {
          showSlideVisual(sw.slides[sw.activeIndex]);
          setCurrentLabels(sw.realIndex);
        },
      },
    });

    function onNextClick(e) {
      if (!swiper || swiper.destroyed) return;
      e.preventDefault();
      e.stopPropagation();
      swiper.slideNext();
      if (swiper.autoplay) swiper.autoplay.start();
    }

    function onPrevClick(e) {
      if (!swiper || swiper.destroyed) return;
      e.preventDefault();
      e.stopPropagation();
      swiper.slidePrev();
      if (swiper.autoplay) swiper.autoplay.start();
    }

    nextButtons.forEach((btn) => btn.addEventListener("click", onNextClick, true));
    prevButtons.forEach((btn) => btn.addEventListener("click", onPrevClick, true));

    root.addEventListener("mouseenter", () => {
      if (swiper.autoplay) swiper.autoplay.pause();
    });
    root.addEventListener("mouseleave", () => {
      if (swiper.autoplay) swiper.autoplay.resume();
    });
  });
});
