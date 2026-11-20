import { defineRecipe } from "../../recipe";

/**
 * HoverCard (web and desktop; the phone has a profile sheet instead). The Avatar and the two Buttons inside are their own
 * components: the avatar's enlarged size and type have no part of their own (Avatar draws none), so the kit reads them (`reads`).
 * The title hangs a hairline below its name (a margin); the hollow dot's 1.5px ring is a kit literal.
 */
export const hoverCard = defineRecipe({
  parts: ["root", "trigger", "triggerName", "panel", "header", "name", "guest", "title", "meta", "dot", "separator", "status"],
  styles: {
    root: { base: { width: "$hoverCard.w", font: "$font.sans" } },
    trigger: { base: { radius: "$radius.tag" }, states: { focus: { shadow: "$shadow.focus" } } },
    triggerName: { base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightBold", fg: "$fg.strong" } },
    panel: {
      base: {
        width: "$hoverCard.w",
        zIndex: "$z.popover",
        padding: "$space.md",
        radius: "$radius.panel",
        bg: "$surface.raised",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        shadow: "$shadow.menu",
        weight: "$font.weightNormal",
      },
    },
    header: { base: { gap: "$hoverCard.headGap" } },
    name: { base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightBold", fg: "$fg.strong" } },
    guest: {
      base: {
        height: "$hoverCard.guestH",
        paddingX: "$hoverCard.guestPadX",
        radius: "$radius.tag",
        bg: "$tag.neutralBg",
        fg: "$tag.neutralFg",
        size: "$text.micro",
        weight: "$font.weightSemibold",
      },
    },
    title: { base: { marginTop: "$border.wHairline", size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" } },
    meta: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.subtle" } },
    dot: {
      base: { square: "$hoverCard.presenceDot", radius: "$radius.circle", bg: "$presence.active" },
      variants: {
        // Away and offline share one hollow dot on purpose; the word beside it tells them apart. An agent's dot is a solid coral, with no ring.
        presence: { away: { bg: "transparent", borderColor: "$fg.faint" }, offline: { bg: "transparent", borderColor: "$fg.faint" } },
        agent: { true: { bg: "$brand.default", borderColor: "none" } },
      },
    },
    separator: { base: { fg: "$fg.faint" } },
    status: { base: { size: "$text.body", line: "$text.bodyLine", fg: "$fg.body" } },
  },
  reads: ["$hoverCard.avatar", "$text.body", "$font.weightBold"],
});
