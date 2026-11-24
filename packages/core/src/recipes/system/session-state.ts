import { defineRecipe } from "../../recipe";

/**
 * SessionState. A card with a tile, a title, a line of prose, and the sign-in actions.
 * The phone's card is one step in on the sides and its corner is a sheet's, its title is `h2` over the web's `h3` (and its letter
 * spacing is two percent of the size, a ratio the kit writes), and its prose is body, not body-small: its idiom. Its tile holds a 40pt glyph, a
 * literal in its kit; the web's glyph is `size.icon.lg`, so `tileIcon` is the web's. `unlocked` is the phone's open lock, and the kit
 * turns it on only while the state is `locked`.
 * The top and bottom padding is the kits' (`space.2xl` and `space.xl`), because the vocabulary has no single-edge padding.
 * The prose's measure is a `maxWidth` (`sessionState.proseMaxWidth`) on the body and on the note, on both kits.
 */
export const sessionState = defineRecipe({
  parts: ["root", "tile", "tileIcon", "title", "body", "wait", "spinner", "waitText", "note", "actions"],
  styles: {
    root: {
      base: {
        width: "$sessionState.width",
        gap: "$space.sm",
        paddingX: "$space.2xl",
        radius: "$radius.panel",
        bg: "$color.background.raised",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        shadow: "$elevation.shadow.card",
        font: "$font.family.sans",
      },
      platforms: { mobile: { base: { paddingX: "$space.xl", radius: "$radius.sheet" } } },
    },
    tile: {
      base: { square: "$sessionState.tileSize", radius: "$radius.circle", bg: "$color.background.brand.soft", fg: "$color.background.brand.default" },
      variants: {
        state: { suspended: { bg: "$color.background.muted", fg: "$color.text.muted" }, expired: { bg: "$color.background.warning.soft", fg: "$color.text.warning" } },
        unlocked: { true: { bg: "$color.background.success.soft", fg: "$color.text.success" } },
      },
    },
    tileIcon: { on: ["web", "desktop"], base: { square: "$size.icon.lg" } },
    title: {
      base: { size: "$font.size.h3", line: "$font.lineHeight.h3", weight: "$font.weight.semibold", tracking: "$font.letterSpacing.tight", fg: "$color.text.strong" },
      platforms: { mobile: { base: { size: "$font.size.h2", line: "$font.lineHeight.h2", tracking: "none" } } },
    },
    body: {
      base: { maxWidth: "$sessionState.proseMaxWidth", size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.normal" } } },
    },
    wait: { base: { gap: "$space.xs", fg: "$color.text.faint" } },
    spinner: { base: { square: "$size.icon.md" } },
    waitText: { base: { size: "$font.size.caption" }, platforms: { mobile: { base: { line: "$font.lineHeight.caption", weight: "$font.weight.normal" } } } },
    note: { base: { maxWidth: "$sessionState.proseMaxWidth", size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted" }, platforms: { mobile: { base: { weight: "$font.weight.normal" } } } },
    actions: { base: { gap: "$space.xs" } },
  },
});
