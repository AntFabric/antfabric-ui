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
    root: { base: { gap: "$choice.gap", minHeight: "$control.hit", font: "$font.sans" }, states: { disabled: { opacity: "$opacity.disabled" } } },
    icon: { base: { square: "$icon.sizeMd", fg: "$fg.muted" }, platforms: { mobile: { base: { square: "$icon.size" } } } }, // idiom: one step larger
    label: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.body" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } }, // idiom: one step larger
    },
    description: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } }, // idiom: one step larger
    },
    track: {
      base: { width: "$switch.trackW", height: "$switch.trackH", padding: "$switch.trackPad", radius: "$radius.pill", bg: "$switch.trackOff" },
      // Hover greys the off track to the muted edge and deepens the coral of the on one; the phone has no hover.
      states: { on: { bg: "$brand.default" }, hover: { bg: "$border.muted" }, "hover+on": { bg: "$brand.hover" }, focus: { shadow: "$shadow.focus" } },
    },
    thumb: { base: { square: "$switch.thumbSize", radius: "$radius.circle", bg: "$switch.thumb", shadow: "$switch.thumbShadow" } },
  },
  reads: ["$switch.thumbTravel"],
});
