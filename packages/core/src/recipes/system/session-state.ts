import { defineRecipe } from "../../recipe";

/**
 * SessionState. A card with a tile, a title, a line of prose, and the sign-in actions.
 * The phone's card is one step in on the sides and its corner is a sheet's, its title is `h2` over the web's `h3` (and its letter
 * spacing is two percent of the size, a ratio the kit writes), and its prose is body, not body-small: its idiom. Its tile holds a 40pt glyph, a
 * literal in its kit; the web's glyph is `icon.sizeLg`, so `tileIcon` is the web's. `unlocked` is the phone's open lock, and the kit
 * turns it on only while the state is `locked`.
 * The top and bottom padding is the kits' (`space.2xl` and `space.xl`), because the vocabulary has no single-edge padding.
 * The prose's measure is a `maxWidth` (`sessionState.proseMaxW`) on the body and on the note, on both kits.
 */
export const sessionState = defineRecipe({
  parts: ["root", "tile", "tileIcon", "title", "body", "wait", "spinner", "waitText", "note", "actions"],
  styles: {
    root: {
      base: {
        width: "$sessionState.w",
        gap: "$space.sm",
        paddingX: "$space.2xl",
        radius: "$radius.panel",
        bg: "$surface.raised",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        shadow: "$shadow.card",
        font: "$font.sans",
      },
      platforms: { mobile: { base: { paddingX: "$space.xl", radius: "$radius.sheet" } } },
    },
    tile: {
      base: { square: "$sessionState.tile", radius: "$radius.circle", bg: "$brand.soft", fg: "$brand.default" },
      variants: {
        state: { suspended: { bg: "$surface.muted", fg: "$fg.muted" }, expired: { bg: "$warning.soft", fg: "$warning.default" } },
        unlocked: { true: { bg: "$success.soft", fg: "$success.default" } },
      },
    },
    tileIcon: { on: ["web", "desktop"], base: { square: "$icon.sizeLg" } },
    title: {
      base: { size: "$text.h3", line: "$text.h3Line", weight: "$font.weightSemibold", tracking: "$tracking.tight", fg: "$fg.strong" },
      platforms: { mobile: { base: { size: "$text.h2", line: "$text.h2Line", tracking: "none" } } },
    },
    body: {
      base: { maxWidth: "$sessionState.proseMaxW", size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightNormal" } } },
    },
    wait: { base: { gap: "$space.xs", fg: "$fg.faint" } },
    spinner: { base: { square: "$icon.sizeMd" } },
    waitText: { base: { size: "$text.caption" }, platforms: { mobile: { base: { line: "$text.captionLine", weight: "$font.weightNormal" } } } },
    note: { base: { maxWidth: "$sessionState.proseMaxW", size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted" }, platforms: { mobile: { base: { weight: "$font.weightNormal" } } } },
    actions: { base: { gap: "$space.xs" } },
  },
});
