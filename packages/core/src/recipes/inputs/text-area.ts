import { defineRecipe } from "../../recipe";

/**
 * TextArea: the multi-line sibling of TextField, drawn from the same tokens. The label, the "Required" tag, the helper, the error and the
 * counter are TextField's, part for part, with the same phone idiom (one step larger labels and messages, a wider gap). The field is the
 * box: its edge, fill, corner and states are TextField's `field`, with no fixed height (its `rows` and the input's line height decide it).
 * The input carries the inset, so on the web the textarea fills the box and its resize grip sits in the box's corner. `mono` sets the
 * text in `font.family.mono` at the regular weight, for code, JSON and templates.
 */
export const textArea = defineRecipe({
  parts: ["root", "label", "tag", "field", "input", "error", "errorIcon", "errorText", "helper", "counter"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.family.sans" }, platforms: { mobile: { base: { gap: "$space.sm" } } } }, // idiom: one step larger
    label: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.body" },
      states: { disabled: { fg: "$color.text.faint" } },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" } } }, // idiom: one step larger
    },
    tag: {
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
    field: {
      base: { radius: "$radius.input", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" },
      // Hover moves the fill only, and the kit never turns it on for a focused, invalid, read-only or disabled field.
      states: {
        readOnly: { bg: "$color.background.recessed" },
        disabled: { bg: "$color.background.muted" },
        hover: { bg: "$color.background.hover" },
        focus: { borderColor: "$color.border.selected", ring: "$color.border.selected" },
        invalid: { borderColor: "$color.text.danger" },
        "invalid+focus": { borderColor: "$color.text.danger", ring: "$color.text.danger" },
      },
    },
    input: {
      base: { paddingX: "$space.mdLg", paddingY: "$space.smMd", font: "$font.family.sans", size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.medium", fg: "$color.text.body" },
      variants: { mono: { true: { font: "$font.family.mono", weight: "$font.weight.regular" } } },
      states: { disabled: { fg: "$color.text.faint" } },
      // idiom: the phone's one-step-smaller inset, as TextField's field has.
      platforms: { mobile: { base: { paddingX: "$space.md", placeholder: "$color.text.placeholder" } } },
    },
    error: { base: { gap: "$space.2xs", fg: "$color.text.danger" } },
    errorIcon: { base: { square: "$size.icon.sm" }, platforms: { mobile: { base: { square: "$size.icon.md" } } } },
    errorText: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.medium" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.danger" } } },
    },
    helper: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } },
    },
    counter: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { weight: "$font.weight.normal" } } },
    },
  },
});
