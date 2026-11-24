import { defineRecipe } from "../../recipe";

/**
 * WorkspaceSwitcher. Three surfaces in one component: on desktop a column of workspace tiles at the top of the rail (`column`, `tile`,
 * `indicator`, `addTile`), on the web a menu of links to each origin (`menu`, `row`, `divider`), on the phone a bottom sheet
 * (the `root`, `grabber`, `row`). The names, hosts and the + row are the same words on all three.
 * Read by the kit: the badge's offset on a tile (a `Badge`'s own `style`, which carries no part), and the edges the kit draws with a
 * `border` shorthand (a tile's 2px ring, the dashed 1.5px add tile, the badge's ring) so the button reset's zero border stays under
 * them, as the render snapshot expects.
 * The phone's larger name, host and row are a platform idiom (item 42).
 */
export const workspaceSwitcher = defineRecipe({
  parts: ["root", "column", "indicator", "tile", "addTile", "addIcon", "menu", "grabber", "title", "row", "name", "host", "check", "arrow", "plusTile", "plus", "plusIcon", "divider"],
  styles: {
    root: {
      base: { font: "$font.family.sans", fg: "$color.text.body" },
      // The phone's root is the bottom sheet itself.
      platforms: { mobile: { base: { bg: "$color.background.raised", paddingX: "$space.gutter.page", paddingBottom: "$size.layout.homeIndicator", radiusTop: "$radius.sheet", shadow: "$elevation.shadow.modal" } } },
    },
    column: { on: ["desktop"], base: { width: "$size.layout.rail", bg: "$color.background.chrome", borderRightWidth: "$border.width.hairline", borderRightColor: "$color.border.subtle" } },
    indicator: { on: ["desktop"], base: { top: "$workspaceSwitcher.markerOffsetY", width: "$workspaceSwitcher.markerWidth", bg: "$color.text.strong", radiusTopRight: "$workspaceSwitcher.markerRadius", radiusBottomRight: "$workspaceSwitcher.markerRadius" } },
    tile: { on: ["desktop"], base: { padding: "$space.3xs", radius: "$workspaceSwitcher.tileRadius" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    addTile: {
      on: ["desktop"],
      base: { square: "$navRail.itemSize", radius: "$workspaceSwitcher.tileRadius", fg: "$color.text.faint" },
      states: { hover: { fg: "$color.text.strong", bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    addIcon: { on: ["desktop"], base: { square: "$size.icon.default" } },
    menu: {
      on: ["web"],
      base: { width: "$workspaceSwitcher.menuWidth", padding: "$space.xs", radius: "$radius.card", bg: "$color.background.raised", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.menu" },
    },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", radius: "$radius.pill", bg: "$color.border.muted" } },
    title: {
      on: ["web", "mobile"],
      base: { size: "$font.size.caption", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.lead", line: "$font.lineHeight.lead", weight: "$font.weight.semibold", fg: "$color.text.strong" } } },
    },
    row: {
      on: ["web", "mobile"],
      base: { minHeight: "$workspaceSwitcher.menuRowHeight" },
      platforms: {
        web: { base: { radius: "$radius.control", size: "$font.size.bodySm", fg: "$color.text.body" }, states: { hover: { bg: "$color.background.hover" }, focus: { bg: "$color.background.hover" } } },
        // A phone has no hover; a pressed row dims (the kit's opacity) and a focused one rings.
        mobile: { states: { focus: { shadow: "$elevation.shadow.focus" } } },
      },
    },
    name: {
      on: ["web", "mobile"],
      base: { weight: "$font.weight.medium", fg: "$color.text.strong" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } },
    },
    host: {
      on: ["web", "mobile"],
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { weight: "$font.weight.normal" } } },
    },
    check: { on: ["web", "mobile"], base: { square: "$size.icon.md", fg: "$color.background.brand.default" } },
    arrow: { on: ["web"], base: { square: "$size.icon.sm", fg: "$color.text.faint" } },
    plusTile: { on: ["web"], base: { square: "$size.avatar.sm", radius: "$radius.control", borderColor: "$color.border.default", fg: "$color.text.faint" } },
    plus: { on: ["mobile"], base: { square: "$size.avatar.md", radius: "$radius.control", borderWidth: "$workspaceSwitcher.tileRingWidth", borderColor: "$color.border.default" } },
    plusIcon: { on: ["web", "mobile"], base: { square: "$size.icon.default" }, platforms: { mobile: { base: { fg: "$color.text.faint" } } } },
    divider: { on: ["web"], base: { height: "$border.width.hairline", bg: "$color.border.subtle" } },
  },
  reads: ["$workspaceSwitcher.badgeOffsetY", "$workspaceSwitcher.badgeOffsetX"],
});
