import { defineRecipe } from "../../recipe";

/**
 * TabBar (phone only; web and desktop have the NavRail). A floating capsule of tabs with the current one lifted onto a coral tint,
 * and a round floating action button beside it; scrolling down squeezes the capsule to one disc. Under it, the home indicator (iOS) or
 * gesture handle (Android), whose size is the OS's (`os*` tokens, Android's under `platforms.android`).
 * The capsule sits on a glass surface that draws no element of its own to mark: the `pill` testID is on the tablist that holds it.
 * The squeezed disc's surface is its own part. The badge's offset and ring (it is the Badge component's own style, which carries no part)
 * and the selection lens (which exists only while a finger is on the bar, so no render draws it; it takes the pill's radius) are read by the kit (`reads`).
 */
export const tabBar = defineRecipe({
  parts: ["bar", "pill", "tab", "capsule", "icon", "label", "squeezed", "squeezedSurface", "disc", "discIcon", "action", "actionIcon", "safeArea", "home"],
  styles: {
    bar: { base: { height: "$tabbar.h", paddingX: "$gutter.pane" } },
    pill: { base: { height: "$tabbar.h", radius: "$radius.pill", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.float" } },
    tab: { base: { height: "$tabBar.itemH", minWidth: "$control.hit", radius: "$radius.pill" }, states: { focus: { shadow: "$shadow.focus" } } },
    capsule: { base: { radius: "$radius.pill", bg: "$brand.tint" } },
    // The icon and the label are coral on the current tab and faint on the others.
    icon: { base: { square: "$icon.sizeLg", fg: "$fg.faint" }, states: { on: { fg: "$brand.default" } } },
    label: { base: { maxWidth: "$tabBar.labelMaxW", size: "$text.caption", line: "$tabBar.labelLine", weight: "$font.weightSemibold", fg: "$fg.faint" }, states: { on: { fg: "$brand.default" } } },
    squeezed: { base: { square: "$tabBar.itemSqueezed" }, states: { focus: { shadow: "$shadow.focus" } } },
    squeezedSurface: { base: { radius: "$radius.circle", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.float" } },
    disc: { base: { radius: "$radius.circle", bg: "$brand.tint" } },
    discIcon: { base: { square: "$icon.sizeLg", fg: "$brand.default" } },
    action: { base: { square: "$tabbar.h", radius: "$radius.circle", bg: "$brand.tint", shadow: "$shadow.float" }, states: { focus: { shadow: "$shadow.focus" }, disabled: { opacity: "$opacity.disabled" } } },
    actionIcon: { base: { fg: "$brand.default" } },
    safeArea: { base: { height: "$homeIndicator.h" }, platforms: { android: { base: { height: "$osHeader.androidNavH" } } } },
    home: {
      base: { width: "$osHeader.iosHomeBarW", height: "$osHeader.iosHomeBarH", radius: "$radius.pill", bg: "$fg.strong" },
      platforms: { android: { base: { width: "$osHeader.androidHomeBarW", height: "$osHeader.androidHomeBarH" } } },
    },
  },
  reads: ["$border.wThick", "$tabBar.badgeX"],
});
