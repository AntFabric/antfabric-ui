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
      base: { bg: "$color.border.subtle" },
      variants: { orientation: { horizontal: { height: "$border.width.hairline", minWidth: "$space.xl" }, vertical: { width: "$border.width.hairline", minHeight: "$size.icon.default" } } },
    },
    label: { base: { fg: "$color.text.muted", font: "$font.family.sans", size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.medium" } },
  },
});
