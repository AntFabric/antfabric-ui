/**
 * Built-in text. A component never writes a fixed English word of its own: it reads one from here, through `useStrings(id)`, and its
 * English default is the text it always had. A product overrides any of it for a whole tree (`strings` on the root or provider) or for
 * one instance (the component's `strings` prop), and sets the `locale` that picks plural forms.
 *
 * A string is a template: `"{current}/{max}"` fills `{name}` from the variables the component passes (`{{` and `}}` are literal braces),
 * or `{ one: "{count} reply", other: "{count} replies" }`, where the variable `count` picks the form through `Intl.PluralRules`
 * (`zero`, `one`, `two`, `few`, `many`, `other`; `other` is required and the fallback; `zero` is also chosen for a count of exactly 0 in any locale). Numbers are written as `String(n)`: a component
 * that wants grouping passes an already formatted string.
 *
 * `strings/<category>.ts` hold the defaults, one file per category of component, each a record keyed by component id. Resolution for
 * `s(key)` in a component with id `id`: the instance's `strings`, the tree's `strings[id]`, the tree's `strings.common`, then
 * `defaultStrings[id]`, then `defaultStrings.common`.
 */

import * as actionsFile from "./actions";
import * as agentFile from "./agent";
import * as dataFile from "./data";
import * as displayFile from "./display";
import * as feedbackFile from "./feedback";
import * as inputsFile from "./inputs";
import * as messagingFile from "./messaging";
import * as navigationFile from "./navigation";
import * as notificationsFile from "./notifications";
import * as overlaysFile from "./overlays";
import * as shellFile from "./shell";
import * as systemFile from "./system";
import { actions } from "./actions";
import { agent } from "./agent";
import { common } from "./common";
import { data } from "./data";
import { display } from "./display";
import { feedback } from "./feedback";
import { inputs } from "./inputs";
import { messaging } from "./messaging";
import { navigation } from "./navigation";
import { notifications } from "./notifications";
import { overlays } from "./overlays";
import { shell } from "./shell";
import { system } from "./system";

/** The plural categories `Intl.PluralRules` can name. */
export type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";
/**
 * One string per plural form. `other` is required: it is what a category the template does not name falls back to. `zero` is chosen when
 * `count` is exactly 0, whatever the locale's rules say (English has no `zero` category, so `Intl.PluralRules` would never pick it); a
 * template with no `zero` form reads its locale's category for 0 (`other` in English).
 */
export type PluralTemplate = { [C in PluralCategory]?: string } & { other: string };
/** `"Reply to {name}"`, or one template per plural form, chosen by `count`. */
export type StringTemplate = string | PluralTemplate;
/** What a component fills a template's placeholders with. `count` also picks the plural form, as a number or a numeric string (`"1"`; the string is what is written). */
export type StringVars = Readonly<Record<string, string | number>>;
/** One component's strings, as a category file writes them. */
export type StringGroup = Record<string, StringTemplate>;
/** A category file: component id to that component's strings. */
export type StringGroups = Record<string, StringGroup>;

/** The kits a platform-only key can name: `web` is the React kit (web and desktop), `mobile` the phone's. */
export type StringsKit = "web" | "mobile";
/**
 * Which keys only one kit reads. By default a key is read by every kit that draws its component, and `pnpm check strings` fails when one does
 * not; a key a platform has no use for (the phone's long-press label, the desktop's shortcut hint) is declared here, next to the keys, in the
 * category file, as `export const <category>Only = { card: { select: ["mobile"] } } as const satisfies OnlyOn<typeof <category>>`. The kit it
 * names must read the key and the other must not. `satisfies` makes a misspelt id or key a type error.
 */
export type OnlyOn<Group extends Record<string, object>> = { [Id in keyof Group]?: { [Key in keyof Group[Id]]?: readonly [StringsKit] } };
/** Every category file's `<category>Only`, merged: component id, then key, then the one kit that reads it. */
export type PlatformOnly = Readonly<Record<string, Readonly<Record<string, readonly [StringsKit]>>>>;

/** Merges every export named `…Only` of the category files. Read by `pnpm check strings`; a category with none contributes nothing. */
function collectOnly(files: readonly object[]): PlatformOnly {
  const out: Record<string, Record<string, readonly [StringsKit]>> = {};
  for (const file of files)
    for (const [name, value] of Object.entries(file))
      if (name.endsWith("Only") && value && typeof value === "object")
        for (const [id, keys] of Object.entries(value as PlatformOnly)) out[id] = { ...out[id], ...keys };
  return out;
}

export { actions, agent, common, data, display, feedback, inputs, messaging, navigation, notifications, overlays, shell, system };

/** Every built-in string: `common`, then each category's components. */
export const defaultStrings = { common, ...actions, ...inputs, ...display, ...feedback, ...overlays, ...navigation, ...shell, ...messaging, ...notifications, ...system, ...agent, ...data };

/** The keys a kit does not read, by component id: collected from the category files' `<category>Only` exports (`OnlyOn`). */
export const platformOnly: PlatformOnly = collectOnly([actionsFile, agentFile, dataFile, displayFile, feedbackFile, inputsFile, messagingFile, navigationFile, notificationsFile, overlaysFile, shellFile, systemFile]);

/** `defaultStrings` with its keys kept literal and each value typed as a template (an override may be a plural). */
export type KitStrings = { [Id in keyof typeof defaultStrings]: { [Key in keyof (typeof defaultStrings)[Id]]: StringTemplate } };
/** The ids that have their own strings (everything but `common`). */
export type StringsId = Exclude<keyof KitStrings, "common">;
/** What one component's `strings` prop and one id of a tree's `strings` take: any of its keys, each a template. */
export type ComponentStrings<Id extends keyof KitStrings> = Partial<Record<keyof KitStrings[Id], StringTemplate>>;
/** What a root or provider's `strings` takes: per component id, any of its keys; and `common`. */
export type StringsOverrides = { [Id in keyof KitStrings]?: ComponentStrings<Id> };
/** The keys `s(key)` accepts in a component: its own, then the shared ones. */
export type StringKey<Id extends StringsId> = Extract<keyof KitStrings[Id] | keyof KitStrings["common"], string>;
/**
 * What `useStrings(id)` returns: `s(key, vars?)` is the text; `s.parts(key, vars?)` is the same text cut where a variable sits (see
 * `formatParts`), for the React kit when the words it replaces were several JSX children and the markup must stay as it was.
 */
export type StringsFn<Id extends StringsId> = {
  (key: StringKey<Id>, vars?: StringVars): string;
  parts(key: StringKey<Id>, vars?: StringVars): string[];
};

// --- Formatting ----------------------------------------------------------------------------------

type Rule = { select(n: number): string };
const rules = new Map<string, Rule | null>();

/** `Intl.PluralRules` for the locale, or `null` where there is none (Hermes) or the tag is not valid; the caller then uses English's two forms. */
function pluralRules(locale: string): Rule | null {
  let rule = rules.get(locale);
  if (rule === undefined) {
    try {
      rule = typeof Intl !== "undefined" && typeof Intl.PluralRules === "function" ? new Intl.PluralRules(locale) : null;
    } catch {
      rule = null;
    }
    rules.set(locale, rule);
  }
  return rule;
}

/** The plural form `count` takes in `locale`. */
export function pluralCategory(count: number, locale = "en"): PluralCategory {
  const rule = pluralRules(locale);
  return rule ? (rule.select(count) as PluralCategory) : count === 1 ? "one" : "other";
}

const PLACEHOLDER = /\{\{|\}\}|\{(\w+)\}/g;

/** The number a `count` variable means: a number, or a numeric string (`"1"`); `undefined` for anything else. */
function countOf(count: unknown): number | undefined {
  if (typeof count === "number") return count;
  if (typeof count === "string" && count.trim() !== "" && Number.isFinite(Number(count))) return Number(count);
  return undefined;
}

/** A variable the component passed itself: never one a plain object inherits (`{constructor}`). */
const own = (vars: StringVars, name: string): string | number | undefined => (Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : undefined);

/** The text of a template for these variables: a plural template's form for `count` in `locale`, `other` when there is none. */
function chosen(template: StringTemplate, vars: StringVars, locale: string): string {
  if (typeof template === "string") return template;
  const count = countOf(own(vars, "count"));
  if (count === undefined) return template.other;
  return (count === 0 && template.zero !== undefined ? template.zero : template[pluralCategory(count, locale)]) ?? template.other;
}

/**
 * A template with its variables filled in. A plural template takes the form its `count` variable names in `locale` (`other` when there
 * is no numeric `count` (a numeric string counts, and is written as given), or the template has no entry for the form; `zero` for exactly 0
 * when the template has one). Only the variables passed are read, never an inherited property. A placeholder with no variable stays as
 * written, so a mistake shows where it is made.
 */
export function formatString(template: StringTemplate, vars: StringVars = {}, locale = "en"): string {
  const text = chosen(template, vars, locale);
  if (!text.includes("{") && !text.includes("}")) return text;
  return text.replace(PLACEHOLDER, (match, name?: string) => {
    if (match === "{{") return "{";
    if (match === "}}") return "}";
    const value = own(vars, name!);
    return value === undefined ? match : String(value);
  });
}

/**
 * The same text as `formatString`, cut where a variable was filled in: `"{current}/{max}"` is `["3", "/", "80"]`. Drawn as children, the
 * pieces are separate text nodes, which is what `{current}/{max}` in JSX makes: a component whose markup must not change when its words move
 * into the dictionary uses this. Joined, the pieces are always `formatString`'s result.
 */
export function formatParts(template: StringTemplate, vars: StringVars = {}, locale = "en"): string[] {
  const text = chosen(template, vars, locale);
  const parts: string[] = [];
  let literal = "";
  let at = 0;
  const flush = () => {
    if (literal) parts.push(literal);
    literal = "";
  };
  for (const m of text.matchAll(PLACEHOLDER)) {
    literal += text.slice(at, m.index);
    at = m.index + m[0].length;
    if (m[0] === "{{") literal += "{";
    else if (m[0] === "}}") literal += "}";
    else {
      const value = own(vars, m[1]!);
      if (value === undefined) literal += m[0];
      else {
        flush();
        parts.push(String(value));
      }
    }
  }
  literal += text.slice(at);
  flush();
  return parts;
}

// --- Overrides -----------------------------------------------------------------------------------

/** A nested provider's overrides over its parent's: per component id, per key, the nested one wins. */
export function mergeStrings(parent: StringsOverrides | undefined, own: StringsOverrides | undefined): StringsOverrides | undefined {
  if (!own) return parent;
  if (!parent) return own;
  const out: Record<string, StringGroup | undefined> = { ...(parent as Record<string, StringGroup | undefined>) };
  for (const [id, group] of Object.entries(own as Record<string, StringGroup | undefined>)) if (group) out[id] = { ...out[id], ...group };
  return out as StringsOverrides;
}

/** The overrides read by content (as a theme is read by its id), so an inline `strings={{ … }}` keeps one identity until a template changes. `""` for none. */
export function stringsKey(strings: object | undefined): string {
  if (!strings) return "";
  const norm = (v: unknown): unknown =>
    v && typeof v === "object"
      ? Object.fromEntries(
          Object.entries(v)
            .filter(([, x]) => x !== undefined)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, x]) => [k, norm(x)]),
        )
      : v;
  const text = JSON.stringify(norm(strings));
  return text === "{}" ? "" : text;
}

/**
 * The `s(key, vars?)` of one component: the instance over the tree's overrides over the defaults, each template formatted with `locale`.
 * `useStrings` memoises it; call this directly only outside React.
 */
export function stringsFor<Id extends StringsId>(id: Id, overrides: StringsOverrides | undefined, instance: ComponentStrings<Id> | undefined, locale = "en"): StringsFn<Id> {
  const read = (group: unknown, key: string): StringTemplate | undefined => (group as Record<string, StringTemplate | undefined> | undefined)?.[key];
  const tree = overrides as Record<string, StringGroup | undefined> | undefined;
  const base = defaultStrings as unknown as Record<string, StringGroup | undefined>;
  const find = (key: string) => read(instance, key) ?? read(tree?.[id], key) ?? read(tree?.common, key) ?? read(base[id], key) ?? read(base.common, key);
  const s = (key: string, vars?: StringVars) => {
    const template = find(key);
    return template === undefined ? key : formatString(template, vars, locale);
  };
  s.parts = (key: string, vars?: StringVars) => {
    const template = find(key);
    return template === undefined ? [key] : formatParts(template, vars, locale);
  };
  return s;
}
