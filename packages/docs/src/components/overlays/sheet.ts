import type { ComponentDocs, Scene } from "../../types";

const details: Scene[] = [
  { el: "component", use: "text-field", props: { label: "Name", value: "Grace Hopper" } },
  { el: "component", use: "text-field", props: { label: "Email", value: "grace@demo.test", disabled: true } },
  { el: "text", text: "Roles decide what Grace can open and change. A change takes effect at once on every device.", style: { opacity: 0.7 } },
];

const actions: Scene = {
  el: "view",
  style: { flexDirection: "row", gap: 8 },
  children: [
    { el: "component", use: "button", props: { label: "Close", variant: "secondary" } },
    { el: "component", use: "button", props: { label: "Save roles", variant: "primary" } },
  ],
};

const nav: Scene[] = [
  { el: "component", use: "list-item", props: { title: "Home", leading: "icon", icon: "house", selected: true } },
  { el: "component", use: "list-item", props: { title: "Sales", leading: "icon", icon: "briefcase" } },
  { el: "component", use: "list-item", props: { title: "Chat", leading: "icon", icon: "hash" } },
];

const docs: ComponentDocs = {
  id: "sheet",
  name: "Sheet",
  category: "overlays",
  level: "organism",
  status: "draft",
  description:
    "A panel that slides in from the side of the window over a scrim: a record's details, a short form, a navigation drawer on a narrow window. Always modal: the page behind does not scroll and is out of reach until it closes. Not for a yes-or-no decision (Dialog) or a small panel that hangs from a control (Popover). The phone draws the BottomSheet.",
  props: {
    open: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The sheet is showing. ✕, Esc and a press on the scrim close it, unless `dismissible` is off.",
    },
    onOpenChange: {
      type: "event",
      args: "open: boolean",
      changes: "open",
    },
    side: {
      type: "enum",
      options: ["start", "end"],
      default: "end",
      description: "Which edge it slides in from. end (the right in a left-to-right page) for details and forms; start for a navigation drawer.",
    },
    width: {
      type: "number",
      default: 0,
      description: "The panel's width; 0 is the sheet.w token (480). A narrower window draws it full width.",
    },
    title: {
      type: "string",
      default: "",
      sample: "Grace Hopper",
      description: "The header's title. Empty draws none: a drawer names itself with `label`.",
    },
    subtitle: {
      type: "string",
      default: "",
      sample: "grace@demo.test",
    },
    children: {
      type: "node",
      description: "The body. It scrolls when it is taller than the window; the header and footer stay.",
    },
    footer: {
      type: "node",
      description: "The actions under the body, parted from it by a hairline, at the end of the row. Empty draws no footer.",
    },
    showClose: {
      type: "boolean",
      default: true,
      description: "Draws the ✕ in the header.",
    },
    label: {
      type: "string",
      default: "",
      description: "The sheet's accessible name when it has no title (a navigation drawer: \"Menu\").",
    },
    dismissible: {
      type: "boolean",
      default: true,
      description: "✕, Esc and a press on the scrim close it. Off while something must be finished first.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"dialog\" aria-modal panel in the overlay layer of its AntFabricRoot, the window's height, sliding in from its side (enter(\"slide-left\") from the end, \"slide-right\" from the start) over a scrim; header (title, subtitle, IconButton ✕), a body that scrolls, a footer. Tab wraps inside, Esc and a press on the scrim close it (the top overlay only), the page's scroll is locked and the rest of the root is inert while it is open; `open` through useControllable(open, onOpenChange)",
      import: "import { Sheet } from \"@antfabric/ui-react\"",
      notes: [
        "On the server, and in the catalogue's pictures, it is drawn in place in a 640 × 420 stage; in the browser it moves into the layer before the first paint.",
        "Focus moves to the first control in the sheet when it opens and back to what opened it when it closes.",
      ],
      keyboard: [
        { keys: "Esc", action: "Closes the sheet (when dismissible); focus goes back to the opener" },
        { keys: "Tab", action: "Moves through the sheet and wraps inside it" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same panel as web at desktop density",
      import: "import { Sheet } from \"@antfabric/ui-react\"",
    },
    mobile: {
      status: "partial",
      base: "The BottomSheet, with the title, the ✕, the subtitle at the top of the body and the footer under it; `side` and `width` are the web's. Drawn where it is mounted, as the BottomSheet is: the app presents it (a Modal or its navigator's sheet)",
      import: "import { Sheet } from \"@antfabric/ui-react-native\"",
      alternative: "BottomSheet",
    },
  },
  a11y: {
    role: "dialog",
    label: "{title}",
    notes: [
      "Labelled by its title, else by `label`, else \"Panel\".",
      "Modal: Tab wraps inside, the rest of the root is inert and hidden from assistive tech while it is open.",
    ],
  },
  examples: [
    {
      name: "Details with actions",
      description: "A person's details from a table row, with the footer's actions.",
      props: { title: "Grace Hopper", subtitle: "grace@demo.test", children: details, footer: actions },
    },
    {
      name: "Navigation drawer",
      description: "From the start edge, no title: it names itself.",
      platforms: ["web", "desktop"],
      props: { side: "start", width: 284, title: "", subtitle: "", showClose: false, label: "Menu", children: nav },
    },
  ],
  edgeCases: [
    {
      title: "Taller than the window",
      platforms: ["web", "desktop"],
      handling: "Only the body scrolls; the header and the footer stay in view.",
    },
    {
      title: "A window narrower than the sheet",
      platforms: ["web", "desktop"],
      handling: "The panel is never wider than the window: on a phone-width browser it fills it.",
    },
    {
      title: "Something must be finished first",
      platforms: ["web", "desktop", "mobile"],
      handling: "With `dismissible` off, Esc and the scrim do nothing and the ✕ is disabled; the footer's actions close it.",
    },
  ],
  related: ["dialog", "bottom-sheet", "popover"],
};

export default docs;
