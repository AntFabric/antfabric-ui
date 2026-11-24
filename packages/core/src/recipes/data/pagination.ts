import { defineRecipe } from "../../recipe";

/**
 * Pagination. A summary of the rows on show ("Showing 6–10 of 12") at the start and the controls at the end: previous and next are the kit's IconButton,
 * the pages its Button (the current one soft), so their sizes and fills are theirs. This is the row's own type, its gaps and the gap that stands for
 * the pages left out.
 */
export const pagination = defineRecipe({
  parts: ["root", "summary", "pages", "gap"],
  styles: {
    root: { base: { gap: "$space.md", font: "$font.family.sans" } },
    summary: { base: { size: "$font.size.caption", weight: "$font.weight.regular", fg: "$color.text.muted" } },
    pages: { base: { gap: "$space.2xs" } },
    gap: { base: { size: "$font.size.caption", weight: "$font.weight.regular", fg: "$color.text.faint", paddingX: "$space.xs" } },
  },
});
