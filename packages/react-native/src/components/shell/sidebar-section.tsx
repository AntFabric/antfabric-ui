import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { useRecipe, type PartStyle, type PartStyles } from "../../lib/recipe";
import { IconButton } from "../actions/icon-button";
import { Badge } from "../display/badge";
import { SidebarItem, type SidebarItemProps } from "./sidebar-item";
import { bezier, useReducedMotion } from "../../lib/motion";
import { fontScale } from "../../lib/type";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

/** One row: SidebarItem's props and a `key`, but the section decides which row is open (`selected`) and a row's press is the section's `onSelectedChange`. */
export type SidebarSectionItem = Omit<SidebarItemProps, "selectedName" | "onPress" | "onLongPress"> & {
  /** What `selected`, `onSelectedChange` and `onItemLongPress` name the row by. */
  key: string;
};

/** A `selectedName` no row has, so that while another row is selected this one is not open. */
const NOT_OPEN = "\u0000";

export interface SidebarSectionProps extends RootProps {
  label: string;
  /** Drawn before the label, in the section's accent (a star for Starred). */
  icon?: IconName;
  /** Whether the rows are shown. Collapsed, the header carries the unread total and only the open row stays. */
  expanded?: boolean;
  /** The key of the row that is open. Empty falls back to each item's own `active`; pressing a row sets it. */
  selected?: string;
  /** Unread across the section's rows. Drawn only while collapsed. */
  unread?: number;
  /** The + action's name: 'Add channels', 'New message', 'Add to this section'. Default: the `add` string. */
  addLabel?: string;
  /** Draws +. On a phone it is always there; the section's other actions are a long press on the header. */
  actionsVisible?: boolean;
  /** A hairline above the header, parting it from the section before. Off for the first section. */
  divided?: boolean;
  /** Shown when the section has no rows, e.g. Starred before anything is starred. */
  emptyText?: string;
  items?: SidebarSectionItem[];
  onExpandedChange?: (expanded: boolean) => void;
  /** A row was pressed: its `key`. */
  onSelectedChange?: (selected: string) => void;
  /** A row was long-pressed: its `key`. The app opens the row's action sheet from it. */
  onItemLongPress?: (key: string) => void;
  onAdd?: () => void;
  /** A long press on the header, and the "options" accessibility action in its place: Rename, Sort, Move up, Move down, Delete. */
  onMenu?: () => void;
  /** Per-part styles over the theme: `{ header: {…}, toggle: {…}, label: {…} }`. */
  styles?: PartStyles<"sidebar-section">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["sidebar-section"]>;
  style?: ViewStyle;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { width: "100%" },
  header: { flexDirection: "row", alignItems: "center", gap: t.space["2xs"], paddingTop: t.space.lg, paddingBottom: t.space["2xs"], paddingRight: t.space.xs },
  toggle: { flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 },
  label: { flexShrink: 1, minWidth: 0 },
  badge: { alignSelf: "center" },
  actions: { flexDirection: "row", alignItems: "center", gap: t.space["3xs"] },
  empty: { paddingVertical: t.space.xs },
}));

/** An icon part as the glyph draws it: its width is the size, its text colour the ink, the rest of its view style (what `styles` adds) the glyph's style. */
function glyphOf(p: PartStyle) {
  const { width, height: _height, ...rest } = p.view as ViewStyle;
  return { size: width as number, color: p.text.color, style: Object.keys(rest).length ? (rest as ViewStyle) : undefined };
}

export function SidebarSection({
  label,
  icon = "",
  expanded = true,
  selected = "",
  unread = 0,
  addLabel = "",
  actionsVisible = true,
  divided = true,
  emptyText = "",
  items = [],
  onExpandedChange,
  onSelectedChange,
  onItemLongPress,
  onAdd,
  onMenu,
  styles,
  strings,
  style,
  testID,
  ...rest
}: SidebarSectionProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("sidebar-section", strings);
  const press = usePress();
  const reduceMotion = useReducedMotion();
  // A phone has no hover, so there is none here.
  const r = useRecipe(recipes["sidebar-section"], { variants: { divided }, state: { focus: press.focused }, styles });
  const [isOpen, setExpanded] = useControllable(expanded, onExpandedChange);
  const shut = !isOpen;
  const [open, setOpen] = useControllable(selected, onSelectedChange);
  const shown = items.filter((item) => !shut || (open ? item.key === open : item.active));
  const chevron = glyphOf(r.chevron);
  const star = glyphOf(r.starIcon);

  // The chevron turns rather than swapping glyphs.
  const turn = useRef(new Animated.Value(shut ? 1 : 0)).current;
  useEffect(() => {
    const run = Animated.timing(turn, { toValue: shut ? 1 : 0, duration: reduceMotion ? 0 : t.duration.fast, easing: bezier(t.ease.standard), useNativeDriver: Platform.OS !== "web" });
    run.start();
    return () => run.stop();
  }, [shut, turn, t.duration, t.ease, reduceMotion]);
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-90deg"] });

  return (
    <View testID={partId(testID, "sidebar-section", "root")} {...rootProps(rest)} role="group" accessibilityLabel={label} style={[s.root, r.root.view, style]}>
      <View testID={partId(testID, "sidebar-section", "header")} style={[s.header, r.header.view]}>
        <Pressable
          testID={partId(testID, "sidebar-section", "toggle")}
          accessibilityRole="button"
          accessibilityLabel={shut && unread > 0 ? str("withUnread", { label, count: unread }) : label}
          accessibilityHint={shut ? str("expandPhone", { label }) : str("collapsePhone", { label })}
          accessibilityState={{ expanded: !shut }}
          onPress={() => setExpanded(shut)}
          onLongPress={() => onMenu?.()}
          accessibilityActions={onMenu ? [{ name: "longpress", label: str("options", { label }) }] : undefined}
          onAccessibilityAction={(e) => e.nativeEvent.actionName === "longpress" && onMenu?.()}
          {...press.handlers}
          style={[s.toggle, r.toggle.view]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon testID={partId(testID, "sidebar-section", "chevron")} name="chevron-down" {...chevron} />
          </Animated.View>
          {icon ? <Icon testID={partId(testID, "sidebar-section", "starIcon")} name={icon} {...star} /> : null}
          <Text testID={partId(testID, "sidebar-section", "label")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[s.label, r.label.view, r.label.text]}>
            {label}
          </Text>
          {shut && unread > 0 ? <Badge count={unread} label={str("unreadIn", { label })} style={s.badge} /> : null}
        </Pressable>
        {actionsVisible ? (
          <View style={s.actions}>
            <IconButton icon="plus" label={addLabel || str("add")} size="sm" onPress={() => onAdd?.()} />
          </View>
        ) : null}
      </View>
      <View accessibilityRole="list">
        {shown.map(({ key, ...item }) => (
          <SidebarItem key={key} {...item} selectedName={open ? (open === key ? item.name : NOT_OPEN) : ""} onPress={() => setOpen(key)} onLongPress={() => onItemLongPress?.(key)} />
        ))}
        {!shut && items.length === 0 && emptyText ? <Text testID={partId(testID, "sidebar-section", "emptyText")} maxFontSizeMultiplier={fontScale.content} style={[s.empty, r.emptyText.view, r.emptyText.text]}>{emptyText}</Text> : null}
      </View>
    </View>
  );
}
