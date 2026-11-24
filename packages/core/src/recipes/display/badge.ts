import { defineRecipe } from "../../recipe";

/**
 * Badge. The count's type is on `root`: the web draws the digits as the badge's own text, and the phone's reader hands it to the `Text`.
 * The phone's count is one step up (caption, not micro) to sit in its 20pt pill; a deliberate platform idiom (item 42).
 */
export const badge = defineRecipe({
  parts: ["root"],
  styles: {
    root: {
      base: { paddingX: "$space.xs", radius: "$radius.pill", font: "$font.family.sans", weight: "$font.weight.bold", size: "$font.size.micro" },
      variants: {
        tone: {
          brand: { bg: "$color.background.brand.default", fg: "$color.text.onBrand" },
          neutral: { bg: "$color.background.muted", fg: "$color.text.muted" },
          inverse: { bg: "$color.background.inverse", fg: "$color.text.onInverse" },
        },
        dot: { true: { square: "$size.dot.default" } },
      },
      platforms: { mobile: { base: { size: "$font.size.caption" } } },
    },
  },
});
