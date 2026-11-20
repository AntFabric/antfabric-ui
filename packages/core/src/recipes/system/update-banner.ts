import { defineRecipe } from "../../recipe";

/**
 * UpdateBanner. Three different things on three platforms, so most parts are one platform's.
 * Web: an inverse pill (`banner`) with a glyph, a sentence and a Reload button.
 * Desktop: a `card` (a window glyph with an arrow badge, a title and a detail) that collapses to a `railIcon` with a `railDot`.
 * Phone: a `card` holding the version row (`versionTile`, `versionText`), a note or an error, and the buttons, and a `sheet` that asks
 * "Restart to apply?" with a `grabber`.
 * The window glyph's geometry is `ART_UPDATE` in `art.ts`; the recipe paints it (`artWindow`, `artBarLong`, `artBarShort`, `artBadge`).
 *
 * Where a padding has two axes the kits keep the one that is a `space` read, or that this recipe grants through `reads` (the reader would
 * write both axes as one `padding`, and the render snapshot would count that as a change from the two longhands the web wrote): the desktop
 * card's block padding is the recipe's and its inline padding (`updateBanner.cardPadX`) is the kit's.
 * Vocabulary gaps, granted through `reads`: the desktop card's inline padding (above), which the reader would write as one `padding` beside the
 * block padding, and the rail dot's cut-out ring (`0 0 0 2px` of `surface.chrome`), a 2px outer ring in a colour the keys cannot say (`ring` is an
 * inset hairline, `halo` takes a shadow token). The rail dot's distance from the corner is `top` and `right`.
 */
export const updateBanner = defineRecipe({
  parts: [
    "root",
    "banner",
    "bannerIcon",
    "bannerText",
    "card",
    "artWindow",
    "artBarLong",
    "artBarShort",
    "artBadge",
    "cardText",
    "cardTitle",
    "cardDetail",
    "cardIcon",
    "railIcon",
    "railGlyph",
    "railDot",
    "versionRow",
    "versionTile",
    "versionIcon",
    "versionText",
    "error",
    "note",
    "sheet",
    "grabber",
    "sheetTitle",
    "sheetBody",
  ],
  styles: {
    root: {
      base: { gap: "$space.md", font: "$font.sans" },
      platforms: { web: { base: { width: "$updateBanner.bannerW" } }, desktop: { base: { width: "$updateBanner.cardW" } }, mobile: { base: { width: "$phone.cardW" } } },
    },
    banner: { on: ["web"], base: { gap: "$space.sm", radius: "$radius.pill", bg: "$surface.inverse", fg: "$fg.onInverse", shadow: "$shadow.pill" } },
    bannerIcon: { on: ["web"], base: { square: "$icon.sizeMd" } },
    bannerText: { on: ["web"], base: { size: "$text.bodySm", weight: "$font.weightMedium" } },
    card: {
      on: ["desktop", "mobile"],
      base: { radius: "$radius.card", bg: "$surface.raised" },
      platforms: {
        desktop: {
          base: { gap: "$space.smMd", paddingY: "$updateBanner.cardPadY", shadow: "$shadow.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle" },
          states: { hover: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } },
        },
        mobile: { base: { gap: "$space.md", paddingX: "$gutter.pane", paddingY: "$space.lg", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
      },
    },
    artWindow: { on: ["desktop"], base: { bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.muted", shadow: "$shadow.hairline" } },
    artBarLong: { on: ["desktop"], base: { bg: "$fg.faint" } },
    artBarShort: { on: ["desktop"], base: { bg: "$border.muted" } },
    artBadge: { on: ["desktop"], base: { bg: "$fg.faint", borderWidth: "$border.wThick", borderColor: "$surface.raised", fg: "$surface.raised" } },
    cardText: { on: ["desktop"], base: { gap: "$row.textGap" } },
    cardTitle: { on: ["desktop"], base: { size: "$text.bodySm", weight: "$font.weightSemibold", tracking: "$tracking.tight", fg: "$fg.strong" } },
    cardDetail: { on: ["desktop"], base: { size: "$text.micro", fg: "$fg.faint" }, variants: { stage: { failed: { fg: "$danger.default" } } } },
    cardIcon: { on: ["desktop"], base: { square: "$icon.sizeMd", fg: "$fg.subtle" } },
    railIcon: {
      on: ["desktop"],
      base: { square: "$updateBanner.button", radius: "$radius.circle", fg: "$fg.body" },
      states: { hover: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } },
    },
    railGlyph: { on: ["desktop"], base: { square: "$icon.size" } },
    railDot: {
      on: ["desktop"],
      base: { top: "$updateBanner.dotInset", right: "$updateBanner.dotInset", square: "$dot.size", radius: "$radius.circle", bg: "$brand.default" },
      variants: { stage: { failed: { bg: "$danger.default" } } },
    },
    versionRow: { on: ["mobile"], base: { gap: "$space.md" } },
    versionTile: { on: ["mobile"], base: { square: "$updateBanner.versionTile", radius: "$radius.control", bg: "$surface.muted" } },
    versionIcon: { on: ["mobile"], base: { square: "$icon.size", fg: "$fg.muted" } },
    versionText: { on: ["mobile"], base: { size: "$text.body", line: "$text.bodyLine", fg: "$fg.strong", weight: "$font.weightNormal" } },
    error: { on: ["mobile"], base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$danger.default", weight: "$font.weightNormal" } },
    note: { on: ["mobile"], base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    sheet: { on: ["mobile"], base: { gap: "$space.sm", paddingX: "$space.xl", radius: "$radius.sheet", bg: "$surface.raised", shadow: "$shadow.modal" } },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberW", height: "$sheet.grabberH", radius: "$radius.pill", bg: "$border.muted" } },
    sheetTitle: { on: ["mobile"], base: { size: "$text.h3", line: "$text.h3Line", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    sheetBody: { on: ["mobile"], base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
  },
  reads: ["$updateBanner.cardPadX", "$surface.chrome"],
});
