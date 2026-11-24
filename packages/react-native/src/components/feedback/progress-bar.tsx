import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { IconButton } from "../actions/icon-button";
import { bezier, useReducedMotion } from "../../lib/motion";

export type ProgressBarTone = "brand" | "neutral" | "success" | "danger";
export type ProgressBarAction = "none" | "cancel" | "retry";

export interface ProgressBarProps extends RootProps {
  /** 0–100, clamped (the app's 0–1 is multiplied by 100 before it gets here). A NaN draws indeterminate. */
  value?: number;
  /** The size is not known yet. No value is announced. */
  indeterminate?: boolean;
  /** Accessibility label of the bar. Left out, the bar is named by its `title` when it has one, else "Progress". */
  label?: string;
  /** brand while it moves; success when done; danger when it stopped and needs you; neutral for a quiet measure. */
  tone?: ProgressBarTone;
  /** Turns the bar into an upload row: the file or job name, one line. */
  title?: string;
  /** How much has moved, in units a person reads: "2.1 of 5.3 MB". */
  detail?: string;
  /** The row's one control: Cancel while it moves, Retry once it has failed. */
  action?: ProgressBarAction;
  onCancel?: () => void;
  onRetry?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, fill: {…} }`. */
  styles?: PartStyles<"progress-bar">;
  /** This bar's built-in text (the default name, the Cancel and Retry labels) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["progress-bar"]>;
  style?: ViewStyle;
}

const native = Platform.OS !== "web";

/** Layout no token decides; what the tokens decide (fill, radius, ink, type, gaps) is the recipe's. */
const useStyles = createStyles(() => ({
  root: { alignSelf: "stretch", minWidth: 120 },
  header: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, minWidth: 0 },
  detail: { fontVariant: ["tabular-nums"] },
  control: { marginEnd: -4 },
  track: { height: 6, overflow: "hidden" },
  fill: { height: "100%" },
}));

export function ProgressBar({
  value,
  indeterminate = false,
  label,
  tone = "brand",
  title = "",
  detail = "",
  action = "none",
  onCancel,
  onRetry,
  styles,
  strings,
  style,
  testID,
  ...rest
}: ProgressBarProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("progress-bar", strings);
  // No value yet (a NaN too) is an unknown size, drawn moving, never a made-up percent.
  const unknown = indeterminate || value === undefined || Number.isNaN(value);
  const pct = unknown ? 0 : Math.min(100, Math.max(0, value));
  const r = useRecipe(recipes["progress-bar"], { variants: { tone }, styles });
  const reduceMotion = useReducedMotion();

  // A known value eases to its new width.
  const width = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    if (reduceMotion) {
      width.setValue(pct);
      return;
    }
    const run = Animated.timing(width, { toValue: pct, duration: t.motion.duration.slow, easing: Easing.ease, useNativeDriver: false });
    run.start();
    return () => run.stop();
  }, [pct, width, t.motion.duration.slow, reduceMotion]);

  // An unknown one slides a third of the track across it, every 1.4 s; reduced motion parks it in the middle.
  const [span, setSpan] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!unknown || reduceMotion) return;
    const run = Animated.loop(Animated.timing(slide, { toValue: 1, duration: 1400, easing: bezier(t.motion.easing.standard), useNativeDriver: native }));
    run.start();
    return () => run.stop();
  }, [unknown, slide, t.duration, t.ease, reduceMotion]);
  const x = reduceMotion ? span * 0.34 : slide.interpolate({ inputRange: [0, 1], outputRange: [-span * 0.32, span * 0.8] });

  return (
    <View {...rootProps(rest)} testID={partId(testID, "progress-bar", "root")} style={[s.root, r.root.view, style]}>
      {title ? (
        <View testID={partId(testID, "progress-bar", "header")} style={[s.header, r.header.view]}>
          <Text testID={partId(testID, "progress-bar", "title")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[s.title, r.title.view, r.title.text]}>
            {title}
          </Text>
          {detail ? (
            <Text testID={partId(testID, "progress-bar", "detail")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[s.detail, r.detail.view, r.detail.text]}>
              {detail}
            </Text>
          ) : null}
          {action === "cancel" ? <IconButton icon="x" label={str("cancelUpload", { name: title })} size="sm" onPress={() => onCancel?.()} style={s.control} /> : null}
          {action === "retry" ? <IconButton icon="rotate-ccw" label={str("retryUpload", { name: title })} size="sm" onPress={() => onRetry?.()} style={s.control} /> : null}
        </View>
      ) : null}
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label ?? (title || str("label"))}
        accessibilityValue={unknown ? undefined : { min: 0, max: 100, now: pct, text: detail || undefined }}
        accessibilityState={{ busy: unknown || (pct < 100 && tone !== "danger") }}
        onLayout={(e) => setSpan(e.nativeEvent.layout.width)}
        testID={partId(testID, "progress-bar", "track")}
        style={[s.track, r.track.view]}
      >
        {unknown ? (
          <Animated.View testID={partId(testID, "progress-bar", "fill")} style={[s.fill, partStyle(r, "fill", { view: { width: "32%" } }).view, { transform: [{ translateX: x }] }]} />
        ) : (
          // The width is an animated value, which cannot be part of a registered style: `styles.fill` goes after it, so it still has the last word.
          <Animated.View testID={partId(testID, "progress-bar", "fill")} style={[s.fill, r.fill.view, { width: width.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }, styles?.fill]} />
        )}
      </View>
    </View>
  );
}
