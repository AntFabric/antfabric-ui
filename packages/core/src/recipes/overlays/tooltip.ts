import { defineRecipe } from "../../recipe";

/**
 * Tooltip. The bubble is web and desktop only (the phone has no hover, so no kit draws it there). The shortcut's key cap is the Kbd
 * component, which takes only a `style`, so its tooltip-sized height and label, and the bubble's block padding, are read by the kit (`reads`).
 */
export const tooltip = defineRecipe({
  parts: ["root", "bubble"],
  styles: {
    bubble: {
      base: {
        paddingX: "$tooltip.paddingX",
        maxWidth: "$tooltip.maxWidth",
        zIndex: "$zIndex.tooltip",
        radius: "$radius.control",
        bg: "$color.background.inverse",
        fg: "$color.text.onInverse",
        font: "$font.family.sans",
        size: "$font.size.micro",
        weight: "$font.weight.semibold",
        tracking: "$font.letterSpacing.tight",
        shadow: "$elevation.shadow.tooltip",
      },
    },
  },
  // $tooltip.paddingY is a read, not paddingY: with paddingX the reader writes one `padding` shorthand, which the render snapshot counts as a change.
  reads: ["$tooltip.paddingY", "$tooltip.kbdHeight", "$tooltip.kbdFontSize"],
});
