import { defineRecipe } from "../../recipe";

/**
 * SwipeRow: phone only. `on` is a tinted row (a notification that is unread), which also picks the unread glyph tile and the
 * semibold title. The row's rule is its bottom edge.
 * The two kinds of action button are two parts (a button is not a documented prop); their width (88) and radius (12) are literals
 * in the kit, as is the row's minimum height.
 */
export const swipeRow = defineRecipe({
  parts: ["root", "row", "tint", "tile", "tileIcon", "title", "time", "body", "history", "historyTitle", "actions", "action", "actionLabel", "dangerAction", "dangerLabel"],
  styles: {
    root: {
      base: { borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle", bg: "$color.background.app" },
      states: { on: { bg: "$color.background.unread" } },
    },
    row: { base: { bg: "$color.background.app" } },
    tint: { base: { gap: "$space.md", paddingX: "$space.gutter.pane", paddingY: "$space.md" }, states: { on: { bg: "$color.background.unread" } } },
    tile: { base: { radius: "$radius.control", bg: "$color.background.muted" }, states: { on: { bg: "$color.background.brand.tint" } } },
    tileIcon: { base: { square: "$size.icon.md", fg: "$color.text.muted" }, states: { on: { fg: "$color.background.brand.default" } } },
    title: {
      base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.medium", fg: "$color.text.strong" },
      states: { on: { weight: "$font.weight.semibold" } },
    },
    time: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.normal", fg: "$color.text.faint" } },
    body: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal", fg: "$color.text.muted" } },
    history: { base: { paddingX: "$space.gutter.pane" } },
    historyTitle: { base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.normal", fg: "$color.text.body" } },
    // The buttons ride the trailing edge, which clears the pane gutter on the right and a space on the left.
    actions: { base: { gap: "$space.sm", paddingRight: "$space.gutter.pane" } },
    action: { base: { height: "$size.target.min", bg: "$color.background.muted" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    actionLabel: { base: { size: "$font.size.body", weight: "$font.weight.medium", fg: "$color.text.body" } },
    dangerAction: { base: { height: "$size.target.min", bg: "$color.text.danger" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    dangerLabel: { base: { size: "$font.size.body", weight: "$font.weight.medium", fg: "$color.text.onDanger" } },
  },
});
