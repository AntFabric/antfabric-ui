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
import { ProgressRing } from "./progress-ring";
import { SparkBars } from "./spark-bars";
import { Sparkline } from "./sparkline";

export type StatTileTrendKind = "line" | "bars";

export interface StatTileProps extends RootProps<View> {
  /** What is counted: "Open tickets", "Orders shipped". One line; a long one is cut. */
  label: string;
  /** A lucide icon name, in a soft chip before the label. Empty draws no chip. */
  icon?: string;
  /** A word at the end of the top row: the period the number covers ("24h"), or "Now". */
  aside?: string;
  value: number;
  /** A format name, its options, or a function: what core's `fmt` takes. */
  format?: FormatSpec;
  /** The change, as a number the delta format prints: `-0.101` is `-10.1%`. Left out, there is no Delta and no period. */
  delta?: number;
  deltaFormat?: FormatSpec;
  /** Down is good (open tickets, response time): the Delta's colours swap. */
  inverse?: boolean;
  /** What the change is against, after the Delta: "vs September". */
  period?: string;
  /** Rows for the visual under the value, one per period. Used with `trendY`. */
  trend?: Row[];
  trendY?: string;
  /** `line` is a Sparkline with its fill and a dot on the last point; `bars` is SparkBars, the latest period in full colour. */
  trendKind?: StatTileTrendKind;
  /** A share of a goal, 0 to 1: a ProgressRing at the start of the tile, in place of a trend. */
  progress?: number;
  /** Grey lines the size of the tile's text, while the numbers load. */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, top: {…}, chip: {…}, icon: {…}, label: {…}, aside: {…}, body: {…}, main: {…}, foot: {…}, period: {…} }`. */
  styles?: PartStyles<"stat-tile">;
  /** The built-in text, by key: what a screen reader hears while it loads, and the names of the ring and the trend. */
  strings?: Partial<KitStrings["stat-tile"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (the inset, the chip, the type, the gaps) is the recipe's. */
const useStyles = createStyles((t) => ({
  card: { minWidth: 0 },
  top: { flexDirection: "row", alignItems: "center" },
  chip: { alignItems: "center", justifyContent: "center", flexShrink: 0 },
  label: { flex: 1 },
  aside: { fontVariant: ["tabular-nums"] },
  // The phone stacks the visual under the value, and stretches it; a ring stays beside it.
  body: { alignItems: "stretch" },
  bodyRing: { flexDirection: "row", alignItems: "center", gap: t.space.mdLg },
  main: { minWidth: 0 },
  foot: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
}));

/** The visual under the value takes the tile's width, measured. */
function Visual({ rows, y, kind, label }: { rows: Row[]; y: string; kind: StatTileTrendKind; label: string }) {
  const [width, onLayout] = useWidth();
  const t = useChartTokens();
  return (
    <View onLayout={onLayout} style={{ alignSelf: "stretch" }}>
      {kind === "bars" ? <SparkBars data={rows} y={y} width={width} height={t.kpi.tileTrendH} animate label={label} /> : <Sparkline data={rows} y={y} width={width} height={t.kpi.tileTrendH} area marker animate label={label} />}
    </View>
  );
}

export function StatTile({ label, icon = "", aside = "", value, format = "integer", delta, deltaFormat, inverse = false, period = "", trend, trendY = "", trendKind = "line", progress, loading = false, styles, strings, style, testID, ...rest }: StatTileProps) {
  const s = useStyles();
  const { t } = useTheme();
  const r = useRecipe(recipes["stat-tile"], { styles });
  const str = useStrings("stat-tile", strings);
  const locale = useLocale();
  const id = (part: string) => partId(testID, "stat-tile", part);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  if (loading) {
    const lines = [{ width: `${t.kpi.loadM}px`, height: `${t.kpi.loadLineH}px` }, { width: `${t.kpi.loadS}px`, height: `${t.kpi.loadValueH}px` }, { width: `${t.kpi.loadL}px`, height: `${t.kpi.loadLineH}px` }];
    return <Card pad="none" elevate="card" style={StyleSheet.flatten([s.card, style])} children={<View testID={id("root")} accessible accessibilityLabel={str("loading", { label })} accessibilityState={{ busy: true }} {...rootProps(rest)} style={r.root.view}><LoadingLines lines={lines} label={str("loadingLines", { label })} /></View>} />;
  }
  // A ring takes the place of a trend; no rows or no y is no visual.
  const rows = trend && trend.length > 0 && trendY !== "" && progress === undefined ? trend : null;
  // What a screen reader hears for the tile: core says which way the number went and by how much, the words are the tile's (the common `up` and `down`).
  const known = delta !== undefined && Number.isFinite(delta);
  const direction = delta === undefined || !known || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  const m = delta === undefined ? null : ({ direction, known, value: direction === "flat" ? "" : fmt(withoutSign(deltaFormat ?? "percent"), Math.abs(delta), formatWords, locale) } as const);
  const change = m === null ? null : !m.known ? str("changeUnavailable") : m.direction === "flat" ? str("noChange") : m.direction === "up" ? str("up", { value: m.value }) : str("down", { value: m.value });
  const said = [label, fmt(format, value, formatWords, locale), change, period || null].filter((x) => x !== null).join(", ");
  const body$ = partStyle(r, "body", { view: progress !== undefined ? s.bodyRing : s.body });
  // The icon's size is its width and height (`size`); what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _h, ...iconRest } = r.icon.view;
  const body = (
    <View testID={id("root")} accessible accessibilityLabel={said} {...rootProps(rest)} style={r.root.view}>
      <View testID={id("top")} style={[s.top, r.top.view]}>
        {icon ? (
          <View testID={id("chip")} style={[s.chip, r.chip.view]}>
            <Icon testID={id("icon")} name={icon} size={iconSize as number} color={r.icon.text.color ?? r.chip.text.color} style={Object.keys(iconRest).length ? iconRest : undefined} />
          </View>
        ) : null}
        <Text testID={id("label")} numberOfLines={1} style={[r.label.view, s.label, r.label.text]}>{label}</Text>
        {aside ? <Text testID={id("aside")} style={[s.aside, r.aside.view, r.aside.text]}>{aside}</Text> : null}
      </View>
      <View testID={id("body")} style={body$.view}>
        {progress !== undefined ? <ProgressRing value={progress} animate label={str("ringOfGoal", { label, percent: fmt("percent", progress, formatWords, locale) })} /> : null}
        <View testID={id("main")} style={[s.main, r.main.view]}>
          <MetricValue value={value} format={format} size="md" />
          {delta !== undefined ? (
            <View testID={id("foot")} style={[s.foot, r.foot.view]}>
              <Delta value={delta} inverse={inverse} format={deltaFormat} variant="badge" size="sm" />
              {period ? <Text testID={id("period")} style={[r.period.view, r.period.text]}>{period}</Text> : null}
            </View>
          ) : null}
        </View>
        {rows ? <Visual rows={rows} y={trendY} kind={trendKind} label={trendKind === "bars" ? str("byPeriod", { label }) : str("trend", { label })} /> : null}
      </View>
    </View>
  );
  return <Card pad="none" elevate="card" style={StyleSheet.flatten([s.card, style])} children={body} />;
}
