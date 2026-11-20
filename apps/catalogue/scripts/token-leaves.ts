/**
 * What counts as one token in `tokens.ts`, in one place: `tokens.map.json` (the provenance map),
 * `tokens-map.mts` (its draft generator) and `pnpm check` (the map covers every token) all read it.
 *
 * A leaf PATH is the path inside its group, with the group dropped:
 *
 *   shared.radius.card                  ->  radius.card
 *   themes.light.fg.body                ->  fg.body              (themes.dark.… is the same leaf)
 *   profiles.desktop.control.hMd        ->  control.hMd          (profiles.web.… and .mobile.… too)
 *
 * so one decision (a name, a description, a source) covers a colour in both themes and a size on
 * every platform. A path that two groups define (`radius.card` is in `shared` and overridden by
 * `profiles.mobile`) is still one leaf, holding both values. Keys starting with `$` are metadata.
 *
 * A leaf's value is what `tokens.ts` holds, which may be a reference (`"{primitives.raw.44}"`); `tokenLeaves(true)` is the
 * same leaves with each reference replaced by its value, for anything that compares values (the drift report).
 */

import { tokens, tokenSource } from "@antfabric-ui/core";

/** Where a leaf has a value: `shared`, a theme, or a platform profile. */
export type Context = "shared" | "light" | "dark" | "web" | "desktop" | "mobile";

export type Leaf = Partial<Record<Context, string | number>>;

const walk = (tree: object, context: Context, out: Map<string, Leaf>, prefix = "") => {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") walk(value, context, out, path);
    else out.set(path, { ...out.get(path), [context]: value as string | number });
  }
};

/** Every token leaf, by path, with its value in each place that defines it: as written, or resolved when `resolved` is true. */
export function tokenLeaves(resolved = false): Map<string, Leaf> {
  const t = resolved ? tokens : tokenSource;
  const out = new Map<string, Leaf>();
  walk(t.shared, "shared", out);
  walk(t.themes.light, "light", out);
  walk(t.themes.dark, "dark", out);
  walk(t.profiles.web, "web", out);
  walk(t.profiles.desktop, "desktop", out);
  walk(t.profiles.mobile, "mobile", out);
  return out;
}

/** The leaf paths, sorted. */
export const tokenPaths = (): string[] => [...tokenLeaves().keys()].sort();
