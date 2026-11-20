import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "segmented-control",
  name: "Segmented control",
  category: "actions",
  level: "molecule",
  status: "stable",
  description: "A pill track that switches the view of one pane: one raised card marks the chosen segment, and a segment may carry a count of how many are in it. Desktop slides that one card between segments; the phone fills the chosen segment in place.",
  props: {
    items: {
      type: "array",
      required: true,
      description: "[{ key, label, count? }]. count is how many are in there, never how many need you, so it is a quiet bordered chip and never the brand colour. 0 or missing draws no chip.",
      sample: [
        {
          key: "all",
          label: "All",
        },
        {
          key: "dms",
          label: "DMs",
          count: 2,
        },
        {
          key: "mentions",
          label: "Mentions",
          count: 3,
        },
        {
          key: "recordings",
          label: "Recordings",
        },
      ],
    },
    value: {
      type: "string",
      default: "",
      sample: "all",
      description: "The chosen item's key. A value that matches no item is allowed and draws no card — for a strip whose panel can be closed.",
    },
    size: {
      type: "enum",
      options: ["sm", "md"],
      default: "md",
      platforms: ["web", "desktop"],
      description: "md tabs are 32px tall and sm tabs 28px; the strip adds its 4px padding and hairline edge around them (42px and 38px). The phone has one size.",
    },
    full: {
      type: "boolean",
      default: false,
      description: "Stretch the track to its column. Segments share the SPARE width (flex 1 1 auto), so a long label keeps its words. Usual on phones.",
    },
    scrollable: {
      type: "boolean",
      default: false,
      description: "The track scrolls sideways instead of squeezing, for labels that cannot fit (localised copy, 130% text).",
    },
    label: {
      type: "string",
      default: "",
      sample: "Notifications",
      description: "The strip's accessible name.",
    },
    onValueChange: {
      type: "event",
      args: "key: string",
      changes: "value",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "role=\"tablist\" of <button role=\"tab\"> segments, inline styles over `t`; ONE card, measured after mount (and on resize), slides by transform to the chosen segment — on the server and the first paint the chosen segment draws its own card in the same place; roving tabindex with ArrowLeft / ArrowRight / Home / End (automatic activation); hover and focus from useInteraction; `value` through useControllable",
      import: "import { SegmentedControl } from \"@antfabric-ui/react\"",
      notes: [
        "Web values are the desktop's (32px tabs inside a 42px strip). The web profile's taller controls do not apply: a tab strip is not a press target on its own row.",
        "When the strip switches a routed view, each tab is a link (Tabs.Tab render={<Link>}) so the URL holds the choice and back/forward and a shared link land on the same tab.",
        "Pressing a segment sets `value`, and the one card slides to it, 250ms ease-out.",
      ],
      keyboard: [
        {
          keys: "ArrowLeft / ArrowRight",
          action: "Moves to and selects the previous / next segment (automatic activation); wraps at the ends",
        },
        {
          keys: "Home / End",
          action: "Selects the first / last segment",
        },
        {
          keys: "Tab",
          action: "Leaves the strip for the panel; only the chosen segment is in the tab order",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same tablist as web, at desktop density: the one card slides 250ms ease-out between segments",
      import: "import { SegmentedControl } from \"@antfabric-ui/react\"",
      notes: [
        "The chosen card is ONE absolutely-positioned element that travels (ADR-0518); the segments paint no fill of their own.",
        "Labels are semibold in both states so nothing changes width while the card is in flight; only the ink changes (text.strong chosen, text.faint not).",
        "Today's desktop Tabs are plain buttons with no arrow-key handling; this spec adds the roving focus Radix Tabs gives for free.",
        "This spec adds a label-ink hover for unchosen segments (text.muted). The desktop has none today; there is still no hover fill, because the card is the only fill in the strip.",
        "A strip inside a segmented strip must be the underline Tabs instead — two grooves nested read as two peers.",
        "Pressing a segment sets `value` and the single card slides to it. Until the strip has been measured (on the server, and the first paint) the chosen segment draws its own card in the same place.",
      ],
      keyboard: [
        {
          keys: "ArrowLeft / ArrowRight",
          action: "Moves to and selects the previous / next segment",
        },
        {
          keys: "Home / End",
          action: "Selects the first / last segment",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A View (tablist) of Pressable segments, in a horizontal ScrollView when scrollable; StyleSheet over useTheme(); the chosen segment fills itself at once; on iOS 26 a PanResponder drives the selection lens (a clear GlassSurface at 1.15 scale that follows a horizontal drag and settles on the nearest segment); `value` through useControllable",
      import: "import { SegmentedControl } from \"@antfabric-ui/react-native\"",
      notes: [
        "The fill does not travel on the phone: the chosen segment fills itself on the render after the tap, matching V2's FilterChips decision (\"No smooth motion\").",
        "One size: 36pt tall (8 + 20 line + 8) with a 1pt edge on every segment, transparent when unchosen, so nothing moves when the choice does.",
        "Today the phone draws a count chip even for 0; this spec hides it, as the desktop does — a chip reading 0 is a worse answer than no chip.",
        "With scrollable, choosing a segment scrolls it fully into view.",
        "Tapping a segment sets `value`. On the phone the card appears at once, with no transition, keeping the \"No smooth motion\" decision; only the label inks cross-fade.",
        "iOS 26+: the selection lens, as on the tab bar — touching the control lifts the selected card into a clear-glass lens that can be dragged across the segments and settles on release, selecting that segment. iOS 18 and Android keep the plain tap.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Chooses the segment; an unchosen segment washes surface.hover while pressed",
        },
        {
          gesture: "Horizontal swipe",
          action: "Scrolls the strip when scrollable",
        },
      ],
    },
  },
  a11y: {
    role: "tablist",
    label: "{label}",
    notes: [
      "Each segment is role=tab with aria-selected / accessibilityState.selected. The count chip is hidden and joins the tab's name instead: \"Mentions, 3\".",
      "The strip is one tab stop; the arrow keys move to the neighbouring segment and choose it, and Home and End go to the first and last. In a right-to-left tree ArrowRight goes to the previous segment. There is no live region: the panel change is the feedback.",
      "On the phone each segment's touch area is grown to 44pt without drawing more.",
    ],
  },
  examples: [
    {
      name: "Notification rail",
      props: {},
    },
    {
      name: "Full width",
      props: {
        full: true,
      },
      platforms: ["web", "desktop"],
      width: 360,
    },
    {
      name: "Tasks with counts",
      props: {
        full: true,
        label: "Action items",
        value: "all",
        items: [
          {
            key: "all",
            label: "All tasks",
            count: 23,
          },
          {
            key: "mine",
            label: "Assigned to me",
            count: 4,
          },
        ],
      },
      width: 340,
    },
    {
      name: "Microphone gain",
      props: {
        full: true,
        label: "Microphone gain",
        value: "2",
        items: [
          {
            key: "1",
            label: "Low",
          },
          {
            key: "2",
            label: "Medium",
          },
          {
            key: "3",
            label: "High",
          },
        ],
      },
      platforms: ["mobile"],
      width: 340,
    },
    {
      name: "Small",
      props: {
        size: "sm",
        label: "Calendar range",
        value: "week",
        items: [
          {
            key: "day",
            label: "Day",
          },
          {
            key: "week",
            label: "Week",
          },
          {
            key: "month",
            label: "Month",
          },
        ],
      },
      platforms: ["web", "desktop"],
    },
  ],
  matrix: [
    {
      prop: "size",
    },
    {
      prop: "full",
    },
  ],
  states: ["hover", "pressed", "focus"],
  edgeCases: [
    {
      title: "Labels that do not fit",
      platforms: ["web", "desktop", "mobile"],
      handling: "A label never wraps and never truncates first: a two-line tab changes the strip's height and moves everything under it. With full, short labels lend their spare width to long ones (Recordings needed 74 of 76px at the rail's 360px minimum). If the words still do not fit, the strip becomes scrollable rather than clipping a label.",
      example: {
        name: "Narrow rail",
        props: {
          full: true,
          scrollable: true,
        },
        width: 300,
      },
    },
    {
      title: "A huge count",
      platforms: ["web", "desktop", "mobile"],
      handling: "The chip caps at 99+ so a segment cannot outgrow its neighbours; the exact number stays in the tab's accessible name. A count from a capped read (a 100-row page) is drawn 100+ — at least this many — never as a bare 100 that reads as a fact.",
      example: {
        name: "1,204 mentions",
        props: {
          items: [
            {
              key: "all",
              label: "All",
            },
            {
              key: "mentions",
              label: "Mentions",
              count: 1204,
            },
          ],
          value: "mentions",
        },
      },
    },
    {
      title: "Nothing chosen",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value that matches no segment draws no card at all. Never default to the first segment: a card under Files with no Files panel open is the control telling a lie. Tab then lands on the first segment.",
      example: {
        name: "Panel closed",
        props: {
          value: "",
        },
      },
    },
    {
      title: "Count still loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "No chip until the count is known — never 0, never a skeleton. When it arrives the segment widens and the desktop indicator re-measures in the same frame, so the card never sits short of its segment.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Segments grow taller with the text (font scale capped at 1.3×). A fixed three-way strip that no longer fits at 393pt switches to scrollable instead of wrapping.",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop"],
      handling: "The desktop card jumps to the chosen segment instead of sliding; the label inks still cross-fade, since a colour change is not motion.",
    },
    {
      title: "Right-to-left languages",
      platforms: ["web", "desktop", "mobile"],
      handling: "Segments run right to left, ArrowRight moves toward the end of the reading order, and the desktop card slides leftward to the next segment.",
    },
    {
      title: "Keyboard-only and screen readers",
      platforms: ["web", "desktop"],
      handling: "Only the chosen segment is tabbable; arrows move and select. The focus ring is drawn on the segment, outside the card, so it is visible whether or not the card is under it.",
    },
  ],
  related: ["tabs", "chip", "radio-group", "button"],
  flows: [
    {
      id: "switch-the-view",
      title: "Choose a segment and the list below follows",
      description: "The strip only reports the choice. The pane that owns the list keeps the value, re-filters, and passes the value back so the card lands on it.",
      platforms: ["web", "desktop", "mobile"],
      width: 420,
      steps: [
        {
          kind: "data",
          title: "Recordings counts every tab over the whole list",
          detail: "The pane keeps the chosen filter in local state and counts each tab over the unfiltered rows, so switching tabs never moves a badge.",
          code: "const [filter, setFilter] = useState<RecordingsFilter>('all')  ·  const counts = countsFor(rows)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The action items count themselves",
          detail: "A meeting's summary hands its action items down; the strip counts all of them and the ones with your name on them.",
          code: "{ label: 'All tasks', value: 'all', count: items.length }, { label: 'Assigned to me', value: 'mine', count: mine.length }",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route's search params hold the choice",
          detail: "Each segment is a link that sets the filter in the URL, so back, forward and a shared link land on the same segment. The counts come from the list query already in cache.",
          code: "const { filter = 'all' } = Route.useSearch()",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "A segment is pressed",
          detail: "A click, or ← → then Enter on web and desktop; a tap on the phone. Pressing the chosen segment changes nothing.",
        },
        {
          kind: "event",
          title: "onValueChange(key) fires",
          code: "onValueChange?.(item.key)  // 'desktop'",
        },
        {
          kind: "state",
          title: "The pane re-filters its list",
          detail: "A search already typed stays, and now searches inside the new tab.",
          code: "setFilter(id)  →  const shown = searchRows(filterRows(rows, filter), query)",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The list narrows to your items",
          detail: "It also folds the list back to its first five, so the new list starts at the top.",
          code: "onChange={(next) => { setScope(next); setExpanded(false) }}",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The URL changes and the loader re-reads",
          code: "navigate({ search: (s) => ({ ...s, filter: id }) })",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The card slides to the chosen segment",
          detail: "One card travels. Its left and right edges transition separately, so it stretches to a longer label instead of jumping, and the labels' ink cross-fades. Reduced motion moves it at once.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The chosen segment fills in place",
          detail: "Nothing slides on the phone (V2's \"No smooth motion\"): the raised card appears on the next render and only the label inks cross-fade.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The list matches the segment",
          detail: "Desktop shows only the desktop recordings with every badge unchanged. The phone shows the items with your name on them, or says Nothing assigned to you.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {
            label: "Recordings",
            value: "all",
            items: [
              {
                key: "all",
                label: "All",
                count: 14,
              },
              {
                key: "mobile",
                label: "Mobile",
                count: 5,
              },
              {
                key: "desktop",
                label: "Desktop",
                count: 8,
              },
              {
                key: "shared",
                label: "Shared with me",
                count: 1,
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1300,
          platforms: ["web"],
          props: {
            label: "Recordings",
            value: "all",
            items: [
              {
                key: "all",
                label: "All",
                count: 14,
              },
              {
                key: "mobile",
                label: "Mobile",
                count: 5,
              },
              {
                key: "desktop",
                label: "Desktop",
                count: 8,
              },
              {
                key: "shared",
                label: "Shared with me",
                count: 1,
              },
            ],
          },
        },
        {
          step: 3,
          press: 2,
          hold: 900,
          platforms: ["web", "desktop"],
          props: {
            label: "Recordings",
            value: "all",
            items: [
              {
                key: "all",
                label: "All",
                count: 14,
              },
              {
                key: "mobile",
                label: "Mobile",
                count: 5,
              },
              {
                key: "desktop",
                label: "Desktop",
                count: 8,
              },
              {
                key: "shared",
                label: "Shared with me",
                count: 1,
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1800,
          platforms: ["web", "desktop"],
          props: {
            label: "Recordings",
            value: "desktop",
            items: [
              {
                key: "all",
                label: "All",
                count: 14,
              },
              {
                key: "mobile",
                label: "Mobile",
                count: 5,
              },
              {
                key: "desktop",
                label: "Desktop",
                count: 8,
              },
              {
                key: "shared",
                label: "Shared with me",
                count: 1,
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["mobile"],
          props: {
            label: "Action items",
            full: true,
            value: "all",
            items: [
              {
                key: "all",
                label: "All tasks",
                count: 6,
              },
              {
                key: "mine",
                label: "Assigned to me",
                count: 2,
              },
            ],
          },
        },
        {
          step: 3,
          press: 1,
          hold: 900,
          platforms: ["mobile"],
          props: {
            label: "Action items",
            full: true,
            value: "all",
            items: [
              {
                key: "all",
                label: "All tasks",
                count: 6,
              },
              {
                key: "mine",
                label: "Assigned to me",
                count: 2,
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1800,
          platforms: ["mobile"],
          props: {
            label: "Action items",
            full: true,
            value: "mine",
            items: [
              {
                key: "all",
                label: "All tasks",
                count: 6,
              },
              {
                key: "mine",
                label: "Assigned to me",
                count: 2,
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
