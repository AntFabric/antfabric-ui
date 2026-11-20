import type { CSSProperties } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { fmt, type FormatWords } from "@antfabric-ui/core/chart";
import { type RootProps, rootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, text } from "../../lib/style";
import { rechartsMotion, useChartTokens, useReducedMotion } from "../../data/theme";

export type ProgressRingTone = "default" | "positive" | "negative" | "warning";

export interface ProgressRingProps extends RootProps<HTMLSpanElement> {
  /** What is done, in the same unit as `max`. */
  value: number;
  /** The goal: 1 when the value is already a share. */
  max?: number;
  /** Px. Default 56 on the web and desktop, 48 on the phone. */
  size?: number;
  /** The stroke's width, px. 0 is 12% of the size, at least 5. */
  thickness?: number;
  /** The hue: the first series colour, or the data palette's gain, loss or caution. */
  tone?: ProgressRingTone;
  /** The text in the middle. Empty is the share, `58%`. */
  center?: string;
  /** Draws in once when it mounts. Off by default. */
  animate?: boolean;
  /** The ring's name, for a screen reader. Default: the text in the middle if there is one, then the share of the goal. The share is the ring's spoken value either way. */
  label?: string;
  /** Per-part styles over the theme: `{ root: {…}, center: {…} }`. */
  styles?: PartStyles<"progress-ring">;
  /** The built-in text, by key: what a screen reader hears by default, and the dash in the middle for a value that is not a number. */
  strings?: Partial<KitStrings["progress-ring"]>;
  style?: CSSProperties;
}

/* The stroke is this share of the ring's size, with a floor of `kpi.ringMinW`. */
const STROKE = 0.12;

export function ProgressRing({ value, max = 1, size, thickness = 0, tone = "default", center = "", animate = false, label, styles, strings, style, ...rest }: ProgressRingProps) {
  const t = useChartTokens();
  const r = useRecipe(recipes["progress-ring"], { styles });
  const s = useStrings("progress-ring", strings);
  const formatWords: FormatWords = { unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const reduced = useReducedMotion();
  const diameter = size ?? t.kpi.ringSize;
  const known = Number.isFinite(value) && Number.isFinite(max) && max > 0;
  const share = known ? Math.min(1, Math.max(0, value / max)) : 0;
  const color = tone === "positive" ? t.data.positive : tone === "negative" ? t.data.negative : tone === "warning" ? t.data.warning : t.chart.series1;
  const stroke = thickness || Math.max(t.kpi.ringMinW, Math.round(diameter * STROKE));
  const outer = diameter / 2;
  const inner = outer - stroke;
  const percent = known ? fmt({ type: "percent", digits: 0 }, share, formatWords, locale) : s("unavailable");
  // What the ring reads as: its own text in the middle and the share, so "455" is not lost behind a bare percentage.
  const spoken = known ? (center ? s("ofGoalCenter", { center, percent: fmt("percent", share, formatWords, locale) }) : s("ofGoal", { percent: fmt("percent", share, formatWords, locale) })) : s("progressUnavailable");
  return (
    <span
      data-af-part="root"
      {...rootProps(rest)}
      role="progressbar"
      aria-label={label || spoken}
      aria-valuemin={known ? 0 : undefined}
      aria-valuemax={known ? max : undefined}
      aria-valuenow={known ? Math.min(max, Math.max(0, value)) : undefined}
      aria-valuetext={known ? spoken : undefined}
      style={css(partStyle(r, "root", { display: "inline-block", position: "relative", flexShrink: 0, width: diameter, height: diameter }), style)}
    >
      <PieChart accessibilityLayer={false} width={diameter} height={diameter} style={{ display: "block" }}>
        {/* The track: a whole ring under the value's, so the round ends of the value sit on it. */}
        <Pie data={[{ v: 1 }]} dataKey="v" cx="50%" cy="50%" innerRadius={inner} outerRadius={outer} stroke="none" isAnimationActive={false} tooltipType="none" rootTabIndex={-1}>
          <Cell fill={t.chart.track} />
        </Pie>
        <Pie data={[{ v: share }, { v: 1 - share }]} dataKey="v" cx="50%" cy="50%" innerRadius={inner} outerRadius={outer} startAngle={90} endAngle={-270} cornerRadius={stroke / 2} stroke="none" tooltipType="none" rootTabIndex={-1} {...rechartsMotion(animate, reduced)}>
          <Cell fill={share > 0 ? color : "none"} />
          <Cell fill="none" />
        </Pie>
      </PieChart>
      <span data-af-part="center" style={css(text, { position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", fontVariantNumeric: "tabular-nums", fontFamily: t.chart.font }, r.center)}>
        {center || percent}
      </span>
    </span>
  );
}
