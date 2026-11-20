# Conventions pass: the app-chrome components (shell, notifications, system, CommandPalette, Breadcrumbs)

The renames of `reports/api/conventions.md` that touch these 23 components, before → after. A renamed prop draws what the old one drew; an inverted boolean keeps today's drawing through its new default.

## Core
- `NavItem.cap` → `NavItem.max` (NavRail destinations, sections and utilities; TabBar tabs). `max: 999` where `cap: 999` was.
- New `IconActionItem` (`ActionItem & { icon: string }`, exported as a type from core and both kits' roots): the actions of TitleBar, WebTopBar and MobileHeader. `ActionItem.icon` stays optional for the components that do not need one (TabBar's `action`, InAppBanner's and OsNotification's buttons).
- Strings: `common.withDetail` (`"{label}, {detail}"`) is the one way a component grows an accessible name by a detail. New keys: `nav-rail.lockupNoHome`, `notification-item.sentence` and `followedBy`, `os-notification.withContext` and `withBody`, `notification-schedule.untilCustom`; `tab-bar.tab` takes `{what}` (`"{label}, {count} {what}"`); `tray-menu` has a (so far empty) group and reads `withDetail`.

## Shell
- SidebarSection: every item takes `key` (matching and React keys use it: `items={[{ name: "design-crit", … }]}` → `items={[{ key: "design-crit", name: "design-crit", … }]}`); `selected` and `onSelectedChange(selected)` hold a key, not a name; `collapsed={true}` → `expanded={false}` (default is now `true`); `onCollapsedChange(collapsed)` → `onExpandedChange(expanded)`; new phone-only `onItemLongPress(key)` (a row's long press). The header's long press stays `onMenu`. `SidebarSectionItem` is `SidebarItem`'s props and `key`.
- SidebarItem: the ⋮ now fires `onMenu` (web and desktop; it fired nothing); the accessible name is built through `withDetail` instead of joining `, `.
- NavRail: `onUtility(item)` → `onAction(item)`; `cap` → `max` on every item; new `identity` (the profile's initials colour, default `"ink"`, as it was drawn); the lockup name without a destination reads `lockupNoHome`.
- TabBar (phone): `collapsed={true}` → `expanded={false}` (default `true`); `onCollapsedChange(collapsed)` → `onExpandedChange(expanded)`; `cap` → `max`; a badged tab's accessible name is the template `tab` with `{what}` (its `badgeLabel`, else `new`).
- WorkspaceSwitcher: `onSwitch(workspace)` → `onCurrentChange(key)`, and `current` is controllable through it; a signed-out workspace fires it too (so the app can start its sign-in) and leaves `current` where it was; on the web a row press now also sets `current` when it is not controlled. The tile and row names are built through `withDetail`.
- MobileHeader: `time` → `clock`; `actions` are `IconActionItem[]` (`icon` required); new `identity` for the photo (default `"ink"`).
- TitleBar and WebTopBar: `actions` are `IconActionItem[]` (`icon` required; `WebTopBarAction` extends it).
- AppMenuBar: no change (already `key`, `openMenu`, `onOpenMenuChange`).

## Notifications
- TrayMenu: `open="pause-notifications"` → `openMenu="pause-notifications"`; `onOpenChange(open)` → `onOpenMenuChange(openMenu)`; new `strings` prop (a row with a `count` is read through `withDetail`).
- InAppBanner, NotificationItem, OsNotification: the sender's avatar takes `avatarSrc` and `identity` (default `"indigo"`; an agent is still drawn as one). InAppBanner drew a constant `"green"`: pass `identity="green"` to keep it.
- OsNotification: new `onClose` (the close button of every OS banner; web and desktop) and `onSettings` (Windows' ⋯), which fired nothing.
- NotificationItem: the accessible name's sentences read `sentence` and `followedBy` (same text).
- NotificationSchedule: an option's name with its `detail`, and the picker's `"{date}, {time}"`, are templates (`withDetail`, `untilCustom`).
- PermissionPrompt: new web `onCheckAgain` ("Check again" fired nothing).

## System
- UpdateBanner (desktop): `collapsed={true}` → `expanded={false}` (default `true`).

## Overlays and navigation
- CommandPalette: the ask row, the foot's hint and the empty state's "Press Enter to ask" show when `ask` is true (new, default `false`); `agentName` only words them (before, a non-empty `agentName` turned them on): `agentName="Fabric"` → `ask agentName="Fabric"`.
- Breadcrumbs: every item takes `key`; `collapsed={true}` → `expanded={false}` (default `true`); new `onExpandedChange(expanded)` (the … was pressed; `expanded` goes through `useControllable`, as the others do).

## Docs
- A required prop has no `default`: SidebarItem `name`, SidebarSection `label` and MobileHeader `title` moved their AntFabric value to `sample`.
- The sample data carries the new shapes: `SIDEBAR_SECTION_ITEMS` and the screens' sidebar rows have `key`; `NAV_RAIL_DESTINATIONS` has `max`; `trayMenuProps` returns `openMenu`; Breadcrumbs scenes in the HoverCard and CommandPalette docs have item `key`s.
