/** Rows as both chart libraries take them. */

import { fmt, FORMATS, type FormatSpec, type FormatWords } from "./format";
import type { Row } from "./types";

export type PreparedRow = Row & {
  /** The category as text, formatted. */
  __x: string;
  /** The row's place in the data. */
  __i: number;
};

const DATE_FORMATS = new Set(["month", "day", "date"]);
/** A format that prints a date: a timestamp under it is a point in time, so the rows run in order. */
const isDateFormat = (spec: FormatSpec | undefined): boolean => !!spec && typeof spec !== "function" && DATE_FORMATS.has(typeof spec === "string" ? spec : spec.type);

/**
 * The category as a ready-formatted string under `__x`, and the row's index under `__i`. `keys` are the categories in order;
 * `ordered` is true when they are dates (a `Date`, or a timestamp under a date format: plain data, so it can be written down and sent as JSON), which a summary reads as a trend.
 */
export function prepare(data: Row[], x: string, words: FormatWords, xFormat?: FormatSpec, locale = "en-US"): { rows: PreparedRow[]; keys: string[]; ordered: boolean } {
  const xf = (v: unknown) => (xFormat ? fmt(xFormat, v, words, locale) : v instanceof Date ? FORMATS.month(v, { type: "month" }, locale, words) : String(v));
  const rows = data.map((r, i) => ({ ...r, __x: xf(r[x]), __i: i }));
  const first = data[0]?.[x];
  return { rows, keys: rows.map((r) => r.__x), ordered: first instanceof Date || (typeof first === "number" && isDateFormat(xFormat)) };
}
