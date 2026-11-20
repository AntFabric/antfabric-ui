import { defineRecipe } from "../../recipe";
import { chartCardParts, chartCardStyles, chartReads } from "./chart-card";

/**
 * LineChart. One to five series on recharts' ComposedChart (web, desktop) or gifted-charts' LineChart (phone). The card around it is the
 * shared chart card (`chart-card.ts`); the plot is drawn by the library, which takes plain values and not styles, so the tokens in `reads`
 * are what the kit hands it: the dashed grid, the quiet axes and labels, the crosshair, the target line, the series colours and the line
 * and point geometry. An area is the first series' colour at one opacity, never a gradient.
 */
export const lineChart = defineRecipe({
  parts: chartCardParts,
  styles: chartCardStyles,
  reads: chartReads,
});
