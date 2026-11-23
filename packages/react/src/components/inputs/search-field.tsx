import { useRef, type CSSProperties } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, Spinner } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { isComposing } from "../../lib/keys";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { css, input, pressable, row, text, truncate } from "../../lib/style";
import { IconButton } from "../actions/icon-button";
import { Kbd } from "../display/kbd";
import { joinIds, useFormField } from "./form-field";

export interface SearchFieldProps extends RootProps<HTMLDivElement> {
  /** What is in the box. The field reports every change, and the ✕ through onClear. */
  value?: string;
  /** Say what is searched, not "Search" — the field is the only hint of what a screen holds. */
  placeholder?: string;
  /** Accessible name when it should differ from the placeholder. Falls back to the placeholder. */
  label?: string;
  /** A key that focuses or opens this search, written once as Mod+K or /. Shown on hover and focus while the field is empty. */
  shortcut?: string;
  /** A search is in flight: the glass becomes a spinner. Off for instant filtering. */
  busy?: boolean;
  /** Mark the edge while the field holds text — for a box narrowing a list you can see. */
  accent?: boolean;
  /** Draw the field as a button that opens the command palette, like the desktop nav rail. */
  launcher?: boolean;
  /** Draws the focused look (edge and shortcut hint) without real focus. */
  focused?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  /** launcher only — opens the command palette. */
  onPress?: () => void;
  /** This field's built-in text (the clear button's label) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["search-field"]>;
  /** Per-part styles over the theme: `{ root: {…}, input: {…}, clear: {…} }`. */
  styles?: PartStyles<"search-field">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; what the tokens decide (size, fill, edge, type) is the recipe's. */
const root: CSSProperties = {
  ...row,
  width: "100%",
  cursor: "text",
  transition: `border-color ${t.duration.base}, background ${t.duration.base}`,
};

// The focused edge is the border plus an outline drawn inside it (a -2 offset, which no token names).
const focusOffset: CSSProperties = { outlineOffset: -2 };

export function SearchField({
  value,
  placeholder = "",
  label = "",
  shortcut = "",
  busy = false,
  accent = false,
  launcher = false,
  focused = false,
  disabled = false,
  onValueChange,
  onClear,
  onSubmit,
  onPress,
  strings,
  styles,
  style,
  ...rest
}: SearchFieldProps) {
  const s = useStrings("search-field", strings);
  const form = useFormField();
  const ui = useInteraction({ disabled });
  const [query = "", setQuery] = useControllable(value, onValueChange);
  const name = label || placeholder;
  // Inside a FormField, with no name of its own, the field's label names it.
  const named = name ? { "aria-label": name } : form ? { "aria-labelledby": form.labelId } : {};
  const isFocused = focused || ui.focused;
  const inputRef = useRef<HTMLInputElement>(null);
  const clear = () => {
    setQuery("");
    onClear?.();
    // The clear button goes away with the text: focus goes to the field, not to the page.
    inputRef.current?.focus({ preventScroll: true });
  };
  const r = useRecipe(recipes["search-field"], { state: { on: accent && !!query, hover: ui.hovered && !isFocused, focus: isFocused, disabled: ui.disabled }, styles });
  return (
    <div
      data-af-part="root"
      {...ui.handlers}
      {...rootProps(rest)}
      style={css(root, partStyle(r, "root", isFocused && focusOffset, launcher && { cursor: "pointer" }, ui.disabled && { cursor: "not-allowed" }), style)}
    >
      {busy ? <Spinner part="spinner" label={s("loading")} style={r.spinner} /> : <Icon part="icon" name="search" style={r.icon} />}
      {launcher ? (
        <span data-af-part="launcherLabel" style={css(text, truncate(1), { flexGrow: 1 }, r.launcherLabel)}>
          {placeholder}
        </span>
      ) : (
        <input
          ref={inputRef}
          id={form?.id}
          data-af-input
          type="text"
          role="searchbox"
          {...named}
          aria-busy={busy || undefined}
          aria-invalid={form?.invalid || undefined}
          aria-required={form?.required || undefined}
          aria-describedby={joinIds(form?.describedBy)}
          placeholder={placeholder}
          value={query}
          disabled={ui.disabled}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // An IME's Enter commits its candidate and its Escape cancels it: neither submits nor clears.
            if (isComposing(e)) return;
            if (e.key === "Enter") onSubmit?.();
            // Escape clears first, and stops there (the overlay around the field stays); the second press blurs and goes on to it.
            if (e.key === "Escape") {
              if (query) {
                e.preventDefault();
                e.stopPropagation();
                clear();
              } else e.currentTarget.blur();
            }
          }}
          data-af-part="input"
          style={css(input, { flexGrow: 1, alignSelf: "stretch" }, r.input)}
        />
      )}
      {!launcher && query && <IconButton part="clear" icon="x" label={s("clearSearch")} size="sm" disabled={ui.disabled} onPress={() => clear()} style={partStyle(r, "clear", { flexShrink: 0 })} />}
      {/* The hint holds its box at rest, so the placeholder never stretches into its space. */}
      {shortcut && !query && <Kbd keys={shortcut} style={{ flexShrink: 0, opacity: isFocused || ui.hovered ? 1 : 0, transition: `opacity ${t.duration.fast}` }} />}
      {launcher && (
        <button
          type="button"
          data-af-press
          aria-label={name}
          title={name}
          aria-haspopup="dialog"
          disabled={ui.disabled}
          onClick={() => onPress?.()}
          data-af-part="launcher"
          style={css(pressable, { position: "absolute", borderRadius: "inherit", zIndex: 1 }, partStyle(r, "launcher", ui.disabled && { cursor: "not-allowed" }))}
        />
      )}
    </div>
  );
}
