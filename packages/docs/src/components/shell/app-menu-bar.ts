import type { ComponentDocs } from "../../types";
import { APP_MENU_BAR_MENUS, APP_MENU_BAR_WEB_ITEMS, appMenusWith } from "../../samples";

const docs: ComponentDocs = {
  id: "app-menu-bar",
  name: "Application menu",
  category: "shell",
  level: "organism",
  status: "beta",
  description: "Where the app's own commands live. On macOS it is the system menu bar at the top of the screen; on Windows and Linux it hangs off the ☰ button in the title bar; in a browser tab it is a small ⋯ menu holding only what makes sense in a tab — never Reload, Zoom or Quit, which the browser owns.",
  props: {
    menus: {
      type: "array",
      default: [],
      sample: APP_MENU_BAR_MENUS,
      platforms: ["desktop"],
      description: "{ key, label, items? } for each menu, left to right. The first is the app menu on macOS and names the bar; Windows and Linux skip it and carry About and Quit under Help and File instead. Each menu's `items` are MenuItem rows (`shortcut`, `type: \"separator\"`, `checked`, `disabled`, a `submenu` drawn only as its chevron) plus `os`.",
    },
    openMenu: {
      type: "string",
      default: "",
      sample: "view",
      platforms: ["desktop"],
      description: "The key of the menu drawn open. Empty closes it on macOS and Windows; on Linux it shows the popover's main list of menus.",
    },
    highlight: {
      type: "string",
      default: "",
      description: "The key (else the label) of the entry under the pointer or keyboard focus, for a static snapshot.",
    },
    workspace: {
      type: "string",
      default: "",
      sample: "GeekyAnts",
      platforms: ["web"],
      description: "Names the web menu and its ⋯ trigger. Empty draws no header row.",
    },
    host: {
      type: "string",
      default: "",
      sample: "geekyants.antfabric.ai",
      platforms: ["web"],
      description: "Under the workspace name in the header.",
    },
    workspaceIdentity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red", "agent"],
      default: "ink",
      sample: "red",
      platforms: ["web"],
      description: "The workspace tile's colour in the header.",
    },
    webItems: {
      type: "array",
      platforms: ["web"],
      default: [],
      sample: APP_MENU_BAR_WEB_ITEMS,
      description: "The web menu: MenuItem rows ({ icon, label, shortcut?, webShortcut?, disabled? }) with `trailingIcon?`, { type: \"scheme\" } for the Light / Dark / System row, or { type: \"separator\" }.",
    },
    colorScheme: {
      type: "enum",
      options: ["light", "dark", "system"],
      default: "system",
      platforms: ["web"],
    },
    clock: {
      type: "string",
      default: "",
      sample: "Thu 29 Oct 9:41",
      platforms: ["desktop"],
      description: "The macOS picture's clock, at the right of the bar. Empty draws none.",
    },
    onSelect: {
      type: "event",
      args: "item: AppMenuBarItem | AppMenuBarWebItem",
      description: "A desktop entry (which also closes the menu) or a web ⋯ entry was chosen. Disabled entries never fire it.",
    },
    onOpenMenuChange: {
      type: "event",
      args: "openMenu: string",
      changes: "openMenu",
      platforms: ["desktop"],
      description: "A menu title (macOS bar, Windows ☰ row, Linux main list) or the Linux back row was pressed, or an entry was chosen: the menu now open, or empty.",
    },
    onColorSchemeChange: {
      type: "event",
      args: "colorScheme: AppMenuBarColorScheme",
      changes: "colorScheme",
      platforms: ["web"],
      description: "Light, Dark or System was pressed in the Theme row. The menu stays open.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The ⋯ IconButton over a <div role=\"menu\"> that pops in (enter(\"pop\")): an Avatar header, <button role=\"menuitem\"> rows with Kbd hints, and a role=\"radiogroup\" Theme row of <button role=\"radio\"> segments; inline styles over `t`, hover / press / focus from useInteraction, `colorScheme` through useControllable. The kit draws the menu open; opening it from the top bar, Esc and arrow-key movement belong to the menu primitive the app wraps it in.",
      import: "import { AppMenuBar } from \"@antfabric-ui/react/shell\"",
      notes: [
        "Deliberately NOT here: Reload, Force Reload, Zoom, Full Screen, Close Window, Quit. The browser owns every one of them and its own shortcuts (⌘R, ⌘+, ⌘W, ⌘Q) reach the browser before the page. Offering them twice teaches people a command that sometimes does something different.",
        "No History menu either: the top bar's Back / Forward are the browser's own history, so a second copy here would be a third place for one command.",
        "'Open in desktop app' fires the antfabric:// deep link for the current location; 'Download the desktop app' opens the download page. Both show whether or not the app is installed — the browser cannot tell — see the edge case.",
        "Help opens the help centre in a new tab (target=_blank, the external-link glyph says so).",
        "The menu pops in from the ⋯; pressing Light, Dark or System sets `colorScheme` and the selected segment moves without closing the menu.",
      ],
      keyboard: [
        {
          keys: "Enter / Space / ↓",
          action: "On the ⋯ button: opens the menu with the first item focused",
        },
        {
          keys: "↑ / ↓",
          action: "Moves between items; Home / End jump to the ends; typing a letter jumps to the next item starting with it",
        },
        {
          keys: "← / →",
          action: "Inside the Theme row: moves between Light, Dark and System",
        },
        {
          keys: "Esc",
          action: "Closes the menu and returns focus to ⋯",
        },
        {
          keys: "Mod+,",
          action: "Preferences, without opening the menu",
        },
        {
          keys: "Mod+/",
          action: "Keyboard shortcuts, without opening the menu",
        },
      ],
    },
    desktop: {
      status: "partial",
      base: "macOS: a picture of the system menu bar over the wallpaper (role=\"menubar\", <button role=\"menuitem\"> titles, a dropdown that fades in; glass() on macOS 26) — in the app the real bar is Tauri's native Menu. Windows: the ☰ IconButton over a panel that pops in, each menu a row whose cascade fades in beside it. Linux: the same panel as a GNOME popover, the submenu sliding in place (enter(\"slide-left\")) with a ‹ back row. Rows are <button role=\"menuitem\"> with Kbd hints; inline styles over `t`, hover / press / focus from useInteraction, `openMenu` through useControllable.",
      import: "import { AppMenuBar } from \"@antfabric-ui/react/shell\"",
      notes: [
        "Today: Tauri's Menu::default (AntFabric, File, Edit, View, Window, Help) with five items prepended into View (view_menu.rs) and Report a Problem… appended to Help (help_menu.rs). On Windows and Linux that default renders as a native menu strip under the native title bar.",
        "New in this spec: a History menu (Back ⌘[, Forward ⌘]) and AntFabric › Settings… ⌘, on macOS; the ☰ menu on Windows and Linux, which needs decorations: false (see title-bar).",
        "⌘R is Reload = the data refresh (refreshWorkspace, ADR-0759) and keeps drafts and scroll; ⌘⇧R is Force Reload = WebviewWindow::reload(). Force Reload is handled in Rust, never in the page, because a page that needs it may not be listening.",
        "Zoom steps through Chromium's eleven stops (50%–200%), is applied to every webview and remembered in settings.json under viewZoom.",
        "Windows/Linux: the native menu stays attached and hidden (window.hide_menu()) so its accelerators — Ctrl+Shift+R above all — still fire when the page is dead. Verify muda keeps the accelerator table after hide_menu on Windows; if it does not, register Force Reload natively.",
        "Linux draws GNOME's popover-menu convention: a submenu slides in place with a ‹ back row instead of cascading sideways.",
        "Pressing a menu title (macOS bar, Windows ☰ cascade) sets `openMenu` and its dropdown fades in; pressing the open title closes it. The ☰ panel pops in. On Linux a menu in the popover's main list slides its submenu in and the ‹ row goes back to the list. Choosing an entry fires onSelect and closes the menu.",
        "Shortcut glyphs come from the menu model, so macOS orders modifiers its own way (⇧⌘R) in the real menu even though the spec writes Mod+Shift+R once.",
        "macOS 26+ (Tahoe): the system menu bar is transparent over the wallpaper and its menus are Liquid Glass — macOS draws both; the app only supplies the items. macOS 15 and earlier: the translucent bar and vibrancy menus. The Windows ☰ menu and the web ⋯ menu are ours and unchanged.",
      ],
      keyboard: [
        {
          keys: "Mod+R",
          action: "View › Reload — re-reads the workspace; drafts and scroll positions stay",
        },
        {
          keys: "Mod+Shift+R",
          action: "View › Force Reload — reloads the webview itself",
        },
        {
          keys: "Mod+0 / Mod+= / Mod+-",
          action: "Actual Size / Zoom In / Zoom Out",
        },
        {
          keys: "Mod+[ / Mod+]",
          action: "History › Back / Forward",
        },
        {
          keys: "Mod+Shift+B",
          action: "Help › Report a Problem…",
        },
        {
          keys: "Alt / F10",
          action: "Windows and Linux: opens ☰ with File highlighted; Alt+F, Alt+E, Alt+V, Alt+S (History), Alt+W and Alt+H open a menu by its underlined letter",
        },
        {
          keys: "Ctrl+F2",
          action: "macOS: moves focus to the system menu bar (when keyboard navigation is on)",
        },
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "There is no app menu on a phone. The header photo opens /profile, which holds Preferences, Theme, Help, Report a problem and Sign out. Reload is pull-to-refresh, zoom is the system text size, and quitting is the app switcher.",
    },
  },
  a11y: {
    role: "menu",
    notes: [
      "The macOS bar in the catalogue is a picture of the system's own menu bar; the real one is native and VoiceOver reads it as such.",
      "The macOS bar is a role=menubar with one tab stop: Left and Right move along its titles (and open the neighbour while a menu is open), Down or Up opens a menu and focuses its first or last entry, Escape closes it and returns focus to its title.",
      "Inside a menu Up, Down, Home, End and typing a letter move between entries, Left and Right go to the neighbouring menu, and Escape closes the menu and returns focus to the entry that opened it. The Windows ☰ panel and GNOME popover use the same keys; Right opens an entry's flyout, Left or Escape closes it.",
      "The web ⋯ menu is a picture of an open menu (the app owns opening it), so it has no Escape of its own. Its entries take Up, Down, Home, End and typing; the Theme row is a radiogroup that is one stop in that order: Left, Right, Up and Down inside it move between Light, Dark and System and check the option they reach, and Tab leaves it.",
      "Disabled items stay in the menu and are announced as dimmed — a command that vanishes is harder to find again than one that is greyed.",
      "Every entry draws a focus ring. A long menu scrolls inside the window (80% of its height) instead of running off it.",
    ],
  },
  examples: [
    {
      name: "macOS — View open",
      os: "mac",
      platforms: ["desktop"],
      width: 760,
    },
    {
      name: "macOS — pointer on Zoom In",
      props: {
        highlight: "Zoom In",
      },
      os: "mac",
      platforms: ["desktop"],
      width: 760,
    },
    {
      name: "macOS — AntFabric menu",
      props: {
        openMenu: "app",
        menus: appMenusWith("app", [
          {
            label: "About AntFabric",
          },
          {
            type: "separator",
          },
          {
            label: "Settings…",
            shortcut: "Mod+,",
          },
          {
            type: "separator",
          },
          {
            label: "Services",
            submenu: [],
          },
          {
            type: "separator",
          },
          {
            label: "Hide AntFabric",
            shortcut: "Mod+H",
          },
          {
            label: "Hide Others",
            shortcut: "Alt+Mod+H",
          },
          {
            label: "Show All",
            disabled: true,
          },
          {
            type: "separator",
          },
          {
            label: "Quit AntFabric",
            shortcut: "Mod+Q",
          },
        ]),
      },
      os: "mac",
      platforms: ["desktop"],
      width: 760,
    },
    {
      name: "History menu (new)",
      props: {
        openMenu: "history",
        menus: appMenusWith("history", [
          {
            label: "Back",
            shortcut: "Mod+[",
          },
          {
            label: "Forward",
            shortcut: "Mod+]",
            disabled: true,
          },
          {
            type: "separator",
          },
          {
            label: "Recent history…",
            shortcut: "Mod+Y",
          },
        ]),
      },
      platforms: ["desktop"],
      width: 760,
    },
    {
      name: "Help",
      props: {
        openMenu: "help",
        menus: appMenusWith("help", [
          {
            label: "About AntFabric",
            os: "other",
          },
          {
            label: "AntFabric Help",
          },
          {
            label: "Keyboard Shortcuts",
            shortcut: "Mod+/",
          },
          {
            type: "separator",
          },
          {
            label: "Report a Problem…",
            shortcut: "Mod+Shift+B",
          },
        ]),
      },
      platforms: ["desktop"],
      width: 760,
    },
    {
      name: "Windows — ☰ with View cascading",
      props: {
        highlight: "Force Reload",
      },
      os: "windows",
      platforms: ["desktop"],
      width: 560,
    },
    {
      name: "Linux — GNOME sliding submenu",
      os: "linux",
      platforms: ["desktop"],
      width: 560,
    },
    {
      name: "Web — ⋯ menu",
      platforms: ["web"],
      width: 340,
    },
    {
      name: "Web — dark theme chosen",
      props: {
        colorScheme: "dark",
        highlight: "Keyboard shortcuts",
      },
      platforms: ["web"],
      width: 340,
    },
  ],
  matrix: [
    {
      prop: "colorScheme",
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "The browser owns Reload, Zoom and Quit",
      platforms: ["web"],
      handling: "The web menu never lists them. ⌘R in a tab reloads the page: drafts are already in IndexedDB (saved as you type), and only a send still in flight raises the browser's 'Leave site?' prompt. ⌘+ / ⌘- are the browser's zoom and the layout reflows; the app never intercepts them.",
      example: {
        name: "No Reload, no Zoom",
        platforms: ["web"],
        width: 340,
      },
    },
    {
      title: "Zoom at its limits",
      platforms: ["desktop"],
      handling: "At 200% Zoom In is greyed, at 50% Zoom Out is greyed, and Actual Size is greyed at 100%. Today the items stay enabled and the step pins at the end stop, which reads as a broken shortcut; the spec greys them so the menu says why nothing happened.",
      example: {
        name: "Zoomed to 200%",
        props: {
          menus: appMenusWith("view", [
            {
              label: "Reload",
              shortcut: "Mod+R",
            },
            {
              label: "Force Reload",
              shortcut: "Mod+Shift+R",
            },
            {
              type: "separator",
            },
            {
              label: "Actual Size",
              shortcut: "Mod+0",
            },
            {
              label: "Zoom In",
              shortcut: "Mod+=",
              disabled: true,
            },
            {
              label: "Zoom Out",
              shortcut: "Mod+-",
            },
          ]),
        },
        platforms: ["desktop"],
        width: 760,
      },
    },
    {
      title: "Clicked and pressed: still once",
      platforms: ["desktop"],
      handling: "WebKit hands ⌘R to the page first; the shortcut registry prevents it, so the keyboard path is the registry's and the menu accelerator is only a label. Clicking the item runs the menu handler. Each path fires exactly once — never a refresh and a reload together.",
    },
    {
      title: "A page too broken to listen",
      platforms: ["desktop"],
      handling: "Force Reload is native on every OS. On macOS that is the system menu bar. On Windows and Linux the ☰ is drawn by the page, so the hidden native menu keeps Ctrl+Shift+R alive and the tray menu offers 'Reload window' as a mouse path that never touches the webview.",
    },
    {
      title: "Window closed to the tray",
      platforms: ["desktop"],
      handling: "macOS keeps the app active with no window: View and History items are greyed (there is nothing to reload or zoom), Window › AntFabric and a Dock click bring the window back (ADR-0811). On Windows and Linux there is no menu while the window is hidden; the tray menu is the way back.",
    },
    {
      title: "Report a Problem in a build without a report service",
      platforms: ["desktop", "web"],
      handling: "The item is always there — hiding a command that every runbook screenshots is worse. Choosing it opens a dialog that says reporting is not available in this build and offers to copy diagnostics instead.",
    },
    {
      title: "Desktop app may not be installed",
      platforms: ["web"],
      handling: "Chrome and Edge drop an unknown antfabric:// link silently: if the page still has focus 1.5 s later, the menu's next open puts 'Download the desktop app' first. Safari shows its own 'cannot open the page' sheet, so on Safari 'Open in desktop app' appears only after one open has succeeded on this browser (remembered locally).",
    },
    {
      title: "Signed out or SSO expired",
      platforms: ["web"],
      handling: "The menu leads with 'Sign in again'; Preferences is disabled because it needs the account. Theme and Help still work signed out.",
      example: {
        name: "Session expired",
        props: {
          webItems: [
            {
              icon: "log-in",
              label: "Sign in again",
            },
            {
              type: "separator",
            },
            {
              icon: "settings",
              label: "Preferences",
              shortcut: "Mod+,",
              disabled: true,
            },
            {
              type: "scheme",
            },
            {
              type: "separator",
            },
            {
              icon: "life-buoy",
              label: "Help",
              trailingIcon: "external-link",
            },
          ],
        },
        platforms: ["web"],
        width: 340,
      },
    },
    {
      title: "A long workspace name",
      platforms: ["web"],
      handling: "The header truncates to one line with an ellipsis; the full name is the menu's accessible name and the trigger's tooltip.",
      example: {
        name: "Long name",
        props: {
          workspace: "Northwind Health Partners — Clinical Operations",
          host: "northwind-clinical-ops.antfabric.ai",
        },
        platforms: ["web"],
        width: 340,
      },
    },
    {
      title: "Keyboard-only and right-to-left",
      platforms: ["web", "desktop"],
      handling: "Every menu opens and walks from the keyboard (Alt / F10 on Windows and Linux, Ctrl+F2 on macOS, Enter on ⋯ in a browser). In right-to-left languages the Windows cascade opens to the left and shortcuts sit at the start of the row.",
    },
    {
      title: "Liquid Glass and earlier macOS",
      platforms: ["desktop"],
      handling: "macOS draws the menu bar, so its look follows the Mac's version: transparent bar and glass menus on 26+, vibrancy before. Our items, order and shortcuts are the same on both.",
    },
    {
      title: "The Mac's Liquid Glass settings",
      platforms: ["desktop"],
      handling: "macOS draws the menu bar and its menus, so Clear or Tinted, Reduce Transparency and Increase Contrast apply by themselves. Our items and shortcuts don't change.",
    },
  ],
  related: ["title-bar", "web-top-bar", "tray-menu", "command-palette", "keyboard-shortcuts"],
  flows: [
    {
      id: "reload-from-view",
      title: "View › Reload refreshes the workspace",
      description: "The menu is a model Rust builds at launch. Choosing an item goes to Rust first, which either acts itself (Force Reload, Zoom) or tells the page (Reload). Reload re-reads the data; it never reloads the page.",
      platforms: ["desktop"],
      width: 760,
      steps: [
        {
          kind: "data",
          title: "The menu model is built in Rust at launch",
          detail: "Tauri's default menu, with Reload, Force Reload and the three zoom items put at the top of View and Report a Problem… added to Help. Shortcuts come from the model, so macOS orders the modifiers its own way (⇧⌘R).",
          code: "let menu = Menu::default(app)?; … view.prepend(*item)?",
        },
        {
          kind: "trigger",
          title: "View is clicked",
          detail: "On macOS in the system's own bar at the top of the screen. On Windows and Linux in the ☰ menu off the title bar, which is new in this spec; today they get a native menu strip.",
        },
        {
          kind: "motion",
          title: "The View menu fades in",
          detail: "macOS draws its own menus: glass on 26 and later, vibrancy before. The Windows cascade fades in beside its row.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "Reload is chosen",
          detail: "Or ⌘R. The accelerator belongs to the menu, so it works wherever focus is in the window.",
        },
        {
          kind: "event",
          title: "onSelect(item) fires",
          detail: "In the app this is Tauri's menu event, carrying the item's id to Rust.",
          code: "onSelect?.(item)  // { label: \"Reload\", shortcut: \"Mod+R\" }",
        },
        {
          kind: "effect",
          title: "Rust tells the page to refresh",
          detail: "Reload emits view:reload to the page. Force Reload is the one that reloads the webview, and it runs in Rust because a page that needs it may not be listening. Zoom is applied to every webview and saved as viewZoom.",
          code: "RELOAD_ID => { let _ = app.emit(RELOAD_EVENT, ()); }",
        },
        {
          kind: "state",
          title: "The workspace re-reads, joining a round already running",
          detail: "A second ⌘R while one is in flight joins it instead of stacking every read twice, which used to make the app slowest exactly when someone pressed it because it felt slow.",
          code: "if (resyncing.current !== null) return; resyncing.current = resync()…",
        },
        {
          kind: "result",
          title: "Fresh data, with drafts and scroll kept",
          detail: "The menu closed as the item was chosen. Channels, mail and tasks are re-read; the open conversation keeps its place and the composer keeps its draft.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            openMenu: "",
          },
        },
        {
          step: 1,
          press: "View",
          hold: 900,
          props: {
            openMenu: "",
          },
        },
        {
          step: 2,
          hold: 1500,
          props: {
            openMenu: "view",
          },
        },
        {
          step: 3,
          press: "Reload",
          hold: 1000,
          props: {
            openMenu: "view",
            highlight: "Reload",
          },
        },
        {
          step: 7,
          hold: 1600,
          props: {
            openMenu: "",
          },
        },
      ],
    },
    {
      id: "pick-a-theme",
      title: "Choose Dark from the ⋯ menu",
      description: "In a browser tab the ⋯ menu holds the app's own settings, Theme among them. The choice applies at once and the menu stays open, so the person sees it before moving on.",
      platforms: ["web"],
      width: 340,
      steps: [
        {
          kind: "data",
          title: "The scheme is read before the first paint",
          detail: "The root route reads a theme cookie on the server, so the page never flashes light before turning dark. System follows prefers-color-scheme.",
          code: "const { colorScheme } = Route.useRouteContext()",
        },
        {
          kind: "trigger",
          title: "Dark is pressed",
          detail: "The Theme row's three segments are one radio group: ← and → move between them.",
        },
        {
          kind: "state",
          title: "colorScheme becomes dark",
          detail: "A setting, not a command, so no row is chosen and the menu doesn't close.",
          code: "setColorScheme('dark')",
        },
        {
          kind: "effect",
          title: "The page switches and the choice is saved",
          detail: "The theme attribute on the document changes at once, and a cookie keeps the choice for the next first paint in this browser.",
          code: "document.documentElement.dataset.theme = 'dark'; document.cookie = 'theme=dark; path=/; max-age=31536000'",
        },
        {
          kind: "motion",
          title: "The selected segment moves to Dark",
          detail: "The raised fill and hairline cross-fade from System to Dark. The page's colours change in place, without a transition, so nothing is caught half-way.",
        },
        {
          kind: "result",
          title: "AntFabric is dark in this tab and the next",
          detail: "Other AntFabric tabs pick it up from the cookie when they next load. The desktop app keeps its own theme.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            colorScheme: "system",
          },
        },
        {
          step: 1,
          press: "Dark",
          hold: 900,
          props: {
            colorScheme: "system",
          },
        },
        {
          step: 4,
          hold: 1700,
          props: {
            colorScheme: "dark",
          },
        },
      ],
    },
  ],
};

export default docs;
