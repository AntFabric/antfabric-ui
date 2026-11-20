import { Text, type ViewStyle } from "react-native";
import { cap, recipes, useStrings, type KitStrings } from "@antfabric-ui/core";
import { createStyles } from "../../theme";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export type BadgeTone = "brand" | "neutral" | "inverse";

export interface BadgeProps extends RootProps {
  count?: number;
  /** Above this the badge reads max+. */
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
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (colour, type, the dot's size) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", alignItems: "center", justifyContent: "center", alignSelf: "flex-start", height: 20, minWidth: 20 },
  dot: { minWidth: t.dot.size, paddingHorizontal: 0 },
  count: { lineHeight: 12, fontVariant: ["tabular-nums"] },
}));

export function Badge({ count = 0, max = 99, dot = false, tone = "brand", label, unread = false, live = false, styles, strings, style, testID, ...rest }: BadgeProps) {
  const s = useStyles();
  const str = useStrings("badge", strings);
  const r = useRecipe(recipes.badge, { variants: { tone, dot }, styles });
  // Zero draws nothing, never an empty pill.
  if (!dot && !(count > 0)) return null;
  return (
    // Pops once, on mount: a count that changes swaps its digits without a second pop.
    <Enter
      testID={partId(testID, "badge", "root")}
      motion="pop"
      accessible
      accessibilityRole="text"
      accessibilityLabel={dot ? str("newActivity") : label ? str("countWithLabel", { count, label }) : unread ? str("countUnread", { count }) : str("count", { count })}
      accessibilityLiveRegion={live ? "polite" : undefined}
      {...rootProps(rest)}
      style={[s.root, partStyle(r, "root", { view: dot && s.dot }).view, style]}
    >
      {dot ? null : <Text style={[s.count, r.root.text]}>{cap(count, max)}</Text>}
    </Enter>
  );
}
