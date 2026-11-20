import { defineRecipe } from "../../recipe";

/**
 * MobileHeader (phone only). The OS status bar the header sits under (`statusBar`, with the iPhone's `island` or Android's `punchHole`),
 * then the header row: a large title with a bell and your photo (main), or a back button, a title and up to two actions (pushed),
 * then a one-line connection status. The status bar's colours and sizes are the OS's: `os.*` tokens, with Android's height under `platforms.android`.
 * The island's and punch hole's offsets and the inset of a centred title are the recipe's; the kit works the centring margin out
 * from the island's and the punch hole's size.
 */
export const mobileHeader = defineRecipe({
  parts: ["root", "statusBar", "island", "punchHole", "clock", "sysIcon", "header", "titleCentre", "largeTitle", "me", "title", "titleGlyph", "subtitle", "connection", "connectionIcon", "connectionText"],
  styles: {
    root: { base: { bg: "$surface.app" } },
    statusBar: { base: { height: "$statusbar.h" }, platforms: { android: { base: { height: "$statusbar.hAndroid" } } } },
    island: { base: { top: "$osHeader.islandTop", width: "$osHeader.islandW", height: "$osHeader.islandH", radius: "$radius.pill", bg: "$os.island" } },
    punchHole: { base: { top: "$osHeader.punchTop", square: "$osHeader.punchSize", radius: "$radius.circle", bg: "$os.island" } },
    clock: { base: { fg: "$os.statusFg" } },
    sysIcon: { base: { fg: "$os.statusFg" } },
    header: { base: { minHeight: "$mobileHeader.rowMinH", paddingX: "$gutter.pane" } },
    // A centred title sits between the back button and the actions, clear of both.
    titleCentre: { base: { left: "$mobileHeader.titleInset", right: "$mobileHeader.titleInset" } },
    largeTitle: { base: { size: "$text.h1", line: "$mobileHeader.largeTitleLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    me: { base: { radius: "$radius.circle", borderWidth: "$border.wHairline", borderColor: "$border.subtle" }, states: { focus: { shadow: "$shadow.focus" } } },
    title: { base: { size: "$text.title", line: "$text.titleLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    titleGlyph: { base: { square: "$icon.sizeMd", fg: "$fg.strong" } },
    subtitle: { base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightMedium", fg: "$fg.faint" } },
    connection: { base: { paddingX: "$gutter.pane" } },
    connectionIcon: { base: { square: "$icon.sizeSm", fg: "$fg.muted" } },
    connectionText: { base: { size: "$text.caption", line: "$text.captionLine", weight: "$font.weightNormal", fg: "$fg.muted" } },
  },
});
