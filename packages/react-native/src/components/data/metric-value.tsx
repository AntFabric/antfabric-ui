import { Fragment } from "react";
import { Text, type TextStyle } from "react-native";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { fmt, useTween, valueParts, type FormatSpec, type FormatWords } from "@antfabric/ui-core/chart";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { useChartTokens, useReducedMotion } from "../../data/theme";

export type MetricValueSize = "sm" | "md" | "lg" | "xl";

export interface MetricValueProps extends RootProps<Text> {
  /** The number. When it changes the digits ease to the new one (not when the person reduces motion). */
  value: number;
  /** A format name, its options, or a function: what core's `fmt` takes. Its symbol and unit are drawn smaller and fainter than the digits. */
  format?: FormatSpec;
  size?: MetricValueSize;
  /** Per-part styles over the theme: `{ root: {…}, unit: {…} }`. */
  styles?: PartStyles<"metric-value">;
  /** The built-in text, by key: the words a format writes (the dash for no value, the unit of points, minutes and seconds). */
  strings?: Partial<KitStrings["metric-value"]>;
  style?: TextStyle;
}

const DEFAULT_FORMAT: FormatSpec = { type: "currency" };

/* A symbol or unit is this much of the digits' size, and the line is this much of it: ratios, which a recipe does not hold. */
const UNIT_SCALE = 0.62;
const LINE = 1.1;

export function MetricValue({ value, format = DEFAULT_FORMAT, size = "md", styles, strings, style, testID, ...rest }: MetricValueProps) {
  const str = useStrings("metric-value", strings);
  const locale = useLocale();
  const id = (part: string) => partId(testID, "metric-value", part);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const r = useRecipe(recipes["metric-value"], { variants: { size }, styles });
  const t = useChartTokens();
  const shown = useTween(value, { easing: t.motion.easing.out, off: useReducedMotion() });
  const digits = r.root.text.fontSize as number;
  const root = partStyle(r, "root", { text: { lineHeight: Math.round(digits * LINE), fontVariant: ["proportional-nums"] } });
  const unit = partStyle(r, "unit", { text: { fontSize: digits * UNIT_SCALE } });
  // A Text inherits nothing, but a Text inside a Text inherits its parent: the unit takes the digits' baseline and overrides what differs.
  return (
    <Text
      testID={id("root")}
      accessible
      accessibilityRole="text"
      accessibilityLabel={fmt(format, value, formatWords, locale)}
      {...rootProps(rest)}
      style={[root.view, root.text, style]}
    >
      {valueParts(format, shown, formatWords, locale).map((p, i) =>
        p.digits ? (
          <Fragment key={i}>{p.s}</Fragment>
        ) : (
          <Text key={i} testID={id("unit")} style={[unit.view, unit.text]}>
            {p.s}
          </Text>
        ),
      )}
    </Text>
  );
}
