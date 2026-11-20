/**
 * The item shapes both kits draw from data: a menu's rows, a place to go, a button the kit draws for the product, an app's mark. They live
 * here, once, and each kit re-exports them as types from its root (`import type { MenuItem } from "@antfabric/ui-react"`). An icon is a
 * lucide name in kebab case (`IconName` is `string` in both kits). Items carry no functions: data stays serialisable, so a product can build
 * it from config or plugins and the docs can describe it. A component that needs more extends one of these in its own file; nothing adds
 * fields to the base types here.
 */

/** A row of a menu. Menu, ContextMenu, AppMenuBar and TrayMenu draw it. */
export interface MenuItem {
  /** What `onSelect`, `toggled` and `highlight` match; falls back to `label`. */
  key?: string;
  /** Leave it out for a row; `separator` draws a hairline and `label` a heading (a tray's dimmed readout). */
  type?: "item" | "separator" | "label";
  label?: string;
  icon?: string;
  /** A second line: what the row will do, or why it is disabled. */
  sublabel?: string;
  /** A trailing number or word: 3, "Mentions", "9:00". */
  count?: string | number;
  /** Written once, `Mod+F`. Drawn on web and desktop only; a phone has no shortcut column. */
  shortcut?: string;
  /** What the web draws instead when the browser owns the desktop shortcut; "" draws nothing. */
  webShortcut?: string;
  /** true / false makes the row a toggle; leave it out for an ordinary row. */
  checked?: boolean;
  tone?: "danger";
  disabled?: boolean;
  /** Opens a menu of its own; AppMenuBar draws only its chevron, TrayMenu opens it. */
  submenu?: MenuItem[];
}

/** A place to go: NavRail's destinations, sections and bottom rows, TabBar's tabs. */
export interface NavItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
  /** The badge prints up to this, then max+, as on Badge. Default 9. */
  max?: number;
  /** What the badge is read as: "unread notifications". Default: the component's `unread` string. */
  badgeLabel?: string;
  /** NavRail drill-in: what pressing it lists under its icon. */
  sections?: NavItem[];
}

/** A button the kit draws for the product: a bar's icon buttons, a header's actions, a floating action, a notification's buttons. */
export interface ActionItem {
  key: string;
  /** The accessible name; drawn as text where the component draws labels. */
  label: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

/** A button that is only an icon: TitleBar's, WebTopBar's and MobileHeader's actions, Composer's tools, MessageActions' actions. A product's action cannot draw a blank button. */
export type IconActionItem = ActionItem & { icon: string };

/** A one-colour vector mark the kit draws at its own size and colour (the app icon in AppBadge). */
export interface AppMark {
  viewBox: string;
  paths: readonly { d: string; evenOdd?: boolean }[];
}

/** What a menu row is matched by: its `key`, else its `label` (`""` when it has neither). */
export const menuItemKey = (item: MenuItem): string => item.key ?? item.label ?? "";
