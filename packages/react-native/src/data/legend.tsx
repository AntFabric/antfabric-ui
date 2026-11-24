import { useId } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { markPath, seriesMark, type Series } from "@antfabric/ui-core/chart";
import { createStyles } from "../theme";
import { usePress } from "../lib/press";
import { Texture } from "./texture";
import { chartFont, useChartTokens } from "./theme";

export interface LegendProps {
  series: Series;
  /** A series' name for people (default the field). */
  labels?: Record<string, string>;
  /** The name a screen reader gives the group of toggles ("Series"). The chart passes its own string. */
  label: string;
  /** The key draws each series' dash and marker beside its colour (`seriesMark`), the same ones the plot draws when it is told to; `"texture"` draws its swatch in its texture, as a bar chart fills its bars. */
  marks?: boolean | "texture";
  style?: ViewStyle;
}

/** The key's box, in SVG units: a line sample with its marker in the middle. */
const KEY = { w: 24, h: 12, stroke: 2 } as const;

const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", flexWrap: "wrap", gap: t.space["3xs"] },
  item: { flexDirection: "row", alignItems: "center", gap: t.space.xs, minHeight: t.size.target.min, paddingHorizontal: t.space.sm, borderRadius: t.radius.pill },
  swatch: { width: t.space.smMd, height: t.space.smMd, borderRadius: t.radius.tag },
  clip: { overflow: "hidden" },
}));

function Item({ label, on, color, onPress, index, texture = false }: { label: string; on: boolean; color: string; onPress: () => void; index?: number; texture?: boolean }) {
  const mark = index === undefined ? null : seriesMark(index);
  const pattern = `af-chart-${useId().replace(/\W/g, "")}`;
  const s = useStyles();
  const t = useChartTokens();
  // The phone has no hover; a focused item (keyboard, switch access) draws the ring.
  const press = usePress();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.item, { backgroundColor: press.pressed ? t.color.background.hover : "transparent", boxShadow: press.focused ? t.elevation.shadow.focus : undefined }]}
    >
      {mark && !texture ? (
        <Svg width={t.space.smMd * 2} height={t.space.smMd} viewBox={`0 0 ${KEY.w} ${KEY.h}`} style={{ opacity: on ? 1 : t.opacity.muted }}>
          <Line x1={0} x2={KEY.w} y1={KEY.h / 2} y2={KEY.h / 2} stroke={color} strokeWidth={KEY.stroke} strokeDasharray={mark.dash.length ? mark.dash.map((n) => n * KEY.stroke).join(" ") : undefined} />
          <Path d={markPath(mark.shape, KEY.w / 2, KEY.h / 2, KEY.h * 0.6)} fill={mark.shape === "cross" ? "none" : color} stroke={color} strokeWidth={KEY.stroke / 2} />
        </Svg>
      ) : (
        // A bar chart's key: the swatch in the series' texture over its colour, as its bars are filled (the first series is plain).
        <View style={[s.swatch, { backgroundColor: color, opacity: on ? 1 : t.opacity.muted }, mark && mark.texture !== "none" && s.clip]}>{mark && mark.texture !== "none" ? <Texture id={pattern} texture={mark.texture} ink={t.color.background.card} /> : null}</View>
      )}
      <Text style={[chartFont(t), { color: on ? t.color.text.muted : t.color.text.faint, fontSize: t.font.size.caption, lineHeight: t.font.lineHeight.caption, textDecorationLine: on ? "none" : "line-through" }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * The series colour key, and the way to turn a series off: a toggle per series, the same state as the web's. One series needs no key,
 * so it draws nothing. The last series showing cannot be turned off.
 */
export function Legend({ series, labels = {}, label, marks = false, style }: LegendProps) {
  const s = useStyles();
  if (series.fields.length < 2) return null;
  return (
    <View accessibilityRole="toolbar" accessibilityLabel={label} style={[s.root, style]}>
      {series.fields.map((f) => (
        <Item key={f} label={labels[f] ?? f} on={!series.hidden.has(f)} color={series.colorOf(f)} onPress={() => series.toggle(f)} index={marks ? series.fields.indexOf(f) : undefined} texture={marks === "texture"} />
      ))}
    </View>
  );
}
