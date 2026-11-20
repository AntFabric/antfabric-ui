import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "tooltip",
  name: "Tooltip",
  category: "overlays",
  level: "atom",
  status: "stable",
  description: "The name of an icon-only control, in a small ink bubble, after a 320 ms rest on hover and at once on keyboard focus. It wraps the control it belongs to: the control is described by the bubble, and Esc, blur, a press and leaving close it.",
  props: {
    label: {
      type: "string",
      sample: "Mute notifications",
      required: true,
      description: "The words the bubble says: the same as the control's accessible name when it has no visible text.",
    },
    shortcut: {
      type: "string",
      default: "",
      description: "A shortcut drawn inside the bubble after the label, written once as Mod+Shift+M. The trigger also gets it as aria-keyshortcuts.",
    },
    side: {
      type: "enum",
      options: ["top", "bottom", "left", "right"],
      default: "bottom",
      description: "Which side of its control the bubble hangs on. The kit does not flip it at the window's edge: a product that needs that passes the side it computed.",
    },
    showTrigger: {
      type: "boolean",
      default: true,
      description: "With no children: draws the icon button the tooltip belongs to, with the bubble in flow beside it, as the catalogue shows it.",
    },
    triggerIcon: {
      type: "icon",
      default: "bell-off",
    },
    children: {
      type: "node",
      description: "The control the tooltip belongs to. The bubble floats beside it, opens on its hover (after a short rest) and keyboard focus, and the control is aria-describedby it.",
    },
    open: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The bubble is showing. Hover and keyboard focus change it; set it to draw the bubble open (the catalogue does).",
    },
    onOpenChange: {
      type: "event",
      args: "open: boolean",
      changes: "open",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div> wrapping the control (`children`) with a role=\"tooltip\" bubble that the control is aria-describedby; it opens after a 320 ms rest on hover and at once on :focus-visible, closes on Esc, blur, press and leave, and the bubble itself is hoverable; inline styles over `t`, Kbd (inverse) for the shortcut; fades in with enter(\"fade\"); `open` through useControllable(open, onOpenChange). With no children it draws a built-in IconButton and the bubble in flow",
      import: "import { Tooltip } from \"@antfabric/ui-react\"",
      notes: [
        "Hover opens it only where (hover: hover) holds and the pointer is not touch — a phone browser or a tap on a tablet never flashes one.",
        "The kit does not remove a `title` the control carries: leave it off a control that has a Tooltip, or the browser draws a second bubble.",
        "Shortcuts inside the bubble follow the web's alternatives, never a browser-reserved key.",
        "The bubble floats flush to its control (no gap to cross, so it stays open while the pointer moves onto it) and does not flip at the window's edge.",
      ],
      keyboard: [
        {
          keys: "Tab (focus-visible)",
          action: "Shows the tooltip for the focused control at once, without the delay",
        },
        {
          keys: "Esc",
          action: "Hides it without moving focus",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same bubble as web at desktop density, with ⌘ glyphs on macOS",
      import: "import { Tooltip } from \"@antfabric/ui-react\"",
      notes: [
        "The trigger is the Tooltip's `children`: the first button, link, field or [role=button] in it takes aria-describedby and aria-keyshortcuts.",
        "320 ms delay; labels wrap at the recipe's 260px max width with a 1.35 line height.",
        "The bubble fades in (no slide or scale: a label should not travel); the catalogue's Replay plays it.",
        "Hidden immediately on pointerdown, Esc and blur. The app's tooltip host (not built here) also hides on scroll, resize and window blur.",
        "z-index is the top of the stack (above toasts), so a tooltip is never under a dialog that is open.",
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "No hover on a phone. Every icon-only control already carries an accessibilityLabel, which VoiceOver and TalkBack read; an accessibilityHint adds what it does when the name alone is not enough. A long-press on an icon button shows its label as a callout above the finger (the iOS 17 / Android 14 pattern), with a light haptic — and only for icon-only controls, so long-press stays free for rows.",
    },
  },
  a11y: {
    role: "tooltip",
    notes: [
      "The bubble is role=tooltip and the control is aria-describedby it. When the control's own name already says the label, the bubble's label text is hidden from the description, so only what is more (the shortcut, in words) is read: a screen reader does not say everything twice.",
      "WCAG 1.4.13: dismissible (Esc, without moving focus), hoverable (the bubble sits flush with the control and is inside the same host, so moving onto it does not close it), persistent until the pointer or focus leaves or Esc.",
      "A disabled control should use aria-disabled rather than disabled, so it still receives pointer events and its tooltip can say why.",
    ],
  },
  examples: [
    {
      name: "Icon button",
    },
    {
      name: "With a shortcut",
      props: {
        label: "Search",
        triggerIcon: "search",
        shortcut: "Mod+K",
      },
    },
    {
      name: "Above (lower part of the window)",
      props: {
        label: "Attach files",
        triggerIcon: "paperclip",
        side: "top",
      },
    },
    {
      name: "Bubble only",
      props: {
        showTrigger: false,
        label: "Thread panel",
        shortcut: "Mod+Shift+T",
      },
    },
  ],
  matrix: [
    {
      prop: "side",
    },
  ],
  edgeCases: [
    {
      title: "Long label",
      platforms: ["web", "desktop"],
      handling: "Over 34 characters the bubble wraps at 260px instead of growing across the window. Most labels are two or three words; a sentence belongs in data-tip only when the accessible name must be long and the tooltip short.",
      example: {
        name: "Wraps",
        props: {
          label: "Star your conversation with Kenji Watanabe so it stays at the top of your sidebar",
          triggerIcon: "star",
        },
      },
    },
    {
      title: "Near the edge of the window",
      platforms: ["web", "desktop"],
      handling: "If the preferred side does not fit, the opposite side is used; if neither fits, the preferred side stays. The bubble is then clamped 8px inside the window on the cross axis, so a control in the top-right corner gets a bubble below it that slides left.",
      example: {
        name: "Flipped left",
        props: {
          label: "Close the thread panel",
          triggerIcon: "x",
          side: "left",
        },
      },
    },
    {
      title: "Keyboard focus",
      platforms: ["web", "desktop"],
      handling: "On :focus-visible the tooltip shows at once — the delay exists to stop a sweeping pointer from opening ten, which a Tab press cannot do. Esc hides it and keeps focus. Pressing the control hides it.",
    },
    {
      title: "A control that draws its own hover card",
      platforms: ["web", "desktop"],
      handling: "An avatar or @mention opens a hover card after 380 ms; a tooltip at 320 ms would arrive first and cover it. Such triggers carry data-tip=\"\" — an empty string is a decision, not a missing value.",
    },
    {
      title: "Disabled control",
      platforms: ["web", "desktop"],
      handling: "Native disabled buttons stop receiving pointer events in some engines, which would hide the one tooltip that matters. Controls use aria-disabled, and the tooltip says why: \"Only channel admins can archive #release-train\".",
      example: {
        name: "Says why",
        props: {
          label: "Only channel admins can archive #release-train",
          triggerIcon: "archive",
        },
      },
    },
    {
      title: "Touch on a laptop or tablet",
      platforms: ["web", "desktop"],
      handling: "A tap never shows a tooltip — it would flash under the finger. pointerType touch is ignored; a long-press on an icon-only control shows the label as on the phone.",
    },
    {
      title: "Scroll, resize, switching windows",
      platforms: ["web", "desktop"],
      handling: "Any scroll (capture phase, so an inner list counts), resize, pointerdown, keydown or window blur hides the bubble at once. A trigger that unmounts during the delay never shows one: the timer checks the element is still connected and has a size.",
    },
    {
      title: "Reduced motion and dark mode",
      platforms: ["web", "desktop"],
      handling: "With reduced motion the 120 ms fade is dropped. In dark mode the ink bubble inverts to the light inverse surface with dark text, so it still reads as \"not part of the page\".",
    },
  ],
  related: ["icon-button", "hover-card", "kbd"],
  flows: [
    {
      id: "rest-on-an-icon-button",
      title: "Rest on an icon button to read its name",
      description: "One host at the app root speaks for every control. The words are the label the control already carries, the bubble waits for the pointer to settle, and anything you do makes it go.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "The words come from the control itself",
          detail: "data-tip wins, then title (taken off the element so the browser never draws a second bubble), then aria-label when the control shows no text of its own. data-tip=\"\" asks for silence.",
          code: "resolveTipLabel(el)  // data-tip → title (adopted) → aria-label, icon-only controls",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The same host, mounted once in the root route",
          detail: "Nothing is passed per control. The host reads the same three attributes and places the bubble with Floating UI.",
          code: "<TooltipHost />  // in the root route's component, outside anything that scrolls",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The pointer comes to rest on 🔕",
          detail: "One capture-phase pointerover listener on the document serves every button, link, tab, menu item and switch. A bare element with an aria-label is not a trigger.",
          code: "document.addEventListener('pointerover', onOver, true)  // from.closest(TRIGGERS)",
        },
        {
          kind: "state",
          title: "A 320 ms timer starts",
          detail: "When it fires the host checks the pointer is still on that control and the control is still on the page with a size, so a sweeping pointer or a row that scrolled away opens nothing.",
          code: "timer.current = setTimeout(() => { if (target.current !== el || !el.isConnected) return; … }, delay)",
        },
        {
          kind: "effect",
          title: "It measures, then picks a side",
          detail: "Below, unless the control is in the bottom 40% of the window. Then it flips if the bubble doesn't fit and clamps 8px inside the window.",
          code: "setLive({ label, rect, side: preferredSide(rect, window.innerHeight) })  →  resolveTipPlacement(live.rect, bubble, live.side, viewport)",
        },
        {
          kind: "motion",
          title: "The bubble fades in",
          detail: "A fade and nothing else: a label should not travel. With reduced motion it simply appears.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "The button is pressed",
          detail: "Pressing does what the button does; the bubble has no part in it and never takes a click.",
        },
        {
          kind: "result",
          title: "Any press, key, scroll or switch of window hides it",
          detail: "pointerdown, keydown, scroll, resize and window blur all hide it at once, so switching apps never leaves one floating. Today keydown also means keyboard users get none; this spec shows it on focus-visible and keeps Esc to hide it.",
          code: "document.addEventListener('pointerdown', hide, true); document.addEventListener('keydown', hide, true); window.addEventListener('blur', hide)",
        },
      ],
      replay: [
        {
          step: 2,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              align: "center",
              gap: "$space.sm",
              width: 240,
              minHeight: 120,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell-off",
                  label: "Mute notifications",
                  variant: "soft",
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              align: "center",
              gap: "$space.sm",
              width: 240,
              minHeight: 120,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell-off",
                  label: "Mute notifications",
                  variant: "soft",
                },
              },
              {
                el: "component",
                use: "tooltip",
                props: {
                  showTrigger: false,
                  label: "Mute notifications",
                },
              },
            ],
          },
        },
        {
          step: 6,
          press: "Mute notifications",
          hold: 900,
          scene: {
            el: "view",
            style: {
              align: "center",
              gap: "$space.sm",
              width: 240,
              minHeight: 120,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell-off",
                  label: "Mute notifications",
                  variant: "soft",
                },
              },
              {
                el: "component",
                use: "tooltip",
                props: {
                  showTrigger: false,
                  label: "Mute notifications",
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1500,
          scene: {
            el: "view",
            style: {
              align: "center",
              gap: "$space.sm",
              width: 240,
              minHeight: 120,
              paddingTop: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell-off",
                  label: "Mute notifications",
                  variant: "soft",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
