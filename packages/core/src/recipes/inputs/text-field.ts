import { defineRecipe } from "../../recipe";

/**
 * TextField. Written from the React kit's table. The phone differs in the gaps, the label and message type (one step up),
 * the field's padding and its height (a minimum, not fixed), the leading icon, and has no `size` (it is always `lg`).
 * The phone's larger labels, messages, icons and spacing are a deliberate platform idiom (owner decision, 2026-11-03), kept in `platforms.mobile`;
 * its weights and inks are the web's (item 43).
 * The phone's `tag` view and `tagText` text are one part: the reader splits the view's style from the text's.
 */
export const textField = defineRecipe({
  parts: ["root", "label", "tag", "field", "leadingIcon", "prefix", "input", "trailing", "error", "errorIcon", "errorText", "helper", "counter"],
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
      base: { gap: "$space.sm", height: "$size.control.input", paddingX: "$space.mdLg", radius: "$radius.input", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" },
      variants: { size: { lg: {}, sm: { height: "$size.control.sm", paddingX: "$space.md", radius: "$radius.control" } } },
      // Hover moves the fill only, and the kit never turns it on for a focused, invalid, read-only or disabled field.
      states: {
        readOnly: { bg: "$color.background.recessed" },
        disabled: { bg: "$color.background.muted" },
        hover: { bg: "$color.background.hover" },
        focus: { borderColor: "$color.border.selected", ring: "$color.border.selected" },
        invalid: { borderColor: "$color.text.danger" },
        "invalid+focus": { borderColor: "$color.text.danger", ring: "$color.text.danger" },
      },
      // idiom: a one-step-larger gap and inset, and a height that is a minimum (the 48pt touch field).
      platforms: { mobile: { base: { gap: "$space.md", paddingX: "$space.md", height: "none", minHeight: "$size.control.input" } } },
    },
    leadingIcon: { base: { square: "$size.icon.md", fg: "$color.text.faint" }, platforms: { mobile: { base: { square: "$size.icon.default" } } } },
    prefix: {
      base: { marginRight: "$textField.prefixOffsetX", size: "$font.size.body", weight: "$font.weight.medium", fg: "$color.text.faint" },
      variants: { size: { sm: { size: "$font.size.caption" } } },
    },
    input: {
      base: { font: "$font.family.sans", size: "$font.size.body", weight: "$font.weight.medium", fg: "$color.text.body" },
      variants: { size: { sm: { size: "$font.size.caption" } } },
      states: { disabled: { fg: "$color.text.faint" } },
      platforms: { mobile: { base: { placeholder: "$color.text.placeholder" } } },
    },
    trailing: { base: { marginRight: "$textField.trailingOffsetX" } },
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
