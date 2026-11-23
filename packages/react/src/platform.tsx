import { createContext, useContext, useInsertionEffect, useMemo, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { hasGlass, kitCss, StringsProvider, themeCss, themes, tokensCss, type Direction, type OS, type Scheme, type StringsOverrides, type Theme } from "@antfabric/ui-core";
import { t } from "./tokens";

/**
 * Where a component is drawn. The same component serves the web app and the desktop app; what
 * differs is read from here: the density (through the token variables), the OS (title-bar buttons,
 * shortcut glyphs, Windows' square corners) and whether macOS 26's Liquid Glass is on.
 */
export interface PlatformInfo {
  platform: "web" | "desktop";
  os: OS;
  osVersion?: number;
  /** macOS 26+. Never on the web, Windows or Linux. */
  glass: boolean;
  /** Light or dark. Components style through variables that follow it; the chart libraries take plain values, so the data components resolve their tokens with it. */
  scheme: Scheme;
  /** The theme object this tree is drawn in: `neutral` unless a root or provider is given another. */
  theme: Theme;
  /**
   * The OS whose shortcut glyphs to draw, for `formatShortcut(keys, shortcutOs)`: `os`, except on the web (`browser`), where it is the
   * visitor's once mounted (`mac` on a Mac or an iPad, so `⌘K`); a server render and the hydration after it say `browser` (Ctrl).
   */
  shortcutOs: OS;
}

// With no root or provider above, the kit draws `neutral`. AntFabric's own look is the `antfabric` preset, passed as a theme.
const TOP: PlatformInfo = { platform: "web", os: "browser", glass: false, scheme: "light", theme: themes.neutral, shortcutOs: "browser" };
const PlatformContext = createContext<PlatformInfo>(TOP);

// The visitor's machine, read once mounted (`useSyncExternalStore` gives the server's answer during hydration, so the markup matches).
const never = () => () => {};
function visitorOs(): OS {
  if (typeof navigator === "undefined") return "browser";
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform || nav.platform || "") ? "mac" : "browser";
}
const serverOs = (): OS => "browser";

export function usePlatform(): PlatformInfo {
  return useContext(PlatformContext);
}

/**
 * Where the tree is drawn. Each of `platform`, `os`, `osVersion`, `scheme` and `theme` left out is the parent provider's (a provider nested
 * to scope `strings` keeps the page's platform, OS and scheme); at the top they are web, browser, light and `neutral`. An `os` left out
 * under a parent of another platform is that platform's own (`browser` on the web, `mac` on the desktop).
 */
export interface AntFabricProviderProps {
  platform?: "web" | "desktop";
  os?: OS;
  osVersion?: number;
  /** Light or dark (default: the parent provider's, else light). `AntFabricRoot` passes its own; set it here only for a host that sets `data-af-theme` itself. */
  scheme?: Scheme;
  /**
   * The theme the tree is drawn in. Left out, a provider inside another takes its parent's; at the top it is `neutral`. A host
   * that writes `data-af-theme-id` and the theme's sheet itself passes the same theme here.
   */
  theme?: Theme;
  /**
   * Built-in text over the English defaults: per component id, any of its keys, each a template (`{ "text-field": { required: "Obligatoire" } }`).
   * A provider inside another merges its own over its parent's, key by key. One instance overrides its own through the component's `strings` prop.
   */
  strings?: StringsOverrides;
  /** The locale plural forms in `strings` are chosen in, and numbers, dates and sorting are formatted in (default: the parent provider's, else `"en"`, formatted as `en-US`). */
  locale?: string;
  /** Which way the text runs (default: the parent provider's, else `"ltr"`). `AntFabricRoot` also writes it as the element's `dir`, which turns the kit's logical margins and paddings round. */
  dir?: Direction;
  /**
   * Whether an overlay moves focus into itself when it opens (default: the parent provider's, else `true`). A host that draws open
   * overlays as pictures, side by side on one page (a catalogue), passes `false` so the page does not jump to the last one drawn.
   */
  autoFocus?: boolean;
  children: ReactNode;
}

const AutoFocusContext = createContext(true);

/** Whether overlays in this tree move focus into themselves when they open: `false` only under a provider that said so. */
export function useAutoFocus(): boolean {
  return useContext(AutoFocusContext);
}

/**
 * Whether a root or a provider above chose the theme, so the CSS the page holds is the theme's. A provider with no theme of its own and
 * nothing above it draws `neutral` from the context default, which a host that writes the attributes and sheets itself has not written.
 */
const ChosenContext = createContext(false);

/** A theme from `defineTheme` (or a preset): an object with an id, a name, token sets and recipes. A string (`"dark"`) is a scheme, passed to the wrong prop. */
function assertTheme(theme: unknown, where: string): void {
  if (theme === undefined || theme === null) return;
  const t = theme as Partial<Theme>;
  if (typeof theme !== "object" || typeof t.id !== "string" || typeof t.name !== "string" || typeof t.sets !== "object" || t.sets === null || typeof t.recipes !== "object")
    throw new Error(`${where}: theme takes a theme from defineTheme; light or dark is \`scheme\` (got ${typeof theme === "string" ? JSON.stringify(theme) : typeof theme})`);
}

// Safe where there is no `process` (a browser build that does not replace it): no warning there.
declare const process: { env?: { NODE_ENV?: string } } | undefined;
const dev = (() => {
  try {
    return process?.env?.NODE_ENV !== "production";
  } catch {
    return false;
  }
})();
const warned = new Set<string>();
function warnOnce(message: string): void {
  if (!dev || warned.has(message)) return;
  warned.add(message);
  console.warn(`[antfabric-ui] ${message}`);
}

/**
 * Tells the components where they are. `AntFabricRoot` includes one. A host that does not use `AntFabricRoot` passes `theme` here, writes the
 * root's attributes with `rootAttrs({ platform, os, scheme, theme })` and puts `themeCss(theme)` in its stylesheet; without a theme here it draws
 * `neutral`, whose sheet that host has not written (in development this warns once).
 */
export function AntFabricProvider({ platform: givenPlatform, os: givenOs, osVersion: givenVersion, scheme: givenScheme, theme, strings, locale, dir, autoFocus, children }: AntFabricProviderProps) {
  assertTheme(theme, "AntFabricProvider");
  const parent = useContext(PlatformContext);
  const chosen = useContext(ChosenContext);
  if (theme === undefined && !chosen)
    warnOnce(
      `AntFabricProvider has no theme and no AntFabricRoot above it, so it draws "${parent.theme.name}" while the page's stylesheet and root attributes are not that theme's. Pass the same theme here that you give rootAttrs() and themeCss() (CONSUMING.md, "Without AntFabricRoot").`,
    );
  const drawn = theme ?? parent.theme;
  const platform = givenPlatform ?? parent.platform;
  const os = givenOs ?? (platform === parent.platform ? parent.os : platform === "web" ? "browser" : "mac");
  const osVersion = givenVersion ?? (os === parent.os ? parent.osVersion : undefined);
  const scheme = givenScheme ?? parent.scheme;
  const visitor = useSyncExternalStore(never, visitorOs, serverOs);
  const shortcutOs = os === "browser" ? visitor : os;
  // Keyed by the theme's id (its content), so one built inline on every render does not re-render the tree.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `drawn.id` is `drawn`'s content
  const value = useMemo<PlatformInfo>(
    () => ({ platform, os, osVersion, glass: platform === "desktop" && hasGlass(os, osVersion), scheme, theme: drawn, shortcutOs }),
    [platform, os, osVersion, scheme, drawn.id, shortcutOs],
  );
  const focusIn = useContext(AutoFocusContext);
  return (
    <ChosenContext.Provider value={chosen || theme !== undefined}>
      <PlatformContext.Provider value={value}>
        <AutoFocusContext.Provider value={autoFocus ?? focusIn}>
          <StringsProvider strings={strings} locale={locale} dir={dir}>
            {children}
          </StringsProvider>
        </AutoFocusContext.Provider>
      </PlatformContext.Provider>
    </ChosenContext.Provider>
  );
}

export interface AntFabricRootProps extends AntFabricProviderProps {
  style?: CSSProperties;
  /**
   * Ships the token variables, the theme's sheet and the keyframes with the tree. `false` when the app's own stylesheet already has
   * them all (it then passes `theme` and adds `themeCss(theme)` itself: left out, it draws `neutral` without its sheet, and warns once in
   * development); `"theme"` when it ships the kit's base sheet once for the page but the theme's
   * sheet should come with the tree (the catalogue, any host drawing several themes side by side).
   */
  css?: boolean | "theme";
}

/**
 * The element every AntFabric tree sits in: it carries the attributes the token variables are scoped by (`data-af-platform`,
 * `data-af-theme` for the scheme, `data-af-os`, and `data-af-theme-id` for any theme but the empty one), and the kit's stylesheet
 * with the theme's. A tenant's brand is part of a theme (`defineTheme({ name, extends, brand })`), passed as `theme`.
 */
export function AntFabricRoot({ platform: givenPlatform, os: givenOs, osVersion, scheme: givenScheme, theme, strings, locale, dir, autoFocus, style, css = true, children }: AntFabricRootProps) {
  assertTheme(theme, "AntFabricRoot");
  const parent = useContext(PlatformContext);
  const chosen = useContext(ChosenContext);
  if (css === false && theme === undefined && !chosen)
    warnOnce(
      `AntFabricRoot css={false} has no theme, so it draws "${parent.theme.name}" while the page's stylesheet is not that theme's. Pass the theme and add themeCss(theme) to the stylesheet (CONSUMING.md, "Without AntFabricRoot").`,
    );
  const drawn = theme ?? parent.theme;
  // A root inside another root or a provider keeps what it is not given, as a provider does; at the top it writes no `data-af-os` unless given one.
  const platform = givenPlatform ?? parent.platform;
  const scheme = givenScheme ?? parent.scheme;
  const os = givenOs ?? (parent !== TOP && platform === parent.platform ? parent.os : undefined);
  const themeSheetHere = drawn.id !== "" && css !== false;
  // On the server (and while hydrating) the theme's sheet is a `<style href precedence>` React hoists, which it never takes out of the page;
  // once mounted the root holds the sheet itself, counted by theme id, and the last root drawing a theme takes its sheet out.
  const mounted = useSyncExternalStore(never, onClient, onServer);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `drawn.id` is `drawn`'s content
  useInsertionEffect(() => (mounted && themeSheetHere ? holdThemeSheet(drawn) : undefined), [mounted, themeSheetHere, drawn.id]);
  return (
    <div {...rootAttrs({ platform, os, scheme, theme: drawn })} dir={dir} style={{ fontFamily: t.font.sans, color: t.fg.body, ...ROOT_TEXT, ...style }}>
      {/* One slot for both sheets: a sibling more would shift the ids `useId` gives everything inside (the tree's shape is part of them). */}
      {(css === true || (css === "theme" && drawn.id !== "")) && (
        <>
          {css === true && (
            <style href={KIT_HREF} precedence="low">
              {KIT_CSS}
            </style>
          )}
          {themeSheetHere && !mounted && (
            <style href={`antfabric-ui-${drawn.id}`} precedence="low">
              {themeSheet(drawn)}
            </style>
          )}
        </>
      )}
      <AntFabricProvider platform={platform} os={os} osVersion={osVersion} scheme={scheme} theme={drawn} strings={strings} locale={locale} dir={dir} autoFocus={autoFocus}>
        {children}
      </AntFabricProvider>
    </div>
  );
}

const KIT_CSS = tokensCss() + kitCss;

// The package's version, written in by the build (`scripts/build-packages.mjs`); the workspace's source has none. React keeps one sheet
// per `href`, so a host and a plugin on two versions of the kit each ship their own.
declare const __ANTFABRIC_UI_VERSION__: string | undefined;
const KIT_HREF = typeof __ANTFABRIC_UI_VERSION__ === "string" ? `antfabric-ui@${__ANTFABRIC_UI_VERSION__}` : "antfabric-ui";

const onClient = () => true;
const onServer = () => false;

/** The theme sheets mounted roots hold, by theme id: how many roots draw it, and the element when the kit put it in (not React or a server). */
const held = new Map<string, { roots: number; el: HTMLStyleElement | null }>();

/** Puts the theme's sheet in the page unless a server render already did, and returns its release: the last root to let go takes it out. */
function holdThemeSheet(theme: Theme): (() => void) | undefined {
  if (typeof document === "undefined" || !document.head) return undefined;
  const id = theme.id;
  let entry = held.get(id);
  if (!entry) {
    const href = `antfabric-ui-${id}`;
    // The server's (or a hydration's) sheet, alone or merged with the kit's: React's to keep, so it stays and nothing is added. One another
    // copy of the kit holds (`data-af-held`) may go when that copy lets go of it, so it does not count.
    const there = [...document.querySelectorAll("style[data-href]:not([data-af-held])")].some((s) => (s.getAttribute("data-href") ?? "").split(" ").includes(href));
    let el: HTMLStyleElement | null = null;
    if (!there) {
      el = document.createElement("style");
      el.setAttribute("data-href", href);
      el.setAttribute("data-af-held", "");
      el.textContent = themeSheet(theme);
      document.head.appendChild(el);
    }
    entry = { roots: 0, el };
    held.set(id, entry);
  }
  const mine = entry;
  mine.roots++;
  return () => {
    if (--mine.roots > 0) return;
    held.delete(id);
    mine.el?.remove();
  };
}

/**
 * How the root's text is drawn (web and desktop; the phone kit draws its own text). Grayscale antialiasing on macOS, as AntFabric's
 * desktop app draws it: without it Safari, Chrome and Tauri's WebKit keep their default (subpixel) smoothing, and every weight
 * reads a step heavier than the same face there. These are rendering keywords, not values a token or recipe holds, so they sit here
 * beside the root's font and colour, inherited by everything in the tree; `style` on the root still wins.
 */
const ROOT_TEXT: CSSProperties = { WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" };

export interface RootAttrsInput {
  platform?: "web" | "desktop";
  os?: OS;
  /** Light or dark (default light). */
  scheme?: Scheme;
  /** The theme the provider is given: its id is written, and its sheet (`themeCss(theme)`) is the host's to ship. */
  theme: Theme;
}

/**
 * Every attribute `AntFabricRoot` puts on its element, for a host that does not use it: `data-af-platform`, `data-af-theme` (the scheme),
 * `data-af-os` when `os` is given, and `data-af-theme-id` for any theme but the empty one. Put them on `<html>` or on the container, give the
 * stylesheet `tokensCss() + kitCss + themeCss(theme)`, and pass the same `theme` to `AntFabricProvider`.
 */
export function rootAttrs({ platform = "web", os, scheme = "light", theme }: RootAttrsInput): Record<string, string> {
  assertTheme(theme, "rootAttrs");
  return { "data-af-platform": platform, "data-af-theme": scheme, ...(os === undefined ? {} : { "data-af-os": os }), ...themeIdAttr(theme) };
}

/**
 * `data-af-theme-id` for an element that carries `data-af-platform`, so the theme's scoped blocks reach it (the base blocks
 * would otherwise reset the theme there). The empty theme writes none. Spread it next to the element's own `data-af-platform`.
 */
export function themeIdAttr(theme: Theme): { "data-af-theme-id"?: string } {
  return theme.id === "" ? {} : { "data-af-theme-id": theme.id };
}

const sheets = new Map<string, string>();
const SHEETS_MAX = 32;

/** The theme's sheet, memoised by id (an id is the theme's content, so the same id is the same sheet). */
function themeSheet(theme: Theme): string {
  let sheet = sheets.get(theme.id);
  if (sheet === undefined) {
    sheet = themeCss(theme);
    if (sheets.size >= SHEETS_MAX) sheets.delete(sheets.keys().next().value!);
    sheets.set(theme.id, sheet);
  }
  return sheet;
}
