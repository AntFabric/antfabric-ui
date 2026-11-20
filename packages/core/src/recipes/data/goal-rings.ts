import { defineRecipe } from "../../recipe";
import { chartCardPartsBare, chartCardStylesBare, chartReads } from "./chart-card";

/**
 * GoalRings. Up to three goals as nested rings, the overall share in the middle (MetricValue, easing to a goal's own share while one is lit) and each goal
 * listed beside the rings (below them on the phone) with what is done, the target and what is left. The rings are one recharts PieChart with a track Pie and a
 * value Pie per ring (web, desktop) or one gifted-charts donut per ring, stacked (phone), from the tokens in `reads`; each band is `chart.ringW` thick with
 * `chart.ringGap` between. A goal is lit while it is pointed at, focused or tapped, and the others step back (the kit sets the opacity: a ratio). The
 * swatch is the goal's series colour, which the kit hands it. The text is the chart text (Geist, `chart.font`), which the kit sets itself.
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
    centerLabel: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" } },
    list: { base: { gap: "$space.md" } },
    goal: {
      base: { gap: "$space.2xs", radius: "$radius.row" },
      states: { focus: { shadow: "$shadow.focus" } },
    },
    goalHead: { base: { gap: "$space.sm" } },
    swatch: { base: { square: "$space.smMd", radius: "$radius.circle" } },
    // The words are quiet and the number leads: the name is muted, what is done is the largest text in the row.
    label: { base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted" } },
    done: { base: { size: "$text.title", line: "$text.titleLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    of: { base: { size: "$text.caption", line: "$text.titleLine", fg: "$fg.muted" } },
    left: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" } },
  },
  reads: [...chartReads, "$chart.font", "$chart.series1", "$chart.series2", "$chart.series3", "$chart.ringSize", "$chart.ringW", "$chart.ringGap", "$opacity.muted"],
});
