import { defineRecipe, type PartRecipe } from "../../recipe";

/**
 * Menu. One panel of rows on web, desktop and phone. The phone's rows are taller, with body-size type and a full-size icon:
 * a deliberate platform idiom (item 42), kept in `platforms.mobile`. A row that is `tone: "danger"` is drawn as `rowDanger`, a
 * second part with the same layers and the danger colours, because `tone` belongs to an item, not to the component (so it is not a variant).
 * A pressed row is `surface.selected` and the row's radius is `radius.row` on both (item 43); the phone's row is taller (`control.hMd`, a profile token).
 * The kit reads `$menu.rowHCoarse` (a touch laptop's taller row, web only: a pointer media, not a prop the recipe knows) and the tick's stroke (`$icon.strokeTick`, which has no key).
 */
const row = (fg: "$fg.body" | "$danger.default", hover: "$hover.surface" | "$danger.soft"): PartRecipe => ({
  base: { minHeight: "$row.h", radius: "$radius.row", font: "$font.sans", size: "$text.caption", weight: "$font.weightSemibold", fg },
  states: { hover: { bg: hover }, focus: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" }, disabled: { opacity: "$opacity.disabled" } },
  platforms: { mobile: { base: { minHeight: "$control.hMd" } } }, // idiom: the 44pt touch row
});

export const menu = defineRecipe({
  parts: ["panel", "separator", "section", "row", "rowDanger", "icon", "text", "label", "sublabel", "count", "tick", "tickIcon"],
  styles: {
    panel: {
      base: { bg: "$surface.card", zIndex: "$z.popover", borderWidth: "$border.wHairline", borderColor: "$border.subtle", radius: "$radius.rail", shadow: "$shadow.menu", font: "$font.sans" },
      // Rows only, no card. On the web the kit adds the zero border and radius (literals), so the card's edge is removed here; the phone's kit zeroes its own.
      variants: { bare: { true: { bg: "transparent", shadow: "none" } } },
      platforms: {
        web: { variants: { bare: { true: { borderWidth: "none", borderColor: "none", radius: "none" } } } },
        desktop: { variants: { bare: { true: { borderWidth: "none", borderColor: "none", radius: "none" } } } },
        mobile: { base: { width: "$menu.w" } },
      },
    },
    separator: { base: { height: "$border.wHairline", bg: "$border.subtle" } },
    section: {
      base: { size: "$text.micro", weight: "$font.weightBold", fg: "$fg.faint" },
      platforms: { mobile: { base: { size: "$text.caption" } } },
    },
    row: row("$fg.body", "$hover.surface"),
    rowDanger: row("$danger.default", "$danger.soft"),
    icon: { base: { square: "$icon.sizeMd" }, platforms: { mobile: { base: { square: "$icon.size" } } } },
    text: { base: { gap: "$row.textGap" } },
    label: {
      base: { line: "$text.captionLine" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightSemibold" } } },
    },
    sublabel: {
      base: { size: "$text.micro", weight: "$font.weightNormal", fg: "$fg.muted", line: "$text.captionLine" },
      platforms: { mobile: { base: { size: "$text.caption" } } },
    },
    count: {
      base: { weight: "$font.weightNormal", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } },
    },
    tick: {
      base: { square: "$checkbox.size", radius: "$checkbox.radius", borderWidth: "$border.wThick", borderColor: "$border.default", fg: "$fg.onBrand" },
      states: { on: { bg: "$brand.default", borderColor: "$brand.default" } },
      // The phone draws the empty box with a transparent fill; a platform entry is laid over the states, so its `on` fill is repeated.
      platforms: { mobile: { base: { bg: "transparent" }, states: { on: { bg: "$brand.default" } } } },
    },
    tickIcon: { base: { square: "$checkbox.tickSize" } },
  },
  reads: ["$menu.rowHCoarse", "$icon.strokeTick"],
});
