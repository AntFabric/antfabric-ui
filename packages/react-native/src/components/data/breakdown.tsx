import { Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { DIMMED, fmt, labelWidth, segmentsOf, seriesColors, shareOf, summarizeSegments, totalOf, type FormatSpec, type Row, type Segment, type FormatWords } from "@antfabric/ui-core/chart";
import { createStyles } from "../../theme";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { ChartCard } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { chartFont, useChartTokens } from "../../data/theme";

export interface BreakdownProps extends RootProps<View> {
  /** Rows, one per part: `[{ channel: "Email", tickets: 312 }, …]`. The same rows can feed a table and a donut. */
  data: Row[];
  /** The field of each row that names its part. */
  name: string;
  /** The field of each row that is its value. A value under zero counts as 0: a share is never negative. */
  value: string;
  /** The card's title. It names the plot too. */
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
  /** The part that is picked, by its name: its segment of the bar and its row stay lit and the rest step back. Left out, the chart keeps its own, starting with none. */
  selected?: string | null;
  /** Called with the picked part's name, or null when it is picked again. */
  onSelectedChange?: (selected: string | null) => void;
  /** The height of the loading and empty states, in points. */
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
  style?: ViewStyle;
}

/** A share in the list: a whole number. */
const WHOLE = { type: "percent", digits: 0 } as const;

/** Layout no token decides; what the tokens decide (the bar's height and gaps, the rows, the swatch and the type) is the recipe's. */
const useStyles = createStyles(() => ({
  bar: { flexDirection: "row", alignItems: "stretch" },
  list: { alignSelf: "stretch" },
  part: { flexDirection: "row", alignItems: "center" },
  label: { flex: 1 },
  value: { fontVariant: ["tabular-nums"] },
  share: { textAlign: "right", fontVariant: ["tabular-nums"] },
}));

interface PartProps {
  id: (part: string) => string;
  part: Segment;
  value: string;
  share: string;
  shareW: number;
  color: string;
  /** The part the bar is lighting is this one. */
  active: boolean;
  onPress: () => void;
  styles?: PartStyles<"breakdown">;
  strings?: Partial<KitStrings["breakdown"]>;
}

/** One row of the list: a colour, a name, a value and a share. Tapping it lights its part of the bar. */
function Part({ id, part, value, share, shareW, color, active, onPress, styles, strings }: PartProps) {
  const str = useStrings("breakdown", strings);
  const s = useStyles();
  const tk = useChartTokens();
  // The phone has no hover: a row is lit while it is pressed, or while its part is the one picked.
  const press = usePress();
  const r = useRecipe(recipes.breakdown, { state: { pressed: press.pressed || active, focus: press.focused }, styles });
  const swatch = partStyle(r, "swatch", { view: { backgroundColor: color } });
  const name = partStyle(r, "label", { text: chartFont(tk) });
  const amount = partStyle(r, "value", { text: chartFont(tk, "semibold") });
  const portion = partStyle(r, "share", { view: { minWidth: shareW }, text: chartFont(tk) });
  return (
    <Pressable testID={id("part")} accessibilityRole="button" accessibilityLabel={str("partLabel", { label: part.label, value, share })} accessibilityState={{ selected: active }} onPress={() => onPress()} {...press.handlers} style={[s.part, r.part.view]}>
      <View testID={id("swatch")} style={swatch.view} />
      <Text testID={id("label")} numberOfLines={1} style={[s.label, name.view, name.text]}>{part.label}</Text>
      <Text testID={id("value")} style={[s.value, amount.view, amount.text]}>{value}</Text>
      <Text testID={id("share")} style={[s.share, portion.view, portion.text]}>{share}</Text>
    </Pressable>
  );
}

export function Breakdown({ data, name, value, title, subtitle = "", format = "integer", valueLabel, delta, deltaFormat, inverse = false, period = "", selected, onSelectedChange, height = 160, empty, emptyLine, loading = false, styles, strings, style, testID, ...rest }: BreakdownProps) {
  const str = useStrings("breakdown", strings);
  const locale = useLocale();
  const id = (part: string) => partId(testID, "breakdown", part);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const s = useStyles();
  const tk = useChartTokens();
  const r = useRecipe(recipes.breakdown, { styles });
  // Up to eight parts keep a colour of the palette; any after that are one more, "Other", in a neutral grey.
  const parts = segmentsOf(data, name, value, str("other"));
  const palette = seriesColors(tk);
  const colors = parts.map((p, i) => (p.folded ? tk.chart.other : palette[i % palette.length]!));
  const total = totalOf(parts);
  // A finger has no hover: a tap on a part of the bar or on its row picks it, and a tap on it again puts it back.
  const [picked, setPicked] = useControllable(selected, onSelectedChange);
  const at = picked == null ? -1 : parts.findIndex((p) => p.label === picked);
  const summary = summarizeSegments({ label: title, segments: parts, format, formatWords, locale }, {
    noData: (v) => str("noData", v),
    allZero: (v) => str("summaryAllZero", v),
    more: (v) => str("summaryMore", v),
    part: (v) => str("summaryPart", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  });
  const shareW = labelWidth(["100%"], tk.text.caption);
  // A part with nothing in it has no width to give the bar: it stays in the list.
  const drawn = parts.map((p, i) => ({ p, i })).filter(({ p }) => p.value > 0);
  const pick = (i: number) => {
    const next = parts[i]?.label;
    if (next !== undefined) setPicked(picked === next ? null : next);
  };
  return (
    <ChartCard
      id="breakdown"
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={!loading && data.length ? { value: total, format, delta, deltaFormat, inverse, period } : undefined}
      table={!loading && data.length ? { data, x: name, y: value, format, labels: { [value]: valueLabel ?? str("valueLabel") } } : null}
      style={style}
      {...({ testID, ...rootProps(rest) } as object)}
    >
      <ChartFrame height={height} grow interactive label={loading ? str("loading", { title }) : summary} loading={loading} empty={parts.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {() => (
          <View testID={id("plot")} style={r.plot.view}>
            <Enter motion="grow-x" testID={id("bar")} accessible accessibilityRole="image" accessibilityLabel={summary} style={[s.bar, r.bar.view]}>
              {drawn.length ? (
                drawn.map(({ p, i }, k) => (
                  <Pressable
                    key={p.label}
                    testID={id("segment")}
                    accessible={false}
                    onPress={() => pick(i)}
                    style={
                      partStyle(r, "segment", {
                        view: {
                          flex: p.value,
                          backgroundColor: colors[i],
                          opacity: at < 0 || at === i ? 1 : DIMMED,
                          borderTopLeftRadius: k === 0 ? tk.radius.pill : 0,
                          borderBottomLeftRadius: k === 0 ? tk.radius.pill : 0,
                          borderTopRightRadius: k === drawn.length - 1 ? tk.radius.pill : 0,
                          borderBottomRightRadius: k === drawn.length - 1 ? tk.radius.pill : 0,
                        },
                      }).view
                    }
                  />
                ))
              ) : (
                // Every value is 0: the whole is nothing, so the bar is its empty track.
                <View testID={id("segment")} style={partStyle(r, "segment", { view: { flex: 1, backgroundColor: tk.chart.track, borderRadius: tk.radius.pill } }).view} />
              )}
            </Enter>
            <View testID={id("list")} accessibilityRole="list" accessibilityLabel={str("parts")} style={[s.list, r.list.view]}>
              {parts.map((p, i) => (
                <Part key={p.label} id={id} part={p} value={fmt(format, p.value, formatWords, locale)} share={fmt(WHOLE, shareOf(p.value, total), formatWords, locale)} shareW={shareW} color={colors[i]!} active={at === i} onPress={() => pick(i)} styles={styles} strings={strings} />
              ))}
            </View>
          </View>
        )}
      </ChartFrame>
    </ChartCard>
  );
}
