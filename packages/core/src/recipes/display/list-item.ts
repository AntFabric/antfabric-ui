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
 * is `size.stroke.tick`, a stroke width the keys cannot say, so the kit reads it and the recipe grants it through `reads`.
 */
export const listItem = defineRecipe({
  parts: ["root", "leadingIcon", "tile", "tileIcon", "title", "subtitle", "detail", "check", "tick", "selectedIcon", "chevron"],
  styles: {
    root: {
      base: { gap: "$space.sm", minHeight: "$size.row.default", radius: "$radius.row", font: "$font.family.sans", fg: "$color.text.body" },
      variants: {
        leading: { tile: { gap: "$space.md" } },
        divider: { true: { borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle" } },
        // `selected` here is a filled row: a ticked link or button (the open conversation), which hover leaves filled. Pressed fills any row.
        selected: { true: { bg: "$color.background.selected", states: { hover: { bg: "$color.background.selected" } } }, false: { states: { hover: { bg: "$color.background.hover" } } } },
      },
      states: { pressed: { bg: "$color.background.selected" }, focus: { shadow: "$elevation.shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        mobile: {
          // idiom: a full-bleed list row has no corners and no fill (the row dims under the finger), and a one-step-larger gap.
          base: { gap: "$space.md", radius: "none" },
          variants: { selected: { true: { bg: "none" } } },
          states: { pressed: { bg: "none" } },
        },
      },
    },
    leadingIcon: { on: ["web", "desktop"], base: { square: "$size.icon.default", fg: "$color.text.muted" }, variants: { destructive: { true: { fg: "$color.text.danger" } } } },
    tile: {
      base: { bg: "$color.background.muted", fg: "$color.text.muted" },
      variants: { tile: { "32": { radius: "$radius.control" } }, destructive: { true: { fg: "$color.text.danger" } } },
    },
    tileIcon: { variants: { tile: { "32": { square: "$size.icon.md" }, "36": { square: "$size.icon.default" } } } },
    title: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.medium", fg: "$color.text.body" },
      variants: { unread: { true: { weight: "$font.weight.bold", fg: "$color.text.strong" } }, destructive: { true: { fg: "$color.text.danger" } } },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } }, // idiom: one step larger
    },
    subtitle: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" },
      // idiom: one step larger; the weight is for the phone's `Text`, which names a font file.
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } },
    },
    detail: {
      base: { size: "$font.size.caption", fg: "$color.text.faint" },
      variants: { unread: { true: { fg: "$color.text.strong", weight: "$font.weight.semibold" } } },
      // The phone's base weight sits over the web's variants, so its unread detail says semibold again (the ink is the web's `color.text.strong`).
      platforms: { mobile: { base: { size: "$font.size.bodySm", weight: "$font.weight.normal" }, variants: { unread: { true: { weight: "$font.weight.semibold" } } } } },
    },
    check: {
      base: { square: "$checkbox.size", radius: "$checkbox.radius", borderWidth: "$border.width.thick", borderColor: "$color.border.default", fg: "$color.text.onBrand" },
      states: { hover: { borderColor: "$color.text.faint" }, on: { bg: "$color.background.brand.default", borderColor: "$color.background.brand.default" }, "hover+on": { bg: "$color.background.brand.hover", borderColor: "$color.background.brand.hover" } },
    },
    tick: { base: { square: "$checkbox.tickSize" } },
    selectedIcon: { base: { square: "$size.icon.default", fg: "$color.background.brand.default" } },
    // No web example draws a chevron, so the check cannot see the part there and it is the phone's alone here; the web kit draws the same
    // glyph (`size.icon.md`, `color.text.faint`) from tokens other parts of this recipe already grant.
    chevron: {
      on: ["mobile"],
      base: { square: "$size.icon.md", fg: "$color.text.faint" },
      // The phone's chevron follows the tile: a 16pt one beside a 32pt tile, a 20pt one beside a 36pt tile.
      platforms: { mobile: { variants: { tile: { "36": { square: "$size.icon.default" } } } } },
    },
  },
  reads: ["$size.stroke.tick"],
});
