/**
 * What the catalogue says about a component. The component itself is code, in
 * `@antfabric-ui/react` (web and desktop) and `@antfabric-ui/react-native` (mobile); this is
 * everything around it: the props as documented and played with, examples, edge cases, how each
 * platform treats it, and its flows.
 */

import type { EnterMotion, InteractionState, OS, Platform } from "@antfabric-ui/core";

export type { EnterMotion, InteractionState, OS, Platform };

export type PropType = "string" | "number" | "boolean" | "enum" | "icon" | "array" | "object" | "event" | "node";

/** A prop as the catalogue lists it and the playground edits it. The kits' TypeScript props are the contract. */
export interface PropDoc {
  type: PropType;
  description?: string;
  /** The component's own default: what a product gets when it passes nothing. `components.json`, `llms.txt` and `pnpm describe` print it. */
  default?: unknown;
  /**
   * What the catalogue passes when nothing else does: AntFabric's showcase (its destinations, its tabs, its workspace), where the
   * component's real `default` is generic or empty. Every render, the playground's controls and the usage code start from
   * `sample ?? default` (`withDefaults`); `components.json`, `llms.txt` and `pnpm describe` list it as the catalogue's example value,
   * beside `default`. Never on an event.
   */
  sample?: unknown;
  options?: (string | number)[];
  required?: boolean;
  /** Only some platforms take it (e.g. `shortcut` means nothing on a phone). */
  platforms?: Platform[];
  /** For an event: the parameters it is called with, as TypeScript (`item: MenuItem`). */
  args?: string;
  /**
   * For an event that reports a prop's new value as its first argument (`onCheckedChange` →
   * `checked`). The component is controlled when it is given both; the playground passes both and
   * moves its control when the event fires.
   */
  changes?: string;
}

export type SupportStatus = "ready" | "partial" | "planned" | "not-applicable";

export interface PlatformDoc {
  status: SupportStatus;
  /** What the component is built on in this kit. */
  base?: string;
  /** Import as an app writes it. */
  import?: string;
  /** When not applicable: what to use instead on this platform. */
  alternative?: string;
  notes?: string[];
  keyboard?: { keys: string; action: string }[];
  gestures?: { gesture: string; action: string }[];
}

/**
 * Style for a scene's boxes and text, in a small vocabulary both kits draw: `bg`, `paddingX`,
 * `radius`, `align`, `justify`, `direction`, `truncate`, plain CSS-like keys, and token references
 * written `$space.md`.
 */
export interface SceneStyle {
  [key: string]: string | number | SceneStyle;
}

/**
 * A composition drawn around a component: an example's slot content, or a flow frame's scene (the
 * CTA and the dialog it opens). The catalogue draws it with whichever kit the platform uses.
 */
export interface Scene {
  el: "component" | "view" | "text" | "icon" | "input" | "textarea";
  /** For `component`: the component's id. */
  use?: string;
  props?: Record<string, unknown>;
  style?: SceneStyle;
  text?: string;
  icon?: string;
  attrs?: Record<string, string | number | boolean>;
  enter?: EnterMotion;
  children?: Scene[];
}

export interface Example {
  name: string;
  description?: string;
  /** Values may be scenes, for a slot (`content`, `trailing`). */
  props?: Record<string, unknown>;
  platforms?: Platform[];
  os?: OS;
  /** Force an interaction state for a static snapshot. */
  state?: InteractionState;
  /** Width of the preview in px, for components that fill their container. */
  width?: number;
}

export interface EdgeCase {
  title: string;
  platforms: Platform[];
  handling: string;
  example?: Example;
}

/**
 * One step of a flow. Read in order, the steps say where the data comes from, what the person does,
 * which event fires, whose state changes, what moves, and what they see after.
 */
export type FlowStepKind = "data" | "trigger" | "event" | "state" | "effect" | "motion" | "result";

export interface FlowStep {
  kind: FlowStepKind;
  title: string;
  detail?: string;
  /** The line of code the step comes down to: `onSelect(item)`, `useChannel(id).muted`. */
  code?: string;
  /** A motion step's entrance. */
  enter?: EnterMotion;
  platforms?: Platform[];
  /**
   * The flowchart lane, when the kind alone puts it in the wrong one: a trigger that arrives from the
   * server or the OS (a socket event, the connection dropping) rather than from the person.
   */
  lane?: "person" | "component" | "app" | "system";
}

/** One frame of a flow's replay: the component with `props`, or a `scene`, held for `hold` ms. */
export interface FlowFrame {
  /** Index into the flow's `steps`: the step this frame shows. */
  step: number;
  props?: Record<string, unknown>;
  scene?: Scene;
  /** Draws a press on the nth pressable of the frame, on the root of the named component, or on the control with this label or text. */
  press?: number | string;
  hold?: number;
  platforms?: Platform[];
}

export interface Flow {
  id: string;
  title: string;
  description?: string;
  platforms: Platform[];
  steps: FlowStep[];
  replay?: FlowFrame[];
  /** Width of the replay stage in px, for components that fill their container. */
  width?: number;
}

/**
 * How big a component is, in atomic design's terms. An atom is one control or mark that does not
 * break down further (Button, Badge, Tooltip); a molecule is a few atoms doing one job together
 * (Search field, List item, Menu); an organism is a whole region of a screen (Dialog, Composer,
 * Nav rail). A component never composes one at a higher level than its own: `pnpm check` reads
 * each kit file's imports and fails if, say, an atom draws a molecule.
 */
export type Level = "atom" | "molecule" | "organism";

/**
 * The subgroups of the catalogue's Data section, for a component whose category is `data`: KPIs (a value, its change, its trend),
 * Charts, Panels (a KPI beside the chart that explains it) and Tables. Every other component has none.
 */
export type DataGroup = "kpi" | "chart" | "panel" | "table";

/** One drawing of a matrix row: `props` over the component's defaults (and samples), captioned `name`. */
export interface MatrixCase {
  name: string;
  /** Values may be scenes, for a slot, as an example's are. */
  props: Record<string, unknown>;
}

/**
 * One row of the Variants section. Plain, it draws `prop` at each of `values` (default: the prop's `options`, or `false` and `true` for a
 * boolean; `""` is skipped), each captioned with the value. With `cases`, it draws each case's `props` instead, in the order given,
 * captioned with its `name`: a row over something that is not one prop's value (a removed `kind` becoming the bundle of props it
 * implied). Then `prop` is the row's heading and need not be a declared prop, and `values` is not given. `width` sizes each preview, for
 * components that fill their container.
 */
export interface MatrixDoc {
  prop: string;
  values?: (string | number | boolean)[];
  cases?: MatrixCase[];
  width?: number;
}

export interface ComponentDocs {
  id: string;
  name: string;
  category: string;
  level: Level;
  /** `data` components only: the subgroup of the Data section the catalogue lists it under. */
  group?: DataGroup;
  status: "stable" | "beta" | "draft";
  description: string;
  props: Record<string, PropDoc>;
  platforms: Record<Platform, PlatformDoc>;
  a11y?: { role?: string; label?: string; notes?: string[] };
  examples: Example[];
  /** One prop across its options, drawn as a row (see `MatrixDoc`). */
  matrix?: MatrixDoc[];
  states?: InteractionState[];
  edgeCases?: EdgeCase[];
  related?: string[];
  flows?: Flow[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface LevelDoc {
  id: Level;
  name: string;
  description: string;
}

/** A whole screen, composed from components, shown in a device frame. Its drawing is in the catalogue. */
export interface ScreenDocs {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  frame: "browser" | "window" | "phone";
  width?: number;
  height?: number;
  /** Phone frame: the wallpaper behind the status bar (a lock screen). */
  wallpaper?: boolean;
  /** Browser frame: the tab title and the address. */
  tab?: string;
  url?: string;
  notes?: string[];
}
