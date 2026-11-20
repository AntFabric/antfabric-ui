import { defineRecipe } from "../../recipe";

/**
 * Avatar. The same on both kits. The initials' type is on `root` (the web draws them as the disc's own text; the phone's reader
 * hands it to the `Text`); the two smallest sizes' 9 and 10 point type is a literal in the kit, so `xs` and `sm` set none here.
 * The white of the initials is not a token (it is the one ink every identity colour is tested against), so it stays in the kit.
 */
export const avatar = defineRecipe({
  parts: ["root", "initials", "photo", "presence", "agent"],
  styles: {
    root: {
      base: { radius: "$radius.circle", font: "$font.sans", weight: "$font.weightSemibold" },
      variants: {
        size: {
          xs: { square: "$avatar.xs" },
          sm: { square: "$avatar.sm" },
          md: { square: "$avatar.md", size: "$text.caption" },
          lg: { square: "$avatar.lg", size: "$text.bodySm" },
          xl: { square: "$avatar.xl", size: "$text.h3" },
        },
        shape: { square: { radius: "$radius.control" } },
        identity: {
          ink: { bg: "$identity.ink" },
          indigo: { bg: "$identity.indigo" },
          green: { bg: "$identity.green" },
          ochre: { bg: "$identity.ochre" },
          red: { bg: "$identity.red" },
          agent: { bg: "$identity.agent" },
        },
      },
    },
    presence: {
      base: { radius: "$radius.circle", borderWidth: "$border.wThick", borderColor: "$surface.card" },
      variants: {
        presence: {
          active: { bg: "$presence.active" },
          away: { bg: "$presence.away" },
          dnd: { bg: "$presence.dnd" },
          offline: { bg: "$surface.card", borderColor: "$presence.offline" },
        },
      },
    },
    agent: { base: { radius: "$radius.circle", bg: "$surface.card", fg: "$brand.default", shadow: "$shadow.hairline" } },
  },
});
