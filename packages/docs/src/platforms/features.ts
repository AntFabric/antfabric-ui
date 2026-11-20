export const features = {
  $description: "Where web and desktop (and mobile) deliberately differ. Slack ships one product as a browser tab, a desktop app and a phone app, and each gets the features its host makes possible; this is the same exercise for AntFabric. Each cell is [support, note]: yes | partial | no | planned. 'Today' notes come from the desktop app (develop-desktop-app-v7) and the mobile app (develop-mobile-app-v2).",
  columns: [
    {
      id: "web",
      label: "Web",
      sub: "Browser tab",
    },
    {
      id: "mac",
      label: "macOS",
      sub: "Desktop app",
    },
    {
      id: "windows",
      label: "Windows",
      sub: "Desktop app",
    },
    {
      id: "linux",
      label: "Linux",
      sub: "Desktop app",
    },
    {
      id: "ios",
      label: "iOS",
      sub: "Phone app",
    },
    {
      id: "android",
      label: "Android",
      sub: "Phone app",
    },
  ],
  groups: [
    {
      id: "chrome",
      name: "Window and chrome",
      description: "Who owns the frame. In a browser the browser does; on desktop we do; on a phone the OS does.",
      features: [
        {
          name: "Application menu",
          component: "app-menu-bar",
          support: {
            web: [
              "partial",
              "A ⋯ menu in the top bar with what makes sense in a tab: Preferences, Keyboard shortcuts, Theme, Download the desktop app, Open in desktop app, Help, Sign out. No Reload, Zoom or Quit — the browser owns those.",
            ],
            mac: [
              "yes",
              "The native menu bar: AntFabric, File, Edit, View, History, Window, Help. Today it is Tauri's default plus View → Reload / Zoom and Help → Report a Problem… ⌘⇧B.",
            ],
            windows: [
              "yes",
              "A ☰ button at the left of our title bar opens the same menus, the way Slack does on Windows.",
            ],
            linux: ["yes", "Same ☰ menu as Windows. Global menus (Unity/KDE) are not targeted."],
            ios: [
              "no",
              "Settings live on the profile screen. On iPad with a keyboard, holding ⌘ lists shortcuts.",
            ],
            android: ["no", "Settings live on the profile screen."],
          },
        },
        {
          name: "Title bar and window controls",
          component: "title-bar",
          support: {
            web: ["no", "The browser's tab and address bar. Our top bar starts below them."],
            mac: [
              "yes",
              "Overlay title bar: traffic lights at (16, 24) with a 96 px inset reserved, the rest is a drag region.",
            ],
            windows: [
              "yes",
              "Custom title bar: ☰, history arrows, search, then minimise / maximise / close. Close turns red on hover. Snap layouts on hover over maximise.",
            ],
            linux: [
              "yes",
              "Custom title bar with GNOME-style round controls; respects the system button order where we can read it.",
            ],
            ios: ["no", "Status bar and safe areas only."],
            android: ["no", "Status bar, edge-to-edge with insets."],
          },
        },
        {
          name: "Liquid Glass",
          component: "tab-bar",
          support: {
            web: [
              "no",
              "Never. The browser can only fake it, and the convincing fake is Chrome-only and costly; web surfaces stay opaque.",
            ],
            mac: [
              "yes",
              "macOS 26 (Tahoe) and later: the menu bar, system menus, notifications, the tray menu and our title-bar controls are Liquid Glass, following the Mac's Clear/Tinted, Reduce Transparency and Increase Contrast settings. macOS 15 and earlier keep the vibrancy blur.",
            ],
            windows: ["no", "No change — Windows keeps its own materials."],
            linux: ["no", "No change."],
            ios: [
              "yes",
              "iOS 26 and later: the tab bar, floating buttons, sheets, the in-app banner and notifications are Liquid Glass (GlassView). It follows the phone's own settings: Clear or Tinted, Reduce Transparency (frosted, nearly opaque) and Increase Contrast (an edge). iOS 18 and earlier keep today's blur and opaque look.",
            ],
            android: ["no", "No change — Material, not glass."],
          },
        },
        {
          name: "History back and forward",
          component: "web-top-bar",
          support: {
            web: [
              "yes",
              "Every place is a URL, so the browser's back works. Our ← → in the top bar call history.back/forward, never a separate stack.",
            ],
            mac: [
              "yes",
              "⌘[ / ⌘] today with no visible buttons; the spec adds ← → in the title bar, and two-finger swipe on the trackpad.",
            ],
            windows: ["yes", "Alt+← / Alt+→ and the mouse back/forward buttons, plus ← → in the title bar."],
            linux: ["yes", "As Windows."],
            ios: [
              "yes",
              "Swipe from the left edge; the V2 swipe rows never capture a rightward drag so this always works.",
            ],
            android: ["partial", "System back. Predictive back is switched off in app.json today."],
          },
        },
        {
          name: "Closing the window",
          support: {
            web: [
              "no",
              "Closing the tab stops sockets, sounds and in-tab notifications. Only Web Push (service worker) can still reach you.",
            ],
            mac: [
              "yes",
              "Close hides the window; the app keeps running, receives messages and notifies. The Dock icon reopens it. ⌘Q quits.",
            ],
            windows: [
              "yes",
              "Close hides to the system tray (first time: a one-off toast explains where it went). Quit from the tray.",
            ],
            linux: [
              "partial",
              "Hides to the tray where a tray exists (AppIndicator); on GNOME without the extension, close quits — we detect and say so in Settings.",
            ],
            ios: ["yes", "The OS suspends the app; push still arrives through APNs."],
            android: ["yes", "The OS suspends the app; push still arrives through FCM."],
          },
        },
        {
          name: "Launch at login",
          support: {
            web: ["no", "—"],
            mac: [
              "yes",
              "autostart plugin (LaunchAgent). Off by default, offered once after the first week.",
            ],
            windows: ["yes", "autostart plugin (Run key)."],
            linux: ["yes", "autostart plugin (.desktop in ~/.config/autostart)."],
            ios: ["no", "—"],
            android: ["no", "—"],
          },
        },
        {
          name: "Zoom and text size",
          support: {
            web: [
              "yes",
              "Browser zoom (⌘= / Ctrl+=). We never intercept it. Layout works from 80% to 200%.",
            ],
            mac: [
              "yes",
              "View → Zoom In ⌘= / Zoom Out ⌘- / Actual Size ⌘0, persisted (view_menu::load_zoom).",
            ],
            windows: ["yes", "Ctrl+= / Ctrl+- / Ctrl+0, persisted; also follows Windows text scaling."],
            linux: ["yes", "As Windows."],
            ios: ["yes", "Dynamic Type, capped at 1.3× (maxFontSizeMultiplier) as the app does today."],
            android: ["yes", "Font scale, capped at 1.3×."],
          },
        },
        {
          name: "More than one window",
          support: {
            web: [
              "yes",
              "Open a channel in a new tab (⌘-click). Every tab is a full client — see Multiple tabs.",
            ],
            mac: [
              "planned",
              "Pop a thread, a canvas or a meeting out into its own window. single-instance keeps one app process.",
            ],
            windows: ["planned", "As macOS."],
            linux: ["planned", "As macOS."],
            ios: ["no", "iPad split view later; phone never."],
            android: ["no", "—"],
          },
        },
      ],
    },
    {
      id: "input",
      name: "Input and navigation",
      description: "Keyboard, pointer and touch. The web app is a guest in the browser and must leave its shortcuts alone.",
      features: [
        {
          name: "Keyboard shortcuts",
          component: "kbd",
          support: {
            web: [
              "partial",
              "Everything except what the browser reserves: ⌘W, ⌘T, ⌘N, ⌘L, ⌘R, ⌘1–9 go to the browser. New message is Mod+Alt+N on the web.",
            ],
            mac: ["yes", "The full set, including ⌘N, ⌘1–9 to switch workspaces, ⌘[ ⌘] history."],
            windows: ["yes", "The full set with Ctrl; Alt+← → for history."],
            linux: ["yes", "As Windows."],
            ios: ["partial", "Only with a hardware keyboard (iPad), as UIKeyCommands."],
            android: ["partial", "Only with a hardware keyboard."],
          },
        },
        {
          name: "Search / command palette",
          component: "command-palette",
          support: {
            web: [
              "partial",
              "Mod+K. On Windows and Linux, Chrome/Edge/Firefox send Ctrl+K to the address bar first in some states — so / also opens it, and the hint says so.",
            ],
            mac: ["yes", "⌘K from anywhere; the rail's search field opens it."],
            windows: ["yes", "Ctrl+K."],
            linux: ["yes", "Ctrl+K."],
            ios: ["no", "A Search screen instead."],
            android: ["no", "A Search screen instead."],
          },
        },
        {
          name: "Right-click menus",
          component: "context-menu",
          support: {
            web: [
              "yes",
              "Our menu on messages, channels and files; the browser's menu everywhere else (text fields, links).",
            ],
            mac: [
              "yes",
              "Ours. Today the app suppresses the native menu (no-context-menu.ts); we keep Copy / Paste / Look Up in text fields.",
            ],
            windows: ["yes", "Ours, plus Shift+F10 and the Menu key."],
            linux: ["yes", "Ours."],
            ios: ["yes", "Long-press opens the actions sheet with quick reactions."],
            android: ["yes", "Long-press opens the actions sheet."],
          },
        },
        {
          name: "Hover affordances",
          component: "message-actions",
          support: {
            web: [
              "yes",
              "Message toolbar, hover cards (380 ms), tooltips (320 ms). Touch laptops (pointer: coarse) get a visible ⋯ instead.",
            ],
            mac: ["yes", "As web."],
            windows: ["yes", "As web; pen and touch get the visible ⋯."],
            linux: ["yes", "As web."],
            ios: ["no", "Nothing may depend on hover: long-press, swipe or a visible button instead."],
            android: ["no", "As iOS."],
          },
        },
        {
          name: "Drop and paste files",
          component: "attachment-card",
          support: {
            web: ["yes", "Drop on the channel, paste an image from the clipboard."],
            mac: [
              "yes",
              "Drop from Finder, paste; Tauri file-drop events give real paths for large files.",
            ],
            windows: ["yes", "Drop from Explorer, paste."],
            linux: ["yes", "Drop, paste."],
            ios: ["yes", "Attach sheet: camera, photos, files; Share Sheet extension planned."],
            android: ["yes", "Attach sheet; share intent planned."],
          },
        },
      ],
    },
    {
      id: "notify",
      name: "Notifications",
      description: "The full design is on the Notifications page; this is the support grid.",
      features: [
        {
          name: "OS banners",
          component: "os-notification",
          support: {
            web: [
              "partial",
              "Notification API while a tab is open (one leader tab notifies). Web Push through a service worker reaches you with every tab closed — planned.",
            ],
            mac: [
              "yes",
              "Notification Center, only when the window is unfocused or hidden. Click opens the message (notify_click.rs).",
            ],
            windows: ["yes", "Toast in Action Center; Focus Assist can hold them."],
            linux: ["yes", "freedesktop notifications (libnotify)."],
            ios: ["yes", "APNs; category chat_message with Reply and Mark as read."],
            android: ["yes", "FCM; channel “Messages and alerts”, importance MAX."],
          },
        },
        {
          name: "Reply from the notification",
          support: {
            web: [
              "no",
              "Browser notifications can carry buttons, not a text field. Click opens the thread with the composer focused.",
            ],
            mac: [
              "planned",
              "Needs a native notification action handler beside the Tauri plugin; until then click → composer focused.",
            ],
            windows: ["planned", "Toast with an input box and Send."],
            linux: ["no", "Click → composer focused."],
            ios: [
              "yes",
              "Reply action with text input; sent from the background with client_message_id so a retry can't post twice.",
            ],
            android: ["yes", "Inline reply action, same dedupe."],
          },
        },
        {
          name: "Unread badge outside the app",
          component: "app-badge",
          support: {
            web: ["yes", "Tab title “(3) AntFabric” and a coral dot on the favicon."],
            mac: ["yes", "Dock badge (setBadgeCount). Zero clears it."],
            windows: [
              "partial",
              "Taskbar overlay icon. Not supported by the app today; hidden by Windows when taskbar buttons are small.",
            ],
            linux: ["partial", "Launcher count where the desktop supports it (Unity API); otherwise none."],
            ios: ["yes", "Home-screen icon badge, set by the push payload and by the app."],
            android: ["yes", "Launcher dot / count, launcher-dependent."],
          },
        },
        {
          name: "Sound",
          support: {
            web: [
              "partial",
              "Plays only after the page has had a user gesture, and only from the leader tab.",
            ],
            mac: ["yes", "notification.mp3, at most once every 2.5 s."],
            windows: ["yes", "As macOS."],
            linux: ["yes", "As macOS."],
            ios: ["yes", "OS sound with the push; silenced by the ring switch and Focus."],
            android: ["yes", "Channel sound; the user can change it in system settings."],
          },
        },
        {
          name: "Do not disturb",
          component: "notification-schedule",
          support: {
            web: ["yes", "Our pause menu. Quiet hours are server-side, so they hold on every device."],
            mac: ["yes", "Our pause menu, and macOS Focus is respected by the OS."],
            windows: ["yes", "Our pause menu; Focus Assist is respected by the OS."],
            linux: ["yes", "Our pause menu."],
            ios: [
              "yes",
              "Our pause menu, plus iOS Focus; time-sensitive interruption level only for approvals and meetings starting.",
            ],
            android: ["yes", "Our pause menu, plus system DND."],
          },
        },
      ],
    },
    {
      id: "data",
      name: "Connectivity and data",
      description: "What still works on a train.",
      features: [
        {
          name: "Read while offline",
          component: "connection-banner",
          support: {
            web: [
              "partial",
              "What's already in memory. IndexedDB cache is planned; until then a reload offline shows the offline page.",
            ],
            mac: ["yes", "SQLite message cache (plugin-sql): “Showing what's on this device.”"],
            windows: ["yes", "As macOS."],
            linux: ["yes", "As macOS."],
            ios: ["yes", "Device message cache; channels are offline-first."],
            android: ["yes", "As iOS."],
          },
        },
        {
          name: "Send while offline",
          component: "composer",
          support: {
            web: [
              "no",
              "Refused, draft kept: “You're offline, so this hasn't been sent. It's still here.”",
            ],
            mac: [
              "planned",
              "Today: refused with the draft kept. Planned: an outbound queue that sends on reconnect, each message marked Queued.",
            ],
            windows: ["planned", "As macOS."],
            linux: ["planned", "As macOS."],
            ios: [
              "no",
              "Refused, draft kept (no outbound chat queue today). Recordings ARE queued and retried 3×.",
            ],
            android: ["no", "As iOS."],
          },
        },
        {
          name: "Work in the background",
          support: {
            web: [
              "no",
              "Only while a tab is open; background tabs are throttled, so the socket can lag ~1 min.",
            ],
            mac: ["yes", "Keeps running hidden in the tray/Dock; the recorder keeps recording."],
            windows: ["yes", "As macOS."],
            linux: ["yes", "As macOS."],
            ios: [
              "partial",
              "expo-background-task connector sync, at most every 5 min at the OS's discretion; background audio for recording.",
            ],
            android: ["partial", "As iOS."],
          },
        },
        {
          name: "Several copies open at once",
          support: {
            web: [
              "yes",
              "Many tabs. One becomes leader (Web Locks / BroadcastChannel): it alone plays sound and raises notifications; the others only update counts.",
            ],
            mac: [
              "yes",
              "single-instance: a second launch focuses the first window and hands it any deep link.",
            ],
            windows: ["yes", "As macOS."],
            linux: ["yes", "As macOS."],
            ios: ["no", "One app."],
            android: ["no", "One app."],
          },
        },
      ],
    },
    {
      id: "lifecycle",
      name: "Updates, links and sign-in",
      description: "How each one gets new code, opens a link, and proves who you are.",
      features: [
        {
          name: "Updates",
          component: "update-banner",
          support: {
            web: [
              "yes",
              "Always the latest. A banner offers Reload when a new build is deployed; never forced while you're typing; drafts survive.",
            ],
            mac: ["yes", "Tauri updater: Update available → Downloading → Restart to update. No dismiss."],
            windows: ["yes", "As macOS."],
            linux: [
              "partial",
              "AppImage self-updates; .deb/.rpm update through the package manager — the banner says so.",
            ],
            ios: [
              "yes",
              "OTA (expo-updates) for JS; App Store for native changes. “Restart to apply update.”",
            ],
            android: ["yes", "As iOS, via Play."],
          },
        },
        {
          name: "Deep links",
          support: {
            web: [
              "yes",
              "https://app.antfabric… — every place has a URL. “Open in desktop app” hands it to antfabric://.",
            ],
            mac: [
              "yes",
              "antfabric:// (antfabric-staging:// on staging) through plugin-deep-link; single-instance routes it to the open window.",
            ],
            windows: ["yes", "As macOS (registered on install)."],
            linux: ["yes", "As macOS (.desktop MimeType)."],
            ios: ["yes", "antfabric:// and universal links on /open/…, routed by +native-intent."],
            android: ["yes", "As iOS, App Links."],
          },
        },
        {
          name: "Sign-in and session",
          component: "session-state",
          support: {
            web: ["yes", "Redirect to SSO and back to the same URL."],
            mac: [
              "yes",
              "Opens the system browser for SSO and returns by deep link; sign in to an organisation by name.",
            ],
            windows: ["yes", "As macOS."],
            linux: ["yes", "As macOS."],
            ios: ["yes", "expo-auth-session; Face ID unlock (“Unlock with Face ID” / “Use passcode”)."],
            android: ["yes", "As iOS, with fingerprint/face unlock."],
          },
        },
        {
          name: "Several workspaces",
          component: "workspace-switcher",
          support: {
            web: ["partial", "A switcher menu; each workspace can also live in its own tab."],
            mac: ["yes", "Slack-style column in the rail, a badge per workspace, ⌘1–9."],
            windows: ["yes", "As macOS with Ctrl+1–9."],
            linux: ["yes", "As Windows."],
            ios: ["yes", "Switcher sheet from the header photo; push for every signed-in workspace."],
            android: ["yes", "As iOS."],
          },
        },
      ],
    },
    {
      id: "devices",
      name: "Devices and media",
      description: "Mic, camera, screen and files — and the permission each one needs.",
      features: [
        {
          name: "Recording",
          component: "tray-menu",
          support: {
            web: ["partial", "Mic via getUserMedia while the tab is open and visible."],
            mac: [
              "yes",
              "Tray recorder: Start / Pause / Resume / Stop; menu-bar title shows “Recording 0:12”.",
            ],
            windows: ["yes", "Tray recorder."],
            linux: ["yes", "Tray recorder where a tray exists."],
            ios: ["yes", "Recording tab; background audio permission."],
            android: ["yes", "Recording tab; foreground service notification while recording."],
          },
        },
        {
          name: "Screen sharing",
          support: {
            web: ["yes", "getDisplayMedia; the browser draws its own picker."],
            mac: [
              "yes",
              "Needs Screen Recording permission in System Settings — first use explains it and deep-links there.",
            ],
            windows: ["yes", "No permission needed."],
            linux: ["partial", "PipeWire portal on Wayland; X11 works directly."],
            ios: ["no", "View only."],
            android: ["no", "View only."],
          },
        },
        {
          name: "Downloads",
          support: {
            web: ["yes", "The browser's downloads."],
            mac: ["yes", "Save dialog (plugin-dialog); “Open Recordings Folder” in the tray."],
            windows: ["yes", "As macOS."],
            linux: ["yes", "As macOS."],
            ios: ["yes", "Share sheet → Save to Files."],
            android: ["yes", "Share sheet / Downloads."],
          },
        },
      ],
    },
  ],
} as const;
