/** A number that eases to its new value, for what CSS cannot tween: the digits of a KPI. The same on both kits. */

import { useEffect, useRef, useState } from "react";

/** A CSS `cubic-bezier(x1, y1, x2, y2)` as a function of progress, solved by bisection. Anything else is an ease-out cubic. */
export function easeFn(easing: string): (x: number) => number {
  const m = /cubic-bezier\(([^)]+)\)/.exec(easing);
  const [x1, y1, x2, y2] = (m ? m[1]!.split(",").map(Number) : []) as number[];
  if (![x1, y1, x2, y2].every((n) => Number.isFinite(n))) return (x) => 1 - (1 - x) ** 3;
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 20; i++) {
      t = (lo + hi) / 2;
      if (at(x1!, x2!, t) < x) lo = t;
      else hi = t;
    }
    return at(y1!, y2!, t);
  };
}

export interface TweenOptions {
  /** How long the change takes, ms (default 300). */
  ms?: number;
  /** The curve, as the kit's `motion.easing.out` resolves (`cubic-bezier(.16,1,.3,1)`). */
  easing?: string;
  /** No movement: the value is returned as it is. Reduced motion, or a caller that never animates. */
  off?: boolean;
}

/**
 * The value to draw: `value` itself the first time (and on the server), then, when it changes, a number easing from where the last
 * one stood to the new one over `ms`. Anything that is not a number, and `off`, passes straight through.
 */
export function useTween(value: number, { ms = 300, easing = "", off = false }: TweenOptions = {}): number {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (off || !Number.isFinite(value) || !Number.isFinite(from.current) || from.current === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const ease = easeFn(easing);
    const a = from.current;
    const start = Date.now();
    let frame = 0;
    const step = () => {
      const p = Math.min(1, (Date.now() - start) / ms);
      const v = a + (value - a) * ease(p);
      from.current = v;
      setShown(v);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ms, easing, off]);
  // Off, or not a number: no state to lag behind the value.
  return off || !Number.isFinite(value) ? value : shown;
}
