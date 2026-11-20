import { Text, View, type ViewStyle } from "react-native";
import { type RootProps, rootProps } from "../../lib/root-props";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { barScale, bySign, fmt, prepare, summarize, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric-ui/core/chart";
import { createStyles } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { GiftedBars } from "../../data/bars";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { Legend } from "../../data/legend";
import { chartFont, giftedTheme, useChartTokens, useReducedMotion } from "../../data/theme";

export interface BarChartProps extends RootProps {
  /** Rows, one per category, in order. The same rows can feed a table, a stat and a line chart. */
  data: Row[];
  /** The field of each row that is the category: a word or a date. */
  x: string;
  /** The field, or fields, that are the values: more than one are grouped side by side, or stacked. */
  y: string | string[];
  /** The card's title. It names the plot too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** A format name, its options, or a function: what core's `fmt` takes. The axis, the labels at the ends of bars, the tooltip and the table print through it. */
  format?: FormatSpec;
  /** The category's format, for a date: `"month"`, `"day"`. */
  xFormat?: FormatSpec;
  /** A field's name for people, for the legend and the tooltip: `{ revenue: "Revenue" }`. */
  labels?: Record<string, string>;
  /** Stack the series on one bar, in order, instead of side by side. The tooltip adds a total. */
  stacked?: boolean;
  /** Bars run left to right, categories down the side. A single series is a ranked list of rows on the phone, not a rotated chart. */
  horizontal?: boolean;
  /** The plot's height, in points. */
  height?: number;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey bars in place of the plot, and no "View as table". */
  loading?: boolean;
  /** The series the legend has turned off, by field. Left out, the chart keeps its own and starts with every series on. */
  hidden?: string[];
  /** Called with every series that is off after a legend press. The last one showing cannot be turned off, so that press calls nothing. */
  onHiddenChange?: (hidden: string[]) => void;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"bar-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["bar-chart"]>;
  /** The card title's heading level. The phone has one kind of header, so it is read for the web's sake and has no effect here. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (the gaps, the type, the track and the fill's shape) is the recipe's. */
const useStyles = createStyles(() => ({
  head: { flexDirection: "row", justifyContent: "space-between" },
  label: { flexShrink: 1 },
  value: { fontVariant: ["tabular-nums"] },
  track: { overflow: "hidden" },
  fill: { height: "100%" },
  zero: { position: "absolute", top: 0, bottom: 0 },
}));

/** The share of the track a bar fills, never less than this, so a value near zero is still a bar you can see. */
const LEAST = 0.02;

export function BarChart({ data, x, y, title, subtitle = "", headline, format = "integer", xFormat, labels = {}, stacked = false, horizontal = false, height = 240, empty, emptyLine, loading = false, hidden, onHiddenChange, styles, strings, headingLevel: _headingLevel, testID, style, ...rest }: BarChartProps) {
  const str = useStrings("bar-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const s = useStyles();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = giftedTheme(tk, reduced);
  const r = useRecipe(recipes["bar-chart"], { styles });
  const fields = [y].flat();
  const series = useSeries(fields, theme.series, { hidden, onHiddenChange });
  const { rows, keys, ordered } = prepare(data, x, formatWords, xFormat, locale);
  // A single series with a loss colours each bar by its sign, so a bar below zero reads as a loss.
  const signed = bySign(data, fields, stacked);
  const scale = barScale(data, series.visible, { stacked });
  const summary = summarize({ label: title, data, keys, fields: series.visible, labels, format, formatWords, locale, ordered }, {
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
  });
  // Horizontal bars on the phone are a ranked list: rotated bar charts set their labels sideways on a 390pt screen.
  const ranked = horizontal && fields.length === 1;
  const field = fields[0]!;
  // The ranked bars share one scale with a zero line in it: a value under zero is drawn to the left of that line, in the loss colour, as the web's horizontal bars are.
  const amounts = rows.map((row) => +(row[field] as number) || 0);
  const least = Math.min(...amounts, 0);
  const most = Math.max(...amounts, 0);
  const range = most - least || 1;
  const zeroAt = -least / range;
  return (
    <ChartCard
      legend={!loading && data.length > 0 ? <Legend series={series} labels={labels} label={str("legend")} /> : null}
      id="bar-chart"
      testID={testID}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && data.length ? { data, x, y: fields, format, xFormat, labels } : null}
      style={style}
    >
      <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) =>
          ranked ? (
            <View testID="bar-chart.rank" style={r.rank.view}>
              {rows.map((row, at) => {
                const label = partStyle(r, "rankLabel", { text: chartFont(tk) });
                const value = partStyle(r, "rankValue", { text: chartFont(tk, "semibold") });
                const amount = amounts[at]!;
                const colour = signed ? (amount < 0 ? tk.data.negative : tk.data.positive) : series.colorOf(field);
                const fill = partStyle(r, "rankFill", { view: { width: `${Math.max(LEAST, Math.abs(amount) / range) * 100}%`, backgroundColor: colour, ...(least < 0 ? { marginLeft: `${(amount < 0 ? zeroAt - Math.max(LEAST, -amount / range) : zeroAt) * 100}%` } : {}) } });
                return (
                  <View key={row.__i} testID="bar-chart.rankRow" style={r.rankRow.view}>
                    <View testID="bar-chart.rankHead" style={[s.head, r.rankHead.view]}>
                      <Text testID="bar-chart.rankLabel" numberOfLines={1} style={[s.label, label.view, label.text]}>{row.__x}</Text>
                      <Text testID="bar-chart.rankValue" style={[s.value, value.view, value.text]}>{fmt(format, row[field], formatWords, locale)}</Text>
                    </View>
                    <View testID="bar-chart.rankTrack" style={[s.track, r.rankTrack.view]}>
                      <View testID="bar-chart.rankFill" style={[s.fill, fill.view]} />
                      {least < 0 ? <View pointerEvents="none" style={[s.zero, { left: `${zeroAt * 100}%`, width: tk.border.wHairline, backgroundColor: tk.chart.axis }]} /> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <GiftedBars tk={tk} theme={theme} rows={rows} s={series} fields={series.visible} labels={labels} format={format} formatWords={formatWords} stacked={stacked} totalLabel={str("total")} signed={signed} width={width} height={height} scale={scale} />
          )
        }
      </ChartFrame>
    </ChartCard>
  );
}
