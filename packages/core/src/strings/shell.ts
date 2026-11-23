import type { OnlyOn, StringGroups } from "./index";

/** Built-in text of the `shell` components, keyed by component id. See `strings/index.ts`. */
export const shell = {
  "sidebar-item": {
    /** What a mention count is read as, on the count's badge. */
    mentions: "mentions",
    /** The row's accessible name when it has mentions: the count, then what it counts. */
    withMentions: "{count} mentions",
    /** Read when the row is muted. */
    muted: "muted",
    /** Read when an unsent draft is waiting. */
    draft: "draft",
    /** Read when the conversation is shared with another organisation. */
    external: "shared with an external organisation",
    /** What is read, and what the phone's second line says, while someone types and the row has no `typingText`. */
    typing: "typing…",
    /** The accessible name of the row's ⋮ button (web and desktop), and of the phone's long-press accessibility action. */
    options: "Options for {name}",
    /** Read after the name when the row's face wears the agent sparkle. */
    agent: "AI agent",
    /** Read after the name for the face's green presence dot. */
    presenceActive: "active",
    /** Read after the name for the away dot. */
    presenceAway: "away",
    /** Read after the name for the do-not-disturb dot. */
    presenceDnd: "do not disturb",
    /** Read after the name for the offline ring. */
    presenceOffline: "offline",
  },
  "sidebar-section": {
    /** The + action's name when the section has no `addLabel` of its own. */
    add: "Add",
    /** The count's name while the section is collapsed: what the unread number is of. */
    unreadIn: "unread in {label}",
    /** The header's accessible name while collapsed and something is unread: the label, then the count. */
    withUnread: "{label}, {count} unread",
    /** The header's tooltip while the section is collapsed (web and desktop). */
    expand: "Expand {label}",
    /** The header's tooltip while the section is open (web and desktop). */
    collapse: "Collapse {label}",
    /** The header's screen-reader hint while the section is collapsed (phone). */
    expandPhone: "Expands {label}",
    /** The header's screen-reader hint while the section is open (phone). */
    collapsePhone: "Collapses {label}",
    /** The ⋯ button's accessible name (web and desktop), and of the phone header's long-press accessibility action. */
    options: "{label} options",
  },
  "workspace-switcher": {
    /** The accessible name of the list, menu or sheet, and its title where one is drawn. */
    workspaces: "Workspaces",
    /** The add tile's (desktop) or add row's (phone) name when there is no `addLabel`. */
    add: "Add a workspace",
    /** The web menu's add row, when there is no `addLabel`: it signs in somewhere else rather than creating a workspace. */
    addMenu: "Sign in to another workspace",
    /** Read after a tile's name while it is the current workspace. */
    currentWorkspace: "current workspace",
    /** Read after a web menu row's host while it is the current workspace. */
    current: "current",
    /** Read after a tile's name when mentions are waiting there. */
    mentions: "{count} mentions",
    /** Read after a tile's name when it has new messages nobody asked about (desktop). */
    newMessages: "new messages",
    /** Read after a workspace's name while it is signed out. */
    signedOut: "signed out",
    /** A signed-out workspace's second line: its host, marked. */
    signedOutHost: "Signed out · {host}",
    /** What a tile's count badge counts. */
    mentionsBadge: "mentions",
  },
  "app-menu-bar": {
    /** The macOS menu bar's accessible name: the app (the first menu's label), then "menu bar". */
    menuBar: "{app} menu bar",
    /** The macOS menu bar's accessible name when the bar has no menus. */
    menuBarPlain: "Menu bar",
    /** The GNOME popover's back row: it returns to the main list. */
    backToMain: "Back to the main menu",
    /** The web menu's, and its ⋯ trigger's, accessible name: the workspace, then "menu". */
    workspaceMenu: "{name} menu",
    /** The web menu's accessible name when it has no workspace. */
    menu: "Menu",
    /** The Light / Dark / Match the system row's, and its radio group's, name. */
    theme: "Theme",
    /** The light theme's button. */
    light: "Light",
    /** The dark theme's button. */
    dark: "Dark",
    /** The button that follows the system's theme. */
    system: "Match the system",
  },
  "nav-rail": {
    /** The rail's accessible name. */
    main: "Main",
    /** The destinations list's accessible name. */
    mode: "Mode",
    /** A drilled-in destination's list: its name, then "sections". */
    sections: "{label} sections",
    /** A row's accessible name when it has a badge: the label, then the count; what it counts is the badge's own `badgeLabel` or "unread". */
    rowUnread: "{label}, {count} unread",
    /** An expanded utility row's text when it has a badge: the label, then the count. */
    utilityCount: "{label} · {count}",
    /** The lockup's accessible name: the product, its workspace, and the destination it opens. */
    lockup: "{title}, {workspace}, go to {home}",
    /** The lockup's accessible name when the rail has no workspace. */
    lockupNoWorkspace: "{title}, go to {home}",
    /** The lockup's accessible name when the rail has a workspace but no destination to open. */
    lockupNoHome: "{title}, {workspace}",
    /** The lockup's tooltip: the product, then its workspace. */
    lockupTitle: "{title}: {workspace}",
    /** The drilled-in tile's accessible name: the destination, then what pressing it does. */
    backFrom: "{label}. Back to the main menu",
    /** The Main menu chip's accessible name. */
    backToMain: "Back to the main menu",
    /** The drilled-in tile's tooltip, with the key that does the same. */
    backToMainKey: "Back to the main menu (Esc)",
    /** The Main menu chip's text. */
    mainMenu: "Main menu",
    /** The workspace chip's accessible name: it opens the workspace switcher. */
    workspace: "Workspace {name}, switch workspace",
    /** The search field's accessible name. A product says what it searches. */
    searchLabel: "Search",
    /** The search row's tooltip: what it searches, then the shortcut. A product says what it searches. */
    searchHint: "Search ({keys})",
    /** The profile button's accessible name and tooltip: it opens the profile and sign-out menu. */
    profile: "{name}, profile and sign out",
    /** The profile button's accessible name while its face shows a presence: the name, the presence word, then what it opens. */
    profileWithPresence: "{name}, {presence}, profile and sign out",
    /** The presence word for the face's green dot. */
    presenceActive: "active",
    /** The presence word for the away dot. */
    presenceAway: "away",
    /** The presence word for the do-not-disturb dot. */
    presenceDnd: "do not disturb",
    /** The presence word for the offline ring. */
    presenceOffline: "offline",
  },
  "title-bar": {
    /** The bar's accessible name. */
    windowTitleBar: "Window title bar",
    /** The search field's accessible name. A product says what it searches. */
    searchLabel: "Search",
    /** The search field's text when the bar has no `searchPlaceholder`. A product says what it searches. */
    searchPlaceholder: "Search",
    /** The search field's tooltip: its text, then the shortcut that opens it. */
    searchHint: "{placeholder} ({keys})",
    /** The Windows and Linux caption button that minimises the window. */
    minimise: "Minimise",
    /** The caption button that maximises the window. */
    maximise: "Maximise",
    /** The Linux caption button that undoes a maximise. */
    restore: "Restore",
    /** The Windows caption button that undoes a maximise. */
    restoreDown: "Restore down",
  },
  "web-top-bar": {
    /** The search field's accessible name, and the magnifier's while the bar is compact. A product says what it searches. */
    searchLabel: "Search",
    /** The search field's text when the bar has no `searchPlaceholder`. A product says what it searches. */
    searchPlaceholder: "Search",
    /** The search field's tooltip: its text, then the shortcut that opens it. */
    searchHint: "{placeholder} ({keys})",
    /** The ⋯ button's accessible name when the bar has a `workspace`. */
    workspaceMenu: "{name} menu",
    /** The ⋯ button's accessible name when it has none. */
    menu: "Menu",
  },
  "mobile-header": {
    /** The photo button's accessible name: it opens the person's settings. */
    profile: "Settings",
    /** The status line while the socket is not connected yet. */
    connecting: "Connecting…",
    /** The status line once the OS reports no network. */
    offline: "Offline — showing what’s on this phone",
    /** Said when the connection comes back (the status line goes away). */
    online: "Back online",
  },
  "tab-bar": {
    /** The tab list's accessible name. */
    main: "Main",
    /** A tab's accessible name when it has a badge: the label, then the count and what it counts (`{what}`: the tab's `badgeLabel`, else `new`). */
    tab: "{label}, {count} {what}",
    /** What a tab's badge counts when the tab has no `badgeLabel` of its own. */
    new: "new",
    /** The squeezed disc's accessible name: it brings the tabs back, naming the open one. */
    showTabs: "Show tabs. {label} is open",
    /** The squeezed disc's accessible name when no tab is open (a pushed screen is on top). */
    show: "Show tabs",
  },
} as const satisfies StringGroups;

/** Keys one kit draws and the other has no use for. */
export const shellOnly = {
  "sidebar-section": { expand: ["web"], collapse: ["web"], expandPhone: ["mobile"], collapsePhone: ["mobile"] },
  "workspace-switcher": { addMenu: ["web"], current: ["web"], newMessages: ["web"] },
} as const satisfies OnlyOn<typeof shell>;
