import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { recipes, useControllable, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import {
  alignOf,
  ariaSort,
  cardLayout,
  cellOf,
  cellText,
  clampPage,
  firstDirection,
  identityOf,
  isBlank,
  isSortable,
  nextSort,
  pageCountOf,
  pickState,
  rowIds,
  sortRows,
  sparkRows,
  togglePage,
  toggleRow,
  trendTone,
  type CardLayout,
  type CellTone,
  type CellType,
  type FormatWords,
  type Row,
  type TableColumn,
  type TableSort,
} from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, neg, pressable, row, text, truncate, visuallyHidden } from "../../lib/style";
import { useChartTokens, type ChartTokens } from "../../data/theme";
import { IconButton } from "../actions/icon-button";
import { Avatar } from "../display/avatar";
import { Tag } from "../display/tag";
import { EmptyState } from "../feedback/empty-state";
import { Skeleton } from "../feedback/skeleton";
import { Checkbox } from "../inputs/checkbox";
import { Select } from "../inputs/select";
import { Delta } from "./delta";
import { Meter } from "./meter";
import { Pagination } from "./pagination";
import { Sparkline } from "./sparkline";

export type { CellTone, CellType, TableColumn, TableSort };

/** What a table does when its own box is too narrow for the grid: scroll it sideways, or draw a card per row. */
export type TableNarrow = "scroll" | "cards";

export interface TableProps extends RootProps<HTMLDivElement> {
  /** One per column, left to right: `{ key: "arr", label: "ARR", cell: "currency" }`. `key` is the field of each row the column reads. */
  columns: TableColumn[];
  /** One object per row. The same rows can feed a chart, a stat and a table. */
  rows: Row[];
  /** The field of each row that names it, for selection and for React's keys. Default `key`; the keys `selected` holds are its values as text. A row without the field is named by its index in `rows`. */
  rowKey?: string;
  /** The column the rows are ordered by and which way, or `null` for the order they came in. */
  sort?: TableSort | null;
  /** Called with the new order when a header is pressed: the first press sorts (biggest first for a number or a date), the second reverses it, the third clears it. */
  onSortChange?: (sort: TableSort | null) => void;
  /** A box before each row to tick it, and one in the header for the rows on the page. */
  selectable?: boolean;
  /** The keys of the ticked rows. Rows on other pages stay ticked. */
  selected?: string[];
  /** Called with the keys ticked after a press. */
  onSelectedChange?: (selected: string[]) => void;
  /** Rows a page, with a Pagination under the table when there are more rows than that. 0 shows every row. */
  pageSize?: number;
  /** How many rows there are in all, when `rows` holds only the page on show (a list the server pages and sorts). The table then draws exactly the rows it is given, never sorts or slices them, and only reports `onSortChange` and `onPageChange`. Left out, `rows` is every row and the table sorts and pages them itself. */
  total?: number;
  /** An ISO 4217 code for the currency columns that name none in their `format` (default USD). */
  currency?: string;
  /** The most px the table is tall: the rows scroll under the sticky header past that. Left out, the table is as tall as its rows. */
  maxHeight?: number;
  /** Draws a cell yourself: called with the column and the row, it returns what goes in the cell. Returning `undefined` keeps the column's own cell. */
  renderCell?: (column: TableColumn, row: Row) => ReactNode;
  /** Draws a row's actions (a menu, a button) in a last column: called with the row. Returning `undefined` or `null` leaves the cell empty. */
  renderActions?: (row: Row) => ReactNode;
  /** A row was pressed: its first cell is a button, and a click on the row elsewhere does the same. Called with the row's key and the row. */
  onRowPress?: (key: string, row: Row) => void;
  /** The page on show, counted from 1. Sorting goes back to page 1. */
  page?: number;
  /** Called with the page (from 1) a press, or a new sort, goes to. */
  onPageChange?: (page: number) => void;
  /** Grey lines in place of the rows, from the kit's Skeleton. */
  loading?: boolean;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Shorter rows: 36px, for a table that is mostly data. */
  dense?: boolean;
  /** When the table's own box is narrower than `table.cardsBelow` (600px): `scroll` keeps the grid and scrolls it sideways, `cards` draws the phone's card per row (the title column, its badge and actions, then a label and value line for each other column) with a sort bar above. Measured on the table's box, not the window. */
  narrow?: TableNarrow;
  /** What the table is: its caption, and the scroll region's accessible name. */
  label: string;
  /** Per-part styles over the theme: `{ root: {…}, scroll: {…}, headCell: {…}, cell: {…}, … }`, one per part the table draws. */
  styles?: PartStyles<"table">;
  /** The built-in text, by key: the empty title, the tick boxes' names, what a screen reader hears for a trend or a meter in a cell, and the blank cell's dash. */
  strings?: Partial<KitStrings["table"]>;
  style?: CSSProperties;
}

/** What each cell type draws, one entry per type. A new type is one entry here and one in the docs. */
interface CellContext {
  r: Record<string, CSSProperties>;
  tk: ChartTokens;
  /** The row's name, for a screen reader: "Northwind Logistics, Seats used". */
  name: string;
  /** The words a format writes: `unavailable` is what a cell with no value says. */
  words: FormatWords;
  /** The locale numbers and dates are written in, and the currency a column with none of its own uses. */
  locale: string;
  currency?: string;
  /** The accessible name of a trend in a cell. */
  trendLabel: (column: string, values: string) => string;
  /** The accessible name of a meter in a cell. */
  progressLabel: (column: string) => string;
}

const CELLS: Record<CellType, (v: unknown, c: TableColumn, row: Row, x: CellContext) => ReactNode> = {
  text: (v, c, _row, x) => cellText(c, v, x.words, x.locale, x.currency),
  number: (v, c, _row, x) => cellText(c, v, x.words, x.locale, x.currency),
  currency: (v, c, _row, x) => cellText(c, v, x.words, x.locale, x.currency),
  percent: (v, c, _row, x) => cellText(c, v, x.words, x.locale, x.currency),
  date: (v, c, _row, x) => cellText(c, v, x.words, x.locale, x.currency),
  delta: (v, c, _row, x) => (typeof v === "number" && Number.isFinite(v) ? <Delta value={v} inverse={c.inverse} format={c.format} size="sm" /> : x.words.unavailable),
  badge: (v, c, _row, x) => (isBlank(v) ? x.words.unavailable : <Tag label={String(v)} tone={c.tones?.[String(v)] ?? "neutral"} size="sm" />),
  tag: (v, _c, _row, x) => (isBlank(v) ? x.words.unavailable : <Tag label={String(v)} size="sm" />),
  avatar: (v, _c, _row, x) =>
    isBlank(v) ? (
      x.words.unavailable
    ) : (
      <span data-af-part="person" style={css(row, x.r.person)}>
        <Avatar name={String(v)} size="xs" identity={identityOf(String(v))} />
        <span data-af-part="personName" title={String(v)} style={css(text, truncate(1), x.r.personName)}>{String(v)}</span>
      </span>
    ),
  // A trend is a list of numbers; its colour says which way it went (the loss colour when the last point is below the first).
  sparkline: (v, c, _row, x) =>
    Array.isArray(v) && v.length ? <Sparkline data={sparkRows(v)} y="v" width={x.tk.table.sparkW} height={x.tk.table.sparkH} area tone={trendTone(v)} label={x.trendLabel(c.label, v.join(", "))} /> : x.words.unavailable,
  progress: (v, c, _row, x) => <Meter value={typeof v === "number" ? v : NaN} kind={c.kind ?? "score"} compact label={x.progressLabel(c.label)} />,
};

/** The layout no token decides; the sizes, the type and the fills are the recipe's. */
const grid: CSSProperties = { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "inherit" };
const cellBox: CSSProperties = { boxSizing: "border-box", whiteSpace: "nowrap", verticalAlign: "middle" };

/**
 * A cell's content, set to its column's side (a Delta or a Tag is a block, so the side is the wrapper's). A column with a `maxWidth` cuts a
 * long text with an ellipsis (or wraps it, with `wrap`) and keeps the whole text as the cell's `title`. A column with `emphasis` draws it as the
 * `emphasis` part: the strong ink at medium weight.
 */
function Content({ column, emphasis, children }: { column: TableColumn; emphasis?: CSSProperties; children: ReactNode }) {
  const end = alignOf(column) === "end";
  const bound = column.maxWidth !== undefined;
  const whole = bound && typeof children === "string" ? children : undefined;
  const cut: CSSProperties = column.wrap ? { overflowWrap: "anywhere" } : { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  return (
    <div data-af-part={emphasis ? "emphasis" : undefined} style={css(row, { justifyContent: end ? "flex-end" : "flex-start" }, end && { fontVariantNumeric: "tabular-nums" }, bound && { maxWidth: column.maxWidth }, emphasis)}>
      {bound && typeof children === "string" ? <span title={whole} style={css({ minWidth: 0 }, cut)}>{children}</span> : children}
    </div>
  );
}

/** The first cell of a pressable row: its text is a button, so the row is reachable by keyboard and named. */
function RowLink({ children, onPress }: { children: ReactNode; onPress: () => void }) {
  const ui = useInteraction();
  return (
    <button type="button" data-af-press onClick={() => onPress()} {...ui.handlers} style={css(pressable, { alignItems: "flex-start", textAlign: "inherit", borderRadius: t.radius.row }, ui.focused && { boxShadow: t.shadow.focus })}>
      {children}
    </button>
  );
}

function SortButton({ column, sort, onPress, styles }: { column: TableColumn; sort: TableSort | null; onPress: () => void; styles?: PartStyles<"table"> }) {
  const ui = useInteraction();
  const on = sort?.column === column.key;
  const r = useRecipe(recipes.table, { state: { hover: ui.hovered, on, focus: ui.focused }, styles });
  const icon = on ? (sort!.direction === "asc" ? "arrow-up" : "arrow-down") : "chevrons-up-down";
  return (
    <button
      type="button"
      data-af-part="sortButton"
      data-af-press
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, partStyle(r, "sortButton", { flexDirection: alignOf(column) === "end" ? "row-reverse" : "row", alignItems: "center", display: "inline-flex", marginInline: neg(t.space.xs) }))}
    >
      {column.label}
      <Icon part="sortIcon" name={icon} style={r.sortIcon} />
    </button>
  );
}

interface BodyRowProps {
  row: Row;
  id: string;
  columns: TableColumn[];
  dense: boolean;
  selectable: boolean;
  on: boolean;
  last: boolean;
  name: string;
  tk: ChartTokens;
  locale: string;
  currency?: string;
  actions: boolean;
  renderCell?: (column: TableColumn, row: Row) => ReactNode;
  renderActions?: (row: Row) => ReactNode;
  onRowPress?: (key: string, row: Row) => void;
  onToggle: (id: string) => void;
  styles?: PartStyles<"table">;
  strings?: Partial<KitStrings["table"]>;
}

/** A click that lands on a control inside the row (a box, a button, a link) is that control's, not the row's. */
const INSIDE = "button, a, input, label, select, textarea, [role='checkbox']";

/** Memoised: a row draws again only when its own props change, so a table of hundreds of rows does not redraw them all for a parent's update. */
const BodyRow = memo(function BodyRow({ row: data, id, columns, dense, selectable, on, last, name, tk, locale, currency, actions, renderCell, renderActions, onRowPress, onToggle, styles, strings }: BodyRowProps) {
  const ui = useInteraction();
  const r = useRecipe(recipes.table, { variants: { dense }, state: { hover: ui.hovered, on }, styles });
  const s = useStrings("table", strings);
  const formatWords: FormatWords = useMemo(() => ({ unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) }), [s]);
  const edge: CSSProperties | false = last && { borderBottomWidth: 0 };
  const press = onRowPress ? () => onRowPress(id, data) : undefined;
  const click = press
    ? (e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest(INSIDE)) press();
      }
    : undefined;
  return (
    <tr onClick={click} onPointerEnter={ui.handlers.onPointerEnter} onPointerLeave={ui.handlers.onPointerLeave} style={press ? { cursor: "pointer" } : undefined}>
      {selectable ? (
        <td data-af-part="checkCell" style={css(cellBox, partStyle(r, "checkCell", edge))}>
          <Checkbox label={s("selectRow", { name })} hideLabel checked={on} onCheckedChange={() => onToggle(id)} />
        </td>
      ) : null}
      {columns.map((c, i) => {
        const own = renderCell?.(c, data);
        const out = own !== undefined ? own : CELLS[cellOf(c)](data[c.key], c, data, { r, tk, name, words: formatWords, locale, currency, trendLabel: (column, values) => s("trendCell", { name, column, values }), progressLabel: (column) => s("progressCell", { name, column }) });
        const content = press && i === 0 ? <RowLink onPress={press}>{out}</RowLink> : out;
        return (
          <td key={c.key} data-af-part="cell" style={css(cellBox, c.wrap && { whiteSpace: "normal" }, c.width !== undefined && { width: c.width }, partStyle(r, "cell", { textAlign: alignOf(c) }, edge))}>
            <Content column={c} emphasis={c.emphasis ? r.emphasis : undefined}>{content}</Content>
          </td>
        );
      })}
      {actions ? (
        <td data-af-part="cell" style={css(cellBox, partStyle(r, "cell", { textAlign: "end" }, edge))}>
          <div style={css(row, { justifyContent: "flex-end" })}>{renderActions?.(data)}</div>
        </td>
      ) : null}
    </tr>
  );
});

interface CardProps {
  row: Row;
  id: string;
  layout: CardLayout;
  /** The columns drawn as label and value lines: the card's own, then the rest (the web has no details button, so it shows them all). */
  lines: TableColumn[];
  selectable: boolean;
  on: boolean;
  name: string;
  tk: ChartTokens;
  locale: string;
  currency?: string;
  renderCell?: (column: TableColumn, row: Row) => ReactNode;
  renderActions?: (row: Row) => ReactNode;
  onRowPress?: (key: string, row: Row) => void;
  onToggle: (id: string) => void;
  styles?: PartStyles<"table">;
  strings?: Partial<KitStrings["table"]>;
}

/**
 * One row as a card, for a table drawn with `narrow="cards"` in a narrow box: the phone's card (core's `cardLayout`), in the web's type. The
 * title is a button when the row is pressable, and a click anywhere on the card does the same, except on a control inside it.
 */
const Card = memo(function Card({ row: data, id, layout, lines, selectable, on, name, tk, locale, currency, renderCell, renderActions, onRowPress, onToggle, styles, strings }: CardProps) {
  const ui = useInteraction();
  const r = useRecipe(recipes.table, { state: { hover: ui.hovered, on }, styles });
  const s = useStrings("table", strings);
  const formatWords: FormatWords = useMemo(() => ({ unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) }), [s]);
  const press = onRowPress ? () => onRowPress(id, data) : undefined;
  const click = press
    ? (e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest(INSIDE)) press();
      }
    : undefined;
  const value = (c: TableColumn): ReactNode => {
    const own = renderCell?.(c, data);
    return own !== undefined ? own : CELLS[cellOf(c)](data[c.key], c, data, { r, tk, name, words: formatWords, locale, currency, trendLabel: (column, values) => s("trendCell", { name, column, values }), progressLabel: (column) => s("progressCell", { name, column }) });
  };
  const head = value(layout.title);
  const title = typeof head === "string" ? <span title={head} style={css(text, truncate(1))}>{head}</span> : head;
  return (
    <div role="listitem" data-af-part="card" onClick={click} onPointerEnter={ui.handlers.onPointerEnter} onPointerLeave={ui.handlers.onPointerLeave} style={css(box, partStyle(r, "card", press && { cursor: "pointer" }))}>
      <div data-af-part="cardHead" style={css(row, r.cardHead)}>
        {selectable ? <Checkbox label={s("selectRow", { name })} hideLabel checked={on} onCheckedChange={() => onToggle(id)} /> : null}
        <div data-af-part="cardTitle" style={css(row, { flexGrow: 1, flexShrink: 1 }, r.cardTitle)}>
          {press ? <RowLink onPress={press}>{title}</RowLink> : title}
        </div>
        {layout.badge ? <div style={css(row, { flexShrink: 0 })}>{value(layout.badge)}</div> : null}
        {renderActions ? <div style={css(row, { flexShrink: 0 })}>{renderActions(data)}</div> : null}
      </div>
      {lines.length ? (
        <dl data-af-part="cardLines" style={css(box, { margin: 0 }, r.cardLines)}>
          {lines.map((c) => (
            <div key={c.key} data-af-part="cardLine" style={css(row, { justifyContent: "space-between" }, r.cardLine)}>
              <dt data-af-part="cardLabel" style={css(text, { flexShrink: 0, maxWidth: "45%" }, r.cardLabel)}>{c.label}</dt>
              <dd data-af-part="cardValue" style={css(row, { margin: 0, flexShrink: 1, minWidth: 0, flexWrap: "wrap", justifyContent: "flex-end", textAlign: "end", overflowWrap: "anywhere" }, alignOf(c) === "end" && { fontVariantNumeric: "tabular-nums" }, r.cardValue)}>{value(c)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
});

/** Until the table has measured its box, a table that may draw cards draws them: they fit any width, the grid does not. */
function useCards(narrow: TableNarrow, below: number, root: RefObject<HTMLDivElement | null>): boolean {
  const [cards, setCards] = useState(true);
  useLayoutEffect(() => {
    const el = root.current;
    if (narrow !== "cards" || !el) return;
    // A box with no width (not laid out yet, or hidden) keeps what it drew.
    const fit = () => {
      const width = el.getBoundingClientRect().width;
      if (width > 0) setCards(width < below);
    };
    fit();
    if (typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(fit);
    watch.observe(el);
    return () => watch.disconnect();
  }, [narrow, below, root]);
  return narrow === "cards" && cards;
}

const NONE: string[] = [];

export function Table({ columns, rows, rowKey = "key", sort, onSortChange, selectable = false, selected, onSelectedChange, pageSize = 0, total, currency, maxHeight, renderCell, renderActions, onRowPress, page, onPageChange, loading = false, empty, emptyLine = "", dense = false, narrow = "scroll", label, styles, strings, style, ...rest }: TableProps) {
  const ui = useInteraction();
  const r = useRecipe(recipes.table, { variants: { dense }, state: { focus: ui.focused }, styles });
  const s = useStrings("table", strings);
  const locale = useLocale();
  const formatWords: FormatWords = useMemo(() => ({ unavailable: s("unavailable"), points: ({ value }) => s("formatPoints", { value }), duration: ({ minutes, seconds }) => s("formatDuration", { minutes, seconds }) }), [s]);
  const tk = useChartTokens();
  // The root is measured (`narrow="cards"`) and is also the product's `ref`.
  const node = useRef<HTMLDivElement | null>(null);
  const outer = rest.ref;
  const setRoot = useCallback(
    (el: HTMLDivElement | null) => {
      node.current = el;
      if (typeof outer === "function") return outer(el);
      if (outer) (outer as RefObject<HTMLDivElement | null>).current = el;
    },
    [outer],
  );
  const asCards = useCards(narrow, tk.table.cardsBelow, node);
  const [order, setOrder] = useControllable(sort, onSortChange);
  const [ticked, setTicked] = useControllable(selected, onSelectedChange);
  const [at, setAt] = useControllable(page, onPageChange);
  const picked = ticked ?? NONE;
  // A server-paged list (`total`) is drawn as given; otherwise the table orders and pages every row itself.
  const manual = total !== undefined;
  const sorted = useMemo(() => (manual ? rows : sortRows(rows, columns, order, locale)), [manual, rows, columns, order, locale]);
  const rowTotal = manual ? total : sorted.length;
  const count = pageCountOf(rowTotal, pageSize);
  const current = clampPage(at ?? 1, count);
  const shown = pageSize > 0 && !manual ? sorted.slice((current - 1) * pageSize, current * pageSize) : sorted;
  const ids = rowIds(shown, rows, rowKey);
  const { all, some } = pickState(ids, picked);
  const lead = columns[0];
  const actions = renderActions !== undefined;
  const wide = columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);
  // `table.headRadius` rounds the header row's two ends: the first header cell's start corners, the last's end corners. At 0 (the default)
  // nothing is added, so a table drawn without it is drawn exactly as before.
  const rounded = tk.table.headRadius > 0;
  const ends = (i: number): CSSProperties | false =>
    rounded &&
    css(
      i === 0 && { borderStartStartRadius: t.table.headRadius, borderEndStartRadius: t.table.headRadius },
      i === wide - 1 && { borderStartEndRadius: t.table.headRadius, borderEndEndRadius: t.table.headRadius },
    );
  const firstColumn = selectable ? 1 : 0;
  const change = (next: TableSort | null) => {
    setOrder(next);
    const c = next ? columns.find((x) => x.key === next.column) : undefined;
    announce(next && c ? s("announceSorted", { column: c.label, direction: s(next.direction === "asc" ? "ascending" : "descending") }) : s("announceUnsorted"));
    if (current !== 1) setAt(1);
  };
  const press = (c: TableColumn) => change(nextSort(c, order));
  // The card's columns, once per set of columns, so a memoised card is not drawn again for a parent's update.
  const layout = useMemo(() => (asCards ? cardLayout(columns) : null), [asCards, columns]);
  const lines = useMemo(() => (layout ? [...layout.lines, ...layout.hidden] : []), [layout]);
  // Rows are ticked through the latest selection, so a row's toggle keeps one identity and a memoised row is not redrawn by it.
  const latest = useRef({ picked, setTicked });
  latest.current = { picked, setTicked };
  const toggle = useCallback((id: string) => latest.current.setTicked(toggleRow(id, latest.current.picked)), []);
  // The rows arriving, and the rows running out, are said once: a reader on a sort button or a filter hears nothing change otherwise.
  const seen = useRef({ loading, rows: shown.length });
  useEffect(() => {
    const was = seen.current;
    seen.current = { loading, rows: shown.length };
    if (loading) return;
    if (was.loading) announce(shown.length ? s("announceLoaded", { count: shown.length }) : s("announceEmpty"));
    else if (was.rows > 0 && shown.length === 0) announce(s("announceEmpty"));
  }, [loading, shown.length, s]);
  const pager = pageSize > 0 && rowTotal > pageSize ? <Pagination page={current} total={rowTotal} pageSize={pageSize} compact={asCards} onPageChange={(n) => setAt(n)} /> : null;
  // The scroll region draws the focus edge only for its own keyboard focus, not for a box or a button inside it.
  const own = (e: FocusEvent) => e.target === e.currentTarget;

  if (asCards) {
    const sortable = columns.filter(isSortable);
    // The sort bar the phone has: a Select of the sortable columns, and a button that reverses the order once there is one.
    const bar =
      sortable.length > 0 || selectable ? (
        <div data-af-part="bar" style={css(row, r.bar)}>
          {selectable ? <Checkbox label={s("selectAll")} hideLabel checked={all} indeterminate={some} onCheckedChange={() => setTicked(togglePage(ids, picked))} /> : null}
          {sortable.length > 0 ? (
            <div data-af-part="barSort" style={css(box, { flexGrow: 1, flexShrink: 1 }, r.barSort)}>
              <Select
                size="sm"
                label=""
                placeholder={s("sortBy")}
                value={order?.column ?? ""}
                items={[{ key: "", label: s("asListed") }, ...sortable.map((c) => ({ key: c.key, label: c.label }))]}
                onValueChange={(key) => {
                  const c = columns.find((x) => x.key === key);
                  change(c ? { column: c.key, direction: firstDirection(c) } : null);
                }}
              />
            </div>
          ) : null}
          {sortable.length > 0 && order ? (
            <IconButton
              icon={order.direction === "asc" ? "arrow-up" : "arrow-down"}
              label={order.direction === "asc" ? s("sortedAscending") : s("sortedDescending")}
              variant="outline"
              shape="square"
              size="sm"
              onPress={() => change({ ...order, direction: order.direction === "asc" ? "desc" : "asc" })}
            />
          ) : null}
        </div>
      ) : null;
    let body: ReactNode;
    if (loading) {
      body = (
        <div data-af-part="cards" role="list" aria-label={label} aria-busy style={css(box, r.cards)}>
          {Array.from({ length: pageSize > 0 ? Math.min(pageSize, 3) : 3 }, (_, i) => {
            const titleLine = <Skeleton shape="line" width={t.table.loadCardL} height={t.table.loadH} label={s("loadingLines", { label })} />;
            return (
              <div key={i} role="listitem" data-af-part="card" style={css(box, r.card)}>
                {i === 0 ? titleLine : <span aria-hidden>{titleLine}</span>}
                <span aria-hidden>
                  <Skeleton shape="line" width={t.table.loadCardS} height={t.table.loadH} label={s("loadingLines", { label })} />
                </span>
              </div>
            );
          })}
        </div>
      );
    } else if (shown.length === 0 || !layout) {
      body = (
        <div data-af-part="empty" style={css(box, { textAlign: "center" }, r.empty)}>
          <EmptyState art="none" icon="inbox" compact title={empty ?? s("empty")} line={emptyLine} />
        </div>
      );
    } else {
      body = (
        <div data-af-part="cards" role="list" aria-label={label} style={css(box, r.cards)}>
          {shown.map((x, i) => (
            <Card
              key={ids[i]}
              row={x}
              id={ids[i]!}
              layout={layout}
              lines={lines}
              selectable={selectable}
              on={picked.includes(ids[i]!)}
              name={cellText(layout.title, x[layout.title.key], formatWords, locale, currency)}
              tk={tk}
              locale={locale}
              currency={currency}
              renderCell={renderCell}
              renderActions={renderActions}
              onRowPress={onRowPress}
              onToggle={toggle}
              styles={styles}
              strings={strings}
            />
          ))}
        </div>
      );
    }
    return (
      <div data-af-part="root" {...rootProps(rest)} ref={setRoot} style={css(box, { minHeight: 0 }, r.root, style)}>
        {bar}
        {body}
        {pager}
      </div>
    );
  }

  return (
    <div data-af-part="root" {...rootProps(rest)} ref={setRoot} style={css(box, { minHeight: 0 }, r.root, style)}>
      <div
        data-af-part="scroll"
        role="region"
        aria-label={label}
        tabIndex={0}
        onFocus={(e) => own(e) && ui.handlers.onFocus(e)}
        onBlur={(e) => own(e) && ui.handlers.onBlur()}
        style={css(box, { overflow: "auto", outline: "none" }, maxHeight !== undefined && { maxHeight }, r.scroll)}
      >
        <table aria-busy={loading} style={grid}>
          <caption style={visuallyHidden}>{label}</caption>
          <thead>
            <tr>
              {selectable ? (
                <th data-af-part="checkHead" style={css(cellBox, { position: "sticky", top: 0, zIndex: 1 }, ends(0), r.headCell, r.checkHead)}>
                  <Checkbox label={s("selectAll")} hideLabel checked={all} indeterminate={some} onCheckedChange={() => setTicked(togglePage(ids, picked))} />
                </th>
              ) : null}
              {columns.map((c, i) => (
                <th key={c.key} scope="col" aria-sort={isSortable(c) ? ariaSort(c, order ?? null) : undefined} data-af-part="headCell" style={css(cellBox, { position: "sticky", top: 0, zIndex: 1 }, c.width !== undefined && { width: c.width }, partStyle(r, "headCell", { textAlign: alignOf(c) }, ends(firstColumn + i)))}>
                  {isSortable(c) ? <SortButton column={c} sort={order ?? null} onPress={() => press(c)} styles={styles} /> : c.label}
                </th>
              ))}
              {actions ? (
                <th scope="col" data-af-part="headCell" style={css(cellBox, { position: "sticky", top: 0, zIndex: 1 }, ends(wide - 1), r.headCell)}>
                  <span style={visuallyHidden}>{s("actions")}</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: pageSize > 0 ? pageSize : 4 }, (_, i) => (
                  <tr key={i}>
                    {selectable ? <td data-af-part="checkCell" style={css(cellBox, r.checkCell)} /> : null}
                    {columns.map((c, j) => {
                      const first = i === 0 && j === 0;
                      const line = <Skeleton shape="line" width={[t.table.loadS, t.table.loadM, t.table.loadL][(i + j) % 3]} height={t.table.loadH} label={s("loadingLines", { label })} />;
                      return (
                        <td key={c.key} data-af-part="cell" style={css(cellBox, r.cell)}>
                          <Content column={c}>{first ? line : <span aria-hidden>{line}</span>}</Content>
                        </td>
                      );
                    })}
                    {actions ? <td data-af-part="cell" style={css(cellBox, r.cell)} /> : null}
                  </tr>
                ))
              : shown.length === 0
                ? (
                    <tr>
                      <td colSpan={wide} data-af-part="empty" style={css({ textAlign: "center" }, r.empty)}>
                        <EmptyState art="none" icon="inbox" compact title={empty ?? s("empty")} line={emptyLine} />
                      </td>
                    </tr>
                  )
                : shown.map((x, i) => (
                    <BodyRow
                      key={ids[i]}
                      row={x}
                      id={ids[i]!}
                      columns={columns}
                      dense={dense}
                      selectable={selectable}
                      on={picked.includes(ids[i]!)}
                      last={i === shown.length - 1}
                      name={lead ? cellText(lead, x[lead.key], formatWords, locale, currency) : ids[i]!}
                      tk={tk}
                      locale={locale}
                      currency={currency}
                      actions={actions}
                      renderCell={renderCell}
                      renderActions={renderActions}
                      onRowPress={onRowPress}
                      onToggle={toggle}
                      styles={styles}
                      strings={strings}
                    />
                  ))}
          </tbody>
        </table>
      </div>
      {pager}
    </div>
  );
}
