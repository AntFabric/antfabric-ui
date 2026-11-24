import { useEffect, useId, useRef, type CSSProperties } from "react";
import { cap, recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, pressable, row, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { useRovingKeys } from "../../lib/roving";

export interface TabsItem {
  key: string;
  label: string;
  /** A count chip after the label; 0 draws none. Over 99 reads 99+. */
  badge?: number;
  /** The count is a floor: drawn as `100+`, said as "more than 100". */
  badgeMore?: boolean;
  /** The scope, for a label that does not say it ("Files shared in this channel"); the native tooltip. */
  title?: string;
  /** Drawn dimmed and skipped by the arrows and by a press; it stays in the strip so its place is seen. */
  disabled?: boolean;
}

export interface TabsProps extends RootProps<HTMLDivElement> {
  items: TabsItem[];
  /** The chosen tab's key. Empty, or a key no tab has, chooses none: no bar, and Tab lands on the first enabled tab. */
  value?: string;
  /** The tabs share the width between them. */
  full?: boolean;
  /** The hairline under the strip. Off when the strip sits on a header that already has one. */
  rule?: boolean;
  /** The tab list's accessible name. */
  label?: string;
  /** The product draws a `role="tabpanel"` for each tab with the id `<id>-panel-<key>` (and `aria-labelledby` the tab's `<id>-tab-<key>`): the tabs then name it in `aria-controls`. `<id>` is the strip's `id`, or a generated one when it has none. */
  panels?: boolean;
  onValueChange?: (key: string) => void;
  /** Per-part styles over the theme: `{ root: {…}, tab: {…}, count: {…}, indicator: {…} }`. */
  styles?: PartStyles<"tabs">;
  /** This strip's built-in text (a count's spoken and written forms) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["tabs"]>;
  style?: CSSProperties;
}

function Tab({ item, id, controls, on, tabbable, full, styles, strings, onPress }: { item: TabsItem; id: string; controls?: string; on: boolean; tabbable: boolean; full: boolean; styles?: PartStyles<"tabs">; strings?: Partial<KitStrings["tabs"]>; onPress: () => void }) {
  const s = useStrings("tabs", strings);
  const ui = useInteraction({ disabled: item.disabled });
  const n = item.badge ?? 0;
  // Hover only moves a tab that is not the chosen one.
  const r = useRecipe(recipes.tabs, { state: { on, hover: ui.hovered && !on, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="tab"
      data-af-press
      id={id}
      data-af-key={item.key}
      role="tab"
      aria-selected={on}
      aria-controls={controls}
      aria-disabled={item.disabled || undefined}
      aria-label={n > 0 ? (item.badgeMore ? s("labelWithCountMore", { label: item.label, count: n }) : s("labelWithCount", { label: item.label, count: n })) : item.label}
      title={item.title}
      // Only one tab is a Tab stop (the chosen one, else the first enabled); the arrows move between the rest.
      tabIndex={tabbable ? 0 : -1}
      onClick={() => !item.disabled && onPress()}
      {...ui.handlers}
      style={css(
        pressable,
        row,
        {
          justifyContent: "center",
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: `color ${t.motion.duration.base} ${t.motion.easing.standard}`,
        },
        partStyle(r, "tab", full && { flexGrow: 1 }, item.disabled && { opacity: t.opacity.disabled, cursor: "not-allowed" }),
      )}
    >
      <span style={css(text, { lineHeight: 1.2 })}>{item.label}</span>
      {n > 0 && (
        <span aria-hidden data-af-part="count" style={css(row, { justifyContent: "center" }, r.count)}>
          <span style={{ lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{item.badgeMore ? s("countMore", { count: n }) : cap(n, 99)}</span>
        </span>
      )}
      <span
        aria-hidden
        data-af-part="indicator"
        style={partStyle(r, "indicator", {
          position: "absolute",
          pointerEvents: "none",
          transform: on ? "scaleX(1)" : "scaleX(0)",
          opacity: on ? 1 : 0,
          transition: `transform ${t.motion.duration.base} ${t.motion.easing.out}, opacity ${t.motion.duration.base}`,
        })}
      />
    </button>
  );
}

export function Tabs({ items, value, full = false, rule = true, label, panels = false, onValueChange, styles, strings, style, ref, ...rest }: TabsProps) {
  const [chosen = "", setChosen] = useControllable(value, onValueChange);
  const made = useId();
  const base = rest.id ?? made;
  // A value that matches no tab chooses none (a strip whose panel is closed): nothing is chosen for the app, a disabled tab least of all.
  const current = items.some((i) => i.key === chosen) ? chosen : undefined;
  // One tab stop: the chosen tab, else the first enabled one, so the strip is reachable with none chosen.
  const stop = current ?? items.find((i) => !i.disabled)?.key;
  // Arrows follow the tree's direction (the tab before is on the right in rtl) and skip disabled tabs; moving selects.
  const keys = useRovingKeys<HTMLDivElement>({
    items: '[role="tab"]',
    orientation: "horizontal",
    skip: '[aria-disabled="true"]',
    onMove: (el) => {
      const key = el.getAttribute("data-af-key");
      if (key !== null) setChosen(key);
    },
  });
  // A long strip scrolls the chosen tab into view when it changes, so it is never left off the edge.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    keys.ref.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView?.({ inline: "nearest", block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // The recipe is read with the strip's own props; the phone's `rule` variant is the phone's.
  const r = useRecipe(recipes.tabs, { variants: { rule }, styles });
  return (
    <div
      ref={(el) => {
        keys.ref.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      role="tablist"
      aria-label={label}
      {...rootProps(rest)}
      onKeyDown={(e) => void keys.onKeyDown(e)}
      data-af-part="root"
      style={css(
        row,
        {
          alignItems: "stretch",
          alignSelf: "stretch",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
        },
        // Vocabulary gap: one inset edge, which `ring` (all four sides) cannot say.
        partStyle(r, "root", { boxShadow: rule ? `inset 0 -1px 0 ${t.color.border.subtle}` : "none" }),
        style,
      )}
    >
      {items.map((item) => (
        <Tab
          key={item.key}
          item={item}
          id={`${base}-tab-${item.key}`}
          controls={panels ? `${base}-panel-${item.key}` : undefined}
          on={item.key === current}
          tabbable={item.key === stop}
          full={full}
          styles={styles}
          strings={strings}
          onPress={() => setChosen(item.key)}
        />
      ))}
    </div>
  );
}
