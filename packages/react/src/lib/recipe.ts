import type { CSSProperties } from "react";
import { mergeLayers, recipeFor, recipeLayers, tokenOf, useDirection, type Recipe, type RecipeContext, type RecipePart, type StyleKey, type StyleValue, type TokenStyle, type recipes } from "@antfabric/ui-core";
import { usePlatform } from "../platform";
import { t } from "../tokens";
import { mirror } from "./style";

/**
 * A component's recipe as inline styles, one `CSSProperties` per part, over the token variables.
 *
 *   const r = useRecipe(buttonRecipe, { variants: { variant, size }, state: { hover: ui.hovered, pressed: ui.pressed, focus: ui.focused, disabled: ui.disabled } });
 *   <button style={css(pressable, r.root, style)}>
 *
 * Which layers apply and in what order is `recipeLayers` in core (shared with the phone's reader). What is here is
 * the one table that says what each vocabulary key is as CSS. Hover applies here and not on the phone; an `ios` or
 * `android` entry never applies, because this kit's context never names those.
 */

/** The CSS property (or properties) each vocabulary key writes. A key mapped to nothing has no CSS (`placeholder`: the kit's stylesheet draws it; `ring`, `halo` and `shadow` are one `boxShadow`, worked out in `toCss`). */
const CSS: Record<StyleKey, readonly (keyof CSSProperties)[]> = {
  bg: ["background"],
  fg: ["color"],
  width: ["width"],
  height: ["height"],
  minWidth: ["minWidth"],
  maxWidth: ["maxWidth"],
  minHeight: ["minHeight"],
  maxHeight: ["maxHeight"],
  square: ["width", "height"],
  padding: ["padding"],
  paddingX: ["paddingInline"],
  paddingY: ["paddingBlock"],
  paddingTop: ["paddingTop"],
  paddingRight: ["paddingRight"],
  paddingBottom: ["paddingBottom"],
  paddingLeft: ["paddingLeft"],
  margin: ["margin"],
  marginX: ["marginInline"],
  marginY: ["marginBlock"],
  marginTop: ["marginTop"],
  marginRight: ["marginRight"],
  marginBottom: ["marginBottom"],
  marginLeft: ["marginLeft"],
  top: ["top"],
  right: ["right"],
  bottom: ["bottom"],
  left: ["left"],
  inset: ["inset"],
  zIndex: ["zIndex"],
  gap: ["gap"],
  radius: ["borderRadius"],
  radiusTop: ["borderTopLeftRadius", "borderTopRightRadius"],
  radiusBottom: ["borderBottomLeftRadius", "borderBottomRightRadius"],
  radiusTopLeft: ["borderTopLeftRadius"],
  radiusTopRight: ["borderTopRightRadius"],
  radiusBottomRight: ["borderBottomRightRadius"],
  radiusBottomLeft: ["borderBottomLeftRadius"],
  font: ["fontFamily"],
  weight: ["fontWeight"],
  size: ["fontSize"],
  line: ["lineHeight"],
  tracking: ["letterSpacing"],
  shadow: ["boxShadow"],
  ring: ["boxShadow"],
  halo: ["boxShadow"],
  // An edge is always drawn solid: the longhands, so a state that changes only its colour does not fight a `border` shorthand.
  borderWidth: ["borderStyle", "borderWidth"],
  borderColor: ["borderColor"],
  borderTopWidth: ["borderTopStyle", "borderTopWidth"],
  borderRightWidth: ["borderRightStyle", "borderRightWidth"],
  borderBottomWidth: ["borderBottomStyle", "borderBottomWidth"],
  borderLeftWidth: ["borderLeftStyle", "borderLeftWidth"],
  borderTopColor: ["borderTopColor"],
  borderRightColor: ["borderRightColor"],
  borderBottomColor: ["borderBottomColor"],
  borderLeftColor: ["borderLeftColor"],
  outlineWidth: ["outlineStyle", "outlineWidth"],
  outlineColor: ["outlineColor"],
  outlineOffset: ["outlineOffset"],
  opacity: ["opacity"],
  placeholder: [],
};

/** A token reference as the kit's variable (`"$color.text.body"` → `var(--af-color-text-body)`). */
export function tokenVar(path: string): string {
  let at: unknown = t;
  for (const key of path.split(".")) at = (at as Record<string, unknown> | undefined)?.[key];
  if (typeof at !== "string") throw new Error(`recipe: no token ${path}`);
  return at;
}

const valueOf = (key: StyleKey, v: StyleValue): string | undefined => {
  const path = tokenOf(v);
  if (path) return key === "ring" ? `inset 0 0 0 ${t.border.width.hairline} ${tokenVar(path)}` : tokenVar(path);
  return v === "none" ? undefined : v;
};

/**
 * Shorthand before longhand, as CSS reads it: a longhand written by a later layer must not be undone by a shorthand an earlier
 * one wrote after it in the object. 0 is a shorthand or an unrelated property, 1 is `paddingInline` / `marginBlock` (a shorthand
 * of the logical edges, a longhand of `padding`), 2 is one edge or corner.
 */
const rankOf = (prop: string): 0 | 1 | 2 => {
  if (/^(?:padding|margin)(?:Inline|Block)$/.test(prop)) return 1;
  if (
    /^(?:padding|margin|border)(?:Top|Right|Bottom|Left)/.test(prop) ||
    /^(?:padding|margin)(?:Inline|Block)(?:Start|End)$/.test(prop) ||
    /^border(?:Top|Bottom)(?:Left|Right)Radius$/.test(prop) ||
    /^(?:top|right|bottom|left)$/.test(prop)
  )
    return 2;
  return 0;
};

/** One merged style as CSS, keys in the order the layers first wrote them, shorthands before the longhands that refine them. */
export function toCss(style: TokenStyle): CSSProperties {
  const out: Record<string, string> = {};
  const both = style.paddingX !== undefined && style.paddingY !== undefined && style.paddingX !== "none" && style.paddingY !== "none";
  let shadowAt = false;
  for (const [key, v] of Object.entries(style) as [StyleKey, StyleValue][]) {
    if (key === "shadow" || key === "ring" || key === "halo") {
      if (!shadowAt) out.boxShadow = ""; // holds the place: the stack is worked out below, once
      shadowAt = true;
      continue;
    }
    const value = valueOf(key, v);
    if (value === undefined) continue;
    if (both && (key === "paddingX" || key === "paddingY")) {
      // `padding: <block> <inline>`: one declaration for the two, written where the first of them was.
      if (!("padding" in out)) out.padding = `${valueOf("paddingY", style.paddingY!)} ${valueOf("paddingX", style.paddingX!)}`;
      continue;
    }
    for (const prop of CSS[key]) out[prop] = /Style$/.test(prop) ? "solid" : value;
  }
  if (shadowAt) {
    // The stack, top first: `halo`, `ring`, `shadow`. A lone `shadow: none` is the explicit `none`.
    const stack = (["halo", "ring", "shadow"] as const).flatMap((k) => (style[k] === undefined ? [] : [valueOf(k, style[k]!)])).filter((x): x is string => x !== undefined);
    if (stack.length) out.boxShadow = stack.join(", ");
    else if (style.shadow === "none") out.boxShadow = "none";
    else delete out.boxShadow;
  }
  const entries = Object.entries(out);
  if (entries.some(([k]) => rankOf(k) > 0)) entries.sort((a, b) => rankOf(a[0]) - rankOf(b[0]));
  return Object.fromEntries(entries) as CSSProperties;
}

/** The ids of the components that have a recipe: the docs ids. */
export type RecipeId = keyof typeof recipes;

/**
 * The per-instance escape hatch: `styles={{ root: { borderRadius: 2 }, icon: { opacity: 0.5 } }}`, one `CSSProperties` per part of the
 * component's recipe. Every recipe-backed component takes it, typed `PartStyles<"<its id>">`, and hands it to `useRecipe`.
 *
 * For one part, the order is, last wins: the recipe, the theme's recipe override, the kit's own inline styles for the part (a prop's or a
 * state's: `full`, a disabled cursor, a size that follows a prop), `styles[part]`, and `style` on the root. `styles` is the escape hatch,
 * so it beats anything the kit computes for the part. `check` holds every component to it (`stylesProofTodo` in reports/generic.json lists
 * the ones that are not there yet).
 */
export type PartStyles<Id extends RecipeId> = Partial<Record<RecipePart<(typeof recipes)[Id]>, CSSProperties>>;

/** The longhands each shorthand covers: a shorthand in `styles` replaces the recipe's longhands of its family, so it is never undone by them. */
const COVERS: Record<string, RegExp> = {
  padding: /^padding(?:Inline|Block|Top|Right|Bottom|Left)/,
  paddingInline: /^padding(?:Left|Right)$/,
  paddingBlock: /^padding(?:Top|Bottom)$/,
  margin: /^margin(?:Inline|Block|Top|Right|Bottom|Left)/,
  marginInline: /^margin(?:Left|Right)$/,
  marginBlock: /^margin(?:Top|Bottom)$/,
  borderRadius: /^border(?:Top|Bottom)(?:Left|Right)Radius$/,
  borderWidth: /^border(?:Top|Right|Bottom|Left)Width$/,
  borderStyle: /^border(?:Top|Right|Bottom|Left)Style$/,
  borderColor: /^border(?:Top|Right|Bottom|Left)Color$/,
  border: /^border(?:Top|Right|Bottom|Left)?(?:Width|Style|Color)$/,
  outline: /^outline(?:Width|Style|Color)$/,
  inset: /^(?:top|right|bottom|left)$/,
};

/** A value's parts at the top level (`calc(1px + 2px) 4px` is two), or undefined for one that cannot be split safely (`a / b`). */
const partsOf = (v: unknown): string[] | undefined => {
  const parts: string[] = [];
  let depth = 0;
  let at = "";
  for (const ch of String(v)) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (at) parts.push(at);
      at = "";
    } else at += ch;
  }
  if (at) parts.push(at);
  return parts.length > 0 && parts.length <= 4 && !parts.includes("/") ? parts : undefined;
};

/** `a`, `a b`, `a b c` and `a b c d` as the four sides CSS reads them as (top, right, bottom, left; top-left, top-right, bottom-right, bottom-left). A lone number stays a number. */
const sides = (v: unknown): [unknown, unknown, unknown, unknown] | undefined => {
  const p = partsOf(v);
  if (!p) return undefined;
  if (p.length === 1) return [v, v, v, v];
  const [a, b, c = a, d = b] = p;
  return [a, b, c, d];
};

/**
 * The shorthands `toCss` writes, each as the longhands it stands for, and the family of longhands in `styles` that makes it necessary.
 * Recipe values are one token or a `Y X` pair, so each is a plain box expansion; `background` is always a colour.
 */
const SHORTHANDS: Record<string, { family: RegExp; expand: (v: unknown) => Record<string, unknown> | undefined }> = {
  background: { family: /^background[A-Z]/, expand: (v) => ({ backgroundColor: v }) },
  padding: { family: /^padding[A-Z]/, expand: (v) => box("padding", ["Top", "Right", "Bottom", "Left"], v) },
  paddingInline: { family: /^padding(?:Left|Right|InlineStart|InlineEnd)$/, expand: (v) => pair("padding", "Inline", v) },
  paddingBlock: { family: /^padding(?:Top|Bottom|BlockStart|BlockEnd)$/, expand: (v) => pair("padding", "Block", v) },
  margin: { family: /^margin[A-Z]/, expand: (v) => box("margin", ["Top", "Right", "Bottom", "Left"], v) },
  marginInline: { family: /^margin(?:Left|Right|InlineStart|InlineEnd)$/, expand: (v) => pair("margin", "Inline", v) },
  marginBlock: { family: /^margin(?:Top|Bottom|BlockStart|BlockEnd)$/, expand: (v) => pair("margin", "Block", v) },
  inset: { family: /^(?:top|right|bottom|left)$/, expand: (v) => box("", ["top", "right", "bottom", "left"], v) },
  gap: { family: /^(?:row|column)Gap$/, expand: (v) => { const p = partsOf(v); return p && p.length <= 2 ? { rowGap: v, columnGap: p[1] ?? v } : undefined; } },
  borderRadius: { family: /^border(?:Top|Bottom)(?:Left|Right)Radius$/, expand: (v) => box("border", ["TopLeft", "TopRight", "BottomRight", "BottomLeft"], v, "Radius") },
  borderWidth: { family: /^border(?:Top|Right|Bottom|Left)Width$/, expand: (v) => box("border", ["Top", "Right", "Bottom", "Left"], v, "Width") },
  borderStyle: { family: /^border(?:Top|Right|Bottom|Left)Style$/, expand: (v) => box("border", ["Top", "Right", "Bottom", "Left"], v, "Style") },
  borderColor: { family: /^border(?:Top|Right|Bottom|Left)Color$/, expand: (v) => box("border", ["Top", "Right", "Bottom", "Left"], v, "Color") },
};

function box(prefix: string, names: string[], v: unknown, suffix = ""): Record<string, unknown> | undefined {
  const four = sides(v);
  if (!four) return undefined;
  return Object.fromEntries(names.map((n, i) => [prefix ? `${prefix}${n}${suffix}` : n, four[i]]));
}

function pair(prefix: string, axis: "Inline" | "Block", v: unknown): Record<string, unknown> | undefined {
  const p = partsOf(v);
  if (!p || p.length > 2) return undefined;
  return p.length === 1 ? { [`${prefix}${axis}Start`]: v, [`${prefix}${axis}End`]: v } : { [`${prefix}${axis}Start`]: p[0], [`${prefix}${axis}End`]: p[1] };
}

/**
 * The recipe's shorthands that a longhand in `over` would fight, written as longhands for this part. A shorthand and a longhand of its
 * family in one style object is a collision on update: React sets the shorthand again when the state changes its value, and that resets
 * the longhand `styles` set (`background` over `backgroundColor`), and warns of the conflict. Only a shorthand that `over` refines is
 * expanded, and only when `styles` is given, so a component with no `styles` draws what it always drew. A longhand the recipe also wrote
 * (`radiusTop` beside `radius`) keeps its value.
 */
function expandShorthands(base: CSSProperties, over: CSSProperties): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const overKeys = Object.entries(over).filter(([, v]) => v !== undefined).map(([k]) => k);
  const written = new Set(Object.keys(base));
  for (const [k, v] of Object.entries(base)) {
    const rule = SHORTHANDS[k];
    const expanded = rule && !overKeys.includes(k) && overKeys.some((o) => rule.family.test(o)) ? rule.expand(v) : undefined;
    if (!expanded) {
      out[k] = v;
      continue;
    }
    for (const [long, value] of Object.entries(expanded)) if (!written.has(long)) out[long] = value;
  }
  return out;
}

/**
 * `over` (a component's `styles[part]`) laid over `base` (the recipe's CSS for the part): a key in `over` replaces the same key in `base`; a
 * longhand in `over` refines a shorthand in `base` (the shorthand is first written as its longhands, `expandShorthands`; shorthands are
 * written first, as `toCss` orders them); a shorthand in `over` replaces the `base` longhands it covers. Neither input is changed.
 */
export function overlayCss(base: CSSProperties, over: CSSProperties | undefined): CSSProperties {
  if (!over) return base;
  const out = expandShorthands(base, over);
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined) continue;
    const covers = COVERS[k];
    if (covers) for (const b of Object.keys(out)) if (b !== k && covers.test(b)) delete out[b];
    out[k] = v;
  }
  const entries = Object.entries(out);
  if (entries.some(([k]) => rankOf(k) > 0)) entries.sort((a, b) => rankOf(a[0]) - rankOf(b[0]));
  return Object.fromEntries(entries) as CSSProperties;
}

/** What `recipeStyles` made each result from, for `partStyle`: the recipe's and the theme's CSS per part, and the `styles` it was given. */
const made = new WeakMap<object, { base: Record<string, CSSProperties>; styles: Partial<Record<string, CSSProperties>> | undefined }>();

/**
 * The recipe in a context, as CSS per part. Pure: `useRecipe` is this with the platform and the interaction the component has.
 * `r.<part>` is the recipe, the theme's override and `styles[part]`: a part the kit styles no further is drawn from it as it is. A part
 * the kit also styles inline goes through `partStyle`, which puts `styles[part]` after those.
 */
export function recipeStyles<P extends string>(recipe: Recipe<P>, ctx: RecipeContext, styles?: Partial<Record<P, CSSProperties>>, dir: "ltr" | "rtl" = "ltr"): Record<P, CSSProperties> {
  const base = {} as Record<P, CSSProperties>;
  const out = {} as Record<P, CSSProperties>;
  for (const part of recipe.parts) {
    const drawn = toCss(mergeLayers(recipeLayers(recipe.styles[part], ctx)));
    // A recipe names physical sides (`paddingLeft`, `radiusTopLeft`); a right-to-left tree draws them mirrored. `styles` is the product's, as written.
    base[part] = dir === "rtl" ? mirror(drawn) : drawn;
    out[part] = overlayCss(base[part], styles?.[part]);
  }
  made.set(out, { base, styles });
  return out;
}

/**
 * One part's style with the precedence the library promises, last wins: the recipe, the theme's override (`r`, as `useRecipe` made it), the
 * kit's own inline styles for the part (`inline`, one or several, falsy ones skipped as `css` does), then the component's `styles[part]`.
 * The kit's `style` on the root comes after, in `css(…)`:
 *
 *   <button style={css(pressable, partStyle(r, "root", full && { width: "100%" }, disabled && { cursor: "not-allowed" }), style)}>
 *
 * Use it for every part the kit styles inline. A part the kit does not style needs nothing: `r.<part>` already carries `styles[part]`. Given
 * no `styles`, the result is `Object.assign({}, r.<part>, …inline)`, what `css(r.<part>, …inline)` wrote, so converting a part moves no pixel.
 * `r` must be what `useRecipe` returned; anything else is treated as the recipe's CSS alone.
 */
export function partStyle<P extends string>(r: Record<P, CSSProperties>, part: P, ...inline: (CSSProperties | false | null | undefined)[]): CSSProperties {
  const from = made.get(r);
  const kit: CSSProperties = Object.assign({}, from ? from.base[part] : r[part], ...inline.filter(Boolean));
  const over = from?.styles?.[part];
  return over ? overlayCss(kit, over) : kit;
}

export interface RecipeInput {
  /** The props that choose a variant: `{ variant, size }`. */
  variants?: RecipeContext["variants"];
  /** The states that are on: `{ hover: ui.hovered, pressed: ui.pressed, focus: ui.focused, disabled: ui.disabled }`. */
  state?: RecipeContext["state"];
}

/**
 * The recipe as CSS per part: `const r = useRecipe(recipes.x, { variants, state, styles })`. `styles` is the component's `styles` prop, per part.
 * For one part, last wins: the recipe, the theme's override, the kit's own inline styles for it, `styles[part]`, then `style` on the root.
 * `r.<part>` holds the first two and `styles[part]`; draw a part the kit also styles inline with `partStyle(r, part, inline)` so `styles` stays
 * last. `css(r.root, inline)` for a part that takes `styles` would let the inline beat it.
 */
export function useRecipe<P extends string>(recipe: Recipe<P>, input: RecipeInput & { styles?: Partial<Record<P, CSSProperties>> } = {}): Record<P, CSSProperties> {
  // The theme's override for this component, merged cell by cell (`recipeFor` returns the recipe itself when the theme has none).
  const { platform, os, theme } = usePlatform();
  const dir = useDirection();
  const { styles, ...ctx } = input;
  return recipeStyles(recipeFor(theme, recipe), { platform, os, ...ctx }, styles, dir);
}
