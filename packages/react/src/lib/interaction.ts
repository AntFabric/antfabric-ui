import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FocusEvent, type PointerEvent } from "react";
import { useForcedState } from "@antfabric/ui-core";

export interface Interaction {
  hovered: boolean;
  pressed: boolean;
  /** Keyboard focus only (`:focus-visible`): a click does not draw the ring, a key pressed after it does. */
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
  // While focused, a key pressed turns the ring on, as a browser's `:focus-visible` does after a click and then a key.
  const stopKeys = useRef<(() => void) | null>(null);
  useEffect(() => () => stopKeys.current?.(), []);
  const handlers = useMemo(() => {
    const unwatch = () => {
      stopKeys.current?.();
      stopKeys.current = null;
    };
    return {
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => {
        setHovered(false);
        setPressed(false);
      },
      onPointerDown: (e: PointerEvent) => {
        if (e.button === 0) setPressed(true);
      },
      onPointerUp: () => setPressed(false),
      onFocus: (e: FocusEvent) => {
        const el = e.target as HTMLElement;
        setFocused(el.matches?.(":focus-visible") ?? false);
        unwatch();
        const doc = el.ownerDocument;
        if (!doc) return;
        // A shortcut with a modifier held (⌘C, Ctrl+Tab to another tab) is not moving through the page by keyboard.
        const onKey = (k: KeyboardEvent) => {
          if (!k.metaKey && !k.ctrlKey && !k.altKey) setFocused(true);
        };
        doc.addEventListener("keydown", onKey, true);
        stopKeys.current = () => doc.removeEventListener("keydown", onKey, true);
      },
      onBlur: () => {
        unwatch();
        setFocused(false);
      },
    };
  }, []);
  const off = disabled || forced === "disabled";
  // A disabled element gets no `pointerleave`, so hover and press would wait there for the next enable: they end when it is disabled.
  if (off && (hovered || pressed)) {
    setHovered(false);
    setPressed(false);
  }
  return {
    hovered: !off && (forced === "hover" || hovered),
    pressed: !off && (forced === "pressed" || pressed),
    focused: forced === "focus" || focused,
    disabled: off,
    handlers,
  };
}

const COARSE = "(pointer: coarse)";
// jsdom (a consumer's Jest or Vitest) has no `matchMedia`: there the pointer is a fine one, as on the server.
const hasMedia = () => typeof matchMedia === "function";
const onCoarseChange = (notify: () => void) => {
  if (!hasMedia()) return () => {};
  const query = matchMedia(COARSE);
  query.addEventListener?.("change", notify);
  return () => query.removeEventListener?.("change", notify);
};

/** A touch screen (a touch laptop, an iPad running the web app): controls grow to a finger's size. */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(onCoarseChange, () => hasMedia() && matchMedia(COARSE).matches, () => false);
}
