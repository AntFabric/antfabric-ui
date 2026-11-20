import { Text, View, type ViewStyle } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { type RootProps, partId, rootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { fmt, type FormatWords } from "@antfabric-ui/core/chart";
import { createStyles } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { chartFont, giftedAnimated, useChartTokens, useReducedMotion } from "../../data/theme";

export type ProgressRingTone = "default" | "positive" | "negative" | "warning";

export interface ProgressRingProps extends RootProps {
  /** What is done, in the same unit as `max`. */
  value: number;
  /** The goal: 1 when the value is already a share. */
  max?: number;
  /** Points. Default 56 on the web and desktop, 48 on the phone. */
  size?: number;
  /** The stroke's width, points. 0 is 12% of the size, at least 5. */
  thickness?: number;
  /** The hue: the first series colour, or the data palette's gain, loss or caution. */
  tone?: ProgressRingTone;
  /** The text in the middle. Empty is the share, `58%`. */
  center?: string;
  /** Draws in once when it mounts, unless the person reduces motion. Off by default. */
  animate?: boolean;
  /** The ring's name, for a screen reader. Default: the text in the middle if there is one, then the share of the goal. The share is the ring's spoken value either way. */
  label?: string;
  /** Per-part styles over the theme: `{ root: {…}, center: {…} }`. */
  styles?: PartStyles<"progress-ring">;
  /** The built-in text, by key: what a screen reader hears by default, and the dash in the middle for a value that is not a number. */
  strings?: Partial<KitStrings["progress-ring"]>;
  style?: ViewStyle;
}

/* The stroke is this share of the ring's size, with a floor of `kpi.ringMinW`. gifted-charts' slices have no round ends. */
const STROKE = 0.12;
/* A slice of nothing would not draw; this is nothing a person could see. */
const SLIVER = 0.0001;

const useStyles = createStyles(() => ({
  root: { flexShrink: 0 },
  center: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
}));

export function ProgressRing({ value, max = 1, size, thickness = 0, tone = "default", center = "", animate = false, label, styles, strings, testID, style, ...rest }: ProgressRingProps) {
  const s = useStyles();
  const t = useChartTokens();
  const r = useRecipe(recipes["progress-ring"], { styles });
  const str = useStrings("progress-ring", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const reduced = useReducedMotion();
  const diameter = size ?? t.kpi.ringSize;
  const known = Number.isFinite(value) && Number.isFinite(max) && max > 0;
  const share = known ? Math.min(1, Math.max(0, value / max)) : 0;
  const color = tone === "positive" ? t.data.positive : tone === "negative" ? t.data.negative : tone === "warning" ? t.data.warning : t.chart.series1;
  const stroke = thickness || Math.max(t.kpi.ringMinW, Math.round(diameter * STROKE));
  const outer = diameter / 2;
  const percent = known ? fmt({ type: "percent", digits: 0 }, share, formatWords, locale) : str("unavailable");
  const root = partStyle(r, "root", { view: { width: diameter, height: diameter } });
  const mid = partStyle(r, "center", { text: [chartFont(t, "semibold"), { fontVariant: ["tabular-nums"] }] });
  const spoken = known ? (center ? str("ofGoalCenter", { center, percent: fmt("percent", share, formatWords, locale) }) : str("ofGoal", { percent: fmt("percent", share, formatWords, locale) })) : str("progressUnavailable");
  return (
    <View
      testID={partId(testID, "progress-ring", "root")}
      {...rootProps(rest)}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label || spoken}
      accessibilityValue={known ? { min: 0, max, now: Math.min(max, Math.max(0, value)), text: spoken } : { text: spoken }}
      style={[s.root, root.view, style]}
    >
      {/* gifted-charts' pie starts at 12 o'clock and runs clockwise: the value's slice first, the rest in the track's colour. */}
      <PieChart
        donut
        radius={outer}
        innerRadius={outer - stroke}
        innerCircleColor={t.surface.card}
        strokeWidth={0}
        data={[{ value: Math.max(share, SLIVER), color: share > 0 ? color : t.chart.track }, { value: Math.max(1 - share, SLIVER), color: t.chart.track }]}
        isAnimated={giftedAnimated(animate, reduced)}
      />
      <View testID={partId(testID, "progress-ring", "center")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[s.center, mid.view]}>
        <Text maxFontSizeMultiplier={fontScale.chrome} style={mid.text}>{center || percent}</Text>
      </View>
    </View>
  );
}
