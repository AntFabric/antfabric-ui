import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "switch",
  name: "Switch",
  category: "inputs",
  level: "atom",
  status: "stable",
  description: "An on/off setting that takes effect the moment it flips — no Save. On is the tenant's brand colour, never green: both states are fine, and a switch reports a choice, not an outcome. On the phone it is the platform's own switch, shaped like iOS on iPhone and like Material on Android.",
  props: {
    checked: {
      type: "boolean",
      default: false,
      sample: true,
    },
    label: {
      type: "string",
      sample: "Notification sound",
      required: true,
    },
    description: {
      type: "string",
      default: "",
      description: "What on means, or why it cannot be turned on right now.",
    },
    icon: {
      type: "icon",
      default: "",
      sample: "volume-2",
      description: "A leading glyph saying what the setting is about. The switch says whether it is on.",
    },
    hideLabel: {
      type: "boolean",
      default: false,
      description: "Draw the switch alone, when the row it sits in shows the label. The label stays the accessible name.",
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    onCheckedChange: {
      type: "event",
      args: "checked: boolean",
      changes: "checked",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<button role=\"switch\"> with aria-checked, inline styles over `t`; the thumb slides by a CSS transform transition; hover and focus from useInteraction; `checked` through useControllable",
      import: "import { Switch } from \"@antfabric/ui-react\"",
      notes: [
        "Use a switch only where the change applies immediately. In a form with a Save button, the same setting is a checkbox.",
        "Browser notifications: turning \"Show Notifications\" on is the moment to call Notification.requestPermission() — from the click, never on page load. If the browser says denied, the switch returns to off and the description says \"Your browser is blocking notifications for this site.\"",
        "Pressing toggles `checked` (an `on.press` action, so the catalogue preview is interactive): the thumb slides by transform (track width − padding − thumb) over 180ms and the track colour fades with it.",
      ],
      keyboard: [
        {
          keys: "Space",
          action: "Toggles",
        },
        {
          keys: "Enter",
          action: "Toggles (it is a button)",
        },
      ],
    },
    desktop: {
      status: "partial",
      base: "The same <button role=\"switch\"> as web: a 30×18 track with a 14px thumb that slides 12px",
      import: "import { Switch } from \"@antfabric/ui-react\"",
      notes: [
        "Desktop has no switch today. The notification rail's ⚙ menu holds its two settings, Notification sound and Show Notifications, as menuitemcheckbox rows with the square check, and that stays: ARIA has no menu-item switch, and inside a menu the tick IS the control.",
        "This switch is for settings screens and rows outside menus (Preferences → Notifications), where the same two settings appear with the same labels.",
        "While either notification setting is off, the rail's ⚙ button stays loud (surface.muted under text.body) so a mute is never invisible.",
        "Notification sound and Show Notifications are device settings (lib/notify-prefs.ts) — they do not sync to the phone.",
        "Pressing toggles `checked`: the thumb slides 12px by transform while the track fades to the brand colour.",
      ],
      keyboard: [
        {
          keys: "Space / Enter",
          action: "Toggles",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable (accessibilityRole switch) drawing each OS's own shape — UISwitch's 51×31 on iOS, Material's 36×14 track under a 20dp thumb on Android — not RN's Switch, so the catalogue and the app match; the thumb slides with Animated.timing; `checked` through useControllable",
      import: "import { Switch } from \"@antfabric/ui-react-native\"",
      notes: [
        "On track is colors.primary — the tenant's primary — never a literal, so a white-labelled build keeps its own brand.",
        "Off track is switchTrackOff and the thumb is switchThumb (white in both themes), the nearest roles to UISwitch's own; surfaceSunken vanished on a dark card.",
        "iOS draws a 51×31 UISwitch. Android's RN Switch is Material: the colours apply, the iOS shape does not — the catalogue draws each OS's own shape.",
        "Used as the trailing control of a settings row (Push notifications, Bluetooth proximity); the row's label is the switch's accessibilityLabel.",
        "Tapping toggles `checked`: the thumb slides by transform, 20pt on iOS and 16dp on Android, as the native switches animate it.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Toggles with a light haptic (iOS draws its own)",
        },
        {
          gesture: "Drag the thumb",
          action: "Toggles on release (iOS)",
        },
      ],
    },
  },
  a11y: {
    role: "switch",
    label: "{label}",
    notes: [
      "role=switch with aria-checked; announced \"Notification sound, switch, on\". The track is hidden: the state is in aria-checked.",
      "The description is the control's aria-describedby (the phone: its accessibilityHint); inside a FormField the field's description and error follow it, and on the web and desktop the switch takes its aria-invalid and aria-required.",
      "The thumb travels toward the end edge, so it moves the other way in a right-to-left tree. The on state is brand-coloured against a grey off track, and keyboard focus draws a ring on the track.",
    ],
  },
  examples: [
    {
      name: "Notification sound",
      props: {},
      width: 280,
    },
    {
      name: "Show Notifications, off",
      props: {
        label: "Show Notifications",
        icon: "bell",
        checked: false,
      },
      width: 280,
    },
    {
      name: "Push notifications",
      props: {
        label: "Push notifications",
        icon: "",
        description: "Mentions, DMs and replies in threads you follow.",
      },
      platforms: ["mobile"],
      width: 360,
    },
    {
      name: "Switch alone",
      props: {
        hideLabel: true,
        label: "Bluetooth proximity",
      },
    },
    {
      name: "Locked on",
      props: {
        label: "Private channel",
        icon: "lock",
        description: "A channel filed under a project stays private.",
        disabled: true,
      },
      width: 320,
    },
  ],
  matrix: [
    {
      prop: "checked",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "The OS has notifications turned off",
      platforms: ["web", "desktop", "mobile"],
      handling: "Turning a notification switch on asks for permission the first time. If permission is denied the switch returns to off and the description names the fix, per OS: iPhone \"Turn them on in Settings → AntFabric → Notifications.\" Android \"Allow notifications for AntFabric in Settings → Apps.\" macOS \"Allow AntFabric in System Settings → Notifications.\" Windows \"Turn on notifications for AntFabric in Settings → System → Notifications.\" Browser \"Your browser is blocking notifications for this site.\" Each with an Open Settings action where the OS allows deep-linking.",
      example: {
        name: "Permission denied",
        props: {
          label: "Push notifications",
          icon: "bell-off",
          checked: false,
          description: "Notifications are off for AntFabric. Turn them on in Settings → AntFabric → Notifications.",
        },
        width: 360,
      },
    },
    {
      title: "A server-backed change fails",
      platforms: ["web", "desktop", "mobile"],
      handling: "The thumb moves at once. If the write is refused it moves back and a toast says \"Couldn't change Push notifications. Try again.\" Toggling again while a write is in flight is allowed; writes coalesce and the last value wins. Offline on the phone, account settings refuse with \"You're offline. Try again when you're connected.\" and the switch does not move.",
    },
    {
      title: "Changed on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "Account settings sync: turning mentions off on the phone moves the desktop's switch in place. Device settings (Notification sound, Show Notifications on desktop, Bluetooth proximity on the phone) never sync — each describes this machine.",
    },
    {
      title: "Switch or checkbox",
      platforms: ["web", "desktop", "mobile"],
      handling: "A switch applies immediately. Anything confirmed by a Save button, or a choice in a list of several, is a checkbox. Inside a menu it is always a checkbox row (menuitemcheckbox) — the desktop ⚙ menu's two settings are exactly that.",
    },
    {
      title: "A muted rail must not look normal",
      platforms: ["desktop"],
      handling: "With Show Notifications off and the window hidden in the tray, nothing tells the person they muted it — so the rail's ⚙ stays visibly loud while either switch is off, and the tray menu shows \"Notifications paused\".",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop", "mobile"],
      handling: "The thumb jumps instead of sliding and the track colour changes without a fade. iOS's own switch honours the system setting itself.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "The label and description wrap; the switch stays the platform size and is centred on the row. The whole row stays the tap target.",
    },
  ],
  related: ["checkbox", "menu", "settings-row"],
  flows: [
    {
      id: "push-notifications",
      title: "Turn on push notifications",
      description: "A switch that needs the phone's permission. It only stays on if the OS says yes; otherwise it springs back and says why underneath.",
      platforms: ["mobile"],
      width: 360,
      steps: [
        {
          kind: "data",
          title: "The switch reads the saved setting",
          detail: "The profile screen also re-reads the OS permission whenever the app comes back to the front, so turning notifications off in Settings can't leave the switch claiming on.",
          code: "const pushEnabled = useAppStore((s) => s.pushEnabled)  ·  AppState.addEventListener('change', (next) => { if (next === 'active') void sync() })",
        },
        {
          kind: "trigger",
          title: "The switch is tapped",
          detail: "The switch is the trailing control of the Push notifications row, and takes that label as its accessible name.",
        },
        {
          kind: "event",
          title: "onCheckedChange(true) fires",
          code: "onCheckedChange?.(!checked)  // onValueChange={togglePush}",
        },
        {
          kind: "effect",
          title: "The OS is asked",
          detail: "If iOS will no longer show its prompt, the app opens Settings instead and says Turn on notifications for AntFabric in Settings, then come back here.",
          code: "const result = await requestPushPermission()",
        },
        {
          kind: "state",
          title: "The store keeps what the OS answered",
          detail: "Never what was tapped: the switch is on only when permission was granted.",
          code: "setPushEnabled(result === 'granted')",
        },
        {
          kind: "motion",
          title: "The thumb slides across",
          detail: "20pt on iOS and 16dp on Android, the way the native switches move it, while the track fades to the tenant's primary.",
        },
        {
          kind: "result",
          title: "On, or back off with a reason",
          detail: "Denied springs the switch back and the line under it says Notifications are turned off for AntFabric in iOS Settings. Turn them on there first.",
          code: "setPushNotice(pushPermissionMessage(result))",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            label: "Push notifications",
            icon: "bell",
            description: "Notifications don't show content. Open the app to see it",
            checked: false,
          },
        },
        {
          step: 1,
          press: 0,
          hold: 900,
          props: {
            label: "Push notifications",
            icon: "bell",
            description: "Notifications don't show content. Open the app to see it",
            checked: false,
          },
        },
        {
          step: 5,
          hold: 1800,
          props: {
            label: "Push notifications",
            icon: "bell",
            description: "Notifications don't show content. Open the app to see it",
            checked: true,
          },
        },
      ],
    },
    {
      id: "notification-sound",
      title: "Turn off the notification sound",
      description: "A device setting that applies the moment it flips. No Save: the store writes it, and the next notification arrives without a sound.",
      platforms: ["web", "desktop"],
      width: 300,
      steps: [
        {
          kind: "data",
          title: "The setting is a device preference",
          detail: "Loaded from notify-prefs at mount and never synced to the phone. Today the desktop shows it as a ticked row in the notification rail's ⚙ menu; this switch is for Preferences → Notifications, with the same label.",
          code: "checked={s.notifSoundEnabled}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The setting lives in localStorage",
          detail: "The web app keeps it where the desktop's browser build already does, under antfabric.notifications.prefs.",
          code: "localStorage.getItem('antfabric.notifications.prefs')",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The switch is pressed",
          detail: "A click, or Space with it focused. The whole row is the target.",
        },
        {
          kind: "event",
          title: "onCheckedChange(false) fires",
          code: "onCheckedChange?.(!checked)  // false",
        },
        {
          kind: "state",
          title: "The store saves it and applies it",
          detail: "savePrefs writes both switches to this device, and the store flag changes in the same call; the notifier reads soundEnabled from the store when the next one arrives.",
          code: "written = { ...switches(), sound: on }; savePrefs({ ...written }); set({ notifSoundEnabled: on, notifPrefsLoaded: true })",
        },
        {
          kind: "motion",
          title: "The thumb slides 12px",
          detail: "By transform, while the track fades from coral to grey.",
        },
        {
          kind: "result",
          title: "The rail's ⚙ stays loud while it's off",
          detail: "While either notification setting is off, the ⚙ keeps a muted fill, so a mute is never invisible.",
          code: "style={allOn || open ? undefined : { background: t.surface.muted, color: t.fg.body }}",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {
            label: "Notification sound",
            icon: "volume-2",
            checked: true,
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          props: {
            label: "Notification sound",
            icon: "volume-2",
            checked: true,
          },
        },
        {
          step: 2,
          press: 0,
          hold: 900,
          props: {
            label: "Notification sound",
            icon: "volume-2",
            checked: true,
          },
        },
        {
          step: 5,
          hold: 1800,
          props: {
            label: "Notification sound",
            icon: "volume-2",
            checked: false,
          },
        },
      ],
    },
  ],
};

export default docs;
