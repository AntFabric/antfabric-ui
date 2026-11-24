import { defineRecipe } from "../../recipe";

/**
 * ThreadSummary. Written from the React kit's table. The row's type is on `root`: the web draws the words as inherited text, and
 * the phone's reader hands it to each `Text`. The web row is a button with a transparent edge that shows on hover and a fill while
 * pressed; the phone's row has no edge or fill (it dims while pressed, a literal opacity in the kit), is one hit target tall
 * (`size.target.min`, not `size.control.xs`) and sets its type one step up (a deliberate platform idiom, item 42) and in a regular weight,
 * which the phone's `Text` needs to name a font file.
 */
export const threadSummary = defineRecipe({
  parts: ["root", "participants", "unreadDot", "unreadText", "replies", "lastReply", "following", "icon"],
  /** The touch target the phone grows to and the size it draws (`hitSlop`), and the ring a scroll area shows on focus: layout the kit reads. */
  reads: ["$size.target.min", "$size.control.iconSm"],
  styles: {
    root: {
      base: {
        gap: "$space.xs",
        minHeight: "$size.control.xs",
        radius: "$radius.row",
        borderWidth: "$border.width.hairline",
        borderColor: "transparent",
        font: "$font.family.sans",
        size: "$font.size.caption",
        line: "$font.lineHeight.caption",
      },
      states: { hover: { bg: "$color.background.card", borderColor: "$color.border.subtle" }, pressed: { bg: "$color.background.selected" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: {
        mobile: {
          base: { minHeight: "$size.target.min", radius: "none", borderWidth: "none", borderColor: "none", size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" },
          states: { pressed: { bg: "none" } },
        },
      },
    },
    unreadDot: { base: { square: "$size.dot.sm", radius: "$radius.circle", bg: "$color.text.info" } },
    unreadText: { base: { fg: "$color.text.info", weight: "$font.weight.semibold" } },
    replies: { base: { fg: "$color.text.link", weight: "$font.weight.semibold" } },
    lastReply: { base: { fg: "$color.text.faint" } },
    following: { base: { fg: "$color.text.faint" } },
    icon: { base: { square: "$size.icon.sm" } },
  },
});
