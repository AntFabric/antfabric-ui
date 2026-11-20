import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "toast",
  name: "Toast",
  category: "feedback",
  level: "molecule",
  status: "stable",
  description: "A short sentence about something that just happened, on an ink pill that leaves by itself. One at a time. The mark agrees with the sentence — a tick for done, an exclamation for a refusal — and an optional action (Undo) lets you take it back.",
  props: {
    message: {
      type: "string",
      sample: "Moved to Done",
      required: true,
      description: "Past tense for a confirmation, imperative for a fixable refusal, \"what failed + whether to retry\" for a failure. Never an identifier, a status code, a path or a service name.",
    },
    tone: {
      type: "enum",
      options: ["success", "error", "info"],
      default: "success",
      description: "success: a tick on the brand disc. error: an exclamation on the danger disc, announced assertively. info: a neutral mark, for state (offline, refreshing).",
    },
    actionLabel: {
      type: "string",
      default: "",
      description: "One verb, usually Undo. With an action Dismiss shrinks to a ×; give `duration` a longer value for it than for a plain toast.",
    },
    dismissed: {
      type: "boolean",
      default: false,
      description: "Gone: the pill has left (faded and slid back the way it came). What Dismiss, the ×, Undo and, on the phone, a tap on the toast do in the catalogue; in the app the toast unmounts and onDismiss fires.",
    },
    dismissible: {
      type: "boolean",
      default: true,
      platforms: ["web", "desktop"],
      description: "Draws Dismiss. On mobile the whole toast is the dismiss target (tap it).",
    },
    duration: {
      type: "number",
      default: 0,
      description: "How long the toast stays, in milliseconds, before it dismisses itself and fires onDismiss. 0 keeps it until it is dismissed. The clock stops while the pointer is on the toast or focus is inside it (web and desktop) and runs twice as long while a screen reader is on (phone).",
    },
    onAction: {
      type: "event",
    },
    onDismiss: {
      type: "event",
    },
    onPauseChange: {
      type: "event",
      args: "paused: boolean",
      platforms: ["web", "desktop"],
      description: "The pointer or focus entered the toast (true) or both left (false): for an app that keeps its own timer.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The ink pill: a role=status / alert <div> with aria-live, rising in with enter(\"rise\"); Undo, Dismiss and the × are <button>s with hover and focus from useInteraction. Pressing one keeps `dismissed` inside and fades it back down; placement and the timer are the app's",
      import: "import { Toast } from \"@antfabric/ui-react\"",
      notes: [
        "Bottom-centre, 24px up, one at a time. The fixed viewport is pointer-events: none and only the pill takes clicks, so the strip never eats the composer's clicks.",
        "`duration` is the kit's timer: it pauses while the pointer is on the toast or focus is inside it and resumes with the time that was left. Starting it when the tab is visible, and queuing, are the app's.",
        "Browser notifications are a separate, permission-gated channel; a toast is never used to say something the person must see after leaving the tab.",
        "It rises into place from the bottom; Dismiss, the × and Undo set `dismissed`, and it fades back down.",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Reaches Undo and the × while the toast is up (the app can bind F6 or Mod+Z to onAction)",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same pill as web, at desktop density",
      import: "import { Toast } from \"@antfabric/ui-react\"",
      notes: [
        "Today: one ink pill, bottom-centred, 5.2 s, Dismiss on the right. A second toast REPLACES the first (one timer).",
        "The mark follows toastTone (ADR-4734): a failure no longer wears a tick. aria-live follows it too — polite for success, assertive for a refusal.",
        "A progress toast (\"Refreshing…\", ADR-0783) has no timer and a 700 ms floor; finishing never wipes a different toast raised meanwhile.",
        "Dismiss's fill is derived from the toast's own ink, so it survives the inverse surface turning light in the dark themes.",
        "Copy rules live in toast-copy.ts: names cut to 32 characters on a word boundary, refusal codes mapped to plain sentences, log-line-shaped upstream messages never shown.",
        "It rises into place from the bottom; Dismiss, the × and Undo set `dismissed`, and it fades back down.",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Reaches Undo and the × while the toast is up (the app can bind F6 or Mod+Z to onAction)",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A Pressable pill (the whole toast dismisses) that drops in with <Enter motion=\"drop\"> and fades back up with Animated.timing; Undo is its own Pressable and an accessibility action; placement, the queue and the timer are the app's",
      import: "import { Toast } from \"@antfabric/ui-react-native\"",
      notes: [
        "At the TOP, at the safe-area inset + 8pt, 12pt from each side: at the bottom it sat over the channel composer and swallowed the tap meant for Send.",
        "A FIFO queue, one at a time, 4 s each; tapping the toast dismisses it. Mounted under the auth overlay, so a toast never covers sign-in.",
        "No Dismiss button and no hover; the action chip (Undo) takes its own tap and does not dismiss-then-act twice.",
        "Before ToastHost existed, every toast() call went into an array nothing drew — a failed DM open said nothing at all.",
        "It drops in from the top; a tap anywhere on it (or on Undo) sets `dismissed`, and it fades back up.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Dismisses",
        },
        {
          gesture: "Swipe up",
          action: "Dismisses",
        },
        {
          gesture: "Tap Undo",
          action: "Undoes and dismisses, with a light haptic",
        },
      ],
    },
  },
  a11y: {
    role: "status",
    notes: [
      "The message is spoken when the toast appears or its text changes, through the page's own announcer on the web (success and info politely, error assertively) and through the screen reader's announcement call on the phone, where iOS has no live regions. The toast itself is not a live region: one that arrives holding its text is not read.",
      "A toast never takes focus. On the web its action and × are buttons in the tab order; once dismissed the toast is inert, so they leave the tab order and the accessibility tree. On the phone Undo is also an accessibility action on the toast and its touch area is 44pt.",
      "`duration` (0 by default, so no timer) pauses while the pointer is on the toast or focus is inside it (WCAG 2.2.1) and, on the phone, doubles while a screen reader is on. F6, Mod+Z and Esc are not built in: an app that wants them binds them to onAction and onDismiss.",
    ],
  },
  examples: [
    {
      name: "Confirmation",
      props: {},
    },
    {
      name: "Refusal",
      props: {
        message: "Your message did not send. Try again.",
        tone: "error",
      },
    },
    {
      name: "With Undo",
      props: {
        message: "Muted #design-crit",
        actionLabel: "Undo",
      },
    },
    {
      name: "Progress (no timer)",
      props: {
        message: "Refreshing…",
        tone: "info",
        dismissible: false,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Phone — confirmation",
      props: {
        message: "Link copied",
      },
      platforms: ["mobile"],
      width: 351,
    },
    {
      name: "Phone — refusal",
      props: {
        message: "Couldn't open the conversation. Try again.",
        tone: "error",
      },
      platforms: ["mobile"],
      width: 351,
    },
    {
      name: "Phone — Undo",
      props: {
        message: "Marked 14 conversations as read",
        actionLabel: "Undo",
      },
      platforms: ["mobile"],
      width: 351,
    },
    {
      name: "Phone — info",
      props: {
        message: "You're offline. Showing what's on this device.",
        tone: "info",
      },
      platforms: ["mobile"],
      width: 351,
    },
  ],
  matrix: [
    {
      prop: "tone",
    },
  ],
  edgeCases: [
    {
      title: "Several toasts at once",
      platforms: ["web", "desktop", "mobile"],
      handling: "Never a stack. Web and desktop show the newest and drop the older — except that a success never replaces an error still in its first 2 s; it waits behind it. Mobile queues oldest-first, 4 s each. Identical messages raised within the window collapse into one (\"Link copied\" three times shows once).",
    },
    {
      title: "Screen reader",
      platforms: ["web", "desktop", "mobile"],
      handling: "Announced once, politely for success and info, assertively for errors, without moving focus. With `duration` set, the clock pauses while the toast is focused and, on the phone, doubles while a screen reader is on. Undo is also an accessibility action on mobile (VoiceOver rotor / TalkBack actions menu).",
      example: {
        name: "Assertive refusal",
        props: {
          message: "Only an owner or admin can add someone to a private channel. Ask one of them.",
          tone: "error",
        },
      },
    },
    {
      title: "Undo, and the time to use it",
      platforms: ["web", "desktop", "mobile"],
      handling: "An Undo toast should be given a long `duration` (8 s is the product's); the clock pauses on hover and focus (WCAG 2.2.1). The action happens immediately and Undo reverses it — the toast is never a confirmation dialog in disguise. After it leaves, the action is final; Undo never appears for something that cannot be reversed (sending a message).",
      example: {
        name: "Undo, focused",
        props: {
          message: "Left #release-train",
          actionLabel: "Undo",
        },
        state: "focus",
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "Offline",
      platforms: ["desktop", "mobile"],
      handling: "Connectivity is said once by the connection banner, not by a toast per failed request. Desktop sends while offline go to the outbox without a toast. The phone refuses a send while offline and says so once, as info: \"You're offline. Showing what's on this device.\" A burst of failures on reconnect is collapsed to one sentence.",
      example: {
        name: "Offline, once",
        props: {
          message: "You're offline. Showing what's on this device.",
          tone: "info",
        },
        width: 351,
        platforms: ["mobile"],
      },
    },
    {
      title: "Window hidden in the tray",
      platforms: ["desktop"],
      handling: "Do not show it. A toast nobody can see is not saved for later either — five stale toasts on reopen are noise. If the event matters to someone who is away (a message failed to send, a mention), it goes out as an OS notification through the notification settings; otherwise nothing. Same while the window is minimised or on another Space.",
    },
    {
      title: "Tab in the background",
      platforms: ["web"],
      handling: "The toast is queued and its timer starts only when the tab becomes visible, so a 5 s message is not gone before anyone looks. Anything that must reach a person who left the tab is a browser notification (if granted) or the tab title count — never a toast.",
    },
    {
      title: "Mobile app backgrounded or killed",
      platforms: ["mobile"],
      handling: "Toasts are not drawn while the app is in the background, and anything older than 10 s is dropped from the queue on return. A failed send becomes a local notification only if the app is backgrounded when it fails; a killed app shows nothing — the message itself is marked \"Not sent\" in the conversation.",
    },
    {
      title: "Long or technical text",
      platforms: ["web", "desktop", "mobile"],
      handling: "Two lines at most, then an ellipsis. Names inside are cut to 32 characters on a word boundary; an upstream error that reads like a log line (a path, a uuid, an HTTP status, \"the chat service\") is replaced by the caller's plain sentence and sent to the console.",
      example: {
        name: "Two lines",
        props: {
          message: "Somebody you mentioned is no longer in this channel. Add them again, or remove the mention.",
          tone: "error",
        },
        platforms: ["web", "desktop"],
      },
    },
    {
      title: "Over the composer",
      platforms: ["web", "desktop", "mobile"],
      handling: "Web and desktop sit bottom-centre but only the pill takes pointer events. Mobile sits at the top for exactly this reason; with the keyboard open it stays at the top rather than riding the keyboard.",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "The inverse surface turns LIGHT in the dark themes, so the pill becomes light with dark text. The chips are mixed from the toast's own ink rather than white, so Dismiss never disappears. The marks sit on solid brand and danger discs, which keep their contrast on either pill; the phone's bare error glyph must take the light-theme danger ink on that light pill, not the dark theme's pale red.",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop", "mobile"],
      handling: "No slide: the toast fades in and out (150 ms). Timers are unchanged.",
    },
  ],
  related: ["inline-banner", "os-notification", "connection-banner"],
  flows: [
    {
      id: "confirm-with-toast",
      title: "An action confirms with a toast, which leaves by itself",
      description: "A toast says what just happened, after it happened. One at a time: it rises from the bottom on web and desktop and drops from the top on the phone, and goes when its time is up or it is dismissed.",
      platforms: ["web", "desktop", "mobile"],
      width: 420,
      steps: [
        {
          kind: "trigger",
          title: "A ticket is dropped on Done",
          detail: "The move happens first, and only a move that succeeded says so. A parent with open subtasks is refused, and that refusal is the only toast.",
          code: "if (!setTaskCol(id, col)) return; showToast(`Moved to ${label}`)",
          platforms: ["desktop"],
        },
        {
          kind: "trigger",
          title: "Saving a channel's settings succeeds",
          code: "update.mutate(patch, { onSuccess: () => toast('Channel updated', 'success'), onError: surface('The channel could not be updated.') });",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "The mutation's onSuccess raises it",
          detail: "After the server agreed, never before.",
          code: "onSuccess: () => toastManager.add({ title: `Moved to ${column}`, type: 'success' })",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "One toast at a time, on one timer",
          detail: "showToast sets the text and its tone and restarts the 5.2 s timer, so a second toast replaces the first. The tone picks the mark and the live region: polite for a success, assertive for a refusal.",
          code: "set({ toast: text, toastTone: tone }); timers.set('toast', () => set({ toast: null }), 5200)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "toast() joins a queue",
          detail: "ToastHost draws the oldest, one at a time, each for 4 s.",
          code: "toast: (message, tone = 'info') => set((s) => ({ toasts: [...s.toasts, { id: uid('toast'), message, tone }] }))",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "It rises from the bottom",
          detail: "Up 14px from a 0.98 scale over the slow duration, bottom-centre. Only the pill takes clicks, so the composer under it still works.",
          enter: "rise",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "It drops in at the top",
          detail: "At the top, under the safe area, so it never covers Send. Today's ToastHost draws it in place without motion; this spec drops it in.",
          enter: "drop",
          platforms: ["mobile"],
        },
        {
          kind: "trigger",
          title: "It's dismissed, or its time runs out",
          detail: "Dismiss on web and desktop; a tap anywhere on it on the phone. Otherwise it leaves by itself: 5.2 s on the desktop, 4 s on the phone. The spec doubles both while a screen reader is on.",
        },
        {
          kind: "event",
          title: "onDismiss fires",
          code: "onDismiss?.()",
        },
        {
          kind: "result",
          title: "It leaves the way it came",
          detail: "Faded and slid back down on web and desktop, back up on the phone, where the next queued toast takes its place.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 260,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "card",
                style: {
                  width: 340,
                },
                props: {
                  level: "inner",
                  children: [
                    {
                      el: "view",
                      style: {
                        direction: "row",
                        align: "center",
                        justify: "space-between",
                        gap: 8,
                      },
                      children: [
                        {
                          el: "text",
                          text: "Ship push opt-in for Android 14",
                          style: {
                            fontSize: "$text.bodySm",
                            fontWeight: "$font.weightSemibold",
                            color: "$fg.strong",
                            truncate: 1,
                          },
                        },
                        {
                          el: "component",
                          use: "tag",
                          props: {
                            label: "In review",
                            tone: "brand",
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
        {
          step: 1,
          press: 0,
          hold: 1100,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 360,
              gap: "$space.lg",
              paddingX: 16,
              paddingTop: 64,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                },
                children: [
                  {
                    el: "text",
                    text: "Channel settings",
                    style: {
                      fontSize: "$text.body",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "button",
                    props: {
                      label: "Save",
                      variant: "ghost",
                      size: "sm",
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "text-field",
                props: {
                  label: "Channel name",
                  value: "release-train",
                  helper: "",
                },
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1300,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 260,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "card",
                style: {
                  width: 340,
                },
                props: {
                  level: "inner",
                  children: [
                    {
                      el: "view",
                      style: {
                        direction: "row",
                        align: "center",
                        justify: "space-between",
                        gap: 8,
                      },
                      children: [
                        {
                          el: "text",
                          text: "Ship push opt-in for Android 14",
                          style: {
                            fontSize: "$text.bodySm",
                            fontWeight: "$font.weightSemibold",
                            color: "$fg.strong",
                            truncate: 1,
                          },
                        },
                        {
                          el: "component",
                          use: "tag",
                          props: {
                            label: "In review",
                            tone: "brand",
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
        {
          step: 5,
          hold: 1700,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 260,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "card",
                style: {
                  width: 340,
                },
                props: {
                  level: "inner",
                  children: [
                    {
                      el: "view",
                      style: {
                        direction: "row",
                        align: "center",
                        justify: "space-between",
                        gap: 8,
                      },
                      children: [
                        {
                          el: "text",
                          text: "Ship push opt-in for Android 14",
                          style: {
                            fontSize: "$text.bodySm",
                            fontWeight: "$font.weightSemibold",
                            color: "$fg.strong",
                            truncate: 1,
                          },
                        },
                        {
                          el: "component",
                          use: "tag",
                          props: {
                            label: "Done",
                            tone: "success",
                          },
                        },
                      ],
                    },
                  ],
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
                  message: "Moved to Done",
                  dismissed: false,
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 360,
              gap: "$space.lg",
              paddingX: 16,
              paddingTop: 64,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                },
                children: [
                  {
                    el: "text",
                    text: "Channel settings",
                    style: {
                      fontSize: "$text.body",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "button",
                    props: {
                      label: "Save",
                      variant: "ghost",
                      size: "sm",
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "text-field",
                props: {
                  label: "Channel name",
                  value: "release-train",
                  helper: "",
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  position: "absolute",
                  top: 8,
                  left: 12,
                  right: 12,
                },
                props: {
                  message: "Channel updated",
                  dismissed: false,
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: 0,
          hold: 1000,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 260,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "card",
                style: {
                  width: 340,
                },
                props: {
                  level: "inner",
                  children: [
                    {
                      el: "view",
                      style: {
                        direction: "row",
                        align: "center",
                        justify: "space-between",
                        gap: 8,
                      },
                      children: [
                        {
                          el: "text",
                          text: "Ship push opt-in for Android 14",
                          style: {
                            fontSize: "$text.bodySm",
                            fontWeight: "$font.weightSemibold",
                            color: "$fg.strong",
                            truncate: 1,
                          },
                        },
                        {
                          el: "component",
                          use: "tag",
                          props: {
                            label: "Done",
                            tone: "success",
                          },
                        },
                      ],
                    },
                  ],
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
                  message: "Moved to Done",
                  dismissed: false,
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "toast",
          hold: 1000,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 360,
              gap: "$space.lg",
              paddingX: 16,
              paddingTop: 64,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                },
                children: [
                  {
                    el: "text",
                    text: "Channel settings",
                    style: {
                      fontSize: "$text.body",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "button",
                    props: {
                      label: "Save",
                      variant: "ghost",
                      size: "sm",
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "text-field",
                props: {
                  label: "Channel name",
                  value: "release-train",
                  helper: "",
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  position: "absolute",
                  top: 8,
                  left: 12,
                  right: 12,
                },
                props: {
                  message: "Channel updated",
                  dismissed: false,
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1600,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 260,
              align: "center",
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "card",
                style: {
                  width: 340,
                },
                props: {
                  level: "inner",
                  children: [
                    {
                      el: "view",
                      style: {
                        direction: "row",
                        align: "center",
                        justify: "space-between",
                        gap: 8,
                      },
                      children: [
                        {
                          el: "text",
                          text: "Ship push opt-in for Android 14",
                          style: {
                            fontSize: "$text.bodySm",
                            fontWeight: "$font.weightSemibold",
                            color: "$fg.strong",
                            truncate: 1,
                          },
                        },
                        {
                          el: "component",
                          use: "tag",
                          props: {
                            label: "Done",
                            tone: "success",
                          },
                        },
                      ],
                    },
                  ],
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
                  message: "Moved to Done",
                  dismissed: true,
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1600,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 360,
              gap: "$space.lg",
              paddingX: 16,
              paddingTop: 64,
            },
            children: [
              {
                el: "view",
                style: {
                  direction: "row",
                  align: "center",
                  justify: "space-between",
                },
                children: [
                  {
                    el: "text",
                    text: "Channel settings",
                    style: {
                      fontSize: "$text.body",
                      fontWeight: "$font.weightSemibold",
                      color: "$fg.strong",
                    },
                  },
                  {
                    el: "component",
                    use: "button",
                    props: {
                      label: "Save",
                      variant: "ghost",
                      size: "sm",
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "text-field",
                props: {
                  label: "Channel name",
                  value: "release-train",
                  helper: "",
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  position: "absolute",
                  top: 8,
                  left: 12,
                  right: 12,
                },
                props: {
                  message: "Channel updated",
                  dismissed: true,
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
