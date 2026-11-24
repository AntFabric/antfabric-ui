/**
 * What each token group is, in one place: its tier, the type of its values, the Foundations section that lists it, the components that own
 * it and whether it is part of the documented set. `tokens.json` (`dtcg.ts`), the catalogue's token reference (`token-ref.ts`) and
 * `pnpm check` all read this, so a new group is declared once and a group nobody declared fails the build instead of being guessed.
 *
 * The tiers:
 *   primitive   raw values mirrored from the product (`primitives.ts`); no component reads one, and none is listed here
 *   semantic    a role any component may read: `fg.muted`, `space.md`, `control.hMd`
 *   component   a value that belongs to the components named in `owners`: `chip.removeSize`, `osBadge.winLabel`
 *
 * A reference points down the tiers only: component to semantic to primitive.
 */

export type DtcgType = "color" | "dimension" | "duration" | "cubicBezier" | "fontFamily" | "fontWeight" | "number" | "shadow" | "gradient";
export type TokenTier = "semantic" | "component";
/** `internal` tokens resolve and can be themed like any other, and are left out of the documented set: a picture of an OS surface, one component's private geometry. */
export type TokenVisibility = "public" | "internal";
/** The Foundations section that lists a group's values. A group's colours are always in Colour, and its shadows in Elevation, whatever this says. */
export type TokenSection = "colour" | "type" | "space" | "radius" | "size" | "components" | "elevation" | "motion" | "layers" | "materials" | "data";

export interface TokenGroup {
  tier: TokenTier;
  /** The type of every value in the group, or a rule from the key (and the whole path) where a group mixes types. */
  type: DtcgType | ((key: string, path: string) => DtcgType);
  section: TokenSection;
  /** The docs ids of the components a component group belongs to. */
  owners?: readonly string[];
  visibility?: TokenVisibility;
  /** A kit file may read it with no recipe entry: the gaps that lay parts out and how things move. */
  structural?: true;
}

const semantic = (type: TokenGroup["type"], section: TokenSection, more: Partial<TokenGroup> = {}): TokenGroup => ({ tier: "semantic", type, section, ...more });
const component = (type: TokenGroup["type"], owners: readonly string[], more: Partial<TokenGroup> = {}): TokenGroup => ({ tier: "component", type, section: "components", owners, ...more });
/** A picture of a surface the operating system draws: it has tokens so the literal ratchet holds, and nobody themes it. */
const picture = (type: TokenGroup["type"], owners: readonly string[]): TokenGroup => component(type, owners, { visibility: "internal" });

const CHART_COLOUR = /^(series\d|previous|other|grid|axis|label|crosshair|reference|tooltip|tooltipText|tooltipMuted|tooltipRule|track)$/;
const CHARTS = ["bar-chart", "breakdown", "combo-chart", "donut-chart", "gauge-chart", "goal-rings", "line-chart", "meter", "metric-tabs", "period-compare", "progress-ring", "radar-chart", "spark-bars", "sparkline"] as const;

/**
 * Every top-level group of `tokens.ts`. The order is the order the Foundations page lists a section's groups in.
 */
export const tokenRegistry: Record<string, TokenGroup> = {
  // Type
  text: semantic("dimension", "type"),
  // A font file is a family name: the phone loads one file per weight.
  font: semantic((key) => (key.startsWith("weight") ? "fontWeight" : "fontFamily"), "type"),
  tracking: semantic("number", "type"),

  // Space
  space: semantic("dimension", "space", { structural: true }),
  gutter: semantic("dimension", "space"),

  // Radius
  radius: semantic("dimension", "radius"),

  // Size: controls, rows, the profile's chrome, avatars, icons, and the widths of `border`
  control: semantic("dimension", "size"),
  row: semantic("dimension", "size"),
  breadcrumb: semantic("dimension", "size"),
  topbar: semantic("dimension", "size"),
  rail: semantic("dimension", "size"),
  tabbar: semantic("dimension", "size"),
  statusbar: semantic("dimension", "size"),
  homeIndicator: semantic("dimension", "size"),
  avatar: semantic("dimension", "size"),
  icon: semantic((key) => (key.startsWith("stroke") ? "number" : "dimension"), "size"),
  // `border.wHairline` is a width; every other `border.*` is a colour.
  border: semantic((key) => (/^w[A-Z]/.test(key) ? "dimension" : "color"), "size"),

  // Elevation, motion, layers, materials
  shadow: semantic("shadow", "elevation"),
  duration: semantic("duration", "motion", { structural: true }),
  ease: semantic("cubicBezier", "motion", { structural: true }),
  z: semantic("number", "layers"),
  opacity: semantic("number", "layers"),
  glass: semantic((key) => (key === "blur" ? "dimension" : key === "saturate" ? "number" : "color"), "materials"),

  // Colour
  surface: semantic("color", "colour"),
  fg: semantic("color", "colour"),
  brand: semantic("color", "colour"),
  accent: semantic("color", "colour"),
  focus: semantic("color", "colour"),
  hover: semantic("color", "colour"),
  link: semantic("color", "colour"),
  success: semantic("color", "colour"),
  warning: semantic("color", "colour"),
  danger: semantic("color", "colour"),
  info: semantic("color", "colour"),
  identity: semantic("color", "colour"),
  presence: semantic("color", "colour"),
  scrim: semantic("color", "colour"),
  skeleton: semantic("color", "colour"),
  tag: semantic("color", "colour"),
  banner: semantic("color", "colour"),
  tabs: semantic("color", "colour"),
  // The colours an operating system draws its own chrome in, for the components that imitate it.
  os: semantic((_key, path) => (path === "os.wallpaper" ? "gradient" : "color"), "colour", { visibility: "internal" }),

  // Data: the charts' own palette and geometry, the data status colours, the table
  // Text and its phone files are families; a colour has one of these names; everything else is a size (a dash is a length).
  chart: component((key) => (/^(font|file)/.test(key) ? "fontFamily" : CHART_COLOUR.test(key) ? "color" : "dimension"), CHARTS, { section: "data" }),
  data: semantic("color", "data"),
  table: component((key) => (/^(header|rowHover|rowSelected|divider)$/.test(key) ? "color" : "dimension"), ["table"], { section: "data" }),

  // Components: families several components share
  dot: semantic("dimension", "components"),
  phone: semantic("dimension", "components"),
  sheet: component("dimension", ["bottom-sheet", "context-menu", "dialog", "in-app-banner", "notification-schedule", "permission-prompt", "select", "sheet", "tab-bar", "update-banner", "workspace-switcher"]),
  choice: component("dimension", ["checkbox", "radio-group", "select", "switch"]),
  checkbox: component("dimension", ["checkbox", "composer", "list-item", "menu"]),
  textField: component("dimension", ["form-field", "text-area", "text-field"]),
  menu: component("dimension", ["context-menu", "menu"]),
  kpi: component("dimension", ["kpi-card", "meter", "metric-tabs", "period-compare", "progress-ring", "spark-bars", "stat-tile"]),
  navRail: component("dimension", ["nav-rail", "workspace-switcher"]),
  sidebar: component("dimension", ["sidebar-item", "sidebar-section"]),

  // Components: one component's own
  button: component("dimension", ["button"]),
  fab: component("dimension", ["fab"]),
  iconButton: component("dimension", ["icon-button"]),
  segmentedControl: component("dimension", ["segmented-control"]),
  radioGroup: component("dimension", ["radio-group"]),
  chip: component("dimension", ["chip"]),
  select: component("dimension", ["select"]),
  switch: component((key) => (key === "thumbShadow" ? "shadow" : key === "trackOff" || key === "thumb" ? "color" : "dimension"), ["switch"]),
  inAppBanner: component("dimension", ["in-app-banner"]),
  notificationItem: component("dimension", ["notification-item"]),
  notificationSchedule: component("dimension", ["notification-schedule"]),
  permissionPrompt: component("dimension", ["permission-prompt"]),
  breadcrumbs: component("dimension", ["breadcrumbs"]),
  tab: component("dimension", ["tabs"]),
  workspace: component("dimension", ["workspace-switcher"]),
  mobileHeader: component("dimension", ["mobile-header"]),
  tabBar: component("dimension", ["tab-bar"]),
  palette: component("dimension", ["command-palette"]),
  emoji: component("dimension", ["context-menu"]),
  contextMenu: component("dimension", ["context-menu"]),
  dialog: component("dimension", ["dialog"]),
  hoverCard: component("dimension", ["hover-card"]),
  tooltip: component("dimension", ["tooltip"]),
  connectionBanner: component("dimension", ["connection-banner"]),
  sessionState: component("dimension", ["session-state"]),
  updateBanner: component("dimension", ["update-banner"]),
  questionPanel: component("dimension", ["question-panel"]),
  thinking: component("dimension", ["thinking-indicator"]),
  agentSteps: component("dimension", ["agent-steps"]),

  // Components: pictures of what an operating system draws
  osBadge: picture("dimension", ["app-badge"]),
  osNotification: picture("dimension", ["os-notification"]),
  osTray: picture("dimension", ["tray-menu"]),
  osMenu: picture("dimension", ["app-menu-bar"]),
  osWindow: picture("dimension", ["breadcrumbs", "title-bar"]),
  osHeader: picture("dimension", ["mobile-header", "tab-bar"]),
};

export interface TokenMeta {
  group: string;
  tier: TokenTier;
  type: DtcgType;
  section: TokenSection;
  owners: readonly string[];
  visibility: TokenVisibility;
  structural: boolean;
}

/** What a token is, from the group it lives in. A token of a group nobody declared fails here instead of being guessed. */
export function tokenMeta(path: string): TokenMeta {
  const [group, ...rest] = path.split(".");
  const entry = tokenRegistry[group!];
  if (!entry) throw new Error(`tokens: "${path}" is in the group "${group}", which packages/core/src/token-registry.ts does not declare`);
  return {
    group: group!,
    tier: entry.tier,
    type: typeof entry.type === "function" ? entry.type(rest[0] ?? "", path) : entry.type,
    section: entry.section,
    owners: entry.owners ?? [],
    visibility: entry.visibility ?? "public",
    structural: entry.structural === true,
  };
}
