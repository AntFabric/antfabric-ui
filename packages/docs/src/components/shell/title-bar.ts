import type { ComponentDocs } from "../../types";
import { TITLE_BAR_ACTIONS } from "../../samples";

const docs: ComponentDocs = {
  id: "title-bar",
  name: "Title bar",
  category: "shell",
  level: "organism",
  status: "beta",
  description: "The desktop window's top strip, drawn by the app rather than the OS. macOS floats the traffic lights over it; Windows and Linux get a ☰ application menu on the left and their own window controls on the right. In between: visible Back / Forward / History buttons and a search field that opens the command palette.",
  props: {
    canGoBack: {
      type: "boolean",
      default: true,
      description: "False at the first place visited this session. The history is in memory and starts empty on every launch.",
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
      description: "Draws the search field in the middle.",
    },
    searchPlaceholder: {
      type: "string",
      default: "",
      description: "The field's text. Empty uses the `searchPlaceholder` string (\"Search\"); a product says what it searches.",
    },
    searchKeys: {
      type: "string",
      default: "Mod+K",
      description: "The palette shortcut, drawn per OS: ⌘K on macOS, Ctrl+K on Windows and Linux.",
    },
    fullscreen: {
      type: "boolean",
      default: false,
      description: "macOS full screen. The system hides the traffic lights, so the 96px inset drops back to 16.",
    },
    maximized: {
      type: "boolean",
      default: false,
      description: "Windows and Linux. The maximise glyph becomes restore.",
    },
    focused: {
      type: "boolean",
      default: true,
      description: "False while another app's window is in front. macOS greys the traffic lights; Windows and Linux dim the caption glyphs.",
    },
    menuOpen: {
      type: "boolean",
      default: false,
      description: "Windows and Linux: the ☰ application menu is open (see app-menu-bar).",
    },
    sidebarExpanded: {
      type: "boolean",
      default: false,
      description: "The nav rail is open (248px with labels). The sidebar button before Back draws panel-left-close then, panel-left-open otherwise, and its name says which way it goes.",
    },
    actions: {
      type: "array",
      default: [],
      sample: TITLE_BAR_ACTIONS,
      description: "IconActionItem: { key, label, icon, badge?, disabled? }. Icon buttons before the window controls, after `trailing`; `label` is the accessible name.",
    },
    trailing: {
      type: "node",
      default: "",
      description: "Transient status before the actions — the recording indicator while the microphone is live. Empty the rest of the time.",
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
      description: "The search field was pressed: open the command palette.",
    },
    onMenuOpenChange: {
      type: "event",
      args: "menuOpen: boolean",
      changes: "menuOpen",
      description: "Windows and Linux: ☰ was pressed, with `menuOpen` as it leaves it.",
    },
    onAction: {
      type: "event",
      args: "action: IconActionItem",
      description: "An action button was pressed.",
    },
    onMinimize: {
      type: "event",
      description: "Windows and Linux caption button. macOS draws its own traffic lights.",
    },
    onMaximize: {
      type: "event",
      description: "Windows and Linux: Maximise, or Restore when `maximized`.",
    },
    onClose: {
      type: "event",
      description: "Windows and Linux: Close, which hides the window to the tray (ADR-0379).",
    },
  },
  platforms: {
    web: {
      status: "not-applicable",
      alternative: "web-top-bar. In a browser the browser owns the window frame, the tabs and its own Back / Forward; the page draws a 44px top bar inside the viewport instead, with no window controls and no drag region.",
    },
    desktop: {
      status: "partial",
      base: "A <div role=\"banner\"> whose empty strips carry data-tauri-drag-region, for Tauri 2's window chrome (macOS: titleBarStyle \"Overlay\", trafficLightPosition {x:16, y:24}; Windows/Linux: decorations false + shadow true). IconButton for ☰, the sidebar button, Back / Forward / History and Help; the search field is a <button> with a Kbd hint; the macOS lights are drawn in place (aria-hidden), Windows' caption buttons and GNOME's round ones are <button tabIndex=-1>. Inline styles over `t`, hover / press / focus from useInteraction, `menuOpen` and `sidebarExpanded` through useControllable; on macOS 26 the bar goes transparent and the sidebar button, history and search become glass() capsules.",
      import: "import { TitleBar } from \"@antfabric-ui/react/shell\"",
      notes: [
        "Today: macOS overlays the traffic lights on the breadcrumb row with a 96px left inset (TRAFFIC_LIGHT_INSET, ADR-5322) and Windows/Linux keep the native title bar and native menu bar. The ☰ button, the custom Windows/Linux bar and the visible Back / Forward / History buttons are new in this spec — today history is only ⌘[ / ⌘] (ADR-6130) with nothing on screen.",
        "The 96px inset follows trafficLightPosition.x (16) plus three 12px buttons 20px apart. Change tauri.conf.json, tauri.staging.conf.json and this inset together.",
        "Every empty pixel of the bar carries data-tauri-drag-region; every control does not, so a click on a button is never a drag. Double-click on empty bar zooms (macOS, per System Settings › Desktop & Dock › 'Double-click a window's title bar to') or maximises (Windows, Linux).",
        "The search field is a button that opens the command palette (a modal search over people, channels and projects), not an input — the same decision NavRail's SearchControl records.",
        "Windows: decorations false loses the Windows 11 Snap Layouts flyout on the maximise button. Ship it with the tauri-plugin-decorum hit-test (HTMAXBUTTON) or accept the gap; Win+Z still opens Snap Layouts. shadow: true keeps the 1px border, drop shadow and resize edges.",
        "Linux: controls follow GNOME's org.gnome.desktop.wm.preferences button-layout — stock GNOME draws only Close, Ubuntu draws all three, and a layout like 'close,minimize,maximize:' puts them on the left. Tiling compositors (Sway, Hyprland, i3) get no controls at all.",
        "Window controls are not tab stops on Windows, matching the native caption buttons; Alt+Space opens the system window menu instead.",
        "Windows and Linux: pressing ☰ toggles `menuOpen`, so the button holds its pressed look while the application menu (app-menu-bar) is open.",
        "The sidebar button opens and closes the nav rail. It sits after the traffic lights (or ☰) and before Back, outside the rail, where shadcn's sidebar puts its trigger and macOS apps put theirs; the rail holds only navigation. onSidebarExpandedChange hands the app the width for NavRail's `expanded`. Today's desktop draws this button under the rail's lockup (NavRail.tsx); this spec moves it here.",
        "In a narrow window the two sides keep their controls (the lights or ☰, the sidebar button and history; Help and the window controls) and the search field narrows first, down to its minimum.",
        "macOS 26+ (Tahoe): the toolbar has no bar of its own — the history arrows and the search field float as Liquid Glass capsules over the content, as Tahoe's own apps do. Built with Tauri's macOS window effects; if the platform can't draw glass, it falls back to the macOS 15 look. Windows and Linux are unchanged.",
      ],
      keyboard: [
        {
          keys: "Mod+[",
          action: "Back, to where you just were (the Back button)",
        },
        {
          keys: "Mod+]",
          action: "Forward again",
        },
        {
          keys: "Mod+K",
          action: "Opens the command palette (the search field)",
        },
        {
          keys: "Alt / F10",
          action: "Windows and Linux: opens the ☰ application menu with File highlighted",
        },
        {
          keys: "Alt+Space",
          action: "Windows: the system window menu (Restore, Move, Size, Minimise, Maximise, Close)",
        },
        {
          keys: "Ctrl+Mod+F",
          action: "macOS: enters or leaves full screen; the traffic lights hide and the inset collapses",
        },
        {
          keys: "F6",
          action: "Moves focus between the title bar, the rail, the sidebar and the conversation",
        },
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "mobile-header. A phone has no window: the status bar and safe area belong to the OS, Back is the header's chevron or the system back gesture, and search is a field on each tab screen.",
    },
  },
  a11y: {
    role: "banner",
    notes: [
      "Back and Forward are real buttons that are natively disabled when there is nowhere to go: they are announced as dimmed and leave the tab order, and the bar's layout does not shift.",
      "The Windows and Linux ☰ is a menu button (aria-haspopup=\"menu\", aria-expanded follows `menuOpen`). The menu itself is the app's (AppMenuBar) and keeps its own keys and focus.",
      "The traffic lights are drawn by macOS and are hidden from the page's accessibility tree; VoiceOver reaches them as the window's own close / minimise / zoom buttons. Windows and Linux caption buttons are not tab stops, as the native ones are not.",
      "The search button says what it opens: 'Search people, channels and projects', with the shortcut in its tooltip.",
      "The search field is centred in the window however wide the controls on either side are; the sides are never narrower than their controls, so in a narrow window the field gives way first.",
    ],
  },
  examples: [
    {
      name: "macOS",
      os: "mac",
      platforms: ["desktop"],
      width: 1100,
    },
    {
      name: "Windows",
      os: "windows",
      platforms: ["desktop"],
      width: 1100,
    },
    {
      name: "Linux (GNOME)",
      os: "linux",
      platforms: ["desktop"],
      width: 1100,
    },
    {
      name: "Windows, ☰ open",
      props: {
        menuOpen: true,
      },
      os: "windows",
      platforms: ["desktop"],
      width: 1100,
    },
    {
      name: "Sidebar open",
      description: "The nav rail is expanded, so the sidebar button offers to collapse it.",
      props: {
        sidebarExpanded: true,
      },
      platforms: ["desktop"],
      width: 1100,
    },
    {
      name: "Back and Forward both available",
      props: {
        canGoBack: true,
        canGoForward: true,
      },
      platforms: ["desktop"],
      width: 1100,
    },
    {
      name: "While recording",
      props: {
        trailing: "RecordingIndicator — ● Recording · 00:12:47 · Pause · Stop",
      },
      platforms: ["desktop"],
      width: 1100,
    },
  ],
  matrix: [
    {
      prop: "focused",
    },
    {
      prop: "maximized",
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "macOS full screen",
      platforms: ["desktop"],
      handling: "The system hides the traffic lights in full screen, so the bar stops reserving 96px and returns to its 16px inset (useWindowFullscreen, read on mount and on every resize). Moving the pointer to the top edge reveals the macOS menu bar over the window; the bar does not move for it.",
      example: {
        name: "Full screen",
        props: {
          fullscreen: true,
        },
        os: "mac",
        width: 1100,
      },
    },
    {
      title: "Window in the background",
      platforms: ["desktop"],
      handling: "macOS greys the three lights while another app is frontmost; Windows and Linux dim the caption glyphs to 45%. The rest of the bar keeps its colours — dimming the search field would read as disabled.",
      example: {
        name: "Inactive",
        props: {
          focused: false,
        },
        os: "mac",
        width: 1100,
      },
    },
    {
      title: "Maximised on Windows",
      platforms: ["desktop"],
      handling: "The maximise square becomes the overlapping 'Restore down' squares. Double-clicking empty bar toggles it; dragging a maximised window down by the bar restores it under the pointer (Aero Snap), which data-tauri-drag-region gives for free.",
      example: {
        name: "Maximised",
        props: {
          maximized: true,
        },
        os: "windows",
        width: 1100,
      },
    },
    {
      title: "Nowhere to go back to",
      platforms: ["desktop"],
      handling: "After a launch the history is empty, so Back and Forward are both disabled. ⌘[ is still swallowed (preventDefault) so it can never navigate the webview out of the app. An open dialog suppresses history navigation — going back under a dialog would lose what someone was doing.",
      example: {
        name: "Fresh launch",
        props: {
          canGoBack: false,
          canGoForward: false,
        },
        width: 1100,
      },
    },
    {
      title: "Drag versus click",
      platforms: ["desktop"],
      handling: "Only the bar's empty space drags. A press that starts on a button and moves is a cancelled press, not a window drag. Double-clicking the search field opens the palette once and never maximises the window.",
      example: {
        name: "Hovering search",
        state: "hover",
        width: 1100,
      },
    },
    {
      title: "Right-to-left system language",
      platforms: ["desktop"],
      handling: "macOS moves the traffic lights to the top-right in Arabic and Hebrew, and Windows mirrors the caption buttons to the left. The inset follows the lights to whichever side they are on; Back points right and Forward points left.",
    },
    {
      title: "Narrow window or high zoom",
      platforms: ["desktop"],
      handling: "The window's minimum is 1180×720, but View › Zoom In to 175% leaves about 670 CSS pixels. Below 900 CSS px the search field collapses to its magnifier, and below 720 Help moves into the ☰ / app menu. History buttons never collapse — they are the only on-screen way back.",
    },
    {
      title: "Keyboard and screen reader",
      platforms: ["desktop"],
      handling: "Tab order: ☰ (Windows/Linux), Back, Forward, History, Search, Help. Window controls are skipped, as the native ones are. F6 moves between the title bar and the regions below it, so nobody has to tab through the rail to reach search.",
    },
    {
      title: "Hidden in the tray, then reopened",
      platforms: ["desktop"],
      handling: "Close hides the window (ADR-0379) and leaves full screen first (ADR-0811). Reopening from the tray or the Dock restores the same history, so Back still works after a hide; only Quit empties it.",
    },
    {
      title: "Liquid Glass and earlier macOS",
      platforms: ["desktop"],
      handling: "On macOS 26+ the title bar loses its fill and divider and the controls become glass capsules; on 15 and earlier it is today's solid chrome bar. macOS 26's own glass follows the Mac's settings by itself. Our title-bar capsules are drawn in the web view, so the Tauri shell reads NSWorkspace's accessibilityDisplayShouldReduceTransparency and accessibilityDisplayShouldIncreaseContrast, listens for the display-options-changed notification, and passes both to the page, which switches the capsules to the tinted, solid or high-contrast material (glass.tinted, glass.solid, shadow.glassContrast), live, as the setting changes (prefers-contrast is the fallback). Reduce Transparency makes the capsules frosted and nearly opaque; Increase Contrast adds an edge. macOS before 26 keeps today's solid bar.",
    },
  ],
  related: [
    "app-menu-bar",
    "web-top-bar",
    "nav-rail",
    "command-palette",
    "recording-indicator",
    "offline-bar",
  ],
  flows: [
    {
      id: "search-opens-palette",
      title: "The search field opens the command palette",
      description: "The field in the middle of the bar is a button, not an input. Clicking it or pressing ⌘K opens one palette over the window, searching people, channels and projects.",
      platforms: ["desktop"],
      width: 1100,
      steps: [
        {
          kind: "data",
          title: "The field shows the palette's chord for this OS",
          detail: "searchKeys is written once as Mod+K and drawn ⌘K on macOS, Ctrl+K on Windows and Linux. The field holds no query of its own. Today the same control sits at the top of the rail; this bar is new in this spec.",
        },
        {
          kind: "trigger",
          title: "The search field is clicked, or ⌘K pressed",
          detail: "Both land in the same place. The field is never a drag handle: only the bar's empty pixels move the window.",
        },
        {
          kind: "event",
          title: "onSearch fires",
          code: "onSearch?.()",
        },
        {
          kind: "state",
          title: "The store opens the palette, fresh",
          detail: "An empty query with the first row selected. The notifications popover, the history rail and the profile menu close, so only one thing floats at a time.",
          code: "set({ paletteOpen: true, paletteQuery: '', paletteIndex: 0, notifOpen: false, railOpen: false, profileOpen: false })",
        },
        {
          kind: "motion",
          title: "The scrim fades and the palette pops in under the bar",
          detail: "Focus goes to the query. Today's palette rises in instead (af-rise, 200ms); this spec moves it to the shared pop.",
          enter: "pop",
        },
        {
          kind: "result",
          title: "Recent places first, then people, channels and projects",
          detail: "Typing narrows the list. Enter opens the selected row; Escape closes the palette and focus returns to the field.",
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
              minHeight: 560,
            },
            children: [
              {
                el: "component",
                use: "title-bar",
                props: {},
              },
            ],
          },
        },
        {
          step: 1,
          press: "Search people, channels and projects",
          hold: 900,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 1100,
              minHeight: 560,
            },
            children: [
              {
                el: "component",
                use: "title-bar",
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
              minHeight: 560,
            },
            children: [
              {
                el: "component",
                use: "title-bar",
                props: {},
              },
              {
                el: "component",
                use: "command-palette",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  groups: [
                    {
                      label: "Recent",
                      items: [
                        {
                          key: "channel:release-train",
                          icon: "hash",
                          label: "release-train",
                          hint: "Channel",
                          selected: true,
                        },
                        {
                          key: "person:kenji-watanabe",
                          avatar: true,
                          label: "Kenji Watanabe",
                          identity: "indigo",
                          presence: "active",
                          status: "🚆 Release captain this week",
                          hint: "Message",
                        },
                        {
                          key: "project:atlas-mobile",
                          icon: "folder-kanban",
                          label: "Atlas Mobile",
                          hint: "Project",
                        },
                      ],
                    },
                    {
                      label: "Channels",
                      items: [
                        {
                          key: "channel:platform-eng",
                          icon: "hash",
                          label: "platform-eng",
                          hint: "Channel",
                        },
                        {
                          key: "channel:design-crit",
                          icon: "lock",
                          label: "design-crit",
                          hint: "Private channel",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "back-and-forward",
      title: "Back returns to where you just were",
      description: "The bar's Back and Forward walk one line of places visited this session, the same line ⌘[ and ⌘] walk today. Going back puts you back; it doesn't replay whatever got you there.",
      platforms: ["desktop"],
      width: 1100,
      steps: [
        {
          kind: "data",
          title: "Every place you visit is recorded on one line",
          detail: "An effect watches the five fields that make a location and records it when one changes. A message arriving or a keystroke adds nothing. The line holds up to 50 places, in memory, and starts empty on each launch.",
          code: "useEffect(() => { a.recordLocation() }, [here.screen, here.wsMode, here.projPane, here.activeProject, here.channelKey, a])",
        },
        {
          kind: "data",
          title: "canGoBack and canGoForward are read off it",
          detail: "Whether there is a place behind or ahead of the current one. Nothing on screen reads them today: the buttons are new in this spec, and ⌘[ / ⌘] are the only way back.",
          code: "canGoBack = navBackTarget(s.navHistory) !== null",
        },
        {
          kind: "trigger",
          title: "Back is clicked, or ⌘[ pressed",
          detail: "In #release-train, having come from the Inbox. While a dialog is open Back does nothing: going back underneath it would lose what you were doing out of sight.",
        },
        {
          kind: "event",
          title: "onBack fires",
          code: "onBack?.()",
        },
        {
          kind: "state",
          title: "The store steps back one place",
          detail: "The location's fields are applied directly and the conversation goes through navPatch, so the draft travels with it and nothing the original click also did runs again.",
          code: "const target = navBackTarget(get().navHistory); if (target !== null) goToLocation(target.location, target.at)",
        },
        {
          kind: "motion",
          title: "Forward lights up",
          detail: "The pane swaps without a transition. In the bar only Forward changes: its disabled dimming fades out.",
        },
        {
          kind: "result",
          title: "The Inbox, with Forward ready",
          detail: "Forward or ⌘] returns to #release-train. Going somewhere new from here drops the places ahead, as a browser does.",
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
          step: 2,
          press: "Back",
          hold: 900,
          props: {
            canGoBack: true,
            canGoForward: false,
          },
        },
        {
          step: 5,
          hold: 1700,
          props: {
            canGoBack: true,
            canGoForward: true,
          },
        },
      ],
    },
  ],
};

export default docs;
