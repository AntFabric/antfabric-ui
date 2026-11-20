import { useEffect, useRef, useState, type CSSProperties } from "react";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { fmt, withoutSign, type FormatSpec, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, neg, row, text } from "../../lib/style";
import { LoadingLines } from "../../data/loading";
import { useWidth } from "../../data/frame";
import { useChartTokens } from "../../data/theme";
import { Card } from "../display/card";
import { Delta } from "./delta";
import { MetricValue } from "./metric-value";
import { Sparkline } from "./sparkline";

export interface KpiCardProps extends RootProps<HTMLDivElement> {
  /** What the headline number is: "Monthly recurring revenue". */
  label: string;
  value: number;
  /** A format name, its options, or a function: what core's `fmt` takes. */
  format?: FormatSpec;
  /** The change, as a number the delta format prints: `0.044` is `+4.4%`. Left out, there is no badge and no sentence. */
  delta?: number;
  deltaFormat?: FormatSpec;
  /** Down is good (open tickets, response time): the badge's colours swap. */
  inverse?: boolean;
  /** What the change is against, after the sentence: "on September" makes "Up 4.4% on September". */
  period?: string;
  /** A line of context under the sentence: "Forecast was $185,000". */
  note?: string;
  /** Rows for the trend bled into the card's foot, one per period. Used with `trendY`. */
  trend?: Row[];
  trendY?: string;
  /** Grey lines the size of the card's text, while the numbers load. */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, top: {…}, label: {…}, foot: {…}, moved: {…}, note: {…}, trend: {…} }`. */
  styles?: PartStyles<"kpi-card">;
  /** The built-in text, by key: the sentence about the change, and what a screen reader hears while it loads. */
  strings?: Partial<KitStrings["kpi-card"]>;
  style?: CSSProperties;
}

/** The same figure written short ($1.3B for $1,284,000,000) for a card too narrow to hold it whole. A format that is a function is left as it is. */
function compactOf(format: FormatSpec): FormatSpec {
  if (typeof format === "function") return format;
  const o = typeof format === "string" ? { type: format } : format;
  if (o.type === "currency") return { ...o, compact: true };
  if (o.type === "integer" || o.type === "decimal") return "compact";
  return format;
}

const TRENDING = { up: "trending-up", down: "trending-down", flat: "minus" } as const;

/** The flush trend: it takes the card's width, measured, and runs to its edges and its foot. */
function Trend({ rows, y, label, style }: { rows: Row[]; y: string; label: string; style?: CSSProperties }) {
  const [width, ref] = useWidth();
  const tk = useChartTokens();
  return (
    <div ref={ref} data-af-part="trend" style={css(box, { lineHeight: 0 }, style)}>
      <Sparkline data={rows} y={y} width={width} height={tk.kpi.cardTrendH} area flush animate label={label} />
    </div>
  );
}

export function KpiCard({ label, value, format = { type: "currency" }, delta, deltaFormat, inverse = false, period = "", note = "", trend, trendY = "", loading = false, styles, strings, style, ...rest }: KpiCardProps) {
  const r = useRecipe(recipes["kpi-card"], { styles });
  const s = useStrings("kpi-card", strings);
  const locale = useLocale();
  // A figure that does not fit its card is written short, with the whole figure as its title: the number is never clipped.
  const [width, figure] = useWidth();
  const [short, setShort] = useState(false);
  const formatKey = typeof format === "function" ? "fn" : JSON.stringify(format);
  useEffect(() => setShort(false), [width, value, formatKey]);
  useEffect(() => {
    const el = figure.current;
    if (el && !short && el.scrollWidth > el.clientWidth) setShort(true);
  }, [short, width, value, formatKey, figure]);
  const formatWords: FormatWords = { unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) };
  const frame = css({ overflow: "hidden", minWidth: 0, gap: 0 }, style);
  if (loading) {
    const lines = [{ width: t.kpi.loadM, height: t.kpi.loadLineH }, { width: t.kpi.loadL, height: t.kpi.loadValueH }, { width: t.kpi.loadXl, height: t.kpi.loadLineH }];
    return <Card pad="none" elevate="card" style={frame} children={<div role="group" data-af-part="root" aria-busy aria-label={s("loading", { label })} {...rootProps(rest)} style={css(box, r.root)}><LoadingLines lines={lines} label={s("loadingLines", { label })} /></div>} />;
  }
  // The sentence about the change: core says which way it went and by how much, the words are the card's.
  const known = delta !== undefined && Number.isFinite(delta);
  const direction = delta === undefined || !known || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  const m = delta === undefined ? null : { direction, known, value: direction === "flat" ? "" : fmt(withoutSign(deltaFormat ?? "percent"), Math.abs(delta), formatWords, locale) } as const;
  const change = m === null ? "" : !m.known ? s("changeUnavailable") : m.direction === "flat" ? s("noChange") : m.direction === "up" ? s("up", { value: m.value }) : s("down", { value: m.value });
  const said = m === null ? null : ({ direction: m.direction, text: period ? s("againstPeriod", { change, period }) : change } as const);
  const rows = trend && trend.length > 0 && trendY !== "" ? trend : null;
  return (
    <Card
      pad="none"
      elevate="card"
      style={frame}
      children={
        <>
          {/* The trend runs to the card's edges, so the card's inset is this section's; its foot sits a step closer to the trend. */}
          <div role="group" data-af-part="root" aria-label={label} {...rootProps(rest)} style={css(box, partStyle(r, "root", rows && { marginBottom: neg(t.space.xs) }))}>
            <div data-af-part="top" style={css(row, { justifyContent: "space-between" }, r.top)}>
              <span data-af-part="label" style={css(text, { flex: 1 }, r.label)}>{label}</span>
              {/* The sentence under the figure says the change once, after the value; the badge is for the eye. */}
              {delta !== undefined ? <span aria-hidden style={{ display: "contents" }}><Delta value={delta} inverse={inverse} format={deltaFormat} variant="badge" /></span> : null}
            </div>
            <div ref={figure} title={short ? fmt(format, value, formatWords, locale) : undefined} style={box}>
              <MetricValue value={value} format={short ? compactOf(format) : format} size="lg" />
            </div>
            {said || note ? (
              <div data-af-part="foot" style={css(box, r.foot)}>
                {said ? (
                  <span data-af-part="moved" style={css(row, r.moved)}>
                    {said.text}
                    <Icon name={TRENDING[said.direction]} size={t.icon.sizeMd} color={r.moved.color} />
                  </span>
                ) : null}
                {note ? <span data-af-part="note" style={css(text, r.note)}>{note}</span> : null}
              </div>
            ) : null}
          </div>
          {rows ? <Trend rows={rows} y={trendY} label={s("trend", { label })} style={r.trend} /> : null}
        </>
      }
    />
  );
}
