/**
 * `@antfabric-ui/react-native/data`: the data components (KPIs, charts, panels, tables), and what they are built from. Not part of the
 * root entry, so an app that never imports it carries none of gifted-charts. The same name, `@antfabric-ui/react/data`, is the web's and desktop's.
 *
 * `giftedTheme(useChartTokens(), useReducedMotion())` is the chart tokens as react-native-gifted-charts' own props, for a chart this kit does not
 * ship. One composed example, a weekly line that reads the same dashed rules, quiet axes, series colour and motion as LineChart:
 *
 *   function WeeklyRuns({ rows }: { rows: { value: number; label: string }[] }) {
 *     const theme = giftedTheme(useChartTokens(), useReducedMotion());
 *     return <LineChart {...theme.axis} {...theme.motion} data={rows} color={theme.series[0]} thickness={theme.line.thickness} curved hideDataPoints />;
 *   }
 */

export * from "../components/data";
export { ChartFrame, type ChartFrameProps } from "./frame";
export { ChartTooltip, type ChartTooltipProps } from "./tooltip";
export { Legend, type LegendProps } from "./legend";
export { chartFont, giftedAnimated, giftedTheme, useChartTokens, useReducedMotion, type ChartTokens, type ChartWeight } from "./theme";
