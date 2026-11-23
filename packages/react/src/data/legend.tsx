import { useId, type CSSProperties } from "react";
import { markPath, seriesMark, type Series } from "@antfabric/ui-core/chart";
import { t } from "../tokens";
import { useInteraction } from "../lib/interaction";
import { css, pressable, row } from "../lib/style";
import { TexturePattern } from "./texture";
import { useChartTokens } from "./theme";

export interface LegendProps {
  series: Series;
  /** A series' name for people (default the field). */
  labels?: Record<string, string>;
  /** The name a screen reader gives the group of toggles ("Series"). The chart passes its own string. */
  label: string;
  /** The key draws each series' dash and marker beside its colour (`seriesMark`), the same ones the plot draws when it is told to; `"texture"` draws its swatch in its texture, as a bar chart fills its bars. */
  marks?: boolean | "texture";
  style?: CSSProperties;
}

/** The key's box, in SVG units: a line sample with its marker in the middle. */
const KEY = { w: 24, h: 12, stroke: 2 } as const;

function Item({ field, label, on, color, onPress, index, texture = false }: { field: string; label: string; on: boolean; color: string; onPress: () => void; index?: number; texture?: boolean }) {
  const mark = index === undefined ? null : seriesMark(index);
  const pattern = `af-chart-${useId().replace(/\W/g, "")}`;
  const tk = useChartTokens();
  // Hover and focus come from the hook, never from `:hover`: the catalogue forces them for its snapshots.
  const ui = useInteraction();
  return (
    <button
      type="button"
      data-af-press
      data-field={field}
      aria-pressed={on}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, row, {
        gap: t.space.xs,
        padding: `${t.space["3xs"]} ${t.space.sm}`,
        borderRadius: t.radius.pill,
        background: ui.hovered ? t.hover.surface : "transparent",
        boxShadow: ui.focused ? t.shadow.focus : "none",
        color: on ? t.fg.muted : t.fg.faint,
        fontFamily: t.chart.font,
        fontSize: t.text.caption,
        lineHeight: t.text.captionLine,
        textDecoration: on ? "none" : "line-through",
      })}
    >
      {mark && texture && mark.texture !== "none" ? (
        // The swatch in the series' texture, the pattern its bars are filled with (the first series is plain, as its bars are).
        <svg aria-hidden viewBox={`0 0 ${KEY.h} ${KEY.h}`} style={{ width: t.space.smMd, height: t.space.smMd, borderRadius: t.radius.tag, flexShrink: 0, opacity: on ? 1 : t.opacity.muted }}>
          <defs>
            <TexturePattern id={pattern} texture={mark.texture} ink={tk.surface.card} fill={color} />
          </defs>
          <rect width={KEY.h} height={KEY.h} fill={`url(#${pattern})`} />
        </svg>
      ) : mark && !texture ? (
        <svg aria-hidden viewBox={`0 0 ${KEY.w} ${KEY.h}`} style={{ width: `calc(${t.space.smMd} * 2)`, height: t.space.smMd, flexShrink: 0, opacity: on ? 1 : t.opacity.muted }}>
          <line x1={0} x2={KEY.w} y1={KEY.h / 2} y2={KEY.h / 2} stroke={color} strokeWidth={KEY.stroke} strokeDasharray={mark.dash.length ? mark.dash.map((n) => n * KEY.stroke).join(" ") : undefined} />
          <path d={markPath(mark.shape, KEY.w / 2, KEY.h / 2, KEY.h * 0.6)} fill={mark.shape === "cross" ? "none" : color} stroke={color} strokeWidth={KEY.stroke / 2} />
        </svg>
      ) : (
        <span aria-hidden style={{ width: t.space.smMd, height: t.space.smMd, borderRadius: t.radius.tag, flexShrink: 0, background: color, opacity: on ? 1 : t.opacity.muted }} />
      )}
      {label}
    </button>
  );
}

/**
 * The series colour key, and the way to turn a series off: a toggle button per series, `aria-pressed`, the same state as the phone's.
 * One series needs no key, so it draws nothing. The last series showing cannot be turned off.
 */
export function Legend({ series, labels = {}, label, marks = false, style }: LegendProps) {
  if (series.fields.length < 2) return null;
  return (
    <div role="group" aria-label={label} style={css(row, { flexWrap: "wrap", gap: `${t.space["3xs"]} ${t.space.xs}` }, style)}>
      {series.fields.map((f) => (
        <Item key={f} field={f} label={labels[f] ?? f} on={!series.hidden.has(f)} color={series.colorOf(f)} onPress={() => series.toggle(f)} index={marks ? series.fields.indexOf(f) : undefined} texture={marks === "texture"} />
      ))}
    </div>
  );
}
