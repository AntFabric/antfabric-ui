import type { ComponentDocs } from "../../types";
import { commonProps, headingLevelProp } from "./chart-samples";

/** The props every ready-made chart takes alike, less the ones that mean a plot's height, series or categories. */
const { title, subtitle, headline, format, empty, emptyLine, loading } = commonProps({ title: "Resolved by Fabric", subtitle: "October, against the Q4 target", labels: {}, height: 0, format: "percent" });

/** Where the caution and the loss colour begin for this goal: below half, then below two fifths. A gauge of 58.3% is fine; Meter's own score lines (60% and 40%) would call it a caution. */
const GOAL = { warning: 0.5, danger: 0.4 };

/** Fabric's share of resolved tickets in October against Q4's target of 60%. */
const resolved = { value: 0.583, target: 0.6, label: "of resolved tickets", title: "Resolved by Fabric", subtitle: "October, against the Q4 target", thresholds: GOAL };

const docs: ComponentDocs = {
  id: "gauge-chart",
  name: "GaugeChart",
  category: "data",
  level: "organism",
  group: "chart",
  status: "draft",
  description:
    "One value against a target on a half ring: the fill is a series colour while it is fine, the caution colour and then the loss colour as it crosses the thresholds (Meter's, so a gauge and a meter agree), with a tick at the target, the value and what it is of in the middle, and 0, the target and the most under it. It is for one number worth a ring; a number beside others is a Meter, and its history is a LineChart.",
  props: {
    headingLevel: headingLevelProp,
    value: { type: "number", sample: 0.583, required: true, description: "What there is, in the same unit as `max`. A value that is not a number draws the empty state. A value past `max` fills the ring and stops there, and the text says the real number." },
    max: { type: "number", default: 1, description: "What a full ring is: 1 when the value is already a share (the default, so 0.583 is 58.3%), or a capacity or a goal in the value's own unit." },
    target: { type: "number", sample: 0.6, description: "Where the tick sits, in the value's unit: the goal the value is measured against. Left out, there is no tick and no \"Target\" under the ring. A target past `max` is drawn at its end." },
    title,
    subtitle,
    headline,
    label: { type: "string", default: "", sample: "of resolved tickets", description: "What the value is of, under it in the hole. Empty draws only the number." },
    kind: {
      type: "enum",
      options: ["score", "usage"],
      default: "score",
      description: "`score` (a goal, a health rating) is fine while high and turns as it falls; `usage` (seats, storage, a quota) is fine while low and turns as it fills. Meter's two kinds, with Meter's thresholds. The fine colour is the third series colour for a score and the first for usage.",
    },
    thresholds: {
      type: "object",
      description: "The shares of `max` where the fill turns to the caution colour and then the loss colour: { warning: 0.5, danger: 0.4 }. Default Meter's for the kind: usage 0.75 and 0.9, a score 0.6 and 0.4.",
    },
    format: { ...format, default: "percent", description: "A format name, its options or a function: what core's `fmt` takes. The value, the target, the two ends, the summary and \"View as table\" all print through it, so they agree." },
    size: { type: "number", description: "The half ring's width, in px (points on the phone); its height is half. Default 280 on the web and desktop, 220 on the phone: `chart.gaugeW`." },
    empty: { ...empty, default: "No value yet", description: "The title of the empty state when the value is not a number." },
    emptyLine: { ...emptyLine, default: "It shows once there is a number to measure.", description: "One sentence under it: what to do about it." },
    loading,
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title, an optional headline, \"View as table\" (Button); a ChartFrame holding recharts' PieChart with one Pie from 180 degrees to 0 (round ends, a hair of gap between fill and track) and an SVG <line> for the target, MetricValue in the hole and three captions under it",
      import: "import { GaugeChart } from \"@antfabric/ui-react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is reached only from there. The ring is handed an explicit width and height, never a responsive container.",
        "The fill is `tokens.data.warning` or `data.negative` once the share crosses a threshold, and a series colour otherwise, so a gauge reads the same as the Meter that shows the same number; no colour of the brand is read.",
        "The fill draws in from the left over 600ms on the kit's ease-out and tweens to a new value; the number in the hole eases with it (MetricValue). Reduced motion turns both off.",
        "The tick is drawn across the band and a little past it on both sides (`chart.tickOver`), so it reads as a mark on the ring and not a gap in it.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, recharts' Pie and tick as web, at desktop density",
      import: "import { GaugeChart } from \"@antfabric/ui-react/data\"",
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, a ChartFrame holding react-native-gifted-charts' PieChart `donut` with `semiCircle` (the hole a disc in the card's colour), a react-native-svg <Line> for the target, MetricValue in the hole and three captions under it",
      import: "import { GaugeChart } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "Shipped from the data subpath: gifted-charts and react-native-svg are reached only from there.",
        "gifted-charts draws a half ring as a whole pie, in a view half as tall that crops it; the kit lays that view `chart.tickOver` down in a taller one so the tick has room above the ring.",
        "gifted-charts' slices have square ends, so the fill and the track meet in a straight cut, not the web's round ends. That is the one difference in the drawing.",
        "The ring pops in over 220ms unless the person reduces motion.",
        "In the catalogue, where the phone kit is drawn through react-native-web, a half ring would be shrunk into its half-height view instead of cropped by it. The catalogue's react-native-svg stand-in sets `flex-shrink: 0` on every svg it draws, so the svg keeps its size and the view crops it, as it does on a device; nothing is done to the kit's own code.",
      ],
    },
  },
  a11y: {
    role: "figure (web), one image (phone)",
    label: "The summary: \"Resolved by Fabric: 58.3% of resolved tickets, target 60%.\"",
    notes: [
      "The figure (the ring on the phone) is named by the sentence core's `summarizeGauge` writes: the value in the chart's format, what it is of, and the target. It is heard, not printed: the value and the target are already in the hole and under the ring.",
      "The colour is never the only signal: the number is in the hole, the target is a tick and a caption (\"Target 60%\"), and a value past `max` says so in the summary (\"over the 100% it is measured against\").",
      "\"View as table\" is the other way in: the measure, its value and its target, with real headers.",
      "The numbers in the hole and under the ring are for the eye: the summary says them once for a screen reader.",
    ],
  },
  examples: [
    { name: "Resolved by Fabric", description: "58.3% against Q4's 60%: above the caution line, so the fill is a series colour, and the tick is the target.", props: { ...resolved }, width: 460 },
    {
      name: "With a headline",
      description: "The card leads with a number, its change and what it is against; the ring says how much of the whole it is.",
      props: { ...resolved, headline: { value: 455, format: "integer", delta: 0.027, period: "tickets resolved by Fabric, vs September" } },
      width: 460,
    },
    { name: "A caution", description: "46% is between the 40% and 50% lines: the caution colour.", props: { ...resolved, value: 0.46, subtitle: "A slower week" }, width: 460 },
    { name: "A loss", description: "31% is under the 40% line: the loss colour.", props: { ...resolved, value: 0.31, subtitle: "Fabric was offline for a day" }, width: 460 },
    {
      name: "Seats in use, a usage gauge",
      description: "`kind: \"usage\"` fills toward the limit: 42 of 50 seats is past the 75% line, so it is the caution colour. The format prints seats, not a share.",
      props: { value: 42, max: 50, kind: "usage", format: { type: "decimal", unit: " seats", digits: 0 }, title: "Seats in use", subtitle: "Northwind Logistics", label: "of the seats on the plan" },
      width: 460,
    },
    { name: "Loading", props: { ...resolved, loading: true }, width: 460 },
  ],
  matrix: [{ prop: "kind", width: 460 }],
  edgeCases: [
    {
      title: "A value that is not a number",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value that is not a number (a request that failed, a rate with no tickets to divide) draws the kit's EmptyState in the plot's place and says why (the title and line are props); the card keeps its header and has no \"View as table\". The figure's label says there is no value.",
      example: { name: "No value", props: { value: null, target: 0.6, title: "Resolved by Fabric", subtitle: "No tickets yet", empty: "No tickets to measure", emptyLine: "It shows once Fabric has resolved one." }, width: 460 },
    },
    {
      title: "A value over max",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value past `max` fills the ring and stops there: the ring cannot be fuller. The number in the hole says the real value (112%), and the summary says it is over what it is measured against. A score over its max is fine; a usage gauge over it is in the loss colour.",
      example: { name: "Over", props: { value: 1.12, target: 1, label: "of the Q4 target", title: "Resolved by Fabric", subtitle: "Ahead of the target", thresholds: GOAL }, width: 460 },
    },
    {
      title: "Zero",
      platforms: ["web", "desktop", "mobile"],
      handling: "Nothing fills the ring: it is the empty track, with the number 0% in the hole. A score at zero is in the loss colour, but with no fill to show it the number is the signal.",
      example: { name: "Zero", props: { value: 0, target: 0.6, label: "of resolved tickets", title: "Resolved by Fabric", subtitle: "Fabric was offline all week", thresholds: GOAL }, width: 460 },
    },
    {
      title: "A target past the end",
      platforms: ["web", "desktop", "mobile"],
      handling: "A target past `max` is drawn at the ring's end, and the caption still says the number. A target of nothing is at the start. No target at all draws no tick and no caption, only 0 and the most.",
      example: { name: "No target", props: { value: 0.583, label: "of resolved tickets", title: "Resolved by Fabric", subtitle: "No target set", thresholds: GOAL }, width: 460 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Grey bars of uneven heights fill the plot and the card keeps its header. There is no \"View as table\" and no summary yet. A screen reader hears \"Loading chart\" once.",
      example: { name: "Loading", props: { ...resolved, loading: true }, width: 460 },
    },
  ],
  related: ["meter", "progress-ring", "donut-chart", "radar-chart", "metric-value", "delta", "table", "card", "button", "skeleton", "empty-state"],
};

export default docs;
