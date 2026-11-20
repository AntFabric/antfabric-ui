import type { ComponentDocs } from "../../types";
import { WEEK, commonProps } from "./chart-samples";

/** The props every ready-made chart takes alike, less the ones that mean a legend. */
const { title, subtitle, format, xFormat, height, empty, emptyLine } = commonProps({ title: "Tickets resolved by Fabric", subtitle: "This week against last, a day at a time", labels: {}, height: 200 });

/** This week's tickets against last week's: the same rows a table and a line chart can be fed. */
const week = { data: WEEK, x: "day", current: "thisWeek", previous: "lastWeek", labels: { thisWeek: "This week", lastWeek: "Last week" }, notes: { thisWeek: "Oct 19 to 25", lastWeek: "Oct 12 to 18" }, title: "Tickets resolved by Fabric", subtitle: "This week against last, a day at a time" };

const docs: ComponentDocs = {
  id: "period-compare",
  name: "PeriodCompare",
  category: "data",
  level: "organism",
  group: "panel",
  status: "draft",
  description:
    "This period against the last: both totals, this one large with a change badge and what it is against, beside a line chart that draws this period solid with a flat fill and the last one dashed, thinner and in a quiet grey. The totals sit beside the chart on the web and the desktop, and in a row above it on the phone. \"View as table\" shows both periods' rows in Table.",
  props: {
    data: {
      type: "array",
      sample: WEEK,
      required: true,
      description: "Rows, one per point of the period, in order: [{ day: \"Mon\", thisWeek: 64, lastWeek: 58 }, …]. The same rows can feed a table and a line chart. A value that is not a number leaves a gap, and counts as 0 in a total.",
    },
    x: { type: "string", sample: "day", required: true, description: "The field of each row that is the category: a day, a date or a word." },
    current: { type: "string", sample: "thisWeek", required: true, description: "The field that holds this period's values. Its line is solid, in the first series colour, with a flat fill under it." },
    previous: { type: "string", sample: "lastWeek", required: true, description: "The field that holds the last period's values. Its line is dashed and thinner (`chart.previousW`), in `chart.previous`, with no fill." },
    title,
    subtitle,
    format: { ...format, description: "A format name, its options or a function: what core's `fmt` takes. The two totals, the axis, the tooltip, the summary and \"View as table\" print through it, so they agree." },
    xFormat,
    labels: { type: "object", sample: { thisWeek: "This week", lastWeek: "Last week" }, description: "A field's name for people, over its total, in the tooltip and in the table's headers: { thisWeek: \"This week\" }. A field with no entry prints its own name." },
    notes: { type: "object", sample: { thisWeek: "Oct 19 to 25", lastWeek: "Oct 12 to 18" }, description: "A line under each total, by field: what the period is. Left out, the total has none." },
    inverse: { type: "boolean", default: false, description: "Down is good (spend, churn, response time): the badge's colours and its spoken \"good\" or \"bad\" swap, the arrow does not." },
    period: { type: "string", default: "vs last week", description: "What the change is against, after the badge. The badge is this period's total against the last one's, never a prop: it cannot disagree with the two totals beside it." },
    height,
    empty,
    emptyLine,
    loading: { type: "boolean", default: false, description: "Grey lines where the totals go and grey bars in place of the plot, from the kit's Skeleton, and no \"View as table\". The header stays, so the card does not jump when the data arrives. Screen readers hear it once." },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title and \"View as table\" (Button); a row of a column of two <figure> totals (MetricValue, Delta) and a ChartFrame holding recharts' ComposedChart: the same Area and Line the LineChart draws, the last period's Line dashed and thinner",
      import: "import { PeriodCompare } from \"@antfabric-ui/react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is reached only from there. The plot is LineChart's own (the kit's `RechartsLines`), so the grid, axes, tooltip, crosshair and motion are the same, and the legend is gone because the two totals are the key: each has a short line in its series' colour, solid or dashed as the chart draws it.",
        "The two periods share one value axis, which does not start at zero (a line's height is not its value), so a gap between them is the gap in the numbers.",
        "The change is worked out from the two totals: (this less last) over last, printed as a signed percent in a Delta badge. A last period of nothing has no change to say, so the badge reads \"Change unavailable\".",
        "The lines draw in once over 600ms on the kit's ease-out, and the totals ease to new numbers (MetricValue). Reduced motion turns both off.",
        "The column of totals is `chart.sideW` wide with a rule on its right; below that width the card is narrower than the chart needs and the plot gives way first.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to \"View as table\"" },
        { keys: "ArrowRight", action: "In the plot: moves the tooltip to the next point" },
        { keys: "ArrowLeft", action: "In the plot: moves the tooltip to the previous point" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, totals and recharts' ComposedChart as web, at desktop density",
      import: "import { PeriodCompare } from \"@antfabric-ui/react/data\"",
      notes: ["The same chart as the web's. Hover is the pointer's, so the tooltip follows it."],
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to \"View as table\"" },
        { keys: "ArrowRight", action: "In the plot: moves the tooltip to the next point" },
        { keys: "ArrowLeft", action: "In the plot: moves the tooltip to the previous point" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, the two totals in a row above the chart (each its own accessible element), and a ChartFrame holding react-native-gifted-charts' LineChart (`data` and `data2`, `strokeDashArray2` and `thickness2` for the last period, `areaChart1` for the fill)",
      import: "import { PeriodCompare } from \"@antfabric-ui/react-native/data\"",
      notes: [
        "Shipped from the data subpath: gifted-charts and react-native-svg are reached only from there. The plot is LineChart's own (the kit's `GiftedLines`), with the same scale, so the phone prints the axis the web does.",
        "The totals take a row above the chart, each half the width, with a rule under them: the chart keeps the card's whole width.",
        "The lines draw in unless the person reduces motion. Under react-native-web (the catalogue, `pnpm check`) gifted-charts' animation is off, because the values it animates with reach the DOM as text.",
      ],
      gestures: [{ gesture: "Press and drag along the plot", action: "A dashed strip follows the finger and the tooltip card shows both periods at that point; lifting the finger hides it" }],
    },
  },
  a11y: {
    role: "figure (web), one image (phone)",
    label: "The summary: \"Tickets resolved by Fabric: This week 412 against Last week 371, up 11.1%. This week: highest Thu (75), lowest Sun (34); Last week: highest Wed (66), lowest Sun (31).\"",
    notes: [
      "The figure is named by the sentence core's `summarizeCompare` writes from the rows: both totals, the change, and each period's best and worst point. It is heard, not printed: both totals sit beside the plot with their names, so colour is never the only way in. Dashed against solid is the second way to tell the two lines apart.",
      "On the phone each total is one accessible element (\"This week, Oct 19 to 25, 412, up 11.1% vs last week\"), and the key's line and the badge are not read separately.",
      "The change is the badge's own sentence (\"Up 11.1%, good\"), which Delta says; a last period of nothing says \"Change unavailable\" and not 0%.",
      "\"View as table\" is the other way in: both periods, point by point, in Table with real headers.",
      "With `inverse` a rise reads \"Up 11.1%, bad\", in words as well as colour. On the web the totals column wraps above the plot when the card is too narrow to leave the plot room.",
    ],
  },
  examples: [
    { name: "This week against last", description: "Two totals beside the chart: this week's large, with its change and what it is against, and the week before, quieter.", props: { ...week }, width: 760 },
    { name: "A week in step", description: "Every day a ticket ahead of the week before: the two lines run close together and the badge says how small the gap is.", props: { ...week, data: WEEK.map((r) => ({ ...r, thisWeek: r.lastWeek + 1 })), subtitle: "A week in step with the last" }, width: 760 },
    { name: "Loading", props: { ...week, loading: true }, width: 760 },
  ],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why (the title and line are props); the card keeps its header, and has no totals and no \"View as table\", since there is nothing to total or show. The figure's label says there is no data.",
      example: { name: "Empty", props: { data: [], x: "day", current: "thisWeek", previous: "lastWeek", title: "Tickets resolved by Fabric", subtitle: "Nothing this week yet", empty: "No tickets resolved yet", emptyLine: "Fabric's first week will show up here." }, width: 640 },
    },
    {
      title: "A last period of nothing",
      platforms: ["web", "desktop", "mobile"],
      handling: "A change is a share of what it is against, and nothing has no share. When the last period totals 0 the badge reads \"Change unavailable\" with an en dash, the screen reader's sentence leaves the change out and does not say 0%, and both lines and totals are drawn as they are.",
      example: { name: "A new queue", props: { data: WEEK.map((r) => ({ ...r, lastWeek: 0 })), x: "day", current: "thisWeek", previous: "lastWeek", labels: { thisWeek: "This week", lastWeek: "Last week" }, notes: { thisWeek: "Oct 19 to 25", lastWeek: "Not live yet" }, title: "Tickets resolved by Fabric", subtitle: "Fabric went live on Monday" }, width: 760 },
    },
    {
      title: "One point",
      platforms: ["web", "desktop", "mobile"],
      handling: "One row has no line to draw: each period is a ring in its own colour (this one blue, the last one grey), and the totals are those two numbers.",
      example: { name: "One day", props: { data: [WEEK[0]], x: "day", current: "thisWeek", previous: "lastWeek", labels: { thisWeek: "This week", lastWeek: "Last week" }, title: "Tickets resolved by Fabric", subtitle: "Monday only" }, width: 760 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Three grey lines the size of a total, a note and a badge fill the column of totals and grey bars of uneven heights fill the plot; the card keeps its header. There is no table button and no summary yet. A screen reader hears \"Loading totals\" and \"Loading chart\" once each.",
      example: { name: "Loading", props: { ...week, loading: true }, width: 760 },
    },
  ],
  related: ["line-chart", "metric-tabs", "kpi-card", "stat-tile", "metric-value", "delta", "table", "card", "button", "skeleton", "empty-state"],
  flows: [
    {
      id: "compare-the-week",
      title: "Compare this week with last",
      description: "The app holds both weeks' rows and a new week's numbers arrive. The totals count to their new values, the badge says how far apart they are, and the two lines redraw. Pointing at a day shows both weeks' number for it.",
      platforms: ["web", "desktop", "mobile"],
      width: 760,
      steps: [
        {
          kind: "data",
          title: "The app holds one row per day, with both weeks on it",
          detail: "Each row is a day with two numbers. The same rows feed this panel, a table and a line chart; the totals and the change are worked out from them, so no total is passed in that could disagree with the lines.",
          code: "const rows = [{ day: \"Mon\", thisWeek: 64, lastWeek: 58 }, …]",
        },
        {
          kind: "trigger",
          title: "A new day's tickets arrive",
          detail: "The week's numbers change as Fabric resolves tickets: the app updates the row and passes the new `data`.",
          lane: "system",
        },
        {
          kind: "state",
          title: "The totals and the change are worked out",
          detail: "core's `compareTotals` sums each field and divides the difference by the last period's total. A last period of 0 has no change to say.",
          code: "compareTotals(rows, \"thisWeek\", \"lastWeek\") // { current: 412, previous: 371, change: 0.111 }",
        },
        {
          kind: "motion",
          title: "The totals count and the lines redraw",
          detail: "The two totals ease to their new numbers over 300ms on the kit's ease-out (MetricValue) and the lines tween to their new points over 600ms. Reduced motion makes both a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The totals count and the lines redraw",
          detail: "The two totals ease to their new numbers (MetricValue) and the lines are redrawn for the new data unless the person reduces motion.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "412, up 11.1%, against 371",
          detail: "This week's total is the large one with its badge and \"vs last week\"; last week's is quieter, with its own note. The figure's name says the same for a screen reader.",
        },
      ],
      replay: [
        { step: 0, hold: 2200, props: { ...week, data: WEEK.map((r) => ({ ...r, thisWeek: Math.round(r.thisWeek * 0.8) })) } },
        { step: 3, hold: 2800, platforms: ["web", "desktop"], props: { ...week } },
        { step: 4, hold: 2800, platforms: ["mobile"], props: { ...week } },
      ],
    },
  ],
};

export default docs;
