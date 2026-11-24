import { defineRecipe } from "../../recipe";

/**
 * Checkbox. Written from the React kit's table. The box is the same on both kits; the label and description are one step larger on the phone
 * (a platform idiom, item 42, kept in `platforms.mobile`); their weights and inks are the web's (item 43).
 * `on` is "ticked or mixed": the kit turns it on for either, as the fill is the same.
 */
export const checkbox = defineRecipe({
  parts: ["root", "box", "tick", "label", "description"],
  styles: {
    root: {
      base: { gap: "$choice.gap", paddingY: "$choice.paddingY", font: "$font.family.sans" },
      states: { disabled: { opacity: "$opacity.disabled" } },
      // A box drawn without its label is still a 24px target on the web and the desktop (WCAG 2.2 2.5.8); the phone reaches 44pt by hitSlop.
      platforms: { web: { base: { minHeight: "$size.target.min", minWidth: "$size.target.min" } }, desktop: { base: { minHeight: "$size.target.min", minWidth: "$size.target.min" } } },
    },
    box: {
      base: { square: "$checkbox.size", radius: "$checkbox.radius", borderWidth: "$border.width.thick", borderColor: "$color.border.default", bg: "transparent", fg: "$color.text.onBrand" },
      // Hover darkens the edge of an empty box and deepens the coral of a ticked one; the phone has no hover.
      states: {
        on: { bg: "$color.background.brand.default", borderColor: "$color.background.brand.default" },
        hover: { borderColor: "$color.text.faint" },
        "hover+on": { bg: "$color.background.brand.hover", borderColor: "$color.background.brand.hover" },
        focus: { shadow: "$elevation.shadow.focus" },
      },
    },
    tick: { base: { square: "$checkbox.tickSize" } },
    label: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.body" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } }, // idiom: one step larger
    },
    description: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } }, // idiom: one step larger
    },
  },
  reads: ["$size.stroke.tick", "$size.target.min"],
});
