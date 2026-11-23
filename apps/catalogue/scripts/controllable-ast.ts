/**
 * What a kit file passes to `useControllable(value, onEvent)`, read from the TypeScript syntax tree (no regular expressions over source): for
 * each call, the prop its first argument is bound to in the enclosing function's destructured props (`checked` for `{ checked: checkedProp }`),
 * whether that binding has a default (`checked = false`), and the prop its second argument is bound to (`onCheckedChange`). `check.tsx` holds
 * the docs' `changes:` and the `controllable-default` convention against it.
 */
import ts from "typescript";

/** One `useControllable(…)` call. */
export interface ControllableCall {
  line: number;
  /** The first argument's source text. */
  arg: string;
  /** The prop the first argument is: its property in the enclosing function's destructured props, `undefined` when it is not one. */
  prop: string | undefined;
  /** That binding has a default (`checked = false`): handler-only would then be controlled at the default. */
  defaulted: boolean;
  /** The event the second argument is, resolved the same way (its own name when it is not a destructured prop); `undefined` when there is none. */
  handler: string | undefined;
}

const FUNCTIONS = new Set<ts.SyntaxKind>([ts.SyntaxKind.FunctionDeclaration, ts.SyntaxKind.FunctionExpression, ts.SyntaxKind.ArrowFunction, ts.SyntaxKind.MethodDeclaration]);

const lineOf = (sf: ts.SourceFile, node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

/** The element of an object binding pattern (`{ a, b: c = 1 }`) that binds `name`, at its top level. */
function elementBinding(pattern: ts.BindingName, name: string): ts.BindingElement | undefined {
  if (!ts.isObjectBindingPattern(pattern)) return undefined;
  return pattern.elements.find((e) => ts.isIdentifier(e.name) && e.name.text === name);
}

/** The destructured prop `name` is in the nearest enclosing function that binds it: from its first parameter, or `const { … } = props` in its body. */
function bindingOf(call: ts.Node, name: string): ts.BindingElement | undefined {
  for (let n = call.parent; n; n = n.parent) {
    if (!FUNCTIONS.has(n.kind)) continue;
    const fn = n as ts.FunctionLikeDeclaration;
    const first = fn.parameters[0];
    const fromParam = first && elementBinding(first.name, name);
    if (fromParam) return fromParam;
    if (fn.body && ts.isBlock(fn.body)) {
      for (const st of fn.body.statements) {
        if (!ts.isVariableStatement(st)) continue;
        for (const d of st.declarationList.declarations) {
          const e = elementBinding(d.name, name);
          if (e) return e;
        }
      }
    }
  }
  return undefined;
}

const propName = (e: ts.BindingElement): string | undefined => {
  const key = e.propertyName ?? e.name;
  return ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : undefined;
};

/** Every `useControllable(…)` call in a kit file, with the props it reads. */
export function readControllable(fileName: string, source: string): ControllableCall[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, fileName.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: ControllableCall[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "useControllable") {
      const [value, handler] = n.arguments;
      const bound = value && ts.isIdentifier(value) ? bindingOf(n, value.text) : undefined;
      const handled = handler && ts.isIdentifier(handler) ? bindingOf(n, handler.text) : undefined;
      out.push({
        line: lineOf(sf, n),
        arg: value ? value.getText(sf) : "",
        prop: bound && propName(bound),
        defaulted: !!bound?.initializer,
        handler: handled ? propName(handled) : handler && ts.isIdentifier(handler) ? handler.text : undefined,
      });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}
