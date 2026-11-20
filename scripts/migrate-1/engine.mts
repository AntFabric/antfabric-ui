/**
 * The 1.0 codemod's engine: reads a repository with the TypeScript compiler API (syntax only), resolves every JSX element and import
 * to the kit's own name, and rewrites what `renames.ts` says can be rewritten mechanically. What it cannot do safely goes to the manual list.
 *
 * Text edits, not a printer: only the characters of a rule change, the rest of the file is byte-for-byte what it was. Edits nest (a Card's
 * `content` holds a Dialog with its own `content`), so an edit's text is made by a function that renders the original ranges it keeps.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";
import * as T from "./renames.ts";
import type { Kit, Ledger } from "./renames.ts";

// ---------------------------------------------------------------------------------------------------------------------
// Public shapes
// ---------------------------------------------------------------------------------------------------------------------

export interface Options {
  repo: string;
  /** The wrapper package consumers import (`@antfabric/ui-kit`). */
  via?: string;
  /** The wrapper's source folder, relative to `repo`. */
  wrapper?: string;
}

export interface ManualItem {
  file: string;
  line: number;
  component?: string;
  ledger: Ledger | "codemod";
  note: string;
}

export interface FileResult {
  file: string;
  before: string;
  after: string;
  edits: number;
}

export interface Result {
  repo: string;
  via: string;
  wrapper: string;
  scanned: number;
  importing: number;
  files: FileResult[];
  /** Edits per rule, and per rule and detail. */
  rules: Record<string, number>;
  details: Record<string, Record<string, number>>;
  manual: ManualItem[];
  defaults: ManualItem[];
}

const HOIST_THEME = "rewritten to a defineTheme call, which now runs at every render here: build the theme once (module scope or useMemo) so the tree is not re-themed";

// ---------------------------------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------------------------------

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".nx", ".next", ".turbo", ".expo", "coverage", ".cache", "Pods", ".output", ".svelte-kit",
  "target", ".gradle", ".idea", ".vscode", "tmp", "vendor",
]);

const KIT_PREFIX = "@antfabric/ui-";
const NATIVE_PKG = "@antfabric/ui-react-native";
const REACT_PKG = "@antfabric/ui-react";
const CORE_PKG = "@antfabric/ui-core";

interface KitSpec {
  pkg: Kit | "core";
  /** `""`, `data`, `shell`, `chat`, `fonts.css`… */
  sub: string;
}

function parseKitSpec(spec: string): KitSpec | null {
  for (const [name, pkg] of [[CORE_PKG, "core"], [NATIVE_PKG, "native"], [REACT_PKG, "react"]] as const) {
    if (spec === name) return { pkg, sub: "" };
    if (spec.startsWith(name + "/")) return { pkg, sub: spec.slice(name.length + 1) };
  }
  return null;
}

function walk(dir: string, out: string[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isSymbolicLink()) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(full, out);
    } else if (e.isFile()) out.push(full);
  }
}

function parse(file: string, text: string): ts.SourceFile {
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
}

function nearestPackageJson(from: string, stop: string): string | null {
  let d = from;
  while (d.startsWith(stop)) {
    const p = path.join(d, "package.json");
    if (fs.existsSync(p)) return p;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

function resolveRel(fromFile: string, spec: string): string | null {
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const c of [base, base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

const inList = (xs: string[], x: string) => xs.includes(x);
const kitMatches = (rule: { kit?: Kit }, platform: Kit | "core" | null) => !rule.kit || rule.kit === platform;

// ---------------------------------------------------------------------------------------------------------------------
// Edits that nest
// ---------------------------------------------------------------------------------------------------------------------

type Render = (start: number, end: number) => string;

interface Edit {
  start: number;
  end: number;
  rule: string;
  detail: string;
  make: string | ((render: Render) => string);
}

function orderEdits(a: Edit, b: Edit): number {
  if (a.start !== b.start) return a.start - b.start;
  const az = a.start === a.end, bz = b.start === b.end;
  if (az !== bz) return az ? -1 : 1;
  return b.end - a.end;
}

/** Apply the edits to `text`. An edit inside another one's range is dropped unless the outer one renders that range itself. */
function applyEdits(text: string, edits: Edit[]): string {
  const sorted = [...edits].sort(orderEdits);
  const render = (s: number, e: number, inclusiveEnd = false): string => {
    let out = "";
    let pos = s;
    let lastEnd = s;
    for (const ed of sorted) {
      if (ed.start < s) continue;
      if (ed.start > e || (ed.start === e && !inclusiveEnd)) break;
      if (ed.start < pos) {
        if (ed.end > lastEnd) throw new Error(`overlapping edits (${ed.rule}: ${ed.detail}) at ${ed.start}`);
        continue;
      }
      if (ed.end > e) throw new Error(`edit (${ed.rule}: ${ed.detail}) leaves its range at ${ed.start}`);
      out += text.slice(pos, ed.start) + (typeof ed.make === "string" ? ed.make : ed.make((a, b) => render(a, b)));
      pos = ed.end;
      lastEnd = ed.end;
    }
    return out + text.slice(pos, e);
  };
  return render(0, text.length, true);
}

// ---------------------------------------------------------------------------------------------------------------------
// The wrapper
// ---------------------------------------------------------------------------------------------------------------------

interface Alias { wrapper: string; kit: string; package: string; typeOnly: boolean; file: string }
interface Star { spec: string; file: string }
interface EntryInfo { file: string; aliases: Alias[]; stars: Star[]; extras: Set<string> }

function exportsOf(file: string, info: EntryInfo, seen: Set<string>, repo: string) {
  if (seen.has(file)) return;
  seen.add(file);
  const sf = parse(file, fs.readFileSync(file, "utf8"));
  const here = path.relative(repo, file).split(path.sep).join("/");
  const kitImports = new Map<string, { kit: string; package: string; typeOnly: boolean }>();
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier) && st.importClause) {
      const spec = st.moduleSpecifier.text;
      if (!spec.startsWith(KIT_PREFIX)) continue;
      const nb = st.importClause.namedBindings;
      if (nb && ts.isNamedImports(nb)) {
        for (const el of nb.elements) {
          kitImports.set(el.name.text, { kit: (el.propertyName ?? el.name).text, package: spec, typeOnly: st.importClause.isTypeOnly || el.isTypeOnly });
        }
      }
    }
  }
  for (const st of sf.statements) {
    if (ts.isExportDeclaration(st)) {
      const spec = st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) ? st.moduleSpecifier.text : null;
      if (spec && !st.exportClause) {
        if (spec.startsWith(KIT_PREFIX)) info.stars.push({ spec, file });
        else if (spec.startsWith(".")) {
          const target = resolveRel(file, spec);
          if (target) exportsOf(target, info, seen, repo);
        }
      } else if (st.exportClause && ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) {
          const typeOnly = st.isTypeOnly || el.isTypeOnly;
          const exported = el.name.text;
          const original = (el.propertyName ?? el.name).text;
          if (spec && spec.startsWith(KIT_PREFIX)) info.aliases.push({ wrapper: exported, kit: original, package: spec, typeOnly, file: here });
          else if (spec) info.extras.add(exported);
          else {
            const k = kitImports.get(original);
            if (k) info.aliases.push({ wrapper: exported, kit: k.kit, package: k.package, typeOnly: typeOnly || k.typeOnly, file: here });
            else info.extras.add(exported);
          }
        }
      }
      continue;
    }
    const mods = ts.canHaveModifiers(st) ? ts.getModifiers(st) : undefined;
    if (!mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) info.extras.add(d.name.text);
    } else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) info.extras.add(st.name.text);
    else if (ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) info.extras.add(st.name.text);
  }
}

interface Resolved {
  /** The kit's own name for it. */
  kit: string;
  platform: Kit | "core" | null;
  /** Imported straight from a kit package, not through the wrapper. */
  direct: boolean;
  /** The kit entry it comes from (`""` root, `data`, `shell`, `chat`). */
  sub: string;
  /** Through the wrapper: the wrapper's entry specifier. */
  entry?: string;
  /** The wrapper exports it under a name of its own (an alias), so it is the wrapper's to rename. */
  aliased?: boolean;
  /** The wrapper's own export, not the kit's. */
  extra?: boolean;
  /** A wrapper entry the codemod was not told about. */
  unknownEntry?: boolean;
}

// ---------------------------------------------------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------------------------------------------------

interface WrapperNeeds {
  /** entry specifier → subpaths (`shell`, `chat`) a consumer imports moved names through. */
  subpaths: Map<string, Set<string>>;
  /** entry specifier → core names (`themes`, `defineTheme`) a consumer's edit now imports through it. */
  core: Map<string, Set<string>>;
}

export function migrate(opts: Options): Result {
  const repo = path.resolve(opts.repo);
  const via = opts.via ?? "";
  const wrapperRel = opts.wrapper ?? "";
  const isViaSpec = (s: string) => !!via && (s === via || s.startsWith(via + "/"));
  const rel = (p: string) => path.relative(repo, p).split(path.sep).join("/");

  const result: Result = { repo, via, wrapper: wrapperRel, scanned: 0, importing: 0, files: [], rules: {}, details: {}, manual: [], defaults: [] };
  const manualSeen = new Set<string>();
  const pushManual = (list: ManualItem[], item: ManualItem) => {
    const key = `${item.file}:${item.line}:${item.component ?? ""}:${item.note}`;
    if (manualSeen.has(key)) return;
    manualSeen.add(key);
    list.push(item);
  };

  // ---- the wrapper's entries
  const wrapperDir = wrapperRel ? path.resolve(repo, wrapperRel) : "";
  const wrapperPkgPath = wrapperDir ? nearestPackageJson(wrapperDir, repo) : null;
  const wrapperPkgDir = wrapperPkgPath ? path.dirname(wrapperPkgPath) : wrapperDir;
  const wrapperPkg: Record<string, any> | null = wrapperPkgPath ? JSON.parse(fs.readFileSync(wrapperPkgPath, "utf8")) : null;
  const entries: Record<string, EntryInfo> = {};
  if (wrapperPkg && via) {
    const exp = wrapperPkg.exports as Record<string, string> | undefined;
    const map: Record<string, string> = {};
    if (exp) {
      for (const [k, v] of Object.entries(exp)) if (typeof v === "string") map[k === "." ? via : via + k.slice(1)] = v;
    } else if (wrapperPkg.main) map[via] = wrapperPkg.main as string;
    for (const [spec, target] of Object.entries(map)) {
      const file = path.resolve(wrapperPkgDir, target);
      if (!fs.existsSync(file)) continue;
      const info: EntryInfo = { file, aliases: [], stars: [], extras: new Set() };
      exportsOf(file, info, new Set(), repo);
      entries[spec] = info;
    }
  }

  const entryPlatform = (spec: string): Kit => (/\/native(\/|$)/.test(spec.slice(via.length)) ? "native" : "react");

  function resolveImport(spec: string, name: string): Resolved | null {
    const k = parseKitSpec(spec);
    if (k) return { kit: name, platform: k.pkg, direct: true, sub: k.sub };
    if (!isViaSpec(spec)) return null;
    const entry = entries[spec];
    const platform = entryPlatform(spec);
    if (!entry) return { kit: name, platform, direct: false, sub: "", entry: spec, unknownEntry: true };
    const alias = entry.aliases.find((a) => a.wrapper === name);
    if (alias) {
      const p = parseKitSpec(alias.package);
      return { kit: alias.kit, platform: p?.pkg ?? platform, direct: false, sub: p?.sub ?? "", entry: spec, aliased: alias.kit !== name };
    }
    if (entry.extras.has(name)) return { kit: name, platform: null, direct: false, sub: "", entry: spec, extra: true };
    const star = entry.stars[0];
    const p = star ? parseKitSpec(star.spec) : null;
    return { kit: name, platform: p && p.pkg !== "core" ? p.pkg : platform, direct: false, sub: p?.sub ?? "", entry: spec };
  }

  const needs: WrapperNeeds = { subpaths: new Map(), core: new Map() };
  const addNeed = (m: Map<string, Set<string>>, k: string, v: string) => {
    if (!m.has(k)) m.set(k, new Set());
    m.get(k)!.add(v);
  };

  // ---- files
  const all: string[] = [];
  walk(repo, all);
  const sourceFiles = all.filter((f) => /\.(ts|tsx|mts|cts)$/.test(f) && !f.endsWith(".d.ts")).sort();
  result.scanned = sourceFiles.length;

  const bump = (rule: string, detail: string) => {
    result.rules[rule] = (result.rules[rule] ?? 0) + 1;
    (result.details[rule] ??= {})[detail] = ((result.details[rule] ??= {})[detail] ?? 0) + 1;
  };

  /** Files, parsed once; the wrapper's entry files get a second pass for the lines that depend on what consumers use. */
  const processed = new Map<string, { sf: ts.SourceFile; text: string; edits: Edit[] }>();

  // ---- forwarders: a component of the repository that takes a kit component's props and spreads them into it
  // (`function ShellHeader(props: Omit<MobileHeaderProps, 'time'>) { return <MobileHeader {...props} /> }`). Every prop its callers pass
  // is the kit's prop, so a call site that passes a removed one is reported like the kit component's own.
  interface Forwarder {
    name: string;
    comp: string;
    platform: Kit | "core" | null;
    /** The file's name without its extension (the folder's, for an `index`), which an import of it ends with. */
    base: string;
  }
  const forwarders = new Map<string, Forwarder>();
  const kitFiles = new Map<string, { sf: ts.SourceFile; text: string }>();
  const findForwarders = (file: string, sf: ts.SourceFile) => {
    const types = new Map<string, Resolved>();
    const comps = new Map<string, Resolved>();
    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
      const spec = st.moduleSpecifier.text;
      if (!parseKitSpec(spec) && !isViaSpec(spec)) continue;
      const nb = st.importClause?.namedBindings;
      if (!nb || !ts.isNamedImports(nb)) continue;
      for (const el of nb.elements) {
        const r = resolveImport(spec, (el.propertyName ?? el.name).text);
        if (!r || r.extra) continue;
        (/Props$/.test(r.kit) ? types : comps).set(el.name.text, r);
      }
    }
    if (!types.size || !comps.size) return;
    const typeOf = (t: ts.TypeNode | undefined): Resolved | undefined => {
      if (!t) return undefined;
      if (ts.isParenthesizedTypeNode(t)) return typeOf(t.type);
      if (ts.isIntersectionTypeNode(t) || ts.isUnionTypeNode(t)) {
        for (const x of t.types) {
          const r = typeOf(x);
          if (r) return r;
        }
        return undefined;
      }
      if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName)) {
        const nm = t.typeName.text;
        if ((nm === "Omit" || nm === "Pick" || nm === "Partial") && t.typeArguments?.[0]) return typeOf(t.typeArguments[0]);
        return types.get(nm);
      }
      return undefined;
    };
    const spreadsInto = (body: ts.Node, comp: string): boolean => {
      let found = false;
      const look = (n: ts.Node) => {
        if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && ts.isIdentifier(n.tagName) && comps.get(n.tagName.text)?.kit === comp && n.attributes.properties.some(ts.isJsxSpreadAttribute)) found = true;
        if (!found) ts.forEachChild(n, look);
      };
      look(body);
      return found;
    };
    const dirBase = path.basename(file).replace(/\.[^.]+$/, "");
    const base = dirBase === "index" ? path.basename(path.dirname(file)) : dirBase;
    const consider = (name: string, fn: ts.SignatureDeclaration & { body?: ts.Node }) => {
      const r = typeOf(fn.parameters[0]?.type);
      if (!r || !fn.body) return;
      const comp = r.kit.slice(0, -"Props".length);
      if (spreadsInto(fn.body, comp)) forwarders.set(name, { name, comp, platform: r.platform, base });
    };
    for (const st of sf.statements) {
      if (ts.isFunctionDeclaration(st) && st.name) consider(st.name.text, st);
      else if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) {
          const init = d.initializer;
          if (ts.isIdentifier(d.name) && init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) consider(d.name.text, init);
        }
      }
    }
  };
  for (const file of sourceFiles) {
    const text = fs.readFileSync(file, "utf8");
    if (!text.includes(KIT_PREFIX) && !(via && text.includes(via))) continue;
    const sf = parse(file, text);
    kitFiles.set(file, { sf, text });
    findForwarders(file, sf);
  }

  for (const file of sourceFiles) {
    const kit = kitFiles.get(file);
    let text: string;
    let sf: ts.SourceFile;
    if (kit) ({ text, sf } = kit);
    else {
      if (!forwarders.size) continue;
      text = fs.readFileSync(file, "utf8");
      if (![...forwarders.keys()].some((n) => text.includes(`<${n}`))) continue;
      sf = parse(file, text);
    }
    if (kit) result.importing++;
    const edits = processFile(file, sf, text);
    processed.set(file, { sf, text, edits });
  }

  // ---- the wrapper's lines that depend on what consumers use
  for (const [spec, entry] of Object.entries(entries)) {
    const subs = needs.subpaths.get(spec);
    const core = needs.core.get(spec);
    if (!subs?.size && !core?.size) continue;
    const star = entry.stars.find((s) => parseKitSpec(s.spec)?.sub === "" && parseKitSpec(s.spec)?.pkg !== "core") ?? entry.stars[0];
    if (!star) {
      pushManual(result.manual, { file: rel(entry.file), line: 1, ledger: "foundations.md", note: `${spec} has no \`export * from "@antfabric/ui-…"\` line to put ${[...(subs ?? [])].map((s) => "/" + s).join(", ")} ${core ? `and ${[...core].join(", ")} ` : ""}beside; add the exports by hand` });
      continue;
    }
    const rec = processed.get(star.file) ?? (() => {
      const text = fs.readFileSync(star.file, "utf8");
      const sf = parse(star.file, text);
      const r = { sf, text, edits: [] as Edit[] };
      processed.set(star.file, r);
      return r;
    })();
    const sf = rec.sf;
    const kit = parseKitSpec(star.spec)!.pkg as Kit;
    const decl = sf.statements.find((st): st is ts.ExportDeclaration => ts.isExportDeclaration(st) && !st.exportClause && !!st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) && st.moduleSpecifier.text === star.spec);
    if (!decl) continue;
    const q = (decl.moduleSpecifier as ts.StringLiteral).getText(sf)[0] === '"' ? '"' : "'";
    const have = new Set<string>();
    for (const st of sf.statements) {
      if (ts.isExportDeclaration(st) && !st.exportClause && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) have.add(st.moduleSpecifier.text);
    }
    for (const sub of ["shell", "chat"]) {
      if (!subs?.has(sub)) continue;
      const target = `${kit === "native" ? NATIVE_PKG : REACT_PKG}/${sub}`;
      if (have.has(target)) continue;
      rec.edits.push({ start: decl.end, end: decl.end, rule: "wrapper-subpath", detail: `${spec}: export * from ${target}`, make: `\nexport * from ${q}${target}${q};` });
      bump("wrapper-subpath", `${spec}: export * from ${target}`);
    }
    if (core?.size) {
      const names = [...core].sort();
      // add to an existing value export from core, else a new line
      const existing = sf.statements.find((st): st is ts.ExportDeclaration => ts.isExportDeclaration(st) && !st.isTypeOnly && !!st.exportClause && ts.isNamedExports(st.exportClause) && !!st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) && st.moduleSpecifier.text === CORE_PKG);
      const have2 = new Set<string>();
      for (const st of sf.statements) {
        if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause) && !st.isTypeOnly && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) && st.moduleSpecifier.text === CORE_PKG) {
          for (const el of st.exportClause.elements) if (!el.isTypeOnly) have2.add(el.name.text);
        }
      }
      const missing = names.filter((n) => !have2.has(n));
      if (missing.length) {
        if (existing && ts.isNamedExports(existing.exportClause!)) {
          const els = existing.exportClause!.elements;
          const text = rec.text;
          const multi = text.slice(existing.exportClause!.getStart(sf), existing.exportClause!.end).includes("\n");
          // insert each name in alphabetical place among the specifiers' exported names
          for (const n of missing) {
            const idx = els.findIndex((el) => el.name.text.toLowerCase() > n.toLowerCase());
            if (idx === -1) {
              const last = els[els.length - 1]!;
              const trailing = els.hasTrailingComma;
              const sep = multi ? `\n${indentAt(text, last.getStart(sf))}` : " ";
              rec.edits.push({ start: last.end, end: last.end, rule: "wrapper-core-export", detail: `${spec}: ${n}`, make: `,${sep}${n}${trailing ? "" : ""}` });
            } else {
              const el = els[idx]!;
              const sep = multi ? `\n${indentAt(text, el.getStart(sf))}` : " ";
              rec.edits.push({ start: el.getStart(sf), end: el.getStart(sf), rule: "wrapper-core-export", detail: `${spec}: ${n}`, make: `${n},${sep}` });
            }
            bump("wrapper-core-export", `${spec}: ${n}`);
          }
        } else {
          const stmt = `\nexport { ${missing.join(", ")} } from ${q}${CORE_PKG}${q};`;
          rec.edits.push({ start: decl.end, end: decl.end, rule: "wrapper-core-export", detail: `${spec}: ${missing.join(", ")}`, make: stmt });
          for (const n of missing) bump("wrapper-core-export", `${spec}: ${n}`);
        }
      }
    }
  }

  // ---- render
  for (const [file, rec] of processed) {
    if (!rec.edits.length) continue;
    const after = applyEdits(rec.text, rec.edits);
    if (after === rec.text) continue;
    result.files.push({ file: rel(file), before: rec.text, after, edits: rec.edits.length });
  }
  result.files.sort((a, b) => a.file.localeCompare(b.file));
  result.manual.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line));
  result.defaults.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line));
  return result;

  // -------------------------------------------------------------------------------------------------------------------
  // One file
  // -------------------------------------------------------------------------------------------------------------------

  function processFile(file: string, sf: ts.SourceFile, text: string): Edit[] {
    const here = rel(file);
    const edits: Edit[] = [];
    const lineOf = (n: ts.Node) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
    const add = (n: { start: number; end: number }, rule: string, detail: string, make: Edit["make"]) => {
      edits.push({ start: n.start, end: n.end, rule, detail, make });
      bump(rule, detail);
    };
    const manual = (n: ts.Node, component: string | undefined, ledger: Ledger | "codemod", note: string) =>
      pushManual(result.manual, { file: here, line: lineOf(n), component, ledger, note });

    interface Binding extends Resolved {
      spec: string;
      imported: string;
      typeOnly: boolean;
    }
    const bindings = new Map<string, Binding>();
    const namespaces = new Map<string, string>();

    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
      const spec = st.moduleSpecifier.text;
      if (!parseKitSpec(spec) && !isViaSpec(spec)) continue;
      const clause = st.importClause;
      if (!clause) continue;
      if (clause.name) {
        const r = resolveImport(spec, "default");
        if (r) bindings.set(clause.name.text, { ...r, spec, imported: "default", typeOnly: clause.isTypeOnly });
      }
      const nb = clause.namedBindings;
      if (nb && ts.isNamespaceImport(nb)) namespaces.set(nb.name.text, spec);
      else if (nb && ts.isNamedImports(nb)) {
        for (const el of nb.elements) {
          const imported = (el.propertyName ?? el.name).text;
          const r = resolveImport(spec, imported);
          if (r) bindings.set(el.name.text, { ...r, spec, imported, typeOnly: clause.isTypeOnly || el.isTypeOnly });
        }
      }
    }

    // local aliases: const Btn = Button; const Card = UI.Card
    const resolveTagBase = (e: ts.Expression): Binding | undefined => {
      if (ts.isIdentifier(e)) return bindings.get(e.text);
      if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) && namespaces.has(e.expression.text)) {
        const spec = namespaces.get(e.expression.text)!;
        const r = resolveImport(spec, e.name.text);
        return r ? { ...r, spec, imported: e.name.text, typeOnly: false } : undefined;
      }
      return undefined;
    };
    const aliasPass = (n: ts.Node) => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && !bindings.has(n.name.text)) {
        let init: ts.Expression = n.initializer;
        while (ts.isParenthesizedExpression(init) || ts.isAsExpression(init) || ts.isNonNullExpression(init)) init = init.expression;
        const b = resolveTagBase(init);
        if (b) bindings.set(n.name.text, b);
      }
      ts.forEachChild(n, aliasPass);
    };
    for (let i = 0; i < 3; i++) aliasPass(sf);

    const hasKit = bindings.size > 0 || namespaces.size > 0;

    // functions declared in the file, to read a handler passed by name
    const fns = new Map<string, ts.SignatureDeclaration>();
    const collectFns = (n: ts.Node) => {
      if (ts.isFunctionDeclaration(n) && n.name) fns.set(n.name.text, n);
      else if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
        let init: ts.Expression = n.initializer;
        if (ts.isCallExpression(init) && ts.isIdentifier(init.expression) && /^use(Callback|Memo)$/.test(init.expression.text) && init.arguments[0]) init = init.arguments[0];
        if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) fns.set(n.name.text, init);
      }
      ts.forEachChild(n, collectFns);
    };
    collectFns(sf);
    // functions only declared by type (`onSettings: () => void`): how many arguments the type takes
    const declArity = new Map<string, number>();
    const noteArity = (name: string, type: ts.TypeNode | undefined) => {
      let ft = type;
      while (ft && ts.isParenthesizedTypeNode(ft)) ft = ft.type;
      if (ft && ts.isUnionTypeNode(ft)) ft = ft.types.map((x) => (ts.isParenthesizedTypeNode(x) ? x.type : x)).find(ts.isFunctionTypeNode);
      if (ft && ts.isFunctionTypeNode(ft)) declArity.set(name, Math.max(declArity.get(name) ?? 0, ft.parameters.length));
    };
    const collectArity = (n: ts.Node) => {
      if ((ts.isPropertySignature(n) || ts.isParameter(n) || ts.isVariableDeclaration(n)) && ts.isIdentifier(n.name)) noteArity(n.name.text, n.type);
      ts.forEachChild(n, collectArity);
    };
    collectArity(sf);

    const wantCore = new Map<string, Set<string>>(); // module specifier → names to import
    const needName = (spec: string, name: string) => {
      if (!wantCore.has(spec)) wantCore.set(spec, new Set());
      wantCore.get(spec)!.add(name);
    };
    /** A name a rewrite needs from core: through the wrapper's entry when the file imports from it, else straight from core. */
    const coreTarget = (b: Binding | undefined, name: string): string => {
      if (b && !b.direct && b.entry) {
        addNeed(needs.core, b.entry, name);
        return b.entry;
      }
      void name;
      return CORE_PKG;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // JSX
    // -----------------------------------------------------------------------------------------------------------------

    const attrName = (a: ts.JsxAttribute) => (ts.isIdentifier(a.name) ? a.name.text : a.name.getText(sf));
    const exprOf = (a: ts.JsxAttribute): ts.Expression | undefined => {
      const i = a.initializer;
      if (!i) return undefined;
      if (ts.isJsxExpression(i)) return i.expression ?? undefined;
      if (ts.isStringLiteral(i)) return i;
      return undefined;
    };
    const unwrap = (e: ts.Expression): ts.Expression => {
      while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e) || ts.isTypeAssertionExpression(e)) e = e.expression;
      return e;
    };
    const literalString = (a: ts.JsxAttribute): string | undefined => {
      const e = exprOf(a);
      if (!e) return undefined;
      const u = unwrap(e);
      if (ts.isStringLiteral(u) || ts.isNoSubstitutionTemplateLiteral(u)) return u.text;
      return undefined;
    };
    const isDeclaredIn = (id: ts.Identifier, body: ts.Node) => {
      let used = false;
      const visit = (n: ts.Node) => {
        if (ts.isIdentifier(n) && n.text === id.text && n !== id && !isPropertyNameIdentifier(n)) used = true;
        if (!used) ts.forEachChild(n, visit);
      };
      visit(body);
      return used;
    };

    const argUsage = (a: ts.JsxAttribute): "reads" | "ignores" | "unknown" => {
      const e = exprOf(a);
      if (!e) return "unknown";
      let fn: ts.SignatureDeclaration | undefined;
      const u = unwrap(e);
      if (ts.isArrowFunction(u) || ts.isFunctionExpression(u)) fn = u;
      else if (ts.isIdentifier(u)) {
        fn = fns.get(u.text);
        if (!fn && declArity.get(u.text) === 0) return "ignores";
      }
      if (!fn) return "unknown";
      if (!fn.parameters.length) return "ignores";
      const p = fn.parameters[0]!;
      if (!ts.isIdentifier(p.name)) return "reads";
      const body = (fn as ts.FunctionLikeDeclaration).body;
      if (!body) return "unknown";
      return isDeclaredIn(p.name, body) ? "reads" : "ignores";
    };

    const lineStartOf = (pos: number) => text.lastIndexOf("\n", pos - 1) + 1;
    const indentAtPos = (pos: number) => indentAt(text, pos);

    /** Insert `attr` after `anchor` (an attribute, or the tag name when there is none), on its own line when the attributes are. */
    const attrInsertion = (el: ts.JsxOpeningLikeElement, after: ts.JsxAttributeLike | undefined, attrText: string, before?: ts.JsxAttributeLike): { start: number; end: number; make: string } => {
      const props = el.attributes.properties;
      const multi = props.length > 0 && sf.getLineAndCharacterOfPosition(props[0]!.getStart(sf)).line !== sf.getLineAndCharacterOfPosition(el.tagName.getStart(sf)).line;
      if (before) {
        const bStart = before.getStart(sf);
        const ownLine = text.slice(lineStartOf(bStart), bStart).trim() === "";
        return { start: bStart, end: bStart, make: attrText + (ownLine ? `\n${indentAtPos(bStart)}` : " ") };
      }
      if (after) {
        const sep = multi ? `\n${indentAtPos(after.getStart(sf))}` : " ";
        return { start: after.end, end: after.end, make: sep + attrText };
      }
      const pos = el.attributes.pos;
      return { start: pos, end: pos, make: " " + attrText };
    };

    /** The same text, a new name for the attribute. */
    const renameAttr = (a: ts.JsxAttribute, to: string, rule: string, detail: string) => {
      add({ start: a.name.getStart(sf), end: a.name.end }, rule, detail, to);
    };

    // item literal rewriting ---------------------------------------------------------------------------------------------
    type Obj = ts.ObjectLiteralExpression;
    const propNameOf = (p: ts.ObjectLiteralElementLike): string | undefined => {
      if (ts.isShorthandPropertyAssignment(p)) return p.name.text;
      if (ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p)) {
        const n = p.name;
        if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n)) return n.text;
      }
      return undefined;
    };
    const findProp = (o: Obj, name: string) => o.properties.find((p) => propNameOf(p) === name);

    /** Visit the object literals an item prop's expression builds directly. `unknown` when part of it is built elsewhere. */
    const forEachItemObject = (e: ts.Expression, visit: (o: Obj) => void): { unknown: ts.Node[] } => {
      const unknown: ts.Node[] = [];
      const walkE = (x: ts.Expression) => {
        x = unwrap(x);
        if (ts.isArrayLiteralExpression(x)) {
          for (const el of x.elements) {
            const u = ts.isSpreadElement(el) ? undefined : unwrap(el);
            if (u && ts.isObjectLiteralExpression(u)) visit(u);
            else if (u && (ts.isConditionalExpression(u) || ts.isBinaryExpression(u))) walkE(u);
            else unknown.push(el);
          }
        } else if (ts.isConditionalExpression(x)) {
          walkE(x.whenTrue);
          walkE(x.whenFalse);
        } else if (ts.isBinaryExpression(x) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(x.operatorToken.kind)) {
          if (x.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) walkE(x.left);
          walkE(x.right);
        } else if (ts.isCallExpression(x) && ts.isPropertyAccessExpression(x.expression) && x.expression.name.text === "map" && x.arguments[0] && (ts.isArrowFunction(x.arguments[0]) || ts.isFunctionExpression(x.arguments[0]))) {
          const fn = x.arguments[0] as ts.ArrowFunction | ts.FunctionExpression;
          if (ts.isBlock(fn.body)) {
            let found = false;
            const rets = (n: ts.Node) => {
              if (ts.isReturnStatement(n) && n.expression) {
                found = true;
                const u = unwrap(n.expression);
                if (ts.isObjectLiteralExpression(u)) visit(u);
                else unknown.push(n.expression);
              }
              if (!ts.isFunctionLike(n) || n === fn) ts.forEachChild(n, rets);
            };
            rets(fn.body);
            if (!found) unknown.push(x);
          } else {
            const u = unwrap(fn.body);
            if (ts.isObjectLiteralExpression(u)) visit(u);
            else unknown.push(fn.body);
          }
        } else if (ts.isObjectLiteralExpression(x)) {
          unknown.push(x);
        } else unknown.push(x);
      };
      walkE(e);
      return { unknown };
    };

    // -------------------------------------------------------------------------------------------------------------------
    // The element rules
    // -------------------------------------------------------------------------------------------------------------------

    const handleElement = (node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, b: Binding) => {
      const comp = b.kit;
      const platform = b.platform;
      if (b.typeOnly || b.extra) return;
      const el = node;
      const attrs = new Map<string, ts.JsxAttribute>();
      const spreads: ts.JsxSpreadAttribute[] = [];
      for (const a of el.attributes.properties) {
        if (ts.isJsxSpreadAttribute(a)) spreads.push(a);
        else attrs.set(attrName(a), a);
      }
      const handled = new Set<ts.JsxAttribute>();
      const removed = new Set<string>(); // attribute names renamed away
      const manualAt = (n: ts.Node, ledger: Ledger | "codemod", note: string) => manual(n, comp, ledger, note);

      // ---- roots
      if (T.roots.schemeRename.includes(comp) || T.roots.brand.includes(comp) || T.roots.themeLine.includes(comp)) {
        handleRoot(el, b, attrs, spreads, handled);
      }

      // ---- renamed props
      for (const rule of T.propRenames) {
        if (!inList(rule.components, comp) || !kitMatches(rule, platform)) continue;
        const a = attrs.get(rule.from);
        if (!a || removed.has(rule.from)) continue;
        const target = attrs.get(rule.to);
        if (target) {
          manualAt(a, rule.ledger, `\`${rule.from}\` and \`${rule.to}\` are both passed: keep \`${rule.to}\` and move what \`${rule.from}\` did into it`);
          handled.add(a);
          continue;
        }
        if (rule.handler === "ifReadsArg" || rule.handler === "invertedArg") {
          const use = argUsage(a);
          if (rule.handler === "ifReadsArg") {
            if (use === "ignores") { handled.add(a); continue; }
            if (use === "unknown") {
              manualAt(a, rule.ledger, `\`${rule.from}(next)\` is \`${rule.to}(next)\` now (a bare \`${rule.from}()\` is still a press): if this handler reads its argument, rename the prop`);
              handled.add(a);
              continue;
            }
          } else if (use !== "ignores") {
            manualAt(a, rule.ledger, `\`${rule.from}\` → \`${rule.to}\`: the argument is the opposite now (\`collapsed\` → \`expanded\`), so a handler that reads it must read \`!expanded\``);
            handled.add(a);
            continue;
          }
        }
        renameAttr(a, rule.to, "prop-rename", `${comp}.${rule.from} → ${rule.to}`);
        handled.add(a);
        removed.add(rule.from);
        if (rule.addAttrs) {
          let anchor: ts.JsxAttributeLike = a;
          for (const extra of rule.addAttrs) {
            const nm = extra.split("=")[0]!;
            if (attrs.has(nm)) continue;
            const ins = attrInsertion(el, anchor, extra);
            add(ins, "add-attribute", `${comp}: ${extra}`, ins.make);
          }
        }
      }

      // ---- inverted booleans
      for (const rule of T.booleanInversions) {
        if (!inList(rule.components, comp)) continue;
        const a = attrs.get(rule.from);
        if (!a) continue;
        if (attrs.has(rule.to)) {
          manualAt(a, rule.ledger, `\`${rule.from}\` and \`${rule.to}\` are both passed`);
          handled.add(a);
          continue;
        }
        const e = exprOf(a);
        const init = a.initializer;
        let make: Edit["make"];
        if (!init) make = `${rule.to}={false}`;
        else if (!e) {
          manualAt(a, rule.ledger, `\`${rule.from}\` has a value the codemod cannot read: invert it into \`${rule.to}\``);
          handled.add(a);
          continue;
        } else {
          const u = unwrap(e);
          if (u.kind === ts.SyntaxKind.TrueKeyword) make = `${rule.to}={false}`;
          else if (u.kind === ts.SyntaxKind.FalseKeyword) make = rule.to;
          else if (ts.isPrefixUnaryExpression(u) && u.operator === ts.SyntaxKind.ExclamationToken) {
            const operand = ts.isParenthesizedExpression(u.operand) ? u.operand.expression : u.operand;
            make = (r) => `${rule.to}={${r(operand.getStart(sf), operand.end)}}`;
          } else make = (r) => `${rule.to}={!(${r(e.getStart(sf), e.end)})}`;
        }
        add({ start: a.getStart(sf), end: a.end }, "invert-boolean", `${comp}.${rule.from} → ${rule.to}`, make);
        handled.add(a);
        removed.add(rule.from);
      }

      // ---- literal values
      for (const rule of T.valueRenames) {
        if (!inList(rule.components, comp) || !kitMatches(rule, platform)) continue;
        const a = attrs.get(rule.prop);
        if (!a || handled.has(a)) continue;
        if (literalString(a) !== rule.from) continue;
        // a phone-only variant of a rule is preferred over the general one
        const specific = T.valueRenames.find((r) => r !== rule && r.kit && inList(r.components, comp) && r.prop === rule.prop && r.from === rule.from && kitMatches(r, platform));
        if (!rule.kit && specific) continue;
        const toProp = rule.toProp ?? rule.prop;
        const toAttr = rule.toValue === "true" ? toProp : `${toProp}="${rule.toValue}"`;
        add({ start: a.getStart(sf), end: a.end }, "value-rename", `${comp}.${rule.prop}="${rule.from}" → ${toAttr}`, toAttr);
        handled.add(a);
        let anchor: ts.JsxAttributeLike = a;
        for (const extra of rule.addAttrs ?? []) {
          if (attrs.has(extra.split("=")[0]!)) continue;
          const ins = attrInsertion(el, anchor, extra);
          add(ins, "add-attribute", `${comp}: ${extra}`, ins.make);
        }
      }

      for (const rule of T.defaultAttrs) {
        if (!inList(rule.components, comp) || !kitMatches(rule, platform) || spreads.length) continue;
        if (rule.unlessAttrs.some((n) => attrs.has(n))) continue;
        const ins = attrInsertion(el, el.attributes.properties[el.attributes.properties.length - 1], rule.add);
        add(ins, "add-attribute", `${comp}: ${rule.add} (${rule.note})`, ins.make);
      }

      // ---- content → children
      for (const rule of T.contentToChildren) {
        if (!inList(rule.components, comp)) continue;
        const a = attrs.get(rule.prop);
        if (!a) continue;
        contentToChildren(el, a, comp, rule.ledger);
        handled.add(a);
      }

      // ---- item fields
      for (const rule of T.itemFieldRenames) {
        if (!inList(rule.components, comp) || !kitMatches(rule, platform)) continue;
        const a = attrs.get(rule.prop);
        if (!a) continue;
        if (rule.unlessAttr && attrs.has(rule.unlessAttr)) continue;
        const e = exprOf(a);
        if (!e) continue;
        const visitObj = (o: Obj) => {
          const p = findProp(o, rule.from);
          if (p) {
            const skip = (rule.unlessField ?? []).some((f) => findProp(o, f));
            if (!skip) {
              if (findProp(o, rule.to)) manualAt(p, rule.ledger, `an item has both \`${rule.from}\` and \`${rule.to}\``);
              else if (ts.isShorthandPropertyAssignment(p)) add({ start: p.getStart(sf), end: p.end }, "item-field", `${comp}.${rule.prop}[].${rule.from} → ${rule.to}`, `${rule.to}: ${p.name.text}`);
              else if (ts.isPropertyAssignment(p)) {
                const n = p.name;
                const nt = n.getText(sf);
                const q = nt[0] === '"' || nt[0] === "'" ? nt[0] : "";
                add({ start: n.getStart(sf), end: n.end }, "item-field", `${comp}.${rule.prop}[].${rule.from} → ${rule.to}`, q + rule.to + q);
              }
            }
          }
          for (const nest of rule.nested ?? []) {
            const np = findProp(o, nest);
            if (np && ts.isPropertyAssignment(np)) {
              const sub = forEachItemObject(np.initializer, visitObj);
              for (const u of sub.unknown) manualAt(u, rule.ledger, `\`${nest}\` is built elsewhere: rename \`${rule.from}\` → \`${rule.to}\` in its items`);
            }
          }
        };
        const { unknown } = forEachItemObject(e, visitObj);
        for (const u of unknown) {
          manualAt(u, rule.ledger, `\`${rule.prop}\` is built elsewhere: rename item field \`${rule.from}\` → \`${rule.to}\` in it${rule.unlessAttr ? ` (or pass ${rule.unlessAttr}="${rule.from}")` : ""}`);
        }
      }
      for (const rule of T.itemKeysFromField) {
        if (!inList(rule.components, comp)) continue;
        const a = attrs.get(rule.prop);
        const e = a && exprOf(a);
        if (!a || !e) continue;
        const { unknown } = forEachItemObject(e, (o) => {
          if (findProp(o, "key")) return;
          const f = findProp(o, rule.field);
          if (!f) return;
          let valueText: string | undefined;
          if (ts.isShorthandPropertyAssignment(f)) valueText = f.name.text;
          else if (ts.isPropertyAssignment(f)) {
            const v = unwrap(f.initializer);
            if (ts.isStringLiteral(v) || ts.isNoSubstitutionTemplateLiteral(v) || ts.isIdentifier(v) || ts.isPropertyAccessExpression(v)) valueText = f.initializer.getText(sf);
          }
          if (valueText === undefined) {
            manualAt(f, rule.ledger, `give this item a \`key\` (matching used \`${rule.field}\`, so \`key\` is the same text)`);
            return;
          }
          const first = o.properties[0]!;
          const firstOwn = text.slice(lineStartOf(first.getStart(sf)), first.getStart(sf)).trim() === "";
          const sep = firstOwn ? `\n${indentAtPos(first.getStart(sf))}` : " ";
          add({ start: first.getStart(sf), end: first.getStart(sf) }, "item-key", `${comp}.${rule.prop}[]: key from ${rule.field}`, `key: ${valueText},${sep}`);
        });
        for (const u of unknown) manualAt(u, rule.ledger, `\`${rule.prop}\` is built elsewhere: every item takes a \`key\` (matching used \`${rule.field}\`)`);
      }
      for (const rule of T.manualItemFields) {
        if (!inList(rule.components, comp)) continue;
        const a = attrs.get(rule.prop);
        const e = a && exprOf(a);
        if (!a || !e) continue;
        forEachItemObject(e, (o) => {
          const p = findProp(o, rule.field);
          if (p) manualAt(p, rule.ledger, rule.note);
        });
      }
      // ---- styles={{ part }}
      for (const rule of T.styleKeyRenames) {
        if (!inList(rule.components, comp) || !kitMatches(rule, platform)) continue;
        const a = attrs.get("styles");
        const e = a && exprOf(a);
        if (!a || !e) continue;
        const u = unwrap(e);
        if (!ts.isObjectLiteralExpression(u)) continue;
        const p = findProp(u, rule.from);
        if (!p) continue;
        if (findProp(u, rule.to)) manualAt(p, rule.ledger, `\`styles\` has both \`${rule.from}\` and \`${rule.to}\`: merge them`);
        else if (ts.isShorthandPropertyAssignment(p)) add({ start: p.getStart(sf), end: p.end }, "styles-key", `${comp}.styles.${rule.from} → ${rule.to}`, `${rule.to}: ${p.name.text}`);
        else if (ts.isPropertyAssignment(p)) add({ start: p.name.getStart(sf), end: p.name.end }, "styles-key", `${comp}.styles.${rule.from} → ${rule.to}`, rule.to);
      }

      // ---- strings
      const stringsAttr = attrs.get("strings");
      if (stringsAttr) {
        const e = exprOf(stringsAttr);
        const u = e && unwrap(e);
        if (u && ts.isObjectLiteralExpression(u)) {
          for (const rule of T.stringPlaceholders) {
            const groupObj: Obj | undefined = comp === "ProgressBar" && rule.group === "progress-bar" ? u : (() => {
              const p = findProp(u, rule.group);
              const v = p && ts.isPropertyAssignment(p) ? unwrap(p.initializer) : undefined;
              return v && ts.isObjectLiteralExpression(v) ? v : undefined;
            })();
            if (!groupObj) continue;
            for (const k of rule.keys) {
              const p = findProp(groupObj, k);
              if (!p || !ts.isPropertyAssignment(p)) continue;
              const v = unwrap(p.initializer);
              if ((ts.isStringLiteral(v) || ts.isNoSubstitutionTemplateLiteral(v)) && v.text.includes(rule.from)) {
                const raw = v.getText(sf);
                add({ start: v.getStart(sf), end: v.end }, "strings-placeholder", `${rule.group}.${k}: ${rule.from} → ${rule.to}`, raw.split(rule.from).join(rule.to));
              }
            }
          }
        }
      }

      // ---- what only a person can do
      for (const rule of T.manualProps) {
        if (!inList(rule.components, comp) || !kitMatches(rule, platform)) continue;
        const a = attrs.get(rule.prop);
        if (!a || handled.has(a)) continue;
        if (rule.onlyNonLiteral && literalString(a) !== undefined) continue;
        if (rule.unlessItemField) {
          const ie = exprOf(a);
          const iu = ie && unwrap(ie);
          const field = rule.unlessItemField;
          if (iu && ts.isArrayLiteralExpression(iu) && iu.elements.every((x) => {
            const o = ts.isSpreadElement(x) ? undefined : unwrap(x);
            return !!o && ts.isObjectLiteralExpression(o) && !!findProp(o, field);
          })) continue;
        }
        const lit = literalString(a);
        if (lit !== undefined && rule.exceptValues?.includes(lit)) continue;
        manualAt(a, rule.ledger, `\`${rule.prop}\`: ${rule.note}`);
      }
      if (spreads.length === 0) {
        for (const rule of T.defaultChanges) {
          if (!inList(rule.components, comp) || !kitMatches(rule, platform)) continue;
          if (rule.missing.some((m) => attrs.has(m))) continue;
          pushManual(result.defaults, { file: here, line: lineOf(el), component: comp, ledger: rule.ledger, note: rule.note });
        }
      }
    };

    // ---- roots ----------------------------------------------------------------------------------------------------
    const isThemeObject = (e: ts.Expression): boolean => {
      const u = unwrap(e);
      if (ts.isCallExpression(u)) {
        const callee = u.expression;
        if (ts.isIdentifier(callee) && (callee.text === "defineTheme" || bindings.get(callee.text)?.imported === "defineTheme")) return true;
      }
      if (ts.isPropertyAccessExpression(u) && ts.isIdentifier(u.expression)) {
        const nm = u.expression.text;
        if (nm === "themes" || bindings.get(nm)?.imported === "themes") return true;
      }
      if (ts.isIdentifier(u)) {
        const b = bindings.get(u.text);
        if (b && ["antfabric", "neutral", "themes"].includes(b.imported)) return true;
        // declared in this file as a theme
        let declaredAsTheme = false;
        const find = (n: ts.Node) => {
          if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === u.text && n.initializer && isThemeObject(n.initializer)) declaredAsTheme = true;
          if (!declaredAsTheme) ts.forEachChild(n, find);
        };
        find(sf);
        return declaredAsTheme;
      }
      return false;
    };

    const objectWithBrand = (e: ts.Expression, visit: (o: Obj) => void) => {
      const u = unwrap(e);
      if (ts.isObjectLiteralExpression(u)) visit(u);
      else if (ts.isConditionalExpression(u)) {
        objectWithBrand(u.whenTrue, visit);
        objectWithBrand(u.whenFalse, visit);
      } else if (ts.isBinaryExpression(u)) {
        objectWithBrand(u.left, visit);
        objectWithBrand(u.right, visit);
      }
    };

    const themeFromBrand = (b: Binding | undefined, brandText: (r: Render) => string): ((r: Render) => string) => {
      const spec = coreTarget(b, "themes");
      needName(spec, "defineTheme");
      needName(spec, "themes");
      if (b && !b.direct && b.entry) addNeed(needs.core, b.entry, "defineTheme");
      return (r) => `defineTheme({ name: "${T.BRAND_THEME_NAME}", extends: themes.antfabric, brand: ${brandText(r)} })`;
    };

    const handleRoot = (el: ts.JsxOpeningLikeElement, b: Binding, attrs: Map<string, ts.JsxAttribute>, spreads: ts.JsxSpreadAttribute[], handled: Set<ts.JsxAttribute>) => {
      const comp = b.kit;
      let themeAfter = attrs.has("theme");
      // theme="dark" → scheme="dark"
      const themeAttr = attrs.get("theme");
      if (themeAttr && T.roots.schemeRename.includes(comp)) {
        const e = exprOf(themeAttr);
        const isObj = e ? isThemeObject(e) : false;
        if (!isObj) {
          if (attrs.has("scheme")) manual(themeAttr, comp, "foundations.md", "`theme` (a scheme in 0.1) and `scheme` are both passed: keep `scheme`");
          else {
            renameAttr(themeAttr, "scheme", "root-scheme", `${comp}.theme → scheme`);
            themeAfter = false;
          }
          handled.add(themeAttr);
        }
      }
      // brand={x} → theme={defineTheme(…)}
      const brandAttr = attrs.get("brand");
      if (brandAttr && T.roots.brand.includes(comp)) {
        const e = exprOf(brandAttr);
        if (themeAfter) manual(brandAttr, comp, "foundations.md", "`brand` and a theme are both passed: put the brand in the theme's defineTheme call");
        else if (!e) manual(brandAttr, comp, "foundations.md", "`brand` has a value the codemod cannot read");
        else {
          const make = themeFromBrand(b, (r) => r(e.getStart(sf), e.end));
          add({ start: brandAttr.getStart(sf), end: brandAttr.end }, "root-brand", `${comp}.brand → theme={defineTheme(…)}`, (r) => `theme={${make(r)}}`);
          manual(brandAttr, comp, "foundations.md", HOIST_THEME);
          themeAfter = true;
        }
        handled.add(brandAttr);
      }
      // {...(cond ? { brand } : {})}
      let spreadUnknown = false;
      for (const sp of spreads) {
        let found = false;
        objectWithBrand(sp.expression, (o) => {
          const p = findProp(o, "brand");
          if (!p) return;
          found = true;
          let valueText: ((r: Render) => string) | undefined;
          if (ts.isShorthandPropertyAssignment(p)) valueText = () => p.name.text;
          else if (ts.isPropertyAssignment(p)) {
            const init = p.initializer;
            valueText = (r) => r(init.getStart(sf), init.end);
          }
          if (!valueText) return;
          const vt = valueText;
          const make = themeFromBrand(b, vt);
          add({ start: p.getStart(sf), end: p.end }, "root-brand", `${comp}: spread { brand } → { theme: defineTheme(…) }`, (r) => `theme: ${make(r)}`);
          manual(p, comp, "foundations.md", HOIST_THEME);
        });
        if (!found) {
          const u = unwrap(sp.expression);
          let carries = false;
          const check = (n: ts.Node) => {
            if (ts.isObjectLiteralExpression(n) && (findProp(n, "theme") || findProp(n, "brand"))) carries = true;
            ts.forEachChild(n, check);
          };
          check(sp.expression);
          if (carries) manual(sp, comp, "foundations.md", "a spread carries `theme` or `brand`: a scheme goes in `scheme`, a brand in a defineTheme theme");
          else if (!ts.isObjectLiteralExpression(u)) spreadUnknown = true;
        }
      }
      if (spreadUnknown && T.roots.themeLine.includes(comp)) {
        manual(spreads[0]!, comp, "foundations.md", "a spread of props the codemod cannot read may carry `brand` or a scheme `theme`");
      }
      // the line that keeps the old look
      if (T.roots.themeLine.includes(comp) && !themeAfter) {
        let top = true;
        for (let p: ts.Node | undefined = el.parent?.parent; p; p = p.parent) {
          if (ts.isJsxElement(p)) {
            const base = resolveTagBase(p.openingElement.tagName as ts.Expression);
            if (base && T.roots.themeLine.includes(base.kit)) { top = false; break; }
          }
        }
        if (top) {
          const spec = coreTarget(b, "themes");
          needName(spec, "themes");
          const firstSpread = spreads[0];
          const props = el.attributes.properties;
          let anchor: ts.JsxAttributeLike | undefined;
          for (const p of props) {
            if (p === firstSpread) break;
            anchor = p;
          }
          const ins = attrInsertion(el, firstSpread ? undefined : anchor, "theme={themes.antfabric}", firstSpread);
          add(ins, "theme-line", `${comp}: theme={themes.antfabric}`, ins.make);
        }
      }
    };

    // ---- content → children ---------------------------------------------------------------------------------------
    const contentToChildren = (node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, a: ts.JsxAttribute, comp: string, ledger: Ledger) => {
      const init = a.initializer;
      let e: ts.Expression | undefined;
      let stringLit: ts.StringLiteral | undefined;
      if (init && ts.isJsxExpression(init)) e = init.expression ?? undefined;
      else if (init && ts.isStringLiteral(init)) stringLit = init;
      if (!e && !stringLit) {
        manual(a, comp, ledger, "`content` has a value the codemod cannot read: pass it as children");
        return;
      }
      const parent = node.parent;
      const isSelf = ts.isJsxSelfClosingElement(node);
      if (!isSelf && ts.isJsxElement(parent)) {
        const filled = parent.children.some((c) => !(ts.isJsxText(c) && c.containsOnlyTriviaWhiteSpaces));
        if (filled) {
          manual(a, comp, ledger, "`content` and children are both passed: merge them");
          return;
        }
      }
      const owner: ts.Node = isSelf ? node : parent;
      const elStart = owner.getStart(sf);
      const elIndent = indentAtPos(elStart);
      const childIndent = elIndent + "  ";
      const attrStart = a.getStart(sf);
      // text of the content, with the edits inside it, moved to the children's indent
      const childText = (r: Render): string => {
        if (stringLit) return `{${stringLit.getText(sf)}}`;
        let x = e!;
        while (ts.isParenthesizedExpression(x)) x = x.expression;
        const direct = ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x) || ts.isJsxFragment(x);
        const xs = x.getStart(sf);
        const rendered = r(xs, x.end);
        const ownLine = text.slice(lineStartOf(xs), xs).trim() === "";
        const base = ownLine ? indentAtPos(xs) : indentAtPos(attrStart);
        const lines = rendered.split("\n");
        const out = lines.map((ln, i) => {
          if (i === 0) return ln;
          return ln.startsWith(base) ? childIndent + ln.slice(base.length) : ln.trim() === "" ? ln : childIndent + ln.trimStart();
        });
        const body = out.join("\n");
        return direct ? body : `{${body}}`;
      };
      const tagText = isSelf ? node.tagName.getText(sf) : (parent as ts.JsxElement).closingElement.tagName.getText(sf);
      const rule = "content-children";
      const detail = `${comp}.content → children`;
      if (isSelf) {
        const others = node.attributes.properties.filter((p) => p !== a);
        const lastOther = others[others.length - 1];
        const anchorEnd = lastOther ? lastOther.end : node.attributes.pos;
        const props = node.attributes.properties;
        const lastIsContent = props[props.length - 1] === a;
        const ownLineClose = !!lastOther && /\n\s*\/>$/.test(text.slice(props[props.length - 1]!.end, node.end));
        if (!lastIsContent) edits.push({ start: a.getFullStart(), end: a.end, rule, detail: detail + " (attribute)", make: "" });
        add({ start: anchorEnd, end: node.end }, rule, detail, (r) => `${ownLineClose ? `\n${elIndent}` : ""}>\n${childIndent}${childText(r)}\n${elIndent}</${tagText}>`);
      } else {
        const opening = node;
        const closing = (parent as ts.JsxElement).closingElement;
        edits.push({ start: a.getFullStart(), end: a.end, rule, detail: detail + " (attribute)", make: "" });
        add({ start: opening.end, end: closing.getStart(sf) }, rule, detail, (r) => `\n${childIndent}${childText(r)}\n${elIndent}`);
      }
    };

    // -------------------------------------------------------------------------------------------------------------------
    // The walk
    // -------------------------------------------------------------------------------------------------------------------

    // `Omit<MobileHeaderProps, 'time'>`, `CardProps['content']`: a prop named in a type is renamed like the prop
    const propsTypeOf = (t: ts.TypeNode | undefined): { comp: string; platform: Binding["platform"] } | undefined => {
      if (!t || !ts.isTypeReferenceNode(t) || !ts.isIdentifier(t.typeName)) return undefined;
      const b = bindings.get(t.typeName.text);
      if (!b || b.extra || !/Props$/.test(b.kit)) return undefined;
      return { comp: b.kit.slice(0, -"Props".length), platform: b.platform };
    };
    const literalNames = (t: ts.TypeNode | undefined): ts.LiteralTypeNode[] => {
      if (!t) return [];
      if (ts.isParenthesizedTypeNode(t)) return literalNames(t.type);
      if (ts.isUnionTypeNode(t)) return t.types.flatMap((x) => literalNames(x));
      return ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal) ? [t] : [];
    };
    const propNameInType = (lit: ts.LiteralTypeNode, comp: string, platform: Binding["platform"]) => {
      const name = (lit.literal as ts.StringLiteral).text;
      const rule = T.propRenames.find((r) => inList(r.components, comp) && r.from === name && kitMatches(r, platform) && (!r.handler || r.handler === "same"));
      const inv = T.booleanInversions.find((r) => inList(r.components, comp) && r.from === name);
      const target = rule?.to ?? inv?.to;
      if (target) {
        const q = lit.literal.getText(sf)[0]!;
        add({ start: lit.literal.getStart(sf), end: lit.literal.end }, "prop-rename", `${comp}.${name} → ${target}`, q + target + q);
        return;
      }
      const mp = T.manualProps.find((r) => inList(r.components, comp) && r.prop === name && kitMatches(r, platform));
      if (mp) manual(lit, comp, mp.ledger, `\`${name}\`: ${mp.note}`);
    };

    // a tag imported from a file that holds a forwarder (an import of `…/ShellHeader` for `ShellHeader`)
    const localImports = new Map<string, { imported: string; spec: string }>();
    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier) || !st.importClause) continue;
      const spec = st.moduleSpecifier.text;
      if (st.importClause.name) localImports.set(st.importClause.name.text, { imported: "default", spec });
      const nb = st.importClause.namedBindings;
      if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) localImports.set(el.name.text, { imported: (el.propertyName ?? el.name).text, spec });
    }
    const forwardedTag = (local: string): Forwarder | undefined => {
      const imp = localImports.get(local);
      if (!imp || parseKitSpec(imp.spec) || isViaSpec(imp.spec)) return undefined;
      const f = forwarders.get(imp.imported === "default" ? local : imp.imported);
      if (!f) return undefined;
      const last = imp.spec.split("/").filter(Boolean).pop() ?? "";
      return last.replace(/\.[^.]+$/, "") === f.base ? f : undefined;
    };
    const handleForwarded = (el: ts.JsxOpeningElement | ts.JsxSelfClosingElement, f: Forwarder) => {
      const through = ` (passed through \`${el.tagName.getText(sf)}\`)`;
      for (const p of el.attributes.properties) {
        if (!ts.isJsxAttribute(p) || !ts.isIdentifier(p.name)) continue;
        const name = p.name.text;
        const rename = T.propRenames.find((r) => inList(r.components, f.comp) && r.from === name && kitMatches(r, f.platform));
        if (rename) {
          manual(p, f.comp, rename.ledger, `\`${name}\` is \`${rename.to}\` on ${f.comp}${through}: rename it here`);
          continue;
        }
        const mp = T.manualProps.find((r) => inList(r.components, f.comp) && r.prop === name && kitMatches(r, f.platform));
        if (mp) manual(p, f.comp, mp.ledger, `\`${name}\`${through}: ${mp.note}`);
      }
    };

    const visit = (n: ts.Node) => {
      if (hasKit && ts.isTypeReferenceNode(n) && ts.isIdentifier(n.typeName) && (n.typeName.text === "Omit" || n.typeName.text === "Pick") && n.typeArguments?.length === 2) {
        const pc = propsTypeOf(n.typeArguments[0]);
        if (pc) for (const lit of literalNames(n.typeArguments[1])) propNameInType(lit, pc.comp, pc.platform);
      }
      if (hasKit && ts.isIndexedAccessTypeNode(n)) {
        const pc = propsTypeOf(n.objectType);
        if (pc) for (const lit of literalNames(n.indexType)) propNameInType(lit, pc.comp, pc.platform);
      }
      if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && hasKit) {
        const b = resolveTagBase(n.tagName as ts.Expression);
        if (b) handleElement(n, b);
      }
      if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && forwarders.size && ts.isIdentifier(n.tagName)) {
        const f = forwardedTag(n.tagName.text);
        if (f) handleForwarded(n, f);
      }
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && hasKit) {
        const b = bindings.get(n.expression.text);
        if (b?.imported === "resolveTokens" || (b && b.kit === "resolveTokens")) handleResolveTokens(n, b);
      }
      ts.forEachChild(n, visit);
    };

    const handleResolveTokens = (call: ts.CallExpression, b: Binding) => {
      const opts = call.arguments[2];
      if (!opts) return;
      const u = unwrap(opts);
      if (!ts.isObjectLiteralExpression(u)) return;
      const p = findProp(u, "brand");
      if (!p) return;
      let valueText: ((r: Render) => string) | undefined;
      if (ts.isShorthandPropertyAssignment(p)) valueText = () => p.name.text;
      else if (ts.isPropertyAssignment(p)) {
        const init = p.initializer;
        valueText = (r) => r(init.getStart(sf), init.end);
      }
      if (!valueText) {
        manual(p, "resolveTokens", "foundations.md", "`brand` option: pass { theme } made with defineTheme");
        return;
      }
      const make = themeFromBrand(b, valueText);
      add({ start: p.getStart(sf), end: p.end }, "root-brand", "resolveTokens { brand } → { theme: defineTheme(…) }", (r) => `theme: ${make(r)}`);
    };

    if (hasKit || forwarders.size) visit(sf);

    // -------------------------------------------------------------------------------------------------------------------
    // Imports and re-exports
    // -------------------------------------------------------------------------------------------------------------------

    const renamedLocals = new Map<string, string>();
    const importDecls = sf.statements.filter((st): st is ts.ImportDeclaration => ts.isImportDeclaration(st));
    const lastImport = importDecls[importDecls.length - 1];
    const quoteStyle = (() => {
      for (const d of importDecls) {
        const t = d.moduleSpecifier.getText(sf);
        return t[0] === '"' ? '"' : "'";
      }
      return "'";
    })();
    const semi = ";";
    const locallyBound = new Set<string>();
    for (const st of sf.statements) {
      if ((ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isClassDeclaration(st) || ts.isFunctionDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) locallyBound.add(st.name.text);
      else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) locallyBound.add(d.name.text);
    }
    for (const st of importDecls) {
      const c = st.importClause;
      if (c?.name) locallyBound.add(c.name.text);
      if (c?.namedBindings && ts.isNamedImports(c.namedBindings)) for (const el of c.namedBindings.elements) locallyBound.add(el.name.text);
    }
    // Each specifier changes in place (its own characters), never by rewriting the declaration: a rename is an edit of the identifier, a name that
    // moved to /shell or /chat is cut out and written in a new declaration after this one, a duplicate is cut out.
    const moves = new Map<string, string[]>(); // `${declaration.pos}|${target}` → the texts of the specifiers moved there

    const planSpecifiers = (
      node: ts.ImportDeclaration | ts.ExportDeclaration,
      spec: string,
      elements: readonly (ts.ImportSpecifier | ts.ExportSpecifier)[],
      reexport: boolean,
    ): boolean[] => {
      const keep = elements.map(() => true);
      const seen = new Set<string>();
      const siblings = new Set(elements.filter((x) => !x.propertyName).map((x) => x.name.text));
      elements.forEach((el, i) => {
        const imported = (el.propertyName ?? el.name).text;
        const local = el.name.text;
        const hasAlias = !!el.propertyName;
        let finalImported = imported;
        let finalLocal = local;
        const r = resolveImport(spec, imported);
        if (r) {
          const tr = T.typeRenames.find((x) => x.from === r.kit);
          const removed = T.removedNames.find((x) => x.name === r.kit);
          // through a wrapper's own alias the consumer's import is unchanged: the alias line in the wrapper is the one renamed
          const renameHere = tr && (r.direct || !r.aliased) && !r.extra;
          if (tr && renameHere) {
            if (!hasAlias) {
              if (locallyBound.has(tr.to) && !reexport && !siblings.has(tr.to)) {
                manual(el, undefined, tr.ledger, `\`${imported}\` is \`${tr.to}\` now, but \`${tr.to}\` is already a name in this file`);
              } else {
                add({ start: el.name.getStart(sf), end: el.name.end }, "type-rename", `${imported} → ${tr.to}`, tr.to);
                if (!reexport) renamedLocals.set(local, tr.to);
                finalImported = finalLocal = tr.to;
              }
            } else {
              add({ start: el.propertyName!.getStart(sf), end: el.propertyName!.end }, "type-rename", `${imported} → ${tr.to}`, tr.to);
              finalImported = tr.to;
            }
          } else if (removed && !r.extra) {
            manual(el, undefined, removed.ledger, `\`${removed.name}\`: ${removed.note}`);
          } else if (r.direct && (r.platform === "react" || r.platform === "native") && r.sub === "") {
            const kit = r.platform;
            const sub = (["shell", "chat"] as const).find((s) => T.moved[s][kit].includes(r.kit));
            if (sub) {
              const key = `${node.pos}|${T.PACKAGES[kit]}/${sub}`;
              moves.set(key, [...(moves.get(key) ?? []), el.getText(sf)]);
              keep[i] = false;
              bump("subpath-import", `${r.kit} → ${T.PACKAGES[kit]}/${sub}`);
              return;
            }
          } else if (!r.direct && !r.aliased && !r.extra && r.sub === "" && (r.platform === "react" || r.platform === "native")) {
            const kit = r.platform;
            const sub = (["shell", "chat"] as const).find((s) => T.moved[s][kit].includes(r.kit));
            if (sub && r.entry) {
              if (r.unknownEntry) manual(el, undefined, "foundations.md", `\`${r.kit}\` moved to \`${T.PACKAGES[kit]}/${sub}\`: ${via}'s entry was not read (pass --wrapper), so export it from there`);
              else addNeed(needs.subpaths, r.entry, sub);
            }
          }
        }
        const key = `${finalImported}|${finalLocal}|${el.isTypeOnly}`;
        if (seen.has(key)) keep[i] = false;
        else seen.add(key);
      });
      return keep;
    };

    // extra specifiers a rewrite needs (themes, defineTheme)
    const alreadyImported = (spec: string, name: string) => {
      for (const st of importDecls) {
        if (!ts.isStringLiteral(st.moduleSpecifier) || st.moduleSpecifier.text !== spec) continue;
        const nb = st.importClause?.namedBindings;
        if (nb && ts.isNamedImports(nb) && nb.elements.some((e) => (e.propertyName ?? e.name).text === name && e.name.text === name)) return true;
      }
      return false;
    };
    const coreAdded = new Set<string>();

    /** The edits that cut the dropped specifiers out of `elements`, with the comma that belongs to them. */
    const cutSpecifiers = (elements: readonly ts.Node[], keep: boolean[]) => {
      let i = 0;
      while (i < elements.length) {
        if (keep[i]) { i++; continue; }
        let j = i;
        while (j + 1 < elements.length && !keep[j + 1]) j++;
        if (j + 1 < elements.length) edits.push({ start: elements[i]!.getStart(sf), end: elements[j + 1]!.getStart(sf), rule: "import-edit", detail: "drop specifier", make: "" });
        else edits.push({ start: elements[i - 1]!.end, end: elements[j]!.end, rule: "import-edit", detail: "drop specifier", make: "" });
        i = j + 1;
      }
    };

    /** The declarations that hold what moved out of `node`, as text. */
    const movedDeclarations = (node: ts.ImportDeclaration | ts.ExportDeclaration, typeOnly: boolean, multi: boolean, exportForm: boolean): string[] => {
      const out: string[] = [];
      for (const [k, parts] of moves) {
        if (!k.startsWith(`${node.pos}|`)) continue;
        const target = k.slice(k.indexOf("|") + 1);
        const q = node.moduleSpecifier!.getText(sf)[0]!;
        const body = multi ? `{\n${parts.map((p) => `  ${p},`).join("\n")}\n}` : `{ ${parts.join(", ")} }`;
        out.push(`${exportForm ? "export" : "import"} ${typeOnly ? "type " : ""}${body} from ${q}${target}${q};`);
      }
      return out;
    };

    const finishDeclaration = (node: ts.ImportDeclaration | ts.ExportDeclaration, elements: readonly ts.Node[], keep: boolean[], hasDefault: boolean, typeOnly: boolean, multi: boolean, exportForm: boolean) => {
      const moved = movedDeclarations(node, typeOnly, multi, exportForm);
      if (!keep.some(Boolean) && !hasDefault) {
        const trailing = node.end < text.length && text[node.end] === "\n" ? 1 : 0;
        edits.push({ start: node.getStart(sf), end: node.end + (moved.length ? 0 : trailing), rule: "import-edit", detail: "the declaration is empty", make: moved.join("\n") });
        return;
      }
      cutSpecifiers(elements, keep);
      if (moved.length) edits.push({ start: node.end, end: node.end, rule: "import-edit", detail: "moved specifiers", make: "\n" + moved.join("\n") });
    };

    for (const st of sf.statements) {
      if (ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier)) {
        const spec = st.moduleSpecifier.text;
        if (!parseKitSpec(spec) && !isViaSpec(spec)) continue;
        const clause = st.importClause;
        const nb = clause?.namedBindings;
        if (!clause || !nb || !ts.isNamedImports(nb)) continue;
        const keep = planSpecifiers(st, spec, nb.elements, false);
        const multi = text.slice(nb.getStart(sf), nb.end).includes("\n");
        const adds = !clause.isTypeOnly ? [...(wantCore.get(spec) ?? [])].filter((n) => !alreadyImported(spec, n) && !coreAdded.has(`${spec}|${n}`)).sort() : [];
        const lastKept = [...nb.elements].reverse().find((_, k) => keep[nb.elements.length - 1 - k]);
        if (adds.length && lastKept) {
          for (const n of adds) coreAdded.add(`${spec}|${n}`);
          const sep = multi ? `,\n${indentAtPos(lastKept.getStart(sf))}` : ", ";
          edits.push({ start: lastKept.end, end: lastKept.end, rule: "import-edit", detail: "core names", make: adds.map((n) => sep + n).join("") });
        }
        finishDeclaration(st, nb.elements, keep, !!clause.name, clause.isTypeOnly, multi, false);
      } else if (ts.isExportDeclaration(st) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) && st.exportClause && ts.isNamedExports(st.exportClause)) {
        const spec = st.moduleSpecifier.text;
        if (!parseKitSpec(spec) && !isViaSpec(spec)) continue;
        const keep = planSpecifiers(st, spec, st.exportClause.elements, true);
        const multi = text.slice(st.exportClause.getStart(sf), st.exportClause.end).includes("\n");
        finishDeclaration(st, st.exportClause.elements, keep, false, st.isTypeOnly, multi, true);
      }
    }

    // core names no import could hold: one new declaration after the last import
    const byTarget = new Map<string, string[]>();
    for (const [spec, names] of wantCore) {
      const fresh = [...names].filter((n) => !alreadyImported(spec, n) && !coreAdded.has(`${spec}|${n}`));
      if (fresh.length) byTarget.set(spec, fresh.sort());
    }
    if (byTarget.size) {
      const decl = [...byTarget.entries()].map(([spec, names]) => `import { ${names.join(", ")} } from ${quoteStyle}${spec}${quoteStyle}${semi}`).join("\n");
      if (lastImport) edits.push({ start: lastImport.end, end: lastImport.end, rule: "import-edit", detail: "core imports", make: `\n${decl}` });
      else edits.push({ start: 0, end: 0, rule: "import-edit", detail: "core imports", make: `${decl}\n` });
    }

    // namespace imports: `UI.Theme`, `UI.NavRailKey`
    if (namespaces.size) {
      const visitNs = (n: ts.Node) => {
        if (ts.isQualifiedName(n) && ts.isIdentifier(n.left) && namespaces.has(n.left.text)) {
          const nsSpec = namespaces.get(n.left.text)!;
          const r = resolveImport(nsSpec, n.right.text);
          const tr = r && T.typeRenames.find((x) => x.from === r.kit);
          if (tr && r && !r.extra) add({ start: n.right.getStart(sf), end: n.right.end }, "type-rename", `${n.right.text} → ${tr.to}`, tr.to);
          const rm = r && T.removedNames.find((x) => x.name === r.kit);
          if (rm) manual(n, undefined, rm.ledger, `\`${rm.name}\`: ${rm.note}`);
        }
        ts.forEachChild(n, visitNs);
      };
      visitNs(sf);
    }

    // references to a renamed import
    if (renamedLocals.size) {
      const refs = (n: ts.Node) => {
        if (ts.isImportDeclaration(n)) return;
        if (ts.isExportDeclaration(n) && n.moduleSpecifier) return;
        if (ts.isIdentifier(n) && renamedLocals.has(n.text)) {
          const p = n.parent;
          const exportLocal = ts.isExportSpecifier(p) && !(p.parent.parent as ts.ExportDeclaration).moduleSpecifier && (p.propertyName ?? p.name) === n;
          if (exportLocal || !isPropertyNameIdentifier(n)) {
            if (!(ts.isParameter(p) && p.name === n) && !(ts.isVariableDeclaration(p) && p.name === n)) {
              // a reference follows its import: it is part of the import's rename, not an edit counted of its own
              edits.push({ start: n.getStart(sf), end: n.end, rule: "type-rename-ref", detail: n.text, make: renamedLocals.get(n.text)! });
            }
          }
        }
        ts.forEachChild(n, refs);
      };
      refs(sf);
    }

    return edits;
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// More helpers
// ---------------------------------------------------------------------------------------------------------------------

function indentAt(text: string, pos: number): string {
  const ls = text.lastIndexOf("\n", pos - 1) + 1;
  const m = /^[ \t]*/.exec(text.slice(ls, pos + 200));
  return m ? m[0] : "";
}

function isPropertyNameIdentifier(node: ts.Identifier): boolean {
  const p = node.parent;
  return (
    (ts.isPropertyAccessExpression(p) && p.name === node) ||
    (ts.isPropertyAssignment(p) && p.name === node) ||
    (ts.isBindingElement(p) && p.propertyName === node) ||
    ((ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p) || ts.isPropertySignature(p) || ts.isMethodSignature(p)) && p.name === node) ||
    (ts.isJsxAttribute(p) && p.name === node) ||
    (ts.isQualifiedName(p) && p.right === node) ||
    ts.isImportSpecifier(p) || ts.isExportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p)
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------------------------------

/** A unified diff of every changed file, made with `diff -u` on temporary copies outside the repository. */
export function unifiedDiff(result: Result): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "migrate-1-"));
  const out: string[] = [];
  try {
    let i = 0;
    for (const f of result.files) {
      const a = path.join(dir, `a${i}`), b = path.join(dir, `b${i}`);
      i++;
      fs.writeFileSync(a, f.before);
      fs.writeFileSync(b, f.after);
      const r = spawnSync("diff", ["-u", "--label", `a/${f.file}`, "--label", `b/${f.file}`, a, b], { encoding: "utf8" });
      out.push(r.stdout.trimEnd());
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  return out.join("\n");
}

const REPORTED_RULES: [string, string][] = [
  ["prop-rename", "props renamed"],
  ["invert-boolean", "booleans inverted"],
  ["value-rename", "values renamed"],
  ["add-attribute", "attributes added"],
  ["root-scheme", "root theme= → scheme="],
  ["root-brand", "brand → defineTheme"],
  ["theme-line", "theme={themes.antfabric} added"],
  ["content-children", "content → children"],
  ["item-field", "item fields renamed"],
  ["item-key", "item keys added"],
  ["styles-key", "styles parts renamed"],
  ["strings-placeholder", "string placeholders"],
  ["type-rename", "types renamed"],
  ["subpath-import", "imports moved to /shell or /chat"],
  ["wrapper-subpath", "wrapper: export * from a subpath"],
  ["wrapper-core-export", "wrapper: core exports added"],
];

/** The summary (files and edits per rule) and the manual list, as text. */
export function report(result: Result): string {
  const lines: string[] = [];
  const total = Object.entries(result.rules).reduce((n, [, c]) => n + c, 0);
  lines.push(`AntFabric UI 1.0 codemod: ${result.repo}${result.via ? ` via ${result.via}` : ""}${result.wrapper ? ` (wrapper ${result.wrapper})` : ""}`);
  lines.push(`Scanned ${result.scanned} files, ${result.importing} import the kit; ${result.files.length} change, ${total} edits.`);
  lines.push("");
  lines.push("Edits per rule");
  const known = new Set(REPORTED_RULES.map(([r]) => r));
  for (const [rule, label] of REPORTED_RULES) {
    const n = result.rules[rule];
    if (!n) continue;
    lines.push(`  ${String(n).padStart(4)}  ${label}`);
    const det = Object.entries(result.details[rule] ?? {}).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    for (const [d, c] of det) lines.push(`        ${String(c).padStart(4)}  ${d}`);
  }
  for (const rule of Object.keys(result.rules)) if (!known.has(rule) && !["import-edit"].includes(rule) && result.rules[rule]) lines.push(`  ${String(result.rules[rule]).padStart(4)}  ${rule}`);
  lines.push("");
  lines.push("Files changed");
  const perFile = result.files.map((f) => `  ${String(f.edits).padStart(4)}  ${f.file}`);
  lines.push(...(perFile.length ? perFile : ["  (none)"]));
  lines.push("");
  lines.push(`Manual list (${result.manual.length}): what the codemod did not change, with the ledger file that says what to do`);
  if (!result.manual.length) lines.push("  (none)");
  for (const m of result.manual) lines.push(`  ${m.file}:${m.line}  ${m.component ? m.component + "  " : ""}[${m.ledger}]  ${m.note}`);
  lines.push("");
  lines.push(`Defaults that changed (${result.defaults.length}): nothing was changed here; look at how these draw`);
  if (!result.defaults.length) lines.push("  (none)");
  for (const m of result.defaults) lines.push(`  ${m.file}:${m.line}  ${m.component}  [${m.ledger}]  ${m.note}`);
  return lines.join("\n") + "\n";
}

export function writeFiles(result: Result): void {
  for (const f of result.files) fs.writeFileSync(path.join(result.repo, f.file), f.after);
}
