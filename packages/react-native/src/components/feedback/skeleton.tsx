import { useEffect, useState } from "react";
import { Animated, Easing, Platform, View, type DimensionValue, type ViewStyle } from "react-native";
import type { PartStyle, PartStyles } from "../../lib/recipe";
import { partStyle } from "../../lib/recipe";
import { recipes, useStrings, type KitStrings } from "@antfabric-ui/core";
import { createStyles } from "../../theme";
import { announce } from "../../lib/a11y";
import { Enter, useReducedMotion } from "../../lib/motion";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { useRecipe } from "../../lib/recipe";

export type SkeletonShape = "line" | "block" | "circle" | "tag" | "panel" | "row";
export type SkeletonLead = "face" | "tile" | "none";

export interface SkeletonRow {
  /** Title bar width, pt. */
  title: number;
  /** Subtitle bar width, pt. */
  subtitle: number;
}

export interface SkeletonProps extends RootProps {
  /** A single shape, or `row`: the list-row preset (a lead, a title and a subtitle per row). */
  shape?: SkeletonShape;
  /** Shapes only: a length ("160px") or a percentage, sized to what is coming. */
  width?: string;
  /** Shapes only. */
  height?: string;
  /** What a screen reader hears, once: "Loading messages", not "Loading". */
  label?: string;
  /** Pass useSlowFlag(loading): laid out but invisible for the first 300 ms, so nothing jumps when it fades in. */
  visible?: boolean;
  /** Row preset: a face, an icon tile, or text only. */
  lead?: SkeletonLead;
  /** Row preset: 1 a name-only row, 2 name and subtitle, 3 name and a two-line subtitle. */
  lines?: 1 | 2 | 3;
  /** Row preset: a short line at the trailing edge (a time, an age). */
  trailing?: boolean;
  /** Row preset: one entry per row, with its bar widths. Vary them so a column never reads as one stamp. */
  rows?: SkeletonRow[];
  /** Per-part styles over the theme: `{ shape: {…}, bar: {…} }`. */
  styles?: PartStyles<"skeleton">;
  /** This placeholder's built-in text (the default announcement) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["skeleton"]>;
  style?: ViewStyle;
}

/** One loop drives every shape on screen: started by the first visible skeleton, stopped by the last. */
const phase = new Animated.Value(0);
let users = 0;
let loop: Animated.CompositeAnimation | null = null;

function useSweep(on: boolean, reduceMotion: boolean) {
  useEffect(() => {
    if (!on || reduceMotion) return;
    if (users++ === 0) {
      phase.setValue(0);
      loop = Animated.loop(Animated.timing(phase, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" }));
      loop.start();
    }
    return () => {
      if (--users === 0) {
        loop?.stop();
        loop = null;
      }
    };
  }, [on, reduceMotion]);
}

/** The band's soft edges, as slices of the sheen colour: React Native draws no gradient of its own. */
const BAND = [0.2, 0.5, 0.85, 1, 0.85, 0.5, 0.2];

/** Layout no token decides; what the tokens decide (fill, band colour, radius, gap, line heights) is the recipe's. */
const useStyles = createStyles((t) => ({
  fill: { overflow: "hidden", maxWidth: "100%" },
  band: { position: "absolute", top: 0, bottom: 0, left: 0, width: 120, flexDirection: "row" },
  slice: { flex: 1 },
  // The row's 12pt inset is a StyleSheet `padding` (see the recipe).
  row: { flexDirection: "row", alignItems: "center", padding: t.space.md },
  lines: { flex: 1, minWidth: 0, gap: 1 },
  titleBox: { justifyContent: "center" },
  subBox: { justifyContent: "center", flexShrink: 0 },
}));

/** A grey shape with the sheen crossing it, from 160 before its leading edge to past its trailing one. The part's fill is `bg` and the band's colour its `fg`. */
function Shape({ part, look, testID }: { part: string; look: PartStyle; testID?: string }) {
  const s = useStyles();
  const reduceMotion = useReducedMotion();
  const [w, setW] = useState(0);
  const x = phase.interpolate({ inputRange: [0, 1], outputRange: [-160, w + 40] });
  return (
    <View testID={partId(testID, "skeleton", part)} onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[s.fill, look.view]}>
      {reduceMotion ? null : (
        <Animated.View style={[s.band, { transform: [{ translateX: x }] }]}>
          {BAND.map((o, i) => (
            <View key={i} style={[s.slice, { backgroundColor: look.text.color, opacity: o }]} />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

/** "160px" → 160; a percentage stays a percentage. */
const length = (v: string): DimensionValue => (v.trim().endsWith("%") ? (v.trim() as DimensionValue) : parseFloat(v) || 0);

export function Skeleton({
  shape = "line",
  width = "160px",
  height = "12px",
  label,
  visible = true,
  lead = "face",
  lines = 2,
  trailing = false,
  rows = [
    { title: 148, subtitle: 196 },
    { title: 96, subtitle: 140 },
    { title: 132, subtitle: 180 },
  ],
  styles,
  strings,
  style,
  testID,
  ...rest
}: SkeletonProps) {
  const s = useStyles();
  const str = useStrings("skeleton", strings);
  const r = useRecipe(recipes.skeleton, { variants: { shape, lead }, styles });
  // An invisible skeleton does not run the loop.
  const reduceMotion = useReducedMotion();
  useSweep(visible, reduceMotion);
  const name = label ?? str("loading");
  // iOS has no live regions: the placeholder is spoken once, when it appears.
  useEffect(() => {
    if (visible) announce(name);
  }, [name, visible]);
  return (
    <Enter
      // Laid out but invisible until `visible`; then it fades in.
      {...rootProps(rest)}
      testID={partId(testID, "skeleton", "root")}
      key={visible ? "on" : "off"}
      motion={visible ? "fade" : false}
      accessible
      role="status"
      accessibilityLabel={name}
      accessibilityState={{ busy: true }}
      style={[{ alignSelf: shape === "row" ? "stretch" : "flex-start", maxWidth: "100%" }, partStyle(r, "root", { view: !visible && { opacity: 0 } }).view, style]}
    >
      {shape !== "row" ? (
        <Shape part="shape" testID={testID} look={partStyle(r, "shape", { view: { width: length(width), height: length(height) } })} />
      ) : (
        rows.map((spec, i) => (
          <View key={i} testID={partId(testID, "skeleton", "row")} importantForAccessibility="no-hide-descendants" style={[s.row, r.row.view]}>
            {lead !== "none" ? <Shape part="lead" testID={testID} look={partStyle(r, "lead", { view: { width: 36, height: 36, ...(lead === "tile" && { borderRadius: lines === 1 ? 6 : 10 }) } })} /> : null}
            <View style={s.lines}>
              <View testID={partId(testID, "skeleton", "titleBox")} style={[s.titleBox, r.titleBox.view]}>
                <Shape part="bar" testID={testID} look={partStyle(r, "bar", { view: { width: spec.title, height: 10 } })} />
              </View>
              {lines >= 2 ? (
                <View testID={partId(testID, "skeleton", "subBox")} style={[s.subBox, r.subBox.view]}>
                  <Shape part="bar" testID={testID} look={partStyle(r, "bar", { view: { width: spec.subtitle, height: 8 } })} />
                </View>
              ) : null}
              {lines === 3 ? (
                <View testID={partId(testID, "skeleton", "subBox")} style={[s.subBox, r.subBox.view]}>
                  <Shape part="bar" testID={testID} look={partStyle(r, "bar", { view: { width: 168, height: 8 } })} />
                </View>
              ) : null}
            </View>
            {trailing ? (
              <View testID={partId(testID, "skeleton", "subBox")} style={[s.subBox, r.subBox.view]}>
                <Shape part="bar" testID={testID} look={partStyle(r, "bar", { view: { width: 32, height: 8 } })} />
              </View>
            ) : null}
          </View>
        ))
      )}
    </Enter>
  );
}
