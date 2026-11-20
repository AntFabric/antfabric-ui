import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "permission-prompt",
  name: "Notification permission prompt",
  category: "notifications",
  level: "molecule",
  status: "beta",
  description: "The soft-ask before the operating system's own permission dialog, and what to say after it. It explains why, asks from a click, and when the answer was no it says exactly where the switch is on this OS — because most platforms only ask once.",
  props: {
    permission: {
      type: "enum",
      options: ["default", "granted", "denied", "unsupported"],
      default: "default",
      description: "The OS's answer. default = never asked. Windows and Linux have no prompt, so default there reads as on.",
    },
    origin: {
      type: "string",
      default: "",
      sample: "app.antfabric.com",
      platforms: ["web"],
      description: "The site the browser's permission prompt names, drawn in the address-bar picture of a blocked tab. \"\" draws none.",
    },
    presentation: {
      type: "enum",
      options: ["card", "sheet"],
      default: "card",
      platforms: ["mobile"],
      description: "card is the prompt on its own (a settings row, a banner in a pane). sheet is how the phone presents the soft-ask: the prompt IS the bottom sheet — full width, top corners rounded, a grab handle — never a card inside another sheet.",
    },
    onAllow: {
      type: "event",
      description: "Runs the OS request — from this click, never on load.",
    },
    onLater: {
      type: "event",
    },
    onQuiet: {
      type: "event",
      platforms: ["mobile"],
      description: "iOS provisional authorisation: deliver quietly to Notification Center without asking.",
    },
    onOpenSettings: {
      type: "event",
    },
    onTest: {
      type: "event",
    },
    onCheckAgain: {
      type: "event",
      platforms: ["web"],
      description: "\"Check again\" in a tab whose notifications are blocked: the app re-reads Notification.permission and passes the new `permission`.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<div role=\"region\"> card with an <h2> title, inline styles over `t`; Button actions; `permission` kept in local state that follows the prop, so Turn on shows the on state at once; pops in with enter(); the blocked-in-browser hint is drawn aria-hidden. The app runs Notification.requestPermission() inside onAllow and watches navigator.permissions.query({ name: 'notifications' })",
      import: "import { PermissionPrompt } from \"@antfabric/ui-react\"",
      notes: [
        "Shown in the notification rail and once as a dismissible card on the home screen after the first DM or mention arrives — never as a prompt on page load.",
        "The OS prompt is requested only from the Turn on click: Safari and Firefox refuse a request without a user gesture, and Chrome switches a site that prompts on load to its quiet UI (a crossed bell in the address bar) that most people never see.",
        "Denied cannot be undone from the page — no API reopens the prompt. The card says where the switch is and offers Check again, which re-reads Notification.permission.",
        "In the catalogue, Turn on notifications sets `permission` to granted (the browser would ask first), so the prompt turns into the on state with Send a test notification. The card pops in.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Activates the focused button",
        },
      ],
    },
    desktop: {
      status: "partial",
      base: "The same card as web at desktop density, its copy and actions per OS from usePlatform() (macOS asks; Windows and Linux read as on). The app runs UNUserNotificationCenter requestAuthorization (macOS) or tauri-plugin-notification inside onAllow, and opens x-apple.systempreferences:com.apple.Notifications-Settings.extension / ms-settings:notifications from onOpenSettings",
      import: "import { PermissionPrompt } from \"@antfabric/ui-react\"",
      notes: [
        "Today macOS asks at startup with no explanation, and the answer is cached; this card moves that ask behind the soft-ask on first launch, because macOS also asks only once.",
        "Windows: unpackaged apps are allowed by default; there is nothing to ask. The card only appears in Settings, as \"Notifications are on\" with a test button.",
        "Linux: no permission model. If no notification server is running (some tiling setups), notify-rust fails silently; the test button is how a person finds out.",
        "Linux has no settings page to open, so when notifications are off there the card offers Send a test notification instead of a settings button.",
        "The rail's own switches (Notification sound, Show Notifications) are a separate, per-machine setting and are not this permission.",
        "Turn on notifications sets `permission` to granted in the catalogue (macOS would ask first); the card pops in.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Activates the focused button",
        },
      ],
    },
    mobile: {
      status: "partial",
      base: "View (role region) over GlassSurface (Liquid Glass for the sheet on iOS 26+), StyleSheet over useTheme(); full-width Buttons in a column; <Enter> slides the sheet up and pops the card. The app calls expo-notifications requestPermissionsAsync({ ios: { allowProvisional } }) from onAllow / onQuiet and Linking.openSettings() from onOpenSettings",
      import: "import { PermissionPrompt } from \"@antfabric/ui-react-native\"",
      notes: [
        "Today the phone asks the OS the moment the notification socket first connects, with no soft-ask. This sheet goes in front of that ask, once per install.",
        "Keep the rule from 2026-09-28: a foreground resume only READS the permission (registerPushDevice({ ask: false })), never asks. Asking on resume pauses and resumes the app, which is the resume event — it looped 59 times in 7.6 s and jammed Expo's permission queue.",
        "Android 13+ needs the POST_NOTIFICATIONS runtime permission; Android 12 and earlier are allowed by default, so the sheet skips straight to granted there.",
        "Coming back from Settings with notifications allowed turns the Profile switch on without a second tap (awaitingSettings).",
        "iOS 26+: Liquid Glass — the surface is drawn through expo-glass-effect's GlassView (gated on its availability check; the material itself follows the device's Clear / Tinted, Reduce Transparency and Increase Contrast settings). iOS 18 and earlier keep today's blur/opaque look. Only the sheet presentation takes glass; the card stays opaque so the explanation reads cleanly wherever it sits.",
        "Turn on notifications sets `permission` to granted in the catalogue (the OS would ask first). The card pops in; the sheet presentation pops too, because one template root carries one entrance — the kit slides the sheet up.",
      ],
      gestures: [
        {
          gesture: "Swipe the sheet down",
          action: "Same as Not now",
        },
      ],
    },
  },
  a11y: {
    role: "region",
    notes: [
      "The title is a heading; the state is said in words, never only by the tile colour.",
      "Settings paths are written out (\"System Settings → Notifications → AntFabric\") so a screen-reader user can follow them without the picture.",
    ],
  },
  examples: [
    {
      name: "Ask first (web)",
      platforms: ["web"],
    },
    {
      name: "Ask first (macOS)",
      os: "mac",
      platforms: ["desktop"],
    },
    {
      name: "Ask first (iOS)",
      description: "iOS asks once; Deliver quietly uses provisional authorisation.",
      os: "ios",
      platforms: ["mobile"],
    },
    {
      name: "Ask first (Android 13+)",
      os: "android",
      platforms: ["mobile"],
    },
    {
      name: "On by default (Windows)",
      os: "windows",
      platforms: ["desktop"],
    },
    {
      name: "On (Linux)",
      os: "linux",
      platforms: ["desktop"],
    },
    {
      name: "Granted",
      props: {
        permission: "granted",
      },
    },
    {
      name: "Blocked in the browser",
      platforms: ["web"],
      props: {
        permission: "denied",
      },
    },
    {
      name: "Denied (macOS)",
      os: "mac",
      platforms: ["desktop"],
      props: {
        permission: "denied",
      },
    },
    {
      name: "Denied (Windows)",
      os: "windows",
      platforms: ["desktop"],
      props: {
        permission: "denied",
      },
    },
    {
      name: "Denied (iOS)",
      os: "ios",
      platforms: ["mobile"],
      props: {
        permission: "denied",
      },
    },
    {
      name: "Unsupported",
      props: {
        permission: "unsupported",
      },
    },
    {
      name: "Presented as a sheet (iOS)",
      description: "How the phone shows the soft-ask: the prompt is the bottom sheet itself, rising over the dimmed screen.",
      props: {
        presentation: "sheet",
      },
      platforms: ["mobile"],
      os: "ios",
      width: 375,
    },
  ],
  matrix: [
    {
      prop: "permission",
    },
  ],
  edgeCases: [
    {
      title: "Asked once, on purpose — never on load, never on resume",
      platforms: ["web", "desktop", "mobile"],
      handling: "The OS request runs only from the Turn on click. The soft-ask appears after the first DM or mention arrives, or from Settings — not on the first screen after sign-in. Not now hides it for 14 days; after a third Not now it lives only in Settings. On the phone a resume re-reads the answer and never asks (the 59-ask loop).",
    },
    {
      title: "Android: denied twice is denied for good",
      platforms: ["mobile"],
      handling: "After a second refusal Android stops showing its dialog (canAskAgain = false) and a request answers denied instantly. nextPushStep() then returns settings: the card swaps Turn on for Open Settings, and coming back with notifications allowed turns them on without another tap.",
      example: {
        name: "Android, permanently denied",
        os: "android",
        platforms: ["mobile"],
        props: {
          permission: "denied",
        },
      },
    },
    {
      title: "iOS: provisional (quiet) delivery",
      platforms: ["mobile"],
      handling: "Deliver quietly requests provisional authorisation: no dialog, notifications go silently to Notification Center, each with Keep and Turn Off. Status then reads provisional, and the Profile switch shows \"Delivered quietly\" with Turn on banners — which asks the real question then.",
    },
    {
      title: "Changed in system settings while the app is open",
      platforms: ["web", "desktop", "mobile"],
      handling: "Re-read on focus (web: permissions.query change event; desktop: window focus; phone: AppState active). A switch in the app that still claims on after notifications were turned off in Settings is the bug this prevents.",
    },
    {
      title: "Dev builds and the wrong sender on Windows",
      platforms: ["desktop"],
      handling: "pnpm tauri dev is not a bundled app, so macOS's UNUserNotificationCenter refuses it and banners fall back to the plugin path; on Windows an unpackaged dev binary has no AppUserModelID and its toasts appear from \"Windows PowerShell\". The installer registers the AUMID and a Start-menu shortcut; neither is a permission problem and the card must not say it is.",
      example: {
        name: "Desktop dev build",
        os: "mac",
        platforms: ["desktop"],
        props: {
          permission: "unsupported",
        },
      },
    },
    {
      title: "Browsers that cannot, and private windows",
      platforms: ["web"],
      handling: "Safari on iPhone and iPad supports web push only for a site added to the Home Screen (iOS 16.4+); Firefox private windows and some embedded webviews have no Notification at all. Those read unsupported, with what to do; the tab title count and favicon dot still work.",
      example: {
        name: "Web unsupported",
        platforms: ["web"],
        props: {
          permission: "unsupported",
        },
      },
    },
    {
      title: "Several tabs or windows",
      platforms: ["web", "desktop"],
      handling: "Permission is per origin (web) and per app (desktop): granting in one tab grants every tab, and the cards in the others disappear on the change event. Only the focused tab shows the soft-ask.",
    },
    {
      title: "Granted, but nothing arrives",
      platforms: ["web", "desktop", "mobile"],
      handling: "Send a test notification posts a real one through the same path. If it does not appear the card says the likely cause for this OS — Focus / Do not disturb, the browser's own notification switch in System Settings, or (phone) a missing push token, which is retried on the next resume.",
    },
    {
      title: "Soft-ask nested inside another sheet",
      platforms: ["mobile"],
      handling: "Never put the card inside a BottomSheet: two surfaces, two sets of corners, and a fixed-width card that overflows the sheet's gutter. Use presentation: \"sheet\", which makes the prompt the sheet — full width, top corners only, its own grab handle — and leaves the home-indicator space to the screen.",
      example: {
        name: "As the sheet",
        props: {
          presentation: "sheet",
        },
        os: "ios",
        width: 375,
      },
    },
    {
      title: "Liquid Glass and earlier iOS",
      platforms: ["mobile"],
      handling: "As a sheet on iOS 26+, the soft-ask floats inset as a Liquid Glass sheet. The glass follows the iPhone's own settings with no work from us, because the kit draws it with the system material (GlassView): Clear or Tinted (Settings → Display & Brightness → Liquid Glass) changes how much shows through, Reduce Transparency makes it frosted and nearly opaque while keeping its shape, and Increase Contrast adds a contrasting edge. The app subscribes to AccessibilityInfo 'reduceTransparencyChanged' only to adjust what it draws around the glass. iOS before 26 keeps the blur look. This happens live in the app as the person changes the setting.",
    },
  ],
  related: ["os-notification", "app-badge", "notification-schedule"],
  flows: [
    {
      id: "ask-from-a-click",
      title: "Ask from a click, then let the OS ask",
      description: "The soft-ask explains why before the system prompt appears, because most platforms ask only once. The OS request runs from the person's own click, never on load.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The OS's answer, read without asking",
          detail: "Reading never shows the system prompt, so it runs on every return to the app. canAskAgain says whether the OS will still ask at all.",
          code: "const snapshot = await readPushPermission(); nextPushStep(snapshot)  // 'granted' | 'ask' | 'settings'",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "Asked once, when the workspace goes live",
          detail: "Today there's no soft-ask: the app asks at sign-in rather than at launch, because a prompt before the person has seen the app is one they dismiss. The macOS click path also asks UNUserNotificationCenter at startup, which answers from the same per-app switch.",
          code: "useEffect(() => { if (mode !== 'live') return; notifier.requestPermission() }, [mode])",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "Never on page load",
          detail: "Browsers penalise a prompt on load and people say no. The soft-ask waits for the first mention or DM that arrives while the tab is in the background.",
          code: "if (Notification.permission === 'default' && firstBackgroundMention) showSoftAsk()",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The soft-ask pops in",
          enter: "pop",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The soft-ask slides up as a sheet",
          detail: "The prompt is the sheet itself, full width with a grab handle, never a card inside another sheet.",
          enter: "slide-up",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "Turn on notifications is pressed",
          detail: "Not now puts the card away without asking the OS, so the one chance it gives isn't spent.",
        },
        {
          kind: "event",
          title: "onAllow() fires",
          detail: "The OS request runs inside this click. Browsers require a user gesture, and iPhone asks only once, so it has to be the moment the person chose.",
          code: "onAllow?.()",
        },
        {
          kind: "effect",
          title: "The browser asks",
          detail: "The desktop app's browser fallback already makes this exact call while the permission is still default.",
          code: "await Notification.requestPermission()",
          platforms: ["web"],
        },
        {
          kind: "effect",
          title: "The OS asks, unless it already said yes",
          code: "if (await plugin.isPermissionGranted()) return; await plugin.requestPermission()",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "iPhone or Android asks",
          detail: "undetermined after a request means this build can't show notifications at all, and the card says that rather than calling it a refusal.",
          code: "const req = await Notifications.requestPermissionsAsync(); return req.status === 'granted' ? 'granted' : req.status === 'undetermined' ? 'unsupported' : 'denied'",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "Granted, and this phone registers for pushes",
          detail: "The device token goes to the gateway with this installation's id, so notification-service can reach it while the app is closed.",
          code: "await gatewayRequest('/notification-devices', { method: 'POST', body: JSON.stringify({ installationId, platform, provider, token }) })",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "Notifications are on",
          detail: "The card says so, names what can still hold them (Focus, Do Not Disturb), and offers Send a test notification.",
        },
      ],
      replay: [
        {
          step: 1,
          hold: 1400,
          platforms: ["desktop"],
          props: {
            permission: "default",
          },
        },
        {
          step: 2,
          hold: 1400,
          platforms: ["web"],
          props: {
            permission: "default",
          },
        },
        {
          step: 0,
          hold: 1400,
          platforms: ["mobile"],
          props: {
            permission: "default",
            presentation: "sheet",
          },
        },
        {
          step: 5,
          press: "Turn on notifications",
          hold: 900,
          platforms: ["web"],
          props: {
            permission: "default",
          },
        },
        {
          // Turn on notifications on macOS; Windows and Linux never ask, so the card is already on there.
          step: 5,
          press: 0,
          hold: 900,
          platforms: ["desktop"],
          props: {
            permission: "default",
          },
        },
        {
          step: 5,
          press: "Turn on notifications",
          hold: 900,
          platforms: ["mobile"],
          props: {
            permission: "default",
            presentation: "sheet",
          },
        },
        {
          step: 11,
          hold: 1700,
          platforms: ["web", "desktop"],
          props: {
            permission: "granted",
          },
        },
        {
          step: 11,
          hold: 1700,
          platforms: ["mobile"],
          props: {
            permission: "granted",
            presentation: "sheet",
          },
        },
      ],
    },
    {
      id: "turned-off-open-settings",
      title: "Turned off: say where the switch is, and take them there",
      description: "After a no, most platforms never show their prompt again, so asking does nothing. The card names the switch and opens the place it lives.",
      platforms: ["desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The OS won't ask again",
          detail: "Once notifications are off in Settings, a request answers denied at once and the switch could never move. nextPushStep says to send the person to Settings instead.",
          code: "if (snapshot.status === 'denied' && !snapshot.canAskAgain) return 'settings'",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "macOS says the switch is off",
          detail: "Today a refusal is only logged: banners fall back to the plugin path, which the same switch silences, and nothing in the app says so. This card is the missing sentence.",
          code: "STATE.store(if usable { USABLE } else { UNUSABLE }, Ordering::Release)  // [notify] clickable banners: off",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The card says exactly where the switch is",
          detail: "System Settings → Notifications → AntFabric on a Mac; Settings → System → Notifications on Windows; the app's page in Settings on a phone. Word for word what the person will see there.",
        },
        {
          kind: "trigger",
          title: "Open Settings is pressed",
          detail: "Open System Settings on a Mac.",
        },
        {
          kind: "event",
          title: "onOpenSettings() fires",
          code: "onOpenSettings?.()",
        },
        {
          kind: "effect",
          title: "The app's page in Settings opens",
          detail: "The screen remembers it sent the person there. If the OS refuses to open Settings, the card says where to go instead.",
          code: "await Linking.openSettings()",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "System Settings opens on Notifications",
          detail: "Not built yet; this is the planned call. Windows opens ms-settings:notifications.",
          code: "openUrl('x-apple.systempreferences:com.apple.Notifications-Settings.extension')",
          platforms: ["desktop"],
        },
        {
          kind: "trigger",
          title: "The person turns it on and comes back",
        },
        {
          kind: "state",
          title: "The permission is read again on return",
          detail: "Whenever the app becomes active it reads the OS's answer, so a change made in Settings shows without another tap.",
          code: "AppState.addEventListener('change', (next) => { if (next === 'active') void sync() })",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "Notifications are on",
          detail: "The card turns to the granted state; the switch is on.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1500,
          platforms: ["mobile"],
          props: {
            permission: "denied",
            presentation: "sheet",
          },
        },
        {
          step: 1,
          hold: 1500,
          platforms: ["desktop"],
          props: {
            permission: "denied",
          },
        },
        {
          step: 3,
          press: "Open Settings",
          hold: 900,
          platforms: ["mobile"],
          props: {
            permission: "denied",
            presentation: "sheet",
          },
        },
        {
          // Open System Settings on macOS, Open Settings on Windows, Send a test notification on Linux.
          step: 3,
          press: 0,
          hold: 900,
          platforms: ["desktop"],
          props: {
            permission: "denied",
          },
        },
        {
          step: 9,
          hold: 1700,
          platforms: ["mobile"],
          props: {
            permission: "granted",
            presentation: "sheet",
          },
        },
        {
          step: 9,
          hold: 1700,
          platforms: ["desktop"],
          props: {
            permission: "granted",
          },
        },
      ],
    },
  ],
};

export default docs;
