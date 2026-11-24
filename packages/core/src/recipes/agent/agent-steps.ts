import { defineRecipe } from "../../recipe";

/**
 * AgentSteps. The tools an agent has run this turn, newest last: a state marker, the step's label and where it ran (`source`).
 * A running step's label is the body ink (`label` with `on`); a finished or failed one steps back to muted. The marker is a
 * pulsing coral dot while running, a tick when done and a cross when it failed (the cross one step darker than the tick).
 * The phone sets its rows closer: its 4pt grid against the desktop's 6.
 */
export const agentSteps = defineRecipe({
  parts: ["root", "more", "row", "marker", "dot", "done", "failed", "label", "source"],
  styles: {
    root: {
      base: { gap: "$space.xs", font: "$font.family.sans", size: "$font.size.caption", line: "$font.lineHeight.caption" },
      platforms: { mobile: { base: { gap: "$space.2xs" } } },
    },
    more: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint", weight: "$font.weight.normal" } },
    row: { base: { gap: "$space.sm" } },
    marker: { base: { square: "$agentSteps.markerSize" } },
    dot: { base: { square: "$size.dot.sm", radius: "$radius.circle", bg: "$color.background.brand.default" } },
    done: { base: { square: "$agentSteps.iconSize", fg: "$color.text.faint" } },
    failed: { base: { square: "$agentSteps.iconSize", fg: "$color.text.muted" } },
    label: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted", weight: "$font.weight.normal" },
      states: { on: { fg: "$color.text.body" } },
    },
    source: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint", weight: "$font.weight.normal" } },
  },
});
