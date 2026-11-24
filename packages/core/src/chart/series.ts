/** Which series a chart is showing: the state its legend toggles, the same on both kits, and the colours a series is drawn in. */

import { useControllable } from "../state";

/** An area is its series colour at one opacity, never a gradient: two filled areas over each other mix into a colour neither series has. */
export const FLAT_FILL = 0.2;

/** The bars before the latest one in a SparkBars, as their colour at this opacity: the latest period reads as the number beside it. */
export const EARLIER_BARS = 0.45;

/** The eight categorical series colours, in order, from the resolved tokens of either kit. A ninth series folds into "Other" rather than wrapping the palette. */
export const seriesColors = ({ chart: c }: { chart: Record<`series${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}Color`, string> }): string[] => [c.series1Color, c.series2Color, c.series3Color, c.series4Color, c.series5Color, c.series6Color, c.series7Color, c.series8Color];

export interface Series {
  /** Every series, in order. */
  fields: string[];
  /** The ones the legend has turned off. */
  hidden: ReadonlySet<string>;
  /** The ones showing, in order. */
  visible: string[];
  /** A series' colour: its place in the palette, wrapping after eight. */
  colorOf: (field: string) => string;
  /** Turns a series off, or on again. The last one showing cannot be turned off. */
  toggle: (field: string) => void;
}

/** The legend's state as a prop and its event: the series that are off, and the call when a press changes them. */
export interface SeriesState {
  /** The series turned off. Left out, the chart keeps its own state, starting with every series on. */
  hidden?: readonly string[];
  /** Called with every series that is off after a press. The last series showing cannot be turned off, so that press says nothing. */
  onHiddenChange?: (hidden: string[]) => void;
}

/** `colors` is the palette (`chart.series1Color`…`series8`), read by the kit from its tokens. */
export function useSeries(fields: string[], colors: readonly string[], { hidden: given, onHiddenChange }: SeriesState = {}): Series {
  const [list, setList] = useControllable(given as string[] | undefined, onHiddenChange);
  const off = new Set(list ?? []);
  // A list that turns every series off would leave nothing to draw: it shows them all.
  const visible = fields.filter((f) => !off.has(f));
  const hidden: ReadonlySet<string> = visible.length ? off : new Set();
  const toggle = (field: string) => {
    if (!hidden.has(field) && visible.length < 2) return;
    const next = new Set(hidden);
    if (next.has(field)) next.delete(field);
    else next.add(field);
    setList(fields.filter((f) => next.has(f)));
  };
  return { fields, hidden, visible: visible.length ? visible : fields, colorOf: (field) => colors[fields.indexOf(field) % colors.length]!, toggle };
}

/** A colour at an opacity: `withAlpha("#86b7f6", 0.45)` is `rgba(134, 183, 246, 0.45)`. What a library takes where it has no `fillOpacity`; a colour that is not `#rrggbb` is returned as it is. */
export function withAlpha(color: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return color;
  const n = parseInt(m[1]!, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** The narrowest a SparkBars bar is drawn (px, points): past this many periods the gaps give way before the bars do. */
export const MIN_SPARK_BAR = 2;

/**
 * Where a row of `count` bars in `width` sits: the bar and the gap between bars. The gap is `gap` until keeping it would make the bars
 * narrower than `MIN_SPARK_BAR`, and then it closes up (30 bars in 96px are 2px with a 1.2px gap, not slivers with a 3px one).
 */
export function barLayout(width: number, count: number, gap: number): { gap: number; barWidth: number } {
  if (count < 2) return { gap: 0, barWidth: width };
  const room = Math.max(0, Math.min(gap, (width - MIN_SPARK_BAR * count) / (count - 1)));
  return { gap: room, barWidth: (width - room * (count - 1)) / count };
}

/** A marker's shape, drawn at the points of a series and in the legend's key. */
export type MarkShape = "circle" | "square" | "triangle" | "diamond" | "cross";

/** A bar's texture over its fill: none, lines rising at 45°, lines falling at 135°, both, or dots. Diagonals only: a level or upright line would read as a rule or a bar's edge. */
export type MarkTexture = "none" | "rising" | "falling" | "cross" | "dots";

/**
 * What tells one series from another besides its hue (WCAG 1.4.1): its dash pattern (a line's dash and gap lengths, as multiples of the
 * line's width; none is solid) and the shape of its marker. The first series stays a plain solid line with a round marker; the order is
 * the palette's, so a series is the same in the plot and in the legend.
 */
export const SERIES_MARKS: readonly { dash: readonly number[]; shape: MarkShape; texture: MarkTexture }[] = [
  { dash: [], shape: "circle", texture: "none" },
  { dash: [4, 2], shape: "square", texture: "rising" },
  { dash: [1, 2], shape: "triangle", texture: "falling" },
  { dash: [6, 2, 1, 2], shape: "diamond", texture: "cross" },
  { dash: [2, 2], shape: "cross", texture: "dots" },
];

/**
 * A texture's tile (px on the web, points on the phone): one repeat of the pattern, a line's width, a dot's radius, and how strongly it is inked.
 * It is drawn in the card's colour over the series' fill, a lighter step of the fill in a light theme and a darker one in a dark theme, so it is
 * tone on tone and every slot is as loud as the next: the hue still leads, the texture is the second channel.
 */
export const TEXTURE = { tile: 6, stroke: 1.5, dot: 1.25, opacity: 0.55 } as const;

/**
 * One tile of a texture as an SVG path, `size` square, drawn so tiles meet with no seam: lines are stroked (`fill="none"`), dots are filled. Empty for `none`.
 * Both kits draw it in a `<pattern>` (`patternUnits="userSpaceOnUse"`, `size` wide and high) over a bar's fill and in the legend's swatch.
 */
export function texturePath(texture: MarkTexture, size: number = TEXTURE.tile): string {
  const s = size;
  const h = s / 2;
  const rising = `M0 ${s}L${s} 0M${-h} ${h}L${h} ${-h}M${h} ${s + h}L${s + h} ${h}`;
  const falling = `M0 0L${s} ${s}M${-h} ${h}L${h} ${s + h}M${h} ${-h}L${s + h} ${h}`;
  const r = TEXTURE.dot;
  switch (texture) {
    case "rising":
      return rising;
    case "falling":
      return falling;
    case "cross":
      return rising + falling;
    case "dots":
      return `M${h - r} ${h}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
    default:
      return "";
  }
}

/** The marks of the series at `index`, cycling past the table's end. */
export const seriesMark = (index: number) => SERIES_MARKS[index % SERIES_MARKS.length]!;

/** A marker's outline as an SVG path in a box of `size` centred on (`cx`, `cy`): one path for every shape, so both kits draw the same one. A cross is open (stroke it); the rest are closed (fill them). */
export function markPath(shape: MarkShape, cx: number, cy: number, size: number): string {
  const h = size / 2;
  switch (shape) {
    case "square":
      return `M${cx - h} ${cy - h}H${cx + h}V${cy + h}H${cx - h}Z`;
    case "triangle":
      return `M${cx} ${cy - h}L${cx + h} ${cy + h}H${cx - h}Z`;
    case "diamond":
      return `M${cx} ${cy - h}L${cx + h} ${cy}L${cx} ${cy + h}L${cx - h} ${cy}Z`;
    case "cross":
      return `M${cx - h} ${cy - h}L${cx + h} ${cy + h}M${cx + h} ${cy - h}L${cx - h} ${cy + h}`;
    default:
      return `M${cx - h} ${cy}a${h} ${h} 0 1 0 ${size} 0a${h} ${h} 0 1 0 ${-size} 0Z`;
  }
}
