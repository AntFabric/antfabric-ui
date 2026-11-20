/**
 * What a component is built with on each platform, read from its kit file's imports when the site
 * builds, so the page cannot drift from the code: the app it runs in, how it is styled, what gives
 * it behaviour, the libraries and primitives it reaches for, and the components it composes.
 */

import { registry, type Platform } from "./library";
import type { LogoId } from "./logos";

export interface StackItem {
  name: string;
  /** What it is for, or where it comes from. */
  note?: string;
  href?: string;
  /** Its maker's logo, where it has one (lib/logos.ts). */
  logo?: LogoId;
}

export interface StackRow {
  label: string;
  items: StackItem[];
}

/**
 * The app each platform's kit runs in, as AntFabric's own apps run it (2026-11-05): the desktop on
 * Tauri 2, Vite 7 and React 19, the phone on Expo ~54, React Native 0.81.5 and React 19.1. There is
 * no web app yet, so the web's shell is a proposal. The kits' own floors are
 * their peerDependencies.
 */
export const PLATFORM_SHELL: Record<Platform, StackItem[]> = {
  web: [
    { name: "React 19", note: "react-dom, kit peer ≥ 19.1", logo: "react" },
    { name: "TanStack Start", note: "planned: there is no AntFabric web app yet", logo: "tanstack" },
  ],
  desktop: [
    { name: "React 19", note: "kit peer ≥ 19.1", logo: "react" },
    { name: "Tauri 2", note: "the OS's own WebView", logo: "tauri" },
    { name: "Vite 7", note: "the desktop app's bundler", logo: "vite" },
  ],
  mobile: [
    { name: "React Native 0.81", note: "kit peer ≥ 0.81", logo: "react" },
    { name: "Expo SDK 54", note: "the phone app", logo: "expo" },
  ],
};

const IMPORT = /import\s+(type\s+)?(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*"([^"]+)"/g;

/** Each module the file imports, with the value names it takes from it (type-only imports left out). */
function importsOf(src: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const m of src.matchAll(IMPORT)) {
    if (m[1]) continue;
    const names = [m[2], ...(m[3] ?? "").split(",")]
      .map((n) => n?.trim())
      .filter((n): n is string => !!n && !n.startsWith("type "))
      .map((n) => n.split(/\s+as\s+/)[0]!.trim());
    out.set(m[4]!, [...(out.get(m[4]!) ?? []), ...names]);
  }
  return out;
}

const helper = (imports: Map<string, string[]>, end: string) => [...imports].filter(([from]) => from.endsWith(end)).flatMap(([, names]) => names);

/** The rows of a component's stack on one platform, from its kit file's source. */
export function stackOf(id: string, platform: Platform, src: string): StackRow[] {
  const imports = importsOf(src);
  const native = platform === "mobile";
  const has = (end: string, name?: string) => helper(imports, end).some((n) => !name || n === name);
  const rows: StackRow[] = [{ label: "App", items: PLATFORM_SHELL[platform] }];

  const styling: StackItem[] = [];
  if (has("/lib/recipe", "useRecipe")) styling.push({ name: "Recipe", note: "useRecipe over the shared recipe in @antfabric/ui-core" });
  if (native) {
    if (has("/theme", "createStyles")) styling.push({ name: "StyleSheet", note: "createStyles() over useTheme() tokens" });
    else if (has("/theme", "useTheme")) styling.push({ name: "useTheme()", note: "resolved tokens" });
    if (has("/theme", "font")) styling.push({ name: "font()", note: "a font file per weight" });
  } else {
    if (has("/tokens")) styling.push({ name: "Inline styles", note: "every token a var(--af-…)" });
    if (has("/lib/style")) styling.push({ name: "Layout helpers", note: "lib/style" });
  }
  rows.push({ label: "Styling", items: styling });

  const behaviour: StackItem[] = [];
  if (has("/lib/interaction", "useInteraction")) behaviour.push({ name: "useInteraction", note: "hover, press and focus as state" });
  if (has("/platform", "usePlatform")) behaviour.push({ name: "usePlatform", note: "OS, version and Liquid Glass" });
  if (has("/lib/press", "usePress")) behaviour.push({ name: "usePress", note: "press state and scale" });
  if (has("/lib/motion", "Enter") || has("/lib/motion", "useEnter")) behaviour.push({ name: "Enter", note: "Animated entrances" });
  const core = (imports.get("@antfabric/ui-core") ?? []).filter((n) => n !== "recipes");
  for (const n of core) behaviour.push({ name: n, note: "@antfabric/ui-core" });
  rows.push({ label: "Behaviour", items: behaviour });

  const libs: StackItem[] = [];
  if (has("/lib/icon", "Icon")) libs.push(native ? { name: "lucide-react-native", note: "drawn with react-native-svg", logo: "lucide" } : { name: "lucide-react", note: "icons", logo: "lucide" });
  if (has("/lib/glass", "GlassSurface")) libs.push({ name: "expo-glass-effect", note: "Liquid Glass, optional: a blur stands in without it", logo: "expo" });
  for (const [from, names] of imports) {
    if (from === "react-dom") libs.push({ name: "react-dom", note: names.join(", "), logo: "react" });
  }
  rows.push({ label: "Libraries", items: libs });

  const react = imports.get("react") ?? [];
  if (react.length) rows.push({ label: "React", items: react.map((n) => ({ name: n })) });
  const rn = imports.get("react-native") ?? [];
  if (native && rn.length) rows.push({ label: "React Native", items: rn.map((n) => ({ name: n })) });

  const composes = [...imports.keys()]
    .map((from) => /^\.\.?\/(?:[a-z-]+\/)?([a-z0-9-]+)$/.exec(from)?.[1])
    .filter((x): x is string => !!x && x !== id && !!registry[x])
    .map((x) => ({ name: registry[x]!.name, note: registry[x]!.level, href: `/components/${x}` }));
  if (composes.length) rows.push({ label: "Composes", items: composes });

  return rows.filter((r) => r.items.length);
}

/** What the strip under the platform tabs shows, as logos: the app, then the libraries. */
export function stackSummary(rows: StackRow[]): StackItem[] {
  const pick = (label: string) => rows.find((r) => r.label === label)?.items ?? [];
  return [...pick("App"), ...pick("Libraries")];
}
