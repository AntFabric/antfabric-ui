import type { ComponentDocs } from "../../types";

const run = (n: number, state: "running" | "done" | "failed" = "done") =>
  Array.from({ length: n }, (_, i) => ({ key: `c${i + 1}`, label: "Recent messages", source: "Channels & messages", state }));

const working = [
  { key: "c1", label: "Recent messages", source: "Channels & messages", state: "done" },
  { key: "c2", label: "Search people", source: "Directory", state: "done" },
  { key: "c3", label: "Draft email", state: "running" },
];

const docs: ComponentDocs = {
  id: "agent-steps",
  name: "Agent steps",
  category: "agent",
  level: "molecule",
  status: "draft",
  description:
    "The tools an agent has run this turn, newest last: a pulsing dot while one runs, a tick when it is done, a cross when it failed, each with where it ran. Past the cap the oldest are counted, never dropped silently.",
  props: {
    steps: {
      type: "array",
      default: [],
      sample: working,
      description: "Every step this turn has taken, oldest first: a key, the label a person reads (\"Recent messages\", not recent_messages), where it ran when there is somewhere worth naming (an MCP server, a plugin), and running, done or failed.",
    },
    max: { type: "number", default: 0, description: "How many of the newest steps to draw; the rest become \"+N earlier\". 0 is the platform's own: 5 on web and desktop, 3 on the phone." },
  },
  platforms: {
    web: { status: "ready", base: "A role=list of rows drawn from its recipe; the running dot on the kit's af-step-pulse, rows rise in", import: 'import { AgentSteps } from "@antfabric-ui/react"' },
    desktop: {
      status: "ready",
      base: "The same list, inside the thinking indicator's fold",
      import: 'import { AgentSteps } from "@antfabric-ui/react"',
      notes: ["Today it is drawn only inside the thinking indicator, not on its own."],
    },
    mobile: {
      status: "ready",
      base: "Views and Texts drawn from the same recipe; the dot pulses with Animated on the native driver and holds still under Reduce Motion; rows fade in",
      import: 'import { AgentSteps } from "@antfabric-ui/react-native"',
      notes: ["The phone keeps three rows, the desktop five: a phone has less height to give a turn in flight.", "Rows sit 4pt apart against the desktop's 6."],
    },
  },
  a11y: {
    role: "list",
    notes: [
      "A list named Steps; \"+N earlier\" is its first item. Web: a step's marker is an image named running, done or failed. Phone: each step is one stop, \"running: Draft email via Gmail\", and its marker is hidden.",
      "A long label or source is cut to one line with its full text as the tooltip (web).",
      "Labels and sources are printed as text, never Markdown.",
    ],
  },
  examples: [
    { name: "In flight", props: {}, width: 420 },
    {
      name: "Finished",
      props: {
        steps: [
          { key: "c1", label: "Recent messages", source: "Channels & messages", state: "done" },
          { key: "c2", label: "Search people", source: "Directory", state: "done" },
          { key: "c3", label: "Draft email", state: "done" },
        ],
      },
      width: 420,
    },
    {
      name: "A step failed",
      props: {
        steps: [
          { key: "c1", label: "Recent messages", source: "Channels & messages", state: "done" },
          { key: "c2", label: "Create Jira issue", source: "Jira", state: "failed" },
          { key: "c3", label: "Create Jira issue", source: "Jira", state: "running" },
        ],
      },
      width: 420,
    },
    { name: "More than fit", description: "Thirteen steps: the newest are drawn, the rest counted.", props: { steps: run(13) }, width: 420 },
  ],
  edgeCases: [
    {
      title: "A long label",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label truncates to one line; the source keeps its place after it.",
      example: { name: "Long label", props: { steps: [{ key: "c1", label: "Summarise every thread in #platform-eng since Monday's incident review", source: "Channels & messages", state: "running" }] }, width: 360 },
    },
    {
      title: "No source",
      platforms: ["web", "desktop", "mobile"],
      handling: "A tool with no source worth naming (an agent's own) has none; the row ends at the label. Nothing says \"via\" with nothing after it.",
    },
    {
      title: "No steps yet",
      platforms: ["web", "desktop", "mobile"],
      handling: "Draws nothing. While an agent is only thinking, the thinking indicator stands alone.",
    },
  ],
  related: ["thinking-indicator", "question-panel"],
  flows: [
    {
      id: "steps-arrive",
      title: "Steps arrive while an agent works",
      description: "Each tool call joins the list as it starts and settles when it finishes.",
      platforms: ["web", "desktop", "mobile"],
      width: 420,
      steps: [
        {
          kind: "data",
          title: "A tool call starts",
          detail: "The SDK's tool part moves to input-available; the app maps it to a running step.",
          code: "state: 'running'",
          lane: "system",
        },
        { kind: "motion", title: "Its row comes in", enter: "rise" },
        { kind: "data", title: "It finishes", code: "state: 'done'", lane: "system" },
        { kind: "result", title: "The dot becomes a tick, the label steps back" },
        { kind: "data", title: "Past the cap", detail: "The oldest rows are counted instead.", code: "+N earlier" },
      ],
      replay: [
        { step: 0, props: { steps: working.slice(0, 2) }, hold: 1000 },
        { step: 1, props: { steps: working }, hold: 1400 },
        { step: 3, props: { steps: working.map((s) => ({ ...s, state: "done" })) }, hold: 1400 },
        { step: 4, props: { steps: run(8) }, hold: 1400 },
      ],
    },
  ],
};

export default docs;
