import { useId } from "react";
import { View, type ViewStyle } from "react-native";
import { LinearGradient, Stop } from "react-native-svg";
import { LineChart } from "react-native-gifted-charts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { type RootProps, partId, rootProps } from "../../lib/root-props";
import { FLAT_FILL, fmt, valueDomain, type FormatSpec, type Row } from "@antfabric-ui/core/chart";
import { createStyles } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { giftedAnimated, useChartTokens, useReducedMotion } from "../../data/theme";

export type SparklineTone = "default" | "positive" | "negative";

export interface SparklineProps extends RootProps {
  /** Rows, one per point, in order. */
  data: Row[];
  /** The field of each row that is the value. A value that is not a number is left out. */
  y: string;
  /** Points. */
  width?: number;
  /** Points. */
  height?: number;
  /** A flat fill under the line: the line's colour at one opacity, never a gradient. */
  area?: boolean;
  /** A dot on the last point, ringed in the card's colour. */
  marker?: boolean;
  /** Edge to edge, the fill running to the bottom: a trend bled into the foot of a card. */
  flush?: boolean;
  /** Draws in once when it mounts, unless the person reduces motion. Off by default: a page holds many, and a list of them would all move at once. */
  animate?: boolean;
  /** The hue: the first series colour, or the data palette's gain or loss. */
  tone?: SparklineTone;
  /** A format name, its options or a function, as core's `fmt` takes: how the default label prints the first and last value. Not drawn. */
  format?: FormatSpec;
  /** What a screen reader hears. Default: where the trend starts and ends, in `format`. */
  label?: string;
  /** Per-part styles over the theme: `{ root: {…} }`. */
  styles?: PartStyles<"sparkline">;
  /** The built-in text, by key: what a screen reader hears by default. */
  strings?: Partial<KitStrings["sparkline"]>;
  style?: ViewStyle;
}

/* The air a line gets above and below its extremes, as a share of its range: a line never runs along the frame; a flush one gets more under it for the fill. */
const AIR = 0.12;
const AIR_UNDER_FLUSH = 0.35;
/** The label's default number: two decimals at most, grouped, in the viewer's locale. */
const DEFAULT_FORMAT: FormatSpec = { type: "decimal", digits: 2 };

const useStyles = createStyles(() => ({
  root: { flexShrink: 0, overflow: "hidden" },
}));

export function Sparkline({ data, y, width = 120, height = 32, area = false, marker = false, flush = false, animate = false, tone = "default", format = DEFAULT_FORMAT, label, styles, strings, testID, style, ...rest }: SparklineProps) {
  const s = useStyles();
  const t = useChartTokens();
  const r = useRecipe(recipes.sparkline, { styles });
  const str = useStrings("sparkline", strings);
  const locale = useLocale();
  const reduced = useReducedMotion();
  // gifted-charts names its area gradient `Gradient-line-0` in every chart, and an SVG id is the page's: two sparklines of different tones would share the first one's fill. This one's is its own.
  const gradient = `af-chart-${useId().replace(/\W/g, "")}`;
  const values = data.map((row) => row[y]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const root = partStyle(r, "root", { view: { width, height } });
  const frame = [s.root, root.view, style];
  if (!values.length) return <View testID={partId(testID, "sparkline", "root")} {...rootProps(rest)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={frame} />;
  const color = tone === "positive" ? t.data.positive : tone === "negative" ? t.data.negative : t.chart.series1;
  const [lo, hi] = valueDomain(values.map((v) => ({ v })), ["v"], { zero: false });
  const span = hi - lo || 1;
  const floor = lo - span * (flush ? AIR_UNDER_FLUSH : AIR);
  const edge = flush ? 0 : t.chart.pointR;
  const said = label || str("trend", { from: fmt(format, values[0], undefined, locale), to: fmt(format, values[values.length - 1], undefined, locale) });
  // One point has no line to draw: it is a dot.
  const last = values.length - 1;
  const dots = marker || values.length === 1;
  const points = values.map((value, i) => ({ value, hideDataPoint: !(dots && i === last), dataPointRadius: t.chart.pointR - 1, dataPointColor: color }));
  return (
    <View testID={partId(testID, "sparkline", "root")} {...rootProps(rest)} accessible accessibilityRole="image" accessibilityLabel={said} style={frame}>
      <LineChart
        data={points}
        width={width}
        height={height}
        adjustToWidth
        initialSpacing={edge}
        endSpacing={edge}
        hideAxesAndRules
        hideYAxisText
        yAxisLabelWidth={0}
        xAxisLabelsHeight={0}
        labelsExtraHeight={0}
        disableScroll
        curved
        thickness={t.chart.sparkW}
        color={color}
        hideDataPoints={!dots}
        areaChart={area}
        startFillColor={color}
        endFillColor={color}
        startOpacity={FLAT_FILL}
        endOpacity={FLAT_FILL}
        areaGradientId={gradient}
        areaGradientComponent={() => (
          <LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={FLAT_FILL} />
            <Stop offset="1" stopColor={color} stopOpacity={FLAT_FILL} />
          </LinearGradient>
        )}
        yAxisOffset={floor}
        maxValue={hi + span * AIR - floor}
        noOfSections={1}
        isAnimated={giftedAnimated(animate, reduced)}
      />
    </View>
  );
}
