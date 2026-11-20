import { Text, View, type ViewStyle } from "react-native";
import { type RootProps, rootProps } from "../../lib/root-props";
import { Line, Svg } from "react-native-svg";
import { PieChart } from "react-native-gifted-charts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { GAUGE_HOLE, fmt, gaugeState, onHalfRing, summarizeGauge, type FormatSpec, type MeterKind, type MeterThresholds, type FormatWords } from "@antfabric/ui-core/chart";
import { createStyles } from "../../theme";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { chartFont, useChartTokens } from "../../data/theme";
import { MetricValue } from "./metric-value";

export type { ChartHeadline, MeterKind, MeterThresholds };

export interface GaugeChartProps extends RootProps {
  /** What there is, in the same unit as `max`. */
  value: number;
  /** What a full ring is: 1 when the value is already a share. */
  max?: number;
  /** Where the tick sits, in the value's unit: the goal the value is measured against. Left out, there is no tick. */
  target?: number;
  /** The card's title. It names the plot too. */
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
  /** The half ring's width, in points; its height is half. */
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
  /** The card title's heading level. The phone has one kind of header, so it is read for the web's sake and has no effect here. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: ViewStyle;
}

/* A slice of nothing would not draw; this is nothing a person could see. */
const SLIVER = 0.0001;

const useStyles = createStyles((t) => ({
  plot: { alignItems: "center", justifyContent: "center", flex: 1 },
  tick: { position: "absolute", top: 0, left: 0 },
  center: { position: "absolute", left: 0, right: 0, top: 0, alignItems: "center", justifyContent: "flex-end", paddingBottom: t.space["3xs"] },
  foot: { flexDirection: "row", justifyContent: "space-between", marginTop: t.space.xs },
}));

export function GaugeChart({ value, max = 1, target, title, subtitle = "", headline, label = "", kind = "score", thresholds, format = "percent", size, empty, emptyLine, loading = false, styles, strings, headingLevel: _headingLevel, testID, style, ...rest }: GaugeChartProps) {
  const str = useStrings("gauge-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const s = useStyles();
  const tk = useChartTokens();
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
  const ring = partStyle(r, "ring", { view: { width: w, height: cy + over } });
  const center = partStyle(r, "center", { view: { height: cy } });
  const caption = partStyle(r, "centerLabel", { view: { maxWidth: "70%" }, text: chartFont(tk) });
  const foot = partStyle(r, "foot", { view: { width: w }, text: [chartFont(tk), { fontVariant: ["tabular-nums"] }] });
  const tick = g.targetShare === null ? null : { a: onHalfRing(g.targetShare, w / 2, cy, inner - over), b: onHalfRing(g.targetShare, w / 2, cy, outer + over) };
  const hasTarget = g.targetShare !== null;
  return (
    <ChartCard
      id="gauge-chart"
      testID={testID}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && g.known ? { data: [{ measure: title, value, ...(hasTarget ? { target } : {}) }], x: "measure", y: hasTarget ? ["value", "target"] : ["value"], format, labels: { value: str("value"), target: str("target") }, xLabel: str("measure") } : null}
      style={style}
    >
      <ChartFrame height={cy + over} grow interactive label={loading ? str("loading", { title }) : summary} loading={loading} empty={!g.known} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {() => (
          <View testID="gauge-chart.plot" style={[s.plot, r.plot.view]}>
            <Enter motion="pop" testID="gauge-chart.ring" accessible accessibilityRole="image" accessibilityLabel={summary} style={ring.view}>
              {/* gifted-charts draws the half ring as a whole pie in a view half its height, which crops it. The ring sits `over` down, under the tick. */}
              <View style={{ position: "absolute", top: over, left: 0 }}>
                <PieChart
                  donut
                  semiCircle
                  radius={outer}
                  innerRadius={inner}
                  innerCircleColor={tk.surface.card}
                  strokeWidth={0}
                  data={[
                    { value: Math.max(g.share, SLIVER), color: g.share > 0 ? color : tk.chart.track },
                    { value: Math.max(1 - g.share, SLIVER), color: tk.chart.track },
                  ]}
                />
              </View>
              {tick ? (
                <Svg width={w} height={cy + over} style={s.tick} pointerEvents="none">
                  <Line x1={tick.a.x} y1={tick.a.y} x2={tick.b.x} y2={tick.b.y} stroke={tk.fg.strong} strokeWidth={tk.chart.tickW} strokeLinecap="round" />
                </Svg>
              ) : null}
              <View testID="gauge-chart.center" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[s.center, center.view]}>
                <MetricValue value={value} format={format} size="lg" />
                {label ? <Text testID="gauge-chart.centerLabel" numberOfLines={1} style={[caption.view, caption.text]}>{label}</Text> : null}
              </View>
            </Enter>
            <View testID="gauge-chart.foot" style={[s.foot, foot.view]}>
              <Text style={foot.text}>{fmt(format, 0, formatWords, locale)}</Text>
              {hasTarget ? <Text style={foot.text}>{str.parts("targetValue", { value: fmt(format, target, formatWords, locale) })}</Text> : null}
              <Text style={foot.text}>{fmt(format, max, formatWords, locale)}</Text>
            </View>
          </View>
        )}
      </ChartFrame>
    </ChartCard>
  );
}
