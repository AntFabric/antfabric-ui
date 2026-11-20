import type { OnlyOn, StringGroups } from "./index";

/**
 * Built-in text of the `agent` components, keyed by component id. See `strings/index.ts`. The kit never names an assistant: a sentence that
 * would name the agent has a nameless key and a `…Named` key, and the component reads `…Named` when it is given an `agentName`.
 * Where a text names the product or its features, the English default is a plain sentence and the catalogue's
 * copy is in `ANTFABRIC_STRINGS` (`@antfabric/ui-docs/samples`).
 */
export const agent = {
  "agent-steps": {
    /** The list's accessible name. */
    label: "Steps",
    /** The count of the oldest steps left out, over the list: "+8 earlier". */
    earlier: "+{count} earlier",
    /** After a step's label, where it ran: an MCP server, a plugin, an integration. */
    via: "via {source}",
    /** A step's state in words: the web marker's name, and the start of the phone's one stop per step. */
    running: "running",
    /** The phone's row, as one stop: "running: Search the CRM", then `via`. */
    stepLabel: "{state}: {label}",
    /** The marker's accessible name once a step is done. */
    done: "done",
    /** The marker's accessible name once a step failed. */
    failed: "failed",
  },
  "thinking-indicator": {
    /** The word beside the lattice when the product gave none to rotate through. */
    word: "Thinking",
    /** The word as drawn: "Thinking…". */
    wordShown: "{word}…",
    /** What a screen reader hears before the agent has run a tool, when there is no agent name. */
    thinking: "Thinking",
    /** The same when the product names its agent. */
    thinkingNamed: "{name} is thinking",
    /** What it hears while a step runs, when there is no agent name. */
    running: "Running {step}",
    runningNamed: "{name} is running {step}",
    /** A step as it is announced: its label, then where it ran. */
    stepVia: "{label} via {source}",
    /** The head's accessible name while the steps are folded, and while they are showing. */
    showSteps: "Show steps",
    hideSteps: "Hide steps",
    /** The toggle's name: the word on screen, then what pressing does, so the name starts with what is seen. */
    toggleLabel: "{word} {action}",
  },
  "approval-item": {
    /** The tag on an agent's question, instead of a request to approve. */
    question: "Question",
    /** The outcome tag, and the start of the outcome line. */
    approved: "Approved",
    rejected: "Rejected",
    /** The dot on a request that waits on this person. */
    needsYou: "Needs you",
    /** The line after the amount: "from Marcus Lee". */
    from: "from {name}",
    /** Under a pending request that will ask the person to confirm it is them before it is decided. */
    verifyNote: "You'll confirm it's you before this is decided.",
    /** The outcome line: "Approved by You". */
    decidedBy: "{outcome} by {name}",
    /** After the outcome line when the decision was confirmed with a passkey, a second factor or a fingerprint. */
    verified: " · identity confirmed",
    answer: "Answer",
    reject: "Reject",
    approve: "Approve",
    /** The outcome tag of a request nobody decided in time, and of a decision that could not be committed. */
    expired: "Expired",
    failed: "Couldn't save the decision",
    retry: "Retry",
    /** What a screen reader is told when the card settles: the subject, then the outcome line. */
    announced: "{subject}: {outcome}",
    /** The buttons' names carry the subject, so a list of them says which is which. They start with the visible word. */
    approveSubject: "Approve: {subject}",
    rejectSubject: "Reject: {subject}",
    answerSubject: "Answer: {subject}",
    retrySubject: "Retry: {subject}",
    /** The button under a long context. */
    showMore: "Show more",
    showLess: "Show less",
  },
  "question-panel": {
    /** The collapsed bar's words, when the panel has no `waitingLabel` and no agent name. */
    waiting: "Waiting for your approval",
    /** The same when the product names its agent. */
    waitingNamed: "{name} is waiting for your approval",
    /** The region's accessible name when the panel has no `regionLabel`. It stays when the panel is collapsed. */
    region: "Approval needed",
    /** The phone's collapsed bar, read as one button: the region, then what it waits for. */
    barLabel: "{region}: {waiting}",
    /** What a screen reader is told when a question appears or opens: the region, then the question. */
    asking: "{region}: {title}",
    /** The scrollable details and arguments, which a keyboard can reach. */
    detailsLabel: "Details",
    argsLabel: "Tool arguments",
    /** The typed answer's example text. */
    placeholder: "Your answer",
    /** The footer's line while the question is open, with no agent name. */
    paused: "Paused until you answer.",
    pausedNamed: "{name} is paused until you answer.",
    /** The footer's line instead of the paused one, while the person is offline. */
    offline: "You're offline. You can answer once you're back online.",
    /** The caption over the type-to-confirm field. */
    irreversible: "This one cannot be undone.",
    /** The confirm field's example text and accessible name: "Type delete_channel to confirm". */
    confirmLabel: "Type {text} to confirm",
    /** The hint under the confirm field while what was typed is not the confirm text yet. */
    mismatch: "That does not match yet.",
    /** An argument's value when it is empty. */
    noValue: "—",
    /** Submit's label while the answer is on its way (shadows `common.sending`, which has no ellipsis). */
    sending: "Sending…",
  },
} as const satisfies StringGroups;

/** Keys only one kit reads (see `OnlyOn`). */
export const agentOnly = {
  "agent-steps": { stepLabel: ["mobile"] },
  "question-panel": { barLabel: ["mobile"], detailsLabel: ["web"], argsLabel: ["web"] },
} as const satisfies OnlyOn<typeof agent>;
