import { defineRecipe } from "../../recipe";
import { chartCardPartsBare, chartCardStylesBare, chartReads } from "./chart-card";

/**
 * GoalRings. Up to three goals as nested rings, the overall share in the middle (MetricValue, easing to a goal's own share while one is lit) and each goal
 * listed beside the rings (below them on the phone) with what is done, the target and what is left. The rings are one recharts PieChart with a track Pie and a
 * value Pie per ring (web, desktop) or one gifted-charts donut per ring, stacked (phone), from the tokens in `reads`; each band is `chart.ringWidth` thick with
 * `chart.ringGap` between. A goal is lit while it is pointed at, focused or tapped, and the others step back (the kit sets the opacity: a ratio). The
 * swatch is the goal's series colour, which the kit hands it. The text is the chart text (Geist, `chart.fontFamily`), which the kit sets itself.
 */
export const goalRings = defineRecipe({
  parts: [...chartCardPartsBare, "rings", "ring", "center", "centerLabel", "list", "goal", "goalHead", "swatch", "label", "done", "of", "left"],
  styles: {
    ...chartCardStylesBare,
    // The web's plot is the arrow keys' stop and rounds its focus edge; the phone's is a plain view the part carries `styles` on, with no edge to round.
    plot: { ...chartCardStylesBare.plot, platforms: { mobile: { base: { radius: "none" } } } },
    rings: {
      base: { gap: "$space.2xl" },
      platforms: { mobile: { base: { gap: "$space.lg" } } },
    },
    ring: { base: { width: "$chart.ringSize", height: "$chart.ringSize" } },
    centerLabel: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" } },
    list: { base: { gap: "$space.md" } },
    goal: {
      base: { gap: "$space.2xs", radius: "$radius.row" },
      states: { focus: { shadow: "$elevation.shadow.focus" } },
    },
    goalHead: { base: { gap: "$space.sm" } },
    swatch: { base: { square: "$space.smMd", radius: "$radius.circle" } },
    // The words are quiet and the number leads: the name is muted, what is done is the largest text in the row.
    label: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted" } },
    done: { base: { size: "$font.size.title", line: "$font.lineHeight.title", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    of: { base: { size: "$font.size.caption", line: "$font.lineHeight.title", fg: "$color.text.muted" } },
    left: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" } },
  },
  reads: [...chartReads, "$chart.fontFamily", "$chart.series1Color", "$chart.series2Color", "$chart.series3Color", "$chart.ringSize", "$chart.ringWidth", "$chart.ringGap", "$opacity.muted"],
});
