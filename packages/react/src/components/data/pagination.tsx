import { useEffect, useRef, type CSSProperties } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { clampPage, pageCountOf, pageRange, pageSlots } from "@antfabric/ui-core/chart";
import { t } from "../../tokens";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, setRef, type RootProps } from "../../lib/root-props";
import { css, row, text } from "../../lib/style";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";
import { Select } from "../inputs/select";

export interface PaginationProps extends RootProps<HTMLElement> {
  /** The page on show, counted from 1. */
  page?: number;
  /** How many rows there are in all. Gives the summary ("Showing 6–10 of 12") and, with `pageSize`, the page count. */
  total?: number;
  /** How many pages there are, for a list whose total is not known. Left out, it is worked out from `total` and `pageSize`. */
  pageCount?: number;
  /** Rows a page. */
  pageSize?: number;
  /** The choices of rows a page ([10, 25, 100]): a labelled Select beside the summary. Left out, the page size is not the reader's to change. */
  pageSizes?: number[];
  /** A Select of every page, to go straight to one. Meant for up to a few hundred pages; a longer list is searchable. */
  jump?: boolean;
  /** Previous, next and the summary alone: no page buttons. For a narrow place, and the phone's table. */
  compact?: boolean;
  /** Called with the page (from 1) a press goes to. */
  onPageChange?: (page: number) => void;
  /** A choice was made in the page-size Select. Called with the rows a page. The pager goes back to page 1 with it. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Per-part styles over the theme: `{ root: {…}, summary: {…}, pages: {…}, gap: {…} }`. */
  styles?: PartStyles<"pagination">;
  /** The built-in text, by key: the summary, the buttons' names and the gap between the page buttons. */
  strings?: Partial<KitStrings["pagination"]>;
  style?: CSSProperties;
}

/** The layout no token decides; the type and the gaps are the recipe's. */
const list: CSSProperties = { ...row, listStyle: "none", margin: 0, padding: 0 };

/** More pages than this and the jump Select is searchable. */
const SEARCHABLE_AFTER = 12;

export function Pagination({ page, total, pageCount, pageSize, pageSizes, jump = false, compact = false, onPageChange, onPageSizeChange, styles, strings, style, ...rest }: PaginationProps) {
  const r = useRecipe(recipes.pagination, { styles });
  const s = useStrings("pagination", strings);
  const [current, setCurrent] = useControllable(page, onPageChange);
  const [size = 10, setSize] = useControllable(pageSize, onPageSizeChange);
  const nav = useRef<HTMLElement>(null);
  const count = pageCount ?? pageCountOf(total ?? 0, size);
  const at = clampPage(current ?? 1, count);
  const go = (n: number) => {
    const next = clampPage(n, count);
    if (next !== at) setCurrent(next);
  };
  // Previous and next are disabled on the first and the last page. A keyboard user who pressed the one that just became disabled would
  // lose their place, so focus moves to the page button that is current (or to the other arrow in a compact pager).
  const was = useRef(at);
  useEffect(() => {
    if (was.current === at) return;
    was.current = at;
    const el = document.activeElement as HTMLButtonElement | null;
    if (el && el !== document.body && !el.disabled) return;
    const box = nav.current;
    (box?.querySelector<HTMLElement>("li[data-current] button") ?? box?.querySelector<HTMLElement>("button:not(:disabled)"))?.focus({ preventScroll: true });
  }, [at]);
  const { from, to } = pageRange(at, size, total ?? 0);
  const range = { from, to, total: total ?? 0 };
  const summary = total === undefined ? s("pageOf", { page: at, count }) : compact ? s("rangeOf", range) : s("showing", range);
  const sizes = pageSizes && pageSizes.length > 0 ? (pageSizes.includes(size) ? pageSizes : [size, ...pageSizes].sort((a, b) => a - b)) : null;
  return (
    <nav
      data-af-part="root"
      aria-label={s("pages")}
      {...rootProps(rest)}
      ref={(el) => {
        nav.current = el;
        setRef(rest.ref, el);
      }}
      style={css(row, { justifyContent: "space-between" }, (sizes || jump) && { flexWrap: "wrap", gap: t.space.sm }, r.root, style)}
    >
      <span data-af-part="summary" aria-live="polite" style={css(text, { fontVariantNumeric: "tabular-nums" }, r.summary)}>{summary}</span>
      {sizes ? (
        <Select
          label={s("rowsPerPage")}
          size="sm"
          value={String(size)}
          items={sizes.map((n) => ({ key: String(n), label: String(n) }))}
          onValueChange={(key) => {
            setSize(Number(key));
            if (at !== 1) setCurrent(1);
          }}
          style={{ width: "auto" }}
        />
      ) : null}
      {jump && count > 1 ? (
        <Select
          label={s("goToPage")}
          size="sm"
          value={String(at)}
          searchable={count > SEARCHABLE_AFTER}
          items={Array.from({ length: count }, (_, i) => ({ key: String(i + 1), label: String(i + 1) }))}
          onValueChange={(key) => go(Number(key))}
          style={{ width: "auto" }}
        />
      ) : null}
      <ul data-af-part="pages" style={css(list, r.pages)}>
        <li style={css(row)}>
          <IconButton icon="chevron-left" label={s("previous")} variant="outline" shape="square" size="sm" disabled={at <= 1} onPress={() => go(at - 1)} />
        </li>
        {compact
          ? null
          : pageSlots(at, count).map((slot, i) =>
              slot === "gap" ? (
                <li key={`gap-${i}`} aria-hidden style={css(row)}>
                  <span data-af-part="gap" style={css(text, r.gap)}>{s("gap")}</span>
                </li>
              ) : (
                // The current page is on the button itself, so a screen reader on it says "Page 3, current page".
                <li key={slot} data-current={slot === at ? "" : undefined} style={css(row)}>
                  <Button label={String(slot)} size="sm" variant={slot === at ? "soft" : "ghost"} onPress={() => go(slot)} {...({ "aria-label": s("page", { page: slot }), "aria-current": slot === at ? "page" : undefined } as object)} />
                </li>
              ),
            )}
        <li style={css(row)}>
          <IconButton icon="chevron-right" label={s("next")} variant="outline" shape="square" size="sm" disabled={at >= count} onPress={() => go(at + 1)} />
        </li>
      </ul>
    </nav>
  );
}
