/**
 * A small TSX highlighter for the catalogue's code blocks: comments, strings, keywords, JSX tags,
 * attributes and numbers, as spans the stylesheet colours. The same function runs at build time
 * (Code.astro) and in the islands (the playground's usage), so every block reads the same.
 */

const KEYWORDS = new Set(
  "import export from default const let var function return if else for while do switch case break continue new typeof instanceof in of as type interface extends implements class this null undefined true false async await try catch finally throw void readonly keyof enum declare satisfies".split(
    " ",
  ),
);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const span = (cls: string, s: string) => `<span class="hl-${cls}">${esc(s)}</span>`;

const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?)([A-Za-z][\w.]*)|([A-Za-z_$][\w$]*)(?=\s*=\s*[{"'])|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)/g;

export function highlight(code: string): string {
  let out = "";
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    out += esc(code.slice(last, m.index));
    last = m.index! + m[0].length;
    const [all, comment, str, open, tag, attr, num, word] = m;
    if (comment) out += span("c", comment);
    else if (str) out += span("s", str);
    else if (open) out += esc(open) + span(/^[A-Z]/.test(tag!) ? "t" : "h", tag!);
    else if (attr) out += span("a", attr);
    else if (num) out += span("n", num);
    else if (word && KEYWORDS.has(word)) out += span("k", word);
    else if (word && /^[A-Z]/.test(word)) out += span("t", word);
    else out += esc(all);
  }
  return out + esc(code.slice(last));
}
