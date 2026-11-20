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
        bg: "$surface.card",
        fg: "$fg.body",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        font: "$font.sans",
      },
      variants: {
        level: { pane: { radius: "$radius.panel" }, rail: { radius: "$radius.rail" }, inner: { radius: "$radius.card" } },
        elevate: {
          none: { shadow: "$shadow.none" },
          hairline: { shadow: "$shadow.hairline" },
          card: { shadow: "$shadow.card" },
          raise: { shadow: "$shadow.raise" },
          float: { shadow: "$shadow.float" },
        },
        // Hover fills an interactive card; the kit turns `hover` on only for one. A brand card hovers to its own deeper tint.
        tint: {
          default: { states: { hover: { bg: "$hover.surface" } } },
          brand: { bg: "$brand.soft", borderColor: "$brand.softHover", fg: "$fg.onBrandSoft", states: { hover: { bg: "$brand.softHover" } } },
          recessed: { bg: "$surface.recessed", states: { hover: { bg: "$hover.surface" } } },
        },
        pad: { default: { padding: "$space.lg" } },
      },
      // The focus ring replaces the elevation shadow; the border and the shadow otherwise hold still.
      states: { focus: { shadow: "$shadow.focus" } },
      // The phone's 12pt inset is `space.md` and stays in the kit's StyleSheet: React Native Web writes a StyleSheet's `padding` as a shorthand and an
      // inline one as four longhands, which the render snapshot does not equate. Move it here (`padding: "$space.md"`) when it does.
      // idiom (kept, listed for the owner): the phone's card is one radius, flat and inset 12pt, and the elevation and `level` props do not apply.
      platforms: { mobile: { base: { radius: "$radius.panel", shadow: "none", padding: "none" } } },
    },
    placeholder: {
      base: { size: "$text.bodySm", line: "$text.bodySmLine" },
      platforms: { mobile: { base: { fg: "$fg.body", weight: "$font.weightNormal" }, variants: { tint: { brand: { fg: "$fg.onBrandSoft" } } } } },
    },
    accent: {
      on: ["mobile"],
      variants: {
        accent: {
          brand: { bg: "$brand.default" },
          success: { bg: "$success.default" },
          warning: { bg: "$warning.default" },
          danger: { bg: "$danger.default" },
          info: { bg: "$info.default" },
        },
      },
    },
  },
});
