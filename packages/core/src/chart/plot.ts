/**
 * What the ready-made charts of both kits work out the same way before they hand anything to a library: the value scale of each kind of
 * chart, how wide a run of labels is, which labels survive on a narrow plot, and when a bar chart colours by sign. No third-party code.
 */

import { niceScale, valueDomain, type Scale } from "./scale";
import type { Row } from "./types";

/** A line gets this share of its range as air on each side, so it never runs along the frame (it still never crosses zero for it). */
export const LINE_AIR = 0.08;

/** Lines do not force a zero baseline: the domain is the data's and any target's, with a little air. */
export function lineScale(data: Row[], fields: string[], target?: number): Scale {
  return niceScale(valueDomain(data, fields, { include: target == null ? [] : [target], zero: false }), { pad: LINE_AIR });
}

/** Bars always keep zero (a bar's length is its value); a stack's extent is its sums, positives and negatives apart. */
export function barScale(data: Row[], fields: string[], { stacked = false, target }: { stacked?: boolean; target?: number } = {}): Scale {
  return niceScale(valueDomain(data, fields, { stacked, include: target == null ? [] : [target], zero: true }));
}

/** A label's width in a size of type, as a share of the size per character: an estimate, because the libraries must be told a width before the text is drawn. */
const CHAR = 0.6;
/** The gutter added to a measured run of labels. */
const GUTTER = 10;

/** The width a run of labels needs: the longest, at `size`, and a gutter. */
export const labelWidth = (labels: readonly string[], size: number): number => Math.ceil(Math.max(0, ...labels.map((s) => s.length)) * size * CHAR) + GUTTER;

/** A label cut to fit `room`, with an ellipsis: `#customer-success-enterprise…`. A label that fits is returned as it is. */
export function fitLabel(label: string, room: number, size: number): string {
  const fits = Math.floor(room / (size * CHAR));
  return label.length <= fits ? label : `${label.slice(0, Math.max(1, fits - 1))}…`;
}

/**
 * The labels of a long series as a sparser run: one in every few, the rest empty, so neighbours do not run into each other. Labels
 * that already fit in `room` (the width each category has) are returned as they are. The phone draws these under bars.
 */
export function sparseLabels(labels: readonly string[], room: number, size: number): string[] {
  if (room >= labelWidth(labels, size)) return [...labels];
  const across = Math.max(1, Math.floor((room * labels.length) / labelWidth(labels, size)));
  const every = Math.ceil(labels.length / across);
  return labels.map((l, i) => (i % every === 0 ? l : ""));
}

/** A bar chart of one series with a negative value colours each bar by its sign (gain or loss) instead of by its series. */
export function bySign(data: Row[], fields: string[], stacked: boolean): boolean {
  return !stacked && fields.length === 1 && data.some((r) => +(r[fields[0]!] as number) < 0);
}

/** The heights of the grey bars a chart shows while it loads, as shares of the plot's height: uneven, so it reads as a chart and not a stamp. */
export const LOADING_BARS: readonly number[] = [0.45, 0.7, 0.55, 0.85, 0.6, 0.75];

/** A ready-made chart draws in once over this long (ms), then tweens to new values; on the web its tooltip glides between points over `CHART_GLIDE`. One curve for both: the kit's `ease.out`. */
export const CHART_DRAW = 600;
export const CHART_GLIDE = 150;

/** The share of its colour a bar keeps while another category is hovered (web) or pressed (phone): the rest of the chart steps back. */
export const DIMMED = 0.38;
