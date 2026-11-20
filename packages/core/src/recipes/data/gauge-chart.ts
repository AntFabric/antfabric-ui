import { defineRecipe } from "../../recipe";
import { chartCardParts, chartCardStyles, chartReads } from "./chart-card";

/**
 * GaugeChart. A value against a target on a half ring: the fill is in Meter's three states (a series colour while it is fine, the caution colour,
 * the loss colour), over a track, with a tick at the target and 0, the target and the most under it. The ring is drawn by recharts' Pie from 180
 * degrees to 0 (web, desktop) or gifted-charts' PieChart `semiCircle` (phone), from the tokens in `reads`. The value in the middle is MetricValue's;
 * the label under it and the three captions are the chart text (Geist, `chart.font`), which the kit sets itself.
 */
export const gaugeChart = defineRecipe({
  parts: [...chartCardParts, "ring", "center", "centerLabel", "foot"],
  styles: {
    ...chartCardStyles,
    // The web's plot is the arrow keys' stop and rounds its focus edge; the phone's is a plain view the part carries `styles` on, with no edge to round.
    plot: { ...chartCardStyles.plot, platforms: { mobile: { base: { radius: "none" } } } },
    centerLabel: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" } },
    foot: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" } },
  },
  reads: [...chartReads, "$chart.font", "$chart.series3", "$data.warning", "$chart.gaugeW", "$chart.gaugeCap", "$chart.tickW", "$chart.tickOver", "$fg.strong"],
});
