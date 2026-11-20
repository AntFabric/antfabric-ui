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
      base: { gap: "$space.xs", radius: "$radius.pill", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$tabs.track" },
    },
    card: {
      on: ["web", "desktop"],
      base: { radius: "$radius.pill", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.card", shadow: "$shadow.hairline" },
    },
    tab: {
      base: {
        gap: "$space.xs",
        height: "$segmentedControl.h",
        paddingX: "$segmentedControl.padX",
        radius: "$radius.pill",
        borderWidth: "$border.wHairline",
        borderColor: "transparent",
        font: "$font.sans",
        size: "$text.caption",
        weight: "$font.weightSemibold",
        fg: "$fg.faint",
      },
      variants: {
        size: { sm: { height: "$control.hXs", paddingX: "$space.smMd" }, md: {} },
        full: { true: { paddingX: "$space.sm" }, false: {} },
      },
      // Labels are semibold in both states so nothing changes width while the card moves; only the ink changes. Hover is the web's.
      states: { hover: { fg: "$fg.muted" }, on: { fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
      platforms: {
        mobile: {
          // idiom: the label is one step larger on the phone.
          base: { size: "$text.bodySm" },
          states: {
            on: { bg: "$surface.card", borderColor: "$border.subtle", shadow: "$shadow.hairline" },
            pressed: { bg: "$hover.surface" },
            "pressed+on": { bg: "$surface.card" },
            focus: { shadow: "$shadow.focus" },
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
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        bg: "$surface.card",
        size: "$text.caption",
        weight: "$font.weightSemibold",
        fg: "$fg.subtle",
      },
      states: { on: { fg: "$fg.body" } },
      platforms: { mobile: { base: { line: "$text.caption" } } },
    },
  },
  reads: ["$segmentedControl.cardInset", "$control.hit"],
});
