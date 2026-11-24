import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { fmt, withoutSign, type FormatSpec, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { createStyles, useTheme } from "../../theme";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { LoadingLines } from "../../data/loading";
import { useWidth } from "../../data/frame";
import { useChartTokens } from "../../data/theme";
import { Card } from "../display/card";
import { Delta } from "./delta";
import { MetricValue } from "./metric-value";
import { Sparkline } from "./sparkline";

export interface KpiCardProps extends RootProps<View> {
  /** What the headline number is: "Monthly recurring revenue". */
  label: string;
  value: number;
  /** A format name, its options, or a function: what core's `fmt` takes. */
  format?: FormatSpec;
  /** The change, as a number the delta format prints: `0.044` is `+4.4%`. Left out, there is no badge and no sentence. */
  delta?: number;
  deltaFormat?: FormatSpec;
  /** Down is good (open tickets, response time): the badge's colours swap. */
  inverse?: boolean;
  /** What the change is against, after the sentence: "on September" makes "Up 4.4% on September". */
  period?: string;
  /** A line of context under the sentence: "Forecast was $185,000". */
  note?: string;
  /** Rows for the trend bled into the card's foot, one per period. Used with `trendY`. */
  trend?: Row[];
  trendY?: string;
  /** Grey lines the size of the card's text, while the numbers load. */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, top: {…}, label: {…}, foot: {…}, moved: {…}, note: {…}, trend: {…} }`. */
  styles?: PartStyles<"kpi-card">;
  /** The built-in text, by key: the sentence about the change, and what a screen reader hears while it loads. */
  strings?: Partial<KitStrings["kpi-card"]>;
  style?: ViewStyle;
}

const TRENDING = { up: "trending-up", down: "trending-down", flat: "minus" } as const;

/** Layout no token decides; what the tokens decide (the inset, the type, the gaps, the trend's height) is the recipe's. */
const useStyles = createStyles((t) => ({
  // The trend runs to the card's edges, so the Card has no inset of its own and no gap between the section and the trend.
  card: { minWidth: 0, gap: 0 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { flex: 1 },
  moved: { flexDirection: "row", alignItems: "center" },
  withTrend: { paddingBottom: t.space.xs },
}));

/** The flush trend: it takes the card's width, measured, and runs to its edges and its foot. */
function Trend({ rows, y, label, styles, id }: { rows: Row[]; y: string; label: string; styles?: PartStyles<"kpi-card">; id: (part: string) => string }) {
  const [width, onLayout] = useWidth();
  const t = useChartTokens();
  const r = useRecipe(recipes["kpi-card"], { styles });
  return (
    <View testID={id("trend")} onLayout={onLayout} style={[{ alignSelf: "stretch" }, r.trend.view]}>
      <Sparkline data={rows} y={y} width={width} height={t.kpi.cardTrendHeight} area flush animate label={label} />
    </View>
  );
}

export function KpiCard({ label, value, format = { type: "currency" }, delta, deltaFormat, inverse = false, period = "", note = "", trend, trendY = "", loading = false, styles, strings, style, testID, ...rest }: KpiCardProps) {
  const s = useStyles();
  const { t } = useTheme();
  const r = useRecipe(recipes["kpi-card"], { styles });
  const str = useStrings("kpi-card", strings);
  const locale = useLocale();
  const id = (part: string) => partId(testID, "kpi-card", part);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  if (loading) {
    const lines = [{ width: `${t.kpi.loadWidthMd}px`, height: `${t.kpi.loadLineHeight}px` }, { width: `${t.kpi.loadWidthLg}px`, height: `${t.kpi.loadValueHeight}px` }, { width: `${t.kpi.loadWidthXl}px`, height: `${t.kpi.loadLineHeight}px` }];
    return <Card pad="none" elevate="card" style={StyleSheet.flatten([s.card, style])} children={<View testID={id("root")} accessible accessibilityLabel={str("loading", { label })} accessibilityState={{ busy: true }} {...rootProps(rest)} style={r.root.view}><LoadingLines lines={lines} label={str("loadingLines", { label })} /></View>} />;
  }
  // The sentence about the change: core says which way it went and by how much, the words are the card's.
  const known = delta !== undefined && Number.isFinite(delta);
  const direction = delta === undefined || !known || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  const m = delta === undefined ? null : ({ direction, known, value: direction === "flat" ? "" : fmt(withoutSign(deltaFormat ?? "percent"), Math.abs(delta), formatWords, locale) } as const);
  const sentence = m === null ? "" : !m.known ? str("changeUnavailable") : m.direction === "flat" ? str("noChange") : m.direction === "up" ? str("up", { value: m.value }) : str("down", { value: m.value });
  const change = m === null ? null : ({ direction: m.direction, text: period ? str("againstPeriod", { change: sentence, period }) : sentence } as const);
  const rows = trend && trend.length > 0 && trendY !== "" ? trend : null;
  const root = partStyle(r, "root", { view: rows && s.withTrend });
  const said = [label, fmt(format, value, formatWords, locale), change ? change.text : null, note || null].filter((x) => x !== null).join(", ");
  return (
    <Card
      pad="none"
      elevate="card"
      style={StyleSheet.flatten([s.card, style])}
      children={
        <>
          <View testID={id("root")} accessible accessibilityLabel={said} {...rootProps(rest)} style={root.view}>
            <View testID={id("top")} style={[s.top, r.top.view]}>
              <Text testID={id("label")} style={[r.label.view, s.label, r.label.text]}>{label}</Text>
              {delta !== undefined ? <Delta value={delta} inverse={inverse} format={deltaFormat} variant="badge" /> : null}
            </View>
            <MetricValue value={value} format={format} size="lg" />
            {change || note ? (
              <View testID={id("foot")} style={r.foot.view}>
                {change ? (
                  <View testID={id("moved")} style={[s.moved, r.moved.view]}>
                    <Text style={r.moved.text}>{change.text}</Text>
                    <Icon name={TRENDING[change.direction]} size={t.size.icon.md} color={r.moved.text.color} />
                  </View>
                ) : null}
                {note ? <Text testID={id("note")} style={[r.note.view, r.note.text]}>{note}</Text> : null}
              </View>
            ) : null}
          </View>
          {rows ? <Trend rows={rows} y={trendY} label={str("trend", { label })} styles={styles} id={id} /> : null}
        </>
      }
    />
  );
}
