import { defineRecipe } from "../../recipe";

/**
 * Table. Web and desktop draw a grid in a scroll region: the header row (a step recessed, and sticky), the sort buttons in it (pulled left by their own padding, so the label lines up with the cells: the kit's layout), a divider under every
 * row, and a fill under the pointer or on a ticked row. The phone draws a card per row instead: a title, a badge beside it and a few label and value
 * lines, with a sort bar above. Row and cell heights, the cell's side padding, the header and the row fills are the `table` tokens; everything
 * else a table says (the Tag, the Avatar, the Checkbox, the Delta, the Select) is the kit component's own.
 *
 * A row's fill is on its cells (a `<tr>` cannot hold a sticky header's fill under it), `hover` while the pointer is over the row and `on` while it is
 * ticked, the ticked one winning. The scroll region takes the data accent for its edge while it has keyboard focus: it is a stop for the arrow keys.
 * The loading lines' widths and the sparkline cell's size are read for layout, as the dashboard pieces' are.
 *
 * A column with `emphasis` (the one that names the row) draws its cells' content as the `emphasis` part on web and desktop: the strong ink
 * at medium weight. The phone needs none: the row's name is its card's title.
 * `table.headRadius` rounds the header row's two ends (the first header cell's start corners, the last's end corners); at 0 nothing is drawn
 * for it.
 *
 * With `narrow="cards"`, web and desktop draw the phone's cards too while the table's own box is narrower than `table.cardsBelow`: the same
 * parts, a step smaller (13px lines, a 12 by 10 inset, the card corner), a fill under the pointer, and the sort bar above them. The phone's
 * cards are unchanged.
 */
export const table = defineRecipe({
  parts: ["root", "scroll", "headCell", "checkHead", "sortButton", "sortIcon", "cell", "emphasis", "checkCell", "empty", "person", "personName", "bar", "barSort", "cards", "card", "cardHead", "cardTitle", "cardLines", "cardLine", "cardLabel", "cardValue"],
  styles: {
    root: { base: { gap: "$space.smMd", font: "$font.sans", fg: "$fg.body", size: "$text.bodySm" } },
    scroll: {
      on: ["web", "desktop"],
      base: { borderWidth: "$border.wHairline", borderColor: "$border.subtle", radius: "$radius.input" },
      states: { focus: { borderColor: "$data.accent", ring: "$data.accent" } },
    },
    headCell: {
      on: ["web", "desktop"],
      base: {
        height: "$table.headH",
        paddingX: "$table.cellX",
        bg: "$table.header",
        fg: "$fg.muted",
        size: "$text.caption",
        weight: "$font.weightSemibold",
        borderBottomWidth: "$border.wHairline",
        borderBottomColor: "$table.divider",
      },
    },
    checkHead: { on: ["web", "desktop"], base: { width: "$table.checkW", paddingRight: "$space.none" } },
    sortButton: {
      on: ["web", "desktop"],
      base: { gap: "$space.2xs", paddingX: "$space.xs", paddingY: "$space.2xs", radius: "$radius.row" },
      states: { hover: { bg: "$hover.surface", fg: "$fg.strong" }, on: { fg: "$fg.strong" }, focus: { ring: "$data.accent" } },
    },
    sortIcon: { on: ["web", "desktop"], base: { square: "$icon.sizeSm" } },
    cell: {
      on: ["web", "desktop"],
      base: { height: "$table.rowH", paddingX: "$table.cellX", borderBottomWidth: "$border.wHairline", borderBottomColor: "$table.divider" },
      variants: { dense: { true: { height: "$table.denseRowH" } } },
      states: { hover: { bg: "$table.rowHover" }, on: { bg: "$table.rowSelected" } },
    },
    emphasis: { on: ["web", "desktop"], base: { fg: "$fg.strong", weight: "$font.weightMedium" } },
    checkCell: {
      on: ["web", "desktop"],
      base: { width: "$table.checkW", height: "$table.rowH", paddingRight: "$space.none", paddingLeft: "$table.cellX", borderBottomWidth: "$border.wHairline", borderBottomColor: "$table.divider" },
      variants: { dense: { true: { height: "$table.denseRowH" } } },
      states: { hover: { bg: "$table.rowHover" }, on: { bg: "$table.rowSelected" } },
    },
    empty: { base: { paddingY: "$space.lg", fg: "$fg.muted" } },
    person: { base: { gap: "$space.sm" } },
    personName: { base: { size: "$text.bodySm", weight: "$font.weightRegular", fg: "$fg.body" } },
    bar: { base: { gap: "$space.sm" } },
    barSort: { base: { minWidth: "$space.none" } },
    cards: { base: { gap: "$space.sm" } },
    card: {
      base: { padding: "$space.md", gap: "$space.sm", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", radius: "$radius.input" },
      // Hover is the web's and the desktop's only: the phone has none.
      states: { hover: { bg: "$table.rowHover" }, on: { bg: "$table.rowSelected", borderColor: "$data.accent" } },
      platforms: {
        web: { base: { paddingX: "$space.md", paddingY: "$space.smMd", gap: "$space.xs", radius: "$radius.card" } },
        desktop: { base: { paddingX: "$space.md", paddingY: "$space.smMd", gap: "$space.xs", radius: "$radius.card" } },
      },
    },
    cardHead: { base: { gap: "$space.smMd" } },
    cardTitle: {
      base: { size: "$text.body", weight: "$font.weightSemibold", fg: "$fg.strong" },
      // The web's title is the grid's `emphasis` cell: the strong ink at medium weight, in the lines' size.
      platforms: {
        web: { base: { size: "$text.bodySm", weight: "$font.weightMedium" } },
        desktop: { base: { size: "$text.bodySm", weight: "$font.weightMedium" } },
      },
    },
    cardLines: { base: { gap: "$space.2xs" } },
    cardLine: { base: { gap: "$space.md", minHeight: "$control.hXxs" } },
    cardLabel: {
      base: { size: "$text.caption", weight: "$font.weightRegular", fg: "$fg.muted" },
      platforms: { web: { base: { size: "$text.bodySm" } }, desktop: { base: { size: "$text.bodySm" } } },
    },
    cardValue: { base: { size: "$text.bodySm", weight: "$font.weightRegular", fg: "$fg.body" } },
  },
  reads: ["$shadow.focus", "$radius.row", "$table.headRadius","$table.sparkW", "$table.sparkH", "$table.loadS", "$table.loadM", "$table.loadL", "$table.loadH", "$table.loadCardS", "$table.loadCardL", "$table.cardsBelow"],
});
