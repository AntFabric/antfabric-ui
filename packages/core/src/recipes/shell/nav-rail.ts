import { defineRecipe } from "../../recipe";

/**
 * NavRail (web and desktop; the phone has the tab bar). The icon rail down the left of the window, 64 wide collapsed and a labelled
 * sidebar when `expanded` (the sidebar button that sets it is the title bar's or the web top bar's): the AntFabric lockup, the
 * workspace pill, search, the mode destinations, the notification and bug rows, and the profile at the foot. The current row is the
 * coral-soft pill. The drill-in variant lists a destination's sections in the rail: its icon takes the logo's place on the same coral
 * tile (`logo`, with `tileIcon` for the glyph) and the workspace pill becomes the "Main menu" chip.
 * The rail's right edge is the root's. The kit keeps two edges as a `border` shorthand (the workspace pill's and the search field's 1px
 * ring) so the button reset's zero border stays under them, as the render snapshot expects; it reads `$border.subtle`, `default` and
 * `muted` for those, and the badge's corner offsets (a `Badge`'s own `style`, which carries no part).
 */
export const navRail = defineRecipe({
  parts: ["root", "lockup", "logo", "logoGlyph", "tileIcon", "wordmark", "pill", "chevron", "search", "searchIcon", "row", "icon", "separator", "profile", "profileName", "profileEmail"],
  styles: {
    root: {
      base: { width: "$rail.wNav", bg: "$surface.chrome", borderRightWidth: "$border.wHairline", borderRightColor: "$border.subtle", font: "$font.sans" },
      variants: { expanded: { true: { width: "$navRail.wOpen" } } },
    },
    lockup: { base: { square: "$navRail.item", radius: "$radius.control" }, states: { hover: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } } },
    logo: { base: { square: "$navRail.logo", radius: "$navRail.logoRadius", bg: "$brand.default" } },
    logoGlyph: { base: { fg: "$fg.onBrand", font: "$font.display", weight: "$font.weightBlack", size: "$navRail.logoGlyph" } },
    tileIcon: { base: { square: "$icon.size", fg: "$fg.onBrand" } },
    wordmark: { base: { font: "$font.display", weight: "$font.weightBold", size: "$text.lead", fg: "$fg.strong", tracking: "$tracking.tight" } },
    pill: {
      base: { height: "$navRail.chipH", radius: "$radius.pill", bg: "$surface.card", fg: "$fg.body", size: "$text.caption", weight: "$font.weightMedium" },
      states: { hover: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } },
    },
    chevron: { base: { square: "$icon.sizeSm" } },
    search: {
      base: { height: "$control.hLg", radius: "$radius.control", bg: "$surface.card", shadow: "$shadow.hairline", fg: "$fg.faint", size: "$text.bodySm" },
      states: { focus: { shadow: "$shadow.focus" } },
    },
    searchIcon: { base: { square: "$icon.sizeMd", fg: "$fg.subtle" } },
    row: {
      base: { square: "$navRail.item", radius: "$radius.pill", fg: "$fg.faint", size: "$text.body", weight: "$font.weightSemibold" },
      // `on` is the current destination: the coral-soft pill, which hovering keeps.
      states: { on: { bg: "$brand.soft", fg: "$brand.active" }, hover: { bg: "$hover.surface" }, "hover+on": { bg: "$brand.soft" }, focus: { shadow: "$shadow.focus" } },
    },
    icon: { base: { square: "$icon.sizeLg" } },
    separator: { base: { height: "$border.wHairline", bg: "$border.subtle" } },
    profile: { base: { radius: "$radius.pill" }, states: { hover: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } } },
    profileName: { base: { size: "$text.bodySm", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    profileEmail: { base: { size: "$text.caption", fg: "$fg.faint" } },
  },
  reads: ["$border.subtle", "$border.default", "$border.muted", "$navRail.badgeTop", "$navRail.badgeLeft"],
});
