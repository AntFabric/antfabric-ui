import { defineRecipe } from "../../recipe";

/**
 * ReactionPill. Written from the React kit's table. `on` is "you reacted" on a reaction (never on the add pill, which the kit
 * does not turn it on for). The pill's type is on `pill`: the web draws the emoji and count as inherited text, and the phone's
 * reader hands it to each `Text`. The reactors card is the web and desktop's hover card; the phone has a Reactions sheet instead.
 * The phone differs in the height (a literal 32 in the kit, not `size.control.xxs`), the shape (a full pill, not a control radius), the side padding (`space.sm`, 7px on the web), one step
 * larger type (a deliberate platform idiom, item 42). Its inks are the web's (item 43: the text is tinted on a pill that is yours). Kept,
 * borderline (listed for the owner): the full-pill radius, where the web's is the control radius.
 */
export const reactionPill = defineRecipe({
  parts: ["root", "card", "cardEmoji", "pill", "emoji", "count", "icon"],
  /** The touch target the phone grows to and the size it draws (`hitSlop`), and the ring a scroll area shows on focus: layout the kit reads. */
  reads: ["$size.target.min", "$size.control.iconSm"],
  styles: {
    root: { base: { gap: "$space.xs" } },
    card: {
      on: ["web", "desktop"],
      // Opened by hover or focus (not by `showReactors`), the card floats over the row.
      variants: { showReactors: { false: { zIndex: "$zIndex.tooltip" } } },
      base: { gap: "$space.xs", radius: "$radius.card", bg: "$color.background.inverse", fg: "$color.text.onInverse", shadow: "$elevation.shadow.tooltip", font: "$font.family.sans", size: "$font.size.caption", weight: "$font.weight.semibold" },
    },
    cardEmoji: { on: ["web", "desktop"] },
    pill: {
      base: {
        gap: "$space.2xs",
        height: "$size.control.xxs",
        radius: "$radius.control",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        bg: "$color.background.card",
        fg: "$color.text.muted",
        font: "$font.family.sans",
        size: "$font.size.caption",
        weight: "$font.weight.semibold",
      },
      variants: { variant: { add: { paddingX: "$space.xs", fg: "$color.text.faint", states: { hover: { fg: "$color.text.strong" } } } } },
      // Hover greys a pill that is not yours; yours deepens its coral and keeps its coral edge. Pressed goes one step deeper still.
      states: {
        on: { bg: "$color.background.brand.soft", borderColor: "$color.border.brand", fg: "$color.text.onBrandSoft" },
        hover: { bg: "$color.background.hover", borderColor: "$color.border.muted" },
        "hover+on": { bg: "$color.background.brand.softHover", borderColor: "$color.border.brand" },
        pressed: { bg: "$color.background.selected" },
        "pressed+on": { bg: "$color.background.brand.softHover" },
        focus: { shadow: "$elevation.shadow.focus" },
        disabled: { opacity: "$opacity.disabled" },
      },
      platforms: {
        mobile: {
          base: { height: "none", paddingX: "$space.sm", radius: "$radius.pill", size: "$font.size.bodySm", line: "$font.size.bodySm" },
          variants: { variant: { add: { paddingX: "$space.xs" } } },
        },
      },
    },
    emoji: { base: { size: "$font.size.bodySm" }, platforms: { mobile: { base: { line: "$font.size.bodySm" } } } },
    icon: { base: { square: "$size.icon.md" } },
  },
});
