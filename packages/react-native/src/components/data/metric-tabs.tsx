import { Pressable, ScrollView, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { METRIC_KEY, barScale, fmt, metricTotal, prepare, seriesColors, summarize, useSeries, type FormatSpec, type Metric, type Row, type FormatWords } from "@antfabric-ui/core/chart";
import { createStyles } from "../../theme";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { GiftedBars } from "../../data/bars";
import { ChartCard } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { LoadingLines } from "../../data/loading";
import { chartFont, giftedTheme, useChartTokens, useReducedMotion } from "../../data/theme";
import { MetricValue } from "./metric-value";

export type { Metric };

export interface MetricTabsProps extends RootProps<View> {
  /** Rows, one per point, in order: [{ date: 1791763200000, resolved: 58, escalated: 6 }, …]. The same rows can feed a table and a bar chart. */
  data: Row[];
  /** The field of each row that is the category: a date or a word. */
  x: string;
  /** The metrics, one tab each (the first eight): { field, label, format?, total? }. A tab shows the sum of its field unless it names its own `total`. */
  metrics: Metric[];
  /** The card's title. It names the tab list and the plot too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A format name, its options, or a function: what core's `fmt` takes, for a metric that names none. */
  format?: FormatSpec;
  /** The category's format, for a date: `"month"`, `"day"`. */
  xFormat?: FormatSpec;
  /** The field of the metric that is chosen. Left out, the chart keeps its own, starting with the first metric. Controlled when the app passes it with `onValueChange`. */
  value?: string;
  /** A tab was tapped. Called with its field. */
  onValueChange?: (value: string) => void;
  /** The plot's height, in points. */
  height?: number;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey lines and bars in place of the tabs and the plot, and no "View as table". */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"metric-tabs">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["metric-tabs"]>;
  style?: ViewStyle;
}

/** The palette has eight colours, so a ninth tab would wrap onto the first: the first eight are tabs. */
const MOST = 8;

/** Up to this many tabs share the strip's width; more scroll sideways, each at least as wide as the web's. */
const SHARE = 3;

/** Layout no token decides; what the tokens decide (the padding, the fill, the swatch, the rule and the type) is the recipe's. */
const useStyles = createStyles((t) => ({
  strip: { flexDirection: "row", alignSelf: "stretch", marginHorizontal: -t.space.md },
  tab: { flex: 1, minWidth: 0, alignItems: "flex-start", justifyContent: "center" },
  scrolled: { flexGrow: 0, flexShrink: 0, flexBasis: "auto" },
  scroller: { flexGrow: 1 },
  label: { flexDirection: "row", alignItems: "center" },
  rule: { position: "absolute", left: 0, right: 0, bottom: -t.border.wHairline },
}));

interface TabProps {
  id: (part: string) => string;
  locale: string;
  /** More tabs than fit: this one keeps its least width and the strip scrolls. */
  scrolls: boolean;
  metric: Metric;
  total: number;
  format?: FormatSpec;
  color: string;
  on: boolean;
  first: boolean;
  onPress: () => void;
  styles?: PartStyles<"metric-tabs">;
  strings?: Partial<KitStrings["metric-tabs"]>;
}

/** One tab: the metric's colour and name over its total, a rule in its colour along the foot while it is the chosen one. */
function Tab({ id, locale, scrolls, metric, total, format, color, on, first, onPress, styles, strings }: TabProps) {
  const str = useStrings("metric-tabs", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const s = useStyles();
  const tk = useChartTokens();
  // The phone has no hover: a tab is lit while it is pressed, and a focused one (keyboard, switch access) is ringed.
  const press = usePress();
  const r = useRecipe(recipes["metric-tabs"], { state: { on, pressed: press.pressed, focus: press.focused }, styles });
  // The first tab has no rule to its left: the card's edge is there.
  const tab = partStyle(r, "tab", { view: [first && { borderLeftWidth: 0 }, scrolls && [s.scrolled, { minWidth: tk.chart.tabMinW }]] });
  const swatch = partStyle(r, "swatch", { view: { backgroundColor: color } });
  const label = partStyle(r, "tabLabel", { text: chartFont(tk) });
  const rule = partStyle(r, "rule", { view: { backgroundColor: color, opacity: on ? 1 : 0 } });
  return (
    <Pressable
      testID={id("tab")}
      accessibilityRole="tab"
      accessibilityLabel={str("tabLabel", { label: metric.label, total: fmt(metric.format ?? format, total, formatWords, locale) })}
      accessibilityState={{ selected: on }}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.tab, tab.view]}
    >
      <View testID={id("tabLabel")} style={[s.label, label.view]}>
        <View testID={id("swatch")} style={swatch.view} />
        <Text numberOfLines={1} style={label.text}>{metric.label}</Text>
      </View>
      <MetricValue value={total} format={metric.format ?? format} size="sm" />
      <View testID={id("rule")} pointerEvents="none" style={[s.rule, rule.view]} />
    </Pressable>
  );
}

export function MetricTabs({ data, x, metrics, title, subtitle = "", format = "integer", xFormat, value, onValueChange, height = 220, empty, emptyLine, loading = false, styles, strings, style, testID, ...rest }: MetricTabsProps) {
  const str = useStrings("metric-tabs", strings);
  const locale = useLocale();
  const id = (part: string) => partId(testID, "metric-tabs", part);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const s = useStyles();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = giftedTheme(tk, reduced);
  const r = useRecipe(recipes["metric-tabs"], { styles });
  const [picked, setPicked] = useControllable(value, onValueChange);
  const tabs = metrics.slice(0, MOST);
  const palette = seriesColors(tk);
  const at = Math.max(0, tabs.findIndex((m) => m.field === picked));
  const chosen = tabs[at];
  // The chosen metric is always drawn under one data key, so switching tabs moves the same bars to their new heights and does not draw a new series from zero.
  const series = useSeries([METRIC_KEY], [palette[at % palette.length]!]);
  const { rows: base, keys, ordered } = prepare(data, x, formatWords, xFormat, locale);
  const rows = chosen ? base.map((row) => ({ ...row, [METRIC_KEY]: row[chosen.field] })) : base;
  const shown = chosen?.format ?? format;
  const labels = { [METRIC_KEY]: chosen?.label ?? "" };
  const scale = barScale(rows, [METRIC_KEY]);
  const summary = chosen ? summarize({ label: `${title}, ${chosen.label}`, data, keys, fields: [chosen.field], labels: { [chosen.field]: chosen.label }, format: shown, formatWords, ordered, locale }, {
    noData: (v) => str("noData", v),
    noValues: (v) => str("summaryNoValues", v),
    extremes: (v) => str("summaryExtremes", v),
    single: (v) => str("summarySingle", v),
    held: (v) => str("summaryHeld", v),
    rose: (v) => str("summaryRose", v),
    fell: (v) => str("summaryFell", v),
    peak: (v) => str("summaryPeak", v),
    range: (v) => str("summaryRange", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  }) : str("noData", { title });
  const nothing = data.length === 0 || tabs.length === 0;
  const scrolls = tabs.length > SHARE;
  const tabItems = tabs.map((m, i) => (
    <Tab key={m.field} id={id} locale={locale} scrolls={scrolls} metric={m} total={metricTotal(data, m)} format={format} color={palette[i % palette.length]!} on={i === at} first={i === 0} onPress={() => setPicked(m.field)} styles={styles} strings={strings} />
  ));
  const lines = [{ width: `${tk.kpi.loadM}px`, height: `${tk.kpi.loadValueH}px` }];
  return (
    <ChartCard
      id="metric-tabs"
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      table={!loading && !nothing ? { data, x, y: tabs.map((m) => m.field), format, xFormat, formats: Object.fromEntries(tabs.map((m) => [m.field, m.format])), labels: Object.fromEntries(tabs.map((m) => [m.field, m.label])) } : null}
      style={style}
      {...({ testID, ...rootProps(rest) } as object)}
    >
      {loading ? (
        <LoadingLines lines={lines} label={str("loadingMetrics")} />
      ) : !nothing ? (
        // The strip runs to the card's edges: the card's inset is pulled back out.
        <View testID={id("tabs")} accessibilityRole="tablist" accessibilityLabel={title} style={[s.strip, r.tabs.view]}>
          {scrolls ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroller}>{tabItems}</ScrollView> : tabItems}
        </View>
      ) : null}
      <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={nothing} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) => <GiftedBars tk={tk} theme={theme} rows={rows} s={series} fields={[METRIC_KEY]} labels={labels} format={shown} formatWords={formatWords} width={width} height={height} scale={scale} />}
      </ChartFrame>
    </ChartCard>
  );
}
