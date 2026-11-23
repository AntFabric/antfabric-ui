import { useEffect, useId, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { MOTION, recipes, useControllable } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { useLayerStack } from "../../lib/layer";
import { isComposing } from "../../lib/keys";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import type { IconName } from "../../lib/icon";
import { box, css, enter, row, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { IconButton } from "../actions/icon-button";
import { Kbd, ariaShortcut } from "../display/kbd";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps extends RootProps<HTMLDivElement> {
  /** The words the bubble says. A control with no visible text names itself with the same words. */
  label: string;
  /** Written once, `Mod+Shift+M`; drawn after the label in each OS's glyphs, and set as `aria-keyshortcuts` on the trigger. */
  shortcut?: string;
  /** Where the bubble sits from its control. It does not flip at the window's edge. */
  side?: TooltipSide;
  /** With no `children`: draws the icon button the tooltip belongs to, and the bubble beside it. */
  showTrigger?: boolean;
  triggerIcon?: IconName;
  /** The control the tooltip belongs to. The bubble opens on its hover (after a short rest) and keyboard focus, closes on Esc, blur, press and leave, and the control is `aria-describedby` it. */
  children?: ReactNode;
  /** The bubble is showing. Hover and focus change it; set it to draw the bubble open. */
  open?: boolean;
  /** The bubble opened or closed, from hover, focus, Esc or leaving. */
  onOpenChange?: (open: boolean) => void;
  /** Per-part styles over the theme: `{ root: {…}, bubble: {…} }`. */
  styles?: PartStyles<"tooltip">;
  style?: CSSProperties;
}

const DIRECTION: Record<TooltipSide, CSSProperties["flexDirection"]> = { top: "column-reverse", bottom: "column", left: "row-reverse", right: "row" };

/** The rest before hover opens the bubble: the motion tokens' `rise`, 320 ms. Focus opens it at once. */
const REST = MOTION.rise.duration;

/** Where a floating bubble hangs from its control, flush with it, so the pointer crosses no gap to reach it. */
const FLOAT: Record<TooltipSide, CSSProperties> = {
  top: { bottom: "100%", left: "50%", transform: "translateX(-50%)", paddingBottom: t.space.xs },
  bottom: { top: "100%", left: "50%", transform: "translateX(-50%)", paddingTop: t.space.xs },
  left: { right: "100%", top: "50%", transform: "translateY(-50%)", paddingRight: t.space.xs },
  right: { left: "100%", top: "50%", transform: "translateY(-50%)", paddingLeft: t.space.xs },
};

const TARGET = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]';

/** The layout and the motion no token decides; what the tokens decide is the recipe's. */
const bubble: CSSProperties = {
  ...row,
  gap: t.space.xs,
  lineHeight: 1.35,
  paddingBlock: t.tooltip.padY,
  ...enter("fade"),
};

/**
 * The bubble a control shows while hovered or keyboard-focused (WCAG 1.4.13): it opens after a short rest on hover and at once on
 * focus-visible, stays while the pointer is on the control or the bubble, closes on Esc (without moving focus), blur, press and leave, and
 * the control is `aria-describedby` the bubble. With `children` the bubble floats beside them; with none it draws the built-in icon button
 * and the bubble in flow, as the catalogue does.
 */
export function Tooltip({ label, shortcut = "", side = "bottom", showTrigger = true, triggerIcon = "bell-off", children, open, onOpenChange, styles, style, ref, ...rest }: TooltipProps) {
  const r = useRecipe(recipes.tooltip, { styles });
  const { os } = usePlatform();
  const id = useId();
  const [shown = false, setShown] = useControllable(open, onOpenChange);
  const host = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // The control already says the label, so the bubble describes only what is more (the shortcut).
  const [same, setSame] = useState(false);
  const floating = children !== undefined && children !== null && children !== false;

  const show = (now: boolean) => {
    clearTimeout(timer.current);
    if (now) setShown(true);
    else timer.current = setTimeout(() => setShown(true), REST);
  };
  const hide = () => {
    clearTimeout(timer.current);
    if (shown) setShown(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  // The control is described by the bubble and names its shortcut; it is the first thing in the host that can take focus.
  useEffect(() => {
    const el = Array.from(host.current?.querySelectorAll<HTMLElement>(TARGET) ?? []).find((n) => !n.closest('[role="tooltip"]'));
    if (!el) return;
    const had = el.getAttribute("aria-describedby");
    const hadKeys = el.getAttribute("aria-keyshortcuts");
    el.setAttribute("aria-describedby", [had, id].filter(Boolean).join(" "));
    if (shortcut) el.setAttribute("aria-keyshortcuts", ariaShortcut(shortcut, os));
    const name = (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().toLowerCase();
    setSame(name === label.trim().toLowerCase());
    return () => {
      if (had) el.setAttribute("aria-describedby", had);
      else el.removeAttribute("aria-describedby");
      if (shortcut) {
        if (hadKeys) el.setAttribute("aria-keyshortcuts", hadKeys);
        else el.removeAttribute("aria-keyshortcuts");
      }
    };
  }, [id, label, shortcut, os, children, showTrigger, triggerIcon]);

  // Esc hides a shown bubble (WCAG 1.4.13) and stops there: from its control, and from anywhere while it is the top layer, so one opened by
  // hover goes too. A hidden one leaves the key alone.
  useLayerStack(shown, () => [host.current], { onEscape: hide });
  const keyboard = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !shown || e.defaultPrevented || isComposing(e)) return;
    e.preventDefault();
    e.stopPropagation();
    hide();
  };
  const enterPointer = (e: PointerEvent) => {
    // Only where hover exists: a tap on a phone or a tablet never flashes one.
    if (e.pointerType === "touch" || (typeof matchMedia === "function" && !matchMedia("(hover: hover)").matches)) return;
    show(false);
  };
  const focused = (e: FocusEvent) => {
    if ((e.target as HTMLElement).matches?.(":focus-visible")) show(true);
  };
  const blurred = (e: FocusEvent) => {
    if (!host.current?.contains(e.relatedTarget as Node | null)) hide();
  };

  const body = (
    <div
      id={id}
      role="tooltip"
      data-af-part="bubble"
      style={css(bubble, { pointerEvents: floating ? "auto" : "none" }, r.bubble)}
    >
      <span aria-hidden={same || undefined} style={css(text, { whiteSpace: "normal", overflowWrap: "normal" })}>{label}</span>
      {shortcut && <Kbd keys={shortcut} tone="inverse" style={{ height: t.tooltip.kbdH, paddingInline: t.space["2xs"], fontSize: t.tooltip.kbdLabel, flexShrink: 0 }} />}
    </div>
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
      onPointerEnter={enterPointer}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={focused}
      onBlur={blurred}
      onKeyDown={keyboard}
      style={css(box, { alignSelf: "flex-start", alignItems: "center", gap: t.space.sm }, partStyle(r, "root", floating ? undefined : { flexDirection: DIRECTION[side] }), style)}
    >
      {floating ? children : showTrigger && <IconButton icon={triggerIcon} label={label} variant="soft" />}
      {shown && (floating ? <div style={css({ position: "absolute", zIndex: t.z.tooltip, width: "max-content" }, FLOAT[side])}>{body}</div> : body)}
    </div>
  );
}
