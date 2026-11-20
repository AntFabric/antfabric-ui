import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "bottom-sheet",
  name: "Bottom sheet",
  category: "overlays",
  level: "organism",
  status: "beta",
  description: "The phone's one modal surface: a panel that slides up from the bottom with 20pt top corners, a grab handle, a title row with a close button, and whatever the screen needs to ask. It answers the keyboard, stops under the screen's header row, and — new in this spec — can be dragged down to dismiss.",
  props: {
    title: {
      type: "string",
      default: "",
      sample: "Add people",
      description: "Empty draws no title row — the handle and the content only.",
    },
    largeTitle: {
      type: "boolean",
      default: false,
      description: "The 28pt title for a sheet that is a destination of its own (New message), not a question about the screen under it.",
    },
    tall: {
      type: "boolean",
      default: false,
      description: "Full height, up to the header row behind it, so a list can grow and a footer action sits at the foot however short the list is.",
    },
    showClose: {
      type: "boolean",
      default: true,
    },
    children: {
      type: "node",
      description: "What the sheet holds. Rows inside bleed to the gutter themselves.",
      sample: [
        {
          // The kit's own search field, so the sample's field draws focus like any other (it was a bare input).
          el: "component",
          use: "search-field",
          props: { placeholder: "Search people" },
        },
        {
          el: "text",
          text: "Not in #release-train yet",
          style: {
            fontSize: "$text.caption",
            fontWeight: "$font.weightSemibold",
            color: "$fg.faint",
            paddingY: "$space.xs",
          },
        },
        {
          el: "component",
          use: "list-item",
          props: {
            leading: "avatar",
            avatar: {
              name: "Amara Okafor",
              identity: "green",
            },
            title: "Amara Okafor",
            subtitle: "Product Designer",
            role: "checkbox",
            selected: true,
          },
          style: {
            paddingX: 0,
          },
        },
        {
          el: "component",
          use: "list-item",
          props: {
            leading: "avatar",
            avatar: {
              name: "Diego Fernández",
              identity: "ochre",
            },
            title: "Diego Fernández",
            subtitle: "Android Engineer",
            role: "checkbox",
            selected: true,
          },
          style: {
            paddingX: 0,
          },
        },
        {
          el: "component",
          use: "list-item",
          props: {
            leading: "avatar",
            avatar: {
              name: "Mei Lin",
              identity: "red",
            },
            title: "Mei Lin",
            subtitle: "QA Lead",
            role: "checkbox",
            selected: false,
          },
          style: {
            paddingX: 0,
          },
        },
      ],
    },
    primaryLabel: {
      type: "string",
      default: "",
      description: "A full-width action pinned at the foot (Add 2 people). Empty draws none.",
    },
    onPrimary: {
      type: "event",
      description: "The primary button was pressed. The sheet does not close itself: close it from here, or leave it open while the action runs.",
    },
    keyboard: {
      type: "boolean",
      default: false,
      description: "Draws the on-screen keyboard, to show the sheet sitting on it.",
    },
    dragging: {
      type: "boolean",
      default: false,
      description: "Mid-drag: the panel follows the finger and the scrim lightens with it.",
    },
    closed: {
      type: "boolean",
      default: false,
      description: "Dismissed: the panel has slid back down off the screen and the scrim has cleared. What the close button does in the catalogue; in the app the sheet then unmounts and onClose fires.",
    },
    onClose: {
      type: "event",
      description: "The person asked to close: ×, backdrop, drag, back, the escape gesture.",
    },
    onDismiss: {
      type: "event",
      description: "The sheet has finished leaving. A screen that opens another sheet next waits for this — iOS drops a modal presented while another is still going.",
    },
  },
  platforms: {
    web: {
      status: "partial",
      base: "A <div role=\"dialog\"> aria-modal on a scrim, inline styles over `t`; slides up with enter(\"slide-up\"), then a drag or a close moves it with a transform transition. The handle is a Dismiss <button>; ×, the handle and Esc set `closed` (useControllable) and call onClose; onDismiss fires when the slide down ends",
      import: "import { BottomSheet } from \"@antfabric-ui/react\"",
      notes: [
        "Decision: a bottom sheet exists on the web only in a phone-width browser. At 640px and wider the same caller content opens as what it is on desktop: a Dialog for pickers and forms, a Menu for action lists, a HoverCard or side panel for details.",
        "The kit does not lift the sheet over the on-screen keyboard or read the safe-area inset: the host that mounts it owns both (visualViewport, env(safe-area-inset-bottom)).",
        "Drag-to-dismiss and the browser's pull-to-refresh are the host's: the kit's sheet follows `dragging` and `closed` and calls onClose from the handle, the × and Esc.",
      ],
      keyboard: [
        {
          keys: "Esc",
          action: "Closes (a hardware keyboard on a tablet)",
        },
        {
          keys: "Tab / Shift+Tab",
          action: "Trapped inside the sheet",
        },
      ],
      gestures: [
        {
          gesture: "Drag the handle down",
          action: "Dismisses past 25% of the height, otherwise springs back",
        },
      ],
    },
    desktop: {
      status: "not-applicable",
      alternative: "A window with a pointer has no bottom sheet. Each use maps to the desktop's own surface: a picker or form (Add people, New message) is a centred Dialog at the one modal width; a list of actions (message actions) is a Menu or Context menu; a person or channel card is a HoverCard; a detail pane (a task) is the right-hand side drawer — the Scrim's side alignment, as TaskDrawer uses. The window's minimum width keeps it out of phone territory, so there is no narrow breakpoint to fall back to.",
    },
    mobile: {
      status: "ready",
      base: "<Enter motion=\"slide-up\"> (role dialog, accessibilityViewIsModal) around an Animated.View that the handle and title row drag through PanResponder (past 120pt or a fling dismisses), on GlassSurface (Liquid Glass on iOS 26+); ScrollView body; `closed` through useControllable, onDismiss when the slide down ends",
      import: "import { BottomSheet } from \"@antfabric-ui/react-native\"",
      notes: [
        "The surface panel with 20pt top corners, the 36 × 5 handle 12pt from the top, then one 16pt rhythm: handle → title row → first child. The title row is the title on the left and the × in a 40pt box whose box (not glyph) sits on the 12pt gutter.",
        "Title is 20pt semibold on a 24pt line; largeTitle is 28pt on the 40pt box line, one line.",
        "At rest the panel stops under the screen's header row (status bar + 12 + 40 + 8 — y 119 on an 852pt iPhone) so the dimmed title behind is never cut through. With the keyboard up the cap is the space above the keys instead.",
        "Keyboard: on iOS the sheet is inside a KeyboardAvoidingView and lifts above the keys; on Android the window's own adjustResize is relied on (an edge-to-edge Modal window that is not resized needs the host to measure the IME).",
        "Closing always puts the keyboard away too.",
        "Today's Sheet is a plain Modal with animationType slide and no drag. The kit's sheet adds drag-to-dismiss: a PanResponder on the handle and title row.",
        "iOS 26+: Liquid Glass — the surface is drawn through expo-glass-effect's GlassView (gated on its availability check; the material itself follows the device's Clear / Tinted, Reduce Transparency and Increase Contrast settings). iOS 18 and earlier keep today's blur/opaque look. At a partial height the sheet floats 8pt in from the screen edges with fully rounded corners, as iOS 26 sheets do; at full height it meets the edges again.",
        "In the catalogue the panel slides up on arrival and the × sets `closed`: the panel slides back down and the scrim clears. Replay brings it back.",
      ],
      gestures: [
        {
          gesture: "Drag the handle or title row down",
          action: "The panel follows the finger 1:1 and the scrim lightens with it; released past 25% of its height or flung faster than 1000 pt/s it dismisses, otherwise it springs back",
        },
        {
          gesture: "Drag up",
          action: "Rubber-bands at 0.2× and springs back — a sheet has no taller detent",
        },
        {
          gesture: "Drag down inside a scrolled list",
          action: "Scrolls the list; only once the list is at its top does the same drag start moving the sheet",
        },
        {
          gesture: "Tap the backdrop",
          action: "Closes",
        },
        {
          gesture: "Android back",
          action: "Dismisses the keyboard first if it is up, then closes",
        },
        {
          gesture: "Two-finger scrub (VoiceOver escape)",
          action: "Closes",
        },
      ],
    },
  },
  a11y: {
    role: "dialog",
    label: "{title}",
    notes: [
      "Phone: accessibilityViewIsModal keeps VoiceOver inside the sheet; the screen behind is the host's to hide on Android (importantForAccessibility), which the kit cannot reach from inside the sheet.",
      "Phone: screen-reader focus moves to the title (a header), or to the handle when there is none, when the sheet opens; Android's back button closes it, and so does the escape gesture. The handle's touch area is the profile's 44pt target without drawing more, and the sheet sits above the keyboard on iOS (a KeyboardAvoidingView). The home-indicator inset is a token, not the device's safe area: the host's insets are not read.",
      "Web: focus moves into the panel when it mounts, Tab stays inside, Esc closes, and focus returns to the opener when it unmounts; the 36 × 5 handle has a transparent box centred on it that reaches the profile's target size. The handle is the labelled \"Dismiss\" button — dragging is never the only way out.",
      "A sheet without a title still takes an accessible name from its caller (`aria-label`, `accessibilityLabel`).",
    ],
  },
  examples: [
    {
      name: "Picker",
      description: "Add people: a search field and a checklist.",
    },
    {
      name: "Destination with a large title",
      props: {
        title: "New message",
        largeTitle: true,
        children: [
          {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              gap: "$space.sm",
              height: "$control.hInput",
              paddingX: "$space.md",
              radius: "$radius.input",
              border: "1px solid $border.muted",
            },
            children: [
              {
                el: "text",
                text: "To:",
                style: {
                  fontSize: "$text.body",
                  color: "$fg.muted",
                },
              },
              {
                el: "input",
                attrs: {
                  placeholder: "Name, #channel or email",
                  label: "To",
                },
                style: {
                  flex: 1,
                  fontSize: "$text.body",
                  color: "$fg.body",
                },
              },
            ],
          },
          {
            el: "text",
            text: "Recent",
            style: {
              fontSize: "$text.caption",
              fontWeight: "$font.weightSemibold",
              color: "$fg.faint",
              paddingTop: "$space.md",
              paddingBottom: "$space.xs",
            },
          },
          {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              gap: "$space.md",
              minHeight: "$row.h",
            },
            children: [
              {
                el: "component",
                use: "avatar",
                props: {
                  name: "Kenji Watanabe",
                  identity: "indigo",
                },
              },
              {
                el: "text",
                text: "Kenji Watanabe",
                style: {
                  fontSize: "$text.body",
                  fontWeight: "$font.weightSemibold",
                  color: "$fg.strong",
                },
              },
            ],
          },
          {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              gap: "$space.md",
              minHeight: "$row.h",
            },
            children: [
              {
                el: "component",
                use: "avatar",
                props: {
                  name: "Platform Eng",
                  shape: "square",
                  identity: "ink",
                },
              },
              {
                el: "text",
                text: "#platform-eng",
                style: {
                  fontSize: "$text.body",
                  fontWeight: "$font.weightSemibold",
                  color: "$fg.strong",
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: "Tall, with a footer action",
      props: {
        tall: true,
        primaryLabel: "Add 2 people",
      },
    },
    {
      name: "No title",
      props: {
        title: "",
        children: "Attachment tray: Photos, Camera, Files",
      },
    },
  ],
  matrix: [
    {
      prop: "largeTitle",
    },
    {
      prop: "tall",
    },
  ],
  edgeCases: [
    {
      title: "The keyboard comes up",
      platforms: ["web", "mobile"],
      handling: "The panel lifts to sit on the keyboard and caps its height to the space above it; the list inside shrinks and scrolls rather than drawing under the keys. Nothing is estimated — no per-screen chrome constants — the sheet measures the inset. Closing dismisses the keyboard.",
      example: {
        name: "On the keyboard",
        props: {
          keyboard: true,
        },
      },
    },
    {
      title: "Dragged halfway, then let go",
      platforms: ["web", "mobile"],
      handling: "Below the 25% threshold and slower than a fling, it springs back to rest; past it, it continues down and calls onClose. The scrim's opacity tracks the drag so the screen behind brightens as the sheet leaves. A drag that starts in the list while the list is scrolled only scrolls.",
      example: {
        name: "Mid-drag",
        props: {
          dragging: true,
        },
      },
    },
    {
      title: "Dismissed with something typed in it",
      platforms: ["web", "mobile"],
      handling: "A sheet holding an unsent draft or picked people snaps back on drag, backdrop tap or back, and asks \"Discard your changes?\" in a ConfirmSheet. Because iOS silently drops a modal presented while another is still dismissing, the confirm is presented from the first sheet's onDismiss (useSheetHandoff), never straight after onClose.",
    },
    {
      title: "More content than the screen",
      platforms: ["web", "mobile"],
      handling: "The panel stops under the header row and the body scrolls; a footer action stays pinned at the foot with the home-indicator space under it, so the CTA is always reachable without scrolling.",
    },
    {
      title: "A sheet opened from a menu or another sheet",
      platforms: ["mobile"],
      handling: "One modal at a time. A menu row that opens a sheet closes the menu and presents the sheet from the menu's onDismiss; a sheet that leads to another replaces itself the same way. Stacked sheets are never drawn.",
    },
    {
      title: "Text at 130%",
      platforms: ["mobile"],
      handling: "The 20pt title wraps; the 28pt large title stays on one line and truncates. Rows grow with their text. Font scale is capped at 1.3× as everywhere in the app, and the panel scrolls before it ever pushes the footer off screen.",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "mobile"],
      handling: "The sheet fades in and out instead of sliding. Dragging still moves it — direct manipulation follows the finger — but the release settles without a spring overshoot.",
    },
    {
      title: "Backgrounded or killed",
      platforms: ["mobile"],
      handling: "Backgrounded, the sheet is exactly where it was on return. Killed, a transient sheet (a picker, a confirm) is not restored; the New message draft is saved as a draft and reappears in the composer, not as a sheet.",
    },
    {
      title: "iPad and large phones in landscape",
      platforms: ["mobile"],
      handling: "At regular width the sheet becomes a centred form sheet at the app's 540pt modal width with all four corners rounded, the same content and the same drag. Landscape on a phone keeps the bottom sheet but caps it at 90% of the height.",
    },
    {
      title: "Liquid Glass and earlier iOS",
      platforms: ["mobile"],
      handling: "The glass follows the iPhone's own settings with no work from us, because the kit draws it with the system material (GlassView): Clear or Tinted (Settings → Display & Brightness → Liquid Glass) changes how much shows through, Reduce Transparency makes it frosted and nearly opaque while keeping its shape, and Increase Contrast adds a contrasting edge. The app subscribes to AccessibilityInfo 'reduceTransparencyChanged' only to adjust what it draws around the glass. iOS before 26 keeps the blur look. This happens live in the app as the person changes the setting.",
    },
  ],
  related: ["dialog", "context-menu", "hover-card"],
  flows: [
    {
      id: "add-people",
      title: "Add people to a channel from a sheet",
      description: "The screen owns whether the sheet is open; the sheet owns what you've picked. Add does the work, then the sheet slides away and a toast says how it went.",
      platforms: ["web", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The people come from two queries",
          detail: "The directory, minus everyone already in the channel. The sheet only holds what you type and who you pick.",
          code: "candidates={addablePeople(directory.data, members.data ?? [])}  // useDirectoryQuery(), useMembersQuery(channelId)",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route already loaded both lists",
          detail: "Below 640px the channel settings route draws this sheet; at desktop width the same content is a Dialog. Its people come from the directory and members queries the route loaded.",
          code: "const directory = useSuspenseQuery(peopleQueries.directory())  ·  const members = useSuspenseQuery(channelQueries.members(id))",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Add people is tapped",
          detail: "Only drawn for someone allowed to add members; otherwise the screen says who can.",
          code: "<Button title=\"Add people\" variant=\"secondary\" onPress={() => setAddOpen(true)} fullWidth />",
        },
        {
          kind: "state",
          title: "The screen opens the sheet",
          code: "setAddOpen(true)  // <AddPeopleSheet visible={addOpen} onClose={() => setAddOpen(false)} />",
        },
        {
          kind: "motion",
          title: "The backdrop dims and the sheet slides up",
          detail: "Tall: it stops under the screen's header row, so Add sits at the foot however short the list is. Today the sheet is a React Native Modal sliding up; the kit's sheet adds drag-to-dismiss with a PanResponder.",
          enter: "slide-up",
        },
        {
          kind: "state",
          title: "Picking people is the sheet's own state",
          detail: "Each row toggles a set of picked ids, and the button counts them: Add 2 people.",
          code: "setChosen((prev) => { const next = new Set(prev); if (next.has(ref)) next.delete(ref); else next.add(ref); return next })",
        },
        {
          kind: "trigger",
          title: "Add 2 people is tapped",
          detail: "The button spins and the sheet refuses to close until the answer comes back.",
        },
        {
          kind: "effect",
          title: "Each person is added, then one toast",
          detail: "One request per person, never retried. The first refusal toasts in the server's own words and stops there; the sheet stays open with whoever is left.",
          code: "await addMember.mutateAsync({ userId: person.ref })  …  toast(added === 1 ? `${people[0].name} was added` : `${added} people were added`, 'success')",
        },
        {
          kind: "result",
          title: "The sheet slides away and the toast confirms",
          detail: "2 people were added. The picks and the search reset, so the next open starts clean.",
        },
      ],
      replay: [
        {
          step: 2,
          press: "Add people",
          hold: 1100,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 740,
              paddingX: "$gutter.pane",
              paddingTop: "$space.2xl",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Add people",
                  variant: "secondary",
                  iconLeading: "user-plus",
                  full: true,
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1700,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 740,
              paddingX: "$gutter.pane",
              paddingTop: "$space.2xl",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Add people",
                  variant: "secondary",
                  iconLeading: "user-plus",
                  full: true,
                },
              },
              {
                el: "component",
                use: "bottom-sheet",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  tall: true,
                  primaryLabel: "Add 2 people",
                },
              },
            ],
          },
        },
        {
          step: 6,
          press: "Add 2 people",
          hold: 1000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 740,
              paddingX: "$gutter.pane",
              paddingTop: "$space.2xl",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Add people",
                  variant: "secondary",
                  iconLeading: "user-plus",
                  full: true,
                },
              },
              {
                el: "component",
                use: "bottom-sheet",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  tall: true,
                  primaryLabel: "Add 2 people",
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 740,
              paddingX: "$gutter.pane",
              paddingTop: "$space.2xl",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Add people",
                  variant: "secondary",
                  iconLeading: "user-plus",
                  full: true,
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  position: "absolute",
                  bottom: 24,
                  alignSelf: "center",
                },
                props: {
                  message: "2 people were added",
                  tone: "success",
                  dismissible: false,
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "swipe-it-away",
      title: "Swipe the sheet away",
      description: "Dragging is never the only way out, but it is the quickest. The sheet asks its caller to close, slides off, and says when it has gone.",
      platforms: ["web", "mobile"],
      steps: [
        {
          kind: "trigger",
          title: "The handle is dragged down",
          detail: "Or the title row. A tap on the backdrop, the ×, Android back and VoiceOver's two-finger scrub close it too.",
        },
        {
          kind: "state",
          title: "The panel follows the finger",
          detail: "1:1, and the scrim lightens as it goes. Past 25% of its height, or flung faster than 1000 pt/s, it carries on down; otherwise it springs back. New in this spec: today's sheet has no drag, so the backdrop, the × and back are the ways out.",
          code: "<Pressable accessibilityLabel=\"Dismiss\" onPress={close} />  ·  <Modal onRequestClose={close}>",
        },
        {
          kind: "event",
          title: "onClose fires",
          detail: "A request, not a fact: the caller decides. The sheet puts the keyboard away first.",
          code: "onClose?.()  // Sheet: Keyboard.dismiss(); onClose()",
        },
        {
          kind: "state",
          title: "The caller lets it go",
          detail: "Add people refuses while an add is in flight, and otherwise drops the picks and the search before hiding the sheet.",
          code: "const close = () => { if (busy) return; reset(); onClose() }  ·  onClose={() => setAddOpen(false)}",
        },
        {
          kind: "motion",
          title: "It slides off and the scrim clears",
          detail: "The Modal's slide plays out downward.",
        },
        {
          kind: "event",
          title: "onDismiss fires once it has gone",
          detail: "iOS only, from the Modal. A screen that opens another sheet next waits for this, because iOS drops a modal presented while another is still leaving.",
          code: "<Modal onDismiss={onDismiss}>",
        },
        {
          kind: "result",
          title: "Back on the screen behind",
          detail: "Nothing was added and nothing is kept; the keyboard is down.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1200,
          props: {
            tall: true,
            primaryLabel: "Add 2 people",
          },
        },
        {
          step: 1,
          hold: 1400,
          props: {
            tall: true,
            primaryLabel: "Add 2 people",
            dragging: true,
          },
        },
        {
          step: 4,
          hold: 1600,
          props: {
            tall: true,
            primaryLabel: "Add 2 people",
            closed: true,
          },
        },
      ],
    },
  ],
};

export default docs;
