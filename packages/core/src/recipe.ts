/**
 * Recipes: what each part of a component reads from the tokens, per variant, per state and per
 * platform, written once as data and read by both kits (`useRecipe` in `@antfabric/ui-react` and in
 * `@antfabric/ui-react-native`). The recipe holds the decisions a token can name (colour, size,
 * radius, type, shadow, edge); what stays in the kit is behaviour (hover, press, Animated, roles)
 * and layout that no token decides (flex direction, alignment, `cursor`, a `0.97` press scale).
 *
 * A recipe is per component, in `recipes/<category>/<id>.ts`:
 *
 *   export const switchRecipe = defineRecipe({
 *     parts: ["root", "track", "thumb"],
 *     styles: {
 *       track: { base: { bg: "$switch.trackOff", radius: "$radius.pill" }, states: { on: { bg: "$brand.default" } } },
 *     },
 *   });
 *
 * Limit: a variant is one prop's value, so a style that depends on two props together (an inset that differs by orientation)
 * cannot be written; `"a+b"` joins states only. The workaround is in AUTHORING.md, Recipes ("Compound variants").
 *
 * Values are `"$group.leaf"` token references (typed against `TokenPath`, so a typo does not
 * compile), `"transparent"` or `"none"`. Nothing else: no literal, no `calc`, no ratio.
 *
 * How a part's style is worked out, one rule: take `base`; then each variant prop the component
 * passes, in the order the recipe lists them (its value's style, then that value's own `states`);
 * then `states`, in the order listed (a state that is on, and a compound `"invalid+focus"` when
 * both are on); then the platform's own entries (`web` / `desktop` / `mobile`, then the OS:
 * `browser` / `mac` / `windows` / `linux` / `ios` / `android`), each laid out the same way. A later
 * layer's key replaces an earlier one's. `"none"` removes a key an earlier layer set (and is
 * `box-shadow: none` for `shadow`). Hover is ignored on the phone, and `ios` / `android` entries
 * never apply on the web, because the context a kit passes never names them.
 */

import type { TokenPath } from "./descriptions";
import type { DeprecatedTokenPath } from "./deprecated";
import type { OS, Platform } from "./types";

/** `"$fg.body"`: a token by its path, as `descriptions.ts` and the Foundations page name it. */
/** A renamed token's old path is still a reference until the next major version (`deprecated.ts`). */
export type TokenRef = `$${TokenPath | DeprecatedTokenPath}`;
export type StyleValue = TokenRef | "transparent" | "none";

/**
 * The style vocabulary. Each key is what the CSS and the React Native tables in the kits map (one
 * table per kit); a recipe can say nothing else.
 *
 *   bg           the fill                          CSS `background`            RN `backgroundColor`
 *   fg           the text and icon colour          `color`                     `color`
 *   width        a width                           `width`                     `width`
 *   height       a height                          `height`                    `height`
 *   minWidth     a minimum width                   `minWidth`                  `minWidth`
 *   maxWidth     a maximum width                   `maxWidth`                  `maxWidth`
 *   minHeight    a minimum height                  `minHeight`                 `minHeight`
 *   maxHeight    a maximum height                  `maxHeight`                 `maxHeight`
 *   square       width and height, for an icon     `width` + `height`          `width` + `height`
 *   padding      the same padding on all four sides `padding`                `padding`
 *   paddingX     padding left and right            `paddingInline`             `paddingHorizontal`
 *   paddingY     padding top and bottom            `paddingBlock`              `paddingVertical`
 *                Both together on the web are one `padding: <paddingY> <paddingX>`.
 *   paddingTop, paddingRight, paddingBottom, paddingLeft    one edge's padding   the same longhands, both kits
 *   margin       the same margin on all four sides `margin`                    `margin`
 *   marginX      margin left and right             `marginInline`              `marginHorizontal`
 *   marginY      margin top and bottom             `marginBlock`               `marginVertical`
 *   marginTop, marginRight, marginBottom, marginLeft    one edge's margin (a pull or a push)   the same longhands, both kits
 *   top, right, bottom, left    an offset from the positioned parent's edge    the same, both kits (the kit says `position`)
 *   inset        the same offset on all four edges `inset`                     `top` + `right` + `bottom` + `left`
 *   zIndex       the stacking order (`$z.menu`)    `zIndex`                    `zIndex`
 *   gap          space between children            `gap`                       `gap`
 *   radius       corner radius                     `borderRadius`              `borderRadius`
 *   radiusTop, radiusBottom      the two top, or the two bottom, corners       `border<Top|Bottom><Left|Right>Radius`, both kits
 *   radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft    one corner     `border<Corner>Radius`, both kits
 *   font         the family (`$font.sans`)         `fontFamily`                `font(…, face)`: the family's file
 *   weight       the weight (`$font.weightSemibold`) `fontWeight`              `font(weight)`: the weight's file; `none` leaves it unset
 *   size         the font size                     `fontSize`                  `fontSize`
 *   line         the line height                   `lineHeight`                `lineHeight`
 *   tracking     letter spacing (`$tracking.caps`) `letterSpacing`             `letterSpacing`, in points (`em` × font size)
 *   shadow       a shadow token                    `boxShadow`                 `boxShadow`
 *   ring         an inset 1px ring in a colour     an inset `0 0 0 <border.wHairline> colour` in `boxShadow`, the same on the phone.
 *                Over a 1px border it makes the 2px focus edge without moving the text.
 *   halo         a second shadow token             a shadow in `boxShadow`, the same on the phone.
 *                Shadows stack with one rule, top first: `halo`, then `ring`, then `shadow`, joined in one `boxShadow`
 *                (a focus ring over a card's own shadow). `none` on any of the three leaves it out of the stack;
 *                `shadow: none` alone is `box-shadow: none` on the web; the phone writes no shadow.
 *   borderWidth  the edge's width                  `borderStyle: solid` + `borderWidth`  `borderWidth`
 *   borderColor  the edge's colour                 `borderColor`               `borderColor`
 *   borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth    one edge's width     `border<Side>Style: solid` + `border<Side>Width`, both kits
 *   borderTopColor, borderRightColor, borderBottomColor, borderLeftColor    one edge's colour    `border<Side>Color`, both kits
 *                A single edge is laid over `borderWidth` / `borderColor`, whichever layer wrote which (the web writes the shorthand first).
 *   outlineWidth, outlineColor, outlineOffset   an outline outside the edge (forced-colours focus)   `outlineStyle: solid` + `outlineWidth`,
 *                `outlineColor`, `outlineOffset`; web and desktop only: the phone has no outline and drops all three
 *   opacity      an opacity token                  `opacity`                   `opacity`
 *   placeholder  a text input's placeholder colour not a style on the web (the kit's stylesheet draws it)   RN `placeholderTextColor`
 *
 * Typography keys (`fg`, `font`, `weight`, `size`, `line`, `tracking`, `placeholder`) are inherited on
 * the web by what is inside the part. React Native's `Text` inherits nothing, so its reader returns
 * them apart, as `text`, and the kit puts them on the `Text` it draws (see `recipe.ts` in each kit).
 */
export const STYLE_KEYS = [
  "bg",
  "fg",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "square",
  "padding",
  "paddingX",
  "paddingY",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginX",
  "marginY",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "zIndex",
  "gap",
  "radius",
  "radiusTop",
  "radiusBottom",
  "radiusTopLeft",
  "radiusTopRight",
  "radiusBottomRight",
  "radiusBottomLeft",
  "font",
  "weight",
  "size",
  "line",
  "tracking",
  "shadow",
  "ring",
  "halo",
  "borderWidth",
  "borderColor",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineWidth",
  "outlineColor",
  "outlineOffset",
  "opacity",
  "placeholder",
] as const;
export type StyleKey = (typeof STYLE_KEYS)[number];

export type TokenStyle = { [K in StyleKey]?: StyleValue };

/** What a component can be in. The kit decides when each is on (`hover` only where there is a pointer, `focus` only for the keyboard). */
export type StateKey = "hover" | "pressed" | "focus" | "disabled" | "on" | "loading" | "invalid" | "readOnly";
export const STATE_KEYS: readonly StateKey[] = ["hover", "pressed", "focus", "disabled", "on", "loading", "invalid", "readOnly"];
/** One state, or two joined with `+` that apply only when both are on: `"invalid+focus"`. */
export type StateCombo = StateKey | `${StateKey}+${StateKey}`;
export type StateStyles = { [S in StateCombo]?: TokenStyle };

/** A variant value's style, and what changes while that value is on and the component is in a state (`ink` → `hover`). */
export type VariantStyle = TokenStyle & { states?: StateStyles };

/** Base, variants and states: the same three layers for a part, and for one platform's changes to it. */
export interface PartLayers {
  base?: TokenStyle;
  /** Component prop → its value → style. The prop names and values are the documented ones (`pnpm check recipes` compares them with the docs' `options`). A boolean prop's values are `"true"` and `"false"`. */
  variants?: Record<string, Record<string, VariantStyle>>;
  states?: StateStyles;
}

export interface PartRecipe extends PartLayers {
  /** The platforms that draw this part, when not all of them (a keyboard hint is on the web and desktop, not the phone). */
  on?: readonly Platform[];
  /** What one platform (`mobile`) or one OS (`android`) does differently. Laid over everything above. */
  platforms?: Partial<Record<Platform | OS, PartLayers>>;
}

export interface Recipe<P extends string = string> {
  /** The component's parts, outermost first: each one is drawn with `data-af-part` on the web and a `testID` (`<id>.<part>`) on the phone. */
  parts: readonly P[];
  /** A part with no entry takes nothing from the tokens. */
  styles: { [K in P]?: PartRecipe };
  /**
   * Tokens the kit reads for behaviour, not for a style: the distance a switch's thumb travels, which
   * the web turns into a `translateX` and the phone into an `Animated` interpolation. The check lets
   * the kit read these and nothing else outside the recipe (but `space`, `duration` and `ease`).
   */
  reads?: readonly TokenRef[];
}

/**
 * Names the parts once and types the rest against them. The type it returns is the recipe as written (a `const` generic), so
 * `typeof recipes.button` knows its parts, its variant props and values, its states and its platform entries: what a theme's
 * `RecipeOverride` is typed against. A `styles` key that is not in `parts` does not compile.
 */
export function defineRecipe<const P extends string, const S extends { [K in P]?: PartRecipe }>(recipe: {
  parts: readonly P[];
  styles: S & { [K in Exclude<keyof S, P>]: never };
  reads?: readonly TokenRef[];
}): { parts: readonly P[]; styles: S; reads?: readonly TokenRef[] } {
  return recipe;
}

/* ---------- a theme's override of a recipe ---------- */

/** A recipe's parts: `"root" | "icon" | …`. */
export type RecipePart<R> = R extends { parts: readonly (infer P)[] } ? P & string : never;

/** Every layer set of a recipe, its parts' own and their platform entries', as a union. */
type LayersOf<R> = R extends { styles: infer S }
  ? { [K in keyof S]-?: NonNullable<S[K]> | (NonNullable<S[K]> extends { platforms: infer Pl } ? NonNullable<Pl[keyof Pl]> : never) }[keyof S]
  : never;
/** The `variants` objects of those layers, as a union. */
type VariantsOf<R> = LayersOf<R> extends infer L ? (L extends { variants: infer V } ? V : never) : never;
/** A key as it stands in a recipe: a value key `1` is the prop value `"1"`. */
type KeyText<K> = K extends string ? K : K extends number ? `${K}` : never;

/** The props a recipe chooses a variant by, on any part or platform: `"variant" | "size"` for Button. */
export type RecipeVariantProp<R> = VariantsOf<R> extends infer V ? (V extends unknown ? KeyText<keyof V> : never) : never;
/** The values a recipe names for one of those props, on any part or platform: `"primary" | "secondary" | …`. */
export type RecipeVariantValue<R, Prop extends string> = VariantsOf<R> extends infer V ? (V extends { [K in Prop]: infer Vals } ? KeyText<keyof Vals> : never) : never;

/**
 * One layer set of an override: `base`, `variants` (only the recipe's props and the values it names for them; any part may take
 * any of them, as `recipeLayers` reads a prop on every part) and `states` (any `StateCombo`), each a `TokenStyle`.
 */
export interface OverrideLayers<R> {
  base?: TokenStyle;
  variants?: [RecipeVariantProp<R>] extends [never] ? never : { [Prop in RecipeVariantProp<R>]?: { [V in RecipeVariantValue<R, Prop>]?: VariantStyle } };
  states?: StateStyles;
}

/**
 * What a theme may change in recipe `R`, by part: the layers above, and `platforms` (a platform or an OS key) holding the same
 * layers. It cannot invent a part, a variant prop or a value (new variant values are out of scope), nor say `on` or `reads`.
 * A key here replaces the recipe's key at the same part, layer, variant value, state and platform; `"none"` removes it.
 */
export type RecipeOverride<R> = { [P in RecipePart<R>]?: OverrideLayers<R> & { platforms?: { [K in Platform | OS]?: OverrideLayers<R> } } };

/* ---------- reading a recipe ---------- */

export interface RecipeContext {
  platform: Platform;
  os: OS;
  /** The props that choose a variant: `{ variant: "primary", size: "md" }`. A value no entry names adds nothing. */
  variants?: Readonly<Record<string, string | number | boolean | null | undefined>>;
  /** The states that are on. */
  state?: Readonly<Partial<Record<StateKey, boolean>>>;
}

const isOn = (combo: string, ctx: RecipeContext): boolean => combo.split("+").every((s) => ctx.state?.[s as StateKey] && !(s === "hover" && ctx.platform === "mobile"));

function stateLayers(states: StateStyles | undefined, ctx: RecipeContext, out: TokenStyle[]) {
  for (const [combo, style] of Object.entries(states ?? {})) if (style && isOn(combo, ctx)) out.push(style);
}

function partLayers(layers: PartLayers, ctx: RecipeContext, out: TokenStyle[]) {
  if (layers.base) out.push(layers.base);
  for (const [prop, values] of Object.entries(layers.variants ?? {})) {
    const chosen = ctx.variants?.[prop];
    const entry = chosen === undefined || chosen === null ? undefined : values[String(chosen)];
    if (!entry) continue;
    const { states, ...style } = entry;
    out.push(style);
    stateLayers(states, ctx, out);
  }
  stateLayers(layers.states, ctx, out);
}

/** The platform keys that apply, general first: `mobile` then `ios`. */
export const platformKeys = (platform: Platform, os: OS): (Platform | OS)[] => [platform, os];

/** The styles that apply to a part in a context, in the order they are laid on each other. */
export function recipeLayers(part: PartRecipe | undefined, ctx: RecipeContext): TokenStyle[] {
  const out: TokenStyle[] = [];
  if (!part) return out;
  partLayers(part, ctx, out);
  for (const key of platformKeys(ctx.platform, ctx.os)) {
    const layers = part.platforms?.[key];
    if (layers) partLayers(layers, ctx, out);
  }
  return out;
}

/** The layers laid on each other: later keys replace earlier ones, a key keeps the position it first had. */
export function mergeLayers(layers: readonly TokenStyle[]): TokenStyle {
  const out: Record<string, StyleValue> = {};
  for (const layer of layers) for (const [k, v] of Object.entries(layer)) if (v !== undefined) out[k] = v;
  return out as TokenStyle;
}

/** `"$fg.body"` → `"fg.body"`; anything else (`transparent`, `none`) → `null`. */
export const tokenOf = (value: StyleValue): string | null => (value.startsWith("$") ? value.slice(1) : null);

/**
 * The font token's words for the phone, which picks a font by file: `$font.weightSemibold` is `semibold`,
 * `$font.weightNormal` is `regular` (the product's own `weightRegular` is the 450, `book`).
 */
export const WEIGHT_NAMES: Record<string, "regular" | "book" | "medium" | "semibold" | "bold" | "black"> = {
  "font.weightNormal": "regular",
  "font.weightRegular": "book",
  "font.weightMedium": "medium",
  "font.weightSemibold": "semibold",
  "font.weightBold": "bold",
  "font.weightBlack": "black",
};
export const FACE_NAMES: Record<string, "sans" | "display" | "mono"> = { "font.sans": "sans", "font.display": "display", "font.mono": "mono" };

/** One cell of the recipe, flattened: where it sits and the value it holds. `pnpm check recipes` and the catalogue's anatomy table both read this. */
export interface RecipeEntry {
  part: string;
  layer: "base" | "variant" | "state" | "platform";
  /** `variant`'s prop (`variant`) and value (`ink`), when the entry is a variant's or sits under one. */
  prop?: string;
  value?: string;
  /** The state (`hover`, `invalid+focus`), when the entry is a state's. */
  state?: string;
  /** The platform or OS key, when the entry is under `platforms`. */
  platform?: string;
  key: StyleKey;
  style: StyleValue;
}

/** Every key of every layer of a recipe, in the order written. */
export function recipeEntries(recipe: Recipe): RecipeEntry[] {
  const out: RecipeEntry[] = [];
  const add = (part: string, where: Omit<RecipeEntry, "part" | "key" | "style">, style: TokenStyle | undefined) => {
    for (const [key, value] of Object.entries(style ?? {})) if (value !== undefined && key !== "states") out.push({ part, ...where, key: key as StyleKey, style: value });
  };
  const layers = (part: string, l: PartLayers, platform?: string) => {
    const at = platform ? { platform } : {};
    add(part, { layer: platform ? "platform" : "base", ...at }, l.base);
    for (const [prop, values] of Object.entries(l.variants ?? {})) {
      for (const [value, { states, ...style }] of Object.entries(values)) {
        add(part, { layer: platform ? "platform" : "variant", prop, value, ...at }, style);
        for (const [state, s] of Object.entries(states ?? {})) add(part, { layer: platform ? "platform" : "variant", prop, value, state, ...at }, s);
      }
    }
    for (const [state, s] of Object.entries(l.states ?? {})) add(part, { layer: platform ? "platform" : "state", state, ...at }, s);
  };
  for (const part of recipe.parts) {
    const p = (recipe.styles as Record<string, PartRecipe | undefined>)[part];
    if (!p) continue;
    layers(part, p);
    for (const [platform, l] of Object.entries(p.platforms ?? {})) if (l) layers(part, l, platform);
  }
  return out;
}
