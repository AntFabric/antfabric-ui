import { defineRecipe } from "../../recipe";

/**
 * AvatarStack. The faces are `Avatar`s (their own recipe); what the stack decides is the +N chip and the ring each face wears,
 * which is cut in the ground's colour and is the chip's own edge: the kit reads the ring (and the face's size, which is the chip's
 * height) from `more`, so the chip and the faces cannot drift apart. The chip's type is on `more` (the web draws the digits as its own text).
 * The 1.5 ring of `xs` and the 9 and 10 point type of `xs` and `sm` are literals in the kit. The phone sets every size's count in caption type.
 */
export const avatarStack = defineRecipe({
  parts: ["root", "more"],
  styles: {
    more: {
      base: {
        paddingX: "$space.2xs",
        radius: "$radius.pill",
        bg: "$color.background.muted",
        fg: "$color.text.muted",
        font: "$font.family.sans",
        weight: "$font.weight.semibold",
        borderWidth: "$border.width.thick",
        borderColor: "$color.background.card",
      },
      variants: {
        size: { xs: { height: "$size.avatar.xs" }, sm: { height: "$size.avatar.sm" }, md: { height: "$size.avatar.md", size: "$font.size.caption" } },
        ground: {
          default: { borderColor: "$color.background.card" },
          sidebar: { borderColor: "$color.background.sidebar" },
          recessed: { borderColor: "$color.background.recessed" },
          selected: { borderColor: "$color.background.selected" },
        },
      },
      platforms: { mobile: { base: { size: "$font.size.caption" } } }, // idiom: one step larger count
    },
  },
});
