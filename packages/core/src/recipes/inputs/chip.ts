import { defineRecipe, type VariantStyle } from "../../recipe";

/** The remove button's hover wash: a grey disc under the ✕. */
const washed: VariantStyle = { states: { hover: { bg: "$surface.muted" } } };

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
        maxWidth: "$chip.maxW",
        height: "$chip.h",
        radius: "$radius.pill",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        bg: "$surface.card",
        fg: "$fg.faint",
        font: "$font.sans",
        size: "$text.caption",
        weight: "$font.weightMedium",
      },
      variants: {
        variant: {
          filter: {
            states: { hover: { bg: "$hover.surface", fg: "$fg.strong" }, pressed: { bg: "$hover.surface" }, on: { bg: "$surface.inverse", borderColor: "$surface.inverse", fg: "$fg.onInverse" } },
          },
          suggestion: {
            radius: "$radius.control",
            shadow: "$shadow.hairline",
            fg: "$fg.muted",
            states: {
              hover: { bg: "$hover.surface", fg: "$fg.strong" },
              pressed: { bg: "$hover.surface" },
              on: { bg: "$hover.surface", borderColor: "$border.subtle", fg: "$fg.strong" },
              focus: { halo: "$shadow.hairline" },
            },
          },
          object: {
            radius: "$radius.control",
            bg: "$brand.soft",
            borderColor: "$border.brand",
            fg: "$fg.onBrandSoft",
            weight: "$font.weightSemibold",
            states: { hover: { bg: "$brand.softHover", fg: "$fg.onBrandSoft" }, pressed: { bg: "$brand.softHover" }, on: { bg: "$brand.softHover", borderColor: "$border.brand", fg: "$fg.onBrandSoft" } },
          },
        },
      },
      states: { focus: { shadow: "$shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        mobile: { base: { size: "$text.bodySm" } }, // idiom: one step larger
      },
    },
    main: {
      base: { gap: "$space.sm", paddingLeft: "$chip.padX", paddingRight: "$chip.padX" },
      variants: { removable: { true: { paddingRight: "$space.2xs" }, false: {} } },
    },
    icon: { base: { square: "$icon.sizeMd" } },
    count: { base: { weight: "$font.weightSemibold", opacity: "$opacity.secondary" } },
    remove: {
      base: { square: "$chip.removeSize", marginRight: "$space.xs", radius: "$radius.circle" },
      variants: {
        variant: {
          // The ✕ on a chosen ink chip washes lighter, to stay visible on the dark fill.
          filter: { states: { hover: { bg: "$surface.muted" }, "hover+on": { bg: "$surface.inverseHover" } } },
          suggestion: washed,
          object: washed,
        },
      },
      states: { focus: { shadow: "$shadow.focus" } },
    },
    removeIcon: { base: { square: "$icon.sizeSm" }, platforms: { mobile: { base: { square: "$icon.sizeMd" } } } }, // idiom: one step larger
  },
  // The phone grows the touch area to this (`hitSlopTo`); nothing is drawn with it.
  reads: ["$control.hit"],
});
