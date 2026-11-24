/**
 * The empty state's six drawings as data, read by both kits: a 160 × 116 canvas of near-white objects with a hairline edge and one
 * faint accent. This is artwork, not layout: its numbers are positions and radii on that canvas, so they live here and not in a
 * component file. Colours are not here; each kit paints a part with its own tokens (`color.background.card`, `color.border.subtle`, `color.text.faint`…).
 */

export type ArtKind = "messages" | "tasks" | "notifications" | "mail" | "files" | "projects";

export type ArtPart = "frame" | "card" | "inset" | "dot" | "bar" | "barStrong" | "barOnAccent" | "face" | "bubble" | "tick" | "box" | "accentDot" | "lineDot" | "rule" | "edge" | "fold" | "tag";

export interface ArtShape {
  p: ArtPart;
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** Stretch to the parent's right edge instead of a width. */
  r?: number;
  radius?: number;
  opacity?: number;
  /** Degrees, then a translate in canvas units: the sheets fanned behind the file. */
  rotate?: number;
  tx?: number;
  ty?: number;
  c?: ArtShape[];
}

/** The drawing's canvas. */
export const ART_CANVAS = { w: 160, h: 116 } as const;

/** The geometry a part carries by itself: its corner radius, the dot's side, the fold's legs. */
export const ART_PART = {
  frame: { radius: 7 },
  card: { radius: 7 },
  bubble: { radius: 7 },
  dot: { size: 3.2 },
  tick: { radius: 2.5 },
  box: { radius: 2.5 },
  edge: { radius: 1.5 },
  tag: { radius: 4.5 },
  /** The page-corner fold: a right triangle with these legs. */
  fold: { leg: 16 },
} as const;

const bar = (x: number, y: number, w: number, p: ArtPart = "bar", h = 4): ArtShape => ({ p, x, y, w, h, radius: h / 2 });
const sq = (p: ArtPart, x: number, y: number, side: number): ArtShape => ({ p, x, y, w: side, h: side });
const dots: ArtShape[] = [{ p: "dot", x: 6.4, y: 5.4 }, { p: "dot", x: 11.9, y: 5.4 }, { p: "dot", x: 17.4, y: 5.4 }];
/** A window: a recessed title strip with three dots, then its rows. */
const win = (rows: ArtShape[]): ArtShape[] => [{ p: "frame", x: 22, y: 16, w: 116, h: 84, c: [{ p: "inset", x: 0, y: 0, h: 13, r: 0 }, ...dots, ...rows] }];
const task = (y: number, w: number, done = false): ArtShape[] => [sq(done ? "tick" : "box", 12, y, 9), bar(28, y + 1.5, w), sq("face", 98, y, 8)];

export const ART: Record<ArtKind, ArtShape[]> = {
  messages: [
    sq("face", 16, 26, 16),
    { p: "card", x: 33, y: 20, w: 88, h: 34, c: [bar(14, 9, 56), bar(14, 19, 36)] },
    sq("face", 128, 78, 16),
    { p: "bubble", x: 46, y: 68, w: 74, h: 28, c: [bar(14, 9, 44, "barOnAccent")] },
  ],
  tasks: win([...task(14, 52, true), ...task(30, 56), ...task(46, 50), ...task(62, 44)]),
  notifications: win([
    sq("accentDot", 10.5, 18.5, 7),
    bar(26, 18, 62, "barStrong"),
    bar(26, 27, 34),
    { p: "rule", x: 8, y: 36, w: 100, h: 1 },
    sq("lineDot", 10.5, 41.5, 7),
    bar(26, 41, 52),
    bar(26, 50, 30),
    { p: "rule", x: 8, y: 59, w: 100, h: 1 },
    sq("lineDot", 10.5, 64.5, 7),
    bar(26, 64, 42),
    bar(26, 73, 26),
  ]),
  mail: win([
    { p: "edge", x: -1, y: 14, w: 3, h: 20 },
    sq("face", 11, 17, 14),
    bar(32, 19, 44, "barStrong"),
    bar(32, 28, 66),
    { p: "rule", x: 8, y: 36, w: 100, h: 1 },
    sq("face", 11, 40, 14),
    bar(32, 42, 38),
    bar(32, 51, 58),
    { p: "rule", x: 8, y: 59, w: 100, h: 1 },
    sq("face", 11, 63, 14),
    bar(32, 65, 38),
    bar(32, 74, 50),
  ]),
  files: [
    { p: "card", x: 52, y: 22, w: 46, h: 66, radius: 6, opacity: 0.65, rotate: -15, tx: -19, ty: 6 },
    { p: "card", x: 52, y: 22, w: 46, h: 66, radius: 6, opacity: 0.8, rotate: 15, tx: 19, ty: 6 },
    { p: "card", x: 51, y: 18, w: 48, h: 70, radius: 6, c: [sq("fold", 32, -1, 16), bar(10, 28, 30), bar(10, 38, 22), bar(10, 48, 26)] },
  ],
  projects: [
    { p: "card", x: 26, y: 14, w: 96, h: 60, radius: 8, opacity: 0.55 },
    {
      p: "card",
      x: 34,
      y: 26,
      w: 96,
      h: 66,
      radius: 8,
      c: [bar(11, 13, 38, "barStrong", 5), { p: "tag", x: 63, y: 11, w: 20, h: 9 }, bar(11, 28, 60), bar(11, 38, 40), sq("face", 10, 48, 10), sq("face", 18, 48, 10), sq("face", 26, 48, 10)],
    },
  ],
};

/**
 * The update banner's glyph: a 34 × 34 window with an arrow badge on its corner. Artwork, as above: positions on that canvas, in px.
 * The window's rows are two bars of different length; the badge is a disc with an up arrow and a ring in the surface colour.
 */
export const ART_UPDATE = {
  size: 34,
  window: { left: 3, top: 8, w: 23, h: 19, gap: 2.6, padTop: 5, padLeft: 4, radius: 5.5 },
  bar: { h: 2.4, radius: 1.2, long: 11.5, short: 7 },
  badge: { left: 19.5, top: 2.5, size: 13, arrow: 9, stroke: 3 },
} as const;
