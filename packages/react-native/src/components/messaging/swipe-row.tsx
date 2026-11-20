import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Easing, I18nManager, PanResponder, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { formatString, recipes, useControllable, useStrings, type ActionItem, type KitStrings } from "@antfabric-ui/core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { reducedMotion } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";

/** A button in the tray. `label` is its accessible name and may hold `{title}`, filled with the row's title ("Mark {title} read"); `text` is what the button draws, `label` when it is left out. The action's `icon` and `badge` are not drawn. */
export interface SwipeRowAction extends ActionItem {
  /** Drawn on the button; `label` is read. */
  text?: string;
  /** The destructive fill (Clear, Delete). A press on it leaves the row open, behind the product's confirm. */
  tone?: "danger";
  /** Shown only while the row is `unread` (Mark read). */
  unreadOnly?: boolean;
}

export interface SwipeRowProps extends RootProps {
  /** Swiped open, resting at the buttons' width. */
  open?: boolean;
  /** The row is tinted (unless `dense`), and the actions marked `unreadOnly` are shown. */
  unread?: boolean;
  /** One 44pt line, the title only, never tinted: a list of conversations rather than of notifications. */
  dense?: boolean;
  title: string;
  /** Notification preview, two lines. */
  body?: string;
  time?: string;
  /** The glyph on the row's tile (mention, reply, DM, reaction…). Left out, there is no tile. */
  icon?: IconName;
  /** The buttons, in order. The tray is 96 wide per button shown and 12 more; none, and the row does not swipe. */
  actions?: SwipeRowAction[];
  /** The row itself was tapped (or activated by a screen reader): open the notification. Given it, a tap on a row with its tray open closes the tray instead; the tray opens by swipe or by the screen reader's "Show actions". Left out, a tap toggles the tray. */
  onPress?: () => void;
  /** Called with `open` when a swipe or a tap opens or closes the row: close the previously open row here. */
  onOpenChange?: (open: boolean) => void;
  /** A button was pressed. The row closes first, unless the action's tone is danger. */
  onAction?: (action: SwipeRowAction) => void;
  /** This row's built-in text (its accessible name and the rotor's tray action) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["swipe-row"]>;
  /** Per-part styles over the theme: `{ root: {…}, tint: {…}, title: {…}, action: {…} }`. */
  styles?: PartStyles<"swipe-row">;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Past this much travel (after friction) a release opens or closes the row. */
const THRESHOLD = 40;
/** The row moves at half the finger's speed. */
const FRICTION = 2;
/** Android's system back gesture owns this strip at the screen edge. */
const EDGE = 24;

/** Layout no token decides; the colours, sizes and type are the recipe's (`swipeRow`). */
const useStyles = createStyles((t) => ({
  root: { position: "relative", flexDirection: "row", width: "100%", overflow: "hidden" },
  row: { width: "100%", flexShrink: 0 },
  tint: { flexDirection: "row", alignItems: "flex-start", minHeight: 88 },
  tile: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, minWidth: 0, gap: t.space["3xs"] },
  titleLine: { flexDirection: "row", alignItems: "baseline", gap: t.space.sm },
  title: { flex: 1, minWidth: 0 },
  time: { flexShrink: 0 },
  history: { height: 44, justifyContent: "center" },
  actions: { position: "absolute", top: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", paddingLeft: t.space.sm },
  action: { width: 88, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  actionLabel: { textAlign: "center" },
}));

function Action({ label, name, destructive, onPress, styles }: Pick<SwipeRowProps, "styles"> & { label: string; name: string; destructive?: boolean; onPress: () => void }) {
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes["swipe-row"], { state: { focus: press.focused }, styles });
  const part = destructive ? "dangerAction" : "action";
  const labelPart = destructive ? "dangerLabel" : "actionLabel";
  const button = partStyle(r, part, { view: press.pressed ? { opacity: 0.85 } : undefined });
  const text = partStyle(r, labelPart, { text: [s.actionLabel, { lineHeight: (r[labelPart].text.fontSize as number) * 1.2 }] });
  return (
    <Pressable
      testID={`swipe-row.${part}`}
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.action, button.view]}
    >
      {/* One line up to the 1.3× text cap; past it the label shrinks rather than wraps. */}
      <Text
        testID={`swipe-row.${labelPart}`}
        numberOfLines={1}
        adjustsFontSizeToFit
        maxFontSizeMultiplier={1.3}
        style={[text.view, text.text]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SwipeRow({ open = false, unread = false, dense = false, title, body = "", time = "", icon, actions = [], onOpenChange, onPress, onAction, strings, styles, style, testID, ...rest }: SwipeRowProps) {
  const str = useStrings("swipe-row", strings);
  const { t, os } = useTheme();
  const s = useStyles();
  const [openNow, setOpen] = useControllable(open, onOpenChange);
  const tinted = !dense && unread;
  const r = useRecipe(recipes["swipe-row"], { state: { on: tinted }, styles });
  const shown = actions.filter((a) => !a.unreadOnly || unread);
  // 8 after the row, 88 per button, 8 between, 12 to the edge: 96 for each button shown, and 12.
  const width = 96 * shown.length + 12;
  // A row with nothing to show does not swipe, so it is never open.
  const swipes = shown.length > 0;
  const isOpen = openNow && swipes;
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: tileIconSize, height: _tileIconHeight, ...tileIconRest } = r.tileIcon.view;
  const titleStyle = partStyle(r, "title", { view: s.title });
  const timeStyle = partStyle(r, "time", { view: s.time });

  const x = useRef(new Animated.Value(isOpen ? -width : 0)).current;
  // The buttons exist while the row is open or moving: a closed row has none to tab to.
  const [moving, setMoving] = useState(false);
  const at = useRef(isOpen);
  // The row travels toward the start of the line: left in a left-to-right layout, right in a right-to-left one.
  const sign = I18nManager.isRTL ? -1 : 1;

  const snap = (to: boolean) => {
    const toValue = to ? -width : 0;
    // Closing from open keeps the buttons until they have ridden out with the row.
    if (at.current && !to) setMoving(true);
    at.current = to;
    const settle = () => {
      if (!to) setMoving(false);
    };
    // The row follows the finger regardless; only the snap after release is motion Reduce Motion removes.
    if (reducedMotion()) {
      x.setValue(toValue);
      return settle();
    }
    const [a, b, c, d] = (/\(([^)]+)\)/.exec(t.ease.out)?.[1] ?? ".16,1,.3,1").split(",").map(Number);
    Animated.timing(x, { toValue, duration: t.duration.slow, easing: Easing.bezier(a!, b!, c!, d!), useNativeDriver: Platform.OS !== "web" }).start(({ finished }) => {
      if (finished) settle();
    });
  };

  // A new `open` or width (Mark read drops a button) from either side slides the row there.
  const snapRef = useRef(snap);
  snapRef.current = snap;
  useEffect(() => {
    snapRef.current(isOpen);
  }, [isOpen, width]);

  // The responder is made once (a new one mid-drag would lose the gesture), so it reads these.
  const state = useRef({ open: isOpen, width, setOpen, start: 0 });
  Object.assign(state.current, { open: isOpen, width, setOpen });

  const pan = useMemo(
    () =>
      PanResponder.create({
        // Horizontal only, so a vertical scroll that starts on a row still scrolls the list. A closed
        // row never takes a rightward drag: that is the screen's swipe back.
        onMoveShouldSetPanResponderCapture: (_, g) => {
          const { open: o } = state.current;
          const dx = g.dx * sign;
          if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(g.dy) * 1.5) return false;
          if (!o && dx > 0) return false;
          if (!o && os === "android" && (sign === 1 ? g.x0 > Dimensions.get("window").width - EDGE : g.x0 < EDGE)) return false;
          return true;
        },
        onPanResponderGrant: () => {
          setMoving(true);
          x.stopAnimation((v) => (state.current.start = v));
        },
        onPanResponderMove: (_, g) => {
          const { start, width: w } = state.current;
          x.setValue(Math.min(0, Math.max(-w, start + (g.dx * sign) / FRICTION)));
        },
        onPanResponderRelease: (_, g) => {
          // A flick counts for a little more than its distance, as gesture-handler's Swipeable does.
          const travel = ((g.dx + g.vx * 50) * sign) / FRICTION;
          const { open: o } = state.current;
          const next = o ? travel < THRESHOLD : travel < -THRESHOLD;
          if (next !== o) state.current.setOpen(next);
          snapRef.current(next);
        },
        // Once it has the row, a list scrolling under it does not take the gesture away.
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: () => snapRef.current(state.current.open),
      }),
    [os, x, sign],
  );

  // What each button says, reads and does. A danger action stays open behind the app's confirm, so the person sees what they are deleting.
  const buttons = shown.map((a) => {
    const name = formatString(a.label, { title });
    return {
      key: a.key,
      label: a.text ?? name,
      name,
      destructive: a.tone === "danger",
      run: () => {
        if (a.tone !== "danger") setOpen(false);
        onAction?.(a);
      },
    };
  });

  const name = [title, body && str("labelBody", { body }), time && str("labelTime", { time })].filter(Boolean).join("");
  return (
    <View {...rootProps(rest)} testID={partId(testID, "swipe-row", "root")} {...(swipes ? pan.panHandlers : null)} style={[s.root, r.root.view, style]}>
      <AnimatedPressable
        testID={partId(testID, "swipe-row", "row")}
        accessibilityRole="button"
        // The name is the whole line, as sighted people read it: the title, the preview and the time.
        accessibilityLabel={name}
        accessibilityState={{ expanded: swipes ? isOpen : undefined }}
        // A swipe is invisible to VoiceOver and TalkBack: the tray's actions are on the rotor too, run directly, and so is the tray itself.
        accessibilityActions={[...(onPress && swipes ? [{ name: "tray", label: isOpen ? str("hideActions") : str("showActions") }] : []), ...buttons.map((a) => ({ name: a.key, label: a.label }))]}
        onAccessibilityAction={(e) => {
          const picked = e.nativeEvent.actionName;
          if (picked === "tray") setOpen(!isOpen);
          else buttons.find((a) => a.key === picked)?.run();
        }}
        onPress={() => {
          // With an `onPress` the row opens the notification, and an open tray closes first; without one the tap works the tray.
          if (onPress) return isOpen ? setOpen(false) : onPress();
          if (swipes) setOpen(!isOpen);
        }}
        style={[s.row, r.row.view, { transform: [{ translateX: Animated.multiply(x, sign) }] }]}
      >
        {!dense ? (
          <View testID={partId(testID, "swipe-row", "tint")} style={[s.tint, r.tint.view]}>
            {icon ? (
              <View testID={partId(testID, "swipe-row", "tile")} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[s.tile, r.tile.view]}>
                <Icon testID={partId(testID, "swipe-row", "tileIcon")} name={icon} size={tileIconSize as number} color={r.tileIcon.text.color} style={Object.keys(tileIconRest).length ? tileIconRest : undefined} />
              </View>
            ) : null}
            <View style={s.text}>
              <View style={s.titleLine}>
                <Text testID={partId(testID, "swipe-row", "title")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[titleStyle.view, titleStyle.text]}>
                  {title}
                </Text>
                {time ? (
                  <Text testID={partId(testID, "swipe-row", "time")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[timeStyle.view, timeStyle.text]}>
                    {time}
                  </Text>
                ) : null}
              </View>
              {body ? (
                <Text testID={partId(testID, "swipe-row", "body")} maxFontSizeMultiplier={fontScale.content} numberOfLines={2} style={[r.body.view, r.body.text]}>
                  {body}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View testID={partId(testID, "swipe-row", "history")} style={[s.history, r.history.view]}>
            <Text testID={partId(testID, "swipe-row", "historyTitle")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[r.historyTitle.view, r.historyTitle.text]}>
              {title}
            </Text>
          </View>
        )}
      </AnimatedPressable>
      {swipes && (isOpen || moving) ? (
        // The buttons ride the row's trailing edge (translateX = width + the row's), as iOS Mail's do.
        <Animated.View
          testID={partId(testID, "swipe-row", "actions")}
          style={[
            s.actions,
            // The tray sits on the trailing edge: the left one in a right-to-left layout.
            I18nManager.isRTL ? { right: undefined, left: 0, paddingLeft: 0, paddingRight: t.space.sm } : null,
            r.actions.view,
            { transform: [{ translateX: x.interpolate({ inputRange: [-width, 0], outputRange: [0, sign * width], extrapolate: "clamp" }) }] },
          ]}
        >
          {buttons.map((a) => (
            <Action key={a.key} label={a.label} name={a.name} destructive={a.destructive} onPress={a.run} styles={styles} />
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}
