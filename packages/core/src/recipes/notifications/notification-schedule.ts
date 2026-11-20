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
    root: { base: { font: "$font.sans" } },
    menu: {
      base: { width: "$notificationSchedule.w", padding: "$space.2xs", radius: "$radius.card", bg: "$surface.raised", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.menu" },
      platforms: { mobile: { base: { padding: "none", radius: "$radius.sheet", shadow: "$shadow.modal" } } },
    },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberW", height: "$sheet.grabberH", radius: "$radius.pill", bg: "$border.muted" } },
    heading: {
      base: { size: "$text.micro", weight: "$font.weightBold", tracking: "$tracking.caps", fg: "$fg.faint" },
      // The phone's letter spacing is -2% of its size, which the kit works out from this size.
      platforms: { mobile: { base: { size: "$text.lead", line: "$text.leadLine", weight: "$font.weightSemibold", tracking: "none", fg: "$fg.strong" } } },
    },
    active: {
      base: { gap: "$space.xs", radius: "$radius.row", bg: "$accent.soft", fg: "$fg.strong" },
    },
    activeIcon: { base: { square: "$icon.sizeMd", fg: "$info.default" } },
    activeText: { base: { size: "$text.bodySm", weight: "$font.weightMedium" } },
    divider: { base: { height: "$border.wHairline", bg: "$border.subtle" } },
    option: {
      base: { height: "$row.h", paddingX: "$space.sm", radius: "$radius.row", size: "$text.bodySm", fg: "$fg.body" },
      states: { hover: { bg: "$hover.surface", fg: "$fg.strong" }, focus: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" } },
      platforms: { mobile: { base: { paddingX: "$space.md" } } },
    },
    optionLabel: { platforms: { mobile: { base: { size: "$text.body", weight: "$font.weightNormal", fg: "$fg.body" } } } },
    optionDetail: { base: { size: "$text.caption", fg: "$fg.faint" }, platforms: { mobile: { base: { size: "$text.bodySm", weight: "$font.weightNormal" } } } },
    field: {
      base: { height: "$control.hXs", paddingX: "$space.sm", radius: "$radius.control", borderWidth: "$border.wHairline", borderColor: "$border.muted", bg: "$surface.card", size: "$text.bodySm", fg: "$fg.strong" },
      states: { focus: { borderColor: "$border.strong", shadow: "$shadow.focus" } },
      platforms: { mobile: { base: { weight: "$font.weightNormal" } } },
    },
    noteIcon: { base: { square: "$icon.sizeSm", fg: "$fg.faint" } },
    noteText: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint" }, platforms: { mobile: { base: { weight: "$font.weightNormal" } } } },
    pill: {
      base: { gap: "$space.xs", height: "$control.hXs", maxWidth: "$notificationSchedule.noteMaxW", paddingLeft: "$space.md", paddingRight: "$space.2xs", radius: "$radius.pill", bg: "$accent.soft", fg: "$fg.strong" },
      variants: { paused: { false: { bg: "$surface.muted", fg: "$fg.muted", paddingRight: "$space.md" } } },
    },
    pillIcon: { base: { square: "$icon.sizeMd", fg: "$info.default" } },
    pillText: { base: { size: "$text.caption", weight: "$font.weightSemibold" }, platforms: { mobile: { base: { size: "$text.bodySm" } } } },
    resume: {
      base: { height: "$control.hXxs", paddingX: "$space.sm", radius: "$radius.pill", bg: "$surface.raised", size: "$text.caption", weight: "$font.weightSemibold" },
      states: { hover: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } },
      platforms: { mobile: { states: { pressed: { bg: "$hover.surface" } } } },
    },
    resumeBordered: {
      base: { height: "$control.hXxs", paddingX: "$space.sm", radius: "$radius.pill", bg: "$surface.raised", size: "$text.caption", weight: "$font.weightSemibold", borderWidth: "$border.wHairline", borderColor: "$border.muted", fg: "$fg.strong" },
      states: { hover: { bg: "$hover.surface" }, focus: { shadow: "$shadow.focus" } },
      platforms: { mobile: { states: { pressed: { bg: "$hover.surface" } } } },
    },
    resumeText: { on: ["mobile"], base: { size: "$text.caption", weight: "$font.weightSemibold", fg: "$fg.strong" } },
  },
});
