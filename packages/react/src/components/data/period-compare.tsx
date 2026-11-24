import type { CSSProperties } from "react";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { compareTotals, lineScale, prepare, summarizeCompare, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, row, text } from "../../lib/style";
import { ChartCard } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { RechartsLines } from "../../data/lines";
import { LoadingLines } from "../../data/loading";
import { rechartsTheme, useChartTokens, useReducedMotion } from "../../data/theme";
import { Delta } from "./delta";
import { MetricValue } from "./metric-value";

export interface PeriodCompareProps extends RootProps<HTMLDivElement> {
  /** Rows, one per point of the period, in order: [{ day: "Mon", thisWeek: 64, lastWeek: 58 }, …]. The same rows can feed a table and a line chart. */
  data: Row[];
  /** The field of each row that is the category: a day, a date or a word. */
  x: string;
  /** The field that holds this period's values. */
  current: string;
  /** The field that holds the last period's values. */
  previous: string;
  /** The card's title. It names the figure too. */
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
  /** The plot's height. */
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
  style?: CSSProperties;
}

export function PeriodCompare({ data, x, current, previous, title, subtitle = "", format = "integer", xFormat, labels = {}, notes = {}, period, inverse = false, height = 200, empty, emptyLine, loading = false, styles, strings, style, ...rest }: PeriodCompareProps) {
  const str = useStrings("period-compare", strings);
  const locale = useLocale();
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = rechartsTheme(tk, reduced);
  const ui = useInteraction();
  const r = useRecipe(recipes["period-compare"], { state: { focus: ui.focused }, styles });
  // This period is the first series colour, solid; the last is the chart's grey, dashed and thinner. Both are always on, so there is no legend: the totals are the key.
  const s = useSeries([current, previous], [tk.chart.series1, tk.chart.previous]);
  const { rows, keys } = prepare(data, x, formatWords, xFormat, locale);
  const total = compareTotals(data, current, previous);
  const scale = lineScale(data, s.fields);
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
  const totals = [
    { field: current, value: total.current, size: "md", dashed: false },
    { field: previous, value: total.previous, size: "sm", dashed: true },
  ] as const;
  const lines = [{ width: t.kpi.loadWidthSm, height: t.kpi.loadLineHeight }, { width: t.kpi.loadWidthMd, height: t.kpi.loadValueHeight }, { width: t.kpi.loadWidthSm, height: t.kpi.loadLineHeight }];
  return (
    <ChartCard r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")} title={title} subtitle={subtitle} table={!loading && data.length ? { data, x, y: [current, previous], format, xFormat, labels } : null} style={style} root={rootProps(rest)}>
      <div data-af-part="compare" style={css(row, { alignItems: "stretch", flexWrap: "wrap" }, r.compare)}>
        {loading ? (
          <div data-af-part="side" style={css(box, { flexShrink: 0, justifyContent: "center" }, r.side)}>
            <LoadingLines lines={lines} label={str("loadingTotals")} />
          </div>
        ) : data.length ? (
          <div data-af-part="side" style={css(box, { flexShrink: 0, justifyContent: "center" }, r.side)}>
            {totals.map(({ field, value, size, dashed }) => (
              <figure key={field} data-af-part="figure" style={css(box, { margin: 0, flex: 1 }, r.figure)}>
                <figcaption data-af-part="caption" style={css(row, partStyle(r, "caption", { fontFamily: tk.chart.font }))}>
                  <span aria-hidden data-af-part="key" style={partStyle(r, "key", { flexShrink: 0, height: 0, borderTopStyle: dashed ? "dashed" : "solid", borderTopColor: s.colorOf(field) })} />
                  {labels[field] ?? field}
                </figcaption>
                <MetricValue value={value} format={format} size={size} />
                {!dashed ? (
                  <div data-af-part="foot" style={css(row, { flexWrap: "wrap" }, r.foot)}>
                    <Delta value={total.change} inverse={inverse} variant="badge" size="sm" />
                    <span data-af-part="period" style={css(text, partStyle(r, "period", { fontFamily: tk.chart.font }))}>{period ?? str("period")}</span>
                  </div>
                ) : null}
                {notes[field] ? <small data-af-part="note" style={css(text, partStyle(r, "note", { fontFamily: tk.chart.font }))}>{notes[field]}</small> : null}
              </figure>
            ))}
          </div>
        ) : null}
        <ChartFrame style={{ flexGrow: 1, flexShrink: 1, flexBasis: t.chart.listMinWidth }} height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
          {(width) => <RechartsLines tk={tk} theme={theme} ui={ui} plot={r.plot} hint={str("arrowKeys", { title })} rows={rows} s={s} labels={labels} format={format} formatWords={formatWords} scale={scale} area dashed={[previous]} width={width} height={height} />}
        </ChartFrame>
      </div>
    </ChartCard>
  );
}
