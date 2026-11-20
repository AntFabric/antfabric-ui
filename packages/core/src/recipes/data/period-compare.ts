import { defineRecipe } from "../../recipe";
import { chartCardPartsNoHeadline, chartCardStylesNoHeadline, chartReads } from "./chart-card";

/**
 * PeriodCompare. This period against the last: a column of totals beside a line chart (above it, in a row, on the phone). The card around it is
 * the shared chart card (`chart-card.ts`); the plot is LineChart's, drawn by recharts (web, desktop) or gifted-charts (phone) from the tokens in
 * `reads`: this period's line solid in the first series colour with a flat fill, the last one dashed, thinner (`chart.previousW`) and in `chart.previous`.
 * A total is MetricValue's, its change Delta's; the key beside a name is a short line, solid or dashed as the chart draws it, in the series' colour
 * (the kit sets the colour and the dash). The text under a total is the chart text, which the kit sets itself.
 */
export const periodCompare = defineRecipe({
  parts: [...chartCardPartsNoHeadline, "compare", "side", "figure", "caption", "key", "foot", "note"],
  styles: {
    ...chartCardStylesNoHeadline,
    compare: {
      base: { gap: "$space.xl" },
      platforms: { mobile: { base: { gap: "$space.md" } } },
    },
    side: {
      platforms: {
        web: { base: { width: "$chart.sideW", gap: "$space.lgXl", paddingRight: "$space.xl", borderRightWidth: "$border.wHairline", borderRightColor: "$border.subtle" } },
        desktop: { base: { width: "$chart.sideW", gap: "$space.lgXl", paddingRight: "$space.xl", borderRightWidth: "$border.wHairline", borderRightColor: "$border.subtle" } },
        mobile: { base: { gap: "$space.md", paddingBottom: "$space.md", borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle" } },
      },
    },
    figure: { base: { gap: "$space.2xs" } },
    caption: { base: { gap: "$space.xs", size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" } },
    key: { base: { width: "$chart.keyW", borderTopWidth: "$chart.ruleH" } },
    foot: { base: { gap: "$space.sm" } },
    note: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" } },
  },
  reads: [...chartReads, "$chart.font", "$chart.listMinW", "$chart.series1", "$chart.previous", "$chart.previousW", "$chart.seriesDash", "$chart.seriesGap", "$kpi.loadS", "$kpi.loadM", "$kpi.loadLineH", "$kpi.loadValueH"],
});
