import { Text, View, type ViewStyle } from "react-native";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { compareTotals, fmt, lineScale, moved, prepare, summarizeCompare, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric-ui/core/chart";
import { createStyles } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { ChartCard } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { GiftedLines } from "../../data/lines";
import { LoadingLines } from "../../data/loading";
import { chartFont, giftedTheme, useChartTokens, useReducedMotion } from "../../data/theme";
import { Delta } from "./delta";
import { MetricValue } from "./metric-value";

export interface PeriodCompareProps extends RootProps<View> {
  /** Rows, one per point of the period, in order: [{ day: "Mon", thisWeek: 64, lastWeek: 58 }, …]. The same rows can feed a table and a line chart. */
  data: Row[];
  /** The field of each row that is the category: a day, a date or a word. */
  x: string;
  /** The field that holds this period's values. */
  current: string;
  /** The field that holds the last period's values. */
  previous: string;
  /** The card's title. It names the plot too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A format name, its options, or a function: what core's `fmt` takes. The totals, the axis, the tooltip and the table print through it. */
  format?: FormatSpec;
  /** The category's format, for a date: `"month"`, `"day"`. */
  xFormat?: FormatSpec;
  /** A field's name for people, for the totals, the tooltip and the table: `{ thisWeek: "This week" }`. */
  labels?: Record<string, string>;
  /** A line under each total, by field: `{ thisWeek: "Oct 19 to 25" }`. */
  notes?: Record<string, string>;
  /** What the change is against, after the badge: "vs last week". */
  period?: string;
  /** Down is good (spend, churn, response time): the badge's colours and its spoken "good" or "bad" swap. */
  inverse?: boolean;
  /** The plot's height, in points. */
  height?: number;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey lines and bars in place of the totals and the plot, and no "View as table". */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"period-compare">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["period-compare"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (the gaps, the type, the key's width and the rule between the totals and the plot) is the recipe's. */
const useStyles = createStyles(() => ({
  side: { flexDirection: "row", alignItems: "flex-start" },
  figure: { flex: 1, minWidth: 0 },
  caption: { flexDirection: "row", alignItems: "center" },
  key: { height: 0, flexShrink: 0 },
  foot: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
}));

export function PeriodCompare({ data, x, current, previous, title, subtitle = "", format = "integer", xFormat, labels = {}, notes = {}, period, inverse = false, height = 200, empty, emptyLine, loading = false, styles, strings, style, testID, ...rest }: PeriodCompareProps) {
  const str = useStrings("period-compare", strings);
  const locale = useLocale();
  const id = (part: string) => partId(testID, "period-compare", part);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const against = period ?? str("period");
  const s = useStyles();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = giftedTheme(tk, reduced);
  const r = useRecipe(recipes["period-compare"], { styles });
  // This period is the first series colour, solid; the last is the chart's grey, dashed and thinner. Both are always on, so there is no legend: the totals are the key.
  const series = useSeries([current, previous], [tk.chart.series1, tk.chart.previous]);
  const { rows, keys } = prepare(data, x, formatWords, xFormat, locale);
  const total = compareTotals(data, current, previous);
  const scale = lineScale(data, series.fields);
  const summary = summarizeCompare({ label: title, data, keys, fields: [current, previous], labels, format, formatWords, locale }, {
    noData: (v) => str("noData", v),
    noValues: (v) => str("summaryNoValues", v),
    extremes: (v) => str("summaryExtremes", v),
    same: () => str("summarySame"),
    up: (v) => str("summaryUp", v),
    down: (v) => str("summaryDown", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  });
  // What a screen reader hears for this period's total: core says which way it moved and by how much, the words are the chart's (the common `up` and `down`).
  const m = moved(total.change, formatWords);
  const change = !m.known ? str("changeUnavailable") : m.direction === "flat" ? str("noChange") : m.direction === "up" ? str("up", { value: m.value }) : str("down", { value: m.value });
  const caption = partStyle(r, "caption", { text: chartFont(tk) });
  const periodStyle = partStyle(r, "period", { text: chartFont(tk) });
  const note = partStyle(r, "note", { text: chartFont(tk) });
  const totals = [
    { field: current, value: total.current, size: "md", dashed: false },
    { field: previous, value: total.previous, size: "sm", dashed: true },
  ] as const;
  const lines = [{ width: `${tk.kpi.loadS}px`, height: `${tk.kpi.loadLineH}px` }, { width: `${tk.kpi.loadM}px`, height: `${tk.kpi.loadValueH}px` }, { width: `${tk.kpi.loadS}px`, height: `${tk.kpi.loadLineH}px` }];
  return (
    <ChartCard id="period-compare" r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")} title={title} subtitle={subtitle} table={!loading && data.length ? { data, x, y: [current, previous], format, xFormat, labels } : null} style={style} {...({ testID, ...rootProps(rest) } as object)}>
      <View testID={id("compare")} style={r.compare.view}>
        {loading ? (
          <View testID={id("side")} style={[s.side, r.side.view]}>
            <LoadingLines lines={lines} label={str("loadingTotals")} />
          </View>
        ) : data.length ? (
          <View testID={id("side")} style={[s.side, r.side.view]}>
            {totals.map(({ field, value, size, dashed }) => (
              <View key={field} testID={id("figure")} accessible accessibilityLabel={[labels[field] ?? field, notes[field], fmt(format, value, formatWords, locale), dashed ? null : str("againstPeriod", { change, period: against })].filter((p) => p).join(", ")} style={[s.figure, r.figure.view]}>
                <View testID={id("caption")} style={[s.caption, caption.view]}>
                  <View testID={id("key")} style={[s.key, partStyle(r, "key", { view: { borderStyle: dashed ? "dashed" : "solid", borderColor: series.colorOf(field) } }).view]} />
                  <Text style={caption.text}>{labels[field] ?? field}</Text>
                </View>
                <MetricValue value={value} format={format} size={size} />
                {!dashed ? (
                  <View testID={id("foot")} style={[s.foot, r.foot.view]}>
                    <Delta value={total.change} inverse={inverse} variant="badge" size="sm" />
                    <Text testID={id("period")} style={[periodStyle.view, periodStyle.text]}>{against}</Text>
                  </View>
                ) : null}
                {notes[field] ? <Text testID={id("note")} style={[note.view, note.text]}>{notes[field]}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
        <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
          {(width) => <GiftedLines tk={tk} theme={theme} rows={rows} s={series} labels={labels} format={format} formatWords={formatWords} scale={scale} area dashed={[previous]} width={width} height={height} />}
        </ChartFrame>
      </View>
    </ChartCard>
  );
}
