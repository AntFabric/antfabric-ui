import type { CSSProperties } from "react";
import { t } from "../tokens";
import { LOADING_BARS } from "@antfabric/ui-core/chart";
import { box, css, row } from "../lib/style";
import { Skeleton } from "../components/feedback/skeleton";
import { useChartTokens } from "./theme";

export interface LoadingLine {
  /** A length: a token read as `${t.kpi.loadM}`. The Skeleton sizes itself, so a percentage would resolve against nothing. */
  width: string;
  height: string;
}

/**
 * A KPI's loading state: a few grey lines the size of what is coming, from the kit's Skeleton. A screen reader hears it once: only the
 * first line is named, and the rest are hidden from it.
 */
export function LoadingLines({ lines, label, style }: { lines: LoadingLine[]; label: string; style?: CSSProperties }) {
  return (
    <div style={css(box, { gap: t.space.smMd, alignItems: "flex-start" }, style)}>
      {lines.map((line, i) => {
        const bar = <Skeleton shape="line" width={line.width} height={line.height} label={label} />;
        return i === 0 ? <div key={i}>{bar}</div> : <div key={i} aria-hidden>{bar}</div>;
      })}
    </div>
  );
}

/**
 * A chart's loading state: grey bars of uneven heights across the plot, from the kit's Skeleton, at the width the frame measured. A screen reader hears
 * it once: only the first bar is named.
 */
export function LoadingBars({ width, height, label }: { width: number; height: number; label: string }) {
  const tk = useChartTokens();
  const gap = tk.space.md;
  const bar = Math.max(0, Math.floor((width - gap * (LOADING_BARS.length - 1)) / LOADING_BARS.length));
  return (
    <div style={css(row, { alignItems: "flex-end", justifyContent: "space-between", height })}>
      {LOADING_BARS.map((share, i) => {
        const shape = <Skeleton shape="block" width={`${bar}px`} height={`${Math.round(height * share)}px`} label={label} />;
        return i === 0 ? <div key={i}>{shape}</div> : <div key={i} aria-hidden>{shape}</div>;
      })}
    </div>
  );
}
