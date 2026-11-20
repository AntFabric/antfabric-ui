import { View, type ViewStyle } from "react-native";
import { LOADING_BARS } from "@antfabric-ui/core/chart";
import { createStyles } from "../theme";
import { Skeleton } from "../components/feedback/skeleton";
import { useChartTokens } from "./theme";

export interface LoadingLine {
  /** Points, as a length string ("130px"): the Skeleton sizes itself, so a percentage would resolve against nothing. */
  width: string;
  height: string;
}

const useStyles = createStyles((t) => ({
  root: { gap: t.space.smMd, alignItems: "flex-start" },
}));

/**
 * A KPI's loading state: a few grey lines the size of what is coming, from the kit's Skeleton. A screen reader hears it once: only the
 * first line is named, and the rest are hidden from it.
 */
export function LoadingLines({ lines, label, style }: { lines: LoadingLine[]; label: string; style?: ViewStyle }) {
  const s = useStyles();
  return (
    <View style={[s.root, style]}>
      {lines.map((line, i) => {
        const bar = <Skeleton shape="line" width={line.width} height={line.height} label={label} />;
        return i === 0 ? <View key={i}>{bar}</View> : <View key={i} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{bar}</View>;
      })}
    </View>
  );
}

const useBarStyles = createStyles(() => ({
  bars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
}));

/**
 * A chart's loading state: grey bars of uneven heights across the plot, from the kit's Skeleton, at the width the frame measured. A screen
 * reader hears it once: only the first bar is named.
 */
export function LoadingBars({ width, height, label }: { width: number; height: number; label: string }) {
  const s = useBarStyles();
  const t = useChartTokens();
  const gap = t.space.md;
  const bar = Math.max(0, Math.floor((width - gap * (LOADING_BARS.length - 1)) / LOADING_BARS.length));
  return (
    <View style={[s.bars, { height }]}>
      {LOADING_BARS.map((share, i) => {
        const shape = <Skeleton shape="block" width={`${bar}px`} height={`${Math.round(height * share)}px`} label={label} />;
        return i === 0 ? <View key={i}>{shape}</View> : <View key={i} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{shape}</View>;
      })}
    </View>
  );
}
