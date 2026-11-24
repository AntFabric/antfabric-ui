import { defineRecipe, type PartLayers } from "../../recipe";

/** The wash under the cursor or the finger: the active row, and a pressed one on the phone. */
const wash: PartLayers = { states: { on: { bg: "$color.background.hover" } } };

/**
 * Select. Written from the React kit's table. `on` is "under the cursor" for an option (the active row, which pointer hover also moves). The web draws a
 * dropdown `panel` of `option`s under the `trigger`; the phone draws the same trigger over a bottom `sheet` of 52pt `option`s (with a `grabber`, a `title` and the
 * `search` box above them), so `panel` is web and desktop and `sheet`, `grabber` and `title` are the phone's. `search` is the box above the options on every platform (the web's is under the panel's edge, the phone's has the sheet's gutter). The phone's trigger is the text field's box
 * (it has no `size` or `variant`), so its values are laid over the web's md field in `platforms.mobile`.
 * The web is a bordered `field`, a recessed `chip` or a box-less `link` (the `variant` prop, over the `size`); the trigger keeps the hover while open (the panel
 * is the feedback), and the kit passes `hover` only while closed. A focused `field` is a 2px edge (border plus an inner ring) over its hairline shadow; invalid beats focus.
 * The phone's larger label, value, row text and icons, and its more generous gaps, are a deliberate platform idiom (owner decision, 2026-11-03), kept in `platforms.mobile`.
 * The trigger's hairline shadow and value weight, the label's weight and ink, the option's label weight, the supporting text's weight and ink and the
 * empty message's ink are the web's on the phone (item 43). Kept, borderline (listed for the owner): the trigger is the web's md field on the phone with the lg field's
 * height floor and radius (web md `size.control.lg` and `radius.control`, phone minimum `size.control.input` and `radius.input`) and its right padding (web `space.smMd`, phone
 * `space.md`); the option's box (web a 9px-padded `radius.row` row, phone a `size.row.default` row with the pane gutter) and the dot's right margin (web `select.dotGap`, phone none,
 * the row's gap does it). The phone has its own pressed fill on the trigger; the web has hover.
 * Vocabulary gap: the icon's default tint (`color.text.subtle`, when the item names no colour) is read by the kits.
 */
export const select = defineRecipe({
  parts: ["root", "label", "trigger", "icon", "placeholder", "supporting", "caret", "panel", "sheet", "grabber", "title", "search", "empty", "option", "optionIcon", "optionLabel", "dot"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.family.sans" }, platforms: { mobile: { base: { gap: "$space.sm" } } } },
    label: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.semibold", fg: "$color.text.body" },
      platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" } } }, // idiom: one step larger
    },
    trigger: {
      base: {
        gap: "$space.sm",
        height: "$size.control.lg",
        paddingLeft: "$space.md",
        paddingRight: "$space.smMd",
        radius: "$radius.control",
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        shadow: "$elevation.shadow.hairline",
        font: "$font.family.sans",
        size: "$font.size.bodySm",
        weight: "$font.weight.semibold",
        fg: "$color.text.body",
      },
      variants: {
        size: {
          sm: { height: "$size.control.sm", paddingLeft: "$select.paddingLeftSm", paddingRight: "$space.sm", size: "$font.size.caption" },
          md: {},
          lg: { height: "$size.control.input", paddingLeft: "$space.mdLg", paddingRight: "$space.md", radius: "$radius.input", size: "$font.size.body" },
        },
        variant: {
          field: {
            // A 2px edge: the border and an inner ring, over the hairline shadow the field keeps. Invalid takes the ring too.
            states: {
              focus: { borderColor: "$color.border.selected", halo: "$elevation.shadow.hairline", ring: "$color.border.selected", shadow: "none" },
              "invalid+focus": { ring: "$color.text.danger" },
            },
          },
          chip: {
            height: "$select.chipHeight",
            gap: "$select.triggerGap",
            paddingLeft: "$select.chipPaddingLeft",
            paddingRight: "$space.xs",
            radius: "$radius.control",
            bg: "$color.background.recessed",
            shadow: "none",
            size: "$font.size.caption",
            states: { focus: { borderColor: "$color.border.selected", shadow: "none" } },
          },
          link: {
            height: "$select.linkHeight",
            gap: "$select.triggerGap",
            paddingLeft: "$select.linkPaddingX",
            paddingRight: "$select.linkPaddingX",
            radius: "$radius.control",
            bg: "transparent",
            borderWidth: "$border.width.thick",
            borderColor: "transparent",
            shadow: "none",
            size: "$font.size.bodySm",
            states: { focus: { borderColor: "$color.border.selected", shadow: "none" } },
          },
        },
      },
      // Invalid beats focus: its edge stays danger. The kit passes `hover` only while the panel is closed.
      states: { invalid: { borderColor: "$color.text.danger" }, hover: { bg: "$color.background.hover", fg: "$color.text.strong" }, pressed: { bg: "$color.background.hover" }, disabled: { bg: "$color.background.muted", fg: "$color.text.faint" } },
      platforms: {
        mobile: {
          base: { gap: "$space.md", height: "none", minHeight: "$size.control.input", paddingLeft: "$space.md", paddingRight: "$space.md", radius: "$radius.input", size: "$font.size.body" },
          states: { focus: { borderColor: "$color.border.selected" }, "invalid+focus": { borderColor: "$color.text.danger" } },
        },
      },
    },
    icon: { base: { square: "$size.icon.md" }, platforms: { mobile: { base: { square: "$size.icon.default" } } } },
    placeholder: { base: { fg: "$color.text.faint", weight: "$font.weight.medium" } },
    supporting: {
      base: { marginLeft: "$space.xs", fg: "$color.text.faint", weight: "$font.weight.medium" },
      // The phone draws it on a line of its own under the label, so it has no margin.
      platforms: { mobile: { base: { marginLeft: "none", size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" } } },
    },
    caret: {
      base: { square: "$size.icon.default", fg: "$color.text.faint" },
      variants: { size: { sm: { square: "$size.icon.md" } }, variant: { chip: { square: "$size.icon.md" }, link: { square: "$size.icon.md" } } },
    },
    panel: {
      on: ["web", "desktop"],
      base: { padding: "$select.panelPadding", radius: "$radius.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.raised", shadow: "$elevation.shadow.menu", maxHeight: "$select.panelMaxHeight" },
      variants: { variant: { link: { minWidth: "$select.panelMinWidth" } } },
    },
    sheet: { on: ["mobile"], base: { paddingBottom: "$size.layout.homeIndicator", radiusTop: "$radius.sheet", bg: "$color.background.raised", shadow: "$elevation.shadow.modal" } },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", marginTop: "$space.xs", radius: "$radius.pill", bg: "$color.border.muted" } },
    title: { on: ["mobile"], base: { paddingX: "$space.gutter.pane", paddingY: "$space.md", size: "$font.size.title", line: "$font.lineHeight.title", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    search: { platforms: { mobile: { base: { paddingX: "$space.gutter.pane", paddingBottom: "$space.sm" } } } },
    empty: {
      base: { size: "$font.size.caption", fg: "$color.text.faint" },
      platforms: { mobile: { base: { paddingY: "$space.smMd", paddingX: "$space.gutter.pane", size: "$font.size.bodySm", weight: "$font.weight.normal" } } },
    },
    option: {
      states: { disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        web: { base: { gap: "$choice.gap", radius: "$radius.row", bg: "transparent" }, ...wash },
        desktop: { base: { gap: "$choice.gap", radius: "$radius.row", bg: "transparent" }, ...wash },
        mobile: { base: { gap: "$space.md", minHeight: "$size.row.default", paddingX: "$space.gutter.pane", paddingY: "$space.xs" }, states: { on: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.hover" } } },
      },
    },
    optionIcon: { base: { square: "$size.icon.default" } },
    optionLabel: {
      base: { size: "$font.size.bodySm", weight: "$font.weight.semibold", fg: "$color.text.strong" },
      platforms: { mobile: { base: { size: "$font.size.body", line: "$font.lineHeight.body" } } }, // idiom: one step larger
    },
    dot: { base: { square: "$choice.dotSize", marginRight: "$select.dotGap", radius: "$radius.circle", bg: "$color.background.brand.default" }, platforms: { mobile: { base: { marginRight: "none" } } } },
  },
  reads: ["$color.text.subtle"],
});
