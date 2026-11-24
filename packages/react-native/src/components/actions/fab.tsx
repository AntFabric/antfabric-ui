import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Platform, Pressable, View, type ViewStyle } from "react-native";
import { recipes } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { GlassSurface } from "../../lib/glass";
import { Icon, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { reducedMotion } from "../../lib/motion";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export type FabVariant = "ink" | "tint" | "raised";

export interface FabProps extends RootProps {
  /** ink is the inverse-surface disc, a product's primary action. tint is the brand-tint disc, the one prominent action. raised is the card-filled disc with a hairline and the float shadow. */
  variant?: FabVariant;
  icon: IconName;
  /** The accessibility label. Never optional — the disc has no text. */
  label: string;
  /** An image drawn instead of the icon — a brand mark (32pt) on the tint disc. */
  src?: string;
  disabled?: boolean;
  /** A press wiggles the glyph (0.8 s) and `onPress` fires when the wiggle ENDS, because the sheet it opens covers the disc. One pending press at a time; at once under Reduce Motion. */
  wiggle?: boolean;
  onPress?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, disc: {…}, icon: {…} }`. */
  styles?: PartStyles<"fab">;
  style?: ViewStyle;
}

const WIGGLE_MS = 800;

/** Layout no token decides; the size, fill, edge and shadow are the recipe's (ink and tint are flat on the phone: the V2 Figma draws no shadow). */
const useStyles = createStyles((t) => ({
  disc: { alignItems: "center", justifyContent: "center" },
  mark: { width: t.fab.markSize, height: t.fab.markSize },
}));

export function Fab({ variant = "ink", icon, label, src = "", disabled = false, wiggle = false, onPress, styles, style, testID, ...rest }: FabProps) {
  const { t, glass } = useTheme();
  const s = useStyles();
  const press = usePress({ disabled });
  // iOS 26: ink and raised are glass discs with ink glyphs; the tint disc stays tinted, the one prominent action.
  const isGlass = glass && variant !== "tint";
  // A phone has no hover, and a press only scales the disc, so the recipe is read with no pressed fill.
  const r = useRecipe(recipes.fab, { variants: { variant }, state: { focus: press.focused, disabled: press.disabled }, styles });
  const disc = partStyle(r, "disc", { view: s.disc, text: isGlass ? { color: t.color.text.strong } : undefined });
  const ink = disc.text.color;
  // The icon's size is its width and height (`size`); what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _h, ...iconRest } = r.icon.view;
  const iconStyle = Object.keys(iconRest).length ? iconRest : undefined;

  // `wiggle` wiggles the glyph and fires when the wiggle ends; one pending open at a time, cleared on unmount.
  const swing = useRef(new Animated.Value(0)).current;
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pending.current) clearTimeout(pending.current);
    },
    [],
  );
  // Disabled mid-wiggle: the press is dropped and the glyph settles, so a Fab turned off never fires.
  useEffect(() => {
    if (!disabled || !pending.current) return;
    clearTimeout(pending.current);
    pending.current = null;
    swing.stopAnimation();
    swing.setValue(0);
  }, [disabled, swing]);
  const activate = () => {
    if (!wiggle) return onPress?.();
    if (pending.current) return;
    // Read when pressed, so a change in Settings counts at once.
    if (reducedMotion()) return onPress?.();
    swing.setValue(0);
    Animated.timing(swing, { toValue: 1, duration: WIGGLE_MS, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" }).start();
    pending.current = setTimeout(() => {
      pending.current = null;
      onPress?.();
    }, WIGGLE_MS);
  };
  const steps = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const glyph = {
    transform: [
      { translateX: swing.interpolate({ inputRange: steps, outputRange: [0, -1.5, 1.5, -1, 0.5, 0] }) },
      { rotate: swing.interpolate({ inputRange: steps, outputRange: ["0deg", "-14deg", "10deg", "-8deg", "4deg", "0deg"] }) },
    ],
  };

  const Surface = isGlass ? GlassSurface : View;
  // The glass material replaces the disc's fill and edge, and `styles.disc` stays after it.
  const glassOver = isGlass ? styles?.disc : undefined;
  return (
    <Pressable
      testID={partId(testID, "fab", "root")}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: press.disabled }}
      disabled={press.disabled}
      onPress={() => activate()}
      {...press.handlers}
      {...rootProps(rest)}
      style={[partStyle(r, "root", { view: press.pressed && { transform: [{ scale: 0.94 }] } }).view, style]}
    >
      <Surface testID={partId(testID, "fab", "disc")} style={disc.view} glassStyle={glassOver}>
        {src ? (
          <Image source={{ uri: src }} accessibilityIgnoresInvertColors style={s.mark} />
        ) : (
          <Animated.View style={glyph}>
            <Icon testID={partId(testID, "fab", "icon")} name={icon} size={iconSize as number} color={ink} style={iconStyle} />
          </Animated.View>
        )}
      </Surface>
    </Pressable>
  );
}
