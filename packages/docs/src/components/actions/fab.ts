import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "fab",
  name: "Floating action button",
  category: "actions",
  level: "atom",
  status: "stable",
  description: "A disc that floats over a screen for its one standing action. On the phone: the 56pt ink New message button over Messages, and the 56pt Fabric disc beside the bottom bar. On the desktop: the 40px white help disc in Home's corner. Its caller only positions it.",
  props: {
    variant: {
      type: "enum",
      options: ["ink", "tint", "raised"],
      default: "ink",
      description: "ink is the inverse-surface disc, a product's primary action (AntFabric's New message). tint is the brand-tint disc, the one prominent action (AntFabric's Fabric disc). raised is the card-filled disc with a hairline and the float shadow — the one icon button that keeps a container (AntFabric's desktop help disc; ADR-5911's exception).",
    },
    icon: {
      type: "icon",
      sample: "square-pen",
      required: true,
    },
    label: {
      type: "string",
      sample: "New message",
      required: true,
      description: "The accessible name, and the tooltip on desktop. Never optional — the disc has no text.",
    },
    src: {
      type: "string",
      default: "",
      description: "An image drawn instead of the icon — a brand mark (32pt) on the tint disc.",
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    wiggle: {
      type: "boolean",
      default: false,
      platforms: ["mobile"],
      description: "A press wiggles the glyph for 0.8 s and onPress fires when the wiggle ends, because the sheet it opens covers the disc. One pending press at a time; at once under Reduce Motion.",
    },
    onPress: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "not-applicable",
      alternative: "No floating disc in the browser. New message is the row at the top of the sidebar (Mod+Alt+N — ⌘N opens a browser window) and Fabric help is the ? icon button in the top bar. A FAB is the phone's answer to having no persistent chrome; the web app always has a sidebar, and a disc pinned to a browser's bottom corner sits over page content at 200% zoom and beside the browser's own download and status UI. Below 600px wide the sidebar collapses and New message moves into the top bar as an icon button, still not a floating disc.",
    },
    desktop: {
      status: "ready",
      base: "<button> with the label as aria-label and native title tooltip, inline styles over `t`; hover, press and focus from useInteraction; on macOS 26 ink and raised draw glass() and swell under a press",
      import: "import { Fab } from \"@antfabric/ui-react\"",
      notes: [
        "Desktop draws only raised: Home's \"What can Fabric do?\" disc, position fixed 20px from the window's right and bottom edges (the WINDOW, not the centre column), z-index 50 — above the panes, below every scrim, so the card it opens covers it.",
        "40px, --border-subtle hairline, the tertiary button's fill and --shadow-float. The shadow is part of the shape; the caller only positions it.",
        "A second desktop caller of this shape is a design question, not a reuse opportunity — every other icon button is the flat 28px circle.",
        "New message on desktop is the sidebar row (Mod+N), not a floating disc.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Activates",
        },
        {
          keys: "Tab",
          action: "Reached after the page's main content; the focus ring sits outside the float shadow",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable over a StyleSheet from useTheme(), scaling to 0.94 while pressed; GlassSurface on iOS 26 for ink and raised; with `wiggle` the glyph wiggles with Animated (0.8 s) and onPress fires when it ends, one pending open at a time, at once under Reduce Motion. The bottom-bar squeeze and the haptic are the caller's",
      import: "import { Fab } from \"@antfabric/ui-react-native\"",
      notes: [
        "ink: 56pt ink disc (surface.inverse, ink-on-inverse 20pt pen), right on the 12pt gutter, 12pt above the bottom bar. Coral until the V2 Figma of 2026-10-16 (ADR-9406).",
        "A tap wiggles the pen (0.8 s) and opens New message when the wiggle ENDS, because the sheet covers the button. Reduce Motion plays nothing and opens at once.",
        "tint: 56pt disc in brand.tint (#FDE8E8 / #382525) holding the 32pt AntFabric mark, 8pt right of the bottom bar. A light impact haptic, then the assistant is pushed as a stack screen.",
        "No shadow on either phone disc — the V2 Figma draws them flat.",
        "iOS 26+: Liquid Glass — the surface is drawn through expo-glass-effect's GlassView (gated on its availability check; the material itself follows the device's Clear / Tinted, Reduce Transparency and Increase Contrast settings). iOS 18 and earlier keep today's blur/opaque look. Compose and Help become glass discs with ink glyphs; the Fabric disc stays tinted, because it is the one prominent action.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Activates; scales to 0.94 while pressed",
        },
        {
          gesture: "Second tap during the wiggle",
          action: "Ignored — one New message sheet, never two",
        },
      ],
    },
  },
  a11y: {
    role: "button",
    label: "{label}",
    notes: [
      "The label is the whole accessible name: \"New message\", \"Fabric\", \"What can Fabric do?\". The web adds it as the tooltip.",
      "Keyboard focus draws the focus ring on the disc.",
      "On the phone the disc is rendered before the list in the tree and positioned absolutely, so VoiceOver and TalkBack reach it without swiping past every conversation. `wiggle` waits for the animation before it fires `onPress` unless Reduce Motion is on, which is read when the disc is pressed.",
    ],
  },
  examples: [
    {
      name: "Compose",
      props: {
        wiggle: true,
      },
      platforms: ["mobile"],
    },
    {
      name: "Fabric",
      props: {
        variant: "tint",
        icon: "sparkles",
        label: "Fabric",
      },
      platforms: ["mobile"],
    },
    {
      name: "Help",
      props: {
        variant: "raised",
        icon: "circle-help",
        label: "What can Fabric do?",
      },
      platforms: ["desktop"],
    },
  ],
  matrix: [
    {
      prop: "variant",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "Keyboard is up",
      platforms: ["mobile"],
      handling: "The ink disc steps aside — it is not rendered while the keyboard is showing, together with the bottom bar — so it never sits on the keyboard or over the field being typed into. It returns when the keyboard goes.",
    },
    {
      title: "Double tap while the pen wiggles",
      platforms: ["mobile"],
      handling: "The first tap starts the 0.8 s wiggle and arms one pending open; further taps are ignored until it fires. Unmounting clears the timer so a sheet never opens over a screen that has gone.",
      example: {
        name: "Pressed",
        props: {},
        state: "pressed",
      },
    },
    {
      title: "Bottom bar squeezed by scrolling",
      platforms: ["mobile"],
      handling: "The ink disc drops 26pt with the bar's own spring, to sit 12pt above the squeezed 42pt circle. The Fabric disc fades and shrinks to 0.6 and is removed from the accessibility tree; tapping the squeezed bar or scrolling up brings both back.",
    },
    {
      title: "Covering the last row",
      platforms: ["mobile", "desktop"],
      handling: "The list under a disc gets bottom padding of disc + gap, so the last conversation's preview and time can always scroll clear of it. The desktop help disc is fixed to the window corner; Home's content keeps 72px clear at the bottom-right.",
    },
    {
      title: "Offline",
      platforms: ["mobile"],
      handling: "Compose still opens — drafts are local, and the sheet itself refuses the send with \"You're offline. Your message is saved here.\" The disc never greys out for connectivity: a dead disc with no reason is worse than a sheet that explains.",
    },
    {
      title: "Dark mode",
      platforms: ["mobile", "desktop"],
      handling: "The ink disc inverts with its tokens — a light disc with a dark pen on a dark list. The Fabric disc's tint becomes #382525. The raised disc takes the tertiary button's dark fill and the dark --shadow-float, so it still lifts off the dark page.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "The disc does not scale — it holds no text and 56pt is already over the 44pt target. Its accessible name is read at the user's size by the screen reader.",
    },
    {
      title: "Liquid Glass and earlier iOS",
      platforms: ["mobile"],
      handling: "The glass follows the iPhone's own settings with no work from us, because the kit draws it with the system material (GlassView): Clear or Tinted (Settings → Display & Brightness → Liquid Glass) changes how much shows through, Reduce Transparency makes it frosted and nearly opaque while keeping its shape, and Increase Contrast adds a contrasting edge. The app subscribes to AccessibilityInfo 'reduceTransparencyChanged' only to adjust what it draws around the glass. iOS before 26 keeps the blur look. This happens live in the app as the person changes the setting.",
    },
  ],
  related: ["icon-button", "button", "bottom-bar"],
  flows: [
    {
      id: "help-opens-card",
      title: "The help disc opens What Fabric can do",
      description: "Home's one standing question sits in the window's corner. Pressing it opens the help card over everything; closing the card brings the disc back.",
      platforms: ["desktop"],
      steps: [
        {
          kind: "data",
          title: "Home decides whether the disc is there",
          detail: "The disc renders nothing while My Tasks is open, so it never floats inside someone else's pane. Returning null rather than hiding it takes it out of the accessibility tree too.",
          code: "if (s.railTasks) return null",
        },
        {
          kind: "trigger",
          title: "The disc is pressed",
          detail: "A click, or Enter / Space once Tab reaches it after the page's content. Hovering first shows its name, What can Fabric do?, as the tooltip.",
        },
        {
          kind: "event",
          title: "onPress fires",
          detail: "The disc knows nothing about help; Home's handler names which help to open.",
          code: "onPress?.()  // onClick={() => a.openAssistantHelp('workspace')}",
        },
        {
          kind: "state",
          title: "The store names the surface the card is about",
          detail: "One store field, assistantHelp, says which help to show: 'workspace' from Home, a project's own from inside a project. Opening it also closes ⌘K and the shortcuts card, so two overlays never stack.",
          code: "openAssistantHelp: (surface) => set({ assistantHelp: surface, paletteOpen: false, shortcutsOpen: false })",
        },
        {
          kind: "motion",
          title: "The scrim fades and the card pops over the disc",
          detail: "The card sits at z-index 95, above the disc's 50, so it covers the disc instead of leaving it floating over its own dialog. Today the scrim fades (af-fade) and the Dialog rises (af-rise); the library's dialog pops.",
          enter: "pop",
        },
        {
          kind: "result",
          title: "The card says what Fabric can do here",
          detail: "Its title and lead come from assistantHelp('workspace'), then the areas Fabric works in. ✕, Escape or a click on the scrim sets the field back to null, and the disc is in its corner again.",
          code: "closeAssistantHelp: () => set({ assistantHelp: null })",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 360,
            },
            children: [
              {
                el: "component",
                use: "fab",
                style: {
                  position: "absolute",
                  right: 20,
                  bottom: 20,
                },
                props: {
                  variant: "raised",
                  icon: "circle-help",
                  label: "What can Fabric do?",
                },
              },
            ],
          },
        },
        {
          step: 1,
          press: 0,
          hold: 900,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 360,
            },
            children: [
              {
                el: "component",
                use: "fab",
                style: {
                  position: "absolute",
                  right: 20,
                  bottom: 20,
                },
                props: {
                  variant: "raised",
                  icon: "circle-help",
                  label: "What can Fabric do?",
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 2200,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 360,
            },
            children: [
              {
                el: "component",
                use: "fab",
                style: {
                  position: "absolute",
                  right: 20,
                  bottom: 20,
                },
                props: {
                  variant: "raised",
                  icon: "circle-help",
                  label: "What can Fabric do?",
                },
              },
              {
                el: "view",
                enter: "fade",
                style: {
                  position: "absolute",
                  inset: 0,
                  bg: "$scrim.default",
                  align: "center",
                  justify: "center",
                },
                children: [
                  {
                    el: "component",
                    use: "card",
                    enter: "pop",
                    style: {
                      width: 360,
                    },
                    props: {
                      elevate: "float",
                      children: [
                        {
                          el: "text",
                          text: "What Fabric can do",
                          style: {
                            fontSize: "$text.title",
                            fontWeight: "$font.weightSemibold",
                            color: "$fg.strong",
                          },
                        },
                        {
                          el: "text",
                          text: "Ask in plain words. Fabric works only with what you can already see, and tells you what it did.",
                          style: {
                            fontSize: "$text.bodySm",
                            color: "$fg.muted",
                          },
                        },
                        {
                          el: "component",
                          use: "list-item",
                          props: {
                            title: "Projects and tickets",
                            icon: "folder-kanban",
                          },
                        },
                        {
                          el: "component",
                          use: "list-item",
                          props: {
                            title: "Channels and messages",
                            icon: "hash",
                          },
                        },
                        {
                          el: "component",
                          use: "list-item",
                          props: {
                            title: "Calendar",
                            icon: "calendar",
                            detail: "Needs Google sign-in",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "compose-opens-new-message",
      title: "The pen wiggles, then New message slides up",
      description: "Over Messages the ink disc starts a conversation. The sheet it opens covers the disc, so the pen's wiggle plays first and the sheet arrives when it ends.",
      platforms: ["mobile"],
      steps: [
        {
          kind: "data",
          title: "The bottom bar and the keyboard place the disc",
          detail: "The disc reads collapsed from the bottom-bar store and drops 26pt with the bar's own spring when scrolling squeezes it. While the keyboard is up it renders nothing.",
          code: "const collapsed = useBottomBarStore((s) => s.collapsed)  ·  if (keyboardUp) return null",
        },
        {
          kind: "trigger",
          title: "The disc is tapped",
          detail: "It scales to 0.94 under the finger. A second tap while the pen moves is ignored: one New message sheet, never two.",
          code: "if (pending.current !== null) return",
        },
        {
          kind: "motion",
          title: "The pen wiggles for 0.8 s",
          detail: "The pen slides and tilts about its tip while the square stays still. Reduce Motion skips the wiggle and opens at once.",
          code: "x.play(); y.play(); tilt.play()  ·  pending.current = setTimeout(() => { pending.current = null; onPress() }, penWiggleMs)",
        },
        {
          kind: "event",
          title: "onPress fires when the wiggle ends",
          code: "onPress?.()  // <ComposeFab onPress={() => setComposeOpen(true)} />",
        },
        {
          kind: "state",
          title: "The Messages tab opens its sheet",
          detail: "composeOpen is local state on the tab. The people the sheet lists come from the directory query the tab already holds.",
          code: "setComposeOpen(true)  // <NewMessageSheet visible={composeOpen} people={directory.data} />",
        },
        {
          kind: "motion",
          title: "New message slides up from the bottom",
          detail: "The shared Sheet is a Modal that slides in, with a 28pt large title because this is somewhere you go, not a quick choice.",
          enter: "slide-up",
        },
        {
          kind: "effect",
          title: "Picking a person opens the DM",
          detail: "The open-a-DM mutation finds or creates the conversation. If the platform refuses, its own message is shown in a toast and the sheet stays open.",
          code: "openDirect.mutate(person.ref, { onSuccess: (channel) => { setComposeOpen(false); router.push({ pathname: '/channel/[id]', params: { id: channel.id } }) } })",
        },
        {
          kind: "result",
          title: "The conversation is open",
          detail: "The sheet closed as the DM opened. Back on Messages, the disc is where it was, 12pt above the bottom bar.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 560,
              paddingTop: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "fab",
                style: {
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                },
                props: {
                  wiggle: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                  icon: "hash",
                  count: 2,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  icon: "hash",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Kenji Watanabe",
                  leading: "avatar",
                  avatar: {
                    name: "Kenji Watanabe",
                    identity: "indigo",
                  },
                },
              },
            ],
          },
        },
        {
          step: 1,
          press: 0,
          hold: 1100,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 560,
              paddingTop: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "fab",
                style: {
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                },
                props: {
                  wiggle: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                  icon: "hash",
                  count: 2,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  icon: "hash",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Kenji Watanabe",
                  leading: "avatar",
                  avatar: {
                    name: "Kenji Watanabe",
                    identity: "indigo",
                  },
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 2200,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 560,
              paddingTop: "$space.md",
            },
            children: [
              {
                el: "component",
                use: "fab",
                style: {
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                },
                props: {
                  wiggle: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                  icon: "hash",
                  count: 2,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  icon: "hash",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Kenji Watanabe",
                  leading: "avatar",
                  avatar: {
                    name: "Kenji Watanabe",
                    identity: "indigo",
                  },
                },
              },
              {
                el: "component",
                use: "bottom-sheet",
                style: {
                  position: "absolute",
                  inset: 0,
                },
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
                          el: "icon",
                          icon: "search",
                          style: {
                            size: "$icon.size",
                            color: "$fg.faint",
                          },
                        },
                        {
                          el: "input",
                          attrs: {
                            placeholder: "Search people",
                            label: "Search people",
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
                      text: "People",
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
                            name: "Amara Okafor",
                            identity: "green",
                          },
                        },
                        {
                          el: "text",
                          text: "Amara Okafor",
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
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
