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
        paddingX: "$tooltip.padX",
        maxWidth: "$tooltip.maxW",
        zIndex: "$z.tooltip",
        radius: "$radius.control",
        bg: "$surface.inverse",
        fg: "$fg.onInverse",
        font: "$font.sans",
        size: "$text.micro",
        weight: "$font.weightSemibold",
        tracking: "$tracking.tight",
        shadow: "$shadow.tooltip",
      },
    },
  },
  // $tooltip.padY is a read, not paddingY: with paddingX the reader writes one `padding` shorthand, which the render snapshot counts as a change.
  reads: ["$tooltip.padY", "$tooltip.kbdH", "$tooltip.kbdLabel"],
});
