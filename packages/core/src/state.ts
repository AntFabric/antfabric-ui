import { createContext, createElement, useCallback, useContext, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { InteractionState } from "./types";

/**
 * Equal for re-seeding: the same value, or two arrays (or two plain objects) whose items are the same
 * values, so an inline `selected={["a"]}` or `sort={{ … }}` is not a new value on every render.
 */
function same(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
  if (!plain(a) || !plain(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => Object.prototype.hasOwnProperty.call(b, k) && Object.is(a[k], b[k]));
}

function plain(x: unknown): x is Record<string, unknown> {
  if (typeof x !== "object" || x === null) return false;
  const proto = Object.getPrototypeOf(x);
  return proto === Object.prototype || proto === null;
}

/**
 * A prop that a press changes (`checked`, `open`, `value`, `selected`), with the event that reports
 * the change.
 *
 * Controlled when the caller passes both the value and `onChange`: the component shows `value` and
 * asks for changes through `onChange`. Left out (`undefined`), the component keeps its own state and
 * still reports each change, whether or not the caller passes `onChange`: handler only keeps its own
 * state. Given only the value, it starts from the value and follows it whenever the caller passes a
 * new one (arrays and plain objects compared by their items, not their identity). So a component
 * never gives the prop a default in its destructuring: it defaults the result,
 * `const [on = false, setOn] = useControllable(checked, onCheckedChange)`.
 */
export function useControllable<T>(value: T, onChange?: (next: T) => void): [T, (next: T) => void];
/** A prop with no default: left out, the component keeps its own state (and still reports each change) even when the caller passes the event. The state is `undefined` until the first change. */
export function useControllable<T>(value: T | undefined, onChange?: (next: T) => void): [T | undefined, (next: T) => void];
export function useControllable<T>(value: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [inner, setInner] = useState(value);
  const [seed, setSeed] = useState(value);
  if (!same(seed, value)) {
    setSeed(value);
    setInner(value);
  }
  const controlled = onChange !== undefined && value !== undefined;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [controlled ? value : inner, set];
}

/**
 * A request a press makes, shown as pending until the app answers. A component never shows the result of a request before the app
 * confirms it: `run(handler)` sets `pending` and calls the handler, and pending clears when the app answers, that is when the handler's
 * promise settles (either way) or when any value in `answer` changes (compared as `same()` compares, so a re-render with equal props is
 * not an answer). A failed request that leaves the props as they were clears through its promise, or when a prop moves. A press while
 * pending does nothing, and with no handler there is nothing to wait for, so nothing is pending.
 */
export function usePending(answer: readonly unknown[]): { pending: boolean; run: (fn?: () => unknown) => void } {
  const [pending, setPending] = useState(false);
  const [seen, setSeen] = useState(answer);
  if (!same(seen, answer)) {
    setSeen(answer);
    if (pending) setPending(false);
  }
  // Two presses before a re-render read the same `pending`: the ref holds the wait between them.
  const waiting = useRef(false);
  waiting.current = pending;
  // Only the latest request's promise clears pending: an older one settling late does not end a newer wait.
  const latest = useRef(0);
  const run = useCallback((fn?: () => unknown) => {
    if (waiting.current || !fn) return;
    waiting.current = true;
    const id = ++latest.current;
    setPending(true);
    const out = fn();
    if (out && typeof (out as PromiseLike<unknown>).then === "function") {
      const settle = () => {
        if (latest.current === id) setPending(false);
      };
      (out as PromiseLike<unknown>).then(settle, settle);
    }
  }, []);
  return { pending, run };
}

/* ---------- forced states, for the catalogue's snapshots ---------- */

interface ForcedState {
  state?: InteractionState;
  owner?: string;
}

// One context for both kits: a forced state reaches the components drawn below its ForceState, whichever kit they come from.
const ForceContext = createContext<ForcedState | null>(null);

/**
 * Draws the first interactive element below in a state, as if hovered or pressed: how the
 * catalogue shows a component's states side by side. Only the outermost control takes it, so a
 * dialog forced to `hover` does not light up every button inside it.
 */
export function ForceState({ state, children }: { state?: InteractionState; children: ReactNode }) {
  const value = useMemo<ForcedState>(() => ({ state }), [state]);
  return createElement(ForceContext.Provider, { value }, children);
}

/** The forced state for this control, if it is the first to ask. */
export function useForcedState(): InteractionState | undefined {
  const id = useId();
  const ctx = useContext(ForceContext);
  if (!ctx?.state) return undefined;
  ctx.owner ??= id;
  return ctx.owner === id ? ctx.state : undefined;
}
