import type { ComponentDocs } from "../../types";
import { WORKSPACES } from "../../samples";

const docs: ComponentDocs = {
  id: "workspace-switcher",
  name: "Workspace switcher",
  category: "shell",
  level: "organism",
  status: "draft",
  description: "Slack's way between organisations: one tile per workspace, each with its own unread count, ⌘1 to ⌘9 to jump, and a + to add another. On desktop the tiles stack in the rail; in a browser each workspace lives at its own address, so it is a menu of links; on a phone it is a sheet from the header photo.",
  props: {
    workspaces: {
      type: "array",
      default: [],
      sample: WORKSPACES,
      description: "Every workspace this device has signed into, in the person's own order: { key, name, host, identity?, current?, mentions?, activity?, signedIn?, src? }. Empty draws only the add tile (the web menu: its title and the add row). mentions is coral; activity is new messages that nobody asked you about.",
    },
    current: {
      type: "string",
      default: "",
      description: "The key of the workspace this window is in. Empty falls back to each workspace's own `current`; pressing a signed-in workspace sets it (a signed-out one starts sign-in instead and changes nothing here). Given with onCurrentChange it is controlled: the app confirms the switch, then passes the new key.",
    },
    showShortcuts: {
      type: "boolean",
      default: false,
      platforms: ["desktop"],
      description: "Holding ⌘ (Ctrl) for 400 ms labels each tile with its ⌘1–⌘9.",
    },
    addLabel: {
      type: "string",
      default: "",
      description: "The add tile's (desktop and phone) or add row's (web) name. Empty uses the `add` string on desktop and the phone (\"Add a workspace\") and `addMenu` on the web (\"Sign in to another workspace\").",
    },
    onCurrentChange: {
      type: "event",
      args: "current: string",
      changes: "current",
      description: "A workspace was chosen, signed in or not: its key, so the app can look up the workspace (host included) and sign in there. A signed-out workspace fires it too and leaves `current` where it was. In a browser a plain click is the app's to navigate; ⌘-click and middle-click follow the row's link into a new tab without firing it.",
    },
    onAdd: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "planned",
      base: "A <div role=\"menu\"> that pops in (enter(\"pop\")): each workspace an <a href> (role=\"menuitemradio\") to its own origin with a square Avatar, then a 'Sign in to another workspace' <button role=\"menuitem\">; inline styles over `t`, hover and focus from useInteraction. In the app it opens from the rail's workspace pill inside the menu primitive, which owns opening, Esc and arrow keys.",
      import: "import { WorkspaceSwitcher } from \"@antfabric/ui-react/shell\"",
      notes: [
        "DECISION: one workspace per tab, switched from a menu — not a tile column. Every workspace is its own instance at its own origin (<org>.antfabric.ai, ADR-5552), with its own session cookie, so a tab can only ever be signed into the workspace in its address bar.",
        "Choosing a workspace navigates this tab there; ⌘-click or middle-click opens it in a new tab, which is how a person keeps two workspaces open in a browser.",
        "No unread counts for other workspaces: the page cannot read another origin's session or counts, and BroadcastChannel is same-origin only. A badge that could only ever say 0 would be a lie, so rows carry names and addresses only.",
        "No ⌘1–⌘9: in every browser those switch tabs. The list comes from this browser's history of sign-ins, kept on the account server once the account is linked, otherwise in localStorage.",
      ],
      keyboard: [
        {
          keys: "↑ / ↓",
          action: "Moves between workspaces",
        },
        {
          keys: "Enter",
          action: "Goes to that workspace in this tab",
        },
        {
          keys: "Mod+Enter",
          action: "Opens that workspace in a new tab",
        },
        {
          keys: "Esc",
          action: "Closes the menu",
        },
      ],
    },
    desktop: {
      status: "partial",
      base: "A role=\"list\" column, the rail's 64px width: each tile a <button> (title tooltip, aria-current, aria-keyshortcuts) around a square Avatar with a Badge for mentions, the left bar for current / activity, and a Kbd under it while ⌘ is held; a dashed + <button> to add one. Inline styles over `t`, hover / press / focus from useInteraction, `current` kept by the component unless the app controls it. The app confirms a switch with its ConfirmDialog.",
      import: "import { WorkspaceSwitcher } from \"@antfabric/ui-react/shell\"",
      notes: [
        "Today (desktop-onboarding, ADR-5553): the rail's workspace pill opens a menu — 'Workspaces', every one this device has used with the current one ticked, then 'Sign in to another workspace'. The profile menu carries 'Switch workspace' for the collapsed rail.",
        "This spec moves it to Slack's tile column, shown once two or more workspaces are signed in. With one, the rail keeps the pill.",
        "⚠️ Only ONE workspace is signed in at a time today: session, shell snapshot, chat history, message cache and avatars are one slot each on the device. A switch is confirmed — 'Switch to Northwind Health?' / 'You'll be signed out of GeekyAnts on this device, then asked to sign in to Northwind Health.' — signs out, awaited, then reloads. Per-tile unread needs those stores keyed per origin (ADR-5553's follow-up); until then, other tiles show signed out with no count.",
        "The Dock / taskbar badge sums every signed-in workspace; an OS notification names its workspace in the title.",
        "Pressing a signed-in tile sets `current`: the ring moves to it and its left bar grows from 8 to 20px. A signed-out tile changes nothing here — it starts sign-in.",
      ],
      keyboard: [
        {
          keys: "Mod+1 … Mod+9",
          action: "Switches to the workspace in that position",
        },
        {
          keys: "Mod+Shift+[ / Mod+Shift+]",
          action: "Previous / next workspace",
        },
        {
          keys: "↑ / ↓",
          action: "Moves between tiles when the column has focus",
        },
      ],
    },
    mobile: {
      status: "planned",
      base: "The sheet's panel as a View that slides up (<Enter motion=\"slide-up\">, accessibilityViewIsModal): a grabber, the title, and a Pressable row per workspace with a square Avatar, Badge (count or neutral dot) and a tick that pops in; StyleSheet over useTheme(), fonts by file, press from usePress. In the app it sits in the sheet host opened by long-pressing the header photo, which owns the scrim and the drag to dismiss.",
      import: "import { WorkspaceSwitcher } from \"@antfabric/ui-react-native/shell\"",
      notes: [
        "The photo in the main header opens Settings on a tap (ADR-9419); a long-press, or 'Switch workspace' at the top of Settings, opens this sheet. With one workspace the sheet is never offered from the long-press.",
        "Rows are 64pt with a 40pt tile; current is ticked, others carry their mention count once multi-sign-in exists.",
        "Push notifications are per workspace: tapping one from a workspace you are not in switches to it first, with a 'Switched to Northwind Health' toast.",
        "The sheet slides up; tapping a signed-in row sets `current` and the tick pops onto it.",
      ],
      gestures: [
        {
          gesture: "Long press header photo",
          action: "Opens the sheet",
        },
        {
          gesture: "Tap row",
          action: "Switches (with the confirm while one-at-a-time)",
        },
        {
          gesture: "Drag sheet down",
          action: "Dismisses",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "Each tile's name says everything a sighted person reads off it: 'Northwind Health, 3 mentions, Command 2'.",
      "The current tile has aria-current; the black ring and the left bar are never the only signal.",
      "Signed-out tiles stay focusable and say 'signed out' — choosing one starts sign-in.",
      "Web: a role=menu named by its 'Workspaces' heading (which sits outside the menu) holding menuitemradio links, the current one checked, and the add row. The menu is one tab stop (the current row); Up, Down, Home, End and typing a letter move between rows. Truncated names and hosts are in each row's tooltip.",
      "Phone: a sheet (accessibilityViewIsModal) of buttons with the current one selected.",
    ],
  },
  examples: [
    {
      name: "Desktop column",
      platforms: ["desktop"],
    },
    {
      name: "Holding ⌘",
      props: {
        showShortcuts: true,
      },
      platforms: ["desktop"],
    },
    {
      name: "Web menu",
      platforms: ["web"],
    },
    {
      name: "Phone sheet",
      platforms: ["mobile"],
      width: 393,
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "Only one workspace signed in at a time (today)",
      platforms: ["desktop"],
      handling: "Until per-origin stores land, only the current tile is live; every other tile is drawn signed out, without a count, and choosing it runs the confirm-sign-out-reload switch. The design is ready for counts; the data is not.",
      example: {
        name: "Today's one-slot device",
        props: {
          workspaces: [
            {
              key: "geekyants",
              name: "GeekyAnts",
              host: "geekyants.antfabric.ai",
              identity: "red",
              current: true,
              signedIn: true,
            },
            {
              key: "northwind",
              name: "Northwind Health",
              host: "northwind.antfabric.ai",
              identity: "indigo",
              signedIn: false,
            },
            {
              key: "lumen",
              name: "Lumen Studio",
              host: "lumen.antfabric.ai",
              identity: "green",
              signedIn: false,
            },
          ],
        },
        platforms: ["desktop"],
      },
    },
    {
      title: "Two workspaces with the same initials",
      platforms: ["web", "desktop", "mobile"],
      handling: "Northwind Health and Nimbus Hub both read 'NH'. Tiles take the workspace's uploaded icon when there is one and otherwise differ by identity colour; the tooltip and the accessible name always carry the full name.",
      example: {
        name: "Same initials",
        props: {
          workspaces: [
            {
              key: "northwind",
              name: "Northwind Health",
              host: "northwind.antfabric.ai",
              identity: "indigo",
              current: true,
              signedIn: true,
            },
            {
              key: "nimbus",
              name: "Nimbus Hub",
              host: "nimbus.antfabric.ai",
              identity: "green",
              mentions: 12,
              signedIn: true,
            },
          ],
        },
      },
    },
    {
      title: "More than nine",
      platforms: ["desktop", "mobile"],
      handling: "⌘1–⌘9 cover the first nine in the person's order; the tenth onward have no chord. The column scrolls inside the rail above the destinations, and tiles reorder by drag or by 'Move up / Move down' in the tile's context menu.",
    },
    {
      title: "Switching mid-task",
      platforms: ["desktop", "mobile"],
      handling: "A switch is refused while a recording is running ('Stop the recording first — it belongs to GeekyAnts') and waits for uploads in flight. Drafts survive, as they survive sign-out today; they hold server ids that simply match nothing in another instance.",
    },
    {
      title: "A mention in another workspace while hidden in the tray",
      platforms: ["desktop"],
      handling: "With multi-sign-in, the Dock / taskbar badge counts all workspaces and the notification says 'Northwind Health · #triage'. Clicking it switches and opens the message; with one-at-a-time, it asks to switch first.",
    },
    {
      title: "SSO expired in one workspace",
      platforms: ["web", "desktop", "mobile"],
      handling: "That tile is drawn signed out and its name gains ', sign in again'; the others keep working. Nothing pops up until the person chooses it.",
    },
    {
      title: "Offline",
      platforms: ["desktop", "mobile"],
      handling: "Switching needs the network (sign-in, the new instance's data), so tiles other than the current one are disabled with the tooltip 'You're offline — switch when you're back online'. The current workspace keeps working from its cache.",
    },
    {
      title: "Text at 130% on a phone",
      platforms: ["mobile"],
      handling: "Rows grow past 64pt; names and hosts truncate on one line each, and the sheet scrolls once it reaches 90% of the screen.",
      example: {
        name: "Phone, signed-out row",
        props: {
          workspaces: [
            {
              key: "geekyants",
              name: "GeekyAnts",
              host: "geekyants.antfabric.ai",
              identity: "red",
              current: true,
              signedIn: true,
            },
            {
              key: "kestrel",
              name: "Kestrel Labs",
              host: "kestrel.antfabric.ai",
              identity: "ochre",
              signedIn: false,
            },
          ],
        },
        platforms: ["mobile"],
        width: 393,
      },
    },
  ],
  related: ["nav-rail", "mobile-header", "confirm-dialog", "app-icon-badge"],
  flows: [
    {
      id: "switch-workspace",
      title: "Switch to Northwind Health",
      description: "Choosing a workspace hands it to the app, which signs in there. While a device holds one session at a time, the desktop and the phone confirm first, because switching signs you out of the workspace you're in.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "Today the rail names one workspace",
          detail: "The desktop is built for one backend (ADR-6070) and the rail's pill is a static GeekyAnts badge. A rail menu listing every workspace used on the device was built in September (6d119f5c9) and removed a day later. This spec brings switching back as tiles once two workspaces are signed in.",
          code: "const WORKSPACE = 'GeekyAnts'",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The list is this browser's sign-ins",
          detail: "Each workspace is its own origin with its own session cookie, so the list comes from the account's sign-in history, or localStorage before the account is linked. No counts: a page can't read another origin's.",
          code: "const { data: workspaces } = useQuery(knownWorkspacesQuery)",
          platforms: ["web"],
        },
        {
          kind: "data",
          title: "Not built yet: the phone signs into one workspace",
          detail: "There is no list on the phone today. The sheet would open from a long-press on the header photo, or from Switch workspace at the top of Settings, and only once a second workspace is signed in.",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "Northwind Health is chosen",
          detail: "A tile or ⌘2 on the desktop, a row in the sheet on the phone, a menu row in the browser. A signed-out workspace starts its sign-in instead.",
        },
        {
          kind: "event",
          title: "onCurrentChange(key) fires",
          detail: "The key of the workspace comes back, so the app finds it in its own list, host included, and signs in there.",
          code: "onCurrentChange?.(\"northwind\")  // workspaces.find((w) => w.key === \"northwind\") → { host: \"northwind.antfabric.ai\", … }",
        },
        {
          kind: "state",
          title: "The switch is confirmed first",
          detail: "One session per device: switching signs you out of GeekyAnts here, and the confirm says so. This is the copy the removed September build used (askSwitchWorkspace).",
          code: "{ title: 'Switch to Northwind Health?', body: 'You’ll be signed out of GeekyAnts on this device, then asked to sign in to Northwind Health.', cta: 'Switch' }",
          platforms: ["desktop", "mobile"],
        },
        {
          kind: "motion",
          title: "The confirm pops in over the window",
          detail: "The app's one confirm dialog: the scrim fades and the card pops from the centre, with focus trapped inside.",
          enter: "pop",
          platforms: ["desktop"],
        },
        {
          kind: "motion",
          title: "The confirm sheet slides up",
          detail: "Within thumb reach, over the workspace sheet. A swipe down or a tap on the scrim cancels.",
          enter: "slide-up",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "Switch is pressed",
          detail: "A recording in progress refuses the switch instead: 'Stop the recording first — it belongs to GeekyAnts'.",
          platforms: ["desktop", "mobile"],
        },
        {
          kind: "effect",
          title: "Sign out, then Northwind Health's sign-in",
          detail: "The sign-out is awaited: the session, message cache and avatars are one slot each, so GeekyAnts' data must be gone before Northwind Health's loads. The desktop then reloads onto the new sign-in; the phone returns to its sign-in screen.",
          code: "await signOut(); saveWorkspace(apiUrl); window.location.reload()",
          platforms: ["desktop", "mobile"],
        },
        {
          kind: "effect",
          title: "The tab goes to northwind.antfabric.ai",
          detail: "A plain navigation, because the row is a link. ⌘-click opens it in a new tab, which is how a person keeps two workspaces open in a browser.",
          code: "<a href=\"https://northwind.antfabric.ai\">",
          platforms: ["web"],
        },
        {
          kind: "result",
          title: "Northwind Health is the current workspace",
          detail: "After signing in, its tile carries the ring and the 20px bar, or its row the tick. Drafts in GeekyAnts survive the switch, as they survive a sign-out.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              direction: "row",
              width: 560,
              minHeight: 420,
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {},
              },
            ],
          },
        },
        {
          step: 3,
          press: 1,
          hold: 900,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              direction: "row",
              width: 560,
              minHeight: 420,
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {},
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1700,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              direction: "row",
              width: 560,
              minHeight: 420,
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {},
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Switch to Northwind Health?",
                  body: "You’ll be signed out of GeekyAnts on this device, then asked to sign in to Northwind Health.",
                  icon: "arrow-left-right",
                  tone: "primary",
                  confirmLabel: "Switch",
                },
              },
            ],
          },
        },
        {
          step: 8,
          press: "Switch",
          hold: 1000,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              direction: "row",
              width: 560,
              minHeight: 420,
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {},
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Switch to Northwind Health?",
                  body: "You’ll be signed out of GeekyAnts on this device, then asked to sign in to Northwind Health.",
                  icon: "arrow-left-right",
                  tone: "primary",
                  confirmLabel: "Switch",
                },
              },
            ],
          },
        },
        {
          step: 11,
          hold: 1800,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              direction: "row",
              width: 560,
              minHeight: 420,
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {
                  current: "northwind",
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1400,
          platforms: ["web"],
          props: {},
        },
        {
          step: 3,
          press: 1,
          hold: 900,
          platforms: ["web"],
          props: {},
        },
        {
          step: 11,
          hold: 1800,
          platforms: ["web"],
          props: {
            current: "northwind",
          },
        },
        {
          step: 2,
          hold: 1400,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
              minHeight: 600,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {},
              },
            ],
          },
        },
        {
          step: 3,
          press: 1,
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
              minHeight: 600,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {},
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
              minHeight: 600,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {},
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                  width: "100%",
                },
                props: {
                  title: "Switch to Northwind Health?",
                  body: "You’ll be signed out of GeekyAnts on this phone, then asked to sign in to Northwind Health.",
                  icon: "arrow-left-right",
                  tone: "primary",
                  confirmLabel: "Switch",
                },
              },
            ],
          },
        },
        {
          step: 8,
          press: "Switch",
          hold: 1000,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
              minHeight: 600,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {},
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                  width: "100%",
                },
                props: {
                  title: "Switch to Northwind Health?",
                  body: "You’ll be signed out of GeekyAnts on this phone, then asked to sign in to Northwind Health.",
                  icon: "arrow-left-right",
                  tone: "primary",
                  confirmLabel: "Switch",
                },
              },
            ],
          },
        },
        {
          step: 11,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
              minHeight: 600,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "workspace-switcher",
                props: {
                  current: "northwind",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
