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
    root: { base: { bg: "$scrim.default", font: "$font.sans" } },
    dim: { on: ["web", "desktop"], base: { bg: "$scrim.light" } },
    underlay: { on: ["web", "desktop"], base: { bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", radius: "$radius.card", shadow: "$shadow.modal" } },
    field: { on: ["web", "desktop"], base: { height: "$control.hInput", radius: "$radius.input", borderWidth: "$border.wHairline", borderColor: "$border.muted" } },
    panel: {
      on: ["web", "desktop"],
      base: { width: "$dialog.w", zIndex: "$z.modal", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", radius: "$radius.sheet", shadow: "$shadow.modal" },
      variants: { kind: { form: { width: "$dialog.wForm", radius: "$radius.card" } } },
    },
    // A form's title strip and its action bar are parted from the body by a hairline.
    formHeader: { on: ["web", "desktop"], base: { borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle" } },
    scroll: { on: ["web", "desktop"], base: { maxHeight: "$dialog.bodyMaxH" } },
    actions: { on: ["web", "desktop"], variants: { kind: { form: { borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle" } } } },
    sheet: { on: ["mobile"], base: { bg: "$surface.card", paddingX: "$gutter.pane", radiusTop: "$radius.sheet" } },
    handle: { on: ["mobile"], base: { width: "$sheet.grabberW", height: "$sheet.grabberH", radius: "$radius.pill", bg: "$border.muted" } },
    icon: { on: ["web", "desktop"], base: { square: "$dialog.icon", radius: "$radius.control", bg: "$brand.soft", fg: "$brand.default" } },
    glyph: { on: ["web", "desktop"], base: { square: "$icon.sizeLg" } },
    title: {
      base: { font: "$font.display", size: "$text.lead", line: "$text.leadLine", weight: "$font.weightBold", tracking: "$tracking.tight", fg: "$fg.strong" },
      platforms: { mobile: { base: { line: "$sheet.titleLine" } } }, // idiom: the sheet's title line
    },
    // The form's ✕ (an IconButton drawn as this part: its look is the IconButton's; `styles.close` is laid over it).
    close: { on: ["web", "desktop"] },
    subtitle: { on: ["web", "desktop"], base: { marginTop: "$border.wHairline", size: "$text.caption", fg: "$fg.subtle" } },
    body: {
      base: { size: "$text.bodySm", fg: "$fg.muted" },
      platforms: { mobile: { base: { line: "$text.bodySmLine", weight: "$font.weightNormal", marginBottom: "$dialog.bodyGap" } } },
    },
    error: { base: { radius: "$radius.control", bg: "$danger.soft", fg: "$danger.default" } },
    errorIcon: { base: { square: "$icon.sizeMd" } },
    errorText: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightMedium" },
      // On the phone the words carry the colour themselves; on the web they inherit it from the box.
      platforms: { mobile: { base: { fg: "$danger.default" } } },
    },
    home: { on: ["mobile"], base: { height: "$homeIndicator.h" } },
    keyboard: { on: ["mobile"], base: { bg: "$surface.muted", borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle" } },
    keyboardLabel: { on: ["mobile"], base: { size: "$text.caption", weight: "$font.weightNormal", fg: "$fg.faint" } },
  },
  reads: ["$dialog.actionMinW"],
});
