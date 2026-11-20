import { defineRecipe } from "../../recipe";

/**
 * Toast. An inverse pill. The web draws a tone mark (a disc holding a glyph, or a `!`); the phone draws the glyph bare, so `mark`, `markIcon`
 * and `markBang` are the web's and `icon` the phone's. The phone's pill has the web's shadow and weight (item 43) and tighter insets (its idiom).
 * An error reads `danger.solid` in both kits (the web's mark fill, the phone's glyph): the pill is light in the dark themes, where the pale
 * `danger.default` falls to 2.3:1; `danger.solid` holds at least 3:1 on the pill in both themes.
 * Vocabulary gap: the chips and the info mark are the pill's own ink mixed to 12 or 20% (`color-mix` on the web, an rgba on the phone) and the
 * web's focus ring is `0 0 0 2px` of it; a token reference cannot say a mix, so the kits write them from `fg.onInverse`, which this recipe grants.
 */
export const toast = defineRecipe({
  parts: ["root", "mark", "markIcon", "markBang", "icon", "message", "action", "actionText", "close", "closeIcon"],
  styles: {
    root: {
      base: { gap: "$space.md", paddingX: "$space.lg", bg: "$surface.inverse", fg: "$fg.onInverse", shadow: "$shadow.pill", font: "$font.sans" },
      platforms: { mobile: { base: { gap: "$space.sm", paddingX: "$space.md", paddingY: "$space.sm" } } }, // idiom: tighter insets
    },
    mark: { on: ["web", "desktop"], base: { radius: "$radius.circle", fg: "$fg.onBrand" }, variants: { tone: { success: { bg: "$brand.default" }, error: { bg: "$danger.solid" }, info: { fg: "$fg.onInverse" } } } },
    markIcon: { on: ["web", "desktop"], base: { square: "$icon.sizeSm" } },
    markBang: { on: ["web", "desktop"], base: { size: "$text.caption", weight: "$font.weightBold" } },
    icon: {
      on: ["mobile"],
      base: { square: "$icon.size", fg: "$fg.onInverse" },
      variants: { tone: { error: { fg: "$danger.solid" } } },
    },
    message: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightMedium" },
      platforms: { mobile: { base: { fg: "$fg.onInverse" } } }, // the web's text inherits this ink from the pill; a phone `Text` does not
    },
    action: { base: { paddingX: "$space.smMd", fg: "$fg.onInverse" } },
    actionText: { base: { size: "$text.caption", weight: "$font.weightSemibold" } },
    close: { on: ["web", "desktop"], base: { square: "$control.hIconSm", radius: "$radius.circle", fg: "$fg.onInverse" } },
    closeIcon: { on: ["web", "desktop"], base: { square: "$icon.sizeMd" } },
  },
  // The phone's Undo chip is drawn small and its touch area is grown to this by `hitSlop`: read, not drawn.
  reads: ["$control.hit"],
});
