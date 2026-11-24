import { defineRecipe } from "../../recipe";

/**
 * KpiCard. The Card around it draws the fill, edge, radius and shadow (`pad="none"`, so the trend can run to its edges); this is what is
 * inside: the inset, the label, the sentence that says what moved, the note and the trend's height; the arrow beside the sentence is the medium icon. The phone's inset is one step in
 * (`space.md`). The skeleton's line widths and heights are read for the loading state.
 */
export const kpiCard = defineRecipe({
  parts: ["root", "top", "label", "foot", "moved", "note", "trend"],
  styles: {
    root: {
      base: { padding: "$space.lg", gap: "$space.smMd", font: "$font.family.sans", fg: "$color.text.body" },
      platforms: { mobile: { base: { padding: "$space.md" } } },
    },
    top: { base: { gap: "$space.sm" } },
    label: { base: { size: "$font.size.bodySm", weight: "$font.weight.medium", fg: "$color.text.muted" } },
    foot: { base: { gap: "$space.3xs" } },
    moved: { base: { gap: "$space.xs", size: "$font.size.caption", weight: "$font.weight.semibold", fg: "$color.text.body" } },
    note: { base: { size: "$font.size.caption", fg: "$color.text.faint" } },
    trend: { base: { height: "$kpi.cardTrendHeight" } },
  },
  reads: ["$size.icon.md", "$kpi.loadWidthMd", "$kpi.loadWidthLg", "$kpi.loadWidthXl", "$kpi.loadLineHeight", "$kpi.loadValueHeight"],
});
