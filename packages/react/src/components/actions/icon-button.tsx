import { type CSSProperties } from "react";
import { recipes, tokens, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useCoarsePointer, useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { css, pressable } from "../../lib/style";
import { Avatar, type AvatarIdentity, type AvatarPresence } from "../display/avatar";
import { Badge } from "../display/badge";

export type IconButtonVariant = "ghost" | "soft" | "solid" | "outline";
export type IconButtonShape = "circle" | "square";
export type IconButtonSize = "sm" | "md";
export type IconButtonTone = "neutral" | "danger";

/** The person an avatar button stands for: their face fills the button in place of the icon. */
export interface IconButtonAvatar {
  name: string;
  src?: string;
  identity?: AvatarIdentity;
  presence?: AvatarPresence;
}

export interface IconButtonProps extends RootProps<HTMLButtonElement> {
  icon: IconName;
  /** The tooltip and the accessible name: an icon is never unnamed. */
  label: string;
  variant?: IconButtonVariant;
  shape?: IconButtonShape;
  size?: IconButtonSize;
  /** Toggled on (e.g. the notification rail is open). Sets aria-pressed. */
  active?: boolean;
  /** A toggle button: pressing flips `active`. Off for one-shot actions (Close, Copy, Clear), which only give press feedback. */
  toggle?: boolean;
  tone?: IconButtonTone;
  /** Unread count drawn on the corner, capped at 9+. 0 hides it. */
  badge?: number;
  dot?: boolean;
  disabled?: boolean;
  /** A person's face in place of the icon (a profile button). The label stays the name read aloud; the face is hidden from screen readers so it is not read twice. */
  avatar?: IconButtonAvatar;
  /** A toggle's `active`, as the press leaves it: flipped. A one-shot button never changes it. */
  onActiveChange?: (active: boolean) => void;
  /** The button was pressed, toggle or not. */
  onPress?: () => void;
  /** The recipe part this button is in another component (`data-af-part`), when it is one: a search field's `clear`, a dialog's `close`. Its own is `root`; its glyph is then `<part>Icon`, so the other component's `icon` stays its own. */
  part?: string;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…} }`. */
  styles?: PartStyles<"icon-button">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["icon-button"]>;
  style?: CSSProperties;
}

/** Layout and motion no token decides; what the tokens decide (size, colours, radius) is the recipe's. */
const root: CSSProperties = {
  ...pressable,
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: `background ${t.duration.fast}, color ${t.duration.fast}, transform ${t.duration.fast} ${t.ease.out}`,
};

const badgeAt: CSSProperties = { position: "absolute", top: t.iconButton.badgeTop, right: t.iconButton.badgeRight };

/** The avatar part fills the button; the face inside fills the part. */
const avatarBox: CSSProperties = { display: "flex", width: "100%", height: "100%" };
const avatarFill: CSSProperties = { width: "100%", height: "100%" };

export function IconButton({
  icon,
  label,
  variant = "ghost",
  shape = "circle",
  size = "md",
  active = false,
  toggle = false,
  tone = "neutral",
  badge = 0,
  dot = false,
  disabled = false,
  avatar,
  onActiveChange,
  onPress,
  part = "root",
  styles,
  strings,
  style,
  ...rest
}: IconButtonProps) {
  const s = useStrings("icon-button", strings);
  const ui = useInteraction({ disabled });
  const [on, setOn] = useControllable(active, onActiveChange);
  // A finger on a touch laptop gets the phone profile's box (hIcon, or hIconSm for sm); the glyph keeps its size.
  const coarse = useCoarsePointer();
  const r = useRecipe(recipes["icon-button"], {
    variants: { variant, shape, size, active: on, tone },
    state: { hover: ui.hovered, focus: ui.focused, pressed: ui.pressed, disabled: ui.disabled },
    styles,
  });
  const side = size === "sm" ? tokens.profiles.mobile.control.hIconSm : tokens.profiles.mobile.control.hIcon;
  return (
    <button
      type="button"
      data-af-part={part}
      data-af-press
      title={label}
      aria-label={badge > 0 ? s("labelWithUnread", { label, count: badge }) : label}
      // A toggle always says whether it is on; a one-shot button only when something left it on.
      aria-pressed={toggle || on ? on : undefined}
      disabled={ui.disabled}
      onClick={() => {
        if (toggle) setOn(!on);
        onPress?.();
      }}
      {...ui.handlers}
      {...rootProps(rest)}
      style={css(root, partStyle(r, "root", coarse && { width: side, height: side }, ui.disabled && { cursor: "not-allowed" }), style)}
    >
      {avatar ? (
        // The face fills the button's box (its own sizes differ per platform), and is hidden: the label already names it.
        <span aria-hidden data-af-part="avatar" style={css(avatarBox, r.avatar)}>
          <Avatar
            name={avatar.name}
            src={avatar.src ?? ""}
            identity={avatar.identity ?? "indigo"}
            presence={avatar.presence ?? "none"}
            size={size === "sm" ? "sm" : "md"}
            shape={shape}
            styles={{ root: avatarFill }}
          />
        </span>
      ) : (
        <Icon part={part === "root" ? "icon" : `${part}Icon`} name={icon} size={r.icon.width} style={r.icon} />
      )}
      {(badge > 0 || dot) && <Badge count={badge} dot={dot} max={9} style={badgeAt} />}
    </button>
  );
}
