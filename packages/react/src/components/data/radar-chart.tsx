import type { CSSProperties } from "react";
import { type RootProps, rootProps } from "../../lib/root-props";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RechartsRadarChart, Tooltip } from "recharts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { FLAT_FILL, clampScore, prepare, summarize, tipRows, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { useInteraction } from "../../lib/interaction";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css } from "../../lib/style";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { Legend } from "../../data/legend";
import { rechartsTheme, useChartTokens, useReducedMotion } from "../../data/theme";
import { ChartTooltip, hoveredRow, type TipContentArgs } from "../../data/tooltip";

export type { ChartHeadline };

export interface RadarChartProps extends RootProps<HTMLDivElement> {
  /** Rows, one per axis: `[{ area: "Accuracy", q4: 86, q3: 78 }, …]`. The same rows can feed a table and a bar chart. */
  data: Row[];
  /** The field of each row that names its axis. */
  x: string;
  /** The field, or fields (one to five), that are the scores: one polygon each. */
  y: string | string[];
  /** The card's title. It names the figure too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** What a score at the outer ring is. A score past it is drawn on the ring; the tooltip and the table still say the real number. */
  max?: number;
  /** A format name, its options, or a function: what core's `fmt` takes. The tooltip, the summary and the table print through it. */
  format?: FormatSpec;
  /** A field's name for people, for the legend and the tooltip: `{ q4: "Q4 2026" }`. */
  labels?: Record<string, string>;
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
  styles?: PartStyles<"radar-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["radar-chart"]>;
  /** The card title's heading level, 1 to 6, so the chart keeps the page's heading order. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: CSSProperties;
}

/** The most polygons a radar draws: past five they are a tangle, and the phone's library draws the same five. */
const MOST = 5;
/** The polygon's size, as a share of the room the plot has left for the axes' names. */
const OUTER = "72%";
/** Rings across the grid, as recharts counts ticks: the centre and four rings. */
const RINGS = 5;

export function RadarChart({ data, x, y, title, subtitle = "", headline, max = 100, format = "integer", labels = {}, height = 280, empty, emptyLine, loading = false, hidden, onHiddenChange, styles, strings, headingLevel, style, ...rest }: RadarChartProps) {
  const str = useStrings("radar-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = rechartsTheme(tk, reduced);
  const ui = useInteraction();
  const r = useRecipe(recipes["radar-chart"], { state: { focus: ui.focused }, styles });
  const fields = [y].flat().slice(0, MOST);
  const s = useSeries(fields, theme.series, { hidden, onHiddenChange });
  const { rows, keys } = prepare(data, x, formatWords, undefined, locale);
  // A score is held to the scale for drawing, so no polygon leaves the outer ring; the tooltip reads the row as it was.
  const plotted = rows.map((row) => ({ ...row, ...Object.fromEntries(fields.map((f) => [f, clampScore(row[f], max)])) }));
  const summary = summarize({ label: title, data, keys, fields: s.visible, labels, format, formatWords, locale, ordered: false }, {
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
      table={!loading && data.length ? { data, x, y: fields, format, labels } : null}
      style={style}
    >
      <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) => (
          <div data-af-part="plot" data-af-plot onFocus={ui.handlers.onFocus} onBlur={ui.handlers.onBlur} style={css(box, r.plot)}>
            <RechartsRadarChart aria-label={str("arrowKeys", { title })} width={width} height={height} data={plotted} outerRadius={OUTER} margin={{ top: tk.space.xs, right: tk.space["2xl"], bottom: tk.space.xs, left: tk.space["2xl"] }} style={{ display: "block" }}>
              <PolarGrid stroke={theme.grid.stroke} />
              <PolarAngleAxis dataKey="__x" tick={{ fill: tk.fg.body, fontSize: tk.chart.labelSize, fontFamily: theme.font }} />
              <PolarRadiusAxis domain={[0, max]} tick={false} axisLine={false} tickCount={RINGS} />
              <Tooltip
                {...theme.tooltip}
                content={(args: TipContentArgs) => {
                  const row = hoveredRow(args);
                  return row ? <ChartTooltip tip={tipRows(rows[row.__i as number]!, { fields: s.visible, labels, colorOf: s.colorOf, format, formatWords, locale })} /> : null;
                }}
              />
              {s.visible.map((f) => (
                <Radar
                  key={f}
                  dataKey={f}
                  name={labels[f] ?? f}
                  stroke={s.colorOf(f)}
                  strokeWidth={theme.line.strokeWidth}
                  fill={s.colorOf(f)}
                  fillOpacity={FLAT_FILL}
                  dot={{ r: theme.line.dotRadius - 1, fill: s.colorOf(f), strokeWidth: 0 }}
                  activeDot={{ r: theme.line.dotRadius + 1, fill: s.colorOf(f), stroke: theme.card, strokeWidth: tk.chart.activeRing }}
                  {...theme.motion.draw}
                />
              ))}
            </RechartsRadarChart>
          </div>
        )}
      </ChartFrame>
    </ChartCard>
  );
}
