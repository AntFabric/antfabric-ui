import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "sidebar-item",
  name: "Sidebar item",
  category: "shell",
  level: "molecule",
  status: "beta",
  description: "One channel or conversation in the sidebar: a # or lock or a face, the name, and what it needs from you. Bold means unread, a coral count means someone asked for you, dimmed with a crossed bell means muted. Dense on desktop and web; on a phone it is a full-width row of one line, as V2 draws it today, with a second only while someone types.",
  props: {
    name: {
      type: "string",
      sample: "platform-eng",
      required: true,
      description: "The name. The row draws `glyph` before it.",
    },
    glyph: {
      type: "string",
      default: "",
      sample: "#",
      description: "A one-character text mark before the name, read with it (\"#\" for a channel). Empty draws none.",
    },
    icon: {
      type: "icon",
      default: "",
      description: "A leading icon, not read (\"lock\", \"users\"). Empty draws none.",
    },
    avatar: {
      type: "boolean",
      default: false,
      description: "Draws the name's face, from `avatarSrc`, `identity`, `presence` and `agent`.",
    },
    description: {
      type: "string",
      default: "",
      description: "Read after the name, not drawn (\"private channel\").",
    },
    avatarSrc: {
      type: "string",
      default: "",
    },
    identity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red", "agent"],
      default: "indigo",
    },
    presence: {
      type: "enum",
      options: ["none", "active", "away", "dnd", "offline"],
      default: "none",
    },
    agent: {
      type: "boolean",
      default: false,
      description: "A conversation with an AI agent.",
    },
    unread: {
      type: "boolean",
      default: false,
      description: "Something new you have not read. Bold — unless muted.",
    },
    mentions: {
      type: "number",
      default: 0,
      description: "Mentions, or every unread message in a DM. Shown even when muted.",
    },
    muted: {
      type: "boolean",
      default: false,
    },
    draft: {
      type: "boolean",
      default: false,
      description: "An unsent draft is waiting here.",
    },
    active: {
      type: "boolean",
      default: false,
      description: "This is the conversation on screen. Medium weight on a grey fill — never coral, which marks selection only in the nav rail.",
    },
    selectedName: {
      type: "string",
      default: "",
      description: "The row a surrounding list has selected — sidebar-section passes its `selected`. When set, this row is active exactly when it is the named one, whatever `active` says; empty leaves it to `active`.",
    },
    typing: {
      type: "boolean",
      default: false,
    },
    typingText: {
      type: "string",
      default: "",
      description: "What is read while someone types, and what the phone's second line says. Empty uses the `typing` string (\"typing…\"); a channel might say \"Aisha is typing…\".",
    },
    external: {
      type: "boolean",
      default: false,
      description: "Shared with another organisation.",
    },
    actionsVisible: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "The row's ⋮ (Move to…, Mute, Leave), always shown when set. With `onMenu` alone it is there but transparent until the pointer is over the row or keyboard focus is in it; the room for it is reserved, so showing it never reflows the row.",
    },
    onPress: {
      type: "event",
    },
    onMenu: {
      type: "event",
      platforms: ["web", "desktop"],
      description: "The row's options were asked for: its ⋮ was pressed, the context menu was opened on the row, or Shift+F10 or the Menu key was pressed on it. The app opens its menu (Move to…, Mute, Leave) from it.",
    },
    onLongPress: {
      type: "event",
      platforms: ["mobile"],
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <button data-af-press> row (aria-current=\"page\" when open, one aria-label for the whole row) with Avatar and Badge, and the ⋮ IconButton laid over its right end as a sibling; inline styles over t, hover, press and focus from useInteraction. There is no href prop yet, so the kit's row is a button, not a link; the ⋮ reports `onMenu`, from which the app opens its Base UI <Menu>",
      import: "import { SidebarItem } from \"@antfabric/ui-react/shell\"",
      notes: [
        "Right-click opens the same menu as the ⋮; the browser's own context menu is still one Shift+right-click away.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "Opens the conversation",
        },
        {
          keys: "Shift+F10 / Menu key",
          action: "Opens the row's ⋮ menu",
        },
        {
          keys: "Alt+↑ / Alt+↓",
          action: "Previous / next conversation in sidebar order (not while typing)",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same @antfabric/ui-react component as the web: a <button> row (6/10 padding, radius.row) + Avatar, Badge and the ⋮ IconButton as a sibling; inline styles over t, states from useInteraction. active is kept by the row (useControllable) and toggled by a press; a surrounding section decides through selectedName",
      import: "import { SidebarItem } from \"@antfabric/ui-react/shell\"",
      notes: [
        "Unread is asked first: a channel you have open can still gather unread (window in the background) and then it is bold AND selected.",
        "The ⋮ is a sibling button laid over the row's right end, never a button inside a button; the row reserves its room only while it is shown, so it never covers the count. The catalogue draws it with actionsVisible.",
        "Muted and typing are new in this spec — today's sidebar has neither. Draft (pencil, fg.faint at 5.33:1, never an opacity) and the # / lock / face rules are today's.",
        "The external-organisation glyph is new; it stays on even when the row is muted, because who can read the channel is not a notification preference.",
        "Pressing the row makes it `active` (the grey selected fill fades in) and leaves it active if pressed again: the current page is not a toggle. Inside a sidebar-section the section's `selected` decides instead, through `selectedName`, so only one row is ever open.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Opens the conversation",
        },
        {
          keys: "Alt+↑ / Alt+↓",
          action: "Previous / next conversation in sidebar order",
        },
        {
          keys: "Shift+F10",
          action: "Opens the row's ⋮ menu",
        },
      ],
    },
    mobile: {
      status: "partial",
      base: "A full-bleed Pressable (accessibilityRole button, accessibilityState.selected, onLongPress) with inset content: Avatar, Badge, Icon and Text in StyleSheet over useTheme() tokens, fonts by file. Swipe actions are not in the kit; the list wraps rows in swipe-row",
      import: "import { SidebarItem } from \"@antfabric/ui-react-native/shell\"",
      notes: [
        "V2 today (owner, 2026-10-06) draws the name only — 44pt for a channel, 56pt for a DM — with no last message and no time, and so does the kit (2026-11-11): the last message and its time would need a backend change, so the row leaves them out. It grows to 64pt with a second line only while someone types.",
        "A draft is the desktop's pencil at the end of the name line, since there is no preview line to begin with 'Draft:'.",
        "There is no hover, so the ⋮ does not exist on a phone: long-press opens the row's action sheet and a swipe reveals the two commonest actions.",
        "Light haptic on press-in; selection haptic when the swipe crosses its threshold.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens the conversation",
        },
        {
          gesture: "Long press",
          action: "Action sheet: Mark as read, Mute, Star, Move to…, Leave",
        },
        {
          gesture: "Swipe left",
          action: "Reveals Mark as read and Mute",
        },
        {
          gesture: "Swipe right",
          action: "Marks as read in one move, with an Undo toast",
        },
      ],
    },
  },
  a11y: {
    role: "button",
    notes: [
      "A button on every platform (there is no href prop): the row reports `onPress` and the app navigates. Middle-click and open-in-new-tab are the app's to add.",
      "The whole row is one accessible name: '#design-crit, 3 mentions, muted, draft'. The glyph and the badge's own number are hidden so nothing is read twice.",
      "The open conversation has aria-current=\"page\" (selected on the phone); selection is never carried by colour alone. Pressing the open row leaves it open.",
      "Web and desktop: with `onMenu` the row's ⋮ appears while the row has pointer hover or keyboard focus and stays in the tab order; the context menu and Shift+F10 or the Menu key on the row also call `onMenu`.",
      "Phone: `onLongPress` is also an accessibility action, 'Options for #design-crit', so a screen reader, Voice Control or Switch Control user can run it.",
      "Typing is announced only when the row is focused — a live region on every row would be noise.",
    ],
  },
  examples: [
    {
      name: "Channel",
      props: {
        name: "platform-eng",
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Unread",
      props: {
        name: "release-train",
        unread: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Mentions",
      props: {
        name: "design-crit",
        unread: true,
        mentions: 3,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Open channel",
      props: {
        name: "platform-eng",
        active: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Private",
      props: {
        name: "leadership-sync",
        glyph: "",
        icon: "lock",
        description: "private channel",
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Direct message",
      props: {
        name: "Aisha Bello",
        glyph: "",
        avatar: true,
        identity: "ochre",
        presence: "active",
        unread: true,
        mentions: 2,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Fabric",
      props: {
        name: "Fabric",
        glyph: "",
        avatar: true,
        identity: "agent",
        agent: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Group conversation",
      props: {
        name: "Marcus, Priya, Tomás",
        glyph: "",
        icon: "users",
        description: "group conversation",
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Muted",
      props: {
        name: "random",
        muted: true,
        unread: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Draft waiting",
      props: {
        name: "incident-review",
        draft: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Typing",
      props: {
        name: "Marcus Chen",
        glyph: "",
        avatar: true,
        identity: "green",
        presence: "active",
        typing: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Shared with another organisation",
      props: {
        name: "acme-integration",
        external: true,
        unread: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Hovered, ⋮ shown",
      props: {
        name: "platform-eng",
        actionsVisible: true,
        mentions: 1,
        unread: true,
      },
      state: "hover",
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Channel",
      platforms: ["mobile"],
      width: 393,
    },
    {
      name: "DM with mentions",
      props: {
        name: "Aisha Bello",
        glyph: "",
        avatar: true,
        identity: "ochre",
        presence: "active",
        unread: true,
        mentions: 2,
      },
      platforms: ["mobile"],
      width: 393,
    },
    {
      name: "Typing (phone)",
      props: {
        name: "Marcus Chen",
        glyph: "",
        avatar: true,
        identity: "green",
        typing: true,
      },
      platforms: ["mobile"],
      width: 393,
    },
    {
      name: "Draft (phone)",
      props: {
        name: "incident-review",
        draft: true,
      },
      platforms: ["mobile"],
      width: 393,
    },
    {
      name: "Muted (phone)",
      props: {
        name: "random",
        muted: true,
        unread: true,
      },
      platforms: ["mobile"],
      width: 393,
    },
    {
      name: "Unread with mentions (phone)",
      props: {
        name: "design-crit",
        unread: true,
        mentions: 3,
      },
      platforms: ["mobile"],
      width: 393,
    },
  ],
  matrix: [
    {
      prop: "kind",
      cases: [
        { name: "channel", props: {} },
        { name: "private", props: { glyph: "", icon: "lock", description: "private channel" } },
        { name: "dm", props: { glyph: "", avatar: true } },
        { name: "group", props: { glyph: "", icon: "users", description: "group conversation" } },
      ],
    },
  ],
  states: ["hover", "pressed", "focus"],
  edgeCases: [
    {
      title: "Name longer than the sidebar",
      platforms: ["web", "desktop", "mobile"],
      handling: "One line, ellipsis at the end; the badge, draft and muted glyphs never shrink. The full name is the tooltip on web and desktop and the accessible name everywhere.",
      example: {
        name: "Long name",
        props: {
          name: "customer-escalations-emea-q4-renewals",
          unread: true,
          mentions: 4,
        },
        platforms: ["web", "desktop"],
        width: 248,
      },
    },
    {
      title: "A huge count",
      platforms: ["web", "desktop", "mobile"],
      handling: "The count caps at 99+ — past that the exact number has stopped changing what anyone does.",
      example: {
        name: "1,240 unread",
        props: {
          name: "Priya Raman",
          glyph: "",
          avatar: true,
          identity: "indigo",
          unread: true,
          mentions: 1240,
        },
        platforms: ["web", "desktop"],
        width: 248,
      },
    },
    {
      title: "Muted, with a mention",
      platforms: ["web", "desktop", "mobile"],
      handling: "Muting stops the bold and the sound for ordinary messages, never for someone asking for you: the coral count still shows on a dimmed row.",
      example: {
        name: "Muted mention",
        props: {
          name: "random",
          muted: true,
          unread: true,
          mentions: 1,
        },
        platforms: ["web", "desktop"],
        width: 248,
      },
    },
    {
      title: "Unread in the channel you have open",
      platforms: ["web", "desktop"],
      handling: "When the window is in the background or a pane covers the conversation, new messages still count. The row is bold and selected at once until the conversation is on screen again.",
      example: {
        name: "Open and unread",
        props: {
          name: "release-train",
          active: true,
          unread: true,
        },
        platforms: ["web", "desktop"],
        width: 248,
      },
    },
    {
      title: "Read on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "Unread is server state. Reading on the phone sends one read-state event, and the desktop row loses its bold and count within a second — along with the Dock badge and the tab title.",
    },
    {
      title: "Right-to-left names",
      platforms: ["web", "desktop", "mobile"],
      handling: "The row mirrors: the # or face sits at the right, the count at the left. A name in Arabic or Hebrew inside an English sidebar keeps its own direction (dir=auto on the name).",
      example: {
        name: "Arabic channel name",
        props: {
          name: "فريق-التصميم",
          unread: true,
          mentions: 2,
        },
        platforms: ["web", "desktop"],
        width: 248,
      },
    },
    {
      title: "Someone who no longer exists",
      platforms: ["web", "desktop", "mobile"],
      handling: "A deactivated colleague keeps their DM row in the neutral ink colour with no presence; a peer that never resolved reads 'Unknown user'. Neither can be typed to, and the row says so on open, not in the sidebar.",
      example: {
        name: "Unknown user",
        props: {
          name: "Unknown user",
          glyph: "",
          avatar: true,
          identity: "ink",
        },
        platforms: ["web", "desktop"],
        width: 248,
      },
    },
    {
      title: "Typing, motion and offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "Typing clears 6 s after the last heartbeat and is never shown while this device is offline (it would be stale). With reduced motion the dots stay still. Offline, rows draw from the on-device cache and presence dots are hidden rather than shown stale.",
    },
    {
      title: "Hover-only ⋮ on touch",
      platforms: ["web", "desktop", "mobile"],
      handling: "On a phone the ⋮ does not exist: long-press opens the action sheet and swipe reveals Mark as read and Mute. On a touch laptop (pointer: coarse) the ⋮ is always visible on the open row and the row grows to 40px.",
      example: {
        name: "Phone, long-press target",
        props: {
          name: "design-crit",
          unread: true,
          mentions: 3,
        },
        platforms: ["mobile"],
        width: 393,
      },
    },
    {
      title: "Text at 130% on a phone",
      platforms: ["mobile"],
      handling: "The row's height is a minimum: the name (and the typing line) grow and the row grows with them. Each stays on one line with an ellipsis; the glyphs and the badge keep their size and never wrap.",
    },
  ],
  related: ["sidebar-section", "nav-rail", "context-menu", "action-sheet"],
  flows: [
    {
      id: "open-a-conversation",
      title: "Open #design-crit from the sidebar",
      description: "The row draws what the list already knows: unread, mentions, a draft. Pressing it opens the conversation, and reading it is what takes the bold away, on every device at once.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The row is drawn from the workspace store",
          detail: "The sidebar reads the open conversation, each channel's unread count and its draft from one store; a row is open simply when its id is the active one.",
          code: "const on = s.activeChannel === id; const n = s.channelUnread[id] ?? 0",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The row is drawn from the channel list query",
          detail: "React Query's channel list, polled and saved to the on-device snapshot, so a cold start draws rows before the network answers. The count is the server's unread_count.",
          code: "unread: Math.max(0, c.unread_count ?? 0)",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The sidebar reads the channel list from the cache",
          detail: "The workspace layout's loader puts the channel list in TanStack Query's cache. Each row is a <Link> to its channel, so ⌘-click opens it in a new tab.",
          code: "const { data: channels } = useSuspenseQuery(channelsQuery)",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "#design-crit is pressed",
          detail: "A click or Enter. On the phone a tap, with a light haptic as the finger lands. Alt+↓ moves to the next conversation on web and desktop.",
        },
        {
          kind: "event",
          title: "onPress fires",
          detail: "The row knows nothing about routes or stores; the list that drew it decides what opening means.",
          code: "onPress?.()",
        },
        {
          kind: "state",
          title: "selectChannel makes it the open conversation",
          detail: "navPatch swaps the composer to this channel's draft and closes anything anchored to the old one: the mention picker, the person card, the side panel.",
          code: "set((s) => ({ ...navPatch(s, id), msgCursor: null, panel: 'none' }))",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The router goes to /c/design-crit",
          detail: "A push, so Back returns to #platform-eng. The channel route's loader reads the messages through TanStack Query, straight from the cache when they're fresh.",
          code: "<Link to=\"/c/$name\" params={{ name: 'design-crit' }}>",
          platforms: ["web"],
        },
        {
          kind: "effect",
          title: "The channel screen is pushed",
          detail: "Onto the root stack, so it slides in from the right over the list and the tab bar, and swipes back. The phone's rows don't keep a selected look; the screen on top is the selection.",
          code: "router.push({ pathname: '/channel/[id]', params: { id } })",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The grey fill moves to #design-crit",
          detail: "The old row's fill fades out as the new one's fades in, over 120ms. Never coral: coral marks your place only in the nav rail.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "effect",
          title: "Opening it marks it read",
          detail: "Opening the channel reads its history and moves the read mark to the newest message. The count drops in the store at once and the server tells every other device.",
          code: "set({ channelUnread: { ...s.channelUnread, [key]: 0 } }); backend.channels.markRead(id, newestKnown)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "effect",
          title: "The screen marks it read once the divider is placed",
          detail: "It waits until the newest message is known and the unread divider has taken its anchor, then zeroes the cached row and tells the server. Not before, or the divider would never be drawn.",
          code: "markRead.mutate({ channelId, messageId: newest.id })  // onMutate: unread_count → 0",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "#design-crit is open and no longer bold",
          detail: "The bold and the coral count go with the read mark, here and, through one read-state event, on the phone, the Dock badge and the tab title.",
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
              width: 248,
              gap: 1,
            },
            children: [
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "platform-eng",
                  active: true,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "design-crit",
                  unread: true,
                  mentions: 3,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "release-train",
                  unread: true,
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
              width: 248,
              gap: 1,
            },
            children: [
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "platform-eng",
                  active: true,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "design-crit",
                  unread: true,
                  mentions: 3,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "release-train",
                  unread: true,
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 1,
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 248,
              gap: 1,
            },
            children: [
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "platform-eng",
                  active: true,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "design-crit",
                  unread: true,
                  mentions: 3,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "release-train",
                  unread: true,
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1400,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 248,
              gap: 1,
            },
            children: [
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "platform-eng",
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "design-crit",
                  unread: true,
                  mentions: 3,
                  active: true,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "release-train",
                  unread: true,
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 248,
              gap: 1,
            },
            children: [
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "platform-eng",
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "design-crit",
                  active: true,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "release-train",
                  unread: true,
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
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "platform-eng",
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "design-crit",
                  unread: true,
                  mentions: 3,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "release-train",
                  unread: true,
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 1,
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "platform-eng",
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "design-crit",
                  unread: true,
                  mentions: 3,
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "release-train",
                  unread: true,
                },
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "platform-eng",
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "design-crit",
                },
              },
              {
                el: "component",
                use: "sidebar-item",
                props: {
                  name: "release-train",
                  unread: true,
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
