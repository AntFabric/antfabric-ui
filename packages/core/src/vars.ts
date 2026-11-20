/**
 * The CSS variable a token path becomes, in one place so the kits, the stylesheet, `$path` references
 * in the docs and `pnpm check` cannot disagree: `--af-` + the path with dots as hyphens and every
 * camelCase key split at its capitals, so `control.hMd` is `--af-control-h-md` and `fg.onBrand` is
 * `--af-fg-on-brand`, the product's own `--control-h-md` and `--fg-on-brand` under our prefix.
 */

/** `onBrandSoft` → `on-brand-soft`; a key with no capitals is unchanged. */
export const kebab = (s: string): string => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** `"control.hMd"` → `"--af-control-h-md"`. Takes a dotted token path. */
export const cssVarName = (path: string): string => `--af-${kebab(path.replace(/\./g, "-"))}`;
