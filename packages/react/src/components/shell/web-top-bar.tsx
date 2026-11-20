import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { formatShortcut, recipes, useControllable, useStrings, type IconActionItem, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, pressable, row, text, truncate } from "../../lib/style";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";
import { Kbd } from "../display/kbd";
import { rootProps, type RootProps } from "../../lib/root-props";
import { MenuButton } from "./menu-button";

/** An action of the bar: a ghost button with its label while the bar is not `compact` when `showLabel` is on, an icon button otherwise. */
export interface WebTopBarAction extends IconActionItem {
  showLabel?: boolean;
}

export interface WebTopBarProps extends RootProps<HTMLElement> {
  /** False at the first in-app entry of this tab, even when the browser could go further back. */
  canGoBack?: boolean;
  canGoForward?: boolean;
  /** Draws the Recent history button after Back and Forward. */
  history?: boolean;
  /** Draws the search field in the middle (its magnifier alone while `compact`). */
  search?: boolean;
  /** The field's text. Default: the `searchPlaceholder` string. */
  searchPlaceholder?: string;
  /** The palette shortcut shown in the field. `/` is the fallback where the browser keeps Ctrl+K. */
  searchKeys?: string;
  /** Search collapses to its magnifier, a labelled action to its icon and Recent history leaves the bar. The bar does this itself below 768px wide; this forces it at any width. */
  compact?: boolean;
  /** Buttons before the ⋯ menu. */
  actions?: WebTopBarAction[];
  /** Names the banner and the ⋯ menu. */
  workspace?: string;
  /** The ⋯ app menu is open. */
  menuOpen?: boolean;
  /** The nav rail is open (248px with labels). The sidebar button before Back says which way it goes. */
  sidebarExpanded?: boolean;
  /** What the ⋯ button opens, drawn under it while `menuOpen`. */
  menu?: ReactNode;
  /** Transient status at the end of the bar, before the actions. */
  trailing?: ReactNode;
  onSidebarExpandedChange?: (sidebarExpanded: boolean) => void;
  onBack?: () => void;
  onForward?: () => void;
  onHistory?: () => void;
  onSearch?: () => void;
  /** An action was pressed. */
  onAction?: (action: WebTopBarAction) => void;
  onMenuOpenChange?: (menuOpen: boolean) => void;
  /** Per-part styles over the theme: `{ root: {…}, search: {…}, searchSlot: {…} }`. */
  styles?: PartStyles<"web-top-bar">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["web-top-bar"]>;
  style?: CSSProperties;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const root: CSSProperties = {
  ...row,
  width: "100%",
  flexShrink: 0,
  paddingInline: t.space.sm,
  gap: t.space.md,
};

const side: CSSProperties = { ...row, gap: t.space["2xs"], flex: 1 };

/** Below this width the bar compacts itself: the point where a labelled action and a search field no longer fit beside the menu. */
const NARROW = 768; /* structural: the docs' 768px breakpoint */

const search: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  gap: t.space.sm,
  width: "100%",
  paddingLeft: t.space.md,
  paddingRight: t.space["2xs"],
  transition: `border-color ${t.duration.fast}, background ${t.duration.fast}`,
};

/** The ⋯ trigger and what it opens: a positioning box only while there is something to open. */
const menuBox: CSSProperties = { position: "relative", display: "flex", flexDirection: "column" };
const menuAt: CSSProperties = { position: "absolute", top: "100%", right: 0, zIndex: 1 };

function Search({ placeholder, keys, label, hint, onPress, styles }: { placeholder: string; keys: string; label: string; hint: string; onPress: () => void; styles?: PartStyles<"web-top-bar"> }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["web-top-bar"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="search"
      data-af-press
      aria-label={label}
      aria-haspopup="dialog"
      title={hint}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(search, r.search)}
    >
      <Icon part="searchIcon" name="search" size={r.searchIcon.width} style={r.searchIcon} />
      <span style={css(text, truncate(1), { flex: 1, textAlign: "left" })}>{placeholder}</span>
      <Kbd keys={keys} style={{ alignSelf: "center" }} />
    </button>
  );
}

export function WebTopBar({
  canGoBack = true,
  canGoForward = false,
  history = false,
  search: showSearch = false,
  searchPlaceholder = "",
  searchKeys = "Mod+K",
  compact = false,
  actions = [],
  workspace = "",
  menuOpen = false,
  sidebarExpanded = false,
  menu,
  trailing,
  onSidebarExpandedChange,
  onBack,
  onForward,
  onHistory,
  onSearch,
  onAction,
  onMenuOpenChange,
  styles,
  strings,
  style,
  ref: givenRef,
  ...rest
}: WebTopBarProps) {
  const s = useStrings("web-top-bar", strings);
  const { os } = usePlatform();
  const r = useRecipe(recipes["web-top-bar"], { styles });
  const [open, setOpen] = useControllable(menuOpen, onMenuOpenChange);
  const [sidebar, setSidebar] = useControllable(sidebarExpanded, onSidebarExpandedChange);
  const placeholder = searchPlaceholder || s("searchPlaceholder");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  // Below 768px wide the bar compacts itself, so it fits a phone-width window without the app asking.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const watch = () => {
      const w = el.getBoundingClientRect().width;
      setNarrow(w > 0 && w < NARROW);
    };
    watch();
    const ro = new ResizeObserver(watch);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const small = compact || narrow;
  // The menu closes on an outside press, and on Escape with focus back on the button, as a menu button does.
  useEffect(() => {
    if (!open || !menu) return;
    const away = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, !!menu]);
  const closeOnEscape = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !open) return;
    e.stopPropagation();
    setOpen(false);
    triggerRef.current?.focus();
  };
  const trigger = (
    <MenuButton ref={triggerRef} icon="ellipsis" label={workspace ? s("workspaceMenu", { name: workspace }) : s("menu")} open={open} controls={menu ? menuId : undefined} onPress={() => setOpen(!open)} />
  );
  return (
    <header
      ref={(el) => {
        headerRef.current = el;
        if (typeof givenRef === "function") givenRef(el);
        else if (givenRef) (givenRef as { current: HTMLElement | null }).current = el;
      }}
      role="banner"
      aria-label={workspace || undefined}
      data-af-part="root"
      {...rootProps(rest)}
      style={css(root, partStyle(r, "root", small && { gap: t.space["2xs"] }), style)}
    >
      <div style={side}>
        {/* The nav rail's own toggle lives here, outside the rail, where shadcn's sidebar puts its trigger. */}
        <IconButton
          icon={sidebar ? "panel-left-close" : "panel-left-open"}
          label={sidebar ? s("collapseSidebar") : s("expandSidebar")}
          size="sm"
          onPress={() => setSidebar(!sidebar)}
        />
        <div role="group" aria-label={s("history")} style={css(row, { gap: t.space["3xs"] })}>
          <IconButton icon="arrow-left" label={s("back")} size="sm" disabled={!canGoBack} onPress={() => onBack?.()} />
          <IconButton icon="arrow-right" label={s("forward")} size="sm" disabled={!canGoForward} onPress={() => onForward?.()} />
          {history && !narrow ? <IconButton icon="clock" label={s("recentHistory")} size="sm" onPress={() => onHistory?.()} /> : null}
        </div>
      </div>
      {!small && (
        <div data-af-part="searchSlot" style={css(row, { flex: 2, justifyContent: "center" }, r.searchSlot)}>
          {showSearch ? (
            <Search
              placeholder={placeholder}
              keys={searchKeys}
              label={s("searchLabel")}
              hint={s("searchHint", { placeholder, keys: formatShortcut(searchKeys, os) })}
              onPress={() => onSearch?.()}
              styles={styles}
            />
          ) : null}
        </div>
      )}
      <div style={css(side, { justifyContent: "flex-end" })}>
        {small && showSearch ? <IconButton icon="search" label={s("searchLabel")} size="sm" onPress={() => onSearch?.()} /> : null}
        {trailing}
        {actions.map((a) =>
          a.showLabel && !small ? (
            <Button key={a.key} label={a.label} variant="ghost" size="sm" iconLeading={a.icon} disabled={a.disabled} onPress={() => onAction?.(a)} />
          ) : (
            <IconButton key={a.key} icon={a.icon} label={a.label} size="sm" badge={a.badge} disabled={a.disabled} onPress={() => onAction?.(a)} />
          ),
        )}
        {menu ? (
          <div ref={boxRef} style={menuBox} onKeyDown={closeOnEscape}>
            {trigger}
            {open ? <div id={menuId} style={menuAt}>{menu}</div> : null}
          </div>
        ) : (
          trigger
        )}
      </div>
    </header>
  );
}
