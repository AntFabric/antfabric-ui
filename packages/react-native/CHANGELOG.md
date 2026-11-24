# @antfabric/ui-react-native

## 1.2.0

### Changed

- **`t` uses the category-first token names**: `t.color.text.muted`, `t.size.control.md`, `t.font.size.body` (see `@antfabric/ui-core`'s changelog and `MIGRATION.md`, "1.1 → 1.2"). The old keys (`t.fg.muted`) are still there, marked `@deprecated`, until 2.0; `npx af-tokens-codemod <dir>` rewrites them. Nothing a component draws changed.

## 1.1.0

1.1.0 fixes the 1.0 component review (`reports/audit/2026-11-23-component-review.md`). It removes nothing, but several components change behaviour (see "Changed" below, and MIGRATION.md, "1.0 → 1.1"). Token changes (`fg.onBrand`, chart colours, `os.onFill`) are in `@antfabric/ui-core`'s changelog.

### Changed (behaviour)

**Controlled state**

- **A control given only its change handler keeps its own state:** `<Switch onCheckedChange={save} />` turns on, `<TextField onValueChange={save} />` keeps what is typed, `<Select onOpenChange={log} />` opens, `<Tabs onValueChange={log} />` moves. Before, the prop's default held it there forever. Fixed in every component with a changeable prop (Switch, Checkbox, RadioGroup, Select, TextField, SearchField, Chip, SegmentedControl, IconButton, Tabs, ListItem, Popover, Sheet, SwipeRow, Composer, Message, AttachmentCard, ReactionPill, ThreadSummary, ApprovalItem, QuestionPanel, ThinkingIndicator, UpdateBanner, NotificationSchedule, Pagination's `pageSize`, TabBar, SidebarSection, WorkspaceSwitcher). Passing the value with its handler is controlled, as before.
- An array or plain-object value passed without its handler (ContextMenu `picked`, Table `sort` or `selected`) is compared by its items, so re-rendering the parent with an equal inline value no longer undoes the person's change.

**The app drives the state** (S2, owner decision). A component never shows the result of a request before the app confirms it. A press shows a pending state on the pressed control (a spinner, `aria-busy`, no second press) and reports the request through its event; the outcome comes only from the props the app passes. Pending ends when the app passes a new value of the props named below, or when the promise the handler returns settles, so a request that fails and leaves the props as they were comes back on its own. Every such event may now return `void | Promise<unknown>`. MIGRATION.md, "1.0 → 1.1: the app drives the state".

- **Dialog:** the CTA spins until the app answers with a new `error` or `loading`, or by closing, or until `onConfirm`'s promise settles; a failure with the same `error` text as before needs the promise. Cancel, Close, Esc, the scrim and Android's back and the handle stay live while it spins, and under `loading` (they were dead, and stayed dead forever when the error text did not change).
- **SessionState:** Sign in or Unlock spins until the app passes `state` (waiting), `unlocked`, `error` or `offline`, or `onSignIn`'s / `onUnlock`'s promise settles. The card no longer turns to waiting, or shows the open lock, by itself: pass `state="waiting"` and `unlocked` when the platform layer says so.
- **UpdateBanner:** Check again spins until the app passes the next `stage` or `error`, or `onCheck`'s promise settles. The banner no longer moves `stage` itself, so a check that fails the same way again comes back. `onStageChange` keeps its name and still reports the stage asked for, but `stage` is no longer declared as changed by the banner (`changes: "stage"` is gone from the docs): pass the updater's `stage`.
- **PermissionPrompt:** Turn on spins until the app passes the OS's answer as `permission`, or `onAllow`'s promise settles; the on state, and its announcement, come only from `permission`. A dismissed OS prompt returns to asking.
- **NotificationItem:** Approve or Decline spins on the pressed button, and the other locks, until the app passes `approval` (approving, approved, declined, expired) or the handler's promise settles. The outcome line and its announcement come only from `approval`. `read` and `revealed` are still the row's own.
- **Message and AttachmentCard:** Retry goes busy until the app passes the new `status` (and for an attachment `error` or `progress`), or `onRetry`'s promise settles; a retry that fails again keeps Retry and Delete. Neither moves `status` itself any more, so `onStatusChange` reports the request and `changes: "status"` is gone from both docs: pass the server's `status`.
- **ReactionPill:** given `mine` and `onMineChange`, a press reports the request and the pill is busy (`aria-busy`, locked), still showing the app's `mine` and `count`, until the app passes new ones or the promise settles; a rejected reaction stays as it was. Message's pills are passed this way (they report through `onReact`). Given only the handler, the pill still flips itself.
- **InAppBanner:** a dismissal puts that notification away, not the banner: a new `title`, `context`, `body` or `time` shows again, back at the `dismissed` the app passes.
- **SidebarItem and SidebarSection:** a row never makes itself current. A lone SidebarItem draws `active` as the app passes it; in a section, `selected` decides, and when it returns to `""` the items' own `active` decide again (before, every row pressed kept itself current, so several were current at once).
- **QuestionPanel:** Submit reads Sending… until the app passes `sending` or `offline`, or `onSubmit`'s promise settles, so a failed send comes back to Submit with the answer still chosen (before, it stayed Sending… unless the app pulsed `sending`). It spins as Button's `loading` while sending, as on the web.
- **ListItem:** only a selection row (role `option` or `checkbox`) toggles `selected` on a press. A link, button or menu row never marks itself current or grows a check mark; pass `selected` (H7).
- **ThreadSummary:** opening a thread no longer flips Following; `following` is always the app's. `onFollowingChange` is deprecated and never called (its `changes` declaration is gone); it stays accepted through 1.x (M24).
- **Toast:** pressing the action now fires `onDismiss` after `onAction`, so an app that unmounts on `onDismiss` frees the slot (M27).

**Other components that behave differently**

- **Chip** (L3, L4): only a `filter` chip toggles `selected`. The ✕ only reports `onRemove`: the chip stays until your app drops it from its list or sets `removed`. If you relied on the chip hiding itself, drop it from your list in `onRemove`.
- **ProgressBar** (L32): `value` left out is indeterminate, as a NaN was; it no longer draws and announces 40%.
- **Tabs** (M23, owner decision): a `value` no tab has (or none) chooses no tab and draws no bar, as the docs said; the kit selected the first tab, even a disabled one. Pass the key of the tab you want chosen. A disabled tab's dimming is part of the `tab` part, so `styles.tab` can restyle it.
- **LineChart** (M46): `marks` left out is on for two or more series and off for one (was off). Pass `marks={false}` for plain lines. With `marks` it draws the five marker shapes the legend shows (was a circle and a square), and a `null` or non-numeric value is a gap in the line, not a point at zero (L58, L63).
- **BarChart and RadarChart** (M46): the new `marks` is left out on for two or more series, so a chart that drew flat fills or plain outlines now draws marks (see Added). Pass `marks={false}` for the old look.
- **Meter and GaugeChart** (M45): `showState` defaults to `true` (was `false` on Meter): the caution and critical states draw their icon. GaugeChart's new `showState` is also `true`. Pass `showState={false}` for the old look.
- **GaugeChart:** with the default `percent` format, the value, the target, the two ends, the summary and "View as table" print as a share of `max`, as Meter does: `value={58} max={100}` is 58%, not 5,800%. A gauge with `max` 1 (the docs' examples) draws as before.
- **Charts, Table and KPIs:** the core format fixes (`@antfabric/ui-core`) reach every value they print: a chart whose `x` is an ISO date string no longer crashes, a `date` cell holding `"2026-03-01"` shows Mar 1 in every zone, `{ type: "currency", digits: 2 }` prints cents, and a cell whose text is not a number shows the dash instead of `NaN`. The chart and data colours that changed in core (light scheme, and `chart.previous` in dark) reach the phone through `useTheme().t`.
- **Table** (L66): draws its sort bar only when a column sorts or rows can be ticked. A row without its `rowKey` field is named by its index in `rows`.
- **Chart text** (M56): charts from `./data` draw their text in Geist on every theme, so an app on `themes.antfabric` that draws them loads the `Geist-*` files beside Figtree (CONSUMING.md).
- **AntFabric's primary buttons now draw dark ink on coral** (`fg.onBrand` by contrast, see core; H14). Brand fills under a dark tenant brand stay white. The app badge's iOS count, the home-screen label and the danger swipe action read `os.onFill` / `danger.fg` and stay white.
- **Dynamic Type** (M54): `fontScale.control` is 2: a button's, chip's, field's or segment's label grows with Dynamic Type and Android's font scale up to 200% (WCAG 1.4.4). Before, it stopped at 150%. Those controls take `minHeight`, so the grown label fits. `fontScale.chrome` (tab bar labels, badges, axis ticks) stays 1.3.
- **Nested `ThemeProvider`** (M4): the way to scope `strings`, it keeps the parent's `scheme`, `os` and `osVersion` when it is not given them. Before, it reset them to light and the device, so a chart under it drew light on a dark screen.
- **Theme cache** (M53): `createStyles` holds each component's StyleSheet weakly by its token object, so the sheets of a theme that `resolveTokens` has let go of (a live theme picker) are freed. Before, the cache grew with every theme.
- **BottomSheet** (M20, H17): fills what it is given (the screen, a Modal): the 375pt frame and the room above the panel were the catalogue's demo stage, and now are the catalogue's. A tall sheet reaches the top of its box, so give it the room above (the header row) yourself. A press on the scrim above the panel closes it, as the docs said. The new `dismissible` (default `true`) turns off the ×, makes the handle only a picture and stops every other way out.
- **Link cards** (L26, L36): AttachmentCard's link card calls `onOpen` when pressed and opens the link itself only for `http`, `https` and `mailto`; any other scheme a message carried is the app's to open from `onOpen`, or not at all. `removable` now draws Remove preview on a link card, as on the web. A ready staged chip's thumbnail or badge and name are one button that calls `onOpen`, so Composer's `onAttachmentOpen` fires (M26). Composer's `onAttachmentDownload` can never fire (a staged file has no download): it is deprecated, kept for 1.x.
- **SidebarSection** (L37): + is drawn only with `onAdd`; the header takes a long press only with `onMenu`, and the rows only with `onItemLongPress`. Pass them to keep the buttons and the gestures.
- **SidebarItem** (M39): a hold is a press unless `onLongPress` is given.
- **TabBar** (M33, L38, L48): squeezed with an `active` that no tab has (a pushed screen), the disc is still drawn, with a chevron, and brings the tabs back; its touch area is 44pt. The floating action draws its `badge` on its corner and reads it with its name, and `disabled` dims it and takes no press. OsNotification's actions honour `disabled`.
- **AvatarStack** (L40): +N is everyone the faces do not show (2 faces of 10 read +8, was +7).
- **Skeleton** (L30, L33): while `visible` is false it is hidden from screen readers too; a one-line row (`lines={1}`) draws the small 20pt lead, as the web does.
- **TextField** (M12, L7): `type="password"` with `autoComplete="new-password"` sets iOS's `newPassword`, so a sign-up field is offered a strong new password, not the saved one. A `required` field with a `tag` says "Required" in its hint; the tag is read where it is drawn.
- **OsNotification** (L51): every part's `testID` is `<testID>.<part>` when you pass a `testID`, so two banners no longer share ids. Without one they are `os-notification.<part>`, as before.

**Pass-through props** (M5, M19, M37, M49, L17). MIGRATION.md, "1.0 → 1.1: pass-through props".

- **A field's `nativeID`, `accessibilityLabel`, `accessibilityHint` and `ref` now reach the control, not its wrapper.** `testID` and `style` stay on the root (`testID` still prefixes every part). `ref` gives:
  - TextField and TextArea: the `TextInput` (was the wrapper `View`).
  - SearchField: the `TextInput`.
  - Select: the trigger `Pressable`.
  - Chip: the chip's `Pressable` (the ✕ is its own).
  - SegmentedControl: the tab list `View` (was the wrapper, or the `ScrollView` when `scrollable`).
  - Checkbox, Switch and RadioGroup: unchanged, their root is already the control.
- Your `accessibilityHint` is read after the field's own (the error or helper, the FormField's description, "Required"), not instead of it.
- **Dialog, Sheet, BottomSheet and ContextMenu give the pass-through to the view with `role="dialog"`**, not the scrim. A Sheet with no title names its dialog with `label` (it named the wrapper, so the dialog was unnamed); your `accessibilityLabel` beats both. `ref` is the dialog's view.
- **Your `accessibilityLabel` wins over the kit's:** AppBadge, InAppBanner, SidebarSection, PermissionPrompt, ThinkingIndicator, SessionState, Skeleton, Meter, ProgressRing, SparkBars and Sparkline wrote their own after the pass-through.
- PeriodCompare, MetricTabs and Breakdown pass `nativeID`, `accessibilityLabel` and `ref` to the chart's root inside the card; they were dropped.
- Tabs: a passed `ref` gets the `ScrollView`; it was discarded.
- Pagination with a page-size or jump Select: the pass-through names the whole pagination, not the pager row under the Selects.
- CONSUMING.md: `testID`, `nativeID`, `accessibilityLabel`, `accessibilityHint` and `ref` pass through to a component's root (L71).

**Status messages are announced, not live regions** (L1, L25, L55, M28, M29, M40)

- The kit marks no view `accessibilityLiveRegion` or `role="status"`/`"alert"` with text in it; a status is said through the screen reader's announcement, so iOS and Android hear it once. Composer's offline line and upload hint, and Message's failed and queued lines, are said when they happen; Badge `live` says a change of its count; Select says "No matches for …" once when the filter empties the list; MobileHeader says "Back online" when the connection line goes; ThinkingIndicator's rotating word is no longer read every 2.4 s; AttachmentCard's upload percent is no longer a live region; OsNotification's reply status is said (it said nothing on iOS); QuestionPanel says going offline; Pagination's summary is said when it changes. Dialog, ConnectionBanner, InAppBanner, InlineBanner, Toast, NotificationItem, NotificationSchedule, SessionState and UpdateBanner, which already announced, lose the role.

**Icons** (H13)

- Icons no longer pull in all of lucide-react-native. The kit registers only the 74 icons it draws, imported one by one. **A name the kit does not draw draws an empty box and warns once in development:** register it with the new `registerIcons({ GitBranch })`, or pass the component, which `Icon` and every icon prop now take (`IconName` is `string | IconComponent`; `IconComponent` is exported). MIGRATION.md, "1.0 → 1.1: icons".

**Android back and dismissal** (H16, H17, M21)

- Android back closes the innermost overlay first: `useBackHandler` adds its listener once each time an overlay opens, not on every render, so a Select open inside a BottomSheet closes before the sheet.
- Dialog: the escape gesture respects `dismissible`. Sheet with `dismissible={false}` can no longer be closed by the handle, a drag, back or the escape gesture, which left an empty scrim.

### Added

- `usePending` (re-exported from core), see core's changelog.
- `registerIcons(icons)`, and the `IconComponent` type: `Icon` and every icon prop take a lucide name or the component (H13).
- `onPlayingChange(playing)` on AttachmentCard, for the voice note (`changes: "playing"`): Play and Pause report it, so the app can start and stop the audio. Given `playing` too, the button is controlled; on its own it flips itself (H20).
- `dismissible` (default `true`) on BottomSheet.
- `marks` on BarChart, left out on for two or more series: each series past the first is textured over its colour (an svg pattern laid in each bar and the legend's swatch). Pass `marks={false}` for flat fills (M46).
- `marks` on RadarChart, left out on for two or more series: a dash per outline and a marker shape at each axis (drawn by the kit over gifted-charts' polygons), and the same in the legend's key (M46).
- `showState` on GaugeChart, default `true`: Meter's icon beside the value in caution and critical, and the state said in the summary. New strings `stateWarning`, `stateDanger` (M45).
- `useAnnounce(text, { initial? })` in `lib/a11y.ts`: says a status each time its text changes (not on first draw unless `initial`).
- Strings from core: `tab-bar.show` ("Show tabs"), `mobile-header.online`, `avatar.labelAgent`, the `sidebar-item` presence words, `workspace-switcher.newMessages`; AttachmentCard's `removePreview` is read on the phone, and Popover takes `strings` for its backdrop's name (see `@antfabric/ui-core`).

### Fixed

State
- Chip and SegmentedControl: the 44pt touch area is reached. iOS drops a touch outside a parent's bounds before asking its children, so the chip's row and the strip now take the same slop as the controls inside (M11). A `scrollable` strip's ScrollView still clips it.
- SwipeRow: a drag that starts on an open row starts from where the row rests, at once, instead of from a value the native driver reports a frame later (L34).
- SegmentedControl: the iOS 26 lens keeps its drag when the parent re-renders mid-gesture (L11).
- Fab: a Fab disabled while it wiggles drops the press and does not fire (L12).
- TypingIndicator: the dots' animation runs only while someone is typing (L24).
- NotificationSchedule: the Custom picker's Pause is disabled until both fields hold something (L41).
- Composer: while only an upload holds a typed message, Send stays pressable, so a tap says "Waiting for the upload to finish" (L28).

Keyboard, focus and overlays
- Popover opened by its `open` prop is placed beside its trigger. The trigger was measured only on its own press, so the panel stayed invisible under a backdrop that took the next tap (H18). The panel is placed again when the window's size changes (the phone turned) (L19).
- Select: opening a searchable select focuses its search field (otherwise the screen reader lands on the sheet's title), and closing puts VoiceOver and TalkBack back on the trigger (L2).
- UpdateBanner: the restart sheet takes screen-reader focus at its title when it opens, and the escape gesture puts it away (L16).
- ContextMenu: the emoji panel's search field narrows the emoji shown, by their English names (M22).

Screen readers
- RadioGroup: the drawn question is read on iOS and Android, before the options. VoiceOver and TalkBack never read a View's own name, so the group's label was lost and the legend was hidden (H21). SegmentedControl: each tab says the strip's `label` as its hint there, for the same reason.
- TextField, SearchField and Select: inside a FormField the field's visible label names the control, not the placeholder (WCAG 2.5.3; M6).
- Popover: the backdrop is named Close (`common`'s close), not the trigger's label (L16).
- BottomSheet: a sheet put away is hidden from TalkBack too (`importantForAccessibility`), not only from VoiceOver (L16).
- Avatar is named "{name}, AI agent" when it wears the agent sparkle; SidebarItem's row name adds its face's agent or presence (M36).
- WorkspaceSwitcher: a row's activity dot is read in its name, "new messages" (L44).
- InAppBanner: the open button's name says the title and conversation, the time, the lead and body and the queue, then "Open"; with no body it is no longer "Title: . Open" (L47).
- Dialog: an error that arrives is announced on iOS (M21).

Theming
- Toast: the Undo and Dismiss chips read the pill's ink in any form (#rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla()); `#fff` drew them blue and `rgb(…)` drew nothing. A colour name leaves them unfilled (M30).

Data
- BarChart, ComboChart and MetricTabs: tapping a bar, then passing fewer rows, no longer throws. A tapped bar's tooltip and dimming now close on a second tap of the same bar or a tap beside the bars (H19, M48).
- SparkBars draws values below zero: a mixed range hangs its losses under a zero line, an all-negative one hangs every bar from the top (was a broken scale) (L63).
- DonutChart: the segment switch sits beside the row's button instead of inside it, so a screen reader reaches it (M50).
- Meter: a `score` meter with no value no longer shows the critical icon with `showState`.
- PeriodCompare says its change in the locale. GoalRings, DonutChart, Breakdown, Sparkline, SparkBars and Pagination: as the React kit (L62, L66, L67).

Packaging
- The types resolve under `moduleResolution: node16` and `nodenext`: the `.d.ts` files' relative imports name their `.js` (H11).
- Every published file starts with `"use client"`, as the web kit's do; Metro ignores it (H12).
- Each `.js` file ships with its source map (L72).

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
