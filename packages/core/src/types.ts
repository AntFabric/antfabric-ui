/**
 * The words both kits and the catalogue share: which platform, which OS, which theme.
 *
 * `web` and `desktop` are drawn by `@antfabric/ui-react`; `mobile` by `@antfabric/ui-react-native`.
 */

export type Platform = "web" | "desktop" | "mobile";
export type OS = "browser" | "mac" | "windows" | "linux" | "ios" | "android";
/** Light or dark: the colour scheme a tree is drawn in. A theme (coming in theme.ts) is what a product restyles; a scheme is which of its two palettes is on. */
export type Scheme = "light" | "dark";

export const PLATFORMS: Platform[] = ["web", "desktop", "mobile"];

export const PLATFORM_OS: Record<Platform, OS[]> = {
  web: ["browser"],
  desktop: ["mac", "windows", "linux"],
  mobile: ["ios", "android"],
};

/** 26 is the first iOS and macOS with Liquid Glass. */
export const GLASS_FROM = 26;

/** The OS versions the catalogue switches between: the glass release and the one before it. */
export const OS_VERSIONS: Partial<Record<OS, { glass: number; before: number }>> = {
  ios: { glass: 26, before: 18 },
  mac: { glass: 26, before: 15 },
};

/** Liquid Glass draws only on iOS 26+ and macOS 26+. Android, Windows, Linux and the web never see it. */
export function hasGlass(os: OS, version?: number): boolean {
  const v = OS_VERSIONS[os];
  return !!v && (version ?? v.glass) >= GLASS_FROM;
}

/** Interaction states a component draws. The catalogue can force one for a static snapshot. */
export type InteractionState = "hover" | "pressed" | "focus" | "disabled";
