import { useMemo, useRef, useState } from "react";
import { Animated, I18nManager, PanResponder, Pressable, ScrollView, Text, View, type ViewStyle } from "react-native";
import { cap, recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { GlassSurface } from "../../lib/glass";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { hitSlopTo } from "../../lib/a11y";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";

export interface SegmentedControlItem {
  key: string;
  label: string;
  /** How many are in there, never how many need you: a quiet bordered chip, never coral. 0 or missing draws no chip. */
  count?: number;
}

export interface SegmentedControlProps extends RootProps {
  items: SegmentedControlItem[];
  /** The chosen item's key. A value that matches no item is allowed and draws no card — for a strip whose panel can be closed. */
  value?: string;
  /** Stretch the track to its column. Segments share the SPARE width, so a long label keeps its words. */
  full?: boolean;
  /** The track scrolls sideways instead of squeezing, for labels that cannot fit (localised copy, 130% text). */
  scrollable?: boolean;
  /** The strip's accessible name. */
  label?: string;
  onValueChange?: (key: string) => void;
  /** Per-part styles over the theme: `{ track: {…}, tab: {…}, count: {…} }`. */
  styles?: PartStyles<"segmented-control">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["segmented-control"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (colours, sizes, type, edges) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", alignSelf: "flex-start", maxWidth: "100%" },
  track: { flexDirection: "row", alignItems: "center", padding: t.space["2xs"], flexShrink: 0 },
  // A 1pt edge on every segment, transparent until chosen, so nothing moves when the choice does.
  tab: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  full: { flexGrow: 1, flexShrink: 1, flexBasis: "auto" },
  count: { alignItems: "center", justifyContent: "center" },
  countText: { fontVariant: ["tabular-nums"] },
  lens: { position: "absolute", left: 0 },
  lensGlass: { flex: 1 },
}));

interface SegmentProps {
  item: SegmentedControlItem;
  chosen: boolean;
  full: boolean;
  styles?: PartStyles<"segmented-control">;
  strings?: Partial<KitStrings["segmented-control"]>;
  testID?: string;
  pick: () => void;
  place: (slot: { x: number; y: number; w: number; h: number }) => void;
}

function Segment({ item, chosen, full, pick, place, styles, strings, testID }: SegmentProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("segmented-control", strings);
  const press = usePress();
  const r = useRecipe(recipes["segmented-control"], { variants: { full }, state: { on: chosen, pressed: press.pressed, focus: press.focused }, styles });
  const n = item.count ?? 0;
  const tab = partStyle(r, "tab", { view: full && s.full, text: { lineHeight: (r.tab.text.fontSize as number) * 1.2 } });
  return (
    <Pressable
      testID={partId(testID, "segmented-control", "tab")}
      accessibilityRole="tab"
      accessibilityLabel={n > 0 ? str("labelWithCount", { label: item.label, count: n }) : item.label}
      accessibilityState={{ selected: chosen }}
      hitSlop={typeof tab.view.height === "number" ? hitSlopTo(t.control.hit, tab.view.height) : undefined}
      onPress={pick}
      onLayout={(e) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        place({ x, y, w: width, h: height });
      }}
      {...press.handlers}
      // No travelling fill on the phone: the chosen segment fills itself at once ("No smooth motion").
      style={[s.tab, tab.view, typeof tab.view.height === "number" ? { height: undefined, minHeight: tab.view.height } : null]}
    >
      <Text numberOfLines={1} maxFontSizeMultiplier={fontScale.control} style={tab.text}>
        {item.label}
      </Text>
      {n > 0 ? (
        <View testID={partId(testID, "segmented-control", "count")} aria-hidden style={[s.count, r.count.view]}>
          <Text maxFontSizeMultiplier={fontScale.chrome} style={[s.countText, r.count.text]}>{cap(n, 99)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function SegmentedControl({ items, value = "", full = false, scrollable = false, label = "", onValueChange, styles, strings, style, testID, ...rest }: SegmentedControlProps) {
  const { glass } = useTheme();
  const s = useStyles();
  const r = useRecipe(recipes["segmented-control"], { styles });
  const [current, setCurrent] = useControllable(value, onValueChange);
  const at = items.findIndex((i) => i.key === current);

  // iOS 26's selection lens: dragging across the strip lifts the chosen card into clear glass that
  // follows the finger and settles on the segment under it. A plain tap still lands on the segment.
  const slots = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const lensX = useRef(new Animated.Value(0)).current;
  const [lens, setLens] = useState<{ y: number; w: number; h: number } | null>(null);
  const lensOn = glass && !scrollable && at >= 0;
  const drag = useRef({ from: 0, at }).current;
  drag.at = at;
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, g) => lensOn && Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: () => {
          const from = slots.current[drag.at];
          if (!from) return;
          drag.from = from.x;
          lensX.setValue(from.x);
          setLens({ y: from.y, w: from.w, h: from.h });
        },
        onPanResponderMove: (_, g) => {
          const all = slots.current;
          const last = all[all.length - 1];
          const w = all[drag.at]?.w ?? 0;
          if (last) lensX.setValue(Math.min(Math.max(drag.from + g.dx, all[0]!.x), last.x + last.w - w));
        },
        onPanResponderRelease: (_, g) => {
          const all = slots.current;
          const centre = drag.from + g.dx + (all[drag.at]?.w ?? 0) / 2;
          const off = (i: number) => Math.abs((all[i]?.x ?? 0) + (all[i]?.w ?? 0) / 2 - centre);
          let best = drag.at;
          all.forEach((_, i) => {
            if (off(i) < off(best)) best = i;
          });
          setLens(null);
          const landed = items[best];
          if (landed) setCurrent(landed.key);
        },
        onPanResponderTerminate: () => setLens(null),
      }),
    [lensOn, items, setCurrent, lensX, drag],
  );

  const strip = (
    <View testID={partId(testID, "segmented-control", "track")} accessibilityRole="tablist" accessibilityLabel={label || undefined} {...(lensOn ? responder.panHandlers : null)} style={[s.track, partStyle(r, "track", { view: full && { flexGrow: 1 } }).view]}>
      {items.map((item, i) => (
        <Segment
          key={item.key}
          item={item}
          chosen={i === at}
          full={full}
          styles={styles}
          strings={strings}
          testID={testID}
          pick={() => setCurrent(item.key)}
          place={(slot) => {
            slots.current[i] = slot;
          }}
        />
      ))}
      {lens ? (
        <Animated.View pointerEvents="none" style={[s.lens, I18nManager.isRTL ? { right: 0, left: undefined } : null, { top: lens.y, width: lens.w, height: lens.h, transform: [{ translateX: lensX }, { scale: 1.15 }] }]}>
          <GlassSurface clear style={[s.lensGlass, { borderRadius: r.tab.view.borderRadius }]} />
        </Animated.View>
      ) : null}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} {...rootProps(rest)} style={[{ alignSelf: "stretch" }, style]} contentContainerStyle={full ? { flexGrow: 1 } : undefined}>
        {strip}
      </ScrollView>
    );
  }
  return <View {...rootProps(rest)} style={[s.root, full && { alignSelf: "stretch" }, style]}>
      {strip}
    </View>;
}
