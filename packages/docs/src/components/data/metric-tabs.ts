import type { ComponentDocs } from "../../types";
import { DAILY, DAY, commonProps } from "./chart-samples";

/** The props every ready-made chart takes alike, less the ones that mean a legend. */
const { title, subtitle, format, xFormat, height, empty, emptyLine } = commonProps({ title: "Resolved tickets", subtitle: "Oct 12 to 25, a day at a time", labels: {}, height: 220, xFormat: DAY });

/** What Fabric and people resolved and what was escalated, a day at a time: one metric per tab. */
const metrics = [
  { field: "fabric", label: "By Fabric" },
  { field: "people", label: "By people" },
  { field: "escalated", label: "Escalated" },
];

const resolved = { data: DAILY, x: "date", xFormat: DAY, metrics, title: "Resolved tickets", subtitle: "Oct 12 to 25, a day at a time" };

const docs: ComponentDocs = {
  id: "metric-tabs",
  name: "MetricTabs",
  category: "data",
  level: "organism",
  group: "panel",
  status: "draft",
  description:
    "Several metrics over the same period, each one's total as a tab. The chosen tab is marked with its colour and its metric draws as bars underneath; choosing another moves the same bars to the new heights and eases their colour, so the eye follows what changed. A metric keeps its colour whichever is chosen. \"View as table\" shows every metric's rows in Table.",
  props: {
    data: {
      type: "array",
      sample: DAILY,
      required: true,
      description: "Rows, one per point, in order: [{ date: 1791763200000, fabric: 58, people: 49, escalated: 6 }, …]. The same rows can feed a table and a bar chart. A value that is not a number is a bar of 0, and counts as 0 in a total.",
    },
    x: { type: "string", sample: "date", required: true, description: "The field of each row that is the category: a date or a word." },
    metrics: {
      type: "array",
      sample: metrics,
      required: true,
      description:
        "The metrics, one tab each, in order: [{ field, label, format?, total? }]. `field` is the row's field and the tab's id, `label` its name, `format` its own number format (a count, a rate and a sum can sit together), `total` the number on the tab when it is not the sum of its field (a rate, an average). The first eight are tabs: the palette has eight colours, and a ninth would wrap onto the first.",
    },
    title,
    subtitle,
    format: { ...format, description: "A format name, its options or a function: what core's `fmt` takes, for a metric that names none. The total on each tab, the axis, the tooltip, the summary and \"View as table\" print through it." },
    xFormat,
    value: {
      type: "string",
      sample: "fabric",
      description: "The field of the metric that is chosen. Left out, the chart keeps its own, starting with the first metric. Controlled when the app passes it with `onValueChange`. A field that is none of the metrics' chooses the first.",
    },
    onValueChange: {
      type: "event",
      args: "value: string",
      changes: "value",
      description: "A tab was pressed, or an arrow key moved to one. Called with its field. Choosing the tab that is already chosen calls nothing.",
    },
    height,
    empty,
    emptyLine,
    loading: { type: "boolean", default: false, description: "A grey line where the tabs go and grey bars in place of the plot, from the kit's Skeleton, and no \"View as table\". The header stays, so the card does not jump when the data arrives. Screen readers hear it once." },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title and \"View as table\" (Button); a strip of <button role=\"tab\"> (a swatch, a name and a MetricValue each) pulled out to the card's edges, and a tab panel holding a ChartFrame with recharts' BarChart, one Bar under one data key",
      import: "import { MetricTabs } from \"@antfabric/ui-react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is reached only from there. The plot is BarChart's own (the kit's `RechartsBars`): the same grid, axes, tooltip, lit category and motion.",
        "The chosen metric is always drawn under one data key, `__metric`, whichever it is. recharts then tweens the same bars to their new heights over 600ms on the kit's ease-out, and each bar's fill eases to the new metric's colour, instead of drawing a new series from zero. The value axis re-fits to the new metric. Reduced motion turns the tween off and the colour change stays a plain swap.",
        "The chosen tab has a recessed fill and a 2px rule in its series colour along its foot; the rule fades in over the kit's base duration. A tab's colour is the same whichever tab is chosen.",
        "Tabs share the strip's width and keep a least width (`chart.tabMinWidth`); a strip with more tabs than the card is wide scrolls sideways.",
        "A long daily series keeps every bar and the tooltip has every day; recharts leaves out the axis labels that would run together.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves to the chosen tab (the other tabs are not stops), then into the plot and on to \"View as table\"" },
        { keys: "ArrowRight", action: "On a tab: chooses the next tab, wrapping, and moves focus to it" },
        { keys: "ArrowLeft", action: "On a tab: chooses the previous tab, wrapping, and moves focus to it" },
        { keys: "Home", action: "On a tab: chooses the first tab" },
        { keys: "End", action: "On a tab: chooses the last tab" },
        { keys: "Enter", action: "On a tab: chooses it" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, tab strip and recharts' BarChart as web, at desktop density",
      import: "import { MetricTabs } from \"@antfabric/ui-react/data\"",
      notes: ["The same chart as the web's. Hover is the pointer's, so a tab lights under it and the tooltip follows it."],
      keyboard: [
        { keys: "Tab", action: "Moves to the chosen tab (the other tabs are not stops), then into the plot and on to \"View as table\"" },
        { keys: "ArrowRight", action: "On a tab: chooses the next tab, wrapping, and moves focus to it" },
        { keys: "ArrowLeft", action: "On a tab: chooses the previous tab, wrapping, and moves focus to it" },
        { keys: "Home", action: "On a tab: chooses the first tab" },
        { keys: "End", action: "On a tab: chooses the last tab" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, a row of Pressable tabs (accessibilityRole tab) that share the card's width, and a ChartFrame holding react-native-gifted-charts' BarChart (`data`, one bar per day) under one data key",
      import: "import { MetricTabs } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "Shipped from the data subpath: gifted-charts and react-native-svg are reached only from there. The plot is BarChart's own (the kit's `GiftedBars`), with the same scale as the web's.",
        "A long series cannot label every bar on a phone: core's `sparseLabels` keeps one label in every few (a fortnight of days is one in four), and the tooltip has every day. The tabs share the width, so three fit on a phone, each at least 44pt tall.",
        "The chosen tab has a recessed fill and a 2px rule in its series colour; a tab is lit while it is pressed, as the web's is while it is pointed at.",
        "The bars draw in unless the person reduces motion. Under react-native-web (the catalogue, `pnpm check`) gifted-charts' animation is off, because the values it animates with reach the DOM as text.",
      ],
      gestures: [
        { gesture: "Tap a tab", action: "Chooses it: its metric draws as bars" },
        { gesture: "Tap a bar", action: "Lights that day's bar and shows its tooltip; the others step back" },
      ],
    },
  },
  a11y: {
    role: "tablist with a tab panel and a figure (web), a tablist and one image (phone)",
    label: "The tab list is named by the title; the panel by the chosen tab (aria-labelledby); the figure by the summary: \"Resolved tickets, By Fabric: By Fabric fell from 58 to 34, highest in Oct 22…\"",
    notes: [
      "The strip is a tablist and each tab a tab, selected while it is the chosen one. Only the chosen tab is in the Tab order; the arrow keys (they follow the reading direction, so they turn round in right-to-left text), Home and End move between tabs and choose as they go, so a tab and its metric are never out of step. Each tab names the panel it controls (aria-controls). Each tab's name includes its total (\"By Fabric, 412\"), which a screen reader hears with it.",
      "The figure is named by the sentence core's `summarize` writes from the rows of the chosen metric: dates read as a trend, and where it peaked. It is heard, not printed: in the light theme the series colours sit under 3:1 against the card, so the tab's colour is never the only way to know which metric is drawn: its name is on the tab, and the tooltip and \"View as table\" give the numbers.",
      "A tab's rule and fill say which tab is chosen with more than a colour: the fill and the rule are both there, and `aria-selected` says it to everything else.",
      "\"View as table\" is the other way in: every metric, day by day, in Table with real headers, each in its own format. The tabs are hidden while it shows, since the table has every metric at once.",
    ],
  },
  examples: [
    { name: "By Fabric, by people, escalated", description: "A fortnight of resolved tickets, a day at a time. Each tab's total is the sum of its field.", props: { ...resolved }, width: 760 },
    { name: "By people chosen", description: "`value` is the chosen metric's field: its tab is marked in its own colour (the second of the palette) and its bars take that colour.", props: { ...resolved, value: "people" }, width: 760 },
    {
      name: "Different formats",
      description: "A count, a sum and a rate on one strip: each metric names its own `format`, and a rate names its own `total` because it is not the sum of its days.",
      props: {
        data: DAILY.map((r) => ({ date: r.date, tickets: r.fabric + r.people + r.escalated, revenue: (r.fabric + r.people) * 118, rate: r.fabric / (r.fabric + r.people + r.escalated) })),
        x: "date",
        xFormat: DAY,
        metrics: [
          { field: "tickets", label: "Tickets" },
          { field: "revenue", label: "Revenue", format: { type: "currency", compact: true } },
          { field: "rate", label: "Resolved by Fabric", format: { type: "percent", digits: 0 }, total: 0.57 },
        ],
        title: "Support, a day at a time",
        subtitle: "Oct 12 to 25",
      },
      width: 760,
    },
    { name: "Loading", props: { ...resolved, loading: true }, width: 760 },
  ],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why (the title and line are props); the card keeps its header, and has no tabs and no \"View as table\", since there is nothing to total or show. The figure's label says there is no data.",
      example: { name: "Empty", props: { data: [], x: "date", metrics, title: "Resolved tickets", subtitle: "Nothing this fortnight yet", empty: "No tickets resolved yet", emptyLine: "Fabric's first fortnight will show up here." }, width: 640 },
    },
    {
      title: "One metric",
      platforms: ["web", "desktop", "mobile"],
      handling: "One tab is not a choice, but it still names what is drawn and totals it: the strip has one tab, always chosen, and the arrow keys have nowhere to go.",
      example: { name: "One metric", props: { ...resolved, metrics: [metrics[0]], subtitle: "Fabric only" }, width: 640 },
    },
    {
      title: "A value that is not a metric",
      platforms: ["web", "desktop", "mobile"],
      handling: "A `value` that names none of the metrics' fields chooses the first one, so the card is never without a chosen tab. The same holds when the metrics change under a chosen field that is no longer there.",
      example: { name: "Unknown value", props: { ...resolved, value: "closed" }, width: 640 },
    },
    {
      title: "More than eight metrics",
      platforms: ["web", "desktop", "mobile"],
      handling: "The palette has eight colours, and a ninth would wrap onto the first, so the first eight metrics are tabs and the rest are left out. A strip wider than the card scrolls sideways on the web and the desktop; on the phone the eight share the width and are narrow, so a card with that many is a table's job.",
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "One grey line the size of a total stands where the tabs go and grey bars of uneven heights fill the plot; the card keeps its header. There is no table button and no summary yet. A screen reader hears \"Loading metrics\" and \"Loading chart\" once each.",
      example: { name: "Loading", props: { ...resolved, loading: true }, width: 640 },
    },
  ],
  related: ["bar-chart", "period-compare", "line-chart", "tabs", "segmented-control", "metric-value", "table", "card", "button", "skeleton", "empty-state"],
  flows: [
    {
      id: "switch-a-metric",
      title: "Switch from By Fabric to By people",
      description: "A tab is a metric. Choosing one keeps the bars where they are and moves them to the new heights, so you see what changed. The tab's rule and the bars take the metric's colour.",
      platforms: ["web", "desktop", "mobile"],
      width: 760,
      steps: [
        {
          kind: "data",
          title: "The app holds one row per day, with every metric on it",
          detail: "Each row is a day with a number per metric. The strip's totals are the sum of each field; the same rows feed the bars, the table and a stat. The chosen metric is the chart's own state until the app passes `value`.",
          code: "const rows = [{ date: 1791763200000, fabric: 58, people: 49, escalated: 6 }, …]",
        },
        {
          kind: "trigger",
          title: "The By people tab is clicked",
          detail: "Or ArrowRight with the strip focused, which chooses as it moves. Only the chosen tab is in the Tab order.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "The By people tab is tapped",
          detail: "A tab at least 44pt tall, selected while its metric is chosen.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onValueChange fires with the metric's field",
          detail: "The same shape as any tabs: the new value, and nothing else. Choosing the tab that is already chosen calls nothing.",
          code: "onValueChange?.(\"people\")",
        },
        {
          kind: "state",
          title: "By people is the chosen metric",
          detail: "The chart's own state, or the app's when it passes `value`. The rows are mapped onto one key, `__metric`, so the plot sees the same series with new numbers.",
          code: "setPicked(\"people\")",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "By people is the chosen metric",
          detail: "The chart's own state, or the app's when it passes `value`. The rows are mapped onto one key, `__metric`, so the plot sees the same series with new numbers.",
          code: "setPicked(\"people\")",
          platforms: ["web", "mobile"],
        },
        {
          kind: "motion",
          title: "The bars move to their new heights and the colour eases",
          detail: "The same bars tween to the new values over 600ms on the kit's ease-out, and each fill eases to the second palette colour over the kit's slow duration; the value axis re-fits. The new tab's rule fades in as the old one fades out. Reduced motion makes the heights a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The bars are redrawn for the new metric",
          detail: "The bars are drawn in the new metric's colour with their new heights unless the person reduces motion, and the new tab takes the recessed fill and its rule.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "By people, 529 over the fortnight",
          detail: "The tab is marked in its colour, the bars are that colour, and the figure's name (the sentence a screen reader hears) now reads the By people numbers. The By Fabric tab keeps its own colour.",
        },
      ],
      replay: [
        { step: 0, hold: 2000, props: { ...resolved, value: "fabric" } },
        { step: 1, press: "By people, 529", hold: 1200, platforms: ["web", "desktop"], props: { ...resolved, value: "fabric" } },
        { step: 2, press: "By people, 529", hold: 1200, platforms: ["mobile"], props: { ...resolved, value: "fabric" } },
        { step: 8, hold: 2600, props: { ...resolved, value: "people" } },
      ],
    },
  ],
};

export default docs;
