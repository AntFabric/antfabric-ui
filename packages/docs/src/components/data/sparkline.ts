import type { ComponentDocs } from "../../types";

/** MRR in dollars, a week apart: the sample every Sparkline is drawn from unless an example brings its own. */
const mrr = [38200, 38900, 39100, 40400, 40100, 41800, 42600, 42200, 43900, 44700, 45100, 46800].map((v, i) => ({ week: `W${35 + i}`, mrr: v }));

const docs: ComponentDocs = {
  id: "sparkline",
  name: "Sparkline",
  category: "data",
  level: "atom",
  group: "kpi",
  status: "draft",
  description: "A trend with no axes: a line, an optional flat fill and a dot on the last point, small enough to sit beside a number. It says which way something is heading, not what each point was; a chart does that.",
  props: {
    data: {
      type: "array",
      sample: mrr,
      required: true,
      description: "Rows, one per point, in order: [{ week: \"W35\", mrr: 38200 }, …]. The same rows can feed a chart, a table and a stat.",
    },
    y: {
      type: "string",
      sample: "mrr",
      required: true,
      description: "The field of each row that is the value. A value that is not a number is left out.",
    },
    width: { type: "number", default: 120, description: "Px (points on the phone)." },
    height: { type: "number", default: 32, description: "Px (points on the phone)." },
    area: { type: "boolean", default: false, description: "A flat fill under the line: the line's colour at one opacity, never a gradient." },
    marker: { type: "boolean", default: false, description: "A dot on the last point, ringed in the card's colour so it reads on any ground." },
    flush: {
      type: "boolean",
      default: false,
      description: "Edge to edge, the fill running to the bottom: a trend bled into the foot of a card. Size it to the card's width.",
    },
    animate: {
      type: "boolean",
      default: false,
      description: "Draws in once when it mounts, unless the person reduces motion. Off by default: a page holds many, and a table of them would all move at once.",
    },
    tone: {
      type: "enum",
      options: ["default", "positive", "negative"],
      default: "default",
      description: "default is the first series colour. positive and negative are the data palette's gain and loss, for a trend that is good or bad whichever way it points (a falling ticket count is positive).",
    },
    format: {
      type: "object",
      default: { type: "decimal", digits: 2 },
      description: "A format name, its options or a function, as core's `fmt` takes: how the default label prints the first and last value, in the provider's locale. It is not drawn.",
    },
    label: {
      type: "string",
      default: "",
      description: "What a screen reader hears. Empty says where the trend starts and ends, in `format` (\"Trend from 38,200 to 46,800\"); say more where the number beside it does not (\"MRR, last twelve weeks\").",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "recharts' AreaChart with no axes at an explicit width and height (never a responsive container), inside a <span role=\"img\">; a flat fill, never animated unless `animate`",
      import: "import { Sparkline } from \"@antfabric-ui/react/data\"",
      notes: ["Shipped from the data subpath: recharts is a dependency of the React kit and is reached only from there."],
    },
    desktop: {
      status: "ready",
      base: "The same recharts AreaChart as web, at desktop density",
      import: "import { Sparkline } from \"@antfabric-ui/react/data\"",
    },
    mobile: {
      status: "ready",
      base: "react-native-gifted-charts' LineChart with its axes, rules and labels hidden, in a View (accessibilityRole image); a flat fill, never animated unless `animate` and the person has not reduced motion",
      import: "import { Sparkline } from \"@antfabric-ui/react-native/data\"",
      notes: [
        "gifted-charts needs react-native-svg and expo-linear-gradient (or react-native-linear-gradient) in the app; the kit declares them as peers.",
        "In the catalogue (React Native Web) it never animates: its Animated values do not reach the DOM.",
      ],
    },
  },
  a11y: {
    role: "img",
    label: "The `label` prop, or \"Trend from 38,200 to 46,800\" (the values in `format`, in the provider's locale)",
    notes: [
      "The line is a picture of numbers, so it is one image with a label, not a set of points to tab through. The value beside it is what a screen reader reads.",
      "An empty sparkline is hidden from screen readers: it has nothing to say.",
    ],
  },
  examples: [
    { name: "MRR, last twelve weeks", props: { label: "MRR, last twelve weeks" } },
    { name: "With fill and a marker", props: { area: true, marker: true } },
    {
      name: "Open tickets in #platform-eng",
      description: "Falling is good, so the tone is positive.",
      props: { data: [31, 28, 34, 29, 26, 27, 22, 24, 19, 18, 16, 14].map((v, i) => ({ day: i + 1, open: v })), y: "open", tone: "positive", area: true, label: "Open tickets in #platform-eng, last twelve days" },
    },
    {
      name: "Fabric's runs, drawn in",
      props: { data: [112, 130, 126, 148, 171, 164, 190, 205, 198, 231, 246, 262].map((v, i) => ({ day: i + 1, runs: v })), y: "runs", area: true, marker: true, animate: true, label: "Fabric's runs, last twelve days" },
    },
    { name: "Bled into a card", description: "Flush: no margin, the fill to the bottom.", props: { area: true, flush: true, width: 280, height: 56 } },
  ],
  matrix: [{ prop: "tone" }],
  edgeCases: [
    {
      title: "No data",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty array draws an empty box of the same size, hidden from screen readers, so the number beside it does not jump. It never draws a flat line: no data is not zero.",
      example: { name: "Empty", props: { data: [] } },
    },
    {
      title: "One point",
      platforms: ["web", "desktop", "mobile"],
      handling: "One value has no line, so it is a dot. It is the last point, so it takes the marker's look whether or not `marker` is on.",
      example: { name: "One point", props: { data: [{ week: "W35", mrr: 38200 }], marker: true } },
    },
    {
      title: "All equal",
      platforms: ["web", "desktop", "mobile"],
      handling: "A flat series draws a flat line in the middle of the frame, not along its bottom edge: the scale is widened around the one value.",
      example: { name: "Flat", props: { data: [7, 7, 7, 7, 7, 7].map((v, i) => ({ week: i, mrr: v })), area: true } },
    },
    {
      title: "Negative values",
      platforms: ["web", "desktop", "mobile"],
      handling: "A series that crosses zero draws as it is: there is no zero line, since a sparkline shows direction and not level. Say so in the label if the sign matters (\"Net revenue, down to a loss\").",
      example: { name: "Net revenue", props: { data: [4200, 2600, 900, -800, -2100, -1500, 300].map((v, i) => ({ week: i, mrr: v })), tone: "negative", area: true, label: "Net revenue, last seven weeks" } },
    },
  ],
  related: ["delta"],
};

export default docs;
