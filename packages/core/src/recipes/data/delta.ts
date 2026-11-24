import { defineRecipe } from "../../recipe";

/**
 * Delta. The arrow and the number are one colour, and which colour is the value's sign against `inverse` (up is good unless `inverse`),
 * so no prop carries it and a recipe cannot say it: the kit picks the pair from the tokens in `reads`, the ink for the text variant and
 * the ink on its soft fill for the badge. Everything else (type, the arrow's size, the badge's shape) is here.
 */
export const delta = defineRecipe({
  parts: ["root", "icon", "value"],
  styles: {
    root: {
      base: { gap: "$space.3xs" },
      variants: {
        variant: { text: {}, badge: { radius: "$radius.pill", paddingX: "$space.xs", paddingY: "$space.2xs" } },
      },
    },
    icon: {
      variants: { size: { sm: { square: "$size.icon.sm" }, md: { square: "$size.icon.md" }, lg: { square: "$size.icon.default" } } },
    },
    value: {
      base: { font: "$font.family.sans", weight: "$font.weight.semibold" },
      variants: { size: { sm: { size: "$font.size.micro" }, md: { size: "$font.size.caption" }, lg: { size: "$font.size.body" } } },
    },
  },
  reads: ["$color.text.data.onPositive", "$color.text.data.onNegative", "$color.background.data.positiveSoft", "$color.background.data.negativeSoft", "$color.text.muted", "$color.background.muted"],
});
