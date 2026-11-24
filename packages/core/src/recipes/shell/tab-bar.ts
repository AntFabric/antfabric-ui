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
    bar: { base: { height: "$size.layout.tabBar", paddingX: "$space.gutter.pane" } },
    pill: { base: { height: "$size.layout.tabBar", radius: "$radius.pill", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.float" } },
    tab: { base: { height: "$tabBar.itemHeight", minWidth: "$size.target.min", radius: "$radius.pill" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    capsule: { base: { radius: "$radius.pill", bg: "$color.background.brand.tint" } },
    // The icon and the label are coral on the current tab and faint on the others.
    icon: { base: { square: "$size.icon.lg", fg: "$color.text.faint" }, states: { on: { fg: "$color.background.brand.default" } } },
    label: { base: { maxWidth: "$tabBar.labelMaxWidth", size: "$font.size.caption", line: "$tabBar.labelLineHeight", weight: "$font.weight.semibold", fg: "$color.text.faint" }, states: { on: { fg: "$color.background.brand.default" } } },
    squeezed: { base: { square: "$tabBar.itemSizeSqueezed" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    squeezedSurface: { base: { radius: "$radius.circle", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.float" } },
    disc: { base: { radius: "$radius.circle", bg: "$color.background.brand.tint" } },
    discIcon: { base: { square: "$size.icon.lg", fg: "$color.background.brand.default" } },
    action: { base: { square: "$size.layout.tabBar", radius: "$radius.circle", bg: "$color.background.brand.tint", shadow: "$elevation.shadow.float" }, states: { focus: { shadow: "$elevation.shadow.focus" }, disabled: { opacity: "$opacity.disabled" } } },
    actionIcon: { base: { fg: "$color.background.brand.default" } },
    safeArea: { base: { height: "$size.layout.homeIndicator" }, platforms: { android: { base: { height: "$osHeader.androidNavH" } } } },
    home: {
      base: { width: "$osHeader.iosHomeBarW", height: "$osHeader.iosHomeBarH", radius: "$radius.pill", bg: "$color.text.strong" },
      platforms: { android: { base: { width: "$osHeader.androidHomeBarW", height: "$osHeader.androidHomeBarH" } } },
    },
  },
  reads: ["$border.width.thick", "$tabBar.badgeOffsetX"],
});
