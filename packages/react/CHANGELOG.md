# @antfabric/ui-react

## 1.1.0

Fixes from the 1.0 component review (`reports/audit/2026-11-23-component-review.md`). Each batch notes what a consumer sees; the headings are folded into Fixed, Changed and Added before release.

### Batch 1: controlled state

- A control given only its change handler keeps its own state: `<Switch onCheckedChange={save} />` turns on, `<TextField onValueChange={save} />` keeps what is typed, `<Select onOpenChange={log} />` opens, `<Tabs onValueChange={log} />` moves. Before, the prop's default held it there forever. Fixed in every component with a changeable prop (Switch, Checkbox, RadioGroup, Select, TextField, SearchField, Chip, SegmentedControl, IconButton, Tabs, Breadcrumbs, ListItem, Popover, Sheet, Tooltip, HoverCard, CommandPalette, Composer, Message, MessageActions, AttachmentCard, ReactionPill, ThreadSummary, ApprovalItem, QuestionPanel, ThinkingIndicator, UpdateBanner, NotificationSchedule, TrayMenu, Pagination's `pageSize`, TitleBar, WebTopBar, AppMenuBar, NavRail, SidebarSection, WorkspaceSwitcher). Passing the value with its handler is controlled, as before.
- An array or plain-object value passed without its handler (ContextMenu `picked`, Table `sort` or `selected`) is compared by its items, so re-rendering the parent with an equal inline value no longer undoes the person's change.

### Batch 2: focus, Escape and IME

- Escape goes to the innermost thing that uses it. An open Select, Menu, ContextMenu, Tooltip or HoverCard inside a Dialog, Sheet or Popover closes itself and leaves the overlay open; the next Escape closes the overlay. Before, the overlay took every Escape first, so Esc on an open Select in a form dialog cancelled the dialog (S4, H4). The rule for your own controls: a handler that uses Escape calls `e.preventDefault()`. The overlay stack then reads only an Escape nothing inside used, in the bubble phase on the document, and gives it to the top overlay.
- Clearing a SearchField with Escape, or Select's filter, stops there. The overlay around it stays open (M7).
- Tab stays inside a modal whose controls include a roving group (a RadioGroup, Tabs, a Menu's rows, the CommandPalette's results). The trap now counts only what Tab reaches: not `tabIndex={-1}` items, hidden inputs, or anything hidden or inert. It also wraps when focus sits outside the order (S3, H3). A form Dialog no longer puts its first focus on a Select's hidden `name` input.
- Enter or Escape that commits or cancels an IME composition (Japanese, Chinese, Korean) no longer submits, sends, chooses, clears or closes. This covers SearchField, TextField, Select, CommandPalette, QuestionPanel, InAppBanner, OsNotification, Composer and every overlay's Escape (S5, H5).
- Tooltip and HoverCard: Escape hides a bubble or card that hover opened, wherever focus is (WCAG 1.4.13; M16). A closed HoverCard no longer swallows Escape, so the dialog behind it closes (M15).
- Select: Enter on the filter's clear button clears the filter and chooses nothing (M8). Opening, closing or typing a filter puts the cursor back on the chosen row. When the filter leaves that row out, the cursor moves to the first row left, so Enter never takes a hidden or stale row (M9).
- A modal opened over another modal (a confirm over a Sheet) makes the one under it inert until it closes (L20). When the control that opened an overlay is gone by the time it closes (a menu row), focus goes to the nearest control still on the page instead of the page body (S6).

### Batch 3: theme sanitiser

### Batch 4: packaging and icons

- The types resolve under `moduleResolution: node16` and `nodenext`: the `.d.ts` files' relative imports name their `.js` (H11).
- Every published file starts with `"use client"`, so a React Server Component (the Next.js App Router) can import the kit from any entry (H12).
- Each `.js` file ships with its source map (L72).
- CONSUMING.md: `id`, `className`, `ref`, `data-*` and `aria-*` do pass through to a component's root (L71); a strict CSP needs `style-src 'unsafe-inline'`, since the kit draws with inline styles and the root takes no `nonce`.
- Icons no longer pull in all of lucide (H13). The kit registers only the 88 lucide icons it draws, imported one by one, so `import { Button }` bundles to 398 KB minified (94 KB gzip) instead of 1,205 KB (284 KB gzip). A name the kit does not draw draws an empty box and warns once in development: register it with the new `registerIcons({ GitBranch })`, or pass the component, which `Icon` and every icon prop now take (`IconName` is `string | IconComponent`; `IconComponent` is exported). MIGRATION.md, "1.0 → 1.1: icons".

### Batch 5: data core

- Charts, Table and KPIs: the core format fixes (`@antfabric/ui-core`'s Batch 5) reach every value they print. A chart whose `x` is an ISO date string no longer crashes, a `date` cell holding `"2026-03-01"` shows Mar 1 in every zone, `{ type: "currency", digits: 2 }` prints cents, and a cell whose text is not a number shows the dash instead of `NaN`.
- GaugeChart: with the default `percent` format, the value, the target, the two ends, the summary and "View as table" print as a share of `max`, as Meter does: `value={58} max={100}` is 58%, not 5,800%. A gauge with `max` 1 (the docs' examples) draws as before.
- Table: a row without its `rowKey` field is named by its index in `rows`, so ticking one such row ticks that row only (they all had the id `"undefined"`). "View as table" passes `chartTable`'s `rowKey`, so a chart's data field named `key` is shown as it is.
- Meter: a `score` meter with no value no longer shows the critical icon with `showState`.

### Batch 6: the app drives the state

A component never shows the result of a request before the app confirms it (S2, owner decision). A press shows a pending state on the pressed control (a spinner, `aria-busy`, no second press) and reports the request through its event; the outcome comes only from the props the app passes. Pending ends when the app passes a new value of the props named below, or when the promise the handler returns settles, so a request that fails and leaves the props as they were comes back on its own. Every such event may now return `void | Promise<unknown>`. MIGRATION.md, "1.0 → 1.1: the app drives the state".

- **Behaviour change, Dialog:** the CTA spins until the app answers with a new `error` or `loading`, or by closing, or until `onConfirm`'s promise settles; a failure with the same `error` text as before needs the promise. Cancel, Close, Esc, the scrim stay live while it spins, and under `loading` (they were dead, and stayed dead forever when the error text did not change).
- **Behaviour change, SessionState:** Sign in spins until the app passes `state` (waiting), `error` or `offline`, or `onSignIn`'s promise settles. The card no longer turns to waiting by itself: pass `state="waiting"` when the platform layer says so.
- **Behaviour change, UpdateBanner:** Install and Retry spin on the card (or the collapsed rail icon) until the app passes the next `stage`, `error` or `progress`, or `onApply`'s promise settles. The banner no longer moves `stage` itself, so a check or retry that fails the same way again comes back. `onStageChange` keeps its name and still reports the stage asked for, but `stage` is no longer declared as changed by the banner (`changes: "stage"` is gone from the docs): pass the updater's `stage`.
- **Behaviour change, PermissionPrompt:** Turn on spins until the app passes the OS's answer as `permission`, or `onAllow`'s promise settles; the on state, and its announcement, come only from `permission`. A dismissed OS prompt returns to asking.
- **Behaviour change, NotificationItem:** Approve or Decline spins on the pressed button, and the other locks, until the app passes `approval` (approving, approved, declined, expired) or the handler's promise settles. The outcome line and its announcement come only from `approval`. `read` and `revealed` are still the row's own.
- **Behaviour change, Message and AttachmentCard:** Retry goes busy until the app passes the new `status` (and for an attachment `error` or `progress`), or `onRetry`'s promise settles; a retry that fails again keeps Retry and Delete. Neither moves `status` itself any more, so `onStatusChange` reports the request and `changes: "status"` is gone from both docs: pass the server's `status`.
- **Behaviour change, ReactionPill:** given `mine` and `onMineChange`, a press reports the request and the pill is busy (aria-busy), still showing the app's `mine` and `count`, until the app passes new ones or the promise settles; a rejected reaction stays as it was. Message's pills are passed this way (they report through `onReact`). Given only the handler, the pill still flips itself, as Batch 1 made it.
- **Behaviour change, InAppBanner:** a dismissal puts that notification away, not the banner: a new `title`, `context`, `body` or `time` shows again, back at the `dismissed` the app passes.
- **Behaviour change, SidebarItem and SidebarSection:** a row never makes itself current. A lone SidebarItem draws `active` as the app passes it; in a section, `selected` decides, and when it returns to `""` the items' own `active` decide again (before, every row pressed kept itself current, so several were current at once).
- **Behaviour change, QuestionPanel:** Submit reads Sending… until the app passes `sending` or `offline`, or `onSubmit`'s promise settles, so a failed send comes back to Submit with the answer still chosen (before, it stayed Sending… unless the app pulsed `sending`).
- **Behaviour change, ListItem:** only a selection row (role `option` or `checkbox`) toggles `selected` on a press. A link, button or menu row never marks itself current (`aria-current="page"`); pass `selected` (H7).
- **Behaviour change, ThreadSummary:** opening a thread no longer flips Following; `following` is always the app's. `onFollowingChange` is deprecated and never called (its `changes` declaration is gone); it stays accepted through 1.x (M24).
- **Behaviour change, Toast:** pressing the action now fires `onDismiss` after `onAction`, so an app that unmounts on `onDismiss` frees the slot (M27).
- **Added, AttachmentCard:** `onPlayingChange(playing)` for the voice note (`changes: "playing"`): Play and Pause report it, so the app can start and stop the audio. Given `playing` too, the button is controlled; on its own it flips itself (H20).

### Batch 7: announcements

- **Fixed, announcements:** two messages announced within 50 ms are both read, joined in order, instead of the first being dropped; the same text twice in that beat is read once. A modal no longer makes the page's announcers inert, so an error or a toast said while a dialog is open is read (M3).
- **Added:** `useAnnounce(text, politeness?, { initial? })` in `lib/announce.ts`: says a status each time its text changes (not on first draw unless `initial`).
- **Behaviour change, no live regions mounted with their text:** a status is plain text and an announcement. Composer's offline and read-only lines and Message's sending, failed and queued lines (failed and queued are said when they happen, M28); InAppBanner's root is a labelled group and an arriving banner is said (M31); Badge `live` says a change of its count and is always `role="img"` (M40); CommandPalette's offline, searching and no-results lines (no results is said after typing pauses, with the count); Select says "No matches for …" once when the filter empties the list (L1); Dialog's error (said assertively); ConnectionBanner's pill is `role="img"` and says its new name; Pagination's summary (and Table's) is said when it changes; NotificationSchedule's pill is a labelled group and a resume is said too; QuestionPanel's offline line. Markup loses `role="status"`, `role="alert"` and `aria-live` on these parts.
- **Fixed, UpdateBanner (desktop):** the stage is said once by the banner, not again each time the nav rail folds or unfolds (M18).
- **Fixed, CommandPalette:** after filtering, the first row is highlighted, as Enter takes it (M17).

### Batch 8: focus hand-off

- **Fixed, focus hand-off (M1):** a control pressed from the keyboard that goes away, disables or goes inert no longer drops focus to the page. QuestionPanel's Submit spins as Button's `loading` and stays focusable; dismissing a Toast (or its action), an InlineBanner or an InAppBanner, and taking back a sole reaction, hand focus to the nearest control that stays; NotificationSchedule's Resume and the picker's Pause hand it to the menu's first control or the pill; OsNotification's Reply hands it to the reply field; UpdateBanner's Install hands it to the busy card, and the folded rail icon stays focusable while busy (`aria-disabled`, not `disabled`); Esc inside a HoverCard gives it back to the trigger; BottomSheet gives it back to the opener when dismissed, and its slid-away panel is `inert`.
- **Added:** `focusNear(from)` and `focusDropped()` in `lib/focus.ts`; `useOverlayFocus({ open })` for an overlay that stays drawn while it closes. `useFocusHandoff` also hands off when focus sits on a removed, disabled, inert or hidden element.

### Batch 9: pass-through props

- **A field's `id`, `aria-*` and `ref` now reach the control, not its wrapper** (M5). `className`, `data-*` and `style` stay on the root wrapper. A `<label htmlFor>` of your own, a form's jump to its first invalid field (`ref.current.focus()`) and your `aria-label` now name the control. `ref` gives:
  - TextField: the `<input>` (`HTMLInputElement`; was the wrapper `<div>`).
  - TextArea: the `<textarea>` (`HTMLTextAreaElement`).
  - SearchField: the `<input>`, or the launcher `<button>` with `launcher` (`HTMLInputElement | HTMLButtonElement`).
  - Select: the trigger `<button role="combobox">`, or the native `<select>` in a phone browser (`HTMLButtonElement | HTMLSelectElement`).
  - Chip: the chip's `<button>` (`HTMLButtonElement`; the ✕ is a button of its own).
  - SegmentedControl: the `<div role="tablist">`.
  - Checkbox, Switch and RadioGroup: unchanged, their root is already the control.
- A passed `id` on TextField, TextArea and Select replaces the one the kit generates, so the kit's own `<label for>`, `aria-describedby` and the Select's listbox ids follow it. Inside a FormField the FormField's id still wins, since its label points at it. Your `aria-describedby` is read after the kit's helper, error and counter, not instead of them.
- **Dialog, Sheet, BottomSheet and CommandPalette give `id`, `aria-*` and `ref` to the element with `role="dialog"`**, not the backdrop (M19). A sheet with no title is named by your `aria-label`. `ref` is the panel (it was the scrim). Dialog joins your `aria-describedby` after its body.
- **Your `aria-label` wins over the kit's** (M37): ListItem, MessageDivider (and its sticky pill), Message, ThreadSummary, Skeleton, SessionState, ProgressRing, SparkBars and Sparkline wrote their own name after the pass-through, so a product's was dropped.
- Pagination: a passed `ref` no longer replaces the kit's own. With one, focus was lost when Previous or Next became disabled under the keyboard; now it moves to the current page as it does without one.
- `pnpm check generic` draws every component in both kits with an `id` and an `aria-label` passed through and fails when they do not reach the same element (the control, the dialog or the root), or when the kit's name beats the product's (`passThroughTodo` in `reports/generic.json`, empty).

### Batch 10: contrast and target size

- **AntFabric's primary buttons now draw dark ink on coral** (`fg.onBrand` by contrast, see core). Brand fills under a dark tenant brand stay white.
- `LineChart`: `marks` left out is on for two or more series and off for one (was off), so series are told apart by dash and marker as well as hue. Pass `marks={false}` for plain lines. (M46)
- `Meter`: `showState` defaults to `true` (was `false`): the caution and critical states draw their icon. Pass `showState={false}` for the old look. (M45)
- 24px targets: a label-less Checkbox is 24 × 24 (was 15 × 23), a Chip's ✕ 24 (was 20), IconButton `sm` 24 on the desktop (was 20), NotificationItem's row actions at least 24 tall, and DonutChart's swatch toggle 24 × 24 centred on the swatch (was 14 × 16). (M10, M50, L53)
- Fields (TextField, TextArea, SearchField, Composer, CommandPalette and the others built on the `input` style) no longer carry an inline `outline: none`; `kitCss` takes the outline off instead, so in Windows High Contrast a focused field shows the forced-colours outline, not only its caret. (H15)
- The macOS menu highlight, the Windows close button, the tray menu's hovered row and the app badge's OS fills read the new `os.onFill` and stay white.

### Batch 11: React Native overlays

- BottomSheet fills what it is given: the 375px frame and the room above the panel were the catalogue's demo stage, and now are the catalogue's. A tall sheet reaches the top of its box. A press on the scrim above the panel closes it, and the new `dismissible` (default `true`) turns off the ×, the handle, the scrim and Esc together (M20, H17).

### Batch 12: per-component fixes

- A nested `AntFabricProvider` (the way to scope `strings`) or `AntFabricRoot` keeps the parent's `platform`, `os`, `osVersion` and `scheme` when it is not given them. Before, it reset them to web, browser and light, so a chart under it drew light on a dark page (M4). A root nested in another root now also writes the parent's `data-af-theme` and `data-af-os`.
- A theme's stylesheet leaves `<head>` when the last root drawing that theme unmounts. Before, every distinct theme stayed for the life of the page, so a live colour picker left one sheet per colour (M55). Once mounted, the root holds the sheet itself (`<style data-href="antfabric-ui-<id>" data-af-held>`), counted by theme id. The server render is unchanged.
- The kit's own sheet is named with the package version (`<style href="antfabric-ui@1.1.0">`), so a host and a plugin on two versions each keep their own (L70).
- `usePlatform().shortcutOs`: the OS whose shortcut glyphs to draw. It is `os`, except on the web, where it is the visitor's once mounted (`mac` on a Mac or an iPad, so `⌘K`); the server render and the hydration say `browser` (Ctrl) (L73).
- The focus ring shows when a key is pressed on a control focused by a click, as `:focus-visible` does. A shortcut with ⌘, Ctrl or Alt held does not show it (L68).
- Hover and press end when a control becomes disabled, so it is not drawn hovered when it is enabled again (L69).
- IconButton, Menu and MenuButton no longer throw where there is no `matchMedia` (jsdom in Jest or Vitest); they treat the pointer as fine there (L8, in part: Select still needs `matchMedia`, and SegmentedControl and the data components' frame need `ResizeObserver`).
- Popover: a click inside a layer opened from the panel (an inner Dialog or Popover) no longer closes it; only a press on the trigger toggles it (M13).
- ContextMenu: the quick reactions are reachable from the keyboard: ↑ from the first row (↓ from the last) moves into them, ← → (Home, End) across them, ↓ (↑) back to the rows; Tab closes from them as from the rows. The + calls a new event `onMoreReactions` (web and desktop), where the app opens its own emoji picker; it did nothing before (M14).
- Tabs: a `value` no tab has (or none) chooses no tab and draws no bar, as the docs said; the kit selected the first tab, even a disabled one. The first enabled tab is then the strip's tab stop. Pass the key of the tab you want chosen (M23, owner decision).
- Menu: a link row (`href`) takes Space as every other row does (L14).
- Dialog, Sheet, Popover: a press outside (the scrim) closes only when the primary button goes down and comes up outside. A right-click, a middle-click, a press on the scrim's scrollbar or a drag that ends in the panel leave it open (L15).
- UpdateBanner: the card is named by its title and detail, what it shows; the action ("Install the update, version …") is its description and tooltip. ConnectionBanner: Try now is named by its words, "Try reconnecting now" its description and tooltip (L18, WCAG 2.5.3).
Messaging, agent and feedback:
- ToastRegion: each toast is held by its own React `key`, not its place, so dismissing one no longer remounts the toasts after it (their timers kept running from the start again, each was announced again, and focus on a later Undo was lost). Give each Toast a `key` (the notification's id) (H6).
- Message: the actions bar stays mounted while its ⋯ menu is open, so a menu the app anchors to ⋯ keeps its anchor when the pointer or focus moves into it. Message now keeps `menuOpen` itself when the app passes only `onMenuOpenChange` (M25). On touch, a long press opens the bar on that row only; a press outside the row puts it away (L21).
- MessageActions: ⋯ is a menu button (`aria-haspopup="menu"`, `aria-expanded`) instead of a toggle (`aria-pressed`); it still draws pressed while the menu is open (L31).
- AttachmentCard and Composer: a ready staged chip's thumbnail or badge and name are one button that calls `onOpen`, so Composer's `onAttachmentOpen` fires (M26). A link card calls `onOpen` as the browser follows it (L36). Composer's `onAttachmentDownload` can never fire (a staged file has no download): it is documented and marked deprecated, kept for 1.x.
- Composer: while only an upload holds a typed message, Send stays pressable (`aria-disabled`, not `disabled`), so a press or Enter says "Waiting for the upload to finish" (L28). With `sendKey="mod-enter"` the edit banner says Mod+Enter saves, not Enter (L27).
- ReactionPill: hover and focus open no who-reacted card when `reactors` is empty (L22).
- ThinkingIndicator: with no steps, the row holds the sentence it announces ("Fabric is thinking") as hidden text, so a screen reader moving through the page finds it (L23).
- Toast: a new `message` on a mounted toast starts its `duration` again (L29).
- Skeleton: while `visible` is false it is hidden from screen readers too (`aria-hidden`), not only from sight (L30).
- ProgressBar: `value` left out is indeterminate, as a NaN was; it no longer draws and announces 40% for an upload with no value yet. The docs default (40) is now only the catalogue's sample (L32).
- EmptyState: new `headingLevel` (1 to 6, default 2) for the title, so it can keep the page's heading order (L35).
- Chip: only a `filter` chip toggles `selected`; a `suggestion` or `object` chip no longer latches into its selected look after one press (L3). The ✕ and Backspace / Delete only report `onRemove`: the chip stays until your app drops it from its list (or sets `removed`), and then focus goes to the next chip, else the previous one, else the row. A held key reports once, so it no longer removes a run of chips (L4). If you relied on the chip hiding itself, drop it from your list in `onRemove`.
- SearchField: inside a FormField the field's visible label names it, not the placeholder (WCAG 2.5.3; M6).
- Switch: inside a FormField it takes the field's `aria-invalid` and `aria-required`, as Checkbox does (L13).
- TextField: the password reveal button no longer says its state twice ("Hide password, pressed"). Its name follows the word it shows and `aria-pressed` is gone (L9).
- Select: type-ahead ignores keys held with Cmd, Ctrl or Alt, so Cmd+C on an open select no longer moves the row under the cursor (L6). It mounts where there is no `matchMedia` (jsdom) (L8).
- SegmentedControl: only plain arrows, Home and End move; Alt / Cmd / Ctrl / Shift with them are left to the browser (L5). Each tab has an id, the strip's `id` (or a generated one) and its key, and the new `panel` prop points the chosen tab at the panel it shows (`aria-controls`), so the panel can take `aria-labelledby` (L10). It mounts where there is no `ResizeObserver` (jsdom) (L8). IconButton still needs `matchMedia` under jsdom until `useCoarsePointer` is guarded.

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
