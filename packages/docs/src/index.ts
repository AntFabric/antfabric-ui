/**
 * The catalogue's data: every component's docs, the categories, the screens and the platform
 * tables. Plain TypeScript, so the Astro site, the checks and any script read it the same way.
 */

import type { Category, ComponentDocs, DataGroup, LevelDoc, PropDoc } from "./types";
import { docs } from "./components";

export * from "./types";
// AntFabric's copy (`ANTFABRIC_STRINGS`, the catalogue's root `strings`) and the sample data its docs, screens and RailWindow share.
export * from "./samples";
// Every component's recipe lives in core (both kits read it); the catalogue reads it from here, with the docs.
export { recipes, recipeEntries, tokenOf, STYLE_KEYS, type Recipe, type RecipeEntry, type PartRecipe, type StyleKey } from "@antfabric/ui-core";
export { screens } from "./screens";
export { features } from "./platforms/features";
export { notifications } from "./platforms/notifications";

export const components: ComponentDocs[] = [...docs].sort((a, b) => a.name.localeCompare(b.name));

export const registry: Record<string, ComponentDocs> = Object.fromEntries(components.map((c) => [c.id, c]));

export const categories: Category[] = [
  { id: "actions", name: "Actions", description: "Things you press." },
  { id: "inputs", name: "Inputs", description: "Things you type into, pick from or switch." },
  { id: "display", name: "Display", description: "People, counts, labels and containers." },
  { id: "feedback", name: "Feedback", description: "Progress, loading and the app talking back." },
  { id: "overlays", name: "Overlays", description: "Anything that floats above the page." },
  { id: "navigation", name: "Navigation", description: "Moving between places inside a screen." },
  { id: "shell", name: "App shell", description: "The frame each platform draws around the product: title bars, menus, rails, tab bars." },
  { id: "messaging", name: "Messaging", description: "The conversation surface: messages, threads, the composer." },
  { id: "notifications", name: "Notifications", description: "How the product reaches someone who isn't looking — on every surface each platform offers." },
  { id: "system", name: "System states", description: "Offline, updating, signed out, permission denied: the app's own condition." },
  { id: "agent", name: "Human in the loop", description: "An agent working on someone's behalf and stopping to ask: its questions, the approvals it waits for, and what it is doing." },
  { id: "data", name: "Data", description: "Numbers and the charts and tables that show them: a value and its change, a trend, a chart, a table." },
];

/** The three sizes, smallest first: the order the catalogue lists components in. */
export const levels: LevelDoc[] = [
  { id: "atom", name: "Atoms", description: "One control or mark that does not break down further: a button, a badge, a checkbox." },
  { id: "molecule", name: "Molecules", description: "A few atoms doing one job together: a search field, a list item, a menu." },
  { id: "organism", name: "Organisms", description: "A whole region of a screen, built from molecules and atoms: a dialog, the composer, the nav rail." },
];

/** The Data section's subgroups, in the order the catalogue lists them: a component's `group` picks its place. */
export const dataGroups: { id: DataGroup; name: string; description: string }[] = [
  { id: "kpi", name: "KPIs", description: "A number, how it changed and the trend behind it: the pieces a dashboard opens with." },
  { id: "chart", name: "Charts", description: "Rows drawn as lines, bars, rings and radars, with a tooltip, a legend and a table to read them as." },
  { id: "panel", name: "Panels", description: "A KPI beside the chart that explains it." },
  { id: "table", name: "Tables", description: "Rows and columns, with sorting, selection and paging." },
];

/** What the catalogue draws a prop with when nothing else sets it: its `sample` (AntFabric's showcase), else its `default`. */
export const shownValue = (d: PropDoc): unknown => (d.sample !== undefined ? d.sample : d.default);

/** A component's props with their documented samples, else defaults, filled in, then `props` over them. Events never are. */
export function withDefaults(doc: ComponentDocs, props: Record<string, unknown> = {}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, d] of Object.entries(doc.props)) {
    const v = shownValue(d);
    if (v !== undefined && d.type !== "event") out[k] = v;
  }
  return { ...out, ...props };
}
