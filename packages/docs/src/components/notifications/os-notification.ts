import { OS_NOTIFICATION_ACTIONS, OS_NOTIFICATION_APPROVE, OS_NOTIFICATION_CASES, OS_NOTIFICATION_DECLINE, OS_NOTIFICATION_JOIN, OS_NOTIFICATION_READ } from "../../samples/notifications";
import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "os-notification",
  name: "OS notification",
  category: "notifications",
  level: "molecule",
  status: "beta",
  description: "A notification as the operating system draws it — macOS banner, Windows toast, GNOME card, the browser's own frame, iOS banner and Android heads-up — from one payload. We do not draw these; this spec is what we send, and what the person will see, on every surface.",
  props: {
    appName: {
      type: "string",
      required: true,
      sample: "AntFabric",
      description: "The app's name, which the OS draws in its header (the browser's, Windows', GNOME's, Android's); its first letter is the small mark.",
    },
    origin: {
      type: "string",
      default: "",
      sample: "app.antfabric.com",
      platforms: ["web"],
      description: "The web origin a browser names beside the app. \"\" names none.",
    },
    title: {
      type: "string",
      required: true,
      sample: "Priya Raman",
      description: "The bold line. For chat it is the sender's name; for a meeting or an agent it is the event (\"Design crit starts in 5 min\").",
    },
    body: {
      type: "string",
      default: "",
      sample: "Can someone sanity-check the rollout plan before the 3pm train? Staging is green.",
      description: "The server's bounded preview (140 characters, never the whole message).",
    },
    sender: {
      type: "string",
      default: "",
      sample: "Priya Raman",
      description: "Whose face goes on the banner (iOS/macOS communication notification, Android/Windows/web large icon).",
    },
    avatarSrc: {
      type: "string",
      default: "",
      description: "The sender's photo.",
    },
    identity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red"],
      default: "indigo",
      description: "The colour of the sender's initials when there is no `avatarSrc`. An agent is always drawn as one.",
    },
    context: {
      type: "string",
      default: "",
      sample: "#platform-eng",
      description: "macOS/iOS subtitle, Android sub-text, Windows attribution. Empty for a DM.",
    },
    time: {
      type: "string",
      default: "",
      sample: "now",
    },
    leading: {
      type: "enum",
      options: ["avatar", "tile"],
      default: "avatar",
      description: "avatar is the sender's face. tile is the app's own icon, for an event that has no one to show (a meeting).",
    },
    agent: {
      type: "boolean",
      default: false,
      description: "The sender is an agent: its face, and no badge.",
    },
    lead: {
      type: "string",
      default: "",
      description: "Words before the body: \"Replied in a thread\".",
    },
    actions: {
      type: "array",
      default: [],
      sample: OS_NOTIFICATION_ACTIONS,
      description: "The banner's buttons, at most two: `{ key, label, icon?, reply?, rest? }`. The one with `reply` opens the inline reply and its text comes back with the press (Windows always shows that field). `rest` marks the ones the OS shows before the banner is expanded: Windows always, the browser once expanded; macOS and GNOME show them all when expanded, and iOS lists them in the long-press menu with their `icon`.",
    },
    preview: {
      type: "boolean",
      default: true,
      description: "false is the person's \"Hide message previews\" setting: the server sends \"New message\" and no body, sender or channel.",
    },
    grouped: {
      type: "number",
      default: 0,
      description: "How many more are stacked under this one from the same conversation (iOS threadIdentifier, Android group, Windows group, web tag).",
    },
    expanded: {
      type: "boolean",
      default: false,
      description: "The state the OS reveals the actions in: hover on macOS, long-press on iOS, the expand chevron on Android and GNOME, the notification centre on the web.",
    },
    reply: {
      type: "enum",
      options: ["none", "typing", "sending", "failed"],
      default: "none",
      description: "An inline reply typed into the notification itself.",
    },
    replyText: {
      type: "string",
      default: "",
      description: "What the person has typed into the inline reply.",
    },
    onOpen: {
      type: "event",
    },
    onClose: {
      type: "event",
      platforms: ["web", "desktop"],
      description: "The banner's close button: the Mac's (drawn once the banner is expanded) and the × on Windows, Linux and the browser.",
    },
    onSettings: {
      type: "event",
      platforms: ["desktop"],
      description: "Windows: the ⋯ button, the app's notification settings.",
    },
    onAction: {
      type: "event",
      args: "action: OsNotificationAction, text?: string",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A drawing of Chrome's own notification frame: a `<button>` for the banner and one per action, inline styles over `t`, the face from Avatar, hover and focus from useInteraction, rising in with enter(\"rise\"). What the app uses is the Web Notifications API — ServiceWorkerRegistration.showNotification() for pushes (Push API + VAPID), new Notification() only while a tab is open — and the browser draws it.",
      import: "import { OsNotification } from \"@antfabric/ui-react/shell\"",
      notes: [
        "Chrome, Edge and Safari on macOS and Windows hand the notification to the OS, so there it looks like the macOS banner or Windows toast with the browser's icon and \"app.antfabric.com\" underneath. This frame is what Chrome draws itself (Linux, ChromeOS, and macOS with native notifications off).",
        "No inline reply: `actions` with type 'text' is not supported in any shipping browser. Action buttons (max 2) work only on Chromium-based browsers with a service worker; Safari and Firefox show the body and nothing else, so a click that opens the right conversation is the whole contract.",
        "`tag` is the channel id and `renotify: true` — a burst in #platform-eng replaces one banner instead of stacking six; `data` carries ids only, never the preview.",
        "Never asked for on page load: see Permission prompt. Without permission, the tab title count and favicon dot (App badge) are the only signal.",
        "Pressing the notification toggles `expanded` (Chrome's action buttons fade in); it rises in from the bottom-right corner, where Chrome draws its own.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "Activates the focused banner — the browser and OS own focus here, not the page",
        },
      ],
    },
    desktop: {
      status: "partial",
      base: "A drawing of the macOS banner, the Windows toast or the GNOME card, picked by usePlatform().os: `<button>`s for the banner, close and actions, an `<input data-af-input>` for the inline reply, inline styles over `t`, the face from Avatar, hover and focus from useInteraction, Liquid Glass through glass() on macOS 26, sliding in with enter(\"slide-left\"). What the app calls is the Tauri `notify_show` command → UNUserNotificationCenter on macOS (src-tauri/src/notify_click.rs), and tauri-plugin-notification (WinRT toast on Windows, notify-rust / libnotify on Linux) elsewhere.",
      import: "import { OsNotification } from \"@antfabric/ui-react/shell\"",
      notes: [
        "Raised only when the window is NOT focused (shouldToast) — so it is also what reaches you when AntFabric is closed to the tray. The rail entry is written either way.",
        "Today the title is one line, \"Priya Raman · #platform-eng\"; this spec splits it — sender is the title, the channel is the macOS subtitle / Windows attribution — so the name is never the part that truncates.",
        "macOS: the request identifier IS the notification id, so a re-post replaces rather than duplicates, and a click returns that id through `notification:open` to the same openNotification the rail row runs.",
        "Gap: no desktop banner has actions today. macOS needs a UNNotificationCategory `chat_message` with a UNTextInputNotificationAction `reply` and an action `mark_read` — the same identifiers the phone uses — handled in did_receive_response.",
        "Gap: Windows and Linux go through tauri-plugin-notification, which has no click or action callback on desktop at any layer. Clicks, Reply and Mark as read need a WinRT ToastNotification activation handler (with an AUMID and a Start-menu shortcut) and notify-rust's wait_for_action on Linux.",
        "The OS banner carries the OS sound; the in-app sound is throttled to one per 2.5 s on top of it (SOUND_THROTTLE_MS).",
        "macOS 26+ (Tahoe): banners are Liquid Glass, drawn by macOS. macOS 15 and earlier: the vibrancy blur card. Windows and Linux are unchanged.",
        "In the catalogue, pressing a banner toggles `expanded` — the body opens to eight lines and, on macOS and GNOME, the actions fade in (Windows always shows them). Reply opens the inline reply field and Send fires onAction(reply, text). Banners slide in from the right edge of the screen.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "macOS: with VoiceOver on the banner, opens it",
        },
      ],
    },
    mobile: {
      status: "partial",
      base: "A drawing of the iOS banner (with its long-press menu) or the Android heads-up, picked by useTheme().os: Pressables for the banner and actions, a TextInput for the inline reply, StyleSheet over useTheme() tokens in the system face, the face from Avatar, GlassSurface on iOS 26, dropping in with <Enter motion=\"drop\">. What the app uses is expo-notifications — APNs / FCM push from notification-service, category `chat_message` (Reply with text input, Mark as read), Android channel `default` = \"Messages and alerts\", importance MAX, lock-screen PUBLIC.",
      import: "import { OsNotification } from \"@antfabric/ui-react-native/shell\"",
      notes: [
        "Both actions are `opensAppToForeground: false`: iOS wakes the app in the background, Android runs the headless task `antfabric-notification-action` even with the app killed (services/notificationActions.ts).",
        "The payload is ids and a destination only; the title and body are the server's words, drawn and discarded. Nothing quotable is written to `content.data`, which the OS keeps.",
        "Gap: the sender's face needs a Notification Service Extension donating an INSendMessageIntent on iOS (communication notification), and a native module for Android's MessagingStyle / large icon — expo-notifications can set neither per notification. Until then iOS shows the app icon and Android shows no large icon.",
        "Android action labels are drawn as written (\"Reply\", \"Mark as read\") from Android 12; Android 7–11 upper-cases them (REPLY, MARK AS READ).",
        "Today's Profile switch still says \"Notifications don't show content. Open the app to see it\" — no longer true since banners carry the server's words (2026-09-15). That subtitle needs rewriting.",
        "iOS 26+: notifications and the lock screen are Liquid Glass — drawn by iOS, so the app has nothing to build; this preview shows what people will see. iOS 18 and earlier: the blur card.",
        "Pressing the banner toggles `expanded`: on iOS the long-press menu pops in under it, on Android the chevron flips and the body opens. Reply opens the inline reply field. Both drop in from the top.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens the conversation, thread, meeting or approval",
        },
        {
          gesture: "Long-press (iOS) / expand chevron or two-finger pull (Android)",
          action: "Reveals Reply and Mark as read",
        },
        {
          gesture: "Swipe away",
          action: "Dismisses this banner only; the inbox row stays unread",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "The OS reads it: VoiceOver and Narrator speak title, subtitle and body, so the title must make sense alone (\"Priya Raman\", not \"New\").",
      "The face is decoration; who sent it is always in the words.",
      "Every action label is a verb that works out of context: \"Reply\", \"Mark as read\", \"Join\", \"Approve\".",
    ],
  },
  examples: [
    {
      name: "macOS banner",
      os: "mac",
      platforms: ["desktop"],
    },
    {
      name: "macOS, hovered",
      description: "Hover shows the close button and the actions.",
      os: "mac",
      platforms: ["desktop"],
      props: {
        expanded: true,
      },
    },
    {
      name: "macOS, replying",
      os: "mac",
      platforms: ["desktop"],
      props: {
        title: "Marcus Chen",
        sender: "Marcus Chen",
        context: "",
        body: "Are we still pairing on the cache bug at 2?",
        reply: "typing",
        replyText: "Yes — I'll grab a room",
      },
    },
    {
      name: "macOS, reply failed",
      description: "The reply could not be sent: the banner says so and keeps the draft.",
      os: "mac",
      platforms: ["desktop"],
      props: {
        title: "Marcus Chen",
        sender: "Marcus Chen",
        context: "",
        body: "Are we still pairing on the cache bug at 2?",
        reply: "failed",
        replyText: "Yes — I'll grab a room",
      },
    },
    {
      name: "Windows toast",
      description: "Inline reply box and Send are always there on a Windows toast.",
      os: "windows",
      platforms: ["desktop"],
    },
    {
      name: "Linux (GNOME)",
      os: "linux",
      platforms: ["desktop"],
      props: {
        expanded: true,
      },
    },
    {
      name: "Web (Chrome)",
      platforms: ["web"],
    },
    {
      name: "Web, with actions",
      description: "Chromium only, via the service worker.",
      platforms: ["web"],
      props: {
        expanded: true,
      },
    },
    {
      name: "iOS banner",
      os: "ios",
      platforms: ["mobile"],
    },
    {
      name: "iOS long-press",
      os: "ios",
      platforms: ["mobile"],
      props: {
        expanded: true,
      },
    },
    {
      name: "iOS, stacked",
      description: "Three more from #platform-eng sit under this one; the slivers are the banners behind it.",
      os: "ios",
      platforms: ["mobile"],
      props: {
        grouped: 3,
      },
    },
    {
      name: "Android heads-up",
      os: "android",
      platforms: ["mobile"],
    },
    {
      name: "Android inline reply",
      os: "android",
      platforms: ["mobile"],
      props: {
        reply: "typing",
        replyText: "On it, checking staging now",
      },
    },
    {
      name: "Direct message",
      props: {
        title: "Marcus Chen",
        sender: "Marcus Chen",
        context: "",
        body: "Are we still pairing on the cache bug at 2?",
      },
    },
    {
      name: "Thread reply",
      props: {
        lead: "Replied in a thread",
        title: "Aisha Bello",
        sender: "Aisha Bello",
        context: "#design-crit",
        body: "Agree on the spacing — I pushed a new frame.",
      },
    },
    {
      name: "Meeting starting",
      props: {
        leading: "tile",
        actions: [OS_NOTIFICATION_JOIN],
        title: "Design crit starts in 5 min",
        sender: "",
        context: "#design-crit",
        body: "Huddle room 2 · 6 going",
      },
    },
    {
      name: "Agent finished",
      props: {
        agent: true,
        actions: [OS_NOTIFICATION_READ],
        title: "Fabric finished: Draft the v0.42 release notes",
        sender: "Fabric",
        context: "#release-train",
        body: "12 changes summarised. Ready for your review.",
      },
    },
    {
      name: "Agent needs approval",
      props: {
        agent: true,
        actions: [OS_NOTIFICATION_APPROVE, OS_NOTIFICATION_DECLINE],
        title: "Fabric needs your approval",
        sender: "Fabric",
        context: "#release-train",
        body: "Post the v0.42 release notes to #release-train?",
        expanded: true,
      },
    },
  ],
  matrix: [
    {
      prop: "kind",
      cases: OS_NOTIFICATION_CASES,
    },
  ],
  edgeCases: [
    {
      title: "Previews hidden (our setting or the lock screen)",
      platforms: ["web", "desktop", "mobile"],
      handling: "With \"Hide message previews\" on, the server sends \"New message\" with no body, sender or channel — on every device, because the setting is the person's, not the phone's. Separately, iOS \"Show Previews: When Unlocked\" and Android's lock-screen visibility hide our text on a locked device; we never work around either. Grouping still works because the thread id is not text.",
      example: {
        name: "Previews off",
        os: "ios",
        props: {
          preview: false,
        },
      },
    },
    {
      title: "A burst from one conversation",
      platforms: ["web", "desktop", "mobile"],
      handling: "One conversation is one stack: iOS threadIdentifier and Android setGroup are the channel id, with a summary (\"+3 more from #platform-eng\"); macOS threadIdentifier the same; Windows Group = channel, Tag = notification id; the web `tag` = channel id so the browser replaces rather than stacks. The sound plays once per 2.5 s however many arrive.",
      example: {
        name: "Grouped",
        os: "mac",
        platforms: ["desktop"],
        props: {
          grouped: 3,
        },
      },
    },
    {
      title: "Reply sent from the notification",
      platforms: ["desktop", "mobile"],
      handling: "Each reply carries a fresh client_message_id so a retry de-duplicates upstream, and a press is remembered per (notification, action) so Android delivering it to both the listener and the headless task sends once. Success marks the conversation read, removes the notification and updates the badge. Failure leaves the notification where it is with \"Your reply wasn’t sent. Open AntFabric to send it.\" — silently dismissing it would read as sent. An empty reply is not sent.",
      example: {
        name: "Reply failed",
        os: "android",
        platforms: ["mobile"],
        props: {
          reply: "failed",
          replyText: "On it",
        },
      },
    },
    {
      title: "Sending the reply",
      platforms: ["desktop", "mobile"],
      handling: "The field locks and the send button spins until the server answers; on a phone with no session yet (a cold background launch) the session is restored first. Nothing is queued: offline, the reply fails and stays in the tray.",
      example: {
        name: "Sending",
        os: "mac",
        platforms: ["desktop"],
        props: {
          reply: "sending",
          replyText: "Looks good, ship it",
            title: "Marcus Chen",
          sender: "Marcus Chen",
          context: "",
        },
      },
    },
    {
      title: "The message was deleted before the tap",
      platforms: ["web", "desktop", "mobile"],
      handling: "A delete retracts the notification (a silent push / socket event removes it from the tray and Notification Center by id). If the tap wins the race, the conversation opens at the place the message was, which reads \"This message was deleted\" — never an error screen.",
    },
    {
      title: "The destination has no screen on this device",
      platforms: ["mobile"],
      handling: "Agent approvals, agent runs, work items and projects have no phone screen yet. The tap opens nothing and shows a toast with the app's existing sentence, e.g. \"Agent approvals are not available on the phone yet.\" The notification stays unread so it is still waiting on desktop. The phone deliberately does not say \"Open this on desktop\" today (it would be a claim about another app) — that wording is the owner's call.",
    },
    {
      title: "Read somewhere else",
      platforms: ["web", "desktop", "mobile"],
      handling: "Reading the conversation on any device retracts the banner everywhere: dismissNotificationAsync on the phone (driven by a silent push), removeDeliveredNotifications(withIdentifiers:) on macOS, ToastNotificationHistory.Remove(tag, group) on Windows, registration.getNotifications({ tag }) → close() on the web. A stale banner is a lie about what needs you.",
    },
    {
      title: "Focus, Do Not Disturb and paused notifications",
      platforms: ["web", "desktop", "mobile"],
      handling: "The OS decides: macOS/iOS Focus, Windows Do not disturb / Focus Assist and Android DND hold banners silently in the notification centre. Meetings starting and approvals are sent as time-sensitive (iOS interruptionLevel timeSensitive, Android category CALL/REMINDER) so a person can let them through. When the person pauses notifications in AntFabric, the server sends nothing at all — see Notification schedule.",
    },
    {
      title: "Approve from a locked phone",
      platforms: ["mobile"],
      handling: "Approve and Decline are registered with authenticationRequired (iOS) / setAuthenticationRequired (Android 12+), so Face ID or the passcode runs before the action does. Reply and Mark as read do not need it.",
      example: {
        name: "Approval, long-pressed",
        os: "ios",
        platforms: ["mobile"],
        props: {
          agent: true,
          actions: [OS_NOTIFICATION_APPROVE, OS_NOTIFICATION_DECLINE],
          title: "Fabric needs your approval",
          sender: "Fabric",
          context: "#release-train",
          body: "Post the v0.42 release notes to #release-train?",
          expanded: true,
        },
      },
    },
    {
      title: "Window hidden in the tray, tab in the background, app killed",
      platforms: ["web", "desktop", "mobile"],
      handling: "Desktop: closing the window hides it, the socket stays up, document.hasFocus() is false, so the banner goes out (ADR-0379); clicking it reveals the window. Web: a background tab can raise one while it is open; with every tab closed only a Push API subscription can, and only while the browser itself runs. Mobile: APNs/FCM deliver with the app killed, and a cold-start tap is read once from getLastNotificationResponseAsync and then cleared, so it never replays.",
    },
    {
      title: "Windows: small taskbar buttons and badges",
      platforms: ["desktop"],
      handling: "With small taskbar buttons (Windows 10) or taskbar badges switched off (Windows 11) the overlay badge is not drawn at all, so the toast and the Action Center count are the only signal. Nothing here may depend on the badge being seen — see App badge.",
      example: {
        name: "Windows, meeting",
        os: "windows",
        platforms: ["desktop"],
        props: {
          leading: "tile",
          actions: [OS_NOTIFICATION_JOIN],
          title: "Design crit starts in 5 min",
          sender: "",
          context: "#design-crit",
          body: "Huddle room 2 · 6 going",
        },
      },
    },
    {
      title: "Long text, emoji and right-to-left names",
      platforms: ["web", "desktop", "mobile"],
      handling: "The server caps the preview at 140 characters and strips markdown; the OS truncates from there. A name in Arabic or Hebrew is sent as written and the OS lays it out right-to-left; we never pad or reorder it.",
      example: {
        name: "RTL sender",
        os: "android",
        platforms: ["mobile"],
        props: {
          title: "نور الهدى",
          sender: "نور الهدى",
          context: "#design-crit",
          body: "أرسلت الملفات الجديدة 🎨 — هل يمكنك مراجعتها قبل الاجتماع؟",
        },
      },
    },
    {
      title: "Liquid Glass and earlier iOS / macOS",
      platforms: ["mobile", "desktop"],
      handling: "The OS draws these, so the version on the device decides: Liquid Glass on iOS 26+ and macOS 26+, the blur card before. Pick either version in the catalogue's top bar to compare. Windows, Linux, Android and the browser never change.",
    },
    {
      title: "The device's Liquid Glass settings",
      platforms: ["mobile", "desktop"],
      handling: "iOS and macOS draw these banners, so the person's own settings apply with no work from us: Clear or Tinted (iOS 26.1+ / macOS 26.1+), Reduce Transparency (frosted, nearly opaque) and Increase Contrast (a contrasting edge). This happens live as the person changes the setting.",
    },
  ],
  related: [
    "in-app-banner",
    "notification-item",
    "permission-prompt",
    "app-badge",
    "notification-schedule",
  ],
  flows: [
    {
      id: "banner-to-message",
      title: "A mention while you're away raises a banner, and a click lands on the message",
      description: "The OS draws the banner; AntFabric decides whether to send one and what a click does. The click goes to the same place the feed row does, so the banner and the rail can never disagree.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The socket hands every event to the notification feed",
          detail: "A chat message addressed to you is announced from the live chat event; the server's notification for it lands about 0.6 s later carrying the row id. Whichever arrives first announces it, and only once.",
          code: "realtime.onEvent((subject, envelope) => { …; notifyRef.current(subject, envelope) })  // → applyNotification",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "A push from notification-service, or the socket while the app is open",
          detail: "In the background, APNs or FCM delivers the server's push: ids and a destination, with the title and body to draw. While the app is open, the notification socket hands the frame to routeNotification, which raises the same banner on the phone.",
          code: "sinks.banner({ notificationId: payload.notificationId, type: payload.type, destination }, notificationText(payload, people))",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "A Web Push reaches the service worker",
          detail: "With every tab closed, or from the one leader tab when some are open. data carries ids only, and tag is the channel, so a burst in #platform-eng replaces one banner instead of stacking six.",
          code: "self.registration.showNotification(title, { body, tag: channelId, renotify: true, data: { notificationId } })",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "Only an unfocused window raises one",
          detail: "The rail entry is written either way; a focused window gets the in-app cue instead. A window closed to the tray isn't focused, so this is also what reaches you with AntFabric closed. Nothing is decided until the saved preferences have loaded.",
          code: "if (!ctx.prefsResolved) return false; if (!ctx.notificationsEnabled) return false; return !ctx.windowFocused",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The banner is posted with the row's id",
          detail: "On macOS it goes through UNUserNotificationCenter with the identifier antfabric:notification:<id>, so a re-post replaces rather than stacks and the click can say which row. Windows and Linux use tauri-plugin-notification, which has no click callback yet.",
          code: "notifier.toast(entry.title, entry.snippet, routeIdOf(entry))  // → invoke('notify_show', { title, body, notificationId })",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The OS shows it, even in the foreground",
          detail: "Every notification may show as a banner, with sound and the badge. On Android it goes to the Messages and alerts channel at maximum importance, so it peeks over whatever is on screen.",
          code: "handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true })",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "It slides in from the right edge",
          detail: "macOS, Windows and GNOME draw the banner themselves; this is how it arrives. The Dock badge goes up at the same moment.",
          enter: "slide-left",
          platforms: ["desktop"],
        },
        {
          kind: "motion",
          title: "It rises in at the bottom right",
          detail: "Where Chrome draws its own. Chrome, Edge and Safari on macOS and Windows hand it to the OS, so there it slides in like a desktop banner. The tab title count goes up too.",
          enter: "rise",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "It drops in from the top",
          detail: "The home-screen badge goes up as it arrives.",
          enter: "drop",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "The banner is clicked",
          detail: "On the body, not Close or an action. On the desktop this routes on macOS today; a Windows or Linux banner can't be clicked through yet. On the phone, a tap.",
        },
        {
          kind: "event",
          title: "onOpen() fires",
          detail: "Only the default action counts. Swiping the banner away arrives as a dismiss and opens nothing.",
          code: "onOpen?.()  // macOS: did_receive_response → opened(route_from_identifier(&identifier))",
        },
        {
          kind: "effect",
          title: "The window comes forward and the route is followed",
          detail: "The window is revealed first, then the id goes to the renderer. A click that launched the app is kept until the renderer can take it, and a row that hasn't loaded yet is retried after the next inbox read.",
          code: "listen('notification:open', (e) => open.current(notificationIdFrom(e.payload)))  // → openNotificationRoute(route)",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The tap opens its destination",
          detail: "A tap that launched the app is read once sign-in has restored. The row is marked read, the destination is looked up by id when the push carried none, and the router goes there.",
          code: "addOpenListener((data) => { clearLastNotificationResponse(); void open({ ...data, id: idOf(data), resolveById: true }) })",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "The service worker focuses a tab and routes it",
          detail: "The desktop app's browser fallback already does the in-tab half: window.focus(), close the notification, and dispatch the same open event.",
          code: "self.addEventListener('notificationclick', (e) => e.waitUntil(focusOrOpen(`/n/${e.notification.data.notificationId}`)))",
          platforms: ["web"],
        },
        {
          kind: "result",
          title: "The conversation, at the message",
          detail: "Marked read, the rail out of the way, the message highlighted, and the Dock badge one lower. On the phone the channel opens at focusMessageId.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 480,
              height: 300,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 2,
                },
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
              width: 480,
              height: 300,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 3,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  right: 12,
                  top: 12,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 9,
          press: "Priya Raman, #platform-eng: Can someone sanity-check the rollout plan before the 3pm train? Staging is green.",
          hold: 900,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 480,
              height: 300,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 3,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  right: 12,
                  top: 12,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 14,
          hold: 1600,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 480,
              height: 300,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 2,
                },
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1300,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 480,
              height: 300,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  top: 0,
                },
                props: {
                  count: 2,
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1700,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 480,
              height: 300,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  top: 0,
                },
                props: {
                  count: 3,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 9,
          press: "Priya Raman, #platform-eng: Can someone sanity-check the rollout plan before the 3pm train? Staging is green.",
          hold: 900,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 480,
              height: 300,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  top: 0,
                },
                props: {
                  count: 3,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 14,
          hold: 1600,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 480,
              height: 300,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  top: 0,
                },
                props: {
                  count: 2,
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 2,
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 3,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  left: 7,
                  top: 10,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 9,
          press: "Priya Raman, #platform-eng: Can someone sanity-check the rollout plan before the 3pm train? Staging is green.",
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 3,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  left: 7,
                  top: 10,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 14,
          hold: 1600,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 2,
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "reply-from-the-notification",
      title: "Reply to a mention from the notification itself",
      description: "Reply and Mark as read run without opening AntFabric, even when the app has been closed. The reply goes into the conversation, the notification is cleared, and the badge recounts.",
      platforms: ["mobile"],
      steps: [
        {
          kind: "data",
          title: "Chat notifications carry Reply and Mark as read",
          detail: "One category, chat_message, registered at startup: Reply with a text field, and Mark as read. Neither brings the app to the front.",
          code: "registerChatActions()  // category 'chat_message': actions 'reply' (text input), 'mark_read'",
        },
        {
          kind: "trigger",
          title: "The banner is long-pressed, or pulled open",
          detail: "iPhone opens a menu under the banner; Android opens the body with the actions beneath it.",
        },
        {
          kind: "motion",
          title: "The actions appear",
          detail: "On iPhone the menu pops in under the banner. On Android the chevron flips and the body opens.",
          enter: "pop",
        },
        {
          kind: "trigger",
          title: "Reply is pressed, and a reply typed",
          detail: "The OS draws the text field. Here: On it, checking staging now.",
        },
        {
          kind: "event",
          title: "onAction(reply, text) fires",
          detail: "The action's id and what was typed. Mark as read fires onAction(read) the same way.",
          code: "onAction?.({ key: 'reply', label: 'Reply', reply: true }, 'On it, checking staging now')",
        },
        {
          kind: "effect",
          title: "The reply is sent without opening the app",
          detail: "iPhone wakes the app in the background; Android runs the headless task antfabric-notification-action even if the app was closed. With no session in memory it restores one first. Each reply gets a fresh client id, so a retry can't post twice.",
          code: "if (parentMessageId !== null) await postReply(parentMessageId, action.text, randomUUID()); else await postMessage(channelId, action.text, [], [], randomUUID())",
        },
        {
          kind: "state",
          title: "Read on the server, and the badge recounted",
          code: "await markChannelRead(channelId, messageId); await markNotificationRead(notificationId); dismissNotification(action.identifier); void unreadCount().then(setBadgeCount)",
        },
        {
          kind: "result",
          title: "The notification goes, and the reply is in #platform-eng",
          detail: "Removed from the tray and Notification Center, and the icon's count is one lower. This spec adds the failure line, Your reply wasn't sent. Open AntFabric to send it.; today a failed reply is only left to be tried again.",
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
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 1,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  left: 7,
                  top: 10,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1500,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 1,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  left: 7,
                  top: 10,
                },
                props: {
                  expanded: true,
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: "Reply",
          hold: 900,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 1,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  left: 7,
                  top: 10,
                },
                props: {
                  expanded: true,
                },
              },
            ],
          },
        },
        {
          step: 4,
          press: "Send",
          hold: 1100,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 1,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  left: 7,
                  top: 10,
                },
                props: {
                  reply: "typing",
                  replyText: "On it, checking staging now",
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1500,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 1,
                },
              },
              {
                el: "component",
                use: "os-notification",
                style: {
                  position: "absolute",
                  left: 7,
                  top: 10,
                },
                props: {
                  reply: "sending",
                  replyText: "On it, checking staging now",
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 420,
              bg: "$os.wallpaper",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "app-badge",
                style: {
                  position: "absolute",
                  alignSelf: "center",
                  bottom: 16,
                },
                props: {
                  count: 0,
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
