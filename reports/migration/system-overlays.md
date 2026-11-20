# System, overlays and navigation (root)

- HoverCard: no prop change; `strings["hover-card"].messageSelf` for "Open your space" (default "Message yourself").
- Breadcrumbs: `recording="recording" elapsed="4:31" onOpenRecordings={f}` → `status="live" statusLabel="Recording" statusDetail="4:31" statusAction="Open Recordings" onStatus={f}`; `paused` stays, `stopping` → `busy`, idle → `""`; recipe variant `recording` → `status`.
- ConnectionBanner: phone `queued={n}` → `pending={n}`; copy through `strings["connection-banner"]`.
- SessionState, UpdateBanner: no prop change; copy through `strings`.
- CommandPalette: `onAskFabric={f}` → `onAsk={f} agentName="Fabric"`; `onQuery` → `onQueryChange`; items `kind: "person"` → `avatar: true` (other kinds dropped); every item takes `key`, `selected` is a key; `CommandPaletteGroupItem` → `CommandPaletteItem`; pass `filters` and `filter` yourself; placeholder and offline copy from `strings["command-palette"]`.
- ContextMenu: pass `reactions` (no longer six emoji by default); `label` for the rows' name (default "Actions"); phone `title` defaults to "".
