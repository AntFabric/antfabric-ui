import type { ComponentDocs, Scene } from "../../types";

/** A small picture of a page layout, for a card's `preview`: a ground with a bar on the side named and the page beside it. */
const layout = (side: "left" | "top" | "none"): Scene => ({
  el: "view",
  style: { height: 64, bg: "$surface.recessed", padding: 8, gap: 6, direction: side === "top" ? "column" : "row" },
  children: [
    ...(side === "none" ? [] : [{ el: "view" as const, style: side === "top" ? { height: 10, bg: "$border.default", radius: 3 } : { width: 18, bg: "$border.default", radius: 3 } }]),
    { el: "view", style: { grow: 1, bg: "$surface.card", radius: 3 } },
  ],
});

/** The layouts a workspace can pick, as cards: one in use, one the default, one not ready yet. */
const layouts = [
  { key: "sidebar", label: "Sidebar", description: "Spaces and channels in a rail on the left.", preview: layout("left"), tags: [{ label: "In use", tone: "success" }] },
  { key: "top", label: "Top bar", description: "Spaces across the top, more room for the page.", preview: layout("top"), tags: [{ label: "Default" }] },
  { key: "focus", label: "Focus", description: "No navigation until you ask for it.", preview: layout("none"), tags: [{ label: "Coming soon", tone: "info" }], disabled: true },
];

const docs: ComponentDocs = {
  id: "radio-group",
  name: "Radio group",
  category: "inputs",
  level: "molecule",
  status: "stable",
  description: "Choose exactly one of a few, all visible at once. The chosen option is marked with a brand-coloured dot — a dot, not a tick, because a tick is the multi-select vocabulary. On the desktop a short answer row can be drawn as pills, where the chosen pill goes ink so it never competes with the primary button. A choice that needs a picture or a few more words (a layout, a plan) is drawn as cards, the chosen one edged in the strong ink.",
  props: {
    options: {
      type: "array",
      required: true,
      description: "[{ key, label, description?, disabled?, preview?, tags? }]. Two to six options; more than that is a Select. `preview` (a node: a small picture of what the option looks like) and `tags` ([{ label, tone? }], the kit's Tag chips after the label: \"In use\", \"Default\") are drawn by `appearance=\"cards\"` only.",
      sample: [
        {
          key: "all",
          label: "Every message",
        },
        {
          key: "mentions",
          label: "Mentions only",
        },
        {
          key: "none",
          label: "Nothing",
        },
      ],
    },
    value: {
      type: "string",
      default: "",
      sample: "mentions",
      description: "The chosen option's key. Empty is allowed and lights nothing — an unanswered question is genuinely unanswered.",
    },
    label: {
      type: "string",
      default: "",
      sample: "Notify me about",
      description: "The group's name: the question being answered.",
    },
    hideLabel: {
      type: "boolean",
      default: false,
      description: "Keep the name for screen readers but do not draw it, when a heading above already asks the question.",
    },
    appearance: {
      type: "enum",
      options: ["list", "pills", "cards"],
      default: "list",
      description: "list is a ring and a label per row. pills is the desktop's ChoicePills — a wrapping row of short answers (Yes · No · Maybe); the phone draws them as the list. cards is a card per option, for a choice that needs a picture or a few more words (a layout, a plan): its `preview` on top, its label with its `tags`, its description. The chosen card takes a 2px edge in the strong ink, not the brand, and draws no ring. Web and desktop lay the cards out in as many columns of at least `radioGroup.cardMinW` (220) as fit; the phone stacks them one per row.",
    },
    disabled: {
      type: "boolean",
      default: false,
      description: "The whole group, for a write in flight or a person who may read but not change it. Say why near it.",
    },
    onValueChange: {
      type: "event",
      args: "key: string",
      changes: "value",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "role=\"radiogroup\" over <button role=\"radio\"> options (or pills), inline styles over `t`; roving tabindex and arrow keys that move and select, skipping disabled options; hover, press and focus from useInteraction; `value` through useControllable",
      import: "import { RadioGroup } from \"@antfabric/ui-react\"",
      notes: [
        "Pressing an option sets `value` (an `on.press` action, so the catalogue preview is interactive): the new dot grows from the ring's centre as the old one shrinks away, and a pill's ink fill cross-fades. Disabled options set nothing.",
        "appearance=\"cards\": each card is the <button role=\"radio\">, in a CSS grid of as many columns of at least `radioGroup.cardMinW` as fit. Hover takes the edge to border.default; the chosen card's edge is the strong ink at 2px (a hairline plus an inset ring, so nothing moves), never the brand. The preview is aria-hidden; the card is named by its label and its tags (aria-labelledby), and its description is its aria-describedby.",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Enters the group at the chosen option (or the first, if none), and leaves it",
        },
        {
          keys: "ArrowUp / ArrowDown / ArrowLeft / ArrowRight",
          action: "Moves to and selects the previous / next option, skipping disabled ones",
        },
        {
          keys: "Space",
          action: "Selects the focused option when nothing is chosen yet",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same radiogroup as web; appearance=\"pills\" draws the ChoicePills look (36px ink pills)",
      import: "import { RadioGroup } from \"@antfabric/ui-react\"",
      notes: [
        "pills: 36px, 14px padding, caption semibold. The chosen pill goes INK (surface.inverse), the design's one deliberate exception to coral selection — a wizard screen already has a coral primary button, and two corals cannot both mean \"commit\".",
        "Only unchosen pills take the hover fill; hovering the pill you already chose would be feedback for an action that does nothing.",
        "Disabled is a real disabled attribute, never pointer-events:none — a row that looks inert but still fires on Space only protects the mouse user.",
        "Inside a menu the same choice is three menuitemradio rows with an 8px dot (ChannelPane's Notify me about), and the menu stays open after a choice — the dot moving is the confirmation. That is Menu's job; this component is the form version.",
        "Pressing an option or pill sets `value`: the dot scales in from the ring's centre over 180ms as the old one shrinks out, and the chosen pill's ink fades in.",
      ],
      keyboard: [
        {
          keys: "Arrow keys",
          action: "Move to and select the next option",
        },
        {
          keys: "Tab",
          action: "Enters and leaves the group",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A View (accessibilityRole radiogroup) of Pressable rows (radio), StyleSheet over useTheme(); the dot scales in and out with Animated.timing; `value` through useControllable. Always the list — pills are web and desktop only",
      import: "import { RadioGroup } from \"@antfabric/ui-react-native\"",
      notes: [
        "Each option is a 44pt row: a 20pt ring with a 1.5pt stroke, a 10pt dot when chosen, 12pt gap, a 16pt medium label. The chosen ring is primary; the rest are borderStrong (#DEDEDE).",
        "Radio buttons, not tabs (owner, 2026-10-15: \"Tab isn't a right way to take the input\").",
        "Disabled dims the whole group to 45% and answers nothing; the person still reads the value.",
        "The ring scales to 0.9 while pressed — the phone's press feedback on every target. Selection haptic on change.",
        "Tapping a row sets `value`: the dot scales in from the centre while the previous one shrinks out.",
        "appearance=\"cards\" stacks the cards one per row, each a Pressable radio; `pills` is drawn as the list.",
      ],
      gestures: [
        {
          gesture: "Tap a row",
          action: "Chooses it; tapping the chosen row does nothing",
        },
      ],
    },
  },
  a11y: {
    role: "radiogroup",
    label: "{label}",
    notes: [
      "Each option is role=radio with aria-checked; the visible legend is aria-hidden because it is already the group's name. Inside a FormField with no label of its own, the field's label names the group.",
      "The group is one tab stop (the chosen option, or the first when nothing is chosen). The arrow keys move to the next enabled option and choose it, wrapping; with nothing chosen the first arrow press moves too. Left and right follow the direction of the tree.",
      "An option's description is its aria-describedby (the phone: its accessibilityHint). Inside a FormField the group takes the field's description, error, aria-invalid and aria-required.",
      "As cards, the card itself is the radio (aria-checked), so the choice is announced as it is for the list; the card draws no ring, since its edge shows the choice, and its preview is hidden from screen readers. Its name is its label then its tags (\"Sidebar In use\"; the phone says the tags in its hint, before the description). A card that cannot be chosen is disabled, dimmed and skipped by the arrows.",
    ],
  },
  examples: [
    {
      name: "Notify me about",
      props: {},
      width: 280,
    },
    {
      name: "With descriptions",
      props: {
        options: [
          {
            key: "all",
            label: "Every message",
            description: "Every new message in #release-train notifies you.",
          },
          {
            key: "mentions",
            label: "Mentions only",
            description: "When someone @mentions you or replies in your thread.",
          },
          {
            key: "none",
            label: "Nothing",
            description: "No notifications. A direct @mention still shows a badge.",
          },
        ],
      },
      width: 340,
    },
    {
      name: "Who can post",
      props: {
        label: "Who can post",
        value: "everyone",
        options: [
          {
            key: "everyone",
            label: "Everyone",
          },
          {
            key: "admins",
            label: "Admins only",
          },
        ],
      },
      width: 320,
    },
    {
      name: "Going?",
      props: {
        appearance: "pills",
        label: "Going?",
        value: "accepted",
        options: [
          {
            key: "accepted",
            label: "Yes",
          },
          {
            key: "declined",
            label: "No",
          },
          {
            key: "tentative",
            label: "Maybe",
          },
        ],
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Filter by kind",
      props: {
        appearance: "pills",
        label: "Filter results by kind",
        hideLabel: true,
        value: "channels",
        options: [
          {
            key: "all",
            label: "All",
          },
          {
            key: "people",
            label: "People",
          },
          {
            key: "channels",
            label: "Channels",
          },
          {
            key: "projects",
            label: "Projects",
          },
          {
            key: "meetings",
            label: "Meetings",
          },
        ],
      },
      platforms: ["web", "desktop"],
      width: 460,
    },
    {
      name: "Disabled",
      props: {
        disabled: true,
      },
      width: 280,
    },
    {
      name: "Layout cards",
      description: "appearance=\"cards\": each option is a card with a picture, its tags and a line. The chosen card takes the strong ink's 2px edge; the one that is not ready yet is dimmed and cannot be chosen.",
      props: {
        appearance: "cards",
        label: "Workspace layout",
        value: "sidebar",
        options: layouts,
      },
      width: 720,
    },
    {
      name: "Plan cards",
      description: "Cards with no picture: a label, a tag and a line each.",
      props: {
        appearance: "cards",
        label: "Plan",
        value: "",
        options: [
          { key: "team", label: "Team", description: "Up to 20 people, 90 days of history.", tags: [{ label: "Current" }] },
          { key: "business", label: "Business", description: "Unlimited people and history, SSO and audit.", tags: [{ label: "Recommended", tone: "brand" }] },
        ],
      },
      width: 560,
    },
  ],
  matrix: [
    {
      prop: "appearance",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "Nothing chosen yet",
      platforms: ["web", "desktop", "mobile"],
      handling: "An unanswered invitation lights nothing; pre-selecting an option would show a decision nobody made. Tab lands on the first option and Space or an arrow chooses. A required group with no answer says so under it on submit.",
      example: {
        name: "Unanswered",
        props: {
          appearance: "pills",
          label: "Going?",
          value: "",
          options: [
            {
              key: "accepted",
              label: "Yes",
            },
            {
              key: "declined",
              label: "No",
            },
            {
              key: "tentative",
              label: "Maybe",
            },
          ],
        },
      },
    },
    {
      title: "Arrow keys choose as they move",
      platforms: ["web", "desktop"],
      handling: "WAI-ARIA radios select on arrow, so walking from Every message to Nothing passes through Mentions only. Writes are debounced 400 ms: that walk sends one request, not two, and the dot shows each step immediately.",
    },
    {
      title: "A write in flight, or refused",
      platforms: ["web", "desktop", "mobile"],
      handling: "The dot moves at once. If the server refuses, it moves back with a toast: \"Couldn't change notifications for #release-train. Try again.\" A group whose write must finish first (an RSVP to Google Calendar) is disabled while it runs, with a real disabled attribute so Space cannot fire either.",
    },
    {
      title: "An option that cannot be chosen",
      platforms: ["web", "desktop", "mobile"],
      handling: "A disabled option stays visible, dimmed, with its reason as its description; arrow keys skip it. If the current value is itself not settable here (a channel posting policy set to specific roles in the admin console), the group is replaced by a sentence saying where it can be changed.",
      example: {
        name: "One unavailable",
        props: {
          label: "Who can post",
          value: "everyone",
          options: [
            {
              key: "everyone",
              label: "Everyone",
            },
            {
              key: "admins",
              label: "Admins only",
              description: "Project channels follow the project's posting rules.",
              disabled: true,
            },
          ],
        },
        width: 320,
      },
    },
    {
      title: "Long labels and narrow columns",
      platforms: ["web", "desktop", "mobile"],
      handling: "List labels wrap and the ring stays on the first line. Pills never wrap their own text; the row wraps instead, so a pill moves to the next line whole.",
      example: {
        name: "Wrapping pills",
        props: {
          appearance: "pills",
          label: "Filter results by kind",
          value: "all",
          options: [
            {
              key: "all",
              label: "All",
            },
            {
              key: "people",
              label: "People",
            },
            {
              key: "channels",
              label: "Channels",
            },
            {
              key: "projects",
              label: "Projects",
            },
            {
              key: "meetings",
              label: "Meetings",
            },
          ],
        },
        platforms: ["web", "desktop"],
        width: 240,
      },
    },
    {
      title: "Changed on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "The per-channel level is an account setting: choosing Nothing on the phone moves the desktop's dot live, even with the menu open. A DM has no level on the server, so the control is never offered on a DM rather than offered and ignored.",
    },
    {
      title: "Ring contrast",
      platforms: ["web", "desktop", "mobile"],
      handling: "The unchosen ring is border.default on desktop and border.muted (#DEDEDE) on the phone — 1.6:1 and 1.3:1 on white, under WCAG 2.2's 3:1 for a control boundary. The label identifies each option, but the gap is recorded rather than hidden; proposed fix for the owner: text.placeholder (3.3:1) for the unchosen ring on both.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Rows grow past 44pt with the text and the ring stays aligned with the first line; descriptions wrap without limit.",
    },
    {
      title: "Cards in a narrow column",
      platforms: ["web", "desktop", "mobile"],
      handling: "Cards take as many columns of at least `radioGroup.cardMinW` (220) as fit and wrap; narrower than one, a card is the column's full width. A long label wraps and its tags move under it whole. The phone always stacks the cards one per row.",
      example: {
        name: "Narrow cards",
        props: {
          appearance: "cards",
          label: "Workspace layout",
          value: "top",
          options: layouts,
        },
        width: 200,
      },
    },
  ],
  related: ["segmented-control", "select", "checkbox", "menu"],
  flows: [
    {
      id: "answer-going",
      title: "Answer Going? on a meeting",
      description: "Three pills answer one invitation. The answer shows at once and is written to Google behind it; if Google refuses, the old answer comes back.",
      platforms: ["web", "desktop"],
      width: 320,
      steps: [
        {
          kind: "data",
          title: "The answer is read off the event",
          detail: "Shown only when Google lists you as a guest; an organiser with no guests has nothing to answer. An unanswered invitation lights nothing, so no pill is chosen for you.",
          code: "const mine = event.attendees.find((x) => x.self) ?? null  // value={rsvpChoiceLabel(mine.response)}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The meeting comes from the calendar query",
          code: "const { data: event } = useSuspenseQuery(meetingQuery(id))  // value={event.self?.response}",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Yes is pressed",
          detail: "A click, or ← → to move and choose. Re-picking the answer you already gave writes nothing.",
        },
        {
          kind: "event",
          title: "onValueChange(key) fires",
          detail: "The desktop's ChoicePills hands back the label and the screen maps it to Google's value; this spec hands back the option's key directly.",
          code: "onValueChange?.(item.key)  // 'accepted'",
        },
        {
          kind: "state",
          title: "The answer is written into the store first",
          detail: "The pill goes ink at once. Only this meeting's pills disable while it saves, and Saving… appears beside them; another meeting's write never greys these.",
          code: "set((s) => ({ mtSavingIds: [...(s.mtSavingIds ?? []), eventId] }))  ·  set((s) => ({ calEvents: { ...s.calEvents, [eventId]: optimistic } }))",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The mutation answers optimistically",
          code: "useMutation({ mutationFn: rsvp, onMutate: setOptimistic, onError: rollback, onSettled: invalidateMeeting })",
          platforms: ["web"],
        },
        {
          kind: "effect",
          title: "Google gets the answer",
          detail: "On failure the old answer comes back with Could not save your answer. Try again. If the meeting changed while you answered, the calendar reloads instead.",
          code: "const answered = await backend.calendar.rsvp(eventId, response)",
        },
        {
          kind: "motion",
          title: "The chosen pill's ink fades in",
          detail: "The old pill fades back to white as the new one fills; there is no travelling highlight. In the list version the dot grows from the ring's centre over 180ms.",
        },
        {
          kind: "result",
          title: "Yes stays chosen",
          detail: "Saving… goes away and the pills take presses again.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {
            appearance: "pills",
            label: "Going?",
            value: "",
            options: [
              {
                key: "accepted",
                label: "Yes",
              },
              {
                key: "declined",
                label: "No",
              },
              {
                key: "tentative",
                label: "Maybe",
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          props: {
            appearance: "pills",
            label: "Going?",
            value: "",
            options: [
              {
                key: "accepted",
                label: "Yes",
              },
              {
                key: "declined",
                label: "No",
              },
              {
                key: "tentative",
                label: "Maybe",
              },
            ],
          },
        },
        {
          step: 2,
          press: 0,
          hold: 900,
          props: {
            appearance: "pills",
            label: "Going?",
            value: "",
            options: [
              {
                key: "accepted",
                label: "Yes",
              },
              {
                key: "declined",
                label: "No",
              },
              {
                key: "tentative",
                label: "Maybe",
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1500,
          platforms: ["desktop"],
          props: {
            appearance: "pills",
            label: "Going?",
            value: "accepted",
            disabled: true,
            options: [
              {
                key: "accepted",
                label: "Yes",
              },
              {
                key: "declined",
                label: "No",
              },
              {
                key: "tentative",
                label: "Maybe",
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1500,
          platforms: ["web"],
          props: {
            appearance: "pills",
            label: "Going?",
            value: "accepted",
            disabled: true,
            options: [
              {
                key: "accepted",
                label: "Yes",
              },
              {
                key: "declined",
                label: "No",
              },
              {
                key: "tentative",
                label: "Maybe",
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1600,
          props: {
            appearance: "pills",
            label: "Going?",
            value: "accepted",
            options: [
              {
                key: "accepted",
                label: "Yes",
              },
              {
                key: "declined",
                label: "No",
              },
              {
                key: "tentative",
                label: "Maybe",
              },
            ],
          },
        },
      ],
    },
    {
      id: "who-can-post",
      title: "Choose who can post, then Save",
      description: "A radio group in a settings form. Choosing changes the draft; Save in the header sends only what differs from the server.",
      platforms: ["mobile"],
      width: 343,
      steps: [
        {
          kind: "data",
          title: "The form starts from the channel",
          detail: "Only an owner or admin sees this section. A channel set to organisation roles in the admin console shows a sentence instead of a control the server would refuse.",
          code: "setBaseline(serverForm); setForm(serverForm)  // value={form.postPolicy}",
        },
        {
          kind: "trigger",
          title: "Admins only is tapped",
          detail: "Tapping the option already chosen fires nothing. Today's row has no press feedback; this spec scales the ring to 0.9 under the finger and adds a selection haptic.",
          code: "onPress={() => { if (!chosen) onChange(option.value) }}",
        },
        {
          kind: "event",
          title: "onValueChange(key) fires",
          code: "onValueChange?.(item.key)  // onChange={(postPolicy) => setForm({ ...form, postPolicy })}",
        },
        {
          kind: "state",
          title: "The draft differs from the server",
          detail: "Nothing is sent yet. Save in the header turns on because the patch is no longer empty.",
          code: "const patch = channelPatchOf(baseline, form)  ·  const dirty = Object.keys(patch).length > 0",
        },
        {
          kind: "motion",
          title: "The dot moves",
          detail: "Today the dot appears at once on the next render. This spec scales the new dot in from the ring's centre while the old one shrinks out.",
        },
        {
          kind: "trigger",
          title: "Save is tapped",
          detail: "Save shows a spinner while the request is in flight.",
        },
        {
          kind: "effect",
          title: "Only the change is sent",
          code: "update.mutate(patch, { onSuccess: () => toast('Channel updated', 'success'), onError: surface('The channel could not be updated.') })",
        },
        {
          kind: "result",
          title: "A toast says the channel was updated",
          detail: "From now on only admins can post in #release-train; everyone else learns that in the composer, where it matters.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              width: 343,
              minHeight: 260,
              gap: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "radio-group",
                props: {
                  label: "Who can post",
                  value: "everyone",
                  options: [
                    {
                      key: "everyone",
                      label: "Everyone",
                    },
                    {
                      key: "admins",
                      label: "Admins only",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 1,
          press: 1,
          hold: 900,
          scene: {
            el: "view",
            style: {
              width: 343,
              minHeight: 260,
              gap: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "radio-group",
                props: {
                  label: "Who can post",
                  value: "everyone",
                  options: [
                    {
                      key: "everyone",
                      label: "Everyone",
                    },
                    {
                      key: "admins",
                      label: "Admins only",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1500,
          scene: {
            el: "view",
            style: {
              width: 343,
              minHeight: 260,
              gap: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "radio-group",
                props: {
                  label: "Who can post",
                  value: "admins",
                  options: [
                    {
                      key: "everyone",
                      label: "Everyone",
                    },
                    {
                      key: "admins",
                      label: "Admins only",
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
          scene: {
            el: "view",
            style: {
              width: 343,
              minHeight: 260,
              gap: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "radio-group",
                props: {
                  label: "Who can post",
                  value: "admins",
                  options: [
                    {
                      key: "everyone",
                      label: "Everyone",
                    },
                    {
                      key: "admins",
                      label: "Admins only",
                    },
                  ],
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  alignSelf: "center",
                },
                props: {
                  message: "Channel updated",
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
