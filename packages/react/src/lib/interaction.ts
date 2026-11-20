import { useMemo, useState, useSyncExternalStore, type FocusEvent, type PointerEvent } from "react";
import { useForcedState } from "@antfabric/ui-core";

export interface Interaction {
  hovered: boolean;
  pressed: boolean;
  /** Keyboard focus only (`:focus-visible`): a click does not draw the ring. */
  focused: boolean;
  disabled: boolean;
  /** Spread onto the element. */
  handlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onPointerDown: (e: PointerEvent) => void;
    onPointerUp: () => void;
    onFocus: (e: FocusEvent) => void;
    onBlur: () => void;
  };
}

/**
 * Hover, press and keyboard focus as state, because every component styles inline and an inline
 * style has no `:hover`. Hover and focus stay separate on purpose: hover says what you are
 * pointing at, focus says what will receive your typing.
 */
export function useInteraction({ disabled = false }: { disabled?: boolean } = {}): Interaction {
  const forced = useForcedState();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const handlers = useMemo(
    () => ({
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => {
        setHovered(false);
        setPressed(false);
      },
      onPointerDown: (e: PointerEvent) => {
        if (e.button === 0) setPressed(true);
      },
      onPointerUp: () => setPressed(false),
      onFocus: (e: FocusEvent) => setFocused((e.target as HTMLElement).matches?.(":focus-visible") ?? false),
      onBlur: () => setFocused(false),
    }),
    [],
  );
  const off = disabled || forced === "disabled";
  return {
    hovered: !off && (forced === "hover" || hovered),
    pressed: !off && (forced === "pressed" || pressed),
    focused: forced === "focus" || focused,
    disabled: off,
    handlers,
  };
}

const COARSE = "(pointer: coarse)";
const onCoarseChange = (notify: () => void) => {
  const query = matchMedia(COARSE);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

/** A touch screen (a touch laptop, an iPad running the web app): controls grow to a finger's size. */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(onCoarseChange, () => matchMedia(COARSE).matches, () => false);
}
