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
      base: { gap: "$space.sm", paddingX: "$space.lgXl", font: "$font.family.sans", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { paddingX: "$space.gutter.pane", size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } },
    },
    dot: { base: { square: "$size.dot.sm", radius: "$radius.circle", bg: "$color.text.onBrandSoft" } },
  },
});
