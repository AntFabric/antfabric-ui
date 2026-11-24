import { defineRecipe, type PartRecipe } from "../../recipe";

/**
 * ContextMenu. On web and desktop a floating panel at the pointer (quick reactions over a Menu, with the pressed message drawn
 * highlighted above it); on the phone a bottom sheet (`sheet`, `handle`, `title`, with the full emoji `picker` that the + opens).
 * The two share the reaction buttons, the emoji and the root. Larger type and buttons on the phone are a platform idiom (item 42); the reaction's radius and
 * pressed fill are the web's (item 43).
 * The `more` button is the + : drawn like a reaction, and `on` (coral) while the phone's emoji panel is open.
 * Read by the kit: the glass surface's radius (Liquid Glass is a state the recipe does not know), and the rows' pull out to the sheet's
 * edges (a negative margin of `$space.gutter.pane`, which no token spells).
 */
const reaction = (on: PartRecipe["states"]): PartRecipe => ({
  base: { square: "$size.control.icon", radius: "$radius.control", borderWidth: "$border.width.hairline", borderColor: "transparent" },
  states: { ...on, hover: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" }, focus: { shadow: "$elevation.shadow.focus" } },
  platforms: { mobile: { base: { square: "$size.control.md" } } }, // idiom: the 44pt touch button
});

export const contextMenu = defineRecipe({
  parts: ["root", "target", "author", "time", "message", "panel", "divider", "reaction", "more", "emoji", "moreIcon", "sheet", "handle", "title", "picker", "search", "searchIcon", "input", "heading", "grid", "home"],
  styles: {
    root: { base: { font: "$font.family.sans" }, platforms: { mobile: { base: { bg: "$color.background.scrim.default" } } } },
    target: { on: ["web", "desktop"], base: { radius: "$radius.row", bg: "$color.background.selected" } },
    author: { on: ["web", "desktop"], base: { size: "$font.size.bodySm", weight: "$font.weight.bold", fg: "$color.text.strong" } },
    time: { on: ["web", "desktop"], base: { size: "$font.size.caption", weight: "$font.weight.normal", fg: "$color.text.faint" } },
    message: { on: ["web", "desktop"], base: { size: "$font.size.body", line: "$font.lineHeight.body", fg: "$color.text.body" } },
    panel: {
      on: ["web", "desktop"],
      base: { width: "$menu.widthContext", padding: "$space.2xs", zIndex: "$zIndex.popover", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", radius: "$radius.rail", shadow: "$elevation.shadow.menu" },
      // With the pressed message drawn above it, the panel is set in from the message's edge.
      variants: { showTarget: { true: { marginLeft: "$contextMenu.sceneOffsetX" } } },
    },
    divider: { on: ["web", "desktop"], base: { height: "$border.width.hairline", bg: "$color.border.subtle" } },
    reaction: reaction({ on: { bg: "$color.background.brand.soft", borderColor: "$color.background.brand.default" } }),
    // The + never carries the coral ring: on the phone it only tints while the emoji panel is open.
    more: reaction({ on: { bg: "$color.background.brand.soft" } }),
    emoji: {
      base: { size: "$contextMenu.emojiFontSize" },
      platforms: { mobile: { base: { size: "$font.size.lead", line: "$font.lineHeight.lead", weight: "$font.weight.normal", fg: "$color.text.strong" } } },
    },
    moreIcon: { base: { square: "$size.icon.default", fg: "$color.text.muted" }, states: { on: { fg: "$color.background.brand.default" } } },
    sheet: { on: ["mobile"], base: { bg: "$color.background.card", paddingX: "$space.gutter.pane", radiusTop: "$radius.sheet" } },
    handle: { on: ["mobile"], base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", radius: "$radius.pill", bg: "$color.border.muted" } },
    title: { on: ["mobile"], base: { size: "$font.size.lead", line: "$sheet.titleLineHeight", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    picker: { on: ["mobile"], base: { radius: "$radius.input", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" } },
    search: { on: ["mobile"], base: { height: "$size.control.xs", radius: "$radius.pill", bg: "$color.background.muted" } },
    searchIcon: { on: ["mobile"], base: { square: "$size.icon.md", fg: "$color.text.muted" } },
    input: { on: ["mobile"], base: { size: "$font.size.bodySm", weight: "$font.weight.normal", fg: "$color.text.body", placeholder: "$color.text.placeholder" } },
    heading: { on: ["mobile"], base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.faint" } },
    grid: { on: ["mobile"], base: { size: "$contextMenu.emojiGridFontSize", weight: "$font.weight.normal", fg: "$color.text.strong" } },
    home: { on: ["mobile"], base: { height: "$size.layout.homeIndicator" } },
  },
  reads: ["$sheet.glassRadius", "$space.gutter.pane", "$size.target.min"],
});
