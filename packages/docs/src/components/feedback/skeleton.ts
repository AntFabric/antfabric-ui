import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "skeleton",
  name: "Skeleton",
  category: "feedback",
  level: "atom",
  status: "stable",
  description: "A grey shape where data is about to appear — never invented content. It waits 300 ms before showing, stays at least 400 ms once shown, sweeps slowly unless reduced motion is on, and says what is loading to a screen reader exactly once.",
  props: {
    shape: {
      type: "enum",
      options: ["line", "block", "circle", "tag", "panel", "row"],
      default: "line",
      description: "line a line of text (a pill), block an icon tile or thumbnail, circle a face, tag a tag or chip, panel a card or picture. row is the ListRowSkeleton preset: a lead, a title and a subtitle per row.",
    },
    width: {
      type: "string",
      default: "160px",
      description: "Shapes only. A length or a percentage; size it to what is coming.",
    },
    height: {
      type: "string",
      default: "12px",
      description: "Shapes only.",
    },
    label: {
      type: "string",
      sample: "Loading messages",
      description: "What a screen reader hears, once — \"Loading messages\", not \"Loading\".",
    },
    visible: {
      type: "boolean",
      default: true,
      description: "Pass useSlowFlag(loading): false for the first 300 ms (laid out but invisible, so nothing jumps when it fades in), then true for at least 400 ms.",
    },
    lead: {
      type: "enum",
      options: ["face", "tile", "none"],
      default: "face",
      description: "Row preset: a face (circle), an icon tile (rounded square) or text only.",
    },
    lines: {
      type: "enum",
      options: [1, 2, 3],
      default: 2,
      description: "Row preset: 1 a name-only row, 2 name and subtitle, 3 name and a two-line subtitle.",
    },
    trailing: {
      type: "boolean",
      default: false,
      description: "Row preset: a short line at the trailing edge — a notification's age, a message's time.",
    },
    rows: {
      type: "array",
      default: [
        {
          title: 148,
          subtitle: 196,
        },
        {
          title: 96,
          subtitle: 140,
        },
        {
          title: 132,
          subtitle: 180,
        },
      ],
      description: "Row preset: one entry per row, with its title and subtitle bar widths. The kit cycles 148/96/132/112/160/104 so a column of rows never reads as one stamp.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"status\" aria-busy <div> fading in with enter(\"fade\"), its shapes aria-hidden; the sweep is the af-sheen keyframes moving a linear-gradient band; inline styles over `t`",
      import: "import { Skeleton } from \"@antfabric/ui-react\"",
      notes: [
        "Every shape starts at the same phase of the 1.4 s sweep (negative animation-delay from performance.now()), so a list sweeps as one surface rather than forty out-of-step bars.",
        "A background tab pauses CSS animation for free; nothing to do.",
        "Route loaders in TanStack Start resolve before paint where they can — a skeleton is for the waits that remain, not a substitute for prefetching.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <div> as web, at desktop density",
      import: "import { Skeleton } from \"@antfabric/ui-react\"",
      notes: [
        "Today's desktop kit: a 120px band of skeleton.sheen crosses each shape every 1.4 s; under prefers-reduced-motion the keyframes end on their last frame, which parks the band off the shape — a still grey shape.",
        "Never drawn over data already on screen: the SQLite cache paints first, and a refresh is a quiet indicator, not a skeleton.",
      ],
    },
    mobile: {
      status: "ready",
      base: "A View (role status, busy) with hidden shapes; one shared Animated.loop moves a sheen band (sliced, since React Native draws no gradient) across every shape on screen, and is off under Reduce Motion",
      import: "import { Skeleton } from \"@antfabric/ui-react-native\"",
      notes: [
        "One Animated loop drives every shape on screen, started by the first and stopped by the last — forty rows cost one animation. An invisible group does not run it.",
        "Reduce Motion is read once (AccessibilityInfo) and shared: the shapes stop and stay grey.",
        "SkeletonText sits each bar in the same line box the real Text takes (fontSize × 1.4), so nothing moves when the words land.",
      ],
    },
  },
  a11y: {
    role: "group (status on the phone)",
    label: "Loading messages",
    notes: [
      "One element, aria-busy and named by `label`, says what is loading; every shape inside is aria-hidden. A sighted reader sees shapes, a screen-reader user hears the sentence — nobody gets both or neither.",
      "The sentence is spoken once, when the placeholder appears (visible turns true), through the page's own announcer on the web and the screen reader's announcement call on the phone. The element is not a live region, so a page of placeholders is not a page of them.",
      "When the data lands, the element goes away; focus is not moved.",
    ],
  },
  examples: [
    {
      name: "Line",
      props: {
        shape: "line",
        width: "160px",
        height: "12px",
      },
    },
    {
      name: "Face",
      props: {
        shape: "circle",
        width: "36px",
        height: "36px",
      },
    },
    {
      name: "Tile",
      props: {
        shape: "block",
        width: "36px",
        height: "36px",
      },
    },
    {
      name: "Tag",
      props: {
        shape: "tag",
        width: "56px",
        height: "20px",
      },
    },
    {
      name: "Panel",
      props: {
        shape: "panel",
        width: "280px",
        height: "120px",
        label: "Loading project",
      },
    },
    {
      name: "Conversation rows",
      props: {
        shape: "row",
        label: "Loading conversations",
      },
      width: 320,
    },
    {
      name: "Sidebar channels",
      props: {
        shape: "row",
        lead: "tile",
        lines: 1,
        label: "Loading channels",
        rows: [
          {
            title: 112,
            subtitle: 0,
          },
          {
            title: 148,
            subtitle: 0,
          },
          {
            title: 96,
            subtitle: 0,
          },
          {
            title: 132,
            subtitle: 0,
          },
        ],
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Notifications",
      props: {
        shape: "row",
        trailing: true,
        label: "Loading notifications",
        rows: [
          {
            title: 160,
            subtitle: 204,
          },
          {
            title: 104,
            subtitle: 148,
          },
          {
            title: 148,
            subtitle: 196,
          },
        ],
      },
      platforms: ["mobile"],
      width: 343,
    },
  ],
  matrix: [
    {
      prop: "shape",
      values: ["line", "block", "circle", "tag", "panel"],
    },
  ],
  edgeCases: [
    {
      title: "The data comes back fast",
      platforms: ["web", "desktop", "mobile"],
      handling: "Under 300 ms nothing shows — the group is laid out but invisible (visible=false), so a fast load never flashes grey. Once shown, it stays at least 400 ms so it never blinks.",
      example: {
        name: "First 300 ms (invisible)",
        props: {
          shape: "row",
          visible: false,
        },
        width: 320,
      },
    },
    {
      title: "Still loading after 8 seconds",
      platforms: ["web", "desktop", "mobile"],
      handling: "The shapes stay, and the pane adds one muted line under them: \"Still loading. Check your connection.\" No spinner on top, no second skeleton.",
    },
    {
      title: "The load fails",
      platforms: ["web", "desktop", "mobile"],
      handling: "The skeleton is replaced by the pane's error state (\"Couldn't load conversations\" with Try again). A skeleton never runs forever — a 30 s ceiling turns it into that error.",
    },
    {
      title: "Data is already on screen",
      platforms: ["web", "desktop", "mobile"],
      handling: "A refresh, a revalidation or a reconnect never swaps visible rows for a skeleton. The cached rows stay; a quiet refresh indicator or the pull-to-refresh spinner says work is happening.",
    },
    {
      title: "Offline with nothing cached",
      platforms: ["desktop", "mobile"],
      handling: "A skeleton would never resolve, so it is not shown. The pane says \"You're offline. This will load when you reconnect.\" and loads by itself on reconnect.",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop", "mobile"],
      handling: "The sweep stops and the shapes are still grey, exactly as Figma draws them. The fade-in (160 ms opacity) stays — it is not motion across the screen.",
    },
    {
      title: "Screen reader",
      platforms: ["web", "desktop", "mobile"],
      handling: "Hears \"Loading conversations\" once, from the group; the shapes are hidden. A list of forty rows is still one announcement.",
      example: {
        name: "One announcement",
        props: {
          shape: "row",
          label: "Loading conversations",
          lines: 1,
        },
        width: 320,
      },
    },
    {
      title: "Laid out but not yet visible",
      platforms: ["web", "desktop", "mobile"],
      handling: "While `visible` is false (its first 300 ms) the placeholder is hidden from screen readers too, not only from sight: nothing is announced and there is no \"Loading\" group to find until it fades in.",
      example: {
        name: "Not yet visible",
        props: { shape: "row", label: "Loading conversations", visible: false },
        width: 320,
      },
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Each bar sits in a line box of fontSize × 1.4 at the current scale, so the skeleton row is as tall as the real row it stands in for and nothing jumps when the text arrives.",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "The fill is one step above the card in each theme (#2c2c2f on #222124) and the sheen one step above that, so the shape reads without glowing.",
    },
  ],
  related: ["list-item", "card", "empty-state", "progress-bar"],
  flows: [
    {
      id: "slow-first-read",
      title: "A slow first read: nothing, then the skeleton, then the rows",
      description: "A skeleton is for a wait long enough to notice. It stays hidden for the first 300 ms, fades in if the read is still going, stays at least 400 ms, then gives way to the real rows.",
      platforms: ["web", "desktop", "mobile"],
      width: 343,
      steps: [
        {
          kind: "data",
          title: "Nothing for this conversation is on the device",
          detail: "A conversation painted from the SQLite cache is loaded from its first frame and never goes behind a skeleton; a refresh behind it stays quiet.",
          code: "const held = s.chMsgs[s.activeChannel]; const loaded = held !== undefined",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The channel list has nothing yet",
          detail: "On a cold launch the offline snapshot usually fills the list first, and then no skeleton is drawn at all.",
          code: "const slow = useSlowFlag(channels.isLoading);",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route's query is pending with nothing cached",
          detail: "The loader prefetches where it can; the skeleton is for the wait that remains.",
          code: "const { isPending } = useQuery(messagesQuery(channelId)); const slow = useSlowFlag(isPending)",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The read starts",
          detail: "Opening #design-crit on the desktop calls hydrateChannel; the phone's list query calls listChannels.",
        },
        {
          kind: "state",
          title: "For 300 ms, nothing shows",
          detail: "useSlowFlag answers false at first. The skeleton is laid out but invisible, so a fast read never flashes grey and nothing jumps when it appears.",
          code: "if (loading) return shownAt === null ? { show: true, afterMs: timing.delayMs } : null;",
        },
        {
          kind: "motion",
          title: "The group fades in",
          detail: "Opacity 0 → 1 over 160 ms. The bars' sheen crosses every 1.4 s (af-sheen) and stops under reduced motion. One status element says what is loading, once.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "The read answers",
        },
        {
          kind: "state",
          title: "It holds at least 400 ms, for the screen that waited",
          detail: "A skeleton that has just appeared isn't snatched away. The desktop keys that tail to the conversation that waited, so switching to a cached one doesn't inherit it.",
          code: "return { show: waiting || (slow && waitedFor === key), visible: slow }",
        },
        {
          kind: "result",
          title: "The rows take its place",
          detail: "Each bar sat in the line box the real text takes, so nothing moves when the words land. After 8 s the desktop adds \"This conversation has not loaded yet.\" with Try again.",
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
              gap: "$space.sm",
              width: 320,
            },
            children: [
              {
                el: "text",
                text: "# design-crit",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "row",
                  label: "Loading messages…",
                  visible: false,
                  rows: [
                    {
                      title: 96,
                      subtitle: 220,
                    },
                    {
                      title: 132,
                      subtitle: 180,
                    },
                    {
                      title: 112,
                      subtitle: 204,
                    },
                  ],
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
              gap: "$space.sm",
              width: 343,
            },
            children: [
              {
                el: "text",
                text: "Messages",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "row",
                  label: "Loading conversations",
                  visible: false,
                  rows: [
                    {
                      title: 96,
                      subtitle: 220,
                    },
                    {
                      title: 132,
                      subtitle: 180,
                    },
                    {
                      title: 112,
                      subtitle: 204,
                    },
                  ],
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
              gap: "$space.sm",
              width: 320,
            },
            children: [
              {
                el: "text",
                text: "# design-crit",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "row",
                  label: "Loading messages…",
                  visible: false,
                  rows: [
                    {
                      title: 96,
                      subtitle: 220,
                    },
                    {
                      title: 132,
                      subtitle: 180,
                    },
                    {
                      title: 112,
                      subtitle: 204,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1700,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 320,
            },
            children: [
              {
                el: "text",
                text: "# design-crit",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "row",
                  label: "Loading messages…",
                  visible: true,
                  rows: [
                    {
                      title: 96,
                      subtitle: 220,
                    },
                    {
                      title: 132,
                      subtitle: 180,
                    },
                    {
                      title: 112,
                      subtitle: 204,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 343,
            },
            children: [
              {
                el: "text",
                text: "Messages",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "row",
                  label: "Loading conversations",
                  visible: true,
                  rows: [
                    {
                      title: 96,
                      subtitle: 220,
                    },
                    {
                      title: 132,
                      subtitle: 180,
                    },
                    {
                      title: 112,
                      subtitle: 204,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 320,
            },
            children: [
              {
                el: "text",
                text: "# design-crit",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "indigo",
                  time: "10:42 AM",
                  body: "Crit moves to Thursday 15:00. Bring the onboarding flow, v4 is in Figma.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Marcus Chen",
                  identity: "green",
                  time: "10:44 AM",
                  body: "I'll pin the agenda here before lunch.",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 343,
            },
            children: [
              {
                el: "text",
                text: "Messages",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
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
                  title: "platform-eng",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Aisha Bello",
                  leading: "avatar",
                  avatar: {
                    name: "Aisha Bello",
                    identity: "ochre",
                  },
                  subtitle: "Can you check the rollout plan before 4?",
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
