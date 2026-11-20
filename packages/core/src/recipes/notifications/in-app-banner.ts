import { defineRecipe } from "../../recipe";

/**
 * InAppBanner. Written from the React kit's table. Text parts carry their own type on both kits (the web draws spans, the phone
 * `Text`, and a phone `Text` needs a weight to name a font file). The phone's card is Liquid Glass where the system has it, with its own
 * shadow (`shadow.pill`, a deliberate platform idiom), its paddings are the kit's (a tighter bottom, where the web pads evenly),
 * and it has no inline reply: it has a grabber instead. The web's hit area keeps clear of the dismiss button with a right padding.
 */
export const inAppBanner = defineRecipe({
  parts: ["root", "card", "hit", "tile", "tileIcon", "title", "context", "time", "body", "lead", "more", "field", "error", "grabber"],
  styles: {
    root: { base: { width: "$inAppBanner.w" } },
    card: {
      base: { gap: "$space.sm", padding: "$space.md", radius: "$radius.card", bg: "$surface.raised", borderWidth: "$border.wHairline", borderColor: "$border.subtle", shadow: "$shadow.float", font: "$font.sans" },
      platforms: { mobile: { base: { gap: "$space.xs", padding: "none", shadow: "$shadow.pill" } } },
    },
    // The web's text column stops short of the dismiss button.
    hit: {
      base: { gap: "$space.md", radius: "$radius.row" },
      states: { focus: { shadow: "$shadow.focus" } },
      platforms: { web: { base: { paddingRight: "$inAppBanner.dismissInset" } }, desktop: { base: { paddingRight: "$inAppBanner.dismissInset" } } },
    },
    tile: { base: { square: "$avatar.md", radius: "$radius.control", bg: "$brand.soft", fg: "$brand.default" } },
    tileIcon: { base: { square: "$icon.size" } },
    title: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    context: { base: { weight: "$font.weightNormal", fg: "$fg.muted" }, platforms: { mobile: { base: { size: "$text.bodySm" } } } },
    time: { base: { size: "$text.caption", fg: "$fg.faint" }, platforms: { mobile: { base: { weight: "$font.weightNormal" } } } },
    body: { base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.body" }, platforms: { mobile: { base: { weight: "$font.weightNormal" } } } },
    lead: { base: { fg: "$fg.muted" }, platforms: { mobile: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal" } } } },
    more: { base: { size: "$text.caption", fg: "$fg.faint" }, platforms: { mobile: { base: { weight: "$font.weightNormal" } } } },
    field: {
      on: ["web", "desktop"],
      base: { height: "$control.hXs", paddingX: "$space.md", radius: "$radius.pill", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.muted", size: "$text.bodySm", fg: "$fg.strong" },
      states: { focus: { borderColor: "$border.strong", shadow: "$shadow.focus" } },
    },
    error: { on: ["web", "desktop"], base: { size: "$text.caption", fg: "$danger.default" } },
    grabber: { on: ["mobile"], base: { width: "$sheet.grabberW", height: "$sheet.grabberH", radius: "$radius.pill", bg: "$border.muted" } },
  },
});
