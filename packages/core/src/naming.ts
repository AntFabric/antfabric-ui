/**
 * How a token is named, as data: the grammar, the fixed words, and what each means. `naming.json` (written by `pnpm tokens:build`, served
 * at `/naming.json`) is this file for tools and agents; `pnpm check names` holds every token to it.
 *
 *   semantic    category . property . role            color.text.muted · size.control.md · font.lineHeight.body · motion.duration.fast
 *   component   componentId . partPropertyVariant     chip.removeSize · select.panelMaxHeight · chart.gridColor · dialog.widthForm
 *
 * A semantic token's first word is its category and its second the property the role is for. A component token's group is the camelCase
 * of the component's docs id (or a family several components share: `chart`, `kpi`, `choice`, `sheet`), and its key is one camelCase word
 * that ends in what the value is (`Height`, `PaddingX`, `Color`), after the part it belongs to and before a variant. Words are whole: no
 * `H`, `W`, `Pad`. A mode is never in a name: light and dark, and web, desktop and mobile, are values of one token.
 */

import { tokenMeta, tokenRegistry } from "./token-registry";

export const naming = {
  tiers: {
    primitive: "A raw value mirrored from the product (`primitives.color.coral.500`). No component reads one.",
    semantic: "A role any component may read, named category first (`color.text.muted`).",
    component: "A value owned by the components its group names (`chip.removeSize`). An alias of a semantic token wherever the role is the same.",
  },
  /** The semantic categories, the properties each has, and what they hold. `null` means the category has no property level (`radius.card`). */
  categories: {
    color: { is: "A colour, by what it paints.", properties: { text: "Text and icons.", background: "Fills and surfaces.", border: "Edges, dividers and focus rings." } },
    font: {
      is: "Type.",
      properties: { family: "A font family.", size: "A font size.", lineHeight: "The line height that goes with the size of the same name.", weight: "A font weight.", letterSpacing: "Letter spacing, in em.", file: "The file the phone loads for a face and a weight." },
    },
    size: {
      is: "The size of a thing: a height, a width or a side.",
      properties: { control: "A control's height.", icon: "An icon's side.", stroke: "An icon's line weight.", dot: "A status dot's diameter.", row: "A list row's height.", avatar: "An avatar's side.", target: "The least a pointer or touch target is.", layout: "The app frame: rails, bars and insets." },
    },
    space: { is: "Padding, gaps and margins: one scale, and the gutters under `space.gutter`.", properties: null },
    radius: { is: "A corner radius, named for the thing that wears it.", properties: null },
    border: { is: "A border's width. Its colour is `color.border.*`.", properties: { width: "A border's width." } },
    motion: { is: "How things move.", properties: { duration: "How long.", easing: "The curve." } },
    elevation: { is: "Lift off the surface.", properties: { shadow: "A shadow." } },
    zIndex: { is: "Stacking order.", properties: null },
    opacity: { is: "A fade applied to a whole element.", properties: null },
    effect: { is: "A material's filter values.", properties: { glass: "Liquid Glass: blur and saturation." } },
  },
  /** What a component token's key ends in (before a variant): the property the value is. */
  componentProperties: {
    Height: "A height.", Width: "A width.", MinHeight: "The least height.", MaxHeight: "The most height.", MinWidth: "The least width.", MaxWidth: "The most width.",
    Size: "A side or a diameter, where width and height are one.", Radius: "A corner radius.", Gap: "The space between two things.",
    Padding: "Padding on every side.", PaddingX: "Padding at both sides.", PaddingY: "Padding above and below.", PaddingLeft: "Padding at the start.", PaddingTop: "Padding above.",
    Inset: "How far in from an edge.", OffsetX: "A sideways shift (negative hangs outside).", OffsetY: "A vertical shift (negative hangs outside).", Offset: "A shift on both axes.", Overhang: "How far past an edge.",
    FontSize: "A font size.", LineHeight: "A line height.", Color: "A colour.", Shadow: "A shadow.", FontFamily: "A font family.", FontFile: "The phone's font file.",
    Dash: "The length of a dash.", Travel: "How far a part slides.", Breakpoint: "The width at which the layout changes.",
  },
  /** Words that follow the property: a size, or a state. */
  sizes: ["xxs", "xs", "sm", "md", "lg", "xl", "2xs", "3xs", "2xl", "3xl", "4xl", "5xl"],
  states: { hover: "Under the pointer.", pressed: "Held down.", focus: "Has keyboard focus.", selected: "The current or chosen one.", disabled: "Cannot be used." },
  emphasis: { subtle: "Quietest.", muted: "Quiet.", default: "The usual one: no word is also the default.", strong: "Loudest." },
  /** Words a designer may know by another name. */
  glossary: {
    "color.background": "Called surface in some systems: a fill something sits on.",
    "color.text": "Called foreground (fg): text and icons.",
    soft: "A pale wash of a colour, for a tinted surface. Text on it is `on<Colour>Soft`.",
    "on<Fill>": "The text and icon colour that reads on that fill: `color.text.onBrand` on `color.background.brand.default`.",
    lineHeight: "Called leading.",
    letterSpacing: "Called tracking.",
    scrim: "The dim layer behind a modal: a backdrop.",
    target: "The area a pointer or a finger can hit, which may be larger than what is drawn.",
    gutter: "The space between panes and around a page.",
  },
  /** A mode is a value, never a word in a name. */
  modes: { scheme: ["light", "dark"], profile: ["web", "desktop", "mobile"], os: ["android"] },
} as const;

const PLATFORM_WORD = /(^|[a-z])(Android|Ios|Mac|Win|Windows|Linux|Browser)([A-Z]|$)|^(android|ios|mac|win|windows|linux|browser)([A-Z]|$)/;
const ABBREVIATION = /[a-z](H|W)$|[a-z](H|W)[A-Z]|Pad(?!ding)|(Min|Max)(H|W)(?![a-z])/;
const PROPERTY = new RegExp(`(${Object.keys(naming.componentProperties).sort((a, b) => b.length - a.length).join("|")})(?=[A-Z0-9]|$)`);
const SEGMENT = /^([a-z][A-Za-z0-9]*|[2-5]x[sl])$/;

/**
 * What is wrong with a token's name, by the rules above; empty when nothing is. An `internal` token (a picture of OS chrome) is held only
 * to the shape of its segments: it is not part of the documented vocabulary.
 */
export function tokenNameProblems(path: string): string[] {
  const out: string[] = [];
  const segments = path.split(".");
  const meta = tokenMeta(path);
  for (const s of segments) if (!SEGMENT.test(s)) out.push(`"${s}" is not a camelCase word`);
  if (meta.visibility === "internal") return out;
  if (meta.tier === "semantic") {
    const category = naming.categories[meta.group as keyof typeof naming.categories];
    if (!category) return [...out, `"${meta.group}" is not a category (${Object.keys(naming.categories).join(", ")})`];
    if (category.properties) {
      if (segments.length < 3) out.push(`a ${meta.group} token is ${meta.group}.<property>.<role>`);
      else if (!(segments[1]! in category.properties)) out.push(`"${segments[1]}" is not a property of ${meta.group} (${Object.keys(category.properties).join(", ")})`);
    }
    if (segments.slice(1).some((s) => PLATFORM_WORD.test(s))) out.push("names a platform: a platform is a mode of one token, not a word in its name");
    return out;
  }
  if (segments.length !== 2) out.push("a component token is <componentId>.<key>, one camelCase key");
  const key = segments[segments.length - 1]!;
  if (ABBREVIATION.test(key)) out.push(`"${key}" abbreviates a word (Height, Width, Padding, PaddingX)`);
  if (!PROPERTY.test(key[0]!.toUpperCase() + key.slice(1))) out.push(`"${key}" does not say what the value is (${Object.keys(naming.componentProperties).slice(0, 8).join(", ")}, …)`);
  return out;
}

/** `naming.json`: the vocabulary and the groups, for a tool or an agent that has to read or write a token name. */
export function namingJson(): string {
  const groups = Object.fromEntries(Object.entries(tokenRegistry).map(([name, g]) => [name, { tier: g.tier, ...(g.owners ? { components: g.owners } : {}), ...(g.visibility === "internal" ? { visibility: "internal" } : {}) }]));
  return `${JSON.stringify({ $description: "How AntFabric UI's design tokens are named. Generated by `pnpm tokens:build` from packages/core/src/naming.ts and token-registry.ts; `pnpm check names` holds every token to it.", grammar: { semantic: "category.property.role", component: "componentId.partPropertyVariant", cssVariable: "--af- + the path in kebab case", figmaVariable: "the path with / for ." }, ...naming, groups }, null, 2)}\n`;
}
