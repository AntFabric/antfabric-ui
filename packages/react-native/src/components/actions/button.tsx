import { useEffect } from "react";
import { Pressable, Text, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { announce, hitSlopTo } from "../../lib/a11y";
import { Icon, Spinner, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "ink" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends RootProps {
  label: string;
  /** primary is the brand fill — one per view. danger is for an action that cannot be undone. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: IconName;
  iconTrailing?: IconName;
  /** Shows a spinner in place of the leading icon and blocks presses. The label stays, so the width does not change. */
  loading?: boolean;
  disabled?: boolean;
  /** Stretches to its container. The default on sheets and forms. */
  full?: boolean;
  onPress?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…} }`. */
  styles?: PartStyles<"button">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["button"]>;
  style?: ViewStyle;
}

const useStyles = createStyles(() => ({
  root: { flexDirection: "row", alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  full: { alignSelf: "stretch", width: "100%" },
}));

export function Button({ label, variant = "primary", size = "md", iconLeading, iconTrailing, loading = false, disabled = false, full = false, onPress, styles, strings, style, testID, ...rest }: ButtonProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("button", strings);
  const press = usePress({ disabled: disabled || loading });
  // A phone has no hover, so there is none here. A loading button is blocked but not greyed: the spinner already says why.
  const r = useRecipe(recipes.button, { variants: { variant, size }, state: { pressed: press.pressed, focus: press.focused, disabled: press.disabled && !loading }, styles });
  const root = partStyle(r, "root", { view: [full && s.full, press.pressed && { transform: [{ scale: 0.97 }] }], text: { lineHeight: (r.root.text.fontSize as number) * 1.2 } });
  const ink = root.text.color;
  // The wait is said once, when it starts (iOS has no live regions); the spinner is hidden, as the button's state carries it.
  const loadingSaid = str("loading");
  useEffect(() => {
    if (loading) announce(loadingSaid);
  }, [loading, loadingSaid]);
  // The drawn height is a floor, so a label grown by Dynamic Type fits; the touch area reaches 44pt without drawing more.
  const drawn = root.view.height as number | undefined;
  // The icon's size is its width and height (`size`); what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _h, ...iconRest } = r.icon.view;
  const iconStyle = Object.keys(iconRest).length ? iconRest : undefined;
  const iconInk = r.icon.text.color ?? ink;
  return (
    <Pressable
      testID={partId(testID, "button", "root")}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: press.disabled, busy: loading }}
      hitSlop={drawn ? hitSlopTo(t.size.target.min, drawn) : undefined}
      disabled={press.disabled}
      onPress={() => onPress?.()}
      {...press.handlers}
      {...rootProps(rest)}
      style={[s.root, root.view, drawn ? { height: undefined, minHeight: drawn } : null, style]}
    >
      {loading ? <Spinner testID={partId(testID, "button", "spinner")} decorative size={r.spinner.view.width as number} color={r.spinner.text.color ?? ink} style={r.spinner.view} /> : null}
      {iconLeading && !loading ? <Icon testID={partId(testID, "button", "icon")} name={iconLeading} size={iconSize as number} color={iconInk} style={iconStyle} /> : null}
      <Text numberOfLines={1} maxFontSizeMultiplier={fontScale.control} style={root.text}>
        {label}
      </Text>
      {iconTrailing ? <Icon testID={partId(testID, "button", "icon")} name={iconTrailing} size={iconSize as number} color={iconInk} style={iconStyle} /> : null}
    </Pressable>
  );
}
