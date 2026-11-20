/**
 * The formatters every chart, table cell and KPI shares, so an axis, a tooltip and a cell print one value the same way.
 * Numbers and dates go through `Intl` with a `locale` (default `en-US`). The few words a format writes (the dash for a missing value, the unit of
 * points, the minutes and seconds of a duration) are the kit's, passed in as `FormatWords` from its `strings`, so a product can translate them.
 */

/** The named formats. */
export type FormatName = "integer" | "decimal" | "compact" | "percent" | "points" | "currency" | "month" | "day" | "date" | "duration";

/** A format with its options: `{ type: "currency", currency: "EUR", compact: true }`. */
export interface FormatOptions {
  type: FormatName;
  /** `decimal` and `percent`: the most fraction digits shown (default 1). */
  digits?: number;
  /** `decimal`: a suffix, such as `"ms"`. */
  unit?: string;
  /** `percent` shows `+` on a gain (and `-` on a loss); `points` shows its sign unless this is `false`. */
  sign?: boolean;
  /** `currency`: an ISO 4217 code (default `USD`). */
  currency?: string;
  /** `currency`: `$12.4K` rather than `$12,400`. */
  compact?: boolean;
  /** `month`, `day` and `date`: an IANA zone such as `"UTC"` (default the viewer's own). */
  timeZone?: string;
}

/**
 * The words a format writes, in the component's own strings (see `SummaryWords`): `unavailable` stands for a value that is not there, `points` is
 * the share-point change (`value` is the number with its sign, `+3.1`) and `duration` the length of time (`minutes`, and `seconds` padded to two digits).
 */
export interface FormatWords {
  unavailable: string;
  points(v: { value: string }): string;
  duration(v: { minutes: string; seconds: string }): string;
}

/**
 * English, the same as the kit's `common` strings (`unavailable`, `formatPoints`, `formatDuration`): what `fmt` writes when it is given no
 * words. The kit's components always pass their own, from their `strings`; this default is for a product calling `fmt` directly.
 */
export const englishFormatWords: FormatWords = {
  unavailable: "\u2013",
  points: ({ value }) => `${value} pts`,
  duration: ({ minutes, seconds }) => `${minutes}m ${seconds}s`,
};

/** A format is a name (`"percent"`), its options, or a function that formats the value itself. */
export type FormatSpec = FormatName | FormatOptions | ((value: any) => string);

const nf = (locale: string, o: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, o);
const df = (locale: string, o: Intl.DateTimeFormatOptions, timeZone?: string) => new Intl.DateTimeFormat(locale, { ...o, timeZone });

/** A value that is a date, or a timestamp, as `Intl` takes it. */
type When = Date | number;

/** What each name prints. Each takes the value, its options and the locale. */
export const FORMATS: Record<FormatName, (v: any, o: FormatOptions, locale: string, words: FormatWords) => string> = {
  integer: (v: number, _, l) => nf(l, { maximumFractionDigits: 0 }).format(v),
  decimal: (v: number, o, l) => nf(l, { maximumFractionDigits: o.digits ?? 1 }).format(v) + (o.unit ?? ""),
  compact: (v: number, _, l) => nf(l, { notation: "compact", maximumFractionDigits: 1 }).format(v),
  percent: (v: number, o, l) => nf(l, { style: "percent", maximumFractionDigits: o.digits ?? 1, signDisplay: o.sign ? "exceptZero" : "auto" }).format(v),
  points: (v: number, o, l, w) => w.points({ value: `${o.sign === false ? "" : v > 0 ? "+" : v < 0 ? "-" : ""}${nf(l, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(v * 100))}` }),
  currency: (v: number, o, l) => nf(l, { style: "currency", currency: o.currency ?? "USD", notation: o.compact ? "compact" : "standard", maximumFractionDigits: o.compact ? 1 : 0 }).format(v),
  month: (v: When, o, l) => df(l, { month: "short" }, o.timeZone).format(v),
  day: (v: When, o, l) => df(l, { month: "short", day: "numeric" }, o.timeZone).format(v),
  date: (v: When, o, l) => df(l, { month: "short", day: "numeric", year: "numeric" }, o.timeZone).format(v),
  // Rounded to the second first, so 59.6 is 1m 00s and not 0m 60s.
  duration: (v: number, _, __, w) => w.duration({ minutes: String(Math.floor(Math.round(v) / 60)), seconds: String(Math.round(v) % 60).padStart(2, "0") }),
};

/** `fmt("percent", 0.124, words)` is `"12.4%"`. A missing or `NaN` value is `words.unavailable`; no spec prints a date as a date and anything else as text. */
export function fmt(spec: FormatSpec | undefined, value: unknown, words: FormatWords = englishFormatWords, locale = "en-US"): string {
  if (value == null || (typeof value === "number" && Number.isNaN(value))) return words.unavailable;
  if (!spec) return value instanceof Date ? FORMATS.date(value, { type: "date" }, locale, words) : String(value);
  if (typeof spec === "function") return spec(value);
  const o = typeof spec === "string" ? { type: spec } : spec;
  return FORMATS[o.type](value, o, locale, words);
}

/** The same format without a `+` or `-`: what a Delta prints beside its arrow. */
export const withoutSign = (spec: FormatSpec | undefined): FormatSpec | undefined => (typeof spec === "string" ? { type: spec, sign: false } : typeof spec === "object" ? { ...spec, sign: false } : spec);
