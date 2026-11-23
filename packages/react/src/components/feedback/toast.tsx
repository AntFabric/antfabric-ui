import { useEffect, useRef, useState, type CSSProperties } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { focusNear } from "../../lib/focus";
import { announce } from "../../lib/announce";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, pressable, row, text, truncate } from "../../lib/style";

export type ToastTone = "success" | "error" | "info";

export interface ToastProps extends RootProps<HTMLDivElement> {
  /** Past tense for a confirmation, imperative for a fixable refusal. Never an identifier, a code or a path. */
  message: string;
  /** success: a tick on the brand disc. error: an exclamation on the danger disc, announced assertively. info: a neutral mark. */
  tone?: ToastTone;
  /** One verb, usually Undo. With an action, Dismiss shrinks to a ×. */
  actionLabel?: string;
  /** Gone: the pill fades back down. Dismiss, the × and the action set it; the app unmounts the toast on onDismiss. */
  dismissed?: boolean;
  /** Draws Dismiss (or the × beside an action). Off for a progress toast. */
  dismissible?: boolean;
  /** How long it stays, in milliseconds, before it dismisses itself. `0` keeps it until it is dismissed. The clock stops while the pointer is on it or focus is inside it. */
  duration?: number;
  onAction?: () => void;
  onDismiss?: () => void;
  /** Called with `true` when the pointer or focus enters the toast and `false` when both have left, so an app that keeps its own timer can pause it. */
  onPauseChange?: (paused: boolean) => void;
  /** Per-part styles over the theme: `{ root: {…}, message: {…} }`. */
  styles?: PartStyles<"toast">;
  /** This toast's built-in text (Dismiss) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["toast"]>;
  style?: CSSProperties;
}

/** A chip mixed from the toast's own ink, so it survives the inverse surface turning light in dark themes. */
const ink = (pct: number) => `color-mix(in srgb, ${t.fg.onInverse} ${pct}%, transparent)`;
const ring = `0 0 0 2px ${t.fg.onInverse}`;

/** The layout and the motion no token decides; what the tokens decide (fill, ink, type, shadow, insets) is the recipe's. */
const pill: CSSProperties = {
  ...row,
  paddingBlock: 11,
  borderRadius: 13,
  transition: `opacity ${t.duration.base}, transform ${t.duration.base} ${t.ease.out}`,
};

/** The info mark's fill is the pill's ink, mixed: a `color-mix`, which the recipe cannot say. */
const MARK: Partial<Record<ToastTone, CSSProperties>> = { info: { background: ink(12) } };

const mark: CSSProperties = { ...box, width: 20, height: 20, flexShrink: 0, alignItems: "center", justifyContent: "center" };

const message: CSSProperties = { ...text, ...truncate(2), flexShrink: 1 };

const chip: CSSProperties = { ...pressable, flexShrink: 0, paddingBlock: 5, borderRadius: 8, background: ink(12) };
const chipText: CSSProperties = { ...text, whiteSpace: "nowrap" };

/** Undo or Dismiss: a word on a chip of the toast's ink. */
function Chip({ label, onPress, styles }: { label: string; onPress: () => void; styles?: PartStyles<"toast"> }) {
  const ui = useInteraction();
  const r = useRecipe(recipes.toast, { styles });
  return (
    <button data-af-part="action" type="button" data-af-press onClick={() => onPress()} {...ui.handlers} style={css(chip, partStyle(r, "action", (ui.hovered || ui.pressed) && { background: ink(20) }, ui.focused && { boxShadow: ring }))}>
      <span data-af-part="actionText" style={css(chipText, r.actionText)}>{label}</span>
    </button>
  );
}

const close: CSSProperties = { ...pressable, flexShrink: 0, alignItems: "center", justifyContent: "center", opacity: 0.8 };

/** The × that Dismiss shrinks to beside an action. */
function Close({ label, onPress, styles }: { label: string; onPress: () => void; styles?: PartStyles<"toast"> }) {
  const ui = useInteraction();
  const r = useRecipe(recipes.toast, { styles });
  return (
    <button
      data-af-part="close"
      type="button"
      data-af-press
      aria-label={label}
      title={label}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(close, partStyle(r, "close", (ui.hovered || ui.pressed) && { background: ink(12), opacity: 1 }, ui.focused && { boxShadow: ring }))}
    >
      <Icon part="closeIcon" name="x" style={r.closeIcon} />
    </button>
  );
}

export function Toast({ message: words, tone = "success", actionLabel = "", dismissed = false, dismissible = true, duration = 0, onAction, onDismiss, onPauseChange, styles, strings, style, ...rest }: ToastProps) {
  const s = useStrings("toast", strings);
  // The toast leaves by itself once pressed; the app hears about it and unmounts it.
  const [gone, setGone] = useControllable(dismissed);
  const r = useRecipe(recipes.toast, { variants: { tone }, styles });
  // A dismissal from the keyboard hands focus to the nearest control that stays: the pill goes inert at once, and the app unmounts it.
  const card = useRef<HTMLDivElement>(null);
  const dismiss = () => {
    focusNear(card.current);
    setGone(true);
    onDismiss?.();
  };
  // The pointer or focus on the toast stops its clock (WCAG 2.2.1): a keyboard user can reach Undo before it leaves.
  const [hovered, setHovered] = useState(false);
  const [within, setWithin] = useState(false);
  const paused = hovered || within;
  const left = useRef(duration);
  const since = useRef(0);
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;
  useEffect(() => {
    left.current = duration;
  }, [duration, words]);
  useEffect(() => {
    if (!duration || gone || paused) return;
    since.current = Date.now();
    const id = setTimeout(() => dismissRef.current(), left.current);
    return () => {
      clearTimeout(id);
      left.current = Math.max(0, left.current - (Date.now() - since.current));
    };
  }, [duration, gone, paused]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onPauseChange?.(paused);
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps
  // A live region that arrives holding its text is not read, so the message goes through the page's announcer.
  useEffect(() => {
    if (!gone) announce(words, tone === "error" ? "assertive" : "polite");
  }, [words, tone]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div {...rootProps(rest)} style={css(box, { alignSelf: "center", maxWidth: 520 }, style)}>
      <div
        ref={card}
        data-af-part="root"
        aria-hidden={gone || undefined}
        inert={gone || undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setWithin(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setWithin(false)}
        style={css(pill, partStyle(r, "root", gone ? { opacity: 0, transform: "translateY(8px)", pointerEvents: "none" } : enter("rise")))}
      >
        <span aria-hidden data-af-part="mark" style={css(mark, partStyle(r, "mark", MARK[tone]))}>
          {tone === "error" ? (
            <span data-af-part="markBang" style={css(text, { lineHeight: 1 }, r.markBang)}>!</span>
          ) : (
            <Icon part="markIcon" name={tone === "success" ? "check" : "info"} style={partStyle(r, "markIcon", { strokeWidth: 3 })} />
          )}
        </span>
        <span data-af-part="message" style={css(message, r.message)}>{words}</span>
        {actionLabel && (
          <Chip
            label={actionLabel}
            styles={styles}
            onPress={() => {
              // The action puts the toast away too: it is reported as a dismissal, so the app unmounts it and frees its slot.
              focusNear(card.current);
              setGone(true);
              onAction?.();
              onDismiss?.();
            }}
          />
        )}
        {dismissible && !actionLabel && <Chip label={s("dismiss")} styles={styles} onPress={dismiss} />}
        {dismissible && actionLabel && <Close label={s("dismiss")} styles={styles} onPress={dismiss} />}
      </div>
    </div>
  );
}
