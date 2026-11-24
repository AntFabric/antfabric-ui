import { defineRecipe } from "../../recipe";
import { chartCardParts, chartCardStyles, chartReads } from "./chart-card";

/**
 * ComboChart. Bars, a dashed line across them and an optional target, on recharts' ComposedChart (web, desktop) or gifted-charts' BarChart with
 * `lineData` (phone). The card around it is the shared chart card (`chart-card.ts`); the plot is drawn by the library from the tokens in `reads`.
 * The line is drawn as PeriodCompare's last period is (`chart.previousWidth`, the series dash), with dots in its colour ringed by the card.
 */
export const comboChart = defineRecipe({
  parts: chartCardParts,
  styles: chartCardStyles,
  reads: [...chartReads, "$chart.previousWidth", "$chart.seriesDash", "$chart.seriesGap"],
});
