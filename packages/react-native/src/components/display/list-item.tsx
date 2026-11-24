import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, Text, View, type AccessibilityRole, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { Avatar, type AvatarIdentity } from "./avatar";
import { Badge } from "./badge";
import { bezier } from "../../lib/motion";

export type ListItemLeading = "none" | "icon" | "tile" | "avatar";
export type ListItemRole = "link" | "menuitem" | "option" | "checkbox" | "button";

export interface ListItemAvatar {
  name: string;
  identity?: AvatarIdentity;
  src?: string;
}

export interface ListItemProps extends RootProps {
  title: string;
  /** Up to two lines. */
  subtitle?: string;
  /** How many lines the title may take before it truncates. The phone's default is 2; the web's is 1. */
  titleLines?: number;
  /** Every glyph sits in a tile on the phone (icon and tile draw the same); avatar is a face. */
  leading?: ListItemLeading;
  icon?: IconName;
  /** The face when leading is avatar. */
  avatar?: ListItemAvatar;
  /** Tile and face size: 36 holds a 20pt glyph, 32 a 16pt glyph and a 16pt chevron (Settings). */
  tile?: 32 | 36;
  /** Trailing text: a time, a value ("Mentions only"), a size, a channel. */
  detail?: string;
  /** Unread mentions, drawn as the coral Badge. 0 hides it. */
  count?: number;
  /** The row opens another screen. */
  chevron?: boolean;
  /** The chosen row (a trailing check), or a ticked row in a multi-select picker. */
  selected?: boolean;
  /** Bold title in strong ink: something is new without a mention. */
  unread?: boolean;
  disabled?: boolean;
  /** Leave, delete, remove: red title and glyph. */
  destructive?: boolean;
  /** A hairline under the row, for card-less lists. */
  divider?: boolean;
  role?: ListItemRole;
  /** Called with `selected` as the tap leaves it: a tap toggles it on a selection row (role option or checkbox) only. */
  onSelectedChange?: (selected: boolean) => void;
  /** The row was tapped. Opening what the row stands for is the caller's. */
  onPress?: () => void;
  /** Acts on the row instead of opening it (a menu of what can be done to it). Also offered as the "More actions" accessibility action. */
  onLongPress?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, title: {…}, detail: {…} }`. */
  styles?: PartStyles<"list-item">;
  /** Built-in text (the row's accessible name, its count badge's label, the long-press action) for this instance. */
  strings?: Partial<KitStrings["list-item"]>;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** A glyph's size is its view's width and height; what else the part's style sets goes on the glyph. */
const glyphOf = (view: ViewStyle) => {
  const { width, height: _h, ...rest } = view;
  return { size: width as number, style: Object.keys(rest).length ? rest : undefined };
};

const ROLE: Record<ListItemRole, AccessibilityRole> = { link: "link", menuitem: "menuitem", option: "button", checkbox: "checkbox", button: "button" };

/** Layout no token decides; what the tokens decide (the tile, the type, the checkbox box) is the recipe's. */
const useStyles = createStyles((t) => ({
  // The row's 12pt inset is a StyleSheet `padding` (see the recipe).
  root: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", padding: t.space.md },
  tile: { alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0, gap: 1 },
  detail: { flexShrink: 0 },
  box: { alignItems: "center", justifyContent: "center" },
}));

export function ListItem({
  title,
  subtitle = "",
  titleLines = 2,
  leading = "icon",
  icon = "",
  avatar,
  tile = 36,
  detail = "",
  count = 0,
  chevron = false,
  selected,
  unread = false,
  disabled = false,
  destructive = false,
  divider = false,
  role = "link",
  onSelectedChange,
  onPress,
  onLongPress,
  styles,
  strings,
  style,
  testID,
  ...rest
}: ListItemProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("list-item", strings);
  const press = usePress({ disabled });
  const [on = false, setOn] = useControllable(selected, onSelectedChange);
  // A phone row has no fill and no hover; `selected` to the recipe is a filled row, which only the web draws.
  const r = useRecipe(recipes["list-item"], { variants: { leading, tile, unread, destructive, divider, selected: on && (role === "link" || role === "button") }, state: { on, pressed: press.pressed, focus: press.focused, disabled: press.disabled }, styles });
  const withSubtitle = subtitle ? str("withSubtitle", { title, subtitle }) : title;
  // The value the row exists to show is part of its name.
  const named = detail ? str("withDetail", { label: withSubtitle, detail }) : withSubtitle;
  const tileBox = partStyle(r, "tile", { view: [{ width: tile, height: tile }, tile === 36 && { borderRadius: 10 }] });
  const checkBox = partStyle(r, "check", { view: press.pressed && { transform: [{ scale: 0.92 }] } });
  const tileIcon = glyphOf(r.tileIcon.view);
  const tick = glyphOf(r.tick.view);
  const selectedIcon = glyphOf(r.selectedIcon.view);
  const chevronIcon = glyphOf(r.chevron.view);

  // Dims to 0.6 under the finger and eases back.
  const dim = useRef(new Animated.Value(press.pressed ? 0.6 : 1)).current;
  useEffect(() => {
    const run = Animated.timing(dim, { toValue: press.pressed ? 0.6 : 1, duration: t.motion.duration.fast, easing: bezier(t.motion.easing.out), useNativeDriver: Platform.OS !== "web" });
    run.start();
    return () => run.stop();
  }, [press.pressed, dim, t.duration, t.ease]);

  return (
    <AnimatedPressable
      testID={partId(testID, "list-item", "root")}
      accessibilityRole={ROLE[role]}
      accessibilityLabel={count > 0 ? str("withUnreadCount", { label: named, count }) : unread ? str("withUnread", { label: named }) : named}
      accessibilityActions={onLongPress ? [{ name: "longpress", label: str("longPress") }] : undefined}
      onAccessibilityAction={onLongPress ? (e) => e.nativeEvent.actionName === "longpress" && onLongPress() : undefined}
      accessibilityState={role === "checkbox" ? { disabled: press.disabled, checked: on } : { disabled: press.disabled, selected: on }}
      disabled={press.disabled}
      onPress={() => {
        // Only a selection row (an option, a checkbox) toggles; a link, button or menu row's `selected` is the app's.
        if (role === "option" || role === "checkbox") setOn(!on);
        onPress?.();
      }}
      onLongPress={onLongPress ? () => onLongPress() : undefined}
      {...press.handlers}
      {...rootProps(rest)}
      style={[s.root, r.root.view, { opacity: press.disabled ? r.root.view.opacity : dim }, style]}
    >
      {leading === "icon" || leading === "tile" ? (
        <View testID={partId(testID, "list-item", "tile")} style={[s.tile, tileBox.view]}>
          {icon ? <Icon testID={partId(testID, "list-item", "tileIcon")} name={icon} size={tileIcon.size} color={r.tileIcon.text.color ?? tileBox.text.color} style={tileIcon.style} /> : null}
        </View>
      ) : null}
      {leading === "avatar" && avatar ? <Avatar decorative name={avatar.name} identity={avatar.identity} src={avatar.src} size="md" style={{ width: tile, height: tile }} /> : null}
      <View style={s.body}>
        <Text testID={partId(testID, "list-item", "title")} numberOfLines={titleLines} style={[r.title.view, r.title.text]}>
          {title}
        </Text>
        {subtitle ? (
          <Text testID={partId(testID, "list-item", "subtitle")} numberOfLines={2} style={[r.subtitle.view, r.subtitle.text]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {detail ? (
        <Text testID={partId(testID, "list-item", "detail")} numberOfLines={1} style={[s.detail, r.detail.view, r.detail.text]}>
          {detail}
        </Text>
      ) : null}
      {count > 0 ? <Badge count={count} style={{ alignSelf: "center" }} /> : null}
      {role === "checkbox" ? (
        // The row is the checkbox; the box only draws it.
        <View testID={partId(testID, "list-item", "check")} importantForAccessibility="no-hide-descendants" style={[s.box, checkBox.view]}>
          {on ? (
            <Enter motion="pop">
              <Icon testID={partId(testID, "list-item", "tick")} name="check" size={tick.size} strokeWidth={t.size.stroke.tick} color={r.tick.text.color ?? checkBox.text.color} style={tick.style} />
            </Enter>
          ) : null}
        </View>
      ) : null}
      {on && role !== "checkbox" ? (
        <Enter motion="pop">
          <Icon testID={partId(testID, "list-item", "selectedIcon")} name="check" size={selectedIcon.size} color={r.selectedIcon.text.color} style={selectedIcon.style} />
        </Enter>
      ) : null}
      {chevron ? <Icon testID={partId(testID, "list-item", "chevron")} name="chevron-right" size={chevronIcon.size} color={r.chevron.text.color} style={chevronIcon.style} /> : null}
    </AnimatedPressable>
  );
}
