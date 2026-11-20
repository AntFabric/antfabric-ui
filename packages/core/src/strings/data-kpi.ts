import type { OnlyOn, StringGroups } from "./index";

/** Built-in text of the `data` KPI and table components (delta … table, pagination), keyed by component id. See `strings/index.ts`. */
export const dataKpi = {
  delta: {
    /** What the change reads as in place of the number when there is none. */
    unavailable: "–",
    /** What a screen reader hears for an increase that is good news. */
    upGood: "Up {value}, good",
    /** What a screen reader hears for an increase that is bad news (`inverse`). */
    upBad: "Up {value}, bad",
    /** What a screen reader hears for a decrease that is good news (`inverse`). */
    downGood: "Down {value}, good",
    /** What a screen reader hears for a decrease that is bad news. */
    downBad: "Down {value}, bad",
  },
  meter: {
    /** The value beside the track, and the track's spoken value, when there is no number to show. */
    unavailable: "–",
    /** The value for a format other than percent: what there is against the capacity. */
    valueOfMax: "{value} of {max}",
    /** The spoken value in the caution state, so the state is not the fill's colour alone: "78%, caution". */
    stateWarning: "{value}, caution",
    /** The spoken value in the loss state: "93%, critical". */
    stateDanger: "{value}, critical",
  },
  "metric-value": {
    // Only the shared words of a format (`common`: `unavailable`, `formatPoints`, `formatDuration`), so a product can say them for one instance.
  },
  "progress-ring": {
    /** The ring's centre when the value is not a number. */
    unavailable: "–",
    /** What a screen reader hears by default: the share of the goal. */
    ofGoal: "{percent} of the goal",
    /** The same when the ring has its own text in the middle ("455"): what it says, then the share. */
    ofGoalCenter: "{center}, {percent} of the goal",
    /** What a screen reader hears when the value is not a number. */
    progressUnavailable: "Progress unavailable",
  },
  "spark-bars": {
    /** What a screen reader hears by default: how many periods there are and the latest value. */
    summary: { one: "{count} period, latest {latest}", other: "{count} periods, latest {latest}" },
  },
  sparkline: {
    /** What a screen reader hears by default: where the trend starts and ends. */
    trend: "Trend from {from} to {to}",
  },
  "kpi-card": {
    /** The card's accessible name while it loads. */
    loading: "{label}: loading",
    /** The loading lines' accessible name. */
    loadingLines: "Loading {label}",
    /** The trend at the card's foot, as a screen reader names it. */
    trend: "{label}, trend",
  },
  "stat-tile": {
    /** The tile's accessible name while it loads. */
    loading: "{label}: loading",
    /** The loading lines' accessible name. */
    loadingLines: "Loading {label}",
    /** The progress ring beside the number, as a screen reader names it. */
    ringOfGoal: "{label}, {percent} of the goal",
    /** The line trend, as a screen reader names it. */
    trend: "{label}, trend",
    /** The bars trend, as a screen reader names it. */
    byPeriod: "{label}, by period",
  },
  pagination: {
    /** The previous button's accessible name. */
    previous: "Previous page",
    /** The next button's accessible name. */
    next: "Next page",
    /** The summary when the total is not known. */
    pageOf: "Page {page} of {count}",
    /** The summary of a compact pager. */
    rangeOf: "{from}–{to} of {total}",
    /** The summary of a pager with page buttons. */
    showing: "Showing {from}–{to} of {total}",
    /** What stands for the pages left out between the page buttons. */
    gap: "…",
    /** The pager's accessible name: the navigation landmark around the summary and the buttons. */
    pages: "Pages",
    /** A page button's accessible name: its number, with what it is. */
    page: "Page {page}",
    /** The page-size choice's name. */
    rowsPerPage: "Rows per page",
    /** The jump-to-page choice's name. */
    goToPage: "Go to page",
  },
  table: {
    /** What a cell with no value says. */
    unavailable: "–",
    /** The title of the empty state when the table has no rows and no `empty` of its own. */
    empty: "Nothing here yet.",
    /** The accessible name of a trend in a cell: the row, the column, then the numbers. */
    trendCell: "{name}, {column}: {values}",
    /** The accessible name of a meter in a cell: the row, then the column. */
    progressCell: "{name}, {column}",
    /** A row's tick box, by the row's name. */
    selectRow: "Select {name}",
    /** The header's tick box. */
    selectAll: "Select all on this page",
    /** The loading lines' accessible name. */
    loadingLines: "Loading {label}",
    /** The sort bar above the cards (the phone's, and the web's with `narrow="cards"`): the name and the placeholder of the choice of column to order the cards by. */
    sortBy: "Sort by",
    /** The sort bar's first choice: no column, the order the rows came in. */
    asListed: "As listed",
    /** The sort bar's button while the cards are in ascending order: its accessible name says what a press does. */
    sortedAscending: "Sorted ascending; reverse",
    /** The same while they are in descending order. */
    sortedDescending: "Sorted descending; reverse",
    /** Said to a screen reader after a sort: the column and the direction. */
    announceSorted: "Sorted by {column}, {direction}",
    /** Said to a screen reader after the third press, when the rows are back in the order they came in. */
    announceUnsorted: "Sorting cleared",
    /** The direction word in the sentence above. */
    ascending: "ascending",
    /** The direction word in the sentence above. */
    descending: "descending",
    /** Said to a screen reader when the rows have arrived. */
    announceLoaded: { one: "{count} row loaded", other: "{count} rows loaded" },
    /** Said to a screen reader when there are no rows to show. */
    announceEmpty: "No rows",
    /** The header of the column that holds each row's actions, for a screen reader. */
    actions: "Actions",
    /** The phone's button that opens the columns a card does not show, by the row's name. */
    showDetails: "Show all details for {name}",
    /** The same while they are open. */
    hideDetails: "Hide details for {name}",
    /** A card's label and value line as one spoken line. */
    cardLine: "{label}: {value}",
  },
} as const satisfies StringGroups;

/** Keys only one kit has a use for: the web's pager is a navigation landmark, the web's grid names its actions column, and only the phone's cards open their hidden columns and speak each line as one (the web's narrow cards show every column, as a description list). */
export const dataKpiOnly = {
  pagination: { pages: ["web"] },
  table: { actions: ["web"], showDetails: ["mobile"], hideDetails: ["mobile"], cardLine: ["mobile"] },
} as const satisfies OnlyOn<typeof dataKpi>;
