import { defineRecipe } from "../../recipe";

/**
 * WebTopBar (web only: a desktop window has the title bar, a phone the mobile header). A bar over the page with history on the
 * left, a search field in the middle and help and the workspace menu on the right. The bar's rule is its bottom edge, and the search
 * field's width limits are the field's (`maxWidth`) and its slot's (`minWidth`).
 */
export const webTopBar = defineRecipe({
  parts: ["root", "searchSlot", "search", "searchIcon"],
  styles: {
    root: { base: { height: "$size.layout.topBar", bg: "$color.background.chrome", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle", font: "$font.family.sans", fg: "$color.text.body" } },
    searchSlot: { base: { minWidth: "$size.layout.topBarSearchMin" } },
    search: {
      base: {
        height: "$size.control.xs",
        maxWidth: "$size.layout.topBarSearchMax",
        radius: "$radius.control",
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        shadow: "$elevation.shadow.hairline",
        fg: "$color.text.faint",
        size: "$font.size.bodySm",
      },
      states: { hover: { borderColor: "$color.border.muted", bg: "$color.background.recessed" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    searchIcon: { base: { square: "$size.icon.md", fg: "$color.text.subtle" } },
  },
});
