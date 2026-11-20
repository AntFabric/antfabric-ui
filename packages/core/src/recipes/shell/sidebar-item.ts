import { defineRecipe } from "../../recipe";

/**
 * SidebarItem. A channel, group or DM row. The web's is a compact 28px row (the `#`, a small glyph, a name that goes bold when
 * unread and medium when open); the phone's is a taller list row (one line, as V2 draws it, and a second only while someone types:
 * the last message and its time need the backend), and its name is bold or medium by unread alone. The phone's larger glyphs and type are a platform idiom (item 42), kept in `platforms.mobile`.
 * `unread` here means unread and not muted (the kit passes it so): a muted row never goes bold.
 */
export const sidebarItem = defineRecipe({
  parts: ["row", "hash", "kindIcon", "metaIcon", "typingIcon", "name", "preview"],
  styles: {
    row: {
      base: { gap: "$space.sm" },
      states: { on: { bg: "$surface.selected" }, focus: { shadow: "$shadow.focus" } },
      platforms: {
        web: {
          base: { minHeight: "$row.h", radius: "$radius.row", fg: "$fg.strong", size: "$text.body" },
          states: { hover: { bg: "$hover.surface" }, "hover+on": { bg: "$surface.selected" }, pressed: { bg: "$surface.selected" } },
        },
        desktop: {
          base: { minHeight: "$row.h", radius: "$radius.row", fg: "$fg.strong", size: "$text.body" },
          states: { hover: { bg: "$hover.surface" }, "hover+on": { bg: "$surface.selected" }, pressed: { bg: "$surface.selected" } },
        },
        // idiom: a one-step-larger gap and the pane gutter; the corners and the pressed fill are the web's (item 43). Kept, borderline (listed for
        // the owner): the glyph and name inks and the name's weight, which the phone sets by unread alone.
        mobile: { base: { gap: "$space.md", paddingX: "$gutter.pane", radius: "$radius.row" }, states: { pressed: { bg: "$surface.selected" } } },
      },
    },
    hash: {
      base: { width: "$sidebar.hashW", weight: "$font.weightNormal" },
      platforms: {
        web: { base: { size: "$text.title" } },
        desktop: { base: { size: "$text.title" } },
        mobile: { base: { size: "$text.lead", fg: "$fg.faint" }, variants: { unread: { true: { fg: "$fg.strong" } } } },
      },
    },
    kindIcon: { base: { square: "$icon.sizeSm" }, platforms: { mobile: { base: { square: "$icon.sizeMd", fg: "$fg.faint" } } } },
    metaIcon: { base: { square: "$icon.sizeSm", fg: "$fg.faint" }, platforms: { mobile: { base: { square: "$icon.sizeMd" } } } },
    typingIcon: { on: ["web", "desktop"], base: { square: "$icon.sizeMd", fg: "$fg.muted" } },
    name: {
      base: { line: "$text.bodyLine", weight: "$font.weightNormal" },
      variants: { active: { true: { weight: "$font.weightMedium" } }, unread: { true: { weight: "$font.weightBold" } }, muted: { true: { fg: "$fg.faint" } } },
      platforms: {
        mobile: {
          base: { size: "$text.body", weight: "$font.weightMedium", fg: "$fg.strong" },
          variants: { unread: { true: { weight: "$font.weightBold" } }, muted: { true: { fg: "$fg.faint" } } },
        },
      },
    },
    // The phone's second line, while someone types.
    preview: {
      on: ["mobile"],
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal", fg: "$fg.faint" },
      variants: { typing: { true: { fg: "$fg.muted" } } },
    },
  },
});
