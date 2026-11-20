import { defineRecipe } from "../../recipe";

/**
 * ConnectionBanner. Two surfaces share the `pill` (and its `dot` and label). Beyond it the web draws the desktop's amber `strip`
 * (with a `retry`) and a `degraded` note, and the phone draws its own `card`, one for every state, with a title and a message; so those
 * are one platform's each. The pill's insets are the phone's own entry (the web's are the kit's, below).
 *
 * Where a padding has two axes the web kit keeps the ones that are `space` reads (the reader would write both as one `padding`, and the render
 * snapshot would count that as a change from the two longhands the web wrote); the strip's block padding is a component token, so it is the recipe's.
 * The strip's bottom edge is one edge only (`borderBottomWidth` and `borderBottomColor`).
 */
export const connectionBanner = defineRecipe({
  parts: ["root", "strip", "retry", "degraded", "degradedText", "card", "cardIcon", "cardTitle", "cardMessage", "pill", "dot", "pillText"],
  styles: {
    root: { base: { font: "$font.sans" } },
    strip: {
      on: ["web", "desktop"],
      base: {
        gap: "$space.sm",
        paddingY: "$connectionBanner.padY",
        bg: "$warning.soft",
        fg: "$warning.default",
        size: "$text.caption",
        weight: "$font.weightMedium",
        borderBottomWidth: "$border.wHairline",
        borderBottomColor: "$banner.warningBorder",
      },
      variants: { state: { syncing: { bg: "$surface.recessed", fg: "$fg.muted" } } },
    },
    retry: {
      on: ["web", "desktop"],
      base: { height: "$connectionBanner.actionH", paddingX: "$space.sm", radius: "$radius.pill", weight: "$font.weightSemibold", fg: "$warning.default" },
      states: { focus: { shadow: "$shadow.focus" } },
    },
    degraded: { on: ["web", "desktop"], base: { radius: "$radius.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", bg: "$surface.recessed" } },
    degradedText: { on: ["web", "desktop"], base: { size: "$text.caption", fg: "$fg.muted" } },
    card: {
      on: ["mobile"],
      base: { gap: "$space.sm", paddingX: "$space.md", paddingY: "$space.sm", radius: "$radius.card", bg: "$surface.recessed", fg: "$fg.muted" },
      variants: { state: { "back-online": { bg: "$success.soft", fg: "$success.default" }, syncing: { bg: "$info.soft", fg: "$info.default" } } },
    },
    cardIcon: { on: ["mobile"], base: { square: "$icon.size" } },
    cardTitle: { on: ["mobile"], base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold" } },
    cardMessage: { on: ["mobile"], base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    pill: {
      base: { gap: "$space.sm", radius: "$radius.pill", bg: "$success.soft", fg: "$success.default" },
      variants: { state: { offline: { bg: "$surface.muted", fg: "$fg.muted" }, reconnecting: { bg: "$surface.muted", fg: "$fg.muted" } } },
      platforms: { mobile: { base: { paddingX: "$space.md", paddingY: "$space.sm" } } },
    },
    dot: {
      base: { square: "$dot.size", radius: "$radius.circle", bg: "$presence.active" },
      variants: { state: { offline: { bg: "$presence.offline" }, reconnecting: { bg: "$presence.away" } } },
    },
    pillText: { base: { size: "$text.bodySm", weight: "$font.weightSemibold" } },
  },
});
