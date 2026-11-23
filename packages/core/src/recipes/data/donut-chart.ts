import { defineRecipe } from "../../recipe";
import { chartCardParts, chartCardStyles, chartReads } from "./chart-card";

/**
 * DonutChart. A ring of segments with the total (or the hovered or pressed segment) in its hole, and under it, past a rule, the legend that turns
 * segments off: columns of a name over its value and share on the web and the desktop (the reference dashboard's), a row each on the phone. The ring is drawn by recharts' Pie (web, desktop) or gifted-charts' PieChart `donut` (phone), from the tokens in
 * `reads`: the segments' colours, the card the hole is cut from, the gap and the corner radius. The card around it is the shared chart card
 * (`chart-card.ts`); the centre's number is MetricValue's. The list is the chart text (Geist, `chart.font`), which the kit sets itself.
 *
 * A list row is `on` while its segment shows. An off row is faint and struck through (the kit draws the strike: a recipe has no text
 * decoration). A row is `hover` while the pointer is on it or its segment is the one the ring shows, and `pressed` on the phone, where there is no hover.
 */
export const donutChart = defineRecipe({
  parts: [...chartCardParts, "ring", "center", "centerLabel", "list", "item", "swatch", "label", "value", "share"],
  styles: {
    ...chartCardStyles,
    // The web's plot is the arrow keys' stop and rounds its focus edge; the phone's is a plain view the part carries `styles` on, with no edge to round.
    plot: { ...chartCardStyles.plot, platforms: { mobile: { base: { radius: "none" } } } },
    centerLabel: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" } },
    list: { base: { gap: "$space.2xs", paddingTop: "$space.md", borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle" } },
    item: {
      base: { gap: "$space.2xs", paddingX: "$space.sm", paddingY: "$space.xs", radius: "$radius.row" },
      states: { hover: { bg: "$hover.surface" }, pressed: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } },
      platforms: { mobile: { base: { minHeight: "$control.hit", gap: "$space.sm" } } },
    },
    swatch: { base: { square: "$space.smMd", radius: "$radius.circle" } },
    // A muted name and the larger number, as Breakdown's list: an off segment is all faint.
    label: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" }, states: { on: { fg: "$fg.muted" } } },
    value: { base: { size: "$text.title", line: "$text.titleLine", weight: "$font.weightSemibold", fg: "$fg.faint" }, states: { on: { fg: "$fg.strong" } } },
    share: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" }, states: { on: { fg: "$fg.muted" } } },
  },
  reads: [...chartReads, "$chart.font", "$chart.other", "$chart.donutSize", "$chart.sliceGap", "$chart.sliceRadius", "$chart.sliceLift", "$chart.partMinW", "$opacity.muted", "$control.hit"],
});
