import { useEffect, useState } from "react";
import { AccessibilityInfo, PixelRatio, Platform, type TextStyle } from "react-native";
import type { NativeTokens } from "@antfabric-ui/core";
import { CHART_DRAW, seriesColors } from "@antfabric-ui/core/chart";
import { useTheme } from "../theme";
import { fontScale } from "../lib/type";

/**
 * What a chart library needs that a StyleSheet cannot give it: gifted-charts takes plain values and styles as props, not tokens. The
 * data components read the resolved tokens of the phone's scheme and OS, `useTheme().t`. No component of the data subpath reads
 * `brand.*`, `success.*`, `danger.*` or `warning.*`: hues come from `chart.*` and `data.*`.
 */
export type ChartTokens = NativeTokens;

/** The tokens for this scheme and OS, as plain values. */
export function useChartTokens(): ChartTokens {
  return useTheme().t;
}

/** Chart text weights, the files of `chart.file*` (the phone loads one Geist file per weight). */
export type ChartWeight = "regular" | "medium" | "semibold" | "bold";

/**
 * Geist for chart text: the weight's file on a device, the family and the weight in a browser (the catalogue, through React Native
 * Web). The same job `font()` does for the theme's fonts; chart text is not in them, so it has its own.
 */
export function chartFont(t: ChartTokens, weight: ChartWeight = "regular"): TextStyle {
  if (Platform.OS === "web") return { fontFamily: t.chart.font, fontWeight: { regular: "400", medium: "500", semibold: "600", bold: "700" }[weight] as TextStyle["fontWeight"] };
  return { fontFamily: { regular: t.chart.fileRegular, medium: t.chart.fileMedium, semibold: t.chart.fileSemibold, bold: t.chart.fileBold }[weight] };
}

/** Whether the person asked for less movement. False until the system answers, so a chart's first render is the still one. */
export function useReducedMotion(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setOn, () => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setOn);
    return () => sub?.remove();
  }, []);
  return on;
}

/**
 * gifted-charts' `isAnimated`: on, unless the person reduces motion, and never under React Native Web, where the `Animated` values it
 * animates with reach the DOM as `[object Object]` (they are for react-native-svg on a device). Off is the catalogue's and `pnpm check`'s.
 */
export const giftedAnimated = (animate: boolean, reduced: boolean) => animate && !reduced && Platform.OS !== "web";

/**
 * The chart tokens as gifted-charts' own props: the dashed rules, the quiet axes, the target line, the pointer, the tooltip card's room, the
 * motion, the series colours and the line and bar geometry. Spread them onto gifted-charts' charts, so a chart the kit does not ship still
 * matches the ones it does:
 *
 *   const theme = giftedTheme(useChartTokens(), useReducedMotion());
 *   <LineChart {...theme.axis} {...theme.motion} data={rows} color={theme.series[0]} thickness={theme.line.thickness} />
 */
export function giftedTheme(t: ChartTokens, reduced = false) {
  // gifted-charts' text has no `maxFontSizeMultiplier` to set, so the cap is in the size: the system multiplies it by the text size, and this holds the product at `fontScale.chrome`.
  const size = t.chart.labelSize * Math.min(1, fontScale.chrome / PixelRatio.getFontScale());
  const text = (weight: ChartWeight = "regular", extra?: TextStyle): TextStyle => ({ color: t.chart.label, fontSize: size, ...chartFont(t, weight), ...extra });
  return {
    series: seriesColors(t),
    /** A chart text style: always its own colour, size and font file, because a `Text` inherits nothing. */
    text,
    /** No axis line on the value side, a hairline along the bottom, dashed rules, no background; the labels are the chart's quiet text. */
    axis: {
      yAxisThickness: 0,
      xAxisThickness: t.border.wHairline,
      xAxisColor: t.chart.axis,
      yAxisTextStyle: text(),
      xAxisLabelTextStyle: text("regular", { textAlign: "center" }),
      rulesType: "dashed" as const,
      rulesColor: t.chart.grid,
      rulesThickness: t.border.wHairline,
      dashWidth: t.chart.gridDash,
      dashGap: t.chart.gridGap,
      backgroundColor: "transparent",
      disableScroll: true,
    },
    /** A chart's draw-in: on unless the person reduces motion, and never under react-native-web. */
    motion: { isAnimated: giftedAnimated(true, reduced), animationDuration: CHART_DRAW },
    line: { thickness: t.chart.lineW, dataPointsRadius: t.chart.pointR, curved: false, seriesDash: [t.chart.seriesDash, t.chart.seriesGap] },
    /** A target or threshold line: `referenceLine1Config={{ ...theme.reference, labelText }}`. */
    reference: { color: t.chart.reference, thickness: t.border.wHairline, type: "dashed" as const, dashWidth: t.chart.referenceDash, dashGap: t.chart.referenceGap },
    /** Where the finger is: a dashed strip through a point (`pointerConfig`). */
    pointer: { pointerStripColor: t.chart.crosshair, pointerStripWidth: t.border.wHairline, strokeDashArray: [t.chart.gridDash, t.chart.gridGap], radius: t.chart.pointR },
    /** The room gifted-charts keeps for a tooltip card (`ChartTooltip`) before it is drawn: its width, and its height for a number of series. */
    tooltip: { width: t.chart.tipW, heightFor: (series: number) => t.chart.tipBaseH + series * t.chart.tipRowH },
    bar: { radius: t.chart.barRadius, width: t.chart.barMaxW, soloWidth: t.chart.barSoloW, gap: t.chart.barGap },
    /** The ring a point or a segment is cut from the card with. */
    card: t.surface.card,
  };
}
