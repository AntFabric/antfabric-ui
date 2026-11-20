import { defineRecipe } from "../../recipe";

/**
 * TextArea: the multi-line sibling of TextField, drawn from the same tokens. The label, the "Required" tag, the helper, the error and the
 * counter are TextField's, part for part, with the same phone idiom (one step larger labels and messages, a wider gap). The field is the
 * box: its edge, fill, corner and states are TextField's `field`, with no fixed height (its `rows` and the input's line height decide it).
 * The input carries the inset, so on the web the textarea fills the box and its resize grip sits in the box's corner. `mono` sets the
 * text in `font.mono` at the regular weight, for code, JSON and templates.
 */
export const textArea = defineRecipe({
  parts: ["root", "label", "tag", "field", "input", "error", "errorIcon", "errorText", "helper", "counter"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.sans" }, platforms: { mobile: { base: { gap: "$space.sm" } } } }, // idiom: one step larger
    label: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.body" },
      states: { disabled: { fg: "$fg.faint" } },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine" } } }, // idiom: one step larger
    },
    tag: {
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
    field: {
      base: { radius: "$radius.input", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle" },
      // Hover moves the fill only, and the kit never turns it on for a focused, invalid, read-only or disabled field.
      states: {
        readOnly: { bg: "$surface.recessed" },
        disabled: { bg: "$surface.muted" },
        hover: { bg: "$hover.surface" },
        focus: { borderColor: "$border.active", ring: "$border.active" },
        invalid: { borderColor: "$danger.default" },
        "invalid+focus": { borderColor: "$danger.default", ring: "$danger.default" },
      },
    },
    input: {
      base: { paddingX: "$space.mdLg", paddingY: "$space.smMd", font: "$font.sans", size: "$text.body", line: "$text.bodyLine", weight: "$font.weightMedium", fg: "$fg.body" },
      variants: { mono: { true: { font: "$font.mono", weight: "$font.weightRegular" } } },
      states: { disabled: { fg: "$fg.faint" } },
      // idiom: the phone's one-step-smaller inset, as TextField's field has.
      platforms: { mobile: { base: { paddingX: "$space.md", placeholder: "$fg.placeholder" } } },
    },
    error: { base: { gap: "$space.2xs", fg: "$danger.default" } },
    errorIcon: { base: { square: "$icon.sizeSm" }, platforms: { mobile: { base: { square: "$icon.sizeMd" } } } },
    errorText: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightMedium" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$danger.default" } } },
    },
    helper: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } },
    },
    counter: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { weight: "$font.weightNormal" } } },
    },
  },
});
