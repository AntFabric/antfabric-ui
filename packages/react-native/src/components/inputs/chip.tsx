import { cap, recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { createStyles, useTheme } from "../../theme";
import { hitSlopTo } from "../../lib/a11y";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Icon, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";

export type ChipVariant = "filter" | "suggestion" | "object";

export interface ChipProps extends RootProps {
  label: string;
  icon?: IconName;
  /** filter narrows what you are looking at. suggestion is a prompt under the composer. object is a saved thing (a project, a saved search) and is the only chip allowed the brand colour. */
  variant?: ChipVariant;
  /** filter: the chosen filter — ink fill. suggestion: the highlighted prompt, never the brand colour. */
  selected?: boolean;
  /** How many are in there — a quiet number after the label, never a brand-coloured badge. 0 draws nothing. */
  count?: number;
  /** Adds a ✕ with its own label ("Remove From: Sam Lee") as a second target. */
  removable?: boolean;
  /** The ✕ was tapped: the chip is gone. In the app the caller drops the chip from its list on onRemove. */
  removed?: boolean;
  disabled?: boolean;
  /** Called with `selected` as the tap leaves it: flipped. */
  onSelectedChange?: (selected: boolean) => void;
  /** The chip was tapped. Its `selected` changes through `onSelectedChange`. */
  onPress?: () => void;
  onRemove?: () => void;
  /** This chip's built-in text (the ✕'s label, the count in its name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["chip"]>;
  /** Per-part styles over the theme: `{ root: {…}, remove: {…} }`. */
  styles?: PartStyles<"chip">;
  style?: ViewStyle;
}

/** Layout no token decides; the size, fill, edge, ink and type are the recipe's. */
const useStyles = createStyles(() => ({
  root: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
  main: { flexDirection: "row", alignItems: "center", justifyContent: "center", alignSelf: "stretch", minWidth: 0, flexShrink: 1 },
  label: { flexShrink: 1 },
  remove: { alignItems: "center", justifyContent: "center", opacity: 0.7 },
}));

export function Chip({
  label,
  icon = "",
  variant = "filter",
  selected,
  count = 0,
  removable = false,
  removed = false,
  disabled = false,
  onSelectedChange,
  onPress,
  onRemove,
  strings,
  styles,
  style,
  testID,
  ...rest
}: ChipProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("chip", strings);
  const press = usePress({ disabled });
  const x = usePress({ disabled });
  const [on = false, setOn] = useControllable(selected, onSelectedChange);
  const [gone, setGone] = useControllable(removed);
  const pressing = press.pressed || x.pressed;
  // A phone has no hover. A press washes an unchosen chip; a chosen one keeps its fill and only bounces.
  const r = useRecipe(recipes.chip, {
    variants: { variant, removable },
    state: { pressed: pressing && !on, focus: press.focused || x.focused, disabled: press.disabled, on },
    styles,
  });
  const rx = useRecipe(recipes.chip, { variants: { variant }, state: { focus: x.focused, on }, styles });
  if (gone) return null;
  const root = partStyle(r, "root", { view: pressing && { transform: [{ scale: 0.96 }] }, text: [s.label, { lineHeight: (r.root.text.fontSize as number) * 1.2 }] });
  const countStyle = partStyle(r, "count", { text: { fontVariant: ["tabular-nums"] } });
  const ink = r.root.text.color;
  const drawn = r.root.view.height as number | undefined;
  // An icon's size is its width and height (`size`); what else `styles` sets on it goes on the glyph.
  const { width: iconSize, height: _ih, ...iconRest } = r.icon.view;
  const { width: removeSize, height: _rh, ...removeRest } = rx.removeIcon.view;
  return (
    <View testID={partId(testID, "chip", "root")} {...rootProps(rest)} style={[s.root, root.view, drawn ? { height: undefined, minHeight: drawn } : null, style]}>
      <Pressable
        testID={partId(testID, "chip", "main")}
        accessibilityRole={variant === "filter" ? "togglebutton" : "button"}
        accessibilityLabel={count > 0 ? str("labelWithCount", { label, count }) : label}
        accessibilityState={{ disabled: press.disabled, checked: variant === "filter" ? on : undefined }}
        disabled={press.disabled}
        hitSlop={drawn ? hitSlopTo(t.control.hit, drawn) : undefined}
        onPress={() => {
          setOn(!on);
          onPress?.();
        }}
        {...press.handlers}
        style={[s.main, r.main.view]}
      >
        {icon ? <Icon testID={partId(testID, "chip", "icon")} name={icon} size={iconSize as number} color={r.icon.text.color ?? ink} style={Object.keys(iconRest).length ? iconRest : undefined} /> : null}
        <Text numberOfLines={1} maxFontSizeMultiplier={fontScale.control} style={root.text}>
          {label}
        </Text>
        {count > 0 ? (
          <Text testID={partId(testID, "chip", "count")} aria-hidden maxFontSizeMultiplier={fontScale.control} style={[r.root.text, countStyle.view, countStyle.text]}>
            {cap(count, 99)}
          </Text>
        ) : null}
      </Pressable>
      {removable ? (
        <Pressable
          testID={partId(testID, "chip", "remove")}
          accessibilityRole="button"
          accessibilityLabel={str("remove", { label })}
          accessibilityState={{ disabled: x.disabled }}
          disabled={x.disabled}
          hitSlop={hitSlopTo(t.control.hit, removeSize as number, removeSize as number)}
          onPress={() => {
            setGone(true);
            onRemove?.();
          }}
          {...x.handlers}
          style={[s.remove, partStyle(rx, "remove", { view: x.focused && { opacity: 1 } }).view]}
        >
          <Icon testID={partId(testID, "chip", "removeIcon")} name="x" size={removeSize as number} color={rx.removeIcon.text.color ?? ink} style={Object.keys(removeRest).length ? removeRest : undefined} />
        </Pressable>
      ) : null}
    </View>
  );
}
