import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "button",
  name: "Button",
  category: "actions",
  level: "atom",
  status: "stable",
  description: "The one way to start an action. Flat in every tier, with an optional icon either side and a loading state that keeps its width so the layout never jumps.",
  props: {
    label: {
      type: "string",
      sample: "Send invite",
      required: true,
    },
    variant: {
      type: "enum",
      options: ["primary", "secondary", "ghost", "soft", "ink", "danger"],
      default: "primary",
      description: "primary is the brand fill — one per view. danger is for an action that cannot be undone.",
    },
    size: {
      type: "enum",
      options: ["sm", "md", "lg"],
      default: "md",
    },
    iconLeading: {
      type: "icon",
      default: "",
    },
    iconTrailing: {
      type: "icon",
      default: "",
    },
    loading: {
      type: "boolean",
      default: false,
      description: "Shows a spinner in place of the leading icon and blocks presses. The label stays, so the width does not change.",
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    full: {
      type: "boolean",
      default: false,
      description: "Stretches to its container. The default on mobile sheets and forms.",
    },
    shortcut: {
      type: "string",
      default: "",
      platforms: ["web", "desktop"],
      description: "A keyboard hint drawn after the label, written once as Mod+Enter; each OS gets its own glyphs.",
    },
    type: {
      type: "enum",
      options: ["button", "submit", "reset"],
      default: "button",
      platforms: ["web", "desktop"],
      description: "What the button does inside a form: submit sends it, reset clears it, button (the default) does neither. A loading submit button does not submit.",
    },
    onPress: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <button>, inline styles over `t`; hover, press and keyboard focus from useInteraction",
      import: "import { Button } from \"@antfabric-ui/react\"",
      notes: [
        "A link styled as a button is <a href>, not a button with onClick — middle-click and ⌘-click must open a tab.",
        "Shortcut hints are shown only when the shortcut is NOT one the browser owns (⌘W, ⌘T, ⌘N, ⌘L are the browser's).",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Activates",
        },
        {
          keys: "Tab",
          action: "Focus ring drawn only for keyboard focus (:focus-visible)",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <button> as the web, at desktop density; shortcut glyphs per OS from usePlatform()",
      import: "import { Button } from \"@antfabric-ui/react\"",
      notes: [
        "Today's desktop Button has no loading state; this spec adds one so a slow save no longer needs a separate spinner.",
        "Shortcut hints render with native glyphs: ⌘↩ on macOS, Ctrl+Enter on Windows and Linux.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Activates",
        },
        {
          keys: "Mod+Enter",
          action: "Activates the primary button of a dialog or composer",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable + Text over createStyles(t), font(\"semibold\"), ActivityIndicator while loading; scales to 0.97 on press-in",
      import: "import { Button } from \"@antfabric-ui/react-native\"",
      notes: [
        "md and lg are the 56pt call-to-action used on V2; sm (34pt) is for inline actions only and gets hitSlop to reach 44pt.",
        "Light impact haptic on press-in, never on disabled.",
        "No hover state exists on a phone — the React Native kit has none.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Activates; scale to 0.97 on press-in",
        },
        {
          gesture: "Press and drag off",
          action: "Cancels",
        },
      ],
    },
  },
  a11y: {
    role: "button",
    label: "{label}",
    notes: [
      "Loading sets aria-busy and aria-disabled (the phone: accessibilityState.busy) and keeps the button in the tab order, so focus is not lost; only `disabled` removes it. Pressing a loading button does nothing, and the wait is announced once, politely, as \"Loading\". The spinner itself is hidden from assistive technology.",
      "Icon-only buttons are IconButton, which requires a label.",
      "`type=\"submit\"` makes it the form's submit button; a loading submit button does not submit.",
      "On the phone a small button (sm) keeps its drawn size and its touch area is grown to 44pt.",
    ],
  },
  examples: [
    {
      name: "Primary",
      props: {
        label: "Send invite",
        iconLeading: "send",
      },
    },
    {
      name: "Secondary",
      props: {
        label: "Cancel",
        variant: "secondary",
      },
    },
    {
      name: "Danger",
      props: {
        label: "Delete channel",
        variant: "danger",
        iconLeading: "trash-2",
      },
    },
    {
      name: "Loading",
      props: {
        label: "Saving",
        loading: true,
      },
    },
    {
      name: "With shortcut",
      props: {
        label: "Send",
        variant: "ink",
        shortcut: "Mod+Enter",
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Ink, pressed",
      description: "Ink turns to the brand colour on hover and a step deeper while pressed, like the other variants.",
      props: {
        label: "Send",
        variant: "ink",
      },
      state: "pressed",
    },
    {
      name: "Full width",
      props: {
        label: "Continue",
        full: true,
        size: "lg",
      },
      width: 320,
    },
  ],
  matrix: [
    {
      prop: "variant",
    },
    {
      prop: "size",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "Label longer than the space",
      platforms: ["web", "desktop", "mobile"],
      handling: "One line, truncated with an ellipsis. The full label stays the accessible name; on web and desktop it is also the tooltip.",
      example: {
        name: "Long label",
        props: {
          label: "Invite everyone in Platform Engineering and Design to this channel",
        },
        width: 260,
      },
    },
    {
      title: "Double press while a request is in flight",
      platforms: ["web", "desktop", "mobile"],
      handling: "loading disables the button the moment the press lands; the caller sets it synchronously, before awaiting. Requests carry an idempotency key so a retry after a network drop cannot post twice.",
      example: {
        name: "In flight",
        props: {
          label: "Send invite",
          loading: true,
        },
      },
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Height is a minimum, not fixed — the label grows and the pill grows with it. Font scale is capped at 1.3× (maxFontSizeMultiplier) as in the current app.",
    },
    {
      title: "Shortcut the browser already owns",
      platforms: ["web"],
      handling: "Never advertise ⌘W / ⌘T / ⌘N / ⌘L / ⌘R on the web — the browser takes them first. The desktop app may bind them; the web app uses an alternative and the hint shows that.",
    },
    {
      title: "Right-to-left languages",
      platforms: ["web", "desktop", "mobile"],
      handling: "Leading and trailing icons swap sides; directional icons (arrow-right, send) mirror. Styles use start/end, never left/right.",
    },
  ],
  related: ["icon-button", "segmented-control"],
  flows: [
    {
      id: "cta-opens-confirm",
      title: "A destructive CTA opens a confirm",
      description: "Anything that removes something asks first. The CTA only opens the confirm; the confirm's own button does the work, and the screen shows the outcome.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The screen holds the task the CTA acts on",
          detail: "The task drawer is open on a saved task; a task still being created has nothing to delete, so its Delete does nothing.",
          code: "const task = get().tasks.find((t) => t.id === id)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The button reads the mutation's state",
          detail: "Leave channel shows a spinner while the request is in flight and can't be pressed until your identity has loaded.",
          code: "loading={leave.isPending}  disabled={leave.isPending || self === null}",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route's mutation drives the button",
          detail: "The task route owns a TanStack Query mutation; the button takes its pending state, the same way the phone does.",
          code: "const del = useMutation({ mutationFn: archiveTask })  // loading={del.isPending}",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The CTA is pressed",
          detail: "A click, Enter or Space; a tap on the phone. While loading or disabled the press does nothing.",
        },
        {
          kind: "event",
          title: "onPress fires",
          detail: "The button carries no knowledge of what it deletes; the screen's handler decides.",
          code: "onPress?.()",
        },
        {
          kind: "state",
          title: "The store opens the confirm",
          detail: "The confirm is one dialog for the whole app, driven by a single store field: the title, the copy naming what's lost, the CTA, and what to run.",
          code: "set({ confirmDlg: { title: 'Delete this task?', body, cta: 'Delete task', act } })",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The screen opens the confirm sheet",
          detail: "The settings screen keeps which confirm is open in local state; the sheet is visible while it matches.",
          code: "setConfirm('leave')  // <ConfirmSheet visible={confirm === 'leave'} />",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The scrim fades in and the dialog pops",
          detail: "The scrim fades over the page while the card pops from the centre. Focus moves into the dialog and is trapped there until it closes; Escape or a click on the scrim cancels.",
          enter: "pop",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The sheet slides up from the bottom",
          detail: "The phone uses a sheet, not a centred dialog: the scrim fades and the sheet slides up within thumb reach. A swipe down or a tap on the scrim cancels.",
          enter: "slide-up",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "The person confirms",
          detail: "The confirm's own button, which names the action again: Delete task, Leave channel. Cancel is the quiet one beside it.",
        },
        {
          kind: "effect",
          title: "The dialog closes, then the task goes",
          detail: "The task leaves every list at once and a toast confirms. The archive runs after; if the server refuses, the task comes back and the toast says why.",
          code: "runConfirm: set({ confirmDlg: null }); c.act()  // tasks.filter(...) → archiveTask(id).catch(rollback)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "effect",
          title: "The sheet closes and the request runs",
          detail: "Not optimistic: leaving changes what the server lets you read, so the screen waits. Leave channel shows its spinner until the answer arrives.",
          code: "leave.mutate(self, { onSuccess, onError: surface('You could not leave this channel.') })",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "A toast says it's done",
          detail: "Ticket deleted. The form and the ticket's detail panel both close, whichever one the delete started from, because the row they describe is gone.",
          code: "showToast('Ticket deleted')",
          platforms: ["web", "desktop"],
        },
        {
          kind: "result",
          title: "A toast says you left, and the list comes back",
          detail: "You left #release-train, and the screen goes back to the channel list rather than to the channel: a private channel is gone from it now, and a public one is a join prompt.",
          code: "toast(`You left #${name}`, 'success'); router.replace('/(tabs)/channels')",
          platforms: ["mobile"],
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 340,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                style: {
                  alignSelf: "center",
                },
                props: {
                  label: "Delete task",
                  variant: "danger",
                  iconLeading: "trash-2",
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 0,
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 340,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                style: {
                  alignSelf: "center",
                },
                props: {
                  label: "Delete task",
                  variant: "danger",
                  iconLeading: "trash-2",
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1700,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 340,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                style: {
                  alignSelf: "center",
                },
                props: {
                  label: "Delete task",
                  variant: "danger",
                  iconLeading: "trash-2",
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 9,
          press: 2,
          hold: 1000,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 340,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                style: {
                  alignSelf: "center",
                },
                props: {
                  label: "Delete task",
                  variant: "danger",
                  iconLeading: "trash-2",
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {},
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 340,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                style: {
                  alignSelf: "center",
                },
                props: {
                  label: "Delete task",
                  variant: "danger",
                  iconLeading: "trash-2",
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  position: "absolute",
                  bottom: 16,
                },
                props: {
                  message: "Ticket deleted",
                  tone: "success",
                  dismissible: false,
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              paddingX: 16,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Leave channel",
                  variant: "secondary",
                  iconLeading: "log-out",
                  full: true,
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: 0,
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              paddingX: 16,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Leave channel",
                  variant: "secondary",
                  iconLeading: "log-out",
                  full: true,
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              paddingX: 16,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Leave channel",
                  variant: "secondary",
                  iconLeading: "log-out",
                  full: true,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                  width: "100%",
                },
                props: {
                  title: "Leave #release-train?",
                  body: "You can join it again from the channels list.",
                  icon: "log-out",
                  confirmLabel: "Leave channel",
                },
              },
            ],
          },
        },
        {
          step: 9,
          press: 2,
          hold: 1000,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              paddingX: 16,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Leave channel",
                  variant: "secondary",
                  iconLeading: "log-out",
                  full: true,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                  width: "100%",
                },
                props: {
                  title: "Leave #release-train?",
                  body: "You can join it again from the channels list.",
                  icon: "log-out",
                  confirmLabel: "Leave channel",
                },
              },
            ],
          },
        },
        {
          step: 11,
          hold: 1500,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              paddingX: 16,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Leave channel",
                  variant: "secondary",
                  iconLeading: "log-out",
                  full: true,
                  loading: true,
                },
              },
            ],
          },
        },
        {
          step: 13,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              paddingX: 16,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "button",
                props: {
                  label: "Leave channel",
                  variant: "secondary",
                  iconLeading: "log-out",
                  full: true,
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  position: "absolute",
                  bottom: 16,
                  alignSelf: "center",
                },
                props: {
                  message: "You left #release-train",
                  tone: "success",
                  dismissible: false,
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
