/**
 * What PeriodCompare, MetricTabs, GoalRings and Breakdown of both kits work out the same way before they draw: the totals of two periods and how
 * far one is from the other, a metric's total, the goals of a set of nested rings and where a point is among them, and the sentences a screen reader
 * hears. The segments of a Breakdown are DonutChart's (`segmentsOf` in `rings.ts`). No third-party code.
 */

import { fmt, type FormatSpec, type FormatWords } from "./format";
import { keysOf } from "./rings";
import type { Row } from "./types";

/** The sum of a field over the rows. A value that is not a number counts as 0. */
export const sumOf = (data: Row[], field: string): number => data.reduce((s, r) => s + (Number.isFinite(+(r[field] as number)) ? +(r[field] as number) : 0), 0);

export interface Comparison {
  current: number;
  previous: number;
  /** How far this period is from the last, as a fraction of the last (`0.165` is up 16.5%). NaN while the last period is nothing: there is no share to say it against. */
  change: number;
}

/** This period's total against the last one's. A last period of 0 has no change to say (NaN), which Delta prints as "Change unavailable" and not as 0%. */
export function compareTotals(data: Row[], current: string, previous: string): Comparison {
  const cur = sumOf(data, current);
  const prev = sumOf(data, previous);
  return { current: cur, previous: prev, change: prev === 0 ? NaN : (cur - prev) / Math.abs(prev) };
}

/** The phrases PeriodCompare's summary is built from, in the chart's own words (see `SummaryWords`). */
export interface CompareWords {
  /** The chart has no rows. */
  noData(v: { title: string }): string;
  /** A period has no values. */
  noValues(v: { name: string }): string;
  /** A period's best and worst point. */
  extremes(v: { name: string; high: string; highValue: string; low: string; lowValue: string }): string;
  /** Added after the two totals when this period is as much as the last. */
  same(): string;
  /** Added after the two totals when this period is more: by how much, as a share of the last. */
  up(v: { value: string }): string;
  /** Added after the two totals when this period is less. */
  down(v: { value: string }): string;
  /** Between one period's extremes and the next. */
  separator(): string;
  /** The whole sentence: the two totals with their names, the change (or nothing) and each period's extremes. */
  summary(v: { label: string; current: string; currentValue: string; previous: string; previousValue: string; change: string; extremes: string }): string;
}

/**
 * PeriodCompare's sentence, in the chart's words: the two totals and the change, then each period's best and worst point.
 * `Tickets resolved: This week 413 against Last week 371, up 11.3%. This week: highest Thu (75), lowest Sun (34); Last week: highest Wed (66), lowest Sun (31).`
 */
export function summarizeCompare({ label, data, keys, fields, labels = {}, format, formatWords, locale }: { label: string; data: Row[]; keys: string[]; fields: [string, string]; labels?: Record<string, string>; format?: FormatSpec; formatWords: FormatWords; locale?: string }, words: CompareWords): string {
  if (!data.length) return words.noData({ title: label });
  const f = (v: unknown) => fmt(format, v, formatWords, locale);
  const [cur, prev] = [sumOf(data, fields[0]), sumOf(data, fields[1])];
  const name = (field: string) => labels[field] ?? field;
  const change = prev === 0 ? "" : cur === prev ? words.same() : (cur > prev ? words.up : words.down)({ value: fmt("percent", Math.abs(cur - prev) / Math.abs(prev), formatWords, locale) });
  const extremes = fields.map((field) => {
    const pts = data.map((r, i) => [i, +(r[field] as number)] as const).filter(([, v]) => Number.isFinite(v));
    if (!pts.length) return words.noValues({ name: name(field) });
    const hi = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
    const lo = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
    return words.extremes({ name: name(field), high: keys[hi[0]]!, highValue: f(hi[1]), low: keys[lo[0]]!, lowValue: f(lo[1]) });
  });
  return words.summary({ label, current: name(fields[0]), currentValue: f(cur), previous: name(fields[1]), previousValue: f(prev), change, extremes: extremes.join(words.separator()) });
}

/* ---------- MetricTabs ---------- */

export interface Metric {
  /** The field of each row that holds the metric. */
  field: string;
  /** The tab's name. */
  label: string;
  /** The metric's format: its total, the axis, the tooltip and its column of the table. Left out, the chart's. */
  format?: FormatSpec;
  /** The number the tab shows when it is not the sum of the field (a rate, an average). */
  total?: number;
}

/** The number a tab leads with: the metric's own `total`, else the sum of its field over the rows. */
export const metricTotal = (data: Row[], m: Metric): number => (m.total !== undefined ? m.total : sumOf(data, m.field));

/** The tab after `from` (`step` 1) or before it (`-1`), wrapping: what the arrow keys do. `Home` and `End` are the first and the last. */
export const tabAfter = (from: number, step: number, count: number): number => (count < 1 ? 0 : (((from + step) % count) + count) % count);

/** The data key the chosen metric is always drawn under, so switching tabs moves the same bars to new heights and does not draw new ones from zero. */
export const METRIC_KEY = "__metric";

/* ---------- GoalRings ---------- */

/** The most rings GoalRings nests: a fourth band would be too thin to read. */
export const MOST_GOALS = 3;

export interface Goal {
  /** What names the goal in `selected` (and a React key): its label, or `label#2` for the second of the same name (`keysOf`). */
  key: string;
  label: string;
  done: number;
  target: number;
  /** The target is a number above zero, so there is a share to say. Otherwise the ring is its empty track and the list says no goal is set. */
  known: boolean;
  /** What is done over the target, as it is: 1.16 is 116%. 0 while the goal is not known. */
  share: number;
  /** The same, held between 0 and 1: how much of the ring is filled. */
  ratio: number;
  /** What is left: the target less what is done, never under 0. */
  left: number;
  /** The goal is reached or passed. */
  met: boolean;
}

/** The rows of GoalRings as goals, in order: up to three. A value or target that is not a number counts as 0; a target of 0 is no goal. */
export function goalsOf(data: Row[], label: string, value: string, goal: string, most: number = MOST_GOALS): Goal[] {
  const rows = data.slice(0, most);
  const keys = keysOf(rows.map((r) => String(r[label] ?? "–")));
  return rows.map((r, i) => {
    const done = Number.isFinite(+(r[value] as number)) ? +(r[value] as number) : 0;
    const target = Number.isFinite(+(r[goal] as number)) ? +(r[goal] as number) : 0;
    const known = target > 0;
    const share = known ? done / target : 0;
    return { key: keys[i]!, label: String(r[label] ?? "–"), done, target, known, share, ratio: Math.min(1, Math.max(0, share)), left: Math.max(0, target - done), met: known && done >= target };
  });
}

/** How far along all the goals are: the mean of their rings' fill, so a goal that is passed counts as whole and cannot make up for one that is not. 0 for none. */
export const overallOf = (goals: readonly Goal[]): number => (goals.length ? goals.reduce((s, g) => s + g.ratio, 0) / goals.length : 0);

export interface RingBand {
  outer: number;
  inner: number;
}

/** The bands of `count` nested rings in a square `size` wide: the first is the outermost, each `width` thick with `gap` between it and the next. */
export function ringBands(size: number, width: number, gap: number, count: number): RingBand[] {
  return Array.from({ length: count }, (_, k) => {
    const outer = size / 2 - k * (width + gap);
    return { outer, inner: outer - width };
  });
}

/** Which of the nested rings a point is on, or -1: `x`, `y` are measured from the square's top left. A point on the gap between bands is on none. */
export function ringAt(x: number, y: number, size: number, bands: readonly RingBand[]): number {
  const r = Math.hypot(x - size / 2, y - size / 2);
  return bands.findIndex((b) => r >= b.inner && r <= b.outer);
}

/** The phrases GoalRings' summary is built from, in the chart's own words (see `SummaryWords`). */
export interface GoalWords {
  /** There are no goals. */
  noGoals(v: { title: string }): string;
  /** A goal with a target: what is done of it, and the share. */
  goal(v: { label: string; done: string; target: string; share: string }): string;
  /** A goal with no target. */
  noGoal(v: { label: string }): string;
  /** Between one goal's phrase and the next. */
  separator(): string;
  /** The whole sentence: the title, the goals joined and how far along all of them are. */
  summary(v: { label: string; parts: string; overall: string }): string;
}

/** GoalRings' sentence, in the chart's words: each goal, what is done of its target and its share, and the overall share. */
export function summarizeGoals({ label, goals, format, formatWords, locale }: { label: string; goals: readonly Goal[]; format?: FormatSpec; formatWords: FormatWords; locale?: string }, words: GoalWords): string {
  if (!goals.length) return words.noGoals({ title: label });
  const whole = { type: "percent", digits: 0 } as const;
  const parts = goals.map((g) => (g.known ? words.goal({ label: g.label, done: fmt(format, g.done, formatWords, locale), target: fmt(format, g.target, formatWords, locale), share: fmt(whole, g.share, formatWords, locale) }) : words.noGoal({ label: g.label })));
  return words.summary({ label, parts: parts.join(words.separator()), overall: fmt(whole, overallOf(goals), formatWords, locale) });
}
