import { defineRecipe } from "../../recipe";
import { chartCardPartsBare, chartCardStylesBare, chartReads } from "./chart-card";

/**
 * MetricTabs. A strip of tabs, one per metric, under the card's header: each is the metric's name with its colour and its total (MetricValue), and the
 * chosen one has a rule in its colour along its foot and a recessed fill. The chosen metric is drawn as bars by BarChart's plot, always under one data
 * key so that switching tweens the bars. The strip bleeds to the card's edges (the kit pulls it out by the card's inset); the tabs share its width on
 * the phone and keep a least width on the web. The colour of a swatch and of the rule is the metric's series colour, which the kit hands each. The text of a
 * tab is the chart text (Geist, `chart.fontFamily`), which the kit sets itself.
 */
export const metricTabs = defineRecipe({
  parts: [...chartCardPartsBare, "tabs", "tab", "swatch", "tabLabel", "rule"],
  styles: {
    ...chartCardStylesBare,
    tabs: { base: { borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle" } },
    tab: {
      base: { gap: "$space.2xs", paddingX: "$space.lg", paddingY: "$space.md", minWidth: "$chart.tabMinWidth", borderLeftWidth: "$border.width.hairline", borderLeftColor: "$color.border.subtle" },
      states: { hover: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.hover" }, on: { bg: "$color.background.recessed" }, focus: { ring: "$color.background.data.accent" } },
      platforms: { mobile: { base: { paddingX: "$space.md", paddingY: "$space.smMd", minWidth: "none" } } },
    },
    swatch: { base: { square: "$space.sm", radius: "$radius.circle" } },
    tabLabel: { base: { gap: "$space.xs", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" } },
    rule: { base: { height: "$chart.ruleHeight" } },
  },
  reads: [...chartReads, "$chart.fontFamily", "$chart.series1Color", "$color.border.subtle", "$kpi.loadWidthMd", "$kpi.loadValueHeight"],
});
