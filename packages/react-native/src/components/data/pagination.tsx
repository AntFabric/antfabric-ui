import { Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { clampPage, pageCountOf, pageRange, pageSlots } from "@antfabric/ui-core/chart";
import { createStyles } from "../../theme";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";
import { Select } from "../inputs/select";

export interface PaginationProps extends RootProps<View> {
  /** The page on show, counted from 1. */
  page?: number;
  /** How many rows there are in all. Gives the summary ("Showing 6–10 of 12") and, with `pageSize`, the page count. */
  total?: number;
  /** How many pages there are, for a list whose total is not known. Left out, it is worked out from `total` and `pageSize`. */
  pageCount?: number;
  /** Rows a page. */
  pageSize?: number;
  /** The choices of rows a page ([10, 25, 100]): a labelled Select above the pager. Left out, the page size is not the reader's to change. */
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
  style?: ViewStyle;
}

/** More pages than this and the jump Select is searchable. */
const SEARCHABLE_AFTER = 12;

/** Layout no token decides; the type and the gaps are the recipe's. */
const useStyles = createStyles((t) => ({
  outer: { alignSelf: "stretch", gap: t.space.sm },
  root: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summary: { fontVariant: ["tabular-nums"], flexShrink: 1 },
  pages: { flexDirection: "row", alignItems: "center" },
  choices: { flexDirection: "row", alignItems: "flex-end", gap: t.space.sm },
  choice: { flex: 1 },
}));

export function Pagination({ page, total, pageCount, pageSize, pageSizes, jump = false, compact = false, onPageChange, onPageSizeChange, styles, strings, style, testID, ...rest }: PaginationProps) {
  const s = useStyles();
  const r = useRecipe(recipes.pagination, { styles });
  const str = useStrings("pagination", strings);
  const id = (part: string) => partId(testID, "pagination", part);
  const [current, setCurrent] = useControllable(page, onPageChange);
  const [size = 10, setSize] = useControllable(pageSize, onPageSizeChange);
  const count = pageCount ?? pageCountOf(total ?? 0, size);
  const at = clampPage(current ?? 1, count);
  const go = (n: number) => {
    const next = clampPage(n, count);
    if (next !== at) setCurrent(next);
  };
  const { from, to } = pageRange(at, size, total ?? 0);
  const range = { from, to, total: total ?? 0 };
  const summary = total === undefined ? str("pageOf", { page: at, count }) : compact ? str("rangeOf", range) : str("showing", range);
  const sizes = pageSizes && pageSizes.length > 0 ? (pageSizes.includes(size) ? pageSizes : [size, ...pageSizes].sort((a, b) => a - b)) : null;
  // With the choices above it, the pager sits in a wrapper, which is then the root the pass-through names.
  const alone = !sizes && !(jump && count > 1);
  const pager = (
    <View testID={id("root")} {...(alone ? rootProps(rest) : null)} style={[s.root, r.root.view, style]}>
      <Text testID={id("summary")} accessibilityLiveRegion="polite" style={[r.summary.view, s.summary, r.summary.text]}>{summary}</Text>
      <View testID={id("pages")} style={[s.pages, r.pages.view]}>
        <IconButton icon="chevron-left" label={str("previous")} variant="outline" shape="square" size="sm" disabled={at <= 1} onPress={() => go(at - 1)} />
        {compact
          ? null
          : pageSlots(at, count).map((slot, i) =>
              slot === "gap" ? (
                <View key={`gap-${i}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <Text testID={id("gap")} style={[r.gap.text, r.gap.view]}>{str("gap")}</Text>
                </View>
              ) : (
                // The page's name and whether it is the current one go on the button itself.
                <Button key={slot} label={String(slot)} size="sm" variant={slot === at ? "soft" : "ghost"} onPress={() => go(slot)} {...({ accessibilityLabel: str("page", { page: slot }), accessibilityState: { selected: slot === at } } as object)} />
              ),
            )}
        <IconButton icon="chevron-right" label={str("next")} variant="outline" shape="square" size="sm" disabled={at >= count} onPress={() => go(at + 1)} />
      </View>
    </View>
  );
  if (alone) return pager;
  return (
    <View {...rootProps(rest)} style={s.outer}>
      <View style={s.choices}>
        {sizes ? (
          <View style={s.choice}>
            <Select
              label={str("rowsPerPage")}
              value={String(size)}
              items={sizes.map((n) => ({ key: String(n), label: String(n) }))}
              onValueChange={(key) => {
                setSize(Number(key));
                if (at !== 1) setCurrent(1);
              }}
            />
          </View>
        ) : null}
        {jump && count > 1 ? (
          <View style={s.choice}>
            <Select
              label={str("goToPage")}
              value={String(at)}
              searchable={count > SEARCHABLE_AFTER}
              items={Array.from({ length: count }, (_, i) => ({ key: String(i + 1), label: String(i + 1) }))}
              onValueChange={(key) => go(Number(key))}
            />
          </View>
        ) : null}
      </View>
      {pager}
    </View>
  );
}
