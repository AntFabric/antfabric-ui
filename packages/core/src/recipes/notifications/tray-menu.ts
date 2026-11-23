import { defineRecipe } from "../../recipe";

/**
 * TrayMenu: the app's menu-bar and tray menu, drawn the way each desktop OS draws its own (`mac` / `windows` / `linux`); the web has none.
 * Written from the React kit's tables. The recipe holds each OS's colours, radii and row sizes; the kit holds the system font stacks,
 * the blur, each menu's own padding and width (the Mac's 5px, 250px), every literal glyph size and the 0.5px Mac edge, whose colour is the recipe's.
 * `tone` colours the tray icon (idle, live, paused, busy); `hover` on a row is "lit" (hovered, focused or its submenu open), which the Mac draws in the accent with white text.
 * Positions and a few radii that Liquid Glass swaps in are reads, listed in `reads`.
 */
export const trayMenu = defineRecipe({
  parts: [
    "root",
    "statusBar",
    "statusItem",
    "statusText",
    "statusGlyph",
    "statusClock",
    "taskbarClock",
    "trayIcon",
    "menu",
    "separator",
    "readout",
    "item",
    "glyph",
    "recordGlyph",
    "itemDetail",
    "itemChevron",
    "taskbar",
    "trayChip",
  ],
  styles: {
    root: { on: ["desktop"], platforms: { mac: { base: { bg: "$os.wallpaper", radius: "$radius.card" } } } },
    statusBar: {
      on: ["desktop"],
      base: { gap: "$space.mdLg", height: "$osTray.statusBarH", paddingX: "$space.smMd", radius: "$osTray.statusBarRadius", fg: "$os.notificationFg", bg: "$os.notificationBg" },
    },
    statusItem: { on: ["desktop"], base: { gap: "$osTray.statusGap", height: "$osTray.statusItemH", paddingX: "$space.sm", radius: "$osTray.statusItemRadius", bg: "$surface.overlay" } },
    statusText: { on: ["desktop"], base: { size: "$text.bodySm", weight: "$font.weightMedium" } },
    statusGlyph: { on: ["desktop"], base: { fg: "$fg.strong" } },
    statusClock: { on: ["desktop"], base: { size: "$text.bodySm", fg: "$fg.strong" } },
    taskbarClock: { on: ["desktop"], base: { size: "$text.caption", fg: "$fg.strong" } },
    trayIcon: {
      on: ["desktop"],
      variants: { tone: { idle: { fg: "$fg.strong" }, live: { fg: "$os.macClose" }, paused: { fg: "$presence.away" }, busy: { fg: "$info.default" } } },
    },
    // The edge: the Mac's is 0.5px (the kit's width, in the recipe's colour), the others' a hairline.
    menu: {
      on: ["desktop"],
      base: { radius: "$osTray.winRadius", bg: "$surface.raised", fg: "$fg.strong", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.menu" },
      platforms: {
        mac: { base: { radius: "$osTray.macRadius", bg: "$os.notificationBg", fg: "$os.notificationFg", borderWidth: "none", borderColor: "$border.muted" } },
        linux: { base: { radius: "$osTray.linuxRadius" } },
      },
    },
    separator: { on: ["desktop"], base: { height: "$border.wHairline", bg: "$border.subtle" } },
    readout: { on: ["desktop"], base: { fg: "$fg.faint", size: "$text.bodySm" } },
    item: {
      on: ["desktop"],
      base: { gap: "$space.smMd", height: "$osTray.winRowH", paddingX: "$space.md", radius: "$osTray.winRowRadius", size: "$text.body" },
      states: { hover: { bg: "$hover.surface" }, disabled: { fg: "$fg.faint" } },
      platforms: {
        mac: {
          base: { gap: "$space.xs", height: "$osTray.macRowH", paddingX: "$space.smMd", radius: "$osTray.macRowRadius", size: "$text.bodySm" },
          states: { hover: { bg: "$info.default", fg: "$os.onFill" }, disabled: { fg: "$fg.faint" } },
        },
        linux: { base: { height: "$osTray.linuxRowH", radius: "$osTray.linuxRowRadius" } },
      },
    },
    glyph: { on: ["desktop"], base: { fg: "$fg.muted" } },
    recordGlyph: { on: ["desktop"], base: { fg: "$os.macClose" } },
    itemDetail: { on: ["desktop"], base: { size: "$text.caption", fg: "$fg.faint" } },
    itemChevron: { on: ["desktop"], base: { fg: "$fg.muted" } },
    taskbar: {
      on: ["desktop"],
      platforms: {
        windows: { base: { gap: "$space.md", height: "$osTray.winTaskbarH", paddingX: "$space.md", radius: "$osTray.winTaskbarRadius", bg: "$surface.recessed", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
        // The Linux panel is square (the kit's literal 0) and shorter.
        linux: { base: { gap: "$space.md", height: "$osTray.linuxBarH", paddingX: "$space.md", radius: "none", bg: "$surface.recessed", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
      },
    },
    trayChip: { on: ["desktop"], base: { square: "$osTray.glyph", radius: "$osTray.glyphRadius", bg: "$hover.surface" } },
  },
  reads: ["$osTray.submenuTop", "$osTray.sheetW", "$osTray.liquidRadius", "$osTray.statusItemLiquidRadius"],
});
