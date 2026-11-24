# AntFabric UI

One component library for AntFabric's three apps, written as real components: **React** for the
web app and the desktop app, **React Native** for the phone. An Astro catalogue draws the
components themselves, live, in a **Web**, a **Desktop** and a **Mobile** tab, and shows how each
one works inside the apps, step by step.

| Platform | App | Kit |
|---|---|---|
| Web | TanStack Start | `@antfabric/ui-react` |
| Desktop | Tauri 2 | `@antfabric/ui-react` |
| Mobile | Expo | `@antfabric/ui-react-native` |

```bash
pnpm install
pnpm dev        # the catalogue on http://localhost:4321
pnpm check      # type-check, check the docs against the kits, render every case on every OS
pnpm frames <id> [platform] [os]   # where each flow frame's press lands
pnpm build      # check + static build of the catalogue
```

How to write a component is in [`AUTHORING.md`](AUTHORING.md). Open decisions and bugs go in
[GitHub issues](https://github.com/AntFabric/antfabric-ui/issues). How a release reaches npm is in
[`RELEASING.md`](RELEASING.md).

## Using the packages

`@antfabric/ui-core`, `@antfabric/ui-react` and `@antfabric/ui-react-native` are published to npm:

```bash
pnpm add @antfabric/ui-core @antfabric/ui-react lucide-react          # web and desktop
pnpm add @antfabric/ui-core @antfabric/ui-react-native lucide-react-native react-native-svg  # Expo
```

[`CONSUMING.md`](CONSUMING.md) has what an app or plugin team needs: install, `AntFabricRoot` and the
stylesheet, fonts, tenant branding, the tokens and the imports. Every push to `main` publishes a new version to
npm; [`RELEASING.md`](RELEASING.md) is how a change ships.

## Layout

```
packages/core/          what both kits share: tokens (as CSS variables and as resolved values),
                        shortcut formatting, the entrance motions
packages/react/         @antfabric/ui-react — web and desktop, one file per component, styled
                        inline over the token variables
packages/react-native/  @antfabric/ui-react-native — the phone, StyleSheet over useTheme()
                        tokens like the phone app's own components, motion with Animated
packages/docs/          what the catalogue says about each component: props as documented,
                        examples, edge cases, platform notes, flows; the platform tables
apps/catalogue/         the Astro site; previews are React islands that draw the kits (the phone
                        kit through React Native Web); screens/ holds whole-screen compositions
apps/catalogue/scripts/ check.tsx, rerender.tsx, frames.tsx and the other repo scripts
scripts/                build-packages.mjs, verify-packages.mjs and publish-packages.mjs (the npm tarballs),
                        release-version.mjs
```

## How one component serves three platforms

- **One props API.** Both kits take the documented props, and `pnpm check` fails if a kit's
  `XProps` and the docs disagree.
- **Web and desktop share a file.** What differs comes from `usePlatform()`: the OS (traffic lights
  on macOS, ☰ and window controls on Windows and Linux), the shortcut glyphs, and macOS 26's Liquid
  Glass. Density comes from the token variables: a control is 34px in the desktop app, 36px on the
  web.
- **The phone has its own file**, because it has its own idioms: touch sizes, fonts by file, no
  hover, sheets instead of popovers, iOS 26 glass through expo-glass-effect.

## Tenant branding

A white-label tenant retints the brand family (`brand.*`, `accent.*`, `color.text.onBrandSoft`, `color.text.link`,
`color.border.brand`, `color.background.unread`) with one input, `Partial<BrandTokens>` from `@antfabric/ui-core`:
a `primary`, an `accent`, and optionally a hand-picked `soft`, `softHover`, `onSoft` or `tint` per
theme. Hover, pressed, the soft tints, the link and the unread tint derive from `primary` the way the
product's phone derives them (`packages/core/src/brand.ts`). A brand is part of a theme:

- **A theme.** `const northwind = defineTheme({ name: "Northwind", extends: themes.neutral, brand: { primary: "#0f766e" } })`,
  then `<ThemeProvider theme={northwind}>` on the phone and `<AntFabricRoot theme={northwind}>` on web and desktop.
  The web root writes `data-af-theme-id` and the theme's sheet; a theme is read by its id, so one built inline does
  not re-theme the tree on every render.
- **A host without `AntFabricRoot`** writes `data-af-theme-id` on the element that carries `data-af-theme` and ships
  `themeCss(theme)` with the kit's stylesheet.

The catalogue draws a sample tenant beside the default at `/foundations#tenant-branding`;
`pnpm check brand` proves only the brand family moves.

## CI and releases

GitHub Actions: `.github/workflows/ci.yml` runs `pnpm build` (which runs `pnpm check`),
`pnpm verify:packages` and a publish dry run on every pull request.
`.github/workflows/release.yml` runs on every push to `main` and publishes the three packages to npm
at the next version (1.0.0 first, then 1.0.1, …), tagging the commit. See
[`RELEASING.md`](RELEASING.md).

## License

[MIT](LICENSE). The Figtree and Geist fonts in `packages/core/fonts` are under the SIL Open Font
License 1.1 (their `*-OFL.txt` files).

## Status

- The tokens are copied from AntFabric's desktop app and mobile app. The web token profile is a proposal, because there is no AntFabric web
  app to copy values from.
- Neither app consumes the kits yet.
