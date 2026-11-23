# @antfabric/ui-core

## 1.1.0

Fixes from the 1.0 component review (`reports/audit/2026-11-23-component-review.md`). Each batch notes what a consumer sees; the headings are folded into Fixed, Changed and Added before release.

### Batch 1: controlled state

- `useControllable(value, onChange)`: a value left out (`undefined`) keeps the component's own state even when `onChange` is passed, as its comment always said; only the value and the handler together make it controlled.
- `useControllable` compares an array or plain-object value by its items when deciding whether the caller passed a new one, so an inline `selected={["a"]}` or `sort={{ … }}` without its handler no longer resets the person's change on every parent render.

### Batch 2: focus, Escape and IME

### Batch 3: theme sanitiser

- `defineTheme` now rejects a value holding a control character (a newline, tab or carriage return), `@`, `!`, or a function that loads a resource (`url(`, `image(`, `image-set(`, `-webkit-image-set(`, `src(`, `element(`, `cross-fade(`); a brand `soft`, `softHover`, `onSoft` or `tint` must be a colour (hex, `rgb()` or `hsl()`); and `resolveTokens` for the phone throws on a theme that gives a size the phone reads as a number in `rem`, `em`, `%` (other than `50%`) or `calc()`. (H10, L73)

### Batch 4: packaging and icons

- The types resolve under `moduleResolution: node16` and `nodenext`: the `.d.ts` files' relative imports name their `.js` (H11).
- Each `.js` file ships with its source map (L72).
- An item's `icon` (`MenuItem`, `NavItem`, `ActionItem`, `IconActionItem`) is an `IconName`: a lucide name or the icon component (new `IconComponent` and `IconName` types), so an app can pass a glyph it has not registered with a kit (H13).
- Core carries no `"use client"`. Under the `react-server` condition `./dtcg` and `./antfabric` load; the root and `./chart` do not yet (they call `createContext` and import `useState` when they load), so a Next.js layout builds its theme in a `"use client"` file (CONSUMING.md section 3).

### Batch 5: data core

- `fmt`: the `date`, `month` and `day` formats take an ISO string as well as a Date or a timestamp, and print `unavailable` for anything that is not a date instead of throwing `Invalid time value`. A date-only string (`"2026-03-01"`) is a calendar day: it prints as that day in every zone, so a Table cell no longer shows Feb 28 west of UTC and the server and the browser agree; a full date-time is still the instant it names, in `timeZone` or the viewer's zone. `whenOf` now lives in `format.ts` (still exported from `@antfabric/ui-core/chart`) and returns `undefined` for an invalid Date, so a Table sorts it last.
- `fmt`: `currency` honours `digits` (`{ type: "currency", digits: 2 }` prints `$19.99`); the default stays whole units. `points` takes its sign from the rounded number (no `-0.0 pts`), a negative `duration` is signed once (`-2m 30s`), and text a number format cannot read (`"abc"`, `""`) prints `unavailable` instead of `NaN`.
- `niceScale`: a small range at a large magnitude (near 1e12 to 1e16) no longer loops forever or repeats ticks: the step is never finer than the 12 significant digits a tick is rounded to. A side that is `NaN` or infinite takes the other's value, a reversed domain is turned round, and a `count` that is not above zero is 4 (at most 1,000).
- `summarize`: numeric text (`"120"`) counts as its number, `NaN` and other text are gaps, and a series from 0 says the direction it went (0 to -5 "fell", not "rose").
- `summarizeGauge` with a percent format prints each value as its share of `max` (58 of 100 is 58%), through the new `meterShown(value, max, format)` that `meterReading` also uses.
- `chartTable` keeps a data field named `key`: it returns `rowKey`, the field the rows are named by (`key`, or `_key` when the data has a `key`), to pass to the Table. New `rowIds(shown, rows, rowKey)`: a row without the field is named by its index in `rows`.

### Batch 6: the app drives the state

- New `usePending(answer)` (re-exported by both kits): `const { pending, run } = usePending([status, error])`, then `run(onRetry)`. `run` sets `pending` and calls the handler; pending clears when the promise the handler returns settles (either way) or when a value in `answer` changes, compared as `useControllable` compares (a re-render with equal props is not an answer). A press while pending does nothing, and with no handler nothing is pending. The kits use it so a component never shows the result of a request before the app confirms it (S2). MIGRATION.md, "1.0 → 1.1: the app drives the state".

### Batch 7: announcements

- **Added, strings:** `mobile-header.online` ("Back online"), said when the phone header's connection line goes away (L55). A product that overrides the header's strings may add it.

### Batch 8: focus hand-off

### Batch 9: pass-through props

### Batch 10: contrast and target size

- `fg.onBrand` is picked by contrast for every theme: white where white reaches 4.5:1 on `brand.default`, otherwise ink (`fg.strong`'s `#0e1828`). AntFabric's coral takes ink (white was 3.42:1), so **AntFabric's primary buttons, brand badges, ticked checkboxes and other brand fills now draw dark ink**. `brandValues` always writes `fg.onBrand`; `defineTheme` derives it in each scheme where a theme's `brand` or `tokens` set `brand.default`, unless its own `tokens` set `fg.onBrand` (`onBrandFor` in `src/brand.ts`, not exported). (H14)
- New token `os.onFill` (white in both themes): the text an OS imitation draws on its own fills (the macOS menu highlight, the red badge, the Windows close button, a tray menu's hovered row, the lock and home screens). Those recipes, and the danger swipe and toast's error mark (now `danger.fg`), no longer read `fg.onBrand`, so they stay white.
- Light-scheme chart and data colours hold 3:1 on the card (WCAG 1.4.11), each darkened in OKLCH on its own hue: `chart.series2` #d67b04, `series4` #0aa57f, `series6` #b78c01, `series7` #3b95f0, `chart.previous` #7b94b0 (and #506f9b in dark), `chart.other` charcoal.450, `data.positive` #02a860, `data.warning` #d77c03. `chart.track` is a ground, not a mark, and keeps its value. (M42)
- 24px pointer targets on web and desktop (WCAG 2.2 2.5.8): `control.hIconSm` is 24 on the desktop (was 20; IconButton `sm`, Toast's close, ProgressBar's header) and `chip.removeSize` 24 on web and desktop (was 20). The `checkbox` recipe's root is at least `control.hit` square, and `notification-item`'s `rowAction` at least `control.hit` tall, on web and desktop (`neutral` had these; they moved into the schema). (M10, M50, L53)
- `kitCss` documents that a field's outline is taken off by `[data-af-input]:focus`, never inline, so the forced-colours outline reaches a focused field (H15).
- `pnpm check tokens` measures contrast for `antfabric`, `neutral` and two brand probes in both schemes; `reports/generic.json` `contrastTodo` lists the six pairs that still fall short (brand hover and pressed under ink, the translucent focus halo).

### Batch 11: React Native overlays

- Strings: `tab-bar.show` ("Show tabs"), the squeezed TabBar disc's name when no tab is open (M33).

### Batch 12: per-component fixes

Messaging, agent and feedback:

- The AttachmentCard recipe has a `chipOpen` part: the ready staged chip's open target (gap, radius and its focus ring), which `styles.chipOpen` reaches in both kits.
- Strings: AttachmentCard's `removePreview` is read by the phone too (it drew no Remove preview before).

## 1.0.0

The first release on npm. The packages are renamed from `@antfabric-ui/core`, `react` and `react-native` to `@antfabric/ui-core`, `@antfabric/ui-react` and `@antfabric/ui-react-native`, in the `antfabric` npm organisation: rename the imports. It holds everything in the earlier internal 1.0.0 and 1.1.0 (below, from the old internal registry), plus:

- Dialog: `modal` (default `false`) and `dismissible` (default `true`). With `modal` the web and desktop dialog is drawn in the overlay layer of its AntFabricRoot: the scrim covers the window, the page behind does not scroll (the body and the box the page scrolls in, counted for stacked dialogs) and the rest of the root is inert and hidden from assistive tech; only the top dialog takes Esc and a press on the scrim, which cancel it. The phone draws it in a transparent Modal over the app, with a press above the sheet cancelling. `dismissible: false` turns off Esc, the scrim, the phone's handle and Android's back, for a step that must be answered with a button. Without `modal` nothing changes: the dialog is drawn where it is mounted, and no snapshot moved.
- Lighter, truer Geist on the web and the desktop. `@antfabric/ui-core/fonts.css` now loads Geist as one variable face (`fonts/Geist-Variable.woff2`, weights 100 to 900) instead of four static woff2 files, so an in-between weight such as 450 draws as asked instead of snapping to 500; the static `Geist-*.ttf` files (the phone's) and `Geist-*.woff2` files still ship, unused by the sheet. `AntFabricRoot` sets `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale` and `text-rendering: optimizeLegibility` on its element, so macOS draws text with grayscale antialiasing, as the reference product does, instead of a step heavier; `style` on the root still overrides them. No font weight or size token changes, and the phone kit is unchanged.
- NavRail: `section="none"` lights no section row in the drill-in variant (as `active="none"` lights no destination), for a page of a destination that belongs to none of its sections; any other unknown key still makes the first section current. The root no longer has `min-height: 680px`: that was the catalogue's stage height, and it made an app's rail taller than a short window (the catalogue's rail window now sets it). An app's rail fills the height it is given, and its destination list scrolls. The nav-rail and full-screen snapshots that contain it moved (accepted in parity with this reason).
- Popover: a new overlay in both kits, exported from the root entry: a panel that hangs from the control that opened it (a menu, a short form, a list). It takes `content`, `open` / `onOpenChange`, `side` (`top` | `bottom` | `left` | `right`, default `bottom`), `align` (`start` | `center` | `end`), `width`, `matchTrigger`, `label`, `bare` (no card, for a Menu), `modal`, `showTrigger`, `triggerLabel` and `children` (the trigger). On web and desktop the open panel is drawn in a new internal overlay layer: a fixed, full-window box rendered into the nearest AntFabricRoot (so the theme applies and no overflow clips it), placed from the trigger, flipped where there is no room, re-placed on scroll and resize, closed by Esc and a press outside (only the top overlay takes them), with focus moved in and back; `modal` traps Tab and makes the rest of the root inert. On the phone it is a transparent Modal placed with measureInWindow. Recipe `popover` (`root`, `panel`); no new token (it reads `z.popover`). Additive: nothing existing changes.
- RadioGroup: `appearance="cards"` draws each option as a selectable card (web, desktop and phone). An option can carry a `preview` (a node drawn at the top of the card) and `tags` (`{ label, tone? }[]`, the kit's Tag chips after the label); both are read by the cards only. The chosen card takes a 2px edge in the strong ink (not the brand), hover takes the edge to `border.default`, a disabled card is dimmed and cannot be chosen, and radio semantics and the arrow keys are unchanged. Web and desktop lay the cards out in as many columns of at least the new token `radioGroup.cardMinW` (220) as fit; the phone stacks them one per row. New recipe parts `card`, `cardPreview`, `cardHead`, `cardLabel`, `cardTags`, `cardDescription`; new exported type `RadioGroupOptionTag`; the phone kit now takes `appearance` too (`pills` is drawn as the list there, as before). Additive: the list and the pills draw exactly as before.
- Sheet: a new overlay in both kits, exported from the root entry: a panel that slides in from the side of the window over a scrim (a record's details, a short form, a navigation drawer). It takes `open` / `onOpenChange`, `side` (`start` | `end`, default `end`), `width` (0 = the new `sheet.w` token, 480), `title`, `subtitle`, `children` (the body, which scrolls), `footer` (actions), `showClose`, `label` (its name without a title) and `dismissible`. On web and desktop it is always modal, drawn in the overlay layer: Tab wraps inside, Esc and a press on the scrim close it (top overlay only), the page's scroll is locked and the rest of the root is inert. The phone draws the BottomSheet (drawn where it is mounted, as the BottomSheet is). Recipe `sheet` (`root`, `panel`, `header`, `title`, `subtitle`, `close`, `body`, `footer`); new token `sheet.w`; strings `sheet.label` ("Panel"). Additive: nothing existing changes.
- Table: a column can take `emphasis` (web and desktop), which draws its cells as the new `emphasis` part, the strong ink at medium weight, for the column that names the row. A new token `table.headRadius` (default 0) rounds the header row's two ends when a theme sets it: the first header cell's start corners and the last's end corners. Both are additive; a table that sets neither draws exactly as before.
- Table (web and desktop): a new prop `narrow` (`"scroll" | "cards"`, default `"scroll"`). With `"cards"`, while the table's own box is narrower than the new token `table.cardsBelow` (600, measured with a ResizeObserver, not the window), it draws the phone's card per row instead of the grid: the title column (in the strong ink), its badge and `renderActions` in the card's head, a label and value line for every other column, a sort bar (Select and a direction button) above and a compact pager under the cards; ticking, `onRowPress`, `renderCell`, loading and the empty state all work. The phone's card parts (`bar`, `barSort`, `cards`, `card`, `cardHead`, `cardTitle`, `cardLines`, `cardLine`, `cardLabel`, `cardValue`) now reach web and desktop. Additive: a table that does not set `narrow` draws exactly as before.
- TextArea: a new input in both kits, the multi-line sibling of TextField, exported from the root entry. It takes `label` (required), `value` or `defaultValue`, `placeholder`, `rows` (4), `mono` (the `font.mono` face, for code, JSON and templates), `readOnly`, `disabled`, `required` (a "Required" tag, as TextField), `helper`, `error` with `invalid`, `maxLength` with a counter, `hideLabel`, `onValueChange` and `onBlur`; on web and desktop also `name` and `resize` ("vertical" or "none"). Its recipe `text-area` has TextField's parts and states (`root`, `label`, `tag`, `field`, `input`, `error`, `errorIcon`, `errorText`, `helper`, `counter`) and reads TextField's tokens; no new token. Strings `text-area`: `required`, `characterCount`, `charactersLeft`, `limitReached`. Additive: nothing existing changes.
- TextField: `reveal` (default `false`). With `type="password"` it draws a Show / Hide button (the kit's ghost Button) at the end of the field, after any `trailing`: on, the characters are shown (the web input becomes `type="text"` for that time, still left to right; the phone turns `secureTextEntry` off) until it is pressed again. Its accessible name is "Show password" / "Hide password" and the web sets `aria-pressed`. New `text-field` strings: `show`, `hide`, `showLabel`, `hideLabel`. A new catalogue example ("Password with Show") adds renders to TextField's snapshot keys; no existing render changed (checked by running the docs without it). Additive.
- ToastRegion: a new feedback component in both kits, exported from the root entry: where the app's toasts appear. It takes `side` (`top` | `bottom`, default `bottom`), `align` (`start` | `center` | `end`, default `center`), `max` (3, the newest kept) and `children` (the Toasts, oldest first). On web and desktop it is a "Notifications" landmark in the overlay layer at `z.toast`, above modal dialogs and sheets, with pointer events only on the toasts; a press on a toast is not a press outside an open dialog or popover. The phone draws the stack where it is mounted (the app lays it over its screen). Recipe `toast-region` (`root`); strings `toast-region.label` ("Notifications"); no new token (it reads `z.toast`). Additive.

## 1.1.0 (internal registry)

### Minor Changes

- The component audit's fixes (168 findings: 132 fixed, 31 partly, 3 decided as rules for 2.0).

  Added, nothing renamed or removed:

  - **FormField**: a label, description, error and required around one control, which it gives an id, `aria-describedby`, `aria-invalid` and `aria-required`.
  - **Pass-through on every component** (`RootProps`): `id`, `className`, `data-*`, `aria-*` and `ref` on the web; `testID` (a prefix for the parts), `nativeID`, the accessibility label and hint and `ref` on the phone.
  - **Roots and providers** take `locale` (numbers, dates, currency and sorting), `dir` and, on the web, `autoFocus`. New hooks: `useLocale`, `useDirection`, and on the phone `useReducedMotion` and `fontScale`.
  - **New props**:
    - TextField: `type`, `autoComplete`, `name`, `inputMode`, `onSubmit`, `onBlur`, and phone secure entry.
    - Select: `name` and `onOpenChange`.
    - Button: `type`.
    - Toast: `duration` and `onPauseChange`.
    - Tooltip and HoverCard: `children`, `open` and `onOpenChange`.
    - Menu: `autoFocus`, plus href and radio rows.
    - ListItem and Card: `href`.
    - Tabs: `panels` and disabled tabs.
    - Avatar: `decorative`. Badge: `live` and `unread`.
    - Table: `total` (server-side paging and sorting), `renderCell`, `renderActions`, `onRowPress`, `maxHeight`, `currency`, column `maxWidth` and `wrap`, and phone `expanded`.
    - Pagination: `pageSizes`, `onPageSizeChange` and `jump`.
    - PeriodCompare: `inverse`.
    - ApprovalItem: `expired`, `failed`, `onRetry` and `expanded`.
    - Composer: `disabled`, `maxLength`, `autoFocus` and `avoidKeyboard`.
    - QuestionPanel: `autoFocus`. SwipeRow: `onPress`.
    - NavRail: `workspaceMenuOpen` and `profileMenuOpen`.
    - NotificationSchedule: `onCustomDateChange` and `onCustomTimeChange`.
    - MessageDivider: `expanded` and `level`.
    - Charts: `headingLevel`. LineChart: `marks`. Meter: `showState`. Sparkline and SparkBars: `format`.
  - **Token** `opacity.secondary` (0.7).

  Behaviour a product will notice:

  - **Keyboard and focus:**
    - Overlays move focus in when they open, keep Tab inside when modal, close on Escape and give focus back. A host drawing open overlays as pictures passes `autoFocus={false}`.
    - Menus, menubars, toolbars, tabs and radio groups move with the arrow keys.
    - Every control draws a keyboard focus state, and Windows High Contrast outlines it.
    - A message row is a tab stop that shows its actions.
  - **Announcements:** statuses are announced through one announcer on the web and through VoiceOver and TalkBack on the phone. Toast, the banners and Skeleton are no longer live regions mounted with their text, and Badge is no longer a live region by default.
  - **Defaults and layout:**
    - DonutChart's legend row picks its segment; the swatch now shows or hides it.
    - MobileHeader's `statusBar` and TabBar's `safeArea` default to false.
    - TitleBar's search is centred whatever its sides hold.
  - **Neutral theme** (the default; `antfabric` keeps 1.0's look):
    - Field edges are `border.default` (3:1).
    - Each size name draws one height across Button, Select, TextField and SearchField.
    - Desktop targets are at least 24px.
    - Faded text that fell under 4.5:1 is drawn at full ink, and the agent identity is a deeper coral.

- IconButton takes an optional `avatar` (`{ name, src?, identity?, presence? }`): a person's face fills the button in place of the icon, for a profile button. The face takes the button's size and shape on every platform, keeps the focus ring and badge, and is hidden from screen readers so `label` names the button once. A new `avatar` part restyles it. Without `avatar`, nothing changes.

## 1.0.0 (internal registry)

### Major Changes

- 1.0: the kit is a generic base. With no theme every component draws `themes.neutral`; AntFabric's look is `themes.antfabric`, passed once as `theme` on `AntFabricRoot` or `ThemeProvider`. Light or dark is `scheme` (`Theme` is now the theme object; `brand` is part of a theme made with `defineTheme`). Every component takes `styles` (per part) and `strings` (the text the kit draws), and both roots take `strings` and `locale`. Containers take children instead of `content`. App chrome is `./shell` and the conversation is `./chat`, on both kits. One set of names across all 85 components: a changed value is `on<Prop>Change` (`onChange` is gone), an item is named by `key`, open or closed is `expanded`. `AppBadge` takes your product's `mark`; core no longer exports `ANTFABRIC_MARK`. `ProjectMoveCard` is removed.

  This breaks every consumer once, on purpose. `MIGRATION.md` has the short path (install 1.0, run the codemod `pnpm migrate:1`, keep AntFabric's look with `themes.antfabric`), and every break by area.
