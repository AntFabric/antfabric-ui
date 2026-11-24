import { defineRecipe } from "../../recipe";

/**
 * EmptyState. The drawing's parts (`frame`, `card`, `bar`…) are named as in `art.ts`, which keeps their geometry (positions, radii, the
 * dot's side, the fold's legs); the recipe is how each one is painted. The phone paints them the same.
 * The title and line are one step up on the phone (its idiom: `lead` over `body`, `bodySm` over `caption`); the title's weight and tracking and
 * the line's ink are the web's (item 43). The phone's inset is its own, and `compact` is the web's alone.
 * Where only one axis of padding is a token the recipe carries it (the web's `paddingInline`); the web's block padding is a literal.
 */
export const emptyState = defineRecipe({
  parts: [
    "root",
    "disc",
    "discIcon",
    "title",
    "line",
    "frame",
    "card",
    "inset",
    "dot",
    "bar",
    "barStrong",
    "barOnAccent",
    "face",
    "bubble",
    "tick",
    "box",
    "accentDot",
    "lineDot",
    "rule",
    "edge",
    "fold",
    "tag",
  ],
  styles: {
    root: {
      base: { font: "$font.family.sans" },
      variants: { compact: { false: { paddingX: "$space.2xl" } } },
      platforms: { mobile: { base: { gap: "$space.md", paddingX: "$space.lg", paddingY: "$space.5xl" } } },
    },
    disc: { base: { radius: "$radius.circle", bg: "$color.background.muted", fg: "$color.text.faint" } },
    discIcon: { base: { square: "$size.icon.lg" } },
    title: {
      base: { weight: "$font.weight.bold", tracking: "$font.letterSpacing.tight", fg: "$color.text.strong" },
      variants: { compact: { true: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" }, false: { size: "$font.size.body", line: "$font.lineHeight.body" } } },
      platforms: { mobile: { base: { size: "$font.size.lead", line: "$font.lineHeight.lead" } } }, // idiom: one step larger
    },
    line: {
      base: { size: "$font.size.caption", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } }, // idiom: one step larger
    },
    frame: { base: { bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.card" } },
    card: { base: { bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.card" } },
    inset: { base: { bg: "$color.background.recessed" } },
    dot: { base: { radius: "$radius.circle", bg: "$color.border.muted" } },
    bar: { base: { bg: "$color.border.subtle" } },
    barStrong: { base: { bg: "$color.border.muted" } },
    barOnAccent: { base: { bg: "$color.background.card" } },
    face: { base: { radius: "$radius.circle", bg: "$color.background.recessed", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" } },
    bubble: { base: { bg: "$color.text.faint", shadow: "$elevation.shadow.card" } },
    tick: { base: { bg: "$color.text.faint" } },
    box: { base: { bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.muted" } },
    accentDot: { base: { radius: "$radius.circle", bg: "$color.text.faint" } },
    lineDot: { base: { radius: "$radius.circle", bg: "$color.border.muted" } },
    rule: { base: { bg: "$color.border.subtle" } },
    edge: { base: { bg: "$color.text.faint" } },
    // The page-corner fold: the web clips a square to a triangle; the phone draws a triangle from two borders, in this colour.
    fold: { base: { bg: "$color.text.faint" } },
    tag: { base: { bg: "$color.text.faint" } },
  },
});
