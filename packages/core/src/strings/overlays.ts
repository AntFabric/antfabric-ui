import type { OnlyOn, StringGroups } from "./index";

/** Built-in text of the `overlays` components, keyed by component id. See `strings/index.ts`. */
export const overlays = {
  "hover-card": {
    /** The tag after a name from outside the workspace. */
    guest: "Guest",
    /** The word beside an AI agent's dot, where a person has a presence. */
    agent: "Agent",
    /** The presence word beside a filled dot. */
    active: "Active",
    /** The presence word beside a hollow dot. */
    away: "Away",
    /** The presence word beside a hollow dot (the dot is the same as away's; the word tells them apart). */
    offline: "Offline",
    /** The name drawn for a deleted account, and the card's accessible name. */
    deletedUser: "Deleted user",
    /** The button that starts a conversation with the person. */
    message: "Message",
    /** The same button on your own card. */
    messageSelf: "Message yourself",
    /** The button that opens their profile. */
    viewProfile: "View profile",
  },
  "command-palette": {
    /** The dialog's accessible name. */
    label: "Command palette",
    /** The field's placeholder, when the caller gives none. */
    placeholder: "Search",
    /** The name of the spinner beside the field and in the results while a search is running. */
    searching: "Searching",
    /** The filter pills' group name. */
    filterLabel: "Filter results by kind",
    /** The strip shown while only what is on this device can be found. */
    offline: "You’re offline. Showing what’s on this device.",
    /** The results list's accessible name. */
    results: "Search results",
    /** A result's accessible name when it has a hint: what it is, then what Enter does. */
    option: "{label}, {hint}",
    /** Said politely when the typing pauses and there are results: how many (the empty state says its own words). */
    resultCount: { one: "{count} result", other: "{count} results" },
    /** The line under the results while a search is still running. */
    loadingText: "Searching…",
    /** What the results say when nothing matched and no agent can be asked. */
    empty: "No matches",
    /** What the results say when nothing matched and Enter asks the agent. */
    emptyAsk: "No matches. Press Enter to ask {name}",
    /** What the results say before anything is typed. */
    prompt: "Type to search",
    /** The ask row's accessible name. */
    askLabel: "Ask {name}: {query}",
    /** The ask row's text: the query sits between the quotes as its own text node. */
    askText: "Ask {name} “{query}”",
    /** The key hint beside the arrows. */
    toMove: "to move",
    /** The key hint beside Enter. */
    toOpen: "to open",
    /** The key hint beside Esc. */
    toClose: "to close",
    /** The hint at the right of the foot when an agent can be asked. */
    askHint: "No match? Enter asks {name}",
  },
  "context-menu": {
    /** The reaction row's group name. */
    quickReactions: "Quick reactions",
    /** A reaction button's accessible name. */
    react: "React with {emoji}",
    /** The accessible name of a reaction that is yours: pressing it takes it back. */
    unreact: "Remove your {emoji}",
    /** The + button's name and title: it opens the full emoji set. */
    more: "React with another emoji",
    /** The rows' accessible name, when the caller gives no `label`. */
    actions: "Actions",
    /** The emoji panel's search field's name and placeholder (phone). */
    searchEmoji: "Search emoji",
    /** The emoji panel's first heading (phone). */
    frequent: "Frequently used",
    /** The emoji panel's second heading (phone). */
    smileys: "Smileys & people",
  },
  menu: {
    /** The accessible name of the ⋮ trigger the menu hangs from, when the caller gives no `triggerLabel`. */
    moreActions: "More actions",
  },
  // The cancel button, the ✕ and the grabber (`cancel`, `close`, `dismiss`) are `common`'s words.
  dialog: {
    /** The confirm button's label, when the caller gives no `confirmLabel`. */
    confirm: "Confirm",
    /** The word drawn on the grey block that stands in for the on-screen keyboard (phone). */
    keyboard: "Keyboard",
  },
  "bottom-sheet": {
    /** The word drawn on the grey block that stands in for the on-screen keyboard. */
    keyboard: "Keyboard",
  },
  // The phone's backdrop (`close`) is `common`'s word.
  popover: {},
  // The ✕ (`close`) is `common`'s word.
  sheet: {
    /** The sheet's accessible name when the caller gives neither `title` nor `label`. */
    label: "Panel",
  },
} as const satisfies StringGroups;

/**
 * Keys one kit alone reads (`pnpm check strings`): the phone's sheet draws the keyboard stand-in, the web's dialog does not; ContextMenu's
 * emoji panel is the phone's (the web's + opens the full set in the browser's own way).
 */
export const overlaysOnly = {
  dialog: { keyboard: ["mobile"] },
  "context-menu": { searchEmoji: ["mobile"], frequent: ["mobile"], smileys: ["mobile"] },
} as const satisfies OnlyOn<typeof overlays>;
