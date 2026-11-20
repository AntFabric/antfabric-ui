import type { ReactNode } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export type CardLevel = "pane" | "rail" | "inner";
export type CardElevate = "none" | "hairline" | "card" | "raise" | "float";
export type CardTint = "default" | "brand" | "recessed";
export type CardPad = "default" | "none";
export type CardAccent = "none" | "brand" | "success" | "warning" | "danger" | "info";

export interface CardProps extends RootProps {
  /** Whatever the card holds. The card adds the frame and an 8pt gap between direct children; it never styles the content. */
  children?: ReactNode;
  /** Kept for the shared API: a phone card is always radius 16. */
  level?: CardLevel;
  /** Kept for the shared API: phone cards are flat, and the hairline border separates them. */
  elevate?: CardElevate;
  /** brand is a coral-tinted note ("Fabric wrote this"); recessed is a box on white. */
  tint?: CardTint;
  /** The whole card opens something: it scales to 0.99 under the finger. */
  interactive?: boolean;
  /** Accessibility label of the card when interactive, e.g. "Open Checkout revamp". */
  label?: string;
  /** default is the app-wide 12pt inset; none for full-bleed rows. */
  pad?: CardPad;
  /** A 3pt leading colour rail, used sparingly. */
  accent?: CardAccent;
  onPress?: () => void;
  /** Acts on the card instead of opening it (multi-select in Recordings). Also offered as the "Select" accessibility action. */
  onLongPress?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, placeholder: {…}, accent: {…} }`. */
  styles?: PartStyles<"card">;
  /** Built-in text (the long-press action's label) for this instance. */
  strings?: Partial<KitStrings["card"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (fill, edge, radius, inset, the accent's colour) is the recipe's. */
const useStyles = createStyles((t) => ({
  // React Native does not clip on its own: a full-bleed footer would square off past the corners.
  root: { minWidth: 0, overflow: "hidden", padding: t.space.md },
  accent: { position: "absolute", start: 0, top: 0, bottom: 0, width: 3 },
  placeholder: { minHeight: 64, alignSelf: "stretch" },
}));

export function Card({ children, level = "pane", elevate = "hairline", tint = "default", interactive = false, label = "", pad = "default", accent = "none", onPress, onLongPress, styles, strings, style, testID, ...rest }: CardProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("card", strings);
  const press = usePress({ disabled: !interactive });
  const r = useRecipe(recipes.card, { variants: { level, elevate, tint, pad, accent }, state: { focus: interactive && press.focused }, styles });
  const frame = [
    s.root,
    // The rail takes 3pt of the inset.
    partStyle(r, "root", { view: [pad === "none" && { padding: 0 }, accent !== "none" ? { paddingStart: t.space.md + 3 } : null] }).view,
    style,
  ];
  const body = (
    <>
      {accent !== "none" ? <View testID={partId(testID, "card", "accent")} importantForAccessibility="no" style={[s.accent, r.accent.view]} /> : null}
      {typeof children === "string" || typeof children === "number" ? (
        <Text testID={partId(testID, "card", "placeholder")} style={[s.placeholder, r.placeholder.view, r.placeholder.text]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </>
  );
  if (!interactive) return <View testID={partId(testID, "card", "root")} {...rootProps(rest)} style={frame}>{body}</View>;
  return (
    <Pressable
      testID={partId(testID, "card", "root")}
      accessibilityRole="button"
      accessibilityLabel={label || undefined}
      accessibilityActions={onLongPress ? [{ name: "longpress", label: str("select") }] : undefined}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === "longpress" && onLongPress?.()}
      onPress={() => onPress?.()}
      onLongPress={onLongPress ? () => onLongPress() : undefined}
      {...press.handlers}
      {...rootProps(rest)}
      style={[frame, press.pressed && { transform: [{ scale: 0.99 }] }]}
    >
      {body}
    </Pressable>
  );
}
