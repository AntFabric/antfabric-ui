/**
 * The two guides, read from `CONSUMING.md` (`/install`) and `MIGRATION.md` (`/migrate`) at the repository
 * root when the site builds. The pages and the search index both read them through here, so a heading
 * is the same everywhere: each `##` is a step, its anchor is `slug(text)` (the one search and
 * `search-box.ts` use), and a link to a file in the repository points at GitHub instead of at a path the
 * site doesn't have (`CONSUMING.md` and `MIGRATION.md` point at their own pages).
 */

import { compiledContent } from "../../../../CONSUMING.md";
import { compiledContent as migrationContent } from "../../../../MIGRATION.md";
import { slug } from "./search";

/** Where a repository file is on GitHub, for the guide's relative links. */
export const REPO_BLOB = "https://github.com/AntFabric/antfabric-ui/blob/main";
export const REPO_TREE = "https://github.com/AntFabric/antfabric-ui/tree/main";

export interface InstallStep {
  /** The heading as written: `1. Install`. */
  text: string;
  id: string;
  /** The section, `<h2 id>` first. */
  html: string;
}

export interface Install {
  title: string;
  /** What comes before the first `##`, without the h1. */
  lead: string;
  steps: InstallStep[];
}

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|#x27);/g, (_, e: string) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", "#x27": "'" })[e]!)
    .replace(/\s+/g, " ")
    .trim();

/** A link that is not a URL, an absolute path of the site or a fragment is a file of the repository. */
function rewriteLinks(html: string) {
  return html.replace(/(<a\b[^>]*?\shref=)"([^"]*)"/g, (all, head: string, href: string) => {
    if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) return all;
    if (href === "CONSUMING.md") return `${head}"/install"`;
    if (href === "MIGRATION.md") return `${head}"/migrate"`;
    const path = href.replace(/^\.\//, "");
    return `${head}"${path.endsWith("/") ? REPO_TREE : REPO_BLOB}/${path}"`;
  });
}

/** Code blocks get the catalogue's copy button, tables a wrapper that scrolls on a phone. */
function dress(html: string) {
  return html
    .replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g, (_, inner: string) => `<div class="code" data-code><button class="copy" type="button" data-copy>Copy</button><pre>${inner}</pre></div>`)
    .replace(/<table\b[^>]*>([\s\S]*?)<\/table>/g, (_, inner: string) => `<div class="md-scroll"><table class="t">${inner}</table></div>`);
}

async function read(compiled: () => Promise<string>, fallback: string): Promise<Install> {
  const html = dress(rewriteLinks(await compiled()));
  const [head = "", ...sections] = html.split(/(?=<h2\b)/);
  const h1 = head.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  const used = new Set<string>();
  const steps = sections.map((s): InstallStep => {
    const h2 = s.match(/^<h2\b[^>]*>([\s\S]*?)<\/h2>/)!;
    const text = plain(h2[1]!);
    let id = slug(text);
    for (let n = 2; used.has(id); n++) id = `${slug(text)}-${n}`;
    used.add(id);
    return { text, id, html: s.replace(h2[0], `<h2 id="${id}">${h2[1]}</h2>`) };
  });
  return { title: h1 ? plain(h1[1]!) : fallback, lead: head.replace(/<h1\b[\s\S]*?<\/h1>/, ""), steps };
}

let loaded: Promise<Install> | undefined;
let migration: Promise<Install> | undefined;

export function install(): Promise<Install> {
  return (loaded ??= read(compiledContent, "Install"));
}

/** `MIGRATION.md`: the 0.1 to 1.0 guide. */
export function migrate(): Promise<Install> {
  return (migration ??= read(migrationContent, "Migrating to 1.0"));
}
