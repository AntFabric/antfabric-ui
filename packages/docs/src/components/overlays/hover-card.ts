import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "hover-card",
  name: "Hover card",
  category: "overlays",
  level: "molecule",
  status: "beta",
  description: "Who someone is, without leaving the conversation: rest the pointer on a name or an avatar (360 ms in the kit; the app's own is 380) or tab to it and a 260px card shows their face, name, title, presence, local time and status, with Message and View profile. The card sits flush with its trigger, so the pointer can move into it without closing it.",
  props: {
    name: {
      type: "string",
      sample: "Kenji Watanabe",
      required: true,
      description: "From the one profile source. Never an id: \"Unknown user\" when nothing resolves it.",
    },
    src: {
      type: "string",
      default: "",
      description: "Photo URL. Initials until it decodes.",
    },
    identity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red", "agent"],
      default: "indigo",
    },
    title: {
      type: "string",
      default: "",
      sample: "Staff Engineer · Platform",
      description: "Job title and team from the HR directory. Empty draws no line.",
    },
    presence: {
      type: "enum",
      options: ["active", "away", "offline", "unknown"],
      default: "active",
      description: "Spelled out as a word beside a 9px dot. Away and offline use the same hollow dot on purpose; the word tells them apart. unknown is while this device is offline: no dot and no word, rather than a stale one.",
    },
    localTime: {
      type: "string",
      default: "",
      sample: "4:12 pm local time",
      description: "Their wall-clock time, in your time format. Empty when the profile has no timezone, and the line then reads presence alone.",
    },
    statusEmoji: {
      type: "string",
      default: "",
      sample: "🗓️",
    },
    statusText: {
      type: "string",
      default: "",
      sample: "In a meeting",
      description: "Their own status. Empty draws no line at all, not a placeholder.",
    },
    statusUntil: {
      type: "string",
      default: "",
      sample: "until 4:30 pm",
      description: "The expiry, appended after a middle dot. Comes from expiryLabel so it reads the same as the sidebar's.",
    },
    agent: {
      type: "boolean",
      default: false,
      description: "An AI agent such as Fabric: the sparkle badge, the word Agent on a coral dot, no local time and no profile button.",
    },
    guest: {
      type: "boolean",
      default: false,
      description: "Someone from outside the organisation. A square Guest tag after the name.",
    },
    self: {
      type: "boolean",
      default: false,
      description: "Your own card. Message becomes Message yourself (AntFabric's copy says Open your space).",
    },
    deleted: {
      type: "boolean",
      default: false,
      description: "A deleted account. The card still opens (their old messages are on screen) but offers no Message, because that DM would be dropped by the next sidebar refresh.",
    },
    placement: {
      type: "enum",
      options: ["down", "up"],
      default: "down",
      description: "Set by the caller, not measured: up for a trigger near the bottom of a list.",
    },
    showTrigger: {
      type: "boolean",
      default: true,
      description: "With no children: draws the name the card was opened from, above or below the card.",
    },
    children: {
      type: "node",
      description: "What the card hangs from (a name, an avatar, an @mention). The card floats beside it, opens on its hover after a short rest and on keyboard focus, closes on Esc, blur and leave, and the trigger is aria-describedby it while it is open.",
    },
    open: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The card is showing. Hover and keyboard focus change it; set it to draw the card open (the catalogue does).",
    },
    onOpenChange: {
      type: "event",
      args: "open: boolean",
      changes: "open",
    },
    onMessage: {
      type: "event",
    },
    onViewProfile: {
      type: "event",
    },
    onClose: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A labelled role=\"group\" card that the trigger points at with aria-describedby: Avatar and two secondary Buttons, inline styles over `t`; pops in with enter(\"pop\"); Esc calls onClose and stops there. The open and close delays are the app's",
      import: "import { HoverCard } from \"@antfabric-ui/react\"",
      notes: [
        "Same card, same timings and the same two buttons as desktop.",
        "Opens on hover only where (hover: hover) and (pointer: fine). Under pointer: coarse (a touch laptop, a tablet with a trackpad detached) a tap on the name or avatar opens it at once, a tap outside closes it, and a second tap on the trigger follows its own action (opens the profile).",
        "The Positioner flips and shifts to stay 8px inside the viewport, so the web does not need the caller's placement; the prop is kept for parity and as the preferred side.",
        "View profile is a real link (<a href=\"/people/…\">), so ⌘-click and middle-click open the profile in a new tab.",
      ],
      keyboard: [
        {
          keys: "Tab onto the trigger",
          action: "Opens after the same 380 ms; focus stays on the trigger",
        },
        {
          keys: "Tab",
          action: "Moves into Message, then View profile; leaving the card closes it after 180 ms",
        },
        {
          keys: "Esc",
          action: "Closes at once and stops there, so the dialog or panel behind stays open",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same card as web at desktop density",
      import: "import { HoverCard } from \"@antfabric-ui/react\"",
      notes: [
        "Today the mechanism is hand-rolled in parts/HoverCard.tsx and the panel is a sibling of the trigger. The 6px gap is padding on the panel's wrapper, never a margin on the panel, so the pointer never crosses a dead zone on the way in; the panel's own mouseenter cancels the pending close.",
        "Both timers are cleared on unmount: the message list unmounts rows as it scrolls, and a timer that fires afterwards is a leak nobody sees.",
        "z-index 80: above the menu panel layer (61) so a card opened over an open menu is readable, below the notification rail.",
        "The card pops in (a short scale and fade from its trigger side); the catalogue's Replay plays it.",
        "The status emoji does not go on the avatar here. Presence is a word on the line below, so the card never says the same thing twice.",
        "Message and View profile are both secondary (ADR-9320). A card that opens because the pointer drifted has no commit action, so nothing in it is coral.",
        "New in this spec: the job title and the local time. Today's card leaves both out because the platform serves no timezone; each line is drawn only when the profile carries it.",
        "The mention pill's card (overlays/MentionProfileCard.tsx) is mounted once per screen and uses the same HoverCardSurface, so the two cards cannot drift apart.",
      ],
      keyboard: [
        {
          keys: "Tab onto the trigger",
          action: "Opens after 380 ms, as hover does",
        },
        {
          keys: "Tab",
          action: "Moves into the card's buttons",
        },
        {
          keys: "Esc",
          action: "Closes immediately and stops propagation",
        },
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "A phone has no hover. Tapping an avatar or a name opens the person's profile sheet (a Bottom sheet): the same photo, name, title, presence, local time and status in the same order, with Message and View profile full width at the foot. Long-press stays free for the message's own actions.",
    },
  },
  a11y: {
    role: "group",
    label: "{name}",
    notes: [
      "The trigger (your `children`, or the built-in name button) is described by the card while it is open (aria-describedby), not marked aria-haspopup: this is a description of a person, not a menu.",
      "The card is a labelled group, not role=tooltip: it holds two buttons, and ARIA does not allow controls inside a tooltip. It opens after a 360 ms rest on hover and at once on keyboard focus, closes on Esc, blur and leave, and is hoverable (it sits flush with the trigger inside the same host). Avatars beside the name are hidden from assistive tech.",
      "Everything in the card is reachable without it: the name opens the profile and the profile has Message. The card is a shortcut, never the only way.",
      "Presence is a word, never the dot alone.",
    ],
  },
  examples: [
    {
      name: "Colleague in a meeting",
    },
    {
      name: "No status, away",
      props: {
        name: "Mei Lin",
        identity: "red",
        title: "QA Lead · Release Train",
        presence: "away",
        localTime: "9:42 am local time",
        statusText: "",
      },
    },
    {
      name: "Agent",
      props: {
        name: "Fabric",
        identity: "agent",
        agent: true,
        title: "AI agent · answers from your workspace",
        statusText: "",
      },
    },
    {
      name: "Guest",
      props: {
        name: "Lucía Ortega",
        identity: "green",
        guest: true,
        title: "Contractor · Brightline Studio",
        presence: "active",
        localTime: "11:12 am local time",
        statusEmoji: "🎨",
        statusText: "Reviewing #design-crit",
      },
    },
    {
      name: "Card only",
      props: {
        showTrigger: false,
        name: "Aisha Bello",
        identity: "ochre",
        title: "Product Designer",
        statusEmoji: "🌴",
        statusText: "Out until Monday",
        statusUntil: "",
      },
    },
  ],
  matrix: [
    {
      prop: "presence",
    },
    {
      prop: "placement",
    },
  ],
  edgeCases: [
    {
      title: "Sweeping the pointer down a list of authors",
      platforms: ["web", "desktop"],
      handling: "Nothing opens until the pointer rests for 380 ms, so dragging across ten names opens none. Leaving the trigger waits 180 ms before closing, long enough to cross the 6px gap; entering the panel cancels the close. Avatar and name triggers carry data-tip=\"\" so the 320 ms tooltip never arrives first and covers the card.",
    },
    {
      title: "A row near the bottom of the list",
      platforms: ["web", "desktop"],
      handling: "The desktop caller passes placement=\"up\", because flipping automatically needs the panel's height before it renders, and guessing is how a card ends up half off-screen the other way. The web's Positioner flips on its own and treats the prop as the preferred side.",
      example: {
        name: "Opens upward",
        props: {
          placement: "up",
        },
      },
    },
    {
      title: "Long name, title and status",
      platforms: ["web", "desktop"],
      handling: "The name and the title each stay on one line and end in an ellipsis; the name's line height is the body leading, not 1, so descenders are not clipped. The status wraps to two lines, then truncates. The card never grows wider than 260px.",
      example: {
        name: "Everything long",
        props: {
          name: "Oluwaseun Adebayo-Fitzgerald",
          identity: "green",
          title: "Principal Engineer, Payments Reliability and Incident Response",
          statusEmoji: "✈️",
          statusText: "Travelling to the Bangalore office for the quarterly planning week, slow to reply",
          statusUntil: "until Fri 6:00 pm",
        },
      },
    },
    {
      title: "Your own card",
      platforms: ["web", "desktop"],
      handling: "Hovering your own name on a message you wrote opens your card. Message reads Open your space, which opens your notes-to-self conversation; View profile goes to your own profile.",
      example: {
        name: "Yourself",
        props: {
          self: true,
          name: "Priya Raman",
          identity: "indigo",
          title: "Engineering Manager · Platform",
          statusText: "",
        },
      },
    },
    {
      title: "A deleted account",
      platforms: ["web", "desktop"],
      handling: "Their old messages are still on screen, so the card still opens, reading Deleted user in the neutral ink colour with no presence, status or time. There is no Message button: the sidebar drops a DM with a deleted account on its next refresh, so the button would create a conversation and lose it a moment later.",
      example: {
        name: "Deleted user",
        props: {
          deleted: true,
          name: "Former Member",
        },
      },
    },
    {
      title: "Keyboard only and screen readers",
      platforms: ["web", "desktop"],
      handling: "Focus on the trigger opens the card after the same delay, so a keyboard user gets the same card. Tab moves into Message and View profile; Esc closes it at once and stops there, so Esc does not also close the thread panel or dialog behind. A screen reader hears the name and title as the trigger's description, not a tooltip.",
    },
    {
      title: "Touch screen on a laptop",
      platforms: ["web", "desktop"],
      handling: "With pointer: coarse (a Surface, a touch Chromebook) there is no hover to rest on. A tap on the name or avatar opens the card at once with no delay; a tap outside closes it; tapping the trigger again follows its own action. The 26px buttons are too small for a finger, so while the pointer is coarse they grow to the md control height (34px desktop, 36px web).",
    },
    {
      title: "Offline, or presence and timezone not known",
      platforms: ["web", "desktop"],
      handling: "While this device is offline, other people's presence is unknown, so the line shows the local time alone (worked out on this device from the cached timezone) rather than a stale Active. The desktop draws the name, title and status from its SQLite cache; an expired status is dropped when it is read, not shown with a past until. With no timezone on the profile, the time is left out and the presence word stands alone.",
      example: {
        name: "This device offline",
        props: {
          presence: "unknown",
        },
      },
    },
  ],
  related: ["avatar", "tooltip", "bottom-sheet", "menu"],
  flows: [
    {
      id: "rest-on-a-name",
      title: "Rest on a name, then message them",
      description: "Who wrote this, without leaving the conversation. The card waits for the pointer to settle, stays while you move into it, and its Message opens the DM.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "The card reads one profile",
          detail: "Name, photo, presence and status come out of one call over the directory and the live presence map, so the card, the avatar and the sidebar can't disagree about a person.",
          code: "const profile = useUserProfile(userId)  // composeProfile({ names: s.people, directory: s.directory, live: s.profileState, now })",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The person comes from the directory query",
          detail: "One TanStack Query read of the people directory feeds every avatar; the socket patches presence and status into it, so opening the card makes no request.",
          code: "const { data: person } = useQuery({ ...peopleQueries.directory(), select: (d) => d.byId[userId] })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The pointer rests on Kenji Watanabe's name",
          detail: "Or Tab lands on it. The face and the name on every message are each wrapped in a HoverCard; a click on the name opens their profile instead.",
          code: "<HoverCard card={<ProfileHoverCard userId={m.authorId} />}>",
        },
        {
          kind: "state",
          title: "A 380 ms timer starts",
          detail: "Leaving before it fires cancels it, so sweeping the pointer down a column of names opens nothing. Both timers are cleared on unmount, because the list unmounts rows as it scrolls.",
          code: "openT.current = setTimeout(() => setOpen(true), HOVER_OPEN_MS)",
        },
        {
          kind: "motion",
          title: "The card pops in under the name",
          detail: "6px below the trigger; the gap is padding on the card's wrapper, so the pointer never crosses dead space on the way in. Today's surface rises (af-rise); this spec pops it.",
          enter: "pop",
        },
        {
          kind: "state",
          title: "Moving into the card keeps it open",
          detail: "Leaving the name starts a 180 ms close, and the card's own mouseenter cancels it.",
          code: "onMouseLeave={scheduleClose}  ·  panel onMouseEnter={clear}",
        },
        {
          kind: "trigger",
          title: "Message is pressed",
          detail: "Both buttons are secondary: a card that opened because the pointer drifted has no coral commit. On your own card it reads Open your space.",
        },
        {
          kind: "event",
          title: "onMessage fires",
          code: "onMessage?.()",
        },
        {
          kind: "effect",
          title: "The DM opens, or is made",
          detail: "openDirect is idempotent upstream: it returns the conversation you already have with Kenji or creates one, and the sidebar row keeps the channel's own last activity rather than jumping to the top.",
          code: "backend.channels.openDirect(userId).then((channel) => set((s) => ({ dms: …, dmChannelByUser: { ...s.dmChannelByUser, [userId]: channel.id } })))",
        },
        {
          kind: "result",
          title: "The card is gone and the DM is open",
          detail: "The trail reads Channels \\ Direct messages \\ Kenji Watanabe. Escape closes the card at once instead, and stops there, so the pane behind stays open.",
        },
      ],
      replay: [
        {
          step: 2,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 340,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "release-train",
                      label: "#release-train",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
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
              width: 520,
              minHeight: 340,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "release-train",
                      label: "#release-train",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "hover-card",
                style: {
                  position: "absolute",
                  top: 86,
                  left: 60,
                },
                props: {
                  showTrigger: false,
                  name: "Kenji Watanabe",
                  identity: "indigo",
                  title: "Staff Engineer · Platform",
                  presence: "active",
                  localTime: "4:12 pm local time",
                  statusEmoji: "🚆",
                  statusText: "Release captain this week",
                  statusUntil: "",
                },
              },
            ],
          },
        },
        {
          step: 6,
          press: "Message",
          hold: 1000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 340,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "release-train",
                      label: "#release-train",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "hover-card",
                style: {
                  position: "absolute",
                  top: 86,
                  left: 60,
                },
                props: {
                  showTrigger: false,
                  name: "Kenji Watanabe",
                  identity: "indigo",
                  title: "Staff Engineer · Platform",
                  presence: "active",
                  localTime: "4:12 pm local time",
                  statusEmoji: "🚆",
                  statusText: "Release captain this week",
                  statusUntil: "",
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1700,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 340,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "direct-messages",
                      label: "Direct messages",
                    },
                    {
                      key: "kenji-watanabe",
                      label: "Kenji Watanabe",
                    },
                  ],
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
