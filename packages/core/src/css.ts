/**
 * Tokens → CSS custom properties, plus the few rules inline styles cannot express.
 *
 *   [data-af-platform],[data-af-theme]   the primitives that tokens point at, once each: `--af-p-color-neutral-900`
 *   [data-af-platform]                   shared scales (radius, space, font, motion…)
 *   [data-af-platform="desktop"]         that platform's sizes and type
 *   [data-af-os="android"]               what that OS changes inside its platform's profile (after the profiles, so it wins)
 *   [data-af-theme="dark"]               that theme's colours and shadows
 *
 * A token that is a reference is `--af-fg-body:var(--af-p-color-neutral-900)`; one that is not is its value. Components read
 * `var(--af-fg-body)` either way, so a reference changes nothing they draw.
 *
 * Put both attributes on <html> (or any container) and every React component under it draws at that
 * density and theme. A switch is an attribute change; nothing re-renders. A theme other than AntFabric adds its own sheet,
 * `themeCss(theme)` (theme.ts), whose blocks are these scoped by `[data-af-theme-id="<id>"]` on the same element.
 */

import { primitiveMeta } from "./primitives";
import { isReference, primitiveValue, primitiveVar, referencePath } from "./refs";
import type { Theme } from "./theme";
import { assertBuilt } from "./theme-built";
import { tokens, tokenSource } from "./tokens";
import type { OS, Scheme } from "./types";
import { cssVarName, kebab } from "./vars";

export type Tree = { readonly [k: string]: string | number | Tree };

// Matched on the variable's name (the path as hyphens, after kebab-casing), so `font.weightBold` is `font-weight-bold`.
const UNITLESS_GROUPS = ["font-weight", "opacity", "z", "icon-stroke"];

/** A literal as the sheet writes it, by its variable's name without `--af-`: a number is pixels unless its group has no unit. */
export function cssValue(css: string, v: string | number): string {
  const unitless = typeof v === "number" && UNITLESS_GROUPS.some((g) => css === g || css.startsWith(`${g}-`));
  return typeof v === "number" && !unitless ? `${v}px` : String(v);
}

/**
 * A tree as `[--af-name, value]` pairs. `refs` is given when the tree still holds its references: each becomes `var(--af-p-…)`
 * and its primitive is added to `refs`. Without it, a tree has no references (it is `tokens`, already resolved).
 */
export function flatten(tree: Tree, prefix: string, out: [string, string][], refs?: Set<string>) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith("$")) continue;
    const name = prefix ? `${prefix}-${k}` : k;
    if (typeof v === "object") flatten(v, name, out, refs);
    else {
      const css = kebab(name);
      if (refs && isReference(v)) {
        const path = referencePath(v);
        primitiveValue(path); // throws on a reference that names nothing
        refs.add(path);
        out.push([`--af-${css}`, `var(${primitiveVar(path)})`]);
        continue;
      }
      out.push([`--af-${css}`, cssValue(css, v)]);
    }
  }
  return out;
}

const block = (selector: string, vars: [string, string][]) => `${selector}{${vars.map(([k, v]) => `${k}:${v}`).join(";")}}`;

/**
 * Every token as a CSS variable, scoped by platform and theme, preceded by the primitives they point at. A primitive is
 * emitted on any element that carries either attribute, because a `var()` is substituted where the property is declared,
 * so a primitive must be visible there.
 */
export function tokensCss(): string {
  const used = new Set<string>();
  const parts: string[] = [];
  parts.push(block("[data-af-platform]", flatten(tokenSource.shared, "", [], used)));
  for (const [name, profile] of Object.entries(tokenSource.profiles)) {
    parts.push(block(`[data-af-platform="${name}"]`, flatten(profile, "", [], used)));
  }
  for (const [name, set] of Object.entries(tokenSource.os)) {
    parts.push(block(`[data-af-os="${name}"]`, flatten(set, "", [], used)));
  }
  for (const [name, theme] of Object.entries(tokenSource.themes)) {
    // Light is the default, so a container with only a platform attribute still has colours.
    const sel = name === "light" ? `[data-af-platform],[data-af-theme="light"]` : `[data-af-theme="${name}"]`;
    parts.push(block(sel, flatten(theme, "", [], used)));
  }
  // In the mirror's order, so the block reads like the product's ramps.
  const primitives = Object.keys(primitiveMeta)
    .filter((path) => used.has(path))
    .map((path): [string, string] => {
      const v = primitiveValue(path);
      return [primitiveVar(path), typeof v === "number" ? String(v) : v];
    });
  return [block("[data-af-platform],[data-af-theme],[data-af-os]", primitives), ...parts].join("\n");
}

/** The primitives some token points at, by dotted path: the ones `tokensCss()` emits. */
export function referencedPrimitives(): string[] {
  const used = new Set<string>();
  for (const tree of [tokenSource.shared, ...Object.values(tokenSource.themes), ...Object.values(tokenSource.profiles), ...Object.values(tokenSource.os)] as Tree[]) flatten(tree, "", [], used);
  return Object.keys(primitiveMeta).filter((p) => used.has(p));
}

/** Flat list for the foundations page: name and value, per group. */
export function flatTokens() {
  return {
    shared: flatten(tokens.shared, "", []),
    themes: Object.fromEntries(Object.entries(tokens.themes).map(([k, t]) => [k, flatten(t, "", [])])),
    profiles: Object.fromEntries(Object.entries(tokens.profiles).map(([k, t]) => [k, flatten(t, "", [])])),
    os: Object.fromEntries(Object.entries(tokens.os).map(([k, t]) => [k, flatten(t, "", [])])),
  };
}

/**
 * What every `--af-…` variable is for one platform and scheme, as the browser resolves it from `tokensCss()`: the shared scales,
 * then the platform's sizes, then the OS's changes to them when `os` has a set, then the scheme's colours (the later block wins a
 * name two of them define). For anything that needs a variable's value rather than its name, such as hashing a render.
 *
 * With a `theme`, what the browser resolves with `themeCss(theme)` on the same element: the theme over the base one layer at a
 * time (shared, scheme, profile, OS; base then theme at each), so a base OS leaf still beats the theme's profile leaf.
 */
export function tokenValues(platform: keyof typeof tokens.profiles, scheme: Scheme, os?: OS, theme?: Theme): Record<string, string> {
  if (theme !== undefined) assertBuilt(theme, "tokenValues");
  const out: Record<string, string> = {};
  const set = os ? (tokens.os as Partial<Record<OS, Tree>>)[os] : undefined;
  for (const tree of [tokens.shared, tokens.profiles[platform], ...(set ? [set] : []), tokens.themes[scheme]] as Tree[]) for (const [k, v] of flatten(tree, "", [])) out[k] = v;
  if (!theme?.id) return out;
  // The names are the base's (a theme only changes values), so this keeps the order above and moves the values.
  const sets = theme.sets;
  const layers: [Tree | undefined, Readonly<Record<string, string | number>> | undefined][] = [
    [tokens.shared, sets.shared],
    [tokens.themes[scheme], sets.schemes[scheme]],
    [tokens.profiles[platform], sets.profiles[platform]],
    [set, os ? sets.os[os] : undefined],
  ];
  for (const [base, over] of layers) {
    if (base) for (const [k, v] of flatten(base, "", [])) out[k] = v;
    for (const [path, v] of Object.entries(over ?? {})) {
      const name = cssVarName(path);
      out[name] = cssValue(name.slice(5), v);
    }
  }
  return out;
}

/**
 * The React kit's only stylesheet: keyframes and the pseudo-elements an inline style cannot reach.
 * Everything else a component draws is an inline style over `t`.
 *
 * Focus is drawn by each component as a box-shadow ring, which Windows High Contrast (forced colours) removes; there the
 * `forced-colors` block draws a system-coloured outline on whatever has keyboard focus, and a thin Highlight outline on the current,
 * selected, checked or pressed item, whose fill the mode also removes (WCAG 2.4.7, 1.4.11).
 *
 * A field's browser outline is taken off here (`[data-af-input]:focus`), never inline: an inline `outline: none` beats every rule in a sheet,
 * so in forced colours a focused field showed only its caret. The forced-colours rule is the more specific (`[data-af-platform]` in front),
 * so it wins there and the field gets its CanvasText outline; outside forced colours the kit's own ring is the focus.
 */
export const kitCss = `
@keyframes af-spin{to{transform:rotate(360deg)}}
@keyframes af-sheen{from{background-position:-160px 0}to{background-position:calc(100% + 160px) 0}}
@keyframes af-indeterminate{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
@keyframes af-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes af-bounce{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-3px);opacity:1}}
@keyframes af-ring{0%{box-shadow:0 0 0 0 currentColor}100%{box-shadow:0 0 0 6px transparent}}
@keyframes af-step-pulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes af-lattice{0%,100%{opacity:.15}18%,42%{opacity:1}62%{opacity:.15}}
@keyframes af-shimmer{from{background-position:125% 0}to{background-position:-125% 0}}
@keyframes af-in-fade{from{opacity:0}}
@keyframes af-in-rise{from{opacity:0;transform:translateY(8px)}}
@keyframes af-in-drop{from{opacity:0;transform:translateY(-14px)}}
@keyframes af-in-pop{from{opacity:0;transform:scale(.94)}}
@keyframes af-in-slide-up{from{transform:translateY(100%)}}
@keyframes af-in-slide-down{from{opacity:0;transform:translateY(-100%)}}
@keyframes af-in-slide-left{from{opacity:0;transform:translateX(24px)}}
@keyframes af-in-slide-right{from{opacity:0;transform:translateX(-24px)}}
@keyframes af-in-grow-x{from{opacity:0;transform:scaleX(.4)}}
[data-af-input]::placeholder{color:var(--af-fg-placeholder);opacity:1}
[data-af-input]:focus{outline:none}
[data-af-press]{-webkit-tap-highlight-color:transparent}
[data-af-press]:focus{outline:none}
[data-af-scroll]{scrollbar-width:thin}
[data-af-plot] .recharts-wrapper:focus,[data-af-plot] .recharts-surface:focus{outline:none}
@media (forced-colors:active){[data-af-platform] :focus-visible,[data-af-platform] [data-af-input]:focus{outline:2px solid CanvasText;outline-offset:2px}[data-af-platform] [aria-current]:not([aria-current="false"]),[data-af-platform] [aria-selected="true"],[data-af-platform] [aria-checked="true"],[data-af-platform] [aria-pressed="true"]{outline:1px solid Highlight;outline-offset:-1px}}
@media (prefers-reduced-motion:reduce){[data-af-platform] *{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}[data-af-platform] [data-af-spinner]{animation-duration:2.4s!important;animation-iteration-count:infinite!important}}
`;
