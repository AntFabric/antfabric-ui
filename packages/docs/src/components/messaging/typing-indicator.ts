import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "typing-indicator",
  name: "Typing indicator",
  category: "messaging",
  level: "atom",
  status: "beta",
  description: "The line between the timeline and the composer that says who is writing right now: one name, two names, or \"Several people\". Three dots pulse beside it; under reduced motion they hold still.",
  props: {
    names: {
      type: "array",
      default: [],
      sample: ["Priya"],
      description: "First names of the people typing in THIS conversation (or this thread, in the thread panel), oldest first. Never includes you — not even from your other device.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "Plain flex row, inline styles over `t`; the dots are the kit's af-bounce keyframes (1.2 s, 160 ms stagger) and rest at .35 / .65 / 1 under reduced motion; the sentence is read from a visually hidden span, the dots and ellipsis are hidden",
      import: "import { TypingIndicator } from \"@antfabric-ui/react/chat\"",
      notes: [
        "A background tab still receives typing events but sends none; the dots animate only while the tab is visible (no work for a hidden tab).",
        "Two tabs on the same channel are one person: the server keys typing by participant, so you never appear twice to others.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same row as web, inline styles over `t`, in the channel pane's status slot; dots on af-bounce",
      import: "import { TypingIndicator } from \"@antfabric-ui/react/chat\"",
      notes: [
        "Today the desktop draws a static coral \"•••\" and the sentence in italic faint caption text; this spec animates the dots.",
        "A typer lapses 8 s after their last \"started\" (TYPING_TTL_MS); senders re-arm every 4 s and send \"stopped\" after 5 s idle, on send, or on blur.",
        "When the window is hidden in the tray nothing is drawn or animated; the slot is recomputed from live typers when it shows again, so a stale \"is typing…\" never greets you.",
      ],
    },
    mobile: {
      status: "planned",
      base: "View labelled with the sentence, Text, StyleSheet over useTheme(); the dots with Animated.loop on the native driver, staggered 160 ms, held still under Reduce Motion",
      import: "import { TypingIndicator } from \"@antfabric-ui/react-native/chat\"",
      notes: [
        "The phone app does not show typing today. It sits directly above the composer, under the timeline, and does not push the list: it occupies a fixed 28pt slot that is always reserved, so the last message never jumps.",
        "The app only listens while the conversation screen is focused and in the foreground; backgrounding clears the list.",
      ],
    },
  },
  a11y: {
    notes: [
      "Not a live region. Typing changes every few seconds and announcing it would talk over somebody reading or dictating; a screen reader finds it by moving to it.",
      "The dots are hidden; the accessible text is the sentence without the ellipsis. The bounce stops when the person turns on Reduce Motion, on the phone as it is turned on.",
    ],
  },
  examples: [
    {
      name: "One person",
      props: {
        names: ["Priya"],
      },
      width: 480,
    },
    {
      name: "Two people",
      props: {
        names: ["Priya", "Marcus"],
      },
      width: 480,
    },
    {
      name: "Three or more",
      props: {
        names: ["Priya", "Marcus", "Aisha", "Kenji"],
      },
      width: 480,
    },
  ],
  edgeCases: [
    {
      title: "A very long name",
      platforms: ["web", "desktop", "mobile"],
      handling: "The name truncates and the verb never does — \"is typing…\" is the part that carries the meaning. The accessible name keeps the full name.",
      example: {
        name: "Long name",
        props: {
          names: ["Venkataraghavan Subramaniam-Iyer"],
        },
        width: 260,
      },
    },
    {
      title: "You are typing on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "Your own participant id is filtered out, so typing on the phone never shows \"Priya is typing…\" to Priya on the desktop.",
    },
    {
      title: "Someone stops without sending",
      platforms: ["web", "desktop", "mobile"],
      handling: "A \"stopped\" removes them at once; a lost \"stopped\" (closed laptop, dead socket) still lapses after 8 s, because the list is always read through the TTL, never straight off the last event.",
    },
    {
      title: "Offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "There are no typing events offline, so the slot shows the offline notice instead (\"AntFabric is offline right now. Check your internet connection. Anything you type stays here until you're back online.\") and the typing list is cleared. On reconnect the slot is empty until a fresh \"started\" arrives.",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop", "mobile"],
      handling: "prefers-reduced-motion (and iOS Reduce Motion / Android Remove animations) holds the dots still at three fixed opacities — the drawing in this catalogue. The words already say what is happening.",
    },
    {
      title: "Typing in a thread",
      platforms: ["web", "desktop", "mobile"],
      handling: "A reply being typed shows in that thread's panel or screen only. The channel's own slot is for top-level messages, so a busy thread does not make the channel look busy.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "The slot grows to fit one line at the larger size; it stays one line and the name truncates first.",
    },
  ],
  related: ["composer", "message", "offline-notice"],
  flows: [
    {
      id: "someone-starts-typing",
      title: "Someone starts typing, then sends",
      description: "Typing signals arrive over the socket and are kept per channel with a time-to-live, so the line says who is writing right now and never sticks after they stop. It sits in a reserved slot above the composer, so the timeline never jumps.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "trigger",
          title: "Kenji starts typing in #platform-eng",
          detail: "He is on the desktop app, which sends started on his first keystroke and again every 4 s while he keeps going, and stopped after 5 s idle, when he sends, or when the box empties. A signal that fails is never retried.",
          code: "if (v.trim() === '') typingSender.stop(channelId); else typingSender.keystroke(channelId)",
        },
        {
          kind: "trigger",
          title: "chat.typing.started arrives over the socket",
          lane: "system",
          detail: "The gateway sends it to every socket on the channel, the sender's too, so your own is dropped on the way in. You never see yourself typing, not even from your phone.",
          code: "if (who === get().userId) return",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The store adds him to the channel's typers",
          detail: "Each typer is an id and the time of their last started. Leaving a channel drops its typers, and the other channels keep only those still within their time-to-live.",
          code: "channelTyping: { ...st.channelTyping, [key]: started ? addTyper(current, who, Date.now()) : removeTyper(current, who) }",
          platforms: ["web", "desktop"],
        },
        {
          kind: "data",
          title: "The pane turns typers into one sentence",
          detail: "Always read through the 8 s time-to-live, never straight off the last event, so a lost stopped can't leave him typing for ever. Names come from the people directory, and offline the slot shows the offline notice instead.",
          code: "const typingNote = typingLabel(activeTypers(typers, Date.now()).map((t) => resolveMember(t.id, s.people).name))",
          platforms: ["web", "desktop"],
        },
        {
          kind: "data",
          title: "The phone doesn't listen for typing yet",
          detail: "Its chat socket routes every chat.* event through applyChatEvent, which has no typing case today. The spec adds one, kept per channel with the same 8 s time-to-live, listened to only while the conversation is on screen.",
          code: "socket.onEvent(({ subject, envelope }) => applyChatEvent(queryClient, subject, envelope, { selfId, activeChannelId, … }))",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The dots pulse beside his name",
          detail: "Three dots on a 1.2 s loop, 160 ms apart; under reduced motion they hold still. Today's desktop draws a static coral •••.",
        },
        {
          kind: "trigger",
          title: "Priya starts too",
          detail: "Two names, oldest first. A third makes it \"Several people are typing…\".",
        },
        {
          kind: "state",
          title: "Kenji sends, and stops typing first",
          detail: "deliverCh sends stopped before the message, so nobody sees him typing beside his own finished message. If a stopped never arrives, one timer repaints the pane when the oldest typer lapses.",
          code: "stopTypingHere()  // deliverCh's first line  ·  setTimeout(() => setTypingTick((n) => n + 1), Math.max(1, lapseAt - Date.now()))",
        },
        {
          kind: "result",
          title: "Only Priya is left",
          detail: "Kenji's message is in the timeline, and the line says Priya is typing… until she sends or stops.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
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
                ],
              },
              {
                el: "view",
                style: {
                  minHeight: 28,
                  justify: "flex-end",
                },
                children: [
                  {
                    el: "component",
                    use: "typing-indicator",
                    props: {
                      names: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {},
              },
            ],
          },
        },
        {
          step: 3,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
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
                ],
              },
              {
                el: "view",
                style: {
                  minHeight: 28,
                  justify: "flex-end",
                },
                children: [
                  {
                    el: "component",
                    use: "typing-indicator",
                    props: {
                      names: ["Kenji"],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {},
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
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
                ],
              },
              {
                el: "view",
                style: {
                  minHeight: 28,
                  justify: "flex-end",
                },
                children: [
                  {
                    el: "component",
                    use: "typing-indicator",
                    props: {
                      names: ["Kenji"],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {},
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
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
                ],
              },
              {
                el: "view",
                style: {
                  minHeight: 28,
                  justify: "flex-end",
                },
                children: [
                  {
                    el: "component",
                    use: "typing-indicator",
                    props: {
                      names: ["Kenji", "Priya"],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {},
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1900,
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
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
                      time: "10:46 AM",
                      body: "Samsung A54 drops the draft on reconnect — filed PLAT-2291.",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "view",
                style: {
                  minHeight: 28,
                  justify: "flex-end",
                },
                children: [
                  {
                    el: "component",
                    use: "typing-indicator",
                    props: {
                      names: ["Priya"],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {},
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
