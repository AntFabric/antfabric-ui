import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Dimensions, Easing, KeyboardAvoidingView, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View, findNodeHandle, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { hitSlopTo, useBackHandler } from "../../lib/a11y";
import { GlassSurface } from "../../lib/glass";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

/** `nativeID`, the accessibility label and hint, and `ref` name the dialog; `testID` and `style` stay on the root. */
export interface BottomSheetProps extends RootProps {
  /** Empty draws no title row: the handle and the content only. */
  title?: string;
  /** The 28pt title for a sheet that is a destination of its own (New message). */
  largeTitle?: boolean;
  /** Full height, up to the header row behind it, so a list can grow and a footer action sits at the foot. */
  tall?: boolean;
  showClose?: boolean;
  /** What the sheet holds. Rows inside bleed to the gutter themselves. */
  children?: ReactNode;
  /** A full-width action pinned at the foot. Empty draws none. */
  primaryLabel?: string;
  /** The primary button was pressed. */
  onPrimary?: () => void;
  /** Draws the on-screen keyboard, to show the sheet sitting on it. */
  keyboard?: boolean;
  /** Mid-drag: the panel follows the finger and the scrim lightens with it. */
  dragging?: boolean;
  /** Dismissed: the panel slides back down and the scrim clears. The close button, the handle and a drag past the threshold set it. */
  closed?: boolean;
  /** The person asked to close: ×, the handle, the backdrop, a drag down, back, the escape gesture. */
  onClose?: () => void;
  /** ×, the handle, the backdrop, a drag down, back and the escape gesture close it. Off for a sheet that must be answered from inside: there is no ×, and none of them do anything. */
  dismissible?: boolean;
  /** The sheet has finished leaving. A screen that opens another sheet next waits for this. */
  onDismiss?: () => void;
  /** Per-part styles over the theme: `{ panel: {…}, handle: {…}, title: {…} }`. */
  styles?: PartStyles<"bottom-sheet">;
  /** This sheet's built-in text (the handle's and close button's names, the keyboard stand-in) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["bottom-sheet"]>;
  style?: ViewStyle;
}

/** How far a drag must go, or how fast, before letting go dismisses instead of springing back. */
const DISMISS_AT = 120;
const FLING = 1;
const DRAG_PREVIEW = 72;

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  // It fills what it is given (the screen, a Modal): the panel sits at the foot and the scrim above it is the backdrop.
  scrim: { flexGrow: 1, alignSelf: "stretch", justifyContent: "flex-end", overflow: "hidden" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  panel: { paddingTop: t.space.md, paddingBottom: t.space.xl },
  glass: { marginHorizontal: t.space.sm, marginBottom: t.space.sm, borderRadius: t.sheet.glassRadius },
  handle: { alignSelf: "center", marginBottom: t.space.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.space.sm, marginBottom: t.space.lg },
  title: { flexShrink: 1 },
  body: { flexShrink: 1 },
  bodyContent: { gap: t.space["2xs"] },
  footer: { paddingTop: t.space.md },
  keyboard: { height: 291, alignItems: "center", justifyContent: "center" }, /* structural: stage: the height of the iPhone keyboard the demo stands in for */
}));

export function BottomSheet({
  title = "",
  largeTitle = false,
  tall = false,
  showClose = true,
  children,
  primaryLabel = "",
  keyboard = false,
  dragging = false,
  closed = false,
  dismissible = true,
  onPrimary,
  onClose,
  onDismiss,
  styles,
  strings,
  style,
  testID,
  ...rest
}: BottomSheetProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("bottom-sheet", strings);
  const [gone, setGone] = useControllable(closed);
  const [held, setHeld] = useState(false);
  const height = useRef(Dimensions.get("window").height);
  const offscreen = () => height.current + 16;
  // The panel's travel below its resting place. JS-driven, because a drag sets it from the finger.
  const drop = useRef(new Animated.Value(closed ? offscreen() : dragging ? DRAG_PREVIEW : 0)).current;

  const settle = (to: number, then?: () => void) =>
    Animated.timing(drop, { toValue: to, duration: t.duration.slow, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: false }).start(({ finished }) => finished && then?.());

  // Drawn already closed or mid-drag, the panel starts where it is; later changes move it there.
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) {
      moved.current = true;
      return;
    }
    settle(gone ? offscreen() : dragging ? DRAG_PREVIEW : 0, gone ? () => onDismiss?.() : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone, dragging]);

  const close = () => {
    if (!dismissible) return;
    setGone(true);
    onClose?.();
  };

  // A drag on the handle and the title row moves the panel; letting go far or fast enough dismisses.
  const closeRef = useRef(close);
  closeRef.current = close;
  const dismissibleRef = useRef(dismissible);
  dismissibleRef.current = dismissible;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => dismissibleRef.current && g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => setHeld(true),
      onPanResponderMove: (_, g) => drop.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        setHeld(false);
        if (g.dy > DISMISS_AT || g.vy > FLING) closeRef.current();
        else Animated.spring(drop, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
      },
      onPanResponderTerminate: () => {
        setHeld(false);
        Animated.spring(drop, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
      },
    }),
  ).current;

  const r = useRecipe(recipes["bottom-sheet"], { variants: { dragging: dragging || held, closed: gone, largeTitle }, styles });
  // Android's back button closes the sheet while it is open; a screen reader starts at the title (else the handle) when it opens.
  useBackHandler(dismissible ? close : undefined, !gone);
  const heading = useRef<Text>(null);
  const grabber = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS === "web" || closed) return;
    const target = heading.current ?? grabber.current;
    const node = target ? findNodeHandle(target) : null;
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View testID={partId(testID, "bottom-sheet", "root")} style={[s.scrim, r.root.view, style]}>
      {/* A press on the scrim above the panel closes it. A screen reader has the handle, the × and the escape gesture instead. */}
      {gone ? null : <Pressable testID={partId(testID, "bottom-sheet", "backdrop")} accessible={false} style={s.backdrop} onPress={() => close()} />}
      <Enter
        motion={closed || dragging ? null : "slide-up"}
        role="dialog"
        aria-modal
        accessibilityViewIsModal
        accessibilityLabel={title || undefined}
        {...rootProps(rest)}
        // Put away, it is hidden from VoiceOver (accessibilityElementsHidden) and from TalkBack (importantForAccessibility).
        accessibilityElementsHidden={gone}
        importantForAccessibility={gone ? "no-hide-descendants" : undefined}
        onAccessibilityEscape={() => close()}
        style={tall ? { flex: 1 } : null}
      >
        {/* Fields in the sheet are lifted above the keyboard. */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={tall ? { flex: 1 } : undefined}>
        <Animated.View
          onLayout={(e) => (height.current = e.nativeEvent.layout.height)}
          style={[tall && { flex: 1 }, { transform: [{ translateY: drop }] }]}
        >
          <GlassSurface testID={partId(testID, "bottom-sheet", "panel")} style={[s.panel, partStyle(r, "panel", { view: tall && { flex: 1 } }).view]} glassStyle={[s.glass, styles?.panel]}>
            <View {...pan.panHandlers}>
              <Pressable
                ref={grabber}
                testID={partId(testID, "bottom-sheet", "handle")}
                accessibilityRole="button"
                accessibilityLabel={str("dismiss")}
                // Not dismissible, the handle is only a picture of one: nothing to press, nothing to read.
                accessible={dismissible}
                disabled={!dismissible}
                hitSlop={hitSlopTo(t.control.hit, t.sheet.grabberH, t.sheet.grabberW)}
                onPress={() => close()}
                style={[s.handle, r.handle.view]}
              />
              {title ? (
                <View style={s.header}>
                  <Text ref={heading} testID={partId(testID, "bottom-sheet", "title")} accessibilityRole="header" numberOfLines={largeTitle ? 1 : undefined} style={[s.title, r.title.view, r.title.text]}>
                    {title}
                  </Text>
                  {showClose && dismissible ? <IconButton icon="x" label={str("close")} onPress={() => close()} /> : null}
                </View>
              ) : null}
            </View>
            <ScrollView style={[s.body, tall && { flex: 1 }]} contentContainerStyle={s.bodyContent} keyboardShouldPersistTaps="handled">
              <View testID={partId(testID, "bottom-sheet", "content")} style={r.content.view}>
                {/* Words given as the content are drawn as body text: React Native has no bare text in a View. */}
                {typeof children === "string" || typeof children === "number" ? <Text testID={partId(testID, "bottom-sheet", "text")} style={[r.text.view, r.text.text]}>{children}</Text> : children || null}
              </View>
            </ScrollView>
            {primaryLabel ? (
              <View style={s.footer}>
                <Button label={primaryLabel} size="lg" full onPress={() => onPrimary?.()} />
              </View>
            ) : null}
            {keyboard ? null : <View testID={partId(testID, "bottom-sheet", "home")} style={r.home.view} />}
          </GlassSurface>
        </Animated.View>
        </KeyboardAvoidingView>
      </Enter>
      {keyboard ? (
        <View testID={partId(testID, "bottom-sheet", "keyboard")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.keyboard, r.keyboard.view]}>
          <Text testID={partId(testID, "bottom-sheet", "keyboardLabel")} style={[r.keyboardLabel.view, r.keyboardLabel.text]}>{str("keyboard")}</Text>
        </View>
      ) : null}
    </View>
  );
}
