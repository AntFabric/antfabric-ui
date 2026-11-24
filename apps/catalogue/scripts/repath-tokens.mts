/**
 * Moves nested token objects to their new paths: `tokens.ts`'s sets, and a theme's `tokens` (`shared`, `schemes.light`, `profiles.mobile`,
 * `os.android`), wherever they are written as nested object literals. The codemod (`packages/core/codemod`) rewrites names in text; an
 * object tree has to be rebuilt, because `fg: { muted }` becomes `color: { text: { muted } }`.
 *
 *   tsx apps/catalogue/scripts/repath-tokens.mts <file>… [--dry]
 *
 * Each leaf keeps its value's text and its comments; a group's comment moves to the first leaf that came from it. A set it cannot read
 * (a spread, a computed key) is left alone and named.
 */

import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";
import { readRenames } from "./deprecated-gen";

const renames = readRenames();
const dry = process.argv.includes("--dry");
const OSES = ["browser", "mac", "windows", "linux", "ios", "android"];
/** A set is an object under one of these keys whose parent key is the one named. */
const SET_PARENT: Record<string, string[]> = {
  shared: ["tokenSource", "tokens"],
  light: ["themes", "schemes"],
  dark: ["themes", "schemes"],
  web: ["profiles"],
  desktop: ["profiles"],
  mobile: ["profiles"],
  ...Object.fromEntries(OSES.map((o) => [o, ["os"]])),
};

const nameOf = (n: ts.Node | undefined): string | undefined =>
  n && (ts.isPropertyAssignment(n) || ts.isVariableDeclaration(n)) && (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name)) ? n.name.text : undefined;
/** The property or variable an object literal is the value of, through `as const` and parentheses. */
function owner(n: ts.Node): ts.Node | undefined {
  let p = n.parent;
  while (p && (ts.isAsExpression(p) || ts.isParenthesizedExpression(p) || ts.isSatisfiesExpression(p))) p = p.parent;
  return p;
}

type Leaf = { path: string; value: string; before: string[]; after: string };
type Out = Map<string, Out | Leaf>;
const isLeaf = (x: Out | Leaf): x is Leaf => !(x instanceof Map);
const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));

function rebuild(text: string, set: ts.ObjectLiteralExpression, indent: string): string | null {
  const leaves: Leaf[] = [];
  let ok = true;
  const comments = (pos: number) => (ts.getLeadingCommentRanges(text, pos) ?? []).map((r) => ({ ...r, text: text.slice(r.pos, r.end) }));
  const lineOf = (pos: number) => text.slice(0, pos).split("\n").length;
  const walk = (node: ts.ObjectLiteralExpression, prefix: string, carried: string[]) => {
    let pending = carried;
    node.properties.forEach((prop, i) => {
      if (!ts.isPropertyAssignment(prop) || !(ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) || ts.isNumericLiteral(prop.name))) return void (ok = false);
      // A key that is already a dotted path is a flat map (`{ "fg.muted": … }`), which the codemod renames; it is not a tree to rebuild.
      if (prop.name.text.includes(".")) return void (ok = false);
      const prev = node.properties[i - 1];
      // A comment that starts on the line the previous property ended on belongs to that property.
      const own = comments(prop.getFullStart()).filter((c) => !(prev && lineOf(c.pos) === lineOf(prev.end)));
      const before = [...pending, ...own.map((c) => c.text)];
      pending = [];
      const path = prefix + prop.name.text;
      let value: ts.Expression = prop.initializer;
      while (ts.isAsExpression(value) || ts.isParenthesizedExpression(value)) value = value.expression;
      if (ts.isObjectLiteralExpression(value) && !prop.name.text.startsWith("$")) return void walk(value, `${path}.`, before);
      const next = node.properties[i + 1];
      const after = (next ? comments(next.getFullStart()) : comments(node.getEnd() - 1)).filter((c) => lineOf(c.pos) === lineOf(prop.end)).map((c) => c.text).join(" ");
      leaves.push({ path, value: prop.initializer.getText(), before, after });
    });
  };
  walk(set, "", []);
  if (!ok) return null;

  const tree: Out = new Map();
  for (const leaf of leaves) {
    const keys = (renames[leaf.path] ?? leaf.path).split(".");
    let at = tree;
    for (const k of keys.slice(0, -1)) {
      const next = at.get(k) ?? new Map();
      if (isLeaf(next)) throw new Error(`${leaf.path} → ${keys.join(".")}: ${k} is already a value`);
      at.set(k, next);
      at = next;
    }
    if (at.has(keys[keys.length - 1]!)) throw new Error(`${leaf.path} → ${keys.join(".")} is written twice`);
    at.set(keys[keys.length - 1]!, leaf);
  }
  const print = (node: Out, pad: string): string =>
    [...node]
      .map(([k, v]) =>
        isLeaf(v) ? `${v.before.map((c) => `${pad}${c}\n`).join("")}${pad}${key(k)}: ${v.value},${v.after ? ` ${v.after}` : ""}` : `${pad}${key(k)}: {\n${print(v, `${pad}  `)}\n${pad}},`,
      )
      .join("\n");
  return tree.size ? `{\n${print(tree, `${indent}  `)}\n${indent}}` : "{}";
}

for (const file of process.argv.slice(2).filter((a) => !a.startsWith("--"))) {
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const sets: ts.ObjectLiteralExpression[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isObjectLiteralExpression(n)) {
      const mine = owner(n);
      const name = nameOf(mine);
      const outer = mine && ts.isPropertyAssignment(mine) && ts.isObjectLiteralExpression(mine.parent) ? nameOf(owner(mine.parent)) : undefined;
      if (name && outer && SET_PARENT[name]?.includes(outer)) return void sets.push(n); // a set holds no set
    }
    ts.forEachChild(n, visit);
  };
  visit(source);
  let out = text;
  let moved = 0;
  for (const set of sets.sort((a, b) => b.getStart() - a.getStart())) {
    const lineStart = text.lastIndexOf("\n", set.getStart()) + 1;
    const indent = /^\s*/.exec(text.slice(lineStart))![0];
    const next = rebuild(text, set, indent);
    if (next === null) {
      console.warn(`${file}: a set at line ${text.slice(0, set.getStart()).split("\n").length} has a spread or a computed key and was left alone`);
      continue;
    }
    if (next.replace(/\s+/g, "") !== set.getText().replace(/\s+/g, "")) moved++;
    out = out.slice(0, set.getStart()) + next + out.slice(set.getEnd());
  }
  console.log(`${file}: ${sets.length} set(s), ${moved} moved${dry ? " (dry run)" : ""}`);
  if (!dry && out !== text) writeFileSync(file, out);
}
