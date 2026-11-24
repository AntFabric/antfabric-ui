/**
 * The agent surface: the two files an agent reads before it touches the library.
 *
 *   componentsJson()  `packages/docs/components.json`, served at `/components.json`: every component's props, parts,
 *                     recipe, accessibility, examples and files, from the docs and the recipes
 *   llmsTxt()         `llms.txt` at the repository root, served at `/llms.txt`: what the library is, where the data is,
 *                     the authoring rules, the component to copy
 *
 * `pnpm tokens:build` writes both; `pnpm check agent` fails when either differs from what these return, or when
 * `components.json` cites a path that is not there. Nothing here is typed by hand but the rule text.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { pascal, tokenOf, type Recipe } from "@antfabric/ui-core";
import { categories, components, levels, recipes, screens, type ComponentDocs, type EdgeCase, type Example, type PropDoc } from "@antfabric/ui-docs";
import { repoRoot } from "../src/lib/scan";
import { tokenPaths } from "./token-leaves";

const PLATFORMS = ["web", "desktop", "mobile"] as const;
const recipeById = recipes as Record<string, Recipe>;

/** The paths `components.json` cites, relative to the repository root. `null` where a kit has no such file. */
export function componentPaths(c: Pick<ComponentDocs, "id" | "category">) {
  const root = repoRoot();
  const at = (p: string) => (existsSync(join(root, p)) ? p : null);
  return {
    react: at(`packages/react/src/components/${c.category}/${c.id}.tsx`),
    reactNative: at(`packages/react-native/src/components/${c.category}/${c.id}.tsx`),
    docs: at(`packages/docs/src/components/${c.category}/${c.id}.ts`),
    recipe: at(`packages/core/src/recipes/${c.category}/${c.id}.ts`),
  };
}

/** A scene is the catalogue's drawing of a slot (`{ el: "view", … }`): useful to the playground, noise to an agent. */
const isScene = (v: unknown): boolean => (Array.isArray(v) ? v.some(isScene) : typeof v === "object" && v !== null && typeof (v as { el?: unknown }).el === "string");

/** An object without its undefined keys, in the order they were written. */
const defined = <T extends object>(o: T): Partial<T> => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;

function prop(p: PropDoc) {
  // `default` is the kit's own; `sample` is the value the catalogue shows (AntFabric's showcase), left out when it is a drawing.
  return defined({ type: p.type, description: p.description, default: p.default, sample: isScene(p.sample) ? undefined : p.sample, options: p.options, required: p.required || undefined, platforms: p.platforms, args: p.args, changes: p.changes });
}

function example(e: Example) {
  const props: Record<string, unknown> = {};
  const slots: string[] = [];
  for (const [k, v] of Object.entries(e.props ?? {})) {
    if (isScene(v)) slots.push(k);
    else props[k] = v;
  }
  return defined({ name: e.name, description: e.description, props, slots: slots.length ? slots : undefined, platforms: e.platforms, os: e.os, state: e.state });
}

const edgeCase = (e: EdgeCase) => ({ title: e.title, platforms: e.platforms, handling: e.handling });

/** Every `$token` a recipe names, sorted, once. */
function recipeTokens(recipe: Recipe): string[] {
  const out = new Set<string>();
  const walk = (v: unknown) => {
    if (typeof v === "string") {
      const t = tokenOf(v as never);
      if (t) out.add(t);
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(recipe.styles);
  walk(recipe.reads);
  return [...out].sort();
}

function component(c: ComponentDocs) {
  const recipe = recipeById[c.id];
  return {
    id: c.id,
    name: c.name,
    category: c.category,
    level: c.level,
    status: c.status,
    support: Object.fromEntries(PLATFORMS.map((p) => [p, c.platforms[p].status])),
    description: c.description,
    files: componentPaths(c),
    exports: { component: pascal(c.id), props: `${pascal(c.id)}Props` },
    props: Object.fromEntries(Object.entries(c.props).map(([k, p]) => [k, prop(p)])),
    parts: recipe ? [...recipe.parts] : [],
    recipe: recipe ? { parts: recipe.parts, styles: recipe.styles, reads: recipe.reads, tokens: recipeTokens(recipe) } : null,
    a11y: c.a11y ?? null,
    states: c.states,
    examples: c.examples.map(example),
    edgeCases: c.edgeCases?.map(edgeCase),
    platforms: Object.fromEntries(PLATFORMS.map((p) => [p, defined(c.platforms[p])])),
    related: c.related,
    flows: c.flows?.map((f) => ({ id: f.id, title: f.title, platforms: f.platforms })),
  };
}

export const COMPONENTS_DESCRIPTION =
  "Every AntFabric UI component as data, for an agent that has to use one or build one. Written by `pnpm tokens:build` " +
  "(apps/catalogue/scripts/agent-surface.ts) from the docs in packages/docs/src/components/<category>/<id>.ts and the recipes in " +
  "packages/core/src/recipes/<category>/<id>.ts; `pnpm check agent` fails when it is stale. Served at /components.json. " +
  "Per component: `props` (as the docs declare them, the contract both kits implement: `type`, `default` (the kit's own), `sample` " +
  "(the catalogue's example value, AntFabric's showcase, where it has one), `options`, `required`, " +
  "`platforms` when not all, and for an event its `args` and the prop it `changes`), `parts` and `recipe` (each part's `$token` " +
  "references by variant, state and platform, in the order they apply; later wins: base, then variants in the order listed, then " +
  "states, then the platform; `tokens` lists every one), `a11y`, `examples` (prop objects; `slots` names a prop that held a " +
  "drawing, left out), `platforms` (what each kit builds on, import line, notes, keyboard, gestures), `related`, and `files`: the " +
  "paths in the repository (`null` where that kit has no file because the component is not on that platform). Tokens are in " +
  "packages/core/tokens.json. Props, the recipe and its keys are in AUTHORING.md.";

/**
 * JSON with one line per small thing: an object or array that fits in 110 columns is written on one line, anything bigger is
 * opened. The same tree always prints the same, and a change to one prop or one token touches one line.
 */
function pretty(value: unknown, indent = ""): string {
  const flat = JSON.stringify(value);
  if (flat === undefined) return "null";
  if (value === null || typeof value !== "object") return flat;
  const entries = Array.isArray(value) ? value.map((v) => [null, v] as const) : Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, v] as const);
  if (!entries.length) return Array.isArray(value) ? "[]" : "{}";
  const one = (e: readonly [string | null, unknown]) => (e[0] === null ? "" : `${JSON.stringify(e[0])}: `) + pretty(e[1], "");
  const [open, close] = Array.isArray(value) ? ["[", "]"] : ["{", "}"];
  const inline = `${open}${Array.isArray(value) ? "" : " "}${entries.map(one).join(", ")}${Array.isArray(value) ? "" : " "}${close}`;
  if (indent.length + inline.length <= 110 && !inline.includes("\n")) return inline;
  const inner = indent + "  ";
  return `${open}\n${entries.map((e) => `${inner}${e[0] === null ? "" : `${JSON.stringify(e[0])}: `}${pretty(e[1], inner)}`).join(",\n")}\n${indent}${close}`;
}

/** `packages/docs/components.json`. */
export function componentsJson(): string {
  const sorted = [...components].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const doc = {
    $description: COMPONENTS_DESCRIPTION,
    categories: categories.map((c) => ({ id: c.id, name: c.name, description: c.description })),
    levels: levels.map((l) => ({ id: l.id, name: l.name, description: l.description })),
    components: Object.fromEntries(sorted.map((c) => [c.id, component(c)])),
  };
  return pretty(doc) + "\n";
}

/** Every repository path `components.json` cites. */
export function citedPaths(json = componentsJson()): { id: string; path: string }[] {
  const doc = JSON.parse(json) as { components: Record<string, { files: Record<string, string | null> }> };
  return Object.entries(doc.components).flatMap(([id, c]) => Object.values(c.files).flatMap((p) => (p ? [{ id, path: p }] : [])));
}

/* ---------- llms.txt ---------- */

const RULES = [
  "Two files, one API. Every component is `packages/react/src/components/<category>/<id>.tsx` (web and desktop) and `packages/react-native/src/components/<category>/<id>.tsx` (phone). Both take the props the docs declare for their platforms, plus `style` on the root, and nothing else. Export each from its category's `index.ts`, or from the kit's `src/data/`, `src/shell/` or `src/chat/` entry when it ships from `./data`, `./shell` or `./chat`.",
  "The docs file is the contract: `packages/docs/src/components/<category>/<id>.ts` (props, platforms, a11y, examples, edge cases, flows), listed in `packages/docs/src/components/index.ts`. Write it first. Its `level` is `atom` (one control or mark), `molecule` (a few atoms doing one job) or `organism` (a whole region of a screen); a component may import only components at its own level or below, and `pnpm check` holds that. Sample data is AntFabric's own (`#platform-eng`, real names, the AI agent \"Fabric\"), never lorem ipsum.",
  "Styles are a recipe, written once as data: `packages/core/src/recipes/<category>/<id>.ts` with `defineRecipe({ parts, styles })`, added to the category's `index.ts` there. Each part has `base`, `variants` (prop, then value; the docs' `options`), `states` (`hover`, `pressed`, `focus`, `disabled`, `on`, ...), and `platforms` for where the phone differs. Both kits read it through `useRecipe`. The file imports `defineRecipe` from `\"../../recipe\"` and exports the camelCase of the id (`icon-button` is `iconButton`; a reserved word takes a suffix, `switchRecipe`); the category `index.ts` lists it under the docs id (`\"icon-button\": iconButton`); a kit reads `import { recipes } from \"@antfabric/ui-core\"` then `useRecipe(recipes[\"icon-button\"], ...)`. A style that depends on two props together cannot be written (variants layer one prop at a time); `AUTHORING.md`, Recipes, gives the workaround.",
  "Tokens only. A recipe value is `\"$group.leaf\"` (`\"$color.background.brand.default\"`), `\"transparent\"` or `\"none\"`; a typo fails `pnpm typecheck`. No hex, no px, no `calc`. A size or colour with no token gets a token first (`packages/core/src/tokens.ts` and `descriptions.ts`), then the recipe reads it. Unitless ratios (`scale: 0.97`) stay in the kit.",
  "The kit file keeps behaviour and layout, not style: hover, press and focus, roles, `Animated`, flex direction, `cursor`. It may read `t.space`, `t.duration` and `t.ease`; a style written as `t.something` outside the recipe fails `pnpm check`.",
  "Mark every part. Web and desktop: `data-af-part=\"<part>\"` (an `Icon` or `Spinner` takes `part`). Phone: `testID=\"<id>.<part>\"`. A part with no mark fails `pnpm check recipes`. A static component (a divider, a heading) drops `useInteraction` / `usePress`, the handlers, the recipe's `states` and the `state` passed to `useRecipe`, but still marks its parts; for a separator use `role=\"separator\"` on the web, and on the phone (`accessibilityRole` has no separator value) hide a decorative line with `accessibilityElementsHidden` and `importantForAccessibility=\"no-hide-descendants\"`.",
  "Events are props named `onX`, called with the documented `args` and nothing else: `onClick={() => onPress?.()}`, never `onClick={onPress}`. A prop a press changes (`checked`, `open`, `value`) goes through `useControllable(value, onEvent)`, and the docs declare that event with `changes: \"<prop>\"`.",
  "React kit: states come from `useInteraction()`, never CSS `:hover`; borders are longhands (`borderWidth`, `borderStyle`, `borderColor`), never the `border` shorthand. React Native kit: `usePress()`, no hover; every `Text` takes its type from the recipe (`r.<part>.text`), every `Icon` gets a `color`, fonts by file through `font(weight)`; never `{str && <X />}` with a string or number.",
  "Import sibling components from their files (`../actions/button`), never from the kit's index. Icons are lucide names in kebab case. Shortcuts are written `Mod+Enter` and drawn with `formatShortcut(keys, os)`.",
  "Accessibility: every icon-only control has a label; the docs' `a11y` says the role and the label.",
  "Run `pnpm check <id>` until it passes: it type-checks both kits, checks the docs, the recipe and the props parity, renders every example, variant, state and edge case on every OS, and re-renders through every state. `pnpm check` runs everything. `pnpm frames <id>` shows where flow presses land.",
  "Status: a component's own `status` in the docs is `\"stable\"`, `\"beta\"` or `\"draft\"` (a new one is `draft`); each platform's `platforms.<p>.status` is `\"ready\"`, `\"partial\"`, `\"planned\"` or `\"not-applicable\"` (with an `alternative`).",
  "Decisions that are the owner's (a value that differs between the kits, a new token name) go in a GitHub issue, stating what the components do now and naming the component. Do not publish by hand; releases go through the Changesets pipeline (`RELEASING.md`).",
];

/** The text of `llms.txt`: constants for the rules, counts and ids from the data. */
export function llmsTxt(): string {
  const sorted = [...components].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const groups = new Map<string, number>();
  for (const p of tokenPaths()) groups.set(p.split(".")[0]!, (groups.get(p.split(".")[0]!) ?? 0) + 1);
  const withRecipe = sorted.filter((c) => recipeById[c.id]).length;
  const on = (p: (typeof PLATFORMS)[number]) => sorted.filter((c) => c.platforms[p].status !== "not-applicable").length;
  const button = components.find((c) => c.id === "button");
  if (!button) throw new Error("llms.txt: the canonical component, button, is not in the docs");
  const f = componentPaths(button);

  const lines: string[] = [];
  const add = (...l: string[]) => lines.push(...l);

  add(
    "# AntFabric UI",
    "",
    `> One component library for AntFabric's web (TanStack Start), desktop (Tauri) and mobile (Expo) apps, written as real components. Two kits take the same props: \`@antfabric/ui-react\` draws web and desktop, \`@antfabric/ui-react-native\` draws the phone. ${sorted.length} components in ${categories.length} categories (${on("web")} on web, ${on("desktop")} on desktop, ${on("mobile")} on mobile), ${withRecipe} recipes, ${tokenPaths().length} design tokens, ${screens.length} sample screens.`,
    "",
    "Paths are relative to the repository root. A path that starts with `/` is on the catalogue site, a static Astro site (`apps/catalogue`) that draws every component live on each platform.",
    "",
    "## Packages",
    "",
    "- `@antfabric/ui-react`: web and desktop. Peers: `react` and `react-dom` 19.1+, `lucide-react`. Wrap the app in `AntFabricRoot` (`platform`, `os`, `osVersion`, `scheme`, `theme`). With no `theme` it draws `themes.neutral`; AntFabric's own look is `themes.antfabric`.",
    "- `@antfabric/ui-react-native`: the phone. Peers: `react` 19.1+, `react-native` 0.81+, `react-native-svg`, `lucide-react-native`, optionally `expo-glass-effect`. Wrap the app in `ThemeProvider` (`scheme`, `theme`).",
    "- `@antfabric/ui-core`: tokens, recipes, themes (`defineTheme`, `themes`), the stylesheet, the Figtree font files. Both kits depend on it.",
    "- Each kit has three more entries, not part of its root, so an app that never imports one carries none of it: `./data` (KPIs, charts, panels and tables; brings recharts or gifted-charts), `./shell` (the app frame and the pictures of native surfaces: title bars, menus, rails, sidebar, tab bar, OS notification, tray menu, app badge) and `./chat` (the conversation idiom: Message, Composer, ReactionPill, ThreadSummary, TypingIndicator, MessageDivider and, on the web, MessageActions; the agent components stay in the root). Import from `@antfabric/ui-react/data`, `@antfabric/ui-react/shell` or `@antfabric/ui-react/chat`, and the same three names under `@antfabric/ui-react-native`; each component's `platforms.<p>.import` in `/components.json` is its exact line.",
    "- Install, `.npmrc`, fonts, setup and tenant branding: `/install.md` (`CONSUMING.md` in the repository; `/install` on the catalogue is the same guide for a person). How a component is written: `AUTHORING.md`.",
    "- Moving an app from 0.1 to 1.0: `/migrate.md` (`MIGRATION.md` in the repository; `/migrate` on the catalogue is the same guide for a person): every break by area.",
    "",
    "## The data",
    "",
    `- \`/tokens.json\` (\`packages/core/tokens.json\`): the ${tokenPaths().length} design tokens in the W3C Design Tokens format. Each has \`$type\`, \`$value\` (light theme, desktop profile), \`$description\` (when to use it), and every mode under \`$extensions["com.antfabric"].modes\` (\`{ light, dark }\` or \`{ web, desktop, mobile }\`). A token's path is its name in recipes (\`$color.text.muted\`) and its CSS variable is \`--af-color-text-muted\`. ${groups.size} groups: the foundations (\`fg\`, \`surface\`, \`brand\`, \`border\`, \`space\`, \`radius\`, \`text\`, \`font\`, \`control\`, \`shadow\`, \`duration\`) and one group per component's own decisions (\`button\`, \`switch\`, \`dialog\`...).`,
    `- \`/components.json\` (\`packages/docs/components.json\`): all ${sorted.length} components. Per component: \`props\` (type, default, the catalogue's sample value where there is one, options, required, platforms, event args and the prop an event changes), \`parts\`, \`recipe\` (each part's \`$token\` references by variant, state and platform), \`a11y\`, \`examples\`, \`platforms\` notes, \`related\`, and \`files\`: the paths of both kits, the docs and the recipe.`,
    "- `pnpm tokens:build` generates three committed files: `packages/core/tokens.json`, `packages/docs/components.json` and this `llms.txt`. `pnpm check` fails when one is stale. Never edit them by hand; run it after any change to the docs, a recipe or a token.",
    "- `pnpm describe` lists components by category; `pnpm describe <id>` prints one component's props, parts, recipe table, a11y, examples, states, edge cases, matrix, source, flows, related and its four file paths; `pnpm describe tokens` lists the token groups; `pnpm describe tokens <group>` prints each token's path, CSS variable, value per mode, reference and description. Add `--json` to any of them. Run it instead of reading six files.",
    "",
    "## Writing a component",
    "",
    ...RULES.map((r, i) => `${i + 1}. ${r}`),
    "",
    "## Copy these",
    "",
    "Button is the canonical component. Read these four, change what differs:",
    "",
    `- docs: \`${f.docs}\``,
    `- recipe: \`${f.recipe}\``,
    `- react kit: \`${f.react}\``,
    `- react-native kit: \`${f.reactNative}\``,
    "",
    "Templates, each a complete `Example` component with its recipe inline as a `defineRecipe` constant and the docs file's shape in a comment:",
    "",
    "- `packages/react/TEMPLATE.tsx`",
    "- `packages/react-native/TEMPLATE.tsx`",
    "",
    "Their header comments show the recipe file's exact shape, what a static component (no states, no press) drops, and the accessibility roles for a separator or decorative element.",
    "",
    "## Adding a component",
    "",
    "In this order; `AUTHORING.md` has the same list under \"Adding a component: the checklist\".",
    "",
    "1. Copy both templates to `packages/<kit>/src/components/<category>/<id>.tsx`; rename `Example`; change the `./src/` imports to `../../`.",
    "2. Move the recipe to `packages/core/src/recipes/<category>/<id>.ts` and add its line to that category's `index.ts`.",
    "3. Write `packages/docs/src/components/<category>/<id>.ts` and add its line to `packages/docs/src/components/index.ts`.",
    "4. Export the component and its props type from each kit's category `index.ts` (or from its `./data`, `./shell` or `./chat` entry).",
    "5. `pnpm tokens:build`: regenerates `tokens.json`, `components.json` and `llms.txt`.",
    "6. `pnpm check <id>` until it passes.",
    "7. `pnpm check --update-snapshot`: accepts the new component's render-snapshot keys (`reports/renders.snapshot.json`). Read the diff: only new keys for `<id>`; never use it to hide a change to another component.",
    "8. The full `pnpm check`, green.",
    "",
    "## Components",
    "",
    "Ids by category. `/components/<id>` is the component's page on the site.",
    "",
    ...categories.flatMap((cat) => {
      const ids = sorted.filter((c) => c.category === cat.id).map((c) => c.id);
      return ids.length ? [`- ${cat.name} (${cat.description.replace(/\.$/, "")}): ${ids.join(", ")}`] : [];
    }),
    "",
    "Ids by level, smallest first: the order the site's sidebar lists them in. A component imports only components at its own level or below.",
    "",
    ...levels.map((l) => `- ${l.name} (${l.description.replace(/\.$/, "")}): ${sorted.filter((c) => c.level === l.id).map((c) => c.id).join(", ")}`),
    "",
  );
  return lines.join("\n");
}
