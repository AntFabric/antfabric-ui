import { useState, type CSSProperties } from "react";
import { type RootProps, rootProps } from "../../lib/root-props";
import { Cell, Pie, PieChart } from "recharts";
import { recipes, useLocale, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { DIMMED, DONUT_HOLE, SLICE_GAP_DEG, fmt, segmentsOf, seriesColors, shareOf, summarizeSegments, totalOf, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, pressable, row, text } from "../../lib/style";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { rechartsDraw, useChartTokens, useReducedMotion } from "../../data/theme";
import { MetricValue } from "./metric-value";

export type { ChartHeadline };

export interface DonutChartProps extends RootProps<HTMLDivElement> {
  /** Rows, one per segment: `[{ channel: "Email", tickets: 312 }, …]`. The same rows can feed a table and a bar chart. */
  data: Row[];
  /** The field of each row that names its segment. */
  name: string;
  /** The field of each row that is its value. A value under zero counts as 0: a share is never negative. */
  value: string;
  /** The card's title. It names the figure too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** A format name, its options, or a function: what core's `fmt` takes. The centre, the list, the summary and the table print through it. */
  format?: FormatSpec;
  /** The value column's name in "View as table". */
  valueLabel?: string;
  /** What the hole says above the total: "Total". It says the hovered segment's name instead while one is. */
  centerLabel?: string;
  /** The ring's width and height. */
  size?: number;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey bars in place of the plot, and no "View as table". */
  loading?: boolean;
  /** The segments the list has turned off, by name. Left out, the chart keeps its own and starts with every segment on. */
  hidden?: string[];
  /** Called with every segment that is off after a list press. The last one showing cannot be turned off, so that press calls nothing. */
  onHiddenChange?: (hidden: string[]) => void;
  /** The segment that is picked: the centre shows it and the rest step back. Left out, the chart keeps its own, starting with none. */
  selected?: string | null;
  /** Called with the picked segment's name, or null when it is picked again. */
  onSelectedChange?: (selected: string | null) => void;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"donut-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["donut-chart"]>;
  /** The card title's heading level, 1 to 6, so the chart keeps the page's heading order. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: CSSProperties;
}

/** The hole's number is the figure's size in `md`; the label under it is held to this share of the hole's width so a long name is cut with an ellipsis. */
const LABEL_SHARE = "70%";

interface ItemProps {
  label: string;
  value: string;
  share: string;
  color: string;
  on: boolean;
  /** The segment is the one the ring is showing: hovered, focused, or picked. */
  active: boolean;
  /** The segment is the picked one: the row's `aria-pressed`. */
  picked: boolean;
  /** The row's press: picks the segment (or lets go of it). The swatch is the other control, and turns the segment off or back on. */
  onPick: () => void;
  onToggle: () => void;
  strings?: Partial<KitStrings["donut-chart"]>;
  onHot: (hot: boolean) => void;
  styles?: PartStyles<"donut-chart">;
}

/**
 * One entry of the legend: a swatch and the segment's name, its value and its share under them. Pressing the row picks the segment (the same as pressing it on the ring,
 * so the pick is reachable by keyboard); the swatch is its own button that turns the segment off or back on. Pointing at the row or tabbing to it lights the segment on the ring.
 */
function Item({ label, value, share, color, on, active, picked, onPick, onToggle, onHot, styles, strings }: ItemProps) {
  const str = useStrings("donut-chart", strings);
  // Hover and focus come from the hook, never from `:hover`: the catalogue forces them for its snapshots.
  const ui = useInteraction();
  const swatchUi = useInteraction();
  const r = useRecipe(recipes["donut-chart"], { state: { on, hover: ui.hovered || active, focus: ui.focused }, styles });
  return (
    <li style={{ display: "block", margin: 0, padding: 0, position: "relative" }}>
      <button
        type="button"
        data-af-press
        data-af-part="item"
        aria-pressed={picked}
        onClick={() => onPick()}
        {...ui.handlers}
        onPointerEnter={() => {
          ui.handlers.onPointerEnter();
          onHot(true);
        }}
        onPointerLeave={() => {
          ui.handlers.onPointerLeave();
          onHot(false);
        }}
        onFocus={(e) => {
          ui.handlers.onFocus(e);
          onHot(true);
        }}
        onBlur={() => {
          ui.handlers.onBlur();
          onHot(false);
        }}
        style={css(pressable, partStyle(r, "item", { display: "grid", gridTemplateColumns: `${t.space.smMd} 1fr`, alignItems: "center", alignSelf: "stretch", textAlign: "left", fontFamily: t.chart.font, columnGap: t.space.sm }))}
      >
        <span aria-hidden data-af-part="swatch" style={partStyle(r, "swatch", { background: color, opacity: on ? 1 : t.opacity.muted })} />
        <span data-af-part="label" style={css(text, partStyle(r, "label", { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: on ? "none" : "line-through" }))}>{label}</span>
        <span style={css(row, { gridColumn: 2, gap: t.space.sm, alignItems: "baseline" })}>
          <span data-af-part="value" style={css(text, { fontVariantNumeric: "tabular-nums" }, r.value)}>{value}</span>
          <span data-af-part="share" style={css(text, { fontVariantNumeric: "tabular-nums" }, r.share)}>{share}</span>
        </span>
      </button>
      {/* The swatch's own control: a transparent button beside the row's (not inside it), centred on the swatch and `control.hit` square, WCAG 2.2's
          24px target, so the swatch is drawn once and the button reaches past it. */}
      <button
        type="button"
        data-af-press
        data-af-part="toggle"
        aria-pressed={on}
        aria-label={str("toggleSegment", { label })}
        onClick={() => onToggle()}
        {...swatchUi.handlers}
        style={css(pressable, {
          position: "absolute",
          top: `calc(${r.item.paddingTop ?? t.space.xs} + (${t.text.captionLine} - ${t.control.hit}) / 2)`,
          left: `calc(${r.item.paddingLeft ?? t.space.sm} + (${t.space.smMd} - ${t.control.hit}) / 2)`,
          width: t.control.hit,
          height: t.control.hit,
          borderRadius: t.radius.circle,
          background: "transparent",
          boxShadow: swatchUi.focused ? t.shadow.focus : "none",
        })}
      />
    </li>
  );
}

export function DonutChart({ data, name, value, title, subtitle = "", headline, format = "integer", valueLabel, centerLabel, size, empty, emptyLine, loading = false, hidden, onHiddenChange, selected, onSelectedChange, styles, strings, headingLevel, style, ...rest }: DonutChartProps) {
  const str = useStrings("donut-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const r = useRecipe(recipes["donut-chart"], { styles });
  const diameter = size ?? tk.chart.donutSize;
  // Up to eight segments keep a colour of the palette; any after that are one more, "Other", in a neutral grey.
  const all = segmentsOf(data, name, value, str("other"));
  const palette = seriesColors(tk);
  const colors = all.map((x, i) => (x.folded ? tk.chart.other : palette[i % palette.length]!));
  const s = useSeries(all.map((x) => x.key), colors, { hidden, onHiddenChange });
  const shown = all.filter((x) => s.visible.includes(x.key));
  const total = totalOf(shown);
  const [picked, setPicked] = useControllable(selected, onSelectedChange);
  // What the ring is showing: the segment under the pointer or the keyboard, else the one that was picked.
  const [hot, setHot] = useState<string | null>(null);
  const focus = shown.find((x) => x.key === (hot ?? picked)) ?? null;
  const summary = summarizeSegments({ label: title, segments: shown, format, formatWords, locale }, {
    noData: (v) => str("noData", v),
    allZero: (v) => str("summaryAllZero", v),
    more: (v) => str("summaryMore", v),
    part: (v) => str("summaryPart", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  });
  const outer = diameter / 2 - tk.chart.sliceLift;
  const inner = outer * DONUT_HOLE;
  return (
    <ChartCard
      headingLevel={headingLevel}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && data.length ? { data, x: name, y: value, format, labels: { [value]: valueLabel ?? str("valueLabel") } } : null}
      style={style}
    >
      <ChartFrame height={diameter} grow label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {() => {
          // The ring in the middle and the legend under it in columns, past a rule: the reference dashboard's layout.
          return (
            <div data-af-part="plot" data-af-plot style={css(box, { gap: t.space.lg, alignItems: "stretch" }, r.plot)}>
              <div data-af-part="ring" style={css(box, partStyle(r, "ring", { flexShrink: 0, width: diameter, height: diameter, alignSelf: "center" }))}>
                <PieChart accessibilityLayer={false} width={diameter} height={diameter} style={{ display: "block" }}>
                  {total > 0 ? (
                    <Pie
                      data={shown.map((x) => ({ name: x.label, v: x.value }))}
                      dataKey="v"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={inner}
                      outerRadius={outer}
                      paddingAngle={shown.length > 1 ? SLICE_GAP_DEG : 0}
                      cornerRadius={shown.length > 1 ? tk.chart.sliceRadius : 0}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      tooltipType="none"
                      rootTabIndex={-1}
                      {...rechartsDraw(tk, reduced)}
                      onMouseEnter={(_: unknown, i: number) => setHot(shown[i]?.key ?? null)}
                      onMouseLeave={() => setHot(null)}
                      onClick={(_: unknown, i: number) => {
                        const next = shown[i]?.key;
                        if (next !== undefined) setPicked(picked === next ? null : next);
                      }}
                    >
                      {shown.map((x) => (
                        <Cell
                          key={x.key}
                          fill={s.colorOf(x.key)}
                          fillOpacity={focus === null || focus.key === x.key ? 1 : DIMMED}
                          style={{ cursor: "pointer", outline: "none", transition: `fill-opacity ${t.duration.base} ${t.ease.out}` }}
                        />
                      ))}
                    </Pie>
                  ) : (
                    // Every value is 0: the whole is nothing, so the ring is its track.
                    <Pie data={[{ v: 1 }]} dataKey="v" cx="50%" cy="50%" innerRadius={inner} outerRadius={outer} stroke="none" isAnimationActive={false} tooltipType="none" rootTabIndex={-1}>
                      <Cell fill={tk.chart.track} />
                    </Pie>
                  )}
                </PieChart>
                <div aria-hidden data-af-part="center" style={css(box, { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", pointerEvents: "none", textAlign: "center" }, r.center)}>
                  <span data-af-part="centerLabel" style={css(text, { maxWidth: LABEL_SHARE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: t.chart.font }, r.centerLabel)}>
                    {focus ? focus.label : (centerLabel ?? str("centerLabel"))}
                  </span>
                  <MetricValue value={focus ? focus.value : total} format={format} size="md" />
                </div>
              </div>
              <ul data-af-part="list" aria-label={str("segments")} style={css({ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${t.chart.partMinW}, 1fr))`, columnGap: t.space.lg, listStyle: "none", margin: 0, padding: 0 }, r.list)}>
                {all.map((x) => {
                  const on = s.visible.includes(x.key);
                  return (
                    <Item
                      key={x.key}
                      label={x.label}
                      value={fmt(format, x.value, formatWords, locale)}
                      share={on ? fmt("percent", shareOf(x.value, total), formatWords, locale) : str("unavailable")}
                      color={s.colorOf(x.key)}
                      on={on}
                      active={focus?.key === x.key}
                      picked={picked === x.key}
                      onPick={() => setPicked(picked === x.key ? null : x.key)}
                      onToggle={() => s.toggle(x.key)}
                      strings={strings}
                      onHot={(isHot) => setHot((h) => (isHot ? (on ? x.key : h) : h === x.key ? null : h))}
                      styles={styles}
                    />
                  );
                })}
              </ul>
            </div>
          );
        }}
      </ChartFrame>
    </ChartCard>
  );
}
