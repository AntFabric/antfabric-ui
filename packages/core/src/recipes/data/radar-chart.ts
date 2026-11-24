import { defineRecipe } from "../../recipe";
import { chartCardParts, chartCardStyles, chartReads } from "./chart-card";

/**
 * RadarChart. Several scores on shared axes, one polygon per series, on recharts' RadarChart (web, desktop) or gifted-charts' RadarChart with
 * `dataSet` (phone). The card around it is the shared chart card (`chart-card.ts`); the plot is drawn by the library from the tokens in `reads`:
 * the grid and the axis lines, the labels in the chart's quiet text, the series colours, and a flat fill under each polygon (never a gradient).
 */
export const radarChart = defineRecipe({
  parts: chartCardParts,
  styles: chartCardStyles,
  reads: [...chartReads, "$color.text.body"],
});
