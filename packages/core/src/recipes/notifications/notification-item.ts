import { defineRecipe } from "../../recipe";

/**
 * NotificationItem. Written from the React kit's table. `read` greys the row's ink and drops its unread wash; `approval`
 * (approved, declined, expired) tints the outcome line. The row's rule is its bottom edge; the kind badge's glyph weight (`size.stroke.bold`), the focus edge (an inset 2px `color.border.focus`)
 * and the indent under the text (`size.avatar.md`, `space.gutter.pane`) are reads, listed in `reads`. Text parts carry their own type (the web
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
      base: { bg: "$color.background.card", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle", font: "$font.family.sans" },
      variants: { read: { false: { bg: "$color.background.unread" } } },
    },
    hit: {
      base: { gap: "$space.md" },
      states: { hover: { bg: "$color.background.hover" } },
      platforms: { mobile: { base: { paddingX: "$space.gutter.pane" }, states: { pressed: { bg: "$color.background.hover" } } } },
    },
    kindBadge: {
      base: { square: "$notificationItem.kindBadgeSize", radius: "$notificationItem.kindBadgeRadius", borderWidth: "$border.width.thick", borderColor: "$color.background.card", bg: "$color.background.brand.default", fg: "$color.text.onBrand" },
      variants: { read: { true: { bg: "$color.background.muted", fg: "$color.text.muted" } } },
    },
    tile: {
      base: { square: "$notificationItem.tileSize", radius: "$radius.control", bg: "$color.background.brand.softHover", fg: "$color.background.brand.default" },
      variants: { read: { true: { bg: "$color.background.muted", fg: "$color.text.muted" } } },
    },
    tileIcon: { base: { square: "$size.icon.default" } },
    text: { base: { gap: "$notificationItem.textGap" } },
    meta: { base: { gap: "$notificationItem.metaGap" } },
    title: {
      base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.medium", fg: "$color.text.strong" },
      variants: { read: { true: { fg: "$color.text.muted" } } },
    },
    body: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted" },
      variants: { read: { true: { fg: "$color.text.faint" } } },
      platforms: { mobile: { base: { weight: "$font.weight.normal" } } },
    },
    lead: { base: { weight: "$font.weight.medium" } },
    // The web sets this line height itself (16px); the phone's is the caption's.
    time: {
      base: { size: "$font.size.caption", weight: "$font.weight.medium", fg: "$color.text.faint" },
      platforms: { mobile: { base: { line: "$font.lineHeight.caption" } } },
    },
    dot: { base: { square: "$size.dot.default", radius: "$radius.pill", bg: "$color.background.brand.default" } },
    decided: { base: { gap: "$space.xs" }, variants: { approval: { approved: { fg: "$color.text.success" }, declined: { fg: "$color.text.muted" }, expired: { fg: "$color.text.faint" } } } },
    decidedIcon: { base: { square: "$size.icon.md" } },
    decidedText: { base: { size: "$font.size.caption", weight: "$font.weight.medium" } },
    actions: { on: ["web", "desktop"], base: { radius: "$radius.control", bg: "$color.background.raised", shadow: "$elevation.shadow.hairline" } },
    rowAction: {
      on: ["web", "desktop"],
      // At least 24px tall, WCAG 2.2's minimum target (2.5.8): the micro label and its padding alone were 22.
      base: { minHeight: "$size.target.min", radius: "$radius.control", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.raised", fg: "$color.text.muted", size: "$font.size.micro" },
      states: { hover: { bg: "$color.background.hover", fg: "$color.text.strong" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    swipeAction: { on: ["mobile"], base: { bg: "$color.background.inverse", fg: "$color.text.onInverse" } },
    swipeDanger: { on: ["mobile"], base: { bg: "$color.background.danger.default", fg: "$color.text.onDanger" }, states: { pressed: { bg: "$color.background.danger.hover" } } },
    swipeIcon: { on: ["mobile"], base: { square: "$size.icon.default" } },
    swipeLabel: { on: ["mobile"], base: { size: "$font.size.caption", weight: "$font.weight.semibold" } },
  },
  reads: ["$size.stroke.bold", "$color.border.focus", "$size.avatar.md", "$space.gutter.pane"],
});
