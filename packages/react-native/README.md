# @antfabric/ui-react-native

A generic, themeable component kit for React Native and Expo. StyleSheet over `useTheme()` tokens from [`@antfabric/ui-core`](https://www.npmjs.com/package/@antfabric/ui-core); the look is a theme passed to `ThemeProvider`, and the props match [`@antfabric/ui-react`](https://www.npmjs.com/package/@antfabric/ui-react)'s.

```bash
pnpm add @antfabric/ui-react-native @antfabric/ui-core lucide-react-native
npx expo install react-native-svg expo-font expo-glass-effect
```

Peers: `react` 19.1 or later, `react-native` 0.81 or later, `react-native-svg`, `lucide-react-native`, and optionally `expo-glass-effect` (iOS 26's system glass; without it the kit draws its own).

## Entries

| Import | What it is |
|---|---|
| `@antfabric/ui-react-native` | `ThemeProvider` and the generic components |
| `@antfabric/ui-react-native/data` | charts, KPIs, panels and tables (brings react-native-gifted-charts) |
| `@antfabric/ui-react-native/shell` | the app frame and pictures of native surfaces |
| `@antfabric/ui-react-native/chat` | messages, threads and the composer |

The packages are ES modules only. With Jest (`jest-expo`), add `@antfabric/ui-.*` to the `transformIgnorePatterns` allow-list.

## Docs

- [Using AntFabric UI in an app](https://github.com/AntFabric/antfabric-ui/blob/main/CONSUMING.md): install, `ThemeProvider`, fonts, themes, tokens and imports.
- [Coming from 0.1](https://github.com/AntFabric/antfabric-ui/blob/main/MIGRATION.md).
- [Changelog](./CHANGELOG.md).

## License

MIT
