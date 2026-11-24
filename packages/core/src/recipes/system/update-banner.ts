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
 * card's block padding is the recipe's and its inline padding (`updateBanner.cardPaddingX`) is the kit's.
 * Vocabulary gaps, granted through `reads`: the desktop card's inline padding (above), which the reader would write as one `padding` beside the
 * block padding, and the rail dot's cut-out ring (`0 0 0 2px` of `color.background.chrome`), a 2px outer ring in a colour the keys cannot say (`ring` is an
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
      base: { gap: "$space.md", font: "$font.family.sans" },
      platforms: { web: { base: { width: "$updateBanner.bannerWidth" } }, desktop: { base: { width: "$updateBanner.cardWidth" } }, mobile: { base: { width: "$size.layout.phoneCard" } } },
    },
    banner: { on: ["web"], base: { gap: "$space.sm", radius: "$radius.pill", bg: "$color.background.inverse", fg: "$color.text.onInverse", shadow: "$elevation.shadow.pill" } },
    bannerIcon: { on: ["web"], base: { square: "$size.icon.md" } },
    bannerText: { on: ["web"], base: { size: "$font.size.bodySm", weight: "$font.weight.medium" } },
    card: {
      on: ["desktop", "mobile"],
      base: { radius: "$radius.card", bg: "$color.background.raised" },
      platforms: {
        desktop: {
          base: { gap: "$space.smMd", paddingY: "$updateBanner.cardPaddingY", shadow: "$elevation.shadow.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" },
          states: { hover: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
        },
        mobile: { base: { gap: "$space.md", paddingX: "$space.gutter.pane", paddingY: "$space.lg", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" } },
      },
    },
    artWindow: { on: ["desktop"], base: { bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.muted", shadow: "$elevation.shadow.hairline" } },
    artBarLong: { on: ["desktop"], base: { bg: "$color.text.faint" } },
    artBarShort: { on: ["desktop"], base: { bg: "$color.border.muted" } },
    artBadge: { on: ["desktop"], base: { bg: "$color.text.faint", borderWidth: "$border.width.thick", borderColor: "$color.background.raised", fg: "$color.background.raised" } },
    cardText: { on: ["desktop"], base: { gap: "$space.rowText" } },
    cardTitle: { on: ["desktop"], base: { size: "$font.size.bodySm", weight: "$font.weight.semibold", tracking: "$font.letterSpacing.tight", fg: "$color.text.strong" } },
    cardDetail: { on: ["desktop"], base: { size: "$font.size.micro", fg: "$color.text.faint" }, variants: { stage: { failed: { fg: "$color.text.danger" } } } },
    cardIcon: { on: ["desktop"], base: { square: "$size.icon.md", fg: "$color.text.subtle" } },
    railIcon: {
      on: ["desktop"],
      base: { square: "$updateBanner.buttonSize", radius: "$radius.circle", fg: "$color.text.body" },
      states: { hover: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    railGlyph: { on: ["desktop"], base: { square: "$size.icon.default" } },
    railDot: {
      on: ["desktop"],
      base: { top: "$updateBanner.dotInset", right: "$updateBanner.dotInset", square: "$size.dot.default", radius: "$radius.circle", bg: "$color.background.brand.default" },
      variants: { stage: { failed: { bg: "$color.text.danger" } } },
    },
    versionRow: { on: ["mobile"], base: { gap: "$space.md" } },
    versionTile: { on: ["mobile"], base: { square: "$updateBanner.versionTileSize", radius: "$radius.control", bg: "$color.background.muted" } },
    versionIcon: { on: ["mobile"], base: { square: "$size.icon.default", fg: "$color.text.muted" } },
    versionText: { on: ["mobile"], base: { size: "$font.size.body", line: "$font.lineHeight.body", fg: "$color.text.strong", weight: "$font.weight.normal" } },
    error: { on: ["mobile"], base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.danger", weight: "$font.weight.normal" } },
    note: { on: ["mobile"], base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    sheet: { on: ["mobile"], base: { gap: "$space.sm", paddingX: "$space.xl", radius: "$radius.sheet", bg: "$color.background.raised", shadow: "$elevation.shadow.modal" } },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", radius: "$radius.pill", bg: "$color.border.muted" } },
    sheetTitle: { on: ["mobile"], base: { size: "$font.size.h3", line: "$font.lineHeight.h3", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    sheetBody: { on: ["mobile"], base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted", weight: "$font.weight.normal" } },
  },
  reads: ["$updateBanner.cardPaddingX", "$color.background.chrome"],
});
