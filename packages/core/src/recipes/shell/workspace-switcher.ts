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
      base: { font: "$font.sans", fg: "$fg.body" },
      // The phone's root is the bottom sheet itself.
      platforms: { mobile: { base: { bg: "$surface.raised", paddingX: "$gutter.page", paddingBottom: "$homeIndicator.h", radiusTop: "$radius.sheet", shadow: "$shadow.modal" } } },
    },
    column: { on: ["desktop"], base: { width: "$rail.wNav", bg: "$surface.chrome", borderRightWidth: "$border.wHairline", borderRightColor: "$border.subtle" } },
    indicator: { on: ["desktop"], base: { top: "$workspace.markerTop", width: "$workspace.markerW", bg: "$fg.strong", radiusTopRight: "$workspace.markerRadius", radiusBottomRight: "$workspace.markerRadius" } },
    tile: { on: ["desktop"], base: { padding: "$space.3xs", radius: "$workspace.tileRadius" }, states: { focus: { shadow: "$shadow.focus" } } },
    addTile: {
      on: ["desktop"],
      base: { square: "$navRail.item", radius: "$workspace.tileRadius", fg: "$fg.faint" },
      states: { hover: { fg: "$fg.strong", bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } },
    },
    addIcon: { on: ["desktop"], base: { square: "$icon.size" } },
    menu: {
      on: ["web"],
      base: { width: "$workspace.menuW", padding: "$space.xs", radius: "$radius.card", bg: "$surface.raised", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.menu" },
    },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberW", height: "$sheet.grabberH", radius: "$radius.pill", bg: "$border.muted" } },
    title: {
      on: ["web", "mobile"],
      base: { size: "$text.caption", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.lead", line: "$text.leadLine", weight: "$font.weightSemibold", fg: "$fg.strong" } } },
    },
    row: {
      on: ["web", "mobile"],
      base: { minHeight: "$workspace.menuRowH" },
      platforms: {
        web: { base: { radius: "$radius.control", size: "$text.bodySm", fg: "$fg.body" }, states: { hover: { bg: "$hover.surface" }, focus: { bg: "$hover.surface" } } },
        // A phone has no hover; a pressed row dims (the kit's opacity) and a focused one rings.
        mobile: { states: { focus: { shadow: "$shadow.focus" } } },
      },
    },
    name: {
      on: ["web", "mobile"],
      base: { weight: "$font.weightMedium", fg: "$fg.strong" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } },
    },
    host: {
      on: ["web", "mobile"],
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { weight: "$font.weightNormal" } } },
    },
    check: { on: ["web", "mobile"], base: { square: "$icon.sizeMd", fg: "$brand.default" } },
    arrow: { on: ["web"], base: { square: "$icon.sizeSm", fg: "$fg.faint" } },
    plusTile: { on: ["web"], base: { square: "$avatar.sm", radius: "$radius.control", borderColor: "$border.default", fg: "$fg.faint" } },
    plus: { on: ["mobile"], base: { square: "$avatar.md", radius: "$radius.control", borderWidth: "$workspace.tileEdge", borderColor: "$border.default" } },
    plusIcon: { on: ["web", "mobile"], base: { square: "$icon.size" }, platforms: { mobile: { base: { fg: "$fg.faint" } } } },
    divider: { on: ["web"], base: { height: "$border.wHairline", bg: "$border.subtle" } },
  },
  reads: ["$workspace.badgeTop", "$workspace.badgeRight"],
});
