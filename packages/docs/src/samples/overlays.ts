/** The app's quick reactions, in order: ContextMenu's `quickReactions`, which also double as "frequently used" at the top of the phone's emoji panel. None is yours yet (`picked` is empty). */
export const QUICK_REACTIONS: string[] = ["👍", "❤️", "😂", "🎉", "👀", "✅"];

/** What AntFabric's ContextMenu says about itself: the reactions, the rows' name and (phone) the sheet's title. A screen spreads it. */
export const CONTEXT_MENU_SAMPLE = { quickReactions: QUICK_REACTIONS, label: "Message actions", title: "Message" };

/** CommandPalette's filters under the field: AntFabric's kinds of result. `All` is the resting state. */
export const COMMAND_PALETTE_FILTERS = ["All", "People", "Channels", "Projects", "Meetings"];
