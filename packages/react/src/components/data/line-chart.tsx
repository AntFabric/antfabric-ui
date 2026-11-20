import type { CSSProperties } from "react";
import { type RootProps, rootProps } from "../../lib/root-props";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { lineScale, prepare, summarize, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric-ui/core/chart";
import { useInteraction } from "../../lib/interaction";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { Legend } from "../../data/legend";
import { RechartsLines } from "../../data/lines";
import { rechartsTheme, useChartTokens, useReducedMotion } from "../../data/theme";

export type { ChartHeadline };

export interface LineChartProps extends RootProps<HTMLDivElement> {
  /** Rows, one per point, in order. The same rows can feed a table, a stat and a bar chart. */
  data: Row[];
  /** The field of each row that is the category: a date or a word. */
  x: string;
  /** The field, or fields (one to five), that are the values. */
  y: string | string[];
  /** The card's title. It names the figure too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** A format name, its options, or a function: what core's `fmt` takes. The axis, the tooltip and the table print through it. */
  format?: FormatSpec;
  /** The category's format, for a date: `"month"`, `"day"`. */
  xFormat?: FormatSpec;
  /** A field's name for people, for the legend and the tooltip: `{ opened: "Opened" }`. */
  labels?: Record<string, string>;
  /** A flat fill under the first series: its colour at one opacity, never a gradient. */
  area?: boolean;
  /** Each series gets its own dash and marker besides its colour, in the plot and in the legend, so two series are never told apart by hue alone. */
  marks?: boolean;
  /** A reference line at this value: a goal, a limit. The scale takes it in. */
  target?: number;
  /** What the target line says, at its right end. */
  targetLabel?: string;
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
  styles?: PartStyles<"line-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["line-chart"]>;
  /** The card title's heading level, 1 to 6, so the chart keeps the page's heading order. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: CSSProperties;
}

/** The most series a line chart draws: what the phone's library takes (`data` to `data5`), and the web draws the same five, so both kits show the same chart. */
const MOST = 5;


export function LineChart({ data, x, y, title, subtitle = "", headline, format = "integer", xFormat, labels = {}, area = false, marks = false, target, targetLabel = "", height = 240, empty, emptyLine, loading = false, hidden, onHiddenChange, styles, strings, headingLevel, style, ...rest }: LineChartProps) {
  const str = useStrings("line-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = rechartsTheme(tk, reduced);
  const ui = useInteraction();
  const r = useRecipe(recipes["line-chart"], { state: { focus: ui.focused }, styles });
  const every = [y].flat();
  const fields = every.slice(0, MOST);
  const s = useSeries(fields, theme.series, { hidden, onHiddenChange });
  const { rows, keys, ordered } = prepare(data, x, formatWords, xFormat, locale);
  const scale = lineScale(data, s.visible, target);
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
      legend={!loading && data.length > 0 ? <Legend series={s} labels={labels} label={str("legend")} marks={marks} /> : null}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && data.length ? { data, x, y: every, format, xFormat, labels } : null}
      style={style}
    >
      <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) => <RechartsLines tk={tk} theme={theme} ui={ui} plot={r.plot} hint={str("arrowKeys", { title })} rows={rows} s={s} labels={labels} format={format} formatWords={formatWords} scale={scale} area={area} marks={marks} target={target} targetLabel={targetLabel} width={width} height={height} />}
      </ChartFrame>
    </ChartCard>
  );
}
