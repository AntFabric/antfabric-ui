import type { CSSProperties } from "react";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { fmt, type FormatSpec, type Row, type FormatWords } from "@antfabric-ui/core/chart";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, row, text, truncate } from "../../lib/style";
import { LoadingLines } from "../../data/loading";
import { useChartTokens } from "../../data/theme";
import { Card } from "../display/card";
import { Delta } from "./delta";
import { MetricValue } from "./metric-value";
import { ProgressRing } from "./progress-ring";
import { SparkBars } from "./spark-bars";
import { Sparkline } from "./sparkline";

export type StatTileTrendKind = "line" | "bars";

export interface StatTileProps extends RootProps<HTMLDivElement> {
  /** What is counted: "Open tickets", "Orders shipped". One line; a long one is cut. */
  label: string;
  /** A lucide icon name, in a soft chip before the label. Empty draws no chip. */
  icon?: string;
  /** A word at the end of the top row: the period the number covers ("24h"), or "Now". */
  aside?: string;
  value: number;
  /** A format name, its options, or a function: what core's `fmt` takes. */
  format?: FormatSpec;
  /** The change, as a number the delta format prints: `-0.101` is `-10.1%`. Left out, there is no Delta and no period. */
  delta?: number;
  deltaFormat?: FormatSpec;
  /** Down is good (open tickets, response time): the Delta's colours swap. */
  inverse?: boolean;
  /** What the change is against, after the Delta: "vs September". */
  period?: string;
  /** Rows for the visual at the end of the tile, one per period. Used with `trendY`. */
  trend?: Row[];
  trendY?: string;
  /** `line` is a Sparkline with its fill and a dot on the last point; `bars` is SparkBars, the latest period in full colour. */
  trendKind?: StatTileTrendKind;
  /** A share of a goal, 0 to 1: a ProgressRing at the start of the tile, in place of a trend. */
  progress?: number;
  /** Grey lines the size of the tile's text, while the numbers load. */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, top: {…}, chip: {…}, icon: {…}, label: {…}, aside: {…}, body: {…}, main: {…}, foot: {…}, period: {…} }`. */
  styles?: PartStyles<"stat-tile">;
  /** The built-in text, by key: what a screen reader hears while it loads, and the names of the ring and the trend. */
  strings?: Partial<KitStrings["stat-tile"]>;
  style?: CSSProperties;
}

export function StatTile({ label, icon = "", aside = "", value, format = "integer", delta, deltaFormat, inverse = false, period = "", trend, trendY = "", trendKind = "line", progress, loading = false, styles, strings, style, ...rest }: StatTileProps) {
  const r = useRecipe(recipes["stat-tile"], { styles });
  const s = useStrings("stat-tile", strings);
  const locale = useLocale();
  const formatWords: FormatWords = { unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) };
  const tk = useChartTokens();
  const frame = css({ overflow: "hidden", minWidth: 0 }, style);
  if (loading) {
    const lines = [{ width: t.kpi.loadM, height: t.kpi.loadLineH }, { width: t.kpi.loadS, height: t.kpi.loadValueH }, { width: t.kpi.loadL, height: t.kpi.loadLineH }];
    return <Card pad="none" elevate="card" style={frame} children={<div role="group" data-af-part="root" aria-busy aria-label={s("loading", { label })} {...rootProps(rest)} style={css(box, r.root)}><LoadingLines lines={lines} label={s("loadingLines", { label })} /></div>} />;
  }
  // A ring takes the place of a trend; no rows or no y is no visual.
  const rows = trend && trend.length > 0 && trendY !== "" && progress === undefined ? trend : null;
  const said = trendKind === "bars" ? s("byPeriod", { label }) : s("trend", { label });
  const body = (
    <div role="group" data-af-part="root" aria-label={label} {...rootProps(rest)} style={css(box, r.root)}>
      <div data-af-part="top" style={css(row, r.top)}>
        {icon ? (
          <span data-af-part="chip" style={css(row, { justifyContent: "center", flexShrink: 0 }, r.chip)}>
            <Icon part="icon" name={icon} color={r.chip.color} style={r.icon} />
          </span>
        ) : null}
        <span data-af-part="label" style={css(text, truncate(1), { flex: 1 }, r.label)}>{label}</span>
        {aside ? <span data-af-part="aside" style={css(text, { whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }, r.aside)}>{aside}</span> : null}
      </div>
      <div data-af-part="body" style={css(row, partStyle(r, "body", { justifyContent: "space-between", alignItems: progress === undefined ? "flex-end" : "center" }, progress !== undefined && { justifyContent: "flex-start", gap: t.space.mdLg }))}>
        {progress !== undefined ? <ProgressRing value={progress} animate label={s("ringOfGoal", { label, percent: fmt("percent", progress, formatWords, locale) })} /> : null}
        <div data-af-part="main" style={css(box, r.main)}>
          <MetricValue value={value} format={format} size="md" />
          {delta !== undefined ? (
            <div data-af-part="foot" style={css(row, { flexWrap: "wrap" }, r.foot)}>
              <Delta value={delta} inverse={inverse} format={deltaFormat} variant="badge" size="sm" />
              {period ? <span data-af-part="period" style={css(text, r.period)}>{period}</span> : null}
            </div>
          ) : null}
        </div>
        {rows && trendKind === "bars" ? <SparkBars data={rows} y={trendY} width={tk.kpi.tileBarsW} height={tk.kpi.tileTrendH} animate label={said} /> : null}
        {rows && trendKind === "line" ? <Sparkline data={rows} y={trendY} width={tk.kpi.tileTrendW} height={tk.kpi.tileTrendH} area marker animate label={said} /> : null}
      </div>
    </div>
  );
  return <Card pad="none" elevate="card" style={frame} children={body} />;
}
