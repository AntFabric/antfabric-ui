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
      base: { font: "$font.sans" },
      variants: { compact: { false: { paddingX: "$space.2xl" } } },
      platforms: { mobile: { base: { gap: "$space.md", paddingX: "$space.lg", paddingY: "$space.5xl" } } },
    },
    disc: { base: { radius: "$radius.circle", bg: "$surface.muted", fg: "$fg.faint" } },
    discIcon: { base: { square: "$icon.sizeLg" } },
    title: {
      base: { weight: "$font.weightBold", tracking: "$tracking.tight", fg: "$fg.strong" },
      variants: { compact: { true: { size: "$text.bodySm", line: "$text.bodySmLine" }, false: { size: "$text.body", line: "$text.bodyLine" } } },
      platforms: { mobile: { base: { size: "$text.lead", line: "$text.leadLine" } } }, // idiom: one step larger
    },
    line: {
      base: { size: "$text.caption", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } }, // idiom: one step larger
    },
    frame: { base: { bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.card" } },
    card: { base: { bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.card" } },
    inset: { base: { bg: "$surface.recessed" } },
    dot: { base: { radius: "$radius.circle", bg: "$border.muted" } },
    bar: { base: { bg: "$border.subtle" } },
    barStrong: { base: { bg: "$border.muted" } },
    barOnAccent: { base: { bg: "$surface.card" } },
    face: { base: { radius: "$radius.circle", bg: "$surface.recessed", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
    bubble: { base: { bg: "$fg.faint", shadow: "$shadow.card" } },
    tick: { base: { bg: "$fg.faint" } },
    box: { base: { bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.muted" } },
    accentDot: { base: { radius: "$radius.circle", bg: "$fg.faint" } },
    lineDot: { base: { radius: "$radius.circle", bg: "$border.muted" } },
    rule: { base: { bg: "$border.subtle" } },
    edge: { base: { bg: "$fg.faint" } },
    // The page-corner fold: the web clips a square to a triangle; the phone draws a triangle from two borders, in this colour.
    fold: { base: { bg: "$fg.faint" } },
    tag: { base: { bg: "$fg.faint" } },
  },
});
