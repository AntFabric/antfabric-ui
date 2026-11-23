import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { isComposing } from "./keys";

/**
 * The overlay layer (Popover, Dialog `modal`, Sheet, ToastRegion): one fixed, full-window box rendered into the nearest AntFabric root,
 * so the theme's variables (scoped to that root) still apply, and above the page whatever its overflow or stacking. An app's root fills
 * the window; the catalogue gives each preview's root `contain: layout`, so a layer there fills only its preview.
 *
 * - On the server (and the first client render of a hydrated page) there is no root to find yet: the overlay is drawn in place, as the
 *   catalogue's pictures and the render snapshots draw it. After that it moves into the layer before the browser paints.
 * - A stack keeps the overlays that are open in the order they opened: only the top one takes Esc (that nothing focused inside took) and
 *   a press outside: the primary button going down and coming up outside it (never a right-click, nor a press on a scrollbar).
 * - A modal layer locks the page's scroll (counted, so stacked modals release it once) and makes the rest of its root `inert`, a modal
 *   layer under it included.
 */

const ROOT = "[data-af-platform]";

const subscribe = () => () => {};
/** False on the server and while hydrating, true once the client draws on its own. */
function useClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Where an overlay's layer goes: the AntFabric root around `marker` (else the document's body). Null until it is known, which on the
 * client is before the first paint.
 */
export function useLayerHost(marker: RefObject<HTMLElement | null>, active: boolean): { host: HTMLElement | null; inPlace: boolean; client: boolean } {
  const client = useClient();
  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!active) return;
    const el = marker.current;
    const found = (el?.closest<HTMLElement>(ROOT) ?? null) || (typeof document !== "undefined" ? document.body : null);
    setHost(found);
  }, [active]);
  return { host, inPlace: !client || !host, client };
}

/** The layer's box: fixed over its root's containing block (the window in an app), above the page, letting presses through its gaps. */
const LAYER: CSSProperties = { position: "fixed", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column" };

/**
 * Draws `children` in the layer of `host`, at `zIndex`. `children` turn pointer events back on themselves (`pointerEvents: "auto"`).
 * `onRect` gets the layer's own box, which overlays subtract from a trigger's window position to place themselves.
 */
export function Layer({ host, zIndex, children, layerRef }: { host: HTMLElement; zIndex: number | string; children: ReactNode; layerRef?: RefObject<HTMLDivElement | null> }) {
  return createPortal(
    <div data-af-layer="" ref={layerRef} style={{ ...LAYER, zIndex }}>
      {children}
    </div>,
    host,
  );
}

interface Handlers {
  onEscape?: () => void;
  onOutside?: () => void;
}

interface Entry {
  /** The elements that count as inside (the panel, and the trigger a popover hangs from). */
  inside: () => (Element | null | undefined)[];
  /** The overlay's handlers as of its last render: either may be left out (a tooltip takes Esc, never a press outside). */
  handlers: () => Handlers;
}

const stack: Entry[] = [];

/** The top entry that takes `kind`, with its handler: a tooltip over a dialog does not stand between a press outside and the dialog. */
function topWith(kind: keyof Handlers): [Entry, () => void] | null {
  for (let i = stack.length - 1; i >= 0; i--) {
    const run = stack[i]!.handlers()[kind];
    if (run) return [stack[i]!, run];
  }
  return null;
}

/**
 * Escape, after the page had it: listened to on the document in the bubble phase, so it comes after React's own handlers (which listen on
 * the root). A control that uses Escape itself (an open Select, a Menu, a field that clears) calls `preventDefault()`, and the stack leaves
 * it; so the innermost focused handler wins, and the stack decides only what nothing inside took. An IME's Escape cancels its composition.
 */
function onKey(e: KeyboardEvent) {
  if (e.key !== "Escape" || e.defaultPrevented || isComposing(e)) return;
  const top = topWith("onEscape");
  if (!top) return;
  e.preventDefault();
  e.stopPropagation();
  top[1]();
}

/** `target` is outside `entry`'s elements, and not on a toast (ToastRegion), which is not outside the overlay under it. */
function outside(entry: Entry, target: EventTarget | null): boolean {
  const node = target as Node | null;
  if (node && entry.inside().some((el) => el?.contains(node))) return false;
  return !(node instanceof Element && node.closest("[data-af-layer-passive]"));
}

/** The press landed on the target's own scrollbar (a scrim that scrolls a tall dialog): past its client box, inside its border box. */
function onScrollbar(e: PointerEvent): boolean {
  const el = e.target;
  if (!(el instanceof HTMLElement) || !el.clientWidth || (el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth)) return false;
  const box = el.getBoundingClientRect();
  const x = e.clientX - box.left - el.clientLeft;
  const y = e.clientY - box.top - el.clientTop;
  return x < 0 || y < 0 || x > el.clientWidth || y > el.clientHeight;
}

/** The top overlay a press outside began over: a press outside is the primary button going down, and coming up, outside it. */
let pressedOver: Entry | null = null;

function onDown(e: PointerEvent) {
  pressedOver = null;
  // A right-click, a middle-click and a press on a scrollbar are not a press outside.
  if (e.button !== 0) return;
  const top = topWith("onOutside");
  if (top && outside(top[0], e.target) && !onScrollbar(e)) pressedOver = top[0];
}

function onUp(e: PointerEvent) {
  const began = pressedOver;
  pressedOver = null;
  if (!began || e.button !== 0) return;
  // A press that began outside and was dragged into the panel (selecting its text) is not one either.
  const top = topWith("onOutside");
  if (top && top[0] === began && outside(began, e.target)) top[1]();
}

function onCancel() {
  pressedOver = null;
}

function listen(on: boolean) {
  if (typeof document === "undefined") return;
  const method = on ? "addEventListener" : "removeEventListener";
  document[method]("keydown", onKey as EventListener);
  document[method]("pointerdown", onDown as EventListener, true);
  document[method]("pointerup", onUp as EventListener, true);
  document[method]("pointercancel", onCancel, true);
}

/**
 * Puts an open overlay on the stack while `active`: an Esc nothing inside took, and a press outside `inside()`, reach the top one that has
 * a handler for it. The handlers are read when the event comes, so they may change (or come and go) between renders.
 */
export function useLayerStack(active: boolean, inside: () => (Element | null | undefined)[], handlers: Handlers) {
  const latest = useRef({ inside, ...handlers });
  latest.current = { inside, ...handlers };
  useEffect(() => {
    if (!active) return;
    const entry: Entry = {
      inside: () => latest.current.inside(),
      handlers: () => latest.current,
    };
    if (stack.length === 0) listen(true);
    stack.push(entry);
    return () => {
      const at = stack.indexOf(entry);
      if (at >= 0) stack.splice(at, 1);
      if (stack.length === 0) listen(false);
    };
  }, [active]);
}

let locks = 0;
const saved = new Map<HTMLElement, string>();
/** The modal layers open, in the order they opened: a modal over another makes the one under it inert too. */
const modals: HTMLElement[] = [];

/** The nearest ancestor of `el` that scrolls (an app that scrolls its page in a box, not the body). */
function scroller(el: HTMLElement | null): HTMLElement | null {
  for (let at = el?.parentElement ?? null; at && at !== document.body; at = at.parentElement) {
    const y = getComputedStyle(at).overflowY;
    if ((y === "auto" || y === "scroll") && at.scrollHeight > at.clientHeight) return at;
  }
  return null;
}

/**
 * While `active`: the page behind does not scroll (the body, and the box `near` scrolls in), and the rest of the root is `inert` and
 * hidden from assistive tech. Counted, so stacked modals restore it when the last one closes.
 */
export function useModalPage(active: boolean, near: RefObject<HTMLElement | null>, layer: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const boxes = [document.body, scroller(near.current)].filter((b): b is HTMLElement => !!b);
    for (const b of boxes) {
      if (!saved.has(b)) saved.set(b, b.style.overflow);
      b.style.overflow = "hidden";
    }
    locks += 1;
    // Everything else in the root, beside this layer, is out of reach while it is open; so is a modal layer under this one (a dialog
    // opened from a sheet), while the other layers (toasts) stay, and so do the page's announcers (`announce()`), which a root on <body>
    // has beside it: an error said while the modal is open is still read.
    const own = layer.current;
    const host = own?.parentElement;
    const quieted = host ? Array.from(host.children).filter((c): c is HTMLElement => c !== own && c instanceof HTMLElement && !c.hasAttribute("data-af-layer") && !c.hasAttribute("data-af-announcer") && !c.hasAttribute("inert")) : [];
    quieted.push(...modals.filter((m) => m !== own && !m.hasAttribute("inert")));
    for (const c of quieted) {
      c.setAttribute("inert", "");
      c.setAttribute("aria-hidden", "true");
    }
    if (own) modals.push(own);
    return () => {
      if (own && modals.includes(own)) modals.splice(modals.indexOf(own), 1);
      for (const c of quieted) {
        c.removeAttribute("inert");
        c.removeAttribute("aria-hidden");
      }
      locks -= 1;
      if (locks > 0) return;
      for (const [b, was] of saved) b.style.overflow = was;
      saved.clear();
    };
  }, [active]);
}

/**
 * An overlay's layer, made modal when asked: `near` is an element in place (the trigger, or a marker the overlay leaves where it is
 * mounted), whose scrolling box is locked with the page's.
 */
export function OverlayLayer({ host, zIndex, modal, near, children }: { host: HTMLElement; zIndex: number | string; modal: boolean; near: RefObject<HTMLElement | null>; children: ReactNode }) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  useModalPage(modal, near, layerRef);
  return (
    <Layer host={host} zIndex={zIndex} layerRef={layerRef}>
      {children}
    </Layer>
  );
}
