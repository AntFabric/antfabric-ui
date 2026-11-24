import { defineRecipe } from "../../recipe";

/**
 * HoverCard (web and desktop; the phone has a profile sheet instead). The Avatar and the two Buttons inside are their own
 * components: the avatar's enlarged size and type have no part of their own (Avatar draws none), so the kit reads them (`reads`).
 * The title hangs a hairline below its name (a margin); the hollow dot's 1.5px ring is a kit literal.
 */
export const hoverCard = defineRecipe({
  parts: ["root", "trigger", "triggerName", "panel", "header", "name", "guest", "title", "meta", "dot", "separator", "status"],
  styles: {
    root: { base: { width: "$hoverCard.width", font: "$font.family.sans" } },
    trigger: { base: { radius: "$radius.tag" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    triggerName: { base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.bold", fg: "$color.text.strong" } },
    panel: {
      base: {
        width: "$hoverCard.width",
        zIndex: "$zIndex.popover",
        padding: "$space.md",
        radius: "$radius.panel",
        bg: "$color.background.raised",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        shadow: "$elevation.shadow.menu",
        weight: "$font.weight.normal",
      },
    },
    header: { base: { gap: "$hoverCard.headGap" } },
    name: { base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.bold", fg: "$color.text.strong" } },
    guest: {
      base: {
        height: "$hoverCard.guestHeight",
        paddingX: "$hoverCard.guestPaddingX",
        radius: "$radius.tag",
        bg: "$color.background.tag.neutral",
        fg: "$color.text.tag.neutral",
        size: "$font.size.micro",
        weight: "$font.weight.semibold",
      },
    },
    title: { base: { marginTop: "$border.width.hairline", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" } },
    meta: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.subtle" } },
    dot: {
      base: { square: "$hoverCard.presenceDotSize", radius: "$radius.circle", bg: "$color.background.presence.active" },
      variants: {
        // Away and offline share one hollow dot on purpose; the word beside it tells them apart. An agent's dot is a solid coral, with no ring.
        presence: { away: { bg: "transparent", borderColor: "$color.text.faint" }, offline: { bg: "transparent", borderColor: "$color.text.faint" } },
        agent: { true: { bg: "$color.background.brand.default", borderColor: "none" } },
      },
    },
    separator: { base: { fg: "$color.text.faint" } },
    status: { base: { size: "$font.size.body", line: "$font.lineHeight.body", fg: "$color.text.body" } },
  },
  reads: ["$hoverCard.avatarSize", "$font.size.body", "$font.weight.bold"],
});
