import type { CSSProperties } from "react";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { fmt, useTween, valueParts, type FormatSpec, type FormatWords } from "@antfabric/ui-core/chart";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { css, visuallyHidden } from "../../lib/style";
import { useChartTokens, useReducedMotion } from "../../data/theme";

export type MetricValueSize = "sm" | "md" | "lg" | "xl";

export interface MetricValueProps extends RootProps<HTMLSpanElement> {
  /** The number. When it changes the digits ease to the new one (not under reduced motion). */
  value: number;
  /** A format name, its options, or a function: what core's `fmt` takes. Its symbol and unit are drawn smaller and fainter than the digits. */
  format?: FormatSpec;
  size?: MetricValueSize;
  /** Per-part styles over the theme: `{ root: {…}, unit: {…} }`. */
  styles?: PartStyles<"metric-value">;
  /** The built-in text, by key: the words a format writes (the dash for no value, the unit of points, minutes and seconds). */
  strings?: Partial<KitStrings["metric-value"]>;
  style?: CSSProperties;
}

const DEFAULT_FORMAT: FormatSpec = { type: "currency" };

/* A symbol or unit is this much of the digits' size, and a little air either side of it: ratios, which a recipe does not hold. */
const UNIT_SCALE = 0.62;
const UNIT_AIR = "0.05em";
const LINE = 1.05;

/** The layout no token decides; the sizes, ink and weights are the recipe's. Figures are proportional: tabular ones are for numbers that stack in a column. */
const root: CSSProperties = { display: "inline-flex", alignItems: "baseline", whiteSpace: "nowrap", lineHeight: LINE, fontVariantNumeric: "proportional-nums" };

export function MetricValue({ value, format = DEFAULT_FORMAT, size = "md", styles, strings, style, ...rest }: MetricValueProps) {
  const str = useStrings("metric-value", strings);
  const locale = useLocale();
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const r = useRecipe(recipes["metric-value"], { variants: { size }, styles });
  const tk = useChartTokens();
  const shown = useTween(value, { easing: tk.ease.out, off: useReducedMotion() });
  return (
    <span data-af-part="root" {...rootProps(rest)} style={css(root, r.root, style)}>
      {/* A screen reader gets the finished value once, not the digits on their way. */}
      <span style={visuallyHidden}>{fmt(format, value, formatWords, locale)}</span>
      <span aria-hidden style={{ display: "contents" }}>
        {valueParts(format, shown, formatWords, locale).map((p, i) =>
          p.digits ? (
            <span key={i}>{p.s}</span>
          ) : (
            <span key={i} data-af-part="unit" style={css({ fontSize: `${UNIT_SCALE}em`, marginInline: UNIT_AIR }, r.unit)}>
              {p.s}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
