import { defineRecipe } from "../../recipe";

/**
 * InlineBanner. Neutral is the white card surface on both; the web has a rim and the phone has none (a full-bleed strip with square corners: its
 * idiom). The phone's insets and body type are its own, and its message is regular weight only because its `Text` needs one.
 * Vocabulary gap: a warning or danger banner's rim on the web is that colour at 24% over nothing, a `color-mix`, which a token reference
 * cannot say; the web kit writes it from `warning.default` and `danger.default`, which this recipe grants through the icon and title ink.
 */
export const inlineBanner = defineRecipe({
  parts: ["root", "icon", "title", "message"],
  styles: {
    root: {
      base: { gap: "$space.md", radius: "$radius.card", borderWidth: "$border.wHairline", font: "$font.sans" },
      variants: {
        tone: {
          neutral: { bg: "$surface.card", borderColor: "$border.subtle" },
          brand: { bg: "$brand.soft", borderColor: "$brand.softHover" },
          warning: { bg: "$warning.soft" },
          danger: { bg: "$danger.soft" },
        },
      },
      platforms: {
        mobile: {
          // idiom: a full-bleed strip (no rim, no corners) with its own insets; with no rim, the neutral strip needs a fill to show on a white page.
          base: { gap: "$space.sm", paddingX: "$space.md", paddingY: "$space.sm", borderWidth: "none", borderColor: "none", radius: "none" },
          variants: { tone: { neutral: { bg: "$surface.muted" } } },
        },
      },
    },
    icon: {
      base: { square: "$icon.size" },
      variants: { tone: { neutral: { fg: "$fg.faint" }, brand: { fg: "$brand.default" }, warning: { fg: "$warning.default" }, danger: { fg: "$danger.default" } } },
      platforms: { mobile: { base: { square: "$icon.sizeMd" } } },
    },
    title: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightBold" },
      variants: { tone: { neutral: { fg: "$fg.strong" }, brand: { fg: "$fg.onBrandSoft" }, warning: { fg: "$warning.default" }, danger: { fg: "$danger.default" } } },
    },
    message: {
      base: { size: "$text.caption" },
      variants: { tone: { neutral: { fg: "$fg.muted" }, brand: { fg: "$fg.onBrandSoft" }, warning: { fg: "$fg.body" }, danger: { fg: "$fg.body" } } },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } },
    },
  },
});
