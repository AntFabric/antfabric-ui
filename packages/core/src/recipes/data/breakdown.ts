import { defineRecipe } from "../../recipe";
import { chartCardParts, chartCardStyles, chartReads } from "./chart-card";

/**
 * Breakdown. A whole split into parts, with no chart library: one bar of plain views with `chart.splitGap` of the card between the parts (the first and the
 * last are rounded at their outer ends, the kit reads `radius.pill` for that), the total as the card's headline, and the parts listed under it, each with
 * its colour, name, value and share. A part is lit while it is pointed at, focused or tapped (the web and desktop lay the list in columns, the phone in one). The
 * widths of the parts are shares of the whole, which the kit sets; the colours are the series', which the kit hands each. The text is the chart text (Geist, `chart.fontFamily`),
 * which the kit sets itself.
 */
export const breakdown = defineRecipe({
  parts: [...chartCardParts, "bar", "segment", "list", "part", "swatch", "label", "value", "share"],
  styles: {
    ...chartCardStyles,
    // The web's plot is the arrow keys' stop and rounds its focus edge; the phone's is a plain view the part carries `styles` on, with no edge to round.
    plot: { ...chartCardStyles.plot, platforms: { mobile: { base: { radius: "none" } } } },
    bar: { base: { height: "$chart.splitHeight", gap: "$chart.splitGap", marginTop: "$space.2xs", marginBottom: "$space.mdLg" } },
    segment: { base: { minWidth: "$chart.splitMinWidth" } },
    list: { base: { gap: "$space.2xs" } },
    part: {
      base: { gap: "$space.2xs", paddingX: "$space.sm", paddingY: "$space.xs", radius: "$radius.row" },
      states: { hover: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: { mobile: { base: { minHeight: "$size.target.min" } } },
    },
    swatch: { base: { square: "$space.smMd", radius: "$radius.circle" } },
    // A muted name over its number, the number the larger of the two.
    label: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" } },
    value: { base: { size: "$font.size.title", line: "$font.lineHeight.title", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    share: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" } },
  },
  reads: [...chartReads, "$chart.fontFamily", "$chart.series1Color", "$chart.otherColor", "$chart.partMinWidth", "$radius.pill", "$opacity.muted"],
});
