import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { type RootProps, partId, rootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { PieChart } from "react-native-gifted-charts";
import { recipes, useControllable, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { DIMMED, DONUT_HOLE, fmt, labelWidth, segmentAt, segmentsOf, seriesColors, shareOf, summarizeSegments, totalOf, useSeries, withAlpha, type FormatSpec, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { createStyles } from "../../theme";
import { usePress } from "../../lib/press";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { chartFont, useChartTokens } from "../../data/theme";
import { MetricValue } from "./metric-value";

export type { ChartHeadline };

export interface DonutChartProps extends RootProps {
  /** Rows, one per segment: `[{ channel: "Email", tickets: 312 }, …]`. The same rows can feed a table and a bar chart. */
  data: Row[];
  /** The field of each row that names its segment. */
  name: string;
  /** The field of each row that is its value. A value under zero counts as 0: a share is never negative. */
  value: string;
  /** The card's title. It names the plot too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** A format name, its options, or a function: what core's `fmt` takes. The centre, the list, the summary and the table print through it. */
  format?: FormatSpec;
  /** The value column's name in "View as table". */
  valueLabel?: string;
  /** What the hole says above the total: "Total". It says the picked segment's name instead while one is. */
  centerLabel?: string;
  /** The ring's width and height, in points. */
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
  /** The card title's heading level. The phone has one kind of header, so it is read for the web's sake and has no effect here. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"donut-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["donut-chart"]>;
  style?: ViewStyle;
}

const useStyles = createStyles((t) => ({
  plot: { alignItems: "stretch", gap: t.space.lg },
  ring: { alignSelf: "center", alignItems: "center", justifyContent: "center" },
  center: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
  hit: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  list: { alignSelf: "stretch" },
  row: { alignSelf: "stretch" },
  item: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  toggle: { position: "absolute", top: 0, bottom: 0 },
  label: { flex: 1 },
  share: { textAlign: "right" },
}));

interface ItemProps {
  label: string;
  value: string;
  share: string;
  color: string;
  /** The width the share column keeps, so the values above it line up. */
  shareW: number;
  on: boolean;
  /** The segment is the one the ring is showing: the picked one. */
  active: boolean;
  /** The row's press: picks the segment (or lets go of it). The swatch is the other control, and turns the segment off or back on. */
  onPick: () => void;
  onToggle: () => void;
  styles?: PartStyles<"donut-chart">;
  strings?: Partial<KitStrings["donut-chart"]>;
}

/** One row of the list: a swatch, the segment's name, its value and its share. Pressing the row picks the segment, the same as touching it on the ring; the swatch is its own control and turns the segment off or back on. */
function Item({ label, value, share, color, shareW, on, active, onPick, onToggle, styles, strings }: ItemProps) {
  const str = useStrings("donut-chart", strings);
  const s = useStyles();
  const tk = useChartTokens();
  // The phone has no hover: a row is lit while it is pressed, or while its segment is the picked one.
  const press = usePress();
  const r = useRecipe(recipes["donut-chart"], { state: { on, pressed: press.pressed || active, focus: press.focused }, styles });
  const swatch = partStyle(r, "swatch", { view: { backgroundColor: color, opacity: on ? 1 : tk.opacity.muted } });
  const name = partStyle(r, "label", { text: [chartFont(tk), { textDecorationLine: on ? "none" : "line-through" }] });
  const amount = partStyle(r, "value", { text: [chartFont(tk, "semibold"), { fontVariant: ["tabular-nums"] }] });
  const part = partStyle(r, "share", { view: { minWidth: shareW }, text: [chartFont(tk), { fontVariant: ["tabular-nums"] }] });
  // The switch sits beside the row's button, not inside it: a control nested in an accessible Pressable is folded into it, so a screen reader
  // never reaches it. It is drawn over the swatch, `control.hit` wide and the row's height, the swatch's centre on its centre.
  const inset = StyleSheet.flatten(r.item.view);
  const left = Number(inset.paddingLeft ?? inset.paddingHorizontal ?? inset.padding ?? 0) + (tk.space.smMd - tk.control.hit) / 2;
  return (
    <View style={s.row}>
      <Pressable
        testID="donut-chart.item"
        accessibilityRole="button"
        accessibilityLabel={str("segmentLabel", { label, value, share })}
        accessibilityState={{ selected: active, disabled: !on }}
        onPress={() => onPick()}
        {...press.handlers}
        style={[s.item, r.item.view]}
      >
        <View testID="donut-chart.swatch" style={swatch.view} />
        <Text testID="donut-chart.label" numberOfLines={1} maxFontSizeMultiplier={fontScale.chrome} style={[s.label, name.view, name.text]}>{label}</Text>
        <Text testID="donut-chart.value" maxFontSizeMultiplier={fontScale.chrome} style={[amount.view, amount.text]}>{value}</Text>
        <Text testID="donut-chart.share" maxFontSizeMultiplier={fontScale.chrome} style={[s.share, part.view, part.text]}>{share}</Text>
      </Pressable>
      <Pressable
        testID="donut-chart.toggle"
        accessibilityRole="switch"
        accessibilityLabel={str("toggleSegment", { label })}
        accessibilityState={{ checked: on }}
        onPress={() => onToggle()}
        style={[s.toggle, { left, width: tk.control.hit }]}
      />
    </View>
  );
}

export function DonutChart({ data, name, value, title, subtitle = "", headline, format = "integer", valueLabel, centerLabel, size, empty, emptyLine, loading = false, hidden, onHiddenChange, selected, onSelectedChange, styles, strings, headingLevel: _headingLevel, testID, style, ...rest }: DonutChartProps) {
  const str = useStrings("donut-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const s = useStyles();
  const tk = useChartTokens();
  const r = useRecipe(recipes["donut-chart"], { styles });
  const diameter = size ?? tk.chart.donutSize;
  // Up to eight segments keep a colour of the palette; any after that are one more, "Other", in a neutral grey.
  const all = segmentsOf(data, name, value, str("other"));
  const palette = seriesColors(tk);
  const colors = all.map((x, i) => (x.folded ? tk.chart.other : palette[i % palette.length]!));
  const series = useSeries(all.map((x) => x.key), colors, { hidden, onHiddenChange });
  const shown = all.filter((x) => series.visible.includes(x.key));
  const total = totalOf(shown);
  const [picked, setPicked] = useControllable(selected, onSelectedChange);
  const focus = shown.find((x) => x.key === picked) ?? null;
  const summary = summarizeSegments({ label: title, segments: shown, format, formatWords, locale }, {
    noData: (v) => str("noData", v),
    allZero: (v) => str("summaryAllZero", v),
    more: (v) => str("summaryMore", v),
    part: (v) => str("summaryPart", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  });
  const ring = partStyle(r, "ring", { view: { width: diameter, height: diameter } });
  const centerLabel$ = partStyle(r, "centerLabel", { view: { maxWidth: "70%" }, text: chartFont(tk) });
  const outer = diameter / 2 - tk.chart.sliceLift;
  const inner = outer * DONUT_HOLE;
  const shareW = labelWidth(["100.0%"], tk.text.caption);
  return (
    <ChartCard
      id="donut-chart"
      testID={testID}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && data.length ? { data, x: name, y: value, format, labels: { [value]: valueLabel ?? str("valueLabel") } } : null}
      style={style}
    >
      <ChartFrame height={diameter} grow interactive label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {() => (
          <View testID="donut-chart.plot" style={[s.plot, r.plot.view]}>
            <Enter motion="pop" testID="donut-chart.ring" accessible accessibilityRole="image" accessibilityLabel={summary} style={[s.ring, ring.view]}>
              {/* gifted-charts' pie starts at 12 o'clock and runs clockwise; the hole is a disc in the card's colour over a whole pie, and the segments are cut apart by a stroke in the same. */}
              <PieChart
                donut
                radius={outer}
                innerRadius={inner}
                innerCircleColor={tk.surface.card}
                strokeColor={tk.surface.card}
                strokeWidth={tk.chart.sliceGap}
                extraRadius={tk.chart.sliceLift}
                focusOnPress={false}
                // Every value is 0: the whole is nothing, so the ring is its track.
                data={
                  total > 0
                    ? shown.map((x) => ({ value: x.value, color: focus === null || focus.key === x.key ? series.colorOf(x.key) : withAlpha(series.colorOf(x.key), DIMMED) }))
                    : [{ value: 1, color: tk.chart.track }]
                }
              />
              {/* gifted-charts finds a pressed segment from the page's coordinates on the web, which are wrong wherever the chart is not at the page's corner; this finds it from where the touch landed in the ring. */}
              <View
                testID="donut-chart.hit"
                style={s.hit}
                onStartShouldSetResponder={() => total > 0}
                onResponderRelease={(e) => {
                  const hit = segmentAt(e.nativeEvent.locationX, e.nativeEvent.locationY, diameter, inner, outer, shown.map((x) => x.value));
                  const next = shown[hit]?.key;
                  if (next !== undefined) setPicked(picked === next ? null : next);
                }}
              />
              <View testID="donut-chart.center" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[s.center, r.center.view]}>
                <Text testID="donut-chart.centerLabel" numberOfLines={1} style={[centerLabel$.view, centerLabel$.text]}>
                  {focus ? focus.label : (centerLabel ?? str("centerLabel"))}
                </Text>
                <MetricValue value={focus ? focus.value : total} format={format} size="md" />
              </View>
            </Enter>
            <View testID="donut-chart.list" accessibilityRole="list" accessibilityLabel={str("segments")} style={[s.list, r.list.view]}>
              {all.map((x) => {
                const on = series.visible.includes(x.key);
                return <Item key={x.key} label={x.label} value={fmt(format, x.value, formatWords, locale)} share={on ? fmt("percent", shareOf(x.value, total), formatWords, locale) : str("unavailable")} color={series.colorOf(x.key)} shareW={shareW} on={on} active={focus?.key === x.key} onPick={() => setPicked(picked === x.key ? null : x.key)} onToggle={() => series.toggle(x.key)} styles={styles} strings={strings} />;
              })}
            </View>
          </View>
        )}
      </ChartFrame>
    </ChartCard>
  );
}
