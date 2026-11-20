import { defineRecipe } from "../../recipe";

/**
 * A hairline rule, optionally broken by a centred label. Inset is breathing room around the rule (the recipe has no compound variants, so it is the
 * same margin on every side). A vertical rule takes the height of its row but never less than an icon, so it shows in a row with nothing to
 * stretch it; a labelled rule keeps `space.xl` either side, so a long label wraps instead of squeezing the rules away.
 */
export const divider = defineRecipe({
  parts: ["root", "rule", "label"],
  styles: {
    root: {
      base: { gap: "$space.md" },
      variants: { inset: { sm: { margin: "$space.sm" }, md: { margin: "$space.md" } } },
    },
    rule: {
      base: { bg: "$border.subtle" },
      variants: { orientation: { horizontal: { height: "$border.wHairline", minWidth: "$space.xl" }, vertical: { width: "$border.wHairline", minHeight: "$icon.size" } } },
    },
    label: { base: { fg: "$fg.muted", font: "$font.sans", size: "$text.caption", line: "$text.captionLine", weight: "$font.weightMedium" } },
  },
});
