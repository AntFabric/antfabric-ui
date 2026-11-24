import { defineRecipe, type PartLayers } from "../../recipe";

/**
 * Fab (the web draws it on desktop only). Written from the React kit's table. The web paints the disc on the button itself (`root`); the phone has
 * a frame (`root`: size, the focus ring, the disabled fade, the press scale) with the disc inside it (`disc`: fill, edge, shadow, glyph), so the
 * fill is written for both: under `web` and `desktop` on `root`, under `mobile` on `disc`. The kit says when glass is on: macOS 26 and iOS 26 draw
 * ink and raised as a glass material with an ink glyph, which no prop or state names, so that look is the kit's.
 * Kept as press feedback (the phone scales, it does not fill; listed for the owner): the raised disc's pressed fill (web `color.background.selected`, the phone only scales it), and its focus
 * ring (web stacks the float shadow under it on the one element; the phone's frame draws the ring around the disc's own float shadow).
 * Vocabulary gap: the glass material is a platform surface with its own shadow (`elevation.shadow.glass`, stacked under the focus ring on the web) and ink (`color.text.strong`),
 * so the kits read them for it.
 */
const fill = {
  variants: {
    variant: {
      ink: { bg: "$color.background.inverse", fg: "$color.text.onInverse", states: { hover: { bg: "$color.background.brand.default", fg: "$color.text.onBrand" } } },
      tint: { bg: "$color.background.brand.tint", fg: "$color.background.brand.default", states: { hover: { bg: "$color.background.brand.softHover" } } },
      // The one icon button that keeps a container: the float shadow is part of the shape, so focus adds to it.
      raised: {
        bg: "$color.background.card",
        fg: "$color.text.muted",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        shadow: "$elevation.shadow.float",
        states: { hover: { bg: "$color.background.hover", fg: "$color.text.strong" }, pressed: { bg: "$color.background.selected" }, focus: { halo: "$elevation.shadow.float" } },
      },
    },
  },
  states: { focus: { shadow: "$elevation.shadow.focus" } },
} satisfies PartLayers;

/** The same fills on the phone, which has no hover and no pressed fill (a press only scales the disc). */
const phoneFill = {
  variants: {
    variant: {
      ink: { bg: "$color.background.inverse", fg: "$color.text.onInverse" },
      tint: { bg: "$color.background.brand.tint", fg: "$color.background.brand.default" },
      raised: { bg: "$color.background.card", fg: "$color.text.muted", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.float" },
    },
  },
} satisfies PartLayers;

export const fab = defineRecipe({
  parts: ["root", "disc", "icon"],
  styles: {
    root: {
      base: { square: "$fab.size", radius: "$radius.circle" },
      states: { disabled: { opacity: "$opacity.disabled" } },
      platforms: { web: fill, desktop: fill, mobile: { states: { focus: { shadow: "$elevation.shadow.focus" } } } },
    },
    disc: { on: ["mobile"], base: { square: "$fab.size", radius: "$radius.circle" }, platforms: { mobile: phoneFill } },
    icon: { base: { square: "$size.icon.default" } },
  },
  // `fab.markSize`: the brand mark drawn in place of the glyph (`src`). No example draws it yet, so it is read, not a part, until the docs have one.
  reads: ["$elevation.shadow.glass", "$color.text.strong", "$fab.markSize"],
});
