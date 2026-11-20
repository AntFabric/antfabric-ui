/**
 * The search index, built with the site: every component (by name, id, category, props and flows),
 * every screen, every design token (each links to its row on Foundations), and the catalogue's pages
 * with their section headings. The headings are read from the page sources, so the index says what
 * the pages say. The box in the top bar fetches it on first use.
 */

import type { APIRoute } from "astro";
import { categories, components, iconSvg, PAGES, placeOf, PLATFORM_META, PLATFORMS, screens } from "../lib/library";
import { groups, sectionKeys, type Section } from "../lib/token-ref";
import { install, migrate } from "../lib/install";
import { slug, type SearchEntry, type SearchField, type SearchIndex } from "../lib/search";

const sources = import.meta.glob<string>(["./*.astro", "./*/index.astro"], { query: "?raw", import: "default", eager: true });

/** A page's own headings: the h1 and each h2 written out as text, not the ones drawn from data (`{g.name}`). */
function headings(src: string) {
  const out: { level: number; text: string }[] = [];
  for (const m of src.matchAll(/<h([12])\b[^>]*>([\s\S]*?)<\/h\1>/g)) {
    if (m[2]!.includes("{")) continue;
    const text = m[2]!.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text) out.push({ level: Number(m[1]), text });
  }
  return out;
}

const categoryName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

const componentEntries = components.map((c): SearchEntry => {
  const category = categoryName[c.category] ?? c.category;
  const flows = [...new Set((c.flows ?? []).map((f) => f.title))];
  return {
    kind: "component",
    name: c.name,
    href: `/components/${c.id}`,
    icon: "component",
    meta: c.category === "data" ? placeOf(c) : `${placeOf(c)} · ${category}`,
    description: c.description,
    na: PLATFORMS.filter((p) => c.platforms[p].status === "not-applicable"),
    fields: [
      ["id", c.id],
      ["category", category],
      ...Object.keys(c.props).map((p): [SearchField, string] => ["prop", p]),
      ...flows.map((f): [SearchField, string] => ["flow", f]),
    ],
  };
});

const screenEntries = screens.map((s): SearchEntry => {
  const platform = PLATFORM_META[s.platform];
  return {
    kind: "screen",
    name: s.name,
    href: `/screens/${s.id}`,
    icon: platform.icon,
    meta: platform.label,
    description: s.description,
    fields: [
      ["id", s.id],
      ["category", platform.label],
    ],
  };
});

// The Install page is CONSUMING.md and the Migrate page MIGRATION.md: their steps come from the same read the pages draw (`lib/install.ts`), with the ids it gives them.
const guides = { install: await install(), migrate: await migrate() } as const;

const pageEntries = PAGES.flatMap((p): SearchEntry[] => {
  if (p.file === "install" || p.file === "migrate") {
    const guide = guides[p.file];
    return [
      { kind: "page", name: p.label, href: p.href, icon: p.icon, meta: "Page", description: guide.title, fields: [] },
      ...guide.steps.map((s): SearchEntry => ({ kind: "page", name: s.text, href: `${p.href}#${s.id}`, icon: "hash", meta: p.label, fields: [["page", p.label]] })),
    ];
  }
  const hs = headings(sources[`./${p.file}.astro`] ?? "");
  const title = hs.find((h) => h.level === 1)?.text;
  return [
    { kind: "page", name: p.label, href: p.href, icon: p.icon, meta: "Page", description: title, fields: [] },
    ...hs
      .filter((h) => h.level === 2)
      .map((h): SearchEntry => ({ kind: "page", name: h.text, href: `${p.href}#${slug(h.text)}`, icon: "hash", meta: p.label, fields: [["page", p.label]] })),
  ];
});

/** The Foundations section a token is in, as its heading says it. */
const SECTION_NAME: Record<Section, string> = { colour: "Colour", type: "Type", space: "Space", radius: "Radius", size: "Size", components: "Components", data: "Data", elevation: "Elevation", motion: "Motion", layers: "Layers and opacity", materials: "Materials" };

// One entry per token, linking to its row on Foundations (a row's id is its CSS variable without the leading dashes: `#af-fg-muted`).
const tokenEntries = sectionKeys.flatMap((key) =>
  groups(key).flatMap((g) =>
    g.rows.map(
      (r): SearchEntry => ({
        kind: "token",
        name: r.path,
        href: `/foundations#${r.cssVar.slice(2)}`,
        icon: "swatch-book",
        meta: r.cssVar,
        // The first sentence: the result shows one line, and the full text is on the row it links to.
        description: r.text.split(/(?<=[.!?])\s/)[0],
        fields: [["category", SECTION_NAME[key]]],
      }),
    ),
  ),
);

const entries = [...componentEntries, ...screenEntries, ...pageEntries, ...tokenEntries];
const icons = Object.fromEntries([...new Set([...entries.map((e) => e.icon), "corner-down-left"])].map((name) => [name, iconSvg(name, 16)]));

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ icons, entries } satisfies SearchIndex), { headers: { "Content-Type": "application/json; charset=utf-8" } });
