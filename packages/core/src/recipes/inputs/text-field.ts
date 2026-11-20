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
      base: { gap: "$space.sm", height: "$control.hInput", paddingX: "$space.mdLg", radius: "$radius.input", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle" },
      variants: { size: { lg: {}, sm: { height: "$control.hSm", paddingX: "$space.md", radius: "$radius.control" } } },
      // Hover moves the fill only, and the kit never turns it on for a focused, invalid, read-only or disabled field.
      states: {
        readOnly: { bg: "$surface.recessed" },
        disabled: { bg: "$surface.muted" },
        hover: { bg: "$hover.surface" },
        focus: { borderColor: "$border.active", ring: "$border.active" },
        invalid: { borderColor: "$danger.default" },
        "invalid+focus": { borderColor: "$danger.default", ring: "$danger.default" },
      },
      // idiom: a one-step-larger gap and inset, and a height that is a minimum (the 48pt touch field).
      platforms: { mobile: { base: { gap: "$space.md", paddingX: "$space.md", height: "none", minHeight: "$control.hInput" } } },
    },
    leadingIcon: { base: { square: "$icon.sizeMd", fg: "$fg.faint" }, platforms: { mobile: { base: { square: "$icon.size" } } } },
    prefix: {
      base: { marginRight: "$textField.prefixPull", size: "$text.body", weight: "$font.weightMedium", fg: "$fg.faint" },
      variants: { size: { sm: { size: "$text.caption" } } },
    },
    input: {
      base: { font: "$font.sans", size: "$text.body", weight: "$font.weightMedium", fg: "$fg.body" },
      variants: { size: { sm: { size: "$text.caption" } } },
      states: { disabled: { fg: "$fg.faint" } },
      platforms: { mobile: { base: { placeholder: "$fg.placeholder" } } },
    },
    trailing: { base: { marginRight: "$textField.trailingPull" } },
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
