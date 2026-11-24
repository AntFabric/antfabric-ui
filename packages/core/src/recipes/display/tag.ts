import { defineRecipe } from "../../recipe";

/**
 * Tag. The label's type is on `root` (the web draws it as the tag's own text; the phone's reader hands it to the `Text`).
 * `size` only differs on the phone: its `md` is 4 x 8 to sit in a 44pt row and its `sm` is the web's 2 x 8.
 * The web's padding (`space.3xs` x `space.sm`) is not here: the reader writes `paddingX` and `paddingY` together as one `padding`, and the
 * render snapshot would count that as a change from the two longhands the web wrote, so the web kit keeps it as `space` reads.
 * The web's forced-colours outline is a hairline in `transparent` (an `outline`, not an edge). Its offset of -1 is the kit's: the recipe has no token for it.
 */
export const tag = defineRecipe({
  parts: ["root", "icon"],
  styles: {
    root: {
      base: {
        gap: "$space.2xs",
        radius: "$radius.tag",
        font: "$font.family.sans",
        size: "$font.size.caption",
        line: "$font.lineHeight.caption",
        weight: "$font.weight.semibold",
        outlineWidth: "$border.width.hairline",
        outlineColor: "transparent",
      },
      variants: {
        tone: {
          neutral: { bg: "$color.background.tag.neutral", fg: "$color.text.tag.neutral" },
          brand: { bg: "$color.background.tag.brand", fg: "$color.text.tag.brand" },
          success: { bg: "$color.background.tag.success", fg: "$color.text.tag.success" },
          warning: { bg: "$color.background.tag.warning", fg: "$color.text.tag.warning" },
          danger: { bg: "$color.background.tag.danger", fg: "$color.text.tag.danger" },
          info: { bg: "$color.background.tag.info", fg: "$color.text.tag.info" },
        },
      },
      platforms: { mobile: { base: { paddingX: "$space.sm" }, variants: { size: { md: { paddingY: "$space.2xs" }, sm: { paddingY: "$space.3xs" } } } } },
    },
    icon: { base: { square: "$size.icon.sm" } },
  },
});
