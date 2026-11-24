import { defineRecipe } from "../../recipe";

/**
 * Toast. An inverse pill. The web draws a tone mark (a disc holding a glyph, or a `!`); the phone draws the glyph bare, so `mark`, `markIcon`
 * and `markBang` are the web's and `icon` the phone's. The phone's pill has the web's shadow and weight (item 43) and tighter insets (its idiom).
 * An error reads `color.background.danger.default` in both kits (the web's mark fill, the phone's glyph): the pill is light in the dark themes, where the pale
 * `color.text.danger` falls to 2.3:1; `color.background.danger.default` holds at least 3:1 on the pill in both themes.
 * Vocabulary gap: the chips and the info mark are the pill's own ink mixed to 12 or 20% (`color-mix` on the web, an rgba on the phone) and the
 * web's focus ring is `0 0 0 2px` of it; a token reference cannot say a mix, so the kits write them from `color.text.onInverse`, which this recipe grants.
 */
export const toast = defineRecipe({
  parts: ["root", "mark", "markIcon", "markBang", "icon", "message", "action", "actionText", "close", "closeIcon"],
  styles: {
    root: {
      base: { gap: "$space.md", paddingX: "$space.lg", bg: "$color.background.inverse", fg: "$color.text.onInverse", shadow: "$elevation.shadow.pill", font: "$font.family.sans" },
      platforms: { mobile: { base: { gap: "$space.sm", paddingX: "$space.md", paddingY: "$space.sm" } } }, // idiom: tighter insets
    },
    mark: { on: ["web", "desktop"], base: { radius: "$radius.circle", fg: "$color.text.onBrand" }, variants: { tone: { success: { bg: "$color.background.brand.default" }, error: { bg: "$color.background.danger.default", fg: "$color.text.onDanger" }, info: { fg: "$color.text.onInverse" } } } },
    markIcon: { on: ["web", "desktop"], base: { square: "$size.icon.sm" } },
    markBang: { on: ["web", "desktop"], base: { size: "$font.size.caption", weight: "$font.weight.bold" } },
    icon: {
      on: ["mobile"],
      base: { square: "$size.icon.default", fg: "$color.text.onInverse" },
      variants: { tone: { error: { fg: "$color.background.danger.default" } } },
    },
    message: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.medium" },
      platforms: { mobile: { base: { fg: "$color.text.onInverse" } } }, // the web's text inherits this ink from the pill; a phone `Text` does not
    },
    action: { base: { paddingX: "$space.smMd", fg: "$color.text.onInverse" } },
    actionText: { base: { size: "$font.size.caption", weight: "$font.weight.semibold" } },
    close: { on: ["web", "desktop"], base: { square: "$size.control.iconSm", radius: "$radius.circle", fg: "$color.text.onInverse" } },
    closeIcon: { on: ["web", "desktop"], base: { square: "$size.icon.md" } },
  },
  // The phone's Undo chip is drawn small and its touch area is grown to this by `hitSlop`: read, not drawn.
  reads: ["$size.target.min"],
});
