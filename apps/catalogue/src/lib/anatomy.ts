/**
 * A component's anatomy, from its recipe (`packages/core/src/recipes`): the parts, and for each part every token it reads, with
 * the condition under which it reads it (always, one variant value, a state, a platform). The component page draws it as real
 * tables; every token links to its row on `/foundations`. Nothing here is typed by hand: the rows are the recipe's entries.
 */

import { cssVarName } from "@antfabric-ui/core";
import { recipeEntries, recipes, tokenOf, type Recipe, type RecipeEntry } from "@antfabric-ui/docs";
import { OS_LABEL, PLATFORM_META, type OS, type Platform } from "./library";

export interface AnatomyRow {
  /** "Always", "size = md", "variant = ink · hover", "On mobile · variant = ink · pressed". */
  when: string;
  /** The vocabulary key: `bg`, `paddingX`. */
  key: string;
  /** The token path (`fg.body`), or the keyword (`transparent`, `none`) when the value is not a token. */
  value: string;
  /** Where the token's row is on Foundations; absent for a keyword. */
  href?: string;
}

export interface AnatomyPart {
  name: string;
  /** Set when the part is not drawn on every platform. */
  only?: Platform[];
  rows: AnatomyRow[];
}

export interface Anatomy {
  id: string;
  parts: AnatomyPart[];
  /** Tokens the kit reads for behaviour, not for a style. */
  reads: { value: string; href: string }[];
  /** Where the recipe is written. */
  file: string;
}

const where = (label: string) => (PLATFORM_META as Record<string, { label: string }>)[label]?.label ?? OS_LABEL[label as OS] ?? label;

/** The condition an entry applies under, in the words the docs use for props and states. */
export function whenOf(e: RecipeEntry): string {
  const on: string[] = [];
  if (e.platform) on.push(`On ${where(e.platform)}`);
  if (e.prop) on.push(`${e.prop} = ${e.value}`);
  if (e.state) on.push(e.state.replace("+", " and "));
  return on.length ? on.join(" · ") : "Always";
}

const foundations = (path: string) => `/foundations#${cssVarName(path).slice(2)}`;

export function anatomyOf(id: string, category: string): Anatomy | null {
  const recipe = (recipes as Record<string, Recipe>)[id];
  if (!recipe) return null;
  const entries = recipeEntries(recipe);
  const on = (part: string) => (recipe.styles as Record<string, { on?: Platform[] } | undefined>)[part]?.on;
  return {
    id,
    parts: recipe.parts.map((name) => ({
      name,
      only: on(name),
      rows: entries
        .filter((e) => e.part === name)
        .map((e) => {
          const path = tokenOf(e.style);
          return { when: whenOf(e), key: e.key, value: path ?? e.style, href: path ? foundations(path) : undefined };
        }),
    })),
    reads: (recipe.reads ?? []).map((r) => ({ value: r.slice(1), href: foundations(r.slice(1)) })),
    file: `packages/core/src/recipes/${category}/${id}.ts`,
  };
}
