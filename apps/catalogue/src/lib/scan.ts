/**
 * How much of the library is tokens and how much is literals: the scan behind `pnpm report`, the
 * literal ratchet (`pnpm check literals`) and the catalogue's Architecture page. Read-only.
 *
 * Per kit and per component file: the token paths it reads (`t.brand.default`), the colour
 * literals, the dimension literals, the ratios and the platform branches. Repo-wide: the token leaves
 * and what is wrong with them (no entry in `descriptions`, read by no component, identical in light
 * and dark, shared but overridden by one profile).
 *
 * What counts, exactly. Comments are blanked first, except that a trailing `/* structural: <why> *\/` on a line takes the literals on
 * that line out of both counts and lists them as `annotated` (stage sizes for demos, 1px optical nudges: never a real component dimension). Only `colours` and `dimensions` are banned (the
 * ratchet in `packages/<kit>/literals.allow.json`, together with `text`); `ratios` are reported, not banned.
 *  - colours:    a hex colour (`#fff`, `#ffffffcc`) or a whole `rgb(…)` / `rgba(…)` call. One built from a
 *                template (`rgba(${r}, …)`) is computed, not a literal.
 *  - dimensions: a non-zero number written directly after a size key (`width`, `height`, `min/max…`,
 *                `padding*`, `margin*`, `gap`, `top/left/right/bottom`, `inset`, `fontSize`, `lineHeight`,
 *                `letterSpacing`, `borderRadius`, `border*Radius`, `borderWidth`, `border*Width`, `strokeWidth`),
 *                as `key: 12`, and a string holding a non-zero pixel length after the same keys (`padding: "10px 11px"`,
 *                one per string). NOT counted: 0; a percentage or another unit (`"100%"`, `"1em"`); a
 *                template that interpolates (`\`${n}px\``: computed); `flex: 1` and the other flex keys (not size keys); a value that is a token
 *                (`t.space.md`) or a variable; a unitless `lineHeight` below 4 (that is a ratio). Still
 *                counted: a number that starts an expression (`8 * 2`, `4 + t.space.sm`), and a number
 *                inside a ternary (`padding: wide ? 16 : 12` is not seen at all: only a number straight
 *                after the colon is).
 *  - text:       fixed words (JSX text, a string given to `aria-label`, `title`, `label` and the like), banned beyond the file's allowance like
 *                the two above: a component reads its words from `useStrings`. What counts, exactly, is `fixedText` below.
 *  - ratios:     a unitless multiplier, which no size token can name: `lineHeight` below 4 (`1.2`), a numeric
 *                `opacity` / `scale` / `scaleX` / `scaleY` other than 0 and 1 (`opacity: 0.5`,
 *                `opacity: live ? 1 : 0.5`, `scale: 0.97`, `transform: "scale(.97)"`). 0 and 1 are the
 *                identity or "hidden", so structural. Decided: reported and listed on the Architecture
 *                page, never banned, because the tokens have `opacity.*` but no scale or line-height ratio.
 *
 * A token a recipe names (`packages/core/src/recipes`, `"$fg.body"`) counts as read, as if each kit wrote `t.fg.body` itself: the kits read
 * those through `useRecipe`, so the files that moved their styles into a recipe do not make their tokens look unread.
 *
 * A computed token key (`t.avatar[size]`, `t.tag[`${tone}Bg`]`, `t[accent].default`) may read any
 * leaf under its group, so every leaf there counts as read, with one narrowing: when the key is a
 * single prop of the component (the file's name is the docs id) and the docs give that prop `options`,
 * only the leaves those options name count. Anything else keeps the broad match.
 *
 * `scan(root)` is pure (no console, no argv); paths in the result are relative to `root`, with no
 * timestamps, so a saved copy (`reports/baseline.json`) diffs cleanly. Server-side only (`node:fs`).
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import ts from "typescript";
import { registry } from "@antfabric-ui/docs";
import { descriptions as tokenDescriptions, isReference, primitiveMeta, recipeEntries, recipes, referencedPrimitives, tokenOf, tokens, tokenSource, type Recipe, type TokenNote } from "@antfabric-ui/core";

// --- What is counted -------------------------------------------------------------------------

/** `t.brand.default`, `t.control.hIconSm`. `t.space[size]` stops at `t.space`. */
const TOKEN_REF = /(?<![\w.$])t(?:\.\w+|\["[^"]+"\])+/g;
const HEX = /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
/** The whole call; one built from a template (`rgba(${r}, …)`) is a computed colour, not a literal. */
const RGB = /\brgba?\([^)]*\)/g;
/** A style key that takes a size. Zero is not counted (it is "none", not a magic number). */
const SIZE_KEYS = [
  "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight",
  "padding\\w*", "margin\\w*", "gap", "rowGap", "columnGap", "inset",
  "top", "left", "right", "bottom",
  "fontSize", "lineHeight", "letterSpacing",
  "borderRadius", "border\\w*Radius", "borderWidth", "border\\w*Width", "strokeWidth",
].join("|");
const DIMENSION = new RegExp(`(?<![\\w.$"'-])(${SIZE_KEYS})\\s*:\\s*(-?\\d+(?:\\.\\d+)?)(?![\\w.%])`, "g");
/**
 * The same key given a string that holds a non-zero pixel length (`padding: "10px 11px"`, `top: "3px"`): a literal written as text, which the
 * number rule above cannot see. Counted once per string, with the string as the value.
 */
const STRING_PX = new RegExp(`(?<![\\w.$"'-])(${SIZE_KEYS})\\s*:\\s*(["'\`])((?:(?!\\2).)*?(?<![\\w.-])(?:[1-9]\\d*(?:\\.\\d+)?|0?\\.\\d*[1-9]\\d*)px(?:(?!\\2).)*)\\2`, "g");
/** A unitless `lineHeight` below this is a multiplier (`1.2`), not a size. */
const RATIO_BELOW = 4;
/** `opacity: 0.5`, `scale: 0.97`, `opacity: live ? 1 : 0.5`: the whole value expression, whose numbers are read by `NUMBER`. */
const RATIO_KEY = /(?<![\w.$"'-])(opacity|scale|scaleX|scaleY)\s*:\s*([^,}\n;]+)/g;
const SCALE_CALL = /\bscale[XY]?\(\s*(-?\d*\.?\d+)\s*[),]/g;
const NUMBER = /(?<![\w.$])-?(?:\d+\.?\d*|\.\d+)(?![\w.%])/g;
/**
 * A platform branch is a line where a component decides by platform or OS: `os === "mac"`,
 * `platform !== "web"`, `osVersion >= 26`, `Platform.OS` / `Platform.select`, or the `coarse`
 * (touch) flag of the React kit. Reading `glass` off `usePlatform()` is counted by `usesPlatform`,
 * not here. A line counts once however many tests it holds.
 */
const PLATFORM_BRANCH = /\b(?:platform|os|platformOS|osVersion)\s*(?:[!=]==|[<>]=?)|\bPlatform\.(?:OS|select|Version)\b|\bcoarse\b|\b(?:isMobile|isDesktop|isWeb)\b/;
/** What follows a token path when its next key is computed: `[identity]`, `[`${tone}-bg`]`, then `.default`. */
const COMPUTED = /^\[([^\]"][^\]]*)\]((?:\.\w+)*)/;
/** `t[accent].default`: a computed key straight off `t`, the group itself being the variable. */
const ROOT_COMPUTED = /(?<![\w.$])t(?=\[[^"\]])/g;
const USE_PLATFORM = /\busePlatform\(/;

// --- Result ----------------------------------------------------------------------------------

export type Literal = { line: number; value: string; prop?: string };
/** A literal on a line that carries `/* structural: <why> *\/`: not counted, not ratcheted, but listed. */
export type Annotated = Literal & { why: string };
export type FileScan = {
  file: string;
  id: string;
  category: string;
  /** Every `t.…` match, resolved or not. */
  tokenRefs: number;
  /** Token path → lines it is read on. */
  tokenPaths: Record<string, number[]>;
  /** `t.identity[identity]`, `t[accent].default`: group (and what follows) → lines. Any leaf under it may be read, unless `dynamicReach` narrows it. */
  dynamic: Record<string, number[]>;
  /** Per `dynamic` key: the leaves the computed key can name when it is a prop with documented options, or `null` when it is not known (any leaf under the group). */
  dynamicReach: Record<string, string[] | null>;
  /** A whole group passed on, not read: `[on, x, t.duration]` in a hook's dependencies. */
  groups: Record<string, number[]>;
  /** Matches that are none of these (something named `t`, a typo). */
  unresolved: Record<string, number[]>;
  colours: Literal[];
  dimensions: Literal[];
  /** Fixed text the component draws or says (see "text" above): JSX text and the strings given to the text-bearing props. Each belongs in `useStrings`. */
  text: Literal[];
  /** Colours, dimensions and text on a line annotated `/* structural: <why> *\/` (a demo stage's size, a 1px optical nudge): kept out of the three counts, reported here. */
  annotated: Annotated[];
  /** Unitless multipliers (`lineHeight: 1.2`, `opacity: 0.5`, `scale: 0.97`): reported, not banned. */
  ratios: Literal[];
  platformBranches: { line: number; text: string }[];
  usesPlatform: boolean;
};
export type KitScan = {
  kit: string;
  /** `src/components/<category>/<id>.tsx`: what the totals count. */
  files: FileScan[];
  /** The rest of `src` (lib, theme): read by components through helpers, so counted for `unread` only. */
  support: FileScan[];
  totals: { files: number; tokenRefs: number; distinctTokens: number; colours: number; dimensions: number; text: number; annotated: number; ratios: number; platformBranches: number };
};
/** How many of `tokens.ts`'s values point at a primitive of the product's Tier 1 (`"{primitives.raw.44}"`) and how many are literals. */
export type ReferenceScan = {
  /** Leaf values, one per place a leaf is defined (shared, light, dark, web, desktop, mobile), that are references. */
  references: number;
  /** Leaf values that are literals. */
  literals: number;
  /** `references + literals`: every value in the file. */
  values: number;
  /** Distinct leaf paths with at least one reference. */
  leavesWithReference: number;
  /** Distinct primitives some token points at, and how many the mirror (`primitives.ts`) holds. */
  primitivesReferenced: number;
  primitivesMirrored: number;
  /** The same two counts per place a leaf is defined. */
  byContext: Record<string, { references: number; literals: number }>;
};
export type TokenScan = {
  total: number;
  /** Values in `tokens.ts` that are references, and values that are literals. Equality below (light against dark) is read from the resolved values. */
  tiers: ReferenceScan;
  inShared: number;
  inThemes: number;
  inProfiles: number;
  /** `$description` on a set or group of `tokens.ts`, by path (the three profiles). A leaf is a bare value and cannot carry one. */
  descriptions: Record<string, string>;
  /** Leaf paths with no entry in `descriptions` (`packages/core/src/descriptions.ts`), where each token's description lives. */
  withoutDescription: string[];
  /** Read by no file in either kit: not by a `t.…` path, nor under a computed one such as `t.shadow[elevate]`. */
  unread: string[];
  /** Read only that way (the name is never written out, or only as one of a prop's options): the check cannot see them. */
  readOnlyDynamically: string[];
  /** Same value in light and dark, and not marked `sameInDark` in `descriptions`: a repeat nobody has said is deliberate. */
  sameLightDark: string[];
  /** Same value in light and dark, marked `sameInDark` in `descriptions` (the brand, a person's colour, the OS's own chrome). */
  sameInDarkByDesign: string[];
  /** In `shared` and overridden by exactly one profile. */
  sharedOverriddenInOneProfile: { path: string; profile: string }[];
  /** In some profiles but not all (and not in `shared`). */
  partialProfiles: { path: string; profiles: string[] }[];
};
export type Scan = { kits: KitScan[]; tokens: TokenScan };

// --- Tokens ----------------------------------------------------------------------------------

type Tree = { readonly [k: string]: string | number | Tree };

/** Leaves as path → value, the way `css.ts` and `native.ts` flatten: keys starting with `$` are metadata. */
function leaves(tree: Tree, prefix = "", out = new Map<string, string | number>()) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith("$")) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object") leaves(v, path, out);
    else out.set(path, v);
  }
  return out;
}

function descriptions(tree: Tree, prefix: string, out: Record<string, string>) {
  for (const [k, v] of Object.entries(tree)) {
    if (k === "$description") out[prefix] = String(v);
    else if (typeof v === "object") descriptions(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

const sorted = <T,>(a: T[]) => [...a].sort();
const byKey = <T,>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

function scanTokens(read: Set<string>, dynamic: Set<string>, reached: Set<string>): TokenScan {
  const shared = leaves(tokens.shared);
  const themes = Object.fromEntries(Object.entries(tokens.themes).map(([k, t]) => [k, leaves(t)]));
  const profiles = Object.fromEntries(Object.entries(tokens.profiles).map(([k, t]) => [k, leaves(t)]));
  const all = new Set<string>([...shared.keys(), ...Object.values(themes).flatMap((m) => [...m.keys()]), ...Object.values(profiles).flatMap((m) => [...m.keys()])]);
  const profileNames = Object.keys(profiles);
  const themeNames = Object.keys(themes);

  const desc: Record<string, string> = {};
  descriptions(tokens.shared, "shared", desc);
  for (const [k, t] of Object.entries(tokens.themes)) descriptions(t, `themes.${k}`, desc);
  for (const [k, t] of Object.entries(tokens.profiles)) descriptions(t, `profiles.${k}`, desc);
  // A leaf is described by its entry in `descriptions`, keyed by the path inside its group.
  const noted = tokenDescriptions as Record<string, string | TokenNote>;
  const byDesign = (p: string) => typeof noted[p] === "object" && noted[p]!.sameInDark === true;

  const identical = [...all].filter((p) => themeNames.every((n) => themes[n]!.has(p)) && new Set(themeNames.map((n) => themes[n]!.get(p))).size === 1);
  const overridden = [...all].flatMap((p) => {
    const where = profileNames.filter((n) => profiles[n]!.has(p));
    return shared.has(p) && where.length === 1 ? [{ path: p, profile: where[0]! }] : [];
  });
  const partial = [...all].flatMap((p) => {
    const where = profileNames.filter((n) => profiles[n]!.has(p));
    return !shared.has(p) && where.length > 0 && where.length < profileNames.length ? [{ path: p, profiles: where }] : [];
  });

  // What the file holds, references included: `tokens` (above) is the same tree resolved, for anything that compares values.
  const written: Array<[string, Map<string, string | number>]> = [
    ["shared", leaves(tokenSource.shared)],
    ...Object.entries(tokenSource.themes).map(([k, t]): [string, Map<string, string | number>] => [k, leaves(t)]),
    ...Object.entries(tokenSource.profiles).map(([k, t]): [string, Map<string, string | number>] => [k, leaves(t)]),
  ];
  const byContext: ReferenceScan["byContext"] = {};
  const withReference = new Set<string>();
  for (const [context, map] of written) {
    const row = (byContext[context] = { references: 0, literals: 0 });
    for (const [path, v] of map) {
      if (isReference(v)) {
        row.references++;
        withReference.add(path);
      } else row.literals++;
    }
  }
  const sum = (f: (r: { references: number; literals: number }) => number) => Object.values(byContext).reduce((n, r) => n + f(r), 0);

  return {
    total: all.size,
    tiers: {
      references: sum((r) => r.references),
      literals: sum((r) => r.literals),
      values: sum((r) => r.references + r.literals),
      leavesWithReference: withReference.size,
      primitivesReferenced: referencedPrimitives().length,
      primitivesMirrored: Object.keys(primitiveMeta).length,
      byContext,
    },
    inShared: shared.size,
    inThemes: new Set(Object.values(themes).flatMap((m) => [...m.keys()])).size,
    inProfiles: new Set(Object.values(profiles).flatMap((m) => [...m.keys()])).size,
    descriptions: byKey(desc),
    withoutDescription: sorted([...all].filter((p) => !(p in noted))),
    unread: sorted([...all].filter((p) => !read.has(p) && !reached.has(p) && !underDynamic(p, dynamic))),
    readOnlyDynamically: sorted([...all].filter((p) => !read.has(p) && (reached.has(p) || underDynamic(p, dynamic)))),
    sameLightDark: sorted(identical.filter((p) => !byDesign(p))),
    sameInDarkByDesign: sorted(identical.filter(byDesign)),
    sharedOverriddenInOneProfile: overridden.sort((a, b) => (a.path < b.path ? -1 : 1)),
    partialProfiles: partial.sort((a, b) => (a.path < b.path ? -1 : 1)),
  };
}

// --- Files -----------------------------------------------------------------------------------

/** Comments blanked out (newlines kept, so line numbers hold). A `//` inside a string such as a URL is left alone. */
export function stripComments(src: string) {
  const blank = (s: string) => s.replace(/[^\n]/g, " ");
  return src.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[\s;,{(])\/\/[^\n]*/g, (m, lead: string) => lead + blank(m.slice(lead.length)));
}

const lineStarts = (src: string) => {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === "\n") starts.push(i + 1);
  return starts;
};
const lineAt = (starts: number[], index: number) => {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid]! <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
};

const allPaths = new Set<string>();
const groupPaths = new Set<string>();
{
  const add = (tree: Tree, prefix = "") => {
    for (const [k, v] of Object.entries(tree)) {
      if (k.startsWith("$")) continue;
      const p = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "object") {
        groupPaths.add(p);
        add(v, p);
      } else allPaths.add(p);
    }
  };
  add(tokens.shared);
  for (const t of Object.values(tokens.themes)) add(t);
  for (const t of Object.values(tokens.profiles)) add(t);
}

/** `t.control.hIconSm` → `control.hIconSm`; the longest prefix that is a leaf, else the whole path. */
function refPath(ref: string) {
  const segs = [...ref.matchAll(/\.(\w+)|\["([^"]+)"\]/g)].map((m) => (m[1] ?? m[2])!);
  for (let n = segs.length; n > 0; n--) {
    const p = segs.slice(0, n).join(".");
    if (allPaths.has(p)) return { path: p, leaf: true };
  }
  return { path: segs.join("."), leaf: false };
}

/** `identity` or `…default` (a group, `…`, the tail after the computed key) covers a leaf. */
function underDynamic(path: string, dynamic: Set<string>) {
  for (const d of dynamic) {
    const [group, tail] = d.split("…");
    // A computed key off `t` itself has no group: `….default` covers every `x.default`.
    if (group ? path.startsWith(`${group}.`) && (!tail || path.endsWith(tail)) : !!tail && path.endsWith(tail)) return true;
  }
  return false;
}

/**
 * What a computed key can be, when it names a prop of the component and the docs list that prop's options:
 * `size` → the options, `` `${tone}Bg` `` → each option with `Bg` after it. `null` for anything else (a local,
 * a call, a prop with no options): the caller keeps the broad match.
 */
function optionsOf(expr: string, id: string): string[] | null {
  const m = /^(\w+)$/.exec(expr.trim()) ?? /^`(\w*)\$\{(\w+)\}(\w*)`$/.exec(expr.trim());
  if (!m) return null;
  const [name, before, after] = m.length === 2 ? [m[1]!, "", ""] : [m[2]!, m[1]!, m[3]!];
  const options = (registry[id]?.props[name] as { options?: (string | number)[] } | undefined)?.options;
  return options?.length ? options.map((o) => `${before}${o}${after}`) : null;
}

/** Props whose string value is words a person reads or hears. A literal given to one is fixed English. */
const TEXT_ATTRIBUTES = new Set(["aria-label", "accessibilityLabel", "accessibilityHint", "title", "placeholder", "alt", "label", "text", "confirmLabel", "cancelLabel", "actionLabel"]);
/** The same words as keys of an object literal (`{ label: "1 hour" }`, an options list a component draws). */
const TEXT_KEYS = new Set([...TEXT_ATTRIBUTES, "ariaLabel"]);
const HAS_LETTER = /\p{L}/u;

/**
 * The fixed text a component file holds, one entry per string that would need a translation:
 *  - JSX text with a letter in it (`<span>Required</span>`; a lone `·` or `/` is not text);
 *  - a string given to `aria-label`, `accessibilityLabel`, `accessibilityHint`, `title`, `placeholder`, `alt` or to a prop that draws its value
 *    (`label`, `text`, `confirmLabel`, `cancelLabel`, `actionLabel`), as `prop="Close"` or `prop={cond ? "Show" : "Hide"}`;
 *  - the same words as a key of an object literal (`{ label: "1 hour" }`);
 *  - a string that is the value of a JSX child expression (`{tag || "Required"}`, `{done ? "Copied" : ""}`);
 *  - a string given to `announceForAccessibility`.
 * A string counts once however it is built: a template literal is one string, and a ternary's two branches are two. What is not text: a string
 * compared (`kind === "error"`), a destructuring default (`label = "Send invite"` is the catalogue's sample), a literal inside a call
 * (`s("required")`), and anything in a prop not listed. Empty and symbol-only strings have no letter and do not count.
 */
export function fixedText(raw: string): Literal[] {
  const sf = ts.createSourceFile("component.tsx", raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out: Literal[] = [];
  const add = (node: ts.Node, value: string, prop?: string) => {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    const clipped = value.replace(/\s+/g, " ").trim();
    out.push(prop ? { line, prop, value: clipped.slice(0, 80) } : { line, value: clipped.slice(0, 80) });
  };
  // The strings an expression can evaluate to: through a ternary's branches, `||`, `??`, `&&`'s right side and `+`, not through a call or a comparison.
  const values = (node: ts.Expression, prop?: string): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (HAS_LETTER.test(node.text)) add(node, node.text, prop);
    } else if (ts.isTemplateExpression(node)) {
      const pieces = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)];
      if (pieces.some((p) => HAS_LETTER.test(p))) add(node, node.getText(sf), prop);
      else for (const span of node.templateSpans) values(span.expression, prop);
    } else if (ts.isConditionalExpression(node)) {
      values(node.whenTrue, prop);
      values(node.whenFalse, prop);
    } else if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.PlusToken) {
        values(node.left, prop);
        values(node.right, prop);
      } else if (op === ts.SyntaxKind.AmpersandAmpersandToken) values(node.right, prop);
    } else if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node) || ts.isSatisfiesExpression(node)) values(node.expression, prop);
  };
  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      if (HAS_LETTER.test(node.text)) add(node, node.text);
    } else if (ts.isJsxAttribute(node) && TEXT_ATTRIBUTES.has(node.name.getText(sf)) && node.initializer) {
      const prop = node.name.getText(sf);
      if (ts.isStringLiteral(node.initializer)) {
        if (HAS_LETTER.test(node.initializer.text)) add(node.initializer, node.initializer.text, prop);
      } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) values(node.initializer.expression, prop);
    } else if (ts.isJsxExpression(node) && node.expression && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      values(node.expression);
    } else if (ts.isPropertyAssignment(node) && TEXT_KEYS.has(ts.isStringLiteral(node.name) ? node.name.text : node.name.getText(sf))) {
      values(node.initializer, node.name.getText(sf).replace(/^["']|["']$/g, ""));
    } else if (ts.isCallExpression(node) && /(?:^|\.)announceForAccessibility$/.test(node.expression.getText(sf))) {
      for (const arg of node.arguments) values(arg);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out.sort((a, b) => a.line - b.line || (a.value < b.value ? -1 : 1));
}

function scanFile(root: string, kitDir: string, file: string): FileScan {
  const id = file.slice(file.lastIndexOf("/") + 1).replace(/\.tsx?$/, "");
  const raw = readFileSync(join(root, file), "utf8");
  const src = stripComments(raw);
  // `/* structural: why */` anywhere on a line (the comment is blanked in `src`, so line numbers still match).
  const structural = new Map<number, string>();
  raw.split("\n").forEach((text, i) => {
    const m = /\/\*\s*structural:\s*(.*?)\s*\*\//.exec(text);
    if (m) structural.set(i + 1, m[1]!);
  });
  const starts = lineStarts(src);
  const lines = src.split("\n");
  const at = (i: number) => lineAt(starts, i);

  const tokenPaths: Record<string, number[]> = {};
  const dynamic: Record<string, number[]> = {};
  const dynamicReach: Record<string, string[] | null> = {};
  const groups: Record<string, number[]> = {};
  const unresolved: Record<string, number[]> = {};
  let tokenRefs = 0;
  // A computed key: the group (empty off `t`), what follows it, and the leaves its expression can name (null: any under the group).
  const computed = (group: string, tail: RegExpExecArray, line: number) => {
    const after = [...(tail[2] ?? "").matchAll(/\.(\w+)/g)].map((x) => x[1]).join(".");
    const key = `${group}…${after ? `.${after}` : ""}`;
    (dynamic[key] ??= []).push(line);
    const options = optionsOf(tail[1]!, id);
    const paths = options?.map((o) => [group, o, after].filter(Boolean).join(".")).filter((p) => allPaths.has(p));
    if (!paths?.length) dynamicReach[key] = null;
    else if (dynamicReach[key] !== null) dynamicReach[key] = [...new Set([...(dynamicReach[key] ?? []), ...paths])].sort();
  };
  for (const m of src.matchAll(TOKEN_REF)) {
    tokenRefs++;
    const { path, leaf } = refPath(m[0]);
    const line = at(m.index!);
    const tail = COMPUTED.exec(src.slice(m.index! + m[0].length));
    if (leaf && !tail) (tokenPaths[path] ??= []).push(line);
    else if (groupPaths.has(path) && tail) computed(path, tail, line);
    else if (groupPaths.has(path)) (groups[path] ??= []).push(line);
    else (unresolved[m[0]] ??= []).push(line);
  }
  for (const m of src.matchAll(ROOT_COMPUTED)) {
    const tail = COMPUTED.exec(src.slice(m.index! + 1));
    if (!tail) continue;
    tokenRefs++;
    if (tail[2]) computed("", tail, at(m.index!));
    else (unresolved[`t[${tail[1]}]`] ??= []).push(at(m.index!));
  }

  const allColours: Literal[] = [...src.matchAll(HEX), ...src.matchAll(RGB)]
    .filter((m) => !m[0].includes("${"))
    .map((m) => ({ line: at(m.index!), value: m[0] }))
    .sort((a, b) => a.line - b.line || (a.value < b.value ? -1 : 1));
  const sizes = [...src.matchAll(DIMENSION)].filter((m) => Number(m[2]) !== 0);
  const isRatio = (m: RegExpMatchArray) => m[1] === "lineHeight" && Math.abs(Number(m[2])) < RATIO_BELOW;
  const stringSizes = [...src.matchAll(STRING_PX)].filter((m) => !m[3]!.includes("${"));
  const allDimensions: Literal[] = [
    ...sizes.filter((m) => !isRatio(m)).map((m) => ({ line: at(m.index!), prop: m[1]!, value: m[2]! })),
    ...stringSizes.map((m) => ({ line: at(m.index!), prop: m[1]!, value: `"${m[3]!}"` })),
  ].sort((a, b) => a.line - b.line);
  const allText = fixedText(raw);
  const colours = allColours.filter((l) => !structural.has(l.line));
  const dimensions = allDimensions.filter((l) => !structural.has(l.line));
  const text = allText.filter((l) => !structural.has(l.line));
  const annotated: Annotated[] = [...allColours, ...allDimensions, ...allText]
    .filter((l) => structural.has(l.line))
    .map((l) => ({ ...l, why: structural.get(l.line)! }))
    .sort((a, b) => a.line - b.line);
  const ratios: Literal[] = [
    ...sizes.filter(isRatio).map((m) => ({ line: at(m.index!), prop: m[1]!, value: m[2]! })),
    ...[...src.matchAll(RATIO_KEY)].flatMap((m) =>
      [...m[2]!.matchAll(NUMBER)].filter((n) => n[0] !== "0" && Number(n[0]) !== 1).map((n) => ({ line: at(m.index!), prop: m[1]!, value: n[0] })),
    ),
    ...[...src.matchAll(SCALE_CALL)].filter((m) => Number(m[1]) !== 1 && Number(m[1]) !== 0).map((m) => ({ line: at(m.index!), prop: "scale", value: m[1]! })),
  ].sort((a, b) => a.line - b.line || (a.value < b.value ? -1 : 1));
  const platformBranches = lines.flatMap((text, i) => (PLATFORM_BRANCH.test(text) ? [{ line: i + 1, text: text.trim().slice(0, 120) }] : []));

  const rel = relative(join(root, kitDir, "src"), join(root, file)).split("/");
  return {
    file,
    id: rel[rel.length - 1]!.replace(/\.tsx?$/, ""),
    category: rel[0] === "components" ? rel[1]! : rel.slice(0, -1).join("/"),
    tokenRefs,
    tokenPaths: byKey(tokenPaths),
    dynamic: byKey(dynamic),
    dynamicReach: byKey(dynamicReach),
    groups: byKey(groups),
    unresolved: byKey(unresolved),
    colours,
    dimensions,
    text,
    annotated,
    ratios,
    platformBranches,
    usesPlatform: USE_PLATFORM.test(src),
  };
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
    .sort();
}

/** Scan both kits' component files under `root` (the repository root) and the tokens. */
export function scan(root: string): Scan {
  const read = new Set<string>();
  const dynamic = new Set<string>();
  const reached = new Set<string>();
  // A token a recipe names is read by every kit that reads the recipe: the kits no longer write `t.…` for it.
  for (const recipe of Object.values(recipes) as Recipe[]) {
    for (const e of recipeEntries(recipe)) {
      const path = tokenOf(e.style);
      if (path) read.add(path);
    }
    for (const ref of recipe.reads ?? []) read.add(ref.slice(1));
  }
  const kits = ["packages/react", "packages/react-native"].map((kit): KitScan => {
    const all = walk(join(root, kit, "src"))
      .filter((f) => /\.tsx?$/.test(f) && !/\/index\.ts$/.test(f))
      .map((f) => relative(root, f).split("\\").join("/"));
    const isComponent = (f: string) => f.startsWith(`${kit}/src/components/`);
    const files = all.filter(isComponent).map((f) => scanFile(root, kit, f));
    const support = all.filter((f) => !isComponent(f)).map((f) => scanFile(root, kit, f));
    for (const f of [...files, ...support]) {
      for (const p of Object.keys(f.tokenPaths)) read.add(p);
      for (const d of Object.keys(f.dynamic)) {
        const only = f.dynamicReach[d];
        if (only) only.forEach((p) => reached.add(p));
        else dynamic.add(d);
      }
    }
    const distinct = new Set(files.flatMap((f) => Object.keys(f.tokenPaths)));
    const sum = (pick: (f: FileScan) => number) => files.reduce((n, f) => n + pick(f), 0);
    return {
      kit,
      files,
      support,
      totals: {
        files: files.length,
        tokenRefs: sum((f) => f.tokenRefs),
        distinctTokens: distinct.size,
        colours: sum((f) => f.colours.length),
        dimensions: sum((f) => f.dimensions.length),
        text: sum((f) => f.text.length),
        annotated: sum((f) => f.annotated.length),
        ratios: sum((f) => f.ratios.length),
        platformBranches: sum((f) => f.platformBranches.length),
      },
    };
  });
  return { kits, tokens: scanTokens(read, dynamic, reached) };
}

// --- The ratchet -----------------------------------------------------------------------------

/** What a component file may still hold: `packages/<kit>/literals.allow.json`, `{ "<repo-relative file>": { colours, dimensions, text } }`. A file not listed may hold none. */
export type Allowance = Record<string, { colours: number; dimensions: number; text: number }>;

export const allowancePath = (root: string, kit: string) => join(root, kit, "literals.allow.json");

/** The kit's allowance, or `null` when it has no file yet. */
export function readAllowance(root: string, kit: string): Allowance | null {
  const file = allowancePath(root, kit);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Allowance) : null;
}

/** Each component file's current counts, only those with a literal in them, sorted by path. */
export function currentCounts(kit: KitScan): Allowance {
  const rows = kit.files.filter((f) => f.colours.length || f.dimensions.length || f.text.length).map((f) => [f.file, { colours: f.colours.length, dimensions: f.dimensions.length, text: f.text.length }] as const);
  return Object.fromEntries(rows.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** One line per file, so a burn-down commit diffs one number at a time. */
export const allowanceJson = (a: Allowance) =>
  `{\n${Object.entries(a).map(([f, n]) => `  ${JSON.stringify(f)}: { "colours": ${n.colours}, "dimensions": ${n.dimensions}, "text": ${n.text} }`).join(",\n")}\n}\n`.replace("{\n\n}", "{}");

/** The repository root: the nearest folder above `from` with `pnpm-workspace.yaml`. */
export function repoRoot(from = process.cwd()): string {
  for (let dir = from; ; dir = dirname(dir)) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    if (dirname(dir) === dir) throw new Error(`no pnpm-workspace.yaml above ${from}`);
  }
}
