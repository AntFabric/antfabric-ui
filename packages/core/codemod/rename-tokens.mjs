#!/usr/bin/env node
/**
 * af-tokens-codemod: rewrites renamed AntFabric UI token names in your source.
 *
 *   npx af-tokens-codemod <dir|file>… [--dry] [--strings] [--prose] [--ext ts,tsx,css]
 *
 * What it rewrites, from the list the packages ship (`@antfabric/ui-core/renames.json`, old path → new path):
 *   t.fg.muted                 → t.color.text.muted            (also `theme.t.…`, `tokens.…`: any chain that starts at `t` or ends in `.t`)
 *   "$fg.muted"                → "$color.text.muted"           (a token reference in a recipe override or a prop)
 *   --af-fg-muted              → --af-color-text-muted         (CSS variables, in any file)
 *   --strings: "fg.muted"      → "color.text.muted"            (a quoted string that is exactly an old path: keys of a flat override map)
 *   --prose:   fg.muted        → color.text.muted              (a bare path in comments and docs)
 *
 * What it does not: a nested theme override (`tokens: { schemes: { light: { fg: { muted: … } } } }`). Those keep working until the next
 * major version (`defineTheme` warns once and names the new path); it lists the files where it sees one so you can move them by hand.
 *
 * `--dry` prints what would change and writes nothing; the exit code is 1 when anything would. Zero dependencies.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const targets = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--ext" && args[i - 1] !== "--map");
const EXT = new Set(option("--ext", "ts,tsx,js,jsx,mjs,cjs,mts,cts,css,scss,html,vue,svelte,astro,md,mdx,json").split(",").map((e) => `.${e}`));
const renames = JSON.parse(readFileSync(option("--map", new URL("../renames.json", import.meta.url)), "utf8"));

const kebab = (path) => path.replace(/\./g, "-").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const vars = new Map(Object.entries(renames).map(([old, now]) => [`--af-${kebab(old)}`, `--af-${kebab(now)}`]));
const olds = Object.keys(renames).sort((a, b) => b.length - a.length);
const groups = new Set(olds.map((p) => p.split(".")[0]));

/** One file's text with every renamed name rewritten, and how many were. */
export function rewrite(text, { strings = false, prose = false } = {}) {
  let count = 0;
  const hit = (now) => (count++, now);
  // t.fg.muted, theme.t.fg.muted, tokens.fg.muted: the longest prefix of the chain that is an old path.
  text = text.replace(/(?<![\w$])((?:[\w$]+\.)*?(?:t|tokens))((?:\.[A-Za-z_$][\w$]*)+)/g, (all, root, chain) => {
    const keys = chain.slice(1).split(".");
    for (let n = keys.length; n >= 2; n--) {
      const path = keys.slice(0, n).join(".");
      if (Object.prototype.hasOwnProperty.call(renames, path)) return hit(`${root}.${renames[path]}${n < keys.length ? `.${keys.slice(n).join(".")}` : ""}`);
    }
    return all;
  });
  // "$fg.muted"
  text = text.replace(/\$([A-Za-z_][\w]*(?:\.[\w]+)+)(?![\w.])/g, (all, path) => (Object.prototype.hasOwnProperty.call(renames, path) ? hit(`$${renames[path]}`) : all));
  // --af-fg-muted
  text = text.replace(/--af-[a-z0-9]+(?:-[a-z0-9]+)*/g, (name) => (vars.has(name) ? hit(vars.get(name)) : name));
  if (strings) text = text.replace(/(["'`])([A-Za-z_][\w]*(?:\.[\w]+)+)\1/g, (all, q, path) => (Object.prototype.hasOwnProperty.call(renames, path) ? hit(`${q}${renames[path]}${q}`) : all));
  if (prose)
    text = text.replace(/(?<![\w$.\-/{])([A-Za-z_][\w]*(?:\.[A-Za-z0-9_]+)+)(?![\w]|\.[\w]|\()/g, (all, path) => (Object.prototype.hasOwnProperty.call(renames, path) ? hit(renames[path]) : all));
  return { text, count };
}

/** A nested override the codemod leaves alone: an object key that is an old group, inside something that looks like a theme's tokens. */
const nested = (text) => /\b(?:schemes|profiles|shared)\s*:/.test(text) && [...groups].some((g) => new RegExp(`(?<![\\w.$])${g}\\s*:\\s*\\{`).test(text));

function files(path, out = []) {
  const s = statSync(path);
  if (s.isDirectory()) {
    for (const f of readdirSync(path)) if (f !== "node_modules" && f !== "dist" && f !== ".git") files(join(path, f), out);
  } else if (EXT.has(extname(path))) out.push(path);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("af-tokens-codemod")) {
  if (!targets.length) {
    console.error("usage: af-tokens-codemod <dir|file>… [--dry] [--strings] [--prose] [--ext ts,tsx,css]");
    process.exit(2);
  }
  let total = 0;
  const byHand = [];
  for (const file of targets.flatMap((t) => files(t))) {
    const before = readFileSync(file, "utf8");
    const { text, count } = rewrite(before, { strings: flag("--strings"), prose: flag("--prose") });
    if (nested(text)) byHand.push(file);
    if (!count) continue;
    total += count;
    console.log(`${flag("--dry") ? "would rewrite" : "rewrote"} ${count} in ${file}`);
    if (!flag("--dry")) writeFileSync(file, text);
  }
  console.log(`${total} name(s) ${flag("--dry") ? "to rewrite" : "rewritten"} (${Object.keys(renames).length} renames known).`);
  if (byHand.length) console.log(`A theme's nested token overrides may still use old groups in: ${byHand.join(", ")}. They keep working until the next major version; move them by hand.`);
  process.exit(flag("--dry") && total ? 1 : 0);
}
