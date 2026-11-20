export const notifications = {
  $description: "How AntFabric reaches someone who isn't looking, on every surface each platform offers. The components that draw each surface live under components/notifications/; this file is the system around them.",
  principles: [
    {
      title: "One notification, one place",
      body: "The server decides who gets told, and on which ONE device first. Being told the same thing on the laptop, the browser tab and the phone at once is the most common complaint about chat apps, and the easiest to design out.",
    },
    {
      title: "Never tell me what I'm looking at",
      body: "If the conversation is on screen in a focused window, there is no banner and no sound — the message just arrives. Today the mobile app still raises a banner for the open channel; this spec removes it.",
    },
    {
      title: "Read anywhere clears everywhere",
      body: "Reading on any device retracts delivered notifications on the others and recounts every badge: Dock, taskbar, tab title, favicon, home-screen icon.",
    },
    {
      title: "Coral is for you",
      body: "Mentions, DMs and approvals an agent is waiting on are coral and counted. Everything else is a dot, or nothing.",
    },
    {
      title: "Payloads carry ids, not content",
      body: "As the mobile app already does: the push carries ids and a destination, and the device composes the text from its own data. Lock-screen previews can be turned off, and nothing sensitive sits in APNs/FCM logs.",
    },
  ],
  surfaces: [
    {
      id: "os",
      name: "OS banner",
      component: "os-notification",
      web: "Notification API from the leader tab; Web Push when every tab is closed (planned)",
      desktop: "Notification Center / Action Center / libnotify, only when the window is unfocused or hidden",
      mobile: "APNs / FCM push, with Reply and Mark as read",
    },
    {
      id: "in-app",
      name: "In-app banner",
      component: "in-app-banner",
      web: "A card in the top-right of the page",
      desktop: "A card in the top-right of the window",
      mobile: "A banner below the status bar; swipe up to dismiss",
    },
    {
      id: "feed",
      name: "Activity feed",
      component: "notification-item",
      web: "The notification rail",
      desktop: "The notification rail (All / DMs / Mentions)",
      mobile: "The Notifications screen (swipe: Mark read / Clear)",
    },
    {
      id: "badge",
      name: "Badge",
      component: "app-badge",
      web: "“(3) AntFabric” in the tab title, a dot on the favicon",
      desktop: "Dock badge; Windows taskbar overlay",
      mobile: "Home-screen icon badge",
    },
    {
      id: "sound",
      name: "Sound",
      web: "Only after a user gesture, leader tab only",
      desktop: "notification.mp3, at most once per 2.5 s",
      mobile: "OS sound with the push",
    },
    {
      id: "email",
      name: "Email digest",
      web: "Unread mentions and DMs after 15 min (or hourly) of inactivity everywhere",
      desktop: "Same — it's server-side",
      mobile: "Same",
    },
  ],
  routing: [
    {
      when: "The conversation is on screen in a focused window or the open app",
      then: "Nothing intrusive. No banner, no sound. Mark read as it scrolls into view.",
      surfaces: [],
    },
    {
      when: "The app is focused but you're somewhere else in it",
      then: "In-app banner (suppressed for the conversation on screen), feed entry, badge. No OS banner.",
      surfaces: ["in-app", "feed", "badge"],
    },
    {
      when: "The desktop window is unfocused, minimised or hidden in the tray",
      then: "OS banner, sound (throttled), Dock/taskbar badge, feed entry.",
      surfaces: ["os", "sound", "badge", "feed"],
    },
    {
      when: "Only a browser tab is open, in the background",
      then: "The leader tab raises a browser notification and plays the sound; every tab updates its title count and favicon.",
      surfaces: ["os", "sound", "badge"],
    },
    {
      when: "You were active on desktop or web in the last 2 minutes",
      then: "The phone push is HELD. If it's still unread after your chosen delay (immediately / 2 / 5 / 10 min, default 2), the phone gets it then; if you read it on the computer, the phone never buzzes.",
      surfaces: ["os"],
    },
    {
      when: "No device is active",
      then: "Push to every signed-in phone; desktop banner if the app is running; email digest later if still unread.",
      surfaces: ["os", "badge", "email"],
    },
    {
      when: "Paused, quiet hours, or OS Focus",
      then: "Feed and badge update silently. No banner, no sound. A DM sender can choose “Notify anyway” for something urgent; approvals and a meeting you're in that starts now use the time-sensitive level.",
      surfaces: ["feed", "badge"],
    },
    {
      when: "Read on any device",
      then: "Retract the delivered notification everywhere else (silent push on mobile, close() on web, remove on desktop) and recount every badge.",
      surfaces: [],
    },
  ],
  kinds: [
    {
      kind: "Direct message",
      default: "Notify",
      banner: true,
      sound: true,
      actions: "Reply · Mark as read",
      group: "Per conversation",
    },
    {
      kind: "@mention",
      default: "Notify",
      banner: true,
      sound: true,
      actions: "Reply · Mark as read",
      group: "Per channel",
    },
    {
      kind: "Reply in a followed thread",
      default: "Notify",
      banner: true,
      sound: false,
      actions: "Reply · Mark as read",
      group: "Per thread",
    },
    {
      kind: "@here / @channel",
      default: "Notify (suppressed while paused)",
      banner: true,
      sound: false,
      actions: "Mark as read",
      group: "Per channel",
    },
    {
      kind: "Channel message (level: Every message)",
      default: "Badge only",
      banner: false,
      sound: false,
      actions: "—",
      group: "Per channel",
    },
    {
      kind: "Reaction to your message",
      default: "Feed only",
      banner: false,
      sound: false,
      actions: "—",
      group: "Per message",
    },
    {
      kind: "Meeting starting",
      default: "Notify, 1 min before",
      banner: true,
      sound: true,
      actions: "Join · Dismiss",
      group: "Per meeting",
    },
    {
      kind: "Recording ready / minutes written",
      default: "Feed + badge",
      banner: false,
      sound: false,
      actions: "Open",
      group: "Per meeting",
    },
    {
      kind: "Agent finished a task you started",
      default: "Banner only if you left the conversation",
      banner: true,
      sound: false,
      actions: "Open",
      group: "Per agent run",
    },
    {
      kind: "Agent needs your approval",
      default: "Always notify (time-sensitive)",
      banner: true,
      sound: true,
      actions: "Approve · Decline · Open",
      group: "Per agent run",
    },
  ],
  permission: [
    {
      platform: "web",
      steps: [
        "Never prompt on page load — browsers penalise it and people say no.",
        "After the first mention or DM arrives while the tab is in the background, show the soft-ask banner: “Get notified when someone needs you.”",
        "“Turn on” calls Notification.requestPermission() inside that click (a user gesture is required).",
        "Denied is sticky per origin: the banner turns into instructions — the lock icon in the address bar → Notifications → Allow.",
        "Unsupported (some in-app browsers, older iOS Safari outside a home-screen web app): say so once, then rely on the badge and email.",
      ],
    },
    {
      platform: "desktop",
      steps: [
        "macOS asks on the first notification the app sends; we send a harmless “You're all set” after sign-in so the prompt appears while the person is looking.",
        "Denied: Settings → Notifications shows “Notifications are off for AntFabric in System Settings” with an Open System Settings button.",
        "Windows allows by default; Focus Assist and per-app toggles can hide them — the same Settings row reads the state.",
        "Linux: no permission model; if no notification daemon answers, fall back to the in-app banner.",
      ],
    },
    {
      platform: "mobile",
      steps: [
        "iOS asks once and only once. Show the soft-ask screen first, then the system prompt; offer “Not now” that keeps provisional (quiet) delivery available.",
        "Android 13+: POST_NOTIFICATIONS at runtime; denied twice is permanent → deep link to system settings.",
        "Ask when the notification socket first connects, never again on returning to the foreground (re-asking there looped 59 times in the current app).",
        "Settings → Push notifications shows granted / ask / open settings (nextPushStep), as today.",
      ],
    },
  ],
  edgeCases: [
    {
      title: "Notification for a message deleted before the tap",
      handling: "Open the conversation at that point and toast “This message was deleted.” Retract the notification when the delete event arrives, if it hasn't been tapped.",
    },
    {
      title: "Tap routes somewhere this device can't open",
      handling: "Work items, projects and agent runs aren't on the phone yet: toast “Open this on the desktop app” and land on the inbox, as the app does today.",
    },
    {
      title: "Reply from the notification fails",
      handling: "Leave the notification in the tray with “Couldn't send — tap to retry”; the reply is in the composer when the app opens. client_message_id makes a retry safe.",
    },
    {
      title: "A burst of 40 messages in one channel",
      handling: "Group by the kind's grouping key: one banner “Priya and 3 others in #release-train”, one sound, a count that updates in place.",
    },
    {
      title: "Two web tabs and the desktop app open",
      handling: "The desktop app is the leader when it's running and focused-ish; tabs only update counts. Among tabs, one leader via Web Locks; if it closes, another takes over.",
    },
    {
      title: "Signed out, or the session expired",
      handling: "Stop pushes for that device immediately (unregister the token on sign-out); an expired session gets one notification: “Sign in again to keep getting messages.”",
    },
    {
      title: "Several workspaces",
      handling: "Each workspace's notifications name the workspace; tapping switches to it. Badges sum across workspaces on the app icon; the rail shows each one's own.",
    },
    {
      title: "Lock-screen privacy",
      handling: "“Show previews” off → “New message from Priya Raman”; off for senders too → “New message”. Agents' approval requests never include the tool's arguments in the preview.",
    },
    {
      title: "Clock and timezone",
      handling: "Quiet hours use the person's profile timezone, not the device's, so a laptop in another timezone doesn't wake them.",
    },
    {
      title: "Windows small taskbar buttons",
      handling: "The overlay badge is hidden by Windows; the tray icon's tooltip carries the count instead.",
    },
  ],
  gaps: [
    {
      where: "mobile",
      what: "The bell in the V2 header has no unread badge.",
      fix: "mobile-header gets a badge on the bell.",
    },
    {
      where: "mobile",
      what: "A banner is raised for the conversation already on screen.",
      fix: "in-app-banner suppression rule.",
    },
    {
      where: "mobile",
      what: "No notification preferences beyond one on/off toggle.",
      fix: "Per-kind levels, mobile delay, previews, schedule.",
    },
    {
      where: "mobile",
      what: "Badge count is only set after a notification action.",
      fix: "Server sends the badge in every push; app recounts on foreground.",
    },
    {
      where: "desktop",
      what: "No do-not-disturb or pause UI; quiet hours are server-side only.",
      fix: "notification-schedule in the rail and the tray.",
    },
    {
      where: "desktop",
      what: "No Notifications section in Settings (only the two toggles in the rail's ⚙ menu).",
      fix: "A Settings section using the same controls.",
    },
    {
      where: "desktop",
      what: "Dock badge does nothing on Windows.",
      fix: "Taskbar overlay icon via the Windows API.",
    },
    {
      where: "desktop",
      what: "No reply or mark-as-read from the banner.",
      fix: "Native actions (planned).",
    },
    {
      where: "web",
      what: "No web app yet, so no browser notifications, tab count, favicon dot or service worker.",
      fix: "All of them, from day one.",
    },
  ],
} as const;
