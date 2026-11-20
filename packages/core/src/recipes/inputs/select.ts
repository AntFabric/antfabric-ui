import { defineRecipe, type PartLayers } from "../../recipe";

/** The wash under the cursor or the finger: the active row, and a pressed one on the phone. */
const wash: PartLayers = { states: { on: { bg: "$hover.surface" } } };

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
 * height floor and radius (web md `control.hLg` and `radius.control`, phone minimum `control.hInput` and `radius.input`) and its right padding (web `space.smMd`, phone
 * `space.md`); the option's box (web a 9px-padded `radius.row` row, phone a `row.h` row with the pane gutter) and the dot's right margin (web `select.dotGap`, phone none,
 * the row's gap does it). The phone has its own pressed fill on the trigger; the web has hover.
 * Vocabulary gap: the icon's default tint (`fg.subtle`, when the item names no colour) is read by the kits.
 */
export const select = defineRecipe({
  parts: ["root", "label", "trigger", "icon", "placeholder", "supporting", "caret", "panel", "sheet", "grabber", "title", "search", "empty", "option", "optionIcon", "optionLabel", "dot"],
  styles: {
    root: { base: { gap: "$space.xs", font: "$font.sans" }, platforms: { mobile: { base: { gap: "$space.sm" } } } },
    label: {
      base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightSemibold", fg: "$fg.body" },
      platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine" } } }, // idiom: one step larger
    },
    trigger: {
      base: {
        gap: "$space.sm",
        height: "$control.hLg",
        paddingLeft: "$space.md",
        paddingRight: "$space.smMd",
        radius: "$radius.control",
        bg: "$surface.card",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        shadow: "$shadow.hairline",
        font: "$font.sans",
        size: "$text.bodySm",
        weight: "$font.weightSemibold",
        fg: "$fg.body",
      },
      variants: {
        size: {
          sm: { height: "$control.hSm", paddingLeft: "$select.padLeftSm", paddingRight: "$space.sm", size: "$text.caption" },
          md: {},
          lg: { height: "$control.hInput", paddingLeft: "$space.mdLg", paddingRight: "$space.md", radius: "$radius.input", size: "$text.body" },
        },
        variant: {
          field: {
            // A 2px edge: the border and an inner ring, over the hairline shadow the field keeps. Invalid takes the ring too.
            states: {
              focus: { borderColor: "$border.active", halo: "$shadow.hairline", ring: "$border.active", shadow: "none" },
              "invalid+focus": { ring: "$danger.default" },
            },
          },
          chip: {
            height: "$select.chipH",
            gap: "$select.triggerGap",
            paddingLeft: "$select.chipPadLeft",
            paddingRight: "$space.xs",
            radius: "$radius.control",
            bg: "$surface.recessed",
            shadow: "none",
            size: "$text.caption",
            states: { focus: { borderColor: "$border.active", shadow: "none" } },
          },
          link: {
            height: "$select.linkH",
            gap: "$select.triggerGap",
            paddingLeft: "$select.linkPadX",
            paddingRight: "$select.linkPadX",
            radius: "$radius.control",
            bg: "transparent",
            borderWidth: "$border.wThick",
            borderColor: "transparent",
            shadow: "none",
            size: "$text.bodySm",
            states: { focus: { borderColor: "$border.active", shadow: "none" } },
          },
        },
      },
      // Invalid beats focus: its edge stays danger. The kit passes `hover` only while the panel is closed.
      states: { invalid: { borderColor: "$danger.default" }, hover: { bg: "$hover.surface", fg: "$fg.strong" }, pressed: { bg: "$hover.surface" }, disabled: { bg: "$surface.muted", fg: "$fg.faint" } },
      platforms: {
        mobile: {
          base: { gap: "$space.md", height: "none", minHeight: "$control.hInput", paddingLeft: "$space.md", paddingRight: "$space.md", radius: "$radius.input", size: "$text.body" },
          states: { focus: { borderColor: "$border.active" }, "invalid+focus": { borderColor: "$danger.default" } },
        },
      },
    },
    icon: { base: { square: "$icon.sizeMd" }, platforms: { mobile: { base: { square: "$icon.size" } } } },
    placeholder: { base: { fg: "$fg.faint", weight: "$font.weightMedium" } },
    supporting: {
      base: { marginLeft: "$space.xs", fg: "$fg.faint", weight: "$font.weightMedium" },
      // The phone draws it on a line of its own under the label, so it has no margin.
      platforms: { mobile: { base: { marginLeft: "none", size: "$text.bodySm", line: "$text.bodySmLine" } } },
    },
    caret: {
      base: { square: "$icon.size", fg: "$fg.faint" },
      variants: { size: { sm: { square: "$icon.sizeMd" } }, variant: { chip: { square: "$icon.sizeMd" }, link: { square: "$icon.sizeMd" } } },
    },
    panel: {
      on: ["web", "desktop"],
      base: { padding: "$select.panelPad", radius: "$radius.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.raised", shadow: "$shadow.menu", maxHeight: "$select.panelMaxH" },
      variants: { variant: { link: { minWidth: "$select.panelMinW" } } },
    },
    sheet: { on: ["mobile"], base: { paddingBottom: "$homeIndicator.h", radiusTop: "$radius.sheet", bg: "$surface.raised", shadow: "$shadow.modal" } },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberW", height: "$sheet.grabberH", marginTop: "$space.xs", radius: "$radius.pill", bg: "$border.muted" } },
    title: { on: ["mobile"], base: { paddingX: "$gutter.pane", paddingY: "$space.md", size: "$text.title", line: "$text.titleLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    search: { platforms: { mobile: { base: { paddingX: "$gutter.pane", paddingBottom: "$space.sm" } } } },
    empty: {
      base: { size: "$text.caption", fg: "$fg.faint" },
      platforms: { mobile: { base: { paddingY: "$space.smMd", paddingX: "$gutter.pane", size: "$text.bodySm", weight: "$font.weightNormal" } } },
    },
    option: {
      states: { disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        web: { base: { gap: "$choice.gap", radius: "$radius.row", bg: "transparent" }, ...wash },
        desktop: { base: { gap: "$choice.gap", radius: "$radius.row", bg: "transparent" }, ...wash },
        mobile: { base: { gap: "$space.md", minHeight: "$row.h", paddingX: "$gutter.pane", paddingY: "$space.xs" }, states: { on: { bg: "$hover.surface" }, pressed: { bg: "$hover.surface" } } },
      },
    },
    optionIcon: { base: { square: "$icon.size" } },
    optionLabel: {
      base: { size: "$text.bodySm", weight: "$font.weightSemibold", fg: "$fg.strong" },
      platforms: { mobile: { base: { size: "$text.body", line: "$text.bodyLine" } } }, // idiom: one step larger
    },
    dot: { base: { square: "$choice.dotSize", marginRight: "$select.dotGap", radius: "$radius.circle", bg: "$brand.default" }, platforms: { mobile: { base: { marginRight: "none" } } } },
  },
  reads: ["$fg.subtle"],
});
