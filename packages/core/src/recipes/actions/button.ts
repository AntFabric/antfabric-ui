import { defineRecipe } from "../../recipe";

/**
 * Button. Written from the React kit's table; the phone reads the same tokens (its ink button is pressed in `brand.active`, as the web's is).
 * The label's type is on `root`: the web draws the label as the button's own text, and the phone's reader hands it to the `Text`.
 */
export const button = defineRecipe({
  parts: ["root", "icon", "spinner", "shortcut"],
  styles: {
    root: {
      base: { radius: "$radius.pill", font: "$font.sans", weight: "$font.weightSemibold" },
      variants: {
        size: {
          sm: { height: "$control.hXs", paddingX: "$space.md", size: "$button.labelSm", gap: "$space.2xs" },
          md: { height: "$control.hMd", paddingX: "$space.lg", size: "$button.labelMd", gap: "$space.xs" },
          lg: { height: "$control.hXl", paddingX: "$space.xl", size: "$button.labelLg", gap: "$space.xs" },
        },
        variant: {
          primary: { bg: "$brand.default", fg: "$fg.onBrand", states: { hover: { bg: "$brand.hover" }, pressed: { bg: "$brand.active" } } },
          secondary: {
            bg: "$surface.card",
            fg: "$fg.strong",
            borderWidth: "$border.wHairline",
            borderColor: "$border.muted",
            states: { hover: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" } },
          },
          ghost: { bg: "transparent", fg: "$fg.body", states: { hover: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" } } },
          soft: { bg: "$brand.soft", fg: "$fg.onBrandSoft", states: { hover: { bg: "$brand.softHover" }, pressed: { bg: "$brand.softHover" } } },
          // Ink turns coral on hover and one step deeper (brand.active) while pressed, like primary (owner decision, 2026-11-03).
          ink: { bg: "$surface.inverse", fg: "$fg.onInverse", states: { hover: { bg: "$brand.default", fg: "$fg.onBrand" }, pressed: { bg: "$brand.active" } } },
          danger: { bg: "$danger.solid", fg: "$danger.fg", states: { hover: { bg: "$danger.solidHover" }, pressed: { bg: "$danger.solidHover" } } },
        },
      },
      states: { focus: { shadow: "$shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
    },
    icon: {
      variants: { size: { sm: { square: "$button.iconSm" }, md: { square: "$button.iconMd" }, lg: { square: "$button.iconLg" } } },
    },
    spinner: { base: { square: "$icon.sizeMd" } },
    shortcut: { on: ["web", "desktop"], base: { size: "$text.caption", weight: "$font.weightMedium", opacity: "$opacity.secondary" } },
  },
  // The phone grows the touch area to this (`hitSlopTo`); nothing is drawn with it.
  reads: ["$control.hit"],
});
