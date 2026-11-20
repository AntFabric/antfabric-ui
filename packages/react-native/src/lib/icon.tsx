import * as lucide from "lucide-react-native";
import type { ComponentType } from "react";
import { ActivityIndicator, Platform, View, type ViewStyle } from "react-native";
import { pascal } from "@antfabric-ui/core";
import { useTheme } from "../theme";

/** A lucide icon name in kebab case: `"trash-2"`, `"chevron-right"`. The same names as the React kit. */
export type IconName = string;

type Glyph = ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: ViewStyle; testID?: string; "data-testid"?: string }>;

/**
 * Looked up among the package's exports, not its `icons` subpath: lucide v1 renamed some icons
 * (`trash-2` is now `trash`) and keeps the old names only as alias exports.
 */
const glyph = (name: string): Glyph | null => {
  const g = (lucide as unknown as Record<string, unknown>)[pascal(name)];
  return g && typeof g === "object" && "$$typeof" in g ? (g as Glyph) : null;
};

export interface IconProps {
  name: IconName;
  /** Points. Defaults to the phone's medium icon. */
  size?: number;
  /** Required in practice: React Native has no inherited text colour, so an icon does not pick one up. */
  color?: string;
  /** Defaults to the phone's weight (1.5). Small glyphs on a fill (a tick in a box) are drawn heavier. */
  strokeWidth?: number;
  /** The recipe part this icon draws (`<id>.<part>`), when it is one. */
  testID?: string;
  style?: ViewStyle;
}

/** A lucide icon by name, stroked at the phone's weight (1.5). */
export function Icon({ name, size, color, strokeWidth, testID, style }: IconProps) {
  const { t } = useTheme();
  const s = size ?? t.icon.size;
  const Glyph = glyph(name);
  if (!Glyph) return <View testID={`missing-icon:${name}`} style={[{ width: s, height: s }, style]} />;
  // In the catalogue (React Native Web) the glyph is a DOM <svg>, which takes `data-testid` and rejects `testID`.
  return <Glyph size={s} color={color ?? t.fg.body} strokeWidth={strokeWidth ?? t.icon.stroke} style={style} {...(Platform.OS === "web" ? { "data-testid": testID } : { testID })} />;
}

/**
 * The platform's own activity indicator, in a box the size of an icon so swapping one for the other does not move the label. Inside a
 * control that already says it is busy, `decorative` hides it from VoiceOver and TalkBack.
 */
export function Spinner({ size, color, label = "Loading", decorative = false, testID, style }: { size?: number; color?: string; label?: string; decorative?: boolean; testID?: string; style?: ViewStyle }) {
  const { t } = useTheme();
  const s = size ?? t.icon.size;
  const a11y = decorative ? { accessible: false, importantForAccessibility: "no-hide-descendants" as const } : { accessibilityRole: "progressbar" as const, accessibilityLabel: label };
  return (
    <View {...a11y} testID={testID} style={[{ width: s, height: s, alignItems: "center", justifyContent: "center" }, style]}>
      <ActivityIndicator size="small" color={color ?? t.fg.muted} style={s < 20 ? { transform: [{ scale: s / 20 }] } : undefined} />
    </View>
  );
}
