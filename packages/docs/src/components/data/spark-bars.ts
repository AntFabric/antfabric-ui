import type { ComponentDocs } from "../../types";

/** Fabric's runs in two-hour blocks across a day: the sample every SparkBars is drawn from unless an example brings its own. */
const hourly = [620, 410, 380, 720, 1340, 1610, 1480, 1550, 1390, 1210, 980, 790].map((v, i) => ({ hour: i * 2, runs: v }));

const docs: ComponentDocs = {
  id: "spark-bars",
  name: "SparkBars",
  category: "data",
  level: "atom",
  group: "kpi",
  status: "draft",
  description: "A few bars with no axes, small enough to sit beside a number. The latest period is in full colour and the ones before it are quieter, so it reads as the number beside it, with the shape of what came before. Use it where each period is its own amount; a Sparkline is for a trend.",
  props: {
    data: {
      type: "array",
      sample: hourly,
      required: true,
      description: "Rows, one per period, in order: [{ hour: 0, runs: 620 }, …]. The same rows can feed a chart, a table and a stat.",
    },
    y: {
      type: "string",
      sample: "runs",
      required: true,
      description: "The field of each row that is the value. A value that is not a number is left out.",
    },
    width: { type: "number", default: 96, description: "Px (points on the phone). The bars share it, so more periods are thinner bars." },
    height: { type: "number", default: 36, description: "Px (points on the phone)." },
    animate: {
      type: "boolean",
      default: false,
      description: "Draws in once when it mounts, unless the person reduces motion. Off by default: a page holds many, and a list of them would all move at once.",
    },
    tone: {
      type: "enum",
      options: ["default", "positive", "negative"],
      default: "default",
      description: "default is the first series colour. positive and negative are the data palette's gain and loss, for bars that are good or bad whatever their height (cancellations are negative).",
    },
    format: {
      type: "object",
      default: { type: "decimal", digits: 2 },
      description: "A format name, its options or a function, as core's `fmt` takes: how the default label prints the latest value, in the provider's locale. It is not drawn.",
    },
    label: {
      type: "string",
      default: "",
      description: "What a screen reader hears. Empty says how many periods there are and the latest value (\"12 periods, latest 790\"); say more where the number beside it does not (\"Fabric runs by two hours, last 24h\").",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "recharts' BarChart with no axes at an explicit width and height (never a responsive container), inside a <span role=\"img\">; the earlier bars are Cells at a reduced opacity, never animated unless `animate`",
      import: "import { SparkBars } from \"@antfabric/ui-react/data\"",
      notes: ["Shipped from the data subpath: recharts is a dependency of the React kit and is reached only from there."],
    },
    desktop: {
      status: "ready",
      base: "The same recharts BarChart as web, at desktop density",
      import: "import { SparkBars } from \"@antfabric/ui-react/data\"",
    },
    mobile: {
      status: "ready",
      base: "react-native-gifted-charts' BarChart with its axes, rules and labels hidden and `disablePress`, in a View (accessibilityRole image); the earlier bars are the colour at a reduced opacity, never animated unless `animate` and the person has not reduced motion",
      import: "import { SparkBars } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "gifted-charts needs react-native-svg and expo-linear-gradient (or react-native-linear-gradient) in the app; the kit declares them as peers.",
        "In the catalogue (React Native Web) it never animates: its Animated values do not reach the DOM.",
      ],
    },
  },
  a11y: {
    role: "img",
    label: "The `label` prop, or \"12 periods, latest 790\" (the value in `format`, in the provider's locale)",
    notes: [
      "The bars are a picture of numbers, so they are one image with a label, not a set of bars to tab through. The value beside them is what a screen reader reads.",
      "An empty SparkBars is hidden from screen readers: it has nothing to say.",
    ],
  },
  examples: [
    { name: "Fabric runs, last 24h", description: "Two-hour blocks: the latest is the one in full colour.", props: { label: "Fabric runs by two hours, last 24h" } },
    {
      name: "Tickets resolved by Fabric, by week",
      props: { data: [214, 262, 318, 351, 402, 455].map((v, i) => ({ month: i + 4, fabric: v })), y: "fabric", tone: "positive", label: "Tickets resolved by Fabric, last six months" },
    },
    { name: "Wide", description: "More room, fatter bars.", props: { width: 160, height: 48 } },
    { name: "Drawn in", props: { animate: true } },
  ],
  matrix: [{ prop: "tone" }],
  edgeCases: [
    {
      title: "No data",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty array draws an empty box of the same size, hidden from screen readers, so the number beside it does not jump.",
      example: { name: "Empty", props: { data: [] } },
    },
    {
      title: "One period",
      platforms: ["web", "desktop", "mobile"],
      handling: "One bar is the latest, so it is in full colour. It is no wider than a chart's widest bar (36px on the web, 26pt on the phone), not the whole frame.",
      example: { name: "One bar", props: { data: [{ hour: 0, runs: 620 }] } },
    },
    {
      title: "Negative values",
      platforms: ["web", "desktop", "mobile"],
      handling: "Bars start from zero, so a loss hangs below the line. The scale is widened to hold both, and the latest is still the one in full colour.",
      example: { name: "Net seats", props: { data: [42, 35, -12, 28, -6, 51].map((v, i) => ({ month: i + 4, net: v })), y: "net", label: "Net seats added, last six months" } },
    },
    {
      title: "All zero",
      platforms: ["web", "desktop", "mobile"],
      handling: "Nothing to draw: the bars have no height, and the box stays so the layout holds. Say so in the label (\"No runs yet today\") rather than rely on the picture.",
      example: { name: "Zero", props: { data: [0, 0, 0, 0, 0, 0].map((v, i) => ({ hour: i * 2, runs: v })) } },
    },
    {
      title: "Many periods",
      platforms: ["web", "desktop", "mobile"],
      handling: "The gap between bars closes up before the bars get narrower than 2px, so thirty bars in 96px are 2px bars with a gap of about 1px. Past about fifty at that width they get thinner than that: use a chart, since this is the shape of a few periods, not a series.",
      example: { name: "A month", props: { data: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, runs: 800 + ((i * 337) % 700) })), y: "runs", label: "Fabric runs, last 30 days" } },
    },
  ],
  related: ["sparkline", "stat-tile", "delta"],
};

export default docs;
