/**
 * `primitives.mts` — mirror the product's Tier 1 into `packages/core/src/primitives.ts`.
 *
 *   pnpm primitives            write primitives.ts from the product checkout
 *   pnpm primitives --check    compare primitives.ts with the product as it is now; exit 1 when the product has moved
 *
 * The product repo stays the source for the desktop, console and web values (G1); this repository mirrors its
 * primitives, the only place a literal lives there, through this generated and committed file, and `tokens.ts`
 * points at them with `"{primitives.color.neutral.900}"` where a semantic token's value is one.
 *
 * Read from `$ANTFABRIC_REPO/packages/design-tokens/generated/tokens.json` (a checkout of the AntFabric product repo): the
 * product's own parse of `primitives.css`, which carries each primitive's value, its CSS variable, its type and the
 * comment written beside it, and nests them the way the product does (`color.neutral.900` is `--af-neutral-900`,
 * `raw.4` is `--af-raw-4`, `fontSize.raw-14` is `--af-text-raw-14`). Two things differ from the product's file, both
 * kept in the generated header: an alias such as `--af-font-display: var(--af-font-sans)` is written as the value it
 * resolves to (its note says what it aliases), and `easing` is keyed by its variable's own name (the product's
 * generator cuts `--af-ease-standard` down to `andard`).
 *
 * The product is never written. When there is no product checkout, `--check` says so and exits 0 (CI has none), and
 * writing fails. `pnpm check` verifies only that primitives.ts is well formed, never against the product.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
export const PRIMITIVES_FILE = join(root, "packages/core/src/primitives.ts");
/** The product checkout, from `ANTFABRIC_REPO`. Unset, it names no folder, so `--check` reports no checkout. */
const PRODUCT = process.env.ANTFABRIC_REPO ?? "/nonexistent/ANTFABRIC_REPO-unset";
const TOKENS = join(PRODUCT, "packages/design-tokens/generated/tokens.json");
const EXT = "com.antfabric";

type Mirrored = { path: string; value: string | number; cssVar: string; type: string; note?: string };

/** The DTCG type a primitive has here: the product's, except where `tokens.ts` types the tokens that point at it differently. */
const TYPE_BY_GROUP: Record<string, string> = { fontWeight: "fontWeight", letterSpacing: "number" };

function leaves(tree: any, prefix = ""): Array<[string, any]> {
  return Object.entries(tree).flatMap(([k, v]: [string, any]) => {
    if (k.startsWith("$")) return [];
    const p = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === "object" && "$value" in v ? [[p, v] as [string, any]] : leaves(v, p);
  });
}

function git(...args: string[]): string {
  try {
    return execFileSync("git", ["-C", PRODUCT, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

export function readProduct() {
  const json = JSON.parse(readFileSync(TOKENS, "utf8"));
  const raw = leaves(json.primitives);
  const byPath = new Map(raw);
  const ref = (v: unknown) => /^\{primitives\.([^}]+)\}$/.exec(String(v))?.[1];
  /** An alias primitive's final value, and the primitive it points at. */
  const finalValue = (path: string, depth = 0): string => {
    const v = byPath.get(path)?.$value;
    const next = ref(v);
    if (next === undefined) return String(v);
    if (depth > 8 || !byPath.has(next)) throw new Error(`primitives: ${path} aliases ${next}, which does not resolve`);
    return finalValue(next, depth + 1);
  };
  const cssVar = (p: string): string => byPath.get(p).$extensions[EXT].cssVar;

  // Product path -> the path mirrored here.
  const rename = new Map<string, string>();
  const out: Mirrored[] = [];
  const problems: string[] = [];
  for (const [path, v] of raw) {
    const css: string = cssVar(path);
    const [group, ...rest] = path.split(".");
    let key = rest.join(".");
    // `--af-ease-standard` must be keyed `standard`; the product's file has `andard`.
    if (group === "easing") key = css.replace(/^--af-ease-/, "");
    const mirrored = `${group}.${key}`;
    if (!css.endsWith(`-${key.replace(/\./g, "-")}`)) problems.push(`${path}: its key is not the end of ${css}`);
    rename.set(path, mirrored);
    const final = finalValue(path);
    const aliasOf = ref(v.$value);
    const type = TYPE_BY_GROUP[group!] ?? v.$type;
    const value: string | number = group === "fontWeight" ? Number(final) : final;
    if (typeof value === "number" && !Number.isFinite(value)) problems.push(`${path}: ${final} is not a number`);
    const note = [v.$description, aliasOf ? `Alias of ${rename.get(aliasOf) ?? aliasOf} in the product.` : ""].filter(Boolean).join(" ");
    out.push({ path: mirrored, value, cssVar: css, type, ...(note ? { note } : {}) });
  }
  const seen = new Set<string>();
  for (const m of out) {
    if (seen.has(m.path)) problems.push(`${m.path} is mirrored twice`);
    seen.add(m.path);
  }
  if (problems.length) throw new Error(`primitives: the product's file is not what this script expects:\n  ${problems.join("\n  ")}`);

  const version: string = json.$extensions?.[EXT]?.repoVersion ?? "?";
  const commit = git("log", "-1", "--format=%h (%cs)", "--", "packages/design-tokens") || "unknown";
  const dirty = git("status", "--porcelain", "--", "packages/design-tokens") !== "";
  return { primitives: out, version, commit, dirty, rename };
}

const quote = (s: string) => JSON.stringify(s);
const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k));

/** The text of primitives.ts for what the product holds now. */
export function render(p: ReturnType<typeof readProduct>): string {
  const tree: Record<string, any> = {};
  for (const m of p.primitives) {
    let at = tree;
    const segs = m.path.split(".");
    for (const s of segs.slice(0, -1)) at = at[s] ??= {};
    at[segs[segs.length - 1]!] = m.value;
  }
  const emit = (node: Record<string, any>, depth: number): string[] =>
    Object.entries(node).flatMap(([k, v]) => {
      const pad = "  ".repeat(depth);
      if (typeof v === "object") return [`${pad}${key(k)}: {`, ...emit(v, depth + 1), `${pad}},`];
      return [`${pad}${key(k)}: ${typeof v === "number" ? v : quote(v)},`];
    });
  const meta = p.primitives.map((m) => `  ${quote(m.path)}: { cssVar: ${quote(m.cssVar)}, type: ${quote(m.type)}${m.note ? `, note: ${quote(m.note)}` : ""} },`);
  return [
    "/**",
    " * GENERATED by `pnpm primitives` (apps/catalogue/scripts/primitives.mts). Do not edit: change the product's",
    " * packages/design-tokens/primitives.css and run it again. `pnpm primitives --check` says whether the product has moved.",
    " *",
    " * The product's Tier 1, the one place a literal lives there: ramps, alphas, shadows, the raw size steps, type.",
    ` * Read from ${"packages/design-tokens/generated/tokens.json"} (the product's parse of primitives.css), repoVersion ${p.version},`,
    ` * last commit touching packages/design-tokens ${p.commit}${p.dirty ? ", with uncommitted changes in that folder" : ""}.`,
    " *",
    " * Nested the way the product nests them: `color.neutral.900` is its `--af-neutral-900`, `raw.4` is `--af-raw-4`,",
    " * `fontSize.raw-14` is `--af-text-raw-14`; `primitiveMeta` gives each one's variable. Two differences: an alias such as",
    " * `--af-font-display: var(--af-font-sans)` is written as the value it resolves to, and `easing` is keyed by its variable's",
    " * own name (the product's generator writes `andard` for `--af-ease-standard`). Font weights are numbers; every other value is",
    " * the product's text, which `tokens.ts` points at as `\"{primitives.color.neutral.900}\"`.",
    " *",
    " * Components never read a primitive (`t` has no `primitives`); semantic tokens do, and `pnpm check` fails when a reference",
    " * names one that is not here or a component file reaches for one.",
    " */",
    "",
    "export const primitives = {",
    ...emit(tree, 1),
    "} as const;",
    "",
    "export type Primitives = typeof primitives;",
    "",
    "/** Each primitive by dotted path: the product's CSS variable, the DTCG type it has in tokens.json and the comment the product wrote beside it. */",
    "export const primitiveMeta: Record<string, { readonly cssVar: string; readonly type: string; readonly note?: string }> = {",
    ...meta,
    "};",
    "",
    `/** The product checkout this was mirrored from. */`,
    `export const primitivesFrom = { version: ${quote(p.version)}, commit: ${quote(p.commit)}, clean: ${!p.dirty} } as const;`,
    "",
  ].join("\n");
}

/** What changed between two mirrors, in one line each. */
function summarise(before: Record<string, string | number>, after: Record<string, string | number>): string[] {
  const added = Object.keys(after).filter((k) => !(k in before));
  const removed = Object.keys(before).filter((k) => !(k in after));
  const changed = Object.keys(after).filter((k) => k in before && before[k] !== after[k]);
  const lines: string[] = [];
  const show = (title: string, list: string[], f: (k: string) => string) => list.length && lines.push(`${title} (${list.length}): ${list.slice(0, 8).map(f).join(", ")}${list.length > 8 ? ", …" : ""}`);
  show("added", added, (k) => k);
  show("removed", removed, (k) => k);
  show("changed", changed, (k) => `${k} ${before[k]} -> ${after[k]}`);
  return lines;
}

const flat = (tree: any, prefix = "", out: Record<string, string | number> = {}) => {
  for (const [k, v] of Object.entries(tree)) (v && typeof v === "object" ? flat(v, prefix ? `${prefix}.${k}` : k, out) : (out[prefix ? `${prefix}.${k}` : k] = v as string | number));
  return out;
};

async function main() {
  const check = process.argv.includes("--check");
  if (!existsSync(TOKENS)) {
    const msg = `no product checkout at ${PRODUCT} (set ANTFABRIC_REPO)`;
    if (check) return console.log(`primitives: ${msg}; primitives.ts was not compared with the product.`);
    console.error(`primitives: ${msg}`);
    process.exit(1);
  }
  const p = readProduct();
  const next = render(p);
  const saved = existsSync(PRIMITIVES_FILE) ? readFileSync(PRIMITIVES_FILE, "utf8") : "";
  if (!check) {
    if (saved === next) return console.log(`primitives: packages/core/src/primitives.ts is already current (${p.primitives.length} primitives, product ${p.version}, ${p.commit}).`);
    writeFileSync(PRIMITIVES_FILE, next);
    return console.log(`primitives: wrote packages/core/src/primitives.ts (${p.primitives.length} primitives, product ${p.version}, ${p.commit}).`);
  }
  if (saved === next) return console.log(`primitives: up to date with the product (${p.primitives.length} primitives, ${p.version}, ${p.commit}).`);
  const before = saved ? flat((await import(pathToFileURL(PRIMITIVES_FILE).href)).primitives) : {};
  const diff = summarise(before, flat(Object.fromEntries(p.primitives.map((m) => [m.path, m.value]))));
  console.error(`primitives: the product has moved (${p.version}, ${p.commit}${p.dirty ? ", uncommitted changes" : ""}).`);
  console.error(diff.length ? diff.map((l) => `  ${l}`).join("\n") : "  no primitive's value changed; only the pin, the notes or the order did.");
  console.error("Run `pnpm primitives`, then `pnpm check` and `pnpm tokens:build`, and commit what changed.");
  process.exit(1);
}

// Imported by the one-off tools that need the same reading; run only when it is the entry point.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
