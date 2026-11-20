import { defineRecipe } from "../../recipe";

/**
 * CommandPalette (web and desktop; the phone searches in its own screen). A panel over a scrim: a search field, kind filters, grouped
 * results, key hints. The stacking order, the hairlines between the strips, the field's block padding and the list's maximum height are
 * the recipe's. The kit keeps the hairline above each later group (a `line`, which depends on the group's place in the list), and the
 * avatar's slot size and label size, which it hands to Avatar (it draws no part of its own).
 */
export const commandPalette = defineRecipe({
  parts: [
    "root", "panel", "field", "searchIcon", "input", "fieldSpinner", "filters", "pill", "offline", "offlineIcon", "offlineText", "results", "groupLabel", "option", "slot", "slotIcon",
    "label", "status", "hint", "loading", "loadingSpinner", "loadingText", "emptyText", "hints", "hintText", "aiHint", "aiIcon",
  ],
  styles: {
    root: { base: { bg: "$scrim.default", font: "$font.sans" } },
    panel: { base: { width: "$palette.w", zIndex: "$z.modal", radius: "$radius.card", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.modal" } },
    // The field's edge darkens while the keyboard is in it: the caret alone is not a focus indicator (WCAG 2.4.7).
    field: { base: { paddingY: "$palette.fieldPadY", borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle" }, states: { focus: { borderBottomColor: "$border.active" } } },
    searchIcon: { base: { square: "$icon.size", fg: "$fg.muted" } },
    input: { base: { size: "$text.body", fg: "$fg.strong" } },
    fieldSpinner: { base: { square: "$icon.sizeMd", fg: "$fg.faint" } },
    filters: { base: { borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle" } },
    pill: {
      base: { height: "$control.hXs", radius: "$radius.pill", fg: "$fg.muted", size: "$text.caption", weight: "$font.weightSemibold" },
      // The pill's edge (hairline, strong when on) is the kit's `border` shorthand: written as longhands it would drop the button reset's zero border the render snapshot still counts.
      states: { on: { fg: "$fg.strong" }, hover: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } },
    },
    offline: { base: { bg: "$warning.soft", fg: "$warning.default" } },
    offlineIcon: { base: { square: "$icon.sizeMd" } },
    offlineText: { base: { size: "$text.caption", weight: "$font.weightMedium" } },
    results: { base: { maxHeight: "$palette.listMaxH" } },
    groupLabel: { base: { size: "$text.micro", weight: "$font.weightBold", fg: "$fg.faint" } },
    option: {
      base: { radius: "$radius.input", fg: "$fg.body", paddingX: "$palette.optionPadX" },
      // The highlighted row, the hovered one and the focused one look the same.
      states: { on: { bg: "$hover.surface" }, hover: { bg: "$hover.surface" }, focus: { bg: "$hover.surface" } },
    },
    slot: { base: { square: "$palette.slot", fg: "$fg.muted" } },
    slotIcon: { base: { square: "$icon.size" } },
    label: { base: { size: "$text.bodySm", weight: "$font.weightMedium", fg: "$fg.body" } },
    status: { base: { size: "$text.caption", fg: "$fg.faint" } },
    hint: { base: { size: "$text.micro", fg: "$fg.faint" } },
    loading: { base: { fg: "$fg.faint", paddingX: "$palette.optionPadX" } },
    loadingSpinner: { base: { square: "$icon.sizeMd" } },
    loadingText: { base: { size: "$text.bodySm" } },
    emptyText: { base: { size: "$text.bodySm", fg: "$fg.faint" } },
    hints: { base: { bg: "$surface.recessed", borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle" } },
    hintText: { base: { size: "$text.micro", fg: "$fg.faint" } },
    aiHint: { base: { fg: "$fg.faint" } },
    aiIcon: { base: { square: "$icon.sizeSm" } },
  },
});
