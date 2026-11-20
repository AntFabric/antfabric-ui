/**
 * Sample data for the messaging components (Message, MessageActions, Composer, SwipeRow): `messageBar`, `composerTools` and the SwipeRow buttons
 * their docs' `sample`s and the screens share. AntFabric's copy for them is in `antfabricStrings` (`@antfabric-ui/core/antfabric`).
 */

/**
 * Composer's tools in the catalogue: the formatting toolbar (the phone's Formatting button), Attach, Emoji, Mention and commands, and on the
 * phone the mic. The docs' `sample`s draw the same; a screen spreads this onto its Composer, as a product passes the tools it wires up.
 */
export const composerTools = { formatting: true, attach: true, emoji: true, mention: true, commands: true, record: true };

/**
 * SwipeRow's buttons in the catalogue's notification list: Mark read (only while the row is unread) and Clear, the destructive one. A screen
 * spreads them onto its SwipeRow; the docs' `sample` and flow frames draw the same.
 */
export const swipeRowActions = [
  { key: "read", label: "Mark {title} read", text: "Mark read", unreadOnly: true },
  { key: "clear", label: "Clear {title}", text: "Clear", tone: "danger" as const },
];

/** SwipeRow's buttons on a chat-history row (`dense`): Rename, and Delete, which asks to confirm. */
export const swipeRowHistory = [
  { key: "rename", label: "Rename {title}", text: "Rename" },
  { key: "delete", label: "Delete {title}", text: "Delete", tone: "danger" as const },
];

/**
 * What Message's actions bar holds in the catalogue: three quick reactions, the add-reaction pill and smile-plus, Reply in thread, Forward and
 * the ⋯. The docs' `sample`s draw the same; a screen spreads this onto each Message, as a product passes the actions it wires up. The phone
 * reads `addReaction` only (its add pill); the rest is the bar on web and desktop.
 */
export const messageBar = { quickReactions: ["👍", "✅", "👀"], addReaction: true, replyInThread: true, forward: true, more: true };
