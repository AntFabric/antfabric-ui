import { defineRecipe } from "../../recipe";

/**
 * Kbd. Web and desktop only (the phone has no keyboard hint). The keys' type is on `root`, which draws them as its own text.
 * A Mac spaces its glyphs (`tracking.caps`); no other OS does. The bare tone drops the cap: its edge and padding are zero, which
 * is a literal in the kit, because the recipe's vocabulary has no zero.
 * The key cap's thicker bottom edge is a `borderBottomWidth` on the default and inverse tones.
 */
export const kbd = defineRecipe({
  parts: ["root"],
  styles: {
    root: {
      on: ["web", "desktop"],
      base: {
        paddingX: "$space.xs",
        radius: "$radius.tag",
        bg: "$surface.card",
        borderWidth: "$border.wHairline",
        borderColor: "$border.muted",
        fg: "$fg.muted",
        font: "$font.sans",
        size: "$text.micro",
        weight: "$font.weightSemibold",
      },
      variants: {
        tone: {
          default: { borderBottomWidth: "$border.wThick" },
          inverse: { bg: "$surface.inverseWash", borderColor: "$border.inverse", borderBottomWidth: "$border.wThick", fg: "$fg.onInverse" },
          bare: { bg: "transparent", fg: "$fg.faint" },
        },
      },
      platforms: { mac: { base: { tracking: "$tracking.caps" } } },
    },
  },
});
