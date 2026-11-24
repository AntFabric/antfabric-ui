import { defineRecipe } from "../../recipe";

/**
 * SparkBars. The bars are drawn by a chart library, which takes plain values and not styles, so the recipe has no style of its own: the
 * tokens in `reads` are what the kit hands the library. The bars are the tone's colour (`chart.series1Color`, `color.background.data.positive`, `color.background.data.negative`),
 * the ones before the latest at a reduced opacity; the gap between them is `chart.barGap` (closing up before the bars get under 2px), no bar is wider than `kpi.sparkBarMaxWidth`, and the free end's corner is `kpi.sparkBarRadius`.
 */
export const sparkBars = defineRecipe({
  parts: ["root"],
  styles: {},
  reads: ["$chart.series1Color", "$color.background.data.positive", "$color.background.data.negative", "$chart.barGap", "$kpi.sparkBarMaxWidth", "$kpi.sparkBarRadius"],
});
