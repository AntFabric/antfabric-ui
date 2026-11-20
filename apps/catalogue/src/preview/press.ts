/** What a flow frame's `press` lands on, in the drawn frame. Shared by the player and the checks. */

export const PRESSABLE =
  'button, a[href], [role="button"], [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="link"], [data-af-press]';

/** Every pressable in the frame, outermost only (a button inside a pressable row is the row's), in document order. */
export function pressables(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(PRESSABLE)).filter((el) => {
    const outer = el.parentElement?.closest(PRESSABLE);
    return !outer || !root.contains(outer);
  });
}

const escape = (s: string) => s.replace(/["\\]/g, "\\$&");

/** The nth pressable, the root of a component the scene names, or a control by its label or text. */
export function pressTarget(root: Element, press: number | string): HTMLElement | null {
  const all = pressables(root);
  if (typeof press === "number") return all[press] ?? null;
  const named = root.querySelector<HTMLElement>(`[data-af="${escape(press)}"]`);
  if (named) return named.querySelector<HTMLElement>(PRESSABLE) ?? named;
  return all.find((el) => el.getAttribute("aria-label") === press || el.textContent?.trim() === press) ?? null;
}
