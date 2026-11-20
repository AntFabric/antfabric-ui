# Using AntFabric UI in an app or a plugin

For a team starting a product or a surface on AntFabric UI: the web (any React 19 framework; AntFabric's is TanStack Start), the desktop (Tauri), a V2 plugin (React) or the phone (Expo). Follow the steps in order; each ends with something you can check. An agent can follow it as written: every value to fill in is named, and nothing is guessed. How the components are written is in [`AUTHORING.md`](AUTHORING.md); what each one does is in the catalogue.

| You build | Install | Peers |
|---|---|---|
| Web, desktop, a React plugin | `@antfabric-ui/react` | `react` and `react-dom` 19.1+, `lucide-react` |
| The phone | `@antfabric-ui/react-native` | `react` 19.1+, `react-native` 0.81+, `react-native-svg`, `lucide-react-native`, optionally `expo-glass-effect` |

`@antfabric-ui/core` holds the tokens, the themes (`defineTheme`, `themes`), the stylesheet and the Geist and Figtree font files. Both kits depend on it.

This is 1.0, a generic base: with no theme every component draws `themes.neutral`, and AntFabric's own coral look is `themes.antfabric`. Light or dark is `scheme`; the look is `theme`. **Coming from 0.1?** Follow [`MIGRATION.md`](MIGRATION.md) (the page `/migrate`) instead of this guide: it has the codemod and every rename.

Each kit also has three subpaths, in the same package: `./data` (charts, KPIs, panels and tables), `./shell` (the app frame and the native surfaces around it) and `./chat` (messages, threads and the composer). They are not part of the root, so an app that never imports one carries none of it: `./data` is the one that brings recharts (web) or react-native-gifted-charts (phone), which are the kit's own dependencies, not yours. There is nothing more to install; `import { BarChart } from "@antfabric-ui/react/data"` works once the kit is.

## 1. Before you start

- **Node and pnpm.** The kits are built and tested on Node 24 with pnpm; npm and yarn work too, and the commands below are pnpm's.
- **React 19.1 or later** (and React Native 0.81 or later on the phone).

## 2. Install

The packages are on npm under the `@antfabric-ui` scope. Then install the kit for your platform:

```bash
# web, desktop, plugin
pnpm add @antfabric-ui/react @antfabric-ui/core lucide-react

# phone
pnpm add @antfabric-ui/react-native @antfabric-ui/core lucide-react-native
npx expo install react-native-svg expo-font expo-glass-effect
```

`expo-glass-effect` is optional: without it iOS 26 draws the kit's own glass look instead of the system material.

**Check:** `pnpm add` finishes and `pnpm ls @antfabric-ui/core` prints a version.

**Jest.** The packages are ES modules only. With `jest-expo` or another Jest preset, add `@antfabric-ui` to `transformIgnorePatterns`' allow-list so Jest transforms them.

**Trying an unreleased change.** Build the packages from a checkout of this repository and install the tarballs:

```bash
pnpm install && pnpm build:packages
for p in core react react-native; do pnpm --dir packages/$p pack --pack-destination "$PWD/release"; done
```

Copy `release/*.tgz` into the app (say `vendor/`), depend on them as `"@antfabric-ui/core": "file:vendor/antfabric-ui-core-<version>.tgz"` (and `react` or `react-native` the same way), and add `overrides: { "@antfabric-ui/core": "file:vendor/antfabric-ui-core-<version>.tgz" }` to the app's `pnpm-workspace.yaml` (with npm, `"overrides"` in `package.json`), because the kits ask for core by version.

## 3. Set up the web, the desktop and a plugin

Wrap the app once, and import the fonts once. `AntFabricRoot` sets the attributes the token variables hang from, carries the stylesheet, and tells the components where they are.

```tsx
import "@antfabric-ui/core/fonts.css";                      // Geist and Figtree (section 5)
import { AntFabricRoot } from "@antfabric-ui/react";

// web (TanStack Start): in the root route
<AntFabricRoot platform="web" scheme={scheme}>{children}</AntFabricRoot>

// desktop (Tauri)
<AntFabricRoot platform="desktop" os="mac" osVersion={26} scheme={scheme}>{children}</AntFabricRoot>
```

- `platform`: `"web"` or `"desktop"`. It sets the density: a control is 36px on the web and 34px on
  the desktop app.
- `os`: `browser` (the default on the web), `mac`, `windows` or `linux`. It decides the shortcut
  glyphs, the title-bar buttons and Windows' square corners. Tauri reports `macos`; pass `mac`.
- `osVersion`: the major version. Pass it on macOS: an omitted version counts as 26 and draws Liquid
  Glass. Glass is on only for macOS 26 and later.
- `scheme`: `"light"` or `"dark"`. The kit does not read `prefers-color-scheme`; the app decides and
  changes the prop. A switch changes an attribute, so nothing re-renders.
- `theme`: your product's look, a theme from `defineTheme` (section 6). Left out, the kit draws `neutral`;
  `themes.antfabric` is AntFabric's own coral look. A string here (`theme="dark"`) throws: light or dark is `scheme`.
- `css={false}`: leaves the stylesheet out, for an app that already ships it, and `css="theme"` ships only the
  theme's sheet, for an app that ships the kit's once (below). Pass `theme` with either, and add `themeCss(theme)` to the app's stylesheet.
- `strings`, `locale`: the kit's built-in text for the whole tree, per component id (`{ "text-field": { required: "Obligatoire" } }`); a component's own `strings` prop overrides it for one instance.

The stylesheet is injected with the root as a hoisted `<style href="antfabric-ui">` (React 19), so it
is server-rendered in the `<head>` and added once however many roots there are.

For AntFabric's own look (an AntFabric app or plugin), pass the theme once, at the root:

```tsx
import { themes } from "@antfabric-ui/core";
import { antfabricStrings } from "@antfabric-ui/core/antfabric";
<AntFabricRoot platform="web" scheme={scheme} theme={themes.antfabric} strings={antfabricStrings}>{children}</AntFabricRoot>
```

`themes.antfabric` is the look; `antfabricStrings` is AntFabric's own wording (0.1's built-in text), which ships from the opt-in entry `@antfabric-ui/core/antfabric` (it also re-exports `antfabric`). Without it the kit speaks its generic copy. The phone is the same: `<ThemeProvider scheme={scheme} theme={themes.antfabric} strings={antfabricStrings}>`.

**Check:** render `<Button label="Send invite" variant="primary" onPress={() => {}} />` from `@antfabric-ui/react` inside the root. It draws a button in your theme's primary (ink under `neutral`, coral under `themes.antfabric`), and the root element carries `data-af-platform="web"`. The font is Geist under `neutral` and Figtree under `themes.antfabric`.

**A plugin** inside a host that already mounts the root only imports components; the host's
attributes, theme and stylesheet reach it. A plugin that renders into its own tree wraps it in
`AntFabricRoot` with the host's platform, OS and theme.

### Without `AntFabricRoot`

Write the attributes on `<html>` (or any container) with `rootAttrs`, ship the stylesheet with the theme's sheet in it, and pass the same theme to `AntFabricProvider`, which tells the components the OS, the scheme and the theme. All three come from one theme; a provider without one draws `neutral` on a page whose sheet is not neutral's, and warns once in development.

```tsx
import { AntFabricProvider, rootAttrs } from "@antfabric-ui/react";
import { kitCss, themeCss, tokensCss } from "@antfabric-ui/core";
import { theme } from "./theme";                    // section 6; `themes.neutral` if you have none

const platform = "web", os = "browser", scheme = "light";

// <html {...rootAttrs({ platform, os, scheme, theme })}>
// <head><style>{tokensCss() + kitCss + themeCss(theme)}</style></head>   (or write that string to a .css file at build time)
<AntFabricProvider platform={platform} os={os} scheme={scheme} theme={theme}>{children}</AntFabricProvider>
```

`rootAttrs` returns `data-af-platform`, `data-af-theme` (the scheme), `data-af-os` and, for any theme but `themes.antfabric`, `data-af-theme-id`. Change `scheme` in both places when the user switches.

`AntFabricRoot` also sets `font-family` and `color` on its element. With the attributes on `<html>`,
set them yourself: `font-family: var(--af-font-sans); color: var(--af-fg-body)`.

**Check:** the root element carries `data-af-theme-id` (unless the theme is `themes.antfabric`), the stylesheet declares `--af-brand-default` under `[data-af-theme-id="<id>"]`, and a `Button` draws that theme's primary and radius.

## 4. Set up the phone

Load the fonts, then wrap the app in `ThemeProvider`. Render nothing until the fonts are loaded; otherwise Android draws a faked bold. With no theme the phone draws `neutral`, whose fonts are Geist: register the `Geist-*` files under those names.

```tsx
import { useFonts } from "expo-font";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "@antfabric-ui/react-native";

export default function App() {
  const scheme = useColorScheme() ?? "light";
  const [loaded] = useFonts({
    "Geist-Regular": require("@antfabric-ui/core/fonts/Geist-Regular.ttf"),
    "Geist-Medium": require("@antfabric-ui/core/fonts/Geist-Medium.ttf"),
    "Geist-SemiBold": require("@antfabric-ui/core/fonts/Geist-SemiBold.ttf"),
    "Geist-Bold": require("@antfabric-ui/core/fonts/Geist-Bold.ttf"),
  });
  if (!loaded) return null;
  return <ThemeProvider scheme={scheme}>{/* the app */}</ThemeProvider>;
}
```

An app that passes `themes.antfabric` loads Figtree instead (`Figtree-Regular`, `-Medium`, `-SemiBold`, `-Bold`, `-ExtraBold`, from `@antfabric-ui/core/fonts/Figtree-*.ttf`; the headline face is Satoshi, section 5). A theme with its own fonts loads those (section 6). Skip this and the phone draws the system font, and Expo logs an error for each family name the theme asks for.

- `scheme`: `"light"` or `"dark"`. Pass the device's `useColorScheme()` or the user's choice.
- `strings`, `locale`: the kit's built-in text for the whole tree, per component id (`{ "text-field": { required: "Obligatoire" } }`); a component's own `strings` prop overrides it for one instance. Both roots take them.
- `os`, `osVersion`: default to the device. Set them only to draw the other OS (the catalogue does).
- `theme`: your product's look, a theme from `defineTheme` (section 6). Left out, the kit draws `neutral`. A string here (`theme="dark"`) throws: light or dark is `scheme`.
- There is no profile prop: this kit is the mobile profile, in points (a control is 44pt).
- Glass is on for iOS 26 and later, through `expo-glass-effect` when the app has it.

**Check:** render `<Button label="Send invite" variant="primary" onPress={() => {}} />` from `@antfabric-ui/react-native`. The label is Geist SemiBold on both iOS and Android (Figtree SemiBold under `themes.antfabric`).

## 5. Fonts

Under `neutral`, the default, body text and headlines are Geist, which ships with `@antfabric-ui/core` (`fonts.css` for the web and the desktop; `Geist-*.ttf` for the phone, section 4). Under `themes.antfabric`, body text is Figtree and headlines are Satoshi. Without the files the web kits fall back to the system font and nothing breaks, but it does not look like AntFabric.

- **Geist and Figtree ship with `@antfabric-ui/core`** (OFL): Geist is `neutral`'s face, Figtree `themes.antfabric`'s. For Geist, `@antfabric-ui/core/fonts.css` declares one variable face (`Geist-Variable.woff2`, weights 100 to 900, so a 450 draws as a 450) for the web and the desktop, and the four static TTFs are at `@antfabric-ui/core/fonts/Geist-*.ttf` for the phone (section 4). For Figtree, `@antfabric-ui/core/fonts.css` declares it for the web and the desktop (section 3), and the five TTFs are at `@antfabric-ui/core/fonts/Figtree-*.ttf` for the phone (section 4). In Tauri the bundler copies them like any other asset.
- **Satoshi does not ship**: its licence forbids passing the files on, so it is not in this repository either. Without it, headlines fall back to Figtree. An app that holds a Satoshi licence loads its own copy: on the web, `@font-face { font-family: "Satoshi"; src: url(Satoshi-Variable.woff2) format("woff2"); font-weight: 300 900; }`; on the phone, `Satoshi-Regular`, `Satoshi-Medium`, `Satoshi-Bold` and `Satoshi-Black` (`.otf`) in the same `useFonts` call. The kit maps semibold to `Satoshi-Medium`, since Satoshi has no SemiBold.
- **A product with its own type** (not AntFabric) loads its own families and names them in the brand (section 6); it can skip Satoshi, and Figtree too if both faces are replaced (and Geist, if `extends` is not `neutral` or the fonts are replaced).

## 6. Your product's look: colours and fonts

A product built on the kit keeps its spacing, sizes, radii and neutrals and changes two things: colours and fonts. Both go in the `brand` of a theme, `Partial<BrandTokens>` from `@antfabric-ui/core`, made with `defineTheme({ name, extends: themes.neutral, brand })`. Keep the theme in one file and pass it to the root as `theme`. Without a theme the kit draws `neutral`.

**`extends` defaults to `themes.neutral`.** A `defineTheme` call with no `extends` sits on neutral, so `extends: themes.neutral` above is the same as leaving it out. `extends: themes.antfabric` starts from AntFabric's coral look. `extends: null` starts from the raw schema (`tokens.ts`, which holds AntFabric's values); only the presets need it.

```tsx
// theme.ts
import { defineTheme, themes } from "@antfabric-ui/core";

export const theme = defineTheme({
  name: "Acme",
  extends: themes.neutral,
  brand: {
    primary: "#4f46e5",
    accent: "#0ea5e9",
    fonts: { sans: "Inter", display: "Inter" },
  },
});

// web, desktop
<AntFabricRoot platform="web" scheme={scheme} theme={theme}>…</AntFabricRoot>
// phone
<ThemeProvider scheme={scheme} theme={theme}>…</ThemeProvider>
```

**Colours.** `primary` and `accent` are `#rgb` or `#rrggbb` (anything else throws). Optionally add a hand-picked `soft`, `softHover`, `onSoft` or `tint`, each as `{ light, dark }`.

- Hover, pressed, the soft tints, the link colour, the border and the unread tint derive from
  `primary`. A hand-picked tint wins over the derived one.
- Only the brand family moves: `brand.*`, `accent.*`, `fg.onBrandSoft`, `link.default`,
  `border.brand`, `surface.unread`, and `fg.onBrand`. Neutrals, status colours and identity colours
  stay put, and `identity.agent` (Fabric) is never a tenant's.
- **Text on the brand fill** follows the primary: white while white reaches 3:1
  on it, ink (`#0e1828`) on a primary too light for that. A coral or a dark teal keeps white; a
  yellow gets ink. Check your primary: white on coral is 3.4:1, which is under 4.5:1 for
  the 12 to 13px semibold button label. That is an open question, not a rule you can rely on.

**Fonts.** `fonts.sans` is body text, `fonts.display` headlines. Each is a family name, or `{ family, files }`.

- **Web and desktop:** load the family yourself with `@font-face` (or Google Fonts, or `@fontsource`), under exactly the name you pass. The kit puts it in front of its own stack, so text still draws while it loads.
- **Phone:** register one file per weight with `useFonts`, named `<family>-Regular`, `-Medium`, `-SemiBold`, `-Bold` and `-ExtraBold` (`Inter-SemiBold`). A family whose files are named otherwise names them: `{ family: "Fraunces", files: { semibold: "Fraunces-Medium" } }`; a weight left out keeps the default name.
- A family name is a name only: no quotes, no `;`, nothing empty (it throws).

**Check:** the primary button is your primary; a `Dialog` title is your display face; body text is your sans. On the web, the root element carries `data-af-theme-id` and the theme's sheet declares `--af-brand-default` and `--af-font-sans` under it.

- Build the theme once, in a module. Both kits key a theme by its id (its content), so one built inline does not re-theme the tree on every render, but it does rebuild the theme.
- A host that does not use `AntFabricRoot` (or passes `css={false}`) writes the attributes with `rootAttrs({ platform, os, scheme, theme })`, puts `themeCss(theme)` in its stylesheet, and passes the same `theme` to `AntFabricProvider` (section 3); the sheet holds both schemes' values.

## 7. Tokens in app code

Read a colour, a space or a radius from the tokens; do not copy the value.

```tsx
import { t } from "@antfabric-ui/react";
<div style={{ padding: t.space.md, background: t.surface.card, borderRadius: t.radius.control }} />
// t.space.md is the string "var(--af-space-md)"; follow the theme, the density and the brand with no re-render.
// A key that starts with a digit takes brackets: t.space["2xs"].

import { createStyles, useTheme } from "@antfabric-ui/react-native";
const { t } = useTheme();   // numbers and colour strings for this scheme, OS and theme: t.control.hMd is 44
const useStyles = createStyles((t) => ({ row: { height: t.control.hMd, padding: t.space.md } }));
```

- **`tokens.json`:** every token in the W3C Design Tokens format, with its description and its light, dark and per-platform values.
  `import tokens from "@antfabric-ui/core/tokens.json"`, or the same file at `/tokens.json` on the
  catalogue.
- **Outside React:** `resolveTokens("desktop", "dark", { os: "mac" })` from `@antfabric-ui/core`
  returns the resolved values; `tokensCss()` is the stylesheet.

## 8. Import components

One import per kit. The catalogue lists each component's props, and the same props work on the web,
the desktop app and the phone unless a prop is marked for some platforms.

```tsx
import { Button, IconButton, Fab, SegmentedControl } from "@antfabric-ui/react";                                  // actions
import { Checkbox, Switch, RadioGroup, Chip, TextField, SearchField, Select } from "@antfabric-ui/react";        // inputs
import { Avatar, AvatarStack, Badge, Card, ListItem, Kbd, Tag } from "@antfabric-ui/react";                      // display
import { Skeleton, Toast, EmptyState, InlineBanner, ProgressBar } from "@antfabric-ui/react";                    // feedback
import { Menu, ContextMenu, Dialog, BottomSheet, Tooltip, HoverCard, CommandPalette } from "@antfabric-ui/react"; // overlays
import { Tabs, Breadcrumbs } from "@antfabric-ui/react";                                                         // navigation
import { AttachmentCard } from "@antfabric-ui/react";                                                          // messaging (the rest is ./chat)
import { NotificationItem, InAppBanner } from "@antfabric-ui/react";                                             // notifications (the rest is ./shell)
import { ConnectionBanner, SessionState, UpdateBanner } from "@antfabric-ui/react";                              // system

// The three subpaths, not part of the root:
import { SidebarItem, SidebarSection, NavRail, TitleBar, WebTopBar, AppMenuBar, WorkspaceSwitcher, OsNotification, TrayMenu, AppBadge } from "@antfabric-ui/react/shell"; // the app frame
import { Message, MessageActions, Composer, ReactionPill, ThreadSummary, TypingIndicator, MessageDivider } from "@antfabric-ui/react/chat";                            // the conversation
import { BarChart, LineChart, KpiCard, Table } from "@antfabric-ui/react/data";                                                                                          // charts, KPIs, tables
```

`./shell` and `./chat` leave the kit's root, so a product that is not an app frame or a chat does not carry them; `./data` also brings the chart library. The phone has the same three names under `@antfabric-ui/react-native` (`MobileHeader` and `TabBar` are in its `./shell`, `SwipeRow` stays in the root). Each component's page in the catalogue, and `platforms.<p>.import` in `/components.json`, give its exact import line.

The phone is the same names from `@antfabric-ui/react-native`, minus what a phone has no use for
(`Kbd`, `Tooltip`, `HoverCard`, `CommandPalette`, `Breadcrumbs`, `NavRail`, `TitleBar`, `WebTopBar`,
`AppMenuBar`, `TrayMenu`, `MessageActions`) and plus `SwipeRow`, `TabBar` and `MobileHeader`.

Six things to know:

- **Controlled or not.** A prop a press changes (`checked`, `value`, `selected`) is controlled when
  you pass it with its change event (`checked` with `onCheckedChange`, `value` with `onValueChange`):
  you own the state, and the component shows what you pass. Pass only the value and the component
  keeps its own state, starting from it and following it when it changes.
- **A changed value is `on<Prop>Change`; a press is `onPress()`.** No component has `onChange`.
  An item in a list carries a `key`, and a prop that names an item (`value`, `selected`, `current`)
  holds one. Open or closed is `expanded` (overlays keep `open`).
- **Props are the documented ones, `style`, `styles` and `strings`.** No `className`, `ref`, `aria-*`,
  `data-*` or other HTML attribute passes through. The accessible name comes from `label`. `styles` is
  per part (`styles={{ root: { … } }}`) and `strings` is the text the kit draws, for this instance.
- **A container takes children.** `<Card>…</Card>`, `<Dialog>…</Dialog>`, `<BottomSheet>…</BottomSheet>`.
  A component has no AntFabric sample as a default: pass the icon, the avatar, the actions you want.
- **Events carry documented arguments, not DOM events.** `onPress()`, `onValueChange(value)`.
- **Icons are lucide names in kebab case**: `iconLeading="plus"`. The kit draws them at its size.

## 9. Versions

The three packages share one version, tagged in git per package (`@antfabric-ui/core@<version>`), with a `CHANGELOG.md` each. Pin the
version you have tested. From 1.0 a rename or a removal is a major; a minor adds, a patch fixes. 1.0 itself
broke 0.1 once, for every consumer: [`MIGRATION.md`](MIGRATION.md) (the page `/migrate`) is the upgrade
guide, with a codemod, and each release's changes are in the kits' `CHANGELOG.md`. Releases go through Changesets
and GitHub Actions: [`RELEASING.md`](RELEASING.md).

**Check:** `pnpm ls @antfabric-ui/core @antfabric-ui/react` (or `react-native`) prints one version for every package, and it is the one you tested.
