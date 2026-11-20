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
      base: { font: "$font.sans", weight: "$font.weightSemibold", fg: "$fg.strong", tracking: "$tracking.tight" },
      variants: {
        size: {
          sm: { size: "$text.lead", tracking: "$tracking.normal" },
          md: { size: "$text.h2" },
          lg: { size: "$text.h1" },
          xl: { size: "$text.display" },
        },
      },
      platforms: { mobile: { variants: { size: { md: { size: "$text.h3" }, lg: { size: "$text.h2" }, xl: { size: "$text.h1" } } } } },
    },
    unit: { base: { fg: "$fg.subtle", weight: "$font.weightMedium", tracking: "$tracking.normal" } },
  },
});
