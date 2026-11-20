/**
 * The token reference on `/foundations`: one row per token, built from the same data as everything
 * else. The leaves come from `scripts/token-leaves.ts` (what counts as one token), the resolved values
 * from `tokenValues()` (so a leaf that becomes a `{reference}` still shows what it resolves to), the
 * descriptions from `packages/core/src/descriptions.ts`. Nothing here is typed by hand but the
 * grouping into sections, and `rowCount()` fails the build if a token lands in none of them.
 */

import { cssVarName, descriptions, tokenValues, type TokenNote, type TokenPath } from "@antfabric-ui/core";
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
  /** `fg.muted`: the name the docs and the kits use. */
  path: string;
  /** `--af-fg-muted`: the CSS variable. */
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
  if (kind === "theme") return group === "shadow" ? "shadow" : COLOUR.test(value) ? "colour" : "none";
  if (group === "space" || group === "gutter") return "bar";
  if (group === "radius") return "radius";
  if (group === "font") return path.startsWith("font.weight") ? "weight" : path.startsWith("font.file") ? "none" : "family";
  if (path === "chart.font") return "family";
  if (group === "tracking") return "tracking";
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
const DATA_GROUPS = ["chart", "data", "table"];
const groupName = (r: Row) => {
  const g = r.path.split(".")[0]!;
  if (DATA_GROUPS.includes(g)) return r.path.startsWith("chart.file") ? "chart-files" : `${g}-${r.kind}`;
  return r.path.startsWith("font.file") ? "fontFiles" : g;
};

// The groups that are not colours, in the order each section shows them. Everything else with a theme value is a colour.
const SECTIONS = {
  type: ["text", "font", "fontFiles", "tracking"],
  space: ["space", "gutter"],
  radius: ["radius"],
  size: ["control", "row", "breadcrumb", "topbar", "rail", "tabbar", "statusbar", "homeIndicator", "avatar", "icon", "border"],
  // A component's own decisions: every group not named in another section (`switch`, `button`, `chip`, `osNotification`…), so a
  // new component token always has a home. The colours of `switch` (and `danger.fg`) are in Colour with the rest of the theme.
  components: [],
  elevation: ["shadow"],
  motion: ["duration", "ease"],
  layers: ["z", "opacity"],
  // `glass.blur` and `glass.saturate` are shared; the other `glass.*` are colours and sit in Colour.
  materials: ["glass"],
  // The data components' own: the chart palette and the data status colours (themes), then the plot's geometry, dashes and text, then the table.
  data: ["chart-theme", "data-theme", "chart-profile", "chart-shared", "chart-files", "table-theme", "table-profile", "table-shared"],
} as const;
export type Section = keyof SECTIONS_T | "colour";
type SECTIONS_T = typeof SECTIONS;

const NAMED = new Set<string>(Object.values(SECTIONS).flat());

const inSection = (key: Section, r: Row): boolean => {
  const data = (SECTIONS.data as readonly string[]).includes(groupName(r));
  if (key === "colour") return r.kind === "theme" && groupName(r) !== "shadow" && !data;
  if (r.kind === "theme") return key === "elevation" ? groupName(r) === "shadow" : key === "data" && data;
  if (key === "components") return !NAMED.has(groupName(r));
  return (SECTIONS[key] as readonly string[]).includes(groupName(r));
};

/** One section's groups, in order. */
export function groups(key: Section): Group[] {
  const rows = all.filter((r) => inSection(key, r));
  const names = key === "colour" ? [...new Set(rows.map(groupName))] : key === "components" ? [...new Set(rows.map(groupName))].sort() : [...SECTIONS[key]];
  return names.map((name) => ({ name, rows: rows.filter((r) => groupName(r) === name) })).filter((g) => g.rows.length > 0);
}

export const sectionKeys = ["colour", ...Object.keys(SECTIONS)] as Section[];

/** The number of rows the page draws; throws if a token belongs to no section, or to two. */
export function rowCount(): number {
  const seen = new Map<string, number>();
  for (const key of sectionKeys) for (const g of groups(key)) for (const r of g.rows) seen.set(r.path, (seen.get(r.path) ?? 0) + 1);
  const missing = all.filter((r) => !seen.has(r.path)).map((r) => r.path);
  const twice = [...seen].filter(([, n]) => n > 1).map(([p]) => p);
  if (missing.length || twice.length) throw new Error(`token-ref: not in exactly one section: ${[...missing, ...twice].join(", ")}`);
  return all.length;
}

/** Row lookup for the specimens, which draw a token's value but are not rows. */
export const valueOf = (path: string, platform: Platform, theme: Scheme = "light"): string => values[platform][theme][cssVarName(path)] ?? "";
export const refCount = (): number => all.filter((r) => r.cells.some((c) => c.ref)).length;
