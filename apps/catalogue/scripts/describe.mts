/**
 * `pnpm describe`: what the library says about a component or a token group, in one command, so an
 * agent (or a person) does not open six files to learn one component. Read-only.
 *
 *   pnpm describe                  every component, by category
 *   pnpm describe <id>             one component: props, parts, recipe, a11y, examples, states, edge cases, matrix, source, flows, files
 *   pnpm describe tokens           the token groups with counts
 *   pnpm describe tokens <group>   one group: each path, variable, value per mode, description, reference
 *   --json                         the same data as JSON, on any of the above
 *
 * It reads the sources the catalogue reads (`@antfabric-ui/docs` for components, `recipes` and the token
 * tree and `descriptions` from `@antfabric-ui/core`) and holds no data of its own.
 */

import { existsSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { cssVarName, descriptions, isReference, recipeEntries, recipes, tokenSource, tokens, type Recipe, type RecipeEntry, type TokenNote } from "@antfabric-ui/core";
import { categories, components, registry } from "@antfabric-ui/docs";
import type { ComponentDocs, PropDoc } from "@antfabric-ui/docs";
import { sourceFile } from "./sources";
import { tokenLeaves } from "./token-leaves";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const rel = (p: string) => relative(root, p);
const argv = process.argv.slice(2);
const json = argv.includes("--json");
const args = argv.filter((a) => !a.startsWith("--"));

const out = (data: unknown, text: () => string) => console.log(json ? JSON.stringify(data, null, 2) : text());
const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

/** Words wrapped to a width, each following line indented. */
function wrap(words: string[], indent: string, width = 110): string {
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if (line && indent.length + line.length + 1 + w.length > width) {
      lines.push(line);
      line = w;
    } else line = line ? `${line} ${w}` : w;
  }
  if (line) lines.push(line);
  return lines.map((l) => indent + l).join("\n");
}
const prose = (s: string, indent: string) => wrap(s.split(/\s+/), indent);

/* ---------- components ---------- */

const show = (v: unknown): string => (typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v) ?? "undefined");

function files(doc: ComponentDocs) {
  const docs = `${root}packages/docs/src/components/${doc.category}/${doc.id}.ts`;
  const recipe = `${root}packages/core/src/recipes/${doc.category}/${doc.id}.ts`;
  const react = sourceFile("react", doc.id);
  const native = sourceFile("react-native", doc.id);
  const path = (p: string | null) => (p && existsSync(p) ? rel(p) : null);
  return { docs: path(docs), recipe: path(recipe), react: path(react), "react-native": path(native) };
}

/** One row of the recipe table: a part, when it applies, and the tokens it reads then. */
interface RecipeRow {
  part: string;
  when: string;
  style: Record<string, string>;
}

function whenOf(e: RecipeEntry): string {
  const own = e.prop ? `${e.prop}=${e.value}${e.state ? ` + ${e.state}` : ""}` : e.state ? `state ${e.state}` : "base";
  return e.platform ? `@${e.platform} ${own}` : own;
}

function recipeRows(recipe: Recipe): RecipeRow[] {
  const rows = new Map<string, RecipeRow>();
  for (const e of recipeEntries(recipe)) {
    const when = whenOf(e);
    const row = rows.get(`${e.part}\0${when}`) ?? { part: e.part, when, style: {} };
    row.style[e.key] = e.style;
    rows.set(`${e.part}\0${when}`, row);
  }
  return [...rows.values()];
}

function componentData(doc: ComponentDocs) {
  const recipe = (recipes as Record<string, Recipe | undefined>)[doc.id];
  const parts = recipe
    ? recipe.parts.map((name) => ({ name, on: recipe.styles[name]?.on ?? null }))
    : [];
  return {
    id: doc.id,
    name: doc.name,
    category: doc.category,
    status: doc.status,
    platforms: Object.fromEntries(Object.entries(doc.platforms).map(([p, d]) => [p, { status: d.status, ...(d.alternative ? { alternative: d.alternative } : {}) }])),
    description: doc.description,
    props: Object.entries(doc.props).map(([name, p]) => ({ name, ...p })),
    parts,
    recipe: recipe ? { rows: recipeRows(recipe), reads: recipe.reads ?? [] } : null,
    a11y: doc.a11y ?? null,
    examples: doc.examples.map((e) => e.name),
    states: doc.states ?? [],
    edgeCases: (doc.edgeCases ?? []).map((e) => ({ title: e.title, platforms: e.platforms, handling: e.handling })),
    matrix: doc.matrix ?? null,
    flows: (doc.flows ?? []).map((f) => ({ id: f.id, title: f.title, platforms: f.platforms })),
    related: doc.related ?? [],
    files: files(doc),
  };
}

type ComponentData = ReturnType<typeof componentData>;

function propLine(p: PropDoc & { name: string }): string {
  const head = `${p.name}${p.required ? "*" : ""}`;
  const bits: string[] = [p.type];
  if (p.options) bits.push(p.options.join("|"));
  if (p.type === "event") bits.push(`(${p.args ?? ""})`);
  else if (p.default !== undefined) bits.push(`default ${show(p.default)}`);
  // The catalogue draws `sample` (AntFabric's showcase) where the kit's own default is generic.
  if (p.type !== "event" && p.sample !== undefined) bits.push(`sample ${show(p.sample)}`);
  if (p.changes) bits.push(`changes ${p.changes}`);
  if (p.platforms) bits.push(`[${p.platforms.join(", ")} only]`);
  return `${head}  ${bits.join("  ")}`;
}

function componentText(d: ComponentData): string {
  const L: string[] = [];
  L.push(`${d.name}  (${d.id})`);
  // Two statuses: the component's (stable | beta | draft) and each platform's (ready | partial | planned | not-applicable).
  L.push(`${d.category} · status ${d.status}`);
  L.push(`platforms: ${Object.entries(d.platforms).map(([p, s]) => `${p} ${s.status}${"alternative" in s ? ` (use ${s.alternative})` : ""}`).join(" · ")}`);
  L.push("", prose(d.description, ""));

  L.push("", "PROPS  (* required)");
  for (const p of d.props) {
    L.push(`  ${propLine(p)}`);
    if (p.description) L.push(prose(p.description, "      "));
  }

  L.push("", "PARTS");
  L.push(d.parts.length ? `  ${d.parts.map((p) => p.name + (p.on ? ` (${p.on.join(", ")} only)` : "")).join(", ")}` : "  none: no recipe");

  L.push("", "RECIPE  (part · when · key=token; later rows win, platform rows last)");
  if (!d.recipe) L.push("  none");
  else {
    const width = Math.max(0, ...d.recipe.rows.map((r) => r.when.length));
    let part = "";
    for (const r of d.recipe.rows) {
      if (r.part !== part) L.push(`  ${(part = r.part)}`);
      const pairs = Object.entries(r.style).map(([k, v]) => `${k}=${v}`);
      const lines = wrap(pairs, "", 100 - width).split("\n");
      L.push(`    ${r.when.padEnd(width)}  ${lines[0]}`);
      for (const more of lines.slice(1)) L.push(`    ${"".padEnd(width)}  ${more}`);
    }
    if (d.recipe.reads.length) L.push(`  reads (behaviour, not style): ${d.recipe.reads.join(", ")}`);
  }

  L.push("", "A11Y");
  if (!d.a11y) L.push("  none");
  else {
    if (d.a11y.role) L.push(`  role ${d.a11y.role}${d.a11y.label ? `, label ${show(d.a11y.label)}` : ""}`);
    for (const n of d.a11y.notes ?? []) L.push(prose(`- ${n}`, "  "));
  }

  L.push("", `EXAMPLES  ${d.examples.length ? d.examples.join(", ") : "none"}`);
  L.push(`STATES    ${d.states.length ? d.states.join(", ") : "none"}`);
  if (d.matrix) L.push(`MATRIX    ${d.matrix.map((m) => (m.cases ? `${m.prop} (${m.cases.map((c) => c.name).join(", ")})` : m.values ? `${m.prop} (${m.values.join(", ")})` : m.prop)).join("; ")}`);
  else L.push("MATRIX    none");
  L.push("", "EDGE CASES  (titles; the handling is in --json and the docs file)");
  if (!d.edgeCases.length) L.push("  none");
  for (const e of d.edgeCases) L.push(`  ${e.title}  [${e.platforms.join(", ")}]`);
  L.push("", "FLOWS");
  if (!d.flows.length) L.push("  none");
  for (const f of d.flows) L.push(`  ${f.id}  ${f.title}  [${f.platforms.join(", ")}]`);
  L.push("", `RELATED   ${d.related.length ? d.related.join(", ") : "none"}`);

  L.push("", "FILES");
  for (const [k, v] of Object.entries(d.files)) L.push(`  ${k.padEnd(14)}${v ?? "none"}`);
  return L.join("\n");
}

function listData() {
  return categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      components: components
        .filter((x) => x.category === c.id)
        .map((x) => ({ id: x.id, name: x.name, status: x.status, platforms: Object.fromEntries(Object.entries(x.platforms).map(([p, d]) => [p, d.status])) })),
    }))
    .filter((c) => c.components.length);
}

function listText(): string {
  const L: string[] = [];
  const data = listData();
  const width = Math.max(...data.flatMap((c) => c.components.map((x) => x.id.length)));
  for (const c of data) {
    L.push(`${c.name}  (${c.components.length})  ${c.description}`);
    for (const x of c.components) {
      const p = Object.entries(x.platforms).map(([k, s]) => `${k[0]}:${s}`).join(" ");
      L.push(`  ${x.id.padEnd(width)}  ${x.status.padEnd(6)}  ${p}`);
    }
    L.push("");
  }
  L.push(`${components.length} components. pnpm describe <id> for one; pnpm describe tokens for the tokens. (w web, d desktop, m mobile)`);
  L.push("The first column is the component's status (stable, beta, draft); the platform columns are ready, partial, planned or not-applicable.");
  return L.join("\n");
}

/* ---------- tokens ---------- */

/** The contexts a leaf can have a value in, in the order they are read: shared, theme, profile, OS. */
const CONTEXTS = ["shared", "light", "dark", "web", "desktop", "mobile", "android"] as const;
type Context = (typeof CONTEXTS)[number];

type Written = Partial<Record<Context, string | number>>;

function flat(tree: object, prefix = "", into = new Map<string, string | number>()) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith("$")) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object") flat(v, path, into);
    else into.set(path, v as string | number);
  }
  return into;
}

/** Every leaf with its value in each context, as written (a reference stays one) and resolved. */
function leaves(): { path: string; written: Written; resolved: Written }[] {
  const written = tokenLeaves(false);
  const resolved = tokenLeaves(true);
  const os = { written: flat(tokenSource.os.android), resolved: flat(tokens.os.android) };
  const paths = new Set([...written.keys(), ...os.written.keys()]);
  return [...paths].sort().map((path) => ({
    path,
    written: { ...written.get(path), ...(os.written.has(path) ? { android: os.written.get(path)! } : {}) },
    resolved: { ...resolved.get(path), ...(os.resolved.has(path) ? { android: os.resolved.get(path)! } : {}) },
  }));
}

const groupOf = (path: string) => path.split(".")[0]!;

function tokenData(l: { path: string; written: Written; resolved: Written }) {
  const note = (descriptions as Record<string, string | TokenNote>)[l.path];
  const n: TokenNote | null = note === undefined ? null : typeof note === "string" ? { text: note } : note;
  const references = Object.fromEntries(Object.entries(l.written).filter(([, v]) => typeof v === "string" && isReference(v)));
  return {
    path: l.path,
    cssVar: cssVarName(l.path),
    values: l.resolved,
    ...(Object.keys(references).length ? { references } : {}),
    description: n?.text ?? null,
    ...(n?.mobile ? { mobile: n.mobile } : {}),
    ...(n?.web ? { web: n.web } : {}),
    ...(n?.sameInDark ? { sameInDark: true } : {}),
  };
}

/** `light/dark #fff`: contexts with one value share a segment, in the order read. */
function segments(values: Partial<Record<string, string | number>>): string {
  const groups = new Map<string, string[]>();
  for (const c of CONTEXTS) if (values[c] !== undefined) groups.set(String(values[c]), [...(groups.get(String(values[c])) ?? []), c]);
  return [...groups].map(([v, cs]) => `${cs.join("/")} ${v}`).join("  ·  ");
}

function tokenGroupText(group: string, rows: ReturnType<typeof tokenData>[]): string {
  const L = [`${group}  (${rows.length} tokens)`];
  for (const r of rows) {
    L.push("", `${r.path}  ${r.cssVar}`);
    L.push(`  ${segments(r.values)}`);
    if (r.references) L.push(`  from ${segments(r.references as Record<string, string>)}`);
    if (r.description) L.push(prose(r.description, "  "));
    if (r.mobile) L.push(prose(`mobile: ${r.mobile}`, "  "));
    if (r.web) L.push(prose(`web: ${r.web}`, "  "));
    if (r.sameInDark) L.push("  same in light and dark, on purpose");
  }
  return L.join("\n");
}

function tokenGroups() {
  const counts = new Map<string, number>();
  for (const l of leaves()) counts.set(groupOf(l.path), (counts.get(groupOf(l.path)) ?? 0) + 1);
  return [...counts].map(([group, count]) => ({ group, count }));
}

/* ---------- the command ---------- */

if (args[0] === "tokens") {
  const group = args[1];
  const groups = tokenGroups();
  if (!group) {
    out(groups, () => [...groups.map((g) => `${g.group.padEnd(Math.max(...groups.map((x) => x.group.length)) + 2)}${g.count}`), "", `${groups.reduce((n, g) => n + g.count, 0)} tokens. pnpm describe tokens <group> for one.`].join("\n"));
  } else {
    const rows = leaves().filter((l) => groupOf(l.path) === group).map(tokenData);
    if (!rows.length) fail(`No token group "${group}". Groups: ${groups.map((g) => g.group).join(", ")}`);
    out({ group, tokens: rows }, () => tokenGroupText(group, rows));
  }
} else if (!args[0]) {
  out(listData(), listText);
} else {
  const doc = registry[args[0]];
  if (!doc) {
    const near = components.filter((c) => c.id.includes(args[0]!) || args[0]!.includes(c.id)).map((c) => c.id);
    fail(`No component "${args[0]}".${near.length ? ` Did you mean ${near.join(", ")}?` : ""} pnpm describe lists them all.`);
  } else {
    const data = componentData(doc);
    out(data, () => componentText(data));
  }
}
