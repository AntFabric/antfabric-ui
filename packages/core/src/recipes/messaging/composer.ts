import { defineRecipe } from "../../recipe";

/**
 * Composer. Written from the React kit's table. `mode` chooses the card's fill and edge; `focus` is the box having focus (or the
 * `focused` prop drawing it, which editing's coral edge outranks: the kit's call). `invalid` on the counter is `tooLong`.
 * Text parts carry their own type (the web draws spans, the phone `Text`). The web has a formatting toolbar and a keyboard hint,
 * the phone a Cancel button and a one-line sheet radius; the phone's larger type is a deliberate platform idiom (item 42), kept in
 * `platforms.mobile`, as is its regular weight (its `Text` needs one to name a font file). The card's edge (`border.subtle`, the hairline shadow, the
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
    root: { base: { gap: "$space.xs", font: "$font.sans" } },
    editBanner: { base: { gap: "$space.xs", paddingX: "$space.2xs", fg: "$brand.default" }, platforms: { mobile: { base: { gap: "$space.sm", paddingX: "$space.sm" } } } },
    editIcon: { base: { square: "$icon.sizeMd" } },
    editLabel: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$link.default" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine" } } }, // idiom: one step larger
    },
    editHint: { on: ["web", "desktop"], base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" } },
    cancel: { on: ["mobile"], base: { minHeight: "$control.hit", paddingX: "$space.xs" } },
    cancelText: { on: ["mobile"], base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal", fg: "$fg.muted" } },
    offline: {
      base: { gap: "$space.sm", padding: "$space.2xs", size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: {
        mobile: { base: { padding: "none", paddingX: "$space.md", paddingY: "$space.xs", radius: "$radius.control", bg: "$surface.muted", size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } },
      },
    },
    offlineIcon: { base: { square: "$icon.sizeMd", fg: "$fg.onBrandSoft" } },
    locked: {
      base: { gap: "$space.smMd", radius: "$radius.control", borderWidth: "$border.wHairline", borderColor: "$border.default", bg: "$surface.recessed" },
      platforms: { mobile: { base: { radius: "$radius.sheet" } } },
    },
    lockedIcon: { base: { square: "$icon.size", fg: "$fg.muted" } },
    lockedTitle: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightBold", fg: "$fg.strong" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } },
    },
    lockedDetail: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } },
    },
    card: {
      base: { radius: "$radius.control", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.card", shadow: "$shadow.hairline" },
      variants: { mode: { editing: { borderColor: "$border.brand" }, offline: { bg: "$surface.recessed" } } },
      states: { focus: { borderColor: "$border.active" } },
      platforms: { mobile: { base: { radius: "$radius.sheet" } } },
    },
    // The web's formatting toolbar; its buttons take the tag radius from `reads` (they are IconButtons, which the kit styles by prop).
    toolbar: { on: ["web", "desktop"], base: { fg: "$fg.muted" } },
    toolbarRule: { on: ["web", "desktop"], base: { width: "$border.wHairline", bg: "$border.subtle" } },
    input: {
      base: { size: "$text.body", line: "$text.bodyLine", fg: "$fg.body" },
      platforms: { mobile: { base: { line: "none", weight: "$font.weightNormal", placeholder: "$fg.placeholder" } } },
    },
    counter: {
      base: { size: "$text.micro", fg: "$fg.faint" },
      states: { invalid: { fg: "$danger.default", weight: "$font.weightSemibold" } },
      platforms: {
        mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" }, states: { invalid: { fg: "$danger.default", weight: "$font.weightSemibold" } } },
      },
    },
    alsoSend: {
      base: { gap: "$space.xs", radius: "$radius.tag", size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" },
      states: { hover: { fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
      platforms: { mobile: { base: { gap: "$space.sm", minHeight: "$control.hit", size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } },
    },
    alsoBox: {
      base: { square: "$checkbox.size", radius: "$checkbox.radius", borderWidth: "$border.wHairline", borderColor: "$border.default", bg: "$surface.card", fg: "$fg.onBrand" },
      states: { on: { borderColor: "$brand.default", bg: "$brand.default" } },
    },
    alsoTick: { base: { square: "$icon.sizeSm" } },
    hint: {
      base: { size: "$text.micro", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { size: "$text.caption", weight: "$font.weightNormal" } } },
    },
  },
  reads: ["$radius.tag"],
});
