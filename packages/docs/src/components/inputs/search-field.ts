import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "search-field",
  name: "Search field",
  category: "inputs",
  level: "molecule",
  status: "stable",
  description: "The app's one search box: a recessed field with the glass at the start and one trailing slot that is either a clear button or a keyboard hint, never both. A slow search turns the glass into a spinner so the clear button stays put. The desktop rail's search is this field drawn as a button that opens the command palette.",
  props: {
    value: {
      type: "string",
      default: "",
      description: "Controlled when the caller passes onValueChange: the field shows `value` and asks for every change, and clearing is the caller's job (the ✕ reports onValueChange(\"\") then onClear()). Given no onValueChange, the field keeps its own text.",
    },
    placeholder: {
      type: "string",
      default: "",
      sample: "Search channels and DMs",
      description: "Say what is searched, not \"Search\" — the field is the only hint of what a screen holds.",
    },
    label: {
      type: "string",
      default: "",
      description: "Accessible name when it should differ from the placeholder. Falls back to a FormField's label, then the placeholder.",
    },
    shortcut: {
      type: "string",
      default: "",
      platforms: ["web", "desktop"],
      description: "A key that focuses or opens this search, written once as Mod+K or /. Drawn as a key in the trailing slot, hidden at rest and while there is text to clear.",
    },
    busy: {
      type: "boolean",
      default: false,
      description: "A search is in flight: the glass becomes a spinner. Off for instant filtering — a spinner that flickers on every keystroke is worse than none.",
    },
    accent: {
      type: "boolean",
      default: false,
      description: "Mark the edge while the field holds text — for a box narrowing a list you can see, where \"why is this list short\" is a real question.",
    },
    launcher: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "Draw the field as a button that opens the command palette, like the desktop nav rail. A real input there would have to duplicate the palette's filtering or throw its first keystroke away.",
    },
    focused: {
      type: "boolean",
      default: false,
      description: "Draws the focused look (edge and shortcut hint) without real focus — for the catalogue and screenshots.",
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    onValueChange: {
      type: "event",
      args: "value: string",
      changes: "value",
    },
    onClear: {
      type: "event",
      description: "The ✕ was pressed (or Escape with text in the box), after onValueChange(\"\").",
    },
    onSubmit: {
      type: "event",
      description: "Enter on web and desktop; the keyboard's Search key on the phone.",
    },
    onPress: {
      type: "event",
      platforms: ["web", "desktop"],
      description: "launcher only — opens the command palette.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<input type=\"text\" role=\"searchbox\" data-af-input> in a drawn box, inline styles over `t`; hover and focus-within from useInteraction; the ✕ is IconButton and the hint is Kbd, faded in on hover and focus while it holds its box; Escape clears then blurs, Enter calls onSubmit; launcher is a <button aria-haspopup=\"dialog\"> laid over the whole field; `value` through useControllable",
      import: "import { SearchField } from \"@antfabric/ui-react\"",
      notes: [
        "type=\"text\" with role=\"searchbox\", NOT type=\"search\": WebKit draws its own cancel ✕ beside ours as a shadow pseudo-element the kit cannot style (the owner: \"I see two close icons\").",
        "Mod+K is not browser-reserved — a page may claim it, as Slack, GitHub and Linear do — so the web keeps ⌘K/Ctrl+K. It only works while the page has focus; from the address bar the browser keeps it.",
        "Offline, the web has no local index: the results area says \"You're offline. Search needs a connection.\" and the field stays usable for when it returns.",
        "Pressing the field sets `focused` (the edge fades in, and the shortcut hint shows when there is one); pressing the ✕ sets `value` to \"\". Both are `on.press` actions, so the catalogue preview is interactive.",
      ],
      keyboard: [
        {
          keys: "Mod+K",
          action: "Opens the command palette (launcher) from anywhere in the app",
        },
        {
          keys: "/",
          action: "Focuses the page's own search, only when no editable element has focus",
        },
        {
          keys: "Escape",
          action: "First press clears the query; second press blurs the field",
        },
        {
          keys: "Enter",
          action: "Runs the search when results are not instant; otherwise opens the highlighted result",
        },
        {
          keys: "ArrowDown",
          action: "Moves into the results list",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same field as web, one geometry (36px, --radius-control); the rail launcher is the same <button> drawn as this field",
      import: "import { SearchField } from \"@antfabric/ui-react\"",
      notes: [
        "ONE geometry since 2026-09-25 (owner: \"All the search field should have same height and same bg fill\"): 36px, --radius-control, 16px glass inset 12px, 13px medium text. The old sm/lg sizes resolve to it.",
        "Rest is --hover-surface and hover LIFTS to --surface-raised (the owner swapped them the same day). Focus is a 2px border.active edge and no halo; the hairline shadow is under every state, so the field never appears to lift on focus.",
        "The ⌘K hint is hidden at rest and fades in (opacity, 120ms) on hover or focus, holding its box so the placeholder never stretches into the space. The catalogue draws it when focused is set.",
        "accent + text gives a 1px border.active edge — one step under focus's 2px. Width is the only thing separating the two now the halo is gone; do not give accent the thick edge.",
        "Offline, desktop searches its SQLite cache and the results header says \"Showing results on this device.\"",
        "The nav rail's Search is launcher: a button titled \"Search people, channels, projects (⌘K)\" opening the palette. Collapsed, the rail shows it as a bare glass icon button.",
        "Pressing the field sets `focused` and the border.active edge fades in over 150ms; the ✕ clears `value`. The launcher has no catalogue action: it opens the palette.",
      ],
      keyboard: [
        {
          keys: "Mod+K",
          action: "Opens the command palette",
        },
        {
          keys: "Escape",
          action: "Clears the query, then blurs",
        },
        {
          keys: "ArrowDown",
          action: "Moves into the results list",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "TextInput with returnKeyType=\"search\" (onSubmitEditing → onSubmit) in a View over a StyleSheet from useTheme(); focus is a 1pt inset boxShadow ring over the 1pt edge; the ✕ is IconButton; `value` through useControllable. No shortcut hint or launcher on the phone",
      import: "import { SearchField } from \"@antfabric/ui-react-native\"",
      notes: [
        "V2's search box: 44pt, 12pt corners, a hairline Rim and NO shadow, filled surface.hover; a 20pt glass in text.faint; 16pt medium text. Focus is the same 2pt border.active edge.",
        "This spec adds the clear ✕ on the phone (32pt box with hitSlop to 44pt) — today's SearchInput has none.",
        "Used as a screen subheader through SearchBar: outside the scroll view, so it stays put while the list moves under it. A filter button sits BESIDE the field, never inside — inside reads as a clear button.",
        "No shortcut hint on the phone. On iPad with a keyboard, ⌘F focuses it through a UIKeyCommand.",
        "Tapping the field sets `focused` (the 2pt edge fades in); tapping the ✕ clears `value` and keeps the keyboard up.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Focuses and raises the keyboard with a Search return key",
        },
        {
          gesture: "Drag the list",
          action: "Dismisses the keyboard (keyboardDismissMode on-drag); the query and filter stay",
        },
      ],
    },
  },
  a11y: {
    role: "searchbox",
    label: "{label || FormField label || placeholder}",
    notes: [
      "The glass is decoration. While busy it becomes a progressbar named by strings.search-field.loading (\"Loading\"; a product that wants \"Searching\" sets it).",
      "Enter submits and Escape clears the text, then blurs on the second press. When the clear button goes away with the text, focus moves to the field.",
      "Inside a FormField with no label of its own, the field's visible label names it (never the placeholder, WCAG 2.5.3), and it takes the field's description, error, aria-invalid and aria-required. Result counts are the product's to announce.",
    ],
  },
  examples: [
    {
      name: "Sidebar",
      props: {},
      width: 260,
    },
    {
      name: "Focused with hint",
      props: {
        placeholder: "Search tasks",
        shortcut: "/",
        focused: true,
      },
      platforms: ["web", "desktop"],
      width: 280,
    },
    {
      name: "With text",
      props: {
        placeholder: "Search people",
        value: "Nkechi",
      },
      width: 280,
    },
    {
      name: "Filtering a list",
      description: "accent marks the edge while the box narrows a visible list.",
      props: {
        placeholder: "Search tasks",
        value: "flaky test",
        accent: true,
      },
      width: 280,
    },
    {
      name: "Searching",
      props: {
        placeholder: "Search messages",
        value: "Q4 roadmap",
        busy: true,
      },
      width: 280,
    },
    {
      name: "Rail launcher",
      props: {
        launcher: true,
        placeholder: "Search",
        label: "Search people, channels, projects",
        shortcut: "Mod+K",
      },
      platforms: ["web", "desktop"],
      width: 220,
    },
    {
      name: "Rail launcher, focused",
      props: {
        launcher: true,
        placeholder: "Search",
        label: "Search people, channels, projects",
        shortcut: "Mod+K",
        focused: true,
      },
      platforms: ["web", "desktop"],
      width: 220,
    },
    {
      name: "Phone",
      props: {
        placeholder: "Search people",
      },
      platforms: ["mobile"],
      width: 360,
    },
  ],
  matrix: [
    {
      prop: "busy",
    },
    {
      prop: "accent",
    },
  ],
  states: ["hover", "focus", "disabled"],
  edgeCases: [
    {
      title: "A slow search",
      platforms: ["web", "desktop", "mobile"],
      handling: "busy is set only for searches that go to the server, after 300 ms, and held at least 400 ms. The GLASS becomes the spinner, not the trailing slot, so the ✕ stays where it is — a search taking eleven seconds is exactly the one somebody wants to cancel. Still busy after 8 s, the results area says \"Still searching…\"; a failure says \"Search didn't finish. Try again.\" with a Retry.",
      example: {
        name: "Busy",
        props: {
          placeholder: "Search messages",
          value: "incident 4471 postmortem",
          busy: true,
        },
        width: 300,
      },
    },
    {
      title: "Two clear buttons",
      platforms: ["web", "desktop"],
      handling: "The input is type=\"text\" with role=\"searchbox\". type=\"search\" makes WebKit draw its own ✕ next to ours; appearance:none does not remove it. Do not tidy the type back.",
    },
    {
      title: "Offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "Desktop searches its local SQLite cache and labels the results \"Showing results on this device.\" The phone filters what is already loaded and says so in the same words. The web has no cache and says \"You're offline. Search needs a connection.\" The field itself never disables — what was typed runs when the connection returns.",
    },
    {
      title: "IME composition",
      platforms: ["web", "desktop", "mobile"],
      handling: "Searching waits for compositionend: while a Japanese, Chinese or Korean IME is composing, no query is sent and Enter confirms the candidate instead of submitting.",
    },
    {
      title: "A long query",
      platforms: ["web", "desktop", "mobile"],
      handling: "The text scrolls inside the field; the ✕ stays visible at the end. Queries are trimmed and capped at 256 characters before they are sent.",
      example: {
        name: "Long query",
        props: {
          placeholder: "Search messages",
          value: "from:@priya in:#release-train \"rollback plan\" before:2026-10-01",
        },
        width: 260,
      },
    },
    {
      title: "/ and ⌘K while typing elsewhere",
      platforms: ["web", "desktop"],
      handling: "/ focuses search only when no editable element has focus, so typing a / in the composer stays a slash. Mod+K works everywhere, including from the composer, because it has no meaning in text.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "44pt is a minimum; the field grows with the text and the glass stays centred on the first line. The placeholder truncates rather than wrapping.",
    },
    {
      title: "Screen reader result counts",
      platforms: ["web", "desktop", "mobile"],
      handling: "The count is announced once typing pauses, never per keystroke. Clearing returns focus to the field and announces \"Search cleared\".",
    },
  ],
  related: ["text-field", "command-palette", "select"],
  flows: [
    {
      id: "narrow-a-list",
      title: "Type to narrow a list, ✕ to clear",
      description: "The field is fully controlled: the screen keeps the query, filters what it already holds, and empties the query when ✕ is pressed.",
      platforms: ["web", "desktop", "mobile"],
      width: 375,
      steps: [
        {
          kind: "data",
          title: "Recordings owns the query",
          detail: "The search applies after the tab filter, never instead of it: All searches everything, Desktop searches the desktop recordings.",
          code: "const [query, setQuery] = useState('')  ·  const shown = searchRows(filterRows(rows, filter), query)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The Messages tab owns the query",
          detail: "Its placeholder names what is searched and follows the chip above it: Search Conversations, Search Channels, Search DMs.",
          code: "const [query, setQuery] = useState('')  // <SearchInput placeholder={PLACEHOLDER[filter]} value={query} onChangeText={setQuery} />",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The query is a search param",
          detail: "Written to the URL after a short pause, so a shared link carries the search. The rows come from the list query already in cache.",
          code: "const { q = '' } = Route.useSearch()",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Someone types",
          detail: "Every keystroke. During IME composition the value only commits when the word is chosen.",
        },
        {
          kind: "event",
          title: "onValueChange(value) fires",
          code: "onValueChange?.(value)  // 'desktop'",
        },
        {
          kind: "state",
          title: "The list is filtered where it is",
          detail: "No request per keystroke: both apps filter what they already hold, so busy stays off and no spinner flickers.",
          code: "searchRows(filterRows(rows, filter), query)  ·  messagesSections(channelRows, dmRows, filter, project, query)",
        },
        {
          kind: "result",
          title: "Only matches remain, or a sentence naming the query",
          detail: "An empty result says what was searched for and what search looks at, never just Nothing here.",
          code: "`No conversation matches “${query.trim()}”.`",
        },
        {
          kind: "trigger",
          title: "✕ is pressed",
          detail: "The ✕ shows only while there is text. Today's phone SearchInput has none, so clearing means deleting; this spec adds it.",
        },
        {
          kind: "event",
          title: "onClear() fires",
          detail: "The field doesn't clear itself; the screen empties its own query.",
          code: "onClear?.()  // onClear={() => setQuery('')}",
        },
        {
          kind: "result",
          title: "The whole list is back",
          detail: "The field keeps focus, and on the phone the keyboard stays up, so the next search starts straight away.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1200,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search by date, device, status or project…",
                  label: "Search recordings",
                  value: "",
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Design crit",
                      subtitle: "Tue 28 Oct · Desktop · Transcribed",
                      icon: "mic",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Release train standup",
                      subtitle: "Mon 27 Oct · Mobile · Transcribed",
                      icon: "mic",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "1:1 with Kwame",
                      subtitle: "Fri 24 Oct · Desktop · Not transcribed",
                      icon: "mic",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1200,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search by date, device, status or project…",
                  label: "Search recordings",
                  value: "",
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Design crit",
                      subtitle: "Tue 28 Oct · Desktop · Transcribed",
                      icon: "mic",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Release train standup",
                      subtitle: "Mon 27 Oct · Mobile · Transcribed",
                      icon: "mic",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "1:1 with Kwame",
                      subtitle: "Fri 24 Oct · Desktop · Not transcribed",
                      icon: "mic",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1700,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search by date, device, status or project…",
                  label: "Search recordings",
                  value: "desktop",
                  focused: true,
                  accent: true,
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Design crit",
                      subtitle: "Tue 28 Oct · Desktop · Transcribed",
                      icon: "mic",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "1:1 with Kwame",
                      subtitle: "Fri 24 Oct · Desktop · Not transcribed",
                      icon: "mic",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 7,
          press: 0,
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search by date, device, status or project…",
                  label: "Search recordings",
                  value: "desktop",
                  focused: true,
                  accent: true,
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Design crit",
                      subtitle: "Tue 28 Oct · Desktop · Transcribed",
                      icon: "mic",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "1:1 with Kwame",
                      subtitle: "Fri 24 Oct · Desktop · Not transcribed",
                      icon: "mic",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1600,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search by date, device, status or project…",
                  label: "Search recordings",
                  value: "",
                  focused: true,
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Design crit",
                      subtitle: "Tue 28 Oct · Desktop · Transcribed",
                      icon: "mic",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Release train standup",
                      subtitle: "Mon 27 Oct · Mobile · Transcribed",
                      icon: "mic",
                    },
                  },
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "1:1 with Kwame",
                      subtitle: "Fri 24 Oct · Desktop · Not transcribed",
                      icon: "mic",
                    },
                  },
                ],
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
              width: 375,
              gap: "$space.sm",
              paddingX: "$gutter.pane",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search Conversations",
                  value: "",
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
                      title: "Kwame Mensah",
                      leading: "avatar",
                      avatar: {
                        name: "Kwame Mensah",
                        identity: "green",
                      },
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
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.sm",
              paddingX: "$gutter.pane",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search Conversations",
                  value: "Kwa",
                  focused: true,
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Kwame Mensah",
                      leading: "avatar",
                      avatar: {
                        name: "Kwame Mensah",
                        identity: "green",
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 7,
          press: 0,
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.sm",
              paddingX: "$gutter.pane",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search Conversations",
                  value: "Kwa",
                  focused: true,
                },
              },
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "list-item",
                    props: {
                      title: "Kwame Mensah",
                      leading: "avatar",
                      avatar: {
                        name: "Kwame Mensah",
                        identity: "green",
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1600,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 375,
              gap: "$space.sm",
              paddingX: "$gutter.pane",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                props: {
                  placeholder: "Search Conversations",
                  value: "",
                  focused: true,
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
                      title: "Kwame Mensah",
                      leading: "avatar",
                      avatar: {
                        name: "Kwame Mensah",
                        identity: "green",
                      },
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
      id: "launcher-opens-palette",
      title: "The rail's Search opens ⌘K",
      description: "In the nav rail the field is a launcher: it looks like a search box, but pressing it, or ⌘K anywhere, opens the command palette where the typing happens.",
      platforms: ["web", "desktop"],
      width: 600,
      steps: [
        {
          kind: "data",
          title: "The rail draws Search as a button",
          detail: "A real input here would have to repeat the palette's filtering or throw the first keystroke away. Collapsed, the rail shows it as a bare glass icon.",
          code: "<button onClick={a.openPalette} title=\"Search people, channels, projects (⌘K)\" aria-label=\"Search people, channels and projects\">",
        },
        {
          kind: "trigger",
          title: "Search is clicked, or ⌘K pressed",
          detail: "⌘K works from anywhere in the window, and pressed again it closes the palette. On the web it only works while the page has focus.",
          code: "if (fires('palette')) { e.preventDefault(); if (s.paletteOpen) a.closePalette(); else a.openPalette() }",
        },
        {
          kind: "event",
          title: "onPress fires",
          code: "onPress?.()  // onClick={a.openPalette}",
        },
        {
          kind: "state",
          title: "The store opens a fresh palette",
          detail: "Every open starts empty on the first row, and the notification rail and the profile card close so only one overlay is up.",
          code: "openPalette: () => set({ paletteOpen: true, paletteQuery: '', paletteIndex: 0, notifOpen: false, railOpen: false, profileOpen: false })",
        },
        {
          kind: "motion",
          title: "The scrim blurs and the palette pops in",
          detail: "Today the blurred scrim and the panel rise together (af-rise, base duration); the library's palette pops. Focus goes straight to its search box.",
          enter: "pop",
        },
        {
          kind: "result",
          title: "Typing goes to the palette",
          detail: "Recent items are read again on every open, so two windows never overwrite each other's list. Escape or a click on the scrim closes it.",
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
              width: 600,
              minHeight: 460,
              padding: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                style: {
                  width: 220,
                },
                props: {
                  launcher: true,
                  placeholder: "Search",
                  label: "Search people, channels, projects",
                  shortcut: "Mod+K",
                },
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
              width: 600,
              minHeight: 460,
              padding: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                style: {
                  width: 220,
                },
                props: {
                  launcher: true,
                  placeholder: "Search",
                  label: "Search people, channels, projects",
                  shortcut: "Mod+K",
                  focused: true,
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 2200,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 600,
              minHeight: 460,
              padding: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "search-field",
                style: {
                  width: 220,
                },
                props: {
                  launcher: true,
                  placeholder: "Search",
                  label: "Search people, channels, projects",
                  shortcut: "Mod+K",
                },
              },
              {
                el: "component",
                use: "command-palette",
                style: {
                  position: "absolute",
                  inset: 0,
                },
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
