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
      variants: { size: { sm: { square: "$icon.sizeSm" }, md: { square: "$icon.sizeMd" }, lg: { square: "$icon.size" } } },
    },
    value: {
      base: { font: "$font.sans", weight: "$font.weightSemibold" },
      variants: { size: { sm: { size: "$text.micro" }, md: { size: "$text.caption" }, lg: { size: "$text.body" } } },
    },
  },
  reads: ["$data.onPositive", "$data.onNegative", "$data.positiveSoft", "$data.negativeSoft", "$fg.muted", "$surface.muted"],
});
