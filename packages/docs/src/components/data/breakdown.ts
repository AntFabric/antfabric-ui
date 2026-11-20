import type { ComponentDocs } from "../../types";
import { CHANNELS, CHANNELS_MANY, commonProps } from "./chart-samples";

/** The props every ready-made chart takes alike, less the ones that mean a plot's axes or a legend. */
const { title, subtitle, format, empty, emptyLine } = commonProps({ title: "Where October's tickets came from", subtitle: "By channel", labels: {}, height: 0 });

/** October's tickets by where they came in: the same rows a donut, a table and a stat can be fed. */
const channels = { data: CHANNELS, name: "channel", value: "tickets", valueLabel: "Tickets", title: "Where October's tickets came from", subtitle: "By channel" };

const docs: ComponentDocs = {
  id: "breakdown",
  name: "Breakdown",
  category: "data",
  level: "organism",
  group: "panel",
  status: "draft",
  description:
    "A whole split into its parts: one bar with a thin gap of the card between the parts, the total as the card's headline (with an optional change badge), and the parts listed under it, each with its colour, name, value and share. Pointing at a part, or at its row, lights it and steps the rest back. Past eight parts the rest fold into one called \"Other\". Drawn with plain views, no chart library. \"View as table\" shows every row, unfolded.",
  props: {
    data: {
      type: "array",
      sample: CHANNELS,
      required: true,
      description: "Rows, one per part: [{ channel: \"#support\", tickets: 312 }, …]. The same rows can feed a donut, a table and a stat. In the order they are given: the bar reads best largest first.",
    },
    name: { type: "string", sample: "channel", required: true, description: "The field of each row that names its part." },
    value: { type: "string", sample: "tickets", required: true, description: "The field of each row that is its value. A value under zero, or one that is not a number, counts as 0: a share is never negative." },
    title,
    subtitle,
    format: { ...format, description: "A format name, its options or a function: what core's `fmt` takes. The total, each part, the summary and \"View as table\" print through it. The shares are always whole percents." },
    valueLabel: { type: "string", sample: "Tickets", description: "The value column's name in \"View as table\". Default \"Value\"." },
    delta: { type: "number", description: "The change in the total, as a number the delta format prints: `0.034` is `+3.4%`. Left out, the headline has no badge." },
    deltaFormat: { type: "object", description: "A format name, its options or a function for the badge. Default a signed percent." },
    inverse: { type: "boolean", default: false, description: "Down is good (open tickets, response time): the badge's colours swap, the arrow does not." },
    period: { type: "string", default: "", description: "What the change is against, after the badge: \"tickets, vs September\"." },
    selected: {
      type: "string",
      description: "The part that is picked, by its name: its segment of the bar and its row stay lit and the others step back until it is picked again. Pointing at a part or tabbing to its row lights it too, for as long as the pointer or the keyboard is there. Left out, the chart keeps its own, starting with none. Controlled when the app passes it with `onSelectedChange`.",
    },
    onSelectedChange: {
      type: "event",
      args: "selected: string | null",
      changes: "selected",
      description: "A segment of the bar or a row was pressed. Called with the part's name, or with null when it was already the one picked.",
    },
    height: { type: "number", default: 160, description: "The height of the loading and empty states, in px (points on the phone). The bar and the list take what they need." },
    empty,
    emptyLine,
    loading: { type: "boolean", default: false, description: "Grey bars of uneven heights in place of the bar and the list, from the kit's Skeleton, and no \"View as table\". The header stays, so the card does not jump when the data arrives. Screen readers hear it once." },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title, the total as a headline (MetricValue, Delta) and \"View as table\" (Button); a ChartFrame holding a flex row of <span> segments (flex set to each part's value, `chart.splitGap` apart) and a <ul> of <button> rows (aria-pressed) laid out in columns",
      import: "import { Breakdown } from \"@antfabric/ui-react/data\"",
      notes: [
        "No chart library: the bar is views, so it reads the same on every platform and costs nothing. Each segment's width is its share of the whole; a part that is a sliver of it is held to `chart.splitMinW` so it still shows, and a part of 0 is in the list only.",
        "The first and last segments are rounded at the bar's outer ends (`radius.pill`) and the ones between are square, so the gaps read as cuts in one bar. One part is a whole rounded bar; all zero is the empty track in grey.",
        "Pointing at a segment or a row, or tabbing to a row, lights that part: the other segments fade to 38% over 150ms on the kit's ease-out, and its row takes the hover fill. The states come from the kit's interaction hook and pointer events, never `:hover`. A click picks it and keeps it lit.",
        "The bar wipes in once from the left (the kit's `grow-x` entrance, 280ms on ease-out). Reduced motion turns it off.",
        "The list lays out in as many columns as fit, each at least `chart.partMinW` wide. Past eight parts the rest fold into \"Other\", in a grey that is no colour of the palette (core's `segmentsOf`, as DonutChart).",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves through the parts in the list, then to \"View as table\". A part that has focus is lit, with its segment" },
        { keys: "Enter", action: "On a part: picks it, or puts it back when it was picked" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, bar and list as web, at desktop density",
      import: "import { Breakdown } from \"@antfabric/ui-react/data\"",
      notes: ["The same panel as the web's. The pointer's hover lights a part, and a click picks it."],
      keyboard: [
        { keys: "Tab", action: "Moves through the parts in the list, then to \"View as table\". A part that has focus is lit, with its segment" },
        { keys: "Enter", action: "On a part: picks it, or puts it back when it was picked" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header, headline and Button; a ChartFrame holding an Animated row of Pressable segments and, below it, one Pressable row per part (a swatch, the name, the value and the share), each at least 44pt tall",
      import: "import { Breakdown } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "No chart library: the bar is views, the same as the web's. The list is one column, full width, each part on one line (the web's two-line cell does not fit a phone's rows).",
        "A phone has no hover, so a tap on a segment or on a row picks the part (the other segments step back to 38%, and `onSelectedChange` is called) and a tap on it again puts it back.",
        "The bar grows in over 280ms from its centre unless the person reduces motion (the kit's `grow-x` entrance, as `Enter` draws it).",
      ],
      gestures: [
        { gesture: "Tap a segment", action: "Picks the part: the others step back and its row is lit. Tap it again to put it back" },
        { gesture: "Tap a row", action: "The same as tapping its segment" },
      ],
    },
  },
  a11y: {
    role: "figure (web), one image and a list (phone)",
    label: "The summary: \"Where October's tickets came from: #support 312 (40.6%), #billing 158 (20.5%), #platform-eng 121 (15.7%), #onboarding 96 (12.5%), Email 82 (10.7%); total 769.\"",
    notes: [
      "The bar is an image named by the sentence core's `segmentsOf` and `summarizeSegments` write from the rows: every part, its value and its share, and the total. It is heard, not printed: the list under the bar prints every part's name, value and share, so colour is never the only way in.",
      "Each row is a button that says its own sentence (\"#billing, 158, 21%\"), pressed while it is the one picked, and a stop in the Tab order, so a keyboard can light and pick a part as a pointer does. The segments are not separate stops: the rows are the way in, and name the same parts.",
      "The headline's number and badge say the total and the change in words (\"Up 3.4%, good\"), and the list's shares are whole percents with the exact ones in the summary.",
      "\"View as table\" is the other way in: every row, with real headers, and nothing folded into \"Other\".",
    ],
  },
  examples: [
    { name: "Where October's tickets came from", description: "Five parts: the total as the headline, one bar, and the parts listed with their value and share.", props: { ...channels, delta: 0.034, period: "tickets, vs September" }, width: 640 },
    { name: "A part picked", description: "`selected` is `#billing`: its segment and its row stay lit and the others step back.", props: { ...channels, delta: 0.034, period: "tickets, vs September", selected: "#billing" }, width: 640 },
    { name: "Fewer is better", description: "`inverse`: down is good, so a fall in tickets is the green badge.", props: { ...channels, delta: -0.082, inverse: true, period: "tickets, vs September", subtitle: "Open tickets by channel" }, width: 640 },
    { name: "Eleven channels", description: "The first eight keep a colour of the palette; the other three are one part, Other, in grey.", props: { ...channels, data: CHANNELS_MANY, subtitle: "Eleven channels, October 2026" }, width: 640 },
    { name: "Loading", props: { ...channels, loading: true }, width: 640 },
  ],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why (the title and line are props); the card keeps its header, and has no headline and no \"View as table\", since there is nothing to total or show. The figure's label says there is no data.",
      example: { name: "Empty", props: { data: [], name: "channel", value: "tickets", title: "Where October's tickets came from", subtitle: "Nothing yet", empty: "No tickets this month", emptyLine: "The first ones will show up here." }, width: 560 },
    },
    {
      title: "One part",
      platforms: ["web", "desktop", "mobile"],
      handling: "One row is the whole bar, rounded at both ends, its share 100% and the total its value.",
      example: { name: "One part", props: { data: [{ channel: "#support", tickets: 312 }], name: "channel", value: "tickets", title: "Where October's tickets came from", subtitle: "Only #support so far", valueLabel: "Tickets" }, width: 560 },
    },
    {
      title: "All zero",
      platforms: ["web", "desktop", "mobile"],
      handling: "A whole of nothing has no shares to cut: the bar is its empty track in grey, the total says 0, every share is an en dash and the summary says every value is 0.",
      example: { name: "All zero", props: { data: CHANNELS.map((r) => ({ channel: r.channel, tickets: 0 })), name: "channel", value: "tickets", title: "Where October's tickets came from", subtitle: "A quiet month", valueLabel: "Tickets" }, width: 560 },
    },
    {
      title: "More than eight parts",
      platforms: ["web", "desktop", "mobile"],
      handling: "The palette has eight colours, and a ninth would wrap onto the first, so the first eight keep their own and every row after them is summed into one more, labelled \"Other\", in a neutral grey (`chart.other`) that is no colour of the palette. Pass the rows largest first so what is folded is what is smallest. It is one row in the list and one segment on the bar, and the summary says how many it holds (\"Other, 3 more, 47 (6.1%)\"). \"View as table\" shows every row.",
      example: { name: "Eleven channels", props: { ...channels, data: CHANNELS_MANY, subtitle: "Eleven channels, October 2026" }, width: 560 },
    },
    {
      title: "A part that is a sliver",
      platforms: ["web", "desktop", "mobile"],
      handling: "A segment is never narrower than `chart.splitMinW`, so a part that is a fraction of a percent of the whole still shows; its row says the real share, and a part of 0 has no segment at all but is in the list at 0%.",
      example: { name: "A sliver", props: { data: [{ channel: "#support", tickets: 312 }, { channel: "#billing", tickets: 158 }, { channel: "Phone", tickets: 1 }, { channel: "Fax", tickets: 0 }], name: "channel", value: "tickets", title: "Where October's tickets came from", subtitle: "Two channels barely used", valueLabel: "Tickets" }, width: 560 },
    },
    {
      title: "A long name",
      platforms: ["web", "desktop", "mobile"],
      handling: "A name too long for its row is cut with an ellipsis; the summary, the row's accessible name and the table have the whole name.",
      example: { name: "Long names", props: { data: [{ channel: "#customer-success-enterprise-escalations", tickets: 96 }, { channel: "#partner-integrations-and-marketplace", tickets: 58 }, { channel: "#support", tickets: 312 }], name: "channel", value: "tickets", title: "Where October's tickets came from", subtitle: "Long channel names", valueLabel: "Tickets" }, width: 520 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Grey bars of uneven heights fill the plot and the card keeps its header. There is no headline, no list, no table button and no summary yet. A screen reader hears \"Loading chart\" once.",
      example: { name: "Loading", props: { ...channels, loading: true }, width: 520 },
    },
  ],
  related: ["donut-chart", "bar-chart", "goal-rings", "stat-tile", "metric-value", "delta", "table", "card", "button", "skeleton", "empty-state"],
  flows: [
    {
      id: "look-at-a-channel",
      title: "Look at #billing",
      description: "On the web and the desktop, pointing at a part of the bar or at its row lights it, and a click picks it; on the phone, a tap on either picks it. The other parts step back.",
      platforms: ["web", "desktop", "mobile"],
      width: 640,
      steps: [
        {
          kind: "data",
          title: "The app holds one row per channel",
          detail: "A row is a name and a number. The same rows feed this bar, a donut and a table; the total and every share are worked out from them, so none is passed in that could disagree. A ninth row and after would be folded into \"Other\".",
          code: "const rows = [{ channel: \"#support\", tickets: 312 }, { channel: \"#billing\", tickets: 158 }, …]",
        },
        {
          kind: "trigger",
          title: "The pointer moves onto #billing's segment, or onto its row",
          detail: "A segment and a row report the same through pointer events and the interaction hook (hover, or keyboard focus). Lighting a part reports nothing: it is the pointer's, and not worth saving. A click picks it.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "A finger taps #billing's segment, or its row",
          detail: "There is no hover on a phone, so a tap picks the part, and the tap that picks it again puts it back.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onSelectedChange fires with the part's name",
          detail: "A tap on the phone and a click on the web pick a part, so the app can keep it (a filter that follows it, a saved view). Pressing it again calls it with null.",
          code: "onSelectedChange?.(\"#billing\")",
        },
        {
          kind: "state",
          title: "#billing is the part the bar shows",
          detail: "The chart's own state, or the app's when it passes `selected`. It is the part under the pointer or the keyboard, else the one that was picked.",
          code: "setPicked(\"#billing\")",
        },
        {
          kind: "motion",
          title: "The other segments step back",
          detail: "The other segments go to 38% of their colour over 150ms on the kit's ease-out, and #billing's row takes the hover fill. Reduced motion makes it a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The other segments step back",
          detail: "The other segments take 38% of their colour and #billing's row is lit.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "#billing is lit in the bar and the list",
          detail: "Its row says 158 and 21%. Press it again and every part is back to full colour.",
        },
      ],
      replay: [
        { step: 0, hold: 2000, props: { ...channels, delta: 0.034, period: "tickets, vs September" } },
        { step: 1, press: "#billing, 158, 21%", hold: 1200, platforms: ["web", "desktop"], props: { ...channels, delta: 0.034, period: "tickets, vs September" } },
        { step: 2, press: "#billing, 158, 21%", hold: 1200, platforms: ["mobile"], props: { ...channels, delta: 0.034, period: "tickets, vs September" } },
        { step: 5, hold: 2800, platforms: ["web", "desktop"], props: { ...channels, delta: 0.034, period: "tickets, vs September", selected: "#billing" } },
        { step: 6, hold: 2800, platforms: ["mobile"], props: { ...channels, delta: 0.034, period: "tickets, vs September", selected: "#billing" } },
      ],
    },
  ],
};

export default docs;
