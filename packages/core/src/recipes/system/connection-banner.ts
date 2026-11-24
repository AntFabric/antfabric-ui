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
    root: { base: { font: "$font.family.sans" } },
    strip: {
      on: ["web", "desktop"],
      base: {
        gap: "$space.sm",
        paddingY: "$connectionBanner.paddingY",
        bg: "$color.background.warning.soft",
        fg: "$color.text.warning",
        size: "$font.size.caption",
        weight: "$font.weight.medium",
        borderBottomWidth: "$border.width.hairline",
        borderBottomColor: "$color.border.warning",
      },
      variants: { state: { syncing: { bg: "$color.background.recessed", fg: "$color.text.muted" } } },
    },
    retry: {
      on: ["web", "desktop"],
      base: { height: "$connectionBanner.actionHeight", paddingX: "$space.sm", radius: "$radius.pill", weight: "$font.weight.semibold", fg: "$color.text.warning" },
      states: { focus: { shadow: "$elevation.shadow.focus" } },
    },
    degraded: { on: ["web", "desktop"], base: { radius: "$radius.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", bg: "$color.background.recessed" } },
    degradedText: { on: ["web", "desktop"], base: { size: "$font.size.caption", fg: "$color.text.muted" } },
    card: {
      on: ["mobile"],
      base: { gap: "$space.sm", paddingX: "$space.md", paddingY: "$space.sm", radius: "$radius.card", bg: "$color.background.recessed", fg: "$color.text.muted" },
      variants: { state: { "back-online": { bg: "$color.background.success.soft", fg: "$color.text.success" }, syncing: { bg: "$color.background.info.soft", fg: "$color.text.info" } } },
    },
    cardIcon: { on: ["mobile"], base: { square: "$size.icon.default" } },
    cardTitle: { on: ["mobile"], base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold" } },
    cardMessage: { on: ["mobile"], base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    pill: {
      base: { gap: "$space.sm", radius: "$radius.pill", bg: "$color.background.success.soft", fg: "$color.text.success" },
      variants: { state: { offline: { bg: "$color.background.muted", fg: "$color.text.muted" }, reconnecting: { bg: "$color.background.muted", fg: "$color.text.muted" } } },
      platforms: { mobile: { base: { paddingX: "$space.md", paddingY: "$space.sm" } } },
    },
    dot: {
      base: { square: "$size.dot.default", radius: "$radius.circle", bg: "$color.background.presence.active" },
      variants: { state: { offline: { bg: "$color.background.presence.offline" }, reconnecting: { bg: "$color.background.presence.away" } } },
    },
    pillText: { base: { size: "$font.size.bodySm", weight: "$font.weight.semibold" } },
  },
});
