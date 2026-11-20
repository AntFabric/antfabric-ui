import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "context-menu",
  name: "Context menu",
  category: "overlays",
  level: "molecule",
  status: "beta",
  description: "What you can do to the thing under the pointer or finger. A right-click on web and desktop opens our own menu at the pointer; a long-press on a phone opens the message actions sheet. Same quick reactions and the same rows on all three, in the same order.",
  props: {
    quickReactions: {
      type: "array",
      description: "The quick set, as emoji, in order. Empty draws no reaction row and no +. AntFabric's set is six — the same list doubles as \"frequently used\" at the top of the full emoji panel.",
      default: [],
      sample: ["👍", "❤️", "😂", "🎉", "👀", "✅"],
    },
    picked: {
      type: "array",
      description: "Which of quickReactions are the person's own, as emoji: pressing one takes its emoji out, pressing another puts it in (and both call onReact). In the kits pressing a reaction calls onReact and the menu closes.",
      default: [],
      sample: ["👍"],
    },
    items: {
      type: "array",
      description: "Menu rows, in Menu's item shape. Every row is gated by what the server allows (abilitiesFor); a delete you cannot do is a disabled row that says why.",
      default: [],
      sample: [
        {
          label: "Reply in thread",
          icon: "message-square-reply",
        },
        {
          label: "Copy text",
          icon: "copy",
        },
        {
          label: "Forward",
          icon: "arrow-up-right",
        },
        {
          label: "Edit message",
          icon: "pencil",
        },
        {
          label: "Pin to channel",
          icon: "pin",
        },
        {
          type: "separator",
        },
        {
          label: "Delete message",
          icon: "trash-2",
          tone: "danger",
        },
      ],
    },
    label: {
      type: "string",
      sample: "Message actions",
      description: "The rows' accessible name. Default: the `actions` string (\"Actions\").",
    },
    title: {
      type: "string",
      default: "",
      sample: "Message",
      platforms: ["mobile"],
      description: "The sheet's title on the phone, and its accessible name. Empty draws none and the sheet is named by label.",
    },
    picking: {
      type: "boolean",
      default: false,
      platforms: ["mobile"],
      description: "The full emoji panel is open under the quick set (the + was pressed).",
    },
    showTarget: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "Draws the message that was right-clicked, highlighted, with the menu at the pointer.",
    },
    author: {
      type: "string",
      default: "",
      sample: "Kenji Watanabe",
    },
    identity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red", "agent"],
      default: "indigo",
      description: "The author's fallback avatar colour.",
    },
    time: {
      type: "string",
      default: "",
      sample: "2:14 PM",
    },
    body: {
      type: "string",
      default: "",
      sample: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
      description: "The message text.",
    },
    onReact: {
      type: "event",
      args: "emoji: string",
    },
    onSelect: {
      type: "event",
      args: "item: ContextMenuItem",
    },
    onClose: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A card that pops in with enter(\"pop\"): a role=\"group\" of reaction <button>s (aria-pressed) above Menu (bare) for the rows; inline styles over `t`, hover, press and focus from useInteraction; `picked` through useControllable; Esc calls onClose. Avatar for the highlighted target",
      import: "import { ContextMenu } from \"@antfabric/ui-react\"",
      notes: [
        "Only targets that have actions get our menu: a message, a sidebar row, a file, a person. Everywhere else, and always inside a text field, the browser's own menu opens.",
        "With text selected inside the message, the browser's menu wins, so Copy works on the selection and Look Up / Translate keep working.",
        "Shift+right-click always gives the browser's menu — the escape hatch for Inspect, Save image, Open link in new tab.",
        "Opens at the pointer and flips or shifts on both axes to stay 8px inside the viewport.",
      ],
      keyboard: [
        {
          keys: "Shift+F10 / ContextMenu key",
          action: "Opens at the focused message's top-left corner",
        },
        {
          keys: "↑ / ↓",
          action: "Moves between rows; ← / → move across the quick reactions",
        },
        {
          keys: "Esc",
          action: "Closes and returns focus to the message",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same card as web at desktop density, with Menu (bare) for the rows",
      import: "import { ContextMenu } from \"@antfabric/ui-react\"",
      notes: [
        "Today a right-click outside a text field does nothing: useSuppressContextMenu (no-context-menu.ts) cancels the WKWebView menu — Reload, Back, Inspect Element — in the capture phase, because every item on it is a no-op or a way to break the app. This spec puts our own menu where there are actions and keeps the suppression everywhere else.",
        "Text entry keeps the system text menu, decided by walking up from the target (input, textarea, contenteditable) — Cut, Copy, Paste, spelling and writing tools are the OS's, and nothing here reimplements them.",
        "The menu's rows are the same as the message row's ⋮ menu, so a keyboard or touch-laptop user who cannot hover the toolbar has the full set.",
        "In the catalogue the panel pops in at the pointer, and pressing a quick reaction marks it yours (pressing yours takes it away) through `picked`; the app also closes the menu.",
      ],
      keyboard: [
        {
          keys: "Shift+F10 / Menu key",
          action: "Opens on the message cursor (Windows, Linux)",
        },
        {
          keys: "Ctrl+click",
          action: "Same as right-click on macOS",
        },
        {
          keys: "Esc",
          action: "Closes this menu only and leaves the message cursor where it was",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "<Enter motion=\"slide-up\"> (role dialog, accessibilityViewIsModal) over GlassSurface (Liquid Glass on iOS 26+): Pressable reactions, the emoji panel, and Menu (bare) bled to the gutter; `picked` and `picking` through useControllable",
      import: "import { ContextMenu } from \"@antfabric/ui-react-native\"",
      notes: [
        "A sheet titled \"Message\": the quick reactions first (the commonest act), then Copy text, Reply in thread, Forward, Edit message, Pin to channel, and Delete message last in red.",
        "Copy text is first among the rows because it is the one row that cannot fail for a reason the message decides; it is dropped for a message with no text.",
        "The + opens the full emoji panel (260pt) under the quick set; the quick set doubles as its \"Frequently used\".",
        "Forward is never gated on ability: the only permissions are \"can I read this\" (seeing it answers that) and \"can I post there\", which the picker and the server decide.",
        "iOS 26+: Liquid Glass — the surface is drawn through expo-glass-effect's GlassView (gated on its availability check; the material itself follows the device's Clear / Tinted, Reduce Transparency and Increase Contrast settings). iOS 18 and earlier keep today's blur/opaque look. The actions sheet floats inset with fully rounded corners. The desktop right-click menu is our own surface and does not change on macOS 26.",
        "In the catalogue the sheet slides up; a quick reaction marks itself yours (or takes yours away) through `picked`, and + toggles `picking`, fading the emoji panel in where the rows were.",
      ],
      gestures: [
        {
          gesture: "Long-press a message (400 ms)",
          action: "Opens the sheet with a medium haptic; the message stays highlighted under the scrim",
        },
        {
          gesture: "Tap a quick reaction",
          action: "Adds it, or removes yours if it is already yours, and closes",
        },
        {
          gesture: "Tap +",
          action: "Opens the full emoji panel in the sheet; tap again to close it",
        },
        {
          gesture: "Tap a row",
          action: "Runs it and closes",
        },
        {
          gesture: "Drag down, tap the backdrop, Android back",
          action: "Closes without doing anything",
        },
      ],
    },
  },
  a11y: {
    role: "menu",
    label: "Message actions",
    notes: [
      "Quick reactions are toggle buttons with aria-pressed, named \"React with 👍\" / \"Remove your 👍\".",
      "Long-press is not discoverable with VoiceOver or TalkBack, so the message row exposes the same actions as accessibility actions (rotor / actions menu); \"Message actions\" opens this sheet.",
      "Phone: the sheet is a modal view; Android's back button closes it, screen-reader focus starts at the title (else the handle), the handle's touch area is the 44pt target, the emoji panel's search field is lifted above the keyboard on iOS, and each emoji in the panel is a pressable button that reacts. The panel's emoji lists are the kit's own fixed sets and the search field filters nothing yet.",
      "On web and desktop the menu rows are a Menu: focus moves to the first enabled row when the menu mounts, ↑ ↓ Home End and type-ahead move between rows, Esc closes, and focus returns to what had it (the message it was opened on) when the menu unmounts.",
    ],
  },
  examples: [
    {
      name: "On your own message",
    },
    {
      name: "At the pointer",
      props: {
        showTarget: true,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Someone else's message",
      description: "No Edit, no Delete; Forward and Pin stay.",
      props: {
        author: "Amara Okafor",
        identity: "green",
        body: "Can someone from #design-crit look at the onboarding copy before Friday?",
        showTarget: true,
        quickReactions: ["👍", "❤️", "😂", "🎉", "👀", "✅"],
        picked: ["👀"],
        items: [
          {
            label: "Reply in thread",
            icon: "message-square-reply",
          },
          {
            label: "Copy text",
            icon: "copy",
          },
          {
            label: "Forward",
            icon: "arrow-up-right",
          },
          {
            label: "Pin to channel",
            icon: "pin",
          },
          {
            label: "Mark as unread",
            icon: "mail-check",
          },
        ],
      },
    },
    {
      name: "Pinned message",
      props: {
        items: [
          {
            label: "Reply in thread",
            icon: "message-square-reply",
          },
          {
            label: "Copy text",
            icon: "copy",
          },
          {
            label: "Forward",
            icon: "arrow-up-right",
          },
          {
            label: "Edit message",
            icon: "pencil",
          },
          {
            label: "Unpin from channel",
            icon: "pin-off",
          },
          {
            type: "separator",
          },
          {
            label: "Delete message",
            icon: "trash-2",
            tone: "danger",
          },
        ],
      },
    },
    {
      name: "Full emoji panel",
      props: {
        picking: true,
      },
      platforms: ["mobile"],
    },
  ],
  states: ["hover", "focus"],
  edgeCases: [
    {
      title: "Right-click in a text field or on selected text",
      platforms: ["web", "desktop"],
      handling: "The system's text menu opens, never ours: Cut, Copy, Paste, spelling suggestions and writing tools belong to the OS. The test walks up from the target, so a mention chip or bold run inside the composer counts as text. A disabled or read-only field is not text entry and gets nothing.",
    },
    {
      title: "Right-click where there are no actions",
      platforms: ["desktop"],
      handling: "Nothing opens. The WKWebView's own menu (Reload, Back, Inspect Element, Open Link in New Window) is suppressed in the capture phase everywhere outside text entry — Reload would throw away the workspace's whole in-memory state, and the menu tells people they are looking at a web page.",
    },
    {
      title: "Past the 12-hour delete window",
      platforms: ["web", "desktop", "mobile"],
      handling: "Delete stays, disabled, with the reason as its second line. The phone used to draw a faint note in its place; one rule everywhere is simpler: an option that vanishes teaches nothing.",
      example: {
        name: "Delete blocked",
        props: {
          items: [
            {
              label: "Reply in thread",
              icon: "message-square-reply",
            },
            {
              label: "Copy text",
              icon: "copy",
            },
            {
              label: "Forward",
              icon: "arrow-up-right",
            },
            {
              label: "Edit message",
              icon: "pencil",
            },
            {
              type: "separator",
            },
            {
              label: "Delete message",
              icon: "trash-2",
              tone: "danger",
              disabled: true,
              sublabel: "Messages can only be deleted within 12 hours of sending.",
            },
          ],
        },
      },
    },
    {
      title: "A reply inside a thread",
      platforms: ["web", "desktop", "mobile"],
      handling: "No \"Reply in thread\": a thread is one level deep and the server answers 400 thread_depth to a reply's reply. Two tests decide it — the surface passes no reply handler, and the message's own ability says it cannot carry a thread — so the row cannot leak onto a reply drawn somewhere else.",
      example: {
        name: "In a thread",
        props: {
          items: [
            {
              label: "Copy text",
              icon: "copy",
            },
            {
              label: "Forward",
              icon: "arrow-up-right",
            },
            {
              label: "Edit message",
              icon: "pencil",
            },
            {
              type: "separator",
            },
            {
              label: "Delete message",
              icon: "trash-2",
              tone: "danger",
            },
          ],
        },
      },
    },
    {
      title: "A message with no text",
      platforms: ["web", "desktop", "mobile"],
      handling: "A message that is only an attachment or a meeting card has no Copy text row; the attachment's own menu offers Download and Copy link instead.",
    },
    {
      title: "The message changes on another device while the menu is open",
      platforms: ["web", "desktop", "mobile"],
      handling: "Deleted elsewhere: the menu closes and the row shows \"This message was deleted.\" Edited elsewhere: the menu stays, and Edit opens the latest text, never the version under the pointer when it opened.",
    },
    {
      title: "Offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "Copy text and Forward (which only opens the picker) stay. Reactions, Edit, Pin and Delete are disabled with \"You're offline\" as the sublabel; the phone refuses writes while offline and the desktop does not queue destructive ones.",
    },
    {
      title: "Opened near the window edge",
      platforms: ["web", "desktop"],
      handling: "Anchored at the pointer, then flipped on whichever axis would overflow (left of the pointer at the right edge, above it at the bottom) and shifted to stay 8px inside the window.",
    },
    {
      title: "Long-press while scrolling, or on a link",
      platforms: ["mobile"],
      handling: "The press only counts if the finger stays within 10pt for 400 ms, so a scroll never opens the sheet. A long-press on a link inside a message opens this sheet with Copy link and Open link added at the top, not the OS link preview.",
    },
    {
      title: "Touch screen on a laptop",
      platforms: ["web", "desktop"],
      handling: "A 500 ms touch-and-hold opens the same menu at the finger, rows at 40px; the reaction strip never relies on hover to show itself.",
    },
    {
      title: "Liquid Glass and earlier iOS",
      platforms: ["mobile"],
      handling: "The glass follows the iPhone's own settings with no work from us, because the kit draws it with the system material (GlassView): Clear or Tinted (Settings → Display & Brightness → Liquid Glass) changes how much shows through, Reduce Transparency makes it frosted and nearly opaque while keeping its shape, and Increase Contrast adds a contrasting edge. The app subscribes to AccessibilityInfo 'reduceTransparencyChanged' only to adjust what it draws around the glass. iOS before 26 keeps the blur look. This happens live in the app as the person changes the setting.",
    },
  ],
  related: ["menu", "bottom-sheet", "reaction-pill"],
  flows: [
    {
      id: "react-from-the-menu",
      title: "Right-click or long-press a message, then react",
      description: "The quick reactions are the commonest thing done to a message, so they lead the menu. Pressing one adds it before the server answers and closes the menu.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "What the menu offers comes from what the server allows",
          detail: "abilitiesFor works out edit, pin and delete from authorship, the 12-hour window and the channel role. A message with nothing to offer opens no menu at all, rather than an empty one.",
          code: "if (!hasMenuActions(abilitiesFor({ createdAt, isMine, hasText, isReply, isModerator, now: Date.now() }))) return",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The sheet reads the message that was pressed",
          detail: "Which quick reactions are already yours comes from the message's own reactions; the rows are gated by the same abilitiesFor as the desktop.",
          code: "const mine = new Set((message?.reactions ?? []).filter((r) => r.reacted).map((r) => r.emoji))",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The message comes from the channel's query",
          detail: "The row already holds the message from the channel's infinite query, so the menu needs no request; the same abilitiesFor gates its rows.",
          code: "const ability = abilitiesFor({ createdAt: m.createdAt, isMine: m.authorId === me.id, isModerator, hasText, now: Date.now() })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "A right-click on the message",
          detail: "Anywhere on the row except inside a text field, where the system's own Cut, Copy and Paste menu stands. It also puts the message cursor on that row.",
          code: "onContextMenu={(e) => { if (isTextEntry(e.target)) return; e.preventDefault(); a.setMsgCursor(m.id); a.openMsgMenu(m.id) }}",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "A long-press on the message",
          detail: "300 ms in today's row. The keyboard goes down first, because on Android a Modal and the keyboard fight over the bottom edge.",
          code: "onLongPress={(m) => { Keyboard.dismiss(); composerRef.current?.blur(); setActing(m) }}",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The menu pops in at the pointer",
          detail: "Reactions on top, rows under them. Today the desktop opens the row's ⋮ menu instead, hung from the ⋮ through MenuSurface with a short rise and focus on the first row; this spec opens at the pointer.",
          enter: "pop",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The sheet slides up",
          detail: "Titled Message, the six quick reactions first, then the rows. The channel stays where it was under the backdrop.",
          enter: "slide-up",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "🎉 is pressed",
          detail: "A reaction that is already yours is drawn filled; pressing it takes yours away instead.",
        },
        {
          kind: "event",
          title: "onReact fires with the emoji",
          detail: "The menu closes in the same press; the reaction is the caller's to apply.",
          code: "onReact?.('🎉')",
        },
        {
          kind: "effect",
          title: "The chip appears before the server answers",
          detail: "Optimistic: applyReaction adds 🎉 in place, so nothing on the row reorders, and a refusal rolls it back. Today the desktop reaches this from the row's Add a reaction picker; the menu's strip calls the same action. On the web it is the same, as a mutation's onMutate.",
          code: "a.toggleReaction(message.id, emoji)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "effect",
          title: "The mutation patches the cached pages first",
          detail: "onMutate flips your reaction on the cached message and on the device cache; an error re-reads the channel.",
          code: "reactTo.mutate(reactionIntent(acting, emoji), { onError: surface })",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The menu is gone and 🎉 is on the message",
          detail: "Escape, a click outside, a drag down or Android back close it without reacting. On the desktop Escape also puts focus back on the message's ⋮.",
        },
      ],
      replay: [
        {
          step: 3,
          hold: 1300,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1600,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                  highlighted: true,
                },
              },
              {
                el: "component",
                use: "context-menu",
                style: {
                  position: "absolute",
                  top: 44,
                  left: 220,
                },
                props: {
                  reactions: [
                    {
                      emoji: "👍",
                      mine: true,
                    },
                    {
                      emoji: "❤️",
                    },
                    {
                      emoji: "😂",
                    },
                    {
                      emoji: "🎉",
                    },
                    {
                      emoji: "👀",
                    },
                    {
                      emoji: "✅",
                    },
                  ],
                  items: [
                    {
                      label: "Reply in thread",
                      icon: "message-square-reply",
                    },
                    {
                      label: "Copy text",
                      icon: "copy",
                    },
                    {
                      label: "Forward",
                      icon: "arrow-up-right",
                    },
                    {
                      label: "Pin to channel",
                      icon: "pin",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "React with 🎉",
          hold: 1000,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                  highlighted: true,
                },
              },
              {
                el: "component",
                use: "context-menu",
                style: {
                  position: "absolute",
                  top: 44,
                  left: 220,
                },
                props: {
                  reactions: [
                    {
                      emoji: "👍",
                      mine: true,
                    },
                    {
                      emoji: "❤️",
                    },
                    {
                      emoji: "😂",
                    },
                    {
                      emoji: "🎉",
                    },
                    {
                      emoji: "👀",
                    },
                    {
                      emoji: "✅",
                    },
                  ],
                  items: [
                    {
                      label: "Reply in thread",
                      icon: "message-square-reply",
                    },
                    {
                      label: "Copy text",
                      icon: "copy",
                    },
                    {
                      label: "Forward",
                      icon: "arrow-up-right",
                    },
                    {
                      label: "Pin to channel",
                      icon: "pin",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1700,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [
                    {
                      emoji: "🎉",
                      count: 1,
                      mine: true,
                      reactors: "You reacted",
                    },
                  ],
                  highlighted: true,
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 660,
              paddingTop: "$space.xl",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1600,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 660,
              paddingTop: "$space.xl",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "context-menu",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  reactions: [
                    {
                      emoji: "👍",
                      mine: true,
                    },
                    {
                      emoji: "❤️",
                    },
                    {
                      emoji: "😂",
                    },
                    {
                      emoji: "🎉",
                    },
                    {
                      emoji: "👀",
                    },
                    {
                      emoji: "✅",
                    },
                  ],
                  items: [
                    {
                      label: "Reply in thread",
                      icon: "message-square-reply",
                    },
                    {
                      label: "Copy text",
                      icon: "copy",
                    },
                    {
                      label: "Forward",
                      icon: "arrow-up-right",
                    },
                    {
                      label: "Pin to channel",
                      icon: "pin",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "React with 🎉",
          hold: 1000,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 660,
              paddingTop: "$space.xl",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "context-menu",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  reactions: [
                    {
                      emoji: "👍",
                      mine: true,
                    },
                    {
                      emoji: "❤️",
                    },
                    {
                      emoji: "😂",
                    },
                    {
                      emoji: "🎉",
                    },
                    {
                      emoji: "👀",
                    },
                    {
                      emoji: "✅",
                    },
                  ],
                  items: [
                    {
                      label: "Reply in thread",
                      icon: "message-square-reply",
                    },
                    {
                      label: "Copy text",
                      icon: "copy",
                    },
                    {
                      label: "Forward",
                      icon: "arrow-up-right",
                    },
                    {
                      label: "Pin to channel",
                      icon: "pin",
                    },
                  ],
                },
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
              minHeight: 660,
              paddingTop: "$space.xl",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [
                    {
                      emoji: "🎉",
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
      id: "delete-hands-off",
      title: "Delete from the menu hands off to a confirm",
      description: "A destructive row never acts on its own. Choosing it closes the menu and opens the confirm in its place, so only one overlay is ever up.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "Delete is offered only when the server would allow it",
          detail: "Your own message inside the 12-hour window, or any message for a channel moderator. Past the window, your message keeps Delete disabled with the reason as its second line.",
          code: "{ability.canDelete && item('Delete', () => a.askDeleteMessage(message.id), <Icon name=\"close\" />, { danger: true })}",
          platforms: ["web", "desktop"],
        },
        {
          kind: "data",
          title: "The sheet's last row is Delete message",
          detail: "Red, and last. Past the window today's phone draws the reason as a faint note where the row was; this spec draws the disabled row everywhere.",
          code: "ability.canDelete ? row('delete', 'trash-outline', 'Delete message', onDelete, 'danger') : ability.deleteBlockedReason",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "Delete message is pressed",
          detail: "Opened from a right-click or a long-press on your own message.",
        },
        {
          kind: "event",
          title: "onSelect fires with the row",
          detail: "The whole row comes back, so the caller can switch on it rather than on its label.",
          code: "onSelect?.(item)  // { label: \"Delete message\", icon: \"trash-2\", tone: \"danger\" }",
        },
        {
          kind: "state",
          title: "The store swaps the menu for the confirm",
          detail: "One update clears msgMenuFor and sets deletingMsg, so the menu leaves in the same frame the confirm arrives.",
          code: "askDeleteMessage: (messageId) => set(() => ({ deletingMsg: messageId, msgMenuFor: null }))",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The row runs its action, then closes the sheet",
          detail: "Delete's action raises the confirm sheet on the channel screen. This spec presents it from the actions sheet's onDismiss, because iOS drops a modal presented while another is still leaving; today both changes land in the same press.",
          code: "onPress={() => { act(); onClose() }}  ·  onDelete={() => setConfirmDelete(acting)}",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The menu goes and the confirm pops",
          detail: "Over a fading scrim, centred, with focus inside it.",
          enter: "pop",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "One sheet goes down, the confirm comes up",
          detail: "Both are bottom sheets, so the hand-off reads as one surface being replaced.",
          enter: "slide-up",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The confirm owns the rest",
          detail: "Cancel leaves the message as it was; Delete removes it for everyone. Dialog's flows follow it from here.",
        },
      ],
      replay: [
        {
          step: 2,
          press: "Delete message",
          hold: 1300,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: true,
                },
              },
              {
                el: "component",
                use: "context-menu",
                style: {
                  position: "absolute",
                  top: 44,
                  left: 220,
                },
                props: {
                  reactions: [
                    {
                      emoji: "👍",
                      mine: true,
                    },
                    {
                      emoji: "❤️",
                    },
                    {
                      emoji: "😂",
                    },
                    {
                      emoji: "🎉",
                    },
                    {
                      emoji: "👀",
                    },
                    {
                      emoji: "✅",
                    },
                  ],
                  items: [
                    {
                      label: "Reply in thread",
                      icon: "message-square-reply",
                    },
                    {
                      label: "Copy text",
                      icon: "copy",
                    },
                    {
                      label: "Forward",
                      icon: "arrow-up-right",
                    },
                    {
                      label: "Edit message",
                      icon: "pencil",
                    },
                    {
                      label: "Pin to channel",
                      icon: "pin",
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Delete message",
                      icon: "trash-2",
                      tone: "danger",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1700,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: true,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Delete this message?",
                  body: "This cannot be undone.",
                  confirmLabel: "Delete",
                },
              },
            ],
          },
        },
        {
          step: 2,
          press: "Delete message",
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 660,
              paddingTop: "$space.xl",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "context-menu",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  reactions: [
                    {
                      emoji: "👍",
                      mine: true,
                    },
                    {
                      emoji: "❤️",
                    },
                    {
                      emoji: "😂",
                    },
                    {
                      emoji: "🎉",
                    },
                    {
                      emoji: "👀",
                    },
                    {
                      emoji: "✅",
                    },
                  ],
                  items: [
                    {
                      label: "Reply in thread",
                      icon: "message-square-reply",
                    },
                    {
                      label: "Copy text",
                      icon: "copy",
                    },
                    {
                      label: "Forward",
                      icon: "arrow-up-right",
                    },
                    {
                      label: "Edit message",
                      icon: "pencil",
                    },
                    {
                      label: "Pin to channel",
                      icon: "pin",
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Delete message",
                      icon: "trash-2",
                      tone: "danger",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 660,
              paddingTop: "$space.xl",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Delete this message?",
                  body: "It will be removed for everyone in the channel. This cannot be undone.",
                  confirmLabel: "Delete",
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
