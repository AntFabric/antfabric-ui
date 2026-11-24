import { useState, type CSSProperties, type ElementType, type KeyboardEvent, type MouseEvent } from "react";
import { menuItemKey, recipes, useDirection, useStrings, type KitStrings, type MenuItem } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useCoarsePointer, useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, pressable, rtl, text, truncate } from "../../lib/style";
import { useOverlayFocus } from "../../lib/focus";
import { isComposing } from "../../lib/keys";
import { rootProps, type RootProps } from "../../lib/root-props";
import { useRovingKeys } from "../../lib/roving";
import { IconButton } from "../actions/icon-button";
import { Kbd, ariaShortcut } from "../display/kbd";

export type MenuPlacement = "below" | "above";

/** A row of the menu: the shape is core's, shared with ContextMenu, AppMenuBar and TrayMenu. */
export type { MenuItem };

/**
 * What this Menu draws beyond core's shape (core's `MenuItem` is not extended): a row that navigates, and a choice among several.
 * `submenu` is read by AppMenuBar and TrayMenu; this menu does not open one.
 */
export interface MenuRowItem extends MenuItem {
  /** The row navigates: it is an `<a href role="menuitem">`, so middle-click and ⌘-click open a new tab. A plain click calls `onSelect`. */
  href?: string;
  /** A one-of-many row (with `checked`): role `menuitemradio` instead of `menuitemcheckbox`. */
  radio?: boolean;
}

export interface MenuProps extends RootProps<HTMLDivElement> {
  /** The menu's accessible name. */
  label?: string;
  items?: MenuRowItem[];
  /** Panel width. */
  width?: number;
  /** Draws the ⋮ that opened the menu, so the panel is seen hanging from it. */
  showTrigger?: boolean;
  triggerIcon?: IconName;
  triggerLabel?: string;
  /** above is what the app picks when there is no room under the trigger. */
  placement?: MenuPlacement;
  /** Rows only, no card: for a sheet or another surface that lists the same rows. */
  bare?: boolean;
  /** The key (else the label) of the checkable row just pressed: its check is drawn flipped from what `items` says until the caller's `checked` catches up. */
  toggled?: string;
  /** A row was chosen. For a toggle row the caller flips its `checked`. */
  onSelect?: (item: MenuItem) => void;
  onClose?: () => void;
  /** Focus moves to the first enabled row when the menu mounts, and back to what had it when it unmounts. Off for rows a surface that already took focus lists. A tree under `autoFocus={false}` never moves focus in. */
  autoFocus?: boolean;
  /** Per-part styles over the theme: `{ panel: {…}, row: {…}, icon: {…} }`. */
  styles?: PartStyles<"menu">;
  /** This menu's built-in text (the trigger's name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["menu"]>;
  style?: CSSProperties;
}

const ROWS = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';

/** The layout and the motion no token decides; what the tokens decide is the recipe's. */
const panelLook: CSSProperties = { ...box };

// A long menu (members, labels) scrolls inside the viewport instead of running off it.
const scrolling: CSSProperties = { maxHeight: "80vh", overflowY: "auto" };

const bareLook: CSSProperties = { border: 0, borderRadius: 0 };

const rowLook: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  gap: t.space.sm,
  paddingBlock: t.space.xs,
  paddingInline: t.space.sm,
  textAlign: "left",
  transition: `background ${t.motion.duration.fast}`,
};

const tickBox: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  flexShrink: 0,
  transition: `background ${t.motion.duration.base}, border-color ${t.motion.duration.base}`,
};

/**
 * `toggled` flips one checkable row from what `items` says. A press flips the row it lands on (or
 * back), and the flip lapses once the caller's own `checked` changes, so a caller that owns the
 * value is never drawn double-flipped.
 */
function useFlip(toggled: string) {
  const [flip, setFlip] = useState<{ key: string; was?: boolean }>({ key: toggled });
  const [seed, setSeed] = useState(toggled);
  if (seed !== toggled) {
    setSeed(toggled);
    setFlip({ key: toggled });
  }
  const on = (item: MenuItem) => {
    const flipped = flip.key !== "" && menuItemKey(item) === flip.key && (flip.was === undefined || flip.was === item.checked);
    return flipped ? !item.checked : !!item.checked;
  };
  const press = (item: MenuItem) => setFlip(flip.key === menuItemKey(item) ? { key: "" } : { key: menuItemKey(item), was: item.checked });
  return { on, press };
}

/** "Files, None" · "Mute channel, No badges unless someone @mentions you" */
const spoken = (item: MenuItem) => `${item.label ?? ""}${item.count != null ? `, ${item.count}` : ""}${item.sublabel ? `, ${item.sublabel}` : ""}`;

function MenuRow({ item, checked, coarse, tabbable, styles, onPress }: { item: MenuRowItem; checked: boolean; coarse: boolean; tabbable: boolean; styles?: PartStyles<"menu">; onPress: () => void }) {
  const { platform, shortcutOs } = usePlatform();
  const dir = useDirection();
  const ui = useInteraction({ disabled: item.disabled });
  const toggle = typeof item.checked === "boolean";
  const danger = item.tone === "danger";
  const part = danger ? "rowDanger" : "row";
  const r = useRecipe(recipes.menu, { state: { hover: ui.hovered, focus: ui.focused, pressed: ui.pressed, disabled: ui.disabled, on: checked }, styles });
  const keys = platform === "web" && item.webShortcut != null ? item.webShortcut : item.shortcut;
  const anchor = !!item.href && !item.disabled;
  const Row = (anchor ? "a" : "button") as ElementType;
  return (
    <Row
      type={anchor ? undefined : "button"}
      href={anchor ? item.href : undefined}
      data-af-part={part}
      data-af-press
      role={toggle ? (item.radio ? "menuitemradio" : "menuitemcheckbox") : "menuitem"}
      aria-keyshortcuts={keys ? ariaShortcut(keys, shortcutOs) : undefined}
      aria-checked={toggle ? checked : undefined}
      // Disabled rows stay reachable by the arrows so a screen reader can say why.
      aria-disabled={item.disabled || undefined}
      aria-label={spoken(item)}
      title={item.label}
      tabIndex={tabbable ? 0 : -1}
      onClick={(e: MouseEvent) => {
        if (ui.disabled) return e.preventDefault();
        // ⌘-, ctrl- and middle-click on a link are the browser's; a plain click is the product's.
        if (anchor && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
        if (anchor) e.preventDefault();
        onPress();
      }}
      // A link takes Enter by itself; Space, which every other row takes, it has to be given (and kept from scrolling the page).
      onKeyDown={
        anchor
          ? (e: KeyboardEvent) => {
              if (e.key !== " " || isComposing(e)) return;
              e.preventDefault();
              onPress();
            }
          : undefined
      }
      {...ui.handlers}
      style={css(rtl(rowLook, dir), partStyle(r, part, { alignItems: item.sublabel ? "flex-start" : "center" }, coarse && { minHeight: t.menu.rowHeightCoarse }, ui.disabled && { cursor: "default" }))}
    >
      {item.icon && <Icon part="icon" name={item.icon} style={partStyle(r, "icon", { marginTop: item.sublabel ? 1 : 0 })} />}
      <span data-af-part="text" style={css(box, { flex: 1, minWidth: 0 }, r.text)}>
        <span data-af-part="label" style={css(text, truncate(1), r.label)}>
          {item.label}
        </span>
        {item.sublabel && (
          <span data-af-part="sublabel" style={css(text, truncate(1), r.sublabel)}>
            {item.sublabel}
          </span>
        )}
      </span>
      {item.count != null && (
        <span aria-hidden data-af-part="count" style={css(text, { whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }, r.count)}>
          {item.count}
        </span>
      )}
      {keys && <Kbd keys={keys} tone="bare" style={rtl({ marginLeft: t.space.sm }, dir)} />}
      {toggle && (
        <span aria-hidden data-af-part="tick" style={css(tickBox, r.tick)}>
          {checked && <Icon part="tickIcon" name="check" style={partStyle(r, "tickIcon", { strokeWidth: t.size.stroke.tick, ...enter("pop"), transformOrigin: "center" })} />}
        </span>
      )}
    </Row>
  );
}

export function Menu({
  label,
  items = [],
  width = 240,
  showTrigger = false,
  triggerIcon = "ellipsis-vertical",
  triggerLabel,
  placement = "below",
  bare = false,
  toggled = "",
  onSelect,
  onClose,
  autoFocus = true,
  styles,
  strings,
  style,
  ref,
  ...rest
}: MenuProps) {
  const s = useStrings("menu", strings);
  // A finger on a touch laptop gets 40px rows and the phone's 6px panel padding.
  const coarse = useCoarsePointer();
  const r = useRecipe(recipes.menu, { variants: { bare }, styles });
  const flip = useFlip(toggled);
  const isRow = (item: MenuItem) => item.type !== "separator" && item.type !== "label";
  const firstEnabled = items.findIndex((item) => isRow(item) && !item.disabled);

  // The focus contract: focus moves to the first enabled row when the menu mounts (from a click as well as from the keyboard), Esc closes
  // it (and stops there, so a dialog under it keeps its own), and focus goes back to what had it when it unmounts.
  const focus = useOverlayFocus<HTMLDivElement>({
    initial: autoFocus ? (panel) => panel.querySelector<HTMLElement>(`${ROWS.split(",").map((q) => `${q}:not([aria-disabled="true"])`).join(",")}`) : false,
    onEscape: () => onClose?.(),
  });
  // Arrows, Home, End and typeahead are the shared roving keys; a disabled row stays reachable, so a screen reader can say why.
  const roving = useRovingKeys<HTMLDivElement>({ items: ROWS, orientation: "vertical", typeahead: true });
  const keyboard = (e: KeyboardEvent) => {
    if (roving.onKeyDown(e)) return;
    focus.onKeyDown(e);
    if (e.key === "Tab") onClose?.();
  };

  const trigger = showTrigger && !bare && <IconButton icon={triggerIcon} label={triggerLabel ?? s("moreActions")} active aria-haspopup="menu" aria-expanded onPress={() => onClose?.()} style={{ alignSelf: "flex-end" }} />;
  return (
    <div style={css(box, { alignItems: "flex-end", gap: t.space["2xs"], alignSelf: bare ? "stretch" : "flex-start" }, style)}>
      {placement === "below" && trigger}
      <div
        ref={(el) => {
          focus.ref.current = el;
          roving.ref.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        role="menu"
        data-af-part="panel"
        aria-label={label}
        {...rootProps(rest)}
        onKeyDown={keyboard}
        style={css(
          panelLook,
          partStyle(
            r,
            "panel",
            { width: bare ? "100%" : width, padding: bare ? 0 : coarse ? t.space.xs : t.space["2xs"] },
            bare && bareLook,
            !bare && scrolling,
            // The rows inside a sheet or a context menu arrive with that surface.
            !bare && enter("pop"),
            !bare && { transformOrigin: placement === "above" ? "bottom right" : "top right" },
          ),
        )}
      >
        {items.map((item, i) => {
          if (item.type === "separator") return <div key={i} role="separator" data-af-part="separator" style={partStyle(r, "separator", { flexShrink: 0, marginBlock: t.space["2xs"] })} />;
          if (item.type === "label")
            return (
              <div
                key={i}
                role="presentation"
                data-af-part="section"
                style={css(text, { paddingInline: t.space.sm, paddingTop: t.space.xs, paddingBottom: t.space["2xs"] }, r.section)}
              >
                {item.label}
              </div>
            );
          return (
            <MenuRow
              key={i}
              item={item}
              checked={flip.on(item)}
              coarse={coarse}
              tabbable={i === firstEnabled}
              styles={styles}
              onPress={() => {
                if (typeof item.checked === "boolean") flip.press(item);
                onSelect?.(item);
              }}
            />
          );
        })}
      </div>
      {placement === "above" && trigger}
    </div>
  );
}
