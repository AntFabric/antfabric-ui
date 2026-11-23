import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "select",
  name: "Select",
  category: "inputs",
  level: "molecule",
  status: "stable",
  description: "Pick one value from a list. On web and desktop a trigger opens a panel drawn by this design — never the OS's own popup — the trigger's width, with the chosen row marked by a brand-coloured dot. On the phone the same trigger opens a bottom sheet of 52pt rows instead of a dropdown.",
  props: {
    items: {
      type: "array",
      required: true,
      description: "[{ key, label, supportingText?, icon?, color?, avatar?, identity?, agent?, disabled? }]. supportingText sits muted on the SAME line. One leading slot: icon (tinted by color, a token) or avatar (a photo URL; \"\" draws initials).",
      sample: [
        {
          key: "priya",
          label: "Priya Raman",
          supportingText: "@priya",
          avatar: "",
          identity: "indigo",
        },
        {
          key: "tomas",
          label: "Tomás Herrera",
          supportingText: "@tomas",
          avatar: "",
          identity: "green",
        },
        {
          key: "aiyana",
          label: "Aiyana Whitehorse",
          supportingText: "@aiyana",
          avatar: "",
          identity: "ochre",
        },
        {
          key: "kwame",
          label: "Kwame Mensah",
          supportingText: "Not in this project",
          avatar: "",
          identity: "ink",
          disabled: true,
        },
        {
          key: "fabric",
          label: "Fabric",
          supportingText: "AI agent",
          avatar: "",
          identity: "agent",
          agent: true,
        },
      ],
    },
    value: {
      type: "string",
      default: "",
      sample: "tomas",
      description: "The chosen item's key. Controlled when the caller passes onValueChange.",
    },
    label: {
      type: "string",
      default: "",
      sample: "Assignee",
      description: "Visible label above the trigger, and its accessible name. Required as a name even when not drawn.",
    },
    placeholder: {
      type: "string",
      default: "",
      sample: "Select…",
      description: "Shown while nothing is chosen.",
    },
    size: {
      type: "enum",
      options: ["sm", "md", "lg"],
      default: "md",
      platforms: ["web", "desktop"],
      description: "sm 32px toolbar · md 36px · lg 44px dialog field. The phone has one 48pt trigger.",
    },
    variant: {
      type: "enum",
      options: ["field", "chip", "link"],
      default: "field",
      platforms: ["web", "desktop"],
      description: "field is the bordered box every dialog uses. chip is the ticket table's 26px recessed Status control — squared, not a pill. link has no box at all: the value and a caret, sized to the value, for a record's detail rail.",
    },
    name: {
      type: "string",
      default: "",
      platforms: ["web", "desktop"],
      description: "The name a form posts the chosen key under: the select writes a hidden field with it. On a phone-sized browser the native picker takes it.",
    },
    open: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Draws the panel (or the phone's sheet) inline under the trigger. On in the catalogue so the panel is visible; the kits own open state at runtime: the trigger toggles it, choosing a row, Escape, Tab or a press outside closes it.",
    },
    placement: {
      type: "enum",
      options: ["below", "above"],
      default: "below",
      platforms: ["web", "desktop"],
      description: "Where the panel opened. The kit measures the viewport — rows plus the search box — and flips above when it would not fit below.",
    },
    activeKey: {
      type: "string",
      default: "",
      description: "The key of the row under the keyboard / pointer cursor. Empty means the chosen row, which is where the panel opens.",
    },
    searchable: {
      type: "boolean",
      default: false,
      description: "A filter box pinned at the top of the panel. Off by default: a search box over five options asks you to type where pointing was faster.",
    },
    query: {
      type: "string",
      default: "",
      description: "What is in the filter box. items should already be the filtered list.",
    },
    searchPlaceholder: {
      type: "string",
      default: "Search",
    },
    invalid: {
      type: "boolean",
      default: false,
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    title: {
      type: "string",
      default: "",
      description: "Why a disabled select is disabled — the one case a native tooltip is the right control.",
    },
    onValueChange: {
      type: "event",
      args: "key: string",
      changes: "value",
    },
    onOpenChange: {
      type: "event",
      args: "open: boolean",
      changes: "open",
      description: "The panel (the phone: the sheet) opened or closed: by the trigger, a choice, Escape, a press outside, focus leaving, the sheet's close button or Android's back button.",
    },
    onQueryChange: {
      type: "event",
      args: "query: string",
      changes: "query",
      description: "The filter box's text changed. Filter `items` to match: the select shows what it is given.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <button role=\"combobox\"> trigger over a role=\"listbox\" panel drawn in flow under it (column-reverse above), inline styles over `t`; the active row is aria-activedescendant, moved by the arrow keys, Home / End, type-ahead and pointer hover; searchable pins a SearchField; `value`, `open`, `activeKey` and `query` through useControllable. A phone-sized browser gets a native <select>",
      import: "import { Select } from \"@antfabric/ui-react\"",
      notes: [
        "The panel is drawn in flow under the trigger, exactly its width, and flips above a trigger on screen when its rows would not fit below. It is not portalled: a select inside a clipping container (a scrolling table) needs room for it.",
        "On a phone-sized browser (pointer: coarse and under 600px wide) the web kit renders a native <select>, so the phone's own picker opens — the custom listbox is a desktop-pointer answer.",
        "Never advertise a typed shortcut inside the panel that the browser owns; type-ahead letters are fine because the panel has focus.",
        "Pressing the trigger toggles `open` and the panel pops in; pressing a row sets `value` and closes it. Disabled rows set nothing.",
      ],
      keyboard: [
        {
          keys: "Enter / Space / ArrowDown",
          action: "Opens the panel on the chosen row",
        },
        {
          keys: "ArrowUp / ArrowDown",
          action: "Moves the active row, skipping disabled rows",
        },
        {
          keys: "Home / End",
          action: "Jumps to the first / last row",
        },
        {
          keys: "Enter / Space",
          action: "Chooses the active row and closes",
        },
        {
          keys: "Escape",
          action: "Closes and returns focus to the trigger",
        },
        {
          keys: "A–Z",
          action: "Type-ahead onto the labels",
        },
        {
          keys: "Tab",
          action: "Closes without changing the value and moves on",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same combobox trigger and listbox panel as web — the kit's own, never a native <select>; Escape is captured (stopPropagation) so it does not also close the pane behind",
      import: "import { Select } from \"@antfabric/ui-react\"",
      notes: [
        "A native <select> cannot be styled: the OS draws its popup outside the page — a dark translucent menu on macOS, a flat white list on Windows. The owner: \"I want the dropdown to be like this.\"",
        "The panel is EXACTLY the trigger's width, left-aligned to it (\"MAKE THE DROPDOWN ALIGNED WITH THE SELECTOR WITH SAME WIDTH AS THE SELECTOR\"). Long options ellipsize. link gets a 200px floor; an icon-only trigger passes a panel width.",
        "The chosen row gets a coral DOT, not a tick (\"instead of the tick icon, let's have a dot\"): a tick is the checkbox alphabet of the multi-select filter menu; one-of-many is a dot.",
        "The ACTIVE row carries the wash, and pointer hover moves the same cursor as the arrow keys, so two rows can never be highlighted at once.",
        "Hover is the fill (and the ink), focus is the 2px border.active edge; open does not change the border. Invalid beats focus. chip focuses with a 1px edge.",
        "The panel opens centred on the chosen row (a 96-row time list opens at 4:00 PM, not at midnight), and flips above the trigger when the measured rows plus the search box would not fit below.",
        "sm 32 / md 36 / lg 44 are the desktop's --control-h-sm / -lg / -input, which the shared token profile does not carry yet, so they are written as numbers.",
        "Pressing the trigger toggles `open`; the panel pops in (fade and a 0.94 → 1 scale from its top edge, 220ms). Choosing a row sets `value` and closes.",
      ],
      keyboard: [
        {
          keys: "ArrowUp / ArrowDown",
          action: "Moves the active row, skipping disabled rows",
        },
        {
          keys: "Home / End",
          action: "First / last row",
        },
        {
          keys: "Enter / Space",
          action: "Chooses and closes",
        },
        {
          keys: "Escape",
          action: "Closes and returns focus to the trigger — captured so it does not also close the pane behind",
        },
        {
          keys: "A–Z",
          action: "Type-ahead",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A Pressable trigger (the text field's 48pt box) and a sheet drawn under it that slides up through <Enter motion=\"slide-up\">: grabber, title, an optional SearchField, then Pressable radio rows in a ScrollView capped at 90% of the screen; `value`, `open` and `query` through useControllable. The sheet is not a Modal: the screen places the Select where its sheet should appear, and the backdrop is the screen's. Opening focuses the search field (searchable) or puts the screen reader on the title; closing puts it back on the trigger",
      import: "import { Select } from \"@antfabric/ui-react-native\"",
      notes: [
        "No dropdown on the phone: a 48pt trigger (the text field's box) opens a bottom sheet. A popover anchored to a field is too small to tap reliably and lands under the keyboard.",
        "The sheet: a grabber, the label as its title, then 52pt rows with the leading icon or avatar, the label, supportingText as a second line, and the same coral dot on the chosen row.",
        "Choosing a row closes the sheet at once and returns VoiceOver / TalkBack focus to the trigger. There is no Done button — a single choice is its own confirmation.",
        "searchable opens the sheet at full height with the search field focused and the keyboard up; otherwise the sheet is as tall as its rows, up to 90% of the screen, and scrolls.",
        "For two to five options that should stay visible, use RadioGroup on the screen instead of a sheet.",
        "The phone has no Select today; screens push a list or use RadioGroup. This spec is new on mobile.",
        "Tapping the trigger toggles `open` and the sheet slides up from the bottom edge; tapping a row sets `value` and closes it.",
      ],
      gestures: [
        {
          gesture: "Tap the trigger",
          action: "Opens the sheet with a light haptic",
        },
        {
          gesture: "Tap a row",
          action: "Chooses it and closes",
        },
        {
          gesture: "Swipe the sheet down / tap the backdrop",
          action: "Closes without changing the value",
        },
        {
          gesture: "Android back",
          action: "Closes the sheet, not the screen",
        },
      ],
    },
  },
  a11y: {
    role: "combobox",
    label: "{label || FormField label || placeholder}",
    notes: [
      "Web and desktop: the trigger is role=combobox with aria-haspopup=listbox, aria-expanded and aria-activedescendant; rows are role=option with aria-selected. Arrow keys, Home, End, Enter, Space and typing a letter work from the trigger; Escape closes and keeps focus on the trigger; Tab closes.",
      "A searchable select moves focus into the filter when it opens. The filter names the list it drives (aria-controls) and the row under the cursor (aria-activedescendant); the arrow keys and Enter work from it, Escape clears the text and then closes, and Tab moves on and closes the panel.",
      "Phone: the trigger is a button that opens a modal sheet (accessibilityViewIsModal). The sheet closes by its close button, the screen reader's escape gesture and Android's back button, as well as by choosing a row; its rows are radios.",
      "Inside a FormField with no label of its own, the field's label names the select, and it takes the field's description, error, aria-invalid and aria-required. A disabled row is skipped by the arrow keys.",
    ],
  },
  examples: [
    {
      name: "Assignee",
      props: {},
      width: 300,
    },
    {
      name: "Status chip",
      props: {
        variant: "chip",
        size: "sm",
        label: "Status",
        open: false,
        value: "review",
        items: [
          {
            key: "backlog",
            label: "Backlog",
            icon: "circle-dashed",
            color: "$fg.faint",
          },
          {
            key: "progress",
            label: "In progress",
            icon: "circle-dot",
            color: "$warning.default",
          },
          {
            key: "review",
            label: "In review",
            icon: "git-pull-request",
            color: "$info.default",
          },
          {
            key: "done",
            label: "Done",
            icon: "circle-check",
            color: "$success.default",
          },
        ],
      },
      platforms: ["web", "desktop"],
      width: 150,
    },
    {
      name: "Status chip, open",
      props: {
        variant: "chip",
        size: "sm",
        label: "Status",
        value: "review",
        items: [
          {
            key: "backlog",
            label: "Backlog",
            icon: "circle-dashed",
            color: "$fg.faint",
          },
          {
            key: "progress",
            label: "In progress",
            icon: "circle-dot",
            color: "$warning.default",
          },
          {
            key: "review",
            label: "In review",
            icon: "git-pull-request",
            color: "$info.default",
          },
          {
            key: "done",
            label: "Done",
            icon: "circle-check",
            color: "$success.default",
          },
        ],
      },
      platforms: ["web", "desktop"],
      width: 200,
    },
    {
      name: "Link on a detail rail",
      props: {
        variant: "link",
        label: "Priority",
        value: "high",
        activeKey: "urgent",
        items: [
          {
            key: "urgent",
            label: "Urgent",
          },
          {
            key: "high",
            label: "High",
          },
          {
            key: "medium",
            label: "Medium",
          },
          {
            key: "low",
            label: "Low",
          },
        ],
      },
      platforms: ["web", "desktop"],
      width: 260,
    },
    {
      name: "Searchable",
      props: {
        label: "Parent ticket",
        placeholder: "No parent",
        value: "",
        searchable: true,
        query: "auth",
        searchPlaceholder: "Search tickets",
        activeKey: "AF-1182",
        items: [
          {
            key: "AF-1182",
            label: "AF-1182 Auth token refresh loops on wake",
            supportingText: "In progress",
          },
          {
            key: "AF-1204",
            label: "AF-1204 SSO callback drops the deep link",
            supportingText: "Backlog",
          },
          {
            key: "AF-1219",
            label: "AF-1219 Rotate the OAuth signing keys",
            supportingText: "Done",
            disabled: true,
          },
        ],
      },
      width: 340,
    },
    {
      name: "Opens above",
      description: "Near the bottom of the window the panel flips above the trigger.",
      props: {
        placement: "above",
      },
      platforms: ["web", "desktop"],
      width: 300,
    },
    {
      name: "Closed",
      props: {
        open: false,
      },
      width: 300,
    },
    {
      name: "Invalid",
      props: {
        label: "Channel",
        placeholder: "Pick a channel",
        value: "",
        open: false,
        invalid: true,
      },
      width: 300,
    },
    {
      name: "Disabled, with reason",
      props: {
        label: "Project",
        open: false,
        disabled: true,
        title: "A channel filed under a project stays in it. Move it from the project.",
        value: "atlas",
        items: [
          {
            key: "atlas",
            label: "Atlas onboarding",
            icon: "folder-kanban",
          },
        ],
      },
      width: 300,
    },
    {
      name: "Phone sheet",
      props: {
        label: "Move to project",
        value: "billing",
        items: [
          {
            key: "atlas",
            label: "Atlas onboarding",
            supportingText: "14 channels",
            icon: "folder-kanban",
          },
          {
            key: "billing",
            label: "Billing v2",
            supportingText: "6 channels",
            icon: "folder-kanban",
          },
          {
            key: "q4",
            label: "Q4 release train",
            supportingText: "9 channels",
            icon: "folder-kanban",
          },
          {
            key: "none",
            label: "No project",
            icon: "folder",
          },
        ],
      },
      platforms: ["mobile"],
      width: 375,
    },
  ],
  matrix: [
    {
      prop: "size",
    },
    {
      prop: "variant",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "Near the bottom of the window",
      platforms: ["web", "desktop"],
      handling: "Before first paint the kit measures the space below the trigger against what the panel will need — rows × 40 + padding + the search box and any offer row — and flips above when it does not fit and there is more room above. An estimate that forgets the search box flips the wrong way near an edge.",
      example: {
        name: "Flipped",
        props: {
          placement: "above",
          searchable: true,
          searchPlaceholder: "Search people",
        },
        platforms: ["web", "desktop"],
        width: 300,
      },
    },
    {
      title: "Inside a scrolling list",
      platforms: ["web", "desktop"],
      handling: "The panel is portalled to the document and positioned fixed, so the ticket table's scroller cannot clip a dropdown on its last visible row. If the trigger scrolls away while open, the panel closes — a panel left floating over the wrong row is worse than one that closed.",
    },
    {
      title: "Long option labels",
      platforms: ["web", "desktop", "mobile"],
      handling: "Rows and the trigger ellipsize on one line; the panel never grows wider than its trigger. The full label is the row's tooltip on desktop and its accessible name everywhere. On the phone the label truncates and supportingText takes a second line.",
      example: {
        name: "Narrow",
        props: {
          label: "Channel",
          value: "infra",
          items: [
            {
              key: "infra",
              label: "#platform-engineering-infrastructure-oncall",
              supportingText: "214 members",
            },
            {
              key: "design",
              label: "#design-crit",
              supportingText: "38 members",
            },
          ],
        },
        width: 220,
      },
    },
    {
      title: "No match, or nothing to choose",
      platforms: ["web", "desktop", "mobile"],
      handling: "A filter with no result says \"Nothing matches “zzz”.\" in the panel, and the filter box keeps focus so the person can fix the typo. An empty list says \"Nothing to choose from.\" — the trigger is still focusable so the reason can be read.",
      example: {
        name: "No match",
        props: {
          label: "Assignee",
          value: "",
          searchable: true,
          query: "zzz",
          searchPlaceholder: "Search people",
          items: [],
        },
        width: 300,
      },
    },
    {
      title: "Many options",
      platforms: ["web", "desktop", "mobile"],
      handling: "The panel caps at 320px and scrolls, opening centred on the chosen row; type-ahead jumps by label. Past roughly fifteen options, or whenever scanning fails (every ticket in a project), turn on searchable. On the phone the sheet scrolls up to 90% of the screen.",
    },
    {
      title: "The chosen value is gone",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value that matches no item (a project deleted on another device) shows the placeholder rather than a stale label, and the form's save is refused with a reason until a new value is chosen. Changes arriving from another device while the panel is open update the rows in place and keep the active row.",
    },
    {
      title: "Offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "Options that come from the server (people, projects) are read from the desktop's local cache with \"Showing people on this device.\" under the search box; the web says \"You're offline. Showing what was already loaded.\" A choice that needs the server to save is refused on the phone while offline, as every send is.",
    },
    {
      title: "Screen reader and text scaled to 130%",
      platforms: ["mobile"],
      handling: "The sheet is modal: focus moves to its title, the screen behind is hidden from VoiceOver and TalkBack, and choosing returns focus to the trigger. Rows grow past 52pt with the text and labels wrap to two lines before truncating.",
    },
  ],
  related: ["radio-group", "menu", "text-field", "combobox"],
  flows: [
    {
      id: "move-a-ticket",
      title: "Change a ticket's status from the table",
      description: "The Status chip in the ticket table is a Select. It opens on the current column, and choosing a row moves the ticket at once while the write goes through behind it.",
      platforms: ["web", "desktop"],
      width: 240,
      steps: [
        {
          kind: "data",
          title: "The chip shows the ticket's column",
          detail: "The rows are the board's own columns with their labels, read from the store on every render, so a renamed column shows its new name here.",
          code: "value={task.col}  items={a.colsOf(task.board).map((c) => ({ id: c.id, label: a.colLabel(task.board, c.id, task.project) }))}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The columns come from the board query",
          code: "const { data: board } = useSuspenseQuery(boardQuery(boardId))  // items={board.columns}",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The Status chip is pressed",
          detail: "A click, or Enter / Space / ↓ with it focused (the spec's web keyboard).",
        },
        {
          kind: "state",
          title: "The select opens itself",
          detail: "Open is the kit's own state, not the store's. The panel is exactly the chip's width, opens centred on the chosen row, and flips above the chip when the rows would not fit below.",
          code: "const [open, setOpen] = useState(false)",
        },
        {
          kind: "motion",
          title: "The panel pops in under the chip",
          detail: "Today's desktop panel rises (af-rise, fast duration); the spec's pop grows it from the chip.",
          enter: "pop",
        },
        {
          kind: "trigger",
          title: "Done is chosen",
          detail: "A click, or ↑ ↓ then Enter. The pointer and the arrow keys move the same highlight, so two rows are never lit at once. Escape closes without a change.",
        },
        {
          kind: "event",
          title: "onValueChange(key) fires and the panel closes",
          code: "onValueChange?.(item.key)  // 'done'",
        },
        {
          kind: "state",
          title: "The ticket moves, then the service hears",
          detail: "Optimistic, with an activity line: moved this from In review to Done. If the write fails the old list comes back and a toast says Could not move this ticket. Try again.",
          code: "set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, col } : x)) }))  ·  writeThrough(before, …, (w) => w.moveTask(id, col), …)",
        },
        {
          kind: "result",
          title: "The chip reads Done",
          detail: "A ticket with open subtasks refuses Done instead and keeps its status: Finish its subtasks first — 2 of 5 still open.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {
            variant: "chip",
            size: "sm",
            label: "Status",
            open: false,
            value: "review",
            items: [
              {
                key: "backlog",
                label: "Backlog",
                icon: "circle-dashed",
                color: "$fg.faint",
              },
              {
                key: "progress",
                label: "In progress",
                icon: "circle-dot",
                color: "$warning.default",
              },
              {
                key: "review",
                label: "In review",
                icon: "git-pull-request",
                color: "$info.default",
              },
              {
                key: "done",
                label: "Done",
                icon: "circle-check",
                color: "$success.default",
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          props: {
            variant: "chip",
            size: "sm",
            label: "Status",
            open: false,
            value: "review",
            items: [
              {
                key: "backlog",
                label: "Backlog",
                icon: "circle-dashed",
                color: "$fg.faint",
              },
              {
                key: "progress",
                label: "In progress",
                icon: "circle-dot",
                color: "$warning.default",
              },
              {
                key: "review",
                label: "In review",
                icon: "git-pull-request",
                color: "$info.default",
              },
              {
                key: "done",
                label: "Done",
                icon: "circle-check",
                color: "$success.default",
              },
            ],
          },
        },
        {
          step: 2,
          press: 0,
          hold: 900,
          props: {
            variant: "chip",
            size: "sm",
            label: "Status",
            open: false,
            value: "review",
            items: [
              {
                key: "backlog",
                label: "Backlog",
                icon: "circle-dashed",
                color: "$fg.faint",
              },
              {
                key: "progress",
                label: "In progress",
                icon: "circle-dot",
                color: "$warning.default",
              },
              {
                key: "review",
                label: "In review",
                icon: "git-pull-request",
                color: "$info.default",
              },
              {
                key: "done",
                label: "Done",
                icon: "circle-check",
                color: "$success.default",
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1400,
          props: {
            variant: "chip",
            size: "sm",
            label: "Status",
            open: true,
            value: "review",
            items: [
              {
                key: "backlog",
                label: "Backlog",
                icon: "circle-dashed",
                color: "$fg.faint",
              },
              {
                key: "progress",
                label: "In progress",
                icon: "circle-dot",
                color: "$warning.default",
              },
              {
                key: "review",
                label: "In review",
                icon: "git-pull-request",
                color: "$info.default",
              },
              {
                key: "done",
                label: "Done",
                icon: "circle-check",
                color: "$success.default",
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1100,
          props: {
            variant: "chip",
            size: "sm",
            label: "Status",
            open: true,
            value: "review",
            activeKey: "done",
            items: [
              {
                key: "backlog",
                label: "Backlog",
                icon: "circle-dashed",
                color: "$fg.faint",
              },
              {
                key: "progress",
                label: "In progress",
                icon: "circle-dot",
                color: "$warning.default",
              },
              {
                key: "review",
                label: "In review",
                icon: "git-pull-request",
                color: "$info.default",
              },
              {
                key: "done",
                label: "Done",
                icon: "circle-check",
                color: "$success.default",
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1800,
          props: {
            variant: "chip",
            size: "sm",
            label: "Status",
            open: false,
            value: "done",
            items: [
              {
                key: "backlog",
                label: "Backlog",
                icon: "circle-dashed",
                color: "$fg.faint",
              },
              {
                key: "progress",
                label: "In progress",
                icon: "circle-dot",
                color: "$warning.default",
              },
              {
                key: "review",
                label: "In review",
                icon: "git-pull-request",
                color: "$info.default",
              },
              {
                key: "done",
                label: "Done",
                icon: "circle-check",
                color: "$success.default",
              },
            ],
          },
        },
      ],
    },
    {
      id: "pick-from-the-sheet",
      title: "Pick a project from the sheet",
      description: "On the phone the same Select opens a bottom sheet of rows. A single choice is its own confirmation: tapping a row sets the value and closes the sheet.",
      platforms: ["mobile"],
      width: 375,
      steps: [
        {
          kind: "data",
          title: "The screen holds the value and the options",
          detail: "The phone has no Select yet; screens push a list or use RadioGroup. The closest today is Messages' project filter, a sheet of rows that sets a value and closes, which is what this Select does.",
          code: "const projects = useMemo(() => projectsOf(rows.channelRows), [rows])  // <ProjectFilterSheet projects={projects} selected={project} onSelect={setProject} />",
        },
        {
          kind: "trigger",
          title: "The trigger is tapped",
          detail: "The 48pt trigger is the text field's box with a caret. A popover anchored to it would be too small to tap and land under the keyboard, so the phone uses a sheet.",
        },
        {
          kind: "motion",
          title: "The sheet slides up",
          detail: "Titled with the field's label, as tall as its rows up to 90% of the screen. With search on, it opens full height with the keyboard up.",
          enter: "slide-up",
        },
        {
          kind: "trigger",
          title: "Billing v2 is tapped",
        },
        {
          kind: "event",
          title: "onValueChange(key) fires",
          code: "onValueChange?.(item.key)  // ProjectFilterSheet: onSelect(o.value); onClose()",
        },
        {
          kind: "state",
          title: "The screen keeps the value",
          detail: "The Select draws whatever value it is given back; the screen narrows its list from it.",
          code: "onSelect={setProject}",
        },
        {
          kind: "result",
          title: "The sheet closes on the new value",
          detail: "No Done button. VoiceOver and TalkBack focus returns to the trigger, which now reads Billing v2.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            label: "Project",
            open: false,
            value: "atlas",
            items: [
              {
                key: "atlas",
                label: "Atlas onboarding",
                supportingText: "14 channels",
                icon: "folder-kanban",
              },
              {
                key: "billing",
                label: "Billing v2",
                supportingText: "6 channels",
                icon: "folder-kanban",
              },
              {
                key: "q4",
                label: "Q4 release train",
                supportingText: "9 channels",
                icon: "folder-kanban",
              },
            ],
          },
        },
        {
          step: 1,
          press: 0,
          hold: 900,
          props: {
            label: "Project",
            open: false,
            value: "atlas",
            items: [
              {
                key: "atlas",
                label: "Atlas onboarding",
                supportingText: "14 channels",
                icon: "folder-kanban",
              },
              {
                key: "billing",
                label: "Billing v2",
                supportingText: "6 channels",
                icon: "folder-kanban",
              },
              {
                key: "q4",
                label: "Q4 release train",
                supportingText: "9 channels",
                icon: "folder-kanban",
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1500,
          props: {
            label: "Project",
            open: true,
            value: "atlas",
            items: [
              {
                key: "atlas",
                label: "Atlas onboarding",
                supportingText: "14 channels",
                icon: "folder-kanban",
              },
              {
                key: "billing",
                label: "Billing v2",
                supportingText: "6 channels",
                icon: "folder-kanban",
              },
              {
                key: "q4",
                label: "Q4 release train",
                supportingText: "9 channels",
                icon: "folder-kanban",
              },
            ],
          },
        },
        {
          step: 3,
          press: 2,
          hold: 1000,
          props: {
            label: "Project",
            open: true,
            value: "atlas",
            items: [
              {
                key: "atlas",
                label: "Atlas onboarding",
                supportingText: "14 channels",
                icon: "folder-kanban",
              },
              {
                key: "billing",
                label: "Billing v2",
                supportingText: "6 channels",
                icon: "folder-kanban",
              },
              {
                key: "q4",
                label: "Q4 release train",
                supportingText: "9 channels",
                icon: "folder-kanban",
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1800,
          props: {
            label: "Project",
            open: false,
            value: "billing",
            items: [
              {
                key: "atlas",
                label: "Atlas onboarding",
                supportingText: "14 channels",
                icon: "folder-kanban",
              },
              {
                key: "billing",
                label: "Billing v2",
                supportingText: "6 channels",
                icon: "folder-kanban",
              },
              {
                key: "q4",
                label: "Q4 release train",
                supportingText: "9 channels",
                icon: "folder-kanban",
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
