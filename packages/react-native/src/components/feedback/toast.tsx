import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric-ui/core";
import { createStyles, useTheme } from "../../theme";
import { Icon } from "../../lib/icon";
import { announce, hitSlopTo } from "../../lib/a11y";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";

export type ToastTone = "success" | "error" | "info";

export interface ToastProps extends RootProps {
  /** Past tense for a confirmation, imperative for a fixable refusal. Never an identifier, a code or a path. */
  message: string;
  /** success and info are announced politely; error assertively. */
  tone?: ToastTone;
  /** One verb, usually Undo. It takes its own tap. */
  actionLabel?: string;
  /** Gone: the pill fades back up. A tap on the toast or on its action sets it; the app unmounts the toast on onDismiss. */
  dismissed?: boolean;
  /** How long it stays, in milliseconds, before it dismisses itself (doubled while a screen reader is on). `0` keeps it until it is dismissed. */
  duration?: number;
  onAction?: () => void;
  onDismiss?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, message: {…} }`. */
  styles?: PartStyles<"toast">;
  /** This toast's built-in text (what a tap does, as an accessibility hint) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["toast"]>;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** A hex colour at an alpha, for the chips mixed from the toast's own ink. */
const mix = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** Layout no token decides; what the tokens decide (fill, ink, type, insets, the action's padding) is the recipe's. The chips are the pill's ink mixed (see the recipe). */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "stretch", maxWidth: "100%" },
  pill: { flexDirection: "row", alignItems: "center", borderRadius: 8 },
  message: { flex: 1, minWidth: 0 },
  action: { flexShrink: 0, paddingVertical: 5, borderRadius: 8, backgroundColor: mix(t.fg.onInverse, 0.12) },
  actionPressed: { backgroundColor: mix(t.fg.onInverse, 0.2) },
}));

/** Undo: its own tap, so the toast does not dismiss-then-act twice. */
function Action({ label, onPress, styles, testID }: { label: string; onPress: () => void; styles?: PartStyles<"toast">; testID?: string }) {
  const { t } = useTheme();
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes.toast, { styles });
  // The chip is drawn small; its touch area is the profile's hit size, so a near miss lands on Undo instead of dismissing the toast.
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  return (
    <Pressable
      testID={partId(testID, "toast", "action")}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={box ? hitSlopTo(t.control.hit, box.h, box.w) : undefined}
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.action, partStyle(r, "action", { view: press.pressed && s.actionPressed }).view]}
    >
      <Text testID={partId(testID, "toast", "actionText")} numberOfLines={1} maxFontSizeMultiplier={fontScale.control} style={[r.actionText.view, { color: r.action.text.color }, r.actionText.text]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Toast({ message, tone = "success", actionLabel = "", dismissed = false, duration = 0, onAction, onDismiss, styles, strings, style, testID, ...rest }: ToastProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("toast", strings);
  // The toast leaves by itself once tapped; the app hears about it and unmounts it.
  const [gone, setGone] = useControllable(dismissed);
  const r = useRecipe(recipes.toast, { variants: { tone }, styles });
  // The icon's size is its width and height (`size`); what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _h, ...iconRest } = r.icon.view;
  const iconStyle = Object.keys(iconRest).length ? iconRest : undefined;
  const out = useRef(new Animated.Value(gone ? 0 : 1)).current;
  useEffect(() => {
    const run = Animated.timing(out, { toValue: gone ? 0 : 1, duration: t.duration.base, useNativeDriver: Platform.OS !== "web" });
    run.start();
    return () => run.stop();
  }, [gone, out, t.duration.base]);
  const act = () => {
    setGone(true);
    onAction?.();
  };
  const dismiss = () => {
    setGone(true);
    onDismiss?.();
  };
  // iOS has no live regions: the message is spoken when it appears (an error cuts in, the rest wait their turn).
  useEffect(() => {
    if (!gone) announce(message);
  }, [message, tone]); // eslint-disable-line react-hooks/exhaustive-deps
  // The clock: twice as long while a screen reader is on, so the message can be read and Undo reached.
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;
  useEffect(() => {
    if (!duration || gone) return;
    let id: ReturnType<typeof setTimeout> | undefined;
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled().then((on) => {
      if (alive) id = setTimeout(() => dismissRef.current(), on ? duration * 2 : duration);
    });
    return () => {
      alive = false;
      if (id) clearTimeout(id);
    };
  }, [duration, gone, message]);
  return (
    <View {...rootProps(rest)} style={[s.root, style]}>
      <Enter motion="drop">
        <AnimatedPressable
          role={tone === "error" ? "alert" : "status"}
          accessibilityLabel={message}
          accessibilityHint={str("dismiss")}
          accessibilityElementsHidden={gone}
          importantForAccessibility={gone ? "no-hide-descendants" : "auto"}
          // Undo is also an accessibility action on the announcement (the VoiceOver rotor, TalkBack's actions menu).
          accessibilityActions={actionLabel ? [{ name: "action", label: actionLabel }] : undefined}
          onAccessibilityAction={(e) => e.nativeEvent.actionName === "action" && act()}
          disabled={gone}
          onPress={dismiss}
          testID={partId(testID, "toast", "root")}
          style={[s.pill, r.root.view, { opacity: out, transform: [{ translateY: out.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }] }]}
        >
          <Icon testID={partId(testID, "toast", "icon")} name={tone === "error" ? "circle-alert" : tone === "success" ? "circle-check" : "info"} size={iconSize as number} color={r.icon.text.color} style={iconStyle} />
          <Text testID={partId(testID, "toast", "message")} numberOfLines={2} maxFontSizeMultiplier={fontScale.content} style={[s.message, r.message.view, r.message.text]}>
            {message}
          </Text>
          {actionLabel ? <Action label={actionLabel} styles={styles} testID={testID} onPress={act} /> : null}
        </AnimatedPressable>
      </Enter>
    </View>
  );
}
