// Recipes for the feedback components: one file per component, listed here.
import { emptyState } from "./empty-state";
import { inlineBanner } from "./inline-banner";
import { progressBar } from "./progress-bar";
import { skeleton } from "./skeleton";
import { toast } from "./toast";
import { toastRegion } from "./toast-region";

export const feedback = { "empty-state": emptyState, "inline-banner": inlineBanner, "progress-bar": progressBar, skeleton, toast, "toast-region": toastRegion } as const;
