import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "avatar-stack",
  name: "Avatar stack",
  category: "display",
  level: "molecule",
  status: "stable",
  description: "Overlapping faces for the people in a channel, a thread or a meeting, with a +N chip for the ones that do not fit. Each face wears a ring in the colour of the ground it sits on, so a stack of photos still reads as separate people.",
  props: {
    people: {
      type: "array",
      sample: [
        {
          name: "Priya Raman",
          identity: "indigo",
        },
        {
          name: "Marcus Chen",
          identity: "green",
        },
        {
          name: "Aisha Bello",
          identity: "ochre",
        },
        {
          name: "Tomás Ortega",
          identity: "red",
        },
        {
          name: "Yuki Tanaka",
          identity: "ink",
        },
      ],
      description: "Resolved people, in order: [{ name, identity, src? }]. The first is the lead (the thread's author, the meeting's host) and is drawn on top.",
      required: true,
    },
    max: {
      type: "enum",
      options: [2, 3, 4, 5],
      default: 3,
      description: "Faces drawn before the rest collapse into +N. The desktop facepile draws 3, the mobile AvatarStack 4.",
    },
    total: {
      type: "number",
      default: 0,
      description: "Everyone in the group when `people` is only a preview — a channel of 240 sends its first faces and a count. 0 means `people` is everyone.",
    },
    size: {
      type: "enum",
      options: ["xs", "sm", "md"],
      default: "sm",
      description: "Avatar sizes: sm is 22px on desktop (the facepile's 24 at web density) and 28pt on mobile.",
    },
    ground: {
      type: "enum",
      options: ["default", "sidebar", "recessed", "selected"],
      default: "default",
      description: "The surface the stack sits on. The ring is cut in that colour — always a surface, never an accent.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"group\" <div> of the kit's Avatars, each ringed in the ground's surface colour and overlapping by a third (margin-inline-start), and a +N chip named in words; inline styles over `t`",
      import: "import { AvatarStack } from \"@antfabric-ui/react\"",
      notes: [
        "Hovering a face opens that person's hover card; hovering +N lists the hidden names (up to 12, then \"and 40 more\").",
        "When the stack is a link (a channel's members), the whole stack is one <a> with the group label — not one tab stop per face.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "Opens the member list when the stack is interactive",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <div> as web, at desktop density (22px faces)",
      import: "import { AvatarStack } from \"@antfabric-ui/react\"",
      notes: [
        "Today's Facepile: 24px faces at −7px overlap with a 2px surface ring; every ring is the surface colour, including the lead's (ADR-0389 — a coral ring on the first face read as a badge on one person).",
        "+N counts what is HIDDEN, never the total. ChannelPane's header shows the roster TOTAL beside three faces and is deliberately a different statement; it stays a separate count, not this chip.",
        "Photos come from the Tauri app-data cache, so the stack draws offline.",
      ],
    },
    mobile: {
      status: "ready",
      base: "One accessible View (role group) of the kit's Avatars with ground-coloured rings and a marginStart overlap, and the +N chip; StyleSheet over useTheme()",
      import: "import { AvatarStack } from \"@antfabric-ui/react-native\"",
      notes: [
        "Today's AvatarStack: 28pt faces overlapping by a third, default max 4. The +N is the face discs' own grey with muted SemiBold (owner, 2026-10-05, ADR-8910) — it was a beige disc with white Bold and read as a person.",
        "Faces render with expo-image's memory+disk cache; a stack inside a FlatList row never re-fetches on scroll.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens the member sheet (on surfaces where the stack is interactive)",
        },
      ],
    },
  },
  a11y: {
    role: "group",
    label: "5 people",
    notes: [
      "A group named by the count (\"5 people\"); on both kits each drawn face is its own image named by the person (\"Priya Raman\"), so the names are reachable.",
      "The +N digits are hidden; the chip is an image named \"and 2 more\" in words.",
    ],
  },
  examples: [
    {
      name: "Thread participants",
      props: {},
    },
    {
      name: "Fits — no chip",
      props: {
        people: [
          {
            name: "Ngozi Adeyemi",
            identity: "green",
          },
          {
            name: "Lars Eriksen",
            identity: "indigo",
          },
        ],
      },
    },
    {
      name: "With Fabric",
      props: {
        people: [
          {
            name: "Fabric",
            identity: "agent",
          },
          {
            name: "Rohan Mehta",
            identity: "ochre",
          },
          {
            name: "Sofia Rossi",
            identity: "indigo",
          },
        ],
      },
    },
    {
      name: "Channel preview, 240 members",
      props: {
        total: 240,
      },
    },
    {
      name: "Mobile default (max 4)",
      props: {
        max: 4,
        size: "sm",
      },
      platforms: ["mobile"],
    },
    {
      name: "Large, meeting header",
      props: {
        size: "md",
        max: 4,
      },
    },
    {
      name: "On the sidebar",
      props: {
        ground: "sidebar",
        size: "xs",
      },
      platforms: ["web", "desktop"],
    },
  ],
  matrix: [
    {
      prop: "size",
    },
    {
      prop: "max",
    },
  ],
  edgeCases: [
    {
      title: "Photos side by side",
      platforms: ["web", "desktop", "mobile"],
      handling: "Without the ring, three photos read as one smeared image. Every face — the lead's too — wears a 2px ring in the ground's colour; a stack on a selected or sidebar row passes that ground so the ring cuts rather than outlines.",
    },
    {
      title: "Huge member count",
      platforms: ["web", "desktop", "mobile"],
      handling: "The chip grows into a pill rather than shrinking the digits; +237 stays legible. Past 9,999 the kit writes +10k. The count comes from the server's member total, never from the length of the preview list.",
      example: {
        name: "+237",
        props: {
          total: 240,
        },
      },
    },
    {
      title: "Nobody, or only you",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty list renders nothing — no ghost discs. A DM with only yourself (notes to self) shows your one face and no chip.",
      example: {
        name: "One person",
        props: {
          people: [
            {
              name: "Hannah Okafor",
              identity: "red",
            },
          ],
        },
      },
    },
    {
      title: "An AI agent in the stack",
      platforms: ["web", "desktop", "mobile"],
      handling: "Fabric keeps its coral identity disc, so it is never mistaken for a colleague, but the sparkle badge is dropped at stack sizes — at 22px it would cover the next face. The agent is named in the group label.",
    },
    {
      title: "Presence in a stack",
      platforms: ["web", "desktop", "mobile"],
      handling: "No presence dots: four dots in 70px is noise and the overlap hides half of them. Presence lives in the member list the stack opens.",
    },
    {
      title: "Member joins or leaves while it is on screen",
      platforms: ["web", "desktop", "mobile"],
      handling: "The stack re-renders from the live roster without animating faces in or out; the count updates in place. Someone who left drops off the preview immediately — a stale face implies they can still read the channel.",
    },
    {
      title: "Broken photo URL",
      platforms: ["web", "desktop", "mobile"],
      handling: "Each face falls back to its initials on its own. The stack never shrinks because one image failed.",
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "The stack starts at the right; the lead stays on top and the +N chip sits at the trailing (left) end. The overlap is margin-inline-start, not margin-left.",
    },
  ],
  related: ["avatar", "badge", "member-list"],
  flows: [
    {
      id: "untick-a-guest",
      title: "Untick a guest and the stack recounts",
      description: "The meeting form invites everyone in the conversation and shows them as a stack. Unticking someone takes their face off and the +N counts again; nothing animates in or out.",
      platforms: ["web", "desktop"],
      width: 280,
      steps: [
        {
          kind: "data",
          title: "/meet invites everyone in the conversation",
          detail: "Typing /meet in #design-crit opens the scheduling form with every member as a guest and nobody deselected. The edit only ever subtracts: there's no way to add someone who isn't in the conversation.",
          code: "const attendees = attendeesForConversation({ … })  // meetForm: { guests: attendees.guests, deselected: [] }",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The form seeds its guests from the members query",
          detail: "The channel route already holds its members in the TanStack Query cache, so the form starts with all of them and makes no second request.",
          code: "const { data: members } = useSuspenseQuery(membersQuery(channelId))",
          platforms: ["web"],
        },
        {
          kind: "data",
          title: "The stack draws the invited guests",
          detail: "GuestList turns the invited guests into faces and hands them to the facepile with max 4. The rest collapse into +N, which counts who is hidden, never the total.",
          code: "const faces = invited.map((g) => ({ key: g.id, name: g.name, initials: initialsOf(g.name), bg: colourFor(g.id) }))",
        },
        {
          kind: "trigger",
          title: "Tomás is unticked",
          detail: "Opening the guest line shows everyone as tick boxes. A change is refused while the form is saving, because the request has already gone with the old list.",
        },
        {
          kind: "state",
          title: "toggleMeetGuest takes him off the invite",
          detail: "The emails the invite goes to are recomputed here, never at submit, so what the form shows is what gets sent.",
          code: "const deselected = toggleDeselected(form.deselected, id)  // emails: invitedEmails(form.guests, deselected)",
        },
        {
          kind: "result",
          title: "Four faces and +1, and the line names who's coming",
          detail: "The faces close the gap and +2 becomes +1 in place. The sentence beside the stack lists the invited names, so the faces are scannable and the names are checkable.",
          code: "{faces.length > 0 && <Facepile people={faces} max={4} size={22} />}  ·  {guestSentence(form, names)}",
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
              gap: "$space.sm",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "avatar-stack",
                props: {
                  people: [
                    {
                      name: "Priya Raman",
                      identity: "indigo",
                    },
                    {
                      name: "Marcus Chen",
                      identity: "green",
                    },
                    {
                      name: "Aisha Bello",
                      identity: "ochre",
                    },
                    {
                      name: "Tomás Ortega",
                      identity: "red",
                    },
                    {
                      name: "Yuki Tanaka",
                      identity: "ink",
                    },
                    {
                      name: "Lena Fischer",
                      identity: "green",
                    },
                  ],
                  max: 4,
                },
              },
              {
                el: "view",
                style: {
                  gap: "$space.2xs",
                },
                children: [
                  {
                    el: "component",
                    use: "checkbox",
                    props: {
                      label: "Tomás Ortega",
                      description: "",
                      checked: true,
                    },
                  },
                  {
                    el: "component",
                    use: "checkbox",
                    props: {
                      label: "Yuki Tanaka",
                      description: "",
                      checked: true,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1400,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "avatar-stack",
                props: {
                  people: [
                    {
                      name: "Priya Raman",
                      identity: "indigo",
                    },
                    {
                      name: "Marcus Chen",
                      identity: "green",
                    },
                    {
                      name: "Aisha Bello",
                      identity: "ochre",
                    },
                    {
                      name: "Tomás Ortega",
                      identity: "red",
                    },
                    {
                      name: "Yuki Tanaka",
                      identity: "ink",
                    },
                    {
                      name: "Lena Fischer",
                      identity: "green",
                    },
                  ],
                  max: 4,
                },
              },
              {
                el: "view",
                style: {
                  gap: "$space.2xs",
                },
                children: [
                  {
                    el: "component",
                    use: "checkbox",
                    props: {
                      label: "Tomás Ortega",
                      description: "",
                      checked: true,
                    },
                  },
                  {
                    el: "component",
                    use: "checkbox",
                    props: {
                      label: "Yuki Tanaka",
                      description: "",
                      checked: true,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 3,
          press: 0,
          hold: 1000,
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "avatar-stack",
                props: {
                  people: [
                    {
                      name: "Priya Raman",
                      identity: "indigo",
                    },
                    {
                      name: "Marcus Chen",
                      identity: "green",
                    },
                    {
                      name: "Aisha Bello",
                      identity: "ochre",
                    },
                    {
                      name: "Tomás Ortega",
                      identity: "red",
                    },
                    {
                      name: "Yuki Tanaka",
                      identity: "ink",
                    },
                    {
                      name: "Lena Fischer",
                      identity: "green",
                    },
                  ],
                  max: 4,
                },
              },
              {
                el: "view",
                style: {
                  gap: "$space.2xs",
                },
                children: [
                  {
                    el: "component",
                    use: "checkbox",
                    props: {
                      label: "Tomás Ortega",
                      description: "",
                      checked: true,
                    },
                  },
                  {
                    el: "component",
                    use: "checkbox",
                    props: {
                      label: "Yuki Tanaka",
                      description: "",
                      checked: true,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              gap: "$space.sm",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "avatar-stack",
                props: {
                  people: [
                    {
                      name: "Priya Raman",
                      identity: "indigo",
                    },
                    {
                      name: "Marcus Chen",
                      identity: "green",
                    },
                    {
                      name: "Aisha Bello",
                      identity: "ochre",
                    },
                    {
                      name: "Yuki Tanaka",
                      identity: "ink",
                    },
                    {
                      name: "Lena Fischer",
                      identity: "green",
                    },
                  ],
                  max: 4,
                },
              },
              {
                el: "view",
                style: {
                  gap: "$space.2xs",
                },
                children: [
                  {
                    el: "component",
                    use: "checkbox",
                    props: {
                      label: "Tomás Ortega",
                      description: "",
                      checked: false,
                    },
                  },
                  {
                    el: "component",
                    use: "checkbox",
                    props: {
                      label: "Yuki Tanaka",
                      description: "",
                      checked: true,
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
      id: "recording-shows-who-was-there",
      title: "A processed recording shows who was there",
      description: "While a recording is still on its way to the server, its card has a status and no faces. Once the meeting exists, the list's next read brings its participants and the card draws them as a stack.",
      platforms: ["mobile"],
      width: 343,
      steps: [
        {
          kind: "data",
          title: "A recording still processing has no faces yet",
          detail: "Until the server has made a meeting of it, the capture queue's item draws as a pending card: a status, a stage tracker, no people.",
          code: "const pending = captureItems.filter((it) => it.type === 'voice' && it.state !== 'processed' && !it.meetingId)",
        },
        {
          kind: "trigger",
          title: "The tab comes back into view",
          detail: "Recordings refetches every time it is focused, so a meeting finished a moment ago shows up without a relaunch.",
          code: "useFocusEffect(useCallback(() => { void refetch(); }, [refetch]))",
        },
        {
          kind: "data",
          title: "The page answers with the meeting and its participants",
          code: "useQuery({ queryKey: [...qk.meetings, page], queryFn: () => meetings.page(page) })",
        },
        {
          kind: "state",
          title: "The card hands the names to the stack",
          code: "<AvatarStack names={meeting.participants.map((p) => p.name)} userIds={meeting.participants.map((p) => p.personRef)} size={22} max={4} />",
        },
        {
          kind: "result",
          title: "Four faces, +N, and everyone counted beside it",
          detail: "AvatarStack draws the first four with a ring in the card's colour and +N for the rest on the face discs' own grey; the number after it is the total. A face whose photo fails falls back on its own, and the stack never shrinks.",
          code: "const shown = names.slice(0, max); const extra = names.length - shown.length;",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          scene: {
            el: "view",
            style: {
              width: 343,
            },
            children: [
              {
                el: "component",
                use: "card",
                props: {
                  interactive: true,
                  label: "Open Weekly sync",
                  children: [
                    {
                      el: "text",
                      text: "Weekly sync",
                      style: {
                        fontSize: "$text.body",
                        fontWeight: "$font.weightMedium",
                        color: "$fg.strong",
                      },
                    },
                    {
                      el: "text",
                      text: "Today · 10:00 · 32 min",
                      style: {
                        fontSize: "$text.bodySm",
                        color: "$fg.muted",
                      },
                    },
                    {
                      el: "component",
                      use: "tag",
                      props: {
                        label: "Transcribing",
                        tone: "info",
                        size: "sm",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 3,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              width: 343,
            },
            children: [
              {
                el: "component",
                use: "card",
                props: {
                  interactive: true,
                  label: "Open Weekly sync",
                  children: [
                    {
                      el: "text",
                      text: "Weekly sync",
                      style: {
                        fontSize: "$text.body",
                        fontWeight: "$font.weightMedium",
                        color: "$fg.strong",
                      },
                    },
                    {
                      el: "text",
                      text: "Today · 10:00 · 32 min",
                      style: {
                        fontSize: "$text.bodySm",
                        color: "$fg.muted",
                      },
                    },
                    {
                      el: "view",
                      style: {
                        direction: "row",
                        align: "center",
                        gap: "$space.sm",
                      },
                      children: [
                        {
                          el: "component",
                          use: "avatar-stack",
                          props: {
                            people: [
                              {
                                name: "Priya Raman",
                                identity: "indigo",
                              },
                              {
                                name: "Marcus Chen",
                                identity: "green",
                              },
                              {
                                name: "Aisha Bello",
                                identity: "ochre",
                              },
                              {
                                name: "Tomás Ortega",
                                identity: "red",
                              },
                              {
                                name: "Yuki Tanaka",
                                identity: "ink",
                              },
                              {
                                name: "Lena Fischer",
                                identity: "green",
                              },
                            ],
                            max: 4,
                            size: "xs",
                          },
                        },
                        {
                          el: "text",
                          text: "6",
                          style: {
                            fontSize: "$text.bodySm",
                            color: "$fg.faint",
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
