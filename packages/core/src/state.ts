import { createContext, createElement, useCallback, useContext, useId, useMemo, useState, type ReactNode } from "react";
import type { InteractionState } from "./types";

/**
 * A prop that a press changes (`checked`, `open`, `value`, `selected`), with the event that reports
 * the change.
 *
 * Controlled when the caller passes both: the component shows `value` and asks for changes through
 * `onChange`. Given only the value, the component keeps its own state, starting from the value and
 * following it whenever the caller passes a new one, and still reports each change.
 */
export function useControllable<T>(value: T, onChange?: (next: T) => void): [T, (next: T) => void];
/** A prop with no default: left out, the component keeps its own state (and still reports each change) even when the caller passes the event. The state is `undefined` until the first change. */
export function useControllable<T>(value: T | undefined, onChange?: (next: T) => void): [T | undefined, (next: T) => void];
export function useControllable<T>(value: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [inner, setInner] = useState(value);
  const [seed, setSeed] = useState(value);
  if (!Object.is(seed, value)) {
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
