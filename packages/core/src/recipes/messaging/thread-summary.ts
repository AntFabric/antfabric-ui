import { defineRecipe } from "../../recipe";

/**
 * ThreadSummary. Written from the React kit's table. The row's type is on `root`: the web draws the words as inherited text, and
 * the phone's reader hands it to each `Text`. The web row is a button with a transparent edge that shows on hover and a fill while
 * pressed; the phone's row has no edge or fill (it dims while pressed, a literal opacity in the kit), is one hit target tall
 * (`control.hit`, not `control.hXs`) and sets its type one step up (a deliberate platform idiom, item 42) and in a regular weight,
 * which the phone's `Text` needs to name a font file.
 */
export const threadSummary = defineRecipe({
  parts: ["root", "participants", "unreadDot", "unreadText", "replies", "lastReply", "following", "icon"],
  /** The touch target the phone grows to and the size it draws (`hitSlop`), and the ring a scroll area shows on focus: layout the kit reads. */
  reads: ["$control.hit", "$control.hIconSm"],
  styles: {
    root: {
      base: {
        gap: "$space.xs",
        minHeight: "$control.hXs",
        radius: "$radius.row",
        borderWidth: "$border.wHairline",
        borderColor: "transparent",
        font: "$font.sans",
        size: "$text.caption",
        line: "$text.captionLine",
      },
      states: { hover: { bg: "$surface.card", borderColor: "$border.subtle" }, pressed: { bg: "$surface.selected" }, focus: { shadow: "$shadow.focus" } },
      platforms: {
        mobile: {
          base: { minHeight: "$control.hit", radius: "none", borderWidth: "none", borderColor: "none", size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" },
          states: { pressed: { bg: "none" } },
        },
      },
    },
    unreadDot: { base: { square: "$dot.sizeSm", radius: "$radius.circle", bg: "$info.default" } },
    unreadText: { base: { fg: "$info.default", weight: "$font.weightSemibold" } },
    replies: { base: { fg: "$link.default", weight: "$font.weightSemibold" } },
    lastReply: { base: { fg: "$fg.faint" } },
    following: { base: { fg: "$fg.faint" } },
    icon: { base: { square: "$icon.sizeSm" } },
  },
});
