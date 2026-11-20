import type { StringGroups } from "./index";

/** Built-in text of the `actions` components, keyed by component id. See `strings/index.ts`. */
export const actions = {
  button: {
    /** The spinner's accessible name, announced while the button is loading. */
    loading: "Loading",
  },
  "icon-button": {
    /** The accessible name when an unread count is drawn on the corner: the button's label, then the count. */
    labelWithUnread: "{label}, {count} unread",
  },
  "segmented-control": {
    /** A segment's accessible name when it shows a count chip: its label, then the count. */
    labelWithCount: "{label}, {count}",
  },
} as const satisfies StringGroups;
