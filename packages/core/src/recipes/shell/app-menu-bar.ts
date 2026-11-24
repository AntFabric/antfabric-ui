import { defineRecipe, type PartRecipe } from "../../recipe";

/**
 * AppMenuBar (web and desktop). Three pictures of the OS's own menus, so most of it is OS chrome and lives under `platforms.<os>`:
 * macOS's menu bar and dropdown (`bar`, `title`, `dropdown`), the Windows ☰ panel and its cascading flyout (`strip`, `panel`, `cascade`),
 * GNOME's popover (`panel`, with the back row), and on the web the ⋯ menu (`webMenu`, `webItem`, the theme `segment`s). Menu rows (`row`)
 * differ per OS: macOS lights the entry coral-blue (`os.macAccent`) with white type, Windows and GNOME grey it and a press goes deeper.
 * A row is `on` when it is lit, hovered or focused (a menu highlights the entry under the pointer and the one keyboard focus is on alike).
 * Offsets and stacking orders are the recipe's. Read by the kit: the macOS glass dropdown's radius (a state the recipe does not know)
 * and the `0.5px` edges (the macOS bar's hairline, and the dropdown's, a `border` shorthand which a glass dropdown's own transparent edge then overrides; written as longhands the render snapshot would differ).
 */
const title = (bold: boolean): PartRecipe => ({
  on: ["desktop"],
  base: { height: "$osMenu.macTitleH", paddingX: "$osMenu.macTitlePadX", radius: "$radius.tag", weight: bold ? "$font.weight.bold" : "$font.weight.normal" },
  states: { on: { bg: "$color.background.scrim.light" }, focus: { shadow: "$elevation.shadow.focus" } },
});

export const appMenuBar = defineRecipe({
  parts: [
    "root", "screen", "bar", "title", "appTitle", "dropdown", "sysIcon", "strip", "panel", "cascade", "row", "entryIcon", "backIcon", "backLabel", "separator",
    "webMenu", "workspaceName", "host", "webItem", "webIcon", "webTrailing", "themeRow", "themeTrack", "segment", "segmentIcon",
  ],
  styles: {
    root: { base: { font: "$font.family.sans", fg: "$color.text.body" } },
    screen: { on: ["desktop"], base: { bg: "$os.wallpaper", radius: "$radius.control" } },
    bar: { on: ["desktop"], base: { height: "$osMenu.macBarH", bg: "$os.notificationBg", fg: "$os.notificationFg", size: "$font.size.bodySm", radius: "$radius.control" } },
    title: title(false),
    appTitle: title(true),
    dropdown: {
      on: ["desktop"],
      base: {
        width: "$osMenu.macDropW",
        padding: "$osMenu.macDropPad",
        radius: "$osMenu.macDropRadius",
        top: "$osMenu.macDropTop",
        zIndex: "$zIndex.menu",
        bg: "$color.background.overlay",
        shadow: "$elevation.shadow.menu",
        fg: "$os.notificationFg",
      },
    },
    sysIcon: { on: ["desktop"], base: { square: "$size.icon.md" } },
    strip: { on: ["desktop"], base: { height: "$size.layout.topBar", bg: "$color.background.chrome", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle" } },
    panel: {
      on: ["desktop"],
      base: { padding: "$space.2xs", zIndex: "$zIndex.menu", bg: "$color.background.raised", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.menu" },
      platforms: {
        windows: { base: { width: "$osMenu.winDropW", radius: "$osMenu.winRadius" } },
        linux: { base: { width: "$osMenu.linuxDropW", radius: "$radius.card", padding: "$space.xs" } },
      },
    },
    cascade: {
      on: ["desktop"],
      base: { top: "$osMenu.winFlyoutTop", left: "$osMenu.winFlyoutLeft", zIndex: "$zIndex.popover", width: "$osMenu.winFlyoutW", padding: "$space.2xs", radius: "$osMenu.winRadius", bg: "$color.background.raised", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.menu" },
    },
    row: {
      on: ["desktop"],
      base: { size: "$font.size.bodySm" },
      states: { disabled: { opacity: "$opacity.disabled" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: {
        mac: { base: { height: "$osMenu.macItemH", radius: "$radius.tag" }, states: { on: { bg: "$os.macAccent", fg: "$os.onFill" } } },
        windows: { base: { height: "$size.control.sm", radius: "$radius.tag" }, states: { on: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" } } },
        linux: { base: { height: "$osMenu.linuxItemH", radius: "$radius.control" }, states: { on: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" } } },
      },
    },
    entryIcon: { on: ["desktop"], base: { square: "$size.icon.sm" } },
    backIcon: { on: ["desktop"], base: { square: "$size.icon.md" } },
    backLabel: { on: ["desktop"], base: { weight: "$font.weight.bold" } },
    separator: { base: { height: "$border.width.hairline", bg: "$color.border.subtle" } },
    webMenu: {
      on: ["web"],
      base: { width: "$osMenu.browserMenuW", zIndex: "$zIndex.menu", padding: "$space.xs", radius: "$radius.card", bg: "$color.background.raised", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.menu" },
    },
    workspaceName: { on: ["web"], base: { weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    host: { on: ["web"], base: { size: "$font.size.caption", fg: "$color.text.faint" } },
    webItem: {
      on: ["web"],
      base: { size: "$font.size.bodySm", minHeight: "$size.control.xs", radius: "$radius.row", fg: "$color.text.body" },
      states: { on: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" }, disabled: { opacity: "$opacity.disabled" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    webIcon: { on: ["web"], base: { square: "$size.icon.md", fg: "$color.text.subtle" } },
    webTrailing: { on: ["web"], base: { square: "$size.icon.sm", fg: "$color.text.faint" } },
    themeRow: { on: ["web"], base: { minHeight: "$size.control.xs", size: "$font.size.bodySm" } },
    themeTrack: { on: ["web"], base: { radius: "$radius.pill", bg: "$color.background.track" } },
    segment: {
      on: ["web"],
      base: { square: "$size.control.iconSm", radius: "$radius.pill", fg: "$color.text.faint" },
      states: { hover: { fg: "$color.text.strong" }, on: { bg: "$color.background.card", shadow: "$elevation.shadow.hairline", fg: "$color.text.strong" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    segmentIcon: { on: ["web"], base: { square: "$size.icon.sm" } },
  },
  reads: ["$osMenu.macGlassRadius", "$color.border.default"],
});
