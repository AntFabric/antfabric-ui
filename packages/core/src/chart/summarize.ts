/**
 * The sentence a screen reader hears for a chart. Core works out what there is to say (which series rose, where the highest point is); the
 * words are the kit's: each phrase below is a function the chart fills from its `strings`, so a product can translate every one of them.
 */

import { fmt, type FormatSpec, type FormatWords } from "./format";
import type { Row } from "./types";

export interface SummaryInput {
  /** What the chart is called: its title. */
  label: string;
  data: Row[];
  /** Each row's category as text, in order (`prepare`'s `keys`). */
  keys: string[];
  /** The fields read, in order. */
  fields: string[];
  /** A field's name for people (default the field). */
  labels: Record<string, string>;
  format?: FormatSpec;
  /** The words the format writes: the chart's own strings. */
  formatWords: FormatWords;
  /** The categories run in order (time): read as a trend. Otherwise read as highest and lowest. */
  ordered?: boolean;
  locale?: string;
}

/**
 * The phrases a chart's summary is built from, in the chart's own words. Every variable is text already formatted (a value in the chart's
 * format, a category as it is labelled); a phrase comes back as the text and nothing else, so the summary is their concatenation and a
 * translation may reorder what each one says. `separator` is what goes between the series.
 */
export interface SummaryWords {
  /** The chart has no rows. */
  noData(v: { title: string }): string;
  /** A series has no values. */
  noValues(v: { name: string }): string;
  /** A series of categories: where it is highest and lowest. */
  extremes(v: { name: string; high: string; highValue: string; low: string; lowValue: string }): string;
  /** A series of one point. */
  single(v: { name: string; value: string }): string;
  /** A series over time that ended where it began. */
  held(v: { name: string; value: string }): string;
  /** A series over time that went up. */
  rose(v: { name: string; from: string; to: string }): string;
  /** A series over time that went down. */
  fell(v: { name: string; from: string; to: string }): string;
  /** Added after a trend of three points or more: where it peaked. */
  peak(v: { key: string }): string;
  /** Added after the title when the categories run in order: the first and the last. */
  range(v: { from: string; to: string }): string;
  /** Between one series' phrase and the next. */
  separator(): string;
  /** The whole sentence: the title, the range (or nothing) and the series' phrases joined. */
  summary(v: { label: string; range: string; parts: string }): string;
}

const numberOf = (v: unknown): number => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : Number.NaN);

/** Ordered data (time) reads as a trend; categories read as highest and lowest. */
export function summarize({ label, data, keys, fields, labels, format, formatWords, ordered, locale }: SummaryInput, words: SummaryWords): string {
  if (!data.length) return words.noData({ title: label });
  const f = (v: unknown) => fmt(format, v, formatWords, locale);
  const parts = fields.map((field) => {
    const name = labels[field] ?? field;
    // A number, or text that is one ("120"); anything else (a gap, NaN, "n/a") is left out.
    const pts = data.map((r, i) => [i, numberOf(r[field])] as const).filter(([, v]) => Number.isFinite(v));
    if (!pts.length) return words.noValues({ name });
    const max = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
    const min = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
    if (!ordered) return words.extremes({ name, high: keys[max[0]]!, highValue: f(max[1]), low: keys[min[0]]!, lowValue: f(min[1]) });
    const first = pts[0]![1];
    const last = pts[pts.length - 1]![1];
    if (pts.length < 2) return words.single({ name, value: f(last) });
    // From 0 there is no share of a change, only its direction: 0 to -5 fell.
    const change = first === 0 ? Math.sign(last) : (last - first) / Math.abs(first);
    const trend = Math.abs(change) < 0.01 ? words.held({ name, value: f(last) }) : (change > 0 ? words.rose : words.fell)({ name, from: f(first), to: f(last) });
    return `${trend}${pts.length > 2 ? words.peak({ key: keys[max[0]]! }) : ""}`;
  });
  const range = ordered && keys.length > 1 ? words.range({ from: keys[0]!, to: keys[keys.length - 1]! }) : "";
  return words.summary({ label, range, parts: parts.join(words.separator()) });
}
