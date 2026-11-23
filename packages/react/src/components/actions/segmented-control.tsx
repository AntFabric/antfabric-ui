import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { cap, recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, pressable, row, text } from "../../lib/style";

export type SegmentedControlSize = "sm" | "md";

export interface SegmentedControlItem {
  key: string;
  label: string;
  /** How many are in there, never how many need you: a quiet bordered chip, never coral. 0 or missing draws no chip. */
  count?: number;
}

export interface SegmentedControlProps extends RootProps<HTMLDivElement> {
  items: SegmentedControlItem[];
  /** The chosen item's key. A value that matches no item is allowed and draws no card — for a strip whose panel can be closed. */
  value?: string;
  /** md is the 32px pane strip. sm is a 26px strip for a dense rail. */
  size?: SegmentedControlSize;
  /** Stretch the track to its column. Segments share the SPARE width, so a long label keeps its words. */
  full?: boolean;
  /** The track scrolls sideways instead of squeezing, for labels that cannot fit (localised copy, 130% text). */
  scrollable?: boolean;
  /** The strip's accessible name. */
  label?: string;
  onValueChange?: (key: string) => void;
  /** Per-part styles over the theme: `{ track: {…}, card: {…}, tab: {…}, count: {…} }`. */
  styles?: PartStyles<"segmented-control">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["segmented-control"]>;
  style?: CSSProperties;
}

/** Layout and motion no token decides; what the tokens decide (colours, sizes, type, edges) is the recipe's. */
const track: CSSProperties = { ...row, padding: t.space["2xs"], flexShrink: 0 };

const tab: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1,
  whiteSpace: "nowrap",
  flexShrink: 0,
  transition: `color ${t.duration.base} ${t.ease.standard}, background ${t.duration.base} ${t.ease.standard}`,
};

const card: CSSProperties = { position: "absolute", boxSizing: "border-box", pointerEvents: "none" };

const count: CSSProperties = { ...box, alignItems: "center", justifyContent: "center" };

interface SegmentProps {
  item: SegmentedControlItem;
  chosen: boolean;
  /** Draw this segment's own card: before the strip has been measured, the one card cannot slide yet. */
  ownCard: boolean;
  stop: boolean;
  size: SegmentedControlSize;
  full: boolean;
  pick: () => void;
  styles?: PartStyles<"segmented-control">;
  strings?: Partial<KitStrings["segmented-control"]>;
}

function Segment({ item, chosen, ownCard, stop, size, full, pick, styles, strings }: SegmentProps) {
  const s = useStrings("segmented-control", strings);
  const ui = useInteraction();
  const r = useRecipe(recipes["segmented-control"], { variants: { size, full }, state: { on: chosen, hover: ui.hovered, focus: ui.focused }, styles });
  const n = item.count ?? 0;
  return (
    <button
      type="button"
      data-af-press
      role="tab"
      aria-selected={chosen}
      aria-label={n > 0 ? s("labelWithCount", { label: item.label, count: n }) : item.label}
      tabIndex={stop ? 0 : -1}
      onClick={pick}
      {...ui.handlers}
      data-af-part="tab"
      style={css(tab, partStyle(r, "tab", full && { flexGrow: 1, flexShrink: 1, flexBasis: "auto", minWidth: "fit-content" }))}
    >
      {ownCard && <span aria-hidden data-af-part="card" style={css(card, partStyle(r, "card", { inset: t.segmentedControl.cardInset, zIndex: -1 }))} />}
      <span style={css(text, { lineHeight: 1.2, whiteSpace: "nowrap" })}>{item.label}</span>
      {n > 0 && (
        <span aria-hidden data-af-part="count" style={css(count, r.count)}>
          <span style={css(text, { lineHeight: 1, fontVariantNumeric: "tabular-nums" })}>{cap(n, 99)}</span>
        </span>
      )}
    </button>
  );
}

const KEYS: Record<string, (at: number, n: number) => number> = {
  ArrowRight: (at, n) => (at + 1) % n,
  ArrowLeft: (at, n) => (at - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
};

export function SegmentedControl({ items, value, size = "md", full = false, scrollable = false, label = "", onValueChange, styles, strings, style, ...rest }: SegmentedControlProps) {
  const dir = useDirection();
  const r = useRecipe(recipes["segmented-control"], { styles });
  const [current = "", setCurrent] = useControllable(value, onValueChange);
  const at = items.findIndex((i) => i.key === current);

  // ONE card travels between segments. It is measured after mount; until then (and on the server)
  // the chosen segment draws its own card in the same place.
  const ref = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useEffect(() => {
    const strip = ref.current;
    if (!strip) return;
    const measure = () => {
      const el = strip.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      setSlot(el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null);
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(strip);
    return () => watch.disconnect();
  }, [current, items, size, full]);

  const move = (e: KeyboardEvent<HTMLDivElement>) => {
    // Left and right follow the tree's direction: in right-to-left, ArrowRight goes to the previous segment.
    const swap = dir === "rtl" && (e.key === "ArrowLeft" || e.key === "ArrowRight");
    const next = KEYS[swap ? (e.key === "ArrowLeft" ? "ArrowRight" : "ArrowLeft") : e.key];
    if (!next || !items.length) return;
    e.preventDefault();
    const i = next(Math.max(at, 0), items.length);
    setCurrent(items[i]!.key);
    e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')[i]?.focus();
  };

  return (
    <div
      {...rootProps(rest)}
      style={css(
        row,
        { alignItems: "stretch", alignSelf: "flex-start", maxWidth: "100%" },
        full && { alignSelf: "stretch" },
        scrollable && { alignSelf: "stretch", overflowX: "auto", scrollbarWidth: "none" },
        style,
      )}
    >
      <div ref={ref} role="tablist" aria-label={label || undefined} onKeyDown={move} data-af-part="track" style={css(track, partStyle(r, "track", full && { flexGrow: 1 }))}>
        {slot && (
          <span
            aria-hidden
            data-af-part="card"
            style={css(
              card,
              partStyle(r, "card", {
                left: 0,
                top: 0,
                width: slot.w,
                height: slot.h,
                transform: `translate(${slot.x}px, ${slot.y}px)`,
                transition: `transform ${t.duration.slow} ${t.ease.out}, width ${t.duration.slow} ${t.ease.out}`,
              }),
            )}
          />
        )}
        {items.map((item, i) => (
          <Segment
            key={item.key}
            item={item}
            chosen={i === at}
            ownCard={i === at && !slot}
            stop={i === Math.max(at, 0)}
            size={size}
            full={full}
            pick={() => setCurrent(item.key)}
            styles={styles}
            strings={strings}
          />
        ))}
      </div>
    </div>
  );
}
