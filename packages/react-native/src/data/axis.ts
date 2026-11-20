import { PixelRatio } from "react-native";
import { fmt, labelWidth, type FormatSpec, type FormatWords, type Scale } from "@antfabric/ui-core/chart";
import { fontScale } from "../lib/type";
import { giftedTheme, type ChartTokens } from "./theme";

/** How much the person's text size is let to grow a chart's axis labels (`fontScale.chrome`): the labels are drawn at their size times this, never more. Their width is worked out the same, so they do not clip. */
export const labelScale = () => Math.min(PixelRatio.getFontScale(), fontScale.chrome);

type Theme = ReturnType<typeof giftedTheme>;

/**
 * core's `niceScale` as gifted-charts' value axis, so the phone prints the ticks the web does. gifted-charts takes a range above an offset
 * (`yAxisOffset`, `maxValue`, `stepValue`, `noOfSections`) and, for what is under zero, a number of sections below the axis and the most negative
 * value. Its `height` is the part above zero: `plotHeight` below shrinks the plot by the sections under it, so the card keeps its height.
 */
export function giftedAxis({ tk, theme, scale, format, formatWords, locale }: { tk: ChartTokens; theme: Theme; scale: Scale; format?: FormatSpec; formatWords: FormatWords; locale?: string }) {
  const below = scale.min < 0 ? Math.round(-scale.min / scale.step) : 0;
  const labelW = labelWidth(scale.ticks.map((v) => fmt(format, v, formatWords, locale)), tk.chart.labelSize * labelScale());
  return {
    ...theme.axis,
    noOfSections: Math.round(scale.max / scale.step) - (scale.min > 0 ? Math.round(scale.min / scale.step) : 0),
    stepValue: scale.step,
    maxValue: scale.max - Math.max(0, scale.min),
    ...(scale.min > 0 ? { yAxisOffset: scale.min } : {}),
    ...(below ? { noOfSectionsBelowXAxis: below, mostNegativeValue: scale.min } : {}),
    formatYLabel: (label: string) => fmt(format, Number(label), formatWords, locale),
    yAxisLabelWidth: labelW,
  };
}

/** The part of the chart's height that is above zero, as gifted-charts' `height` takes it: the height of the plot (under the label band), less the sections that are below the axis. */
export function plotHeight(tk: ChartTokens, height: number, axis: ReturnType<typeof giftedAxis>): number {
  const below = axis.noOfSectionsBelowXAxis ?? 0;
  return (height - tk.chart.labelBand) * (axis.noOfSections / (axis.noOfSections + below));
}

/** The width left for the plot once the value labels have theirs. */
export const plotWidth = (tk: ChartTokens, width: number, axis: { yAxisLabelWidth: number }): number => Math.max(tk.chart.plotMinW, width - axis.yAxisLabelWidth - tk.space.xs);
