import type { ComponentDocs } from "../../types";
import { WEB_TOP_BAR_ACTIONS, WEB_TOP_BAR_DOWNLOAD, WEB_TOP_BAR_HELP } from "../../samples";

const docs: ComponentDocs = {
  id: "web-top-bar",
  name: "Web top bar",
  category: "shell",
  level: "organism",
  status: "beta",
  description: "The strip across the top of AntFabric in a browser tab. Back, Forward and History drive the browser's own history, search opens the command palette, and on the right sit Help, a way into the desktop app, and the ⋯ app menu. No window controls and no drag region — the browser owns the frame.",
  props: {
    canGoBack: {
      type: "boolean",
      default: true,
      description: "False at the first in-app entry of this tab, even when the browser could go further back (to a sign-in page, say).",
    },
    canGoForward: {
      type: "boolean",
      default: false,
    },
    history: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Draws the Recent history button after Back and Forward.",
    },
    search: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Draws the search field in the middle (its magnifier alone while `compact`).",
    },
    searchPlaceholder: {
      type: "string",
      default: "",
      description: "The field's text. Empty uses the `searchPlaceholder` string (\"Search\"); a product says what it searches.",
    },
    searchKeys: {
      type: "string",
      default: "Mod+K",
      description: "The palette shortcut shown in the field. '/' is the fallback where the browser keeps Ctrl+K.",
    },
    compact: {
      type: "boolean",
      default: false,
      description: "Search collapses to its magnifier, a labelled action to its icon and Recent history leaves the bar. The bar does this itself below 768px wide, so it fits a phone-width window; `compact` forces it at any width.",
    },
    actions: {
      type: "array",
      default: [],
      sample: WEB_TOP_BAR_ACTIONS,
      description: "WebTopBarAction: IconActionItem and `showLabel`: { key, label, icon, badge?, disabled?, showLabel? }. Buttons before the ⋯ menu: an icon button, or a ghost button with its label while the bar is not `compact` when `showLabel` is on.",
    },
    workspace: {
      type: "string",
      default: "",
      sample: "GeekyAnts",
      description: "Names the banner and the ⋯ menu (\"GeekyAnts menu\"). Empty names the menu \"Menu\".",
    },
    menuOpen: {
      type: "boolean",
      default: false,
      description: "The ⋯ app menu is open (see app-menu-bar).",
    },
    sidebarExpanded: {
      type: "boolean",
      default: false,
      description: "The nav rail is open (248px with labels). The sidebar button before Back draws panel-left-close then, panel-left-open otherwise, and its name says which way it goes.",
    },
    menu: {
      type: "node",
      description: "What the ⋯ button opens, drawn under it while `menuOpen`. Leave it out when the app draws its own popover.",
    },
    trailing: {
      type: "node",
      description: "Transient status at the end of the bar, before the actions.",
    },
    onSidebarExpandedChange: {
      type: "event",
      args: "sidebarExpanded: boolean",
      changes: "sidebarExpanded",
      description: "The sidebar button was pressed, with the width it leaves the rail: pass it to NavRail as `expanded`.",
    },
    onBack: {
      type: "event",
    },
    onForward: {
      type: "event",
    },
    onHistory: {
      type: "event",
    },
    onSearch: {
      type: "event",
    },
    onAction: {
      type: "event",
      args: "action: WebTopBarAction",
      description: "An action button was pressed.",
    },
    onMenuOpenChange: {
      type: "event",
      args: "menuOpen: boolean",
      changes: "menuOpen",
      description: "⋯ was pressed, with `menuOpen` as it leaves it.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <header role=\"banner\">: IconButton for the sidebar button, Back / Forward / History, Help and ⋯; the search field is a <button> with a Kbd hint (an IconButton when compact); Button (ghost, sm) or IconButton for the desktop app. Inline styles over `t`, hover / press / focus from useInteraction, `menuOpen` and `sidebarExpanded` through useControllable. The app wires onBack / onForward to TanStack Router (router.history.back / forward, useCanGoBack).",
      import: "import { WebTopBar } from \"@antfabric-ui/react/shell\"",
      notes: [
        "Back and Forward ARE the browser's history — every in-app navigation is a router push, so the buttons, the browser's own arrows, a mouse's side buttons and a trackpad swipe all walk one stack and can never disagree.",
        "The app writes its own index into history.state on each push. Back is disabled at index 0 — the first in-app entry of the tab — so the in-app button never leaves the app, even when the browser's Back could return to the SSO page.",
        "History (the clock) lists the last 20 places visited in this tab and the ones the account visited on other devices, newest first; choosing one is a push, not a jump back. The desktop's ⌘Y for it is not bound on the web: it is Chrome's own History on macOS.",
        "The ⋯ menu is the app menu (app-menu-bar): Preferences, Keyboard shortcuts, Theme, the desktop app, Help, Sign out. Never Reload, Zoom or Quit.",
        "Pressing ⋯ toggles `menuOpen`, so the button holds its pressed look while the app menu is open.",
        "The sidebar button, first in the bar, opens and closes the nav rail: outside the rail, where shadcn's sidebar puts its trigger. onSidebarExpandedChange hands the app the width for NavRail's `expanded`, which it keeps in the same cookie as before.",
        "The search field is a button that opens the command palette, as on desktop. The hint shows Mod+K; on Windows and Linux its tooltip adds 'or /'.",
      ],
      keyboard: [
        {
          keys: "Mod+K",
          action: "Opens the command palette while the page has focus",
        },
        {
          keys: "/",
          action: "Opens the command palette when no text field has focus — the fallback where Ctrl+K stays with the browser",
        },
        {
          keys: "Alt+← / Alt+→ (Mod+[ / Mod+] on macOS)",
          action: "The browser's own Back / Forward; the app does not intercept them, and they walk the same stack as the buttons",
        },
        {
          keys: "Tab",
          action: "The sidebar button, Back, Forward, History, Search, Open in desktop app, Help, ⋯ — in that order, after the skip link",
        },
      ],
    },
    desktop: {
      status: "not-applicable",
      alternative: "title-bar. The desktop app draws its own window frame: traffic lights or window controls, a drag region, the ☰ menu on Windows and Linux, and the same Back / Forward / History / Search cluster.",
    },
    mobile: {
      status: "not-applicable",
      alternative: "mobile-header. In the native app each tab has a large-title header with the bell and your photo; pushed screens get a back chevron. A phone-sized browser is offered the mobile app instead of a squeezed web top bar.",
    },
  },
  a11y: {
    role: "banner",
    notes: [
      "The ⋯ button is a menu button: aria-haspopup=\"menu\" and aria-expanded follow `menuOpen`, with aria-controls on the menu while it is open. Escape closes the menu and returns focus to the button, and a press outside closes it.",
      "Back and Forward are natively disabled when there is nowhere to go, so they are announced as dimmed and leave the tab order. A 'Skip to conversation' link is the app's to draw before the bar; the bar draws none.",
      "The bar compacts itself below 768px wide (a labelled action becomes its icon, search its magnifier, Recent history leaves), so it does not scroll sideways at 320px.",
    ],
  },
  examples: [
    {
      name: "Default",
      width: 1100,
    },
    {
      name: "Mid-history",
      props: {
        canGoBack: true,
        canGoForward: true,
      },
      width: 1100,
    },
    {
      name: "Sidebar open",
      description: "The nav rail is expanded, so the sidebar button offers to collapse it.",
      props: {
        sidebarExpanded: true,
      },
      width: 1100,
    },
    {
      name: "No desktop app detected",
      props: {
        actions: [WEB_TOP_BAR_DOWNLOAD, WEB_TOP_BAR_HELP],
      },
      width: 1100,
    },
    {
      name: "App menu open",
      props: {
        menuOpen: true,
      },
      width: 1100,
    },
  ],
  matrix: [
    {
      prop: "desktopApp",
      cases: [
        { name: "open", props: { actions: WEB_TOP_BAR_ACTIONS } },
        { name: "download", props: { actions: [WEB_TOP_BAR_DOWNLOAD, WEB_TOP_BAR_HELP] } },
        { name: "none", props: { actions: [WEB_TOP_BAR_HELP] } },
      ],
    },
    {
      prop: "compact",
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "Browser Back versus in-app Back",
      platforms: ["web"],
      handling: "One stack: the in-app buttons call history.back() / forward(), so they and the browser's arrows always agree. The in-app Back stops at this tab's first AntFabric entry; the browser's Back can still leave. A deep link opened in a fresh tab starts with Back disabled.",
      example: {
        name: "Fresh tab from a link",
        props: {
          canGoBack: false,
          canGoForward: false,
        },
        width: 1100,
      },
    },
    {
      title: "Ctrl+K belongs to the browser on Windows and Linux",
      platforms: ["web"],
      handling: "Chrome, Edge and Firefox use Ctrl+K (and Ctrl+E) for the address-bar search. The page takes Ctrl+K while it has focus, but with focus in the address bar, or in Firefox with the search bar shown, the browser keeps it. '/' always works outside a text field, and the field's hint switches to '/' after Ctrl+K has failed to reach the page once.",
      example: {
        name: "Slash fallback",
        props: {
          searchKeys: "/",
        },
        width: 1100,
      },
    },
    {
      title: "Narrow window (under 768px)",
      platforms: ["web"],
      handling: "Search collapses to its magnifier and 'Open in desktop app' to its icon, each keeping its full name as tooltip and accessible label. Back, Forward and History never collapse. At 320 CSS px (400% zoom on a laptop, WCAG 1.4.10) the bar still fits without horizontal scroll.",
      example: {
        name: "Compact",
        props: {
          compact: true,
        },
        width: 560,
      },
    },
    {
      title: "Several AntFabric tabs open",
      platforms: ["web"],
      handling: "Each tab is the whole app with its own history. A BroadcastChannel elects one leader tab to play sounds, show browser notifications and own the favicon dot, so three tabs never ring three times; read state and drafts sync across tabs through it. Closing the leader hands the role on within a second.",
    },
    {
      title: "Desktop app not installed",
      platforms: ["web"],
      handling: "The antfabric:// link fails silently in Chrome and Edge, so if the tab still has focus 1.5 s after 'Open in desktop app', the bar swaps to 'Get the desktop app'. Safari shows an error sheet for an unknown scheme, so on Safari the bar shows 'Get the desktop app' until one open has succeeded. A successful open is remembered per browser.",
    },
    {
      title: "Background tab",
      platforms: ["web"],
      handling: "Nothing in the bar is live. Unread lives in the tab title, '(3) AntFabric', and the favicon dot (tab-badge), which is what a person sees from another tab.",
    },
    {
      title: "Offline",
      platforms: ["web"],
      handling: "Back and Forward still work for routes already loaded. Search opens the palette with recent places only and says 'You're offline. Showing recent places.' 'Open in desktop app' stays — the desktop app has its own offline cache.",
    },
    {
      title: "Touch laptop and keyboard-only",
      platforms: ["web"],
      handling: "pointer: coarse raises every icon button to 40px and the bar to 52px. Keyboard users get the skip link first and a visible focus ring on every control; F6 is the browser's (address bar) and is never bound by the page.",
    },
  ],
  related: ["title-bar", "app-menu-bar", "nav-rail", "command-palette", "tab-badge", "mobile-header"],
  flows: [
    {
      id: "back-through-history",
      title: "Back walks the browser's own history",
      description: "There is one history stack, the browser's. The bar's Back and Forward, the browser's arrows, a mouse's side buttons and a trackpad swipe all walk it, so they can never disagree.",
      platforms: ["web"],
      width: 1100,
      steps: [
        {
          kind: "data",
          title: "Back's state comes from the router",
          detail: "Every in-app navigation is a TanStack Router push that writes the app's own index into history.state. Back is disabled at this tab's first AntFabric entry, even when the browser could go further back, to the sign-in page.",
          code: "const canGoBack = useCanGoBack()",
        },
        {
          kind: "trigger",
          title: "Back is clicked",
          detail: "In #platform-eng, having come from the Inbox. Alt+← (⌘[ on macOS) is the browser's own Back; the page doesn't intercept it, and it walks the same stack.",
        },
        {
          kind: "event",
          title: "onBack fires",
          code: "onBack?.()",
        },
        {
          kind: "effect",
          title: "The router steps back one entry",
          detail: "The previous route renders from TanStack Query's cache when it's fresh; nothing is refetched just because you went back.",
          code: "router.history.back()",
        },
        {
          kind: "motion",
          title: "Forward lights up",
          detail: "Nothing slides: the page swaps in place and Forward's disabled dimming fades out. It is aria-disabled rather than removed, so the bar's layout and tab order never shift.",
        },
        {
          kind: "result",
          title: "The Inbox again, scrolled where you left it",
          detail: "The router restores the scroll position it saved for that entry. Forward returns to #platform-eng; going somewhere new drops it.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            canGoBack: true,
            canGoForward: false,
          },
        },
        {
          step: 1,
          press: "Back",
          hold: 900,
          props: {
            canGoBack: true,
            canGoForward: false,
          },
        },
        {
          step: 4,
          hold: 1700,
          props: {
            canGoBack: true,
            canGoForward: true,
          },
        },
      ],
    },
    {
      id: "open-the-app-menu",
      title: "The ⋯ opens the app menu",
      description: "The browser owns Reload, Zoom and Quit, so the app's own commands that make sense in a tab live behind one ⋯ at the right of the bar.",
      platforms: ["web"],
      width: 1100,
      steps: [
        {
          kind: "data",
          title: "The workspace comes from the route context",
          detail: "A tab is signed into the workspace in its address, geekyants.antfabric.ai, so the root route's context names it and the ⋯ is called 'GeekyAnts menu'.",
          code: "const { workspace } = Route.useRouteContext()",
        },
        {
          kind: "trigger",
          title: "⋯ is clicked",
          detail: "Or Enter or Space with it focused; it is last in the bar's tab order.",
        },
        {
          kind: "event",
          title: "onMenuOpenChange(true) fires",
          code: "onMenuOpenChange?.(true)",
        },
        {
          kind: "state",
          title: "menuOpen holds the ⋯ down",
          detail: "While the menu is open the ⋯ keeps its pressed look, so it is clear what the panel hangs from.",
          code: "<Menu.Root open={menuOpen} onOpenChange={setMenuOpen}>",
        },
        {
          kind: "motion",
          title: "The menu pops in under the ⋯",
          detail: "Base UI's Menu.Popup, anchored to the ⋯'s right edge. Focus moves to the first row; Escape or a click outside closes it and focus returns to the ⋯.",
          enter: "pop",
        },
        {
          kind: "result",
          title: "Only what makes sense in a tab",
          detail: "Preferences, Keyboard shortcuts, Theme, the desktop app, Help and Sign out. No Reload, Zoom or Quit: the browser's own shortcuts reach the browser first.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 1100,
              minHeight: 440,
            },
            children: [
              {
                el: "component",
                use: "web-top-bar",
                props: {},
              },
            ],
          },
        },
        {
          step: 1,
          press: "GeekyAnts menu",
          hold: 900,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 1100,
              minHeight: 440,
            },
            children: [
              {
                el: "component",
                use: "web-top-bar",
                props: {},
              },
            ],
          },
        },
        {
          step: 4,
          hold: 2000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 1100,
              minHeight: 440,
            },
            children: [
              {
                el: "component",
                use: "web-top-bar",
                props: {
                  menuOpen: true,
                },
              },
              {
                el: "component",
                use: "menu",
                style: {
                  position: "absolute",
                  top: 46,
                  right: 8,
                },
                props: {
                  label: "GeekyAnts menu",
                  width: 264,
                  items: [
                    {
                      label: "Preferences",
                      icon: "settings",
                      shortcut: "Mod+,",
                    },
                    {
                      label: "Keyboard shortcuts",
                      icon: "keyboard",
                      shortcut: "Mod+/",
                    },
                    {
                      label: "Theme",
                      icon: "sun-moon",
                      count: "System",
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Open in desktop app",
                      icon: "square-arrow-out-up-right",
                    },
                    {
                      label: "Download the desktop app",
                      icon: "monitor-down",
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Help",
                      icon: "life-buoy",
                    },
                    {
                      label: "Report a problem…",
                      icon: "bug",
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Sign out of GeekyAnts",
                      icon: "log-out",
                    },
                  ],
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
