import { defineRecipe } from "../../recipe";

/**
 * InlineBanner. Neutral is the white card surface on both; the web has a rim and the phone has none (a full-bleed strip with square corners: its
 * idiom). The phone's insets and body type are its own, and its message is regular weight only because its `Text` needs one.
 * Vocabulary gap: a warning or danger banner's rim on the web is that colour at 24% over nothing, a `color-mix`, which a token reference
 * cannot say; the web kit writes it from `color.text.warning` and `color.text.danger`, which this recipe grants through the icon and title ink.
 */
export const inlineBanner = defineRecipe({
  parts: ["root", "icon", "title", "message"],
  styles: {
    root: {
      base: { gap: "$space.md", radius: "$radius.card", borderWidth: "$border.width.hairline", font: "$font.family.sans" },
      variants: {
        tone: {
          neutral: { bg: "$color.background.card", borderColor: "$color.border.subtle" },
          brand: { bg: "$color.background.brand.soft", borderColor: "$color.background.brand.softHover" },
          warning: { bg: "$color.background.warning.soft" },
          danger: { bg: "$color.background.danger.soft" },
        },
      },
      platforms: {
        mobile: {
          // idiom: a full-bleed strip (no rim, no corners) with its own insets; with no rim, the neutral strip needs a fill to show on a white page.
          base: { gap: "$space.sm", paddingX: "$space.md", paddingY: "$space.sm", borderWidth: "none", borderColor: "none", radius: "none" },
          variants: { tone: { neutral: { bg: "$color.background.muted" } } },
        },
      },
    },
    icon: {
      base: { square: "$size.icon.default" },
      variants: { tone: { neutral: { fg: "$color.text.faint" }, brand: { fg: "$color.background.brand.default" }, warning: { fg: "$color.text.warning" }, danger: { fg: "$color.text.danger" } } },
      platforms: { mobile: { base: { square: "$size.icon.md" } } },
    },
    title: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.bold" },
      variants: { tone: { neutral: { fg: "$color.text.strong" }, brand: { fg: "$color.text.onBrandSoft" }, warning: { fg: "$color.text.warning" }, danger: { fg: "$color.text.danger" } } },
    },
    message: {
      base: { size: "$font.size.caption" },
      variants: { tone: { neutral: { fg: "$color.text.muted" }, brand: { fg: "$color.text.onBrandSoft" }, warning: { fg: "$color.text.body" }, danger: { fg: "$color.text.body" } } },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } },
    },
  },
});
