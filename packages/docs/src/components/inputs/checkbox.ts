import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "checkbox",
  name: "Checkbox",
  category: "inputs",
  level: "atom",
  status: "stable",
  description: "The checkbox: one rounded square, one size, brand-filled when ticked. It means \"several of these can be on\" — a single choice among options is a radio, marked with a dot, never a tick. Ticked, unticked, or mixed for a parent whose children disagree.",
  props: {
    label: {
      type: "string",
      sample: "Private channel",
      required: true,
      description: "The accessible name, and the visible text unless hideLabel is set.",
    },
    description: {
      type: "string",
      default: "",
      sample: "Only members can find this channel.",
      description: "A second line under the label. Say what ticking it does, or why it cannot be changed.",
    },
    checked: {
      type: "boolean",
      default: false,
      sample: true,
    },
    indeterminate: {
      type: "boolean",
      default: false,
      description: "Some but not all of the items this box stands for are ticked. Drawn as a dash; aria-checked=\"mixed\". Ticking it ticks them all.",
    },
    hideLabel: {
      type: "boolean",
      default: false,
      description: "Draw the box alone — the task table's done toggle. The label is still the accessible name and the tooltip.",
    },
    disabled: {
      type: "boolean",
      default: false,
    },
    onCheckedChange: {
      type: "event",
      args: "checked: boolean",
      changes: "checked",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<button role=\"checkbox\"> holding the box and the label, inline styles over `t`; hover, press and focus from useInteraction; `checked` through useControllable (a press also clears `indeterminate`); the tick pops in with enter(\"pop\")",
      import: "import { Checkbox } from \"@antfabric/ui-react\"",
      notes: [
        "Never the OS checkbox (<input type=\"checkbox\"> with accent-color): it matches nothing in this design and differs per browser.",
        "In forced-colors mode (Windows High Contrast) the box keeps its border in ButtonText and the tick in HighlightText on Highlight, so the state survives with no brand colour.",
        "Pressing toggles `checked` (through useControllable, so the catalogue preview is interactive): the fill cross-fades and the tick pops in. A mixed box becomes checked and loses its dash.",
      ],
      keyboard: [
        {
          keys: "Space",
          action: "Toggles",
        },
        {
          keys: "Tab",
          action: "Moves to the next control; a list of checkboxes is a tab stop each",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <button role=\"checkbox\"> as web, at desktop density: the 15px box with a 2px ring and a 9px tick at stroke 3.4",
      import: "import { Checkbox } from \"@antfabric/ui-react\"",
      notes: [
        "ONE size: 15px, 2px ring, 4px corner, a 9px tick (0.6 of the box, so it fits inside the rings). There is no size prop and its absence is the feature (owner: \"Checkbox sizes are diff. Need the consistency\"). A bigger target grows the row's padding, never the box.",
        "Two structural uses, one drawing: when the BOX is the control (the task table's done toggle) it is this button with hideLabel; when the ROW is the control (filter menu rows, the ⚙ menu's Notification sound) the row carries role and state and the box is an aria-hidden picture. Never nest one button in another.",
        "Inside a menu the row is role=menuitemcheckbox with the box TRAILING the label, and clicking does not close the menu — the tick changing is the confirmation.",
        "The round/square split is retired (ADR-0527): a round box coming back needs the owner, not a revert.",
        "Pressing toggles `checked` and clears `indeterminate` (mixed → checked, as Radix does); the coral fill fades in over 150ms and the tick pops.",
      ],
      keyboard: [
        {
          keys: "Space / Enter",
          action: "Toggles",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable (accessibilityRole checkbox, checked \"mixed\" for the dash) over a StyleSheet from useTheme(); the box scales to 0.92 while pressed and the tick pops in through <Enter motion=\"pop\">; `checked` through useControllable. The tick keeps the kit Icon's stroke; haptics are left to the app",
      import: "import { Checkbox } from \"@antfabric/ui-react-native\"",
      notes: [
        "20pt box, 5pt corner, 12pt tick, in a row at least 44pt tall; the whole row is the tap target.",
        "Open decision: V2's Forward and Add participant sheets draw a ticked CIRCLE at the row's end (ADR-9416), while the desktop retired circles for the square (ADR-0527). This spec draws the square everywhere; the owner should confirm which one shape the phone keeps.",
        "Light selection haptic on toggle.",
        "Tapping toggles `checked` (mixed → checked); the box eases back from its 0.92 press scale while the tick pops in.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Toggles; the box scales to 0.92 while pressed",
        },
      ],
    },
  },
  a11y: {
    role: "checkbox",
    label: "{label}",
    notes: [
      "aria-checked is true, false or mixed; the box is aria-hidden so the state is not announced twice.",
      "The description is the control's aria-describedby (the phone: its accessibilityHint), so \"Private channel, checkbox, checked. Only members can find this channel.\" Inside a FormField the field's description and error are read after it, and the control is marked aria-invalid and aria-required.",
      "A box drawn alone has a target of at least 24px on the web in the neutral theme, and 44pt on the phone (its touch area is grown, not its drawing).",
    ],
  },
  examples: [
    {
      name: "Checked with description",
      props: {},
      width: 320,
    },
    {
      name: "Unchecked",
      props: {
        checked: false,
        label: "Only show unread",
        description: "",
      },
    },
    {
      name: "Mixed",
      props: {
        label: "Everyone in #design-crit",
        description: "3 of 7 people selected",
        checked: false,
        indeterminate: true,
      },
      width: 320,
    },
    {
      name: "Box only",
      props: {
        label: "Mark AF-1182 done",
        hideLabel: true,
        checked: false,
      },
    },
    {
      name: "Disabled, with reason",
      props: {
        label: "Private channel",
        description: "A channel filed under a project stays private.",
        disabled: true,
      },
      width: 320,
    },
  ],
  matrix: [
    {
      prop: "checked",
    },
    {
      prop: "indeterminate",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "A parent over a partial selection",
      platforms: ["web", "desktop", "mobile"],
      handling: "Select-all over 3 of 7 people shows the dash and aria-checked=\"mixed\". Pressing it ticks all seven — never clears them, because the person reaching for it nearly always means \"all\". Pressing again clears all. The description says the count.",
      example: {
        name: "3 of 7",
        props: {
          label: "Share with everyone in this meeting",
          description: "3 of 7 people selected",
          checked: false,
          indeterminate: true,
        },
        width: 320,
      },
    },
    {
      title: "A long label",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label wraps; it is never truncated, because the end of a consent or a setting is often the part that matters. The box stays aligned with the first line.",
      example: {
        name: "Wrapping",
        props: {
          label: "Also send the meeting notes and every action item to people who were invited but did not join",
          description: "",
          checked: true,
        },
        width: 260,
      },
    },
    {
      title: "A save in flight, or refused",
      platforms: ["web", "desktop", "mobile"],
      handling: "The tick flips at once. If the server refuses, it flips back and a toast says \"Couldn't update Private channel. Try again.\" Rapid toggling coalesces: one request in flight, and the last value wins. No spinner replaces the box.",
    },
    {
      title: "Disabled must say why",
      platforms: ["web", "desktop", "mobile"],
      handling: "A greyed box with no reason is a dead end: pair disabled with a description that names the rule or who can change it. A tooltip is not enough — it is unreachable on a disabled control by pointer and by keyboard.",
    },
    {
      title: "Unticked edge contrast",
      platforms: ["web", "desktop", "mobile"],
      handling: "The unticked ring is border.default (rgba(51,51,51,.24)), about 1.6:1 on white — under WCAG 2.2's 3:1 for a control's boundary. The label beside it carries identification, so the box is still usable, but the gap is recorded here rather than hidden. Proposed fix for the owner: text.placeholder (3.3:1) for the unticked ring only.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "The label and description grow and wrap; the 20pt box does not scale and stays on the first line. The row's 44pt minimum grows with the text.",
    },
    {
      title: "Changed on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "An account-level setting ticked on the phone arrives as an event and the box updates in place without stealing focus. A device-level one (Notification sound) does not sync — it is about this machine.",
    },
  ],
  related: ["switch", "radio-group", "menu"],
  flows: [
    {
      id: "make-it-private",
      title: "Tick Make it private in New channel",
      description: "A checkbox in a form with a Create button: ticking it changes the form, and nothing reaches the server until the form is sent.",
      platforms: ["web", "desktop"],
      width: 380,
      steps: [
        {
          kind: "data",
          title: "The dialog's form lives in the store",
          detail: "New channel edits one store object, chForm. A channel filed under a project is private by rule, so there the row is aria-disabled and its second line says why: Only private channels can be in a project.",
          code: "const f = s.chForm  // aria-checked={f.private}  aria-disabled={inProject}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The dialog keeps its fields in form state",
          detail: "The route's dialog holds the draft locally; the project list it checks against comes from the projects query, so a project channel opens already ticked and locked.",
          code: "const [form, setForm] = useState({ name: '', private: false, projects: [] })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The row is pressed",
          detail: "The whole card is the control, not just the box: a click anywhere on it, or Space with it focused.",
        },
        {
          kind: "event",
          title: "onCheckedChange(true) fires",
          detail: "It carries the value the box is moving to, so the caller never has to read the old one back.",
          code: "onCheckedChange?.(!checked)  // true",
        },
        {
          kind: "state",
          title: "The store sets the form field",
          code: "setChf: (k, v) => set((s) => (s.chForm ? { chForm: { ...s.chForm, [k]: v } } : {}))",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The dialog sets its draft",
          code: "setForm((f) => ({ ...f, private: checked }))",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The box fills and the tick pops",
          detail: "The coral fill and the card's soft tint fade in over the fast duration while the tick pops. Unticking fades them back with no exit motion.",
          enter: "pop",
        },
        {
          kind: "effect",
          title: "Create channel sends it",
          code: "backend.channels.create({ name: f.name.trim(), kind: 'channel', purpose: f.purpose || null, private: f.private === true, … })",
        },
        {
          kind: "result",
          title: "The new channel arrives with a lock",
          detail: "#launch-plan appears in the sidebar with the lock, and only the people invited can find it.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          props: {
            label: "Make it private",
            description: "Invite only. It will not appear for anyone who is not a member.",
            checked: false,
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          props: {
            label: "Make it private",
            description: "Invite only. It will not appear for anyone who is not a member.",
            checked: false,
          },
        },
        {
          step: 2,
          press: 0,
          hold: 900,
          props: {
            label: "Make it private",
            description: "Invite only. It will not appear for anyone who is not a member.",
            checked: false,
          },
        },
        {
          step: 6,
          hold: 1800,
          props: {
            label: "Make it private",
            description: "Invite only. It will not appear for anyone who is not a member.",
            checked: true,
          },
        },
      ],
    },
    {
      id: "pick-who-to-forward-to",
      title: "Pick the conversations to forward to",
      description: "Several boxes, one CTA. Each tap adds or removes one conversation, and the button counts what is ticked.",
      platforms: ["mobile"],
      steps: [
        {
          kind: "data",
          title: "The sheet lists channels and people",
          detail: "Rows come from the channels and the directory the caller passes in, grouped and filtered by the sheet's search. Opening the sheet clears the last selection, so a forward never starts with someone already ticked.",
          code: "forwardPickerRows({ channels, people, peers, me, directory, myAvatarUrl, query })",
        },
        {
          kind: "trigger",
          title: "#design-crit is tapped",
          detail: "The whole row is the target and washes coral-soft while pressed. Rows take no taps while a forward is sending.",
        },
        {
          kind: "event",
          title: "onCheckedChange(true) fires for that row",
          code: "onCheckedChange?.(!checked)  // onPress={() => toggle(r.kind, r.id)}",
        },
        {
          kind: "state",
          title: "The sheet adds the id to its picks",
          detail: "Picks live in the sheet as channel ids and person ids; each box draws from them, so tapping again takes the id out.",
          code: "setPicked((p) => ({ ...p, [key]: held.includes(id) ? held.filter((x) => x !== id) : [...held, id] }))",
        },
        {
          kind: "motion",
          title: "The tick pops in",
          detail: "Today the phone draws a ticked circle at the row's end (ADR-9416); this spec draws the square everywhere, which the owner still has to confirm.",
          enter: "pop",
        },
        {
          kind: "result",
          title: "The CTA counts the picks",
          detail: "Forward stays disabled at zero and reads Forward to 1 once one is ticked.",
          code: "title={busy ? 'Forwarding…' : total === 0 ? 'Forward' : `Forward to ${String(total)}`}",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              width: 375,
              paddingX: "$gutter.pane",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "#platform-eng",
                  description: "",
                  checked: false,
                },
              },
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "#design-crit",
                  description: "",
                  checked: false,
                },
              },
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "Priya Raman",
                  description: "priya.raman@example.com",
                  checked: false,
                },
              },
              {
                el: "component",
                use: "button",
                style: {
                  marginTop: "$space.md",
                },
                props: {
                  label: "Forward",
                  size: "lg",
                  full: true,
                  disabled: true,
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
              width: 375,
              paddingX: "$gutter.pane",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "#platform-eng",
                  description: "",
                  checked: false,
                },
              },
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "#design-crit",
                  description: "",
                  checked: false,
                },
              },
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "Priya Raman",
                  description: "priya.raman@example.com",
                  checked: false,
                },
              },
              {
                el: "component",
                use: "button",
                style: {
                  marginTop: "$space.md",
                },
                props: {
                  label: "Forward",
                  size: "lg",
                  full: true,
                  disabled: true,
                },
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
              width: 375,
              paddingX: "$gutter.pane",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "#platform-eng",
                  description: "",
                  checked: false,
                },
              },
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "#design-crit",
                  description: "",
                  checked: true,
                },
              },
              {
                el: "component",
                use: "checkbox",
                props: {
                  label: "Priya Raman",
                  description: "priya.raman@example.com",
                  checked: false,
                },
              },
              {
                el: "component",
                use: "button",
                style: {
                  marginTop: "$space.md",
                },
                props: {
                  label: "Forward to 1",
                  size: "lg",
                  full: true,
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
