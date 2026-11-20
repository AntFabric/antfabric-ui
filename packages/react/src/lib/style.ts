import type { CSSProperties } from "react";
import { MOTION, type EnterMotion } from "@antfabric-ui/core";
import { t } from "../tokens";

/**
 * The layout every component is drawn in: a flex column that may shrink, like a React Native view,
 * so one design reads the same in both kits.
 */
export const box: CSSProperties = { display: "flex", flexDirection: "column", boxSizing: "border-box", minWidth: 0, position: "relative" };

/** A row of the same. */
export const row: CSSProperties = { ...box, flexDirection: "row", alignItems: "center" };

/**
 * A <button> with the browser's look taken off, laid out like `box`. Borders and fonts are reset
 * with longhands: React warns when a state changes `borderColor` under a `border` shorthand.
 */
export const pressable: CSSProperties = {
  ...box,
  appearance: "none",
  borderWidth: 0,
  borderStyle: "solid",
  borderColor: "transparent",
  background: "none",
  margin: 0,
  padding: 0,
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  fontStyle: "inherit",
  lineHeight: "inherit",
  color: "inherit",
  textAlign: "inherit",
  textDecoration: "none",
  cursor: "pointer",
};

/** Hidden from sight, read by screen readers: a live-region message with no visible text. A convention (a 1px clipped box), not a design size. */
export const visuallyHidden: CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };

export const text: CSSProperties = { display: "block", boxSizing: "border-box", margin: 0, minWidth: 0, overflowWrap: "anywhere" };

/** An <input> or <textarea> with no chrome of its own; the component draws the field. */
export const input: CSSProperties = {
  appearance: "none",
  borderWidth: 0,
  borderStyle: "solid",
  borderColor: "transparent",
  background: "transparent",
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  fontStyle: "inherit",
  lineHeight: "inherit",
  color: "inherit",
  margin: 0,
  padding: 0,
  minWidth: 0,
  outline: "none",
  boxSizing: "border-box",
  resize: "none",
};

/** One line with an ellipsis, or `lines` lines clamped. */
export function truncate(lines = 1): CSSProperties {
  if (lines <= 1) return { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 };
  return { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden" };
}

/**
 * macOS 26's Liquid Glass, approximated for a webview: translucent fill, blur and saturation, and a
 * specular edge. `clear` is the lighter material over media.
 */
export function glass(kind: "glass" | "glass-clear" = "glass"): CSSProperties {
  const filter = `blur(${t.glass.blur}) saturate(${t.glass.saturate})`;
  return {
    background: kind === "glass-clear" ? t.glass.clear : t.glass.bg,
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    boxShadow: t.shadow.glass,
    borderColor: "transparent",
  };
}

/** How an element arrives, as an animation over the kit's `af-in-*` keyframes. */
export function enter(name?: EnterMotion | false | null): CSSProperties {
  if (!name) return {};
  const m = MOTION[name];
  return {
    animation: `af-in-${name} ${m.duration}ms ${m.easing} both`,
    transformOrigin: name === "grow-x" ? "left center" : name === "pop" ? "top center" : undefined,
  };
}

/** A token held outward: `neg(t.space.xs)` is `calc(-1 * var(--af-space-xs))`, the React kit's `-t.space.xs` (a CSS variable cannot be negated with a minus). */
export const neg = (value: string): string => `calc(-1 * ${value})`;

/** Joins style objects, skipping the falsy ones: `css(base, hovered && hover, style)`. */
export function css(...parts: (CSSProperties | false | null | undefined)[]): CSSProperties {
  return Object.assign({}, ...parts.filter(Boolean));
}

/** The value of a four-sided shorthand (`padding`, `margin`: top right bottom left) with its left and right swapped. */
function swapSides(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const p = v.trim().split(/\s+(?![^(]*\))/);
  return p.length === 4 ? [p[0], p[3], p[2], p[1]].join(" ") : v;
}

/** `border-radius`'s four corners (top-left top-right bottom-right bottom-left) mirrored. */
function swapCorners(v: unknown): unknown {
  if (typeof v !== "string" || v.includes("/")) return v;
  const p = v.trim().split(/\s+(?![^(]*\))/);
  if (p.length === 2) return v;
  if (p.length === 3) return [p[1], p[0], p[1], p[2]].join(" ");
  return p.length === 4 ? [p[1], p[0], p[3], p[2]].join(" ") : v;
}

/**
 * A style for a right-to-left tree: left and right swapped in every key that names a side or a corner (`paddingLeft`, `left`,
 * `borderTopLeftRadius`, `marginRight`), in four-value `padding`, `margin` and `borderRadius`, and in `textAlign` and
 * `transformOrigin`. The kit draws with physical sides, so a left-to-right tree is drawn exactly as before; a component with sides of its
 * own passes its style through this when `useDirection()` is `"rtl"`. Recipes are mirrored by `useRecipe` already.
 *
 *   const dir = useDirection();
 *   <div style={rtl(css(row, { paddingLeft: t.space.md }), dir)} />
 */
export function mirror(style: CSSProperties): CSSProperties {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(style)) {
    const key = k === "left" ? "right" : k === "right" ? "left" : k.replace(/Left|Right/, (m) => (m === "Left" ? "Right" : "Left"));
    let value: unknown = v;
    if (k === "padding" || k === "margin" || k === "inset") value = swapSides(v);
    else if (k === "borderRadius") value = swapCorners(v);
    else if ((k === "textAlign" || k === "float") && (v === "left" || v === "right")) value = v === "left" ? "right" : "left";
    else if (k === "transformOrigin" && typeof v === "string") value = v.replace(/\b(left|right)\b/g, (m) => (m === "left" ? "right" : "left"));
    out[key] = value;
  }
  return out as CSSProperties;
}

/** `mirror(style)` in a right-to-left tree, the style itself otherwise. */
export function rtl(style: CSSProperties, dir: "ltr" | "rtl"): CSSProperties {
  return dir === "rtl" ? mirror(style) : style;
}
