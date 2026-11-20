import type { ComponentDocs, Scene } from "../../types";

const profileMenu: Scene = {
  el: "component",
  use: "menu",
  props: {
    label: "Your profile",
    width: 240,
    items: [
      { type: "label", label: "priya.raman@example.com" },
      { key: "account", label: "My account", icon: "user-round" },
      { key: "settings", label: "Notification settings", icon: "bell" },
      { type: "separator" },
      { key: "signout", label: "Sign out", icon: "log-out" },
    ],
  },
};

const filters: Scene = {
  el: "view",
  style: { gap: 8, width: 240 },
  children: [
    { el: "text", text: "Show", style: { fontWeight: 600 } },
    { el: "component", use: "checkbox", props: { label: "Unread only", checked: true } },
    { el: "component", use: "checkbox", props: { label: "Mentions", checked: false } },
    { el: "component", use: "checkbox", props: { label: "From people I follow", checked: false } },
  ],
};

const docs: ComponentDocs = {
  id: "popover",
  name: "Popover",
  category: "overlays",
  level: "molecule",
  status: "draft",
  description:
    "A panel that hangs from the control that opened it: a menu, a short form, a list, a card of anything. It floats above the page in the overlay layer (whatever the page's overflow), flips to the other side where there is no room, follows its trigger as the page scrolls, and closes on Esc and a press outside, giving focus back to the trigger. Not for a decision that blocks the page (Dialog) or a side panel (Sheet).",
  props: {
    content: {
      type: "node",
      default: null,
      description: "What the panel holds. With `bare`, content that is already a card (a Menu) is drawn without a second one round it.",
    },
    open: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The panel is showing. A press on the trigger toggles it; Esc and a press outside close it.",
    },
    onOpenChange: {
      type: "event",
      args: "open: boolean",
      changes: "open",
    },
    side: {
      type: "enum",
      options: ["top", "bottom", "left", "right"],
      default: "bottom",
      description: "Which side of the trigger the panel hangs on. Where that side has no room and the other has more, it flips.",
    },
    align: {
      type: "enum",
      options: ["start", "center", "end"],
      default: "start",
      description: "Which edge of the trigger the panel lines up with along that side (start is the reading start: the left in a left-to-right page). end suits a trigger at the window's right edge, such as an avatar.",
    },
    width: {
      type: "number",
      default: 0,
      description: "The panel's width; 0 lets it take its content's width.",
    },
    matchTrigger: {
      type: "boolean",
      default: false,
      description: "The panel is exactly as wide as its trigger: a picker under a field.",
    },
    label: {
      type: "string",
      default: "",
      sample: "Filters",
      description: "The panel's accessible name, when its content does not name itself (a Menu names itself).",
    },
    bare: {
      type: "boolean",
      default: false,
      description: "No card: no fill, edge, corner, shadow or padding. For content that is already a card, such as a Menu.",
    },
    modal: {
      type: "boolean",
      default: false,
      description: "Tab stays inside the panel, and the rest of the page is inert until it closes. Most popovers are not modal.",
    },
    showTrigger: {
      type: "boolean",
      default: true,
      description: "With no children: draws a button the panel belongs to, with the panel in flow beside it, as the catalogue shows it.",
    },
    triggerLabel: {
      type: "string",
      default: "Open",
      sample: "Filters",
    },
    children: {
      type: "node",
      description: "The control the panel belongs to. A press on it toggles the panel; it is told it opens a panel (aria-haspopup), whether it is open (aria-expanded) and which (aria-controls).",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div> round the trigger (`children`); while open, the panel (role=\"dialog\", or the content's own role when `bare`) is drawn in the overlay layer: a fixed, full-window box rendered into the nearest AntFabricRoot, so the theme's variables apply and no overflow clips it. Placed from the trigger's box, flipped and kept inside the window, re-placed on scroll and resize; focus moves in and back through useOverlayFocus; `open` through useControllable(open, onOpenChange)",
      import: "import { Popover } from \"@antfabric-ui/react\"",
      notes: [
        "Only the top overlay takes Esc and a press outside: a popover opened from a dialog closes before the dialog does.",
        "On the server, and in the catalogue's pictures, the panel is drawn in place under its trigger; in the browser it moves into the layer before the first paint.",
        "The trigger toggles the panel itself: an app passes `open` and `onOpenChange`, and does not toggle it again from the trigger's own onPress.",
      ],
      keyboard: [
        { keys: "Enter / Space on the trigger", action: "Opens the panel; focus moves to its first control" },
        { keys: "Esc", action: "Closes it; focus goes back to the trigger" },
        { keys: "Tab", action: "Moves through the panel; with `modal` it stays inside" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same panel as web at desktop density",
      import: "import { Popover } from \"@antfabric-ui/react\"",
    },
    mobile: {
      status: "ready",
      base: "A Pressable round the trigger; while open, the panel is drawn in a transparent Modal over the screen, placed from the trigger's measureInWindow and flipped where there is no room. A press on the backdrop and Android's back close it",
      import: "import { Popover } from \"@antfabric-ui/react-native\"",
      notes: ["`modal` marks the panel accessibilityViewIsModal, so a screen reader stays inside it."],
    },
  },
  a11y: {
    role: "dialog",
    notes: [
      "The trigger gets aria-haspopup (\"menu\" with `bare`, else \"dialog\"), aria-expanded and, while open, aria-controls.",
      "Name the panel with `label` unless its content names itself.",
      "Focus moves into the panel when it opens and back to the trigger when it closes, unless the person moved it elsewhere.",
    ],
  },
  examples: [
    {
      name: "Filters",
      description: "A short form hanging under its button.",
      props: { label: "Filters", triggerLabel: "Filters", content: filters },
    },
    {
      name: "A menu (bare)",
      description: "A Menu is already a card, so the popover draws none round it. end lines it up with a trigger at the window's right edge.",
      props: { bare: true, align: "end", triggerLabel: "Profile", content: profileMenu },
    },
    {
      name: "Above",
      props: { side: "top", label: "Filters", triggerLabel: "Filters", content: filters },
    },
  ],
  edgeCases: [
    {
      title: "Near the edge of the window",
      platforms: ["web", "desktop", "mobile"],
      handling: "When the chosen side has no room for the panel and the other side has more, the panel flips there. Along the side it is kept inside the window with a gap at the edge, and a panel taller than the room scrolls inside itself.",
    },
    {
      title: "Opened from a dialog",
      platforms: ["web", "desktop"],
      handling: "The popover is above the dialog in the layer stack: Esc and a press outside close the popover first, and the dialog keeps its own.",
    },
    {
      title: "The page scrolls while it is open",
      platforms: ["web", "desktop"],
      handling: "The panel follows its trigger, re-placed on every scroll of any box and on resize. It does not close on scroll.",
    },
    {
      title: "Nothing in the panel can take focus",
      platforms: ["web", "desktop"],
      handling: "Focus goes to the panel itself (it is focusable), so Esc still closes it.",
    },
  ],
  related: ["menu", "dialog", "hover-card", "tooltip"],
};

export default docs;
