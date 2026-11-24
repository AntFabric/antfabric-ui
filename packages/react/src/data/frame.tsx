import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { t } from "../tokens";
import { box, css } from "../lib/style";
import { EmptyState } from "../components/feedback/empty-state";
import { LoadingBars } from "./loading";

/* structural: the width a chart has on the server and until it is measured, so its first render is the same everywhere */
const DEFAULT_WIDTH = 520;

/** The width of the element `ref` is put on, measured before paint and kept as it resizes. `initial` is what the server and the first render use. */
export function useWidth(initial = DEFAULT_WIDTH): [number, React.RefObject<HTMLDivElement | null>] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.getBoundingClientRect().width) || initial);
    // jsdom (a consumer's Jest or Vitest) has no ResizeObserver: the width measured once stands.
    if (typeof ResizeObserver !== "function") return;
    // One update a frame: dragging a panel edge fires the observer faster than the screen draws, and each width re-lays out the whole plot.
    let frame = 0;
    const watch = new ResizeObserver(([e]) => {
      const next = Math.max(0, Math.round(e!.contentRect.width));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(next));
    });
    watch.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      watch.disconnect();
    };
  }, [initial]);
  return [width, ref];
}

export interface ChartFrameProps {
  /** The plot's height. With `grow` it is the least the plot has. */
  height: number;
  /** The plot takes the height its content needs (a ring with a list that may be longer than it), and `height` is the least. The loading and empty states keep `height`. */
  grow?: boolean;
  /** What the chart is, for a screen reader: the figure's name. The ready-made charts pass the summary itself, so the figure is read as the sentence. */
  label: string;
  loading?: boolean;
  /** Nothing to draw: the frame says so instead of an empty plot. */
  empty?: boolean;
  /** The empty state's title and the line under it. The chart passes its own strings: the frame has no text of its own. */
  emptyTitle: string;
  emptyLine: string;
  /** What a screen reader hears for the grey bars while the chart loads. */
  loadingLabel: string;
  /** Draws the plot at the width the frame measured. recharts takes a number, never a responsive container. */
  children: (width: number) => ReactNode;
  style?: CSSProperties;
}

/**
 * What every chart sits in: it measures its own width (a fixed default on the server), draws loading as a Skeleton and empty as an
 * EmptyState, and is named by `label`: the ready-made charts pass the sentence `summarize` writes, which a screen reader hears and nothing prints.
 * The relief for series under 3:1 on the card is the tooltip and "View as table". The chart library is handed an explicit width and height.
 */
export function ChartFrame({ height, grow = false, label, loading = false, empty = false, emptyTitle, emptyLine, loadingLabel, children, style }: ChartFrameProps) {
  const [width, ref] = useWidth();
  let body: ReactNode;
  if (loading) body = <LoadingBars width={width} height={height} label={loadingLabel} />;
  else if (empty) body = <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}><EmptyState art="none" icon="chart-column" compact title={emptyTitle} line={emptyLine} /></div>;
  else body = <div style={css(box, grow ? { minHeight: height } : { height })}>{width > 0 ? children(width) : null}</div>;
  return (
    <div ref={ref} role="figure" aria-label={label} aria-busy={loading} style={css(box, style)}>
      {body}
    </div>
  );
}
