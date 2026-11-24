import { defineRecipe } from "../../recipe";

/**
 * Button. Written from the React kit's table; the phone reads the same tokens (its ink button is pressed in `color.background.brand.pressed`, as the web's is).
 * The label's type is on `root`: the web draws the label as the button's own text, and the phone's reader hands it to the `Text`.
 */
export const button = defineRecipe({
  parts: ["root", "icon", "spinner", "shortcut"],
  styles: {
    root: {
      base: { radius: "$radius.pill", font: "$font.family.sans", weight: "$font.weight.semibold" },
      variants: {
        size: {
          sm: { height: "$size.control.xs", paddingX: "$space.md", size: "$button.labelFontSizeSm", gap: "$space.2xs" },
          md: { height: "$size.control.md", paddingX: "$space.lg", size: "$button.labelFontSizeMd", gap: "$space.xs" },
          lg: { height: "$size.control.xl", paddingX: "$space.xl", size: "$button.labelFontSizeLg", gap: "$space.xs" },
        },
        variant: {
          primary: { bg: "$color.background.brand.default", fg: "$color.text.onBrand", states: { hover: { bg: "$color.background.brand.hover" }, pressed: { bg: "$color.background.brand.pressed" } } },
          secondary: {
            bg: "$color.background.card",
            fg: "$color.text.strong",
            borderWidth: "$border.width.hairline",
            borderColor: "$color.border.muted",
            states: { hover: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" } },
          },
          ghost: { bg: "transparent", fg: "$color.text.body", states: { hover: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" } } },
          soft: { bg: "$color.background.brand.soft", fg: "$color.text.onBrandSoft", states: { hover: { bg: "$color.background.brand.softHover" }, pressed: { bg: "$color.background.brand.softHover" } } },
          // Ink turns coral on hover and one step deeper (brand.active) while pressed, like primary (owner decision, 2026-11-03).
          ink: { bg: "$color.background.inverse", fg: "$color.text.onInverse", states: { hover: { bg: "$color.background.brand.default", fg: "$color.text.onBrand" }, pressed: { bg: "$color.background.brand.pressed" } } },
          danger: { bg: "$color.background.danger.default", fg: "$color.text.onDanger", states: { hover: { bg: "$color.background.danger.hover" }, pressed: { bg: "$color.background.danger.hover" } } },
        },
      },
      states: { focus: { shadow: "$elevation.shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
    },
    icon: {
      variants: { size: { sm: { square: "$button.iconSizeSm" }, md: { square: "$button.iconSizeMd" }, lg: { square: "$button.iconSizeLg" } } },
    },
    spinner: { base: { square: "$size.icon.md" } },
    shortcut: { on: ["web", "desktop"], base: { size: "$font.size.caption", weight: "$font.weight.medium", opacity: "$opacity.secondary" } },
  },
  // The phone grows the touch area to this (`hitSlopTo`); nothing is drawn with it.
  reads: ["$size.target.min"],
});
