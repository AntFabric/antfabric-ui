import { defineRecipe } from "../../recipe";

/**
 * NavRail (web and desktop; the phone has the tab bar). The icon rail down the left of the window, 64 wide collapsed and a labelled
 * sidebar when `expanded` (the sidebar button that sets it is the title bar's or the web top bar's): the AntFabric lockup, the
 * workspace pill, search, the mode destinations, the notification and bug rows, and the profile at the foot. The current row is the
 * coral-soft pill. The drill-in variant lists a destination's sections in the rail: its icon takes the logo's place on the same coral
 * tile (`logo`, with `tileIcon` for the glyph) and the workspace pill becomes the "Main menu" chip.
 * The rail's right edge is the root's. The kit keeps two edges as a `border` shorthand (the workspace pill's and the search field's 1px
 * ring) so the button reset's zero border stays under them, as the render snapshot expects; it reads `$color.border.subtle`, `default` and
 * `muted` for those, and the badge's corner offsets (a `Badge`'s own `style`, which carries no part).
 */
export const navRail = defineRecipe({
  parts: ["root", "lockup", "logo", "logoGlyph", "tileIcon", "wordmark", "pill", "chevron", "search", "searchIcon", "row", "icon", "separator", "profile", "profileName", "profileEmail"],
  styles: {
    root: {
      base: { width: "$size.layout.rail", bg: "$color.background.chrome", borderRightWidth: "$border.width.hairline", borderRightColor: "$color.border.subtle", font: "$font.family.sans" },
      variants: { expanded: { true: { width: "$navRail.widthOpen" } } },
    },
    lockup: { base: { square: "$navRail.itemSize", radius: "$radius.control" }, states: { hover: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } } },
    logo: { base: { square: "$navRail.logoSize", radius: "$navRail.logoRadius", bg: "$color.background.brand.default" } },
    logoGlyph: { base: { fg: "$color.text.onBrand", font: "$font.family.display", weight: "$font.weight.black", size: "$navRail.logoFontSize" } },
    tileIcon: { base: { square: "$size.icon.default", fg: "$color.text.onBrand" } },
    wordmark: { base: { font: "$font.family.display", weight: "$font.weight.bold", size: "$font.size.lead", fg: "$color.text.strong", tracking: "$font.letterSpacing.tight" } },
    pill: {
      base: { height: "$navRail.chipHeight", radius: "$radius.pill", bg: "$color.background.card", fg: "$color.text.body", size: "$font.size.caption", weight: "$font.weight.medium" },
      states: { hover: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    chevron: { base: { square: "$size.icon.sm" } },
    search: {
      base: { height: "$size.control.lg", radius: "$radius.control", bg: "$color.background.card", shadow: "$elevation.shadow.hairline", fg: "$color.text.faint", size: "$font.size.bodySm" },
      states: { focus: { shadow: "$elevation.shadow.focus" } },
    },
    searchIcon: { base: { square: "$size.icon.md", fg: "$color.text.subtle" } },
    row: {
      base: { square: "$navRail.itemSize", radius: "$radius.pill", fg: "$color.text.faint", size: "$font.size.body", weight: "$font.weight.semibold" },
      // `on` is the current destination: the coral-soft pill, which hovering keeps.
      states: { on: { bg: "$color.background.brand.soft", fg: "$color.text.brand" }, hover: { bg: "$color.background.hover" }, "hover+on": { bg: "$color.background.brand.soft" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    icon: { base: { square: "$size.icon.lg" } },
    separator: { base: { height: "$border.width.hairline", bg: "$color.border.subtle" } },
    profile: { base: { radius: "$radius.pill" }, states: { hover: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } } },
    profileName: { base: { size: "$font.size.bodySm", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    profileEmail: { base: { size: "$font.size.caption", fg: "$color.text.faint" } },
  },
  reads: ["$color.border.subtle", "$color.border.default", "$color.border.muted", "$navRail.badgeOffsetY", "$navRail.badgeOffsetX"],
});
