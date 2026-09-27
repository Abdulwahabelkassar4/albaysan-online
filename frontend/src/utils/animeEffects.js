import { animate, createTimeline } from "animejs";

/**
 * Trigger staggered bloom reveal for elements (titles, grids, lists)
 */
export const bloomStagger = (targets, options = {}) => {
  if (!targets) return;
  try {
    return animate(targets, {
      opacity: [0, 1],
      translateY: [24, 0],
      scale: [0.94, 1],
      duration: 800,
      ease: "outExpo",
      delay: (el, i) => i * (options.delay || 70),
      ...options,
    });
  } catch (e) {
    console.warn("Anime.js bloomStagger error:", e);
  }
};

/**
 * Flower pulse & bounce for badges and buttons
 */
export const bounceFlower = (target) => {
  if (!target) return;
  try {
    return animate(target, {
      scale: [1, 1.18, 0.95, 1.05, 1],
      rotate: [-4, 4, -2, 2, 0],
      duration: 650,
      ease: "outElastic(1, .5)",
    });
  } catch (e) {
    console.warn("Anime.js bounceFlower error:", e);
  }
};

/**
 * Smooth price / counter roll animation
 */
export const countUp = (element, targetValue, duration = 1200) => {
  if (!element) return;
  const obj = { value: 0 };
  try {
    return animate(obj, {
      value: targetValue,
      duration,
      ease: "outExpo",
      onUpdate: () => {
        element.textContent = Math.round(obj.value);
      },
    });
  } catch (e) {
    if (element) element.textContent = targetValue;
  }
};
