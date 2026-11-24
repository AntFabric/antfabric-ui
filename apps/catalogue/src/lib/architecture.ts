/**
 * What the Architecture page works out at build, apart from the scan: each package's manifest, the token file's structure and provenance, how the two kits compare, and the
 * `file:line` every hand-written statement on the page points at.
 *
 * Two kinds of content live here, and the page says which is which:
 *   - computed from the repository (counts, manifests, checklists, token values);
 *   - written by hand (the notes, the steps, the Button differences), each tied to a real line
 *     through a pattern (`at`), so a moved line follows and a vanished one fails the build.
 *
 * Server-side only (`node:fs`).
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { resolveTokens, tokenVars, tokenSource, tokens } from "@antfabric/ui-core";
import { categories, components } from "@antfabric/ui-docs";
import { FINDINGS, type CountKey } from "./findings";
import { stripComments, type FileScan, type Literal, type Scan } from "./scan";

// --- File:line from a pattern ----------------------------------------------------------------

/** A line in a file, found by what it says rather than by number. Without `at`, the file itself. */
export interface Spot {
  file: string;
  at?: RegExp;
}

/** `path:line` for a spot. Throws when the file or the line is gone, so the build says so. */
export function refOf(root: string, spot: Spot): string {
  const abs = join(root, spot.file);
  if (!existsSync(abs)) throw new Error(`${spot.file} does not exist`);
  if (!spot.at) return spot.file;
  const i = readFileSync(abs, "utf8")
    .split("\n")
    .findIndex((l) => spot.at!.test(l));
  if (i < 0) throw new Error(`${spot.file}: no line matches ${spot.at}`);
  return `${spot.file}:${i + 1}`;
}

// --- Tokens ----------------------------------------------------------------------------------

type Tree = { readonly [k: string]: string | number | Tree };

function leaves(tree: Tree, prefix = "", out = new Map<string, string | number>()) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith("$")) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object") leaves(v, path, out);
    else out.set(path, v);
  }
  return out;
}

const SETS = tokenSource as unknown as { shared: Tree; themes: Record<string, Tree>; profiles: Record<string, Tree> };
/** The same sets with each reference replaced by its value, for a sentence that says what a token is rather than what it points at. */
const RESOLVED = tokens as unknown as { profiles: Record<string, Tree> };

export interface ModeRow {
  set: "shared" | "themes" | "profiles";
  mode: string;
  leaves: number;
  /** Top-level groups, with how many leaves each holds. */
  groups: { name: string; count: number }[];
}

export interface TokenStructure {
  rows: ModeRow[];
  /** Leaf values that are a reference to a primitive of the product's Tier 1 (`{primitives.color.neutral.900}`). */
  references: number;
  themes: string[];
  profiles: string[];
}

function modeRow(set: ModeRow["set"], mode: string, tree: Tree): ModeRow {
  const all = leaves(tree);
  const groups = new Map<string, number>();
  for (const path of all.keys()) {
    const g = path.split(".")[0]!;
    groups.set(g, (groups.get(g) ?? 0) + 1);
  }
  return { set, mode, leaves: all.size, groups: [...groups].map(([name, count]) => ({ name, count })) };
}

/** The shape of `tokens.ts`: its three sets, the modes in each, and the groups inside a mode. */
export function tokenStructure(): TokenStructure {
  const rows = [
    modeRow("shared", "shared", SETS.shared),
    ...Object.entries(SETS.themes).map(([k, t]) => modeRow("themes", k, t)),
    ...Object.entries(SETS.profiles).map(([k, t]) => modeRow("profiles", k, t)),
  ];
  const everything = [SETS.shared, ...Object.values(SETS.themes), ...Object.values(SETS.profiles)];
  const references = everything.reduce((n, tree) => n + [...leaves(tree).values()].filter((v) => typeof v === "string" && /^\{[^}]+\}$/.test(v)).length, 0);
  return { rows, references, themes: Object.keys(SETS.themes), profiles: Object.keys(SETS.profiles) };
}

/** A token's value on every profile: "12px on every profile", or "web 12 · desktop 12 · mobile 13". */
export function acrossProfiles(path: string): string {
  const per = Object.entries(RESOLVED.profiles).map(([name, tree]) => [name, leaves(tree).get(path)] as const);
  const unit = (v: string | number | undefined) => (v === undefined ? "none" : typeof v === "number" ? `${v}` : v.replace(/px$/, ""));
  const first = unit(per[0]?.[1]);
  return per.every(([, v]) => unit(v) === first) ? `${first} on every profile` : per.map(([n, v]) => `${n} ${unit(v)}`).join(" · ");
}

export interface Provenance {
  total: number;
  /** Mapped to a product token name (`--fg-body`). */
  product: number;
  /** Mapped to the phone's own tokens (`mobile:space.md`). */
  mobile: number;
  proposal: number;
  unmapped: number;
}

/** Where each token came from (`packages/core/tokens.map.json`). */
export function provenance(root: string): Provenance {
  const map = JSON.parse(readFileSync(join(root, "packages/core/tokens.map.json"), "utf8")) as Record<string, { source?: string }>;
  const out: Provenance = { total: 0, product: 0, mobile: 0, proposal: 0, unmapped: 0 };
  for (const [path, e] of Object.entries(map)) {
    if (path.startsWith("$")) continue;
    out.total++;
    const s = e.source ?? "";
    if (s.startsWith("--")) out.product++;
    else if (s.startsWith("mobile:")) out.mobile++;
    else if (s === "proposal") out.proposal++;
    else out.unmapped++;
  }
  return out;
}

// --- Packages --------------------------------------------------------------------------------

interface PackageSpec {
  dir: string;
  /** Written by hand. */
  note: string;
  key: (Spot & { what: string })[];
}

const PACKAGE_SPECS: PackageSpec[] = [
  {
    dir: "packages/core",
    note: "Holds the one thing both kits must agree on, so it imports nothing from them.",
    key: [
      { file: "packages/core/src/tokens.ts", at: /^export const tokenSource/, what: "The token object, with its references: shared, themes (light, dark) and profiles (web, desktop, mobile)." },
      { file: "packages/core/src/native.ts", at: /^export function tokenVars/, what: "tokenVars() makes every leaf a var(--af-…) string; resolveTokens() makes plain values for React Native." },
      { file: "packages/core/src/css.ts", at: /^export function tokensCss/, what: "tokensCss() writes the variables, scoped by data-af-platform and data-af-theme; kitCss holds the keyframes." },
      { file: "packages/core/src/motion.ts", at: /^export const MOTION/, what: "The entrance motions (pop, rise, slide) and their timings." },
      { file: "packages/core/src/format.ts", at: /^export function formatShortcut/, what: "Draws a shortcut written once (Mod+Enter) with each OS's glyphs." },
      { file: "packages/core/src/state.ts", at: /^export function useControllable/, what: "useControllable(): a prop a press changes. Both kits import it from here." },
      { file: "packages/core/src/state.ts", at: /^export function ForceState/, what: "ForceState and useForcedState: the forced states the catalogue draws, one context for both kits." },
      { file: "packages/core/tokens.map.json", what: "Where each token was copied from, and why a token is unmapped." },
    ],
  },
  {
    dir: "packages/docs",
    note: "Props are documented here once and both kits are held to them by pnpm check. Its only workspace dependency is core, for types.",
    key: [
      { file: "packages/docs/src/types.ts", at: /^export interface ComponentDocs/, what: "The shape of a component's docs: props, platforms, examples, edge cases, flows." },
      { file: "packages/docs/src/components/index.ts", what: "An explicit list of every docs file, so plain Node scripts can load them." },
      { file: "packages/docs/src/screens.ts", what: "Metadata for the screens the catalogue draws." },
      { file: "packages/docs/src/platforms/features.ts", what: "The feature matrix behind the Web vs desktop vs mobile page." },
    ],
  },
  {
    dir: "packages/react",
    note: "One file per component serves the browser and the Tauri window. What differs by OS comes from usePlatform(); what differs by density comes from the token variables above it.",
    key: [
      { file: "packages/react/src/tokens.ts", at: /^export const t = /, what: "t: every token as a CSS variable. The one import a component uses for a value." },
      { file: "packages/react/src/platform.tsx", at: /^export function AntFabricRoot/, what: "AntFabricRoot sets the platform and theme attributes and injects the stylesheet; usePlatform() reads them." },
      { file: "packages/react/src/lib/interaction.ts", at: /^export function useInteraction/, what: "Hover, press and focus as state, because inline styles have no :hover." },
      { file: "packages/react/src/lib/style.ts", at: /^export function css/, what: "Base styles (box, row, pressable, text) and css() to merge style objects." },
      { file: "packages/react/src/lib/icon.tsx", at: /^export function Icon/, what: "Icon (lucide by name, sized by tokens) and Spinner." },
    ],
  },
  {
    dir: "packages/react-native",
    note: "Styles are built from the resolved phone tokens, not CSS variables, so a component reads numbers and hex values. React Native selects fonts by file, which is why font() carries file names that are not in tokens.ts.",
    key: [
      { file: "packages/react-native/src/theme.tsx", at: /^const tokensFor/, what: "The tokens for one scheme, OS and brand, memoised in core; ThemeProvider, useTheme() and createStyles() hang off it." },
      { file: "packages/react-native/src/lib/press.ts", at: /^export function usePress/, what: "Pressed and focused as state. There is no hover on a phone." },
      { file: "packages/react-native/src/lib/type.ts", at: /^export function font/, what: "font(weight, face): maps a weight to a font file." },
      { file: "packages/react-native/src/lib/motion.tsx", at: /^export function Enter/, what: "Enter and useEnter(): the MOTION entrances through Animated." },
      { file: "packages/react-native/src/lib/glass.tsx", at: /^export function GlassSurface/, what: "GlassSurface: Liquid Glass when the app has expo-glass-effect, a fallback otherwise." },
    ],
  },
  {
    dir: "apps/catalogue",
    note: "The only reader of the kits today. It points react-native at react-native-web and stubs expo-glass-effect, so the phone kit draws in a browser.",
    key: [
      { file: "apps/catalogue/src/lib/scan.ts", at: /^export function scan/, what: "The scan behind pnpm report and this page." },
      { file: "apps/catalogue/src/preview/kit.tsx", at: /^export function Stage/, what: "Stage: each kit's providers around a preview." },
      { file: "apps/catalogue/src/pages/search.json.ts", what: "The search index, built from the docs and each page's headings." },
      { file: "apps/catalogue/scripts/check.tsx", what: "pnpm check: the test suite." },
      { file: "apps/catalogue/astro.config.mjs", what: "The aliases that let the phone kit run on the web." },
    ],
  },
];

export interface PackageInfo {
  dir: string;
  name: string;
  version: string;
  description: string;
  dependsOn: { name: string; workspace: boolean; peer: boolean }[];
  consumedBy: string[];
  /** `.ts`, `.tsx`, `.astro` files under `src/`. */
  sourceFiles: number;
  keyFiles: { ref: string; what: string }[];
  note: string;
}

function countSource(dir: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir, { withFileTypes: true }).reduce((n, e) => {
    const p = join(dir, e.name);
    return n + (e.isDirectory() ? countSource(p) : /\.(tsx?|astro)$/.test(e.name) ? 1 : 0);
  }, 0);
}

/** Each package's manifest, who depends on it, and its hand-written note and key files. */
export function packages(root: string): PackageInfo[] {
  const manifests = PACKAGE_SPECS.map((spec) => ({ spec, json: JSON.parse(readFileSync(join(root, spec.dir, "package.json"), "utf8")) as { name: string; version: string; description?: string; dependencies?: Record<string, string>; peerDependencies?: Record<string, string> } }));
  const names = new Set(manifests.map((m) => m.json.name));
  return manifests.map(({ spec, json }) => ({
    dir: spec.dir,
    name: json.name,
    version: json.version,
    description: json.description ?? "",
    dependsOn: [
      ...Object.keys(json.dependencies ?? {}).map((name) => ({ name, workspace: names.has(name), peer: false })),
      ...Object.keys(json.peerDependencies ?? {}).map((name) => ({ name, workspace: false, peer: true })),
    ],
    consumedBy: manifests.filter((m) => m.json.dependencies?.[json.name]).map((m) => m.json.name),
    sourceFiles: countSource(join(root, spec.dir, "src")),
    keyFiles: spec.key.map((k) => ({ ref: refOf(root, k), what: k.what })),
    note: spec.note,
  }));
}

// --- From tokens.ts to an element ------------------------------------------------------------

interface StepSpec {
  title: string;
  text: string;
  at?: Spot;
}
export interface Step {
  title: string;
  text: string;
  ref?: string;
}

const REACT_STEPS: StepSpec[] = [
  { title: "tokens", text: "One object: shared, themes, profiles, its references to the product's primitives replaced by their values.", at: { file: "packages/core/src/tokens.ts", at: /^export const tokens/ } },
  { title: "tokenVars()", text: "Walks the merged token object and returns the same shape with every leaf replaced by a var(--af-…) string.", at: { file: "packages/core/src/native.ts", at: /^export function tokenVars/ } },
  { title: "t", text: "The kit's one export of it. A component writes t.size.control.md and gets the string var(--af-size-control-md), not a number.", at: { file: "packages/react/src/tokens.ts", at: /^export const t = / } },
  { title: "A component's style", text: "Button's recipe names it for its height (\"$size.control.md\"); the kit's reader turns that into the variable. The value is decided later, in the browser.", at: { file: "packages/core/src/recipes/actions/button.ts", at: /md: \{ height: "\$size\.control\.md"/ } },
  { title: "tokensCss()", text: "Writes each leaf as a custom property, in blocks scoped by attribute: [data-af-platform], [data-af-platform=\"desktop\"], [data-af-theme=\"dark\"].", at: { file: "packages/core/src/css.ts", at: /^export function tokensCss/ } },
  { title: "AntFabricRoot", text: "Sets data-af-platform, data-af-theme and data-af-os on a wrapper and injects the stylesheet once. Whichever attributes are nearest decide the value, and changing them re-themes without a re-render.", at: { file: "packages/react/src/platform.tsx", at: /"data-af-platform": platform/ } },
];

const NATIVE_STEPS: StepSpec[] = [
  { title: "tokens", text: "The same object.", at: { file: "packages/core/src/tokens.ts", at: /^export const tokens/ } },
  { title: "resolveTokens(profile, theme)", text: "Merges shared, the theme and the profile (later wins), then turns \"44px\" into 44.", at: { file: "packages/core/src/native.ts", at: /^export function resolveTokens/ } },
  { title: "tokensFor()", text: "resolveTokens() for the mobile profile, memoised per theme, OS and brand (a tenant's colours), so every component in the tree reads the same object.", at: { file: "packages/react-native/src/theme.tsx", at: /^const tokensFor/ } },
  { title: "ThemeProvider and useTheme()", text: "ThemeProvider puts the scheme's object in context; useTheme() returns it as t, with the OS and the glass flag.", at: { file: "packages/react-native/src/theme.tsx", at: /^export function ThemeProvider/ } },
  { title: "createStyles((t) => …)", text: "Builds a StyleSheet from t once per token object and caches it, so a component's static styles are not rebuilt on render.", at: { file: "packages/react-native/src/theme.tsx", at: /^export function createStyles/ } },
  { title: "A component's style", text: "The same recipe line; the phone's reader looks \"$size.control.md\" up in t and gets the number 44.", at: { file: "packages/core/src/recipes/actions/button.ts", at: /md: \{ height: "\$size\.control\.md"/ } },
];

export interface TokenPath {
  react: Step[];
  native: Step[];
  /** What `t.size.control.md` is at each stop, computed by calling the real functions. */
  example: { path: string; react: string; css: Record<string, string>; native: string };
}

/** The two routes a token takes to an element, with the real functions called for one example. */
export function tokenPath(root: string): TokenPath {
  const steps = (specs: StepSpec[]) => specs.map((s): Step => ({ title: s.title, text: s.text, ref: s.at ? refOf(root, s.at) : undefined }));
  const vars = tokenVars() as unknown as Tree;
  const native = resolveTokens("mobile", "light") as unknown as Tree;
  const get = (tree: Tree, path: string) => leaves(tree).get(path);
  const path = "size.control.md";
  return {
    react: steps(REACT_STEPS),
    native: steps(NATIVE_STEPS),
    example: {
      path: `t.${path}`,
      react: String(get(vars, path)),
      css: Object.fromEntries(Object.entries(SETS.profiles).map(([name, tree]) => [name, String(leaves(tree).get(path))])),
      native: String(get(native, path)),
    },
  };
}

// --- Components: the helpers, and who uses them ------------------------------------------------

interface HelperSpec {
  what: string;
  react: { name: string; use: RegExp; def?: Spot } | null;
  native: { name: string; use: RegExp; def?: Spot } | null;
}

const HELPERS: HelperSpec[] = [
  {
    what: "Hover, press and focus as state",
    react: { name: "useInteraction()", use: /\buseInteraction\(/, def: { file: "packages/react/src/lib/interaction.ts", at: /^export function useInteraction/ } },
    native: { name: "usePress()", use: /\busePress\(/, def: { file: "packages/react-native/src/lib/press.ts", at: /^export function usePress/ } },
  },
  {
    what: "Where it is running: platform, OS, glass",
    react: { name: "usePlatform()", use: /\busePlatform\(/, def: { file: "packages/react/src/platform.tsx", at: /^export function usePlatform/ } },
    native: { name: "useTheme()", use: /\buseTheme\(/, def: { file: "packages/react-native/src/theme.tsx", at: /^export function useTheme/ } },
  },
  {
    what: "Styles over tokens",
    react: { name: "css() and the base styles", use: /\bcss\(|\bpressable\b|\.\.\.box\b|\.\.\.row\b/, def: { file: "packages/react/src/lib/style.ts", at: /^export function css/ } },
    native: { name: "createStyles()", use: /\bcreateStyles\(/, def: { file: "packages/react-native/src/theme.tsx", at: /^export function createStyles/ } },
  },
  {
    what: "A prop a press changes",
    react: { name: "useControllable()", use: /\buseControllable\(/, def: { file: "packages/core/src/state.ts", at: /^export function useControllable/ } },
    native: { name: "useControllable()", use: /\buseControllable\(/, def: { file: "packages/core/src/state.ts", at: /^export function useControllable/ } },
  },
  {
    what: "Icons",
    react: { name: "Icon, Spinner", use: /<Icon\b|<Spinner\b/, def: { file: "packages/react/src/lib/icon.tsx", at: /^export function Icon/ } },
    native: { name: "Icon, Spinner", use: /<Icon\b|<Spinner\b/, def: { file: "packages/react-native/src/lib/icon.tsx", at: /^export function Icon/ } },
  },
  {
    what: "Entrance motion",
    react: { name: "enter()", use: /\benter\(/, def: { file: "packages/react/src/lib/style.ts", at: /^export function enter/ } },
    native: { name: "Enter, useEnter()", use: /<Enter\b|\buseEnter\(/, def: { file: "packages/react-native/src/lib/motion.tsx", at: /^export function Enter/ } },
  },
  {
    what: "Liquid Glass",
    react: { name: "glass()", use: /\bglass\(/, def: { file: "packages/react/src/lib/style.ts", at: /^export function glass/ } },
    native: { name: "GlassSurface", use: /<GlassSurface\b/, def: { file: "packages/react-native/src/lib/glass.tsx", at: /^export function GlassSurface/ } },
  },
  {
    what: "Font by weight",
    react: null,
    native: { name: "font()", use: /\bfont\(/, def: { file: "packages/react-native/src/lib/type.ts", at: /^export function font/ } },
  },
];

export interface HelperRow {
  what: string;
  react: { name: string; ref: string; files: number } | null;
  native: { name: string; ref: string; files: number } | null;
}

/** The helpers a component is built from in each kit, and in how many component files each is used. */
export function helpers(root: string, scan: Scan): { rows: HelperRow[]; files: { react: number; native: number } } {
  const sources = scan.kits.map((k) => k.files.map((f) => stripComments(readFileSync(join(root, f.file), "utf8"))));
  const [react = [], native = []] = sources;
  const count = (srcs: string[], re: RegExp) => srcs.filter((s) => re.test(s)).length;
  return {
    rows: HELPERS.map((h) => ({
      what: h.what,
      react: h.react ? { name: h.react.name, ref: h.react.def ? refOf(root, h.react.def) : "", files: count(react, h.react.use) } : null,
      native: h.native ? { name: h.native.name, ref: h.native.def ? refOf(root, h.native.def) : "", files: count(native, h.native.use) } : null,
    })),
    files: { react: react.length, native: native.length },
  };
}

export interface ComponentFiles {
  id: string;
  react: string;
  native: string;
  docs: string;
  reactIndex: string;
  nativeIndex: string;
}

/** The files one component is made of, each checked to exist. */
export function componentFiles(root: string, scan: Scan, id: string): ComponentFiles {
  const file = (kit: number) => scan.kits[kit]?.files.find((f) => f.id === id);
  const r = file(0);
  const n = file(1);
  const doc = components.find((c) => c.id === id);
  if (!r || !n || !doc) throw new Error(`${id} is not in both kits and the docs`);
  const dir = (f: FileScan) => f.file.replace(/\/[^/]+$/, "");
  return {
    id,
    react: refOf(root, { file: r.file }),
    native: refOf(root, { file: n.file }),
    docs: refOf(root, { file: `packages/docs/src/components/${doc.category}/${doc.id}.ts` }),
    reactIndex: refOf(root, { file: `${dir(r)}/index.ts`, at: new RegExp(`from "\\./${id}"`) }),
    nativeIndex: refOf(root, { file: `${dir(n)}/index.ts`, at: new RegExp(`from "\\./${id}"`) }),
  };
}

// --- Kit comparison --------------------------------------------------------------------------

export interface KitCell {
  /** The kit has the component's file. */
  present: boolean;
  /** The docs say the component does not exist on this kit's platforms. */
  na: boolean;
  refs: number;
  colours: number;
  dimensions: number;
  branches: number;
}

export interface MatrixRow {
  id: string;
  name: string;
  category: string;
  react: KitCell;
  native: KitCell;
}

export interface KitMatrix {
  rows: MatrixRow[];
  /** Component files in a kit that no docs file describes. */
  undocumented: { react: string[]; native: string[] };
  summary: { documented: number; both: number; onlyReact: number; onlyNative: number; neither: number };
}

const cell = (f: FileScan | undefined, na: boolean): KitCell => ({
  present: !!f,
  na,
  refs: f?.tokenRefs ?? 0,
  colours: f?.colours.length ?? 0,
  dimensions: f?.dimensions.length ?? 0,
  branches: f?.platformBranches.length ?? 0,
});

/** Every documented component against both kits, with what the scan found in each file. */
export function kitMatrix(scan: Scan): KitMatrix {
  const [react, native] = scan.kits;
  const byId = (files: FileScan[] | undefined) => new Map((files ?? []).map((f) => [f.id, f]));
  const reactFiles = byId(react?.files);
  const nativeFiles = byId(native?.files);
  const categoryName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const rows = components.map((doc): MatrixRow => {
    const isNa = (...ps: ("web" | "desktop" | "mobile")[]) => ps.every((p) => doc.platforms[p].status === "not-applicable");
    return {
      id: doc.id,
      name: doc.name,
      category: categoryName[doc.category] ?? doc.category,
      react: cell(reactFiles.get(doc.id), isNa("web", "desktop")),
      native: cell(nativeFiles.get(doc.id), isNa("mobile")),
    };
  });
  const ids = new Set(components.map((c) => c.id));
  return {
    rows,
    undocumented: { react: [...reactFiles.keys()].filter((id) => !ids.has(id)), native: [...nativeFiles.keys()].filter((id) => !ids.has(id)) },
    summary: {
      documented: rows.length,
      both: rows.filter((r) => r.react.present && r.native.present).length,
      onlyReact: rows.filter((r) => r.react.present && !r.native.present).length,
      onlyNative: rows.filter((r) => !r.react.present && r.native.present).length,
      neither: rows.filter((r) => !r.react.present && !r.native.present).length,
    },
  };
}

export interface CompareSide {
  file: string;
  refs: number;
  distinct: number;
  branches: number;
  colours: Literal[];
  dimensions: Literal[];
  /** Token paths read, by group (`fg`, `control`, `space`): path → lines. */
  groups: Record<string, Record<string, number[]>>;
}

export interface Compare {
  id: string;
  react: CompareSide | null;
  native: CompareSide | null;
  /** Every group either side reads, and for each token which kits read it. */
  rows: { group: string; tokens: { path: string; react: boolean; native: boolean }[] }[];
}

/** `color.text.strong` is in `fg`; `size.control.md` is in `control`. */
const groupOf = (path: string) => path.split(".")[0]!;

const side = (f: FileScan | undefined): CompareSide | null => {
  if (!f) return null;
  const groups: CompareSide["groups"] = {};
  for (const [path, lines] of Object.entries(f.tokenPaths)) (groups[groupOf(path)] ??= {})[path] = lines;
  return { file: f.file, refs: f.tokenRefs, distinct: Object.keys(f.tokenPaths).length, branches: f.platformBranches.length, colours: f.colours, dimensions: f.dimensions, groups };
};

/** One component's two files side by side: the token paths each reads, grouped, and which kit reads which. */
export function compareComponent(scan: Scan, id: string): Compare {
  const [react, native] = scan.kits;
  const r = side(react?.files.find((f) => f.id === id));
  const n = side(native?.files.find((f) => f.id === id));
  const groups = [...new Set([...Object.keys(r?.groups ?? {}), ...Object.keys(n?.groups ?? {})])].sort();
  return {
    id,
    react: r,
    native: n,
    rows: groups.map((group) => ({
      group,
      tokens: [...new Set([...Object.keys(r?.groups[group] ?? {}), ...Object.keys(n?.groups[group] ?? {})])].sort().map((path) => ({ path, react: !!r?.groups[group]?.[path], native: !!n?.groups[group]?.[path] })),
    })),
  };
}

interface DifferenceSpec {
  what: string;
  react: { at: Spot; says: () => string };
  native: { at: Spot; says: () => string };
}

const BUTTON_REACT = "packages/react/src/components/actions/button.tsx";
const BUTTON_NATIVE = "packages/react-native/src/components/actions/button.tsx";
/** What the two kits share since the pilot: the Button's styling decisions are one recipe, read by both. */
const BUTTON_RECIPE = "packages/core/src/recipes/actions/button.ts";

/** Written by hand, each end tied to its line; the values in the sentences are read from the tokens. */
const BUTTON_DIFFERENCES: DifferenceSpec[] = [
  {
    what: "Ink, pressed",
    react: { at: { file: BUTTON_RECIPE, at: /Ink turns coral on hover and one step deeper/ }, says: () => "Pressed fill is brand.active, one step deeper than the coral it turned on hover." },
    native: { at: { file: BUTTON_RECIPE, at: /Ink turns coral on hover and one step deeper/ }, says: () => "The same: brand.active, from the one recipe line (the phone's own entry was removed under item 43)." },
  },
  {
    what: "Label size",
    react: { at: { file: BUTTON_RECIPE, at: /md: \{ height/ }, says: () => `sm and md read t.button.labelFontSizeSm and labelMd (${acrossProfiles("button.labelFontSizeMd")}); lg reads t.button.labelFontSizeLg (${acrossProfiles("button.labelFontSizeLg")}).` },
    native: { at: { file: BUTTON_RECIPE, at: /md: \{ height/ }, says: () => `The same recipe line, read through the phone's profile: three tokens that are all the phone's body size (${acrossProfiles("button.labelFontSizeMd")}).` },
  },
  {
    what: "Icon size",
    react: { at: { file: BUTTON_RECIPE, at: /variants: \{ size: \{ sm: \{ square: "\$button\.iconSizeSm"/ }, says: () => `sm reads t.button.iconSizeSm (${acrossProfiles("button.iconSizeSm")}); md and lg read iconMd and iconLg (${acrossProfiles("button.iconSizeMd")}).` },
    native: { at: { file: BUTTON_NATIVE, at: /<Icon testID=\{partId\(testID, "button", "icon"\)\} name=\{iconLeading\}/ }, says: () => `The same three tokens, read from the recipe and passed as the icon's size (${acrossProfiles("button.iconSizeMd")}).` },
  },
  {
    what: "Hover",
    react: { at: { file: BUTTON_RECIPE, at: /primary: \{ bg: "\$color\.background\.brand\.default".*hover: \{ bg: "\$color\.background\.brand\.hover"/ }, says: () => "Every variant has a hover look." },
    native: { at: { file: BUTTON_NATIVE, at: /A phone has no hover/ }, says: () => "None, by design." },
  },
  {
    what: "Press feedback",
    react: { at: { file: BUTTON_RECIPE, at: /pressed: \{ bg: "\$color\.background\.brand\.pressed" \}/ }, says: () => "Changes the background only." },
    native: { at: { file: BUTTON_NATIVE, at: /scale: 0\.97/ }, says: () => "Changes the background and scales the button to the literal 0.97." },
  },
  {
    what: "Shortcut hint",
    react: { at: { file: BUTTON_REACT, at: /shortcut\?: string/ }, says: () => "A shortcut prop, drawn through formatShortcut()." },
    native: { at: { file: BUTTON_NATIVE, at: /^export interface ButtonProps/ }, says: () => "No such prop: the docs scope it to web and desktop." },
  },
];

export interface Difference {
  what: string;
  react: { ref: string; says: string };
  native: { ref: string; says: string };
}

export function buttonDifferences(root: string): Difference[] {
  return BUTTON_DIFFERENCES.map((d) => ({
    what: d.what,
    react: { ref: refOf(root, d.react.at), says: d.react.says() },
    native: { ref: refOf(root, d.native.at), says: d.native.says() },
  }));
}

// --- Findings --------------------------------------------------------------------------------

/** The scan's current value for a number a finding quotes. */
export function countOf(scan: Scan, key: CountKey): number {
  const t = scan.tokens;
  const kit = (name: string) => scan.kits.find((k) => k.kit === `packages/${name}`);
  switch (key) {
    case "tokens.total":
      return t.total;
    case "tokens.withoutDescription":
      return t.withoutDescription.length;
    case "tokens.unread":
      return t.unread.length;
    case "tokens.sameLightDark":
      return t.sameLightDark.length;
    case "tokens.sameInDarkByDesign":
      return t.sameInDarkByDesign.length;
    default: {
      const [name, what] = key.split(".") as ["react" | "react-native", "files" | "colours" | "dimensions"];
      return kit(name)?.totals[what] ?? Number.NaN;
    }
  }
}

/** Every `file:line` the page cites from its own data (not the findings, which have their own check). */
export function citedRefs(root: string, scan: Scan): string[] {
  const refs = [
    ...packages(root).flatMap((p) => p.keyFiles.map((k) => k.ref)),
    ...[...REACT_STEPS, ...NATIVE_STEPS].flatMap((s) => (s.at ? [refOf(root, s.at)] : [])),
    ...HELPERS.flatMap((h) => [h.react?.def, h.native?.def].flatMap((d) => (d ? [refOf(root, d)] : []))),
    ...buttonDifferences(root).flatMap((d) => [d.react.ref, d.native.ref]),
    refOf(root, README_NOTE),
    ...Object.values(componentFiles(root, scan, EXAMPLE_COMPONENT)),
  ];
  return [...new Set(refs)];
}

/** The component the page uses as its worked example. */
export const EXAMPLE_COMPONENT = "button";

/** The line that says nothing outside this repository consumes the kits yet. */
export const README_NOTE: Spot = { file: "README.md", at: /Neither app consumes the kits yet/ };

/** Every `file:line` in `FINDINGS` that does not name a real line, as messages. */
export function brokenFindingRefs(root: string): string[] {
  const out: string[] = [];
  for (const f of FINDINGS) {
    for (const ref of f.refs) {
      const m = /^(.+?)(?::(\d+))?$/.exec(ref);
      const file = m?.[1] ?? ref;
      const abs = join(root, file);
      if (!existsSync(abs)) {
        out.push(`${f.id}: ${file} does not exist`);
        continue;
      }
      if (m?.[2]) {
        const lines = readFileSync(abs, "utf8").split("\n").length;
        if (Number(m[2]) > lines || Number(m[2]) < 1) out.push(`${f.id}: ${ref} is past the end of the file (${lines} lines)`);
      }
    }
  }
  return out;
}

// --- The ecosystem drawing -------------------------------------------------------------------

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface EcosystemFacts {
  tokenLeaves: number;
  themes: number;
  profiles: number;
  react: { components: number; refs: number };
  native: { components: number; refs: number };
  docs: number;
  screens: number;
}

/** The ecosystem map as SVG: the five packages, the two kits and the catalogue, and what lives in other repositories. Colours are CSS classes the page styles from the site's variables. */
export function ecosystemSvg(f: EcosystemFacts): string {
  type N = { x: number; y: number; w: number; h: number; cls: string; href?: string; t: string; s: string; m: string };
  const nodes: Record<string, N> = {
    desktopApp: { x: 12, y: 16, w: 250, h: 70, cls: "ext", t: "AntFabric desktop app", s: "Tauri · other repository", m: "its own component layer" },
    productTokens: { x: 287, y: 16, w: 250, h: 70, cls: "ext", t: "@antfabric/design-tokens", s: "the product's token layer", m: "generated/tokens.json" },
    webApp: { x: 562, y: 16, w: 250, h: 70, cls: "ext", t: "AI Console / web app", s: "no app exists yet", m: "web profile is our own, confirmed" },
    mobileApp: { x: 837, y: 16, w: 250, h: 70, cls: "ext", t: "AntFabric mobile app", s: "Expo · other repository", m: "theme/tokens.ts" },
    core: { x: 330, y: 170, w: 440, h: 86, cls: "core", href: "#tokens", t: "@antfabric/ui-core", s: "tokens.ts · css.ts · native.ts · motion.ts", m: `${f.tokenLeaves} token leaves · ${f.themes} themes · ${f.profiles} profiles` },
    react: { x: 20, y: 340, w: 390, h: 86, cls: "react", href: "#packages", t: "@antfabric/ui-react", s: "web + desktop · inline styles over t", m: `${f.react.components} components · ${f.react.refs} token reads` },
    docs: { x: 440, y: 340, w: 220, h: 86, cls: "docs", href: "#packages", t: "@antfabric/ui-docs", s: "props · platforms · flows", m: `${f.docs} documented` },
    native: { x: 690, y: 340, w: 390, h: 86, cls: "native", href: "#packages", t: "@antfabric/ui-react-native", s: "mobile · StyleSheet over useTheme().t", m: `${f.native.components} components · ${f.native.refs} token reads` },
    catalogue: { x: 250, y: 500, w: 600, h: 76, cls: "cat", href: "#components", t: "apps/catalogue (Astro)", s: "draws both kits live · react-native becomes react-native-web", m: `${f.screens} screens · scripts: check, frames, rerender, report` },
  };
  // [from, to, label, dashed, anchor on from's bottom edge, anchor on to's top edge]
  const edges: [string, string, string, boolean, number, number][] = [
    ["desktopApp", "core", "values copied by hand", true, 0.5, 0.1],
    ["productTokens", "core", "mirrored by hand", true, 0.5, 0.35],
    ["webApp", "core", "no source: our own values", true, 0.5, 0.65],
    ["mobileApp", "core", "values copied by hand", true, 0.5, 0.9],
    ["desktopApp", "react", "no import yet", true, 0.2, 0.2],
    ["mobileApp", "native", "no import yet", true, 0.8, 0.8],
    ["core", "react", "tokenVars() → t · tokensCss() → <style>", false, 0.15, 0.6],
    ["core", "docs", "types + MOTION", false, 0.5, 0.5],
    ["core", "native", 'resolveTokens("mobile", scheme)', false, 0.85, 0.4],
    ["react", "catalogue", "islands", false, 0.5, 0.2],
    ["docs", "catalogue", "docs, scenes, screens", false, 0.5, 0.5],
    ["native", "catalogue", "via react-native-web", false, 0.5, 0.8],
  ];
  const edge = ([a, b, label, dashed, fa, fb]: (typeof edges)[number]) => {
    const A = nodes[a]!;
    const B = nodes[b]!;
    const x1 = A.x + A.w * fa;
    const y1 = A.y + A.h;
    const x2 = B.x + B.w * fb;
    const y2 = B.y;
    const my = (y1 + y2) / 2;
    const lx = (x1 + x2) / 2;
    const ly = my + 4;
    return `<g class="eco-edge${dashed ? " dashed" : ""}"><path d="M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}" marker-end="url(#eco-arrow)"/><text class="bg" x="${lx}" y="${ly}" text-anchor="middle">${esc(label)}</text><text x="${lx}" y="${ly}" text-anchor="middle">${esc(label)}</text></g>`;
  };
  const node = (n: N) => {
    const body = `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="10"/><text class="t" x="${n.x + 14}" y="${n.y + 24}">${esc(n.t)}</text><text class="s" x="${n.x + 14}" y="${n.y + 42}">${esc(n.s)}</text><text class="m" x="${n.x + 14}" y="${n.y + 60}">${esc(n.m)}</text>`;
    return n.href ? `<a class="eco-node ${n.cls} link" href="${n.href}">${body}</a>` : `<g class="eco-node ${n.cls}">${body}</g>`;
  };
  return `<svg class="eco" viewBox="0 0 1100 596" role="img" aria-label="How the packages, kits, catalogue and product apps connect"><defs><marker id="eco-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="eco-arrowhead"/></marker></defs>${edges.map(edge).join("")}${Object.values(nodes).map(node).join("")}</svg>`;
}
