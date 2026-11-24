import { defineRecipe } from "../../recipe";

/**
 * ThinkingIndicator. An agent's turn in flight: a three-by-three coral lattice in the avatar's column (`mark`, `cell`), a word that
 * changes every few seconds (`word`), how long it has been (`clock`), and, once it has run a tool, a caret (`chevron`) that folds its
 * steps (`trace`, an AgentSteps) in and out. The word's `on` is reduced motion: it stops shimmering and steps back to muted.
 * The mark's column is the avatar's less the head gap, so the answer's avatar lands where the mark was; the phone's is narrower.
 */
export const thinkingIndicator = defineRecipe({
  parts: ["root", "head", "mark", "cell", "word", "clock", "toggle", "chevron", "trace"],
  styles: {
    root: { base: { maxWidth: "$thinkingIndicator.maxWidth", font: "$font.family.sans" } },
    head: { base: { gap: "$space.sm" } },
    mark: { base: { width: "$thinkingIndicator.markWidth" } },
    cell: { base: { square: "$thinkingIndicator.cellSize", radius: "$thinkingIndicator.cellRadius", bg: "$color.background.brand.default" } },
    word: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.medium", fg: "$color.text.body" },
      states: { on: { fg: "$color.text.muted" } },
    },
    clock: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint", weight: "$font.weight.normal" } },
    toggle: { base: { radius: "$radius.row" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    chevron: { base: { square: "$size.icon.default", fg: "$color.text.faint" }, platforms: { mobile: { base: { square: "$size.icon.md" } } } },
    trace: { base: { paddingTop: "$space.sm" } },
  },
});
