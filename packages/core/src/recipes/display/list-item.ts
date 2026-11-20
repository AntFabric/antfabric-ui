import { defineRecipe } from "../../recipe";

/**
 * ListItem. The phone's row is its own idiom: no radius or fill (the row is dimmed under the finger, which is motion in the kit), every glyph
 * in a tile (so no bare `leadingIcon`), a 12pt inset and gap, the title one step up, and the subtitle and detail in body-small type.
 * Where a kit differs the web's value is in the main layers and the phone's in `platforms.mobile`; inks and weights are the web's (item 43).
 *
 * The row's padding is not here, on either kit, because the render snapshot would count it as a change: on the web the reader writes
 * `paddingX` and `paddingY` together as one `padding`, where the row's pressable reset sets `padding: 0` under two longhands; on the phone
 * React Native Web writes a StyleSheet's `padding` as a shorthand and an inline one as four longhands. So the kits keep the row's inset
 * (web `space.2xs` × `space.smMd`, `space.sm` × `space.md` beside a tile; phone `space.md`) as `space` reads, which the check allows.
 *
 * The divider is a bottom edge only (`borderBottomWidth` and `borderBottomColor` on the `divider` variant). The ticked checkbox's stroke
 * is `icon.strokeTick`, a stroke width the keys cannot say, so the kit reads it and the recipe grants it through `reads`.
 */
export const listItem = defineRecipe({
  parts: ["root", "leadingIcon", "tile", "tileIcon", "title", "subtitle", "detail", "check", "tick", "selectedIcon", "chevron"],
  styles: {
    root: {
      base: { gap: "$space.sm", minHeight: "$row.h", radius: "$radius.row", font: "$font.sans", fg: "$fg.body" },
      variants: {
        leading: { tile: { gap: "$space.md" } },
        divider: { true: { borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle" } },
        // `selected` here is a filled row: a ticked link or button (the open conversation), which hover leaves filled. Pressed fills any row.
        selected: { true: { bg: "$surface.selected", states: { hover: { bg: "$surface.selected" } } }, false: { states: { hover: { bg: "$hover.surface" } } } },
      },
      states: { pressed: { bg: "$surface.selected" }, focus: { shadow: "$shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        mobile: {
          // idiom: a full-bleed list row has no corners and no fill (the row dims under the finger), and a one-step-larger gap.
          base: { gap: "$space.md", radius: "none" },
          variants: { selected: { true: { bg: "none" } } },
          states: { pressed: { bg: "none" } },
        },
      },
    },
    leadingIcon: { on: ["web", "desktop"], base: { square: "$icon.size", fg: "$fg.muted" }, variants: { destructive: { true: { fg: "$danger.default" } } } },
    tile: {
      base: { bg: "$surface.muted", fg: "$fg.muted" },
      variants: { tile: { "32": { radius: "$radius.control" } }, destructive: { true: { fg: "$danger.default" } } },
    },
    tileIcon: { variants: { tile: { "32": { square: "$icon.sizeMd" }, "36": { square: "$icon.size" } } } },
    title: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightMedium", fg: "$fg.body" },
      variants: { unread: { true: { weight: "$font.weightBold", fg: "$fg.strong" } }, destructive: { true: { fg: "$danger.default" } } },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } }, // idiom: one step larger
    },
    subtitle: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" },
      // idiom: one step larger; the weight is for the phone's `Text`, which names a font file.
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } },
    },
    detail: {
      base: { size: "$text.caption", fg: "$fg.faint" },
      variants: { unread: { true: { fg: "$fg.strong", weight: "$font.weightSemibold" } } },
      // The phone's base weight sits over the web's variants, so its unread detail says semibold again (the ink is the web's `fg.strong`).
      platforms: { mobile: { base: { size: "$text.bodySm", weight: "$font.weightNormal" }, variants: { unread: { true: { weight: "$font.weightSemibold" } } } } },
    },
    check: {
      base: { square: "$checkbox.size", radius: "$checkbox.radius", borderWidth: "$border.wThick", borderColor: "$border.default", fg: "$fg.onBrand" },
      states: { hover: { borderColor: "$fg.faint" }, on: { bg: "$brand.default", borderColor: "$brand.default" }, "hover+on": { bg: "$brand.hover", borderColor: "$brand.hover" } },
    },
    tick: { base: { square: "$checkbox.tickSize" } },
    selectedIcon: { base: { square: "$icon.size", fg: "$brand.default" } },
    // No web example draws a chevron, so the check cannot see the part there and it is the phone's alone here; the web kit draws the same
    // glyph (`icon.sizeMd`, `fg.faint`) from tokens other parts of this recipe already grant.
    chevron: {
      on: ["mobile"],
      base: { square: "$icon.sizeMd", fg: "$fg.faint" },
      // The phone's chevron follows the tile: a 16pt one beside a 32pt tile, a 20pt one beside a 36pt tile.
      platforms: { mobile: { variants: { tile: { "36": { square: "$icon.size" } } } } },
    },
  },
  reads: ["$icon.strokeTick"],
});
