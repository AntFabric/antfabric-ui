import { defineRecipe } from "../../recipe";

/**
 * AttachmentCard: five cards (file, image, link, voice note, and the compact chip) in one recipe. Written from the React kit's table.
 * Text parts carry their own type on both kits (the web draws them as spans, the phone as `Text`). The web's file badge is a
 * coloured tile with the extension; the phone's is a recessed tile with a glyph tinted in the same colour (`badgeIcon`), so
 * `fileType` sets the web's fill and both kits' ink. The phone's larger text is a deliberate platform idiom (item 42), kept in
 * `platforms.mobile`, as is its regular weight (its `Text` needs one to name a font file).
 * The meta line's colour and the chip's radius are the web's on the phone (item 43). Kept, borderline (listed for the owner): the file open
 * button's gap (`space.smMd` on the web, `space.md` on the phone, one step larger).
 */
const family = {
  pdf: { bg: "$color.background.danger.soft", fg: "$color.text.danger" },
  doc: { bg: "$color.background.info.soft", fg: "$color.text.info" },
  sheet: { bg: "$color.background.success.soft", fg: "$color.text.success" },
  deck: { bg: "$color.background.warning.soft", fg: "$color.text.warning" },
  image: { bg: "$color.background.tag.info", fg: "$color.text.tag.info" },
  video: { bg: "$color.background.tag.brand", fg: "$color.text.tag.brand" },
  audio: { bg: "$color.background.brand.soft", fg: "$color.text.onBrandSoft" },
  archive: { bg: "$color.background.tag.neutral", fg: "$color.text.tag.neutral" },
  code: { bg: "$color.background.inverse", fg: "$color.text.onInverse" },
  other: { bg: "$color.background.muted", fg: "$color.text.muted" },
} as const;

export const attachmentCard = defineRecipe({
  parts: [
    "root",
    "fileCard",
    "fileOpen",
    "badge",
    "badgeText",
    "badgeIcon",
    "fileName",
    "meta",
    "paused",
    "failed",
    "track",
    "imageTrack",
    "fill",
    "imageCard",
    "scrim",
    "failedOverlay",
    "failedIcon",
    "failedTitle",
    "linkCard",
    "linkOpen",
    "linkSite",
    "linkIcon",
    "linkDomain",
    "linkTitle",
    "linkDesc",
    "linkThumb",
    "voiceCard",
    "bar",
    "duration",
    "chip",
    "chipOpen",
    "chipThumb",
  ],
  styles: {
    root: { base: { font: "$font.family.sans" } },
    fileCard: {
      base: { gap: "$space.md", padding: "$space.sm", radius: "$radius.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.card", fg: "$color.text.body" },
      // The phone pads one step more on the right than elsewhere, which no key spells (the kit lays out its `space` reads).
      platforms: { mobile: { base: { minHeight: "$size.target.min", padding: "none" } } },
    },
    fileOpen: {
      base: { gap: "$space.smMd", radius: "$radius.control" },
      states: { focus: { shadow: "$elevation.shadow.focus" } },
      platforms: { mobile: { base: { gap: "$space.md" } } },
    },
    badge: {
      base: { radius: "$radius.control", weight: "$font.weight.black" },
      variants: { fileType: family },
      // The phone's tile is recessed whatever the family; the family tints the glyph on it (code's is the strong ink, not the inverse one).
      platforms: { mobile: { base: { bg: "$color.background.recessed", radius: "none", weight: "none" }, variants: { fileType: { code: { fg: "$color.text.strong" } } } } },
    },
    badgeText: { on: ["web", "desktop"], base: { size: "$font.size.micro" } },
    badgeIcon: { on: ["mobile"], base: { square: "$size.icon.default" } },
    fileName: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold", fg: "$color.text.strong" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } },
    },
    meta: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } }, // idiom: one step larger
    },
    paused: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.warning" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } },
    },
    failed: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.danger" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } },
    },
    track: { base: { radius: "$radius.pill", bg: "$color.background.muted" } },
    imageTrack: { base: { radius: "$radius.pill", bg: "$color.background.overlay" } },
    fill: { base: { radius: "$radius.pill", bg: "$color.background.brand.default" }, variants: { status: { paused: { bg: "$color.text.warning" } } } },
    imageCard: { base: { radius: "$radius.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.recessed" } },
    scrim: { base: { padding: "$space.sm", bg: "$color.background.scrim.light" } },
    failedOverlay: { base: { gap: "$space.xs", padding: "$space.md", bg: "$color.background.overlay" } },
    failedIcon: { base: { square: "$size.icon.lg", fg: "$color.text.danger" } },
    failedTitle: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.strong" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" } } },
    },
    // A 3px left edge: the kit draws its width and style, the recipe says its colour.
    linkCard: { base: { borderLeftColor: "$color.border.muted" } },
    linkOpen: { base: { gap: "$space.md", radius: "$radius.tag" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    linkSite: { base: { fg: "$color.text.faint" } },
    linkIcon: { base: { square: "$size.icon.sm" } },
    linkDomain: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold" },
      platforms: { mobile: { base: { fg: "$color.text.faint" } } },
    },
    linkTitle: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold", fg: "$color.text.link" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } },
    },
    linkDesc: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted" },
      platforms: { mobile: { base: { weight: "$font.weight.normal" } } },
    },
    linkThumb: { base: { radius: "$radius.control", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" } },
    voiceCard: { base: { gap: "$space.smMd", radius: "$radius.pill", bg: "$color.background.muted" } },
    // A bar is the unplayed grey; `on` is a bar that has played.
    bar: { base: { radius: "$radius.pill", bg: "$color.text.placeholder" }, states: { on: { bg: "$color.background.brand.default" } } },
    duration: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.bodySm" } } },
    },
    chip: { base: { gap: "$space.sm", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.card" } },
    // A ready chip's thumbnail or badge and name are one press that opens the preview.
    chipOpen: { base: { gap: "$space.sm", radius: "$radius.tag" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    chipThumb: { base: { borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" } },
  },
  // The image's focus edge is a 3px inset ring in `color.border.focus`, a width the recipe's `ring` (one hairline) does not spell: the kit reads it.
  reads: ["$color.border.focus"],
});
