/**
 * What DonutChart, GaugeChart and RadarChart of both kits work out the same way before they hand a library anything: the segments of a
 * donut (and the fold of a long list into "Other"), where a gauge's value and target sit and what colour it is in, the sentences a screen reader
 * hears, and where a pointer on a radar is among its axes. No third-party code.
 */

import { fmt, type FormatSpec, type FormatWords } from "./format";
import { meterTone, type MeterKind, type MeterThresholds } from "./meter";
import type { Row } from "./types";

/** The most segments a donut gives a colour of the palette to: the palette has eight, and a ninth would wrap onto the first. Rows after the eighth fold into one more, which the kit names. */
export const MOST_SEGMENTS = 8;

export interface Segment {
  label: string;
  /** A share of the whole is never negative: a value under zero, or one that is not a number, counts as 0. */
  value: number;
  /** For "Other": how many rows it holds. */
  folded?: number;
}

/**
 * The rows of a donut as its segments, in order. Up to `most` keep their own; any after that are summed into one more, named `other` (the kit's
 * word for it), which the kits draw in a neutral colour (`chart.other`) and not in a colour of the palette. The table behind "View as table" keeps every row.
 */
export function segmentsOf(data: Row[], label: string, value: string, other: string, most: number = MOST_SEGMENTS): Segment[] {
  const all = data.map((r) => ({ label: String(r[label] ?? "–"), value: Number.isFinite(+(r[value] as number)) ? Math.max(0, +(r[value] as number)) : 0 }));
  if (all.length <= most) return all;
  const rest = all.slice(most);
  return [...all.slice(0, most), { label: other, value: rest.reduce((s, r) => s + r.value, 0), folded: rest.length }];
}

/** The sum of some segments' values. */
export const totalOf = (segments: readonly Segment[]): number => segments.reduce((s, x) => s + x.value, 0);

/** A segment's share of the whole, or NaN while the whole is nothing (which `fmt` prints as an en dash). */
export const shareOf = (value: number, total: number): number => (total > 0 ? value / total : NaN);

/**
 * The phrases a donut's or a breakdown's summary is built from, in the chart's own words (see `SummaryWords`): a part is `{label}{more} {value} ({share})`,
 * where `more` is what a folded segment adds about the rows it holds.
 */
export interface SegmentWords {
  /** There are no segments. */
  noData(v: { title: string }): string;
  /** There are segments and every value is zero. */
  allZero(v: { title: string; zero: string }): string;
  /** Added after a folded segment's name: how many rows it holds. */
  more(v: { count: number }): string;
  /** One segment: its name, what it adds about folded rows (or nothing), its value and its share. */
  part(v: { label: string; more: string; value: string; share: string }): string;
  /** Between one segment's phrase and the next. */
  separator(): string;
  /** The whole sentence: the title, the segments joined and the total. */
  summary(v: { label: string; parts: string; total: string }): string;
}

/** Every segment's share of the donut's sentence, in the chart's words: its name, value and share for each, then the total. A whole of nothing says so. */
export function summarizeSegments({ label, segments, format, formatWords, locale }: { label: string; segments: readonly Segment[]; format?: FormatSpec; formatWords: FormatWords; locale?: string }, words: SegmentWords): string {
  if (!segments.length) return words.noData({ title: label });
  const total = totalOf(segments);
  if (total <= 0) return words.allZero({ title: label, zero: fmt(format, 0, formatWords, locale) });
  const parts = segments.map((s) => words.part({ label: s.label, more: s.folded ? words.more({ count: s.folded }) : "", value: fmt(format, s.value, formatWords, locale), share: fmt("percent", shareOf(s.value, total), formatWords, locale) }));
  return words.summary({ label, parts: parts.join(words.separator()), total: fmt(format, total, formatWords, locale) });
}

/**
 * Which segment of a ring a point is on, or -1: the ring is `size` wide and high, cut clockwise from twelve o'clock into pieces as wide as `values`,
 * between `innerRadius` and `outerRadius`. `x`, `y` are measured from its top left. gifted-charts finds a pressed segment from the page's
 * coordinates on the web, which are wrong wherever the chart is not at the page's corner; the phone kit finds it from where the touch landed in the ring.
 */
export function segmentAt(x: number, y: number, size: number, innerRadius: number, outerRadius: number, values: readonly number[]): number {
  const c = size / 2;
  const r = Math.hypot(x - c, y - c);
  const total = values.reduce((s, v) => s + v, 0);
  if (r < innerRadius || r > outerRadius || !(total > 0)) return -1;
  let turn = Math.atan2(x - c, c - y) / (2 * Math.PI);
  if (turn < 0) turn += 1;
  let seen = 0;
  for (let i = 0; i < values.length; i++) {
    seen += values[i]! / total;
    if (turn < seen) return i;
  }
  return values.length - 1;
}

/* ---------- the gauge ---------- */

export interface GaugeInput {
  value: number;
  /** What a full ring is. */
  max: number;
  /** Where the tick sits, in the value's unit. */
  target?: number;
  /** `usage` is worse as it fills; `score` is worse as it empties (Meter's). */
  kind?: MeterKind;
  /** Meter's: the shares of `max` where the fill turns to the caution colour and then the loss colour. */
  thresholds?: MeterThresholds;
}

export interface GaugeState {
  /** The value and the capacity are numbers and the capacity is above zero. Otherwise the gauge has nothing to say. */
  known: boolean;
  /** How much of the half ring the fill takes: the value over `max`, held between 0 and 1. */
  share: number;
  /** The value is past `max`: the ring is full and the number says by how much. */
  over: boolean;
  /** Meter's three states, from the unclamped share. */
  tone: "ok" | "warning" | "danger";
  /** Where the target tick sits, 0 to 1 of the half ring, or null when there is no target. */
  targetShare: number | null;
}

/** What a gauge draws: how full, in which state, where the target is. The thresholds are Meter's (`meterTone`), so a gauge and a meter agree. */
export function gaugeState({ value, max, target, kind = "score", thresholds }: GaugeInput): GaugeState {
  const known = Number.isFinite(value) && Number.isFinite(max) && max > 0;
  const raw = known ? value / max : 0;
  const hasTarget = known && target != null && Number.isFinite(target);
  return {
    known,
    share: Math.min(1, Math.max(0, raw)),
    over: known && raw > 1,
    tone: meterTone(kind, raw, thresholds),
    targetShare: hasTarget ? Math.min(1, Math.max(0, target! / max)) : null,
  };
}

/** The phrases a gauge's summary is built from, in the chart's own words (see `SummaryWords`). */
export interface GaugeWords {
  /** The value or the capacity is not a number. */
  noValue(v: { title: string }): string;
  /** Added after the value when the gauge says what it is of. */
  caption(v: { caption: string }): string;
  /** Added when the value is past the capacity: what it is measured against. */
  over(v: { max: string }): string;
  /** Added when there is a target. */
  target(v: { target: string }): string;
  /** The whole sentence: the title, the value and whichever of the others there are (each as text, or nothing). */
  summary(v: { label: string; value: string; caption: string; over: string; target: string }): string;
}

/** A gauge's sentence, in the chart's words: the value in its format, what it is of, whether it is past the capacity, and the target. */
export function summarizeGauge({ label, value, max, target, caption, format, formatWords, locale }: { label: string; value: number; max: number; target?: number; caption?: string; format?: FormatSpec; formatWords: FormatWords; locale?: string }, words: GaugeWords): string {
  if (!(Number.isFinite(value) && Number.isFinite(max) && max > 0)) return words.noValue({ title: label });
  const f = (v: number) => fmt(format, v, formatWords, locale);
  return words.summary({
    label,
    value: f(value),
    caption: caption ? words.caption({ caption }) : "",
    over: value > max ? words.over({ max: f(max) }) : "",
    target: target != null && Number.isFinite(target) ? words.target({ target: f(target) }) : "",
  });
}

/** The point on a half ring at a share of it (0 at the left end, 1 at the right), `radius` out from the centre: where the target tick's ends are. `cx`, `cy` is the centre, at the bottom of the half. */
export function onHalfRing(share: number, cx: number, cy: number, radius: number): { x: number; y: number } {
  const a = Math.PI * (1 - share);
  return { x: cx + Math.cos(a) * radius, y: cy - Math.sin(a) * radius };
}

/* ---------- the ring's geometry ---------- */

/** A donut's hole, as a share of the ring's outer radius. */
export const DONUT_HOLE = 0.68;
/** A gauge's hole: a thinner band than the donut's. */
export const GAUGE_HOLE = 0.78;
/** The gap between a donut's segments on the web, in degrees (recharts' `paddingAngle`). */
export const SLICE_GAP_DEG = 2.5;
/** The gap between a gauge's fill and its track on the web, in degrees: none while the fill is empty or full. */
export const GAUGE_GAP_DEG = 1.5;

/* ---------- the radar ---------- */

/** A score held to the radar's scale: below 0 is 0 and past `max` is `max`, so a polygon never leaves the outer ring. The tooltip and the table still say the real number. */
export const clampScore = (value: unknown, max: number): number => {
  const n = +(value as number);
  return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0;
};

/**
 * Which of `count` axes a point is nearest to, on a radar drawn with the first axis at `startAngle` (degrees, counter-clockwise from three o'clock,
 * as gifted-charts takes it) and the rest running `clockwise` or not. `x`, `y` are measured from the chart's top left, `size` is its width and height.
 * The phone's radar has no pointer of its own, so the kit finds the axis under a finger with this.
 */
export function nearestAxis(x: number, y: number, size: number, count: number, { startAngle = 90, clockwise = true }: { startAngle?: number; clockwise?: boolean } = {}): number {
  if (count < 1) return 0;
  const c = size / 2;
  const at = (Math.atan2(-(y - c), x - c) * 180) / Math.PI;
  const step = (360 / count) * (clockwise ? -1 : 1);
  let best = 0;
  let gap = Infinity;
  for (let i = 0; i < count; i++) {
    const d = Math.abs((((at - (startAngle + i * step)) % 360) + 540) % 360 - 180);
    if (d < gap) {
      gap = d;
      best = i;
    }
  }
  return best;
}
