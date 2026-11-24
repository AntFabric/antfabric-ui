import { useEffect, useRef } from "react";
import { Animated, Easing, I18nManager, Platform, Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { useReducedMotion } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";

export interface TypingIndicatorProps extends RootProps {
  /** First names of the people typing in this conversation, oldest first. Never includes you. */
  names?: string[];
  /** This indicator's built-in text ("is typing", "Several people", the announced sentence) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["typing-indicator"]>;
  /** Per-part styles over the theme: `{ root: {…}, dot: {…}, who: {…} }`. */
  styles?: PartStyles<"typing-indicator">;
  style?: ViewStyle;
}

const useStyles = createStyles((t) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 28,
    paddingTop: t.space["2xs"],
    paddingBottom: t.space.xs,
  },
  dots: { flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 0 },
  text: { fontStyle: "italic" },
}));

// At rest (and under Reduce Motion) the dots hold these opacities; moving, they bounce 160 ms apart.
const REST = [0.35, 0.65, 1];

/** af-bounce: up 3pt and to full opacity at 30% of a 1.2 s cycle, back down by 60%, then still. */
function useBounce(typing: boolean) {
  const { t } = useTheme();
  const values = useRef(REST.map(() => new Animated.Value(0))).current;
  // Follows Settings live: turning Reduce Motion on stops the bounce at once. Nobody typing, nothing is drawn and nothing loops.
  const moving = !useReducedMotion() && typing;
  useEffect(() => {
    if (!moving) return;
    const native = Platform.OS !== "web";
    const [a, b, c, d] = (/\(([^)]+)\)/.exec(t.ease.nudge)?.[1] ?? ".22,.61,.36,1").split(",").map(Number);
    const easing = Easing.bezier(a!, b!, c!, d!);
    const step = (v: Animated.Value, toValue: number) => Animated.timing(v, { toValue, duration: 360, easing, useNativeDriver: native });
    const runs = values.map((v, i) =>
      Animated.sequence([Animated.delay(i * 160), Animated.loop(Animated.sequence([step(v, 1), step(v, 0), Animated.delay(480)]))]),
    );
    runs.forEach((r) => r.start());
    return () => runs.forEach((r) => r.stop());
  }, [moving, values, t.duration, t.ease]);
  return values.map((v, i) =>
    moving
      ? { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }), transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }
      : { opacity: REST[i] },
  );
}

export function TypingIndicator({ names = [], strings, styles, style, testID, ...rest }: TypingIndicatorProps) {
  const s = useStyles();
  const str = useStrings("typing-indicator", strings);
  const dots = useBounce(names.length > 0);
  const r = useRecipe(recipes["typing-indicator"], { styles });
  if (names.length === 0) return null;
  const who = names.length === 1 ? names[0]! : names.length === 2 ? str("two", { first: names[0]!, second: names[1]! }) : str("several");
  const verb = names.length === 1 ? str("isTyping") : str("areTyping");
  // The names and the verb are `Text`s of their own: the row's type reaches each (the phone's `Text` inherits none).
  const whoStyle = partStyle(r, "who", { view: { flexShrink: 1, [I18nManager.isRTL ? "marginLeft" : "marginRight"]: -4 }, text: [s.text, r.root.text] });
  const verbStyle = partStyle(r, "verb", { view: { flexShrink: 0 }, text: [s.text, r.root.text] });
  return (
    // Not a live region: typing changes every few seconds and would talk over the reader.
    <View accessible accessibilityRole="text" accessibilityLabel={str("announce", { who, verb })} {...rootProps(rest)} testID={partId(testID, "typing-indicator", "root")} style={[s.root, r.root.view, style]}>
      <View testID={partId(testID, "typing-indicator", "dots")} style={[s.dots, r.dots.view]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {dots.map((d, i) => (
          <Animated.View key={i} testID={partId(testID, "typing-indicator", "dot")} style={[d, r.dot.view]} />
        ))}
      </View>
      <Text testID={partId(testID, "typing-indicator", "who")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[whoStyle.view, whoStyle.text]}>
        {who}
      </Text>
      <Text testID={partId(testID, "typing-indicator", "verb")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[verbStyle.view, verbStyle.text]}>
        {str.parts("verbShown", { verb })}
      </Text>
    </View>
  );
}
