import type { OnlyOn, StringGroups } from "./index";

/**
 * The text every ready-made chart says the same way, written once and spread into each chart's own group (a component reads only its own
 * strings, so each chart has these keys under its id, and a product that translates one chart sets them on that id or on each).
 * The shared chart pieces (`ChartCard`, `ChartFrame`, `Legend`, `ChartTooltip`) have no strings of their own: the chart passes them these.
 */
const chart = {
  /** The title of the empty state in place of the plot when there are no rows. */
  empty: "No data for this period",
  /** The line under the empty state's title: what to do about it. */
  emptyLine: "Try a longer period.",
  /** What a screen reader hears for the chart's figure while it is loading. */
  loading: "{title}: loading",
  /** What a screen reader hears for the grey bars that stand in for the plot while it is loading. */
  loadingChart: "Loading chart",
  /** The button in the card's header that swaps the plot for the same rows in a table. */
  viewAsTable: "View as table",
  /** The same button while the table is showing: it swaps back to the plot. */
  viewAsChart: "View as chart",
} as const;

/**
 * What a screen reader hears for a chart of rows and series (bar, combo, line, radar and metric tabs): core's `summarize` works out which series rose
 * and where each peaked, and fills these phrases in the chart's own words. A phrase is the text and nothing else, so the sentence is their concatenation.
 */
const seriesSummary = {
  /** The summary of a chart with no rows. */
  noData: "{title}: no data.",
  /** One series that has no values. */
  summaryNoValues: "{name}: no values",
  /** One series of categories: where it is highest and lowest. */
  summaryExtremes: "{name}: highest {high} ({highValue}), lowest {low} ({lowValue})",
  /** One series of a single point. */
  summarySingle: "{name} is {value}",
  /** One series over time that ended where it began. */
  summaryHeld: "{name} held at {value}",
  /** One series over time that went up. */
  summaryRose: "{name} rose from {from} to {to}",
  /** One series over time that went down. */
  summaryFell: "{name} fell from {from} to {to}",
  /** Added after a trend of three points or more: where it peaked. */
  summaryPeak: ", highest in {key}",
  /** Added after the title when the categories run in order: the first and the last. */
  summaryRange: ", {from} to {to}",
  /** What goes between one series' phrase and the next. */
  summarySeparator: "; ",
  /** The whole sentence: the title, the range (or nothing) and the series' phrases. */
  summary: "{label}{range}: {parts}.",
} as const;

/** What a screen reader hears for a donut or a breakdown: core's `summarizeSegments` fills these phrases in the chart's own words. */
const segmentSummary = {
  /** The summary of a chart with no rows. */
  noData: "{title}: no data.",
  /** The summary when there are parts and every value is zero. */
  summaryAllZero: "{title}: every value is {zero}.",
  /** Added after the name of the part that holds the rows past the eighth: how many. */
  summaryMore: ", {count} more,",
  /** One part: its name, what it adds about folded rows (or nothing), its value and its share. */
  summaryPart: "{label}{more} {value} ({share})",
  /** What goes between one part's phrase and the next. */
  summarySeparator: ", ",
  /** The whole sentence: the title, the parts and the total. */
  summary: "{label}: {parts}; total {total}.",
} as const;

/** Built-in text of the `data` chart and panel components (bar-chart … radar-chart), keyed by component id. See `strings/index.ts`. */
export const dataCharts = {
  "bar-chart": {
    ...chart,
    ...seriesSummary,
    /** The name a screen reader gives the group of series toggles above the plot. */
    legend: "Series",
    /** The label of the last row in a stacked bar's tooltip: the sum of its series. */
    total: "Total",
    /** What a screen reader hears when keyboard focus lands on the plot: its name, then how to read it. */
    arrowKeys: "{title}, use the arrow keys to read each category",
  },
  breakdown: {
    ...chart,
    ...segmentSummary,
    /** The value column's name in "View as table", when the chart has no `valueLabel`. */
    valueLabel: "Value",
    /** The name a screen reader gives the list of parts under the bar. */
    parts: "Parts",
    /** What a screen reader hears for one part's row: its name, its value and its share of the whole. */
    partLabel: "{label}, {value}, {share}",
    /** The name of the part that holds the rows past the eighth, which have no colour of their own. */
    other: "Other",
  },
  "combo-chart": {
    ...chart,
    ...seriesSummary,
    /** The name a screen reader gives the group of series toggles above the plot. */
    legend: "Series",
    /** What a screen reader hears when keyboard focus lands on the plot: its name, then how to read it. */
    arrowKeys: "{title}, use the arrow keys to read each point",
  },
  "donut-chart": {
    ...chart,
    ...segmentSummary,
    /** The value column's name in "View as table", when the chart has no `valueLabel`. */
    valueLabel: "Value",
    /** What the hole says above the total, when the chart has no `centerLabel`. */
    centerLabel: "Total",
    /** The name a screen reader gives the list of segments under the ring. */
    segments: "Segments",
    /** The name of the segment that holds the rows past the eighth, which have no colour of their own. */
    other: "Other",
    /** The share of a segment the legend has turned off, in place of a number. */
    unavailable: "–",
    /** What a screen reader hears for one row of the phone's list: the segment's name, its value and its share. */
    segmentLabel: "{label}, {value}, {share}",
    /** The name of the swatch's toggle, which turns a segment off or back on (it is pressed while the segment shows). */
    toggleSegment: "Show {label}",
  },
  "gauge-chart": {
    ...chart,
    /** The title of the empty state when the value is not a number. */
    empty: "No value yet",
    /** The line under it: what to do about it. */
    emptyLine: "It shows once there is a number to measure.",
    /** The value column's name in "View as table". */
    value: "Value",
    /** The target column's name in "View as table". */
    target: "Target",
    /** The first column's name in "View as table": the row is the gauge's one measure. */
    measure: "Measure",
    /** The target's figure, under the ring between its two ends. */
    targetValue: "Target {value}",
    /** The summary when the value or the capacity is not a number. */
    summaryNoValue: "{title}: no value.",
    /** Added after the value when the gauge says what it is of. */
    summaryCaption: " {caption}",
    /** Added when the value is past the capacity: what it is measured against. */
    summaryOver: ", over the {max} it is measured against",
    /** Added when there is a target. */
    summaryTarget: ", target {target}",
    /** The whole sentence: the title, the value and whichever of the others there are. */
    summary: "{label}: {value}{caption}{over}{target}.",
  },
  "goal-rings": {
    ...chart,
    /** The title of the empty state when there are no goals. */
    empty: "No goals yet",
    /** The line under it: what to do about it. */
    emptyLine: "Add a goal to see how far along it is.",
    /** The done column's name in "View as table", when the chart has no `valueLabel`. */
    valueLabel: "Done",
    /** The target column's name in "View as table", when the chart has no `goalLabel`. */
    goalLabel: "Target",
    /** What the middle says above the overall share, when the chart has no `centerLabel`. */
    centerLabel: "Completed",
    /** What the middle says above a goal's own share while that goal is lit. */
    thisGoal: "This goal",
    /** The name a screen reader gives the list of goals next to the rings. */
    goals: "Goals",
    /** What a screen reader hears for a goal with a target: its name, what is done of the target, and what is left. */
    goalSummary: "{label}, {done} of {target}, {left}",
    /** What a screen reader hears for a goal with no target: its name and what it says instead. */
    goalUnknown: "{label}, {left}",
    /** The line under a goal that has no target. */
    noGoal: "No goal set",
    /** The line under a goal that is reached or passed. */
    goalMet: "Goal met",
    /** The line under a goal that is not reached yet: what is left. */
    toGo: "{value} to go",
    /** The summary when there are no goals. */
    summaryNoGoals: "{title}: no goals.",
    /** One goal with a target: what is done of it, and the share. */
    summaryGoal: "{label} {done} of {target} ({share})",
    /** One goal with no target. */
    summaryNoGoal: "{label} has no goal",
    /** What goes between one goal's phrase and the next. */
    summarySeparator: "; ",
    /** The whole sentence: the title, the goals and how far along all of them are. */
    summary: "{label}: {parts}; {overall} done overall.",
  },
  "line-chart": {
    ...chart,
    ...seriesSummary,
    /** The name a screen reader gives the group of series toggles above the plot. */
    legend: "Series",
    /** What a screen reader hears when keyboard focus lands on the plot: its name, then how to read it. */
    arrowKeys: "{title}, use the arrow keys to read each point",
  },
  "metric-tabs": {
    ...chart,
    ...seriesSummary,
    /** What a screen reader hears for the grey line that stands in for the tabs while they load. */
    loadingMetrics: "Loading metrics",
    /** What a screen reader hears for one tab: the metric's name and its total. */
    tabLabel: "{label}, {total}",
    /** What a screen reader hears when keyboard focus lands on the plot: its name, then how to read it. */
    arrowKeys: "{title}, use the arrow keys to read each category",
  },
  "period-compare": {
    ...chart,
    /** What a screen reader hears for the grey lines that stand in for the two totals while they load. */
    loadingTotals: "Loading totals",
    /** What the change is against, after its badge, when the chart has no `period`. */
    period: "vs last week",
    /** What a screen reader hears when keyboard focus lands on the plot: its name, then how to read it. */
    arrowKeys: "{title}, use the arrow keys to read each point",
    /** The summary when the chart has no rows. */
    noData: "{title}: no data.",
    /** One period that has no values. */
    summaryNoValues: "{name}: no values",
    /** One period's best and worst point. */
    summaryExtremes: "{name}: highest {high} ({highValue}), lowest {low} ({lowValue})",
    /** Added after the two totals when this period is as much as the last. */
    summarySame: ", no change",
    /** Added after the two totals when this period is more: by how much, as a share of the last. */
    summaryUp: ", up {value}",
    /** Added after the two totals when this period is less. */
    summaryDown: ", down {value}",
    /** What goes between one period's extremes and the next. */
    summarySeparator: "; ",
    /** The whole sentence: the two totals with their names, the change and each period's extremes. */
    summary: "{label}: {current} {currentValue} against {previous} {previousValue}{change}. {extremes}.",
  },
  "radar-chart": {
    ...chart,
    ...seriesSummary,
    /** The name a screen reader gives the group of series toggles above the plot. */
    legend: "Series",
    /** What a screen reader hears when keyboard focus lands on the plot: its name, then how to read it. */
    arrowKeys: "{title}, use the arrow keys to read each axis",
  },
} as const satisfies StringGroups;

/**
 * Keys only one kit has a use for. The web's plot is a stop for the arrow keys and says how to read it; the phone's is one image, named by the
 * chart's summary. The phone's donut list is a row of buttons whose accessible name is its own sentence, where the web's are read from their text.
 */
export const dataChartsOnly = {
  "bar-chart": { arrowKeys: ["web"] },
  "combo-chart": { arrowKeys: ["web"] },
  "donut-chart": { segmentLabel: ["mobile"] },
  "line-chart": { arrowKeys: ["web"] },
  "metric-tabs": { arrowKeys: ["web"] },
  "period-compare": { arrowKeys: ["web"] },
  "radar-chart": { arrowKeys: ["web"] },
} as const satisfies OnlyOn<typeof dataCharts>;
