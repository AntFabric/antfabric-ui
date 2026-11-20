import { defineRecipe } from "../../recipe";

/**
 * RadioGroup. Written from the React kit's table; the `list` rows and the `pills` are two sets of parts (the phone draws only the list).
 * `on` is "this option is the chosen one". The phone's larger legend, label and description are a deliberate platform idiom (owner decision 2026-11-03),
 * kept in `platforms.mobile`; the ring's edge, the chosen label's emphasis and the weights and inks are the web's (item 43).
 *
 * `cards` is a third set of parts: each option is a card (`card`) with an optional picture on top (`cardPreview`), its label and tags in a row
 * (`cardHead`, `cardLabel`, `cardTags`) and its description (`cardDescription`). The chosen card takes a 2px edge in the strong ink (a hairline
 * border plus an inset ring of the same colour, so nothing shifts), never the brand: the edge is the choice, so the card draws no ring and dot.
 * Web and desktop lay the cards out in as many columns of at least `radioGroup.cardMinW` as fit (the kit's grid reads it); the phone stacks them.
 */
export const radioGroup = defineRecipe({
  parts: ["root", "legend", "options", "option", "ring", "dot", "label", "description", "pill", "card", "cardPreview", "cardHead", "cardLabel", "cardTags", "cardDescription"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.sans" }, platforms: { mobile: { base: { gap: "$space.sm" } } } }, // idiom: one step larger
    legend: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.body" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine" } } }, // idiom: one step larger
    },
    // Only the pills' wrapper carries tokens: the list's rows sit one `space.3xs` apart (the kit's layout).
    options: { variants: { appearance: { list: {}, pills: { gap: "$choice.pillGap", minHeight: "$control.hInput" }, cards: { gap: "$space.sm" } } } },
    option: { base: { gap: "$choice.gap", paddingY: "$choice.padY" }, states: { disabled: { opacity: "$opacity.disabled" } } },
    ring: {
      base: { square: "$choice.ringSize", marginTop: "$choice.ringNudge", radius: "$radius.circle", borderWidth: "$choice.ringW", borderColor: "$border.default" },
      // Hover darkens an empty ring's edge and deepens the coral of the chosen one; the phone has no hover.
      states: { on: { borderColor: "$brand.default" }, hover: { borderColor: "$fg.faint" }, "hover+on": { borderColor: "$brand.hover" }, focus: { shadow: "$shadow.focus" } },
    },
    dot: { base: { square: "$choice.dotSize", radius: "$radius.circle", bg: "$brand.default" } },
    label: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal", fg: "$fg.body" },
      states: { on: { weight: "$font.weightSemibold", fg: "$fg.strong" } },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } }, // idiom: one step larger
    },
    description: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } }, // idiom: one step larger
    },
    pill: {
      on: ["web", "desktop"],
      base: {
        height: "$control.hInput",
        paddingX: "$space.mdLg",
        radius: "$radius.pill",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        bg: "$surface.card",
        fg: "$fg.muted",
        size: "$text.caption",
        weight: "$font.weightSemibold",
      },
      // Only an unchosen pill takes the hover fill: the kit does not turn `hover` on for the chosen one.
      states: {
        on: { borderColor: "$border.active", bg: "$surface.inverse", fg: "$fg.onInverse" },
        hover: { bg: "$hover.surface" },
        focus: { shadow: "$shadow.focus" },
        disabled: { opacity: "$opacity.disabled" },
      },
    },
    card: {
      base: {
        gap: "$space.sm",
        padding: "$space.md",
        radius: "$radius.card",
        bg: "$surface.card",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
      },
      // Hover darkens the edge of an unchosen card; the chosen card's edge is the strong ink at 2px (listed after hover, so it wins).
      states: {
        hover: { borderColor: "$border.default" },
        on: { borderColor: "$fg.strong", ring: "$fg.strong" },
        focus: { shadow: "$shadow.focus" },
        disabled: { opacity: "$opacity.disabled" },
      },
    },
    cardPreview: { base: { radius: "$radius.control" } },
    cardHead: { base: { gap: "$space.xs" } },
    cardLabel: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold", fg: "$fg.strong" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } }, // idiom: one step larger
    },
    cardTags: { base: { gap: "$space.2xs" } },
    cardDescription: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } }, // idiom: one step larger
    },
  },
  // The phone grows the touch area to this (`hitSlopTo`); nothing is drawn with it. The web's cards are laid out in columns of at least
  // `radioGroup.cardMinW` (a grid template, which the recipe's vocabulary cannot say).
  reads: ["$control.hit", "$radioGroup.cardMinW"],
});
