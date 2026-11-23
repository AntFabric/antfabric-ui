import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { menuItemKey, recipes, useControllable, useDirection, useStrings, type KitStrings, type MenuItem } from "@antfabric/ui-core";
import { useAutoFocus, usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles, type RecipeInput } from "../../lib/recipe";
import { useRovingKeys } from "../../lib/roving";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, glass, pressable, row, rtl, text, truncate } from "../../lib/style";

export type TrayMenuTone = "idle" | "live" | "paused" | "busy";

/** A row of the menu. A `label` row is a dimmed readout, `count` the right-hand detail (read after the label), `danger` with `filled` the record glyph. */
export interface TrayMenuItem extends MenuItem {
  /** Drawn in the row when it differs from the accessible name (`label`). */
  text?: string;
  /** The glyph is drawn solid, and smaller. */
  filled?: boolean;
  submenu?: TrayMenuItem[];
}

export interface TrayMenuProps extends RootProps<HTMLDivElement> {
  /** The app's name: the menu's accessible name. */
  appName: string;
  /** Every row, in order. */
  items?: TrayMenuItem[];
  /** The tray icon: idle is the plain dot, live the red one, paused the amber, busy the blue. */
  tone?: TrayMenuTone;
  /** Beside the macOS status item: "Recording 0:12". "" draws none. */
  statusText?: string;
  /** The picture's date: the macOS menu bar draws "date clock". */
  date?: string;
  /** The picture's clock: the macOS menu bar draws "date clock", the taskbar "clock". */
  clock?: string;
  /** The key of the row whose submenu is open. "" is none. */
  openMenu?: string;
  /** A row was pressed (a row with a submenu opens it instead). */
  onSelect?: (item: TrayMenuItem) => void;
  /** A submenu opened or closed: the key of the open row, or "". */
  onOpenMenuChange?: (openMenu: string) => void;
  /** Per-part styles over the theme: `{ root: {…}, menu: {…}, item: {…} }`. */
  styles?: PartStyles<"tray-menu">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["tray-menu"]>;
  style?: CSSProperties;
}

const SF = "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", sans-serif";
const SEGOE = "\"Segoe UI Variable Text\", \"Segoe UI\", system-ui, sans-serif";
const ADWAITA = "\"Adwaita Sans\", Cantarell, \"Noto Sans\", Ubuntu, sans-serif";

const label: CSSProperties = { ...text, ...truncate(1), flex: 1 };
const filled: CSSProperties = { fill: "currentColor" };

/** Layout no token decides; the OS's colours, radii and row sizes are the recipe's (`trayMenu`, under each OS). */
type R = ReturnType<typeof useTrayRecipe>;
const useTrayRecipe = (input: RecipeInput & { styles?: PartStyles<"tray-menu"> } = {}) => useRecipe(recipes["tray-menu"], input);

/** A menu's sheet: its 0.5px (Mac) or hairline edge, and Liquid Glass over it (its transparent edge included). */
function sheet(r: R, mac: boolean, liquid: boolean, ...inline: CSSProperties[]): CSSProperties {
  return css(
    box,
    partStyle(
      r,
      "menu",
      mac && { borderWidth: "0.5px", borderStyle: "solid", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" },
      liquid && css(glass(), { borderRadius: t.osTray.liquidRadius }),
      ...inline,
    ),
  );
}

function Separator({ styles }: { styles?: PartStyles<"tray-menu"> }) {
  const { os } = usePlatform();
  const r = useTrayRecipe({ styles });
  const mac = os === "mac";
  return <div role="separator" data-af-part="separator" style={css({ flexShrink: 0, marginBlock: mac ? 5 : 4, marginInline: mac ? 10 : 8 }, r.separator)} />;
}

/** A dimmed row that only says something: how a native menu shows information. */
function Readout({ children, styles }: { children: string; styles?: PartStyles<"tray-menu"> }) {
  const { os } = usePlatform();
  const r = useTrayRecipe({ styles });
  const mac = os === "mac";
  return (
    <div role="menuitem" aria-disabled="true" data-af-part="readout" style={css(row, { height: mac ? 22 : 30, flexShrink: 0, paddingInline: mac ? 10 : 12 }, r.readout)}>
      <span style={label}>{children}</span>
    </div>
  );
}

interface ItemProps {
  label: string;
  glyph?: ReactNode;
  detail?: string;
  /** Text drawn in the row when it differs from the accessible name. */
  text?: string;
  disabled?: boolean;
  /** Opens a submenu: drawn highlighted while it is open. */
  submenu?: boolean;
  open?: boolean;
  /** The row's key, so keys that move focus can find it again. */
  rowKey: string;
  /** The one row of this menu that is a Tab stop (the others are reached by the arrows). */
  tabbable: boolean;
  styles?: PartStyles<"tray-menu">;
  strings?: Partial<KitStrings["tray-menu"]>;
  onPress?: () => void;
}

function Item({ label: name, glyph, detail, text: shown, disabled = false, submenu = false, open = false, rowKey, tabbable, styles, strings, onPress }: ItemProps) {
  const { os } = usePlatform();
  const dir = useDirection();
  const s = useStrings("tray-menu", strings);
  const ui = useInteraction({ disabled });
  const mac = os === "mac";
  // macOS highlights in the accent with white text; Windows and GNOME in a grey wash.
  const lit = open || ui.hovered || ui.focused;
  const r = useTrayRecipe({ state: { hover: lit, disabled: ui.disabled }, styles });
  return (
    <button
      type="button"
      data-af-part="item"
      data-af-press
      role="menuitem"
      data-af-key={rowKey}
      tabIndex={tabbable ? 0 : -1}
      aria-label={detail ? s("withDetail", { label: name, detail }) : name}
      aria-haspopup={submenu ? "menu" : undefined}
      aria-expanded={submenu ? open : undefined}
      disabled={ui.disabled}
      onClick={() => onPress?.()}
      {...ui.handlers}
      style={css(pressable, rtl({ flexDirection: "row", alignItems: "center", flexShrink: 0, textAlign: "left" }, dir), partStyle(r, "item", ui.disabled && { cursor: "default" }))}
    >
      <span style={css(box, { width: mac ? 14 : 16, flexShrink: 0, alignItems: "center", justifyContent: "center" })}>{glyph}</span>
      <span style={label}>{shown ?? name}</span>
      {detail && (
        <span data-af-part="itemDetail" style={{ ...text, fontVariantNumeric: "tabular-nums", ...r.itemDetail }}>
          {detail}
        </span>
      )}
      {submenu && <Icon part="itemChevron" name={dir === "rtl" ? "chevron-left" : "chevron-right"} size={14} style={r.itemChevron} />}
    </button>
  );
}

/** The enabled rows that are this menu's own: its direct buttons, and the buttons of its rows' wrappers (a submenu's rows are deeper). */
const OWN = ":scope > button[role=menuitem]:not(:disabled), :scope > [role=none] > button[role=menuitem]:not(:disabled)";

/** The row that is this menu's Tab stop: the one that last had focus, else the first one that can. */
function tabStop(list: TrayMenuItem[], cur: string): string {
  const live = list.filter((i) => i.type !== "separator" && i.type !== "label" && !i.disabled).map((i, n) => menuItemKey(i) || `row-${list.indexOf(i)}-${n}`);
  return cur && live.includes(cur) ? cur : (live[0] ?? "");
}

/** A submenu: its own arrows, Home and End, typeahead, and Escape or the back arrow to close it and give focus back to the row that opened it. */
function Submenu({
  label,
  focusIn,
  onClose,
  children,
  style,
}: {
  label: string;
  /** Opened from the keyboard or a press: focus its first row. A submenu drawn open by a prop leaves focus alone. */
  focusIn: boolean;
  onClose: () => void;
  children: (cur: string) => ReactNode;
  style: CSSProperties;
}) {
  const dir = useDirection();
  const allowed = useAutoFocus();
  const keys = useRovingKeys<HTMLDivElement>({ items: OWN, typeahead: true });
  const [cur, setCur] = useState("");
  useEffect(() => {
    if (focusIn && allowed) keys.focusItem(0);
    // Once, as it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      ref={keys.ref}
      role="menu"
      aria-label={label}
      data-af-submenu
      data-af-part="menu"
      onFocus={(e) => {
        const k = (e.target as HTMLElement).getAttribute("data-af-key");
        if (k && (e.target as HTMLElement).closest("[role=menu]") === e.currentTarget) setCur(k);
      }}
      onKeyDown={(e) => {
        if (e.key === "Tab") return;
        e.stopPropagation();
        if (keys.onKeyDown(e)) return;
        if (e.key === "Escape" || e.key === (dir === "rtl" ? "ArrowRight" : "ArrowLeft")) {
          e.preventDefault();
          onClose();
        }
      }}
      style={style}
    >
      {children(cur)}
    </div>
  );
}

export function TrayMenu({ appName, items = [], tone = "idle", statusText = "", date = "", clock = "", openMenu, onSelect, onOpenMenuChange, styles, strings, style, ...rest }: TrayMenuProps) {
  const { os, glass: liquid } = usePlatform();
  // A submenu opens and closes on its own; the app's next `openMenu` takes over when it comes.
  const [openKey = "", setOpen] = useControllable(openMenu, onOpenMenuChange);
  const mac = os === "mac";
  const linux = os === "linux";
  const idle = tone === "idle";
  const r = useTrayRecipe({ variants: { tone }, styles });
  const parent = items.find((i) => i.submenu && menuItemKey(i) === openKey);
  const open = !!parent;
  const dir = useDirection();
  const [cur, setCur] = useState("");
  // A submenu that a press or the arrow opened takes focus; one drawn open by `openMenu` does not.
  const focusSub = useRef(false);
  const keys = useRovingKeys<HTMLDivElement>({ items: OWN, typeahead: true });
  useEffect(() => {
    focusSub.current = false;
  });
  const closeSub = (key: string) => {
    setOpen("");
    keys.ref.current?.querySelector<HTMLElement>(`[data-af-key="${key}"]`)?.focus();
  };
  const trayIcon = <Icon part="trayIcon" name={idle ? "circle-dot" : "circle"} size={14} style={css(idle ? undefined : filled, r.trayIcon)} />;
  const glyph = (item: TrayMenuItem) =>
    item.icon ? (
      item.filled ? (
        <Icon part={item.tone === "danger" ? "recordGlyph" : "glyph"} name={item.icon} size={12} style={css(filled, item.tone === "danger" ? r.recordGlyph : r.glyph)} />
      ) : (
        <Icon part="glyph" name={item.icon} size={14} style={r.glyph} />
      )
    ) : null;
  const detail = (item: TrayMenuItem) => (item.count === undefined || item.count === "" ? undefined : String(item.count));
  const press = (item: TrayMenuItem) => {
    if (item.submenu) {
      focusSub.current = menuItemKey(item) !== openKey;
      setOpen(menuItemKey(item) === openKey ? "" : menuItemKey(item));
    } else {
      if (openKey) setOpen("");
      onSelect?.(item);
    }
  };
  const rows = (list: TrayMenuItem[], at: string): ReactNode =>
    list.map((item, i) => {
      const key = menuItemKey(item) || `row-${i}`;
      const rowKey = menuItemKey(item) || `row-${i}-${list.slice(0, i + 1).filter((x) => x.type !== "separator" && x.type !== "label" && !x.disabled).length - 1}`;
      if (item.type === "separator") return <Separator key={key} styles={styles} />;
      if (item.type === "label") return <Readout key={key} styles={styles}>{item.label ?? ""}</Readout>;
      const entry = <Item key={key} label={item.label ?? ""} text={item.text} detail={detail(item)} glyph={glyph(item)} disabled={item.disabled} submenu={!!item.submenu} open={item.submenu ? openKey === menuItemKey(item) : false} rowKey={rowKey} tabbable={tabStop(list, at) === rowKey} styles={styles} strings={strings} onPress={() => press(item)} />;
      if (!item.submenu) return entry;
      return (
        <div key={key} role="none" style={box}>
          {entry}
          {openKey === menuItemKey(item) && (
            <Submenu
              label={item.label ?? ""}
              focusIn={focusSub.current}
              onClose={() => closeSub(rowKey)}
              style={sheet(r, mac, liquid, rtl({ position: "absolute", top: t.osTray.submenuTop, left: "calc(100% + 6px)", width: t.osTray.sheetW, padding: mac ? 5 : 4, zIndex: 2 }, dir), enter("fade"))}
            >
              {(subCur) => rows(item.submenu ?? [], subCur)}
            </Submenu>
          )}
        </div>
      );
    });
  const wall = [date, clock].filter(Boolean).join(" ");
  return (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      style={css(
        box,
        { alignSelf: "flex-start", alignItems: "flex-end", gap: t.space.xs },
        mac && { paddingTop: t.space.sm, paddingBottom: t.space.sm, paddingLeft: t.space.sm, paddingRight: t.space.sm },
        // Room for the submenu, which hangs off the menu's right edge.
        partStyle(r, "root", open && rtl({ paddingRight: 216 }, dir)), /* structural: stage spacing that leaves room for the open submenu */
        style,
      )}
    >
      {mac && (
        <div
          aria-hidden
          data-af-part="statusBar"
          style={css(
            row,
            { alignSelf: "stretch", justifyContent: "flex-end", fontFamily: SF },
            // macOS 26's menu bar is transparent; the status item is a clear glass capsule on the wallpaper.
            partStyle(r, "statusBar", liquid ? { background: "transparent" } : { backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }),
          )}
        >
          <div data-af-part="statusItem" style={css(row, partStyle(r, "statusItem", liquid && css(glass("glass-clear"), { borderRadius: t.osTray.statusItemLiquidRadius })))}>
            {trayIcon}
            {statusText && (
              <span data-af-part="statusText" style={{ ...text, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...r.statusText }}>
                {statusText}
              </span>
            )}
          </div>
          <Icon part="statusGlyph" name="wifi" size={15} style={r.statusGlyph} />
          {wall && (
            <span data-af-part="statusClock" style={{ ...text, whiteSpace: "nowrap", ...r.statusClock }}>
              {wall}
            </span>
          )}
        </div>
      )}
      <div
        ref={keys.ref}
        role="menu"
        aria-label={appName}
        data-af-part="menu"
        onFocus={(e) => {
          const k = (e.target as HTMLElement).getAttribute("data-af-key");
          if (k && (e.target as HTMLElement).closest("[role=menu]") === e.currentTarget) setCur(k);
        }}
        onKeyDown={(e) => {
          if (keys.onKeyDown(e)) return;
          // The arrow that points into a row's submenu opens it, from that row.
          const at = document.activeElement as HTMLElement | null;
          if (e.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight") && at?.matches("[aria-haspopup=menu]") && at.closest("[role=menu]") === e.currentTarget) {
            e.preventDefault();
            focusSub.current = true;
            setOpen(at.getAttribute("data-af-key") ?? "");
          }
        }}
        style={sheet(r, mac, liquid, { width: mac ? 250 : 260, padding: mac ? 5 : 4, fontFamily: mac ? SF : linux ? ADWAITA : SEGOE }, enter("fade"))}
      >
        {rows(items, cur)}
      </div>
      {(os === "windows" || linux) && (
        <div aria-hidden data-af-part="taskbar" style={css(row, { fontFamily: SEGOE }, partStyle(r, "taskbar", linux && { borderRadius: 0, fontFamily: "\"Adwaita Sans\", Cantarell, sans-serif" }))}>
          {os === "windows" && <Icon part="statusGlyph" name="chevron-up" size={15} style={r.statusGlyph} />}
          <span data-af-part="trayChip" style={css(box, { flexShrink: 0, alignItems: "center", justifyContent: "center" }, r.trayChip)}>
            {trayIcon}
          </span>
          <Icon part="statusGlyph" name="wifi" size={15} style={r.statusGlyph} />
          <Icon part="statusGlyph" name="volume-2" size={15} style={r.statusGlyph} />
          {clock && (
            <span data-af-part="taskbarClock" style={{ ...text, whiteSpace: "nowrap", ...r.taskbarClock }}>
              {clock}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
