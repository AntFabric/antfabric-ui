import { defineRecipe } from "../../recipe";

/**
 * Switch. The track and thumb are the same on both kits (their sizes come from the profile, and Android's thinner track
 * from the OS set); the label and description are where the phone differs.
 * The phone's larger label, description and icon are a deliberate platform idiom (owner decision, 2026-11-03), kept in `platforms.mobile`;
 * their weights and inks are the web's (item 43).
 */
export const switchRecipe = defineRecipe({
  parts: ["root", "icon", "label", "description", "track", "thumb"],
  styles: {
    root: { base: { gap: "$choice.gap", minHeight: "$size.target.min", font: "$font.family.sans" }, states: { disabled: { opacity: "$opacity.disabled" } } },
    icon: { base: { square: "$size.icon.md", fg: "$color.text.muted" }, platforms: { mobile: { base: { square: "$size.icon.default" } } } }, // idiom: one step larger
    label: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.body" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } }, // idiom: one step larger
    },
    description: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } }, // idiom: one step larger
    },
    track: {
      base: { width: "$switch.trackWidth", height: "$switch.trackHeight", padding: "$switch.trackPadding", radius: "$radius.pill", bg: "$switch.trackOffColor" },
      // Hover greys the off track to the muted edge and deepens the coral of the on one; the phone has no hover.
      states: { on: { bg: "$color.background.brand.default" }, hover: { bg: "$color.border.muted" }, "hover+on": { bg: "$color.background.brand.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    thumb: { base: { square: "$switch.thumbSize", radius: "$radius.circle", bg: "$switch.thumbColor", shadow: "$switch.thumbShadow" } },
  },
  reads: ["$switch.thumbTravel"],
});
