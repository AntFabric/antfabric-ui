import type { OnlyOn, StringGroups } from "./index";

/**
 * Built-in text of the `messaging` components, keyed by component id. See `strings/index.ts`. Where a text names AntFabric or its
 * features (a "channel"), the English default is a plain sentence and the catalogue's copy is in `ANTFABRIC_STRINGS`
 * (`@antfabric/ui-docs/samples`).
 */
export const messaging = {
  "message-divider": {
    /** A day divider with no `label`. */
    today: "Today",
    newMessages: "New messages",
    /** The sticky day pill's accessible name on web and desktop, where it opens the jump-to-day menu. */
    jump: "Showing {label}. Jump to another day",
    /** The phone's sticky day band, which is not a button. */
    showing: "Showing {label}",
  },
  "typing-indicator": {
    /** Two names: "Priya and Marcus". */
    two: "{first} and {second}",
    /** Three or more. */
    several: "Several people",
    /** After one name. */
    isTyping: "is typing",
    /** After two or more. */
    areTyping: "are typing",
    /** The verb as drawn, with its ellipsis. */
    verbShown: "{verb}…",
    /** What a screen reader hears: the whole sentence, without the ellipsis. */
    announce: "{who} {verb}",
  },
  message: {
    /** The row's accessible name: who, whether an agent, when, then the state and flags. One template, so a locale can reorder it. */
    label: "{author}{ai}, {time}{state}{mention}{unread}{pinned}",
    /** The pieces of `label`, each with its leading comma. */
    ai: ", AI",
    saidSending: ", sending",
    saidFailed: ", not sent",
    saidQueued: ", not sent, you are offline",
    mentionsYou: ", mentions you",
    unread: ", unread",
    pinned: ", pinned",
    /** The phone's row label, after the words: an edited message. */
    saidEdited: ", edited",
    /** The phone's row label: how many files and which. */
    attachments: { one: "{count} attachment: {names}", other: "{count} attachments: {names}" },
    /** The agent's tag beside its name, and what it is read as. */
    aiTag: "AI",
    aiTagLabel: "AI agent",
    /** The word beside the pin on web and desktop (the phone draws only the pin). */
    pinnedTag: "Pinned",
    /** The pin's tooltip. */
    pinnedTitle: "Pinned",
    edited: "(edited)",
    /** The tombstone, and the words a screen reader hears for it. */
    deleted: "This message was deleted.",
    /** The status lines. Overrides common `sending`, which has no ellipsis. */
    sending: "Sending…",
    failed: "Couldn't send",
    queued: "Not sent — you're offline. It's still here.",
    retryLabel: "Retry sending this message",
    deleteLabel: "Delete this unsent message",
    /** The phone's single stop for a screen reader. */
    reactions: { one: "{count} reaction", other: "{count} reactions" },
    replies: { one: "{count} reply", other: "{count} replies" },
    /** The rotor actions on the phone's row. */
    actionsLabel: "Message actions",
    openThread: "Open thread",
  },
  composer: {
    /** The field's placeholder when `placeholder` is empty. */
    placeholder: "Message",
    /** The field's accessible name, by mode. */
    input: "Message",
    inputEdit: "Edit message",
    inputThread: "Thread reply",
    /** The banner while one of your messages is being edited. */
    editing: "Editing message",
    /** After the label, on web and desktop: "· ⌘↵ to save · Esc to cancel". */
    editHint: "· {save} to save · Esc to cancel",
    /** The phone's Cancel button beside the editing label. */
    cancelEdit: "Cancel editing",
    offline: "You're offline. Anything you type stays here until you're back online.",
    /** The notice in an archived conversation. The default says "conversation"; a product that calls it a channel sets these through its root's `strings`. */
    archivedTitle: "This conversation has been archived.",
    archivedDetail: "No one can post here any more. Its history stays searchable.",
    /** The notice where you may read but not post. */
    readonlyTitle: "You can’t post here",
    readonlyDetail: "Only its owners and admins can post here. You can still read it and react to messages.",
    /** The formatting toolbar's name (web, desktop) and the phone's Formatting button. */
    formatting: "Formatting",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strikethrough: "Strikethrough",
    link: "Link",
    orderedList: "Numbered list",
    bulletedList: "Bulleted list",
    code: "Code",
    codeBlock: "Code block",
    /** The staged files' group name. */
    attachedFiles: "Attached files",
    attach: "Attach files",
    attachPhone: "Attach",
    emoji: "Insert emoji",
    emojiPhone: "Emoji",
    mention: "Mention someone",
    commands: "Slash command",
    commandsPhone: "Commands",
    record: "Record a voice note",
    sendMessage: "Send message",
    /** The thread's checkbox: "Also send to #platform-eng". */
    alsoSendTo: "Also send to {to}",
    /** Where the reply would also go, when `alsoSendTo` is empty. */
    conversation: "the conversation",
    uploadWaiting: "Waiting for the upload to finish",
    /** The hint under the field when Enter sends: "⇧↵ for a new line". */
    newLine: "{keys} for a new line",
    /** The hint when Mod+Enter sends. */
    modSend: "{send} to send · {newline} for a new line",
  },
  "message-actions": {
    /** The toolbar's accessible name. */
    label: "Message actions",
    /** A quick reaction's accessible name and tooltip. */
    react: "React with {emoji}",
    addReaction: "Add a reaction",
    replyInThread: "Reply in thread",
    forward: "Forward",
    more: "More actions",
  },
  "attachment-card": {
    /** The badge's letters when `badge` is empty. */
    badge: "FILE",
    /** The meta line's type name when `typeLabel` is empty (the phone does not draw it). */
    typeLabel: "File",
    /** The type name of an image whose thumbnail would not load, shown as a file. */
    image: "Image",
    /** The badge's letters for an image with no extension. */
    imageBadge: "IMG",
    /** The failed upload's reason when `error` is empty. */
    error: "Upload failed. Check your connection and try again.",
    /** The progress bar's accessible name. */
    uploadingLabel: "Uploading {name}",
    /** The file card's open button on web and desktop (accessible name and tooltip). */
    preview: "Preview {name}",
    /** The meta line while an upload runs: "Uploading… 64% of 2.4 MB". */
    uploading: "Uploading… {percent}% of {size}",
    /** A stalled upload. */
    paused: "Paused at {percent}% — you're offline. It will resume on its own.",
    /** The file card's name while it is not ready: the state in words, since the meta line and the bar inside a button are not read. */
    statusUploading: "{name}, uploading, {percent}%",
    statusPaused: "{name}, upload paused at {percent}%",
    statusFailed: "{name}. {error}",
    /** The download button's accessible name (web and desktop). */
    download: "Download {name}",
    cancelUpload: "Cancel upload of {name}",
    /** An image's open button. */
    photo: "Photo, {name}, {size}. Open",
    /** The phone's file card open button: its name, size and type. */
    fileOpenPhone: "{name}, {size} · {badge}. Open",
    /** The failed image's overlay title. */
    failedUpload: "Couldn't upload {name}",
    /** The link preview's accessible name: its title, then where it goes. */
    link: "{title}, {domain}",
    /** The × that removes a link's preview (web and desktop). */
    removePreview: "Remove preview",
    play: "Play voice note, {duration}",
    pause: "Pause voice note, {duration}",
    /** A staged chip's progress while uploading. */
    ofSize: "{percent}% of {size}",
    /** A staged chip's stalled upload. */
    pausedShort: "Paused · {percent}%",
    /** A staged chip that failed. */
    didntUpload: "Didn't upload",
    retryName: "Retry {name}",
    /** Removes a staged file. */
    remove: "Remove {name}",
  },
  "thread-summary": {
    /** "4 replies". `count` is already grouped ("1,204"). */
    replies: { one: "{count} reply", other: "{count} replies" },
    /** The line's accessible name; the parts are the next three keys, or nothing. */
    open: "Open thread, {replies}{unread}{last}{following}",
    openUnread: ", {count} unread",
    openLast: ", last reply {time}",
    openFollowing: ", following",
    /** "2 unread" beside the dot. `count` is already grouped. */
    unread: "{count} unread",
    lastReply: "Last reply {time}",
    following: "Following",
  },
  "swipe-row": {
    /** The row's accessible name: the title, then the preview and the time, each with its leading comma. */
    labelBody: ", {body}",
    labelTime: ", {time}",
    /** The screen reader's actions that open and close the tray, when the row has an `onPress` of its own. */
    showActions: "Show actions",
    hideActions: "Hide actions",
  },
  "reaction-pill": {
    /** The web pill's accessible name: the emoji and its count, then who reacted (`reactorsSuffix`, nothing when `reactors` is empty). */
    label: "{emoji} {count}{reactors}",
    /** After the count in `label`, when there is a sentence saying who reacted. */
    reactorsSuffix: ". {reactors}",
    /** The phone pill's: the emoji and its count, whether it is yours, and how to see who. */
    labelPhone: "{emoji} {count}{mine}. Double tap and hold to see who reacted",
    /** `mine` in `labelPhone` while you are one of the reactors. */
    youReacted: ", you reacted",
    /** The add pill's accessible name (and the web's tooltip). */
    add: "Add reaction",
  },
} as const satisfies StringGroups;

/** The keys only one kit has a use for: the web's day pill is a button, the phone's band is not. */
export const messagingOnly = {
  "message-divider": { jump: ["web"], showing: ["mobile"] },
  "reaction-pill": { label: ["web"], reactorsSuffix: ["web"], labelPhone: ["mobile"], youReacted: ["mobile"] },
  message: { saidEdited: ["mobile"], attachments: ["mobile"], pinnedTag: ["web"], pinnedTitle: ["web"], reactions: ["mobile"], replies: ["mobile"], actionsLabel: ["mobile"], openThread: ["mobile"] },
  composer: {
    editHint: ["web"],
    bold: ["web"],
    italic: ["web"],
    underline: ["web"],
    strikethrough: ["web"],
    link: ["web"],
    orderedList: ["web"],
    bulletedList: ["web"],
    code: ["web"],
    codeBlock: ["web"],
    attach: ["web"],
    emoji: ["web"],
    commands: ["web"],
    newLine: ["web"],
    modSend: ["web"],
    cancelEdit: ["mobile"],
    attachPhone: ["mobile"],
    emojiPhone: ["mobile"],
    commandsPhone: ["mobile"],
    record: ["mobile"],
  },
  "attachment-card": { typeLabel: ["web"], image: ["web"], preview: ["web"], download: ["web"], removePreview: ["web"], fileOpenPhone: ["mobile"] },
} as const satisfies OnlyOn<typeof messaging>;
