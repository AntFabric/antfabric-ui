import { defineRecipe } from "../../recipe";

/**
 * NotificationItem. Written from the React kit's table. `read` greys the row's ink and drops its unread wash; `approval`
 * (approved, declined, expired) tints the outcome line. The row's rule is its bottom edge; the kind badge's glyph weight (`icon.strokeBold`), the focus edge (an inset 2px `focus.ring`)
 * and the indent under the text (`avatar.md`, `gutter.pane`) are reads, listed in `reads`. Text parts carry their own type (the web
 * draws spans, the phone `Text`, which needs a weight to name a font file). The web has hover actions on the row; the phone has swipe actions.
 * The phone pads its sides with the pane gutter and shows a pressed fill where the web shows a hover one.
 */
export const notificationItem = defineRecipe({
  parts: [
    "root",
    "hit",
    "kindBadge",
    "tile",
    "tileIcon",
    "text",
    "title",
    "body",
    "lead",
    "meta",
    "time",
    "dot",
    "decided",
    "decidedIcon",
    "decidedText",
    "actions",
    "rowAction",
    "swipeAction",
    "swipeDanger",
    "swipeIcon",
    "swipeLabel",
  ],
  styles: {
    root: {
      base: { bg: "$surface.card", borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle", font: "$font.sans" },
      variants: { read: { false: { bg: "$surface.unread" } } },
    },
    hit: {
      base: { gap: "$space.md" },
      states: { hover: { bg: "$hover.surface" } },
      platforms: { mobile: { base: { paddingX: "$gutter.pane" }, states: { pressed: { bg: "$hover.surface" } } } },
    },
    kindBadge: {
      base: { square: "$notificationItem.kindBadge", radius: "$notificationItem.kindBadgeRadius", borderWidth: "$border.wThick", borderColor: "$surface.card", bg: "$brand.default", fg: "$fg.onBrand" },
      variants: { read: { true: { bg: "$surface.muted", fg: "$fg.muted" } } },
    },
    tile: {
      base: { square: "$notificationItem.tile", radius: "$radius.control", bg: "$brand.softHover", fg: "$brand.default" },
      variants: { read: { true: { bg: "$surface.muted", fg: "$fg.muted" } } },
    },
    tileIcon: { base: { square: "$icon.size" } },
    text: { base: { gap: "$notificationItem.textGap" } },
    meta: { base: { gap: "$notificationItem.metaGap" } },
    title: {
      base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightMedium", fg: "$fg.strong" },
      variants: { read: { true: { fg: "$fg.muted" } } },
    },
    body: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted" },
      variants: { read: { true: { fg: "$fg.faint" } } },
      platforms: { mobile: { base: { weight: "$font.weightNormal" } } },
    },
    lead: { base: { weight: "$font.weightMedium" } },
    // The web sets this line height itself (16px); the phone's is the caption's.
    time: {
      base: { size: "$text.caption", weight: "$font.weightMedium", fg: "$fg.faint" },
      platforms: { mobile: { base: { line: "$text.captionLine" } } },
    },
    dot: { base: { square: "$dot.size", radius: "$radius.pill", bg: "$brand.default" } },
    decided: { base: { gap: "$space.xs" }, variants: { approval: { approved: { fg: "$success.default" }, declined: { fg: "$fg.muted" }, expired: { fg: "$fg.faint" } } } },
    decidedIcon: { base: { square: "$icon.sizeMd" } },
    decidedText: { base: { size: "$text.caption", weight: "$font.weightMedium" } },
    actions: { on: ["web", "desktop"], base: { radius: "$radius.control", bg: "$surface.raised", shadow: "$shadow.hairline" } },
    rowAction: {
      on: ["web", "desktop"],
      // At least 24px tall, WCAG 2.2's minimum target (2.5.8): the micro label and its padding alone were 22.
      base: { minHeight: "$control.hit", radius: "$radius.control", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.raised", fg: "$fg.muted", size: "$text.micro" },
      states: { hover: { bg: "$hover.surface", fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
    },
    swipeAction: { on: ["mobile"], base: { bg: "$surface.inverse", fg: "$fg.onInverse" } },
    swipeDanger: { on: ["mobile"], base: { bg: "$danger.solid", fg: "$danger.fg" }, states: { pressed: { bg: "$danger.solidHover" } } },
    swipeIcon: { on: ["mobile"], base: { square: "$icon.size" } },
    swipeLabel: { on: ["mobile"], base: { size: "$text.caption", weight: "$font.weightSemibold" } },
  },
  reads: ["$icon.strokeBold", "$focus.ring", "$avatar.md", "$gutter.pane"],
});
