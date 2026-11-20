import { defineRecipe } from "../../recipe";

/**
 * PermissionPrompt. Written from the React kit's table. `permission` tints the bell tile (the kit passes `granted` for a Windows or
 * Linux desktop that is already on). The web's card is its own width and radius (`radius.panel`); the phone's card is wrapped
 * in a `card` that holds the width, and the root is a `sheet`-radius box with the modal shadow, whose bottom-sheet form (`presentation` sheet)
 * rounds only its top corners and takes the `surface.card` fill (the kit draws the partial corners and the top edge, reading `radius.sheet` and
 * `sheet.glassRadius`). The phone's padding (a `space.xl` shorthand) stays in the kit's stylesheet. The browser-tab hint is the web's
 * (a drawing of where the switch is in a Chromium tab). The phone's larger title and body are a deliberate platform idiom (item 42).
 */
export const permissionPrompt = defineRecipe({
  parts: ["root", "card", "handle", "tile", "tileIcon", "title", "body", "foot", "hint", "addressChip", "tabChip", "lock", "arrowIcon", "chipUrl", "chipLabel", "chipAllow"],
  styles: {
    root: {
      base: { width: "$permissionPrompt.w", gap: "$space.md", padding: "$space.xl", radius: "$radius.panel", bg: "$surface.raised", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.card", font: "$font.sans" },
      platforms: {
        mobile: {
          base: { width: "none", padding: "none", radius: "$radius.sheet", shadow: "$shadow.modal" },
          variants: { presentation: { sheet: { bg: "$surface.card" } } },
        },
      },
    },
    card: { on: ["mobile"], base: { width: "$permissionPrompt.w" } },
    handle: { on: ["mobile"], base: { width: "$sheet.grabberW", height: "$sheet.grabberH", radius: "$radius.pill", bg: "$border.muted" } },
    tile: {
      base: { square: "$permissionPrompt.tile", radius: "$radius.input" },
      variants: {
        permission: {
          default: { bg: "$brand.soft", fg: "$brand.default" },
          granted: { bg: "$success.soft", fg: "$success.default" },
          denied: { bg: "$warning.soft", fg: "$warning.default" },
          unsupported: { bg: "$surface.muted", fg: "$fg.muted" },
        },
      },
    },
    tileIcon: { base: { square: "$icon.sizeLg" } },
    title: {
      base: { size: "$text.title", line: "$text.titleLine", weight: "$font.weightSemibold", fg: "$fg.strong" },
      platforms: { mobile: { base: { size: "$text.lead", line: "$text.leadLine" } } },
    },
    body: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightNormal" } } },
    },
    foot: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { weight: "$font.weightNormal" } } },
    },
    hint: { on: ["web"], base: { gap: "$space.sm", padding: "$space.sm", radius: "$radius.card", bg: "$os.browserChrome" } },
    addressChip: { on: ["web"], base: { height: "$permissionPrompt.addressH", bg: "$os.browserTab", gap: "$space.xs", paddingX: "$space.2xs", radius: "$radius.pill" } },
    tabChip: { on: ["web"], base: { height: "$permissionPrompt.addressH", bg: "$os.browserTab", gap: "$space.2xs", paddingX: "$space.sm", radius: "$radius.control", fg: "$fg.strong" } },
    lock: { on: ["web"], base: { square: "$permissionPrompt.lock", radius: "$radius.circle", bg: "$surface.muted", fg: "$fg.strong" } },
    arrowIcon: { on: ["web"], base: { fg: "$fg.faint" } },
    chipUrl: { on: ["web"], base: { size: "$text.caption", fg: "$fg.muted" } },
    chipLabel: { on: ["web"], base: { size: "$text.caption" } },
    chipAllow: { on: ["web"], base: { size: "$text.caption", weight: "$font.weightSemibold", fg: "$success.default" } },
  },
  // The lock's ring is a 2px shadow in the brand colour, and the sheet's glass corners have their own radius.
  reads: ["$brand.default", "$sheet.glassRadius"],
});
