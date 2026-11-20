import type { ComponentDocs, Scene } from "../../types";

const toast = (message: string, tone?: string, actionLabel?: string): Scene => ({
  el: "component",
  use: "toast",
  props: { message, ...(tone ? { tone } : {}), ...(actionLabel ? { actionLabel } : {}) },
});

const docs: ComponentDocs = {
  id: "toast-region",
  name: "Toast region",
  category: "feedback",
  level: "molecule",
  status: "draft",
  description:
    "Where the app's toasts appear: a stack at one edge of the window, the newest nearest it, above dialogs and sheets, letting presses through between the toasts. The app keeps one region per window and puts its Toasts in it; each Toast keeps its own timer, pause and dismissal.",
  props: {
    side: {
      type: "enum",
      options: ["top", "bottom"],
      default: "bottom",
      description: "Which edge of the window the toasts stack on.",
    },
    align: {
      type: "enum",
      options: ["start", "center", "end"],
      default: "center",
      description: "Where along that edge. end with top suits notifications that arrive while the app is in front.",
    },
    max: {
      type: "number",
      default: 3,
      description: "The most toasts shown at once; the newest are kept, the older ones wait out of sight.",
    },
    children: {
      type: "node",
      description: "The toasts, oldest first.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <section> landmark (named \"Notifications\") in the overlay layer of its AntFabricRoot at z.toast, above modal dialogs and sheets; a column at the chosen edge with pointer-events only on the toasts; a press on it is not a press outside an open overlay. In place, in a 560 × 240 stage, on the server and in the catalogue's pictures",
      import: "import { ToastRegion } from \"@antfabric/ui-react\"",
      notes: ["Toasts announce themselves through the kit's one announcer; the region does not add a second live region."],
    },
    desktop: {
      status: "ready",
      base: "The same region as web at desktop density",
      import: "import { ToastRegion } from \"@antfabric/ui-react\"",
    },
    mobile: {
      status: "partial",
      base: "A View stacking the toasts at its edge, pointerEvents box-none; drawn where it is mounted: the app lays it over its screen inside the safe area",
      import: "import { ToastRegion } from \"@antfabric/ui-react-native\"",
    },
  },
  a11y: {
    role: "region",
    label: "Notifications",
    notes: ["A landmark a screen reader can jump to. Each Toast is announced when it appears, through the kit's announcer."],
  },
  examples: [
    {
      name: "At the bottom",
      props: { children: [toast("Role saved.", "success"), toast("Grace Hopper was invited.", "success")] },
    },
    {
      name: "Top end",
      description: "Where notifications that arrive while the app is open are shown.",
      props: { side: "top", align: "end", children: [toast("Your greeting “Hello, Ada” is ready.", undefined, "Open")] },
    },
  ],
  edgeCases: [
    {
      title: "More toasts than max",
      platforms: ["web", "desktop", "mobile"],
      handling: "Only the newest `max` are drawn; when one is dismissed, the next older one comes back into view.",
    },
    {
      title: "A toast over an open dialog",
      platforms: ["web", "desktop"],
      handling: "The region is above the dialog's layer, and a press on a toast does not cancel the dialog.",
    },
  ],
  related: ["toast", "inline-banner"],
};

export default docs;
