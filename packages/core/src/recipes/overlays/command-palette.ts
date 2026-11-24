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
    root: { base: { bg: "$color.background.scrim.default", font: "$font.family.sans" } },
    panel: { base: { width: "$commandPalette.width", zIndex: "$zIndex.modal", radius: "$radius.card", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.modal" } },
    // The field's edge darkens while the keyboard is in it: the caret alone is not a focus indicator (WCAG 2.4.7).
    field: { base: { paddingY: "$commandPalette.fieldPaddingY", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle" }, states: { focus: { borderBottomColor: "$color.border.selected" } } },
    searchIcon: { base: { square: "$size.icon.default", fg: "$color.text.muted" } },
    input: { base: { size: "$font.size.body", fg: "$color.text.strong" } },
    fieldSpinner: { base: { square: "$size.icon.md", fg: "$color.text.faint" } },
    filters: { base: { borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle" } },
    pill: {
      base: { height: "$size.control.xs", radius: "$radius.pill", fg: "$color.text.muted", size: "$font.size.caption", weight: "$font.weight.semibold" },
      // The pill's edge (hairline, strong when on) is the kit's `border` shorthand: written as longhands it would drop the button reset's zero border the render snapshot still counts.
      states: { on: { fg: "$color.text.strong" }, hover: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    offline: { base: { bg: "$color.background.warning.soft", fg: "$color.text.warning" } },
    offlineIcon: { base: { square: "$size.icon.md" } },
    offlineText: { base: { size: "$font.size.caption", weight: "$font.weight.medium" } },
    results: { base: { maxHeight: "$commandPalette.listMaxHeight" } },
    groupLabel: { base: { size: "$font.size.micro", weight: "$font.weight.bold", fg: "$color.text.faint" } },
    option: {
      base: { radius: "$radius.input", fg: "$color.text.body", paddingX: "$commandPalette.optionPaddingX" },
      // The highlighted row, the hovered one and the focused one look the same.
      states: { on: { bg: "$color.background.hover" }, hover: { bg: "$color.background.hover" }, focus: { bg: "$color.background.hover" } },
    },
    slot: { base: { square: "$commandPalette.slotSize", fg: "$color.text.muted" } },
    slotIcon: { base: { square: "$size.icon.default" } },
    label: { base: { size: "$font.size.bodySm", weight: "$font.weight.medium", fg: "$color.text.body" } },
    status: { base: { size: "$font.size.caption", fg: "$color.text.faint" } },
    hint: { base: { size: "$font.size.micro", fg: "$color.text.faint" } },
    loading: { base: { fg: "$color.text.faint", paddingX: "$commandPalette.optionPaddingX" } },
    loadingSpinner: { base: { square: "$size.icon.md" } },
    loadingText: { base: { size: "$font.size.bodySm" } },
    emptyText: { base: { size: "$font.size.bodySm", fg: "$color.text.faint" } },
    hints: { base: { bg: "$color.background.recessed", borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle" } },
    hintText: { base: { size: "$font.size.micro", fg: "$color.text.faint" } },
    aiHint: { base: { fg: "$color.text.faint" } },
    aiIcon: { base: { square: "$size.icon.sm" } },
  },
});
