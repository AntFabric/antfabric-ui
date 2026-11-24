import { defineRecipe } from "../../recipe";

/**
 * ProgressRing. The ring is drawn by a chart library, which takes plain values: the tokens in `reads` are what the kit hands it (the
 * track, the tone's colour, the card the donut's hole is cut from, the stroke's minimum and the default size). The label in the middle is
 * the chart text (Geist, `chart.fontFamily`), which the kit sets itself: a recipe's `font` is the kit's sans or display.
 */
export const progressRing = defineRecipe({
  parts: ["root", "center"],
  styles: {
    center: { base: { size: "$font.size.caption", fg: "$color.text.strong" } },
  },
  reads: ["$chart.trackColor", "$chart.series1Color", "$color.background.data.positive", "$color.background.data.negative", "$color.background.data.warning", "$color.background.card", "$kpi.ringMinWidth", "$kpi.ringSize", "$chart.fontFamily", "$chart.fontFileSemibold"],
});
