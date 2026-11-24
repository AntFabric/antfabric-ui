/**
 * react-native-svg in the browser and in Node: each element as the DOM's own, the way lucide-react-native is lucide-react
 * here. Every element the phone kit and react-native-gifted-charts draw with is mapped (Svg, G, Rect, Circle, Line, Path,
 * Polygon, Text, TSpan, Defs, LinearGradient, RadialGradient, Stop, ClipPath, Pattern, Mask, Use, ForeignObject), with the props a
 * browser does not know turned into ones it does: `testID` is `data-testid`, as React Native Web writes it, so a recipe part
 * drawn this way is found; `onPress` / `onPressIn` / `onPressOut` are pointer events; `translateX` / `translateY` (and `x` /
 * `y` on a `G`) are a `transform`; `collapsable` (which React Native's `Animated` puts on what it wraps: gifted-charts' radar animates a Polygon) is dropped.
 *
 * Why not react-native-svg's own web build: its ESM is extensionless and needs React Native Web's private `createElement`,
 * which Node cannot load under the check scripts, and it writes different attributes, so the existing icons' hashes in
 * `reports/renders.snapshot.json` would move. One stub serves the server render, the re-render pass and the browser, so
 * there is one copy, and a chart's SVG is the same elements in all three.
 */
import { createElement, type ComponentType, type CSSProperties, type ReactNode } from "react";

type Style = CSSProperties | readonly (CSSProperties | null | undefined | false)[] | null;
type Props = Record<string, unknown> & { style?: Style; children?: ReactNode; testID?: string };

const flatten = (style: Style | undefined): CSSProperties => (Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : { ...(style as CSSProperties | null) });

/** The DOM element's props for a react-native-svg element's. */
function dom({ testID, style, onPress, onPressIn, onPressOut, translateX, translateY, collapsable: _collapsable, ...rest }: Props, group = false) {
  const out: Record<string, unknown> = { ...rest };
  if (testID != null) out["data-testid"] = testID;
  if (onPress) out.onClick = () => (onPress as () => void)();
  if (onPressIn) out.onPointerDown = () => (onPressIn as () => void)();
  if (onPressOut) out.onPointerUp = () => (onPressOut as () => void)();
  if (group) {
    const x = Number(translateX ?? out.x ?? 0), y = Number(translateY ?? out.y ?? 0);
    delete out.x;
    delete out.y;
    if (x || y) out.transform = `translate(${x} ${y})`;
  }
  const flat = flatten(style);
  if (Object.keys(flat).length) out.style = flat;
  return out;
}

const element = (tag: string, group = false): ComponentType<Props> =>
  function SvgElement({ children, ...props }: Props) {
    return createElement(tag, dom(props, group), children);
  };

/**
 * The root: block, so it does not sit on a text baseline, and hidden from screen readers (the component that draws it labels itself). It never
 * shrinks (`flexShrink: 0`): gifted-charts draws a half ring (GaugeChart) as a whole square svg inside a view half as tall that crops it
 * (`overflow: hidden`). A flex column shrinks its children, and react-native-web's own svg would be scaled into the half; this one keeps its
 * size, so the view crops it as it does on a device. Nothing in the kits is bent for it.
 */
export function Svg({ children, ...props }: Props) {
  const out = dom(props);
  out.style = { display: "block", flexShrink: 0, ...(out.style as CSSProperties | undefined) };
  return createElement("svg", { ...out, "aria-hidden": true }, children);
}

export default Svg;
export const G = element("g", true);
export const Path = element("path");
export const Rect = element("rect");
export const Circle = element("circle");
export const Line = element("line");
export const Polygon = element("polygon");
export const Polyline = element("polyline");
export const Text = element("text");
export const TSpan = element("tspan");
export const Defs = element("defs");
export const LinearGradient = element("linearGradient");
export const RadialGradient = element("radialGradient");
export const Stop = element("stop");
export const ClipPath = element("clipPath");
export const Pattern = element("pattern");
export const Mask = element("mask");
export const Use = element("use");
export const ForeignObject = element("foreignObject");
