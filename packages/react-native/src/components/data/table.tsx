import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Pressable, Text, View, type TextStyle, type ViewStyle } from "react-native";
import { recipes, useControllable, useLocale, useStrings, type KitStrings } from "@antfabric-ui/core";
import {
  alignOf,
  cardLayout,
  cellOf,
  cellText,
  clampPage,
  firstDirection,
  fmt,
  identityOf,
  isBlank,
  isSortable,
  pageCountOf,
  pickState,
  sortRows,
  sparkRows,
  togglePage,
  toggleRow,
  trendTone,
  type CellTone,
  type CellType,
  type FormatWords,
  type Row,
  type TableColumn,
  type TableSort,
} from "@antfabric-ui/core/chart";
import { createStyles, useTheme } from "../../theme";
import { announce } from "../../lib/a11y";
import type { PartStyle, PartStyles } from "../../lib/recipe";
import { useRecipe } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
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

export interface TableProps extends RootProps<View> {
  /** One per column: `{ key: "arr", label: "ARR", cell: "currency" }`. `key` is the field of each row the column reads. The phone draws a card per row from the columns' `priority`. */
  columns: TableColumn[];
  /** One object per row. The same rows can feed a chart, a stat and a table. */
  rows: Row[];
  /** The field of each row that names it, for selection and for React's keys. Default `key`; the keys `selected` holds are its values as text. */
  rowKey?: string;
  /** The column the rows are ordered by and which way, or `null` for the order they came in. */
  sort?: TableSort | null;
  /** Called with the new order when the sort Select or the direction button above the cards is pressed. */
  onSortChange?: (sort: TableSort | null) => void;
  /** A box on each card to tick it, and one above the cards for the rows on the page. */
  selectable?: boolean;
  /** The keys of the ticked rows. Rows on other pages stay ticked. */
  selected?: string[];
  /** Called with the keys ticked after a press. */
  onSelectedChange?: (selected: string[]) => void;
  /** Rows a page, with a Pagination under the cards when there are more rows than that. 0 shows every row. */
  pageSize?: number;
  /** How many rows there are in all, when `rows` holds only the page on show (a list the server pages and sorts). The table then draws exactly the rows it is given, never sorts or slices them, and only reports `onSortChange` and `onPageChange`. Left out, `rows` is every row and the table sorts and pages them itself. */
  total?: number;
  /** An ISO 4217 code for the currency columns that name none in their `format` (default USD). */
  currency?: string;
  /** Draws a value yourself: called with the column and the row, it returns what goes in that place on the card. Returning `undefined` keeps the column's own. */
  renderCell?: (column: TableColumn, row: Row) => ReactNode;
  /** Draws a row's actions (a button, a menu) at the end of the card's head: called with the row. */
  renderActions?: (row: Row) => ReactNode;
  /** A card was tapped. Called with the row's key and the row. */
  onRowPress?: (key: string, row: Row) => void;
  /** The keys of the cards that show every column, not only the card's own few. A card with columns it does not show has a button for it. */
  expanded?: string[];
  /** Called with the keys expanded after the button on a card is pressed. */
  onExpandedChange?: (expanded: string[]) => void;
  /** The page on show, counted from 1. Sorting goes back to page 1. */
  page?: number;
  /** Called with the page (from 1) a press, or a new sort, goes to. */
  onPageChange?: (page: number) => void;
  /** Grey cards in place of the rows, from the kit's Skeleton. */
  loading?: boolean;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** What the table is: the list's accessible name. */
  label: string;
  /** Per-part styles over the theme: `{ root: {…}, bar: {…}, card: {…}, cardTitle: {…}, … }`, one per part the phone's table draws. */
  styles?: PartStyles<"table">;
  /** The built-in text, by key: the empty title, the tick boxes' names, what a screen reader hears for a trend or a meter in a card, and the blank value's dash. */
  strings?: Partial<KitStrings["table"]>;
  style?: ViewStyle;
}

interface CellContext {
  r: Record<string, PartStyle>;
  tk: ChartTokens;
  /** The row's name, for a screen reader: "Northwind Logistics, Seats used". */
  name: string;
  /** The words a format writes: `unavailable` is what a value that is not there says. */
  words: FormatWords;
  /** The locale numbers and dates are written in, and the currency a column with none of its own uses. */
  locale: string;
  currency?: string;
  /** A part's `testID`: the product's, or the kit's `table.<part>`. */
  id: (part: string) => string;
  /** The accessible name of a trend in a card. */
  trendLabel: (column: string, values: string) => string;
  /** The accessible name of a meter in a card. */
  progressLabel: (column: string) => string;
}
const personRow: ViewStyle = { flexDirection: "row", alignItems: "center" };

/** What each cell type draws, one entry per type. Text comes back as a string, which the card sets in its own type; a component comes back as itself. */
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
      <View testID={x.id("person")} style={[personRow, x.r.person!.view]}>
        <Avatar name={String(v)} size="xs" identity={identityOf(String(v))} />
        <Text testID={x.id("personName")} numberOfLines={1} style={[x.r.personName!.view, x.r.personName!.text]}>{String(v)}</Text>
      </View>
    ),
  // A trend is a list of numbers; its colour says which way it went (the loss colour when the last point is below the first).
  sparkline: (v, c, _row, x) =>
    Array.isArray(v) && v.length ? <Sparkline data={sparkRows(v)} y="v" width={x.tk.table.sparkW} height={x.tk.table.sparkH} area tone={trendTone(v)} label={x.trendLabel(c.label, v.join(", "))} /> : x.words.unavailable,
  progress: (v, c, _row, x) => <Meter value={typeof v === "number" ? v : NaN} kind={c.kind ?? "score"} compact label={x.progressLabel(c.label)} />,
};

/** Layout no token decides; what the tokens decide (the card's fill and edge, the gaps, the type) is the recipe's. */
const useStyles = createStyles(() => ({
  bar: { flexDirection: "row", alignItems: "center" },
  barSort: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, minWidth: 0 },
  line: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { flexShrink: 1 },
  value: { alignItems: "flex-end", flexShrink: 0, maxWidth: "70%" },
  num: { fontVariant: ["tabular-nums"] },
}));

const NONE: string[] = [];

export function Table({ columns, rows, rowKey = "key", sort, onSortChange, selectable = false, selected, onSelectedChange, pageSize = 0, total, currency, renderCell, renderActions, onRowPress, expanded, onExpandedChange, page, onPageChange, loading = false, empty, emptyLine = "", label, styles, strings, style, testID, ...rest }: TableProps) {
  const s = useStyles();
  const { t } = useTheme();
  const tk = useChartTokens();
  const r = useRecipe(recipes.table, { styles });
  const on = useRecipe(recipes.table, { state: { on: true }, styles });
  const str = useStrings("table", strings);
  const locale = useLocale();
  const id = (part: string) => partId(testID, "table", part);
  const formatWords: FormatWords = useMemo(() => ({ unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) }), [str]);
  const [order, setOrder] = useControllable(sort, onSortChange);
  const [ticked, setTicked] = useControllable(selected, onSelectedChange);
  const [open, setOpen] = useControllable(expanded, onExpandedChange);
  const [at, setAt] = useControllable(page, onPageChange);
  const picked = ticked ?? NONE;
  const opened = open ?? NONE;
  // A server-paged list (`total`) is drawn as given; otherwise the table orders and pages every row itself.
  const manual = total !== undefined;
  const sorted = useMemo(() => (manual ? rows : sortRows(rows, columns, order, locale)), [manual, rows, columns, order, locale]);
  const rowTotal = manual ? total : sorted.length;
  const count = pageCountOf(rowTotal, pageSize);
  const current = clampPage(at ?? 1, count);
  const shown = pageSize > 0 && !manual ? sorted.slice((current - 1) * pageSize, current * pageSize) : sorted;
  const ids = shown.map((x) => String(x[rowKey]));
  const { all, some } = pickState(ids, picked);
  const layout = cardLayout(columns);
  const sortable = columns.filter(isSortable);
  const order$ = order ?? null;
  const change = (next: TableSort | null) => {
    setOrder(next);
    const c = next ? columns.find((x) => x.key === next.column) : undefined;
    announce(next && c ? str("announceSorted", { column: c.label, direction: str(next.direction === "asc" ? "ascending" : "descending") }) : str("announceUnsorted"));
    if (current !== 1) setAt(1);
  };
  // The rows arriving, and the rows running out, are said once.
  const seen = useRef({ loading, rows: shown.length });
  useEffect(() => {
    const was = seen.current;
    seen.current = { loading, rows: shown.length };
    if (loading) return;
    if (was.loading) announce(shown.length ? str("announceLoaded", { count: shown.length }) : str("announceEmpty"));
    else if (was.rows > 0 && shown.length === 0) announce(str("announceEmpty"));
  }, [loading, shown.length, str]);
  const pager = pageSize > 0 && rowTotal > pageSize ? <Pagination page={current} total={rowTotal} pageSize={pageSize} compact onPageChange={(n) => setAt(n)} /> : null;

  /** A cell's content: the product's own if `renderCell` drew it, else a string in the part's type or a component. */
  const content = (c: TableColumn, x: Row, name: string, text: TextStyle, numeric: boolean, one = false): ReactNode => {
    const own = renderCell?.(c, x);
    const out = own !== undefined ? own : CELLS[cellOf(c)](x[c.key], c, x, { r, tk, name, words: formatWords, locale, currency, id, trendLabel: (column, values) => str("trendCell", { name, column, values }), progressLabel: (column) => str("progressCell", { name, column }) });
    return typeof out === "string" ? <Text numberOfLines={one ? 1 : undefined} style={[numeric && s.num, text]}>{out}</Text> : out;
  };
  /** What a screen reader says for a value, as text. */
  const spoken = (c: TableColumn, v: unknown): string => {
    if (cellOf(c) === "sparkline") return Array.isArray(v) && v.length ? v.join(", ") : formatWords.unavailable;
    if (cellOf(c) === "progress") return typeof v === "number" && Number.isFinite(v) ? fmt("percent", v, formatWords, locale) : formatWords.unavailable;
    return cellText(c, v, formatWords, locale, currency);
  };

  const bar = (
    <View testID={id("bar")} style={[s.bar, r.bar.view]}>
      {selectable ? <Checkbox label={str("selectAll")} hideLabel checked={all} indeterminate={some} onCheckedChange={() => setTicked(togglePage(ids, picked))} /> : null}
      <View testID={id("barSort")} style={[s.barSort, r.barSort.view]}>
        <Select
          label=""
          title={str("sortBy")}
          placeholder={str("sortBy")}
          value={order$?.column ?? ""}
          items={[{ key: "", label: str("asListed") }, ...sortable.map((c) => ({ key: c.key, label: c.label }))]}
          onValueChange={(key) => {
            const c = columns.find((x) => x.key === key);
            change(c ? { column: c.key, direction: firstDirection(c) } : null);
          }}
        />
      </View>
      {order$ ? (
        <IconButton
          icon={order$.direction === "asc" ? "arrow-up" : "arrow-down"}
          label={order$.direction === "asc" ? str("sortedAscending") : str("sortedDescending")}
          variant="outline"
          shape="square"
          size="sm"
          onPress={() => change({ ...order$, direction: order$.direction === "asc" ? "desc" : "asc" })}
        />
      ) : null}
    </View>
  );

  /** One label and value line. Each is one stop for a screen reader ("Seats used: 86%"), unless the product drew the value itself. */
  const line = (c: TableColumn, x: Row, name: string, p: typeof r) => {
    const custom = renderCell?.(c, x) !== undefined;
    return (
      <View key={c.key} testID={id("cardLine")} accessible={!custom} accessibilityLabel={custom ? undefined : str("cardLine", { label: c.label, value: spoken(c, x[c.key]) })} style={[s.line, p.cardLine.view]}>
        <Text testID={id("cardLabel")} numberOfLines={1} style={[s.label, p.cardLabel.view, p.cardLabel.text]}>{c.label}</Text>
        <View testID={id("cardValue")} style={[s.value, p.cardValue.view]}>{content(c, x, name, p.cardValue.text, alignOf(c) === "end")}</View>
      </View>
    );
  };

  let body: ReactNode;
  if (loading) {
    const title = `${t.table.loadCardL}px`;
    const lineW = `${t.table.loadCardS}px`;
    const height = `${t.table.loadH}px`;
    body = (
      <View testID={id("cards")} accessibilityState={{ busy: true }} style={r.cards.view}>
        {Array.from({ length: pageSize > 0 ? Math.min(pageSize, 3) : 3 }, (_, i) => (
          <View key={i} testID={id("card")} style={r.card.view}>
            {i === 0 ? <Skeleton shape="line" width={title} height={height} label={str("loadingLines", { label })} /> : <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Skeleton shape="line" width={title} height={height} label={str("loadingLines", { label })} /></View>}
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Skeleton shape="line" width={lineW} height={height} label={str("loadingLines", { label })} /></View>
          </View>
        ))}
      </View>
    );
  } else if (shown.length === 0 || !layout) {
    body = (
      <View testID={id("empty")} style={r.empty.view}>
        <EmptyState art="none" icon="inbox" title={empty ?? str("empty")} line={emptyLine} />
      </View>
    );
  } else {
    body = (
      <View testID={id("cards")} accessibilityRole="list" accessibilityLabel={label} style={r.cards.view}>
        {shown.map((x, i) => {
          const key = ids[i]!;
          const ticks = picked.includes(key);
          const p = ticks ? on : r;
          const name = cellText(layout.title, x[layout.title.key], formatWords, locale, currency);
          const more = layout.hidden.length > 0;
          const shows = more && opened.includes(key);
          const title = <View testID={id("cardTitle")} style={[s.title, p.cardTitle.view]}>{content(layout.title, x, name, p.cardTitle.text, false, true)}</View>;
          const inner = (
            <>
              <View testID={id("cardHead")} style={[s.head, p.cardHead.view]}>
                {selectable ? <Checkbox label={str("selectRow", { name })} hideLabel checked={ticks} onCheckedChange={() => setTicked(toggleRow(key, picked))} /> : null}
                {onRowPress ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={name} onPress={() => onRowPress(key, x)} style={s.title}>
                    {title}
                  </Pressable>
                ) : (
                  title
                )}
                {layout.badge ? content(layout.badge, x, name, p.cardValue.text, false) : null}
                {renderActions?.(x)}
                {more ? <IconButton icon={shows ? "chevron-up" : "chevron-down"} label={str(shows ? "hideDetails" : "showDetails", { name })} variant="ghost" shape="square" size="sm" onPress={() => setOpen(toggleRow(key, opened))} /> : null}
              </View>
              {layout.lines.length || shows ? (
                <View testID={id("cardLines")} style={p.cardLines.view}>
                  {layout.lines.map((c) => line(c, x, name, p))}
                  {shows ? layout.hidden.map((c) => line(c, x, name, p)) : null}
                </View>
              ) : null}
            </>
          );
          return onRowPress ? (
            <Pressable key={key} testID={id("card")} accessible={false} onPress={() => onRowPress(key, x)} style={p.card.view}>
              {inner}
            </Pressable>
          ) : (
            <View key={key} testID={id("card")} style={p.card.view}>
              {inner}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View testID={id("root")} {...rootProps(rest)} style={[r.root.view, style]}>
      {bar}
      {body}
      {pager}
    </View>
  );
}
