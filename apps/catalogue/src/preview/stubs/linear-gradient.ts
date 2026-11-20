/**
 * expo-linear-gradient and react-native-linear-gradient in the browser: gifted-charts reads one of the two at import and throws
 * without it. A <div> with the CSS gradient, which is what react-native-web would draw; the data components use flat fills, so
 * it only draws where an app passes a gradient of its own.
 */
import { createElement, type CSSProperties, type ReactNode } from "react";

interface LinearGradientProps {
  colors: readonly string[];
  start?: { x: number; y: number } | null;
  end?: { x: number; y: number } | null;
  style?: CSSProperties | CSSProperties[];
  children?: ReactNode;
}

export function LinearGradient({ colors, start, end, style, children }: LinearGradientProps) {
  const dx = (end?.x ?? 0) - (start?.x ?? 0);
  const dy = (end?.y ?? 1) - (start?.y ?? 0);
  const angle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI + 90);
  return createElement("div", { style: { display: "flex", ...[style].flat().reduce((a, b) => ({ ...a, ...b }), {}), background: `linear-gradient(${angle}deg, ${colors.join(", ")})` } }, children);
}

export default LinearGradient;
