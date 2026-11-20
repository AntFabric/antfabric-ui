import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { Avatar, type AvatarIdentity, type AvatarPresence } from "../display/avatar";
import { hitSlopTo } from "../../lib/a11y";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Badge } from "../display/badge";
import { bezier } from "../../lib/motion";

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

export interface IconButtonProps extends RootProps {
  icon: IconName;
  /** The accessibility label: an icon is never unnamed. */
  label: string;
  variant?: IconButtonVariant;
  shape?: IconButtonShape;
  size?: IconButtonSize;
  /** Toggled on (e.g. the filter sheet is narrowing the list). Sets accessibilityState.selected. */
  active?: boolean;
  /** A toggle button: tapping flips `active`. Off for one-shot actions (Close, Copy, Clear), which only give press feedback. */
  toggle?: boolean;
  /** danger turns the glyph red only while pressed: a resting red icon reads as an error. */
  tone?: IconButtonTone;
  /** Unread count drawn on the corner, capped at 9+. 0 hides it. */
  badge?: number;
  dot?: boolean;
  disabled?: boolean;
  /** A person's face in place of the icon (a profile button). The label stays the name read aloud; the face is hidden from screen readers so it is not read twice. */
  avatar?: IconButtonAvatar;
  /** A toggle's `active`, as the tap leaves it: flipped. A one-shot button never changes it. */
  onActiveChange?: (active: boolean) => void;
  /** The button was tapped, toggle or not. */
  onPress?: () => void;
  /** The test id this button has in another component (`<id>.<part>`, a search field's `search-field.clear`), when it is a part of one. Its own is `icon-button.root`. */
  testID?: string;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…} }`. */
  styles?: PartStyles<"icon-button">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["icon-button"]>;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Layout no token decides; what the tokens decide (size, colours, radius) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: t.iconButton.badgeTop, right: t.iconButton.badgeRight },
  // The avatar part fills the button; the face inside fills the part.
  avatar: { width: "100%", height: "100%", overflow: "hidden" },
  face: { width: "100%", height: "100%" },
}));

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
  testID = "icon-button.root",
  styles,
  strings,
  style,
  ...rest
}: IconButtonProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("icon-button", strings);
  const press = usePress({ disabled });
  const [on, setOn] = useControllable(active, onActiveChange);
  // A phone has no hover, and a press only scales: the recipe's phone layers keep the resting fill under the finger.
  const r = useRecipe(recipes["icon-button"], { variants: { variant, shape, size, active: on, tone }, state: { pressed: press.pressed, focus: press.focused, disabled: press.disabled }, styles });
  const side = r.root.view.width as number;
  // The icon's size is its width and height (`size`); what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _h, ...iconRest } = r.icon.view;
  const iconStyle = Object.keys(iconRest).length ? iconRest : undefined;

  // Scales to .92 under the finger and eases back.
  const scale = useRef(new Animated.Value(press.pressed ? 0.92 : 1)).current;
  useEffect(() => {
    const run = Animated.timing(scale, {
      toValue: press.pressed ? 0.92 : 1,
      duration: t.duration.fast,
      easing: bezier(t.ease.out),
      useNativeDriver: Platform.OS !== "web",
    });
    run.start();
    return () => run.stop();
  }, [press.pressed, scale, t.duration, t.ease]);

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={badge > 0 ? str("labelWithUnread", { label, count: badge }) : label}
      // A toggle always says whether it is on; a one-shot button only when something left it on.
      accessibilityState={{ disabled: press.disabled, selected: toggle || on ? on : undefined }}
      disabled={press.disabled}
      // The visible box is 40pt (32 for sm); the target reaches 44.
      hitSlop={hitSlopTo(t.control.hit, side, side)}
      onPress={() => {
        if (toggle) setOn(!on);
        onPress?.();
      }}
      {...press.handlers}
      {...rootProps(rest)}
      style={[s.root, r.root.view, { transform: [{ scale }] }, style]}
    >
      {avatar ? (
        // The face fills the button's box (its own sizes differ per platform), and is hidden: the label already names it.
        <View testID="icon-button.avatar" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.avatar, r.avatar.view]}>
          <Avatar
            name={avatar.name}
            src={avatar.src ?? ""}
            identity={avatar.identity ?? "indigo"}
            presence={avatar.presence ?? "none"}
            size={size === "sm" ? "sm" : "md"}
            shape={shape}
            style={s.face}
          />
        </View>
      ) : (
        <Icon testID="icon-button.icon" name={icon} size={iconSize as number} color={r.icon.text.color ?? r.root.text.color} style={iconStyle} />
      )}
      {badge > 0 || dot ? <Badge count={badge} dot={dot} max={9} style={s.badge} /> : null}
    </AnimatedPressable>
  );
}
