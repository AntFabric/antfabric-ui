import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

/**
 * The overlay layer (Popover, Dialog `modal`, Sheet, ToastRegion): one fixed, full-window box rendered into the nearest AntFabric root,
 * so the theme's variables (scoped to that root) still apply, and above the page whatever its overflow or stacking. An app's root fills
 * the window; the catalogue gives each preview's root `contain: layout`, so a layer there fills only its preview.
 *
 * - On the server (and the first client render of a hydrated page) there is no root to find yet: the overlay is drawn in place, as the
 *   catalogue's pictures and the render snapshots draw it. After that it moves into the layer before the browser paints.
 * - A stack keeps the overlays that are open in the order they opened: only the top one takes Esc and a press outside.
 * - A modal layer locks the page's scroll (counted, so stacked modals release it once) and makes the rest of its root `inert`.
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

interface Entry {
  id: symbol;
  /** The elements that count as inside (the panel, and the trigger a popover hangs from). */
  inside: () => (Element | null | undefined)[];
  onEscape?: () => void;
  onOutside?: () => void;
}

const stack: Entry[] = [];

function onKey(e: KeyboardEvent) {
  if (e.key !== "Escape" || e.defaultPrevented) return;
  const top = stack[stack.length - 1];
  if (!top?.onEscape) return;
  e.preventDefault();
  e.stopPropagation();
  top.onEscape();
}

function onPress(e: PointerEvent) {
  const top = stack[stack.length - 1];
  if (!top?.onOutside) return;
  const target = e.target as Node | null;
  if (target && top.inside().some((el) => el?.contains(target))) return;
  // A press on a toast (ToastRegion) is not a press outside the overlay under it.
  if (target instanceof Element && target.closest("[data-af-layer-passive]")) return;
  top.onOutside();
}

function listen(on: boolean) {
  if (typeof document === "undefined") return;
  if (on) {
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPress, true);
  } else {
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("pointerdown", onPress, true);
  }
}

/**
 * Puts an open overlay on the stack while `active`: Esc anywhere and a press outside `inside()` reach the top one only. The handlers are
 * read when the event comes, so they may change between renders.
 */
export function useLayerStack(active: boolean, inside: () => (Element | null | undefined)[], handlers: { onEscape?: () => void; onOutside?: () => void }) {
  const latest = useRef({ inside, ...handlers });
  latest.current = { inside, ...handlers };
  useEffect(() => {
    if (!active) return;
    const entry: Entry = {
      id: Symbol("layer"),
      inside: () => latest.current.inside(),
      onEscape: () => latest.current.onEscape?.(),
      onOutside: () => latest.current.onOutside?.(),
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
    // Everything else in the root, beside this layer, is out of reach while it is open.
    const own = layer.current;
    const host = own?.parentElement;
    const quieted = host ? Array.from(host.children).filter((c): c is HTMLElement => c !== own && c instanceof HTMLElement && !c.hasAttribute("data-af-layer") && !c.hasAttribute("inert")) : [];
    for (const c of quieted) {
      c.setAttribute("inert", "");
      c.setAttribute("aria-hidden", "true");
    }
    return () => {
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
