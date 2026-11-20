import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutRectangle,
  type PanResponderGestureState,
  type ViewStyle,
} from "react-native";
import { recipes, useControllable, useStrings, type ActionItem, type KitStrings, type NavItem } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { GlassSurface } from "../../lib/glass";
import { Icon } from "../../lib/icon";
import { Enter, useReducedMotion } from "../../lib/motion";
import { fontScale } from "../../lib/type";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyle, type PartStyles } from "../../lib/recipe";
import { Badge } from "../display/badge";
import { bezier } from "../../lib/motion";

export interface TabBarProps extends RootProps {
  /** Left to right, five at most: a sixth leaves each tab under the 44pt touch size, so a bar holds five (more belong behind a "More" tab, which is the app's). A badge prints up to the tab's `max` (9), then `max+`. */
  tabs?: NavItem[];
  /** The key of the open tab. A key no tab has (a pushed screen is on top) draws no capsule: the tabs share the width evenly. */
  active?: string;
  /** The tabs are shown. Left (false) is the bar squeezed by scrolling down: a 42pt circle with the current tab's icon. */
  expanded?: boolean;
  /** The bar is not drawn while the keyboard is up. */
  keyboardUp?: boolean;
  /** Draws a picture of the home indicator (iOS) or gesture handle (Android) beneath, to show the bar sits above the safe area. A real app has the system's own: leave it off. */
  safeArea?: boolean;
  /** The floating button beside the bar. Leave it out for none. */
  action?: ActionItem;
  onActiveChange?: (active: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  onAction?: (action: ActionItem) => void;
  /** Per-part styles over the theme: `{ pill: {…}, tab: {…}, action: {…} }`. */
  styles?: PartStyles<"tab-bar">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["tab-bar"]>;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** A recipe's fixed `height` as a `minHeight`: the bar grows with Dynamic Type instead of clipping its labels. */
function grow(view: ViewStyle | undefined, given?: ViewStyle): ViewStyle {
  // A height or minHeight the product gave through `styles` is theirs, as it is.
  if (given && (given.height !== undefined || given.minHeight !== undefined)) return (view ?? {}) as ViewStyle;
  const { height, ...rest } = (view ?? {}) as ViewStyle;
  return { ...rest, minHeight: height };
}

/** An icon part as the glyph draws it: its width is the size, its text colour the ink, the rest of its view style (what `styles` adds) the glyph's style. */
function glyphOf(p: PartStyle, size?: number) {
  const { width, height: _height, ...rest } = p.view as ViewStyle;
  return { size: (width as number | undefined) ?? size, color: p.text.color, style: Object.keys(rest).length ? (rest as ViewStyle) : undefined };
}

/** How much bigger the lens is than the capsule it lifts out of. */
const LENS_SCALE = 1.22;
/** Points of sideways travel before a touch becomes a drag. */
const DRAG = 4;

/** The layout and the motion no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { width: "100%", gap: t.space.md },
  bar: { flexDirection: "row", alignItems: "flex-end", gap: t.space.sm },
  track: { flex: 1 },
  pill: { flexDirection: "row", alignItems: "center", padding: t.space["2xs"] },
  bare: { borderWidth: 0 },
  tab: { flexShrink: 1, flexBasis: 0, alignItems: "center", justifyContent: "center", gap: t.space["3xs"] },
  capsule: { ...StyleSheet.absoluteFillObject },
  badge: { position: "absolute", top: -t.space.xs, left: t.tabBar.badgeX, borderWidth: t.border.wThick, borderColor: t.surface.card },
  pressed: { transform: [{ scale: 0.94 }] },
  squeezedSurface: { flex: 1, padding: t.space["2xs"] },
  disc: { flex: 1, alignItems: "center", justifyContent: "center" },
  grow: { flex: 1 },
  action: { alignItems: "center", justifyContent: "center" },
  lens: { position: "absolute", left: 0, top: 0, borderRadius: t.radius.pill, pointerEvents: "none" },
  lensGlass: { ...StyleSheet.absoluteFillObject, borderRadius: t.radius.pill },
  safeArea: { alignItems: "center", justifyContent: "flex-end", paddingBottom: t.space.sm },
  safeAreaAndroid: { paddingBottom: t.space.xs },
  homeAndroid: { opacity: 0.5 },
}));

interface TabProps {
  tab: NavItem;
  styles?: PartStyles<"tab-bar">;
  strings?: Partial<KitStrings["tab-bar"]>;
  on: boolean;
  /** The lens is over it: the icon swells. */
  under: boolean;
  /** Every tab shows its label, not only the open one (large text, where an icon alone is not enough). */
  labelled: boolean;
  testID?: string;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  onLayout: (layout: LayoutRectangle) => void;
}

function Tab({ tab, on, under, labelled, testID, onPress, onPressIn, onPressOut, onLayout, styles, strings }: TabProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("tab-bar", strings);
  const press = usePress();
  const reduceMotion = useReducedMotion();
  const r = useRecipe(recipes["tab-bar"], { state: { on, focus: press.focused }, styles });
  // The capsule grows toward the new tab while the old one shrinks. flexGrow is layout, so this is on the JS driver.
  const sel = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) {
      sel.setValue(on ? 1 : 0);
      return;
    }
    const run = Animated.timing(sel, { toValue: on ? 1 : 0, duration: t.duration.slow, easing: bezier(t.ease.out), useNativeDriver: false });
    run.start();
    return () => run.stop();
  }, [on, sel, t.duration, t.ease, reduceMotion]);
  const badge = tab.badge ?? 0;
  // What the badge counts: the tab's own word, else "new".
  const counted = tab.badgeLabel ?? str("new");
  const flexGrow = sel.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  // A control that holds a label grows with it: minHeight in place of the recipe's fixed height.
  const tabStyle = partStyle(r, "tab", { view: press.pressed && s.pressed });
  return (
    <AnimatedPressable
      testID={partId(testID, "tab-bar", "tab")}
      accessibilityRole="tab"
      accessibilityLabel={badge > 0 ? str("tab", { label: tab.label, count: badge, what: counted }) : tab.label}
      accessibilityState={{ selected: on }}
      onPress={() => onPress()}
      onPressIn={() => {
        press.handlers.onPressIn();
        onPressIn();
      }}
      onPressOut={() => {
        press.handlers.onPressOut();
        onPressOut();
      }}
      onFocus={press.handlers.onFocus}
      onBlur={press.handlers.onBlur}
      onLayout={(e) => onLayout(e.nativeEvent.layout)}
      style={[s.tab, { flexGrow }, grow(StyleSheet.flatten(tabStyle.view) as ViewStyle, styles?.tab as ViewStyle | undefined)]}
    >
      <Animated.View testID={partId(testID, "tab-bar", "capsule")} style={[s.capsule, { opacity: sel }, r.capsule.view]} />
      <View>
        <View style={under ? { transform: [{ scale: 1.16 }] } : null}>
          <Icon testID={partId(testID, "tab-bar", "icon")} name={tab.icon} {...glyphOf(r.icon)} />
        </View>
        {badge > 0 ? <Badge count={badge} max={tab.max ?? 9} label={counted} style={s.badge} /> : null}
      </View>
      {on || labelled ? (
        <Enter motion={on ? "fade" : false}>
          <Text testID={partId(testID, "tab-bar", "label")} numberOfLines={1} maxFontSizeMultiplier={fontScale.chrome} style={[r.label.view, r.label.text]}>
            {tab.label}
          </Text>
        </Enter>
      ) : null}
    </AnimatedPressable>
  );
}

function Squeezed({ tab, testID, onPress, styles, strings }: { tab: NavItem; testID?: string; onPress: () => void; styles?: PartStyles<"tab-bar">; strings?: Partial<KitStrings["tab-bar"]> }) {
  const s = useStyles();
  const str = useStrings("tab-bar", strings);
  const press = usePress();
  const r = useRecipe(recipes["tab-bar"], { state: { focus: press.focused }, styles });
  const squeezed = partStyle(r, "squeezed", { view: press.pressed && s.pressed });
  return (
    <Pressable
      testID={partId(testID, "tab-bar", "squeezed")}
      accessibilityRole="button"
      accessibilityLabel={str("showTabs", { label: tab.label })}
      onPress={() => onPress()}
      {...press.handlers}
      style={squeezed.view}
    >
      <GlassSurface testID={partId(testID, "tab-bar", "squeezedSurface")} style={[s.squeezedSurface, r.squeezedSurface.view]} glassStyle={[s.bare, styles?.squeezedSurface]}>
        <View testID={partId(testID, "tab-bar", "disc")} style={[s.disc, r.disc.view]}>
          <Icon testID={partId(testID, "tab-bar", "discIcon")} name={tab.icon} {...glyphOf(r.discIcon)} />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function Action({ action, testID, onPress, styles }: { action: ActionItem; testID?: string; onPress: () => void; styles?: PartStyles<"tab-bar"> }) {
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes["tab-bar"], { state: { focus: press.focused }, styles });
  const root = partStyle(r, "action", { view: [s.action, press.pressed && s.pressed] });
  return (
    <Pressable
      testID={partId(testID, "tab-bar", "action")}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={() => onPress()}
      {...press.handlers}
      style={root.view}
    >
      {action.icon ? <Icon testID={partId(testID, "tab-bar", "actionIcon")} name={action.icon} {...glyphOf(r.actionIcon, 28)} /> : null}
    </Pressable>
  );
}

/**
 * iOS 26's selection lens. Touching the bar lifts the selection into a larger clear-glass lens;
 * a drag moves it under the finger, stretching with speed and swelling the icon beneath; letting go
 * settles it into that tab and selects it. A tap does the same in one motion, through the tab's own
 * press. Width and position are layout, so the lens runs on the JS driver.
 */
function useLens(glass: boolean, select: (key: string) => void, current: string, reduceMotion: boolean) {
  const layouts = useRef<Partial<Record<string, LayoutRectangle>>>({});
  const track = useRef<View>(null);
  const frame = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const g = useRef({ lifted: false, dragging: false, width: 0, start: current, over: null as string | null });
  // The selection as of now, ahead of the re-render a press asks for.
  const live = useRef(current);
  useEffect(() => {
    live.current = current;
  }, [current]);
  const [box, setBox] = useState<{ y: number; height: number } | null>(null);
  const [under, setUnder] = useState<string | null>(null);
  const a = useRef({ x: new Animated.Value(0), w: new Animated.Value(0), scale: new Animated.Value(1), stretch: new Animated.Value(1), opacity: new Animated.Value(0) }).current;
  const spring = (bounciness: number) => ({ speed: 14, bounciness: reduceMotion ? 0 : bounciness, useNativeDriver: false });

  const nearest = (x: number): string | null => {
    let best: string | null = null;
    let dist = Infinity;
    for (const [key, l] of Object.entries(layouts.current) as [string, LayoutRectangle][]) {
      const d = Math.abs(l.x + l.width / 2 - x);
      if (d < dist) [best, dist] = [key, d];
    }
    return best;
  };

  const hover = (key: string | null) => {
    if (g.current.over === key) return;
    g.current.over = key;
    setUnder(key);
  };

  const lift = (pressed: string) => {
    if (!glass) return;
    const l = layouts.current[live.current] ?? layouts.current[pressed];
    if (!l) return;
    g.current = { ...g.current, lifted: true, dragging: false, width: l.width, start: pressed };
    a.x.setValue(l.x);
    a.w.setValue(l.width);
    a.stretch.setValue(1);
    a.opacity.setValue(1);
    a.scale.setValue(1);
    setBox({ y: l.y, height: l.height });
    hover(layouts.current[live.current] ? live.current : pressed);
    Animated.spring(a.scale, { toValue: LENS_SCALE, ...spring(10) }).start();
    track.current?.measure((_x, _y, w, h, pageX, pageY) => (frame.current = { x: pageX, y: pageY, w, h }));
  };

  const settle = (key: string) => {
    g.current.lifted = false;
    const l = layouts.current[key];
    Animated.parallel([
      ...(l ? [Animated.spring(a.x, { toValue: l.x, ...spring(6) }), Animated.spring(a.w, { toValue: l.width, ...spring(6) })] : []),
      Animated.spring(a.scale, { toValue: 1, ...spring(6) }),
      Animated.timing(a.stretch, { toValue: 1, duration: 120, useNativeDriver: false }),
      // It glides in first, then fades over the tint that now marks the tab.
      Animated.sequence([Animated.delay(170), Animated.timing(a.opacity, { toValue: 0, duration: 160, useNativeDriver: false })]),
    ]).start(({ finished }) => {
      if (!finished) return;
      setBox(null);
      hover(null);
    });
  };

  /** The finger's x inside the bar: measured on lift, or from where the drag began until the measure lands. */
  const localX = (gs: PanResponderGestureState) => {
    if (frame.current) return gs.moveX - frame.current.x;
    const s = layouts.current[g.current.start];
    return (s ? s.x + s.width / 2 : 0) + gs.dx;
  };

  const follow = (gs: PanResponderGestureState) => {
    const x = localX(gs);
    const total = frame.current?.w ?? Math.max(0, ...(Object.values(layouts.current) as LayoutRectangle[]).map((l) => l.x + l.width));
    const w = g.current.width;
    a.x.setValue(Math.max(0, Math.min(total - w, x - w / 2)));
    a.stretch.setValue(reduceMotion ? 1 : Math.min(1.25, 1 + Math.abs(gs.vx) * 0.18));
    const key = nearest(x);
    const l = key ? layouts.current[key] : undefined;
    if (!key || !l || key === g.current.over) return;
    hover(key);
    // Morphs between tab widths as it passes over them.
    g.current.width = l.width;
    Animated.timing(a.w, { toValue: l.width, duration: 200, useNativeDriver: false }).start();
  };

  const release = (gs: PanResponderGestureState, ended: boolean) => {
    g.current.dragging = false;
    const f = frame.current;
    // Letting go away from the bar cancels: the lens goes home to the current tab.
    const inside = ended && (!f || (gs.moveX >= f.x && gs.moveX <= f.x + f.w && gs.moveY >= f.y - 24 && gs.moveY <= f.y + f.h + 24));
    const target = inside ? nearest(localX(gs)) : null;
    settle(target ?? live.current);
    if (target && target !== live.current) {
      live.current = target;
      select(target);
    }
  };

  const latest = useRef({ follow, release });
  useEffect(() => {
    latest.current = { follow, release };
  });

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gs) => g.current.lifted && Math.abs(gs.dx) > DRAG && Math.abs(gs.dx) > Math.abs(gs.dy),
        onPanResponderGrant: () => {
          g.current.dragging = true;
        },
        onPanResponderMove: (_, gs) => latest.current.follow(gs),
        onPanResponderRelease: (_, gs) => latest.current.release(gs, true),
        onPanResponderTerminate: (_, gs) => latest.current.release(gs, false),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  return {
    track,
    handlers: glass ? pan.panHandlers : null,
    under,
    box,
    anim: a,
    measure: (key: string, l: LayoutRectangle) => (layouts.current[key] = l),
    pressIn: lift,
    pressOut: () => {
      // A drag that took the touch over reports here first; its release settles the lens instead.
      setTimeout(() => {
        if (g.current.lifted && !g.current.dragging) settle(live.current);
      }, 0);
    },
    tapped: (key: string) => (live.current = key),
  };
}

export function TabBar({ tabs = [], active = "", expanded = true, keyboardUp = false, safeArea = false, action, onActiveChange, onExpandedChange, onAction, styles, strings, style, testID, ...rest }: TabBarProps) {
  const { os, glass } = useTheme();
  const s = useStyles();
  const str = useStrings("tab-bar", strings);
  const r = useRecipe(recipes["tab-bar"], { styles });
  const [current, setCurrent] = useControllable(active, onActiveChange);
  const [shown, setExpanded] = useControllable(expanded, onExpandedChange);
  const squeezed = !shown;
  const reduceMotion = useReducedMotion();
  const lens = useLens(glass, setCurrent, current, reduceMotion);
  // At large text an icon alone is not enough: every tab says what it is.
  const { fontScale: scale } = useWindowDimensions();
  const labelled = scale >= 1.3;
  useEffect(() => {
    if (typeof __DEV__ !== "undefined" && __DEV__ && tabs.length > 5) console.warn(`TabBar: ${tabs.length} tabs; a bar holds five, or each tab is narrower than the 44pt touch size. Put the rest behind a "More" tab.`);
  }, [tabs.length]);
  const open = tabs.find((tab) => tab.key === current);
  const android = os === "android";
  const safe = partStyle(r, "safeArea", { view: android && s.safeAreaAndroid });
  const home = partStyle(r, "home", { view: android && s.homeAndroid });
  return (
    <View testID={testID} {...rootProps(rest)} style={[s.root, style]}>
      {keyboardUp ? null : (
        <View testID={partId(testID, "tab-bar", "bar")} style={[s.bar, r.bar.view]}>
          {squeezed ? null : (
            <View ref={lens.track} accessibilityRole="tablist" accessibilityLabel={str("main")} style={s.track} {...lens.handlers}>
              <GlassSurface testID={partId(testID, "tab-bar", "pill")} style={[s.pill, grow(r.pill.view, styles?.pill as ViewStyle | undefined)]} glassStyle={[s.bare, styles?.pill]}>
                {tabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    tab={tab}
                    on={tab.key === current}
                    under={lens.under === tab.key}
                    labelled={labelled}
                    testID={testID}
                    onPress={() => {
                      lens.tapped(tab.key);
                      setCurrent(tab.key);
                    }}
                    onPressIn={() => lens.pressIn(tab.key)}
                    onPressOut={lens.pressOut}
                    onLayout={(l) => lens.measure(tab.key, l)}
                    styles={styles}
                    strings={strings}
                  />
                ))}
                {lens.box ? (
                  <Animated.View
                    style={[
                      s.lens,
                      {
                        top: lens.box.y,
                        height: lens.box.height,
                        width: lens.anim.w,
                        opacity: lens.anim.opacity,
                        transform: [{ translateX: lens.anim.x }, { scale: lens.anim.scale }, { scaleX: lens.anim.stretch }],
                      },
                    ]}
                  >
                    <GlassSurface clear style={s.lensGlass} />
                  </Animated.View>
                ) : null}
              </GlassSurface>
            </View>
          )}
          {squeezed && open ? (
            <Squeezed
              tab={open}
              testID={testID}
              onPress={() => setExpanded(true)}
              styles={styles}
              strings={strings}
            />
          ) : null}
          {squeezed ? <View style={s.grow} /> : null}
          {squeezed || !action ? null : <Action action={action} testID={testID} onPress={() => onAction?.(action)} styles={styles} />}
        </View>
      )}
      {safeArea ? (
        <View testID={partId(testID, "tab-bar", "safeArea")} aria-hidden style={[s.safeArea, safe.view]}>
          <View testID={partId(testID, "tab-bar", "home")} style={home.view} />
        </View>
      ) : null}
    </View>
  );
}
