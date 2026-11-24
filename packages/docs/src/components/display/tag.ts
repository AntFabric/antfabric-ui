import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "tag",
  name: "Tag",
  category: "display",
  level: "atom",
  status: "stable",
  description: "A small square-cornered label for metadata — a status, a priority, a kind. The corner is the meaning: pills are actions and counts, a 5px tag is a fact about the row it sits in, so it never reads as clickable.",
  props: {
    label: {
      type: "string",
      sample: "In review",
      required: true,
    },
    tone: {
      type: "enum",
      options: ["neutral", "brand", "success", "warning", "danger", "info"],
      default: "neutral",
      description: "One colour family per tone in every theme: grey, BLUE, green, amber, red, purple. brand is blue, not coral — coral is the brand fill and means it needs you; a status tag is neither.",
    },
    icon: {
      type: "icon",
      default: "",
      description: "Optional leading glyph, 12px. Use it when the word alone is ambiguous at a glance (lock for Private), not as decoration.",
    },
    size: {
      type: "enum",
      options: ["sm", "md"],
      default: "md",
      description: "md is the platform's own tag: 2 × 8 on web and desktop, 4 × 8 on mobile so it sits in a 44pt row. sm is 2 × 8 everywhere, for the phone's densest rows.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <span> (no role, not focusable) with the full label as its title tooltip, on the color.tag.* roles; a transparent outline becomes its shape under forced colours; inline styles over `t`",
      import: "import { Tag } from \"@antfabric/ui-react\"",
      notes: [
        "Not a button and not focusable. A tag that filters a list is a Chip (a pill that takes a press), never a pressable Tag.",
        "Under forced-colors (Windows High Contrast) the fill disappears, so the tag keeps its shape with a 1px outline that the browser draws in the system colour (the kit sets it transparent).",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <span> as web, at desktop density",
      import: "import { Tag } from \"@antfabric/ui-react\"",
      notes: [
        "Reads the tag's OWN colour roles (--tag-*, ADR-5325), not the status roles. Borrowing --success-soft drew Light's dark ink on a dark slab in the dark themes, at 1.9–2.8:1.",
        "Semibold, not bold (owner, 2026-09-26) — the weight My Tasks and Rituals were already overriding every tag to.",
        "One size today (2 × 8). The full label is the tooltip when the row truncates it.",
        "No press and no entrance: a tag is read, not used. When a status moves on (In review → Shipped) the fill and ink cross-fade over 150ms instead of snapping.",
      ],
    },
    mobile: {
      status: "ready",
      base: "View + Text (numberOfLines 1, maxFontSizeMultiplier 1.3) on the color.tag.* roles; StyleSheet over useTheme()",
      import: "import { Tag } from \"@antfabric/ui-react-native\"",
      notes: [
        "Today's mobile component is called Badge and is this label. It is renamed Tag so that Badge means an unread count on every platform, as it does on the desktop.",
        "The mobile Badge's `primary` (coral) and `accent` tones fold into brand (blue) and info (purple), following the desktop Tag (owner, 2026-10-01: \"update the components based on the desktop components\").",
        "A status DOT keeps the status inks (StatusDot) — it is a signal, not a tag, and is not this component.",
        "Font scale is capped at 1.3× (maxFontSizeMultiplier), as everywhere in the app.",
      ],
    },
  },
  a11y: {
    notes: [
      "The label is the meaning; colour only repeats it. Never ship a tag whose tone is the only thing that says \"blocked\".",
      "No role and no live region: a tag is read as part of its row's text. A tag that changes (In review → Approved) is announced by whatever changed it, not by the tag.",
    ],
  },
  examples: [
    {
      name: "Neutral",
      props: {
        label: "Draft",
      },
    },
    {
      name: "Brand (blue)",
      props: {
        label: "Design",
        tone: "brand",
      },
    },
    {
      name: "Success",
      props: {
        label: "Shipped",
        tone: "success",
      },
    },
    {
      name: "Warning",
      props: {
        label: "Due Friday",
        tone: "warning",
      },
    },
    {
      name: "Danger",
      props: {
        label: "Blocked",
        tone: "danger",
      },
    },
    {
      name: "Info",
      props: {
        label: "Fabric draft",
        tone: "info",
        icon: "sparkles",
      },
    },
    {
      name: "With icon",
      props: {
        label: "Private",
        icon: "lock",
      },
    },
    {
      name: "Dense mobile row",
      props: {
        label: "P1",
        tone: "danger",
        size: "sm",
      },
      platforms: ["mobile"],
    },
  ],
  matrix: [
    {
      prop: "tone",
    },
    {
      prop: "size",
    },
  ],
  edgeCases: [
    {
      title: "Label longer than the row allows",
      platforms: ["web", "desktop", "mobile"],
      handling: "One line, truncated with an ellipsis at whatever width the row gives it. The full label is the tooltip on web and desktop and the accessible text everywhere. Write tags as one or two words; a sentence belongs in the row's subtitle.",
      example: {
        name: "Truncated",
        props: {
          label: "Waiting on legal review from Contracts",
          tone: "warning",
        },
        width: 140,
      },
    },
    {
      title: "Colour is not the message",
      platforms: ["web", "desktop", "mobile"],
      handling: "Red and green tags differ to a colour-blind reader only by their words, so the words must differ: Blocked and Shipped, never two tags that both say Status. Under forced-colors the fill is gone and a 1px outline in the system colour keeps the shape.",
      example: {
        name: "Words carry it",
        props: {
          label: "Blocked",
          tone: "danger",
          icon: "octagon-alert",
        },
      },
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "Each tone has its own bg/fg pair per theme (the color.tag.* roles), tuned to at least 4.5:1 on both. The status tokens are not reused — inverting only the fill is what made the old dark tags unreadable.",
    },
    {
      title: "Someone tries to click it",
      platforms: ["web", "desktop"],
      handling: "Nothing happens and nothing hovers: no cursor change, no fill change. If the surface needs \"click a status to filter by it\", that surface renders a Chip. A square tag that sometimes responds teaches people to click every tag.",
      example: {
        name: "Static",
        props: {
          label: "Platform",
          tone: "brand",
        },
        state: "hover",
      },
    },
    {
      title: "Many tags on one dense row",
      platforms: ["web", "desktop"],
      handling: "A 30px desktop row never wraps. Show the two most specific tags and a neutral \"+3\" tag whose tooltip lists the rest; the full set is in the item's detail view.",
      example: {
        name: "Overflow tag",
        props: {
          label: "+3",
        },
      },
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "The tag grows with the type (padding stays 4 × 8). In a ListItem the tags wrap under the title rather than squeezing the title to one truncated word.",
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "The icon leads on the right. Directional glyphs mirror; the lock and the sparkle do not.",
    },
  ],
  related: ["badge", "chip", "list-item", "status-dot"],
  flows: [
    {
      id: "status-moves-on",
      title: "A status moves on and the tag follows",
      description: "A tag is a fact about its row, so it changes when the fact does: a task reaches Done, an upload that was waiting starts again. Nobody presses the tag.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "My Tasks gives each card one tag, or none",
          detail: "A task carries a tag only when there is something to say: Done when it's finished, its priority when that is High or Highest. Medium and Low get none.",
          code: "const tag = done ? { label: 'Done', tone: 'success' as const } : URGENT.has(item.priority) ? { label: item.priority, tone: 'danger' as const } : null",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "A waiting recording's tag comes from its upload state",
          detail: "The upload failed while the phone was offline and will be tried again by itself, so the card says Retrying in amber.",
          code: "if (item.state === 'error' && !item.meetingId) { … return { label: 'Retrying', tone: 'warning', … } }",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The task's status comes from the tasks query",
          code: "const { data: task } = useQuery(taskQuery(taskId))",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The ticket is dropped on Done",
          detail: "Dragged across the board to the Done column.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "The phone comes back online",
          detail: "The connectivity monitor sees the offline → online edge, re-queues every failed upload that isn't terminal, and drains the queue.",
          code: "if (online && wasOnline === false) { useCaptureQueue.getState().retryErrored({ refund: false }); … }",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "setTaskCol moves it, and the pane re-derives the tag",
          detail: "A parent with open subtasks is refused instead. Every surface reading the task re-renders from the store, and isDone now says yes.",
          code: "if (!setTaskCol(id, col)) return",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The mutation updates the cached task first",
          code: "onMutate: () => queryClient.setQueryData(taskQuery(taskId).queryKey, { ...task, status: 'done' })",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "drain marks it uploading, and the card re-reads it",
          code: "patch(next.id, { state: 'uploading', progress: 0, error: undefined });",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The fill and the ink cross-fade",
          detail: "No entrance: the tag was already there. Its background and colour transition over 150ms instead of snapping. Today's desktop Tag and the phone's Badge switch without a transition.",
        },
        {
          kind: "result",
          title: "The tag says what is true now",
          detail: "Done in green on the task; Uploading on the recording, with its progress bar under it. The word changes as well as the colour, so the change reads without colour.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: "$space.sm",
              width: 300,
            },
            children: [
              {
                el: "text",
                text: "Ship push opt-in for Android 14",
                style: {
                  flex: 1,
                  minWidth: 0,
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                  truncate: 1,
                },
              },
              {
                el: "component",
                use: "tag",
                props: {
                  label: "Highest",
                  tone: "danger",
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1400,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: "$space.sm",
              width: 300,
            },
            children: [
              {
                el: "text",
                text: "Weekly sync",
                style: {
                  flex: 1,
                  minWidth: 0,
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                  truncate: 1,
                },
              },
              {
                el: "component",
                use: "tag",
                props: {
                  label: "Retrying",
                  tone: "warning",
                  size: "sm",
                },
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1400,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: "$space.sm",
              width: 300,
            },
            children: [
              {
                el: "text",
                text: "Ship push opt-in for Android 14",
                style: {
                  flex: 1,
                  minWidth: 0,
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                  truncate: 1,
                },
              },
              {
                el: "component",
                use: "tag",
                props: {
                  label: "Highest",
                  tone: "danger",
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: "$space.sm",
              width: 300,
            },
            children: [
              {
                el: "text",
                text: "Ship push opt-in for Android 14",
                style: {
                  flex: 1,
                  minWidth: 0,
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
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
        },
        {
          step: 8,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: "$space.sm",
              width: 300,
            },
            children: [
              {
                el: "text",
                text: "Weekly sync",
                style: {
                  flex: 1,
                  minWidth: 0,
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.semibold",
                  color: "$color.text.strong",
                  truncate: 1,
                },
              },
              {
                el: "component",
                use: "tag",
                props: {
                  label: "Uploading",
                  tone: "info",
                  size: "sm",
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
