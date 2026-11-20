import { defineRecipe, type PartLayers } from "../../recipe";

/**
 * Fab (the web draws it on desktop only). Written from the React kit's table. The web paints the disc on the button itself (`root`); the phone has
 * a frame (`root`: size, the focus ring, the disabled fade, the press scale) with the disc inside it (`disc`: fill, edge, shadow, glyph), so the
 * fill is written for both: under `web` and `desktop` on `root`, under `mobile` on `disc`. The kit says when glass is on: macOS 26 and iOS 26 draw
 * ink and raised as a glass material with an ink glyph, which no prop or state names, so that look is the kit's.
 * Kept as press feedback (the phone scales, it does not fill; listed for the owner): the raised disc's pressed fill (web `surface.selected`, the phone only scales it), and its focus
 * ring (web stacks the float shadow under it on the one element; the phone's frame draws the ring around the disc's own float shadow).
 * Vocabulary gap: the glass material is a platform surface with its own shadow (`shadow.glass`, stacked under the focus ring on the web) and ink (`fg.strong`),
 * so the kits read them for it.
 */
const fill = {
  variants: {
    variant: {
      ink: { bg: "$surface.inverse", fg: "$fg.onInverse", states: { hover: { bg: "$brand.default", fg: "$fg.onBrand" } } },
      tint: { bg: "$brand.tint", fg: "$brand.default", states: { hover: { bg: "$brand.softHover" } } },
      // The one icon button that keeps a container: the float shadow is part of the shape, so focus adds to it.
      raised: {
        bg: "$surface.card",
        fg: "$fg.muted",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        shadow: "$shadow.float",
        states: { hover: { bg: "$hover.surface", fg: "$fg.strong" }, pressed: { bg: "$surface.selected" }, focus: { halo: "$shadow.float" } },
      },
    },
  },
  states: { focus: { shadow: "$shadow.focus" } },
} satisfies PartLayers;

/** The same fills on the phone, which has no hover and no pressed fill (a press only scales the disc). */
const phoneFill = {
  variants: {
    variant: {
      ink: { bg: "$surface.inverse", fg: "$fg.onInverse" },
      tint: { bg: "$brand.tint", fg: "$brand.default" },
      raised: { bg: "$surface.card", fg: "$fg.muted", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.float" },
    },
  },
} satisfies PartLayers;

export const fab = defineRecipe({
  parts: ["root", "disc", "icon"],
  styles: {
    root: {
      base: { square: "$fab.size", radius: "$radius.circle" },
      states: { disabled: { opacity: "$opacity.disabled" } },
      platforms: { web: fill, desktop: fill, mobile: { states: { focus: { shadow: "$shadow.focus" } } } },
    },
    disc: { on: ["mobile"], base: { square: "$fab.size", radius: "$radius.circle" }, platforms: { mobile: phoneFill } },
    icon: { base: { square: "$icon.size" } },
  },
  // `fab.markSize`: the brand mark drawn in place of the glyph (`src`). No example draws it yet, so it is read, not a part, until the docs have one.
  reads: ["$shadow.glass", "$fg.strong", "$fab.markSize"],
});
