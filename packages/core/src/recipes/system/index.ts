// Recipes for the system components: one file per component, listed here.
import { connectionBanner } from "./connection-banner";
import { sessionState } from "./session-state";
import { updateBanner } from "./update-banner";

export const system = { "connection-banner": connectionBanner, "session-state": sessionState, "update-banner": updateBanner } as const;
