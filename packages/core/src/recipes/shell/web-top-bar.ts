import { defineRecipe } from "../../recipe";

/**
 * WebTopBar (web only: a desktop window has the title bar, a phone the mobile header). A bar over the page with history on the
 * left, a search field in the middle and help and the workspace menu on the right. The bar's rule is its bottom edge, and the search
 * field's width limits are the field's (`maxWidth`) and its slot's (`minWidth`).
 */
export const webTopBar = defineRecipe({
  parts: ["root", "searchSlot", "search", "searchIcon"],
  styles: {
    root: { base: { height: "$topbar.h", bg: "$surface.chrome", borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle", font: "$font.sans", fg: "$fg.body" } },
    searchSlot: { base: { minWidth: "$topbar.searchMinW" } },
    search: {
      base: {
        height: "$control.hXs",
        maxWidth: "$topbar.searchMaxW",
        radius: "$radius.control",
        bg: "$surface.card",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        shadow: "$shadow.hairline",
        fg: "$fg.faint",
        size: "$text.bodySm",
      },
      states: { hover: { borderColor: "$border.muted", bg: "$surface.recessed" }, focus: { shadow: "$shadow.focus" } },
    },
    searchIcon: { base: { square: "$icon.sizeMd", fg: "$fg.subtle" } },
  },
});
