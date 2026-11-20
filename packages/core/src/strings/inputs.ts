import type { OnlyOn, StringGroups } from "./index";

/** Built-in text of the `inputs` components, keyed by component id. See `strings/index.ts`. */
export const inputs = {
  chip: {
    /** The label a screen reader reads for a chip with a count: the label, then how many. */
    labelWithCount: "{label}, {count}",
    /** The accessible name of a removable chip's ✕. */
    remove: "Remove {label}",
    /** The tooltip on a removable chip's ✕ (web and desktop; the phone has no tooltip). */
    removeTitle: "Remove",
  },
  "form-field": {
    /** The pill beside the label of a required field. */
    required: "Required",
  },
  "search-field": {
    /** The accessible name of the ✕ that appears while the field holds text. */
    clearSearch: "Clear search",
    /** The name of the spinner that stands in for the glass while a search is in flight. */
    loading: "Loading",
  },
  select: {
    /** What the filter box at the top of the open list says while it is empty, when the select has no `searchPlaceholder` of its own. */
    searchPlaceholder: "Search",
    /** Under the filter box when the typed text matches no row. */
    emptyFiltered: "Nothing matches “{filter}”.",
    /** In the open list when there are no rows and nothing is typed. */
    empty: "Nothing to choose from.",
    /** The accessible name of the phone sheet's close button. */
    close: "Close",
  },
  "text-area": {
    /** The tag beside a required field's label. */
    required: "Required",
    /** The counter under a field with a `maxLength`. */
    characterCount: "{current}/{max}",
    /** Said once typing pauses near the limit of a field with a `maxLength`. */
    charactersLeft: { one: "{count} character left", other: "{count} characters left" },
    /** Said when typing reaches the limit of a field with a `maxLength`. */
    limitReached: "Character limit reached",
  },
  "text-field": {
    /** The tag beside a required field's label, when it has no `tag` of its own. */
    required: "Required",
    /** What a screen reader hears after a trailing Copy was pressed. */
    copied: "Copied",
    /** The counter under a field with a `maxLength`. */
    characterCount: "{current}/{max}",
    /** Said once typing pauses near the limit of a field with a `maxLength`. */
    charactersLeft: { one: "{count} character left", other: "{count} characters left" },
    /** Said when typing reaches the limit of a field with a `maxLength`. */
    limitReached: "Character limit reached",
    /** The button at the end of a password field with `reveal`, while the characters are hidden. */
    show: "Show",
    /** The same button while the characters are shown. */
    hide: "Hide",
    /** That button's accessible name while the characters are hidden. */
    showLabel: "Show password",
    /** Its accessible name while they are shown. */
    hideLabel: "Hide password",
  },
} as const satisfies StringGroups;

/** Keys one kit alone reads (`pnpm check strings`): the web's tooltip on a chip's ✕ has no phone counterpart (the ✕'s name is its label there), and the phone sheet's close button has no web counterpart (the panel closes on Escape and a press outside). */
export const inputsOnly = { chip: { removeTitle: ["web"] }, select: { close: ["mobile"] } } as const satisfies OnlyOn<typeof inputs>;
