import type { ComponentDocs } from "../../types";
import { MONEY, MONTH, MONTHS, SEATS, commonProps, headingLevelProp } from "./chart-samples";

/** The same rows two ways: an `x` and a `y` for the chart, and the headline above it. */
const opened = { data: MONTHS, x: "month", y: ["opened", "resolved"], xFormat: MONTH, labels: { opened: "Opened", resolved: "Resolved" } };

/** Five fields to a month, the most a line chart draws. */
const five = MONTHS.map((m) => ({ month: m.month, opened: m.opened, resolved: m.resolved, fabric: m.fabric, people: m.people, escalated: Math.round(m.opened / 12) }));

const docs: ComponentDocs = {
  id: "line-chart",
  name: "LineChart",
  category: "data",
  level: "organism",
  group: "chart",
  status: "draft",
  description:
    "One to five series as lines over time, in a card with a title, an optional headline number and a legend that turns series off. An optional flat fill under the first series, and a target line. The value axis follows the data (it does not start at zero), the tooltip follows the pointer or the finger, and \"View as table\" shows the same rows in Table.",
  props: {
    headingLevel: headingLevelProp,
    data: {
      type: "array",
      sample: MONTHS,
      required: true,
      description: "Rows, one per point, in order: [{ month: 1777593600000, opened: 612, resolved: 580 }, …]. The same rows can feed a table, a stat and a bar chart.",
    },
    x: { type: "string", sample: "month", required: true, description: "The field of each row that is the category: a date or a word." },
    y: {
      type: "array",
      sample: ["opened", "resolved"],
      required: true,
      description: "The field, or fields, that are the values: \"mrr\" or [\"opened\", \"resolved\"]. One to five; a sixth and after are not drawn , though \"View as table\" keeps every field. A value that is not a number leaves a gap.",
    },
    ...commonProps({ title: "Tickets opened and resolved", subtitle: "All channels, May to October 2026", labels: { opened: "Opened", resolved: "Resolved" }, height: 240, xFormat: MONTH }),
    area: { type: "boolean", default: false, description: "A flat fill under the first series: its colour at one opacity, never a gradient. Only the first is filled: two fills over each other mix into a colour neither series has." },
    marks: { type: "boolean", default: false, description: "Each series gets its own dash pattern and marker shape besides its colour, in the plot and in the legend's key, so two series are never told apart by hue alone. Markers are left off past 40 points. Off by default: the plot keeps its plain lines." },
    target: { type: "number", description: "A reference line at this value: a goal, a limit. The value axis takes it in, so a target outside the data still shows." },
    targetLabel: { type: "string", default: "", description: "What the target line says, at its right end: \"Q4 target $180K\". Empty draws a line with no words." },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title, an optional headline (MetricValue, Delta), the kit's Button for \"View as table\"; a ChartFrame (width measured, a fixed default on the server) holding recharts' ComposedChart with an Area for the fill and a Line per series; the Legend (toggle buttons) in the header beside the Button, as the reference dashboard has it",
      import: "import { LineChart } from \"@antfabric/ui-react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is a dependency of the React kit and is reached only from there. The chart is handed an explicit width and height, never a responsive container.",
        "Everything the chart reads from the tokens goes through `rechartsTheme(useChartTokens(), useReducedMotion())`, exported beside the chart: the dashed grid, the quiet axes, the crosshair, the target line, the series colours and the motion. A chart the kit does not ship is written with recharts and the same call: `<CartesianGrid {...theme.grid} /> <XAxis dataKey=\"week\" {...theme.axis} /> <Tooltip {...theme.tooltip} content={…ChartTooltip…} />`, and it matches.",
        "The lines draw in once over 600ms on the kit's ease-out and tween to new values (a series turned off, new rows); the tooltip glides between points over 150ms. Reduced motion turns all of it off.",
        "The value axis does not start at zero: a line's height is not its value. core's `niceScale` rounds the ticks with a little air so a line never runs along the frame, and the phone prints the same ticks.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to the legend's entries and \"View as table\"" },
        { keys: "ArrowRight", action: "In the plot: moves the tooltip to the next point" },
        { keys: "ArrowLeft", action: "In the plot: moves the tooltip to the previous point" },
        { keys: "Enter", action: "On a legend entry: turns the series off or back on" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, recharts' ComposedChart and Legend as web, at desktop density",
      import: "import { LineChart } from \"@antfabric/ui-react/data\"",
      notes: ["The same `rechartsTheme()` as web. Hover is the pointer's, so the tooltip follows it; there is no press-and-hold."],
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to the legend's entries and \"View as table\"" },
        { keys: "ArrowRight", action: "In the plot: moves the tooltip to the next point" },
        { keys: "ArrowLeft", action: "In the plot: moves the tooltip to the previous point" },
        { keys: "Enter", action: "On a legend entry: turns the series off or back on" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, a ChartFrame measured by onLayout holding react-native-gifted-charts' LineChart (`data` to `data5`, `areaChart1` for the fill, `pointerConfig` for the tooltip); the Legend's toggles above the plot",
      import: "import { LineChart } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "Shipped from the data subpath: gifted-charts and react-native-svg are reached only from there. The kit adds `expo-linear-gradient` as a peer, which gifted-charts loads at import.",
        "`giftedTheme(useChartTokens())` is the chart tokens as gifted-charts' own props (the dashed rules, the quiet axes, the target line, the pointer, the series colours), exported beside the chart, so a chart the kit does not ship matches the ones it does.",
        "gifted-charts' value axis is a range above an offset, so the kit converts core's `niceScale` into `yAxisOffset`, `maxValue`, `stepValue` and `noOfSections` (the target is `referenceLine1Position`, an absolute value): the same ticks as the web's.",
        "The lines draw in unless the person reduces motion. Under react-native-web (the catalogue, `pnpm check`) gifted-charts' animation is off, because the values it animates with reach the DOM as text.",
      ],
      gestures: [
        { gesture: "Press and drag along the plot", action: "A dashed strip follows the finger and the tooltip card shows each series at that point; lifting the finger hides it" },
        { gesture: "Tap a legend entry", action: "Turns the series off or back on" },
      ],
    },
  },
  a11y: {
    role: "figure (web), one image (phone)",
    label: "The summary: \"Tickets opened and resolved, May to Oct: Opened rose from 612 to 769, highest in Oct; Resolved rose from 580 to 781, highest in Oct.\"",
    notes: [
      "The figure is named by the sentence core's `summarize` writes from the rows: dates read as a trend (rose, fell, held, and where it peaked), categories as highest and lowest. It is heard, not printed: in the light theme most series colours sit under 3:1 against the card, so the tooltip and \"View as table\" give the numbers without colour.",
      "\"View as table\" is the other way in: the same rows in Table, with real headers. It is a Button, so it is reached by keyboard and named by what it will do.",
      "With `marks`, a series is told apart by its dash and marker as well as its colour (the first is solid with a round marker, the next dashed with a square, and so on), and the legend's key draws the same. Without it, the tooltip and the table are the relief for series that are close in hue.",
      "The legend says what it toggles: each entry is a button that is pressed while the series is on (\"Resolved, pressed\"), and an entry that is off is struck through and faint, not only dimmer. The last series showing cannot be turned off, so a chart is never blank because of a press.",
      "On the web the plot is a stop for the arrow keys (recharts' accessibility layer): the tooltip moves point to point, and the plot draws a focus edge from the tokens while the keyboard is in it. The phone's plot is one image; the sentence and the table carry it.",
      "The tooltip is drawn with `role=\"tooltip\"` on the web and is never the only place a value is: the table has every one.",
    ],
  },
  examples: [
    {
      name: "Opened and resolved",
      description: "Two series, a fill under the first and a headline: the number the card leads with, its change and what it is against.",
      props: { ...opened, title: "Tickets opened and resolved", subtitle: "All channels, May to October 2026", area: true, headline: { value: 781, delta: 0.015, period: "resolved in October" } },
      width: 560,
    },
    {
      name: "MRR against a target",
      description: "One series with a goal: the target line and its label, and a value axis that takes the goal in.",
      props: {
        data: MONTHS,
        x: "month",
        y: "mrr",
        xFormat: MONTH,
        title: "Monthly recurring revenue",
        subtitle: "With a target line",
        format: MONEY,
        labels: { mrr: "MRR" },
        target: 180000,
        targetLabel: "Q4 target $180K",
        area: true,
        headline: { value: 184200, format: MONEY, delta: 0.044, period: "vs September" },
      },
      width: 560,
    },
    {
      name: "Five series",
      description: "The most a line chart draws. Each has its own colour from the palette, and the legend names every one.",
      props: { data: five, x: "month", y: ["opened", "resolved", "fabric", "people", "escalated"], xFormat: MONTH, title: "Where tickets went", subtitle: "Five series", labels: { opened: "Opened", resolved: "Resolved", fabric: "By Fabric", people: "By people", escalated: "Escalated" }, height: 260 },
      width: 560,
    },
    {
      name: "A series turned off",
      description: "`hidden` is the legend's state: Resolved is off, so the axis re-fits to Opened and the entry is struck through.",
      props: { ...opened, title: "Tickets opened and resolved", hidden: ["resolved"] },
      width: 560,
    },
    { name: "Loading", props: { ...opened, loading: true }, width: 560 },
  ],
  matrix: [{ prop: "area", width: 520 }],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why (the title and line are props); the card keeps its header and has no \"View as table\" and no legend, since there is nothing to show or toggle. The figure's label says there is no data.",
      example: { name: "Empty", props: { data: [], x: "month", y: "opened", title: "Tickets in #billing", subtitle: "Empty", empty: "No tickets in this period", emptyLine: "Try a longer period, or another channel.", height: 180 }, width: 480 },
    },
    {
      title: "One point",
      platforms: ["web", "desktop", "mobile"],
      handling: "One row has no line to draw, so it is a dot (ringed in the card's colour, on the web; the phone's pointer still finds it). The summary says \"Runs is 455\": one value has no trend.",
      example: { name: "One point", props: { data: MONTHS.slice(-1), x: "month", y: "fabric", xFormat: MONTH, title: "Fabric runs", subtitle: "One point", labels: { fabric: "Runs" }, height: 180 }, width: 480 },
    },
    {
      title: "All zero",
      platforms: ["web", "desktop", "mobile"],
      handling: "A series that never leaves zero has no range to fit, so the axis reads 0 to 1 and the line lies along the bottom, not through the middle of a made-up scale. The summary says it held at 0.",
      example: { name: "All zero", props: { data: MONTHS.map((m) => ({ month: m.month, escalated: 0 })), x: "month", y: "escalated", xFormat: MONTH, title: "Escalated to engineering", subtitle: "Nothing escalated", labels: { escalated: "Escalated" }, height: 200 }, width: 480 },
    },
    {
      title: "Negative values",
      platforms: ["web", "desktop", "mobile"],
      handling: "A line may cross zero: the value axis runs under it and draws the zero rule with the others. A line of positive values never gets a negative axis, whatever air the scale adds.",
      example: { name: "Seats", props: { data: SEATS, x: "month", y: "net", xFormat: MONTH, title: "Net seats added", subtitle: "Two months lost seats", labels: { net: "Seats" }, height: 200 }, width: 480 },
    },
    {
      title: "More than five series",
      platforms: ["web", "desktop", "mobile"],
      handling: "A line chart draws the first five, on both kits (the phone's library draws five). The legend and the table hold the same five. A sixth is a different chart: a table, or a BarChart.",
      example: { name: "Six fields", props: { data: five.map((r) => ({ ...r, backlog: 150 })), x: "month", y: ["opened", "resolved", "fabric", "people", "escalated", "backlog"], xFormat: MONTH, title: "Six fields", subtitle: "The sixth is not drawn", height: 240 }, width: 560 },
    },
    {
      title: "A long series name",
      platforms: ["web", "desktop", "mobile"],
      handling: "Names are the app's words, and a long one wraps in the legend and the tooltip rather than being cut; the legend's entries wrap onto a second line.",
      example: { name: "Long names", props: { ...opened, title: "Tickets", labels: { opened: "Tickets opened across every channel, including email", resolved: "Tickets resolved by Fabric or by a person" } }, width: 480 },
    },
    {
      title: "A target outside the data",
      platforms: ["web", "desktop", "mobile"],
      handling: "The value axis takes the target in, so a goal above every point still draws, with the line well under it, and the label stays inside the plot.",
      example: { name: "Far target", props: { data: MONTHS, x: "month", y: "mrr", xFormat: MONTH, title: "Monthly recurring revenue", format: MONEY, labels: { mrr: "MRR" }, target: 250000, targetLabel: "2027 goal $250K", height: 220 }, width: 520 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Grey bars of uneven heights fill the plot and the card keeps its header. There is no legend, no table button and no summary yet. A screen reader hears \"Loading chart\" once.",
      example: { name: "Loading", props: { ...opened, loading: true, height: 180 }, width: 480 },
    },
  ],
  related: ["bar-chart", "combo-chart", "sparkline", "table", "metric-value", "delta", "card", "button", "skeleton", "empty-state"],
  flows: [
    {
      id: "read-a-point",
      title: "Read October's numbers",
      description: "The tooltip follows the pointer on the web and the desktop, and a finger pressed on the plot on the phone: one card, the same rows, listing every series at that point.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        {
          kind: "data",
          title: "The app holds one row per month",
          detail: "A row is a category and a number per series. The same rows feed this chart, a table and a stat, so a dashboard fetches once.",
          code: "const rows = [{ month: Date.UTC(2026, 9, 1), opened: 769, resolved: 781 }, …]",
        },
        {
          kind: "trigger",
          title: "The pointer moves over October",
          detail: "recharts finds the nearest category as the pointer moves; it has no press, and a keyboard does the same with the arrow keys.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "A finger is pressed on the plot and dragged",
          detail: "There is no hover on a phone, so a press is the pointer: it picks up at once (no long press) and follows the finger left and right, and lifting it puts the card away.",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The active point is October",
          detail: "The chart's own state, not the app's: nothing is reported and nothing needs saving. Every series at that category is active together.",
          code: "activeTooltipIndex: 5",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The pointer is on October",
          detail: "gifted-charts keeps the pointer's index; the kit's card is drawn for that row.",
          code: "pointerLabelComponent: (_items, _secondary, index) => <ChartTooltip tip={tipRows(rows[index], …)} />",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The crosshair and the card glide to it",
          detail: "A dashed crosshair runs through the point and each line's dot grows a ring in the card's colour. The card eases from the last point to this one over 150ms on the kit's ease-out; reduced motion makes it a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The strip and the card follow the finger",
          detail: "A dashed strip runs through the point and the card sits above the finger, kept inside the plot. It tracks the finger with no easing: a finger is already smooth.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "One card: October, and each series' value",
          detail: "The title is the category as the chart prints it, each row is a swatch, the series' name and its value in the chart's format. A stacked bar chart adds a total. Moving off the plot puts the card away.",
        },
      ],
      replay: [{ step: 0, hold: 2600, props: { ...opened, title: "Tickets opened and resolved", area: true } }],
    },
    {
      id: "turn-off-resolved",
      title: "Turn Resolved off",
      description: "The legend is the series' switch. Pressing an entry takes the line out and the axis re-fits to what is left; pressing it again brings it back. The last series showing stays on.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        {
          kind: "data",
          title: "The legend's state is the chart's, or the app's",
          detail: "Left alone, the chart keeps which series are off. An app that wants to remember it (per user, per saved view) passes `hidden` with `onHiddenChange`.",
          code: "const [hidden, setHidden] = useState<string[]>([])",
        },
        {
          kind: "trigger",
          title: "The Resolved entry is pressed",
          detail: "Each entry is a toggle button, named for the series. A series that is off is struck through and faint.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "The Resolved entry is tapped",
          detail: "A toggle at least 44pt tall, named for the series, that is selected while the series is on.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onHiddenChange fires with every series that is off",
          detail: "The whole list, not the one that moved, so the app never has to merge. Pressing the last series showing calls nothing.",
          code: "onHiddenChange?.([\"resolved\"])",
        },
        {
          kind: "state",
          title: "The series is off",
          detail: "The scale, the summary, the tooltip rows and the table's columns all follow it: they are worked out from the series showing.",
          code: "setHidden([\"resolved\"])",
        },
        {
          kind: "motion",
          title: "The line is taken out and the other re-fits",
          detail: "The remaining line tweens to the new axis over 600ms on the kit's ease-out rather than being redrawn from the left. Reduced motion makes it a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The line is taken out and the other re-fits",
          detail: "gifted-charts redraws the chart for its new data and range, unless the person reduces motion.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "Only Opened is drawn",
          detail: "The axis now fits Opened's range, the figure's sentence is about Opened alone, and the Resolved entry reads struck through. Press it again to bring the line back.",
        },
      ],
      replay: [
        { step: 0, hold: 1600, props: { ...opened, title: "Tickets opened and resolved", hidden: [] } },
        { step: 1, press: "Resolved", hold: 1100, platforms: ["web", "desktop"], props: { ...opened, title: "Tickets opened and resolved", hidden: [] } },
        { step: 2, press: "Resolved", hold: 1100, platforms: ["mobile"], props: { ...opened, title: "Tickets opened and resolved", hidden: [] } },
        { step: 7, hold: 2400, props: { ...opened, title: "Tickets opened and resolved", hidden: ["resolved"] } },
      ],
    },
  ],
};

export default docs;
