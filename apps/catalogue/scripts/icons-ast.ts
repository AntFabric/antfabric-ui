/**
 * The icon names a kit file draws, read from the TypeScript syntax tree (no regular expressions over source): every string literal that flows
 * to `<Icon name>`, to a JSX prop whose name says icon (`icon`, `iconLeading`, `triggerIcon`), or to an object property or a default so named
 * (`{ icon: "x" }`, `icon = "x"`), following names declared in the same file: a ternary (`tone === "danger" ? "circle-alert" : "info"`), a
 * map read by key (`ICONS[tone]`), a list of tuples read in a `.map` (`formats.map((tool) => <IconButton icon={tool[1]} />)`) and a local
 * helper's argument (`meta("pencil")` for `const meta = (named) => <Icon name={named} />`). `check.tsx` holds each against the kit's
 * built-in registry (`src/lib/icons.ts`): a name the kit draws that an app has not registered would otherwise draw an empty box.
 */
import ts from "typescript";

/** One name the file can draw, or a template literal that builds one (`chevron-${dir}`), which no registry can be checked against. */
export interface IconNameUse {
  name: string;
  line: number;
  /** A template with substitutions: `name` is its source text. */
  dynamic: boolean;
}

/** `icon`, `iconLeading`, `triggerIcon`, `actionIcon`: a prop or property that holds an icon. */
const ICONISH = /^icon(Leading|Trailing)?$|^[a-z]+Icon$/;

/** A step into a value: a property or an index, `"*"` any property, `"[]"` any element of an array. */
type Step = string | number;

const lineOf = (sf: ts.SourceFile, node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

const keyText = (n: ts.PropertyName | ts.BindingName | undefined): string | undefined =>
  n && (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isNumericLiteral(n)) ? n.text : undefined;

const unwrap = (e: ts.Expression): ts.Expression =>
  ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e) || ts.isTypeAssertionExpression(e) ? unwrap(e.expression) : e;

const ARRAY_CALLBACKS = new Set(["map", "flatMap", "forEach", "filter", "find", "some", "every"]);

/** Every icon name `fileName` can draw. */
export function readIconNames(fileName: string, source: string): IconNameUse[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, fileName.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  // Every same-file binding by name (no scopes: a name bound twice is followed to both), and every call of a local function by its name.
  const bindings = new Map<string, ts.Node[]>();
  const calls = new Map<string, ts.CallExpression[]>();
  const index = (n: ts.Node): void => {
    if ((ts.isVariableDeclaration(n) || ts.isParameter(n) || ts.isBindingElement(n)) && ts.isIdentifier(n.name)) bindings.set(n.name.text, [...(bindings.get(n.name.text) ?? []), n]);
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) calls.set(n.expression.text, [...(calls.get(n.expression.text) ?? []), n]);
    ts.forEachChild(n, index);
  };
  index(sf);

  const out = new Map<string, IconNameUse>();
  const seen = new Set<string>();

  /** The literals `node` can hold at `path` (what is read out of it), for a declaration rather than an expression. */
  const fromBinding = (b: ts.Node, path: Step[]): void => {
    // A destructured name: the path from the pattern's root to it, then the root's value.
    let steps = path;
    let n: ts.Node = b;
    if (ts.isBindingElement(n) && n.initializer && path.length === 0) values(n.initializer, []);
    while (ts.isBindingElement(n)) {
      const pattern = n.parent;
      const step: Step = ts.isArrayBindingPattern(pattern) ? pattern.elements.indexOf(n) : (keyText(n.propertyName) ?? keyText(n.name) ?? "*");
      steps = [step, ...steps];
      n = pattern.parent;
    }
    if (ts.isVariableDeclaration(n)) {
      if (n.initializer) values(n.initializer, steps);
      return;
    }
    if (!ts.isParameter(n)) return;
    if (n.initializer && steps.length === path.length) values(n.initializer, path);
    const fn = n.parent;
    if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn) && !ts.isFunctionDeclaration(fn)) return;
    const at = fn.parameters.indexOf(n);
    // A callback over a list: `list.map((item) => …)` reads an element of `list`.
    const call = fn.parent;
    if (at === 0 && ts.isCallExpression(call) && call.arguments[0] === fn && ts.isPropertyAccessExpression(call.expression) && ARRAY_CALLBACKS.has(call.expression.name.text)) {
      values(call.expression.expression, ["[]", ...steps]);
      return;
    }
    // A local helper: what each call passes.
    const name = ts.isFunctionDeclaration(fn) ? fn.name?.text : ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name) ? fn.parent.name.text : undefined;
    for (const c of (name && calls.get(name)) || []) if (c.arguments[at]) values(c.arguments[at]!, steps);
  };

  /** The literals `e` can hold at `path`. */
  const values = (raw: ts.Expression, path: Step[]): void => {
    if (path.length > 4) return;
    const e = unwrap(raw);
    const key = `${e.pos}:${e.end}:${path.join(".")}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) {
      if (path.length === 0 && e.text) out.set(`${e.text}@${lineOf(sf, e)}`, { name: e.text, line: lineOf(sf, e), dynamic: false });
      return;
    }
    if (ts.isTemplateExpression(e)) {
      if (path.length === 0) out.set(`${e.getText(sf)}@${lineOf(sf, e)}`, { name: e.getText(sf), line: lineOf(sf, e), dynamic: true });
      return;
    }
    if (ts.isIdentifier(e)) {
      for (const b of bindings.get(e.text) ?? []) fromBinding(b, path);
      return;
    }
    if (ts.isPropertyAccessExpression(e)) return values(e.expression, [e.name.text, ...path]);
    if (ts.isElementAccessExpression(e)) {
      const k = unwrap(e.argumentExpression);
      return values(e.expression, [ts.isNumericLiteral(k) ? Number(k.text) : ts.isStringLiteral(k) ? k.text : "*", ...path]);
    }
    if (ts.isConditionalExpression(e)) return (values(e.whenTrue, path), values(e.whenFalse, path));
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken) return (values(e.left, path), values(e.right, path));
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) return values(e.right, path);
      return;
    }
    if (ts.isArrayLiteralExpression(e)) {
      const [step, ...rest] = path;
      e.elements.forEach((el, i) => {
        if (ts.isSpreadElement(el)) values(el.expression, path);
        else if (ts.isOmittedExpression(el)) return;
        else if (step === "[]" || step === "*" || step === i) values(el, rest);
      });
      return;
    }
    if (ts.isObjectLiteralExpression(e)) {
      const [step, ...rest] = path;
      if (step === undefined || typeof step === "number" || step === "[]") return;
      for (const p of e.properties) {
        if (ts.isSpreadAssignment(p)) values(p.expression, path);
        else if (ts.isShorthandPropertyAssignment(p) && (step === "*" || p.name.text === step)) values(p.name, rest);
        else if (ts.isPropertyAssignment(p) && (step === "*" || keyText(p.name) === step || ts.isComputedPropertyName(p.name))) values(p.initializer, rest);
      }
    }
    // A call, a function, JSX, a number: not a name this file spells.
  };

  const visit = (n: ts.Node): void => {
    if (ts.isJsxAttribute(n) && n.initializer) {
      const attr = keyText(n.name as ts.Identifier) ?? "";
      const tag = (n.parent.parent as ts.JsxOpeningLikeElement).tagName.getText(sf);
      if (ICONISH.test(attr) || (tag === "Icon" && attr === "name")) {
        const init = n.initializer;
        if (ts.isStringLiteral(init)) values(init, []);
        else if (ts.isJsxExpression(init) && init.expression) values(init.expression, []);
      }
    } else if (ts.isPropertyAssignment(n) && ICONISH.test(keyText(n.name) ?? "")) values(n.initializer, []);
    else if (ts.isShorthandPropertyAssignment(n) && ICONISH.test(n.name.text)) values(n.name, []);
    else if ((ts.isBindingElement(n) || ts.isParameter(n)) && n.initializer && ICONISH.test((ts.isBindingElement(n) ? keyText(n.propertyName) : undefined) ?? keyText(n.name) ?? "")) values(n.initializer, []);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return [...out.values()].sort((a, b) => a.line - b.line);
}

/** The lucide export names a kit's `src/lib/icons.ts` registers: the shorthand properties (`{ Trash2, X }`) of the object its registry is built from. */
export function readIconRegistry(source: string): Set<string> {
  const sf = ts.createSourceFile("icons.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out = new Set<string>();
  const visit = (n: ts.Node): void => {
    if (ts.isShorthandPropertyAssignment(n)) out.add(n.name.text);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}
