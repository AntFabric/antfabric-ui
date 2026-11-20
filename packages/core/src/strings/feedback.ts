import type { StringGroups } from "./index";

/** Built-in text of the `feedback` components, keyed by component id. See `strings/index.ts`. */
export const feedback = {
  // Dismiss is `common`'s: the × on a banner and the chip or hint on a toast read it through their own `s`.
  "inline-banner": {},
  "progress-bar": {
    /** The bar's accessible name when the `label` prop is not given. */
    label: "Progress",
    /** The label of the × on an upload row while it moves. */
    cancelUpload: "Cancel upload of {name}",
    /** The label of the retry control on an upload row that failed. */
    retryUpload: "Retry upload of {name}",
  },
  skeleton: {
    /** What a screen reader hears once for the placeholder, when the `label` prop is not given. */
    loading: "Loading",
  },
  toast: {},
  "toast-region": {
    /** The region's accessible name, as a landmark a screen reader can jump to. */
    label: "Notifications",
  },
} as const satisfies StringGroups;
