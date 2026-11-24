import { defineRecipe } from "../../recipe";

/**
 * ProgressBar. The same on both kits but for the bar's thickness (5 on the web, 6 on the phone: a literal in each kit) and the detail's
 * weight, which the phone sets itself (regular, medium once the bar is `danger`) because its `Text` inherits nothing.
 */
export const progressBar = defineRecipe({
  parts: ["root", "header", "title", "detail", "track", "fill"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.family.sans" } },
    header: { base: { gap: "$space.sm", minHeight: "$size.control.iconSm" } },
    title: { base: { size: "$font.size.bodySm", weight: "$font.weight.medium", fg: "$color.text.strong" } },
    detail: {
      base: { size: "$font.size.caption", fg: "$color.text.faint" },
      variants: { tone: { danger: { fg: "$color.text.danger", weight: "$font.weight.medium" } } },
      platforms: { mobile: { base: { weight: "$font.weight.normal" }, variants: { tone: { danger: { weight: "$font.weight.medium" } } } } },
    },
    track: { base: { radius: "$radius.pill", bg: "$color.background.muted" } },
    fill: {
      base: { radius: "$radius.pill" },
      variants: { tone: { brand: { bg: "$color.background.brand.default" }, neutral: { bg: "$color.text.faint" }, success: { bg: "$color.text.success" }, danger: { bg: "$color.text.danger" } } },
    },
  },
});
