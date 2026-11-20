import type { CSSProperties } from "react";
import { recipes, useControllable, useDirection, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { METRIC_KEY, barScale, fmt, metricTotal, prepare, seriesColors, summarize, useSeries, type FormatSpec, type Metric, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { useRovingKeys } from "../../lib/roving";
import { box, css, neg, pressable, row, rtl } from "../../lib/style";
import { RechartsBars } from "../../data/bars";
import { ChartCard } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { LoadingLines } from "../../data/loading";
import { rechartsTheme, useChartTokens, useReducedMotion } from "../../data/theme";
import { MetricValue } from "./metric-value";

export type { Metric };

export interface MetricTabsProps extends RootProps<HTMLDivElement> {
  /** Rows, one per point, in order: [{ date: 1791763200000, resolved: 58, escalated: 6 }, …]. The same rows can feed a table and a bar chart. */
  data: Row[];
  /** The field of each row that is the category: a date or a word. */
  x: string;
  /** The metrics, one tab each (the first eight): { field, label, format?, total? }. A tab shows the sum of its field unless it names its own `total`. */
  metrics: Metric[];
  /** The card's title. It names the tab list and the figure too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A format name, its options, or a function: what core's `fmt` takes, for a metric that names none. */
  format?: FormatSpec;
  /** The category's format, for a date: `"month"`, `"day"`. */
  xFormat?: FormatSpec;
  /** The field of the metric that is chosen. Left out, the chart keeps its own, starting with the first metric. Controlled when the app passes it with `onValueChange`. */
  value?: string;
  /** A tab was pressed, or an arrow key moved to one (the arrows follow the reading direction). Called with its field. */
  onValueChange?: (value: string) => void;
  /** The plot's height. */
  height?: number;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey lines and bars in place of the tabs and the plot, and no "View as table". */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"metric-tabs">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["metric-tabs"]>;
  style?: CSSProperties;
}

/** The palette has eight colours, so a ninth tab would wrap onto the first: the first eight are tabs. */
const MOST = 8;

interface TabProps {
  metric: Metric;
  /** The tab's id, which the panel names it by, and the panel's id, which the tab controls. */
  id: string;
  panel: string;
  locale: string;
  total: number;
  format?: FormatSpec;
  color: string;
  on: boolean;
  first: boolean;
  onPress: () => void;
  styles?: PartStyles<"metric-tabs">;
  strings?: Partial<KitStrings["metric-tabs"]>;
}

/** One tab: the metric's colour and name over its total, a rule in its colour along the foot while it is the chosen one. */
function Tab({ metric, id, panel, locale, total, format, color, on, first, onPress, styles, strings }: TabProps) {
  const str = useStrings("metric-tabs", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const tk = useChartTokens();
  // Hover and focus come from the hook, never from `:hover`: the catalogue forces them for its snapshots.
  const ui = useInteraction();
  const dir = useDirection();
  const r = useRecipe(recipes["metric-tabs"], { state: { on, hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={on}
      aria-controls={panel}
      aria-label={str("tabLabel", { label: metric.label, total: fmt(metric.format ?? format, total, formatWords, locale) })}
      tabIndex={on ? 0 : -1}
      data-af-press
      data-af-part="tab"
      data-field={metric.field}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, rtl({ flex: "1 1 0", alignItems: "flex-start", justifyContent: "center", textAlign: "left", fontFamily: tk.chart.font }, dir), partStyle(r, "tab", first && rtl({ borderLeftWidth: 0 }, dir)))}
    >
      <span data-af-part="tabLabel" style={css(row, r.tabLabel)}>
        <span aria-hidden data-af-part="swatch" style={partStyle(r, "swatch", { flexShrink: 0, background: color })} />
        {metric.label}
      </span>
      <MetricValue value={total} format={metric.format ?? format} size="sm" />
      <span aria-hidden data-af-part="rule" style={partStyle(r, "rule", { position: "absolute", left: 0, right: 0, bottom: neg(t.border.wHairline), background: color, opacity: on ? 1 : 0, transition: `opacity ${t.duration.base} ${t.ease.out}`, pointerEvents: "none" })} />
    </button>
  );
}

export function MetricTabs({ data, x, metrics, title, subtitle = "", format = "integer", xFormat, value, onValueChange, height = 220, empty, emptyLine, loading = false, styles, strings, style, ...rest }: MetricTabsProps) {
  const str = useStrings("metric-tabs", strings);
  const locale = useLocale();
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = rechartsTheme(tk, reduced);
  const ui = useInteraction();
  const r = useRecipe(recipes["metric-tabs"], { state: { focus: ui.focused }, styles });
  const [picked, setPicked] = useControllable(value, onValueChange);
  const tabs = metrics.slice(0, MOST);
  // Named from the title, not a generated id, so the markup is the same on every mount; two tab sets on one page need different titles.
  const uid = `metric-tabs-${title.replace(/\W+/g, "-")}`;
  const panelId = `${uid}-panel`;
  const tabId = (i: number) => `${uid}-tab-${i}`;
  // The arrows move by the reading direction and the tab chosen is the one focused (automatic activation); Home and End go to the ends.
  const keys$ = useRovingKeys<HTMLDivElement>({ items: '[role="tab"]', orientation: "horizontal", onMove: (_, i) => tabs[i] && setPicked(tabs[i].field) });
  const palette = seriesColors(tk);
  const at = Math.max(0, tabs.findIndex((m) => m.field === picked));
  const chosen = tabs[at];
  // The chosen metric is always drawn under one data key, so switching tabs moves the same bars to their new heights (and the fill eases to the metric's colour) and does not draw a new series from zero.
  const s = useSeries([METRIC_KEY], [palette[at % palette.length]!]);
  const { rows: base, keys, ordered } = prepare(data, x, formatWords, xFormat, locale);
  const rows = chosen ? base.map((row) => ({ ...row, [METRIC_KEY]: row[chosen.field] })) : base;
  const shown = chosen?.format ?? format;
  const labels = { [METRIC_KEY]: chosen?.label ?? "" };
  const scale = barScale(rows, [METRIC_KEY]);
  const summary = chosen ? summarize({ label: `${title}, ${chosen.label}`, data, keys, fields: [chosen.field], labels: { [chosen.field]: chosen.label }, format: shown, formatWords, ordered, locale }, {
    noData: (v) => str("noData", v),
    noValues: (v) => str("summaryNoValues", v),
    extremes: (v) => str("summaryExtremes", v),
    single: (v) => str("summarySingle", v),
    held: (v) => str("summaryHeld", v),
    rose: (v) => str("summaryRose", v),
    fell: (v) => str("summaryFell", v),
    peak: (v) => str("summaryPeak", v),
    range: (v) => str("summaryRange", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  }) : str("noData", { title });
  const nothing = data.length === 0 || tabs.length === 0;
  const lines = [{ width: t.kpi.loadM, height: t.kpi.loadValueH }];
  return (
    <ChartCard
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      table={!loading && !nothing ? { data, x, y: tabs.map((m) => m.field), format, xFormat, formats: Object.fromEntries(tabs.map((m) => [m.field, m.format])), labels: Object.fromEntries(tabs.map((m) => [m.field, m.label])) } : null}
      style={style}
      root={rootProps(rest)}
    >
      {loading ? (
        <LoadingLines lines={lines} label={str("loadingMetrics")} />
      ) : !nothing ? (
        // The strip runs to the card's edges: the card's inset is pulled back out.
        <div ref={keys$.ref} role="tablist" aria-label={title} onKeyDown={(e) => void keys$.onKeyDown(e)} data-af-part="tabs" style={css(row, { alignItems: "stretch", alignSelf: "stretch", marginInline: neg(t.space.lg), overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none" }, r.tabs)}>
          {tabs.map((m, i) => (
            <Tab key={m.field} metric={m} id={tabId(i)} panel={panelId} locale={locale} total={metricTotal(data, m)} format={format} color={palette[i % palette.length]!} on={i === at} first={i === 0} onPress={() => setPicked(m.field)} styles={styles} strings={strings} />
          ))}
        </div>
      ) : null}
      <div role="tabpanel" id={panelId} aria-labelledby={chosen ? tabId(at) : undefined} aria-label={chosen ? undefined : title} style={css(box)}>
        <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={nothing} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
          {(width) => <RechartsBars tk={tk} theme={theme} ui={ui} plot={partStyle(r, "plot", { color: s.colorOf(s.visible[0]!), transition: `color ${tk.duration.slow} ${tk.ease.out}` })} hint={str("arrowKeys", { title })} data={rows} rows={rows} keys={keys} fields={[METRIC_KEY]} s={s} labels={labels} format={shown} formatWords={formatWords} scale={scale} easeColor width={width} height={height} />}
        </ChartFrame>
      </div>
    </ChartCard>
  );
}
