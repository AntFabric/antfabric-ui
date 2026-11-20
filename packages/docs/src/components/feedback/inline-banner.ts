import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "inline-banner",
  name: "Inline banner",
  category: "feedback",
  level: "molecule",
  status: "stable",
  description: "A notice that sits inside a pane, above the thing it is about, and stays as long as it is true: you are offline, you are previewing a channel, notifications are off, Fabric left you a note. Tone says who it is from — neutral is the state you are in, brand is Fabric.",
  props: {
    tone: {
      type: "enum",
      options: ["neutral", "brand", "warning", "danger"],
      default: "neutral",
      description: "neutral: the state you are in. brand: the product's assistant did this — never use it for an outage, or the outage reads as the agent's. warning: something will go wrong if left (notifications off, storage nearly full). danger: something already failed and needs you.",
    },
    icon: {
      type: "icon",
      sample: "wifi-off",
      description: "The glyph before the message. Left out, the tone's own: info for neutral and brand, triangle-alert for warning, circle-alert for danger; an empty string draws none.",
    },
    title: {
      type: "string",
      default: "",
      sample: "You're offline",
      description: "Optional bold first line. Mobile footnote banners leave it out — a heading turns a footnote into a section.",
    },
    message: {
      type: "string",
      sample: "Showing what's on this device. New messages arrive when you reconnect.",
      required: true,
    },
    actionLabel: {
      type: "string",
      default: "",
      description: "At most one action; a second belongs on the screen the action opens.",
    },
    actionVariant: {
      type: "enum",
      options: ["secondary", "primary"],
      default: "secondary",
      description: "primary only when the banner holds the view's one primary action (Join channel).",
    },
    dismissible: {
      type: "boolean",
      default: false,
      description: "Tips and announcements can be dismissed; a banner that states a fact (offline, archived, not a member) cannot, because it is true until it is not.",
    },
    dismissed: {
      type: "boolean",
      default: false,
      description: "Dismissed: the banner fades out. What the × does in the catalogue; in the app the banner unmounts, the pane closes the gap and onDismiss fires.",
    },
    onAction: {
      type: "event",
    },
    onDismiss: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"status\" <div> that fades in with enter(\"fade\"), with the kit's Button (sm) and IconButton (Dismiss); the × keeps `dismissed` inside and fades it out; inline styles over `t`",
      import: "import { InlineBanner } from \"@antfabric-ui/react\"",
      notes: [
        "Below 420px of container width (a container query, not the viewport) the action wraps under the text.",
        "Browser-permission banners deep-link nowhere — a browser cannot open its own site settings — so they say where to click: \"Click the lock in the address bar, then Notifications.\"",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <div> as web, at desktop density",
      import: "import { InlineBanner } from \"@antfabric-ui/react\"",
      notes: [
        "Neutral is the WHITE card surface, not recessed (owner, 2026-09-03): on the warm page a cool recessed grey reads as a dirty patch, not a layer.",
        "Its rim is border.subtle, the same as Card's — a heavier rim on the one box that is a notice reads as emphasis nobody asked for.",
        "warning and danger are new in this spec; the desktop has neutral and brand today.",
        "Permission banners open the OS page directly: x-apple.systempreferences:com.apple.Notifications-Settings on macOS, ms-settings:notifications on Windows.",
        "It fades in where it appears, and the × of a dismissible banner sets `dismissed`, which fades it out.",
      ],
    },
    mobile: {
      status: "ready",
      base: "A View (role status, polite live region) with <Enter motion=\"fade\">, the action under the message as the kit's Button (sm) and the kit's IconButton for Dismiss; dismissing fades it with Animated.timing",
      import: "import { InlineBanner } from \"@antfabric-ui/react-native\"",
      notes: [
        "Today's InfoBanner: a sunken strip (surface.muted), 12 × 8 padding, radius 8, a 16pt faint icon nudged 2pt down against the first line, one sentence and no heading. It has no bottom margin — the next SectionHeader owns the gap.",
        "A title line is allowed for state banners (ConnectivityBanner has one); footnote banners leave it out.",
        "The action sits under the message, aligned with the text; a phone is too narrow for text and a button side by side.",
        "It fades in where it appears, and the × of a dismissible banner sets `dismissed`, which fades it out.",
      ],
      gestures: [
        {
          gesture: "Tap the action",
          action: "Runs it; the banner itself is not a button",
        },
      ],
    },
  },
  a11y: {
    role: "status (alert for danger on the phone)",
    notes: [
      "The title and message are spoken when the banner appears or its text changes. On the web that goes through the page's own announcer (polite, assertive for danger): the banner is not a live region itself, because one that arrives holding its text is not read. On the phone the screen reader's announcement call speaks it (iOS has no live regions) and the view carries role=status, or alert for danger.",
      "Something that failed (danger) is announced at once; the other tones wait for a pause.",
      "Tone is never the only signal — the icon and the words carry it. The dismiss button is named \"Dismiss\", not \"×\". Once dismissed the banner is inert on the web (its buttons leave the tab order) and hidden from the accessibility tree on both.",
    ],
  },
  examples: [
    {
      name: "Offline",
      props: {},
      width: 480,
    },
    {
      name: "Note from Fabric",
      props: {
        tone: "brand",
        icon: "sparkles",
        title: "Fabric drafted a reply",
        message: "Review it before it goes to #platform-eng.",
        actionLabel: "Review draft",
      },
      width: 480,
    },
    {
      name: "Not in this channel",
      props: {
        icon: "",
        title: "You're not in this channel",
        message: "Join it to post and to keep reading.",
        actionLabel: "Join channel",
        actionVariant: "primary",
      },
      platforms: ["web", "desktop"],
      width: 560,
    },
    {
      name: "Notifications off (macOS)",
      props: {
        tone: "warning",
        icon: "bell-off",
        title: "Notifications are off for AntFabric",
        message: "You won't hear about mentions while the window is closed or hidden.",
        actionLabel: "Open System Settings",
      },
      platforms: ["desktop"],
      os: "mac",
      width: 560,
    },
    {
      name: "Notifications blocked (browser)",
      props: {
        tone: "warning",
        icon: "bell-off",
        title: "This browser is blocking notifications",
        message: "Click the lock in the address bar, then allow Notifications to hear about mentions in a background tab.",
      },
      platforms: ["web"],
      width: 560,
    },
    {
      name: "Refresh failed",
      props: {
        tone: "danger",
        icon: "circle-alert",
        title: "Couldn't refresh conversations",
        message: "Showing what was on this device at 10:42. Trying again in 30 seconds.",
        actionLabel: "Try again",
      },
      width: 480,
    },
    {
      name: "Tip, dismissible",
      props: {
        tone: "brand",
        icon: "sparkles",
        title: "",
        message: "Ask Fabric to summarise any thread — type /summarise.",
        dismissible: true,
      },
      width: 480,
    },
    {
      name: "Archived",
      props: {
        icon: "archive",
        title: "This channel has been archived",
        message: "You can still read and search it.",
      },
      width: 480,
    },
    {
      name: "Phone footnote",
      props: {
        icon: "info",
        title: "",
        message: "Recordings stay on this phone until they finish uploading.",
      },
      platforms: ["mobile"],
      width: 343,
    },
    {
      name: "Phone, notifications off",
      props: {
        tone: "warning",
        icon: "bell-off",
        title: "Notifications are off",
        message: "Turn them on to hear about mentions and DMs.",
        actionLabel: "Open Settings",
      },
      platforms: ["mobile"],
      width: 343,
    },
  ],
  matrix: [
    {
      prop: "tone",
    },
  ],
  edgeCases: [
    {
      title: "Long message in a narrow pane",
      platforms: ["web", "desktop", "mobile"],
      handling: "The message wraps — it is never truncated, because the whole point is to be read. Under 420px of container width the web and desktop kits move the action below the text (a container query the static catalogue cannot draw); the phone always puts it below.",
      example: {
        name: "Narrow",
        props: {
          tone: "danger",
          icon: "circle-alert",
          title: "Couldn't send 3 messages",
          message: "They are saved on this device and will be retried when the connection is stable.",
          actionLabel: "Retry now",
        },
        width: 320,
      },
    },
    {
      title: "More than one banner wants the pane",
      platforms: ["web", "desktop", "mobile"],
      handling: "One banner per pane. The most urgent wins (danger, then warning, then neutral state, then brand); the rest wait. Offline outranks a Fabric tip; a tip never sits on top of an outage.",
    },
    {
      title: "Dismissed on one device",
      platforms: ["web", "desktop", "mobile"],
      handling: "A dismissed tip stays dismissed for that person on every device (stored with their preferences, not only in localStorage). State banners cannot be dismissed, so there is nothing to sync for them.",
    },
    {
      title: "Back online",
      platforms: ["desktop", "mobile"],
      handling: "The offline banner leaves quietly once the resync lands — no \"You're back online\" toast. If messages were queued, one toast says what happened: \"3 messages sent\".",
    },
    {
      title: "Notifications denied",
      platforms: ["web", "desktop", "mobile"],
      handling: "Desktop and mobile deep-link to the OS settings page (macOS System Settings, Windows ms-settings:notifications, iOS/Android app settings via Linking.openSettings). A browser that has denied permission will never prompt again, so the web banner explains the one manual step instead of offering a button that cannot work.",
    },
    {
      title: "Brand is not a severity",
      platforms: ["web", "desktop", "mobile"],
      handling: "brand means Fabric did this. A brand-coloured banner about a network outage attributes the outage to the agent, so outages, failures and permission problems are neutral, warning or danger — never brand.",
    },
    {
      title: "Screen reader",
      platforms: ["web", "desktop", "mobile"],
      handling: "Announced once when it appears (polite), never again on re-render. A banner whose action is the view's primary action (Join channel) is also reachable as the first control after the pane heading.",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "Each tone uses its theme's soft fill (brand #382525, warning #372e1c, danger #362124) and the rim is mixed from the tone's own ink, so it reads as a layer on charcoal without a bright outline.",
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "The icon leads on the right; the action and the dismiss button sit at the left end.",
    },
  ],
  related: ["toast", "empty-state", "connection-banner", "card"],
  flows: [
    {
      id: "try-again-from-banner",
      title: "A failed read says so, and Try again reads again",
      description: "When a section can't load, a neutral banner takes the list's place with one action. It can't be dismissed, because it is true until the read succeeds.",
      platforms: ["web", "desktop"],
      width: 480,
      steps: [
        {
          kind: "data",
          title: "Settings asks for your saved preferences once",
          detail: "Memory in Settings lists what the assistant has been asked to remember. The read is made once; 'loading' and 'loaded' are never asked again.",
          code: "if (!b || status === 'loading' || status === 'loaded') return",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The section's query loads them",
          code: "const prefs = useQuery(memoryPreferencesQuery)",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The read fails",
          detail: "The backend is restarting, or the connection dropped.",
        },
        {
          kind: "state",
          title: "The status becomes error, never an empty list",
          detail: "An unreachable backend must not render Nothing saved yet; that is a different, real state. The banner's sentence is the caller's own plain one.",
          code: "set({ userMemoryPreferences: null, userMemoryPreferencesStatus: 'error', userMemoryPreferencesError: outcomeOf(thrown, 'Your preferences could not be loaded.').message ?? null })",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The query is in error with no data",
          code: "if (prefs.isError) return <InlineBanner message=\"Your preferences could not be loaded.\" actionLabel=\"Try again\" onAction={() => prefs.refetch()} />",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The banner fades in where the list would be",
          detail: "Neutral, because failing to load is the state you're in, not something Fabric did.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "Try again is pressed",
        },
        {
          kind: "event",
          title: "onAction fires",
          code: "onAction?.()",
        },
        {
          kind: "effect",
          title: "The same read runs again",
          detail: "'error' is the one status that may be asked again, so the button needs no guard of its own: a second press while it loads does nothing.",
        },
        {
          kind: "result",
          title: "The banner goes and the preferences take its place",
          detail: "A slow read shows three preference rows as a skeleton first, after 300 ms.",
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
              gap: "$space.sm",
              width: 480,
            },
            children: [
              {
                el: "text",
                text: "What the assistant remembers",
                style: {
                  fontSize: "$text.body",
                  fontWeight: "$font.weightSemibold",
                  color: "$fg.strong",
                },
              },
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "row",
                  lead: "none",
                  lines: 1,
                  label: "Loading your preferences…",
                  rows: [
                    {
                      title: 240,
                      subtitle: 0,
                    },
                    {
                      title: 188,
                      subtitle: 0,
                    },
                    {
                      title: 216,
                      subtitle: 0,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 480,
            },
            children: [
              {
                el: "text",
                text: "What the assistant remembers",
                style: {
                  fontSize: "$text.body",
                  fontWeight: "$font.weightSemibold",
                  color: "$fg.strong",
                },
              },
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "row",
                  lead: "none",
                  lines: 1,
                  label: "Loading your preferences…",
                  rows: [
                    {
                      title: 240,
                      subtitle: 0,
                    },
                    {
                      title: 188,
                      subtitle: 0,
                    },
                    {
                      title: 216,
                      subtitle: 0,
                    },
                  ],
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
              gap: "$space.sm",
              width: 480,
            },
            children: [
              {
                el: "text",
                text: "What the assistant remembers",
                style: {
                  fontSize: "$text.body",
                  fontWeight: "$font.weightSemibold",
                  color: "$fg.strong",
                },
              },
              {
                el: "component",
                use: "inline-banner",
                props: {
                  tone: "neutral",
                  icon: "",
                  title: "",
                  message: "Your preferences could not be loaded.",
                  actionLabel: "Try again",
                },
              },
            ],
          },
        },
        {
          step: 6,
          press: 0,
          hold: 1000,
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 480,
            },
            children: [
              {
                el: "text",
                text: "What the assistant remembers",
                style: {
                  fontSize: "$text.body",
                  fontWeight: "$font.weightSemibold",
                  color: "$fg.strong",
                },
              },
              {
                el: "component",
                use: "inline-banner",
                props: {
                  tone: "neutral",
                  icon: "",
                  title: "",
                  message: "Your preferences could not be loaded.",
                  actionLabel: "Try again",
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 480,
            },
            children: [
              {
                el: "text",
                text: "What the assistant remembers",
                style: {
                  fontSize: "$text.body",
                  fontWeight: "$font.weightSemibold",
                  color: "$fg.strong",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Write dates as 14 Nov, not 11/14",
                  leading: "none",
                  role: "button",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Keep meeting summaries to five bullets",
                  leading: "none",
                  role: "button",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Post release notes in #release-train",
                  leading: "none",
                  role: "button",
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "enroll-from-banner",
      title: "The banner's action opens what fixes it",
      description: "A footnote banner says why meetings call you Speaker N and offers the one fix. Its action fires onAction, and the screen opens the enrollment sheet.",
      platforms: ["mobile"],
      width: 375,
      steps: [
        {
          kind: "data",
          title: "The prompt shows only to someone without a voiceprint",
          detail: "It sits under a meeting's speakers and on the recorder, when voice enrollment is allowed and you haven't enrolled.",
          code: "if (enrolled || !allowed) return null;",
        },
        {
          kind: "motion",
          title: "The banner fades in",
          detail: "The phone's footnote banner: a sunken strip, a faint glyph, one sentence and no heading.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "Enroll your voice is pressed",
          detail: "The action sits under the sentence, aligned with the text. Today it is a separate small Button under the banner; this spec draws it inside.",
        },
        {
          kind: "event",
          title: "onAction fires",
          code: "onAction?.()",
        },
        {
          kind: "state",
          title: "The prompt opens the enrollment sheet",
          code: "<VoiceEnrollmentSheet visible={open} onClose={() => setOpen(false)} />",
        },
        {
          kind: "motion",
          title: "The sheet slides up",
          enter: "slide-up",
        },
        {
          kind: "result",
          title: "Once you've enrolled, the banner is gone",
          detail: "voiceEnrollment is set in the app store, the prompt returns null everywhere, and meetings name you instead of Speaker N.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              justify: "center",
              paddingX: 16,
            },
            children: [
              {
                el: "component",
                use: "inline-banner",
                props: {
                  icon: "mic",
                  title: "",
                  message: "Your turns show as “Speaker N” because you have no voiceprint yet. Enroll your voice so meetings name you.",
                  actionLabel: "Enroll your voice",
                },
              },
            ],
          },
        },
        {
          step: 2,
          press: 0,
          hold: 1000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              justify: "center",
              paddingX: 16,
            },
            children: [
              {
                el: "component",
                use: "inline-banner",
                props: {
                  icon: "mic",
                  title: "",
                  message: "Your turns show as “Speaker N” because you have no voiceprint yet. Enroll your voice so meetings name you.",
                  actionLabel: "Enroll your voice",
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              justify: "center",
              paddingX: 16,
            },
            children: [
              {
                el: "component",
                use: "inline-banner",
                props: {
                  icon: "mic",
                  title: "",
                  message: "Your turns show as “Speaker N” because you have no voiceprint yet. Enroll your voice so meetings name you.",
                  actionLabel: "Enroll your voice",
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
                  title: "Voice recognition",
                  primaryLabel: "Record phrase 1 of 5",
                  children: [
                    {
                      el: "text",
                      text: "Hey Companion, this is Priya.",
                      style: {
                        fontSize: "$text.lead",
                        fontWeight: "$font.weightSemibold",
                        color: "$fg.strong",
                      },
                    },
                    {
                      el: "text",
                      text: "Find a quiet spot and speak clearly at arm’s length.",
                      style: {
                        fontSize: "$text.bodySm",
                        color: "$fg.faint",
                      },
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
