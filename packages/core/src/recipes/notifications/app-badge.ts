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
    root: { base: { font: "$font.family.sans" } },
    container: {
      platforms: {
        mac: { base: { gap: "$space.smMd", paddingX: "$space.smMd", radius: "$osBadge.macDockRadius", bg: "$os.notificationBg", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.raise" } },
        linux: { base: { gap: "$space.smMd", paddingX: "$space.sm", radius: "$osBadge.linuxDockRadius", bg: "$color.background.chrome", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.raise" } },
        // The taskbar's rule is its top edge alone.
        windows: { base: { gap: "$space.2xs", height: "$osBadge.winTaskbarH", paddingX: "$space.smMd", bg: "$color.background.recessed", borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle" } },
        browser: { base: { gap: "$space.3xs", width: "$osBadge.browserStripW", paddingX: "$space.sm", bg: "$os.browserChrome", radius: "$osBadge.browserStripRadius" } },
        ios: { base: { gap: "$space.xs", paddingX: "$osBadge.iosTilePadX", paddingY: "$osBadge.iosTilePadY", radius: "$osBadge.iosTileRadius" } },
        android: { base: { gap: "$space.xs", paddingX: "$osBadge.iosTilePadX", paddingY: "$osBadge.iosTilePadY", radius: "$osBadge.iosTileRadius" } },
      },
    },
    // The app icon is the `mark` the product passes (a vector mark), or its name's first letter. On the desktop it is the mark alone, in the brand colour, as a desktop
    // app's own icon is; on the phone it is the brand's ink (`color.text.onBrand`) on a brand tile, as a phone app's is.
    appIcon: {
      on: ["desktop", "mobile"],
      platforms: { mobile: { base: { bg: "$color.background.brand.default", shadow: "$elevation.shadow.card" } } },
    },
    mark: {
      base: { fg: "$color.background.brand.default" },
      platforms: { mobile: { base: { fg: "$color.text.onBrand" } } },
    },
    badge: {
      base: { radius: "$radius.pill" },
      platforms: {
        // The red count a Mac draws over the Dock icon: macOS's own red, hairline-edged. It does not turn grey when paused.
        mac: { base: { top: "$osBadge.macHangY", right: "$osBadge.macHangX", minWidth: "$osBadge.macSize", height: "$osBadge.macSize", paddingX: "$space.xs", bg: "$os.badge", shadow: "$elevation.shadow.hairline" } },
        windows: {
          base: { right: "$osBadge.winHangX", bottom: "$osBadge.winHangY", minWidth: "$osBadge.winSize", height: "$osBadge.winSize", paddingX: "$osBadge.winPadX", bg: "$color.background.brand.default", borderColor: "$color.background.recessed" },
          variants: { mutedAll: { true: { bg: "$color.text.faint" } } },
        },
        linux: {
          base: { top: "$osBadge.linuxHangY", right: "$osBadge.linuxHangX", minWidth: "$osBadge.linuxMinW", height: "$osBadge.linuxH", paddingX: "$osBadge.linuxPadX", bg: "$color.background.brand.default", borderColor: "$color.background.chrome" },
          variants: { mutedAll: { true: { bg: "$color.text.faint" } } },
        },
        // The tab's favicon dot: round, so its radius is the kit's literal 50%.
        browser: {
          base: { top: "$osBadge.browserHang", right: "$osBadge.browserHang", square: "$size.dot.default", radius: "none", bg: "$color.background.brand.default", borderColor: "$os.browserChrome" },
          variants: { mutedAll: { true: { bg: "$color.text.faint" } } },
        },
        ios: { base: { top: "$osBadge.iosHangY", right: "$osBadge.iosHangX", minWidth: "$osBadge.iosSize", height: "$osBadge.iosSize", paddingX: "$osBadge.iosPadX", bg: "$os.badge", shadow: "$elevation.shadow.hairline" } },
        android: { base: { right: "$osBadge.androidDotInset", square: "$osBadge.androidDot", radius: "$radius.circle", bg: "$color.background.brand.default", borderWidth: "$border.width.thick", borderColor: "$os.onFill" } },
      },
    },
    digits: {
      on: ["desktop", "mobile"],
      base: { fg: "$color.text.onBrand" },
      platforms: {
        mac: { base: { size: "$font.size.bodySm", weight: "$font.weight.semibold", fg: "$os.onFill" } },
        windows: { base: { size: "$osBadge.winLabel", weight: "$font.weight.bold" } },
        linux: { base: { size: "$osBadge.linuxLabel", weight: "$font.weight.bold" } },
        mobile: { base: { size: "$osBadge.iosLabel", line: "$osBadge.iosLabel", weight: "$font.weight.medium", fg: "$os.onFill" } },
      },
    },
    runDot: { on: ["desktop"], base: { square: "$osBadge.macRunDot", bg: "$color.text.muted" } },
    glyphButton: { on: ["desktop"], base: { square: "$osBadge.winButtonSize", radius: "$osBadge.winButtonRadius", fg: "$color.text.muted" } },
    taskButton: { on: ["desktop"], base: { square: "$osBadge.winButtonSize", radius: "$osBadge.winButtonRadius", bg: "$color.background.hover" } },
    taskBar: { on: ["desktop"], base: { width: "$osBadge.winBarW", height: "$osBadge.winBarH", radius: "$radius.pill", bg: "$color.text.faint" } },
    tab: { on: ["web"], base: { gap: "$space.sm", width: "$osBadge.browserTabW", height: "$osBadge.browserTabH", paddingX: "$space.md", fg: "$color.text.muted" } },
    activeTab: { on: ["web"], base: { radiusTop: "$osBadge.browserTabRadius", gap: "$space.sm", width: "$osBadge.browserTabW", height: "$osBadge.browserTabH", paddingX: "$space.md", bg: "$os.browserTab" } },
    tabIcon: { on: ["web"], base: { fg: "$color.text.muted" } },
    tabTitle: { on: ["web"], base: { size: "$font.size.caption", fg: "$color.text.strong" } },
    favicon: { on: ["web"], base: { square: "$osBadge.browserFavicon" } },
    label: { on: ["mobile"], base: { fg: "$os.onFill", weight: "$font.weight.medium" } },
  },
  // Left to the kit: a count-less Windows dot (its size follows the count, which is not a documented option), the 1.5px badge
  // edge (no token), the home screen's gradient and its label's text shadow (no key).
  reads: [
    "$osBadge.winDot",
    "$color.background.identity.indigo",
    "$color.background.identity.ink",
    "$os.iosLabelShadow",
    "$font.weight.bold",
  ],
});
