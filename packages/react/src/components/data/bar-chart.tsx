import type { CSSProperties } from "react";
import { type RootProps, rootProps } from "../../lib/root-props";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { barScale, prepare, summarize, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric-ui/core/chart";
import { useInteraction } from "../../lib/interaction";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { RechartsBars } from "../../data/bars";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { Legend } from "../../data/legend";
import { rechartsTheme, useChartTokens, useReducedMotion } from "../../data/theme";

export interface BarChartProps extends RootProps<HTMLDivElement> {
  /** Rows, one per category, in order. The same rows can feed a table, a stat and a line chart. */
  data: Row[];
  /** The field of each row that is the category: a word or a date. */
  x: string;
  /** The field, or fields, that are the values: more than one are grouped side by side, or stacked. */
  y: string | string[];
  /** The card's title. It names the figure too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** A format name, its options, or a function: what core's `fmt` takes. The axis, the labels, the tooltip and the table print through it. */
  format?: FormatSpec;
  /** The category's format, for a date: `"month"`, `"day"`. */
  xFormat?: FormatSpec;
  /** A field's name for people, for the legend and the tooltip: `{ revenue: "Revenue" }`. */
  labels?: Record<string, string>;
  /** Stack the series on one bar, in order, instead of side by side. The tooltip adds a total. */
  stacked?: boolean;
  /** Bars run left to right, categories down the side: for long labels and ranked lists. A single series gets its value at each bar's end. */
  horizontal?: boolean;
  /** The plot's height. */
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
  /** The card title's heading level, 1 to 6, so the chart keeps the page's heading order. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: CSSProperties;
}

export function BarChart({ data, x, y, title, subtitle = "", headline, format = "integer", xFormat, labels = {}, stacked = false, horizontal = false, height = 240, empty, emptyLine, loading = false, hidden, onHiddenChange, styles, strings, headingLevel, style, ...rest }: BarChartProps) {
  const str = useStrings("bar-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = rechartsTheme(tk, reduced);
  const ui = useInteraction();
  const r = useRecipe(recipes["bar-chart"], { state: { focus: ui.focused }, styles });
  const fields = [y].flat();
  const s = useSeries(fields, theme.series, { hidden, onHiddenChange });
  const { rows, keys, ordered } = prepare(data, x, formatWords, xFormat, locale);
  const scale = barScale(data, s.visible, { stacked });
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
  return (
    <ChartCard
      headingLevel={headingLevel}
      root={rootProps(rest)}
      legend={!loading && data.length > 0 ? <Legend series={s} labels={labels} label={str("legend")} /> : null}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && data.length ? { data, x, y: fields, format, xFormat, labels } : null}
      style={style}
    >
      <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) => <RechartsBars tk={tk} theme={theme} ui={ui} plot={r.plot} hint={str("arrowKeys", { title })} data={data} rows={rows} keys={keys} fields={fields} s={s} labels={labels} format={format} formatWords={formatWords} scale={scale} stacked={stacked} totalLabel={str("total")} horizontal={horizontal} width={width} height={height} />}
      </ChartFrame>
    </ChartCard>
  );
}
