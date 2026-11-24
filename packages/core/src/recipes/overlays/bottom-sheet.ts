import { defineRecipe } from "../../recipe";

/**
 * BottomSheet. The same sheet on both kits (the web draws it for a phone-sized browser). The phone puts the panel's tokens on a glass
 * surface that has no element of its own to mark, so its `panel` testID sits on the moving wrapper that holds it.
 * The kit reads the glass surface's `$sheet.glassRadius` (`reads`): Liquid Glass is a state the recipe does not know, and its radius is all four corners. The phone's large title is `font.size.h1` where the web's is `font.size.largeTitle` (both 28).
 */
export const bottomSheet = defineRecipe({
  parts: ["root", "panel", "handle", "title", "content", "text", "home", "keyboard", "keyboardLabel"],
  styles: {
    root: {
      base: { bg: "$color.background.scrim.default", font: "$font.family.sans" },
      // Mid-drag the scrim lightens; once dismissed it clears.
      variants: { dragging: { true: { bg: "$color.background.scrim.light" } }, closed: { true: { bg: "transparent" } } },
    },
    panel: {
      base: { bg: "$color.background.card", paddingX: "$space.gutter.pane", radiusTop: "$radius.sheet" },
      platforms: { web: { base: { zIndex: "$zIndex.modal" } }, desktop: { base: { zIndex: "$zIndex.modal" } } },
    },
    handle: {
      base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", radius: "$radius.pill", bg: "$color.border.muted" },
      variants: { dragging: { true: { bg: "$color.text.faint" } } },
      // The handle is a button (it closes the sheet): the keyboard sees where it is.
      states: { focus: { halo: "$elevation.shadow.focus" } },
    },
    title: {
      base: { size: "$font.size.lead", line: "$font.lineHeight.lead", weight: "$font.weight.semibold", fg: "$color.text.strong" },
      variants: { largeTitle: { true: { size: "$font.size.largeTitle", line: "$size.control.icon" } } },
      platforms: { mobile: { base: { line: "$sheet.titleLineHeight" }, variants: { largeTitle: { true: { size: "$font.size.h1", line: "$size.control.icon" } } } } },
    },
    content: { base: { minHeight: "$sheet.contentMinHeight" } },
    // Words given as the content: React Native has no bare text in a View, so the phone draws them as body text.
    text: { on: ["mobile"], base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.normal", fg: "$color.text.body" } },
    home: { base: { height: "$size.layout.homeIndicator" } },
    keyboard: { base: { bg: "$color.background.muted", borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle" } },
    keyboardLabel: { base: { size: "$font.size.caption", fg: "$color.text.faint" }, platforms: { mobile: { base: { weight: "$font.weight.normal" } } } },
  },
  reads: ["$sheet.glassRadius", "$size.target.min"],
});
