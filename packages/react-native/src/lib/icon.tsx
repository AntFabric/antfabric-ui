import type { ComponentType } from "react";
import { ActivityIndicator, Platform, View, type ViewStyle } from "react-native";
import type { IconName } from "@antfabric/ui-core";
import { useTheme } from "../theme";
import { iconFor } from "./icons";

/** A lucide icon name in kebab case (`"trash-2"`, `"chevron-right"`), the same names as the React kit, or the icon component itself (`Trash2` from `lucide-react-native`). */
export type { IconComponent, IconName } from "@antfabric/ui-core";

type Glyph = ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: ViewStyle; testID?: string; "data-testid"?: string }>;

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

/**
 * A lucide icon by name or as a component, stroked at the phone's weight (1.5). A name is drawn from the kit's registry (the icons the kit
 * draws itself, and whatever the app adds with `registerIcons`); a name nobody registered draws an empty box of the icon's size.
 */
export function Icon({ name, size, color, strokeWidth, testID, style }: IconProps) {
  const { t } = useTheme();
  const s = size ?? t.size.icon.default;
  const Glyph = (typeof name === "string" ? iconFor(name) : name) as Glyph | null;
  if (!Glyph) return <View testID={`missing-icon:${name as string}`} style={[{ width: s, height: s }, style]} />;
  // In the catalogue (React Native Web) the glyph is a DOM <svg>, which takes `data-testid` and rejects `testID`.
  return <Glyph size={s} color={color ?? t.color.text.body} strokeWidth={strokeWidth ?? t.size.stroke.default} style={style} {...(Platform.OS === "web" ? { "data-testid": testID } : { testID })} />;
}

/**
 * The platform's own activity indicator, in a box the size of an icon so swapping one for the other does not move the label. Inside a
 * control that already says it is busy, `decorative` hides it from VoiceOver and TalkBack.
 */
export function Spinner({ size, color, label = "Loading", decorative = false, testID, style }: { size?: number; color?: string; label?: string; decorative?: boolean; testID?: string; style?: ViewStyle }) {
  const { t } = useTheme();
  const s = size ?? t.size.icon.default;
  const a11y = decorative ? { accessible: false, importantForAccessibility: "no-hide-descendants" as const } : { accessibilityRole: "progressbar" as const, accessibilityLabel: label };
  return (
    <View {...a11y} testID={testID} style={[{ width: s, height: s, alignItems: "center", justifyContent: "center" }, style]}>
      <ActivityIndicator size="small" color={color ?? t.color.text.muted} style={s < 20 ? { transform: [{ scale: s / 20 }] } : undefined} />
    </View>
  );
}
