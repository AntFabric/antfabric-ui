import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "form-field",
  name: "Form field",
  category: "inputs",
  level: "atom",
  status: "stable",
  description: "The label, the description and the error around one control, and the wiring that makes them true for a screen reader: the label is a real label for the control, the description and the error are what it is described by, and an error marks it invalid and is announced once. A TextField, Select, SearchField, Checkbox, Switch or RadioGroup inside it reads what it needs; a field that is not inside one keeps drawing its own label and helper.",
  props: {
    label: {
      type: "string",
      sample: "Billing contact",
      required: true,
      description: "The field's name: a real label for the control inside. A control with a name of its own (a Checkbox, a Switch) keeps it; the label then names the field around it.",
    },
    description: {
      type: "string",
      default: "",
      sample: "We send invoices and renewal notices here.",
      description: "One clause under the label that says what to enter or why. Read after the control's name.",
    },
    error: {
      type: "string",
      default: "",
      description: "What is wrong and how to fix it. While it is not empty the control is marked invalid and the message is announced once, politely. Say it in a sentence: \"Enter an address like name@company.com\".",
    },
    required: {
      type: "boolean",
      default: false,
      description: "Marks the control required (aria-required; the phone reads it after the name) and draws a \"Required\" pill beside the label. The pill is hidden from screen readers: the state is the attribute.",
    },
    hideLabel: {
      type: "boolean",
      default: false,
      description: "Keep the label for screen readers but do not draw it, when a heading above already asks the question.",
    },
    children: {
      type: "node",
      sample: [
        {
          el: "component",
          use: "text-field",
          props: { placeholder: "name@company.com", type: "email", autoComplete: "email", value: "" },
        },
      ],
      description: "The one control: a TextField, Select, SearchField, Checkbox, Switch or RadioGroup. It takes its id, its description and error, and aria-invalid and aria-required from the field.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div> with a <label for> over the control, a description and an error; a context carries the control's id, the ids of the description and the error (for aria-describedby), `invalid` and `required` to whichever control is inside; the error is announced through the page's polite live region",
      import: "import { FormField } from \"@antfabric-ui/react\"",
      notes: [
        "A control inside reads the field with `useFormField()`; a product's own control can too, to take the same wiring.",
        "A control that is not a native field (a Select's trigger, a RadioGroup) is named with aria-labelledby pointing at the label; a TextField and a SearchField are named by the label's `for`.",
        "A Checkbox and a Switch keep their own label; the field adds its description and error to what they are described by. aria-invalid is set on every control that supports it, and aria-required on every control that supports it (not a Switch).",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Moves into the control; the label, the description and the error are not tab stops",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same field as web",
      import: "import { FormField } from \"@antfabric-ui/react\"",
      notes: ["The label is a real label, so a click on it focuses a text field and presses a checkbox, as in the browser."],
    },
    mobile: {
      status: "ready",
      base: "A View with a Text label, a description and an error; a context carries the field's label and one hint (the description, the error and \"Required\") to the control inside, which reads it as its accessibility label (when it has none) and hint; the error is announced with announceForAccessibility because iOS has no live regions",
      import: "import { FormField } from \"@antfabric-ui/react-native\"",
      notes: [
        "The phone has no aria-invalid or aria-required: the hint is how a screen reader hears them, after the name.",
        "The label and the messages scale with the person's text size, up to 2×.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "On the control, as without a field; the label is not a target",
        },
      ],
    },
  },
  a11y: {
    role: "group",
    label: "{label}",
    notes: [
      "The label is a real <label for> pointing at the control (the phone: the control's accessibility label, when it has none).",
      "The description and the error are the control's aria-describedby (the phone: its hint), so they are read after its name when it takes focus. The field itself is not a landmark or a group: the control inside is the one thing a screen reader moves to.",
      "An error is announced once, politely, when it arrives, and the control is marked aria-invalid while it shows. Nothing is announced on each keystroke.",
      "Required is aria-required on the control; the visible pill is hidden from screen readers so it is not read twice. A Switch has no required state, so the field does not set one.",
    ],
  },
  examples: [
    {
      name: "Text field",
      props: {},
      width: 360,
    },
    {
      name: "Required",
      props: {
        required: true,
        children: [{ el: "component", use: "text-field", props: { placeholder: "name@company.com", type: "email", autoComplete: "email", value: "" } }],
      },
      width: 360,
    },
    {
      name: "With an error",
      props: {
        required: true,
        error: "Enter an address like name@company.com.",
        children: [{ el: "component", use: "text-field", props: { type: "email", value: "priya.raman@", invalid: false } }],
      },
      width: 360,
    },
    {
      name: "Select",
      props: {
        label: "Owner",
        description: "Only owners can change billing.",
        children: [
          {
            el: "component",
            use: "select",
            props: {
              placeholder: "Choose an owner",
              items: [
                { key: "priya", label: "Priya Raman", supportingText: "@priya" },
                { key: "tomas", label: "Tomás Herrera", supportingText: "@tomas" },
              ],
              value: "priya",
            },
          },
        ],
      },
      width: 360,
    },
    {
      name: "Radio group",
      props: {
        label: "Notify me about",
        children: [
          {
            el: "component",
            use: "radio-group",
            props: {
              options: [
                { key: "all", label: "All messages" },
                { key: "mentions", label: "Mentions only" },
                { key: "none", label: "Nothing" },
              ],
              value: "mentions",
            },
          },
        ],
      },
      width: 360,
    },
    {
      name: "Switch",
      props: {
        label: "Sound",
        description: "Plays when a message in a channel you follow arrives.",
        hideLabel: true,
        children: [{ el: "component", use: "switch", props: { label: "Notification sound", checked: true } }],
      },
      width: 360,
    },
    {
      name: "Label hidden",
      description: "The label is still the control's name; a heading above asks the question.",
      props: {
        hideLabel: true,
        description: "",
        children: [{ el: "component", use: "search-field", props: { placeholder: "Search people", value: "" } }],
      },
      width: 360,
    },
  ],
  states: [],
  matrix: [
    { prop: "required" },
    { prop: "hideLabel" },
  ],
  edgeCases: [
    {
      title: "A control with its own label",
      platforms: ["web", "desktop", "mobile"],
      handling: "A Checkbox or a Switch always has a name of its own, and keeps it: the field's label then names the field around it and the control adds nothing to it. A TextField that draws its own label inside a field gets two names; give it none and let the field name it.",
    },
    {
      title: "A long label or a long error",
      platforms: ["web", "desktop", "mobile"],
      handling: "Both wrap to as many lines as they need. An error is never truncated: the cut-off half is usually the instruction. The Required pill keeps its width and the label gives way.",
      example: {
        name: "Long error",
        props: {
          label: "Where should we send the weekly summary of everything that happened in the workspace",
          error: "That address is already used by another workspace. Use a different address, or ask the owner of that workspace to remove it first.",
          children: [{ el: "component", use: "text-field", props: { type: "email", value: "priya.raman@antfabric.app" } }],
        },
        width: 300,
      },
    },
    {
      title: "An error that arrives while the control has focus",
      platforms: ["web", "desktop", "mobile"],
      handling: "It is announced once through the page's polite region (the phone: announceForAccessibility) and the control is marked invalid. Focus does not move: a validation message must not take the cursor away from the field being fixed. A form that refuses a submit moves focus to the first invalid control itself.",
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label sits at the start edge and the Required pill at the end, and the error's icon sits before its text. A text field inside lays an address, a number or a password out left to right.",
    },
  ],
  related: ["text-field", "select", "search-field", "checkbox", "switch", "radio-group"],
};

export default docs;
