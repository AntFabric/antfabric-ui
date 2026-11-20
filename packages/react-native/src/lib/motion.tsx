import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Dimensions, Easing, Platform, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { MOTION, type EnterMotion } from "@antfabric/ui-core";

/**
 * The entrances, with React Native's own Animated (on the native driver on a device): the same
 * offsets and timing as the React kit's CSS keyframes (MOTION in @antfabric/ui-core), so a menu
 * pops the same on every platform. Reduced motion turns them into a plain appearance.
 *
 *   <Enter motion="pop" style={s.menu}>…</Enter>
 */

/** A CSS `cubic-bezier(…)` token as React Native's Easing, so motion uses the tokens' curves. */
export const bezier = (css: string) => {
  const [a, b, c, d] = (/cubic-bezier\(([^)]+)\)/.exec(css)?.[1] ?? ".16,1,.3,1").split(",").map(Number);
  return Easing.bezier(a!, b!, c!, d!);
};

/*
 * Reduce Motion, kept current: read once at start and then followed, so turning it on in Settings while the app runs stops the next
 * animation, not the next launch. `useReducedMotion()` re-renders a component when it changes; `reducedMotion()` reads it outside render.
 */
let reduceMotion = false;
const listeners = new Set<(on: boolean) => void>();
const setReduce = (on: boolean) => {
  if (on === reduceMotion) return;
  reduceMotion = on;
  for (const l of listeners) l(on);
};
AccessibilityInfo.isReduceMotionEnabled?.().then(setReduce, () => {});
AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduce);

/** Whether the person asked for less motion, now. For a decision outside render (an Animated loop about to start). */
export function reducedMotion(): boolean {
  return reduceMotion;
}

/** Whether the person asked for less motion, as state: the component re-renders when it changes in Settings. */
export function useReducedMotion(): boolean {
  const [on, setOn] = useState(reduceMotion);
  useEffect(() => {
    setOn(reduceMotion);
    listeners.add(setOn);
    return () => {
      listeners.delete(setOn);
    };
  }, []);
  return on;
}

/** Where each entrance starts, as a function of progress `p` (0 → 1). */
function from(motion: EnterMotion, p: Animated.Value): Animated.WithAnimatedValue<ViewStyle> {
  const lerp = (a: number, b: number) => p.interpolate({ inputRange: [0, 1], outputRange: [a, b] });
  switch (motion) {
    case "fade":
      return { opacity: p };
    case "rise":
      return { opacity: p, transform: [{ translateY: lerp(8, 0) }] };
    case "drop":
      return { opacity: p, transform: [{ translateY: lerp(-14, 0) }] };
    case "pop":
      return { opacity: p, transform: [{ scale: lerp(0.94, 1) }] };
    case "slide-up":
      return { transform: [{ translateY: lerp(Dimensions.get("window").height, 0) }] };
    case "slide-down":
      return { opacity: p, transform: [{ translateY: lerp(-Dimensions.get("window").height / 2, 0) }] };
    case "slide-left":
      return { opacity: p, transform: [{ translateX: lerp(24, 0) }] };
    case "slide-right":
      return { opacity: p, transform: [{ translateX: lerp(-24, 0) }] };
    case "grow-x":
      return { opacity: p, transform: [{ scaleX: lerp(0.4, 1) }] };
  }
}

/** Progress from 0 to 1 over an entrance's duration, started on mount. */
export function useEnter(motion: EnterMotion | false | null | undefined): Animated.WithAnimatedValue<ViewStyle> | null {
  const p = useRef(new Animated.Value(motion && !reduceMotion ? 0 : 1)).current;
  useEffect(() => {
    if (!motion || reduceMotion) return;
    const m = MOTION[motion];
    const run = Animated.timing(p, { toValue: 1, duration: m.duration, easing: bezier(m.easing), useNativeDriver: Platform.OS !== "web" });
    run.start();
    return () => run.stop();
  }, [motion, p]);
  return motion ? from(motion, p) : null;
}

export interface EnterProps extends ViewProps {
  motion?: EnterMotion | false | null;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** A View that arrives with an entrance. Remount it (a new `key`) to play it again. */
export function Enter({ motion, style, children, ...rest }: EnterProps) {
  const anim = useEnter(motion);
  return (
    <Animated.View {...rest} style={[style, anim]}>
      {children}
    </Animated.View>
  );
}

/** True for one render after `value` changes: for a press that should play an entrance again. */
export function useChanged(value: unknown): number {
  const [n, setN] = useState(0);
  const last = useRef(value);
  useEffect(() => {
    if (!Object.is(last.current, value)) {
      last.current = value;
      setN((x) => x + 1);
    }
  }, [value]);
  return n;
}
