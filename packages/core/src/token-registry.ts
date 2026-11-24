/**
 * What each token group is, in one place: its tier, the type of its values, the Foundations section that lists it, the components that own
 * it and whether it is part of the documented set. `tokens.json` (`dtcg.ts`), the catalogue's token reference (`token-ref.ts`) and
 * `pnpm check` all read this, so a new group is declared once and a group nobody declared fails the build instead of being guessed.
 *
 * The tiers:
 *   primitive   raw values mirrored from the product (`primitives.ts`); no component reads one, and none is listed here
 *   semantic    a role any component may read: `color.text.muted`, `space.md`, `size.control.md`
 *   component   a value that belongs to the components named in `owners`: `chip.removeSize`, `select.panelMaxHeight`
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
  /**
   * The keys of the group that are internal while the group is public: one component's private geometry (an offset, an inset, a least or
   * most size, a loading placeholder's width, a breakpoint). A theme can still set one; it is left out of what a reader picks from.
   */
  internal?: readonly string[];
  /** A kit file may read it with no recipe entry: the gaps that lay parts out and how things move. */
  structural?: true;
}

const semantic = (type: TokenGroup["type"], section: TokenSection, more: Partial<TokenGroup> = {}): TokenGroup => ({ tier: "semantic", type, section, ...more });
const component = (type: TokenGroup["type"], owners: readonly string[], more: Partial<TokenGroup> = {}): TokenGroup => ({ tier: "component", type, section: "components", owners, ...more });
/** A picture of a surface the operating system draws: it has tokens so the literal ratchet holds, and nobody themes it. */
const picture = (type: TokenGroup["type"], owners: readonly string[]): TokenGroup => component(type, owners, { visibility: "internal" });

/** What a component token's value is, from its key: `gridColor` is a colour, `thumbShadow` a shadow, `fontFamily` and a font file a family, anything else a size. */
const byKey = (key: string): DtcgType => (/Color(\d|[A-Z]|$)/.test(key) ? "color" : /Shadow$/.test(key) ? "shadow" : /^font(Family|File)/.test(key) ? "fontFamily" : "dimension");
const CHARTS = ["bar-chart", "breakdown", "combo-chart", "donut-chart", "gauge-chart", "goal-rings", "line-chart", "meter", "metric-tabs", "period-compare", "progress-ring", "radar-chart", "spark-bars", "sparkline"] as const;

/**
 * Every top-level group of `tokens.ts`. A semantic group is a category (`color`, `size`, `font`); a component group is the camelCase of a
 * component's docs id, or a family several components share (`chart`, `kpi`, `choice`, `sheet`). The order is the order the Foundations
 * page lists a section's groups in.
 */
export const tokenRegistry: Record<string, TokenGroup> = {
  // Colour: `color.text.*`, `color.background.*`, `color.border.*`
  color: semantic("color", "colour"),

  // Type: families, sizes, line heights, weights, letter spacing, and the files the phone loads (a file is a family name)
  font: semantic((key) => (key === "weight" ? "fontWeight" : key === "letterSpacing" ? "number" : key === "size" || key === "lineHeight" ? "dimension" : "fontFamily"), "type"),

  // Space
  space: semantic("dimension", "space", { structural: true }),

  // Radius
  radius: semantic("dimension", "radius"),

  // Size: controls, rows, the profile's chrome, avatars, icons (a stroke is a number), and the widths of `border`
  size: semantic((key) => (key === "stroke" ? "number" : "dimension"), "size"),
  border: semantic("dimension", "size"),

  // Elevation, motion, layers, materials
  elevation: semantic("shadow", "elevation"),
  motion: semantic((key) => (key === "duration" ? "duration" : "cubicBezier"), "motion", { structural: true }),
  zIndex: semantic("number", "layers"),
  opacity: semantic("number", "layers"),
  effect: semantic((_key, path) => (path.endsWith(".blur") ? "dimension" : "number"), "materials"),

  // The colours an operating system draws its own chrome in, for the components that imitate it.
  os: semantic((_key, path) => (path === "os.wallpaper" ? "gradient" : "color"), "colour", { visibility: "internal" }),

  // Data: the charts' own palette and geometry, and the table
  chart: component(byKey, CHARTS, { section: "data", internal: ["gridDash", "referenceDash", "seriesDash", "endLabelWidth", "activeRingWidth", "stackGap", "signedRadius", "edgeInset", "plotMinWidth", "barMinWidth", "labelBandHeight", "tipWidth", "tipBaseHeight", "tipRowHeight", "sliceGap", "sliceRadius", "sliceInset", "gaugeCapRadius", "tickWidth", "tickOverhang", "listMinWidth", "splitHeight", "splitGap", "splitMinWidth", "tabMinWidth", "ruleHeight", "sideWidth", "keyWidth", "partMinWidth", "sparkWidth", "barMaxWidth", "previousWidth"] }),
  table: component(byKey, ["table"], { section: "data", internal: ["checkWidth", "sparkWidth", "sparkHeight", "loadWidthSm", "loadWidthMd", "loadWidthLg", "loadHeight", "loadCardWidthSm", "loadCardWidthLg", "cardsBreakpoint"] }),

  // Components: families several components share
  sheet: component(byKey, ["bottom-sheet", "context-menu", "dialog", "in-app-banner", "notification-schedule", "permission-prompt", "select", "sheet", "tab-bar", "update-banner", "workspace-switcher"], { internal: ["grabberWidth", "grabberHeight", "contentMinHeight", "titleLineHeight"] }),
  choice: component(byKey, ["checkbox", "radio-group", "select", "switch"], { internal: ["pillGap", "ringOffsetY"] }),
  checkbox: component(byKey, ["checkbox", "composer", "list-item", "menu"], { internal: ["tickSize"] }),
  textField: component(byKey, ["form-field", "text-area", "text-field"], { internal: ["tagPaddingX", "trailingOffsetX", "prefixOffsetX"] }),
  menu: component(byKey, ["context-menu", "menu"]),
  kpi: component(byKey, ["kpi-card", "meter", "metric-tabs", "period-compare", "progress-ring", "spark-bars", "stat-tile"], { internal: ["sparkBarRadius", "meterMinWidth", "ringMinWidth", "cardTrendHeight", "tileTrendWidth", "tileBarsWidth", "loadWidthSm", "loadWidthMd", "loadWidthLg", "loadWidthXl", "loadLineHeight", "loadValueHeight", "sparkBarMaxWidth", "tileTrendHeight"] }),
  navRail: component(byKey, ["nav-rail", "workspace-switcher"], { internal: ["badgeOffsetY", "badgeOffsetX", "logoFontSize", "chipHeight"] }),
  sidebarSection: component(byKey, ["sidebar-item", "sidebar-section"], { internal: ["hashWidth", "sectionPaddingTop", "sectionGap", "sectionHeaderHeight"] }),

  // Components: one component's own
  button: component(byKey, ["button"]),
  fab: component(byKey, ["fab"]),
  iconButton: component(byKey, ["icon-button"], { internal: ["badgeOffsetY", "badgeOffsetX"] }),
  segmentedControl: component(byKey, ["segmented-control"], { internal: ["countSize", "cardInset"] }),
  radioGroup: component(byKey, ["radio-group"], { internal: ["cardMinWidth"] }),
  chip: component(byKey, ["chip"]),
  select: component(byKey, ["select"], { internal: ["chipHeight", "triggerGap", "panelMaxHeight", "panelMinWidth", "dotGap"] }),
  switch: component(byKey, ["switch"], { internal: ["thumbTravel"] }),
  inAppBanner: component(byKey, ["in-app-banner"], { internal: ["dismissInset"] }),
  notificationItem: component(byKey, ["notification-item"], { internal: ["kindBadgeSize", "kindBadgeRadius", "textGap", "metaGap"] }),
  notificationSchedule: component(byKey, ["notification-schedule"], { internal: ["noteMaxWidth"] }),
  permissionPrompt: component(byKey, ["permission-prompt"], { internal: ["addressHeight", "lockSize"] }),
  breadcrumbs: component(byKey, ["breadcrumbs"], { internal: ["recordingGap", "recordingDotSize", "crumbMaxWidth"] }),
  tabs: component(byKey, ["tabs"], { internal: ["countSize"] }),
  workspaceSwitcher: component(byKey, ["workspace-switcher"], { internal: ["markerOffsetY", "markerWidth", "markerRadius", "badgeOffsetY", "badgeOffsetX"] }),
  mobileHeader: component(byKey, ["mobile-header"], { internal: ["rowMinHeight", "largeTitleLineHeight", "titleInset"] }),
  tabBar: component(byKey, ["tab-bar"], { internal: ["badgeOffsetX", "labelLineHeight", "labelMaxWidth", "itemSizeSqueezed"] }),
  commandPalette: component(byKey, ["command-palette"], { internal: ["slotSize", "listMaxHeight"] }),
  contextMenu: component(byKey, ["context-menu"], { internal: ["emojiFontSize", "emojiGridFontSize", "sceneOffsetX"] }),
  dialog: component(byKey, ["dialog"], { internal: ["bodyMaxHeight", "actionMinWidth", "bodyGap"] }),
  hoverCard: component(byKey, ["hover-card"], { internal: ["headGap", "guestHeight", "guestPaddingX", "presenceDotSize"] }),
  tooltip: component(byKey, ["tooltip"], { internal: ["kbdHeight", "kbdFontSize"] }),
  connectionBanner: component(byKey, ["connection-banner"]),
  sessionState: component(byKey, ["session-state"], { internal: ["proseMaxWidth"] }),
  updateBanner: component(byKey, ["update-banner"], { internal: ["dotInset", "versionTileSize"] }),
  questionPanel: component(byKey, ["question-panel"], { internal: ["keySize", "detailsMaxHeight", "elbowWidth", "elbowHeight", "elbowRadius", "confirmInset", "argsMaxHeight", "argKeyMinWidth"] }),
  thinkingIndicator: component(byKey, ["thinking-indicator"], { internal: ["cellSize", "cellRadius", "markWidth"] }),
  agentSteps: component(byKey, ["agent-steps"], { internal: ["markerSize"] }),

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
    visibility: entry.visibility ?? (entry.internal?.includes(rest.join(".")) ? "internal" : "public"),
    structural: entry.structural === true,
  };
}
