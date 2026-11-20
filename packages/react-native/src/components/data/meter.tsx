import { Text, View, type ViewStyle } from "react-native";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import { Icon } from "../../lib/icon";
import { type RootProps, partId, rootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { meterReading, meterTone, type FormatSpec, type MeterKind, type MeterThresholds, type FormatWords } from "@antfabric-ui/core/chart";
import { createStyles, useTheme } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";

export type { MeterKind, MeterThresholds };

export interface MeterProps extends RootProps {
  /** What there is, in the same unit as `max`. */
  value: number;
  /** The capacity or target the value is measured against: 1 when the value is already a share. */
  max?: number;
  /** What is measured, and the meter's accessible name. */
  label: string;
  /** `usage` (seats, storage, quota) is fine while low and worse as it fills; `score` (a goal, a health rating) is fine while high. */
  kind?: MeterKind;
  /** `percent` (the default) prints the share, `42%`. Any other format prints `value of max` in it, `9.4 of 10 GB`. */
  format?: FormatSpec;
  /** The shares of `max` where the fill turns to the caution colour and then the loss colour. Default usage 0.75 and 0.9, score 0.6 and 0.4. */
  thresholds?: MeterThresholds;
  /** Just a short track with the value beside it, for a row of a list that already names what it is. The label stays the track's accessible name. */
  compact?: boolean;
  /** An icon beside the value in the caution and critical states, so the state is not the fill's colour alone. The spoken value always says it. */
  showState?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, head: {…}, label: {…}, value: {…}, track: {…}, fill: {…} }`. */
  styles?: PartStyles<"meter">;
  /** The built-in text, by key: the dash for a value that is not a number, and `value of max`. */
  strings?: Partial<KitStrings["meter"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (the track, the fill's radius and colour, the type, the gaps) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "stretch" },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  track: { overflow: "hidden" },
  compactRoot: { flexDirection: "row", alignItems: "center" },
  fill: { position: "absolute", top: 0, bottom: 0, left: 0 },
  valueRow: { flexDirection: "row", alignItems: "center" },
  mark: { marginRight: t.space["2xs"] },
}));

export function Meter({ value, max = 1, label, kind = "usage", format = "percent", thresholds, compact = false, showState = false, styles, strings, testID, style, ...rest }: MeterProps) {
  const s = useStyles();
  const { t } = useTheme();
  const r = useRecipe(recipes.meter, { variants: { kind }, styles });
  const str = useStrings("meter", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const known = Number.isFinite(value) && Number.isFinite(max) && max > 0;
  const share = known ? value / max : 0;
  const tone = meterTone(kind, share, thresholds);
  const reading = meterReading(value, max, formatWords, format, locale);
  const shown = reading.kind === "unavailable" ? str("unavailable") : reading.kind === "of" ? str("valueOfMax", { value: reading.value, max: reading.max }) : reading.value;
  const fill = tone === "warning" ? t.data.warning : tone === "danger" ? t.data.negative : null;
  const root = partStyle(r, "root", { view: compact ? s.compactRoot : { minWidth: t.kpi.meterMinW } });
  const value$ = partStyle(r, "value", { text: { fontVariant: ["tabular-nums"] } });
  const track = partStyle(r, "track", { view: compact && { width: t.kpi.meterCompactW, flexShrink: 0 } });
  const bar = partStyle(r, "fill", { view: [{ width: `${Math.min(1, Math.max(0, share)) * 100}%` }, fill !== null && { backgroundColor: fill }] });
  const said = tone === "warning" ? str("stateWarning", { value: shown }) : tone === "danger" ? str("stateDanger", { value: shown }) : shown;
  const mark = showState && tone !== "ok" ? <Icon name={tone === "danger" ? "circle-alert" : "triangle-alert"} size={t.icon.sizeMd} color={fill ?? t.fg.body} style={s.mark} /> : null;
  const readout = <Text testID={partId(testID, "meter", "value")} maxFontSizeMultiplier={fontScale.chrome} style={[value$.view, value$.text]}>{shown}</Text>;
  const valueText = mark ? <View style={s.valueRow}>{mark}{readout}</View> : readout;
  return (
    <View
      testID={partId(testID, "meter", "root")}
      {...rootProps(rest)}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={known ? { min: 0, max, now: Math.min(max, Math.max(0, value)), text: said } : { text: shown }}
      style={[s.root, root.view, style]}
    >
      {!compact ? (
        <View testID={partId(testID, "meter", "head")} style={[s.head, r.head.view]}>
          <Text testID={partId(testID, "meter", "label")} maxFontSizeMultiplier={fontScale.chrome} style={[r.label.view, r.label.text]}>{label}</Text>
          {valueText}
        </View>
      ) : null}
      <View testID={partId(testID, "meter", "track")} style={[s.track, track.view]}>
        <View testID={partId(testID, "meter", "fill")} style={[s.fill, bar.view]} />
      </View>
      {compact ? valueText : null}
    </View>
  );
}
