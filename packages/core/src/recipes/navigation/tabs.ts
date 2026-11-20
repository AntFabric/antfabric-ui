import { defineRecipe } from "../../recipe";

/**
 * Tabs. Written from the React kit's table. `on` is the chosen tab (and its count chip). The kit passes `hover` and `pressed` only for a tab that is not chosen.
 * The web's tab list is the strip itself (`root`); the phone scrolls a strip (`root`) over a content row (the `ScrollView`'s own container, which takes no part mark), which carries the gap and the pane gutter.
 * The phone's larger tab (the 44pt target, and body-small text) is a deliberate platform idiom (owner decision, 2026-11-03), kept in `platforms.mobile`.
 * The phone's pressed ink is the web's hover ink, `fg.muted` (item 43). Kept, structural (listed for the owner): the hairline under the strip (web a shadow inside the box,
 * phone a bottom edge, so the web's rule takes no room and the phone's does).
 * Vocabulary gap: the phone's content row cannot be marked as a part, so the kit reads its pane gutter (`gutter.pane`) itself.
 * Vocabulary gap: the web's rule is an inset shadow on one edge (`inset 0 -1px 0`), which no key says (`ring` is all four sides), so the web kit writes it from `border.subtle`.
 */
export const tabs = defineRecipe({
  parts: ["root", "tab", "count", "indicator"],
  styles: {
    root: {
      platforms: {
        web: { base: { gap: "$space.lg", font: "$font.sans" } },
        desktop: { base: { gap: "$space.lg", font: "$font.sans" } },
        mobile: { variants: { rule: { true: { borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle" }, false: {} } } },
      },
    },
    tab: {
      base: { gap: "$space.xs", height: "$control.hSm", radius: "$radius.tag", size: "$text.caption", weight: "$font.weightSemibold", fg: "$fg.faint" },
      states: { on: { fg: "$fg.strong" }, hover: { fg: "$fg.muted" }, focus: { shadow: "$shadow.focus" } },
      platforms: { mobile: { base: { height: "$control.hit", size: "$text.bodySm" }, states: { pressed: { fg: "$fg.muted" } } } }, // idiom: the 44pt touch target and one step larger text
    },
    count: {
      base: {
        minWidth: "$tab.countSize",
        height: "$tab.countSize",
        paddingX: "$space.xs",
        radius: "$radius.control",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        bg: "$surface.card",
        size: "$text.caption",
        weight: "$font.weightSemibold",
        fg: "$fg.subtle",
      },
      states: { on: { fg: "$fg.body" } },
    },
    indicator: { base: { left: "$space.none", right: "$space.none", bottom: "$space.none", height: "$border.wThick", radius: "$tab.indicatorRadius", bg: "$brand.default" } },
  },
  reads: ["$border.subtle", "$gutter.pane", "$opacity.disabled"],
});
