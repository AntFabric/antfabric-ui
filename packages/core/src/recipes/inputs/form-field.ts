import { defineRecipe } from "../../recipe";

/**
 * FormField. The label, the description and the error around one control. The type is TextField's (its label, its tag, its helper and its
 * error) so a control inside a FormField reads like one that draws its own; the phone's reader reads the same parts one step larger.
 * `required` is the same pill as TextField's `tag`.
 */
export const formField = defineRecipe({
  parts: ["root", "label", "required", "description", "error", "errorIcon", "errorText"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.sans" }, platforms: { mobile: { base: { gap: "$space.sm" } } } }, // idiom: one step larger
    label: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.body" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine" } } }, // idiom: one step larger
    },
    required: {
      base: {
        paddingY: "$space.3xs",
        paddingX: "$textField.tagPadX",
        radius: "$radius.pill",
        bg: "$brand.soft",
        borderWidth: "$border.wHairline",
        borderColor: "$brand.softHover",
        fg: "$fg.onBrandSoft",
        size: "$text.caption",
        weight: "$font.weightSemibold",
        tracking: "$tracking.caps",
      },
    },
    description: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } }, // idiom: one step larger
    },
    error: { base: { gap: "$space.2xs", fg: "$danger.default" } },
    errorIcon: { base: { square: "$icon.sizeSm" }, platforms: { mobile: { base: { square: "$icon.sizeMd" } } } },
    errorText: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightMedium" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$danger.default" } } },
    },
  },
});
