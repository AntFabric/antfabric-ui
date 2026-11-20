import { useState, type ReactNode } from "react";
import { View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import { createStyles } from "../theme";
import { EmptyState } from "../components/feedback/empty-state";
import { LoadingBars } from "./loading";

/* structural: the width a chart has on the server and until it is measured, so its first render is the same everywhere */
const DEFAULT_WIDTH = 520;

/**
 * The width of the view `onLayout` is put on, kept as it changes: `[width, onLayout]`. `initial` is what the first render (and the
 * server) uses, so a chart's first render is the same everywhere. For a visual that takes its parent's width (a trend bled into a card).
 */
export function useWidth(initial = DEFAULT_WIDTH): [number, (e: LayoutChangeEvent) => void] {
  const [width, setWidth] = useState(initial);
  return [width, (e) => setWidth(Math.max(0, Math.round(e.nativeEvent.layout.width)))];
}

export interface ChartFrameProps {
  /** The plot's height. With `grow` it is the least the plot has. */
  height: number;
  /** The plot takes the height its content needs (a ring with a list that may be longer than it), and `height` is the least. The loading and empty states keep `height`. */
  grow?: boolean;
  /** The plot holds controls (a list of rows to press), so it is not one image: the chart labels the part that is an image itself, and the frame names only itself. */
  interactive?: boolean;
  /** What the chart is, for a screen reader: the plot's name. The ready-made charts pass the summary itself, so the plot is read as the sentence. */
  label: string;
  loading?: boolean;
  /** Nothing to draw: the frame says so instead of an empty plot. */
  empty?: boolean;
  /** The empty state's title and the line under it. The chart passes its own strings: the frame has no text of its own. */
  emptyTitle: string;
  emptyLine: string;
  /** What a screen reader hears for the grey bars while the chart loads. */
  loadingLabel: string;
  /** Draws the plot at the width the frame measured. gifted-charts takes a number, not a percentage. */
  children: (width: number) => ReactNode;
  style?: ViewStyle;
}

const useStyles = createStyles((t) => ({
  root: { alignSelf: "stretch", minWidth: 0 },
  empty: { alignItems: "center", justifyContent: "center" },
}));

/**
 * What every chart sits in: it measures its own width (a fixed default until the first layout, and on the server), draws loading as a
 * Skeleton and empty as an EmptyState, and is named by `label`: the ready-made charts pass the sentence `summarize` writes, which a screen reader
 * hears and nothing prints. The relief for series under 3:1 on the card is the tooltip and "View as table". The chart library is handed an explicit
 * width and height.
 */
export function ChartFrame({ height, grow = false, interactive = false, label, loading = false, empty = false, emptyTitle, emptyLine, loadingLabel, children, style }: ChartFrameProps) {
  const s = useStyles();
  const [width, measure] = useWidth();
  let body: ReactNode;
  if (loading) body = <LoadingBars width={width} height={height} label={loadingLabel} />;
  else if (empty) body = <View style={[s.empty, { height }]}><EmptyState art="none" icon="chart-column" title={emptyTitle} line={emptyLine} /></View>;
  // The plot is one image, named by the sentence: a chart is not a thing a screen reader can walk through bar by bar.
  else if (interactive) body = <View testID="chart-plot" style={grow ? { minHeight: height } : { height }}>{width > 0 ? children(width) : null}</View>;
  else body = <View testID="chart-plot" accessible accessibilityRole="image" accessibilityLabel={label} style={grow ? { minHeight: height } : { height }}>{width > 0 ? children(width) : null}</View>;
  return (
    <View testID="chart-frame" accessible={loading || empty} accessibilityRole="image" accessibilityLabel={label} accessibilityState={{ busy: loading }} onLayout={measure} style={[s.root, style]}>
      {body}
    </View>
  );
}
