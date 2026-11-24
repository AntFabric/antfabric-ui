import { defineRecipe } from "../../recipe";

/**
 * Skeleton. Every grey shape (`shape`, `lead`, `bar`) is a fill with a band of sheen crossing it: `bg` is the fill and `fg` is the band's colour.
 * The phone draws the band as slices of `fg`. The web paints it in a gradient, so its kit reads both from the part and writes
 * `background-color` and `background-image` itself (it does not set `color`).
 * The row preset's gap and the heights of its title and subtitle lines are one step up on the phone (its idiom: body over body-small).
 * The row's padding is not here: the web writes two longhands and the phone a StyleSheet `padding` (see ListItem's recipe for why), so the kits keep it as `space` reads.
 * The row's lead radius for a tile (6 beside one line, 10 beside two) and the bars' heights are literals in the kits.
 */
export const skeleton = defineRecipe({
  parts: ["root", "shape", "row", "lead", "titleBox", "subBox", "bar"],
  styles: {
    shape: {
      base: { bg: "$color.background.skeleton.fill", fg: "$color.background.skeleton.sheen" },
      variants: {
        shape: { line: { radius: "$radius.pill" }, block: { radius: "$radius.control" }, circle: { radius: "$radius.circle" }, tag: { radius: "$radius.tag" }, panel: { radius: "$radius.card" } },
      },
    },
    row: { base: { gap: "$space.sm", minHeight: "$size.row.default" }, platforms: { mobile: { base: { gap: "$space.md" } } } },
    lead: { base: { bg: "$color.background.skeleton.fill", fg: "$color.background.skeleton.sheen" }, variants: { lead: { face: { radius: "$radius.circle" } } } },
    titleBox: { base: { height: "$font.lineHeight.bodySm" }, platforms: { mobile: { base: { height: "$font.lineHeight.body" } } } },
    subBox: { base: { height: "$font.lineHeight.caption" }, platforms: { mobile: { base: { height: "$font.lineHeight.bodySm" } } } },
    bar: { base: { bg: "$color.background.skeleton.fill", fg: "$color.background.skeleton.sheen", radius: "$radius.pill" } },
  },
});
