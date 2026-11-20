import { defineRecipe } from "../../recipe";

/**
 * ProgressRing. The ring is drawn by a chart library, which takes plain values: the tokens in `reads` are what the kit hands it (the
 * track, the tone's colour, the card the donut's hole is cut from, the stroke's minimum and the default size). The label in the middle is
 * the chart text (Geist, `chart.font`), which the kit sets itself: a recipe's `font` is the kit's sans or display.
 */
export const progressRing = defineRecipe({
  parts: ["root", "center"],
  styles: {
    center: { base: { size: "$text.caption", fg: "$fg.strong" } },
  },
  reads: ["$chart.track", "$chart.series1", "$data.positive", "$data.negative", "$data.warning", "$surface.card", "$kpi.ringMinW", "$kpi.ringSize", "$chart.font", "$chart.fileSemibold"],
});
