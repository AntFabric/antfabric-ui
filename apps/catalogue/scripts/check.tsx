/**
 * `pnpm check [id…]` — the library's tests.
 *
 *   docs     every prop an example, edge case or flow frame passes is declared; icons, tokens and
 *            component ids exist; flows line up (steps, frames, platforms); events' `args` and
 *            `changes` make sense; a `sample` is a valid value (an enum's option, an icon lucide has, never on an event); a matrix row
 *            of `cases` passes only declared props, under unique names, and never beside `values`. `pnpm check docs` also proves the two
 *            mechanisms on a Button fixture: `sample ?? default` and a cases row draw the very markup, count and order the plain docs do
 *   tokens   every token in tokens.ts has an entry in packages/core/tokens.map.json (where it came
 *            from), and every entry names a token that exists; sources are well formed and an
 *            `unmapped` one says why
 *   primitives  packages/core/src/primitives.ts (the product's Tier 1, written by `pnpm primitives`) is well formed: every primitive is text
 *            or a number and has a CSS variable, a type and a place in `primitiveMeta` (and no entry stands without a primitive), no two
 *            become one `--af-p-…` variable, and the pin says where it came from; every `"{primitives.…}"` in tokens.ts names a primitive
 *            that exists; no component or kit file reads a primitive. It is not compared with the product (CI has no checkout):
 *            `pnpm primitives --check` does that
 *   tokens.json  packages/core/tokens.json (the W3C Design Tokens file, `pnpm tokens:build`) equals what `tokensJson()` writes now,
 *            every token has a `$type` (its own or its group's), a `$value` of the shape that type needs and a description, no key is
 *            neither a `$` key nor a group, and its tokens are exactly the leaves of tokens.map.json
 *   palette  the chart palette (part of `tokens`; `pnpm check tokens` runs it): for each theme the eight series against `surface.card` hold OKLCH
 *            lightness in a band (light 0.43–0.77, dark 0.48–0.67), chroma of at least 0.10, neighbours at least 8 apart under protan and
 *            deutan vision (OKLab ΔE × 100, Machado–Oliveira–Fernandes 2009 at severity 1) and at least 15 apart in normal vision. A series
 *            under 3:1 on the card, and the last colour beside the first (where a ninth series wraps), are notes: the relief is the tooltip and
 *            "View as table" on every chart, and the lists that print each name and number (the read-aloud summary is heard, not printed)
 *   chart    the shared chart engine, `@antfabric/ui-core/chart` (`pnpm check chart`): a table of inputs and the outputs expected of the
 *            formatters, `valueDomain`, `niceScale`, `summarize`, `chartTable`, `tipRows`, `prepare` and `lttb`
 *   agent    the files an agent reads (`pnpm check agent`): packages/docs/components.json and llms.txt equal what `pnpm tokens:build` writes now
 *            (so a docs, recipe or token change that was not rebuilt shows), they parse, every component is in components.json with its
 *            props and recipe, and every path components.json cites exists
 *   architecture  the Architecture page can read the repository: `scan()` (the one `pnpm report` prints, so
 *            the page's totals equal the report's) runs and finds both kits, every `file:line` the
 *            page or a finding cites names a real line, a finding's counts resolve, and each h2
 *            has the id the search index links to
 *   literals  no component file holds more colour literals (hex, rgb), dimension literals (a number on a size key) or fixed text (JSX
 *            text, a string given to `aria-label`, `title`, `label` and the like) than its entry in `packages/<kit>/literals.allow.json`
 *            (a file with no entry may hold none): the ratchet. Fewer is a warning to
 *            run `pnpm literals:tighten`, which rewrites the files to the current counts and never raises one. What counts is
 *            described at the top of `src/lib/scan.ts` (`fixedText` for the text); ratios (`opacity: 0.5`) are reported, not banned
 *   strings  built-in text (`packages/core/src/strings`), read from each kit file's syntax tree (scripts/strings-ast.ts, no regular
 *            expressions): every id in `defaultStrings` (but `common`) is a docs id; a component that calls `useStrings("<id>", strings)`
 *            declares the `strings` prop and passes it; every call of the binding (`s(…)`, `s.parts(…)`, under any name) names a key the
 *            dictionary or `common` has, passes the template's placeholders as its variables (and `count` for a plural) and uses its result;
 *            every key is read by every kit that draws the component unless it is declared platform-only (`<category>Only`, typed by `OnlyOn`,
 *            collected by strings/index.ts: the named kit reads it, the other must not). Components that break one are in `stringsTodo` in
 *            reports/generic.json, their reasons printed, and the list only shrinks. The reader and the rules are tested on source written
 *            in `checkStrings`
 *   recipes  every component with a recipe in packages/core/src/recipes: each `$token` exists (for the platforms that read it), only
 *            vocabulary keys are used, every variant prop and value is a documented prop's option, every part is drawn (a
 *            `data-af-part` on the web, a `testID` of `<id>.<part>` on the phone, in at least one render), and each kit file reads
 *            no token the recipe does not grant (its entries for that kit, its `reads`, and the structural allowance: `space.*`,
 *            `duration.*`, `ease.*`). `pnpm check recipes` renders and checks just the components that have one. A theme's recipe
 *            overrides: `recipeFor` changes exactly the fixture's cells in every context, keeps identity, gives the recipe itself
 *            without an override, and `defineTheme` throws on every kind of bad override (`scripts/recipe-override.types.ts` is the types' half)
 *   helpers  no file under packages/react/src/lib is byte-identical to one under packages/react-native/src/lib (a fix would land in one
 *            copy only), and no kit declares a function or component that core also exports under the same name: a kit may re-export
 *            core's binding, not write its own. `pnpm check helpers` runs just this
 *   themes   themes and tenant branding (`pnpm check themes`, or `pnpm check brand`): a brand is a theme's (`defineTheme({ name, brand })`); resolving with
 *            one changes only the brand family and its dependents (`BRAND_PATHS`) and, for `fonts`, the two families and on the phone their files
 *            (`BRAND_FONT_PATHS`), an empty brand is no theme (id `""`, the plain profile, scheme and OS), the same inputs give the same (frozen)
 *            object, a bad colour or family throws, the web's variables under it are exactly the ones `brandValues` has, and the sample tenant's
 *            components draw on both kits (snapshot keys `brand/mobile` and `brand/web`).
 *            Themes: the `antfabric` preset is the empty theme (id `""`, no sheet, the very object `resolveTokens` gives without one); a fixture
 *            theme (a shared radius, a colour per scheme, a mobile size, an Android leaf, a brand and fonts) resolves as the precedence says
 *            (shared, scheme, profile, OS; base then theme at each) on every profile × scheme × OS through `tokenValues` and `resolveTokens`, and
 *            the base sheet plus `themeCss(fixture)`, cascaded as a browser would for each element, gives what `tokenValues` says; ids are stable
 *            (key order does not matter, a value does, one is pinned) and a bad path throws naming it. With no theme given, and with no root or
 *            provider at all, both kits draw `neutral`
 *   code     each kit's `XProps` has exactly the documented props for its platforms (plus `style`, `children`, `testID`, `part` and
 *            `strings`, which are not documented), every
 *            `useControllable(value, onEvent)` is declared as `onEvent.changes`, and no component imports one
 *            at a higher level than its own (an atom drawing a molecule, a molecule drawing an organism). It also holds the
 *            packages' import rules (`pnpm check code` runs just them): `recharts` only under packages/react/src/data/ and
 *            packages/react/src/components/data/, `react-native-gifted-charts` and `gifted-charts-core` only under the same two folders of
 *            packages/react-native/src/, `@tanstack/table-core`
 *            only under packages/core/src/table/, nothing third-party under packages/core/src/chart/, `lucide-react` and
 *            `lucide-react-native` only in their kit's src/lib/icons.ts, whose registry holds exactly the icon names the kit's source
 *            spells (`icons-ast.ts`), and a file under
 *            packages/{react,react-native}/src/templates/ imports only its kit's public entries (and core's). The app frame ships from
 *            each kit's `./shell` (`src/shell/index.ts`): no kit file outside src/shell/ imports that entry, or a file it re-exports (a
 *            category's every file when it re-exports the category's index), so the root and `./data` never reach it; the same of `./chat`
 *            (`src/chat/index.ts`, the conversation idiom), which neither the root, `./data` nor `./shell` reaches
 *   generic  the per-part `styles` prop (`pnpm check generic`, and part of `code`): a component that declares `styles` types it exactly
 *            `PartStyles<"<its id>">`, passes it to `useRecipe`, and does not document it (it is universal); a component with a recipe that
 *            does not declare it in every kit it has is listed in `stylesTodo` in reports/generic.json (sorted ids), and a listed one that
 *            now declares it must be taken off: the list only shrinks. Also a proof on Button: `styles` changes the part it names and
 *            nothing else, in both kits; `partStyle` (the recipe, the kit's inline styles, then `styles[part]`) on a table; and a probe over
 *            every component that declares `styles`: each drawing is drawn with `styles` giving every part a declaration no kit writes and
 *            every size, spacing, radius, colour, opacity and cursor it already had set to another value, and every part that appears must
 *            carry them (`styles` wins over the kit's own inline styles). A component that fails is in `stylesProofTodo` with its parts
 *            The probe also fails a component whose recipe has a `root` part when a drawing shows its parts and no root of its own
 *            (the web: its outermost part is not `root`; the phone: a part of it with no `<id>.root`); today's are in `stylesProofTodo` as `<kit>:root`
 *   conventions  reports/api/conventions.md as far as a machine reads it (`pnpm check conventions`, and part of `code`): no component declares
 *            `onChange` or `collapsed` (docs or either kit), a `required` prop has no documented `default`, every `changes: "<prop>"` event is named
 *            `on<Prop>Change`, and a prop passed to `useControllable` with its event has no destructuring default (handler only keeps its own state). What breaks a rule today is in `conventionsTodo` in reports/generic.json (`{ id: ["<rule>: <detail>"] }`): a violation not
 *            listed fails and a listed one that now passes must come off, so the list only shrinks
 *   defaults  a documented non-event prop with a `default` (not `required`) is the kit's: in the web and the phone kit, the component drawn
 *            with every documented default and again with that one left out draws the same markup. Mismatches are in `defaultsTodo`
 *            (`<id>.<prop>`) in reports/generic.json, and the list only shrinks
 *   renders  every example, variant, state, edge case and flow frame, drawn by the kit on every
 *            OS (and both iOS / macOS versions) on the server, with React's and React Native
 *            Web's warnings counted as failures; each frame's `press` must land on a control
 *   snapshot  one hash per component × platform (and per screen) of everything `renders` drew, with every
 *            `var(--af-…)` replaced by the value it has for that render's platform and theme (so a token's
 *            value changing shows, and a token's name changing does not), compared with
 *            reports/renders.snapshot.json so a refactor that claims "no pixel changes" has to prove it;
 *            `--update-snapshot` accepts a change (and with ids, only theirs). Every render is drawn twice, in two themes: first in
 *            `antfabric` (the keys `button/web`, `screen/inbox`, `button/web@mounted`, which parity holds) and then, as a second pass over the same
 *            set, in `neutral` (`button/web#neutral`, `screen/inbox#neutral`, `button/web@mounted#neutral`: what the kits draw with no theme).
 *            A third pass, `button/web#bare` (components only), is the rest render as a product gets it: the kit's defaults only (a `required` prop
 *            takes its `sample`), no `ANTFABRIC_STRINGS` and the `neutral` theme, on every OS
 *            The hash is over each element's *declarations*, not
 *            how they were written: their order, `border` against its longhands, and React Native Web classes against inline style
 *            do not change it, so moving a style table into another file can be proved to change no pixel
 *   parity   the look the library had at the commit reports/parity.json names stays (`pnpm check parity` draws everything, then
 *            compares reports/renders.snapshot.json with that commit's copy of it): every snapshot key the commit had, `@mounted` keys and
 *            screens included, is still there with the same hash and render count, unless its component or screen id is in the file's
 *            `accepted` (`{ "brand": "why it moved" }`); keys added since are free. Every token leaf in packages/core/tokens.json that the
 *            commit had keeps its `$value` and every mode under `$extensions` (new leaves are fine). `--update-snapshot` does not rewrite a
 *            parity key whose id is not accepted, and names the file to edit. Without git history for the commit (a shallow clone) the
 *            comparisons are skipped with a warning
 *
 * Components a kit does not have yet are counted, not failed.
 */

// First, before either kit loads: the phone's reduced-motion answer is the run's, not the clock's (reduced-motion.ts says why).
import { setReducedMotion } from "./reduced-motion";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createElement, type ReactNode } from "react";
import { Platform as RN, View } from "react-native";
import { renderToString } from "react-dom/server";
import { dirname, join } from "node:path";
import { parseHTML } from "linkedom";
import { icons as lucide } from "lucide";
import { BRAND_FONT_PATHS, BRAND_PATHS, OS_VERSIONS, defaultStrings, formatParts, formatString, mergeStrings, stringsFor, stringsKey, PLATFORM_OS, PLATFORMS, STYLE_KEYS, antfabric, themes, brandValues, cssVarName, defineTheme, resolveTokens, tokens, tokensCss, themeCss, pascal, isReference, primitiveAt, primitiveMeta, primitiveValue, primitiveVar, primitives, primitivesFrom, platformOf, recipeEntries, recipeFor, recipeLayers, mergeLayers, recipes, referencedPrimitives, referencePath, tokenOf, tokenSource, tokenValues, type InteractionState, type OS, type Platform, type Recipe, type RecipeContext, type Scheme, type StateKey, type StyleKey, type StyleValue, type Theme, type ThemeInput } from "@antfabric/ui-core";
import * as Core from "@antfabric/ui-core";
import * as ReactKit from "@antfabric/ui-react";
import * as NativeKit from "@antfabric/ui-react-native";
import * as ReactData from "@antfabric/ui-react/data";
import * as NativeData from "@antfabric/ui-react-native/data";
import * as ReactShell from "@antfabric/ui-react/shell";
import * as NativeShell from "@antfabric/ui-react-native/shell";
import * as ReactChat from "@antfabric/ui-react/chat";
import * as NativeChat from "@antfabric/ui-react-native/chat";
import { components, registry, screens, shownValue, type ComponentDocs, type Scene } from "@antfabric/ui-docs";
import { DefaultsProvider, SceneNode, Stage, Thing, kitComponent, resolveProps } from "../src/preview/kit";
import { pressTarget } from "../src/preview/press";
import { casesFor, defaultsFor, matrixCases, usedIds, withDefaults } from "../src/lib/library";
import { BRAND_SAMPLE, SAMPLE_TENANT } from "../src/lib/brand";
import { currentCounts, readAllowance, repoRoot, scan, stripComments } from "../src/lib/scan";
import { FINDINGS } from "../src/lib/findings";
import { brokenFindingRefs, citedRefs, countOf } from "../src/lib/architecture";
import { slug } from "../src/lib/search";
import { sourceFile } from "./sources";
import * as ReactRecipe from "../../../packages/react/src/lib/recipe";
import * as NativeRecipe from "../../../packages/react-native/src/lib/recipe";
import { placeholdersOf, readStrings, type FileStrings } from "./strings-ast";
import { readControllable } from "./controllable-ast";
import { readIconNames, readIconRegistry } from "./icons-ast";
import { platformOnly, type PlatformOnly, type StringTemplate } from "../../../packages/core/src/strings";
import { PART_MARKS, canonical, normalise, unknownVars, type DrawnIn } from "./snapshot-hash";
import { citedPaths, componentsJson, llmsTxt } from "./agent-surface";
import { tokensJson, EXTENSION, REFERENCE } from "@antfabric/ui-core/dtcg";
import { tokenLeaves, tokenPaths } from "./token-leaves";
import { barLayout, barScale, bySign, chartTable, clampScore, easeFn, cellText as coreCellText, fitLabel, fmt as coreFmt, gaugeState, labelWidth, lineScale, goalsOf, lttb, meterReading as coreMeterReading, meterShown, meterTone, moved as coreMoved, nearestAxis, niceScale, onHalfRing, pickState, prepare as corePrepare, rowIds, segmentAt, segmentsOf, shareOf, sortRows, sparseLabels, summarize as coreSummarize, summarizeCompare as coreSummarizeCompare, summarizeGauge as coreSummarizeGauge, summarizeGoals as coreSummarizeGoals, summarizeSegments as coreSummarizeSegments, tipRows as coreTipRows, toggleRow, totalOf, valueDomain, valueParts as coreValueParts, whenOf, withAlpha, withoutSign, type CompareWords, type FormatSpec, type FormatWords, type GaugeWords, type GoalWords, type SegmentWords, type SummaryWords } from "@antfabric/ui-core/chart";
import { contrast, lightnessChroma, separation } from "../src/lib/palette";
import { rowCount } from "../src/lib/token-ref";

/** The words a format writes, in English: `defaultStrings.common`'s, filled the way every data component fills them from its own strings. */
const EN_WORDS: FormatWords = {
  unavailable: formatString(defaultStrings.common.unavailable),
  points: ({ value }) => formatString(defaultStrings.common.formatPoints, { value }),
  duration: ({ minutes, seconds }) => formatString(defaultStrings.common.formatDuration, { minutes, seconds }),
};
// The core helpers with English words, so the tests below read what each prints; a test of the words themselves passes another set.
const fmt = (spec: FormatSpec | undefined, value: unknown, locale?: string) => coreFmt(spec, value, EN_WORDS, locale);
const summarize = (i: Omit<Parameters<typeof coreSummarize>[0], "formatWords">, w: SummaryWords) => coreSummarize({ ...i, formatWords: EN_WORDS }, w);
const summarizeCompare = (i: Omit<Parameters<typeof coreSummarizeCompare>[0], "formatWords">, w: CompareWords) => coreSummarizeCompare({ ...i, formatWords: EN_WORDS }, w);
const summarizeGoals = (i: Omit<Parameters<typeof coreSummarizeGoals>[0], "formatWords">, w: GoalWords) => coreSummarizeGoals({ ...i, formatWords: EN_WORDS }, w);
const summarizeSegments = (i: Omit<Parameters<typeof coreSummarizeSegments>[0], "formatWords">, w: SegmentWords) => coreSummarizeSegments({ ...i, formatWords: EN_WORDS }, w);
const summarizeGauge = (i: Omit<Parameters<typeof coreSummarizeGauge>[0], "formatWords">, w: GaugeWords) => coreSummarizeGauge({ ...i, formatWords: EN_WORDS }, w);
const tipRows = (row: Parameters<typeof coreTipRows>[0], i: Omit<Parameters<typeof coreTipRows>[1], "formatWords">) => coreTipRows(row, { ...i, formatWords: EN_WORDS });
const valueParts = (spec: FormatSpec | undefined, value: unknown) => coreValueParts(spec, value, EN_WORDS);
const moved = (delta: number, format?: FormatSpec) => coreMoved(delta, EN_WORDS, format);
const meterReading = (value: number, max: number, format?: FormatSpec) => coreMeterReading(value, max, EN_WORDS, format);
const prepare = (data: Parameters<typeof corePrepare>[0], x: string, xFormat?: FormatSpec) => corePrepare(data, x, EN_WORDS, xFormat);

const only: string[] = [];
for (const a of process.argv.slice(2)) if (!a.startsWith("-")) only.push(a);
const parityRun = only.includes("parity");
const quiet = process.argv.includes("--quiet");
const updateSnapshot = process.argv.includes("--update-snapshot");
let errors = 0;
let warnings = 0;
let renders = 0;
let neutralRenders = 0;
let bareRenders = 0;
const waiting = new Map<string, number>();
const err = (at: string, m: string) => {
  errors++;
  console.error(`  ✗ ${at}: ${m}`);
};
/** `--timing` prints how long each of the slower sections took. */
function timed(name: string, run: () => void) {
  const from = performance.now();
  run();
  if (process.argv.includes("--timing")) console.log(`  ${name}: ${((performance.now() - from) / 1000).toFixed(1)}s`);
}
const warn = (at: string, m: string) => {
  warnings++;
  if (!quiet) console.warn(`  ! ${at}: ${m}`);
};

/* ---------- tokens and icons ---------- */

const TOKENS = new Set<string>(tokenPaths());

// A token added or renamed without saying where it came from (or a map entry left behind for one that is gone) leaves provenance and drift unknowable.
function checkTokenMap() {
  const file = fileURLToPath(new URL("../../../packages/core/tokens.map.json", import.meta.url));
  const map = JSON.parse(readFileSync(file, "utf8")) as Record<string, { source?: string; mobile?: string; note?: string }>;
  const at = "tokens.map.json";
  for (const path of TOKENS) if (!map[path]) err(at, `token "${path}" has no entry`);
  // Two paths that kebab-case to one `--af-…` name (`control.hMd` and `control.h-md`) would silently share a value in the stylesheet.
  const named = new Map<string, string>();
  for (const path of TOKENS) {
    const v = cssVarName(path);
    const other = named.get(v);
    if (other) err(at, `"${other}" and "${path}" are both ${v}`);
    named.set(v, path);
  }
  for (const [path, e] of Object.entries(map)) {
    if (path.startsWith("$")) continue;
    if (!TOKENS.has(path)) err(at, `"${path}" is not a token in tokens.ts`);
    if (!/^(--[a-z0-9-]+|mobile:[A-Za-z0-9.]+|proposal|unmapped)$/.test(e.source ?? "")) err(at, `"${path}" has source "${e.source}": expected a product name (--fg-body), mobile:<path>, proposal or unmapped`);
    if (e.mobile && !/^mobile:[A-Za-z0-9.]+$/.test(e.mobile)) err(at, `"${path}" has mobile "${e.mobile}": expected mobile:<path>`);
    if (e.source === "unmapped" && !e.note) err(at, `"${path}" is unmapped without a note saying why`);
  }
}
// A primitives.ts that was hand-edited or half generated (a path with no variable, a value that is an object, two paths that become one `--af-p-…`) breaks every reference to it without the product being involved.
function checkPrimitives() {
  const at = "primitives.ts";
  const flat = new Map<string, string | number>();
  const walk = (node: object, path: string) => {
    for (const [k, v] of Object.entries(node)) {
      const p = path ? `${path}.${k}` : k;
      if (typeof v === "string" || typeof v === "number") flat.set(p, v);
      else if (v && typeof v === "object") walk(v, p);
      else err(at, `${p} is ${JSON.stringify(v)}, not text, a number or a group`);
    }
  };
  walk(primitives, "");
  if (!flat.size) return err(at, "has no primitives");
  const TYPES = new Set(["color", "dimension", "duration", "cubicBezier", "fontFamily", "fontWeight", "number", "shadow", "gradient"]);
  const vars = new Map<string, string>();
  for (const [path, v] of flat) {
    if (typeof v === "string" && !v.trim()) err(at, `${path} is empty`);
    if (typeof v === "number" && !Number.isFinite(v)) err(at, `${path} is not a finite number`);
    const meta = primitiveMeta[path];
    if (!meta) {
      err(at, `${path} has no entry in primitiveMeta`);
      continue;
    }
    if (!/^--af-[a-z0-9-]+$/.test(meta.cssVar)) err(at, `${path} has cssVar "${meta.cssVar}", expected the product's --af-… name`);
    if (!TYPES.has(meta.type)) err(at, `${path} has type "${meta.type}", which tokens.json does not know`);
    if (meta.type === "fontWeight" && typeof v !== "number") err(at, `${path} is a fontWeight but not a number`);
    const name = primitiveVar(path);
    const other = vars.get(name);
    if (other) err(at, `"${other}" and "${path}" are both ${name}`);
    vars.set(name, path);
  }
  for (const path of Object.keys(primitiveMeta)) if (!flat.has(path)) err(at, `primitiveMeta has "${path}" but primitives has no such value`);
  if (!/^\d+\.\d+\.\d+/.test(primitivesFrom.version) || !primitivesFrom.commit) err(at, `primitivesFrom does not say where the mirror came from: ${JSON.stringify(primitivesFrom)}`);

  // A reference that names nothing (a typo, a primitive the product dropped) reaches a component as `undefined` or `never`.
  const refs = (node: object, where: string) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      if (typeof v === "object" && v) refs(v, `${where}.${k}`);
      else if (typeof v === "string" && v.startsWith("{")) {
        if (!isReference(v)) err(at, `${where}.${k} is "${v}": a reference is {primitives.<path>}`);
        else if (primitiveAt(referencePath(v)) === undefined) err(at, `${where}.${k} points at ${v}, which primitives.ts does not have`);
      }
    }
  };
  refs(tokenSource.shared, "shared");
  for (const [m, t] of Object.entries(tokenSource.themes)) refs(t, `themes.${m}`);
  for (const [m, t] of Object.entries(tokenSource.profiles)) refs(t, `profiles.${m}`);

  // Primitives are the product's layer under the roles; a component that read one would hold a literal the roles cannot move.
  const NAMES = ["primitives", "primitiveMeta", "primitivesFrom", "primitiveAt", "primitiveValue", "primitiveVar", "referencedPrimitives"];
  const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(`${dir}/${f}`).isDirectory() ? files(`${dir}/${f}`) : /\.tsx?$/.test(f) ? [`${dir}/${f}`] : []));
  const root = repoRoot();
  for (const kit of ["react", "react-native"]) {
    for (const file of files(`${root}/packages/${kit}/src`)) {
      const src = stripComments(readFileSync(file, "utf8"));
      const where = file.slice(root.length + 1);
      if (/\bt\.primitives\b|\bt\["primitives"\]|--af-p-/.test(src)) err(where, "reads a primitive (t.primitives or --af-p-…); components read roles");
      for (const m of src.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*"@antfabric\/ui-core"/g)) {
        const named = m[1]!.split(",").map((n) => n.trim().split(/\s+as\s+/)[0]!.replace(/^type\s+/, ""));
        const hit = named.find((n) => NAMES.includes(n));
        if (hit) err(where, `imports ${hit} from @antfabric/ui-core; components read roles, not primitives`);
      }
    }
  }
}
// A tokens.json that was not rebuilt after tokens.ts, descriptions.ts or the map changed ships stale values to every tool that reads it, and a token the format cannot read is ignored without a word.
function checkTokensJson() {
  const at = "tokens.json";
  const file = fileURLToPath(new URL("../../../packages/core/tokens.json", import.meta.url));
  let built: string;
  try {
    built = tokensJson();
  } catch (e) {
    return err(at, `tokensJson() throws: ${e instanceof Error ? e.message : String(e)}`);
  }
  const saved = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (saved !== built) err(at, `${saved ? "is stale" : "is missing"}: run \`pnpm tokens:build\` and commit packages/core/tokens.json`);
  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(saved);
  } catch {
    return err(at, "is not valid JSON");
  }

  const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
  const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
  const dimension = (v: unknown) => isObj(v) && isNum(v.value) && (v.unit === "px" || v.unit === "rem");
  const colour = (v: unknown) =>
    isObj(v) && v.colorSpace === "srgb" && Array.isArray(v.components) && v.components.length === 3 && v.components.every((c) => isNum(c) && c >= 0 && c <= 1) &&
    (v.alpha === undefined || (isNum(v.alpha) && v.alpha >= 0 && v.alpha <= 1)) && (v.hex === undefined || (typeof v.hex === "string" && /^#[0-9a-f]{6}$/i.test(v.hex)));
  const layer = (v: unknown) =>
    isObj(v) && colour(v.color) && dimension(v.offsetX) && dimension(v.offsetY) && dimension(v.blur) && dimension(v.spread) && (v.inset === undefined || typeof v.inset === "boolean");
  const SHAPES: Record<string, [string, (v: unknown) => boolean]> = {
    color: ["a srgb colour object", colour],
    dimension: ["{ value, unit: px | rem }", dimension],
    duration: ["{ value, unit: ms | s }", (v) => isObj(v) && isNum(v.value) && (v.unit === "ms" || v.unit === "s")],
    cubicBezier: ["four numbers, x in 0..1", (v) => Array.isArray(v) && v.length === 4 && v.every(isNum) && (v as number[]).every((n, i) => i % 2 === 1 || (n >= 0 && n <= 1))],
    fontFamily: ["a string or a list of strings", (v) => typeof v === "string" || (Array.isArray(v) && v.length > 0 && v.every((f) => typeof f === "string"))],
    fontWeight: ["a number from 1 to 1000", (v) => isNum(v) && v >= 1 && v <= 1000],
    number: ["a number", isNum],
    shadow: ["a shadow object or a list of them", (v) => (Array.isArray(v) ? v.length > 0 && v.every(layer) : layer(v))],
    gradient: ["a list of { color, position 0..1 }", (v) => Array.isArray(v) && v.length > 1 && v.every((s) => isObj(s) && colour(s.color) && isNum(s.position) && s.position >= 0 && s.position <= 1)],
  };
  const valid = (type: string, v: unknown) => (typeof v === "string" && REFERENCE.test(v)) || SHAPES[type]![1](v);

  const found = new Set<string>();
  const pointedAt = new Set<string>();
  const walk = (node: Record<string, unknown>, path: string, inherited: string | undefined) => {
    const type = typeof node.$type === "string" ? node.$type : inherited;
    if (node.$type !== undefined && !(typeof node.$type === "string" && node.$type in SHAPES)) err(at, `${path || "root"} has $type ${JSON.stringify(node.$type)}, which is not one this file uses`);
    const where = path || "root";
    if ("$value" in node) {
      found.add(path);
      if (!type || !(type in SHAPES)) err(at, `${where} has no $type, its own or its group's`);
      else if (!valid(type, node.$value)) err(at, `${where} has a $value that is not ${SHAPES[type]![0]}: ${JSON.stringify(node.$value).slice(0, 80)}`);
      if (typeof node.$description !== "string" || !node.$description.trim()) err(at, `${where} has no $description`);
      const ext = isObj(node.$extensions) ? node.$extensions[EXTENSION] : undefined;
      const modes = isObj(ext) ? ext.modes : undefined;
      if (isObj(modes) && type && type in SHAPES) {
        for (const [m, v] of Object.entries(modes)) if (!valid(type, v)) err(at, `${where}: mode ${m} is not ${SHAPES[type]![0]}`);
      }
      for (const v of [node.$value, ...(isObj(modes) ? Object.values(modes) : [])]) if (typeof v === "string" && REFERENCE.test(v)) pointedAt.add(v.slice(1, -1));
      for (const k of Object.keys(node)) if (!["$type", "$value", "$description", "$extensions"].includes(k)) err(at, `${where} has "${k}", which a token does not`);
      return;
    }
    for (const [k, child] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      if (!isObj(child)) err(at, `${where}.${k} is neither a group nor a token`);
      else walk(child, path ? `${path}.${k}` : k, type);
    }
  };
  walk(doc, "", undefined);

  // The `primitives` group is the product's, not a leaf of tokens.ts, so it has no map entry; what points into it must exist.
  const mapped = new Set(Object.keys(JSON.parse(readFileSync(fileURLToPath(new URL("../../../packages/core/tokens.map.json", import.meta.url)), "utf8"))).filter((k) => !k.startsWith("$")));
  const ours = new Set([...found].filter((p) => !p.startsWith("primitives.")));
  for (const p of mapped) if (!ours.has(p)) err(at, `tokens.map.json has "${p}" but tokens.json has no such token`);
  for (const p of ours) if (!mapped.has(p)) err(at, `"${p}" is in tokens.json but not in tokens.map.json`);
  for (const p of pointedAt) if (!found.has(p)) err(at, `a token points at {${p}}, which tokens.json does not declare`);
}
// A components.json or llms.txt that was not rebuilt after the docs, a recipe or a token changed hands an agent a component that is no longer there, a prop that moved, or a path that 404s.
function checkAgent() {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const saved = (path: string) => (existsSync(root + path) ? readFileSync(root + path, "utf8") : "");
  let json: string;
  let text: string;
  try {
    json = componentsJson();
    text = llmsTxt();
  } catch (e) {
    return err("agent", `building components.json or llms.txt throws: ${e instanceof Error ? e.message : String(e)}`);
  }
  for (const [path, built] of [["packages/docs/components.json", json], ["llms.txt", text]] as const) {
    const have = saved(path);
    if (have !== built) err(path, `${have ? "is stale" : "is missing"}: run \`pnpm tokens:build\` and commit ${path}`);
  }
  let doc: { components?: Record<string, { props?: object; recipe?: object | null }> };
  try {
    doc = JSON.parse(json);
  } catch (e) {
    return err("components.json", `does not parse: ${e instanceof Error ? e.message : String(e)}`);
  }
  for (const c of components) {
    const entry = doc.components?.[c.id];
    if (!entry) err(`components.json ${c.id}`, "is missing");
    else if (!entry.props || ((recipes as Record<string, Recipe>)[c.id] && !entry.recipe)) err(`components.json ${c.id}`, "has no props or no recipe");
  }
  for (const { id, path } of citedPaths(json)) if (!existsSync(root + path)) err(`components.json ${id}`, `cites ${path}, which does not exist`);
  // llms.txt names the files to copy, and where the data and the templates are: each backticked path that looks like one must be there.
  for (const m of text.matchAll(/`((?:packages|apps)\/[A-Za-z0-9_./-]+|[A-Z-]+\.md)`/g)) {
    if (!existsSync(root + m[1]!)) err("llms.txt", `cites ${m[1]}, which does not exist`);
  }
}
// The Architecture page quotes the repository, so a scan that throws, a kit it cannot find, a cited line that has moved
// out of its file or a heading whose id search does not link to would leave the page wrong or blank. The page calls the
// same `scan(repoRoot())` that `pnpm report` prints, so its totals are equal by construction and need no second count.
function checkArchitecture() {
  const at = "architecture";
  const root = repoRoot();
  let result: ReturnType<typeof scan>;
  try {
    result = scan(root);
  } catch (e) {
    err(at, `scan() throws: ${e instanceof Error ? e.message : String(e)}`);
    return;
  }
  if (result.kits.length !== 2) err(at, `scan() found ${result.kits.length} kits, expected React and React Native`);
  for (const k of result.kits) if (!k.totals.files) err(at, `scan() found no component files in ${k.kit}`);
  if (!result.tokens.total) err(at, "scan() found no token leaves");

  try {
    citedRefs(root, result);
  } catch (e) {
    err(at, `a line the page cites is gone: ${e instanceof Error ? e.message : String(e)}`);
  }
  for (const m of brokenFindingRefs(root)) err("findings", m);

  const ids = new Set<string>();
  for (const f of FINDINGS) {
    if (ids.has(f.id)) err("findings", `id "${f.id}" is used twice`);
    ids.add(f.id);
    if (!f.count) continue;
    const now = countOf(result, f.count.key);
    if (!Number.isFinite(now)) err("findings", `${f.id}: ${f.count.key} is not a number the scan computes`);
    else if (now !== f.count.claimed) warn("findings", `${f.id} says ${f.count.key} is ${f.count.claimed}; the scan now says ${now}`);
  }

  const page = readFileSync(fileURLToPath(new URL("../src/pages/architecture.astro", import.meta.url)), "utf8");
  for (const m of page.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)) {
    const text = m[2]!.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const id = /\bid="([^"]+)"/.exec(m[1]!)?.[1];
    if (text.includes("{")) err(at, `h2 "${text}" is drawn from data, so search cannot index it`);
    else if (id !== slug(text)) err(at, `h2 "${text}" has id ${id ? `"${id}"` : "none"}; search links to "#${slug(text)}"`);
  }
}

// A component that takes a new colour or size literal where a token should be read (or any file whose count rose above its allowance) lets the debt grow while the burn-down is under way.
function checkLiterals() {
  const root = repoRoot();
  const result = scan(root);
  for (const kit of result.kits) {
    const allow = readAllowance(root, kit.kit);
    const at = `literals ${kit.kit.replace("packages/", "")}`;
    if (!allow) {
      err(at, `${kit.kit}/literals.allow.json is missing: run \`pnpm literals:tighten\``);
      continue;
    }
    const now = currentCounts(kit);
    for (const f of kit.files) {
      const a = allow[f.file] ?? { colours: 0, dimensions: 0, text: 0 };
      for (const [what, found, max] of [["colours", f.colours, a.colours], ["dimensions", f.dimensions, a.dimensions], ["text", f.text, a.text ?? 0]] as const) {
        if (found.length <= max) continue;
        const lines = found.map((l) => `    line ${l.line}: ${l.prop ? `${l.prop}: ` : ""}${l.value}`).join("\n");
        if (what === "text") err(f.file, `${found.length} fixed text, allowed ${max}: a component's words come from useStrings (see AUTHORING.md, Built-in text), not from the file\n${lines}`);
        else err(f.file, `${found.length} ${what}, allowed ${max}: a new literal needs a token (or take another out first)\n${lines}`);
      }
    }
    const files = new Set(kit.files.map((f) => f.file));
    for (const file of Object.keys(allow)) {
      if (!files.has(file)) warn(file, "is in literals.allow.json but is not a component file: run `pnpm literals:tighten`");
      else if (allow[file]!.colours > (now[file]?.colours ?? 0) || allow[file]!.dimensions > (now[file]?.dimensions ?? 0) || (allow[file]!.text ?? 0) > (now[file]?.text ?? 0)) {
        const n = now[file] ?? { colours: 0, dimensions: 0, text: 0 };
        warn(file, `holds ${n.colours} colours, ${n.dimensions} dimensions and ${n.text} fixed text, allowed ${allow[file]!.colours}, ${allow[file]!.dimensions} and ${allow[file]!.text ?? 0}: run \`pnpm literals:tighten\``);
      }
    }
  }
}

// Text and marks hold their contrast in both shipped themes and two tenant probes, light and dark (WCAG 1.4.3 and 1.4.11): 4.5:1 for text on the
// brand fill (at rest, hovered and pressed) and body text on the surfaces, 3:1 for a chart mark and the focus ring on the card. A colour with alpha
// is laid over what it sits on first. What fails today and is out of reach is in `contrastTodo` (reports/generic.json) with its reason; the list only shrinks.
function checkContrast() {
  const at = "contrast";
  const todo = readGeneric().contrastTodo ?? {};
  type RGBA = [number, number, number, number];
  const parse = (v: string): RGBA => {
    const s = v.trim();
    const h = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s)?.[1];
    if (h) {
      const full = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
      const n = [0, 2, 4, 6].map((i) => (i < full.length ? parseInt(full.slice(i, i + 2), 16) : 255));
      return [n[0]!, n[1]!, n[2]!, n[3]! / 255];
    }
    const m = /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/i.exec(s);
    if (!m) throw new Error(`"${v}" is not a colour the contrast check reads`);
    const a = m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1);
    return [Number(m[1]), Number(m[2]), Number(m[3]), a];
  };
  const over = ([r, g, b, a]: RGBA, [R, G, B]: RGBA): RGBA => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
  const lum = ([r, g, b]: RGBA) => {
    const l = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * l[0]! + 0.7152 * l[1]! + 0.0722 * l[2]!;
  };
  const ratio = (a: RGBA, b: RGBA) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
    return (x + 0.05) / (y + 0.05);
  };
  const SURFACES = ["surface.page", "surface.card", "surface.raised", "surface.sidebar"];
  const MARKS = [...Array.from({ length: 8 }, (_, i) => `chart.series${i + 1}`), "chart.previous", "chart.other", "data.accent", "data.positive", "data.negative", "data.warning", "focus.ring"];
  const pairs: [fg: string, bg: string, min: number][] = [
    ...["brand.default", "brand.hover", "brand.active"].map((bg) => ["fg.onBrand", bg, 4.5] as [string, string, number]),
    ...["fg.body", "fg.muted"].flatMap((fg) => SURFACES.map((bg) => [fg, bg, 4.5] as [string, string, number])),
    ...MARKS.map((fg) => [fg, "surface.card", 3] as [string, string, number]),
  ];
  const probes: [string, Theme][] = [
    ["antfabric", antfabric],
    ["neutral", themes.neutral],
    ["indigo", defineTheme({ name: "Indigo", brand: { primary: "#4F46E5" } })],
    ["yellow", defineTheme({ name: "Yellow", brand: { primary: "#FACC15" } })],
  ];
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const [name, theme] of probes)
    for (const scheme of ["light", "dark"] as const) {
      // The web's values (not `resolveTokens`, whose memo is bounded and would push out what `checkBrand` holds it to).
      const values = tokenValues("web", scheme, undefined, theme);
      const get = (path: string) => parse(values[cssVarName(path)]!);
      const page = over(get("surface.page"), scheme === "light" ? [255, 255, 255, 1] : [0, 0, 0, 1]);
      for (const [fg, bg, min] of pairs) {
        const ground = bg === "surface.page" ? page : over(get(bg), page);
        const r = ratio(over(get(fg), ground), ground);
        const key = `${name}/${scheme}: ${fg} on ${bg}`;
        seen.add(key);
        const listed = key in todo;
        if (r + 0.005 < min && !listed) err(at, `${key} is ${r.toFixed(2)}:1, under ${min}:1. Fix the token, or list "${key}" in contrastTodo in reports/generic.json with the reason`);
        else if (r + 0.005 >= min && listed) err(GENERIC_AT, `contrastTodo lists "${key}", which now holds ${r.toFixed(2)}:1: take it off`);
        else if (listed) rows.push(`${key} ${r.toFixed(2)}:1`);
      }
    }
  const keys = Object.keys(todo);
  if (keys.some((k, i) => i > 0 && keys[i - 1]! >= k)) err(GENERIC_AT, "contrastTodo is not sorted");
  for (const [k, why] of Object.entries(todo)) {
    if (!seen.has(k)) err(GENERIC_AT, `contrastTodo: "${k}" is not a pair the contrast check measures`);
    if (!why.trim()) err(GENERIC_AT, `contrastTodo: "${k}" has no reason`);
  }
  if (!quiet && rows.length) console.warn(`  ! ${at}: (contrastTodo) ${rows.join("; ")}`);
}

// A chart palette whose colours sit too light or too close together fails the people it is for: a series that vanishes on the card, two that merge for someone who cannot tell red from green.
function checkPalette() {
  const at = "palette";
  const BAND = { light: [0.43, 0.77], dark: [0.48, 0.67] } as const;
  const MIN_CHROMA = 0.099; // 0.10, less what the colours' rounding to a hex costs
  const MIN_BLIND = 8;
  const MIN_NORMAL = 15;
  const EPS = 0.0005; // lightness is held to three places
  for (const theme of ["light", "dark"] as const) {
    const t = tokens.themes[theme];
    const series = Object.keys(t.chart).filter((k) => /^series\d+$/.test(k)).sort() as (keyof typeof t.chart)[];
    if (series.length !== 8) err(at, `${theme}: ${series.length} series colours, expected 8`);
    const colours = series.map((k) => t.chart[k]) as string[];
    const [lo, hi] = BAND[theme];
    const lc = colours.map(lightnessChroma);
    colours.forEach((c, i) => {
      if (lc[i]!.l < lo - EPS || lc[i]!.l > hi + EPS) err(at, `${theme} series ${i + 1} ${c}: lightness ${lc[i]!.l.toFixed(3)} is outside ${lo}–${hi}`);
      if (lc[i]!.c < MIN_CHROMA) err(at, `${theme} series ${i + 1} ${c}: chroma ${lc[i]!.c.toFixed(3)} is under 0.10`);
    });
    let blind = Infinity;
    let normal = Infinity;
    for (let i = 0; i < colours.length - 1; i++) {
      const s = separation(colours[i]!, colours[i + 1]!);
      blind = Math.min(blind, s.colourBlind);
      normal = Math.min(normal, s.normal);
      if (s.colourBlind < MIN_BLIND) err(at, `${theme} series ${i + 1} and ${i + 2}: ${s.colourBlind.toFixed(1)} apart under protan or deutan vision, need ${MIN_BLIND}`);
      if (s.normal < MIN_NORMAL) err(at, `${theme} series ${i + 1} and ${i + 2}: ${s.normal.toFixed(1)} apart, need ${MIN_NORMAL}`);
    }
    const card = t.surface.card;
    const low = colours.flatMap((c, i) => (contrast(c, card) < 3 ? [i + 1] : []));
    const wrap = separation(colours[colours.length - 1]!, colours[0]!);
    if (!quiet) {
      console.log(
        `  palette ${theme}: ${colours.length} series, lightness ${Math.min(...lc.map((x) => x.l)).toFixed(3)}–${Math.max(...lc.map((x) => x.l)).toFixed(3)}, chroma ≥ ${Math.min(...lc.map((x) => x.c)).toFixed(3)}, neighbours ≥ ${blind.toFixed(1)} colour-blind and ≥ ${normal.toFixed(1)} normal; ` +
          `under 3:1 on the card: ${low.length ? low.join(", ") : "none"}; 8 beside 1 (a ninth series wraps): ${wrap.colourBlind.toFixed(1)} colour-blind, ${wrap.normal.toFixed(1)} normal`,
      );
    }
  }
}

// The shared chart engine has no unit framework to lean on: each case is an input and the output it must give, so a change to a format or a tick shows as a line here.
function checkChart() {
  const at = "chart";
  let cases = 0;
  const same = (what: string, got: unknown, want: unknown) => {
    cases++;
    if (JSON.stringify(got) !== JSON.stringify(want)) err(at, `${what}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  };
  const utc = Date.UTC(2026, 2, 15);

  // Formatters, through Intl: a name, its options, a locale; a missing value is an en dash.
  const fmts: [string, Parameters<typeof fmt>, string][] = [
    ["integer", ["integer", 1234.6], "1,235"],
    ["integer, de-DE", ["integer", 1234.6, "de-DE"], "1.235"],
    ["decimal with a unit", [{ type: "decimal", unit: "ms" }, 12.34], "12.3ms"],
    ["decimal, digits", [{ type: "decimal", digits: 2 }, 12.345], "12.35"],
    ["compact thousands", ["compact", 12400], "12.4K"],
    ["compact millions", ["compact", 3_200_000], "3.2M"],
    ["compact, under a thousand", ["compact", 987], "987"],
    ["percent", ["percent", 0.124], "12.4%"],
    ["percent, digits 0", [{ type: "percent", digits: 0 }, 0.126], "13%"],
    ["percent, signed gain", [{ type: "percent", sign: true }, 0.124], "+12.4%"],
    ["percent, signed loss", [{ type: "percent", sign: true }, -0.05], "-5%"],
    ["percent, signed zero", [{ type: "percent", sign: true }, 0], "0%"],
    ["points, gain", ["points", 0.032], "+3.2 pts"],
    ["points, loss", ["points", -0.032], "-3.2 pts"],
    ["points, zero", ["points", 0], "0.0 pts"],
    ["points, unsigned", [{ type: "points", sign: false }, -0.032], "3.2 pts"],
    ["currency", ["currency", 12400], "$12,400"],
    ["currency, compact", [{ type: "currency", compact: true }, 12400], "$12.4K"],
    ["currency, euro", [{ type: "currency", currency: "EUR" }, 1234], "€1,234"],
    ["month", [{ type: "month", timeZone: "UTC" }, new Date(utc)], "Mar"],
    ["day", [{ type: "day", timeZone: "UTC" }, new Date(utc)], "Mar 15"],
    ["date", [{ type: "date", timeZone: "UTC" }, new Date(utc)], "Mar 15, 2026"],
    ["date from a timestamp", [{ type: "date", timeZone: "UTC" }, utc], "Mar 15, 2026"],
    ["duration", ["duration", 125], "2m 05s"],
    ["duration, under a minute", ["duration", 45], "0m 45s"],
    ["duration, rounds up to the minute", ["duration", 59.6], "1m 00s"],
    ["a function", [(v: number) => `${v}!`, 3], "3!"],
    ["no spec, a number", [undefined, 42], "42"],
    ["no spec, text", [undefined, "Mon"], "Mon"],
    ["missing", ["integer", null], "–"],
    ["undefined", ["integer", undefined], "–"],
    ["NaN", ["compact", NaN], "–"],
    // The review's inputs (reports/audit/2026-11-23-component-review.md, batch 5).
    ["date, an ISO date-only string (H8)", ["date", "2026-05-01"], "May 1, 2026"],
    ["month, an ISO date-only string (H8)", ["month", "2026-05-01"], "May"],
    ["day, an ISO date-only string (H8)", ["day", "2026-03-01"], "Mar 1"],
    ["date, a full ISO date-time is its instant", [{ type: "date", timeZone: "UTC" }, "2026-03-15T12:00:00Z"], "Mar 15, 2026"],
    ["date, text that is not a date (H8)", ["date", "soon"], "–"],
    ["date, an invalid Date", ["date", new Date(Number.NaN)], "–"],
    ["date, a timestamp past what a Date holds", ["date", Infinity], "–"],
    ["no spec, an invalid Date", [undefined, new Date(Number.NaN)], "–"],
    ["currency keeps whole units by default (M44)", ["currency", 19.99], "$20"],
    ["currency, digits 2 prints cents (M44)", [{ type: "currency", digits: 2 }, 19.99], "$19.99"],
    ["currency, digits leave compact alone (M44)", [{ type: "currency", compact: true, digits: 2 }, 12400], "$12.4K"],
    ["points, a loss that rounds to nothing (L64)", ["points", -0.0001], "0.0 pts"],
    ["points, a gain that rounds to nothing (L64)", ["points", 0.0001], "0.0 pts"],
    ["points, numeric text", ["points", "0.032"], "+3.2 pts"],
    ["duration, negative (L64)", ["duration", -150], "-2m 30s"],
    ["duration, negative under a second is zero (L64)", ["duration", -0.4], "0m 00s"],
    ["integer, text that is not a number (L64)", ["integer", "abc"], "–"],
    ["percent, text that is not a number (L64)", ["percent", "abc"], "–"],
    ["duration, text that is not a number (L64)", ["duration", "abc"], "–"],
    ["integer, empty text", ["integer", ""], "–"],
    ["integer, numeric text", ["integer", "1234.6"], "1,235"],
  ];
  for (const [what, args, want] of fmts) same(`fmt ${what}`, fmt(...args), want);
  // The words a format writes are the caller's: another language's set changes the dash, the points and the duration, and nothing else.
  const other: FormatWords = { unavailable: "n/d", points: ({ value }) => `${value} pp`, duration: ({ minutes, seconds }) => `${minutes} min ${seconds} s` };
  same("fmt, the dash in other words", [coreFmt("integer", null, other), coreFmt("compact", NaN, other)], ["n/d", "n/d"]);
  same("fmt, points in other words", [coreFmt("points", 0.031, other), coreFmt("points", -0.031, other), coreFmt({ type: "points", sign: false }, 0.031, other)], ["+3.1 pp", "-3.1 pp", "3.1 pp"]);
  same("fmt, a duration in other words", coreFmt("duration", 125, other), "2 min 05 s");
  same("fmt, other words leave numbers and dates alone", [coreFmt("integer", 1234.6, other), coreFmt({ type: "month", timeZone: "UTC" }, new Date(utc), other)], ["1,235", "Mar"]);
  same("cellText, a blank is the words' dash", [coreCellText({ key: "n", label: "N" }, null, other), coreCellText({ key: "n", label: "N", cell: "number", format: "duration" }, 61, other)], ["n/d", "1 min 01 s"]);
  // A date-only string is a calendar day: its own day in every zone (and so on the server and the client alike), while a full date-time is an
  // instant and the zone decides its day (H9). The zones are passed in, so the result does not hang on the zone this check runs in.
  for (const timeZone of ["UTC", "America/Los_Angeles", "Asia/Tokyo", "Pacific/Kiritimati", "Pacific/Pago_Pago"]) {
    same(`fmt, a date-only string is its own day in ${timeZone} (H9)`, [fmt({ type: "date", timeZone }, "2026-03-01"), fmt({ type: "day", timeZone }, "2026-12-31"), fmt({ type: "month", timeZone }, "2026-01-01")], ["Mar 1, 2026", "Dec 31", "Jan"]);
    same(`cellText, a date-only string is its own day in ${timeZone} (H9)`, coreCellText({ key: "d", label: "D", cell: "date", format: { type: "date", timeZone } }, "2026-03-01", EN_WORDS), "Mar 1, 2026");
  }
  same("cellText, a date-only string in the viewer's own zone (H9)", coreCellText({ key: "d", label: "D", cell: "date" }, "2026-03-01", EN_WORDS), "Mar 1, 2026");
  same("fmt, a date-time keeps its zone", [fmt({ type: "date", timeZone: "America/Los_Angeles" }, "2026-03-01T03:00:00Z"), fmt({ type: "date", timeZone: "Asia/Tokyo" }, "2026-03-01T03:00:00Z")], ["Feb 28, 2026", "Mar 1, 2026"]);
  same("cellText, a date function is handed the timestamp", coreCellText({ key: "d", label: "D", cell: "date", format: (v: number) => String(v) }, "2026-03-01", EN_WORDS), String(Date.UTC(2026, 2, 1)));
  same("cellText, text that is not a date (H8)", coreCellText({ key: "d", label: "D", cell: "date" }, "soon", EN_WORDS), "–");
  same("whenOf", [whenOf("2026-03-01"), whenOf("soon"), whenOf(new Date(Number.NaN)), whenOf(utc)], [Date.UTC(2026, 2, 1), undefined, undefined, utc]);
  // Sorting by a date: what is not a date goes last whichever way, in the order it came (L65).
  const dated = [{ i: 0, d: "2026-03-01" }, { i: 1, d: "not a date" }, { i: 2, d: new Date(Number.NaN) }, { i: 3, d: "2026-01-01" }, { i: 4, d: new Date(Date.UTC(2026, 1, 1)) }];
  const dateColumn = [{ key: "d", label: "D", cell: "date" as const }];
  same("sortRows, invalid dates last, ascending (L65)", sortRows(dated, dateColumn, { column: "d", direction: "asc" }).map((r) => r.i), [3, 4, 0, 1, 2]);
  same("sortRows, invalid dates last, descending (L65)", sortRows(dated, dateColumn, { column: "d", direction: "desc" }).map((r) => r.i), [0, 4, 3, 1, 2]);
  // A row's id: its rowKey field, or its index in the rows as they came, so one box ticks one row (M51).
  const keyless = [{ a: "x" }, { a: "y" }, { a: "z" }];
  same("rowIds, rows without the field are their index (M51)", rowIds(keyless, keyless, "key"), ["0", "1", "2"]);
  same("rowIds, the index is the row's own, sorted or paged (M51)", rowIds([keyless[2]!, keyless[0]!], keyless, "key"), ["2", "0"]);
  same("rowIds, the field when it is there", rowIds([{ key: "acc-1" }, { key: 7 }], [{ key: "acc-1" }, { key: 7 }], "key"), ["acc-1", "7"]);
  const mixed = [{ key: "1", name: "A" }, { name: "B" }, { key: "#1", name: "C" }];
  same("rowIds, a keyless row's index never takes a row's own key", rowIds(mixed, mixed, "key"), ["1", "##1", "#1"]);
  same("rowIds, ticking one keyless row ticks one (M51)", pickState(rowIds(keyless, keyless, "key"), toggleRow(rowIds(keyless, keyless, "key")[1]!, [])), { all: false, some: true });
  same("withoutSign on a name", withoutSign("percent"), { type: "percent", sign: false });
  same("withoutSign keeps options", withoutSign({ type: "percent", digits: 0, sign: true }), { type: "percent", digits: 0, sign: false });
  same("withoutSign leaves a function", typeof withoutSign((v: number) => String(v)), "function");

  // The value domain: bars keep zero, lines need not, stacks sum each sign apart, targets are included.
  const rows = [{ a: 3, b: -2 }, { a: 7, b: 4 }];
  const prices = [{ v: 120 }, { v: 180 }];
  same("domain, mixed signs", valueDomain(rows, ["a", "b"]), [-2, 7]);
  same("domain, stacked", valueDomain(rows, ["a", "b"], { stacked: true }), [-2, 11]);
  same("domain, bars keep zero", valueDomain(prices, ["v"]), [0, 180]);
  same("domain, a line need not", valueDomain(prices, ["v"], { zero: false }), [120, 180]);
  same("domain, a target outside", valueDomain(prices, ["v"], { include: [250] }), [0, 250]);
  same("domain, a target below a line", valueDomain(prices, ["v"], { zero: false, include: [90] }), [90, 180]);
  same("domain, nulls are skipped", valueDomain([{ v: null }, { v: 5 }], ["v"], { zero: false }), [5, 5]);
  same("domain, no rows", valueDomain([], ["v"]), [0, 1]);
  same("domain, all null", valueDomain([{ v: null }], ["v"], { zero: false }), [0, 1]);

  // Nice ticks.
  const ticks: [string, Parameters<typeof niceScale>, number[]][] = [
    ["0 to 97", [[0, 97]], [0, 25, 50, 75, 100]],
    ["0 to 100", [[0, 100]], [0, 25, 50, 75, 100]],
    ["0 to 1", [[0, 1]], [0, 0.25, 0.5, 0.75, 1]],
    ["0 to 7", [[0, 7]], [0, 2, 4, 6, 8]],
    ["-30 to 80", [[-30, 80]], [-50, 0, 50, 100]],
    ["0 to 12,400", [[0, 12400]], [0, 5000, 10000, 15000]],
    ["count 2", [[0, 97], { count: 2 }], [0, 50, 100]],
    ["a line, padded", [[120, 180], { pad: 0.1 }], [100, 120, 140, 160, 180, 200]],
    ["a single value", [[5, 5]], [4, 4.5, 5, 5.5, 6]],
    ["all zero", [[0, 0]], [0, 0.25, 0.5, 0.75, 1]],
    ["a single small value stays above zero", [[0.5, 0.5]], [0, 0.5, 1, 1.5]],
    ["a single negative value stays below zero", [[-0.5, -0.5]], [-1.5, -1, -0.5, 0]],
    ["padding stops at zero", [[3, 100], { pad: 0.1 }], [0, 50, 100, 150]],
    ["padding stops at zero, below", [[-100, -3], { pad: 0.1 }], [-150, -100, -50, 0]],
    // The review's inputs (M41): a small range at a large magnitude steps no finer than 12 significant digits tell apart.
    ["near 1e16, a range of 10 (M41)", [[1e16, 1e16 + 10]], [1e16, 1e16 + 1e6]],
    ["near 1e12, a range of 3 (M41)", [[1e12, 1e12 + 3]], [1e12, 1e12 + 100]],
    ["a side that is NaN takes the other's (M41)", [[Number.NaN, 1]], [0, 0.5, 1, 1.5, 2]],
    ["a side that is Infinity takes the other's (M41)", [[0, Infinity]], [0, 0.25, 0.5, 0.75, 1]],
    ["neither side a number (M41)", [[Number.NaN, Number.NaN]], [0, 0.25, 0.5, 0.75, 1]],
    ["a reversed domain", [[97, 0]], [0, 25, 50, 75, 100]],
    ["count 0 is 4 (M41)", [[0, 97], { count: 0 }], [0, 25, 50, 75, 100]],
    ["a negative count is 4 (M41)", [[0, 97], { count: -2 }], [0, 25, 50, 75, 100]],
    ["a count that is NaN is 4 (M41)", [[0, 97], { count: Number.NaN }], [0, 25, 50, 75, 100]],
  ];
  for (const [what, args, want] of ticks) {
    const got = niceScale(...args);
    same(`niceScale ${what}`, got.ticks, want);
    same(`niceScale ${what}: min, max and step agree`, [got.min, got.max, +(got.ticks[1]! - got.ticks[0]!).toPrecision(12)], [want[0], want[want.length - 1], got.step]);
  }
  // Whatever the domain, the ticks are finite, distinct, rising, cover what is a number of it, and are a short list, made quickly (M41).
  const hard: [number, number][] = [[1e16, 1e16 + 1], [1e16, 1e16 + 10], [-1e16 - 10, -1e16], [9.99999999999e15, 9.99999999999e15 + 3e4], [1e12, 1e12 + 3], [1e-12, 1e-12 + 1e-20], [Number.NaN, 1], [0, Infinity], [-Infinity, Infinity], [3, 3]];
  for (const domain of hard)
    for (const count of [4, 1, 0, 1e9]) {
      const began = performance.now();
      const { ticks: tk } = niceScale(domain, { count });
      const took = performance.now() - began;
      const finite = domain.filter(Number.isFinite);
      same(`niceScale [${domain}] count ${count}: finite, distinct, rising, covering, short and quick`, [tk.every(Number.isFinite), tk.every((v, k) => k === 0 || v > tk[k - 1]!), tk.length >= 2 && tk.length <= 1002, finite.every((v) => v >= tk[0]! && v <= tk[tk.length - 1]!), took < 50], [true, true, true, true, true]);
    }

  // The sentence a screen reader hears. Core works out what there is to say; the words are the chart's, so these tests give it the English the dictionary has, read as a kit reads it.
  const wordsOf = <W,>(id: Parameters<typeof stringsFor>[0], keys: Record<string, string>): W => {
    const say = stringsFor(id, undefined, undefined);
    return Object.fromEntries(Object.entries(keys).map(([name, key]) => [name, (v?: Record<string, string | number>) => say(key as never, v)])) as W;
  };
  const seriesWords = wordsOf<SummaryWords>("bar-chart", { noData: "noData", noValues: "summaryNoValues", extremes: "summaryExtremes", single: "summarySingle", held: "summaryHeld", rose: "summaryRose", fell: "summaryFell", peak: "summaryPeak", range: "summaryRange", separator: "summarySeparator", summary: "summary" });
  const segmentWords = wordsOf<SegmentWords>("donut-chart", { noData: "noData", allZero: "summaryAllZero", more: "summaryMore", part: "summaryPart", separator: "summarySeparator", summary: "summary" });
  const gaugeWords = wordsOf<GaugeWords>("gauge-chart", { noValue: "summaryNoValue", caption: "summaryCaption", over: "summaryOver", target: "summaryTarget", summary: "summary" });
  const goalWords = wordsOf<GoalWords>("goal-rings", { noGoals: "summaryNoGoals", goal: "summaryGoal", noGoal: "summaryNoGoal", separator: "summarySeparator", summary: "summary" });
  const compareWords = wordsOf<CompareWords>("period-compare", { noData: "noData", noValues: "summaryNoValues", extremes: "summaryExtremes", same: "summarySame", up: "summaryUp", down: "summaryDown", separator: "summarySeparator", summary: "summary" });
  const months = ["Jan", "Feb", "Mar"];
  const mrr = { label: "Revenue", keys: months, fields: ["v"], labels: { v: "MRR" }, format: { type: "currency", compact: true } as const };
  same("summarize, a trend", summarize({ ...mrr, ordered: true, data: [{ v: 100 }, { v: 140 }, { v: 120 }] }, seriesWords), "Revenue, Jan to Mar: MRR rose from $100 to $120, highest in Feb.");
  same("summarize, a fall", summarize({ ...mrr, ordered: true, data: [{ v: 100 }, { v: 90 }, { v: 40 }] }, seriesWords), "Revenue, Jan to Mar: MRR fell from $100 to $40, highest in Jan.");
  same("summarize, held", summarize({ ...mrr, ordered: true, data: [{ v: 100 }, { v: 130 }, { v: 100.5 }] }, seriesWords), "Revenue, Jan to Mar: MRR held at $100.5, highest in Feb.");
  same("summarize, categories", summarize({ label: "Tickets", keys: ["Mon", "Tue"], fields: ["n"], labels: { n: "Open" }, format: "integer", data: [{ n: 12 }, { n: 3 }] }, seriesWords), "Tickets: Open: highest Mon (12), lowest Tue (3).");
  same("summarize, one point", summarize({ ...mrr, ordered: true, keys: ["Jan"], data: [{ v: 100 }] }, seriesWords), "Revenue: MRR is $100.");
  same("summarize, two series", summarize({ label: "Chart", keys: ["A", "B"], fields: ["x", "y"], labels: { y: "Why" }, format: "integer", data: [{ x: 1, y: 5 }, { x: 4, y: 2 }] }, seriesWords), "Chart: x: highest B (4), lowest A (1); Why: highest A (5), lowest B (2).");
  same("summarize, no rows", summarize({ ...mrr, data: [] }, seriesWords), "Revenue: no data.");
  same("summarize, no values", summarize({ ...mrr, data: [{ v: null }] }, seriesWords), "Revenue: MRR: no values.");
  // The review's inputs (M47): from 0 the direction is the sign; NaN and text that is not a number are gaps; numeric text is its number.
  same("summarize, 0 to a loss fell (M47)", summarize({ ...mrr, ordered: true, data: [{ v: 0 }, { v: -2 }, { v: -5 }] }, seriesWords), "Revenue, Jan to Mar: MRR fell from $0 to -$5, highest in Jan.");
  same("summarize, 0 to a gain rose (M47)", summarize({ ...mrr, ordered: true, data: [{ v: 0 }, { v: 2 }, { v: 5 }] }, seriesWords), "Revenue, Jan to Mar: MRR rose from $0 to $5, highest in Mar.");
  same("summarize, NaN is a gap (M47)", summarize({ ...mrr, ordered: true, data: [{ v: 100 }, { v: Number.NaN }, { v: 120 }] }, seriesWords), "Revenue, Jan to Mar: MRR rose from $100 to $120.");
  same("summarize, numeric text is its number (M47)", summarize({ ...mrr, ordered: true, data: [{ v: "100" }, { v: "140" }, { v: "120" }] }, seriesWords), "Revenue, Jan to Mar: MRR rose from $100 to $120, highest in Feb.");
  same("summarize, text that is not a number is a gap (M47)", summarize({ label: "Tickets", keys: ["Mon", "Tue", "Wed"], fields: ["n"], labels: { n: "Open" }, format: "integer", data: [{ n: "n/a" }, { n: 12 }, { n: "3" }] }, seriesWords), "Tickets: Open: highest Tue (12), lowest Wed (3).");
  same("summarize, only NaN has no values (M47)", summarize({ ...mrr, data: [{ v: Number.NaN }] }, seriesWords), "Revenue: MRR: no values.");

  // A chart's rows as a table, a tooltip's rows, and rows as the libraries take them.
  const t = chartTable({ data: [{ month: "Jan", mrr: 1, cost: 2 }], x: "month", y: ["mrr", "cost"], labels: { mrr: "MRR" }, format: "integer" });
  same("chartTable columns", t.columns.map((c) => [c.key, c.label, c.cell, c.priority, c.align ?? null]), [["month", "Month", "text", 1, null], ["mrr", "MRR", "number", 2, "end"], ["cost", "cost", "number", 3, "end"]]);
  same("chartTable rows", t.rows, [{ month: "Jan", mrr: 1, cost: 2, key: "row-0" }]);
  same("chartTable, one field", chartTable({ data: [], x: "day", y: "n", xLabel: "Date" }).columns.map((c) => c.label), ["Date", "n"]);
  same("chartTable names its rows by the Table's default", t.rowKey, "key");
  const keyed = chartTable({ data: [{ key: "Jan", n: 1 }, { key: "Jan", n: 2 }], x: "key", y: "n" });
  same("chartTable keeps a data field named key (L61)", [keyed.rowKey, keyed.rows], ["_key", [{ key: "Jan", n: 1, _key: "row-0" }, { key: "Jan", n: 2, _key: "row-1" }]]);
  same("chartTable, and one named _key too (L61)", chartTable({ data: [{ key: 1, _key: 2 }], x: "key", y: "_key" }).rowKey, "__key");
  const colorOf = (f: string) => ({ a: "#a", b: "#b" })[f as "a" | "b"];
  same("tipRows", tipRows({ __x: "Jan", a: 1200, b: -300 }, { fields: ["a", "b"], labels: { a: "Alpha" }, colorOf, format: "compact" }), { title: "Jan", rows: [{ key: "a", label: "Alpha", value: "1.2K", color: "#a" }, { key: "b", label: "b", value: "-300", color: "#b" }], total: null });
  same("tipRows, stacked total", tipRows({ __x: "Jan", a: 1200, b: 300 }, { fields: ["a", "b"], labels: {}, colorOf, format: "compact", stacked: true }).total, "1.5K");
  same("tipRows, one stacked series has no total", tipRows({ __x: "Jan", a: 1 }, { fields: ["a"], labels: {}, colorOf, stacked: true }).total, null);
  same("tipRows, sign colours", tipRows({ __x: "Jan", a: 5, b: -5 }, { fields: ["a", "b"], labels: {}, colorOf, signColors: { positive: "#+", negative: "#-" } }).rows.map((r) => r.color), ["#+", "#-"]);
  const p = prepare([{ d: new Date(utc), n: 1 }, { d: new Date(utc + 40 * 864e5), n: 2 }], "d", { type: "month", timeZone: "UTC" });
  same("prepare, dates", [p.keys, p.ordered, p.rows.map((r) => r.__i)], [["Mar", "Apr"], true, [0, 1]]);
  const q = prepare([{ k: "Fabric", n: 1 }], "k");
  same("prepare, categories", [q.keys, q.ordered, q.rows[0]!.__x], [["Fabric"], false, "Fabric"]);

  // LTTB: the first and last stay, the count is the threshold, and a spike survives a cut that a plain stride would miss.
  const line = Array.from({ length: 100 }, (_, i) => ({ i, v: i === 37 ? 100 : 0 }));
  const cut = lttb(line, 10, (r) => r.i, (r) => r.v);
  same("lttb keeps the count", cut.length, 10);
  same("lttb keeps the ends", [cut[0]!.i, cut[cut.length - 1]!.i], [0, 99]);
  same("lttb keeps a spike", cut.some((r) => r.v === 100), true);
  same("lttb stays in order", cut.every((r, k) => k === 0 || r.i > cut[k - 1]!.i), true);
  same("lttb returns the rows themselves", cut.every((r) => line.includes(r)), true);
  same("lttb, data within the threshold", lttb(line.slice(0, 5), 10, (r) => r.i, (r) => r.v).length, 5);
  same("lttb, a threshold under 3", lttb(line, 2, (r) => r.i, (r) => r.v).length, 100);
  same("lttb, empty", lttb([], 10, () => 0, () => 0), []);
  // Worked by hand: bucket one keeps 2 (triangle 3 against 1.5), two keeps the peak at 4 (13), three keeps 5 (10.5 against 7 and 3.5).
  same("lttb, a hand-worked ramp and peak", lttb([0, 1, 2, 3, 10, 4, 5, 6, 7].map((v, i) => ({ i, v })), 5, (r) => r.i, (r) => r.v).map((r) => r.i), [0, 2, 4, 5, 8]);
  const big = Array.from({ length: 50_000 }, (_, i) => ({ i, v: Math.sin(i / 300) * 50 + (i % 977 === 0 ? 40 : 0) }));
  same("lttb, 50,000 rows to 1,000", lttb(big, 1000, (r) => r.i, (r) => r.v).length, 1000);

  // A KPI's value as the digits and what is around them (the symbol and unit drawn smaller), and what a card says moved.
  const parts: [string, Parameters<typeof valueParts>, [string, boolean][]][] = [
    ["currency", [{ type: "currency" }, 184200], [["$", false], ["184,200", true]]],
    ["compact currency", [{ type: "currency", compact: true }, 184200], [["$", false], ["184.2", true], ["K", false]]],
    ["percent", ["percent", 0.583], [["58.3", true], ["%", false]]],
    ["a duration has two units", ["duration", 134], [["2", true], ["m ", false], ["14", true], ["s", false]]],
    ["a plain integer", ["integer", 12480], [["12,480", true]]],
    ["a sign stays with the digits", [{ type: "percent", sign: true }, 0.044], [["+4.4", true], ["%", false]]],
    ["a minus before the symbol is the digits'", [{ type: "currency" }, -4200], [["-", true], ["$", false], ["4,200", true]]],
    ["a unit after a space", [{ type: "decimal", unit: " GB" }, 9.4], [["9.4", true], [" GB", false]]],
    ["no digits at all is all digits", ["integer", NaN], [["–", true]]],
    ["a word is all digits", [() => "Fabric", 1], [["Fabric", true]]],
  ];
  for (const [what, args, want] of parts) same(`valueParts ${what}`, valueParts(...args).map((p) => [p.s, p.digits]), want);
  same("moved, up", moved(0.044), { direction: "up", known: true, value: "4.4%" });
  same("moved, down", moved(-0.101), { direction: "down", known: true, value: "10.1%" });
  same("moved, in points", moved(0.038, "points"), { direction: "up", known: true, value: "3.8 pts" });
  same("moved, flat", moved(0), { direction: "flat", known: true, value: "" });
  same("moved, not a number", moved(NaN), { direction: "flat", known: false, value: "" });
  // The words for it are the dictionary's: a KPI card, a stat tile and a period comparison say them the same way.
  const say = stringsFor("kpi-card", undefined, undefined);
  same("the sentence about a change", [say("up", { value: "4.4%" }), say("down", { value: "10.1%" }), say("noChange"), say("changeUnavailable"), say("againstPeriod", { change: say("up", { value: "4.4%" }), period: "on September" })], ["Up 4.4%", "Down 10.1%", "No change", "Change unavailable", "Up 4.4% on September"]);

  // A Meter's state against its thresholds, and the text beside it.
  const tones: [string, Parameters<typeof meterTone>, string][] = [
    ["usage, fine", ["usage", 0.42], "ok"],
    ["usage, at the caution line", ["usage", 0.75], "warning"],
    ["usage, over the loss line", ["usage", 0.9], "danger"],
    ["usage, over capacity", ["usage", 1.12], "danger"],
    ["score, fine", ["score", 0.76], "ok"],
    ["score, at the caution line", ["score", 0.6], "warning"],
    ["score, under the loss line", ["score", 0.34], "danger"],
    ["score, zero", ["score", 0], "danger"],
    ["your own thresholds", ["usage", 0.7, { warning: 0.6, danger: 0.8 }], "warning"],
  ];
  for (const [what, args, want] of tones) same(`meterTone ${what}`, meterTone(...args), want);
  same("meterReading, the share", meterReading(0.42, 1), { kind: "share", value: "42%" });
  same("meterReading, a value of a max", meterReading(455, 600, "integer"), { kind: "of", value: "455", max: "600" });
  same("meterReading, with a unit", meterReading(9.4, 10, { type: "decimal", unit: " GB" }), { kind: "of", value: "9.4 GB", max: "10 GB" });
  same("meterReading, over capacity says the real share", meterReading(1.12, 1), { kind: "share", value: "112%" });
  same("meterReading, no capacity", meterReading(12, 0), { kind: "unavailable" });
  same("meterReading, not a number", meterReading(NaN, 1), { kind: "unavailable" });

  // The easing the digits take, and a colour at an opacity.
  const out = easeFn("cubic-bezier(.16,1,.3,1)");
  same("easeFn, the ends", [out(0), out(1)], [0, 1]);
  same("easeFn, ease-out is past halfway at halfway", out(0.5) > 0.5, true);
  same("easeFn, an unknown curve is an ease-out cubic", easeFn("linear")(0.5), 0.875);
  same("barLayout, room for the gap", barLayout(96, 12, 3), { gap: 3, barWidth: 5.25 });
  same("barLayout, the gap closes before the bars thin", [barLayout(96, 30, 3).barWidth, barLayout(96, 30, 3).gap < 3], [2, true]);
  same("barLayout, one bar has no gap", barLayout(96, 1, 3), { gap: 0, barWidth: 96 });
  same("withAlpha", withAlpha("#86b7f6", 0.45), "rgba(134, 183, 246, 0.45)");
  same("withAlpha leaves what is not a hex", withAlpha("rgb(1, 2, 3)", 0.5), "rgb(1, 2, 3)");

  same("prepare, a timestamp under a date format is ordered", prepare([{ m: Date.UTC(2026, 4, 1) }], "m", { type: "month", timeZone: "UTC" }), { rows: [{ m: Date.UTC(2026, 4, 1), __x: "May", __i: 0 }], keys: ["May"], ordered: true });
  same("prepare, a number with no date format is not", prepare([{ m: 4 }], "m").ordered, false);
  same("prepare, a Date is ordered", prepare([{ m: new Date(Date.UTC(2026, 4, 1)) }], "m", { type: "month", timeZone: "UTC" }).ordered, true);

  // What the ready-made charts work out before they hand a library anything: each kind's scale, label widths, a sparser run of labels, colouring by sign.
  const trend = [{ v: 412 }, { v: 436 }, { v: 470 }, { v: 455 }];
  same("lineScale does not force zero", lineScale(trend, ["v"]).min > 0, true);
  same("lineScale includes a target", lineScale(trend, ["v"], 520).max >= 520, true);
  same("barScale keeps zero", barScale(trend, ["v"]).min, 0);
  same("barScale, a stack's extent is its sums, 11 rounded up to a step of 5", barScale([{ a: 3, b: 4 }, { a: 5, b: 6 }], ["a", "b"], { stacked: true }).max, 15);
  same("barScale, negatives are in the scale", barScale([{ v: -12 }, { v: 51 }], ["v"]).min <= -12, true);
  same("labelWidth, the longest label sets it", labelWidth(["Oct", "September"], 11), Math.ceil(9 * 11 * 0.6) + 10);
  same("labelWidth, no labels is only the gutter", labelWidth([], 11), 10);
  same("fitLabel, a label that fits is left alone", fitLabel("#support", 120, 11), "#support");
  same("fitLabel, a long one is cut with an ellipsis", fitLabel("#customer-success-enterprise-escalations", 120, 11), "#customer-success…");
  same("fitLabel, never cut to nothing", fitLabel("#support", 1, 11), "#…");
  const days = Array.from({ length: 14 }, (_, i) => `Oct ${12 + i}`);
  same("sparseLabels, room for all keeps all", sparseLabels(days, 80, 11), days);
  same("sparseLabels, a narrow plot keeps one in a few", sparseLabels(days, 24, 11).filter(Boolean).length < days.length, true);
  same("sparseLabels, the first label always stays", sparseLabels(days, 24, 11)[0], "Oct 12");
  same("sparseLabels, the rest are empty, not dropped", sparseLabels(days, 24, 11).length, days.length);
  same("bySign, one series with a loss", bySign([{ net: 4 }, { net: -2 }], ["net"], false), true);
  same("bySign, no loss", bySign([{ net: 4 }], ["net"], false), false);
  same("bySign, two series keep their own colours", bySign([{ a: -1, b: 2 }], ["a", "b"], false), false);
  same("bySign, a stack keeps its own colours", bySign([{ net: -1 }], ["net"], true), false);

  // A donut's segments: up to eight keep their own, the rest fold into "Other"; a share is never negative; the whole of nothing has no shares.
  const channels = [["#support", 212], ["#billing", 148], ["#platform-eng", 101], ["#onboarding", 86], ["Email", 62], ["#design-crit", 48], ["#sales-ops", 38], ["#security", 27], ["Slack Connect", 22], ["Chat widget", 16], ["Phone", 9]].map(([channel, tickets]) => ({ channel, tickets }));
  const segs = segmentsOf(channels, "channel", "tickets", "Other");
  same("segmentsOf, eleven rows are eight and Other", segs.length, 9);
  same("segmentsOf, Other is the ninth row on", segs[8], { label: "Other", value: 47, folded: 3 });
  same("segmentsOf, the first eight are as given", segs.slice(0, 8).map((s) => s.label), channels.slice(0, 8).map((r) => r.channel));
  same("segmentsOf, the total is the rows' total", totalOf(segs), 769);
  same("segmentsOf, eight rows are not folded", segmentsOf(channels.slice(0, 8), "channel", "tickets", "Other").some((s) => s.folded), false);
  same("segmentsOf, a negative value counts as 0", segmentsOf([{ a: "x", v: -4 }, { a: "y", v: 3 }], "a", "v", "Other").map((s) => s.value), [0, 3]);
  same("segmentsOf, a value that is not a number counts as 0", segmentsOf([{ a: "x", v: "n/a" }], "a", "v", "Other")[0]!.value, 0);
  same("shareOf, a part of the whole", shareOf(158, 769), 158 / 769);
  same("shareOf, the whole of nothing is not a number", Number.isNaN(shareOf(0, 0)), true);
  same("summarizeSegments", summarizeSegments({ label: "Tickets", segments: [{ label: "#support", value: 3 }, { label: "Email", value: 1 }], format: "integer" }, segmentWords), "Tickets: #support 3 (75%), Email 1 (25%); total 4.");
  same("summarizeSegments, Other says how many it holds", summarizeSegments({ label: "T", segments: [{ label: "Other", value: 47, folded: 3 }, { label: "A", value: 53 }], format: "integer" }, segmentWords), "T: Other, 3 more, 47 (47%), A 53 (53%); total 100.");
  same("summarizeSegments, all zero", summarizeSegments({ label: "T", segments: [{ label: "A", value: 0 }], format: "integer" }, segmentWords), "T: every value is 0.");
  same("summarizeSegments, no rows", summarizeSegments({ label: "T", segments: [] }, segmentWords), "T: no data.");
  // Where a point is on a ring: clockwise from twelve o'clock, between the hole and the edge.
  same("segmentAt, just right of twelve is the first", segmentAt(110, 20, 200, 60, 100, [1, 1, 2]), 0);
  same("segmentAt, the bottom is the third", segmentAt(100, 180, 200, 60, 100, [1, 1, 2]), 2);
  same("segmentAt, three o'clock is the second", segmentAt(180, 100, 200, 60, 100, [1, 1, 2]), 1);
  same("segmentAt, in the hole is none", segmentAt(100, 100, 200, 60, 100, [1, 1, 2]), -1);
  same("segmentAt, past the edge is none", segmentAt(2, 2, 200, 60, 100, [1, 1, 2]), -1);
  same("segmentAt, a whole of nothing is none", segmentAt(110, 20, 200, 60, 100, [0, 0]), -1);
  // A gauge: Meter's thresholds, the share held between 0 and 1, the target's place.
  same("gaugeState, a score above the caution line is fine", gaugeState({ value: 0.583, max: 1, target: 0.6, thresholds: { warning: 0.5, danger: 0.4 } }), { known: true, share: 0.583, over: false, tone: "ok", targetShare: 0.6 });
  same("gaugeState, a score on Meter's own lines", gaugeState({ value: 0.583, max: 1 }).tone, "warning");
  same("gaugeState, a score under the loss line", gaugeState({ value: 0.31, max: 1 }).tone, "danger");
  same("gaugeState, usage turns as it fills", gaugeState({ value: 42, max: 50, kind: "usage" }).tone, "warning");
  same("gaugeState, over max is full and says so", gaugeState({ value: 1.12, max: 1 }), { known: true, share: 1, over: true, tone: "ok", targetShare: null });
  same("gaugeState, a negative value is empty", gaugeState({ value: -3, max: 10 }).share, 0);
  same("gaugeState, a target past max is at the end", gaugeState({ value: 1, max: 2, target: 5 }).targetShare, 1);
  same("gaugeState, no number is unknown", gaugeState({ value: Number.NaN, max: 1 }).known, false);
  same("gaugeState, a capacity of nothing is unknown", gaugeState({ value: 3, max: 0 }).known, false);
  same("summarizeGauge", summarizeGauge({ label: "Resolved by Fabric", value: 0.583, max: 1, target: 0.6, caption: "of resolved tickets", format: "percent" }, gaugeWords), "Resolved by Fabric: 58.3% of resolved tickets, target 60%.");
  same("summarizeGauge, over", summarizeGauge({ label: "G", value: 1.12, max: 1, format: "percent" }, gaugeWords), "G: 112%, over the 100% it is measured against.");
  same("summarizeGauge, no value", summarizeGauge({ label: "G", value: Number.NaN, max: 1 }, gaugeWords), "G: no value.");
  // A percent format prints a share of max, as Meter does (M43).
  same("meterShown", [meterShown(58, 100, "percent"), meterShown(58, 100, { type: "percent", digits: 0 }), meterShown(42, 50, "integer"), meterShown(42, 50, undefined)], [0.58, 0.58, 42, 42]);
  same("summarizeGauge, a percent of a max of 100 (M43)", summarizeGauge({ label: "G", value: 58, max: 100, target: 70, format: "percent" }, gaugeWords), "G: 58%, target 70%.");
  same("summarizeGauge, over a max of 100 (M43)", summarizeGauge({ label: "G", value: 112, max: 100, format: "percent" }, gaugeWords), "G: 112%, over the 100% it is measured against.");
  same("summarizeGauge, another format prints the value", summarizeGauge({ label: "Seats", value: 42, max: 50, format: "integer" }, gaugeWords), "Seats: 42.");
  same("summarizeGauge, no format prints the value", summarizeGauge({ label: "G", value: 58, max: 100 }, gaugeWords), "G: 58.");
  // The gauge and a score meter drawn by both kits: the gauge says 58% of 100 (M43); a meter with no value has no state icon (L60).
  for (const [platform, os] of [["web", "browser"], ["mobile", "ios"]] as const) {
    const drawn = (id: string, props: Record<string, unknown>) => renderToString(createElement(Stage, { platform, os, scheme: "light", theme: antfabric, children: createElement(Thing, { id, platform, props }) }));
    const gauge = drawn("gauge-chart", { value: 58, max: 100, target: 70, title: "Resolved", format: "percent" });
    same(`gauge-chart on ${platform} prints the share of max (M43)`, [gauge.includes("5,800"), gauge.includes("10,000"), gauge.includes("58"), gauge.includes("100%")], [false, false, true, true]);
    const icons = (value: number) => (drawn("meter", { value, kind: "score", showState: true, label: "Goal" }).match(/<svg/g) ?? []).length;
    same(`meter on ${platform}: a low score has its icon, no value has none (L60)`, [icons(0.1) > icons(Number.NaN), icons(Number.NaN), icons(0.9)], [true, 0, 0]);
  }
  const week = [{ day: "Mon", a: 3, b: 2 }, { day: "Tue", a: 5, b: 4 }];
  const weeks: { label: string; keys: string[]; fields: [string, string]; labels: Record<string, string>; format: "integer" } = { label: "Tickets", keys: ["Mon", "Tue"], fields: ["a", "b"], labels: { a: "This week", b: "Last week" }, format: "integer" };
  same("summarizeCompare", summarizeCompare({ ...weeks, data: week }, compareWords), "Tickets: This week 8 against Last week 6, up 33.3%. This week: highest Tue (5), lowest Mon (3); Last week: highest Tue (4), lowest Mon (2).");
  same("summarizeCompare, no change", summarizeCompare({ ...weeks, data: [{ day: "Mon", a: 2, b: 2 }] }, compareWords), "Tickets: This week 2 against Last week 2, no change. This week: highest Mon (2), lowest Mon (2); Last week: highest Mon (2), lowest Mon (2).");
  same("summarizeCompare, a last period of nothing has no change to say", summarizeCompare({ ...weeks, data: [{ day: "Mon", a: 2, b: 0 }] }, compareWords), "Tickets: This week 2 against Last week 0. This week: highest Mon (2), lowest Mon (2); Last week: highest Mon (0), lowest Mon (0).");
  same("summarizeCompare, no rows", summarizeCompare({ ...weeks, data: [] }, compareWords), "Tickets: no data.");
  const goals = goalsOf([{ g: "A", d: 455, t: 600 }, { g: "B", d: 0, t: 0 }], "g", "d", "t");
  same("summarizeGoals", summarizeGoals({ label: "Q4", goals }, goalWords), "Q4: A 455 of 600 (76%); B has no goal; 38% done overall.");
  same("summarizeGoals, no goals", summarizeGoals({ label: "Q4", goals: [] }, goalWords), "Q4: no goals.");
  const end = onHalfRing(1, 100, 100, 50);
  same("onHalfRing, the right end", [Math.round(end.x), Math.round(end.y)], [150, 100]);
  const top = onHalfRing(0.5, 100, 100, 50);
  same("onHalfRing, the top", [Math.round(top.x), Math.round(top.y)], [100, 50]);
  // A radar: a score held to the scale, and the axis under a finger.
  same("clampScore, past the scale is the scale", clampScore(112, 100), 100);
  same("clampScore, under zero is zero", clampScore(-4, 100), 0);
  same("clampScore, not a number is zero", clampScore("n/a", 100), 0);
  same("nearestAxis, straight up is the first of six", nearestAxis(100, 5, 200, 6), 0);
  same("nearestAxis, clockwise, the next is up and to the right", nearestAxis(180, 55, 200, 6), 1);
  same("nearestAxis, straight down is the fourth of six", nearestAxis(100, 195, 200, 6), 3);
  same("nearestAxis, anticlockwise reverses it", nearestAxis(180, 55, 200, 6, { clockwise: false }), 5);
  if (!quiet) console.log(`  chart: ${cases} cases`);
}

const hasIcon = (name: string) => !!(lucide as Record<string, unknown>)[pascal(name)];

const scenesIn = (v: unknown, out: Scene[] = []): Scene[] => {
  if (Array.isArray(v)) v.forEach((x) => scenesIn(x, out));
  else if (v && typeof v === "object") {
    if (typeof (v as Scene).el === "string") out.push(v as Scene);
    Object.values(v).forEach((x) => scenesIn(x, out));
  }
  return out;
};

/* ---------- docs ---------- */

/** Checks one component's docs. `fail` is where a problem goes: the run's `err`, or a list (the mechanics fixture reads what it says). */
function checkDocs(doc: ComponentDocs, fail: (at: string, msg: string) => void = err) {
  const at = doc.id;
  const declared = (props: Record<string, unknown> | undefined, where: string) => {
    for (const k of Object.keys(props ?? {})) if (!doc.props[k]) fail(at, `${where} passes undeclared prop "${k}"`);
  };
  doc.examples.forEach((e) => declared(e.props, `example "${e.name}"`));
  doc.edgeCases?.forEach((e) => declared(e.example?.props, `edge case "${e.title}"`));
  for (const m of doc.matrix ?? []) {
    // A row of `cases` is headed by `prop` (a removed `kind` still names its row), so only its cases' props must be declared.
    if (!m.cases) {
      if (!doc.props[m.prop]) fail(at, `matrix prop "${m.prop}" is not declared`);
      continue;
    }
    if (m.values) fail(at, `matrix "${m.prop}": give values or cases, not both`);
    if (!m.cases.length) fail(at, `matrix "${m.prop}": cases is empty`);
    const names = new Set<string>();
    for (const c of m.cases) {
      if (!c.name) fail(at, `matrix "${m.prop}": a case has no name`);
      else if (names.has(c.name)) fail(at, `matrix "${m.prop}": two cases are named "${c.name}"`);
      names.add(c.name);
      declared(c.props, `matrix "${m.prop}" case "${c.name}"`);
    }
  }
  for (const [k, d] of Object.entries(doc.props)) {
    if (d.args && d.type !== "event") fail(at, `props.${k}.args: only events take args`);
    if (d.changes && d.type !== "event") fail(at, `props.${k}.changes: only events report changes`);
    if (d.changes && !doc.props[d.changes]) fail(at, `props.${k}.changes: no prop "${d.changes}"`);
    if (d.sample !== undefined && d.type === "event") fail(at, `props.${k}.sample: an event has no sample (the docs pass data, never a handler)`);
    for (const field of ["default", "sample"] as const) {
      const v = d[field];
      if (d.type === "enum" && v !== undefined && v !== "" && !d.options?.includes(v as string)) fail(at, `props.${k}.${field} is not one of its options`);
      if (d.type === "icon" && typeof v === "string" && v && !hasIcon(v)) fail(at, `props.${k}${field === "sample" ? ".sample" : ""}: lucide has no icon "${v}"`);
    }
  }
  const text = JSON.stringify(doc);
  for (const m of text.matchAll(/\$([a-z][a-z0-9]*(?:\.[a-z0-9][a-z0-9-]*)+)/gi)) if (!TOKENS.has(m[1]!)) fail(at, `unknown token $${m[1]}`);
  for (const s of scenesIn(doc)) {
    if (s.el === "component" && !registry[s.use ?? ""]) fail(at, `a scene uses unknown component "${s.use}"`);
    if (s.el === "icon" && s.icon && !hasIcon(s.icon)) fail(at, `lucide has no icon "${s.icon}"`);
  }
  for (const r of doc.related ?? []) if (!registry[r]) warn(at, `related "${r}" is not in the library yet`);
  const flowIds = new Set<string>();
  for (const flow of doc.flows ?? []) {
    const f = `${at} flow "${flow.id}"`;
    if (flowIds.has(flow.id)) fail(f, "duplicate id");
    flowIds.add(flow.id);
    for (const p of flow.platforms) {
      if (doc.platforms[p].status === "not-applicable") fail(f, `${p} is not-applicable for this component`);
      if (!flow.steps.some((s) => !s.platforms || s.platforms.includes(p))) fail(f, `no step applies on ${p}`);
    }
    flow.steps.forEach((s, i) => {
      for (const p of s.platforms ?? []) if (!flow.platforms.includes(p)) fail(f, `step ${i}: ${p} is not one of the flow's platforms`);
    });
    for (const [i, fr] of (flow.replay ?? []).entries()) {
      if (fr.step >= flow.steps.length) fail(f, `frame ${i}: step ${fr.step} does not exist`);
      declared(fr.props, `${flow.id} frame ${i}`);
    }
  }
}

/**
 * The two docs mechanisms the 1.0 chrome rewrite moves AntFabric's content into, proved on a fixture so they hold before any docs file
 * uses them: `PropDoc.sample` (every render, control and usage line starts from `sample ?? default`) and matrix `cases` (a row of named
 * prop bundles, drawn in the place and order of the old values). Button stands in for a component: its docs with a sample and a cases
 * matrix must draw exactly the markup, count and order its real docs draw, and the docs check must name each mistake. Web only, and drawn
 * after every snapshot render, so React Native Web's class sheet and the run's render count are untouched.
 */
function checkDocsMechanics() {
  const at = "docs mechanics";
  const real = registry.button!;
  const label = real.props.label!;
  const variant = real.props.variant!;
  if (variant.type !== "enum" || !variant.options?.length) return err(at, "the fixture expects Button's `variant` to be an enum with options");
  // The real label is a `sample` (a required prop has no `default`); the fixture gives it a generic default beneath it: what a chrome prop's AntFabric value does in W7–W9.
  const sampled: ComponentDocs = {
    ...real,
    props: { ...real.props, label: { ...label, default: "Button", sample: label.sample ?? label.default } },
    matrix: [{ prop: "variant" }],
  };
  // The same row as named bundles, as a removed `kind` becomes; `prop` heads it and need not be declared.
  const bundled: ComponentDocs = {
    ...sampled,
    matrix: [{ prop: "look", cases: variant.options.map((v) => ({ name: String(v), props: { variant: v } })) }],
  };
  const same = (what: string, got: unknown, want: unknown) => JSON.stringify(got) !== JSON.stringify(want) && err(at, `${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);

  // sample ?? default, events never.
  same("withDefaults takes the sample over the default", withDefaults(sampled), withDefaults({ ...real, matrix: [{ prop: "variant" }] }));
  same("withDefaults: a later prop wins over the sample", withDefaults(sampled, { label: "Save" }).label, "Save");
  same("withDefaults leaves events out", Object.keys(withDefaults(sampled)).filter((k) => sampled.props[k]?.type === "event"), []);
  same("defaultsFor is withDefaults on the platform", defaultsFor(["button"], "web").button, Object.fromEntries(Object.entries(withDefaults(real)).filter(([k]) => !real.props[k]?.platforms || real.props[k]!.platforms!.includes("web"))));

  // A plain row is one case per value, captioned with it; a cases row is its cases, as written.
  const plain = casesFor(sampled, "web").matrix[0]!;
  same("a plain row's cases", plain.cases, variant.options.filter((v) => v !== "").map((v) => ({ name: String(v), props: { variant: v } })));
  const viaCases = casesFor(bundled, "web").matrix[0]!;
  same("a cases row's heading", viaCases.prop, "look");
  same("a cases row's cases are as written", viaCases.cases, bundled.matrix![0]!.cases);
  same("a boolean row is false, then true", matrixCases({ ...real, props: { ...real.props, full: { type: "boolean" } } }, { prop: "full" }).map((c) => c.name), ["false", "true"]);

  // Drawn as checkRenders draws them (the same Stage, theme and defaults), the three docs give one markup, render for render.
  const drawAll = (doc: ComponentDocs) => {
    const defaults = { button: withDefaults(doc) };
    const out: string[] = [];
    const one = (props?: Record<string, unknown>) =>
      out.push(renderToString(createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform: "web", os: "browser", scheme: "light", theme: antfabric, children: createElement(Thing, { id: "button", platform: "web", props }) }))));
    one();
    for (const m of casesFor(doc, "web").matrix) for (const c of m.cases) one(c.props);
    return out;
  };
  const before = drawAll({ ...real, matrix: [{ prop: "variant" }] });
  const viaSample = drawAll(sampled);
  const viaBundle = drawAll(bundled);
  if (before.length !== 1 + variant.options.filter((v) => v !== "").length) err(at, `the plain matrix drew ${before.length} renders`);
  same("renders with a sample and a plain matrix (count)", viaSample.length, before.length);
  same("renders with a sample and a cases matrix (count)", viaBundle.length, before.length);
  viaSample.forEach((h, i) => h !== before[i] && err(at, `render ${i} with the label as a sample differs from the label as the default`));
  viaBundle.forEach((h, i) => h !== before[i] && err(at, `render ${i} of the cases matrix differs from the plain matrix's`));

  // The docs check: the fixtures pass, and every mistake is named.
  const said = (doc: ComponentDocs) => {
    const out: string[] = [];
    checkDocs(doc, (_, msg) => out.push(msg));
    return out;
  };
  same("the docs check on the sample fixture", said(sampled), []);
  same("the docs check on the cases fixture", said(bundled), []);
  const wrong = (what: string, doc: ComponentDocs, want: string) => !said(doc).includes(want) && err(at, `the docs check does not say "${want}" for ${what} (it says ${JSON.stringify(said(doc))})`);
  wrong("an undeclared prop in a case", { ...bundled, matrix: [{ prop: "look", cases: [{ name: "x", props: { tone: "brand" } }] }] }, `matrix "look" case "x" passes undeclared prop "tone"`);
  wrong("values beside cases", { ...bundled, matrix: [{ prop: "look", values: ["a"], cases: [{ name: "x", props: {} }] }] }, `matrix "look": give values or cases, not both`);
  wrong("two cases with one name", { ...bundled, matrix: [{ prop: "look", cases: [{ name: "x", props: {} }, { name: "x", props: {} }] }] }, `matrix "look": two cases are named "x"`);
  wrong("an empty cases row", { ...bundled, matrix: [{ prop: "look", cases: [] }] }, `matrix "look": cases is empty`);
  wrong("an undeclared plain row", { ...sampled, matrix: [{ prop: "look" }] }, `matrix prop "look" is not declared`);
  wrong("a sample outside an enum's options", { ...sampled, props: { ...sampled.props, variant: { ...variant, sample: "nope" } } }, "props.variant.sample is not one of its options");
  wrong("a sample on an event", { ...sampled, props: { ...sampled.props, onPress: { type: "event", sample: "x" } } }, "props.onPress.sample: an event has no sample (the docs pass data, never a handler)");
  wrong("a sample icon lucide lacks", { ...sampled, props: { ...sampled.props, iconLeading: { type: "icon", sample: "no-such-icon" } } }, `props.iconLeading.sample: lucide has no icon "no-such-icon"`);
  if (!quiet) console.log(`  docs mechanics: sample and cases draw ${before.length} renders each, as the plain docs do`);
}

/* ---------- code ---------- */

/**
 * `testID` (React Native) and `part` (the web) name the recipe part a shared piece draws inside another component: instrumentation, not an API.
 * `id`, `className`, `ref`, `nativeID` and the phone's `accessibilityLabel` / `accessibilityHint` are the pass-through props (`RootProps` in each
 * kit's `lib/root-props.ts`), universal like `style`: a kit that declares one by name is not adding an API the docs must list.
 */
const ALWAYS_OK = new Set(["style", "styles", "strings", "children", "className", "testID", "part", "id", "ref", "nativeID", "accessibilityLabel", "accessibilityHint"]);

/** Top-level members of `export interface XProps { … }`. */
function propsOf(src: string, name: string): string[] | null {
  const start = src.search(new RegExp(`export interface ${name}Props\\b[^{]*\\{`));
  if (start < 0) return null;
  let i = src.indexOf("{", start) + 1;
  let depth = 1;
  let line = "";
  const out: string[] = [];
  for (; i < src.length && depth > 0; i++) {
    const c = src[i]!;
    if (c === "{" || c === "(" || c === "[" || c === "<") depth++;
    else if (c === "}" || c === ")" || c === "]" || (c === ">" && src[i - 1] !== "=")) depth--;
    if (c === "\n") {
      const m = /^\s*(?:readonly\s+)?([A-Za-z_][A-Za-z0-9_]*)\??\s*:/.exec(line);
      if (m && line.startsWith(" ".repeat(2)) && !line.startsWith(" ".repeat(3))) out.push(m[1]!);
      line = "";
    } else if (depth === 1 || c !== "}") line += c;
  }
  return out;
}

function checkCode(doc: ComponentDocs, platform: Platform) {
  const kit = platform === "mobile" ? "react-native" : "react";
  const file = sourceFile(kit, doc.id);
  if (!file) return;
  const at = `${doc.id} (${kit})`;
  const src = readFileSync(file, "utf8");
  const members = propsOf(src, pascal(doc.id));
  if (!members) return err(at, `no exported ${pascal(doc.id)}Props interface`);
  const kitPlatforms: Platform[] = platform === "mobile" ? ["mobile"] : ["web", "desktop"];
  const documented = Object.entries(doc.props).filter(([, d]) => !d.platforms || d.platforms.some((p) => kitPlatforms.includes(p) && doc.platforms[p].status !== "not-applicable"));
  for (const [k] of documented) if (!members.includes(k)) err(at, `documented prop "${k}" is not in ${pascal(doc.id)}Props`);
  if (members.includes("styles")) {
    if (doc.props.styles) err(at, "props.styles: `styles` is a universal prop and is not documented per component");
    const decl = new RegExp(`export interface ${pascal(doc.id)}Props\\b[^{]*\\{(?:(?!\\n\\}\\n)[\\s\\S])*?\\n  styles(\\??):\\s*([^;\\n]+);`).exec(src);
    if (!decl) err(at, `${pascal(doc.id)}Props.styles: could not read its declaration`);
    else {
      if (decl[1] !== "?") err(at, `${pascal(doc.id)}Props.styles is required: make it optional (\`styles?:\`)`);
      if (decl[2]!.trim() !== `PartStyles<"${doc.id}">`) err(at, `${pascal(doc.id)}Props.styles is typed \`${decl[2]!.trim()}\`, not \`PartStyles<"${doc.id}">\``);
    }
    if (!/\buseRecipe\([^;]*\bstyles\b[^;]*\);/.test(src)) err(at, "declares `styles` but no useRecipe(…) call is passed it");
  }
  for (const m of members) if (!doc.props[m] && !ALWAYS_OK.has(m)) err(at, `${pascal(doc.id)}Props.${m} is not documented`);
  for (const m of src.matchAll(/\bon(?:Click|Press|PointerDown|KeyDown)=\{(on[A-Z][A-Za-z0-9]*)\}/g)) {
    err(at, `${m[0]} hands the app the DOM or native event — call it with its documented args: () => ${m[1]}?.(…)`);
  }
  // Read from the syntax tree, so a renamed local (`{ checked: checkedProp }`) still names its prop.
  for (const c of readControllable(file, src)) {
    const prop = c.prop ?? (/^[A-Za-z_]\w*$/.test(c.arg) ? c.arg : undefined);
    if (!prop || !c.handler || !/^on[A-Z]/.test(c.handler)) continue;
    if (doc.props[c.handler]?.changes !== prop) err(at, `useControllable(${c.arg}, ${c.handler}) — declare it in the docs as ${c.handler}: { changes: "${prop}" }`);
  }
  // Atomic design holds in the code, not only in the catalogue's order: what a component draws is never bigger than it.
  for (const m of src.matchAll(/from\s+"\.\.?\/(?:[a-z-]+\/)?([a-z0-9-]+)"/g)) {
    const used = registry[m[1]!];
    if (!used || used.id === doc.id) continue;
    if (LEVEL_RANK[used.level] > LEVEL_RANK[doc.level]) err(at, `${an(doc.level)} draws ${used.id}, ${an(used.level)}: raise ${doc.id}'s level, or lower ${used.id}'s`);
  }
}

// The API conventions that a machine can read (reports/api/conventions.md), held for every documented component. A violation that is not in
// `conventionsTodo` (reports/generic.json) fails, and an entry that now passes must come off: the list only shrinks. Each violation is `<rule>: <detail>`.
//   no-onChange        no component declares `onChange` (docs or either kit): a changed value is `on<Prop>Change` (rule 1)
//   no-collapsed       no component declares `collapsed`: a panel that opens and closes takes `expanded` (rule 3)
//   required-no-default  a `required` prop has no documented `default`: its catalogue value is its `sample` (rule 6)
//   change-event-name  every event that is declared `changes: "<prop>"` is named `on<Prop>Change` (rule 1)
//   controllable-default  a prop passed to `useControllable(<prop>, on<Prop>Change)` has no default in the destructuring (either kit, read from the
//                      syntax tree by scripts/controllable-ast.ts): with one, the handler alone would hold it at the default. Default the result
//                      instead, `const [on = false, setOn] = useControllable(checked, onCheckedChange)` (rule 1)
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function conventionViolations(doc: ComponentDocs): string[] {
  const out = new Set<string>();
  const declared = new Set(Object.keys(doc.props));
  for (const kit of ["react", "react-native"] as const) {
    const file = sourceFile(kit, doc.id);
    for (const m of (file && propsOf(readFileSync(file, "utf8"), pascal(doc.id))) || []) declared.add(m);
  }
  for (const kit of ["react", "react-native"] as const) {
    const file = sourceFile(kit, doc.id);
    for (const c of file ? readControllable(file, readFileSync(file, "utf8")) : []) if (c.defaulted && c.handler) out.add(`controllable-default: ${c.prop}`);
  }
  if (declared.has("onChange")) out.add("no-onChange: onChange");
  if (declared.has("collapsed")) out.add("no-collapsed: collapsed");
  for (const [name, d] of Object.entries(doc.props)) {
    if (d.required && d.default !== undefined) out.add(`required-no-default: ${name}`);
    if (d.changes !== undefined && name !== `on${upperFirst(d.changes)}Change`) out.add(`change-event-name: ${name} should be on${upperFirst(d.changes)}Change`);
  }
  return [...out].sort();
}

function checkConventions() {
  const at = "conventions";
  const todo = readGeneric().conventionsTodo ?? {};
  const ids = Object.keys(todo);
  if (ids.some((id, i) => i > 0 && ids[i - 1]! >= id)) err(GENERIC_AT, "conventionsTodo is not sorted, one id each");
  for (const id of ids) {
    if (!registry[id]) err(GENERIC_AT, `conventionsTodo: "${id}" is not a component`);
    const listed = todo[id]!;
    if (listed.some((e, i) => i > 0 && listed[i - 1]! >= e)) err(GENERIC_AT, `conventionsTodo["${id}"] is not sorted`);
  }
  for (const doc of components) {
    const now = conventionViolations(doc);
    const listed = todo[doc.id] ?? [];
    const fresh = now.filter((v) => !listed.includes(v));
    const gone = listed.filter((v) => !now.includes(v));
    if (fresh.length) err(`${at} ${doc.id}`, `${fresh.join("; ")} (reports/api/conventions.md). Fix it, or list ${fresh.length === 1 ? "it" : "them"} in conventionsTodo["${doc.id}"] in reports/generic.json`);
    if (gone.length) err(GENERIC_AT, `conventionsTodo["${doc.id}"] lists ${gone.map((v) => `"${v}"`).join(", ")}, which now pass${gone.length === listed.length ? `: take "${doc.id}" off the list` : ""}`);
    if (!fresh.length && !gone.length && now.length) warn(`${at} ${doc.id}`, `(conventionsTodo) ${now.join("; ")}`);
  }
}

// `styles` on every recipe-backed component, a sweep at a time: `reports/generic.json`'s `stylesTodo` is the ratchet. A component is done when
// it declares `styles` in every kit it has; in one kit alone the two kits would take different props.
const GENERIC_FILE = fileURLToPath(new URL("../../../reports/generic.json", import.meta.url));
const GENERIC_AT = "reports/generic.json";
/** The ratchet lists: each holds the ids (or `<id>.<prop>`, or `<id>: <parts>`) that break a rule today, sorted, and only ever shrinks. */
interface Generic {
  stylesTodo?: string[];
  stringsTodo?: string[];
  stylesProofTodo?: Record<string, string[]>;
  defaultsTodo?: string[];
  /** `{ "<id>": ["<rule>: <detail>", …] }`: the API conventions (reports/api/conventions.md) a component still breaks. */
  conventionsTodo?: Record<string, string[]>;
  /** `{ "<theme>/<scheme>: <fg> on <bg>": "<reason>" }`: the pairs `checkContrast` measures that fall short today. */
  contrastTodo?: Record<string, string>;
}
const readGeneric = () => JSON.parse(readFileSync(GENERIC_FILE, "utf8")) as Generic;
function checkStyles() {
  const at = GENERIC_AT;
  const todo = readGeneric().stylesTodo ?? [];
  if (todo.some((id, i) => i > 0 && todo[i - 1]! >= id)) err(at, "stylesTodo is not sorted, one id each");
  const ids = recipes as Record<string, Recipe>;
  for (const id of todo) if (!ids[id]) err(at, `stylesTodo: "${id}" has no recipe`);
  for (const id of Object.keys(ids).sort()) {
    const kits = (["react", "react-native"] as const).flatMap((kit) => {
      const file = sourceFile(kit, id);
      return file ? [{ kit, has: propsOf(readFileSync(file, "utf8"), pascal(id))?.includes("styles") ?? false }] : [];
    });
    if (kits.some((k) => k.has) && !kits.every((k) => k.has)) err(id, `declares \`styles\` in ${kits.filter((k) => k.has).map((k) => k.kit).join(", ")} and not in ${kits.filter((k) => !k.has).map((k) => k.kit).join(", ")}: the kits take the same props`);
    const declares = kits.length > 0 && kits.every((k) => k.has);
    if (declares && todo.includes(id)) err(at, `stylesTodo lists "${id}", which now declares \`styles\`: remove it`);
    if (!declares && !todo.includes(id)) err(id, `has a recipe and does not declare \`styles?: PartStyles<"${id}">\` in every kit: add it, or list "${id}" in stylesTodo in reports/generic.json`);
  }
}

// `styles` over Button's root changes what it names in both kits and nothing else: the root's other declarations and the rest of the markup are the same.
// Three cases: the key the recipe writes (`borderRadius`), a longhand of a shorthand the recipe writes (`borderTopLeftRadius` beside its `borderRadius`, and
// `backgroundColor` beside its `background`: the other three corners and the rest of the background stay the recipe's), and every other part's whole style
// (`styles.icon.opacity` reaches the icon, `styles.spinner.opacity` the spinner).
function checkStylesProof() {
  const at = "styles proof";
  const rootOf = (html: string, mark: string): string | undefined => html.match(new RegExp(`<[a-zA-Z]+[^<>]*${mark}[^<>]*>`))?.[0];
  const decls = (tag: string): Map<string, string> => new Map((/ style="([^"]*)"/.exec(tag)?.[1] ?? "").split(";").filter(Boolean).map((d) => [d.slice(0, d.indexOf(":")), d.slice(d.indexOf(":") + 1)]));
  const CORNERS = ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"];
  // `sets`: what the part must come out as (a phone writes `red` as `rgba(255,0,0,1.00)`); `moves`: declarations that change with it and nothing else does (the
  // recipe's `background` becomes the longhand `backgroundColor`, so the `background: none` the button resets with is what the shorthand then reads).
  const cases: { name: string; styles: object; sets: Record<string, string | string[]>; moves?: string[] }[] = [
    { name: "borderRadius", styles: { root: { borderRadius: 2 } }, sets: Object.fromEntries(CORNERS.map((c) => [c, "2px"])) },
    { name: "borderTopLeftRadius", styles: { root: { borderTopLeftRadius: 2 } }, sets: { "border-top-left-radius": "2px" } },
    { name: "backgroundColor", styles: { root: { backgroundColor: "red" } }, sets: { "background-color": ["red", "rgba(255,0,0,1.00)"] }, moves: ["background"] },
  ];
  for (const [platform, os, mark, Button] of [["web", "browser", 'data-af-part="root"', ReactKit.Button], ["mobile", "ios", 'data-testid="button.root"', NativeKit.Button]] as const) {
    const of = (styles?: object, props?: object) => draw(`${at} ${platform}`, createElement(Stage, { platform, os, scheme: "light", theme: antfabric, children: createElement(Button as never, { label: "Save", ...props, ...(styles ? { styles } : {}) }) }));
    const plain = of();
    if (plain === null) continue;
    // `canonical` is what the snapshot hashes: classes and inline declarations as one computed style, shorthands expanded.
    const a = canonical(plain);
    const ra = rootOf(a, mark);
    if (!ra) {
      err(`${at} ${platform}`, `no element marked ${mark} in Button's markup`);
      continue;
    }
    for (const c of cases) {
      const styled = of(c.styles);
      if (styled === null) continue;
      const b = canonical(styled);
      const rb = rootOf(b, mark);
      if (!rb) {
        err(`${at} ${platform}`, `no element marked ${mark} in Button's markup with styles.root.${c.name}`);
        continue;
      }
      const [da, db] = [decls(ra), decls(rb)];
      for (const [prop, wants] of Object.entries(c.sets)) {
        const want = [wants].flat();
        if (!want.includes(db.get(prop) ?? "")) err(`${at} ${platform}`, `styles.root.${c.name} left the root's ${prop} as ${db.get(prop)}, not ${want.join(" or ")}`);
        if (want.includes(da.get(prop) ?? "")) err(`${at} ${platform}`, `Button without \`styles\` already has ${prop} ${want[0]}: the proof proves nothing`);
        da.delete(prop);
        db.delete(prop);
      }
      for (const prop of c.moves ?? []) {
        da.delete(prop);
        db.delete(prop);
      }
      if ([...da].map((e) => e.join(":")).join(";") !== [...db].map((e) => e.join(":")).join(";")) err(`${at} ${platform}`, `styles.root.${c.name} moved another declaration of the root`);
      if (a.replace(ra, "") !== b.replace(rb, "")) err(`${at} ${platform}`, `styles on the root (${c.name}) changed something outside the root`);
    }
    // The other parts: an icon and the spinner take their whole style, so a key nobody reads for the size still reaches them.
    for (const [part, props] of [["icon", { iconLeading: "plus" }], ["spinner", { loading: true }]] as const) {
      const mark2 = platform === "web" ? `data-af-part="${part}"` : `data-testid="button.${part}"`;
      const base = of(undefined, props);
      const styled = of({ [part]: { opacity: 0.5 } }, props);
      if (base === null || styled === null) continue;
      const y = rootOf(canonical(styled), mark2);
      if (!rootOf(canonical(base), mark2) || !y) {
        err(`${at} ${platform}`, `no element marked ${mark2} in Button's markup (${part})`);
        continue;
      }
      if (decls(y).get("opacity") !== "0.5") err(`${at} ${platform}`, `styles.${part}.opacity 0.5 did not reach Button's ${part}: its opacity is ${decls(y).get("opacity")}`);
    }
  }
}

// `partStyle` is the order the library promises: the recipe, the kit's inline styles, then `styles[part]`. Without `styles` it is what `css(r.part, …inline)` was.
function checkPartStyle() {
  const at = "partStyle";
  const said = (what: string, got: unknown, want: unknown) => JSON.stringify(got) !== JSON.stringify(want) && err(`${at} ${what}`, `expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  const ctx = { variants: { variant: "primary", size: "md" } };
  // The web.
  const web = (styles?: object) => ReactRecipe.recipeStyles(recipes.button, { platform: "web", os: "browser", ...ctx }, styles as never);
  const plain = web();
  said("web: with no styles it is css(r.part, …inline)", ReactRecipe.partStyle(plain, "root", { cursor: "progress" }, false, { opacity: 0.5 }), { ...plain.root, cursor: "progress", opacity: 0.5 });
  said("web: with no inline and no styles it is the part", ReactRecipe.partStyle(plain, "root"), plain.root);
  const given = web({ root: { cursor: "help", paddingLeft: 3 } });
  said("web: styles beat the kit's inline", [ReactRecipe.partStyle(given, "root", { cursor: "progress" }).cursor, ReactRecipe.partStyle(given, "root", { paddingLeft: 9 }).paddingLeft], ["help", 3]);
  said("web: an inline the styles do not name stays", ReactRecipe.partStyle(given, "root", { opacity: 0.5 }).opacity, 0.5);
  said("web: the recipe's own keys are what styles refine", ReactRecipe.partStyle(web({ root: { borderTopLeftRadius: 2 } }), "root", {}).borderTopLeftRadius, 2);
  said("web: r.part already holds styles", given.root.cursor, "help");
  said("web: a part of another recipe's result has none to add", ReactRecipe.partStyle({ root: { cursor: "x" } }, "root", { opacity: 1 }), { cursor: "x", opacity: 1 });
  // The phone.
  const t = resolveTokens("mobile", "light", { os: "ios", theme: antfabric });
  const phone = (styles?: object) => NativeRecipe.recipeStyles(recipes.button, { platform: "mobile", os: "ios", ...ctx }, t, styles as never);
  const bare = phone();
  said("phone: with no styles it is the recipe's view and text under the inline", [NativeRecipe.partStyle(bare, "root", { view: { opacity: 0.5 }, text: { fontSize: 99 } })].map((p) => [{ ...p.view }, p.text.fontSize]), [[{ ...bare.root.view, opacity: 0.5 }, 99]]);
  said("phone: with no inline and no styles it is the part itself", NativeRecipe.partStyle(bare, "root") === bare.root, true);
  const over = phone({ root: { opacity: 0.77, fontSize: 31 } });
  const both = NativeRecipe.partStyle(over, "root", { view: { opacity: 0.5 }, text: { fontSize: 99 } });
  said("phone: styles beat the kit's inline, text keys on the text", [both.view.opacity, both.text.fontSize], [0.77, 31]);
  said("phone: an inline the styles do not name stays", NativeRecipe.partStyle(over, "root", { view: { margin: 4 } }).view.margin, 4);
  said("phone: r.part already holds styles", over.root.view.opacity, 0.77);
}

/**
 * What a component draws for one tree, for the checks below that only read the markup: no snapshot record, no failure. `ok` is false when it threw or
 * React or React Native Web warned (a different markup may be the reason, and the caller says so in its own words).
 */
function drawQuiet(node: ReactNode): { html: string | null; ok: boolean } {
  const logged: string[] = [];
  const keep = { error: console.error, warn: console.warn };
  console.error = (...a: unknown[]) => logged.push(a.map(String).join(" "));
  console.warn = (...a: unknown[]) => logged.push(a.map(String).join(" "));
  let html: string | null = null;
  let thrown = false;
  try {
    html = renderToString(node);
  } catch {
    thrown = true;
  } finally {
    console.error = keep.error;
    console.warn = keep.warn;
  }
  return { html, ok: !thrown && logged.length === 0 };
}

/** Every drawing a component page shows, as the props each takes: the rest, the examples that apply, the edge cases, and each matrix value on its own. */
function propSets(doc: ComponentDocs, platform: Platform): { name: string; props: Record<string, unknown>; state?: InteractionState; os?: OS }[] {
  const cases = casesFor(doc, platform);
  return [
    { name: "rest", props: {} },
    ...cases.examples.map((e) => ({ name: `example "${e.name}"`, props: e.props ?? {}, state: e.state, os: e.os })),
    ...cases.edge.flatMap((e) => (e.example && (!e.example.platforms || e.example.platforms.includes(platform)) ? [{ name: `edge "${e.title}"`, props: e.example.props ?? {}, state: e.example.state }] : [])),
    // A matrix row is its cases (W0): a plain row's values, or the prop bundles a removed enum became.
    ...cases.matrix.flatMap((m) => m.cases.map((c) => ({ name: `${m.prop}=${c.name}`, props: c.props as Record<string, unknown> }))),
  ];
}

// `styles` reaches every part, and it wins over everything the kit computes for it (the precedence in AUTHORING.md: recipe, theme override, the kit's own inline
// styles, `styles[part]`, then `style` on the root). Each recipe-backed component that declares `styles` is drawn through each of its drawings (the rest, the examples,
// the edge cases, each matrix value), on web, desktop and the phone's two OSes, twice: as it is, and with `styles` giving every part
//   reach       a probe no kit, recipe or entrance writes (`mix-blend-mode`, and on the phone `text-decoration-color` for a `Text`), so it can only have come from
//               `styles`: every element of every part that appears must carry it (a part drawn once per row is judged row by row). The web finds a part by
//               `data-af-part="<part>"`, the phone by `testID="<id>.<part>"` (the prefix is the component's, so another component's parts are never read); a
//               part the drawing does not draw is not looked for. On the web a component drawn inside this one names its parts alike ("root", "icon"): only this
//               component's own elements are judged, the ones outside every nested root (`ownWebParts`).
//   precedence  every size, spacing, radius, colour, opacity and cursor the part had in the first drawing, set again to a value of the probe's: the part must come
//               out with the probe's value for each, so a kit's inline style written after the recipe's cannot beat `styles`.
// On the phone a part's view takes the view keys and its `Text` the text keys (the reader sends text keys to `text`, the rest to `view`), so each element is held to
// the one it can take. A component that fails is in `stylesProofTodo` in reports/generic.json with its parts (`<kit>:<part>`), and the list only shrinks.
const PROBE_VIEW = { mixBlendMode: "multiply" } as const;
const PROBE_TEXT = { textDecorationColor: "rgb(7, 77, 177)" } as const;
const LENGTH = /^(?:width|height|min-width|min-height|max-width|max-height|top|right|bottom|left|gap|row-gap|column-gap|font-size|letter-spacing|margin(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|padding(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|border-(?:top|right|bottom|left)-width|border-(?:top|bottom)-(?:left|right)-radius)$/;
const COLOUR = /^(?:color|background-color|border-(?:top|right|bottom|left)-color|outline-color)$/;
/** What a probe sets a declaration to, and what the renderer then writes. A number is `7.77px` on both kits; `background` (a shorthand) is probed as its `background-color`. */
function probeFor(prop: string, value: string, mobile: boolean): { key: string; value: string | number; want: RegExp } | null {
  const key = (p: string) => p.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  if (prop === "background") return { key: "backgroundColor", value: "rgb(7, 77, 177)", want: /^rgba?\(7,\s*77,\s*177/ };
  // React Native Web writes `gap` as both `row-gap` and `column-gap`, and orders a longhand and its shorthand by its own sheet, so the phone's gap is not probed.
  if (mobile && /gap$/.test(prop)) return null;
  if (LENGTH.test(prop)) return { key: key(prop), value: 7.77, want: /^7\.77px$/ };
  if (COLOUR.test(prop)) return { key: key(prop), value: "rgb(7, 77, 177)", want: /^rgba?\(7,\s*77,\s*177/ };
  // An opacity of exactly 0 or 1 is an entrance, a fade or a visibility the component owns, not an appearance: it is not probed.
  if (prop === "opacity") return value === "0" || value === "1" ? null : { key: "opacity", value: 0.77, want: /^0\.77$/ };
  if (prop === "cursor" && !mobile) return { key: "cursor", value: "help", want: /^help$/ };
  return null;
}
const tagsOf = (html: string, mark: string) => html.match(new RegExp(`<[a-zA-Z]+[^<>]*${mark}[^<>]*>`, "g")) ?? [];
/** Void elements: no closing tag, so they never hold a child. */
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
/** An element of a web drawing that names a part (`data-af-part`): its opening tag, the nearest part-bearing element above it (`up`, -1 for none) and the last part-bearing element inside it (`last`, itself if none). */
interface WebPart { tag: string; part: string; up: number; last: number }
/** Every element of a web drawing that names a part, in document order. */
function webParts(html: string): WebPart[] {
  const out: WebPart[] = [];
  const stack: { name: string; at: number; self: number }[] = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const close = (to: number) => {
    for (let i = stack.length - 1; i >= to; i--) if (stack[i]!.self >= 0) out[stack[i]!.self]!.last = out.length - 1;
    stack.length = to;
  };
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const name = m[2]!.toLowerCase();
    if (m[1]) {
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i]!.name === name) { close(i); break; }
      continue;
    }
    const part = /\sdata-af-part="([^"]*)"/.exec(m[3]!)?.[1];
    const up = stack.length ? stack[stack.length - 1]!.at : -1;
    const self = part ? out.push({ tag: m[0], part, up, last: out.length }) - 1 : -1;
    if (VOID_TAGS.has(name) || m[3]!.endsWith("/")) continue;
    stack.push({ name, at: self >= 0 ? self : up, self });
    // A stylesheet's or a script's text is not markup.
    if (name === "style" || name === "script") {
      const end = html.indexOf(`</${name}`, re.lastIndex);
      if (end < 0) break;
      re.lastIndex = end;
    }
  }
  close(0);
  return out;
}
/**
 * Which of a web drawing's part elements are the component's own. A kit component draws every part of its own under its own `root`, so a component drawn inside
 * it (an IconButton, an Icon, a ListItem, the TitleBar and WebTopBar the catalogue's RailWindow draws around a NavRail) is a nested `root` with its parts below it,
 * named like this one's ("root", "icon"). `styles` is not passed to it, so it is not held to it. The component's own elements are the ones under no nested root and
 * the ones under a root that took the probe; when no root took it and several are drawn, the component's own is the one that failed and nothing tells which (`lost`).
 * A component with no `root` part (Menu's is its `panel`) is a nested root by its outermost part, when something below it is a part of that component this one does not
 * draw (a ContextMenu's Menu has `row`, `label`; its own `panel` has neither). `ownParts` are the recipe's parts, `others` the other recipes'.
 */
function ownWebParts(els: WebPart[], ownParts: readonly string[], others: Record<string, Recipe>, carries: (e: WebPart) => boolean): { own: boolean[]; lost: boolean } {
  // For each outermost part of a recipe without `root`: the parts of it that this component does not draw.
  const foreign = new Map<string, Set<string>>();
  for (const x of Object.values(others)) {
    const outer = x.parts[0];
    if (x.parts.includes("root") || !outer) continue;
    const set = foreign.get(outer) ?? foreign.set(outer, new Set()).get(outer)!;
    for (const q of x.parts) if (!ownParts.includes(q)) set.add(q);
  }
  const isRoot = (i: number) => {
    const e = els[i]!;
    if (e.part === "root") return true;
    const f = foreign.get(e.part);
    return !!f && els.slice(i + 1, e.last + 1).some((d) => f.has(d.part));
  };
  const scope = (i: number) => {
    for (let j = i; j >= 0; j = els[j]!.up) if (isRoot(j)) return j;
    return -1;
  };
  const scopes = els.map((_, i) => scope(i));
  const roots = els.flatMap((e, i) => (e.part === "root" ? [i] : []));
  const mine = new Set(roots.filter((i) => carries(els[i]!)));
  // A component's own root is its outermost part: a root with a part above it is a nested component's (QuestionPanel's collapsed bar
  // draws an IconButton, whose root is the only root on the page), so only an outermost root can stand in for an own root that lost.
  const outermost = roots.filter((i) => els[i]!.up === -1);
  if (ownParts.includes("root") && !mine.size && outermost.length === 1) mine.add(outermost[0]!);
  return { own: scopes.map((sc) => sc === -1 || mine.has(sc)), lost: ownParts.includes("root") && !mine.size && outermost.length > 1 };
}
const declsOf = (tag: string): Map<string, string> => new Map((/ style="([^"]*)"/.exec(tag)?.[1] ?? "").split(";").filter(Boolean).map((d) => [d.slice(0, d.indexOf(":")), d.slice(d.indexOf(":") + 1)]));

function checkStylesProbe() {
  const at = "styles probe";
  // Entrances drawn finished: an entrance's first frame (`opacity: 0`) is the kit's own, not something `styles` is held to.
  setReducedMotion(true);
  const todo = readGeneric().stylesProofTodo ?? {};
  const unconverted = new Set(readGeneric().stylesTodo ?? []);
  const failed = new Map<string, Map<string, Set<string>>>();
  const fail = (id: string, label: string, why: string) => {
    const byLabel = failed.get(id) ?? failed.set(id, new Map()).get(id)!;
    (byLabel.get(label) ?? byLabel.set(label, new Set()).get(label)!).add(why);
  };
  const ids = Object.keys(recipes as Record<string, Recipe>).sort();
  const targets: { kit: "react" | "react-native"; platform: Platform; os: OS }[] = [
    { kit: "react", platform: "web", os: "browser" },
    { kit: "react", platform: "desktop", os: "mac" },
    { kit: "react-native", platform: "mobile", os: "ios" },
    { kit: "react-native", platform: "mobile", os: "android" },
  ];
  for (const id of ids) {
    const doc = registry[id];
    if (!doc || unconverted.has(id)) continue;
    const recipe = (recipes as Record<string, Recipe>)[id]!;
    const otherRecipes = Object.fromEntries(Object.entries(recipes as Record<string, Recipe>).filter(([other]) => other !== id));
    for (const { kit, platform, os } of targets) {
      if (doc.platforms[platform].status === "not-applicable" || !kitComponent(id, platform)) continue;
      const mobile = platform === "mobile";
      const defaults = defaultsFor(usedIds(doc), platform);
      const mark = (part: string) => (mobile ? `data-testid="${id}\\.${part}"` : `data-af-part="${part}"`);
      const render = (props: Record<string, unknown>, state?: InteractionState) => {
        const drawn = drawQuiet(createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform, os, scheme: "light", theme: antfabric, state, children: createElement(Thing, { id, platform, props }) })));
        return drawn.html === null || waitingFor(drawn.html) ? null : canonical(drawn.html);
      };
      for (const c of propSets(doc, platform)) {
        if (c.os && c.os !== os) continue;
        const plain = render(c.props, c.state);
        if (plain === null) continue;
        // What the kit wrote on each part, as the probe's overrides.
        const styles: Record<string, Record<string, string | number>> = {};
        const expected = new Map<string, { part: string; prop: string; want: RegExp }[][]>();
        for (const part of recipe.parts) {
          const own: Record<string, string | number> = mobile ? { ...PROBE_VIEW, ...PROBE_TEXT } : { ...PROBE_VIEW };
          const perTag = (mobile ? tagsOf(plain, mark(part)) : webParts(plain).filter((e) => e.part === part).map((e) => e.tag)).map((tag) => {
            const wants: { part: string; prop: string; want: RegExp }[] = [];
            for (const [prop, was] of declsOf(tag)) {
              const p = probeFor(prop, was, mobile);
              if (!p) continue;
              own[p.key] = p.value;
              wants.push({ part, prop: p.key === "backgroundColor" ? "background-color" : prop, want: p.want });
            }
            return wants;
          });
          styles[part] = own;
          expected.set(part, perTag);
        }
        const styledHtml = render({ ...c.props, styles }, c.state);
        if (styledHtml === null) continue;
        // The web's own elements (ownWebParts): a component drawn inside this one has a root and parts named like this one's, and `styles` is not passed to it.
        const drawn = mobile ? [] : webParts(styledHtml);
        const carries = (e: { tag: string }) => /mix-blend-mode:multiply/.test(e.tag);
        const { own, lost } = mobile ? { own: [], lost: false } : ownWebParts(drawn, recipe.parts, otherRecipes, carries);
        const rootCount = drawn.filter((e) => e.part === "root").length;
        // A recipe with a `root` part draws it: a drawing whose outermost element is one of the component's parts and has no root (QuestionPanel's collapsed
        // bar: its only `root` is the IconButton's, inside the bar) has a part that `styles.root` and `style` cannot reach. The web judges the outermost
        // part-bearing elements; the phone has no nesting to read, so any part of the component with no `<id>.root` beside it. Nothing drawn (a component
        // that returns null) is not judged.
        if (recipe.parts.includes("root")) {
          const top = mobile ? [] : drawn.filter((e) => e.up === -1);
          const parts = mobile ? recipe.parts.filter((q) => tagsOf(styledHtml, mark(q)).length) : top.filter((e) => recipe.parts.includes(e.part)).map((e) => e.part);
          const ownRoot = mobile ? tagsOf(styledHtml, mark("root")).length > 0 : top.some((e) => e.part === "root");
          if (parts.length && !ownRoot) fail(id, `${kit}:root`, `no root of its own is drawn, only ${[...new Set(parts)].join(", ")} (${c.name})`);
        }
        for (const part of recipe.parts) {
          const label = `${kit}:${part}`;
          const all = mobile ? [] : drawn.flatMap((e, i) => (e.part === part ? [{ ...e, mine: own[i]! }] : []));
          const tags = mobile ? tagsOf(styledHtml, mark(part)) : all.map((e) => e.tag);
          if (mobile) {
            const view = (tag: string) => /mix-blend-mode:multiply/.test(tag);
            const text = (tag: string) => /text-decoration-color:rgba?\(7,\s*77,\s*177/.test(tag);
            const textual = (tag: string) => /class="[^"]*css-text-/.test(tag);
            const input = (tag: string) => /class="[^"]*css-textinput-/.test(tag);
            for (const tag of tags) if (textual(tag) ? !text(tag) : input(tag) ? !(text(tag) || view(tag)) : !view(tag)) fail(id, label, `${textual(tag) ? "a Text" : "a View"} did not carry the probe (${c.name})`);
          } else {
            if (part === "root" && lost) fail(id, label, `none of the ${rootCount} roots carried the probe (${c.name})`);
            else for (const e of all) if (e.mine && !carries(e)) fail(id, label, `${all.filter((q) => q.mine).length > 1 ? "an element of the part" : "the element"} did not carry the probe (${c.name})`);
          }
          // Precedence: the part's elements, paired with the first drawing's in order; only the ones that took the probe are this component's.
          const before = expected.get(part) ?? [];
          if (before.length !== tags.length) continue;
          tags.forEach((tag, i) => {
            if (!mobile && !(all[i]!.mine && carries(all[i]!))) return;
            const after = declsOf(tag);
            for (const w of before[i] ?? []) if (!w.want.test(after.get(w.prop) ?? "")) fail(id, label, `${w.prop} stayed ${after.get(w.prop) ?? "unset"}, not the probe's (${c.name})`);
          });
        }
      }
    }
  }
  setReducedMotion(false);
  // The ratchet: what fails today is listed with its parts, exactly.
  if (Object.keys(todo).some((id, i, all) => i > 0 && all[i - 1]! >= id)) err(GENERIC_AT, "stylesProofTodo is not sorted, one id each");
  for (const id of Object.keys(todo)) {
    if (!(recipes as Record<string, Recipe>)[id]) err(GENERIC_AT, `stylesProofTodo: "${id}" has no recipe`);
    else if (unconverted.has(id)) err(GENERIC_AT, `stylesProofTodo lists "${id}", which does not declare \`styles\` yet (stylesTodo): list it in one place only`);
  }
  for (const id of ids) {
    const byLabel = failed.get(id) ?? new Map<string, Set<string>>();
    const now = [...byLabel.keys()].sort();
    const listed = todo[id] ?? [];
    if (listed.some((p, i) => i > 0 && listed[i - 1]! >= p)) err(GENERIC_AT, `stylesProofTodo["${id}"] is not sorted`);
    const reasons = (labels: string[]) => labels.map((l) => `${l}: ${[...(byLabel.get(l) ?? [])].slice(0, 3).join("; ")}`).join(" | ");
    const fresh = now.filter((p) => !listed.includes(p));
    const gone = listed.filter((p) => !now.includes(p));
    if (fresh.length) err(`${at} ${id}`, `\`styles\` does not win on ${reasons(fresh)}. A part carries whatever \`styles[part]\` gives it, over the recipe and over the kit's own inline styles (partStyle, AUTHORING.md "Per-part styles"). Fix it${listed.length ? "" : `, or list "${id}" in stylesProofTodo in reports/generic.json`}`);
    if (gone.length) err(GENERIC_AT, `stylesProofTodo["${id}"] lists ${gone.join(", ")}, which now carry \`styles\`: take ${gone.length === listed.length ? `"${id}"` : "them"} off the list`);
    if (!fresh.length && !gone.length && now.length) warn(`${at} ${id}`, `(stylesProofTodo) \`styles\` does not win on ${reasons(now)}`);
  }
}

// The documented default of a prop is the kit's: a component drawn with every documented default, then again with one prop left out, draws the same markup. A
// difference means the docs say a default the component does not have (the catalogue's controls and flows are drawn from the docs), or the kit has a default the docs do
// not. `required` props and events are not compared (a required `label`'s documented default is the catalogue's sample). Mismatches are listed in `defaultsTodo`
// (`<id>.<prop>`), and the list only shrinks.
function checkDefaults() {
  const todo = readGeneric().defaultsTodo ?? [];
  if (todo.some((k, i) => i > 0 && todo[i - 1]! >= k)) err(GENERIC_AT, "defaultsTodo is not sorted, one `<id>.<prop>` each");
  const found = new Map<string, string>();
  for (const doc of components) {
    for (const [platform, os] of [["web", "browser"], ["mobile", "ios"]] as const) {
      if (doc.platforms[platform].status === "not-applicable" || !kitComponent(doc.id, platform)) continue;
      const applies = (d: { platforms?: Platform[] }) => !d.platforms || d.platforms.some((p) => (p === "mobile") === (platform === "mobile") && doc.platforms[p].status !== "not-applicable");
      const all = Object.fromEntries(Object.entries(doc.props).filter(([, d]) => d.type !== "event" && d.default !== undefined && !d.required && applies(d)).map(([k, d]) => [k, d.default]));
      if (!Object.keys(all).length) continue;
      const drawWith = (given: Record<string, unknown>) => {
        const drawn = drawQuiet(createElement(DefaultsProvider, { value: { [doc.id]: given } }, createElement(Stage, { platform, os, scheme: "light", theme: antfabric, children: createElement(Thing, { id: doc.id, platform }) })));
        return drawn.html === null || waitingFor(drawn.html) ? null : { html: canonical(drawn.html), ok: drawn.ok };
      };
      const base = drawWith(all);
      if (!base) continue;
      for (const k of Object.keys(all)) {
        const rest = { ...all };
        delete rest[k];
        const without = drawWith(rest);
        if (!without || found.has(`${doc.id}.${k}`)) continue;
        if (without.html !== base.html || without.ok !== base.ok) found.set(`${doc.id}.${k}`, `${doc.id}.${k}: with ${JSON.stringify(all[k])} (the docs' default) the ${platform === "mobile" ? "phone" : "web"} kit draws differently than with the prop left out${without.ok ? "" : " (it throws or warns without it)"}: the kit's default is not what the docs say`);
      }
    }
  }
  for (const [key, why] of found) {
    if (todo.includes(key)) warn(`defaults ${key}`, `(defaultsTodo) ${why}`);
    else err(`defaults ${key}`, `${why}. Fix the docs' \`default\` or the kit's, or list "${key}" in defaultsTodo in reports/generic.json`);
  }
  for (const key of todo) {
    const [id, prop] = key.split(".") as [string, string];
    if (!registry[id]?.props[prop]) err(GENERIC_AT, `defaultsTodo: "${key}" is not a prop of a component`);
    else if (!found.has(key)) err(GENERIC_AT, `defaultsTodo lists "${key}", whose documented default now equals the kit's: remove it`);
  }
}

const LEVEL_RANK: Record<ComponentDocs["level"], number> = { atom: 0, molecule: 1, organism: 2 };
// Heavy or third-party code is reachable only from the subpaths built for it, so an app that never imports one gets today's bundle.
const ONLY_UNDER: { pkg: RegExp; under: string | string[]; why: string }[] = [
  { pkg: /^recharts(?:\/|$)/, under: ["packages/react/src/data/", "packages/react/src/components/data/"], why: "charts reach the React kit only through its data subpath" },
  { pkg: /^(?:react-native-gifted-charts|gifted-charts-core)(?:\/|$)/, under: ["packages/react-native/src/data/", "packages/react-native/src/components/data/"], why: "charts reach the phone kit only through its data subpath" },
  { pkg: /^@tanstack\/table-core(?:\/|$)/, under: "packages/core/src/table/", why: "the table engine is core's table subpath" },
  // Named imports of the icons the kit draws, in one file, so a bundler keeps those and drops the rest of lucide (`checkIconRegistry`).
  { pkg: /^lucide-react(?:\/|$)/, under: "packages/react/src/lib/icons.ts", why: "the kit's icons are its registry's, imported one by one" },
  { pkg: /^lucide-react-native(?:\/|$)/, under: "packages/react-native/src/lib/icons.ts", why: "the kit's icons are its registry's, imported one by one" },
];

/** Every module a file names: `from "x"`, `import "x"`, `import("x")`, `require("x")`, with comments blanked first. */
const specifiersOf = (src: string) => [...stripComments(src).matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g)].map((m) => ({ spec: m[1]!, line: src.slice(0, m.index).split("\n").length }));

const sourcesUnder = (dir: string): string[] =>
  !existsSync(dir) ? [] : readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? sourcesUnder(join(dir, f)) : /\.tsx?$/.test(f) ? [join(dir, f)] : []));

/** The source file a relative import names (`./x` → `x.ts`, `x.tsx` or `x/index.ts`), or null when there is none. */
function resolveSource(from: string, spec: string): string | null {
  const base = join(dirname(from), spec);
  for (const f of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) if (existsSync(f) && statSync(f).isFile()) return f;
  return null;
}

/**
 * What a kit's `./shell` or `./chat` entry (`packages/<kit>/src/<sub>/index.ts`) reaches: the files it re-exports, a folder's every file when
 * it re-exports a category's `index.ts` (`../components/shell`), so the set grows as components move there and is empty while the entry is.
 */
function subpathFiles(root: string, kit: "react" | "react-native", sub: "shell" | "chat"): Set<string> {
  const entry = join(root, "packages", kit, "src", sub, "index.ts");
  const out = new Set<string>();
  if (!existsSync(entry)) return out;
  for (const { spec } of specifiersOf(readFileSync(entry, "utf8"))) {
    if (!spec.startsWith(".")) continue;
    const file = resolveSource(entry, spec);
    if (!file) continue;
    if (/\/index\.tsx?$/.test(file) && !/\/index\.tsx?$/.test(spec)) for (const f of sourcesUnder(dirname(file))) out.add(f);
    else out.add(file);
  }
  return out;
}

function checkImports() {
  const root = repoRoot();
  const relative = (file: string) => file.slice(root.length + 1);
  const SUBS = ["shell", "chat"] as const;
  const subpath = Object.fromEntries(SUBS.map((sub) => [sub, { react: subpathFiles(root, "react", sub), "react-native": subpathFiles(root, "react-native", sub) }])) as Record<(typeof SUBS)[number], Record<"react" | "react-native", Set<string>>>;
  const WHAT = { shell: "app frame", chat: "conversation idiom" } as const;
  for (const pkg of ["core", "react", "react-native", "docs"]) {
    for (const file of sourcesUnder(join(root, "packages", pkg, "src"))) {
      const at = relative(file);
      const inChart = at.startsWith("packages/core/src/chart/");
      const kit = /^packages\/(react|react-native)\/src\/templates\//.exec(at)?.[1];
      // The app frame (`./shell`) and the conversation idiom (`./chat`) are each reachable only through their own subpath: no file outside
      // it imports its entry or a file it re-exports, so the root (and `./data`, and the other subpath, and a template) can never pull it
      // in. A shell or chat component may import the root's components; the other way round fails.
      const ownKit = pkg === "react" || pkg === "react-native" ? pkg : null;
      for (const { spec, line } of specifiersOf(readFileSync(file, "utf8"))) {
        const where = `${at}:${line}`;
        // A template is a consumer: it may import ./shell and ./chat as an app does (the template rule below allows only public entries).
        if (ownKit && !kit) {
          for (const sub of SUBS) {
            if (at.startsWith(`packages/${ownKit}/src/${sub}/`) || subpath[sub][ownKit].has(file)) continue;
            if (new RegExp(`^@antfabric/ui-(?:react|react-native)/${sub}$`).test(spec)) err(where, `imports "${spec}": a kit file outside src/${sub}/ never imports the ${sub} entry`);
            const target = spec.startsWith(".") ? resolveSource(file, spec) : null;
            if (target && relative(target).startsWith(`packages/${ownKit}/src/${sub}/`)) err(where, `imports "${spec}": only packages/${ownKit}/src/${sub}/ and what it re-exports may import the ${sub} entry, so the root never reaches ./${sub}`);
            else if (target && subpath[sub][ownKit].has(target)) err(where, `imports "${spec}" (${relative(target)}), which ships from @antfabric/ui-${ownKit}/${sub} (the ${WHAT[sub]}): only the ${sub} entry and the files it re-exports import it, so the root never reaches ./${sub} (take its line out of this file)`);
          }
        }
        for (const rule of ONLY_UNDER) {
          const under = [rule.under].flat();
          if (rule.pkg.test(spec) && !under.some((u) => at.startsWith(u))) err(where, `imports "${spec}", allowed only under ${under.join(" and ")} (${rule.why})`);
        }
        const bare = !spec.startsWith(".") && !spec.startsWith("/");
        if (inChart && bare && !/^(?:react|react-native|@antfabric\/ui-[a-z-]+)(?:\/|$)/.test(spec)) err(where, `imports "${spec}": core's chart/ engine imports nothing third-party`);
        if (!kit) continue;
        // A template draws with its kit's public entries (the root, `data`, `shell`, `chat`) and core's, never a component file, a recipe or lib/.
        if (bare) {
          const own = new RegExp(`^@antfabric/ui-(?:${kit}|core)(?:/[a-z.-]+)?$`);
          if (!/^(?:react|react-native)$/.test(spec) && !own.test(spec)) err(where, `imports "${spec}": a template imports only react${kit === "react-native" ? ", react-native" : ""}, @antfabric/ui-${kit} (its root, data, shell and chat) and @antfabric/ui-core`);
        } else {
          const target = relative(join(dirname(file), spec)).replace(/\.tsx?$/, "").replace(/\/index$/, "");
          const prefix = `packages/${kit}/src`;
          if (target !== prefix && target !== `${prefix}/data` && target !== `${prefix}/shell` && target !== `${prefix}/chat` && !target.startsWith(`${prefix}/templates`)) err(where, `imports "${spec}": a template imports only its kit's public entries (${prefix}/index, ${prefix}/data, ${prefix}/shell and ${prefix}/chat), never a component file, a recipe or lib/`);
        }
      }
    }
  }
}
const an = (level: string) => `${/^[aeiou]/.test(level) ? "an" : "a"} ${level}`;

/* ---------- icons ---------- */

/** Source written here for the icon-name reader: each way a name reaches an icon, and a string that is not one. */
const ICON_PROBE = `const MAP = { danger: "circle-alert", info: "info" };
const LIST = [["bold", "bold-icon", label], "rule"] as const;
function Row({ tone, glyph = "pin" }) {
  const meta = (named: string) => <Icon name={named} />;
  return (
    <div title="not-an-icon">
      {meta("pencil")}
      <Icon name={glyph} />
      <Icon name={tone === "danger" ? "triangle-alert" : MAP[tone]} />
      {LIST.map((t) => (t === "rule" ? null : <IconButton icon={t[1]} label={t[0]} />))}
      <Button iconLeading={\`chevron-\${tone}\`} />
    </div>
  );
}`;
const ICON_PROBE_NAMES = ["circle-alert", "info", "bold-icon", "pin", "pencil", "triangle-alert", "dynamic:`chevron-${tone}`"];

/**
 * A kit ships only the lucide icons it draws (`src/lib/icons.ts`), so every name its source spells for an icon (`readIconNames`: `<Icon name>`,
 * an icon prop, a default, a ternary, a map, a list read in a `.map`, a local helper's argument) must be registered there, and everything
 * registered must be drawn. A name an app passes is the app's to register; a name built at run time cannot be held to the registry, so it fails.
 */
function checkIconRegistry() {
  const probe = readIconNames("probe.tsx", ICON_PROBE).map((u) => (u.dynamic ? `dynamic:${u.name}` : u.name));
  if (probe.length !== ICON_PROBE_NAMES.length || ICON_PROBE_NAMES.some((n) => !probe.includes(n))) err("scripts/icons-ast.ts", `readIconNames read [${probe.join(", ")}] from the probe, not [${ICON_PROBE_NAMES.join(", ")}]`);
  const root = repoRoot();
  for (const kit of ["react", "react-native"] as const) {
    const at = `packages/${kit}/src/lib/icons.ts`;
    const registry = readIconRegistry(readFileSync(join(root, at), "utf8"));
    const drawn = new Set<string>();
    for (const file of sourcesUnder(join(root, "packages", kit, "src"))) {
      const rel = file.slice(root.length + 1);
      if (rel === at) continue;
      for (const u of readIconNames(file, readFileSync(file, "utf8"))) {
        const where = `${rel}:${u.line}`;
        if (u.dynamic) err(where, `builds an icon name (${u.name}): spell each name out, so it can be held to the registry in ${at}`);
        else if (!registry.has(pascal(u.name))) err(where, `draws the icon "${u.name}", which ${at} does not register: import ${pascal(u.name)} there and add it to the registry, or an app gets an empty box`);
        else drawn.add(pascal(u.name));
      }
    }
    for (const n of registry) if (!drawn.has(n)) err(at, `registers ${n}, which no file of the kit draws: take it out (the registry holds the kit's own icons; an app registers the rest)`);
  }
}

/* ---------- strings ---------- */

/** The kit a strings file belongs to, as `OnlyOn` names it. */
const KIT_OF = { react: "web", "react-native": "mobile" } as const;

/**
 * What is wrong with one kit file's use of its component's strings, as messages: a call whose result is dropped or whose key cannot be told,
 * a key the dictionary does not have, variables that are not the template's placeholders (and `count` for a plural), a key no call reads in a kit that
 * draws the component (unless it is declared platform-only for the other kit), a platform-only key the wrong kit reads, and a `s` handed to a function.
 * Pure over what `readStrings` found, so it is tested on source written here.
 */
function stringsFindings(id: string, kit: "react" | "react-native", rel: string, found: FileStrings, dictionary: Record<string, Record<string, StringTemplate>>, onlyOn: PlatformOnly): string[] {
  const out: string[] = [];
  const problem = (text: string) => out.push(text);
  const group = dictionary[id] ?? {};
  const keys = Object.keys(group);
  const where = (line: number) => `${rel}:${line}`;
  const read = new Set<string>();
  const common = dictionary.common ?? {};
  const own = (key: string) => key in group;
  for (const l of [...new Map(found.loose.map((l) => [`${l.name}:${l.line}`, l])).values()]) problem(`${kit}: ${where(l.line)}: \`${l.name}\` is passed on instead of called (the check cannot see which keys that reads): call it where the text is drawn`);
  for (const r of found.reads) {
    if (r.binding.id !== id) continue;
    const call = `${r.binding.name}${r.parts ? ".parts" : ""}(${r.text})`;
    if (r.discarded) {
      problem(`${kit}: ${where(r.line)}: ${call} is called and its result thrown away: a call only to satisfy this check reads nothing. Declare the key in the category file's \`<category>Only\` for the kit that does read it`);
      continue;
    }
    if (r.keys === null) {
      problem(`${kit}: ${where(r.line)}: ${call}: cannot tell which key this reads: give it a literal key, or a \`const\` of literal keys`);
      continue;
    }
    const names = new Set(r.keys);
    for (const pattern of r.patterns) {
      const hit = [...keys, ...Object.keys(common)].filter((k) => pattern.test(k));
      if (!hit.length) problem(`${kit}: ${where(r.line)}: ${call} names no key of "${id}" or \`common\``);
      for (const k of hit) names.add(k);
    }
    // The variables must be the template's placeholders (and `count` for a plural).
    let wantedAny: Set<string> | undefined;
    for (const key of names) {
      const template = own(key) ? group[key] : common[key];
      if (template === undefined) {
        problem(`${kit}: ${where(r.line)}: ${call}: "${key}" is not a key of "${id}" or of \`common\``);
        continue;
      }
      if (own(key)) read.add(key);
      if (r.vars === null || r.patterns.length) continue;
      const { names: wanted } = placeholdersOf(template as string | Record<string, string>);
      const missing = [...wanted].filter((v) => !r.vars!.includes(v));
      if (missing.length) problem(`${kit}: ${where(r.line)}: ${call}: "${key}" is ${JSON.stringify(template)} and no \`${missing.join("`, `")}\` is passed`);
      wantedAny = new Set([...(wantedAny ?? []), ...wanted]);
    }
    if (r.vars !== null && wantedAny) {
      const unused = r.vars.filter((v) => !wantedAny!.has(v));
      if (unused.length) problem(`${kit}: ${where(r.line)}: ${call} passes \`${unused.join("`, `")}\`, which no placeholder of ${[...names].map((k) => `"${k}"`).join(" or ")} uses`);
    }
  }
  // Every key is read by every kit that draws the component, unless it is declared platform-only (then by that kit, and not by the other).
  for (const key of keys) {
    const only = onlyOn[id]?.[key]?.[0];
    if (only && only !== KIT_OF[kit]) {
      if (read.has(key)) problem(`${kit}: "${key}" is declared platform-only for "${only}" but the ${rel} reads it: take the declaration off, or the read out`);
    } else if (!read.has(key) && !found.loose.length) problem(`${kit}: defaultStrings["${id}"].${key} is never read in ${rel}: draw it with s("${key}"), or declare it platform-only for the kit that reads it${only ? "" : ", or take the key out"}`);
  }
  return out;
}


// Built-in text lives in packages/core/src/strings, keyed by docs id. A key nobody reads is dead text a product would translate for nothing; a component that reads
// strings without taking the `strings` prop cannot be overridden per instance; an id with no component is a typo.
function checkStrings() {
  // The formatter and the resolution order, on a table.
  const plural = { one: "{count} reply", other: "{count} replies" };
  const said = (what: string, got: unknown, want: unknown) => JSON.stringify(got) !== JSON.stringify(want) && err(`strings ${what}`, `expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  said("placeholders", formatString("{current}/{max}", { current: 3, max: 80 }), "3/80");
  said("a missing variable stays", formatString("Hi {name}"), "Hi {name}");
  said("escaped braces", formatString("{{a}} {b}", { b: 1 }), "{a} 1");
  said("plural one", formatString(plural, { count: 1 }), "1 reply");
  said("plural other", formatString(plural, { count: 2 }), "2 replies");
  said("plural without a count", formatString(plural), "{count} replies");
  said("plural in Polish", [1, 2, 5, 22].map((count) => formatString({ one: "1", few: "few", many: "many", other: "other" }, { count }, "pl")), ["1", "few", "many", "few"]);
  said("plural in a bad locale", formatString(plural, { count: 1 }, "not a locale"), "1 reply");
  said("an inherited key is not a variable", [formatString("{constructor}/{toString}/{__proto__}/{hasOwnProperty}"), formatParts("{constructor}", {}), formatString("{constructor}", { constructor: "own" } as never)], ["{constructor}/{toString}/{__proto__}/{hasOwnProperty}", ["{constructor}"], "own"]);
  said("plural with a numeric string count", [formatString(plural, { count: "1" }), formatString(plural, { count: "2" }), formatString(plural, { count: " 1 " }), formatString({ one: "{count} reply", few: "few {count}", other: "{count} replies" }, { count: "3" }, "pl"), formatString({ one: "a", few: "few", other: "other" }, { count: "2" }, "pl")], ["1 reply", "2 replies", " 1  reply", "few 3", "few"]);
  said("plural with a count that is no number", [formatString(plural, { count: "" }), formatString(plural, { count: "many" })], [" replies", "many replies"]);
  const zero = { zero: "No replies", one: "{count} reply", other: "{count} replies" };
  said("plural zero", [formatString(zero, { count: 0 }), formatString(zero, { count: "0" }), formatString(zero, { count: 1 }), formatString(zero, { count: 2 }), formatString(zero, { count: 0 }, "ar"), formatString(plural, { count: 0 })], ["No replies", "No replies", "1 reply", "2 replies", "No replies", "0 replies"]);
  said("plural zero in parts", formatParts(zero, { count: 0 }), ["No replies"]);
  said("parts", formatParts("{current}/{max}", { current: 3, max: 80 }), ["3", "/", "80"]);
  said("parts escaped", formatParts("a {{b}} {c} d", { c: "x" }), ["a {b} ", "x", " d"]);
  said("parts join to the string", formatParts("{n} of {m}", { n: 1, m: 2 }).join(""), formatString("{n} of {m}", { n: 1, m: 2 }));
  const over = mergeStrings({ "text-field": { required: "A", copied: "B" } }, { "text-field": { required: "C" } });
  said("nested providers merge key by key", over, { "text-field": { required: "C", copied: "B" } });
  said("instance over tree over default", [stringsFor("text-field", over, { required: "I" })("required"), stringsFor("text-field", over, undefined)("required"), stringsFor("text-field", over, undefined)("copied"), stringsFor("text-field", undefined, undefined)("copied")], ["I", "C", "B", "Copied"]);
  said("content key ignores order", stringsKey({ b: 1, a: { d: 1, c: 2 } }), stringsKey({ a: { c: 2, d: 1 }, b: 1 }));
  const dictionary = defaultStrings as unknown as Record<string, Record<string, StringTemplate>>;
  for (const id of Object.keys(dictionary)) if (id !== "common" && !registry[id]) err(`strings ${id}`, "is in defaultStrings but no component has this docs id: strings are keyed by docs id");
  // The syntax-tree reader and its rules, on source written here: each case is a file, and the problems it must have, in order, by what they quote.
  {
    const dict = { x: { greet: "Hi {name}", one: "1 {n}", two: "2", hidden: "h", dropped: "d", tabA: "A", tabB: "B", count: { one: "{count} a", other: "{count} b" }, alpha: "a", beta: "b", unused: "u", only: "o" }, common: { close: "Close" } } as unknown as Record<string, Record<string, StringTemplate>>;
    const fixtures: { name: string; kit?: "react" | "react-native"; only?: PlatformOnly; src: string; wants: string[] }[] = [
      {
        name: "every kind of call",
        src: `function A({ strings }) {
          const str = useStrings("x", strings);
          const keyed = { a: "alpha", b: "beta" } as const;
          void str("hidden");
          str("dropped");
          for (let str = 0; str < 1; str++) str();
          return [str("greet", { name }), str.parts(cond ? "one" : "two", { n }), str(\`tab\${k}\`), str("count", { count: 1 }), str(keyed[k]), str("close"), str("unused")];
        }`,
        wants: ['str("hidden") is called and its result thrown away', 'str("dropped") is called and its result thrown away', 'defaultStrings["x"].only is never read'],
      },
      {
        name: "variables and unknown keys",
        src: `function A({ strings }) {
          const s = useStrings("x", strings);
          return [s("greet"), s("greet", { name, extra: 1 }), s("count", { n: 1 }), s("nope"), s("tab" + k), s("one", { ...vars }), s(\`zzz\${k}\`)];
        }`,
        wants: ['s("greet"): "greet" is "Hi {name}" and no `name` is passed', 'passes `extra`', '"count" is {"one":"{count} a","other":"{count} b"} and no `count` is passed', '"nope" is not a key', 'cannot tell which key this reads', 'names no key'],
      },
      {
        name: "a platform-only key is read by that kit and not the other",
        kit: "react",
        only: { x: { only: ["mobile"] } },
        src: `function A({ strings }) { const s = useStrings("x", strings); return [s("only"), s("greet", { name }), s("one", { n }), s("two"), s("tabA"), s("tabB"), s("count", { count }), s("alpha"), s("beta"), s("hidden"), s("dropped"), s("unused")]; }`,
        wants: ['"only" is declared platform-only for "mobile" but the x.tsx reads it'],
      },
      {
        name: "a platform-only key may be unread, and a clean file has no problem",
        kit: "react-native",
        only: { x: { hidden: ["web"], dropped: ["web"] } },
        src: `function A({ strings }) { const s = useStrings("x", strings); const k = cond ? "alpha" : "beta"; return [s("only"), s("greet", { name }), s("one", { n }), s("two"), s("tabA"), s("tabB"), s("count", { count }), s(k), s("unused"), s("close")]; }`,
        wants: [],
      },
      {
        name: "a binding passed on, and a second component in the file",
        src: `function A({ strings }) { const s = useStrings("x", strings); return fmt(s); }
          function B({ strings }) { const str = useStrings("x", strings); return str("greet", { name }); }`,
        wants: ['`s` is passed on instead of called'],
      },
    ];
    for (const f of fixtures) {
      const found = stringsFindings("x", f.kit ?? "react", "x.tsx", readStrings("x.tsx", f.src), dict, f.only ?? {});
      const missing = f.wants.filter((w) => !found.some((m) => m.includes(w)));
      const extra = f.wants.length === 0 ? found : [];
      if (missing.length) err(`strings reader "${f.name}"`, `expected a problem mentioning ${missing.map((m) => JSON.stringify(m)).join(", ")}; got ${JSON.stringify(found)}`);
      if (extra.length) err(`strings reader "${f.name}"`, `expected no problem, got ${JSON.stringify(extra)}`);
    }
  }
  // Platform-only keys: declared next to the keys, typed by `OnlyOn`, collected by strings/index.ts.
  for (const [id, keys] of Object.entries(platformOnly)) {
    if (!dictionary[id] || id === "common") err(`strings ${id}`, "a platform-only declaration names a component that has no strings");
    for (const [key, kits] of Object.entries(keys)) {
      if (!(key in (dictionary[id] ?? {}))) err(`strings ${id}.${key}`, "a platform-only declaration names a key the component does not have");
      if (kits.length !== 1 || !["web", "mobile"].includes(kits[0])) err(`strings ${id}.${key}`, `a platform-only key names exactly one kit ("web" or "mobile"), not ${JSON.stringify(kits)}`);
    }
  }
  // Per component: what each kit file does with its text. A component that breaks a rule below is in `stringsTodo` (reports/generic.json) with
  // the reasons printed; one that does not must not be.
  const todo = readGeneric().stringsTodo ?? [];
  if (todo.some((id, i) => i > 0 && todo[i - 1]! >= id)) err(GENERIC_AT, "stringsTodo is not sorted, one id each");
  const problems = new Map<string, string[]>();
  const problem = (id: string, text: string) => problems.set(id, [...(problems.get(id) ?? []), text]);
  for (const kit of ["react", "react-native"] as const) {
    for (const doc of components) {
      const file = sourceFile(kit, doc.id);
      if (!file) continue;
      const at = `strings ${doc.id} (${kit})`;
      const rel = file.slice(repoRoot().length + 1);
      const where = (line: number) => `${rel}:${line}`;
      const raw = readFileSync(file, "utf8");
      const found = readStrings(file, raw);
      const group = dictionary[doc.id] ?? {};
      const keys = Object.keys(group);
      for (const u of found.unreadable) err(at, `${where(u.line)}: \`${u.text}\` must be \`const s = useStrings("<id>", strings)\`: the check reads the keys from that form`);
      if (!found.bindings.length) {
        // A kit with no use for any word (every key is declared platform-only for the other kit: Card's long-press label on the web) need not bind them.
        const wanted = keys.filter((k) => { const only = platformOnly[doc.id]?.[k]?.[0]; return !only || only === KIT_OF[kit]; });
        if (wanted.length) err(at, `defaultStrings["${doc.id}"] has ${wanted.length} keys but the ${kit} file never calls \`const s = useStrings("${doc.id}", strings)\``);
        continue;
      }
      for (const b of found.bindings) {
        if (b.id !== doc.id) err(at, `${where(b.line)}: useStrings("${b.id}") in the file of "${doc.id}": a component reads only its own strings (the shared ones come through \`common\`)`);
        // A component whose only words are shared ones (`dismiss`, `close`, `cancel`: `common`) has an empty group and reads them through its own `s`.
        else if (!keys.length && !found.reads.some((r) => r.binding.id === b.id && !r.discarded)) err(at, `${where(b.line)}: useStrings("${b.id}") but defaultStrings["${b.id}"] is empty or missing and the file reads no word (add it to packages/core/src/strings/${doc.category}.ts)`);
        if (b.instance?.trim() !== "strings") err(at, `${where(b.line)}: useStrings("${b.id}", ${b.instance?.trim() ?? ""}) must pass the \`strings\` prop as its second argument`);
      }
      const members = propsOf(raw, pascal(doc.id));
      if (members && !members.includes("strings")) err(at, `reads useStrings but ${pascal(doc.id)}Props has no \`strings?: Partial<KitStrings["${doc.id}"]>\``);
      for (const text of stringsFindings(doc.id, kit, rel, found, dictionary, platformOnly)) problem(doc.id, text);
    }
  }
  const ids = new Set(components.map((d) => d.id));
  for (const id of todo) if (!ids.has(id)) err(GENERIC_AT, `stringsTodo: "${id}" is not a component`);
  for (const [id, list] of problems) {
    if (todo.includes(id)) for (const text of list) warn(`strings ${id}`, `(stringsTodo) ${text}`);
    else {
      for (const text of list) err(`strings ${id}`, text);
      err(`strings ${id}`, `breaks the rules above: fix them, or (for a sweep that has not reached it) list "${id}" in stringsTodo in reports/generic.json`);
    }
  }
  for (const id of todo) if (ids.has(id) && !problems.has(id)) err(GENERIC_AT, `stringsTodo lists "${id}", which now reads its strings as the rules say: remove it`);
}

/* ---------- renders ---------- */

const osVariants = (platform: Platform): { os: OS; osVersion?: number }[] =>
  PLATFORM_OS[platform].flatMap((os) => {
    const v = OS_VERSIONS[os];
    return v ? [{ os, osVersion: v.glass }, { os, osVersion: v.before }] : [{ os }];
  });

/** Draws one tree on the server and returns its HTML, failing on any warning React or React Native Web prints. */
function draw(at: string, node: ReactNode): string | null {
  const logged: string[] = [];
  const keep = { error: console.error, warn: console.warn };
  console.error = (...a: unknown[]) => logged.push(a.map(String).join(" "));
  console.warn = (...a: unknown[]) => logged.push(a.map(String).join(" "));
  let html: string | null = null;
  let thrown: Error | null = null;
  try {
    renders++;
    html = renderToString(node);
  } catch (e) {
    thrown = e as Error;
  } finally {
    console.error = keep.error;
    console.warn = keep.warn;
  }
  // Reported only now: while rendering, console.error is the capture.
  if (thrown) err(at, thrown.message.split("\n")[0]!);
  // An icon name neither lucide package can draw leaves an empty box; name it.
  for (const m of new Set((html ?? "").match(/data-af-missing-icon="[^"]+"|data-testid="missing-icon:[^"]+"/g) ?? [])) err(at, `no icon ${m.replace(/^.*?="(missing-icon:)?/, "").replace(/"$/, "")}`);
  for (const l of new Set(logged)) err(at, l.split("\n")[0]!.slice(0, 220));
  return html;
}

const MISSING = /([A-Z][A-Za-z0-9]*) is not in @antfabric\/ui-(react-native|react) yet/g;

function waitingFor(html: string): boolean {
  let any = false;
  for (const m of html.matchAll(MISSING)) {
    any = true;
    const key = `${m[1]} (${m[2]})`;
    waiting.set(key, (waiting.get(key) ?? 0) + 1);
  }
  return any;
}

/**
 * Draws every example, variant, state, edge case and flow frame of one component on one platform, on every OS, in `theme`, and records
 * them under `<id>/<platform>` (`antfabric`, the empty theme, whose keys are held by parity) or `<id>/<platform>#<theme>`. The second theme's
 * pass only draws and records: the docs, the press targets and the warnings about the docs were all said by the first.
 */
function checkRenders(doc: ComponentDocs, platform: Platform, theme: Theme = antfabric, suffix = "") {
  const defaults = defaultsFor(usedIds(doc), platform);
  const cases = casesFor(doc, platform);
  const first = suffix === "";
  const shot = (at: string, os: { os: OS; osVersion?: number }, body: ReactNode, state?: InteractionState) => {
    const html = draw(`${doc.id} ${platform}/${os.os}${os.osVersion ? `@${os.osVersion}` : ""} ${at}${first ? "" : ` (${theme.name})`}`, createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform, ...os, scheme: "light", theme, state, children: body })));
    record(`${doc.id}/${platform}${suffix}`, html, platform, "light", { os: os.os, theme });
    return html;
  };
  const thing = (props?: Record<string, unknown>) => createElement(Thing, { id: doc.id, platform, props });
  for (const os of osVariants(platform)) {
    shot("rest", os, thing());
    cases.examples.forEach((e) => (!e.os || e.os === os.os) && shot(`example "${e.name}"`, e.os ? { os: e.os, osVersion: os.osVersion } : os, thing(e.props), e.state));
    for (const m of cases.matrix) for (const c of m.cases) shot(`${m.prop}=${c.name}`, os, thing(c.props));
    for (const s of cases.states) shot(`state ${s}`, os, thing(), s);
    for (const e of cases.edge) if (e.example && (!e.example.platforms || e.example.platforms.includes(platform))) shot(`edge "${e.title}"`, os, thing(e.example.props), e.example.state);
    for (const flow of doc.flows ?? []) {
      if (!flow.platforms.includes(platform)) continue;
      const shown = flow.steps.map((s, i) => ({ s, i })).filter(({ s }) => !s.platforms || s.platforms.includes(platform));
      (flow.replay ?? []).forEach((fr, n) => {
        if (fr.platforms && !fr.platforms.includes(platform)) return;
        const at = `flow "${flow.id}" frame ${n}`;
        if (first && !shown.some(({ i }) => i === fr.step)) warn(`${doc.id} ${platform}`, `${at}: its step is not shown on this platform`);
        const html = shot(at, os, fr.scene ? createElement(SceneNode, { scene: fr.scene, platform }) : thing(fr.props));
        if (!first || html === null || fr.press === undefined || waitingFor(html)) return;
        const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
        if (!pressTarget(document.body, fr.press)) err(`${doc.id} ${platform}/${os.os} ${at}`, `press ${JSON.stringify(fr.press)} lands on nothing (try \`pnpm frames ${doc.id} ${platform} ${os.os}\`)`);
      });
    }
  }
}

/**
 * The bare pass, `<id>/<platform>#bare`: the rest render of a component as a product gets it before it has said anything. Every other render is
 * drawn with the docs' `sample ?? default` for every prop and `ANTFABRIC_STRINGS` at the root, so the kit's own defaults, the English strings and
 * the empty lists were never hashed. Here only the `required` props are given (their `sample`, which a product must pass), the root has no `strings`,
 * and the theme is `neutral`. Drawn on every OS, the entrance at its first frame, as a component's other renders are.
 */
function checkBare(doc: ComponentDocs, platform: Platform) {
  const C = kitComponent(doc.id, platform);
  if (!C) return;
  const required = Object.fromEntries(
    Object.entries(doc.props).flatMap(([k, d]) => (d.required && d.type !== "event" && shownValue(d) !== undefined && (!d.platforms || d.platforms.includes(platform)) ? [[k, shownValue(d)] as const] : [])),
  );
  const body = createElement(C, resolveProps(required, platform));
  for (const os of osVariants(platform)) {
    const stage =
      platform === "mobile"
        ? createElement(NativeKit.ThemeProvider, { scheme: "light", os: os.os === "android" ? "android" : "ios", osVersion: os.osVersion, theme: themes.neutral, children: createElement(View, { style: { alignSelf: "stretch" }, children: body }) })
        : createElement(ReactKit.AntFabricRoot, { platform, os: os.os, osVersion: os.osVersion, scheme: "light", theme: themes.neutral, css: "theme", style: { display: "flex", flexDirection: "column" }, children: body });
    const html = draw(`${doc.id} ${platform}/${os.os}${os.osVersion ? `@${os.osVersion}` : ""} rest (bare)`, stage);
    record(`${doc.id}/${platform}#bare`, html, platform, "light", { os: os.os, theme: themes.neutral });
  }
}

/* ---------- recipes ---------- */

/** What a kit file may read with no recipe entry: the gaps that lay parts out (`space`) and how things move (`duration`, `ease`). Written here, not per recipe, so it stays small. */
const STRUCTURAL = /^(space|duration|ease)\./;
const KIT_KEYS: Record<"react" | "react-native", Set<string>> = {
  react: new Set(["web", "desktop", "browser", "mac", "windows", "linux"]),
  "react-native": new Set(["mobile", "ios", "android"]),
};

// A recipe that names a token no platform has, a variant the docs do not offer, or a part no kit draws, or a kit that still reads a
// token the recipe does not grant (a style that crept back into the component), leaves the recipe describing a component that is not
// the one drawn. The anatomy table on the component's page is only true while this passes.
let recipeScan: ReturnType<typeof scan> | undefined;
function checkRecipes(id: string, recipe: Recipe) {
  const at = `recipe ${id}`;
  const doc = registry[id];
  if (!doc) return err(at, "no component with this id in the docs");
  const leaves = tokenLeaves();
  const parts = new Set(recipe.parts);
  if (parts.size !== recipe.parts.length) err(at, "a part is listed twice");
  for (const p of Object.keys(recipe.styles)) if (!parts.has(p)) err(at, `styles name "${p}", which is not in parts`);

  const onPart = (part: string): Platform[] => (recipe.styles as Record<string, { on?: Platform[] } | undefined>)[part]?.on ?? PLATFORMS;
  const granted: Record<"react" | "react-native", Set<string>> = { react: new Set(), "react-native": new Set() };
  const exists = (path: string, platform: Platform) => {
    const leaf = leaves.get(path);
    return !!leaf && (leaf.shared !== undefined || leaf.light !== undefined || leaf[platform] !== undefined);
  };
  for (const e of recipeEntries(recipe)) {
    const where = `${e.part}${e.prop ? ` ${e.prop}=${e.value}` : ""}${e.state ? ` ${e.state}` : ""}${e.platform ? ` on ${e.platform}` : ""} ${e.key}`;
    if (!(STYLE_KEYS as readonly string[]).includes(e.key)) err(at, `${where}: "${e.key}" is not in the style vocabulary`);
    const path = tokenOf(e.style);
    if (!path) {
      if (e.style !== "transparent" && e.style !== "none") err(at, `${where}: "${e.style}" is neither a $token, "transparent" nor "none"`);
      continue;
    }
    const platforms = e.platform ? [(PLATFORMS as string[]).includes(e.platform) ? (e.platform as Platform) : platformOf(e.platform as OS)] : onPart(e.part);
    for (const p of platforms) if (!exists(path, p)) err(at, `${where}: $${path} does not exist for ${p}`);
    for (const kit of ["react", "react-native"] as const) if (!e.platform || KIT_KEYS[kit].has(e.platform)) granted[kit].add(path);
  }
  for (const ref of recipe.reads ?? []) {
    if (!leaves.has(ref.slice(1))) err(at, `reads: ${ref} does not exist`);
    for (const kit of ["react", "react-native"] as const) granted[kit].add(ref.slice(1));
  }

  // Every variant prop and value is one the docs list.
  const variantProps = new Map<string, Set<string>>();
  const seeVariants = (variants: Record<string, Record<string, unknown>> | undefined) => {
    for (const [prop, values] of Object.entries(variants ?? {})) for (const v of Object.keys(values)) (variantProps.get(prop) ?? variantProps.set(prop, new Set()).get(prop)!).add(v);
  };
  for (const part of Object.values(recipe.styles) as { variants?: Record<string, Record<string, unknown>>; platforms?: Record<string, { variants?: Record<string, Record<string, unknown>> }> }[]) {
    seeVariants(part.variants);
    for (const l of Object.values(part.platforms ?? {})) seeVariants(l.variants);
  }
  for (const [prop, values] of variantProps) {
    const d = doc.props[prop];
    if (!d) err(at, `variant prop "${prop}" is not a documented prop`);
    else {
      const options = d.type === "boolean" ? ["true", "false"] : (d.options ?? []).map(String);
      if (!options.length) err(at, `variant prop "${prop}" has no documented options to compare with`);
      for (const v of values) if (!options.includes(v)) err(at, `variant "${prop}=${v}" is not one of the documented options (${options.join(", ")})`);
    }
  }

  // Every part is drawn: on the web by a `data-af-part`, on the phone by a `testID`, in at least one render of every platform that draws it.
  for (const platform of PLATFORMS) {
    if (doc.platforms[platform].status === "not-applicable" || !kitComponent(id, platform)) continue;
    const seen = partsSeen.get(`${id}/${platform}`);
    if (!seen) continue; // the component was not rendered in this run
    for (const part of recipe.parts) {
      if (!onPart(part).includes(platform)) continue;
      if (!seen.has(platform === "mobile" ? `${id}.${part}` : part)) err(at, `part "${part}" is in no ${platform} render (${platform === "mobile" ? `testID "${id}.${part}"` : `data-af-part="${part}"`}); draw it, or add an example that shows it`);
    }
  }

  // The kit files read nothing the recipe does not grant.
  recipeScan ??= scan(repoRoot());
  for (const kit of recipeScan.kits) {
    const name = kit.kit === "packages/react" ? "react" : "react-native";
    const file = kit.files.find((f) => f.id === id);
    if (!file) continue;
    for (const path of Object.keys(file.tokenPaths)) if (!granted[name].has(path) && !STRUCTURAL.test(path)) err(file.file, `reads t.${path}, which recipe ${id} does not grant to ${name} (add it to the recipe, or it is a style that belongs there)`);
    for (const d of Object.keys(file.dynamic)) if (!STRUCTURAL.test(d.replace(/^\./, "")) && !file.dynamicReach[d]?.every((p) => granted[name].has(p) || STRUCTURAL.test(p))) err(file.file, `reads t.${d} by a computed key: the recipe cannot say what it grants`);
  }
}

// A theme's recipe overrides (`pnpm check recipes`, and `themes`): `recipeFor` lays a theme's cells over a recipe and changes nothing
// else, in every context a kit can pass; the empty theme and a recipe with no override give the recipe itself; a merged recipe keeps
// its identity; a child's cell beats its parent's; the order an override is written in changes neither the id nor the result; and
// `defineTheme` throws on every kind of bad override, naming the theme, the recipe and where. The type-level half is
// `scripts/recipe-override.types.ts` (`pnpm typecheck`).
function checkRecipeOverrides() {
  const at = "recipe overrides";
  const button = recipes.button;
  const input: ThemeInput = {
    name: "Recipe fixture",
    extends: null,
    recipes: {
      button: {
        root: {
          base: { radius: "$radius.card", font: "none" }, // one cell replaced, one removed
          variants: { variant: { primary: { bg: "$brand.hover", states: { hover: { bg: "$brand.active" } } } } }, // a variant's cell and a state inside it
          platforms: { mobile: { base: { gap: "$space.sm" } } }, // a platform entry the recipe does not have
        },
      },
    },
  };
  const fixture = defineTheme(input);
  const merged = recipeFor(fixture, button);
  if (merged === button) err(at, "recipeFor(fixture, recipes.button) is the recipe itself");

  // What the fixture should move, as the merged style says it: part → key → value, for one context.
  const expected = (part: string, ctx: RecipeContext): Partial<Record<StyleKey, StyleValue>> => {
    if (part !== "root") return {};
    const out: Partial<Record<StyleKey, StyleValue>> = { radius: "$radius.card", font: "none" };
    if (ctx.variants?.variant === "primary") {
      const hover = ctx.state?.hover && ctx.platform !== "mobile";
      out.bg = ctx.state?.pressed ? "$brand.active" : hover ? "$brand.active" : "$brand.hover"; // the recipe's own pressed comes after hover
    }
    if (ctx.platform === "mobile") out.gap = "$space.sm";
    return out;
  };
  const states: StateKey[] = ["hover", "pressed", "focus", "disabled"];
  const variantValues = [undefined, "primary", "secondary", "ghost", "soft", "ink", "danger"];
  const sizes = [undefined, "sm", "md", "lg"];
  let contexts = 0;
  for (const platform of PLATFORMS)
    for (const os of PLATFORM_OS[platform])
      for (const variant of variantValues)
        for (const size of sizes)
          for (let mask = 0; mask < 1 << states.length; mask++) {
            const ctx: RecipeContext = { platform, os, variants: { variant, size }, state: Object.fromEntries(states.map((s, i) => [s, !!(mask & (1 << i))])) };
            contexts++;
            for (const part of button.parts) {
              const was = mergeLayers(recipeLayers(button.styles[part], ctx)) as Record<string, StyleValue>;
              const now = mergeLayers(recipeLayers(merged.styles[part], ctx)) as Record<string, StyleValue>;
              const want: Record<string, StyleValue> = { ...was, ...expected(part, ctx) };
              const wrong = Object.keys({ ...now, ...want }).filter((k) => now[k] !== want[k]);
              if (wrong.length) {
                err(at, `button ${part} on ${platform}/${os} ${JSON.stringify(ctx.variants)} ${states.filter((s) => ctx.state?.[s]).join("+") || "rest"}: ${wrong.map((k) => `${k} is ${now[k]}, expected ${want[k]}`).join("; ")}`);
                return;
              }
            }
          }
  if (contexts < 1000) err(at, `only ${contexts} contexts were compared`);

  // The recipe is untouched, parts the override does not name are the recipe's own objects, and `"none"` stays a cell for the readers to drop.
  if (button.styles.root.base.radius !== "$radius.pill" || button.styles.root.base.font !== "$font.sans") err(at, "recipeFor changed recipes.button itself");
  if (merged.styles.icon !== button.styles.icon || merged.styles.shortcut !== button.styles.shortcut) err(at, "a part the override does not name is not the recipe's own object");
  if (merged.parts !== button.parts) err(at, "the merged recipe's parts are not the recipe's");

  // Identity: the same object across calls and for the same theme built twice; the recipe itself where there is nothing to lay over.
  if (recipeFor(fixture, button) !== merged) err(at, "recipeFor(fixture, recipes.button) gave a new object on a second call");
  if (recipeFor(defineTheme(input), button) !== merged) err(at, "the same theme built twice gave another merged recipe (it is cached by theme id)");
  for (const [id, r] of Object.entries(recipes as Record<string, Recipe>)) {
    if (recipeFor(antfabric, r) !== r) err(at, `recipeFor(antfabric, recipes["${id}"]) is not the recipe itself`);
    if (recipeFor(undefined, r) !== r) err(at, `recipeFor(undefined, recipes["${id}"]) is not the recipe itself`);
    if (id !== "button" && recipeFor(fixture, r) !== r) err(at, `recipeFor(fixture, recipes["${id}"]) is not the recipe itself, and the fixture has no override for it`);
  }
  if (recipeFor(fixture, merged) !== merged) err(at, "recipeFor on a merged recipe merged it again");

  // A child's cell replaces its parent's; the parent's other cells stay; recipes are part of the id.
  const child = defineTheme({ name: "Recipe child", extends: fixture, recipes: { button: { root: { base: { radius: "$radius.control" } }, icon: { base: { fg: "$fg.muted" } } } } });
  const kid = recipeFor(child, button);
  const kidRoot = kid.styles.root as { base?: Record<string, string>; variants?: Record<string, Record<string, Record<string, unknown>>> };
  if (kidRoot.base?.radius !== "$radius.control") err(at, `a child's radius is ${kidRoot.base?.radius}, not its own $radius.control`);
  if (kidRoot.base?.font !== "none" || kidRoot.variants?.variant?.primary?.bg !== "$brand.hover") err(at, "a child theme dropped its parent's recipe cells");
  if ((kid.styles.icon as { base?: Record<string, string> }).base?.fg !== "$fg.muted") err(at, "a child's own part override is missing");
  if (child.id === fixture.id) err(at, "a child with its own recipe cells has its parent's id");

  // Written in another order: the same id and the same merged order (a state the recipe lacks is added in STATE_KEYS order).
  const a = defineTheme({ name: "Order", extends: null, recipes: { button: { icon: { states: { pressed: { fg: "$fg.strong" }, hover: { fg: "$fg.body" } } } } } });
  const b = defineTheme({ name: "Order", extends: null, recipes: { button: { icon: { states: { hover: { fg: "$fg.body" }, pressed: { fg: "$fg.strong" } } } } } });
  if (a.id !== b.id) err(at, "the same overrides written in another order have another id");
  const order = (t: Theme) => Object.keys((recipeFor(t, button).styles.icon as { states?: object }).states ?? {}).join(",");
  if (order(a) !== "hover,pressed" || order(b) !== "hover,pressed") err(at, `added states merge in the order written (${order(a)} / ${order(b)}), not hover,pressed`);
  if (recipeFor(a, button) !== recipeFor(b, button)) err(at, "two themes with one id gave two merged recipes");

  // Every kind of bad override throws, naming the theme, the recipe and where.
  const throws = (what: string, recipesInput: unknown, mention: string[]) => {
    try {
      defineTheme({ name: "Bad recipes", extends: null, recipes: recipesInput as never });
      err(at, `${what} was accepted`);
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      const missing = ["Bad recipes", ...mention].filter((x) => !m.includes(x));
      if (missing.length) err(at, `${what}: the error "${m}" does not name ${missing.join(", ")}`);
    }
  };
  throws("recipes that are not an object", ["button"], ["recipes"]);
  throws("an unknown recipe id", { buton: { root: {} } }, ["buton"]);
  throws("an unknown part", { button: { label: { base: { fg: "$fg.body" } } } }, ["button.label"]);
  throws("an unknown layer", { button: { root: { on: ["web"] } } }, ["button.root.on"]);
  throws("a platforms entry inside a platform", { button: { root: { platforms: { mobile: { platforms: {} } } } } }, ["button.root.platforms.mobile.platforms"]);
  throws("an unknown variant prop", { button: { root: { variants: { tone: { brand: { bg: "$brand.default" } } } } } }, ["button.root.variants.tone"]);
  throws("an unknown variant value", { button: { root: { variants: { variant: { brand: { bg: "$brand.default" } } } } } }, ["button.root.variants.variant.brand"]);
  throws("a variant prop on a recipe with none", { "tab-bar": { bar: { variants: { size: { sm: {} } } } } }, ["tab-bar.bar.variants.size"]);
  throws("an unknown state", { button: { root: { states: { hovered: { bg: "$brand.hover" } } } } }, ["button.root.states.hovered"]);
  throws("three states joined", { button: { root: { states: { "hover+pressed+focus": { bg: "$brand.hover" } } } } }, ["button.root.states.hover+pressed+focus"]);
  throws("an unknown state inside a variant", { button: { root: { variants: { variant: { primary: { states: { active: { bg: "$brand.hover" } } } } } } } }, ["button.root.variants.variant.primary.states.active"]);
  throws("an unknown platform key", { button: { root: { platforms: { tablet: { base: { gap: "$space.sm" } } } } } }, ["button.root.platforms.tablet"]);
  throws("an unknown style key", { button: { root: { base: { colour: "$fg.body" } } } }, ["button.root.base.colour"]);
  throws("a literal value", { button: { root: { base: { bg: "#ffffff" } } } }, ["button.root.base.bg", "#ffffff"]);
  throws("a token the tokens do not have", { button: { root: { base: { radius: "$radius.nope" } } } }, ["button.root.base.radius", "$radius.nope"]);
  throws("a number", { button: { root: { platforms: { android: { base: { radius: 4 } } } } } }, ["button.root.platforms.android.base.radius"]);
  throws("a style that is not an object", { button: { root: { base: "$radius.card" } } }, ["button.root.base"]);
  // A parent built elsewhere (not by defineTheme here) is checked too, named as the parent.
  try {
    defineTheme({ name: "Child of a stranger", extends: { id: "stranger-00000000", name: "Stranger", sets: { shared: {}, schemes: {}, profiles: {}, os: {} }, recipes: { button: { label: {} } } as never } });
    err(at, "a parent's bad recipe override was accepted");
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    if (!m.includes("Stranger") || !m.includes("button.label")) err(at, `a parent's bad recipe override: the error "${m}" does not name the parent and where`);
  }
}

/* ---------- snapshot ---------- */

// Each key ("button/web", "screen/inbox") hashes the HTML of every render of that component on that platform, in drawing
// order, with each `var(--af-…)` replaced by the value the browser would give it there (every render here is the light scheme).
// The same renders are drawn in two themes: `antfabric` under the plain key and `neutral` under the same key with `#neutral` after it
// ("button/web#neutral", "screen/inbox#neutral", "button/web@mounted#neutral"). The variables resolve for the theme a render was drawn in
// and on its OS (`tokenValues(platform, scheme, os, theme)`; for `antfabric`, the empty theme, as they always did, without the OS, which
// is what keeps those keys exactly as parity has them). A theme's `data-af-theme-id` and its `<style>` sheet are left out of the hash: the
// values they declare are in it. `neutral` is a second pass, after every `antfabric` render, because React Native Web's one class
// sheet grows as it draws and its order feeds `canonical`: a neutral render between two antfabric ones could move the second's hash.
// Hashing the variable's name instead would miss a value that changed and flag a name that was only renamed.
// Tokens are the only `--af-` variables the kit sets; any other is left as it is and named at the end of the run.
// React's server `useId` counts from zero in every `renderToString`, and nothing drawn reads a clock or a random
// number, so the same code gives the same hash. The chart libraries are the exception: they number the ids they write (clip paths, gradients)
// from a counter that runs on across renders, so `foldIds` (./ids.ts) renames those, in order of appearance, before hashing.
const SNAPSHOT_FILE = fileURLToPath(new URL("../../../reports/renders.snapshot.json", import.meta.url));
type SnapshotEntry = { hash: string; renders: number };
const drawn = new Map<string, { hash: ReturnType<typeof createHash>; renders: number; failed: boolean }>();
/**
 * `<id>/<platform>@mounted`: the markup of each data component after it was mounted in a DOM and re-rendered through its states, examples
 * and edge cases, hashed by `rerender.tsx` with the same `normalise` as a server render. A chart library draws its geometry in effects,
 * so the server render of a chart is only its frame; these keys are the chart. `mountedRan` is false under `--no-rerender`, when nothing
 * says what they would be and the saved ones are left alone.
 */
let mounted: Record<string, SnapshotEntry> = {};
let mountedRan = false;
const isMounted = (key: string) => /@mounted(?:#[\w-]+)?$/.test(key);

/** Per "id/platform": the recipe parts its renders drew (`data-af-part="root"` on the web, `data-testid="button.root"` on the phone). */
const partsSeen = new Map<string, Set<string>>();


// A refactor that was meant to change no pixels but changed one is invisible to the render check, which only looks for warnings.
function record(key: string, html: string | null, platform: Platform, scheme: "light" | "dark", drawnIn?: DrawnIn) {
  const entry = drawn.get(key) ?? { hash: createHash("sha256"), renders: 0, failed: false };
  drawn.set(key, entry);
  if (html === null) entry.failed = true;
  else {
    const seen = partsSeen.get(key) ?? new Set<string>();
    partsSeen.set(key, seen);
    for (const m of html.matchAll(PART_MARKS)) seen.add(m[0].slice(1).replace(/^data-af-part="|^data-testid="|"$/g, ""));
    entry.hash.update(`${normalise(html, platform, scheme, drawnIn)}\n\u0000\n`);
  }
  entry.renders++;
}

// A hash object can be finished once, so the run's hashes are read through here.
let snapshotNow: Record<string, SnapshotEntry> | null = null;
function readNow() {
  if (!snapshotNow) {
    snapshotNow = {};
    for (const [key, e] of drawn) if (!e.failed) snapshotNow[key] = { hash: e.hash.digest("hex").slice(0, 16), renders: e.renders };
    Object.assign(snapshotNow, mounted);
  }
  return snapshotNow;
}
const readSaved = (): Record<string, SnapshotEntry> => (existsSync(SNAPSHOT_FILE) ? JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8")) : {});

function checkSnapshot() {
  const now = readNow();
  const saved = readSaved();
  const at = "snapshot";
  const full = !only.length;

  if (updateSnapshot) {
    if (errors || rerenderFailed) return console.error(`  ✗ ${at}: not written while the run has errors${rerenderFailed ? " (the re-render pass failed too)" : ""}; fix them, then run --update-snapshot again`);
    // A full run that did not mount anything (--no-rerender) leaves the mounted keys as they were.
    const kept = full && !mountedRan ? Object.fromEntries(Object.entries(saved).filter(([k]) => isMounted(k))) : {};
    const next = { ...(full ? kept : saved), ...now };
    // A key the parity commit had moves only when its id is accepted in reports/parity.json.
    const base = parityBase();
    if (base) {
      const refused = Object.keys(base.was)
        .filter((k) => !parityAccepted(k) && (!next[k] || next[k]!.hash !== base.was[k]!.hash || next[k]!.renders !== base.was[k]!.renders))
        .sort();
      if (refused.length) {
        for (const k of refused) err(at, `${k} is held to ${paritySha()}: not rewritten${next[k] ? ` (${base.was[k]!.hash} → ${next[k]!.hash})` : " (nothing draws it)"}`);
        const ids = [...new Set(refused.map((k) => parityIdOf(k)))].sort();
        return console.error(`  If the change is meant, add ${ids.map((id) => `"${id}"`).join(", ")} with a one-line reason to "accepted" in reports/parity.json, then run --update-snapshot again.`);
      }
    }
    const keys = Object.keys(next).sort();
    writeFileSync(SNAPSHOT_FILE, `{\n${keys.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(next[k])}`).join(",\n")}\n}\n`);
    console.log(`snapshot: wrote ${keys.length} entries to reports/renders.snapshot.json`);
    return;
  }

  const changed = Object.keys(now).filter((k) => saved[k] && (saved[k]!.hash !== now[k]!.hash || saved[k]!.renders !== now[k]!.renders)).sort();
  for (const k of changed) {
    const was = saved[k]!;
    err(at, `${k} drew differently (${was.hash} → ${now[k]!.hash}${was.renders !== now[k]!.renders ? `, ${was.renders} → ${now[k]!.renders} renders` : ""})`);
  }
  const added = Object.keys(now).filter((k) => !saved[k]).sort();
  if (added.length) warn(at, `no snapshot yet for ${added.join(", ")}: run \`pnpm check${only.length ? ` ${only.join(" ")}` : ""} --update-snapshot\``);
  if (full) for (const k of Object.keys(saved).filter((k) => !drawn.has(k) && !(isMounted(k) && (!mountedRan || k in mounted))).sort()) err(at, `${k} is in the snapshot but nothing draws it any more: run \`pnpm check --update-snapshot\``);
  if (changed.length) console.error(`  If the change is meant, accept it with \`pnpm check${only.length ? ` ${only.join(" ")}` : ""} --update-snapshot\` and commit reports/renders.snapshot.json.`);
}

/* ---------- parity ---------- */

// reports/parity.json: the commit whose look must survive (every render that exists there keeps its hash), the theme that look is now, and the
// ids whose change was accepted on purpose, each with its reason.
const PARITY = JSON.parse(readFileSync(fileURLToPath(new URL("../../../reports/parity.json", import.meta.url)), "utf8")) as { commit: string; theme: string; accepted: Record<string, string> };
const paritySha = () => PARITY.commit.slice(0, 7);

/** The component or screen id a snapshot key belongs to (`button/web`, `button/web@mounted`, `button/web#neutral`, `button/web#bare`, `screen/desktop-channel`, `screen/desktop-channel#neutral`, `brand/web`). */
function parityIdOf(key: string) {
  return key.startsWith("screen/") ? key.slice(7).replace(/#[\w-]+$/, "") : key.slice(0, key.lastIndexOf("/"));
}
/** An entry of `accepted` is a component or screen id (every key of it may move) or one snapshot key (`bar-chart/mobile@mounted`: that key alone). */
const parityAccepted = (key: string) => key in PARITY.accepted || parityIdOf(key) in PARITY.accepted;
/** An entry `token:<path>` accepts that token leaf of `packages/core/tokens.json`, or every leaf under it when it names a group (`token:chart`). */
const TOKEN_ACCEPT = "token:";
const tokenAccepted = (path: string) => Object.keys(PARITY.accepted).some((k) => k.startsWith(TOKEN_ACCEPT) && (path === k.slice(TOKEN_ACCEPT.length) || path.startsWith(`${k.slice(TOKEN_ACCEPT.length)}.`)));

const git = (...args: string[]) => spawnSync("git", args, { cwd: repoRoot(), encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const canon = (v: unknown): string => JSON.stringify(v, (_, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));

/** The snapshot file as the parity commit had it, or null (with a warning) when git or the commit is missing. */
function parityBase() {
  if (git("cat-file", "-e", `${PARITY.commit}^{commit}`).status !== 0) return warn("parity", `commit ${paritySha()} is not in this checkout (no git, or a shallow clone): the snapshot and token comparisons are skipped`), null;
  const then = git("show", `${PARITY.commit}:reports/renders.snapshot.json`);
  if (then.status !== 0) return warn("parity", `reports/renders.snapshot.json is not in ${paritySha()}: the snapshot comparison is skipped`), null;
  return { was: JSON.parse(then.stdout) as Record<string, SnapshotEntry> };
}

/** Every `{ $value }` leaf of a tokens.json, by dotted path, with its value and its modes. */
function dtcgLeaves(node: object, out = new Map<string, { value: unknown; modes: unknown }>(), path = "") {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$") || !v || typeof v !== "object") continue;
    const p = path ? `${path}.${k}` : k;
    if ("$value" in v) out.set(p, { value: v.$value, modes: (v as { $extensions?: Record<string, { modes?: unknown }> }).$extensions?.[EXTENSION]?.modes });
    else dtcgLeaves(v, out, p);
  }
  return out;
}

function checkParity() {
  const at = "parity";
  const saved = readSaved();

  const base = parityBase();
  if (!base) return;

  // An accepted entry names a render the commit had (an id, or one of its keys), and says why. Prefer the key when only one moved.
  const ids = new Set(Object.keys(base.was).map(parityIdOf));
  for (const [id, why] of Object.entries(PARITY.accepted)) {
    if (!id.startsWith(TOKEN_ACCEPT) && !ids.has(id) && !(id in base.was)) warn("reports/parity.json", `accepted: ${id} is neither an id nor a snapshot key the commit ${paritySha()} had`);
    if (!why.trim()) err("reports/parity.json", `accepted: ${id} has no reason`);
  }

  // The saved snapshot file against the commit's: every key the commit had keeps its hash and render count; keys added since are free.
  for (const k of Object.keys(base.was).sort()) {
    if (parityAccepted(k)) continue;
    const was = base.was[k]!;
    const is = saved[k];
    if (!is) err("reports/renders.snapshot.json", `${k}: ${paritySha()} had it and it is gone (accept ${parityIdOf(k)} in reports/parity.json if that is meant)`);
    else if (is.hash !== was.hash || is.renders !== was.renders) err("reports/renders.snapshot.json", `${k}: drew differently from ${paritySha()} (${was.hash} → ${is.hash}${is.renders !== was.renders ? `, ${was.renders} → ${is.renders} renders` : ""}); accept ${parityIdOf(k)} in reports/parity.json if that is meant`);
  }

  // Tokens: every leaf the commit had keeps its value and its modes; a leaf that is new is fine.
  const tokensFile = "packages/core/tokens.json";
  const oldTokens = git("show", `${PARITY.commit}:${tokensFile}`);
  if (oldTokens.status !== 0) return warn(at, `${tokensFile} is not in ${paritySha()}: the token check is skipped`);
  const before = dtcgLeaves(JSON.parse(oldTokens.stdout));
  const after = dtcgLeaves(JSON.parse(readFileSync(join(repoRoot(), tokensFile), "utf8")));
  for (const id of Object.keys(PARITY.accepted)) {
    if (!id.startsWith(TOKEN_ACCEPT)) continue;
    const want = id.slice(TOKEN_ACCEPT.length);
    if (![...before.keys()].some((p) => p === want || p.startsWith(`${want}.`))) warn("reports/parity.json", `accepted: ${id} names no token leaf or group the commit ${paritySha()} had`);
  }
  for (const [path, was] of before) {
    if (tokenAccepted(path)) continue;
    const is = after.get(path);
    if (!is) err(tokensFile, `${path}: a token the parity commit ${paritySha()} had is gone`);
    else if (canon(is.value) !== canon(was.value)) err(tokensFile, `${path}: $value changed since ${paritySha()} (${canon(was.value)} → ${canon(is.value)}); accept token:${path} in reports/parity.json if that is meant`);
    else if (canon(is.modes) !== canon(was.modes)) err(tokensFile, `${path}: $extensions modes changed since ${paritySha()} (${canon(was.modes)} → ${canon(is.modes)})`);
  }
}

// Two copies of one helper drift apart, so a fix lands in one kit only; and a name a kit declares itself while core exports it too reads to a consumer as two different functions.
function checkHelpers() {
  const at = "helpers";
  const root = repoRoot();
  const libOf = (kit: string) => join(root, `packages/${kit}/src/lib`);
  const digests = (dir: string) => {
    const out = new Map<string, string>();
    for (const rel of readdirSync(dir, { recursive: true })) {
      const file = join(dir, String(rel));
      if (!statSync(file).isFile()) continue;
      out.set(createHash("sha256").update(readFileSync(file)).digest("hex"), String(rel));
    }
    return out;
  };
  const nativeLib = digests(libOf("react-native"));
  for (const [hash, rel] of digests(libOf("react"))) {
    const twin = nativeLib.get(hash);
    if (twin) err(`packages/react/src/lib/${rel}`, `byte-identical to packages/react-native/src/lib/${twin}: move it to packages/core`);
  }

  const shared = Core as Record<string, unknown>;
  for (const [kit, module] of [["react", ReactKit], ["react", ReactData], ["react", ReactShell], ["react", ReactChat], ["react-native", NativeKit], ["react-native", NativeData], ["react-native", NativeShell], ["react-native", NativeChat]] as const) {
    for (const [name, value] of Object.entries(module)) {
      const isComponent = typeof value === "function" || (typeof value === "object" && value !== null && "$$typeof" in value);
      if (!isComponent || !(name in shared) || shared[name] === value) continue;
      err(at, `@antfabric/ui-${kit} declares its own ${name}; core exports one under the same name (re-export it from core instead)`);
    }
  }
}

// A tenant's colours over the defaults: only the brand family moves, nothing moves without a brand, and both kits draw it.
function checkBrand() {
  const at = "themes";
  const flat = (v: unknown, path = ""): Record<string, unknown> =>
    typeof v === "object" && v !== null ? Object.assign({}, ...Object.entries(v).map(([k, x]) => flat(x, path ? `${path}.${k}` : k))) : { [path]: v };
  const moved = (a: object, b: object) => {
    const fa = flat(a);
    const fb = flat(b);
    return Object.keys({ ...fa, ...fb }).filter((k) => fa[k] !== fb[k]).sort();
  };
  // fg.onBrand is ink on AntFabric's coral (white fails 4.5:1 there), so it moves for the sample tenant's dark teal (white) and not for a light primary (ink).
  const family = [...BRAND_PATHS].sort();
  const same = (got: string[], want: string[], what: string) => {
    if (got.join() !== want.join()) err(at, `${what}: moved ${got.join(", ") || "nothing"}; expected ${want.join(", ") || "nothing"}`);
  };
  const { brand } = SAMPLE_TENANT;

  const combos = [
    ...(["light", "dark"] as const).flatMap((theme) => [
      { profile: "mobile" as const, theme, os: "ios" as const },
      { profile: "mobile" as const, theme, os: "android" as const },
      { profile: "web" as const, theme, os: undefined },
      { profile: "desktop" as const, theme, os: "mac" as const },
    ]),
  ];
  // A tenant's brand is a theme's: `defineTheme({ name, brand })`, read through `resolveTokens({ theme })` on the phone and `tokenValues` / `themeCss` on the web.
  const withBrand = (b: Partial<typeof brand>, name = "Brand check") => defineTheme({ name, extends: null, brand: b });
  for (const { profile, theme, os } of combos) {
    const where = `${profile}/${theme}${os ? `/${os}` : ""}`;
    const plain = resolveTokens(profile, theme, os ? { os } : {});
    const through = (b: Partial<typeof brand>) => resolveTokens(profile, theme, { os, theme: withBrand(b) });
    // Without a brand it is the plain profile, theme and OS: every theme leaf is the one tokens.ts holds, and an empty brand is no theme at all.
    const source = flat(tokens.themes[theme]);
    for (const [k, v] of Object.entries(flat(plain)))
      if (k in source && typeof v === "string" && typeof source[k] === "string" && v !== source[k]) err(at, `${where}: ${k} is ${v} without a brand; tokens.ts has ${String(source[k])}`);
    if (withBrand({}).id !== "" || through({}) !== plain) err(at, `${where}: an empty brand is not the plain tokens`);
    // With one, only the family moves: all of it for a primary and an accent, the accent's pair for an accent alone, the rest for a primary alone.
    const branded = through(brand);
    same(moved(plain, branded), family, `${where} primary and accent`);
    same(moved(plain, through({ accent: brand.accent })), ["accent.default", "accent.soft"], `${where} accent alone`);
    same(moved(plain, through({ primary: brand.primary })), family.filter((p) => !p.startsWith("accent.")), `${where} primary alone`);
    // Text on the brand fill: white while white reads (a dark tenant), ink on a light one.
    const onBrand = (primary: string) => (flat(through({ primary })) as Record<string, string>)["fg.onBrand"];
    if (onBrand(brand.primary!) !== "#ffffff") err(at, `${where}: fg.onBrand on ${brand.primary} is ${onBrand(brand.primary!)}, not white`);
    if (onBrand("#f2c94c") !== "#0e1828") err(at, `${where}: fg.onBrand on a light yellow brand is ${onBrand("#f2c94c")}, not ink`);
    same(moved(plain, through({ primary: "#f2c94c" })), family.filter((p) => !p.startsWith("accent.") && p !== "fg.onBrand"), `${where} light primary`);
    // A hand-picked tint wins over the derived one.
    const pick = { light: "#e6f4f1", dark: "#12302c" };
    const picked = flat(through({ primary: brand.primary, soft: pick })) as Record<string, string>;
    if (picked["brand.soft"] !== pick[theme] || picked["brand.tint"] !== pick[theme]) err(at, `${where}: a hand-picked soft tint did not replace the derived one`);
    // Memoised: the same inputs are the same object, whatever order the brand's keys are written in; a different input is a different one.
    if (resolveTokens(profile, theme, { os }) !== plain) err(at, `${where}: resolveTokens returned a new object for the same inputs`);
    if (through({ accent: brand.accent, primary: brand.primary }) !== branded) err(at, `${where}: a brand with its keys in another order is not the same object`);
    if (branded === plain || through({ primary: "#123456" }) === branded) err(at, `${where}: a different brand returned the same object`);
    if (!Object.isFrozen(plain) || !Object.isFrozen(branded)) err(at, `${where}: resolved tokens are shared, so they must be frozen`);
    // Fonts move the two families and, where the phone is drawn, its file names: nothing else, and a colour brand moves none of them.
    const fonts = (f: Partial<typeof brand>["fonts"]) => through({ fonts: f });
    const fontPaths = BRAND_FONT_PATHS.filter((p) => profile === "mobile" || !p.startsWith("font.file")).sort();
    same(moved(plain, fonts({ sans: "Inter", display: "Inter" })), [...fontPaths], `${where} fonts`);
    const faces = flat(fonts({ sans: "Inter", display: { family: "Fraunces", files: { semibold: "Fraunces-Medium" } } })) as Record<string, string>;
    if (faces["font.sans"] !== "Inter") err(at, `${where}: a branded font.sans is ${faces["font.sans"]}, not the family alone`);
    if (profile === "mobile" && (faces["font.fileSansSemibold"] !== "Inter-SemiBold" || faces["font.fileDisplaySemibold"] !== "Fraunces-Medium" || faces["font.fileDisplayBold"] !== "Fraunces-Bold"))
      err(at, `${where}: the phone's files are ${faces["font.fileSansSemibold"]}, ${faces["font.fileDisplaySemibold"]}, ${faces["font.fileDisplayBold"]}; expected <family>-<Weight> unless a file is named`);
  }
  const stack = (flat(resolveTokens("mobile", "light", { os: "ios", web: true, theme: withBrand({ fonts: { sans: "Inter" } }) })) as Record<string, string>)["font.sans"];
  if (stack !== `"Inter", ${tokens.shared.font.sans}`) err(at, `React Native Web's branded font.sans is ${stack}; expected "Inter" in front of the kit's stack`);
  if (resolveTokens("mobile", "light", { os: "ios" }) === resolveTokens("mobile", "light", { os: "android" })) err(at, "iOS and Android share one object");
  if (resolveTokens("mobile", "light", { os: "ios", web: true }) === resolveTokens("mobile", "light", { os: "ios" })) err(at, "web and native font stacks share one object");

  for (const bad of ["", "Inter; color: red", '"Inter"']) {
    try {
      withBrand({ fonts: { sans: bad } });
      err(at, `font family "${bad}" was accepted`);
    } catch {
      /* expected */
    }
  }
  for (const bad of ["teal", "#12345", "#gggggg", ""]) {
    try {
      withBrand({ primary: bad });
      err(at, `primary "${bad}" was accepted`);
    } catch {
      /* expected */
    }
  }

  // The web reads the same values as variables (`tokenValues`, which the sheet's cascade is checked against below): a brand's theme moves exactly
  // the variables `brandValues` has, to its values, and each is a real token variable.
  for (const scheme of ["light", "dark"] as const) {
    const values = brandValues(brand, scheme);
    const known = tokenValues("web", scheme);
    const vars = tokenValues("web", scheme, undefined, withBrand(brand));
    const changed = Object.keys(vars).filter((n) => vars[n] !== known[n]).sort();
    same(changed, Object.keys(values).map(cssVarName).sort(), `the web's variables under a brand theme (${scheme})`);
    for (const [path, v] of Object.entries(values)) {
      const name = cssVarName(path);
      if (!(name in known)) err(at, `brandValues sets ${path}, whose variable ${name} is not a token variable`);
      if (vars[name] !== v) err(at, `the web's ${name} under a brand theme (${scheme}) is ${vars[name]}, brandValues has ${v}`);
    }
  }
  if (brandValues(brand, "light")["brand.soft"] === brandValues(brand, "dark")["brand.soft"]) err(at, "the dark soft tint is the light one");
  if (themeCss(withBrand({})) !== "") err(at, "an empty brand has a sheet");
  const fontTheme = withBrand({ fonts: { sans: "Inter", display: "Inter" } });
  const fontVars = tokenValues("web", "light", undefined, fontTheme);
  same(Object.keys(fontVars).filter((n) => fontVars[n] !== tokenValues("web", "light")[n]).sort(), ["--af-font-display", "--af-font-sans"], "the web's variables under a fonts-only brand theme");

  // Both kits draw the sample tenant's theme (`extends: antfabric`: the brand over AntFabric's own look) on every OS, in both schemes; the web root
  // carries `data-af-theme-id` and the theme's sheet holds the brand.
  const tenantTheme = defineTheme({ name: SAMPLE_TENANT.name, extends: antfabric, brand });
  const ids = BRAND_SAMPLE.map((s) => s.id);
  for (const platform of ["mobile", "web"] as const) {
    for (const scheme of ["light", "dark"] as const) {
      const defaults = defaultsFor(ids, platform);
      for (const os of osVariants(platform)) {
        const body = BRAND_SAMPLE.map((s) => createElement(Thing, { key: s.id, id: s.id, platform, props: s.props }));
        const html = draw(`brand ${platform}/${os.os}${os.osVersion ? `@${os.osVersion}` : ""} ${scheme}`, createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform, ...os, scheme, theme: tenantTheme, children: body })));
        record(`brand/${platform}`, html, platform, scheme, { os: os.os, theme: tenantTheme });
        if (html === null) continue;
        if (waitingFor(html)) continue;
        if (platform === "web" && !html.includes(`data-af-theme-id="${tenantTheme.id}"`)) err(at, `web/${scheme}: the root does not carry data-af-theme-id="${tenantTheme.id}"`);
        if (platform === "web" && !html.includes(`--af-brand-default:${brand.primary}`)) err(at, `web/${scheme}: the drawn markup does not carry the theme's sheet with --af-brand-default`);
        // React Native Web writes a hex colour into a class as `rgba(15,118,110,1.00)`: `canonical` reads it back.
        const rgb = [1, 3, 5].map((i) => parseInt(brand.primary!.slice(i, i + 2), 16)).join(",");
        if (platform === "mobile" && !canonical(html).includes(`rgba(${rgb},`)) err(at, `mobile/${scheme}: nothing drawn uses the brand colour ${brand.primary}`);
      }
    }
  }
}

// Themes over the base: AntFabric is the empty theme, a theme's leaf lands where the precedence says on every profile, scheme and OS,
// through all three readers (the web's values, the web's sheet as a browser cascades it, the phone's resolved tokens).
function checkThemes() {
  const at = "themes";
  const flat = (v: unknown, path = ""): Record<string, unknown> =>
    typeof v === "object" && v !== null ? Object.assign({}, ...Object.entries(v).map(([k, x]) => flat(x, path ? `${path}.${k}` : k))) : { [path]: v };
  const schemes: Scheme[] = ["light", "dark"];
  const contexts = PLATFORMS.flatMap((platform) => schemes.flatMap((scheme) => [undefined, ...PLATFORM_OS[platform]].map((os) => ({ platform, scheme, os }))));
  const where = (c: { platform: Platform; scheme: Scheme; os?: OS }) => `${c.platform}/${c.scheme}/${c.os ?? "-"}`;
  const diff = (got: Record<string, unknown>, want: Record<string, unknown>) =>
    Object.keys({ ...got, ...want })
      .filter((k) => got[k] !== want[k])
      .sort()
      .map((k) => `${k} is ${String(got[k])}, expected ${String(want[k])}`);
  const throws = (what: string, fn: () => unknown, mention: string[]) => {
    try {
      fn();
      err(at, `${what} was accepted`);
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      const missing = mention.filter((x) => !m.includes(x));
      if (missing.length) err(at, `${what}: the error "${m}" does not name ${missing.join(", ")}`);
    }
  };

  // The browser's answer for one element: every rule of the sheet whose selector matches its attributes, the most specific and
  // then the last winning each variable, `var(--af-p-…)` replaced by the primitive's value on the same element.
  const cascade = (css: string, attrs: Record<string, string>) => {
    const won = new Map<string, { spec: number; value: string }>();
    for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const spec = Math.max(
        -1,
        ...selectors!.split(",").map((sel) => {
          const parts = [...sel.trim().matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)];
          if (parts.map((m) => m[0]).join("") !== sel.trim()) throw new Error(`cascade: cannot read the selector ${sel}`);
          return parts.every(([, k, v]) => k! in attrs && (v === undefined || attrs[k!] === v)) ? parts.length : -1;
        }),
      );
      if (spec < 0) continue;
      for (const decl of body!.split(";")) {
        const i = decl.indexOf(":");
        const name = decl.slice(0, i);
        if (spec >= (won.get(name)?.spec ?? -1)) won.set(name, { spec, value: decl.slice(i + 1) });
      }
    }
    const out: Record<string, string> = {};
    for (const [name, { value }] of won) if (!name.startsWith("--af-p-")) out[name] = value.replace(/var\((--af-p-[\w-]+)\)/g, (_, p: string) => won.get(p)?.value ?? `var(${p})`);
    return out;
  };
  const attrsOf = (c: { platform: Platform; scheme?: Scheme; os?: OS }, id?: string): Record<string, string> => ({
    "data-af-platform": c.platform,
    ...(c.scheme ? { "data-af-theme": c.scheme } : {}),
    ...(c.os ? { "data-af-os": c.os } : {}),
    ...(id ? { "data-af-theme-id": id } : {}),
  });
  const base = tokensCss();

  // AntFabric is the empty theme: no id, no sheet, and resolving with it is resolving without one (the same frozen object).
  if (antfabric.id !== "") err(at, `the antfabric preset's id is "${antfabric.id}", not ""`);
  if (themeCss(antfabric) !== "") err(at, "themeCss(antfabric) is not empty");
  if (defineTheme({ name: "Anything", extends: null }).id !== "") err(at, "a theme with no overrides and no recipes has an id");
  // `extends` left out is `themes.neutral`; `extends: null` is the schema (`tokens.ts`); `themes.antfabric` is the schema's own look and stays the empty theme.
  {
    const left = defineTheme({ name: "Left out", brand: SAMPLE_TENANT.brand });
    const named = defineTheme({ name: "Left out", extends: themes.neutral, brand: SAMPLE_TENANT.brand });
    const schema = defineTheme({ name: "Left out", extends: null, brand: SAMPLE_TENANT.brand });
    const bare = defineTheme({ name: "Schema", extends: null });
    if (left.id !== named.id || left === named || left.id === schema.id) err(at, `a theme with no extends has id ${left.id}; extends neutral gives ${named.id} and extends null ${schema.id}`);
    if (defineTheme({ name: "Anything" }).id === "" || defineTheme({ name: "Anything" }).id !== defineTheme({ name: "Anything", extends: themes.neutral }).id) err(at, "a bare theme with no extends is not the same as one extending neutral (it carries neutral's sets and recipes, so it has an id)");
    if (defineTheme({ name: "Left out", extends: antfabric, brand: SAMPLE_TENANT.brand }).id !== schema.id) err(at, "a theme extending antfabric is not the one that starts from the schema (antfabric is the empty theme)");
    if (bare.id !== "" || themeCss(bare) !== "") err(at, "a theme that extends null and has nothing else has an id or a sheet");
    if (left.recipes.button === undefined) err(at, "a theme with no extends has none of neutral's recipes");
    if (schema.recipes.button !== undefined) err(at, "a theme that extends null has recipes it did not write");
    for (const c of contexts) {
      const o = { ...(c.os ? { os: c.os } : {}), web: true };
      if (resolveTokens(c.platform, c.scheme, { ...o, theme: left }) !== resolveTokens(c.platform, c.scheme, { ...o, theme: named })) err(at, `${where(c)}: resolveTokens with no extends is not the object it gives with extends: neutral`);
      const lines = diff(tokenValues(c.platform, c.scheme, c.os, left), tokenValues(c.platform, c.scheme, c.os, named));
      if (lines.length) err(at, `${where(c)}: tokenValues with no extends moved ${lines.slice(0, 3).join("; ")} from extends: neutral`);
      // `extends: null` with nothing else is the schema: the object resolveTokens gives with no theme, and its values.
      if (resolveTokens(c.platform, c.scheme, { ...o, theme: bare }) !== resolveTokens(c.platform, c.scheme, o)) err(at, `${where(c)}: extends: null is not what resolveTokens gives for the schema`);
      const moved = diff(tokenValues(c.platform, c.scheme, c.os, bare), tokenValues(c.platform, c.scheme, c.os));
      if (moved.length) err(at, `${where(c)}: tokenValues with extends: null moved ${moved.slice(0, 3).join("; ")} from the schema`);
    }
  }
  for (const c of contexts) {
    for (const web of [false, true]) {
      const opts = { ...(c.os ? { os: c.os } : {}), ...(web ? { web } : {}) };
      if (resolveTokens(c.platform, c.scheme, { ...opts, theme: antfabric }) !== resolveTokens(c.platform, c.scheme, opts)) err(at, `${where(c)}${web ? " web" : ""}: resolveTokens with antfabric is not the object it gives without a theme`);
    }
    const lines = diff(tokenValues(c.platform, c.scheme, c.os, antfabric), tokenValues(c.platform, c.scheme, c.os));
    if (lines.length) err(at, `${where(c)}: tokenValues with antfabric moved ${lines.slice(0, 3).join("; ")}`);
    // The cascade itself, against the base alone, so a mismatch below is the theme's and not the reader's.
    const plain = diff(cascade(base, attrsOf(c)), tokenValues(c.platform, c.scheme, c.os));
    if (plain.length) err(at, `${where(c)}: the base sheet cascades to ${plain.slice(0, 3).join("; ")}`);
  }

  // The shipped presets: each one's sheet, cascaded for every element the kit draws (and one with no data-af-theme, which is light),
  // is what `tokenValues` gives, and `resolveTokens` on the web path gives the same leaves, so a preset cannot drift between kits.
  for (const [presetName, preset] of Object.entries(themes))
    for (const c of contexts)
      for (const scheme of c.scheme === "light" ? [c.scheme, undefined] : [c.scheme]) {
        const want = tokenValues(c.platform, c.scheme, c.os, preset);
        const sheet = diff(cascade(`${base}\n${themeCss(preset)}`, attrsOf({ ...c, scheme }, preset.id)), want);
        if (sheet.length) err(at, `${where(c)}${scheme ? "" : " (no data-af-theme)"}: the base sheet and themeCss(${presetName}) cascade to ${sheet.slice(0, 4).join("; ")}`);
        if (!scheme) continue;
        const native = flat(resolveTokens(c.platform, c.scheme, { ...(c.os ? { os: c.os } : {}), web: true, theme: preset }));
        const drift = Object.entries(native).flatMap(([path, v]) => {
          const name = cssVarName(path);
          const css = want[name];
          return css === undefined || typeof v !== "string" || v === css ? [] : [`${name} is ${v} in resolveTokens, ${css} in the sheet`];
        });
        if (drift.length) err(at, `${where(c)}: resolveTokens(${presetName}) and tokenValues differ: ${drift.slice(0, 3).join("; ")}`);
      }

  // The fixture: one leaf per set, a brand and fonts, chosen so the precedence shows (the phone's own radius.card and Android's
  // switch must survive the theme's shared and mobile leaves), and a primitive the base sheet does not declare.
  const spare = Object.keys(primitiveMeta).find((p) => p.startsWith("raw.") && typeof primitiveAt(p) === "string" && !referencedPrimitives().includes(p));
  const fixtureInput: ThemeInput = {
    name: "Check fixture",
    extends: null,
    brand: { ...SAMPLE_TENANT.brand, fonts: { display: { family: "Fraunces", files: { semibold: "Fraunces-Medium", bold: "" } } } },
    fonts: { sans: "Inter", mono: "JetBrains Mono" },
    tokens: {
      shared: { radius: { card: 4, ...(spare ? { control: `{primitives.${spare}}` } : {}) } },
      schemes: { light: { surface: { page: "#fafafa" } }, dark: { fg: { body: "#f4f4f5" } } },
      profiles: { mobile: { control: { hMd: 48 }, switch: { trackW: 40 } } },
      os: { android: { switch: { thumbSize: 22 } } },
    },
    recipes: { button: { root: { base: { radius: "$radius.pill" } } } },
  };
  const fixture = defineTheme(fixtureInput);
  const brand = fixtureInput.brand!;
  const files: Record<string, string> = {
    "font.fileSansRegular": "Inter-Regular",
    "font.fileSansMedium": "Inter-Medium",
    "font.fileSansSemibold": "Inter-SemiBold",
    "font.fileSansBold": "Inter-Bold",
    "font.fileSansExtrabold": "Inter-ExtraBold",
    "font.fileDisplayRegular": "Fraunces-Regular",
    "font.fileDisplayMedium": "Fraunces-Medium",
    "font.fileDisplaySemibold": "Fraunces-Medium",
    "font.fileDisplayBold": "",
    "font.fileDisplayExtrabold": "Fraunces-ExtraBold",
  };
  /** What the fixture moves on one element, by dotted path, as a pixel count (`px`) or text. */
  const moves = (c: { platform: Platform; scheme: Scheme; os?: OS }, stack: boolean): Record<string, string | { px: number }> => {
    const out: Record<string, string | { px: number }> = {};
    for (const [path, v] of Object.entries(brandValues(brand, c.scheme))) if (!path.startsWith("font.")) out[path] = v!;
    if (c.platform !== "mobile") out["radius.card"] = { px: 4 }; // the phone's profile has its own radius.card, which beats a shared leaf
    if (spare) out["radius.control"] = { px: parseFloat(String(primitiveValue(spare))) };
    out[c.scheme === "light" ? "surface.page" : "fg.body"] = c.scheme === "light" ? "#fafafa" : "#f4f4f5";
    out["font.sans"] = stack ? `"Inter", ${tokens.shared.font.sans}` : "Inter";
    out["font.display"] = stack ? `"Fraunces", ${tokens.shared.font.display}` : "Fraunces";
    out["font.mono"] = stack ? `"JetBrains Mono", ${tokens.shared.font.mono}` : "JetBrains Mono";
    if (c.platform === "mobile") {
      Object.assign(out, files);
      out["control.hMd"] = { px: 48 };
      if (c.os !== "android") out["switch.trackW"] = { px: 40 }; // Android's own switch beats the theme's mobile leaf
      if (c.os === "android") out["switch.thumbSize"] = { px: 22 };
    }
    return out;
  };

  for (const c of contexts) {
    // The web's values.
    const values = { ...tokenValues(c.platform, c.scheme, c.os) };
    for (const [path, v] of Object.entries(moves(c, true))) values[cssVarName(path)] = typeof v === "string" ? v : `${v.px}px`;
    const lines = diff(tokenValues(c.platform, c.scheme, c.os, fixture), values);
    if (lines.length) err(at, `${where(c)}: tokenValues with the fixture: ${lines.slice(0, 4).join("; ")}`);
    // The web's sheet, cascaded for this element (and for one with no data-af-theme, which is light), is the web's values.
    for (const scheme of c.scheme === "light" ? [c.scheme, undefined] : [c.scheme]) {
      const sheet = diff(cascade(`${base}\n${themeCss(fixture)}`, attrsOf({ ...c, scheme }, fixture.id)), tokenValues(c.platform, c.scheme, c.os, fixture));
      if (sheet.length) err(at, `${where(c)}${scheme ? "" : " (no data-af-theme)"}: the base sheet and themeCss(fixture) cascade to ${sheet.slice(0, 4).join("; ")}`);
    }
    // The phone's tokens, natively and through React Native Web.
    for (const web of c.platform === "mobile" && c.os ? [false, true] : [true]) {
      const opts = { ...(c.os ? { os: c.os } : {}), ...(web ? { web } : {}) };
      const want = flat(resolveTokens(c.platform, c.scheme, opts));
      for (const [path, v] of Object.entries(moves(c, web))) want[path] = typeof v === "string" ? v : v.px;
      const got = resolveTokens(c.platform, c.scheme, { ...opts, theme: fixture });
      const wrong = diff(flat(got), want);
      if (wrong.length) err(at, `${where(c)}${web ? " web" : ""}: resolveTokens with the fixture: ${wrong.slice(0, 4).join("; ")}`);
      if (!Object.isFrozen(got)) err(at, `${where(c)}: resolved themed tokens are not frozen`);
      if (resolveTokens(c.platform, c.scheme, { ...opts, theme: defineTheme(fixtureInput) }) !== got) err(at, `${where(c)}: the same theme built twice did not give the same object (memoised by id)`);
    }
  }

  // The sheet: every selector scoped by the theme's id, never :root, and the leaves it should hold.
  const sheet = themeCss(fixture);
  const scope = `[data-af-theme-id="${fixture.id}"]`;
  for (const [, selectors] of sheet.matchAll(/([^{}]+)\{/g))
    for (const sel of selectors!.split(",")) if (!sel.trim().endsWith(scope) || sel.includes(":root")) err(at, `themeCss(fixture) has a selector not scoped by ${scope}: ${sel.trim()}`);
  for (const decl of ["--af-radius-card:4px", "--af-control-h-md:48px", "--af-switch-thumb-size:22px", `--af-brand-default:${brand.primary}`, "--af-font-file-display-bold:;", "--af-switch-track-w:36px"])
    if (!sheet.includes(decl)) err(at, `themeCss(fixture) does not hold ${decl}`);
  if (spare && !sheet.includes(`${primitiveVar(spare)}:${String(primitiveValue(spare))}`)) err(at, `themeCss(fixture) does not declare ${primitiveVar(spare)}, which its radius.control reads and the base sheet does not declare`);
  if (themeCss(defineTheme({ name: "Recipes only", extends: null, recipes: fixtureInput.recipes })) !== "") err(at, "a theme with recipes and no tokens has a sheet");

  // The web root: a theme writes `data-af-theme-id` on the root and its sheet next to the kit's, the empty one neither, and
  // a provider with no theme of its own inside a themed root draws in the root's.
  {
    const root = defineTheme({ name: "fixture-root", extends: null, tokens: { shared: { radius: { control: 6 } } } });
    // React hoists same-precedence styles into one `<style data-href="antfabric-ui <id>">`, their texts one after the other (the kit's first).
    const styles = (html: string) => [...html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/g)].map((m) => ({ attrs: m[1]!, text: m[2]! }));
    const seen: string[] = [];
    const Probe = () => {
      seen.push(ReactKit.usePlatform().theme.id);
      return null;
    };
    const themed = renderToString(createElement(ReactKit.AntFabricRoot, { theme: root, children: createElement(ReactKit.AntFabricProvider, { children: createElement(Probe) }) }));
    if (!themed.includes(`data-af-theme-id="${root.id}"`)) err(at, `AntFabricRoot with a theme does not write data-af-theme-id="${root.id}"`);
    if (!/<div data-af-platform="web"[^>]*data-af-theme-id=/.test(themed)) err(at, "AntFabricRoot with a theme does not write data-af-theme-id on its root element");
    const sheet = styles(themed);
    if (!sheet.some((x) => x.text.endsWith(themeCss(root)) && x.attrs.includes(`antfabric-ui-${root.id}`))) err(at, "AntFabricRoot with a theme does not render a <style> whose text is themeCss(theme)");
    if (!sheet.some((x) => x.text.startsWith(tokensCss()))) err(at, "AntFabricRoot with a theme does not put the kit's own sheet first");
    if (seen[0] !== root.id) err(at, "a provider inside a themed root did not take the root's theme from context");
    const bare = renderToString(createElement(ReactKit.AntFabricRoot, { theme: antfabric, children: "x" }));
    if (bare.includes("data-af-theme-id") || styles(bare).length !== 1 || styles(bare)[0]!.attrs.includes("antfabric-ui-")) err(at, "AntFabricRoot with antfabric writes a data-af-theme-id or a theme sheet");
    // With no theme the kit draws `neutral`: the same markup as passing it, and a provider with no root at all reads it from the context default.
    const plain = renderToString(createElement(ReactKit.AntFabricRoot, { children: "x" }));
    if (plain !== renderToString(createElement(ReactKit.AntFabricRoot, { theme: themes.neutral, children: "x" }))) err(at, "AntFabricRoot with no theme is not the same markup as with neutral");
    if (!plain.includes(`data-af-theme-id="${themes.neutral.id}"`)) err(at, "AntFabricRoot with no theme does not write neutral's data-af-theme-id");
    const loose = [] as string[];
    const Loose = () => (loose.push(ReactKit.usePlatform().theme.id), null);
    // A provider with no theme and no root above it draws `neutral` on a page whose sheet and attributes are not neutral's (a host that ships only
    // `tokensCss() + kitCss`), so in development it says so, once; with a theme given, under a root, or under a provider that was given one, it is quiet.
    // `css={false}` with no theme is the same host.
    const said: string[] = [];
    const warn = console.warn;
    console.warn = (...a: unknown[]) => void said.push(a.map(String).join(" "));
    try {
      renderToString(createElement(Loose));
      renderToString(createElement(ReactKit.AntFabricProvider, { children: createElement(Loose) }));
      renderToString(createElement(ReactKit.AntFabricProvider, { children: createElement(Loose) }));
      const [first, second] = [said.filter((m) => m.includes("AntFabricProvider has no theme")).length, said.length];
      renderToString(createElement(ReactKit.AntFabricProvider, { theme: root, children: createElement(ReactKit.AntFabricProvider, { children: createElement(Loose) }) }));
      renderToString(createElement(ReactKit.AntFabricRoot, { children: createElement(ReactKit.AntFabricProvider, { children: createElement(Loose) }) }));
      if (first !== 1) err(at, `an AntFabricProvider with no theme and no root warned ${first} times over two renders, not once`);
      if (said.length !== second) err(at, "an AntFabricProvider under a root, or under a provider given a theme, warned of having no theme");
      renderToString(createElement(ReactKit.AntFabricRoot, { theme: root, css: false, children: "x" }));
      if (said.length !== second) err(at, "AntFabricRoot css={false} with a theme warned");
      renderToString(createElement(ReactKit.AntFabricRoot, { css: false, children: "x" }));
      renderToString(createElement(ReactKit.AntFabricRoot, { css: false, children: "x" }));
      if (said.length !== second + 1 || !said[said.length - 1]!.includes("css={false}")) err(at, `AntFabricRoot css={false} with no theme did not warn exactly once (${said.length - second} warnings)`);
    } finally {
      console.warn = warn;
    }
    if (loose.slice(0, 3).some((id) => id !== themes.neutral.id) || loose.length < 3) err(at, `usePlatform().theme with no root, and under a provider with no theme, is ${loose.join(", ")}, not neutral's ${themes.neutral.id}`);
    // A theme is a theme object: "dark" is a scheme, and passed as a theme it would draw light AntFabric with a sheet named after `undefined`.
    for (const [what, make] of [
      ["AntFabricRoot", () => createElement(ReactKit.AntFabricRoot, { theme: "dark" as never, children: "x" })],
      ["AntFabricProvider", () => createElement(ReactKit.AntFabricProvider, { theme: "dark" as never, children: "x" })],
      ["ThemeProvider", () => createElement(NativeKit.ThemeProvider, { theme: "dark" as never, children: null })],
      ["rootAttrs", () => createElement(() => (ReactKit.rootAttrs({ theme: "dark" as never }), null))],
    ] as const) {
      let message = "";
      try {
        renderToString(make());
      } catch (e) {
        message = (e as Error).message;
      }
      if (!message.includes("theme takes a theme from defineTheme; light or dark is `scheme`")) err(at, `${what} with theme="dark" ${message ? `threw "${message}"` : "did not throw"}, not "theme takes a theme from defineTheme; light or dark is \`scheme\`"`);
    }
    // `rootAttrs` is the root's attributes, for a host without the root: each one is on the root element, and the empty theme has no theme id.
    const attrs = ReactKit.rootAttrs({ platform: "desktop", os: "mac", scheme: "dark", theme: root });
    const desktop = renderToString(createElement(ReactKit.AntFabricRoot, { platform: "desktop", os: "mac", scheme: "dark", theme: root, children: "x" }));
    for (const [k, v] of Object.entries(attrs)) if (!desktop.includes(`${k}="${v}"`)) err(at, `rootAttrs() has ${k}="${v}", which AntFabricRoot does not write`);
    if (Object.keys(attrs).length !== 4 || attrs["data-af-theme-id"] !== root.id) err(at, `rootAttrs() is ${JSON.stringify(attrs)}, not platform, scheme, os and the theme id`);
    if ("data-af-theme-id" in ReactKit.rootAttrs({ theme: antfabric }) || "data-af-os" in ReactKit.rootAttrs({ theme: antfabric })) err(at, "rootAttrs() for the empty theme and no os writes a data-af-theme-id or a data-af-os");
  }

  // Ids: the same input is the same id, written in any key order; a value changes it; a parent's sets carry over.
  const reorder = (v: unknown): unknown =>
    v && typeof v === "object" && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype ? Object.fromEntries(Object.entries(v).reverse().map(([k, x]) => [k, reorder(x)])) : v;
  if (!/^check-fixture-[0-9a-f]{8}$/.test(fixture.id)) err(at, `the fixture's id is "${fixture.id}", not check-fixture-<8 hex digits>`);
  if (defineTheme(reorder(fixtureInput) as ThemeInput).id !== fixture.id) err(at, "the fixture written in another key order has another id");
  if (defineTheme({ ...fixtureInput, tokens: { ...fixtureInput.tokens, shared: { radius: { card: 5 } } } }).id === fixture.id) err(at, "a changed value kept the fixture's id");
  if (defineTheme({ ...fixtureInput, recipes: { button: { root: { base: { radius: "$radius.card" } } } } }).id === fixture.id) err(at, "a changed recipe kept the fixture's id");
  // Pinned, so a change to the hash or the canonical form shows: an id must not move between runs, machines or releases.
  const pinned = defineTheme({ name: "Pinned", extends: null, tokens: { shared: { radius: { card: 4 } }, schemes: { dark: { surface: { page: "#101010" } } } } }).id;
  if (pinned !== "pinned-036d6c24") err(at, `the pinned theme's id is ${pinned}, not pinned-036d6c24: the id of every theme a product has shipped would move`);
  const child = defineTheme({ name: "Child", extends: fixture, brand: { primary: "#f2c94c" }, tokens: { profiles: { mobile: { control: { hMd: 50 } } } } });
  const grandchild = defineTheme({ name: "Grandchild", extends: child, brand: { primary: "#0f766e" } });
  const kid = flat(resolveTokens("mobile", "light", { os: "ios", theme: child })) as Record<string, unknown>;
  if (kid["control.hMd"] !== 50 || kid["radius.control"] !== flat(resolveTokens("mobile", "light", { os: "ios", theme: fixture }))["radius.control"] || kid["font.sans"] !== "Inter")
    err(at, `a child theme did not keep its parent's leaves under its own: control.hMd ${String(kid["control.hMd"])}, font.sans ${String(kid["font.sans"])}`);
  if (kid["fg.onBrand"] !== "#0e1828") err(at, `a light brand primary in a child theme gives fg.onBrand ${String(kid["fg.onBrand"])}, not ink`);
  if ((flat(resolveTokens("mobile", "light", { os: "ios", theme: grandchild })) as Record<string, unknown>)["fg.onBrand"] !== "#ffffff") err(at, "a dark brand primary over a parent's light one kept the parent's ink fg.onBrand");
  // A brand.default the theme writes as hsl() is read too, and one nothing can read takes white, never the schema's ink.
  for (const [fill, want] of [["hsl(243 47% 20%)", "#ffffff"], ["hsl(50 95% 60%)", "#0e1828"], ["hsl(0.5turn 80% 25%)", "#ffffff"], ["oklch(0.3 0.1 260)", "#ffffff"]] as const) {
    const got = defineTheme({ name: "Fill", extends: null, tokens: { schemes: { light: { brand: { default: fill } } } } }).sets.schemes.light?.["fg.onBrand"];
    if (got !== want) err(at, `brand.default ${fill} gives fg.onBrand ${String(got)}, not ${want}`);
  }
  if ((child.recipes as Record<string, unknown>).button === undefined) err(at, "a child theme dropped its parent's recipes");

  // Frozen all the way down, without freezing what the caller passed.
  const frozen = (v: unknown): boolean => typeof v !== "object" || v === null || (Object.isFrozen(v) && Object.values(v).every(frozen));
  if (!frozen(fixture)) err(at, "the fixture theme is not frozen all the way down");
  if (Object.isFrozen(fixtureInput.recipes) || Object.isFrozen(fixtureInput.tokens)) err(at, "defineTheme froze its input");

  // A path the schema does not have throws, naming the theme, the layer and the path.
  throws("a misspelt shared path", () => defineTheme({ name: "Typo", extends: null, tokens: { shared: { radius: { crad: 4 } } as never } }), ["Typo", "tokens.shared", "radius.crad"]);
  throws("a shared path in an OS set", () => defineTheme({ name: "Typo", extends: null, tokens: { os: { android: { font: { sans: "Inter" } } } as never } }), ["Typo", "tokens.os.android", "font.sans"]);
  throws("a group given a value", () => defineTheme({ name: "Typo", extends: null, tokens: { shared: { radius: 4 } as never } }), ["Typo", "tokens.shared", "radius"]);
  throws("a web path on the phone's font files", () => defineTheme({ name: "Typo", extends: null, tokens: { profiles: { web: { font: { fileSansRegular: "Inter" } } } as never } }), ["Typo", "tokens.profiles.web", "font.fileSansRegular"]);
  throws("a reference to no primitive", () => defineTheme({ name: "Typo", extends: null, tokens: { shared: { radius: { card: "{primitives.raw.nope}" } } } }), ["Typo", "tokens.shared", "radius.card"]);
  throws("a scheme that does not exist", () => defineTheme({ name: "Typo", extends: null, tokens: { schemes: { dim: {} } as never } }), ["Typo", "dim"]);
  throws("a value that breaks out of its declaration", () => defineTheme({ name: "Typo", extends: null, tokens: { shared: { radius: { card: "4px;}body{display:none" } } } }), ["Typo", "radius.card"]);
  throws("a bad brand colour", () => defineTheme({ name: "Typo", extends: null, brand: { primary: "teal" } }), ["Typo", "brand"]);
  throws("a bad mono family", () => defineTheme({ name: "Typo", extends: null, fonts: { mono: "Mono; color: red" } }), ["Typo", "fonts"]);
  // A hand-picked brand colour is a colour: hex, rgb() or hsl(), never a url or a word, naming the theme and the field.
  for (const field of ["soft", "softHover", "onSoft", "tint"] as const) {
    throws(`a brand ${field} that is a url`, () => defineTheme({ name: "Typo", extends: null, brand: { [field]: { light: "url(https://x)", dark: "#000" } } }), ["Typo", "brand", `brand.${field}.light`]);
    throws(`a brand ${field} that is a word`, () => defineTheme({ name: "Typo", extends: null, brand: { [field]: { light: "#000", dark: "teal" } } }), ["Typo", "brand", `brand.${field}.dark`]);
  }
  for (const ok of ["#fde8e8", "#fde8e880", "rgba(159,166,255,.14)", "rgb(0 0 0 / 0.1)", "hsl(210 40% 96%)", "hsla(210, 40%, 96%, .5)"])
    defineTheme({ name: "Fine", extends: null, brand: { soft: { light: ok, dark: ok }, softHover: { light: ok, dark: ok }, onSoft: { light: ok, dark: ok }, tint: { light: ok, dark: ok } } });
  // A length the phone reads as a number, given in a unit React Native has none for, throws when the phone's tokens are resolved (the web keeps it).
  for (const [what, value] of [
    ["a rem", "0.5rem"],
    ["an em", "1em"],
    ["a percentage", "10%"],
    ["a calc", "calc(4px + 2px)"],
  ] as const) {
    const remTheme = defineTheme({ name: "Rem", extends: null, tokens: { shared: { radius: { card: value } }, profiles: { mobile: { radius: { card: value } } } } });
    throws(`${what} on the phone`, () => resolveTokens("mobile", "light", { os: "ios", theme: remTheme }), ["Rem", "radius.card", value]);
    resolveTokens("web", "light", { theme: remTheme });
  }
  if ((flat(resolveTokens("mobile", "light", { os: "ios", theme: defineTheme({ name: "Round", extends: null, tokens: { profiles: { mobile: { radius: { card: "50%" } } } } }) })) as Record<string, unknown>)["radius.card"] !== 9999)
    err(at, "a theme's 50% radius on the phone is not the circle radius 9999");
  // A value that a stylesheet reads past its declaration: an escaped brace swallows every later block, a comment or an unclosed quote,
  // parenthesis or bracket does the same. Each throws naming the theme, the layer, the path and the character.
  for (const [what, value, ch] of [
    ["a trailing backslash", "red\\", "backslash"],
    ["a comment opener", "red /*", "/*"],
    ["a comment closer", "red */ blue", "*/"],
    ["a lone double quote", 'red "', '"'],
    ["a lone single quote", "red '", "'"],
    ["an unclosed parenthesis", "rgb(0 0 0", "("],
    ["an unclosed bracket", "a[b", "["],
    ["a stray closing parenthesis", "red)", ")"],
    ["a newline", "red\nblue", "U+000A"],
    ["a carriage return", "red\rblue", "U+000D"],
    ["a tab", "red\tblue", "U+0009"],
    ["a delete character", "red\u007f", "U+007F"],
    ["a url", "url(https://x.test/a.png)", "url("],
    ["an uppercase url with a space", "URL (https://x.test/a.png)", "url("],
    ["an image-set", "image-set(\"https://x.test/a.png\" 1x)", "image-set("],
    ["a -webkit-image-set", "-webkit-image-set(\"https://x.test/a.png\" 1x)", "-webkit-image-set("],
    ["an image", "image(\"https://x.test/a.png\")", "image("],
    ["a src", "src(\"https://x.test/a.png\")", "src("],
    ["an element", "element(#logo)", "element("],
    ["a cross-fade", "cross-fade(red, blue)", "cross-fade("],
    ["an at-sign", "@import", "@"],
    ["an important", "red !important", "!"],
  ] as const) {
    throws(`a value with ${what}`, () => defineTheme({ name: "Typo", extends: null, tokens: { schemes: { light: { fg: { body: value } } } } }), ["Typo", "tokens.schemes.light", "fg.body", ch]);
    throws(`a sans family with ${what}`, () => defineTheme({ name: "Typo", extends: null, fonts: { sans: `Foo${value}` } }), ["Typo", "fonts", "Foo"]);
    throws(`a mono family with ${what}`, () => defineTheme({ name: "Typo", extends: null, fonts: { mono: `Foo${value}` } }), ["Typo", "fonts", "mono"]);
    throws(`a brand family with ${what}`, () => defineTheme({ name: "Typo", extends: null, brand: { fonts: { display: `Foo${value}` } } }), ["Typo", "brand"]);
  }
  // Values the kit's own tokens hold (a font stack with quotes, a function with a slash, a shadow with commas) still pass.
  for (const ok of ['"Inter", ui-sans-serif', "rgb(0 0 0 / 0.1)", "0 1px 2px rgb(0 0 0 / 0.1), 0 0 0 1px #fff", "calc(1px + (2px * 3))"])
    defineTheme({ name: "Fine", extends: null, tokens: { schemes: { light: { fg: { body: ok } } } } });
  // Only a theme `defineTheme` built reaches a sheet, a value map or the phone's tokens: a theme parsed from JSON or built by hand
  // (here, one whose value would close its block and open another) is refused with a message that sends it back through defineTheme.
  const forged = JSON.parse(JSON.stringify({ ...fixture, id: "evil-1", sets: { shared: {}, schemes: { light: { "fg.body": "red}body{display:none" } }, profiles: {}, os: {} } })) as Theme;
  for (const [what, call] of [
    ["themeCss", () => themeCss(forged)],
    ["tokenValues", () => tokenValues("web", "light", undefined, forged)],
    ["resolveTokens", () => resolveTokens("web", "light", { theme: forged })],
    ["themeCss of a copy of a built theme", () => themeCss({ ...fixture })],
    ["themeCss of an empty id by hand", () => themeCss({ id: "", name: "x", sets: { shared: {}, schemes: {}, profiles: {}, os: {} }, recipes: {} })],
  ] as const)
    throws(`${what} given a theme defineTheme did not build`, call, ["defineTheme"]);

  // The phone's provider takes a theme: what a component reads through `useTheme()` is the theme's tokens, the default is
  // `neutral` (the very object `resolveTokens` gives, with or without a provider), a nested provider takes its parent's theme, and a
  // theme built inline on every render keeps the one `t`.
  const web = RN.OS === "web";
  const probe = (theme: Theme | undefined, nested?: boolean) => {
    let seen: ReturnType<typeof NativeKit.useTheme> | undefined;
    const Probe = () => ((seen = NativeKit.useTheme()), null);
    const inner = createElement(NativeKit.ThemeProvider, { os: "ios", theme: nested ? undefined : theme, children: createElement(Probe) });
    renderToString(nested ? createElement(NativeKit.ThemeProvider, { os: "ios", theme, children: inner }) : inner);
    return seen!;
  };
  const phoneFixture = defineTheme({ name: "fixture-phone", extends: null, tokens: { profiles: { mobile: { control: { hMd: 48 } } } } });
  const themed = probe(phoneFixture);
  if (themed.t.control.hMd !== 48) err(at, `ThemeProvider with a theme: t.control.hMd is ${themed.t.control.hMd}, not 48`);
  if (themed.theme.id !== phoneFixture.id) err(at, `ThemeProvider with a theme: useTheme().theme.id is "${themed.theme.id}", not "${phoneFixture.id}"`);
  if (probe(phoneFixture, true).theme.id !== phoneFixture.id) err(at, "a nested ThemeProvider with no theme did not take its parent's");
  const plain = probe(undefined);
  const neutralT = resolveTokens("mobile", "light", { os: "ios", web, theme: themes.neutral });
  if (plain.theme.id !== themes.neutral.id || plain.t !== neutralT) err(at, "ThemeProvider with no theme is not neutral: t is not the object resolveTokens gives with it");
  if (probe(themes.neutral).t !== plain.t) err(at, "ThemeProvider with neutral did not give the same t as with no theme");
  const antfabricProbe = probe(antfabric);
  if (antfabricProbe.theme.id !== "" || antfabricProbe.t !== resolveTokens("mobile", "light", { os: "ios", web }) || antfabricProbe.t === plain.t) err(at, "ThemeProvider with antfabric is not the object resolveTokens gives without a theme, or is neutral's");
  let bare: ReturnType<typeof NativeKit.useTheme> | undefined;
  renderToString(createElement(() => ((bare = NativeKit.useTheme()), null)));
  // (By value: the memo holds 64 objects and has long dropped the one the context default was built from.)
  if (bare?.theme.id !== themes.neutral.id || diff(flat(bare.t), flat(resolveTokens("mobile", "light", { os: bare.os, web, theme: themes.neutral }))).length) err(at, "useTheme() with no provider at all is not neutral's");
  if (probe(defineTheme({ name: "fixture-phone", extends: null, tokens: { profiles: { mobile: { control: { hMd: 48 } } } } })).t !== themed.t) err(at, "a theme built twice gave the provider two different t");

  // `font()` reads its file names from the `t` it is given: `""` is the system font, so no family and the weight by number.
  const system = defineTheme({
    name: "fixture-system-font",
    extends: null,
    tokens: { profiles: { mobile: { font: { fileSansRegular: "", fileSansMedium: "", fileSansSemibold: "", fileSansBold: "", fileSansExtrabold: "", fileDisplayRegular: "", fileDisplayMedium: "", fileDisplaySemibold: "", fileDisplayBold: "", fileDisplayExtrabold: "" } } } },
  });
  const systemT = probe(system).t;
  const asIos = (fn: () => void) => {
    const was = RN.OS;
    (RN as { OS: string }).OS = "ios";
    try {
      fn();
    } finally {
      (RN as { OS: string }).OS = was;
    }
  };
  asIos(() => {
    for (const [weight, n] of [["regular", 400], ["semibold", 600], ["bold", 700]] as const)
      for (const face of ["sans", "display"] as const) {
        const f = NativeKit.font(weight, face, systemT);
        if ("fontFamily" in f || f.fontWeight !== n) err(at, `font("${weight}", "${face}") with a system-font theme is ${JSON.stringify(f)}, not no family and fontWeight ${n}`);
      }
    const kit = NativeKit.font("semibold", "sans", antfabricProbe.t);
    if (kit.fontFamily !== "Figtree-SemiBold" || "fontWeight" in kit) err(at, `font("semibold") with the antfabric theme is ${JSON.stringify(kit)}, not Figtree-SemiBold`);
    const geist = NativeKit.font("semibold", "sans", plain.t);
    if (geist.fontFamily !== "Geist-SemiBold" || "fontWeight" in geist) err(at, `font("semibold") with no theme is ${JSON.stringify(geist)}, not Geist-SemiBold (neutral's)`);
  });
}

/* ---------- run ---------- */

if (!only.length || only.includes("tokens")) checkTokenMap();
if (!only.length || only.includes("tokens") || only.includes("primitives")) checkPrimitives();
if (!only.length || only.includes("tokens")) checkTokensJson();
if (!only.length || only.includes("tokens") || only.includes("palette")) checkPalette();
if (!only.length || only.includes("tokens")) checkContrast();
if (!only.length || only.includes("chart")) checkChart();

// A token the Foundations page cannot place (no section, or two) fails the site build, which `check` does not run.
if (!only.length || only.includes("tokens")) {
  try {
    const rows = rowCount();
    if (rows !== TOKENS.size) err("foundations", `the page draws ${rows} token rows; tokens.ts has ${TOKENS.size}`);
  } catch (e) {
    err("foundations", e instanceof Error ? e.message : String(e));
  }
}
if (!only.length || only.includes("agent")) checkAgent();
if (!only.length || only.includes("architecture")) checkArchitecture();
if (!only.length || only.includes("literals")) checkLiterals();
if (!only.length || only.includes("helpers")) checkHelpers();
// `brand` is the section's old name, kept so `pnpm check brand` still runs it.
if (!only.length || only.includes("themes") || only.includes("brand")) {
  checkBrand();
  checkThemes();
}
if (!only.length || only.includes("code")) {
  checkImports();
  checkIconRegistry();
}
if (!only.length || only.includes("code") || only.includes("conventions")) checkConventions();
if (!only.length || only.includes("code") || only.includes("generic")) {
  checkStyles();
  checkStylesProof();
  checkPartStyle();
  timed("styles probe", checkStylesProbe);
}
if (!only.length || only.includes("strings")) timed("strings", checkStrings);
if (!only.length || only.includes("defaults")) timed("defaults", checkDefaults);

const ported: Record<"react" | "react-native", number> = { react: 0, "react-native": 0 };
const recipeById = recipes as Record<string, Recipe>;
for (const doc of components) {
  if (only.length && !parityRun && !only.includes(doc.id) && !(only.includes("recipes") && recipeById[doc.id])) continue;
  checkDocs(doc);
  if (kitComponent(doc.id, "web")) ported.react++;
  if (kitComponent(doc.id, "mobile")) ported["react-native"]++;
  for (const platform of PLATFORMS) {
    if (doc.platforms[platform].status === "not-applicable") continue;
    if (!kitComponent(doc.id, platform)) continue;
    if (platform !== "desktop") checkCode(doc, platform);
    checkRenders(doc, platform);
  }
}
// Screens: each drawing in src/screens renders on every OS of its platform, without warnings.
// Components draw an entrance at its first frame (no reduced motion: what a browser with no preference paints first); screens draw it finished
// (reduced motion on). That split is how every key parity holds was taken, and each `#neutral` key is drawn as its own key is.
let drawnScreens = 0;
setReducedMotion(true);
for (const s of screens) {
  if (only.length && !parityRun && !only.includes(s.id) && !only.includes("screens")) continue;
  for (const k of ["id", "name", "description", "platform", "frame"] as const) if (!s[k]) err(`screen ${s.id}`, `missing "${k}"`);
  const file = new URL(`../src/screens/${s.id}.tsx`, import.meta.url);
  if (!existsSync(file)) continue;
  drawnScreens++;
  const Screen = ((await import(file.href)) as { default: () => ReactNode }).default;
  for (const os of osVariants(s.platform)) {
    const html = draw(`screen ${s.id} ${os.os}${os.osVersion ? `@${os.osVersion}` : ""}`, createElement(Stage, { platform: s.platform, ...os, scheme: "light", theme: antfabric, children: createElement(Screen) }));
    record(`screen/${s.id}`, html, s.platform, "light");
    if (html) waitingFor(html);
  }
}
for (const [id, recipe] of Object.entries(recipeById)) if (!only.length || only.includes(id) || only.includes("recipes")) checkRecipes(id, recipe);
if (!only.length || only.includes("recipes") || only.includes("themes") || only.includes("button")) checkRecipeOverrides();
// The same renders again under `neutral`, after every `antfabric` one: the kits draw `neutral` when no theme is given, and a product that extends
// it must not meet a component that only ever drew in AntFabric's look. React Native Web's class sheet is global and its order feeds `canonical`,
// so these go after all the keys parity holds, never between them.
{
  const before = renders;
  const NEUTRAL = themes.neutral;
  const suffix = `#${NEUTRAL.name}`;
  setReducedMotion(false);
  for (const doc of components) {
    if (only.length && !parityRun && !only.includes(doc.id) && !(only.includes("recipes") && recipeById[doc.id])) continue;
    for (const platform of PLATFORMS) {
      if (doc.platforms[platform].status === "not-applicable") continue;
      if (!kitComponent(doc.id, platform)) continue;
      checkRenders(doc, platform, NEUTRAL, suffix);
    }
  }
  setReducedMotion(true);
  for (const s of screens) {
    if (only.length && !parityRun && !only.includes(s.id) && !only.includes("screens")) continue;
    const file = new URL(`../src/screens/${s.id}.tsx`, import.meta.url);
    if (!existsSync(file)) continue;
    const Screen = ((await import(file.href)) as { default: () => ReactNode }).default;
    for (const os of osVariants(s.platform)) {
      const html = draw(`screen ${s.id} ${os.os}${os.osVersion ? `@${os.osVersion}` : ""} (${NEUTRAL.name})`, createElement(Stage, { platform: s.platform, ...os, scheme: "light", theme: NEUTRAL, children: createElement(Screen) }));
      record(`screen/${s.id}${suffix}`, html, s.platform, "light", { os: os.os, theme: NEUTRAL });
    }
  }
  neutralRenders = renders - before;
  renders = before;
}
// And once more, bare (`checkBare`): the kit's defaults, the English strings and `neutral`, after every key above for the same reason.
{
  const before = renders;
  setReducedMotion(false);
  timed("bare pass", () => {
    for (const doc of components) {
      if (only.length && !parityRun && !only.includes(doc.id) && !(only.includes("recipes") && recipeById[doc.id])) continue;
      for (const platform of PLATFORMS) {
        if (doc.platforms[platform].status === "not-applicable") continue;
        if (!kitComponent(doc.id, platform)) continue;
        checkBare(doc, platform);
      }
    }
  });
  bareRenders = renders - before;
  renders = before;
}
// After every render a snapshot key holds, so its own drawings change neither a hash nor the count.
if (!only.length || only.includes("docs")) checkDocsMechanics();
// The second pass needs a DOM, which would change how React Native Web renders here: its own process. It runs before the snapshot is read
// because it hashes the mounted markup of the data components (`@mounted` keys) into a file; its own output is shown after the summary.
const skipRerender = process.argv.includes("--no-rerender");
const mountedFile = join(tmpdir(), `antfabric-mounted-${process.pid}.json`);
const second = skipRerender
  ? { status: 0, stdout: "", stderr: "" }
  : spawnSync(process.execPath, [...process.execArgv, fileURLToPath(new URL("./rerender.tsx", import.meta.url)), ...only], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, AF_MOUNTED_OUT: mountedFile } });
const rerenderFailed = !!second.status;
if (!skipRerender) {
  mountedRan = true;
  if (existsSync(mountedFile)) mounted = JSON.parse(readFileSync(mountedFile, "utf8"));
  rmSync(mountedFile, { force: true });
}
checkSnapshot();
if (!only.length || parityRun) checkParity();
if (unknownVars.size && !quiet) console.log(`snapshot: left as they are, not tokens: ${[...unknownVars].sort().join(", ")}`);

const scope = only.length && !parityRun ? only.length : components.length;
console.log(`\n${scope} component${scope === 1 ? "" : "s"} · React ${ported.react} · React Native ${ported["react-native"]} · ${drawnScreens} of ${screens.length} screens · ${renders} renders (and ${neutralRenders} again under neutral, ${bareRenders} bare)`);
if (waiting.size) console.log(`waiting on: ${[...waiting.keys()].sort().join(", ")}`);
console.log(errors ? `✗ ${errors} error(s), ${warnings} warning(s)` : `✓ passed${warnings ? `, ${warnings} warning(s)` : ""}`);

process.stderr.write(second.stderr ?? "");
process.stdout.write(second.stdout ?? "");
process.exit(errors || second.status ? 1 : 0);
