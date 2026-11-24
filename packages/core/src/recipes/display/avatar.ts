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
      base: { radius: "$radius.circle", font: "$font.family.sans", weight: "$font.weight.semibold" },
      variants: {
        size: {
          xs: { square: "$size.avatar.xs" },
          sm: { square: "$size.avatar.sm" },
          md: { square: "$size.avatar.md", size: "$font.size.caption" },
          lg: { square: "$size.avatar.lg", size: "$font.size.bodySm" },
          xl: { square: "$size.avatar.xl", size: "$font.size.h3" },
        },
        shape: { square: { radius: "$radius.control" } },
        identity: {
          ink: { bg: "$color.background.identity.ink" },
          indigo: { bg: "$color.background.identity.indigo" },
          green: { bg: "$color.background.identity.green" },
          ochre: { bg: "$color.background.identity.ochre" },
          red: { bg: "$color.background.identity.red" },
          agent: { bg: "$color.background.identity.agent" },
        },
      },
    },
    presence: {
      base: { radius: "$radius.circle", borderWidth: "$border.width.thick", borderColor: "$color.background.card" },
      variants: {
        presence: {
          active: { bg: "$color.background.presence.active" },
          away: { bg: "$color.background.presence.away" },
          dnd: { bg: "$color.background.presence.dnd" },
          offline: { bg: "$color.background.card", borderColor: "$color.background.presence.offline" },
        },
      },
    },
    agent: { base: { radius: "$radius.circle", bg: "$color.background.card", fg: "$color.background.brand.default", shadow: "$elevation.shadow.hairline" } },
  },
});
