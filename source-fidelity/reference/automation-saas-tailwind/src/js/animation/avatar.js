const avatar = {
  init() {
    const avatars = document.querySelectorAll("[data-ns-avatar]");
    avatars.forEach((el) => {
      const delay = el.dataset.avatarDelay
        ? Number.parseFloat(el.dataset.avatarDelay)
        : 0;
      const direction = el.dataset.avatarDirection || "left";
      const scale = el.dataset.avatarScale
        ? Number.parseFloat(el.dataset.avatarScale)
        : 0;
      const offset = el.dataset.avatarOffset
        ? Number.parseFloat(el.dataset.avatarOffset)
        : 0;

      const animationProps = {
        duration: 1.5,
        opacity: 0,
        scale: scale,
        filter: "blur(5px)",
        delay,
        ease: "elastic.out(1, 0.7)",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          end: "bottom 20%",
        },
      };

      // Set animation direction  data-avatar-direction
      switch (direction) {
        case "left":
          animationProps.x = -offset;
          break;
        case "right":
          animationProps.x = offset;
          break;
        case "down":
          animationProps.y = offset;
          break;
        case "up":
        default:
          animationProps.y = -offset;
          break;
      }

      gsap.from(el, animationProps);
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  avatar.init();
});
