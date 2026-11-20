import type { ComponentDocs } from "../../types";

/** MRR in dollars by month, April to September: the trend the examples draw from. */
const months = [152400, 158900, 163200, 170800, 176500, 184200].map((v, i) => ({ month: i + 4, mrr: v }));
/** Fabric's runs in two-hour blocks across a day. */
const hourly = [620, 410, 380, 720, 1340, 1610, 1480, 1550, 1390, 1210, 980, 790].map((v, i) => ({ hour: i * 2, runs: v }));

const docs: ComponentDocs = {
  id: "stat-tile",
  name: "StatTile",
  category: "data",
  level: "molecule",
  group: "kpi",
  status: "draft",
  description: "The compact KPI: an optional icon, a label and a period on top; the value with its change under it; and at most one visual, a sparkline or bars at the end, or a ring at the start. A dashboard holds many of them; the one headline number that leads a page is a KpiCard.",
  props: {
    label: {
      type: "string",
      sample: "Fabric runs",
      required: true,
      description: "What is counted: \"Open tickets\", \"Orders shipped\". One line; a long one is cut with an ellipsis and is still the tile's accessible name.",
    },
    icon: {
      type: "icon",
      default: "",
      description: "A lucide icon name, in a soft chip before the label. Empty draws no chip.",
    },
    aside: {
      type: "string",
      default: "",
      description: "A word at the end of the top row: the period the number covers (\"24h\"), or \"Now\".",
    },
    value: { type: "number", sample: 12480, required: true, description: "The number, drawn by MetricValue. It eases to a new value." },
    format: {
      type: "object",
      default: "integer",
      description: "A format name, its options or a function: what core's `fmt` takes. The symbol and unit of the printed value are drawn smaller and fainter than the digits.",
    },
    delta: {
      type: "number",
      sample: 0.082,
      description: "The change, as a number the delta format prints: -0.101 is −10.1%. Left out, the tile has no Delta and no period.",
    },
    deltaFormat: { type: "object", description: "The Delta's format (default a signed percent), for a change in points (\"points\") or a multiple." },
    inverse: { type: "boolean", default: false, description: "Down is good (open tickets, response time): the Delta's colours swap. The arrow still points the way the number went." },
    period: { type: "string", default: "", sample: "vs yesterday", description: "What the change is against, after the Delta: \"vs September\", \"since Monday\"." },
    trend: {
      type: "array",
      description: "Rows for the visual at the end of the tile, one per period: [{ month: 4, mrr: 152400 }, …]. Used with `trendY`. On the phone it sits under the value and takes the tile's width.",
    },
    trendY: { type: "string", description: "The field of each row that is the value." },
    trendKind: {
      type: "enum",
      options: ["line", "bars"],
      default: "line",
      description: "line is a Sparkline with its fill and a dot on the last point, for a trend; bars is SparkBars with the latest period in full colour, for amounts per period.",
    },
    progress: {
      type: "number",
      description: "A share of a goal, 0 to 1: a ProgressRing at the start of the tile with the share in its middle, in place of a trend.",
    },
    loading: {
      type: "boolean",
      default: false,
      description: "Grey lines the size of the label, the value and the change, from the kit's Skeleton, in place of the numbers. Screen readers hear \"Loading Open tickets\" once.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section> drawn from the recipe: the Icon in a soft chip, MetricValue, Delta (badge, sm), and one of Sparkline, SparkBars or ProgressRing; Skeleton while loading",
      import: "import { StatTile } from \"@antfabric/ui-react/data\"",
      notes: ["Shipped from the data subpath. The visual at the end is a fixed size (92px for a line, 84px for bars); the tile around it takes whatever width its parent gives."],
    },
    desktop: {
      status: "ready",
      base: "The same Card and <section> as web, at desktop density",
      import: "import { StatTile } from \"@antfabric/ui-react/data\"",
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the Icon in a soft chip, MetricValue, Delta, and the visual stacked under the value at the tile's measured width, or a ProgressRing beside it",
      import: "import { StatTile } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "The phone stacks a sparkline or bars under the value and stretches them to the tile; a ring stays beside it.",
        "The Card is flat on the phone: the hairline border separates it, and `elevate` does not apply.",
        "On the phone a dashboard lays two tiles to a row.",
      ],
    },
  },
  a11y: {
    role: "group (web), one accessible element (phone)",
    label: "The label; on the phone, \"Open tickets, 142, Down 10.1% vs September\"",
    notes: [
      "On the web the tile is a labelled group (not a landmark) and its parts read in order: the label, the value (once, plain), the Delta (\"Down 10.1%, good\"), the period. On the phone the whole tile is one element with that sentence, so one swipe reads a tile.",
      "The visual is a labelled image (\"Fabric runs, by period\") and the value beside it is what carries the number.",
      "Loading is a status named \"Loading Open tickets\", announced once; the extra grey lines are hidden from screen readers.",
    ],
  },
  examples: [
    { name: "Approvals waiting on Fabric", description: "Fewer waiting is good, so the Delta is inverse.", props: { icon: "inbox", label: "Approvals waiting on Fabric", aside: "Now", value: 38, delta: -0.14, inverse: true, period: "since Monday" } },
    { name: "Fabric runs, bars", description: "Bars: each two hours is its own amount.", props: { icon: "sparkles", label: "Fabric runs", aside: "24h", value: 12480, delta: 0.082, inverse: false, period: "vs yesterday", trend: hourly, trendY: "runs", trendKind: "bars" } },
    { name: "Q4 goal", description: "A ring at the start: 455 of 600 is 76%.", props: { label: "Resolved by Fabric, Q4 goal", value: 455, progress: 455 / 600, delta: 0.173, inverse: false, period: "vs September" } },
    { name: "MRR with a trend", props: { icon: "credit-card", label: "Monthly recurring revenue", value: 184200, format: { type: "currency", compact: true }, delta: 0.044, inverse: false, period: "vs September", trend: months, trendY: "mrr" } },
    { name: "Median first reply", props: { icon: "clock", label: "Median first reply", value: 134, format: "duration", delta: -0.113, inverse: true, period: "vs September" } },
    { name: "Loading", props: { label: "Open tickets", loading: true } },
  ],
  matrix: [{ prop: "trendKind" }, { prop: "loading" }],
  edgeCases: [
    {
      title: "No comparison yet",
      platforms: ["web", "desktop", "mobile"],
      handling: "Without a `delta` the tile is a label and a value: no Delta, no period. It never shows 0%: a first period has nothing to be compared with.",
      example: { name: "No delta", props: { delta: undefined, label: "Fabric runs", icon: "sparkles", value: 12480 } },
    },
    {
      title: "A long label",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label keeps one line and is cut with an ellipsis; the icon and the aside stay put. The full text is the tile's accessible name.",
      example: { name: "Long", props: { icon: "inbox", label: "Approvals waiting on Fabric across every connected workspace", aside: "Now", value: 38, delta: -0.14, inverse: true, period: "since Monday" } },
    },
    {
      title: "A trend with no rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `trend`, or a trend with no `trendY`, draws no visual and the tile keeps its size. A ring (`progress`) takes the place of a trend: give one or the other.",
      example: { name: "Empty trend", props: { trend: [], trendY: "mrr", icon: "credit-card", label: "Monthly recurring revenue", value: 184200, format: { type: "currency", compact: true }, delta: 0.044, inverse: false, period: "vs September" } },
    },
    {
      title: "Not loaded yet",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value that is not a number draws an en dash at the value's size, and a Delta that is not a number reads \"Change unavailable\". Use `loading` while the request is in flight.",
      example: { name: "NaN", props: { label: "Open tickets", value: NaN, delta: NaN } },
    },
  ],
  related: ["kpi-card", "metric-value", "delta", "sparkline", "spark-bars", "progress-ring", "card"],
};

export default docs;
