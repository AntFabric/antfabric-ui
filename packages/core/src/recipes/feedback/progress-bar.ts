import { defineRecipe } from "../../recipe";

/**
 * ProgressBar. The same on both kits but for the bar's thickness (5 on the web, 6 on the phone: a literal in each kit) and the detail's
 * weight, which the phone sets itself (regular, medium once the bar is `danger`) because its `Text` inherits nothing.
 */
export const progressBar = defineRecipe({
  parts: ["root", "header", "title", "detail", "track", "fill"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.sans" } },
    header: { base: { gap: "$space.sm", minHeight: "$control.hIconSm" } },
    title: { base: { size: "$text.bodySm", weight: "$font.weightMedium", fg: "$fg.strong" } },
    detail: {
      base: { size: "$text.caption", fg: "$fg.faint" },
      variants: { tone: { danger: { fg: "$danger.default", weight: "$font.weightMedium" } } },
      platforms: { mobile: { base: { weight: "$font.weightNormal" }, variants: { tone: { danger: { weight: "$font.weightMedium" } } } } },
    },
    track: { base: { radius: "$radius.pill", bg: "$surface.muted" } },
    fill: {
      base: { radius: "$radius.pill" },
      variants: { tone: { brand: { bg: "$brand.default" }, neutral: { bg: "$fg.faint" }, success: { bg: "$success.default" }, danger: { bg: "$danger.default" } } },
    },
  },
});
