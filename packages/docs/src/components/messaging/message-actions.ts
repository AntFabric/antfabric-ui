import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "message-actions",
  name: "Message actions",
  category: "messaging",
  level: "molecule",
  status: "beta",
  description: "The small toolbar that appears at the top-right of a message on hover or keyboard focus: three quick reactions, add a reaction, reply in thread, forward, and ⋯ for the rest. It floats over the row, so appearing never moves the text.",
  props: {
    quickReactions: {
      type: "array",
      default: [],
      sample: ["👍", "✅", "👀"],
      description: "One-press reactions, as emoji: your three most-used, falling back to 👍 ✅ 👀. Empty draws none, and no rule after them (a narrow pane, or an archived channel).",
    },
    addReaction: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The smile-plus that opens the emoji picker. Off in an archived channel.",
    },
    replyInThread: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Off on a reply (a reply cannot have a thread) and on the thread root inside its own thread panel — opening it again would wipe the half-typed reply below. Absent, not disabled.",
    },
    forward: {
      type: "boolean",
      default: false,
      sample: true,
    },
    actions: {
      type: "array",
      default: [],
      description: "The product's own actions: IconActionItem { key, label, icon, badge?, disabled? }, drawn as square icon buttons after Forward and before ⋯. The icon is required: a product's action cannot draw a blank button.",
    },
    more: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Whether the ⋯ menu has anything in it (Edit, Copy text, Copy link, Pin to channel, Mark unread, Delete…). A menu with no rows is never drawn.",
    },
    menuOpen: {
      type: "boolean",
      default: false,
      description: "The ⋯ menu is open; the bar stays visible while it is, even after the pointer leaves the row.",
    },
    onReact: {
      type: "event",
      args: "emoji: string",
    },
    onAddReaction: {
      type: "event",
    },
    onReplyInThread: {
      type: "event",
    },
    onForward: {
      type: "event",
    },
    onAction: {
      type: "event",
      args: "action: IconActionItem",
      description: "A product action was pressed. Called with the whole item, so the product switches on `action.key`.",
    },
    onMenuOpenChange: {
      type: "event",
      args: "menuOpen: boolean",
      changes: "menuOpen",
      description: "Called with `menuOpen` as the press on ⋯ leaves it: the caller opens or closes the menu.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"toolbar\" box with inline styles over `t`: quick reactions are <button>s with hover and press from useInteraction, the rest the kit's IconButton (square); ⋯ is a toggle IconButton that holds `menuOpen`. ← / → move focus along the bar. Tooltips are each button's title.",
      import: "import { MessageActions } from \"@antfabric/ui-react/chat\"",
      notes: [
        "Shown on row hover and on :focus-within, positioned absolute at top 2 / right 14 of the row so it costs the message no height and no reflow.",
        "Right-click on a message opens the same actions as a context menu, except on a link, an image or selected text, where the browser's own menu is kept (Copy link address, Save image, Look Up).",
        "Bare-letter shortcuts (E, R, T, F) are safe in a browser because they only fire while a message, not a text field, has focus.",
      ],
      keyboard: [
        {
          keys: "↑ / ↓",
          action: "Moves the message cursor; ↑ in an empty composer edits your last message",
        },
        {
          keys: "R",
          action: "React (opens the emoji picker)",
        },
        {
          keys: "T",
          action: "Reply in thread",
        },
        {
          keys: "F",
          action: "Forward",
        },
        {
          keys: "E",
          action: "Edit your message",
        },
        {
          keys: "Enter",
          action: "Opens the ⋯ menu for the message you are on",
        },
        {
          keys: "Escape",
          action: "Closes the menu, or leaves the message",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same toolbar as web (one file): the kit's IconButton ×n in a floating card (surface.raised, shadow raise), fading in on mount; the caller opens its menu from onMenuOpenChange.",
      import: "import { MessageActions } from \"@antfabric/ui-react/chat\"",
      notes: [
        "Today's bar is Add a reaction, Reply in thread, Copy text and ⋯ (Edit, Forward, Pin to channel, Delete). This spec adds three quick reactions and moves Forward onto the bar; Copy text moves into ⋯.",
        "Hidden while another message's picker or menu is open, so two bars never stack; kept visible while its own popover is open.",
        "Right-click anywhere on the message body opens the ⋯ menu (ADR-6120); inside the message editor the system text menu (Cut, Copy, Paste, Look Up) stays.",
        "The bar fades in (120 ms) when the row is hovered; pressing ⋯ toggles `menuOpen`, which holds the button pressed while the menu is open.",
      ],
      keyboard: [
        {
          keys: "↑ / ↓",
          action: "Moves the message cursor",
        },
        {
          keys: "R",
          action: "React",
        },
        {
          keys: "T",
          action: "Reply in thread",
        },
        {
          keys: "F",
          action: "Forward",
        },
        {
          keys: "E",
          action: "Edit your message",
        },
        {
          keys: "Enter",
          action: "Opens the ⋯ menu",
        },
        {
          keys: "Escape",
          action: "Closes the menu, then leaves the message",
        },
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "A phone has no hover. Long-press a message (300 ms, light haptic) opens the message actions sheet (see context-menu): a row of quick reactions with \"React with another emoji\", then Copy text, Reply in thread, Forward, Edit message, Pin to channel and Delete message (danger). Swipe right on a message to reply in thread is not used: the screen's swipe-back owns that edge.",
    },
  },
  a11y: {
    role: "toolbar",
    label: "Message actions",
    notes: [
      "Every control is a real button with a name (\"React with 👍\", \"Reply in thread\").",
      "Arrow keys, Home and End move between the buttons; left and right follow the tree's direction, so in right-to-left they turn round. Every button is still its own Tab stop: a single roving stop needs IconButton to take a tabIndex, which it does not yet.",
      "Inside a Message, the bar shows on hover, on focus in the row, and after a long press or Shift+F10 / the Menu key; Escape closes it back to the row.",
    ],
  },
  examples: [
    {
      name: "On a message",
      props: {},
    },
    {
      name: "On a reply (no thread)",
      props: {
        replyInThread: false,
      },
    },
    {
      name: "Menu open",
      props: {
        menuOpen: true,
      },
    },
    {
      name: "Archived channel",
      props: {
        addReaction: false,
        quickReactions: [],
        replyInThread: false,
      },
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "Message at the very top of the scroller",
      platforms: ["web", "desktop"],
      handling: "The bar sits inside the row (top 2), not above it, so the sticky day pill never covers it and the first message of the day is as reachable as any other.",
    },
    {
      title: "Sending, failed or queued message",
      platforms: ["web", "desktop"],
      handling: "No bar: a message without a server id cannot be reacted to, threaded or forwarded. The row shows its own Retry / Delete instead (see message).",
    },
    {
      title: "Narrow pane",
      platforms: ["web", "desktop"],
      handling: "Below 420px of message width the quick reactions go and the bar is Add a reaction, Reply in thread and ⋯; Forward moves into ⋯. It never wraps onto two lines.",
      example: {
        name: "Narrow",
        props: {
          quickReactions: [],
          forward: false,
        },
      },
    },
    {
      title: "Touch laptop (pointer: coarse)",
      platforms: ["web", "desktop"],
      handling: "A tap stands on the message (the message cursor) and shows the bar at 40px targets; a long-press opens the ⋯ menu. Hover never has to happen.",
    },
    {
      title: "Two copies of the same message",
      platforms: ["web", "desktop"],
      handling: "With a thread open, the root is drawn in the timeline and as the panel's first row. Each bar keys its picker to its own surface, so one press opens one picker, not two.",
    },
    {
      title: "Read-only channel",
      platforms: ["web", "desktop"],
      handling: "Reactions stay (\"You can still read it and react to messages\"); Reply in thread follows the channel's reply setting; Forward is always allowed for people who can read.",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop"],
      handling: "The bar appears without its 120 ms fade and the quick reactions do not grow on hover.",
    },
  ],
  related: ["message", "context-menu", "emoji-picker", "reaction-pill"],
  flows: [
    {
      id: "react-from-the-bar",
      title: "React to a message from the hover bar",
      description: "Hovering a message floats the bar over its top-right corner without moving the text. One press on a quick reaction adds yours, and the pill appears under the message before the server has answered.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "The bar asks what this message allows",
          detail: "abilitiesFor decides from who wrote it, when, whether it has text, whether it's a reply and whether you moderate the channel. A reply gets no Reply in thread, and a ⋯ with no rows isn't drawn.",
          code: "const ability = abilitiesFor({ createdAt: message.createdAt, isMine: message.you === true, hasText, isReply, isModerator, now: Date.now() })",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The row's data and your most-used emoji",
          detail: "The same abilities, computed from the message in the channel's TanStack Query cache. The three quick reactions are your three most-used, read once with your preferences.",
          code: "const quick = prefs.frequentEmoji.slice(0, 3)  // falls back to 👍 ✅ 👀",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The pointer rests on the message",
          detail: "Or keyboard focus lands inside it, or ↑ / ↓ moves the message cursor to it. While another message's picker or menu is open, this bar stays hidden, so two never stack.",
        },
        {
          kind: "motion",
          title: "The bar fades in at the row's top-right",
          detail: "Absolute at top 2, right 14, so the message costs no height and the text never reflows. Today's desktop fades it with the shared row-actions hover rule.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "👍 is pressed",
          detail: "One press, no picker. R opens the full picker instead.",
        },
        {
          kind: "event",
          title: "onReact('👍') fires",
          detail: "Today's desktop bar has no quick reactions: Add a reaction opens a quick bar of your frequent emoji, and picking one there does what this press does.",
          code: "onReact?.(item)  // \"👍\"",
        },
        {
          kind: "state",
          title: "The reaction is added at once",
          detail: "toggleReaction patches the message everywhere it is drawn, the timeline and an open thread, and closes the picker, before the request goes.",
          code: "apply(!had)  // set((s) => ({ reactFor: null, chMsgs: …map(patch), threadReplies: s.threadReplies.map(patch) }))",
        },
        {
          kind: "effect",
          title: "The request goes, and a refusal undoes it",
          detail: "PUT adds the reaction. If the server refuses, the chip goes back as it was and a toast says \"Your reaction was not saved. Try again.\"",
          code: "(had ? backend.channels.unreact(messageId, emoji) : backend.channels.react(messageId, emoji)).catch(() => apply(had))",
        },
        {
          kind: "motion",
          title: "The pill pops in under the message",
          enter: "pop",
        },
        {
          kind: "result",
          title: "👍 1, in your coral",
          detail: "Everyone else's copy changes when chat.reaction.added reaches them. Yours comes back too and changes nothing, because applying the same reaction twice is the same as once.",
        },
      ],
      replay: [
        {
          step: 2,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              width: 600,
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
                },
              },
            ],
          },
        },
        {
          step: 3,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              width: 600,
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
                  hovered: true,
                },
              },
            ],
          },
        },
        {
          step: 4,
          press: "React with 👍",
          hold: 900,
          scene: {
            el: "view",
            style: {
              width: 600,
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
                  hovered: true,
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              width: 600,
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
                  reactions: [
                    {
                      emoji: "👍",
                      count: 1,
                      mine: true,
                      reactors: "You reacted",
                    },
                  ],
                  hovered: true,
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
              width: 600,
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
                  reactions: [
                    {
                      emoji: "👍",
                      count: 1,
                      mine: true,
                      reactors: "You reacted",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "reply-in-thread",
      title: "Start a thread from the bar",
      description: "Reply in thread opens the thread beside the channel, with the message at the top and the reply box under it. A reply can't have a thread of its own, so the bar leaves the button out there.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "Only a top-level message offers it",
          detail: "replyInThread is left off on a reply, and on the root inside its own thread panel, where opening it again would wipe the half-typed reply below. Absent, not disabled.",
          code: "{!inThread && ability.canReplyInThread && action('Reply in thread', () => a.openMsgThread(message.id), <Thread />)}",
        },
        {
          kind: "trigger",
          title: "Reply in thread is pressed",
          detail: "Or T with the message cursor on it.",
        },
        {
          kind: "event",
          title: "onReplyInThread() fires",
          code: "onReplyInThread?.()",
        },
        {
          kind: "state",
          title: "The store opens the thread panel",
          detail: "The right-hand panel becomes this message's thread with an empty reply box, and any open reaction picker closes.",
          code: "set({ threadFor: messageId, panel: 'thread', threadInput: '', threadLoading: true, reactFor: null })",
        },
        {
          kind: "effect",
          title: "The replies are read",
          detail: "A new thread has none. If the read fails, the panel is empty and a toast says \"That thread could not be read.\"",
          code: "backend.channels.replies(messageId).then((rows) => set({ threadReplies: rows.map(toChannelMessage), threadLoading: false }))",
        },
        {
          kind: "motion",
          title: "The panel slides in from the right",
          detail: "The channel narrows beside it instead of being covered.",
          enter: "slide-left",
        },
        {
          kind: "result",
          title: "The reply box is waiting",
          detail: "Reply…, with Also send to #platform-eng. The first reply turns the message's line into \"1 reply\" for everyone, through the socket.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "stretch",
              width: 780,
              minHeight: 300,
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
                      hovered: true,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 1,
          press: "Reply in thread",
          hold: 900,
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "stretch",
              width: 780,
              minHeight: 300,
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
                      hovered: true,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1900,
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "stretch",
              width: 780,
              minHeight: 300,
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
                    },
                  },
                ],
              },
              {
                el: "view",
                enter: "slide-left",
                style: {
                  width: 340,
                  justify: "space-between",
                  borderLeft: "1px solid $border.subtle",
                  bg: "$surface.card",
                },
                children: [
                  {
                    el: "view",
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
                    el: "component",
                    use: "composer",
                    props: {
                      mode: "thread",
                      placeholder: "Reply…",
                      formatting: false,
                      alsoSendTo: "#platform-eng",
                      focused: true,
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
