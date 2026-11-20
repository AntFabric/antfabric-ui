import { useLocale } from "@antfabric/ui-core";
import { Area, ComposedChart, Line, ReferenceLine, Tooltip } from "recharts";
import { FLAT_FILL, markPath, seriesMark, tipRows, type FormatSpec, type FormatWords, type PreparedRow, type Scale, type Series } from "@antfabric/ui-core/chart";
import type { Interaction } from "../lib/interaction";
import { box, css } from "../lib/style";
import { cartesianAxes } from "./axes";
import { rechartsTheme, type ChartTokens } from "./theme";
import { ChartTooltip, hoveredRow, type TipContentArgs } from "./tooltip";

export interface RechartsLinesProps {
  tk: ChartTokens;
  theme: ReturnType<typeof rechartsTheme>;
  /** The plot's keyboard focus: the chart's own `useInteraction`, and the recipe's `plot` style (its focus edge). */
  ui: Interaction;
  plot: React.CSSProperties;
  /** What a screen reader hears when keyboard focus lands on the plot: the chart's name, then how to read it (the chart's `arrowKeys` string). */
  hint: string;
  rows: PreparedRow[];
  /** The series to draw as lines: the ones showing. */
  s: Series;
  labels: Record<string, string>;
  format?: FormatSpec;
  /** The words the format writes (the chart's own strings). */
  formatWords: FormatWords;
  scale: Scale;
  /** A flat fill under the first series. */
  area?: boolean;
  target?: number;
  targetLabel?: string;
  /** The series drawn dashed and thinner (`chart.previousW`): the last period, in PeriodCompare. */
  dashed?: string[];
  /** Each series gets its own dash and marker (`seriesMark`) besides its colour: WCAG 1.4.1, for people who cannot tell the hues apart. The legend draws the same (`Legend marks`). */
  marks?: boolean;
  width: number;
  height: number;
}

/**
 * recharts' ComposedChart as LineChart and PeriodCompare draw it: the grid and axes, the tooltip, a flat fill under the first series, a line per series
 * (one point is a dot) and a target. The same rows, scale and tooltip rows as the phone's. A series in `dashed` is thinner and dashed, and keeps its colour.
 */
export function RechartsLines({ tk, theme, ui, plot, hint, rows, s, labels, format, formatWords, scale, area = false, target, targetLabel = "", dashed = [], marks = false, width, height }: RechartsLinesProps) {
  const locale = useLocale();
  const one = rows.length === 1;
  return (
    <div data-af-part="plot" data-af-plot onFocus={ui.handlers.onFocus} onBlur={ui.handlers.onBlur} style={css(box, plot)}>
      <ComposedChart aria-label={hint} width={width} height={height} data={rows} margin={{ top: tk.space.smMd, right: tk.space.md, bottom: 0, left: 0 }} style={{ display: "block" }}>
        {cartesianAxes({ tk, theme, scale, format, formatWords, locale })}
        <Tooltip
          {...theme.tooltip}
          content={(args: TipContentArgs) => {
            const row = hoveredRow(args);
            return row ? <ChartTooltip tip={tipRows(row, { fields: s.visible, labels, colorOf: s.colorOf, format, formatWords, locale })} /> : null;
          }}
        />
        {/* A fill under the first series only: two fills over each other mix into a colour neither series has. */}
        {area ? s.visible.slice(0, 1).map((f) => <Area key={`area-${f}`} dataKey={f} type="linear" stroke="none" fill={s.colorOf(f)} fillOpacity={FLAT_FILL} activeDot={false} tooltipType="none" {...theme.motion.draw} />) : null}
        {s.visible.map((f) => {
          // Another channel than hue: a dash pattern and a marker at each point (not past 40 points, where they would be a band).
          const mark = marks ? seriesMark(s.fields.indexOf(f)) : null;
          const dash = mark && mark.dash.length ? mark.dash.map((n) => n * theme.line.strokeWidth).join(" ") : undefined;
          const marker = mark && rows.length <= 40 ? ({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) => <path key={index} d={markPath(mark.shape, cx ?? 0, cy ?? 0, theme.line.dotRadius * 2)} fill={mark.shape === "cross" ? "none" : s.colorOf(f)} stroke={s.colorOf(f)} strokeWidth={tk.border.wThick} /> : null;
          return (
          <Line
            key={f}
            dataKey={f}
            name={labels[f] ?? f}
            type="linear"
            stroke={s.colorOf(f)}
            strokeWidth={dashed.includes(f) ? tk.chart.previousW : theme.line.strokeWidth}
            strokeDasharray={dashed.includes(f) ? theme.line.seriesDash : dash}
            strokeLinecap={theme.line.strokeLinecap}
            // One point has no line to draw: it is a dot, with a whole ring even on a dashed series (a line's dots take its dashes otherwise).
            dot={one ? { r: theme.line.dotRadius, fill: theme.card, stroke: s.colorOf(f), strokeWidth: tk.border.wThick, strokeDasharray: "none" } : (marker ?? false)}
            activeDot={{ r: theme.line.dotRadius + 1, fill: s.colorOf(f), stroke: theme.card, strokeWidth: tk.chart.activeRing }}
            {...theme.motion.draw}
          />
          );
        })}
        {target !== undefined ? (
          <ReferenceLine y={target} {...theme.reference} label={targetLabel ? { value: targetLabel, position: "insideTopRight", fill: tk.fg.muted, fontSize: tk.chart.labelSize, fontWeight: tk.font.weightSemibold, fontFamily: theme.font } : undefined} />
        ) : null}
      </ComposedChart>
    </div>
  );
}
