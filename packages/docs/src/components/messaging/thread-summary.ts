import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "thread-summary",
  name: "Thread summary",
  category: "messaging",
  level: "molecule",
  status: "beta",
  description: "The line under a message that has replies: who is in the thread, how many replies, how many you have not read, and when the last one came. Pressing it opens the thread.",
  props: {
    replyCount: {
      type: "number",
      sample: 4,
      required: true,
      description: "Replies in the thread. 0 renders nothing — the parent message decides whether to draw the summary at all.",
    },
    lastReply: {
      type: "string",
      default: "",
      sample: "2h ago",
      description: "Relative time of the newest reply, formatted by the caller: \"just now\", \"12m ago\", \"2h ago\", \"Yesterday\", \"Monday, 27 October\".",
    },
    participants: {
      type: "array",
      default: [],
      sample: [
        {
          name: "Priya Raman",
          identity: "indigo",
        },
        {
          name: "Marcus Chen",
          identity: "green",
        },
        {
          name: "Aisha Bello",
          identity: "ochre",
        },
      ],
      description: "Up to three repliers, most recent first: { name, identity, src?, agent? }. The caller trims the list; more than three is never drawn.",
    },
    unreadCount: {
      type: "number",
      default: 0,
      description: "Replies you have not read. Server-counted (it rides the message beside reply_count) because the client holds no replies until the thread is opened.",
    },
    following: {
      type: "boolean",
      default: false,
      description: "You follow this thread: you started it, replied, were mentioned in it, or chose Follow. Followed threads notify you and appear in Threads.",
    },
    onFollowingChange: {
      type: "event",
      args: "following: boolean",
      changes: "following",
      description: "Called with `following` as the press leaves it. Given `following` too, the line is controlled and the press changes nothing on it; on its own (the catalogue, where opening is navigation) the press flips Following.",
    },
    onPress: {
      type: "event",
      description: "Opens the thread: the side panel on web and desktop, the thread screen on mobile.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <button> with inline styles over `t`; hover, press and focus from useInteraction; faces from the kit's Avatar (xs).",
      import: "import { ThreadSummary } from \"@antfabric/ui-react/chat\"",
      notes: [
        "Opens the thread in the right-hand panel and updates the URL (…/c/platform-eng/t/<id>), so a thread is a link that can be pasted, bookmarked and opened in a new tab with ⌘-click.",
        "Hover lifts it to a card edge (Slack's) so it reads as a button and not as the message's text.",
        "Opening the thread is navigation, so in the catalogue a press toggles `following` instead (what Follow / Unfollow in the thread's ⋯ does): the bell and 'Following' fade in or out.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Opens the thread panel",
        },
        {
          keys: "T",
          action: "On a focused message, opens its thread — the same target",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <button> as web (one file), at the desktop density; faces from the kit's Avatar (xs).",
      import: "import { ThreadSummary } from \"@antfabric/ui-react/chat\"",
      notes: [
        "Today's desktop draws the thread glyph, \"N unread\" in info blue and \"N replies\" in coral (ADR-4007: two numbers in one colour read as one fact). This spec adds the repliers' faces, \"Last reply …\" and Following.",
        "The count uses the link ink (coral) and the unread uses info blue, so the two numbers stay apart at a glance.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Opens the thread panel",
        },
        {
          keys: "T",
          action: "On the message cursor, opens its thread",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable over a wrapping row, StyleSheet over useTheme() tokens (44pt target), usePress for the pressed fade; faces from the kit's Avatar (xs).",
      import: "import { ThreadSummary } from \"@antfabric/ui-react-native/chat\"",
      notes: [
        "14pt SemiBold, coral count, info-blue unread — the V2 Figma. The whole line is one 44pt-tall target even though the text is 20pt.",
        "On a 375pt screen \"Last reply …\" is what gives way first: it truncates, then the faces stay, then Following stays — the count and unread never truncate.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Pushes the thread screen",
        },
      ],
    },
  },
  a11y: {
    role: "button",
    label: "Open thread, 4 replies, 2 unread, last reply 2h ago",
    notes: [
      "The faces are hidden from assistive tech; the label carries the facts in reading order.",
      "Unread is said in words as well as drawn in blue, never by colour alone.",
      "Counts are grouped in the reader's locale (`useLocale()`): 1,204 or 1.204.",
    ],
  },
  examples: [
    {
      name: "Replies",
      props: {},
    },
    {
      name: "Unread replies",
      props: {
        replyCount: 12,
        unreadCount: 3,
        lastReply: "12m ago",
        following: true,
        participants: [
          {
            name: "Kenji Watanabe",
            identity: "ink",
          },
          {
            name: "Sofia Herrera",
            identity: "red",
          },
          {
            name: "Priya Raman",
            identity: "indigo",
          },
        ],
      },
    },
    {
      name: "One reply",
      props: {
        replyCount: 1,
        lastReply: "just now",
        participants: [
          {
            name: "Daniel Okafor",
            identity: "green",
          },
        ],
      },
    },
    {
      name: "Fabric replied",
      props: {
        replyCount: 2,
        lastReply: "5m ago",
        following: true,
        participants: [
          {
            name: "Fabric",
            identity: "agent",
            agent: true,
          },
          {
            name: "Mei Tanaka",
            identity: "ochre",
          },
        ],
      },
    },
  ],
  matrix: [
    {
      prop: "following",
    },
  ],
  states: ["hover", "pressed", "focus"],
  edgeCases: [
    {
      title: "Hundreds of replies and an old last reply",
      platforms: ["web", "desktop", "mobile"],
      handling: "The count is written in full with the locale's grouping (1,204 replies) and never truncates. \"Last reply …\" is the part that gives way: one line, ellipsis, and the full time is in the label.",
      example: {
        name: "Narrow and long",
        props: {
          replyCount: 1204,
          unreadCount: 38,
          lastReply: "Monday, 27 October",
          following: true,
        },
        width: 300,
      },
    },
    {
      title: "Read on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "Opening the thread on the phone clears the unread count on the desktop and web through the same read-state event as the sidebar badge. Reading the channel does NOT clear it: the channel's read mark stops at the newest top-level message, so a newer reply stays unread here after the sidebar badge has gone.",
    },
    {
      title: "Root deleted, replies remain",
      platforms: ["web", "desktop", "mobile"],
      handling: "The summary stays under the \"This message was deleted.\" tombstone so the conversation in the thread is still reachable. Pressing it opens the thread with the tombstone as its root.",
    },
    {
      title: "Offline",
      platforms: ["desktop"],
      handling: "The desktop draws the summary from its SQLite cache, so counts and faces may be stale; opening the thread shows the cached replies under the offline notice. Nothing pretends the count is live.",
    },
    {
      title: "Offline on web and mobile",
      platforms: ["web", "mobile"],
      handling: "The last known count stays drawn; pressing it opens the thread screen, which shows the replies already loaded in this session or \"You're offline. Showing what's on this device.\" when there are none.",
    },
    {
      title: "A reply arrives while you are looking",
      platforms: ["web", "desktop", "mobile"],
      handling: "The count and \"Last reply\" update in place; the line never moves the message under the reader's eye because its height does not change. Your own reply never counts as unread.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "The line may wrap after the count; faces stay on the first line, and the target grows with the text rather than clipping it.",
    },
  ],
  related: ["message", "thread-panel", "avatar"],
  flows: [
    {
      id: "open-a-thread",
      title: "Open a thread and catch up",
      description: "The line under a message says how many replies there are and how many are new to you. Pressing it opens the thread, beside the channel on web and desktop and as its own screen on the phone, and reading it clears this thread's unread count and nothing else.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The counts ride the parent message",
          detail: "The client holds no replies until the thread is opened, so both numbers are the server's, carried on the message beside its text.",
          code: "replyCount: m.reply_count ?? 0, unreadReplyCount: m.unread_reply_count ?? 0",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The row reads the counts off the message",
          detail: "The client holds no replies until the thread is opened, so both numbers are the server's, carried on the message in the window.",
          code: "const replies = m.reply_count ?? 0; const unreadReplies = m.unread_reply_count ?? 0",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The counts come with the channel query",
          detail: "reply_count and unread_reply_count are part of each message in the channel's TanStack Query cache.",
          code: "const { data } = useInfiniteQuery(messagesQuery(channelId))  // m.reply_count, m.unread_reply_count",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The summary is pressed",
          detail: "Enter or Space, or T with the message cursor on the message. On the phone the whole line is one 44pt target.",
        },
        {
          kind: "event",
          title: "onPress() fires",
          code: "onPress?.()",
        },
        {
          kind: "state",
          title: "The store opens the thread panel and reads the replies",
          detail: "It remembers where your unread replies start, so the panel can mark them, then reads the replies over their own request.",
          code: "set({ threadFor: messageId, threadUnreadAnchor: …lastReadReplyId, panel: 'thread', threadLoading: true }); backend.channels.replies(messageId)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "effect",
          title: "The thread screen is pushed",
          detail: "The thread screen reads its replies with useRepliesQuery(rootId).",
          code: "router.push({ pathname: '/channel/thread/[messageId]', params: { messageId: message.id, channelId: message.channel_id } })",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The panel slides in from the right",
          detail: "The channel narrows beside it; on web the URL changes to the thread, so it can be shared.",
          enter: "slide-left",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The thread screen slides in from the right",
          detail: "The stack's push; swiping from the left edge goes back to the channel.",
          enter: "slide-left",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "Reading it marks this thread read",
          detail: "Only the thread's own marker moves. The channel's badge and its New messages line are left alone.",
          code: "backend.channels.markThreadRead(channelId, messageId, newestReply)  ·  markThreadRead.mutate({ channelId, parentMessageId: rootId, replyId: newestReply.id })",
        },
        {
          kind: "result",
          title: "\"2 unread\" goes",
          detail: "The count stays and the blue unread goes, here and on your other devices. The phone zeroes it before the server answers, so it is already gone when you go back to the channel.",
        },
      ],
      replay: [
        {
          step: 3,
          press: "Open thread, 4 replies, 2 unread, last reply 12m ago, following",
          hold: 1100,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "stretch",
              width: 760,
              minHeight: 320,
            },
            children: [
              {
                el: "view",
                style: {
                  flex: 1,
                  minWidth: 0,
                },
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                      thread: {
                        count: 4,
                        lastReply: "12m ago",
                        unread: 2,
                        following: true,
                        participants: [
                          {
                            name: "Kenji Watanabe",
                            identity: "ink",
                          },
                          {
                            name: "Aisha Bello",
                            identity: "ochre",
                          },
                          {
                            name: "Priya Raman",
                            identity: "indigo",
                          },
                        ],
                      },
                    },
                  },
                ],
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
              direction: "row",
              align: "stretch",
              width: 760,
              minHeight: 320,
            },
            children: [
              {
                el: "view",
                style: {
                  flex: 1,
                  minWidth: 0,
                },
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                      thread: {
                        count: 4,
                        lastReply: "12m ago",
                        unread: 2,
                        following: true,
                        participants: [
                          {
                            name: "Kenji Watanabe",
                            identity: "ink",
                          },
                          {
                            name: "Aisha Bello",
                            identity: "ochre",
                          },
                          {
                            name: "Priya Raman",
                            identity: "indigo",
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              {
                el: "view",
                enter: "slide-left",
                style: {
                  width: 340,
                  borderLeft: "1px solid $border.subtle",
                  bg: "$surface.card",
                },
                children: [
                  {
                    el: "view",
                    style: {
                      direction: "row",
                      align: "baseline",
                      gap: "$space.xs",
                      paddingY: "$space.sm",
                      paddingX: 18,
                      borderBottom: "1px solid $border.subtle",
                    },
                    children: [
                      {
                        el: "text",
                        text: "Thread",
                        style: {
                          fontSize: "$text.body",
                          fontWeight: "$font.weightBold",
                          color: "$fg.strong",
                        },
                      },
                      {
                        el: "text",
                        text: "#platform-eng",
                        style: {
                          fontSize: "$text.caption",
                          color: "$fg.faint",
                        },
                      },
                    ],
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Aisha Bello",
                      identity: "ochre",
                      time: "10:52 AM",
                      body: "Smoke suite passed on the Pixel 8. Starting the Samsung run.",
                      reactions: [],
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Kenji Watanabe",
                      identity: "ink",
                      time: "11:30 AM",
                      body: "Samsung A54 drops the draft on reconnect — filed PLAT-2291.",
                      reactions: [],
                      unread: true,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "stretch",
              width: 760,
              minHeight: 320,
            },
            children: [
              {
                el: "view",
                style: {
                  flex: 1,
                  minWidth: 0,
                },
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                      thread: {
                        count: 4,
                        lastReply: "12m ago",
                        unread: 0,
                        following: true,
                        participants: [
                          {
                            name: "Kenji Watanabe",
                            identity: "ink",
                          },
                          {
                            name: "Aisha Bello",
                            identity: "ochre",
                          },
                          {
                            name: "Priya Raman",
                            identity: "indigo",
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              {
                el: "view",
                enter: "slide-left",
                style: {
                  width: 340,
                  borderLeft: "1px solid $border.subtle",
                  bg: "$surface.card",
                },
                children: [
                  {
                    el: "view",
                    style: {
                      direction: "row",
                      align: "baseline",
                      gap: "$space.xs",
                      paddingY: "$space.sm",
                      paddingX: 18,
                      borderBottom: "1px solid $border.subtle",
                    },
                    children: [
                      {
                        el: "text",
                        text: "Thread",
                        style: {
                          fontSize: "$text.body",
                          fontWeight: "$font.weightBold",
                          color: "$fg.strong",
                        },
                      },
                      {
                        el: "text",
                        text: "#platform-eng",
                        style: {
                          fontSize: "$text.caption",
                          color: "$fg.faint",
                        },
                      },
                    ],
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Aisha Bello",
                      identity: "ochre",
                      time: "10:52 AM",
                      body: "Smoke suite passed on the Pixel 8. Starting the Samsung run.",
                      reactions: [],
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Kenji Watanabe",
                      identity: "ink",
                      time: "11:30 AM",
                      body: "Samsung A54 drops the draft on reconnect — filed PLAT-2291.",
                      reactions: [],
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 3,
          press: "Open thread, 4 replies, 2 unread, last reply 12m ago, following",
          hold: 1100,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 360,
              bg: "$surface.app",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Marcus Chen",
                  identity: "green",
                  time: "10:41 AM",
                  body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                  reactions: [],
                  thread: {
                    count: 4,
                    lastReply: "12m ago",
                    unread: 2,
                    following: true,
                    participants: [
                      {
                        name: "Kenji Watanabe",
                        identity: "ink",
                      },
                      {
                        name: "Aisha Bello",
                        identity: "ochre",
                      },
                      {
                        name: "Priya Raman",
                        identity: "indigo",
                      },
                    ],
                  },
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
              position: "relative",
              width: 375,
              minHeight: 360,
              bg: "$surface.app",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Marcus Chen",
                  identity: "green",
                  time: "10:41 AM",
                  body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                  reactions: [],
                  thread: {
                    count: 4,
                    lastReply: "12m ago",
                    unread: 2,
                    following: true,
                    participants: [
                      {
                        name: "Kenji Watanabe",
                        identity: "ink",
                      },
                      {
                        name: "Aisha Bello",
                        identity: "ochre",
                      },
                      {
                        name: "Priya Raman",
                        identity: "indigo",
                      },
                    ],
                  },
                },
              },
              {
                el: "view",
                enter: "slide-left",
                style: {
                  position: "absolute",
                  inset: 0,
                  bg: "$surface.app",
                },
                children: [
                  {
                    el: "view",
                    style: {
                      direction: "row",
                      align: "center",
                      justify: "center",
                      height: 44,
                      borderBottom: "1px solid $border.subtle",
                    },
                    children: [
                      {
                        el: "text",
                        text: "Thread",
                        style: {
                          fontSize: "$text.body",
                          fontWeight: "$font.weightSemibold",
                          color: "$fg.strong",
                        },
                      },
                    ],
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Aisha Bello",
                      identity: "ochre",
                      time: "10:52 AM",
                      body: "Smoke suite passed on the Pixel 8. Starting the Samsung run.",
                      reactions: [],
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Kenji Watanabe",
                      identity: "ink",
                      time: "11:30 AM",
                      body: "Samsung A54 drops the draft on reconnect — filed PLAT-2291.",
                      reactions: [],
                      unread: true,
                    },
                  },
                ],
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
              position: "relative",
              width: 375,
              minHeight: 360,
              bg: "$surface.app",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Marcus Chen",
                  identity: "green",
                  time: "10:41 AM",
                  body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                  reactions: [],
                  thread: {
                    count: 4,
                    lastReply: "12m ago",
                    unread: 0,
                    following: true,
                    participants: [
                      {
                        name: "Kenji Watanabe",
                        identity: "ink",
                      },
                      {
                        name: "Aisha Bello",
                        identity: "ochre",
                      },
                      {
                        name: "Priya Raman",
                        identity: "indigo",
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "a-reply-arrives",
      title: "A reply arrives while you're reading the channel",
      description: "Someone answers in the thread. The socket moves the count on the parent message, and the line updates in place without moving the message under your eye.",
      platforms: ["web", "desktop", "mobile"],
      width: 420,
      steps: [
        {
          kind: "trigger",
          title: "chat.message.created arrives with a thread_root_id",
          lane: "system",
          detail: "Kenji replied in the thread. A reply never goes into the channel's timeline; it belongs under its parent.",
        },
        {
          kind: "state",
          title: "The parent's count moves, and unread with it",
          detail: "It's unread unless it's your own reply or the thread is already open in the panel.",
          code: "const unreadHere = reply.you !== true && s.threadFor !== parentId  // replyCount + 1, unreadReplyCount + 1",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The parent's count moves wherever it's held",
          detail: "The window store and the device cache both bump it. The socket is the only writer of the count, so your own reply isn't counted twice. Today the phone doesn't raise unread_reply_count from the socket; the server's number arrives with the next read.",
          code: "useMessageWindow.getState().patch(channelId, message.thread_root_id, (m) => bumpReplyCount(m, 1)); cacheReplyCount(disk, message.thread_root_id, 1)",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The line updates in place",
          detail: "The count, the faces and Last reply change; the line's height doesn't, so the message doesn't move.",
        },
        {
          kind: "result",
          title: "3 unread · 5 replies",
          detail: "Kenji's face leads, Last reply says just now, and the line is still one press from the thread.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          props: {
            replyCount: 4,
            unreadCount: 2,
            lastReply: "12m ago",
            following: true,
            participants: [
              {
                name: "Aisha Bello",
                identity: "ochre",
              },
              {
                name: "Priya Raman",
                identity: "indigo",
              },
              {
                name: "Marcus Chen",
                identity: "green",
              },
            ],
          },
        },
        {
          step: 3,
          hold: 1800,
          props: {
            replyCount: 5,
            unreadCount: 3,
            lastReply: "just now",
            following: true,
            participants: [
              {
                name: "Kenji Watanabe",
                identity: "ink",
              },
              {
                name: "Aisha Bello",
                identity: "ochre",
              },
              {
                name: "Priya Raman",
                identity: "indigo",
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
