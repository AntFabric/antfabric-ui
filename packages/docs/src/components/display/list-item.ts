import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "list-item",
  name: "List item",
  category: "display",
  level: "molecule",
  status: "stable",
  description: "One row in a list or a menu: a leading icon, tile or face, a title with an optional subtitle, and trailing detail, count, shortcut or chevron. Dense on web and desktop (30–36px), touch-sized on mobile (52–72pt).",
  props: {
    title: {
      type: "string",
      sample: "platform-eng",
      required: true,
    },
    subtitle: {
      type: "string",
      default: "",
      description: "One line on web and desktop, up to two on mobile.",
    },
    titleLines: {
      type: "number",
      description: "How many lines the title may take before it truncates with an ellipsis. Left out, the title takes one line on web and desktop and two on mobile, which is how each platform draws a row today; a number sets the same limit on every platform.",
    },
    leading: {
      type: "enum",
      options: ["none", "icon", "tile", "avatar"],
      default: "icon",
      description: "icon is a bare glyph on web and desktop (sidebar and menu rows) and sits in a tile on mobile, where every ListItem glyph has one. tile is a tile everywhere — the desktop FileRow's chip. avatar is a face.",
    },
    icon: {
      type: "icon",
      default: "",
      sample: "hash",
    },
    avatar: {
      type: "object",
      sample: {
        name: "Priya Raman",
        identity: "indigo",
      },
      description: "{ name, identity, src? } when leading is avatar.",
    },
    tile: {
      type: "enum",
      options: [32, 36],
      default: 36,
      description: "Tile and face size. 36 holds a 20pt glyph; 32 a 16pt glyph and a 16pt chevron (V2 Settings, ADR-9419).",
    },
    detail: {
      type: "string",
      default: "",
      description: "Trailing text: a time, a value (\"Mentions only\"), a size, a channel.",
    },
    count: {
      type: "number",
      default: 0,
      description: "Unread mentions; draws the coral Badge. 0 hides it.",
    },
    shortcut: {
      type: "string",
      default: "",
      platforms: ["web", "desktop"],
      description: "A menu row's keyboard shortcut, written once as Mod+Shift+K.",
    },
    href: {
      type: "string",
      default: "",
      platforms: ["web", "desktop"],
      description: "The row navigates: with role link it is an <a href>, so middle-click and ⌘-click open a new tab. A plain click calls onPress and stays on the page when there is one.",
    },
    chevron: {
      type: "boolean",
      default: false,
      description: "The row opens another screen. Mobile and settings lists; never in a menu.",
    },
    selected: {
      type: "boolean",
      default: false,
      description: "The open conversation (a grey fill on web and desktop), the chosen option (a check), or a ticked row in a multi-select picker (role checkbox).",
    },
    unread: {
      type: "boolean",
      default: false,
      description: "Bold title in strong ink — the one signal that something is new without a mention.",
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    destructive: {
      type: "boolean",
      default: false,
      description: "Leave, delete, remove. Red title and glyph; the action still confirms.",
    },
    divider: {
      type: "boolean",
      default: false,
      description: "A hairline under the row, for card-less lists. The last row passes false.",
    },
    role: {
      type: "enum",
      options: ["link", "menuitem", "option", "checkbox", "button"],
      default: "link",
      description: "link for a row that opens something (sidebar, inbox), menuitem in a menu, option in a single-choice picker, checkbox in a multi-select picker (Add people, Forward), button for an in-place action. A checkbox row draws the Checkbox's box at its trailing end, and the whole row is the control.",
    },
    onSelectedChange: {
      type: "event",
      args: "selected: boolean",
      changes: "selected",
      description: "Called with `selected` as the press leaves it (a press toggles it).",
    },
    onPress: {
      type: "event",
      description: "The row was pressed. Opening what the row stands for is the caller's.",
    },
    onLongPress: {
      type: "event",
      platforms: ["mobile"],
      description: "Acts on the row instead of opening it, usually by opening a menu of what can be done to it. Also offered as the row's \"More actions\" accessibility action. The web has no long press: its row offers a context menu.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "One <button data-af-press> carrying the row's role (link, menuitem, option, checkbox, button) with aria-current / aria-checked / aria-selected, and aria-disabled so a disabled row stays focusable; `selected` through useControllable; the kit's Avatar, Badge and Kbd; inline styles over `t`",
      import: "import { ListItem } from \"@antfabric-ui/react\"",
      notes: [
        "A row that opens a conversation is an <a href>, so middle-click and ⌘-click open it in a new tab; the open one carries aria-current=\"page\".",
        "Hover reveals the row's ⋯ menu and its mark-as-read affordance; the same actions are on the row's context menu and in the keyboard map, so hover is never the only way in.",
        "pointer: coarse raises min-height to 44px on touch laptops.",
        "Pressing toggles `selected` (through useControllable, so the catalogue preview is interactive): a link or button row's grey fill fades in, an option row's check pops in. Opening the conversation is the caller's.",
        "A checkbox row is one <button role=\"checkbox\" aria-checked>: the box is drawn inside it, not a second control, so a click anywhere on the row ticks it.",
      ],
      keyboard: [
        {
          keys: "↑ / ↓",
          action: "Moves between rows (roving tabindex — the list is one tab stop)",
        },
        {
          keys: "Enter",
          action: "Opens the row or runs the menu item",
        },
        {
          keys: "Home / End",
          action: "First / last row",
        },
        {
          keys: "Shift+F10",
          action: "Opens the row's context menu",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <button> as web, at desktop density (30px rows)",
      import: "import { ListItem } from \"@antfabric-ui/react\"",
      notes: [
        "Sidebar rows are 30px with a 7px radius fill; the ⋮ is hover-revealed and the unread count slides beside it (2026-10-06).",
        "FileRow is the two-line, tiled case: a 36px chip, the name in semibold, middot-joined provenance (\"Figma · Nuthan · yesterday · 4.2 MB\"), and the channel trailing. Today's chip is coral-soft; this spec draws it grey because coral is reserved for \"needs you\" — owner to confirm.",
        "Right-click opens the same menu as the ⋮ (native-feeling context menu, drawn in-app).",
        "Pressing toggles `selected`: the surface.selected fill fades in over 120ms, or the option's check pops in.",
        "A checkbox row (ForwardMessage, CreateChannel's invite list) is a <button role=\"checkbox\"> with the box drawn inside, as CreateChannel does (ADR-0527).",
      ],
      keyboard: [
        {
          keys: "↑ / ↓",
          action: "Moves between rows",
        },
        {
          keys: "Alt+↑ / Alt+↓",
          action: "Previous / next conversation from anywhere (sidebar rows)",
        },
        {
          keys: "Alt+Shift+↑ / Alt+Shift+↓",
          action: "Previous / next UNREAD conversation",
        },
        {
          keys: "Enter",
          action: "Opens it",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable (Animated) with the row's accessibilityRole and state; the 0.6 press dim eases back with Animated.timing; `selected` through useControllable; every glyph in a tile; the kit's Avatar and Badge",
      import: "import { ListItem } from \"@antfabric-ui/react-native\"",
      notes: [
        "12pt on all four sides and a 12pt gap (owner, 2026-09-09); a row inside a sheet passes its own horizontal inset.",
        "Every glyph sits in a tile: 36 by default, 32 on Settings. The tile is surface.muted so it reads on both a white card and the page (ADR-8910).",
        "Title and subtitle wrap to two lines rather than truncating to one — a phone row has the height.",
        "What desktop reveals on hover is on a swipe (Mark read, Mute) and on long-press; both are also accessibilityActions so VoiceOver and TalkBack users can reach them (ADR-9418). The kit's `onLongPress` is the long press, and it adds the accessibility action itself.",
        "Tapping toggles `selected`: the trailing check pops in (a picker's chosen row); the 0.6 press dim eases back.",
        "A checkbox row is one Pressable with the kit's tick box trailing: the 20pt brand box fills and its tick pops in, and the whole row is the 44pt target.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens; opacity 0.6 while pressed",
        },
        {
          gesture: "Swipe left",
          action: "Reveals the row's actions (Mark read, Mute, Leave)",
        },
        {
          gesture: "Long press",
          action: "Opens the row's action sheet with a light haptic",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "The accessible name joins title, subtitle, detail and the count in words: \"Notifications, Mentions only\", \"design-crit, 3 mentions\". A drawn shortcut is read from `aria-keyshortcuts` on the row (web); a leading Avatar is hidden from assistive tech, so the name is not read twice.",
      "Role `link` with `href` is an <a href> (middle-click and ⌘-click open a new tab); without `href` the row is a plain button. The other roles (menuitem, option, checkbox) set that role on the button: the kit gives them no parent role and no arrow-key roving, so each is a Tab stop unless the parent supplies a menu or listbox.",
      "A row with `onLongPress` on the phone lists it among its accessibility actions as \"More actions\", so a screen-reader user reaches it without the gesture.",
      "Sidebar rows use aria-current=\"page\" for the open conversation (link rows); picker rows (role option) use aria-selected.",
      "Multi-select picker rows are role=checkbox with aria-checked (accessibilityState.checked on mobile); the box is hidden from assistive tech because the row already says it.",
      "A disabled menu row stays focusable (aria-disabled) so a screen-reader user hears that it exists and why it is off.",
    ],
  },
  examples: [
    {
      name: "Channel",
      props: {
        title: "platform-eng",
      },
      width: 248,
    },
    {
      name: "Unread with mentions",
      props: {
        title: "design-crit",
        unread: true,
        count: 3,
      },
      width: 248,
    },
    {
      name: "Open conversation",
      props: {
        title: "release-train",
        selected: true,
      },
      width: 248,
    },
    {
      name: "Multi-select row — press it",
      description: "A row in the Add people picker: the whole row ticks and unticks.",
      props: {
        leading: "avatar",
        avatar: {
          name: "Amara Okafor",
          identity: "green",
        },
        title: "Amara Okafor",
        subtitle: "Product Designer",
        role: "checkbox",
        selected: true,
      },
      width: 320,
    },
    {
      name: "Direct message",
      props: {
        leading: "avatar",
        avatar: {
          name: "Aisha Bello",
          identity: "ochre",
        },
        title: "Aisha Bello",
        subtitle: "Can you check the rollout plan before 4?",
        detail: "2m",
        unread: true,
      },
      width: 320,
    },
    {
      name: "Menu row with shortcut",
      props: {
        role: "menuitem",
        icon: "pencil",
        title: "New message",
        shortcut: "Mod+N",
      },
      platforms: ["desktop"],
      width: 240,
    },
    {
      name: "Menu row, web shortcut",
      props: {
        role: "menuitem",
        icon: "pencil",
        title: "New message",
        shortcut: "Mod+Alt+N",
      },
      platforms: ["web"],
      width: 240,
    },
    {
      name: "Destructive",
      props: {
        role: "menuitem",
        icon: "log-out",
        title: "Leave channel",
        destructive: true,
      },
      width: 240,
    },
    {
      name: "File row",
      props: {
        leading: "tile",
        icon: "file-text",
        title: "Q4 roadmap.pdf",
        subtitle: "Figma · Nuthan · yesterday · 4.2 MB",
        detail: "#design-crit",
        divider: true,
        role: "button",
      },
      width: 380,
    },
    {
      name: "Settings row",
      props: {
        icon: "bell",
        title: "Notifications",
        detail: "Mentions only",
        chevron: true,
        tile: 32,
        role: "button",
      },
      platforms: ["mobile"],
      width: 343,
    },
    {
      name: "Picker option, chosen",
      props: {
        leading: "none",
        title: "Mentions only",
        role: "option",
        selected: true,
      },
      width: 280,
    },
  ],
  matrix: [
    {
      prop: "leading",
    },
    {
      prop: "tile",
      values: [32, 36],
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "Long title or subtitle",
      platforms: ["web", "desktop", "mobile"],
      handling: "Web and desktop truncate each line to one with an ellipsis and show the full title as the tooltip; mobile wraps to two lines and then truncates. Trailing detail, count and chevron never shrink — the title gives way first.",
      example: {
        name: "Long",
        props: {
          title: "customer-escalations-emea-weekend-oncall",
          subtitle: "Rotation changes on Saturday — Kofi is covering for Ingrid until Monday morning",
          detail: "Yesterday",
          count: 2,
          unread: true,
        },
        width: 280,
      },
    },
    {
      title: "Huge unread count",
      platforms: ["web", "desktop", "mobile"],
      handling: "The Badge caps at 99+; the accessible name still says the real number (\"142 mentions\").",
      example: {
        name: "99+",
        props: {
          title: "announcements",
          unread: true,
          count: 142,
        },
        width: 248,
      },
    },
    {
      title: "Disabled with a reason",
      platforms: ["web", "desktop", "mobile"],
      handling: "Dimmed to 45% and inert, but still focusable in a menu and on a phone so the reason is reachable: the subtitle says why (\"Only an owner can delete a channel\"). Never hide an action someone can see a colleague use.",
      example: {
        name: "Owner only",
        props: {
          role: "menuitem",
          icon: "trash-2",
          title: "Delete channel",
          subtitle: "Only an owner can delete a channel",
          disabled: true,
          destructive: true,
        },
        width: 280,
      },
    },
    {
      title: "Hover-only affordances",
      platforms: ["web", "desktop", "mobile"],
      handling: "The desktop ⋮ appears on hover and on keyboard focus of the row. On mobile there is no hover: the same actions are a swipe and a long-press away, and are exposed as accessibilityActions. On a touch laptop (pointer: coarse) the ⋮ is always visible.",
    },
    {
      title: "Read on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "One read-state event clears the bold title and the count on every device, live; the row does not re-sort or jump while you are looking at the list — it re-sorts the next time the list is opened.",
      example: {
        name: "After read elsewhere",
        props: {
          title: "design-crit",
        },
        width: 248,
      },
    },
    {
      title: "Offline and stale rows",
      platforms: ["desktop", "mobile"],
      handling: "Rows draw from the desktop's SQLite cache and the phone's snapshot. A channel you were removed from on another device disappears on the next resync rather than staying with a stale count; opening a cached row while offline shows its cached messages with the pane's offline banner.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Min-heights are minimums: the row grows with the type, the tile stays 36, and the title wraps to its two lines before anything truncates.",
    },
    {
      title: "Double press",
      platforms: ["web", "desktop", "mobile"],
      handling: "Opening is idempotent — a second press while the conversation loads does nothing new. A destructive menu row closes the menu on the first press, so a second press cannot fire it twice.",
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "Leading and trailing swap; the chevron mirrors to point left; the shortcut stays in its OS order.",
    },
  ],
  related: ["menu", "sidebar", "swipe-row", "skeleton", "tag"],
  flows: [
    {
      id: "open-a-conversation",
      title: "Open a conversation from the list",
      description: "The row draws what the store or the query says about the conversation. Pressing it fires onPress; the screen opens the conversation, and opening it is what clears the bold and the count.",
      platforms: ["web", "desktop", "mobile"],
      width: 280,
      steps: [
        {
          kind: "data",
          title: "The row reads the store",
          detail: "Each sidebar row takes the channel's name, its badge (channelUnread), its bold (channelActivity) and whether it's the open one.",
          code: "const on = s.activeChannel === id; const n = s.channelUnread[id] ?? 0; const active = (s.channelActivity ?? {})[id] ?? 0",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The channels tab maps the list query to rows",
          detail: "Today's row there is ChannelRow, the tab's own composite on this pattern; its title and count come from useChannelsQuery.",
          code: "unread: Math.max(0, c.unread_count ?? 0)",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The sidebar reads the channels query and the route",
          detail: "Counts come from the TanStack Query cache; the open conversation is the route param, so aria-current follows the URL.",
          code: "const { data: channels } = useQuery(channelsQuery); const { channelId } = Route.useParams()",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "#design-crit is pressed",
          detail: "A click, or Enter with the row focused. On the phone a tap, which dims the row to 0.6 while the finger is down.",
        },
        {
          kind: "event",
          title: "onPress fires",
          code: "onPress?.()",
        },
        {
          kind: "state",
          title: "selectChannel makes it the open conversation",
          detail: "navPatch sets activeChannel and swaps in that conversation's draft; the message cursor and any open panel are cleared.",
          code: "set((s) => ({ ...navPatch(s, id), msgCursor: null, panel: 'none', pickerFor: null }))",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The router pushes the channel screen",
          code: "router.push({ pathname: '/channel/[id]', params: { id } })",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "The row is a link to the channel route",
          detail: "An <a href>, so ⌘-click opens the conversation in a new tab. The route's loader reads the history.",
          code: "<Link to=\"/c/$channelId\" params={{ channelId }} preload=\"intent\" />",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The selected fill fades in",
          detail: "surface.selected fades in on the row over 120ms and leaves the one it moved from. The bold and the count stay until the history has been read.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "effect",
          title: "Opening reads the history and clears both counts",
          detail: "An effect on the active channel calls hydrateChannel, which fetches the messages and sets the badge and the bold to zero together.",
          code: "set((s) => ({ channelUnread: { ...s.channelUnread, [key]: 0 }, channelActivity: { ...(s.channelActivity ?? {}), [key]: 0 } }))",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "markRead zeroes the row before the server answers",
          detail: "The channel screen marks its newest message read; onMutate sets the list query's count to zero, and a failure refetches the real one.",
          code: "onMutate: (input) => { client.setQueryData<WireChannel[]>(channelKeys.list(), (current) => current?.map((c) => (c.id === input.channelId ? { ...c, unread_count: 0 } : c))) }",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The conversation is open and the row is read",
          detail: "On web and desktop the row keeps its grey fill and aria-current=\"page\". Back on the phone's list, the row is regular weight with no count.",
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
              gap: 2,
              width: 248,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  unread: true,
                  count: 3,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
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
              gap: 2,
              width: 343,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  unread: true,
                  count: 3,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
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
              gap: 2,
              width: 248,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  unread: true,
                  count: 3,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 1,
          hold: 1000,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              gap: 2,
              width: 248,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  unread: true,
                  count: 3,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 1,
          hold: 1000,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              gap: 2,
              width: 343,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  unread: true,
                  count: 3,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
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
              gap: 2,
              width: 248,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  selected: true,
                  unread: true,
                  count: 3,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1600,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              gap: 2,
              width: 248,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                },
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1600,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              gap: 2,
              width: 343,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                },
              },
            ],
          },
        },
        {
          step: 11,
          hold: 1600,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              gap: 2,
              width: 248,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "tick-to-forward",
      title: "Tick people and channels to forward to",
      description: "In a multi-select picker the whole row is a checkbox. Each press flips one id in the picker's selection; nothing is sent, and no conversation is created, until Forward.",
      platforms: ["web", "desktop", "mobile"],
      width: 320,
      steps: [
        {
          kind: "data",
          title: "The dialog lists where you can send it",
          detail: "ForwardMessage builds one list (Recent, People, Channels) and a row is ticked when its id is in the dialog's selection in the store.",
          code: "picked={row.kind === 'channel' ? dlg.channelIds.includes(row.id) : dlg.userIds.includes(row.id)}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The forward sheet keeps the selection itself",
          code: "const [picked, setPicked] = useState<ForwardSelection>({ channelIds: [], userIds: [] });",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The dialog's selection is component state",
          detail: "The rows come from the directory and channels queries already in the cache; what is ticked lives in the dialog until Forward.",
          code: "const [picked, setPicked] = useState<ForwardSelection>({ channelIds: [], userIds: [] })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Amara Okafor's row is pressed",
          detail: "Anywhere on the row: the box is drawn inside it, not a second control. On the desktop a bare Enter ticks the highlighted row and ⌘↵ sends.",
        },
        {
          kind: "event",
          title: "onPress fires",
          code: "onPress?.()",
        },
        {
          kind: "state",
          title: "toggleForwardTarget flips the id",
          detail: "It also clears the last refusal, which described a different selection.",
          code: "const next = held.includes(id) ? held.filter((x) => x !== id) : [...held, id]",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "toggle flips the id in the sheet's selection",
          code: "return { ...p, [key]: held.includes(id) ? held.filter((x) => x !== id) : [...held, id] };",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "setPicked flips the id",
          code: "setPicked((p) => toggleTarget(p, row.kind, row.id))",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The box fills and the tick pops in",
          detail: "The box cross-fades to coral while the tick pops; unticking fades the fill back with no exit motion. Today's desktop row says it with aria-pressed and a SquareCheckMark; this spec makes it role=checkbox with aria-checked, as the phone's row already is.",
          enter: "pop",
        },
        {
          kind: "result",
          title: "Ticked, and nothing sent yet",
          detail: "A ticked person becomes a conversation only when Forward is pressed, so unticking never leaves an empty DM behind. Then one request sends the message everywhere that was ticked.",
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
              gap: 2,
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Amara Okafor",
                  subtitle: "Product Designer",
                  leading: "avatar",
                  avatar: {
                    name: "Amara Okafor",
                    identity: "green",
                  },
                  role: "checkbox",
                  selected: false,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Kofi Mensah",
                  subtitle: "Platform Engineer",
                  leading: "avatar",
                  avatar: {
                    name: "Kofi Mensah",
                    identity: "ochre",
                  },
                  role: "checkbox",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                  subtitle: "Channel · 48 members",
                  role: "checkbox",
                  selected: false,
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
              gap: 2,
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Amara Okafor",
                  subtitle: "Product Designer",
                  leading: "avatar",
                  avatar: {
                    name: "Amara Okafor",
                    identity: "green",
                  },
                  role: "checkbox",
                  selected: false,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Kofi Mensah",
                  subtitle: "Platform Engineer",
                  leading: "avatar",
                  avatar: {
                    name: "Kofi Mensah",
                    identity: "ochre",
                  },
                  role: "checkbox",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                  subtitle: "Channel · 48 members",
                  role: "checkbox",
                  selected: false,
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
              gap: 2,
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Amara Okafor",
                  subtitle: "Product Designer",
                  leading: "avatar",
                  avatar: {
                    name: "Amara Okafor",
                    identity: "green",
                  },
                  role: "checkbox",
                  selected: false,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Kofi Mensah",
                  subtitle: "Platform Engineer",
                  leading: "avatar",
                  avatar: {
                    name: "Kofi Mensah",
                    identity: "ochre",
                  },
                  role: "checkbox",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                  subtitle: "Channel · 48 members",
                  role: "checkbox",
                  selected: false,
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 0,
          hold: 1000,
          scene: {
            el: "view",
            style: {
              gap: 2,
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Amara Okafor",
                  subtitle: "Product Designer",
                  leading: "avatar",
                  avatar: {
                    name: "Amara Okafor",
                    identity: "green",
                  },
                  role: "checkbox",
                  selected: false,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Kofi Mensah",
                  subtitle: "Platform Engineer",
                  leading: "avatar",
                  avatar: {
                    name: "Kofi Mensah",
                    identity: "ochre",
                  },
                  role: "checkbox",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                  subtitle: "Channel · 48 members",
                  role: "checkbox",
                  selected: false,
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1700,
          scene: {
            el: "view",
            style: {
              gap: 2,
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Amara Okafor",
                  subtitle: "Product Designer",
                  leading: "avatar",
                  avatar: {
                    name: "Amara Okafor",
                    identity: "green",
                  },
                  role: "checkbox",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Kofi Mensah",
                  subtitle: "Platform Engineer",
                  leading: "avatar",
                  avatar: {
                    name: "Kofi Mensah",
                    identity: "ochre",
                  },
                  role: "checkbox",
                  selected: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "release-train",
                  subtitle: "Channel · 48 members",
                  role: "checkbox",
                  selected: false,
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
