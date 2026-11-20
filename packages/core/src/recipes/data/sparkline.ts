import { defineRecipe } from "../../recipe";

/**
 * Sparkline. The line is drawn by a chart library, which takes plain values and not styles, so the recipe has no style of its own: the
 * tokens in `reads` are what the kit hands the library. The series colour is the tone's (`chart.series1`, `data.positive`, `data.negative`);
 * the last point's ring is cut from the card it sits on, at the thick border width.
 */
export const sparkline = defineRecipe({
  parts: ["root"],
  styles: {},
  reads: ["$chart.series1", "$data.positive", "$data.negative", "$chart.sparkW", "$chart.pointR", "$surface.card", "$border.wThick"],
});
