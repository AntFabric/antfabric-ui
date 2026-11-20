import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "message",
  name: "Message",
  category: "messaging",
  level: "organism",
  status: "beta",
  description: "One message in a channel, thread or DM: the author's face and name, the time, the words, and whatever it carries — attachments, reactions, a thread. It also says when it is still sending, did not send, is waiting for the network, or was deleted, and it marks an agent's messages as AI.",
  props: {
    author: {
      type: "string",
      sample: "Priya Raman",
      required: true,
      description: "Display name. For an agent, the agent's name.",
    },
    identity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red"],
      default: "indigo",
      description: "The author's fallback avatar colour, chosen from their id.",
    },
    avatarSrc: {
      type: "string",
      default: "",
    },
    time: {
      type: "string",
      default: "",
      sample: "10:42 AM",
      description: "The sent time in the reader's locale and clock (10:42 AM, 10:42).",
    },
    gutterTime: {
      type: "string",
      default: "",
      sample: "10:42",
      platforms: ["web", "desktop"],
      description: "The compact row's hover time, without AM/PM, so it fits the 36px gutter on one line in every locale (desktop gutterTime(), ADR-5041). The full time is the title.",
    },
    body: {
      type: "string",
      default: "",
      sample: "Staging is green again. I'll cut the release branch at 4 and post the checklist in #release-train.",
      description: "The rendered message text (markdown, mentions and channel links are drawn by the kit's RichText; the catalogue shows plain text).",
    },
    edited: {
      type: "boolean",
      default: false,
      description: "Draws \"(edited)\" inline after the words.",
    },
    status: {
      type: "enum",
      options: ["sent", "sending", "failed", "queued", "deleted"],
      default: "sent",
      description: "sending: dimmed with a clock until the server acknowledges. failed: \"Couldn't send · Retry · Delete\". queued: desktop only — held in the offline cache and sent on reconnect. deleted: the tombstone.",
    },
    agent: {
      type: "boolean",
      default: false,
      description: "Sent by an AI agent: agent avatar with the sparkle, the name in brand ink, and an AI tag, so nobody mistakes it for a colleague.",
    },
    compact: {
      type: "boolean",
      default: false,
      description: "A continuation: same author, within 5 minutes, same day, not after a thread summary and not the first unread. No avatar and no name; the time shows in the gutter on hover (web/desktop) and not at all on mobile.",
    },
    unread: {
      type: "boolean",
      default: false,
      description: "Past your read mark and not yet scrolled past: the soft coral unread wash, which fades once half the row has been on screen.",
    },
    mentionsYou: {
      type: "boolean",
      default: false,
      description: "Mentions you directly (or @here / @channel you are in): a soft coral wash with a soft coral edge on the leading side.",
    },
    pinned: {
      type: "boolean",
      default: false,
    },
    highlighted: {
      type: "boolean",
      default: false,
      description: "The keyboard message cursor, or the row a notification or search result just brought you to: coral bar and wash.",
    },
    hovered: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "Draws the hover state: wash, the gutter time on a compact row, and the message actions bar.",
    },
    reactions: {
      type: "array",
      default: [],
      sample: [
        {
          emoji: "🎉",
          count: 3,
          mine: true,
          reactors: "You, Marcus Chen and Aisha Bello reacted",
        },
        {
          emoji: "👀",
          count: 1,
          mine: false,
          reactors: "Kenji Watanabe reacted",
        },
      ],
      description: "Reaction { emoji, count, mine, reactors } in first-reacted order. A reaction at 0 is removed, never drawn.",
    },
    thread: {
      type: "object",
      default: {
        count: 0,
      },
      description: "{ count, lastReply, participants, unread, following } — drawn as a thread summary when count > 0.",
    },
    attachments: {
      type: "array",
      default: [],
      description: "Attachment { key, kind, name, fileType, badge, typeLabel, size, status, progress, src, title, domain, description, url, duration } per item, drawn as an attachment card each.",
    },
    addReaction: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The add pill after the reactions (web and desktop: while the row is hot) and, on web and desktop, the smile-plus on the actions bar.",
    },
    quickReactions: {
      type: "array",
      default: [],
      sample: ["👍", "✅", "👀"],
      platforms: ["web", "desktop"],
      description: "The actions bar's one-press reactions, as emoji. Empty draws none.",
    },
    replyInThread: {
      type: "boolean",
      default: false,
      sample: true,
      platforms: ["web", "desktop"],
      description: "The actions bar's Reply in thread. It calls `onOpenThread`.",
    },
    forward: {
      type: "boolean",
      default: false,
      sample: true,
      platforms: ["web", "desktop"],
      description: "The actions bar's Forward.",
    },
    actions: {
      type: "array",
      default: [],
      platforms: ["web", "desktop"],
      description: "The product's own actions on the bar: IconActionItem { key, label, icon, badge?, disabled? }, icon buttons after Forward. The icon is required: a product's action cannot draw a blank button.",
    },
    more: {
      type: "boolean",
      default: false,
      sample: true,
      platforms: ["web", "desktop"],
      description: "The actions bar's ⋯. A bar with nothing on it is not drawn.",
    },
    menuOpen: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "The ⋯ menu is open: its button on the bar stays pressed.",
    },
    onStatusChange: {
      type: "event",
      args: "status: MessageStatus",
      changes: "status",
      description: "Retry on a failed message: called with `status` as the press leaves it (sending). Given this too, the row is controlled; otherwise it goes back to sending itself.",
    },
    onRetry: {
      type: "event",
      description: "Retry was pressed on a failed message: the app posts it again.",
    },
    onDelete: {
      type: "event",
      description: "Delete on a failed or queued message: removes only the unsent copy.",
    },
    onOpenThread: {
      type: "event",
      description: "The thread summary, or Reply in thread on the actions bar (web and desktop).",
    },
    onReact: {
      type: "event",
      args: "emoji: string",
      description: "A quick reaction on the bar or a reaction pill was pressed: toggle yours with this emoji. The server owns the counts, so this is a request: pass the new `reactions` when the server answers.",
    },
    onAddReaction: {
      type: "event",
      description: "The add pill or the bar's smile-plus was pressed: open the emoji picker.",
    },
    onForward: {
      type: "event",
      platforms: ["web", "desktop"],
    },
    onAction: {
      type: "event",
      platforms: ["web", "desktop"],
      args: "action: IconActionItem",
      description: "A product action on the bar was pressed. Called with the whole item, so the product switches on `action.key`.",
    },
    onAttachmentOpen: {
      type: "event",
      args: "attachment: Attachment",
      description: "An attachment's card was pressed: the app opens its preview (the lightbox or file viewer; on the phone the MediaViewer, or Share / Save to device).",
    },
    onAttachmentDownload: {
      type: "event",
      platforms: ["web", "desktop"],
      args: "attachment: Attachment",
      description: "An attachment's download was pressed.",
    },
    onAttachmentCancel: {
      type: "event",
      args: "attachment: Attachment",
      description: "An attachment's cancel was pressed: an upload in progress, or a link preview the sender removes (web and desktop).",
    },
    onAttachmentRetry: {
      type: "event",
      args: "attachment: Attachment",
      description: "A failed attachment's Retry was pressed: the app starts its upload again. Given this, the card is controlled by the attachment's own `status`.",
    },
    onMenuOpenChange: {
      type: "event",
      platforms: ["web", "desktop"],
      args: "menuOpen: boolean",
      changes: "menuOpen",
      description: "Called with `menuOpen` as the press on the bar's ⋯ leaves it: the caller opens or closes the menu.",
    },
    onLongPress: {
      type: "event",
      platforms: ["mobile"],
      description: "Opens the message actions sheet.",
    },
  },
  platforms: {
    web: {
      status: "partial",
      base: "A <div role=\"article\"> row with inline styles over `t`; the hover wash, gutter time and actions bar follow pointer hover (useInteraction), keyboard focus inside the row, or `hovered`. Children are the kit's Avatar, AttachmentCard, ReactionPill, ThreadSummary and MessageActions. The virtualised timeline is the app's.",
      import: "import { Message } from \"@antfabric-ui/react/chat\"",
      notes: [
        "The hover wash is a CSS :hover on the row — never an inline background, which would beat it — and the unread wash is painted off a data-unread attribute for the same reason.",
        "Every message has a permalink (…/c/platform-eng/p/<id>); Copy link in ⋯ copies it, and opening it scrolls to and highlights the row.",
        "A background tab still receives messages; the tab title count and favicon dot change, the row does not animate in until the tab is visible.",
        "Pressing a reaction toggles yours (each pill keeps its own state), and Retry on a failed message moves it back to sending. The row itself does not toggle `hovered` on a press: in an app that would leave a bar behind on a row the pointer has left, so hover, focus inside the row, or the prop draw it.",
        "Not in the kit yet: Message has no events for the bar's quick reactions, Add a reaction, Forward or ⋯, nor for a reaction pill's toggle (the spec defines none), so those are inert or local inside Message; the body is plain text, not RichText.",
      ],
      keyboard: [
        {
          keys: "↑ / ↓",
          action: "Moves the message cursor (bar + wash)",
        },
        {
          keys: "E / R / T / F",
          action: "Edit / React / Reply in thread / Forward the message you are on",
        },
        {
          keys: "Enter",
          action: "Opens the message's actions menu",
        },
        {
          keys: "Escape",
          action: "Leaves the message",
        },
      ],
    },
    desktop: {
      status: "partial",
      base: "The same file as web (one component, desktop density): Avatar + text in the row, the kit's MessageActions floating at top 2 / right 14 on hover. Reply in thread on the bar calls onOpenThread.",
      import: "import { Message } from \"@antfabric-ui/react/chat\"",
      notes: [
        "Row padding 8 18 2 (1 18 2 when compact), 10 between a 36px face and the text column. The face sits with the name, never in the middle of a long message.",
        "The grouped row's gutter time is opacity-hidden, not display-hidden, and never wraps (\"03:02 PM\" in 32px of width once grew every row from 24 to 39px).",
        "The unread wash today is brand/soft (ADR-9989); this spec paints surface.unread, the lighter coral both apps share — confirm with design.",
        "queued exists only here: an unacknowledged send is kept in the SQLite cache and resent in order on reconnect, surviving an app restart. Today's desktop refuses offline sends outright (ADR-0704); this spec is the outbox (#317).",
        "Not in the kit yet: events for the bar's reactions, Forward and ⋯, and for a reaction pill's toggle (the spec defines none on Message); right-click opening the ⋯ menu is the app's.",
      ],
      keyboard: [
        {
          keys: "↑ / ↓",
          action: "Moves the message cursor",
        },
        {
          keys: "E / R / T / F",
          action: "Edit / React / Reply in thread / Forward",
        },
        {
          keys: "Enter",
          action: "Opens the ⋯ menu",
        },
        {
          keys: "Right-click",
          action: "Opens the ⋯ menu at the pointer",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable (onLongPress, delayLongPress 300; none while sending) over Views, StyleSheet over useTheme() tokens, Avatar 40. One screen-reader stop whose label carries the words, reactions and replies, with Retry, Delete, Open thread and Message actions as accessibility actions.",
      import: "import { Message } from \"@antfabric-ui/react-native/chat\"",
      notes: [
        "V2: 12pt gutters, 8 above a header row and 0 above a continuation, 8 below every row; 16 Bold name, 12 Medium faint time.",
        "A compact row shows no time at all — there is no hover to reveal it. Long-press shows the full timestamp at the top of the actions sheet.",
        "A local echo (sending) is drawn at 55% and ignores long-press; reactions on it ignore taps.",
        "The phone refuses sends while offline and keeps the draft, so queued never occurs here; a send that loses the network in flight becomes failed with Retry.",
      ],
      gestures: [
        {
          gesture: "Long press",
          action: "Opens the message actions sheet (quick reactions, Copy text, Reply in thread, Forward, Edit, Pin, Delete)",
        },
        {
          gesture: "Tap avatar or name",
          action: "Opens the person's profile sheet",
        },
        {
          gesture: "Double tap",
          action: "Nothing — reserved, so a quick double tap on a link never reacts by accident",
        },
      ],
    },
  },
  a11y: {
    role: "article",
    label: "{author}, {time}",
    notes: [
      "Web and desktop: the row is a tab stop (tabIndex 0), so a text-only message can be reached by Tab; focus anywhere in the row shows the actions bar, and Tab then moves into it. Shift+F10 or the Menu key and a long press on touch open the bar too; Escape closes it and returns focus to the row. The row's name is who, when, the state and the flags.",
      "Phone: the message's own words are one stop (\"Priya Raman, 10:42 AM, Staging is green again…, edited, 1 attachment: plan.pdf, 2 reactions\"), with its actions on the rotor (Message actions, Retry, Delete, Open thread). Each reaction, the add pill, each attachment and the thread summary are stops of their own after it, so each can be used.",
      "Status is said in words (\"sending\", \"not sent\", \"not sent, you are offline\"); a failure is an alert, announced once.",
      "\"AI\" is part of the name for an agent, so it is never read out as a person.",
      "The unread wash, mention edge and cursor bar are never the only signal: unread and mentions are in the label.",
    ],
  },
  examples: [
    {
      name: "With a thread",
      props: {
        thread: {
          count: 4,
          lastReply: "2h ago",
          unread: 2,
          following: true,
          participants: [
            {
              name: "Marcus Chen",
              identity: "green",
            },
            {
              name: "Aisha Bello",
              identity: "ochre",
            },
            {
              name: "Kenji Watanabe",
              identity: "ink",
            },
          ],
        },
      },
      width: 600,
    },
    {
      name: "Continuation (compact)",
      props: {
        compact: true,
        body: "Checklist is up — shout if anything is missing.",
        reactions: [],
      },
      width: 600,
    },
    {
      name: "Hovered",
      props: {
        hovered: true,
        reactions: [
          {
            emoji: "🎉",
            count: 3,
            mine: true,
            reactors: "You, Marcus Chen and Aisha Bello reacted",
          },
        ],
      },
      platforms: ["web", "desktop"],
      width: 600,
    },
    {
      name: "Compact, hovered",
      props: {
        compact: true,
        hovered: true,
        body: "Checklist is up — shout if anything is missing.",
        reactions: [],
      },
      platforms: ["web", "desktop"],
      width: 600,
    },
    {
      name: "Sending",
      props: {
        author: "Aisha Bello",
        identity: "ochre",
        time: "10:44 AM",
        body: "On it — running the Android smoke suite now.",
        status: "sending",
        reactions: [],
      },
      width: 600,
    },
    {
      name: "Failed",
      props: {
        author: "Aisha Bello",
        identity: "ochre",
        time: "10:44 AM",
        body: "On it — running the Android smoke suite now.",
        status: "failed",
        reactions: [],
      },
      width: 600,
    },
    {
      name: "Queued while offline",
      props: {
        author: "Aisha Bello",
        identity: "ochre",
        time: "10:44 AM",
        body: "Landing in 10 — will pick this up from the train.",
        status: "queued",
        reactions: [],
      },
      platforms: ["desktop"],
      width: 600,
    },
    {
      name: "Deleted, thread kept",
      props: {
        status: "deleted",
        reactions: [],
        thread: {
          count: 3,
          lastReply: "Yesterday",
          participants: [
            {
              name: "Ravi Iyer",
              identity: "red",
            },
            {
              name: "Mei Tanaka",
              identity: "ochre",
            },
          ],
        },
      },
      width: 600,
    },
    {
      name: "Fabric (AI agent)",
      props: {
        author: "Fabric",
        agent: true,
        time: "10:46 AM",
        body: "Summary of #release-train since yesterday: the Android build is blocked on PLAT-2291 (composer drops drafts on reconnect); iOS and desktop are green. Marcus owns the fix, ETA 3 PM.",
        reactions: [
          {
            emoji: "🙏",
            count: 2,
            mine: false,
            reactors: "Priya Raman and Kenji Watanabe reacted",
          },
        ],
      },
      width: 600,
    },
    {
      name: "Unread",
      props: {
        author: "Kenji Watanabe",
        identity: "ink",
        time: "11:02 AM",
        body: "Design crit moved to 3:30 — the room was double-booked.",
        unread: true,
        reactions: [],
      },
      width: 600,
    },
    {
      name: "Mentions you",
      props: {
        author: "Marcus Chen",
        identity: "green",
        time: "11:05 AM",
        body: "@Aisha can you sanity-check the Android build before Priya cuts the branch?",
        mentionsYou: true,
        unread: true,
        reactions: [],
      },
      width: 600,
    },
    {
      name: "Pinned and edited",
      props: {
        author: "Sofia Herrera",
        identity: "red",
        time: "9:15 AM",
        body: "Release freeze: 12 November, 18:00 IST. No merges to main after that without a release-train approval.",
        pinned: true,
        edited: true,
        reactions: [],
      },
      width: 600,
    },
    {
      name: "With attachments",
      props: {
        author: "Mei Tanaka",
        identity: "ochre",
        time: "2:18 PM",
        body: "Updated onboarding flow and the crit notes.",
        reactions: [],
        attachments: [
          {
            kind: "image",
            name: "onboarding-flow-v4.png",
            size: "1.1 MB",
            src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 25'><rect width='40' height='25' fill='%23efe9ff'/><rect x='3' y='3' width='15' height='19' rx='1.5' fill='%23ffffff'/><rect x='21' y='3' width='16' height='9' rx='1.5' fill='%239fa6ff'/><rect x='21' y='14' width='16' height='8' rx='1.5' fill='%23ffffff'/><rect x='5' y='6' width='9' height='1.6' rx='.8' fill='%23fe4632'/></svg>",
          },
          {
            kind: "file",
            name: "design-crit-notes.docx",
            fileType: "doc",
            badge: "DOCX",
            typeLabel: "Word document",
            size: "48 KB",
          },
        ],
      },
      width: 600,
    },
    {
      name: "Highlighted (jumped to)",
      props: {
        highlighted: true,
        reactions: [],
      },
      width: 600,
    },
  ],
  matrix: [
    {
      prop: "status",
    },
    {
      prop: "compact",
    },
  ],
  states: ["hover"],
  edgeCases: [
    {
      title: "One enormous token",
      platforms: ["web", "desktop", "mobile"],
      handling: "A pasted URL, hash or model dump with no spaces breaks anywhere (overflow-wrap: anywhere, which also counts for min-content), so the row never pushes past the scroller and the timeline never scrolls sideways.",
      example: {
        name: "Unbroken token",
        props: {
          author: "Ravi Iyer",
          identity: "red",
          body: "https://grafana.example.com/d/platform-eng/latency?orgId=1&from=now-6h&to=now&var-service=chat-gateway&var-region=ap-south-1&viewPanel=42",
          reactions: [],
        },
        width: 360,
      },
    },
    {
      title: "A very long name",
      platforms: ["web", "desktop", "mobile"],
      handling: "The name truncates; the time, the AI tag and the pin never do. The hover card and the accessible name carry the full name.",
      example: {
        name: "Long name",
        props: {
          author: "Venkataraghavan Subramaniam-Iyer (Platform Engineering, Bengaluru)",
          identity: "green",
          pinned: true,
          reactions: [],
        },
        width: 360,
      },
    },
    {
      title: "Retry, and a double press on Retry",
      platforms: ["web", "desktop", "mobile"],
      handling: "Retry turns the row back to sending in place and reuses the message's client id, so a send that actually reached the server before the timeout is not posted twice. A second press while it is sending does nothing. Delete removes only the unsent copy — nothing reached anybody.",
    },
    {
      title: "Offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "The desktop reads history from its SQLite cache and holds new sends as queued, in order, until the socket returns — even across a restart. Web and mobile refuse sends while offline and keep the draft in the composer (\"You're offline, so this hasn't been sent. It's still here.\"); a send already in flight when the connection drops becomes failed.",
    },
    {
      title: "Edited or deleted on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "The edit lands live with \"(edited)\"; a message being read is replaced in place without moving the scroll. Deletion is a hard delete today (ADR-0161): the row leaves the timeline for everyone, unless it has thread replies, in which case the tombstone stays so the thread is reachable.",
    },
    {
      title: "Your own message from your other device",
      platforms: ["web", "desktop", "mobile"],
      handling: "A message you sent from the phone arrives on the desktop as sent, with no local echo and no unread wash — your own messages are never unread, and never counted in the badge.",
    },
    {
      title: "Suspended or deactivated author",
      platforms: ["web", "desktop", "mobile"],
      handling: "History stays exactly where it was. The name dims to text.muted, the face falls back to the ink colour, and the hover card says the account is suspended. A DM with them shows the suspended notice instead of a composer.",
      example: {
        name: "Suspended author",
        props: {
          author: "Former Member",
          identity: "ink",
          body: "Handing over the on-call rota to Daniel from Monday.",
          reactions: [],
        },
        width: 600,
      },
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Name, time and body grow to the 1.3× cap; the header wraps the time under the name rather than truncating it, and the avatar column stays 40pt wide so continuations still line up.",
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "The gutter moves to the right and the actions bar to the left; the mention edge and the cursor bar sit on the inline-start side. Mixed-direction messages are isolated per paragraph (dir=auto).",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "The unread wash is 5% coral on dark (3% on light) so it survives the darker surface; the mention and cursor bars keep full-strength coral edges.",
    },
  ],
  related: ["message-divider", "typing-indicator", "composer", "context-menu", "thread-panel"],
  flows: [
    {
      id: "sending-then-sent",
      title: "Your message shows at once, then the server confirms it",
      description: "The phone draws your message the moment you press Send, dimmed until the server answers. The POST's answer and the socket's copy of the same message fold into one row. Today's desktop draws the row when the answer comes back.",
      platforms: ["web", "desktop", "mobile"],
      width: 600,
      steps: [
        {
          kind: "data",
          title: "Sending adds a local echo to the timeline",
          detail: "Rows come from the message window, which the device cache, the server and the socket fill. The send mutation appends your message to the newest page with an id that starts local:, before the request leaves.",
          code: "const echo = { ...localEcho({ channelId, authorId, text }), id: input.localId }; patchScope(client, scope, (pages) => appendToPages(pages, echo))",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The timeline reads chMsgs from the store",
          detail: "Today's desktop doesn't echo. deliverCh adds the row when the POST answers, unless the socket's chat.message.created added it first. The spec draws it as sending in between, as the phone does.",
          code: "return { chMsgs: { ...s.chMsgs, [key]: existing.concat([complete]) } }",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The channel query gets an optimistic row",
          detail: "The send mutation's onMutate adds the message to the channel's TanStack Query cache with a client id, and the same id rides the POST so a retry can't post it twice.",
          code: "queryClient.setQueryData(messagesKey(channelId), (pages) => appendToPages(pages, echo))",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "It's drawn as sending",
          detail: "Dimmed, with a clock and \"Sending…\". It has no server id yet, so long-press does nothing and its reactions ignore taps.",
          code: "const pending = isLocalId(m.id)  // opacity: pending ? 0.55 : 1",
        },
        {
          kind: "trigger",
          title: "The answer arrives, twice",
          lane: "system",
          detail: "The POST resolves with the stored message, and the socket delivers chat.message.created for the same message. Either can come first.",
        },
        {
          kind: "state",
          title: "The echo is swapped for the real row",
          detail: "onSuccess puts the server's row where the echo was. The socket's copy adds nothing, because the window store's append checks the id. The device cache gets the complete copy.",
          code: "patchScope(client, scope, (pages) => replaceLocal(pages, input.localId, real)); cacheSentMessage({ ownerId: selfId }, channelId, real)",
          platforms: ["web", "mobile"],
        },
        {
          kind: "state",
          title: "A row the socket drew first is upgraded, not doubled",
          detail: "The socket's event carries no attachments, so when it lands first the POST's complete copy fills in what it lacks instead of adding a second row.",
          code: "const at = existing.findIndex((m) => m.id === sent.id); if (at !== -1) next[at] = withServedOnlyFields(existing[at], complete)",
          platforms: ["desktop"],
        },
        {
          kind: "motion",
          title: "The dim lifts in place",
          detail: "Opacity goes to full and \"Sending…\" goes. Nothing moves, so the reader keeps their place in the timeline.",
        },
        {
          kind: "result",
          title: "Sent",
          detail: "Full ink, reactions and, on web and desktop, the actions bar on hover. Everyone else got it through the socket. Your other devices show it as sent, with no unread wash.",
        },
      ],
      replay: [
        {
          step: 3,
          hold: 1500,
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:44 AM",
            body: "On it — running the Android smoke suite now.",
            status: "sending",
            reactions: [],
          },
        },
        {
          step: 7,
          hold: 1400,
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:44 AM",
            body: "On it — running the Android smoke suite now.",
            reactions: [],
          },
        },
        {
          step: 8,
          hold: 1800,
          platforms: ["web", "desktop"],
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:44 AM",
            body: "On it — running the Android smoke suite now.",
            reactions: [],
            hovered: true,
          },
        },
      ],
    },
    {
      id: "send-fails",
      title: "A send that doesn't go through",
      description: "The spec keeps a failed message in the timeline with Retry and Delete, and on the desktop holds a message written offline as queued. Today both apps put the words back in the composer instead.",
      platforms: ["web", "desktop", "mobile"],
      width: 600,
      steps: [
        {
          kind: "trigger",
          title: "The POST fails",
          detail: "Nothing answered (status 0: the network went while the send was in flight), or the server refused it.",
        },
        {
          kind: "state",
          title: "Today: the words go back into the box",
          detail: "The desktop drew no row, so it puts the text and the files back in the composer and says what happened. A send nothing answered gets the offline sentence.",
          code: "set((s) => ({ chInput: s.chInput || text, … })); showToast(error.status === 0 ? OFFLINE_SEND_REFUSED : plainFailure(error, 'Your message did not send. Try again.'), 'error')",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "Today: the echo goes and the draft comes back",
          detail: "onError removes the local echo, the screen shows the server's own sentence above the composer, and the files go back on the tray.",
          code: "replaceLocal(pages, input.localId, null)  ·  surface(error); attachments.restore(sentFiles)",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The spec keeps the row: Couldn't send",
          detail: "status becomes failed. The row stays where it was written with \"Couldn't send · Retry · Delete\" in crimson, announced once as an alert. No actions bar and no reactions: it has no server id.",
        },
        {
          kind: "trigger",
          title: "Retry is pressed",
          detail: "A second press while it's sending does nothing.",
        },
        {
          kind: "event",
          title: "onRetry() fires",
          detail: "The caller posts again with the same client id. The phone already sends its local id as client_message_id, so a send that reached the server before the timeout isn't posted twice.",
          code: "onRetry?.()  // postMessage(channelId, text, mentions, attachmentIds, input.localId)",
        },
        {
          kind: "state",
          title: "Back to sending, in place",
          detail: "The row doesn't move to the bottom. It goes back to dimmed with \"Sending…\" where it was.",
        },
        {
          kind: "result",
          title: "Sent",
          detail: "The answer comes back and the row is an ordinary message. Delete would have removed only this unsent copy: nothing reached anybody.",
        },
        {
          kind: "state",
          title: "Written offline on the desktop: queued",
          detail: "The spec's outbox (#317): with the socket down, the message is kept in the SQLite cache as queued, \"Not sent — you're offline. It's still here.\", and survives a restart. Today sendCh refuses the send and the draft stays in the box.",
          code: "if ((get().connectivity ?? 'online') === 'offline') { showToast(OFFLINE_SEND_REFUSED, 'error'); return }",
          platforms: ["desktop"],
        },
        {
          kind: "result",
          title: "Back online, the queue drains in order",
          detail: "Each queued message goes to sending, then sent, oldest first, so the conversation reads in the order it was written.",
          platforms: ["desktop"],
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:44 AM",
            body: "On it — running the Android smoke suite now.",
            status: "sending",
            reactions: [],
          },
        },
        {
          step: 3,
          hold: 1700,
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:44 AM",
            body: "On it — running the Android smoke suite now.",
            status: "failed",
            reactions: [],
          },
        },
        {
          step: 4,
          press: "Retry sending this message",
          hold: 900,
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:44 AM",
            body: "On it — running the Android smoke suite now.",
            status: "failed",
            reactions: [],
          },
        },
        {
          step: 6,
          hold: 1300,
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:44 AM",
            body: "On it — running the Android smoke suite now.",
            status: "sending",
            reactions: [],
          },
        },
        {
          step: 7,
          hold: 1500,
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:44 AM",
            body: "On it — running the Android smoke suite now.",
            reactions: [],
          },
        },
        {
          step: 8,
          hold: 1800,
          platforms: ["desktop"],
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:51 AM",
            body: "Landing in 10 — will pick this up from the train.",
            status: "queued",
            reactions: [],
          },
        },
        {
          step: 9,
          hold: 1600,
          platforms: ["desktop"],
          props: {
            author: "Aisha Bello",
            identity: "ochre",
            time: "10:51 AM",
            body: "Landing in 10 — will pick this up from the train.",
            reactions: [],
          },
        },
      ],
    },
  ],
};

export default docs;
