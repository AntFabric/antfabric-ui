import { defineRecipe } from "../../recipe";

/**
 * Message. Written from the React kit's table. The row's wash is a chain, and the variants list it from weakest to strongest so
 * the later one wins, as in the kit: `hovered` (the web's plain hover wash), then `unread`, `mentionsYou`, `highlighted`. The kit
 * passes `hovered` and the `hover` state when the pointer is on the row, focus is inside it, or the prop draws it; the phone passes
 * neither. The coral bar down the leading edge is an inset 2px or 3px shadow no recipe key spells, so the kit draws it (reading
 * `brand.default` and `border.brand`, listed in `reads`). The phone's larger text, icons and gaps are a deliberate platform idiom
 * (item 42), kept in `platforms.mobile`, as is its regular weight (its `Text` needs one to name a font file).
 * The "Pinned" ink and the time's weight are the web's on the phone (item 43). The phone shows no "Pinned" word and no gutter time (structure),
 * and its time is `caption` where the web's is `micro` (idiom, item 42).
 */
export const message = defineRecipe({
  parts: [
    "root",
    "gutter",
    "gutterTime",
    "author",
    "aiTag",
    "aiText",
    "time",
    "pinned",
    "pinIcon",
    "body",
    "edited",
    "tombstone",
    "statusLine",
    "statusIcon",
    "statusSep",
    "action",
    "actionText",
  ],
  styles: {
    root: {
      base: { gap: "$space.smMd", font: "$font.sans" },
      variants: {
        hovered: { true: { bg: "$hover.surface" } },
        unread: { true: { bg: "$surface.unread", states: { hover: { bg: "$brand.soft" } } } },
        mentionsYou: { true: { bg: "$brand.soft", states: { hover: { bg: "$brand.softHover" } } } },
        highlighted: { true: { bg: "$brand.soft" } },
        status: { sending: { opacity: "$opacity.muted" } },
      },
      platforms: { mobile: { base: { gap: "$space.sm", paddingX: "$gutter.pane" } } },
    },
    gutter: { base: { width: "$avatar.md" } },
    gutterTime: { on: ["web", "desktop"], base: { size: "$text.micro", line: "$text.bodyLine", fg: "$fg.faint" } },
    author: {
      base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightBold", fg: "$fg.strong" },
      variants: { agent: { true: { fg: "$fg.onBrandSoft" } } },
      // The phone's line is the size × 1.25, rounded: the kit works it out from this size.
      platforms: { mobile: { base: { line: "none" } } },
    },
    aiTag: { base: { radius: "$radius.tag", bg: "$brand.soft", borderWidth: "$border.wHairline", borderColor: "$border.brand" } },
    aiText: { base: { weight: "$font.weightBold", fg: "$fg.onBrandSoft" } },
    time: {
      base: { size: "$text.micro", fg: "$fg.faint" },
      platforms: { mobile: { base: { size: "$text.caption", weight: "$font.weightNormal" } } }, // idiom: one step larger; the weight is for the phone's `Text`
    },
    pinned: { base: { size: "$text.micro", fg: "$link.default" } },
    pinIcon: { base: { square: "$icon.sizeSm" } },
    body: {
      base: { size: "$text.body", line: "$text.bodyLine", fg: "$fg.body" },
      variants: { status: { queued: { fg: "$fg.muted" } } },
      platforms: { mobile: { base: { weight: "$font.weightNormal" } } },
    },
    edited: { base: { size: "$text.micro", fg: "$fg.faint" }, platforms: { mobile: { base: { weight: "$font.weightNormal" } } } },
    tombstone: { base: { size: "$text.body", line: "$text.bodyLine", fg: "$fg.faint" }, platforms: { mobile: { base: { weight: "$font.weightNormal" } } } },
    statusLine: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      variants: { status: { failed: { fg: "$danger.default", weight: "$font.weightMedium" }, queued: { fg: "$warning.default", weight: "$font.weightMedium" } } },
      platforms: {
        mobile: {
          base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" },
          variants: { status: { failed: { weight: "$font.weightMedium" }, queued: { weight: "$font.weightMedium" } } },
        },
      },
    },
    statusIcon: { base: { square: "$icon.sizeSm" }, platforms: { mobile: { base: { square: "$icon.sizeMd" } } } },
    statusSep: { base: { opacity: "$opacity.muted" } },
    action: {
      base: { weight: "$font.weightSemibold", radius: "$radius.tag", paddingX: "$space.3xs" },
      states: { hover: { fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
      platforms: { mobile: { base: { minHeight: "$control.hit", paddingX: "$space.xs" } } },
    },
    actionText: { on: ["mobile"], base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold" } },
  },
  reads: ["$brand.default", "$border.brand"],
});
