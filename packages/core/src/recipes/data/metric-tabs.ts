import { defineRecipe } from "../../recipe";
import { chartCardPartsBare, chartCardStylesBare, chartReads } from "./chart-card";

/**
 * MetricTabs. A strip of tabs, one per metric, under the card's header: each is the metric's name with its colour and its total (MetricValue), and the
 * chosen one has a rule in its colour along its foot and a recessed fill. The chosen metric is drawn as bars by BarChart's plot, always under one data
 * key so that switching tweens the bars. The strip bleeds to the card's edges (the kit pulls it out by the card's inset); the tabs share its width on
 * the phone and keep a least width on the web. The colour of a swatch and of the rule is the metric's series colour, which the kit hands each. The text of a
 * tab is the chart text (Geist, `chart.font`), which the kit sets itself.
 */
export const metricTabs = defineRecipe({
  parts: [...chartCardPartsBare, "tabs", "tab", "swatch", "tabLabel", "rule"],
  styles: {
    ...chartCardStylesBare,
    tabs: { base: { borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle", borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle" } },
    tab: {
      base: { gap: "$space.2xs", paddingX: "$space.lg", paddingY: "$space.md", minWidth: "$chart.tabMinW", borderLeftWidth: "$border.wHairline", borderLeftColor: "$border.subtle" },
      states: { hover: { bg: "$hover.surface" }, pressed: { bg: "$hover.surface" }, on: { bg: "$surface.recessed" }, focus: { ring: "$data.accent" } },
      platforms: { mobile: { base: { paddingX: "$space.md", paddingY: "$space.smMd", minWidth: "none" } } },
    },
    swatch: { base: { square: "$space.sm", radius: "$radius.circle" } },
    tabLabel: { base: { gap: "$space.xs", size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" } },
    rule: { base: { height: "$chart.ruleH" } },
  },
  reads: [...chartReads, "$chart.font", "$chart.series1", "$border.subtle", "$kpi.loadM", "$kpi.loadValueH"],
});
