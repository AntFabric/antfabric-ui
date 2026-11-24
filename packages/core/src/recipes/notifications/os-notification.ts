import { defineRecipe } from "../../recipe";

/**
 * OsNotification: a banner the OS draws, so each OS carries its own values under `platforms.<os>` (`mac` / `windows` / `linux` /
 * `browser` on the web and desktop, `ios` / `android` on the phone) and the parts are the same things on all of them. Where an OS
 * lays out a different box (the Mac's floating close button, Windows' always-open actions, the browser's text buttons), the part
 * is named for what it is and drawn only where it exists. Written from the React kit's tables (`CARD`, `TITLE`, `BODY`, `ACTION`…).
 * A platform layer's base sits above a general state, so a state that an OS's own base would cover (hover on an action) is restated inside that OS.
 * What stays in the kit: each OS's system font stack, the blur, the Liquid Glass fallback, every pixel size and literal radius that has no token
 * (the Mac's `10px 12px`, a `50%` circle, the 0.5px and 1.5px edges), the card widths, the line heights of the web's banners, and the
 * phone's system-font weights (it draws the OS's face, not the app's, so `weight` is not the recipe's there). The Mac close button's hang and the phone's sliver corners are the recipe's; the one read is
 * Windows' reply underline. The phone's sizes are the OS's own (`osNotification.ios*`, `android*`), so they are not an idiom
 * difference with the web, which draws a desktop banner.
 */
export const osNotification = defineRecipe({
  parts: [
    "root",
    "card",
    "smallIcon",
    "source",
    "closeButton",
    "hit",
    "badge",
    "appIcon",
    "mark",
    "macMark",
    "title",
    "subtitle",
    "time",
    "body",
    "lead",
    "small",
    "context",
    "actions",
    "action",
    "actionText",
    "replyField",
    "sendButton",
    "statusIcon",
    "statusText",
    "menu",
    "menuSheet",
    "menuRow",
    "menuText",
    "sliver",
    "sliverFar",
  ],
  styles: {
    root: { platforms: { mobile: { base: { width: "$osNotification.w" } } } },
    card: {
      platforms: {
        mac: { base: { bg: "$os.notificationBg", fg: "$os.notificationFg", radius: "$osNotification.macRadius", gap: "$space.sm", shadow: "$elevation.shadow.float", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" } },
        windows: { base: { bg: "$color.background.raised", fg: "$color.text.strong", radius: "$osNotification.winRadius", shadow: "$elevation.shadow.modal", borderWidth: "$border.width.hairline", borderColor: "$color.border.muted" } },
        linux: { base: { bg: "$color.background.raised", fg: "$color.text.strong", radius: "$osNotification.linuxRadius", padding: "$space.md", gap: "$space.sm", shadow: "$elevation.shadow.menu", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" } },
        browser: { base: { bg: "$color.background.raised", fg: "$color.text.strong", radius: "$osNotification.browserRadius", shadow: "$elevation.shadow.modal", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" } },
        ios: { base: { bg: "$os.notificationBg", radius: "$osNotification.iosRadius", paddingX: "$space.mdLg", paddingY: "$space.md", gap: "$space.smMd", shadow: "$elevation.shadow.raise" } },
        // The phone's padding (a `space.lg` shorthand) stays in the kit's stylesheet.
        android: { base: { bg: "$color.background.raised", radius: "$osNotification.androidRadius", gap: "$space.sm", shadow: "$elevation.shadow.float" } },
      },
    },
    // The small app mark on Windows, Linux and the browser's header, and Android's round one.
    smallIcon: {
      base: { square: "$osNotification.iconSize", radius: "$osNotification.controlRadius", bg: "$color.background.brand.default" },
      platforms: { mobile: { base: { square: "$osNotification.androidIconSize", radius: "$radius.circle" } } },
    },
    source: { base: { size: "$font.size.caption", fg: "$color.text.muted" } },
    closeButton: {
      on: ["web", "desktop"],
      base: { radius: "$osNotification.controlRadius", fg: "$color.text.muted" },
      states: { hover: { bg: "$color.background.hover", fg: "$color.text.strong" }, focus: { shadow: "$elevation.shadow.focus" } },
      // The Mac's floats over the banner's corner: a round, blurred, hairline-edged button that greys on hover.
      platforms: {
        mac: {
          base: { top: "$osNotification.closeHang", left: "$osNotification.closeHang", bg: "$os.notificationBg", borderColor: "$color.border.muted", shadow: "$elevation.shadow.hairline" },
          states: { hover: { bg: "$color.background.hover", fg: "$color.text.strong" }, focus: { shadow: "$elevation.shadow.focus" } },
        },
      },
    },
    hit: {
      states: { focus: { shadow: "$elevation.shadow.focus" } },
      platforms: {
        mac: { base: { gap: "$space.smMd" } },
        windows: { base: { gap: "$space.md" } },
        linux: { base: { gap: "$space.smMd" } },
        browser: { base: { gap: "$space.md" } },
        ios: { base: { gap: "$space.smMd" } },
        android: { base: { gap: "$space.sm" } },
      },
    },
    badge: {
      on: ["desktop", "mobile"],
      base: { square: "$osNotification.badgeSize", radius: "$osNotification.badgeRadius", bg: "$color.background.brand.default", borderColor: "$color.background.raised" },
      platforms: { mobile: { base: { borderWidth: "$osNotification.badgeEdge" } } },
    },
    appIcon: {
      on: ["desktop", "mobile"],
      base: { radius: "$osNotification.appIconRadius", bg: "$color.background.brand.default" },
      platforms: { desktop: { base: { square: "$osNotification.macIconSize" } }, mobile: { base: { square: "$osNotification.iosIconSize" } } },
    },
    mark: {
      base: { fg: "$color.text.onBrand", font: "$font.family.display", size: "$osNotification.iconLabel" },
      platforms: { mobile: { base: { size: "none", weight: "$font.weight.black" } } },
    },
    macMark: { on: ["desktop"], base: { fg: "$color.text.onBrand", font: "$font.family.display", size: "$osNotification.macIconLabel" } },
    title: {
      platforms: {
        mac: { base: { size: "$font.size.bodySm", weight: "$font.weight.bold" } },
        windows: { base: { size: "$font.size.body", weight: "$font.weight.semibold" } },
        linux: { base: { size: "$font.size.body", weight: "$font.weight.bold" } },
        browser: { base: { size: "$font.size.body", weight: "$font.weight.semibold" } },
        ios: { base: { size: "$osNotification.iosBody", line: "$osNotification.iosLine", fg: "$os.notificationFg" } },
        android: { base: { size: "$osNotification.iosBody", line: "$osNotification.iosLine", fg: "$color.text.strong" } },
      },
    },
    // The Mac's, Linux's and the browser's second line, and iOS's.
    subtitle: {
      platforms: {
        web: { base: { size: "$font.size.bodySm", weight: "$font.weight.medium" } },
        desktop: { base: { size: "$font.size.bodySm", weight: "$font.weight.medium" } },
        mobile: { base: { size: "$osNotification.iosBody", line: "$osNotification.iosLine", fg: "$os.notificationFg" } },
      },
    },
    time: {
      on: ["desktop", "mobile"],
      base: { size: "$font.size.caption", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$osNotification.iosTime" } } },
    },
    body: {
      platforms: {
        mac: { base: { size: "$font.size.bodySm", fg: "$os.notificationFg" } },
        windows: { base: { size: "$font.size.body", fg: "$color.text.muted" } },
        linux: { base: { size: "$font.size.bodySm", fg: "$color.text.body" } },
        browser: { base: { size: "$font.size.bodySm", fg: "$color.text.muted" } },
        ios: { base: { line: "$osNotification.iosLine", fg: "$os.notificationFg" } },
        android: { base: { line: "$osNotification.iosLine", fg: "$color.text.muted" } },
      },
    },
    lead: { base: { fg: "$color.text.muted" }, platforms: { web: { base: { weight: "$font.weight.medium" } }, desktop: { base: { weight: "$font.weight.medium" } } } },
    // "+2 more" and Windows' context line. The phone's sizes are literals in the kit.
    small: { on: ["desktop", "mobile"], base: { size: "$font.size.caption", fg: "$color.text.muted" }, platforms: { mobile: { base: { size: "none" } } } },
    context: { on: ["desktop"], base: { size: "$font.size.caption", fg: "$color.text.faint" } },
    actions: {
      on: ["web", "desktop"],
      platforms: {
        mac: { base: { gap: "$space.xs" } },
        windows: { base: { gap: "$space.sm" } },
        linux: { base: { gap: "$space.xs" } },
        // The browser's buttons sit under a rule: a hairline top edge.
        browser: { base: { borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle" } },
      },
    },
    action: {
      states: { focus: { shadow: "$elevation.shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        mac: { base: { paddingX: "$space.smMd", fg: "$color.text.strong", height: "$osNotification.macActionH", radius: "$osNotification.macActionRadius", bg: "$color.background.overlay", size: "$font.size.bodySm", weight: "$font.weight.medium" }, states: { hover: { bg: "$color.background.selected" } } },
        windows: {
          base: { paddingX: "$space.smMd", fg: "$color.text.strong", height: "$size.control.sm", radius: "$osNotification.controlRadius", bg: "$color.background.muted", size: "$font.size.body", weight: "$font.weight.normal", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" },
          states: { hover: { bg: "$color.background.selected" } },
        },
        linux: { base: { paddingX: "$space.smMd", fg: "$color.text.strong", height: "$osNotification.linuxActionH", radius: "$osNotification.linuxActionRadius", bg: "$color.background.muted", size: "$font.size.bodySm", weight: "$font.weight.semibold" }, states: { hover: { bg: "$color.background.selected" } } },
        // The browser's buttons are flat text on the card, with no radius (the kit's literal 0).
        browser: { base: { paddingX: "$space.smMd", fg: "$color.text.info", height: "$osNotification.browserActionH", bg: "transparent", size: "$font.size.bodySm", weight: "$font.weight.semibold" }, states: { hover: { bg: "$color.background.selected" } } },
        mobile: { base: { height: "$osNotification.iosControlH", radius: "$osNotification.iosActionRadius", bg: "transparent" } },
      },
    },
    actionText: { on: ["mobile"], base: { size: "$font.size.bodySm", fg: "$color.text.brand" } },
    replyField: {
      on: ["desktop", "mobile"],
      base: { height: "$osNotification.fieldH", radius: "$osNotification.macActionRadius", paddingX: "$space.smMd", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.muted", size: "$font.size.bodySm", fg: "$color.text.strong" },
      states: { focus: { borderColor: "$color.border.strong" }, disabled: { opacity: "$opacity.muted" } },
      platforms: {
        windows: { base: { height: "$size.control.sm", radius: "$osNotification.controlRadius", size: "$font.size.body" } },
        ios: { base: { height: "$osNotification.iosControlH", radius: "$osNotification.iosFieldRadius", paddingX: "$space.mdLg", size: "$osNotification.iosBody", placeholder: "$color.text.placeholder" } },
        android: { base: { height: "$osNotification.androidFieldH", radius: "$osNotification.androidFieldRadius", paddingX: "$space.lg", bg: "$color.background.selected", size: "$font.size.bodySm", placeholder: "$color.text.placeholder" } },
      },
    },
    sendButton: {
      on: ["desktop", "mobile"],
      base: { square: "$osNotification.sendSize", bg: "$color.background.brand.default", fg: "$color.text.onBrand" },
      states: { hover: { bg: "$color.background.brand.hover" }, focus: { shadow: "$elevation.shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        windows: { base: { square: "$osNotification.winSendSize", radius: "$osNotification.controlRadius", bg: "transparent", fg: "$color.text.brand" }, states: { hover: { bg: "$color.background.hover" } } },
        ios: { base: { square: "none", radius: "$radius.circle" } },
        android: { base: { square: "none", radius: "$radius.circle", bg: "transparent", fg: "$color.text.brand" } },
      },
    },
    statusIcon: { on: ["desktop", "mobile"], base: { fg: "$color.text.danger" } },
    statusText: { on: ["desktop", "mobile"], base: { size: "$font.size.caption", fg: "$color.text.muted" }, states: { invalid: { fg: "$color.text.danger" } } },
    menu: { on: ["mobile"], base: { width: "$osNotification.iosMenuW" } },
    menuSheet: { on: ["mobile"], base: { radius: "$osNotification.iosMenuRadius", bg: "$os.notificationBg", shadow: "$elevation.shadow.menu" } },
    // The row's rule is its bottom edge only: the kit draws that side with this width and colour.
    menuRow: {
      on: ["mobile"],
      base: { height: "$size.target.min", paddingX: "$space.lg", borderBottomWidth: "$osNotification.iosHairline", borderBottomColor: "$color.border.muted" },
      states: { pressed: { bg: "$color.background.selected" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    menuText: { on: ["mobile"], base: { size: "$osNotification.iosHeader", fg: "$os.notificationFg" } },
    sliver: {
      on: ["desktop", "mobile"],
      base: { bg: "$os.notificationBg", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.card" },
      platforms: { mobile: { base: { height: "$osNotification.sliverH", radiusBottom: "$osNotification.sliverRadius" } } },
    },
    sliverFar: {
      on: ["desktop", "mobile"],
      base: { bg: "$os.notificationBg", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.hairline" },
      platforms: { mobile: { base: { height: "$osNotification.sliverFarH", radiusBottom: "$osNotification.sliverFarRadius" } } },
    },
  },
  // Left to the kit: Windows' reply underline, a bottom border written as a shorthand over the input's own reset.
  reads: ["$color.border.default"],
});
