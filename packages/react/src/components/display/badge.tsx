import type { CSSProperties } from "react";
import { cap, recipes, useStrings, type KitStrings } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, enter, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type BadgeTone = "brand" | "neutral" | "inverse";

export interface BadgeProps extends RootProps<HTMLSpanElement> {
  count?: number;
  /** Above this the badge reads max+. The desktop rail uses 9 to keep its 64px column. */
  max?: number;
  /** A dot instead of a number — activity without a mention. */
  dot?: boolean;
  /** brand (coral) means it needs you; neutral means something is new but nobody asked for you. */
  tone?: BadgeTone;
  /** What the number counts, for the accessible name. */
  label?: string;
  /** The count is of unread things: with no `label`, the name says "3 unread". Off, a bare count is named by its number alone. */
  unread?: boolean;
  /** A change of the count is announced politely. Off by default: a sidebar of badges should not each speak. */
  live?: boolean;
  /** Per-part styles over the theme: `{ root: {…} }`. */
  styles?: PartStyles<"badge">;
  /** Built-in text (the accessible names) for this instance. */
  strings?: Partial<KitStrings["badge"]>;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide (colour, type, the dot's size) is the recipe's. */
const root: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "flex-start",
  flexShrink: 0,
  boxSizing: "border-box",
  height: 18,
  minWidth: 18,
  // Plays once, when the badge mounts: a count that changes swaps its digits without a second pop.
  ...enter("pop"),
};

const dotted: CSSProperties = { minWidth: t.dot.size, paddingInline: 0 };

export function Badge({ count = 0, max = 99, dot = false, tone = "brand", label, unread = false, live = false, styles, strings, style, ...rest }: BadgeProps) {
  const s = useStrings("badge", strings);
  const r = useRecipe(recipes.badge, { variants: { tone, dot }, styles });
  // Zero draws nothing, never an empty pill.
  if (!dot && !(count > 0)) return null;
  return (
    <span
      data-af-part="root"
      role={live ? "status" : "img"}
      aria-label={dot ? s("newActivity") : label ? s("countWithLabel", { count, label }) : unread ? s("countUnread", { count }) : s("count", { count })}
      {...rootProps(rest)}
      style={css(root, partStyle(r, "root", dot && dotted), style)}
    >
      {dot ? null : <span aria-hidden style={{ ...text, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{cap(count, max)}</span>}
    </span>
  );
}
