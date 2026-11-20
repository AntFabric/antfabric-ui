/** What a Meter decides from its value, the same on both kits: which of its three states the fill is in, and what its value reads as. */

import { fmt, type FormatSpec, type FormatWords } from "./format";

export type MeterKind = "usage" | "score";

/** Where the fill changes colour, as a share of `max`. Usage turns at or above them; a score turns at or below them. */
export interface MeterThresholds {
  warning: number;
  danger: number;
}

/** Usage is fine while low (seats, storage, a quota); a score is fine while high (a goal, a health rating). */
export const METER_THRESHOLDS: Record<MeterKind, MeterThresholds> = { usage: { warning: 0.75, danger: 0.9 }, score: { warning: 0.6, danger: 0.4 } };

/** The state of a share (value over max): the kind's own colour, the caution, or the loss. */
export function meterTone(kind: MeterKind, share: number, thresholds: MeterThresholds = METER_THRESHOLDS[kind]): "ok" | "warning" | "danger" {
  if (kind === "usage") return share >= thresholds.danger ? "danger" : share >= thresholds.warning ? "warning" : "ok";
  return share <= thresholds.danger ? "danger" : share <= thresholds.warning ? "warning" : "ok";
}

const isPercent = (format: FormatSpec) => format === "percent" || (typeof format === "object" && format.type === "percent");

/** What a meter's value reads as, before it has words: the share (`42%`), the value of the capacity (`9.4` of `10 GB`), or nothing to show. */
export type MeterReading = { kind: "unavailable" } | { kind: "share"; value: string } | { kind: "of"; value: string; max: string };

/**
 * `42%` for a percent format, `9.4` and `10 GB` for any other (the kit says "of": `{value} of {max}`); `unavailable` while the value or the capacity is not a
 * number (or the capacity is not above zero), which the kit draws as its own dash.
 */
export function meterReading(value: number, max: number, words: FormatWords, format: FormatSpec = "percent", locale = "en-US"): MeterReading {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return { kind: "unavailable" };
  return isPercent(format) ? { kind: "share", value: fmt(format, value / max, words, locale) } : { kind: "of", value: fmt(format, value, words, locale), max: fmt(format, max, words, locale) };
}
