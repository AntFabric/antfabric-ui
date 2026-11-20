import type { ComponentDocs } from "../../types";
import { NAV_RAIL_DESTINATIONS, NAV_RAIL_UTILITIES } from "../../samples";

const docs: ComponentDocs = {
  id: "nav-rail",
  name: "Nav rail",
  category: "shell",
  level: "organism",
  status: "beta",
  description: "The app's one persistent navigation column, at the left edge on desktop and web: 64px of icons collapsed, 248px with labels open, opened and closed by the sidebar button in the title bar or the web top bar. It reads top to bottom as identity, search, the places to be, what is waiting, then you — and the place you are is one soft coral pill that slides between rows. Two variants: flat (variant 1) lists the destinations; drill-in (variant 2), which the web and desktop screens use, opens a destination's sections in the rail itself, its icon taking the logo's place at the top.",
  props: {
    variant: {
      type: "enum",
      options: ["flat", "drill-in"],
      default: "flat",
      description: "flat (variant 1): one list of destinations. drill-in (variant 2): pressing a destination moves its icon into the logo's place and lists its sections under it; the top icon, the Main menu chip or Esc go back.",
    },
    expanded: {
      type: "boolean",
      default: false,
      description: "248px with labels, or 64px of icons. The rail has no toggle of its own: the sidebar button in the title bar (title-bar) or the web top bar (web-top-bar) sets it. Remembered per device.",
    },
    logo: {
      type: "node",
      sample: "a",
      description: "The mark in the lockup tile. A string is drawn as the tile's glyph; an element is drawn bare in the tile. Leave it out for no tile.",
    },
    title: {
      type: "string",
      default: "",
      sample: "AntFabric",
      description: "The wordmark beside the tile while expanded. With no `logo` and no `title`, the lockup is not drawn at the menu level.",
    },
    home: {
      type: "string",
      default: "",
      sample: "assistant",
      description: "The key of the destination the lockup opens; its name is that destination's label, else the key itself. Empty opens the first destination.",
    },
    workspace: {
      type: "string",
      default: "",
      sample: "GeekyAnts",
      description: "The signed-in workspace, drawn under the lockup when expanded. It opens the workspace switcher. Empty draws no chip.",
    },
    active: {
      type: "string",
      default: "",
      sample: "channels",
      description: "The key of the row that carries the pill. A key no destination has (\"none\" while the profile screen covers the workspace) marks none.",
    },
    level: {
      type: "enum",
      options: ["menu", "sections"],
      default: "sections",
      description: "drill-in: the active destination's sections with its icon at the top (sections), where the rail rests, or the destinations (menu), where you go to change destination. A destination without sections always shows the menu. Variant 1 ignores it.",
    },
    section: {
      type: "string",
      default: "",
      description: "drill-in: the current section of the active destination, by key. \"none\" lights no section (a page of that destination that is in none of them); any other key that names none of them makes the first current.",
    },
    destinations: {
      type: "array",
      default: [],
      sample: NAV_RAIL_DESTINATIONS,
      description: "{ key, label, icon, badge, max?, sections? } in rail order. max defaults to 9 (9+); the Inbox opts up to 999 because a mail backlog is measured in hundreds. Meetings and My tasks never badge: a schedule is not a backlog. sections, for the drill-in variant, are { key, label, icon, badge?, max? }: the Inbox's are the desktop app's mail folders without Unread (state/mail.ts, MAIL_FOLDERS), Channels' the workspace sidebar's sections (WorkspaceSidebar), and Meetings' Day and Week and My tasks' Due today and Done those panes' views; the rest are placeholders until the product names them.",
    },
    search: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Draws the Search row (its field while expanded).",
    },
    utilities: {
      type: "array",
      default: [],
      sample: NAV_RAIL_UTILITIES,
      description: "NavItem: { key, label, icon, badge?, max?, badgeLabel? }. The rows above the profile: notifications, a bug report. Collapsed, a badge is a corner count (9+ by default) read as `badgeLabel`; expanded the row reads \"{label} · {count}\" with no pill.",
    },
    userName: {
      type: "string",
      default: "",
      sample: "Priya Raman",
      description: "The person's name, in the profile button at the foot. Empty draws no profile button.",
    },
    email: {
      type: "string",
      default: "",
      sample: "priya.raman@example.com",
      description: "Under the name while expanded.",
    },
    avatarSrc: {
      type: "string",
      default: "",
    },
    identity: {
      type: "enum",
      options: ["indigo", "red", "ochre", "green", "ink", "agent"],
      default: "ink",
      description: "The colour of the profile's initials when there is no `avatarSrc`.",
    },
    presence: {
      type: "enum",
      options: ["none", "active", "away", "dnd", "offline"],
      default: "active",
    },
    searchKeys: {
      type: "string",
      default: "Mod+K",
    },
    notice: {
      type: "node",
      default: "",
      description: "A card above the bottom rows, such as the over-the-air update card (UpdateNotice). Draws nothing when empty.",
    },
    onActiveChange: {
      type: "event",
      args: "active: string",
      changes: "active",
    },
    onLevelChange: {
      type: "event",
      args: "level: 'menu' | 'sections'",
      changes: "level",
      description: "drill-in: a destination with sections was pressed (sections), or the top icon, the Main menu chip or Esc took the rail back (menu).",
    },
    onSectionChange: {
      type: "event",
      args: "section: string",
      changes: "section",
      description: "drill-in: a section was pressed, or a destination opened on one: the section last open there, or its first.",
    },
    onSearch: {
      type: "event",
    },
    onAction: {
      type: "event",
      args: "item: NavItem",
      description: "A utility row was pressed: its item, whole.",
    },
    onProfile: {
      type: "event",
    },
    onWorkspace: {
      type: "event",
    },
    workspaceMenuOpen: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "The menu the workspace chip opens is open: the chip's aria-expanded. The app opens it from `onWorkspace`.",
    },
    profileMenuOpen: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "The menu the profile button opens is open: the button's aria-expanded. The app opens it from `onProfile`.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <nav aria-label=\"Main\"> with a nested <nav aria-label=\"Mode\">: every row a <button data-af-press> (aria-current=\"page\" on the current one, a title as its tooltip) with Badge, Kbd and Avatar; inline styles over t, hover and focus from useInteraction. active, level and section are useControllable with onActiveChange, onLevelChange and onSectionChange; expanded is the app's, set by the web top bar's sidebar button (onSidebarExpandedChange). The pill is painted on the current row (no shared sliding indicator yet), and rows are buttons, not router links, since there is no href prop",
      import: "import { NavRail } from \"@antfabric/ui-react/shell\"",
      notes: [
        "The same rail as desktop, under the web top bar rather than beside traffic lights. Every row is a real link — /assistant, /projects, /channels — so ⌘-click and middle-click open a destination in a new tab.",
        "The active row comes from the route, not from state: Back in the browser moves the pill.",
        "Desktop's jump chords mostly collide in a browser (⌘⇧T reopens a closed tab, ⌘⇧C is the inspector, ⌘⇧P a private window in Firefox, ⌘⇧M Chrome's profile menu). The web uses two-key sequences instead: G then A, P, C, M, T, R, I.",
        "Report a bug on the web opens the same report flow without the native screenshot; it asks to capture the tab with getDisplayMedia and works without it.",
        "The rail's width is opened and closed from the web top bar, by the sidebar button before Back, as shadcn's sidebar puts its trigger outside the sidebar. The rail holds only navigation.",
        "The web screens draw the drill-in variant (variant 2) inside Channels. With routes, the destination, the level and the section are all in the URL (/channels/dms), so Back in the browser also steps back out of a destination.",
      ],
      keyboard: [
        {
          keys: "Mod+K",
          action: "Opens the command palette",
        },
        {
          keys: "Esc",
          action: "Drill-in: from a destination's sections back to the destinations, focus on the destination",
        },
        {
          keys: "G then A / P / C / M / T / R / I",
          action: "Assistant, Projects, Channels, Meetings, My tasks, Recordings, Inbox (not while typing)",
        },
        {
          keys: "↑ / ↓",
          action: "Moves between rows inside the rail",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same @antfabric/ui-react component as the web: <button> rows over t with Badge, Kbd and Avatar, states from useInteraction; the width animates by a CSS transition and the labels fade in with enter(\"fade\"). Drill-in: the sections slide in with enter(\"slide-left\") and the destinations back with enter(\"slide-right\"), the tile pops in with enter(\"pop\"). The coral pill is drawn on the current row; the sliding indicator (useSlidingIndicator) and the destination icon's flight to the top are not in the kit yet",
      import: "import { NavRail } from \"@antfabric/ui-react/shell\"",
      notes: [
        "Every row is 40px — a circle collapsed, a pill expanded (ADR-0300: the rail stays round; only the search field is squared).",
        "The active pill is ONE element that slides between rows with a leading edge faster than its trailing edge, so it stretches toward the destination and settles (ADR-0517/0518). Rows paint nothing; the catalogue draws the pill on the active row because it cannot animate.",
        "Colour: --brand-soft fill. Today's label is --brand, 3.11:1 on that fill, which fails AA; this spec uses --brand-active (the 'brand-strong' repair NavRail names, 5.40:1). Owner to confirm.",
        "Badge caps come from the destination: 9+ for Channels and Recordings; the Inbox prints up to 999 and then '1k+', because the collapsed rail fits three glyphs and a fourth hangs over the seam.",
        "UpdateNotice mounts here and renders nothing unless a release is waiting (it was once mounted nowhere, and an offered update drew nothing).",
        "Pressing a destination sets `active` and the pill moves to it. The rail keeps it itself until the app passes it back (useControllable), and reports it through onActiveChange, so the catalogue preview is interactive.",
        "The rail has no collapse control of its own: the sidebar button sits in the title bar, after the traffic lights (or ☰) and before Back, as shadcn's sidebar puts its trigger outside the sidebar. Its onSidebarToggle gives the app the width to pass as `expanded`, and the rail's width animates between 64px and 248px while the labels fade in. Today's desktop draws the button under the lockup (NavRail.tsx, a.toggleNav); this spec moves it.",
        "Drill-in (variant 2), which the desktop screens draw: pressing a destination that has sections moves its icon onto the coral tile where the logo was and lists its sections under it (`level` 'sections'); expanded, the wordmark becomes the destination's name and the workspace pill a Main menu chip. The tile (an arrow on hover or focus), the chip and Esc go back to the destinations (`level` 'menu'). Each destination reopens on the section last open there. A destination without sections opens directly, as in variant 1.",
        "Drill-in on desktop is new in this spec: today's desktop rail is flat, and each destination's sections live in the pane beside it (WorkspaceSidebar for Channels, the Inbox's folder column).",
        "The workspace pill opens the workspace switcher (desktop-onboarding, ADR-5553). Collapsed, the pill is hidden, so the profile menu carries 'Switch workspace'.",
        "Window chrome: under the macOS traffic lights the rail starts below the 44px title bar (title-bar).",
      ],
      keyboard: [
        {
          keys: "Mod+K",
          action: "Opens the command palette",
        },
        {
          keys: "Esc",
          action: "Drill-in: from a destination's sections back to the destinations, focus on the destination",
        },
        {
          keys: "Mod+J",
          action: "Assistant, and back",
        },
        {
          keys: "Mod+Shift+C",
          action: "Channels",
        },
        {
          keys: "Mod+Shift+P",
          action: "Projects",
        },
        {
          keys: "Mod+Shift+M",
          action: "Meetings",
        },
        {
          keys: "Mod+Shift+T",
          action: "My tasks",
        },
        {
          keys: "Mod+Shift+B",
          action: "Report a problem",
        },
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "tab-bar. The phone navigates with the floating bottom bar (Messages, Recording, Inbox, Meetings) and the Fabric disc; notifications are the bell and the profile is the photo in the mobile header.",
    },
  },
  a11y: {
    role: "navigation",
    notes: [
      "The current row has aria-current=\"page\"; the pill itself is aria-hidden and carries no text, so the place is announced once.",
      "Labels are built from the UNCAPPED number — 'Inbox, 390 unread' — even when the eye sees 9+ or 1k+.",
      "Collapsed, every row keeps its accessible name and gets a tooltip; nothing is icon-only to a screen reader.",
      "Drill-in: the list is a <nav> named for where it is ('Mode', or 'Channels sections'). The top tile is a button named 'Channels. Back to the main menu', so the destination is announced where the logo was.",
      "Drill-in: opening a destination or going back replaces the pressed row, so focus moves to the row that is now current instead of falling to the page. Escape in a destination's sections goes back.",
      "The workspace chip and the profile button are menu buttons (aria-haspopup=\"menu\"); their aria-expanded follows `workspaceMenuOpen` and `profileMenuOpen`, which the app sets while its menu is open.",
      "The destination list scrolls when it does not fit, so the utilities and the profile stay in view. Every row, the utilities and the profile draw a focus ring.",
    ],
  },
  examples: [
    {
      name: "Variant 1 · flat, collapsed",
      description: "The destinations in one list. The sidebar button that widens it is in the title bar or the web top bar.",
      platforms: ["web", "desktop"],
    },
    {
      name: "Variant 1 · flat, expanded",
      props: {
        expanded: true,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Variant 2 · drill-in, inside Channels",
      description: "Channels' icon has taken the logo's place and its sections are listed under it. The tile goes back to the destinations.",
      props: {
        variant: "drill-in",
        level: "sections",
        section: "channels",
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Variant 2 · drill-in, inside Channels, expanded",
      props: {
        variant: "drill-in",
        level: "sections",
        section: "channels",
        expanded: true,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Variant 2 · drill-in, the destinations",
      description: "The menu level: the same rows as variant 1, but pressing one opens its sections. Expanded, a chevron on hover says so.",
      props: {
        variant: "drill-in",
        level: "menu",
        expanded: true,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Variant 2 · drill-in, inside the Inbox",
      props: {
        variant: "drill-in",
        level: "sections",
        active: "inbox",
        section: "inbox",
        expanded: true,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Assistant active",
      props: {
        active: "assistant",
        expanded: true,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Inbox active, collapsed",
      props: {
        active: "inbox",
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Update waiting",
      props: {
        expanded: true,
        notice: "UpdateNotice — Update available · Restart to update",
      },
      platforms: ["desktop"],
    },
    {
      name: "Nothing new",
      props: {
        utilities: [
          { key: "notifications", label: "Notifications", icon: "bell", badgeLabel: "unread notifications" },
          { key: "report", label: "Report a bug", icon: "bug" },
        ],
        destinations: [
          {
            key: "assistant",
            label: "Assistant",
            icon: "sparkles",
            badge: 0,
          },
          {
            key: "projects",
            label: "Projects",
            icon: "folder-kanban",
            badge: 0,
          },
          {
            key: "channels",
            label: "Channels",
            icon: "hash",
            badge: 0,
          },
          {
            key: "meetings",
            label: "Meetings",
            icon: "calendar",
            badge: 0,
          },
          {
            key: "tasks",
            label: "My tasks",
            icon: "check",
            badge: 0,
          },
          {
            key: "recordings",
            label: "Recordings",
            icon: "mic",
            badge: 0,
          },
          {
            key: "inbox",
            label: "Inbox",
            icon: "mail",
            badge: 0,
            max: 999,
          },
        ],
      },
      platforms: ["web", "desktop"],
    },
  ],
  matrix: [
    {
      prop: "variant",
    },
    {
      prop: "expanded",
    },
    {
      prop: "active",
      values: ["assistant", "channels", "inbox", "none"],
    },
  ],
  states: ["focus"],
  edgeCases: [
    {
      title: "Big counts in a 64px column",
      platforms: ["web", "desktop"],
      handling: "Channels and Recordings print 9+. The Inbox prints its real number up to 999 and then 1k+ — never 999+, which is four glyphs and hangs nine pixels past the rail's hairline. The accessible name keeps the exact count.",
      example: {
        name: "Backlog",
        props: {
          utilities: [
            { key: "notifications", label: "Notifications", icon: "bell", badge: 42, badgeLabel: "unread notifications" },
            { key: "report", label: "Report a bug", icon: "bug" },
          ],
          destinations: [
            {
              key: "assistant",
              label: "Assistant",
              icon: "sparkles",
              badge: 0,
            },
            {
              key: "projects",
              label: "Projects",
              icon: "folder-kanban",
              badge: 0,
            },
            {
              key: "channels",
              label: "Channels",
              icon: "hash",
              badge: 57,
            },
            {
              key: "meetings",
              label: "Meetings",
              icon: "calendar",
              badge: 0,
            },
            {
              key: "tasks",
              label: "My tasks",
              icon: "check",
              badge: 0,
            },
            {
              key: "recordings",
              label: "Recordings",
              icon: "mic",
              badge: 14,
            },
            {
              key: "inbox",
              label: "Inbox",
              icon: "mail",
              badge: 812,
              max: 999,
            },
          ],
        },
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "No row is current",
      platforms: ["web", "desktop"],
      handling: "The profile screen draws over the workspace and lights no row; the pill is not parked anywhere arbitrary — it is simply absent until a destination is chosen.",
      example: {
        name: "Profile open",
        props: {
          active: "none",
          expanded: true,
        },
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "Long workspace, name or email",
      platforms: ["web", "desktop"],
      handling: "The workspace pill hugs its text and ellipsises at the rail's width; the profile's name and email truncate on one line each. Full values are in the tooltips.",
      example: {
        name: "Long identity",
        props: {
          expanded: true,
          workspace: "Northwind Health Partners — Clinical Ops",
          userName: "Oluwaseun Adeyemi-Fitzgerald",
          email: "oluwaseun.adeyemi-fitzgerald@northwind-health.com",
        },
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop"],
      handling: "The pill jumps to the new row instead of sliding, and the rail's width change is instant. Drill-in: the sections and the destinations swap in place, without sliding, and the tile appears without popping. Hover washes keep their 120ms fade, which is not motion.",
    },
    {
      title: "Drill-in: a destination with no sections",
      platforms: ["web", "desktop"],
      handling: "It opens directly, as in variant 1: the pill moves to it and the rail stays on the destinations, with no chevron on hover. Only a destination with sections gets a second level.",
      example: {
        name: "Nothing to drill into",
        props: {
          // Not a destination here, so the lockup's name is the text itself (the old rail always said "Assistant").
          home: "Assistant",
          variant: "drill-in",
          level: "sections",
          active: "inbox",
          expanded: true,
          destinations: [
            {
              key: "channels",
              label: "Channels",
              icon: "hash",
              badge: 4,
            },
            {
              key: "inbox",
              label: "Inbox",
              icon: "mail",
              badge: 390,
              max: 999,
            },
          ],
        },
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "Drill-in: a section the destination does not have",
      platforms: ["web", "desktop"],
      handling: "When `section` names none of the active destination's sections (an old link, a folder that was removed), the first section is current rather than none, so the rail always says where you are.",
      example: {
        name: "Unknown section",
        props: {
          variant: "drill-in",
          level: "sections",
          active: "meetings",
          section: "archived",
          expanded: true,
        },
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "Read on another device",
      platforms: ["web", "desktop"],
      handling: "Counts are server-owned: reading #design-crit on the phone lowers the Channels badge here, the Dock or taskbar badge and the tab title in one read-state event.",
    },
    {
      title: "Offline",
      platforms: ["web", "desktop"],
      handling: "Desktop draws the rail from its SQLite cache with the last known counts; the web keeps what it has in memory. The profile's presence dot is hidden — this device cannot know anyone's presence — and Report a bug queues the report until reconnect.",
    },
    {
      title: "Short window",
      platforms: ["web", "desktop"],
      handling: "At 720px tall the rail still fits: the spacer shrinks to its 12px minimum first. Below that (web at high zoom) the destinations scroll inside the rail while identity, notifications and the profile stay pinned.",
    },
    {
      title: "Touch laptop",
      platforms: ["web", "desktop"],
      handling: "pointer: coarse keeps the 40px rows (already above the 24px minimum) and opens tooltips on long-press instead of hover; the collapsed rail never relies on hover to reveal a label.",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop"],
      handling: "The rail is --surface-chrome on the darker page; the pill becomes --brand-soft dark (#382525) with the light coral label, and the hairline on the right edge stays the only seam.",
    },
  ],
  related: [
    "workspace-switcher",
    "title-bar",
    "web-top-bar",
    "tab-bar",
    "update-notice",
    "command-palette",
    "profile-menu",
  ],
  flows: [
    {
      id: "go-to-a-destination",
      title: "Go to the Inbox from the rail",
      description: "The rail never decides where you are. The store on the desktop, or the route on the web, says which row is current; pressing a row asks to go there, and the one pill slides after it.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "One key from the workspace store lights a row",
          detail: "activeNav reads screen, wsMode and projPane and returns exactly one key, so two rows can never be lit at once. The counts come from acrossProjectsCounts: unread channels, untranscribed recordings and unread mail.",
          code: "const active = activeNav(s)  // 'channels'",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The route lights the row",
          detail: "Each row is a TanStack Router <Link>, and activeProps gives the current one aria-current and the pill, so the browser's own Back moves the pill too. The counts are one TanStack Query read, shared with the tab title.",
          code: "<Link to=\"/inbox\" activeProps={{ 'aria-current': 'page' }}>",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Inbox is pressed",
          detail: "A click, or Enter on the focused row. Collapsed, the row's tooltip names it. On the web, G then I does the same from anywhere outside a text field.",
        },
        {
          kind: "event",
          title: "onActiveChange('inbox') fires",
          detail: "The rail hands back the destination's key and nothing else. What the Inbox is, and how to get there, belongs to the app.",
          code: "onActiveChange?.(item.key)  // 'inbox'",
        },
        {
          kind: "state",
          title: "The store opens the Inbox pane",
          detail: "openInbox writes the new location and closes whatever was drawn over the old one (the notifications popover, the profile menu, the profile screen), so the pane you asked for is the one you see.",
          code: "set({ screen: 'channels', wsMode: 'projects', projPane: 'inbox', panel: 'none', notifOpen: false, profileOpen: false, profileScreen: false })",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The router goes to /inbox",
          detail: "A push onto the browser's history, so Back returns to #platform-eng. ⌘-click or middle-click opens the Inbox in a new tab instead, because the row is a real link. The route's loader warms the mail list through TanStack Query.",
          code: "navigate({ to: '/inbox' })  // loader: queryClient.ensureQueryData(inboxQuery)",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The pill slides down to Inbox",
          detail: "One coral-soft pill, not a fill on each row. Its leading edge arrives in 180ms (--duration-quick) and its trailing edge in 320ms (--duration-slow), so it stretches toward the Inbox and then settles. With Reduce Motion it jumps.",
        },
        {
          kind: "result",
          title: "The Inbox is open and its row is current",
          detail: "aria-current moves to Inbox and the pane lists the 390 unread. Today's desktop also hides the count on the row you're on, because the pane already lists what it counted; this spec still draws it.",
          code: "const showBadge = badge > 0 && !isOn",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {},
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          props: {},
        },
        {
          step: 2,
          press: "Inbox, 390 unread",
          hold: 900,
          props: {},
        },
        {
          step: 6,
          hold: 1700,
          props: {
            active: "inbox",
          },
        },
      ],
    },
    {
      id: "expand-and-pick",
      title: "Open the rail, pick a place, and it tucks itself away",
      description: "The expanded rail is for finding a destination. Once one is chosen the rail collapses again, so the pane that just opened gets the width back.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "Whether it's open is one store field",
          detail: "Today navOpen starts false on every launch. This spec remembers it per device.",
          code: "const open = s.navOpen",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "Remembered in this browser",
          detail: "Read from a cookie in the root route's loader, before the first paint, so the rail never draws collapsed and then jumps open.",
          code: "const { railExpanded } = Route.useLoaderData()",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The sidebar button is pressed",
          detail: "The panel icon in the title bar (after the traffic lights, or ☰) or the web top bar, before Back: outside the rail, as shadcn's sidebar puts its trigger. Its name says which way it goes: Expand the sidebar, Collapse the sidebar.",
        },
        {
          kind: "event",
          title: "The bar's onSidebarToggle(true) fires",
          detail: "The title bar or the web top bar passes the width the rail is about to have, so the caller can save it without reading it back, and hands it to the rail as `expanded`. Today's desktop draws this button under the rail's lockup.",
          code: "<TitleBar sidebarExpanded={open} onSidebarToggle={setOpen} /> … <NavRail expanded={open} />",
        },
        {
          kind: "state",
          title: "The store flips navOpen and shuts the profile menu",
          detail: "A profile menu anchored to the narrow rail would hang in the wrong place once it widens, so it closes.",
          code: "toggleNav: () => set((s) => ({ navOpen: !s.navOpen, profileOpen: false }))",
          platforms: ["desktop"],
        },
        {
          kind: "motion",
          title: "The rail widens to 248px and the labels fade in",
          detail: "The width eases over 200ms (--duration-base). The pill is re-measured without easing, so it widens with the rows instead of chasing them. The workspace pill and the search field fade in under the lockup.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "Meetings is chosen",
          detail: "Any destination row. Search, Notifications, Report a bug and the profile menu are not destinations and leave the rail open.",
        },
        {
          kind: "state",
          title: "The destination opens and the rail puts itself away",
          detail: "The owner's call (2026-09-25): once a place is chosen, the labels are only taking width from the pane that just opened.",
          code: "const go = (navigate) => () => { navigate(); if (s.navOpen) a.toggleNav() }",
        },
        {
          kind: "motion",
          title: "The rail narrows and the pill lands on Meetings",
          detail: "The width eases back to 64px while the pill slides from Channels to Meetings. The labels leave at once rather than squeezing.",
        },
        {
          kind: "result",
          title: "Meetings this week, at full width",
          detail: "The rail is a column of icons again, with Meetings current. Hovering a row shows its name.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {},
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          props: {},
        },
        {
          step: 2,
          press: "Expand the sidebar",
          hold: 900,
          props: {},
        },
        {
          step: 5,
          hold: 1600,
          props: {
            expanded: true,
          },
        },
        {
          step: 6,
          press: "Meetings",
          hold: 900,
          props: {
            expanded: true,
          },
        },
        {
          step: 8,
          hold: 1800,
          props: {
            active: "meetings",
          },
        },
      ],
    },
    {
      id: "drill-into-a-destination",
      title: "Variant 2: open the Inbox's folders in the rail, and come back",
      description: "The drill-in rail is one level deep at a time. A destination with sections takes the logo's place and lists them; the tile, the Main menu chip or Esc go back. New in this spec: no app draws it yet, so no step names today's code.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "Where you are, and how deep",
          detail: "Three values from the app: the destination (active), whether the rail shows the destinations or its sections (level), and the section open inside it. On the web all three are the route, /inbox/drafts.",
          code: "<NavRail variant=\"drill-in\" active={dest} level={level} section={section} />",
        },
        {
          kind: "trigger",
          title: "Inbox is pressed",
          detail: "A click, or Enter on the focused row. Expanded, a chevron on hover says the row opens its sections.",
        },
        {
          kind: "event",
          title: "onActiveChange, onLevelChange and onSectionChange fire",
          detail: "The rail reports the destination, that it now shows its sections, and the section that opens: the one last open in the Inbox, or its first.",
          code: "onActiveChange?.('inbox'); onLevelChange?.('sections'); onSectionChange?.('inbox')",
        },
        {
          kind: "state",
          title: "The app opens the Inbox on that folder",
          detail: "The same store write (or route push) as variant 1, plus the folder. Nothing is drawn over the rail.",
          code: "open({ dest: 'inbox', level: 'sections', section: 'inbox' })",
        },
        {
          kind: "motion",
          title: "The Inbox's icon takes the logo's place and its folders slide in",
          detail: "The coral tile pops in where the logo was and the folders slide in from the right. Expanded, the wordmark becomes Inbox and the workspace pill the Main menu chip. With Reduce Motion they swap in place.",
          enter: "slide-left",
        },
        {
          kind: "trigger",
          title: "Drafts is pressed",
          detail: "Any section row.",
        },
        {
          kind: "event",
          title: "onSectionChange('drafts') fires",
          detail: "The rail remembers it for the Inbox, so opening the Inbox again comes back to Drafts.",
          code: "onSectionChange?.('drafts')",
        },
        {
          kind: "result",
          title: "Drafts is open, the rail still inside the Inbox",
          detail: "The pill is on Drafts and the tile still says where you are.",
        },
        {
          kind: "trigger",
          title: "The Inbox tile is pressed, or Main menu, or Esc",
          detail: "The tile turns into a back arrow on hover or focus; its name is 'Inbox. Back to the main menu'.",
        },
        {
          kind: "event",
          title: "onLevelChange('menu') fires",
          detail: "Only the level changes: the Inbox stays the current destination.",
          code: "onLevelChange?.('menu')",
        },
        {
          kind: "motion",
          title: "The destinations slide back in from the left",
          detail: "The logo pops back and the destinations slide in from the left, the way you came. Focus moves to the Inbox row.",
          enter: "slide-right",
        },
        {
          kind: "result",
          title: "The destinations, with the Inbox current",
          detail: "The pill is on the Inbox. Pressing it again opens the folders on Drafts.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            variant: "drill-in",
            level: "menu",
            expanded: true,
          },
        },
        {
          step: 1,
          press: "Inbox, 390 unread",
          hold: 900,
          props: {
            variant: "drill-in",
            level: "menu",
            expanded: true,
          },
        },
        {
          step: 4,
          hold: 1600,
          props: {
            variant: "drill-in",
            expanded: true,
            active: "inbox",
            level: "sections",
            section: "inbox",
          },
        },
        {
          step: 5,
          press: "Drafts",
          hold: 900,
          props: {
            variant: "drill-in",
            expanded: true,
            active: "inbox",
            level: "sections",
            section: "inbox",
          },
        },
        {
          step: 7,
          hold: 1400,
          props: {
            variant: "drill-in",
            expanded: true,
            active: "inbox",
            level: "sections",
            section: "drafts",
          },
        },
        {
          step: 8,
          press: "Back to the main menu",
          hold: 900,
          props: {
            variant: "drill-in",
            expanded: true,
            active: "inbox",
            level: "sections",
            section: "drafts",
          },
        },
        {
          step: 10,
          hold: 1800,
          props: {
            variant: "drill-in",
            expanded: true,
            active: "inbox",
            level: "menu",
            section: "drafts",
          },
        },
      ],
    },
  ],
};

export default docs;
