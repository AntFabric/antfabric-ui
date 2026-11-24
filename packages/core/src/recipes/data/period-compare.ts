import { defineRecipe } from "../../recipe";
import { chartCardPartsNoHeadline, chartCardStylesNoHeadline, chartReads } from "./chart-card";

/**
 * PeriodCompare. This period against the last: a column of totals beside a line chart (above it, in a row, on the phone). The card around it is
 * the shared chart card (`chart-card.ts`); the plot is LineChart's, drawn by recharts (web, desktop) or gifted-charts (phone) from the tokens in
 * `reads`: this period's line solid in the first series colour with a flat fill, the last one dashed, thinner (`chart.previousWidth`) and in `chart.previousColor`.
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
        web: { base: { width: "$chart.sideWidth", gap: "$space.lgXl", paddingRight: "$space.xl", borderRightWidth: "$border.width.hairline", borderRightColor: "$color.border.subtle" } },
        desktop: { base: { width: "$chart.sideWidth", gap: "$space.lgXl", paddingRight: "$space.xl", borderRightWidth: "$border.width.hairline", borderRightColor: "$color.border.subtle" } },
        mobile: { base: { gap: "$space.md", paddingBottom: "$space.md", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle" } },
      },
    },
    figure: { base: { gap: "$space.2xs" } },
    caption: { base: { gap: "$space.xs", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" } },
    key: { base: { width: "$chart.keyWidth", borderTopWidth: "$chart.ruleHeight" } },
    foot: { base: { gap: "$space.sm" } },
    note: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" } },
  },
  reads: [...chartReads, "$chart.fontFamily", "$chart.listMinWidth", "$chart.series1Color", "$chart.previousColor", "$chart.previousWidth", "$chart.seriesDash", "$chart.seriesGap", "$kpi.loadWidthSm", "$kpi.loadWidthMd", "$kpi.loadLineHeight", "$kpi.loadValueHeight"],
});
