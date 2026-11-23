import { memo, useState, type CSSProperties, type KeyboardEvent } from "react";
import { recipes, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, pressable, rtl, text, truncate } from "../../lib/style";
import { IconButton } from "../actions/icon-button";
import { Avatar, type AvatarIdentity, type AvatarPresence } from "../display/avatar";
import { Badge } from "../display/badge";
import { rootProps, type RootProps } from "../../lib/root-props";

export interface SidebarItemProps extends RootProps<HTMLDivElement> {
  /** The name. The row draws `glyph` before it. */
  name: string;
  /** A one-character text mark before the name, read with it ("#" for a channel). Empty draws none. */
  glyph?: string;
  /** A leading icon, not read ("lock", "users"). */
  icon?: IconName;
  /** The name's face: `avatarSrc`, `identity`, `presence` and `agent` draw it. */
  avatar?: boolean;
  /** Read after the name, not drawn ("private channel"). */
  description?: string;
  avatarSrc?: string;
  identity?: AvatarIdentity;
  presence?: AvatarPresence;
  /** A conversation with an AI agent. */
  agent?: boolean;
  /** Something new you have not read. Bold, unless muted. */
  unread?: boolean;
  /** Mentions, or every unread message in a DM. Shown even when muted. */
  mentions?: number;
  muted?: boolean;
  /** An unsent draft is waiting here. */
  draft?: boolean;
  /** This is the conversation on screen: medium weight on a grey fill, never coral. */
  active?: boolean;
  /** The row a surrounding list has selected. When set, this row is active exactly when it is the named one. */
  selectedName?: string;
  typing?: boolean;
  /** What is read while someone types. Default: the `typing` string. */
  typingText?: string;
  /** Shared with another organisation. */
  external?: boolean;
  /** The row's ⋮ (Move to…, Mute, Leave), laid over its right end. Always shown when set. With `onMenu` alone it is there but transparent until the pointer is over the row or keyboard focus is in it (the room for it is reserved, so showing it never reflows the row). */
  actionsVisible?: boolean;
  onPress?: () => void;
  /** The row's options were asked for (web and desktop): its ⋮ was pressed, the context menu was opened on it, or Shift+F10 or the Menu key was pressed on it. The app's menu opens from it. */
  onMenu?: () => void;
  /** Per-part styles over the theme: `{ row: {…}, name: {…} }`. */
  styles?: PartStyles<"sidebar-item">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["sidebar-item"]>;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide is the recipe's. */
const row: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  paddingInline: t.space.smMd,
  paddingBlock: t.space.xs,
  textAlign: "left",
  transition: `background ${t.duration.fast}, color ${t.duration.fast}`,
};

const hash: CSSProperties = { ...text, flexShrink: 0, textAlign: "center", lineHeight: 1.2 };

const menuAt: CSSProperties = { position: "absolute", right: t.space["2xs"], top: "50%", transform: "translateY(-50%)" };

function SidebarItemView({
  name,
  glyph = "",
  icon = "",
  avatar = false,
  description = "",
  avatarSrc = "",
  identity = "indigo",
  presence = "none",
  agent = false,
  unread = false,
  mentions = 0,
  muted = false,
  draft = false,
  active = false,
  selectedName = "",
  typing = false,
  typingText = "",
  external = false,
  actionsVisible = false,
  onPress,
  onMenu,
  styles,
  strings,
  style,
  ...rest
}: SidebarItemProps) {
  const s = useStrings("sidebar-item", strings);
  const ui = useInteraction();
  const dir = useDirection();
  // The ⋮ is there for a pointer over the row and for keyboard focus in it, so a keyboard user reaches Move, Mute and Leave.
  const [over, setOver] = useState(false);
  const [within, setWithin] = useState(false);
  const hasMenu = actionsVisible || !!onMenu;
  const showMenu = actionsVisible || over || within;
  const asked = (e: KeyboardEvent) => {
    if (!onMenu || !(e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey))) return;
    e.preventDefault();
    onMenu();
  };
  // Current is the app's (or the surrounding section's): a press reports itself and never makes the row current on its own.
  const open = selectedName ? selectedName === name : active;
  const dim = muted ? 0.35 : 0.55;
  const r = useRecipe(recipes["sidebar-item"], {
    variants: { active: open, unread: unread && !muted, muted },
    state: { on: open, hover: ui.hovered, focus: ui.focused, pressed: ui.pressed },
    styles,
  });
  const meta = (named: string) => <Icon part="metaIcon" name={named} size={r.metaIcon.width} style={r.metaIcon} />;
  // The row's one accessible name: '#design-crit, 3 mentions, muted, draft'. Each part that applies is added through `withDetail`.
  const details = [
    description,
    mentions > 0 ? s("withMentions", { count: mentions }) : unread && !muted ? s("unread") : "",
    muted ? s("muted") : "",
    draft ? s("draft") : "",
    typing ? typingText || s("typing") : "",
    external ? s("external") : "",
  ].filter(Boolean);
  const said = details.reduce((label, detail) => s("withDetail", { label, detail }), `${glyph}${name}`);
  return (
    <div
      {...rootProps(rest)}
      onPointerEnter={() => setOver(true)}
      onPointerLeave={() => setOver(false)}
      onFocus={() => setWithin(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setWithin(false)}
      onContextMenu={(e) => {
        if (!onMenu) return;
        e.preventDefault();
        onMenu();
      }}
      style={css(box, { width: "100%" }, style)}
    >
      <button
        type="button"
        data-af-part="row"
        data-af-press
        title={name}
        aria-label={said}
        aria-current={open ? "page" : undefined}
        onClick={() => onPress?.()}
        onKeyDown={asked}
        {...ui.handlers}
        style={css(
          rtl(row, dir),
          // Room for the ⋮ only while it is shown, so it never covers the count. One key, so React never mixes it with `padding`.
          partStyle(r, "row", hasMenu && { paddingInline: "10px 34px" }),
        )}
      >
        {glyph ? (
          <span aria-hidden data-af-part="hash" style={css(hash, partStyle(r, "hash", { opacity: dim }))}>
            {glyph}
          </span>
        ) : null}
        {icon ? <Icon part="kindIcon" name={icon} size={r.kindIcon.width} style={partStyle(r, "kindIcon", { marginInline: t.space["3xs"], opacity: dim })} /> : null}
        {avatar ? <Avatar name={name} src={avatarSrc} size="sm" identity={identity} presence={presence} agent={agent} /> : null}
        <span data-af-part="name" style={css(text, truncate(1), partStyle(r, "name", { flex: 1 }))}>
          {name}
        </span>
        {external && meta("building-2")}
        {draft && !typing && meta("pencil")}
        {typing && <Icon part="typingIcon" name="ellipsis" size={r.typingIcon.width} style={r.typingIcon} />}
        {muted && meta("bell-off")}
        {mentions > 0 && <Badge count={mentions} label={s("mentions")} style={{ alignSelf: "center" }} />}
      </button>
      {hasMenu && <IconButton icon="ellipsis-vertical" label={s("options", { name })} size="sm" style={css(rtl(menuAt, dir), { opacity: showMenu ? 1 : 0 })} onPress={() => onMenu?.()} />}
    </div>
  );
}

/** Memoised: a list of hundreds of rows re-renders only the rows whose props changed, not all of them when one is hovered or selected. */
export const SidebarItem = memo(SidebarItemView);
