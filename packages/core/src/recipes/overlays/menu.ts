import { defineRecipe, type PartRecipe } from "../../recipe";

/**
 * Menu. One panel of rows on web, desktop and phone. The phone's rows are taller, with body-size type and a full-size icon:
 * a deliberate platform idiom (item 42), kept in `platforms.mobile`. A row that is `tone: "danger"` is drawn as `rowDanger`, a
 * second part with the same layers and the danger colours, because `tone` belongs to an item, not to the component (so it is not a variant).
 * A pressed row is `color.background.selected` and the row's radius is `radius.row` on both (item 43); the phone's row is taller (`size.control.md`, a profile token).
 * The kit reads `$menu.rowHeightCoarse` (a touch laptop's taller row, web only: a pointer media, not a prop the recipe knows) and the tick's stroke (`$size.stroke.tick`, which has no key).
 */
const row = (fg: "$color.text.body" | "$color.text.danger", hover: "$color.background.hover" | "$color.background.danger.soft"): PartRecipe => ({
  base: { minHeight: "$size.row.default", radius: "$radius.row", font: "$font.family.sans", size: "$font.size.caption", weight: "$font.weight.semibold", fg },
  states: { hover: { bg: hover }, focus: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" }, disabled: { opacity: "$opacity.disabled" } },
  platforms: { mobile: { base: { minHeight: "$size.control.md" } } }, // idiom: the 44pt touch row
});

export const menu = defineRecipe({
  parts: ["panel", "separator", "section", "row", "rowDanger", "icon", "text", "label", "sublabel", "count", "tick", "tickIcon"],
  styles: {
    panel: {
      base: { bg: "$color.background.card", zIndex: "$zIndex.popover", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", radius: "$radius.rail", shadow: "$elevation.shadow.menu", font: "$font.family.sans" },
      // Rows only, no card. On the web the kit adds the zero border and radius (literals), so the card's edge is removed here; the phone's kit zeroes its own.
      variants: { bare: { true: { bg: "transparent", shadow: "none" } } },
      platforms: {
        web: { variants: { bare: { true: { borderWidth: "none", borderColor: "none", radius: "none" } } } },
        desktop: { variants: { bare: { true: { borderWidth: "none", borderColor: "none", radius: "none" } } } },
        mobile: { base: { width: "$menu.width" } },
      },
    },
    separator: { base: { height: "$border.width.hairline", bg: "$color.border.subtle" } },
    section: {
      base: { size: "$font.size.micro", weight: "$font.weight.bold", fg: "$color.text.faint" },
      platforms: { mobile: { base: { size: "$font.size.caption" } } },
    },
    row: row("$color.text.body", "$color.background.hover"),
    rowDanger: row("$color.text.danger", "$color.background.danger.soft"),
    icon: { base: { square: "$size.icon.md" }, platforms: { mobile: { base: { square: "$size.icon.default" } } } },
    text: { base: { gap: "$space.rowText" } },
    label: {
      base: { line: "$font.lineHeight.caption" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.semibold" } } },
    },
    sublabel: {
      base: { size: "$font.size.micro", weight: "$font.weight.normal", fg: "$color.text.muted", line: "$font.lineHeight.caption" },
      platforms: { mobile: { base: { size: "$font.size.caption" } } },
    },
    count: {
      base: { weight: "$font.weight.normal", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } },
    },
    tick: {
      base: { square: "$checkbox.size", radius: "$checkbox.radius", borderWidth: "$border.width.thick", borderColor: "$color.border.default", fg: "$color.text.onBrand" },
      states: { on: { bg: "$color.background.brand.default", borderColor: "$color.background.brand.default" } },
      // The phone draws the empty box with a transparent fill; a platform entry is laid over the states, so its `on` fill is repeated.
      platforms: { mobile: { base: { bg: "transparent" }, states: { on: { bg: "$color.background.brand.default" } } } },
    },
    tickIcon: { base: { square: "$checkbox.tickSize" } },
  },
  reads: ["$menu.rowHeightCoarse", "$size.stroke.tick"],
});
