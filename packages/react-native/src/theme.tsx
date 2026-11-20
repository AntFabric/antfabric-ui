import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Platform, StyleSheet } from "react-native";
import { hasGlass, resolveTokens, StringsProvider, themes, type Direction, type NativeTokens, type Scheme, type StringsOverrides, type Theme } from "@antfabric/ui-core";

const WEB = Platform.OS === "web";

/** The tokens for one scheme, OS and theme; `resolveTokens` memoises, so every component in the tree reads the same object. */
const tokensFor = (scheme: Scheme, os: "ios" | "android", theme: Theme) => resolveTokens("mobile", scheme, { web: WEB, os, theme });

export interface ThemeInfo {
  scheme: Scheme;
  os: "ios" | "android";
  osVersion?: number;
  /** iOS 26+: the tab bar, sheets, banners and floating buttons draw Liquid Glass. */
  glass: boolean;
  /** The theme the tokens were resolved with: `neutral` unless a provider above passed another. */
  theme: Theme;
  /** The tokens for the phone profile, this scheme and this OS: `t.control.hMd` is 44, `t.brand.default` a hex, `t.switch.trackW` 51 on iOS and 36 on Android. */
  t: NativeTokens;
}

const deviceOS: "ios" | "android" = Platform.OS === "android" ? "android" : "ios";
const deviceVersion = Platform.OS === "ios" ? parseInt(String(Platform.Version), 10) : undefined;

const ThemeContext = createContext<ThemeInfo>({
  scheme: "light",
  os: deviceOS,
  osVersion: deviceVersion,
  glass: hasGlass(deviceOS, deviceVersion),
  theme: themes.neutral,
  t: tokensFor("light", deviceOS, themes.neutral),
});

export function useTheme(): ThemeInfo {
  return useContext(ThemeContext);
}

export interface ThemeProviderProps {
  scheme?: Scheme;
  /** Defaults to the device. The catalogue sets it to draw iOS and Android side by side. */
  os?: "ios" | "android";
  osVersion?: number;
  /** The theme to draw with. Without one a nested provider takes its parent's, and the outermost one `neutral`. */
  theme?: Theme;
  /**
   * Built-in text over the English defaults: per component id, any of its keys, each a template (`{ "text-field": { required: "Obligatoire" } }`).
   * A provider inside another merges its own over its parent's, key by key. One instance overrides its own through the component's `strings` prop.
   */
  strings?: StringsOverrides;
  /** The locale plural forms in `strings` are chosen in, and numbers, dates and sorting are formatted in (default: the parent provider's, else `"en"`, formatted as `en-US`). Hermes has no `Intl.PluralRules`: there a plural template chooses between `one` and `other` as English does. */
  locale?: string;
  /**
   * Which way the text runs (default: the parent provider's, else `"ltr"`). React Native mirrors `start` and `end` styles from the app's
   * `I18nManager`; this tells the components that draw a direction themselves (a swipe tray, a slide, an arrow) which way is forward.
   */
  dir?: Direction;
  children: ReactNode;
}

/** A theme from `defineTheme` (or a preset): an object with an id, a name, token sets and recipes. A string (`"dark"`) is a scheme, passed to the wrong prop. */
function assertTheme(theme: unknown): void {
  if (theme === undefined || theme === null) return;
  const t = theme as Partial<Theme>;
  if (typeof theme !== "object" || typeof t.id !== "string" || typeof t.name !== "string" || typeof t.sets !== "object" || t.sets === null || typeof t.recipes !== "object")
    throw new Error(`ThemeProvider: theme takes a theme from defineTheme; light or dark is \`scheme\` (got ${typeof theme === "string" ? JSON.stringify(theme) : typeof theme})`);
}

export function ThemeProvider({ scheme = "light", os = deviceOS, osVersion, theme: given, strings, locale, dir, children }: ThemeProviderProps) {
  assertTheme(given);
  const parent = useContext(ThemeContext);
  const theme = given ?? parent.theme;
  const version = osVersion ?? (os === deviceOS ? deviceVersion : undefined);
  // The theme is keyed by its id: one built inline on every render does not re-theme the tree.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `theme.id` is `theme`'s content
  const value = useMemo<ThemeInfo>(() => ({ scheme, os, osVersion: version, glass: hasGlass(os, version), theme, t: tokensFor(scheme, os, theme) }), [scheme, os, version, theme.id]);
  return (
    <ThemeContext.Provider value={value}>
      <StringsProvider strings={strings} locale={locale} dir={dir}>
        {children}
      </StringsProvider>
    </ThemeContext.Provider>
  );
}

/**
 * A component's StyleSheet, built from the tokens once per scheme:
 *
 *   const useStyles = createStyles((t) => ({ root: { height: t.control.hMd } }));
 *   const s = useStyles();
 *
 * Anything that depends on a prop or on press state is added inline over these.
 */
export function createStyles<S extends StyleSheet.NamedStyles<S>>(make: (t: NativeTokens) => S): () => S {
  const cache = new Map<NativeTokens, S>();
  return function useStyles() {
    const { t } = useTheme();
    let s = cache.get(t);
    if (!s) {
      s = StyleSheet.create(make(t));
      cache.set(t, s);
    }
    return s;
  };
}
