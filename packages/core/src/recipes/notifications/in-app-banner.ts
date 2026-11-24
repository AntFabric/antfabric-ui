import { defineRecipe } from "../../recipe";

/**
 * InAppBanner. Written from the React kit's table. Text parts carry their own type on both kits (the web draws spans, the phone
 * `Text`, and a phone `Text` needs a weight to name a font file). The phone's card is Liquid Glass where the system has it, with its own
 * shadow (`elevation.shadow.pill`, a deliberate platform idiom), its paddings are the kit's (a tighter bottom, where the web pads evenly),
 * and it has no inline reply: it has a grabber instead. The web's hit area keeps clear of the dismiss button with a right padding.
 */
export const inAppBanner = defineRecipe({
  parts: ["root", "card", "hit", "tile", "tileIcon", "title", "context", "time", "body", "lead", "more", "field", "error", "grabber"],
  styles: {
    root: { base: { width: "$inAppBanner.width" } },
    card: {
      base: { gap: "$space.sm", padding: "$space.md", radius: "$radius.card", bg: "$color.background.raised", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", shadow: "$elevation.shadow.float", font: "$font.family.sans" },
      platforms: { mobile: { base: { gap: "$space.xs", padding: "none", shadow: "$elevation.shadow.pill" } } },
    },
    // The web's text column stops short of the dismiss button.
    hit: {
      base: { gap: "$space.md", radius: "$radius.row" },
      states: { focus: { shadow: "$elevation.shadow.focus" } },
      platforms: { web: { base: { paddingRight: "$inAppBanner.dismissInset" } }, desktop: { base: { paddingRight: "$inAppBanner.dismissInset" } } },
    },
    tile: { base: { square: "$size.avatar.md", radius: "$radius.control", bg: "$color.background.brand.soft", fg: "$color.background.brand.default" } },
    tileIcon: { base: { square: "$size.icon.default" } },
    title: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    context: { base: { weight: "$font.weight.normal", fg: "$color.text.muted" }, platforms: { mobile: { base: { size: "$font.size.bodySm" } } } },
    time: { base: { size: "$font.size.caption", fg: "$color.text.faint" }, platforms: { mobile: { base: { weight: "$font.weight.normal" } } } },
    body: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.body" }, platforms: { mobile: { base: { weight: "$font.weight.normal" } } } },
    lead: { base: { fg: "$color.text.muted" }, platforms: { mobile: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal" } } } },
    more: { base: { size: "$font.size.caption", fg: "$color.text.faint" }, platforms: { mobile: { base: { weight: "$font.weight.normal" } } } },
    field: {
      on: ["web", "desktop"],
      base: { height: "$size.control.xs", paddingX: "$space.md", radius: "$radius.pill", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.muted", size: "$font.size.bodySm", fg: "$color.text.strong" },
      states: { focus: { borderColor: "$color.border.strong", shadow: "$elevation.shadow.focus" } },
    },
    error: { on: ["web", "desktop"], base: { size: "$font.size.caption", fg: "$color.text.danger" } },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberWidth", height: "$sheet.grabberHeight", radius: "$radius.pill", bg: "$color.border.muted" } },
  },
});
