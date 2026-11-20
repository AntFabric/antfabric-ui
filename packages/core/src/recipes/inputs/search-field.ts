import { defineRecipe } from "../../recipe";

/**
 * SearchField. Written from the React kit's table. `on` is "the edge is marked": `accent` while the field holds text. `focus` is real focus or the
 * `focused` prop. The web's focus is a 2px edge made of the 1px border and a 1px outline drawn inside it (the outline's `-2` offset is the kit's: no token
 * names it), over the hairline shadow the field keeps so it never lifts; the phone makes the same 2px edge with an inner ring, and draws no shadow.
 * `clear` is the ✕ that empties the field (an IconButton drawn as this part: its look is the IconButton's; `styles.clear` is laid over it).
 * The web's `launcher` look is a field that is a button: its label (`launcherLabel`) and the transparent button laid over the box (`launcher`).
 * The phone's larger gap and text are a deliberate platform idiom (owner decision, 2026-11-03), kept in `platforms.mobile`.
 * The hairline shadow and the glass's ink are the web's on the phone (item 43). Kept, borderline (listed for the owner): the box's radius
 * (web `radius.control`, phone `radius.input`, which goes with its taller box).
 */
export const searchField = defineRecipe({
  parts: ["root", "icon", "spinner", "input", "clear", "launcherLabel", "launcher"],
  styles: {
    root: {
      base: {
        gap: "$space.sm",
        height: "$control.hLg",
        paddingLeft: "$space.md",
        paddingRight: "$space.sm",
        radius: "$radius.control",
        bg: "$hover.surface",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        shadow: "$shadow.hairline",
        font: "$font.sans",
      },
      // Hover moves the fill only, and the kit never turns it on for a focused or disabled field.
      states: { on: { borderColor: "$border.active" }, hover: { bg: "$surface.raised" }, focus: { borderColor: "$border.active" }, disabled: { opacity: "$opacity.disabled" } },
      platforms: {
        web: { states: { focus: { outlineWidth: "$border.wHairline", outlineColor: "$border.active" } } },
        desktop: { states: { focus: { outlineWidth: "$border.wHairline", outlineColor: "$border.active" } } },
        mobile: {
          // idiom: the 44pt touch height (a minimum too), a one-step-larger gap, and a tighter right edge for the clear button's own touch target.
          base: { gap: "$space.md", height: "$control.hMd", minHeight: "$control.hMd", paddingRight: "$space.2xs", radius: "$radius.input" },
          states: { focus: { ring: "$border.active" } },
        },
      },
    },
    icon: { base: { square: "$icon.size", fg: "$fg.subtle" } },
    spinner: { base: { square: "$icon.size", fg: "$brand.default" } },
    input: {
      base: { size: "$text.bodySm", weight: "$font.weightMedium", fg: "$fg.body" },
      platforms: { mobile: { base: { size: "$text.body", placeholder: "$fg.placeholder" } } }, // idiom: one step larger
    },
    launcherLabel: { on: ["web", "desktop"], base: { size: "$text.bodySm", weight: "$font.weightMedium", fg: "$fg.faint" } },
    launcher: { on: ["web", "desktop"], base: { inset: "$space.none" } },
  },
});
