import { useEffect, useId, useState, type CSSProperties } from "react";
import { cap, recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, pressable, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type ReactionPillVariant = "reaction" | "add";

export interface ReactionPillProps extends RootProps<HTMLDivElement> {
  emoji: string;
  /** How many people reacted. Server-owned; a pill at 0 is removed, never drawn. */
  count?: number;
  /** You are one of the reactors: the soft coral fill and edge. Sets aria-pressed. */
  mine?: boolean;
  /** Who reacted, as one sentence ("You, Priya Raman and Marcus Chen reacted"): the hover card and the accessible name. */
  reactors?: string;
  /** add is the smile-plus pill at the end of a reaction row that opens the emoji picker. */
  variant?: ReactionPillVariant;
  /** Draws the who-reacted card open above the pill, as hovering does. */
  showReactors?: boolean;
  /** The message is still sending or failed: no server id to react to. */
  disabled?: boolean;
  /** Called with `mine` as the press leaves it: flipped (a reaction only). */
  onMineChange?: (mine: boolean) => void;
  /** The pill was pressed: a reaction flips `mine`, add opens the emoji picker. */
  onPress?: () => void;
  /** This pill's built-in text (its accessible name, the add pill's label) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["reaction-pill"]>;
  /** Per-part styles over the theme: `{ root: {…}, pill: {…}, emoji: {…}, count: {…}, card: {…} }`. */
  styles?: PartStyles<"reaction-pill">;
  style?: CSSProperties;
}

/** The app's tooltip delay: the card waits for a resting pointer, so sweeping across a row does not flash cards. */
const HOVER_DELAY = 500;

/** How long the card stays once the pointer has left the pill, to be reached. */
const CLOSE_DELAY = 150;

/** Layout and motion no token decides; the colours, sizes and type are the recipe's (`reactionPill`). */
const root: CSSProperties = { ...box, alignSelf: "flex-start", alignItems: "flex-start" };

const card: CSSProperties = { ...box, width: 240, alignItems: "center", padding: "10px 14px", lineHeight: 1.45, textAlign: "center", ...enter("fade") };

/** Opened by hover or focus rather than the prop, the card floats over the row instead of pushing it down. */
const floating: CSSProperties = { position: "absolute", bottom: `calc(100% + ${t.space.xs})`, left: "50%", transform: "translateX(-50%)", };

const pill: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  paddingInline: 7,
  lineHeight: 1,
  transition: `background ${t.duration.fast} ${t.ease.standard}, border-color ${t.duration.fast}`,
};

export function ReactionPill({
  emoji,
  count = 1,
  mine = false,
  reactors = "",
  variant = "reaction",
  showReactors = false,
  disabled = false,
  onMineChange,
  onPress,
  strings,
  styles,
  style,
  ...rest
}: ReactionPillProps) {
  const s = useStrings("reaction-pill", strings);
  const ui = useInteraction({ disabled });
  const [on, setOn] = useControllable(mine, onMineChange);
  // Uncontrolled, a press moves the count with `mine` (optimistic); controlled, the caller's count is the truth.
  const n = count + (on === mine ? 0 : on ? 1 : -1);
  const [rested, setRested] = useState(false);
  // The card is hoverable (the pointer can move onto it to read it) and Escape dismisses it until the pointer or focus leaves.
  const [overCard, setOverCard] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const cardId = useId();
  const near = ui.hovered || overCard;
  useEffect(() => {
    if (!near) {
      // A beat before it closes, so the pointer can cross the gap to the card.
      const id = setTimeout(() => {
        setRested(false);
        setDismissed(false);
      }, CLOSE_DELAY);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setRested(true), HOVER_DELAY);
    return () => clearTimeout(id);
  }, [near]);
  useEffect(() => {
    if (!ui.focused) setDismissed(false);
  }, [ui.focused]);
  const add = variant === "add";
  const peek = !add && !showReactors && !dismissed && (rested || ui.focused);

  const r = useRecipe(recipes["reaction-pill"], {
    variants: { variant, showReactors },
    state: { on: on && !add, hover: ui.hovered, pressed: ui.pressed, focus: ui.focused, disabled: ui.disabled },
    styles,
  });
  const look = css(pill, partStyle(r, "pill", ui.disabled && { cursor: "not-allowed" }));

  const reactorCard = (
    <div role="tooltip" id={cardId} data-af-part="card" onPointerEnter={() => setOverCard(true)} onPointerLeave={() => setOverCard(false)} style={css(card, partStyle(r, "card", peek && floating))}>
      <span aria-hidden data-af-part="cardEmoji" style={css(text, partStyle(r, "cardEmoji", { fontSize: 26, lineHeight: 1 }))}>
        {emoji}
      </span>
      <span style={css(text, { overflowWrap: "anywhere" })}>{reactors}</span>
    </div>
  );

  return (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && peek) {
          e.stopPropagation();
          setDismissed(true);
          setRested(false);
        }
      }}
      style={css(root, r.root, style)}
    >
      {!add && (showReactors || peek) && reactorCard}
      {!add && n > 0 && (
        <button
          type="button"
          data-af-part="pill"
          data-af-press
          aria-label={s("label", { emoji, count: cap(n, 999), reactors: reactors ? s("reactorsSuffix", { reactors }) : "" }).trim()}
          aria-describedby={peek || showReactors ? cardId : undefined}
          aria-pressed={on}
          disabled={ui.disabled}
          onClick={() => {
            setOn(!on);
            onPress?.();
          }}
          {...ui.handlers}
          style={css(look, enter("pop"))}
        >
          <span aria-hidden data-af-part="emoji" style={css(text, partStyle(r, "emoji", { lineHeight: 1 }))}>
            {emoji}
          </span>
          <span aria-hidden data-af-part="count" style={css(text, partStyle(r, "count", { fontVariantNumeric: "tabular-nums", lineHeight: 1 }))}>
            {cap(n, 999)}
          </span>
        </button>
      )}
      {add && (
        <button
          type="button"
          data-af-part="pill"
          data-af-press
          aria-label={s("add")}
          title={s("add")}
          disabled={ui.disabled}
          onClick={() => onPress?.()}
          {...ui.handlers}
          style={look}
        >
          <Icon part="icon" name="smile-plus" size={r.icon.width} style={r.icon} />
        </button>
      )}
    </div>
  );
}
