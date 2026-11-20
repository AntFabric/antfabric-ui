import type { CSSProperties } from "react";
import { Area, AreaChart, YAxis } from "recharts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { FLAT_FILL, fmt, valueDomain, type FormatSpec, type Row } from "@antfabric-ui/core/chart";
import { type RootProps, rootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css } from "../../lib/style";
import { rechartsMotion, useChartTokens, useReducedMotion } from "../../data/theme";

export type SparklineTone = "default" | "positive" | "negative";

export interface SparklineProps extends RootProps<HTMLSpanElement> {
  /** Rows, one per point, in order. */
  data: Row[];
  /** The field of each row that is the value. A value that is not a number is left out. */
  y: string;
  /** Px. */
  width?: number;
  /** Px. */
  height?: number;
  /** A flat fill under the line: the line's colour at one opacity, never a gradient. */
  area?: boolean;
  /** A dot on the last point, ringed in the card's colour. */
  marker?: boolean;
  /** Edge to edge, the fill running to the bottom: a trend bled into the foot of a card. */
  flush?: boolean;
  /** Draws in once when it mounts. Off by default: a page holds many, and a table of them would all move at once. */
  animate?: boolean;
  /** The hue: the first series colour, or the data palette's gain or loss. */
  tone?: SparklineTone;
  /** A format name, its options or a function, as core's `fmt` takes: how the default label prints the first and last value. Not drawn. */
  format?: FormatSpec;
  /** What a screen reader hears. Default: where the trend starts and ends, in `format`. */
  label?: string;
  /** Per-part styles over the theme: `{ root: {…} }`. */
  styles?: PartStyles<"sparkline">;
  /** The built-in text, by key: what a screen reader hears by default. */
  strings?: Partial<KitStrings["sparkline"]>;
  style?: CSSProperties;
}

/* The air a line gets above and below its extremes, as a share of its range: a line never runs along the frame; a flush one gets more under it for the fill. */
const AIR = 0.12;
const AIR_UNDER_FLUSH = 0.35;
/** The label's default number: two decimals at most, grouped, in the viewer's locale: `0.58` and `1,234,567`, not the raw `0.5833333`. */
const DEFAULT_FORMAT: FormatSpec = { type: "decimal", digits: 2 };

export function Sparkline({ data, y, width = 120, height = 32, area = false, marker = false, flush = false, animate = false, tone = "default", format = DEFAULT_FORMAT, label, styles, strings, style, ...rest }: SparklineProps) {
  const t = useChartTokens();
  const r = useRecipe(recipes.sparkline, { styles });
  const s = useStrings("sparkline", strings);
  const locale = useLocale();
  const reduced = useReducedMotion();
  const values = data.map((row) => row[y]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const frame = css(partStyle(r, "root", { display: flush ? "block" : "inline-block", width, height, flexShrink: 0 }), style);
  if (!values.length) return <span data-af-part="root" {...rootProps(rest)} aria-hidden style={frame} />;
  const color = tone === "positive" ? t.data.positive : tone === "negative" ? t.data.negative : t.chart.series1;
  const rows = values.map((v, i) => ({ i, v }));
  const [lo, hi] = valueDomain(rows, ["v"], { zero: false });
  const span = hi - lo || 1;
  const floor = lo - span * (flush ? AIR_UNDER_FLUSH : AIR);
  const edge = flush ? 0 : t.chart.pointR;
  const said = label || s("trend", { from: fmt(format, values[0], undefined, locale), to: fmt(format, values[values.length - 1], undefined, locale) });
  // One point has no line to draw: it is a dot.
  const dot = marker || rows.length === 1 ? (p: { index?: number; cx?: number; cy?: number }) => (p.index === rows.length - 1 ? <circle key="last" cx={p.cx} cy={p.cy} r={t.chart.pointR - 1} fill={color} stroke={t.surface.card} strokeWidth={t.border.wThick} /> : <g key={p.index} />) : false;
  return (
    <span data-af-part="root" {...rootProps(rest)} role="img" aria-label={said} style={frame}>
      <AreaChart accessibilityLayer={false} width={width} height={height} data={rows} margin={{ top: t.chart.pointR, right: edge, bottom: flush ? 0 : t.chart.pointR, left: edge }} style={{ display: "block" }}>
        <YAxis hide domain={[floor, hi + span * AIR]} />
        <Area dataKey="v" type="monotone" stroke={color} strokeWidth={t.chart.sparkW} fill={area ? color : "none"} fillOpacity={FLAT_FILL} dot={dot} activeDot={false} tooltipType="none" {...rechartsMotion(animate, reduced)} />
      </AreaChart>
    </span>
  );
}
