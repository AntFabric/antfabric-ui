/**
 * `tokens-map.mts` — where each token in `packages/core/src/tokens.ts` came from.
 *
 *   tsx --tsconfig apps/catalogue/scripts/tsconfig.json apps/catalogue/scripts/tokens-map.mts [flags]
 *
 *   (no flag)        a draft: for every token leaf, the product tokens that match it by name and by
 *                    value, the phone's tokens that match it, and the source it would propose. It is
 *                    compared with the committed `packages/core/tokens.map.json`. Prints, writes nothing.
 *   --json           the draft as JSON
 *   --out <file>     write the draft JSON to a file (a scratch path)
 *   --write          add the leaves the committed map is missing, with their draft entries; entries
 *                    already in the map (hand-checked, with notes) are never touched
 *   --drift          the drift report, read from the committed map: prints `reports/drift.md`
 *   --drift --write  writes `reports/drift.md`, keeping its "History in the product repo" section
 *
 * The map is `{ source, mobile?, note? }` per leaf (see `token-leaves.ts` for what a leaf is):
 *   source   the product's Tier 2 name the value was copied from (`--fg-body`); `mobile:<path>` for a
 *            token in the phone's `tokens.ts` (`mobile:space.md`, `mobile:palette.textMuted`);
 *            `proposal` for a value that is this repository's proposal; `unmapped` for none
 *   mobile   when `source` is a product name and the phone's own token for the mobile profile or
 *            palette is a different one
 *   note     only where the match is not obvious, or where `unmapped` needs its reason
 * The source is the desktop's for a profile leaf. The web profile is a proposal for every leaf (see
 * the description in `tokens.ts`); there is no product web app to copy from.
 *
 * The product is read from the checkouts named by `ANTFABRIC_REPO` and `ANTFABRIC_MOBILE_REPO` (both
 * required). Neither is ever written. `reports/drift.md` is gitignored: it describes the private product.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tokenLeaves, type Context, type Leaf } from "./token-leaves";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
export const MAP_FILE = join(root, "packages/core/tokens.map.json");
const DRIFT_FILE = join(root, "reports/drift.md");
const need = (name: string): string => {
  const v = process.env[name];
  if (!v) {
    console.error(`tokens-map: set ${name} to a checkout of the AntFabric product repo`);
    process.exit(1);
  }
  return v;
};
const PRODUCT = need("ANTFABRIC_REPO");
const MOBILE = need("ANTFABRIC_MOBILE_REPO");

export type Entry = { source: string; mobile?: string; note?: string };
export type TokenMap = Record<string, Entry>;
type Value = string | number;

/* ---------- values ---------- */

/** One spelling per value: lower case, `12px` is 12, colours and numbers in canonical form. */
export function norm(v: Value | undefined): string {
  if (v === undefined) return "";
  if (typeof v === "number") return String(v);
  let s = v.trim().toLowerCase().replace(/\s+/g, " ");
  s = s.replace(/#([0-9a-f]{3})\b/g, (_, h: string) => `#${h.replace(/./g, (c) => c + c)}`);
  s = s.replace(/\s*,\s*/g, ",").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
  // a lone length is a number: "12px" -> "12", "0px" -> "0"
  const lone = s.match(/^(-?[\d.]+)(px)?$/);
  if (lone) return String(Number(lone[1]));
  s = s.replace(/rgb\((\d+),(\d+),(\d+)\)/g, "rgba($1,$2,$3,1)");
  // a shadow's spread of 0 is the default: "0 1px 2px 0 red" is "0 1px 2px red"
  s = s.replace(/((?:^|,)(?:inset )?-?[\d.]+(?:px)? -?[\d.]+(?:px)? [\d.]+(?:px)?) 0(?:px)?(?= (?:rgba|#))/g, "$1");
  s = s.replace(/(?<![\w#.])-?(?:\d+\.?\d*|\.\d+)/g, (n) => String(Number(n)));
  return s;
}
export const same = (a: Value | undefined, b: Value | undefined) => a !== undefined && b !== undefined && norm(a) === norm(b);

/** A product value, with `var(--x)` references followed. */
function resolveVars(v: string, lookup: (name: string) => string | undefined, depth = 0): string {
  if (depth > 12) return v;
  return v.replace(/var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)/g, (all, name: string) => {
    const r = lookup(name);
    return r === undefined ? all : resolveVars(r, lookup, depth + 1);
  });
}

/* ---------- the product (desktop profile of tokens.json) ---------- */

export type ProductToken = { cssVar: string; group: string; description: string; light: string; dark: string; darkOverride: boolean };

export function loadProduct(): { tokens: Map<string, ProductToken>; file: string; version: string } {
  const file = join(PRODUCT, "packages/design-tokens/generated/tokens.json");
  if (!existsSync(file)) throw new Error(`product tokens not found: ${file} (set ANTFABRIC_REPO)`);
  const json = JSON.parse(readFileSync(file, "utf8"));
  const EXT = "$extensions";
  const leaves = (tree: any, prefix = ""): Array<[string, any]> =>
    Object.entries(tree).flatMap(([k, v]: [string, any]) => {
      if (k.startsWith("$")) return [];
      const p = prefix ? `${prefix}.${k}` : k;
      return v && typeof v === "object" && "$value" in v ? [[p, v]] : leaves(v, p);
    });
  const prim = new Map<string, string>();
  for (const [, v] of leaves(json.primitives)) prim.set(v[EXT]["com.antfabric"].cssVar, String(v.$value));
  const desktop = json.profiles.desktop;
  const read = (mode: string) => new Map(leaves(desktop[mode]).map(([g, v]) => [v[EXT]["com.antfabric"].cssVar as string, { g, raw: String(v[EXT]["com.antfabric"].resolved), d: String(v.$description ?? "") }]));
  const light = read("light");
  const dark = read("dark");
  const lookup = (mode: "light" | "dark") => (name: string) => (mode === "dark" ? dark.get(name)?.raw : undefined) ?? light.get(name)?.raw ?? prim.get(name);
  const out = new Map<string, ProductToken>();
  for (const [cssVar, l] of light) {
    out.set(cssVar, {
      cssVar,
      group: l.g,
      description: l.d,
      light: resolveVars(l.raw, lookup("light")),
      dark: resolveVars(dark.get(cssVar)?.raw ?? l.raw, lookup("dark")),
      darkOverride: dark.has(cssVar),
    });
  }
  return { tokens: out, file, version: json.$extensions?.["com.antfabric"]?.repoVersion ?? "?" };
}

/* ---------- the phone's tokens.ts ---------- */

export type MobileToken = { path: string; value: Value; dark?: Value };

export async function loadMobile(): Promise<{ tokens: Map<string, MobileToken>; file: string }> {
  const file = join(MOBILE, "apps/mobile/components/ui/theme/tokens.ts");
  if (!existsSync(file)) throw new Error(`mobile tokens not found: ${file} (set ANTFABRIC_MOBILE_REPO)`);
  const ns: any = await import(file);
  const m = ns.default ?? ns;
  const out = new Map<string, MobileToken>();
  const walk = (o: any, prefix: string) => {
    for (const [k, v] of Object.entries(o)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "number" || typeof v === "string") out.set(p, { path: p, value: v });
      else if (v && typeof v === "object" && !Array.isArray(v)) walk(v, p);
    }
  };
  for (const key of ["space", "optical", "radii", "icon", "control", "borderWidth", "fontSize", "fontWeight", "shell", "tabBar"]) walk(m[key], key);
  for (const key of ["gutter", "ctaHeight", "ctaRadius"]) out.set(key, { path: key, value: m[key] });
  for (const [k, v] of Object.entries<any>(m.lightPalette)) {
    if (typeof v === "string") out.set(`palette.${k}`, { path: `palette.${k}`, value: v, dark: m.darkPalette[k] });
  }
  return { tokens: out, file };
}

/* ---------- names: how a path of ours reads in the product's vocabulary ---------- */

/**
 * The product's role groups (generate.ts `ROLE_GROUPS`). Since G2 our paths are the product's names under
 * the same nesting (`fg.onBrand` is `--fg-on-brand`, `control.hMd` is `--control-h-md`, `brand.default` is
 * `--brand`), so a path's product name is the path read back the way the product's generator split it.
 */
const ROLE_GROUPS = new Set([
  "surface", "fg", "border", "brand", "focus", "success", "warning", "danger", "info", "identity", "radius", "control", "text", "font",
  "leading", "tracking", "shadow", "duration", "ease", "space", "gutter", "gap", "pad", "avatar", "topbar", "breadcrumb", "rail", "content",
  "scrim", "tray", "hover", "link", "lift", "art", "tag", "chip", "badge", "button", "tabs", "divider", "toast", "banner", "icon", "skeleton",
]);

/** The product name `path` has, or would have if the product had the token: `--fg-on-brand`, `--brand`, `--control-h-md`. */
export function productName(path: string): string | undefined {
  const [group, ...rest] = path.split(".");
  if (!ROLE_GROUPS.has(group!)) return undefined;
  const key = rest.join("-").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  return key === "default" ? `--${group}` : `--${group}-${key}`;
}

/* ---------- comparing a leaf with its source ---------- */

/** Values that are a composite of two product tokens, so no single token holds them. */
const DERIVED: Record<string, (p: (name: string) => string | undefined) => string | undefined> = {
  "shadow.focus": (p) => `0 0 0 ${p("--focus-ring-w")} ${p("--focus-ring")}`,
};

type Diff = { context: Context; ours: Value; theirs: Value; where: string; note?: string };

const BASE: Context[] = ["shared", "light", "desktop"];
const baseContext = (leaf: Leaf): Context => BASE.find((c) => leaf[c] !== undefined)!;

/** Where `ours` and the source differ, context by context. Empty when the source is `proposal` or `unmapped`. */
export function diffs(path: string, leaf: Leaf, entry: Entry, product: Map<string, ProductToken>, mobile: Map<string, MobileToken>): Diff[] {
  const out: Diff[] = [];
  const compare = (context: Context, ours: Value | undefined, theirs: Value | undefined, where: string, note?: string) => {
    if (ours === undefined || theirs === undefined) return;
    let t = theirs;
    let n = note;
    const clamp = typeof t === "string" ? t.match(/^clamp\(\s*([^,]+),/i) : null;
    if (clamp) {
      t = clamp[1]!;
      n = `fluid in the product: ${theirs}; compared at its floor`;
    }
    if (!same(ours, t)) out.push({ context, ours, theirs: clamp ? theirs : t, where, note: n });
  };
  const src = entry.source;
  if (src.startsWith("--")) {
    const p = product.get(src);
    if (!p) return out;
    const derive = DERIVED[path];
    const get = (mode: "light" | "dark") => (name: string) => product.get(name)?.[mode];
    const theirs = (mode: "light" | "dark") => (derive ? derive(get(mode)) : p[mode]);
    if (leaf.light !== undefined) {
      compare("light", leaf.light, theirs("light"), `${src} (desktop, light)`);
      compare("dark", leaf.dark, theirs("dark"), `${src} (desktop, dark)`);
    } else if (leaf.shared !== undefined) compare("shared", leaf.shared, theirs("light"), `${src} (desktop)`);
    else compare("desktop", leaf.desktop, theirs("light"), `${src} (desktop)`);
  }
  const m = src.startsWith("mobile:") ? src : entry.mobile;
  if (m) {
    const t = mobile.get(m.slice("mobile:".length));
    if (t) {
      if (leaf.light !== undefined) {
        compare("light", leaf.light, t.value, `${m} (light palette)`);
        compare("dark", leaf.dark, t.dark, `${m} (dark palette)`);
      } else if (leaf.shared !== undefined && leaf.mobile === undefined) compare("shared", leaf.shared, t.value, m);
      else compare("mobile", leaf.mobile ?? leaf.shared, t.value, m);
    }
  }
  return out;
}

/* ---------- the draft ---------- */

const words = (s: string) =>
  new Set(
    s
      .replace(/^--/, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .map((w) => ({ fg: "text", bg: "surface", h: "height", w: "width", btn: "button" }[w] ?? w)),
  );
const similarity = (a: string, b: string) => {
  const x = words(a);
  const y = words(b);
  const common = [...x].filter((w) => y.has(w)).length;
  return common / Math.max(1, Math.min(x.size, y.size));
};

export type Evidence = {
  path: string;
  ours: Leaf;
  proposed: Entry;
  kind: "name+value" | "value" | "name" | "mobile" | "unmapped";
  nameCandidate?: { cssVar: string; value: string; equal: boolean };
  valueCandidates: Array<{ cssVar: string; value: string; similarity: number; bothThemes?: boolean }>;
  mobileCandidates: Array<{ path: string; value: Value; similarity: number }>;
};

const baseOf = (leaf: Leaf) => leaf[baseContext(leaf)]!;

export function draft(product: Map<string, ProductToken>, mobile: Map<string, MobileToken>): Evidence[] {
  const out: Evidence[] = [];
  for (const [path, leaf] of tokenLeaves(true)) {
    const ours = baseOf(leaf);
    const themed = leaf.light !== undefined;
    const pv = (t: ProductToken) => t.light;
    // the product tokens whose value is ours
    const valueCandidates = [...product.values()]
      .filter((t) => same(ours, pv(t)))
      .map((t) => ({ cssVar: t.cssVar, value: pv(t), similarity: similarity(path.replace(/^(color|size|text)\./, ""), `${t.group}`), bothThemes: themed ? same(leaf.dark, t.dark) : undefined }))
      .sort((a, b) => b.similarity - a.similarity || Number(b.bothThemes) - Number(a.bothThemes));
    const nameVar = productName(path);
    const nameTok = nameVar ? product.get(nameVar) : undefined;
    const nameCandidate = nameTok ? { cssVar: nameTok.cssVar, value: nameTok.light, equal: same(ours, nameTok.light) } : undefined;
    // the phone's tokens whose value is ours (colours compare with the light palette)
    const mobileOurs = leaf.mobile ?? leaf.shared ?? leaf.light;
    const mobileCandidates = [...mobile.values()]
      .filter((t) => same(mobileOurs, t.value))
      .map((t) => ({ path: t.path, value: t.value, similarity: similarity(path, t.path) }))
      .sort((a, b) => b.similarity - a.similarity);

    let proposed: Entry = { source: "unmapped" };
    let kind: Evidence["kind"] = "unmapped";
    const plain = typeof ours === "string" ? !/^[\d.]+(px)?$/.test(ours) : false; // colours, shadows, strings: a value match means something
    const bestValue = valueCandidates.find((c) => plain || c.similarity > 0);
    if (nameCandidate?.equal) {
      proposed = { source: nameCandidate.cssVar };
      kind = "name+value";
    } else if (bestValue) {
      proposed = { source: bestValue.cssVar };
      kind = "value";
    } else if (nameCandidate) {
      proposed = { source: nameCandidate.cssVar };
      kind = "name";
    }
    const bestMobile = mobileCandidates.find((c) => (typeof mobileOurs === "string" && !/^[\d.]+$/.test(mobileOurs)) || c.similarity > 0);
    if (bestMobile) {
      if (proposed.source === "unmapped") {
        proposed = { source: `mobile:${bestMobile.path}` };
        kind = "mobile";
      } else if (leaf.mobile !== undefined || themed) proposed.mobile = `mobile:${bestMobile.path}`;
    }
    out.push({ path, ours: leaf, proposed, kind, nameCandidate, valueCandidates: valueCandidates.slice(0, 6), mobileCandidates: mobileCandidates.slice(0, 4) });
  }
  return out;
}

/* ---------- the map ---------- */

export function readMap(): TokenMap {
  if (!existsSync(MAP_FILE)) return {};
  const { $description: _d, ...rest } = JSON.parse(readFileSync(MAP_FILE, "utf8"));
  return rest as TokenMap;
}

const DESCRIPTION =
  "Where each token in src/tokens.ts came from. Keyed by leaf path (the path inside shared, themes.light|dark or profiles.web|desktop|mobile, so a colour in both themes and a size on every platform are one entry). source: the product's Tier 2 name (--fg-body); mobile:<path> for a token in the phone's tokens.ts; proposal; or unmapped. mobile: the phone's own token for the mobile profile or palette when it differs from source. The source of a profile leaf is the desktop's; the web profile is a proposal for every leaf. Drafted by apps/catalogue/scripts/tokens-map.mts and hand-checked; drift against the product is printed by tokens-map.mts --drift.";

export function writeMap(map: TokenMap) {
  const sorted: Record<string, unknown> = { $description: DESCRIPTION };
  for (const k of Object.keys(map).sort()) {
    const { source, mobile, note } = map[k]!;
    sorted[k] = { source, ...(mobile ? { mobile } : {}), ...(note ? { note } : {}) };
  }
  writeFileSync(MAP_FILE, JSON.stringify(sorted, null, 2) + "\n");
}

/* ---------- the drift report ---------- */

export type Kind = "name+value" | "value only" | "role only" | "name only" | "mobile" | "proposal" | "unmapped";

/** How a leaf's source relates to it: a name that is just the product's, a value that is, or only the role. */
export function classify(path: string, leaf: Leaf, entry: Entry, product: Map<string, ProductToken>, mobile: Map<string, MobileToken>): Kind {
  const s = entry.source;
  if (s === "unmapped" || s === "proposal") return s;
  if (s.startsWith("mobile:")) return "mobile";
  const p = product.get(s);
  const base = baseContext(leaf);
  const d = diffs(path, leaf, { source: s }, product, mobile).find((x) => x.context === base);
  const equal = !!p && !d;
  const named = productName(path) === s;
  return named ? (equal ? "name+value" : "name only") : equal ? "value only" : "role only";
}

const show = (v: Value) => (typeof v === "string" ? `\`${v.replace(/\|/g, "\\|")}\`` : `\`${v}\``);

export function driftReport(map: TokenMap, product: ReturnType<typeof loadProduct>, mobile: Awaited<ReturnType<typeof loadMobile>>, history: string): string {
  const leaves = tokenLeaves(true);
  const paths = [...leaves.keys()].sort();
  const kinds = new Map<Kind, string[]>();
  const driftProduct: Array<{ path: string; src: string; diffs: Diff[]; description: string }> = [];
  const driftMobile: Array<{ path: string; src: string; diffs: Diff[] }> = [];
  let withMobile = 0;
  const drifted = new Set<string>();
  for (const path of paths) {
    const leaf = leaves.get(path)!;
    const entry = map[path];
    if (!entry) continue;
    const k = classify(path, leaf, entry, product.tokens, mobile.tokens);
    kinds.set(k, [...(kinds.get(k) ?? []), path]);
    if (entry.source.startsWith("mobile:") || entry.mobile) withMobile++;
    const all = diffs(path, leaf, entry, product.tokens, mobile.tokens);
    const fromProduct = all.filter((d) => d.where.startsWith("--"));
    const fromMobile = all.filter((d) => d.where.startsWith("mobile:"));
    if (fromProduct.length) driftProduct.push({ path, src: entry.source, diffs: fromProduct, description: product.tokens.get(entry.source)?.description ?? "" });
    if (fromMobile.length) driftMobile.push({ path, src: entry.source.startsWith("mobile:") ? entry.source : entry.mobile!, diffs: fromMobile });
    if (all.length) drifted.add(path);
  }
  const n = (k: Kind) => kinds.get(k)?.length ?? 0;
  const L: string[] = [];
  L.push("# Token drift", "");
  L.push(`Generated by \`apps/catalogue/scripts/tokens-map.mts --drift --write\` from \`packages/core/tokens.map.json\`, the product's \`generated/tokens.json\` (repoVersion ${product.version}) and the phone's \`tokens.ts\`. Do not edit the tables by hand; edit the map's \`note\`s and re-run. The history section below is merged in from git.`, "");
  L.push("Drift here is a difference **today**: the product's current value against ours. Whether ours was ever the same, and when the product moved, is in the history section.", "");
  L.push("Rows marked *dark* compare with the product's Charcoal theme, which is experimental and documentation-only (nothing in `apps/desktop` writes `data-theme`, and desktop.css says the app stays light-only); where the product's dark does not override a token, the light value is what it has. Rows marked *shared* or *desktop* are compared at the desktop's base breakpoint.", "");
  L.push("## Headline numbers", "", "| | leaves |", "|---|---:|");
  L.push(`| Token leaves (path after the group; light and dark, or three profiles, are one) | ${paths.length} |`);
  L.push(`| Mapped to a product name, name and value both match | ${n("name+value")} |`);
  L.push(`| Mapped to a product name by value (and role) only; our name differs | ${n("value only")} |`);
  L.push(`| Mapped to a product name that is ours too, but the value differs | ${n("name only")} |`);
  L.push(`| Mapped to a product token by role only; name and value both differ | ${n("role only")} |`);
  L.push(`| Mapped to the phone's tokens only (\`mobile:\`) | ${n("mobile")} |`);
  L.push(`| Proposal | ${n("proposal")} |`);
  L.push(`| Unmapped, each explained below | ${n("unmapped")} |`);
  L.push(`| **Drifted** from the product's desktop value, in any theme | ${driftProduct.length} |`);
  L.push(`| Drifted from the phone's value | ${driftMobile.length} |`);
  L.push(`| Leaves with a phone counterpart (\`mobile:\` source or \`mobile\` field) | ${withMobile} |`, "");
  const named = [...(kinds.get("name+value") ?? []), ...(kinds.get("name only") ?? [])];
  L.push(`Names: ${named.length} leaves carry the product's Tier 2 name (G2 renamed them to it, nested the way its generated object nests them: \`fg.onBrand\` is \`--fg-on-brand\`). ${n("value only") + n("role only")} more are mapped to a product token under another name, because the role matches and the name does not: see the \`source\` of each in \`tokens.map.json\`.`, "");
  const web = [...leaves.entries()].filter(([, l]) => l.web !== undefined);
  const webDiffers = web.filter(([, l]) => !same(l.web, l.desktop));
  L.push(`The web profile is a proposal for every one of its ${web.length} leaves (there is no product web app to copy from), so it has no row above; ${webDiffers.length} of them differ from the desktop's value, which is the proposal's actual content: ${webDiffers.map(([p]) => `\`${p}\``).join(", ")}.`, "");

  L.push("## Drift from the product", "");
  L.push("Our value, the product's current value (resolved through its Tier 1), and the product's own comment on the token, which carries its ADR and what it replaced.", "");
  L.push("| Leaf | Source | Where | Ours | Product now | Product's comment |", "|---|---|---|---|---|---|");
  for (const d of driftProduct) {
    for (const x of d.diffs) {
      const cmt = d.description ? d.description.replace(/\|/g, "\\|") : "";
      const ph = x.context === "dark" && map[d.path]?.mobile ? mobile.tokens.get(map[d.path]!.mobile!.slice(7)) : undefined;
      const agrees = ph && same(x.ours, ph.dark) ? " **Ours is the phone's dark.**" : "";
      L.push(`| \`${d.path}\` | \`${d.src}\` | ${x.context} | ${show(x.ours)} | ${show(x.theirs)} | ${cmt}${agrees} |`);
    }
  }
  L.push("");
  if (driftMobile.length) {
    L.push("## Drift from the phone's tokens", "", "| Leaf | Source | Where | Ours | Phone now |", "|---|---|---|---|---|");
    for (const d of driftMobile) for (const x of d.diffs) L.push(`| \`${d.path}\` | \`${d.src}\` | ${x.context} | ${show(x.ours)} | ${show(x.theirs)} |`);
    L.push("");
  }

  const notes = paths.filter((p) => map[p]?.note && map[p]!.source !== "unmapped");
  const unmapped = paths.filter((p) => map[p]?.source === "unmapped");
  L.push("## Unmapped", "", `${unmapped.length} leaves have no counterpart in the product's \`tokens.json\` or the phone's \`tokens.ts\`. Each says why.`, "", "| Leaf | Why |", "|---|---|");
  for (const p of unmapped) L.push(`| \`${p}\` | ${(map[p]!.note ?? "**no reason recorded**").replace(/\|/g, "\\|")} |`);
  L.push("");
  if (notes.length) {
    L.push("## Notes on mapped leaves", "", "Where the match is not obvious from the name and value.", "", "| Leaf | Source | Note |", "|---|---|---|");
    for (const p of notes) L.push(`| \`${p}\` | \`${map[p]!.source}\`${map[p]!.mobile ? ` + \`${map[p]!.mobile}\`` : ""} | ${map[p]!.note!.replace(/\|/g, "\\|")} |`);
    L.push("");
  }
  L.push(history.trimEnd(), "");
  return L.join("\n");
}

const HISTORY_HEADING = "## History in the product repo";
const HISTORY_PLACEHOLDER = `${HISTORY_HEADING}\n\n(filled in from git history)`;

function keepHistory(): string {
  if (!existsSync(DRIFT_FILE)) return HISTORY_PLACEHOLDER;
  const text = readFileSync(DRIFT_FILE, "utf8");
  const at = text.indexOf(HISTORY_HEADING);
  return at < 0 ? HISTORY_PLACEHOLDER : text.slice(at);
}

/* ---------- command line ---------- */

const argv = process.argv.slice(2);
const flag = (f: string) => argv.includes(f);

async function main() {
  const product = loadProduct();
  const mobile = await loadMobile();
  const map = readMap();

  if (flag("--drift")) {
    const missing = [...tokenLeaves().keys()].filter((p) => !map[p]);
    if (missing.length) throw new Error(`the map has no entry for ${missing.length} leaves (run without flags, then --write): ${missing.slice(0, 5).join(", ")}…`);
    const md = driftReport(map, product, mobile, keepHistory());
    if (flag("--write")) {
      mkdirSync(dirname(DRIFT_FILE), { recursive: true });
      writeFileSync(DRIFT_FILE, md);
      console.log(`wrote ${DRIFT_FILE}`);
    } else process.stdout.write(md);
    return;
  }

  const rows = draft(product.tokens, mobile.tokens);
  const out = argv.indexOf("--out");
  if (out >= 0) writeFileSync(resolve(argv[out + 1]!), JSON.stringify(rows, null, 2));
  if (flag("--json")) {
    console.log(JSON.stringify(rows, null, 2));
  } else if (out < 0 || !flag("--write")) {
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.kind, (counts.get(r.kind) ?? 0) + 1);
    console.log(`${rows.length} leaves; product ${product.version} (${product.tokens.size} desktop tokens), phone ${mobile.tokens.size} tokens`);
    console.log([...counts].map(([k, v]) => `${k} ${v}`).join(" · "), "\n");
    for (const r of rows) {
      const cur = map[r.path];
      const mark = !cur ? "+" : cur.source === r.proposed.source && cur.mobile === r.proposed.mobile ? "=" : "≠";
      const o = r.ours;
      const vals = Object.entries(o).map(([c, v]) => `${c}:${v}`).join(" ");
      console.log(`${mark} ${r.path}  [${r.kind}]  ${r.proposed.source}${r.proposed.mobile ? ` + ${r.proposed.mobile}` : ""}${cur && mark === "≠" ? `   (map: ${cur.source}${cur.mobile ? ` + ${cur.mobile}` : ""})` : ""}`);
      console.log(`    ours ${vals.slice(0, 150)}`);
      if (r.nameCandidate && r.kind !== "name+value") console.log(`    by name  ${r.nameCandidate.cssVar} = ${r.nameCandidate.value}${r.nameCandidate.equal ? "" : "  (differs)"}`);
      if (r.kind !== "name+value" && r.valueCandidates.length) console.log(`    by value ${r.valueCandidates.map((c) => `${c.cssVar}${c.bothThemes ? "*" : ""}`).join(" ")}`);
      if (r.mobileCandidates.length && !r.proposed.source.startsWith("mobile:")) console.log(`    phone    ${r.mobileCandidates.map((c) => c.path).join(" ")}`);
    }
    const stale = Object.keys(map).filter((p) => !tokenLeaves().has(p));
    if (stale.length) console.log(`\nstale map entries (no such token): ${stale.join(", ")}`);
  }
  if (flag("--write")) {
    const fresh = rows.filter((r) => !map[r.path]);
    for (const r of fresh) map[r.path] = r.proposed;
    for (const p of Object.keys(map)) if (!tokenLeaves().has(p)) console.warn(`stale map entry, not removed: ${p}`);
    writeMap(map);
    console.log(`wrote ${MAP_FILE}: ${fresh.length} new entries, ${Object.keys(map).length - fresh.length} kept`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
