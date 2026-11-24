import { defineRecipe } from "../../recipe";

/**
 * Message. Written from the React kit's table. The row's wash is a chain, and the variants list it from weakest to strongest so
 * the later one wins, as in the kit: `hovered` (the web's plain hover wash), then `unread`, `mentionsYou`, `highlighted`. The kit
 * passes `hovered` and the `hover` state when the pointer is on the row, focus is inside it, or the prop draws it; the phone passes
 * neither. The coral bar down the leading edge is an inset 2px or 3px shadow no recipe key spells, so the kit draws it (reading
 * `color.background.brand.default` and `color.border.brand`, listed in `reads`). The phone's larger text, icons and gaps are a deliberate platform idiom
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
      base: { gap: "$space.smMd", font: "$font.family.sans" },
      variants: {
        hovered: { true: { bg: "$color.background.hover" } },
        unread: { true: { bg: "$color.background.unread", states: { hover: { bg: "$color.background.brand.soft" } } } },
        mentionsYou: { true: { bg: "$color.background.brand.soft", states: { hover: { bg: "$color.background.brand.softHover" } } } },
        highlighted: { true: { bg: "$color.background.brand.soft" } },
        status: { sending: { opacity: "$opacity.muted" } },
      },
      platforms: { mobile: { base: { gap: "$space.sm", paddingX: "$space.gutter.pane" } } },
    },
    gutter: { base: { width: "$size.avatar.md" } },
    gutterTime: { on: ["web", "desktop"], base: { size: "$font.size.micro", line: "$font.lineHeight.body", fg: "$color.text.faint" } },
    author: {
      base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.bold", fg: "$color.text.strong" },
      variants: { agent: { true: { fg: "$color.text.onBrandSoft" } } },
      // The phone's line is the size × 1.25, rounded: the kit works it out from this size.
      platforms: { mobile: { base: { line: "none" } } },
    },
    aiTag: { base: { radius: "$radius.tag", bg: "$color.background.brand.soft", borderWidth: "$border.width.hairline", borderColor: "$color.border.brand" } },
    aiText: { base: { weight: "$font.weight.bold", fg: "$color.text.onBrandSoft" } },
    time: {
      base: { size: "$font.size.micro", fg: "$color.text.faint" },
      platforms: { mobile: { base: { size: "$font.size.caption", weight: "$font.weight.normal" } } }, // idiom: one step larger; the weight is for the phone's `Text`
    },
    pinned: { base: { size: "$font.size.micro", fg: "$color.text.link" } },
    pinIcon: { base: { square: "$size.icon.sm" } },
    body: {
      base: { size: "$font.size.body", line: "$font.lineHeight.body", fg: "$color.text.body" },
      variants: { status: { queued: { fg: "$color.text.muted" } } },
      platforms: { mobile: { base: { weight: "$font.weight.normal" } } },
    },
    edited: { base: { size: "$font.size.micro", fg: "$color.text.faint" }, platforms: { mobile: { base: { weight: "$font.weight.normal" } } } },
    tombstone: { base: { size: "$font.size.body", line: "$font.lineHeight.body", fg: "$color.text.faint" }, platforms: { mobile: { base: { weight: "$font.weight.normal" } } } },
    statusLine: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      variants: { status: { failed: { fg: "$color.text.danger", weight: "$font.weight.medium" }, queued: { fg: "$color.text.warning", weight: "$font.weight.medium" } } },
      platforms: {
        mobile: {
          base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" },
          variants: { status: { failed: { weight: "$font.weight.medium" }, queued: { weight: "$font.weight.medium" } } },
        },
      },
    },
    statusIcon: { base: { square: "$size.icon.sm" }, platforms: { mobile: { base: { square: "$size.icon.md" } } } },
    statusSep: { base: { opacity: "$opacity.muted" } },
    action: {
      base: { weight: "$font.weight.semibold", radius: "$radius.tag", paddingX: "$space.3xs" },
      states: { hover: { fg: "$color.text.strong" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: { mobile: { base: { minHeight: "$size.target.min", paddingX: "$space.xs" } } },
    },
    actionText: { on: ["mobile"], base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold" } },
  },
  reads: ["$color.background.brand.default", "$color.border.brand"],
});
