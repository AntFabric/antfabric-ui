/**
 * The 1.0 codemod's data: one entry per ledger line (`reports/migration/*.md`) it can do mechanically, and the lines it can only
 * point at. `engine.ts` reads these tables and nothing else decides what changes; `test.mts` checks them against the packages
 * and the docs (a rename's target is a documented prop, its source is not; the subpath lists are the real exports).
 *
 * A component name is the kit's own (`Select`), never a consumer's alias: the engine resolves a JSX tag or an import to it through
 * import bindings, local aliases and a wrapper package's re-exports.
 */

/** The two kits: `react` is web and desktop (`@antfabric/ui-react`), `native` is the phone (`@antfabric/ui-react-native`). */
export type Kit = "react" | "native";

/** `shell.md` and the others: which file of `reports/migration/` a line comes from. */
export type Ledger =
  | "foundations.md"
  | "base.md"
  | "data.md"
  | "shell.md"
  | "notifications.md"
  | "system-overlays.md"
  | "messaging.md"
  | "agent.md"
  | "conventions-base.md"
  | "conventions-chat.md"
  | "conventions-chrome.md"
  | "conventions-data.md"
  | "conventions-final.md";

/**
 * How a renamed event is treated, because a rename that keeps the arguments is mechanical and one that changes them is not:
 * - `same`: the arguments are the same, rename it.
 * - `ifReadsArg`: `onPress(next)` became `on<Prop>Change(next)` and a bare `onPress()` is still a press. Rename when the handler reads its
 *   argument; leave it when it does not; a handler the codemod cannot read goes to the manual list.
 * - `invertedArg`: the argument is now the opposite (`collapsed` → `expanded`). Rename when the handler ignores its argument; otherwise
 *   the manual list, because `(collapsed) => …` must now read `!expanded`.
 */
export type Handler = "same" | "ifReadsArg" | "invertedArg";

export interface PropRename {
  components: string[];
  from: string;
  to: string;
  kit?: Kit;
  handler?: Handler;
  /** Attributes added next to the renamed one when it is renamed and the element does not already have them (`ask`, `agentName="Fabric"`). */
  addAttrs?: string[];
  ledger: Ledger;
}

/** `collapsed` → `expanded`: the value is inverted. A literal is inverted; any other expression becomes `!(expr)`. */
export interface BooleanInversion {
  components: string[];
  from: string;
  to: string;
  ledger: Ledger;
}

/** One literal value of a prop becomes another (and may add attributes): `variant="compose"` → `variant="ink"`. */
export interface ValueRename {
  components: string[];
  prop: string;
  from: string;
  /** The prop it is written on afterwards (defaults to the same prop). */
  toProp?: string;
  toValue: string;
  addAttrs?: string[];
  kit?: Kit;
  ledger: Ledger;
}

/** `content={…}` → children. */
export interface ContentToChildren {
  components: string[];
  prop: string;
  ledger: Ledger;
}

/**
 * A field of the object literals written directly in an item prop (`items={[{ id: "a" }]}`, and through `.map(…)` callbacks, conditionals
 * and `as` casts) is renamed. An array built elsewhere is never followed; it goes to the manual list.
 */
export interface ItemFieldRename {
  components: string[];
  /** The prop holding the items. */
  prop: string;
  from: string;
  to: string;
  /** Item fields whose value is itself a list of the same kind of item (`sections`). */
  nested?: string[];
  /** Skip the rename when this attribute is on the element (Table's `rows` when `rowKey` is given). */
  unlessAttr?: string;
  /** Skip the object when it already has one of these fields (`id` on a NavRail destination that has its `key`). */
  unlessField?: string[];
  kit?: Kit;
  ledger: Ledger;
}

/** Every item takes a `key` that is its `name` (SidebarSection: matching used the name, so `key: name` keeps the behaviour). */
export interface ItemKeyFromField {
  components: string[];
  prop: string;
  field: string;
  ledger: Ledger;
}

/** A key of a `styles={{ … }}` object (a recipe part) is renamed. */
export interface StyleKeyRename {
  components: string[];
  from: string;
  to: string;
  kit?: Kit;
  ledger: Ledger;
}

/** A TypeScript name the kit exported and now exports under another name. */
export interface TypeRename {
  from: string;
  to: string;
  ledger: Ledger;
}

/** A name that is gone with no one-to-one replacement. */
export interface RemovedName {
  name: string;
  note: string;
  ledger: Ledger;
}

/** A prop that is gone or changed shape, and what the ledger says to do. Reported with file:line wherever it is written. */
export interface ManualProp {
  components: string[];
  prop: string;
  kit?: Kit;
  /** Not reported when the prop is an array literal whose every object already has this field (it has the new shape). */
  unlessItemField?: string;
  /** Only a value that is not a string literal is reported (a literal is already the new thing, or `valueRenames` rewrote it). */
  onlyNonLiteral?: boolean;
  /** String literals that are fine as they are and not reported. */
  exceptValues?: string[];
  note: string;
  ledger: Ledger;
}

/** An element that does not pass `missing` now draws differently, because a default changed. Listed separately: nothing is wrong, but look. */
export interface DefaultChange {
  components: string[];
  missing: string[];
  kit?: Kit;
  note: string;
  ledger: Ledger;
}

/** An object field inside an item prop that is gone or changed shape (`items[i].onPress`). */
export interface ManualItemField {
  components: string[];
  prop: string;
  field: string;
  note: string;
  ledger: Ledger;
}

// ---------------------------------------------------------------------------------------------------------------------
// Props renamed per component
// ---------------------------------------------------------------------------------------------------------------------

export const propRenames: PropRename[] = [
  // A changed value is on<Prop>Change (conventions-base.md, conventions-chat.md)
  { components: ["TextField", "SearchField", "Composer"], from: "onChange", to: "onValueChange", ledger: "conventions-base.md" },
  { components: ["Checkbox", "Switch"], from: "onChange", to: "onCheckedChange", ledger: "conventions-base.md" },
  { components: ["RadioGroup", "Select", "Tabs", "SegmentedControl"], from: "onChange", to: "onValueChange", ledger: "conventions-base.md" },
  { components: ["Select"], from: "activeId", to: "activeKey", ledger: "conventions-final.md" },
  { components: ["Composer"], from: "showFormatting", to: "formatting", ledger: "messaging.md" },

  // A press that also changed a value (conventions-final.md)
  { components: ["Chip", "ListItem"], from: "onPress", to: "onSelectedChange", handler: "ifReadsArg", ledger: "conventions-final.md" },
  { components: ["IconButton"], from: "onPress", to: "onActiveChange", handler: "ifReadsArg", ledger: "conventions-final.md" },
  { components: ["ReactionPill"], from: "onPress", to: "onMineChange", handler: "ifReadsArg", ledger: "conventions-final.md" },
  { components: ["ThreadSummary"], from: "onPress", to: "onFollowingChange", handler: "ifReadsArg", ledger: "conventions-final.md" },
  { components: ["AttachmentCard", "Message"], from: "onRetry", to: "onStatusChange", handler: "ifReadsArg", ledger: "conventions-final.md" },

  // Shell
  { components: ["SidebarSection"], from: "onToggle", to: "onExpandedChange", handler: "invertedArg", ledger: "shell.md" },
  { components: ["QuestionPanel"], from: "onCollapsedChange", to: "onExpandedChange", handler: "invertedArg", ledger: "conventions-chrome.md" },
  { components: ["TabBar"], from: "onExpand", to: "onExpandedChange", handler: "invertedArg", ledger: "shell.md" },
  { components: ["TabBar"], from: "onTab", to: "onActiveChange", ledger: "shell.md" },
  { components: ["TitleBar"], from: "onSidebarToggle", to: "onSidebarExpandedChange", ledger: "shell.md" },
  { components: ["TitleBar"], from: "onMenu", to: "onMenuOpenChange", ledger: "shell.md" },
  { components: ["MobileHeader"], from: "time", to: "clock", ledger: "conventions-chrome.md" },
  { components: ["NavRail"], from: "onNavigate", to: "onActiveChange", ledger: "shell.md" },
  { components: ["NavRail"], from: "onLevel", to: "onLevelChange", ledger: "shell.md" },
  { components: ["NavRail"], from: "onSection", to: "onSectionChange", ledger: "shell.md" },
  { components: ["NavRail"], from: "updateNotice", to: "notice", ledger: "shell.md" },
  { components: ["NavRail"], from: "onUtility", to: "onAction", ledger: "conventions-chrome.md" },

  // Notifications
  { components: ["TrayMenu"], from: "open", to: "openMenu", ledger: "conventions-chrome.md" },
  { components: ["TrayMenu"], from: "onOpenChange", to: "onOpenMenuChange", ledger: "conventions-chrome.md" },
  { components: ["InAppBanner", "OsNotification"], from: "channel", to: "context", ledger: "notifications.md" },
  { components: ["NotificationItem"], from: "actor", to: "sender", ledger: "notifications.md" },
  { components: ["NotificationItem"], from: "preview", to: "body", ledger: "notifications.md" },

  // System and overlays
  { components: ["CommandPalette"], from: "onQuery", to: "onQueryChange", ledger: "system-overlays.md" },
  { components: ["CommandPalette"], from: "onAskFabric", to: "onAsk", addAttrs: ["ask", 'agentName="Fabric"'], ledger: "system-overlays.md" },
  { components: ["ConnectionBanner"], from: "queued", to: "pending", kit: "native", ledger: "system-overlays.md" },
  { components: ["ContextMenu"], from: "authorIdentity", to: "identity", ledger: "conventions-chat.md" },
  { components: ["ContextMenu"], from: "text", to: "body", ledger: "conventions-chat.md" },

  // Messaging
  { components: ["MessageActions"], from: "canReact", to: "addReaction", ledger: "messaging.md" },
  { components: ["MessageActions"], from: "canReplyInThread", to: "replyInThread", ledger: "messaging.md" },
  { components: ["MessageActions"], from: "canForward", to: "forward", ledger: "messaging.md" },
  { components: ["MessageActions"], from: "hasMore", to: "more", ledger: "messaging.md" },
  { components: ["MessageActions"], from: "onMore", to: "onMenuOpenChange", ledger: "messaging.md" },
  { components: ["SwipeRow"], from: "glyph", to: "icon", ledger: "messaging.md" },

  // Agent
  { components: ["ThinkingIndicator"], from: "open", to: "expanded", ledger: "conventions-chat.md" },
  { components: ["ThinkingIndicator"], from: "onOpenChange", to: "onExpandedChange", ledger: "conventions-chat.md" },
  { components: ["ApprovalItem"], from: "biometric", to: "verify", ledger: "agent.md" },
  { components: ["ApprovalItem"], from: "ticketKey", to: "reference", ledger: "agent.md" },
  { components: ["QuestionPanel"], from: "confirmOptionId", to: "confirmOption", ledger: "agent.md" },

  // Data (conventions-data.md)
  { components: ["Breakdown", "DonutChart", "GoalRings"], from: "label", to: "name", ledger: "conventions-data.md" },
  { components: ["Breakdown", "DonutChart", "GoalRings"], from: "selection", to: "selected", ledger: "conventions-data.md" },
  { components: ["Breakdown", "DonutChart", "GoalRings"], from: "onSelectionChange", to: "onSelectedChange", ledger: "conventions-data.md" },
  { components: ["Sparkline", "SparkBars"], from: "field", to: "y", ledger: "conventions-data.md" },
  { components: ["KpiCard", "StatTile"], from: "trendField", to: "trendY", ledger: "conventions-data.md" },
];

// ---------------------------------------------------------------------------------------------------------------------
// Inverted booleans
// ---------------------------------------------------------------------------------------------------------------------

export const booleanInversions: BooleanInversion[] = [
  { components: ["Breadcrumbs", "SidebarSection", "QuestionPanel", "TabBar", "UpdateBanner"], from: "collapsed", to: "expanded", ledger: "conventions-chrome.md" },
];

// ---------------------------------------------------------------------------------------------------------------------
// A literal value that became another
// ---------------------------------------------------------------------------------------------------------------------

export const valueRenames: ValueRename[] = [
  { components: ["Fab"], prop: "variant", from: "compose", toValue: "ink", ledger: "base.md" },
  { components: ["Fab"], prop: "variant", from: "compose", toValue: "ink", addAttrs: ["wiggle"], kit: "native", ledger: "base.md" },
  { components: ["Fab"], prop: "variant", from: "fabric", toValue: "tint", ledger: "base.md" },
  { components: ["Fab"], prop: "variant", from: "help", toValue: "raised", ledger: "base.md" },
  { components: ["SidebarSection"], prop: "kind", from: "starred", toProp: "icon", toValue: "star", ledger: "shell.md" },
  { components: ["SidebarItem"], prop: "kind", from: "channel", toProp: "glyph", toValue: "#", ledger: "shell.md" },
  { components: ["ApprovalItem"], prop: "source", from: "agent", toValue: "Agent", addAttrs: ["agent"], ledger: "agent.md" },
  { components: ["ApprovalItem"], prop: "source", from: "jira", toValue: "Jira", ledger: "agent.md" },
  { components: ["ApprovalItem"], prop: "source", from: "zoho", toValue: "Zoho", ledger: "agent.md" },
];

/** An attribute a default used to supply and no longer does: added to an element that passes none of `unlessAttrs` (and no spread). */
export interface DefaultAttr {
  components: string[];
  kit?: Kit;
  unlessAttrs: string[];
  add: string;
  note: string;
  ledger: Ledger;
}

export const defaultAttrs: DefaultAttr[] = [
  { components: ["Fab"], kit: "native", unlessAttrs: ["variant", "wiggle"], add: "wiggle", note: "the phone's default variant was `compose`, which wiggled the pen", ledger: "base.md" },
];

// ---------------------------------------------------------------------------------------------------------------------
// content → children
// ---------------------------------------------------------------------------------------------------------------------

export const contentToChildren: ContentToChildren[] = [
  { components: ["Card", "Dialog", "BottomSheet"], prop: "content", ledger: "base.md" },
];

// ---------------------------------------------------------------------------------------------------------------------
// Item fields
// ---------------------------------------------------------------------------------------------------------------------

export const itemFieldRenames: ItemFieldRename[] = [
  // An item is named by key (conventions-base.md, conventions-final.md)
  { components: ["Tabs", "SegmentedControl", "Select"], prop: "items", from: "id", to: "key", ledger: "conventions-base.md" },
  { components: ["RadioGroup"], prop: "options", from: "value", to: "key", ledger: "conventions-base.md" },
  { components: ["Table"], prop: "rows", from: "id", to: "key", unlessAttr: "rowKey", ledger: "conventions-data.md" },
  { components: ["Table"], prop: "columns", from: "id", to: "key", ledger: "conventions-final.md" },
  { components: ["NavRail"], prop: "destinations", from: "id", to: "key", nested: ["sections"], unlessField: ["key"], ledger: "conventions-base.md" },
  // A badge's cap is max (conventions-chrome.md)
  { components: ["NavRail"], prop: "destinations", from: "cap", to: "max", nested: ["sections"], ledger: "conventions-chrome.md" },
  { components: ["TabBar"], prop: "tabs", from: "cap", to: "max", ledger: "conventions-chrome.md" },
  // Agent steps and question options (agent.md)
  { components: ["AgentSteps", "ThinkingIndicator"], prop: "steps", from: "id", to: "key", ledger: "agent.md" },
  { components: ["AgentSteps", "ThinkingIndicator"], prop: "steps", from: "server", to: "source", ledger: "agent.md" },
  { components: ["QuestionPanel"], prop: "options", from: "id", to: "key", ledger: "agent.md" },
];

export const itemKeysFromField: ItemKeyFromField[] = [
  { components: ["SidebarSection"], prop: "items", field: "name", ledger: "conventions-chrome.md" },
];

export const manualItemFields: ManualItemField[] = [
  { components: ["SidebarSection"], prop: "items", field: "onPress", note: "items[i].onPress is gone: use the section's onSelectedChange(key)", ledger: "shell.md" },
];

// ---------------------------------------------------------------------------------------------------------------------
// styles={{ part }}
// ---------------------------------------------------------------------------------------------------------------------

export const styleKeyRenames: StyleKeyRename[] = [
  { components: ["QuestionPanel"], from: "bar", to: "root", ledger: "conventions-chat.md" },
  { components: ["WorkspaceSwitcher"], from: "sheet", to: "root", kit: "native", ledger: "conventions-final.md" },
  { components: ["TabBar"], from: "fabric", to: "action", ledger: "shell.md" },
  { components: ["TabBar"], from: "fabricIcon", to: "actionIcon", ledger: "shell.md" },
  { components: ["InAppBanner", "OsNotification"], from: "channel", to: "context", ledger: "notifications.md" },
  { components: ["NotificationItem"], from: "preview", to: "body", ledger: "notifications.md" },
  { components: ["AgentSteps"], from: "server", to: "source", ledger: "agent.md" },
  { components: ["ApprovalItem"], from: "ticket", to: "reference", ledger: "agent.md" },
];

// ---------------------------------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------------------------------

export const typeRenames: TypeRename[] = [
  { from: "Theme", to: "Scheme", ledger: "foundations.md" },
  { from: "AvatarStackPerson", to: "Person", ledger: "conventions-base.md" },
  { from: "NavRailDestination", to: "NavItem", ledger: "shell.md" },
  { from: "NavRailSection", to: "NavItem", ledger: "shell.md" },
  { from: "TabBarTab", to: "NavItem", ledger: "conventions-chrome.md" },
  { from: "AgentStepsStep", to: "AgentStep", ledger: "agent.md" },
  { from: "ThinkingIndicatorStep", to: "AgentStep", ledger: "agent.md" },
  { from: "QuestionPanelOption", to: "QuestionOption", ledger: "agent.md" },
  { from: "QuestionPanelArg", to: "ToolArg", ledger: "agent.md" },
  { from: "CommandPaletteGroupItem", to: "CommandPaletteItem", ledger: "system-overlays.md" },
  { from: "ThreadSummaryParticipant", to: "Person", ledger: "messaging.md" },
  { from: "ComposerAttachment", to: "Attachment", ledger: "messaging.md" },
  { from: "MessageAttachment", to: "Attachment", ledger: "messaging.md" },
  { from: "MessageReaction", to: "Reaction", ledger: "messaging.md" },
];

/** Names that are gone. A reference goes to the manual list, with what the ledger puts in their place. */
export const removedNames: RemovedName[] = [
  { name: "brandVars", note: "no longer exported: a host that writes the variables itself uses themeCss(theme) and rootAttrs({ platform, os, scheme, theme })", ledger: "foundations.md" },
  { name: "brandKey", note: "no longer exported (the roots memoise a theme by its id)", ledger: "foundations.md" },
  { name: "ANTFABRIC_MARK", note: "AntFabric's own mark is not in core: pass your product's `mark` to AppBadge", ledger: "foundations.md" },
  { name: "ApprovalItemSource", note: "`source` is a string now", ledger: "agent.md" },
  { name: "AgentStepsStepState", note: "use AgentStep['state']", ledger: "agent.md" },
  { name: "ProjectMoveCard", note: "removed (AntFabric-specific): QuestionPanel covers a choice between options", ledger: "agent.md" },
  { name: "ProjectMoveCardProject", note: "removed with ProjectMoveCard", ledger: "agent.md" },
  { name: "ProjectMoveCardProps", note: "removed with ProjectMoveCard", ledger: "agent.md" },
  { name: "CommandPaletteKind", note: "items `kind: \"person\"` became `avatar: true`; other kinds are dropped", ledger: "system-overlays.md" },
  { name: "ContextMenuReaction", note: "reactions are `quickReactions: string[]` and `picked: string[]`", ledger: "conventions-chat.md" },
  { name: "InAppBannerKind", note: "`kind` is gone: lead, context, leading, icon and actions say what it is", ledger: "notifications.md" },
  { name: "NotificationItemKind", note: "`kind` is gone: icon, lead, leading, agent and approval say what it is", ledger: "notifications.md" },
  { name: "OsNotificationKind", note: "`kind` is gone: appName, actions and context say what it is", ledger: "notifications.md" },
  { name: "NotificationScheduleDuration", note: "options are `NotificationScheduleOption` with a `key` and a `detail`", ledger: "notifications.md" },
  { name: "SidebarItemKind", note: "`kind` is gone: glyph, icon, avatar and description say what it is", ledger: "shell.md" },
  { name: "SidebarSectionKind", note: "`kind` became `icon`", ledger: "shell.md" },
  { name: "TrayMenuRecorder", note: "`recorder` became `tone` (TrayMenuTone) with `statusText` and `items`", ledger: "notifications.md" },
  { name: "WebTopBarDesktopApp", note: "`desktopApp` is gone: it is an entry in `actions`", ledger: "shell.md" },
  { name: "BreadcrumbsRecording", note: "`recording` became `status` (BreadcrumbsStatus) with `statusLabel`, `statusDetail`, `statusAction`", ledger: "system-overlays.md" },
  { name: "MobileHeaderAction", note: "`actions` are IconActionItem[] (a `key` is required) and the press is `onAction`", ledger: "shell.md" },
  { name: "NavRailKey", note: "a destination's `key` is a plain string now (`active` is a string); NavRailDestination and NavRailSection became NavItem", ledger: "shell.md" },
  { name: "TabBarKey", note: "a tab's `key` is a string now", ledger: "conventions-chrome.md" },
  { name: "SwipeRowContext", note: "`context` is gone: icon and actions say what it is", ledger: "messaging.md" },
  { name: "goalLeft", note: "removed from core's /chart: a Goal carries `known`, `met` and `left`", ledger: "data.md" },
  { name: "OTHER", note: "removed from core's /chart: `segmentsOf` takes the folded segment's name", ledger: "data.md" },
  { name: "meterText", note: "renamed `meterReading` in core's /chart (it returns the parts, and takes a words object)", ledger: "data.md" },
];

// ---------------------------------------------------------------------------------------------------------------------
// What the codemod can only point at
// ---------------------------------------------------------------------------------------------------------------------

export const manualProps: ManualProp[] = [
  // foundations.md
  { components: ["AntFabricRoot", "ThemeProvider"], prop: "brand", note: "`brand` is gone: theme={defineTheme({ name, extends: themes.antfabric, brand })}", ledger: "foundations.md" },

  // base.md

  // shell.md
  { components: ["SidebarItem"], prop: "kind", note: "`kind` is gone: kind=\"private\" → icon=\"lock\" description=\"private channel\"; \"dm\" → avatar; \"group\" → icon=\"users\" description=\"group conversation\"", ledger: "shell.md" },
  { components: ["SidebarSection"], prop: "kind", note: "`kind` became `icon` (kind=\"starred\" → icon=\"star\")", ledger: "shell.md" },
  { components: ["SidebarSection"], prop: "selected", note: "`selected` holds an item's key, not its name (the same text only where `key` is the name)", ledger: "conventions-chrome.md" },
  { components: ["WorkspaceSwitcher"], prop: "current", note: "`current` is a workspace key (current=\"Northwind Health\" → current=\"northwind\")", ledger: "shell.md" },
  { components: ["WorkspaceSwitcher"], prop: "workspaces", unlessItemField: "key", note: "every workspace takes `key`", ledger: "shell.md" },
  { components: ["WorkspaceSwitcher"], prop: "onSwitch", note: "`onSwitch(workspace)` → `onCurrentChange(key)`", ledger: "conventions-chrome.md" },
  { components: ["MobileHeader"], prop: "unread", note: "`unread={n} onBell={f}` → actions={[{ key: \"notifications\", icon: \"bell\", label: \"Notifications\", badge: n }]} onAction={f}", ledger: "shell.md" },
  { components: ["MobileHeader"], prop: "onBell", note: "`unread={n} onBell={f}` → actions={[{ key: \"notifications\", icon: \"bell\", label: \"Notifications\", badge: n }]} onAction={f}", ledger: "shell.md" },
  { components: ["MobileHeader"], prop: "actions", unlessItemField: "key", note: "actions are IconActionItem[]: `{ key, icon, label, badge? }` and the press is the header's `onAction(item)`; the old `onPress` per action is gone", ledger: "shell.md" },
  { components: ["TabBar"], prop: "onFabric", note: "`onFabric={f}` → action={{ key: \"assistant\", icon: \"sparkles\", label: \"Fabric\" }} onAction={f}", ledger: "shell.md" },
  { components: ["TitleBar"], prop: "onHelp", note: "`onHelp={f}` → actions={[{ key: \"help\", icon: \"circle-help\", label: \"Help\" }]} onAction={f}", ledger: "shell.md" },
  { components: ["WebTopBar"], prop: "desktopApp", note: "`desktopApp`, `onOpenDesktop`, `onHelp` → `actions` and `onAction` (see the ledger line)", ledger: "shell.md" },
  { components: ["WebTopBar"], prop: "onOpenDesktop", note: "`desktopApp`, `onOpenDesktop`, `onHelp` → `actions` and `onAction` (see the ledger line)", ledger: "shell.md" },
  { components: ["WebTopBar"], prop: "onHelp", note: "`desktopApp`, `onOpenDesktop`, `onHelp` → `actions` and `onAction` (see the ledger line)", ledger: "shell.md" },
  { components: ["NavRail"], prop: "notifications", note: "`notifications={n} onNotifications={f} onReport={g}` → utilities={[{ key: \"notifications\", label: \"Notifications\", icon: \"bell\", badge: n }, …]} onUtility", ledger: "shell.md" },
  { components: ["NavRail"], prop: "onNotifications", note: "→ `utilities` and `onAction` (see the ledger line)", ledger: "shell.md" },
  { components: ["NavRail"], prop: "onReport", note: "→ `utilities` and `onAction` (see the ledger line)", ledger: "shell.md" },
  { components: ["AppMenuBar"], prop: "menus", note: "`menus` is `{ key, label, items }[]` and the top-level `items` is gone; item fields `keys` → `shortcut`, `separator: true` → `type: \"separator\"`, `theme: true` → `type: \"scheme\"`, `trailing` → `trailingIcon`, `submenu: true` → `submenu: []`", ledger: "shell.md" },
  { components: ["AppMenuBar"], prop: "items", note: "the top-level `items` is gone: put each menu's items under `menus[i].items`", ledger: "shell.md" },
  { components: ["AppMenuBar"], prop: "openMenu", note: "`openMenu` holds a menu's key", ledger: "shell.md" },

  // notifications.md
  { components: ["NotificationSchedule"], prop: "tomorrowAt", note: "an option with `detail: \"9:00\"`; pass `options` and `note`", ledger: "notifications.md" },
  { components: ["NotificationSchedule"], prop: "onPause", note: "`onPause(duration)` → `onPause(key)` of an option", ledger: "notifications.md" },
  { components: ["InAppBanner"], prop: "kind", note: "kind=\"mention\" → lead=\"Mentioned you\" replyable actions={[{ key: \"read\", label: \"Mark as read\", dismiss: true }]}; kind=\"meeting\" → leading=\"tile\" icon=\"video\" actions={[{ key: \"join\", label: \"Join\", icon: \"video\", variant: \"soft\" }]}", ledger: "notifications.md" },
  { components: ["InAppBanner"], prop: "onOpen", note: "Join and Review arrive at `onAction`, not `onOpen`; dismiss reason \"read\" → \"action\"", ledger: "notifications.md" },
  { components: ["InAppBanner"], prop: "time", note: "`time` no longer defaults to \"now\"", ledger: "notifications.md" },
  { components: ["NotificationItem"], prop: "kind", note: "kind=\"thread\" → icon=\"message-square-reply\" lead=\"Replied in a thread\"; \"agent-approval\" → agent icon=\"shield-question\" approval=\"pending\"; \"meeting\" / \"recording\" → leading=\"tile\" plus the icon", ledger: "notifications.md" },
  { components: ["OsNotification"], prop: "kind", note: "kind=\"dm\" → appName=\"Acme\" actions={[{ key: \"reply\", label: \"Reply\", reply: true }, { key: \"read\", label: \"Mark as read\", rest: true }]}", ledger: "notifications.md" },
  { components: ["OsNotification"], prop: "onAction", note: "`onAction(verb, text)` → `onAction(a, text)` where `a` is the action object", ledger: "notifications.md" },
  { components: ["OsNotification"], prop: "time", note: "`time` no longer defaults to \"now\"", ledger: "notifications.md" },
  { components: ["TrayMenu"], prop: "recorder", note: "<TrayMenu recorder=… elapsed=… unread=…> → appName=\"Acme\" tone=\"live\" statusText=\"Recording 0:12\" items={[…]} onSelect={…}", ledger: "notifications.md" },
  { components: ["TrayMenu"], prop: "elapsed", note: "→ statusText and `items` (see the ledger line)", ledger: "notifications.md" },
  { components: ["TrayMenu"], prop: "unread", note: "→ `items` (see the ledger line)", ledger: "notifications.md" },

  // system-overlays.md
  { components: ["Breadcrumbs"], prop: "recording", note: "`recording=… elapsed=… onOpenRecordings=…` → status=\"live\" statusLabel=\"Recording\" statusDetail=\"4:31\" statusAction=\"Open Recordings\" onStatus; `stopping` → `busy`", ledger: "system-overlays.md" },
  { components: ["Breadcrumbs"], prop: "elapsed", note: "→ statusDetail (see `recording`)", ledger: "system-overlays.md" },
  { components: ["Breadcrumbs"], prop: "onOpenRecordings", note: "→ `onStatus` (see `recording`)", ledger: "system-overlays.md" },
  { components: ["Breadcrumbs"], prop: "items", unlessItemField: "key", note: "every item takes `key`", ledger: "conventions-chrome.md" },
  { components: ["CommandPalette"], prop: "items", unlessItemField: "key", note: "every item takes `key`; `kind: \"person\"` → `avatar: true` (other kinds dropped); `selected` is a key; pass `filters` and `filter` yourself", ledger: "system-overlays.md" },
  { components: ["CommandPalette"], prop: "groups", unlessItemField: "key", note: "every item takes `key`; `kind: \"person\"` → `avatar: true`; `CommandPaletteGroupItem` → `CommandPaletteItem`", ledger: "system-overlays.md" },
  { components: ["CommandPalette"], prop: "selected", note: "`selected` is an item's key", ledger: "system-overlays.md" },
  { components: ["ContextMenu"], prop: "reactions", note: "`reactions: { emoji, mine? }[]` → quickReactions={[\"👍\", \"❤️\"]} picked={[\"👍\"]}", ledger: "conventions-chat.md" },
  { components: ["ContextMenu"], prop: "picked", note: "`picked` is now the person's own set (string[]), not one emoji", ledger: "conventions-chat.md" },

  // messaging.md
  { components: ["SwipeRow"], prop: "context", note: "context=\"notification\" onMarkRead onClear → icon=\"at-sign\" actions={[{ key: \"read\", … }, { key: \"clear\", … }]} onAction; context=\"history\" → dense plus Rename and Delete items", ledger: "messaging.md" },
  { components: ["SwipeRow"], prop: "onMarkRead", note: "→ `actions` and `onAction` (see `context`)", ledger: "messaging.md" },
  { components: ["SwipeRow"], prop: "onClear", note: "→ `actions` and `onAction` (see `context`)", ledger: "messaging.md" },
  { components: ["Composer"], prop: "tools", note: "`tools` are IconActionItem: the `icon` is required and `onAction` is given the item", ledger: "conventions-chat.md" },
  { components: ["MessageActions", "Message"], prop: "actions", note: "`actions` are IconActionItem and `onAction` is given one", ledger: "conventions-chat.md" },

  // agent.md
  { components: ["Fab"], prop: "variant", exceptValues: ["ink", "tint", "raised"], note: "`variant` values were renamed: compose → ink, fabric → tint, help → raised", ledger: "base.md" },
  { components: ["ApprovalItem"], prop: "source", onlyNonLiteral: true, note: "`source` is a display string now (source=\"Agent\" agent; source=\"Jira\" reference=\"PROJ-217\"); only literals are rewritten", ledger: "agent.md" },
];

export const defaultChanges: DefaultChange[] = [
  { components: ["EmptyState"], missing: ["art"], note: "`art` defaults to `none` (it was `messages`): pass art=\"messages\" to keep the picture", ledger: "base.md" },
  { components: ["Message", "MessageActions"], missing: ["quickReactions"], note: "the quick-reaction bar is off by default: quickReactions={[\"👍\",\"✅\",\"👀\"]} addReaction replyInThread forward more draws the old bar", ledger: "messaging.md" },
  { components: ["Composer"], missing: ["tools"], note: "the tool row (attach, emoji, mention, commands; record on the phone) and `formatting` are off by default", ledger: "messaging.md" },
  { components: ["ContextMenu"], missing: ["quickReactions"], note: "pass `quickReactions` (no longer six emoji by default); `label` names the rows (default \"Actions\")", ledger: "system-overlays.md" },
  { components: ["CommandPalette"], missing: ["ask"], note: "the ask row shows only with `ask` (new, default false)", ledger: "conventions-chrome.md" },
  { components: ["ProgressBar"], missing: ["label"], note: "`label` defaults to \"Progress\" (it was \"Uploading Q4 roadmap.pdf\")", ledger: "base.md" },
  { components: ["AppBadge"], missing: ["appName"], note: "pass `appName` and `mark` (ANTFABRIC_MARK is no longer in core): <AppBadge appName=\"Acme\" mark={acmeMark} count={n} />", ledger: "notifications.md" },
];

// ---------------------------------------------------------------------------------------------------------------------
// Subpaths: what moved out of the root entry
// ---------------------------------------------------------------------------------------------------------------------

export type Subpath = "shell" | "chat";

/**
 * What each kit's `/shell` and `/chat` entry exports, components and their types. A name imported from the root entry that is in a list
 * here is imported from the subpath now. `test.mts` compares these lists with the entries' real exports.
 */
export const moved: Record<Subpath, Record<Kit, string[]>> = {
  shell: {
    react: [
      "AppBadge", "AppMenuBar", "NavRail", "OsNotification", "SidebarItem", "SidebarSection", "TitleBar", "TrayMenu", "WebTopBar", "WorkspaceSwitcher",
      "AppBadgeProps", "AppMenuBarColorScheme", "AppMenuBarItem", "AppMenuBarMenu", "AppMenuBarProps", "AppMenuBarWebItem", "NavRailLevel", "NavRailProps",
      "NavRailVariant", "OsNotificationAction", "OsNotificationLeading", "OsNotificationProps", "OsNotificationReply", "SidebarItemProps",
      "SidebarSectionItem", "SidebarSectionProps", "TitleBarProps", "TrayMenuItem", "TrayMenuProps", "TrayMenuTone", "WebTopBarAction", "WebTopBarProps",
      "WorkspaceSwitcherProps", "WorkspaceSwitcherWorkspace",
    ],
    native: [
      "AppBadge", "MobileHeader", "OsNotification", "SidebarItem", "SidebarSection", "TabBar", "WorkspaceSwitcher",
      "AppBadgeProps", "MobileHeaderConnection", "MobileHeaderProps", "MobileHeaderTitleAlign", "MobileHeaderVariant", "OsNotificationAction",
      "OsNotificationLeading", "OsNotificationProps", "OsNotificationReply", "SidebarItemProps", "SidebarSectionItem", "SidebarSectionProps", "TabBarProps",
      "WorkspaceSwitcherProps", "WorkspaceSwitcherWorkspace",
    ],
  },
  chat: {
    react: [
      "Composer", "Message", "MessageActions", "MessageDivider", "ReactionPill", "ThreadSummary", "TypingIndicator",
      "ComposerFormat", "ComposerMode", "ComposerProps", "ComposerSendKey", "MessageActionsProps", "MessageDividerKind", "MessageDividerProps",
      "MessageIdentity", "MessageProps", "MessageStatus", "MessageThread", "ReactionPillProps", "ReactionPillVariant", "ThreadSummaryProps",
      "TypingIndicatorProps",
    ],
    native: [
      "Composer", "Message", "MessageDivider", "ReactionPill", "ThreadSummary", "TypingIndicator",
      "ComposerMode", "ComposerProps", "MessageDividerKind", "MessageDividerProps", "MessageIdentity", "MessageProps", "MessageStatus", "MessageThread",
      "ReactionPillProps", "ReactionPillVariant", "ThreadSummaryProps", "TypingIndicatorProps",
    ],
  },
};

// ---------------------------------------------------------------------------------------------------------------------
// Roots
// ---------------------------------------------------------------------------------------------------------------------

/** The components that carry the scheme and the theme. `theme="dark"` was a scheme in 0.1; a theme object is new. */
export const roots = {
  /** `theme=` (a scheme) → `scheme=`. */
  schemeRename: ["AntFabricRoot", "AntFabricProvider"],
  /** `brand={…}` → a theme made with defineTheme. */
  brand: ["AntFabricRoot", "ThemeProvider"],
  /** A top-level one with no theme gets `theme={themes.antfabric}`: 0.1 drew AntFabric's look and 1.0 defaults to neutral. */
  themeLine: ["AntFabricRoot", "AntFabricProvider", "ThemeProvider"],
};

/** The name given to the theme `brand={x}` becomes. */
export const BRAND_THEME_NAME = "app";

/** The strings groups whose placeholder `{title}` became `{name}`, and the keys. */
export const stringPlaceholders = [
  { group: "progress-bar", keys: ["cancelUpload", "retryUpload"], from: "{title}", to: "{name}", ledger: "conventions-final.md" as Ledger },
];

/** Where each moved name's package comes from: the kit packages. */
export const PACKAGES: Record<Kit, string> = { react: "@antfabric/ui-react", native: "@antfabric/ui-react-native" };
export const CORE_PACKAGE = "@antfabric/ui-core";
