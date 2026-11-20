import type { ViewStyle } from "react-native";
import { type RootProps, rootProps } from "../../lib/root-props";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { barScale, prepare, summarize, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric-ui/core/chart";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { GiftedBars } from "../../data/bars";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { Legend } from "../../data/legend";
import { giftedTheme, useChartTokens, useReducedMotion } from "../../data/theme";

export interface ComboChartProps extends RootProps {
  /** Rows, one per category, in order. */
  data: Row[];
  /** The field of each row that is the category: a date or a word. */
  x: string;
  /** The field drawn as bars: what happened. */
  bars: string;
  /** The field drawn as a dashed line over the bars: a forecast, a plan. */
  line: string;
  /** The card's title. It names the plot too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** A format name, its options, or a function: what core's `fmt` takes. */
  format?: FormatSpec;
  /** The category's format, for a date: `"month"`, `"day"`. */
  xFormat?: FormatSpec;
  /** A field's name for people, for the legend and the tooltip: `{ mrr: "MRR", forecast: "Forecast" }`. */
  labels?: Record<string, string>;
  /** A reference line at this value: a goal. The scale takes it in. */
  target?: number;
  /** What the target line says, at its left end. */
  targetLabel?: string;
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
  styles?: PartStyles<"combo-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["combo-chart"]>;
  /** The card title's heading level. The phone has one kind of header, so it is read for the web's sake and has no effect here. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: ViewStyle;
}

export function ComboChart({ data, x, bars, line, title, subtitle = "", headline, format = "integer", xFormat, labels = {}, target, targetLabel = "", height = 260, empty, emptyLine, loading = false, hidden, onHiddenChange, styles, strings, headingLevel: _headingLevel, testID, style, ...rest }: ComboChartProps) {
  const str = useStrings("combo-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = giftedTheme(tk, reduced);
  const r = useRecipe(recipes["combo-chart"], { styles });
  const s = useSeries([bars, line], theme.series, { hidden, onHiddenChange });
  const { rows, keys, ordered } = prepare(data, x, formatWords, xFormat, locale);
  // Both series are in the scale whether or not the legend has them on, so the axis does not jump when one is turned off.
  const scale = barScale(data, s.fields, { target });
  const summary = summarize({ label: title, data, keys, fields: s.visible, labels, format, formatWords, locale, ordered }, {
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
  const barsOn = s.visible.includes(bars);
  const lineOn = s.visible.includes(line);
  return (
    <ChartCard
      legend={!loading && data.length > 0 ? <Legend series={s} labels={labels} label={str("legend")} /> : null}
      id="combo-chart"
      testID={testID}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && data.length ? { data, x, y: [bars, line], format, xFormat, labels } : null}
      style={style}
    >
      <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) => (
          <GiftedBars
            tk={tk}
            theme={theme}
            rows={rows}
            s={s}
            fields={[bars]}
            tipFields={s.visible}
            barsOff={!barsOn}
            labels={labels}
            format={format}
            formatWords={formatWords}
            width={width}
            height={height}
            scale={scale}
            line={{ field: lineOn ? line : null, color: s.colorOf(line) }}
            target={target}
            targetLabel={targetLabel}
          />
        )}
      </ChartFrame>
    </ChartCard>
  );
}
