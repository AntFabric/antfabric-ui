/**
 * Sample data for the shell components (AppMenuBar, MobileHeader, NavRail, SidebarItem, SidebarSection, TabBar, TitleBar, WebTopBar,
 * WorkspaceSwitcher): what their docs' `sample`s, matrix `cases`, the screens and `RailWindow` share. AntFabric's copy for them (the search
 * labels) is in `antfabricStrings` (`@antfabric/ui-core/antfabric`).
 */

/** The rows of a sample sidebar section: channels (a `#` glyph), a private one (a lock), muted and unread. */
export const SIDEBAR_SECTION_ITEMS = [
  { key: "platform-eng", name: "platform-eng", glyph: "#", active: true },
  { key: "design-crit", name: "design-crit", glyph: "#", unread: true, mentions: 3 },
  { key: "release-train", name: "release-train", glyph: "#", unread: true },
  { key: "leadership-sync", name: "leadership-sync", icon: "lock", description: "private channel" },
  { key: "random", name: "random", glyph: "#", muted: true },
];

/** The View menu: the five entries the desktop app prepends to Tauri's default, then each OS's full-screen entry. */
export const APP_MENU_BAR_VIEW_ITEMS = [
  { label: "Reload", shortcut: "Mod+R" },
  { label: "Force Reload", shortcut: "Mod+Shift+R" },
  { type: "separator" },
  { label: "Actual Size", shortcut: "Mod+0" },
  { label: "Zoom In", shortcut: "Mod+=" },
  { label: "Zoom Out", shortcut: "Mod+-" },
  { type: "separator" },
  { label: "Enter Full Screen", shortcut: "Ctrl+Mod+F", os: "mac" },
  { label: "Toggle Full Screen", shortcut: "F11", os: "other" },
];

/** The desktop app's seven menus: only View carries entries here; an example that opens another gives it its own with `appMenusWith`. */
export const APP_MENU_BAR_MENUS: { key: string; label: string; items?: unknown[] }[] = [
  { key: "app", label: "AntFabric" },
  { key: "file", label: "File" },
  { key: "edit", label: "Edit" },
  { key: "view", label: "View", items: APP_MENU_BAR_VIEW_ITEMS },
  { key: "history", label: "History" },
  { key: "window", label: "Window" },
  { key: "help", label: "Help" },
];

/** The sample menus with `items` in the menu named `key`. */
export const appMenusWith = (key: string, items: unknown[]) => APP_MENU_BAR_MENUS.map((menu) => (menu.key === key ? { ...menu, items } : menu));

/** The web ⋯ menu: what a tab can do (never Reload, Zoom or Quit). */
export const APP_MENU_BAR_WEB_ITEMS = [
  { icon: "settings", label: "Preferences", shortcut: "Mod+," },
  { icon: "keyboard", label: "Keyboard shortcuts", shortcut: "Mod+/" },
  { type: "scheme" },
  { type: "separator" },
  { icon: "square-arrow-out-up-right", label: "Open in desktop app" },
  { icon: "monitor-down", label: "Download the desktop app" },
  { type: "separator" },
  { icon: "life-buoy", label: "Help", trailingIcon: "external-link" },
  { icon: "bug", label: "Report a problem…" },
  { type: "separator" },
  { icon: "log-out", label: "Sign out of GeekyAnts" },
];

/** Help, the web bar's last action and the desktop bar's only one. */
export const WEB_TOP_BAR_HELP = { key: "help", icon: "circle-help", label: "Help" };

/** The web bar's "Open in desktop app" link: a labelled ghost button that collapses to its icon while compact. */
export const WEB_TOP_BAR_DESKTOP = { key: "desktop", icon: "square-arrow-out-up-right", label: "Open in desktop app", showLabel: true };

/** The same slot where no install is detected. */
export const WEB_TOP_BAR_DOWNLOAD = { key: "desktop", icon: "monitor-down", label: "Get the desktop app", showLabel: true };

/** The web bar's actions: the desktop app, then Help. */
export const WEB_TOP_BAR_ACTIONS = [WEB_TOP_BAR_DESKTOP, WEB_TOP_BAR_HELP];

/** The desktop bar's actions: Help. */
export const TITLE_BAR_ACTIONS = [{ key: "help", icon: "circle-help", label: "Help" }];

/** What the catalogue's `RailWindow` passes the web bar over a nav rail: the same as its docs' samples. */
export const WEB_TOP_BAR_SAMPLE = { workspace: "GeekyAnts", history: true, search: true, actions: WEB_TOP_BAR_ACTIONS };

/** What `RailWindow` passes the desktop bar over a nav rail: the same as its docs' samples. */
export const TITLE_BAR_SAMPLE = { history: true, search: true, actions: TITLE_BAR_ACTIONS };

/** The main header's bell: notifications, with three unread. */
export const MOBILE_HEADER_ACTIONS = [{ key: "notifications", icon: "bell", label: "Notifications", badge: 3 }];

/** A pushed header's one action: the channel's details. */
export const MOBILE_HEADER_DETAILS = { key: "details", icon: "info", label: "Channel details" };

/** The phone's four tabs. Meetings and Recording draw no badge (`badge: 0`). */
export const TAB_BAR_TABS = [
  { key: "messages", label: "Messages", icon: "message-circle", badge: 3 },
  { key: "recording", label: "Recording", icon: "mic", badge: 0 },
  { key: "inbox", label: "Inbox", icon: "inbox", badge: 12 },
  { key: "meetings", label: "Meetings", icon: "video", badge: 0 },
];

/** The floating button beside the tab bar: the assistant. */
export const TAB_BAR_ACTION = { key: "fabric", icon: "sparkles", label: "Fabric" };

/** The workspaces a sample device has signed into: the current one, one with mentions, one with activity, one signed out. */
export const WORKSPACES = [
  { key: "geekyants", name: "GeekyAnts", host: "geekyants.antfabric.ai", identity: "red", current: true, signedIn: true },
  { key: "northwind", name: "Northwind Health", host: "northwind.antfabric.ai", identity: "indigo", mentions: 3, signedIn: true },
  { key: "lumen", name: "Lumen Studio", host: "lumen.antfabric.ai", identity: "green", activity: true, signedIn: true },
  { key: "kestrel", name: "Kestrel Labs", host: "kestrel.antfabric.ai", identity: "ochre", signedIn: false },
];

/** The nav rail's rows above the profile: notifications (three unread) and a bug report. */
export const NAV_RAIL_UTILITIES = [
  { key: "notifications", label: "Notifications", icon: "bell", badge: 3, badgeLabel: "unread notifications" },
  { key: "report", label: "Report a bug", icon: "bug" },
];

/**
 * The nav rail's destinations: each destination's sections are the desktop app's mail folders (state/mail.ts, MAIL_FOLDERS, without Unread) for the
 * Inbox, the workspace sidebar's sections for Channels, and the panes' views for Meetings and My tasks.
 */
export const NAV_RAIL_DESTINATIONS = [
  {
    key: "assistant",
    label: "Assistant",
    icon: "sparkles",
    badge: 0,
    sections: [
      {
        key: "new",
        label: "New chat",
        icon: "square-pen",
      },
      {
        key: "history",
        label: "Chat history",
        icon: "history",
      },
      {
        key: "files",
        label: "Files",
        icon: "files",
      },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    icon: "folder-kanban",
    badge: 0,
    sections: [
      {
        key: "all",
        label: "All projects",
        icon: "layout-grid",
      },
      {
        key: "starred",
        label: "Starred",
        icon: "star",
      },
      {
        key: "recent",
        label: "Recent",
        icon: "clock",
      },
      {
        key: "archived",
        label: "Archived",
        icon: "archive",
      },
    ],
  },
  {
    key: "channels",
    label: "Channels",
    icon: "hash",
    badge: 4,
    sections: [
      {
        key: "starred",
        label: "Starred",
        icon: "star",
      },
      {
        key: "channels",
        label: "Channels",
        icon: "hash",
        badge: 1,
      },
      {
        key: "projects",
        label: "Project channels",
        icon: "folder",
      },
      {
        key: "dms",
        label: "Direct messages",
        icon: "message-circle",
        badge: 3,
      },
    ],
  },
  {
    key: "meetings",
    label: "Meetings",
    icon: "calendar",
    badge: 0,
    sections: [
      {
        key: "day",
        label: "Day",
        icon: "calendar-1",
      },
      {
        key: "week",
        label: "Week",
        icon: "calendar-range",
      },
      {
        key: "upcoming",
        label: "Upcoming",
        icon: "calendar-clock",
      },
      {
        key: "past",
        label: "Past",
        icon: "history",
      },
    ],
  },
  {
    key: "tasks",
    label: "My tasks",
    icon: "check",
    badge: 0,
    sections: [
      {
        key: "today",
        label: "Due today",
        icon: "sun",
      },
      {
        key: "upcoming",
        label: "Upcoming",
        icon: "calendar-clock",
      },
      {
        key: "all",
        label: "All tasks",
        icon: "list-todo",
      },
      {
        key: "done",
        label: "Done",
        icon: "circle-check-big",
      },
    ],
  },
  {
    key: "recordings",
    label: "Recordings",
    icon: "mic",
    badge: 2,
    sections: [
      {
        key: "all",
        label: "All recordings",
        icon: "audio-lines",
        badge: 2,
      },
      {
        key: "mine",
        label: "Mine",
        icon: "user",
      },
      {
        key: "shared",
        label: "Shared with me",
        icon: "users",
      },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: "mail",
    badge: 390,
    max: 999,
    sections: [
      {
        key: "inbox",
        label: "Inbox",
        icon: "inbox",
        badge: 390,
        max: 999,
      },
      {
        key: "starred",
        label: "Starred",
        icon: "star",
      },
      {
        key: "sent",
        label: "Sent",
        icon: "send",
      },
      {
        key: "drafts",
        label: "Drafts",
        icon: "file-pen",
      },
      {
        key: "archive",
        label: "Archive",
        icon: "archive",
      },
      {
        key: "spam",
        label: "Spam",
        icon: "octagon-alert",
      },
      {
        key: "trash",
        label: "Trash",
        icon: "trash-2",
      },
    ],
  },
];

/** What the screens and the catalogue's `RailWindow` pass a nav rail: the same as its docs' samples, so a screen's rail draws as the component page's does. */
export const NAV_RAIL_SAMPLE = {
  logo: "a",
  title: "AntFabric",
  home: "assistant",
  workspace: "GeekyAnts",
  destinations: NAV_RAIL_DESTINATIONS,
  search: true,
  utilities: NAV_RAIL_UTILITIES,
  userName: "Priya Raman",
  email: "priya.raman@example.com",
};
