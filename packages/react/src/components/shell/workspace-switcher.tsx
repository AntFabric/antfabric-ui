import { useId, type CSSProperties, type MouseEvent } from "react";
import { recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, pressable, row, rtl, text, truncate } from "../../lib/style";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { Badge } from "../display/badge";
import { Kbd } from "../display/kbd";
import { useRovingKeys } from "../../lib/roving";
import { rootProps, type RootProps } from "../../lib/root-props";

export interface WorkspaceSwitcherWorkspace {
  /** What `current` matches and the list is keyed by. */
  key: string;
  name: string;
  host: string;
  identity?: AvatarIdentity;
  current?: boolean;
  /** Mentions waiting there: a coral count. */
  mentions?: number;
  /** New messages nobody asked you about: the left bar's short mark. */
  activity?: boolean;
  signedIn?: boolean;
  src?: string;
}

export interface WorkspaceSwitcherProps extends RootProps<HTMLDivElement> {
  /** Every workspace this device has signed into, in the person's own order. */
  workspaces?: WorkspaceSwitcherWorkspace[];
  /** The key of the workspace this window is in. Empty falls back to each workspace's own `current`. */
  current?: string;
  /** Desktop: labels each tile with its ⌘1–⌘9 while ⌘ (Ctrl) is held. */
  showShortcuts?: boolean;
  /** The add tile's name (desktop) or the add row's (web). Default: the `add` string, or `addMenu` on the web. */
  addLabel?: string;
  /** A workspace was picked: its key. A signed-out workspace fires it too, so the app can start its sign-in; `current` then stays where it is. */
  onCurrentChange?: (current: string) => void;
  onAdd?: () => void;
  /** Per-part styles over the theme: `{ tile: {…}, menu: {…}, row: {…} }`. */
  styles?: PartStyles<"workspace-switcher">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["workspace-switcher"]>;
  style?: CSSProperties;
}

/* ---------- desktop: Slack's tile column at the top of the rail ---------- */

/** The layout and the motion no token decides; what the tokens decide is the recipe's. */
const column: CSSProperties = { ...box, alignItems: "center", gap: t.space.md, paddingBlock: t.space.md };

const indicator: CSSProperties = {
  position: "absolute",
  left: 0,
  transform: "translateY(-50%)",
  transition: `height ${t.duration.base} ${t.ease.out}`,
};

const tileBadge: CSSProperties = {
  position: "absolute",
  top: t.workspace.badgeTop,
  right: t.workspace.badgeRight,
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: t.surface.chrome,
  whiteSpace: "nowrap",
};

interface Shared {
  styles?: PartStyles<"workspace-switcher">;
  strings?: Partial<KitStrings["workspace-switcher"]>;
}

function Tile({ ws, index, on, showShortcut, onPress, styles, strings }: Shared & { ws: WorkspaceSwitcherWorkspace; index: number; on: boolean; showShortcut: boolean; onPress: () => void }) {
  const { os } = usePlatform();
  const s = useStrings("workspace-switcher", strings);
  const ui = useInteraction();
  const r = useRecipe(recipes["workspace-switcher"], { state: { focus: ui.focused }, styles });
  const dir = useDirection();
  const live = !!ws.signedIn;
  const mentions = live && (ws.mentions ?? 0) > 0 ? ws.mentions! : 0;
  const said = [on ? s("currentWorkspace") : "", mentions ? s("mentions", { count: mentions }) : live && ws.activity ? s("newMessages") : "", live ? "" : s("signedOut")]
    .filter(Boolean)
    .reduce((label, detail) => s("withDetail", { label, detail }), ws.name);
  return (
    <div role="listitem" style={css(box, { width: "100%", alignItems: "center", gap: t.space["2xs"] })}>
      {(on || (ws.activity && live)) && <span data-af-part="indicator" style={css(rtl(indicator, dir), partStyle(r, "indicator", { height: on ? 20 : 8 }))} />}
      <button
        type="button"
        data-af-part="tile"
        data-af-press
        aria-label={said}
        aria-current={on ? "true" : undefined}
        aria-keyshortcuts={index < 9 ? `${os === "mac" ? "Meta" : "Control"}+${index + 1}` : undefined}
        title={ws.name}
        onClick={() => onPress()}
        {...ui.handlers}
        style={css(
          pressable,
          {
            flexShrink: 0,
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: on ? t.fg.strong : "transparent",
            opacity: live ? 1 : 0.5,
            transition: `border-color ${t.duration.fast}, transform ${t.duration.fast}`,
          },
          partStyle(r, "tile", ui.hovered && { transform: "scale(1.04)" }, ui.pressed && { transform: "scale(.97)" }),
        )}
      >
        <Avatar name={ws.name} src={ws.src ?? ""} shape="square" size="md" identity={ws.identity ?? "ink"} />
        {mentions ? <Badge count={mentions} max={9} label={s("mentionsBadge")} style={tileBadge} /> : null}
      </button>
      {showShortcut && index < 9 && <Kbd keys={`Mod+${index + 1}`} style={{ alignSelf: "center" }} />}
    </div>
  );
}

function AddTile({ label, onPress, styles }: Shared & { label: string; onPress: () => void }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["workspace-switcher"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="addTile"
      data-af-press
      aria-label={label}
      title={label}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(
        pressable,
        { flexShrink: 0, alignItems: "center", justifyContent: "center", borderWidth: "1.5px", borderStyle: "dashed", borderColor: t.border.default },
        r.addTile,
      )}
    >
      <Icon part="addIcon" name="plus" size={r.addIcon.width} style={r.addIcon} />
    </button>
  );
}

/* ---------- web: one workspace per tab, so a menu of links to each origin ---------- */

const menu: CSSProperties = { ...box, ...enter("pop") };

const menuRow: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "center", flexShrink: 0, gap: t.space.sm, width: "100%", paddingInline: t.space.sm, textAlign: "left" };

const plusTile: CSSProperties = { ...box, flexShrink: 0, alignItems: "center", justifyContent: "center", borderWidth: "1.5px", borderStyle: "dashed" };

/** A plain click is the app's to handle; ⌘-click and middle-click keep the browser's new tab. */
const plainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

function MenuRow({ ws, on, tab, onPress, styles, strings }: Shared & { ws: WorkspaceSwitcherWorkspace; on: boolean; tab: boolean; onPress: () => void }) {
  const s = useStrings("workspace-switcher", strings);
  const ui = useInteraction();
  const dir = useDirection();
  const r = useRecipe(recipes["workspace-switcher"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <a
      href={`https://${ws.host}`}
      data-af-part="row"
      data-af-press
      role="menuitemradio"
      aria-checked={on}
      // One tab stop for the menu: the current row (else the first); the arrows move between the rest.
      tabIndex={tab ? 0 : -1}
      // A name or host cut short by the row's width can be read in full.
      title={`${ws.name}, ${ws.host}`}
      aria-label={[ws.host, on ? s("current") : "", ws.signedIn ? "" : s("signedOut")].filter(Boolean).reduce((label, detail) => s("withDetail", { label, detail }), ws.name)}
      onClick={(e) => {
        if (!plainClick(e)) return;
        e.preventDefault();
        onPress();
      }}
      // A menu item takes Space as Enter; on a link Space would scroll the page.
      onKeyDown={(e) => {
        if (e.key !== " ") return;
        e.preventDefault();
        onPress();
      }}
      {...ui.handlers}
      style={css(rtl(menuRow, dir), r.row)}
    >
      <Avatar name={ws.name} src={ws.src ?? ""} shape="square" size="sm" identity={ws.identity ?? "ink"} />
      <span style={css(box, { flex: 1 })}>
        <span data-af-part="name" style={css(text, truncate(1), r.name)}>{ws.name}</span>
        <span data-af-part="host" style={css(text, truncate(1), r.host)}>{ws.signedIn ? ws.host : s("signedOutHost", { host: ws.host })}</span>
      </span>
      {on ? <Icon part="check" name="check" size={r.check.width} style={r.check} /> : <Icon part="arrow" name="arrow-up-right" size={r.arrow.width} style={r.arrow} />}
    </a>
  );
}

function AddRow({ label, tab = false, onPress, styles }: Shared & { label: string; tab?: boolean; onPress: () => void }) {
  const ui = useInteraction();
  const dir = useDirection();
  const r = useRecipe(recipes["workspace-switcher"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="row"
      data-af-press
      role="menuitem"
      // The menu's tab stop when it has no workspace rows, so it can still be entered.
      tabIndex={tab ? 0 : -1}
      aria-label={label}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(rtl(menuRow, dir), r.row)}
    >
      <span data-af-part="plusTile" style={css(plusTile, r.plusTile)}>
        <Icon part="plusIcon" name="plus" size={r.plusIcon.width} style={r.plusIcon} />
      </span>
      <span data-af-part="name" style={css(text, truncate(1), r.name)}>{label}</span>
    </button>
  );
}

export function WorkspaceSwitcher({ workspaces = [], current, showShortcuts = false, addLabel = "", onCurrentChange, onAdd, styles, strings, style, ...rest }: WorkspaceSwitcherProps) {
  const s = useStrings("workspace-switcher", strings);
  const { platform } = usePlatform();
  const r = useRecipe(recipes["workspace-switcher"], { styles });
  const titleId = useId();
  const keys = useRovingKeys<HTMLDivElement>({ items: '[role="menuitem"], [role="menuitemradio"]', orientation: "vertical", typeahead: true });
  // Controlled when the app passes both: it confirms the switch first, then moves `current` itself.
  const [active = "", setCurrent] = useControllable(current, onCurrentChange);
  const isCurrent = (ws: WorkspaceSwitcherWorkspace) => (active ? ws.key === active : !!ws.current);
  const pick = (ws: WorkspaceSwitcherWorkspace) => {
    // A signed-out workspace starts sign-in instead: the app hears of it, and nothing changes here.
    if (ws.signedIn) setCurrent(ws.key);
    else onCurrentChange?.(ws.key);
  };
  const rootStyle = css(box, r.root, style);
  if (platform === "web") {
    const tabAt = Math.max(0, workspaces.findIndex(isCurrent));
    return (
      <div data-af-part="root" {...rootProps(rest)} style={rootStyle}>
        <div data-af-part="menu" style={css(menu, r.menu)}>
          {/* The heading names the menu and is not one of its items. */}
          <span id={titleId} data-af-part="title" style={css(text, { paddingInline: t.space.sm, paddingTop: t.space.xs, paddingBottom: t.space["2xs"] }, r.title)}>{s("workspaces")}</span>
          <div ref={keys.ref} role="menu" aria-labelledby={titleId} onKeyDown={(e) => void keys.onKeyDown(e)} style={box}>
            {workspaces.map((ws, i) => (
              <MenuRow key={ws.key} ws={ws} on={isCurrent(ws)} tab={i === tabAt} onPress={() => pick(ws)} styles={styles} strings={strings} />
            ))}
            <div role="separator" data-af-part="divider" style={css({ flexShrink: 0, marginBlock: t.space.xs, marginInline: t.space["2xs"] }, r.divider)} />
            <AddRow label={addLabel || s("addMenu")} tab={workspaces.length === 0} onPress={() => onAdd?.()} styles={styles} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div data-af-part="root" {...rootProps(rest)} style={rootStyle}>
      <div role="list" aria-label={s("workspaces")} data-af-part="column" style={css(column, r.column)}>
        {workspaces.map((ws, i) => (
          <Tile key={ws.key} ws={ws} index={i} on={isCurrent(ws)} showShortcut={showShortcuts} onPress={() => pick(ws)} styles={styles} strings={strings} />
        ))}
        <div role="listitem" style={box}>
          <AddTile label={addLabel || s("add")} onPress={() => onAdd?.()} styles={styles} />
        </div>
      </div>
    </div>
  );
}
