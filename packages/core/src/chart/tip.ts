/** What a tooltip lists for one row. Platform-free: each kit draws the card, and passes the colours in. */

import { fmt, type FormatSpec, type FormatWords } from "./format";
import type { Row } from "./types";

export interface TipInput {
  /** The series showing, in order. */
  fields: string[];
  labels: Record<string, string>;
  /** A series' colour. */
  colorOf: (field: string) => string;
  format?: FormatSpec;
  /** The words the format writes: the chart's own strings. */
  formatWords: FormatWords;
  /** Add a total row: the series stack. */
  stacked?: boolean;
  /** Colour each row by its sign instead of its series (a bar chart that shows gains and losses). */
  signColors?: { positive: string; negative: string };
  locale?: string;
}

export interface Tip {
  title: string;
  rows: { key: string; label: string; value: string; color: string }[];
  /** The stack's total, formatted; null when the series do not stack. */
  total: string | null;
}

/** The title is the row's `__x` (see `prepare`). */
export function tipRows(row: Row, { fields, labels, colorOf, format, formatWords, stacked, signColors, locale }: TipInput): Tip {
  const rows = fields.map((f) => ({ key: f, label: labels[f] ?? f, value: fmt(format, row[f], formatWords, locale), color: signColors ? ((row[f] as number) < 0 ? signColors.negative : signColors.positive) : colorOf(f) }));
  const total = stacked && fields.length > 1 ? fmt(format, fields.reduce((s, f) => s + (+(row[f] as number) || 0), 0), formatWords, locale) : null;
  return { title: row.__x as string, rows, total };
}
