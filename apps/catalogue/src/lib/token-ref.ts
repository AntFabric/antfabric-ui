/**
 * The token reference on `/foundations`: one row per token, built from the same data as everything
 * else. The leaves come from `scripts/token-leaves.ts` (what counts as one token), the resolved values
 * from `tokenValues()` (so a leaf that becomes a `{reference}` still shows what it resolves to), the
 * descriptions from `packages/core/src/descriptions.ts`. Nothing here is typed by hand but the
 * grouping into sections, and `rowCount()` fails the build if a token lands in none of them.
 */

import { cssVarName, descriptions, tokenRegistry, tokenValues, type TokenNote, type TokenPath, type TokenSection } from "@antfabric/ui-core";
import { tokenLeaves, type Context, type Leaf } from "../../scripts/token-leaves";

export type Platform = "web" | "desktop" | "mobile";
export type Scheme = "light" | "dark";
export type RowKind = "theme" | "profile" | "shared";
/** What a value looks like, for the picture drawn beside it. */
export type Look = "colour" | "shadow" | "bar" | "radius" | "family" | "weight" | "tracking" | "none";

export interface Cell {
  label: string;
  /** What the token resolves to in this mode, as the stylesheet writes it (`12px`, `#fbfbf9`). */
  value: string;
  /** The `{reference}` the source holds, when the leaf is an alias; absent when the source holds the value itself. */
  ref?: string;
  /** The same as light, on purpose (`sameInDark` in the descriptions). */
  same?: boolean;
  /** What an OS changes inside this mode, when it does: `android 36px` on the mobile cell of a switch's track. */
  os?: string;
}

export interface Row {
  /** `color.text.muted`: the name the docs and the kits use. */
  path: string;
  /** `--af-color-text-muted`: the CSS variable. */
  cssVar: string;
  kind: RowKind;
  look: Look;
  cells: Cell[];
  /** The mobile value, when a shared token has its own on the phone. */
  override?: string;
  /** Whether the value differs between platforms. */
  differs: boolean;
  text: string;
  mobile?: string;
  web?: string;
}

const PLATFORMS: Platform[] = ["web", "desktop", "mobile"];
const THEMES: Scheme[] = ["light", "dark"];

const values = Object.fromEntries(PLATFORMS.map((p) => [p, Object.fromEntries(THEMES.map((t) => [t, tokenValues(p, t)]))])) as Record<Platform, Record<Scheme, Record<string, string>>>;

/** The phone's values with Android's set on top: where it differs from the mobile cell, the cell says so. */
const android = tokenValues("mobile", "light", "android");

const isRef = (v: unknown): v is string => typeof v === "string" && /^\{[^}]+\}$/.test(v);
const COLOUR = /^(#|rgb|hsl|color\(|linear-gradient|radial-gradient|transparent)/;

const kindOf = (leaf: Leaf): RowKind => (leaf.light !== undefined ? "theme" : leaf.shared !== undefined ? "shared" : "profile");

function lookOf(path: string, kind: RowKind, value: string): Look {
  const group = path.split(".")[0]!;
  if (kind === "theme") return group === "elevation" || /Shadow$/.test(path) ? "shadow" : COLOUR.test(value) ? "colour" : "none";
  if (group === "space") return "bar";
  if (group === "radius") return "radius";
  if (path.startsWith("font.weight.")) return "weight";
  if (path.startsWith("font.family.") || path === "chart.fontFamily") return "family";
  if (path.startsWith("font.letterSpacing.")) return "tracking";
  return "none";
}

/** What the source file holds for a leaf in one mode: the leaf's own value, else the shared one. */
const rawIn = (leaf: Leaf, mode: Context): string | number | undefined => leaf[mode] ?? leaf.shared;

const build = (path: string, leaf: Leaf): Row => {
  const kind = kindOf(leaf);
  const cssVar = cssVarName(path);
  const note = descriptions[path as TokenPath] as string | TokenNote | undefined;
  if (note === undefined) throw new Error(`token-ref: ${path} has no description`);
  const n: TokenNote = typeof note === "string" ? { text: note } : note;
  const cell = (label: string, platform: Platform, theme: Scheme, mode: Context, same?: boolean): Cell => {
    const value = values[platform][theme][cssVar];
    if (value === undefined) throw new Error(`token-ref: ${path} has no value for ${platform}/${theme}`);
    const raw = rawIn(leaf, mode);
    const os = platform === "mobile" && theme === "light" && kind !== "theme" && android[cssVar] !== undefined && android[cssVar] !== value ? `android ${android[cssVar]}` : undefined;
    return { label, value, ref: isRef(raw) ? raw : undefined, same, os };
  };
  const cells =
    kind === "theme"
      ? [cell("Light", "desktop", "light", "light"), cell("Dark", "desktop", "dark", "dark", n.sameInDark)]
      : kind === "profile"
        ? // A profile that has neither a value nor a shared default does not have the token (a font file on the web).
          PLATFORMS.filter((p) => leaf[p] !== undefined || leaf.shared !== undefined).map((p) => cell(p[0]!.toUpperCase() + p.slice(1), p, "light", p))
        : [cell("Value", "desktop", "light", "desktop")];
  const phone = kind === "shared" ? cell("Mobile", "mobile", "light", "mobile") : undefined;
  const override = phone && phone.value !== cells[0]!.value ? phone.value : undefined;
  const distinct = kind === "profile" ? new Set(cells.map((c) => c.value)).size : override ? 2 : 1;
  return {
    path,
    cssVar,
    kind,
    look: lookOf(path, kind, cells[0]!.value),
    cells,
    override,
    differs: distinct > 1 && kind !== "theme",
    text: n.text,
    mobile: n.mobile,
    web: n.web,
  };
};

const all: Row[] = [...tokenLeaves()].map(([path, leaf]) => build(path, leaf));

export interface Group {
  name: string;
  rows: Row[];
}

// The data components' groups (`chart`, `data`, `table`) each mix colours, shared values and per-platform sizes, which have different columns, so each
// kind is its own table: `chart-theme`, `chart-profile`… The phone's files (`font.file*`, `chart.file*`) have one cell, not three, so they get their own too.
/** The groups `token-registry.ts` puts in a section, in the order it declares them. */
const groupsIn = (section: TokenSection): string[] => Object.entries(tokenRegistry).filter(([, g]) => g.section === section).map(([name]) => name);

const DATA_GROUPS = groupsIn("data");
/** A category's tokens are tabled by their property (`color.text`, `font.size`, `size.control`); these have no property level. */
const FLAT = new Set(["radius", "opacity", "zIndex"]);
/**
 * The table a row is in. A semantic token's is its category and property (`color.text`, `font.size`; `space` and `space.gutter`), a
 * component token's is its group. The phone's font files have one cell, not three, so they are a table of their own (`fontFiles`), and the
 * data groups mix colours, shared values and per-platform sizes, which have different columns, so each kind is its own (`chart-theme`).
 */
const groupName = (r: Row) => {
  const [g, second, third] = r.path.split(".") as [string, string?, string?];
  if (DATA_GROUPS.includes(g)) return r.path.startsWith("chart.fontFile") ? "chart-files" : `${g}-${r.kind}`;
  if (r.path.startsWith("font.file.")) return "fontFiles";
  if (tokenRegistry[g]?.tier !== "semantic" || FLAT.has(g) || g === "os") return g;
  if (g === "space") return second === "gutter" ? "space.gutter" : "space";
  return third === undefined ? g : `${g}.${second}`;
};

/** The section a row is in: a colour is in Colour and a shadow in Elevation whatever its group; the data groups are in Data; the rest is the registry's. */
const sectionOf = (r: Row): Section => {
  const g = r.path.split(".")[0]!;
  if (DATA_GROUPS.includes(g)) return "data";
  if (r.kind === "theme") return g === "elevation" ? "elevation" : "colour";
  return tokenRegistry[g]!.section;
};
export type Section = TokenSection;

/** One section's groups, in the order `tokens.ts` declares them (a component's own, by name). */
export function groups(key: Section): Group[] {
  const rows = all.filter((r) => sectionOf(r) === key);
  const names = [...new Set(rows.map(groupName))];
  return (key === "components" ? names.sort() : names).map((name) => ({ name, rows: rows.filter((r) => groupName(r) === name) }));
}

export const sectionKeys: Section[] = ["colour", "type", "space", "radius", "size", "components", "elevation", "motion", "layers", "materials", "data"];

/** The number of rows the page draws; throws if a token belongs to no section the page shows. */
export function rowCount(): number {
  const missing = all.filter((r) => !sectionKeys.includes(sectionOf(r))).map((r) => r.path);
  if (missing.length) throw new Error(`token-ref: in no section: ${missing.join(", ")}`);
  return all.length;
}

/** Row lookup for the specimens, which draw a token's value but are not rows. */
export const valueOf = (path: string, platform: Platform, theme: Scheme = "light"): string => values[platform][theme][cssVarName(path)] ?? "";
export const refCount = (): number => all.filter((r) => r.cells.some((c) => c.ref)).length;
