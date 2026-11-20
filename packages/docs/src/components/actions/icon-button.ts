import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "icon-button",
  name: "Icon button",
  category: "actions",
  level: "atom",
  status: "stable",
  description: "A single glyph that does one thing. The label is required: it is the tooltip on web and desktop and the accessibility label on mobile, so an icon is never unnamed.",
  props: {
    icon: {
      type: "icon",
      sample: "bell",
      required: true,
    },
    label: {
      type: "string",
      sample: "Notifications",
      required: true,
    },
    variant: {
      type: "enum",
      options: ["ghost", "soft", "solid", "outline"],
      default: "ghost",
    },
    shape: {
      type: "enum",
      options: ["circle", "square"],
      default: "circle",
    },
    size: {
      type: "enum",
      options: ["sm", "md"],
      default: "md",
    },
    active: {
      type: "boolean",
      default: false,
      description: "Toggled on (e.g. the notification rail is open). Sets aria-pressed.",
    },
    toggle: {
      type: "boolean",
      default: false,
      description: "A toggle button (aria-pressed): pressing flips `active`, e.g. opening the notification rail or the thread panel. Off for one-shot actions — Close, Copy, Clear — which only give press feedback.",
    },
    tone: {
      type: "enum",
      options: ["neutral", "danger"],
      default: "neutral",
    },
    badge: {
      type: "number",
      default: 0,
      description: "Unread count drawn on the corner. 0 hides it.",
    },
    dot: {
      type: "boolean",
      default: false,
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    avatar: {
      type: "object",
      description:
        "{ name, src?, identity?, presence? }: a person's face in place of the icon, filling the button (a profile button). `label` stays the name read aloud; the face is hidden from screen readers so it is not read twice. `icon` is still required and is not drawn while `avatar` is set.",
    },
    onActiveChange: {
      type: "event",
      args: "active: boolean",
      changes: "active",
      description: "Called with `active` as the press leaves it: flipped. Only a toggle changes it; a one-shot button never calls it.",
    },
    onPress: {
      type: "event",
      description: "The button was pressed, toggle or not.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<button> with the label as aria-label and native title tooltip, inline styles over `t`; hover, press and focus from useInteraction; `active` through useControllable; corner Badge",
      import: "import { IconButton } from \"@antfabric-ui/react\"",
      notes: [
        "Pressing a toggle button (toggle: true) flips `active` (through useControllable, so the catalogue preview is interactive): the brand-soft fill and brand glyph fade in and out, and aria-pressed follows. A one-shot button's own action (open, send, close) stays with the caller.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Activates",
        },
        {
          keys: "Focus",
          action: "Shows the tooltip immediately (no hover delay)",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <button> as web: inline styles over `t` at desktop density (28px box); the label is the native title tooltip",
      import: "import { IconButton } from \"@antfabric-ui/react\"",
      notes: [
        "Today the desktop draws 28px; that stays. The 24px hit minimum is met by the 28px box.",
        "Pressing a toggle button (toggle: true) flips `active`: the brand-soft fill fades in over 120ms and aria-pressed follows.",
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable (Animated) with hitSlop to 44pt, StyleSheet over useTheme(); press scale with Animated.timing; `active` through useControllable; corner Badge. Haptics and the long-press callout are left to the app",
      import: "import { IconButton } from \"@antfabric-ui/react-native\"",
      notes: [
        "40pt visible box (V2), with hitSlop to make 44pt.",
        "Danger tone turns red only while pressed — a resting red icon reads as an error.",
        "Tapping toggles `active` (accessibilityState.selected follows); the press scale eases back over 120ms.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Activates with a light haptic",
        },
        {
          gesture: "Long press",
          action: "Shows the label as a tooltip-style callout (iOS 17 / Android 14 pattern)",
        },
      ],
    },
  },
  a11y: {
    role: "button",
    label: "{label}",
    notes: [
      "Toggle buttons expose aria-pressed / accessibilityState.selected.",
      "The badge count joins the label: \"Notifications, 4 unread\".",
      "The web draws a 24px (sm) or 28px (md) target by default and grows to a finger's size on a touch screen; the phone draws 32 or 40pt and grows the touch area to 44pt without drawing more.",
      "With `avatar`, the face is aria-hidden (web) / hidden from accessibility (phone): the button is named by `label` once, e.g. \"Your profile: Priya Raman\".",
    ],
  },
  examples: [
    {
      name: "Ghost",
      props: {
        icon: "bell",
        label: "Notifications",
      },
    },
    {
      name: "Toggle — press it",
      description: "A toggle button: each press flips it on and off.",
      props: {
        icon: "panel-right",
        label: "Thread panel",
        toggle: true,
      },
    },
    {
      name: "With badge",
      props: {
        icon: "bell",
        label: "Notifications",
        badge: 4,
      },
    },
    {
      name: "Active",
      props: {
        icon: "panel-right",
        label: "Thread panel",
        active: true,
        toggle: true,
      },
    },
    {
      name: "Soft square",
      props: {
        icon: "paperclip",
        label: "Attach",
        variant: "soft",
        shape: "square",
      },
    },
    {
      name: "Solid",
      props: {
        icon: "plus",
        label: "New message",
        variant: "solid",
      },
    },
    {
      name: "Profile",
      description: "A person's face in place of the icon: the button that opens their profile, at the end of a top bar.",
      props: {
        icon: "user",
        label: "Your profile: Priya Raman",
        avatar: {
          name: "Priya Raman",
          identity: "indigo",
          presence: "active",
        },
      },
    },
  ],
  matrix: [
    {
      prop: "variant",
    },
    {
      prop: "size",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "Badge over 9",
      platforms: ["web", "desktop", "mobile"],
      handling: "A corner badge caps at 9+ so it never covers the glyph.",
      example: {
        name: "Capped",
        props: {
          icon: "inbox",
          label: "Inbox",
          badge: 27,
        },
      },
    },
    {
      title: "A face in place of the icon",
      platforms: ["web", "desktop", "mobile"],
      handling: "With `avatar`, the face fills the button's own box at every size and platform (its own avatar sizes differ), takes the button's shape, and keeps the focus ring and badge. A photo that fails to load falls back to the initials, as Avatar does.",
      example: {
        name: "Small square profile with a badge",
        props: {
          icon: "user",
          label: "Your profile: Arjun Mehta",
          size: "sm",
          shape: "square",
          badge: 2,
          avatar: {
            name: "Arjun Mehta",
            identity: "green",
          },
        },
      },
    },
    {
      title: "Touch on a laptop screen",
      platforms: ["web", "desktop"],
      handling: "pointer: coarse raises the box to the mobile 40px so a finger on a Surface or touch Chromebook can hit it; the glyph stays the same size.",
    },
  ],
  related: ["button", "badge", "tooltip"],
  flows: [
    {
      id: "bell-opens-rail",
      title: "The bell opens the notification rail",
      description: "A toggle icon button: the bell shows how many are waiting, opens the rail, and stays lit for as long as the rail is open.",
      platforms: ["web", "desktop"],
      width: 420,
      steps: [
        {
          kind: "data",
          title: "The store holds the count and whether the rail is open",
          detail: "unread feeds the badge (capped at 9+) and the accessible name; railOpen lights the bell and sets aria-pressed. Today the rail's NotifButton is its own <button>, drawn the way this spec draws a toggle icon button with a badge.",
          code: "aria-label={hasUnread ? `Notifications, ${s.unread} unread` : 'Notifications'}  aria-pressed={s.railOpen}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The count comes from the notifications query",
          detail: "The shell route reads the inbox with TanStack Query and keeps the rail's open state in the URL's search params, so a reload lands with the rail as it was.",
          code: "const { data } = useQuery(notificationsQuery)  // badge={data.unread}  active={search.rail}",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The bell is pressed",
          detail: "A click, or Enter / Space with the bell focused. Pressing it again closes the rail, as Escape and a click on the scrim do.",
        },
        {
          kind: "event",
          title: "onPress fires",
          detail: "The button asks for nothing; the caller decides what the press opens. A toggle also reports `active` as the press leaves it, through `onActiveChange`.",
          code: "onPress?.()  // onClick={a.toggleNotif}",
        },
        {
          kind: "state",
          title: "The store flips railOpen and closes its neighbours",
          detail: "Opening the rail closes the notification popover and the profile card, so one panel owns the right edge.",
          code: "toggleNotif: () => set((s) => ({ railOpen: !s.railOpen, notifOpen: false, profileOpen: false }))",
        },
        {
          kind: "motion",
          title: "The rail slides in from the right",
          detail: "A light scrim comes up behind it and the rail slides in over 0.28 s, easing out; the panes underneath do not move. The bell's soft coral fill fades in at the same time.",
          enter: "slide-left",
        },
        {
          kind: "result",
          title: "The bell stays lit while the rail is open",
          detail: "active is railOpen read back from the store, not the button's own memory, so the bell, the scrim and Escape always agree.",
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
              width: 420,
              minHeight: 300,
              padding: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 4,
                  toggle: true,
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 420,
              minHeight: 300,
              padding: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 4,
                  toggle: true,
                },
              },
            ],
          },
        },
        {
          step: 2,
          press: 0,
          hold: 900,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 420,
              minHeight: 300,
              padding: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 4,
                  toggle: true,
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 2000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 420,
              minHeight: 300,
              padding: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 4,
                  toggle: true,
                  active: true,
                },
              },
              {
                el: "view",
                enter: "slide-left",
                style: {
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 320,
                  bg: "$surface.card",
                  borderLeft: "1px solid $border.subtle",
                  shadow: "$shadow.float",
                  padding: "$space.sm",
                  gap: "$space.2xs",
                },
                children: [
                  {
                    el: "text",
                    text: "Notifications",
                    style: {
                      fontSize: "$text.body",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                      paddingX: "$space.xs",
                      paddingY: "$space.xs",
                    },
                  },
                  {
                    el: "component",
                    use: "notification-item",
                    props: {
                      icon: "at-sign",
                      sender: "Priya Raman",
                      title: "Priya Raman · #platform-eng",
                      body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                      time: "4m ago",
                    },
                  },
                  {
                    el: "component",
                    use: "notification-item",
                    props: {
                      icon: "message-square-reply",
                      lead: "Replied in a thread",
                      sender: "Kwame Mensah",
                      title: "Kwame Mensah replied in #design-crit",
                      body: "Pushed the new empty states. Have a look before crit at 3.",
                      time: "12m ago",
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "funnel-opens-filters",
      title: "The funnel opens the recording filters",
      description: "A one-shot icon button that opens a sheet. It isn't a toggle, but its glyph and name still say whether the list behind it is narrowed.",
      platforms: ["mobile"],
      steps: [
        {
          kind: "data",
          title: "The screen works out whether the list is narrowed",
          detail: "Either filter away from All makes the funnel solid and coral and renames it Filters, active, so a short list never passes for the whole one.",
          code: "const filtering = deviceNarrowing || projectNarrowing  // name={filtering ? 'funnel' : 'funnel-outline'}",
        },
        {
          kind: "trigger",
          title: "The funnel is tapped",
          detail: "A light impact haptic lands with the press, and the glyph springs down and back while the 44pt target stays put.",
          code: "Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)",
        },
        {
          kind: "event",
          title: "onPress fires",
          code: "onPress?.()  // onPress={() => setFiltersOpen(true)}",
        },
        {
          kind: "state",
          title: "The screen opens its filter sheet",
          detail: "filtersOpen is local to the Meetings screen. The sheet gets the current device and project and a count for each device, so a choice is made knowing what it leaves.",
          code: "<RecordingFilterSheet visible={filtersOpen} device={device} deviceCounts={deviceCounts} onDevice={setDevice} … />",
        },
        {
          kind: "motion",
          title: "The sheet slides up",
          enter: "slide-up",
        },
        {
          kind: "trigger",
          title: "Desktop is chosen",
          detail: "Choosing a device moves the tick and keeps the sheet open, so device and project can both be set in one visit. ✕ or a swipe down closes it.",
          code: "onPress={() => onDevice(value)}",
        },
        {
          kind: "result",
          title: "The funnel turns coral",
          detail: "Back on the list the funnel reads Filters, active. If nothing matches, the empty state explains the filter and offers Clear filters instead of claiming there are no meetings.",
          code: "accessibilityLabel={filtering ? 'Filters, active' : 'Filters'}",
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
              minHeight: 560,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                  paddingX: "$gutter.pane",
                  paddingY: "$space.sm",
                },
                children: [
                  {
                    el: "text",
                    text: "Meetings",
                    style: {
                      fontSize: "$text.h3",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "icon-button",
                    props: {
                      icon: "funnel",
                      label: "Filters",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 1,
          press: 0,
          hold: 900,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 560,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                  paddingX: "$gutter.pane",
                  paddingY: "$space.sm",
                },
                children: [
                  {
                    el: "text",
                    text: "Meetings",
                    style: {
                      fontSize: "$text.h3",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "icon-button",
                    props: {
                      icon: "funnel",
                      label: "Filters",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1700,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 560,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                  paddingX: "$gutter.pane",
                  paddingY: "$space.sm",
                },
                children: [
                  {
                    el: "text",
                    text: "Meetings",
                    style: {
                      fontSize: "$text.h3",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "icon-button",
                    props: {
                      icon: "funnel",
                      label: "Filters",
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "bottom-sheet",
                style: {
                  position: "absolute",
                  inset: 0,
                },
                props: {
                  title: "Filter recordings",
                  children: [
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "All",
                        subtitle: "12 recordings",
                        leading: "none",
                        role: "option",
                        selected: true,
                      },
                      style: {
                        paddingX: 0,
                      },
                    },
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "This phone",
                        subtitle: "5 recordings",
                        leading: "none",
                        role: "option",
                      },
                      style: {
                        paddingX: 0,
                      },
                    },
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "Desktop",
                        subtitle: "6 recordings",
                        leading: "none",
                        role: "option",
                      },
                      style: {
                        paddingX: 0,
                      },
                    },
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "Shared",
                        subtitle: "1 recording",
                        leading: "none",
                        role: "option",
                      },
                      style: {
                        paddingX: 0,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 5,
          press: "Desktop, 6 recordings",
          hold: 1200,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 560,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                  paddingX: "$gutter.pane",
                  paddingY: "$space.sm",
                },
                children: [
                  {
                    el: "text",
                    text: "Meetings",
                    style: {
                      fontSize: "$text.h3",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "icon-button",
                    props: {
                      icon: "funnel",
                      label: "Filters",
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "bottom-sheet",
                style: {
                  position: "absolute",
                  inset: 0,
                },
                props: {
                  title: "Filter recordings",
                  children: [
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "All",
                        subtitle: "12 recordings",
                        leading: "none",
                        role: "option",
                        selected: true,
                      },
                      style: {
                        paddingX: 0,
                      },
                    },
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "This phone",
                        subtitle: "5 recordings",
                        leading: "none",
                        role: "option",
                      },
                      style: {
                        paddingX: 0,
                      },
                    },
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "Desktop",
                        subtitle: "6 recordings",
                        leading: "none",
                        role: "option",
                      },
                      style: {
                        paddingX: 0,
                      },
                    },
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "Shared",
                        subtitle: "1 recording",
                        leading: "none",
                        role: "option",
                      },
                      style: {
                        paddingX: 0,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 560,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                  paddingX: "$gutter.pane",
                  paddingY: "$space.sm",
                },
                children: [
                  {
                    el: "text",
                    text: "Meetings",
                    style: {
                      fontSize: "$text.h3",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "icon-button",
                    props: {
                      icon: "funnel",
                      label: "Filters, active",
                      active: true,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
