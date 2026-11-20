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
    root: { base: { maxWidth: "$thinking.maxW", font: "$font.sans" } },
    head: { base: { gap: "$space.sm" } },
    mark: { base: { width: "$thinking.markW" } },
    cell: { base: { square: "$thinking.cell", radius: "$thinking.cellRadius", bg: "$brand.default" } },
    word: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightMedium", fg: "$fg.body" },
      states: { on: { fg: "$fg.muted" } },
    },
    clock: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint", weight: "$font.weightNormal" } },
    toggle: { base: { radius: "$radius.row" }, states: { focus: { shadow: "$shadow.focus" } } },
    chevron: { base: { square: "$icon.size", fg: "$fg.faint" }, platforms: { mobile: { base: { square: "$icon.sizeMd" } } } },
    trace: { base: { paddingTop: "$space.sm" } },
  },
});
