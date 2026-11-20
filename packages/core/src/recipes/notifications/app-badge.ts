import { defineRecipe } from "../../recipe";

/**
 * AppBadge: how the app's unread count looks where each OS draws it. The OS decides the look, so most parts carry their values
 * under `platforms.<os>` (`mac` / `windows` / `linux` / `browser` / `ios` / `android`), laid over a shared base; the kit only
 * chooses which parts to draw. A part is one thing on every OS that has it (the `badge` is the red count pill on a Mac, the
 * coral one on Windows and Linux, the favicon dot in a browser tab, the number on iOS and the dot on Android).
 * Positions (`top`, `right`, `bottom`), each badge's minimum width and the tab's top corners are the recipe's. A count-less dot's size,
 * the 1.5px edge widths and the home screen's gradient are the kit's reads, listed in `reads`. The app icon's sizes and radii are literals in the kit, because they
 * differ per OS and per call (`osBadge.macIconSize`, `osBadge.macIconRadius` are not read by it any more).
 */
export const appBadge = defineRecipe({
  parts: [
    "root",
    "container",
    "appIcon",
    "mark",
    "badge",
    "digits",
    "runDot",
    "glyphButton",
    "taskButton",
    "taskBar",
    "tab",
    "activeTab",
    "tabIcon",
    "tabTitle",
    "favicon",
    "label",
  ],
  styles: {
    root: { base: { font: "$font.sans" } },
    container: {
      platforms: {
        mac: { base: { gap: "$space.smMd", paddingX: "$space.smMd", radius: "$osBadge.macDockRadius", bg: "$os.notificationBg", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.raise" } },
        linux: { base: { gap: "$space.smMd", paddingX: "$space.sm", radius: "$osBadge.linuxDockRadius", bg: "$surface.chrome", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.raise" } },
        // The taskbar's rule is its top edge alone.
        windows: { base: { gap: "$space.2xs", height: "$osBadge.winTaskbarH", paddingX: "$space.smMd", bg: "$surface.recessed", borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle" } },
        browser: { base: { gap: "$space.3xs", width: "$osBadge.browserStripW", paddingX: "$space.sm", bg: "$os.browserChrome", radius: "$osBadge.browserStripRadius" } },
        ios: { base: { gap: "$space.xs", paddingX: "$osBadge.iosTilePadX", paddingY: "$osBadge.iosTilePadY", radius: "$osBadge.iosTileRadius" } },
        android: { base: { gap: "$space.xs", paddingX: "$osBadge.iosTilePadX", paddingY: "$osBadge.iosTilePadY", radius: "$osBadge.iosTileRadius" } },
      },
    },
    // The app icon is the `mark` the product passes (a vector mark), or its name's first letter. On the desktop it is the mark alone, in the brand colour, as a desktop
    // app's own icon is; on the phone it is white on a brand tile, as a phone app's is.
    appIcon: {
      on: ["desktop", "mobile"],
      platforms: { mobile: { base: { bg: "$brand.default", shadow: "$shadow.card" } } },
    },
    mark: {
      base: { fg: "$brand.default" },
      platforms: { mobile: { base: { fg: "$fg.onBrand" } } },
    },
    badge: {
      base: { radius: "$radius.pill" },
      platforms: {
        // The red count a Mac draws over the Dock icon: macOS's own red, hairline-edged. It does not turn grey when paused.
        mac: { base: { top: "$osBadge.macHangY", right: "$osBadge.macHangX", minWidth: "$osBadge.macSize", height: "$osBadge.macSize", paddingX: "$space.xs", bg: "$os.badge", shadow: "$shadow.hairline" } },
        windows: {
          base: { right: "$osBadge.winHangX", bottom: "$osBadge.winHangY", minWidth: "$osBadge.winSize", height: "$osBadge.winSize", paddingX: "$osBadge.winPadX", bg: "$brand.default", borderColor: "$surface.recessed" },
          variants: { mutedAll: { true: { bg: "$fg.faint" } } },
        },
        linux: {
          base: { top: "$osBadge.linuxHangY", right: "$osBadge.linuxHangX", minWidth: "$osBadge.linuxMinW", height: "$osBadge.linuxH", paddingX: "$osBadge.linuxPadX", bg: "$brand.default", borderColor: "$surface.chrome" },
          variants: { mutedAll: { true: { bg: "$fg.faint" } } },
        },
        // The tab's favicon dot: round, so its radius is the kit's literal 50%.
        browser: {
          base: { top: "$osBadge.browserHang", right: "$osBadge.browserHang", square: "$dot.size", radius: "none", bg: "$brand.default", borderColor: "$os.browserChrome" },
          variants: { mutedAll: { true: { bg: "$fg.faint" } } },
        },
        ios: { base: { top: "$osBadge.iosHangY", right: "$osBadge.iosHangX", minWidth: "$osBadge.iosSize", height: "$osBadge.iosSize", paddingX: "$osBadge.iosPadX", bg: "$os.badge", shadow: "$shadow.hairline" } },
        android: { base: { right: "$osBadge.androidDotInset", square: "$osBadge.androidDot", radius: "$radius.circle", bg: "$brand.default", borderWidth: "$border.wThick", borderColor: "$fg.onBrand" } },
      },
    },
    digits: {
      on: ["desktop", "mobile"],
      base: { fg: "$fg.onBrand" },
      platforms: {
        mac: { base: { size: "$text.bodySm", weight: "$font.weightSemibold" } },
        windows: { base: { size: "$osBadge.winLabel", weight: "$font.weightBold" } },
        linux: { base: { size: "$osBadge.linuxLabel", weight: "$font.weightBold" } },
        mobile: { base: { size: "$osBadge.iosLabel", line: "$osBadge.iosLabel", weight: "$font.weightMedium" } },
      },
    },
    runDot: { on: ["desktop"], base: { square: "$osBadge.macRunDot", bg: "$fg.muted" } },
    glyphButton: { on: ["desktop"], base: { square: "$osBadge.winButtonSize", radius: "$osBadge.winButtonRadius", fg: "$fg.muted" } },
    taskButton: { on: ["desktop"], base: { square: "$osBadge.winButtonSize", radius: "$osBadge.winButtonRadius", bg: "$hover.surface" } },
    taskBar: { on: ["desktop"], base: { width: "$osBadge.winBarW", height: "$osBadge.winBarH", radius: "$radius.pill", bg: "$fg.faint" } },
    tab: { on: ["web"], base: { gap: "$space.sm", width: "$osBadge.browserTabW", height: "$osBadge.browserTabH", paddingX: "$space.md", fg: "$fg.muted" } },
    activeTab: { on: ["web"], base: { radiusTop: "$osBadge.browserTabRadius", gap: "$space.sm", width: "$osBadge.browserTabW", height: "$osBadge.browserTabH", paddingX: "$space.md", bg: "$os.browserTab" } },
    tabIcon: { on: ["web"], base: { fg: "$fg.muted" } },
    tabTitle: { on: ["web"], base: { size: "$text.caption", fg: "$fg.strong" } },
    favicon: { on: ["web"], base: { square: "$osBadge.browserFavicon" } },
    label: { on: ["mobile"], base: { fg: "$fg.onBrand", weight: "$font.weightMedium" } },
  },
  // Left to the kit: a count-less Windows dot (its size follows the count, which is not a documented option), the 1.5px badge
  // edge (no token), the home screen's gradient and its label's text shadow (no key).
  reads: [
    "$osBadge.winDot",
    "$identity.indigo",
    "$identity.ink",
    "$os.iosLabelShadow",
    "$font.weightBold",
  ],
});
