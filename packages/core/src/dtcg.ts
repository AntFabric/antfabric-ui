/**
 * `tokens.ts` as a W3C Design Tokens file (Format Module 2025.10): `packages/core/tokens.json`,
 * written by `pnpm tokens:build`, served by the catalogue as `/tokens.json`, and kept equal to this
 * function's output by `pnpm check`.
 *
 * Import it as `@antfabric/ui-core/dtcg`, not from the package index: it reads `tokens.map.json`, which
 * the kits (one of them bundled by Metro) have no reason to carry.
 *
 * One token per leaf path, groups nested by path (`fg.muted` is `fg` → `muted`).
 * A token is `{ $type, $value, $description, $extensions }`; `$type` moves up to the group when every
 * token in it shares one. `$value` is the light theme's colour or shadow and the desktop profile's size
 * and type (a shared token has one value). A token that varies by mode lists every mode under
 * `$extensions["com.antfabric"].modes`: `{ light, dark }` or `{ web, desktop, mobile }`, plus `android` where the OS set
 * changes it: the mobile mode with Android's overrides (the root's `modes.os` says which profile an OS extends). A token that only
 * some profiles have (the phone's font files) is `$value` of the first it has, with `onlyIn` naming them.
 *
 * The DTCG spec has no percentage, `em` or gradient angle, and no empty shadow. Where a token holds one
 * of those, `$value` is the closest the spec can say (`radius.circle` is 9999px, tracking is a number of
 * em) and `$extensions["com.antfabric"].css` keeps the string the kits use.
 *
 * `$value` is a reference (`"{primitives.color.neutral.900}"`) where `tokens.ts` holds one, for any type, and so is that
 * mode's entry under `modes`. The type of a token comes from its path, not from its value. `varies` and `css` read what a
 * reference resolves to, so two modes that point at different primitives of one value are not different modes.
 *
 * The references point into a `primitives` group at the end of the file: the primitives some token points at (not every
 * one the product has: `primitives.ts` is the whole mirror), each with the `$type` and `$description` the mirror records,
 * the product's own comment where it wrote one, and its CSS variable under `$extensions`.
 */

import { referencedPrimitives } from "./css";
import { primitiveMeta, primitivesFrom } from "./primitives";
import { isReference, primitiveValue, resolveValue } from "./refs";
import { platformOf, tokenSource as tokens } from "./tokens";
import { descriptions, type TokenNote, type TokenPath } from "./descriptions";
import tokenMap from "../tokens.map.json";

type Raw = string | number;
type Tree = { readonly [k: string]: Raw | Tree };
type Mode = "light" | "dark" | "web" | "desktop" | "mobile" | "android";

export type DtcgType = "color" | "dimension" | "duration" | "cubicBezier" | "fontFamily" | "fontWeight" | "number" | "shadow" | "gradient";

/** The key under `$extensions` that holds everything that is ours. */
export const EXTENSION = "com.antfabric";

/** `"{fg.muted}"`: a token's value that points at another token. */
export const REFERENCE = /^\{[A-Za-z0-9_.-]+\}$/;

/* ---------- values ---------- */

const NUM = String.raw`-?(?:\d+\.?\d*|\.\d+)`;
const fail = (path: string, raw: Raw, why: string): never => {
  throw new Error(`tokens.json: ${path} = ${JSON.stringify(raw)}: ${why}`);
};

/** The same value after conversion to DTCG, and whether the DTCG value says less than the original. */
type Converted = { value: unknown; lossy?: true };

const round = (n: number, places = 4) => Math.round(n * 10 ** places) / 10 ** places;

/** Splits on `sep` outside parentheses and quotes. */
function split(text: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = "";
  let cur = "";
  for (const c of text) {
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    if (!quote && depth === 0 && (sep === " " ? /\s/.test(c) : c === sep)) {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  out.push(cur.trim());
  return out.filter(Boolean);
}

function color(raw: string, path: string) {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw);
  const fn = new RegExp(String.raw`^rgba?\(\s*(${NUM})\s*,\s*(${NUM})\s*,\s*(${NUM})\s*(?:,\s*(${NUM})\s*)?\)$`, "i").exec(raw);
  let rgb: number[];
  let alpha = 1;
  if (hex) {
    const h = hex[1]!.length === 3 ? [...hex[1]!].map((c) => c + c).join("") : hex[1]!;
    rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  } else if (fn) {
    rgb = [Number(fn[1]), Number(fn[2]), Number(fn[3])];
    if (fn[4] !== undefined) alpha = Number(fn[4]);
  } else return fail(path, raw, "not a hex or rgb()/rgba() colour");
  if (rgb.some((n) => !(n >= 0 && n <= 255)) || !(alpha >= 0 && alpha <= 1)) fail(path, raw, "channel out of range");
  return {
    colorSpace: "srgb",
    components: rgb.map((n) => round(n / 255)),
    alpha,
    hex: `#${rgb.map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`,
  };
}

function dimension(raw: Raw, path: string): Converted {
  if (typeof raw === "number") return { value: { value: raw, unit: "px" } };
  const m = new RegExp(`^(${NUM})(px|rem)?$`).exec(raw);
  if (m && (m[2] || Number(m[1]) === 0)) return { value: { value: Number(m[1]), unit: m[2] ?? "px" } };
  // The spec has no percentage. A circle is a radius no side can reach, which is what the phone kit already does.
  if ((path === "radius.circle" || path === "primitives.radius.circle") && raw === "50%") return { value: { value: 9999, unit: "px" }, lossy: true };
  return fail(path, raw, "not a px or rem dimension");
}

function number(raw: Raw, path: string): Converted {
  if (typeof raw === "number") return { value: raw };
  const m = new RegExp(`^(${NUM})(em|%)?$`).exec(raw);
  if (!m) return fail(path, raw, "not a number, a number of em or a percentage");
  if (!m[2]) return { value: Number(m[1]) };
  return { value: round(m[2] === "%" ? Number(m[1]) / 100 : Number(m[1]), 6), lossy: true };
}

function duration(raw: Raw, path: string): Converted {
  const m = new RegExp(`^(${NUM})(ms|s)$`).exec(String(raw));
  return m ? { value: { value: Number(m[1]), unit: m[2] } } : fail(path, raw, "not a duration in ms or s");
}

function cubicBezier(raw: Raw, path: string): Converted {
  const m = /^cubic-bezier\((.*)\)$/.exec(String(raw));
  const n = m ? m[1]!.split(",").map((s) => Number(s.trim())) : [];
  if (n.length !== 4 || n.some((x) => !Number.isFinite(x)) || n[0]! < 0 || n[0]! > 1 || n[2]! < 0 || n[2]! > 1) return fail(path, raw, "not a cubic-bezier(x1,y1,x2,y2) with x in 0..1");
  return { value: n };
}

function fontFamily(raw: Raw, path: string): Converted {
  const names = split(String(raw), ",").map((s) => s.replace(/^(["'])(.*)\1$/, "$2"));
  return names.length ? { value: names } : fail(path, raw, "no font family");
}

function fontWeight(raw: Raw, path: string): Converted {
  return typeof raw === "number" && raw >= 1 && raw <= 1000 ? { value: raw } : fail(path, raw, "not a number from 1 to 1000");
}

/** One CSS box-shadow layer: `[inset] x y [blur [spread]] colour`, the colour first or last. */
function shadowLayer(layer: string, path: string, raw: Raw) {
  let inset = false;
  let paint: string | undefined;
  const lengths: string[] = [];
  for (const part of split(layer, " ")) {
    if (part === "inset") inset = true;
    else if (/^(#|rgba?\()/i.test(part)) paint = part;
    else lengths.push(part);
  }
  if (!paint || lengths.length < 2 || lengths.length > 4) return fail(path, raw, `shadow layer "${layer}" is not [inset] x y [blur [spread]] colour`);
  const [x, y, blur = 0, spread = 0] = lengths.map((l) => (dimension(l, path).value as { value: number }).value);
  return {
    color: color(paint, path),
    offsetX: { value: x, unit: "px" },
    offsetY: { value: y, unit: "px" },
    blur: { value: blur, unit: "px" },
    spread: { value: spread, unit: "px" },
    ...(inset ? { inset: true } : {}),
  };
}

function shadow(raw: Raw, path: string): Converted {
  const css = String(raw).trim();
  // The spec has no empty shadow: a layer that draws nothing is the same.
  if (css === "none") return { value: { color: color("rgba(0,0,0,0)", path), offsetX: { value: 0, unit: "px" }, offsetY: { value: 0, unit: "px" }, blur: { value: 0, unit: "px" }, spread: { value: 0, unit: "px" } }, lossy: true };
  const layers = split(css, ",").map((l) => shadowLayer(l, path, raw));
  return { value: layers.length === 1 ? layers[0] : layers };
}

/** `linear-gradient(135deg, #a 0%, #b 48%, #c 100%)`. The spec's gradient is stops only, so the angle stays in `css`. */
function gradient(raw: Raw, path: string): Converted {
  const m = /^linear-gradient\((.*)\)$/.exec(String(raw));
  const [angle, ...stops] = m ? split(m[1]!, ",") : [];
  if (!angle || !/^-?[\d.]+deg$/.test(angle) || stops.length < 2) return fail(path, raw, "not linear-gradient(<angle>deg, <colour> <n>%, …)");
  const parsed = stops.map((s) => {
    const stop = /^(.+?)\s+(-?[\d.]+)%$/.exec(s);
    return stop ? { color: color(stop[1]!, path), position: round(Number(stop[2]) / 100) } : fail(path, raw, `stop "${s}" is not <colour> <n>%`);
  });
  return { value: parsed, lossy: true };
}

const CONVERT: Record<DtcgType, (raw: Raw, path: string) => Converted> = {
  color: (raw, path) => ({ value: color(String(raw), path) }),
  dimension,
  duration,
  cubicBezier,
  fontFamily,
  fontWeight,
  number,
  shadow,
  gradient,
};

const COLOUR_GROUPS = new Set([
  "surface", "fg", "border", "brand", "focus", "hover", "link", "success", "warning", "danger", "info", "identity", "scrim",
  "skeleton", "tag", "banner", "tabs", "accent", "presence", "os", "data",
]);
const DIMENSION_GROUPS = new Set(["radius", "space", "text", "control", "avatar", "row", "rail", "gutter", "breadcrumb", "topbar", "tabbar", "statusbar", "homeIndicator", "button", "dot", "sheet", "fab", "iconButton", "segmentedControl", "choice", "radioGroup", "checkbox", "chip", "select", "textField", "icon", "inAppBanner", "notificationItem", "notificationSchedule", "osBadge", "osNotification", "osTray", "permissionPrompt", "breadcrumbs", "mobileHeader", "navRail", "osHeader", "osMenu", "osWindow", "sidebar", "tabBar", "tab", "workspace", "connectionBanner", "contextMenu", "dialog", "emoji", "hoverCard", "menu", "palette", "phone", "sessionState", "tooltip", "updateBanner", "questionPanel", "thinking", "agentSteps", "kpi"]);

/** What a token is, from where it lives. A token this does not know fails the build instead of being guessed. */
export function typeOf(path: string): DtcgType {
  const [group, ...rest] = path.split(".");
  switch (group) {
    case "tracking":
    case "z":
    case "opacity":
      return "number";
    case "icon":
      return rest[0]?.startsWith("stroke") ? "number" : "dimension";
    case "font":
      // A font file is a family name: the phone loads one file per weight.
      return rest[0]?.startsWith("weight") ? "fontWeight" : "fontFamily";
    case "duration":
      return "duration";
    case "ease":
      return "cubicBezier";
    case "glass":
      return rest[0] === "blur" ? "dimension" : rest[0] === "saturate" ? "number" : "color";
    case "border":
      // `border.wHairline` is a width; every other `border.*` is a colour.
      return /^w[A-Z]/.test(rest[0] ?? "") ? "dimension" : "color";
    case "switch":
      return rest[0] === "thumbShadow" ? "shadow" : rest[0] === "trackOff" || rest[0] === "thumb" ? "color" : "dimension";
    case "shadow":
      return "shadow";
    case "chart":
      // Text and its phone files are families; a colour has one of these names; everything else is a size (a dash is a length).
      return /^(font|file)/.test(rest[0] ?? "") ? "fontFamily" : /^(series\d|previous|other|grid|axis|label|crosshair|reference|tooltip|tooltipText|tooltipMuted|tooltipRule|track)$/.test(rest[0] ?? "") ? "color" : "dimension";
    case "table":
      return /^(header|rowHover|rowSelected|divider)$/.test(rest[0] ?? "") ? "color" : "dimension";
    default:
      if (path === "os.wallpaper") return "gradient";
      if (DIMENSION_GROUPS.has(group!)) return "dimension";
      if (COLOUR_GROUPS.has(group!)) return "color";
      throw new Error(`tokens.json: no DTCG type for "${path}"`);
  }
}

/** A value in DTCG: itself converted, or a reference as it is (its target is converted where it is declared, and here only to prove it can be). */
function convert(type: DtcgType, raw: Raw, path: string): Converted & { resolved: unknown } {
  const resolved = CONVERT[type](resolveValue(raw), path);
  return { value: isReference(raw) ? raw : resolved.value, resolved: resolved.value, ...(resolved.lossy ? { lossy: true as const } : {}) };
}

/* ---------- leaves ---------- */

type Leaf = { path: string; type: DtcgType; kind: "shared" | "theme" | "profile"; modes: Partial<Record<Mode, Raw>> };

function leavesOf(tree: Tree, prefix = "", out = new Map<string, Raw>()) {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    if (/^\d+$/.test(key)) throw new Error(`tokens.json: "${prefix}${key}" is an integer key, which JSON objects would reorder`);
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object") leavesOf(value, path, out);
    else out.set(path, value);
  }
  return out;
}

/** Every leaf once, in the order `tokens.ts` declares it, with its value in each mode it has. */
function leaves(): Leaf[] {
  const shared = leavesOf(tokens.shared);
  const theme = { light: leavesOf(tokens.themes.light), dark: leavesOf(tokens.themes.dark) };
  const profile = { web: leavesOf(tokens.profiles.web), desktop: leavesOf(tokens.profiles.desktop), mobile: leavesOf(tokens.profiles.mobile) };
  const osSets = Object.entries(tokens.os).map(([name, set]) => [name as Mode, leavesOf(set)] as const);
  const order = new Map<string, Leaf["kind"]>();
  for (const p of shared.keys()) order.set(p, "shared");
  for (const p of theme.light.keys()) order.set(p, "theme");
  // A profile leaf that shared also defines (`radius.card`) is still a profile leaf: shared is its default.
  for (const p of [...profile.desktop.keys(), ...profile.web.keys(), ...profile.mobile.keys()]) order.set(p, "profile");

  const out: Leaf[] = [];
  for (const [path, kind] of order) {
    const modes: Leaf["modes"] = {};
    if (kind === "theme") {
      for (const m of ["light", "dark"] as const) {
        const v = theme[m].get(path);
        if (v === undefined) throw new Error(`tokens.json: ${path} has no ${m} value`);
        modes[m] = v;
      }
    } else if (kind === "profile") {
      // A profile that has no value and no shared default does not have the token (a font file on the web).
      for (const m of ["web", "desktop", "mobile"] as const) {
        const v = profile[m].get(path) ?? shared.get(path);
        if (v !== undefined) modes[m] = v;
      }
      if (!Object.keys(modes).length) throw new Error(`tokens.json: ${path} has no value in any profile`);
      // An OS set overrides the profile of its platform, so it has no entry where it has no base.
      for (const [name, set] of osSets) {
        const v = set.get(path);
        if (v === undefined) continue;
        if (modes[platformOf(name as never)] === undefined) throw new Error(`tokens.json: ${path} is in os.${name} but not in the ${platformOf(name as never)} profile`);
        modes[name] = v;
      }
    } else modes.desktop = shared.get(path)!;
    for (const [name, set] of osSets) if (kind !== "profile" && set.has(path)) throw new Error(`tokens.json: ${path} is in os.${name} but is not a profile token`);
    out.push({ path, type: typeOf(path), kind, modes });
  }
  return out;
}

/* ---------- the document ---------- */

type Node = { [k: string]: unknown };
const map = tokenMap as unknown as Record<string, string | { source?: string; mobile?: string; note?: string }>;

function tokenOf(leaf: Leaf): Node {
  const { path, type, kind } = leaf;
  const note = descriptions[path as TokenPath] as string | TokenNote | undefined;
  const text = typeof note === "string" ? note : note?.text;
  if (!text) throw new Error(`tokens.json: ${path} has no description`);

  const entries = Object.entries(leaf.modes) as [Mode, Raw][];
  const main = leaf.kind === "theme" ? leaf.modes.light! : (leaf.modes.desktop ?? leaf.modes.web ?? leaf.modes.mobile)!;
  const converted = new Map(entries.map(([m, raw]) => [m, convert(type, raw, path)] as const));
  const varies = new Set([...converted.values()].map((c) => JSON.stringify(c.resolved))).size > 1;
  const value = convert(type, main, path);

  const ext: Node = {};
  if (varies) ext.modes = Object.fromEntries(entries.map(([m]) => [m, converted.get(m)!.value]));
  const profiles = entries.map(([m]) => m).filter((m) => m === "web" || m === "desktop" || m === "mobile");
  if (kind === "profile" && profiles.length < 3) ext.onlyIn = profiles;
  const sameInDark = typeof note === "object" && note.sameInDark;
  if (sameInDark) {
    if (kind !== "theme" || varies) throw new Error(`tokens.json: ${path} is marked sameInDark but ${kind === "theme" ? "differs in dark" : "is not a theme token"}`);
    ext.sameInDark = true;
  }
  const from = map[path];
  if (typeof from === "object") {
    if (from.source) ext.source = from.source;
    if (from.mobile) ext.mobileSource = from.mobile;
    if (from.note) ext.sourceNote = from.note;
  }
  if (typeof note === "object" && (note.mobile || note.web)) ext.notes = { ...(note.mobile ? { mobile: note.mobile } : {}), ...(note.web ? { web: note.web } : {}) };
  if (value.lossy || [...converted.values()].some((c) => c.lossy)) {
    ext.css = resolveValue(main);
    if (varies) ext.cssModes = Object.fromEntries(entries.map(([m, raw]) => [m, resolveValue(raw)]));
  }

  return { $type: type, $value: value.value, $description: text, ...(Object.keys(ext).length ? { $extensions: { [EXTENSION]: ext } } : {}) };
}

const isToken = (n: unknown): n is Node => typeof n === "object" && n !== null && "$value" in n;

/** The one `$type` every token under a group shares, or null. */
function uniform(group: Node): string | null {
  const types = new Set<string | null>();
  for (const [k, child] of Object.entries(group)) {
    if (k.startsWith("$")) continue;
    types.add(isToken(child) ? (child.$type as string) : uniform(child as Node));
  }
  return types.size === 1 ? [...types][0]! : null;
}

/** A copy with `$type` first, moved onto a group where all its tokens agree and dropped from them. */
function place(group: Node, inherited: string | null): Node {
  const shared = uniform(group);
  const out: Node = {};
  if (shared && shared !== inherited) out.$type = shared;
  const own = shared ?? inherited;
  for (const [k, child] of Object.entries(group)) {
    if (isToken(child)) {
      const { $type, ...rest } = child;
      out[k] = $type === own ? rest : child;
    } else out[k] = place(child as Node, own);
  }
  return out;
}

const DESCRIPTION =
  "AntFabric UI design tokens in the W3C Design Tokens Format Module 2025.10. Generated by `pnpm tokens:build` from packages/core/src/tokens.ts (values), " +
  "packages/core/src/descriptions.ts (descriptions) and packages/core/tokens.map.json (sources): do not edit it, change those and run the command again; `pnpm check` fails when this file is stale. " +
  "A token's $value is its light-theme (colours, shadows) or desktop-profile (sizes, type, density) value; a token that is the same everywhere has only that. " +
  "A token that varies by mode lists every mode's value in $extensions[\"com.antfabric\"].modes: { light, dark } or { web, desktop, mobile }, with an OS key (android) where that OS changes the value of the profile it extends (modes.os at the root says which). " +
  "A token only some profiles have lists them in onlyIn. " +
  "Dimensions are px; the phone reads px as pt. Where the format cannot say a value exactly (a percentage, em, a gradient angle, no shadow), $value is the closest it can say and " +
  "$extensions[\"com.antfabric\"].css keeps the string the kits use. " +
  "A $value in braces, \"{primitives.color.neutral.900}\", points at a primitive of the product's Tier 1 in the `primitives` group at the end of this file, " +
  "which holds the primitives some token points at (the whole mirror is packages/core/src/primitives.ts); a token that has drifted from the product, has no product token or has no primitive of its own holds its value.";

/** The primitives some token points at, nested the way the mirror nests them: a token each, typed and described. */
function primitivesGroup(): Node {
  const root: Node = {};
  for (const path of referencedPrimitives()) {
    const meta = primitiveMeta[path]!;
    const type = meta.type as DtcgType;
    if (!(type in CONVERT)) throw new Error(`tokens.json: primitives.${path} has type "${type}", which the file does not know`);
    const text = primitiveValue(path);
    const converted = CONVERT[type](text, `primitives.${path}`);
    const keys = path.split(".");
    let at = root;
    for (const k of keys.slice(0, -1)) at = (at[k] ??= {}) as Node;
    at[keys[keys.length - 1]!] = {
      $type: type,
      $value: converted.value,
      $description: meta.note ?? "Mirrored from the product's primitives.css.",
      $extensions: { [EXTENSION]: { cssVar: meta.cssVar, ...(converted.lossy ? { css: text } : {}) } },
    };
  }
  return root;
}

/** Every token as a DTCG document. Throws on a value it cannot convert, a token with no description or a leaf of unknown type. */
export function tokensDtcg(): object {
  const root: Node = {};
  for (const leaf of leaves()) {
    const keys = leaf.path.split(".");
    let at = root;
    for (const k of keys.slice(0, -1)) {
      const next = (at[k] ??= {}) as Node;
      if (isToken(next)) throw new Error(`tokens.json: ${leaf.path} sits under the token ${k}`);
      at = next;
    }
    const last = keys[keys.length - 1]!;
    if (last in at) throw new Error(`tokens.json: ${leaf.path} is defined twice`);
    at[last] = tokenOf(leaf);
  }
  const profiles = Object.fromEntries(Object.entries(tokens.profiles).map(([name, p]) => [name, (p as { $description: string }).$description]));
  const os = Object.fromEntries(Object.entries(tokens.os).map(([name, set]) => [name, { extends: platformOf(name as never), $description: (set as { $description: string }).$description }]));
  return {
    $description: DESCRIPTION,
    $extensions: {
      [EXTENSION]: {
        modes: { default: { theme: "light", profile: "desktop" }, themes: ["light", "dark"], profiles, os },
        primitives: { from: "the product's design tokens (mirrored by `pnpm primitives`)", version: primitivesFrom.version, commit: primitivesFrom.commit, referenced: referencedPrimitives().length },
      },
    },
    ...place(root, null),
    primitives: place(primitivesGroup(), null),
  };
}

/** `tokensDtcg()` as the text of `tokens.json`: two-space indent, short number arrays and dimensions on one line, a final newline. */
export function tokensJson(): string {
  return (
    JSON.stringify(tokensDtcg(), null, 2)
      .replace(/\[\s+(-?[\d.e+-]+(?:,\s+-?[\d.e+-]+)*)\s+\]/g, (_, n: string) => `[${n.replace(/\s+/g, " ")}]`)
      .replace(/\{\s+("value": -?[\d.]+),\s+("unit": "\w+")\s+\}/g, "{ $1, $2 }") + "\n"
  );
}
