import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode, type RefObject } from "react";
import { recipes, useControllable } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useOverlayFocus } from "../../lib/focus";
import { OverlayLayer, useLayerHost, useLayerStack } from "../../lib/layer";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";

export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverProps extends RootProps<HTMLDivElement> {
  /** What the panel holds: a list, a form, a Menu (with `bare`), a card of anything. */
  content?: ReactNode;
  /** The panel is showing. A press on the trigger toggles it; Esc and a press outside close it. */
  open?: boolean;
  /** The panel opened or closed: from the trigger, Esc, a press outside, or the panel's own content asking. */
  onOpenChange?: (open: boolean) => void;
  /** Which side of the trigger the panel hangs on. Where there is no room, it flips to the other side. */
  side?: PopoverSide;
  /** Which edge of the trigger the panel lines up with, along that side. */
  align?: PopoverAlign;
  /** The panel's width in pixels; 0 lets it take its content's width. */
  width?: number;
  /** The panel is exactly as wide as its trigger (a picker under a field). */
  matchTrigger?: boolean;
  /** The panel's accessible name, when its content does not name itself. */
  label?: string;
  /** No card: the content is already one (a Menu). */
  bare?: boolean;
  /** Tab stays in the panel and the rest of the page is out of reach until it closes. */
  modal?: boolean;
  /** With no `children`: draws a button the panel belongs to, and the panel beside it, as the catalogue does. */
  showTrigger?: boolean;
  triggerLabel?: string;
  /** The control the panel belongs to. A press on it toggles the panel, which floats beside it in the overlay layer. */
  children?: ReactNode;
  /** Per-part styles over the theme: `{ root: {…}, panel: {…} }`. */
  styles?: PartStyles<"popover">;
  style?: CSSProperties;
}

const DIRECTION: Record<PopoverSide, CSSProperties["flexDirection"]> = { top: "column-reverse", bottom: "column", left: "row-reverse", right: "row" };
const OPPOSITE: Record<PopoverSide, PopoverSide> = { top: "bottom", bottom: "top", left: "right", right: "left" };
const TARGET = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]';

/** The gap between trigger and panel, and the room kept at the window's edge: the `space.xs` token, read as pixels once drawn. */
function gapOf(el: HTMLElement): number {
  const raw = getComputedStyle(el).getPropertyValue("--af-space-xs");
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 4;
}

interface Place {
  top: number;
  left: number;
  maxHeight: number;
  maxWidth: number;
}

/**
 * Where the panel goes, in the layer's own coordinates: on `side` of the trigger, lined up by `align`, flipped to the other side when
 * that side has no room and the other has, and kept inside the layer with a gap at its edges.
 */
function placePopover(trigger: DOMRect, panel: { width: number; height: number }, layer: DOMRect, side: PopoverSide, align: PopoverAlign, gap: number, rtl = false): Place {
  const tr = { top: trigger.top - layer.top, left: trigger.left - layer.left, right: trigger.right - layer.left, bottom: trigger.bottom - layer.top, width: trigger.width, height: trigger.height };
  const W = layer.width;
  const H = layer.height;
  const room: Record<PopoverSide, number> = { top: tr.top - gap * 2, bottom: H - tr.bottom - gap * 2, left: tr.left - gap * 2, right: W - tr.right - gap * 2 };
  const vertical = side === "top" || side === "bottom";
  const need = vertical ? panel.height : panel.width;
  const s = room[side] < need && room[OPPOSITE[side]] > room[side] ? OPPOSITE[side] : side;
  const along = rtl && vertical ? (align === "start" ? "end" : align === "end" ? "start" : align) : align;
  let top: number;
  let left: number;
  if (vertical) {
    top = s === "bottom" ? tr.bottom + gap : tr.top - gap - Math.min(panel.height, room.top);
    left = along === "start" ? tr.left : along === "end" ? tr.right - panel.width : tr.left + (tr.width - panel.width) / 2;
  } else {
    left = s === "right" ? tr.right + gap : tr.left - gap - panel.width;
    top = along === "start" ? tr.top : along === "end" ? tr.bottom - panel.height : tr.top + (tr.height - panel.height) / 2;
  }
  left = Math.max(gap, Math.min(left, W - panel.width - gap));
  const maxHeight = vertical ? Math.max(room[s], gap * 4) : H - gap * 2;
  top = Math.max(gap, Math.min(top, H - Math.min(panel.height, maxHeight) - gap));
  return { top, left, maxHeight, maxWidth: W - gap * 2 };
}

/**
 * A panel that hangs from the control that opened it: a list, a short form, a Menu, anything. It floats in the overlay layer above the
 * page (whatever the page's overflow), flips to the other side where there is no room, follows its trigger as the page scrolls, and
 * closes on Esc and a press outside, giving focus back to the trigger. With `modal` Tab stays inside and the page behind is out of
 * reach. With no `children` it draws its own button and the panel in flow beside it, as the catalogue shows it.
 */
export function Popover({
  content = null,
  open,
  onOpenChange,
  side = "bottom",
  align = "start",
  width = 0,
  matchTrigger = false,
  label = "",
  bare = false,
  modal = false,
  showTrigger = true,
  triggerLabel = "Open",
  children,
  styles,
  style,
  ref,
  ...rest
}: PopoverProps) {
  const r = useRecipe(recipes.popover, { variants: { bare }, styles });
  const [shown = false, setShown] = useControllable(open, onOpenChange);
  const id = useId();
  const host = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const floating = children !== undefined && children !== null && children !== false;
  const layer = useLayerHost(host, shown && floating);

  // The trigger says it opens a panel, whether it is open, and which panel.
  useEffect(() => {
    const el = Array.from(host.current?.querySelectorAll<HTMLElement>(TARGET) ?? []).find((n) => !panel.current?.contains(n));
    if (!el) return;
    el.setAttribute("aria-haspopup", bare ? "menu" : "dialog");
    el.setAttribute("aria-expanded", String(shown));
    if (shown) el.setAttribute("aria-controls", id);
    else el.removeAttribute("aria-controls");
  }, [shown, bare, id, children, showTrigger]);

  const close = () => setShown(false);
  const press = (e: MouseEvent) => {
    // Only a press on the trigger toggles. A click in the panel, or in a layer portalled from it (an inner Dialog or Popover, which React
    // bubbles here through the component tree, not the DOM), is not one.
    const target = e.target as Node;
    if (!host.current?.contains(target) || panel.current?.contains(target)) return;
    setShown(!shown);
  };

  const body = (place: boolean) => (
    <PopoverPanel
      id={id}
      panelRef={panel}
      trigger={host}
      r={r}
      label={label}
      bare={bare}
      modal={modal && floating}
      floating={floating}
      positioned={place}
      side={side}
      align={align}
      width={width}
      matchTrigger={matchTrigger}
      onClose={close}
    >
      {content}
    </PopoverPanel>
  );

  return (
    <div
      ref={(el) => {
        host.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      data-af-part="root"
      {...rootProps(rest)}
      onClick={floating ? press : undefined}
      style={css(box, { alignSelf: "flex-start", alignItems: "flex-start", gap: t.space.xs }, partStyle(r, "root", floating ? undefined : { flexDirection: DIRECTION[side] }), style)}
    >
      {floating ? children : showTrigger && <Button label={triggerLabel} variant="secondary" size="sm" onPress={() => setShown(!shown)} />}
      {shown && (floating ? (layer.inPlace || !layer.host ? <div style={{ position: "absolute", top: "100%", left: 0, zIndex: t.zIndex.popover }}>{body(false)}</div> : <OverlayLayer host={layer.host} zIndex={t.zIndex.popover} modal={modal} near={host}>{body(true)}</OverlayLayer>) : body(false))}
    </div>
  );
}

interface PanelProps {
  id: string;
  panelRef: RefObject<HTMLDivElement | null>;
  trigger: RefObject<HTMLDivElement | null>;
  r: ReturnType<typeof useRecipe<"root" | "panel">>;
  label: string;
  bare: boolean;
  modal: boolean;
  floating: boolean;
  positioned: boolean;
  side: PopoverSide;
  align: PopoverAlign;
  width: number;
  matchTrigger: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** The panel: mounted while open, so focus moves in when it opens and back to the trigger when it closes. */
function PopoverPanel({ id, panelRef, trigger, r, label, bare, modal, floating, positioned, side, align, width, matchTrigger, onClose, children }: PanelProps) {
  // Floating, Esc is the stack's (after the controls inside, to the top overlay only); drawn in place, the panel's own.
  const focus = useOverlayFocus<HTMLDivElement>({ trap: modal, onEscape: floating ? undefined : onClose });
  const [place, setPlace] = useState<Place | null>(null);
  const [triggerWidth, setTriggerWidth] = useState(0);
  useLayerStack(floating, () => [panelRef.current, trigger.current], { onEscape: onClose, onOutside: onClose });

  useLayoutEffect(() => {
    if (!positioned) return;
    const el = panelRef.current;
    const at = trigger.current;
    const layer = el?.parentElement;
    if (!el || !at || !layer) return;
    const update = () => {
      const t0 = at.getBoundingClientRect();
      setTriggerWidth(t0.width);
      const rtl = getComputedStyle(at).direction === "rtl";
      setPlace(placePopover(t0, { width: el.offsetWidth, height: el.scrollHeight }, layer.getBoundingClientRect(), side, align, gapOf(el), rtl));
    };
    update();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    observer?.observe(el);
    observer?.observe(at);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [positioned, side, align, width, matchTrigger]);

  // Until it is placed the panel is transparent, not hidden: a hidden element cannot take the focus that moves in when it opens.
  const sized: CSSProperties = matchTrigger && triggerWidth ? { width: triggerWidth } : width ? { width } : { width: "max-content" };
  return (
    <div
      ref={(el) => {
        panelRef.current = el;
        focus.ref.current = el;
      }}
      id={id}
      role={bare ? undefined : "dialog"}
      aria-label={!bare && label ? label : undefined}
      aria-modal={modal || undefined}
      tabIndex={-1}
      data-af-part="panel"
      onKeyDown={focus.onKeyDown}
      style={css(
        box,
        { outline: "none", maxWidth: "100%" },
        sized,
        positioned && { position: "absolute", top: place?.top ?? 0, left: place?.left ?? 0, maxHeight: place?.maxHeight, maxWidth: place?.maxWidth, overflowY: "auto", opacity: place ? undefined : 0, pointerEvents: "auto" },
        enter("fade"),
        partStyle(r, "panel"),
      )}
    >
      {children}
    </div>
  );
}
