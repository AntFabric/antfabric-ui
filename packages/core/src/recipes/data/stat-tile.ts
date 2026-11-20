import { defineRecipe } from "../../recipe";

/**
 * StatTile. The Card around it draws the fill, edge, radius and shadow (`pad="none"`); this is what is inside: the inset, the icon chip,
 * the label, the period and the gaps. The phone's inset is one step in (`space.md`), as a Card's is. The gap beside a ring and the
 * sizes of the sparkline or bars are the kit's layout; the chip's soft accent is `data.accentSoft` with its own ink.
 */
export const statTile = defineRecipe({
  parts: ["root", "top", "chip", "icon", "label", "aside", "body", "main", "foot", "period"],
  styles: {
    root: {
      base: { padding: "$space.lg", gap: "$space.smMd", font: "$font.sans", fg: "$fg.body" },
      platforms: { mobile: { base: { padding: "$space.md" } } },
    },
    top: { base: { gap: "$space.sm" } },
    chip: { base: { square: "$kpi.chipSize", radius: "$radius.control", bg: "$data.accentSoft", fg: "$data.onAccentSoft" } },
    icon: { base: { square: "$icon.size" } },
    label: { base: { size: "$text.caption", weight: "$font.weightMedium", fg: "$fg.muted" } },
    aside: { base: { size: "$text.caption", fg: "$fg.faint" } },
    body: { base: { gap: "$space.smMd" } },
    main: { base: { gap: "$space.xs" } },
    foot: { base: { gap: "$space.xs" } },
    period: { base: { size: "$text.caption", fg: "$fg.faint" } },
  },
  reads: ["$kpi.tileTrendW", "$kpi.tileBarsW", "$kpi.tileTrendH", "$kpi.ringSize", "$kpi.loadS", "$kpi.loadM", "$kpi.loadL", "$kpi.loadLineH", "$kpi.loadValueH"],
});
