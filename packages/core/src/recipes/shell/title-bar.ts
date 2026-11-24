import { defineRecipe, type PartRecipe } from "../../recipe";

/**
 * TitleBar (desktop only; the web has the WebTopBar). The window's own bar: the app's history and search drawn over what the OS draws.
 * macOS paints three traffic lights (`lightClose`, `lightMin`, `lightMax`, grey while the window is not focused); Windows and Linux
 * draw caption buttons (`caption`, `captionClose`), which are the OS's own look and so live under `platforms.windows` and `platforms.linux`:
 * Windows 11's 46px-wide buttons with a red Close, GNOME's small round buttons on a grey disc.
 * Read by the kit, because the vocabulary has no key for them: a glyph's stroke weight, the traffic lights' hairline edge, and the glass
 * capsule's pill radius (macOS 26 draws the field and the history group as capsules, a state the recipe does not know).
 */
const caption = (closeHover: boolean): PartRecipe => ({
  platforms: {
    windows: {
      base: { width: "$osWindow.winCaptionW", fg: "$color.text.body" },
      states: closeHover
        ? { hover: { bg: "$os.winClose", fg: "$os.onFill" }, pressed: { bg: "$os.winClosePressed", fg: "$os.onFill" }, focus: { shadow: "$elevation.shadow.focus" } }
        : { hover: { bg: "$color.background.hover" }, pressed: { bg: "$color.background.selected" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    linux: {
      base: { square: "$osWindow.linuxCaption", radius: "$radius.circle", bg: "$color.background.muted", fg: "$color.text.strong" },
      states: { hover: { bg: "$color.border.muted" }, pressed: { bg: "$color.border.default" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
  },
});

const light = (color: "$os.macClose" | "$os.macMin" | "$os.macMax"): PartRecipe => ({
  base: { square: "$osWindow.macLight", radius: "$radius.circle", bg: color },
  // macOS greys the lights while another app's window is in front.
  variants: { focused: { false: { bg: "$color.border.muted" } } },
});

export const titleBar = defineRecipe({
  parts: ["root", "searchSlot", "lights", "lightClose", "lightMin", "lightMax", "search", "searchIcon", "trailing", "captions", "caption", "captionClose", "captionIcon"],
  styles: {
    root: { base: { height: "$size.layout.topBar", bg: "$color.background.chrome", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle", font: "$font.family.sans", fg: "$color.text.body" } },
    searchSlot: { on: ["desktop"], base: { minWidth: "$size.layout.topBarSearchMin" } },
    lights: { on: ["desktop"], base: { width: "$osWindow.macLightsW" } },
    lightClose: { on: ["desktop"], ...light("$os.macClose") },
    lightMin: { on: ["desktop"], ...light("$os.macMin") },
    lightMax: { on: ["desktop"], ...light("$os.macMax") },
    search: {
      base: {
        height: "$size.control.xs",
        maxWidth: "$size.layout.topBarSearchMax",
        radius: "$radius.control",
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        shadow: "$elevation.shadow.hairline",
        fg: "$color.text.faint",
        size: "$font.size.bodySm",
      },
      states: { hover: { borderColor: "$color.border.muted", bg: "$color.background.recessed" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    searchIcon: { base: { square: "$size.icon.md", fg: "$color.text.subtle" } },
    trailing: { base: { size: "$font.size.caption" } },
    captions: { variants: { focused: { false: { opacity: "$opacity.disabled" } } } },
    caption: { on: ["desktop"], ...caption(false) },
    captionClose: { on: ["desktop"], ...caption(true) },
    captionIcon: { platforms: { windows: { base: { square: "$size.icon.md" } }, linux: { base: { square: "$size.icon.sm" } } } },
  },
  reads: ["$radius.pill", "$size.stroke.thin", "$size.stroke.bold", "$os.macLightEdge"],
});
