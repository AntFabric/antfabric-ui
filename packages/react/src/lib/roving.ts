import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { useDirection } from "@antfabric-ui/core";

export interface RovingOptions {
  /** The items, as a selector inside the container: `'[role="menuitem"]'`. */
  items: string;
  /** Which arrows move: up and down (`vertical`, a menu, a listbox), left and right (`horizontal`, a menubar, tabs, a toolbar) or all four. */
  orientation?: "vertical" | "horizontal" | "both";
  /** Past the last item, the first (default `true`). */
  loop?: boolean;
  /** A printable key moves to the next item whose text starts with it (a menu). */
  typeahead?: boolean;
  /** Items matching this are skipped (default: `[aria-disabled="true"]` is not skipped; menus keep disabled rows reachable, as APG asks). */
  skip?: string;
  /** Called after focus moves, with the item: tabs and radios select on move. */
  onMove?: (item: HTMLElement, index: number) => void;
  /**
   * Keep the group one tab stop by setting the items' `tabIndex` here: the item last focused (the first, to start) is 0 and the rest -1.
   * For a group whose items cannot take a `tabIndex` prop (a toolbar of IconButtons). Set after mount, so the server's markup is unchanged.
   */
  roving?: boolean;
}

/**
 * Arrow keys, Home and End (and, in a menu, typeahead) between the items of a composite widget: a menu, a menubar, a toolbar, tabs, a
 * radio group, a listbox. One tab stop for the group; the arrows move inside it. Left and right follow the tree's direction, so in
 * `rtl` ArrowRight goes to the previous item. This is Menu's keyboard, shared.
 *
 *   const keys = useRovingKeys<HTMLDivElement>({ items: '[role="menuitem"]', orientation: "horizontal" });
 *   <div ref={keys.ref} role="menubar" onKeyDown={keys.onKeyDown}>…
 *
 * `onKeyDown` returns true when it handled the key, so a component with keys of its own (Escape, Enter) can go on only when it did not.
 */
export function useRovingKeys<T extends HTMLElement = HTMLElement>({ items, orientation = "vertical", loop = true, typeahead = false, skip, onMove, roving = false }: RovingOptions): {
  ref: RefObject<T | null>;
  onKeyDown: (e: KeyboardEvent) => boolean;
  /** Focus an item by index (`-1` is the last): for a menu that opens on its first or last row. */
  focusItem: (index: number) => void;
} {
  const ref = useRef<T | null>(null);
  const dir = useDirection();

  const list = () => Array.from(ref.current?.querySelectorAll<HTMLElement>(items) ?? []).filter((el) => !(skip && el.matches(skip)) && !el.closest("[hidden]"));
  const current = useRef(0);

  // One tab stop: after every render (items come and go), the current item is 0 and the rest -1; focus landing on an item makes it current.
  useEffect(() => {
    if (!roving) return;
    const all = list();
    const at = Math.min(current.current, all.length - 1);
    all.forEach((el, i) => (el.tabIndex = i === at ? 0 : -1));
  });
  useEffect(() => {
    const box = ref.current;
    if (!roving || !box) return;
    const take = (e: FocusEvent) => {
      const all = list();
      const i = all.findIndex((el) => el === e.target || el.contains(e.target as Node));
      if (i < 0) return;
      current.current = i;
      all.forEach((el, j) => (el.tabIndex = j === i ? 0 : -1));
    };
    box.addEventListener("focusin", take);
    return () => box.removeEventListener("focusin", take);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roving]);

  const focusItem = (index: number) => {
    const all = list();
    if (!all.length) return;
    const i = index < 0 ? all.length + index : index;
    const to = all[Math.max(0, Math.min(all.length - 1, i))]!;
    to.focus();
    onMove?.(to, all.indexOf(to));
  };

  const onKeyDown = (e: KeyboardEvent): boolean => {
    if (e.altKey || e.ctrlKey || e.metaKey) return false;
    const all = list();
    if (!all.length) return false;
    const at = all.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
    const go = (i: number) => {
      e.preventDefault();
      const n = all.length;
      const next = loop ? (i + n) % n : Math.max(0, Math.min(n - 1, i));
      all[next]!.focus();
      onMove?.(all[next]!, next);
      return true;
    };
    const vertical = orientation !== "horizontal";
    const horizontal = orientation !== "vertical";
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (vertical && e.key === "ArrowDown") return go(at + 1);
    if (vertical && e.key === "ArrowUp") return go(at < 0 ? -1 : at - 1);
    if (horizontal && e.key === forward) return go(at + 1);
    if (horizontal && e.key === back) return go(at < 0 ? -1 : at - 1);
    if (e.key === "Home") return go(0);
    if (e.key === "End") return go(all.length - 1);
    if (typeahead && e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      for (let s = 1; s <= all.length; s++) {
        const i = (at + s) % all.length;
        const el = all[i]!;
        const name = (el.getAttribute("title") || el.getAttribute("aria-label") || el.textContent || "").trim().toLowerCase();
        if (name.startsWith(k)) return go(i);
      }
    }
    return false;
  };

  return { ref, onKeyDown, focusItem };
}
