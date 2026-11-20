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
        font: "$font.sans",
        size: "$text.caption",
        line: "$text.captionLine",
        weight: "$font.weightSemibold",
        outlineWidth: "$border.wHairline",
        outlineColor: "transparent",
      },
      variants: {
        tone: {
          neutral: { bg: "$tag.neutralBg", fg: "$tag.neutralFg" },
          brand: { bg: "$tag.brandBg", fg: "$tag.brandFg" },
          success: { bg: "$tag.successBg", fg: "$tag.successFg" },
          warning: { bg: "$tag.warningBg", fg: "$tag.warningFg" },
          danger: { bg: "$tag.dangerBg", fg: "$tag.dangerFg" },
          info: { bg: "$tag.infoBg", fg: "$tag.infoFg" },
        },
      },
      platforms: { mobile: { base: { paddingX: "$space.sm" }, variants: { size: { md: { paddingY: "$space.2xs" }, sm: { paddingY: "$space.3xs" } } } } },
    },
    icon: { base: { square: "$icon.sizeSm" } },
  },
});
