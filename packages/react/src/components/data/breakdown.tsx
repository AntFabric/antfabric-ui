import { useState, type CSSProperties } from "react";
import { recipes, useControllable, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { DIMMED, fmt, segmentsOf, seriesColors, shareOf, summarizeSegments, totalOf, type FormatSpec, type Row, type Segment, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { box, css, enter, neg, pressable, row, text } from "../../lib/style";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { ChartCard } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { useChartTokens } from "../../data/theme";

export interface BreakdownProps extends RootProps<HTMLDivElement> {
  /** Rows, one per part: `[{ channel: "Email", tickets: 312 }, …]`. The same rows can feed a table and a donut. */
  data: Row[];
  /** The field of each row that names its part. */
  name: string;
  /** The field of each row that is its value. A value under zero counts as 0: a share is never negative. */
  value: string;
  /** The card's title. It names the figure too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A format name, its options, or a function: what core's `fmt` takes. The total, each part, the summary and the table print through it. */
  format?: FormatSpec;
  /** The value column's name in "View as table". */
  valueLabel?: string;
  /** The change in the total, as a number the delta format prints: `0.034` is `+3.4%`. Left out, the headline has no badge. */
  delta?: number;
  deltaFormat?: FormatSpec;
  /** Down is good: the badge's colours swap. */
  inverse?: boolean;
  /** What the change is against, after the badge: "tickets, vs September". */
  period?: string;
  /** The part that is picked, by its name: its segment of the bar and its row stay lit and the rest step back. Pointing at a part or tabbing to its row lights it too, for as long as the pointer or the keyboard is there. Left out, the chart keeps its own, starting with none. */
  selected?: string | null;
  /** Called with the picked part's name, or null when it is picked again. */
  onSelectedChange?: (selected: string | null) => void;
  /** The height of the loading and empty states. */
  height?: number;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey bars in place of the bar and the list, and no "View as table". */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"breakdown">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["breakdown"]>;
  style?: CSSProperties;
}

/** A share in the list: a whole number. */
const WHOLE = { type: "percent", digits: 0 } as const;

interface PartProps {
  part: Segment;
  value: string;
  share: string;
  color: string;
  /** The part the bar is lighting is this one. */
  active: boolean;
  /** This part is the one that is picked. */
  picked: boolean;
  onPick: () => void;
  onHot: (hot: boolean) => void;
  styles?: PartStyles<"breakdown">;
  strings?: Partial<KitStrings["breakdown"]>;
}

/** One row of the list: a colour, a name, a value and a share. Pointing at it or tabbing to it lights its part of the bar, and pressing it picks it. */
function Part({ part, value, share, color, active, picked, onPick, onHot, styles, strings }: PartProps) {
  const str = useStrings("breakdown", strings);
  const tk = useChartTokens();
  // Hover and focus come from the hook, never from `:hover`: the catalogue forces them for its snapshots.
  const ui = useInteraction();
  const r = useRecipe(recipes.breakdown, { state: { hover: ui.hovered || active, focus: ui.focused }, styles });
  return (
    <li style={{ display: "block", margin: 0, padding: 0 }}>
      <button
        type="button"
        data-af-press
        data-af-part="part"
        aria-pressed={picked}
        aria-label={str("partLabel", { label: part.label, value, share })}
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
        style={css(pressable, partStyle(r, "part", { display: "grid", gridTemplateColumns: `${t.space.smMd} 1fr`, alignItems: "center", alignSelf: "stretch", marginInline: neg(t.space.sm), textAlign: "left", fontFamily: tk.chart.font, transition: `background-color ${t.duration.base} ${t.ease.out}`, columnGap: t.space.sm }))}
      >
        <span aria-hidden data-af-part="swatch" style={partStyle(r, "swatch", { background: color })} />
        <span data-af-part="label" style={css(text, { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, r.label)}>{part.label}</span>
        <span style={css(row, { gridColumn: 2, gap: t.space.sm, alignItems: "baseline" })}>
          <b data-af-part="value" style={css({ fontVariantNumeric: "tabular-nums" }, r.value)}>{value}</b>
          <span data-af-part="share" style={css({ fontVariantNumeric: "tabular-nums" }, r.share)}>{share}</span>
        </span>
      </button>
    </li>
  );
}

export function Breakdown({ data, name, value, title, subtitle = "", format = "integer", valueLabel, delta, deltaFormat, inverse = false, period = "", selected, onSelectedChange, height = 160, empty, emptyLine, loading = false, styles, strings, style, ...rest }: BreakdownProps) {
  const str = useStrings("breakdown", strings);
  const locale = useLocale();
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const tk = useChartTokens();
  const r = useRecipe(recipes.breakdown, { styles });
  // Up to eight parts keep a colour of the palette; any after that are one more, "Other", in a neutral grey.
  const parts = segmentsOf(data, name, value, str("other"));
  const palette = seriesColors(tk);
  const colors = parts.map((p, i) => (p.folded ? tk.chart.other : palette[i % palette.length]!));
  const total = totalOf(parts);
  // What the bar is lighting: the part under the pointer or the keyboard, else the one that was picked.
  const [picked, setPicked] = useControllable(selected, onSelectedChange);
  const [hot, setHot] = useState<number | null>(null);
  const pickedAt = picked == null ? -1 : parts.findIndex((p) => p.label === picked);
  const at = hot ?? (pickedAt >= 0 ? pickedAt : null);
  const pick = (i: number) => {
    const next = parts[i]?.label;
    if (next !== undefined) setPicked(picked === next ? null : next);
  };
  const summary = summarizeSegments({ label: title, segments: parts, format, formatWords, locale }, {
    noData: (v) => str("noData", v),
    allZero: (v) => str("summaryAllZero", v),
    more: (v) => str("summaryMore", v),
    part: (v) => str("summaryPart", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  });
  // A part with nothing in it has no width to give the bar: it stays in the list.
  const drawn = parts.map((p, i) => ({ p, i })).filter(({ p }) => p.value > 0);
  // The first and the last part are rounded at the bar's outer ends. Longhands, so a part that becomes the first does not fight a shorthand.
  const radii = (first: boolean, last: boolean): CSSProperties => ({ borderTopLeftRadius: first ? t.radius.pill : 0, borderBottomLeftRadius: first ? t.radius.pill : 0, borderTopRightRadius: last ? t.radius.pill : 0, borderBottomRightRadius: last ? t.radius.pill : 0 });
  return (
    <ChartCard
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={!loading && data.length ? { value: total, format, delta, deltaFormat, inverse, period } : undefined}
      table={!loading && data.length ? { data, x: name, y: value, format, labels: { [value]: valueLabel ?? str("valueLabel") } } : null}
      style={style}
      root={rootProps(rest)}
    >
      <ChartFrame height={height} grow label={loading ? str("loading", { title }) : summary} loading={loading} empty={parts.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {() => (
          <div data-af-part="plot" data-af-plot style={css(box, r.plot)}>
            <div role="img" aria-label={summary} data-af-part="bar" style={css(row, enter("grow-x"), { alignItems: "stretch" }, r.bar)}>
              {drawn.length ? (
                drawn.map(({ p, i }, k) => (
                  <span
                    key={p.label}
                    data-af-part="segment"
                    onPointerEnter={() => setHot(i)}
                    onPointerLeave={() => setHot((h) => (h === i ? null : h))}
                    onClick={() => pick(i)}
                    style={partStyle(r, "segment", { flex: `${p.value} 0 0`, cursor: "pointer", background: colors[i], opacity: at === null || at === i ? 1 : DIMMED, transition: `opacity ${t.duration.base} ${t.ease.out}` }, radii(k === 0, k === drawn.length - 1))}
                  />
                ))
              ) : (
                // Every value is 0: the whole is nothing, so the bar is its empty track.
                <span data-af-part="segment" style={partStyle(r, "segment", { flex: 1, background: tk.chart.track }, radii(true, true))} />
              )}
            </div>
            <ul data-af-part="list" aria-label={str("parts")} style={css({ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${t.chart.partMinW}, 1fr))`, columnGap: t.space.lg, listStyle: "none", margin: 0, padding: 0 }, r.list)}>
              {parts.map((p, i) => (
                <Part key={p.label} part={p} value={fmt(format, p.value, formatWords, locale)} share={fmt(WHOLE, shareOf(p.value, total), formatWords, locale)} color={colors[i]!} active={at === i} picked={pickedAt === i} onPick={() => pick(i)} onHot={(isHot) => setHot((h) => (isHot ? i : h === i ? null : h))} styles={styles} strings={strings} />
              ))}
            </ul>
          </div>
        )}
      </ChartFrame>
    </ChartCard>
  );
}
