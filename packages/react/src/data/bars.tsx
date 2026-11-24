import { useId, useState } from "react";
import { useLocale } from "@antfabric/ui-core";
import { Bar, BarChart as RBarChart, Cell, LabelList, ReferenceLine, Tooltip } from "recharts";
import { DIMMED, bySign, fitLabel, fmt, labelWidth, seriesMark, tipRows, type FormatSpec, type FormatWords, type PreparedRow, type Row, type Scale, type Series } from "@antfabric/ui-core/chart";
import type { Interaction } from "../lib/interaction";
import { box, css } from "../lib/style";
import { cartesianAxes } from "./axes";
import { rechartsTheme, type ChartTokens } from "./theme";
import { TexturePattern } from "./texture";
import { ChartTooltip, hoveredRow, type TipContentArgs } from "./tooltip";

export interface RechartsBarsProps {
  tk: ChartTokens;
  theme: ReturnType<typeof rechartsTheme>;
  /** The plot's keyboard focus: the chart's own `useInteraction`, and the recipe's `plot` style (its focus edge). */
  ui: Interaction;
  plot: React.CSSProperties;
  /** What a screen reader hears when keyboard focus lands on the plot: the chart's name, then how to read it (the chart's `arrowKeys` string). */
  hint: string;
  /** The data the rows were made from: whether a single series has a loss is read from it. */
  data: Row[];
  rows: PreparedRow[];
  /** The category of each row as text, in order (`prepare`'s `keys`). */
  keys: string[];
  /** Every bar field, then the ones showing (`s.visible`) are drawn. */
  fields: string[];
  s: Series;
  labels: Record<string, string>;
  format?: FormatSpec;
  /** The words the format writes (the chart's own strings). */
  formatWords: FormatWords;
  scale: Scale;
  stacked?: boolean;
  /** The label of the total's row in a stack's tooltip. Needed when `stacked`. */
  totalLabel?: string;
  horizontal?: boolean;
  /**
   * The fill is the plot's own ink (`currentColor`), which eases to a new colour over `motion.duration.slow`. recharts gives each bar a new element as its value moves, so a
   * transition on the bar's own fill never runs; one on the element they inherit from does. For a chart whose one series changes colour (MetricTabs), which sets that
   * `color` and its transition on the `plot` style it passes in.
   */
  easeColor?: boolean;
  /** Each series past the first is filled with its texture (`seriesMark(i).texture`) over its colour: WCAG 1.4.1, for people who cannot tell the hues apart. The legend draws the same (`Legend marks="texture"`). */
  marks?: boolean;
  width: number;
  height: number;
}

/** The space between category groups, as a share of a group: a little more between a horizontal chart's rows. */
const GROUP_GAP = { vertical: "30%", horizontal: "26%" } as const;
/** recharts' state when the pointer is over a category: its index, as a number or a string. */
const indexOf = (state: { activeTooltipIndex?: number | string | null }): number | null => (state.activeTooltipIndex == null || state.activeTooltipIndex === "" ? null : Number(state.activeTooltipIndex));

/**
 * recharts' BarChart as BarChart and MetricTabs draw it: grouped, stacked or horizontal bars, the category under the pointer lit and the rest stepped
 * back, value labels at the ends of a single horizontal series, a colour by sign for a single series with a loss. A bar's fill eases to a new colour, and
 * the same bars tween to new heights when the rows change under the same data key.
 */
export function RechartsBars({ tk, theme, ui, plot, hint, data, rows, keys, fields, s, labels, format, formatWords, scale, stacked = false, totalLabel, horizontal = false, easeColor = false, marks = false, width, height }: RechartsBarsProps) {
  const locale = useLocale();
  const [active, setActive] = useState<number | null>(null);
  // A single series with a loss colours each bar by its sign, so a bar below zero reads as a loss.
  const signed = bySign(data, fields, stacked);
  // A horizontal single series gets its value at the bar's end and no value axis.
  const endLabels = horizontal && fields.length === 1;
  const last = s.visible[s.visible.length - 1];
  const radius = theme.bar.radius;
  // One bar to a category (a single series showing, or a stack) has the room to itself, so it grows wider than a grouped one.
  const maxBarSize = horizontal ? tk.chart.barH : stacked || s.visible.length === 1 ? theme.bar.soloMaxBarSize : theme.bar.maxBarSize;
  const radiusOf = (f: string): number | [number, number, number, number] => {
    if (signed) return tk.chart.signedRadius;
    if (stacked && f !== last) return 0;
    return horizontal ? [0, radius, radius, 0] : [radius, radius, 0, 0];
  };
  // Long category labels are cut to the room the axis gives them; the tooltip has the full one.
  const catWidth = Math.min(labelWidth(keys, tk.chart.labelSize) + tk.space["2xs"], width * 0.4);
  // A texture is a pattern of the series' colour and the card's: its own id, from this chart's, so two charts never share one.
  const uid = useId().replace(/\W/g, "");
  const textureOf = (f: string) => (marks ? seriesMark(s.fields.indexOf(f)).texture : "none");
  const patternOf = (f: string) => `af-chart-${uid}t${s.fields.indexOf(f)}`;
  const fillOf = (f: string) => (easeColor ? "currentColor" : textureOf(f) !== "none" ? `url(#${patternOf(f)})` : s.colorOf(f));
  const shown = horizontal ? rows.map((row) => ({ ...row, __x: fitLabel(row.__x, catWidth - tk.space.md, tk.chart.labelSize), __full: row.__x })) : rows;
  return (
    <div data-af-part="plot" data-af-plot onFocus={ui.handlers.onFocus} onBlur={ui.handlers.onBlur} style={css(box, plot)}>
      <RBarChart
        aria-label={hint}
        width={width}
        height={height}
        data={shown}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: tk.space.smMd, right: endLabels ? tk.chart.endLabelRoom : tk.space.md, bottom: 0, left: 0 }}
        barCategoryGap={horizontal ? GROUP_GAP.horizontal : GROUP_GAP.vertical}
        barGap={theme.bar.gap}
        style={{ display: "block" }}
        onMouseMove={(state) => setActive(indexOf(state))}
        onMouseLeave={() => setActive(null)}
      >
        {marks ? (
          <defs>
            {s.visible.map((f) => (textureOf(f) === "none" ? null : <TexturePattern key={f} id={patternOf(f)} texture={textureOf(f)} ink={theme.card} fill={s.colorOf(f)} />))}
          </defs>
        ) : null}
        {cartesianAxes({ tk, theme, scale, format, formatWords, locale, horizontal, catWidth, hideValues: endLabels })}
        {scale.min < 0 ? <ReferenceLine {...(horizontal ? { x: 0 } : { y: 0 })} stroke={tk.chart.axis} /> : null}
        <Tooltip
          {...theme.tooltip}
          cursor={theme.cursor.bar}
          content={(args: TipContentArgs) => {
            const row = hoveredRow(args);
            if (!row) return null;
            const full = (row.__full as string | undefined) ?? (row.__x as string);
            return <ChartTooltip totalLabel={totalLabel} tip={tipRows({ ...row, __x: full }, { fields: s.visible, labels, colorOf: s.colorOf, format, formatWords, locale, stacked, signColors: signed ? { positive: tk.data.positive, negative: tk.data.negative } : undefined })} />;
          }}
        />
        {s.visible.map((f) => (
          <Bar
            key={f}
            dataKey={f}
            name={labels[f] ?? f}
            stackId={stacked ? "stack" : undefined}
            fill={fillOf(f)}
            radius={radiusOf(f)}
            maxBarSize={maxBarSize}
            stroke={stacked ? theme.card : undefined}
            strokeWidth={stacked ? tk.chart.stackGap : 0}
            {...theme.motion.draw}
          >
            {shown.map((row, i) => (
              <Cell
                key={i}
                fill={signed ? (((row as Row)[f] as number) < 0 ? tk.data.negative : tk.data.positive) : fillOf(f)}
                fillOpacity={active === null || active === i ? 1 : DIMMED}
                style={{ transition: `fill-opacity ${tk.duration.base}, fill ${tk.duration.slow}` }}
              />
            ))}
            {endLabels ? <LabelList dataKey={f} position="right" offset={tk.space.sm} formatter={(v: unknown) => fmt(format, v, formatWords, locale)} style={{ fill: tk.fg.body, fontSize: tk.text.caption, fontWeight: tk.font.weightSemibold, fontFamily: theme.font, fontVariantNumeric: "tabular-nums" }} /> : null}
          </Bar>
        ))}
      </RBarChart>
    </div>
  );
}
