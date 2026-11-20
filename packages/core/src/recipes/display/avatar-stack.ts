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
        bg: "$surface.muted",
        fg: "$fg.muted",
        font: "$font.sans",
        weight: "$font.weightSemibold",
        borderWidth: "$border.wThick",
        borderColor: "$surface.card",
      },
      variants: {
        size: { xs: { height: "$avatar.xs" }, sm: { height: "$avatar.sm" }, md: { height: "$avatar.md", size: "$text.caption" } },
        ground: {
          default: { borderColor: "$surface.card" },
          sidebar: { borderColor: "$surface.sidebar" },
          recessed: { borderColor: "$surface.recessed" },
          selected: { borderColor: "$surface.selected" },
        },
      },
      platforms: { mobile: { base: { size: "$text.caption" } } }, // idiom: one step larger count
    },
  },
});
