import { defineRecipe } from "../../recipe";

/**
 * Sheet. On web and desktop a panel that slides in from the window's side over a scrim: a record's details, a short form, a navigation
 * drawer. A header strip (title, subtitle, ✕), a body that scrolls, and a footer of actions, parted by hairlines as the form dialog's are.
 * The phone draws the BottomSheet instead (its idiom for the same job), so the panel's parts are web and desktop only.
 */
export const sheet = defineRecipe({
  parts: ["root", "panel", "header", "title", "subtitle", "close", "body", "footer"],
  styles: {
    // On the phone the root only holds the BottomSheet, which draws its own scrim.
    root: { base: { font: "$font.family.sans" }, platforms: { web: { base: { bg: "$color.background.scrim.default" } }, desktop: { base: { bg: "$color.background.scrim.default" } } } },
    panel: { on: ["web", "desktop"], base: { width: "$sheet.width", bg: "$color.background.card", shadow: "$elevation.shadow.modal", fg: "$color.text.body" } },
    header: { on: ["web", "desktop"], base: { paddingX: "$space.lg", paddingY: "$space.md", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle" } },
    title: { on: ["web", "desktop"], base: { font: "$font.family.display", size: "$font.size.lead", line: "$font.lineHeight.lead", weight: "$font.weight.bold", tracking: "$font.letterSpacing.tight", fg: "$color.text.strong" } },
    // The phone draws the subtitle at the top of the BottomSheet's body.
    subtitle: { base: { size: "$font.size.caption", fg: "$color.text.subtle" } },
    // The ✕ is an IconButton drawn as this part: its look is the IconButton's; `styles.close` is laid over it.
    close: { on: ["web", "desktop"] },
    body: { on: ["web", "desktop"], base: { padding: "$space.lg" } },
    footer: { on: ["web", "desktop"], base: { paddingX: "$space.lg", paddingY: "$space.mdLg", borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle" } },
  },
  // The overlay layer the sheet is drawn in takes the modal z-index; no part draws it.
  reads: ["$zIndex.modal"],
});
