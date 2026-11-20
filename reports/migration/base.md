# Base components (and Fab)

- Card, Dialog, BottomSheet: `content={…}` → children (`<Card>…</Card>`).
- ListItem: new `titleLines` (web default 1, phone 2); phone `onLongPress`. Its `icon`/`avatar` no longer default to AntFabric samples.
- Dialog: new `behindTitle` (the stacked underlay's title, was a fixed "Edit #release-train").
- ProgressBar: `label` defaults to "Progress" (was "Uploading Q4 roadmap.pdf"). Skeleton's `label` defaults to "Loading" text from `strings`.
- InlineBanner: a danger banner is `role="alert"` (assertive on the phone).
- Menu: items are core's `MenuItem` (re-exported); `toggled` matches `key ?? label`.
- EmptyState: `art` defaults to `none` (was `messages`).
- Fab: `variant="compose"` → `"ink"`, `"fabric"` → `"tint"`, `"help"` → `"raised"` (default `"ink"`); the phone's pen wiggle → `wiggle` (old compose = `variant="ink" wiggle`).
- Text the kit drew is now `strings` (English defaults unchanged unless noted): override per tree with the root's `strings`, per instance with the component's.
- InlineBanner: with no `icon`, draws its tone's glyph (`info` for neutral and brand, `triangle-alert` for warning, `circle-alert` for danger) instead of `wifi-off`; `icon=""` draws none. Pass `icon="wifi-off"` where a banner is about the connection.
