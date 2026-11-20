import { NOTIFICATION_SCHEDULE_NOTE, NOTIFICATION_SCHEDULE_OPTIONS } from "../../samples/notifications";
import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "notification-schedule",
  name: "Pause notifications",
  category: "notifications",
  level: "organism",
  status: "draft",
  description: "Do not disturb, AntFabric's own: a Pause notifications menu (30 minutes to tomorrow morning, or a custom time), the pill that says notifications are paused and until when, and the note that quiet hours live on the server and so hold on every device.",
  props: {
    surface: {
      type: "enum",
      options: ["menu", "pill"],
      default: "menu",
      description: "menu: the Pause notifications choices. pill: the line that shows while paused.",
    },
    paused: {
      type: "boolean",
      default: false,
    },
    until: {
      type: "string",
      default: "",
      sample: "9:00",
      description: "When the pause ends, in this device's local time: \"9:00\", \"tomorrow, 9:00\", \"Mon 3 Nov, 14:30\".",
    },
    quietHours: {
      type: "string",
      default: "",
      sample: "weeknights 19:00–08:00",
      description: "The person's server-side quiet hours, or empty if none are set.",
    },
    options: {
      type: "array",
      default: [],
      sample: NOTIFICATION_SCHEDULE_OPTIONS,
      description: "The choices, in order: `{ key, label, text?, detail?, until?, custom? }`. `label` is the row's accessible name (with `, detail` after it) and is drawn unless `text` is; `until` is what \"Paused until\" shows once the row is chosen; a `custom` row opens the picker instead of pausing.",
    },
    note: {
      type: "string",
      default: "",
      sample: NOTIFICATION_SCHEDULE_NOTE,
      description: "The line under the choices. With `quietHours` it follows them; with neither, no row is drawn.",
    },
    custom: {
      type: "boolean",
      default: false,
      description: "The Custom… picker is open.",
    },
    customDate: {
      type: "string",
      default: "",
      sample: "Tomorrow",
      description: "The picker's date field.",
    },
    customTime: {
      type: "string",
      default: "",
      sample: "14:30",
      description: "The picker's time field.",
    },
    onCustomDateChange: {
      type: "event",
      args: "date: string",
      changes: "customDate",
      description: "The picker's date field changed: what was typed. Given `customDate` too, the field is controlled; otherwise it keeps its own. Pause uses what is in the field.",
    },
    onCustomTimeChange: {
      type: "event",
      args: "time: string",
      changes: "customTime",
      description: "The picker's time field changed: what was typed. Given `customTime` too, the field is controlled; otherwise it keeps its own. Pause uses what is in the field.",
    },
    onPause: {
      type: "event",
      args: "key: string",
      description: "A choice was made: the chosen option's `key`.",
    },
    onPausedChange: {
      type: "event",
      args: "paused: boolean",
      changes: "paused",
      description: "Called with `paused` as a choice (true, when it was not paused) or Resume (false) leaves it. Given `paused` too, the menu is controlled; otherwise it keeps its own.",
    },
    onResume: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "planned",
      base: "A labelled role=\"group\" of <button> rows (Custom… carries aria-expanded), inline styles over `t`; hover, press and focus from useInteraction; `paused`, `until` and `custom` kept in local state that follows the props; the paused line and the picker fade in, the menu pops in (the pill fades) with enter(); the pill is a role=\"status\" row with a Resume <button>",
      import: "import { NotificationSchedule } from \"@antfabric/ui-react\"",
      notes: [
        "Custom… is two text fields and an ink Button in the kit; in the app they become <input type=\"date\"> and <input type=\"time\">, so the picker is the browser's own and keyboard-accessible.",
      ],
      keyboard: [
        {
          keys: "Tab / Shift+Tab",
          action: "Moves between the choices, the picker's fields and Pause",
        },
        {
          keys: "Enter / Space",
          action: "Pauses for that long, or opens Custom…",
        },
      ],
    },
    desktop: {
      status: "planned",
      base: "The same menu and pill as web, at desktop density; the app hangs it under RailSettings (Notification sound, Show Notifications) and in the tray menu's Pause notifications ▸",
      import: "import { NotificationSchedule } from \"@antfabric/ui-react\"",
      notes: [
        "New: today there is no Do-not-disturb UI in the desktop client at all, and quiet hours exist only on the server. This adds both the menu and the pill.",
        "Not the same switch as Show Notifications: that is per-machine and stops this window raising anything; Pause is per-person, server-side, and stops every device.",
        "While paused the RailSettings button wears its 'not all on' tint, as it does today when a switch is off.",
        "In the catalogue, choosing a duration sets `paused` and an example `until` (counted from 9:41), and the 'Paused until' line fades in; Custom… toggles the picker; Resume clears `paused` in the menu and on the pill.",
      ],
      keyboard: [
        {
          keys: "Tab / Shift+Tab",
          action: "Moves between the choices, the picker's fields and Pause",
        },
        {
          keys: "Enter / Space",
          action: "Pauses for that long, or opens Custom…",
        },
      ],
    },
    mobile: {
      status: "planned",
      base: "A sheet-shaped View (a labelled group) with a grabber and Pressable button rows (usePress), StyleSheet over useTheme(); Custom… is two TextInputs and an ink Button (the app opens @react-native-community/datetimepicker); the pill is a role status view and a pause starting is announced; <Enter> pops the sheet and fades the rest",
      import: "import { NotificationSchedule } from \"@antfabric/ui-react-native\"",
      notes: [
        "Reached from Profile → Push notifications and from the Notifications screen header.",
        "The OS's own Focus / Do Not Disturb is separate and still applies; a later step could offer a Focus filter so a Work Focus pauses AntFabric automatically.",
      ],
      gestures: [
        {
          gesture: "Swipe the sheet down",
          action: "Closes without changing anything",
        },
      ],
    },
  },
  a11y: {
    role: "group",
    notes: [
      "The choices are a labelled group of buttons, not a role=menu: the picker's fields and Pause are form controls, which a menu may not hold. Tab moves through them. A product that hangs it in a popover owns Escape and focus return.",
      "The pill is a status that stays on the page, so its text changing (\"Notifications paused until 9:00\", or on again) is read. In the menu, a pause starting or its end moving is spoken through the page's announcer on the web and the screen reader's announcement call on the phone.",
      "Times are read in words by the platform (\"nine o'clock\"); the menu items carry their detail in the label (\"Until tomorrow, 9:00\").",
    ],
  },
  examples: [
    {
      name: "Pause menu",
    },
    {
      name: "While paused",
      props: {
        paused: true,
      },
    },
    {
      name: "Custom time",
      props: {
        custom: true,
      },
    },
    {
      name: "Paused pill",
      props: {
        surface: "pill",
        paused: true,
      },
    },
    {
      name: "Pill, paused until tomorrow",
      props: {
        surface: "pill",
        paused: true,
        until: "tomorrow, 9:00",
      },
    },
    {
      name: "No quiet hours set",
      props: {
        quietHours: "",
      },
    },
  ],
  matrix: [
    {
      prop: "surface",
    },
    {
      prop: "paused",
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "Paused on one device, paused on all",
      platforms: ["web", "desktop", "mobile"],
      handling: "Pause writes snoozed_until to the person's server-side notification preferences; the server stops sending pushes and banners to every device, and each client gets the change over the socket and shows the pill. Resuming anywhere resumes everywhere.",
    },
    {
      title: "Time zones and travel",
      platforms: ["web", "desktop", "mobile"],
      handling: "\"Until tomorrow\" is 9:00 — or the start of their working hours — in the person's profile time zone, stored as an instant. Each device shows that instant in its own local time, so a phone in another time zone may read \"until 4:30\". Daylight-saving changes move nothing.",
    },
    {
      title: "It ends while the app is closed, asleep or offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "The server ends the pause, not a client timer. Each client also clears its pill locally at the time so it never shows \"paused until 9:00\" at 9:05, and re-reads on wake or reconnect. Offline, the menu is disabled with \"You're offline. You can pause notifications when you're back.\"",
      example: {
        name: "Long custom end",
        props: {
          surface: "pill",
          paused: true,
          until: "Mon 3 Nov, 14:30",
        },
      },
    },
    {
      title: "What happens to what arrived while paused",
      platforms: ["web", "desktop", "mobile"],
      handling: "Nothing is lost and nothing is replayed: every notification is in the inbox, the badge and tab count keep counting, and resuming does not fire a burst of banners. Only new ones after resuming interrupt.",
    },
    {
      title: "Someone needs you urgently",
      platforms: ["web", "desktop", "mobile"],
      handling: "In this version nothing breaks through a pause — no \"notify anyway\", no exceptions for meetings or approvals. The sender sees the person's paused state on their profile. Whether a meeting you host or an approval may break through is an open decision for the owner.",
    },
    {
      title: "Custom time in the past or far away",
      platforms: ["web", "desktop", "mobile"],
      handling: "The Pause button is disabled until the time is later than now (\"Pick a time later than now.\"), and the latest allowed is 7 days ahead; anything longer is turning notifications off, which is the Show Notifications switch.",
      example: {
        name: "Custom while paused",
        props: {
          custom: true,
          paused: true,
        },
      },
    },
    {
      title: "Our pause and the OS's Focus",
      platforms: ["web", "desktop", "mobile"],
      handling: "Independent, and both apply: macOS/iOS Focus, Windows Do not disturb and Android DND hold what we send; our pause means we do not send. The pill only ever describes ours — we cannot read the OS's Focus state reliably, so we never claim it.",
    },
  ],
  related: ["tray-menu", "app-badge", "os-notification", "menu"],
  flows: [
    {
      id: "pause-for-an-hour",
      title: "Pause notifications for an hour",
      description: "Do not disturb, AntFabric's own: chosen once, kept on the server, so it holds on every device and ends by itself.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "Quiet hours already live on the server",
          detail: "notification-service applies the person's quiet-hours window in its own time zone (routing/domain/quiet-hours.ts, applyQuietHours): inside it, deliveries are delayed to the window's end or dropped. Neither app can pause today: the rail's ⚙ has only Notification sound and Show notifications, and the phone has one Push notifications switch.",
          code: "const evaluation = evaluateQuietHours(window, input.now); if (!evaluation.within) return [...decisions]",
        },
        {
          kind: "trigger",
          title: "Pause notifications is opened",
          detail: "From the rail's ⚙ menu or the tray on the desktop, from Settings on the phone.",
        },
        {
          kind: "motion",
          title: "The menu pops in",
          enter: "pop",
        },
        {
          kind: "trigger",
          title: "1 hour is chosen",
          detail: "Until tomorrow means the start of this person's working hours in their profile's time zone, not the device's.",
        },
        {
          kind: "event",
          title: "onPause('1h') fires",
          detail: "The menu passes the choice; the caller works out the time.",
          code: "onPause?.('1h')",
        },
        {
          kind: "effect",
          title: "The pause is saved on the server",
          detail: "As a one-off quiet window ending at 10:41, so the phone and every other device go quiet too. A meeting starting now and an approval marked time-sensitive still get through, as they do in quiet hours.",
          code: "await updatePreferences({ pausedUntil: addHours(now, 1).toISOString() })",
        },
        {
          kind: "state",
          title: "Every surface knows it's paused",
          detail: "The feed and the badge keep updating, silently: no banners, no sound. The badge keeps its count but drops the activity dot, and the tray reads Notifications paused until 10:41.",
        },
        {
          kind: "motion",
          title: "Paused until 10:41 fades in at the top",
          enter: "fade",
        },
        {
          kind: "result",
          title: "The pill says until when",
          detail: "It sits in the rail's header and in Settings for as long as the pause lasts, with Resume beside it.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          props: {
            surface: "menu",
            paused: false,
          },
        },
        {
          step: 3,
          press: "1 hour",
          hold: 900,
          props: {
            surface: "menu",
            paused: false,
          },
        },
        {
          step: 7,
          hold: 1600,
          props: {
            surface: "menu",
            paused: true,
            until: "10:41",
          },
        },
        {
          step: 8,
          hold: 1600,
          props: {
            surface: "pill",
            paused: true,
            until: "10:41",
          },
        },
      ],
    },
    {
      id: "resume-early",
      title: "Resume before the pause ends",
      description: "The pill is the way out: one press and notifications are back on every device.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The pill reads the server's pause",
          detail: "While paused it shows the end time. The tray menu and the phone's Settings read the same value.",
        },
        {
          kind: "trigger",
          title: "Resume is pressed",
        },
        {
          kind: "event",
          title: "onResume() fires",
          code: "onResume?.()",
        },
        {
          kind: "effect",
          title: "The pause is cleared on the server",
          detail: "Every device starts notifying again at once.",
          code: "await updatePreferences({ pausedUntil: null })",
        },
        {
          kind: "result",
          title: "Notifications on",
          detail: "What arrived while paused stays in the feed. Nothing is replayed as a burst of banners.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          props: {
            surface: "pill",
            paused: true,
            until: "10:41",
          },
        },
        {
          step: 1,
          press: "Resume notifications",
          hold: 900,
          props: {
            surface: "pill",
            paused: true,
            until: "10:41",
          },
        },
        {
          step: 4,
          hold: 1600,
          props: {
            surface: "pill",
            paused: false,
          },
        },
      ],
    },
  ],
};

export default docs;
