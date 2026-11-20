# @antfabric-ui/react

A generic, themeable component kit for React: the web and the desktop (Tauri). Inline styles over the token variables from [`@antfabric-ui/core`](https://www.npmjs.com/package/@antfabric-ui/core); the look is a theme passed to the root. The props match [`@antfabric-ui/react-native`](https://www.npmjs.com/package/@antfabric-ui/react-native)'s.

```bash
pnpm add @antfabric-ui/react @antfabric-ui/core lucide-react
```

Peers: `react` and `react-dom` 19.1 or later, `lucide-react`.

```tsx
import "@antfabric-ui/core/fonts.css";
import { AntFabricRoot, Button } from "@antfabric-ui/react";

export function App() {
  return (
    <AntFabricRoot platform="web" scheme="light">
      <Button label="Send invite" onPress={() => {}} />
    </AntFabricRoot>
  );
}
```

## Entries

| Import | What it is |
|---|---|
| `@antfabric-ui/react` | the root, providers and the generic components |
| `@antfabric-ui/react/data` | charts, KPIs, panels and tables (brings recharts) |
| `@antfabric-ui/react/shell` | the app frame and pictures of native surfaces |
| `@antfabric-ui/react/chat` | messages, threads and the composer |

The packages are ES modules only.

## Docs

- [Using AntFabric UI in an app](https://github.com/AntFabric/antfabric-ui/blob/main/CONSUMING.md): install, the root, fonts, themes, tokens and imports.
- [Coming from 0.1](https://github.com/AntFabric/antfabric-ui/blob/main/MIGRATION.md).
- [Changelog](./CHANGELOG.md).

## License

MIT
