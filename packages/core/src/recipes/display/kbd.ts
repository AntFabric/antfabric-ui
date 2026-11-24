import { defineRecipe } from "../../recipe";

/**
 * Kbd. Web and desktop only (the phone has no keyboard hint). The keys' type is on `root`, which draws them as its own text.
 * A Mac spaces its glyphs (`font.letterSpacing.caps`); no other OS does. The bare tone drops the cap: its edge and padding are zero, which
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
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.muted",
        fg: "$color.text.muted",
        font: "$font.family.sans",
        size: "$font.size.micro",
        weight: "$font.weight.semibold",
      },
      variants: {
        tone: {
          default: { borderBottomWidth: "$border.width.thick" },
          inverse: { bg: "$color.background.inverseWash", borderColor: "$color.border.inverse", borderBottomWidth: "$border.width.thick", fg: "$color.text.onInverse" },
          bare: { bg: "transparent", fg: "$color.text.faint" },
        },
      },
      platforms: { mac: { base: { tracking: "$font.letterSpacing.caps" } } },
    },
  },
});
