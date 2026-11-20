import { defineRecipe } from "../../recipe";

/**
 * MessageDivider. Written from the React kit's table. The web's sticky day pill is a button (card fill, raised, hover and press
 * states); the phone's is a translucent band over the list (overlay fill, card shadow), so `stickyPill` carries both. The phone
 * has no pill around a plain day label and no chevron, and its side padding is the pane gutter.
 * The web's block padding (asymmetric on a day row, so no `paddingY`) stays in the kit as `space` reads. The sticky band's stacking order is the root's.
 * The rule's colour, the label's weight and ink and the "New messages" label's weight and ink are the web's on the phone (item 43);
 * its "New messages" label is one step larger (idiom, item 42).
 */
export const messageDivider = defineRecipe({
  parts: ["root", "rule", "pill", "stickyPill", "label", "icon", "newLabel"],
  styles: {
    root: {
      base: { gap: "$space.md", paddingX: "$space.lgXl", font: "$font.sans" },
      variants: { kind: { new: { gap: "$space.smMd" } } },
      platforms: {
        // The phone's band has no stacking order of its own.
        web: { variants: { sticky: { true: { zIndex: "$z.sticky" } } } },
        desktop: { variants: { sticky: { true: { zIndex: "$z.sticky" } } } },
        mobile: { base: { paddingX: "$gutter.pane", paddingY: "$space.sm" } },
      },
    },
    rule: {
      base: { height: "$border.wHairline", bg: "$border.subtle" },
      variants: { kind: { new: { bg: "$brand.default" } } },
    },
    pill: {
      on: ["web", "desktop"],
      base: { paddingX: "$space.md", radius: "$radius.pill", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.card" },
    },
    stickyPill: {
      base: { paddingX: "$space.md", radius: "$radius.pill", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.card", shadow: "$shadow.raise", fg: "$fg.muted" },
      states: { hover: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" }, focus: { shadow: "$shadow.focus" } },
      // The phone's band is not a button: no states, a translucent fill over the list, the card's shadow.
      platforms: { mobile: { base: { bg: "$surface.overlay", shadow: "$shadow.card" } } },
    },
    label: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightBold", fg: "$fg.muted" },
    },
    icon: { on: ["web", "desktop"], base: { square: "$icon.sizeSm" } },
    newLabel: {
      base: { size: "$text.micro", line: "$text.captionLine", weight: "$font.weightBold", fg: "$link.default" },
      platforms: { mobile: { base: { size: "$text.caption" } } }, // idiom: one step larger
    },
  },
});
