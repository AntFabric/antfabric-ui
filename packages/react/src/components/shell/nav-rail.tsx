import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { formatShortcut, recipes, useControllable, useDirection, useStrings, type KitStrings, type NavItem } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, pressable, rtl, text, truncate } from "../../lib/style";
import { Avatar, type AvatarIdentity, type AvatarPresence } from "../display/avatar";
import { Badge } from "../display/badge";
import { Kbd } from "../display/kbd";
import { rootProps, type RootProps } from "../../lib/root-props";

/** flat: the destinations, one level (variant 1). drill-in: a destination lists its sections in the rail, under its icon (variant 2). */
export type NavRailVariant = "flat" | "drill-in";

/** drill-in: the destinations, or the active destination's sections. */
export type NavRailLevel = "menu" | "sections";

export interface NavRailProps extends RootProps<HTMLElement> {
  /** flat: one list of destinations. drill-in: pressing a destination moves its icon to the top and lists its sections. */
  variant?: NavRailVariant;
  /** 248px with labels, or 64px of icons. The sidebar button in the title bar or the web top bar sets it; remembered per device. */
  expanded?: boolean;
  /** The mark in the lockup tile. A string is drawn as the tile's glyph; an element is drawn bare in the tile. Leave it out for no tile. */
  logo?: ReactNode;
  /** The wordmark beside the tile while expanded. With no `logo` and no `title`, the lockup is not drawn at the menu level. */
  title?: string;
  /** The key of the destination the lockup opens; its name is that destination's label, else the key itself. Default: the first destination. */
  home?: string;
  /** The signed-in workspace, drawn under the lockup when expanded. It opens the workspace switcher. Empty draws no chip. */
  workspace?: string;
  /** The key of the row that carries the pill. A key no destination has marks none. */
  active?: string;
  /** drill-in: the active destination's sections with its icon at the top (sections, where the rail rests), or the destinations (menu). */
  level?: NavRailLevel;
  /** drill-in: the current section of the active destination. When it names none of them, the first is current. */
  section?: string;
  /** In rail order. A destination's `sections` are what drill-in lists. */
  destinations?: NavItem[];
  /** Draws the Search row (its field while expanded). */
  search?: boolean;
  searchKeys?: string;
  /** The rows above the profile: notifications, a bug report. A badge counts as it does on a destination, but expanded it reads "{label} · {count}" with no pill. */
  utilities?: NavItem[];
  /** The person's name, in the profile button. Empty draws no profile button. */
  userName?: string;
  email?: string;
  avatarSrc?: string;
  /** The colour of the profile's initials when there is no `avatarSrc`. */
  identity?: AvatarIdentity;
  presence?: AvatarPresence;
  /** A card above the bottom rows, such as an update notice. */
  notice?: ReactNode;
  onActiveChange?: (active: string) => void;
  onLevelChange?: (level: NavRailLevel) => void;
  onSectionChange?: (section: string) => void;
  onSearch?: () => void;
  /** A utility row was pressed: its item, whole. */
  onAction?: (item: NavItem) => void;
  onProfile?: () => void;
  onWorkspace?: () => void;
  /** The menu the workspace chip opens is open: the chip's `aria-expanded`. The app opens it from `onWorkspace`. */
  workspaceMenuOpen?: boolean;
  /** The menu the profile button opens is open: the button's `aria-expanded`. The app opens it from `onProfile`. */
  profileMenuOpen?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, row: {…}, profile: {…} }`. */
  styles?: PartStyles<"nav-rail">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["nav-rail"]>;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide is the recipe's. */
const rowBase: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: t.space.smMd,
  flexShrink: 0,
  transition: `background ${t.duration.base} ${t.ease.out}, color ${t.duration.fast}`,
};

const rowExpanded: CSSProperties = { width: "100%", justifyContent: "flex-start", paddingInline: t.space.md };
const rowLabel: CSSProperties = { ...text, ...truncate(1), flex: 1, textAlign: "left" };

/** The destination list and the workspace column scroll when they do not fit, so the utilities and the profile stay in view. */
const scrolling: CSSProperties = { minHeight: 0, flexShrink: 1, overflowY: "auto" };
const cornerBadge: CSSProperties = { position: "absolute", top: t.navRail.badgeTop, left: t.navRail.badgeLeft, whiteSpace: "nowrap" };
const centred: CSSProperties = { flexShrink: 0, alignItems: "center", justifyContent: "center" };
const chip: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  gap: t.space["2xs"],
  alignSelf: "flex-start",
  maxWidth: "100%",
  marginLeft: t.space.xs,
  paddingInline: t.space.sm,
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: t.border.default,
};

interface RowProps {
  expanded: boolean;
  label: string;
  title: string;
  current?: boolean;
  haspopup?: "dialog";
  /** drill-in, on the menu: the row opens its sections, which a chevron says on hover when expanded. */
  opens?: boolean;
  onPress: () => void;
  styles?: PartStyles<"nav-rail">;
  children: ReactNode;
}

/** One 40px row: a circle collapsed, a pill expanded. The current row is the coral-soft pill. */
function RailRow({ expanded, label, title, current = false, haspopup, opens = false, onPress, styles, children }: RowProps) {
  const ui = useInteraction();
  const r = useRecipe(recipes["nav-rail"], { state: { on: current, hover: ui.hovered, focus: ui.focused }, styles });
  const dir = useDirection();
  return (
    <button
      type="button"
      data-af-part="row"
      data-af-press
      aria-label={label}
      title={title}
      aria-current={current ? "page" : undefined}
      aria-haspopup={haspopup}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(rowBase, partStyle(r, "row", expanded && rowExpanded))}
    >
      {children}
      {opens && expanded && (ui.hovered || ui.focused) && <Icon part="chevron" name={dir === "rtl" ? "chevron-left" : "chevron-right"} size={r.chevron.width} style={partStyle(r, "chevron", { opacity: 0.75 })} />}
    </button>
  );
}

function Separator({ expanded, styles }: { expanded: boolean; styles?: PartStyles<"nav-rail"> }) {
  const r = useRecipe(recipes["nav-rail"], { styles });
  return <div aria-hidden data-af-part="separator" style={css({ width: expanded ? "calc(100% - 20px)" : 24, flexShrink: 0, marginBlock: t.space["3xs"], alignSelf: "center" }, r.separator)} />;
}

export function NavRail({
  variant = "flat",
  expanded = false,
  logo,
  title = "",
  home = "",
  workspace = "",
  active,
  level,
  section,
  destinations = [],
  search: showSearch = false,
  searchKeys = "Mod+K",
  utilities = [],
  userName = "",
  email = "",
  avatarSrc = "",
  identity = "ink",
  presence = "active",
  notice,
  onActiveChange,
  onLevelChange,
  onSectionChange,
  onSearch,
  onAction,
  onProfile,
  onWorkspace,
  workspaceMenuOpen = false,
  profileMenuOpen = false,
  styles,
  strings,
  style,
  ref: givenRef,
  ...rest
}: NavRailProps) {
  const s = useStrings("nav-rail", strings);
  const { shortcutOs } = usePlatform();
  const dir = useDirection();
  const open = expanded;
  const [current = "", setCurrent] = useControllable(active, onActiveChange);
  const [depth = "sections", setDepth] = useControllable(level, onLevelChange);
  const [picked = "", setPicked] = useControllable(section, onSectionChange);
  // Which way the rail last moved between its levels, so the list that arrives slides in from that side. Null until it moves.
  const [moved, setMoved] = useState<"in" | "out" | null>(null);
  // The section last open in each destination, so opening it again goes back there.
  const remembered = useRef<Record<string, string>>({});
  const refocus = useRef(false);
  const rootRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const lockup = useInteraction();
  const pill = useInteraction();
  const search = useInteraction();
  const profile = useInteraction();
  const r = useRecipe(recipes["nav-rail"], { variants: { expanded: open }, styles });
  const rLockup = useRecipe(recipes["nav-rail"], { state: { hover: lockup.hovered, focus: lockup.focused }, styles });
  const rPill = useRecipe(recipes["nav-rail"], { state: { hover: pill.hovered, focus: pill.focused }, styles });
  const rSearch = useRecipe(recipes["nav-rail"], { state: { focus: search.focused }, styles });
  const rProfile = useRecipe(recipes["nav-rail"], { state: { hover: profile.hovered, focus: profile.focused }, styles });
  const searchTitle = s("searchHint", { keys: formatShortcut(searchKeys, shortcutOs) });
  const fade = enter("fade");

  const drills = variant === "drill-in";
  const here = destinations.find((d) => d.key === current);
  const inside = drills && depth === "sections" && !!here?.sections?.length;
  const sections = inside ? here!.sections! : [];
  // "none": a page that belongs to no section (a destination's settings) lights no section row.
  const sectionKey = picked === "none" ? undefined : sections.some((x) => x.key === picked) ? picked : sections[0]?.key;
  // Where the lockup goes: `home`, else the first destination. Its name is that destination's label, else the key itself.
  const homeKey = home || destinations[0]?.key || "";
  const homeLabel = destinations.find((d) => d.key === homeKey)?.label ?? homeKey;

  // The pressed row is replaced by the next level's, so focus follows to the row that is now current.
  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    listRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
  }, [inside, current]);

  const holdFocus = () => {
    refocus.current = !!rootRef.current?.contains(document.activeElement);
  };
  const go = (key: string) => {
    const d = destinations.find((x) => x.key === key);
    setCurrent(key);
    if (!drills || !d?.sections?.length) return;
    holdFocus();
    setMoved("in");
    setDepth("sections");
    setPicked(remembered.current[key] ?? d.sections[0]!.key);
  };
  const back = () => {
    holdFocus();
    setMoved("out");
    setDepth("menu");
  };
  const pick = (key: string) => {
    remembered.current[current] = key;
    setPicked(key);
  };

  const entry = (item: NavItem, on: boolean, press: () => void, opens = false) => {
    const badge = item.badge ?? 0;
    const unread = item.badgeLabel ?? s("unread");
    return (
      <RailRow
        key={item.key}
        expanded={open}
        label={badge > 0 ? s("rowUnread", { label: item.label, count: badge }) : item.label}
        title={item.label}
        current={on}
        opens={opens}
        onPress={press}
        styles={styles}
      >
        <span style={css(box, { flexShrink: 0 })}>
          <Icon part="icon" name={item.icon} size={r.icon.width} style={r.icon} />
          {!open && badge > 0 && <Badge count={badge} max={item.max || 9} label={unread} style={rtl(cornerBadge, dir)} />}
        </span>
        {open && <span style={css(rtl(rowLabel, dir), fade)}>{item.label}</span>}
        {open && badge > 0 && <Badge count={badge} max={item.max || 9} label={unread} style={{ alignSelf: "center" }} />}
      </RailRow>
    );
  };

  const lockupBox = css(pressable, { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: t.space.sm, flexShrink: 0 });
  const lockupLook = (rr: typeof rLockup) => partStyle(rr, "lockup", open && { width: "auto", paddingInline: t.space.xs });

  return (
    <nav
      ref={(el) => {
        rootRef.current = el;
        if (typeof givenRef === "function") givenRef(el);
        else if (givenRef) (givenRef as { current: HTMLElement | null }).current = el;
      }}
      aria-label={s("main")}
      data-af-part="root"
      {...rootProps(rest)}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !inside) return;
        e.stopPropagation();
        back();
      }}
      style={css(
        box,
        {
          height: "100%",
          flexShrink: 0,
          alignItems: "center",
          gap: t.space.mdLg,
          paddingBlock: t.space.lg,
          transition: `width ${t.duration.base} ${t.ease.standard}`,
        },
        partStyle(r, "root", open && { alignItems: "stretch", paddingInline: t.space.md }),
        style,
      )}
    >
      <div style={css(box, { alignItems: open ? "stretch" : "center", gap: open ? t.space["2xs"] : 14 })}>
        {/* Collapsed, a `title` alone has nothing to draw (the wordmark shows only expanded), so no empty button is drawn for it. */}
        {inside || logo || (open && title) ? (
          <div style={css(box, { alignItems: "center", gap: open ? t.space["2xs"] : 14 }, open && { flexDirection: "row" })}>
            {inside ? (
              // drill-in: the destination's icon takes the logo's place, and pressing it goes back to the destinations.
              <button
                type="button"
                data-af-part="lockup"
                data-af-press
                aria-label={s("backFrom", { label: here!.label })}
                title={s("backToMainKey")}
                onClick={() => back()}
                {...lockup.handlers}
                style={css(lockupBox, lockupLook(rLockup))}
              >
                <span data-af-part="logo" style={css(box, centred, partStyle(r, "logo", moved === "in" && enter("pop")))}>
                  <Icon part="tileIcon" name={lockup.hovered || lockup.focused ? "arrow-left" : here!.icon} size={r.tileIcon.width} style={r.tileIcon} />
                </span>
                {open && (
                  <span key={here!.key} data-af-part="wordmark" style={css(text, partStyle(r, "wordmark", fade))}>
                    {here!.label}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                data-af-part="lockup"
                data-af-press
                aria-label={
                  homeLabel
                    ? workspace
                      ? s("lockup", { title, workspace, home: homeLabel })
                      : s("lockupNoWorkspace", { title, home: homeLabel })
                    : workspace
                      ? s("lockupNoHome", { title, workspace })
                      : title
                }
                title={workspace ? s("lockupTitle", { title, workspace }) : title}
                onClick={() => homeKey && go(homeKey)}
                {...lockup.handlers}
                style={css(lockupBox, lockupLook(rLockup))}
              >
                {logo ? (
                  <span data-af-part="logo" style={css(box, centred, partStyle(r, "logo", moved === "out" && enter("pop")))}>
                    {typeof logo === "string" ? (
                      <span aria-hidden data-af-part="logoGlyph" style={css(text, { lineHeight: 1 }, r.logoGlyph)}>
                        {logo}
                      </span>
                    ) : (
                      logo
                    )}
                  </span>
                ) : null}
                {open && title ? <span data-af-part="wordmark" style={css(text, partStyle(r, "wordmark", fade))}>{title}</span> : null}
              </button>
            )}
          </div>
        ) : null}
        {open && inside && (
          <button
            type="button"
            data-af-part="pill"
            data-af-press
            aria-label={s("backToMain")}
            onClick={() => back()}
            {...pill.handlers}
            style={css(rtl(chip, dir), rtl({ paddingLeft: t.space.xs }, dir), partStyle(rPill, "pill", fade))}
          >
            <Icon part="chevron" name={dir === "rtl" ? "chevron-right" : "chevron-left"} size={r.chevron.width} style={partStyle(r, "chevron", { opacity: 0.75 })} />
            <span style={css(text, truncate(1))}>{s("mainMenu")}</span>
          </button>
        )}
        {open && !inside && workspace ? (
          <button
            type="button"
            data-af-part="pill"
            data-af-press
            aria-label={s("workspace", { name: workspace })}
            aria-haspopup="menu"
            aria-expanded={workspaceMenuOpen}
            onClick={() => onWorkspace?.()}
            {...pill.handlers}
            style={css(rtl(chip, dir), partStyle(rPill, "pill", fade))}
          >
            <span style={css(text, truncate(1))}>{workspace}</span>
            <Icon part="chevron" name="chevron-down" size={r.chevron.width} style={partStyle(r, "chevron", { opacity: 0.75 })} />
          </button>
        ) : null}
      </div>

      <Separator expanded={open} styles={styles} />

      {showSearch ? (
        open ? (
          <button
            type="button"
            data-af-part="search"
            data-af-press
            aria-label={s("searchLabel")}
            title={searchTitle}
            aria-haspopup="dialog"
            onClick={() => onSearch?.()}
            {...search.handlers}
            style={css(
              pressable,
              {
                flexDirection: "row",
                alignItems: "center",
                gap: t.space.sm,
                flexShrink: 0,
                ...rtl({ paddingLeft: t.space.md, paddingRight: t.space["2xs"] }, dir),
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: search.hovered ? t.border.muted : t.border.subtle,
              },
              partStyle(rSearch, "search", fade),
            )}
          >
            <Icon part="searchIcon" name="search" size={r.searchIcon.width} style={r.searchIcon} />
            <span style={rtl(css(text, { flex: 1, textAlign: "left" }), dir)}>{s("search")}</span>
            <Kbd keys={searchKeys} style={{ alignSelf: "center" }} />
          </button>
        ) : (
          <RailRow expanded={false} label={s("search")} title={searchTitle} haspopup="dialog" onPress={() => onSearch?.()} styles={styles}>
            <Icon part="icon" name="search" size={r.icon.width} style={r.icon} />
          </RailRow>
        )
      ) : null}

      <nav
        ref={listRef}
        key={inside ? `sections-${current}` : "menu"}
        aria-label={inside ? s("sections", { label: here!.label }) : s("mode")}
        style={css(box, { alignItems: open ? "stretch" : "center", gap: t.space["2xs"] }, scrolling, moved === "in" && enter("slide-left"), moved === "out" && enter("slide-right"))}
      >
        {inside
          ? sections.map((x) => entry(x, x.key === sectionKey, () => pick(x.key)))
          : destinations.map((d) => entry(d, d.key === current, () => go(d.key), drills && !!d.sections?.length))}
      </nav>

      <div style={{ flex: 1, minHeight: t.space.md }} />

      {notice ? <div style={css(box, { alignSelf: "stretch" })}>{notice}</div> : null}

      {utilities.map((u) => {
        const badge = u.badge ?? 0;
        return (
          <RailRow
            key={u.key}
            expanded={open}
            label={badge > 0 ? s("rowUnread", { label: u.label, count: badge }) : u.label}
            title={u.label}
            onPress={() => onAction?.(u)}
            styles={styles}
          >
            <span style={css(box, { flexShrink: 0 })}>
              <Icon part="icon" name={u.icon} size={r.icon.width} style={r.icon} />
              {!open && badge > 0 && <Badge count={badge} max={u.max || 9} label={u.badgeLabel ?? s("unread")} style={rtl(cornerBadge, dir)} />}
            </span>
            {open && <span style={rtl(rowLabel, dir)}>{badge > 0 ? s("utilityCount", { label: u.label, count: badge }) : u.label}</span>}
          </RailRow>
        );
      })}

      <Separator expanded={open} styles={styles} />

      {userName ? (
        <button
          type="button"
          data-af-part="profile"
          data-af-press
          aria-label={
            presence === "none"
              ? s("profile", { name: userName })
              : s("profileWithPresence", {
                  name: userName,
                  presence: presence === "active" ? s("presenceActive") : presence === "away" ? s("presenceAway") : presence === "dnd" ? s("presenceDnd") : s("presenceOffline"),
                })
          }
          title={s("profile", { name: userName })}
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          onClick={() => onProfile?.()}
          {...profile.handlers}
          style={css(
            pressable,
            { flexDirection: "row", alignItems: "center", gap: t.space.smMd, flexShrink: 0 },
            !open && { alignSelf: "center" },
            open && rtl({ width: "100%", padding: `${t.space["2xs"]} ${t.space.md} ${t.space["2xs"]} ${t.space["2xs"]}` }, dir),
            rProfile.profile,
          )}
        >
          <Avatar name={userName} src={avatarSrc} size="lg" identity={identity} presence={presence} />
          {open && (
            <span style={css(box, { flex: 1 })}>
              <span data-af-part="profileName" style={css(text, truncate(1), rtl({ textAlign: "left" }, dir), r.profileName)}>{userName}</span>
              <span data-af-part="profileEmail" style={css(text, truncate(1), rtl({ textAlign: "left" }, dir), r.profileEmail)}>{email}</span>
            </span>
          )}
        </button>
      ) : null}
    </nav>
  );
}
