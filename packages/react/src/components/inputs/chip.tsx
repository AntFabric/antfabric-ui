import { useRef, type CSSProperties } from "react";
import { cap, recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { splitRootProps, type RootProps } from "../../lib/root-props";
import { css, pressable, row, text, truncate } from "../../lib/style";

export type ChipVariant = "filter" | "suggestion" | "object";

/** `id`, `aria-*` and `ref` name the chip's button; `className` and `data-*` go on the root (`splitRootProps`). */
export interface ChipProps extends RootProps<HTMLButtonElement> {
  label: string;
  icon?: IconName;
  /** filter narrows what you are looking at. suggestion is a prompt under the composer. object is a saved thing (a project, a saved search) and is the only chip allowed the brand colour. */
  variant?: ChipVariant;
  /** filter: the chosen filter — ink fill. suggestion: the highlighted prompt — the hover look, never the brand colour. */
  selected?: boolean;
  /** How many are in there — a quiet number after the label, never a brand-coloured badge. 0 draws nothing. */
  count?: number;
  /** Adds a ✕ with its own label ("Remove From: Sam Lee") as a second target. */
  removable?: boolean;
  /** The ✕ was pressed: the chip is gone. In the apps the caller drops the chip from its list on onRemove. */
  removed?: boolean;
  disabled?: boolean;
  /** Called with `selected` as the press leaves it: flipped. */
  onSelectedChange?: (selected: boolean) => void;
  /** The chip was pressed. Its `selected` changes through `onSelectedChange`. */
  onPress?: () => void;
  onRemove?: () => void;
  /** This chip's built-in text (the ✕'s label, the count in its name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["chip"]>;
  /** Per-part styles over the theme: `{ root: {…}, remove: {…} }`. */
  styles?: PartStyles<"chip">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; what the tokens decide (size, fill, edge, ink, type) is the recipe's. */
const root: CSSProperties = {
  ...row,
  alignSelf: "flex-start",
  transition: `background ${t.duration.base}, border-color ${t.duration.base}, color ${t.duration.base}, transform ${t.duration.fast} ${t.ease.out}`,
};

const main: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "stretch",
  flexShrink: 1,
  borderRadius: "inherit",
  whiteSpace: "nowrap",
};

const remove: CSSProperties = {
  ...pressable,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.7,
};

export function Chip({
  label,
  icon = "",
  variant = "filter",
  selected,
  count = 0,
  removable = false,
  removed = false,
  disabled = false,
  onSelectedChange,
  onPress,
  onRemove,
  strings,
  styles,
  style,
  ...rest
}: ChipProps) {
  const s = useStrings("chip", strings);
  const ui = useInteraction({ disabled });
  const x = useInteraction({ disabled });
  const [on = false, setOn] = useControllable(selected, onSelectedChange);
  const [gone, setGone] = useControllable(removed);
  const rootRef = useRef<HTMLDivElement>(null);
  const drop = () => {
    // The chip that has focus is about to unmount: hand focus to its neighbour (the next chip, else the previous, else the row that holds
    // it) before it goes, so a keyboard user is not dropped to the top of the page.
    const me = rootRef.current;
    if (me && me.contains(document.activeElement)) {
      const near = (el: Element | null) => el?.querySelector<HTMLElement>("button:not(:disabled)") ?? null;
      const to = near(me.nextElementSibling) ?? near(me.previousElementSibling);
      if (to) to.focus({ preventScroll: true });
      else if (me.parentElement) {
        const holder = me.parentElement;
        if (!holder.hasAttribute("tabindex")) holder.setAttribute("tabindex", "-1");
        holder.focus({ preventScroll: true });
      }
    }
    setGone(true);
    onRemove?.();
  };
  // The root takes the hover and press of either target, as one chip.
  const hovered = ui.hovered || x.hovered;
  const pressed = ui.pressed || x.pressed;
  // The recipe's `on` is a chosen chip, which keeps its fill under the pointer and a press.
  const r = useRecipe(recipes.chip, {
    variants: { variant, removable },
    state: { hover: hovered && !on, pressed: pressed && !on, focus: ui.focused || x.focused, disabled: ui.disabled, on },
    styles,
  });
  // The ✕ is its own target: its hover and focus are its own, though it sits on the chip's fill.
  const rx = useRecipe(recipes.chip, { variants: { variant }, state: { hover: x.hovered, focus: x.focused, on }, styles });
  if (gone) return null;
  const pass = splitRootProps(rest);
  return (
    <div ref={rootRef} data-af-part="root" {...pass.root} style={css(root, r.root, style)}>
      <button
        type="button"
        data-af-part="main"
        data-af-press
        data-af-focus={ui.focused || undefined}
        aria-pressed={variant === "filter" ? on : undefined}
        aria-label={count > 0 ? s("labelWithCount", { label, count }) : label}
        title={label}
        disabled={ui.disabled}
        onClick={() => {
          setOn(!on);
          onPress?.();
        }}
        onKeyDown={(e) => {
          if (removable && (e.key === "Backspace" || e.key === "Delete")) {
            e.preventDefault();
            drop();
          }
        }}
        {...ui.handlers}
        {...pass.control}
        style={css(main, partStyle(r, "main", ui.disabled && { cursor: "not-allowed" }))}
      >
        {icon && <Icon part="icon" name={icon} style={r.icon} />}
        <span style={css(text, truncate(1), { lineHeight: 1.2 })}>{label}</span>
        {count > 0 && (
          <span aria-hidden data-af-part="count" style={css(text, partStyle(r, "count", { fontVariantNumeric: "tabular-nums" }))}>
            {cap(count, 99)}
          </span>
        )}
      </button>
      {removable && (
        <button
          type="button"
          data-af-part="remove"
          data-af-press
          data-af-focus={x.focused || undefined}
          aria-label={s("remove", { label })}
          title={s("removeTitle")}
          disabled={x.disabled}
          onClick={drop}
          {...x.handlers}
          style={css(remove, partStyle(rx, "remove", (x.hovered || x.focused) && { opacity: 1 }, x.disabled && { cursor: "not-allowed" }))}
        >
          <Icon part="removeIcon" name="x" style={rx.removeIcon} />
        </button>
      )}
    </div>
  );
}
