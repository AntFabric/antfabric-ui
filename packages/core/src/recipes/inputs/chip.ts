import { defineRecipe, type VariantStyle } from "../../recipe";

/** The remove button's hover wash: a grey disc under the ✕. */
const washed: VariantStyle = { states: { hover: { bg: "$color.background.muted" } } };

/**
 * Chip. Written from the React kit's table. `on` is "chosen" (`selected`): ink for a filter, the hover look for a suggestion, a deeper coral for an
 * object, and the kit passes no hover or pressed while a chip is on, so a chosen chip keeps its fill. The root holds the chip's type (the phone's reader
 * hands it to the `Text` the kit draws for the label and the count); `main` is the label's button and `remove` the ✕.
 * The phone's larger label, count and ✕ glyph are a deliberate platform idiom (owner decision, 2026-11-03), kept in `platforms.mobile`.
 * The ✕'s right margin and a suggestion chip's hairline shadow (kept when chosen and under the focus ring) are the web's on the phone (item 43).
 * The count fades by `opacity.secondary` (0.7; a theme may lift it); a resting ✕ fades by the kit's 0.7 and is 1 on hover or focus.
 */
export const chip = defineRecipe({
  parts: ["root", "main", "icon", "count", "remove", "removeIcon"],
  styles: {
    root: {
      base: {
        maxWidth: "$chip.maxWidth",
        height: "$chip.height",
        radius: "$radius.pill",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        bg: "$color.background.card",
        fg: "$color.text.faint",
        font: "$font.family.sans",
        size: "$font.size.caption",
        weight: "$font.weight.medium",
      },
      variants: {
        variant: {
          filter: {
            states: { hover: { bg: "$color.background.hover", fg: "$color.text.strong" }, pressed: { bg: "$color.background.hover" }, on: { bg: "$color.background.inverse", borderColor: "$color.background.inverse", fg: "$color.text.onInverse" } },
          },
          suggestion: {
            radius: "$radius.control",
            shadow: "$elevation.shadow.hairline",
            fg: "$color.text.muted",
            states: {
              hover: { bg: "$color.background.hover", fg: "$color.text.strong" },
              pressed: { bg: "$color.background.hover" },
              on: { bg: "$color.background.hover", borderColor: "$color.border.subtle", fg: "$color.text.strong" },
              focus: { halo: "$elevation.shadow.hairline" },
            },
          },
          object: {
            radius: "$radius.control",
            bg: "$color.background.brand.soft",
            borderColor: "$color.border.brand",
            fg: "$color.text.onBrandSoft",
            weight: "$font.weight.semibold",
            states: { hover: { bg: "$color.background.brand.softHover", fg: "$color.text.onBrandSoft" }, pressed: { bg: "$color.background.brand.softHover" }, on: { bg: "$color.background.brand.softHover", borderColor: "$color.border.brand", fg: "$color.text.onBrandSoft" } },
          },
        },
      },
      states: { focus: { shadow: "$elevation.shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        mobile: { base: { size: "$font.size.bodySm" } }, // idiom: one step larger
      },
    },
    main: {
      base: { gap: "$space.sm", paddingLeft: "$chip.paddingX", paddingRight: "$chip.paddingX" },
      variants: { removable: { true: { paddingRight: "$space.2xs" }, false: {} } },
    },
    icon: { base: { square: "$size.icon.md" } },
    count: { base: { weight: "$font.weight.semibold", opacity: "$opacity.secondary" } },
    remove: {
      base: { square: "$chip.removeSize", marginRight: "$space.xs", radius: "$radius.circle" },
      variants: {
        variant: {
          // The ✕ on a chosen ink chip washes lighter, to stay visible on the dark fill.
          filter: { states: { hover: { bg: "$color.background.muted" }, "hover+on": { bg: "$color.background.inverseHover" } } },
          suggestion: washed,
          object: washed,
        },
      },
      states: { focus: { shadow: "$elevation.shadow.focus" } },
    },
    removeIcon: { base: { square: "$size.icon.sm" }, platforms: { mobile: { base: { square: "$size.icon.md" } } } }, // idiom: one step larger
  },
  // The phone grows the touch area to this (`hitSlopTo`); nothing is drawn with it.
  reads: ["$size.target.min"],
});
