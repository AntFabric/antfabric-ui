/**
 * Aliases under a theme. In `tokens` an alias is already its target's value, which is exact for the base because an alias names a token of
 * its own set. A theme can set the target and not the alias, and then the alias has to follow, as `var(--af-target)` does in the sheet
 * without being told. `tokenValues` and `resolveTokens` call `followAliases` for that, so the three readers agree.
 *
 * Which declaration of a name wins is the layers' order, the same one `themeCss` lays out: shared, the scheme, the profile, the OS, the
 * base then the theme at each. An alias follows only where the winning declaration is the base's alias: a theme that sets the alias
 * itself has said what it is, and a later base layer that gives the name a value of its own has too.
 */

import { isTokenReference, tokenReferencePath } from "./refs";
import { tokenSource } from "./tokens";
import type { OS, Platform, Scheme } from "./types";

type Tree = { readonly [k: string]: string | number | Tree };
type Values = Readonly<Record<string, string | number>>;
/** What a theme sets, as `Theme["sets"]` holds it: flat dotted paths per set. */
export interface AliasSets {
  shared?: Values;
  schemes: Partial<Record<Scheme, Values>>;
  profiles: Partial<Record<Platform, Values>>;
  os: Partial<Record<OS, Values>>;
}
export interface AliasContext {
  platform: Platform;
  scheme: Scheme;
  os?: OS;
}
/** For one set: each path some set aliases that this set declares, with the token it names here, or `null` where this set gives it a value of its own. */
type Declared = ReadonlyMap<string, string | null>;
export interface AliasTable {
  /** Every path that is an alias in some set. */
  paths: ReadonlySet<string>;
  shared: Declared;
  schemes: Record<string, Declared>;
  profiles: Record<string, Declared>;
  os: Record<string, Declared>;
}

function leaves(tree: Tree, prefix = "", out = new Map<string, string | number>()) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith("$")) continue;
    if (typeof v === "object") leaves(v, `${prefix}${k}.`, out);
    else out.set(`${prefix}${k}`, v);
  }
  return out;
}

/** The alias table of a token document shaped like `tokenSource` (its own, or a test's). */
export function aliasTable(source: { shared: Tree; themes: Record<string, Tree>; profiles: Record<string, Tree>; os: Record<string, Tree> }): AliasTable {
  const flat = { shared: leaves(source.shared), themes: mapOf(source.themes), profiles: mapOf(source.profiles), os: mapOf(source.os) };
  const paths = new Set<string>();
  for (const set of [flat.shared, ...Object.values(flat.themes), ...Object.values(flat.profiles), ...Object.values(flat.os)]) for (const [path, v] of set) if (isTokenReference(v)) paths.add(path);
  const declared = (set: Map<string, string | number>): Declared => new Map([...paths].filter((p) => set.has(p)).map((p) => [p, isTokenReference(set.get(p)) ? tokenReferencePath(set.get(p) as string) : null]));
  const each = (sets: Record<string, Map<string, string | number>>) => Object.fromEntries(Object.entries(sets).map(([k, set]) => [k, declared(set)]));
  return { paths, shared: declared(flat.shared), schemes: each(flat.themes), profiles: each(flat.profiles), os: each(flat.os) };
}
const mapOf = (sets: Record<string, Tree>) => Object.fromEntries(Object.entries(sets).map(([k, set]) => [k, leaves(set)]));

let own: AliasTable | undefined;

/**
 * Sets each alias that still follows its target, for one element under a theme, to the target's value as `get` reads it now (so after the
 * theme's own values are laid). `table` is `tokenSource`'s unless a test gives its own.
 */
export function followAliases(
  { platform, scheme, os }: AliasContext,
  sets: AliasSets,
  get: (path: string) => string | number | undefined,
  set: (path: string, value: string | number) => void,
  table: AliasTable = (own ??= aliasTable(tokenSource as never)),
) {
  if (!table.paths.size) return;
  // The winning declaration of each alias path, in the layers' order: a target to follow, or null.
  const wins = new Map<string, string | null>();
  const layers: [Declared | undefined, Values | undefined][] = [
    [table.shared, sets.shared],
    [table.schemes[scheme], sets.schemes[scheme]],
    [table.profiles[platform], sets.profiles[platform]],
    [os ? table.os[os] : undefined, os ? sets.os[os] : undefined],
  ];
  for (const [base, theme] of layers) {
    for (const [path, to] of base ?? []) wins.set(path, to);
    if (theme) for (const path of table.paths) if (path in theme) wins.set(path, null);
  }
  const done = new Set<string>();
  const follow = (path: string, seen: string[]): string | number | undefined => {
    const to = wins.get(path);
    if (to === undefined || to === null || done.has(path)) return get(path);
    if (seen.includes(path)) throw new Error(`tokens: the alias ${path} comes back to itself (${[...seen, path].join(" → ")})`);
    const value = follow(to, [...seen, path]);
    if (value !== undefined) set(path, value);
    done.add(path);
    return value;
  };
  for (const path of wins.keys()) follow(path, []);
}
