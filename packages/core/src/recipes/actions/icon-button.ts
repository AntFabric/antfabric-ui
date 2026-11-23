import { defineRecipe, type TokenStyle } from "../../recipe";

/** Hover and pressed for every variant but solid: the grey wash, then the deeper grey. */
const hover: TokenStyle = { bg: "$hover.surface", fg: "$fg.strong" };
const pressed: TokenStyle = { bg: "$surface.selected" };

/**
 * IconButton. Written from the React kit's table. `active` is the toggled-on look (soft coral). The kits agree on every colour at rest.
 * The phone has no hover and, for an icon button, no pressed fill either (a press only scales it), so its layers put each variant's resting fill
 * back over the pressed one, and keep the danger glyph while pressed. // idiom: press feedback is a scale, not a fill (the medium has no hover to borrow one from). (Danger is for ghost, soft and outline: a solid danger button is not a documented look.)
 * `$control.hit` is the phone's 44pt target, which its `hitSlop` reaches; the badge's corner offset is layout, read by the kit.
 */
export const iconButton = defineRecipe({
  parts: ["root", "icon", "avatar"],
  styles: {
    root: {
      base: { fg: "$fg.muted", radius: "$radius.circle" },
      variants: {
        variant: {
          ghost: { states: { hover, pressed } },
          soft: { bg: "$surface.muted", fg: "$fg.body", states: { hover, pressed } },
          // Pressed deepens the coral, as Button's primary does; the grey wash would leave the brand's ink on grey.
          solid: { bg: "$brand.default", fg: "$fg.onBrand", states: { hover: { bg: "$brand.hover", fg: "$fg.onBrand" }, pressed: { bg: "$brand.active" } } },
          outline: { borderWidth: "$border.wHairline", borderColor: "$border.muted", bg: "$surface.card", states: { hover, pressed } },
        },
        shape: { circle: {}, square: { radius: "$radius.control" } },
        size: { sm: { square: "$control.hIconSm" }, md: { square: "$control.hIcon" } },
        active: {
          true: { bg: "$brand.soft", fg: "$brand.default", states: { hover: { bg: "$brand.softHover", fg: "$brand.default" }, pressed: { bg: "$surface.selected" } } },
          false: {},
        },
        tone: {
          neutral: {},
          danger: { states: { hover: { fg: "$danger.default", bg: "$danger.soft" }, pressed: { fg: "$danger.default", bg: "$surface.selected" } } },
        },
      },
      states: { focus: { shadow: "$shadow.focus" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        mobile: {
          variants: {
            variant: {
              ghost: { bg: "transparent", states: { pressed: { bg: "transparent" } } },
              soft: { states: { pressed: { bg: "$surface.muted" } } },
              solid: { states: { pressed: { bg: "$brand.default" } } },
              outline: { states: { pressed: { bg: "$surface.card" } } },
            },
            // The ghost's resting fill is drawn on the phone (transparent), so the toggled-on fill is laid over it again.
            active: { true: { bg: "$brand.soft", fg: "$brand.default", states: { pressed: { bg: "$brand.soft" } } } },
            tone: { danger: { states: { pressed: { fg: "$danger.default" } } } },
          },
        },
      },
    },
    icon: { variants: { size: { sm: { square: "$icon.sizeMd" }, md: { square: "$icon.size" } } } },
    // A face in place of the icon (`avatar`): it fills the button and takes the button's corners.
    avatar: { base: { radius: "$radius.circle" }, variants: { shape: { circle: {}, square: { radius: "$radius.control" } } } },
  },
  reads: ["$control.hit", "$iconButton.badgeTop", "$iconButton.badgeRight"],
});
