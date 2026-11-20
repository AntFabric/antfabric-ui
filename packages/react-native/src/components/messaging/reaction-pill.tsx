import { Pressable, Text, View, type ViewStyle } from "react-native";
import { cap, recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon } from "../../lib/icon";
import { hitSlopTo } from "../../lib/a11y";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";

export type ReactionPillVariant = "reaction" | "add";

export interface ReactionPillProps extends RootProps {
  emoji: string;
  /** How many people reacted. Server-owned; a pill at 0 is removed, never drawn. */
  count?: number;
  /** You are one of the reactors: the soft coral fill and edge. Sets accessibilityState.selected. */
  mine?: boolean;
  /** Who reacted, as one sentence. On a phone it is the Reactions sheet's job; kept for the same API. */
  reactors?: string;
  /** add is the smile-plus pill at the end of a reaction row that opens the emoji picker. */
  variant?: ReactionPillVariant;
  /** The message is still sending or failed: no server id to react to. */
  disabled?: boolean;
  /** Called with `mine` as the tap leaves it: flipped (a reaction only). */
  onMineChange?: (mine: boolean) => void;
  /** The pill was tapped: a reaction flips `mine`, add opens the emoji picker. */
  onPress?: () => void;
  /** Opens the Reactions sheet: who reacted, per emoji. */
  onLongPress?: () => void;
  /** This pill's built-in text (its accessible name, the add pill's label) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["reaction-pill"]>;
  /** Per-part styles over the theme: `{ root: {…}, pill: {…}, emoji: {…}, count: {…} }`. */
  styles?: PartStyles<"reaction-pill">;
  style?: ViewStyle;
}

/** Layout no token decides; the colours, sizes and type are the recipe's (`reactionPill`). */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "flex-start", alignItems: "flex-start" },
  // A minimum, so a larger Dynamic Type size grows the pill instead of clipping its emoji.
  pill: { flexDirection: "row", alignItems: "center", minHeight: t.control.hIconSm },
  count: { fontVariant: ["tabular-nums"] },
}));

export function ReactionPill({ emoji, count = 1, mine = false, variant = "reaction", disabled = false, onMineChange, onPress, onLongPress, strings, styles, style, testID, ...rest }: ReactionPillProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("reaction-pill", strings);
  const press = usePress({ disabled });
  const [on, setOn] = useControllable(mine, onMineChange);
  // Uncontrolled, a tap moves the count with `mine` (optimistic); controlled, the caller's count is the truth.
  const n = count + (on === mine ? 0 : on ? 1 : -1);
  const add = variant === "add";
  const r = useRecipe(recipes["reaction-pill"], { variants: { variant }, state: { on: on && !add, pressed: press.pressed, focus: press.focused, disabled: press.disabled }, styles });
  // One 14pt run in the body colour whoever reacted; yours is told by the fill and edge.
  const ink = r.pill.text.color;
  const pill = partStyle(r, "pill", { view: press.pressed ? { opacity: 0.85 } : undefined });
  const box = [s.pill, pill.view];
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: iconSize, height: _iconHeight, ...iconRest } = r.icon.view;

  return (
    <View testID={partId(testID, "reaction-pill", "root")} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
      {!add && n > 0 ? (
        <Enter motion="pop">
          <Pressable
            testID={partId(testID, "reaction-pill", "pill")}
            hitSlop={hitSlopTo(t.control.hit, t.control.hIconSm, 0)}
            accessibilityRole="button"
            accessibilityLabel={str("labelPhone", { emoji, count: n, mine: on ? str("youReacted") : "" })}
            accessibilityState={{ disabled: press.disabled, selected: on }}
            disabled={press.disabled}
            onPress={() => {
              setOn(!on);
              onPress?.();
            }}
            onLongPress={() => onLongPress?.()}
            {...press.handlers}
            style={box}
          >
            <Text testID={partId(testID, "reaction-pill", "emoji")} maxFontSizeMultiplier={fontScale.chrome} style={[pill.text, r.emoji.view, r.emoji.text]}>
              {emoji}
            </Text>
            <Text testID={partId(testID, "reaction-pill", "count")} maxFontSizeMultiplier={fontScale.chrome} style={[pill.text, s.count, r.count.view, r.count.text]}>
              {cap(n, 999)}
            </Text>
          </Pressable>
        </Enter>
      ) : null}
      {add ? (
        <Pressable
          testID={partId(testID, "reaction-pill", "pill")}
          hitSlop={hitSlopTo(t.control.hit, t.control.hIconSm, t.control.hIconSm)}
          accessibilityRole="button"
          accessibilityLabel={str("add")}
          accessibilityState={{ disabled: press.disabled }}
          disabled={press.disabled}
          onPress={() => onPress?.()}
          {...press.handlers}
          style={box}
        >
          <Icon testID={partId(testID, "reaction-pill", "icon")} name="smile-plus" size={iconSize as number} color={ink} style={Object.keys(iconRest).length ? iconRest : undefined} />
        </Pressable>
      ) : null}
    </View>
  );
}
