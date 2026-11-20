import { defineRecipe } from "../../recipe";

/**
 * Meter. The fill's colour is the `kind`'s while the value is fine (the accent for usage, the gain colour for a score); past a threshold
 * it is the caution colour or the loss colour, which depends on the value against `thresholds` and not on a prop, so the kit picks it
 * from the tokens in `reads`. The compact track's fixed width is `kpi.meterCompactW` and a meter's narrowest is `kpi.meterMinW`, both read for layout.
 */
export const meter = defineRecipe({
  parts: ["root", "head", "label", "value", "track", "fill"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.sans" } },
    head: { base: { gap: "$space.sm" } },
    label: { base: { size: "$text.caption", fg: "$fg.muted" } },
    value: { base: { size: "$text.caption", weight: "$font.weightSemibold", fg: "$fg.body" } },
    track: { base: { height: "$kpi.meterH", radius: "$radius.pill", bg: "$chart.track" } },
    fill: {
      base: { radius: "$radius.pill" },
      variants: { kind: { usage: { bg: "$chart.series1" }, score: { bg: "$data.positive" } } },
    },
  },
  reads: ["$data.warning", "$data.negative", "$kpi.meterCompactW", "$kpi.meterMinW", "$icon.sizeMd", "$space.2xs"],
});
