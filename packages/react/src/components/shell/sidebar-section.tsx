import { memo, useCallback, useRef, useState, type CSSProperties } from "react";
import { recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, pressable, row, rtl, text, truncate } from "../../lib/style";
import { IconButton } from "../actions/icon-button";
import { Badge } from "../display/badge";
import { rootProps, type RootProps } from "../../lib/root-props";
import { SidebarItem, type SidebarItemProps } from "./sidebar-item";

/** One row: SidebarItem's props and a `key`, but the section decides which row is open (`selected`), a row's press is the section's `onSelectedChange` and its ⋮ the section's `onItemMenu`. */
export type SidebarSectionItem = Omit<SidebarItemProps, "selectedName" | "actionsVisible" | "onPress" | "onMenu"> & {
  /** What `selected`, `onSelectedChange` and `onItemMenu` name the row by. */
  key: string;
};

/** A `selectedName` no row has, so that while another row is selected this one is not open. */
const NOT_OPEN = "\u0000";

export interface SidebarSectionProps extends RootProps<HTMLDivElement> {
  label: string;
  /** Drawn before the label, in the section's accent (a star for Starred). */
  icon?: IconName;
  /** Whether the rows are shown. Collapsed, the header carries the unread total and only the open row stays. */
  expanded?: boolean;
  /** The key of the row that is open. Empty falls back to each item's own `active`; pressing a row sets it. */
  selected?: string;
  /** Unread across the section's rows. Drawn only while collapsed. */
  unread?: number;
  /** The + action's name: 'Add channels', 'New message', 'Add to this section'. Default: the `add` string. */
  addLabel?: string;
  /** Draws + (with `onAdd`) and ⋯ (with `onMenu`), revealed on header hover or focus-within (opacity, so revealing never reflows). */
  actionsVisible?: boolean;
  /** A hairline above the header, parting it from the section before. Off for the first section. */
  divided?: boolean;
  /** Shown when the section has no rows, e.g. Starred before anything is starred. */
  emptyText?: string;
  items?: SidebarSectionItem[];
  onExpandedChange?: (expanded: boolean) => void;
  /** A row was pressed: its `key`. */
  onSelectedChange?: (selected: string) => void;
  /** A row's options were asked for: its ⋮, the context menu on it, or Shift+F10 or the Menu key. Its `key`; the app opens the row's menu from it. */
  onItemMenu?: (key: string) => void;
  onAdd?: () => void;
  onMenu?: () => void;
  /** Per-part styles over the theme: `{ header: {…}, toggle: {…}, list: {…} }`. */
  styles?: PartStyles<"sidebar-section">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["sidebar-section"]>;
  style?: CSSProperties;
}

const header: CSSProperties = { ...row, gap: t.space["2xs"], paddingBottom: t.space["2xs"], paddingLeft: t.space.smMd, paddingRight: t.space.xs };

const toggle: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "center", flex: 1, textAlign: "left", transition: `color ${t.duration.fast}` };

/** A row of the list: memoised, with a press and a menu that name its key through one shared handler each. */
const Row = memo(function Row({ itemKey, item, selectedName, onSelect, onMenu }: { itemKey: string; item: Omit<SidebarSectionItem, "key">; selectedName: string; onSelect: (key: string) => void; onMenu?: (key: string) => void }) {
  return <SidebarItem {...item} selectedName={selectedName} onPress={() => onSelect(itemKey)} onMenu={onMenu ? () => onMenu(itemKey) : undefined} />;
});

export function SidebarSection({
  label,
  icon = "",
  expanded,
  selected,
  unread = 0,
  addLabel = "",
  actionsVisible = true,
  divided = true,
  emptyText = "",
  items = [],
  onExpandedChange,
  onSelectedChange,
  onItemMenu,
  onAdd,
  onMenu,
  styles,
  strings,
  style,
  ...rest
}: SidebarSectionProps) {
  const s = useStrings("sidebar-section", strings);
  const ui = useInteraction();
  const dir = useDirection();
  const r = useRecipe(recipes["sidebar-section"], { variants: { divided }, state: { hover: ui.hovered, focus: ui.focused }, styles });
  const [isOpen = true, setExpanded] = useControllable(expanded, onExpandedChange);
  const shut = !isOpen;
  const [open = "", setOpen] = useControllable(selected, onSelectedChange);
  const [hover, setHover] = useState(false);
  const [within, setWithin] = useState(false);
  const revealed = hover || within || ui.hovered || ui.focused;
  // One handler for every row, so a memoised row is not re-rendered because its sibling was pressed.
  const latest = useRef(setOpen);
  latest.current = setOpen;
  const select = useCallback((key: string) => latest.current(key), []);
  const menuOf = useRef(onItemMenu);
  menuOf.current = onItemMenu;
  const itemMenu = useCallback((key: string) => menuOf.current?.(key), []);
  const shown = items.filter((item) => !shut || (open ? item.key === open : item.active));
  return (
    <div
      role="group"
      aria-label={label}
      data-af-part="root"
      {...rootProps(rest)}
      style={css(box, { width: "100%" }, r.root, style)}
    >
      <div data-af-part="header" style={css(rtl(header, dir), r.header)} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} onFocus={() => setWithin(true)} onBlur={() => setWithin(false)}>
        <button
          type="button"
          data-af-part="toggle"
          data-af-press
          aria-expanded={!shut}
          aria-label={shut && unread > 0 ? s("withUnread", { label, count: unread }) : label}
          title={shut ? s("expand", { label }) : s("collapse", { label })}
          onClick={() => setExpanded(shut)}
          {...ui.handlers}
          style={css(rtl(toggle, dir), r.toggle)}
        >
          <Icon
            part="chevron"
            name="chevron-down"
            size={r.chevron.width}
            style={partStyle(r, "chevron", { transform: shut ? (dir === "rtl" ? "rotate(90deg)" : "rotate(-90deg)") : "rotate(0deg)", transition: `transform ${t.duration.fast} ${t.ease.standard}` })}
          />
          {icon ? <Icon part="starIcon" name={icon} size={r.starIcon.width} style={r.starIcon} /> : null}
          <span style={css(text, truncate(1), { flexShrink: 1 })}>{label}</span>
          {shut && unread > 0 && <Badge count={unread} label={s("unreadIn", { label })} style={{ alignSelf: "center" }} />}
        </button>
        {/* Each is drawn only when it fires something. */}
        {actionsVisible && (onAdd || onMenu) && (
          <div style={css(row, { gap: t.space["3xs"], opacity: revealed ? 1 : 0, transition: `opacity ${t.duration.fast}` })}>
            {onAdd ? <IconButton icon="plus" label={addLabel || s("add")} size="sm" onPress={() => onAdd()} /> : null}
            {onMenu ? <IconButton icon="ellipsis" label={s("options", { label })} size="sm" onPress={() => onMenu()} /> : null}
          </div>
        )}
      </div>
      <div role="list" data-af-part="list" style={css(box, { paddingInline: t.space.sm }, r.list)}>
        {shown.map(({ key, ...item }) => (
          <div role="listitem" key={key} style={box}>
            <Row itemKey={key} item={item} selectedName={open ? (open === key ? item.name : NOT_OPEN) : ""} onSelect={select} onMenu={onItemMenu ? itemMenu : undefined} />
          </div>
        ))}
        {!shut && items.length === 0 && emptyText && (
          <span data-af-part="emptyText" style={css(text, { paddingInline: t.space.smMd, paddingBlock: t.space.xs }, r.emptyText)}>{emptyText}</span>
        )}
      </div>
    </div>
  );
}
