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
      base: { gap: "$choice.gap", paddingY: "$choice.padY", font: "$font.sans" },
      states: { disabled: { opacity: "$opacity.disabled" } },
      // A box drawn without its label is still a 24px target on the web and the desktop (WCAG 2.2 2.5.8); the phone reaches 44pt by hitSlop.
      platforms: { web: { base: { minHeight: "$control.hit", minWidth: "$control.hit" } }, desktop: { base: { minHeight: "$control.hit", minWidth: "$control.hit" } } },
    },
    box: {
      base: { square: "$checkbox.size", radius: "$checkbox.radius", borderWidth: "$border.wThick", borderColor: "$border.default", bg: "transparent", fg: "$fg.onBrand" },
      // Hover darkens the edge of an empty box and deepens the coral of a ticked one; the phone has no hover.
      states: {
        on: { bg: "$brand.default", borderColor: "$brand.default" },
        hover: { borderColor: "$fg.faint" },
        "hover+on": { bg: "$brand.hover", borderColor: "$brand.hover" },
        focus: { shadow: "$shadow.focus" },
      },
    },
    tick: { base: { square: "$checkbox.tickSize" } },
    label: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.body" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } }, // idiom: one step larger
    },
    description: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } }, // idiom: one step larger
    },
  },
  reads: ["$icon.strokeTick", "$control.hit"],
});
