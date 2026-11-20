import type { OnlyOn, StringGroups } from "./index";

/**
 * Built-in text of the `notifications` components, keyed by component id. See `strings/index.ts`. Where a text names the product or its
 * features, the English default is a plain sentence and the catalogue's copy is in `ANTFABRIC_STRINGS` (`@antfabric/ui-docs/samples`).
 * `{app}` is the `appName` prop of AppBadge, OsNotification and TrayMenu.
 */
export const notifications = {
  "tray-menu": {},
  "app-badge": {
    /** What the icon is read as while there are unread: "3 unread". `count` is the real total, not the capped one. */
    unread: "{count} unread",
    newActivity: "New activity",
    noUnread: "No unread",
    /** What follows the reading while notifications are paused. */
    paused: "{what}, notifications paused",
    /** The browser tab's title: "(3) Acme". `count` is capped at 99. */
    tabTitle: "({count}) {app}",
  },
  "in-app-banner": {
    /** The banner's accessible name. */
    newNotification: "New notification",
    /** What the hit area reads: "Priya Raman: …. Open". */
    open: "{title}: {body}. Open",
    openIn: "{title} in {context}: {body}. Open",
    /** Before the body: "Mentioned you · ". */
    leadSuffix: "{lead} · ",
    more: "+{count} more waiting",
    reply: "Reply",
    replyTo: "Reply to {name}",
    replyPlaceholder: "Reply to {name}…",
  },
  "notification-item": {
    /** First in the row's accessible name while it is unread. */
    unread: "Unread.",
    /** One part of the row's accessible name, made a sentence: the title, the body. */
    sentence: "{text}.",
    /** The row's accessible name grows one part at a time: what is read so far, then the next part. */
    followedBy: "{first} {second}",
    /** Before the body: "Replied in a thread · ". */
    leadSuffix: "{lead} · ",
    approve: "Approve",
    decline: "Decline",
    /** Where an approval was answered, when it was somewhere else: " on your phone". */
    on: " on {device}",
    /** The outcome line; `where` is `on` or nothing. */
    approved: "Approved{where}",
    declined: "Declined{where}",
    expired: "This request expired.",
    /** The web row's Mark as read button reads `markAsRead`; this is its accessible name. */
    markReadLabel: "Mark as read: {title}",
    clear: "Clear",
    clearLabel: "Clear: {title}",
    /** The phone's swipe action, its accessible name and the one it names for a screen reader. */
    markReadShort: "Mark read",
    markReadShortLabel: "Mark {title} read",
    clearShortLabel: "Clear {title}",
  },
  "notification-schedule": {
    /** The menu's heading and accessible name. */
    pause: "Pause notifications",
    /** The paused line in the menu: "Paused until 9:00". */
    pausedUntil: "Paused until {until}",
    /** Before the note, when the person has server-side quiet hours: "Quiet hours: weeknights 19:00–08:00. ". */
    quietHours: "Quiet hours: {hours}. ",
    pauseUntilDate: "Pause until date",
    pauseUntilTime: "Pause until time",
    pauseButton: "Pause",
    /** What "Paused until" shows after the picker's Pause: the date, then the time. */
    untilCustom: "{date}, {time}",
    /** The pill's reading while paused. */
    status: "Notifications paused until {until}",
    /** The pill's reading while on. */
    on: "Notifications on",
    resume: "Resume",
    resumeLabel: "Resume notifications",
  },
  "os-notification": {
    /** The banner's accessible name: the line, then the context after it. */
    withContext: "{label}, {context}",
    /** The same, then the body after it. */
    withBody: "{label}: {body}",
    replyTo: "Reply to {name}",
    replyPlaceholder: "Reply…",
    /** Windows' reply box. */
    typeReply: "Type a reply",
    sendingText: "Sending…",
    replyFailed: "Your reply wasn’t sent. Open {app} to send it.",
    /** Before the body: "Mentioned you · ". */
    leadSuffix: "{lead} · ",
    more: "+{count} more",
    moreFrom: "+{count} more from {context}",
    closeNotification: "Close notification",
    settings: "Notification settings",
    /** The header line each OS draws: the browser's, Linux's and the phone's. */
    sourceWeb: "{app} · {origin} · {time}",
    sourceLinux: "{app} · {time}",
    sourcePhone: "{app} · {time}",
    sourcePhoneIn: "{app} · {context} · {time}",
    newMessage: "New message",
  },
  "permission-prompt": {
    /** The region's accessible name, the browser picture's "Notifications" chip and the word "notifications" in general. */
    notifications: "Notifications",
    titleAsk: "Get notified when someone needs you",
    titleOn: "Notifications are on",
    titleOff: "Notifications are off for this app",
    titleBlocked: "Notifications are blocked in this browser",
    titleNoServer: "Your desktop isn’t showing notifications",
    titleUnsupportedBrowser: "This browser can’t show notifications",
    titleUnsupportedBuild: "This build can’t show notifications",
    bodyAskBrowser: "This app tells you about new activity while this tab is in the background, or closed. Your browser asks next.",
    bodyAskMac: "New activity, even with the window closed. macOS asks only once, so choose Allow.",
    bodyAskIos: "New activity, even with the app closed. iPhone asks only once, so we ask first.",
    bodyAskAndroid: "New activity, even with the app closed. Android asks next — tap Allow.",
    bodyOnWindows: "Windows shows them without asking. With Do not disturb or Focus on, Windows keeps them in the notification centre instead of showing a banner.",
    bodyOnLinux: "Your desktop’s notification server shows them (GNOME Shell, KDE Plasma, mako, dunst). If nothing appears, check its Do Not Disturb.",
    bodyOnBrowser: "New activity reaches you while this tab is in the background. Your system’s Focus settings can still hold it.",
    bodyOnMac: "You get a banner whenever the app window isn’t in front. Focus can still hold them.",
    bodyOnIos: "New activity reaches you even with the app closed. Focus can still hold it.",
    bodyOnAndroid: "New activity reaches you even with the app closed. Do Not Disturb can still hold it.",
    bodyBlockedBrowser: "Click the lock icon in the address bar → Notifications → Allow, then reload this page.",
    bodyBlockedMac: "Open System Settings → Notifications, find this app and turn on Allow notifications.",
    bodyBlockedWindows: "Open Settings → System → Notifications and turn on this app.",
    bodyBlockedLinux: "Check Do Not Disturb in your desktop’s notification settings, and that a notification server is running.",
    bodyBlockedIos: "Notifications are turned off for this app in iOS Settings. Turn them on there first.",
    bodyBlockedAndroid: "Notifications are turned off for this app in your phone’s Settings, under Apps. Turn them on there first.",
    bodyUnsupportedBrowser: "On iPhone and iPad, add this app to your Home Screen first (Share → Add to Home Screen). Elsewhere, leave private browsing or try another browser. The unread count in the tab title works either way.",
    bodyUnsupportedBuild: "This is a development build without the notification service. The installed app has it.",
    bodyUnsupportedPhone: "This build cannot show notifications. It needs a development or store build.",
    footBrowser: "You can change this later from the lock icon in the address bar.",
    footDesktop: "You can change this later in System Settings → Notifications.",
    footPhone: "You can change this later in Settings.",
    turnOn: "Turn on notifications",
    /** iOS: provisional authorisation, delivered to Notification Center without asking. */
    quiet: "Deliver quietly instead",
    test: "Send a test notification",
    openNotificationSettings: "Open notification settings",
    checkAgain: "Check again",
    openSystemSettings: "Open System Settings",
    openSettings: "Open Settings",
    /** The browser picture's Allow chip. */
    allow: "Allow",
  },
} as const satisfies StringGroups;

/** Keys one kit has no use for: the browser tab's title and the browser and desktop pictures are the web's; the phone's own OS words are the phone's. */
export const notificationsOnly = {
  "app-badge": { tabTitle: ["web"] },
  // The phone has no inline reply.
  "in-app-banner": { reply: ["web"], replyTo: ["web"], replyPlaceholder: ["web"] },
  // The web's hover actions and the phone's swipe actions read their own words.
  "notification-item": { markReadLabel: ["web"], clearLabel: ["web"], markReadShort: ["mobile"], markReadShortLabel: ["mobile"], clearShortLabel: ["mobile"] },
  // The desktop banners have a close button and a header line; the phone's header names the app, and the reply box is Windows'.
  "os-notification": { typeReply: ["web"], closeNotification: ["web"], settings: ["web"], sourceWeb: ["web"], sourceLinux: ["web"], sourcePhone: ["mobile"], sourcePhoneIn: ["mobile"] },
  "permission-prompt": {
    titleBlocked: ["web"],
    titleNoServer: ["web"],
    titleUnsupportedBrowser: ["web"],
    bodyAskBrowser: ["web"],
    bodyAskMac: ["web"],
    bodyAskIos: ["mobile"],
    bodyAskAndroid: ["mobile"],
    bodyOnWindows: ["web"],
    bodyOnLinux: ["web"],
    bodyOnBrowser: ["web"],
    bodyOnMac: ["web"],
    bodyOnIos: ["mobile"],
    bodyOnAndroid: ["mobile"],
    bodyBlockedBrowser: ["web"],
    bodyBlockedMac: ["web"],
    bodyBlockedWindows: ["web"],
    bodyBlockedLinux: ["web"],
    bodyBlockedIos: ["mobile"],
    bodyBlockedAndroid: ["mobile"],
    bodyUnsupportedBrowser: ["web"],
    bodyUnsupportedBuild: ["web"],
    bodyUnsupportedPhone: ["mobile"],
    footBrowser: ["web"],
    footDesktop: ["web"],
    footPhone: ["mobile"],
    quiet: ["mobile"],
    openNotificationSettings: ["web"],
    checkAgain: ["web"],
    openSystemSettings: ["web"],
    allow: ["web"],
  },
} as const satisfies OnlyOn<typeof notifications>;
