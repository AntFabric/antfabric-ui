import { useSyncExternalStore } from "react";
import { MOTION, resolveTokens, type NativeTokens } from "@antfabric-ui/core";
import { CHART_DRAW, CHART_GLIDE, seriesColors } from "@antfabric-ui/core/chart";
import { usePlatform } from "../platform";

/**
 * What a chart library needs that a CSS variable cannot give it: recharts writes SVG presentation attributes (`stroke`, `fill`), where
 * `var(--af-…)` is not reliable, and takes numbers, not `"2.25px"`. So the data components read the resolved tokens of the platform and
 * theme they are drawn in (`resolveTokens`, the same values the phone kit reads from `useTheme().t`). No component of the data
 * subpath reads `brand.*`, `success.*`, `danger.*` or `warning.*`: hues come from `chart.*` and `data.*`.
 */
export type ChartTokens = NativeTokens;

/** The tokens for this platform and theme, as plain values. Memoised by core, so every chart in a tree reads one frozen object. */
export function useChartTokens(): ChartTokens {
  const { platform, os, scheme, theme } = usePlatform();
  return resolveTokens(platform, scheme, { web: true, os, theme });
}

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (notify: () => void) => {
  if (typeof matchMedia === "undefined") return () => {};
  const list = matchMedia(query);
  list.addEventListener("change", notify);
  return () => list.removeEventListener("change", notify);
};

/** Whether the person asked for less movement. False on the server, so a chart's first render is the still one. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => typeof matchMedia !== "undefined" && matchMedia(query).matches,
    () => false,
  );
}

/**
 * recharts' animation props: off unless the chart asks to animate and the person has not asked for less movement. A chart draws in once,
 * over the duration of `grow-x` (the line grows from the left). recharts takes its easing by name, not as the kit's cubic-bezier.
 */
export function rechartsMotion(on: boolean, reduced: boolean) {
  return on && !reduced ? { isAnimationActive: true, animationDuration: MOTION["grow-x"].duration, animationEasing: "ease-out" as const } : { isAnimationActive: false };
}

/** recharts' animation props for a chart's own draw-in and its tweens: one curve, the kit's `ease.out` (recharts takes a `cubic-bezier(…)` string). Off under reduced motion. */
export function rechartsDraw(t: ChartTokens, reduced: boolean) {
  return reduced ? { isAnimationActive: false } : { isAnimationActive: true, animationDuration: CHART_DRAW, animationEasing: t.ease.out as "ease-out" };
}

/** The same for the tooltip's glide from one point to the next. */
export function rechartsGlide(t: ChartTokens, reduced: boolean) {
  return reduced ? { isAnimationActive: false } : { isAnimationActive: true, animationDuration: CHART_GLIDE, animationEasing: t.ease.out as "ease-out" };
}

/**
 * The chart tokens as recharts' own props: the dashed grid, the quiet axes, the crosshair, the tooltip's glide, the target line, the series
 * colours and the line and bar geometry. Spread them onto recharts' parts, so a chart the kit does not ship still matches the ones it does:
 *
 *   const theme = rechartsTheme(useChartTokens(), useReducedMotion());
 *   <CartesianGrid {...theme.grid} /> <XAxis dataKey="week" {...theme.axis} /> <Tooltip {...theme.tooltip} />
 *   <Line stroke={theme.series[0]} strokeWidth={theme.line.strokeWidth} {...theme.motion.draw} />
 */
export function rechartsTheme(t: ChartTokens, reduced = false) {
  const dashed = `${t.chart.gridDash} ${t.chart.gridGap}`;
  return {
    series: seriesColors(t),
    font: t.chart.font,
    /** Dashed horizontal rules; `vertical` for a horizontal bar chart's. */
    grid: { stroke: t.chart.grid, strokeDasharray: dashed, vertical: false },
    /** No axis line or tick marks; the label is the chart's quiet text. */
    axis: { axisLine: false, tickLine: false, tick: { fill: t.chart.label, fontSize: t.chart.labelSize, fontFamily: t.chart.font } },
    /** Where the pointer is: a dashed line through a point, or a wash behind a bar. */
    cursor: { line: { stroke: t.chart.crosshair, strokeWidth: t.border.wHairline, strokeDasharray: dashed }, bar: { fill: t.hover.surface, radius: t.radius.row } },
    /** The tooltip's glide between points, and the card it holds drawn with `ChartTooltip` (`content`). */
    tooltip: { ...rechartsGlide(t, reduced), cursor: { stroke: t.chart.crosshair, strokeWidth: t.border.wHairline, strokeDasharray: dashed } },
    /** A chart's own draw-in and its tween to new values, and the tooltip's glide. */
    motion: { draw: rechartsDraw(t, reduced), glide: rechartsGlide(t, reduced) },
    reference: { stroke: t.chart.reference, strokeDasharray: `${t.chart.referenceDash} ${t.chart.referenceGap}` },
    line: { strokeWidth: t.chart.lineW, strokeLinecap: "round" as const, dotRadius: t.chart.pointR, seriesDash: `${t.chart.seriesDash} ${t.chart.seriesGap}` },
    /** `maxBarSize` for grouped bars, `soloMaxBarSize` for a category that holds one bar (one series showing, or stacked). */
    bar: { radius: t.chart.barRadius, maxBarSize: t.chart.barMaxW, soloMaxBarSize: t.chart.barSoloW, gap: t.chart.barGap },
    /** The ring a point or a segment is cut from the card with. */
    card: t.surface.card,
  };
}
