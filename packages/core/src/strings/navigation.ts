import type { StringGroups } from "./index";

/** Built-in text of the `navigation` components, keyed by component id. See `strings/index.ts`. */
export const navigation = {
  breadcrumbs: {
    /** The navigation landmark's name, when the caller gives no `label`. */
    label: "Breadcrumb",
    /** The status pill's accessible name: its word, its detail, then what pressing it does (`action` has its first letter lowered). */
    status: "{label}: {detail}, {action}",
    /** The fold's name and title: the … that unfolds a collapsed trail. */
    showRest: "Show the rest of the path",
  },
  tabs: {
    /** What a screen reader hears for a tab with a count: the label, then the number. */
    labelWithCount: "{label}, {count}",
    /** The same for a count that is a floor (`badgeMore`). */
    labelWithCountMore: "{label}, more than {count}",
    /** The count chip's text when the count is a floor: `100+`. */
    countMore: "{count}+",
  },
} as const satisfies StringGroups;
