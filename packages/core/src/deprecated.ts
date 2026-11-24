/**
 * Token names that have been renamed, and what keeps them working until the next major version.
 *
 * `packages/core/renames.json` is the one list: old path → new path. `pnpm tokens:build` writes `deprecated.gen.ts` from it (the map as a
 * literal, and the old names as a type with `@deprecated` on each), and everything else follows from the map:
 *
 *   the stylesheet     `--af-old-name: var(--af-new-name)`, in a block of its own (`deprecatedCss()`), so a host's own CSS keeps working
 *   `t`, both kits     the old key is still there, holding the new token's variable (web) or value (phone)
 *   themes             `defineTheme` takes an old path in `tokens` and sets the new one, warning once outside production
 *   recipes            `$old.path` in a theme's recipe override, and in a prop that takes a token, still resolves
 *   tokens.json        the old leaf stays, an alias of the new one, with `$deprecated`
 *
 * Nothing in this repository reads an old name (`pnpm check deprecated`); `af-tokens-codemod` rewrites a consumer's.
 */

import { DEPRECATED_SINCE, renames, type DeprecatedTokens } from "./deprecated.gen";

export { DEPRECATED_SINCE, renames, type DeprecatedTokens };
/** A token path that still works and has a new name. */
export type DeprecatedTokenPath = keyof typeof renames;

const map: Readonly<Record<string, string>> = renames;
export const isDeprecatedPath = (path: string): boolean => Object.prototype.hasOwnProperty.call(map, path);
/** The current name of a path: itself, or what it was renamed to. */
export const canonicalPath = (path: string): string => (isDeprecatedPath(path) ? map[path]! : path);

const warned = new Set<string>();
/** Says once, outside production, that a deprecated name was used and what to write instead. */
export function warnDeprecated(path: string, where: string) {
  if (warned.has(path) || !isDeprecatedPath(path)) return;
  warned.add(path);
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.NODE_ENV;
  if (env !== "production") console.warn(`@antfabric/ui: ${where} uses the token "${path}", renamed to "${map[path]}" in ${DEPRECATED_SINCE}. The old name leaves in the next major version; \`npx af-tokens-codemod\` rewrites it.`);
}

const back: Readonly<Record<string, string>> = Object.fromEntries(Object.entries(map).map(([old, now]) => [now, old]));
/**
 * A value with every renamed path written as it was before the rename: object keys, and strings that are a path or a `$path`. A theme's
 * id is a hash of what the theme sets, and a product's stored themes and scoped sheets carry that id, so the hash is taken over the names
 * the tokens had when ids were first made. Renaming a token then moves no theme's id.
 */
export function legacyNames<T>(value: T): T {
  const name = (s: string) => (s.startsWith("$") ? (back[s.slice(1)] !== undefined ? `$${back[s.slice(1)]}` : s) : (back[s] ?? s));
  if (typeof value === "string") return name(value) as T;
  if (Array.isArray(value)) return value.map(legacyNames) as T;
  if (typeof value === "object" && value !== null) return Object.fromEntries(Object.entries(value).map(([k, v]) => [name(k), legacyNames(v)])) as T;
  return value;
}

type Bag = Record<string, unknown>;
const node = (tree: Bag, keys: string[], make: boolean): Bag | undefined => {
  let at: Bag | undefined = tree;
  for (const k of keys) {
    if (!at) return undefined;
    if (make && (typeof at[k] !== "object" || at[k] === null)) at[k] = {};
    at = typeof at[k] === "object" && at[k] !== null ? (at[k] as Bag) : undefined;
  }
  return at;
};
/** Adds each old key to a token tree, holding what its new path holds there. A path the tree does not have (a font file off the phone) is left out. */
export function addDeprecated<T extends object>(tree: T): T {
  for (const [old, now] of Object.entries(map)) {
    const to = now.split(".");
    const value = node(tree as Bag, to.slice(0, -1), false)?.[to[to.length - 1]!];
    if (value === undefined || typeof value === "object") continue;
    const from = old.split(".");
    node(tree as Bag, from.slice(0, -1), true)![from[from.length - 1]!] = value;
  }
  return tree;
}
