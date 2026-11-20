import { defineRecipe } from "../../recipe";

/**
 * ToastRegion. The place on screen the app's toasts stack in: a corner or the middle of the top or bottom edge, kept off the edge by
 * the gutter. It draws nothing of its own round the toasts. The kit reads the layer's z-index (`$z.toast`), above dialogs and sheets.
 */
export const toastRegion = defineRecipe({
  parts: ["root"],
  styles: {
    root: { base: { padding: "$space.lg" } },
  },
  reads: ["$z.toast"],
});
