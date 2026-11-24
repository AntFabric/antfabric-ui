import { defineRecipe } from "../../recipe";

/**
 * MessageActions: the hover toolbar on a message. Web and desktop only (the phone has the long-press sheet). The bar's own radius
 * and the padding and gaps between its buttons are the kit's. The buttons beside the quick reactions are IconButtons, which have
 * their own recipe.
 */
export const messageActions = defineRecipe({
  parts: ["root", "quick", "emoji", "rule"],
  styles: {
    root: { on: ["web", "desktop"], base: { borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.raised", shadow: "$elevation.shadow.raise" } },
    quick: {
      on: ["web", "desktop"],
      base: { square: "$size.control.icon", radius: "$radius.control" },
      states: { hover: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    emoji: { on: ["web", "desktop"], base: { size: "$font.size.lead" } },
    rule: { on: ["web", "desktop"], base: { width: "$border.width.hairline", bg: "$color.border.subtle" } },
  },
});
