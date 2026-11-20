import type { CSSProperties } from "react";
import { type RootProps, rootProps } from "../../lib/root-props";
import { Cell, Pie, PieChart } from "recharts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { GAUGE_GAP_DEG, GAUGE_HOLE, fmt, gaugeState, onHalfRing, summarizeGauge, type FormatSpec, type MeterKind, type MeterThresholds, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, row, text } from "../../lib/style";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { rechartsDraw, useChartTokens, useReducedMotion } from "../../data/theme";
import { MetricValue } from "./metric-value";

export type { ChartHeadline, MeterKind, MeterThresholds };

export interface GaugeChartProps extends RootProps<HTMLDivElement> {
  /** What there is, in the same unit as `max`. */
  value: number;
  /** What a full ring is: 1 when the value is already a share. */
  max?: number;
  /** Where the tick sits, in the value's unit: the goal the value is measured against. Left out, there is no tick. */
  target?: number;
  /** The card's title. It names the figure too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** What the value is of, under it in the hole: "of resolved tickets". */
  label?: string;
  /** `score` (a goal, a health rating) is fine while high; `usage` (seats, storage, a quota) is fine while low. Meter's two kinds. */
  kind?: MeterKind;
  /** The shares of `max` where the fill turns to the caution colour and then the loss colour. Default Meter's for the kind. */
  thresholds?: MeterThresholds;
  /** A format name, its options, or a function: what core's `fmt` takes. The value, the target, the ends, the summary and the table print through it. */
  format?: FormatSpec;
  /** The half ring's width; its height is half. */
  size?: number;
  /** The title of the empty state when the value is not a number. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey bars in place of the plot, and no "View as table". */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"gauge-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["gauge-chart"]>;
  /** The card title's heading level, 1 to 6, so the chart keeps the page's heading order. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: CSSProperties;
}

export function GaugeChart({ value, max = 1, target, title, subtitle = "", headline, label = "", kind = "score", thresholds, format = "percent", size, empty, emptyLine, loading = false, styles, strings, headingLevel, style, ...rest }: GaugeChartProps) {
  const str = useStrings("gauge-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const r = useRecipe(recipes["gauge-chart"], { styles });
  const g = gaugeState({ value, max, target, kind, thresholds });
  // Meter's three states: a series colour while it is fine (the first for usage, the third for a score), the caution colour, the loss colour.
  const color = g.tone === "danger" ? tk.data.negative : g.tone === "warning" ? tk.data.warning : kind === "usage" ? tk.chart.series1 : tk.chart.series3;
  const w = size ?? tk.chart.gaugeW;
  const outer = w / 2;
  const inner = outer * GAUGE_HOLE;
  const over = tk.chart.tickOver;
  // The ring's flat edge is `over` above the bottom, so the tick has room to reach past the ring's top and ends.
  const cy = outer + over;
  const summary = summarizeGauge({ label: title, value, max, target, caption: label, format, formatWords, locale }, {
    noValue: (v) => str("summaryNoValue", v),
    caption: (v) => str("summaryCaption", v),
    over: (v) => str("summaryOver", v),
    target: (v) => str("summaryTarget", v),
    summary: (v) => str("summary", v),
  });
  const tick = g.targetShare === null ? null : { a: onHalfRing(g.targetShare, w / 2, cy, inner - over), b: onHalfRing(g.targetShare, w / 2, cy, outer + over) };
  const hasTarget = g.targetShare !== null;
  return (
    <ChartCard
      headingLevel={headingLevel}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && g.known ? { data: [{ measure: title, value, ...(hasTarget ? { target } : {}) }], x: "measure", y: hasTarget ? ["value", "target"] : ["value"], format, labels: { value: str("value"), target: str("target") }, xLabel: str("measure") } : null}
      style={style}
    >
      <ChartFrame height={cy + over} grow label={loading ? str("loading", { title }) : summary} loading={loading} empty={!g.known} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {() => (
          <div data-af-part="plot" data-af-plot style={css(box, { alignItems: "center", justifyContent: "center", flex: 1 }, r.plot)}>
            <div data-af-part="ring" style={css(box, partStyle(r, "ring", { width: w, height: cy + over }))}>
              <PieChart accessibilityLayer={false} width={w} height={cy + over} style={{ display: "block" }}>
                {/* The track and the fill are one pie, fill first: the fill runs from the left end over the top. */}
                <Pie
                  data={[{ v: g.share }, { v: 1 - g.share }]}
                  dataKey="v"
                  cx="50%"
                  cy={cy}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={inner}
                  outerRadius={outer}
                  cornerRadius={tk.chart.gaugeCap}
                  paddingAngle={g.share > 0 && g.share < 1 ? GAUGE_GAP_DEG : 0}
                  stroke="none"
                  tooltipType="none"
                  rootTabIndex={-1}
                  {...rechartsDraw(tk, reduced)}
                >
                  <Cell fill={color} />
                  <Cell fill={tk.chart.track} />
                </Pie>
              </PieChart>
              {/* The tick is its own svg over the pie: recharts draws its pie above anything else in its own svg, which would hide the half of the tick over the band. */}
              {tick ? (
                <svg aria-hidden width={w} height={cy + over} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
                  <line x1={tick.a.x} y1={tick.a.y} x2={tick.b.x} y2={tick.b.y} stroke={tk.fg.strong} strokeWidth={tk.chart.tickW} strokeLinecap="round" />
                </svg>
              ) : null}
              <div aria-hidden data-af-part="center" style={css(box, { position: "absolute", left: 0, right: 0, top: 0, bottom: over, alignItems: "center", justifyContent: "flex-end", pointerEvents: "none", textAlign: "center", paddingBottom: t.space["3xs"] }, r.center)}>
                <MetricValue value={value} format={format} size="lg" />
                {label ? <span data-af-part="centerLabel" style={css(text, { maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: t.chart.font }, r.centerLabel)}>{label}</span> : null}
              </div>
            </div>
            <div data-af-part="foot" style={css(row, partStyle(r, "foot", { justifyContent: "space-between", width: w, marginTop: t.space.xs, fontFamily: t.chart.font, fontVariantNumeric: "tabular-nums" }))}>
              <span>{fmt(format, 0, formatWords, locale)}</span>
              {hasTarget ? <span>{str.parts("targetValue", { value: fmt(format, target, formatWords, locale) })}</span> : null}
              <span>{fmt(format, max, formatWords, locale)}</span>
            </div>
          </div>
        )}
      </ChartFrame>
    </ChartCard>
  );
}
