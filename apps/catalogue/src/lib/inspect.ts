/**
 * The Architecture page's worked example: per component, what each kit's file reads and hard-codes,
 * from the scan plus the source lines for context. Server-side only (`node:fs`); the page passes the
 * result to the `ComponentInspector` island as plain data.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { components } from "@antfabric-ui/docs";
import type { FileScan, Scan } from "./scan";

export interface InspectedFile {
  /** Repository-relative path. */
  file: string;
  /** Token group (`fg`, `control`, …) → the token paths read, each with its lines. */
  tokens: Record<string, { path: string; lines: number[] }[]>;
  /** Computed reads (`t.identity[…]`) with their lines. */
  dynamic: { path: string; lines: number[] }[];
  literals: { line: number; kind: "colour" | "dimension"; value: string; prop?: string; text: string }[];
  branches: { line: number; text: string }[];
  /** Imports from inside the kit (`../../lib/interaction`, `./menu`). */
  imports: { from: string; names: string[] }[];
  /** Every `t.…` match, as `pnpm report` counts them (a line can read the same token twice). */
  refs: number;
}

export interface InspectedComponent {
  id: string;
  name: string;
  category: string;
  react: InspectedFile | null;
  native: InspectedFile | null;
  /** `packages/docs/src/components/<category>/<id>.ts`. */
  docs: string;
}

export type InspectorData = InspectedComponent[];

const MAX_TEXT = 140;

/**
 * The group a token path belongs to: the path without its last segment (`fg.body` → `fg`,
 * `control.hMd` → `control`). A path of one segment is its own group.
 */
export function tokenGroup(path: string): string {
  const i = path.lastIndexOf(".");
  return i < 0 ? path : path.slice(0, i);
}

const uniq = (a: number[]) => [...new Set(a)].sort((x, y) => x - y);
/** The style key a colour sits on (`color: "#fff"` → `color`), when the line shows it. */
function styleKey(line: string, value: string): string | undefined {
  const at = line.indexOf(value);
  return at < 0 ? undefined : /(\w+)\s*:\s*["'`]?$/.exec(line.slice(0, at))?.[1];
}

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** `import type { A, type B as C } from "./x"` → names `A`, `B`; a default is `default`, a namespace `* as ns`. */
const IMPORT = /\bimport\s+(?:type\s+)?([^"';]*?)\s*from\s*["'](\.[^"']*)["']/g;

function parseImports(src: string): InspectedFile["imports"] {
  const out = new Map<string, Set<string>>();
  for (const m of src.matchAll(IMPORT)) {
    const names = out.get(m[2]!) ?? new Set<string>();
    const clause = m[1]!;
    const named = /\{([^}]*)\}/.exec(clause);
    const rest = clause.replace(/\{[^}]*\}/, "").replace(/,/g, " ").trim();
    if (rest.startsWith("*")) names.add(rest.replace(/\s+/g, " "));
    else if (rest) names.add("default");
    for (const part of named?.[1]?.split(",") ?? []) {
      const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]!.trim();
      if (name) names.add(name);
    }
    out.set(m[2]!, names);
  }
  return [...out].map(([from, names]) => ({ from, names: [...names].sort(byText) })).sort((a, b) => byText(a.from, b.from));
}

function inspectFile(root: string, f: FileScan): InspectedFile {
  const src = readFileSync(join(root, f.file), "utf8");
  const lines = src.split("\n");
  const text = (line: number) => (lines[line - 1] ?? "").trim().slice(0, MAX_TEXT);

  const groups: Record<string, { path: string; lines: number[] }[]> = {};
  for (const [path, at] of Object.entries(f.tokenPaths)) (groups[tokenGroup(path)] ??= []).push({ path, lines: uniq(at) });
  const tokens = Object.fromEntries(
    Object.entries(groups)
      .sort(([a], [b]) => byText(a, b))
      .map(([g, list]) => [g, list.sort((a, b) => byText(a.path, b.path))]),
  );

  const literals = [
    ...f.colours.map((l) => ({ line: l.line, kind: "colour" as const, value: l.value, prop: l.prop ?? styleKey(text(l.line), l.value), text: text(l.line) })),
    ...f.dimensions.map((l) => ({ line: l.line, kind: "dimension" as const, value: l.value, prop: l.prop, text: text(l.line) })),
  ]
    .map((l) => (l.prop === undefined ? { line: l.line, kind: l.kind, value: l.value, text: l.text } : l))
    .sort((a, b) => a.line - b.line || byText(a.kind, b.kind) || byText(a.value, b.value));

  return {
    file: f.file,
    tokens,
    dynamic: Object.entries(f.dynamic).map(([path, at]) => ({ path, lines: uniq(at) })).sort((a, b) => byText(a.path, b.path)),
    literals,
    branches: f.platformBranches.map((b) => ({ line: b.line, text: text(b.line) || b.text })),
    imports: parseImports(src),
    refs: f.tokenRefs,
  };
}

/** Every documented component, with what each kit's file reads and hard-codes. Sorted by category, then name. */
export function inspectorData(root: string, scan: Scan): InspectorData {
  const [react, native] = scan.kits.map((k) => new Map(k.files.map((f) => [f.id, f])));
  return components
    .map((c): InspectedComponent => {
      const docs = `packages/docs/src/components/${c.category}/${c.id}.ts`;
      if (!existsSync(join(root, docs))) throw new Error(`docs file missing for ${c.id}: ${docs}`);
      const r = react?.get(c.id);
      const n = native?.get(c.id);
      return { id: c.id, name: c.name, category: c.category, react: r ? inspectFile(root, r) : null, native: n ? inspectFile(root, n) : null, docs };
    })
    .sort((a, b) => byText(a.category, b.category) || byText(a.name, b.name));
}
