import { IN_APP_BANNER_ACTIONS, IN_APP_BANNER_CASES, IN_APP_BANNER_JOIN, IN_APP_BANNER_REVIEW } from "../../samples/notifications";
import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "in-app-banner",
  name: "In-app banner",
  category: "notifications",
  level: "molecule",
  status: "beta",
  description: "The foreground notification: AntFabric is open and in front, but you are somewhere else in it. A card that drops in below the status bar on a phone and sits top-right on web and desktop — never for the conversation already on screen.",
  props: {
    title: {
      type: "string",
      required: true,
      sample: "Priya Raman",
      description: "The sender for chat; the event for a meeting or an agent.",
    },
    context: {
      type: "string",
      default: "",
      sample: "#platform-eng",
      description: "Drawn after the title: the channel, the room. Empty for a direct message.",
    },
    body: {
      type: "string",
      default: "",
      sample: "Can someone sanity-check the rollout plan before the 3pm train?",
      description: "Two lines at most; the server's bounded preview.",
    },
    sender: {
      type: "string",
      default: "",
      sample: "Priya Raman",
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
      sample: "green",
      description: "The colour of the sender's initials when there is no `avatarSrc`. An agent is always drawn as one.",
    },
    leading: {
      type: "enum",
      options: ["avatar", "tile"],
      default: "avatar",
      description: "avatar is the sender's face. tile is a glyph on a tile, for an event that has no sender (a meeting).",
    },
    icon: {
      type: "icon",
      default: "",
      description: "The tile's glyph.",
    },
    agent: {
      type: "boolean",
      default: false,
      description: "The sender is an agent: its face, and no name colour.",
    },
    lead: {
      type: "string",
      default: "",
      sample: "Mentioned you",
      description: "Words before the body: \"Mentioned you\", \"Replied in a thread\".",
    },
    time: {
      type: "string",
      default: "",
      sample: "now",
    },
    queued: {
      type: "number",
      default: 0,
      description: "How many more are waiting behind this one. They show one at a time; this says so.",
    },
    replyable: {
      type: "boolean",
      default: false,
      sample: true,
      platforms: ["web", "desktop"],
      description: "A Reply button comes first, and opens the inline reply. Web and desktop only — on a phone a tap opens the conversation with the composer focused.",
    },
    actions: {
      type: "array",
      default: [],
      sample: IN_APP_BANNER_ACTIONS,
      platforms: ["web", "desktop"],
      description: "The buttons under the text, after Reply: `{ key, label, icon?, variant?: \"ghost\" | \"soft\", dismiss? }`. A `dismiss` one puts the banner away when it is pressed (`onDismiss(\"action\")`); each press reaches `onAction`.",
    },
    replying: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "The inline reply is open. Web and desktop only — on a phone a tap opens the conversation with the composer focused. A new notification (another title, context, body or time) starts again from `replying` and `replyText`, as it does from `dismissed`.",
    },
    replyText: {
      type: "string",
      default: "",
      platforms: ["web", "desktop"],
    },
    error: {
      type: "string",
      default: "",
      platforms: ["web", "desktop"],
      description: "Why the inline reply did not send. The draft stays in the box.",
    },
    dismissed: {
      type: "boolean",
      default: false,
      description: "Dismissed: × or Mark as read on web and desktop, a swipe up on the phone (the catalogue uses the grabber). The banner leaves and nothing is drawn, until the next notification: a new title, context, body or time shows again, back at this prop.",
    },
    onOpen: {
      type: "event",
    },
    onDismiss: {
      type: "event",
      args: "reason: 'close' | 'action' | 'swipe'",
    },
    onReply: {
      type: "event",
      args: "text: string",
      platforms: ["web", "desktop"],
    },
    onAction: {
      type: "event",
      args: "action: InAppBannerAction",
      platforms: ["web", "desktop"],
      description: "An action under the text was pressed: the item itself, so a product switches on `action.key`.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<div role=\"group\"> named \"New notification\" holding a card that slides in from the right with enter(): one <button> that opens it, an IconButton ×, Button actions and an inline reply <input> with Send; Escape dismisses, Enter sends. Inline styles over `t`; `dismissed`, `replying` and `replyText` kept in local state that follows the props. The app hosts it in its own top-right viewport, apart from the action toasts",
      import: "import { InAppBanner } from \"@antfabric/ui-react\"",
      notes: [
        "Shown only while this tab is visible AND focused (document.visibilityState === 'visible' && document.hasFocus()). A background tab raises the browser notification instead, and the tab title count changes either way.",
        "With several AntFabric tabs open, only the most recently focused tab shows it — tabs agree through a BroadcastChannel so nobody gets the same banner three times.",
        "Inline reply posts with a client_message_id, so a double Enter sends once.",
        "In the catalogue, × and Mark as read set `dismissed` (the banner leaves), Reply toggles `replying` and the reply row fades in, and Send closes it again. The banner slides in from the right.",
      ],
      keyboard: [
        {
          keys: "F6",
          action: "Moves focus into the banner region and back out",
        },
        {
          keys: "Escape",
          action: "Dismisses the focused banner",
        },
        {
          keys: "Enter",
          action: "In the reply box: sends. On the banner: opens the conversation",
        },
      ],
    },
    desktop: {
      status: "planned",
      base: "The same card as web at desktop density; the app places it top-right under the title bar, above the content and never over the composer. Mod+Enter sends too (any Enter does)",
      import: "import { InAppBanner } from \"@antfabric/ui-react\"",
      notes: [
        "New on desktop: today a focused window gets the rail entry and the sound, and no banner at all. The banner uses the same isOnScreen() test the sound and the OS banner already use: window focused, channel pane drawn, and the same channel — or, for a thread reply, the same thread panel open.",
        "When the window is not focused the OS notification is raised instead (shouldToast), never both.",
        "The sound still plays on every message, including the channel on screen — the owner's rule of 2026-09-03 (ADR-0574).",
        "Slides in from the right edge of the window; × and Mark as read set `dismissed`, Reply toggles `replying`.",
      ],
      keyboard: [
        {
          keys: "F6",
          action: "Moves focus into the banner region and back out",
        },
        {
          keys: "Escape",
          action: "Dismisses the focused banner",
        },
        {
          keys: "Mod+Enter",
          action: "In the reply box: sends",
        },
      ],
    },
    mobile: {
      status: "planned",
      base: "A labelled View with a card that drops in with <Enter motion=\"drop\">, drawn on GlassSurface (Liquid Glass on iOS 26+); a PanResponder swipe up follows the finger and dismisses, the grabber stands in for it, and a Dismiss accessibilityAction and the iOS escape gesture do the same; StyleSheet over useTheme(). The app hosts it over the root stack, with expo-notifications' handleNotification returning shouldShowBanner: false while the app is in front",
      import: "import { InAppBanner } from \"@antfabric/ui-react-native\"",
      notes: [
        "Fixes a gap: today every foreground notification raises the OS banner (shouldShowBanner: true), including one for the channel you are reading. The handler now asks the router for the open channel / thread and stays silent for it; everything else draws this banner instead of the OS one.",
        "Sits below the status bar (safe-area top inset + 8pt), above the tab bar and the keyboard, and never moves the composer.",
        "No inline reply on the phone: a tap opens the conversation with the composer focused, which is the reply.",
        "Light haptic (selection) when it lands; no sound if the ringer switch is off.",
        "iOS 26+: Liquid Glass — the surface is drawn through expo-glass-effect's GlassView (gated on its availability check; the material itself follows the device's Clear / Tinted, Reduce Transparency and Increase Contrast settings). iOS 18 and earlier keep today's blur/opaque look.",
        "Drops in from under the status bar. In the catalogue the grabber stands in for the swipe up and sets `dismissed`.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens the conversation, thread, meeting or approval",
        },
        {
          gesture: "Swipe up",
          action: "Dismisses it; the inbox row stays unread",
        },
        {
          gesture: "Pull down",
          action: "Holds it on screen (the auto-dismiss timer pauses)",
        },
      ],
    },
  },
  a11y: {
    role: "status",
    notes: [
      "A banner that arrives is announced politely as \"Priya Raman. #platform-eng. …\" (through the page's announcer on the web, the screen reader's announcement call on the phone) — never assertive, and it never takes focus. A failed inline reply is announced at once.",
      "The open button's name says everything the card shows: 'Priya Raman in #platform-eng, 2m: Mentioned you · can you look at the deck?, +2 more waiting. Open'. With no body it is the title, the time and 'Open', never an empty ': .'.",
      "The kit has no auto-dismiss timer: the app owns it and must stop it while the banner has focus or the pointer is on it, and give a screen-reader user longer (WCAG 2.2.1).",
      "Reply moves focus into the field, and Escape in the field closes the reply and keeps the draft without dismissing the banner (Escape elsewhere on the card dismisses it); focus goes back to Reply when the reply closes. These are the web's: the phone has no reply field.",
    ],
  },
  examples: [
    {
      name: "Mention",
    },
    {
      name: "Direct message",
      props: {
        lead: "",
        title: "Marcus Chen",
        sender: "Marcus Chen",
        context: "",
        body: "Are we still pairing on the cache bug at 2?",
      },
    },
    {
      name: "Replying inline",
      platforms: ["web", "desktop"],
      props: {
        lead: "",
        title: "Marcus Chen",
        sender: "Marcus Chen",
        context: "",
        body: "Are we still pairing on the cache bug at 2?",
        replying: true,
        replyText: "Yes — 2pm, I'll grab a room",
      },
    },
    {
      name: "Thread reply",
      props: {
        lead: "Replied in a thread",
        title: "Aisha Bello",
        sender: "Aisha Bello",
        context: "#design-crit",
        body: "Agree on the spacing — I pushed a new frame.",
      },
    },
    {
      name: "Meeting starting",
      props: {
        leading: "tile",
        icon: "video",
        lead: "",
        replyable: false,
        actions: [IN_APP_BANNER_JOIN],
        title: "Design crit starts in 5 min",
        sender: "",
        context: "#design-crit",
        body: "Huddle room 2 · 6 going",
      },
    },
    {
      name: "Agent needs approval",
      props: {
        agent: true,
        lead: "",
        replyable: false,
        actions: [IN_APP_BANNER_REVIEW],
        title: "Fabric needs your approval",
        sender: "Fabric",
        context: "#release-train",
        body: "Post the v0.42 release notes to #release-train?",
      },
    },
    {
      name: "More waiting",
      props: {
        queued: 2,
      },
    },
  ],
  matrix: [
    {
      prop: "kind",
      cases: IN_APP_BANNER_CASES,
    },
  ],
  edgeCases: [
    {
      title: "The conversation is already on screen",
      platforms: ["web", "desktop", "mobile"],
      handling: "No banner. \"On screen\" is all three of: the window or tab is focused, the channel pane is actually drawn (not just the last-opened channel), and it is the same channel — or, for a thread reply, that thread's panel is open. Sitting in #platform-eng while a reply lands in a thread you have closed DOES get a banner. The inbox row is still written and the badge still counts.",
    },
    {
      title: "Several arrive at once",
      platforms: ["web", "desktop", "mobile"],
      handling: "One banner at a time, each on screen at least 1.5 s before the next replaces it, with \"+2 more waiting\" so nothing is silently skipped. Three or more from one conversation inside 10 s collapse into one: \"3 new messages\" in #platform-eng. A reconnect backlog never replays as banners — it goes to the rail.",
      example: {
        name: "Queued",
        props: {
          queued: 4,
        },
      },
    },
    {
      title: "No preview text",
      platforms: ["web", "desktop", "mobile"],
      handling: "An event with nothing to preview (a call, a file with no caption) draws its title and time only, and its open button is named 'Design crit starts in 5 min, now. Open' rather than with an empty body.",
      example: {
        name: "Title only",
        props: {
          title: "Design crit starts in 5 min",
          body: "",
          lead: "",
          leading: "tile",
          icon: "video",
          sender: "",
          context: "",
          replyable: false,
          time: "now",
        },
      },
    },
    {
      title: "The next one arrives while you reply",
      platforms: ["web", "desktop"],
      handling: "The reply and its draft belong to the notification they answer. When the banner moves on to another (a new title, context, body or time), it starts from `replying` and `replyText` again, so a half-typed reply to Marcus never ends up in the box under Aisha's message. The app keeps the draft if it wants to offer it back.",
    },
    {
      title: "You are typing",
      platforms: ["web", "desktop", "mobile"],
      handling: "The banner never takes focus and never moves the composer or the keyboard. On a phone it sits under the status bar; on desktop and web it is top-right, away from the composer.",
    },
    {
      title: "How long it stays",
      platforms: ["web", "desktop", "mobile"],
      handling: "6 s, then it slides away. The timer pauses while the pointer is on it, while it has focus, while a reply is being typed, and while a finger holds it — a banner with a draft in it never disappears.",
    },
    {
      title: "Inline reply fails, or you are offline",
      platforms: ["web", "desktop"],
      handling: "The draft stays in the box and the banner stays up with the reason. Offline, the reply is refused before it is tried, with the composer's own sentence.",
      example: {
        name: "Offline reply",
        platforms: ["web", "desktop"],
        props: {
          lead: "",
          title: "Marcus Chen",
          sender: "Marcus Chen",
          context: "",
          body: "Are we still pairing on the cache bug at 2?",
          replying: true,
          replyText: "Yes — 2pm",
          error: "You're offline. Your message wasn't sent. It's still here for when you're back.",
        },
      },
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop", "mobile"],
      handling: "It fades in place (120 ms) instead of sliding; the swipe-to-dismiss still works and simply follows the finger.",
    },
    {
      title: "Read somewhere else, or notifications paused",
      platforms: ["web", "desktop", "mobile"],
      handling: "Reading the conversation on another device removes the banner here at once. While notifications are paused, or \"Show Notifications\" is off, no banner is drawn; with the master switch off the rail entry is skipped too (applyNotification's existing rule).",
    },
    {
      title: "Long names and 130% text",
      platforms: ["web", "desktop", "mobile"],
      handling: "The title truncates to one line with the channel truncating first; the body clamps at two lines. At 130% on a phone the card grows taller, never wider, and the time stays on the first line.",
      example: {
        name: "Long",
        props: {
          title: "Oluwaseun Adebayo-Johnson",
          sender: "Oluwaseun Adebayo-Johnson",
          context: "#platform-eng-incident-2026-10-29",
          body: "The canary in eu-west-2 is throwing 502s on the session relay since 14:02 — rolling back unless someone objects in the next five minutes.",
        },
      },
    },
    {
      title: "Liquid Glass and earlier iOS",
      platforms: ["mobile"],
      handling: "On iOS 26+ the banner sliding in under the status bar is glass, like the system's own. The desktop in-app card is ours and stays opaque on macOS 26. The glass follows the iPhone's own settings with no work from us, because the kit draws it with the system material (GlassView): Clear or Tinted (Settings → Display & Brightness → Liquid Glass) changes how much shows through, Reduce Transparency makes it frosted and nearly opaque while keeping its shape, and Increase Contrast adds a contrasting edge. The app subscribes to AccessibilityInfo 'reduceTransparencyChanged' only to adjust what it draws around the glass. iOS before 26 keeps the blur look. This happens live in the app as the person changes the setting.",
    },
  ],
  related: ["os-notification", "notification-item", "toast"],
  flows: [
    {
      id: "elsewhere-in-the-app",
      title: "A mention while you're elsewhere in the app drops in, and opens the conversation",
      description: "AntFabric is in front but you're reading something else. The banner says who wants you and where, without taking you there until you ask.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The same feed that writes the rail",
          detail: "The server's notification, or the live chat event just before it, reaches applyNotification while the window is focused. Today that gets the rail entry and the sound and no banner, because the OS banner is only for an unfocused window. This component is the planned in-window banner.",
          code: "if (shouldToast(entry, ctx)) notifier.toast(…); else if (shouldPlaySound(entry, ctx)) notifier.playSound()",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The socket raises a banner for everything",
          detail: "Today, while the app is open, routeNotification presents an OS banner for every notification, the conversation on screen included. This spec replaces it with the in-app banner and drops it for the conversation you're reading.",
          code: "banner: (signal, text) => void presentSignal(signal, text)  // handler: shouldShowBanner: true",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The tab is in front, on another conversation",
          detail: "A visible, focused tab shows the in-app banner; a background tab leaves it to the browser notification.",
          code: "if (document.visibilityState === 'visible' && document.hasFocus()) showBanner(entry)",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "Never for the conversation on screen",
          detail: "The place is the thread for a reply and the channel for a top-level message, and it counts as on screen only when the window is focused and the channel pane is drawn. Anywhere else the banner shows; on screen, the message just arrives.",
          code: "if (isOnScreen(entry, ctx)) return  // focused && pane drawn && same channel, or the open thread",
        },
        {
          kind: "motion",
          title: "It slides in at the top right",
          detail: "Over the content, under the title bar. More that arrive while it's up are counted as +2 more waiting instead of stacking.",
          enter: "slide-left",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "It drops in below the status bar",
          detail: "A swipe up puts it away.",
          enter: "drop",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "The banner is clicked",
          detail: "Anywhere on its body. On the phone, a tap.",
        },
        {
          kind: "event",
          title: "onOpen() fires",
          code: "onOpen?.()",
        },
        {
          kind: "effect",
          title: "The same route the rail row and the OS banner take",
          detail: "Marked read, the rail closed, the screen switched to the channel, the message set to flash.",
          code: "openNotification(id)  // markRead(id); openChat(entry)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "effect",
          title: "The router opens the conversation",
          code: "void open({ ...n, unread: true })  // useOpenNotification → router.navigate(href)",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The banner leaves, and the message is in front of you",
          detail: "The conversation opens at the mention, which flashes; the rail and the badge are both one lower.",
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
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1700,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 12,
                  right: 12,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 6,
          press: "in-app-banner",
          hold: 900,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 12,
                  right: 12,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1700,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "2:16 PM",
                  body: "@Arjun can someone sanity-check the rollout plan before the 3pm train?",
                  mentionsYou: true,
                  highlighted: true,
                  reactions: [],
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
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1700,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 12,
                  right: 12,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 6,
          press: "in-app-banner",
          hold: 900,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 12,
                  right: 12,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1700,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "2:16 PM",
                  body: "@Arjun can someone sanity-check the rollout plan before the 3pm train?",
                  mentionsYou: true,
                  highlighted: true,
                  reactions: [],
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
              position: "relative",
              width: 375,
              height: 400,
              paddingTop: 72,
              bg: "$color.background.card",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
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
              position: "relative",
              width: 375,
              height: 400,
              paddingTop: 72,
              bg: "$color.background.card",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 10,
                  left: 7,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 6,
          press: "in-app-banner",
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 400,
              paddingTop: 72,
              bg: "$color.background.card",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 10,
                  left: 7,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              height: 400,
              paddingTop: 72,
              bg: "$color.background.card",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "2:16 PM",
                  body: "@Arjun can someone sanity-check the rollout plan before the 3pm train?",
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
      id: "reply-inline",
      title: "Reply from the banner without leaving what you're doing",
      description: "A DM or a mention can be answered right in the banner. The reply goes to the conversation it came from, and the screen stays where it was.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "trigger",
          title: "Reply is pressed",
          detail: "Only a DM, a mention or a thread reply offers it. On the phone a tap opens the conversation with the composer focused instead.",
        },
        {
          kind: "motion",
          title: "The reply field fades in, focused",
          detail: "It takes the place of the actions. Escape puts them back.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "A reply is typed and sent",
          detail: "Enter, or Send, which is disabled until there's text.",
        },
        {
          kind: "event",
          title: "onReply(text) fires",
          code: "onReply?.('Looks good, ship it after the 3pm train.')",
        },
        {
          kind: "effect",
          title: "The message is posted to the conversation",
          detail: "With a fresh client message id, so a retry after a dropped connection can't post twice, and into the thread when the mention was in one. The phone's notification Reply already works this way.",
          code: "await postMessage(channelId, text, { clientMessageId: crypto.randomUUID() })",
        },
        {
          kind: "state",
          title: "The banner closes, or keeps the draft",
          detail: "Sent, the banner leaves and the mention is marked read. If the post fails, the banner stays with the draft still in the field and says why.",
        },
        {
          kind: "result",
          title: "Answered, without leaving #design-crit",
          detail: "The reply is in #platform-eng for everyone, and the screen never moved.",
        },
      ],
      replay: [
        {
          step: 0,
          press: "Reply",
          hold: 1300,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 12,
                  right: 12,
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1500,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 12,
                  right: 12,
                },
                props: {
                  replying: true,
                },
              },
            ],
          },
        },
        {
          step: 2,
          press: "Send",
          hold: 1100,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "in-app-banner",
                style: {
                  position: "absolute",
                  top: 12,
                  right: 12,
                },
                props: {
                  replying: true,
                  replyText: "Looks good, ship it after the 3pm train.",
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 580,
              height: 320,
              paddingTop: 168,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Can we look at them in crit at 3?",
                  reactions: [],
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
