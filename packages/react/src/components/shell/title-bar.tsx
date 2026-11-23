import type { CSSProperties, ReactNode } from "react";
import { formatShortcut, recipes, useControllable, useStrings, type IconActionItem, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, glass, pressable, row, text, truncate } from "../../lib/style";
import { IconButton } from "../actions/icon-button";
import { Kbd } from "../display/kbd";
import { rootProps, type RootProps } from "../../lib/root-props";
import { MenuButton } from "./menu-button";

export interface TitleBarProps extends RootProps<HTMLDivElement> {
  /** False at the first place visited this session. */
  canGoBack?: boolean;
  canGoForward?: boolean;
  /** Draws the Recent history button after Back and Forward. */
  history?: boolean;
  /** Draws the search field in the middle. */
  search?: boolean;
  /** The field's text. Default: the `searchPlaceholder` string. */
  searchPlaceholder?: string;
  /** The palette shortcut, written once (`Mod+K`) and drawn per OS. */
  searchKeys?: string;
  /** macOS full screen: the system hides the traffic lights, so the 96px inset drops back to 16. */
  fullscreen?: boolean;
  /** Windows and Linux: the maximise glyph becomes restore. */
  maximized?: boolean;
  /** False while another app's window is in front: macOS greys the lights, Windows and Linux dim the caption glyphs. */
  focused?: boolean;
  /** Windows and Linux: the ☰ application menu is open. */
  menuOpen?: boolean;
  /** The nav rail is open (248px with labels). The sidebar button before Back says which way it goes. */
  sidebarExpanded?: boolean;
  /** Icon buttons before the window controls, after `trailing`. */
  actions?: IconActionItem[];
  /** Transient status before the actions, such as a recording indicator. */
  trailing?: ReactNode;
  onSidebarExpandedChange?: (sidebarExpanded: boolean) => void;
  onBack?: () => void;
  onForward?: () => void;
  onHistory?: () => void;
  onSearch?: () => void;
  onMenuOpenChange?: (menuOpen: boolean) => void;
  /** An action was pressed. */
  onAction?: (action: IconActionItem) => void;
  onMinimize?: () => void;
  /** Maximise, or restore when `maximized`. */
  onMaximize?: () => void;
  onClose?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, search: {…}, caption: {…} }`. */
  styles?: PartStyles<"title-bar">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["title-bar"]>;
  style?: CSSProperties;
}

/** Every empty pixel of the bar drags the window; controls do not carry it, so a click is never a drag. */
const drag = { "data-tauri-drag-region": "" };

const ROOT_OS: Record<string, CSSProperties> = {
  mac: {},
  windows: { paddingLeft: t.space.xs, paddingRight: 0 },
  linux: { paddingLeft: t.space.xs, paddingRight: t.space.sm },
};

/** The layout no token decides; what the tokens decide is the recipe's. */
const root: CSSProperties = {
  ...row,
  // Three columns, the sides equal: the search field is centred in the window however wide the controls on one side are. A side is never
  // narrower than its controls, so in a narrow window the field gives way first.
  display: "grid",
  gridTemplateColumns: `minmax(max-content, 1fr) minmax(${t.topbar.searchMinW}, ${t.topbar.searchMaxW}) minmax(max-content, 1fr)`,
  width: "100%",
  flexShrink: 0,
  paddingLeft: t.space.lg,
  paddingRight: t.space.sm,
  gap: t.space.md,
  userSelect: "none",
};

/** Each side is never narrower than its controls (lights or ☰, the sidebar button, history; the actions and the window controls): in a narrow window the search field gives way first. */
const side: CSSProperties = { ...row, gap: t.space["2xs"], alignSelf: "stretch", minWidth: "max-content" };

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

function Search({ placeholder, keys, label, hint, onPress, styles }: { placeholder: string; keys: string; label: string; hint: string; onPress: () => void; styles?: PartStyles<"title-bar"> }) {
  const { glass: isGlass } = usePlatform();
  const ui = useInteraction();
  const r = useRecipe(recipes["title-bar"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
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
      style={css(
        search,
        partStyle(
          r,
          "search",
          // macOS 26: a Liquid Glass capsule floating over the content.
          isGlass && css(glass(), { borderRadius: t.radius.pill, borderWidth: 0 }),
          isGlass && ui.focused && { boxShadow: t.shadow.focus },
        ),
      )}
    >
      <Icon part="searchIcon" name="search" size={r.searchIcon.width} style={r.searchIcon} />
      <span style={css(text, truncate(1), { flex: 1, textAlign: "left" })}>{placeholder}</span>
      <Kbd keys={keys} style={{ alignSelf: "center" }} />
    </button>
  );
}

type Caption = "windows" | "linux";

const CAPTION: Record<Caption, { rest: CSSProperties; glyph: CSSProperties }> = {
  // Windows 11's caption buttons: the full height of the bar. GNOME (Adwaita): small round buttons on a grey disc.
  windows: { rest: { alignSelf: "stretch", transition: `background ${t.duration.fast}, color ${t.duration.fast}` }, glyph: { strokeWidth: t.icon.strokeThin } },
  linux: { rest: { transition: `background ${t.duration.fast}` }, glyph: { strokeWidth: t.icon.strokeBold } },
};

function CaptionButton({ kind, label, icon, close = false, onPress, styles }: { kind: Caption; label: string; icon: IconName; close?: boolean; onPress: () => void; styles?: PartStyles<"title-bar"> }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["title-bar"], { state: { hover: ui.hovered, pressed: ui.pressed, focus: ui.focused }, styles });
  const look = CAPTION[kind];
  const part = close ? "captionClose" : "caption";
  return (
    <button
      type="button"
      data-af-part={part}
      data-af-press
      aria-label={label}
      title={label}
      // Not tab stops, as the native caption buttons are not; Alt+Space opens the window menu instead.
      tabIndex={-1}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, { alignItems: "center", justifyContent: "center", flexShrink: 0 }, look.rest, r[part])}
    >
      <Icon part="captionIcon" name={icon} size={r.captionIcon.width} style={partStyle(r, "captionIcon", look.glyph)} />
    </button>
  );
}

export function TitleBar({
  canGoBack = true,
  canGoForward = false,
  history = false,
  search: showSearch = false,
  searchPlaceholder = "",
  searchKeys = "Mod+K",
  fullscreen = false,
  maximized = false,
  focused = true,
  menuOpen,
  sidebarExpanded,
  actions = [],
  trailing,
  onSidebarExpandedChange,
  onBack,
  onForward,
  onHistory,
  onSearch,
  onMenuOpenChange,
  onAction,
  onMinimize,
  onMaximize,
  onClose,
  styles,
  strings,
  style,
  ...rest
}: TitleBarProps) {
  const s = useStrings("title-bar", strings);
  const { os, glass: isGlass } = usePlatform();
  const r = useRecipe(recipes["title-bar"], { variants: { focused }, styles });
  const [open = false, setOpen] = useControllable(menuOpen, onMenuOpenChange);
  const [sidebar = false, setSidebar] = useControllable(sidebarExpanded, onSidebarExpandedChange);
  const caption: Caption | null = os === "windows" ? "windows" : os === "linux" ? "linux" : null;
  const restore = os === "windows" ? s("restoreDown") : s("restore");
  const placeholder = searchPlaceholder || s("searchPlaceholder");
  const light = (part: "lightClose" | "lightMin" | "lightMax"): CSSProperties =>
    css({ flexShrink: 0, borderWidth: "0.5px", borderStyle: "solid", borderColor: t.os.macLightEdge, boxSizing: "border-box" }, r[part]);
  return (
    <div
      role="banner"
      aria-label={s("windowTitleBar")}
      data-af-part="root"
      {...drag}
      {...rootProps(rest)}
      style={css(root, partStyle(r, "root", ROOT_OS[os], isGlass && { background: "transparent", borderBottomWidth: 0 }), style)}
    >
      <div {...drag} style={side}>
        {os === "mac" && !fullscreen && (
          // Drawn by macOS over the bar; this is where they sit, hidden from the page's accessibility tree.
          <div aria-hidden data-af-part="lights" style={css(row, { gap: t.space.sm, flexShrink: 0 }, r.lights)}>
            <span data-af-part="lightClose" style={light("lightClose")} />
            <span data-af-part="lightMin" style={light("lightMin")} />
            <span data-af-part="lightMax" style={light("lightMax")} />
          </div>
        )}
        {caption && (
          <MenuButton
            icon="menu"
            label={s("applicationMenu")}
            shape={caption === "linux" ? "circle" : "square"}
            open={open}
            onPress={() => setOpen(!open)}
            style={{ marginRight: t.space["2xs"] }}
          />
        )}
        {/* The nav rail's own toggle lives here, outside the rail, where shadcn's sidebar puts its trigger. */}
        <div style={css(row, { gap: t.space["3xs"] }, isGlass && css(glass(), { borderRadius: t.radius.pill, paddingInline: t.space["3xs"] }))}>
          <IconButton
            icon={sidebar ? "panel-left-close" : "panel-left-open"}
            label={sidebar ? s("collapseSidebar") : s("expandSidebar")}
            size="sm"
            onPress={() => setSidebar(!sidebar)}
          />
        </div>
        <div
          role="group"
          aria-label={s("history")}
          style={css(row, { gap: t.space["3xs"] }, isGlass && css(glass(), { borderRadius: t.radius.pill, paddingInline: t.space["3xs"] }))}
        >
          <IconButton icon="arrow-left" label={s("back")} size="sm" disabled={!canGoBack} onPress={() => onBack?.()} />
          <IconButton icon="arrow-right" label={s("forward")} size="sm" disabled={!canGoForward} onPress={() => onForward?.()} />
          {history ? <IconButton icon="clock" label={s("recentHistory")} size="sm" onPress={() => onHistory?.()} /> : null}
        </div>
      </div>
      <div {...drag} data-af-part="searchSlot" style={css(row, { justifyContent: "center", alignSelf: "stretch" }, r.searchSlot)}>
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
      <div {...drag} style={css(side, { justifyContent: "flex-end" })}>
        {trailing ? <div data-af-part="trailing" style={css(row, { marginRight: t.space["2xs"], whiteSpace: "nowrap" }, r.trailing)}>{trailing}</div> : null}
        {actions.map((a) => (
          <IconButton key={a.key} icon={a.icon} label={a.label} size="sm" badge={a.badge} disabled={a.disabled} onPress={() => onAction?.(a)} />
        ))}
        {caption === "windows" && (
          <div data-af-part="captions" style={css(box, { flexDirection: "row", alignSelf: "stretch", marginLeft: t.space.sm }, r.captions)}>
            <CaptionButton kind="windows" label={s("minimise")} icon="minus" onPress={() => onMinimize?.()} styles={styles} />
            <CaptionButton kind="windows" label={maximized ? restore : s("maximise")} icon={maximized ? "copy" : "square"} onPress={() => onMaximize?.()} styles={styles} />
            <CaptionButton kind="windows" label={s("close")} icon="x" close onPress={() => onClose?.()} styles={styles} />
          </div>
        )}
        {caption === "linux" && (
          <div data-af-part="captions" style={css(row, { gap: t.space.md, marginLeft: t.space.md }, r.captions)}>
            <CaptionButton kind="linux" label={s("minimise")} icon="minus" onPress={() => onMinimize?.()} styles={styles} />
            <CaptionButton kind="linux" label={maximized ? restore : s("maximise")} icon={maximized ? "copy" : "square"} onPress={() => onMaximize?.()} styles={styles} />
            <CaptionButton kind="linux" label={s("close")} icon="x" onPress={() => onClose?.()} styles={styles} />
          </div>
        )}
      </div>
    </div>
  );
}
