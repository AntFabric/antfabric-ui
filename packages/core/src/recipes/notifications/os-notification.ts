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
        mac: { base: { bg: "$os.notificationBg", fg: "$os.notificationFg", radius: "$osNotification.macRadius", gap: "$space.sm", shadow: "$shadow.float", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
        windows: { base: { bg: "$surface.raised", fg: "$fg.strong", radius: "$osNotification.winRadius", shadow: "$shadow.modal", borderWidth: "$border.wHairline", borderColor: "$border.muted" } },
        linux: { base: { bg: "$surface.raised", fg: "$fg.strong", radius: "$osNotification.linuxRadius", padding: "$space.md", gap: "$space.sm", shadow: "$shadow.menu", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
        browser: { base: { bg: "$surface.raised", fg: "$fg.strong", radius: "$osNotification.browserRadius", shadow: "$shadow.modal", borderWidth: "$border.wHairline", borderColor: "$border.subtle" } },
        ios: { base: { bg: "$os.notificationBg", radius: "$osNotification.iosRadius", paddingX: "$space.mdLg", paddingY: "$space.md", gap: "$space.smMd", shadow: "$shadow.raise" } },
        // The phone's padding (a `space.lg` shorthand) stays in the kit's stylesheet.
        android: { base: { bg: "$surface.raised", radius: "$osNotification.androidRadius", gap: "$space.sm", shadow: "$shadow.float" } },
      },
    },
    // The small app mark on Windows, Linux and the browser's header, and Android's round one.
    smallIcon: {
      base: { square: "$osNotification.iconSize", radius: "$osNotification.controlRadius", bg: "$brand.default" },
      platforms: { mobile: { base: { square: "$osNotification.androidIconSize", radius: "$radius.circle" } } },
    },
    source: { base: { size: "$text.caption", fg: "$fg.muted" } },
    closeButton: {
      on: ["web", "desktop"],
      base: { radius: "$osNotification.controlRadius", fg: "$fg.muted" },
      states: { hover: { bg: "$hover.surface", fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
      // The Mac's floats over the banner's corner: a round, blurred, hairline-edged button that greys on hover.
      platforms: {
        mac: {
          base: { top: "$osNotification.closeHang", left: "$osNotification.closeHang", bg: "$os.notificationBg", borderColor: "$border.muted", shadow: "$shadow.hairline" },
          states: { hover: { bg: "$hover.surface", fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
        },
      },
    },
    hit: {
      states: { focus: { shadow: "$shadow.focus" } },
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
      base: { square: "$osNotification.badgeSize", radius: "$osNotification.badgeRadius", bg: "$brand.default", borderColor: "$surface.raised" },
      platforms: { mobile: { base: { borderWidth: "$osNotification.badgeEdge" } } },
    },
    appIcon: {
      on: ["desktop", "mobile"],
      base: { radius: "$osNotification.appIconRadius", bg: "$brand.default" },
      platforms: { desktop: { base: { square: "$osNotification.macIconSize" } }, mobile: { base: { square: "$osNotification.iosIconSize" } } },
    },
    mark: {
      base: { fg: "$fg.onBrand", font: "$font.display", size: "$osNotification.iconLabel" },
      platforms: { mobile: { base: { size: "none", weight: "$font.weightBlack" } } },
    },
    macMark: { on: ["desktop"], base: { fg: "$fg.onBrand", font: "$font.display", size: "$osNotification.macIconLabel" } },
    title: {
      platforms: {
        mac: { base: { size: "$text.bodySm", weight: "$font.weightBold" } },
        windows: { base: { size: "$text.body", weight: "$font.weightSemibold" } },
        linux: { base: { size: "$text.body", weight: "$font.weightBold" } },
        browser: { base: { size: "$text.body", weight: "$font.weightSemibold" } },
        ios: { base: { size: "$osNotification.iosBody", line: "$osNotification.iosLine", fg: "$os.notificationFg" } },
        android: { base: { size: "$osNotification.iosBody", line: "$osNotification.iosLine", fg: "$fg.strong" } },
      },
    },
    // The Mac's, Linux's and the browser's second line, and iOS's.
    subtitle: {
      platforms: {
        web: { base: { size: "$text.bodySm", weight: "$font.weightMedium" } },
        desktop: { base: { size: "$text.bodySm", weight: "$font.weightMedium" } },
        mobile: { base: { size: "$osNotification.iosBody", line: "$osNotification.iosLine", fg: "$os.notificationFg" } },
      },
    },
    time: {
      on: ["desktop", "mobile"],
      base: { size: "$text.caption", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$osNotification.iosTime" } } },
    },
    body: {
      platforms: {
        mac: { base: { size: "$text.bodySm", fg: "$os.notificationFg" } },
        windows: { base: { size: "$text.body", fg: "$fg.muted" } },
        linux: { base: { size: "$text.bodySm", fg: "$fg.body" } },
        browser: { base: { size: "$text.bodySm", fg: "$fg.muted" } },
        ios: { base: { line: "$osNotification.iosLine", fg: "$os.notificationFg" } },
        android: { base: { line: "$osNotification.iosLine", fg: "$fg.muted" } },
      },
    },
    lead: { base: { fg: "$fg.muted" }, platforms: { web: { base: { weight: "$font.weightMedium" } }, desktop: { base: { weight: "$font.weightMedium" } } } },
    // "+2 more" and Windows' context line. The phone's sizes are literals in the kit.
    small: { on: ["desktop", "mobile"], base: { size: "$text.caption", fg: "$fg.muted" }, platforms: { mobile: { base: { size: "none" } } } },
    context: { on: ["desktop"], base: { size: "$text.caption", fg: "$fg.faint" } },
    actions: {
      on: ["web", "desktop"],
      platforms: {
        mac: { base: { gap: "$space.xs" } },
        windows: { base: { gap: "$space.sm" } },
        linux: { base: { gap: "$space.xs" } },
        // The browser's buttons sit under a rule: a hairline top edge.
        browser: { base: { borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle" } },
      },
    },
    action: {
      states: { focus: { shadow: "$shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        mac: { base: { paddingX: "$space.smMd", fg: "$fg.strong", height: "$osNotification.macActionH", radius: "$osNotification.macActionRadius", bg: "$surface.overlay", size: "$text.bodySm", weight: "$font.weightMedium" }, states: { hover: { bg: "$surface.selected" } } },
        windows: {
          base: { paddingX: "$space.smMd", fg: "$fg.strong", height: "$control.hSm", radius: "$osNotification.controlRadius", bg: "$surface.muted", size: "$text.body", weight: "$font.weightNormal", borderWidth: "$border.wHairline", borderColor: "$border.subtle" },
          states: { hover: { bg: "$surface.selected" } },
        },
        linux: { base: { paddingX: "$space.smMd", fg: "$fg.strong", height: "$osNotification.linuxActionH", radius: "$osNotification.linuxActionRadius", bg: "$surface.muted", size: "$text.bodySm", weight: "$font.weightSemibold" }, states: { hover: { bg: "$surface.selected" } } },
        // The browser's buttons are flat text on the card, with no radius (the kit's literal 0).
        browser: { base: { paddingX: "$space.smMd", fg: "$info.default", height: "$osNotification.browserActionH", bg: "transparent", size: "$text.bodySm", weight: "$font.weightSemibold" }, states: { hover: { bg: "$surface.selected" } } },
        mobile: { base: { height: "$osNotification.iosControlH", radius: "$osNotification.iosActionRadius", bg: "transparent" } },
      },
    },
    actionText: { on: ["mobile"], base: { size: "$text.bodySm", fg: "$brand.active" } },
    replyField: {
      on: ["desktop", "mobile"],
      base: { height: "$osNotification.fieldH", radius: "$osNotification.macActionRadius", paddingX: "$space.smMd", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.muted", size: "$text.bodySm", fg: "$fg.strong" },
      states: { focus: { borderColor: "$border.strong" }, disabled: { opacity: "$opacity.muted" } },
      platforms: {
        windows: { base: { height: "$control.hSm", radius: "$osNotification.controlRadius", size: "$text.body" } },
        ios: { base: { height: "$osNotification.iosControlH", radius: "$osNotification.iosFieldRadius", paddingX: "$space.mdLg", size: "$osNotification.iosBody", placeholder: "$fg.placeholder" } },
        android: { base: { height: "$osNotification.androidFieldH", radius: "$osNotification.androidFieldRadius", paddingX: "$space.lg", bg: "$surface.selected", size: "$text.bodySm", placeholder: "$fg.placeholder" } },
      },
    },
    sendButton: {
      on: ["desktop", "mobile"],
      base: { square: "$osNotification.sendSize", bg: "$brand.default", fg: "$fg.onBrand" },
      states: { hover: { bg: "$brand.hover" }, focus: { shadow: "$shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        windows: { base: { square: "$osNotification.winSendSize", radius: "$osNotification.controlRadius", bg: "transparent", fg: "$brand.active" }, states: { hover: { bg: "$hover.surface" } } },
        ios: { base: { square: "none", radius: "$radius.circle" } },
        android: { base: { square: "none", radius: "$radius.circle", bg: "transparent", fg: "$brand.active" } },
      },
    },
    statusIcon: { on: ["desktop", "mobile"], base: { fg: "$danger.default" } },
    statusText: { on: ["desktop", "mobile"], base: { size: "$text.caption", fg: "$fg.muted" }, states: { invalid: { fg: "$danger.default" } } },
    menu: { on: ["mobile"], base: { width: "$osNotification.iosMenuW" } },
    menuSheet: { on: ["mobile"], base: { radius: "$osNotification.iosMenuRadius", bg: "$os.notificationBg", shadow: "$shadow.menu" } },
    // The row's rule is its bottom edge only: the kit draws that side with this width and colour.
    menuRow: {
      on: ["mobile"],
      base: { height: "$control.hit", paddingX: "$space.lg", borderBottomWidth: "$osNotification.iosHairline", borderBottomColor: "$border.muted" },
      states: { pressed: { bg: "$surface.selected" }, focus: { shadow: "$shadow.focus" } },
    },
    menuText: { on: ["mobile"], base: { size: "$osNotification.iosHeader", fg: "$os.notificationFg" } },
    sliver: {
      on: ["desktop", "mobile"],
      base: { bg: "$os.notificationBg", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.card" },
      platforms: { mobile: { base: { height: "$osNotification.sliverH", radiusBottom: "$osNotification.sliverRadius" } } },
    },
    sliverFar: {
      on: ["desktop", "mobile"],
      base: { bg: "$os.notificationBg", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.hairline" },
      platforms: { mobile: { base: { height: "$osNotification.sliverFarH", radiusBottom: "$osNotification.sliverFarRadius" } } },
    },
  },
  // Left to the kit: Windows' reply underline, a bottom border written as a shorthand over the input's own reset.
  reads: ["$border.default"],
});
