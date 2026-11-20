import { defineRecipe } from "../../recipe";

/**
 * ReactionPill. Written from the React kit's table. `on` is "you reacted" on a reaction (never on the add pill, which the kit
 * does not turn it on for). The pill's type is on `pill`: the web draws the emoji and count as inherited text, and the phone's
 * reader hands it to each `Text`. The reactors card is the web and desktop's hover card; the phone has a Reactions sheet instead.
 * The phone differs in the height (a literal 32 in the kit, not `control.hXxs`), the shape (a full pill, not a control radius), the side padding (`space.sm`, 7px on the web), one step
 * larger type (a deliberate platform idiom, item 42). Its inks are the web's (item 43: the text is tinted on a pill that is yours). Kept,
 * borderline (listed for the owner): the full-pill radius, where the web's is the control radius.
 */
export const reactionPill = defineRecipe({
  parts: ["root", "card", "cardEmoji", "pill", "emoji", "count", "icon"],
  /** The touch target the phone grows to and the size it draws (`hitSlop`), and the ring a scroll area shows on focus: layout the kit reads. */
  reads: ["$control.hit", "$control.hIconSm"],
  styles: {
    root: { base: { gap: "$space.xs" } },
    card: {
      on: ["web", "desktop"],
      // Opened by hover or focus (not by `showReactors`), the card floats over the row.
      variants: { showReactors: { false: { zIndex: "$z.tooltip" } } },
      base: { gap: "$space.xs", radius: "$radius.card", bg: "$surface.inverse", fg: "$fg.onInverse", shadow: "$shadow.tooltip", font: "$font.sans", size: "$text.caption", weight: "$font.weightSemibold" },
    },
    cardEmoji: { on: ["web", "desktop"] },
    pill: {
      base: {
        gap: "$space.2xs",
        height: "$control.hXxs",
        radius: "$radius.control",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        bg: "$surface.card",
        fg: "$fg.muted",
        font: "$font.sans",
        size: "$text.caption",
        weight: "$font.weightSemibold",
      },
      variants: { variant: { add: { paddingX: "$space.xs", fg: "$fg.faint", states: { hover: { fg: "$fg.strong" } } } } },
      // Hover greys a pill that is not yours; yours deepens its coral and keeps its coral edge. Pressed goes one step deeper still.
      states: {
        on: { bg: "$brand.soft", borderColor: "$border.brand", fg: "$fg.onBrandSoft" },
        hover: { bg: "$hover.surface", borderColor: "$border.muted" },
        "hover+on": { bg: "$brand.softHover", borderColor: "$border.brand" },
        pressed: { bg: "$surface.selected" },
        "pressed+on": { bg: "$brand.softHover" },
        focus: { shadow: "$shadow.focus" },
        disabled: { opacity: "$opacity.disabled" },
      },
      platforms: {
        mobile: {
          base: { height: "none", paddingX: "$space.sm", radius: "$radius.pill", size: "$text.bodySm", line: "$text.bodySm" },
          variants: { variant: { add: { paddingX: "$space.xs" } } },
        },
      },
    },
    emoji: { base: { size: "$text.bodySm" }, platforms: { mobile: { base: { line: "$text.bodySm" } } } },
    icon: { base: { square: "$icon.sizeMd" } },
  },
});
