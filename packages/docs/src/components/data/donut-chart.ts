import type { ComponentDocs } from "../../types";
import { CHANNELS, CHANNELS_MANY, commonProps, headingLevelProp } from "./chart-samples";

/** The props every ready-made chart takes alike, less the ones that mean a plot's height or a series. */
const { title, subtitle, headline, format, empty, emptyLine, loading } = commonProps({ title: "Tickets by channel", subtitle: "October 2026", labels: {}, height: 0 });

/** October's tickets by channel: the same rows a table, a stat and a bar chart can be fed. */
const tickets = { data: CHANNELS, name: "channel", value: "tickets", valueLabel: "Tickets", title: "Tickets by channel", subtitle: "October 2026" };

/** Plays the first two steps of a flow on the same card: nothing picked, then `#billing`. */
const frame = (extra: Record<string, unknown>) => ({ ...tickets, ...extra });

const docs: ComponentDocs = {
  id: "donut-chart",
  name: "DonutChart",
  category: "data",
  level: "organism",
  group: "chart",
  status: "draft",
  description:
    "A whole split into segments on a ring, with its total in the hole, and under it, past a rule, a legend of every segment's name, value and share: in columns on the web and the desktop, as the reference dashboard draws it, and a row each on the phone. Pointing at a segment or its row puts that segment's value in the hole and steps the rest back; pressing a row picks the segment, and its swatch turns it off, when the shares re-fit. Past eight segments the rest fold into one called \"Other\". \"View as table\" shows every row, unfolded.",
  props: {
    headingLevel: headingLevelProp,
    data: {
      type: "array",
      sample: CHANNELS,
      required: true,
      description: "Rows, one per segment: [{ channel: \"#support\", tickets: 312 }, …]. The same rows can feed a table, a stat and a bar chart. In the order they are given: a ring reads best largest first.",
    },
    name: { type: "string", sample: "channel", required: true, description: "The field of each row that names its segment." },
    value: { type: "string", sample: "tickets", required: true, description: "The field of each row that is its value. A value under zero, or one that is not a number, counts as 0: a share is never negative." },
    title,
    subtitle,
    headline,
    format,
    valueLabel: { type: "string", sample: "Tickets", description: "The value column's name in \"View as table\". Default \"Value\"." },
    centerLabel: { type: "string", default: "Total", description: "What the hole says above the total. It says the focused segment's name instead while one is." },
    size: { type: "number", description: "The ring's width and height, in px (points on the phone). Default 200: `chart.donutSize`." },
    empty,
    emptyLine,
    loading,
    hidden: {
      type: "array",
      description: "The segments the list has turned off, by name: [\"Email\"]. A name that two rows share is two segments: the second is `Email#2`. Left out, the chart keeps its own, starting with every segment on. Controlled when the app passes it with `onHiddenChange`.",
    },
    onHiddenChange: {
      type: "event",
      args: "hidden: string[]",
      changes: "hidden",
      description: "A list row was pressed. Called with every segment that is off now. The last segment showing cannot be turned off, so pressing it calls nothing.",
    },
    selected: {
      type: "string",
      description: "The segment that is picked, by name (`Email#2` for the second of two rows named Email): the hole shows it and the others step back until it is picked again. Pointing at a segment or tabbing to its row lights it too, for as long as the pointer or the keyboard is there. Left out, the chart keeps its own, starting with none. Controlled when the app passes it with `onSelectedChange`.",
    },
    onSelectedChange: {
      type: "event",
      args: "selected: string | null",
      changes: "selected",
      description: "A segment was pressed on the ring. Called with its name, or with null when it was already the one picked.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title, an optional headline, \"View as table\" (Button); a ChartFrame holding recharts' PieChart with a Pie (paddingAngle, cornerRadius, 90 degrees round to -270) and a Cell per segment, MetricValue in the hole, and a list of <button> rows (aria-pressed) with a swatch, name, value and share",
      import: "import { DonutChart } from \"@antfabric/ui-react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is reached only from there. The ring is handed an explicit size, never a responsive container.",
        "Pointing at a segment, tabbing to a row or pointing at one lights that segment: the others fade to 38% over 150ms on the kit's ease-out, and the hole's number eases to the segment's value (MetricValue). The states come from the kit's interaction hook and recharts' own mouse events, never `:hover`.",
        "The ring draws in once over 600ms on the kit's ease-out and tweens when a segment is turned off or the rows change. Reduced motion turns both off.",
        "The legend sits under the ring in as many columns as fit, each at least `chart.partMinW` wide, so a narrow card has fewer columns, not a squeezed ring.",
        "Segments are not keyboard stops: the list is the way in for a keyboard (each row is a button that picks its segment, a swatch toggle beside it turns the segment off, and focusing either lights its segment), and \"View as table\" has every number.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves through the list's rows, then to \"View as table\". A row that has focus lights its segment on the ring" },
        { keys: "Enter", action: "On a row: picks the segment, or lets go of it. On a swatch: turns the segment off or back on" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, recharts' Pie and list as web, at desktop density",
      import: "import { DonutChart } from \"@antfabric/ui-react/data\"",
      notes: ["The same chart as the web's. The pointer's hover lights a segment, and a click picks it."],
      keyboard: [
        { keys: "Tab", action: "Moves through the list's rows, then to \"View as table\". A row that has focus lights its segment on the ring" },
        { keys: "Enter", action: "On a row: turns the segment off or back on" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, a ChartFrame holding react-native-gifted-charts' PieChart `donut` (the hole a disc in the card's colour, the segments cut apart by a stroke in the same), MetricValue in the hole, and the list below it as Pressable rows",
      import: "import { DonutChart } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "Shipped from the data subpath: gifted-charts and react-native-svg are reached only from there.",
        "The list is below the ring, full width, each row at least 44pt tall. gifted-charts' pie has no hover and its own focus grows a segment out of the ring; the kit does not use it and steps the other segments back instead (their colour at 38%), as the web does.",
        "The ring pops in over 220ms unless the person reduces motion: gifted-charts' pie draws no sweep of its own.",
        "gifted-charts' slices have square ends, so the segments are cut apart by a stroke in the card's colour rather than rounded.",
      ],
      gestures: [
        { gesture: "Tap a segment", action: "Picks it: the hole shows its value and name and the others step back. Tap it again to put it back" },
        { gesture: "Tap a list row", action: "Picks the segment, as touching it on the ring does; tap it again to put it back" },
        { gesture: "Tap a swatch", action: "Turns the segment off or back on" },
      ],
    },
  },
  a11y: {
    role: "figure (web), one image and a list (phone)",
    label: "The summary: \"Tickets by channel: #support 312 (40.6%), #billing 158 (20.5%), #platform-eng 121 (15.7%), #onboarding 96 (12.5%), Email 82 (10.7%); total 769.\"",
    notes: [
      "The figure (the ring on the phone) is named by the sentence core's `segmentsOf` and `summarizeSegments` write from the rows: every segment, its value and its share, and the total. It is heard, not printed: the legend under the ring prints every segment's name, value and share, so colour is never the only way in.",
      "The list is the legend, the pick and the toggles: each row is a button that is pressed while its segment is the picked one (\"#billing, 158, 20.5%\"), so `selected` is reachable by keyboard and screen reader as well as by touching the ring. Each swatch is its own toggle button named \"Show #billing\", pressed while the segment shows (a switch on the phone), drawn beside the row's button and not inside it, so a screen reader reaches both; a segment that is off is struck through and faint, not only dimmer, with an en dash for its share. The last one showing cannot be turned off. The rows and swatches draw a focus ring.",
      "\"View as table\" is the other way in: every row, with real headers, and nothing folded into \"Other\".",
      "The ring's hole is drawn for the eye and hidden from a screen reader (it repeats the summary).",
    ],
  },
  examples: [
    { name: "Tickets by channel", description: "Five segments, the total in the hole, the legend in columns under it.", props: { ...tickets }, width: 560 },
    {
      name: "With a headline",
      description: "The card leads with a number, its change and what it is against.",
      props: { ...tickets, headline: { value: 769, delta: 0.034, period: "tickets, vs September" } },
      width: 560,
    },
    { name: "A segment picked", description: "`selected` is `#billing`: the hole shows its value and name, and the other segments step back.", props: frame({ selected: "#billing" }), width: 560 },
    { name: "A segment turned off", description: "`hidden` is the list's state: Email is off, so the shares re-fit to the four that are left and its row is struck through.", props: frame({ hidden: ["Email"] }), width: 560 },
    { name: "Eleven channels", description: "The first eight keep a colour of the palette; the other three are one segment, Other, in grey.", props: { ...tickets, data: CHANNELS_MANY, subtitle: "Eleven channels, October 2026" }, width: 560 },
    { name: "Loading", props: frame({ loading: true }), width: 560 },
  ],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why (the title and line are props); the card keeps its header and has no \"View as table\", since there is nothing to show. The figure's label says there is no data.",
      example: { name: "Empty", props: { data: [], name: "channel", value: "tickets", title: "Tickets in #billing", subtitle: "Empty", empty: "No tickets in this period", emptyLine: "Try a longer period, or another channel." }, width: 480 },
    },
    {
      title: "One segment",
      platforms: ["web", "desktop", "mobile"],
      handling: "One row is the whole ring: a full band with no gap and no rounded corner to cut it apart, its share 100% and the total its value.",
      example: { name: "One segment", props: { data: [{ channel: "#support", tickets: 312 }], name: "channel", value: "tickets", title: "Tickets by channel", subtitle: "Only #support so far", valueLabel: "Tickets" }, width: 520 },
    },
    {
      title: "All zero",
      platforms: ["web", "desktop", "mobile"],
      handling: "A whole of nothing has no shares to cut: the ring is its empty track in the grey the gauge's is, the hole says 0, every share is an en dash and the summary says every value is 0.",
      example: { name: "All zero", props: { data: CHANNELS.map((r) => ({ channel: r.channel, tickets: 0 })), name: "channel", value: "tickets", title: "Tickets by channel", subtitle: "A quiet week", valueLabel: "Tickets" }, width: 520 },
    },
    {
      title: "More than eight segments",
      platforms: ["web", "desktop", "mobile"],
      handling: "The palette has eight colours, and a ninth would wrap onto the first, so the first eight keep their own and every row after them is summed into one more, labelled \"Other\", in a neutral grey (`chart.other`) that is no colour of the palette. Pass the rows largest first so what is folded is what is smallest. It is one row in the list and turns off as one, and the summary says how many it holds (\"Other, 3 more, 47 (6.1%)\"). \"View as table\" shows every row.",
      example: { name: "Eleven channels", props: { ...tickets, data: CHANNELS_MANY, subtitle: "Eleven channels, October 2026" }, width: 520 },
    },
    {
      title: "A negative or missing value",
      platforms: ["web", "desktop", "mobile"],
      handling: "A share is never negative: a value under zero, or one that is not a number, counts as 0, so its segment has no width, its share is 0% and the others still add to the total. The table shows the row as it was given.",
      example: { name: "A refund", props: { data: [{ channel: "#support", tickets: 312 }, { channel: "#billing", tickets: -40 }, { channel: "Email", tickets: 82 }], name: "channel", value: "tickets", title: "Tickets by channel", subtitle: "One channel is negative", valueLabel: "Tickets" }, width: 520 },
    },
    {
      title: "A long name",
      platforms: ["web", "desktop", "mobile"],
      handling: "A name too long for its row is cut with an ellipsis, and the hole cuts its label the same way; the summary and the table have the whole name.",
      example: { name: "Long names", props: { data: [{ channel: "#customer-success-enterprise-escalations", tickets: 96 }, { channel: "#partner-integrations-and-marketplace", tickets: 58 }, { channel: "#support", tickets: 312 }], name: "channel", value: "tickets", title: "Tickets by channel", subtitle: "Long channel names", valueLabel: "Tickets", selected: "#customer-success-enterprise-escalations" }, width: 520 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Grey bars of uneven heights fill the plot and the card keeps its header. There is no list, no table button and no summary yet. A screen reader hears \"Loading chart\" once.",
      example: { name: "Loading", props: frame({ loading: true }), width: 480 },
    },
  ],
  related: ["gauge-chart", "radar-chart", "bar-chart", "progress-ring", "metric-value", "table", "delta", "card", "button", "skeleton", "empty-state"],
  flows: [
    {
      id: "focus-a-segment",
      title: "Look at #billing",
      description: "On the web and the desktop, pointing at a segment (or at its row) lights it; on the phone, a finger on the segment picks it. The hole says its number and the others step back.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        {
          kind: "data",
          title: "The app holds one row per channel",
          detail: "A row is a name and a number. The same rows feed this ring, a table and a stat; a ninth row and after would be folded into \"Other\" on the ring only.",
          code: "const rows = [{ channel: \"#support\", tickets: 312 }, { channel: \"#billing\", tickets: 158 }, …]",
        },
        {
          kind: "trigger",
          title: "The pointer moves onto #billing's segment, or onto its row",
          detail: "recharts reports which sector the pointer entered; a row reports the same through the interaction hook (hover, or keyboard focus). There is no press on the web and no state of the app's.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "A finger taps #billing's segment",
          detail: "There is no hover on a phone, so a tap picks the segment, and the tap that picks it again puts it back. gifted-charts finds the segment from where the finger landed.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onSelectedChange fires with the segment's name",
          detail: "A tap on the phone and a click on the web pick a segment, so the app can keep it (a filter that follows it, a saved view). Hovering reports nothing: it is the pointer's, and not worth saving.",
          code: "onSelectedChange?.(\"#billing\")",
        },
        {
          kind: "state",
          title: "#billing is the segment the ring shows",
          detail: "The chart's own state, or the app's when it passes `selected`. It is the hovered segment, else the picked one: pointing at another segment moves the hole to it, and leaving puts the picked one back.",
          code: "setPicked(\"#billing\")",
        },
        {
          kind: "motion",
          title: "The other segments step back and the number eases",
          detail: "The other segments go to 38% of their colour over 150ms on the kit's ease-out; the hole's number counts from the total to 158 (MetricValue) and its label swaps to the name. Reduced motion makes both a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The other segments step back and the number eases",
          detail: "The other segments take 38% of their colour, and the hole's number counts from the total to 158 (MetricValue) unless the person reduces motion.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The hole says 158 and #billing",
          detail: "The list's row for #billing is lit with it. Move off (web) or tap it again (phone) and the hole goes back to the total, 769.",
        },
      ],
      replay: [
        { step: 0, hold: 1800, props: frame({}) },
        { step: 5, hold: 2600, platforms: ["web", "desktop"], props: frame({ selected: "#billing" }) },
        { step: 6, hold: 2600, platforms: ["mobile"], props: frame({ selected: "#billing" }) },
      ],
    },
    {
      id: "turn-off-email",
      title: "Turn Email off",
      description: "The list is the segments' switch. Pressing a row takes the segment out of the ring and the shares re-fit to what is left; pressing it again brings it back. The last segment showing stays on.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        {
          kind: "data",
          title: "The list's state is the chart's, or the app's",
          detail: "Left alone, the chart keeps which segments are off. An app that wants to remember it (per user, per saved view) passes `hidden` with `onHiddenChange`.",
          code: "const [hidden, setHidden] = useState<string[]>([])",
        },
        {
          kind: "trigger",
          title: "The Email row is pressed",
          detail: "Each row is a toggle button, named for the segment and its numbers. A segment that is off is struck through and faint.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "The Email row is tapped",
          detail: "A toggle at least 44pt tall, selected while the segment shows.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onHiddenChange fires with every segment that is off",
          detail: "The whole list, not the one that moved, so the app never has to merge. Pressing the last segment showing calls nothing.",
          code: "onHiddenChange?.([\"Email\"])",
        },
        {
          kind: "state",
          title: "Email is off",
          detail: "The total, every share, the sentence a screen reader hears and the hole all follow it: they are worked out from the segments showing. The table still lists every row.",
          code: "setHidden([\"Email\"])",
        },
        {
          kind: "motion",
          title: "The ring re-cuts to four segments",
          detail: "The remaining segments tween to their new angles over 600ms on the kit's ease-out rather than being redrawn from the top, and the total counts down to 687. Reduced motion makes it a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The ring re-cuts to four segments",
          detail: "The ring is redrawn for its new data, and the total counts down to 687 (MetricValue) unless the person reduces motion.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "Four segments, 687 in the hole",
          detail: "#support is now 45.4%. Email's row reads struck through with an en dash for its share. Press it again to bring the segment back.",
        },
      ],
      replay: [
        { step: 0, hold: 1600, props: frame({ hidden: [] }) },
        { step: 1, press: 5, hold: 1100, platforms: ["web", "desktop"], props: frame({ hidden: [] }) },
        { step: 2, press: 5, hold: 1100, platforms: ["mobile"], props: frame({ hidden: [] }) },
        { step: 7, hold: 2400, props: frame({ hidden: ["Email"] }) },
      ],
    },
  ],
};

export default docs;
