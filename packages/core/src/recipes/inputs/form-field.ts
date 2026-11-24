import { defineRecipe } from "../../recipe";

/**
 * FormField. The label, the description and the error around one control. The type is TextField's (its label, its tag, its helper and its
 * error) so a control inside a FormField reads like one that draws its own; the phone's reader reads the same parts one step larger.
 * `required` is the same pill as TextField's `tag`.
 */
export const formField = defineRecipe({
  parts: ["root", "label", "required", "description", "error", "errorIcon", "errorText"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.family.sans" }, platforms: { mobile: { base: { gap: "$space.sm" } } } }, // idiom: one step larger
    label: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.body" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" } } }, // idiom: one step larger
    },
    required: {
      base: {
        paddingY: "$space.3xs",
        paddingX: "$textField.tagPaddingX",
        radius: "$radius.pill",
        bg: "$color.background.brand.soft",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.background.brand.softHover",
        fg: "$color.text.onBrandSoft",
        size: "$font.size.caption",
        weight: "$font.weight.semibold",
        tracking: "$font.letterSpacing.caps",
      },
    },
    description: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } }, // idiom: one step larger
    },
    error: { base: { gap: "$space.2xs", fg: "$color.text.danger" } },
    errorIcon: { base: { square: "$size.icon.sm" }, platforms: { mobile: { base: { square: "$size.icon.md" } } } },
    errorText: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.medium" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.danger" } } },
    },
  },
});
