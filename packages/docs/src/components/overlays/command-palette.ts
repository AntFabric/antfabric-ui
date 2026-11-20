import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "command-palette",
  name: "Command palette",
  category: "overlays",
  level: "organism",
  status: "beta",
  description: "⌘K: one field that finds people, channels, projects, meetings and actions, grouped, with recent picks first. It drops from the top so the field never moves as results change, and Enter with no match hands the question to Fabric instead of failing.",
  props: {
    query: {
      type: "string",
      default: "",
    },
    placeholder: {
      type: "string",
      description: "The field's placeholder. Default: the `placeholder` string (\"Search\"); AntFabric's copy says \"Search people, channels, projects, or DM someone…\".",
    },
    filters: {
      type: "array",
      default: [],
      sample: ["All", "People", "Channels", "Projects", "Meetings"],
      description: "The filter pills under the field, one per entry. Empty draws no filter row. AntFabric's are its kinds; All is the resting state, not a fifth filter.",
    },
    filter: {
      type: "string",
      default: "",
      sample: "All",
      description: "The pill that is on. A value no filter names leaves all of them off.",
    },
    selected: {
      type: "string",
      default: "",
      description: "The key of the highlighted row, when it has moved off the row groups marks selected (pressing or arrowing to a row). Empty follows each row's own selected.",
    },
    ask: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Enter asks the agent when nothing matches: the ask row, the hint along the foot and the empty state's \"Press Enter to ask\". Off, the empty state is \"No matches\" and the foot has no hint.",
    },
    agentName: {
      type: "string",
      default: "",
      sample: "Fabric",
      description: "The agent's name. It only words the ask row, the empty state and the foot's hint, and names the agent's face; `ask` is what shows them.",
    },
    groups: {
      type: "array",
      description: "Result groups in order: Recent (only while the query is empty), People, Channels, Projects, Meetings, Actions. Each { key?, label, items }; an item is { key, label, hint, icon, avatar, identity, presence, agent, status, shortcut, webShortcut, selected }: avatar draws the label's face in the slot instead of icon.",
      default: [],
      sample: [
        {
          label: "Recent",
          items: [
            {
              key: "channel:release-train",
              icon: "hash",
              label: "release-train",
              hint: "Channel",
              selected: true,
            },
            {
              key: "person:kenji-watanabe",
              avatar: true,
              label: "Kenji Watanabe",
              identity: "indigo",
              presence: "active",
              status: "🚆 Release captain this week",
              hint: "Message",
            },
            {
              key: "project:atlas-mobile",
              icon: "folder-kanban",
              label: "Atlas Mobile",
              hint: "Project",
            },
          ],
        },
        {
          label: "People",
          items: [
            {
              key: "person:amara-okafor",
              avatar: true,
              label: "Amara Okafor",
              identity: "green",
              presence: "away",
              hint: "Message",
            },
            {
              key: "person:priya-raman-you",
              avatar: true,
              label: "Priya Raman (you)",
              identity: "red",
              presence: "active",
              hint: "Your space",
            },
            {
              key: "person:fabric",
              avatar: true,
              label: "Fabric",
              identity: "agent",
              agent: true,
              hint: "Assistant",
            },
          ],
        },
        {
          label: "Channels",
          items: [
            {
              key: "channel:platform-eng",
              icon: "hash",
              label: "platform-eng",
              hint: "Channel",
            },
            {
              key: "channel:design-crit",
              icon: "lock",
              label: "design-crit",
              hint: "Private channel",
            },
          ],
        },
        {
          label: "Meetings",
          items: [
            {
              key: "meeting:release-go-no-go",
              icon: "calendar",
              label: "Release go/no-go",
              hint: "Meeting · Thu 10:00",
            },
          ],
        },
        {
          label: "Actions",
          items: [
            {
              key: "action:new-message",
              icon: "square-pen",
              label: "New message",
              shortcut: "Mod+N",
              webShortcut: "Mod+Alt+N",
            },
            {
              key: "action:keyboard-shortcuts",
              icon: "keyboard",
              label: "Keyboard shortcuts",
              shortcut: "Mod+/",
            },
          ],
        },
      ],
    },
    loading: {
      type: "boolean",
      default: false,
      description: "The directory is still answering. Rows already known (from the cache) stay; a Searching row sits under them.",
    },
    offline: {
      type: "boolean",
      default: false,
    },
    showHints: {
      type: "boolean",
      default: true,
      description: "The keyboard hint strip at the foot.",
    },
    onQueryChange: {
      type: "event",
      args: "query: string",
      changes: "query",
    },
    onFilterChange: {
      type: "event",
      args: "filter: string",
      changes: "filter",
    },
    onSelect: {
      type: "event",
      args: "item: CommandPaletteItem",
    },
    onAsk: {
      type: "event",
      args: "query: string",
      description: "Enter with no row selected: the query goes to the agent (with `ask` on, named by agentName).",
    },
    onClose: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div role=\"dialog\"> on a 5px-blurred scrim: a combobox <input> (aria-activedescendant) over a role=\"listbox\" of option <button>s in labelled groups, with Avatar, Icon and Kbd in the rows; inline styles over `t`; ↑ ↓ Enter and Esc in the field; `query` through useControllable(query, onQueryChange) and `filter` through useControllable(filter, onFilterChange), `selected` kept inside; pops in with enter(\"pop\")",
      import: "import { CommandPalette } from \"@antfabric/ui-react\"",
      notes: [
        "Mod+K on Windows and Linux is Ctrl+K, which Chrome and Edge bind to \"search the web\" in the address bar and Firefox to its search field. A focused page can claim it, so the web listens on window in the capture phase and calls preventDefault — but the browser still wins whenever focus is in its own chrome (address bar, devtools) or the page has not been clicked since load.",
        "So the web also opens the palette with / whenever focus is not in a text field — a key no browser binds — and the search field in the rail is always one click away. The rail's tooltip names both: \"Search (Ctrl+K or /)\".",
        "Rows whose desktop shortcut the browser owns show the web alternative: New message is ⌘N on desktop (a new browser window on the web), so the web draws Mod+Alt+N.",
        "Recents live in localStorage for this origin and sync across open tabs through the storage event; opening the palette in one tab never opens it in another.",
        "Below 640px of viewport it is a full-screen search page, not a floating panel.",
      ],
      keyboard: [
        {
          keys: "Mod+K / /",
          action: "Opens (Mod+K toggles); / works only when focus is not in a text field",
        },
        {
          keys: "↑ / ↓",
          action: "Moves the highlighted row across groups; focus stays in the field (aria-activedescendant)",
        },
        {
          keys: "Enter",
          action: "Opens the highlighted row, or asks Fabric when nothing matches",
        },
        {
          keys: "Esc",
          action: "Clears the query if there is one, otherwise closes and returns focus",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same dialog as web at desktop density, drawing the desktop shortcut rather than webShortcut",
      import: "import { CommandPalette } from \"@antfabric/ui-react\"",
      notes: [
        "Drops from 14vh instead of centring, so the field stays put as the result count changes under it.",
        "Width is W_MODAL, imported rather than copied — the value moved five times in two days, and a literal here would have been left behind at every step. Height caps at 70vh and the list scrolls.",
        "Rows are one fixed height: a person's status sits inline after the name, never on a second line, so the list does not jump while typing.",
        "Recents come from lib/palette-recents (app data on disk) and resolve back through the live rows, so a recent that no longer exists cannot render.",
        "The rail's search field (\"Search people, channels, projects (⌘K)\") opens the same palette.",
        "In the catalogue the panel pops in over a fading scrim; pressing a kind pill sets `filter` and pressing a row moves the highlight to it (`selected`). Opening the row is the kit's.",
        "This spec adds the Actions group, the Ask Fabric row on no match, the footer hints and the offline note; today the empty state is the line \"No matches. Press Enter to ask Fabric\" alone.",
      ],
      keyboard: [
        {
          keys: "Mod+K",
          action: "Toggles the palette from anywhere, including inside the composer",
        },
        {
          keys: "↑ / ↓",
          action: "Moves the highlight; hovering a row moves the same highlight, so pointing and arrowing never disagree",
        },
        {
          keys: "Enter",
          action: "Runs the highlighted row and records it as a recent; with no match, hands the query to Fabric",
        },
        {
          keys: "Esc",
          action: "Closes",
        },
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "A phone has no ⌘K and no floating palette. Search is the field at the top of the Messages tab (\"Search Conversations\", and \"Search Channels\", \"Search Project Channels\", \"Search DMs\" on each filter), which narrows the list by name and project tag — never by message text, because the platform has no message-search endpoint. Finding a person to message is the New message sheet; a question in words goes to Fabric on the Assistant tab.",
    },
  },
  a11y: {
    role: "dialog",
    label: "Command palette",
    notes: [
      "The field is a combobox controlling the results listbox (aria-expanded is true while there are results or the ask row); rows are options with aria-selected, and aria-activedescendant moves with the arrows (to the ask row when it is the only row) so focus never leaves the field.",
      "Each group is a group named by its label. The number of results is announced politely 400 ms after typing pauses (\"6 results\", through the page's one polite live region), never per keystroke; the empty state says its own words in a status.",
      "Avatars and glyphs are decorative; a row's name says its kind: \"release-train, Channel\".",
      "Focus moves to the field when the palette mounts, Tab stays inside the panel, Esc clears the query and then closes, and focus returns to the opener when the palette unmounts. The Esc chip, the footer hints and the busy spinners are hidden from assistive tech (the loading line says it).",
    ],
  },
  examples: [
    {
      name: "Opened, nothing typed",
      description: "Recent first, then each kind, then actions.",
    },
    {
      name: "Typing",
      props: {
        query: "rel",
        groups: [
          {
            label: "People",
            items: [
              {
                key: "person:relja-petrovi",
                avatar: true,
                label: "Relja Petrović",
                identity: "ochre",
                presence: "offline",
                hint: "Message",
              },
            ],
          },
          {
            label: "Channels",
            items: [
              {
                key: "channel:release-train",
                icon: "hash",
                label: "release-train",
                hint: "Channel",
                selected: true,
              },
              {
                key: "channel:release-notes",
                icon: "hash",
                label: "release-notes",
                hint: "Channel",
              },
            ],
          },
          {
            label: "Projects",
            items: [
              {
                key: "project:release-tooling",
                icon: "folder-kanban",
                label: "Release tooling",
                hint: "Project",
              },
            ],
          },
          {
            label: "Meetings",
            items: [
              {
                key: "meeting:release-go-no-go",
                icon: "calendar",
                label: "Release go/no-go",
                hint: "Meeting · Thu 10:00",
              },
            ],
          },
        ],
      },
    },
    {
      name: "Filtered to people",
      props: {
        query: "a",
        filter: "People",
        groups: [
          {
            label: "People",
            items: [
              {
                key: "person:amara-okafor",
                avatar: true,
                label: "Amara Okafor",
                identity: "green",
                presence: "away",
                hint: "Message",
                selected: true,
              },
              {
                key: "person:aisha-bello",
                avatar: true,
                label: "Aisha Bello",
                identity: "ochre",
                presence: "dnd",
                status: "🎧 Heads down until 4",
                hint: "Message",
              },
              {
                key: "person:arjun-mehta",
                avatar: true,
                label: "Arjun Mehta",
                identity: "indigo",
                presence: "active",
                hint: "Message",
              },
            ],
          },
        ],
      },
    },
    {
      name: "Without hints",
      props: {
        showHints: false,
      },
    },
  ],
  edgeCases: [
    {
      title: "Nothing matches",
      platforms: ["web", "desktop"],
      handling: "Not a dead end: the empty state says so and offers Ask Fabric as the selected row, so Enter sends the query to the assistant. Copy: \"No matches. Press Enter to ask Fabric\".",
      example: {
        name: "No matches",
        props: {
          query: "quarterly okr doc",
          groups: [],
        },
      },
    },
    {
      title: "The directory is slow",
      platforms: ["web", "desktop"],
      handling: "Channels and projects come from the local cache at once; people wait on the directory. After 300 ms a \"Searching people…\" row appears under what is known (and stays at least 400 ms). After 8 s it reads \"Still searching — showing people on this device\". The highlight never jumps when late rows arrive above it: it stays on the row it was on.",
      example: {
        name: "Searching",
        props: {
          query: "pri",
          loading: true,
          groups: [
            {
              label: "Channels",
              items: [
                {
                  key: "channel:priority-bugs",
                  icon: "hash",
                  label: "priority-bugs",
                  hint: "Channel",
                  selected: true,
                },
              ],
            },
          ],
        },
      },
    },
    {
      title: "Offline",
      platforms: ["web", "desktop"],
      handling: "The desktop searches its SQLite cache and says so in one line; the web searches what this tab already loaded. Opening a result works from the cache; Ask Fabric is disabled until the connection returns.",
      example: {
        name: "Offline",
        props: {
          query: "des",
          offline: true,
          groups: [
            {
              label: "People",
              items: [
                {
                  key: "person:desmond-achebe",
                  avatar: true,
                  label: "Desmond Achebe",
                  identity: "green",
                  presence: "none",
                  hint: "Message",
                  selected: true,
                },
              ],
            },
            {
              label: "Channels",
              items: [
                {
                  key: "channel:design-crit",
                  icon: "lock",
                  label: "design-crit",
                  hint: "Private channel",
                },
              ],
            },
          ],
        },
      },
    },
    {
      title: "Typing with an input method (Japanese, Chinese, Korean)",
      platforms: ["web", "desktop"],
      handling: "Enter during composition (isComposing, or keyCode 229 in WebKit) commits the characters and never runs a row; search runs on the committed text only, so a half-composed query does not flash results.",
    },
    {
      title: "Ctrl+K belongs to the browser",
      platforms: ["web"],
      handling: "The page claims Ctrl+K when it has focus; when it does not (address bar focused, devtools, fresh tab never clicked) the browser's search wins. / is the fallback no browser owns, and the rail's search field always works. Never advertise a shortcut that only sometimes works without its alternative beside it.",
    },
    {
      title: "Changing the filter",
      platforms: ["web", "desktop"],
      handling: "The highlight resets to the first row. Kept at its old index, it would land on a different row than the one it was on, and Enter would open that.",
      example: {
        name: "Filter reset",
        props: {
          query: "a",
          filter: "Channels",
          groups: [
            {
              label: "Channels",
              items: [
                {
                  key: "channel:android-builds",
                  icon: "hash",
                  label: "android-builds",
                  hint: "Channel",
                  selected: true,
                },
                {
                  key: "channel:atlas-mobile",
                  icon: "hash",
                  label: "atlas-mobile",
                  hint: "Channel",
                },
              ],
            },
          ],
        },
      },
    },
    {
      title: "A recent that no longer exists",
      platforms: ["web", "desktop"],
      handling: "A channel you left, an archived project, a deactivated person: recents resolve through the live rows, so they drop out silently instead of rendering a row that opens nothing. The recent is pruned on the next save.",
    },
    {
      title: "Long names and statuses",
      platforms: ["web", "desktop"],
      handling: "The status truncates first, then the name; the kind hint on the right never truncates. Rows keep one height.",
      example: {
        name: "Long name",
        props: {
          query: "plat",
          groups: [
            {
              label: "Channels",
              items: [
                {
                  key: "channel:platform-eng-incident-review-2026-q4-follow-ups-and-postmortems",
                  icon: "hash",
                  label: "platform-eng-incident-review-2026-q4-follow-ups-and-postmortems",
                  hint: "Channel",
                  selected: true,
                },
                {
                  key: "person:platon-vasilievich-dobrovolsky-andersen",
                  avatar: true,
                  label: "Platon Vasilievich Dobrovolsky-Andersen",
                  identity: "ink",
                  presence: "active",
                  status: "📍 Working from the Lisbon office through the end of November",
                  hint: "Message",
                },
              ],
            },
          ],
        },
      },
    },
    {
      title: "Opened while something else is open",
      platforms: ["web", "desktop"],
      handling: "Mod+K does nothing while a modal dialog is open — the dialog owns the keyboard. An open menu closes on the way in. The shortcuts card (Mod+/) closes the palette on its way in, so the two are never stacked.",
    },
    {
      title: "Reduced motion, dark mode",
      platforms: ["web", "desktop"],
      handling: "With reduced motion the panel appears without the rise. In dark mode the highlight is the dark hover surface, and an avatar's presence ring follows the row's background so the selected row never shows a pale disc behind the dot.",
    },
  ],
  related: ["dialog", "kbd", "search-field"],
  flows: [
    {
      id: "jump-to-a-channel",
      title: "⌘K, type a few letters, open a channel",
      description: "The palette searches what the app already holds, so results move with every keystroke. Opening a row records it as a recent, closes the palette and goes there.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "Rows are built from the store on every keystroke",
          detail: "People from the live directory (you included; deleted accounts and service users left out), the channels you are in minus project transcripts, projects, and meetings from the calendar. Recents are read from disk each time it opens, so two windows never overwrite each other's list.",
          code: "channelRows.map((c) => ({ id: c, name: s.channelInfo[c]?.name ?? c })).filter((c) => match(c.name))  ·  store.load().then(setRecents)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "Rows come from queries the shell already holds",
          detail: "The channel list and the people directory are TanStack Query caches the sidebar filled, so typing filters in memory with no request. Recents live in localStorage and follow other tabs through the storage event.",
          code: "const { data: channels } = useQuery(channelQueries.mine())  // filtered by the query, in memory",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "⌘K, or the rail's Search",
          detail: "Ctrl+K on Windows and Linux. It toggles from anywhere, the composer included. The web also opens it with / outside a text field, because the browser can own Ctrl+K.",
          code: "if (fires('palette')) { e.preventDefault(); if (s.paletteOpen) a.closePalette(); else a.openPalette() }",
        },
        {
          kind: "state",
          title: "The store opens it, empty",
          detail: "A fresh query with the first row highlighted. The notification rail and the profile menu close on the way in, so two overlays never compete for Escape.",
          code: "openPalette: () => set({ paletteOpen: true, paletteQuery: '', paletteIndex: 0, notifOpen: false, railOpen: false, profileOpen: false })",
        },
        {
          kind: "motion",
          title: "The scrim fades and the panel pops near the top",
          detail: "It hangs 14vh from the top rather than centring, so the field stays put as the result count changes. Today the scrim and panel rise together (af-rise); this spec fades the scrim and pops the panel. Focus lands in the field 40 ms after it opens.",
          enter: "pop",
        },
        {
          kind: "event",
          title: "Typing fires onQueryChange",
          detail: "Every keystroke refilters each group and puts the highlight back on the first row, so Enter never opens something you didn't look at.",
          code: "onQueryChange?.('plat')  →  setPaletteQuery: (v) => set({ paletteQuery: v, paletteIndex: 0 })",
        },
        {
          kind: "trigger",
          title: "#platform-eng is chosen",
          detail: "Enter on the highlighted row, or a click. Hovering a row moves the same highlight the arrows do, so pointing and arrowing never disagree.",
        },
        {
          kind: "event",
          title: "onSelect fires with the row",
          code: "onSelect?.(item)  // { key: \"channel:platform-eng\", label: \"platform-eng\", hint: \"Channel\" }",
        },
        {
          kind: "effect",
          title: "It is remembered, then run",
          detail: "The row goes to the front of Recent and is written to disk without waiting. Its own action then closes the palette and opens the channel.",
          code: "const next = remember(recents, row.recent); setRecents(next); void store.save(next); row.run()  // closePalette(); setWsMode('channels'); selectChannel(c.id)",
        },
        {
          kind: "result",
          title: "#platform-eng is open",
          detail: "The trail reads Channels \\ #platform-eng. Escape instead closes the palette and changes nothing; on the web it first clears a query if there is one.",
        },
      ],
      replay: [
        {
          step: 2,
          press: "Search people, channels, projects",
          hold: 1100,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 680,
              minHeight: 620,
              gap: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "release-train",
                      label: "#release-train",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  width: 240,
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
          step: 4,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 680,
              minHeight: 620,
              gap: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "release-train",
                      label: "#release-train",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  width: 240,
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
                  alignSelf: "stretch",
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1500,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 680,
              minHeight: 620,
              gap: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "release-train",
                      label: "#release-train",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  width: 240,
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
                  alignSelf: "stretch",
                },
                props: {
                  query: "plat",
                  groups: [
                    {
                      label: "Channels",
                      items: [
                        {
                          key: "channel:platform-eng",
                          icon: "hash",
                          label: "platform-eng",
                          hint: "Channel",
                          selected: true,
                        },
                        {
                          key: "channel:platform-oncall",
                          icon: "lock",
                          label: "platform-oncall",
                          hint: "Private channel",
                        },
                      ],
                    },
                    {
                      label: "Projects",
                      items: [
                        {
                          key: "project:platform-migration",
                          icon: "folder-kanban",
                          label: "Platform Migration",
                          hint: "Project",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 6,
          press: "platform-eng, Channel",
          hold: 1000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 680,
              minHeight: 620,
              gap: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "release-train",
                      label: "#release-train",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  width: 240,
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
                  alignSelf: "stretch",
                },
                props: {
                  query: "plat",
                  groups: [
                    {
                      label: "Channels",
                      items: [
                        {
                          key: "channel:platform-eng",
                          icon: "hash",
                          label: "platform-eng",
                          hint: "Channel",
                          selected: true,
                        },
                        {
                          key: "channel:platform-oncall",
                          icon: "lock",
                          label: "platform-oncall",
                          hint: "Private channel",
                        },
                      ],
                    },
                    {
                      label: "Projects",
                      items: [
                        {
                          key: "project:platform-migration",
                          icon: "folder-kanban",
                          label: "Platform Migration",
                          hint: "Project",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 680,
              minHeight: 620,
              gap: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "breadcrumbs",
                props: {
                  items: [
                    {
                      key: "channels",
                      label: "Channels",
                    },
                    {
                      key: "platform-eng",
                      label: "#platform-eng",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "search-field",
                style: {
                  width: 240,
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
      ],
    },
    {
      id: "ask-fabric",
      title: "No match hands the question to Fabric",
      description: "A palette that finds nothing doesn't dead-end. The question goes to the assistant, which answers from the workspace.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "trigger",
          title: "A question that matches no name",
          detail: "when does 4.12 ship? finds no person, channel, project or meeting, so the list says so and offers Ask Fabric as the highlighted row.",
        },
        {
          kind: "state",
          title: "With no rows, Enter falls through",
          detail: "There is no highlighted row to open, so Enter hands over the query instead. An empty query matches everything, so this only happens when the list really is empty.",
          code: "const chosen = cursor >= 0 ? flat[cursor] : undefined; if (chosen) recordAndRun(chosen); else a.submitPalette()",
        },
        {
          kind: "trigger",
          title: "Enter, or a click on Ask Fabric",
        },
        {
          kind: "event",
          title: "onAsk fires with the query",
          code: "onAsk?.('when does 4.12 ship?')",
        },
        {
          kind: "effect",
          title: "The assistant takes the question",
          detail: "The palette closes, the screen switches to the assistant in chat mode and the text is submitted as your message. A blank query does nothing.",
          code: "submitPalette: () => { const q = (get().paletteQuery || '').trim(); if (!q) return; set({ paletteOpen: false, screen: 'home', chatMode: true, voiceMode: false, inputValue: '' }); deps.submitText(q) }",
        },
        {
          kind: "result",
          title: "Your question is sent and Fabric answers under it",
          detail: "Offline, Ask Fabric is disabled until the connection returns; the people and channels on this device still open.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1500,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 680,
              minHeight: 620,
              gap: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "command-palette",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  query: "when does 4.12 ship?",
                  groups: [],
                },
              },
            ],
          },
        },
        {
          step: 2,
          press: "Ask Fabric: when does 4.12 ship?",
          hold: 1000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 680,
              minHeight: 620,
              gap: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "command-palette",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  query: "when does 4.12 ship?",
                  groups: [],
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1700,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 680,
              minHeight: 620,
              gap: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "10:42 AM",
                  body: "when does 4.12 ship?",
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
