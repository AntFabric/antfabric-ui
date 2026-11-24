import { defineRecipe } from "../../recipe";

/**
 * MetricValue. The digits are strong and tight; the symbol and unit around them ($, K, %, m) are fainter and a step lighter, and
 * drawn smaller by the kit (`0.62` of the digits' size is a ratio, which a recipe does not hold). The sizes are the kit's type tokens, one
 * step down on the phone for md, lg and xl (a 38px figure does not fit a 360pt screen); sm is the lead size on both.
 */
export const metricValue = defineRecipe({
  parts: ["root", "unit"],
  styles: {
    root: {
      base: { font: "$font.family.sans", weight: "$font.weight.semibold", fg: "$color.text.strong", tracking: "$font.letterSpacing.tight" },
      variants: {
        size: {
          sm: { size: "$font.size.lead", tracking: "$font.letterSpacing.normal" },
          md: { size: "$font.size.h2" },
          lg: { size: "$font.size.h1" },
          xl: { size: "$font.size.display" },
        },
      },
      platforms: { mobile: { variants: { size: { md: { size: "$font.size.h3" }, lg: { size: "$font.size.h2" }, xl: { size: "$font.size.h1" } } } } },
    },
    unit: { base: { fg: "$color.text.subtle", weight: "$font.weight.medium", tracking: "$font.letterSpacing.normal" } },
  },
});
