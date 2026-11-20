import type { ComponentDocs } from "../../types";

/** A webhook's body, for the monospace examples: a template a person edits, with the placeholders the product fills in. */
const payload = `{
  "channel": "#platform-eng",
  "text": "{{author}} opened {{title}}",
  "notify": true
}`;

const docs: ComponentDocs = {
  id: "text-area",
  name: "Text area",
  category: "inputs",
  level: "atom",
  status: "draft",
  description:
    "Several lines of text with its label, a help line, an error and an optional character count: TextField's multi-line sibling, with the same anatomy and states. Hover moves the fill, focus draws a 2px grey edge, invalid paints the edge red and wins over focus. `mono` sets the text in the monospace face for code, JSON and templates.",
  props: {
    label: {
      type: "string",
      sample: "Channel description",
      required: true,
      description: "Visible label and the field's accessible name. Always pass one: with `hideLabel` it is still the name a screen reader says.",
    },
    value: {
      type: "string",
      description: "The text. Left out, the field keeps its own text, starting from `defaultValue`, and still reports each change through onValueChange.",
    },
    defaultValue: {
      type: "string",
      default: "",
      description: "The text a field with no `value` starts with: a form that only reads the field when it is sent.",
    },
    placeholder: {
      type: "string",
      default: "",
      sample: "What this channel is for, and who should join it",
      description: "An example of the answer, never the instructions — placeholders vanish the moment someone types.",
    },
    rows: {
      type: "number",
      default: 4,
      description: "How many lines tall the field is. On the web the person can drag it taller (`resize`); on the phone it is the least it is tall and it grows with the text.",
    },
    mono: {
      type: "boolean",
      default: false,
      description: "Sets the text in the monospace face (`font.mono`) at the regular weight, for code, JSON and templates. Spellcheck, capitals and autocorrect are off and the text is laid out left to right.",
    },
    name: {
      type: "string",
      platforms: ["web", "desktop"],
      description: "The name a form posts this field under.",
    },
    resize: {
      type: "enum",
      options: ["vertical", "none"],
      default: "vertical",
      platforms: ["web", "desktop"],
      description: "vertical draws the browser's grip in the field's corner, so the person can drag it taller; none keeps it at `rows`. The phone's field grows with its text instead.",
    },
    helper: {
      type: "string",
      default: "",
      sample: "Shown under the channel name in search and in the channel list.",
      description: "One clause under the field. Replaced by the error while invalid.",
    },
    error: {
      type: "string",
      default: "",
      description: "What is wrong and how to fix it, shown in place of helper while invalid is true.",
    },
    invalid: {
      type: "boolean",
      default: false,
    },
    required: {
      type: "boolean",
      default: false,
      description: "Sets aria-required and draws a \"Required\" tag beside the label, as TextField does.",
    },
    maxLength: {
      type: "number",
      default: 0,
      description: "Caps typing at this many characters and shows the count. 0 is no cap and no counter.",
    },
    disabled: {
      type: "boolean",
      default: false,
      description: "Skipped by Tab and not announced as editable. Say why in helper.",
    },
    readOnly: {
      type: "boolean",
      default: false,
      description: "The text can be read, selected and copied but not changed. Stays in the tab order — use this, not disabled, for anything someone may need to read.",
    },
    hideLabel: {
      type: "boolean",
      default: false,
      description: "Hides the label and the tag visually, for a field whose heading already says what it is. The label stays the field's accessible name.",
    },
    onValueChange: {
      type: "event",
      args: "value: string",
      changes: "value",
    },
    onBlur: {
      type: "event",
      description: "Focus left the field: the moment to check the value and set invalid.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<label for> + <textarea data-af-input rows> in a drawn box, inline styles over `t`; hover and focus from useInteraction on the box (the 2px edge is a 1px border plus a 1px inset ring, so nothing shifts); the error, the helper and the counter are tied to the textarea by aria-describedby; `value` through useControllable",
      import: "import { TextArea } from \"@antfabric/ui-react\"",
      notes: [
        "The textarea fills its box and carries the inset, so the resize grip sits in the box's corner. `resize=\"none\"` removes the grip.",
        "Inside a FormField the field supplies the id, aria-describedby, aria-invalid and aria-required, as it does for TextField.",
        "Enter types a new line: a text area never submits its form on Enter.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves into the field; disabled fields are skipped, read-only ones are not" },
        { keys: "Enter", action: "Starts a new line" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <label> + <textarea> as web, at desktop density",
      import: "import { TextArea } from \"@antfabric/ui-react\"",
      keyboard: [
        { keys: "Tab", action: "Moves into the field" },
        { keys: "Enter", action: "Starts a new line" },
      ],
    },
    mobile: {
      status: "ready",
      base: "A multiline TextInput (textAlignVertical top, font from the recipe, placeholderTextColor, maxFontSizeMultiplier fontScale.content) in a View box from the recipe; its least height is `rows` lines of the input's line height plus its inset; an error and the characters left are announced with announceForAccessibility; `value` through useControllable",
      import: "import { TextArea } from \"@antfabric/ui-react-native\"",
      notes: [
        "The field grows with its text from `rows` lines; there is no resize grip on a phone, so `resize` and `name` are web props.",
        "`mono` uses the system's monospace face (Menlo on iOS, monospace on Android) and turns off capitals and autocorrect.",
      ],
      gestures: [
        { gesture: "Tap", action: "Focuses and raises the keyboard" },
        { gesture: "Long press", action: "The system's select / copy / paste menu — available on read-only fields too" },
      ],
    },
  },
  a11y: {
    role: "textbox (multi-line)",
    label: "{label}",
    notes: [
      "The label is a real <label for> (the phone: the accessibility label); with `hideLabel` it is hidden visually and still the name.",
      "The helper or the error and the counter are the textarea's aria-describedby (the phone: its accessibility hint) and the field sets aria-invalid; an error that appears is announced once, politely. Required is aria-required (the phone: said after the name).",
      "The counter is not a live region. When typing pauses within the last 10% of the limit (at least 5 characters) the characters left are announced, and reaching the limit is announced once.",
    ],
  },
  examples: [
    { name: "Channel description", props: {}, width: 360 },
    {
      name: "Monospace template",
      description: "`mono` for JSON and templates: the monospace face, no spellcheck, laid out left to right.",
      props: { label: "Webhook body", placeholder: "", helper: "Placeholders in double braces are filled in when the webhook fires.", mono: true, rows: 6, defaultValue: payload },
      width: 400,
    },
    {
      name: "With counter",
      props: { label: "Status message", placeholder: "", helper: "", value: "Heads-down on the Q4 release train until Thursday. Ping #platform-eng for anything urgent.", maxLength: 140, rows: 3 },
      width: 360,
    },
    {
      name: "Invalid",
      props: { label: "Reason for the change", placeholder: "", helper: "", value: "fix", invalid: true, error: "Say what changed and why, in a sentence or two.", required: true, rows: 3 },
      width: 360,
    },
    {
      name: "Read-only",
      props: { label: "Audit note", placeholder: "", value: "Ananya Rao removed Rohan Mehta from #design-crit on 12 Nov at 14:05.", readOnly: true, helper: "Audit notes cannot be edited.", rows: 2 },
      width: 360,
    },
    {
      name: "Disabled",
      props: { value: "The platform team's channel for on-call hand-offs.", disabled: true, helper: "Only a channel owner or admin can change this." },
      width: 360,
    },
    {
      name: "Two rows, no resize",
      props: { label: "Short note", placeholder: "Add a note for the reviewer", helper: "", rows: 2, resize: "none" },
      width: 360,
    },
    {
      name: "Label hidden",
      description: "The label is the accessible name only: the heading above the field already says what it is.",
      props: { label: "Reply", placeholder: "Write a reply", helper: "", hideLabel: true, rows: 3 },
      width: 360,
    },
  ],
  matrix: [{ prop: "invalid" }, { prop: "readOnly" }, { prop: "mono" }],
  edgeCases: [
    {
      title: "Longer than its rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "On the web the text scrolls inside the field past `rows` lines and the person can drag the grip to make it taller; on the phone the field grows with the text. Long lines wrap; nothing is cut.",
      example: {
        name: "Overflowing",
        props: {
          label: "Release notes",
          placeholder: "",
          helper: "",
          rows: 3,
          value: "Fabric now drafts replies in threads you follow.\nThe sidebar remembers which sections you collapsed.\nSearch finds messages by the file they attach.\nNotifications for #platform-eng arrive grouped by thread.\nThe phone app opens links in the in-app browser.",
        },
        width: 360,
      },
    },
    {
      title: "At the character limit",
      platforms: ["web", "desktop", "mobile"],
      handling: "maxLength stops the keystroke rather than explaining a truncation afterwards; a paste that overruns is cut at the limit and the field announces \"Character limit reached\" once.",
      example: {
        name: "At the limit",
        props: { label: "Status message", placeholder: "", helper: "", value: "Heads-down until Thursday", maxLength: 25, rows: 2 },
        width: 320,
      },
    },
    {
      title: "Required and invalid",
      platforms: ["web", "desktop", "mobile"],
      handling: "The \"Required\" tag sits beside the label; an error replaces the helper and is announced once. Format errors appear on blur, never on the first keystroke.",
    },
  ],
  related: ["text-field", "form-field", "search-field"],
};

export default docs;
