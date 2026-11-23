import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "badge",
  name: "Badge",
  category: "display",
  level: "atom",
  status: "stable",
  description: "An unread count or a dot. Coral means it needs you (a mention, a DM); neutral means there is something new but nobody asked for you.",
  props: {
    count: {
      type: "number",
      default: 0,
      sample: 3,
    },
    max: {
      type: "number",
      default: 99,
      description: "Above this the badge reads max+. The desktop rail uses 9 to keep its 64px column.",
    },
    dot: {
      type: "boolean",
      default: false,
      description: "A dot instead of a number — activity without a mention.",
    },
    tone: {
      type: "enum",
      options: ["brand", "neutral", "inverse"],
      default: "brand",
    },
    label: {
      type: "string",
      sample: "unread mentions",
      description: "What the number counts, for the accessible name.",
    },
    unread: {
      type: "boolean",
      default: false,
      description: "The count is of unread things: with no `label`, the name says \"3 unread\". Off, a bare count is named by its number alone.",
    },
    live: {
      type: "boolean",
      default: false,
      description: "A change of the count is announced politely. Off by default: a sidebar of badges should not each speak.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<span role=\"img\"> named by the count and what it counts, inline styles over `t`; pops in with enter(\"pop\")",
      import: "import { Badge } from \"@antfabric/ui-react\"",
      notes: [
        "The same total also drives the tab title, \"(3) AntFabric\", and the favicon dot — see Tab badge.",
        "A badge pops in (fade and a 0.94 → 1 scale, 220ms) when its first unread arrives; a changing count does not re-pop.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <span role=\"img\"> as web, inline styles over `t`; pops in with enter(\"pop\")",
      import: "import { Badge } from \"@antfabric/ui-react\"",
      notes: [
        "The app-wide total also goes to the Dock (macOS) or taskbar overlay (Windows) — see App icon badge.",
        "A badge pops in when its first unread arrives; a changing count does not re-pop.",
      ],
    },
    mobile: {
      status: "ready",
      base: "<Enter motion=\"pop\"> (an Animated.View; `live` announces a change of its count), StyleSheet over useTheme()",
      import: "import { Badge } from \"@antfabric/ui-react-native\"",
      notes: [
        "The same total is the home-screen icon badge, set with expo-notifications setBadgeCountAsync and kept in step by the server's push payload.",
        "A badge pops in (Animated, the same 0.94 → 1 scale and fade) when its first unread arrives; a changing count does not re-pop.",
      ],
    },
  },
  a11y: {
    role: "img",
    notes: [
      "The number is hidden; the label says what it counts, e.g. \"3 unread mentions\". With no label the name is the count alone (\"3\"), or \"3 unread\" with `unread`.",
      "Never a live region: `live` announces a change of the count politely (through the page's announcer on the web, the screen reader's announcement on the phone), not its first draw. Never announce every increment — the parent row's label carries the count.",
    ],
  },
  examples: [
    {
      name: "Mentions",
      props: {
        count: 3,
      },
    },
    {
      name: "Over the cap",
      props: {
        count: 142,
      },
    },
    {
      name: "Rail cap 9+",
      props: {
        count: 12,
        max: 9,
      },
    },
    {
      name: "Activity dot",
      props: {
        dot: true,
      },
    },
    {
      name: "Neutral total",
      props: {
        count: 24,
        tone: "neutral",
        label: "messages",
      },
    },
  ],
  matrix: [
    {
      prop: "tone",
    },
  ],
  edgeCases: [
    {
      title: "Count is zero or unknown",
      platforms: ["web", "desktop", "mobile"],
      handling: "Zero renders nothing — no empty pill. While counts are still loading the badge is absent, not 0; a skeleton is never used for a badge.",
    },
    {
      title: "Read on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "Counts are server-owned. Reading a channel on the phone clears the desktop badge, the Dock badge, the tab title and the phone's icon badge through one read-state event.",
    },
    {
      title: "Muted channel with a mention",
      platforms: ["web", "desktop", "mobile"],
      handling: "A muted channel shows no badge for ordinary messages, but a direct @mention still shows the coral count — muting is never allowed to hide someone asking for you.",
    },
  ],
  flows: [
    {
      id: "unread-arrives",
      title: "A message arrives and the count goes up",
      description: "Nobody sends an unread count over the wire. Each client keeps the server's last count and adds one for every message that would have notified you, so the badge moves the moment the message lands.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The sidebar row reads its count from the store",
          detail: "channelUnread starts as the server's own count from the channel-list read. Zero draws nothing.",
          code: "const n = s.channelUnread[id] ?? 0  // {n > 0 && <UnreadPill n={n} />}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "Each row's count comes from the list query",
          detail: "unread_count arrives with the channel list, which the offline snapshot fills on a cold launch, and becomes the row's badge.",
          code: "unread: Math.max(0, c.unread_count ?? 0)",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The channels query holds the counts",
          detail: "The workspace route loads the channel list into the TanStack Query cache, and each sidebar row reads its count from there.",
          code: "const { data: channels } = useQuery(channelsQuery)",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "A message lands in #design-crit",
          lane: "system",
          detail: "chat.message.created arrives on the socket while you're reading #platform-eng.",
        },
        {
          kind: "state",
          title: "applyRealtime adds one, if it should",
          detail: "countsAsUnread mirrors the server's SQL: not a thread reply, not deleted, not yours, not the channel on screen, and you're a member. notifiesMe then applies the channel's level, so a channel set to mentions only counts mentions.",
          code: "channelUnread: { ...s.channelUnread, [key]: (s.channelUnread[key] ?? 0) + 1 }",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "bumpUnread patches the list query in place",
          detail: "The row's unread_count goes up by one in the React Query cache; the open channel is set to zero instead. Nothing refetches over what the socket delivered.",
          code: "bumpUnread(client, channelId, channelId === activeChannelId ? 'zero' : 'up', message.created_at)",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The socket handler patches the query cache",
          detail: "The same arithmetic as the apps, on the cached list. The next list read overwrites it with the server's count.",
          code: "queryClient.setQueryData(channelsQuery.queryKey, (list) => bumpUnread(list, channelId))",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The badge pops in",
          detail: "A badge that wasn't there pops: a fade and a 0.94 → 1 scale over 220ms. Today's desktop UnreadPill and the phone's ChannelRow badge appear without motion.",
          enter: "pop",
        },
        {
          kind: "trigger",
          title: "A second message lands",
          lane: "system",
          detail: "Marcus replies a moment later, and the same path adds one more.",
        },
        {
          kind: "result",
          title: "The count reads 2, without a second pop",
          detail: "A count that changes swaps its digits in place. The row is read as \"design-crit, 2 mentions\", and its title stays bold until you open it.",
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
          step: 7,
          hold: 1600,
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
                  count: 1,
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
          step: 7,
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
                  unread: true,
                  count: 1,
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
          hold: 1600,
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
                  count: 2,
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
                  unread: true,
                  count: 2,
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
  ],
};

export default docs;
