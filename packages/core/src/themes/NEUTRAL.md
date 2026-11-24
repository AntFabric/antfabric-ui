# The `neutral` preset

A shadcn-like look: zinc greys, a near-black primary, small radii, Geist, plain-black shadows. It is an override set over `tokens.ts` (`neutral.ts`), a look and not a density: no size, space or control height is touched. Colours are literals because the kit's primitives are AntFabric's (warm `neutral`, navy ink `#0e1828`, coral) and have no zinc ramp. Steps are Tailwind's zinc: 50 `#fafafa`, 100 `#f4f4f5`, 200 `#e4e4e7`, 300 `#d4d4d8`, 400 `#a1a1aa`, 500 `#71717a`, 600 `#52525b`, 700 `#3f3f46`, 800 `#27272a`, 900 `#18181b`, 950 `#09090b`.

## What it sets

| | Light | Dark |
|---|---|---|
| `surface.page` / `card` / `raised` | `#fff` / `#fff` / `#fff` | `#09090b` / `#18181b` / `#202023` |
| `surface.sidebar` / `recessed` / `muted` / `selected` | `#fafafa` / `#fafafa` / `#f4f4f5` / `#eeeef0` | `#111113` / `#111113` / `#27272a` / `#34343a` |
| `hover.surface` | `#f4f4f5` | `#27272a` |
| `fg.strong` / `body` | `#09090b` / `#18181b` | `#fafafa` / `#e4e4e7` |
| `fg.muted` / `subtle` / `faint` = `placeholder` | `#52525b` / `#5d5d66` / `#6b6b74` | `#b4b4bb` / `#aaaab2` / `#9c9ca5` |
| `brand.default` (primary) / `hover` / `active` | `#18181b` / `#27272a` / `#3f3f46` | `#fafafa` / `#e4e4e7` / `#d4d4d8` |
| `fg.onBrand` | `#fff` | `#18181b` |
| `brand.soft` / `softHover` / `tint`, `fg.onBrandSoft` | `#f4f4f5` / `#e4e4e7` / `#f4f4f5`, `#18181b` | `#27272a` / `#3f3f46` / `#27272a`, `#fafafa` |
| `accent.default` / `soft` | `#71717a` / `rgba(24,24,27,.06)` | `#a1a1aa` / `rgba(250,250,250,.1)` |
| `link.default` | `#18181b` | `#fafafa` |
| `border.subtle` / `muted` / `default` | `#e4e4e7` / `#d4d4d8` / `#8f8f98` | `#27272a` / `#3f3f46` / `#71717a` |
| `border.active` / `strong` / `brand` | `#71717a` / `#09090b` / `#d4d4d8` | `#a1a1aa` / `#fafafa` / `#3f3f46` |
| `focus.ring`, `shadow.focus` | `#71717a`, `0 0 0 1px #fff, 0 0 0 3px #71717a` | `#a1a1aa`, `0 0 0 1px #09090b, 0 0 0 3px #a1a1aa` |
| `surface.unread` | `rgba(9,9,11,.03)` | `rgba(250,250,250,.04)` |
| `surface.inverse` / `fg.onInverse` | `#18181b` / `#fafafa` | `#fafafa` / `#18181b` |
| `danger.default` / `soft` / `solid` | `#c81e1e` / `#fef2f2` / `#dc2626` | `#f87171` / `#2a1415` / `#dc2626` |

Also: `switch.trackOff` (`#8f8f98` / `#71717a`), `skeleton.*`, `tabs.track`, `tag.neutral*` and `tag.brand*` (the "brand" tag is the shadcn default badge: ink fill, paper text), `scrim.*` (navy `rgba(14,24,40)` to `rgba(9,9,11)`), `glass.edge`, `os.statusFg`, `table.header` / `rowHover`, and every light shadow (`hairline` `card` `raise` `float` `pill` `menu` `modal` `tooltip` `glass` `glassContrast`: black at 5 to 12 per cent instead of navy; the dark ones were already black). The web and desktop switch's `thumbShadow` was navy; now black.

- **Radius** (shared): tag 4, row 6, control 6, input 6, card 10, rail 10, panel 12, sheet 16, tray 12; `pill` and `circle` stay. The phone's own `radius.card` is set too (`profiles.mobile`: 16 to 12, still one step rounder than the desktop's 10). The layer rule means a shared `card` alone would not have reached it.
- **Type**: Geist for `font.sans` and `font.display`. The web stack is `"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` (it ends in the system's, not Figtree); `fonts.css` already declares Geist at 400 / 500 / 600 / 700. The phone's files per weight are `Geist-Regular`, `-Medium`, `-SemiBold`, `-Bold`, and `extrabold` maps to `Geist-Bold` (Geist ships no ExtraBold). The app registers them with expo-font under those names. Mono is unchanged.
- **Primary** is the only strong fill; hover and pressed move one step along zinc, so a primary that was coral now reads as ink. `brand.active` goes lighter in dark (as AntFabric's did) and darker in light.

## Left as they are, on purpose

- **Identity colours**: `identity.*` (avatar palette, `identity.agent` coral for Fabric, `identity.ink`, `identity.red`) and `presence.*`. A person keeps their colour and Fabric stays recognisable under any theme.
- **Chart and data colours**: `chart.*`, `data.*` and `table.rowSelected` (the blue wash). `chart.axis`, `chart.crosshair`, `chart.tooltip*` and the `data.*` hues still carry the navy and blue of the data palette; retinting them is a separate decision.
- **Status**: `success`, `warning`, `info` and the `tag.*` status pairs stay (all pass, below). `danger` moved from crimson `#c9184a`, which reads pink beside zinc, to a plain red.
- **OS imitation**: `os.*` except `statusFg`, and `glass.bg` / `clear` / `tinted` / `solid` (already neutral).

## Contrast

WCAG 2.x relative luminance, alpha foregrounds composited on their background. Text 4.5:1, UI boundaries and the focus indicator 3:1. Every required pair below passes in both schemes. (The script lived in the scratchpad: parse the two values, composite, `(L1 + .05) / (L2 + .05)`, over the resolved `tokens.themes[scheme]` with the theme's sets laid on.)

| Pair | Need | Light | Dark |
|---|---|---|---|
| `fg.strong` on page / card | 4.5 | 19.9 / 19.9 | 19.1 / 17.0 |
| `fg.body` on card / muted / selected | 4.5 | 17.7 / 16.1 / 15.3 | 14.0 / 11.7 / 9.8 |
| `fg.muted` on card / muted / selected | 4.5 | 7.7 / 7.0 / 6.7 | 8.6 / 7.2 / 6.0 |
| `fg.subtle` on card / muted / selected | 4.5 | 6.5 / 5.9 / 5.6 | 7.7 / 6.5 / 5.4 |
| `fg.faint` (and `placeholder`) on card / muted / selected | 4.5 | 5.3 / 4.8 / **4.55** | 6.5 / 5.5 / **4.54** |
| `link.default` on card / muted | 4.5 | 17.7 / 16.1 | 17.0 / 14.3 |
| `fg.onBrand` on `brand.default` / hover / active | 4.5 | 17.7 / 14.9 / 10.4 | 17.0 / 14.0 / 12.0 |
| `fg.onBrandSoft` on `brand.soft` / softHover | 4.5 | 16.1 / 14.0 | 14.3 / 10.0 |
| `fg.onInverse` on `surface.inverse` | 4.5 | 17.0 | 17.0 |
| `tag.*` pairs (neutral / brand / success / warning / danger / info) | 4.5 | 7.0 / 17.0 / 5.3 / **5.0** / 6.1 / 5.5 | 10.1 / 17.0 / 7.8 / 8.2 / 5.9 / 5.6 |
| `danger.default` on card / soft | 4.5 | 5.7 / 5.2 | 6.4 / 6.3 |
| `danger.fg` on `danger.solid` | 4.5 | **4.83** | **4.83** |
| `success` / `warning` / `info` `.default` on card | 4.5 | 6.7 / 5.7 / 5.3 | 10.1 / 10.9 / 7.1 |
| `info.default` on `info.soft` | 4.5 | **4.55** | 5.6 |
| `border.default` on card / raised / recessed (checkbox, radio, composer edge) | 3 | 3.2 / 3.2 / **3.07** | 3.7 / **3.36** / 3.9 |
| `switch.trackOff` on card | 3 | 3.2 | 3.7 |
| `border.active` on card | 3 | 4.8 | 6.9 |
| `focus.ring` on page / card / sidebar | 3 | 4.8 / 4.8 / 4.6 | 7.8 / 6.9 / 7.4 |
| `border.strong` on card | 3 | 19.9 | 17.0 |
| `border.subtle` / `muted` on card (dividers, card and field edges) | decorative | 1.27 / 1.48 | 1.19 / 1.70 |

The worst passing pairs are `border.default` on `surface.recessed` (3.07 against 3), `fg.faint` on `surface.selected` (4.54 / 4.55), `info.default` on its soft (4.55) and white on `danger.solid` (4.83). Nothing required fails.

**Not required, and below 3:1 by design**: `border.subtle` and `border.muted` are dividers and card edges, as shadcn's `border` is.

**Field edges pass 3:1**. A field's edge was `border.subtle` or `border.muted` (1.22 to 1.48:1), below WCAG 1.4.11's 3:1 for the boundary of a control. Neutral now draws it in `border.default`: 3.21:1 on white and 3.07:1 on `#fafafa` in light, 4.12:1 on the page and 3.67:1 on a card in dark. The overrides are `text-field.field`, `select.trigger`, `search-field.root`, `radio-group.pill`, `dialog.field`, `question-panel.field` and `in-app-banner.field`, each `borderColor: "$border.default"`. `antfabric` keeps its 1.0 edges.

## Sizes neutral changes

Neutral was a look only: every size was the kit's. Two size rules from the audit are now neutral's, so a product that passes no theme gets them; `antfabric` keeps 1.0's sizes.

- **One height per size name** (X-04): `sm` is `control.hSm`, `md` `control.hMd`, `lg` `control.hInput`, across Button, Select, TextField and SearchField. The overrides are Button's `sm` and `lg` heights and the Select trigger's and SearchField's base height (both were `control.hLg`). The phone's `control.hLg` is 48 (was 40, under its `hMd` 44), so the phone's scale climbs.
- **24px desktop targets** (X-05, WCAG 2.2 2.5.8): the desktop profile's `control.hXxs` is 24 (was 22), as the web's already is.
  (`control.hIconSm` is 24 on the desktop in the schema itself since B10, so both themes have it.)
- **24px targets in the components** (X-05, S1-04, S1-05, S3-13, S3-19): on the web and the desktop a radio row (`radio-group.option`) and
  ConnectionBanner's retry take `control.hit`; the macOS menu bar's rows and titles (`osMenu.macItemH`, `macTitleH`) are 24. A label-less
  checkbox, a chip's ✕ and a notification row's actions moved into the schema in B10, so `antfabric` has them too. The phone reaches 44pt by
  `hitSlop` in both themes, which draws nothing.
- **The segmented strip** (S1-18): `segmentedControl.h` is 26 on the web, 24 on the desktop and 34 on the phone, so the strip (tab, track
  padding and edge) is as tall as `control.hMd` beside the other medium controls.

## Text over its own fade

Three pairs drawn at 0.6 or 0.7 opacity over their own ink fell under 4.5:1 (X-06): a chip's count (2.89:1), the shortcut on a danger
button (2.98:1) and a sending message's time and status (2.38:1). The kits' 0.7 is the token `opacity.secondary` now (the same 0.7 in
`antfabric`), so neutral sets `chip.count` and `button.shortcut` to no fade, and `message.root`'s sending variant to no fade (the status line
still says "Sending…"). The agent identity (`identity.agent`) is `#d2321e` here: white initials on the old coral were 3.42:1, now 4.98:1.

Still under 4.5:1 and not reachable from a theme: WorkspaceSwitcher dims a workspace that is not live to 0.5 inline (initials 2.66:1), and
MetricTabs draws a metric's axis labels in its series colour (2.54:1 for the orange). Both need a kit change that would move `antfabric`'s
look, so they are not fixed yet.

The focused tab draws its ring inside (`tabs.tab` focus: `ring` instead of the outer `shadow`), because the strip scrolls and clips an outer ring (S2-13).

## Recipe overrides neutral needs

Written into `neutral.ts` under `recipes` (typed against each recipe, so a wrong part or value does not compile), except the ProjectMoveCard row (it left the kit at 1.0) and the optional icon-button change. NavRail's chip and rows are its `pill` and `row` parts. Paths are `<recipe>.<part>.<base|variant|state>.<property>`.

Shape, pill to rounded rectangle:

- `button.root.base.radius`: `$radius.pill` to `$radius.control`. Also `button.root.base.weight`: `$font.weightSemibold` to `$font.weightMedium` (shadcn buttons are medium; optional).
- `button.root.variant.ink`: its hover is `bg: $brand.default`, which now equals the ink fill, so hover does nothing. Hover to `$brand.hover` (and `fg` to `$fg.onBrand` follows), pressed stays `$brand.active`. Needed.
- `segmented-control.track.base.radius` to `$radius.control`; `.tab.base.radius` and `.card.base.radius` to `$radius.tag` (nested inside the track by its padding).
- `radio-group.pill.base.radius` (the pill-shaped choice, field height): to `$radius.input`, so it matches a field.
- `nav-rail.chip.base.radius` and `nav-rail.item.base.radius` to `$radius.control`. `nav-rail.profile` is an avatar and stays round.
- `app-menu-bar.segment.base.radius` (the web theme switch's segments) to `$radius.control`, and `.themeTrack.base.radius` to `$radius.control` with it.
- `command-palette.pill.base.radius` (filter pills, hXs) to `$radius.control`.
- `in-app-banner.field.base.radius` (reply field, web and desktop) to `$radius.input`; `context-menu.search.base.radius` (phone search) to `$radius.input`.
- `update-banner.banner.base.radius` (web inverse pill) to `$radius.card`; `connection-banner.retry.base.radius` to `$radius.control`.
- `notification-schedule.resume`, `.resumeBordered` to `$radius.control` (small action buttons).
- (removed at 1.0 with ProjectMoveCard) `project-move-card` mobile choice row (`radius.pill`) to `$radius.control`.
- Optional: `icon-button.root.base.radius` is `$radius.circle` (its `shape: circle` variant); shadcn icon buttons are rounded squares, so set the base to `$radius.control` and keep the `square` variant.

Kept pill, because the shape means pill: `text-field.tag`, `chip.root`, `badge`, `reaction-pill`, `message-divider` labels, `switch.track`, `progress-bar`, `meter`, `skeleton` lines, `attachment-card` tracks and voice card, `breadcrumbs.pill`, `delta` badge, `notification-schedule.pill`, `tab-bar` (the phone's floating bar, a platform idiom), `avatar-stack`, `app-badge`, grabbers and the island.

Colour that collides under neutral, found by reading the recipes for `$brand.default` on or beside `$surface.inverse`:

- `toast.mark.variant.tone.success` fills a disc with `$brand.default`, which in light is the toast's own `surface.inverse` (both `#18181b`), so the disc vanishes (the white tick still shows). Use `$success.default`, or `$surface.recessed` with `$fg.strong`. Needed in light; dark is fine.
- `text-field.tag` and `chip.root` read `brand.soft` / `border.brand` as their tinted state; under neutral those are zinc wash and `#d4d4d8`, which is intended and needs no override.
- `link.default` is zinc-900 / zinc-50 here, so the links the recipes draw (`thread-summary.replies`, `composer` edit label, `message-divider.new`, `message.pinned`, `attachment-card` action) tell themselves from body text by weight alone (all are semibold or bold). If any should read as a link in running text, add `textDecoration: underline` to those parts.
