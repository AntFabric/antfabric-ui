import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, Pressable, ScrollView, Text, View, type ViewStyle } from "react-native";
import { cap, recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export interface TabsItem {
  key: string;
  label: string;
  /** A count chip after the label; 0 draws none. Over 99 reads 99+. */
  badge?: number;
  /** The count is a floor: drawn as `100+`, said as "more than 100". */
  badgeMore?: boolean;
  /** The scope, for a label that does not say it. Web and desktop show it as a tooltip; the phone has none. */
  title?: string;
  /** Drawn dimmed and not pressable; it stays in the strip so its place is seen. */
  disabled?: boolean;
}

export interface TabsProps extends RootProps<ScrollView> {
  items: TabsItem[];
  /** The chosen tab's key. Empty chooses the first. */
  value?: string;
  /** The tabs share the width between them. */
  full?: boolean;
  /** The hairline under the strip. */
  rule?: boolean;
  /** The tab list's accessibility label. */
  label?: string;
  onValueChange?: (key: string) => void;
  /** Per-part styles over the theme: `{ root: {…}, tab: {…}, count: {…}, indicator: {…} }`. */
  styles?: PartStyles<"tabs">;
  /** This strip's built-in text (a count's spoken and written forms) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["tabs"]>;
  style?: ViewStyle;
}

/** Layout no token decides; sizes, fills, edges, spacing and type are the recipe's. */
const useStyles = createStyles((t) => ({
  strip: { alignSelf: "stretch", flexGrow: 0 },
  content: { flexDirection: "row", alignItems: "stretch", gap: t.space.lg, paddingHorizontal: t.gutter.pane },
  tab: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  count: { alignItems: "center", justifyContent: "center" },
  countText: { fontVariant: ["tabular-nums"] },
  indicator: { position: "absolute" },
}));

function Tab({ item, on, full, styles, strings, testID, onLayout, onPress }: { item: TabsItem; on: boolean; full: boolean; testID?: string; onLayout?: (x: number, width: number) => void; styles?: PartStyles<"tabs">; strings?: Partial<KitStrings["tabs"]>; onPress: () => void }) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("tabs", strings);
  const press = usePress();
  const n = item.badge ?? 0;
  // The bar grows in under the chosen tab and fades from the one it left.
  const bar = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    const run = Animated.timing(bar, { toValue: on ? 1 : 0, duration: t.duration.base, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: Platform.OS !== "web" });
    run.start();
    return () => run.stop();
  }, [on, bar, t.duration.base]);
  // A phone has no hover; a press inks the label while it is down, and the chosen tab stays strong.
  const r = useRecipe(recipes.tabs, { state: { on, pressed: press.pressed && !on, focus: press.focused }, styles });
  const tab = partStyle(r, "tab", { view: full && { flexGrow: 1 }, text: { lineHeight: (r.tab.text.fontSize as number) * 1.2 } });
  const count = partStyle(r, "count", { text: [{ lineHeight: r.count.text.fontSize }, s.countText] });
  return (
    <Pressable
      testID={partId(testID, "tabs", "tab")}
      accessibilityRole="tab"
      accessibilityLabel={n > 0 ? (item.badgeMore ? str("labelWithCountMore", { label: item.label, count: n }) : str("labelWithCount", { label: item.label, count: n })) : item.label}
      accessibilityState={{ selected: on, disabled: item.disabled || undefined }}
      disabled={item.disabled}
      onLayout={(e) => onLayout?.(e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.tab, tab.view, item.disabled && { opacity: t.opacity.disabled }]}
    >
      <Text numberOfLines={1} style={tab.text}>
        {item.label}
      </Text>
      {n > 0 ? (
        <View testID={partId(testID, "tabs", "count")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.count, r.count.view]}>
          <Text style={count.text}>{item.badgeMore ? str("countMore", { count: n }) : cap(n, 99)}</Text>
        </View>
      ) : null}
      <Animated.View testID={partId(testID, "tabs", "indicator")} pointerEvents="none" style={[s.indicator, r.indicator.view, { opacity: bar, transform: [{ scaleX: bar }] }]} />
    </Pressable>
  );
}

export function Tabs({ items, value = "", full = false, rule = true, label, onValueChange, styles, strings, style, testID, ...rest }: TabsProps) {
  const s = useStyles();
  const scroll = useRef<ScrollView>(null);
  const spots = useRef<Record<string, { x: number; width: number }>>({});
  const view = useRef(0);
  const r = useRecipe(recipes.tabs, { variants: { rule }, styles });
  const [chosen, setChosen] = useControllable(value, onValueChange);
  const current = items.some((i) => i.key === chosen) ? chosen : items[0]?.key;
  // A long strip scrolls the chosen tab to the middle when it changes, so it is never left off the edge.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const spot = current ? spots.current[current] : undefined;
    if (spot) scroll.current?.scrollTo({ x: Math.max(0, spot.x - (view.current - spot.width) / 2), animated: true });
  }, [current]);
  return (
    <ScrollView
      ref={scroll}
      onLayout={(e) => {
        view.current = e.nativeEvent.layout.width;
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={label}
      testID={partId(testID, "tabs", "root")}
      {...rootProps({ ...rest, ref: undefined })}
      style={[s.strip, r.root.view, style]}
      contentContainerStyle={[s.content, full && { flexGrow: 1 }]}
    >
      {items.map((item) => (
        <Tab
          key={item.key}
          item={item}
          on={item.key === current}
          full={full}
          styles={styles}
          strings={strings}
          testID={testID}
          onLayout={(x, width) => {
            spots.current[item.key] = { x, width };
          }}
          onPress={() => setChosen(item.key)}
        />
      ))}
    </ScrollView>
  );
}
