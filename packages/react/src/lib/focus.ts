import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { useAutoFocus } from "../platform";
import { isComposing } from "./keys";

/** The candidates for Tab inside a panel: enabled controls, links, and anything with a `tabindex`. `focusables` keeps the ones Tab reaches. */
export const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Tab reaches it: in the tab order (not a roving group's other items at `tabIndex -1`), not a hidden input, not hidden, inert or undrawn. */
const tabbable = (el: HTMLElement) =>
  el.tabIndex >= 0 &&
  !(el instanceof HTMLInputElement && el.type === "hidden") &&
  !el.closest("[hidden], [inert]") &&
  el.getAttribute("aria-hidden") !== "true" &&
  ((el as HTMLElement & { checkVisibility?: () => boolean }).checkVisibility?.() ?? true);

/** The elements inside `root` that Tab reaches, in document order. */
export function focusables(root: HTMLElement | null | undefined): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(tabbable);
}

export interface OverlayFocusOptions {
  /**
   * Where focus goes when the overlay opens: `"first"` the first focusable element, `"panel"` the panel itself (give it `tabIndex={-1}`), a
   * function that picks one, or `false` for none. Default `"first"`. A tree under `autoFocus={false}` never moves focus in.
   */
  initial?: "first" | "panel" | ((panel: HTMLElement) => HTMLElement | null | undefined) | false;
  /** Tab and Shift+Tab cycle inside the panel: a modal. */
  trap?: boolean;
  /**
   * Escape, with the event stopped so an overlay under this one keeps its own. Not for an overlay on the layer stack (`useLayerStack`),
   * which takes Escape from there in the stack's order. An Escape a control inside already used (`defaultPrevented`), or an IME's, is left.
   */
  onEscape?: () => void;
  /** Return focus to what had it before the overlay opened, when it closes (default `true`); when that is gone, to the nearest place still there. */
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
    // Where the opener sat, for when it is gone by the close (a menu row that opened a dialog).
    const around: HTMLElement[] = [];
    for (let at = opener?.parentElement ?? null; at; at = at.parentElement) around.push(at);
    const how = pick.current;
    if (allowed && how !== false) {
      const target = how === "panel" ? panel : how === "first" ? focusables(panel)[0] : how(panel);
      (target ?? (how === "first" ? panel : null))?.focus({ preventScroll: true });
    }
    return () => {
      if (!restore || !opener) return;
      const at = document.activeElement;
      // Only when focus is still ours to give back: inside the closing panel, or dropped to the page when the panel went.
      if (at && at !== document.body && !panel.contains(at)) return;
      if (opener.isConnected) return opener.focus({ preventScroll: true });
      // The opener went: the first control of the nearest of its ancestors still there, else that place's AntFabric root.
      const near = around.find((el) => el.isConnected);
      if (near) (focusables(near)[0] ?? near.closest<HTMLElement>("[data-af-platform]"))?.focus({ preventScroll: true });
    };
    // Once per opening: the panel is the overlay's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && escape.current && !e.defaultPrevented && !isComposing(e)) {
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
    // Wrap wherever Tab would leave: from the last (or first) stop, and from focus off the order (the panel itself, a roving group's other
    // items at tabIndex -1) with no stop after (or before) it. Between stops the browser moves on its own.
    const at = document.activeElement;
    const toward = e.shiftKey ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING;
    if (at && ref.current.contains(at) && all.some((el) => el !== at && at.compareDocumentPosition(el) & toward)) return;
    e.preventDefault();
    (e.shiftKey ? all[all.length - 1]! : all[0]!).focus();
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
