import type { CSSProperties, ElementType, MouseEvent } from "react";
import { recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, pressable, text, truncate } from "../../lib/style";
import { Avatar, type AvatarIdentity } from "./avatar";
import { Badge } from "./badge";
import { rootProps, type RootProps } from "../../lib/root-props";
import { usePlatform } from "../../platform";
import { Kbd, ariaShortcut } from "./kbd";

export type ListItemLeading = "none" | "icon" | "tile" | "avatar";
export type ListItemRole = "link" | "menuitem" | "option" | "checkbox" | "button";

export interface ListItemAvatar {
  name: string;
  identity?: AvatarIdentity;
  src?: string;
}

export interface ListItemProps extends RootProps<HTMLElement> {
  title: string;
  /** One line on web and desktop. */
  subtitle?: string;
  /** How many lines the title may take before it truncates. */
  titleLines?: number;
  /** icon is a bare glyph here (sidebar and menu rows); tile is the FileRow's chip; avatar is a face. */
  leading?: ListItemLeading;
  icon?: IconName;
  /** The face when leading is avatar. */
  avatar?: ListItemAvatar;
  /** Tile size: 36 holds a 16px glyph, 32 a 14px one. */
  tile?: 32 | 36;
  /** Trailing text: a time, a value ("Mentions only"), a size, a channel. */
  detail?: string;
  /** Unread mentions, drawn as the coral Badge. 0 hides it. */
  count?: number;
  /** A menu row's keyboard shortcut, written once as `Mod+Shift+K`. */
  shortcut?: string;
  /** The row opens another screen. Settings lists; never in a menu. */
  chevron?: boolean;
  /** The open conversation (a grey fill), the chosen option (a check), or a ticked row in a multi-select picker. */
  selected?: boolean;
  /** Bold title in strong ink: something is new without a mention. */
  unread?: boolean;
  /** Dimmed and inert, but still focusable so the reason in the subtitle can be heard. */
  disabled?: boolean;
  /** Leave, delete, remove: red title and glyph. */
  destructive?: boolean;
  /** A hairline under the row, for card-less lists. */
  divider?: boolean;
  role?: ListItemRole;
  /** The row navigates: with role `link` it is an `<a href>`, so middle-click and ⌘-click open a new tab. A plain click calls `onPress` and stays on the page when there is one. */
  href?: string;
  /** Called with `selected` as the press leaves it: a press toggles it. */
  onSelectedChange?: (selected: boolean) => void;
  /** The row was pressed. Opening what the row stands for is the caller's. */
  onPress?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, title: {…}, detail: {…} }`. */
  styles?: PartStyles<"list-item">;
  /** Built-in text (the row's accessible name, its count badge's label) for this instance. */
  strings?: Partial<KitStrings["list-item"]>;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide (size, fill, ink, type, edge) is the recipe's. */
const root: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "stretch",
  paddingBlock: t.space["2xs"],
  paddingInline: t.space.smMd,
  textAlign: "start",
  // Every longhand of the bottom edge is always set (the divider's values are the recipe's), so turning the divider on and off changes values
  // and never removes one under the `<button>` reset's `border-style` and `border-color`. Written as `border-bottom: 0`, the same as before.
  borderBottomWidth: 0,
  borderBottomStyle: "none",
  borderBottomColor: "currentcolor",
  transition: `background ${t.duration.fast}, opacity ${t.duration.fast}`,
};

// Beside a tile the row is roomier.
const tiled: CSSProperties = { paddingBlock: t.space.sm, paddingInline: t.space.md };

// A divided row has no radius: its edge is the recipe's `divider`.
const divided: CSSProperties = { borderRadius: 0 };

const tileBox: CSSProperties = { ...box, flexShrink: 0, alignItems: "center", justifyContent: "center" };

const subtitleText: CSSProperties = { ...text, ...truncate(1) };

const detailText: CSSProperties = { ...text, flexShrink: 0, whiteSpace: "nowrap" };

// The Checkbox's box, drawn inside the row: the whole row is the control.
const check: CSSProperties = {
  ...box,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  transition: `background ${t.duration.base}, border-color ${t.duration.base}, transform ${t.duration.fast} ${t.ease.out}`,
};

export function ListItem({
  title,
  subtitle = "",
  titleLines = 1,
  leading = "icon",
  icon = "",
  avatar,
  tile = 36,
  detail = "",
  count = 0,
  shortcut = "",
  chevron = false,
  selected,
  unread = false,
  disabled = false,
  destructive = false,
  divider = false,
  role = "link",
  href,
  onSelectedChange,
  onPress,
  styles,
  strings,
  style,
  ...rest
}: ListItemProps) {
  const s = useStrings("list-item", strings);
  const { os } = usePlatform();
  const dir = useDirection();
  const ui = useInteraction({ disabled });
  const [on = false, setOn] = useControllable(selected, onSelectedChange);
  const filled = on && (role === "link" || role === "button");
  // `selected` to the recipe is a filled row (a ticked link or button); `on` is the checkbox's own state.
  const r = useRecipe(recipes["list-item"], {
    variants: { leading, tile, unread, destructive, divider, selected: filled },
    state: { on, hover: ui.hovered, pressed: ui.pressed, focus: ui.focused, disabled: ui.disabled },
    styles,
  });
  const withSubtitle = subtitle ? s("withSubtitle", { title, subtitle }) : title;
  // The value the row exists to show is part of its name.
  const named = detail ? s("withDetail", { label: withSubtitle, detail }) : withSubtitle;
  // A row that navigates is a link; one that does not is a button (or a menu row, an option, a checkbox: the parent supplies any roving).
  const anchor = role === "link" && !!href && !ui.disabled;
  const Row = (anchor ? "a" : "button") as ElementType;
  return (
    <Row
      type={anchor ? undefined : "button"}
      href={anchor ? href : undefined}
      data-af-part="root"
      data-af-press
      role={role === "link" ? undefined : role}
      title={title}
      aria-keyshortcuts={shortcut ? ariaShortcut(shortcut, os) : undefined}
      {...rootProps(rest)}
      aria-label={count > 0 ? s("withUnreadCount", { label: named, count }) : unread ? s("withUnread", { label: named }) : named}
      aria-current={on && role === "link" ? "page" : undefined}
      aria-checked={role === "checkbox" ? on : undefined}
      aria-selected={role === "option" ? on : undefined}
      // aria-disabled, not disabled: a disabled menu row stays focusable so its reason can be heard.
      aria-disabled={ui.disabled || undefined}
      onClick={(e: MouseEvent) => {
        if (ui.disabled) {
          e.preventDefault();
          return;
        }
        // ⌘-, ctrl- and middle-click on a link are the browser's; a plain click is the product's when it gave `onPress`.
        if (anchor && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !onPress)) return;
        if (anchor) e.preventDefault();
        setOn(!on);
        onPress?.();
      }}
      {...ui.handlers}
      style={css(root, partStyle(r, "root", leading === "tile" && tiled, divider && divided, ui.disabled && { cursor: "not-allowed" }), style)}
    >
      {leading === "icon" && icon && <Icon part="leadingIcon" name={icon} size={r.leadingIcon.width} color={r.leadingIcon.color} style={r.leadingIcon} />}
      {leading === "tile" && (
        <span data-af-part="tile" style={css(tileBox, partStyle(r, "tile", { width: tile, height: tile }, tile === 36 && { borderRadius: 10 }))}>
          {icon && <Icon part="tileIcon" name={icon} size={r.tileIcon.width} style={r.tileIcon} />}
        </span>
      )}
      {leading === "avatar" && avatar && <Avatar decorative name={avatar.name} identity={avatar.identity} src={avatar.src} size={subtitle ? "md" : "xs"} />}
      <span style={css(box, { flex: 1, gap: 1 })}>
        <span data-af-part="title" style={css(text, partStyle(r, "title", truncate(titleLines)))}>{title}</span>
        {subtitle && <span data-af-part="subtitle" style={css(subtitleText, r.subtitle)}>{subtitle}</span>}
      </span>
      {detail && <span data-af-part="detail" style={css(detailText, r.detail)}>{detail}</span>}
      {count > 0 && <Badge count={count} style={{ alignSelf: "center" }} />}
      {shortcut && <Kbd keys={shortcut} tone="bare" style={{ alignSelf: "center" }} />}
      {role === "checkbox" && (
        <span aria-hidden data-af-part="check" style={css(check, r.check)}>
          {on && <Icon part="tick" name="check" size={r.tick.width} style={partStyle(r, "tick", { strokeWidth: t.icon.strokeTick }, enter("pop"))} />}
        </span>
      )}
      {on && role === "option" && <Icon part="selectedIcon" name="check" size={r.selectedIcon.width} color={r.selectedIcon.color} style={partStyle(r, "selectedIcon", enter("pop"))} />}
      {chevron && <Icon name="chevron-right" size={t.icon.sizeMd} color={t.fg.faint} style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined} />}
    </Row>
  );
}
