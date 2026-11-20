import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { useAutoFocus } from "../platform";

/** What Tab can reach inside a panel: enabled controls, links, and anything with a non-negative tabIndex. */
export const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** The focusable elements inside `root`, in document order, skipping the ones hidden by `display: none` or `hidden`. */
export function focusables(root: HTMLElement | null | undefined): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.closest("[hidden], [inert]") && el.getAttribute("aria-hidden") !== "true");
}

export interface OverlayFocusOptions {
  /**
   * Where focus goes when the overlay opens: `"first"` the first focusable element, `"panel"` the panel itself (give it `tabIndex={-1}`), a
   * function that picks one, or `false` for none. Default `"first"`. A tree under `autoFocus={false}` never moves focus in.
   */
  initial?: "first" | "panel" | ((panel: HTMLElement) => HTMLElement | null | undefined) | false;
  /** Tab and Shift+Tab cycle inside the panel: a modal. */
  trap?: boolean;
  /** Escape, with the event stopped so an overlay under this one keeps its own. */
  onEscape?: () => void;
  /** Return focus to what had it before the overlay opened, when it closes (default `true`). */
  restore?: boolean;
}

/**
 * The focus contract every overlay keeps (WAI-ARIA APG, dialog and menu patterns): focus moves in when it opens, Tab stays inside a
 * modal, Escape closes it, and focus goes back to the opener when it closes. An overlay in this kit is open while it is mounted, so
 * "opens" is the mount and "closes" the unmount.
 *
 *   const focus = useOverlayFocus<HTMLDivElement>({ trap: true, onEscape: cancel, initial: (panel) => panel.querySelector("input") });
 *   <div ref={focus.ref} role="dialog" aria-modal onKeyDown={focus.onKeyDown}>…
 *
 * A component with its own key handling calls `focus.onKeyDown(e)` from it.
 */
export function useOverlayFocus<T extends HTMLElement = HTMLElement>({ initial = "first", trap = false, onEscape, restore = true }: OverlayFocusOptions = {}): {
  ref: RefObject<T | null>;
  onKeyDown: (e: KeyboardEvent) => void;
} {
  const ref = useRef<T | null>(null);
  const allowed = useAutoFocus();
  const pick = useRef(initial);
  pick.current = initial;
  const escape = useRef(onEscape);
  escape.current = onEscape;

  useEffect(() => {
    const panel = ref.current;
    if (!panel || typeof document === "undefined") return;
    const opener = document.activeElement instanceof HTMLElement && !panel.contains(document.activeElement) ? document.activeElement : null;
    const how = pick.current;
    if (allowed && how !== false) {
      const target = how === "panel" ? panel : how === "first" ? focusables(panel)[0] : how(panel);
      (target ?? (how === "first" ? panel : null))?.focus({ preventScroll: true });
    }
    return () => {
      if (!restore || !opener || !opener.isConnected) return;
      const at = document.activeElement;
      // Only when focus is still ours to give back: inside the closing panel, or dropped to the page when the panel went.
      if (!at || at === document.body || panel.contains(at)) opener.focus({ preventScroll: true });
    };
    // Once per opening: the panel is the overlay's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && escape.current) {
      e.stopPropagation();
      e.preventDefault();
      escape.current();
      return;
    }
    if (!trap || e.key !== "Tab" || !ref.current) return;
    const all = focusables(ref.current);
    if (!all.length) {
      e.preventDefault();
      return;
    }
    const first = all[0]!;
    const last = all[all.length - 1]!;
    const at = document.activeElement;
    if (e.shiftKey && (at === first || at === ref.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && at === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return { ref, onKeyDown };
}

/**
 * Keeps keyboard focus when the focused control unmounts and something takes its place (a Reply button that becomes a field, a Sign in
 * button that becomes a spinner, a decided approval's buttons that become its outcome): call it with whether the swap has happened, and
 * give the element that replaces the control the ref (a non-control gets `tabIndex={-1}`). Focus moves only when it fell to the page,
 * so a person who had moved on is not pulled back.
 *
 *   const into = useFocusHandoff<HTMLInputElement>(replying);
 *   {replying ? <input ref={into} /> : <button onClick={() => setReplying(true)}>Reply</button>}
 */
export function useFocusHandoff<T extends HTMLElement = HTMLElement>(swapped: boolean): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!swapped || typeof document === "undefined") return;
    const at = document.activeElement;
    if (!at || at === document.body) ref.current?.focus({ preventScroll: true });
  }, [swapped]);
  return ref;
}
