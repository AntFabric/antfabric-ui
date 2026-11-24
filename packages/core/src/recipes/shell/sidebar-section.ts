import { defineRecipe } from "../../recipe";

/**
 * SidebarSection. A collapsible group of sidebar rows under a header. The phone's header is taller (the touch target), its label is
 * body-small, and its empty line takes the gutter: a platform idiom (item 42).
 */
export const sidebarSection = defineRecipe({
  parts: ["root", "header", "toggle", "chevron", "starIcon", "label", "list", "emptyText"],
  styles: {
    root: {
      base: { font: "$font.family.sans" },
      // The hairline above a divided section, parting it from the one before; the web also leaves a space above it.
      variants: { divided: { true: { borderTopWidth: "$border.width.hairline", borderTopColor: "$color.border.subtle" } } },
      platforms: {
        web: { variants: { divided: { true: { marginTop: "$space.md" } } } },
        desktop: { variants: { divided: { true: { marginTop: "$space.md" } } } },
      },
    },
    header: {
      platforms: {
        web: { base: { paddingTop: "$sidebarSection.sectionPaddingTop" } },
        desktop: { base: { paddingTop: "$sidebarSection.sectionPaddingTop" } },
        mobile: { base: { minHeight: "$size.target.min", paddingLeft: "$space.gutter.pane" } },
      },
    },
    toggle: {
      base: { gap: "$sidebarSection.sectionGap", radius: "$radius.tag", fg: "$color.text.subtle" },
      states: { hover: { fg: "$color.text.strong" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: {
        web: { base: { minHeight: "$sidebarSection.sectionHeaderHeight", size: "$font.size.body", weight: "$font.weight.semibold" } },
        desktop: { base: { minHeight: "$sidebarSection.sectionHeaderHeight", size: "$font.size.body", weight: "$font.weight.semibold" } },
        // A phone has no hover; its label carries the colour (`label`).
        mobile: { base: { minHeight: "$size.target.min" } },
      },
    },
    chevron: { base: { square: "$size.icon.md" }, platforms: { mobile: { base: { fg: "$color.text.subtle" } } } },
    starIcon: { base: { square: "$size.icon.md", fg: "$color.text.faint" } },
    // The rows are a hairline apart.
    list: { on: ["web", "desktop"], base: { gap: "$border.width.hairline" } },
    label: { on: ["mobile"], base: { size: "$font.size.bodySm", weight: "$font.weight.semibold", fg: "$color.text.subtle" } },
    emptyText: {
      base: { size: "$font.size.bodySm", fg: "$color.text.faint" },
      platforms: { mobile: { base: { line: "$font.lineHeight.bodySm", weight: "$font.weight.normal", paddingX: "$space.gutter.pane" } } },
    },
  },
});
