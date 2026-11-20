import { ANTFABRIC_MARK } from "../../samples/notifications";
import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "app-badge",
  name: "App badge",
  category: "notifications",
  level: "atom",
  status: "beta",
  description: "The unread count outside the app: the macOS Dock badge, the Windows taskbar overlay, the Linux launcher count, the browser tab title and favicon dot, and the iPhone and Android home-screen badge. One server-owned total, drawn the way each OS draws it.",
  props: {
    appName: {
      type: "string",
      required: true,
      sample: "AntFabric",
      description: "The app's name: the tab's title and what the OS reads the icon as. Its first letter is the icon's mark when there is no `mark`.",
    },
    mark: {
      type: "object",
      sample: ANTFABRIC_MARK,
      description: "The app icon's vector mark (`{ viewBox, paths }`), drawn at the icon's size in the colour the OS draws it in. Left out, the first letter of `appName`.",
    },
    otherTab: {
      type: "string",
      default: "",
      sample: "Release checklist · Docs",
      platforms: ["web"],
      description: "The neighbouring browser tab in the web picture. \"\" draws none.",
    },
    count: {
      type: "number",
      default: 0,
      sample: 3,
      description: "Unread mentions and DMs — the person's whole total, never one window's. 0 clears the badge.",
    },
    dot: {
      type: "boolean",
      default: false,
      description: "Activity without a mention (new messages in channels you follow). Drawn where the OS has a dot; ignored where it only has numbers.",
    },
    mutedAll: {
      type: "boolean",
      default: false,
      description: "Notifications are paused. Counts still show — they are facts, not interruptions — but the activity dot is dropped and, where we draw the badge ourselves, it turns grey.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A drawing of the browser's tab strip: `<div role=\"img\">`, inline styles over `t`, the favicon dot pops in with enter(\"pop\"). What the app sets is document.title (\"(3) AntFabric\") and a canvas-drawn favicon on <link rel=\"icon\">, plus navigator.setAppBadge(n) when installed as an app (Chrome, Edge, Safari web apps).",
      import: "import { AppBadge } from \"@antfabric-ui/react/shell\"",
      notes: [
        "The title count is mentions and DMs; the favicon dot is drawn for any unread. Both update in a background tab — that is when they matter.",
        "Every open tab shows the same number: the count is server-owned and each tab applies the same read-state event.",
        "A pinned tab shows no title at all, so in a pinned tab the favicon dot is the only signal.",
      ],
    },
    desktop: {
      status: "partial",
      base: "A drawing of the macOS Dock, the Windows taskbar or a Linux launcher, picked by usePlatform().os: `<div role=\"img\">`, inline styles over `t`, the badge pops in with enter(\"pop\"). What the app calls is Tauri getCurrentWindow().setBadgeCount() (macOS Dock, Linux launcher), setBadgeLabel() on macOS for \"99+\" and \"•\", setOverlayIcon() on Windows.",
      import: "import { AppBadge } from \"@antfabric-ui/react/shell\"",
      notes: [
        "0 clears the badge with setBadgeCount(undefined) — never setBadgeCount(0), which can leave an empty red dot on macOS (ADR-0354: a badge nobody can clear is never raised).",
        "The count is clamped and NaN-proofed, and written only when it changes, to save an IPC round trip per event.",
        "Needs core:window:allow-set-badge-count in src-tauri/capabilities/default.json; without it the call is refused silently and no badge ever appears.",
        "Gap: Windows is unsupported by setBadgeCount. The overlay is a 16 px icon generated per count (1–9, then 9+) and per theme, passed to setOverlayIcon; until that lands Windows shows no badge.",
        "macOS: the Dock bounce (requestUserAttention) is for a DM or mention only, once, and never while notifications are paused.",
      ],
    },
    mobile: {
      status: "ready",
      base: "A drawing of the home-screen icon: a View with accessibilityRole \"image\", StyleSheet over useTheme() tokens, the wallpaper gradient through experimental_backgroundImage, the badge or dot popping in with <Enter motion=\"pop\">. What the app calls is expo-notifications setBadgeCountAsync; APNs aps.badge set by notification-service keeps the number right while the app is killed.",
      import: "import { AppBadge } from \"@antfabric-ui/react-native/shell\"",
      notes: [
        "iOS draws a number only (no dot); Android launchers draw a dot from the notifications in the tray (Samsung One UI draws the number), and long-press shows \"3 notifications\".",
        "In the catalogue the badge (not the icon) pops in when it first appears and on Replay, as the system badge does when a count arrives.",
        "After a Reply or Mark as read from the notification, the count is re-read (unreadCount → setBadgeCount) so the icon matches what is left.",
      ],
    },
  },
  a11y: {
    role: "img",
    label: "3 unread mentions and direct messages",
    notes: [
      "The OS announces its own badge (VoiceOver reads \"AntFabric, 3 notifications\"). The tab title count is what a screen reader hears when it lists tabs.",
    ],
  },
  examples: [
    {
      name: "macOS Dock",
      os: "mac",
      platforms: ["desktop"],
    },
    {
      name: "Windows taskbar overlay",
      os: "windows",
      platforms: ["desktop"],
    },
    {
      name: "Linux launcher count",
      os: "linux",
      platforms: ["desktop"],
    },
    {
      name: "Browser tab",
      platforms: ["web"],
    },
    {
      name: "iPhone home screen",
      os: "ios",
      platforms: ["mobile"],
    },
    {
      name: "Android launcher dot",
      os: "android",
      platforms: ["mobile"],
    },
    {
      name: "Activity, no mentions",
      props: {
        count: 0,
        dot: true,
      },
    },
    {
      name: "Notifications paused",
      props: {
        mutedAll: true,
      },
    },
  ],
  matrix: [
    {
      prop: "count",
      values: [0, 3, 12, 142],
    },
  ],
  edgeCases: [
    {
      title: "Zero",
      platforms: ["web", "desktop", "mobile"],
      handling: "Zero removes the badge everywhere: setBadgeCount(undefined) on desktop, setBadgeCountAsync(0) on the phone, the bare title \"AntFabric\" and the plain favicon on the web. Never an empty red dot, never \"(0)\".",
      example: {
        name: "Cleared",
        props: {
          count: 0,
        },
      },
    },
    {
      title: "Huge counts",
      platforms: ["web", "desktop", "mobile"],
      handling: "macOS and the tab title read \"99+\" (setBadgeLabel, since setBadgeCount takes only a number); the Windows overlay reads \"9+\" because it is 16 px; iOS and Android are given the real number and draw what they draw.",
      example: {
        name: "142 unread",
        props: {
          count: 142,
        },
      },
    },
    {
      title: "Read on another device, or signed out",
      platforms: ["web", "desktop", "mobile"],
      handling: "One read-state event clears the Dock, the taskbar, every tab's title and the phone's icon; a killed phone is corrected by the next push's aps.badge, or by a silent push when nothing new arrived. Signing out clears the badge first, so the next person never inherits a count.",
    },
    {
      title: "Windows hides it",
      platforms: ["desktop"],
      handling: "Small taskbar buttons (Windows 10) and \"Show badges on taskbar apps\" off (Windows 11) both hide overlay icons, and a pinned-but-closed app has no overlay at all. The toast and Action Center count carry the signal; nothing may rely on the overlay being seen.",
    },
    {
      title: "Linux without a launcher API",
      platforms: ["desktop"],
      handling: "Ubuntu Dock, Dash to Dock and KDE's task manager read the Unity LauncherEntry count; stock GNOME without a dock extension, and most tiling setups, show nothing. The tray icon and notifications are the signal there.",
    },
    {
      title: "Paused notifications",
      platforms: ["web", "desktop", "mobile"],
      handling: "The count of mentions and DMs keeps showing — pausing stops interruptions, it does not hide what is waiting. The activity dot is dropped, and where we draw the badge (Windows overlay, favicon dot, Linux count) it goes grey. The OS-drawn red badges on macOS and iOS cannot change colour, so they stay red.",
      example: {
        name: "Paused, Windows",
        os: "windows",
        platforms: ["desktop"],
        props: {
          mutedAll: true,
        },
      },
    },
    {
      title: "Dark mode and the favicon",
      platforms: ["web", "desktop"],
      handling: "The generated Windows overlay and the canvas favicon are drawn per theme, with a ring in the taskbar or tab-strip colour so the dot reads on light and dark. The favicon listens to prefers-color-scheme, not the app theme, because the browser chrome follows the OS.",
    },
  ],
  related: ["badge", "tray-menu", "os-notification", "notification-schedule"],
  flows: [
    {
      id: "count-and-clear",
      title: "A mention puts a number on the icon, and reading it takes it off",
      description: "The badge is one number the server owns: unread mentions and DMs across the whole inbox. A new one bumps it everywhere AntFabric shows a count, and reading it on any device brings it down.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The count is the server's, not a tally",
          detail: "At sign-in, and again on every reconnect, the app reads the inbox's unread count. That one number is the bell in the top bar and the Dock badge, so the two can't disagree.",
          code: "const [page, unread] = await Promise.all([backend.notifications.list({ pageSize: NOTIFICATION_PAGE_SIZE }), backend.notifications.unreadCount()]); setUnread(unread)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The phone sets the count itself",
          detail: "The push could carry the count as aps.badge, but notification-service's delivery worker sends badge: null today, so a closed app's icon doesn't move on its own. The app sets the badge only after Reply or Mark as read from a notification; a count in every push and a recount when the app comes to the front are gaps the routing design lists.",
          code: "void unreadCount().then(setBadgeCount)  // after a notification action",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "Every tab reads the same count",
          detail: "Each open tab applies the same read-state event to the server's number, so two tabs never show different counts.",
          code: "const { data: unread } = useQuery({ queryKey: ['notifications', 'unread-count'], queryFn: unreadCount })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "A mention arrives",
          lane: "system",
          detail: "Priya mentions you in #platform-eng while AntFabric is in the background. On the desktop the chat event lands about 0.6 s before the notification itself, and whichever arrives first counts it, once.",
        },
        {
          kind: "state",
          title: "The store and the Dock move together",
          detail: "One function writes both, so the bell and the Dock are always the same number.",
          code: "bumpUnread(1)  // → setUnread(n): set({ unread: n }); badge.setCount(n)",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The OS badge is written, only when it changes",
          detail: "Clamped and NaN-proofed, and skipped when the number is the same, which saves an IPC round trip per event. Zero clears with undefined, never 0, which can leave an empty red dot on macOS. Windows has no badge count yet; the taskbar overlay is a gap.",
          code: "ports.apply(safe === 0 ? undefined : safe)  // → getCurrentWindow().setBadgeCount(count)",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The tab title and the favicon change",
          detail: "(1) AntFabric in the title, and a coral dot drawn onto the favicon. Installed as an app, navigator.setAppBadge sets the OS badge too.",
          code: "document.title = count > 0 ? `(${count > 99 ? '99+' : count}) AntFabric` : 'AntFabric'",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The badge pops in",
          detail: "The way the system badge arrives on the Dock and the home screen. A count that only changes its number doesn't pop again.",
          enter: "pop",
        },
        {
          kind: "trigger",
          title: "It's read, on any device",
          detail: "The conversation opened on the phone, Mark as read in the rail, or a click on the banner.",
        },
        {
          kind: "state",
          title: "The count comes down",
          detail: "Reading here moves the count at once and tells the server, whose number every other device reads next. If the server refuses, the row goes back to unread and the count comes back.",
          code: "bumpUnread(-1); void backend.notifications.markRead(id).catch(() => { bumpUnread(1) })",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "A notification action recounts the icon",
          detail: "Reply or Mark as read from the notification dismisses it and sets the badge from the server's unread count. A read on another device doesn't reach the icon until then.",
          code: "dismissNotification(action.identifier); void unreadCount().then(setBadgeCount)",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "Zero clears it everywhere",
          detail: "No empty red dot and no (0): the Dock and home-screen badges go, the tab title is plain AntFabric, and the favicon loses its dot.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {
            count: 0,
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["mobile"],
          props: {
            count: 0,
          },
        },
        {
          step: 2,
          hold: 1300,
          platforms: ["web"],
          props: {
            count: 0,
          },
        },
        {
          step: 7,
          hold: 1600,
          props: {
            count: 1,
          },
        },
        {
          step: 11,
          hold: 1600,
          props: {
            count: 0,
          },
        },
      ],
    },
  ],
};

export default docs;
