import type { ComponentType, ReactNode } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { NativeTokens } from "@antfabric-ui/core";
import { useTheme } from "../theme";

/**
 * iOS 26's Liquid Glass. On an iPhone it is the system material, through expo-glass-effect's
 * GlassView, which follows the device's Clear / Tinted, Reduce Transparency and Increase Contrast
 * settings by itself. The package is optional: without it, and everywhere glass is off, the surface
 * keeps the style it was given.
 */
let GlassView: ComponentType<{ glassEffectStyle?: "regular" | "clear"; style?: StyleProp<ViewStyle>; testID?: string; children?: ReactNode }> | null = null;
if (Platform.OS === "ios") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    GlassView = require("expo-glass-effect").GlassView;
  } catch {
    GlassView = null;
  }
}

/** The look of glass where the system material is not available: in the catalogue, and on iOS without expo-glass-effect. */
export function glassFallback(t: NativeTokens, clear = false): ViewStyle {
  return {
    backgroundColor: clear ? t.glass.clear : t.glass.bg,
    borderColor: "transparent",
    boxShadow: t.shadow.glass,
    ...(Platform.OS === "web" ? ({ backdropFilter: `blur(${t.glass.blur}px) saturate(${t.glass.saturate})` } as ViewStyle) : null),
  };
}

export interface GlassSurfaceProps {
  /** The surface's own look, used whenever glass is off. */
  style?: StyleProp<ViewStyle>;
  /**
   * The style that replaces it under glass: usually shape and padding only, the material does the rest. It comes after the material, so a
   * caller's per-part `styles` passed here (a background, a border, a shadow) win over it, on the fallback and on the system's glass.
   */
  glassStyle?: StyleProp<ViewStyle>;
  clear?: boolean;
  /** The recipe part this surface draws (`<id>.<part>`), when it is one. */
  testID?: string;
  children?: ReactNode;
}

/** A View that becomes Liquid Glass on iOS 26+. */
export function GlassSurface({ style, glassStyle, clear, testID, children }: GlassSurfaceProps) {
  const { glass, t } = useTheme();
  if (!glass) return <View testID={testID} style={style}>{children}</View>;
  if (GlassView) {
    // The system's material replaces the fill and the shadow, unless the caller set its own.
    const own = StyleSheet.flatten(glassStyle) ?? {};
    const material: ViewStyle = { backgroundColor: own.backgroundColor ?? "transparent", boxShadow: own.boxShadow };
    return (
      <GlassView testID={testID} glassEffectStyle={clear ? "clear" : "regular"} style={[style, glassStyle, material]}>
        {children}
      </GlassView>
    );
  }
  return <View testID={testID} style={[style, glassFallback(t, clear), glassStyle]}>{children}</View>;
}
