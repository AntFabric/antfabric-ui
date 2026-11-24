/**
 * What a Table decides, the same on both kits: how a column is read (its cell type, its alignment, whether it sorts), how rows are
 * ordered and paged, which columns the phone's card per row keeps, and the numbers behind a pager. The kits draw it; none of it is
 * about drawing. A column is plain data (no function is needed), so the docs can write one down and `chartTable` can make one.
 */

import { fmt, whenOf, type FormatSpec, type FormatWords } from "./format";
import type { MeterKind } from "./meter";
import type { Row } from "./types";

/** What a cell draws: text and the number kinds are text; the rest are kit components (`delta` a Delta, `badge` and `tag` a Tag, `avatar` an Avatar, `sparkline` a Sparkline, `progress` a compact Meter). */
export type CellType = "text" | "number" | "currency" | "percent" | "date" | "delta" | "badge" | "tag" | "avatar" | "sparkline" | "progress";

export const CELL_TYPES: readonly CellType[] = ["text", "number", "currency", "percent", "date", "delta", "badge", "tag", "avatar", "sparkline", "progress"];

/** The hues a badge can take: a Tag's tones. */
export type CellTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

/**
 * A column of a Table. Every field but `key` and `label` is optional, and none is a function, so a column can be written in the docs and
 * sent over the wire. `chartTable`'s columns are columns of this shape.
 */
export interface TableColumn {
  /** The field of each row this column reads. */
  key: string;
  /** The header, and the line's label on the phone. */
  label: string;
  /** What the cell draws. Default `text`. */
  cell?: CellType;
  /** Default `end` for the number kinds (`number`, `currency`, `percent`, `delta`, `date`), `start` for the rest. */
  align?: "start" | "end";
  /** A format name, its options or a function: what core's `fmt` takes. Each number kind has its own default. */
  format?: FormatSpec;
  /** The phone's card keeps the lowest first: 1 is the card's title. A column with none is left off the card (unless no column has one). */
  priority?: number;
  /** Default true, except for `sparkline`. */
  sortable?: boolean;
  /** For a column whose values sort by a rank, not alphabetically: `{ "At risk": 0, Watch: 1, Healthy: 2 }`. A value not in the map sorts last. */
  rank?: Record<string, number>;
  /** `badge`: the hue of each value (`{ Healthy: "success" }`); a value not in the map is neutral. */
  tones?: Record<string, CellTone>;
  /** `delta`: down is good, so the colours swap. */
  inverse?: boolean;
  /** `progress`: `score` (fine while high, the default) or `usage` (fine while low). */
  kind?: MeterKind;
  /** Web and desktop: the column's width in px. Left out, a column is as wide as its widest cell. */
  width?: number;
  /** Web and desktop: the most px a cell is wide. Longer text is cut with an ellipsis and its full text is the cell's `title`; set `wrap` to let it run onto more lines instead. */
  maxWidth?: number;
  /** Web and desktop: let a long value wrap onto more lines (inside `maxWidth`) instead of being cut. */
  wrap?: boolean;
  /** Web and desktop: the column that names the row, drawn stronger than the rest (`fg.strong` at medium weight, the `emphasis` part). On the phone the row's name is already its card's title. */
  emphasis?: boolean;
}

export type SortDirection = "asc" | "desc";

/** The column a table is ordered by, and which way; `null` is the order the rows came in. */
export interface TableSort {
  column: string;
  direction: SortDirection;
}

export const cellOf = (c: TableColumn): CellType => c.cell ?? "text";

const NUMERIC: ReadonlySet<CellType> = new Set(["number", "currency", "percent", "delta", "date"]);

export const alignOf = (c: TableColumn): "start" | "end" => c.align ?? (NUMERIC.has(cellOf(c)) ? "end" : "start");

export const isSortable = (c: TableColumn): boolean => c.sortable ?? cellOf(c) !== "sparkline";

/** Numbers, dates and shares are read biggest first: the first press on one of them sorts descending. */
const FIRST_DESC: ReadonlySet<CellType> = new Set([...NUMERIC, "progress"]);

/** The direction a column's first press sorts in. */
export const firstDirection = (c: TableColumn): SortDirection => (FIRST_DESC.has(cellOf(c)) ? "desc" : "asc");

/**
 * What a press on a column's header does: the first press sorts (biggest first for a number or a date, A to Z for the rest), the second
 * reverses it, the third puts the rows back in the order they came in.
 */
export function nextSort(c: TableColumn, sort: TableSort | null | undefined): TableSort | null {
  const first = firstDirection(c);
  if (!sort || sort.column !== c.key) return { column: c.key, direction: first };
  return sort.direction === first ? { column: c.key, direction: first === "asc" ? "desc" : "asc" } : null;
}

/** `aria-sort`'s word for a column. */
export const ariaSort = (c: TableColumn, sort: TableSort | null | undefined): "ascending" | "descending" | "none" => (sort?.column === c.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none");

/** What a row is ordered by in a column: its rank, its timestamp, its number or its text. */
function sortKey(c: TableColumn, row: Row): number | string | null {
  const v = row[c.key];
  if (v == null) return null;
  if (c.rank) return typeof v === "string" && v in c.rank ? c.rank[v]! : null;
  const w = cellOf(c) === "date" ? whenOf(v) : Array.isArray(v) ? v[v.length - 1] : v;
  if (w instanceof Date) return w.valueOf();
  if (typeof w === "number") return Number.isNaN(w) ? null : w;
  return w == null ? null : String(w);
}

const collators = new Map<string, Intl.Collator>();

/** The collator of a locale (numbers inside text sort as numbers, case and accents are not a difference of order), made once. */
function collatorOf(locale: string): Intl.Collator {
  let c = collators.get(locale);
  if (!c) {
    c = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
    collators.set(locale, c);
  }
  return c;
}

const compare = (a: number | string, b: number | string, collator: Intl.Collator) => (typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a), String(b)));

/**
 * The rows in the order of `sort`; the rows' own order for `null` or a column that is not there. A missing value sorts last whichever way it goes.
 * Text sorts by `locale`'s own alphabet (ä after a in German, å after z in Swedish).
 */
export function sortRows<R extends Row>(rows: readonly R[], columns: readonly TableColumn[], sort: TableSort | null | undefined, locale = "en-US"): R[] {
  const c = sort ? columns.find((x) => x.key === sort.column) : undefined;
  if (!sort || !c) return [...rows];
  const sign = sort.direction === "desc" ? -1 : 1;
  const collator = collatorOf(locale);
  const keyed = rows.map((row, i) => ({ row, i, key: sortKey(c, row) }));
  keyed.sort((a, b) => (a.key === null ? (b.key === null ? 0 : 1) : b.key === null ? -1 : sign * compare(a.key, b.key, collator)) || a.i - b.i);
  return keyed.map((k) => k.row);
}

/* ---------- paging ---------- */

/** How many pages `total` rows make at `pageSize` a page (at least one); `pageSize` 0 is every row on one page. */
export const pageCountOf = (total: number, pageSize: number): number => (pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1);

/** A page (counted from 1) inside 1 to `count`. */
export const clampPage = (page: number, count: number): number => Math.min(Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)), Math.max(1, count));

/** The first and last row number a page shows, counted from 1: page 2 of 5 a page, 12 rows, is 6 to 10. */
export function pageRange(page: number, pageSize: number, total: number): { from: number; to: number } {
  if (total <= 0) return { from: 0, to: 0 };
  if (pageSize <= 0) return { from: 1, to: total };
  return { from: (page - 1) * pageSize + 1, to: Math.min(total, page * pageSize) };
}

export type PageSlot = number | "gap";

/** The page buttons a pager draws: every page up to seven, then the first, the last and the neighbours of the current one with a gap where pages are left out. Always seven slots, so the pager never changes width as you page. */
export function pageSlots(page: number, count: number): PageSlot[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "gap", count];
  if (page >= count - 3) return [1, "gap", count - 4, count - 3, count - 2, count - 1, count];
  return [1, "gap", page - 1, page, page + 1, "gap", count];
}

/* ---------- selection ---------- */

/**
 * The id of each row of `shown`, as text: its `rowKey` field, or, for a row without one, its index in `rows` (the order the rows came in, so a row
 * keeps its id when the table is sorted or paged). Without the index every such row would be `"undefined"`, and ticking one would tick them all.
 */
export function rowIds(shown: readonly Row[], rows: readonly Row[], rowKey: string): string[] {
  const index = new Map(rows.map((row, i) => [row, i]));
  // A row's own key wins; the index of a keyless row takes a `#` until it is no row's own key, so ticking one never ticks another.
  const own = new Set(rows.filter((row) => row[rowKey] != null).map((row) => String(row[rowKey])));
  const spare = (i: number) => {
    let id = String(i);
    while (own.has(id)) id = `#${id}`;
    return id;
  };
  return shown.map((row, i) => (row[rowKey] != null ? String(row[rowKey]) : spare(index.get(row) ?? i)));
}

/** The ids of a page with all of them ticked, some of them, or none. */
export function pickState(ids: readonly string[], selected: readonly string[]): { all: boolean; some: boolean } {
  const on = ids.filter((id) => selected.includes(id)).length;
  return { all: ids.length > 0 && on === ids.length, some: on > 0 && on < ids.length };
}

/** The selection after the header's box is pressed: every row of the page ticked, or, when they all were, none of them. Other pages' rows are kept. */
export function togglePage(ids: readonly string[], selected: readonly string[]): string[] {
  return pickState(ids, selected).all ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])];
}

/** The selection after one row's box is pressed. */
export const toggleRow = (id: string, selected: readonly string[]): string[] => (selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

/* ---------- the phone's card per row ---------- */

/** How a narrow table is drawn: one card per row, the first column its title, a badge beside it and the next few as label and value lines. */
export interface CardLayout {
  title: TableColumn;
  badge: TableColumn | null;
  lines: TableColumn[];
  /** The columns the card does not show: the title, the badge and the lines are the card, these are the details behind it. */
  hidden: TableColumn[];
}

/**
 * The columns by `priority`, lowest first: the first is the card's title, and the next three are the card's content, a `badge` column
 * among them sitting beside the title and the others as label and value lines. A column with no priority is not on the card; when none
 * has one, the columns' own order is the priority.
 */
export function cardLayout(columns: readonly TableColumn[]): CardLayout | null {
  if (columns.length === 0) return null;
  const withPriority = columns.filter((c) => c.priority !== undefined);
  const ranked = withPriority.length ? [...withPriority].sort((a, b) => a.priority! - b.priority!) : [...columns];
  const [title, ...rest] = ranked;
  const kept = rest.slice(0, 3);
  const badge = kept.find((c) => cellOf(c) === "badge") ?? null;
  const shown = new Set<TableColumn>([title!, ...kept]);
  return { title: title!, badge, lines: kept.filter((c) => c !== badge), hidden: columns.filter((c) => !shown.has(c)) };
}

/* ---------- cells ---------- */

const DEFAULT_FORMAT: Partial<Record<CellType, FormatSpec>> = { number: "integer", currency: { type: "currency" }, percent: "percent", date: "date", delta: { type: "percent", sign: true } };

/** A value is missing when it is not there, an empty string, or a number that is not one: a cell draws the kit's dash (`unavailable`) instead of a Tag or an Avatar with nothing in it. */
export const isBlank = (v: unknown): boolean => v == null || v === "" || (typeof v === "number" && Number.isNaN(v));

/** A currency format that names no currency of its own takes `currency`. */
function withCurrency(spec: FormatSpec | undefined, currency: string | undefined): FormatSpec | undefined {
  if (!currency) return spec;
  if (spec === "currency") return { type: "currency", currency };
  if (spec && typeof spec === "object" && spec.type === "currency" && spec.currency === undefined) return { ...spec, currency };
  return spec;
}

/**
 * A cell's text as its column formats it: what a screen reader hears for a Delta, and what a `text`, number or date cell draws. A value that is
 * missing is `words.unavailable`, the kit's dash. Numbers and dates are written in `locale`; a currency column with no currency of its own uses `currency`.
 */
export function cellText(c: TableColumn, value: unknown, words: FormatWords, locale = "en-US", currency?: string): string {
  if (isBlank(value)) return words.unavailable;
  const type = cellOf(c);
  const spec = withCurrency(c.format ?? DEFAULT_FORMAT[type], currency);
  // The date formats read the value themselves (a date-only string stays a calendar day); a function is handed the timestamp.
  return fmt(spec, type === "date" && typeof spec === "function" ? whenOf(value) : value, words, locale);
}

/** A sparkline cell's points as the rows a Sparkline takes, in a field named `v`. A value that is not a list is no points. */
export const sparkRows = (value: unknown): Row[] => (Array.isArray(value) ? value.map((v, i) => ({ i, v })) : []);

/** A falling trend (the last point below the first) is drawn in the loss colour; any other in the first series colour. */
export function trendTone(value: unknown): "default" | "negative" {
  const points = Array.isArray(value) ? value.filter((v): v is number => typeof v === "number" && Number.isFinite(v)) : [];
  return points.length > 1 && points[points.length - 1]! < points[0]! ? "negative" : "default";
}

/** The kit's Avatar identities a person's name is spread over, so one person keeps one colour wherever they appear. */
const IDENTITIES = ["indigo", "green", "ochre", "red", "ink"] as const;

export function identityOf(name: string): (typeof IDENTITIES)[number] {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return IDENTITIES[h % IDENTITIES.length]!;
}
