import type { ComponentDocs } from "../../types";
import { SIDEBAR_SECTION_ITEMS } from "../../samples";

const docs: ComponentDocs = {
  id: "sidebar-section",
  name: "Sidebar section",
  category: "shell",
  level: "organism",
  status: "beta",
  description: "A group in the sidebar — Starred, Channels, Direct messages, or one someone made — with a header that collapses it. Collapsed, the header carries the section's unread total, because the rows that would have said so are gone; the conversation you have open stays visible underneath so you never lose your place.",
  props: {
    label: {
      type: "string",
      sample: "Channels",
      required: true,
    },
    icon: {
      type: "icon",
      default: "",
      description: "Drawn before the label, in the section's accent (a star for Starred). Empty draws none.",
    },
    expanded: {
      type: "boolean",
      default: true,
      description: "Whether the rows are shown. Collapsed (false), the header carries the section's unread total and only the open row stays.",
    },
    selected: {
      type: "string",
      default: "",
      description: "The key of the row that is open. Empty falls back to each item's own `active`, so a section built from data keeps working; pressing a row sets it.",
    },
    unread: {
      type: "number",
      default: 0,
      description: "Unread across the section's rows, muted rows excluded unless they hold a mention. Drawn only while collapsed.",
    },
    addLabel: {
      type: "string",
      default: "",
      sample: "Add channels",
      description: "The + action's name: 'Add channels', 'New message', 'Add to this section'. Empty uses the `add` string (\"Add\").",
    },
    actionsVisible: {
      type: "boolean",
      default: true,
      description: "Draws + and ⋯. On web and desktop the kit reveals them on header hover or focus-within (opacity, so revealing never reflows); on a phone they are always there.",
    },
    divided: {
      type: "boolean",
      default: true,
      description: "A hairline above the header, parting it from the section before. Off for the first section.",
    },
    emptyText: {
      type: "string",
      default: "",
      description: "Shown when the section has no rows, e.g. Starred before anything is starred.",
    },
    items: {
      type: "array",
      default: [],
      sample: SIDEBAR_SECTION_ITEMS,
      description: "SidebarItem props, one object per row, without `selectedName`, `actionsVisible` and the events: { key, name, glyph?, icon?, avatar?, description?, unread?, mentions?, muted?, draft?, active?, typing?, typingText?, external?, avatarSrc?, identity?, presence?, agent? }. The row that was opened is `onSelectedChange`'s.",
    },
    onExpandedChange: {
      type: "event",
      args: "expanded: boolean",
      changes: "expanded",
    },
    onSelectedChange: {
      type: "event",
      args: "selected: string",
      changes: "selected",
    },
    onItemLongPress: {
      type: "event",
      args: "key: string",
      platforms: ["mobile"],
      description: "A row was long-pressed: its key. The app opens the row's action sheet (Mark as read, Mute, Star, Move to…, Leave) from it.",
    },
    onAdd: {
      type: "event",
    },
    onMenu: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=group <div>: a header row holding the toggle <button> (aria-expanded) and the + / ⋯ IconButtons as siblings, then a role=list of SidebarItem rows; inline styles over t. Hover, focus and the actions' reveal (header hover or focus-within, by opacity) come from useInteraction and pointer/focus events, never :hover. expanded is useControllable with onExpandedChange; selected is kept by the section (onSelectedChange) and set by a row press",
      import: "import { SidebarSection } from \"@antfabric/ui-react/shell\"",
      notes: [
        "Collapse state belongs to the account, not the browser: collapsing Channels on the web collapses it on the desktop app too. It is saved with the sidebar layout, the same record that holds section order and which channel lives where.",
        "+ and ⋯ fade in on header hover or focus-within; they are in the layout at rest (opacity 0), so revealing them never moves the label.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "On the header: collapses or expands the section",
        },
        {
          keys: "← / →",
          action: "On the header: collapses / expands, the tree convention",
        },
        {
          keys: "Tab",
          action: "Header toggle, +, ⋯, then the rows",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same @antfabric/ui-react component as the web: a header row holding the toggle <button> and sibling + / ⋯ IconButtons (never a button inside a button), then SidebarItem rows; inline styles over t, states from useInteraction",
      import: "import { SidebarSection } from \"@antfabric/ui-react/shell\"",
      notes: [
        "One component for all six kinds today — Starred, Channels, Projects, Direct messages, each project inside Projects, and custom sections.",
        "The label is --text-body (14) semibold in fg.subtle, level with the rows under it (ADR-0670). The chevron matches the label's size and turns rather than swapping glyphs.",
        "A hairline above each section (ADR-0689) with 12px of air above the rule (ADR-0691).",
        "New in this spec: the open conversation stays visible under a collapsed header (Slack does this). Today a collapsed section hides every row.",
        "Pressing the header toggles `expanded` (the chevron turns, rows fade back in); pressing a row sets `selected`, which moves the grey open-row fill to it and is the row kept under a collapsed header.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Collapses or expands",
        },
        {
          keys: "Alt+↑ / Alt+↓",
          action: "Moves through conversations across sections, skipping collapsed ones except the open row",
        },
      ],
    },
    mobile: {
      status: "partial",
      base: "A View (role group): a Pressable header (accessibilityState.expanded, long press → onMenu) with an Animated chevron and the + IconButton, then SidebarItem rows in a list View; StyleSheet over useTheme() tokens. A long list virtualises in the app's own FlashList around it",
      import: "import { SidebarSection } from \"@antfabric/ui-react-native/shell\"",
      notes: [
        "Today the Messages tab groups Channels and Direct messages with plain headings and no collapse; collapsing, Starred and custom sections are new on the phone.",
        "No hover: + is always visible; ⋯ is replaced by long-pressing the header.",
        "Collapse state on the phone is its own — a short screen wants different sections open than a 1440px window.",
      ],
      gestures: [
        {
          gesture: "Tap header",
          action: "Collapses or expands, with a light haptic",
        },
        {
          gesture: "Long press header",
          action: "Section actions: Rename, Sort, Move up, Move down, Delete (custom sections only)",
        },
      ],
    },
  },
  a11y: {
    role: "group",
    notes: [
      "The header toggle carries aria-expanded; collapsed with unread, its name is 'Channels, 12 unread'.",
      "The badge's own number is hidden; the toggle's name already says it.",
      "Phone: `onMenu` (the long press on the header) is also an accessibility action, 'Channels options', and `onItemLongPress` is one on each row.",
      "The + and ⋯ buttons are revealed while the header has hover or focus-within, by opacity, so they stay in the tab order. The list is a role=list of the rows.",
    ],
  },
  examples: [
    {
      name: "Channels",
      width: 248,
      platforms: ["web", "desktop"],
    },
    {
      name: "Collapsed with unread",
      props: {
        expanded: false,
        unread: 12,
        items: [
          {
            key: "design-crit",
            name: "design-crit",
            glyph: "#",
            unread: true,
            mentions: 3,
          },
          {
            key: "release-train",
            name: "release-train",
            glyph: "#",
            unread: true,
          },
        ],
      },
      width: 248,
      platforms: ["web", "desktop"],
    },
    {
      name: "Direct messages",
      props: {
        label: "Direct messages",
        addLabel: "New message",
        items: [
          {
            key: "fabric",
            name: "Fabric",
           
            avatar: true,
            identity: "agent",
            agent: true,
          },
          {
            key: "aisha-bello",
            name: "Aisha Bello",
           
            avatar: true,
            identity: "ochre",
            presence: "active",
            unread: true,
            mentions: 2,
          },
          {
            key: "marcus-chen",
            name: "Marcus Chen",
           
            avatar: true,
            identity: "green",
            presence: "away",
            typing: true,
          },
          {
            key: "marcus-priya-tomas",
            name: "Marcus, Priya, Tomás",
           
            icon: "users",
            description: "group conversation",
          },
        ],
      },
      width: 248,
      platforms: ["web", "desktop"],
    },
    {
      name: "Starred",
      props: {
        label: "Starred",
        icon: "star",
        addLabel: "Star a conversation",
        divided: false,
        items: [
          {
            key: "release-train",
            name: "release-train",
            glyph: "#",
            unread: true,
          },
          {
            key: "priya-raman",
            name: "Priya Raman",
           
            avatar: true,
            identity: "indigo",
            presence: "active",
          },
        ],
      },
      width: 248,
      platforms: ["web", "desktop"],
    },
    {
      name: "Custom section",
      props: {
        label: "Q4 launch",
        addLabel: "Add to this section",
        items: [
          {
            key: "launch-war-room",
            name: "launch-war-room",
            glyph: "#",
            unread: true,
            mentions: 1,
          },
          {
            key: "acme-integration",
            name: "acme-integration",
            glyph: "#",
            external: true,
          },
        ],
      },
      width: 248,
      platforms: ["web", "desktop"],
    },
    {
      name: "Phone",
      props: {
        items: [
          {
            key: "design-crit",
            name: "design-crit",
            glyph: "#",
            unread: true,
            mentions: 3,
          },
          {
            key: "release-train",
            name: "release-train",
            glyph: "#",
            unread: true,
          },
          {
            key: "leadership-sync",
            name: "leadership-sync",
           
            icon: "lock",
            description: "private channel",
          },
        ],
      },
      width: 393,
      platforms: ["mobile"],
    },
    {
      name: "Phone, starred",
      props: {
        label: "Starred",
        icon: "star",
        addLabel: "Star a conversation",
        divided: false,
        items: [
          {
            key: "release-train",
            name: "release-train",
            glyph: "#",
            unread: true,
          },
          {
            key: "priya-raman",
            name: "Priya Raman",
           
            avatar: true,
            identity: "indigo",
            presence: "active",
          },
        ],
      },
      width: 393,
      platforms: ["mobile"],
    },
    {
      name: "Phone, empty",
      props: {
        label: "Starred",
        icon: "star",
        addLabel: "Star a conversation",
        divided: false,
        items: [],
        emptyText: "Star a channel or person to keep them here",
      },
      width: 393,
      platforms: ["mobile"],
    },
    {
      name: "Phone, collapsed",
      props: {
        expanded: false,
        unread: 4,
      },
      width: 393,
      platforms: ["mobile"],
    },
  ],
  matrix: [
    {
      prop: "expanded",
      values: [true, false],
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "Collapsed, with somewhere you are",
      platforms: ["web", "desktop", "mobile"],
      handling: "The open conversation stays as the one row under a collapsed header, so collapsing a section never hides where you are. Leaving it lets the row go.",
      example: {
        name: "Collapsed, open row kept",
        props: {
          expanded: false,
          unread: 4,
        },
        width: 248,
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "The collapsed total",
      platforms: ["web", "desktop", "mobile"],
      handling: "Only drawn while collapsed — open, every row already says it. It counts unread conversations' messages, not muted rows, except that a mention in a muted row still counts: muting never hides someone asking for you. It caps at 99+.",
    },
    {
      title: "Empty section",
      platforms: ["web", "desktop", "mobile"],
      handling: "Starred with nothing starred says how to fill it instead of drawing an empty header. A custom section emptied by moving its last channel out stays until deleted, with the same hint.",
      example: {
        name: "Nothing starred",
        props: {
          label: "Starred",
          icon: "star",
          divided: false,
          items: [],
          emptyText: "Star a channel or person to keep them here",
        },
        width: 248,
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "A very long section",
      platforms: ["web", "desktop", "mobile"],
      handling: "200 channels render through a virtualised list; the header stays sticky while its rows scroll under it, so the collapse control is always reachable.",
    },
    {
      title: "A long section name",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label truncates; the chevron, the total and the actions never shrink. The full name is the tooltip and the group's accessible name.",
      example: {
        name: "Long name",
        props: {
          label: "Customer escalations — EMEA and APAC",
          expanded: false,
          unread: 7,
        },
        width: 248,
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "Reordering",
      platforms: ["web", "desktop", "mobile"],
      handling: "Drag a header to move a section and a row to move a channel between sections. Every drag has a non-drag path: ⋯ › Move up / Move down for sections and the row's 'Move to…' menu for channels. On a phone, long-press the header.",
    },
    {
      title: "Collapsed on one device",
      platforms: ["web", "desktop", "mobile"],
      handling: "Web and desktop share the account's layout, so a collapse on one shows on the other at the next sync. The phone keeps its own. A layout saved while offline wins over the server only if it is newer.",
    },
  ],
  related: ["sidebar-item", "nav-rail", "context-menu"],
  flows: [
    {
      id: "collapse-a-section",
      title: "Collapse Channels and keep your place",
      description: "The header folds the section away. Its rows stop saying what's unread, so the header says it for them, and the conversation you have open stays where you can see it.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "Collapsed and the total come from the store",
          detail: "Channels and Direct messages keep their own booleans (chanSecOpen, dmSecOpen); every other section's collapse lives in the saved sidebar layout. The total is summed from the same per-channel counts the rows draw.",
          code: "expanded={!sidebarSectionCollapsed(s, SB_CHANNELS)} unread={unreadInGroup(s.channelUnread, grouped.channels)}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "Today the Messages tab draws plain headings",
          detail: "CHANNELS and DIRECT MESSAGES are SectionList headers with nothing to press. Collapsing on the phone is new in this spec, and the phone keeps its own collapse state: a short screen wants different sections open than a 1440px window.",
          code: "renderSectionHeader={({ section }) => … {section.title} …}",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The layout belongs to the account",
          detail: "The workspace layout's loader reads the sidebar layout through TanStack Query: the same record the desktop saves, holding section order, which channel lives where and what's collapsed.",
          code: "const layout = useSuspenseQuery(sidebarLayoutQuery).data",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The Channels header is pressed",
          detail: "A click, Enter or Space; ← collapses on the web, the tree convention. On the phone a tap, with a light haptic. + and ⋯ beside it are their own buttons, never inside the header's.",
        },
        {
          kind: "event",
          title: "onExpandedChange(false) fires",
          detail: "The section says which way it is going, so the caller saves the new value without reading it back.",
          code: "onExpandedChange?.(!expanded)",
        },
        {
          kind: "state",
          title: "The store flips the section",
          detail: "Channels flips chanSecOpen. A custom section goes through the saved layout instead, which is written to disk at once.",
          code: "if (sectionId === SB_CHANNELS) set((s) => ({ chanSecOpen: !s.chanSecOpen })); else commit(toggleCollapsed(get().sbLayout, sectionId))",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The layout is saved to the account, optimistically",
          detail: "The cache changes first, so the section folds on the press; the desktop app picks the change up at its next sync. If the save fails, the section opens again.",
          code: "useMutation({ mutationFn: saveSidebarLayout, onMutate: (next) => queryClient.setQueryData(['sidebar-layout'], next) })",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The chevron turns and the other rows fold away",
          detail: "The chevron rotates -90° over 120ms rather than swapping glyphs, so it reads as the same control. The rows leave at once, and expanding brings them straight back.",
        },
        {
          kind: "result",
          title: "The header carries the total, and your place stays",
          detail: "The header reads 'Channels, 4 unread'. On web and desktop #platform-eng, the open conversation, stays under it (new in this spec; today's desktop hides every row). On the phone nothing is open while you look at the list, so every row folds.",
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
            },
            children: [
              {
                el: "component",
                use: "sidebar-section",
                props: {
                  unread: 4,
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
            },
            children: [
              {
                el: "component",
                use: "sidebar-section",
                props: {
                  unread: 4,
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 0,
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 248,
            },
            children: [
              {
                el: "component",
                use: "sidebar-section",
                props: {
                  unread: 4,
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 248,
            },
            children: [
              {
                el: "component",
                use: "sidebar-section",
                props: {
                  unread: 4,
                  expanded: false,
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
                use: "sidebar-section",
                props: {
                  unread: 4,
                  items: [
                    {
                      key: "design-crit",
                      name: "design-crit",
                      glyph: "#",
                      unread: true,
                      mentions: 3,
                    },
                    {
                      key: "release-train",
                      name: "release-train",
                      glyph: "#",
                      unread: true,
                    },
                    {
                      key: "leadership-sync",
                      name: "leadership-sync",
                     
                      icon: "lock",
                      description: "private channel",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 0,
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
                use: "sidebar-section",
                props: {
                  unread: 4,
                  items: [
                    {
                      key: "design-crit",
                      name: "design-crit",
                      glyph: "#",
                      unread: true,
                      mentions: 3,
                    },
                    {
                      key: "release-train",
                      name: "release-train",
                      glyph: "#",
                      unread: true,
                    },
                    {
                      key: "leadership-sync",
                      name: "leadership-sync",
                     
                      icon: "lock",
                      description: "private channel",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 7,
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
                use: "sidebar-section",
                props: {
                  unread: 4,
                  expanded: false,
                  items: [
                    {
                      key: "design-crit",
                      name: "design-crit",
                      glyph: "#",
                      unread: true,
                      mentions: 3,
                    },
                    {
                      key: "release-train",
                      name: "release-train",
                      glyph: "#",
                      unread: true,
                    },
                    {
                      key: "leadership-sync",
                      name: "leadership-sync",
                     
                      icon: "lock",
                      description: "private channel",
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
