import { defineRecipe } from "../../recipe";

/**
 * Badge. The count's type is on `root`: the web draws the digits as the badge's own text, and the phone's reader hands it to the `Text`.
 * The phone's count is one step up (caption, not micro) to sit in its 20pt pill; a deliberate platform idiom (item 42).
 */
export const badge = defineRecipe({
  parts: ["root"],
  styles: {
    root: {
      base: { paddingX: "$space.xs", radius: "$radius.pill", font: "$font.sans", weight: "$font.weightBold", size: "$text.micro" },
      variants: {
        tone: {
          brand: { bg: "$brand.default", fg: "$fg.onBrand" },
          neutral: { bg: "$surface.muted", fg: "$fg.muted" },
          inverse: { bg: "$surface.inverse", fg: "$fg.onInverse" },
        },
        dot: { true: { square: "$dot.size" } },
      },
      platforms: { mobile: { base: { size: "$text.caption" } } },
    },
  },
});
