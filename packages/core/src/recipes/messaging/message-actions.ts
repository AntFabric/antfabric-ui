import { defineRecipe } from "../../recipe";

/**
 * MessageActions: the hover toolbar on a message. Web and desktop only (the phone has the long-press sheet). The bar's own radius
 * and the padding and gaps between its buttons are the kit's. The buttons beside the quick reactions are IconButtons, which have
 * their own recipe.
 */
export const messageActions = defineRecipe({
  parts: ["root", "quick", "emoji", "rule"],
  styles: {
    root: { on: ["web", "desktop"], base: { borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.raised", shadow: "$shadow.raise" } },
    quick: {
      on: ["web", "desktop"],
      base: { square: "$control.hIcon", radius: "$radius.control" },
      states: { hover: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" }, focus: { shadow: "$shadow.focus" } },
    },
    emoji: { on: ["web", "desktop"], base: { size: "$text.lead" } },
    rule: { on: ["web", "desktop"], base: { width: "$border.wHairline", bg: "$border.subtle" } },
  },
});
