import { memo, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import { cssVarName, recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { useAutoFocus, usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { isComposing } from "../../lib/keys";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, pressable, row, text, truncate } from "../../lib/style";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { joinIds, useFormField } from "./form-field";
import { SearchField } from "./search-field";

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "field" | "chip" | "link";
export type SelectPlacement = "below" | "above";

export interface SelectItem {
  key: string;
  label: string;
  /** Sits muted on the same line. */
  supportingText?: string;
  icon?: IconName;
  /** The icon's tint, as a token: `$info.default`. */
  color?: string;
  /** A photo URL; "" draws initials. Leave it out for no avatar. */
  avatar?: string;
  identity?: AvatarIdentity;
  agent?: boolean;
  disabled?: boolean;
}

export interface SelectProps extends RootProps<HTMLDivElement> {
  items: SelectItem[];
  /** The chosen item's key. */
  value?: string;
  /** Visible label above the trigger, and its accessible name. */
  label?: string;
  /** Shown while nothing is chosen. */
  placeholder?: string;
  /** The name a form posts the chosen key under: the select writes a hidden field with it. */
  name?: string;
  /** sm 32px toolbar · md 36px · lg 44px dialog field. */
  size?: SelectSize;
  /** field is the bordered box. chip is the ticket table's 26px recessed Status control. link has no box: the value and a caret. */
  variant?: SelectVariant;
  /** The panel is open. */
  open?: boolean;
  /** Where the panel opens. The kit also flips it above when the rows would not fit below. */
  placement?: SelectPlacement;
  /** The key of the row under the keyboard / pointer cursor. Empty means the chosen row, which is where the panel opens. */
  activeKey?: string;
  /** A filter box pinned at the top of the panel. */
  searchable?: boolean;
  /** What is in the filter box. items should already be the filtered list. */
  query?: string;
  searchPlaceholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** Why a disabled select is disabled — the one case a native tooltip is the right control. */
  title?: string;
  onValueChange?: (key: string) => void;
  /** The panel opened or closed: by the trigger, a choice, Escape, a press outside or focus leaving. */
  onOpenChange?: (open: boolean) => void;
  /** The filter box's text changed; filter `items` to match. */
  onQueryChange?: (query: string) => void;
  /** This select's built-in text ("Search", the empty messages) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["select"]>;
  /** Per-part styles over the theme: `{ trigger: {…}, panel: {…} }`. */
  styles?: PartStyles<"select">;
  style?: CSSProperties;
}

/** `$info.default` → `var(--af-info-default)`; anything else passes through. */
const tint = (color?: string) => (color ? color.replace(/\$([a-z][\w.-]*)/gi, (_, p: string) => `var(${cssVarName(p)})`) : t.fg.subtle);

/** Layout and motion no token decides; what the tokens decide (size, edge, fill, type) is the recipe's. */
const trigger: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  textAlign: "start",
  transition: `border-color ${t.duration.base}, background ${t.duration.base}, color ${t.duration.base}`,
};

/** `link` has no box: it is as wide as its value. */
const linkWidth: CSSProperties = { width: "auto", alignSelf: "flex-start" };

const panel: CSSProperties = {
  ...box,
  width: "100%",
  overflowY: "auto",
  ...enter("pop"),
};

/* A phone-sized browser gets the phone's own picker: the custom listbox is a desktop-pointer answer. */
const PHONE = "(pointer: coarse) and (max-width: 599px)";
const onPhoneChange = (notify: () => void) => {
  const query = matchMedia(PHONE);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const usePhoneBrowser = () =>
  useSyncExternalStore(
    onPhoneChange,
    () => matchMedia(PHONE).matches,
    () => false,
  );

interface OptionRowProps {
  item: SelectItem;
  id: string;
  /** Under the cursor: the keyboard's or the pointer's row. */
  on: boolean;
  chosen: boolean;
  size: SelectSize;
  variant: SelectVariant;
  styles?: PartStyles<"select">;
  onActive: (key: string) => void;
  onChoose: (item: SelectItem) => void;
}

/** One row. Memoised: moving the cursor redraws the two rows it leaves and enters, not the whole list. */
const OptionRow = memo(function OptionRow({ item, id, on, chosen, size, variant, styles, onActive, onChoose }: OptionRowProps) {
  const o = useRecipe(recipes.select, { variants: { size, variant }, state: { on, disabled: !!item.disabled }, styles });
  return (
    <div
      data-af-part="option"
      id={id}
      role="option"
      // Never in the tab order (the listbox is driven from the trigger or the filter), but a keyboard-focus target all the same.
      tabIndex={-1}
      aria-selected={chosen}
      aria-disabled={item.disabled || undefined}
      title={item.label}
      data-active={on || undefined}
      // Pointer hover moves the same cursor as the arrow keys, so two rows are never lit at once.
      onPointerEnter={() => !item.disabled && onActive(item.key)}
      onClick={() => onChoose(item)}
      style={css(row, { padding: `${t.space.sm} ${t.choice.gap}`, cursor: "pointer" }, partStyle(o, "option", item.disabled && { cursor: "not-allowed" }))}
    >
      {item.avatar !== undefined ? (
        <Avatar name={item.label} src={item.avatar} size="sm" identity={item.identity ?? "indigo"} agent={!!item.agent} />
      ) : (
        item.icon && <Icon part="optionIcon" name={item.icon} style={partStyle(o, "optionIcon", { color: tint(item.color) })} />
      )}
      <span data-af-part="optionLabel" style={css(text, truncate(1), { flexGrow: 1 }, o.optionLabel)}>
        {item.label}
        {item.supportingText && (
          <span data-af-part="supporting" style={o.supporting}>
            {item.supportingText}
          </span>
        )}
      </span>
      {chosen && <span aria-hidden data-af-part="dot" style={partStyle(o, "dot", { flexShrink: 0 })} />}
    </div>
  );
});

export function Select({
  items,
  value,
  label = "",
  placeholder = "",
  name: fieldName,
  size = "md",
  variant = "field",
  open,
  placement = "below",
  activeKey = "",
  searchable = false,
  query,
  searchPlaceholder,
  invalid = false,
  disabled = false,
  title = "",
  onValueChange,
  onOpenChange,
  onQueryChange,
  strings,
  styles,
  style,
  ...rest
}: SelectProps) {
  const s = useStrings("select", strings);
  const own = useId();
  const form = useFormField();
  const id = form?.id ?? own;
  const { platform } = usePlatform();
  const allowFocus = useAutoFocus();
  const phone = usePhoneBrowser() && platform === "web";
  const ui = useInteraction({ disabled });
  const [current = "", setCurrent] = useControllable(value, onValueChange);
  const [isOpen = false, setOpen] = useControllable(open, onOpenChange);
  const [active, setActive] = useControllable(activeKey);
  const [filter = "", setFilter] = useControllable(query, onQueryChange);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [flip, setFlip] = useState(false);

  // Hover applies while the panel is closed (an open one is the feedback). The rows are read apart: each is idle, under the cursor, or disabled.
  const r = useRecipe(recipes.select, {
    variants: { size, variant },
    state: { hover: ui.hovered && !isOpen, focus: ui.focused, invalid: invalid || !!form?.invalid, disabled: ui.disabled },
    styles,
  });

  const chosen = items.find((i) => i.key === current);
  const enabled = items.filter((i) => !i.disabled);
  // The row Enter takes: the one the arrows or the pointer reached, else the chosen one. A filter that left neither in the list falls to
  // its first enabled row, so Enter never takes a row that is not there.
  const reached = active || current;
  const cursor = filter && !enabled.some((i) => i.key === reached) ? (enabled[0]?.key ?? "") : reached;
  const name = label || placeholder;
  // Inside a FormField, with no label of its own, the field's label names the select.
  const labelled = label ? { "aria-label": name } : form ? { "aria-labelledby": form.labelId } : { "aria-label": name };
  const optionId = (i: number) => `${id}-option-${i}`;

  // Opening or closing puts the cursor back on the chosen row: one hovered or arrowed to last time is not where Enter lands.
  const show = (next: boolean) => {
    setActive("");
    setOpen(next);
  };
  const choose = (item: SelectItem) => {
    if (item.disabled) return;
    setCurrent(item.key);
    show(false);
    // The row that was clicked or entered is about to unmount: focus goes back to the trigger, not to the page.
    triggerRef.current?.focus({ preventScroll: true });
  };
  // The rows are memoised, so what they call stays the same function.
  const latest = useRef({ setActive, choose });
  latest.current = { setActive, choose };
  const onActive = useCallback((key: string) => latest.current.setActive(key), []);
  const onChoose = useCallback((item: SelectItem) => latest.current.choose(item), []);

  // Open: a press outside closes it, and it flips above a trigger on screen whose rows would not fit below.
  useEffect(() => {
    if (!isOpen) return setFlip(false);
    const at = triggerRef.current?.getBoundingClientRect();
    const tall = panelRef.current?.offsetHeight ?? 0;
    if (at && at.top >= 0 && at.bottom <= innerHeight) setFlip(placement === "below" && at.bottom + tall > innerHeight && at.top - tall >= 0);
    const away = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setActive("");
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [isOpen, placement, setOpen, setActive]);
  // A searchable select is typed into: focus moves to the filter when the panel opens (never under a host that draws overlays as pictures),
  // and the filter is the combobox, so it names the list it drives and the row the cursor is on.
  useEffect(() => {
    if (!isOpen || !searchable) return;
    const field = panelRef.current?.querySelector<HTMLInputElement>("input");
    if (field && allowFocus) field.focus({ preventScroll: true });
  }, [isOpen, searchable, allowFocus]);
  const activeIndex = items.findIndex((i) => i.key === cursor && !i.disabled);
  useEffect(() => {
    const field = isOpen && searchable ? panelRef.current?.querySelector<HTMLInputElement>("input") : null;
    if (!field) return;
    field.setAttribute("aria-controls", `${id}-list`);
    if (activeIndex >= 0) field.setAttribute("aria-activedescendant", `${id}-option-${activeIndex}`);
    else field.removeAttribute("aria-activedescendant");
  }, [isOpen, searchable, activeIndex, id]);
  // The active row stays in view inside the panel; the page itself never scrolls for it.
  useEffect(() => {
    const p = panelRef.current;
    const r = p?.querySelector<HTMLElement>("[data-active]")?.getBoundingClientRect();
    if (!p || !r) return;
    const frame = p.getBoundingClientRect();
    if (r.top < frame.top) p.scrollTop -= frame.top - r.top;
    else if (r.bottom > frame.bottom) p.scrollTop += r.bottom - frame.bottom;
  }, [isOpen, cursor]);

  /** The listbox's keys, from the trigger and (when searchable) from the filter, which keeps its own Space, Home, End and caret. */
  const keys = (e: KeyboardEvent<HTMLElement>, fromFilter = false) => {
    // An IME's Enter commits its candidate and its Escape cancels it; Enter on the filter's clear button presses the button.
    if (isComposing(e) || (fromFilter && e.key === "Enter" && (e.target as HTMLElement).tagName !== "INPUT")) return;
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        show(true);
      }
      return;
    }
    const at = enabled.findIndex((i) => i.key === cursor);
    const go = (i: number) => {
      e.preventDefault();
      const item = enabled[Math.min(Math.max(i, 0), enabled.length - 1)];
      if (item) setActive(item.key);
    };
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at < 0 ? enabled.length - 1 : at - 1);
    else if (!fromFilter && e.key === "Home") go(0);
    else if (!fromFilter && e.key === "End") go(enabled.length - 1);
    else if (e.key === "Enter" || (!fromFilter && e.key === " ")) {
      e.preventDefault();
      const item = items.find((i) => i.key === cursor);
      if (item) choose(item);
      else {
        show(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    } else if (e.key === "Escape") {
      // Typed text is cleared first (the filter does that); a second Escape closes. Prevented and stopped, so the overlay behind stays.
      if (fromFilter && filter) return;
      e.preventDefault();
      e.stopPropagation();
      show(false);
      triggerRef.current?.focus({ preventScroll: true });
    } else if (e.key === "Tab") {
      // From the trigger, Tab closes. From the filter it moves on, and focus leaving the select closes it.
      if (!fromFilter) show(false);
    } else if (!fromFilter && e.key.length === 1 && !searchable) {
      // Type-ahead: the next enabled row whose label starts with the letter.
      const k = e.key.toLowerCase();
      const order = [...enabled.slice(at + 1), ...enabled.slice(0, at + 1)];
      const hit = order.find((i) => i.label.toLowerCase().startsWith(k));
      if (hit) setActive(hit.key);
    }
  };

  const post = fieldName ? <input type="hidden" name={fieldName} value={current} /> : null;

  if (phone) {
    return (
      <div data-af-part="root" {...rootProps(rest)} style={css(box, { width: "100%" }, r.root, style)}>
        {label && variant === "field" && (
          <label htmlFor={id} data-af-part="label" style={css(text, r.label)}>
            {label}
          </label>
        )}
        <select
          id={id}
          {...labelled}
          aria-invalid={invalid || form?.invalid || undefined}
          aria-required={form?.required || undefined}
          aria-describedby={joinIds(form?.describedBy)}
          title={title || undefined}
          disabled={disabled}
          name={fieldName}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          data-af-part="trigger"
          style={css(trigger, partStyle(r, "trigger", variant === "link" && linkWidth))}
        >
          {!chosen && <option value="">{placeholder}</option>}
          {items.map((item) => (
            <option key={item.key} value={item.key} disabled={item.disabled}>
              {item.supportingText ? `${item.label} · ${item.supportingText}` : item.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const above = placement === "above" || flip;
  return (
    <div
      ref={rootRef}
      data-af-part="root"
      onBlur={(e) => {
        // Focus moved to something outside the select (Tab from the filter): the panel closes. A blur to nowhere (the window) keeps it.
        const to = e.relatedTarget as Node | null;
        if (isOpen && to && !rootRef.current?.contains(to)) show(false);
      }}
      {...rootProps(rest)}
      style={css(box, { width: "100%" }, r.root, style)}
    >
      {label && variant === "field" && (
        <label htmlFor={id} data-af-part="label" style={css(text, r.label)}>
          {label}
        </label>
      )}
      <div style={css(box, { gap: t.space.xs }, above && { flexDirection: "column-reverse" })}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          data-af-press
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? `${id}-list` : undefined}
          aria-activedescendant={isOpen && !searchable && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          {...labelled}
          aria-describedby={joinIds(form?.describedBy)}
          aria-invalid={invalid || form?.invalid || undefined}
          aria-required={form?.required || undefined}
          title={title || undefined}
          disabled={ui.disabled}
          onClick={() => show(!isOpen)}
          onKeyDown={(e) => keys(e)}
          {...ui.handlers}
          data-af-part="trigger"
          style={css(trigger, partStyle(r, "trigger", variant === "link" && linkWidth, ui.disabled && { cursor: "not-allowed" }))}
        >
          {chosen?.icon && <Icon part="icon" name={chosen.icon} style={partStyle(r, "icon", { color: tint(chosen.color) })} />}
          {chosen ? (
            <span style={css(text, truncate(1), { flexGrow: 1 })}>
              {chosen.label}
              {chosen.supportingText && (
                <span data-af-part="supporting" style={r.supporting}>
                  {chosen.supportingText}
                </span>
              )}
            </span>
          ) : (
            <span data-af-part="placeholder" style={css(text, truncate(1), { flexGrow: 1 }, r.placeholder)}>
              {placeholder}
            </span>
          )}
          <Icon part="caret" name="chevron-down" style={r.caret} />
        </button>
        {isOpen && (
          <div
            ref={panelRef}
            data-af-part="panel"
            // A press on the panel's own padding or scrollbar must not take focus away from the filter or the trigger.
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).tagName !== "INPUT") e.preventDefault();
            }}
            style={css(panel, partStyle(r, "panel", variant === "link" && linkWidth))}
          >
            {searchable && (
              <div data-af-part="search" onKeyDown={(e) => keys(e, true)} style={partStyle(r, "search", { paddingBottom: t.space["2xs"] })}>
                <SearchField
                  placeholder={searchPlaceholder ?? s("searchPlaceholder")}
                  value={filter}
                  focused
                  onValueChange={(next) => {
                    // A new filter is a new list: the cursor goes back to the chosen row, or the first one left.
                    setFilter(next);
                    setActive("");
                  }}
                />
              </div>
            )}
            <div id={`${id}-list`} role="listbox" aria-label={name} style={box}>
              {!items.length && (
                <span data-af-part="empty" style={css(text, { padding: "10px 11px" }, r.empty)}>
                  {filter ? s("emptyFiltered", { filter }) : s("empty")}
                </span>
              )}
              {items.map((item, i) => (
                <OptionRow
                  key={item.key}
                  item={item}
                  id={optionId(i)}
                  on={item.key === cursor && !item.disabled}
                  chosen={item.key === current}
                  size={size}
                  variant={variant}
                  styles={styles}
                  onActive={onActive}
                  onChoose={onChoose}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {post}
    </div>
  );
}
