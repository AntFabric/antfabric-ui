/**
 * What a kit file does with its built-in text, read from the TypeScript syntax tree (no regular expressions over source): the `useStrings("<id>", …)`
 * bindings, every call of a binding (`s("key", vars)`, `s.parts("key", vars)`, under any name), the keys each call can read, the variables it
 * passes, and whether its result is used. `check.tsx` compares that with `defaultStrings`.
 */
import ts from "typescript";

/** One `const s = useStrings("<id>", <instance>)`. */
export interface StringsBinding {
  name: string;
  id: string;
  /** The source text of the second argument, `undefined` when there is none. */
  instance: string | undefined;
  line: number;
  /** The nearest function (or the file) around the declaration: where the name means this binding. */
  scope: ts.Node;
  /** The declaration's name: a reference inside a block that also holds it is the binding's own, not a shadow. */
  decl: ts.Node;
}

/** One call of a binding. */
export interface StringsRead {
  binding: StringsBinding;
  line: number;
  /** `s.parts(…)` rather than `s(…)`. */
  parts: boolean;
  /**
   * What the key argument can be: a list of literal keys, a `pattern` (a template literal `` `prefix${x}` `` that any key matching it satisfies), or
   * `null` when the argument is an expression the check cannot follow (a parameter, a call).
   */
  keys: string[] | null;
  patterns: RegExp[];
  /** The variable names the call passes, or `null` when it passes something that is not an object literal of plain properties. */
  vars: string[] | null;
  /** The call's result is thrown away (`void s("select")`, or a bare `s("select");`). */
  discarded: boolean;
  /** The source text of the key argument, for a message. */
  text: string;
}

export interface FileStrings {
  bindings: StringsBinding[];
  /** `useStrings(…)` written in a form the check cannot read: no name, or a first argument that is not a plain string. */
  unreadable: { line: number; text: string }[];
  reads: StringsRead[];
  /** A binding used other than as `s(…)` / `s.parts(…)`: passed to a function, kept in an object. The check cannot see what is read through it. */
  loose: { name: string; line: number }[];
}

const FUNCTIONS = new Set<ts.SyntaxKind>([ts.SyntaxKind.FunctionDeclaration, ts.SyntaxKind.FunctionExpression, ts.SyntaxKind.ArrowFunction, ts.SyntaxKind.MethodDeclaration]);

const lineOf = (sf: ts.SourceFile, node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

/** The scope a declaration is in: its nearest enclosing function, or the file. */
function scopeOf(node: ts.Node): ts.Node {
  for (let n = node.parent; n; n = n.parent) if (FUNCTIONS.has(n.kind) || ts.isSourceFile(n)) return n;
  return node.getSourceFile();
}

const unwrap = (e: ts.Expression): ts.Expression => {
  let x = e;
  while (ts.isParenthesizedExpression(x) || ts.isAsExpression(x) || ts.isNonNullExpression(x) || ts.isSatisfiesExpression(x) || ts.isTypeAssertionExpression(x)) x = x.expression;
  return x;
};

/** A template literal `` `a${x}b` `` as a pattern: the keys it can name are the ones that start `a` and end `b`. */
function patternOf(t: ts.TemplateExpression): RegExp {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${esc(t.head.text)}${t.templateSpans.map((s) => `\\w*${esc(s.literal.text)}`).join("")}$`);
}

interface Resolved {
  keys: string[];
  patterns: RegExp[];
  /** Some part of the expression could not be followed. */
  open: boolean;
}

/** Every string literal inside an initializer: an object's values, an array's items, a conditional's branches. */
function literalsIn(node: ts.Node, out: Resolved, seen: Set<ts.Node>, sf: ts.SourceFile) {
  if (seen.has(node)) return;
  seen.add(node);
  if (ts.isStringLiteralLike(node)) return void out.keys.push(node.text);
  if (ts.isTemplateExpression(node)) return void out.patterns.push(patternOf(node));
  if (ts.isObjectLiteralExpression(node)) {
    for (const p of node.properties) {
      if (ts.isPropertyAssignment(p)) literalsIn(p.initializer, out, seen, sf);
      else if (ts.isShorthandPropertyAssignment(p)) resolveIdentifier(p.name, out, seen, sf);
      else out.open = true;
    }
    return;
  }
  if (ts.isArrayLiteralExpression(node)) {
    for (const e of node.elements) literalsIn(e, out, seen, sf);
    return;
  }
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node) || ts.isSatisfiesExpression(node)) return literalsIn(node.expression, out, seen, sf);
  if (ts.isConditionalExpression(node)) {
    literalsIn(node.whenTrue, out, seen, sf);
    literalsIn(node.whenFalse, out, seen, sf);
    return;
  }
  if (ts.isBinaryExpression(node) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(node.operatorToken.kind)) {
    literalsIn(node.left, out, seen, sf);
    literalsIn(node.right, out, seen, sf);
    return;
  }
  if (ts.isIdentifier(node)) return resolveIdentifier(node, out, seen, sf);
  if (ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) return literalsIn(node.expression, out, seen, sf);
  if (ts.isNumericLiteral(node) || node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword || node.kind === ts.SyntaxKind.NullKeyword || node.kind === ts.SyntaxKind.UndefinedKeyword) return;
  out.open = true;
}

/** An identifier as the literals of the `const` it names, or the literal union a parameter is typed as. Anything else is open. */
function resolveIdentifier(id: ts.Identifier, out: Resolved, seen: Set<ts.Node>, sf: ts.SourceFile) {
  if (id.text === "undefined") return;
  // Find the declaration by name in the file: the nearest `const` or typed parameter in an enclosing scope.
  let found: ts.Node | undefined;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === id.text && n.initializer) found = n.initializer;
    else if (ts.isParameter(n) && ts.isIdentifier(n.name) && n.name.text === id.text && n.type && FUNCTIONS.has(n.parent.kind) && contains(n.parent, id)) found = n.type;
    if (!found) ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!found) return void (out.open = true);
  if (ts.isTypeNode(found)) return typeLiterals(found, out);
  literalsIn(found, out, seen, sf);
}

const contains = (outer: ts.Node, inner: ts.Node) => inner.pos >= outer.pos && inner.end <= outer.end;

/** A literal union (`"a" | "b"`) as its keys; any other type leaves it open. */
function typeLiterals(t: ts.TypeNode, out: Resolved) {
  if (ts.isLiteralTypeNode(t) && ts.isStringLiteralLike(t.literal)) return void out.keys.push(t.literal.text);
  if (ts.isUnionTypeNode(t)) return void t.types.forEach((x) => typeLiterals(x, out));
  if (ts.isParenthesizedTypeNode(t)) return typeLiterals(t.type, out);
  out.open = true;
}

/** The variables of a call's second argument, `null` when they cannot be told. */
function varsOf(arg: ts.Expression | undefined): string[] | null {
  if (!arg) return [];
  const x = unwrap(arg);
  if (!ts.isObjectLiteralExpression(x)) return null;
  const names: string[] = [];
  for (const p of x.properties) {
    if ((ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p) || ts.isMethodDeclaration(p)) && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name))) names.push(p.name.text);
    else return null;
  }
  return names;
}

/** Is a call's value dropped: a statement of its own, `void` of it, or the left of a comma. */
function discarded(call: ts.Node): boolean {
  let n: ts.Node = call;
  for (;;) {
    const p: ts.Node = n.parent;
    if (ts.isParenthesizedExpression(p) || ts.isVoidExpression(p) || ts.isNonNullExpression(p) || ts.isAsExpression(p)) n = p;
    else if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.CommaToken && p.left === n) return true;
    else return ts.isExpressionStatement(p);
  }
}

const declaresName = (list: ts.VariableDeclarationList | ts.ForInitializer | undefined, name: string) =>
  !!list && ts.isVariableDeclarationList(list) && list.declarations.some((d) => ts.isIdentifier(d.name) && d.name.text === name);

/** Does this scope declare `name` itself: a parameter, a `const`/`let` of its block, a loop's variable, a `catch` variable? */
function declares(n: ts.Node, name: string): boolean {
  if (FUNCTIONS.has(n.kind)) return (n as ts.FunctionLikeDeclaration).parameters.some((p) => ts.isIdentifier(p.name) && p.name.text === name);
  if (ts.isBlock(n) || ts.isCaseBlock(n)) {
    const statements = ts.isBlock(n) ? n.statements : n.clauses.flatMap((c) => [...c.statements]);
    return statements.some((st) => ts.isVariableStatement(st) && declaresName(st.declarationList, name));
  }
  if (ts.isForStatement(n) || ts.isForOfStatement(n) || ts.isForInStatement(n)) return declaresName(n.initializer, name);
  if (ts.isCatchClause(n)) return !!n.variableDeclaration && ts.isIdentifier(n.variableDeclaration.name) && n.variableDeclaration.name.text === name;
  return false;
}

/** Is `id` (a reference to `binding.name`) shadowed by something declared between it and the binding's own scope? */
function shadowed(id: ts.Identifier, binding: StringsBinding): boolean {
  for (let n = id.parent; n && n !== binding.scope; n = n.parent) if (!contains(n, binding.decl) && declares(n, binding.name)) return true;
  return false;
}

/** Read a kit file's use of `useStrings`. */
export function readStrings(fileName: string, source: string): FileStrings {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, fileName.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: FileStrings = { bindings: [], unreadable: [], reads: [], loose: [] };
  const decls = new Set<ts.Node>();
  // The bindings.
  const find = (n: ts.Node) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "useStrings") {
      const first = n.arguments[0];
      const decl = n.parent && ts.isVariableDeclaration(n.parent) && n.parent.initializer === n ? n.parent : undefined;
      if (decl && ts.isIdentifier(decl.name) && first && ts.isStringLiteralLike(first)) {
        decls.add(decl.name);
        out.bindings.push({ name: decl.name.text, id: first.text, instance: n.arguments[1]?.getText(sf), line: lineOf(sf, n), scope: scopeOf(decl), decl: decl.name });
      } else out.unreadable.push({ line: lineOf(sf, n), text: n.getText(sf).slice(0, 80) });
    }
    ts.forEachChild(n, find);
  };
  find(sf);
  if (!out.bindings.length) return out;
  const bindingFor = (id: ts.Identifier): StringsBinding | undefined => {
    let best: StringsBinding | undefined;
    for (const b of out.bindings) {
      if (b.name !== id.text || !contains(b.scope, id) || decls.has(id) || shadowed(id, b)) continue;
      if (!best || (b.scope.end - b.scope.pos) < (best.scope.end - best.scope.pos)) best = b;
    }
    return best;
  };
  // The calls, and every other use of a binding's name.
  const visit = (n: ts.Node) => {
    if (ts.isIdentifier(n) && !decls.has(n)) {
      const b = bindingFor(n);
      const p = n.parent;
      // A property name or a key (`{ s: 1 }`, `x.s`) is not a reference.
      const named = (ts.isPropertyAccessExpression(p) && p.name === n) || (ts.isPropertyAssignment(p) && p.name === n) || (ts.isJsxAttribute(p) && p.name === n);
      if (b && !named) {
        const call = ts.isCallExpression(p) && p.expression === n ? p : ts.isPropertyAccessExpression(p) && p.expression === n && p.name.text === "parts" && ts.isCallExpression(p.parent) && p.parent.expression === p ? p.parent : undefined;
        if (!call) {
          // A dependency list (`[s]`) reads nothing.
          if (!ts.isArrayLiteralExpression(p)) out.loose.push({ name: n.text, line: lineOf(sf, n) });
        } else {
          const arg = call.arguments[0];
          const resolved: Resolved = { keys: [], patterns: [], open: false };
          if (arg) literalsIn(arg, resolved, new Set(), sf);
          else resolved.open = true;
          out.reads.push({
            binding: b,
            line: lineOf(sf, call),
            parts: call.expression !== n,
            keys: resolved.open ? null : [...new Set(resolved.keys)],
            patterns: resolved.patterns,
            vars: varsOf(call.arguments[1]),
            discarded: discarded(call),
            text: arg ? arg.getText(sf).slice(0, 60) : "",
          });
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

/** The placeholders a template names: `{name}` (not the escaped `{{`), over every plural form; `count` is always one of a plural's. */
export function placeholdersOf(template: string | Record<string, string>): { names: Set<string>; plural: boolean } {
  const forms = typeof template === "string" ? [template] : Object.values(template);
  const names = new Set<string>();
  for (const f of forms) for (const m of f.matchAll(/\{\{|\}\}|\{(\w+)\}/g)) if (m[1]) names.add(m[1]);
  if (typeof template !== "string") names.add("count");
  return { names, plural: typeof template !== "string" };
}
