/**
 * The card every ready-made chart sits in, written once: LineChart, BarChart and ComboChart spread these parts and styles into their own
 * recipes, so the three headers cannot drift apart. It is not a component, and has no recipe of its own: a recipe is a component's.
 *
 * The Card around it draws the fill, edge, radius and shadow (`pad="none"`); this is what is inside: the inset (one step in on the phone),
 * the title and the line under it, the headline (the value on a line of its own, its Delta and period under it), and the plot's keyboard focus edge on the web, where the chart
 * is a stop for the arrow keys. The headline's value and Delta are MetricValue's and Delta's own; "View as table" is the kit's Button.
 */
import type { PartRecipe } from "../../recipe";

export const chartCardParts = ["root", "head", "title", "subtitle", "headline", "period", "plot"] as const;

export const chartCardStyles: { [K in (typeof chartCardParts)[number]]: PartRecipe } = {
  root: {
    base: { padding: "$space.lg", gap: "$space.smMd", font: "$font.sans", fg: "$fg.body" },
    platforms: { mobile: { base: { padding: "$space.md" } } },
  },
  head: { base: { gap: "$space.smMd" } },
  // The title names its own family and tracking: an app's heading rules (`h3 { font-family }`) reach a web title through the cascade.
  title: { base: { font: "$font.sans", size: "$text.title", line: "$text.titleLine", weight: "$font.weightSemibold", tracking: "$tracking.normal", fg: "$fg.strong" } },
  subtitle: { base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightRegular", fg: "$fg.muted" } },
  headline: { base: { gap: "$space.xs" } },
  period: { base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightRegular", fg: "$fg.faint" } },
  plot: {
    on: ["web", "desktop"],
    base: { radius: "$radius.row" },
    states: { focus: { outlineWidth: "$border.wThick", outlineColor: "$data.accent", outlineOffset: "$space.3xs" } },
  },
};

/**
 * For a panel whose card has no headline value (the total is its own, or there is none): the card's parts and styles without `headline` (and, for the
 * `Bare` ones, without `period` either), so `pnpm check` does not ask for a part that is never drawn. `ChartCard` draws a headline only when it is given one.
 */
export const chartCardPartsNoHeadline = ["root", "head", "title", "subtitle", "period", "plot"] as const;
export const chartCardPartsBare = ["root", "head", "title", "subtitle", "plot"] as const;
const { headline: _headline, ...withoutHeadline } = chartCardStyles;
const { period: _period, ...bare } = withoutHeadline;
export const chartCardStylesNoHeadline: { [K in (typeof chartCardPartsNoHeadline)[number]]: PartRecipe } = withoutHeadline;
export const chartCardStylesBare: { [K in (typeof chartCardPartsBare)[number]]: PartRecipe } = bare;

/** Tokens the ready-made charts read for the plot, not for a style: geometry the libraries take as numbers. The same on every chart. */
export const chartReads = [
  "$chart.series1",
  "$chart.axisH",
  "$chart.lineW",
  "$chart.pointR",
  "$chart.activeRing",
  "$chart.barMaxW",
  "$chart.barSoloW",
  "$chart.barRadius",
  "$chart.barGap",
  "$chart.signedRadius",
  "$chart.stackGap",
  "$chart.endLabelRoom",
  "$chart.labelSize",
  "$chart.labelBand",
  "$chart.plotMinW",
  "$chart.barMinW",
  "$chart.edge",
  "$chart.tipW",
  "$chart.tipBaseH",
  "$chart.tipRowH",
  "$chart.grid",
  "$chart.axis",
  "$chart.label",
  "$chart.crosshair",
  "$chart.reference",
  "$chart.tooltip",
  "$chart.track",
  "$data.positive",
  "$data.negative",
  "$surface.card",
  "$hover.surface",
  "$border.wHairline",
  "$border.wThick",
  "$radius.row",
] as const;
