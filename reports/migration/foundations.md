# Foundations

- `Theme` (the type `"light" | "dark"`) → `Scheme`. `Theme` is now a theme object.
- `<AntFabricRoot theme="dark">` / `<AntFabricProvider theme="dark">` → `scheme="dark"`. `theme` takes a theme from `defineTheme`; passing a string throws.
- `<AntFabricRoot brand={{ primary }}>` / `<ThemeProvider brand={…}>` → `theme={defineTheme({ name: "acme", extends: themes.antfabric, brand: { primary } })}`. The `brand` props are gone.
- `brandVars(brand, scheme)` and `brandKey` are no longer exported. A host that writes the variables itself uses `themeCss(theme)` and `rootAttrs({ platform, os, scheme, theme })`.
- `resolveTokens(profile, scheme, { brand })` → `resolveTokens(profile, scheme, { theme })`.
- **No theme now draws `neutral`, not AntFabric's look.** To keep AntFabric's look, pass `theme={themes.antfabric}` (or `antfabric`) to `AntFabricRoot` and `ThemeProvider` once, at the root.
- **`defineTheme`'s `extends`, left out, is `themes.neutral`** (it starts from the schema's own AntFabric values only with `extends: null`, which the presets use). A product that adds a brand and says nothing else now gets neutral's fonts, radii and page colour, the look the kit draws with no theme; `extends: themes.antfabric` gives AntFabric's. The codemod writes `extends: themes.antfabric` when it folds a `brand` prop, so migrated code keeps its look.
- **AntFabric's 0.1 wording is opt-in.** An AntFabric app passes `strings={antfabricStrings}` with `theme={themes.antfabric}` to keep 0.1's copy (`import { antfabric, antfabricStrings } from "@antfabric-ui/core/antfabric"`; the subpath is never part of core's root, so another product does not bundle it).
- `AntFabricRoot css`: `true` (default; base sheet and the theme's), `"theme"` (only the theme's; the host loads the base sheet once), `false` (neither: the host adds `tokensCss() + kitCss` and `themeCss(theme)`).
- A host without `AntFabricRoot` passes `theme` to `AntFabricProvider` and writes `rootAttrs(…)` on its element.
- Themes are only those `defineTheme` built: a theme stored as JSON goes back through `defineTheme`.
- New on both roots: `strings` and `locale` (the kit's built-in text). New per component: `styles` (per part) and `strings`.
- Subpaths: app chrome moved to `@antfabric-ui/react/shell` and `@antfabric-ui/react-native/shell`, the conversation components to `/chat` (see `shell.md`, `notifications.md`, `messaging.md`). Data stays on `/data`.
- `ANTFABRIC_MARK` is no longer in core (it is AntFabric's own mark; pass your product's `mark` to AppBadge).
