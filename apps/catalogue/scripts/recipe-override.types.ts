/**
 * The type-level half of the recipe overrides check (`checkRecipeOverrides` in check.tsx is the run-time half). Never run: `pnpm
 * typecheck` compiles it, and each `@ts-expect-error` fails the typecheck if the line under it starts to compile, so a theme can
 * still name only a recipe's own parts, variant props and values, states, platforms, style keys and tokens.
 */

import type { RecipeOverride, ThemeInput, ThemeRecipes, recipes } from "@antfabric/ui-core";

type Button = RecipeOverride<typeof recipes.button>;

// What compiles: a part's base, a variant's cell and a state inside it, a compound state, a platform and an OS entry, `none`.
export const good: ThemeRecipes = {
  button: {
    root: {
      base: { radius: "$radius.card", font: "none" },
      variants: { variant: { primary: { bg: "$brand.hover", states: { hover: { bg: "$brand.active" } } } }, size: { sm: { height: "$control.hSm" } } },
      states: { "focus+pressed": { shadow: "none" } },
      platforms: { mobile: { base: { gap: "$space.sm" } }, android: { variants: { size: { lg: { radius: "$radius.control" } } } } },
    },
    icon: { variants: { variant: { ink: { fg: "$fg.onInverse" } } } }, // any part may take any of the recipe's props
  },
  switch: { track: { states: { "hover+on": { bg: "$brand.active" } } } },
};
export const input: ThemeInput = { name: "Typed", recipes: good };

// @ts-expect-error a recipe id that does not exist
export const badId: ThemeRecipes = { buton: {} };
// @ts-expect-error a part Button does not have
export const badPart: Button = { label: { base: { fg: "$fg.body" } } };
// @ts-expect-error a variant prop Button does not have
export const badProp: Button = { root: { variants: { tone: {} } } };
// @ts-expect-error a variant value Button does not name (new values are out of scope)
export const badValue: Button = { root: { variants: { variant: { brand: { bg: "$brand.default" } } } } };
// @ts-expect-error a variant prop on a recipe that has none
export const badNone: RecipeOverride<(typeof recipes)["tab-bar"]> = { bar: { variants: { size: {} } } };
// @ts-expect-error a state that does not exist
export const badState: Button = { root: { states: { hovered: { bg: "$brand.hover" } } } };
// @ts-expect-error a platform key that does not exist
export const badPlatform: Button = { root: { platforms: { tablet: {} } } };
// @ts-expect-error a style key outside the vocabulary
export const badKey: Button = { root: { base: { colour: "$fg.body" } } };
// @ts-expect-error a token the tokens do not have
export const badToken: Button = { root: { base: { radius: "$radius.nope" } } };
// @ts-expect-error a literal, not a token
export const badLiteral: Button = { root: { base: { bg: "#ffffff" } } };
// @ts-expect-error `on` is the recipe's, not a theme's
export const badOn: Button = { root: { on: ["web"] } };
