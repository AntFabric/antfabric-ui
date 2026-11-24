import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { FACE_NAMES, WEIGHT_NAMES, mergeLayers, recipeFor, recipeLayers, tokenOf, type NativeTokens, type Recipe, type RecipeContext, type RecipePart, type StyleKey, type StyleValue, type TokenStyle, type recipes } from "@antfabric/ui-core";
import { useTheme } from "../theme";
import { font } from "./type";

/**
 * A component's recipe as React Native styles, one `{ view, text }` per part, over `useTheme().t`.
 *
 *   const r = useRecipe(buttonRecipe, { variants: { variant, size }, state: { pressed: press.pressed, focus: press.focused, disabled: press.disabled } });
 *   <Pressable style={[r.root.view, style]}><Text style={r.root.text}>
 *
 * `view` is what a `View` takes; `text` is the typography (`color`, the font file for the weight, `fontSize`, `lineHeight`,
 * `letterSpacing`) for the `Text` the kit draws, because a React Native `Text` inherits nothing: a part's type is on the part,
 * as on the web, and the kit puts it where the words are. `text.placeholderTextColor` is a `TextInput`'s prop, not a style.
 *
 * Which layers apply and in what order is `recipeLayers` in core, shared with the web's reader; hover is dropped there.
 * What is here is the one table saying what each vocabulary key is as a phone style. A result is made once per
 * (tokens, recipe, part, variants, states) and reused, the way `createStyles` builds a sheet once per scheme.
 */
export interface PartStyle {
  view: ViewStyle;
  text: TextStyle & { color?: string; placeholderTextColor?: string };
}

const at = (t: NativeTokens, path: string): string | number | undefined => {
  let v: unknown = t;
  for (const key of path.split(".")) v = (v as Record<string, unknown> | undefined)?.[key];
  return typeof v === "string" || typeof v === "number" ? v : undefined;
};

/** The phone has no outline, so the three outline keys are dropped (the web draws them for forced colours). */
const NO_NATIVE = new Set<StyleKey>(["outlineWidth", "outlineColor", "outlineOffset"]);

/** One merged style as phone styles. Keys keep the order the layers first wrote them. */
function toNative(style: TokenStyle, t: NativeTokens): PartStyle {
  const view: Record<string, unknown> = {};
  const text: Record<string, unknown> = {};
  const value = (v: StyleValue): string | number | undefined => {
    const path = tokenOf(v);
    return path ? at(t, path) : v === "none" ? undefined : v;
  };
  for (const [key, v] of Object.entries(style) as [StyleKey, StyleValue][]) {
    if (NO_NATIVE.has(key)) continue;
    const x = value(v);
    if (x === undefined) continue;
    switch (key) {
      case "bg": view.backgroundColor = x; break;
      case "fg": text.color = x; break;
      case "square": view.width = x; view.height = x; break;
      case "paddingX": view.paddingHorizontal = x; break;
      case "paddingY": view.paddingVertical = x; break;
      case "marginX": view.marginHorizontal = x; break;
      case "marginY": view.marginVertical = x; break;
      case "inset": view.top = x; view.right = x; view.bottom = x; view.left = x; break;
      case "radius": view.borderRadius = x; break;
      case "radiusTop": view.borderTopLeftRadius = x; view.borderTopRightRadius = x; break;
      case "radiusBottom": view.borderBottomLeftRadius = x; view.borderBottomRightRadius = x; break;
      case "radiusTopLeft": view.borderTopLeftRadius = x; break;
      case "radiusTopRight": view.borderTopRightRadius = x; break;
      case "radiusBottomRight": view.borderBottomRightRadius = x; break;
      case "radiusBottomLeft": view.borderBottomLeftRadius = x; break;
      // One `boxShadow` for the three: the stack is worked out below.
      case "shadow": case "ring": case "halo": break;
      case "size": text.fontSize = x; break;
      case "line": text.lineHeight = x; break;
      case "tracking": text.letterSpacing = x; break;
      case "placeholder": text.placeholderTextColor = x; break;
      // The family and the weight are one lookup: the phone picks a font by file.
      case "font": case "weight": break;
      default: view[key] = x;
    }
  }
  // The shadow stack, top first: `halo`, `ring`, `shadow`.
  const stack = (["halo", "ring", "shadow"] as const).flatMap((k) => {
    const x = style[k] === undefined ? undefined : value(style[k]!);
    return x === undefined ? [] : [k === "ring" ? `inset 0 0 0 ${t.border.width.hairline}px ${x}` : String(x)];
  });
  if (stack.length) view.boxShadow = stack.join(", ");
  // `none` leaves a key unset, and that includes the weight: only a weight or a family the recipe names picks a font file.
  const weight = style.weight === undefined || style.weight === "none" ? undefined : WEIGHT_NAMES[tokenOf(style.weight) ?? ""] ?? "regular";
  const face = style.font === undefined || style.font === "none" ? undefined : FACE_NAMES[tokenOf(style.font) ?? ""] ?? "sans";
  if (weight !== undefined || face !== undefined) Object.assign(text, font(weight ?? "regular", face ?? "sans", t));
  // `0.08em` is a size in em; a phone's letter spacing is points.
  if (typeof text.letterSpacing === "string") text.letterSpacing = typeof text.fontSize === "number" ? parseFloat(text.letterSpacing) * text.fontSize : undefined;
  // Registered, like `createStyles`' own: React Native Web turns a registered style into classes and an unregistered one into inline
  // declarations, and an inline one beats a class however the array is ordered, so a recipe left unregistered could not be
  // overridden by the kit's own style after it (a `paddingLeft` after a `paddingHorizontal`). On the phone this is the identity.
  return { view: StyleSheet.create({ view: view as ViewStyle }).view, text: text as PartStyle["text"] };
}

/** The ids of the components that have a recipe: the docs ids. */
export type RecipeId = keyof typeof recipes;

/**
 * The per-instance escape hatch: `styles={{ root: { borderRadius: 2 }, label: { color: "#fff" } }}`, one style per part of the
 * component's recipe. Text keys (`color`, `fontSize`, `fontFamily`, `lineHeight`, `textAlign`…) go to the part's `Text`, the rest to its
 * `View`, as the recipe's own do. Every recipe-backed component takes it, typed `PartStyles<"<its id>">`, and hands it to `useRecipe`.
 *
 * For one part, the order is, last wins: the recipe, the theme's recipe override, the kit's own inline styles for the part (a prop's or a
 * state's: `full`, a disabled opacity, a size that follows a prop), `styles[part]`, and `style` on the root. `styles` is the escape hatch,
 * so it beats anything the kit computes for the part. `check` holds every component to it (`stylesProofTodo` in reports/generic.json lists
 * the ones that are not there yet).
 */
export type PartStyles<Id extends RecipeId> = Partial<Record<RecipePart<(typeof recipes)[Id]>, ViewStyle & TextStyle>>;

/** The keys of a `TextStyle` that a `View` does not take: in `styles`, these go to the part's `text`. */
const TEXT_KEYS: ReadonlySet<string> = new Set([
  "color", "fontFamily", "fontSize", "fontStyle", "fontWeight", "fontVariant", "letterSpacing", "lineHeight", "textAlign", "textAlignVertical",
  "textDecorationLine", "textDecorationStyle", "textDecorationColor", "textShadowColor", "textShadowOffset", "textShadowRadius", "textTransform",
  "includeFontPadding", "writingDirection", "verticalAlign",
]);

/** The longhands each shorthand covers: on the phone a specific key beats a general one whatever the order, so a shorthand in `styles` removes the recipe's longhands of its family, or the recipe's would undo it. */
const COVERS: Record<string, RegExp> = {
  padding: /^padding(?:Horizontal|Vertical|Top|Right|Bottom|Left|Start|End)$/,
  paddingHorizontal: /^padding(?:Left|Right|Start|End)$/,
  paddingVertical: /^padding(?:Top|Bottom)$/,
  margin: /^margin(?:Horizontal|Vertical|Top|Right|Bottom|Left|Start|End)$/,
  marginHorizontal: /^margin(?:Left|Right|Start|End)$/,
  marginVertical: /^margin(?:Top|Bottom)$/,
  borderRadius: /^border(?:Top|Bottom)(?:Left|Right)Radius$/,
  borderWidth: /^border(?:Top|Right|Bottom|Left)Width$/,
  borderColor: /^border(?:Top|Right|Bottom|Left)Color$/,
};

const overlaid = new WeakMap<object, WeakMap<PartStyle, PartStyle>>();

/**
 * `over` (a component's `styles[part]`) laid over `base` (the recipe's part): text keys onto `text`, the rest onto `view`, a key replacing
 * the same key, a shorthand replacing the recipe longhands it covers. The view is registered again (see `toNative`). Made once per
 * (the `styles[part]` object, the recipe's part), so a `styles` hoisted out of the render keeps its identity; a component with no `styles`
 * never gets here, and keeps the recipe's cached objects.
 */
function overlay(base: PartStyle, over: (ViewStyle & TextStyle) | undefined): PartStyle {
  if (!over) return base;
  let byBase = overlaid.get(over);
  if (!byBase) overlaid.set(over, (byBase = new WeakMap()));
  let made = byBase.get(base);
  if (made) return made;
  const view: Record<string, unknown> = { ...base.view };
  const text: Record<string, unknown> = { ...base.text };
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined) continue;
    const into = TEXT_KEYS.has(k) ? text : view;
    const covers = COVERS[k];
    if (covers) for (const b of Object.keys(into)) if (covers.test(b)) delete into[b];
    into[k] = v;
  }
  made = { view: StyleSheet.create({ view: view as ViewStyle }).view, text: text as PartStyle["text"] };
  byBase.set(base, made);
  return made;
}

type Cache = WeakMap<NativeTokens, WeakMap<Recipe<string>, Map<string, PartStyle>>>;
const cache: Cache = new WeakMap();

/** What `recipeStyles` made each result from, for `partStyle`: the recipe's and the theme's part styles, and the `styles` it was given. */
const made = new WeakMap<object, { base: Record<string, PartStyle>; styles: Partial<Record<string, ViewStyle & TextStyle>> | undefined }>();

/**
 * One part's style with the precedence the library promises, last wins: the recipe, the theme's override (`r`, as `useRecipe` made it), the
 * kit's own inline styles for the part (`inline.view` for the `View`, `inline.text` for the `Text`), then the component's `styles[part]`.
 * The kit's `style` on the root comes after, in the style array:
 *
 *   const root = partStyle(r, "root", { view: full && { width: "100%" } });
 *   <Pressable style={[root.view, style]}><Text style={root.text}>
 *
 * Use it for every part the kit styles inline. A part the kit does not style needs nothing: `r.<part>` already carries `styles[part]`. Given
 * no `styles`, the result is `r.<part>` with the inline over it, as `[r.<part>.view, inline]` drew it. `r` must be what `useRecipe`
 * returned; anything else is treated as the recipe's style alone. The result is registered like the recipe's own (see `toNative`).
 */
export function partStyle<P extends string>(r: Record<P, PartStyle>, part: P, inline?: { view?: StyleProp<ViewStyle>; text?: StyleProp<TextStyle> }): PartStyle {
  const from = made.get(r);
  const base = (from ? from.base[part] : r[part])!;
  const view = inline?.view ? StyleSheet.flatten([base.view, inline.view]) : undefined;
  const text = inline?.text ? StyleSheet.flatten([base.text, inline.text]) : undefined;
  const kit: PartStyle = view || text ? { view: view ? StyleSheet.create({ view: view as ViewStyle }).view : base.view, text: (text ?? base.text) as PartStyle["text"] } : base;
  const over = from?.styles?.[part];
  return over ? overlay(kit, over) : kit;
}

/**
 * The recipe in a context, per part. Pure: `useRecipe` is this with the theme the component is drawn in. `r.<part>` is the recipe, the
 * theme's override and `styles[part]`: a part the kit styles no further is drawn from it as it is. A part the kit also styles inline goes
 * through `partStyle`, which puts `styles[part]` after those.
 */
export function recipeStyles<P extends string>(recipe: Recipe<P>, ctx: RecipeContext, t: NativeTokens, styles?: Partial<Record<P, ViewStyle & TextStyle>>): Record<P, PartStyle> {
  let byRecipe = cache.get(t);
  if (!byRecipe) cache.set(t, (byRecipe = new WeakMap()));
  let byKey = byRecipe.get(recipe as Recipe<string>);
  if (!byKey) byRecipe.set(recipe as Recipe<string>, (byKey = new Map()));
  const on = Object.entries(ctx.state ?? {}).filter(([, v]) => v).map(([k]) => k).sort().join(",");
  const key = `${ctx.os}|${JSON.stringify(ctx.variants ?? {})}|${on}`;
  const base = {} as Record<P, PartStyle>;
  const out = {} as Record<P, PartStyle>;
  for (const part of recipe.parts) {
    const k = `${part}|${key}`;
    let style = byKey.get(k);
    if (!style) byKey.set(k, (style = toNative(mergeLayers(recipeLayers(recipe.styles[part], ctx)), t)));
    base[part] = style;
    out[part] = styles ? overlay(style, styles[part]) : style;
  }
  made.set(out, { base, styles });
  return out;
}

export interface RecipeInput {
  /** The props that choose a variant: `{ variant, size }`. */
  variants?: RecipeContext["variants"];
  /** The states that are on: `{ pressed: press.pressed, focus: press.focused, disabled: press.disabled }`. Hover is accepted and ignored. */
  state?: RecipeContext["state"];
}

/**
 * The recipe as phone styles per part: `const r = useRecipe(recipes.x, { variants, state, styles })`. `styles` is the component's `styles` prop,
 * per part. For one part, last wins: the recipe, the theme's override, the kit's own inline styles for it, `styles[part]`, then `style` on the
 * root. `r.<part>` holds the first two and `styles[part]`; draw a part the kit also styles inline with `partStyle(r, part, { view, text })` so
 * `styles` stays last. `[r.root.view, inline]` for a part that takes `styles` would let the inline beat it.
 */
export function useRecipe<P extends string>(recipe: Recipe<P>, input: RecipeInput & { styles?: Partial<Record<P, ViewStyle & TextStyle>> } = {}): Record<P, PartStyle> {
  // The theme's override for this component, merged cell by cell; the merged recipe keeps its identity, so the style cache holds.
  const { t, os, theme } = useTheme();
  const { styles, ...ctx } = input;
  return recipeStyles(recipeFor(theme, recipe), { platform: "mobile", os, ...ctx }, t, styles);
}
