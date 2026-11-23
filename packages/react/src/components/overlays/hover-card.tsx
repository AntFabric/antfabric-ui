import { useEffect, useId, useRef, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { MOTION, recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { isComposing } from "../../lib/keys";
import { useLayerStack } from "../../lib/layer";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, pressable, row, rtl, text, truncate } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";
import { Avatar, type AvatarIdentity } from "../display/avatar";

export type HoverCardPresence = "active" | "away" | "offline" | "unknown";
export type HoverCardPlacement = "down" | "up";

export interface HoverCardProps extends RootProps<HTMLDivElement> {
  name: string;
  /** Photo URL; initials while it loads or when it fails. */
  src?: string;
  identity?: AvatarIdentity;
  /** Their role, e.g. "Staff Engineer · Platform". */
  title?: string;
  /** unknown draws no presence at all (a guest from another workspace). */
  presence?: HoverCardPresence;
  /** Their local time, e.g. "4:12 pm local time". Empty draws none. */
  localTime?: string;
  statusEmoji?: string;
  /** Their own status. Empty draws no line at all, not a placeholder. */
  statusText?: string;
  statusUntil?: string;
  /** An AI agent: "Agent" instead of a presence, and no View profile. */
  agent?: boolean;
  /** From outside the workspace: a Guest tag after the name. */
  guest?: boolean;
  /** Your own card: Message becomes Message yourself. */
  self?: boolean;
  /** A deleted account: "Deleted user" in the neutral ink, no presence, status, time or Message. */
  deleted?: boolean;
  /** down hangs the card under the trigger; up is for a trigger near the bottom of the window. */
  placement?: HoverCardPlacement;
  /** With no `children`: draws the name it hangs from. */
  showTrigger?: boolean;
  /** What the card hangs from (a name, an avatar, an @mention). The card floats beside it, opens on its hover (after a short rest) and keyboard focus, closes on Esc, blur and leave, and the trigger is `aria-describedby` it. */
  children?: ReactNode;
  /** The card is showing. Hover and focus change it; set it to draw the card open. */
  open?: boolean;
  /** The card opened or closed, from hover, focus, Esc or leaving. */
  onOpenChange?: (open: boolean) => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  /** Esc closed the card. */
  onClose?: () => void;
  /** Per-part styles over the theme: `{ panel: {…}, name: {…}, dot: {…} }`. */
  styles?: PartStyles<"hover-card">;
  /** This card's built-in text (the presence words, the buttons) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["hover-card"]>;
  style?: CSSProperties;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const panelLook: CSSProperties = { ...box, textAlign: "left", cursor: "default" };

/** The rest before hover opens the card: the motion tokens' `drop`, 360 ms, so a tooltip (320 ms) on the same control arrives first. Focus opens it at once. */
const REST = MOTION.drop.duration;

const TARGET = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]';

function Trigger({ name, src, identity, agent, panel, styles, onPress }: { name: string; src: string; identity: AvatarIdentity; agent: boolean; panel?: string; styles?: PartStyles<"hover-card">; onPress: () => void }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["hover-card"], { state: { focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="trigger"
      data-af-press
      aria-label={name}
      aria-describedby={panel}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, row, { gap: t.space.xs, alignSelf: "flex-start" }, r.trigger)}
    >
      <Avatar decorative name={name} src={src} identity={identity} size="sm" agent={agent} />
      <span data-af-part="triggerName" style={css(text, r.triggerName)}>{name}</span>
    </button>
  );
}

export function HoverCard({
  name,
  src = "",
  identity = "indigo",
  title = "",
  presence = "active",
  localTime = "",
  statusEmoji = "",
  statusText = "",
  statusUntil = "",
  agent = false,
  guest = false,
  self = false,
  deleted = false,
  placement = "down",
  showTrigger = true,
  children,
  open,
  onOpenChange,
  onMessage,
  onViewProfile,
  onClose,
  styles,
  strings,
  style,
  ref,
  ...rest
}: HoverCardProps) {
  const s = useStrings("hover-card", strings);
  const dir = useDirection();
  const panel = useId();
  const [isOpen = false, setIsOpen] = useControllable(open, onOpenChange);
  const host = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const floating = children !== undefined && children !== null && children !== false;
  const show = (now: boolean) => {
    clearTimeout(timer.current);
    if (now) setIsOpen(true);
    else timer.current = setTimeout(() => setIsOpen(true), REST);
  };
  const hide = () => {
    clearTimeout(timer.current);
    if (isOpen) setIsOpen(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  // The trigger: yours (`children`), or the kit's name button. Outside the card.
  const trigger = () => Array.from(host.current?.querySelectorAll<HTMLElement>(TARGET) ?? []).find((n) => !n.closest('[data-af-part="panel"]'));
  // Your own trigger is described by the card while it is open.
  useEffect(() => {
    if (!floating || !isOpen) return;
    const el = trigger();
    if (!el) return;
    const had = el.getAttribute("aria-describedby");
    el.setAttribute("aria-describedby", [had, panel].filter(Boolean).join(" "));
    return () => {
      if (had) el.setAttribute("aria-describedby", had);
      else el.removeAttribute("aria-describedby");
    };
  }, [floating, isOpen, panel]);
  const r = useRecipe(recipes["hover-card"], { variants: { presence, agent }, styles });
  const shown = deleted ? s("deletedUser") : name;
  const ink: AvatarIdentity = deleted ? "ink" : identity;
  const hasPresence = agent || presence !== "unknown";
  const status = [statusEmoji, statusText].filter(Boolean).join(" ") + (statusUntil ? ` · ${statusUntil}` : "");
  // Esc closes an open card and stops there, so the dialog or panel behind stays open: from inside it, and from anywhere while it is the
  // top layer (one opened by hover). A closed card leaves the key alone.
  // Closed with focus inside the card (Esc on its Message button), focus goes back to the trigger rather than to the page. Focusing the
  // trigger from the keyboard would open the card again: `returning` keeps it closed.
  const returning = useRef(false);
  const close = () => {
    const back = host.current?.querySelector('[data-af-part="panel"]')?.contains(document.activeElement) ? trigger() : undefined;
    hide();
    onClose?.();
    if (!back) return;
    returning.current = true;
    back.focus({ preventScroll: true });
    returning.current = false;
  };
  useLayerStack(isOpen, () => [host.current], { onEscape: close });
  const keyboard = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !isOpen || e.defaultPrevented || isComposing(e)) return;
    e.preventDefault();
    e.stopPropagation();
    close();
  };
  const enterPointer = (e: PointerEvent) => {
    // Only where hover exists: a tap on a phone or a tablet never flashes one.
    if (e.pointerType === "touch" || (typeof matchMedia === "function" && !matchMedia("(hover: hover)").matches)) return;
    show(false);
  };
  const focused = (e: FocusEvent) => {
    if (!returning.current && (e.target as HTMLElement).matches?.(":focus-visible")) show(true);
  };
  const blurred = (e: FocusEvent) => {
    if (!host.current?.contains(e.relatedTarget as Node | null)) hide();
  };
  return (
    <div
      ref={(el) => {
        host.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      data-af-part="root"
      {...rootProps(rest)}
      onKeyDown={keyboard}
      onPointerEnter={enterPointer}
      onPointerLeave={hide}
      onFocus={focused}
      onBlur={blurred}
      style={css(box, { alignSelf: "flex-start", alignItems: "flex-start", flexDirection: placement === "up" ? "column-reverse" : "column" }, r.root, style)}
    >
      {floating ? children : showTrigger && <Trigger name={shown} src={src} identity={ink} agent={agent} panel={isOpen ? panel : undefined} styles={styles} onPress={() => onViewProfile?.()} />}
      {isOpen && (
      <div
        style={css(
          box,
          { alignSelf: "stretch" },
          placement === "up" ? { paddingBottom: t.space.xs } : { paddingTop: t.space.xs },
          floating && { position: "absolute", zIndex: t.z.popover, width: "max-content", [placement === "up" ? "bottom" : "top"]: "100%", left: 0 },
        )}
      >
        <div id={panel} role="group" aria-label={shown} data-af-part="panel" style={css(rtl(panelLook, dir), partStyle(r, "panel", enter("pop"), placement === "up" && { transformOrigin: "bottom center" }))}>
          <div data-af-part="header" style={css(row, r.header)}>
            <Avatar decorative name={name} src={src} identity={ink} size="lg" agent={agent} style={{ width: t.hoverCard.avatar, height: t.hoverCard.avatar, fontSize: t.text.body, fontWeight: t.font.weightBold }} />
            <div style={css(box, { flex: 1 })}>
              <div style={css(row, { gap: t.space.xs })}>
                <h3 data-af-part="name" style={css(text, truncate(1), { flexShrink: 1 }, r.name)}>{shown}</h3>
                {guest && !deleted && (
                  <span data-af-part="guest" style={css(box, { flexShrink: 0, justifyContent: "center", lineHeight: 1 }, r.guest)}>
                    {s("guest")}
                  </span>
                )}
              </div>
              {title && !deleted && (
                <span data-af-part="title" style={css(text, truncate(1), r.title)}>{title}</span>
              )}
            </div>
          </div>
          {!deleted && (hasPresence || localTime) && (
            <div data-af-part="meta" style={css(row, { gap: t.space.xs, marginTop: t.space.smMd }, r.meta)}>
              {hasPresence && (
                <span
                  aria-hidden
                  data-af-part="dot"
                  style={css(
                    { flexShrink: 0, boxSizing: "border-box" },
                    (presence === "away" || presence === "offline") && { borderWidth: "1.5px", borderStyle: "solid" },
                    agent && { border: 0 },
                    r.dot,
                  )}
                />
              )}
              {hasPresence && <span style={{ whiteSpace: "nowrap" }}>{agent ? s("agent") : presence === "away" ? s("away") : presence === "offline" ? s("offline") : s("active")}</span>}
              {localTime && !agent && presence !== "unknown" && (
                <span aria-hidden data-af-part="separator" style={r.separator}>
                  ·
                </span>
              )}
              {localTime && !agent && <span style={css(text, truncate(1))}>{localTime}</span>}
            </div>
          )}
          {statusText && !deleted && (
            <span data-af-part="status" style={css(text, truncate(2), { marginTop: t.space.smMd }, r.status)}>{status}</span>
          )}
          <div style={css(row, { gap: t.space.sm, marginTop: t.space.md })}>
            {!deleted && <Button label={self ? s("messageSelf") : s("message")} variant="secondary" size="sm" onPress={() => onMessage?.()} style={{ flex: 1, minWidth: 0 }} />}
            {!agent && <Button label={s("viewProfile")} variant="secondary" size="sm" onPress={() => onViewProfile?.()} style={{ flex: 1, minWidth: 0 }} />}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
