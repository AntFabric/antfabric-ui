import { defineRecipe } from "../../recipe";

/**
 * BottomSheet. The same sheet on both kits (the web draws it for a phone-sized browser). The phone puts the panel's tokens on a glass
 * surface that has no element of its own to mark, so its `panel` testID sits on the moving wrapper that holds it.
 * The kit reads the glass surface's `$sheet.glassRadius` (`reads`): Liquid Glass is a state the recipe does not know, and its radius is all four corners. The phone's large title is `text.h1` where the web's is `text.largeTitle` (both 28).
 */
export const bottomSheet = defineRecipe({
  parts: ["root", "panel", "handle", "title", "content", "text", "home", "keyboard", "keyboardLabel"],
  styles: {
    root: {
      base: { bg: "$scrim.default", font: "$font.sans" },
      // Mid-drag the scrim lightens; once dismissed it clears.
      variants: { dragging: { true: { bg: "$scrim.light" } }, closed: { true: { bg: "transparent" } } },
    },
    panel: {
      base: { bg: "$surface.card", paddingX: "$gutter.pane", radiusTop: "$radius.sheet" },
      platforms: { web: { base: { zIndex: "$z.modal" } }, desktop: { base: { zIndex: "$z.modal" } } },
    },
    handle: {
      base: { width: "$sheet.grabberW", height: "$sheet.grabberH", radius: "$radius.pill", bg: "$border.muted" },
      variants: { dragging: { true: { bg: "$fg.faint" } } },
      // The handle is a button (it closes the sheet): the keyboard sees where it is.
      states: { focus: { halo: "$shadow.focus" } },
    },
    title: {
      base: { size: "$text.lead", line: "$text.leadLine", weight: "$font.weightSemibold", fg: "$fg.strong" },
      variants: { largeTitle: { true: { size: "$text.largeTitle", line: "$control.hIcon" } } },
      platforms: { mobile: { base: { line: "$sheet.titleLine" }, variants: { largeTitle: { true: { size: "$text.h1", line: "$control.hIcon" } } } } },
    },
    content: { base: { minHeight: "$sheet.contentMin" } },
    // Words given as the content: React Native has no bare text in a View, so the phone draws them as body text.
    text: { on: ["mobile"], base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightNormal", fg: "$fg.body" } },
    home: { base: { height: "$homeIndicator.h" } },
    keyboard: { base: { bg: "$surface.muted", borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle" } },
    keyboardLabel: { base: { size: "$text.caption", fg: "$fg.faint" }, platforms: { mobile: { base: { weight: "$font.weightNormal" } } } },
  },
  reads: ["$sheet.glassRadius", "$control.hit"],
});
