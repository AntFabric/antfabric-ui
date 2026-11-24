import type { CSSProperties } from "react";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { fmt, withoutSign, type FormatSpec, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { css, row, text } from "../../lib/style";

export type DeltaSize = "sm" | "md" | "lg";
export type DeltaVariant = "text" | "badge";

export interface DeltaProps extends RootProps<HTMLSpanElement> {
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
  style?: CSSProperties;
}

const DEFAULT_FORMAT: FormatSpec = { type: "percent", sign: true };
const ARROW = { up: "arrow-up-right", down: "arrow-down-right", flat: "minus" } as const;

/** The layout no token decides; the type, the arrow's size and the badge's shape are the recipe's, and the colours are picked below. */
const root: CSSProperties = { ...row, display: "flex", alignSelf: "flex-start", flexShrink: 0 };

export function Delta({ value, inverse = false, format = DEFAULT_FORMAT, size = "md", variant = "text", styles, strings, style, ...rest }: DeltaProps) {
  const r = useRecipe(recipes.delta, { variants: { size, variant }, styles });
  const s = useStrings("delta", strings);
  const locale = useLocale();
  const formatWords: FormatWords = { unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) };
  const known = Number.isFinite(value);
  const direction = !known || value === 0 ? "flat" : value > 0 ? "up" : "down";
  // Good or bad is the direction against `inverse`: two inputs, which a recipe's variants cannot join, so the kit picks the pair (the recipe's `reads`).
  const tone = direction === "flat" ? "neutral" : (direction === "up") !== inverse ? "positive" : "negative";
  const ink = tone === "positive" ? t.color.text.data.onPositive : tone === "negative" ? t.color.text.data.onNegative : t.color.text.muted;
  const fill = tone === "positive" ? t.color.background.data.positiveSoft : tone === "negative" ? t.color.background.data.negativeSoft : t.color.background.muted;
  const good = tone === "positive";
  const change = () => ({ value: fmt(withoutSign(format), Math.abs(value), formatWords, locale) });
  const said = !known ? s("changeUnavailable") : direction === "flat" ? s("noChange") : direction === "up" ? (good ? s("upGood", change()) : s("upBad", change())) : good ? s("downGood", change()) : s("downBad", change());
  return (
    <span data-af-part="root" role="img" aria-label={said} {...rootProps(rest)} style={css(root, partStyle(r, "root", variant === "badge" && { background: fill }), style)}>
      <Icon part="icon" name={ARROW[direction]} style={partStyle(r, "icon", { color: ink })} />
      <span data-af-part="value" style={css(text, partStyle(r, "value", { color: ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", lineHeight: 1 }))}>
        {known ? fmt(format, value, formatWords, locale) : s("unavailable")}
      </span>
    </span>
  );
}
