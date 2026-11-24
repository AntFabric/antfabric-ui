import { defineRecipe } from "../../recipe";

/**
 * SegmentedControl. Written from the React kit's table. `on` is "this segment is the chosen one".
 * The web slides ONE `card` under the chosen segment; the phone fills the chosen segment itself ("No smooth motion"), so the segment's own fill is
 * its `platforms.mobile` `on` state and the `card` is a web and desktop part. The phone has one size (md), no hover, and a pressed fill.
 * The track's and segment's gaps and the count chip's ink are the web's on the phone (item 43); its segment label is one step larger (idiom, item 42).
 * The track's padding (`space.2xs`) is the kit's layout. The card's `inset` is the kit's: the sliding card shares the `card` part and sets its own
 * `top` and `left`, so an `inset` in the part would also set its `right` and `bottom`; the kit reads `segmentedControl.cardInset` for it.
 */
export const segmentedControl = defineRecipe({
  parts: ["track", "card", "tab", "count"],
  styles: {
    track: {
      base: { gap: "$space.xs", radius: "$radius.pill", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.track" },
    },
    card: {
      on: ["web", "desktop"],
      base: { radius: "$radius.pill", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.card", shadow: "$elevation.shadow.hairline" },
    },
    tab: {
      base: {
        gap: "$space.xs",
        height: "$segmentedControl.height",
        paddingX: "$segmentedControl.paddingX",
        radius: "$radius.pill",
        borderWidth: "$border.width.hairline",
        borderColor: "transparent",
        font: "$font.family.sans",
        size: "$font.size.caption",
        weight: "$font.weight.semibold",
        fg: "$color.text.faint",
      },
      variants: {
        size: { sm: { height: "$size.control.xs", paddingX: "$space.smMd" }, md: {} },
        full: { true: { paddingX: "$space.sm" }, false: {} },
      },
      // Labels are semibold in both states so nothing changes width while the card moves; only the ink changes. Hover is the web's.
      states: { hover: { fg: "$color.text.muted" }, on: { fg: "$color.text.strong" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: {
        mobile: {
          // idiom: the label is one step larger on the phone.
          base: { size: "$font.size.bodySm" },
          states: {
            on: { bg: "$color.background.card", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.hairline" },
            pressed: { bg: "$color.background.hover" },
            "pressed+on": { bg: "$color.background.card" },
            focus: { shadow: "$elevation.shadow.focus" },
          },
        },
      },
    },
    count: {
      base: {
        height: "$segmentedControl.countSize",
        minWidth: "$segmentedControl.countSize",
        paddingX: "$space.2xs",
        radius: "$radius.control",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        bg: "$color.background.card",
        size: "$font.size.caption",
        weight: "$font.weight.semibold",
        fg: "$color.text.subtle",
      },
      states: { on: { fg: "$color.text.body" } },
      platforms: { mobile: { base: { line: "$font.size.caption" } } },
    },
  },
  reads: ["$segmentedControl.cardInset", "$size.target.min"],
});
