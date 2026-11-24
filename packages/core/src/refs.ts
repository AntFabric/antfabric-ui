/**
 * References: a token whose value is a primitive of the product's Tier 1, written `"{primitives.color.neutral.900}"`
 * in `tokens.ts` (the same string the W3C Design Tokens format uses, so `tokens.json` carries it unchanged).
 *
 * `tokenSource` in `tokens.ts` is the document with its references; `tokens` is the same tree with each one replaced by the
 * primitive's value, so the kits, the catalogue and every script that reads a value read a value. The stylesheet and
 * `tokens.json` read the source, because for them the reference is the point.
 *
 * The type of a reference is the type of the primitive it names (`Resolved`), so `t.size.control.md` is as much a `number` in
 * React Native with `"{primitives.raw.44}"` behind it as it was with `44`.
 */

import { primitives, type Primitives } from "./primitives";
import { kebab } from "./vars";

/** `"{primitives.raw.44}"`: the one spelling a reference has. */
export type Reference = `{primitives.${string}}`;

type Lookup<O, Path extends string> = Path extends `${infer Head}.${infer Rest}` ? (Head extends keyof O ? Lookup<O[Head], Rest> : never) : Path extends keyof O ? O[Path] : never;

/**
 * `T` with every reference replaced by the literal type of the primitive it names. A reference is matched by its template
 * (`{primitives.${infer Path}}`) and looked up key by key in `Primitives`; a path that names nothing becomes `never`, which
 * the first use of the token fails to compile and `pnpm check` reports by name.
 */
export type Resolved<T> = T extends `{primitives.${infer Path}}` ? Lookup<Primitives, Path> : T extends string | number ? T : { [K in keyof T]: Resolved<T[K]> };

const PREFIX = "{primitives.";

export const isReference = (v: unknown): v is Reference => typeof v === "string" && v.startsWith(PREFIX) && v.endsWith("}") && !v.slice(PREFIX.length, -1).match(/[{}\s]/);

/**
 * `"{border.subtle}"`: a token that is another token, so the two cannot drift apart (a component token that is a semantic role:
 * `chart.gridColor` is `color.border.subtle`). The W3C format's alias, as a primitive reference is. Its target is a leaf of the set the alias is in
 * or of a set under it: a theme's in that theme, a profile's in the profile or shared, an OS's in its profile or shared (`pnpm check
 * tokens` holds that, the tiers' direction and that the two have one type), which is what lets `tokens` resolve it once and the
 * stylesheet write it as `var(--af-color-border-subtle)`.
 */
export type TokenReference = `{${string}}`;
export const isTokenReference = (v: unknown): v is TokenReference => typeof v === "string" && /^\{[A-Za-z0-9_.-]+\}$/.test(v) && !v.startsWith(PREFIX);
/** `"{border.subtle}"` → `"color.border.subtle"`. */
export const tokenReferencePath = (ref: string): string => ref.slice(1, -1);

/**
 * How `tokens.ts` writes an alias, typed as what it resolves to (a set cannot name its own type while it is being written):
 * `ref.number("size.control.md")` for a size, a weight or anything else the phone reads as a number, `ref.text("color.border.subtle")` for a
 * colour, a shadow or a family.
 */
export const ref = {
  number: (path: string): number => `{${path}}` as unknown as number,
  text: (path: string): string => `{${path}}`,
};

/** `"{primitives.color.neutral.900}"` → `"color.neutral.900"`. */
export const referencePath = (ref: string): string => ref.slice(PREFIX.length, -1);

/** The value at a dotted path of `primitives`, or `undefined` when there is none (a group is not a value). */
export function primitiveAt(path: string): string | number | undefined {
  let at: unknown = primitives;
  for (const key of path.split(".")) {
    if (typeof at !== "object" || at === null || !Object.prototype.hasOwnProperty.call(at, key)) return undefined;
    at = (at as Record<string, unknown>)[key];
  }
  return typeof at === "string" || typeof at === "number" ? at : undefined;
}

/**
 * The spelling this repository writes a value in: no space after a comma or inside parentheses, and no zero before a decimal
 * point inside them. The product writes `rgba(14, 24, 40, 0.16)`; the kits have always written `rgba(14,24,40,.16)`, and a
 * reference resolves to that, so pointing a token at a primitive changes no value a component draws or a snapshot hashes.
 * A length outside parentheses (`0.5px`, `-0.02em`) is left as the product wrote it, because the kits write those as it does.
 */
export function spell(v: string): string {
  let depth = 0;
  let out = "";
  for (let i = 0; i < v.length; i++) {
    const c = v[i]!;
    if (c === "(") depth++;
    else if (c === ")") depth--;
    if (depth > 0) {
      if (/\s/.test(c)) {
        const prev = out[out.length - 1];
        const next = v.slice(i).trimStart()[0];
        if (prev === "," || prev === "(" || next === "," || next === ")") continue;
      } else if (c === "0" && v[i + 1] === "." && /\d/.test(v[i + 2] ?? "") && !/[\w.]/.test(out[out.length - 1] ?? "")) continue;
    }
    out += c;
  }
  return out;
}

/** What a primitive is as a token value: its number, or its text in this repository's spelling. */
export const primitiveValue = (path: string): string | number => {
  const v = primitiveAt(path);
  if (v === undefined) throw new Error(`tokens: "{primitives.${path}}" names no primitive in primitives.ts`);
  return typeof v === "number" ? v : spell(v);
};

/** A leaf's value: itself, or the primitive it points at. */
export const resolveValue = (v: string | number): string | number => (isReference(v) ? primitiveValue(referencePath(v)) : v);

type Tree = { readonly [k: string]: string | number | Tree };

/**
 * A tree with each reference replaced by its value; `$` keys and everything else are copied. A reference that names no
 * primitive throws, naming the leaf, so a typo or a primitive the product dropped stops the first import of the tokens
 * rather than reaching a component as `undefined`.
 */
export function resolveTree<T extends Tree>(tree: T): Resolved<T> {
  const walk = (node: Tree, at: string): Tree =>
    Object.fromEntries(
      Object.entries(node).map(([k, v]) => {
        const path = at ? `${at}.${k}` : k;
        if (typeof v === "object") return [k, walk(v, path)];
        try {
          return [k, resolveValue(v)];
        } catch (e) {
          throw new Error(`${path}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }),
    );
  return walk(tree, "") as Resolved<T>;
}

/**
 * One set (`shared`, a theme, a profile, an OS's set) with each alias replaced by the value of the token it names, followed to the end of a
 * chain. The target is looked up in the set and then in the sets `under` it. Throws on a target none of them has and on a cycle, naming the leaf.
 */
export function resolveAliases<T extends Tree>(set: T, where: string, under: readonly Tree[] = []): T {
  const inSet = (tree: Tree, path: string): string | number | Tree | undefined => path.split(".").reduce<string | number | Tree | undefined>((node, k) => (typeof node === "object" ? node[k] : undefined), tree);
  // The set's own value first, then the sets it is laid over (a profile over shared, an OS over its profile and shared), as the layers resolve a name.
  const at = (path: string) => [set, ...under].map((tree) => inSet(tree, path)).find((v) => typeof v === "string" || typeof v === "number");
  const value = (v: string | number, from: string, seen: string[]): string | number => {
    if (!isTokenReference(v)) return v;
    const to = tokenReferencePath(v);
    if (seen.includes(to)) throw new Error(`tokens: ${where}.${from} is an alias that comes back to itself (${[...seen, to].join(" → ")})`);
    const target = at(to);
    if (typeof target !== "string" && typeof target !== "number") throw new Error(`tokens: ${where}.${from} is "${v}", and ${where} has no token ${to}: an alias names a token of its own set, or of a set under it`);
    return value(target, from, [...seen, to]);
  };
  const walk = (node: Tree, prefix: string): Tree =>
    Object.fromEntries(Object.entries(node).map(([k, v]) => [k, typeof v === "object" ? walk(v, `${prefix}${k}.`) : k.startsWith("$") ? v : value(v, `${prefix}${k}`, [`${prefix}${k}`])]));
  return walk(set, "") as T;
}

/** The CSS variable a primitive is emitted as: `color.neutral.900` is `--af-p-color-neutral-900`. */
export const primitiveVar = (path: string): string => `--af-p-${kebab(path.replace(/\./g, "-"))}`;
