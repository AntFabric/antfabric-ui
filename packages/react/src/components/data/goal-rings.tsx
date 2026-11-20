import { useState, type CSSProperties } from "react";
import { type RootProps, rootProps } from "../../lib/root-props";
import { Cell, Pie, PieChart } from "recharts";
import { recipes, useLocale, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { DIMMED, fmt, goalsOf, overallOf, ringBands, seriesColors, summarizeGoals, type FormatSpec, type Goal, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, pressable, row, text } from "../../lib/style";
import { ChartCard } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { rechartsDraw, useChartTokens, useReducedMotion } from "../../data/theme";
import { MetricValue } from "./metric-value";

export interface GoalRingsProps extends RootProps<HTMLDivElement> {
  /** Rows, one per goal, in order (the first three are drawn): [{ goal: "Tickets resolved", done: 455, target: 600 }, …]. The same rows can feed a table. */
  data: Row[];
  /** The field of each row that names its goal. */
  name: string;
  /** The field of each row that is what is done. */
  value: string;
  /** The field of each row that is its target. A target of 0, or one that is not a number, is no goal: the ring is its empty track. */
  goal: string;
  /** The card's title. It names the figure too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A format name, its options, or a function: what core's `fmt` takes. What is done, the target and what is left print through it. */
  format?: FormatSpec;
  /** The done column's name in "View as table". */
  valueLabel?: string;
  /** The target column's name in "View as table". */
  goalLabel?: string;
  /** What the middle says above the overall share: "Completed". It says "This goal" while a goal is lit. */
  centerLabel?: string;
  /** The goal that is picked, by its name: the middle shows its share and the other rings step back. Pointing at a goal or tabbing to it lights it too, for as long as the pointer or the keyboard is there. Left out, the chart keeps its own, starting with none. */
  selected?: string | null;
  /** Called with the picked goal's name, or null when it is picked again. */
  onSelectedChange?: (selected: string | null) => void;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey bars in place of the rings, and no "View as table". */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"goal-rings">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["goal-rings"]>;
  /** The card title's heading level, 1 to 6, so the chart keeps the page's heading order. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: CSSProperties;
}

/** The percent the middle and the list print: whole numbers. */
const WHOLE = { type: "percent", digits: 0 } as const;

interface GoalItemProps {
  goal: Goal;
  color: string;
  format?: FormatSpec;
  /** Another goal is lit, so this one steps back. */
  dim: boolean;
  /** This goal is the one that is picked. */
  picked: boolean;
  onPick: () => void;
  onHot: (hot: boolean) => void;
  styles?: PartStyles<"goal-rings">;
  strings?: Partial<KitStrings["goal-rings"]>;
}

/** One goal in the list: its colour and name, what is done of the target, and what is left. Pointing at it or tabbing to it lights its ring, and pressing it picks it. */
function GoalItem({ goal, color, format, dim, picked, onPick, onHot, styles, strings }: GoalItemProps) {
  const locale = useLocale();
  const str = useStrings("goal-rings", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const tk = useChartTokens();
  // Hover and focus come from the hook, never from `:hover`: the catalogue forces them for its snapshots.
  const ui = useInteraction();
  const r = useRecipe(recipes["goal-rings"], { state: { focus: ui.focused }, styles });
  const left = !goal.known ? str("noGoal") : goal.met ? str("goalMet") : str("toGo", { value: fmt(format, goal.left, formatWords, locale) });
  const lead = `calc(${t.space.smMd} + ${t.space.sm})`;
  return (
    <li style={{ display: "block", margin: 0, padding: 0 }}>
      <button
        type="button"
        data-af-press
        data-af-part="goal"
        aria-pressed={picked}
        aria-label={goal.known ? str("goalSummary", { label: goal.label, done: fmt(format, goal.done, formatWords, locale), target: fmt(format, goal.target, formatWords, locale), left }) : str("goalUnknown", { label: goal.label, left })}
        onClick={() => onPick()}
        {...ui.handlers}
        onPointerEnter={() => {
          ui.handlers.onPointerEnter();
          onHot(true);
        }}
        onPointerLeave={() => {
          ui.handlers.onPointerLeave();
          onHot(false);
        }}
        onFocus={(e) => {
          ui.handlers.onFocus(e);
          onHot(true);
        }}
        onBlur={() => {
          ui.handlers.onBlur();
          onHot(false);
        }}
        style={css(pressable, partStyle(r, "goal", { alignSelf: "stretch", textAlign: "left", fontFamily: tk.chart.font, opacity: dim ? DIMMED : 1, transition: `opacity ${t.duration.base} ${t.ease.out}` }))}
      >
        <span data-af-part="goalHead" style={css(row, r.goalHead)}>
          <span aria-hidden data-af-part="swatch" style={partStyle(r, "swatch", { flexShrink: 0, background: color })} />
          <span data-af-part="label" style={css(text, { flex: 1 }, r.label)}>{goal.label}</span>
        </span>
        {/* The number leads under its name: what is done, large, then the target and what is left, quieter. */}
        <span style={css(row, { flexWrap: "wrap", alignItems: "baseline", columnGap: t.space.sm, paddingLeft: lead })}>
          {goal.known ? (
            <span data-af-part="of" style={css(text, { fontVariantNumeric: "tabular-nums" }, r.of)}>
              <b data-af-part="done" style={css({ fontWeight: t.font.weightSemibold }, r.done)}>{fmt(format, goal.done, formatWords, locale)}</b> / {fmt(format, goal.target, formatWords, locale)}
            </span>
          ) : null}
          <span data-af-part="left" style={css(text, r.left)}>{left}</span>
        </span>
      </button>
    </li>
  );
}

export function GoalRings({ data, name, value, goal, title, subtitle = "", format = "integer", valueLabel, goalLabel, centerLabel, selected, onSelectedChange, empty, emptyLine, loading = false, styles, strings, headingLevel, style, ...rest }: GoalRingsProps) {
  const str = useStrings("goal-rings", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const r = useRecipe(recipes["goal-rings"], { styles });
  const goals = goalsOf(data, name, value, goal);
  const palette = seriesColors(tk);
  const size = tk.chart.ringSize;
  const bands = ringBands(size, tk.chart.ringW, tk.chart.ringGap, goals.length);
  // The goal that is lit: the one under the pointer or the keyboard, else the one that was picked. The others step back, and the middle shows its own share.
  const [picked, setPicked] = useControllable(selected, onSelectedChange);
  const [hot, setHot] = useState<number | null>(null);
  const pickedAt = picked == null ? -1 : goals.findIndex((g) => g.label === picked);
  const at = hot ?? (pickedAt >= 0 ? pickedAt : null);
  const lit = at !== null ? (goals[at] ?? null) : null;
  const pick = (k: number) => {
    const next = goals[k]?.label;
    if (next !== undefined) setPicked(picked === next ? null : next);
  };
  const summary = summarizeGoals({ label: title, goals, format, formatWords, locale }, {
    noGoals: (v) => str("summaryNoGoals", v),
    goal: (v) => str("summaryGoal", v),
    noGoal: (v) => str("summaryNoGoal", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  });
  const dimmed = (k: number) => at !== null && at !== k;
  return (
    <ChartCard
      headingLevel={headingLevel}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      table={!loading && data.length ? { data, x: name, y: [value, goal], format, labels: { [value]: valueLabel ?? str("valueLabel"), [goal]: goalLabel ?? str("goalLabel") } } : null}
      style={style}
    >
      <ChartFrame height={size} grow label={loading ? str("loading", { title }) : summary} loading={loading} empty={goals.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) => {
          // The list drops under the rings when the card is too narrow for both.
          const stacked = width < size + tk.space["2xl"] + tk.chart.listMinW;
          return (
            <div data-af-part="plot" data-af-plot style={css(box, r.plot)}>
              <div data-af-part="rings" style={css(row, { flexDirection: stacked ? "column" : "row", alignItems: stacked ? "stretch" : "center" }, r.rings)}>
                <div data-af-part="ring" style={css(box, { flexShrink: 0, alignSelf: stacked ? "center" : "auto" }, r.ring)}>
                  <PieChart accessibilityLayer={false} width={size} height={size} style={{ display: "block" }}>
                    {/* A whole ring under each value's, so the round ends of the value sit on it. */}
                    {goals.map((g, k) => (
                      <Pie key={`track-${g.label}`} data={[{ v: 1 }]} dataKey="v" cx="50%" cy="50%" innerRadius={bands[k]!.inner} outerRadius={bands[k]!.outer} stroke="none" isAnimationActive={false} tooltipType="none" rootTabIndex={-1}>
                        <Cell fill={tk.chart.track} />
                      </Pie>
                    ))}
                    {goals.map((g, k) => (
                      <Pie
                        key={g.label}
                        data={[{ v: g.ratio }, { v: 1 - g.ratio }]}
                        dataKey="v"
                        cx="50%"
                        cy="50%"
                        innerRadius={bands[k]!.inner}
                        outerRadius={bands[k]!.outer}
                        startAngle={90}
                        endAngle={-270}
                        cornerRadius={tk.chart.ringW / 2}
                        stroke="none"
                        tooltipType="none"
                        rootTabIndex={-1}
                        {...rechartsDraw(tk, reduced)}
                        onMouseEnter={() => setHot(k)}
                        onMouseLeave={() => setHot((h) => (h === k ? null : h))}
                        onClick={() => pick(k)}
                      >
                        <Cell fill={g.ratio > 0 ? palette[k % palette.length]! : "transparent"} fillOpacity={dimmed(k) ? DIMMED : 1} style={{ cursor: "pointer", outline: "none", transition: `fill-opacity ${t.duration.base} ${t.ease.out}` }} />
                        <Cell fill="transparent" />
                      </Pie>
                    ))}
                  </PieChart>
                  <div aria-hidden data-af-part="center" style={css(box, { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", pointerEvents: "none", textAlign: "center" }, r.center)}>
                    <span data-af-part="centerLabel" style={css(text, { fontFamily: tk.chart.font }, r.centerLabel)}>{lit ? str("thisGoal") : (centerLabel ?? str("centerLabel"))}</span>
                    <MetricValue value={lit ? lit.ratio : overallOf(goals)} format={WHOLE} size="md" />
                  </div>
                </div>
                <ul data-af-part="list" aria-label={str("goals")} style={css(box, { listStyle: "none", margin: 0, padding: 0, flex: 1, alignSelf: "stretch", justifyContent: "center" }, r.list)}>
                  {goals.map((g, k) => (
                    <GoalItem key={g.label} goal={g} color={palette[k % palette.length]!} format={format} dim={dimmed(k)} picked={pickedAt === k} onPick={() => pick(k)} onHot={(isHot) => setHot((h) => (isHot ? k : h === k ? null : h))} styles={styles} strings={strings} />
                  ))}
                </ul>
              </div>
            </div>
          );
        }}
      </ChartFrame>
    </ChartCard>
  );
}
