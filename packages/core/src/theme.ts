/**
 * Themes: how a product restyles the kit without forking it.
 *
 * `tokens.ts` is the complete schema with AntFabric's values, so AntFabric is the empty theme (`antfabric`, id `""`, built with `extends: null`;
 * the kits draw `neutral` when no theme is given, so AntFabric's own look is passed as `theme={themes.antfabric}`) and every
 * other theme is an override set laid over its parent. `defineTheme` builds one from its layers, in this order, a later layer's leaf
 * replacing an earlier one's:
 *
 *   extends   the parent's sets and recipes, as the parent built them: `themes.neutral` when left out, `themes.antfabric` for AntFabric's
 *             look, `null` for the schema itself (only the presets start there)
 *   brand     the tenant input (`primary`, `accent`, soft tints, `fonts`): `brandValues` per scheme into the scheme sets, its fonts into font leaves
 *   fonts     `sans`, `display`, `mono`: the family in front of the kit's stack and, for `sans` and `display`, the phone's file per weight
 *   tokens    leaves by set: `shared`, `schemes`, `profiles`, `os`
 *   recipes   per-component recipe overrides by recipe id (`ThemeRecipes`), a child's cell over its parent's; `recipeFor` lays them over a recipe
 *
 * `fg.onBrand` follows the fill: in each scheme where this theme's `brand` or `tokens` set `brand.default`, it is white or ink by contrast
 * (`onBrandFor`, WCAG 4.5:1), unless the theme's own `tokens` set `fg.onBrand` for that scheme too. A theme that leaves `brand.default`
 * alone keeps its parent's (the schema's is what `onBrandFor` gives AntFabric's coral: ink).
 *
 * Every path is checked against `tokenSource` for its set (an OS set against its platform's profile), so a typo throws here,
 * naming the theme, the layer and the path, not at render time. A value is a literal (`"#18181b"`, `6`, `"6px"`) or a primitive
 * reference (`"{primitives.color.neutral.900}"`); `sets` holds it resolved, and the stylesheet writes a reference as the
 * primitive's variable. A font file `""` is the system font: stored as given, the phone kit reads it so.
 *
 * Drawn, the theme sits over the base one layer at a time, never across layers:
 *
 *   shared (base, then theme) → scheme (base, then theme) → profile (base, then theme) → OS (base, then theme)
 *
 * so the base's Android switch still beats a theme's mobile-profile switch unless the theme sets `os.android` itself, and the
 * phone's own `radius.card` still beats a theme's shared one unless the theme sets `profiles.mobile`. `tokenValues` (the web's
 * values), `resolveTokens` (the phone's) and `themeCss` (the web's sheet) all draw it so, and `pnpm check themes` holds them equal.
 *
 * The id is `""` for a theme with no overrides and no recipes, else `<name>-<FNV-1a of its canonical sets and recipes>`: the same
 * overrides give the same id on any machine, the phone memoises on it, and the web scopes the theme's sheet by it. A theme is frozen.
 */

import { BRAND_PATHS, brandValues, onBrandFor, rgbOf, type BrandFont, type BrandTokens } from "./brand";
import { cssValue, flatten, referencedPrimitives, type Tree } from "./css";
import { primitiveMeta } from "./primitives";
import type { RecipeOverride } from "./recipe";
import { checkOverrides, mergeOverrides } from "./recipe-override";
import { assertBuilt, markBuilt } from "./theme-built";
import type { recipes } from "./recipes";
import { isReference, primitiveValue, primitiveVar, referencePath, resolveValue } from "./refs";
import { platformOf, tokens, tokenSource, type TokenSource } from "./tokens";
import { neutralInput } from "./themes/neutral";
import { PLATFORM_OS, PLATFORMS, type OS, type Platform, type Scheme } from "./types";
import { cssVarName } from "./vars";

/** Any leaf of a token subtree may be given, as a literal (`"#18181b"`, `6`, `"6px"`) or a primitive reference (`"{primitives.color.neutral.900}"`). */
export type TokenOverrides<T> = { [K in keyof T]?: T[K] extends string | number ? string | number : TokenOverrides<T[K]> };

/** The profile an OS belongs to, so an OS override is typed against that profile's tree. */
type ProfileOf<O extends OS> = O extends "browser" ? "web" : O extends "mac" | "windows" | "linux" ? "desktop" : "mobile";

export interface ThemeTokens {
  /** Values every platform and scheme share: radius, border widths, space, motion, font families. */
  shared?: TokenOverrides<TokenSource["shared"]>;
  /** Colours and shadows per scheme. */
  schemes?: Partial<Record<Scheme, TokenOverrides<TokenSource["themes"]["light"]>>>;
  /** Sizes and type per platform profile (a control is 34px on desktop, 44pt on the phone). */
  profiles?: { [P in Platform]?: TokenOverrides<TokenSource["profiles"][P]> };
  /** One OS's differences, laid over its profile (Android's switch, Windows' corners). */
  os?: { [O in OS]?: TokenOverrides<TokenSource["profiles"][ProfileOf<O>]> };
}

/** A family by name and, for the phone, by file per weight (the phone picks a font by file). `""` as a file means the system font. */
export interface ThemeFonts {
  sans?: string | BrandFont;
  display?: string | BrandFont;
  mono?: string;
}

/**
 * Per-component recipe overrides, by recipe id: what a theme changes in `recipes.button` and the rest, typed against each recipe as
 * written (its parts, variant props and values; see `RecipeOverride`). `recipeFor(theme, recipe)` lays them over the recipe, cell by
 * cell, and `defineTheme` checks them at run time too, since a theme may come from JSON.
 */
export type ThemeRecipes = { [Id in keyof typeof recipes]?: RecipeOverride<(typeof recipes)[Id]> };

export interface ThemeInput {
  /** Shown in the catalogue and in errors; part of the id. */
  name: string;
  /**
   * The theme this one starts from: its sets and recipes, over which this theme's own layers go.
   *
   * - left out: `themes.neutral`, the look the kit draws when no theme is given, so a product that only adds a brand keeps neutral's fonts, radii and page colour;
   * - `themes.antfabric` (or any other theme): that look;
   * - `null`: the schema itself (`tokens.ts`, which holds AntFabric's values), no parent. Only the presets start there; a product that wants AntFabric's look says `themes.antfabric`.
   */
  extends?: Theme | null;
  /** The tenant input as today (`primary`, `accent`, soft tints, `fonts`), expanded per scheme by `brandValues`. */
  brand?: Partial<BrandTokens>;
  fonts?: ThemeFonts;
  tokens?: ThemeTokens;
  recipes?: ThemeRecipes;
}

/** A flattened override set: dotted token path → value, references already resolved to literals. */
export type TokenSet = Readonly<Record<string, string | number>>;

export interface Theme {
  /** `""` for a theme with no overrides (AntFabric); otherwise `<name>-<hash of the canonical overrides>`, stable across runs and machines. The name is lower-cased, any other run of characters a hyphen. */
  readonly id: string;
  readonly name: string;
  readonly sets: {
    readonly shared: TokenSet;
    readonly schemes: Readonly<Partial<Record<Scheme, TokenSet>>>;
    readonly profiles: Readonly<Partial<Record<Platform, TokenSet>>>;
    readonly os: Readonly<Partial<Record<OS, TokenSet>>>;
  };
  readonly recipes: ThemeRecipes;
}

/* ---------- defineTheme ---------- */

type Value = string | number;
/** A set by its place in `Theme.sets`: `shared`, `schemes.dark`, `profiles.mobile`, `os.android`. */
type SetName = "shared" | `schemes.${Scheme}` | `profiles.${Platform}` | `os.${OS}`;

const SCHEMES: Scheme[] = ["light", "dark"];
const OSES: OS[] = PLATFORMS.flatMap((p) => PLATFORM_OS[p]);

/** The sets as written (references kept), for the sheet; `Theme.sets` holds them resolved. Weak, so a theme dropped is gone. */
const written = new WeakMap<Theme, ReadonlyMap<SetName, Readonly<Record<string, Value>>>>();

/** The tree a set's paths are checked against, and its name in an error. An OS set's is its platform's profile. */
function schemaOf(set: SetName): [Tree, string] {
  if (set === "shared") return [tokenSource.shared, "tokenSource.shared"];
  const [kind, name] = set.split(".") as [string, string];
  if (kind === "schemes") return [tokenSource.themes[name as Scheme], `tokenSource.themes.${name}`];
  if (kind === "profiles") return [tokenSource.profiles[name as Platform], `tokenSource.profiles.${name}`];
  const profile = platformOf(name as OS);
  return [tokenSource.profiles[profile], `tokenSource.profiles.${profile} (${name}'s profile)`];
}

/** Whether a dotted path names a leaf of the tree (not a group, not a `$` key). */
function isLeaf(tree: Tree, path: string): boolean {
  let at: unknown = tree;
  for (const k of path.split(".")) {
    if (k.startsWith("$") || typeof at !== "object" || at === null || !Object.prototype.hasOwnProperty.call(at, k)) return false;
    at = (at as Record<string, unknown>)[k];
  }
  return typeof at === "string" || typeof at === "number";
}

/**
 * The first thing in a value a stylesheet cannot hold, as `[character, why]`, or `undefined`: `;`, `{`, `}`, `<`, `>`, a backslash
 * (it escapes the closing brace and swallows every block after it), a comment marker, and a quote, parenthesis or bracket nothing closes
 * (or closes without an opening). Inside a quoted string only its closing quote counts, as in CSS. Also a control character (a newline
 * ends the declaration), `@` and `!` (an at-rule, `!important`), and a function that loads a resource (`url(`, `image(`, `image-set(`,
 * `-webkit-image-set(`, `src(`, `element(`, `cross-fade(`): a tenant's theme must not make every viewer fetch a URL.
 */
function flaw(v: string): [string, string] | undefined {
  const control = /[\u0000-\u001f\u007f]/.exec(v);
  if (control) {
    const code = `U+${control[0].charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
    return [code, `a control character (${code})`];
  }
  const fetches = /(?<![\w-])(-webkit-image-set|image-set|image|url|src|element|cross-fade)\s*\(/i.exec(v);
  if (fetches) return [`${fetches[1]!.toLowerCase()}(`, `the function ${fetches[1]!.toLowerCase()}(`];
  const bad = /[;{}<>\\@!]/.exec(v);
  if (bad) return [bad[0], bad[0] === "\\" ? "a backslash" : `"${bad[0]}"`];
  const comment = /\/\*|\*\//.exec(v);
  if (comment) return [comment[0], `the comment marker ${comment[0]}`];
  const open: Record<string, string> = { ")": "(", "]": "[" };
  const stack: string[] = [];
  let quote = "";
  for (const ch of v) {
    if (quote) {
      if (ch === quote) quote = "";
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(" || ch === "[") stack.push(ch);
    else if (ch in open && stack.pop() !== open[ch]) return [ch, `an unbalanced ${ch}`];
  }
  if (quote) return [quote, `an unclosed ${quote}`];
  const left = stack[stack.length - 1];
  if (left) return [left, `an unclosed ${left}`];
  return undefined;
}

/** An object literal (or `Object.create(null)`): what an override tree and a recipe are made of. */
const isPlain = (v: unknown): v is Record<string, unknown> => {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

/** An override tree's leaves as `[dotted path, value]`; anything that is not a plain object is a leaf, for `put` to judge. */
function leavesOf(tree: unknown, prefix = ""): [string, unknown][] {
  if (!isPlain(tree)) return [[prefix, tree]];
  return Object.entries(tree).flatMap(([k, v]) => (v === undefined ? [] : leavesOf(v, prefix ? `${prefix}.${k}` : k)));
}

/** Where a font leaf from `brandValues` goes: the two families are shared, the phone's files are its profile's. */
const fontSet = (path: string): SetName => (path.startsWith("font.file") ? "profiles.mobile" : "shared");


/** Plain data with `undefined` and empty objects dropped; `undefined` when nothing is left. What "no recipes" means. */
function prune(v: unknown): unknown {
  if (Array.isArray(v)) return v.map((x) => prune(x) ?? null);
  if (!isPlain(v)) return v;
  const out = Object.fromEntries(Object.entries(v).flatMap(([k, x]) => (prune(x) === undefined ? [] : [[k, prune(x)]])));
  return Object.keys(out).length ? out : undefined;
}

/** JSON with every object's keys sorted by code unit (not by locale, which differs between machines). */
function canonical(v: unknown): string {
  const sort = (x: unknown): unknown =>
    Array.isArray(x) ? x.map(sort) : typeof x === "object" && x !== null ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sort((x as Record<string, unknown>)[k])])) : x;
  return JSON.stringify(sort(v)) ?? "";
}

/** 32-bit FNV-1a over the text's UTF-8 bytes, as eight hex digits. */
function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  const byte = (b: number) => {
    h ^= b;
    h = Math.imul(h, 0x01000193);
  };
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80) byte(c);
    else if (c < 0x800) [0xc0 | (c >> 6), 0x80 | (c & 63)].forEach(byte);
    else if (c < 0x10000) [0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)].forEach(byte);
    else [0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)].forEach(byte);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** The name as it stands in an id, and so in a CSS attribute value: lower case, a hyphen for any run of anything else. */
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "theme";

const deepFreeze = <T>(v: T): T => {
  if (Array.isArray(v) || isPlain(v)) {
    for (const x of Object.values(v as object)) deepFreeze(x);
    Object.freeze(v);
  }
  return v;
};

/**
 * Builds a theme from its layers (extends, brand, fonts, tokens; see the top of this file; `extends` left out is `themes.neutral`). Throws on a path `tokenSource` does
 * not have for its set, a value that is neither a string nor a number, a string a stylesheet cannot hold (`;`, `{`, `}`, `<`, `>`,
 * `@`, `!`, a backslash, a control character, a comment marker, a function that loads a resource such as `url(`, or a quote, parenthesis or
 * bracket nothing closes; a font family name is held to the same), a brand `soft`, `softHover`, `onSoft` or `tint` that is not a colour
 * or a reference that names no primitive, naming the theme, the layer and the path; and on a recipe override naming a recipe, part,
 * layer, variant prop or value, state, platform or style key the recipe does not have, or a value that is not a `$token` the tokens
 * have, `transparent` or `none`, naming the theme, the recipe and where. Frozen.
 */
export function defineTheme(input: ThemeInput): Theme {
  const name = input?.name;
  if (typeof name !== "string" || !name.trim()) throw new Error("defineTheme: a theme needs a name");
  const fail = (layer: string, message: string): never => {
    throw new Error(`defineTheme("${name}"), ${layer}: ${message}`);
  };
  const sets = new Map<SetName, Record<string, Value>>();
  /** The layer that last wrote each `<set>|<path>`, so `fg.onBrand` can follow a `brand.default` this theme set. */
  const by = new Map<string, string>();
  const put = (layer: string, set: SetName, path: string, v: unknown) => {
    const [schema, schemaName] = schemaOf(set);
    if (!path || !isLeaf(schema, path)) fail(layer, `"${path}" is not a token of ${schemaName}`);
    if (typeof v === "number") {
      if (!Number.isFinite(v)) fail(layer, `${path} is ${v}, not a finite number`);
    } else if (typeof v === "string") {
      if (!isReference(v)) {
        const bad = flaw(v);
        if (bad) fail(layer, `${path} is "${v}": a value cannot hold ${bad[1]} (character ${bad[0]})`);
      }
      if (isReference(v))
        try {
          primitiveValue(referencePath(v));
        } catch (e) {
          fail(layer, `${path}: ${e instanceof Error ? e.message : String(e)}`);
        }
    } else fail(layer, `${path} must be a string or a number, got ${v === null ? "null" : Array.isArray(v) ? "an array" : typeof v}`);
    if (!sets.has(set)) sets.set(set, {});
    sets.get(set)![path] = v as Value;
    by.set(`${set}|${path}`, layer);
  };

  // extends: the parent's sets as it wrote them (a parent built elsewhere has only its resolved ones). Left out is `neutral`; `null` is the schema.
  const parent = input.extends === undefined ? neutralTheme() : input.extends;
  if (parent) {
    const from = written.get(parent) ?? setsOf(parent);
    for (const [set, values] of from) for (const [path, v] of Object.entries(values)) put(`extends "${parent.name}"`, set, path, v);
  }

  // A family name is written between quotes, so what would close or open anything else in a stylesheet is refused even inside them.
  const family = (layer: string, face: string, font: unknown) => {
    const text = typeof font === "string" ? font : (font as { family?: unknown } | undefined)?.family;
    if (typeof text !== "string") return;
    const bad = flaw(text) ?? (/["'()[\]]/.test(text) ? ([/["'()[\]]/.exec(text)![0], `"${/["'()[\]]/.exec(text)![0]}"`] as [string, string]) : undefined);
    if (bad) fail(layer, `${face} is "${text}": a font family name cannot hold ${bad[1]} (character ${bad[0]})`);
  };
  if (input.brand?.fonts) for (const face of ["sans", "display"] as const) family("brand", `fonts.${face}`, input.brand.fonts[face]);
  if (input.fonts) for (const face of ["sans", "display"] as const) family("fonts", face, input.fonts[face]);

  // brand: the brand family per scheme, the families and the phone's files once.
  if (input.brand)
    for (const scheme of SCHEMES) {
      let values: Record<string, string> = {};
      try {
        values = brandValues(input.brand, scheme, { stack: true, files: true });
      } catch (e) {
        fail("brand", e instanceof Error ? e.message : String(e));
      }
      for (const [path, v] of Object.entries(values)) put("brand", (BRAND_PATHS as readonly string[]).includes(path) ? `schemes.${scheme}` : fontSet(path), path, v);
    }

  // fonts: the same expansion as a brand's (a stack on the web, the family alone on the phone, its files), and `mono`, which has no files.
  if (input.fonts) {
    const { sans, display, mono } = input.fonts;
    let values: Record<string, string> = {};
    try {
      values = brandValues({ fonts: { sans, display } }, "light", { stack: true, files: true });
    } catch (e) {
      fail("fonts", (e instanceof Error ? e.message : String(e)).replace(/^brand\.fonts\./, "fonts."));
    }
    for (const [path, v] of Object.entries(values)) put("fonts", fontSet(path), path, v);
    if (mono !== undefined) {
      const family = typeof mono === "string" ? mono.trim() : "";
      if (!family || /["'()[\]]/.test(family) || flaw(family)) fail("fonts", `mono must be a font family name (no quotes, brackets, backslashes or comment markers), got "${String(mono)}"`);
      put("fonts", "shared", "font.mono", `"${family}", ${tokens.shared.font.mono}`);
    }
  }

  // tokens: each set's leaves, checked against that set's tree.
  const t = input.tokens;
  if (t !== undefined) {
    if (!isPlain(t)) fail("tokens", "must be an object of sets (shared, schemes, profiles, os)");
    for (const key of Object.keys(t)) if (!["shared", "schemes", "profiles", "os"].includes(key)) fail("tokens", `"${key}" is not a set (shared, schemes, profiles, os)`);
    const named = <K extends string>(group: string, value: unknown, allowed: readonly K[], set: (k: K) => SetName) => {
      if (value === undefined) return;
      if (!isPlain(value)) fail(`tokens.${group}`, "must be an object");
      for (const [k, tree] of Object.entries(value as object)) {
        if (!allowed.includes(k as K)) fail(`tokens.${group}`, `"${k}" is not one of ${allowed.join(", ")}`);
        if (tree !== undefined) for (const [path, v] of leavesOf(tree)) put(`tokens.${group}.${k}`, set(k as K), path, v);
      }
    };
    if (t.shared !== undefined) for (const [path, v] of leavesOf(t.shared)) put("tokens.shared", "shared", path, v);
    named("schemes", t.schemes, SCHEMES, (k) => `schemes.${k}`);
    named("profiles", t.profiles, PLATFORMS, (k) => `profiles.${k}`);
    named("os", t.os, OSES, (k) => `os.${k}`);
  }

  // fg.onBrand: by contrast on a `brand.default` this theme set (its brand or its tokens), unless its own tokens set `fg.onBrand` for the scheme.
  for (const scheme of SCHEMES) {
    const set: SetName = `schemes.${scheme}`;
    const fill = by.get(`${set}|brand.default`);
    if (!fill || fill.startsWith("extends") || by.get(`${set}|fg.onBrand`)?.startsWith("tokens")) continue;
    const rgb = rgbOf(String(resolveValue(sets.get(set)!["brand.default"]!)));
    if (rgb) put(fill, set, "fg.onBrand", onBrandFor(rgb));
  }

  // Resolved, in the shape `Theme.sets` has: only the sets that hold something.
  const shape = { shared: {} as Record<string, Value>, schemes: {} as Record<string, Record<string, Value>>, profiles: {} as Record<string, Record<string, Value>>, os: {} as Record<string, Record<string, Value>> };
  for (const [set, values] of sets) {
    const resolved = Object.fromEntries(Object.entries(values).map(([path, v]) => [path, resolveValue(v)]));
    if (set === "shared") shape.shared = resolved;
    else {
      const [kind, key] = set.split(".") as ["schemes" | "profiles" | "os", string];
      shape[kind][key] = resolved;
    }
  }
  // recipes: checked (a theme may come from JSON, and a parent built elsewhere was not checked here), then the child's cells over the parent's.
  const badRecipe = (layer: string) => (where: string, message: string): never => fail(layer, where === "recipes" ? message : `${where}: ${message}`);
  if (parent && !written.has(parent)) checkOverrides(parent.recipes, badRecipe(`extends "${parent.name}", recipes`));
  checkOverrides(input.recipes, badRecipe("recipes"));
  const recipes = mergeOverrides(parent?.recipes, input.recipes);
  const kept = prune(recipes);
  const id = !sets.size && kept === undefined ? "" : `${slug(name)}-${fnv1a(canonical({ sets: shape, recipes: kept ?? {} }))}`;

  // Marked before it is frozen: the mark is a property, and a frozen object takes none.
  const theme = deepFreeze(markBuilt({ id, name, sets: shape, recipes: recipes as ThemeRecipes })) as Theme;
  written.set(theme, new Map([...sets].map(([set, values]) => [set, Object.freeze(values)] as const)));
  return theme;
}

let neutralBuilt: Theme | undefined;
/**
 * `themes.neutral`, built on first use and then the same object. It is here, not in `themes/`, so that `defineTheme` can start a theme from
 * it without a cycle (`themes/neutral.ts` holds its input and imports nothing of this file; `themes/index.ts` exports what this returns).
 */
export function neutralTheme(): Theme {
  return (neutralBuilt ??= defineTheme(neutralInput));
}

/** A theme's resolved sets by name, for a parent `defineTheme` did not build here. */
function setsOf(theme: Theme): Map<SetName, Readonly<Record<string, Value>>> {
  const out = new Map<SetName, Readonly<Record<string, Value>>>();
  const s = theme.sets;
  if (s && Object.keys(s.shared ?? {}).length) out.set("shared", s.shared);
  for (const [k, v] of Object.entries(s?.schemes ?? {})) if (v) out.set(`schemes.${k as Scheme}`, v);
  for (const [k, v] of Object.entries(s?.profiles ?? {})) if (v) out.set(`profiles.${k as Platform}`, v);
  for (const [k, v] of Object.entries(s?.os ?? {})) if (v) out.set(`os.${k as OS}`, v);
  return out;
}

/* ---------- themeCss ---------- */

/** One variable in one layer: its value as the browser resolves it, and as the sheet writes it (a reference is its primitive's variable). */
type Decl = { value: string; css: string; primitive?: string };
type Layer = ReadonlyMap<string, Decl>;
type Context = { platform: Platform; scheme: Scheme; os?: OS };

let baseLayers: { shared: Layer; schemes: Record<Scheme, Layer>; profiles: Record<Platform, Layer>; os: Partial<Record<OS, Layer>> } | undefined;

/** `tokensCss()`'s blocks as layers, once. */
function base() {
  if (baseLayers) return baseLayers;
  const layer = (source: Tree, resolved: Tree): Layer => {
    const values = new Map(flatten(resolved, "", []));
    return new Map(flatten(source, "", [], new Set()).map(([k, css]) => [k, { value: values.get(k)!, css }]));
  };
  const os: Partial<Record<OS, Layer>> = {};
  for (const [name, set] of Object.entries(tokenSource.os)) os[name as OS] = layer(set as Tree, (tokens.os as Record<string, Tree>)[name]!);
  baseLayers = {
    shared: layer(tokenSource.shared, tokens.shared),
    schemes: { light: layer(tokenSource.themes.light, tokens.themes.light), dark: layer(tokenSource.themes.dark, tokens.themes.dark) },
    profiles: { web: layer(tokenSource.profiles.web, tokens.profiles.web), desktop: layer(tokenSource.profiles.desktop, tokens.profiles.desktop), mobile: layer(tokenSource.profiles.mobile, tokens.profiles.mobile) },
    os,
  };
  return baseLayers;
}

const sheets = new Map<string, string>();
const SHEETS_MAX = 32;

/**
 * The theme as CSS: the same blocks as `tokensCss()`, each selector scoped by `[data-af-theme-id="<id>"]` on the element that
 * carries `data-af-platform`, `data-af-theme` and `data-af-os`, so a scoped block beats the base's by specificity whatever order the
 * sheets land in. Because a scoped block beats every base block, not only its own layer's, each block is worked out against the
 * merged values: the dark block repeats a light leaf whose dark value the theme left alone, a profile block puts back the
 * profile's own leaf over a theme's shared one (`radius.card` on the phone), and an OS block puts back the base OS's leaf over a
 * theme's profile one (Android's switch). A block holds only what differs from what the browser would otherwise resolve, and an
 * empty block is left out. A primitive a theme's reference names is declared in the sheet, scoped, when the base sheet does not
 * already declare it. `""` for the empty theme. Never `:root`. Memoised by id. Throws for a theme `defineTheme` did not build.
 */
export function themeCss(theme: Theme): string {
  assertBuilt(theme, "themeCss");
  if (!theme.id) return "";
  if (!/^[a-z0-9-]+$/.test(theme.id)) throw new Error(`themeCss: "${theme.id}" is not a theme id (defineTheme makes them)`);
  const hit = sheets.get(theme.id);
  if (hit !== undefined) return hit;

  const b = base();
  const source = written.get(theme) ?? setsOf(theme);
  const layer = (set: SetName, resolved: Readonly<Record<string, Value>> | undefined): Layer => {
    const as = source.get(set) ?? {};
    return new Map(
      Object.entries(resolved ?? {}).map(([path, v]) => {
        const name = cssVarName(path);
        const value = cssValue(name.slice(5), v);
        const w = as[path];
        return [name, isReference(w) ? { value, css: `var(${primitiveVar(referencePath(w))})`, primitive: referencePath(w) } : { value, css: value }];
      }),
    );
  };
  const s = theme.sets;
  const own = {
    shared: layer("shared", s.shared),
    schemes: Object.fromEntries(SCHEMES.map((k) => [k, layer(`schemes.${k}`, s.schemes[k])])) as Record<Scheme, Layer>,
    profiles: Object.fromEntries(PLATFORMS.map((k) => [k, layer(`profiles.${k}`, s.profiles[k])])) as Record<Platform, Layer>,
    os: Object.fromEntries(OSES.map((k) => [k, layer(`os.${k}`, s.os[k])])) as Record<OS, Layer>,
  };
  const names = new Set([own.shared, ...Object.values(own.schemes), ...Object.values(own.profiles), ...Object.values(own.os)].flatMap((l) => [...l.keys()]));

  // What the theme means on an element: the layers in precedence order, base then theme at each; the last that has the name wins.
  const want = ({ platform, scheme, os }: Context, name: string): Decl | undefined => {
    const order = [b.shared, own.shared, b.schemes[scheme], own.schemes[scheme], b.profiles[platform], own.profiles[platform], ...(os ? [b.os[os], own.os[os]] : [])];
    for (let i = order.length - 1; i >= 0; i--) {
      const d = order[i]?.get(name);
      if (d) return d;
    }
    return undefined;
  };
  // What the base sheet alone gives it: its blocks are equally specific, so the last in sheet order wins (shared, profile, OS, light, dark).
  const baseGives = ({ platform, scheme, os }: Context, name: string): Decl | undefined => {
    const order = [b.shared, b.profiles[platform], ...(os ? [b.os[os]] : []), b.schemes.light, ...(scheme === "dark" ? [b.schemes.dark] : [])];
    for (let i = order.length - 1; i >= 0; i--) {
      const d = order[i]?.get(name);
      if (d) return d;
    }
    return undefined;
  };

  const scope = `[data-af-theme-id="${theme.id}"]`;
  type Block = { selector: string; matches: (c: Context) => boolean; decls: Map<string, Decl> };
  const blocks: Block[] = [];
  // What the browser gives a name with the blocks written so far: the last scoped block that matches and has it, else the base.
  const gives = (c: Context, name: string): Decl | undefined => {
    for (let i = blocks.length - 1; i >= 0; i--) if (blocks[i]!.matches(c) && blocks[i]!.decls.has(name)) return blocks[i]!.decls.get(name);
    return baseGives(c, name);
  };
  const same = (a: Decl | undefined, b: Decl | undefined) => a?.value === b?.value;
  /**
   * A block that declares each name the contexts it stands for need and do not get, when every one of them has the name and
   * needs the same value for it. Anything else is left to a later, narrower block (the phone's font files are the mobile
   * block's, not the dark one's).
   */
  const add = (selector: string, matches: (c: Context) => boolean, stands: Context[]) => {
    const decls = new Map<string, Decl>();
    for (const name of names) {
      const wants = stands.map((c) => want(c, name));
      if (wants.every((w, i) => same(w, gives(stands[i]!, name)))) continue;
      const first = wants[0];
      if (first && wants.every((w) => w && same(w, first))) decls.set(name, first);
    }
    blocks.push({ selector, matches, decls });
  };
  const all = (scheme: Scheme, os?: (p: Platform) => (OS | undefined)[]) => PLATFORMS.flatMap((platform) => (os ? os(platform) : [undefined]).map((o) => ({ platform, scheme, os: o })));

  // Shared and light are the theme's own leaves where they differ from the base's (both match every themed element; later blocks correct them).
  const ownBlock = (selector: string, mine: Layer, theirs: Layer) =>
    blocks.push({ selector, matches: () => true, decls: new Map([...mine].filter(([name, d]) => !same(d, theirs.get(name)))) });
  ownBlock(`[data-af-platform]${scope}`, own.shared, b.shared);
  ownBlock(`[data-af-platform]${scope},[data-af-theme="light"]${scope}`, own.schemes.light, b.schemes.light);
  add(`[data-af-theme="dark"]${scope}`, (c) => c.scheme === "dark", all("dark"));
  for (const platform of PLATFORMS)
    add(`[data-af-platform="${platform}"]${scope}`, (c) => c.platform === platform, SCHEMES.map((scheme) => ({ platform, scheme })));
  for (const os of OSES) {
    const platform = platformOf(os);
    add(`[data-af-os="${os}"]${scope}`, (c) => c.os === os, SCHEMES.map((scheme) => ({ platform, scheme, os })));
  }

  // Every element the sheet can meet must now resolve every name the theme touches as the theme means it; anything else is a bug here.
  for (const scheme of SCHEMES)
    for (const c of all(scheme, (p) => [undefined, ...PLATFORM_OS[p]]))
      for (const name of names) {
        const w = want(c, name);
        if (w && !same(w, gives(c, name))) throw new Error(`themeCss("${theme.name}"): ${name} on ${c.platform}/${c.scheme}/${c.os ?? "-"} would be ${gives(c, name)?.value}, not ${w.value}`);
      }

  const emitted = blocks.filter((x) => x.decls.size);
  const known = new Set(referencedPrimitives());
  const needed = new Set(emitted.flatMap((x) => [...x.decls.values()].flatMap((d) => (d.primitive && !known.has(d.primitive) ? [d.primitive] : []))));
  const rule = (selector: string, decls: [string, string][]) => `${selector}{${decls.map(([k, v]) => `${k}:${v}`).join(";")}}`;
  const out = [
    ...(needed.size
      ? [
          rule(
            `[data-af-platform]${scope},[data-af-theme]${scope},[data-af-os]${scope}`,
            Object.keys(primitiveMeta)
              .filter((p) => needed.has(p))
              .map((p) => {
                const v = primitiveValue(p);
                return [primitiveVar(p), typeof v === "number" ? String(v) : v];
              }),
          ),
        ]
      : []),
    ...emitted.map((x) => rule(x.selector, [...x.decls].map(([k, d]) => [k, d.css]))),
  ].join("\n");
  if (sheets.size >= SHEETS_MAX) sheets.delete(sheets.keys().next().value!);
  sheets.set(theme.id, out);
  return out;
}
