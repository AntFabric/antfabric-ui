import { defineRecipe } from "../../recipe";

/**
 * TypingIndicator. The row's type is on `root`: the web draws the names and the verb as inherited text, and the phone's reader
 * hands it to each `Text`. The phone differs in the side padding (the pane gutter), one step larger type (a deliberate platform
 * idiom, item 42) and a regular weight, which the phone's `Text` needs to name a font file.
 */
export const typingIndicator = defineRecipe({
  parts: ["root", "dots", "dot", "who", "verb"],
  styles: {
    root: {
      base: { gap: "$space.sm", paddingX: "$space.lgXl", font: "$font.sans", size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { paddingX: "$gutter.pane", size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } },
    },
    dot: { base: { square: "$dot.sizeSm", radius: "$radius.circle", bg: "$fg.onBrandSoft" } },
  },
});
