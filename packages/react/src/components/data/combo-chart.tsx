import type { CSSProperties } from "react";
import { type RootProps, rootProps } from "../../lib/root-props";
import { Bar, ComposedChart, DefaultZIndexes, Line, ReferenceLine, Tooltip } from "recharts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { barScale, prepare, summarize, tipRows, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric-ui/core/chart";
import { useInteraction } from "../../lib/interaction";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css } from "../../lib/style";
import { cartesianAxes } from "../../data/axes";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { Legend } from "../../data/legend";
import { rechartsTheme, useChartTokens, useReducedMotion } from "../../data/theme";
import { ChartTooltip, hoveredRow, type TipContentArgs } from "../../data/tooltip";

export interface ComboChartProps extends RootProps<HTMLDivElement> {
  /** Rows, one per category, in order. */
  data: Row[];
  /** The field of each row that is the category: a date or a word. */
  x: string;
  /** The field drawn as bars: what happened. */
  bars: string;
  /** The field drawn as a dashed line over the bars: a forecast, a plan. */
  line: string;
  /** The card's title. It names the figure too. */
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
  styles?: PartStyles<"combo-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["combo-chart"]>;
  /** The card title's heading level, 1 to 6, so the chart keeps the page's heading order. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: CSSProperties;
}

/** The space between bars, as a share of a bar's slot. */
const BAR_GAP = "32%";

export function ComboChart({ data, x, bars, line, title, subtitle = "", headline, format = "integer", xFormat, labels = {}, target, targetLabel = "", height = 260, empty, emptyLine, loading = false, hidden, onHiddenChange, styles, strings, headingLevel, style, ...rest }: ComboChartProps) {
  const str = useStrings("combo-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = rechartsTheme(tk, reduced);
  const ui = useInteraction();
  const r = useRecipe(recipes["combo-chart"], { state: { focus: ui.focused }, styles });
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
  return (
    <ChartCard
      headingLevel={headingLevel}
      root={rootProps(rest)}
      legend={!loading && data.length > 0 ? <Legend series={s} labels={labels} label={str("legend")} /> : null}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && data.length ? { data, x, y: [bars, line], format, xFormat, labels } : null}
      style={style}
    >
      <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) => (
          <div data-af-part="plot" data-af-plot onFocus={ui.handlers.onFocus} onBlur={ui.handlers.onBlur} style={css(box, r.plot)}>
            <ComposedChart aria-label={str("arrowKeys", { title })} width={width} height={height} data={rows} margin={{ top: tk.space.smMd, right: tk.space.md, bottom: 0, left: 0 }} barCategoryGap={BAR_GAP} style={{ display: "block" }}>
              {cartesianAxes({ tk, theme, scale, format, formatWords, locale })}
              <Tooltip
                {...theme.tooltip}
                // ComposedChart draws its cursor as a line whatever it is given (only BarChart draws a wash), so it is the line charts' crosshair.
                cursor={theme.cursor.line}
                content={(args: TipContentArgs) => {
                  const row = hoveredRow(args);
                  return row ? <ChartTooltip tip={tipRows(row, { fields: s.visible, labels, colorOf: s.colorOf, format, formatWords, locale })} /> : null;
                }}
              />
              {s.visible.includes(bars) ? <Bar dataKey={bars} name={labels[bars] ?? bars} fill={s.colorOf(bars)} radius={[theme.bar.radius, theme.bar.radius, 0, 0]} maxBarSize={theme.bar.soloMaxBarSize} {...theme.motion.draw} /> : null}
              {s.visible.includes(line) ? (
                <Line
                  dataKey={line}
                  name={labels[line] ?? line}
                  type="linear"
                  stroke={s.colorOf(line)}
                  // Drawn as PeriodCompare's last period is (thinner, dashed, round-ended), and behind the bars, so a bar keeps its own top where the two meet.
                  // It sits in recharts' own area layer (over the grid, under the bars; this chart has no area): a layer of our own is registered through
                  // recharts' batched store and only appears on a later frame, so when it is drawn would depend on timing.
                  strokeWidth={tk.chart.previousW}
                  strokeDasharray={theme.line.seriesDash}
                  strokeLinecap={theme.line.strokeLinecap}
                  zIndex={DefaultZIndexes.area}
                  // Its points stay over the bars (recharts keeps a line's dots on their own, higher layer): solid, ringed by the card, and not dashed like the line.
                  dot={{ r: theme.line.dotRadius - 1 + tk.border.wThick / 2, fill: s.colorOf(line), stroke: theme.card, strokeWidth: tk.border.wThick, strokeDasharray: "none" }}
                  activeDot={{ r: theme.line.dotRadius + 1, fill: s.colorOf(line), stroke: theme.card, strokeWidth: tk.chart.activeRing }}
                  {...theme.motion.draw}
                />
              ) : null}
              {target !== undefined ? (
                <ReferenceLine y={target} {...theme.reference} label={targetLabel ? { value: targetLabel, position: "insideTopLeft", fill: tk.fg.muted, fontSize: tk.chart.labelSize, fontWeight: tk.font.weightSemibold, fontFamily: theme.font } : undefined} />
              ) : null}
            </ComposedChart>
          </div>
        )}
      </ChartFrame>
    </ChartCard>
  );
}
