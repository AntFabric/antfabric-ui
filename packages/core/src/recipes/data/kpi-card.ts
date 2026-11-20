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
      base: { padding: "$space.lg", gap: "$space.smMd", font: "$font.sans", fg: "$fg.body" },
      platforms: { mobile: { base: { padding: "$space.md" } } },
    },
    top: { base: { gap: "$space.sm" } },
    label: { base: { size: "$text.bodySm", weight: "$font.weightMedium", fg: "$fg.muted" } },
    foot: { base: { gap: "$space.3xs" } },
    moved: { base: { gap: "$space.xs", size: "$text.caption", weight: "$font.weightSemibold", fg: "$fg.body" } },
    note: { base: { size: "$text.caption", fg: "$fg.faint" } },
    trend: { base: { height: "$kpi.cardTrendH" } },
  },
  reads: ["$icon.sizeMd", "$kpi.loadM", "$kpi.loadL", "$kpi.loadXl", "$kpi.loadLineH", "$kpi.loadValueH"],
});
