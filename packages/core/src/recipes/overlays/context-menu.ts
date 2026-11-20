import { defineRecipe, type PartRecipe } from "../../recipe";

/**
 * ContextMenu. On web and desktop a floating panel at the pointer (quick reactions over a Menu, with the pressed message drawn
 * highlighted above it); on the phone a bottom sheet (`sheet`, `handle`, `title`, with the full emoji `picker` that the + opens).
 * The two share the reaction buttons, the emoji and the root. Larger type and buttons on the phone are a platform idiom (item 42); the reaction's radius and
 * pressed fill are the web's (item 43).
 * The `more` button is the + : drawn like a reaction, and `on` (coral) while the phone's emoji panel is open.
 * Read by the kit: the glass surface's radius (Liquid Glass is a state the recipe does not know), and the rows' pull out to the sheet's
 * edges (a negative margin of `$gutter.pane`, which no token spells).
 */
const reaction = (on: PartRecipe["states"]): PartRecipe => ({
  base: { square: "$control.hIcon", radius: "$radius.control", borderWidth: "$border.wHairline", borderColor: "transparent" },
  states: { ...on, hover: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" }, focus: { shadow: "$shadow.focus" } },
  platforms: { mobile: { base: { square: "$control.hMd" } } }, // idiom: the 44pt touch button
});

export const contextMenu = defineRecipe({
  parts: ["root", "target", "author", "time", "message", "panel", "divider", "reaction", "more", "emoji", "moreIcon", "sheet", "handle", "title", "picker", "search", "searchIcon", "input", "heading", "grid", "home"],
  styles: {
    root: { base: { font: "$font.sans" }, platforms: { mobile: { base: { bg: "$scrim.default" } } } },
    target: { on: ["web", "desktop"], base: { radius: "$radius.row", bg: "$surface.selected" } },
    author: { on: ["web", "desktop"], base: { size: "$text.bodySm", weight: "$font.weightBold", fg: "$fg.strong" } },
    time: { on: ["web", "desktop"], base: { size: "$text.caption", weight: "$font.weightNormal", fg: "$fg.faint" } },
    message: { on: ["web", "desktop"], base: { size: "$text.body", line: "$text.bodyLine", fg: "$fg.body" } },
    panel: {
      on: ["web", "desktop"],
      base: { width: "$menu.wContext", padding: "$space.2xs", zIndex: "$z.popover", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", radius: "$radius.rail", shadow: "$shadow.menu" },
      // With the pressed message drawn above it, the panel is set in from the message's edge.
      variants: { showTarget: { true: { marginLeft: "$contextMenu.sceneOffset" } } },
    },
    divider: { on: ["web", "desktop"], base: { height: "$border.wHairline", bg: "$border.subtle" } },
    reaction: reaction({ on: { bg: "$brand.soft", borderColor: "$brand.default" } }),
    // The + never carries the coral ring: on the phone it only tints while the emoji panel is open.
    more: reaction({ on: { bg: "$brand.soft" } }),
    emoji: {
      base: { size: "$emoji.size" },
      platforms: { mobile: { base: { size: "$text.lead", line: "$text.leadLine", weight: "$font.weightNormal", fg: "$fg.strong" } } },
    },
    moreIcon: { base: { square: "$icon.size", fg: "$fg.muted" }, states: { on: { fg: "$brand.default" } } },
    sheet: { on: ["mobile"], base: { bg: "$surface.card", paddingX: "$gutter.pane", radiusTop: "$radius.sheet" } },
    handle: { on: ["mobile"], base: { width: "$sheet.grabberW", height: "$sheet.grabberH", radius: "$radius.pill", bg: "$border.muted" } },
    title: { on: ["mobile"], base: { size: "$text.lead", line: "$sheet.titleLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    picker: { on: ["mobile"], base: { radius: "$radius.input", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
    search: { on: ["mobile"], base: { height: "$control.hXs", radius: "$radius.pill", bg: "$surface.muted" } },
    searchIcon: { on: ["mobile"], base: { square: "$icon.sizeMd", fg: "$fg.muted" } },
    input: { on: ["mobile"], base: { size: "$text.bodySm", weight: "$font.weightNormal", fg: "$fg.body", placeholder: "$fg.placeholder" } },
    heading: { on: ["mobile"], base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.faint" } },
    grid: { on: ["mobile"], base: { size: "$emoji.grid", weight: "$font.weightNormal", fg: "$fg.strong" } },
    home: { on: ["mobile"], base: { height: "$homeIndicator.h" } },
  },
  reads: ["$sheet.glassRadius", "$gutter.pane", "$control.hit"],
});
