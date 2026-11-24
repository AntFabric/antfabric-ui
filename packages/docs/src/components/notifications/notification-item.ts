import { NOTIFICATION_ITEM_CASES } from "../../samples/notifications";
import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "notification-item",
  name: "Notification item",
  category: "notifications",
  level: "molecule",
  status: "beta",
  description: "One row of the notification feed — the desktop NotificationRail and the phone's Notifications screen. Who, what, where and when on two lines; unread rows wear the warm tint, a coral tile and a dot; an agent asking for approval can be answered right in the row.",
  props: {
    title: {
      type: "string",
      required: true,
      sample: "Priya Raman · #platform-eng",
      description: "\"Who · #channel\", or just \"Who\" for a DM, rendered from ids so it reads right before the channel list has loaded.",
    },
    sender: {
      type: "string",
      default: "",
      sample: "Priya Raman",
      description: "Who did it — the face on the row.",
    },
    avatarSrc: {
      type: "string",
      default: "",
      description: "The sender's photo.",
    },
    identity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red"],
      default: "indigo",
      description: "The colour of the sender's initials when there is no `avatarSrc`. An agent is always drawn as one.",
    },
    body: {
      type: "string",
      default: "",
      sample: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
      description: "The server's bounded snippet. Two lines at most.",
    },
    time: {
      type: "string",
      default: "",
      sample: "4m ago",
      description: "\"just now\", \"4m ago\", \"3h ago\", \"2d ago\" — the apps' agoLabel.",
    },
    read: {
      type: "boolean",
      default: false,
    },
    leading: {
      type: "enum",
      options: ["avatar", "tile"],
      default: "avatar",
      description: "avatar: the sender's face with a small badge. tile: a 32px glyph squircle, for an event that has no one to show (a meeting, a recording).",
    },
    icon: {
      type: "icon",
      default: "",
      sample: "at-sign",
      description: "The badge on the face, or the tile's glyph. Left out, the face has no badge. The icon only: behaviour reads the server's `data.kind`, never the category.",
    },
    agent: {
      type: "boolean",
      default: false,
      description: "The sender is an agent: its face, and no badge.",
    },
    lead: {
      type: "string",
      default: "",
      description: "Words before the body: \"Replied in a thread\".",
    },
    revealed: {
      type: "boolean",
      default: false,
      description: "The row's own actions are showing: on hover or keyboard focus (web, desktop), or swiped left (mobile).",
    },
    approval: {
      type: "enum",
      options: ["", "pending", "approving", "approved", "declined", "expired"],
      default: "",
      description: "\"\" is not a request. pending shows Approve / Decline in the row; the rest are its outcomes, and only the app sets them: a press spins until it does.",
    },
    decidedOn: {
      type: "string",
      default: "",
      description: "Set when the approval was answered on another device, e.g. \"your phone\".",
    },
    onOpen: {
      type: "event",
    },
    onMarkRead: {
      type: "event",
    },
    onClear: {
      type: "event",
    },
    onApprove: {
      type: "event",
      description: "Reports the request; Approve spins and Decline locks until the app answers with `approval` (approving, approved, declined, expired) or the promise the handler returns settles. A failure that leaves `approval` at pending brings both buttons back.",
    },
    onDecline: {
      type: "event",
      description: "Reports the request; Decline spins and Approve locks until the app answers with `approval`, or the promise the handler returns settles.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<div role=\"listitem\"> holding one full-width <button> that opens it (one accessible name for the row), Avatar with a kind badge or the glyph tile, and Mark as read / Clear buttons positioned over the row's end that fade in while `revealed`, hovered or focused within; Approve / Decline are Button. Inline styles over `t`, states from useInteraction; `read` and `revealed` kept in local state that follows the props; `approval` is the app's, and Approve / Decline spin (usePending) until it answers",
      import: "import { NotificationItem } from \"@antfabric/ui-react\"",
      notes: [
        "The row's actions mount on :hover AND :focus-within — mounting on hover alone puts nothing in the tab order for a keyboard user, and leaving them always mounted puts two buttons per row in it.",
        "Opening a row marks it read on the server and navigates with the router (a real <a href> for ⌘-click into a new tab).",
      ],
      keyboard: [
        {
          keys: "Up / Down",
          action: "Moves between rows (roving focus)",
        },
        {
          keys: "Enter",
          action: "Opens the conversation, thread, meeting or approval",
        },
        {
          keys: "Tab",
          action: "From a focused row, reaches Mark as read, then Clear",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same row as web at desktop density; the hover actions mount while the pointer is on the row or focus is inside it (React state, not CSS :hover), absolutely positioned so they never reflow the text",
      import: "import { NotificationItem } from \"@antfabric/ui-react\"",
      notes: [
        "Rows today lead with a 32px glyph tile (leading=\"tile\"). The avatar lead is new; the owner should pick one for both apps.",
        "Hover actions are mounted only while the pointer is on the row (React state, not CSS :hover), absolutely positioned so appearing never reflows the text. This spec adds focus-within as a second trigger.",
        "A thread reply leads its preview with \"Replied in a thread\" — read from the same parentMessageId the click uses, so what the row says and where it goes cannot disagree.",
        "Approve / Decline in the row is new: agent approvals have no rail affordance today.",
        "In the catalogue, pressing a row sets `read` (the tint and dot fade) and toggles `revealed`, so the hover actions fade in; Mark as read sets `read`, and Approve / Decline spin until the app answers (the flows pass `approval`, which swaps the buttons for the outcome line).",
      ],
      keyboard: [
        {
          keys: "Up / Down",
          action: "Moves between rows",
        },
        {
          keys: "Enter",
          action: "Opens it",
        },
        {
          keys: "Tab",
          action: "Reaches Mark as read and Clear",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "View (role listitem) with a Pressable row on an Animated.View: a PanResponder swipe left slides it open (Animated.timing on translateX, native driver; a full swipe clears) and Mark read / Clear slide in behind it with <Enter motion=\"slide-left\">; both are also accessibilityActions. Avatar or the glyph tile, Button for Approve / Decline, StyleSheet over useTheme()",
      import: "import { NotificationItem } from \"@antfabric/ui-react-native\"",
      notes: [
        "No hover on a phone: the same two actions are a left swipe (Mark read, Clear — Clear is destructive and calls DELETE, not dismiss) and the accessibility actions menu.",
        "Opening one swipe closes any other row that is open.",
        "The unread tint runs edge to edge and fills the strip behind the swipe actions too, so the band stays one colour while the row is open.",
        "A critical notification (priority=critical) swaps the coral tile and dot for the danger colour — today's behaviour, kept.",
        "Approval rows have no phone screen yet; until they do the Approve / Decline buttons in the row are the only way to answer one on the phone.",
        "In the catalogue a tap sets `read`; Mark read in the swipe strip (slides in from the right when `revealed`) sets it too and closes the strip.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens it",
        },
        {
          gesture: "Swipe left",
          action: "Reveals Mark read and Clear",
        },
        {
          gesture: "Full swipe left",
          action: "Clears it",
        },
      ],
    },
  },
  a11y: {
    role: "listitem",
    notes: [
      "The row is a role=listitem and needs a role=list around it (a `<ul>` or `<div role=\"list\">` holding the rows): the kit draws one row, and a lone row has no list. A product that draws one row on its own wraps it.",
      "When an approval is answered, Approve and Decline go: the outcome is spoken (through the page's announcer on the web, the screen reader's announcement call on the phone) and on the web focus moves to the outcome line, so a keyboard user is not dropped on the page.",
      "The row's actions on the web are 11px buttons about 21px high; WCAG 2.2's 24px minimum needs the neutral theme's override, which raises them.",
      "One accessible name per row: \"Unread. Priya Raman · #platform-eng. @Arjun can you…. 4m ago\". The dot and tile colour are never the only sign of unread.",
      "Mobile exposes Mark read and Clear as accessibilityActions, so VoiceOver's rotor and TalkBack's actions menu reach what a sighted person swipes for.",
    ],
  },
  examples: [
    {
      name: "Mention, unread",
      width: 380,
    },
    {
      name: "Direct message, read",
      width: 380,
      props: {
        icon: "message-circle",
        sender: "Marcus Chen",
        title: "Marcus Chen",
        body: "Are we still pairing on the cache bug at 2?",
        time: "1h ago",
        read: true,
      },
    },
    {
      name: "Thread reply",
      width: 380,
      props: {
        icon: "message-square-reply",
        lead: "Replied in a thread",
        sender: "Aisha Bello",
        title: "Aisha Bello · #design-crit",
        body: "Agree on the spacing — I pushed a new frame.",
        time: "12m ago",
      },
    },
    {
      name: "Reaction",
      width: 380,
      props: {
        icon: "smile-plus",
        sender: "Kenji Watanabe",
        title: "Kenji Watanabe reacted 🎉 · #release-train",
        body: "to: v0.42 is on staging, release notes in the doc",
        time: "2h ago",
        read: true,
      },
    },
    {
      name: "Meeting starting",
      width: 380,
      props: {
        leading: "tile",
        icon: "video",
        sender: "",
        title: "Design crit starts in 5 min",
        body: "#design-crit · Huddle room 2 · 6 going",
        time: "just now",
      },
    },
    {
      name: "Recording ready",
      width: 380,
      props: {
        leading: "tile",
        icon: "file-audio",
        sender: "",
        title: "Recording ready: Release train sync",
        body: "Transcript and summary are ready. 32 min.",
        time: "8m ago",
      },
    },
    {
      name: "Agent finished",
      width: 380,
      props: {
        agent: true,
        icon: "sparkles",
        sender: "Fabric",
        title: "Fabric · #release-train",
        body: "Finished: Draft the v0.42 release notes. 12 changes summarised.",
        time: "3m ago",
      },
    },
    {
      name: "Agent needs approval",
      width: 380,
      props: {
        agent: true,
        icon: "shield-question",
        approval: "pending",
        sender: "Fabric",
        title: "Fabric needs your approval",
        body: "Post the v0.42 release notes to #release-train?",
        time: "just now",
      },
    },
    {
      name: "Hovered",
      width: 380,
      platforms: ["web", "desktop"],
      props: {
        revealed: true,
      },
    },
    {
      name: "Swiped",
      width: 380,
      platforms: ["mobile"],
      props: {
        revealed: true,
      },
    },
    {
      name: "Glyph tile (today's rows)",
      width: 380,
      props: {
        leading: "tile",
      },
    },
  ],
  matrix: [
    {
      prop: "kind",
      cases: NOTIFICATION_ITEM_CASES,
    },
    {
      prop: "read",
    },
  ],
  states: ["hover", "pressed", "focus"],
  edgeCases: [
    {
      title: "Long names, long channels, long previews",
      platforms: ["web", "desktop", "mobile"],
      handling: "The title is one line with an ellipsis; the preview clamps at two and breaks anywhere, so a pasted URL cannot push the time off the row. The full text is the accessible name.",
      example: {
        name: "Long",
        width: 380,
        props: {
          sender: "Oluwaseun Adebayo-Johnson",
          title: "Oluwaseun Adebayo-Johnson · #platform-eng-incident-2026-10-29",
          body: "https://grafana.example.com/d/session-relay/overview?orgId=1&from=now-1h — 502s on the relay since 14:02, rolling back unless someone objects",
        },
      },
    },
    {
      title: "The message was deleted, or you left the conversation",
      platforms: ["web", "desktop", "mobile"],
      handling: "A deleted message's row reads \"This message was deleted.\" and still opens the conversation at that spot. A row for a conversation you can no longer see opens nothing and says \"That conversation is not in your list any more.\" — Clear still works.",
      example: {
        name: "Deleted",
        width: 380,
        props: {
          body: "This message was deleted.",
          read: true,
        },
      },
    },
    {
      title: "Approval answered on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "The buttons are replaced live by the outcome and where it happened — \"Approved on your phone · Fabric is posting it now\". A press that loses the race gets the server's answer, not a second approval.",
      example: {
        name: "Decided elsewhere",
        width: 380,
        props: {
          agent: true,
          icon: "shield-question",
          sender: "Fabric",
          title: "Fabric needs your approval",
          body: "Post the v0.42 release notes to #release-train?",
          approval: "approved",
          decidedOn: "your phone",
          read: true,
        },
      },
    },
    {
      title: "Approval expired",
      platforms: ["web", "desktop", "mobile"],
      handling: "Agent requests time out. An expired one says so and that nothing happened; it never shows buttons that can only fail.",
      example: {
        name: "Expired",
        width: 380,
        props: {
          agent: true,
          icon: "shield-question",
          sender: "Fabric",
          title: "Fabric needs your approval",
          body: "Post the v0.42 release notes to #release-train?",
          approval: "expired",
          read: true,
          time: "2d ago",
        },
      },
    },
    {
      title: "Approving is slow, or pressed twice",
      platforms: ["web", "desktop", "mobile"],
      handling: "Approve shows its spinner the moment it is pressed and Decline locks, with an idempotency key on the request. Still spinning after 8 s: the row keeps waiting and the toast says \"Still sending your approval…\". A failure restores both buttons with \"Couldn't send that. Try again.\"",
      example: {
        name: "Approving",
        width: 380,
        props: {
          agent: true,
          icon: "shield-question",
          sender: "Fabric",
          title: "Fabric needs your approval",
          body: "Post the v0.42 release notes to #release-train?",
          approval: "approving",
        },
      },
    },
    {
      title: "Offline",
      platforms: ["desktop", "mobile"],
      handling: "Mark as read and Clear apply at once and are sent when the connection is back; if the server refuses, the row comes back with \"Could not mark that notification read. Try again.\" Approve and Decline are disabled with \"You're offline. Approve when you're back.\" — an agent action is never queued.",
    },
    {
      title: "Read on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "Reading the conversation anywhere clears the tint and the dot here through the same read-state event that clears the Dock badge, the tab title and the phone's icon badge.",
    },
    {
      title: "Keyboard and screen reader",
      platforms: ["web", "desktop", "mobile"],
      handling: "Rows are reachable by Tab and arrow keys; the hover actions also mount on focus-within so a keyboard user gets them. On a phone the swipe actions are accessibility actions, because a screen reader cannot swipe.",
      example: {
        name: "Focused",
        width: 380,
        platforms: ["web", "desktop"],
        state: "focus",
        props: {
          revealed: true,
        },
      },
    },
  ],
  related: ["os-notification", "in-app-banner", "notification-rail", "swipe-row"],
  flows: [
    {
      id: "open-a-row",
      title: "Open a notification from the feed",
      description: "The feed is a list of the server's notification rows. Opening one marks it read and goes to the message it's about, from wherever the person is in the app.",
      platforms: ["web", "desktop", "mobile"],
      width: 380,
      steps: [
        {
          kind: "data",
          title: "The rail reads the server's inbox",
          detail: "The first fifty rows and the unread count; older pages load as the list scrolls. The title is drawn from ids, so it reads right before the channel list has loaded.",
          code: "const rows = page.items.map((wire) => toLiveNotification(wire, context))",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The screen reads the first page",
          detail: "Opening the screen doesn't mark anything read. A row is read when it's opened, marked or cleared.",
          code: "const query = useNotificationsQuery({ page: 1, pageSize: 50 })",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The rail reads the same inbox through TanStack Query",
          code: "useInfiniteQuery({ queryKey: ['notifications'], queryFn: ({ pageParam }) => listNotifications({ page: pageParam, pageSize: 50 }) })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "An unread row is pressed",
          detail: "A click anywhere on the row, or Enter; the hover actions are separate buttons. On the phone, a tap.",
        },
        {
          kind: "event",
          title: "onOpen() fires",
          detail: "The row hands nothing back; the caller already knows which notification it drew.",
          code: "onOpen?.()  // rail: onClick={() => onOpen(n.id)} → a.openNotification(id)",
        },
        {
          kind: "state",
          title: "It's marked read straight away",
          detail: "The tint and the dot go and the count comes down before the server answers. If the server refuses, the row goes back to unread and a toast says Could not mark that as read. Try again.",
          code: "set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })); bumpUnread(-1)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "It's marked read on the server",
          detail: "The mutation invalidates the inbox, so the list redraws from the server's answer.",
          code: "if (id !== null && input.unread !== false) markRead(id)",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "The rail closes and the app switches screen",
          detail: "From Projects, Meetings or Home it switches to the channel itself, not only the selection. The message to flash is set before navigating, so it highlights on the same frame the messages arrive.",
          code: "set({ highlightMessage: target }); set({ railOpen: false }); const channelKey = keyFor(entry, get().channelIds)",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The router opens the destination",
          detail: "Work items, projects and agent runs have no phone screen yet: the row stays and a toast says where to open it.",
          code: "router.navigate(routeFor(destination).href)  // { pathname: '/channel/[id]', params: { id, focusMessageId } }",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "The router opens the conversation at the message",
          code: "navigate({ to: '/c/$channelId', params: { channelId }, search: { focus: messageId } })",
          platforms: ["web"],
        },
        {
          kind: "result",
          title: "The message, highlighted",
          detail: "The conversation opens at the message, which flashes for a couple of seconds. A notification for a channel you've left says You are no longer in that conversation.",
          code: "export const HIGHLIGHT_MS = 2_200",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {
            read: false,
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["mobile"],
          props: {
            read: false,
          },
        },
        {
          step: 2,
          hold: 1300,
          platforms: ["web"],
          props: {
            read: false,
          },
        },
        {
          step: 3,
          press: 0,
          hold: 900,
          props: {
            read: false,
          },
        },
        {
          step: 5,
          hold: 1300,
          platforms: ["web", "desktop"],
          props: {
            read: true,
          },
        },
        {
          step: 6,
          hold: 1300,
          platforms: ["mobile"],
          props: {
            read: true,
          },
        },
        {
          step: 10,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              width: 380,
              paddingY: 12,
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  mentionsYou: true,
                  highlighted: true,
                  reactions: [],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "mark-or-clear",
      title: "Mark a row read, or clear it, without opening it",
      description: "The row's own actions: hover on web and desktop, a swipe left on the phone. Both act on the server's row, so the change shows on every device.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "trigger",
          title: "The pointer rests on the row",
          detail: "The actions are mounted for the hovered row only, so the tab order isn't four buttons for every row.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "The row is swiped left",
          detail: "An unread row offers Mark read and Clear, a read one Clear alone. Opening one row's actions closes any other.",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "Mark as read and Clear fade in at the row's end",
          enter: "fade",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "Mark read and Clear slide in from the right",
          detail: "The unread tint fills the strip behind them, so the band stays one colour edge to edge.",
          enter: "slide-left",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "Mark as read is pressed",
        },
        {
          kind: "event",
          title: "onMarkRead() fires",
          code: "onMarkRead?.()",
        },
        {
          kind: "state",
          title: "Read, and the count comes down",
          detail: "Straight away on the desktop, rolled back if the server refuses. The phone waits for the server and says Could not mark that notification read. Try again if it fails.",
          code: "bumpUnread(-1); void backend.notifications.markRead(id).catch(rollback)",
        },
        {
          kind: "trigger",
          title: "Clear is pressed",
        },
        {
          kind: "event",
          title: "onClear() fires",
          code: "onClear?.()",
        },
        {
          kind: "state",
          title: "The row leaves the list",
          detail: "Removed at once, and the count comes down if it was unread. If the delete fails the row comes back where it was and a toast says Could not clear that notification. Try again.",
          code: "set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })); if (!before.read) bumpUnread(-1)",
        },
        {
          kind: "result",
          title: "Gone here, and everywhere",
          detail: "Clearing deletes the server's row, so the desktop rail and the phone's screen both lose it. The next row moves up.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1200,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: false,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1300,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: false,
                  revealed: true,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 4,
          press: "Mark as read",
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: false,
                  revealed: true,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1300,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: true,
                  revealed: true,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "Clear",
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: true,
                  revealed: true,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1200,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: false,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 3,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: false,
                  revealed: true,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 4,
          press: "Mark read",
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: false,
                  revealed: true,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: true,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "Clear",
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "at-sign",
                  sender: "Priya Raman",
                  title: "Priya Raman · #platform-eng",
                  body: "@Arjun can you sanity-check the rollout plan before the 3pm train?",
                  time: "4m ago",
                  read: true,
                  revealed: true,
                },
              },
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
                },
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              width: 380,
            },
            children: [
              {
                el: "component",
                use: "notification-item",
                props: {
                  icon: "message-circle",
                  sender: "Marcus Chen",
                  title: "Marcus Chen",
                  body: "Are we still pairing on the cache bug at 2?",
                  time: "1h ago",
                  read: true,
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
