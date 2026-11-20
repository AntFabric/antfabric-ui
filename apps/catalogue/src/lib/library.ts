/**
 * The catalogue's view of the library at build time: the docs, the platform tables, and what a page
 * hands its preview islands (the documented defaults of every component it draws).
 */

import { icons as allIcons } from "lucide";
import { kitCss, tokensCss, OS_VERSIONS, PLATFORM_OS, PLATFORMS, type InteractionState, type OS, type Platform } from "@antfabric/ui-core";
import { categories, components, dataGroups, levels, registry, screens, withDefaults, type ComponentDocs, type DataGroup, type Level, type MatrixCase, type MatrixDoc, type ScreenDocs } from "@antfabric/ui-docs";

export { categories, components, dataGroups, levels, registry, screens, withDefaults, PLATFORMS, PLATFORM_OS, OS_VERSIONS };
export type { DataGroup, Level, MatrixCase, MatrixDoc };
export type { ComponentDocs, InteractionState, OS, Platform, ScreenDocs };

type IconNode = [string, Record<string, string | number>][];
const icons = allIcons as unknown as Record<string, IconNode>;

export const DEFAULT_OS: Record<Platform, OS> = { web: "browser", desktop: "mac", mobile: "ios" };

export const PLATFORM_META: Record<Platform, { label: string; stack: string; kit: string; icon: string }> = {
  web: { label: "Web", stack: "React · TanStack Start · inline styles over token variables", kit: "@antfabric/ui-react", icon: "globe" },
  desktop: { label: "Desktop", stack: "React · Tauri 2 · inline styles over token variables", kit: "@antfabric/ui-react", icon: "monitor" },
  mobile: { label: "Mobile", stack: "React Native · Expo · StyleSheet over useTheme()", kit: "@antfabric/ui-react-native", icon: "smartphone" },
};

/** The catalogue's own pages, as the sidebar lists them. `file` is the page's source under `src/pages`, which search reads for its section headings. */
export const PAGES = [
  { href: "/", label: "Overview", icon: "layout-grid", file: "index" },
  { href: "/install", label: "Install", icon: "download", file: "install" },
  { href: "/migrate", label: "Migrate to 1.0", icon: "arrow-right-left", file: "migrate" },
  { href: "/foundations", label: "Foundations", icon: "palette", file: "foundations" },
  { href: "/theming", label: "Theming", icon: "swatch-book", file: "theming" },
  { href: "/architecture", label: "Architecture", icon: "network", file: "architecture" },
  { href: "/platforms", label: "Web vs desktop vs mobile", icon: "layers", file: "platforms" },
  { href: "/notifications", label: "Notifications", icon: "bell-ring", file: "notifications" },
  { href: "/screens", label: "Screens", icon: "app-window", file: "screens/index" },
  { href: "/components", label: "All components", icon: "component", file: "components/index" },
];

export const OS_LABEL: Record<OS, string> ={ browser: "Browser", mac: "macOS", windows: "Windows", linux: "Linux", ios: "iOS", android: "Android" };

export const STATUS_LABEL = { ready: "Ready", partial: "Partial", planned: "Planned", "not-applicable": "Not on this platform" } as const;

/** The token variables and the React kit's keyframes, for the page head. */
export const kitStyles = tokensCss() + kitCss;

const walkIds = (v: unknown, out: Set<string>) => {
  if (Array.isArray(v)) v.forEach((x) => walkIds(x, out));
  else if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (o.el === "component" && typeof o.use === "string") out.add(o.use);
    Object.values(o).forEach((x) => walkIds(x, out));
  }
};

/** Every component a doc draws: itself, and whatever its examples and flow scenes compose. */
export function usedIds(doc: ComponentDocs): string[] {
  const out = new Set<string>([doc.id]);
  walkIds(doc, out);
  return [...out];
}

/** The documented defaults of each component a page draws, for one platform. */
export function defaultsFor(ids: string[], platform: Platform): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const id of ids) {
    const doc = registry[id];
    if (!doc) continue;
    out[id] = Object.fromEntries(Object.entries(withDefaults(doc)).filter(([k]) => !doc.props[k]?.platforms || doc.props[k]!.platforms!.includes(platform)));
  }
  return out;
}

const pascal = (n: string) =>
  n
    .split(/[-_ ]/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join("");

/** Icons the playground offers for `icon` props, on top of the one the docs default to. */
export const ICON_CHOICES = [
  "", "send", "plus", "bell", "bell-off", "search", "paperclip", "smile", "at-sign", "hash", "lock", "message-square", "message-circle", "inbox", "mic", "video",
  "calendar", "folder", "file-text", "image", "settings", "user", "users", "check", "x", "trash-2", "pencil", "copy", "download", "upload", "share",
  "external-link", "chevron-right", "arrow-right", "sparkles", "star", "pin", "panel-right", "log-out", "refresh-cw", "wifi-off",
];

export function supportCounts() {
  const counts: Record<Platform, number> = { web: 0, desktop: 0, mobile: 0 };
  for (const c of components) for (const p of PLATFORMS) if (c.platforms[p].status !== "not-applicable") counts[p]++;
  return counts;
}

/** One component's level, as a word: "Atom". */
export const LEVEL_LABEL: Record<Level, string> = { atom: "Atom", molecule: "Molecule", organism: "Organism" };

/** The components by level, smallest first, each level's in alphabetical order: the sidebar's and the gallery's order. The data components are not in it: they have a section of their own (`byDataGroup`). */
export function byLevel() {
  return levels.map((l) => ({ ...l, items: components.filter((c) => c.level === l.id && c.category !== "data") })).filter((l) => l.items.length);
}

/** The Data section: its groups (KPIs, Charts, Panels, Tables), each with its components in alphabetical order. A group with none is left out. */
export function byDataGroup() {
  return dataGroups.map((g) => ({ ...g, items: components.filter((c) => c.category === "data" && c.group === g.id) })).filter((g) => g.items.length);
}

/** The Data section as a whole, for its heading: the category's name and description. */
export const dataSection = categories.find((c) => c.id === "data")!;

/** Every component in the order the sidebar lists them: the three levels, then the Data section's groups. A component page's previous and next follow it. */
export const listingOrder = () => [...byLevel(), ...byDataGroup()].flatMap((g) => g.items);

/** Where a component sits in the catalogue, as a word: "Atom", or "Data · KPIs" for a data component. */
export function placeOf(c: ComponentDocs): string {
  return c.category === "data" ? `${dataSection.name} · ${dataGroups.find((g) => g.id === c.group)?.name ?? "Other"}` : LEVEL_LABEL[c.level];
}

export function byCategory() {
  return categories.map((cat) => ({ ...cat, items: components.filter((c) => c.category === cat.id) })).filter((c) => c.items.length);
}

/** A lucide icon as an SVG string, for the catalogue's own chrome. */
export function iconSvg(name: string, size = 16, stroke = 2) {
  const node = icons[pascal(name)];
  if (!node) return "";
  const inner = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

/** One row of the Variants section as it is drawn: its heading, then each case (`props` over the defaults, captioned `name`), in order. */
export interface MatrixRow {
  prop: string;
  cases: MatrixCase[];
  width?: number;
}

/**
 * A matrix row's cases. A plain row (`{ prop, values? }`) is one case per value, `{ name: String(value), props: { [prop]: value } }`,
 * in the order the values were always drawn; a row with `cases` is those cases as written. Either way the renders, their count and their
 * order are what a plain matrix over the same props gave.
 */
export function matrixCases(doc: ComponentDocs, m: MatrixDoc): MatrixCase[] {
  if (m.cases) return m.cases;
  const def = doc.props[m.prop];
  const values = m.values ?? def?.options ?? (def?.type === "boolean" ? [false, true] : []);
  return values.filter((v) => v !== "").map((v) => ({ name: String(v), props: { [m.prop]: v } }));
}

/** Every case a component page shows on a platform, in the order it shows them. */
export function casesFor(doc: ComponentDocs, platform: Platform) {
  const applies = (p?: Platform[]) => !p || p.includes(platform);
  const examples = doc.examples.filter((e) => applies(e.platforms));
  const matrix: MatrixRow[] = (doc.matrix ?? []).map((m) => ({ prop: m.prop, cases: matrixCases(doc, m), width: m.width }));
  const states = (doc.states ?? []).filter((s) => !(s === "hover" && platform === "mobile"));
  const edge = (doc.edgeCases ?? []).filter((e) => e.platforms.includes(platform));
  return { examples, matrix, states, edge };
}
