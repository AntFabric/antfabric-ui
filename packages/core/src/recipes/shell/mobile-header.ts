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
    root: { base: { bg: "$color.background.app" } },
    statusBar: { base: { height: "$size.layout.statusBar" }, platforms: { android: { base: { height: "$size.layout.statusBarAndroid" } } } },
    island: { base: { top: "$osHeader.islandTop", width: "$osHeader.islandW", height: "$osHeader.islandH", radius: "$radius.pill", bg: "$os.island" } },
    punchHole: { base: { top: "$osHeader.punchTop", square: "$osHeader.punchSize", radius: "$radius.circle", bg: "$os.island" } },
    clock: { base: { fg: "$os.statusFg" } },
    sysIcon: { base: { fg: "$os.statusFg" } },
    header: { base: { minHeight: "$mobileHeader.rowMinHeight", paddingX: "$space.gutter.pane" } },
    // A centred title sits between the back button and the actions, clear of both.
    titleCentre: { base: { left: "$mobileHeader.titleInset", right: "$mobileHeader.titleInset" } },
    largeTitle: { base: { size: "$font.size.h1", line: "$mobileHeader.largeTitleLineHeight", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    me: { base: { radius: "$radius.circle", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle" }, states: { focus: { shadow: "$elevation.shadow.focus" } } },
    title: { base: { size: "$font.size.title", line: "$font.lineHeight.title", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    titleGlyph: { base: { square: "$size.icon.md", fg: "$color.text.strong" } },
    subtitle: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.medium", fg: "$color.text.faint" } },
    connection: { base: { paddingX: "$space.gutter.pane" } },
    connectionIcon: { base: { square: "$size.icon.sm", fg: "$color.text.muted" } },
    connectionText: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", weight: "$font.weight.normal", fg: "$color.text.muted" } },
  },
});
