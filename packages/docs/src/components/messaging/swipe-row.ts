import type { ComponentDocs } from "../../types";
import { swipeRowActions, swipeRowHistory } from "../../samples/messaging";

const docs: ComponentDocs = {
  id: "swipe-row",
  name: "Swipe row",
  category: "messaging",
  level: "molecule",
  status: "beta",
  description: "A phone list row that swipes left to reveal its actions: Mark read and Clear on a notification, Rename and Delete in chat history. The buttons slide in attached to the row's edge, and a closed row ignores rightward drags so the screen's swipe-back keeps working.",
  props: {
    open: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Draws the row swiped open, resting at the buttons' width. A row with no actions to show never opens.",
    },
    unread: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The row is tinted (unless `dense`), and the actions marked `unreadOnly` are shown. A read row offers one button fewer, so its tray is 96 narrower.",
    },
    dense: {
      type: "boolean",
      default: false,
      description: "One 44pt line, the title only, never tinted: a list of conversations rather than of notifications.",
    },
    title: {
      type: "string",
      sample: "Marcus Chen mentioned you in #release-train",
      required: true,
    },
    body: {
      type: "string",
      default: "",
      sample: "@Aisha can you sanity-check the Android build before Priya cuts the branch?",
      description: "Notification preview, two lines.",
    },
    time: {
      type: "string",
      default: "",
      sample: "12m",
    },
    icon: {
      type: "icon",
      sample: "at-sign",
      description: "The glyph on the row's tile (mention, reply, DM, reaction…). Left out, there is no tile.",
    },
    actions: {
      type: "array",
      default: [],
      sample: swipeRowActions,
      description: "The buttons, in order: SwipeRowAction { key, label, text?, tone?, unreadOnly? }. `label` is each button's accessible name and may hold `{title}`, filled with the row's title; `text` is what it draws. `tone: \"danger\"` is the destructive fill, and a press on it leaves the row open behind the product's confirm. `unreadOnly` shows it only while the row is unread. The tray is 96 wide per button shown and 12 more (108 for one, 204 for two); with none, the row does not swipe.",
    },
    onOpenChange: {
      type: "event",
      args: "open: boolean",
      changes: "open",
      description: "A swipe or a tap opened or closed the row. The list closes whichever row was open before (one open at a time).",
    },
    onPress: {
      type: "event",
      description: "The row itself was tapped, or activated by a screen reader: open the notification. Given it, a tap on a row with its tray open closes the tray; without it a tap toggles the tray.",
    },
    onAction: {
      type: "event",
      args: "action: SwipeRowAction",
      description: "A button was pressed. The row closes first, unless the action's tone is danger. Called with the whole item, so the product switches on `action.key`: Mark read sets `unread` false, Clear deletes the notification on the server (no confirm: the source message is untouched), Delete asks to confirm first.",
    },
  },
  platforms: {
    web: {
      status: "not-applicable",
      alternative: "Hover actions on the row, as the desktop notification rail does: hovering (or focusing) a notification reveals Mark as read and Clear as small buttons at its trailing edge, with Mark all as read and Clear all in the panel header; a chat-history row reveals a ⋯ with Rename and Delete. Touch-screen browsers get the same buttons always visible, since a horizontal swipe in a browser is the back gesture.",
    },
    desktop: {
      status: "not-applicable",
      alternative: "Hover actions, as today's notification rail: Mark as read and Clear appear on hover or keyboard focus at the row's trailing edge (Clear deletes on the server), with Mark all as read and Clear all in the header; chat history uses a ⋯ menu with Rename and Delete. Trackpad two-finger swipes are left to the OS and the app's history navigation.",
    },
    mobile: {
      status: "ready",
      base: "PanResponder + Animated translateX over a Pressable row, StyleSheet over useTheme(); the buttons ride the row's trailing edge, `open` through useControllable, every action also an accessibility action",
      import: "import { SwipeRow } from \"@antfabric-ui/react-native\"",
      notes: [
        "Opens past 40pt at half drag speed (friction 2, a flick adding 0.05 s of its velocity, as gesture-handler's Swipeable does) and stops exactly at the buttons' width: 8 after the row, 88 per button, 8 between, 12 to the edge — 204 for two, 108 for one.",
        "The buttons ride the row's trailing edge (translateX = width + translation), so they slide in with it instead of fading in behind it, as iOS Mail's do.",
        "A tap on the row toggles `open` too (and closes an open row, as iOS Mail does), so the catalogue's previews stay pressable. Every action closes the row, except one with tone danger (Clear, Delete), which leaves it open behind the app's confirm. Mark read is the app's to apply: it sets `unread` false.",
        "A closed row never takes a rightward drag, so a back swipe that starts on a row still goes back (ADR-9414); once open, 10pt to the right drags it shut. On Android a drag that starts in the 24dp system-gesture strip at the right edge is left to the OS.",
        "One row open at a time: onOpenChange(true) is where the list closes the previous one. Give the row a solid background — the unread tint is see-through and is laid on top of the solid fill.",
      ],
      gestures: [
        {
          gesture: "Swipe left past 40pt",
          action: "Opens and rests at the actions' width",
        },
        {
          gesture: "Swipe right on a closed row",
          action: "Ignored by the row — the screen's swipe-back takes it",
        },
        {
          gesture: "Swipe right on an open row",
          action: "Closes it",
        },
        {
          gesture: "Tap an action",
          action: "Runs it and closes the row (Delete in history asks to confirm first)",
        },
        {
          gesture: "Tap the row",
          action: "Opens the notification or conversation as usual",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "The row is named by its whole line, \"<title>, <preview>, <time>\"; a double tap runs `onPress` (open the notification), or toggles the tray when there is none.",
      "A swipe is invisible to VoiceOver and TalkBack, so every action is also an accessibility action on the row (the Actions rotor, TalkBack's actions menu), and so is the tray itself (\"Show actions\" / \"Hide actions\") when the row has an `onPress`.",
      "Each button names its row, not just the verb: \"Clear Marcus Chen mentioned you in #release-train\".",
      "Destructive buttons are crimson with a white label and are never the only cue: the word says what happens.",
      "In a right-to-left layout the row swipes toward the right and the tray sits on the left.",
    ],
  },
  examples: [
    {
      name: "Unread notification, open",
      props: {},
      width: 375,
    },
    {
      name: "Read notification, open",
      props: {
        unread: false,
        title: "Sofia Herrera replied in a thread",
        body: "Release freeze is 12 November, 18:00 IST — added it to the pinned checklist.",
        time: "1h",
        icon: "message-square-reply",
      },
      width: 375,
    },
    {
      name: "Closed",
      props: {
        open: false,
      },
      width: 375,
    },
    {
      name: "Chat history, open",
      props: {
        dense: true,
        actions: swipeRowHistory,
        title: "Summarise #release-train since Monday",
      },
      width: 375,
    },
  ],
  matrix: [
    {
      prop: "context",
      cases: [
        { name: "notification", props: {} },
        { name: "history", props: { dense: true, actions: swipeRowHistory } },
      ],
    },
    {
      prop: "open",
    },
  ],
  states: ["pressed", "focus"],
  edgeCases: [
    {
      title: "Android's edge back gesture",
      platforms: ["mobile"],
      handling: "With gesture navigation, a swipe that starts at the right screen edge is the system back. Drags starting inside the system gesture inset (about 24dp) are left to the OS; start the swipe on the row's body to reveal actions.",
    },
    {
      title: "Screen reader",
      platforms: ["mobile"],
      handling: "The row never needs a swipe: the actions are on the rotor / actions menu, and choosing one runs it directly without opening the row.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Button labels stay one line up to the 1.3× cap (\"Mark read\" fits 88pt at 20.8pt); past that they shrink to fit rather than wrap. The notification row grows taller; the 44pt buttons stay centred in it.",
      example: {
        name: "Long title",
        props: {
          title: "Venkataraghavan Subramaniam-Iyer reacted 🎉 to your message in #platform-eng",
          time: "2d",
        },
        width: 375,
      },
    },
    {
      title: "Offline",
      platforms: ["mobile"],
      handling: "Clear and Delete need the server, so offline they are refused with \"You're offline. Try again when you're back.\" and the row closes unchanged. Mark read is queued locally and synced on reconnect, so the badge clears at once.",
    },
    {
      title: "Changed on another device",
      platforms: ["mobile"],
      handling: "A notification read or cleared on the desktop updates this list live: an open row closes and drops its Mark read (sliding to 108), or leaves the list if it was cleared.",
    },
    {
      title: "Scrolling while a row is open",
      platforms: ["mobile"],
      handling: "A vertical scroll that starts on a row scrolls the list, never half-opens the row (the pan activates on horizontal movement only); the open row stays open until another opens or it is tapped closed.",
    },
    {
      title: "Reduced motion",
      platforms: ["mobile"],
      handling: "The row still follows the finger — direct manipulation is not decorative motion — but snapping open or shut after release is instant.",
    },
    {
      title: "Right-to-left",
      platforms: ["mobile"],
      handling: "Mirrored: swipe right to reveal actions on the left, and the back gesture comes from the right edge, so the closed-row rule applies to leftward drags instead.",
    },
  ],
  related: ["notification-row", "context-menu", "list-item"],
  flows: [
    {
      id: "swipe-to-mark-read",
      title: "Swipe a notification to mark it read",
      description: "Swiping left reveals the row's actions riding on its edge. Mark read saves the read and closes the row; the tint goes when the inbox re-reads.",
      platforms: ["mobile"],
      width: 375,
      steps: [
        {
          kind: "data",
          title: "The inbox is one notifications query",
          detail: "A row is unread until the server says it was read. An unread row offers Mark read and Clear; a read one offers Clear alone.",
          code: "const query = useNotificationsQuery({ page: 1, pageSize: 50 })  ·  ...(unread ? [{ label: 'Mark read', … }] : [])",
        },
        {
          kind: "trigger",
          title: "The row is swiped left past 40pt",
          detail: "It moves at half the finger's speed and stops at the buttons' width. A closed row ignores rightward drags, so a back swipe that starts on it still goes back. In the catalogue a tap stands in for the swipe.",
          code: "rightThreshold={40} friction={2} overshootRight={false} dragOffsetFromLeftEdge={open ? OPEN_RIGHT_DRAG : CLOSED_RIGHT_DRAG}",
        },
        {
          kind: "state",
          title: "One row open at a time",
          detail: "As it starts to open, the screen closes whichever row was open before, as iOS Mail does.",
          code: "onSwipeOpen={(row) => { if (openRow.current && openRow.current !== row) openRow.current.close(); openRow.current = row; }}",
        },
        {
          kind: "motion",
          title: "The buttons ride in on the row's edge",
          detail: "They are pushed right by their own width plus the drag, so they slide in attached to the row instead of showing from behind it. Two buttons stop at 204, one at 108.",
          code: "transform: [{ translateX: Math.max(0, width + translation.value) }]",
          enter: "slide-left",
        },
        {
          kind: "trigger",
          title: "Mark read is tapped",
        },
        {
          kind: "event",
          title: "onAction({ key: 'read' }) fires, and the row closes",
          code: "onPress: () => { swipeRef.current?.close(); onMarkRead(); }",
        },
        {
          kind: "effect",
          title: "The read is saved, then the inbox re-reads",
          detail: "Not optimistic today: the tint goes when the re-read lands. If the request fails, a toast says \"Could not mark that notification read. Try again.\"",
          code: "markRead.mutate(n.id, { onError: () => toast('Could not mark that notification read. Try again.', 'error') })  // onSuccess: invalidateQueries(notificationKeys.all)",
        },
        {
          kind: "result",
          title: "Read: no tint, and Clear alone next time",
          detail: "The title drops to medium weight, and the next swipe offers only Clear, sliding 108.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            open: false,
          },
        },
        {
          step: 1,
          press: 0,
          hold: 900,
          props: {
            open: false,
          },
        },
        {
          step: 3,
          hold: 1500,
          props: {
            open: true,
          },
        },
        {
          step: 4,
          press: "Mark read",
          hold: 900,
          props: {
            open: true,
          },
        },
        {
          step: 7,
          hold: 1800,
          props: {
            open: false,
            unread: false,
          },
        },
      ],
    },
    {
      id: "swipe-to-clear",
      title: "Clear a notification",
      description: "Clear deletes the notification on the server, with no confirm: the message it points to is untouched. The row leaves at once and comes back in place if the server refuses.",
      platforms: ["mobile"],
      steps: [
        {
          kind: "trigger",
          title: "A read notification is swiped left",
          detail: "A read row has only Clear.",
        },
        {
          kind: "motion",
          title: "Clear rides in, 108 wide",
          enter: "slide-left",
        },
        {
          kind: "trigger",
          title: "Clear is tapped",
          detail: "Crimson with a white label; the word says what happens.",
        },
        {
          kind: "event",
          title: "onAction({ key: 'clear' }) fires",
          code: "onPress: () => { swipeRef.current?.close(); onClear(); }",
        },
        {
          kind: "state",
          title: "Every cached page drops the row at once",
          detail: "The mutation stops reads in flight, keeps a copy of every page, and removes the row from each filter of the inbox before the request. The rows below close the gap.",
          code: "client.setQueriesData({ queryKey: notificationKeys.all }, (page) => ({ ...page, items: page.items.filter((n) => n.id !== id), total: Math.max(0, page.total - 1) }))",
        },
        {
          kind: "effect",
          title: "The server deletes it",
          detail: "If it refuses, every page goes back as it was, so the row returns in its place rather than at the top, and a toast says \"Could not clear that notification. Try again.\"",
          code: "onError: (_error, _id, context) => { for (const [key, data] of context?.before ?? []) client.setQueryData(key, data) }",
        },
        {
          kind: "result",
          title: "Gone from the inbox",
          detail: "The inbox re-reads once the request settles, either way, so the list ends on the server's answer.",
          code: "onSettled: () => void client.invalidateQueries({ queryKey: notificationKeys.all })",
        },
      ],
      replay: [
        {
          step: 0,
          press: "swipe-row",
          hold: 1100,
          scene: {
            el: "view",
            style: {
              width: 375,
            },
            children: [
              {
                el: "component",
                use: "swipe-row",
                props: {
                  open: false,
                  unread: false,
                  title: "Sofia Herrera replied in a thread",
                  body: "Release freeze is 12 November, 18:00 IST — added it to the pinned checklist.",
                  time: "1h",
                  icon: "message-square-reply",
                },
              },
              {
                el: "component",
                use: "swipe-row",
                props: {
                  open: false,
                  unread: false,
                  title: "Daniel Okafor reacted 🎉 in #design-crit",
                  body: "Onboarding v4 is ready for crit — Figma link in the thread.",
                  time: "3h",
                  icon: "smile-plus",
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1400,
          scene: {
            el: "view",
            style: {
              width: 375,
            },
            children: [
              {
                el: "component",
                use: "swipe-row",
                props: {
                  open: true,
                  unread: false,
                  title: "Sofia Herrera replied in a thread",
                  body: "Release freeze is 12 November, 18:00 IST — added it to the pinned checklist.",
                  time: "1h",
                  icon: "message-square-reply",
                },
              },
              {
                el: "component",
                use: "swipe-row",
                props: {
                  open: false,
                  unread: false,
                  title: "Daniel Okafor reacted 🎉 in #design-crit",
                  body: "Onboarding v4 is ready for crit — Figma link in the thread.",
                  time: "3h",
                  icon: "smile-plus",
                },
              },
            ],
          },
        },
        {
          step: 2,
          press: "Clear",
          hold: 900,
          scene: {
            el: "view",
            style: {
              width: 375,
            },
            children: [
              {
                el: "component",
                use: "swipe-row",
                props: {
                  open: true,
                  unread: false,
                  title: "Sofia Herrera replied in a thread",
                  body: "Release freeze is 12 November, 18:00 IST — added it to the pinned checklist.",
                  time: "1h",
                  icon: "message-square-reply",
                },
              },
              {
                el: "component",
                use: "swipe-row",
                props: {
                  open: false,
                  unread: false,
                  title: "Daniel Okafor reacted 🎉 in #design-crit",
                  body: "Onboarding v4 is ready for crit — Figma link in the thread.",
                  time: "3h",
                  icon: "smile-plus",
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
              width: 375,
            },
            children: [
              {
                el: "component",
                use: "swipe-row",
                props: {
                  open: false,
                  unread: false,
                  title: "Daniel Okafor reacted 🎉 in #design-crit",
                  body: "Onboarding v4 is ready for crit — Figma link in the thread.",
                  time: "3h",
                  icon: "smile-plus",
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
