import type { ComponentDocs } from "../../types";
import { MONEY, MONTH, MONTHS, commonProps, headingLevelProp } from "./chart-samples";

/** MRR against what was forecast for it, with Q4's target. */
const revenue = { data: MONTHS, x: "month", bars: "mrr", line: "forecast", xFormat: MONTH, format: MONEY, labels: { mrr: "MRR", forecast: "Forecast" } };

const docs: ComponentDocs = {
  id: "combo-chart",
  name: "ComboChart",
  category: "data",
  level: "organism",
  group: "chart",
  status: "draft",
  description:
    "What happened as bars, and what was expected as a dashed line over them, with an optional target line: revenue against its forecast, tickets against capacity. One card, one legend with a switch for each, one tooltip with both numbers. It is the common composed chart; a chart with more parts is written with the library and the same chart tokens (`rechartsTheme()`, `giftedTheme()`).",
  props: {
    headingLevel: headingLevelProp,
    data: {
      type: "array",
      sample: MONTHS,
      required: true,
      description: "Rows, one per category: [{ month: 1777593600000, mrr: 152400, forecast: 150000 }, …]. The same rows can feed a table, a stat and a line chart.",
    },
    x: { type: "string", sample: "month", required: true, description: "The field of each row that is the category: a date or a word." },
    bars: { type: "string", sample: "mrr", required: true, description: "The field drawn as bars: what happened. Bars keep zero." },
    line: { type: "string", sample: "forecast", required: true, description: "The field drawn as a dashed line across the bars, with a dot on each point: a forecast, a plan, a capacity." },
    ...commonProps({ title: "Revenue against forecast", subtitle: "Bars, a dashed line and a target", labels: { mrr: "MRR", forecast: "Forecast" }, height: 260, format: MONEY, xFormat: MONTH }),
    target: { type: "number", description: "A reference line at this value: a goal. The scale takes it in. Left out, there is none." },
    targetLabel: { type: "string", default: "", description: "What the target line says, at its left end: \"Q4 target $180K\". Empty draws a line with no words." },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title, an optional headline, \"View as table\" (Button); a ChartFrame holding recharts' ComposedChart with a Bar, a dashed Line behind it (its dots over the bars) and a ReferenceLine; the Legend (toggle buttons) in the header beside the Button, as the reference dashboard has it",
      import: "import { ComboChart } from \"@antfabric/ui-react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is reached only from there. The chart is handed an explicit width and height.",
        "The same `rechartsTheme(useChartTokens(), useReducedMotion())` as LineChart and BarChart, exported beside the chart: the grid, axes, bar and line geometry and the dash patterns are the tokens', so a ComposedChart written with recharts matches this one.",
        "Both series are in the scale whether or not the legend has them on, so turning the line off does not make the axis jump.",
        "The line is drawn as PeriodCompare's last period is (`chart.previousWidth`, the series dash, round ends) and behind the bars (in recharts' own area layer, over the grid and under the bars), so a bar keeps its own top where the two meet. Its dots stay over the bars: solid in the line's colour, ringed by the card.",
        "ComposedChart draws its cursor as a line whatever it is given, so the hovered category is marked by the line charts' dashed crosshair, not BarChart's wash.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to the legend's entries and \"View as table\"" },
        { keys: "ArrowRight", action: "In the plot: moves the tooltip to the next category" },
        { keys: "ArrowLeft", action: "In the plot: moves the tooltip to the previous category" },
        { keys: "Enter", action: "On a legend entry: turns the series off or back on" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, recharts' ComposedChart and Legend as web, at desktop density",
      import: "import { ComboChart } from \"@antfabric/ui-react/data\"",
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to the legend's entries and \"View as table\"" },
        { keys: "ArrowRight", action: "In the plot: moves the tooltip to the next category" },
        { keys: "ArrowLeft", action: "In the plot: moves the tooltip to the previous category" },
        { keys: "Enter", action: "On a legend entry: turns the series off or back on" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, a ChartFrame holding react-native-gifted-charts' BarChart with `showLine`, `lineData` and `lineConfig` for the dashed line, `lineData2` and `lineConfig2` for its dots, `referenceLine1` for the target and `renderTooltip` for the card; the Legend's toggles above the plot",
      import: "import { ComboChart } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "`giftedTheme(useChartTokens())` is the chart tokens as gifted-charts' own props, exported beside the chart; a chart the kit does not ship, written with gifted-charts and the same call, matches this one.",
        "The line is drawn by the bar chart over the bars, as PeriodCompare's last period is (`chart.previousWidth`, dashed). gifted-charts draws a point as one circle with no stroke, so each dot is two: a disc of the card on the first line, and the dot in the line's colour on a second line that draws no stroke.",
        "The points sit on the bars' centres: gifted-charts steps a line by a bar's width plus its `spacing`, so the kit passes the gap between bars, not the whole category.",
        "The line draws in with the bars unless the person reduces motion. Under react-native-web (the catalogue, `pnpm check`) gifted-charts' animation is off.",
      ],
      gestures: [
        { gesture: "Tap a bar", action: "Focuses its category: the tooltip card shows both numbers" },
        { gesture: "Tap a legend entry", action: "Turns the series off or back on" },
      ],
    },
  },
  a11y: {
    role: "figure (web), one image (phone)",
    label: "The summary: \"Revenue against forecast, May to Oct: MRR rose from $152.4K to $184.2K, highest in Oct; Forecast rose from $150K to $185K, highest in Oct.\"",
    notes: [
      "The figure is named by the sentence core's `summarize` writes from the rows; it is heard, not printed, and the tooltip and \"View as table\" give the numbers without colour. Bars and a dashed line differ in more than colour, so the two are told apart without it.",
      "\"View as table\" shows the same rows in Table: the bars' field and the line's, as columns.",
      "The legend says what it toggles: a button per series, pressed while it is on, struck through when it is off. The last one showing cannot be turned off.",
      "The target line is labelled in words at its end, and is in the summary's scale, so a goal above every bar still shows.",
      "On the web the plot is a stop for the arrow keys (recharts' accessibility layer): the tooltip moves category to category, and the plot draws a focus edge while the keyboard is in it.",
    ],
  },
  examples: [
    {
      name: "Revenue against forecast",
      description: "MRR as bars, the forecast as a dashed line, and Q4's target.",
      props: { ...revenue, title: "Revenue against forecast", subtitle: "Bars, a dashed line and a target", target: 180000, targetLabel: "Q4 target $180K" },
      width: 560,
    },
    {
      name: "With a headline",
      description: "The number the card leads with, and how it moved.",
      props: { ...revenue, title: "Revenue against forecast", subtitle: "October: $184.2K against $185K", headline: { value: 184200, format: MONEY, delta: 0.044, period: "vs September" } },
      width: 560,
    },
    { name: "The forecast turned off", description: "`hidden` is the legend's state: the line is off and the entry is struck through, but the axis does not move.", props: { ...revenue, title: "Revenue against forecast", hidden: ["forecast"] }, width: 560 },
    { name: "Loading", props: { ...revenue, loading: true }, width: 560 },
  ],
  matrix: [{ prop: "loading", width: 520 }],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why; the card keeps its header and has no \"View as table\" and no legend.",
      example: { name: "Empty", props: { ...revenue, data: [], title: "Revenue against forecast", subtitle: "Empty", empty: "No revenue in this period", height: 200 }, width: 480 },
    },
    {
      title: "One category",
      platforms: ["web", "desktop", "mobile"],
      handling: "One row draws one bar and the line's single point as a dot on it. The summary says what each is, not a trend.",
      example: { name: "One month", props: { ...revenue, data: MONTHS.slice(-1), title: "October", subtitle: "One category", height: 200 }, width: 480 },
    },
    {
      title: "A forecast under the actuals",
      platforms: ["web", "desktop", "mobile"],
      handling: "Nothing assumes the line is above the bars: they share one axis, and the tooltip lists both numbers whichever is bigger.",
      example: { name: "Behind forecast", props: { ...revenue, data: MONTHS.map((m) => ({ ...m, forecast: Math.round(m.mrr * 0.9) })), title: "Revenue against a lower forecast", height: 220 }, width: 520 },
    },
    {
      title: "A target outside the data",
      platforms: ["web", "desktop", "mobile"],
      handling: "The scale takes the target in, so a goal above every bar still draws, and its label stays inside the plot.",
      example: { name: "Far target", props: { ...revenue, title: "Revenue against forecast", target: 250000, targetLabel: "2027 goal $250K", height: 220 }, width: 520 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Grey bars of uneven heights fill the plot and the card keeps its header. There is no legend, no table button and no summary yet.",
      example: { name: "Loading", props: { ...revenue, loading: true, height: 180 }, width: 480 },
    },
  ],
  related: ["line-chart", "bar-chart", "table", "sparkline", "metric-value", "delta", "card", "button", "skeleton", "empty-state"],
};

export default docs;
