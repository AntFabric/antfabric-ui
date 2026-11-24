import { defineRecipe } from "../../recipe";

/**
 * Composer. Written from the React kit's table. `mode` chooses the card's fill and edge; `focus` is the box having focus (or the
 * `focused` prop drawing it, which editing's coral edge outranks: the kit's call). `invalid` on the counter is `tooLong`.
 * Text parts carry their own type (the web draws spans, the phone `Text`). The web has a formatting toolbar and a keyboard hint,
 * the phone a Cancel button and a one-line sheet radius; the phone's larger type is a deliberate platform idiom (item 42), kept in
 * `platforms.mobile`, as is its regular weight (its `Text` needs one to name a font file). The card's edge (`color.border.subtle`, the hairline shadow, the
 * coral edge while editing) and the "Editing message" weight are the web's on the phone (item 43). Kept, borderline (listed for the owner): the card's
 * radius (`sheet`, a one-line field) and the "Also send to" gap (`space.sm`, one step larger).
 */
export const composer = defineRecipe({
  parts: [
    "root",
    "editBanner",
    "editIcon",
    "editLabel",
    "editHint",
    "cancel",
    "cancelText",
    "offline",
    "offlineIcon",
    "locked",
    "lockedIcon",
    "lockedTitle",
    "lockedDetail",
    "card",
    "toolbar",
    "toolbarRule",
    "input",
    "counter",
    "alsoSend",
    "alsoBox",
    "alsoTick",
    "hint",
  ],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.family.sans" } },
    editBanner: { base: { gap: "$space.xs", paddingX: "$space.2xs", fg: "$color.background.brand.default" }, platforms: { mobile: { base: { gap: "$space.sm", paddingX: "$space.sm" } } } },
    editIcon: { base: { square: "$size.icon.md" } },
    editLabel: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.link" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" } } }, // idiom: one step larger
    },
    editHint: { on: ["web", "desktop"], base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" } },
    cancel: { on: ["mobile"], base: { minHeight: "$size.target.min", paddingX: "$space.xs" } },
    cancelText: { on: ["mobile"], base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal", fg: "$color.text.muted" } },
    offline: {
      base: { gap: "$space.sm", padding: "$space.2xs", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: {
        mobile: { base: { padding: "none", paddingX: "$space.md", paddingY: "$space.xs", radius: "$radius.control", bg: "$color.background.muted", size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } },
      },
    },
    offlineIcon: { base: { square: "$size.icon.md", fg: "$color.text.onBrandSoft" } },
    locked: {
      base: { gap: "$space.smMd", radius: "$radius.control", borderWidth: "$border.width.hairline", borderColor: "$color.border.default", bg: "$color.background.recessed" },
      platforms: { mobile: { base: { radius: "$radius.sheet" } } },
    },
    lockedIcon: { base: { square: "$size.icon.default", fg: "$color.text.muted" } },
    lockedTitle: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.bold", fg: "$color.text.strong" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } },
    },
    lockedDetail: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } },
    },
    card: {
      base: { radius: "$radius.control", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.card", shadow: "$elevation.shadow.hairline" },
      variants: { mode: { editing: { borderColor: "$color.border.brand" }, offline: { bg: "$color.background.recessed" } } },
      states: { focus: { borderColor: "$color.border.selected" } },
      platforms: { mobile: { base: { radius: "$radius.sheet" } } },
    },
    // The web's formatting toolbar; its buttons take the tag radius from `reads` (they are IconButtons, which the kit styles by prop).
    toolbar: { on: ["web", "desktop"], base: { fg: "$color.text.muted" } },
    toolbarRule: { on: ["web", "desktop"], base: { width: "$border.width.hairline", bg: "$color.border.subtle" } },
    input: {
      base: { size: "$font.size.body", line: "$font.lineHeight.body", fg: "$color.text.body" },
      platforms: { mobile: { base: { line: "none", weight: "$font.weight.normal", placeholder: "$color.text.placeholder" } } },
    },
    counter: {
      base: { size: "$font.size.micro", fg: "$color.text.faint" },
      states: { invalid: { fg: "$color.text.danger", weight: "$font.weight.semibold" } },
      platforms: {
        mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" }, states: { invalid: { fg: "$color.text.danger", weight: "$font.weight.semibold" } } },
      },
    },
    alsoSend: {
      base: { gap: "$space.xs", radius: "$radius.tag", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" },
      states: { hover: { fg: "$color.text.strong" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: { mobile: { base: { gap: "$space.sm", minHeight: "$size.target.min", size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } },
    },
    alsoBox: {
      base: { square: "$checkbox.size", radius: "$checkbox.radius", borderWidth: "$border.width.hairline", borderColor: "$color.border.default", bg: "$color.background.card", fg: "$color.text.onBrand" },
      states: { on: { borderColor: "$color.background.brand.default", bg: "$color.background.brand.default" } },
    },
    alsoTick: { base: { square: "$size.icon.sm" } },
    hint: {
      base: { size: "$font.size.micro", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { size: "$font.size.caption", weight: "$font.weight.normal" } } },
    },
  },
  reads: ["$radius.tag"],
});
