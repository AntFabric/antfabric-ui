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
      base: { gap: "$space.md", paddingX: "$space.lgXl", font: "$font.family.sans" },
      variants: { kind: { new: { gap: "$space.smMd" } } },
      platforms: {
        // The phone's band has no stacking order of its own.
        web: { variants: { sticky: { true: { zIndex: "$zIndex.sticky" } } } },
        desktop: { variants: { sticky: { true: { zIndex: "$zIndex.sticky" } } } },
        mobile: { base: { paddingX: "$space.gutter.pane", paddingY: "$space.sm" } },
      },
    },
    rule: {
      base: { height: "$border.width.hairline", bg: "$color.border.subtle" },
      variants: { kind: { new: { bg: "$color.background.brand.default" } } },
    },
    pill: {
      on: ["web", "desktop"],
      base: { paddingX: "$space.md", radius: "$radius.pill", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.card" },
    },
    stickyPill: {
      base: { paddingX: "$space.md", radius: "$radius.pill", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.card", shadow: "$elevation.shadow.raise", fg: "$color.text.muted" },
      states: { hover: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" }, focus: { shadow: "$elevation.shadow.focus" } },
      // The phone's band is not a button: no states, a translucent fill over the list, the card's shadow.
      platforms: { mobile: { base: { bg: "$color.background.overlay", shadow: "$elevation.shadow.card" } } },
    },
    label: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.bold", fg: "$color.text.muted" },
    },
    icon: { on: ["web", "desktop"], base: { square: "$size.icon.sm" } },
    newLabel: {
      base: { size: "$font.size.micro", line: "$font.lineHeight.caption", weight: "$font.weight.bold", fg: "$color.text.link" },
      platforms: { mobile: { base: { size: "$font.size.caption" } } }, // idiom: one step larger
    },
  },
});
