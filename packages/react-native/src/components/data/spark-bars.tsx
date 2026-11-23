import { View, type ViewStyle } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { type RootProps, partId, rootProps } from "../../lib/root-props";
import { EARLIER_BARS, barLayout, fmt, valueDomain, withAlpha, type FormatSpec, type FormatWords, type Row } from "@antfabric/ui-core/chart";
import { createStyles } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { giftedAnimated, useChartTokens, useReducedMotion } from "../../data/theme";

export type SparkBarsTone = "default" | "positive" | "negative";

export interface SparkBarsProps extends RootProps {
  /** Rows, one per period, in order. */
  data: Row[];
  /** The field of each row that is the value. A value that is not a number is left out. */
  y: string;
  /** Points. */
  width?: number;
  /** Points. */
  height?: number;
  /** Draws in once when it mounts, unless the person reduces motion. Off by default: a page holds many, and a list of them would all move at once. */
  animate?: boolean;
  /** The hue: the first series colour, or the data palette's gain or loss. */
  tone?: SparkBarsTone;
  /** A format name, its options or a function, as core's `fmt` takes: how the default label prints the latest value. Not drawn. */
  format?: FormatSpec;
  /** What a screen reader hears. Default: how many periods there are and the latest value, in `format`. */
  label?: string;
  /** Per-part styles over the theme: `{ root: {…} }`. */
  styles?: PartStyles<"spark-bars">;
  /** The built-in text, by key: what a screen reader hears by default. */
  strings?: Partial<KitStrings["spark-bars"]>;
  style?: ViewStyle;
}

const useStyles = createStyles(() => ({
  root: { flexShrink: 0, overflow: "hidden" },
}));

/** The label's default number: two decimals at most, grouped, in the viewer's locale. */
const DEFAULT_FORMAT: FormatSpec = { type: "decimal", digits: 2 };

export function SparkBars({ data, y, width = 96, height = 36, animate = false, tone = "default", format = DEFAULT_FORMAT, label, styles, strings, testID, style, ...rest }: SparkBarsProps) {
  const s = useStyles();
  const t = useChartTokens();
  const r = useRecipe(recipes["spark-bars"], { styles });
  const str = useStrings("spark-bars", strings);
  // The words a format writes (points, a duration, the dash) are the kit's, so the default label is said in the product's language.
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const reduced = useReducedMotion();
  const values = data.map((row) => row[y]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const root = partStyle(r, "root", { view: { width, height } });
  const frame = [s.root, root.view, style];
  if (!values.length) return <View testID={partId(testID, "spark-bars", "root")} {...rootProps(rest)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={frame} />;
  const color = tone === "positive" ? t.data.positive : tone === "negative" ? t.data.negative : t.chart.series1;
  const [lo, hi] = valueDomain(values.map((v) => ({ v })), ["v"]);
  const last = values.length - 1;
  const layout = barLayout(width, values.length, t.chart.barGap);
  const { gap } = layout;
  const barWidth = Math.min(layout.barWidth, t.kpi.sparkBarMaxW);
  const said = label || str("summary", { count: values.length, latest: fmt(format, values[last], formatWords, locale) });
  return (
    <View testID={partId(testID, "spark-bars", "root")} accessible accessibilityRole="image" accessibilityLabel={said} {...rootProps(rest)} style={frame}>
      <BarChart
        data={values.map((value, i) => ({ value, frontColor: i === last ? color : withAlpha(color, EARLIER_BARS) }))}
        width={width}
        height={height}
        barWidth={barWidth}
        spacing={gap}
        initialSpacing={0}
        endSpacing={0}
        maxValue={hi === lo ? lo + 1 : hi}
        noOfSections={1}
        hideAxesAndRules
        hideYAxisText
        yAxisLabelWidth={0}
        xAxisLabelsHeight={0}
        labelsExtraHeight={0}
        xAxisThickness={0}
        yAxisThickness={0}
        barBorderTopLeftRadius={t.kpi.sparkBarRadius}
        barBorderTopRightRadius={t.kpi.sparkBarRadius}
        disableScroll
        disablePress
        isAnimated={giftedAnimated(animate, reduced)}
      />
    </View>
  );
}
