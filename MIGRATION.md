# Migrating to AntFabric UI 1.0

For an app that uses 0.1 (the 0.1 packages) and moves to 1.0. It is one break, made once: every rename and removal below lands in `1.0.0`, and nothing is left behind as a deprecated alias. Follow "The short path"; use "Every break, by area" when the typechecker points at something. An agent can follow it as written.

**The codemod is retired.** 0.1 never reached npm: it shipped only on AntFabric's internal registry, as `@antfabric-ui/*`, and the apps that used it have moved. So `pnpm migrate:1`, which made the mechanical renames, is no longer in this repository (it is in its history, up to commit `5b3e2ed`). The renames it made are still listed below, tagged **Codemod**; make them by hand.

Two tags run through the lists. **Codemod** means a mechanical rename the retired codemod used to make: a prop, type, import or literal rename on a known component. **Manual** means it needs a decision or a value only you have.

## What 1.0 is

0.1 was AntFabric's chat product drawn as a library: its colours, its sample content, its fixed lists (a navigation rail with five named destinations, a message bar with six emoji) and its English were the defaults. 1.0 is a generic base that AntFabric's product is one theme of.

- **Neutral by default.** With no theme, every component draws `themes.neutral`: zinc greys, an ink primary, Geist. AntFabric's coral look is `themes.antfabric`, passed once at the root.
- **Themes.** `defineTheme({ name, extends, brand })` builds a theme (colours, fonts, token overrides, recipe overrides). Light or dark is `scheme`; `theme` is the look. They are two props because they are two things.
- **`styles` and `strings`.** Every component takes `styles` (per part: `{ root, label }`) and `strings` (the text the kit draws, per component), and both roots take `strings` and `locale` for the whole tree.
- **Props plus slots.** A container takes its content as children (`<Card>…</Card>`), not as a `content` prop. A list takes items that carry a `key`. A component no longer ships AntFabric's content as its default.
- **Subpaths.** App chrome (title bars, rails, sidebar, tab bar, OS notification, tray menu, app badge) is `./shell`; the conversation (Message, Composer, reactions, threads) is `./chat`; `./data` stays. The root is the generic base.
- **One API.** The same prop means the same thing on every component (`reports/api/conventions.md`): a changed value is `on<Prop>Change`, an item is named by `key`, open or closed is `expanded`, a photo is `src`. That is what made the renames necessary, and why they were done together.

Why it breaks once: a library that names a thing three ways cannot be made generic by adding a fourth. Making the kit neutral meant moving AntFabric's content out of the defaults, and the same pass fixed the names that disagreed. Doing both in one major means an app migrates once, with one list, instead of chasing a rename in every minor.

## The short path

1. **Install 1.0.** Set `@antfabric/ui-core`, `react` and `react-native` (whichever you use) to the same `1.0.x`. From npm that is the version; from tarballs it is the three `file:` versions, and the override for `@antfabric/ui-core` if your workspace has one ([`CONSUMING.md`](CONSUMING.md), section 2).
2. **Rename the imports.** `@antfabric-ui/core`, `@antfabric-ui/react` and `@antfabric-ui/react-native` (0.1) are `@antfabric/ui-core`, `@antfabric/ui-react` and `@antfabric/ui-react-native`, subpaths included (`@antfabric/ui-react/chat`). If your app has a wrapper package, that is the only place to change.
3. **Make the Codemod renames.** Work through the items tagged **Codemod** in "Every break, by area", then commit them on their own, so the manual work reads as a separate diff.
4. **Keep AntFabric's look and wording.** The look is the theme and the wording is the strings, and they are two things.
   - **The look.** Add `theme={themes.antfabric}` to your roots (`AntFabricRoot` on the web, `ThemeProvider` on the phone). A product that is not AntFabric passes its own theme instead ([`CONSUMING.md`](CONSUMING.md) section 6). A `defineTheme` call with no `extends` now sits on `themes.neutral`; write `extends: themes.antfabric` to build on AntFabric's look. `extends: null` starts from the raw schema (`tokens.ts`, which holds AntFabric's values) and only the presets need it.
   - **The wording.** The kit's built-in text is generic now. AntFabric's own copy (0.1's) ships from an opt-in entry, `@antfabric/ui-core/antfabric`, which exports `antfabricStrings` (and re-exports `antfabric`). Pass it beside the theme: `<AntFabricRoot theme={themes.antfabric} strings={antfabricStrings}>`, and the same on the phone's `<ThemeProvider theme={themes.antfabric} strings={antfabricStrings}>`.
5. **Work through the manual list.** The items tagged **Manual** in "Every break, by area" say what each one means, and "What the typechecker cannot see" lists what changes without an error.
6. **Run your typecheck and tests.** Props are typed, so a removed or renamed prop is a compile error; fix them until it is clean.
7. **Look at it.** Open one screen per surface in light and dark, and the phone with its fonts loaded.

### What the typechecker cannot see

These change what is drawn or announced, not what compiles.

- **The default look is neutral.** Without `theme`, coral becomes ink, Figtree becomes Geist, and radii shrink. Step 4 fixes it.
- **Default text is generic.** The English is the same unless an item below says otherwise; the sample content is gone. `ProgressBar` with no `label` is named "Progress" (it was "Uploading Q4 roadmap.pdf"); `Skeleton` with no `label` is "Loading" (it was "Loading messages"); `Badge` with a count and no `label` reads "3 unread" (it was "3 unread mentions").
- **`defineTheme`'s `extends` defaults to `themes.neutral`.** A theme built in 0.1-style code with no `extends` used to start from AntFabric's values; it now starts from neutral, and compiles the same. Write `extends: themes.antfabric` to keep AntFabric's look. `extends: null` is the raw schema, and only the presets need it.
- **AntFabric's wording is opt-in.** Text that was AntFabric's phrasing by default is generic now. An AntFabric app passes `strings={antfabricStrings}` (from `@antfabric/ui-core/antfabric`) beside `theme={themes.antfabric}` to keep 0.1's wording. Nothing fails without it; a test that looks for the old text does.
- **A `ListItem`'s accessible name changed.** A count that read "…, 3 mentions" reads "…, 3 unread". A test or a screen-reader script that matches the old name fails, silently in the app.
- **A danger `InlineBanner` is an alert** (`role="alert"` on the web, the alert role with an assertive live region on the phone). It interrupts a screen reader; before it waited. A test that does `getByRole("alert")` now also finds it.
- **`EmptyState` draws its `icon`.** 0.1 ignored `icon` unless `art="none"`, and `art` defaulted to `messages`, so an `icon` on its own drew the speech-bubble art. `art` now defaults to `none`, so the icon shows.
- **A row you control stays controlled only through its change event.** A component is controlled when it gets its value and its `on<Prop>Change` (before: its value and its press event). `ListItem selected` with only `onPress` is now uncontrolled: it flips itself on a press and follows `selected` when that changes.
- **The headers and the lists have no sample defaults.** The phone `MobileHeader` drew a bell with 3 unread, a photo for "Priya Raman" and an "info" action unless told otherwise; it draws none of that now. `ListItem` draws no sample icon or avatar. `EmptyState` has no art.

## Every break, by area

Names are the ones 1.0 ships. Where the ledger's first pass and its later conventions pass disagree, this is the end state.

### Foundations

| 0.1 | 1.0 | |
|---|---|---|
| `Theme` (the type `"light" \| "dark"`) | `Scheme`. `Theme` is now a theme object (from `defineTheme`). | Codemod |
| `<AntFabricRoot theme="dark">`, `<AntFabricProvider theme="dark">` | `scheme="dark"`. `theme` takes a theme object; a string throws. The phone's `ThemeProvider` already took `scheme`. | Codemod |
| no `theme` meant AntFabric's look | no `theme` means `neutral`. For AntFabric's look pass `theme={themes.antfabric}` (`themes` and `defineTheme` are from `@antfabric/ui-core`). | Codemod adds it |
| `<AntFabricRoot brand={{ primary }}>`, `<ThemeProvider brand={…}>` | `theme={defineTheme({ name: "acme", extends: themes.antfabric, brand: { primary } })}`. The `brand` props are gone. | Codemod for a literal `brand`; manual for a spread or a conditional |
| `brandVars(brand, scheme)`, `brandKey` | removed. A host that writes the variables itself uses `themeCss(theme)` and `rootAttrs({ platform, os, scheme, theme })`. | Manual |
| `resolveTokens(profile, scheme, { brand })` | `resolveTokens(profile, scheme, { theme })` | Manual |
| `AntFabricRoot css` | `true` (default: base sheet and the theme's), `"theme"` (only the theme's; the host loads the base sheet once), `false` (neither: the host adds `tokensCss() + kitCss` and `themeCss(theme)`) | Manual |
| a theme stored as JSON | a theme is only what `defineTheme` built; load the JSON and pass it back through `defineTheme` | Manual |
| `ANTFABRIC_MARK` in core | removed (it is AntFabric's mark). Pass your product's `mark` to `AppBadge`. | Manual |
| app chrome and the conversation in the root | `@antfabric/ui-react/shell`, `/chat` and the same under `@antfabric/ui-react-native` (the table below) | Codemod |
| (none) | new: `strings` and `locale` on both roots; `styles` and `strings` on every component | New |

`data-af-theme` on the root element (or on `<html>`) still means the scheme, `"light"` or `"dark"`, so code that writes `html.dataset.afTheme = scheme` stays valid. A theme other than `themes.antfabric` adds `data-af-theme-id` beside it.

A host without `AntFabricRoot` passes `theme` to `AntFabricProvider` and writes `rootAttrs(...)` on its element ([`CONSUMING.md`](CONSUMING.md) section 3).

**What moved to a subpath** (import path changes only; props are in the other sections):

| Subpath | Components |
|---|---|
| `@antfabric/ui-react/shell` (web, desktop) | SidebarItem, SidebarSection, NavRail, TitleBar (desktop), WebTopBar (web), AppMenuBar (desktop), WorkspaceSwitcher, OsNotification, TrayMenu (desktop), AppBadge |
| `@antfabric/ui-react-native/shell` | MobileHeader, TabBar, SidebarItem, SidebarSection, WorkspaceSwitcher, OsNotification, AppBadge |
| `@antfabric/ui-react/chat`, `@antfabric/ui-react-native/chat` | Message, MessageActions (web, desktop), Composer, ReactionPill, ThreadSummary, TypingIndicator, MessageDivider |
| stay in the root | AttachmentCard, SwipeRow (phone), NotificationItem, InAppBanner, PermissionPrompt, NotificationSchedule, ConnectionBanner, SessionState, UpdateBanner, HoverCard, Breadcrumbs, CommandPalette, ContextMenu, Fab, the agent components |

**Types and helpers that were removed or replaced**, each with its successor: `NavRailKey`, `NavRailDestination`, `NavRailSection` become core's `NavItem`; `MobileHeaderAction` becomes `IconActionItem`; `AvatarStackPerson`, `ThreadSummaryParticipant` become `Person`; `ComposerAttachment`, `MessageAttachment` become `Attachment`; `MessageReaction` becomes `Reaction`; `AgentStepsStep`, `AgentStepsStepState`, `ThinkingIndicatorStep` become `AgentStep`; `QuestionPanelOption` becomes `QuestionOption`; `QuestionPanelArg` becomes `ToolArg`; `CommandPaletteGroupItem` becomes `CommandPaletteItem`; `ContextMenuReaction` is gone; `ProjectMoveCard` is gone.

The phone's `TabBarTab` is renamed to `NavItem` (the same type NavRail's destinations became). These 0.1 types are removed with no successor of the same name, each because the prop it typed changed shape (`kind`, `context`, `recorder` and the like are gone; the Shell, Notifications and other tables say what replaced each):

- `TabBarKey` (phone): a tab's `key` is a string.
- `SwipeRowContext` (phone): `context` is gone; `icon` and `actions` say what it is.
- `ApprovalItemSource`: `source` is a string.
- `BreadcrumbsRecording`: `recording` became `status` (`BreadcrumbsStatus`).
- `CommandPaletteKind`: `kind: "person"` became `avatar: true`.
- `InAppBannerKind`, `NotificationItemKind`, `OsNotificationKind`: `kind` is gone.
- `NotificationScheduleDuration`: options are `NotificationScheduleOption`.
- `SidebarItemKind`: `kind` is gone (`glyph`, `icon`, `avatar`, `description`).
- `SidebarSectionKind`: `kind` became `icon`.
- `TrayMenuRecorder`: `recorder` became `tone` (`TrayMenuTone`).
- `WebTopBarDesktopApp`: `desktopApp` is an entry in `actions`.
- `ProjectMoveCardProject`, `ProjectMoveCardProps`: removed with `ProjectMoveCard`.

Type renames are **codemod**; the removals are **manual**.

### Base components

| 0.1 | 1.0 | |
|---|---|---|
| Card, Dialog, BottomSheet `content={…}` | children: `<Card>…</Card>` | Codemod |
| TextField, SearchField `onChange(value)` | `onValueChange(value)` | Codemod |
| Checkbox, Switch `onChange(checked)` | `onCheckedChange(checked)` | Codemod |
| RadioGroup, Select, Tabs, SegmentedControl `onChange(id)` | `onValueChange(key)`; `value` holds an item's `key` | Codemod |
| Tabs, SegmentedControl, Select `items[i].id` | `items[i].key` (`TabsItem.id`, `SegmentedControlItem.id`, `SelectItem.id` become `key`) | Codemod for literals; manual for an array built elsewhere |
| RadioGroup `options[i].value` | `options[i].key` | Codemod for literals; manual otherwise |
| Select `activeId` | `activeKey` | Codemod |
| AvatarStack `people: AvatarStackPerson[]` | `people: Person[]` (`{ name, identity, src }` is still a valid `Person`) | Codemod (the type) |
| Chip `onPress(selected)` | `onSelectedChange(selected)`; `onPress()` is new and fires on every press | Codemod when the handler reads its argument |
| IconButton `onPress(active)` | `onActiveChange(active)`, only for a `toggle` button; `onPress()` fires for both kinds | Codemod when the handler reads its argument |
| ListItem `onPress(selected)` | `onSelectedChange(selected)`; `onPress()` is the press. The row still flips `selected` itself. | Codemod when the handler reads its argument |
| ListItem (no `titleLines`, no long press on the phone) | `titleLines` (web default 1, phone 2, as drawn before); phone `onLongPress` | New |
| ListItem `icon` / `avatar` defaulted to AntFabric samples | no sample default | Manual if you relied on it |
| Dialog stacked underlay title (fixed "Edit #release-train") | `behindTitle` | New |
| BottomSheet `primaryLabel` button fired nothing | `onPrimary` | New |
| ProgressBar `label` default "Uploading Q4 roadmap.pdf" | `label` defaults to "Progress" | Manual if a test or a screen relied on it |
| ProgressBar strings `cancelUpload`, `retryUpload` take `{title}` | take `{name}` (`"Annuler l'envoi de {name}"`); the English default reads the same | Manual |
| Skeleton `label` default "Loading messages" | "Loading", from `strings` | Manual if a test relied on it |
| InlineBanner danger: `role="status"` | `role="alert"` (assertive on the phone); other tones stay polite | No change to make |
| Menu items | core's `MenuItem` (re-exported); `toggled` matches `key ?? label`; `triggerLabel` is optional and reads the `moreActions` string ("More actions") | No change to make |
| EmptyState `art` defaults to `messages`, `icon` ignored under it | `art` defaults to `none`; `icon` draws | Manual: look at each |
| Fab `variant="compose"` / `"fabric"` / `"help"` | `"ink"` (the default) / `"tint"` / `"raised"`; the phone's pen wiggle is `wiggle` (old compose is `variant="ink" wiggle`) | Codemod for literals |
| Badge `label` default "unread mentions" | no default `label`; a count with none is named "{count} unread" | Manual if a test relied on it |
| text the kit drew (a name, a label, a placeholder) | `strings`: override for a tree with the root's, for one instance with the component's | New |

### Data

Import from `./data` as before. Core's chart helpers return parts, not English.

| 0.1 | 1.0 | |
|---|---|---|
| Breakdown, DonutChart, GoalRings `label` (the field naming a part) | `name`. They read `name` and `value`; GoalRings keeps `goal`. `label` is only an accessible name now. | Codemod |
| Breakdown, DonutChart, GoalRings `selection`, `onSelectionChange` | `selected`, `onSelectedChange`; both still hold the part's name or `null` | Codemod |
| Sparkline, SparkBars `field` | `y` | Codemod |
| KpiCard, StatTile `trendField` | `trendY` | Codemod |
| Table `rowKey` default `"id"` | default `"key"`; rows that name themselves `id` pass `rowKey="id"` or rename the field. `selected` and `onSelectedChange` hold those keys. | Manual |
| Table `columns[i].id` (`TableColumn.id`) | `columns[i].key`; `sort.column` still holds it | Codemod for literals |
| `chartTable` rows `id: "row-0"` | `key: "row-0"` | Manual |
| `ChartFrame` text | requires `emptyTitle`, `emptyLine`, `loadingLabel`; `Legend` requires `label`; `ChartCard` requires `viewAsTable`, `viewAsChart`; `ChartTooltip` and bars take an optional `totalLabel` | Manual (shared pieces only) |
| core `summarize`, `summarizeSegments`, `summarizeGauge`, `summarizeCompare`, `summarizeGoals` | take a words object | Manual |
| core `moved` | returns `{ direction, known, value }` | Manual |
| core `meterText` | `meterReading` | Manual |
| core `goalLeft`, `OTHER` | removed: `Goal` carries `known`, `met`, `left`; `segmentsOf` takes the folded segment's name; `cellText` takes the blank dash | Manual |
| KpiCard recipe part `trend` | now reaches the web | No change to make |

BarChart, LineChart, ComboChart, RadarChart, MetricTabs and PeriodCompare already read `x` and `y` (or `bars`, `line`, `metrics`, `current`, `previous`) and are unchanged. A metric's `field` stays `field`: it names the data field and is the metric's key.

### Shell

Import from `/shell`.

| 0.1 | 1.0 | |
|---|---|---|
| SidebarItem `kind` | removed. `kind="channel"` becomes `glyph="#"`; `kind="private"` becomes `icon="lock" description="private channel"`; `kind="dm"` becomes `avatar`; `kind="group"` becomes `icon="users" description="group conversation"` (a group row on the phone is 44pt, like other icon rows). | Manual |
| SidebarItem ⋮ fired nothing | fires `onMenu`; the accessible name is built through `strings` (`withDetail`) | New |
| SidebarSection `kind` | `icon` (`kind="starred"` becomes `icon="star"`) | Codemod for literals |
| SidebarSection `collapsed`, `onToggle` | `expanded` (default `true`; `collapsed` becomes `expanded={false}`), `onExpandedChange(expanded)` | Codemod; manual for a handler that reads its argument (it is inverted) |
| SidebarSection items | every item takes `key`; `selected` and `onSelectedChange(key)` hold a key, not a name; `items[i].onPress` becomes `onSelectedChange`; phone adds `onItemLongPress(key)` | Manual |
| WorkspaceSwitcher | every workspace takes `key`; `current` is a key (`current="Northwind Health"` becomes `current="northwind"`); `onSwitch(workspace)` becomes `onCurrentChange(key)`; a signed-out workspace fires it too and leaves `current` where it was; the web add row reads `addLabel`; phone recipe part `sheet` becomes `root` (`styles={{ sheet }}` becomes `styles={{ root }}`) | Manual; the phone's `sheet` → `root` style key is Codemod |
| MobileHeader `unread={n} onBell={f}` | `actions={[{ key: "notifications", icon: "bell", label: "Notifications", badge: n }]} onAction={f}`; `actions` are `IconActionItem[]` (`icon` required); `MobileHeaderAction` is removed | Manual |
| MobileHeader `time` | `clock`; new `identity` for the photo (default `"ink"`); `userName=""` draws no photo | Codemod for `time` |
| TabBar `onTab` | `onActiveChange` | Codemod |
| TabBar `collapsed`, `onExpand` | `expanded` (default `true`), `onExpandedChange(expanded)` | Codemod; manual for a handler that reads its argument (it is inverted) |
| TabBar `onFabric={f}` | `action={{ key: "assistant", icon: "sparkles", label: "Fabric" }} onAction={f}`; recipe parts `fabric`, `fabricIcon` become `action`, `actionIcon` | Manual |
| TabBar a badged tab's name | the `tab` template with `{what}` (its `badgeLabel`, else `new`) | New |
| TitleBar `onSidebarToggle`, `onMenu` | `onSidebarExpandedChange`, `onMenuOpenChange` | Codemod |
| TitleBar `onHelp={f}` | `actions={[{ key: "help", icon: "circle-help", label: "Help" }]} onAction={f}`; `history` and `search` are booleans | Manual |
| WebTopBar `desktopApp`, `onOpenDesktop`, `onHelp` | removed: `actions={[{ key: "desktop", icon: "square-arrow-out-up-right", label: "Open in desktop app", showLabel: true }, { key: "help", icon: "circle-help", label: "Help" }]} onAction={…}`; new `history`, `search`, `menu`, `trailing` | Manual |
| NavRail `NavRailKey`, `NavRailDestination`, `NavRailSection` | core `NavItem`; its `key` is any string | Codemod (the types) |
| NavRail `onNavigate`, `onLevel`, `onSection` | `onActiveChange`, `onLevelChange`, `onSectionChange` | Codemod |
| NavRail `updateNotice` | `notice` | Codemod |
| NavRail `notifications={n} onNotifications={f} onReport={g}` | `utilities={[{ key: "notifications", label: "Notifications", icon: "bell", badge: n }, …]} onAction={(item) => …}`; the same rail also takes `logo`, `title`, `home`, `search` (a boolean), all optional | Manual |
| NavItem `cap` | `max` (`max: 999` where `cap: 999` was), on NavRail items and TabBar tabs | Codemod |
| NavRail profile initials colour | `identity` (default `"ink"`, as drawn); the lockup name with no destination reads `lockupNoHome` | New |
| AppMenuBar `menus={["App","File"]} items={view} openMenu="View"` | `menus={[{ key: "app", label: "App" }, { key: "view", label: "View", items: view }]} openMenu="view"`; items: `keys` becomes `shortcut`, `separator: true` becomes `type: "separator"`, `theme: true` becomes `type: "scheme"`, `trailing` becomes `trailingIcon`, `submenu: true` becomes `submenu: []`; new `workspaceIdentity`, `clock` | Manual |

### Notifications

AppBadge, OsNotification and TrayMenu import from `/shell`; the rest stay in the root.

| 0.1 | 1.0 | |
|---|---|---|
| AppBadge `<AppBadge count={n} />` | `<AppBadge appName="Acme" mark={acmeMark} count={n} />` | Manual |
| PermissionPrompt | no prop change; copy through `strings["permission-prompt"]`; pass `origin` on the web; new web `onCheckAgain` ("Check again" fired nothing) | New |
| NotificationSchedule `tomorrowAt="9:00"` | an option with `detail: "9:00"`; pass `options` and `note`; `onPause(duration)` becomes `onPause(key)`; new `onPausedChange(paused)` | Manual |
| InAppBanner `kind="mention" channel="#x"` | `lead="Mentioned you" context="#x" replyable actions={[{ key: "read", label: "Mark as read", dismiss: true }]}` | Manual |
| InAppBanner `kind="meeting"` | `leading="tile" icon="video" actions={[{ key: "join", label: "Join", icon: "video", variant: "soft" }]}` | Manual |
| InAppBanner dismiss reason `"read"`; Join and Review at `onOpen` | `"action"`; they arrive at `onAction`; `time` no longer defaults to "now"; recipe part `channel` becomes `context` | Manual |
| InAppBanner sender avatar (a constant `"green"`) | `avatarSrc` and `identity` (default `"indigo"`); `identity="green"` keeps it | Manual if you want the old colour |
| NotificationItem `actor`, `preview` | `sender`, `body`; recipe part `preview` becomes `body` | Codemod |
| NotificationItem `kind="thread"` | `icon="message-square-reply" lead="Replied in a thread"` | Manual |
| NotificationItem `kind="agent-approval"` | `agent icon="shield-question" approval="pending"` | Manual |
| NotificationItem `kind="meeting"` / `"recording"` | `leading="tile"` plus the icon | Manual |
| NotificationItem sender avatar | `avatarSrc`, `identity` (default `"indigo"`); the name's sentences read `strings` (`sentence`, `followedBy`, same text) | New |
| OsNotification `kind="dm" onAction={(verb, text) => …}` | `appName="Acme" actions={[{ key: "reply", label: "Reply", reply: true }, { key: "read", label: "Mark as read", rest: true }]} onAction={(a, text) => …}` | Manual |
| OsNotification `channel`; `time` default "now" | `context`; no default time | Codemod for `channel` |
| OsNotification (no close handler) | `onClose` (web, desktop), `onSettings` (Windows' ⋯); sender avatar takes `avatarSrc`, `identity` | New |
| TrayMenu `<TrayMenu recorder="recording" elapsed="0:12" unread={3} />` | `<TrayMenu appName="Acme" tone="live" statusText="Recording 0:12" items={[…]} onSelect={…} />`; recipe variant `recorder` becomes `tone` | Manual |
| TrayMenu `open="pause-notifications"`, `onOpenChange` | `openMenu="pause-notifications"`, `onOpenMenuChange(openMenu)`; new `strings` | Codemod |

### System, overlays and navigation

| 0.1 | 1.0 | |
|---|---|---|
| HoverCard | no prop change; "Message yourself" is `strings["hover-card"].messageSelf` | None |
| Breadcrumbs `recording="recording" elapsed="4:31" onOpenRecordings={f}` | `status="live" statusLabel="Recording" statusDetail="4:31" statusAction="Open Recordings" onStatus={f}`; `paused` stays; `stopping` becomes `busy`; idle is `""`; recipe variant `recording` becomes `status` | Manual |
| Breadcrumbs `collapsed` | `expanded` (default `true`), new `onExpandedChange(expanded)`; every item takes `key` | Codemod for `collapsed`; manual for the items' `key` |
| ConnectionBanner phone `queued={n}` | `pending={n}`; copy through `strings["connection-banner"]` | Codemod |
| SessionState | no prop change; copy through `strings` | None |
| UpdateBanner `collapsed` (desktop) | `expanded` (default `true`); new `onStageChange(stage)` | Codemod |
| CommandPalette `onAskFabric={f}` | `onAsk={f}`; the ask row shows only when `ask` is true (new, default `false`) and `agentName` words it: `agentName="Fabric"` becomes `ask agentName="Fabric"` | Manual |
| CommandPalette `onQuery`, `CommandPaletteGroupItem` | `onQueryChange`, `CommandPaletteItem` | Codemod |
| CommandPalette items | every item takes `key`, `selected` is a key; `kind: "person"` becomes `avatar: true` (other kinds dropped); pass `filters` and `filter` yourself; placeholder and offline copy from `strings["command-palette"]` | Manual |
| ContextMenu `reactions: { emoji, mine? }[]` | `quickReactions: string[]` and `picked: string[]`: `[{ emoji: "👍", mine: true }, { emoji: "❤️" }]` becomes `quickReactions={["👍", "❤️"]} picked={["👍"]}`. A press puts the emoji in or takes it out and calls `onReact`, so several can be yours. | Manual |
| ContextMenu `authorIdentity`, `text` | `identity`, `body` | Codemod |
| ContextMenu defaults | no six-emoji default; `label` names the rows (default "Actions"); phone `title` defaults to `""` | Manual |

### Messaging

Message, MessageActions, Composer, ReactionPill, ThreadSummary, TypingIndicator and MessageDivider import from `/chat`; AttachmentCard and SwipeRow stay in the root.

| 0.1 | 1.0 | |
|---|---|---|
| MessageDivider, TypingIndicator | no prop change | None |
| ReactionPill `onPress(mine)` | `onMineChange(mine)`; `onPress()` is the press; the add pill fires `onPress()` only | Codemod when the handler reads its argument |
| ThreadSummary `onPress(following)` | `onFollowingChange(following)`; `onPress()` opens the thread; `ThreadSummaryParticipant` is `Person` | Codemod when the handler reads its argument |
| AttachmentCard `onRetry(status)` | `onStatusChange(status)`; `onRetry()` is Retry pressed | Codemod when the handler reads its argument |
| MessageActions `canReact`, `canReplyInThread`, `canForward`, `hasMore`, `onMore` | `addReaction`, `replyInThread`, `forward`, `more`, `onMenuOpenChange`; all default `false`; `quickReactions` defaults `[]`. The old bar: `quickReactions={["👍","✅","👀"]} addReaction replyInThread forward more`. New `actions` (`IconActionItem[]`) and `onAction(item)`. | Codemod for the renames (including `onMore` → `onMenuOpenChange`); manual for the quick-reaction bar and `actions` |
| Message `MessageReaction`, `MessageAttachment` | `Reaction`, `Attachment`; the old web bar is the same props as MessageActions plus `onReact`, `onAddReaction`, `onForward`, `onMenuOpenChange`; `onRetry(status)` becomes `onStatusChange(status)`; new `onAttachmentOpen`, `onAttachmentDownload` (not on the phone), `onAttachmentCancel`, `onAttachmentRetry`, each given the `Attachment`; an empty action bar is not drawn | Codemod (the types); manual for the bar |
| SwipeRow `context="notification" onMarkRead onClear` | `icon="at-sign" actions={[{ key: "read", label: "Mark {title} read", text: "Mark read", unreadOnly: true }, { key: "clear", label: "Clear {title}", text: "Clear", tone: "danger" }]} onAction`; `context="history"` becomes `dense` plus Rename and Delete items; `glyph` becomes `icon`; `open` and `unread` default `false`; a danger action leaves the row open | Manual |
| Composer `value`, `onChange` | `value`, `onValueChange` | Codemod |
| Composer `showFormatting` | `formatting` (off by default); the old tool row is `tools` (`IconActionItem[]`, icon required) with `attach emoji mention commands` (and `record` on the phone); new `onEmoji`, `onMention`, `onCommands`, `onFormat`, `onFormatting` | Manual |
| Composer attachments | `ComposerAttachment` becomes `Attachment`; every field reaches AttachmentCard; new `onAttachmentOpen`, `onAttachmentDownload` (web, desktop), `onAttachmentCancel`, `onAttachmentRetry` | Codemod (the type) |
| Composer `placeholder`, `alsoSendTo` defaults | `""`, from `strings`; locked notices through `strings.composer` | Manual |

### Agent

| 0.1 | 1.0 | |
|---|---|---|
| AgentSteps / ThinkingIndicator steps `{ id, label, server, state }` | `{ key, label, source, state }`, typed `AgentStep`; recipe part `server` becomes `source` | Codemod for literals |
| ThinkingIndicator `open`, `onOpenChange` | `expanded`, `onExpandedChange` (default `true`, as before); new `agentName`, `words` | Codemod |
| ApprovalItem `source="agent"` | `source="Agent" agent`; `source="jira" ticketKey="PROJ-217"` becomes `source="Jira" reference="PROJ-217"`; `biometric` becomes `verify`; `source` is a string (default `""` draws no tag); recipe part `ticket` becomes `reference` | Manual |
| QuestionPanel options `{ id, … }` | `{ key, … }`; `confirmOptionId` becomes `confirmOption` (default `""`); new `agentName`; `waitingLabel`, `regionLabel`, `placeholder` default `""` (from strings) | Codemod for literals |
| QuestionPanel `collapsed`, `onCollapsedChange` | `expanded`, `onExpandedChange`, default inverted; recipe part `bar` is gone (`styles={{ bar }}` becomes `styles={{ root }}`; the phone's `testID` `question-panel.bar` becomes `question-panel.root`); `title` is required | Codemod for the props and the style key; manual for a handler that reads its argument, the `testID` and `title` |
| ProjectMoveCard | removed (AntFabric-specific); QuestionPanel covers a choice between options | Manual |

### The conventions

The cross-cutting renames, one row per rule, with what each touched. [`reports/api/conventions.md`](reports/api/conventions.md) is the rule text.

| Rule | Before | After | |
|---|---|---|---|
| 1. A changed value is `on<Prop>Change` | `onChange`; `onPress(next)`; `onSwitch`; `onToggle`; `onOpenChange` on a menu name | `onValueChange` (TextField, SearchField, Composer, RadioGroup, Select, Tabs, SegmentedControl), `onCheckedChange` (Checkbox, Switch), `onSelectedChange` (Chip, ListItem, charts), `onActiveChange` (IconButton, TabBar), `onMineChange`, `onFollowingChange`, `onStatusChange`, `onCurrentChange`, `onOpenMenuChange`, `onPausedChange`, `onStageChange`; the press stays `onPress()` | Codemod where the handler reads its argument |
| 2. An item is named by `key` | `id`, `value` or a display name | `key` on items of Tabs, SegmentedControl, Select, RadioGroup, Breadcrumbs, SidebarSection, WorkspaceSwitcher, CommandPalette, QuestionPanel options, AgentStep, Table columns and rows (`rowKey` default `"key"`); props that name an item hold a key | Codemod for literals |
| 3. Open or closed is `expanded` | `collapsed`, `open` | `expanded` / `onExpandedChange`, positive, default as drawn before: Breadcrumbs, SidebarSection, QuestionPanel, TabBar, UpdateBanner, ThinkingIndicator. Overlays keep `open`. | Codemod (the value is inverted); manual for a handler that reads its argument |
| 4. Chart fields | `label`, `field`, `trendField`, `selection` | `name`, `y`, `trendY`, `selected`; axis charts read `x` and `y` | Codemod |
| 5. One name per concept | `cap`, `time`, `kind`, `authorIdentity`, `text`, `reactions` | `max`, `clock`, glyph/icon/avatar, `identity`, `body`, `quickReactions` + `picked`; `IconActionItem` for icon-only bars; `Person`, `Attachment`, `Reaction`; `avatarSrc` with `identity` on things that show someone; every button a component draws fires an event; string variable `{name}` | Mixed, as the tables above say |

## 1.0 → 1.1: icons

1.0 looked every icon name up in all of lucide, so an app's bundle held every lucide icon (a consumer of `Button` alone was 1,205 KB minified). From 1.1 each kit registers only the icons it draws itself, and `Icon` and every icon prop (`icon`, `iconLeading`, `triggerIcon`, an item's `icon`) also take the icon component. Names the kit draws keep working unchanged.

- **A lucide name the kit does not draw** (a channel's `git-branch`, an agent's `rocket`) now draws an empty box, and warns once in development. Register the names your app passes, once, before the first render:

  ```ts
  import { GitBranch, Rocket } from "lucide-react"; // lucide-react-native on the phone
  import { registerIcons } from "@antfabric/ui-react"; // @antfabric/ui-react-native on the phone
  registerIcons({ GitBranch, Rocket }); // keys are export names or kebab-case names
  ```

  Or pass the component where you used the name: `<Button iconLeading={GitBranch} />`, `{ key: "deploy", label: "Deploy", icon: Rocket }`. An item that must stay serialisable (built from config) keeps its name and the app registers it.
- **Types.** `IconName` is `string | IconComponent` in both kits (and core's items). Code that reads an item's `icon` as a string narrows it first (`typeof item.icon === "string"`).
- **Check:** in development the console has no `no icon "…"` warning, and `grep -rn "data-af-missing-icon"` over your rendered HTML (or `missing-icon:` testIDs on the phone) finds nothing.

## 1.0 → 1.1: the app drives the state

A component no longer shows the result of a request before the app confirms it. A press that asks for something shows a pending state on
the pressed control and reports the request; the outcome is drawn only from the props you pass. Pending ends when you pass a new value of
the props below, or when the promise your handler returns settles. So either return a promise, or answer with the props.

| Component | The press | Pass, as the answer | Before |
|---|---|---|---|
| Dialog | the CTA spins (`onConfirm`) | close it, or a new `error` or `loading` | the CTA set `loading` itself; Cancel, ✕, Esc and the scrim went dead |
| SessionState | Sign in (`onSignIn`), Unlock on the phone (`onUnlock`) | `state="waiting"`, `unlocked`, `error`, `offline` | the card turned to waiting, or unlocked, itself |
| UpdateBanner | Install and Retry (`onStageChange("downloading")`, `onApply`); Check again (`onStageChange("checking")`, `onCheck`) | `stage`, `error`, `progress` | the banner moved `stage` itself |
| PermissionPrompt | Turn on (`onAllow`) | `permission` (the OS's answer) | it showed on, and said so, at once |
| NotificationItem | Approve, Decline (`onApprove`, `onDecline`) | `approval` | it showed Approved or Declined at once |
| Message | Retry (`onStatusChange("sending")`, `onRetry`); a reaction pill (`onReact`) | `status`; `reactions` | it went back to sending itself; the pill flipped itself |
| AttachmentCard | Retry (`onStatusChange("uploading")`, `onRetry`) | `status`, `error`, `progress` | it went back to uploading itself |
| ReactionPill (with `mine` and `onMineChange`) | the pill (`onMineChange`) | `mine`, `count` | — (controlled already drew the app's; the pill is now busy meanwhile) |
| QuestionPanel | Submit (`onSubmit`) | `sending`, `offline` | it stayed Sending… until `sending` was pulsed |

- **Return a promise** from the handler when the request can fail without changing a prop (a retry that fails with the same error, an
  approval the server refuses, an OS prompt the person dismisses): `onRetry={() => resend(message)}` where `resend` returns its promise.
  Settling, either way, ends the pending state, and the props you pass then are what is drawn.
- **Or answer with the props.** A handler that returns nothing and never changes a prop leaves the control pending: Cancel, ✕ and Escape
  stay live meanwhile, but the CTA does not come back.
- **Pass the outcome props.** Where a component used to move a prop itself, it no longer does: `UpdateBanner stage`, `Message status`,
  `AttachmentCard status`, `SessionState state` and `unlocked`, `PermissionPrompt permission`, `NotificationItem approval`. `onStageChange` and
  `onStatusChange` keep their names and report what was asked for; their docs no longer declare `changes`.
- **Also in this batch:** a SidebarItem never makes itself current (pass `active`, or the section's `selected`); a ListItem that is a link,
  button or menu row never toggles `selected` (only `option` and `checkbox` rows do); ThreadSummary's press no longer flips `following`, and
  `onFollowingChange` is deprecated and never called; Toast's action also fires `onDismiss`; InAppBanner shows a new notification after a
  dismissal; AttachmentCard's voice note reports Play and Pause through the new `onPlayingChange`.
- **Check:** press each of these with your handler stubbed to return a rejected promise: the control spins, then comes back as it was, and
  no outcome (Approved, Unlocked, Notifications are on, Downloading) is drawn or announced.

## 1.0 → 1.1: pass-through props

`id`, `aria-*` and `ref` (the phone: `nativeID`, `accessibilityLabel`, `accessibilityHint` and `ref`) now go to the element that carries the
component's role. `className`, `data-*`, `testID` and `style` stay on the root.

| Component | `ref` and `id` were | Now |
|---|---|---|
| TextField, TextArea | the wrapper `<div>` (`View`) | the `<input>` / `<textarea>` (`TextInput`) |
| SearchField | the wrapper | the `<input>` (`TextInput`); the launcher `<button>` with `launcher` |
| Select | the wrapper | the trigger: `<button role="combobox">`, the native `<select>` in a phone browser, the `Pressable` on the phone |
| Chip | the wrapper | the chip's button |
| SegmentedControl | the wrapper (the `ScrollView` when `scrollable` on the phone) | the tab list |
| Dialog, Sheet, BottomSheet, CommandPalette, ContextMenu (phone) | the scrim or backdrop | the `role="dialog"` panel |
| Tabs (phone) | discarded | the `ScrollView` |
| PeriodCompare, MetricTabs, Breakdown (phone) | dropped | the chart's root inside its card |

- **Type change.** `TextFieldProps` takes `RootProps<HTMLInputElement>`, `TextAreaProps` `RootProps<HTMLTextAreaElement>`, `SearchFieldProps`
  `RootProps<HTMLInputElement | HTMLButtonElement>`, `SelectProps` `RootProps<HTMLButtonElement | HTMLSelectElement>`, `ChipProps`
  `RootProps<HTMLButtonElement>`; on the phone TextField, TextArea and SearchField take `RootProps<TextInput>`. A `useRef<HTMLDivElement>()` you
  passed to one of them is now a type error: change its type to the control's.
- **A ref that measured or scrolled the wrapper** now gets the control. Wrap the component in an element of your own and measure that.
- **Your own `aria-label` now wins** over the kit's name on every component (ListItem, Message, Skeleton, SessionState, the sparklines and
  others named in the changelog). An `aria-label` you passed and the kit ignored is now what a screen reader says: check its wording.
- **Check:** `<label htmlFor="email">Email</label><TextField id="email" />` focuses the field when the label is clicked, and
  `ref.current.focus()` on a TextField puts the caret in it.

## Checks you can run

One per step. Each says what you should see.

1. **Install.** `pnpm ls @antfabric/ui-core @antfabric/ui-react @antfabric/ui-react-native` lists `1.0.x` for each and nothing at `0.1.0`. **Check:** `grep -n "antfabric-ui.*0\.1\.0" pnpm-lock.yaml` prints nothing, and `pnpm why @antfabric/ui-core` shows one version.
2. **Imports.** **Check:** `grep -rn "@antfabric-ui/" src` prints nothing.
3. **Renames.** **Check:** your typecheck reports no renamed prop or type from the Codemod items, and `git status --short` is clean after the commit.
4. **Keep the look.** **Check:** the root carries `data-af-platform` and, with `themes.antfabric`, no `data-af-theme-id`; the primary `Button` is coral and `getComputedStyle(root).getPropertyValue("--af-font-sans")` starts with `Figtree`. With a branded theme the root carries `data-af-theme-id` and `--af-brand-default` is your primary.
5. **Manual list.** Search your source folders for the names the kit dropped:

   ```bash
   grep -rnE "brandVars|brandKey|ANTFABRIC_MARK|NavRailDestination|AvatarStackPerson|MobileHeaderAction|ProjectMoveCard" src
   grep -rnE "onToggle=|onBell=|onSwitch=|collapsed=" src
   ```

   **Check:** the first prints nothing, and the second prints nothing that is a kit component's prop.
6. **Typecheck and tests.** **Check:** your typecheck is clean with no `onChange`, `content`, `id` or `theme` error left on a kit component.
7. **Look.** **Check:** in light and dark, an empty state draws its icon, a list row you control follows your `selected`, and a failed form announces its danger banner once.
