/**
 * What `pnpm check` hashes a render by, shared by the server renders (check.tsx) and the mounted ones (rerender.tsx), in both themes it draws
 * every render in (`antfabric` and `neutral`): a render's markup with every `var(--af-…)` replaced by the value it has on that platform,
 * scheme, OS and theme (a theme's own attribute and sheet are left out, their values are in the hash), `calc()` over px evaluated, generated ids folded, and each
 * element's styling reduced to the declarations a browser would compute (so the order of a style, `border` against its longhands and a React
 * Native Web class against inline style are the same). Two renders that draw the same pixels give the same string.
 */
import { StyleSheet } from "react-native";
import { tokenValues, type OS, type Platform, type Theme } from "@antfabric/ui-core";
import { foldIds } from "./ids";

const tokenTables = new Map<string, Record<string, string>>();
export const unknownVars = new Set<string>();
const escapeHtml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

/** `var(--af-a)` and `var(--af-a, var(--af-b))` become the values a browser would use (HTML-escaped as React wrote them); `calc()` text around them stays. */
function resolveVars(html: string, vars: Record<string, string>, depth = 0): string {
  let out = "";
  let at = 0;
  for (let i = html.indexOf("var(", at); i !== -1; i = html.indexOf("var(", at)) {
    let level = 1;
    let j = i + 4;
    for (; j < html.length && level; j++) level += html[j] === "(" ? 1 : html[j] === ")" ? -1 : 0;
    if (level) break; // unbalanced: not CSS, leave the rest
    const inner = html.slice(i + 4, j - 1);
    const comma = (() => {
      let d = 0;
      for (let k = 0; k < inner.length; k++) {
        if (inner[k] === "(") d++;
        else if (inner[k] === ")") d--;
        else if (inner[k] === "," && !d) return k;
      }
      return -1;
    })();
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma === -1 ? undefined : resolveVars(inner.slice(comma + 1), vars, depth + 1);
    out += html.slice(at, i);
    if (!name.startsWith("--af-")) out += `var(${comma === -1 ? inner : `${inner.slice(0, comma)},${fallback}`})`;
    else if (name in vars) out += depth > 8 ? vars[name]! : resolveVars(escapeHtml(vars[name]!), vars, depth + 1);
    else {
      unknownVars.add(name);
      out += `var(${name}${fallback === undefined ? "" : `,${fallback}`})`;
    }
    at = j;
  }
  return out + html.slice(at);
}

/**
 * `calc()` over plain px terms and numbers, evaluated after the variables are in: `calc(-1 * 4px)` is `-4px`, `calc(4px + 2px)` is
 * `6px`, `calc(2 * 4px)` is `8px`. Only + - * / of px or unitless terms; a `calc()` with a percentage, `var()` left over or any other unit stays as text.
 * A negative inset written as `calc(-1 * ${t.space.xs})` then hashes the same as the literal `-6px` it replaced.
 */
function evalCalc(html: string): string {
  const unit = String.raw`-?(?:\d+\.?\d*|\.\d+)(?:px)?`;
  const flat = new RegExp(`calc\\(\\s*${unit}(?:\\s*[-+*/]\\s*${unit})*\\s*\\)`, "g");
  const calc = (expr: string): string | null => {
    // Terms and operators alternate, each separated by whitespace (`-1 * 4px`): a `-` with no space after it is a sign.
    const parts = expr.trim().split(/\s+/);
    if (parts.length % 2 === 0) return null;
    type V = { n: number; px: boolean };
    const val = (s: string): V => ({ n: Number.parseFloat(s), px: s.endsWith("px") });
    const stack: V[] = [val(parts[0]!)];
    const ops: string[] = [];
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i]!;
      const next = val(parts[i + 1]!);
      if (op === "*" || op === "/") {
        const a = stack.pop()!;
        if (a.px && next.px) return null;
        stack.push({ n: op === "*" ? a.n * next.n : a.n / next.n, px: a.px || next.px });
      } else {
        stack.push(next);
        ops.push(op);
      }
    }
    let acc = stack[0]!;
    for (let i = 0; i < ops.length; i++) {
      const b = stack[i + 1]!;
      if (acc.px !== b.px) return null;
      acc = { n: ops[i] === "+" ? acc.n + b.n : acc.n - b.n, px: acc.px };
    }
    const n = Math.round(acc.n * 1e4) / 1e4;
    return `${n}${acc.px ? "px" : ""}`;
  };
  return html.replace(flat, (m) => calc(m.slice(5, -1)) ?? m);
}

/** `data-af-part="root"` (React) and `data-testid="button.root"` (React Native Web) name a recipe's part: instrumentation, not drawing, so they are not hashed. */
/**
 * Numbers with more than three decimals, to three. A chart library computes a curve's control points with `Math.atan2`, `cos` and `sin`,
 * whose last binary digit differs between processors (Apple Silicon here, the Intel CI runner there), and the SVG keeps all seventeen
 * digits, so the same chart hashed differently on the two (`line-chart/mobile@mounted`, 6 November 2026). A thousandth of a pixel is below
 * anything drawn. A value that should be 0 can come out as `-6.2e-15`, so exponent forms are numbers too (to 0). The rewrite only has
 * to give the same string on every machine (it also turns `#a1e2bc`'s `1e2` into `100`, the same everywhere). Only the mounted hashes of data components go through this: the frozen keys' strings are left exactly as they were.
 */
export const roundCoords = (html: string) =>
  html.replace(/-?\d+(?:\.\d+)?e[-+]?\d+|-?\d+\.\d{4,}/gi, (n) => String(Number(Number(n).toFixed(3)) || 0));

export const PART_MARKS = / data-af-part="[^"]*"| data-testid="[a-z][a-z0-9-]*\.[A-Za-z0-9]+"/g;

/** React Native Web's atomic classes (`.r-height-1ugchlj{height:44px;}`) from the sheet it has built so far, with their place in the sheet (a later rule wins), to read a class back as its declarations. */
const classRules = new Map<string, { at: number; decls: string[] }>();
let sheetLength = -1;
function loadClassRules() {
  // `getSheet` is React Native Web's, which is what `react-native` is here (scripts/native.mjs); React Native's own types do not have it.
  const css = (StyleSheet as unknown as { getSheet(): { textContent: string } }).getSheet().textContent;
  if (css.length === sheetLength) return;
  sheetLength = css.length;
  classRules.clear(); // the sheet inserts rules by group, so an earlier position can shift
  let at = 0;
  for (const m of css.matchAll(/\.(r-[\w-]+)\s*\{([^}]*)\}/g)) classRules.set(m[1]!, { at: at++, decls: m[2]!.split(";").map((d) => d.trim()).filter(Boolean) });
}

/** Splits a value on spaces outside parentheses and quotes: `1px solid rgba(0, 0, 0, 0.5)` is three words. */
function words(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = "";
  let cur = "";
  for (const ch of value.trim()) {
    if (quote) { cur += ch; if (ch === quote) quote = ""; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (/\s/.test(ch) && depth === 0) { if (cur) out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/** CSS's one-to-four value box (`padding: 4px 8px`) as top, right, bottom, left. */
function box(value: string): [string, string, string, string] | null {
  const w = words(value);
  if (w.length < 1 || w.length > 4) return null;
  const [t, r = t!, b = t!, l = r] = w;
  return [t!, r, b, l];
}

const SIDES = ["top", "right", "bottom", "left"] as const;
const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"] as const;
const BORDER_STYLES = new Set(["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"]);
const WIDTH_WORD = /^(?:[+-]?\d*\.?\d+(?:[a-z%]+)?|thin|medium|thick|calc\(.*\))$/i;

/** `1px solid #ccc` (any order, any of the three) as width, style, colour; what the shorthand does not name goes back to its initial value, as in a browser. */
function borderParts(value: string): [string, string, string] | null {
  let width = "medium";
  let style = "none";
  let color = "currentcolor";
  for (const w of words(value)) {
    if (BORDER_STYLES.has(w)) style = w;
    else if (WIDTH_WORD.test(w)) width = w;
    else color = w;
  }
  return words(value).length ? [width, style, color] : null;
}

/** One declaration as the longhands a browser would set from it, or itself when it is one already. */
function expand(prop: string, value: string): [string, string][] {
  const four = (prefix: string, suffix: string, v: string): [string, string][] | null => {
    const b = box(v);
    return b ? SIDES.map((side, i) => [`${prefix}-${side}${suffix}`, b[i]!] as [string, string]) : null;
  };
  switch (prop) {
    case "padding": case "margin":
      return four(prop, "", value) ?? [[prop, value]];
    case "inset":
      return four("", "", value)?.map(([k, v]) => [k.slice(1), v] as [string, string]) ?? [[prop, value]];
    case "border-width": return four("border", "-width", value) ?? [[prop, value]];
    case "border-style": return four("border", "-style", value) ?? [[prop, value]];
    case "border-color": return four("border", "-color", value) ?? [[prop, value]];
    case "padding-inline": case "padding-block": case "margin-inline": case "margin-block": {
      const [base, axis] = prop.split("-") as [string, "inline" | "block"];
      const w = words(value);
      const [a, b = a] = w;
      return w.length && w.length <= 2 ? [[`${base}-${axis}-start`, a!], [`${base}-${axis}-end`, b!]] : [[prop, value]];
    }
    case "border-radius": {
      if (value.includes("/")) return [[prop, value]];
      const b = box(value);
      return b ? CORNERS.map((c, i) => [`border-${c}-radius`, b[i]!] as [string, string]) : [[prop, value]];
    }
    case "border": case "border-top": case "border-right": case "border-bottom": case "border-left": {
      const parts = borderParts(value);
      if (!parts) return [[prop, value]];
      const sides = prop === "border" ? SIDES : [prop.slice(7) as (typeof SIDES)[number]];
      return sides.flatMap((side) => [[`border-${side}-width`, parts[0]], [`border-${side}-style`, parts[1]], [`border-${side}-color`, parts[2]]] as [string, string][]);
    }
    case "outline": {
      const parts = borderParts(value);
      return parts ? [["outline-width", parts[0]], ["outline-style", parts[1]], ["outline-color", parts[2]]] : [[prop, value]];
    }
    case "gap": {
      const [row, column = row] = words(value);
      return row ? [["row-gap", row], ["column-gap", column!]] : [[prop, value]];
    }
    case "flex": {
      const w = words(value);
      if (value === "none") return [["flex-grow", "0"], ["flex-shrink", "0"], ["flex-basis", "auto"]];
      if (value === "auto") return [["flex-grow", "1"], ["flex-shrink", "1"], ["flex-basis", "auto"]];
      if (!w.length || w.length > 3 || !/^[\d.]+$/.test(w[0]!)) return [[prop, value]];
      const basis = w.length === 3 ? w[2]! : w.length === 2 && !/^[\d.]+$/.test(w[1]!) ? w[1]! : "0%";
      const shrink = w.length >= 2 && /^[\d.]+$/.test(w[1]!) ? w[1]! : "1";
      return [["flex-grow", w[0]!], ["flex-shrink", shrink], ["flex-basis", basis]];
    }
    default:
      return [[prop, value]];
  }
}

/** A bare `0` is `0px` wherever a length is meant, so `padding: 0` and `padding-top: 0px` compare equal. */
const LENGTH_PROP = /^(?:padding|margin|border-.*(?:width|radius)|top|right|bottom|left|gap|row-gap|column-gap|width|height|min-.*|max-.*|outline-(?:width|offset)|flex-basis)/;
function declaration(raw: string): [string, string][] {
  const i = raw.indexOf(":");
  if (i < 0) return [];
  const prop = raw.slice(0, i).trim().toLowerCase();
  const value = raw.slice(i + 1).replace(/\s*!important\s*$/i, "").trim();
  return expand(prop, value).map(([k, v]) => [k, LENGTH_PROP.test(k) && v === "0" ? "0px" : v]);
}

/**
 * The same markup with every element's styling as a browser computes it: its React Native Web classes (in sheet order) then
 * its inline declarations (in source order, which wins over any class) are applied one after another, each shorthand
 * (`padding`, `margin`, `border`, `border-top`, `border-radius`, `inset`, `outline`, `gap`, `flex`) first expanded to its
 * longhands, so a later declaration replaces an earlier one and a shorthand over a longhand leaves no dead value behind.
 * The result is the longhands, sorted; the other classes are sorted; the attributes are sorted. Two renders that differ only
 * in how a style was written (order, shorthand against longhands, a StyleSheet class against inline) are equal. Their text
 * and nesting are untouched.
 */
export function canonical(html: string): string {
  loadClassRules();
  return html.replace(/<([a-zA-Z][\w-]*)((?:\s[^<>]*)?)>/g, (_, tag: string, attrs: string) => {
    const found = [...attrs.matchAll(/\s([\w:-]+)(?:="([^"]*)")?/g)].map((a) => [a[1]!, a[2]] as const);
    const fromClasses: { at: number; decls: string[] }[] = [];
    const inline: string[] = [];
    const classes: string[] = [];
    const rest: string[] = [];
    for (const [name, value] of found) {
      if (name === "style") inline.push(...(value ?? "").split(";").map((d) => d.trim()).filter(Boolean));
      else if (name === "class") {
        for (const c of (value ?? "").split(/\s+/).filter(Boolean)) {
          const rule = classRules.get(c);
          if (rule) fromClasses.push(rule);
          else classes.push(c);
        }
      } else rest.push(value === undefined ? name : `${name}="${value}"`);
    }
    const computed = new Map<string, string>();
    const ordered = [...fromClasses.sort((a, b) => a.at - b.at).flatMap((r) => r.decls), ...inline];
    for (const raw of ordered) for (const [k, v] of declaration(raw)) computed.set(k, v);
    const style = [...computed].map(([k, v]) => `${k}:${v}`).sort().join(";");
    return `<${tag} ${[...rest].sort().join(" ")} class="${classes.sort().join(" ")}" style="${style}">`;
  });
}

/** The theme sheet React hoists next to a themed web root (`<style data-href="antfabric-ui-<id>" data-precedence="low">…</style>`): it declares the theme, the render draws it, so the hash is over the values it resolves to, not the sheet. */
const THEME_SHEET = /<style\b[^>]*data-href="antfabric-ui-[^"]*"[^>]*>[\s\S]*?<\/style>/g;
/** The attribute that scopes a theme's sheet: identification, not drawing (the theme's name and hash are in it). */
const THEME_MARK = / data-af-theme-id="[^"]*"/g;

/** What a render was drawn in, when it was in a theme: the values the hash resolves each variable to are that theme's, on that OS. */
export interface DrawnIn {
  /** The OS the root drew, so the OS's token set lands as the browser applies it. */
  os?: OS;
  theme?: Theme;
}

/**
 * The markup `html` as it is hashed: part marks dropped, a theme's attribute and sheet dropped, generated ids folded, variables resolved for
 * `platform`, `scheme` and the theme the render was drawn in, then canonical.
 *
 * With no theme, or the empty one (`antfabric`), the table is the profile's and the scheme's, as it was when the first keys were taken (it does
 * not look at the OS, so those hashes stay exactly what they were). A theme with overrides resolves through `tokenValues(platform, scheme, os, theme)`.
 */
export function normalise(html: string, platform: Platform, scheme: "light" | "dark", drawnIn?: DrawnIn): string {
  // The React Native kit writes values, not variables: its table is simply never used.
  const theme = drawnIn?.theme?.id ? drawnIn.theme : undefined;
  const tableKey = `${platform}/${scheme}${theme ? `/${theme.id}/${drawnIn?.os ?? ""}` : ""}`;
  if (!tokenTables.has(tableKey)) tokenTables.set(tableKey, tokenValues(platform, scheme, theme ? drawnIn?.os : undefined, theme));
  const bare = html.replace(PART_MARKS, "").replace(THEME_SHEET, "").replace(THEME_MARK, "");
  return canonical(evalCalc(resolveVars(foldIds(bare), tokenTables.get(tableKey)!)));
}
