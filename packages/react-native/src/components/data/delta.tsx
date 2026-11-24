import { Text, View, type ViewStyle } from "react-native";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { fmt, withoutSign, type FormatSpec, type FormatWords } from "@antfabric/ui-core/chart";
import { createStyles, useTheme } from "../../theme";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export type DeltaSize = "sm" | "md" | "lg";
export type DeltaVariant = "text" | "badge";

export interface DeltaProps extends RootProps<View> {
  /** The change, as the number the format prints: `0.044` is `+4.4%` under the default percent format. Zero, or a value that is not a number, has no direction. */
  value: number;
  /** Down is good (open tickets, response time): the colours swap, the arrow does not. */
  inverse?: boolean;
  /** A format name, its options, or a function: what core's `fmt` takes. The default prints a signed percent. */
  format?: FormatSpec;
  size?: DeltaSize;
  /** `text` is the arrow and the number in the data ink; `badge` sits them on the soft fill of the same hue. */
  variant?: DeltaVariant;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…}, value: {…} }`. */
  styles?: PartStyles<"delta">;
  /** The built-in text, by key: what a screen reader hears, and the dash for a change with no number. */
  strings?: Partial<KitStrings["delta"]>;
  style?: ViewStyle;
}

const DEFAULT_FORMAT: FormatSpec = { type: "percent", sign: true };
const ARROW = { up: "arrow-up-right", down: "arrow-down-right", flat: "minus" } as const;

/** Layout no token decides; the type, the arrow's size and the badge's shape are the recipe's, and the colours are picked below. */
const useStyles = createStyles(() => ({
  root: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", flexShrink: 0 },
  value: { fontVariant: ["tabular-nums"] },
}));

export function Delta({ value, inverse = false, format = DEFAULT_FORMAT, size = "md", variant = "text", styles, strings, style, testID, ...rest }: DeltaProps) {
  const s = useStyles();
  const { t } = useTheme();
  const r = useRecipe(recipes.delta, { variants: { size, variant }, styles });
  const str = useStrings("delta", strings);
  const locale = useLocale();
  const id = (part: string) => partId(testID, "delta", part);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const known = Number.isFinite(value);
  const direction = !known || value === 0 ? "flat" : value > 0 ? "up" : "down";
  // Good or bad is the direction against `inverse`: two inputs, which a recipe's variants cannot join, so the kit picks the pair (the recipe's `reads`).
  const tone = direction === "flat" ? "neutral" : (direction === "up") !== inverse ? "positive" : "negative";
  const ink = tone === "positive" ? t.color.text.data.onPositive : tone === "negative" ? t.color.text.data.onNegative : t.color.text.muted;
  const fill = tone === "positive" ? t.color.background.data.positiveSoft : tone === "negative" ? t.color.background.data.negativeSoft : t.color.background.muted;
  const good = tone === "positive";
  const change = () => ({ value: fmt(withoutSign(format), Math.abs(value), formatWords, locale) });
  const said = !known ? str("changeUnavailable") : direction === "flat" ? str("noChange") : direction === "up" ? (good ? str("upGood", change()) : str("upBad", change())) : good ? str("downGood", change()) : str("downBad", change());
  const root = partStyle(r, "root", { view: variant === "badge" && { backgroundColor: fill } });
  const figure = partStyle(r, "value", { text: { color: ink } });
  // The icon's size is its width and height (`size`); what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _h, ...iconRest } = r.icon.view;
  return (
    <View testID={id("root")} accessible accessibilityRole="image" accessibilityLabel={said} {...rootProps(rest)} style={[s.root, root.view, style]}>
      <Icon testID={id("icon")} name={ARROW[direction]} size={iconSize as number} color={r.icon.text.color ?? ink} style={Object.keys(iconRest).length ? iconRest : undefined} />
      {/* Every Text sets its own type: it inherits nothing. */}
      <Text testID={id("value")} style={[s.value, figure.view, figure.text]}>
        {known ? fmt(format, value, formatWords, locale) : str("unavailable")}
      </Text>
    </View>
  );
}
