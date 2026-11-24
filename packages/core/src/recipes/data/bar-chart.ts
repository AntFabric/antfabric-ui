import { defineRecipe } from "../../recipe";
import { chartCardParts, chartCardStyles, chartReads } from "./chart-card";

/**
 * BarChart. Grouped, stacked or horizontal bars on recharts' BarChart (web, desktop) or gifted-charts' BarChart (phone). The card around it
 * is the shared chart card (`chart-card.ts`); the plot is drawn by the library from the tokens in `reads`. A horizontal single series
 * on the phone is a ranked list of Views (gifted-charts rotates the whole chart, labels included): its label, value, track and fill are the
 * `rank*` parts, which the phone draws and the web does not. The fill's colour is the series', which the kit hands it.
 */
export const barChart = defineRecipe({
  parts: [...chartCardParts, "rank", "rankRow", "rankHead", "rankLabel", "rankValue", "rankTrack", "rankFill"],
  styles: {
    ...chartCardStyles,
    rank: { on: ["mobile"], base: { gap: "$space.md", paddingTop: "$space.2xs" } },
    rankRow: { on: ["mobile"], base: { gap: "$space.xs" } },
    rankHead: { on: ["mobile"], base: { gap: "$space.md" } },
    rankLabel: { on: ["mobile"], base: { size: "$font.size.bodySm", fg: "$color.text.body" } },
    rankValue: { on: ["mobile"], base: { size: "$font.size.bodySm", fg: "$color.text.strong" } },
    rankTrack: { on: ["mobile"], base: { height: "$chart.barHeight", radius: "$radius.pill", bg: "$chart.trackColor" } },
    rankFill: { on: ["mobile"], base: { radius: "$radius.pill" } },
  },
  reads: chartReads,
});
