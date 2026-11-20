/**
 * `@antfabric-ui/react/data`: the data components (KPIs, charts, panels, tables), and what they are built from. Not part of the root
 * entry, so an app that never imports it carries none of recharts. The same name, `@antfabric-ui/react-native/data`, is the phone's.
 *
 * `rechartsTheme(useChartTokens(), useReducedMotion())` is the chart tokens as recharts' own props, for a chart this kit does not ship. One
 * composed example, a weekly line that reads the same grid, axes, crosshair, tooltip and series colour as LineChart:
 *
 *   function WeeklyRuns({ rows }: { rows: { week: string; runs: number }[] }) {
 *     const tk = useChartTokens();
 *     const theme = rechartsTheme(tk, useReducedMotion());
 *     return (
 *       <ComposedChart width={520} height={240} data={rows}>
 *         <CartesianGrid {...theme.grid} />
 *         <XAxis dataKey="week" {...theme.axis} />
 *         <YAxis {...theme.axis} />
 *         <Tooltip {...theme.tooltip} content={...ChartTooltip...} />
 *         <Line dataKey="runs" stroke={theme.series[0]} strokeWidth={theme.line.strokeWidth} dot={false} {...theme.motion.draw} />
 *       </ComposedChart>
 *     );
 *   }
 */

export * from "../components/data";
export { ChartFrame, useWidth, type ChartFrameProps } from "./frame";
export { ChartTooltip, type ChartTooltipProps } from "./tooltip";
export { Legend, type LegendProps } from "./legend";
export { rechartsDraw, rechartsGlide, rechartsMotion, rechartsTheme, useChartTokens, useReducedMotion, type ChartTokens } from "./theme";
