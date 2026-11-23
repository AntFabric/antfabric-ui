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
      base: { borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle", bg: "$surface.app" },
      states: { on: { bg: "$surface.unread" } },
    },
    row: { base: { bg: "$surface.app" } },
    tint: { base: { gap: "$space.md", paddingX: "$gutter.pane", paddingY: "$space.md" }, states: { on: { bg: "$surface.unread" } } },
    tile: { base: { radius: "$radius.control", bg: "$surface.muted" }, states: { on: { bg: "$brand.tint" } } },
    tileIcon: { base: { square: "$icon.sizeMd", fg: "$fg.muted" }, states: { on: { fg: "$brand.default" } } },
    title: {
      base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightMedium", fg: "$fg.strong" },
      states: { on: { weight: "$font.weightSemibold" } },
    },
    time: { base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightNormal", fg: "$fg.faint" } },
    body: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal", fg: "$fg.muted" } },
    history: { base: { paddingX: "$gutter.pane" } },
    historyTitle: { base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightNormal", fg: "$fg.body" } },
    // The buttons ride the trailing edge, which clears the pane gutter on the right and a space on the left.
    actions: { base: { gap: "$space.sm", paddingRight: "$gutter.pane" } },
    action: { base: { height: "$control.hit", bg: "$surface.muted" }, states: { focus: { shadow: "$shadow.focus" } } },
    actionLabel: { base: { size: "$text.body", weight: "$font.weightMedium", fg: "$fg.body" } },
    dangerAction: { base: { height: "$control.hit", bg: "$danger.default" }, states: { focus: { shadow: "$shadow.focus" } } },
    dangerLabel: { base: { size: "$text.body", weight: "$font.weightMedium", fg: "$danger.fg" } },
  },
});
