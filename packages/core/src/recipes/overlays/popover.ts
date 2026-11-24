import { defineRecipe } from "../../recipe";

/**
 * Popover. A panel that hangs from the control that opened it, on web and desktop; the phone draws the same panel in a modal over the
 * screen. The panel is a card (the menu's surface, edge, corner and shadow) with room round what it holds; `bare` removes all of it,
 * for content that is already a card (a Menu). The kit reads the layer's z-index (`$zIndex.popover`), which no part draws: the panel sits in
 * the overlay layer, and the layer takes the index.
 */
export const popover = defineRecipe({
  parts: ["root", "panel"],
  styles: {
    panel: {
      base: {
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        radius: "$radius.rail",
        shadow: "$elevation.shadow.menu",
        padding: "$space.sm",
        font: "$font.family.sans",
        fg: "$color.text.body",
      },
      variants: { bare: { true: { bg: "transparent", shadow: "none", borderWidth: "none", borderColor: "none", radius: "none", padding: "none" } } },
    },
  },
  reads: ["$zIndex.popover"],
});
