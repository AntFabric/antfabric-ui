import { defineRecipe } from "../../recipe";

/**
 * Meter. The fill's colour is the `kind`'s while the value is fine (the accent for usage, the gain colour for a score); past a threshold
 * it is the caution colour or the loss colour, which depends on the value against `thresholds` and not on a prop, so the kit picks it
 * from the tokens in `reads`. The compact track's fixed width is `kpi.meterCompactWidth` and a meter's narrowest is `kpi.meterMinWidth`, both read for layout.
 */
export const meter = defineRecipe({
  parts: ["root", "head", "label", "value", "track", "fill"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.family.sans" } },
    head: { base: { gap: "$space.sm" } },
    label: { base: { size: "$font.size.caption", fg: "$color.text.muted" } },
    value: { base: { size: "$font.size.caption", weight: "$font.weight.semibold", fg: "$color.text.body" } },
    track: { base: { height: "$kpi.meterHeight", radius: "$radius.pill", bg: "$chart.trackColor" } },
    fill: {
      base: { radius: "$radius.pill" },
      variants: { kind: { usage: { bg: "$chart.series1Color" }, score: { bg: "$color.background.data.positive" } } },
    },
  },
  reads: ["$color.background.data.warning", "$color.background.data.negative", "$kpi.meterCompactWidth", "$kpi.meterMinWidth", "$size.icon.md", "$space.2xs"],
});
