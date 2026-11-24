import { defineRecipe } from "../../recipe";

/**
 * PermissionPrompt. Written from the React kit's table. `permission` tints the bell tile (the kit passes `granted` for a Windows or
 * Linux desktop that is already on). The web's card is its own width and radius (`radius.panel`); the phone's card is wrapped
 * in a `card` that holds the width, and the root is a `sheet`-radius box with the modal shadow, whose bottom-sheet form (`presentation` sheet)
 * rounds only its top corners and takes the `color.background.card` fill (the kit draws the partial corners and the top edge, reading `radius.sheet` and
 * `sheet.glassRadius`). The phone's padding (a `space.xl` shorthand) stays in the kit's stylesheet. The browser-tab hint is the web's
 * (a drawing of where the switch is in a Chromium tab). The phone's larger title and body are a deliberate platform idiom (item 42).
 */
export const permissionPrompt = defineRecipe({
  parts: ["root", "card", "handle", "tile", "tileIcon", "title", "body", "foot", "hint", "addressChip", "tabChip", "lock", "arrowIcon", "chipUrl", "chipLabel", "chipAllow"],
  styles: {
    root: {
      base: { width: "$permissionPrompt.width", gap: "$space.md", padding: "$space.xl", radius: "$radius.panel", bg: "$color.background.raised", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.card", font: "$font.family.sans" },
      platforms: {
        mobile: {
          base: { width: "none", padding: "none", radius: "$radius.sheet", shadow: "$elevation.shadow.modal" },
          variants: { presentation: { sheet: { bg: "$color.background.card" } } },
        },
      },
    },
    card: { on: ["mobile"], base: { width: "$permissionPrompt.width" } },
    handle: { on: ["mobile"], base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", radius: "$radius.pill", bg: "$color.border.muted" } },
    tile: {
      base: { square: "$permissionPrompt.tileSize", radius: "$radius.input" },
      variants: {
        permission: {
          default: { bg: "$color.background.brand.soft", fg: "$color.background.brand.default" },
          granted: { bg: "$color.background.success.soft", fg: "$color.text.success" },
          denied: { bg: "$color.background.warning.soft", fg: "$color.text.warning" },
          unsupported: { bg: "$color.background.muted", fg: "$color.text.muted" },
        },
      },
    },
    tileIcon: { base: { square: "$size.icon.lg" } },
    title: {
      base: { size: "$font.size.title", line: "$font.lineHeight.title", weight: "$font.weight.semibold", fg: "$color.text.strong" },
      platforms: { mobile: { base: { size: "$font.size.lead", line: "$font.lineHeight.lead" } } },
    },
    body: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.normal" } } },
    },
    foot: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { weight: "$font.weight.normal" } } },
    },
    hint: { on: ["web"], base: { gap: "$space.sm", padding: "$space.sm", radius: "$radius.card", bg: "$os.browserChrome" } },
    addressChip: { on: ["web"], base: { height: "$permissionPrompt.addressHeight", bg: "$os.browserTab", gap: "$space.xs", paddingX: "$space.2xs", radius: "$radius.pill" } },
    tabChip: { on: ["web"], base: { height: "$permissionPrompt.addressHeight", bg: "$os.browserTab", gap: "$space.2xs", paddingX: "$space.sm", radius: "$radius.control", fg: "$color.text.strong" } },
    lock: { on: ["web"], base: { square: "$permissionPrompt.lockSize", radius: "$radius.circle", bg: "$color.background.muted", fg: "$color.text.strong" } },
    arrowIcon: { on: ["web"], base: { fg: "$color.text.faint" } },
    chipUrl: { on: ["web"], base: { size: "$font.size.caption", fg: "$color.text.muted" } },
    chipLabel: { on: ["web"], base: { size: "$font.size.caption" } },
    chipAllow: { on: ["web"], base: { size: "$font.size.caption", weight: "$font.weight.semibold", fg: "$color.text.success" } },
  },
  // The lock's ring is a 2px shadow in the brand colour, and the sheet's glass corners have their own radius.
  reads: ["$color.background.brand.default", "$sheet.glassRadius"],
});
