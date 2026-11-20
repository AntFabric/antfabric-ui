import { defineRecipe } from "../../recipe";

/**
 * SidebarSection. A collapsible group of sidebar rows under a header. The phone's header is taller (the touch target), its label is
 * body-small, and its empty line takes the gutter: a platform idiom (item 42).
 */
export const sidebarSection = defineRecipe({
  parts: ["root", "header", "toggle", "chevron", "starIcon", "label", "list", "emptyText"],
  styles: {
    root: {
      base: { font: "$font.sans" },
      // The hairline above a divided section, parting it from the one before; the web also leaves a space above it.
      variants: { divided: { true: { borderTopWidth: "$border.wHairline", borderTopColor: "$border.subtle" } } },
      platforms: {
        web: { variants: { divided: { true: { marginTop: "$space.md" } } } },
        desktop: { variants: { divided: { true: { marginTop: "$space.md" } } } },
      },
    },
    header: {
      platforms: {
        web: { base: { paddingTop: "$sidebar.sectionPadTop" } },
        desktop: { base: { paddingTop: "$sidebar.sectionPadTop" } },
        mobile: { base: { minHeight: "$control.hit", paddingLeft: "$gutter.pane" } },
      },
    },
    toggle: {
      base: { gap: "$sidebar.sectionGap", radius: "$radius.tag", fg: "$fg.subtle" },
      states: { hover: { fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
      platforms: {
        web: { base: { minHeight: "$sidebar.sectionHeaderH", size: "$text.body", weight: "$font.weightSemibold" } },
        desktop: { base: { minHeight: "$sidebar.sectionHeaderH", size: "$text.body", weight: "$font.weightSemibold" } },
        // A phone has no hover; its label carries the colour (`label`).
        mobile: { base: { minHeight: "$control.hit" } },
      },
    },
    chevron: { base: { square: "$icon.sizeMd" }, platforms: { mobile: { base: { fg: "$fg.subtle" } } } },
    starIcon: { base: { square: "$icon.sizeMd", fg: "$fg.faint" } },
    // The rows are a hairline apart.
    list: { on: ["web", "desktop"], base: { gap: "$border.wHairline" } },
    label: { on: ["mobile"], base: { size: "$text.bodySm", weight: "$font.weightSemibold", fg: "$fg.subtle" } },
    emptyText: {
      base: { size: "$text.bodySm", fg: "$fg.faint" },
      platforms: { mobile: { base: { line: "$text.bodySmLine", weight: "$font.weightNormal", paddingX: "$gutter.pane" } } },
    },
  },
});
