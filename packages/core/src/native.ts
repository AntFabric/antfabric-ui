/**
 * Tokens → the values React Native styles take: numbers for sizes and durations, strings for colours.
 *
 * The React Native kit's `useTheme().t` is this, for the mobile profile and the current scheme, so a
 * component reads `t.control.hMd` and `t.brand.default` exactly as the React kit does.
 */

import type { Theme } from "./theme";
import { assertBuilt } from "./theme-built";
import { platformOf, tokens, type Tokens } from "./tokens";
import type { OS } from "./types";
import { kebab } from "./vars";

type Clean<T> = { [K in keyof T as K extends `$${string}` ? never : K]: T[K] };

/** `"20px"`, `"120ms"` and `"50%"` become numbers; colours, shadows and easings stay strings. */
export type Native<T> = T extends `${number}px` | `${number}ms` | `${number}%`
  ? number
  : T extends number
    ? number
    : T extends string
      ? string
      : { [K in keyof Clean<T>]: Native<Clean<T>[K]> };

/** Each leaf as a CSS variable reference. */
export type Vars<T> = T extends string | number ? string : { [K in keyof Clean<T>]: Vars<Clean<T>[K]> };

/**
 * What a component reads: shared scales, a theme's colours, a platform's sizes. Each source is
 * mapped before the merge, so two profiles' different literals (a 36px control here, 44 there) do
 * not intersect to nothing. Every theme has the same keys; a profile has the keys its platform reads
 * (a font file is a leaf of the mobile profile only).
 */
export type NativeTokens = Native<Tokens["shared"]> & Native<Tokens["themes"]["light"]> & Native<Tokens["profiles"]["mobile"]>;

/** The same shape with every leaf a `var(--af-…)` string: the React kit's `t`. */
export type TokenVars = Vars<Tokens["shared"]> & Vars<Tokens["themes"]["light"]> & Vars<Tokens["profiles"]["web"]>;

type Tree = { readonly [k: string]: string | number | Tree };

function merge(into: Record<string, unknown>, from: Tree) {
  for (const [k, v] of Object.entries(from)) {
    if (k.startsWith("$")) continue;
    if (typeof v === "object") merge((into[k] ??= {}) as Record<string, unknown>, v);
    else into[k] = v;
  }
  return into;
}

function resolve(v: string | number, web: boolean): string | number {
  if (typeof v === "number") return v;
  const unit = /^(-?[\d.]+)(px|ms)$/.exec(v);
  if (unit) return Number(unit[1]);
  // React Native has no percentage radius; a circle is a radius past half the side.
  if (v === "50%") return 9999;
  // A CSS font stack works on the web; a phone takes one family name.
  if (!web && v.includes(",") && /serif|monospace|system-ui/.test(v)) return v.split(",")[0]!.replace(/"/g, "").trim();
  return v;
}

function walk(tree: Record<string, unknown>, web: boolean): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(tree).map(([k, v]) => [k, typeof v === "object" && v !== null ? walk(v as Record<string, unknown>, web) : resolve(v as string | number, web)]),
  );
}

/** Sets a theme's value at a dotted token path, which must already be a leaf of the merged tree (`defineTheme` checked it against its set). */
function putLeaf(tree: Record<string, unknown>, path: string, value: string | number, theme: Theme) {
  const keys = path.split(".");
  const last = keys.pop()!;
  let at: unknown = tree;
  for (const k of keys) at = typeof at === "object" && at !== null ? (at as Record<string, unknown>)[k] : undefined;
  const leaf = typeof at === "object" && at !== null ? (at as Record<string, unknown>)[last] : undefined;
  if (typeof leaf !== "string" && typeof leaf !== "number") throw new Error(`resolveTokens: theme "${theme.name}" sets ${path}, which is not a token here`);
  (at as Record<string, unknown>)[last] = value;
}

const freeze = <T>(v: T): T => {
  if (typeof v === "object" && v !== null) for (const x of Object.values(v)) freeze(x);
  return Object.freeze(v);
};

const resolved = new Map<string, NativeTokens>();
const RESOLVED_MAX = 64; // themes are a handful; a host that builds one per render would otherwise grow this for ever

/**
 * The resolved tokens for one platform profile and scheme. `web: true` keeps CSS font stacks, for
 * React Native Web (the catalogue draws the mobile kit in the browser through it). `os` applies that
 * OS's set over the profile (`{ os: "android" }` gives Material's switch); an OS with no set, such as
 * iOS, is the profile as it stands. The OS must belong to the profile's platform.
 *
 * `theme` is laid over the base one layer at a time, as `tokenValues` and `themeCss` lay it: shared, scheme, profile, OS, the
 * base then the theme at each, so the base's Android switch still beats a theme's mobile-profile switch. A theme's font stack
 * becomes its first family off the web, as the kit's own does.
 *
 * A tenant's brand is a theme's too (`defineTheme({ name, brand })`), so there is no `brand` option here.
 *
 * Memoised per profile, scheme, OS, `web` and theme (by its id), and frozen: the same inputs give the same object, so a
 * component that caches on `t` (`createStyles`) builds once per theme. The empty theme (`antfabric`) is no theme: the same
 * object as passing none.
 */
export function resolveTokens(profile: keyof Tokens["profiles"], scheme: keyof Tokens["themes"], opts: { web?: boolean; os?: OS; theme?: Theme } = {}): NativeTokens {
  const { os } = opts;
  if (opts.theme !== undefined) assertBuilt(opts.theme, "resolveTokens");
  const theme = opts.theme?.id ? opts.theme : undefined;
  const key = [profile, scheme, os ?? "", opts.web ? "web" : "", ...(theme ? [theme.id] : [])].join("|");
  const hit = resolved.get(key);
  if (hit) return hit;
  if (os && platformOf(os) !== profile) throw new Error(`resolveTokens: ${os} is not an OS of the ${profile} profile`);
  const set = os ? (tokens.os as Partial<Record<OS, Tree>>)[os] : undefined;
  const sets = theme?.sets;
  const layers: [Tree | undefined, Readonly<Record<string, string | number>> | undefined][] = [
    [tokens.shared, sets?.shared],
    [tokens.themes[scheme] as Tree, sets?.schemes[scheme]],
    [tokens.profiles[profile] as Tree, sets?.profiles[profile]],
    [set, os ? sets?.os[os] : undefined],
  ];
  const merged: Record<string, unknown> = {};
  for (const [base, over] of layers) {
    if (base) merge(merged, base);
    for (const [path, v] of Object.entries(over ?? {})) putLeaf(merged, path, v, theme!);
  }
  const out = walk(merged, !!opts.web);
  if (resolved.size >= RESOLVED_MAX) resolved.delete(resolved.keys().next().value!);
  const value = freeze(out) as NativeTokens;
  resolved.set(key, value);
  return value;
}

/** Every token as `var(--af-…)`, in the same shape: the React kit's `t`. */
export function tokenVars(): TokenVars {
  const merged = merge(merge(merge(merge({}, tokens.shared), tokens.themes.light as Tree), tokens.profiles.web as Tree), tokens.profiles.mobile as Tree);
  const map = (tree: Record<string, unknown>, prefix: string): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(tree).map(([k, v]) => {
        const name = prefix ? `${prefix}-${k}` : k;
        return [k, typeof v === "object" && v !== null ? map(v as Record<string, unknown>, name) : `var(--af-${kebab(name)})`];
      }),
    );
  return map(merged, "") as TokenVars;
}
