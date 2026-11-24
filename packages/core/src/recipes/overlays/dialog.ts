import { defineRecipe } from "../../recipe";

/**
 * Dialog. On web and desktop a centred panel over a scrim (`panel`, with a glyph tile `icon` or, for a form, a header strip); on the
 * phone the same words rise as a bottom sheet (`sheet`, `handle`), so the two kits share the title, body and error and nothing else.
 * The title's face, weight and tracking are the web's on the phone (item 43); only its line height is the sheet's.
 * Read by the kit: the action buttons' minimum width (a `Button`'s own `style`, which carries no part).
 */
export const dialog = defineRecipe({
  parts: ["root", "dim", "underlay", "field", "panel", "formHeader", "scroll", "actions", "sheet", "handle", "icon", "glyph", "title", "subtitle", "close", "body", "error", "errorIcon", "errorText", "home", "keyboard", "keyboardLabel"],
  styles: {
    root: { base: { bg: "$color.background.scrim.default", font: "$font.family.sans" } },
    dim: { on: ["web", "desktop"], base: { bg: "$color.background.scrim.light" } },
    underlay: { on: ["web", "desktop"], base: { bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", radius: "$radius.card", shadow: "$elevation.shadow.modal" } },
    field: { on: ["web", "desktop"], base: { height: "$size.control.input", radius: "$radius.input", borderWidth: "$border.width.hairline", borderColor: "$color.border.muted" } },
    panel: {
      on: ["web", "desktop"],
      base: { width: "$dialog.width", zIndex: "$zIndex.modal", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", radius: "$radius.sheet", shadow: "$elevation.shadow.modal" },
      variants: { kind: { form: { width: "$dialog.widthForm", radius: "$radius.card" } } },
    },
    // A form's title strip and its action bar are parted from the body by a hairline.
    formHeader: { on: ["web", "desktop"], base: { borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle" } },
    scroll: { on: ["web", "desktop"], base: { maxHeight: "$dialog.bodyMaxHeight" } },
    actions: { on: ["web", "desktop"], variants: { kind: { form: { borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle" } } } },
    sheet: { on: ["mobile"], base: { bg: "$color.background.card", paddingX: "$space.gutter.pane", radiusTop: "$radius.sheet" } },
    handle: { on: ["mobile"], base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", radius: "$radius.pill", bg: "$color.border.muted" } },
    icon: { on: ["web", "desktop"], base: { square: "$dialog.iconSize", radius: "$radius.control", bg: "$color.background.brand.soft", fg: "$color.background.brand.default" } },
    glyph: { on: ["web", "desktop"], base: { square: "$size.icon.lg" } },
    title: {
      base: { font: "$font.family.display", size: "$font.size.lead", line: "$font.lineHeight.lead", weight: "$font.weight.bold", tracking: "$font.letterSpacing.tight", fg: "$color.text.strong" },
      platforms: { mobile: { base: { line: "$sheet.titleLineHeight" } } }, // idiom: the sheet's title line
    },
    // The form's ✕ (an IconButton drawn as this part: its look is the IconButton's; `styles.close` is laid over it).
    close: { on: ["web", "desktop"] },
    subtitle: { on: ["web", "desktop"], base: { marginTop: "$border.width.hairline", size: "$font.size.caption", fg: "$color.text.subtle" } },
    body: {
      base: { size: "$font.size.bodySm", fg: "$color.text.muted" },
      platforms: { mobile: { base: { line: "$font.lineHeight.bodySm", weight: "$font.weight.normal", marginBottom: "$dialog.bodyGap" } } },
    },
    error: { base: { radius: "$radius.control", bg: "$color.background.danger.soft", fg: "$color.text.danger" } },
    errorIcon: { base: { square: "$size.icon.md" } },
    errorText: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.medium" },
      // On the phone the words carry the colour themselves; on the web they inherit it from the box.
      platforms: { mobile: { base: { fg: "$color.text.danger" } } },
    },
    home: { on: ["mobile"], base: { height: "$size.layout.homeIndicator" } },
    keyboard: { on: ["mobile"], base: { bg: "$color.background.muted", borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle" } },
    keyboardLabel: { on: ["mobile"], base: { size: "$font.size.caption", weight: "$font.weight.normal", fg: "$color.text.faint" } },
  },
  reads: ["$dialog.actionMinWidth"],
});
