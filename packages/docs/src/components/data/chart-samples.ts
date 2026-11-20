/**
 * AntFabric's own numbers, May to October 2026, that the ready-made charts are drawn from: support tickets on `#support` and the other channels,
 * what Fabric resolved against what people did, MRR against its forecast, seats added and lost. Plain data (a month is a UTC timestamp, so the same
 * month shows wherever the page is opened and the rows can be sent as JSON). Not a component's docs: `components/index.ts` does not list this file.
 */

import type { PropDoc } from "../../types";

/** A month's name from a UTC timestamp, in the viewer's own time zone no matter where they are: what every example's `xFormat` is. */
export const MONTH = { type: "month", timeZone: "UTC" } as const;
export const DAY = { type: "day", timeZone: "UTC" } as const;
/** Money as a chart prints it: `$184.2K`. */
export const MONEY = { type: "currency", compact: true } as const;

/** Six months to October: tickets opened and resolved (and how many of those Fabric resolved), MRR against its forecast, the backlog, the median first reply in seconds. */
export const MONTHS = (<[number, number, number, number, number, number, number, number][]>[
  [4, 612, 580, 214, 152400, 150000, 188, 212],
  [5, 648, 631, 262, 158900, 157000, 175, 198],
  [6, 701, 690, 318, 163200, 164000, 161, 176],
  [7, 688, 702, 351, 170800, 171000, 170, 165],
  [8, 742, 738, 402, 176500, 178000, 158, 151],
  [9, 769, 781, 455, 184200, 185000, 142, 134],
]).map(([m, opened, resolved, fabric, mrr, forecast, backlog, firstReply]) => ({
  month: Date.UTC(2026, m, 1),
  opened,
  resolved,
  fabric,
  people: resolved - fabric,
  mrr,
  forecast,
  backlog,
  firstReply,
}));

/** October's resolved tickets by team, Fabric's and people's. */
export const TEAMS = [
  { team: "Support", fabric: 182, people: 141 },
  { team: "Billing", fabric: 96, people: 58 },
  { team: "Platform eng", fabric: 61, people: 88 },
  { team: "Onboarding", fabric: 74, people: 39 },
  { team: "Sales ops", fabric: 42, people: 51 },
];

/** The median first reply by channel, in minutes: the horizontal bar chart's sample. */
export const REPLY = [
  { channel: "#support", minutes: 2.2 },
  { channel: "#billing", minutes: 3.8 },
  { channel: "#onboarding", minutes: 4.1 },
  { channel: "#platform-eng", minutes: 6.5 },
  { channel: "Email", minutes: 11.4 },
];

/** Seats added and lost each month: two of the six are losses. */
export const SEATS = [42, 35, -12, 28, -6, 51].map((net, i) => ({ month: Date.UTC(2026, 4 + i, 1), net }));

/** Channels whose names are longer than a label has room for. */
export const LONG = [
  { channel: "#customer-success-enterprise-escalations", minutes: 8.6 },
  { channel: "#support", minutes: 2.2 },
  { channel: "#partner-integrations-and-marketplace", minutes: 5.9 },
];

/** A fortnight, a day at a time, Oct 12 to 25: what Fabric and people resolved and what was escalated. Fourteen labels do not fit under bars on a phone, so it thins them out. */
export const DAILY = (<[number, number, number][]>[
  [58, 49, 6],
  [63, 52, 8],
  [61, 47, 5],
  [67, 50, 7],
  [55, 44, 9],
  [31, 18, 2],
  [27, 15, 1],
  [64, 46, 5],
  [71, 44, 4],
  [68, 49, 6],
  [75, 41, 3],
  [62, 43, 5],
  [38, 17, 1],
  [34, 14, 2],
]).map(([fabric, people, escalated], i) => ({ date: Date.UTC(2026, 9, 12 + i), fabric, people, escalated }));

/** Tickets by category over six months: nine series, one more than the palette has colours. */
export const CATEGORIES = ["Billing", "Login", "Onboarding", "API", "Exports", "Search", "Mobile", "Notifications", "Other"];
export const BY_CATEGORY = MONTHS.map((m, i) => ({
  month: m.month,
  ...Object.fromEntries(CATEGORIES.map((c, k) => [c, 20 + ((i * 7 + k * 11) % 23) + k])),
}));

/** October's 769 tickets by where they came in: the donut's sample (and what its table shows). */
export const CHANNELS = [
  { channel: "#support", tickets: 312 },
  { channel: "#billing", tickets: 158 },
  { channel: "#platform-eng", tickets: 121 },
  { channel: "#onboarding", tickets: 96 },
  { channel: "Email", tickets: 82 },
];

/** The same tickets cut into eleven channels: past the eighth the donut folds the rest into "Other". */
export const CHANNELS_MANY = [
  { channel: "#support", tickets: 212 },
  { channel: "#billing", tickets: 148 },
  { channel: "#platform-eng", tickets: 101 },
  { channel: "#onboarding", tickets: 86 },
  { channel: "Email", tickets: 62 },
  { channel: "#design-crit", tickets: 48 },
  { channel: "#sales-ops", tickets: 38 },
  { channel: "#security", tickets: 27 },
  { channel: "Slack Connect", tickets: 22 },
  { channel: "Chat widget", tickets: 16 },
  { channel: "Phone", tickets: 9 },
];

/** Tickets Fabric resolved, this week (Oct 19 to 25) against the week before, a day at a time: PeriodCompare's sample. */
export const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({ day, thisWeek: [64, 71, 68, 75, 62, 38, 34][i]!, lastWeek: [58, 60, 66, 61, 59, 36, 31][i]! }));

/** Fabric's Q4 goals as of October 31: what is done, and the target: GoalRings' sample. */
export const GOALS = [
  { goal: "Tickets resolved by Fabric", done: 455, target: 600 },
  { goal: "Approvals cleared within a day", done: 128, target: 150 },
  { goal: "Docs questions answered", done: 1940, target: 2500 },
];

/** Reviewers score a sample of Fabric's answers each quarter, 0 to 100, on six areas: the radar's sample. */
export const QUALITY = [
  { area: "Accuracy", q4: 86, q3: 78 },
  { area: "Tone", q4: 91, q3: 88 },
  { area: "Speed", q4: 94, q3: 90 },
  { area: "Citations", q4: 72, q3: 61 },
  { area: "Escalation", q4: 80, q3: 74 },
  { area: "Follow-up", q4: 68, q3: 63 },
];

/** The props every ready-made chart takes alike, with the sample as the catalogue's default. `x`, `y` and the rest are each chart's own. */
export function commonProps(sample: { title: string; subtitle: string; labels: Record<string, string>; height: number; format?: unknown; xFormat?: unknown }): Record<"title" | "subtitle" | "headline" | "format" | "xFormat" | "labels" | "height" | "empty" | "emptyLine" | "loading" | "hidden" | "onHiddenChange", PropDoc> {
  return {
    title: { type: "string", sample: sample.title, required: true, description: "The card's title. It names the figure on the page, and is the first words of what a screen reader hears." },
    subtitle: { type: "string", default: "", sample: sample.subtitle, description: "One line under the title: what it covers. Empty draws none." },
    headline: {
      type: "object",
      description:
        "A number to lead with, under the title: { value, format, delta, deltaFormat, inverse, period }. It is a MetricValue (in the chart's format unless it names one), a Delta badge and what the change is against (\"resolved in October\"). Left out, the card has none.",
    },
    format: {
      type: "object",
      default: "integer",
      sample: sample.format,
      description: "A format name, its options or a function: what core's `fmt` takes. The axis, the labels at the ends of bars, the tooltip, the summary and \"View as table\" all print through it, so they agree.",
    },
    xFormat: {
      type: "object",
      sample: sample.xFormat,
      description:
        "The category's format, for a date: \"month\", \"day\", or options such as { type: \"month\", timeZone: \"UTC\" }. A timestamp under a date format is read as a point in time, so the summary reads as a trend. Left out, the category prints as it is.",
    },
    labels: {
      type: "object",
      default: {},
      sample: sample.labels,
      description: "A field's name for people, for the legend, the tooltip and the table's headers: { opened: \"Opened\" }. A field with no entry prints its own name.",
    },
    height: { type: "number", default: sample.height, description: "The plot's height, in px (points on the phone). The card is as wide as the space it is given." },
    empty: { type: "string", default: "No data for this period", description: "The title of the empty state when there are no rows. Say why: nothing yet and nothing matching a filter are different sentences." },
    emptyLine: { type: "string", default: "Try a longer period.", description: "One sentence under it: what to do about it." },
    loading: {
      type: "boolean",
      default: false,
      description: "Grey bars of uneven heights in place of the plot, from the kit's Skeleton, and no \"View as table\". The header stays, so the card does not jump when the data arrives. Screen readers hear \"Loading chart\" once.",
    },
    hidden: {
      type: "array",
      description: "The series the legend has turned off, by field: [\"resolved\"]. Left out, the chart keeps its own, starting with every series on. Controlled when the app passes it with `onHiddenChange`.",
    },
    onHiddenChange: {
      type: "event",
      args: "hidden: string[]",
      changes: "hidden",
      description: "A legend entry was pressed. Called with every series that is off now. The last series showing cannot be turned off, so pressing it calls nothing.",
    },
  };
}

/** The card title's heading level, on the seven ready-made charts that sit in a ChartCard (the web's `<h1>` to `<h6>`; the phone has one header and ignores it). */
export const headingLevelProp: PropDoc = {
  type: "number",
  default: 3,
  description: "The heading level of the card's title, 1 to 6, so the chart keeps the page's heading order: a card under an h2 is an h3, one under an h1 is an h2. The phone has one kind of header and reads it for nothing. The card is not a landmark: the figure inside is named by the summary.",
};
