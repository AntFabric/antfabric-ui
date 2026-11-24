/**
 * A theme's recipe overrides at run time: checking them (a theme may come from JSON), merging a child theme's over its parent's,
 * and laying a theme's override over a recipe (`recipeFor`). The types are `RecipeOverride` and `ThemeRecipes` (`recipe.ts`,
 * `theme.ts`). This file is apart from `recipe.ts` because it reads the recipes, which import `recipe.ts`.
 *
 * Cells: every level of a recipe and of an override is an object (part → layer → variant prop → value → state → platform), and every
 * cell is one style key's value. Merging replaces cell by cell: an override's key replaces the recipe's at the same part, layer,
 * variant value, state and platform, and everything it does not name stays. `"none"` is a value like any other here, so an override
 * `"none"` replaces the recipe's own value with `"none"`, which `mergeLayers` carries and the kits' readers drop (`box-shadow: none`
 * for `shadow`): the recipe's value is removed, and so is any earlier layer's, as `"none"` always means.
 *
 * Order: a key the recipe already has keeps its place; a key it does not have is added after its own, in a fixed order (states in
 * `STATE_KEYS` order, singles before compounds; anything else by code unit), not in the order the override was written. Order is
 * precedence for states and variant props, and the theme id hashes the overrides key-sorted, so the result must not depend on it.
 */

import { descriptions } from "./descriptions";
import { canonicalPath } from "./deprecated";
import { STATE_KEYS, STYLE_KEYS, type Recipe, type StateKey } from "./recipe";
import { recipes } from "./recipes";
import type { Theme } from "./theme";
import { PLATFORM_OS, PLATFORMS } from "./types";

const isPlain = (v: unknown): v is Record<string, unknown> => {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};
const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/* ---------- merging ---------- */

const stateRank = (combo: string): number => {
  const parts = combo.split("+").map((s) => STATE_KEYS.indexOf(s as StateKey));
  if (parts.some((i) => i < 0)) return 1e6;
  return parts.length === 1 ? parts[0]! : (parts[0]! + 1) * 100 + parts[1]!;
};
const byState = (a: string, b: string) => stateRank(a) - stateRank(b) || (a < b ? -1 : a > b ? 1 : 0);
const byCodeUnit = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * `over` laid over `base`, cell by cell (see the top of this file). Objects it builds are new and frozen; a subtree `over` does not
 * touch is `base`'s own, by reference. Neither input is changed.
 */
function mergeCells(base: unknown, over: unknown, key?: string): unknown {
  if (over === undefined) return base;
  if (!isPlain(over)) return over;
  const from = base === undefined ? {} : base;
  if (!isPlain(from)) return over;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(from)) {
    const v = has(over, k) ? mergeCells(from[k], over[k], k) : from[k];
    if (v !== undefined) out[k] = v;
  }
  const added = Object.keys(over)
    .filter((k) => !has(from, k) && over[k] !== undefined)
    .sort(key === "states" ? byState : byCodeUnit);
  for (const k of added) out[k] = mergeCells(undefined, over[k], k);
  return Object.freeze(out);
}

/** Plain data copied, so a merge never shares (and a theme's freeze never reaches) what the caller passed. */
const clone = (v: unknown): unknown => (Array.isArray(v) ? v.map(clone) : isPlain(v) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)])) : v);

/** A child theme's recipe overrides over its parent's, cell by cell: the child's cell replaces the parent's. A new object; `{}` for none. */
export function mergeOverrides(parent: unknown, own: unknown): Record<string, unknown> {
  const merged = mergeCells(clone(parent ?? {}), clone(own));
  return isPlain(merged) ? { ...merged } : (merged as Record<string, unknown>);
}

/* ---------- checking ---------- */

const PLATFORM_KEYS: readonly string[] = [...PLATFORMS, ...PLATFORMS.flatMap((p) => PLATFORM_OS[p])];
const LAYER_KEYS = ["base", "variants", "states"];

/** A recipe's variant props and the values it names for each, over every part and platform entry. */
const propsOf = new WeakMap<object, Map<string, Set<string>>>();
function variantProps(recipe: Recipe): Map<string, Set<string>> {
  const hit = propsOf.get(recipe);
  if (hit) return hit;
  const out = new Map<string, Set<string>>();
  const see = (variants: Record<string, Record<string, unknown>> | undefined) => {
    for (const [prop, values] of Object.entries(variants ?? {})) for (const v of Object.keys(values)) (out.get(prop) ?? out.set(prop, new Set()).get(prop)!).add(v);
  };
  for (const part of Object.values(recipe.styles)) {
    if (!part) continue;
    see(part.variants);
    for (const l of Object.values(part.platforms ?? {})) see(l?.variants);
  }
  propsOf.set(recipe, out);
  return out;
}

const isCombo = (s: string) => {
  const parts = s.split("+");
  return parts.length <= 2 && parts.every((p) => (STATE_KEYS as readonly string[]).includes(p));
};
const describe = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "an array" : typeof v === "string" ? JSON.stringify(v) : typeof v === "object" ? "an object" : `${typeof v} ${String(v)}`);

/**
 * Checks a theme's recipe overrides against the recipes, the style vocabulary, the states, the platforms and the tokens. `bad` is
 * called (and must throw) with where (`button.root.variants.variant.primary.bg`) and what is wrong: an unknown recipe id, part,
 * layer, variant prop or value, state, platform key or style key, or a value that is not a `$token` the tokens have, `"transparent"`
 * or `"none"`.
 */
export function checkOverrides(overrides: unknown, bad: (where: string, message: string) => never): void {
  if (overrides === undefined) return;
  if (!isPlain(overrides)) bad("recipes", "must be an object of recipe overrides by recipe id");
  const byId = recipes as unknown as Record<string, Recipe>;
  for (const [id, override] of Object.entries(overrides)) {
    if (override === undefined) continue;
    if (!has(byId, id)) bad(id, `"${id}" is not a recipe id`);
    const recipe = byId[id]!;
    const props = variantProps(recipe);
    if (!isPlain(override)) bad(id, `must be an object of parts (${recipe.parts.join(", ")}), got ${describe(override)}`);

    const style = (s: unknown, where: string, states: boolean) => {
      if (!isPlain(s)) bad(where, `must be an object of style keys, got ${describe(s)}`);
      for (const [k, v] of Object.entries(s)) {
        if (v === undefined) continue;
        if (k === "states" && states) stateStyles(v, `${where}.states`);
        else if (!(STYLE_KEYS as readonly string[]).includes(k)) bad(`${where}.${k}`, `"${k}" is not a style key`);
        else if (!(v === "transparent" || v === "none" || (typeof v === "string" && v.startsWith("$") && has(descriptions, canonicalPath(v.slice(1))))))
          bad(`${where}.${k}`, `${describe(v)} is not a $token the tokens have, "transparent" or "none"`);
      }
    };
    const stateStyles = (s: unknown, where: string) => {
      if (!isPlain(s)) bad(where, `must be an object of states, got ${describe(s)}`);
      for (const [combo, v] of Object.entries(s)) {
        if (v === undefined) continue;
        if (!isCombo(combo)) bad(`${where}.${combo}`, `"${combo}" is not a state (${STATE_KEYS.join(", ")}, or two joined with +)`);
        style(v, `${where}.${combo}`, false);
      }
    };
    const layers = (l: unknown, where: string, platforms: boolean) => {
      if (!isPlain(l)) bad(where, `must be an object of layers, got ${describe(l)}`);
      for (const [k, v] of Object.entries(l)) {
        if (v === undefined) continue;
        if (k === "base") style(v, `${where}.base`, false);
        else if (k === "states") stateStyles(v, `${where}.states`);
        else if (k === "variants") {
          if (!isPlain(v)) bad(`${where}.variants`, `must be an object of variant props, got ${describe(v)}`);
          for (const [prop, values] of Object.entries(v)) {
            if (values === undefined) continue;
            const known = props.get(prop);
            if (!known) bad(`${where}.variants.${prop}`, `"${prop}" is not a variant prop of ${id}${props.size ? ` (${[...props.keys()].join(", ")})` : " (it has none)"}`);
            if (!isPlain(values)) bad(`${where}.variants.${prop}`, `must be an object of values, got ${describe(values)}`);
            for (const [value, s] of Object.entries(values)) {
              if (s === undefined) continue;
              if (!known.has(value)) bad(`${where}.variants.${prop}.${value}`, `"${value}" is not a value ${id} names for ${prop} (${[...known].join(", ")})`);
              style(s, `${where}.variants.${prop}.${value}`, true);
            }
          }
        } else if (k === "platforms" && platforms) {
          if (!isPlain(v)) bad(`${where}.platforms`, `must be an object of platforms, got ${describe(v)}`);
          for (const [key, pl] of Object.entries(v)) {
            if (pl === undefined) continue;
            if (!PLATFORM_KEYS.includes(key)) bad(`${where}.platforms.${key}`, `"${key}" is not a platform or an OS (${PLATFORM_KEYS.join(", ")})`);
            layers(pl, `${where}.platforms.${key}`, false);
          }
        } else bad(`${where}.${k}`, `"${k}" is not a layer (${[...LAYER_KEYS, ...(platforms ? ["platforms"] : [])].join(", ")})`);
      }
    };
    for (const [part, l] of Object.entries(override)) {
      if (l === undefined) continue;
      if (!recipe.parts.includes(part)) bad(`${id}.${part}`, `"${part}" is not a part of ${id} (${recipe.parts.join(", ")})`);
      layers(l, `${id}.${part}`, true);
    }
  }
}

/* ---------- recipeFor ---------- */

let ids: Map<object, string> | undefined;
/** A recipe's id from its object, the map built once from `recipes`. */
const idOf = (recipe: object) => (ids ??= new Map(Object.entries(recipes).map(([id, r]) => [r as object, id]))).get(recipe);

/** Merged recipes by theme id, then by recipe. A theme id is a hash of its overrides, so two themes with one id merge alike. */
const merged = new Map<string, Map<object, Recipe<string>>>();
const THEMES_MAX = 32;

/**
 * The recipe with the theme's override for it laid over, cell by cell (see the top of this file), in the shape of a recipe, so
 * `recipeLayers` and both kits' readers take it unchanged. The recipe itself (the same object) for no theme, the empty theme, a
 * theme with no override for it, or a recipe that is not one of `recipes`. Memoised per theme id × recipe, so a merged recipe keeps
 * its identity across calls (the phone caches its styles on it); the last 32 theme ids are kept.
 */
export function recipeFor<P extends string>(theme: Theme | undefined, recipe: Recipe<P>): Recipe<P> {
  if (!theme?.id) return recipe;
  const id = idOf(recipe);
  if (id === undefined) return recipe;
  const override = (theme.recipes as Record<string, unknown> | undefined)?.[id];
  if (!isPlain(override) || !Object.keys(override).length) return recipe;
  let byRecipe = merged.get(theme.id);
  if (!byRecipe) {
    if (merged.size >= THEMES_MAX) merged.delete(merged.keys().next().value!);
    merged.set(theme.id, (byRecipe = new Map()));
  }
  let out = byRecipe.get(recipe);
  if (!out) {
    out = Object.freeze({ ...recipe, styles: mergeCells(recipe.styles, override) as Recipe<string>["styles"] }) as Recipe<string>;
    byRecipe.set(recipe, out);
  }
  return out as Recipe<P>;
}
