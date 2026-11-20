import type { ComponentDocs } from "../../types";

const jira = {
  source: "Jira",
  agent: false,
  reference: "PROJ-217",
  subject: "Deploy release 4.12 to production",
  context: "Staging has been green since 1pm; the change list is the 23 merged PRs on the release-4.12 branch.",
  amount: "",
  requestedBy: "Marcus Lee",
  time: "11:05 AM",
  verify: false,
};

const zoho = {
  source: "Zoho Desk",
  agent: false,
  reference: "DESK-4821",
  subject: "Refund Northwind for the unused months",
  context: "Northwind cancelled two seats mid-term and asked for the unused months back.",
  amount: "$1,200 prorated",
  requestedBy: "Aisha Khan",
  time: "Yesterday",
  verify: false,
};

const docs: ComponentDocs = {
  id: "approval-item",
  name: "Approval item",
  category: "agent",
  level: "molecule",
  status: "draft",
  description:
    "One decision routed to a person, from an agent, a plugin or an external ticket (AntFabric's: a Fabric agent, a Zoho Desk ticket, a Jira issue): what is asked, what is at stake, who asked, and Reject or Approve, or Answer when an agent asked a question instead. Decided, it says who decided and whether they confirmed it was them.",
  props: {
    source: { type: "string", default: "", sample: "Agent", description: "The tag's words: where the decision came from (\"Agent\", \"Purchase orders\", \"Jira\"). A plugin passes its own display name. Empty draws no tag." },
    agent: { type: "boolean", default: false, sample: true, description: "An agent proposed it: the tag takes the brand tone. The kit never decides who counts as an agent; the product sets it." },
    reference: { type: "string", default: "", description: "The source's own id, drawn beside the tag whenever it is given: PO-4821, DESK-4821, PROJ-217." },
    subject: { type: "string", sample: "Send renewal proposal to Acme Corp", required: true, description: "What is being asked, in a line. It names the card." },
    context: { type: "string", default: "", sample: "The sales agent drafted a renewal at this year's seat count with a 6% uplift.", description: "Why it is asked. Two lines at most here; the rest is on the approval itself." },
    amount: { type: "string", default: "", sample: "$48,000 / yr", description: "What is at stake, written as the source writes it." },
    requestedBy: { type: "string", default: "", sample: "Sales Agent", description: "Who asked: the agent's name, or the person who raised the ticket." },
    time: { type: "string", default: "", sample: "10:42 AM", description: "When it was asked, already formatted for the person." },
    status: { type: "enum", options: ["pending", "question", "approved", "rejected", "expired", "failed"], default: "pending", description: "pending and question need the person (the coral dot). approved and rejected are settled and lose their actions. expired is a request nobody decided in time; failed is a decision that could not be committed, and offers Retry." },
    decidedBy: { type: "string", default: "", description: "Who decided, once it is decided: \"You\" for the person reading." },
    verify: { type: "boolean", default: false, sample: true, description: "Pending: approving asks the person to confirm it is them first (a passkey, a second factor, a fingerprint). Decided: the decision was confirmed that way." },
    deciding: { type: "boolean", default: false, description: "A decision is on its way (the identity check, then the write-back): Approve spins and Reject waits." },
    expanded: { type: "boolean", default: false, description: "The context is shown in full instead of clamped to two lines. A button under a long context (over about two lines) flips it." },
    onExpandedChange: { type: "event", args: "expanded: boolean", changes: "expanded" },
    onRetry: { type: "event", description: "Retry was pressed on a failed decision: the app commits it again." },
    onApprove: { type: "event", description: "The app runs the identity check when verify is on, commits the decision and writes it back to the source (a ticket, a plugin) as the person." },
    onReject: { type: "event" },
    onAnswer: { type: "event", description: "An agent's question: the app opens it to be answered." },
  },
  platforms: {
    web: { status: "ready", base: "An <article> named by its subject, drawn from its recipe; Tag for the source and outcome, Button for the actions", import: 'import { ApprovalItem } from "@antfabric/ui-react"', notes: ["There is no approvals screen on any platform yet; this is a proposal from the phone's data model."] },
    desktop: { status: "ready", base: "The same card", import: 'import { ApprovalItem } from "@antfabric/ui-react"', notes: ["The desktop has no approvals list today; its only approval is the question panel's gated tool call."] },
    mobile: {
      status: "ready",
      base: "A View drawn from the same recipe; Reject and Approve share the row equally",
      import: 'import { ApprovalItem } from "@antfabric/ui-react-native"',
      notes: [
        "The phone's Inbox tab is blank until it is designed (owner, 2026-10-15), and the approval route its activity rows link to does not exist yet; this is the card those would draw.",
        "The identity check is the app's: the service takes whether it happened as a flag. The card only says one will be asked for.",
      ],
    },
  },
  a11y: {
    role: "article",
    notes: [
      "Each card is an article named by its subject (web); on the phone the buttons are the stops.",
      "The buttons are named with the subject, starting with the visible word: \"Approve: Send renewal proposal\". `deciding` sets aria-busy on the card and on Approve.",
      "Deciding removes the buttons: focus moves to the outcome line (a card that arrives decided does not take focus) and the outcome is announced (\"Send renewal proposal: Approved by You\"; assertive when the decision failed).",
      "A long context can be expanded (a button with aria-expanded). The coral dot is an image named \"Needs you\".",
      "Reject is a full button beside Approve, never a quiet link: refusing is as easy as agreeing.",
    ],
  },
  examples: [
    { name: "From an agent", props: {}, width: 460 },
    { name: "From Jira", props: jira, width: 460 },
    { name: "From Zoho Desk", props: zoho, width: 460 },
    {
      name: "An agent's question",
      props: { subject: "Which region for the Northwind tenant?", context: "The provisioning agent needs a region before it can create the tenant.", amount: "", requestedBy: "Provisioning agent", time: "9:12 AM", status: "question", verify: false },
      width: 460,
    },
    { name: "Deciding", props: { deciding: true }, width: 460 },
    { name: "Approved", props: { status: "approved", decidedBy: "You" }, width: 460 },
    { name: "Rejected", props: { ...zoho, status: "rejected", decidedBy: "Priya Raman" }, width: 460 },
    {
      name: "A long context",
      props: { context: "The sales agent drafted a renewal at this year's seat count with a 6% uplift, matched Acme's procurement template and attached the signed order form from March. Nothing has been sent to Acme yet." },
      width: 460,
    },
    { name: "Expired", props: { ...jira, status: "expired" }, width: 460 },
    { name: "Failed", props: { ...zoho, status: "failed" }, width: 460 },
  ],
  matrix: [{ prop: "status", width: 460 }],
  edgeCases: [
    {
      title: "The write-back to the ticket fails",
      platforms: ["web", "desktop", "mobile"],
      handling: "The decision is committed either way. The app shows the failure where the card sits (an inline banner) and retries the write-back; the card does not go back to pending.",
    },
    {
      title: "The identity check is cancelled",
      platforms: ["mobile"],
      handling: "Nothing is decided: the app sets deciding back to false and the card waits as it was.",
    },
    {
      title: "A long subject",
      platforms: ["web", "desktop", "mobile"],
      handling: "The subject wraps in full; the context is clamped to two lines.",
      example: { name: "Long subject", props: { subject: "Approve the Kestrel Labs pilot extension through the end of the quarter at the discounted seat price", context: "Kestrel asked for six more weeks to finish their security review before signing the annual contract." }, width: 360 },
    },
  ],
  related: ["question-panel", "notification-item", "inline-banner"],
  flows: [
    {
      id: "approve-with-biometric",
      title: "Approve, confirming it's you",
      description: "A sales agent's renewal needs a person's sign-off and a biometric check.",
      platforms: ["web", "desktop", "mobile"],
      width: 460,
      steps: [
        { kind: "data", title: "The approval is routed here", code: "approvals.list({ source: 'all' })" },
        { kind: "trigger", title: "Presses Approve" },
        { kind: "event", title: "Approve is reported", code: "onApprove()" },
        { kind: "effect", title: "The OS asks for a face or a fingerprint", detail: "The app's own step; the card only waits.", platforms: ["mobile"], lane: "system" },
        { kind: "state", title: "Deciding", code: "deciding = true" },
        {
          kind: "effect",
          title: "The decision is committed",
          detail: "A Zoho or Jira source is written back to its ticket as the person; every decision is audited.",
          code: "approvals.decide(id, 'approved', { biometric: true, decidedBy })",
        },
        { kind: "result", title: "Approved by You · confirmed with biometrics" },
      ],
      replay: [
        { step: 0, props: {}, hold: 1400 },
        { step: 1, props: {}, press: "Approve", hold: 700 },
        { step: 4, props: { deciding: true }, hold: 1400 },
        { step: 6, props: { status: "approved", decidedBy: "You" }, hold: 1800 },
      ],
    },
  ],
};

export default docs;
