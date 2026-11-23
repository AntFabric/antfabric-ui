import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MutableRefObject, type ReactNode } from "react";
import { menuItemKey, recipes, useControllable, useDirection, useStrings, type KitStrings, type MenuItem } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, glass, pressable, row, rtl, text, truncate } from "../../lib/style";
import { IconButton } from "../actions/icon-button";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { Kbd } from "../display/kbd";
import { useRovingKeys } from "../../lib/roving";
import { rootProps, type RootProps } from "../../lib/root-props";

/** An entry in a desktop menu: a `MenuItem` (its `submenu` is drawn only as a chevron). `os` limits it to macOS (`mac`) or to Windows and Linux (`other`). */
export interface AppMenuBarItem extends MenuItem {
  os?: "mac" | "other";
}

/** One menu of the bar, with the entries it opens. */
export interface AppMenuBarMenu {
  /** What `openMenu` matches. */
  key: string;
  /** The title in the bar (macOS) or the row (Windows, Linux). */
  label: string;
  items?: AppMenuBarItem[];
}

/** An entry in the web ⋯ menu: a `MenuItem`, or `type: "scheme"` for the Light / Dark / System row. `trailingIcon` ends the row. */
export type AppMenuBarWebItem = Omit<MenuItem, "type"> & { type?: MenuItem["type"] | "scheme"; trailingIcon?: IconName };

export type AppMenuBarColorScheme = "light" | "dark" | "system";

export interface AppMenuBarProps extends RootProps<HTMLDivElement> {
  /** Menus, left to right. The first is the app menu on macOS and names the bar; Windows and Linux skip it. */
  menus?: AppMenuBarMenu[];
  /** The key of the menu drawn open. Empty: none on macOS and Windows, the main list on Linux. */
  openMenu?: string;
  /** The key (else the label) of the entry under the pointer or keyboard focus, for a static snapshot. */
  highlight?: string;
  /** Names the web menu and its trigger. Empty draws no header row. */
  workspace?: string;
  host?: string;
  /** The workspace tile's colour in the web menu's header. */
  workspaceIdentity?: AvatarIdentity;
  webItems?: AppMenuBarWebItem[];
  colorScheme?: AppMenuBarColorScheme;
  /** The macOS picture's clock, at the right of the bar. Empty draws none. */
  clock?: string;
  onSelect?: (item: AppMenuBarItem | AppMenuBarWebItem) => void;
  onOpenMenuChange?: (openMenu: string) => void;
  onColorSchemeChange?: (colorScheme: AppMenuBarColorScheme) => void;
  /** Per-part styles over the theme: `{ row: {…}, dropdown: {…}, webItem: {…} }`. */
  styles?: PartStyles<"app-menu-bar">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["app-menu-bar"]>;
  style?: CSSProperties;
}

type Desk = "mac" | "windows" | "linux";

const ROOT_OS: Record<string, CSSProperties> = {
  mac: { minHeight: 300 }, /* structural: stage height that lets the open menu show */
  windows: { minHeight: 330 }, /* structural: stage height that lets the open menu show */
  linux: { minHeight: 330 }, /* structural: stage height that lets the open menu show */
  browser: { minHeight: 470, alignItems: "flex-end" }, /* structural: stage height that lets the open menu show */
};

/** The layout no token decides; what the tokens decide is the recipe's. */
const separator: CSSProperties = { flexShrink: 0, marginBlock: t.space["2xs"], marginInline: t.space.xs };

/* ---------- desktop rows: the macOS dropdown, the Windows ☰ panel and cascade, the GNOME popover ---------- */

const ROW_OS: Record<Desk, CSSProperties> = {
  mac: { paddingInline: t.space.xs },
  windows: { paddingInline: t.space.sm },
  linux: { paddingInline: t.space.sm },
};

const rowBase: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "center", flexShrink: 0, gap: t.space.xs, width: "100%", whiteSpace: "nowrap" };

const itemLabel: CSSProperties = css(text, truncate(1), { flex: 1, textAlign: "left" });

/** A long menu scrolls inside the window instead of running off it. */
const scrolls: CSSProperties = { maxHeight: "80vh", overflowY: "auto" };

/** Where focus goes when a menu has just opened, or when one closes: the app moves it so a keyboard user is not left on the page. */
type Focus = { focus: "first" | "last" } | { focus: "entry"; key: string };
type Pending = MutableRefObject<Focus | null>;

const ROWS = '[role="menuitem"]';
const NESTED_ROWS = '[role="menu"] [role="menu"] [role="menuitem"]';
const TITLES = '[data-af-part="title"], [data-af-part="appTitle"]';

/** Focus the first or last entry of the open menu `key` (the entries of its own menu, not of one nested in it). */
function focusRows(root: HTMLElement | null, key: string, how: "first" | "last"): void {
  const menu = root?.querySelector<HTMLElement>(`[role="menu"][data-af-menu="${key}"]`) ?? root?.querySelector<HTMLElement>('[data-af-part="panel"]');
  const rows = Array.from(menu?.querySelectorAll<HTMLElement>(ROWS) ?? []);
  (how === "first" ? rows[0] : rows[rows.length - 1])?.focus();
}

interface RowProps {
  desk: Desk;
  label: string;
  /** Drawn under the pointer: the `highlight` snapshot, or the open entry of a cascade. */
  lit?: boolean;
  disabled?: boolean;
  /** Opens a menu of its own. */
  popup?: boolean;
  expanded?: boolean;
  /** The menu this row opens (`popup`), so focus can come back to the row. */
  menuKey?: string;
  /** The menu's one tab stop. The others are reached with the arrows. */
  tab?: boolean;
  /** `byKeyboard` is true when Enter or Space made the press, so the menu it opens can take focus. */
  onPress: (byKeyboard: boolean) => void;
  styles?: PartStyles<"app-menu-bar">;
  children: (lit: boolean) => ReactNode;
}

function MenuRow({ desk, label, lit = false, disabled = false, popup = false, expanded, menuKey, tab = false, onPress, styles, children }: RowProps) {
  const ui = useInteraction({ disabled });
  const dir = useDirection();
  // A menu highlights the entry under the pointer and the one keyboard focus is on alike.
  const on = !ui.disabled && (lit || ui.hovered || ui.focused);
  const r = useRecipe(recipes["app-menu-bar"], { state: { on, pressed: ui.pressed, disabled: ui.disabled, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="row"
      data-af-menu={menuKey}
      data-af-press
      role="menuitem"
      tabIndex={tab ? 0 : -1}
      aria-label={label}
      aria-haspopup={popup ? "menu" : undefined}
      aria-expanded={popup ? expanded : undefined}
      // Disabled entries stay focusable and are announced as dimmed.
      aria-disabled={ui.disabled || undefined}
      onClick={(e) => !ui.disabled && onPress(e.detail === 0)}
      {...ui.handlers}
      style={css(rtl(rowBase, dir), ROW_OS[desk], partStyle(r, "row", ui.disabled && { cursor: "default" }))}
    >
      {children(on)}
    </button>
  );
}

function Entries({ desk, items, highlight, onChoose, styles, tabFirst = false }: { desk: Desk; items: AppMenuBarItem[]; highlight: string; onChoose: (item: AppMenuBarItem) => void; styles?: PartStyles<"app-menu-bar">; tabFirst?: boolean }) {
  const mac = desk === "mac";
  const dir = useDirection();
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  return items
    // A heading row (`type: "label"`) has no place in a system menu.
    .filter((item) => item.type !== "label" && (!item.os || (item.os === "mac") === mac))
    .map((item, i) =>
      item.type === "separator" ? (
        <div key={i} role="separator" data-af-part="separator" style={css(separator, r.separator)} />
      ) : (
        <MenuRow key={i} desk={desk} label={item.label ?? ""} lit={menuItemKey(item) === highlight} disabled={item.disabled} tab={tabFirst && i === 0} onPress={() => onChoose(item)} styles={styles}>
          {(on) => (
            <>
              <Icon part="entryIcon" name="check" size={r.entryIcon.width} style={partStyle(r, "entryIcon", { opacity: item.checked ? 1 : 0 })} />
              <span style={rtl(itemLabel, dir)}>{item.label}</span>
              {item.shortcut ? <Kbd keys={item.shortcut} tone="bare" style={css({ alignSelf: "center" }, mac && on && { color: t.fg.onBrand })} /> : null}
              {item.submenu && <Icon part="entryIcon" name={dir === "rtl" ? "chevron-left" : "chevron-right"} size={r.entryIcon.width} style={partStyle(r, "entryIcon", { opacity: 0.7 })} />}
            </>
          )}
        </MenuRow>
      ),
    );
}

/* ---------- macOS: a picture of the system menu bar ---------- */

const macScreen: CSSProperties = {
  ...box,
  width: "100%",
  overflow: "visible",
  paddingBottom: t.space.md,
  minHeight: 236, /* structural: stage height that lets the open menu show */
};

const macBar: CSSProperties = {
  ...row,
  paddingInline: t.space.md,
  gap: t.space["3xs"],
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  borderBottom: `0.5px solid ${t.border.subtle}`,
};

// macOS 26 draws the bar transparent over the wallpaper.
const macBarGlass: CSSProperties = { background: "transparent", backdropFilter: "none", WebkitBackdropFilter: "none", boxShadow: "none" };

const macTitle: CSSProperties = { ...pressable, justifyContent: "center", whiteSpace: "nowrap" };

const macDropdown: CSSProperties = {
  ...box,
  position: "absolute",
  left: 0,
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: `0.5px solid ${t.border.default}`,
  ...enter("fade"),
  ...scrolls,
};

function MacTitle({ title, menuKey, first, open, tab, onPress, styles }: { title: string; menuKey: string; first: boolean; open: boolean; tab: boolean; onPress: (byKeyboard: boolean) => void; styles?: PartStyles<"app-menu-bar"> }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["app-menu-bar"], { state: { on: open, focus: ui.focused }, styles });
  const part = first ? "appTitle" : "title";
  return (
    <button
      type="button"
      data-af-part={part}
      data-af-menu={menuKey}
      data-af-press
      role="menuitem"
      // The bar is one tab stop; Left and Right move along it.
      tabIndex={tab ? 0 : -1}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(e) => onPress(e.detail === 0)}
      {...ui.handlers}
      style={css(macTitle, r[part])}
    >
      <span style={css(text, { lineHeight: 1.2 })}>{title}</span>
    </button>
  );
}

/** One menu of the macOS bar, with the keys of a menu: Up and Down between the entries, Left and Right to the neighbouring menu, Escape back to the title. */
function MacDropdown({ menu, highlight, choose, styles, onClose, onSibling }: { menu: AppMenuBarMenu; highlight: string; choose: (item: AppMenuBarItem) => void; styles?: PartStyles<"app-menu-bar">; onClose: () => void; onSibling: (delta: 1 | -1) => void }) {
  const { glass: isGlass } = usePlatform();
  const dir = useDirection();
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  const keys = useRovingKeys<HTMLDivElement>({ items: ROWS, orientation: "vertical", typeahead: true });
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const onKeyDown = (e: KeyboardEvent) => {
    if (keys.onKeyDown(e)) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === forward || e.key === back) {
      e.preventDefault();
      e.stopPropagation();
      onSibling(e.key === forward ? 1 : -1);
    }
  };
  return (
    <div
      ref={keys.ref}
      role="menu"
      aria-label={menu.label}
      data-af-menu={menu.key}
      data-af-part="dropdown"
      onKeyDown={(e) => onKeyDown(e)}
      style={css(rtl(macDropdown, dir), partStyle(r, "dropdown", isGlass && glass(), isGlass && { borderRadius: t.osMenu.macGlassRadius }))}
    >
      <Entries desk="mac" items={menu.items ?? []} highlight={highlight} onChoose={choose} styles={styles} tabFirst={false} />
    </div>
  );
}

function MacBar({ menus, open, setOpen, highlight, choose, clock, styles, strings, pending }: DeskProps & { clock: string }) {
  const s = useStrings("app-menu-bar", strings);
  const dir = useDirection();
  const { glass: isGlass } = usePlatform();
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  // The title that holds the bar's tab stop: the open menu's, else the one last reached.
  const [stop, setStop] = useState("");
  const tabKey = open && menus.some((m) => m.key === open) ? open : menus.some((m) => m.key === stop) ? stop : (menus[0]?.key ?? "");
  const bar = useRovingKeys<HTMLDivElement>({
    items: TITLES,
    orientation: "horizontal",
    onMove: (el) => {
      const key = el.dataset.afMenu ?? "";
      setStop(key);
      // With a menu open, moving along the bar opens the neighbour.
      if (open) setOpen(key);
    },
  });
  const openBy = (key: string, how: "first" | "last") => {
    pending.current = { focus: how };
    if (key === open) focusRows(bar.ref.current, key, how);
    else setOpen(key);
  };
  const onBarKeyDown = (e: KeyboardEvent) => {
    const at = (e.target as HTMLElement).closest<HTMLElement>(TITLES);
    if (!at || at !== e.target) return;
    if (bar.onKeyDown(e)) return;
    const key = at.dataset.afMenu ?? "";
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openBy(key, e.key === "ArrowDown" ? "first" : "last");
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen("");
    }
  };
  const near = (from: string, delta: 1 | -1) => {
    const i = menus.findIndex((m) => m.key === from);
    return menus[(i + delta + menus.length) % menus.length]?.key ?? from;
  };
  return (
    <div data-af-part="screen" style={css(macScreen, r.screen)}>
      <div ref={bar.ref} role="menubar" aria-label={menus[0] ? s("menuBar", { app: menus[0].label }) : s("menuBarPlain")} data-af-part="bar" onKeyDown={(e) => onBarKeyDown(e)} style={css(macBar, partStyle(r, "bar", isGlass && macBarGlass))}>
        <Icon part="sysIcon" name="apple" size={r.sysIcon.width} style={partStyle(r, "sysIcon", rtl({ marginRight: t.space.sm, marginLeft: t.space["2xs"] }, dir))} />
        {menus.map((menu, i) => (
          <div key={menu.key} style={{ ...box, position: "relative" }}>
            <MacTitle
              title={menu.label}
              menuKey={menu.key}
              first={i === 0}
              open={menu.key === open}
              tab={menu.key === tabKey}
              onPress={(byKeyboard) => {
                setStop(menu.key);
                if (menu.key === open) setOpen("");
                else if (byKeyboard) openBy(menu.key, "first");
                else setOpen(menu.key);
              }}
              styles={styles}
            />
            {menu.key === open && (
              <MacDropdown
                menu={menu}
                highlight={highlight}
                choose={choose}
                styles={styles}
                onClose={() => {
                  pending.current = { focus: "entry", key: menu.key };
                  setOpen("");
                }}
                onSibling={(delta) => {
                  const next = near(menu.key, delta);
                  setStop(next);
                  openBy(next, "first");
                }}
              />
            )}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div aria-hidden style={css(row, { gap: t.space.md, whiteSpace: "nowrap" })}>
          <Icon part="sysIcon" name="circle-dot" size={r.sysIcon.width} style={r.sysIcon} />
          <Icon part="sysIcon" name="wifi" size={r.sysIcon.width} style={r.sysIcon} />
          <Icon part="sysIcon" name="battery-full" size={r.sysIcon.width} style={r.sysIcon} />
          {clock ? <span style={text}>{clock}</span> : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- Windows and Linux: the ☰ menu off the title bar ---------- */

const strip: CSSProperties = { ...row, width: "100%", paddingInline: t.space.xs };

const panel: CSSProperties = { ...box, marginTop: t.space["2xs"], marginLeft: t.space.xs, ...enter("pop"), ...scrolls };

const cascade: CSSProperties = {
  ...box,
  position: "absolute",
  ...enter("fade"),
  ...scrolls,
};

interface DeskProps {
  menus: AppMenuBarMenu[];
  open: string;
  setOpen: (menu: string) => void;
  highlight: string;
  choose: (item: AppMenuBarItem) => void;
  styles?: PartStyles<"app-menu-bar">;
  strings?: Partial<KitStrings["app-menu-bar"]>;
  /** Where focus goes next, set by a key and read once the menu has rendered. */
  pending: Pending;
}

function MenuEntry({ desk, menuKey, title, open, tab, onPress, styles }: { desk: Desk; menuKey: string; title: string; open: boolean; tab: boolean; onPress: (byKeyboard: boolean) => void; styles?: PartStyles<"app-menu-bar"> }) {
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  const dir = useDirection();
  return (
    <MenuRow desk={desk} label={title} lit={open} popup expanded={open} menuKey={menuKey} tab={tab} onPress={(byKeyboard) => onPress(byKeyboard)} styles={styles}>
      {() => (
        <>
          <span style={rtl(itemLabel, dir)}>{title}</span>
          <Icon part="entryIcon" name={dir === "rtl" ? "chevron-left" : "chevron-right"} size={r.entryIcon.width} style={partStyle(r, "entryIcon", { opacity: 0.7 })} />
        </>
      )}
    </MenuRow>
  );
}

/** The flyout of a Windows entry: Up and Down between its entries, Left or Escape back to the entry that opened it. */
function Cascade({ menu, highlight, choose, styles, onClose }: { menu: AppMenuBarMenu; highlight: string; choose: (item: AppMenuBarItem) => void; styles?: PartStyles<"app-menu-bar">; onClose: () => void }) {
  const dir = useDirection();
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  const keys = useRovingKeys<HTMLDivElement>({ items: ROWS, orientation: "vertical", typeahead: true });
  const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  return (
    <div
      ref={keys.ref}
      role="menu"
      aria-label={menu.label}
      data-af-menu={menu.key}
      data-af-part="cascade"
      onKeyDown={(e) => {
        if (keys.onKeyDown(e)) return;
        if (e.key === "Escape" || e.key === back) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
      style={css(rtl(cascade, dir), r.cascade)}
    >
      <Entries desk="windows" items={menu.items ?? []} highlight={highlight} onChoose={choose} styles={styles} />
    </div>
  );
}

function WindowsMenu({ menus, open, setOpen, highlight, choose, styles, strings, pending }: DeskProps) {
  const s = useStrings("app-menu-bar", strings);
  const dir = useDirection();
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  const keys = useRovingKeys<HTMLDivElement>({ items: ROWS, skip: NESTED_ROWS, orientation: "vertical", typeahead: true });
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const shown = menus.slice(1);
  const tabKey = shown.some((m) => m.key === open) ? open : (shown[0]?.key ?? "");
  const openBy = (key: string) => {
    pending.current = { focus: "first" };
    if (key === open) focusRows(keys.ref.current, key, "first");
    else setOpen(key);
  };
  return (
    <div
      ref={keys.ref}
      role="menu"
      aria-label={s("applicationMenu")}
      data-af-part="panel"
      onKeyDown={(e) => {
        // A flyout's keys are its own.
        if ((e.target as HTMLElement).closest('[data-af-part="cascade"]')) return;
        if (keys.onKeyDown(e)) return;
        const at = (e.target as HTMLElement).closest<HTMLElement>('[data-af-part="row"]');
        const key = at?.dataset.afMenu;
        if (key && e.key === forward) {
          e.preventDefault();
          openBy(key);
        } else if (e.key === "Escape" && open) {
          e.preventDefault();
          e.stopPropagation();
          pending.current = { focus: "entry", key: open };
          setOpen("");
        }
      }}
      style={css(rtl(panel, dir), r.panel)}
    >
      {/* Windows carries About and Quit under Help and File, so the app menu is skipped. */}
      {shown.map((menu) => (
        <div key={menu.key} style={{ ...box, position: "relative" }}>
          <MenuEntry
            desk="windows"
            menuKey={menu.key}
            title={menu.label}
            open={menu.key === open}
            tab={menu.key === tabKey}
            onPress={(byKeyboard) => {
              if (menu.key === open) setOpen("");
              else if (byKeyboard) openBy(menu.key);
              else setOpen(menu.key);
            }}
            styles={styles}
          />
          {menu.key === open && (
            <Cascade
              menu={menu}
              highlight={highlight}
              choose={choose}
              styles={styles}
              onClose={() => {
                pending.current = { focus: "entry", key: menu.key };
                setOpen("");
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** GNOME's popover menu: a submenu slides in place over the main list, with a ‹ row back to it. */
function GnomeMenu({ menus, open, setOpen, highlight, choose, styles, strings, pending }: DeskProps) {
  const s = useStrings("app-menu-bar", strings);
  const dir = useDirection();
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  const keys = useRovingKeys<HTMLDivElement>({ items: ROWS, orientation: "vertical", typeahead: true });
  const shown = menus.find((menu) => menu.key === open);
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const goBack = () => {
    if (!shown) return;
    pending.current = { focus: "entry", key: shown.key };
    setOpen("");
  };
  return (
    <div
      ref={keys.ref}
      role="menu"
      aria-label={shown ? shown.label : s("applicationMenu")}
      data-af-part="panel"
      onKeyDown={(e) => {
        if (keys.onKeyDown(e)) return;
        if (shown && (e.key === "Escape" || e.key === back)) {
          e.preventDefault();
          e.stopPropagation();
          goBack();
        } else if (!shown && e.key === forward) {
          const key = (e.target as HTMLElement).closest<HTMLElement>('[data-af-part="row"]')?.dataset.afMenu;
          if (!key) return;
          e.preventDefault();
          pending.current = { focus: "first" };
          setOpen(key);
        }
      }}
      style={css(rtl(panel, dir), r.panel)}
    >
      {shown ? (
        <div key={shown.key} style={css(box, enter("slide-left"))}>
          <MenuRow desk="linux" label={s("backToMain")} tab onPress={() => goBack()} styles={styles}>
            {() => (
              <>
                <Icon part="backIcon" name={dir === "rtl" ? "chevron-right" : "chevron-left"} size={r.backIcon.width} style={r.backIcon} />
                <span data-af-part="backLabel" style={css(text, { flex: 1, textAlign: "center", paddingRight: t.space.xl }, r.backLabel)}>{shown.label}</span>
              </>
            )}
          </MenuRow>
          <div role="separator" data-af-part="separator" style={css(separator, r.separator)} />
          <Entries desk="linux" items={shown.items ?? []} highlight={highlight} onChoose={choose} styles={styles} />
        </div>
      ) : (
        menus.slice(1).map((menu, i) => (
          <MenuEntry
            key={menu.key}
            desk="linux"
            menuKey={menu.key}
            title={menu.label}
            open={false}
            tab={i === 0}
            onPress={(byKeyboard) => {
              if (byKeyboard) pending.current = { focus: "first" };
              setOpen(menu.key);
            }}
            styles={styles}
          />
        ))
      )}
    </div>
  );
}

/* ---------- web: the ⋯ menu, holding only what a tab can do ---------- */

const webMenu: CSSProperties = { ...box, ...enter("pop"), ...scrolls };

const webItem: CSSProperties = { ...rowBase, gap: t.space.sm, paddingInline: t.space.sm };

function WebRow({ item, lit, tab, onPress, styles }: { item: AppMenuBarWebItem; lit: boolean; tab: boolean; onPress: () => void; styles?: PartStyles<"app-menu-bar"> }) {
  const ui = useInteraction({ disabled: item.disabled });
  const dir = useDirection();
  const r = useRecipe(recipes["app-menu-bar"], { state: { on: (lit || ui.hovered || ui.focused) && !ui.disabled, pressed: ui.pressed, disabled: ui.disabled, focus: ui.focused }, styles });
  // The browser owns some desktop shortcuts: a web entry may say what it draws instead.
  const keys = item.webShortcut ?? item.shortcut;
  return (
    <button
      type="button"
      data-af-part="webItem"
      data-af-press
      role="menuitem"
      tabIndex={tab ? 0 : -1}
      aria-label={item.label}
      aria-disabled={ui.disabled || undefined}
      onClick={() => !ui.disabled && onPress()}
      {...ui.handlers}
      style={css(rtl(webItem, dir), partStyle(r, "webItem", ui.disabled && { cursor: "default" }))}
    >
      {item.icon ? <Icon part="webIcon" name={item.icon} size={r.webIcon.width} style={r.webIcon} /> : null}
      <span style={rtl(itemLabel, dir)}>{item.label}</span>
      {keys ? <Kbd keys={keys} tone="bare" style={{ alignSelf: "center" }} /> : null}
      {item.trailingIcon ? <Icon part="webTrailing" name={item.trailingIcon} size={r.webTrailing.width} style={r.webTrailing} /> : null}
    </button>
  );
}

function Segment({ label, icon, checked, onPress, styles }: { label: string; icon: IconName; checked: boolean; onPress: () => void; styles?: PartStyles<"app-menu-bar"> }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["app-menu-bar"], { state: { hover: ui.hovered, on: checked, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="segment"
      data-af-press
      role="radio"
      // The group is one tab stop: the checked option. The arrows move between the options and check the one they reach.
      tabIndex={checked ? 0 : -1}
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(
        pressable,
        {
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          transition: `background ${t.duration.fast}, color ${t.duration.fast}, box-shadow ${t.duration.fast}`,
        },
        r.segment,
      )}
    >
      <Icon part="segmentIcon" name={icon} size={r.segmentIcon.width} style={r.segmentIcon} />
    </button>
  );
}

/** The arrows between the Theme options, wrapping (APG radio group): the arrow checks the option it reaches. Tab leaves the row. */
function themeKeys(e: KeyboardEvent, values: AppMenuBarColorScheme[], scheme: AppMenuBarColorScheme, set: (next: AppMenuBarColorScheme) => void, dir: "ltr" | "rtl") {
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const at = values.indexOf(scheme);
  let to = -1;
  if (e.key === forward || e.key === "ArrowDown") to = at + 1;
  else if (e.key === back || e.key === "ArrowUp") to = at - 1;
  else if (e.key === "Home") to = 0;
  else if (e.key === "End") to = values.length - 1;
  if (to < 0) return;
  e.preventDefault();
  e.stopPropagation();
  const index = (to + values.length) % values.length;
  set(values[index]!);
  // The option it reached takes focus now, and the tab stop once it renders as the checked one.
  e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[index]?.focus();
}

function WebMenu({
  workspace,
  host,
  identity,
  items,
  highlight,
  scheme,
  setScheme,
  choose,
  styles,
  strings,
}: {
  workspace: string;
  host: string;
  identity: AvatarIdentity;
  items: AppMenuBarWebItem[];
  highlight: string;
  scheme: AppMenuBarColorScheme;
  setScheme: (next: AppMenuBarColorScheme) => void;
  choose: (item: AppMenuBarWebItem) => void;
  styles?: PartStyles<"app-menu-bar">;
  strings?: Partial<KitStrings["app-menu-bar"]>;
}) {
  const s = useStrings("app-menu-bar", strings);
  const dir = useDirection();
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  // Up and Down go through the rows; the Theme row is one stop in that order (its checked option), and Left and Right inside it change the theme.
  const keys = useRovingKeys<HTMLDivElement>({ items: `${ROWS}, [role="radio"][aria-checked="true"]`, orientation: "vertical", typeahead: true });
  const named = workspace ? s("workspaceMenu", { name: workspace }) : s("menu");
  const schemes: { value: AppMenuBarColorScheme; label: string; icon: IconName }[] = [
    { value: "light", label: s("light"), icon: "sun" },
    { value: "dark", label: s("dark"), icon: "moon" },
    { value: "system", label: s("system"), icon: "monitor" },
  ];
  // The menu's tab stop: its first row, unless a Theme row comes first (then its checked option is it).
  const firstRow = items.findIndex((item) => item.type !== "separator" && item.type !== "scheme" && !!item.label);
  return (
    <div style={css(box, { alignItems: "flex-end", gap: t.space.xs })}>
      <IconButton icon="ellipsis" label={named} active />
      <div ref={keys.ref} role="menu" aria-label={named} data-af-part="webMenu" onKeyDown={(e) => void keys.onKeyDown(e)} style={css(webMenu, r.webMenu)}>
        {workspace ? (
          <>
            <div style={css(row, { gap: t.space.sm, padding: t.space.xs })}>
              <Avatar name={workspace} shape="square" identity={identity} size="md" />
              <div style={css(box, { flex: 1 })}>
                <span data-af-part="workspaceName" style={css(text, truncate(1), r.workspaceName)}>{workspace}</span>
                <span data-af-part="host" style={css(text, truncate(1), r.host)}>{host}</span>
              </div>
            </div>
            <div data-af-part="separator" style={css(separator, r.separator)} />
          </>
        ) : null}
        {items.map((item, i) =>
          item.type === "separator" ? (
            <div key={i} role="separator" data-af-part="separator" style={css(separator, r.separator)} />
          ) : item.type === "scheme" ? (
            <div key={i} role="group" aria-label={s("theme")} data-af-part="themeRow" style={css(row, { gap: t.space.sm, paddingInline: t.space.sm }, r.themeRow)}>
              <Icon part="webIcon" name="sun-moon" size={r.webIcon.width} style={r.webIcon} />
              <span style={rtl(itemLabel, dir)}>{s("theme")}</span>
              <div role="radiogroup" aria-label={s("theme")} data-af-part="themeTrack" onKeyDown={(e) => themeKeys(e, schemes.map((o) => o.value), scheme, setScheme, dir)} style={css(row, { gap: t.space["3xs"], padding: t.space["3xs"] }, r.themeTrack)}>
                {schemes.map((o) => (
                  <Segment key={o.value} label={o.label} icon={o.icon} checked={scheme === o.value} onPress={() => setScheme(o.value)} styles={styles} />
                ))}
              </div>
            </div>
          ) : item.label ? (
            <WebRow key={i} item={item} lit={(item.key ?? item.label) === highlight} tab={i === firstRow} onPress={() => choose(item)} styles={styles} />
          ) : null,
        )}
      </div>
    </div>
  );
}

export function AppMenuBar({
  menus = [],
  openMenu,
  highlight = "",
  workspace = "",
  host = "",
  workspaceIdentity = "ink",
  webItems = [],
  colorScheme,
  clock = "",
  onSelect,
  onOpenMenuChange,
  onColorSchemeChange,
  styles,
  strings,
  style,
  ref: givenRef,
  ...rest
}: AppMenuBarProps) {
  const s = useStrings("app-menu-bar", strings);
  const { platform, os } = usePlatform();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pending = useRef<Focus | null>(null);
  const [open = "", setOpen] = useControllable(openMenu, onOpenMenuChange);
  const [scheme = "system", setScheme] = useControllable(colorScheme, onColorSchemeChange);
  // Choosing an entry closes the menu, as the system's own menus do.
  const choose = (item: AppMenuBarItem) => {
    onSelect?.(item);
    setOpen("");
  };
  const desk: DeskProps = { menus, open, setOpen, highlight, choose, styles, strings, pending };
  const r = useRecipe(recipes["app-menu-bar"], { styles });
  // A key opened or closed a menu: focus goes into it, or back to the entry that opened it, once it has rendered.
  useEffect(() => {
    const want = pending.current;
    if (!want) return;
    pending.current = null;
    const root = rootRef.current;
    if (!root) return;
    if (want.focus === "entry") root.querySelector<HTMLElement>(`button[data-af-menu="${want.key}"]`)?.focus();
    else focusRows(root, open, want.focus);
  }, [open]);
  return (
    <div
      ref={(el) => {
        rootRef.current = el;
        if (typeof givenRef === "function") givenRef(el);
        else if (givenRef) (givenRef as { current: HTMLDivElement | null }).current = el;
      }}
      data-af-part="root"
      {...rootProps(rest)}
      style={css(box, { width: "100%" }, partStyle(r, "root", ROOT_OS[platform === "web" ? "browser" : os]), style)}>
      {platform === "web" ? (
        <WebMenu
          workspace={workspace}
          host={host}
          identity={workspaceIdentity}
          items={webItems}
          highlight={highlight}
          scheme={scheme}
          setScheme={setScheme}
          choose={(item) => onSelect?.(item)}
          styles={styles}
          strings={strings}
        />
      ) : os === "mac" ? (
        <MacBar {...desk} clock={clock} />
      ) : (
        <div style={css(box, { alignItems: "flex-start", width: "100%" })}>
          <div data-af-part="strip" style={css(strip, r.strip)}>
            <IconButton icon="menu" label={s("applicationMenu")} active shape={os === "linux" ? "circle" : "square"} />
          </div>
          {os === "linux" ? <GnomeMenu {...desk} /> : <WindowsMenu {...desk} />}
        </div>
      )}
    </div>
  );
}
