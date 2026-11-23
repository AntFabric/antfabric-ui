import type { CSSProperties } from "react";
import { Bar, BarChart, Cell, YAxis } from "recharts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { EARLIER_BARS, barLayout, fmt, valueDomain, type FormatSpec, type FormatWords, type Row } from "@antfabric/ui-core/chart";
import { type RootProps, rootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css } from "../../lib/style";
import { rechartsMotion, useChartTokens, useReducedMotion } from "../../data/theme";

export type SparkBarsTone = "default" | "positive" | "negative";

export interface SparkBarsProps extends RootProps<HTMLSpanElement> {
  /** Rows, one per period, in order. */
  data: Row[];
  /** The field of each row that is the value. A value that is not a number is left out. */
  y: string;
  /** Px. */
  width?: number;
  /** Px. */
  height?: number;
  /** Draws in once when it mounts. Off by default: a page holds many, and a table of them would all move at once. */
  animate?: boolean;
  /** The hue: the first series colour, or the data palette's gain or loss. */
  tone?: SparkBarsTone;
  /** A format name, its options or a function, as core's `fmt` takes: how the default label prints the latest value. Not drawn. */
  format?: FormatSpec;
  /** What a screen reader hears. Default: how many periods there are and the latest value, in `format`. */
  label?: string;
  /** Per-part styles over the theme: `{ root: {…} }`. */
  styles?: PartStyles<"spark-bars">;
  /** The built-in text, by key: what a screen reader hears by default. */
  strings?: Partial<KitStrings["spark-bars"]>;
  style?: CSSProperties;
}

/** The label's default number: two decimals at most, grouped, in the viewer's locale. */
const DEFAULT_FORMAT: FormatSpec = { type: "decimal", digits: 2 };

export function SparkBars({ data, y, width = 96, height = 36, animate = false, tone = "default", format = DEFAULT_FORMAT, label, styles, strings, style, ...rest }: SparkBarsProps) {
  const t = useChartTokens();
  const r = useRecipe(recipes["spark-bars"], { styles });
  const s = useStrings("spark-bars", strings);
  // The words a format writes (points, a duration, the dash) are the kit's, so the default label is said in the product's language.
  const formatWords: FormatWords = { unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const reduced = useReducedMotion();
  const values = data.map((row) => row[y]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const frame = css(partStyle(r, "root", { display: "inline-block", width, height, flexShrink: 0 }), style);
  if (!values.length) return <span data-af-part="root" {...rootProps(rest)} aria-hidden style={frame} />;
  const color = tone === "positive" ? t.data.positive : tone === "negative" ? t.data.negative : t.chart.series1;
  const rows = values.map((v, i) => ({ i, v }));
  const [lo, hi] = valueDomain(rows, ["v"]);
  const last = rows.length - 1;
  const { gap } = barLayout(width, rows.length, t.chart.barGap);
  const said = label || s("summary", { count: values.length, latest: fmt(format, values[last], formatWords, locale) });
  return (
    <span data-af-part="root" role="img" aria-label={said} {...rootProps(rest)} style={frame}>
      <BarChart accessibilityLayer={false} width={width} height={height} data={rows} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={gap / 2} style={{ display: "block" }}>
        <YAxis hide domain={[lo, hi === lo ? lo + 1 : hi]} />
        <Bar dataKey="v" maxBarSize={t.kpi.sparkBarMaxW} radius={[t.kpi.sparkBarRadius, t.kpi.sparkBarRadius, 0, 0]} tooltipType="none" {...rechartsMotion(animate, reduced)}>
          {rows.map((row) => (
            <Cell key={row.i} fill={color} fillOpacity={row.i === last ? 1 : EARLIER_BARS} />
          ))}
        </Bar>
      </BarChart>
    </span>
  );
}
