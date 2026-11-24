import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "empty-state",
  name: "Empty state",
  category: "feedback",
  level: "molecule",
  status: "stable",
  description: "What a surface shows when there is nothing in it, or nothing it can show you: a drawing of what will be here (or a glyph for an error or a refusal), a short title, one line on what happens next, and at most one offered action.",
  props: {
    art: {
      type: "enum",
      options: ["none", "messages", "tasks", "notifications", "mail", "files", "projects"],
      default: "none",
      sample: "messages",
      description: "The drawing for a data surface: the shape you will see once there IS something here, never a mascot. none for an error or a refusal, which takes an icon instead.",
    },
    icon: {
      type: "icon",
      default: "",
      description: "A glyph in a disc, for the states that are not a data surface — a failure, a lock, sign-in, search. Ignored when art is set.",
    },
    title: {
      type: "string",
      sample: "No conversations yet",
      required: true,
      description: "What is not here. A noun phrase, not a sentence.",
    },
    line: {
      type: "string",
      default: "",
      sample: "Public channels in your organisation and the direct messages you start will appear here.",
      description: "What will be here and how it gets here. One sentence; never narrates a button that is already visible (ADR-0675).",
    },
    actionLabel: {
      type: "string",
      default: "",
      description: "The offered next step — only on surfaces where the thing is actually made. Empty hides the button.",
    },
    actionIcon: {
      type: "icon",
      default: "",
      description: "Almost always empty: a labelled button carries no glyph (ADR-0381), except where it repeats a header CTA that has one.",
    },
    compact: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "The ~248px assistant rails and the sidebar: less padding and a narrower measure. Same drawing, same type ramp.",
    },
    headingLevel: {
      type: "number",
      default: 2,
      platforms: ["web", "desktop"],
      description: "The title's heading level, 1 to 6, so it keeps the page's heading order: an empty pane under the page's h1 is an h2, an empty section inside an h2 an h3. The phone has one kind of header.",
    },
    onAction: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A centred flex column with enter(\"fade\"): the 160 × 116 drawing as absolutely placed boxes over `t`, or a glyph in a disc; an <h2> title (`headingLevel` picks h1 to h6); the kit's Button (secondary, lg)",
      import: "import { EmptyState } from \"@antfabric/ui-react\"",
      notes: [
        "Search empties are announced through the search field's own live region (\"No matches\"), not by this component.",
        "The title is a heading inside the pane's landmark (h2 unless `headingLevel` says otherwise), so a screen-reader user can jump to it.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same column as web, at desktop density",
      import: "import { EmptyState } from \"@antfabric/ui-react\"",
      notes: [
        "One empty state for every data surface (ADR-0298). No container: no fill and no dotted outline (owner, 2026-08-31) — a drawing and words centred on whatever it sits on.",
        "Eight drawings, one system: near-white objects with a hairline edge and a soft shadow, layered, real UI chrome, exactly one --fg-faint accent. Every colour is an --art-* role so the set retints per theme; this catalogue approximates them with surface/border tokens because tokens.json has no art.* roles yet.",
        "The action is TERTIARY (white with an outline, no lift) and size lg, only where the thing is made. Recordings has none (started from the tray); a channel has none (the composer is right below).",
        "PaneEmpty is the compact adapter the My Tasks and Rituals rails both call, so they cannot drift into two ideas of empty.",
        "Centred with flex: 1 AND min-height: 100%, because some panes are flex scrollers and some are block scrollers.",
      ],
    },
    mobile: {
      status: "ready",
      base: "A View with <Enter motion=\"fade\">: the drawing as absolutely placed Views (the page fold is a border triangle), or a glyph in a 64pt disc; a header Text; the kit's Button (secondary, md)",
      import: "import { EmptyState } from \"@antfabric/ui-react-native\"",
      notes: [
        "V2 (2026-10-15): a 20pt SemiBold title over a 14pt faint line as wide as the gutter allows; 56pt above and below.",
        "The action is centred (alignSelf: center) — Button defaults to flex-start, which left every empty-state action at the left edge.",
        "Error and refusal states use a glyph in a 64pt disc instead of a drawing.",
      ],
    },
  },
  a11y: {
    notes: [
      "The drawing and the disc are aria-hidden; the title and the line carry the meaning.",
      "The title is a heading (level 2 in a pane). Focus is not moved to an empty state when it appears — it would steal focus from the search field or the composer.",
    ],
  },
  examples: [
    {
      name: "No conversations yet",
      props: {},
      width: 420,
    },
    {
      name: "No conversations yet (phone)",
      props: {
        line: "Start a direct message with the pen button. Public channels in your organisation appear here too.",
        actionLabel: "New message",
      },
      platforms: ["mobile"],
      width: 375,
    },
    {
      name: "Couldn't load conversations",
      props: {
        art: "none",
        icon: "circle-alert",
        title: "Couldn't load conversations",
        line: "The request failed. Check your connection and try again.",
        actionLabel: "Try again",
      },
      width: 420,
    },
    {
      name: "You're not in this channel (phone)",
      props: {
        art: "none",
        icon: "lock",
        title: "You're not in this channel",
        line: "It is private, so there is nothing to join — ask an owner or an admin to add you.",
        actionLabel: "Back to channels",
      },
      platforms: ["mobile"],
      width: 375,
    },
    {
      name: "You're not in this channel",
      props: {
        art: "none",
        icon: "lock",
        title: "You're not in this channel",
        line: "It is private, so there is nothing to join. Ask an owner or an admin to add you.",
      },
      platforms: ["web", "desktop"],
      width: 420,
    },
    {
      name: "Sign in to see your messages",
      props: {
        art: "none",
        icon: "circle-user",
        title: "Sign in to see your messages",
        line: "Channels and direct messages are the ones you belong to on the desktop.",
        actionLabel: "Sign in",
      },
      platforms: ["mobile"],
      width: 375,
    },
    {
      name: "Search — no matches (phone)",
      props: {
        art: "none",
        icon: "search",
        title: "No matches",
        line: "No conversation matches “desgin-crit”.",
      },
      platforms: ["mobile"],
      width: 375,
    },
    {
      name: "Sidebar search — offer to create",
      props: {
        art: "none",
        icon: "search",
        title: "No matches",
        line: "No channels or people match “release-qa”.",
        actionLabel: "Create #release-qa",
        actionIcon: "plus",
        compact: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Nothing matches in this conversation",
      props: {
        title: "Nothing matches",
        line: "No message or file in this conversation mentions “rollback”.",
      },
      platforms: ["web", "desktop"],
      width: 420,
    },
    {
      name: "My Tasks rail (compact)",
      props: {
        art: "tasks",
        title: "Nothing on your list",
        line: "Tasks assigned to you, and the ones Fabric pulls from meetings, land here.",
        actionLabel: "New task",
        compact: true,
      },
      platforms: ["web", "desktop"],
      width: 248,
    },
    {
      name: "Notifications",
      props: {
        art: "notifications",
        title: "You're all caught up",
        line: "Mentions, replies and reactions to your messages will show up here.",
      },
      width: 375,
    },
    {
      name: "Files",
      props: {
        art: "files",
        title: "No files yet",
        line: "Files shared in #design-crit appear here, newest first.",
      },
      width: 375,
    },
  ],
  matrix: [
    {
      prop: "art",
    },
  ],
  edgeCases: [
    {
      title: "Still loading is not empty",
      platforms: ["web", "desktop", "mobile"],
      handling: "Never show \"No conversations yet\" while the first read is in flight — that tells a new hire their workspace is empty. The surface shows a Skeleton (after 300 ms) until the read settles, and only an answered, empty read draws this.",
    },
    {
      title: "A failed read is not an empty list",
      platforms: ["web", "desktop", "mobile"],
      handling: "The error state (\"Couldn't load conversations\" + Try again) appears only when nothing is on the device. With a cached list, the list stays and an InlineBanner says the refresh failed. The line never prints an HTTP status, a path or a service name — only what to do.",
      example: {
        name: "Failed, nothing cached",
        props: {
          art: "none",
          icon: "circle-alert",
          title: "Couldn't load conversations",
          line: "The request failed. Check your connection and try again.",
          actionLabel: "Try again",
        },
        width: 375,
      },
    },
    {
      title: "Offline on first launch",
      platforms: ["desktop", "mobile"],
      handling: "With no cache there is nothing to show and nothing to retry by hand: no button, and the surface loads by itself the moment the connection returns.",
      example: {
        name: "Offline, no cache",
        props: {
          art: "none",
          icon: "wifi-off",
          title: "You're offline",
          line: "Your conversations will load when you reconnect.",
        },
        width: 375,
      },
    },
    {
      title: "Session or SSO expired",
      platforms: ["web", "desktop", "mobile"],
      handling: "The same words as the toast (\"Your session expired. Sign in again.\"), with Sign in as the action. Retrying cannot revive a session, so there is no Try again here.",
      example: {
        name: "Session expired",
        props: {
          art: "none",
          icon: "key-round",
          title: "Your session expired",
          line: "Sign in again to see your messages. Nothing on this device was lost.",
          actionLabel: "Sign in",
        },
        width: 375,
      },
    },
    {
      title: "Long search query",
      platforms: ["web", "desktop", "mobile"],
      handling: "The quoted query is cut at 40 characters on a word boundary with an ellipsis; the full query stays in the search field. The line wraps (text-wrap: pretty) rather than truncating the sentence.",
      example: {
        name: "Long query",
        props: {
          art: "none",
          icon: "search",
          title: "No matches",
          line: "No conversation matches “quarterly business review deck for the…”.",
        },
        width: 320,
      },
    },
    {
      title: "Inside a section that has its own heading",
      platforms: ["web", "desktop"],
      handling: "Pass `headingLevel` one below the section's heading (3 under an h2), so the outline a screen reader walks stays in order; the title looks the same at every level.",
      example: {
        name: "Under an h2",
        props: { title: "No tasks due today", headingLevel: 3, art: "tasks" },
      },
    },
    {
      title: "Narrow rail",
      platforms: ["web", "desktop"],
      handling: "compact cuts the padding to 28 × 18 and the measure to 214px so the drawing stays above the fold in a 248px column; the drawing itself never shrinks below 160 × 116.",
    },
    {
      title: "An action that is not this surface's to offer",
      platforms: ["web", "desktop", "mobile"],
      handling: "No button where the thing is not made here: a channel's empty state has none because the composer is directly below; Recordings has none because recording starts from the tray; a feature that is switched off (Rituals) offers nothing.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Title and line wrap; the drawing stays 160 × 116 and the whole block scrolls if it no longer fits above the keyboard.",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "Every colour in the drawing is a theme role (--art-* on desktop, art* on mobile), so the set retints rather than glowing white on charcoal. A hex in a drawing would be the one wrong-coloured thing after a palette change.",
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "Text is centred so nothing moves; the drawing is mirrored so the conversation bubbles and the unread edge sit on the reading side.",
    },
  ],
  related: ["skeleton", "inline-banner", "list-item"],
  flows: [
    {
      id: "action-opens-form",
      title: "The empty state's one action opens the form",
      description: "An empty list offers the one thing that fills it, and only where that thing is made. Pressing it fires onAction; the screen opens the form over the empty state.",
      platforms: ["web", "desktop", "mobile"],
      width: 420,
      steps: [
        {
          kind: "data",
          title: "The projects loaded, and there are none",
          detail: "ProjectGrid tells a failed first read from an empty one. Only when the projects have loaded and there are none does it say No projects yet, with New project.",
          code: "s.projects.length === 0 ? <EmptyState art=\"projects\" title=\"No projects yet\" … action={{ label: 'New project', onClick: a.newProject }} />",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "No channels and no DMs",
          detail: "The channels tab draws No conversations yet only once the list has answered with nothing; while it loads, it is a skeleton.",
          code: "nothingAtAll ? <EmptyState art=\"messages\" title=\"No conversations yet\" … actionLabel=\"New message\" onAction={() => setComposeOpen(true)} />",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route's query answered with an empty list",
          code: "if (projects.length === 0) return <EmptyState art=\"projects\" title=\"No projects yet\" actionLabel=\"New project\" onAction={openCreate} />",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "It fades in where the list would be",
          detail: "Centred on the pane with no container. Never while the first read is in flight: that is a Skeleton, and an empty state there would tell a new hire their workspace is empty.",
          enter: "fade",
        },
        {
          kind: "trigger",
          title: "New project is pressed",
          detail: "New message on the phone. The button is secondary: the empty state offers a next step; it isn't the page's primary action.",
        },
        {
          kind: "event",
          title: "onAction fires",
          code: "onAction?.()",
        },
        {
          kind: "state",
          title: "newProject opens the create form",
          detail: "One store field holds the form. It is seeded with you as a member when the app knows who you are, and empty when it doesn't; never with a stranger.",
          code: "newProject: () => set({ pjForm: { name: '', client: '', type: 'client', status: 'Active', … } })",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "A search param opens the dialog",
          detail: "?create=1 on the projects route, so Back closes the dialog and the link can be shared.",
          code: "navigate({ search: (s) => ({ ...s, create: 1 }) })",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "The screen opens the New message sheet",
          code: "<NewMessageSheet visible={composeOpen} onClose={() => setComposeOpen(false)} people={directory.data} … />",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The scrim fades in and the dialog pops",
          detail: "Focus moves into the form and stays there until it closes. Today's Scrim fades in (af-fade) and the centred card arrives with it, without a pop.",
          enter: "pop",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The sheet slides up",
          detail: "The New message sheet, with its large title, the search field and the directory's people.",
          enter: "slide-up",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The form is open over the empty state",
          detail: "The empty state stays underneath, and leaves only when the first project or conversation exists.",
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
              width: 560,
              minHeight: 420,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "projects",
                  title: "No projects yet",
                  line: "Projects hold your channels, boards and meetings in one place.",
                  actionLabel: "New project",
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
              minHeight: 640,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  title: "No conversations yet",
                  line: "Start a direct message with the pen button. Public channels in your organisation appear here too.",
                  actionLabel: "New message",
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
              width: 560,
              minHeight: 420,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "projects",
                  title: "No projects yet",
                  line: "Projects hold your channels, boards and meetings in one place.",
                  actionLabel: "New project",
                },
              },
            ],
          },
        },
        {
          step: 4,
          press: 0,
          hold: 1000,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 420,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "projects",
                  title: "No projects yet",
                  line: "Projects hold your channels, boards and meetings in one place.",
                  actionLabel: "New project",
                },
              },
            ],
          },
        },
        {
          step: 4,
          press: 0,
          hold: 1000,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 640,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  title: "No conversations yet",
                  line: "Start a direct message with the pen button. Public channels in your organisation appear here too.",
                  actionLabel: "New message",
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 420,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "projects",
                  title: "No projects yet",
                  line: "Projects hold your channels, boards and meetings in one place.",
                  actionLabel: "New project",
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                },
                props: {
                  kind: "form",
                  title: "New project",
                  subtitle: "",
                  body: "",
                  icon: "",
                  tone: "primary",
                  confirmLabel: "Create project",
                  children: [
                    {
                      el: "component",
                      use: "text-field",
                      props: {
                        label: "Project name",
                        placeholder: "Checkout revamp",
                        prefix: "",
                        helper: "You can add channels and people next.",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 640,
              justify: "center",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  title: "No conversations yet",
                  line: "Start a direct message with the pen button. Public channels in your organisation appear here too.",
                  actionLabel: "New message",
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
                      el: "component",
                      use: "search-field",
                      props: {
                        placeholder: "Search people",
                      },
                    },
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "Amara Okafor",
                        subtitle: "Product Designer",
                        leading: "avatar",
                        avatar: {
                          name: "Amara Okafor",
                          identity: "green",
                        },
                      },
                    },
                    {
                      el: "component",
                      use: "list-item",
                      props: {
                        title: "Kofi Mensah",
                        subtitle: "Platform Engineer",
                        leading: "avatar",
                        avatar: {
                          name: "Kofi Mensah",
                          identity: "ochre",
                        },
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
    {
      id: "try-again",
      title: "A failed read offers Try again, not an empty list",
      description: "When the first read fails and nothing is on the device, the surface says so and offers to read again. It never says No projects yet over a list that simply didn't load.",
      platforms: ["web", "desktop", "mobile"],
      width: 420,
      steps: [
        {
          kind: "data",
          title: "The first read failed, and nothing is cached",
          detail: "A rejected read used to leave the empty projects array in place and say No projects yet, with New project, to someone who had eight. Now the source's error phase decides, and it offers a retry so nobody makes a duplicate.",
          code: "source.phase === 'error' ? <EmptyState … title=\"Your projects could not be loaded\" action={{ label: 'Try again', onClick: () => void source.reload() }} />",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The list query failed with nothing on the device",
          detail: "With a snapshot on the device the list stays on screen and this never shows.",
          code: "if (channels.isError && (channels.data ?? []).length === 0) { … }",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The query errored with no cached data",
          code: "if (query.isError && query.data === undefined) return <EmptyState icon=\"circle-alert\" … actionLabel=\"Try again\" onAction={() => query.refetch()} />",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "It fades in",
          detail: "A glyph in a disc instead of a drawing: this isn't a surface with nothing in it. Today's desktop still draws the projects picture here.",
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
          detail: "Nothing is reset: the project source reloads, or React Query refetches the list. A slow answer shows the skeleton after 300 ms.",
          code: "void source.reload()  ·  void channels.refetch()",
        },
        {
          kind: "result",
          title: "The list takes its place, or the sentence comes back",
          detail: "If it fails again the same error returns. The line never prints a status code, a path or a service name; only what to do.",
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
              width: 420,
              minHeight: 360,
              justify: "center",
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "none",
                  icon: "circle-alert",
                  title: "Your projects could not be loaded",
                  line: "The workspace did not finish loading. This is not an empty account. Nothing has been lost.",
                  actionLabel: "Try again",
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
              justify: "center",
              gap: 2,
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "none",
                  icon: "circle-alert",
                  title: "Couldn't load conversations",
                  line: "The request failed. Check your connection and try again.",
                  actionLabel: "Try again",
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
              width: 420,
              minHeight: 360,
              justify: "center",
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "none",
                  icon: "circle-alert",
                  title: "Your projects could not be loaded",
                  line: "The workspace did not finish loading. This is not an empty account. Nothing has been lost.",
                  actionLabel: "Try again",
                },
              },
            ],
          },
        },
        {
          step: 4,
          press: 0,
          hold: 1000,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 420,
              minHeight: 360,
              justify: "center",
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "none",
                  icon: "circle-alert",
                  title: "Your projects could not be loaded",
                  line: "The workspace did not finish loading. This is not an empty account. Nothing has been lost.",
                  actionLabel: "Try again",
                },
              },
            ],
          },
        },
        {
          step: 4,
          press: 0,
          hold: 1000,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              justify: "center",
              gap: 2,
            },
            children: [
              {
                el: "component",
                use: "empty-state",
                props: {
                  art: "none",
                  icon: "circle-alert",
                  title: "Couldn't load conversations",
                  line: "The request failed. Check your connection and try again.",
                  actionLabel: "Try again",
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1400,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 420,
              minHeight: 360,
              justify: "center",
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "panel",
                  width: "400px",
                  height: "88px",
                  label: "Loading projects",
                },
              },
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "panel",
                  width: "400px",
                  height: "88px",
                  label: "Loading projects",
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1400,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              justify: "center",
              gap: 2,
            },
            children: [
              {
                el: "component",
                use: "skeleton",
                props: {
                  shape: "row",
                  label: "Loading conversations",
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 420,
              minHeight: 360,
              justify: "center",
              gap: "$space.sm",
            },
            children: [
              {
                el: "component",
                use: "card",
                props: {
                  level: "inner",
                  elevate: "none",
                  interactive: true,
                  label: "Open Checkout revamp",
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
                          text: "Checkout revamp",
                          style: {
                            fontSize: "$text.title",
                            fontWeight: "$font.weightSemibold",
                            color: "$fg.strong",
                          },
                        },
                        {
                          el: "component",
                          use: "tag",
                          props: {
                            label: "On track",
                            tone: "success",
                          },
                        },
                      ],
                    },
                    {
                      el: "text",
                      text: "#release-train · 12 open tickets · due Nov 14",
                      style: {
                        fontSize: "$text.caption",
                        color: "$fg.muted",
                      },
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "card",
                props: {
                  level: "inner",
                  elevate: "none",
                  interactive: true,
                  label: "Open Atlas Mobile",
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
                          text: "Atlas Mobile",
                          style: {
                            fontSize: "$text.title",
                            fontWeight: "$font.weightSemibold",
                            color: "$fg.strong",
                          },
                        },
                        {
                          el: "component",
                          use: "tag",
                          props: {
                            label: "At risk",
                            tone: "warning",
                          },
                        },
                      ],
                    },
                    {
                      el: "text",
                      text: "#platform-eng · 31 open tickets · due Dec 2",
                      style: {
                        fontSize: "$text.caption",
                        color: "$fg.muted",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 520,
              justify: "center",
              gap: 2,
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "design-crit",
                  unread: true,
                  count: 2,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "platform-eng",
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Aisha Bello",
                  leading: "avatar",
                  avatar: {
                    name: "Aisha Bello",
                    identity: "ochre",
                  },
                  subtitle: "Can you check the rollout plan before 4?",
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
