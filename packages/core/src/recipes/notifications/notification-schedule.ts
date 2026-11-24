import { defineRecipe } from "../../recipe";

/**
 * NotificationSchedule. Written from the React kit's table. `paused` false is the pill's quiet grey. Text parts carry their own
 * type (the web draws spans, the phone `Text`, which needs a weight to name a font file). On the phone the menu is a sheet: a
 * `sheet` radius, the modal shadow, a grabber, a large heading in place of the caps label, and bigger rows and type (a deliberate platform
 * idiom, item 42). The menu's own asymmetric paddings are the kit's.
 * The phone's bordered Resume (height, side padding) and its paused line's radius are the web's (item 43).
 */
export const notificationSchedule = defineRecipe({
  parts: [
    "root",
    "menu",
    "grabber",
    "heading",
    "active",
    "activeIcon",
    "activeText",
    "divider",
    "option",
    "optionLabel",
    "optionDetail",
    "field",
    "noteIcon",
    "noteText",
    "pill",
    "pillIcon",
    "pillText",
    "resume",
    "resumeBordered",
    "resumeText",
  ],
  styles: {
    root: { base: { font: "$font.family.sans" } },
    menu: {
      base: { width: "$notificationSchedule.width", padding: "$space.2xs", radius: "$radius.card", bg: "$color.background.raised", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.menu" },
      platforms: { mobile: { base: { padding: "none", radius: "$radius.sheet", shadow: "$elevation.shadow.modal" } } },
    },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", radius: "$radius.pill", bg: "$color.border.muted" } },
    heading: {
      base: { size: "$font.size.micro", weight: "$font.weight.bold", tracking: "$font.letterSpacing.caps", fg: "$color.text.faint" },
      // The phone's letter spacing is -2% of its size, which the kit works out from this size.
      platforms: { mobile: { base: { size: "$font.size.lead", line: "$font.lineHeight.lead", weight: "$font.weight.semibold", tracking: "none", fg: "$color.text.strong" } } },
    },
    active: {
      base: { gap: "$space.xs", radius: "$radius.row", bg: "$color.background.accent.soft", fg: "$color.text.strong" },
    },
    activeIcon: { base: { square: "$size.icon.md", fg: "$color.text.info" } },
    activeText: { base: { size: "$font.size.bodySm", weight: "$font.weight.medium" } },
    divider: { base: { height: "$border.width.hairline", bg: "$color.border.subtle" } },
    option: {
      base: { height: "$size.row.default", paddingX: "$space.sm", radius: "$radius.row", size: "$font.size.bodySm", fg: "$color.text.body" },
      states: { hover: { bg: "$color.background.hover", fg: "$color.text.strong" }, focus: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" } },
      platforms: { mobile: { base: { paddingX: "$space.md" } } },
    },
    optionLabel: { platforms: { mobile: { base: { size: "$font.size.body", weight: "$font.weight.normal", fg: "$color.text.body" } } } },
    optionDetail: { base: { size: "$font.size.caption", fg: "$color.text.faint" }, platforms: { mobile: { base: { size: "$font.size.bodySm", weight: "$font.weight.normal" } } } },
    field: {
      base: { height: "$size.control.xs", paddingX: "$space.sm", radius: "$radius.control", borderWidth: "$border.width.hairline", borderColor: "$color.border.muted", bg: "$color.background.card", size: "$font.size.bodySm", fg: "$color.text.strong" },
      states: { focus: { borderColor: "$color.border.strong", shadow: "$elevation.shadow.focus" } },
      platforms: { mobile: { base: { weight: "$font.weight.normal" } } },
    },
    noteIcon: { base: { square: "$size.icon.sm", fg: "$color.text.faint" } },
    noteText: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint" }, platforms: { mobile: { base: { weight: "$font.weight.normal" } } } },
    pill: {
      base: { gap: "$space.xs", height: "$size.control.xs", maxWidth: "$notificationSchedule.noteMaxWidth", paddingLeft: "$space.md", paddingRight: "$space.2xs", radius: "$radius.pill", bg: "$color.background.accent.soft", fg: "$color.text.strong" },
      variants: { paused: { false: { bg: "$color.background.muted", fg: "$color.text.muted", paddingRight: "$space.md" } } },
    },
    pillIcon: { base: { square: "$size.icon.md", fg: "$color.text.info" } },
    pillText: { base: { size: "$font.size.caption", weight: "$font.weight.semibold" }, platforms: { mobile: { base: { size: "$font.size.bodySm" } } } },
    resume: {
      base: { height: "$size.control.xxs", paddingX: "$space.sm", radius: "$radius.pill", bg: "$color.background.raised", size: "$font.size.caption", weight: "$font.weight.semibold" },
      states: { hover: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: { mobile: { states: { pressed: { bg: "$color.background.hover" } } } },
    },
    resumeBordered: {
      base: { height: "$size.control.xxs", paddingX: "$space.sm", radius: "$radius.pill", bg: "$color.background.raised", size: "$font.size.caption", weight: "$font.weight.semibold", borderWidth: "$border.width.hairline", borderColor: "$color.border.muted", fg: "$color.text.strong" },
      states: { hover: { bg: "$color.background.hover" }, focus: { shadow: "$elevation.shadow.focus" } },
      platforms: { mobile: { states: { pressed: { bg: "$color.background.hover" } } } },
    },
    resumeText: { on: ["mobile"], base: { size: "$font.size.caption", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
  },
});
