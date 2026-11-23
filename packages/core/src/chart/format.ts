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
  /** `decimal` and `percent`: the most fraction digits shown (default 1). `currency`: the same, default 0 (`2` prints cents); a compact currency always shows one. */
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

/**
 * Whether this engine's `Intl.NumberFormat` takes `signDisplay` and `notation: "compact"`. Hermes (React Native) may not, and an option it does
 * not know is dropped or throws, so a signed percent would lose its `+` and a compact figure print in full. Probed once, on the first format that needs it.
 */
let support: { sign: boolean; compact: boolean } | null = null;
const probe = (f: () => boolean) => {
  try {
    return f();
  } catch {
    return false;
  }
};
const intlSupport = () =>
  (support ??= {
    sign: probe(() => nf("en-US", { signDisplay: "exceptZero" }).format(1) === "+1"),
    compact: probe(() => nf("en-US", { notation: "compact" }).format(1200) === "1.2K"),
  });

/** `signDisplay: "exceptZero"` by hand, for an engine without it: `+` on a gain, the format's own minus on a loss, nothing on what rounds to zero. */
export function exceptZero(f: Intl.NumberFormat, v: number): string {
  const abs = f.format(Math.abs(v));
  if (abs === f.format(0)) return abs;
  return v < 0 ? f.format(v) : `+${abs}`;
}

/** The steps a compact figure is written in, largest first, for an engine without `notation: "compact"`. */
const COMPACT_STEPS: readonly [number, string][] = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
  [1, ""],
];

/**
 * `notation: "compact"` by hand, for an engine without it: the value over the largest step it reaches, through `f` (a format of at most one fraction
 * digit), with the step's letter after it; a figure that rounds up to a thousand of its step is one of the next (999,950 is `1M`, not `1000K`). The
 * letters are English, as `Intl` writes `en`.
 */
export function shortNumber(f: Intl.NumberFormat, v: number): string {
  const a = Math.abs(v);
  const last = COMPACT_STEPS.length - 1;
  for (let i = 0; i <= last; i++) {
    const [n] = COMPACT_STEPS[i]!;
    if (a < n && i < last) continue;
    const [by, letter] = COMPACT_STEPS[i > 0 && Math.round((a / n) * 10) >= 10000 ? i - 1 : i]!;
    return `${f.format(v / by)}${letter}`;
  }
  return f.format(v);
}

/** `"2026-03-01"`: a calendar day, with no time and no zone. */
const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A date written as a Date, a timestamp or a string, as the number `Intl` takes; `undefined` for a string or a Date that is not a date. A full ISO
 * date-time is the instant it names. A date-only string (`"2026-03-01"`) is UTC midnight, as `Date.parse` reads it, and the date formats print it
 * in UTC, so it is its own day in every zone, on the server and in the browser alike.
 */
export function whenOf(value: unknown): unknown {
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? undefined : value;
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? undefined : ms;
  }
  return value;
}

/** A date format: the value goes through `whenOf`, and what is not a date prints `words.unavailable` (`Intl` would throw). */
const dateFormat = (shape: Intl.DateTimeFormatOptions) => (v: unknown, o: FormatOptions, l: string, w: FormatWords) => {
  const when = whenOf(v);
  const d = when instanceof Date ? when : typeof when === "number" ? new Date(when) : null;
  if (!d || Number.isNaN(d.valueOf())) return w.unavailable;
  return df(l, shape, typeof v === "string" && DAY_ONLY.test(v) ? "UTC" : o.timeZone).format(d);
};

const DATE_FORMATS: ReadonlySet<FormatName> = new Set(["month", "day", "date"]);

/** Text a number format can read: `"12.5"` is, `"abc"` and `""` are not. */
const numeric = (s: string) => s.trim() !== "" && !Number.isNaN(Number(s));

/** What each name prints. Each takes the value, its options and the locale. */
export const FORMATS: Record<FormatName, (v: any, o: FormatOptions, locale: string, words: FormatWords) => string> = {
  integer: (v: number, _, l) => nf(l, { maximumFractionDigits: 0 }).format(v),
  decimal: (v: number, o, l) => nf(l, { maximumFractionDigits: o.digits ?? 1 }).format(v) + (o.unit ?? ""),
  compact: (v: number, _, l) => (intlSupport().compact ? nf(l, { notation: "compact", maximumFractionDigits: 1 }).format(v) : shortNumber(nf(l, { maximumFractionDigits: 1 }), v)),
  percent: (v: number, o, l) => {
    const digits = o.digits ?? 1;
    if (!o.sign) return nf(l, { style: "percent", maximumFractionDigits: digits }).format(v);
    return intlSupport().sign ? nf(l, { style: "percent", maximumFractionDigits: digits, signDisplay: "exceptZero" }).format(v) : exceptZero(nf(l, { style: "percent", maximumFractionDigits: digits }), v);
  },
  // The sign is the rounded number's, so -0.0001 is 0.0 pts and not -0.0 pts. Worked out from the rounded figure itself, so no `Intl` sign option is needed.
  points: (v: number, o, l, w) => {
    const abs = nf(l, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const figure = abs.format(Math.abs(v * 100));
    const sign = o.sign === false || figure === abs.format(0) ? "" : v < 0 ? "-" : "+";
    return w.points({ value: `${sign}${figure}` });
  },
  currency: (v: number, o, l) => {
    const money = { style: "currency", currency: o.currency ?? "USD" } as const;
    if (!o.compact) return nf(l, { ...money, maximumFractionDigits: o.digits ?? 0 }).format(v);
    return intlSupport().compact ? nf(l, { ...money, notation: "compact", maximumFractionDigits: 1 }).format(v) : shortNumber(nf(l, { ...money, maximumFractionDigits: 1 }), v);
  },
  month: dateFormat({ month: "short" }),
  day: dateFormat({ month: "short", day: "numeric" }),
  date: dateFormat({ month: "short", day: "numeric", year: "numeric" }),
  // Rounded to the second first, so 59.6 is 1m 00s and not 0m 60s; a negative length is signed once, on the minutes (-2m 30s).
  duration: (v: number, _, __, w) => {
    const s = Math.round(Math.abs(v));
    return w.duration({ minutes: `${v < 0 && s > 0 ? "-" : ""}${Math.floor(s / 60)}`, seconds: String(s % 60).padStart(2, "0") });
  },
};

/**
 * `fmt("percent", 0.124, words)` is `"12.4%"`. A missing or `NaN` value is `words.unavailable`, and so is text a number format cannot read or a
 * date format cannot parse; no spec prints a date as a date and anything else as text.
 */
export function fmt(spec: FormatSpec | undefined, value: unknown, words: FormatWords = englishFormatWords, locale = "en-US"): string {
  if (value == null || (typeof value === "number" && Number.isNaN(value))) return words.unavailable;
  if (!spec) return value instanceof Date ? FORMATS.date(value, { type: "date" }, locale, words) : String(value);
  if (typeof spec === "function") return spec(value);
  const o = typeof spec === "string" ? { type: spec } : spec;
  if (typeof value === "string" && !DATE_FORMATS.has(o.type) && !numeric(value)) return words.unavailable;
  return FORMATS[o.type](value, o, locale, words);
}

/** The same format without a `+` or `-`: what a Delta prints beside its arrow. */
export const withoutSign = (spec: FormatSpec | undefined): FormatSpec | undefined => (typeof spec === "string" ? { type: spec, sign: false } : typeof spec === "object" ? { ...spec, sign: false } : spec);
