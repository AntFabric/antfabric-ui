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
  base: { height: "$osMenu.macTitleH", paddingX: "$osMenu.macTitlePadX", radius: "$radius.tag", weight: bold ? "$font.weightBold" : "$font.weightNormal" },
  states: { on: { bg: "$scrim.light" }, focus: { shadow: "$shadow.focus" } },
});

export const appMenuBar = defineRecipe({
  parts: [
    "root", "screen", "bar", "title", "appTitle", "dropdown", "sysIcon", "strip", "panel", "cascade", "row", "entryIcon", "backIcon", "backLabel", "separator",
    "webMenu", "workspaceName", "host", "webItem", "webIcon", "webTrailing", "themeRow", "themeTrack", "segment", "segmentIcon",
  ],
  styles: {
    root: { base: { font: "$font.sans", fg: "$fg.body" } },
    screen: { on: ["desktop"], base: { bg: "$os.wallpaper", radius: "$radius.control" } },
    bar: { on: ["desktop"], base: { height: "$osMenu.macBarH", bg: "$os.notificationBg", fg: "$os.notificationFg", size: "$text.bodySm", radius: "$radius.control" } },
    title: title(false),
    appTitle: title(true),
    dropdown: {
      on: ["desktop"],
      base: {
        width: "$osMenu.macDropW",
        padding: "$osMenu.macDropPad",
        radius: "$osMenu.macDropRadius",
        top: "$osMenu.macDropTop",
        zIndex: "$z.menu",
        bg: "$surface.overlay",
        shadow: "$shadow.menu",
        fg: "$os.notificationFg",
      },
    },
    sysIcon: { on: ["desktop"], base: { square: "$icon.sizeMd" } },
    strip: { on: ["desktop"], base: { height: "$topbar.h", bg: "$surface.chrome", borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle" } },
    panel: {
      on: ["desktop"],
      base: { padding: "$space.2xs", zIndex: "$z.menu", bg: "$surface.raised", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.menu" },
      platforms: {
        windows: { base: { width: "$osMenu.winDropW", radius: "$osMenu.winRadius" } },
        linux: { base: { width: "$osMenu.linuxDropW", radius: "$radius.card", padding: "$space.xs" } },
      },
    },
    cascade: {
      on: ["desktop"],
      base: { top: "$osMenu.winFlyoutTop", left: "$osMenu.winFlyoutLeft", zIndex: "$z.popover", width: "$osMenu.winFlyoutW", padding: "$space.2xs", radius: "$osMenu.winRadius", bg: "$surface.raised", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.menu" },
    },
    row: {
      on: ["desktop"],
      base: { size: "$text.bodySm" },
      states: { disabled: { opacity: "$opacity.disabled" }, focus: { shadow: "$shadow.focus" } },
      platforms: {
        mac: { base: { height: "$osMenu.macItemH", radius: "$radius.tag" }, states: { on: { bg: "$os.macAccent", fg: "$fg.onBrand" } } },
        windows: { base: { height: "$control.hSm", radius: "$radius.tag" }, states: { on: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" } } },
        linux: { base: { height: "$osMenu.linuxItemH", radius: "$radius.control" }, states: { on: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" } } },
      },
    },
    entryIcon: { on: ["desktop"], base: { square: "$icon.sizeSm" } },
    backIcon: { on: ["desktop"], base: { square: "$icon.sizeMd" } },
    backLabel: { on: ["desktop"], base: { weight: "$font.weightBold" } },
    separator: { base: { height: "$border.wHairline", bg: "$border.subtle" } },
    webMenu: {
      on: ["web"],
      base: { width: "$osMenu.browserMenuW", zIndex: "$z.menu", padding: "$space.xs", radius: "$radius.card", bg: "$surface.raised", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.menu" },
    },
    workspaceName: { on: ["web"], base: { weight: "$font.weightSemibold", fg: "$fg.strong" } },
    host: { on: ["web"], base: { size: "$text.caption", fg: "$fg.faint" } },
    webItem: {
      on: ["web"],
      base: { size: "$text.bodySm", minHeight: "$control.hXs", radius: "$radius.row", fg: "$fg.body" },
      states: { on: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" }, disabled: { opacity: "$opacity.disabled" }, focus: { shadow: "$shadow.focus" } },
    },
    webIcon: { on: ["web"], base: { square: "$icon.sizeMd", fg: "$fg.subtle" } },
    webTrailing: { on: ["web"], base: { square: "$icon.sizeSm", fg: "$fg.faint" } },
    themeRow: { on: ["web"], base: { minHeight: "$control.hXs", size: "$text.bodySm" } },
    themeTrack: { on: ["web"], base: { radius: "$radius.pill", bg: "$tabs.track" } },
    segment: {
      on: ["web"],
      base: { square: "$control.hIconSm", radius: "$radius.pill", fg: "$fg.faint" },
      states: { hover: { fg: "$fg.strong" }, on: { bg: "$surface.card", shadow: "$shadow.hairline", fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
    },
    segmentIcon: { on: ["web"], base: { square: "$icon.sizeSm" } },
  },
  reads: ["$osMenu.macGlassRadius", "$border.default"],
});
