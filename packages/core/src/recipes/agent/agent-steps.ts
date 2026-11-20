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
      base: { gap: "$space.xs", font: "$font.sans", size: "$text.caption", line: "$text.captionLine" },
      platforms: { mobile: { base: { gap: "$space.2xs" } } },
    },
    more: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint", weight: "$font.weightNormal" } },
    row: { base: { gap: "$space.sm" } },
    marker: { base: { square: "$agentSteps.marker" } },
    dot: { base: { square: "$dot.sizeSm", radius: "$radius.circle", bg: "$brand.default" } },
    done: { base: { square: "$agentSteps.icon", fg: "$fg.faint" } },
    failed: { base: { square: "$agentSteps.icon", fg: "$fg.muted" } },
    label: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted", weight: "$font.weightNormal" },
      states: { on: { fg: "$fg.body" } },
    },
    source: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint", weight: "$font.weightNormal" } },
  },
});
