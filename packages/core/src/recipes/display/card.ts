import { defineRecipe } from "../../recipe";

/**
 * Card. The phone differs where its own idiom does: one radius (`level` is kept only for the shared API), flat (no shadow, the hairline
 * border separates), a 12pt inset, and a leading `accent` rail that only it draws. The phone's placeholder text carries its own ink and
 * weight because a `Text` inherits nothing; the web's inherits both from `root`.
 */
export const card = defineRecipe({
  parts: ["root", "placeholder", "accent"],
  styles: {
    root: {
      base: {
        gap: "$space.sm",
        bg: "$color.background.card",
        fg: "$color.text.body",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        font: "$font.family.sans",
      },
      variants: {
        level: { pane: { radius: "$radius.panel" }, rail: { radius: "$radius.rail" }, inner: { radius: "$radius.card" } },
        elevate: {
          none: { shadow: "$elevation.shadow.none" },
          hairline: { shadow: "$elevation.shadow.hairline" },
          card: { shadow: "$elevation.shadow.card" },
          raise: { shadow: "$elevation.shadow.raise" },
          float: { shadow: "$elevation.shadow.float" },
        },
        // Hover fills an interactive card; the kit turns `hover` on only for one. A brand card hovers to its own deeper tint.
        tint: {
          default: { states: { hover: { bg: "$color.background.hover" } } },
          brand: { bg: "$color.background.brand.soft", borderColor: "$color.background.brand.softHover", fg: "$color.text.onBrandSoft", states: { hover: { bg: "$color.background.brand.softHover" } } },
          recessed: { bg: "$color.background.recessed", states: { hover: { bg: "$color.background.hover" } } },
        },
        pad: { default: { padding: "$space.lg" } },
      },
      // The focus ring replaces the elevation shadow; the border and the shadow otherwise hold still.
      states: { focus: { shadow: "$elevation.shadow.focus" } },
      // The phone's 12pt inset is `space.md` and stays in the kit's StyleSheet: React Native Web writes a StyleSheet's `padding` as a shorthand and an
      // inline one as four longhands, which the render snapshot does not equate. Move it here (`padding: "$space.md"`) when it does.
      // idiom (kept, listed for the owner): the phone's card is one radius, flat and inset 12pt, and the elevation and `level` props do not apply.
      platforms: { mobile: { base: { radius: "$radius.panel", shadow: "none", padding: "none" } } },
    },
    placeholder: {
      base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm" },
      platforms: { mobile: { base: { fg: "$color.text.body", weight: "$font.weight.normal" }, variants: { tint: { brand: { fg: "$color.text.onBrandSoft" } } } } },
    },
    accent: {
      on: ["mobile"],
      variants: {
        accent: {
          brand: { bg: "$color.background.brand.default" },
          success: { bg: "$color.text.success" },
          warning: { bg: "$color.text.warning" },
          danger: { bg: "$color.text.danger" },
          info: { bg: "$color.text.info" },
        },
      },
    },
  },
});
