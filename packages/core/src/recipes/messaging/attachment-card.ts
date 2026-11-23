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
  pdf: { bg: "$danger.soft", fg: "$danger.default" },
  doc: { bg: "$info.soft", fg: "$info.default" },
  sheet: { bg: "$success.soft", fg: "$success.default" },
  deck: { bg: "$warning.soft", fg: "$warning.default" },
  image: { bg: "$tag.infoBg", fg: "$tag.infoFg" },
  video: { bg: "$tag.brandBg", fg: "$tag.brandFg" },
  audio: { bg: "$brand.soft", fg: "$fg.onBrandSoft" },
  archive: { bg: "$tag.neutralBg", fg: "$tag.neutralFg" },
  code: { bg: "$surface.inverse", fg: "$fg.onInverse" },
  other: { bg: "$surface.muted", fg: "$fg.muted" },
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
    root: { base: { font: "$font.sans" } },
    fileCard: {
      base: { gap: "$space.md", padding: "$space.sm", radius: "$radius.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.card", fg: "$fg.body" },
      // The phone pads one step more on the right than elsewhere, which no key spells (the kit lays out its `space` reads).
      platforms: { mobile: { base: { minHeight: "$control.hit", padding: "none" } } },
    },
    fileOpen: {
      base: { gap: "$space.smMd", radius: "$radius.control" },
      states: { focus: { shadow: "$shadow.focus" } },
      platforms: { mobile: { base: { gap: "$space.md" } } },
    },
    badge: {
      base: { radius: "$radius.control", weight: "$font.weightBlack" },
      variants: { fileType: family },
      // The phone's tile is recessed whatever the family; the family tints the glyph on it (code's is the strong ink, not the inverse one).
      platforms: { mobile: { base: { bg: "$surface.recessed", radius: "none", weight: "none" }, variants: { fileType: { code: { fg: "$fg.strong" } } } } },
    },
    badgeText: { on: ["web", "desktop"], base: { size: "$text.micro" } },
    badgeIcon: { on: ["mobile"], base: { square: "$icon.size" } },
    fileName: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold", fg: "$fg.strong" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } },
    },
    meta: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } }, // idiom: one step larger
    },
    paused: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$warning.default" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } },
    },
    failed: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$danger.default" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } },
    },
    track: { base: { radius: "$radius.pill", bg: "$surface.muted" } },
    imageTrack: { base: { radius: "$radius.pill", bg: "$surface.overlay" } },
    fill: { base: { radius: "$radius.pill", bg: "$brand.default" }, variants: { status: { paused: { bg: "$warning.default" } } } },
    imageCard: { base: { radius: "$radius.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.recessed" } },
    scrim: { base: { padding: "$space.sm", bg: "$scrim.light" } },
    failedOverlay: { base: { gap: "$space.xs", padding: "$space.md", bg: "$surface.overlay" } },
    failedIcon: { base: { square: "$icon.sizeLg", fg: "$danger.default" } },
    failedTitle: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.strong" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine" } } },
    },
    // A 3px left edge: the kit draws its width and style, the recipe says its colour.
    linkCard: { base: { borderLeftColor: "$border.muted" } },
    linkOpen: { base: { gap: "$space.md", radius: "$radius.tag" }, states: { focus: { shadow: "$shadow.focus" } } },
    linkSite: { base: { fg: "$fg.faint" } },
    linkIcon: { base: { square: "$icon.sizeSm" } },
    linkDomain: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold" },
      platforms: { mobile: { base: { fg: "$fg.faint" } } },
    },
    linkTitle: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold", fg: "$link.default" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } },
    },
    linkDesc: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted" },
      platforms: { mobile: { base: { weight: "$font.weightNormal" } } },
    },
    linkThumb: { base: { radius: "$radius.control", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
    voiceCard: { base: { gap: "$space.smMd", radius: "$radius.pill", bg: "$surface.muted" } },
    // A bar is the unplayed grey; `on` is a bar that has played.
    bar: { base: { radius: "$radius.pill", bg: "$fg.placeholder" }, states: { on: { bg: "$brand.default" } } },
    duration: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.bodySm" } } },
    },
    chip: { base: { gap: "$space.sm", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.card" } },
    // A ready chip's thumbnail or badge and name are one press that opens the preview.
    chipOpen: { base: { gap: "$space.sm", radius: "$radius.tag" }, states: { focus: { shadow: "$shadow.focus" } } },
    chipThumb: { base: { borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
  },
  // The image's focus edge is a 3px inset ring in `focus.ring`, a width the recipe's `ring` (one hairline) does not spell: the kit reads it.
  reads: ["$focus.ring"],
});
