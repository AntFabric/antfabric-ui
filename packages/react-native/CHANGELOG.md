# @antfabric/ui-react-native

## 1.1.0

Fixes from the 1.0 component review (`reports/audit/2026-11-23-component-review.md`). Each batch notes what a consumer sees; the headings are folded into Fixed, Changed and Added before release.

### Batch 1: controlled state

- A control given only its change handler keeps its own state: `<Switch onCheckedChange={save} />` turns on, `<TextField onValueChange={save} />` keeps what is typed, `<Select onOpenChange={log} />` opens, `<Tabs onValueChange={log} />` moves. Before, the prop's default held it there forever. Fixed in every component with a changeable prop (Switch, Checkbox, RadioGroup, Select, TextField, SearchField, Chip, SegmentedControl, IconButton, Tabs, ListItem, Popover, Sheet, SwipeRow, Composer, Message, AttachmentCard, ReactionPill, ThreadSummary, ApprovalItem, QuestionPanel, ThinkingIndicator, UpdateBanner, NotificationSchedule, Pagination's `pageSize`, TabBar, SidebarSection, WorkspaceSwitcher). Passing the value with its handler is controlled, as before.
- An array or plain-object value passed without its handler (ContextMenu `picked`, Table `sort` or `selected`) is compared by its items, so re-rendering the parent with an equal inline value no longer undoes the person's change.

### Batch 2: focus, Escape and IME

### Batch 3: theme sanitiser

### Batch 4: packaging and icons

- The types resolve under `moduleResolution: node16` and `nodenext`: the `.d.ts` files' relative imports name their `.js` (H11).
- Every published file starts with `"use client"`, as the web kit's do; Metro ignores it (H12).
- Each `.js` file ships with its source map (L72).
- CONSUMING.md: charts from `./data` draw their text in Geist on every theme, so an app on `themes.antfabric` that draws them loads the `Geist-*` files beside Figtree (M56); `testID`, `nativeID`, `accessibilityLabel`, `accessibilityHint` and `ref` pass through to a component's root (L71).
- Icons no longer pull in all of lucide-react-native (H13). The kit registers only the 74 icons it draws, imported one by one. A name the kit does not draw draws an empty box and warns once in development: register it with the new `registerIcons({ GitBranch })`, or pass the component, which `Icon` and every icon prop now take (`IconName` is `string | IconComponent`; `IconComponent` is exported). MIGRATION.md, "1.0 → 1.1: icons".

### Batch 5: data core

- Charts, Table and KPIs: the core format fixes (`@antfabric/ui-core`'s Batch 5) reach every value they print. A chart whose `x` is an ISO date string no longer crashes, a `date` cell holding `"2026-03-01"` shows Mar 1 in every zone, `{ type: "currency", digits: 2 }` prints cents, and a cell whose text is not a number shows the dash instead of `NaN`.
- GaugeChart: with the default `percent` format, the value, the target, the two ends, the summary and "View as table" print as a share of `max`, as Meter does: `value={58} max={100}` is 58%, not 5,800%. A gauge with `max` 1 (the docs' examples) draws as before.
- Table: a row without its `rowKey` field is named by its index in `rows`, so ticking one such card ticks that row only (they all had the id `"undefined"`). "View as table" passes `chartTable`'s `rowKey`, so a chart's data field named `key` is shown as it is.
- Meter: a `score` meter with no value no longer shows the critical icon with `showState`.

### Batch 6: the app drives the state

### Batch 7: announcements

### Batch 8: focus hand-off

### Batch 9: pass-through props

### Batch 10: contrast and target size

### Batch 11: React Native overlays

- Android back closes the innermost overlay first: `useBackHandler` adds its listener once each time an overlay opens, not on every render, so a Select open inside a BottomSheet closes before the sheet (H16).
- Sheet with `dismissible={false}` can no longer be closed by the handle, a drag, back or the escape gesture, which left an empty scrim. BottomSheet takes `dismissible` (default `true`); off, there is no ×, the handle is only a picture and none of the ways out do anything (H17).
- Popover opened by its `open` prop is placed beside its trigger. The trigger was measured only on its own press, so the panel stayed invisible under a backdrop that took the next tap (H18).
- BarChart, ComboChart and MetricTabs: tapping a bar, then passing fewer rows, no longer throws. A tapped bar's tooltip and dimming now close on a second tap of the same bar or a tap beside the bars (H19, M48).
- BottomSheet fills what it is given (the screen, a Modal): the 375pt frame and the room above the panel were the catalogue's demo stage, and now are the catalogue's. A tall sheet reaches the top of its box, so give it the room above (the header row) yourself. A press on the scrim above the panel closes it, as the docs said (M20).
- Dialog: the escape gesture respects `dismissible`, and an error that arrives is announced on iOS (M21).
- ContextMenu: the emoji panel's search field narrows the emoji shown, by their English names (M22).
- TabBar: squeezed with an `active` that no tab has (a pushed screen), the disc is still drawn, with a chevron, and brings the tabs back; its touch area is 44pt (M33, L48). New string `tab-bar.show` ("Show tabs").
- SidebarItem: a hold is a press unless `onLongPress` is given (M39).

### Batch 12: per-component fixes

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

### Patch Changes

- Updated dependencies: @antfabric/ui-core@1.1.0

## 1.0.0 (internal registry)

### Major Changes

- 1.0: the kit is a generic base. With no theme every component draws `themes.neutral`; AntFabric's look is `themes.antfabric`, passed once as `theme` on `AntFabricRoot` or `ThemeProvider`. Light or dark is `scheme` (`Theme` is now the theme object; `brand` is part of a theme made with `defineTheme`). Every component takes `styles` (per part) and `strings` (the text the kit draws), and both roots take `strings` and `locale`. Containers take children instead of `content`. App chrome is `./shell` and the conversation is `./chat`, on both kits. One set of names across all 85 components: a changed value is `on<Prop>Change` (`onChange` is gone), an item is named by `key`, open or closed is `expanded`. `AppBadge` takes your product's `mark`; core no longer exports `ANTFABRIC_MARK`. `ProjectMoveCard` is removed.

  This breaks every consumer once, on purpose. `MIGRATION.md` has the short path (install 1.0, run the codemod `pnpm migrate:1`, keep AntFabric's look with `themes.antfabric`), and every break by area.

### Patch Changes

- Updated dependencies: @antfabric/ui-core@1.0.0
