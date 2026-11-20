# Migration ledger (0.1 → 1.0)

Every break between 0.1.0 and 1.0, before → after, one file per area. Written as each wave
landed, from the builders' own reports. `MIGRATION.md` and the codemod (`scripts/migrate-1.mts`) are built from here; the naming
rules behind the renames are `reports/api/conventions.md`.

- `foundations.md`: themes, scheme, brand, the root, subpaths, defaults.
- `base.md`: actions, inputs, display, feedback, overlays, navigation (the 29 base components) and Fab.
- `data.md`: the 20 data components and core's chart helpers.
- `shell.md`, `notifications.md`, `system-overlays.md`: the 23 app-chrome components.
- `messaging.md`, `agent.md`: the 14 chat and agent components.
- `conventions-*.md`: the renames of `conventions.md` (after the third review), one file per implementer.
