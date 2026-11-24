import { defineRecipe } from "../../recipe";

/**
 * RadioGroup. Written from the React kit's table; the `list` rows and the `pills` are two sets of parts (the phone draws only the list).
 * `on` is "this option is the chosen one". The phone's larger legend, label and description are a deliberate platform idiom (owner decision 2026-11-03),
 * kept in `platforms.mobile`; the ring's edge, the chosen label's emphasis and the weights and inks are the web's (item 43).
 *
 * `cards` is a third set of parts: each option is a card (`card`) with an optional picture on top (`cardPreview`), its label and tags in a row
 * (`cardHead`, `cardLabel`, `cardTags`) and its description (`cardDescription`). The chosen card takes a 2px edge in the strong ink (a hairline
 * border plus an inset ring of the same colour, so nothing shifts), never the brand: the edge is the choice, so the card draws no ring and dot.
 * Web and desktop lay the cards out in as many columns of at least `radioGroup.cardMinWidth` as fit (the kit's grid reads it); the phone stacks them.
 */
export const radioGroup = defineRecipe({
  parts: ["root", "legend", "options", "option", "ring", "dot", "label", "description", "pill", "card", "cardPreview", "cardHead", "cardLabel", "cardTags", "cardDescription"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.family.sans" }, platforms: { mobile: { base: { gap: "$space.sm" } } } }, // idiom: one step larger
    legend: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.body" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" } } }, // idiom: one step larger
    },
    // Only the pills' wrapper carries tokens: the list's rows sit one `space.3xs` apart (the kit's layout).
    options: { variants: { appearance: { list: {}, pills: { gap: "$choice.pillGap", minHeight: "$size.control.input" }, cards: { gap: "$space.sm" } } } },
    option: { base: { gap: "$choice.gap", paddingY: "$choice.paddingY" }, states: { disabled: { opacity: "$opacity.disabled" } } },
    ring: {
      base: { square: "$choice.ringSize", marginTop: "$choice.ringOffsetY", radius: "$radius.circle", borderWidth: "$choice.ringWidth", borderColor: "$color.border.default" },
      // Hover darkens an empty ring's edge and deepens the coral of the chosen one; the phone has no hover.
      states: { on: { borderColor: "$color.background.brand.default" }, hover: { borderColor: "$color.text.faint" }, "hover+on": { borderColor: "$color.background.brand.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    dot: { base: { square: "$choice.dotSize", radius: "$radius.circle", bg: "$color.background.brand.default" } },
    label: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal", fg: "$color.text.body" },
      states: { on: { weight: "$font.weight.semibold", fg: "$color.text.strong" } },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } }, // idiom: one step larger
    },
    description: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } }, // idiom: one step larger
    },
    pill: {
      on: ["web", "desktop"],
      base: {
        height: "$size.control.input",
        paddingX: "$space.mdLg",
        radius: "$radius.pill",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        bg: "$color.background.card",
        fg: "$color.text.muted",
        size: "$font.size.caption",
        weight: "$font.weight.semibold",
      },
      // Only an unchosen pill takes the hover fill: the kit does not turn `hover` on for the chosen one.
      states: {
        on: { borderColor: "$color.border.selected", bg: "$color.background.inverse", fg: "$color.text.onInverse" },
        hover: { bg: "$color.background.hover" },
        focus: { shadow: "$elevation.shadow.focus" },
        disabled: { opacity: "$opacity.disabled" },
      },
    },
    card: {
      base: {
        gap: "$space.sm",
        padding: "$space.md",
        radius: "$radius.card",
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
      },
      // Hover darkens the edge of an unchosen card; the chosen card's edge is the strong ink at 2px (listed after hover, so it wins).
      states: {
        hover: { borderColor: "$color.border.default" },
        on: { borderColor: "$color.text.strong", ring: "$color.text.strong" },
        focus: { shadow: "$elevation.shadow.focus" },
        disabled: { opacity: "$opacity.disabled" },
      },
    },
    cardPreview: { base: { radius: "$radius.control" } },
    cardHead: { base: { gap: "$space.xs" } },
    cardLabel: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold", fg: "$color.text.strong" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } }, // idiom: one step larger
    },
    cardTags: { base: { gap: "$space.2xs" } },
    cardDescription: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } }, // idiom: one step larger
    },
  },
  // The phone grows the touch area to this (`hitSlopTo`); nothing is drawn with it. The web's cards are laid out in columns of at least
  // `radioGroup.cardMinWidth` (a grid template, which the recipe's vocabulary cannot say).
  reads: ["$size.target.min", "$radioGroup.cardMinWidth"],
});
