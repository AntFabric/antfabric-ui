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
      states: { on: { bg: "$color.background.selected" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: {
        web: {
          base: { minHeight: "$size.row.default", radius: "$radius.row", fg: "$color.text.strong", size: "$font.size.body" },
          states: { hover: { bg: "$color.background.hover" }, "hover+on": { bg: "$color.background.selected" }, pressed: { bg: "$color.background.selected" } },
        },
        desktop: {
          base: { minHeight: "$size.row.default", radius: "$radius.row", fg: "$color.text.strong", size: "$font.size.body" },
          states: { hover: { bg: "$color.background.hover" }, "hover+on": { bg: "$color.background.selected" }, pressed: { bg: "$color.background.selected" } },
        },
        // idiom: a one-step-larger gap and the pane gutter; the corners and the pressed fill are the web's (item 43). Kept, borderline (listed for
        // the owner): the glyph and name inks and the name's weight, which the phone sets by unread alone.
        mobile: { base: { gap: "$space.md", paddingX: "$space.gutter.pane", radius: "$radius.row" }, states: { pressed: { bg: "$color.background.selected" } } },
      },
    },
    hash: {
      base: { width: "$sidebarSection.hashWidth", weight: "$font.weight.normal" },
      platforms: {
        web: { base: { size: "$font.size.title" } },
        desktop: { base: { size: "$font.size.title" } },
        mobile: { base: { size: "$font.size.lead", fg: "$color.text.faint" }, variants: { unread: { true: { fg: "$color.text.strong" } } } },
      },
    },
    kindIcon: { base: { square: "$size.icon.sm" }, platforms: { mobile: { base: { square: "$size.icon.md", fg: "$color.text.faint" } } } },
    metaIcon: { base: { square: "$size.icon.sm", fg: "$color.text.faint" }, platforms: { mobile: { base: { square: "$size.icon.md" } } } },
    typingIcon: { on: ["web", "desktop"], base: { square: "$size.icon.md", fg: "$color.text.muted" } },
    name: {
      base: { line: "$font.lineHeight.body", weight: "$font.weight.normal" },
      variants: { active: { true: { weight: "$font.weight.medium" } }, unread: { true: { weight: "$font.weight.bold" } }, muted: { true: { fg: "$color.text.faint" } } },
      platforms: {
        mobile: {
          base: { size: "$font.size.body", weight: "$font.weight.medium", fg: "$color.text.strong" },
          variants: { unread: { true: { weight: "$font.weight.bold" } }, muted: { true: { fg: "$color.text.faint" } } },
        },
      },
    },
    // The phone's second line, while someone types.
    preview: {
      on: ["mobile"],
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal", fg: "$color.text.faint" },
      variants: { typing: { true: { fg: "$color.text.muted" } } },
    },
  },
});
