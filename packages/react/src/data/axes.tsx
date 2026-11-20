import { CartesianGrid, XAxis, YAxis } from "recharts";
import { fmt, labelWidth, type FormatSpec, type FormatWords, type Scale } from "@antfabric-ui/core/chart";
import { rechartsTheme, type ChartTokens } from "./theme";

type Theme = ReturnType<typeof rechartsTheme>;

export interface AxesInput {
  tk: ChartTokens;
  theme: Theme;
  scale: Scale;
  format?: FormatSpec;
  /** The words the format writes (the chart's own strings). */
  formatWords: FormatWords;
  /** The Intl locale the ticks print in (`useLocale()`). */
  locale?: string;
  /** A horizontal bar chart: the categories run down the left and the values along the bottom. */
  horizontal?: boolean;
  /** Horizontal only: the width of the category labels. */
  catWidth?: number;
  /** Horizontal only: leave the value axis and the rules out (the bars carry their value labels). */
  hideValues?: boolean;
}

/**
 * The grid and the two axes of a cartesian chart, as the kit draws them: dashed rules across, no axis lines or tick marks, the labels in the chart's quiet
 * text. The value axis takes core's `niceScale` ticks, so the web prints the axis the phone does. They are returned as elements, not drawn by a component,
 * because recharts reads its children's types. A value axis draws no tick marks, so it keeps no room for them either (`tickSize` 0): the labels sit against the plot.
 */
export function cartesianAxes({ tk, theme, scale, format, formatWords, locale, horizontal = false, catWidth, hideValues = false }: AxesInput) {
  const value = { type: "number" as const, domain: [scale.min, scale.max] as [number, number], ticks: scale.ticks, tickFormatter: (v: number) => fmt(format, v, formatWords, locale), allowDataOverflow: true, ...theme.axis };
  const category = { type: "category" as const, dataKey: "__x", interval: "preserveStartEnd" as const, minTickGap: tk.space.xs, ...theme.axis };
  const valueW = labelWidth(scale.ticks.map((v) => fmt(format, v, formatWords, locale)), tk.chart.labelSize);
  const grid = <CartesianGrid key="grid" {...theme.grid} vertical={horizontal} horizontal={!horizontal} />;
  return horizontal
    ? [
        hideValues ? null : grid,
        <XAxis key="x" {...value} height={tk.chart.axisH} tickMargin={tk.space.xs} hide={hideValues} />,
        <YAxis key="y" {...category} width={catWidth} interval={0} tickSize={0} tickMargin={tk.space.xs} tick={{ ...theme.axis.tick, fill: tk.fg.body }} />,
      ]
    : [grid, <XAxis key="x" {...category} height={tk.chart.axisH} tickMargin={tk.space.sm} />, <YAxis key="y" {...value} width={valueW} tickSize={0} tickMargin={tk.space.xs} />];
}
