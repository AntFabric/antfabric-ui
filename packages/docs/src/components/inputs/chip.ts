import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "chip",
  name: "Chip",
  category: "inputs",
  level: "atom",
  status: "stable",
  description: "A small labelled pill in three kinds. filter narrows a list — the phone's All · Channels · Project · DMs row — and goes ink when chosen. suggestion is the app offering something that does not exist yet: a plain card fill, a hairline, never the brand colour. object is a real saved thing: the soft brand fill with a brand edge. Any of them can carry a count or a remove ✕.",
  props: {
    label: {
      type: "string",
      sample: "All",
      required: true,
    },
    icon: {
      type: "icon",
      default: "",
      sample: "layout-grid",
    },
    variant: {
      type: "enum",
      options: ["filter", "suggestion", "object"],
      default: "filter",
      description: "filter narrows what you are looking at. suggestion is a prompt under the composer. object is a saved thing (a project, a saved search) and is the only chip allowed the brand colour.",
    },
    selected: {
      type: "boolean",
      default: false,
      sample: true,
      description: "filter: the chosen filter — ink fill. suggestion: the highlighted prompt — the hover look, never the brand colour.",
    },
    count: {
      type: "number",
      default: 0,
      description: "How many are in there — a quiet number after the label, never a brand-coloured badge. 0 draws nothing.",
    },
    removable: {
      type: "boolean",
      default: false,
      description: "Adds a ✕ with its own label (\"Remove From: Priya Raman\") as a second target.",
    },
    removed: {
      type: "boolean",
      default: false,
      description: "The ✕ was pressed: the chip is gone. Set by the chip's own ✕ in the catalogue; in the apps the caller drops the chip from its list on onRemove.",
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    onSelectedChange: {
      type: "event",
      args: "selected: boolean",
      changes: "selected",
      description: "Called with `selected` as the press leaves it: flipped.",
    },
    onPress: {
      type: "event",
      description: "The chip was pressed. Its `selected` changes through `onSelectedChange`.",
    },
    onRemove: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A row holding two sibling <button>s — the chip (aria-pressed on a filter) and its ✕ — never nested; inline styles over `t`, the root taking the hover and press of either; `selected` through useControllable; Backspace / Delete on a removable chip removes it",
      import: "import { Chip } from \"@antfabric-ui/react\"",
      notes: [
        "A single-choice filter row is a ToggleGroup (or tablist when it switches a list in place); a multi-choice row is independent Toggles with aria-pressed.",
        "The ✕ is its own button, never inside the chip's button — nested buttons are invalid HTML and the parser splits them.",
        "Pressing the chip toggles `selected` and the ink fill fades in; pressing the ✕ sets `removed` and the chip goes. Both are `on.press` actions, so the catalogue preview is interactive.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Activates the chip",
        },
        {
          keys: "Backspace / Delete",
          action: "On a focused removable chip, removes it and moves focus to the next chip, or to the search field if none is left",
        },
        {
          keys: "ArrowLeft / ArrowRight",
          action: "Moves between chips in a filter row (roving focus)",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same two-button row as web, at desktop density (34px)",
      import: "import { Chip } from \"@antfabric-ui/react\"",
      notes: [
        "suggestion is the search field's resting box, token for token: --border-subtle hairline, --radius-control, --shadow-hairline in every state. Hover moves the fill and nothing else — no coral, in hover or active (ADR-0322).",
        "Home's three suggestion chips share the row EQUALLY (flex 1 1 0, min-width fit-content), so a narrow row wraps instead of clipping. object chips do not take an equal share.",
        "object is coral-soft with a coral-200 edge in Light; in Dark it wears the suggestion's edge and keeps the coral in the fill and label.",
        "Desktop has no filter chips today — the command palette's kind filter is ChoicePills (radio-group pills). Filter chips arrive with search filters (From:, In:).",
        "Pressing toggles `selected` (150ms fill and ink cross-fade); the ✕ sets `removed`, and the caller drops the chip on onRemove.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Activates",
        },
        {
          keys: "Backspace",
          action: "Removes a focused removable chip",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A View with a Pressable chip (togglebutton for a filter) and a Pressable ✕ with hitSlop, StyleSheet over useTheme(); the 0.96 press bounce; `selected` through useControllable. The scrolling filter row is the caller's",
      import: "import { Chip } from \"@antfabric-ui/react-native\"",
      notes: [
        "A 33pt pill: a 16pt glyph and a 14pt label 8 apart, 16 either side, and a 1pt Rim drawn over the edge so it takes no room.",
        "Chosen is ink (surfaceInverse) with inverse ink; the rest are white with text.faint. Coral until the V2 Figma of 2026-10-16 (ADR-9406).",
        "The fill does NOT travel between chips: the chosen chip fills itself at once and the tapped chip gives a small bounce. A sliding pill was tried and turned down (\"No smooth motion\").",
        "The row scrolls sideways (at 393pt the last chip runs off the edge) and choosing a chip scrolls it fully into view.",
        "Tapping toggles `selected`, with the 0.96 press bounce; the ✕ sets `removed`.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Chooses the filter with a small bounce (none under Reduce Motion)",
        },
        {
          gesture: "Horizontal swipe",
          action: "Scrolls the row",
        },
        {
          gesture: "Tap ✕",
          action: "Removes; the ✕ has a 44pt hitSlop",
        },
      ],
    },
  },
  a11y: {
    label: "{label}",
    notes: [
      "A filter chip's main button exposes its state as aria-pressed (the phone: a toggle button with checked). A suggestion and an object chip are plain buttons.",
      "The count joins the label (\"DMs, 3\"); the ✕ is a second button named \"Remove {label}\", never just \"Remove\".",
      "Backspace or Delete on a removable chip removes it. When the chip that has focus goes, focus moves to the next chip, else the previous one, else the row that held it; a keyboard user is not dropped to the top of the page.",
      "Selection is not colour alone: a chosen chip changes its fill and exposes aria-pressed. Keyboard focus draws a ring on the chip.",
    ],
  },
  examples: [
    {
      name: "Filter, chosen",
      props: {},
    },
    {
      name: "Filter",
      props: {
        label: "Channels",
        icon: "hash",
        selected: false,
      },
    },
    {
      name: "Filter with count",
      props: {
        label: "DMs",
        icon: "message-circle",
        selected: false,
        count: 3,
      },
    },
    {
      name: "Project filter",
      props: {
        label: "Project",
        icon: "folder-kanban",
        selected: false,
      },
    },
    {
      name: "Suggestion",
      props: {
        variant: "suggestion",
        label: "Summarise #design-crit since Monday",
        icon: "sparkles",
        selected: false,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Object",
      props: {
        variant: "object",
        label: "Weekly release review",
        icon: "calendar-check",
        selected: false,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Removable search filter",
      props: {
        label: "From: Priya Raman",
        icon: "at-sign",
        removable: true,
      },
    },
    {
      name: "Disabled",
      props: {
        label: "Recordings",
        icon: "inbox",
        selected: false,
        disabled: true,
      },
    },
  ],
  matrix: [
    {
      prop: "variant",
    },
    {
      prop: "selected",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "The row runs off the edge",
      platforms: ["mobile", "web", "desktop"],
      handling: "A filter row scrolls sideways rather than wrapping or shrinking chips. The last chip is allowed to run off the edge — the cut-off chip is the cue that there is more. Choosing a chip scrolls it fully into view, the gutter included.",
    },
    {
      title: "A long label",
      platforms: ["web", "desktop", "mobile"],
      handling: "One line, truncated with an ellipsis at 240px; the full text is the tooltip on desktop and the accessible name everywhere. Suggestions are written to fit — the truncation is a safety net, not a layout.",
      example: {
        name: "Truncated",
        props: {
          variant: "suggestion",
          label: "Draft the Q4 release notes from everything merged into #release-train this month",
          icon: "sparkles",
          selected: false,
        },
      },
    },
    {
      title: "A huge count",
      platforms: ["web", "desktop", "mobile"],
      handling: "Caps at 99+ so the chip does not grow past its neighbours; the exact number stays in the accessible name. A count is how many, not how many need you — it is never coral, even for DMs.",
      example: {
        name: "Capped",
        props: {
          label: "Channels",
          icon: "hash",
          selected: false,
          count: 1204,
        },
      },
    },
    {
      title: "Removing a chip",
      platforms: ["web", "desktop", "mobile"],
      handling: "The ✕ is a separate target with its own name. After removal focus moves to the next chip, or to the search field when none is left, so a keyboard user is never dropped at the top of the page. The list re-filters at once; there is no confirm — adding the filter back is one step.",
    },
    {
      title: "Reduced motion",
      platforms: ["mobile", "web", "desktop"],
      handling: "No tap bounce and no scale on press; the fill still changes at once, which is the feedback.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "33pt is a minimum: chips grow with the text and the row scrolls further. The glyph stays 16pt.",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "The chosen filter's ink fill inverts to a light chip with dark text; the object chip drops its coral edge for the suggestion's and keeps the coral in its fill and label, because coral-800 reads as a dull maroon rim on dark.",
    },
    {
      title: "Touch on a laptop",
      platforms: ["web", "desktop"],
      handling: "pointer: coarse raises the chip to 36px and the ✕ to a 32px target; hover fills still apply to a mouse on the same device.",
    },
  ],
  related: ["segmented-control", "radio-group", "badge", "tag"],
  flows: [
    {
      id: "filter-the-list",
      title: "Filter Messages with the chip row",
      description: "Four filter chips over the Messages list. One is chosen at a time; the screen owns which, and the list, the section labels and the search placeholder all follow it.",
      platforms: ["web", "mobile"],
      width: 375,
      steps: [
        {
          kind: "data",
          title: "The Messages tab owns the filter",
          detail: "FilterChips holds no choice of its own: the tab passes the value down and takes changes back.",
          code: "const [filter, setFilter] = useState<MessagesFilter>('all')  // <FilterChips value={filter} onChange={setFilter} />",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The filter is a search param",
          detail: "The row is a ToggleGroup of links, so the filter survives a reload and a shared link. The conversations come from the channels query the sidebar already filled.",
          code: "const { filter = 'all' } = Route.useSearch()",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Channels is tapped",
          detail: "The chip gives a small bounce, 0.96 and a spring back; Reduce Motion skips it. A click or Space on the web.",
        },
        {
          kind: "event",
          title: "onPress fires",
          detail: "Each chip reports only that it was pressed; the row turns that into the filter's id.",
          code: "onPress?.()  // FilterChips: onPress={() => onChange(id)}",
        },
        {
          kind: "state",
          title: "The list re-sections",
          detail: "Channels drops the DMs and the CHANNELS / DMs labels, and the search box's placeholder becomes Search Channels. The row scrolls the chosen chip fully into view.",
          code: "messagesSections(rows.channelRows, rows.dmRows, filter, project, query)",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The route navigates to the new filter",
          detail: "The list is filtered from the cached query, so no request goes out.",
          code: "navigate({ search: (s) => ({ ...s, filter: 'channels' }) })",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The chosen chip fills at once",
          detail: "Ink on the chosen chip, white on the rest. Nothing slides between them: a sliding pill was tried and turned down (\"No smooth motion\").",
        },
        {
          kind: "result",
          title: "Only channels are listed",
          detail: "If none are left, the list says so in words, No channels yet, instead of showing an empty screen.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.md",
              paddingY: "$space.md",
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  gap: "$space.xs",
                  paddingX: "$gutter.pane",
                },
                children: [
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "All",
                      icon: "layout-grid",
                      selected: true,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Channels",
                      icon: "hash",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Project",
                      icon: "folder-kanban",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "DMs",
                      icon: "message-circle",
                      selected: false,
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  marginX: "$gutter.pane",
                },
                props: {
                  placeholder: "Search Conversations",
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "platform-eng",
                      icon: "hash",
                      count: 2,
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "design-crit",
                      icon: "hash",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Priya Raman",
                      leading: "avatar",
                      avatar: {
                        name: "Priya Raman",
                        identity: "indigo",
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.md",
              paddingY: "$space.md",
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  gap: "$space.xs",
                  paddingX: "$gutter.pane",
                },
                children: [
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "All",
                      icon: "layout-grid",
                      selected: true,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Channels",
                      icon: "hash",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Project",
                      icon: "folder-kanban",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "DMs",
                      icon: "message-circle",
                      selected: false,
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  marginX: "$gutter.pane",
                },
                props: {
                  placeholder: "Search Conversations",
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "platform-eng",
                      icon: "hash",
                      count: 2,
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "design-crit",
                      icon: "hash",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Priya Raman",
                      leading: "avatar",
                      avatar: {
                        name: "Priya Raman",
                        identity: "indigo",
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 2,
          press: 1,
          hold: 900,
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.md",
              paddingY: "$space.md",
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  gap: "$space.xs",
                  paddingX: "$gutter.pane",
                },
                children: [
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "All",
                      icon: "layout-grid",
                      selected: true,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Channels",
                      icon: "hash",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Project",
                      icon: "folder-kanban",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "DMs",
                      icon: "message-circle",
                      selected: false,
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  marginX: "$gutter.pane",
                },
                props: {
                  placeholder: "Search Conversations",
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "platform-eng",
                      icon: "hash",
                      count: 2,
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "design-crit",
                      icon: "hash",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Priya Raman",
                      leading: "avatar",
                      avatar: {
                        name: "Priya Raman",
                        identity: "indigo",
                      },
                    },
                  },
                ],
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
              width: 375,
              gap: "$space.md",
              paddingY: "$space.md",
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  gap: "$space.xs",
                  paddingX: "$gutter.pane",
                },
                children: [
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "All",
                      icon: "layout-grid",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Channels",
                      icon: "hash",
                      selected: true,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Project",
                      icon: "folder-kanban",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "DMs",
                      icon: "message-circle",
                      selected: false,
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  marginX: "$gutter.pane",
                },
                props: {
                  placeholder: "Search Channels",
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "platform-eng",
                      icon: "hash",
                      count: 2,
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "design-crit",
                      icon: "hash",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1800,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.md",
              paddingY: "$space.md",
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  gap: "$space.xs",
                  paddingX: "$gutter.pane",
                },
                children: [
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "All",
                      icon: "layout-grid",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Channels",
                      icon: "hash",
                      selected: true,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "Project",
                      icon: "folder-kanban",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      label: "DMs",
                      icon: "message-circle",
                      selected: false,
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  marginX: "$gutter.pane",
                },
                props: {
                  placeholder: "Search Channels",
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "platform-eng",
                      icon: "hash",
                      count: 2,
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "design-crit",
                      icon: "hash",
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "suggestion-asks-fabric",
      title: "A suggestion chip asks Fabric",
      description: "Under Home's composer, a suggestion is a question you haven't typed yet. Pressing it sends it as yours and Home becomes the conversation.",
      platforms: ["web", "desktop"],
      width: 520,
      steps: [
        {
          kind: "data",
          title: "Home offers three prompts",
          detail: "Fixed copy, not data: they are offers, so they are white with a hairline and never coral. The coral chip beside them, Set a ritual, is a real saved thing.",
          code: "const CHIPS = ['Draft an email', 'What’s due today?', 'Schedule a meeting']",
        },
        {
          kind: "trigger",
          title: "What's due today? is pressed",
          detail: "A click, or Enter / Space. Hover only moves the fill; nothing goes coral.",
        },
        {
          kind: "event",
          title: "onPress fires",
          code: "onPress?.()  // onClick={() => a.submitText(label)}",
        },
        {
          kind: "state",
          title: "The prompt becomes your message",
          detail: "The chip's label goes through the same submit as typing it. If a reply is still streaming the send is refused and the text waits in the composer.",
          code: "submitText: (t) => { set({ inputValue: t }); submit(t) }",
        },
        {
          kind: "state",
          title: "Home turns into the conversation",
          detail: "The chips leave with the empty composer: by now the conversation is the suggestion.",
          code: "set({ screen: 'home', chatMode: true, inputValue: '', attached: [], blobState: 'thinking' })",
        },
        {
          kind: "effect",
          title: "The question is sent",
          code: "live.send(text, refs, cards)",
        },
        {
          kind: "result",
          title: "Your question, and Fabric thinking",
          detail: "Your message sits at the top of a new conversation while Fabric works out what is due.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              width: 520,
              minHeight: 180,
              gap: "$space.md",
              justify: "flex-end",
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  wrap: "wrap",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      variant: "suggestion",
                      label: "Draft an email",
                      icon: "",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      variant: "suggestion",
                      label: "What’s due today?",
                      icon: "",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      variant: "suggestion",
                      label: "Schedule a meeting",
                      icon: "",
                      selected: false,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 1,
          press: 1,
          hold: 900,
          scene: {
            el: "view",
            style: {
              width: 520,
              minHeight: 180,
              gap: "$space.md",
              justify: "flex-end",
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  wrap: "wrap",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      variant: "suggestion",
                      label: "Draft an email",
                      icon: "",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      variant: "suggestion",
                      label: "What’s due today?",
                      icon: "",
                      selected: false,
                    },
                  },
                  {
                    el: "component",
                    use: "chip",
                    props: {
                      variant: "suggestion",
                      label: "Schedule a meeting",
                      icon: "",
                      selected: false,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 4,
          hold: 2000,
          scene: {
            el: "view",
            style: {
              width: 520,
              minHeight: 180,
              gap: "$space.md",
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "message",
                enter: "rise",
                props: {
                  author: "Arjun Mehta",
                  identity: "ochre",
                  time: "2:14 PM",
                  gutterTime: "2:14",
                  body: "What’s due today?",
                  reactions: [],
                  thread: {
                    count: 0,
                  },
                },
              },
              {
                el: "component",
                use: "typing-indicator",
                props: {
                  names: ["Fabric"],
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
