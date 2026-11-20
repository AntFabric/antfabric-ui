import { TRAY_MENU_CASES, TRAY_MENU_SAMPLE, trayMenuProps } from "../../samples/notifications";
import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "tray-menu",
  name: "Tray menu",
  category: "notifications",
  level: "organism",
  status: "beta",
  description: "The desktop's menu-bar extra (macOS) and system-tray menu (Windows, Linux): what the recorder is doing, how much is unread, recording controls, pausing notifications, and the way back into the window. The macOS menu-bar title follows the recorder, so the timer is readable without opening anything.",
  props: {
    appName: {
      type: "string",
      required: true,
      sample: "AntFabric",
      description: "The app's name: the menu's accessible name.",
    },
    items: {
      type: "array",
      default: [],
      sample: TRAY_MENU_SAMPLE.items,
      description: "Every row, in order: `{ key?, type?: \"item\" | \"separator\" | \"label\", label, icon?, text?, count?, filled?, tone?: \"danger\", disabled?, submenu? }`. A `label` row is a dimmed readout; `count` is the right-hand detail (read after the label); `filled` draws the glyph solid (`danger` is the record glyph); `text` is drawn when it differs from the accessible name; `submenu` opens a menu of its own.",
    },
    tone: {
      type: "enum",
      options: ["idle", "live", "paused", "busy"],
      default: "idle",
      sample: TRAY_MENU_SAMPLE.tone,
      description: "The tray icon: idle is the plain dot, live the red one, paused the amber, busy the blue.",
    },
    statusText: {
      type: "string",
      default: "",
      sample: TRAY_MENU_SAMPLE.statusText,
      description: "Beside the macOS status item: \"Recording 0:12\". \"\" draws none.",
    },
    date: {
      type: "string",
      default: "",
      sample: "Wed 29 Oct",
      description: "The picture's date: the macOS menu bar draws \"date clock\".",
    },
    clock: {
      type: "string",
      default: "",
      sample: "10:42",
      description: "The picture's clock: the macOS menu bar draws \"date clock\", the taskbar \"clock\".",
    },
    openMenu: {
      type: "string",
      default: "",
      sample: "",
      description: "The key of the row whose submenu is open. \"\" is none.",
    },
    onSelect: {
      type: "event",
      args: "item: TrayMenuItem",
      description: "A row was pressed (a row with a submenu opens it instead).",
    },
    onOpenMenuChange: {
      type: "event",
      args: "openMenu: string",
      changes: "openMenu",
      description: "A submenu opened or closed: the key of the open row, or \"\".",
    },
  },
  platforms: {
    web: {
      status: "not-applicable",
      alternative: "A browser has no tray. The tab title count and the favicon dot carry the unread count (App badge), Pause notifications lives in the notification rail's settings menu, and a recording runs only while its tab is open — the tab's own recording indicator is the status.",
    },
    desktop: {
      status: "partial",
      base: "A drawing of the macOS menu-bar extra or the Windows / Linux tray and its menu, picked by usePlatform().os: a `role=\"menu\"` of `<button role=\"menuitem\">` rows, inline styles over `t`, the highlight from useInteraction, Up / Down / Right / Left handled on the menu, Liquid Glass through glass() on macOS 26, and a fade-in with enter(\"fade\"). Presses move the recorder and the pause in local state. The app builds the real one with Tauri TrayIconBuilder + muda Menu (MenuItem, IconMenuItem, Submenu, PredefinedMenuItem::separator), rebuilt on a recorder state change and retexted in place on each 250 ms tick.",
      import: "import { TrayMenu } from \"@antfabric-ui/react/shell\"",
      notes: [
        "Ships today: the status line, Start / Pause / Resume / Stop Recording, Open Recordings Folder, Show / Hide AntFabric, Quit AntFabric. New in this spec: the unread line and Pause notifications ▸.",
        "macOS: the menu-bar title is set only while recording, paused or saving (\"Recording 0:12\") — menu-bar width is shared with every other app. Idle writes an empty string explicitly, because set_title(None) is a no-op on macOS and once left \"Saving…\" there for the life of the process.",
        "The unread count goes in the menu, never in the menu-bar title; the Dock badge already carries it.",
        "Transport glyphs are images, not emoji, painted mid-grey (record in red) because a muda menu-item image is not a template image and would vanish in one of the two menu themes.",
        "Windows and Linux show the tooltip \"AntFabric Recorder — 00:00:12\" on hover instead of a title.",
        "Windows: left-click on the tray icon shows or hides the window, right-click opens this menu. macOS: either click opens the menu.",
        "macOS 26+ (Tahoe): the menu-bar extra sits on a transparent menu bar and its menu is Liquid Glass, drawn by macOS. macOS 15 and earlier: vibrancy. The Windows tray menu is unchanged.",
        "In the catalogue the menu fades in; Pause notifications ▸ toggles `submenu`, a duration sets `notificationsPaused` (and an example `pausedUntil`, counted from 10:42), and Start / Pause / Resume / Stop move `recorder` through its states.",
      ],
      keyboard: [
        {
          keys: "Win+B, then Enter",
          action: "Windows: focuses the notification area; Enter or Shift+F10 opens the menu",
        },
        {
          keys: "Up / Down, Home / End",
          action: "Moves through the enabled items, and wraps; a letter jumps to the next item that starts with it",
        },
        {
          keys: "Enter / Space",
          action: "Activates the item",
        },
        {
          keys: "Right / Left",
          action: "Opens the submenu of the row that has one (and moves into it); Left or Escape closes it and gives focus back to its row. The keys swap in a right-to-left tree",
        },
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "A phone has no tray. The home-screen badge carries the count; a running recording is an iOS Live Activity (Lock Screen and Dynamic Island timer) and an Android ongoing foreground-service notification \"Recording 0:12\" with Pause and Stop; Pause notifications lives in Profile.",
    },
  },
  a11y: {
    role: "menu",
    notes: [
      "Disabled readout rows (status, unread, paused until) are how a native menu says \"this is information\"; screen readers read them as dimmed items.",
      "The menu is one Tab stop: the arrows move inside it, and Tab leaves it. Each submenu is its own menu with the same keys, and focus returns to the row that opened it. Closing the whole menu is the OS's: the kit draws the picture of it, so Escape at the top level is the app's.",
      "The tray icon and the status bar around the menu are a picture of the OS and are hidden from assistive technology; the tooltip text is the app's to set on the real tray icon.",
    ],
  },
  examples: [
    {
      name: "macOS, recording",
      os: "mac",
    },
    {
      name: "macOS, idle",
      os: "mac",
      props: trayMenuProps({
        recorder: "idle",
        unread: 0,
      }),
    },
    {
      name: "macOS, Pause notifications ▸",
      os: "mac",
      props: trayMenuProps({
        recorder: "idle",
        open: true,
      }),
    },
    {
      name: "Windows, recording",
      os: "windows",
    },
    {
      name: "Windows, Pause notifications ▸",
      os: "windows",
      props: trayMenuProps({
        recorder: "idle",
        open: true,
      }),
    },
    {
      name: "Linux, paused recording",
      os: "linux",
      props: trayMenuProps({
        recorder: "paused",
        elapsed: "4:31",
      }),
    },
    {
      name: "Notifications paused",
      props: trayMenuProps({
        recorder: "idle",
        paused: true,
      }),
    },
  ],
  matrix: [
    {
      prop: "recorder",
      cases: TRAY_MENU_CASES,
    },
  ],
  edgeCases: [
    {
      title: "The timer ticks",
      platforms: ["desktop"],
      handling: "The recorder pushes a snapshot every 250 ms. A state change rebuilds the menu; a tick only retexts the status line, the macOS title and the tooltip, and only when the text actually changed — so an open menu never flickers or closes under the pointer.",
      example: {
        name: "An hour in",
        os: "mac",
        props: trayMenuProps({
          elapsed: "1:02:10",
        }),
      },
    },
    {
      title: "Saving after Stop",
      platforms: ["desktop"],
      handling: "Stopping reads \"Saving…\" in the menu and the menu bar until the file is written; Start stays disabled until then, so a second recording cannot start on top of a save.",
      example: {
        name: "Saving",
        os: "mac",
        props: trayMenuProps({
          recorder: "stopping",
        }),
      },
    },
    {
      title: "The window is hidden in the tray, or on another Space",
      platforms: ["desktop"],
      handling: "Show / Hide AntFabric reveals with show → unminimize → focus (the order tao needs), including from a fullscreen Space; the same reveal a Dock click and a notification click use. Hiding never quits, and the socket stays connected so notifications still arrive.",
    },
    {
      title: "No tray on this Linux desktop",
      platforms: ["desktop"],
      handling: "Stock GNOME shows no tray icons without the AppIndicator extension. Then the tray cannot be the way back: closing the window minimises instead of hiding, so AntFabric is never left running with nothing on screen to reach it.",
      example: {
        name: "Linux idle",
        os: "linux",
        props: trayMenuProps({
          recorder: "idle",
        }),
      },
    },
    {
      title: "Windows hides new tray icons",
      platforms: ["desktop"],
      handling: "Windows 11 puts a new app's icon in the ^ overflow. The first time the window is closed to the tray, a one-off toast says \"AntFabric is still running. You'll find it in the system tray.\"",
    },
    {
      title: "Quit while recording",
      platforms: ["desktop"],
      handling: "Quit stops the recording and waits for the save (\"Saving…\") before the process exits; audio is never discarded by quitting. If the save fails, the next launch's recovery reports \"A partial recording was saved.\"",
    },
    {
      title: "Pausing from the tray",
      platforms: ["desktop"],
      handling: "Pause notifications ▸ works with the window hidden: it writes the same server-side pause as the in-app menu, so every device goes quiet. While paused the item becomes a dimmed \"Notifications paused until 9:00\" and Resume notifications. Custom… opens the window at the picker.",
      example: {
        name: "Paused until tomorrow",
        os: "windows",
        props: trayMenuProps({
          paused: true,
          until: "tomorrow, 9:00",
        }),
      },
    },
    {
      title: "Dark menus",
      platforms: ["desktop"],
      handling: "The menu is drawn by the OS in its own theme; the bar icon is a template image on macOS so it inverts with the menu bar, while the record, pause and stop glyphs are fixed colours chosen to read on both.",
    },
    {
      title: "Liquid Glass and earlier macOS",
      platforms: ["desktop"],
      handling: "The tray menu is a native NSMenu, so macOS chooses its material: glass on 26+, vibrancy before. Nothing to build; the preview shows both.",
    },
    {
      title: "The Mac's Liquid Glass settings",
      platforms: ["desktop"],
      handling: "A native NSMenu: macOS applies Clear or Tinted, Reduce Transparency and Increase Contrast to it by itself.",
    },
  ],
  related: ["notification-schedule", "app-badge", "recording-indicator"],
  flows: [
    {
      id: "pause-the-recording",
      title: "Pause the recording from the menu bar",
      description: "The recorder can be run without the window: the menu-bar title shows the timer, and the menu has the controls for whatever the recorder is doing now.",
      platforms: ["desktop"],
      steps: [
        {
          kind: "data",
          title: "The recorder pushes every change",
          detail: "Each transition, plus a 250 ms tick, goes out as recorder:snapshot. The tray and the desktop notifications listen to it natively, so they follow whatever drives the recorder: the window, the tray or a shortcut.",
          code: "app.listen(recording::SNAPSHOT_EVENT, move |event| { tray::apply(&handle, &previous, &next); … })",
        },
        {
          kind: "state",
          title: "The menu-bar title follows the timer",
          detail: "Recording 0:12 beside the icon on macOS, leading zeros dropped; Windows and Linux carry the full time in the tooltip. A tick only re-texts the status row; the menu is rebuilt only when the state changes.",
          code: "RecorderState::Recording => format!(\"Recording {}\", format_elapsed_compact(snapshot.elapsed_ms))",
        },
        {
          kind: "trigger",
          title: "The tray icon is clicked",
          detail: "The menu opens on what the recorder is doing, how much is unread, and the controls for this state.",
        },
        {
          kind: "motion",
          title: "The menu fades in",
          detail: "The OS draws it; this is how it arrives.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "Pause Recording is chosen",
        },
        {
          kind: "event",
          title: "The menu event carries the item's id",
          detail: "The tray menu has no props of its own to call; each item's id is matched in Rust.",
          code: "MENU_PAUSE => { let _ = app.state::<RecorderService>().pause(); }",
        },
        {
          kind: "state",
          title: "The recorder pauses",
          detail: "Capture stops writing and the new snapshot goes out to everything listening.",
          code: "session.paused.store(true, Ordering::SeqCst); inner.state = RecorderState::Paused",
        },
        {
          kind: "effect",
          title: "The tray rebuilds, and a banner says so",
          detail: "The state changed, so the menu is rebuilt with Resume Recording in place of Pause and the icon changes. The same snapshot raises the Recording Paused notification.",
          code: "if prev.state != next.state { tray.set_icon(Some(icon)); tray.set_menu(Some(menu)) }  // notify::derive_notification → \"Recording Paused\"",
        },
        {
          kind: "result",
          title: "Paused at 0:12, and the menu bar says so",
          detail: "Paused 0:12 beside the icon. Resume Recording carries on from there; Stop Recording saves it.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          props: trayMenuProps({
            recorder: "recording",
            elapsed: "0:12",
          }),
        },
        {
          step: 4,
          press: "Pause Recording",
          hold: 900,
          props: trayMenuProps({
            recorder: "recording",
            elapsed: "0:12",
          }),
        },
        {
          step: 7,
          hold: 1700,
          props: trayMenuProps({
            recorder: "paused",
            elapsed: "0:12",
          }),
        },
      ],
    },
    {
      id: "pause-notifications",
      title: "Pause notifications from the tray",
      description: "The quickest way to go quiet without opening the window. Planned: the tray menu has no notification controls today.",
      platforms: ["desktop"],
      steps: [
        {
          kind: "data",
          title: "Not in the tray yet",
          detail: "Today's tray menu is the recorder's: status, Start, Pause, Resume and Stop, the recordings folder, Show / Hide and Quit. The unread line and Pause notifications are this spec's additions, and the pause is the same server-side pause as the rail's menu.",
        },
        {
          kind: "trigger",
          title: "Pause notifications ▸ is opened",
        },
        {
          kind: "motion",
          title: "The choices fade in beside it",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "1 hour is chosen",
        },
        {
          kind: "effect",
          title: "The pause is saved on the server",
          detail: "The tray hands the choice to the window's code, which saves the same pause the rail's menu does, so the phone goes quiet too.",
        },
        {
          kind: "state",
          title: "The menu shows the pause",
          detail: "Pause notifications ▸ gives way to Notifications paused until 11:42 and Resume notifications. The Dock badge keeps its count.",
        },
        {
          kind: "result",
          title: "Quiet for an hour, on every device",
          detail: "Feed and badge still update; no banners and no sound until 11:42, or until Resume.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          props: trayMenuProps({
            recorder: "idle",
            paused: false,
            open: false,
          }),
        },
        {
          step: 1,
          press: "Pause notifications",
          hold: 900,
          props: trayMenuProps({
            recorder: "idle",
            paused: false,
            open: false,
          }),
        },
        {
          step: 2,
          hold: 1400,
          props: trayMenuProps({
            recorder: "idle",
            paused: false,
            open: true,
          }),
        },
        {
          step: 3,
          press: "1 hour",
          hold: 900,
          props: trayMenuProps({
            recorder: "idle",
            paused: false,
            open: true,
          }),
        },
        {
          step: 5,
          hold: 1700,
          props: trayMenuProps({
            recorder: "idle",
            paused: true,
            until: "11:42",
            open: false,
          }),
        },
      ],
    },
  ],
};

export default docs;
