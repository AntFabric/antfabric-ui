import type { CSSProperties } from "react";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { meterIcon, meterReading, meterTone, type FormatSpec, type MeterKind, type MeterThresholds, type FormatWords } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { type RootProps, rootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, row, text } from "../../lib/style";

export type { MeterKind, MeterThresholds };

export interface MeterProps extends RootProps<HTMLDivElement> {
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
  /** Just a short track with the value beside it, for a row of a table or a list that already names what it is. The label stays the track's accessible name. */
  compact?: boolean;
  /** An icon beside the value in the caution and critical states, so the state is not the fill's colour alone. On by default. The spoken value always says it. */
  showState?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, head: {…}, label: {…}, value: {…}, track: {…}, fill: {…} }`. */
  styles?: PartStyles<"meter">;
  /** The built-in text, by key: the dash for a value that is not a number, and `value of max`. */
  strings?: Partial<KitStrings["meter"]>;
  style?: CSSProperties;
}

export function Meter({ value, max = 1, label, kind = "usage", format = "percent", thresholds, compact = false, showState = true, styles, strings, style, ...rest }: MeterProps) {
  const r = useRecipe(recipes.meter, { variants: { kind }, styles });
  const s = useStrings("meter", strings);
  const formatWords: FormatWords = { unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const known = Number.isFinite(value) && Number.isFinite(max) && max > 0;
  const share = known ? value / max : 0;
  // No value has no state: an empty score is not critical, in the fill, the icon or the words.
  const tone = known ? meterTone(kind, share, thresholds) : "ok";
  const reading = meterReading(value, max, formatWords, format, locale);
  const shown = reading.kind === "unavailable" ? s("unavailable") : reading.kind === "of" ? s("valueOfMax", { value: reading.value, max: reading.max }) : reading.value;
  const fill = tone === "warning" ? t.data.warning : tone === "danger" ? t.data.negative : null;
  // The state is spoken as well as drawn: the fill's colour is never the only signal.
  const said = tone === "warning" ? s("stateWarning", { value: shown }) : tone === "danger" ? s("stateDanger", { value: shown }) : shown;
  const icon = meterIcon(tone);
  const mark = showState && icon ? <Icon name={icon} size={t.icon.sizeMd} color={fill ?? undefined} style={{ marginRight: t.space["2xs"] }} /> : null;
  const valueText = <span data-af-part="value" style={css(text, partStyle(r, "value", { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...(mark ? { display: "inline-flex", alignItems: "center" } : {}) }))}>{mark}{shown}</span>;
  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, partStyle(r, "root", { alignSelf: "stretch" }, compact ? { flexDirection: "row", alignItems: "center" } : { minWidth: t.kpi.meterMinW }), style)}>
      {!compact ? (
        <div data-af-part="head" style={css(row, { justifyContent: "space-between" }, r.head)}>
          <span data-af-part="label" style={css(text, r.label)}>{label}</span>
          {valueText}
        </div>
      ) : null}
      <div
        // A meter has a value: without one (not a number) there is no meter to read, so it is a named image saying so, not a role missing its required `aria-valuenow`.
        role={known ? "meter" : "img"}
        aria-label={known ? label : `${label}, ${shown}`}
        aria-valuemin={known ? 0 : undefined}
        aria-valuemax={known ? max : undefined}
        aria-valuenow={known ? Math.min(max, Math.max(0, value)) : undefined}
        aria-valuetext={known ? said : undefined}
        data-af-part="track"
        style={css(box, partStyle(r, "track", { overflow: "hidden" }, compact && { width: t.kpi.meterCompactW, flexShrink: 0 }))}
      >
        {/* The fill is the track's whole width, slid left by what is unfilled: a transform moves on the compositor, where a width would lay the page out every frame. The track clips it. */}
        <div data-af-part="fill" style={partStyle(r, "fill", { position: "absolute", top: 0, bottom: 0, left: 0, width: "100%", transform: `translateX(${-(1 - Math.min(1, Math.max(0, share))) * 100}%)`, transition: `transform ${t.duration.slow} ${t.ease.out}` }, fill !== null && { background: fill })} />
      </div>
      {compact ? valueText : null}
    </div>
  );
}
