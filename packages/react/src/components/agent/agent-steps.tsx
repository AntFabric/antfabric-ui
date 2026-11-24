import type { CSSProperties } from "react";
import { recipes, useStrings, type AgentStep, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, row, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export interface AgentStepsProps extends RootProps<HTMLDivElement> {
  /** Every step this turn has taken, oldest first. */
  steps?: AgentStep[];
  /** How many of the newest to draw; the rest are counted. 0 is the platform's own: 5 on web and desktop. */
  max?: number;
  /** This list's built-in text (its name, "+N earlier", "via …", the markers' names) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["agent-steps"]>;
  /** Per-part styles over the theme: `{ root: {…}, label: {…} }`. */
  styles?: PartStyles<"agent-steps">;
  style?: CSSProperties;
}

/** The newest `max` steps and how many were left out. Never drops a step silently. */
function visibleSteps(steps: AgentStep[], max: number): { shown: AgentStep[]; hidden: number } {
  const cap = Math.max(0, Math.floor(max));
  if (cap === 0) return { shown: [], hidden: steps.length };
  if (steps.length <= cap) return { shown: steps, hidden: 0 };
  return { shown: steps.slice(-cap), hidden: steps.length - cap };
}

function Step({ step, strings, styles }: { step: AgentStep; strings: AgentStepsProps["strings"]; styles: AgentStepsProps["styles"] }) {
  const s = useStrings("agent-steps", strings);
  const running = step.state === "running";
  const r = useRecipe(recipes["agent-steps"], { state: { on: running }, styles });
  return (
    <div role="listitem" data-af-part="row" style={css(row, { minWidth: 0 }, partStyle(r, "row", enter("rise")))}>
      <span role="img" aria-label={s(step.state === "running" ? "running" : step.state === "done" ? "done" : "failed")} data-af-part="marker" style={css(row, { flex: "none", justifyContent: "center", overflow: "visible" }, r.marker)}>
        {running && <span data-af-part="dot" style={partStyle(r, "dot", { animation: `af-step-pulse 1.6s ${t.motion.easing.standard} infinite` })} />}
        {step.state === "done" && <Icon part="done" name="check" size={r.done.width} color={r.done.color} style={r.done} />}
        {step.state === "failed" && <Icon part="failed" name="x" size={r.failed.width} color={r.failed.color} style={r.failed} />}
      </span>
      {/* Labels and sources are text a server named, never Markdown. */}
      <span title={step.label} data-af-part="label" style={css(text, { flexShrink: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, r.label)}>
        {step.label}
      </span>
      {step.source && (
        <span title={step.source} data-af-part="source" style={css(text, { flexShrink: 0, whiteSpace: "nowrap" }, r.source)}>
          {s.parts("via", { source: step.source })}
        </span>
      )}
    </div>
  );
}

export function AgentSteps({ steps = [], max = 0, strings, styles, style, ...rest }: AgentStepsProps) {
  const s = useStrings("agent-steps", strings);
  const r = useRecipe(recipes["agent-steps"], { styles });
  const { shown, hidden } = visibleSteps(steps, max > 0 ? max : 5);
  if (steps.length === 0) return null;
  return (
    <div role="list" aria-label={s("label")} data-af-part="root" {...rootProps(rest)} style={css(box, r.root, style)}>
      {hidden > 0 && (
        <span role="listitem" data-af-part="more" style={css(text, r.more)}>
          {s.parts("earlier", { count: hidden })}
        </span>
      )}
      {shown.map((st) => (
        <Step key={st.key} step={st} strings={strings} styles={styles} />
      ))}
    </div>
  );
}
