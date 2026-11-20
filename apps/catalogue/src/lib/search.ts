/**
 * The catalogue's search: what the index holds and how a query ranks it. The index is built with the
 * site (`pages/search.json.ts`); the box in the top bar (`search-box.ts`) fetches it and ranks it here.
 */

export type SearchKind = "component" | "screen" | "page" | "token";

/** What else an entry is found by, besides its name and description. `page` is the page a section is on. */
export type SearchField = "id" | "category" | "page" | "prop" | "flow";

export interface SearchEntry {
  kind: SearchKind;
  name: string;
  href: string;
  /** A key into the index's `icons`. */
  icon: string;
  /** Beside the name: a component's category, a screen's platform, the page a section is on, a token's CSS variable. */
  meta: string;
  description?: string;
  /** The platforms a component isn't on, which the box marks as the sidebar does. */
  na?: string[];
  fields: [SearchField, string][];
}

export interface SearchIndex {
  icons: Record<string, string>;
  entries: SearchEntry[];
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  /** A prop or flow that matched, worth showing in place of the description. */
  hint?: { field: "prop" | "flow"; text: string };
}

/** A heading's anchor: "Space and radius" → `space-and-radius`. */
export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// A section's page weighs little: "notif" shouldn't list every section of Notifications, but "notifications edge cases" finds one.
const WEIGHT: Record<"name" | "description" | SearchField, number> = { name: 1, id: 0.8, category: 0.5, page: 0.3, prop: 0.6, flow: 0.6, description: 0.25 };
const KIND_ORDER: SearchKind[] = ["component", "page", "screen", "token"];
// A token is the last thing someone means by a word they might also mean a component or a page by: "button" is Button, not `button.labelSm`.
const KIND_WEIGHT: Partial<Record<SearchKind, number>> = { token: 0.5 };

/** The docs write British English; people search in both. */
const SPELLING: [string, string][] = [
  ["colour", "color"],
  ["grey", "gray"],
  ["behaviour", "behavior"],
  ["centre", "center"],
  ["dialogue", "dialog"],
];

/** Each word of a query, with its other spellings. */
export function terms(query: string): string[][] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => {
      const out = [t];
      for (const [a, b] of SPELLING) {
        if (t.includes(a)) out.push(t.replace(a, b));
        else if (t.includes(b)) out.push(t.replace(b, a));
      }
      return out;
    });
}

const wordStart = (text: string, at: number) => at === 0 || !/[a-z0-9]/.test(text[at - 1]!);

/** How well one word matches some text, 0 to 1: the whole of it, its start, a word's start, anywhere. */
function match(text: string, variants: string[]) {
  let best = 0;
  for (const v of variants) {
    if (text === v) return 1;
    for (let i = text.indexOf(v); i >= 0; i = text.indexOf(v, i + 1)) {
      const s = i === 0 ? 0.85 : wordStart(text, i) ? 0.7 : v.length >= 3 ? 0.4 : 0;
      if (s > best) best = s;
    }
  }
  return best;
}

/**
 * Every entry that matches all of the query's words, best first. Results that score under a third of
 * the best are dropped: "but" names Button, and shouldn't list every description that says "but".
 */
export function rank(index: SearchIndex, query: string): SearchHit[] {
  const words = terms(query);
  if (!words.length) return [];
  const hits: SearchHit[] = [];
  for (const entry of index.entries) {
    const name = entry.name.toLowerCase();
    const description = entry.description?.toLowerCase() ?? "";
    let score = 0;
    let hint: SearchHit["hint"];
    for (const variants of words) {
      let best = Math.max(match(name, variants) * WEIGHT.name, match(description, variants) * WEIGHT.description);
      let from: [SearchField, string] | undefined;
      // A token's meta is its CSS variable, which is also how it is found (`af-fg-muted`).
      for (const field of entry.kind === "token" ? [["id", entry.meta] as [SearchField, string], ...entry.fields] : entry.fields) {
        const s = match(field[1].toLowerCase(), variants) * WEIGHT[field[0]];
        if (s > best) [best, from] = [s, field];
      }
      if (!best) {
        score = 0;
        break;
      }
      score += best;
      if (!hint && from && (from[0] === "prop" || from[0] === "flow")) hint = { field: from[0], text: from[1] };
    }
    if (score) hits.push({ entry, score: score * (KIND_WEIGHT[entry.kind] ?? 1), hint });
  }
  const top = Math.max(0, ...hits.map((h) => h.score));
  return hits.filter((h) => h.score >= top / 3).sort(
    (a, b) =>
      b.score - a.score ||
      KIND_ORDER.indexOf(a.entry.kind) - KIND_ORDER.indexOf(b.entry.kind) ||
      a.entry.name.length - b.entry.name.length ||
      a.entry.name.localeCompare(b.entry.name),
  );
}

/** Where the query's words appear in some text, as [start, end) ranges, for highlighting. */
export function marks(text: string, query: string): [number, number][] {
  const lower = text.toLowerCase();
  const on: boolean[] = [];
  for (const variants of terms(query)) {
    for (const v of variants) {
      for (let i = lower.indexOf(v); i >= 0; i = lower.indexOf(v, i + 1)) {
        // A single letter only marks the start of a word, or "b" would light up every b.
        if (v.length > 1 || wordStart(lower, i)) for (let k = i; k < i + v.length; k++) on[k] = true;
      }
    }
  }
  const out: [number, number][] = [];
  for (let i = 0; i < text.length; i++) {
    if (!on[i]) continue;
    const start = i;
    while (on[i + 1]) i++;
    out.push([start, i + 1]);
  }
  return out;
}
