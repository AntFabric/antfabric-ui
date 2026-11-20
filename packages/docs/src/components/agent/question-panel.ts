import type { ComponentDocs } from "../../types";

const sendMail = {
  toolName: "send_mail",
  args: [
    { name: "to", value: "priya.raman@example.com, marcus.lee@example.com" },
    { name: "subject", value: "Release train: the cut moves to 4pm" },
    { name: "body", value: "Hi both, staging is green. I'll cut the release branch at 4pm and post the checklist in #release-train." },
  ],
  options: [
    { key: "deny", label: "Don't", detail: "Fabric won't send the email." },
    { key: "approve", label: "Approve", detail: "Send this email to 2 people now." },
  ],
};

const deleteChannel = {
  title: "Approve this action?",
  toolName: "delete_channel",
  args: [
    { name: "channel", value: "#release-train-old" },
    { name: "messages", value: "214" },
  ],
  options: [
    { key: "deny", label: "Don't", detail: "Fabric won't do it." },
    { key: "approve", label: "Approve", detail: "Run delete_channel now." },
  ],
  confirmText: "delete_channel",
};

const choice = {
  title: "Choose one",
  waitingLabel: "Fabric is waiting for your answer",
  regionLabel: "Question for you",
  toolName: "",
  args: [],
  options: [
    { key: "archive", label: "Archive #release-train-old", detail: "It leaves the sidebar; its messages stay searchable." },
    { key: "mute", label: "Mute it", detail: "It stays, without unread counts." },
    { key: "leave", label: "Leave it as it is" },
  ],
};

const docs: ComponentDocs = {
  id: "question-panel",
  name: "Question panel",
  category: "agent",
  level: "organism",
  status: "draft",
  description:
    "The one panel every question an agent asks is answered in, docked above the composer: may it run this tool, may it do this, which one, or what should the value be. Nothing is preselected, there is no close, and the agent stays paused until the person answers.",
  props: {
    title: { type: "string", sample: "Approve this action?", required: true, description: "\"Approve this action?\" for a tool call or a consent, \"Choose one\", \"Type your answer\"." },
    agentName: { type: "string", default: "", sample: "Fabric", description: "The agent's display name, for the waiting bar and the paused line (\"Fabric is paused until you answer.\"). Empty names none: \"Waiting for your approval\", \"Paused until you answer.\"" },
    waitingLabel: { type: "string", default: "", description: "The collapsed bar's words. Empty reads the strings' own: \"Waiting for your approval\", or \"Fabric is waiting for your approval\" with an agentName. \"Fabric is waiting for your answer\" for a choice or a typed answer." },
    regionLabel: { type: "string", default: "", description: "The region's accessible name: \"Question for you\", or the strings' \"Approval needed\" when empty. It stays when the panel is collapsed." },
    toolName: { type: "string", default: "", sample: sendMail.toolName, description: "The tool's own name, printed as it is in a mono chip. Only a gated tool call has one; empty hides the chip." },
    details: { type: "string", default: "", description: "What the agent says it will do (a consent's intent). Plain text, never Markdown: it can carry words a model read in someone's email." },
    args: { type: "array", default: [], sample: sendMail.args, description: "The tool call's arguments as name and value, printed whole as plain text. A long list scrolls; values are never cut." },
    options: { type: "array", default: [], sample: sendMail.options, description: "The answer rows, each with a key, a label and an optional detail line. List refusal first. Nothing is chosen until the person chooses." },
    field: { type: "boolean", default: false, description: "A typed answer instead of rows (ask_user's input kind). Enter submits." },
    placeholder: { type: "string", default: "", description: "The typed answer's example. Empty reads the strings' \"Your answer\"." },
    confirmText: { type: "string", default: "", description: "Type-to-confirm: choosing the guarded row opens a field, and Submit waits until this is typed exactly (the tool's full name). Empty turns it off." },
    confirmOption: { type: "string", default: "", sample: "approve", description: "The key of the row type-to-confirm guards. Refusing is never guarded. Empty guards none." },
    value: { type: "string", default: "", description: "The chosen row's key. Empty: nothing chosen, so Enter or a stray press answers nothing." },
    typed: { type: "string", default: "", description: "What has been typed: the answer in the field, or the confirm text." },
    expanded: { type: "boolean", default: true, description: "The question is shown. False shrinks it to a bar with waitingLabel (the root, folded). The question is still open: answering is the only way out." },
    autoFocus: { type: "boolean", default: false, description: "Moves focus to the question (its title; the phone's screen reader focus) when it appears or expands: for a question that blocks the turn. Either way the question is announced." },
    offline: { type: "boolean", default: false, description: "Submit waits and the footer says why. Rows and typing still work." },
    sending: { type: "boolean", default: false, description: "The answer is on its way: Submit reads Sending… and everything locks, so a second press cannot send a second answer. Pressing Submit sets it; the app removes the panel." },
    onValueChange: { type: "event", args: "value: string", changes: "value" },
    onTypedChange: { type: "event", args: "typed: string", changes: "typed" },
    onExpandedChange: { type: "event", args: "expanded: boolean", changes: "expanded" },
    onSubmit: { type: "event", args: "answer: string", description: "The chosen row's key, or the typed answer trimmed. A gated tool reads approve or deny; a choice sends the option's key; a consent sends the sentence the app maps it to." },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A labelled region drawn from its recipe; the rows are a radiogroup of <button role=radio> with a roving tab stop, focus from useInteraction; inputs are plain <input> parts; Submit and the carets are Button and IconButton",
      import: 'import { QuestionPanel } from "@antfabric-ui/react"',
      notes: ["There is no web app yet; this is the desktop's panel at web density."],
      keyboard: [
        { keys: "1", action: "Choose the first row (1 to 9 choose rows 1 to 9). Ignored while typing in any field, the composer included; never submits." },
        { keys: "ArrowDown", action: "Choose and focus the next row, wrapping (ArrowRight too)." },
        { keys: "ArrowUp", action: "Choose and focus the previous row, wrapping (ArrowLeft too)." },
        { keys: "Enter", action: "In the typed field: submit. On a row: choose it." },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same panel at desktop density, docked above the composer in the assistant chat and a project space",
      import: 'import { QuestionPanel } from "@antfabric-ui/react"',
      notes: [
        "Today's desktop mounts it keyed on the question's id, so the panel that sent an answer is replaced, never reused.",
        "A gated tool call halts the SDK's tool loop and the answer resumes it; ask_user ends the model's turn and the answer is an ordinary user turn. The drawing is the same; the mechanism is not.",
      ],
      keyboard: [
        { keys: "1", action: "Choose the first row (1 to 9 choose rows 1 to 9). Ignored while typing; never submits." },
        { keys: "ArrowDown", action: "Choose and focus the next row, wrapping." },
        { keys: "Enter", action: "In the typed field: submit. On a row: choose it." },
      ],
    },
    mobile: {
      status: "ready",
      base: "A View drawn from the same recipe; rows are Pressables with the radio role, fields are TextInputs, Submit and the carets are Button and IconButton. No number keys",
      import: 'import { QuestionPanel } from "@antfabric-ui/react-native"',
      notes: [
        "Today's phone draws two cards instead: ApprovalCard (\"Allow send mail?\", Decline and Allow side by side, the arguments in a 220pt box) and DirectiveCard (pills for a choice, No and Yes for a consent, Send for a typed answer). This kit draws the desktop's one panel on the phone; which is right is still an open question.",
        "Today's phone sends \"Yes\" and \"No\" for a consent where the desktop sends \"Yes, go ahead.\" and \"No, do not do that.\"; the app maps onSubmit's key to the sentence, so the panel does not decide this.",
        "Today's phone has no offline state on these cards.",
      ],
    },
  },
  a11y: {
    role: "region",
    notes: [
      "A region named by regionLabel, in both states. A question that appears or opens is announced (assertive); `autoFocus` also moves focus to the title. The collapse and expand button reports aria-expanded (web).",
      "The rows are a radiogroup labelled by the title. Arrow keys (turned round in right-to-left) and Tab reach every row, rows past nine included. The detail is the row's description (web) or its value, read after the name (phone).",
      "The number keys 1 to 9 choose a row only while focus is inside the panel and never while typing in a field; they are hidden from screen readers.",
      "Long details and the argument list scroll, and take a tab stop with a name (\"Details\", \"Tool arguments\") and a focus ring, so a keyboard can read them (web).",
      "Offline, the footer becomes a status and says why Submit waits. On the phone the collapsed bar is one button that names the question and expands it.",
    ],
  },
  examples: [
    { name: "Approve a tool call", props: {}, width: 560 },
    { name: "Type to confirm", description: "Approve is chosen, so its confirm field is open.", props: { ...deleteChannel, value: "approve" }, width: 560 },
    {
      name: "Consent",
      props: {
        toolName: "",
        args: [],
        details: "Archive #release-train-old and its 214 messages. Members keep read access.",
        options: [
          { key: "deny", label: "Don't", detail: "Fabric won't do it." },
          { key: "approve", label: "Approve", detail: "Fabric goes ahead now." },
        ],
      },
      width: 560,
    },
    { name: "Choose one", props: choice, width: 560 },
    { name: "Type your answer", props: { title: "Type your answer", waitingLabel: "Fabric is waiting for your answer", regionLabel: "Question for you", toolName: "", args: [], field: true, placeholder: "Which region for the Northwind tenant?" }, width: 560 },
    { name: "Collapsed", props: { expanded: false }, width: 560 },
    { name: "Chosen", props: { value: "approve" }, width: 560 },
    { name: "Offline", props: { value: "approve", offline: true }, width: 560 },
    { name: "Sending", props: { value: "approve", sending: true }, width: 560 },
  ],
  edgeCases: [
    {
      title: "The confirm text does not match",
      platforms: ["web", "desktop", "mobile"],
      handling: "A hint says so under the field once anything is typed, and Submit stays off. The match is exact and case-sensitive, after trimming what was typed; the text is the tool's full name, server prefix and all.",
      example: { name: "Mismatch", props: { ...deleteChannel, value: "approve", typed: "delete_chanel" }, width: 560 },
    },
    {
      title: "Ten or more answers",
      platforms: ["web", "desktop"],
      handling: "Rows past the ninth have no number key. The arrows and the pointer still reach them.",
    },
    {
      title: "A long argument",
      platforms: ["web", "desktop", "mobile"],
      handling: "Values are printed whole and wrap; the list scrolls past its height (240 on web and desktop, 220pt on the phone) rather than cutting a value someone is approving.",
      example: {
        name: "Long body",
        props: {
          args: [
            { name: "to", value: "release-crew@example.com" },
            {
              name: "body",
              value:
                "Hi all, staging has been green since 1pm and the last two blockers are merged. I'll cut the release branch at 4pm, freeze merges until the smoke run passes, and post the checklist in #release-train. Aisha owns the mobile build; Kenji owns the rollback plan. If anything looks off, reply here before 3:30 so we can hold the cut.",
            },
          ],
          options: [
            { key: "deny", label: "Don't", detail: "Fabric won't send the email." },
            { key: "approve", label: "Approve", detail: "Send this email now." },
          ],
        },
        width: 560,
      },
    },
    {
      title: "No answers to choose from",
      platforms: ["web", "desktop", "mobile"],
      handling: "A choice with no options can never arm Submit. The app must not ask one; the panel does not invent rows.",
    },
    {
      title: "A number key while typing",
      platforms: ["web", "desktop"],
      handling: "Ignored in any input, textarea or editable element, so a 2 typed into the composer stays a 2. Also ignored inside an open dialog and with a modifier held.",
    },
    {
      title: "The connection drops with a row chosen",
      platforms: ["web", "desktop", "mobile"],
      handling: "The choice stays and Submit waits; the footer says the person is offline and can answer once AntFabric reconnects.",
    },
    {
      title: "Answered somewhere else",
      platforms: ["web", "desktop", "mobile"],
      handling: "The app removes the panel when the question closes, wherever it was answered. The panel never resets itself after sending.",
    },
  ],
  related: ["composer", "dialog", "thinking-indicator"],
  flows: [
    {
      id: "approve-tool-call",
      title: "Approve a tool call",
      description: "Fabric wants to send an email; the person reads the arguments, chooses Approve and submits.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        {
          kind: "data",
          title: "The tool call asks",
          detail: "The SDK halts the tool loop on a gated tool and the app mounts the panel above the composer, keyed on the approval's id.",
          code: "part.state === 'approval-requested'",
        },
        { kind: "trigger", title: "Chooses Approve", detail: "A press, or 2 on the keyboard. Nothing was chosen before." },
        { kind: "event", title: "The choice is reported", code: 'onValueChange("approve")' },
        { kind: "trigger", title: "Presses Submit" },
        { kind: "event", title: "The answer is sent", code: 'onSubmit("approve")' },
        { kind: "state", title: "The panel locks", detail: "Submit reads Sending… and the rows stop taking presses until the app removes the panel.", code: "sending = true" },
        {
          kind: "effect",
          title: "The answer resumes the tool call",
          code: "answerApproval(id, answer === 'approve')",
        },
        { kind: "result", title: "The email goes", detail: "The panel is gone and Fabric carries on in the transcript." },
      ],
      replay: [
        { step: 0, props: {}, hold: 1400 },
        { step: 1, props: {}, press: "Approve", hold: 700 },
        { step: 2, props: { value: "approve" }, hold: 1200 },
        { step: 3, props: { value: "approve" }, press: "Submit", hold: 700 },
        { step: 5, props: { value: "approve", sending: true }, hold: 1600 },
      ],
    },
    {
      id: "type-to-confirm",
      title: "Confirm by typing the tool's name",
      description: "A destructive tool asks for its name to be typed before Approve can be submitted.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        { kind: "data", title: "The tool's ceremony is type-to-confirm", code: "confirmText = approval.toolName" },
        { kind: "trigger", title: "Chooses Approve" },
        { kind: "result", title: "The confirm field opens", detail: "It hangs off the Approve row by an elbow and says this one cannot be undone." },
        { kind: "trigger", title: "Types the name, one letter wrong" },
        { kind: "result", title: "A hint says it does not match yet", detail: "Submit stays off." },
        { kind: "trigger", title: "Fixes it" },
        { kind: "result", title: "Submit arms" },
      ],
      replay: [
        { step: 0, props: deleteChannel, hold: 1200 },
        { step: 1, props: deleteChannel, press: "Approve", hold: 700 },
        { step: 2, props: { ...deleteChannel, value: "approve" }, hold: 1200 },
        { step: 4, props: { ...deleteChannel, value: "approve", typed: "delete_chanel" }, hold: 1600 },
        { step: 6, props: { ...deleteChannel, value: "approve", typed: "delete_channel" }, hold: 1600 },
      ],
    },
    {
      id: "collapse",
      title: "Collapse and come back",
      description: "The person folds the panel away to read the transcript; the question waits in a bar.",
      platforms: ["web", "desktop", "mobile"],
      width: 560,
      steps: [
        { kind: "trigger", title: "Presses the caret" },
        { kind: "event", title: "Collapsed", code: "onExpandedChange(false)" },
        { kind: "result", title: "A bar says Fabric is waiting", detail: "No close: the question is what the conversation is paused on." },
        { kind: "trigger", title: "Presses the bar" },
        { kind: "event", title: "Expanded", code: "onExpandedChange(true)" },
        { kind: "result", title: "The question is back as it was", detail: "Focus moves to the caret that replaced the one pressed." },
      ],
      replay: [
        { step: 0, props: {}, press: "Collapse", hold: 900 },
        { step: 2, props: { expanded: false }, hold: 1400 },
        { step: 3, props: { expanded: false }, press: "Expand", hold: 900 },
        { step: 5, props: {}, hold: 1400 },
      ],
    },
  ],
};

export default docs;
