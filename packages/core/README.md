# @antfabric-ui/core

What both AntFabric UI kits share: the design tokens, the themes (`defineTheme`, `themes`), the CSS variables and React Native values they produce, shortcut formatting, the entrance motions and, from `/chart`, the formatters and scales behind every chart. A theme changes colours, fonts and anything else the tokens name; the kits draw `themes.neutral` until you give one.

You usually install it beside a kit, not on its own:

```bash
pnpm add @antfabric-ui/core @antfabric-ui/react          # web and desktop
pnpm add @antfabric-ui/core @antfabric-ui/react-native   # React Native and Expo
```

## Entries

| Import | What it is |
|---|---|
| `@antfabric-ui/core` | tokens, `defineTheme`, `themes`, `tokensCss()`, `resolveTokens()`, `formatShortcut`, `MOTION` |
| `@antfabric-ui/core/chart` | number and date formatters and the scales the chart components use |
| `@antfabric-ui/core/dtcg` | the tokens as a W3C Design Tokens tree |
| `@antfabric-ui/core/antfabric` | AntFabric's own wording (`antfabricStrings`), opt-in |
| `@antfabric-ui/core/tokens.json` | the W3C Design Tokens file |
| `@antfabric-ui/core/fonts.css` | `@font-face` for Geist and Figtree, with the font files beside it |

## Docs

- [Using AntFabric UI in an app](https://github.com/AntFabric/antfabric-ui/blob/main/CONSUMING.md): install, the root, fonts, themes, tokens and imports.
- [Coming from 0.1](https://github.com/AntFabric/antfabric-ui/blob/main/MIGRATION.md).
- [Changelog](./CHANGELOG.md).

## License

MIT. The Geist and Figtree fonts in `fonts/` are under the SIL Open Font License 1.1 (`Geist-OFL.txt`, `Figtree-OFL.txt`).
