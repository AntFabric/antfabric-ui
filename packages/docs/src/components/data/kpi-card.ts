import type { ComponentDocs } from "../../types";

/** Six months to September: the trend, the backlog, Fabric's share and the first reply the examples draw from. */
const months = [
  [152400, 188, 0.351, 212],
  [158900, 175, 0.378, 198],
  [163200, 161, 0.4, 176],
  [170800, 170, 0.5, 165],
  [176500, 158, 0.545, 151],
  [184200, 142, 0.583, 134],
].map(([mrr, backlog, fabricShare, firstReply], i) => ({ month: i + 4, mrr, backlog, fabricShare, firstReply }));

const docs: ComponentDocs = {
  id: "kpi-card",
  name: "KpiCard",
  category: "data",
  level: "molecule",
  group: "kpi",
  status: "draft",
  description: "The headline KPI that leads a dashboard: its label and a Delta badge on top, the number large, a sentence saying what moved (\"Up 4.4% on September\") with a trending arrow, a note, and a trend bled into the card's foot, edge to edge. Several in a row make a dashboard's top; the compact version for a grid is a StatTile.",
  props: {
    label: { type: "string", sample: "Monthly recurring revenue", required: true, description: "What the headline number is. It is the card's accessible name." },
    value: { type: "number", sample: 184200, required: true, description: "The number, drawn by MetricValue at its lg size. It eases to a new value." },
    format: {
      type: "object",
      default: { type: "currency" },
      description: "A format name, its options or a function: what core's `fmt` takes. The symbol and unit of the printed value are drawn smaller and fainter than the digits.",
    },
    delta: {
      type: "number",
      sample: 0.044,
      description: "The change, as a number the delta format prints: 0.044 is +4.4%. It is the badge and the sentence. Left out, the card has neither.",
    },
    deltaFormat: { type: "object", description: "The Delta's format (default a signed percent), for a change in points (\"points\") or a multiple. The sentence prints it without the sign: the word says it." },
    inverse: { type: "boolean", default: false, description: "Down is good (open tickets, response time): the badge's colours swap. The sentence and the arrow still say the way the number went." },
    period: { type: "string", default: "", sample: "on September", description: "What the change is against, after the sentence: \"on September\" makes \"Up 4.4% on September\"." },
    note: { type: "string", default: "", sample: "Forecast was $185,000", description: "A line of context under the sentence. Left empty, there is none." },
    trend: {
      type: "array",
      description: "Rows for the trend bled into the card's foot, one per period: [{ month: 4, mrr: 152400 }, …]. Used with `trendY`. It takes the card's full width and draws its fill to the bottom edge.",
    },
    trendY: { type: "string", description: "The field of each row that is the value." },
    loading: {
      type: "boolean",
      default: false,
      description: "Grey lines the size of the label, the value and the note, from the kit's Skeleton, in place of the numbers. Screen readers hear \"Loading Monthly recurring revenue\" once.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section> drawn from the recipe: the label, Delta (badge), MetricValue (lg), a sentence with the trending Icon, a note; then a flush Sparkline in a measured <div>, outside the section's padding; Skeleton while loading",
      import: "import { KpiCard } from \"@antfabric/ui-react/data\"",
      notes: [
        "Shipped from the data subpath. The trend is measured (a ResizeObserver) and drawn at the card's width: recharts takes a number, not a percentage.",
        "A row of cards is the page's layout: a grid of auto-filled columns at least 240px wide.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card and <section> as web, at desktop density",
      import: "import { KpiCard } from \"@antfabric/ui-react/data\"",
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View, then a measured View holding a flush Sparkline (gifted-charts) at the card's width",
      import: "import { KpiCard } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "On the phone a row of KpiCards is a sideways snap row, each card about 82% of the screen so the next one peeks in. That is the screen's layout, not the card's: put the cards in a horizontal ScrollView with snapToInterval and the kit's own gap.",
        "The Card is flat on the phone: the hairline border separates it, and `elevate` does not apply.",
      ],
    },
  },
  a11y: {
    role: "group (web), one accessible element (phone)",
    label: "The label; on the phone, \"Monthly recurring revenue, $184,200, Up 4.4% on September, Forecast was $185,000\"",
    notes: [
      "On the web the card is a labelled group, not a region landmark, so a row of cards adds no landmarks; the label, the value (once, plain), the sentence and the note read in that order. On the phone the whole card is one element with the sentence, so one swipe reads a card.",
      "The badge beside the label is hidden from screen readers: the sentence says the direction, the size and the period once, after the value.",
      "A figure too long for the card is written short on the web ($1.3B for $1,284,000,000) and the whole figure is the title of its box; the phone wraps it.",
      "The trend is a labelled image (\"Monthly recurring revenue, trend\"): it is a picture of numbers, and the value above it is what carries the number.",
      "Loading is a status named \"Loading Monthly recurring revenue\", announced once; the extra grey lines are hidden from screen readers.",
    ],
  },
  examples: [
    { name: "MRR with a trend", props: { label: "Monthly recurring revenue", value: 184200, format: { type: "currency" }, delta: 0.044, period: "on September", note: "Forecast was $185,000", trend: months, trendY: "mrr" } },
    { name: "Open tickets, down is good", description: "Fewer is good: the badge is green though the arrow points down.", props: { label: "Open tickets", value: 142, format: "integer", delta: -0.101, inverse: true, period: "on September", note: "Oldest is 3 days old, in #billing", trend: months, trendY: "backlog" } },
    { name: "Resolved by Fabric, in points", description: "A share changes in points, not in percent of a percent.", props: { label: "Resolved by Fabric", value: 0.583, format: "percent", delta: 0.038, deltaFormat: "points", period: "on September", note: "455 of 781 resolved tickets", trend: months, trendY: "fabricShare" } },
    { name: "Median first reply", props: { label: "Median first reply", value: 134, format: "duration", delta: -0.113, inverse: true, period: "on September", note: "Across all channels", trend: months, trendY: "firstReply" } },
    { name: "Without a trend", props: { label: "Fabric runs in 24h", value: 12480, format: "integer", delta: 0.082, period: "vs yesterday", note: "", trend: undefined } },
    { name: "Loading", props: { label: "Monthly recurring revenue", loading: true } },
  ],
  matrix: [{ prop: "loading" }],
  edgeCases: [
    {
      title: "No comparison yet",
      platforms: ["web", "desktop", "mobile"],
      handling: "Without a `delta` there is no badge and no sentence; the note, if any, stays. It never says \"Up 0%\": a first period has nothing to be compared with.",
      example: { name: "No delta", props: { delta: undefined, note: "First month with Fabric live" } },
    },
    {
      title: "No change",
      platforms: ["web", "desktop", "mobile"],
      handling: "Zero says \"No change\" with a flat dash, in the neutral ink: neither good nor bad.",
      example: { name: "Zero", props: { delta: 0 } },
    },
    {
      title: "A change that is not a number",
      platforms: ["web", "desktop", "mobile"],
      handling: "NaN reads \"Change unavailable\" with a flat dash and the badge shows an en dash. It is never drawn as 0%.",
      example: { name: "NaN", props: { delta: NaN } },
    },
    {
      title: "A long label",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label wraps to a second line and the badge stays at the top right; the card grows to fit rather than cut its own name.",
      example: { name: "Long", props: { label: "Monthly recurring revenue across every workspace on the Business plan", value: 184200, delta: 0.044, period: "on September" } },
    },
    {
      title: "A trend with no rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `trend`, or one with no `trendY`, draws no trend and the card keeps its own padding at the foot: no gap where the trend would have been.",
      example: { name: "Empty trend", props: { trend: [], trendY: "mrr" } },
    },
  ],
  related: ["stat-tile", "metric-value", "delta", "sparkline", "card"],
};

export default docs;
