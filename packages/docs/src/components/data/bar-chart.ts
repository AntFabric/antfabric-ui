import type { ComponentDocs } from "../../types";
import { BY_CATEGORY, CATEGORIES, DAILY, DAY, LONG, MONTH, MONTHS, REPLY, SEATS, TEAMS, commonProps, headingLevelProp } from "./chart-samples";

const MINUTES = { type: "decimal", unit: " min" } as const;

/** The stacked sample: what Fabric and people resolved each month. */
const resolved = { data: MONTHS, x: "month", y: ["fabric", "people"], xFormat: MONTH, labels: { fabric: "Fabric", people: "People" }, stacked: true };

const docs: ComponentDocs = {
  id: "bar-chart",
  name: "BarChart",
  category: "data",
  level: "organism",
  group: "chart",
  status: "draft",
  description:
    "Bars for comparing categories, in a card with a title, an optional headline number and a legend that turns series off. Series sit side by side, are stacked on one bar, or run left to right for long labels and ranked lists. Bars always start at zero: a bar's length is its value. A single series with a loss is coloured by sign, so a bar below zero reads as one.",
  props: {
    headingLevel: headingLevelProp,
    data: {
      type: "array",
      sample: TEAMS,
      required: true,
      description: "Rows, one per category: [{ team: \"Support\", fabric: 182, people: 141 }, …]. The same rows can feed a table, a stat and a line chart.",
    },
    x: { type: "string", sample: "team", required: true, description: "The field of each row that is the category: a word or a date." },
    y: {
      type: "array",
      sample: ["fabric", "people"],
      required: true,
      description: "The field, or fields, that are the values: \"minutes\" or [\"fabric\", \"people\"]. More than one are grouped side by side, or stacked. A value that is not a number draws no bar.",
    },
    ...commonProps({ title: "Resolved this month by team", subtitle: "Grouped, October", labels: { fabric: "Fabric", people: "People" }, height: 240 }),
    stacked: { type: "boolean", default: false, description: "Stack the series on one bar, in order, the last one carrying the rounded end. The tooltip adds a total. A stack's scale is its sums, positives and negatives apart." },
    horizontal: {
      type: "boolean",
      default: false,
      description:
        "Bars run left to right with the categories down the side. A single series gets its value at each bar's end and no value axis. Long category labels are cut with an ellipsis and the tooltip has the full one. On the phone a single horizontal series is a ranked list of rows, not a rotated chart.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title, an optional headline, \"View as table\" (Button); a ChartFrame holding recharts' BarChart (`layout=\"vertical\"` for horizontal) with a Bar per series, Cells for the hover dim and the sign colours, and a LabelList for a horizontal bar's value; the Legend (toggle buttons) in the header beside the Button, as the reference dashboard has it",
      import: "import { BarChart } from \"@antfabric-ui/react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is reached only from there. The chart is handed an explicit width and height.",
        "Everything the chart reads from the tokens goes through `rechartsTheme(useChartTokens(), useReducedMotion())`, exported beside the chart: `<CartesianGrid {...theme.grid} /> <XAxis dataKey=\"team\" {...theme.axis} /> <Bar fill={theme.series[0]} radius={theme.bar.radius} maxBarSize={theme.bar.maxBarSize} {...theme.motion.draw} />`. A chart the kit does not ship, written with recharts and the same call, matches.",
        "The hovered category keeps its colour and the rest step back to 38% over 150ms; a bar's fill eases to a new colour over 250ms. The bars draw in once over 600ms on the kit's ease-out and tween to new values; reduced motion turns the movement off and keeps the fades.",
        "A horizontal chart gives its categories up to 40% of the width, cuts a longer label with an ellipsis (the tooltip shows the whole one) and draws each bar's value after it, with no value axis and no rules.",
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
      base: "The same Card, recharts' BarChart and Legend as web, at desktop density",
      import: "import { BarChart } from \"@antfabric-ui/react/data\"",
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to the legend's entries and \"View as table\"" },
        { keys: "ArrowRight", action: "In the plot: moves the tooltip to the next category" },
        { keys: "ArrowLeft", action: "In the plot: moves the tooltip to the previous category" },
        { keys: "Enter", action: "On a legend entry: turns the series off or back on" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, a ChartFrame holding react-native-gifted-charts' BarChart (`data` for grouped bars, `stackData` for stacked, `renderTooltip` for the card); a horizontal single series is a ranked list of Views instead;; the Legend's toggles above the plot",
      import: "import { BarChart } from \"@antfabric-ui/react-native/data\"",
      notes: [
        "`giftedTheme(useChartTokens())` is the chart tokens as gifted-charts' own props, exported beside the chart: `<BarChart {...theme.axis} barWidth={theme.bar.width} frontColor={theme.series[0]} />`.",
        "Horizontal bars are a ranked list of rows (label and value over a track and its fill), not a rotated gifted-charts chart, whose labels turn sideways on a 390pt screen. More than one horizontal series draws the vertical chart.",
        "gifted-charts' `height` is the part above zero: sections below zero are added to it, so the kit shrinks the plot by their share to keep the card's height, and moves a negative bar's label under the bar (`autoShiftLabels`).",
        "gifted-charts opens its own tooltip on a grouped bar, but not on a stack (it compares the stack's selection with `===` against an array), so the kit draws the card itself over the pressed stack, centred on it and kept inside the plot. A press also lights the category's bars and steps the rest back, as the web's hover does.",
        "A long series (fourteen days) has more labels than room: the kit draws one in every few, centred on its bar, and the tooltip names the day.",
        "The bars draw in unless the person reduces motion. Under react-native-web (the catalogue, `pnpm check`) gifted-charts' animation is off.",
      ],
      gestures: [
        { gesture: "Tap a bar", action: "Focuses its category: the others step back and the tooltip card shows each series at it" },
        { gesture: "Tap a legend entry", action: "Turns the series off or back on" },
      ],
    },
  },
  a11y: {
    role: "figure (web), one image (phone)",
    label: "The summary: \"Resolved this month by team: Fabric: highest Support (182), lowest Sales ops (42); People: highest Support (141), lowest Onboarding (39).\"",
    notes: [
      "The figure is named by the sentence core's `summarize` writes from the rows: categories read as highest and lowest, dates as a trend. It is heard, not printed: in the light theme most series colours sit under 3:1 against the card, so the tooltip and \"View as table\" give the numbers without colour.",
      "\"View as table\" shows the same rows in Table, with real headers, and a Button names it by what it will do (\"View as table\", then \"View as chart\").",
      "The legend says what it toggles: each entry is a button that is pressed while its series is on, and one that is off is struck through, not only dimmer. The last series showing cannot be turned off.",
      "A bar coloured by sign is never only coloured: the tooltip and the table print the value with its minus, and a bar below zero hangs under a zero rule.",
      "On the web the plot is a stop for the arrow keys (recharts' accessibility layer): the tooltip moves category to category, and the plot draws a focus edge while the keyboard is in it.",
    ],
  },
  examples: [
    {
      name: "Stacked, by month",
      description: "Fabric and people on one bar, the total in the tooltip. The headline's change is in points: a share moves in points, not in percent of a percent.",
      props: { ...resolved, title: "Resolved: Fabric and people", subtitle: "Stacked, by month", headline: { value: 0.583, format: "percent", delta: 0.038, deltaFormat: "points", period: "by Fabric in October" } },
      width: 560,
    },
    { name: "Grouped, by team", description: "Side by side: Fabric's and people's resolved tickets for each team in October.", props: { data: TEAMS, x: "team", y: ["fabric", "people"], title: "Resolved this month by team", subtitle: "Grouped, October", labels: { fabric: "Fabric", people: "People" } }, width: 560 },
    {
      name: "First reply by channel",
      description: "Horizontal, one series: the value at the end of each bar and no value axis. On the phone it is a ranked list.",
      props: { data: REPLY, x: "channel", y: "minutes", title: "Median first reply by channel", subtitle: "Horizontal, October", format: MINUTES, labels: { minutes: "First reply" }, horizontal: true, height: 220 },
      width: 560,
    },
    {
      name: "Net seats added",
      description: "One series with a loss: gains and losses take the data palette's positive and negative, and the zero rule is drawn.",
      props: { data: SEATS, x: "month", y: "net", xFormat: MONTH, title: "Net seats added", subtitle: "Two months lost seats", labels: { net: "Seats" }, height: 220 },
      width: 560,
    },
    { name: "A series turned off", description: "`hidden` is the legend's state: People is off, so the bars regroup and the scale re-fits to Fabric.", props: { data: TEAMS, x: "team", y: ["fabric", "people"], title: "Resolved this month by team", labels: { fabric: "Fabric", people: "People" }, hidden: ["people"] }, width: 560 },
    { name: "Loading", props: { data: TEAMS, x: "team", y: ["fabric", "people"], title: "Resolved this month by team", loading: true }, width: 560 },
  ],
  matrix: [{ prop: "stacked", width: 520 }, { prop: "horizontal", width: 520 }],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why; the card keeps its header and has no \"View as table\" and no legend.",
      example: { name: "Empty", props: { data: [], x: "team", y: "fabric", title: "Resolved in #billing", subtitle: "Empty", empty: "Nothing resolved in this period", emptyLine: "Try a longer period.", height: 180 }, width: 480 },
    },
    {
      title: "One bar",
      platforms: ["web", "desktop", "mobile"],
      handling: "One category draws one bar, never wider than the bar maximum (so a lone bar is not a slab), centred in the plot.",
      example: { name: "One bar", props: { data: TEAMS.slice(0, 1), x: "team", y: ["fabric", "people"], title: "Support, October", labels: { fabric: "Fabric", people: "People" }, height: 200 }, width: 480 },
    },
    {
      title: "All zero",
      platforms: ["web", "desktop", "mobile"],
      handling: "A series that is zero everywhere has no range to fit, so the axis reads 0 to 1 and there are no bars to draw: the baseline stays, the labels stay, and the summary says what each is.",
      example: { name: "All zero", props: { data: TEAMS.map((t) => ({ team: t.team, escalated: 0 })), x: "team", y: "escalated", title: "Escalated to engineering", subtitle: "Nothing escalated", labels: { escalated: "Escalated" }, height: 200 }, width: 480 },
    },
    {
      title: "Negative values",
      platforms: ["web", "desktop", "mobile"],
      handling: "Bars keep zero, so a negative bar hangs below the rule. One series with a loss is coloured by sign. Several series, or a stack, keep their own colours: the tooltip says the minus. The phone moves a negative bar's label under the bar.",
      example: { name: "Negatives", props: { data: SEATS, x: "month", y: "net", xFormat: MONTH, title: "Net seats added", subtitle: "Negatives", labels: { net: "Seats" }, height: 200 }, width: 480 },
    },
    {
      title: "Very long labels",
      platforms: ["web", "desktop", "mobile"],
      handling: "A horizontal chart cuts a label to the room its axis has and ends it with an ellipsis; the tooltip has the whole name. Under vertical bars a long label is thinned like a crowded one (the web drops the ones that collide, the phone keeps one in a few).",
      example: { name: "Long names", props: { data: LONG, x: "channel", y: "minutes", title: "First reply, long names", subtitle: "Labels truncate; the tooltip has the full name", format: MINUTES, labels: { minutes: "First reply" }, horizontal: true, height: 160 }, width: 480 },
    },
    {
      title: "Many series",
      platforms: ["web", "desktop", "mobile"],
      handling: "Nine stacked series is one more than the palette has colours: the ninth reuses the first. The legend names every one and the tooltip lists them, so a repeated colour is never the only way to tell them apart. Past about six series, a table reads better; \"View as table\" is there.",
      example: { name: "Nine series", props: { data: BY_CATEGORY, x: "month", y: CATEGORIES, xFormat: MONTH, title: "Tickets by category", subtitle: "Nine series wrap the palette", stacked: true, height: 260 }, width: 560 },
    },
    {
      title: "A long daily series",
      platforms: ["web", "desktop", "mobile"],
      handling: "Fourteen daily bars have more labels than a phone has room for. The web drops the labels that would collide; the phone draws one in every few, centred on its bar, and every bar is still in the tooltip and the table.",
      example: { name: "A fortnight", props: { data: DAILY, x: "date", y: ["fabric", "people"], xFormat: DAY, title: "Resolved a day at a time", subtitle: "Oct 12 to 25", labels: { fabric: "Fabric", people: "People" }, stacked: true, height: 220 }, width: 480 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Grey bars of uneven heights fill the plot and the card keeps its header. There is no legend, no table button and no summary yet.",
      example: { name: "Loading", props: { data: TEAMS, x: "team", y: "fabric", title: "Loading", subtitle: "While the data is on its way", loading: true, height: 160 }, width: 480 },
    },
  ],
  related: ["line-chart", "combo-chart", "table", "sparkline", "spark-bars", "metric-value", "delta", "card", "button", "skeleton", "empty-state"],
  flows: [
    {
      id: "hover-a-team",
      title: "Compare a team's two numbers",
      description: "The category under the pointer keeps its colour and the rest step back; the card lists the series at it. On the phone a tap does the same.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        {
          kind: "data",
          title: "The app holds one row per team",
          detail: "A row is a category and a number per series: the same rows feed this chart, a table and a stat.",
          code: "const rows = [{ team: \"Support\", fabric: 182, people: 141 }, …]",
        },
        {
          kind: "trigger",
          title: "The pointer moves over Billing",
          detail: "recharts reports the category under the pointer as it moves, over the whole column and not only the bar.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "Billing's bars are tapped",
          detail: "A tap on a bar focuses its category; tapping it again or tapping the plot's empty space puts the card away.",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The active category is Billing",
          detail: "The chart's own state: nothing is reported to the app. The category's index drives the dim and the card.",
          code: "setActive(activeTooltipIndex)",
        },
        {
          kind: "motion",
          title: "The other categories step back",
          detail: "Their bars fade to 38% over 150ms and a wash fills the column under the pointer; leaving the plot brings them back. Reduced motion keeps the fades and drops the movement.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The other bars step back",
          detail: "gifted-charts' focused bar keeps its colour and the rest step back, and the card is drawn above the bars.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "One card: Billing, Fabric 96, People 58",
          detail: "The category, a swatch, the name and the value of each series, in the chart's format. On a stacked chart the card ends with a total.",
        },
      ],
      replay: [{ step: 0, hold: 2600, props: { data: TEAMS, x: "team", y: ["fabric", "people"], title: "Resolved this month by team", labels: { fabric: "Fabric", people: "People" } } }],
    },
  ],
};

export default docs;
