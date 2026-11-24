import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "card",
  name: "Card",
  category: "display",
  level: "atom",
  status: "stable",
  description: "A white surface for one thing — a project, a task, a meeting, a note from Fabric. The radius steps down as cards nest (pane 16 → rail 14 → inner 12), and a clickable card answers the pointer with a grey fill while nothing moves.",
  props: {
    children: {
      type: "node",
      sample: "Card content",
      description: "Whatever the card holds. The card adds the frame and an 8px gap between direct children; it never styles the content.",
    },
    level: {
      type: "enum",
      options: ["pane", "rail", "inner"],
      default: "pane",
      description: "The nesting level, named instead of the radius so a 16px card inside a 16px pane cannot be written by accident. Mobile cards are always 16.",
    },
    elevate: {
      type: "enum",
      options: ["none", "hairline", "card", "raise", "float"],
      default: "hairline",
      description: "Pick by the ground: card on the cream page, hairline on a tinted surface, none for a card inside a panel. Mobile cards are flat; the hairline border separates them.",
    },
    tint: {
      type: "enum",
      options: ["default", "brand", "recessed"],
      default: "default",
      description: "brand is a coral-tinted note — \"Fabric wrote this\" — never decoration. recessed is a box on white (an inset inside a panel).",
    },
    interactive: {
      type: "boolean",
      default: false,
      description: "The whole card opens something. Hover fills it with the hover surface; the border and the shadow hold still.",
    },
    label: {
      type: "string",
      default: "",
      description: "Accessible name of the card's press target when interactive, e.g. \"Open Checkout revamp\". Left out, the web target is named by the card's first heading, else by its text; the phone's by what the card holds.",
    },
    href: {
      type: "string",
      default: "",
      platforms: ["web", "desktop"],
      description: "A card that navigates: the stretched target is an <a href>, so ⌘-click and middle-click open it in a new tab. A plain click calls onPress (and stays on the page) when there is one.",
    },
    pad: {
      type: "enum",
      options: ["default", "none"],
      default: "default",
      description: "default is 16 on web and desktop, 12 on mobile (the app-wide row inset). none is for a card that is a scroll container or holds full-bleed rows.",
    },
    accent: {
      type: "enum",
      options: ["none", "brand", "success", "warning", "danger", "info"],
      default: "none",
      platforms: ["mobile"],
      description: "A 3pt leading colour rail. Mobile only, and used sparingly — the desktop has rejected coloured card edges; it signals state with a Tag inside.",
    },
    onPress: {
      type: "event",
    },
    onLongPress: {
      type: "event",
      platforms: ["mobile"],
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div> with a stretched <button> under the content as its one press target (the content, nested controls and text, sits above it); hover from useInteraction fills it, keyboard focus rings the whole card; inline styles over `t`",
      import: "import { Card } from \"@antfabric/ui-react\"",
      notes: [
        "An interactive card is a stretched link: one <a href> (with `href`) or <button> fills the card, drawn under its content (z-index -1 inside the card, which isolates its own stacking context), so whatever the product nests, a plain <a>, a <button>, a field, stays its own control and the card's text can be selected. A press on the card's padding is the target's; a press on its text opens the card too (through the link with `href`, so ⌘-click still opens a tab), unless it ended a text selection. A <button> wrapping the whole card would make every nested button invalid HTML.",
        "A card that navigates (`href`) is an <a>, so middle-click and ⌘-click open it in a new tab.",
        "With no `label`, the target is named by the card's first heading (aria-labelledby) or, with none, by the card's text; give a `label` when that is not what the card is for.",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Focuses the card's press target once; the ring is drawn around the whole card",
        },
        {
          keys: "Enter",
          action: "Opens it",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <div> as web: level / elevate / tint over `t` at desktop density",
      import: "import { Card } from \"@antfabric/ui-react\"",
      notes: [
        "The house treatment inside a panel is level=\"inner\" elevate=\"none\" interactive: white on white, the hairline as the whole separation, and a hover that fills to the hover surface while NOTHING moves (owner, 2026-08-28; ADR-0322). The border does not change colour on hover.",
        "A brand card hovers one step further, to brand.soft-hover — it is already soft-filled, so the plain hover would be a no-op.",
        "`ref` reaches the root <div> (React 19: a prop), because a card is often the scroll container whose position has to be restored.",
        "A Panel (flat region, no radius) is a different component: a region is a Panel, a thing is a Card (ADR-0307).",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Opens the card",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A View, or a Pressable when interactive (role, label and a \"Select\" accessibility action for long-press on it), scaling to 0.99 while pressed; StyleSheet over useTheme()",
      import: "import { Card } from \"@antfabric/ui-react-native\"",
      notes: [
        "Radius 16, 12pt inner padding (owner, 2026-09-10: 12 is the app-wide inset) — not the 16pt screen gutter, which is a different measurement.",
        "Children are clipped to the radius (overflow: hidden) — RN does not clip on its own, and a full-bleed footer would square off past the corners.",
        "accessibilityRole/Label/State go on the Pressable, not the Box inside it, or a screen reader never hears them. A selected recording is told by the card's accessibilityState alone (ADR-8910).",
        "No hover on a phone: the press feedback is a 0.99 scale, and long-press is where a hover-revealed menu lives on desktop.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens it; scales to 0.99 while pressed",
        },
        {
          gesture: "Long press",
          action: "Acts on it instead of opening it — enters multi-select in Recordings, with a light haptic",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "A non-interactive card has no role; its heading carries the structure.",
      "An interactive card has exactly one press target with a name: `label`, else the first heading inside the card, else the card's text. Its long-press alternative is also offered as an accessibility action (\"Select\") because VoiceOver and TalkBack users cannot long-press reliably.",
    ],
  },
  examples: [
    {
      name: "Placeholder",
      props: {},
      width: 320,
    },
    {
      name: "Project card (house treatment)",
      props: {
        level: "inner",
        elevate: "none",
        interactive: true,
        label: "Open Checkout revamp",
        children: [
          {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: 8,
            },
            children: [
              {
                el: "text",
                text: "Checkout revamp",
                style: {
                  fontSize: "$font.size.title",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                  truncate: 1,
                },
              },
              {
                el: "component",
                use: "tag",
                props: {
                  label: "On track",
                  tone: "success",
                },
              },
            ],
          },
          {
            el: "text",
            text: "#release-train · 12 open tickets · due Nov 14",
            style: {
              fontSize: "$font.size.caption",
              color: "$color.text.muted",
            },
          },
        ],
      },
      width: 320,
    },
    {
      name: "Hovered — fills, does not lift",
      props: {
        level: "inner",
        elevate: "none",
        interactive: true,
        label: "Open Design crit, Thursday",
        children: [
          {
            el: "text",
            text: "Design crit",
            style: {
              fontSize: "$font.size.title",
              fontWeight: "$font.weight.semibold",
              color: "$color.text.strong",
            },
          },
          {
            el: "text",
            text: "Thursday 15:00 · #design-crit · 6 going",
            style: {
              fontSize: "$font.size.caption",
              color: "$color.text.muted",
            },
          },
        ],
      },
      state: "hover",
      platforms: ["web", "desktop"],
      width: 320,
    },
    {
      name: "Note from Fabric",
      props: {
        tint: "brand",
        level: "inner",
        children: [
          {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              gap: 6,
            },
            children: [
              {
                el: "icon",
                icon: "sparkles",
                style: {
                  size: "$size.icon.md",
                },
              },
              {
                el: "text",
                text: "Fabric summarised 38 messages",
                style: {
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.semibold",
                },
              },
            ],
          },
          {
            el: "text",
            text: "The team agreed to ship the new onboarding flow behind a flag on Monday. Lena owns the rollout.",
            style: {
              fontSize: "$font.size.caption",
              lineHeight: "$font.lineHeight.caption",
            },
          },
        ],
      },
      width: 320,
    },
    {
      name: "Rail card on the page",
      props: {
        level: "rail",
        elevate: "card",
        children: [
          {
            el: "text",
            text: "MY TASKS",
            style: {
              fontSize: 11,
              fontWeight: "$font.weight.bold",
              letterSpacing: "$font.letterSpacing.caps",
              color: "$color.text.faint",
            },
          },
          {
            el: "text",
            text: "Review the token broker latency report",
            style: {
              fontSize: "$font.size.bodySm",
              color: "$color.text.strong",
            },
          },
          {
            el: "text",
            text: "Draft the Q4 release notes",
            style: {
              fontSize: "$font.size.bodySm",
              color: "$color.text.strong",
            },
          },
        ],
      },
      platforms: ["web", "desktop"],
      width: 280,
    },
    {
      name: "Recessed inset",
      props: {
        tint: "recessed",
        level: "inner",
        elevate: "none",
        children: [
          {
            el: "text",
            text: "Retention: messages are kept for 365 days in #platform-eng.",
            style: {
              fontSize: "$font.size.caption",
              color: "$color.text.muted",
            },
          },
        ],
      },
      width: 320,
    },
    {
      name: "Mobile action item with accent",
      props: {
        accent: "warning",
        interactive: true,
        label: "Open action item: Send the vendor contract to legal",
        children: [
          {
            el: "text",
            text: "Send the vendor contract to legal",
            style: {
              fontSize: "$font.size.body",
              fontWeight: "$font.weight.medium",
              color: "$color.text.strong",
            },
          },
          {
            el: "text",
            text: "From Monday's standup · due today",
            style: {
              fontSize: "$font.size.bodySm",
              color: "$color.text.muted",
            },
          },
        ],
      },
      platforms: ["mobile"],
      width: 343,
    },
  ],
  matrix: [
    {
      prop: "level",
    },
    {
      prop: "elevate",
    },
    {
      prop: "tint",
    },
  ],
  edgeCases: [
    {
      title: "A card inside a card",
      platforms: ["web", "desktop"],
      handling: "Name the level, not the radius: pane (16) holds rail (14) holds inner (12). The inner card takes elevate=\"none\" — a shadow says it left the surface, which a row inside a panel does not do, and in a 320px rail the blur eats the gap between neighbours.",
      example: {
        name: "Inner card",
        props: {
          level: "inner",
          elevate: "none",
          children: [
            {
              el: "text",
              text: "Lena Fischer moved 3 tickets to Done",
              style: {
                fontSize: "$font.size.bodySm",
                color: "$color.text.strong",
              },
            },
          ],
        },
        width: 280,
      },
    },
    {
      title: "Hover must not move anything",
      platforms: ["web", "desktop"],
      handling: "Only the fill changes (to the hover surface; brand.soft-hover on a brand card). No lift, no border colour, no scale — a lift in a tight rail reads as the neighbours dimming, and a border that changes colour flickers as the pointer crosses the edge. Only background-color and color transition.",
    },
    {
      title: "No hover on touch",
      platforms: ["mobile"],
      handling: "The press is the feedback: scale 0.99 while the finger is down. Anything a desktop card reveals on hover (a ⋯ menu, a quick action) is reached by long-press on the phone, or is always visible.",
      example: {
        name: "Pressed",
        props: {
          interactive: true,
          label: "Open Weekly sync recording",
          children: [
            {
              el: "text",
              text: "Weekly sync · 32 min",
              style: {
                fontSize: "$font.size.body",
                color: "$color.text.strong",
              },
            },
          ],
        },
        state: "pressed",
        width: 343,
      },
    },
    {
      title: "Buttons inside a clickable card",
      platforms: ["web", "desktop", "mobile"],
      handling: "The nested control wins: on web and desktop the stretched press target is drawn under the card's content, so a nested button, a plain link or a field takes its own press, and a press inside one never opens the card; on mobile the inner Pressable claims the responder, so the card does not open. Text in an interactive card can be selected: a press that ends a selection does not open it. Never put a card's only primary action inside it AND on the card itself.",
      example: {
        name: "A button inside an interactive card",
        props: {
          level: "inner",
          elevate: "none",
          interactive: true,
          label: "Open Design crit, Thursday",
          children: [
            {
              el: "text",
              text: "Design crit · Thursday 15:00",
              style: {
                fontSize: "$font.size.body",
                color: "$color.text.strong",
              },
            },
            {
              el: "component",
              use: "button",
              props: {
                label: "Join",
                size: "sm",
                variant: "soft",
              },
            },
          ],
        },
        width: 280,
      },
    },
    {
      title: "Keyboard and screen reader",
      platforms: ["web", "desktop"],
      handling: "One tab stop per card (the press target), with the focus ring drawn around the whole card via focus-within. Its name is label, not the concatenated card text; nested buttons are the next tab stops.",
      example: {
        name: "Focused",
        props: {
          level: "inner",
          elevate: "none",
          interactive: true,
          label: "Open Checkout revamp",
          children: [
            {
              el: "text",
              text: "Checkout revamp",
              style: {
                fontSize: "$font.size.title",
                fontWeight: "$font.weight.semibold",
                color: "$color.text.strong",
              },
            },
          ],
        },
        state: "focus",
        width: 280,
      },
    },
    {
      title: "Content still loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "The card frame renders immediately at its final size and holds Skeleton shapes (shown after 300 ms). Never a spinner inside a card, and never a card that pops in after its neighbours.",
    },
    {
      title: "Offline or stale",
      platforms: ["desktop", "mobile"],
      handling: "A card drawn from the desktop's SQLite cache or the phone's snapshot looks exactly like a live one — no greying. Staleness is said once at the pane level (an InlineBanner), not on every card.",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "The surface steps lighter than the page (#222124 on #161618), the shadows deepen, and the brand tint becomes a dark coral (#382525). Contrast against a recessed panel comes from the hairline, which is why the border is never removed.",
    },
    {
      title: "Right-to-left",
      platforms: ["mobile"],
      handling: "The accent rail moves to the leading edge, which is the right in RTL. It is a border-start, never border-left.",
    },
  ],
  related: ["panel", "tag", "skeleton", "list-item"],
  flows: [
    {
      id: "open-a-card",
      title: "Press a card to open what it holds",
      description: "A clickable card is one press target. It fills on hover without moving, fires onPress, and leaves what to open to the screen that drew it.",
      platforms: ["web", "desktop", "mobile"],
      width: 320,
      steps: [
        {
          kind: "data",
          title: "The grid draws a card per project",
          detail: "ProjectGrid reads the projects from the workspace store and draws each one as a single button: faces, status, name and client, tasks, due date. On hover it fills with the hover surface and nothing lifts.",
          code: "<button type=\"button\" onClick={() => a.openProject(p.id)} className=\"hv-card\">",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "Recordings draws a card per meeting",
          detail: "The meetings page query gives one card each, with a tap to open and a long-press to start selecting.",
          code: "<MeetingCard key={m.id} meeting={m} onPress={…} onLongPress={() => beginSelection(m.id)} />",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The projects route lists them from its loader",
          detail: "The loader fills the TanStack Query cache before paint, so the grid draws whole cards, not a card that pops in after its neighbours.",
          code: "const projects = Route.useLoaderData()",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The card is pressed",
          detail: "A click, or Enter / Space with it focused; a tap on the phone, which scales it to 0.99 while the finger is down. A button inside the card takes its own press and the card doesn't open.",
        },
        {
          kind: "event",
          title: "onPress fires",
          detail: "The card knows nothing about projects or meetings; the screen's handler decides what opening means.",
          code: "onPress?.()",
        },
        {
          kind: "state",
          title: "openProject switches the workspace to the project",
          detail: "The project's space opens on its first channel, and whatever panel or search was open on the last conversation closes.",
          code: "return { screen: 'channels', wsMode: 'projects', activeProject: id, projPane: 'space', ...navPatch(s, p?.channels[0] ?? s.activeChannel), … }",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The router pushes the meeting",
          detail: "While Recordings is selecting, the same tap ticks the card instead: the largest target on the screen means what the mode is for.",
          code: "selecting ? () => setSelected((prev) => toggle(prev, m.id)) : () => router.push({ pathname: '/meeting/[id]', params: { id: m.id } })",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "The press target is a link",
          detail: "A stretched <a href> covers the card, so ⌘-click opens the project in a new tab, and the router preloads it on hover.",
          code: "<Link to=\"/projects/$projectId\" params={{ projectId: p.id }} preload=\"intent\" />",
          platforms: ["web"],
        },
        {
          kind: "result",
          title: "The project or the meeting opens",
          detail: "On the desktop, the project's space with its first channel. On the phone, the meeting's summary; a long-press selects the card instead of opening it.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {
            level: "inner",
            elevate: "none",
            interactive: true,
            label: "Open Checkout revamp",
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                  gap: 8,
                },
                children: [
                  {
                    el: "text",
                    text: "Checkout revamp",
                    style: {
                      fontSize: "$font.size.title",
                      fontWeight: "$font.weight.semibold",
                      color: "$color.text.strong",
                      truncate: 1,
                    },
                  },
                  {
                    el: "component",
                    use: "tag",
                    props: {
                      label: "On track",
                      tone: "success",
                    },
                  },
                ],
              },
              {
                el: "text",
                text: "#release-train · 12 open tickets · due Nov 14",
                style: {
                  fontSize: "$font.size.caption",
                  color: "$color.text.muted",
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["mobile"],
          props: {
            interactive: true,
            label: "Open Weekly sync",
            children: [
              {
                el: "text",
                text: "Weekly sync",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.medium",
                  color: "$color.text.strong",
                },
              },
              {
                el: "text",
                text: "Today · 10:00 · 32 min · 4 action items",
                style: {
                  fontSize: "$font.size.bodySm",
                  color: "$color.text.muted",
                },
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1300,
          platforms: ["web"],
          props: {
            level: "inner",
            elevate: "none",
            interactive: true,
            label: "Open Checkout revamp",
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                  gap: 8,
                },
                children: [
                  {
                    el: "text",
                    text: "Checkout revamp",
                    style: {
                      fontSize: "$font.size.title",
                      fontWeight: "$font.weight.semibold",
                      color: "$color.text.strong",
                      truncate: 1,
                    },
                  },
                  {
                    el: "component",
                    use: "tag",
                    props: {
                      label: "On track",
                      tone: "success",
                    },
                  },
                ],
              },
              {
                el: "text",
                text: "#release-train · 12 open tickets · due Nov 14",
                style: {
                  fontSize: "$font.size.caption",
                  color: "$color.text.muted",
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 0,
          hold: 1000,
          platforms: ["web", "desktop"],
          props: {
            level: "inner",
            elevate: "none",
            interactive: true,
            label: "Open Checkout revamp",
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                  gap: 8,
                },
                children: [
                  {
                    el: "text",
                    text: "Checkout revamp",
                    style: {
                      fontSize: "$font.size.title",
                      fontWeight: "$font.weight.semibold",
                      color: "$color.text.strong",
                      truncate: 1,
                    },
                  },
                  {
                    el: "component",
                    use: "tag",
                    props: {
                      label: "On track",
                      tone: "success",
                    },
                  },
                ],
              },
              {
                el: "text",
                text: "#release-train · 12 open tickets · due Nov 14",
                style: {
                  fontSize: "$font.size.caption",
                  color: "$color.text.muted",
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 0,
          hold: 1000,
          platforms: ["mobile"],
          props: {
            interactive: true,
            label: "Open Weekly sync",
            children: [
              {
                el: "text",
                text: "Weekly sync",
                style: {
                  fontSize: "$font.size.body",
                  fontWeight: "$font.weight.medium",
                  color: "$color.text.strong",
                },
              },
              {
                el: "text",
                text: "Today · 10:00 · 32 min · 4 action items",
                style: {
                  fontSize: "$font.size.bodySm",
                  color: "$color.text.muted",
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
