import { defineRecipe, type TokenStyle } from "../../recipe";

/** Hover and pressed for every variant but solid: the grey wash, then the deeper grey. */
const hover: TokenStyle = { bg: "$color.background.hover", fg: "$color.text.strong" };
const pressed: TokenStyle = { bg: "$color.background.selected" };

/**
 * IconButton. Written from the React kit's table. `active` is the toggled-on look (soft coral). The kits agree on every colour at rest.
 * The phone has no hover and, for an icon button, no pressed fill either (a press only scales it), so its layers put each variant's resting fill
 * back over the pressed one, and keep the danger glyph while pressed. // idiom: press feedback is a scale, not a fill (the medium has no hover to borrow one from). (Danger is for ghost, soft and outline: a solid danger button is not a documented look.)
 * `$size.target.min` is the phone's 44pt target, which its `hitSlop` reaches; the badge's corner offset is layout, read by the kit.
 */
export const iconButton = defineRecipe({
  parts: ["root", "icon", "avatar"],
  styles: {
    root: {
      base: { fg: "$color.text.muted", radius: "$radius.circle" },
      variants: {
        variant: {
          ghost: { states: { hover, pressed } },
          soft: { bg: "$color.background.muted", fg: "$color.text.body", states: { hover, pressed } },
          // Pressed deepens the coral, as Button's primary does; the grey wash would leave the brand's ink on grey.
          solid: { bg: "$color.background.brand.default", fg: "$color.text.onBrand", states: { hover: { bg: "$color.background.brand.hover", fg: "$color.text.onBrand" }, pressed: { bg: "$color.background.brand.pressed" } } },
          outline: { borderWidth: "$border.width.hairline", borderColor: "$color.border.muted", bg: "$color.background.card", states: { hover, pressed } },
        },
        shape: { circle: {}, square: { radius: "$radius.control" } },
        size: { sm: { square: "$size.control.iconSm" }, md: { square: "$size.control.icon" } },
        active: {
          true: { bg: "$color.background.brand.soft", fg: "$color.background.brand.default", states: { hover: { bg: "$color.background.brand.softHover", fg: "$color.background.brand.default" }, pressed: { bg: "$color.background.selected" } } },
          false: {},
        },
        tone: {
          neutral: {},
          danger: { states: { hover: { fg: "$color.text.danger", bg: "$color.background.danger.soft" }, pressed: { fg: "$color.text.danger", bg: "$color.background.selected" } } },
        },
      },
      states: { focus: { shadow: "$elevation.shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        mobile: {
          variants: {
            variant: {
              ghost: { bg: "transparent", states: { pressed: { bg: "transparent" } } },
              soft: { states: { pressed: { bg: "$color.background.muted" } } },
              solid: { states: { pressed: { bg: "$color.background.brand.default" } } },
              outline: { states: { pressed: { bg: "$color.background.card" } } },
            },
            // The ghost's resting fill is drawn on the phone (transparent), so the toggled-on fill is laid over it again.
            active: { true: { bg: "$color.background.brand.soft", fg: "$color.background.brand.default", states: { pressed: { bg: "$color.background.brand.soft" } } } },
            tone: { danger: { states: { pressed: { fg: "$color.text.danger" } } } },
          },
        },
      },
    },
    icon: { variants: { size: { sm: { square: "$size.icon.md" }, md: { square: "$size.icon.default" } } } },
    // A face in place of the icon (`avatar`): it fills the button and takes the button's corners.
    avatar: { base: { radius: "$radius.circle" }, variants: { shape: { circle: {}, square: { radius: "$radius.control" } } } },
  },
  reads: ["$size.target.min", "$iconButton.badgeOffsetY", "$iconButton.badgeOffsetX"],
});
