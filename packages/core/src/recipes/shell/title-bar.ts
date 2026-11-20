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
      base: { width: "$osWindow.winCaptionW", fg: "$fg.body" },
      states: closeHover
        ? { hover: { bg: "$os.winClose", fg: "$fg.onBrand" }, pressed: { bg: "$os.winClosePressed", fg: "$fg.onBrand" }, focus: { shadow: "$shadow.focus" } }
        : { hover: { bg: "$hover.surface" }, pressed: { bg: "$surface.selected" }, focus: { shadow: "$shadow.focus" } },
    },
    linux: {
      base: { square: "$osWindow.linuxCaption", radius: "$radius.circle", bg: "$surface.muted", fg: "$fg.strong" },
      states: { hover: { bg: "$border.muted" }, pressed: { bg: "$border.default" }, focus: { shadow: "$shadow.focus" } },
    },
  },
});

const light = (color: "$os.macClose" | "$os.macMin" | "$os.macMax"): PartRecipe => ({
  base: { square: "$osWindow.macLight", radius: "$radius.circle", bg: color },
  // macOS greys the lights while another app's window is in front.
  variants: { focused: { false: { bg: "$border.muted" } } },
});

export const titleBar = defineRecipe({
  parts: ["root", "searchSlot", "lights", "lightClose", "lightMin", "lightMax", "search", "searchIcon", "trailing", "captions", "caption", "captionClose", "captionIcon"],
  styles: {
    root: { base: { height: "$topbar.h", bg: "$surface.chrome", borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle", font: "$font.sans", fg: "$fg.body" } },
    searchSlot: { on: ["desktop"], base: { minWidth: "$topbar.searchMinW" } },
    lights: { on: ["desktop"], base: { width: "$osWindow.macLightsW" } },
    lightClose: { on: ["desktop"], ...light("$os.macClose") },
    lightMin: { on: ["desktop"], ...light("$os.macMin") },
    lightMax: { on: ["desktop"], ...light("$os.macMax") },
    search: {
      base: {
        height: "$control.hXs",
        maxWidth: "$topbar.searchMaxW",
        radius: "$radius.control",
        bg: "$surface.card",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        shadow: "$shadow.hairline",
        fg: "$fg.faint",
        size: "$text.bodySm",
      },
      states: { hover: { borderColor: "$border.muted", bg: "$surface.recessed" }, focus: { shadow: "$shadow.focus" } },
    },
    searchIcon: { base: { square: "$icon.sizeMd", fg: "$fg.subtle" } },
    trailing: { base: { size: "$text.caption" } },
    captions: { variants: { focused: { false: { opacity: "$opacity.disabled" } } } },
    caption: { on: ["desktop"], ...caption(false) },
    captionClose: { on: ["desktop"], ...caption(true) },
    captionIcon: { platforms: { windows: { base: { square: "$icon.sizeMd" } }, linux: { base: { square: "$icon.sizeSm" } } } },
  },
  reads: ["$radius.pill", "$icon.strokeThin", "$icon.strokeBold", "$os.macLightEdge"],
});
