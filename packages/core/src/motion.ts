/**
 * The entrances every component draws from. One name, one feel, on both kits:
 *
 *   React         `enter("pop")` → a CSS animation over the `af-in-*` keyframes in `kitCss`
 *   React Native  `<Enter motion="pop">` → Animated.timing over the same offsets, on the native driver
 *
 * Reduced motion turns every one of them into a plain appearance.
 */

export type EnterMotion = "fade" | "rise" | "drop" | "pop" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "grow-x";

export interface Motion {
  label: string;
  /** Where it starts, in words. */
  from: string;
  duration: number;
  easing: string;
  /** How the React Native kit writes it. */
  native: string;
}

export const MOTION: Record<EnterMotion, Motion> = {
  fade: { label: "Fade", from: "opacity 0", duration: 220, easing: "cubic-bezier(.16,1,.3,1)", native: "Animated.timing: opacity 0 → 1, 220ms" },
  rise: { label: "Rise", from: "8px lower, opacity 0", duration: 320, easing: "cubic-bezier(.16,1,.3,1)", native: "Animated.timing: translateY 8 → 0, opacity 0 → 1, 320ms" },
  drop: { label: "Drop", from: "14px higher, opacity 0", duration: 360, easing: "cubic-bezier(.16,1,.3,1)", native: "Animated.timing: translateY -14 → 0, opacity 0 → 1, 360ms" },
  pop: { label: "Pop", from: "scale .94, opacity 0", duration: 220, easing: "cubic-bezier(.16,1,.3,1)", native: "Animated.timing: scale .94 → 1, opacity 0 → 1, 220ms" },
  "slide-up": { label: "Slide up", from: "100% below", duration: 420, easing: "cubic-bezier(.32,.72,0,1)", native: "Animated.timing: translateY window height → 0, 420ms" },
  "slide-down": { label: "Slide down", from: "100% above, opacity 0", duration: 360, easing: "cubic-bezier(.16,1,.3,1)", native: "Animated.timing: translateY −½ window → 0, opacity 0 → 1, 360ms" },
  "slide-left": { label: "Slide left", from: "24px right, opacity 0", duration: 300, easing: "cubic-bezier(.16,1,.3,1)", native: "Animated.timing: translateX 24 → 0, opacity 0 → 1, 300ms" },
  "slide-right": { label: "Slide right", from: "24px left, opacity 0", duration: 300, easing: "cubic-bezier(.16,1,.3,1)", native: "Animated.timing: translateX -24 → 0, opacity 0 → 1, 300ms" },
  "grow-x": { label: "Grow", from: "scaleX .4, opacity 0", duration: 280, easing: "cubic-bezier(.16,1,.3,1)", native: "Animated.timing: scaleX .4 → 1, opacity 0 → 1, 280ms" },
};
