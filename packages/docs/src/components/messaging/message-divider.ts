import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "message-divider",
  name: "Message divider",
  category: "messaging",
  level: "atom",
  status: "beta",
  description: "A rule across the timeline: the day a run of messages was sent (\"Today\", \"Yesterday\", \"Monday\", \"Monday, 27 October\") or the coral \"New messages\" line where your unread starts. While scrolling, the current day rides at the top as a sticky pill.",
  props: {
    kind: {
      type: "enum",
      options: ["date", "new"],
      default: "date",
      description: "date marks a day boundary; new marks the first message you have not read.",
    },
    label: {
      type: "string",
      default: "",
      sample: "Today",
      description: "For date: \"Today\", \"Yesterday\", a weekday within the last 6 days (\"Monday\"), else \"Monday, 27 October\" — with the year only when it is not this year (\"Friday, 13 December 2024\"). Formatted in the reader's locale and time zone. Ignored for new.",
    },
    sticky: {
      type: "boolean",
      default: false,
      description: "The floating day pill pinned to the top of the scroller. On web and desktop it is a button that opens the jump-to-day menu (Today, Yesterday, Last week, a calendar).",
    },
    onJump: {
      type: "event",
      platforms: ["web", "desktop"],
      description: "The sticky pill was pressed: open the jump-to-day menu.",
    },
    expanded: {
      type: "boolean",
      platforms: ["web", "desktop"],
      description: "The jump-to-day menu the sticky pill opens is open: the pill reports it through aria-expanded. Left out, the pill says nothing about the menu's state.",
    },
    level: {
      type: "number",
      default: 3,
      platforms: ["web", "desktop"],
      description: "The heading level of a day divider, so a timeline fits the page's outline.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A row with role=\"heading\" (level 3) for a day or role=\"separator\" for New messages, inline styles over `t`; the sticky pill is a <button> (aria-haspopup=\"menu\") with hover, press and focus from useInteraction, and onJump opens the app's jump-to-day menu",
      import: "import { MessageDivider } from \"@antfabric/ui-react/chat\"",
      notes: [
        "The sticky pill is a position: sticky band the messages scroll under; only the pill takes pointer events. Its label is the day of the topmost visible row, measured from data-day-start anchors, not per message.",
        "The first day draws no in-list divider: the sticky pill is already showing that label in the same place, and two pills on top of each other read as a glitch.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "On the sticky pill: opens Jump to day (Today, Yesterday, Last week, a calendar)",
        },
        {
          keys: "Escape",
          action: "Closes the menu and returns focus to the pill",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same row as web at desktop density, inline styles over `t`; the sticky pill's onJump opens the app's jump-to-day menu (MenuSurface, 244 wide)",
      import: "import { MessageDivider } from \"@antfabric/ui-react/chat\"",
      notes: [
        "\"New messages\" is a coral rule at 50% with the label at its end, and it sits above the first unread message so that message lands directly under the sticky day pill when the channel opens (data-first-unread).",
        "Today the desktop writes the year on every date past the 6-day window; this spec drops it within the current year.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "On the sticky pill: opens Jump to day",
        },
      ],
    },
    mobile: {
      status: "partial",
      base: "View (accessibilityRole header for a day, role separator for New messages) with hairline Views either side of the Text, StyleSheet over useTheme(); the sticky pill is a translucent View, not a button",
      import: "import { MessageDivider } from \"@antfabric/ui-react-native/chat\"",
      notes: [
        "Today's TimelineDivider: a hairline either side of a 12pt SemiBold faint label; \"New messages\" is the same shape in coral and is a header for VoiceOver.",
        "Gap: the phone has no sticky day pill yet. Spec: while the list is scrolling, a translucent pill shows the topmost day and fades out 1.5 s after scrolling stops (no fade under Reduce Motion — it simply hides). It is not a button on mobile; the jump-to-day menu is desktop and web only.",
      ],
    },
  },
  a11y: {
    role: "heading",
    notes: [
      "Date dividers are exposed as headings (level 3 by default, `level` sets it) in the timeline, so screen-reader users can jump day by day with the heading rotor or H.",
      "The sticky pill's name says what it shows and what it does: \"Showing Yesterday. Jump to another day\". It reports `aria-expanded` from the `expanded` prop when the product gives it.",
    ],
  },
  examples: [
    {
      name: "Today",
      props: {
        label: "Today",
      },
      width: 560,
    },
    {
      name: "A weekday",
      props: {
        label: "Monday",
      },
      width: 560,
    },
    {
      name: "Older date",
      props: {
        label: "Monday, 27 October",
      },
      width: 560,
    },
    {
      name: "New messages",
      props: {
        kind: "new",
      },
      width: 560,
    },
    {
      name: "Sticky day pill",
      props: {
        label: "Yesterday",
        sticky: true,
      },
      width: 560,
    },
  ],
  matrix: [
    {
      prop: "kind",
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "Midnight passes while the channel is open",
      platforms: ["web", "desktop", "mobile"],
      handling: "Labels are recomputed at local midnight (one timer, not per row) and when the window or app regains focus: \"Today\" becomes \"Yesterday\", and the next message gets a new \"Today\" divider. Two dividers saying the same thing are impossible because a boundary is a change of label, not of the raw date string.",
    },
    {
      title: "Travelling across time zones",
      platforms: ["web", "desktop", "mobile"],
      handling: "Days are the reader's local calendar days. A message sent at 23:30 in Bengaluru appears under \"Yesterday\" for a reader in San Francisco. Each row's time keeps its own value; only grouping follows the reader.",
    },
    {
      title: "New messages and a new day on the same message",
      platforms: ["web", "desktop", "mobile"],
      handling: "The date divider comes first and the coral line second, directly above the message: \"Tuesday, and this is where you got to\".",
    },
    {
      title: "Unread run read on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "If you read the channel on your phone, an open desktop pane keeps its \"New messages\" line until you leave the channel (removing it mid-read would move the text you are looking at); on the next open it is gone. A closed or backgrounded pane updates on return.",
    },
    {
      title: "Only your own messages are new",
      platforms: ["web", "desktop", "mobile"],
      handling: "No line. Your own messages and thread replies never count as unread, so the line is placed at the first message somebody else sent past your read mark, or not at all.",
    },
    {
      title: "Long localised label",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label never wraps or truncates; the rules on either side shrink to nothing first. German and Tamil weekday-and-month strings fit at 320 wide.",
      example: {
        name: "Long label, narrow",
        props: {
          label: "Donnerstag, 30. Oktober",
        },
        width: 260,
      },
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "The date divider is symmetrical. \"New messages\" puts its label at the inline end, which is the left in Arabic and Hebrew.",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop", "mobile"],
      handling: "Jumping to a day scrolls instantly instead of smoothly; the mobile scroll pill appears and disappears without a fade.",
    },
  ],
  related: ["message", "typing-indicator", "menu"],
  flows: [
    {
      id: "open-at-first-unread",
      title: "A channel opens where you got to",
      description: "Opening a channel with unread messages lands on the coral New messages line, not at the bottom. The line is drawn from a copy of your read mark taken on arrival, so it stays put while you read even though the mark itself moves at once.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "trigger",
          title: "#platform-eng is opened",
          detail: "From the sidebar, a notification or a link. Two people have written since you last read it.",
        },
        {
          kind: "data",
          title: "Arriving copies your read mark first",
          detail: "Opening the channel moves your read mark within a round trip, which would erase where you got to. So the switch copies the mark for the channel you're arriving at, and the line is drawn from the copy.",
          code: "channelUnreadAnchor: anchorsAfterSwitch(s.channelUnreadAnchor ?? {}, s.channelReadMark ?? {}, s.activeChannel, id)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The screen takes the read mark once",
          detail: "The channel screen is pushed per conversation, so a mount is an arrival. It keeps the mark it found for the whole visit.",
          code: "if (unreadAnchor.current === undefined && channel !== undefined) unreadAnchor.current = channel.last_read_message_id",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route keeps the mark it loaded with",
          detail: "The channel route's loader reads last_read_message_id with the channel and keeps it for the visit, so marking the channel read doesn't move the line.",
          code: "const { lastReadMessageId } = Route.useLoaderData()",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "The first message past the mark gets the line",
          detail: "The first message from someone else after your mark. Your own messages, and a message still sending, never count; no mark at all puts the line above the oldest message loaded. A new day's divider comes first, then the line.",
          code: "withUnreadDivider(found, s.channelUnreadAnchor?.[s.activeChannel])  ·  withUnreadDivider(rows, unreadAnchor.current, self, 'newest-first')",
        },
        {
          kind: "effect",
          title: "The channel opens on the line, not at the bottom",
          detail: "The line lands just under the sticky day pill. With nothing unread, the channel opens at the newest message.",
          code: "box.scrollTop += row.getBoundingClientRect().top - box.getBoundingClientRect().top - DAY_BANNER_H  ·  list.current?.scrollToIndex({ index: at, viewPosition: 1, animated: false })",
        },
        {
          kind: "motion",
          title: "No scroll animation",
          detail: "This is where the conversation opens, not a move within it. An animated scroll would flick through everything already read.",
        },
        {
          kind: "result",
          title: "New messages, above Kenji's",
          detail: "The unread wash fades as each row is read and the badge clears, but the line stays where it is until you leave the channel.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
              {
                el: "component",
                use: "message-divider",
                props: {
                  label: "Today",
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Marcus Chen",
                  identity: "green",
                  time: "10:41 AM",
                  body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "ink",
                  time: "11:02 AM",
                  body: "Design crit moved to 3:30 — the room was double-booked.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Sofia Herrera",
                  identity: "red",
                  time: "11:05 AM",
                  body: "Release freeze is 12 November, 18:00 IST. Added it to the pinned checklist.",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
              {
                el: "component",
                use: "message-divider",
                props: {
                  label: "Today",
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Marcus Chen",
                  identity: "green",
                  time: "10:41 AM",
                  body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message-divider",
                props: {
                  kind: "new",
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "ink",
                  time: "11:02 AM",
                  body: "Design crit moved to 3:30 — the room was double-booked.",
                  reactions: [],
                  unread: true,
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Sofia Herrera",
                  identity: "red",
                  time: "11:05 AM",
                  body: "Release freeze is 12 November, 18:00 IST. Added it to the pinned checklist.",
                  reactions: [],
                  unread: true,
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
              {
                el: "component",
                use: "message-divider",
                props: {
                  label: "Today",
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Marcus Chen",
                  identity: "green",
                  time: "10:41 AM",
                  body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message-divider",
                props: {
                  kind: "new",
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "ink",
                  time: "11:02 AM",
                  body: "Design crit moved to 3:30 — the room was double-booked.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Sofia Herrera",
                  identity: "red",
                  time: "11:05 AM",
                  body: "Release freeze is 12 November, 18:00 IST. Added it to the pinned checklist.",
                  reactions: [],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "jump-to-a-day",
      title: "Jump to another day from the sticky pill",
      description: "The pill at the top of the timeline always names the day you're reading. Pressing it offers Today, Yesterday, Last week or a date, and choosing one scrolls that day's first message to just under the pill.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "The pill shows the topmost day on screen",
          detail: "On every scroll it finds the last day-start above its own bottom edge. One pill for the whole list, not one per message.",
          code: "const next = bannerLabel(starts, el.getBoundingClientRect().top + DAY_BANNER_H)",
        },
        {
          kind: "trigger",
          title: "The pill is pressed",
          detail: "Or Enter / Space with it focused.",
        },
        {
          kind: "event",
          title: "onJump() fires",
          detail: "Today's DayBanner keeps the menu's open state itself, and calls its onJump once a day is chosen.",
          code: "onJump?.()  // today: onClick={() => setOpen((v) => !v)}",
        },
        {
          kind: "motion",
          title: "The menu pops in under the pill",
          detail: "244 wide on the shared menu surface. Today's surface draws a short rise; the spec pops it, like every menu.",
          enter: "pop",
        },
        {
          kind: "data",
          title: "Each row knows its day's first message",
          detail: "A day with nothing loaded is a disabled row that says so. Jump to a specific date opens a month grid of the days that have messages.",
          code: "jumpOptions(days, now)  // { key: 'yesterday', label: 'Yesterday', firstId: exact(yesterday) }",
        },
        {
          kind: "trigger",
          title: "Yesterday is chosen",
        },
        {
          kind: "effect",
          title: "The list scrolls to that day",
          detail: "Its first message lands just under the pill, and the list stops pinning itself to the newest message.",
          code: "el.scrollTop += row.getBoundingClientRect().top - el.getBoundingClientRect().top - DAY_BANNER_H; onJump()",
        },
        {
          kind: "result",
          title: "The pill reads Yesterday",
          detail: "Yesterday's first message sits just under it. Had Escape been pressed instead, the menu would close and focus would go back to the pill.",
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
              width: 560,
              minHeight: 340,
            },
            children: [
              {
                el: "component",
                use: "message-divider",
                props: {
                  label: "Today",
                  sticky: true,
                },
              },
              {
                el: "view",
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
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Kenji Watanabe",
                      identity: "ink",
                      time: "11:02 AM",
                      body: "Design crit moved to 3:30 — the room was double-booked.",
                      reactions: [],
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
              width: 560,
              minHeight: 340,
            },
            children: [
              {
                el: "component",
                use: "message-divider",
                props: {
                  label: "Today",
                  sticky: true,
                },
              },
              {
                el: "view",
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
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Kenji Watanabe",
                      identity: "ink",
                      time: "11:02 AM",
                      body: "Design crit moved to 3:30 — the room was double-booked.",
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
          hold: 1500,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 340,
            },
            children: [
              {
                el: "component",
                use: "message-divider",
                props: {
                  label: "Today",
                  sticky: true,
                },
              },
              {
                el: "view",
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
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Kenji Watanabe",
                      identity: "ink",
                      time: "11:02 AM",
                      body: "Design crit moved to 3:30 — the room was double-booked.",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "menu",
                style: {
                  position: "absolute",
                  top: 40,
                  alignSelf: "center",
                },
                props: {
                  label: "Jump to a day",
                  width: 244,
                  items: [
                    {
                      label: "Today",
                    },
                    {
                      label: "Yesterday",
                    },
                    {
                      label: "Last week",
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Jump to a specific date",
                      icon: "calendar",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 5,
          press: 2,
          hold: 1000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 340,
            },
            children: [
              {
                el: "component",
                use: "message-divider",
                props: {
                  label: "Today",
                  sticky: true,
                },
              },
              {
                el: "view",
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
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Kenji Watanabe",
                      identity: "ink",
                      time: "11:02 AM",
                      body: "Design crit moved to 3:30 — the room was double-booked.",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "menu",
                style: {
                  position: "absolute",
                  top: 40,
                  alignSelf: "center",
                },
                props: {
                  label: "Jump to a day",
                  width: 244,
                  items: [
                    {
                      label: "Today",
                    },
                    {
                      label: "Yesterday",
                    },
                    {
                      label: "Last week",
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Jump to a specific date",
                      icon: "calendar",
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
              width: 560,
              minHeight: 340,
            },
            children: [
              {
                el: "component",
                use: "message-divider",
                props: {
                  label: "Yesterday",
                  sticky: true,
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Mei Tanaka",
                      identity: "ochre",
                      time: "4:18 PM",
                      body: "Onboarding v4 is ready for crit — Figma link in the thread.",
                      reactions: [],
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Ravi Iyer",
                      identity: "red",
                      time: "5:02 PM",
                      body: "Chat gateway p95 is back under 120 ms after the pool fix.",
                      reactions: [],
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
