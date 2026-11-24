/**
 * Tokens → the values React Native styles take: numbers for sizes and durations, strings for colours.
 *
 * The React Native kit's `useTheme().t` is this, for the mobile profile and the current scheme, so a
 * component reads `t.control.hMd` and `t.brand.default` exactly as the React kit does.
 */

import { followAliases } from "./alias";
import { addDeprecated, type DeprecatedTokens } from "./deprecated";
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
type NativeNow = Native<Tokens["shared"]> & Native<Tokens["themes"]["light"]> & Native<Tokens["profiles"]["mobile"]>;
/** With the renamed tokens' old keys (`deprecated.ts`), each marked `@deprecated`, until the next major version. */
export type NativeTokens = NativeNow & DeprecatedTokens<NativeNow>;

/** The same shape with every leaf a `var(--af-…)` string: the React kit's `t`. */
type VarsNow = Vars<Tokens["shared"]> & Vars<Tokens["themes"]["light"]> & Vars<Tokens["profiles"]["web"]>;
export type TokenVars = VarsNow & DeprecatedTokens<VarsNow>;

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

/** A CSS length in a unit React Native has no number for (`0.5rem`, `1em`, `10%`), or a `calc()`-like function. px and ms are numbers already. */
const CSS_LENGTH = /^(?:-?(?:\d+(?:\.\d*)?|\.\d+)[a-z%]+|(?:calc|min|max|clamp)\s*\(.*)$/i;

/**
 * Sets a theme's value at a dotted token path, which must already be a leaf of the merged tree (`defineTheme` checked it against its set).
 * On the phone (`phone`), a leaf the kit reads as a number throws when the theme gives it a CSS length that stays a string.
 */
function putLeaf(tree: Record<string, unknown>, path: string, value: string | number, theme: Theme, phone: boolean) {
  const keys = path.split(".");
  const last = keys.pop()!;
  let at: unknown = tree;
  for (const k of keys) at = typeof at === "object" && at !== null ? (at as Record<string, unknown>)[k] : undefined;
  const leaf = typeof at === "object" && at !== null ? (at as Record<string, unknown>)[last] : undefined;
  if (typeof leaf !== "string" && typeof leaf !== "number") throw new Error(`resolveTokens: theme "${theme.name}" sets ${path}, which is not a token here`);
  if (phone && typeof value === "string" && typeof resolve(leaf, false) === "number" && typeof resolve(value, false) === "string" && CSS_LENGTH.test(value.trim()))
    throw new Error(`resolveTokens: theme "${theme.name}" sets ${path} to "${value}", a length the phone cannot read; give it in px or as a number`);
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
 * becomes its first family off the web, as the kit's own does. On the mobile profile, a theme that gives a size the phone reads
 * as a number in a unit it has none for (`0.5rem`, `1em`, `10%`, `calc(…)`) throws, naming the theme, the path and the value.
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
    for (const [path, v] of Object.entries(over ?? {})) putLeaf(merged, path, v, theme!, profile === "mobile");
  }
  // An alias the theme left alone follows its target, as it does in the web's sheet: a theme that sets `border.subtle` moves `chart.grid` too.
  if (sets) {
    const node = (path: string): [Record<string, unknown> | undefined, string] => {
      const keys = path.split(".");
      const last = keys.pop()!;
      return [keys.reduce<unknown>((at, k) => (typeof at === "object" && at !== null ? (at as Record<string, unknown>)[k] : undefined), merged) as Record<string, unknown> | undefined, last];
    };
    followAliases({ platform: profile, scheme, os }, sets, (path) => { const [at, k] = node(path); return at?.[k] as string | number | undefined; }, (path, v) => { const [at, k] = node(path); if (at) at[k] = v; });
  }
  const out = addDeprecated(walk(merged, !!opts.web));
  if (resolved.size >= RESOLVED_MAX) resolved.delete(resolved.keys().next().value!);
  const value = freeze(out) as unknown as NativeTokens;
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
  // A renamed token's old key holds the new variable itself, so it works whether or not the host ships the deprecated sheet.
  return addDeprecated(map(merged, "")) as unknown as TokenVars;
}
