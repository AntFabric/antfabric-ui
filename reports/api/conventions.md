# AntFabric UI 1.0: API conventions

One rule per concept, across all 85 components and both kits. Where a component disagrees with a rule here, the component is wrong.

## 1. A changed value is `on<Prop>Change`
Every prop a component can change is reported by `on<Prop>Change(next)`. It is declared `changes: "<prop>"` in the docs and goes through `useControllable`. **No component has `onChange`.**

| Component | Before | After |
| --- | --- | --- |
| TextField, SearchField, Composer | `value`, `onChange` | `value`, `onValueChange` |
| Checkbox, Switch | `checked`, `onChange` | `checked`, `onCheckedChange` |
| RadioGroup, Select, Tabs, SegmentedControl | `value`, `onChange` | `value`, `onValueChange` |
| BarChart, LineChart, … (any chart with a selection) | `selection`, `onSelectionChange` | `selected`, `onSelectedChange` |
| WorkspaceSwitcher | `current`, `onSwitch` | `current`, `onCurrentChange` |
| TrayMenu | `open: string`, `onOpenChange` | `openMenu`, `onOpenMenuChange` (as AppMenuBar) |

`open` / `onOpenChange` is a boolean, and only on overlays.

The value and its event are independent. Both passed, the component is controlled. The value alone, it starts there and keeps its own state, following each new value (an array or plain object is compared by its items). **The event alone, it keeps its own state and reports each change**: a `<Switch onCheckedChange={save} />` turns on. So a kit never defaults the prop in its destructuring, which would hold it at the default; it defaults the hook's result, `const [on = false, setOn] = useControllable(checked, onCheckedChange)`. `pnpm check conventions` holds it (`controllable-default`), and the re-render pass mounts each changeable prop with its event alone, presses it, and expects it to move (`controlTodo`).

## 2. An item is named by `key`
Every item in a list carries `key: string`. A prop that names an item (`value`, `selected`, `active`, `current`, `openMenu`, `filter`, `confirmOption`) holds a key.

- **Tabs, SegmentedControl, Select:** items `id` → `key`.
- **RadioGroup:** options `value` → `key`.
- **Breadcrumbs:** items gain `key`; `to` stays the destination.
- **SidebarSection:** items gain `key`. Matching and React keys use it, never the display name.
- **Table:** `rowKey` (the field holding each row's key) defaults to `"key"`.
- **`MenuItem.key`** falls back to `label`, for menus written by hand. That is the one fallback.
- **Table:** `columns[].id` → `key` (the field of each row the column reads).
- **MetricTabs:** `Metric.field` stays. It names the data field and is the metric's key, so it is the one exception to this rule.

## 3. Open or closed is `expanded`
A panel, section, rail or bar that opens and closes takes `expanded` / `onExpandedChange`. It is a positive boolean, and its default is what the component drew before.

- **Breadcrumbs, SidebarSection, QuestionPanel, TabBar, UpdateBanner:** `collapsed` → `expanded`, with the default inverted.
- **ThinkingIndicator:** `open` → `expanded`.
- **NavRail, OsNotification:** already `expanded`.
- **Overlays** (Menu, ContextMenu, Dialog, BottomSheet, Select's list, Tooltip, HoverCard) keep `open`.

## 4. Chart fields
- **Axis charts** (BarChart, LineChart, ComboChart, MetricTabs, PeriodCompare, RadarChart) read their category from `x` and their value from `y`. Where a chart has several value fields, it keeps its own names for the series (`bars`, `line`, `metrics`, `current`, `previous`).
- **Part-of-whole charts** (Breakdown, DonutChart, GoalRings) read `name` and `value`. Their old `label` (the field) becomes `name`. GoalRings keeps `goal`.
- **Single series:** Sparkline and SparkBars `field` → `y`, and KpiCard and StatTile `trendField` → `trendY`.
- **`label`** is only ever the accessible name.

## 5. Smaller rules
- **A badge's cap is `max`:** `NavItem.cap` → `max`, as on Badge.
- **A picture's clock text is `clock`:** MobileHeader `time` → `clock`.
- **Photos:**
  - `src` is on the thing that is a person or a picture: Avatar, `Person`, HoverCard, Fab.
  - `avatarSrc` with `identity` is on the things that show someone: Message, SidebarItem, NavRail, MobileHeader, and InAppBanner, NotificationItem and OsNotification for their sender. The sender's colour comes from `identity`, never a constant.
- **A message's author:**
  - Message and ContextMenu say `author`, `identity` and `body`. ContextMenu's `authorIdentity` → `identity`, and `text` → `body`.
- **Reactions:**
  - `reactions: Reaction[]` is the reactions a message has.
  - `quickReactions: string[]` is the row of quick picks. ContextMenu's `reactions` → `quickReactions`; `picked` says which are the person's own.
- **One shape per concept:** AvatarStack takes `Person[]` (`AvatarStackPerson` goes).
- **A pressed product item is `onAction(item)`:** NavRail's `onUtility` → `onAction`. A place to go is still `onActiveChange`.
- **`agentName` only names:**
  - CommandPalette shows its ask row when `ask` is true (new, default false); `agentName` words it.
  - ThinkingIndicator and QuestionPanel are unchanged.
- **Icon-only bars take `IconActionItem` (`ActionItem & { icon: string }`, core `items.ts`):** TitleBar, WebTopBar and MobileHeader actions, Composer `tools`, MessageActions `actions`. A product's action cannot draw a blank button.
- **Every button a component draws fires something:**
  - SidebarItem's ⋮ → `onMenu`.
  - BottomSheet's primary button → `onPrimary`.
  - The phone's SidebarSection row long-press → `onItemLongPress(key)`.
  - Message's and Composer's attachments → `onAttachmentOpen`, `onAttachmentDownload`, `onAttachmentCancel` and `onAttachmentRetry`, each given the `Attachment` (keyed by its `key`).
- **Data passes through whole:** Composer gives AttachmentCard every `Attachment` field, as Message does.
- **No punctuation joined in code:** an accessible name built from parts is a string template (SidebarItem's label, TabBar's badge, and any other `${a}, ${b}`).
- **String variables share names:** `cancelUpload` takes `{name}` everywhere.
- **Kept as they are, on purpose:**
  - Message `onOpenThread` and MessageActions `onReplyInThread` are different actions.
  - InAppBanner `replyable` and OsNotification's reply action are different surfaces.
  - BottomSheet `showClose`, CommandPalette `showHints`, and Tooltip and HoverCard `showTrigger` default to true.

## 6. Docs
- **A required prop has no `default`.** Its catalogue value is its `sample`; that covers the 22 required props that showed AntFabric data as a default.
- **A default the catalogue cannot draw is still the kit's default:** `menu.triggerLabel` is the `moreActions` string, and "More actions for #release-train" is its `sample`.

## 7. Migration ledger
Every rename is listed, before → after, in `reports/migration/` (one file per area). The codemod and `MIGRATION.md` read from there.

## 8. Rules for 2.0 (vocabulary)

The vocabulary below is the rule for **new** props from 1.1 on and for the renames at 2.0. 1.x renames nothing,
so no product breaks in a minor release. Each 2.0 rename is listed, before → after, in `reports/migration/vocabulary-2.0.md`; `pnpm check
conventions` will hold them once they land.

- **In progress is `loading`.** Not `busy` (SearchField), `deciding` (ApprovalItem), `sending` (QuestionPanel) or `uploading` (Composer).
  A component with more than one kind of wait keeps `loading` for the one the person waits on and names the others by what they are.
- **One tone set:** `neutral | brand | success | warning | danger | info`, each optional per component. The red tone is `danger`, never
  `error` (Toast) or `negative` (ProgressRing, Sparkline, SparkBars). A status that is not a tone (TrayMenu's idle, live, paused, busy) is
  `status`, not `tone`. The emphasis of a control is `variant` (Button's and IconButton's danger is a `variant`).
- **Sizes are `sm | md | lg`, default `md`.** TextField gains `md` at 2.0 (it is `sm | lg`, default `lg`, today). What each size name draws
  is one height across the controls (the neutral theme's rule since 1.1, NEUTRAL.md).
- **Overlays share one contract:** `open` / `onOpenChange` (BottomSheet's `closed` → `open`, inverted), `side` / `align` for placement
  (Menu's `placement`, HoverCard's `placement`, Tooltip's `side` become `side`), and focus as `useOverlayFocus` keeps it (in on open, Tab
  trapped when modal, Escape, back to the opener).
- **Dismissal is `onDismiss(reason?)`** across the banner family (Toast, InlineBanner, InAppBanner, UpdateBanner, ConnectionBanner): the
  reason is optional, so `onDismiss()` stays valid.
- **Pass-through is universal** (since 1.1): `id`, `className`, `data-*`, `aria-*` and `ref` on the web, `testID`, `nativeID`, the
  accessibility label and hint and `ref` on the phone (`RootProps` in each kit). The docs do not list them.
